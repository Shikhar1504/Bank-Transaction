import { useEffect, useState } from "react";
import api from "../api/axios";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function statusBadge(status) {
  if (status === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        PROCESSING
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
        FAILED
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
        COMPLETED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      {status}
    </span>
  );
}

function directionBadge(direction) {
  if (direction === "IN") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
        IN
      </span>
    );
  }

  if (direction === "OUT") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
        OUT
      </span>
    );
  }

  return <span className="text-slate-500">-</span>;
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
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Transaction History
        </h1>
        <p className="text-sm text-slate-500">
          Track incoming and outgoing transfers
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Account
        </label>
        <select
          value={selectedAccount}
          onChange={(event) => {
            setSelectedAccount(event.target.value);
            setPage(1);
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 sm:w-96"
        >
          {accounts.map((account) => (
            <option key={account._id} value={account._id}>
              {account._id}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
        Lifecycle: INITIATED → PROCESSING → COMPLETED/FAILED. Retry and failure
        details appear when returned by API.
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Retries Used</th>
              <th className="px-4 py-3">Failure Reason</th>
              <th className="px-4 py-3">Direction</th>
              <th className="px-4 py-3">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const amount =
                  tx.displayAmount || tx.transaction?.amount || tx.amount || 0;
                const status = tx.transaction?.status || tx.status || "-";
                const createdAt = tx.transaction?.createdAt || tx.createdAt;
                const retryCount = tx.transaction?.retryCount ?? tx.retryCount;
                const failureReason =
                  tx.transaction?.failureReason ||
                  tx.failureReason ||
                  (status === "FAILED"
                    ? "No failure reason in this history response"
                    : "-");
                return (
                  <tr key={tx._id}>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {amount}
                    </td>
                    <td className="px-4 py-3">{statusBadge(status)}</td>
                    <td className="px-4 py-3">
                      {retryCount !== undefined && retryCount !== null
                        ? `${retryCount} of 3`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {failureReason}
                    </td>
                    <td className="px-4 py-3">
                      {directionBadge(tx.direction)}
                    </td>
                    <td className="px-4 py-3">{formatDate(createdAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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

export default Transactions;
