import React from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import {
  Calculator,
  Sparkles,
  Grid,
  History as HistoryIcon,
  Layers,
  FileCode,
  BarChart3,
  Camera,
  Wifi,
  WifiOff,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, isOffline, setIsOffline, setIsOCRModalOpen, history } = useCalculatorStore();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top Banner with Zhynor Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Zhynor Calculator
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-blue-950 text-blue-400 border border-blue-800 rounded-full">
                  AI Universal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                One Calculator. Unlimited Calculations. • Developed by Zhynor Technologies
              </p>
            </div>
          </div>

          {/* Badges & Actions */}
          <div className="flex items-center gap-3">
            {/* Guarantee Pills */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
              <span className="flex items-center gap-1 text-sky-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> 100% Free Lifetime
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-blue-300">
                <Zap className="w-3.5 h-3.5 text-sky-400" /> Privacy First
              </span>
            </div>

            {/* OCR Button */}
            <button
              onClick={() => setIsOCRModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 transition"
              title="OCR & Document Scan"
            >
              <Camera className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Scan / OCR</span>
            </button>

            {/* Offline/Online Switcher */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition ${
                isOffline
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-blue-950 border-blue-800 text-blue-300 hover:bg-blue-900/50'
              }`}
              title={isOffline ? 'Offline Mode Active' : 'Online AI Engine Connected'}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  <span className="hidden md:inline">Engine Ready</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/60 pt-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('omnibox')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'omnibox'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Natural Engine
          </button>

          <button
            onClick={() => setActiveTab('basic_scientific')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'basic_scientific'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Basic & Scientific Pad
          </button>

          <button
            onClick={() => setActiveTab('grapher')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'grapher'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            2D & 3D Grapher
          </button>

          <button
            onClick={() => setActiveTab('symbolic')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'symbolic'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            CAS Algebra & Calculus
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'categories' || activeTab === 'formula'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            Calculator Library
          </button>

          <button
            onClick={() => setActiveTab('multistep')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'multistep'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            House & Construction
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'custom'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Custom Builder
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            Audit History ({history.length})
          </button>
        </div>
      </div>
    </header>
  );
};
