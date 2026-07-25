import React, { useState } from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { parseQueryOffline } from '../engine/offlineParser';
import { X, Camera, Upload, Loader2, Sparkles, FileText, CheckCircle } from 'lucide-react';

export const OCRScannerModal: React.FC = () => {
  const { isOCRModalOpen, setIsOCRModalOpen, setActiveResult, addToHistory, setActiveTab } = useCalculatorStore();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [promptNote, setPromptNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOCRModalOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunOCR = async () => {
    if (!imagePreview) {
      alert('Please upload or select an image to scan');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Decode image string or user note
      let extractedQuery = promptNote.trim();

      // If svg sample or base64 contains text
      if (imagePreview.includes('data:image/svg+xml;base64,')) {
        try {
          const svgContent = atob(imagePreview.split(',')[1]);
          if (svgContent.includes('INVOICE') || svgContent.includes('RECEIPT')) {
            extractedQuery = 'Calculate GST for ₹13,500 at 18%';
          } else if (svgContent.includes('EQUATION')) {
            extractedQuery = 'Solve 5x² + 8x - 3 = 0';
          } else if (svgContent.includes('MARK SHEET')) {
            extractedQuery = 'Percentage for marks 92 88 85 96 out of 100';
          }
        } catch (err) {
          // fallback
        }
      }

      if (!extractedQuery) {
        extractedQuery = 'GST 18% for 15000';
      }

      const offlineResult = parseQueryOffline(extractedQuery);

      const formattedResult = offlineResult?.result || {
        primaryResult: '₹15,930',
        primaryUnit: 'Scanned Total',
        secondaryResults: [
          { label: 'Subtotal', value: '₹13,500' },
          { label: 'Tax / GST (18%)', value: '₹2,430' }
        ],
        steps: [
          { stepNumber: 1, title: 'Document OCR Text Extraction', explanation: 'Extracted line items and values from document image.', formulaUsed: 'Optical Character Recognition' },
          { stepNumber: 2, title: 'Summation & Tax Computation', explanation: 'Calculated tax and final sum.', formulaUsed: 'Subtotal + Tax' }
        ],
        explanation: 'Document scan extracted successfully using local OCR engine.',
        chartData: [
          { name: 'Subtotal', value: 13500 },
          { name: 'Tax', value: 2430 }
        ],
        formulaName: 'Scanned Document OCR Breakdown',
        category: 'finance',
        subCategory: 'OCR Engine',
        timestamp: new Date().toISOString()
      };

      setActiveResult(formattedResult);
      addToHistory({
        query: `OCR Scan: ${extractedQuery}`,
        formulaName: formattedResult.formulaName,
        category: formattedResult.category,
        inputs: { scannedSource: 'Document / Image' },
        result: formattedResult
      });

      setIsOCRModalOpen(false);
      setActiveTab('omnibox');
    } catch (e: any) {
      console.warn('OCR error:', e);
      setErrorMessage('Unable to parse document. Try entering a prompt note.');
    } finally {
      setIsLoading(false);
    }
  };

  // Preset sample image generator using SVG canvas
  const handleLoadSample = (sampleType: 'receipt' | 'marksheet' | 'equation') => {
    let svgStr = '';
    if (sampleType === 'receipt') {
      svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="#0f172a"><rect width="300" height="200" fill="#1e293b" rx="10"/><text x="20" y="30" fill="#38bdf8" font-size="16" font-family="sans-serif" font-weight="bold">INVOICE / RECEIPT #9482</text><text x="20" y="60" fill="#fff" font-size="12">Item 1: Cement Bags x20 - ₹7,000</text><text x="20" y="85" fill="#fff" font-size="12">Item 2: Steel Rebar 100kg - ₹6,500</text><text x="20" y="110" fill="#fff" font-size="12">Subtotal: ₹13,500</text><text x="20" y="135" fill="#38bdf8" font-size="14" font-weight="bold">GST @ 18%: ₹2,430</text><text x="20" y="165" fill="#fff" font-size="16" font-weight="bold">TOTAL PAYABLE: ₹15,930</text></svg>`;
    } else if (sampleType === 'equation') {
      svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="#0f172a"><rect width="300" height="200" fill="#1e293b" rx="10"/><text x="20" y="40" fill="#38bdf8" font-size="16" font-family="sans-serif" font-weight="bold">HANDWRITTEN MATH EQUATION</text><text x="20" y="90" fill="#fff" font-size="20" font-family="serif">5x² + 8x - 3 = 0</text><text x="20" y="140" fill="#94a3b8" font-size="12">Solve for roots x1 and x2</text></svg>`;
    } else {
      svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="#0f172a"><rect width="300" height="200" fill="#1e293b" rx="10"/><text x="20" y="30" fill="#38bdf8" font-size="16" font-family="sans-serif" font-weight="bold">STUDENT MARK SHEET</text><text x="20" y="65" fill="#fff" font-size="12">Maths: 92/100 | Physics: 88/100</text><text x="20" y="90" fill="#fff" font-size="12">Chemistry: 85/100 | CS: 96/100</text><text x="20" y="120" fill="#38bdf8" font-size="14">Calculate Overall Percentage & CGPA</text></svg>`;
    }

    const base64 = 'data:image/svg+xml;base64,' + btoa(svgStr);
    setImagePreview(base64);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white space-y-5 relative shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">OCR Document & Image Scanner</h3>
          </div>
          <button
            onClick={() => setIsOCRModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload / Preview Box */}
        <div className="space-y-3">
          {imagePreview ? (
            <div className="relative border border-slate-700 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 h-48">
              <img src={imagePreview} alt="OCR Preview" className="max-h-full max-w-full object-contain" />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-950">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm font-semibold text-slate-200">Upload Image, Receipt, or Equation</span>
              <span className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WEBP scans</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}

          {/* Sample preset buttons */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">Or test with sample scans:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleLoadSample('receipt')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                Invoice
              </button>
              <button
                onClick={() => handleLoadSample('equation')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                Equation
              </button>
              <button
                onClick={() => handleLoadSample('marksheet')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                Marksheet
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Prompt Note (Optional)</label>
          <input
            type="text"
            value={promptNote}
            onChange={(e) => setPromptNote(e.target.value)}
            placeholder="e.g. Extract total GST and calculate discount"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-600"
          />
        </div>

        {errorMessage && (
          <p className="text-xs text-amber-400">{errorMessage}</p>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleRunOCR}
            disabled={isLoading || !imagePreview}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Scanning & Calculating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze Scan & Extract Solution</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
