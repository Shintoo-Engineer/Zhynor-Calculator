import React from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { BarChart3, Zap, ShieldCheck, Award, Layers, PieChart } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { history } = useCalculatorStore();

  const totalCalculations = history.length;
  const bookmarkedCount = history.filter((h) => h.isBookmarked).length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  history.forEach((h) => {
    categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
  });

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Title */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-950 text-sky-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Zhynor Calculator Analytics & Metrics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time usage statistics and 0-cost architecture platform overview
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Calculations</span>
            <div className="text-3xl font-black text-white">{totalCalculations}</div>
            <p className="text-[11px] text-sky-400">Logged in audit trail</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-medium">Saved Bookmarks</span>
            <div className="text-3xl font-black text-amber-400">{bookmarkedCount}</div>
            <p className="text-[11px] text-slate-500">Pinned for quick reuse</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-medium">Lifetime Cost</span>
            <div className="text-3xl font-black text-sky-400">₹0 / $0</div>
            <p className="text-[11px] text-sky-300">100% Free & Unlimited</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-medium">Formula Library</span>
            <div className="text-3xl font-black text-blue-400">10,000+</div>
            <p className="text-[11px] text-slate-400">Across 15+ Domains</p>
          </div>
        </div>

        {/* Feature Guarantees Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-400" />
            Core Architectural Principles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-sky-400 block">0-Cost Architecture</span>
              <p className="text-slate-400">Built to run offline via client-side rule engines and lightweight server proxies, avoiding subscription paywalls.</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-sky-300 block">Privacy First</span>
              <p className="text-slate-400">Your calculations are stored strictly inside browser local memory and indexed database cache.</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400 block">Works Offline</span>
              <p className="text-slate-400">All core formulas, conversions, and math equations function without internet connectivity.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
