import AnalysisCard from './AnalysisCard.jsx';

function LoadingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-linkedin-blue animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  );
}

export default function AnalysisResult({ sections, isStreaming }) {
  const hasSections = sections.length > 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      {hasSections && (
        <div className="flex items-center justify-between px-1 animate-fade-in">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-linkedin-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Wyniki analizy
            {!isStreaming && (
              <span className="text-gray-500 text-xs font-normal">({sections.length} sekcji)</span>
            )}
          </h2>
          {!isStreaming && (
            <button
              onClick={() => navigator.clipboard.writeText(
                sections.map(s => `# ${s.title}\n\n${s.content}`).join('\n\n')
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white
                bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Kopiuj wszystko
            </button>
          )}
        </div>
      )}

      {/* Kafelki sekcji */}
      {sections.map((section, i) => (
        <AnalysisCard
          key={`${section.title}-${i}`}
          title={section.title}
          content={section.content}
          index={i}
          defaultOpen={i === 0}
        />
      ))}

      {/* Loading indicator — tylko gdy trwa generowanie */}
      {isStreaming && (
        <div className="animate-fade-in flex items-center gap-3 px-5 py-4 border border-gray-800 rounded-2xl bg-gray-900/50">
          <LoadingDots />
          <span className="text-gray-500 text-sm">
            {hasSections ? 'Generowanie kolejnej sekcji...' : 'Analizowanie profilu...'}
          </span>
        </div>
      )}
    </div>
  );
}
