import { useEffect, useState } from "react";
import api from "../api/axios";

function formatMoney(value) {
  const amount = Number(value || 0);
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

const STAT_CARDS = [
  {
    key: "totalUsers",
    label: "Total Users",
    color: "from-brand-500 to-violet-500",
    glow: "group-hover:shadow-brand-500/10",
    badge: { text: "Active", color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25" },
    format: (v) => v?.toLocaleString() ?? "0",
  },
  {
    key: "totalTransactions",
    label: "Total Transactions",
    color: "from-sky-500 to-blue-500",
    glow: "group-hover:shadow-sky-500/10",
    badge: null,
    format: (v) => v?.toLocaleString() ?? "0",
  },
  {
    key: "failedTransactions",
    label: "Failed Transactions",
    color: "from-rose-500 to-pink-500",
    glow: "group-hover:shadow-rose-500/10",
    badge: null,
    valueColor: "text-rose-400",
    format: (v) => v?.toLocaleString() ?? "0",
  },
  {
    key: "totalVolume",
    label: "Total Trading Volume",
    color: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-emerald-500/10",
    badge: null,
    valueColor: "text-emerald-400",
    format: (v) => formatMoney(v),
  },
];

function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    failedTransactions: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/admin/stats");
        setStats(response.data?.stats || {});
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel-premium p-12 text-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto block mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading platform analytics...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 h-10 w-10 text-white shadow-lg shadow-teal-500/25 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Platform Analytics</h1>
          <p className="text-sm text-slate-500">Real-time insights and system-wide performance metrics</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <article
            key={card.key}
            className={`group glass-panel-premium p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${card.glow}`}
          >
            {/* Glow orb */}
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500`} />

            {/* Icon dot */}
            <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br ${card.color} mb-4 shadow-sm`}>
              <span className="h-2 w-2 rounded-full bg-white/80" />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{card.label}</p>
            <p className={`text-4xl font-bold font-display truncate ${card.valueColor || "text-white"}`}>
              {card.format(stats[card.key])}
            </p>
            {card.badge && (
              <span className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${card.badge.color}`}>
                {card.badge.text}
              </span>
            )}
            {card.key === "failedTransactions" && stats.failedTransactions > 0 && (
              <span className="mt-2 inline-flex items-center rounded-full border border-rose-500/25 bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                Requires Attention
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminStats;
