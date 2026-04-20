function StatusBadge({ status }) {
  if (status === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300 whitespace-nowrap shadow-[0_0_10px_rgba(245,158,11,0.2)]">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        PROCESSING
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-300 whitespace-nowrap shadow-[0_0_10px_rgba(244,63,94,0.2)]">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span>
        FAILED
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.15)]">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
        COMPLETED
      </span>
    );
  }

  if (status === "INITIATED") {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-500/30 bg-slate-500/15 px-2.5 py-1 text-xs font-semibold text-slate-300 whitespace-nowrap">
        INITIATED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2.5 py-1 text-xs font-semibold text-slate-300 whitespace-nowrap">
      {status || "-"}
    </span>
  );
}

export default StatusBadge;
