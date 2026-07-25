import React, { useState } from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { parseQueryOffline } from '../engine/offlineParser';
import { Sparkles, Mic, Camera, ArrowRight, Loader2, Zap, HelpCircle } from 'lucide-react';

export const AIOmnibox: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { setActiveResult, addToHistory, isOffline, setIsOCRModalOpen, setActiveTab } = useCalculatorStore();

  const samplePrompts = [
    'Calculate GST for ₹25,000 at 18%',
    'EMI for ₹20 lakh for 20 years at 8.5%',
    'Solve 5x² + 8x - 3 = 0',
    'Convert 35°C to Fahrenheit',
    'How much paint is needed for a 12×15 room?',
    'BMI for 72 kg and 175 cm',
    'Estimate construction cost for a 1,500 sq ft house',
    'Ohm\'s law for 230V and 5A'
  ];

  const handleCalculate = async (inputQuery?: string) => {
    const q = inputQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const offlineResult = parseQueryOffline(q);
      if (offlineResult) {
        setActiveResult(offlineResult.result);
        addToHistory({
          query: q,
          formulaName: offlineResult.formulaName,
          category: offlineResult.category,
          inputs: offlineResult.extractedParameters,
          result: offlineResult.result
        });
        if (offlineResult.isMultiStep) {
          setActiveTab('multistep');
        }
      } else {
        setErrorMessage('Could not determine query formula. Try selecting from the Formula Library or typing key numbers (e.g. "EMI 10 lakhs 10 years 8%").');
      }
    } catch (err: any) {
      console.warn('Calculation failed:', err);
      setErrorMessage('Unable to process prompt. Please try typing key numbers and formula names (e.g., "EMI 10 lakhs 10 years 8%").');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleCalculate(transcript);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        
        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            Automatic Intent & Formula Detection Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            What would you like to calculate today?
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Type naturally across math, GST, home loans, BMI, physics, civil construction, code subnets, or paint estimation. No complex menus needed.
          </p>
        </div>

        {/* Omnibox Bar */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center bg-slate-950 border-2 border-slate-700 hover:border-blue-500/50 focus-within:border-blue-600 rounded-2xl shadow-2xl transition duration-200 p-2">
            
            <Sparkles className="w-6 h-6 text-sky-400 ml-3 shrink-0" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              placeholder='e.g., "Calculate GST for ₹25,000" or "EMI for 15 lakh for 15 years"'
              className="w-full bg-transparent px-3 py-3 text-white placeholder-slate-500 focus:outline-none text-base"
            />

            <div className="flex items-center gap-1.5 shrink-0 pr-1">
              {/* Voice Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2.5 rounded-xl transition ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* OCR Button */}
              <button
                type="button"
                onClick={() => setIsOCRModalOpen(true)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Scan document or bill"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => handleCalculate()}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Calculate</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Try asking or click a sample calculation:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(prompt);
                  handleCalculate(prompt);
                }}
                className="text-xs bg-slate-800/80 hover:bg-slate-700 hover:text-sky-300 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/60 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
