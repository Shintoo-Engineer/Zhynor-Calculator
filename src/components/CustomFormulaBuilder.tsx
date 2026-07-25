import React, { useState } from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { evaluate } from 'mathjs';
import { FileCode, Plus, Trash2, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export const CustomFormulaBuilder: React.FC = () => {
  const { customFormulas, addCustomFormula, removeCustomFormula, setActiveResult, addToHistory } = useCalculatorStore();

  const [formulaName, setFormulaName] = useState('');
  const [expression, setExpression] = useState('a * b + c / 100');
  const [description, setDescription] = useState('');
  const [variables, setVariables] = useState<
    { name: string; label: string; defaultValue: number; unit?: string }[]
  >([
    { name: 'a', label: 'Variable A', defaultValue: 0, unit: 'units' },
    { name: 'b', label: 'Variable B', defaultValue: 0, unit: 'units' },
    { name: 'c', label: 'Variable C', defaultValue: 0, unit: 'units' }
  ]);

  const [evalTestInputs, setEvalTestInputs] = useState<Record<string, number>>({
    a: 0,
    b: 0,
    c: 0
  });

  const [testResult, setTestResult] = useState<number | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const handleTestEvaluate = () => {
    try {
      setEvalError(null);
      const res = evaluate(expression, evalTestInputs);
      setTestResult(Number(res));
    } catch (err: any) {
      setEvalError(err?.message || 'Invalid math expression');
      setTestResult(null);
    }
  };

  const handleAddVariable = () => {
    const nextChar = String.fromCharCode(97 + variables.length); // a, b, c, d...
    setVariables([...variables, { name: nextChar, label: `Variable ${nextChar.toUpperCase()}`, defaultValue: 1 }]);
    setEvalTestInputs({ ...evalTestInputs, [nextChar]: 1 });
  };

  const handleRemoveVariable = (index: number) => {
    const varName = variables[index].name;
    const updated = variables.filter((_, i) => i !== index);
    setVariables(updated);
    const updatedInputs = { ...evalTestInputs };
    delete updatedInputs[varName];
    setEvalTestInputs(updatedInputs);
  };

  const handleSaveFormula = () => {
    if (!formulaName.trim()) {
      alert('Please enter a formula name');
      return;
    }
    addCustomFormula({
      name: formulaName,
      expression,
      variables,
      category: 'Custom',
      description: description || `Custom Formula: ${expression}`
    });
    setFormulaName('');
    alert('Custom Formula saved successfully!');
  };

  const handleRunSavedFormula = (custom: any) => {
    try {
      const inputs: Record<string, number> = {};
      custom.variables.forEach((v: any) => {
        inputs[v.name] = v.defaultValue;
      });

      const evaluatedVal = evaluate(custom.expression, inputs);

      const result = {
        primaryResult: evaluatedVal,
        primaryUnit: 'Custom Output',
        secondaryResults: custom.variables.map((v: any) => ({
          label: v.label || v.name,
          value: inputs[v.name],
          unit: v.unit
        })),
        steps: [
          {
            stepNumber: 1,
            title: 'Expression Evaluation',
            explanation: `Expression: ${custom.expression} evaluated with inputs: ${JSON.stringify(inputs)}`,
            formulaUsed: custom.expression
          }
        ],
        explanation: `Custom formula '${custom.name}' evaluated to ${evaluatedVal}.`,
        formulaName: custom.name,
        category: 'math' as const,
        subCategory: 'Custom Engine',
        timestamp: new Date().toISOString()
      };

      setActiveResult(result);
      addToHistory({
        formulaName: custom.name,
        category: 'math' as const,
        inputs,
        result
      });
    } catch (e: any) {
      alert(`Error running formula: ${e.message}`);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Custom Builder Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <FileCode className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">Interactive Custom Formula Builder</h2>
          </div>

          {/* Formula Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Formula Name</label>
              <input
                type="text"
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
                placeholder="e.g. Custom Solar ROI Formula"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Mathematical Expression (mathjs syntax)</label>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g. a * b + c / 100"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          {/* Variables Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Variables & Inputs</span>
              <button
                type="button"
                onClick={handleAddVariable}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Variable
              </button>
            </div>

            <div className="space-y-2">
              {variables.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => {
                      const updated = [...variables];
                      updated[idx].name = e.target.value;
                      setVariables(updated);
                    }}
                    placeholder="Var Name"
                    className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    value={v.label}
                    onChange={(e) => {
                      const updated = [...variables];
                      updated[idx].label = e.target.value;
                      setVariables(updated);
                    }}
                    placeholder="Label"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  />
                  <input
                    type="number"
                    value={evalTestInputs[v.name] ?? v.defaultValue}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value) || 0;
                      setEvalTestInputs({ ...evalTestInputs, [v.name]: num });
                    }}
                    placeholder="Test Val"
                    className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => handleRemoveVariable(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Test & Save Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={handleTestEvaluate}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <Play className="w-3.5 h-3.5 text-sky-400" />
              Test Expression
            </button>

            <button
              onClick={handleSaveFormula}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
            >
              Save Custom Formula
            </button>
          </div>

          {testResult !== null && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tested Output Result: <strong>{testResult}</strong></span>
            </div>
          )}

          {evalError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Error: {evalError}</span>
            </div>
          )}
        </div>

        {/* Saved Custom Formulas List */}
        {customFormulas.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Your Saved Custom Formulas ({customFormulas.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customFormulas.map((cf) => (
                <div key={cf.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{cf.name}</h4>
                    <p className="text-xs font-mono text-sky-400">{cf.expression}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunSavedFormula(cf)}
                      className="p-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-sky-400 text-xs font-semibold border border-blue-800"
                    >
                      Run
                    </button>
                    <button
                      onClick={() => removeCustomFormula(cf.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
