import { NaturalLanguageParseResult, CategoryType } from '../types';
import { FORMULA_LIBRARY, findFormulaById } from './formulaLibrary';

export function parseQueryOffline(query: string): NaturalLanguageParseResult | null {
  const q = query.trim().toLowerCase();

  // 1. GST Query
  if (q.includes('gst')) {
    const numbers = q.match(/\d+[\d,.]*/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
    const amount = numbers[0] || 5000;
    const rate = numbers.find(n => [5, 12, 18, 28].includes(n)) || 18;
    const isInclusive = q.includes('inclusive') || q.includes('remove');

    const gstFormula = findFormulaById('fin-gst');
    if (gstFormula) {
      const result = gstFormula.calculate({
        amount,
        gstRate: rate,
        type: isInclusive ? 'inclusive' : 'exclusive'
      });
      return {
        intentDetected: 'GST Calculation',
        category: 'finance',
        subCategory: 'Taxation & Accounting',
        formulaName: gstFormula.name,
        extractedParameters: { amount, rate, isInclusive },
        result,
        aiNote: 'Parsed via local Zhynor Offline Rules Engine'
      };
    }
  }

  // 2. EMI Query (e.g. "EMI for ₹15 lakh", "EMI for 20 lakh for 20 years 6 months")
  if (q.includes('emi') || q.includes('loan')) {
    let principal = 1500000;
    let tenureYears = 15;
    let tenureMonths = 0;
    let rate = 8.5;

    // Check for "lakh" or "cr" or "crore"
    if (q.includes('lakh')) {
      const lakhMatch = q.match(/(\d+[\d,.]*)\s*lakh/);
      if (lakhMatch) principal = parseFloat(lakhMatch[1]) * 100000;
    } else if (q.includes('crore') || q.includes('cr')) {
      const crMatch = q.match(/(\d+[\d,.]*)\s*(crore|cr)/);
      if (crMatch) principal = parseFloat(crMatch[1]) * 10000000;
    } else {
      const nums = q.match(/\d+[\d,.]*/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
      if (nums.length > 0 && nums[0] > 1000) principal = nums[0];
    }

    const yearMatch = q.match(/(\d+)\s*(years|year|yr|yrs)/);
    if (yearMatch) tenureYears = parseInt(yearMatch[1]);

    const monthMatch = q.match(/(\d+)\s*(months|month|mo|mos)/);
    if (monthMatch) tenureMonths = parseInt(monthMatch[1]);

    const rateMatch = q.match(/(\d+[\d.]*)\s*(%|percent)/);
    if (rateMatch) rate = parseFloat(rateMatch[1]);

    const emiFormula = findFormulaById('fin-emi');
    if (emiFormula) {
      const result = emiFormula.calculate({ principal, rate, tenureYears, tenureMonths });
      return {
        intentDetected: 'Loan EMI Calculation',
        category: 'finance',
        subCategory: 'Loans & EMI',
        formulaName: emiFormula.name,
        extractedParameters: { principal, rate, tenureYears, tenureMonths },
        result,
        aiNote: 'Parsed via local Zhynor Offline Rules Engine'
      };
    }
  }

  // 3. Profit & Loss Query
  if (q.includes('profit') || q.includes('loss') || q.includes('cost price') || q.includes('selling price') || q.includes('cp') || q.includes('sp')) {
    let cp = 1000;
    let sp = 1250;
    const nums = q.match(/\d+[\d,.]*/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
    if (nums.length >= 2) {
      cp = nums[0];
      sp = nums[1];
    } else if (nums.length === 1) {
      cp = nums[0];
      sp = nums[0] * 1.2;
    }

    const profitLossFormula = findFormulaById('fin-profit-loss');
    if (profitLossFormula) {
      const result = profitLossFormula.calculate({ costPrice: cp, sellingPrice: sp, operatingExpenses: 0 });
      return {
        intentDetected: 'Profit & Loss Calculation',
        category: 'finance',
        subCategory: 'Business & Trading',
        formulaName: profitLossFormula.name,
        extractedParameters: { costPrice: cp, sellingPrice: sp },
        result,
        aiNote: 'Parsed via local Zhynor Offline Rules Engine'
      };
    }
  }

  // 3. BMI Query
  if (q.includes('bmi') || (q.includes('kg') && (q.includes('cm') || q.includes('height')))) {
    let weight = 72;
    let height = 175;

    const kgMatch = q.match(/(\d+[\d.]*)\s*kg/);
    if (kgMatch) weight = parseFloat(kgMatch[1]);

    const cmMatch = q.match(/(\d+[\d.]*)\s*cm/);
    if (cmMatch) height = parseFloat(cmMatch[1]);

    const bmiFormula = findFormulaById('health-bmi');
    if (bmiFormula) {
      const result = bmiFormula.calculate({ weightKg: weight, heightCm: height });
      return {
        intentDetected: 'BMI & Body Composition',
        category: 'health',
        subCategory: 'Fitness & Body',
        formulaName: bmiFormula.name,
        extractedParameters: { weight, height },
        result,
        aiNote: 'Parsed via local Zhynor Offline Rules Engine'
      };
    }
  }

  // 4. Paint / Room Query
  if (q.includes('paint') || q.includes('room') || q.includes('wall')) {
    let l = 15, w = 12, h = 10;
    const dimMatch = q.match(/(\d+)\s*x\s*(\d+)/i) || q.match(/(\d+)\s*by\s*(\d+)/i);
    if (dimMatch) {
      l = parseInt(dimMatch[1]);
      w = parseInt(dimMatch[2]);
    }
    const paintFormula = findFormulaById('const-paint');
    if (paintFormula) {
      const result = paintFormula.calculate({ lengthFt: l, widthFt: w, heightFt: h, coats: 2, pricePerLitre: 450 });
      return {
        intentDetected: 'Paint & Surface Estimation',
        category: 'construction',
        subCategory: 'Materials & Cost',
        formulaName: paintFormula.name,
        extractedParameters: { lengthFt: l, widthFt: w, heightFt: h },
        result,
        aiNote: 'Parsed via local Zhynor Offline Rules Engine'
      };
    }
  }

  // 5. Quadratic solve
  if (q.includes('solve') || q.includes('x²') || q.includes('x^2') || q.includes('quadratic')) {
    const quadFormula = findFormulaById('math-algebra-quadratic');
    if (quadFormula) {
      const result = quadFormula.calculate({ a: 5, b: 8, c: -3 });
      return {
        intentDetected: 'Algebra Quadratic Solver',
        category: 'math',
        subCategory: 'Algebra',
        formulaName: quadFormula.name,
        extractedParameters: { a: 5, b: 8, c: -3 },
        result,
        aiNote: 'Parsed via local Zhynor Offline Rules Engine'
      };
    }
  }

  // Default fallback: Try searching formula library keywords
  const matchedFormula = FORMULA_LIBRARY.find(f =>
    q.split(' ').some(word => word.length > 3 && f.tags.includes(word))
  );

  if (matchedFormula) {
    const defaultInputs: Record<string, any> = {};
    matchedFormula.inputs.forEach(i => { defaultInputs[i.id] = i.defaultValue; });
    const result = matchedFormula.calculate(defaultInputs);
    return {
      intentDetected: matchedFormula.name,
      category: matchedFormula.category,
      subCategory: matchedFormula.subCategory,
      formulaName: matchedFormula.name,
      extractedParameters: defaultInputs,
      result,
      aiNote: 'Matched using offline Formula Taxonomy Index'
    };
  }

  return null;
}
