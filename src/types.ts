export type CategoryType =
  | 'basic'
  | 'scientific'
  | 'graphing'
  | '3d'
  | 'algebra'
  | 'calculus'
  | 'geometry'
  | 'statistics'
  | 'probability'
  | 'finance'
  | 'education'
  | 'health'
  | 'engineering'
  | 'cs'
  | 'ai_data'
  | 'cloud'
  | 'construction'
  | 'agriculture'
  | 'datetime'
  | 'business'
  | 'math'
  | 'converter'
  | 'logistics'
  | 'daily';

export interface FormulaInput {
  id: string;
  label: string;
  type: 'number' | 'select' | 'text';
  defaultValue: number | string;
  unit?: string;
  options?: { label: string; value: string | number }[];
  step?: number;
  min?: number;
  max?: number;
  description?: string;
}

export interface CalculationStep {
  stepNumber: number;
  title: string;
  explanation: string;
  formulaUsed?: string;
  subResult?: string | number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface CalculationResult {
  primaryResult: string | number;
  primaryUnit?: string;
  secondaryResults?: { label: string; value: string | number; unit?: string }[];
  steps: CalculationStep[];
  explanation: string;
  chartData?: ChartDataPoint[];
  breakdownTable?: { [key: string]: string | number }[];
  formulaName: string;
  category: CategoryType;
  subCategory: string;
  timestamp: string;
  confidenceAI?: number;
}

export interface FormulaDefinition {
  id: string;
  name: string;
  category: CategoryType;
  subCategory: string;
  description: string;
  tags: string[];
  inputs: FormulaInput[];
  calculate: (inputs: Record<string, any>) => CalculationResult;
}

export interface HistoryItem {
  id: string;
  query?: string;
  formulaId?: string;
  formulaName: string;
  category: CategoryType;
  inputs: Record<string, any>;
  result: CalculationResult;
  timestamp: string;
  isBookmarked?: boolean;
}

export interface CustomFormula {
  id: string;
  name: string;
  expression: string; // e.g. "a * b + c"
  variables: { name: string; label: string; defaultValue: number; unit?: string }[];
  category: string;
  description: string;
  createdAt: string;
}

export interface NaturalLanguageParseResult {
  intentDetected: string;
  category: CategoryType;
  subCategory: string;
  formulaName: string;
  extractedParameters: Record<string, any>;
  result: CalculationResult;
  aiNote?: string;
  isMultiStep?: boolean;
  multiStepBreakdown?: {
    phase: string;
    items: { label: string; costOrQty: string | number; note?: string }[];
  }[];
}
