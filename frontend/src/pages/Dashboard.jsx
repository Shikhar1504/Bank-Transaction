import { useEffect, useState } from "react";
import api from "../api/axios";

function shortId(value) {
  if (!value) return "-";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function statusBadge(status) {
  if (status === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        PROCESSING
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
        FAILED
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
        COMPLETED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {status || "-"}
    </span>
  );
}

function directionBadge(direction) {
  if (direction === "IN") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
        IN
      </span>
    );
  }

  if (direction === "OUT") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
        OUT
      </span>
    );
  }

  return <span className="text-slate-500">-</span>;
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
            const balanceRes = await api.get(
              `/accounts/balance/${account._id}`,
            );
            return {
              ...account,
              liveBalance: balanceRes.data?.balance ?? account.balance,
            };
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
            .catch(() => ({
              accountId: account._id,
              data: { transactions: [] },
            })),
        ),
      );

      const merged = responseList
        .flatMap((entry) =>
          (entry.data?.transactions || []).map((tx) => ({
            ...tx,
            accountId: entry.accountId,
          })),
        )
        .sort((a, b) => {
          const aTime = new Date(
            a.transaction?.createdAt || a.createdAt || 0,
          ).getTime();
          const bTime = new Date(
            b.transaction?.createdAt || b.createdAt || 0,
          ).getTime();
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

  const lastTransactionAt =
    recentTransactions[0]?.transaction?.createdAt ||
    recentTransactions[0]?.createdAt ||
    null;
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
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Your account overview</p>
        </div>

        <button
          onClick={createAccount}
          disabled={creating}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create Account"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading accounts...
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No account found. Click "Create Account" to generate one.
        </div>
      ) : (
        <>
          {primaryAccount && (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Available Balance
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <p className="text-3xl font-semibold text-slate-900">
                  {formatMoney(primaryAccount.liveBalance)}
                </p>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    primaryAccount.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {primaryAccount.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">
                  Account Number:
                </span>
                <span>{shortId(primaryAccount._id)}</span>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard?.writeText(primaryAccount._id)
                  }
                  className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Copy
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Last activity:{" "}
                {lastTransactionAt
                  ? new Date(lastTransactionAt).toLocaleString()
                  : "No transaction yet"}
              </p>
            </article>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Transactions
              </h2>
              {loadingRecent && (
                <span className="text-xs text-slate-500">Refreshing...</span>
              )}
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-sm text-slate-500">
                No recent transactions found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Account</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Direction</th>
                      <th className="px-3 py-2">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTransactions.map((tx) => {
                      const amount =
                        tx.displayAmount ||
                        tx.transaction?.amount ||
                        tx.amount ||
                        0;
                      const status = tx.transaction?.status || tx.status || "-";
                      const createdAt =
                        tx.transaction?.createdAt || tx.createdAt;
                      return (
                        <tr key={tx._id}>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {shortId(tx.accountId)}
                          </td>
                          <td className="px-3 py-2">{amount}</td>
                          <td className="px-3 py-2">{statusBadge(status)}</td>
                          <td className="px-3 py-2">
                            {directionBadge(tx.direction)}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {new Date(createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
