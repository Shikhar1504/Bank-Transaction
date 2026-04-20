import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import AccountActionButtons from "../components/admin/AccountActionButtons";
import TransactionDetailsModal from "../components/admin/TransactionDetailsModal";

const STATUS_OPTIONS = ["", "INITIATED", "PROCESSING", "COMPLETED", "FAILED"];

function formatMoney(value) {
  const amount = Number(value || 0);
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [accountStateMap, setAccountStateMap] = useState({});
  const [selectedTx, setSelectedTx] = useState(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    if (!actionNotice) return;

    const timeoutId = setTimeout(() => {
      setActionNotice(null);
    }, 3200);

    return () => clearTimeout(timeoutId);
  }, [actionNotice]);

  const loadTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const search = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status) {
        search.set("status", status);
      }

      const response = await api.get(
        `/admin/transactions?${search.toString()}`,
      );
      const list = response.data?.transactions || [];
      setTransactions(list);
      setTotal(response.data?.total || 0);

      const nextStateMap = {};
      list.forEach((tx) => {
        if (tx.fromAccount?._id && tx.fromAccount?.status) {
          nextStateMap[tx.fromAccount._id] = tx.fromAccount.status;
        }
        if (tx.toAccount?._id && tx.toAccount?.status) {
          nextStateMap[tx.toAccount._id] = tx.toAccount.status;
        }
      });
      setAccountStateMap(nextStateMap);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load admin transactions",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [status, page, limit]);

  const getAccountState = (account) => {
    if (!account?._id) return null;
    return accountStateMap[account._id] || account.status || "ACTIVE";
  };

  const runAccountAction = async (type, accountId) => {
    if (!accountId) return;

    setActionNotice(null);
    try {
      const endpoint = type === "freeze" ? "/admin/freeze" : "/admin/unfreeze";
      const response = await api.patch(`${endpoint}/${accountId}`);

      const successMessage =
        response.data?.message ||
        (type === "freeze"
          ? "Account frozen successfully"
          : "Account unfrozen successfully");

      setActionNotice({ type: "success", message: successMessage });
      setAccountStateMap((prev) => ({
        ...prev,
        [accountId]:
          response.data?.account?.status ||
          (type === "freeze" ? "FROZEN" : "ACTIVE"),
      }));
    } catch (err) {
      const apiMessage = err.response?.data?.message;

      setActionNotice({
        type: "error",
        message: apiMessage || "Action failed. Please try again",
      });

      if (apiMessage?.toLowerCase().includes("already frozen")) {
        setAccountStateMap((prev) => ({ ...prev, [accountId]: "FROZEN" }));
      }
      if (apiMessage?.toLowerCase().includes("not frozen")) {
        setAccountStateMap((prev) => ({ ...prev, [accountId]: "ACTIVE" }));
      }
    }
  };

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <section className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center rounded-lg bg-orange-500 h-8 w-8 text-white shadow-sm shadow-orange-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white font-display">
              System Transactions
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Global monitoring and transaction resolution
          </p>
        </div>

        <div className="relative z-10 w-full sm:w-64">
          <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Filter by Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2.5 pr-10 outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-semibold text-sm text-slate-200 shadow-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option || "ALL"}
                  value={option}
                  className="bg-slate-900 text-slate-100"
                >
                  {option || "All Statuses"}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0 text-rose-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {actionNotice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
            actionNotice.type === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/25 bg-rose-500/10 text-rose-300"
          }`}
        >
          {actionNotice.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      <div className="glass-panel-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Transfer Details</th>
                <th className="px-6 py-4">Status & Health</th>
                <th className="px-6 py-4">Failure Reason</th>
                <th className="px-6 py-4">Account Balances</th>
                <th className="px-6 py-4">Actions / Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span className="text-sm font-medium text-slate-500">
                        Loading master ledger...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-slate-300 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-base font-semibold text-slate-600">
                      No transactions recorded
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const fromState = getAccountState(tx.fromAccount);
                  const toState = getAccountState(tx.toAccount);
                  return (
                    <tr
                      key={tx._id}
                      className={`transition-colors hover:bg-white/[0.03] group ${tx.status === "FAILED" ? "bg-rose-500/5" : ""}`}
                    >
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-slate-100">
                            {tx.displayAmount || formatMoney(tx.amount)}
                          </span>
                          <span
                            className="text-xs font-mono text-slate-600 mt-1"
                            title={tx._id}
                          >
                            ID: {tx._id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-2">
                          <StatusBadge status={tx.status} />
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            <span>
                              {tx.status === "FAILED"
                                ? `Retries Used: ${tx.retryCount ?? 0}/3`
                                : `Retries: ${tx.retryCount ?? 0}/3`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top w-48">
                        <span
                          className={`text-xs ${tx.status === "FAILED" ? "text-rose-400 font-medium" : "text-slate-600"}`}
                        >
                          {tx.failureReason ||
                            (tx.status === "FAILED"
                              ? "Unknown Engine Failure"
                              : "N/A")}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-2 text-xs font-mono bg-white/[0.04] p-2.5 rounded-lg border border-white/8">
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-600">From Bal:</span>
                            <span className="font-semibold text-slate-300">
                              {tx.fromAccount?.balance ?? "-"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-600">To Bal:</span>
                            <span className="font-semibold text-slate-300">
                              {tx.toAccount?.balance ?? "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-2.5">
                          <div className="space-y-2">
                            <AccountActionButtons
                              label="Source Acc"
                              accountId={tx.fromAccount?._id}
                              accountStatus={fromState}
                              onAction={runAccountAction}
                            />
                            <AccountActionButtons
                              label="Dest Acc"
                              accountId={tx.toAccount?._id}
                              accountStatus={toState}
                              onAction={runAccountAction}
                            />
                          </div>
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="mt-3 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white hover:text-slate-900 transition-all shadow-md active:scale-95"
                          >
                            View TX Details
                          </button>
                        </div>
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
            Page <span className="text-slate-200 font-semibold">{page}</span> of{" "}
            <span className="text-slate-200 font-semibold">{totalPages}</span>
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

      <TransactionDetailsModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </section>
  );
}

export default AdminTransactions;
