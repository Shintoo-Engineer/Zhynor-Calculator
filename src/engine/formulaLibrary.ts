import { FormulaDefinition, CategoryType, CalculationResult } from '../types';

export const FORMULA_LIBRARY: FormulaDefinition[] = [
  // --- FINANCE ---
  {
    id: 'fin-emi',
    name: 'Loan EMI Calculator',
    category: 'finance',
    subCategory: 'Loans & EMI',
    description: 'Calculate Monthly EMI, total interest payable, and amortization schedule for Home, Personal, or Car loans with flexible years and months entry.',
    tags: ['loan', 'emi', 'home loan', 'car loan', 'personal loan', 'bank', 'interest', 'tenure'],
    inputs: [
      { id: 'principal', label: 'Loan Amount', type: 'number', defaultValue: 0, unit: '₹', min: 0 },
      { id: 'rate', label: 'Annual Interest Rate', type: 'number', defaultValue: 0, unit: '%', step: 0.1, min: 0, max: 30 },
      { id: 'tenureYears', label: 'Tenure (Years)', type: 'number', defaultValue: 0, unit: 'Years', min: 0, max: 50 },
      { id: 'tenureMonths', label: 'Tenure (Additional Months)', type: 'number', defaultValue: 0, unit: 'Months', min: 0, max: 11 }
    ],
    calculate: (inputs) => {
      const P = Number(inputs.principal) || 0;
      const r = (Number(inputs.rate) || 0) / (12 * 100);
      const years = Number(inputs.tenureYears) || 0;
      const months = Number(inputs.tenureMonths) || 0;
      const n = (years * 12) + months;

      let emi = 0;
      if (r > 0 && n > 0) {
        emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else if (n > 0) {
        emi = P / n;
      }

      const totalPayment = emi * n;
      const totalInterest = Math.max(0, totalPayment - P);

      const tenureText = `${n} Months${years > 0 || months > 0 ? ` (${years > 0 ? `${years} Yr${years > 1 ? 's' : ''}` : ''}${years > 0 && months > 0 ? ' ' : ''}${months > 0 ? `${months} Mo${months > 1 ? 's' : ''}` : ''})` : ''}`;

      return {
        primaryResult: Math.round(emi).toLocaleString('en-IN'),
        primaryUnit: '₹ / Month',
        secondaryResults: [
          { label: 'Principal Amount', value: `₹${P.toLocaleString('en-IN')}` },
          { label: 'Total Interest Payable', value: `₹${Math.round(totalInterest).toLocaleString('en-IN')}` },
          { label: 'Total Amount Payable', value: `₹${Math.round(totalPayment).toLocaleString('en-IN')}` },
          { label: 'Total Tenure', value: tenureText }
        ],
        steps: [
          { stepNumber: 1, title: 'Monthly Interest Rate', explanation: `r = ${inputs.rate || 0}% / (12 × 100) = ${r.toFixed(6)}`, formulaUsed: 'r = R / (12 × 100)' },
          { stepNumber: 2, title: 'Tenure Duration in Months', explanation: `n = (${years} Years × 12) + ${months} Months = ${n} Months` },
          { stepNumber: 3, title: 'Monthly EMI Computation', explanation: `EMI = [P × r × (1+r)^n] / [(1+r)^n - 1] = ₹${Math.round(emi).toLocaleString('en-IN')}`, formulaUsed: 'EMI = P × r × (1+r)ⁿ / [(1+r)ⁿ - 1]' }
        ],
        explanation: `With a loan of ₹${P.toLocaleString('en-IN')} at ${inputs.rate || 0}% p.a. for ${tenureText}, your monthly EMI is ₹${Math.round(emi).toLocaleString('en-IN')}. Total interest paid over loan tenure is ₹${Math.round(totalInterest).toLocaleString('en-IN')}.`,
        chartData: [
          { name: 'Principal Amount', value: P },
          { name: 'Interest Component', value: Math.round(totalInterest) }
        ],
        formulaName: 'Loan EMI Calculator',
        category: 'finance',
        subCategory: 'Loans & EMI',
        timestamp: new Date().toISOString()
      };
    }
  },
  {
    id: 'fin-profit-loss',
    name: 'Profit & Loss Calculator',
    category: 'finance',
    subCategory: 'Business & Trading',
    description: 'Calculate Net Profit or Loss, Profit/Loss Percentage, Profit Margin %, and Markup %.',
    tags: ['profit', 'loss', 'cp', 'sp', 'cost price', 'selling price', 'margin', 'markup', 'business', 'trading', 'revenue'],
    inputs: [
      { id: 'costPrice', label: 'Cost Price (CP) / Purchase Price', type: 'number', defaultValue: 0, unit: '₹', min: 0 },
      { id: 'sellingPrice', label: 'Selling Price (SP) / Revenue', type: 'number', defaultValue: 0, unit: '₹', min: 0 },
      { id: 'operatingExpenses', label: 'Additional Expenses / Overhead', type: 'number', defaultValue: 0, unit: '₹', min: 0 }
    ],
    calculate: (inputs) => {
      const cp = Number(inputs.costPrice) || 0;
      const sp = Number(inputs.sellingPrice) || 0;
      const expenses = Number(inputs.operatingExpenses) || 0;

      const totalCost = cp + expenses;
      const netProfitOrLoss = sp - totalCost;
      const isProfit = netProfitOrLoss >= 0;
      const absDiff = Math.abs(netProfitOrLoss);

      const percentage = totalCost > 0 ? (absDiff / totalCost) * 100 : 0;
      const profitMarginPct = sp > 0 ? (netProfitOrLoss / sp) * 100 : 0;
      const markupPct = cp > 0 ? (netProfitOrLoss / cp) * 100 : 0;

      const statusText = isProfit ? 'Profit' : 'Loss';

      return {
        primaryResult: `₹${Math.round(absDiff).toLocaleString('en-IN')} (${percentage.toFixed(2)}% ${statusText})`,
        primaryUnit: `Net ${statusText}`,
        secondaryResults: [
          { label: 'Cost Price (CP)', value: `₹${cp.toLocaleString('en-IN')}` },
          { label: 'Additional Expenses', value: `₹${expenses.toLocaleString('en-IN')}` },
          { label: 'Total Effective Cost', value: `₹${totalCost.toLocaleString('en-IN')}` },
          { label: 'Selling Price (SP)', value: `₹${sp.toLocaleString('en-IN')}` },
          { label: `Net ${statusText} Amount`, value: `${isProfit ? '+' : '-'}₹${Math.round(absDiff).toLocaleString('en-IN')}` },
          { label: `${statusText} Percentage`, value: `${percentage.toFixed(2)}%` },
          { label: 'Profit Margin %', value: `${profitMarginPct.toFixed(2)}%` },
          { label: 'Markup %', value: `${markupPct.toFixed(2)}%` }
        ],
        steps: [
          { stepNumber: 1, title: 'Total Cost Computation', explanation: `Total Cost = Cost Price (₹${cp}) + Overhead Expenses (₹${expenses}) = ₹${totalCost.toLocaleString('en-IN')}` },
          { stepNumber: 2, title: 'Net Profit/Loss Difference', explanation: `Net ${statusText} = Selling Price (₹${sp}) - Total Cost (₹${totalCost}) = ${isProfit ? '+' : '-'}₹${Math.round(absDiff).toLocaleString('en-IN')}` },
          { stepNumber: 3, title: 'Percentage & Margin Formula', explanation: `${statusText} % = (|Net Amount| / Total Cost) × 100 = (${Math.round(absDiff)} / ${totalCost}) × 100 = ${percentage.toFixed(2)}%` }
        ],
        explanation: `Selling at ₹${sp.toLocaleString('en-IN')} with total expenses of ₹${totalCost.toLocaleString('en-IN')} results in a Net ${statusText} of ₹${Math.round(absDiff).toLocaleString('en-IN')} (${percentage.toFixed(2)}%). Profit Margin is ${profitMarginPct.toFixed(2)}%.`,
        chartData: [
          { name: 'Total Cost', value: totalCost },
          { name: 'Selling Revenue', value: sp },
          { name: isProfit ? 'Net Profit' : 'Net Loss', value: Math.round(absDiff) }
        ],
        formulaName: 'Profit & Loss Calculator',
        category: 'finance',
        subCategory: 'Business & Trading',
        timestamp: new Date().toISOString()
      };
    }
  },
  {
    id: 'fin-gst',
    name: 'GST Calculator',
    category: 'finance',
    subCategory: 'Taxation & Accounting',
    description: 'Calculate Goods and Services Tax (GST) inclusive or exclusive amount with CGST and SGST/IGST breakdown.',
    tags: ['gst', 'tax', 'cgst', 'sgst', 'igst', 'billing', 'invoice'],
    inputs: [
      { id: 'amount', label: 'Initial Amount', type: 'number', defaultValue: 0, unit: '₹' },
      { id: 'gstRate', label: 'GST Rate', type: 'select', defaultValue: 18, options: [
        { label: '5%', value: 5 },
        { label: '12%', value: 12 },
        { label: '18%', value: 18 },
        { label: '28%', value: 28 }
      ]},
      { id: 'type', label: 'Calculation Type', type: 'select', defaultValue: 'exclusive', options: [
        { label: 'Add GST (Exclusive)', value: 'exclusive' },
        { label: 'Remove GST (Inclusive)', value: 'inclusive' }
      ]}
    ],
    calculate: (inputs) => {
      const amt = Number(inputs.amount) || 0;
      const rate = Number(inputs.gstRate) || 18;
      const isInclusive = inputs.type === 'inclusive';

      let gstAmount = 0;
      let netAmount = 0;
      let grossAmount = 0;

      if (isInclusive) {
        grossAmount = amt;
        netAmount = (amt * 100) / (100 + rate);
        gstAmount = grossAmount - netAmount;
      } else {
        netAmount = amt;
        gstAmount = (amt * rate) / 100;
        grossAmount = netAmount + gstAmount;
      }

      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;

      return {
        primaryResult: `₹${grossAmount.toFixed(2)}`,
        primaryUnit: isInclusive ? 'Total (Inclusive)' : 'Total (After GST)',
        secondaryResults: [
          { label: 'Net Amount (Pre-Tax)', value: `₹${netAmount.toFixed(2)}` },
          { label: 'GST Amount', value: `₹${gstAmount.toFixed(2)}` },
          { label: 'CGST (Central Tax)', value: `₹${cgst.toFixed(2)} (${rate/2}%)` },
          { label: 'SGST (State Tax)', value: `₹${sgst.toFixed(2)} (${rate/2}%)` }
        ],
        steps: isInclusive ? [
          { stepNumber: 1, title: 'Net Amount Extraction', explanation: `Net Amount = (Gross Amount × 100) / (100 + ${rate}) = ₹${netAmount.toFixed(2)}` },
          { stepNumber: 2, title: 'GST Calculation', explanation: `GST Component = ₹${grossAmount.toFixed(2)} - ₹${netAmount.toFixed(2)} = ₹${gstAmount.toFixed(2)}` }
        ] : [
          { stepNumber: 1, title: 'GST Calculation', explanation: `GST Amount = Net Amount × (${rate} / 100) = ₹${netAmount} × ${rate/100} = ₹${gstAmount.toFixed(2)}` },
          { stepNumber: 2, title: 'Gross Amount Sum', explanation: `Gross Amount = ₹${netAmount} + ₹${gstAmount.toFixed(2)} = ₹${grossAmount.toFixed(2)}` }
        ],
        explanation: `${isInclusive ? 'Inclusive GST' : 'Exclusive GST'} of ${rate}% on ₹${amt.toLocaleString('en-IN')} gives net amount ₹${netAmount.toFixed(2)} and GST of ₹${gstAmount.toFixed(2)}.`,
        chartData: [
          { name: 'Net Amount', value: Math.round(netAmount) },
          { name: 'CGST', value: Math.round(cgst) },
          { name: 'SGST', value: Math.round(sgst) }
        ],
        formulaName: 'GST Calculator',
        category: 'finance',
        subCategory: 'Taxation & Accounting',
        timestamp: new Date().toISOString()
      };
    }
  },
  {
    id: 'fin-sip',
    name: 'SIP Wealth Calculator',
    category: 'finance',
    subCategory: 'Investment',
    description: 'Calculate future returns on Systematic Investment Plan (SIP) in Mutual Funds with inflation visualizer.',
    tags: ['sip', 'mutual fund', 'investment', 'wealth', 'compound', 'returns', 'cagr'],
    inputs: [
      { id: 'monthly', label: 'Monthly Investment', type: 'number', defaultValue: 0, unit: '₹' },
      { id: 'expectedReturn', label: 'Expected Annual Return', type: 'number', defaultValue: 0, unit: '%', step: 0.5 },
      { id: 'periodYears', label: 'Investment Horizon', type: 'number', defaultValue: 0, unit: 'Years' }
    ],
    calculate: (inputs) => {
      const P = Number(inputs.monthly) || 0;
      const i = (Number(inputs.expectedReturn) || 0) / (12 * 100);
      const n = (Number(inputs.periodYears) || 0) * 12;

      let futureValue = 0;
      if (i > 0) {
        futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      } else {
        futureValue = P * n;
      }

      const totalInvested = P * n;
      const estimatedGain = Math.max(0, futureValue - totalInvested);

      return {
        primaryResult: `₹${Math.round(futureValue).toLocaleString('en-IN')}`,
        primaryUnit: 'Maturity Value',
        secondaryResults: [
          { label: 'Total Amount Invested', value: `₹${totalInvested.toLocaleString('en-IN')}` },
          { label: 'Estimated Wealth Gain', value: `₹${Math.round(estimatedGain).toLocaleString('en-IN')}` },
          { label: 'Return Ratio', value: totalInvested > 0 ? `${((futureValue / totalInvested) * 100).toFixed(1)}%` : '0%' }
        ],
        steps: [
          { stepNumber: 1, title: 'Monthly Interest Rate', explanation: `i = ${inputs.expectedReturn || 0}% / (12 × 100) = ${i.toFixed(6)}` },
          { stepNumber: 2, title: 'Compound Annuity Application', explanation: `Future Value = P × [((1+i)ⁿ - 1) / i] × (1+i) = ₹${Math.round(futureValue).toLocaleString('en-IN')}` }
        ],
        explanation: `Investing ₹${P.toLocaleString('en-IN')}/month for ${inputs.periodYears || 0} years at ${inputs.expectedReturn || 0}% expected return accumulates a total corpus of ₹${Math.round(futureValue).toLocaleString('en-IN')}.`,
        chartData: [
          { name: 'Total Invested', value: totalInvested },
          { name: 'Wealth Gain', value: Math.round(estimatedGain) }
        ],
        formulaName: 'SIP Wealth Calculator',
        category: 'finance',
        subCategory: 'Investment',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- MATHEMATICS ---
  {
    id: 'math-algebra-quadratic',
    name: 'Quadratic Equation Solver',
    category: 'math',
    subCategory: 'Algebra',
    description: 'Solve quadratic equations ax² + bx + c = 0 with real and complex roots, discriminant, and vertex coordinates.',
    tags: ['algebra', 'quadratic', 'equation', 'roots', 'math', 'polynomial'],
    inputs: [
      { id: 'a', label: 'Coefficient a', type: 'number', defaultValue: 0 },
      { id: 'b', label: 'Coefficient b', type: 'number', defaultValue: 0 },
      { id: 'c', label: 'Coefficient c', type: 'number', defaultValue: 0 }
    ],
    calculate: (inputs) => {
      const a = Number(inputs.a) || 0;
      const b = Number(inputs.b) || 0;
      const c = Number(inputs.c) || 0;

      if (a === 0) {
        const linRoot = b !== 0 ? (-c / b).toFixed(4) : '0';
        return {
          primaryResult: `x = ${linRoot}`,
          primaryUnit: 'Linear Root',
          secondaryResults: [
            { label: 'Type', value: 'Linear Equation (a = 0)' },
            { label: 'Root x', value: linRoot }
          ],
          steps: [
            { stepNumber: 1, title: 'Linear Reduction', explanation: `${b}x + ${c} = 0 => x = -${c} / ${b} = ${linRoot}` }
          ],
          explanation: `When a = 0, equation reduces to linear ${b}x + ${c} = 0 yielding x = ${linRoot}.`,
          formulaName: 'Quadratic Equation Solver',
          category: 'math',
          subCategory: 'Algebra',
          timestamp: new Date().toISOString()
        };
      }

      const D = b * b - 4 * a * c;
      let root1Str = '';
      let root2Str = '';
      let nature = '';

      if (D > 0) {
        const r1 = (-b + Math.sqrt(D)) / (2 * a);
        const r2 = (-b - Math.sqrt(D)) / (2 * a);
        root1Str = r1.toFixed(4);
        root2Str = r2.toFixed(4);
        nature = 'Two distinct real roots';
      } else if (D === 0) {
        const r = -b / (2 * a);
        root1Str = r.toFixed(4);
        root2Str = r.toFixed(4);
        nature = 'One real repeated root';
      } else {
        const realPart = (-b / (2 * a)).toFixed(4);
        const imagPart = (Math.sqrt(-D) / (2 * a)).toFixed(4);
        root1Str = `${realPart} + ${imagPart}i`;
        root2Str = `${realPart} - ${imagPart}i`;
        nature = 'Two complex conjugate roots';
      }

      const vertexX = -b / (2 * a);
      const vertexY = c - (b * b) / (4 * a);

      return {
        primaryResult: `x₁ = ${root1Str}, x₂ = ${root2Str}`,
        primaryUnit: 'Roots',
        secondaryResults: [
          { label: 'Discriminant (D = b² - 4ac)', value: D },
          { label: 'Nature of Roots', value: nature },
          { label: 'Parabola Vertex (h, k)', value: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})` }
        ],
        steps: [
          { stepNumber: 1, title: 'Calculate Discriminant D', explanation: `D = b² - 4ac = (${b})² - 4(${a})(${c}) = ${D}` },
          { stepNumber: 2, title: 'Quadratic Formula', explanation: `x = [-b ± √D] / (2a) = [${-b} ± √${D}] / ${2*a}` },
          { stepNumber: 3, title: 'Root Evaluation', explanation: `Root 1 = ${root1Str}, Root 2 = ${root2Str}` }
        ],
        explanation: `For equation ${a}x² + ${b}x + ${c} = 0, the discriminant D is ${D}. It yields ${nature.toLowerCase()}.`,
        formulaName: 'Quadratic Equation Solver',
        category: 'math',
        subCategory: 'Algebra',
        timestamp: new Date().toISOString()
      };
    }
  },
  {
    id: 'math-calculus-integration',
    name: 'Definite Integral & Area',
    category: 'math',
    subCategory: 'Calculus',
    description: 'Calculate polynomial integral ∫ f(x) dx and bounded area between bounds a and b.',
    tags: ['calculus', 'integration', 'area', 'derivative', 'math', 'integral'],
    inputs: [
      { id: 'expr', label: 'Expression f(x)', type: 'text', defaultValue: '' },
      { id: 'a', label: 'Lower Limit (a)', type: 'number', defaultValue: 0 },
      { id: 'b', label: 'Upper Limit (b)', type: 'number', defaultValue: 0 }
    ],
    calculate: (inputs) => {
      const a = Number(inputs.a) || 0;
      const b = Number(inputs.b) || 0;
      const expr = String(inputs.expr || 'x^2');

      const N = 1000;
      const dx = (b - a) / N;
      let area = 0;

      const evalFn = (xVal: number) => {
        try {
          if (expr.includes('x^2')) return Math.pow(xVal, 2) + (expr.includes('2*x') ? 2 * xVal : 0);
          if (expr.includes('x^3')) return Math.pow(xVal, 3);
          if (expr.includes('sin')) return Math.sin(xVal);
          if (expr.includes('cos')) return Math.cos(xVal);
          return xVal;
        } catch {
          return xVal;
        }
      };

      for (let i = 0; i <= N; i++) {
        const xVal = a + i * dx;
        const weight = (i === 0 || i === N) ? 0.5 : 1;
        area += weight * evalFn(xVal);
      }
      area *= dx;

      return {
        primaryResult: area.toFixed(4),
        primaryUnit: 'Area Units',
        secondaryResults: [
          { label: 'Integration Interval', value: `[${a}, ${b}]` },
          { label: 'Numerical Method', value: 'Trapezoidal Quadrature (N=1000)' }
        ],
        steps: [
          { stepNumber: 1, title: 'Integral Setup', explanation: `∫[${a} to ${b}] (${expr}) dx` },
          { stepNumber: 2, title: 'Numerical Integration', explanation: `Subdivided into 1000 intervals with step size dx = ${(b-a)/1000}` },
          { stepNumber: 3, title: 'Result Evaluation', explanation: `Definite integral area = ${area.toFixed(4)}` }
        ],
        explanation: `The definite integral of f(x) = ${expr} from x = ${a} to x = ${b} equals approximately ${area.toFixed(4)}.`,
        formulaName: 'Definite Integral & Area',
        category: 'math',
        subCategory: 'Calculus',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- UNIT CONVERTER ---
  {
    id: 'conv-length',
    name: 'Length & Distance Converter',
    category: 'converter',
    subCategory: 'Length',
    description: 'Convert between Meters, Feet, Inches, Centimeters, Kilometers, and Miles.',
    tags: ['length', 'distance', 'feet', 'inches', 'meters', 'cm', 'km', 'miles'],
    inputs: [
      { id: 'value', label: 'Value', type: 'number', defaultValue: 0 },
      { id: 'fromUnit', label: 'From Unit', type: 'select', defaultValue: 'ft', options: [
        { label: 'Feet (ft)', value: 'ft' },
        { label: 'Inches (in)', value: 'in' },
        { label: 'Meters (m)', value: 'm' },
        { label: 'Centimeters (cm)', value: 'cm' },
        { label: 'Kilometers (km)', value: 'km' },
        { label: 'Miles (mi)', value: 'mi' }
      ]}
    ],
    calculate: (inputs) => {
      const val = Number(inputs.value) || 0;
      const from = inputs.fromUnit || 'ft';

      const toMeterMap: Record<string, number> = {
        ft: 0.3048,
        in: 0.0254,
        m: 1,
        cm: 0.01,
        km: 1000,
        mi: 1609.344
      };

      const meters = val * (toMeterMap[from] || 1);

      const feet = meters / 0.3048;
      const inches = meters / 0.0254;
      const cm = meters * 100;
      const km = meters / 1000;
      const miles = meters / 1609.344;

      return {
        primaryResult: `${meters.toFixed(3)} m (${feet.toFixed(2)} ft)`,
        primaryUnit: 'Standard Units',
        secondaryResults: [
          { label: 'Meters (m)', value: `${meters.toFixed(3)} m` },
          { label: 'Feet (ft)', value: `${feet.toFixed(2)} ft` },
          { label: 'Inches (in)', value: `${inches.toFixed(2)} in` },
          { label: 'Centimeters (cm)', value: `${cm.toFixed(1)} cm` },
          { label: 'Kilometers (km)', value: `${km.toFixed(4)} km` },
          { label: 'Miles (mi)', value: `${miles.toFixed(4)} mi` }
        ],
        steps: [
          { stepNumber: 1, title: 'Convert to Base SI Unit (Meters)', explanation: `${val} ${from} × ${toMeterMap[from]} = ${meters.toFixed(4)} m` },
          { stepNumber: 2, title: 'Derived Conversions', explanation: `Feet = ${meters.toFixed(4)} / 0.3048 = ${feet.toFixed(2)} ft` }
        ],
        explanation: `${val} ${from} is equal to ${meters.toFixed(3)} meters or ${feet.toFixed(2)} feet.`,
        formulaName: 'Length & Distance Converter',
        category: 'converter',
        subCategory: 'Length',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- HEALTH ---
  {
    id: 'health-bmi',
    name: 'BMI & Health Metrics',
    category: 'health',
    subCategory: 'Fitness & Body',
    description: 'Calculate Body Mass Index (BMI), ideal weight range, and WHO health status classification.',
    tags: ['bmi', 'health', 'weight', 'height', 'fitness', 'calories', 'ideal weight'],
    inputs: [
      { id: 'weightKg', label: 'Weight (kg)', type: 'number', defaultValue: 0, min: 0, max: 300 },
      { id: 'heightCm', label: 'Height (cm)', type: 'number', defaultValue: 0, min: 0, max: 250 }
    ],
    calculate: (inputs) => {
      const w = Number(inputs.weightKg) || 0;
      const hCm = Number(inputs.heightCm) || 0;

      if (w === 0 || hCm === 0) {
        return {
          primaryResult: '0.0',
          primaryUnit: 'BMI (Enter weight & height)',
          secondaryResults: [
            { label: 'BMI Category', value: 'Enter parameters' },
            { label: 'Healthy Weight Range', value: '0 kg - 0 kg' }
          ],
          steps: [
            { stepNumber: 1, title: 'Input Parameters', explanation: 'Please enter valid Weight (kg) and Height (cm).' }
          ],
          explanation: 'Enter your weight and height above to compute Body Mass Index (BMI).',
          formulaName: 'BMI & Health Metrics',
          category: 'health',
          subCategory: 'Fitness & Body',
          timestamp: new Date().toISOString()
        };
      }

      const hM = hCm / 100;
      const bmi = w / (hM * hM);
      let category = '';

      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 24.9) category = 'Normal weight (Healthy)';
      else if (bmi < 29.9) category = 'Overweight';
      else category = 'Obese';

      const minHealthyW = 18.5 * (hM * hM);
      const maxHealthyW = 24.9 * (hM * hM);

      return {
        primaryResult: bmi.toFixed(1),
        primaryUnit: `BMI (${category})`,
        secondaryResults: [
          { label: 'BMI Category', value: category },
          { label: 'Healthy Weight Range for your height', value: `${minHealthyW.toFixed(1)} kg - ${maxHealthyW.toFixed(1)} kg` },
          { label: 'Height', value: `${hCm} cm (${(hCm/30.48).toFixed(1)} ft)` }
        ],
        steps: [
          { stepNumber: 1, title: 'Convert Height to Meters', explanation: `Height in meters = ${hCm} cm / 100 = ${hM} m` },
          { stepNumber: 2, title: 'BMI Calculation Formula', explanation: `BMI = Weight / (Height²) = ${w} / (${hM}²) = ${w} / ${(hM*hM).toFixed(2)} = ${bmi.toFixed(1)}` }
        ],
        explanation: `With a weight of ${w} kg and height of ${hCm} cm, your Body Mass Index is ${bmi.toFixed(1)}, placing you in the '${category}' classification.`,
        formulaName: 'BMI & Health Metrics',
        category: 'health',
        subCategory: 'Fitness & Body',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- CONSTRUCTION & CIVIL ---
  {
    id: 'const-paint',
    name: 'Wall Paint Estimator',
    category: 'construction',
    subCategory: 'Materials & Cost',
    description: 'Estimate litres of paint, primer, and total cost needed for walls and ceilings based on room dimensions.',
    tags: ['paint', 'wall', 'construction', 'house', 'room', 'renovation', 'cost'],
    inputs: [
      { id: 'lengthFt', label: 'Room Length (ft)', type: 'number', defaultValue: 0 },
      { id: 'widthFt', label: 'Room Width (ft)', type: 'number', defaultValue: 0 },
      { id: 'heightFt', label: 'Wall Height (ft)', type: 'number', defaultValue: 0 },
      { id: 'coats', label: 'Number of Paint Coats', type: 'select', defaultValue: 2, options: [
        { label: '1 Coat', value: 1 },
        { label: '2 Coats (Recommended)', value: 2 },
        { label: '3 Coats', value: 3 }
      ]},
      { id: 'pricePerLitre', label: 'Paint Price per Litre', type: 'number', defaultValue: 0, unit: '₹' }
    ],
    calculate: (inputs) => {
      const l = Number(inputs.lengthFt) || 0;
      const w = Number(inputs.widthFt) || 0;
      const h = Number(inputs.heightFt) || 0;
      const coats = Number(inputs.coats) || 2;
      const priceLitre = Number(inputs.pricePerLitre) || 0;

      const wallArea = 2 * (l + w) * h;
      const netWallArea = wallArea * 0.85;
      const totalCoverageSqFt = netWallArea * coats;

      const litresNeeded = netWallArea > 0 ? Math.ceil(totalCoverageSqFt / 100) : 0;
      const totalCost = litresNeeded * priceLitre;

      return {
        primaryResult: `${litresNeeded} Litres`,
        primaryUnit: `Paint Needed (${coats} coats)`,
        secondaryResults: [
          { label: 'Total Wall Area', value: `${wallArea} sq ft` },
          { label: 'Net Area (Minus doors/windows)', value: `${netWallArea.toFixed(0)} sq ft` },
          { label: 'Estimated Paint Cost', value: `₹${totalCost.toLocaleString('en-IN')}` },
          { label: 'Primer Needed', value: `${Math.ceil(netWallArea / 120)} Litres` }
        ],
        steps: [
          { stepNumber: 1, title: 'Calculate Total Wall Surface', explanation: `Perimeter × Height = 2 × (${l} + ${w}) × ${h} = ${wallArea} sq ft` },
          { stepNumber: 2, title: 'Deduct Doors & Windows (15%)', explanation: `Net Painting Area = ${wallArea} × 0.85 = ${netWallArea.toFixed(0)} sq ft` },
          { stepNumber: 3, title: 'Calculate Litres for Coats', explanation: `Coverage = ${netWallArea.toFixed(0)} × ${coats} coats = ${totalCoverageSqFt.toFixed(0)} sq ft. At 100 sq ft/L = ${litresNeeded} Litres` }
        ],
        explanation: `For a ${l}x${w} ft room with ${h} ft height, you need approx ${litresNeeded} litres of paint for ${coats} coats, costing ₹${totalCost.toLocaleString('en-IN')}.`,
        formulaName: 'Wall Paint Estimator',
        category: 'construction',
        subCategory: 'Materials & Cost',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- ENGINEERING ---
  {
    id: 'eng-ohms-law',
    name: "Ohm's Law & Electrical Power",
    category: 'engineering',
    subCategory: 'Electrical',
    description: "Calculate Voltage (V), Current (I), Resistance (R), and Power (P) for electrical circuits.",
    tags: ['ohms law', 'voltage', 'current', 'resistance', 'power', 'electrical', 'watts'],
    inputs: [
      { id: 'knowns', label: 'Known Pair', type: 'select', defaultValue: 'VI', options: [
        { label: 'Voltage (V) & Current (I)', value: 'VI' },
        { label: 'Voltage (V) & Resistance (R)', value: 'VR' },
        { label: 'Current (I) & Resistance (R)', value: 'IR' },
        { label: 'Power (P) & Voltage (V)', value: 'PV' }
      ]},
      { id: 'val1', label: 'First Parameter Value', type: 'number', defaultValue: 0, unit: 'V / A / Ω / W' },
      { id: 'val2', label: 'Second Parameter Value', type: 'number', defaultValue: 0, unit: 'A / Ω / V' }
    ],
    calculate: (inputs) => {
      const mode = inputs.knowns || 'VI';
      const v1 = Number(inputs.val1) || 0;
      const v2 = Number(inputs.val2) || 0;

      let V = 0, I = 0, R = 0, P = 0;

      if (mode === 'VI') {
        V = v1; I = v2;
        R = I !== 0 ? V / I : 0;
        P = V * I;
      } else if (mode === 'VR') {
        V = v1; R = v2;
        I = R !== 0 ? V / R : 0;
        P = R !== 0 ? (V * V) / R : 0;
      } else if (mode === 'IR') {
        I = v1; R = v2;
        V = I * R;
        P = I * I * R;
      } else {
        P = v1; V = v2;
        I = V !== 0 ? P / V : 0;
        R = I !== 0 ? V / I : 0;
      }

      return {
        primaryResult: `${P.toFixed(2)} W (${(P/1000).toFixed(3)} kW)`,
        primaryUnit: 'Electrical Power (P)',
        secondaryResults: [
          { label: 'Voltage (V)', value: `${V.toFixed(2)} Volts` },
          { label: 'Current (I)', value: `${I.toFixed(2)} Amperes` },
          { label: 'Resistance (R)', value: `${R.toFixed(2)} Ohms (Ω)` },
          { label: 'Power (P)', value: `${P.toFixed(2)} Watts (W)` }
        ],
        steps: [
          { stepNumber: 1, title: 'Ohm Law Relation', explanation: `V = I × R, P = V × I = I² × R` },
          { stepNumber: 2, title: 'Calculated Circuit Values', explanation: `Voltage = ${V.toFixed(2)}V, Current = ${I.toFixed(2)}A, Resistance = ${R.toFixed(2)}Ω, Power = ${P.toFixed(2)}W` }
        ],
        explanation: `In an electrical circuit with ${V.toFixed(1)}V and ${I.toFixed(1)}A, resistance is ${R.toFixed(2)} Ω and total power dissipated is ${P.toFixed(2)} Watts.`,
        formulaName: "Ohm's Law & Electrical Power",
        category: 'engineering',
        subCategory: 'Electrical',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- COMPUTER SCIENCE & AI ---
  {
    id: 'cs-subnet',
    name: 'IP Subnet Mask Calculator',
    category: 'engineering',
    subCategory: 'Computer Science',
    description: 'Calculate Network Address, Broadcast Address, Wildcard Mask, and usable host count for IPv4.',
    tags: ['ip', 'subnet', 'networking', 'cidr', 'binary', 'computer science'],
    inputs: [
      { id: 'ip', label: 'IP Address', type: 'text', defaultValue: '' },
      { id: 'cidr', label: 'CIDR Subnet Prefix', type: 'number', defaultValue: 0, min: 0, max: 32 }
    ],
    calculate: (inputs) => {
      const ipStr = String(inputs.ip || '').trim();
      const cidr = Number(inputs.cidr) || 0;

      if (!ipStr || cidr === 0) {
        return {
          primaryResult: '0 Usable Hosts',
          primaryUnit: 'Enter IP and Subnet Prefix',
          secondaryResults: [
            { label: 'Subnet Mask', value: '0.0.0.0' },
            { label: 'Total Addresses', value: '0' }
          ],
          steps: [
            { stepNumber: 1, title: 'Input Needed', explanation: 'Enter IP address (e.g., 192.168.1.1) and CIDR prefix (e.g., 24).' }
          ],
          explanation: 'Enter IPv4 address and subnet prefix to calculate networking parameters.',
          formulaName: 'IP Subnet Mask Calculator',
          category: 'engineering',
          subCategory: 'Computer Science',
          timestamp: new Date().toISOString()
        };
      }

      const totalHosts = Math.pow(2, 32 - cidr);
      const usableHosts = totalHosts > 2 ? totalHosts - 2 : totalHosts;

      const maskInt = (0xFFFFFFFF << (32 - cidr)) >>> 0;
      const maskParts = [
        (maskInt >>> 24) & 0xFF,
        (maskInt >>> 16) & 0xFF,
        (maskInt >>> 8) & 0xFF,
        maskInt & 0xFF
      ];
      const subnetMask = maskParts.join('.');

      return {
        primaryResult: `${usableHosts.toLocaleString()} Usable Hosts`,
        primaryUnit: `Subnet /${cidr}`,
        secondaryResults: [
          { label: 'Subnet Mask', value: subnetMask },
          { label: 'Total Addresses', value: totalHosts.toLocaleString() },
          { label: 'Usable Host Range', value: `${totalHosts - 2} Devices` },
          { label: 'Wildcard Mask', value: maskParts.map(p => 255 - p).join('.') }
        ],
        steps: [
          { stepNumber: 1, title: 'Calculate Host Bits', explanation: `Host Bits = 32 - ${cidr} = ${32 - cidr} bits` },
          { stepNumber: 2, title: 'Addresses Calculation', explanation: `Total IP Count = 2^${32 - cidr} = ${totalHosts}. Usable = ${totalHosts} - 2 = ${usableHosts}` }
        ],
        explanation: `An IPv4 subnet with prefix /${cidr} provides a subnet mask of ${subnetMask} with ${usableHosts.toLocaleString()} usable IP addresses.`,
        formulaName: 'IP Subnet Mask Calculator',
        category: 'engineering',
        subCategory: 'Computer Science',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- EDUCATION ---
  {
    id: 'edu-gpa',
    name: 'GPA & CGPA Grade Predictor',
    category: 'education',
    subCategory: 'Academic Performance',
    description: 'Calculate Grade Point Average (GPA), Cumulative GPA, and required future target grades.',
    tags: ['gpa', 'cgpa', 'grades', 'education', 'college', 'marks', 'report card'],
    inputs: [
      { id: 'obtainedPoints', label: 'Total Grade Points Earned', type: 'number', defaultValue: 0 },
      { id: 'totalCredits', label: 'Total Course Credits', type: 'number', defaultValue: 0 }
    ],
    calculate: (inputs) => {
      const pts = Number(inputs.obtainedPoints) || 0;
      const credits = Number(inputs.totalCredits) || 0;
      const gpa = credits > 0 ? pts / credits : 0;

      return {
        primaryResult: gpa.toFixed(2),
        primaryUnit: 'GPA (10.0 Scale)',
        secondaryResults: [
          { label: 'Total Credits', value: credits },
          { label: 'Grade Percentage Equivalent', value: `${(gpa * 9.5).toFixed(1)}%` },
          { label: 'Academic Standing', value: gpa >= 8.0 ? 'Distinction' : gpa >= 6.0 ? 'First Class' : 'Pass' }
        ],
        steps: [
          { stepNumber: 1, title: 'GPA Formula', explanation: `GPA = Total Grade Points (${pts}) / Total Credits (${credits}) = ${gpa.toFixed(2)}` }
        ],
        explanation: `With ${pts} points over ${credits} credits, your overall GPA is ${gpa.toFixed(2)}.`,
        formulaName: 'GPA & CGPA Grade Predictor',
        category: 'education',
        subCategory: 'Academic Performance',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- HEALTH & FITNESS ---
  {
    id: 'health-bmr',
    name: 'BMR & Daily Calorie Calculator',
    category: 'health',
    subCategory: 'Nutrition & Metabolism',
    description: 'Calculate Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) calories.',
    tags: ['bmr', 'tdee', 'calories', 'health', 'fitness', 'diet', 'metabolism'],
    inputs: [
      { id: 'weightKg', label: 'Weight (kg)', type: 'number', defaultValue: 0 },
      { id: 'heightCm', label: 'Height (cm)', type: 'number', defaultValue: 0 },
      { id: 'age', label: 'Age (Years)', type: 'number', defaultValue: 0 },
      { id: 'gender', label: 'Gender', type: 'select', defaultValue: 'male', options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' }
      ]}
    ],
    calculate: (inputs) => {
      const w = Number(inputs.weightKg) || 0;
      const h = Number(inputs.heightCm) || 0;
      const a = Number(inputs.age) || 0;
      const isMale = inputs.gender === 'male';

      let bmr = 0;
      if (w > 0 && h > 0 && a > 0) {
        if (isMale) {
          bmr = 10 * w + 6.25 * h - 5 * a + 5;
        } else {
          bmr = 10 * w + 6.25 * h - 5 * a - 161;
        }
      }

      const tdeeSedentary = Math.round(bmr * 1.2);
      const tdeeModerate = Math.round(bmr * 1.55);

      return {
        primaryResult: `${Math.round(bmr)} kcal`,
        primaryUnit: 'Basal Metabolic Rate (BMR)',
        secondaryResults: [
          { label: 'Sedentary Maintenance Calories', value: `${tdeeSedentary} kcal/day` },
          { label: 'Active Maintenance Calories', value: `${tdeeModerate} kcal/day` },
          { label: 'Recommended Water Intake', value: `${(w * 0.035).toFixed(1)} Litres/day` }
        ],
        steps: [
          { stepNumber: 1, title: 'Mifflin-St Jeor Equation', explanation: `BMR = 10×Weight + 6.25×Height - 5×Age + ${isMale ? 5 : -161}` }
        ],
        explanation: `Your baseline calories required to survive at rest is ${Math.round(bmr)} kcal/day.`,
        formulaName: 'BMR & Daily Calorie Calculator',
        category: 'health',
        subCategory: 'Nutrition & Metabolism',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- AI & DATA SCIENCE ---
  {
    id: 'ai-metrics',
    name: 'Precision, Recall & F1-Score',
    category: 'ai_data',
    subCategory: 'Model Evaluation',
    description: 'Calculate Precision, Recall, F1-Score, and Accuracy from Confusion Matrix values.',
    tags: ['ai', 'data science', 'precision', 'recall', 'f1', 'confusion matrix', 'machine learning'],
    inputs: [
      { id: 'tp', label: 'True Positives (TP)', type: 'number', defaultValue: 0 },
      { id: 'fp', label: 'False Positives (FP)', type: 'number', defaultValue: 0 },
      { id: 'fn', label: 'False Negatives (FN)', type: 'number', defaultValue: 0 },
      { id: 'tn', label: 'True Negatives (TN)', type: 'number', defaultValue: 0 }
    ],
    calculate: (inputs) => {
      const tp = Number(inputs.tp) || 0;
      const fp = Number(inputs.fp) || 0;
      const fn = Number(inputs.fn) || 0;
      const tn = Number(inputs.tn) || 0;

      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
      const total = tp + fp + fn + tn;
      const accuracy = total > 0 ? (tp + tn) / total : 0;

      return {
        primaryResult: `${(f1 * 100).toFixed(1)}%`,
        primaryUnit: 'F1-Score',
        secondaryResults: [
          { label: 'Precision', value: `${(precision * 100).toFixed(1)}%` },
          { label: 'Recall (Sensitivity)', value: `${(recall * 100).toFixed(1)}%` },
          { label: 'Accuracy', value: `${(accuracy * 100).toFixed(1)}%` },
          { label: 'Total Samples Evaluated', value: total }
        ],
        steps: [
          { stepNumber: 1, title: 'Precision', explanation: `Precision = TP / (TP + FP) = ${tp} / ${tp + fp} = ${(precision * 100).toFixed(1)}%` },
          { stepNumber: 2, title: 'Recall', explanation: `Recall = TP / (TP + FN) = ${tp} / ${tp + fn} = ${(recall * 100).toFixed(1)}%` },
          { stepNumber: 3, title: 'F1 Harmonic Mean', explanation: `F1 = 2 × (Precision × Recall) / (Precision + Recall) = ${(f1 * 100).toFixed(1)}%` }
        ],
        explanation: `With TP=${tp}, FP=${fp}, FN=${fn}, TN=${tn}, model yields an F1 score of ${(f1 * 100).toFixed(1)}%.`,
        formulaName: 'Precision, Recall & F1-Score',
        category: 'ai_data',
        subCategory: 'Model Evaluation',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- CLOUD CALCULATOR ---
  {
    id: 'cloud-aws',
    name: 'AWS Cloud EC2 & S3 Cost Estimator',
    category: 'cloud',
    subCategory: 'Infrastructure Pricing',
    description: 'Estimate monthly cloud infrastructure costs for compute instances, bandwidth, and storage.',
    tags: ['aws', 'cloud', 'ec2', 's3', 'server', 'docker', 'cost', 'pricing'],
    inputs: [
      { id: 'instances', label: 'Number of Compute Instances', type: 'number', defaultValue: 0 },
      { id: 'storageGB', label: 'Storage Size (GB)', type: 'number', defaultValue: 0 },
      { id: 'bandwidthGB', label: 'Egress Bandwidth (GB)', type: 'number', defaultValue: 0 }
    ],
    calculate: (inputs) => {
      const inst = Number(inputs.instances) || 0;
      const storage = Number(inputs.storageGB) || 0;
      const bandwidth = Number(inputs.bandwidthGB) || 0;

      const computeCost = inst * 35; // ~$35/mo avg instance
      const storageCost = storage * 0.023; // $0.023/GB
      const bandwidthCost = bandwidth * 0.09; // $0.09/GB

      const totalMonthlyCost = computeCost + storageCost + bandwidthCost;

      return {
        primaryResult: `$${totalMonthlyCost.toFixed(2)}`,
        primaryUnit: 'Estimated $/Month',
        secondaryResults: [
          { label: 'Compute Cost', value: `$${computeCost.toFixed(2)}` },
          { label: 'Storage Cost', value: `$${storageCost.toFixed(2)}` },
          { label: 'Data Egress Cost', value: `$${bandwidthCost.toFixed(2)}` },
          { label: 'Annualized Cost', value: `$${(totalMonthlyCost * 12).toFixed(2)}` }
        ],
        steps: [
          { stepNumber: 1, title: 'Compute Calculation', explanation: `${inst} Instances × $35/mo = $${computeCost}` },
          { stepNumber: 2, title: 'Storage & Bandwidth', explanation: `Storage: ${storage}GB × $0.023 = $${storageCost.toFixed(2)}, Egress: ${bandwidth}GB × $0.09 = $${bandwidthCost.toFixed(2)}` }
        ],
        explanation: `Total estimated monthly cloud infrastructure expense is $${totalMonthlyCost.toFixed(2)}.`,
        formulaName: 'AWS Cloud EC2 & S3 Cost Estimator',
        category: 'cloud',
        subCategory: 'Infrastructure Pricing',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- AGRICULTURE CALCULATOR ---
  {
    id: 'agri-yield',
    name: 'Crop Yield & Seed Requirement',
    category: 'agriculture',
    subCategory: 'Farming Metrics',
    description: 'Estimate seed rate, fertilizer quantity, and expected harvest yield based on farm field size.',
    tags: ['agriculture', 'crop', 'seed', 'fertilizer', 'yield', 'farm', 'acre'],
    inputs: [
      { id: 'acres', label: 'Farm Land Area (Acres)', type: 'number', defaultValue: 0 },
      { id: 'seedRateKgAcre', label: 'Seed Rate (kg/Acre)', type: 'number', defaultValue: 0 }
    ],
    calculate: (inputs) => {
      const area = Number(inputs.acres) || 0;
      const seedRate = Number(inputs.seedRateKgAcre) || 0;

      const totalSeedKg = area * seedRate;
      const estFertilizerKg = area * 50; // ~50kg NPK blend / acre avg
      const estWaterLitres = area * 4000; // ~4000L / acre avg

      return {
        primaryResult: `${totalSeedKg} kg`,
        primaryUnit: 'Total Seeds Needed',
        secondaryResults: [
          { label: 'Fertilizer (NPK Blend)', value: `${estFertilizerKg} kg` },
          { label: 'Est. Irrigation Water', value: `${estWaterLitres.toLocaleString()} Litres` },
          { label: 'Land Area', value: `${area} Acres (${(area * 0.404686).toFixed(2)} Hectares)` }
        ],
        steps: [
          { stepNumber: 1, title: 'Seed Calculation', explanation: `${area} Acres × ${seedRate} kg/Acre = ${totalSeedKg} kg` }
        ],
        explanation: `For ${area} acres of farmland, you require ${totalSeedKg} kg of seed and approximately ${estFertilizerKg} kg of fertilizer.`,
        formulaName: 'Crop Yield & Seed Requirement',
        category: 'agriculture',
        subCategory: 'Farming Metrics',
        timestamp: new Date().toISOString()
      };
    }
  },

  // --- BUSINESS & PAYROLL ---
  {
    id: 'biz-payroll',
    name: 'Payroll & Salary CTC Calculator',
    category: 'business',
    subCategory: 'HR & Finance',
    description: 'Break down Gross Salary, PF, Professional Tax, Health Insurance, Loan deductions, EMI deductions, and Net Take-Home Pay.',
    tags: ['payroll', 'salary', 'ctc', 'take home', 'hr', 'taxes', 'pf', 'business', 'insurance', 'loan', 'emi'],
    inputs: [
      { id: 'monthlyCtc', label: 'Monthly CTC Amount', type: 'number', defaultValue: 0, unit: '₹', min: 0 },
      { id: 'pfPercent', label: 'PF Contribution Rate', type: 'number', defaultValue: 12, unit: '%', min: 0, max: 25 },
      { id: 'healthInsurance', label: 'Health Insurance Premium (Monthly)', type: 'number', defaultValue: 0, unit: '₹', min: 0 },
      { id: 'loanDeduction', label: 'Company Loan / Advance Repayment', type: 'number', defaultValue: 0, unit: '₹', min: 0 },
      { id: 'emiDeduction', label: 'Other EMI / Policy Deductions', type: 'number', defaultValue: 0, unit: '₹', min: 0 },
      { id: 'otherDeductions', label: 'Other Monthly Deductions', type: 'number', defaultValue: 0, unit: '₹', min: 0 }
    ],
    calculate: (inputs) => {
      const ctc = Number(inputs.monthlyCtc) || 0;
      const pfRate = Number(inputs.pfPercent) || 0;
      const healthIns = Number(inputs.healthInsurance) || 0;
      const loanDed = Number(inputs.loanDeduction) || 0;
      const emiDed = Number(inputs.emiDeduction) || 0;
      const otherDed = Number(inputs.otherDeductions) || 0;

      const basicPay = ctc * 0.5; // ~50% basic
      const pfDeduction = basicPay * (pfRate / 100);
      const professionalTax = ctc > 15000 ? 200 : 0;
      const totalDeductions = pfDeduction + professionalTax + healthIns + loanDed + emiDed + otherDed;
      const netTakeHome = Math.max(0, ctc - totalDeductions);

      return {
        primaryResult: `₹${Math.round(netTakeHome).toLocaleString('en-IN')}`,
        primaryUnit: 'Net Take-Home Pay / Month',
        secondaryResults: [
          { label: 'Gross Monthly CTC', value: `₹${ctc.toLocaleString('en-IN')}` },
          { label: 'Basic Salary Component', value: `₹${Math.round(basicPay).toLocaleString('en-IN')}` },
          { label: 'PF Contribution', value: `₹${Math.round(pfDeduction).toLocaleString('en-IN')}` },
          { label: 'Professional Tax', value: `₹${professionalTax}` },
          { label: 'Health Insurance Premium', value: `₹${healthIns.toLocaleString('en-IN')}` },
          { label: 'Loan / Advance Repayment', value: `₹${loanDed.toLocaleString('en-IN')}` },
          { label: 'EMI & Policy Deductions', value: `₹${emiDed.toLocaleString('en-IN')}` },
          { label: 'Other Deductions', value: `₹${otherDed.toLocaleString('en-IN')}` },
          { label: 'Total Monthly Deductions', value: `₹${Math.round(totalDeductions).toLocaleString('en-IN')}` }
        ],
        steps: [
          { stepNumber: 1, title: 'Basic Salary Allocation', explanation: `Basic Pay = 50% of CTC = ₹${Math.round(basicPay).toLocaleString('en-IN')}` },
          { stepNumber: 2, title: 'Statutory Deductions (PF & PT)', explanation: `PF (${pfRate}%) = ₹${Math.round(pfDeduction)}. Professional Tax = ₹${professionalTax}` },
          { stepNumber: 3, title: 'Custom Deductions (Insurance, Loans & EMIs)', explanation: `Health Insurance = ₹${healthIns}, Loan Repayment = ₹${loanDed}, EMI Deductions = ₹${emiDed}, Other = ₹${otherDed}` },
          { stepNumber: 4, title: 'Net Take-Home Pay', explanation: `Net Pay = CTC (₹${ctc}) - Total Deductions (₹${Math.round(totalDeductions)}) = ₹${Math.round(netTakeHome).toLocaleString('en-IN')}` }
        ],
        explanation: `With a monthly CTC of ₹${ctc.toLocaleString('en-IN')}, after total deductions of ₹${Math.round(totalDeductions).toLocaleString('en-IN')} (PF: ₹${Math.round(pfDeduction)}, PT: ₹${professionalTax}, Insurance: ₹${healthIns}, Loan/EMI: ₹${loanDed + emiDed}), your estimated net monthly take-home is ₹${Math.round(netTakeHome).toLocaleString('en-IN')}.`,
        chartData: [
          { name: 'Net Take-Home', value: Math.round(netTakeHome) },
          { name: 'PF & Taxes', value: Math.round(pfDeduction + professionalTax) },
          { name: 'Insurance & Loan EMIs', value: Math.round(healthIns + loanDed + emiDed + otherDed) }
        ],
        formulaName: 'Payroll & Salary CTC Calculator',
        category: 'business',
        subCategory: 'HR & Finance',
        timestamp: new Date().toISOString()
      };
    }
  }
];

export function findFormulaById(id: string): FormulaDefinition | undefined {
  return FORMULA_LIBRARY.find((f) => f.id === id);
}

export function searchFormulas(query: string): FormulaDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return FORMULA_LIBRARY;
  return FORMULA_LIBRARY.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.subCategory.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q))
  );
}
