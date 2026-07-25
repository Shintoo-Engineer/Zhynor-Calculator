import React, { useEffect } from 'react';
import { useCalculatorStore } from './store/useCalculatorStore';
import { Header } from './components/Header';
import { AIOmnibox } from './components/AIOmnibox';
import { CalculationResultView } from './components/CalculationResultView';
import { BasicScientificCalculator } from './components/BasicScientificCalculator';
import { Interactive2D3DGrapher } from './components/Interactive2D3DGrapher';
import { SymbolicCalculusAlgebra } from './components/SymbolicCalculusAlgebra';
import { CategoryExplorer } from './components/CategoryExplorer';
import { FormulaWorkspace } from './components/FormulaWorkspace';
import { MultiStepEstimator } from './components/MultiStepEstimator';
import { CustomFormulaBuilder } from './components/CustomFormulaBuilder';
import { AuditTrail } from './components/AuditTrail';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { OCRScannerModal } from './components/OCRScannerModal';
import { findFormulaById } from './engine/formulaLibrary';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    activeFormulaId,
    setActiveFormulaId,
    activeResult,
    setActiveResult,
    setIsOffline
  } = useCalculatorStore();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial formula calculation load
    if (!activeResult && activeFormulaId) {
      const initialFormula = findFormulaById(activeFormulaId);
      if (initialFormula) {
        const defaultInputs: Record<string, any> = {};
        initialFormula.inputs.forEach((i) => {
          defaultInputs[i.id] = i.defaultValue;
        });
        const res = initialFormula.calculate(defaultInputs);
        setActiveResult(res);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSelectFormula = (id: string) => {
    setActiveFormulaId(id);
    setActiveTab('formula');
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Header */}
      <div>
        <Header />

        {/* Tab Content */}
        <main>
          {activeTab === 'omnibox' && (
            <>
              <AIOmnibox />
              {activeResult && <CalculationResultView />}
            </>
          )}

          {activeTab === 'basic_scientific' && <BasicScientificCalculator />}

          {activeTab === 'grapher' && <Interactive2D3DGrapher />}

          {activeTab === 'symbolic' && <SymbolicCalculusAlgebra />}

          {activeTab === 'categories' && (
            <CategoryExplorer onSelectFormula={handleSelectFormula} />
          )}

          {activeTab === 'formula' && activeFormulaId && (
            <FormulaWorkspace formulaId={activeFormulaId} />
          )}

          {activeTab === 'multistep' && <MultiStepEstimator />}

          {activeTab === 'custom' && <CustomFormulaBuilder />}

          {activeTab === 'history' && <AuditTrail />}

          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </main>
      </div>

      {/* Global OCR Scanner Modal */}
      <OCRScannerModal />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-semibold">
          <span>Zhynor Calculator</span>
          <span>•</span>
          <span>One Calculator. Unlimited Calculations.</span>
        </div>
        <p className="flex items-center justify-center gap-1 text-slate-500">
          Developed by <span className="text-slate-300 font-bold">Zhynor Technologies</span> • 100% Free • Lifetime • Unlimited Usage • Privacy First • Works Offline
        </p>
      </footer>

    </div>
  );
}
