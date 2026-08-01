import { useState } from "react";

export default function LeetCodeCard({ data, onConnect, connecting }) {
  const [username, setUsername] = useState("");

  if (!data) {
    return (
      <div className="dsa-card p-4 flex flex-col gap-3 h-full">
        <p className="section-label text-[var(--text-muted)]">Profile Summary</p>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.535.553-1.386.038-1.901l-2.609-2.636a5.055 5.055 0 00-2.445-1.337l2.467-2.503c.516-.515.498-1.366-.037-1.901-.535-.535-1.386-.553-1.901-.038l-10.1 10.101c-.984.984-1.494 2.296-1.494 3.668 0 1.371.51 2.683 1.494 3.667l4.347 4.347c.984.984 2.296 1.494 3.667 1.494 1.372 0 2.683-.51 3.667-1.494l2.609-2.636c.515-.515.497-1.366-.038-1.901-.535-.535-1.386-.553-1.9-.038z"/>
            </svg>
          </div>
          <h3 className="text-[13px] font-bold text-[var(--text-primary)]">LeetCode</h3>
        </div>

        <p className="text-xs text-[var(--text-muted)]">Connect your LeetCode account to see your stats.</p>

        <div className="flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onConnect?.(username); }}
            placeholder="Your LeetCode username"
            className="input-field flex-1 text-xs"
            style={{ paddingLeft: "0.85rem" }}
          />
          <button
            onClick={() => onConnect?.(username)}
            disabled={connecting || !username.trim()}
            className="px-3.5 text-white font-bold text-xs tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50 btn-gradient"
          >
            {connecting ? "..." : "Connect"}
          </button>
        </div>
      </div>
    );
  }

  const totalQ = data.totalEasy + data.totalMedium + data.totalHard;

  return (
    <div className="dsa-card p-4 flex flex-col gap-3 h-full">
      <p className="section-label text-[var(--text-muted)]">Profile Summary</p>

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          {data.avatar ? (
            <img src={data.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.535.553-1.386.038-1.901l-2.609-2.636a5.055 5.055 0 00-2.445-1.337l2.467-2.503c.516-.515.498-1.366-.037-1.901-.535-.535-1.386-.553-1.901-.038l-10.1 10.101c-.984.984-1.494 2.296-1.494 3.668 0 1.371.51 2.683 1.494 3.667l4.347 4.347c.984.984 2.296 1.494 3.667 1.494 1.372 0 2.683-.51 3.667-1.494l2.609-2.636c.515-.515.497-1.366-.038-1.901-.535-.535-1.386-.553-1.9-.038z"/>
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">@{data.username}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{data.problemsSolved} / {totalQ} solved</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0" style={{ background: "var(--badge-green-bg)", border: "1px solid var(--badge-green-border)", color: "var(--badge-green-text)" }}>
          Connected
        </span>
      </div>

      {/* Difficulty bars */}
      <div className="flex flex-col gap-1.5">
        <DiffBar label="Easy"   solved={data.easySolved}   total={data.totalEasy}   color="#22c55e" />
        <DiffBar label="Medium" solved={data.mediumSolved} total={data.totalMedium} color="#eab308" />
        <DiffBar label="Hard"   solved={data.hardSolved}   total={data.totalHard}   color="#ef4444" />
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Acceptance" value={data.acceptanceRate ? `${data.acceptanceRate}%` : "—"} color="#22C55E" />
        <MiniStat label="Rating" value={data.contestRating ? data.contestRating.toString() : "—"} color="var(--brand-secondary)" />
        <MiniStat label="Contests" value={data.attendedContestsCount ? data.attendedContestsCount.toString() : "—"} color="var(--brand-secondary)" />
      </div>

      {/* Badges */}
      {data.badges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.badges.map((b, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}>
              {b.name}
            </span>
          ))}
        </div>
      )}

      {/* Last sync */}
      {data.lastSync && (
        <p className="text-[10px] text-[var(--text-muted)]">
          Last sync {new Date(data.lastSync).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}

function DiffBar({ label, solved, total, color }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[var(--text-tertiary)] w-10 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1 rounded-full" style={{ background: "var(--border)" }}>
        <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
      <span className="text-[11px] text-[var(--text-primary)] font-bold w-14 text-right">{solved}<span className="text-[var(--text-muted)] font-normal">/{total}</span></span>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
      <p className="text-sm font-extrabold" style={{ color }}>{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
