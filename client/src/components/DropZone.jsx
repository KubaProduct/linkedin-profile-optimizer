import { useState, useRef, useCallback } from 'react';

export default function DropZone({ onFileSelect, isAnalyzing }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return 'Nie wybrano pliku';
    if (file.type !== 'application/pdf') return 'Tylko pliki PDF są dozwolone';
    if (file.size > 10 * 1024 * 1024) return 'Plik jest za duży (max 10 MB)';
    return null;
  };

  const handleFile = useCallback((file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    setError('');
    setSelectedFile(file);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-9 text-center
          transition-all duration-300 cursor-pointer group
          ${isDragging
            ? 'border-linkedin-blue bg-linkedin-blue/10 scale-[1.02]'
            : selectedFile
              ? 'border-green-500/50 bg-green-500/5 hover:border-green-400'
              : 'border-gray-700 bg-gray-900/50 hover:border-linkedin-blue hover:bg-gray-900'
          }
          ${isAnalyzing ? 'cursor-not-allowed opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="hidden"
          disabled={isAnalyzing}
        />

        {/* Icon */}
        <div className={`
          mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3
          transition-all duration-300
          ${selectedFile
            ? 'bg-green-500/20 text-green-400'
            : isDragging
              ? 'bg-linkedin-blue/20 text-linkedin-blue'
              : 'bg-gray-800 text-gray-400 group-hover:bg-linkedin-blue/10 group-hover:text-linkedin-blue'
          }
        `}>
          {selectedFile ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>

        {/* Text */}
        {selectedFile ? (
          <div className="animate-fade-in">
            <p className="text-green-400 font-semibold text-lg mb-1">Plik wybrany</p>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <svg className="w-4 h-4 text-linkedin-blue" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1"/>
              </svg>
              <span className="text-sm font-medium text-white">{selectedFile.name}</span>
              <span className="text-xs">({formatFileSize(selectedFile.size)})</span>
            </div>
            {!isAnalyzing && (
              <p className="text-xs text-gray-500 mt-2">Kliknij, aby zmienić plik</p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-gray-200 font-semibold text-lg mb-1">
              {isDragging ? 'Upuść plik tutaj' : 'Przeciągnij i upuść plik PDF'}
            </p>
            <p className="text-gray-500 text-sm">lub kliknij, aby wybrać plik</p>
            <p className="text-gray-600 text-xs mt-3">Obsługiwane formaty: PDF · Maksymalny rozmiar: 10 MB</p>
          </div>
        )}

        {/* Drag overlay glow */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-linkedin-blue/5 pointer-events-none" />
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
