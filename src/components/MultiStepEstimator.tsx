import React, { useState } from 'react';
import { Layers, Building2, Hammer, Paintbrush, Zap, Droplets, DollarSign, Download, FileText } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';

export const MultiStepEstimator: React.FC = () => {
  const [plotAreaSqFt, setPlotAreaSqFt] = useState<number | ''>(0);
  const [floors, setFloors] = useState<number>(0);
  const [quality, setQuality] = useState<'economy' | 'standard' | 'premium' | 'custom'>('standard');
  const [ratePerSqFt, setRatePerSqFt] = useState<number | ''>(1800);

  // Quality multiplier base map
  const baseRateMap = { economy: 1400, standard: 1800, premium: 2500, custom: 2000 };
  const currentRate = Number(ratePerSqFt) || 0;

  const plotNum = Number(plotAreaSqFt) || 0;
  const totalBuiltupArea = plotNum * (floors || 0);
  const totalCost = totalBuiltupArea * currentRate;

  // Material breakdowns (Industry standards for India/Asia construction)
  const cementBags = Math.round(totalBuiltupArea * 0.4); // ~0.4 bags per sq ft
  const steelKg = Math.round(totalBuiltupArea * 3.5); // ~3.5 kg steel per sq ft
  const bricksCount = Math.round(totalBuiltupArea * 18); // ~18 bricks per sq ft
  const paintLitres = Math.round(totalBuiltupArea * 0.15); // ~0.15 L paint per sq ft

  // Cost phases split
  const structureCost = Math.round(totalCost * 0.50); // 50% Foundation, RCC, Bricks
  const finishingCost = Math.round(totalCost * 0.25); // 25% Tiles, Flooring, Paint
  const MEPCost = Math.round(totalCost * 0.15); // 15% Plumbing & Electrical
  const laborContractCost = Math.round(totalCost * 0.10); // 10% Labor & Supervision

  const pieData = [
    { name: 'Structure & RCC (50%)', value: structureCost },
    { name: 'Finishing & Tiles (25%)', value: finishingCost },
    { name: 'Plumbing & Electrical (15%)', value: MEPCost },
    { name: 'Labor & Management (10%)', value: laborContractCost }
  ];

  const COLORS = ['#2563eb', '#38bdf8', '#0284c7', '#60a5fa'];

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Zhynor Calculator - House Construction Multi-Step Estimate', 14, 20);
    doc.setFontSize(10);
    doc.text('Developed by Zhynor Technologies • 100% Free Lifetime Platform', 14, 26);
    doc.line(14, 30, 196, 30);

    doc.setFontSize(12);
    doc.text(`Built-up Area: ${totalBuiltupArea.toLocaleString()} sq ft (${floors} Floor/s)`, 14, 40);
    doc.text(`Quality Tier: ${quality.toUpperCase()} @ ₹${currentRate}/sq ft`, 14, 48);
    doc.text(`Estimated Total Budget: ₹${totalCost.toLocaleString('en-IN')}`, 14, 56);

    doc.setFontSize(14);
    doc.text('Material Quantity Breakdown:', 14, 70);
    doc.setFontSize(11);
    doc.text(`• Cement Required: ~${cementBags.toLocaleString()} Bags (50kg each)`, 18, 80);
    doc.text(`• Steel Rebar: ~${steelKg.toLocaleString()} kg (Fe500 grade)`, 18, 88);
    doc.text(`• Red Bricks / Blocks: ~${bricksCount.toLocaleString()} Units`, 18, 96);
    doc.text(`• Wall Paint: ~${paintLitres.toLocaleString()} Litres`, 18, 104);

    doc.setFontSize(14);
    doc.text('Phase Cost Breakdown:', 14, 120);
    doc.setFontSize(11);
    doc.text(`• Structure, RCC & Foundation (50%): ₹${structureCost.toLocaleString('en-IN')}`, 18, 130);
    doc.text(`• Finishing, Flooring & Doors (25%): ₹${finishingCost.toLocaleString('en-IN')}`, 18, 138);
    doc.text(`• Electrical & Plumbing MEP (15%): ₹${MEPCost.toLocaleString('en-IN')}`, 18, 146);
    doc.text(`• Labor & Contractor Fees (10%): ₹${laborContractCost.toLocaleString('en-IN')}`, 18, 154);

    doc.save(`Zhynor_House_Building_Estimate_${totalBuiltupArea}sqft.pdf`);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-950 text-sky-400">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Multi-Step House Construction Estimator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated multi-phase breakdown for cement, steel, bricks, labor, plumbing, and finishings
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs transition"
          >
            <FileText className="w-4 h-4" />
            <span>Download Multi-Step PDF Report</span>
          </button>
        </div>

        {/* Inputs Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 border border-slate-800 p-6 rounded-2xl">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Plot Area (sq ft)</label>
            <input
              type="number"
              value={plotAreaSqFt}
              onChange={(e) => setPlotAreaSqFt(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Number of Floors</label>
            <select
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
            >
              <option value={0}>0 Floors / Unselected</option>
              <option value={1}>Ground Floor Only (G)</option>
              <option value={2}>Ground + 1 Floor (G+1)</option>
              <option value={3}>Ground + 2 Floors (G+2)</option>
              <option value={4}>Ground + 3 Floors (G+3)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Quality Tier</label>
            <select
              value={quality}
              onChange={(e: any) => {
                const val = e.target.value as 'economy' | 'standard' | 'premium' | 'custom';
                setQuality(val);
                if (val !== 'custom') {
                  setRatePerSqFt(baseRateMap[val]);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
            >
              <option value="economy">Economy (₹1,400/sq ft)</option>
              <option value="standard">Standard (₹1,800/sq ft)</option>
              <option value="premium">Premium (₹2,500/sq ft)</option>
              <option value="custom">Custom Rate Value</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Rate (₹ / sq ft)</label>
            <input
              type="number"
              value={ratePerSqFt}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setRatePerSqFt(val);
                setQuality('custom');
              }}
              placeholder="e.g. 1800"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600 font-mono"
            />
          </div>
        </div>

        {/* Hero Estimate Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Summary Box */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
            <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
              Total Estimated Project Budget
            </span>
            <div className="text-4xl font-black text-white">
              ₹{totalCost.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400">
              Total Built-up Area: <span className="text-sky-400 font-bold">{totalBuiltupArea.toLocaleString()} sq ft</span> @ ₹{currentRate}/sq ft
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Cement Bags</span>
                <div className="text-base font-bold text-white mt-1">~{cementBags.toLocaleString()} Bags</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Steel Rebar</span>
                <div className="text-base font-bold text-white mt-1">~{steelKg.toLocaleString()} kg</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Bricks Required</span>
                <div className="text-base font-bold text-white mt-1">~{bricksCount.toLocaleString()} Units</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Wall Paint</span>
                <div className="text-base font-bold text-white mt-1">~{paintLitres.toLocaleString()} Litres</div>
              </div>
            </div>
          </div>

          {/* Phase Split Chart */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <h3 className="text-sm font-bold text-white mb-2">Phase Budget Allocation</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
