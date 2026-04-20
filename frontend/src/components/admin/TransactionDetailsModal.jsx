import StatusBadge from "../StatusBadge";

function DataRow({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm text-slate-800">{value || "-"}</p>
    </div>
  );
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function TransactionDetailsModal({ transaction, onClose }) {
  if (!transaction) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Transaction Info
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DataRow label="Transaction ID" value={transaction._id} />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={transaction.status} />
                </div>
              </div>
              <DataRow
                label="Amount"
                value={
                  transaction.displayAmount || formatMoney(transaction.amount)
                }
              />
              <DataRow
                label="Created At"
                value={new Date(transaction.createdAt).toLocaleString()}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Accounts</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DataRow
                label="From Account"
                value={transaction.fromAccount?._id}
              />
              <DataRow label="To Account" value={transaction.toAccount?._id} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">
              System Info
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DataRow
                label="Retry Attempts"
                value={`${transaction.retryCount ?? 0} of 3`}
              />
              <DataRow
                label="Failure Reason"
                value={transaction.failureReason || "-"}
              />
              <DataRow
                label="Idempotency Key"
                value={transaction.idempotencyKey || "-"}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailsModal;
