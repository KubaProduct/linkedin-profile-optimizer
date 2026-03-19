import { useState, useCallback } from 'react';
import DropZone from './components/DropZone.jsx';
import Instructions from './components/Instructions.jsx';
import AnalysisResult from './components/AnalysisResult.jsx';

const API_URL = '/api/analyze';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sections, setSections] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [userGoal, setUserGoal] = useState('');

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    setError('');
    setShowResult(false);
    setSections([]);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Wybierz plik PDF przed analizą');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setSections([]);
    setShowResult(true);

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    if (userGoal.trim()) {
      formData.append('goal', userGoal.trim());
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Błąd serwera: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'section') {
              setSections((prev) => [...prev, { title: data.title, content: data.content }]);
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          } catch (parseErr) {
            if (parseErr.message !== 'Unexpected end of JSON input') {
              console.error('Błąd parsowania SSE:', parseErr);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Wystąpił nieoczekiwany błąd');
      setShowResult(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed inset-0 bg-gradient-to-br from-linkedin-blue/5 via-transparent to-purple-900/5 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linkedin-blue/10
              border border-linkedin-blue/20 text-linkedin-blue text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Powered by Claude AI
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            LinkedIn Profile{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-linkedin-blue to-linkedin-blue-light">
              Optimizer
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Zaniedbałeś swój profil na LinkedIn a nadal chcesz być sexy dla rekruterów?
            <br />
            Nie ma problemu! Wrzuć tutaj swój profil LinkedIn w formacie PDF i otrzymaj
            spersonalizowane sugestie ulepszeń oparte na analizie AI.
          </p>
        </header>

        {/* Main content */}
        <div className="space-y-6">
          {!showResult && (
            <>
              {/* Instructions */}
              <Instructions />

              {/* Upload section */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-linkedin-blue text-white text-xs flex items-center justify-center font-bold">2</span>
                  Prześlij swój profil
                </h2>
                <DropZone onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} />
              </div>

              {/* Goal textarea */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-5 py-4 space-y-2 animate-fade-in">
                <h2 className="text-gray-300 text-sm font-semibold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-linkedin-blue text-white text-xs flex items-center justify-center font-bold">3</span>
                  📝 Opisz swój cel <span className="text-gray-500 font-normal">(opcjonalnie)</span>
                </h2>
                <textarea
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  rows={2}
                  placeholder="Np. Chcę być postrzegany jako AI Product Manager, szukam pracy w startupach, chcę podkreślić doświadczenie w Agile..."
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-200
                    placeholder:text-gray-600 focus:outline-none focus:border-linkedin-blue/60 focus:bg-gray-800
                    resize-none transition-colors duration-200"
                />
              </div>

              {/* Analyze button + error */}
              <div className="space-y-3">
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-fade-in">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                  className={`
                    w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-200
                    flex items-center justify-center gap-2 text-sm
                    ${selectedFile && !isAnalyzing
                      ? 'bg-linkedin-blue hover:bg-linkedin-blue-dark active:scale-[0.98] shadow-lg shadow-linkedin-blue/20 hover:shadow-linkedin-blue/30'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analizuję profil...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analizuj profil
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Result */}
          {showResult && <AnalysisResult sections={sections} isStreaming={isAnalyzing} />}
        </div>

        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>Zbudowane z użyciem Claude API · Anthropic</p>
        </footer>
      </div>
    </div>
  );
}
