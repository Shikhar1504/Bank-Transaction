import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNotificationStore } from "../store/notificationStore";

const MAX_PER_TXN = 10000;

function formatMoney(value) {
  const amount = Number(value || 0);
  return `Rs ${amount.toLocaleString("en-IN")}`;
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
      {status}
    </span>
  );
}

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Shared input class for dark theme
const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:border-brand-500/50 focus:bg-white/5 focus:ring-4 focus:ring-brand-500/10 shadow-inner";
const labelCls = "block text-xs font-bold text-slate-400 uppercase tracking-[0.05em] mb-2";

function Transfer() {
  const { addToast } = useNotificationStore();
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState("IDLE");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey());
  const [transactionMeta, setTransactionMeta] = useState(null);
  const [form, setForm] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    note: "",
  });

  useEffect(() => {
    const loadAccounts = async () => {
      setLoadingAccounts(true);
      setError("");
      try {
        const response = await api.get("/accounts");
        const list = response.data?.accounts || [];
        setAccounts(list);
        if (list.length > 0) {
          setForm((prev) => ({ ...prev, fromAccount: list[0]._id }));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load accounts");
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadAccounts();
  }, []);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setWorkflowStatus("PROCESSING");
    setTransactionMeta(null);
    setSubmitting(true);

    const numericAmount = Number(form.amount);

    if (numericAmount > MAX_PER_TXN) {
      setSubmitting(false);
      setWorkflowStatus("FAILED");
      setError(`Amount exceeds max per transaction (${formatMoney(MAX_PER_TXN)})`);
      addToast({ type: "error", title: "Transaction Failed", message: `Max per transaction is ${formatMoney(MAX_PER_TXN)}` });
      return;
    }

    addToast({ type: "info", title: "Transaction Processing", message: "Your transfer request is being processed." });

    try {
      const payload = {
        fromAccount: form.fromAccount,
        toAccount: form.toAccount.trim(),
        amount: numericAmount,
        note: form.note.trim(),
        idempotencyKey,
      };

      const response = await api.post("/transactions", payload);
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Transfer failed");
      }

      const tx = response.data?.transaction || {};
      const txStatus = tx.status || "COMPLETED";
      setWorkflowStatus(txStatus);
      setTransactionMeta({
        transactionId: tx._id || "Not returned",
        idempotencyKey,
        retryCount: tx.retryCount ?? 0,
        failureReason: tx.failureReason || "",
      });

      setSuccess(response.data?.message || "Transfer successful");
      setForm((prev) => ({ ...prev, toAccount: "", amount: "", note: "" }));
      setIdempotencyKey(createIdempotencyKey());

      if (txStatus === "FAILED") {
        addToast({ type: "error", title: "Transaction Failed", message: tx.failureReason || response.data?.message || "Transfer failed" });
      } else {
        addToast({ type: "success", title: txStatus === "PROCESSING" ? "Transaction Processing" : "Transaction Completed", message: response.data?.message || "Transfer successful" });
      }
    } catch (err) {
      setWorkflowStatus("FAILED");
      setError(err.response?.data?.message || err.message || "Transfer failed");
      addToast({ type: "error", title: "Transaction Failed", message: err.response?.data?.message || err.message || "Transfer failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl animate-fade-in-up">
      {/* Header */}
      <div className="mb-10 text-center mt-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-400/20 to-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-6 shadow-[0_0_40px_rgba(99,102,241,0.2)] relative">
          <div className="absolute inset-0 bg-brand-500/20 blur-md rounded-2xl animate-pulse-slow"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display leading-tight">Transfer Funds</h1>
        <p className="text-sm text-slate-400 mt-2">Send money securely from your dashboard</p>
      </div>

      <div className="glass-panel-premium p-8 relative overflow-hidden">
        {/* Glow behind the form */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        {loadingAccounts ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-white/5 rounded-xl" />
            <div className="h-10 bg-white/5 rounded-xl" />
            <div className="h-10 bg-white/5 rounded-xl" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-semibold text-slate-300">No account available</p>
            <p className="text-xs text-slate-500 mt-1">Please create an account from your dashboard first to enable transfers.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {/* From Account */}
            <div>
              <label className={labelCls}>From Source Account</label>
              <select
                name="fromAccount"
                value={form.fromAccount}
                onChange={onChange}
                required
                className={`${inputCls} font-mono appearance-none`}
              >
                {accounts.map((account) => (
                  <option key={account._id} value={account._id} className="bg-slate-900 text-slate-100">
                    {account._id}
                  </option>
                ))}
              </select>
            </div>

            {/* To Account */}
            <div>
              <label className={labelCls}>Recipient Target Account</label>
              <input
                type="text"
                name="toAccount"
                value={form.toAccount}
                onChange={onChange}
                required
                placeholder="24-character hexadecimal ID"
                className={`${inputCls} font-mono`}
              />
            </div>

            {/* Amount */}
            <div>
              <label className={labelCls}>Transfer Amount</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-semibold text-sm">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={onChange}
                  min="1"
                  step="1"
                  required
                  placeholder="0.00"
                  className={`${inputCls} pl-8 font-mono text-lg font-semibold`}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-semibold tracking-wide text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded uppercase">
                  Limit: {formatMoney(MAX_PER_TXN)}
                </span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className={labelCls}>
                Note <span className="text-slate-600 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                name="note"
                value={form.note}
                onChange={onChange}
                placeholder="What is this transfer for?"
                className={inputCls}
              />
            </div>

            {/* Idempotency Status Banner */}
            <div className="flex items-center justify-between rounded-xl border border-brand-500/20 bg-brand-500/5 p-4 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
              <div className="pl-2">
                <p className="text-xs font-bold tracking-wide text-brand-300">Idempotency Protection Active</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Duplicate requests are safely blocked</p>
              </div>
              <div>
                {statusBadge(workflowStatus === "IDLE" ? "INITIATED" : workflowStatus)}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm font-medium text-rose-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>{success}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none overflow-hidden"
            >
              {!submitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:transition-all group-hover:duration-700 group-hover:translate-x-full" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {submitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {submitting ? "Processing Transfer..." : "Confirm & Send Money"}
              </span>
            </button>

            {/* Transaction Meta */}
            {transactionMeta && (
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-xs text-slate-400 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">TXN Ref:</span>
                  <span className="text-slate-400">{transactionMeta.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">Retry Counter:</span>
                  <span>{transactionMeta.retryCount}/3</span>
                </div>
                <div className="flex flex-col mt-2 pt-2 border-t border-white/5 break-all text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-400 mb-0.5">Idempotency Key:</span>
                  {transactionMeta.idempotencyKey}
                </div>
                {workflowStatus === "FAILED" && (
                  <div className="mt-2 pt-2 border-t border-white/5 text-rose-400">
                    <span className="font-semibold">Failure Reason:</span> {transactionMeta.failureReason || "N/A"}
                  </div>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export default Transfer;
