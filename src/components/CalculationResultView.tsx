import React from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import {
  FileText,
  Download,
  Share2,
  Copy,
  Printer,
  Check,
  TrendingUp,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export const CalculationResultView: React.FC = () => {
  const { activeResult } = useCalculatorStore();
  const [copied, setCopied] = React.useState(false);

  if (!activeResult) return null;

  const handleCopy = () => {
    const text = `Zhynor Calculator Result\nFormula: ${activeResult.formulaName}\nResult: ${activeResult.primaryResult} ${activeResult.primaryUnit || ''}\n${activeResult.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Zhynor Calculator - Calculation Report', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Developed by Zhynor Technologies • 100% Free Lifetime Platform`, 14, 26);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 32);

    doc.line(14, 36, 196, 36);

    doc.setFontSize(14);
    doc.text(`Formula: ${activeResult.formulaName}`, 14, 46);

    doc.setFontSize(20);
    doc.text(`Primary Result: ${activeResult.primaryResult} ${activeResult.primaryUnit || ''}`, 14, 58);

    doc.setFontSize(12);
    doc.text('Secondary Breakdown:', 14, 70);

    let y = 78;
    if (activeResult.secondaryResults) {
      activeResult.secondaryResults.forEach((sr) => {
        doc.text(`• ${sr.label}: ${sr.value}`, 18, y);
        y += 8;
      });
    }

    y += 6;
    doc.setFontSize(12);
    doc.text('Step-by-Step Explanation:', 14, y);
    y += 8;

    activeResult.steps.forEach((step) => {
      doc.setFontSize(10);
      doc.text(`Step ${step.stepNumber}: ${step.title}`, 18, y);
      y += 6;
      doc.text(`   ${step.explanation}`, 18, y);
      y += 8;
    });

    doc.save(`Zhynor_${activeResult.formulaName.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const handleDownloadExcel = () => {
    const data = [
      { Parameter: 'Formula Name', Value: activeResult.formulaName },
      { Parameter: 'Primary Result', Value: `${activeResult.primaryResult} ${activeResult.primaryUnit || ''}` },
      { Parameter: 'Category', Value: activeResult.category },
      { Parameter: 'Explanation', Value: activeResult.explanation }
    ];

    if (activeResult.secondaryResults) {
      activeResult.secondaryResults.forEach((sr) => {
        data.push({ Parameter: sr.label, Value: String(sr.value) });
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Calculation');
    XLSX.writeFile(workbook, `Zhynor_${activeResult.formulaName.replace(/\s+/g, '_')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const chartColors = ['#2563eb', '#38bdf8', '#0284c7', '#60a5fa', '#818cf8'];

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Main Result Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-950 text-sky-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-white">{activeResult.formulaName}</h2>
                <span className="text-xs text-slate-400 capitalize">
                  Category: {activeResult.category} • {activeResult.subCategory}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
                title="Copy Result"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
                title="Download PDF"
              >
                <FileText className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={handleDownloadExcel}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
                title="Download Excel"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
                title="Print Report"
              >
                <Printer className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Hero Result Display */}
          <div className="py-6 text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">
              Final Calculated Result
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {activeResult.primaryResult}
            </div>
            {activeResult.primaryUnit && (
              <div className="text-sm font-medium text-slate-400">
                {activeResult.primaryUnit}
              </div>
            )}
          </div>

          {/* Secondary Breakdown Cards */}
          {activeResult.secondaryResults && activeResult.secondaryResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
              {activeResult.secondaryResults.map((sr, idx) => (
                <div key={idx} className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium truncate">{sr.label}</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">{sr.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Explanation */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p>{activeResult.explanation}</p>
          </div>
        </div>

        {/* Visual Chart if ChartData exists */}
        {activeResult.chartData && activeResult.chartData.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Visual Distribution & Component Split</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeResult.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {activeResult.chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Step-by-Step Breakdown */}
        {activeResult.steps && activeResult.steps.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Layers className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Step-by-Step Calculation Proof</h3>
            </div>

            <div className="space-y-3">
              {activeResult.steps.map((step) => (
                <div key={step.stepNumber} className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-sky-400 font-semibold">
                    <span>Step {step.stepNumber}: {step.title}</span>
                    {step.formulaUsed && (
                      <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded text-[11px]">
                        {step.formulaUsed}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 pt-1 font-mono">{step.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
