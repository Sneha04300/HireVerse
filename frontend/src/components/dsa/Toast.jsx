import { useState, useEffect, useCallback } from "react";

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return { toasts, addToast };
}

const TYPE_STYLES = {
  success: {
    icon: (
      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    border: "0.5px solid rgba(34,197,94,0.3)",
  },
  error: {
    icon: (
      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    border: "0.5px solid rgba(239,68,68,0.3)",
  },
};

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const s = TYPE_STYLES[t.type] || TYPE_STYLES.success;
        return (
          <div
            key={t.id}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm text-[var(--text-primary)] font-medium animate-fade-in"
            style={{ background: "var(--bg-card)", border: s.border }}
          >
            {s.icon}
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
