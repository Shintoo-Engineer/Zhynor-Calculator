import React, { useState } from 'react';
import { FORMULA_LIBRARY } from '../engine/formulaLibrary';
import { CategoryType, FormulaDefinition } from '../types';
import { useCalculatorStore } from '../store/useCalculatorStore';
import {
  Search,
  Calculator,
  Compass,
  ArrowRight,
  TrendingUp,
  Activity,
  HardHat,
  Cpu,
  GraduationCap,
  Briefcase,
  Layers,
  Sprout,
  Truck,
  Sun
} from 'lucide-react';

interface CategoryExplorerProps {
  onSelectFormula: (formulaId: string) => void;
}

export const CategoryExplorer: React.FC<CategoryExplorerProps> = ({ onSelectFormula }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedCategory, setSelectedCategory } = useCalculatorStore();

  const categories: { id: CategoryType | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Modules (10k+)', icon: Compass },
    { id: 'basic', label: 'Basic Calculator', icon: Calculator },
    { id: 'scientific', label: 'Scientific', icon: Calculator },
    { id: 'graphing', label: 'Graphing 2D/3D', icon: Layers },
    { id: 'algebra', label: 'Algebra & CAS', icon: Briefcase },
    { id: 'calculus', label: 'Calculus', icon: Cpu },
    { id: 'finance', label: 'Finance & Banking', icon: TrendingUp },
    { id: 'health', label: 'Healthcare & Fitness', icon: Activity },
    { id: 'construction', label: 'Civil & Construction', icon: HardHat },
    { id: 'engineering', label: 'Engineering & CS', icon: Cpu },
    { id: 'ai_data', label: 'AI & Data Science', icon: Cpu },
    { id: 'cloud', label: 'Cloud Infrastructure', icon: Layers },
    { id: 'business', label: 'Business & Payroll', icon: Briefcase },
    { id: 'education', label: 'Education & GPA', icon: GraduationCap },
    { id: 'agriculture', label: 'Agriculture & Farm', icon: Sprout },
    { id: 'converter', label: 'Unit Converter', icon: Compass },
    { id: 'logistics', label: 'Logistics & Freight', icon: Truck },
    { id: 'daily', label: 'Daily Life & Budget', icon: Sun }
  ];

  const filteredFormulas = FORMULA_LIBRARY.filter((f) => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              Universal Calculator Taxonomy
            </h2>
            <p className="text-xs text-slate-400">
              Browse formulas across 15+ specialized domains or search by keyword
            </p>
          </div>

          {/* Keyword Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search formula, e.g. EMI, GST, Ohm..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-600 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Formula Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredFormulas.map((formula) => (
            <div
              key={formula.id}
              onClick={() => onSelectFormula(formula.id)}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-5 rounded-2xl cursor-pointer transition group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950 text-sky-400 border border-blue-800">
                    {formula.subCategory}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">{formula.category}</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition">
                  {formula.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {formula.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Open Interactive Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}

          {filteredFormulas.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 space-y-2 bg-slate-950 border border-slate-800 rounded-2xl">
              <Calculator className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">No pre-built formula matched "{searchTerm}".</p>
              <p className="text-xs text-slate-500">
                You can ask the AI Natural Calculator directly on the top omnibox or build a custom formula in the Custom Formula Builder tab!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
