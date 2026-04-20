import { useEffect, useState } from "react";
import api from "../api/axios";

function formatMoney(value) {
  const amount = Number(value || 0);
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

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
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Loading stats...
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Stats</h1>
        <p className="text-sm text-slate-500">System-wide metrics</p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {stats.totalUsers ?? 0}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Transactions</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {stats.totalTransactions ?? 0}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Failed Transactions</p>
          <p className="mt-1 text-2xl font-semibold text-rose-700">
            {stats.failedTransactions ?? 0}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Volume</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {formatMoney(stats.totalVolume)}
          </p>
        </article>
      </div>
    </section>
  );
}

export default AdminStats;
