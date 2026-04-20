import StatusBadge from "../StatusBadge";

function DataRow({ label, value }) {
  return (
    <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-slate-800">{value || "-"}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur-xl animate-fade-in-up">
        <div className="mb-6 flex items-center justify-between border-b border-slate-200/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-lg bg-brand-100 h-8 w-8 text-brand-600 shadow-sm shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Transaction Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-px bg-slate-200 flex-1"></span>
              Core Information
              <span className="h-px bg-slate-200 flex-1"></span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DataRow label="Transaction ID" value={transaction._id} />
              <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-px bg-slate-200 flex-1"></span>
              Account Routing
              <span className="h-px bg-slate-200 flex-1"></span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <DataRow
                  label="From Account (Source)"
                  value={transaction.fromAccount?._id}
                />
              </div>
              <DataRow label="To Account (Destination)" value={transaction.toAccount?._id} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-px bg-slate-200 flex-1"></span>
              System execution
              <span className="h-px bg-slate-200 flex-1"></span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DataRow
                label="Retry Attempts"
                value={`${transaction.retryCount ?? 0} out of 3 maximum`}
              />
              <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Failure Reason</p>
                  <p className={`mt-1 break-all text-sm font-semibold ${transaction.status === 'FAILED' ? 'text-rose-600' : 'text-slate-800'}`}>
                      {transaction.failureReason || (transaction.status === "FAILED" ? "Unknown API Failure" : "-")}
                  </p>
              </div>
              <div className="sm:col-span-2">
                <DataRow
                  label="Idempotency Key (Unique Request ID)"
                  value={transaction.idempotencyKey || "-"}
                />
              </div>
            </div>
          </section>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-200/60 text-right">
            <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
                Close Details
            </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailsModal;
