import React, { useState, useEffect } from 'react';
import { findFormulaById } from '../engine/formulaLibrary';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { CalculationResultView } from './CalculationResultView';
import { Sliders, RefreshCw, Bookmark, Check, Sparkles } from 'lucide-react';

interface FormulaWorkspaceProps {
  formulaId: string;
}

export const FormulaWorkspace: React.FC<FormulaWorkspaceProps> = ({ formulaId }) => {
  const formula = findFormulaById(formulaId);
  const { setActiveResult, addToHistory } = useCalculatorStore();

  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (formula) {
      const initial: Record<string, any> = {};
      formula.inputs.forEach((i) => {
        initial[i.id] = i.defaultValue;
      });
      setInputValues(initial);
      runCalculation(initial);
    }
  }, [formulaId]);

  if (!formula) {
    return (
      <div className="p-8 text-center text-slate-400">
        Formula not found.
      </div>
    );
  }

  const runCalculation = (vals: Record<string, any>) => {
    try {
      const res = formula.calculate(vals);
      setActiveResult(res);
      addToHistory({
        formulaId: formula.id,
        formulaName: formula.name,
        category: formula.category,
        inputs: vals,
        result: res
      });
    } catch (e) {
      console.error('Workspace Calculation Error:', e);
    }
  };

  const handleInputChange = (id: string, val: any) => {
    const updated = { ...inputValues, [id]: val };
    setInputValues(updated);
    runCalculation(updated);
  };

  const handleReset = () => {
    const initial: Record<string, any> = {};
    formula.inputs.forEach((i) => {
      initial[i.id] = i.defaultValue;
    });
    setInputValues(initial);
    runCalculation(initial);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Workspace Card Header */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 text-xs font-semibold border border-blue-800">
                  {formula.subCategory}
                </span>
                <span className="text-xs text-slate-400 capitalize">{formula.category}</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">{formula.name}</h2>
              <p className="text-xs text-slate-400 mt-1">{formula.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition text-xs flex items-center gap-1.5 border border-slate-800"
                title="Reset to Defaults"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {formula.inputs.map((input) => (
              <div key={input.id} className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor={input.id} className="text-slate-200">{input.label}</label>
                  {input.unit && <span className="text-sky-400 font-mono">{input.unit}</span>}
                </div>

                {input.type === 'number' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        id={input.id}
                        type="number"
                        step={input.step || 1}
                        min={input.min}
                        max={input.max}
                        value={inputValues[input.id] ?? 0}
                        onChange={(e) => handleInputChange(input.id, e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="0"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-blue-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none font-mono"
                      />
                    </div>
                    {input.min !== undefined && input.max !== undefined && input.max > 0 && (
                      <input
                        type="range"
                        min={input.min}
                        max={input.max}
                        step={input.step || 1}
                        value={Number(inputValues[input.id]) || 0}
                        onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || 0)}
                        className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    )}
                  </div>
                )}

                {input.type === 'select' && (
                  <select
                    id={input.id}
                    value={inputValues[input.id] ?? input.defaultValue}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    {input.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {input.type === 'text' && (
                  <input
                    id={input.id}
                    type="text"
                    value={inputValues[input.id] ?? input.defaultValue}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none font-mono"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Calculation Result */}
        <CalculationResultView />

      </div>
    </div>
  );
};
