import { useState, useRef } from "react";

const IconUpload = () => (
  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const IconFile = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconX = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function ResumeUpload({ file, onFileChange, onAnalyze, analyzing }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  const handleFile = (e) => {
    const picked = e.target.files[0];
    if (picked) onFileChange(picked);
  };

  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center gap-5"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current.click()}
        className="w-full flex flex-col items-center gap-4 py-10 rounded-xl transition-all cursor-pointer"
        style={{
          border: `1.5px dashed ${dragging ? "#06B6D4" : file ? "#7C3AED" : "var(--border)"}`,
          background: dragging ? "rgba(6,182,212,0.05)" : file ? "rgba(124,58,237,0.05)" : "transparent",
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}
        >
          <IconUpload />
        </div>

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-[var(--text-primary)] font-semibold text-base">{file.name}</p>
            <p className="text-[var(--text-muted)] text-sm">{(file.size / 1024).toFixed(0)} KB • Ready to analyze</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p className="text-[var(--text-primary)] font-bold text-lg">Drop your resume here</p>
            <p className="text-[var(--text-muted)] text-sm">PDF, DOCX up to 5MB</p>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFile} />

      {/* Actions */}
      <div className="flex items-center gap-3 w-full max-w-sm flex-col">
        {!file ? (
          <button
            onClick={() => inputRef.current.click()}
            className="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
          >
            Choose File
          </button>
        ) : (
          <>
            <button
              onClick={onAnalyze}
              disabled={analyzing}
              className="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
            >
              {analyzing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing…
                </>
              ) : "Analyze Resume"}
            </button>
            <button
              onClick={() => onFileChange(null)}
              className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              <IconX /> Remove file
            </button>
          </>
        )}
      </div>

      {/* Currently analyzed */}
      {file && !analyzing && (
        <p className="text-[var(--text-tertiary)] text-xs text-center">
          Currently analyzed: <span className="text-[var(--text-secondary)] font-semibold">{file.name}</span>
        </p>
      )}
    </div>
  );
}
