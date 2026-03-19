import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SECTION_ICONS = {
  'ogólna':    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  'nagłówek':  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />,
  'o mnie':    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  'doświadcz': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  'umiejętn':  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
  'wykształc': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />,
  'prioryte':  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />,
};

function getIcon(title) {
  const lower = title.toLowerCase();
  for (const [key, path] of Object.entries(SECTION_ICONS)) {
    if (lower.includes(key)) return path;
  }
  return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
}

// Extract score like "7/10" or "8/10" from text
function extractScore(text) {
  const match = text.match(/(\d{1,2})\s*\/\s*10/);
  return match ? parseInt(match[1]) : null;
}

export default function AnalysisCard({ title, content, index, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const score = extractScore(title + ' ' + content);

  return (
    <div
      className="animate-fade-in-up border border-gray-800 rounded-2xl overflow-hidden bg-gray-900/70 hover:border-gray-700 transition-colors duration-200"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Card header — clickable */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left group"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-linkedin-blue/15 flex items-center justify-center text-linkedin-blue">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getIcon(title)}
            </svg>
          </div>
          {/* Title */}
          <span className="text-white font-medium text-sm truncate group-hover:text-linkedin-blue-light transition-colors duration-150">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Score badge */}
          {score !== null && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              score >= 8 ? 'bg-green-500/15 text-green-400' :
              score >= 6 ? 'bg-yellow-500/15 text-yellow-400' :
                           'bg-red-500/15 text-red-400'
            }`}>
              {score}/10
            </span>
          )}
          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-800/60">
          <div className="prose-dark text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
