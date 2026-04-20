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
      if (Object.keys(nextStateMap).length > 0) {
        setAccountStateMap((prev) => ({ ...prev, ...nextStateMap }));
      }
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
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Admin Transactions
        </h1>
        <p className="text-sm text-slate-500">
          Filter and review all transactions
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option || "ALL"} value={option}>
                {option || "All"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {actionNotice && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            actionNotice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {actionNotice.message}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Retry Count</th>
              <th className="px-4 py-3">Failure Reason</th>
              <th className="px-4 py-3">From Balance (Post-Tx)</th>
              <th className="px-4 py-3">To Balance (Post-Tx)</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const fromState = getAccountState(tx.fromAccount);
                const toState = getAccountState(tx.toAccount);
                return (
                  <tr
                    key={tx._id}
                    className={tx.status === "FAILED" ? "bg-rose-50/40" : ""}
                  >
                    <td className="px-4 py-3">
                      {tx.displayAmount || formatMoney(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3">
                      {tx.status === "FAILED"
                        ? `Retries Used: ${tx.retryCount ?? 0} of 3`
                        : (tx.retryCount ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {tx.failureReason ||
                        (tx.status === "FAILED" ? "Unknown" : "-")}
                    </td>
                    <td className="px-4 py-3">
                      {tx.fromAccount?.balance ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {tx.toAccount?.balance ?? "-"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-3">
                        <AccountActionButtons
                          label="From Account"
                          accountId={tx.fromAccount?._id}
                          accountStatus={fromState}
                          onAction={runAccountAction}
                        />
                        <AccountActionButtons
                          label="To Account"
                          accountId={tx.toAccount?._id}
                          accountStatus={toState}
                          onAction={runAccountAction}
                        />
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View Details
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

      <TransactionDetailsModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdminTransactions;
