import React, { useState, useEffect, useRef } from 'react';
import { evaluate } from 'mathjs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LineChart as ChartIcon, Box, Sliders, RefreshCw, Eye, Maximize2, Layers } from 'lucide-react';

export const Interactive2D3DGrapher: React.FC = () => {
  const [graphMode, setGraphMode] = useState<'2d' | 'polar' | '3d' | 'parametric'>('2d');
  const [functionExpr, setFunctionExpr] = useState('x^2 - 4');
  const [polarExpr, setPolarExpr] = useState('2 * sin(4 * theta)');
  const [paramXExpr, setParamXExpr] = useState('sin(3 * t)');
  const [paramYExpr, setParamYExpr] = useState('cos(2 * t)');
  const [expr3D, setExpr3D] = useState('sin(x) * cos(y)');

  // Range controls
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [stepCount, setStepCount] = useState(100);

  // Analysis results
  const [chartData, setChartData] = useState<any[]>([]);
  const [roots, setRoots] = useState<number[]>([]);
  const [derivativeStr, setDerivativeStr] = useState<string>('');

  // 3D Canvas ref
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationX, setRotationX] = useState(30);
  const [rotationY, setRotationY] = useState(45);

  // Generate 2D Graph Data
  useEffect(() => {
    if (graphMode === '2d') {
      try {
        const data = [];
        const foundRoots: number[] = [];
        const dx = (xMax - xMin) / stepCount;

        let prevY: number | null = null;
        for (let i = 0; i <= stepCount; i++) {
          const x = xMin + i * dx;
          let y = 0;
          try {
            y = evaluate(functionExpr, { x });
            if (typeof y !== 'number' || isNaN(y) || !isFinite(y)) y = 0;
          } catch (e) {
            y = 0;
          }

          data.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });

          // Simple zero crossing root estimation
          if (prevY !== null && Math.sign(prevY) !== Math.sign(y) && prevY !== 0) {
            foundRoots.push(Number(x.toFixed(2)));
          }
          prevY = y;
        }

        setChartData(data);
        setRoots(foundRoots.slice(0, 5));
      } catch (e) {
        console.error('Graph eval error:', e);
      }
    } else if (graphMode === 'polar') {
      try {
        const data = [];
        const thetaStep = (2 * Math.PI) / stepCount;
        for (let i = 0; i <= stepCount; i++) {
          const theta = i * thetaStep;
          let r = 0;
          try {
            r = evaluate(polarExpr, { theta });
          } catch (e) {
            r = 0;
          }
          const x = r * Math.cos(theta);
          const y = r * Math.sin(theta);
          data.push({ theta: Number(theta.toFixed(2)), x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
        }
        setChartData(data);
      } catch (e) {}
    } else if (graphMode === 'parametric') {
      try {
        const data = [];
        const tMin = 0;
        const tMax = 2 * Math.PI;
        const dt = (tMax - tMin) / stepCount;
        for (let i = 0; i <= stepCount; i++) {
          const t = tMin + i * dt;
          let x = 0, y = 0;
          try {
            x = evaluate(paramXExpr, { t });
            y = evaluate(paramYExpr, { t });
          } catch (e) {}
          data.push({ t: Number(t.toFixed(2)), x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
        }
        setChartData(data);
      } catch (e) {}
    }
  }, [graphMode, functionExpr, polarExpr, paramXExpr, paramYExpr, xMin, xMax, stepCount]);

  // 3D Canvas Isometric Wireframe Surface Renderer
  useEffect(() => {
    if (graphMode === '3d' && canvas3DRef.current) {
      const canvas = canvas3DRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const gridN = 25;
      const scale = 14;
      const radX = (rotationX * Math.PI) / 180;
      const radY = (rotationY * Math.PI) / 180;

      // Draw grid mesh
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;

      const project = (x: number, y: number, z: number) => {
        // Simple 3D isometric rotation projection
        const cosX = Math.cos(radX), sinX = Math.sin(radX);
        const cosY = Math.cos(radY), sinY = Math.sin(radY);

        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        return {
          px: width / 2 + x1 * scale,
          py: height / 2 - y2 * scale
        };
      };

      for (let i = 0; i < gridN; i++) {
        for (let j = 0; j < gridN; j++) {
          const gx = -10 + (i / (gridN - 1)) * 20;
          const gy = -10 + (j / (gridN - 1)) * 20;

          let gz = 0;
          try {
            gz = evaluate(expr3D, { x: gx / 3, y: gy / 3 });
            if (typeof gz !== 'number' || isNaN(gz)) gz = 0;
          } catch (e) {
            gz = 0;
          }

          const { px, py } = project(gx, gy, gz * 3);

          // Draw line to neighbor X
          if (i < gridN - 1) {
            const nextGx = -10 + ((i + 1) / (gridN - 1)) * 20;
            let nextGz = 0;
            try { nextGz = evaluate(expr3D, { x: nextGx / 3, y: gy / 3 }); } catch (e) {}
            const p2 = project(nextGx, gy, nextGz * 3);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }

          // Draw line to neighbor Y
          if (j < gridN - 1) {
            const nextGy = -10 + ((j + 1) / (gridN - 1)) * 20;
            let nextGz = 0;
            try { nextGz = evaluate(expr3D, { x: gx / 3, y: nextGy / 3 }); } catch (e) {}
            const p2 = project(gx, nextGy, nextGz * 3);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }
    }
  }, [graphMode, expr3D, rotationX, rotationY]);

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ChartIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Interactive 2D & 3D Graphing Studio</h2>
              <p className="text-xs text-slate-400">Real-Time Function Plotter, Polar, Parametric & 3D Surface Visualizer</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setGraphMode('2d')}
              className={`px-3 py-1.5 rounded-lg transition ${
                graphMode === '2d' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              2D Function
            </button>
            <button
              onClick={() => setGraphMode('polar')}
              className={`px-3 py-1.5 rounded-lg transition ${
                graphMode === 'polar' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Polar Graphs
            </button>
            <button
              onClick={() => setGraphMode('parametric')}
              className={`px-3 py-1.5 rounded-lg transition ${
                graphMode === 'parametric' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Parametric
            </button>
            <button
              onClick={() => setGraphMode('3d')}
              className={`px-3 py-1.5 rounded-lg transition ${
                graphMode === '3d' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              3D Surface
            </button>
          </div>
        </div>

        {/* Expression Input Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          {graphMode === '2d' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400">Function f(x) =</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={functionExpr}
                  onChange={(e) => setFunctionExpr(e.target.value)}
                  placeholder="e.g., x^2 - 4 or sin(x)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-sky-400 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                <span>Presets:</span>
                {['x^2 - 4', 'sin(x) * x', '2*x + 1', 'exp(-x^2)'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFunctionExpr(p)}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-sky-300 font-mono border border-slate-800"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {graphMode === 'polar' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400">Polar Equation r(θ) =</label>
              <input
                type="text"
                value={polarExpr}
                onChange={(e) => setPolarExpr(e.target.value)}
                placeholder="e.g., 2 * sin(4 * theta)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-sky-300 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          {graphMode === 'parametric' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">x(t) =</label>
                <input
                  type="text"
                  value={paramXExpr}
                  onChange={(e) => setParamXExpr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-sky-300 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">y(t) =</label>
                <input
                  type="text"
                  value={paramYExpr}
                  onChange={(e) => setParamYExpr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-sky-300 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {graphMode === '3d' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400">3D Surface z = f(x, y)</label>
              <input
                type="text"
                value={expr3D}
                onChange={(e) => setExpr3D(e.target.value)}
                placeholder="e.g., sin(x) * cos(y) or x^2 - y^2"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-sky-400 font-mono focus:outline-none focus:border-blue-600"
              />

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="text-slate-400">Tilt Pitch (X-Angle): {rotationX}°</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={rotationX}
                    onChange={(e) => setRotationX(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Rotation Yaw (Y-Angle): {rotationY}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotationY}
                    onChange={(e) => setRotationY(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Range Sliders for 2D/Polar */}
          {graphMode !== '3d' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="text-slate-400">Domain X Min ({xMin})</label>
                <input
                  type="number"
                  value={xMin}
                  onChange={(e) => setXMin(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400">Domain X Max ({xMax})</label>
                <input
                  type="number"
                  value={xMax}
                  onChange={(e) => setXMax(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-slate-400">Resolution Steps ({stepCount})</label>
                <input
                  type="range"
                  min="30"
                  max="300"
                  value={stepCount}
                  onChange={(e) => setStepCount(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Display Canvas or Recharts Area */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              Graph Viewport Render
            </span>
            {roots.length > 0 && graphMode === '2d' && (
              <span className="text-emerald-400 font-mono">Estimated Zero Roots: {roots.join(', ')}</span>
            )}
          </div>

          {graphMode !== '3d' ? (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="x" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#38bdf8' }}
                  />
                  <Line type="monotone" dataKey="y" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <canvas
                ref={canvas3DRef}
                width={500}
                height={320}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-inner"
              />
              <p className="text-xs text-slate-400 mt-2">Interactive Wireframe Projection for z = {expr3D}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
