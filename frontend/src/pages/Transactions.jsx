import { useEffect, useState } from "react";
import api from "../api/axios";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function statusBadge(status) {
  if (status === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300 whitespace-nowrap">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        PROCESSING
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300 whitespace-nowrap">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5" />
        FAILED
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 whitespace-nowrap">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
        COMPLETED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2.5 py-1 text-xs font-semibold text-slate-300 whitespace-nowrap">
      {status}
    </span>
  );
}

function directionBadge(direction) {
  if (direction === "IN") {
    return (
      <span className="inline-flex items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 h-8 w-8 text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </span>
    );
  }
  if (direction === "OUT") {
    return (
      <span className="inline-flex items-center justify-center rounded-xl bg-slate-700/50 border border-slate-600/30 h-8 w-8 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </span>
    );
  }
  return <span className="text-slate-600">-</span>;
}

function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await api.get("/accounts");
        const list = response.data?.accounts || [];
        setAccounts(list);
        if (list.length > 0) {
          setSelectedAccount(list[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load accounts");
      }
    };

    loadAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;

    const loadTransactions = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(
          `/transactions/${selectedAccount}?page=${page}&limit=${limit}`,
        );
        setTransactions(response.data?.transactions || []);
        setTotal(response.data?.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [selectedAccount, page, limit]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <section className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">
          Transaction History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track and monitor your incoming and outgoing transfers
        </p>
      </div>

      <div className="relative z-10 w-full sm:w-80">
        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Select Account
        </label>
        <div className="relative">
          <select
            value={selectedAccount}
            onChange={(event) => {
              setSelectedAccount(event.target.value);
              setPage(1);
            }}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2.5 pr-10 outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-mono text-sm text-slate-200 shadow-sm"
          >
            {accounts.map((account) => (
              <option key={account._id} value={account._id} className="bg-slate-900 text-slate-100">
                {account._id}
              </option>
            ))}
            {accounts.length === 0 && <option value="">No Accounts Found</option>}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {error && (
      <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{error}</span>
      </div>
    )}

    <div className="flex items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/10 px-4 py-3 text-xs text-brand-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p><strong>Lifecycle:</strong> INITIATED → PROCESSING → COMPLETED/FAILED. Retry and failure details appear when returned by API.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Direction</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Retries Used</th>
                <th className="px-6 py-4 whitespace-nowrap">Created At</th>
                <th className="px-6 py-4 w-64">Failure Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span className="text-sm font-medium text-slate-500">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-base font-semibold text-slate-500">No transactions found</p>
                    <p className="text-sm text-slate-600 mt-1">This account hasn't made any transfers yet.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const amount = tx.displayAmount || tx.transaction?.amount || tx.amount || 0;
                  const status = tx.transaction?.status || tx.status || "-";
                  const createdAt = tx.transaction?.createdAt || tx.createdAt;
                  const retryCount = tx.transaction?.retryCount ?? tx.retryCount;
                  const failureReason =
                    tx.transaction?.failureReason ||
                    tx.failureReason ||
                    (status === "FAILED" ? "No failure reason provided" : "-");
                    
                  return (
                    <tr key={tx._id} className="transition-colors hover:bg-white/[0.03] group">
                      <td className="px-6 py-4 align-middle">
                        {directionBadge(tx.direction)}
                      </td>
                      <td className="px-6 py-4 align-middle whitespace-nowrap">
                        <span className={`text-base font-bold ${tx.direction === "IN" ? "text-emerald-400" : "text-slate-200"}`}>
                          {tx.direction === "OUT" ? "-" : "+"} {amount}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 block mt-0.5">₹ INR</span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        {statusBadge(status)}
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        {retryCount !== undefined && retryCount !== null ? (
                          <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-400">
                            {retryCount} / 3
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(createdAt)}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className={`text-xs ${failureReason !== "-" ? "text-rose-400 font-medium" : "text-slate-600"}`}>
                          {failureReason}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
          <p className="text-sm font-medium text-slate-500">
            Page <span className="text-slate-200 font-semibold">{page}</span> of <span className="text-slate-200 font-semibold">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Transactions;
