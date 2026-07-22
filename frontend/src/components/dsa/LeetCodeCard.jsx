import { useState } from "react";

export default function LeetCodeCard({ data, onConnect, connecting }) {
  const [username, setUsername] = useState("");

  if (!data) {
    return (
      <div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}>
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.535.553-1.386.038-1.901l-2.609-2.636a5.055 5.055 0 00-2.445-1.337l2.467-2.503c.516-.515.498-1.366-.037-1.901-.535-.535-1.386-.553-1.901-.038l-10.1 10.101c-.984.984-1.494 2.296-1.494 3.668 0 1.371.51 2.683 1.494 3.667l4.347 4.347c.984.984 2.296 1.494 3.667 1.494 1.372 0 2.683-.51 3.667-1.494l2.609-2.636c.515-.515.497-1.366-.038-1.901-.535-.535-1.386-.553-1.9-.038z"/>
            </svg>
          </div>
          <h3 className="text-[var(--text-primary)] font-bold text-sm">LeetCode</h3>
        </div>

        <p className="text-[var(--text-muted)] text-xs">Connect your LeetCode account to see your stats.</p>

        <div className="flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onConnect?.(username); }}
            placeholder="Your LeetCode username"
            className="input-field flex-1 text-xs"
          />
          <button
            onClick={() => onConnect?.(username)}
            disabled={connecting || !username.trim()}
            className="px-3 py-2 rounded-xl text-white font-bold text-xs tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
          >
            {connecting ? "..." : "Connect"}
          </button>
        </div>
      </div>
    );
  }

  const totalQ = data.totalEasy + data.totalMedium + data.totalHard;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}>
          {data.avatar ? (
            <img src={data.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.535.553-1.386.038-1.901l-2.609-2.636a5.055 5.055 0 00-2.445-1.337l2.467-2.503c.516-.515.498-1.366-.037-1.901-.535-.535-1.386-.553-1.901-.038l-10.1 10.101c-.984.984-1.494 2.296-1.494 3.668 0 1.371.51 2.683 1.494 3.667l4.347 4.347c.984.984 2.296 1.494 3.667 1.494 1.372 0 2.683-.51 3.667-1.494l2.609-2.636c.515-.515.497-1.366-.038-1.901-.535-.535-1.386-.553-1.9-.038z"/>
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[var(--text-primary)] font-bold text-sm truncate">@{data.username}</p>
          <p className="text-[var(--text-muted)] text-[10px]">{data.problemsSolved} / {totalQ} solved</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: "rgba(34,197,94,0.12)", border: "0.5px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
          Connected
        </span>
      </div>

      {/* Difficulty bars */}
      <div className="flex flex-col gap-2">
        <DiffBar label="Easy"   solved={data.easySolved}   total={data.totalEasy}   color="#22c55e" />
        <DiffBar label="Medium" solved={data.mediumSolved} total={data.totalMedium} color="#eab308" />
        <DiffBar label="Hard"   solved={data.hardSolved}   total={data.totalHard}   color="#ef4444" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Rating" value={data.contestRating ? data.contestRating.toString() : "—"} color="text-cyan-400" />
        <MiniStat label="Acceptance" value={data.acceptanceRate ? `${data.acceptanceRate}%` : "—"} color="text-green-400" />
        <MiniStat label="Contests" value={data.attendedContestsCount ? data.attendedContestsCount.toString() : "—"} color="text-purple-400" />
      </div>

      {/* Badges */}
      {data.badges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.badges.map((b, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(234,179,8,0.1)", border: "0.5px solid rgba(234,179,8,0.25)", color: "#eab308" }}>
              {b.name}
            </span>
          ))}
        </div>
      )}

      {/* Recent contests */}
      {data.recentContests?.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Recent Contests</p>
          {data.recentContests.slice(0, 3).map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] truncate flex-1">{c.title}</span>
              <span className="text-[var(--text-primary)] font-semibold ml-2">{c.rating}</span>
            </div>
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
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
      <span className="text-[11px] text-[var(--text-primary)] font-bold w-14 text-right">{solved}<span className="text-[var(--text-muted)] font-normal">/{total}</span></span>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}>
      <p className={`text-sm font-extrabold ${color}`}>{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
