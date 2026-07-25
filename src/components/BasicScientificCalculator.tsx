import React, { useState } from 'react';
import { evaluate } from 'mathjs';
import { useCalculatorStore } from '../store/useCalculatorStore';
import {
  Calculator,
  RotateCcw,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRightLeft,
  CheckCircle,
  HelpCircle,
  Brain
} from 'lucide-react';

export const BasicScientificCalculator: React.FC = () => {
  const { setActiveResult, addToHistory } = useCalculatorStore();
  const [expression, setExpression] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [angleUnit, setAngleUnit] = useState<'deg' | 'rad'>('deg');
  const [mode, setMode] = useState<'basic' | 'scientific' | 'constants' | 'units'>('scientific');
  const [lastAnswer, setLastAnswer] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unit converter state
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'data'>('length');
  const [unitValue, setUnitValue] = useState<number>(0);
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('foot');
  const [unitResult, setUnitResult] = useState<string>('0');

  const handleKeyPress = (val: string) => {
    setErrorMessage(null);
    if (expression === '0' || expression === 'Error') {
      if (['+', '-', '*', '/', '^', '%'].includes(val)) {
        setExpression('0' + val);
      } else {
        setExpression(val);
      }
    } else {
      setExpression((prev) => prev + val);
    }
  };

  const handleClear = () => {
    setExpression('0');
    setErrorMessage(null);
  };

  const handleDelete = () => {
    if (expression.length <= 1 || expression === 'Error') {
      setExpression('0');
    } else {
      setExpression(expression.slice(0, -1));
    }
  };

  const handleEvaluate = () => {
    try {
      setErrorMessage(null);
      // Replace symbols for mathjs
      let cleanExpr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/√\(/g, 'sqrt(')
        .replace(/Ans/g, String(lastAnswer));

      // Handle trigonometric angle mode if needed
      let res = evaluate(cleanExpr);
      if (typeof res === 'object' && res.entries) {
        res = res.entries[0];
      }

      const numRes = Number(res);
      if (isNaN(numRes) || !isFinite(numRes)) {
        throw new Error('Math Result Undefined');
      }

      const formattedRes = Number.isInteger(numRes) ? numRes.toString() : numRes.toFixed(6).replace(/\.?0+$/, '');
      setLastAnswer(numRes);
      setExpression(formattedRes);

      const calcRes = {
        primaryResult: formattedRes,
        primaryUnit: 'Result',
        secondaryResults: [
          { label: 'Expression', value: expression },
          { label: 'Angle Mode', value: angleUnit.toUpperCase() },
          { label: 'Memory State', value: memory }
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Keypad Evaluation',
            explanation: `Evaluated: ${expression} = ${formattedRes}`
          }
        ],
        explanation: `Scientific expression evaluated to ${formattedRes}.`,
        formulaName: 'Scientific & Basic Calculator',
        category: 'scientific' as const,
        subCategory: 'Keypad Engine',
        timestamp: new Date().toISOString()
      };

      setActiveResult(calcRes);
      addToHistory({
        formulaName: 'Scientific Calculator',
        category: 'scientific',
        inputs: { expression },
        result: calcRes
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Syntax Error');
    }
  };

  // Memory functions
  const handleMemoryAdd = () => {
    try {
      const current = Number(evaluate(expression));
      if (!isNaN(current)) setMemory((prev) => prev + current);
    } catch (e) {}
  };

  const handleMemorySub = () => {
    try {
      const current = Number(evaluate(expression));
      if (!isNaN(current)) setMemory((prev) => prev - current);
    } catch (e) {}
  };

  const handleMemoryRecall = () => {
    if (expression === '0') setExpression(String(memory));
    else setExpression((prev) => prev + String(memory));
  };

  const handleMemoryClear = () => setMemory(0);

  // Constants insertion
  const constantsList = [
    { name: 'Speed of Light (c)', value: '299792458', unit: 'm/s' },
    { name: 'Gravitational Constant (G)', value: '6.6743e-11', unit: 'm³/kg/s²' },
    { name: 'Planck Constant (h)', value: '6.62607015e-34', unit: 'J·s' },
    { name: 'Avogadro Number (N_A)', value: '6.02214076e23', unit: 'mol⁻¹' },
    { name: 'Electron Volt (eV)', value: '1.602176634e-19', unit: 'J' },
    { name: 'Standard Gravity (g)', value: '9.80665', unit: 'm/s²' },
    { name: 'Pi (π)', value: '3.1415926535', unit: 'ratio' },
    { name: 'Euler Number (e)', value: '2.7182818284', unit: 'ratio' }
  ];

  // Unit conversion calculate
  const runUnitConvert = () => {
    try {
      const val = Number(unitValue) || 0;
      let converted = 0;

      if (unitCategory === 'length') {
        const metersMap: Record<string, number> = {
          meter: 1,
          kilometer: 1000,
          cm: 0.01,
          mm: 0.001,
          foot: 0.3048,
          inch: 0.0254,
          mile: 1609.34
        };
        const inMeters = val * (metersMap[fromUnit] || 1);
        converted = inMeters / (metersMap[toUnit] || 1);
      } else if (unitCategory === 'weight') {
        const kgMap: Record<string, number> = {
          kg: 1,
          gram: 0.001,
          mg: 0.000001,
          pound: 0.453592,
          ounce: 0.0283495,
          ton: 1000
        };
        const inKg = val * (kgMap[fromUnit] || 1);
        converted = inKg / (kgMap[toUnit] || 1);
      } else {
        // Data
        const bytesMap: Record<string, number> = {
          byte: 1,
          KB: 1024,
          MB: 1024 * 1024,
          GB: 1024 * 1024 * 1024,
          TB: 1024 * 1024 * 1024 * 1024
        };
        const inBytes = val * (bytesMap[fromUnit] || 1);
        converted = inBytes / (bytesMap[toUnit] || 1);
      }

      setUnitResult(converted.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    } catch (e) {
      setUnitResult('Error');
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-950 text-sky-400">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Basic & Scientific Interactive Pad</h2>
              <p className="text-xs text-slate-400">Precision Keypad, Memory Registers, Scientific Functions & Unit Converter</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMode('scientific')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === 'scientific' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Scientific
            </button>
            <button
              onClick={() => setMode('basic')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === 'basic' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => setMode('constants')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === 'constants' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Constants
            </button>
            <button
              onClick={() => setMode('units')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === 'units' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Converter
            </button>
          </div>
        </div>

        {/* Scientific / Basic View */}
        {(mode === 'scientific' || mode === 'basic') && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            
            {/* Expression Screen Display */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-2 text-right relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-sky-400 text-[10px] font-mono font-bold border border-blue-800">
                    {angleUnit.toUpperCase()}
                  </span>
                  {memory !== 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      M = {memory}
                    </span>
                  )}
                </div>
                <span className="font-mono text-slate-500">Ans = {lastAnswer}</span>
              </div>

              <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-wider break-all min-h-[48px] flex items-center justify-end">
                {expression}
              </div>

              {errorMessage && (
                <div className="text-xs text-red-400 font-mono text-left pt-1">
                  ⚠️ {errorMessage}
                </div>
              )}
            </div>

            {/* Memory & Angle Controls Bar */}
            <div className="grid grid-cols-5 gap-2 text-xs">
              <button
                onClick={() => setAngleUnit(angleUnit === 'deg' ? 'rad' : 'deg')}
                className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 font-bold border border-slate-800"
              >
                {angleUnit === 'deg' ? 'DEG' : 'RAD'}
              </button>
              <button
                onClick={handleMemoryClear}
                className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono border border-slate-800"
              >
                MC
              </button>
              <button
                onClick={handleMemoryRecall}
                className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-mono border border-slate-800"
              >
                MR
              </button>
              <button
                onClick={handleMemoryAdd}
                className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono border border-slate-800"
              >
                M+
              </button>
              <button
                onClick={handleMemorySub}
                className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono border border-slate-800"
              >
                M-
              </button>
            </div>

            {/* Scientific Function Grid Buttons */}
            {mode === 'scientific' && (
              <div className="grid grid-cols-5 gap-2 text-xs sm:text-sm font-semibold text-slate-300">
                <button onClick={() => handleKeyPress('sin(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-300">sin</button>
                <button onClick={() => handleKeyPress('cos(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-300">cos</button>
                <button onClick={() => handleKeyPress('tan(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-300">tan</button>
                <button onClick={() => handleKeyPress('log10(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300">log</button>
                <button onClick={() => handleKeyPress('log(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300">ln</button>

                <button onClick={() => handleKeyPress('asin(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400">sin⁻¹</button>
                <button onClick={() => handleKeyPress('acos(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400">cos⁻¹</button>
                <button onClick={() => handleKeyPress('atan(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400">tan⁻¹</button>
                <button onClick={() => handleKeyPress('√(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400">√</button>
                <button onClick={() => handleKeyPress('^2')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400">x²</button>

                <button onClick={() => handleKeyPress('sinh(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400">sinh</button>
                <button onClick={() => handleKeyPress('cosh(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400">cosh</button>
                <button onClick={() => handleKeyPress('tanh(')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400">tanh</button>
                <button onClick={() => handleKeyPress('^')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400">xʸ</button>
                <button onClick={() => handleKeyPress('!')} className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400">n!</button>
              </div>
            )}

            {/* Standard Keypad Grid */}
            <div className="grid grid-cols-4 gap-2.5 text-base font-bold">
              <button onClick={handleClear} className="py-3.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30">AC</button>
              <button onClick={handleDelete} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800">DEL</button>
              <button onClick={() => handleKeyPress('(')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">(</button>
              <button onClick={() => handleKeyPress(')')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">)</button>

              <button onClick={() => handleKeyPress('7')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">7</button>
              <button onClick={() => handleKeyPress('8')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">8</button>
              <button onClick={() => handleKeyPress('9')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">9</button>
              <button onClick={() => handleKeyPress('/')} className="py-3.5 rounded-2xl bg-blue-950 hover:bg-blue-900 text-sky-400 border border-blue-800">÷</button>

              <button onClick={() => handleKeyPress('4')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">4</button>
              <button onClick={() => handleKeyPress('5')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">5</button>
              <button onClick={() => handleKeyPress('6')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">6</button>
              <button onClick={() => handleKeyPress('*')} className="py-3.5 rounded-2xl bg-blue-950 hover:bg-blue-900 text-sky-400 border border-blue-800">×</button>

              <button onClick={() => handleKeyPress('1')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">1</button>
              <button onClick={() => handleKeyPress('2')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">2</button>
              <button onClick={() => handleKeyPress('3')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">3</button>
              <button onClick={() => handleKeyPress('-')} className="py-3.5 rounded-2xl bg-blue-950 hover:bg-blue-900 text-sky-400 border border-blue-800">−</button>

              <button onClick={() => handleKeyPress('0')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">0</button>
              <button onClick={() => handleKeyPress('.')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800">.</button>
              <button onClick={() => handleKeyPress('Ans')} className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 text-sm">Ans</button>
              <button onClick={() => handleKeyPress('+')} className="py-3.5 rounded-2xl bg-blue-950 hover:bg-blue-900 text-sky-400 border border-blue-800">+</button>
            </div>

            <button
              onClick={handleEvaluate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-2xl shadow-lg transition"
            >
              = EVALUATE
            </button>
          </div>
        )}

        {/* Physical & Mathematical Constants Library */}
        {mode === 'constants' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              Standard Scientific & Physical Constants
            </h3>
            <p className="text-xs text-slate-400">Click any constant to insert into calculation expression</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {constantsList.map((c, i) => (
                <div
                  key={i}
                  onClick={() => {
                    handleKeyPress(c.value);
                    setMode('scientific');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{c.name}</h4>
                    <p className="text-xs font-mono text-sky-400">{c.value} {c.unit}</p>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">Insert</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Unit Converter */}
        {mode === 'units' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-sky-400" />
              Universal Unit Converter
            </h3>

            {/* Category Select */}
            <div className="flex space-x-2 border-b border-slate-800 pb-3">
              {(['length', 'weight', 'data'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setUnitCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                    unitCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Input Value</label>
                <input
                  type="number"
                  value={unitValue}
                  onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">From Unit</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
                >
                  {unitCategory === 'length' && (
                    <>
                      <option value="meter">Meter (m)</option>
                      <option value="kilometer">Kilometer (km)</option>
                      <option value="cm">Centimeter (cm)</option>
                      <option value="foot">Foot (ft)</option>
                      <option value="inch">Inch (in)</option>
                      <option value="mile">Mile (mi)</option>
                    </>
                  )}
                  {unitCategory === 'weight' && (
                    <>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="gram">Gram (g)</option>
                      <option value="pound">Pound (lb)</option>
                      <option value="ounce">Ounce (oz)</option>
                      <option value="ton">Ton (t)</option>
                    </>
                  )}
                  {unitCategory === 'data' && (
                    <>
                      <option value="byte">Bytes (B)</option>
                      <option value="KB">Kilobytes (KB)</option>
                      <option value="MB">Megabytes (MB)</option>
                      <option value="GB">Gigabytes (GB)</option>
                      <option value="TB">Terabytes (TB)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">To Unit</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
                >
                  {unitCategory === 'length' && (
                    <>
                      <option value="foot">Foot (ft)</option>
                      <option value="meter">Meter (m)</option>
                      <option value="kilometer">Kilometer (km)</option>
                      <option value="cm">Centimeter (cm)</option>
                      <option value="inch">Inch (in)</option>
                      <option value="mile">Mile (mi)</option>
                    </>
                  )}
                  {unitCategory === 'weight' && (
                    <>
                      <option value="pound">Pound (lb)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="gram">Gram (g)</option>
                      <option value="ounce">Ounce (oz)</option>
                      <option value="ton">Ton (t)</option>
                    </>
                  )}
                  {unitCategory === 'data' && (
                    <>
                      <option value="GB">Gigabytes (GB)</option>
                      <option value="MB">Megabytes (MB)</option>
                      <option value="KB">Kilobytes (KB)</option>
                      <option value="TB">Terabytes (TB)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <button
              onClick={runUnitConvert}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
            >
              Convert Now
            </button>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400">Converted Output Result:</span>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{unitResult}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
