import { create } from 'zustand';
import { HistoryItem, CustomFormula, CalculationResult, CategoryType } from '../types';

export type ActiveTabType =
  | 'omnibox'
  | 'basic_scientific'
  | 'grapher'
  | 'symbolic'
  | 'categories'
  | 'formula'
  | 'multistep'
  | 'custom'
  | 'history'
  | 'analytics';

interface CalculatorState {
  activeTab: ActiveTabType;
  selectedCategory: CategoryType | 'all';
  activeFormulaId: string | null;
  activeResult: CalculationResult | null;
  history: HistoryItem[];
  customFormulas: CustomFormula[];
  isOffline: boolean;
  isOCRModalOpen: boolean;

  setActiveTab: (tab: ActiveTabType) => void;
  setSelectedCategory: (category: CategoryType | 'all') => void;
  setActiveFormulaId: (formulaId: string | null) => void;
  setActiveResult: (result: CalculationResult | null) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  toggleBookmark: (id: string) => void;
  clearHistory: () => void;
  addCustomFormula: (formula: Omit<CustomFormula, 'id' | 'createdAt'>) => void;
  removeCustomFormula: (id: string) => void;
  setIsOffline: (status: boolean) => void;
  setIsOCRModalOpen: (open: boolean) => void;
}

// Load initial history and custom formulas from LocalStorage
const savedHistory = typeof window !== 'undefined' ? localStorage.getItem('zhynor_history') : null;
const initialHistory: HistoryItem[] = savedHistory ? JSON.parse(savedHistory) : [];

const savedCustom = typeof window !== 'undefined' ? localStorage.getItem('zhynor_custom_formulas') : null;
const initialCustom: CustomFormula[] = savedCustom ? JSON.parse(savedCustom) : [];

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  activeTab: 'omnibox',
  selectedCategory: 'all',
  activeFormulaId: 'fin-emi',
  activeResult: null,
  history: initialHistory,
  customFormulas: initialCustom,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  isOCRModalOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setActiveFormulaId: (formulaId) => set({ activeFormulaId: formulaId }),
  setActiveResult: (result) => set({ activeResult: result }),

  addToHistory: (item) => {
    const newItem: HistoryItem = {
      ...item,
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      isBookmarked: false
    };
    const updated = [newItem, ...get().history].slice(0, 100); // keep last 100
    set({ history: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('zhynor_history', JSON.stringify(updated));
    }
  },

  toggleBookmark: (id) => {
    const updated = get().history.map((h) =>
      h.id === id ? { ...h, isBookmarked: !h.isBookmarked } : h
    );
    set({ history: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('zhynor_history', JSON.stringify(updated));
    }
  },

  clearHistory: () => {
    set({ history: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zhynor_history');
    }
  },

  addCustomFormula: (formula) => {
    const newFormula: CustomFormula = {
      ...formula,
      id: 'custom-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newFormula, ...get().customFormulas];
    set({ customFormulas: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('zhynor_custom_formulas', JSON.stringify(updated));
    }
  },

  removeCustomFormula: (id) => {
    const updated = get().customFormulas.filter((f) => f.id !== id);
    set({ customFormulas: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('zhynor_custom_formulas', JSON.stringify(updated));
    }
  },

  setIsOffline: (status) => set({ isOffline: status }),
  setIsOCRModalOpen: (open) => set({ isOCRModalOpen: open })
}));
