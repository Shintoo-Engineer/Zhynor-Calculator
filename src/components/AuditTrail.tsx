import React, { useState } from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { History as HistoryIcon, Bookmark, Trash2, Download, Search, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';

export const AuditTrail: React.FC = () => {
  const { history, toggleBookmark, clearHistory, setActiveResult, setActiveTab } = useCalculatorStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesBookmark = !onlyBookmarks || item.isBookmarked;
    const matchesSearch =
      !searchTerm ||
      item.formulaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.query && item.query.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesBookmark && matchesSearch;
  });

  const handleExportCSV = () => {
    const data = filteredHistory.map((item) => ({
      Timestamp: item.timestamp,
      FormulaName: item.formulaName,
      Category: item.category,
      Query: item.query || 'Manual Run',
      PrimaryResult: `${item.result.primaryResult} ${item.result.primaryUnit || ''}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CalculationHistory');
    XLSX.writeFile(workbook, `Zhynor_Calculation_AuditTrail_${Date.now()}.xlsx`);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <HistoryIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Calculation Audit Trail & History</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Private local log of past calculations. Search, bookmark, or export for audit compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredHistory.length === 0}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              className="bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Search & Bookmark Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setOnlyBookmarks(!onlyBookmarks)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              onlyBookmarks
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{onlyBookmarks ? 'Bookmarked Only' : 'Show Bookmarked'}</span>
          </button>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{item.formulaName}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                {item.query && (
                  <p className="text-xs text-slate-400 italic">Prompt: "{item.query}"</p>
                )}
                <div className="text-sm font-black text-emerald-400">
                  Result: {item.result.primaryResult} {item.result.primaryUnit || ''}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveResult(item.result);
                    setActiveTab('omnibox');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold"
                >
                  View Details
                </button>

                <button
                  onClick={() => toggleBookmark(item.id)}
                  className={`p-2 rounded-lg border transition ${
                    item.isBookmarked
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          ))}

          {filteredHistory.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-950 border border-slate-800 rounded-2xl">
              <HistoryIcon className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">No calculation history found.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
