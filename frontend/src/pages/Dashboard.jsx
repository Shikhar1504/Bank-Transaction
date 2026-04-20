import { useEffect, useState } from "react";
import api from "../api/axios";

function shortId(value) {
  if (!value) return "-";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function statusBadge(status) {
  if (status === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        PROCESSING
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5" />
        FAILED
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
        COMPLETED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2.5 py-1 text-xs font-semibold text-slate-300">
      {status || "-"}
    </span>
  );
}

function directionBadge(direction) {
  if (direction === "IN") {
    return (
      <span className="inline-flex items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 h-9 w-9 text-emerald-400 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </span>
    );
  }
  if (direction === "OUT") {
    return (
      <span className="inline-flex items-center justify-center rounded-xl bg-slate-700/50 border border-slate-600/30 h-9 w-9 text-slate-400 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </span>
    );
  }
  return <span className="text-slate-600">-</span>;
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchAccounts = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await api.get("/accounts");
      const baseAccounts = response.data?.accounts || [];

      const withBalances = await Promise.all(
        baseAccounts.map(async (account) => {
          try {
            const balanceRes = await api.get(`/accounts/balance/${account._id}`);
            return { ...account, liveBalance: balanceRes.data?.balance ?? account.balance };
          } catch {
            return { ...account, liveBalance: account.balance };
          }
        }),
      );

      setAccounts(withBalances);

      if (withBalances.length === 0) {
        setRecentTransactions([]);
        return;
      }

      setLoadingRecent(true);
      const responseList = await Promise.all(
        withBalances.map((account) =>
          api
            .get(`/transactions/${account._id}?page=1&limit=5`)
            .then((result) => ({ accountId: account._id, data: result.data }))
            .catch(() => ({ accountId: account._id, data: { transactions: [] } })),
        ),
      );

      const merged = responseList
        .flatMap((entry) =>
          (entry.data?.transactions || []).map((tx) => ({ ...tx, accountId: entry.accountId })),
        )
        .sort((a, b) => {
          const aTime = new Date(a.transaction?.createdAt || a.createdAt || 0).getTime();
          const bTime = new Date(b.transaction?.createdAt || b.createdAt || 0).getTime();
          return bTime - aTime;
        })
        .slice(0, 5);

      setRecentTransactions(merged);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load accounts");
    } finally {
      setLoading(false);
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const primaryAccount = accounts[0] || null;

  const createAccount = async () => {
    setCreating(true);
    setError("");
    try {
      await api.post("/accounts");
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your wealth easily</p>
        </div>

        <button
          onClick={createAccount}
          disabled={creating || accounts.length >= 1}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all active:scale-95 ${
            accounts.length >= 1
              ? "border border-white/10 bg-white/5 text-slate-600 cursor-not-allowed shadow-none"
              : "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/25"
          }`}
        >
          {creating ? "Creating..." : accounts.length >= 1 ? "Limit Reached" : "Open Account"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-10 text-center animate-pulse">
          <div className="h-4 bg-white/5 rounded w-1/4 mx-auto mb-4" />
          <div className="h-8 bg-white/5 rounded w-1/2 mx-auto" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-panel relative overflow-hidden p-10 text-center h-64 flex flex-col justify-center items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent rounded-2xl" />
          <div className="relative z-10 space-y-4">
            <div className="h-16 w-16 bg-brand-500/10 border border-brand-500/20 rounded-2xl mx-auto flex items-center justify-center text-brand-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white font-display">No account yet</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Open a secure AegisLedger digital account in one click to get started.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Virtual Card */}
          {primaryAccount && (
            <div className="lg:col-span-1">
              <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-2xl shadow-black/40 isolate h-[240px] flex flex-col justify-between border border-white/8 transition-transform duration-500 hover:scale-[1.02]">
                {/* decorations */}
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl" />

                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Balance</p>
                    <p className="mt-2 text-4xl font-light tracking-tight text-white">
                      {formatMoney(primaryAccount.liveBalance)}
                    </p>
                  </div>
                  <div className="h-8 w-12 rounded-md bg-white/10 border border-white/10 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                <div className="relative z-10 mt-auto space-y-3">
                  <div
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => navigator.clipboard?.writeText(primaryAccount._id)}
                  >
                    <span className="font-mono text-sm tracking-[0.2em] text-slate-300 group-hover:text-white transition-colors">
                      **** **** **** {primaryAccount._id.slice(-4)}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-600 group-hover:text-brand-400 transition-colors opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={primaryAccount.status === "ACTIVE" ? "text-emerald-400" : "text-amber-400"}>
                      ● {primaryAccount.status === "ACTIVE" ? "ACTIVE" : "FROZEN"}
                    </span>
                    <span className="text-slate-500">VALID THRU 12/30</span>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="lg:col-span-2 glass-panel p-6 overflow-hidden flex flex-col h-[240px]">
            <div className="mb-4 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold text-white font-display">Recent Activity</h2>
              {loadingRecent ? (
                <span className="text-xs font-medium text-brand-400 animate-pulse bg-brand-500/10 px-2 py-1 rounded-full">Refreshing...</span>
              ) : (
                <span className="text-xs font-medium text-slate-600">Last 5 transfers</span>
              )}
            </div>

            {recentTransactions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">No activity to show</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-1">
                {recentTransactions.map((tx) => {
                  const amount = tx.displayAmount || tx.transaction?.amount || tx.amount || 0;
                  const status = tx.transaction?.status || tx.status || "-";
                  const createdAt = tx.transaction?.createdAt || tx.createdAt;
                  const isOut = tx.direction === "OUT";

                  return (
                    <div key={tx._id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3 min-w-0">
                        {directionBadge(tx.direction)}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {tx.transaction?.note || (isOut ? "Transfer Sent" : "Transfer Received")}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-slate-600">Ref: {shortId(tx.transaction?._id)}</span>
                            <span className="text-slate-700 text-xs">·</span>
                            <span className="text-xs text-slate-600">
                              {new Date(createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <span className={`text-sm font-bold ${isOut ? "text-slate-300" : "text-emerald-400"}`}>
                          {isOut ? "-" : "+"}{formatMoney(amount)}
                        </span>
                        {statusBadge(status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
