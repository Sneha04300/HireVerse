const IconSparkle = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zM19 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
  </svg>
);

const IconUser = () => (
  <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export function AIAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-brand-subtle"
    >
      <IconSparkle />
    </div>
  );
}

export default function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <div className="flex items-start justify-end gap-3 animate-fade-in">
        <div
          className="max-w-[75%] rounded-2xl rounded-tr-sm px-5 py-3.5 text-white text-sm font-medium shadow-lg-custom bg-gradient-brand-subtle"
        >
          {message.text}
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border-focus)" }}
        >
          <IconUser />
        </div>
      </div>
    );
  }

  // role === "ai" (plain text bubble)
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <AIAvatar />
      <div
        className="max-w-[75%] rounded-2xl rounded-tl-sm px-5 py-3.5 text-[var(--text-primary)] text-sm leading-relaxed"
        style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}
      >
        {message.text}
      </div>
    </div>
  );
}
