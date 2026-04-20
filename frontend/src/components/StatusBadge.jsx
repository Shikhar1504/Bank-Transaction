function StatusBadge({ status }) {
  if (status === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/50 backdrop-blur-sm border border-amber-200/50 px-2.5 py-1 text-xs font-semibold text-amber-600 shadow-sm whitespace-nowrap">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        PROCESSING
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100/50 backdrop-blur-sm border border-rose-200/50 px-2.5 py-1 text-xs font-semibold text-rose-600 shadow-sm whitespace-nowrap">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1.5"></span>
        FAILED
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100/50 backdrop-blur-sm border border-emerald-200/50 px-2.5 py-1 text-xs font-semibold text-emerald-600 shadow-sm whitespace-nowrap">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        COMPLETED
      </span>
    );
  }

  if (status === "INITIATED") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100/50 backdrop-blur-sm border border-slate-200/50 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm whitespace-nowrap">
        INITIATED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100/50 backdrop-blur-sm border border-slate-200/50 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm whitespace-nowrap">
      {status || "-"}
    </span>
  );
}

export default StatusBadge;
