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

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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
      setError(
        `Amount exceeds max per transaction (${formatMoney(MAX_PER_TXN)})`,
      );
      addToast({
        type: "error",
        title: "Transaction Failed",
        message: `Max per transaction is ${formatMoney(MAX_PER_TXN)}`,
      });
      return;
    }

    addToast({
      type: "info",
      title: "Transaction Processing",
      message: "Your transfer request is being processed.",
    });

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
        addToast({
          type: "error",
          title: "Transaction Failed",
          message:
            tx.failureReason || response.data?.message || "Transfer failed",
        });
      } else {
        addToast({
          type: "success",
          title:
            txStatus === "PROCESSING"
              ? "Transaction Processing"
              : "Transaction Completed",
          message: response.data?.message || "Transfer successful",
        });
      }
    } catch (err) {
      setWorkflowStatus("FAILED");
      setError(err.response?.data?.message || err.message || "Transfer failed");
      addToast({
        type: "error",
        title: "Transaction Failed",
        message:
          err.response?.data?.message || err.message || "Transfer failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Transfer Money
        </h1>
        <p className="text-sm text-slate-500">Send money between accounts</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loadingAccounts ? (
          <p className="text-sm text-slate-500">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-slate-600">
            Create an account from dashboard first.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                From Account
              </label>
              <select
                name="fromAccount"
                value={form.fromAccount}
                onChange={onChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              >
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account._id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Recipient Account Number
              </label>
              <input
                type="text"
                name="toAccount"
                value={form.toAccount}
                onChange={onChange}
                required
                placeholder="Enter recipient account number"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={onChange}
                min="1"
                step="1"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
              <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p>Max per txn: {formatMoney(MAX_PER_TXN)}</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Note
              </label>
              <input
                type="text"
                name="note"
                value={form.note}
                onChange={onChange}
                placeholder="Optional transfer note"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">Idempotency</p>
              <p className="mt-1 text-xs text-slate-600">
                A unique idempotency key is auto-generated for each transaction.
              </p>
            </div>

            <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                System Feedback
              </p>
              {statusBadge(
                workflowStatus === "IDLE" ? "INITIATED" : workflowStatus,
              )}
            </div>

            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {submitting ? "Submitting Transfer..." : "Send Money"}
            </button>

            {transactionMeta && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <p>
                  <span className="font-medium">Transaction ID:</span>{" "}
                  {transactionMeta.transactionId}
                </p>
                <p className="break-all">
                  <span className="font-medium">Idempotency Key:</span>{" "}
                  {transactionMeta.idempotencyKey}
                </p>
                <p>
                  <span className="font-medium">Retry:</span>{" "}
                  {transactionMeta.retryCount}/3
                </p>
                {workflowStatus === "FAILED" && (
                  <p>
                    <span className="font-medium">Reason:</span>{" "}
                    {transactionMeta.failureReason ||
                      "No failure reason returned"}
                  </p>
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
