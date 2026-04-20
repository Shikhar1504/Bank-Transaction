function AccountActionButtons({ label, accountId, accountStatus, onAction }) {
  const normalizedStatus = accountStatus || "ACTIVE";
  const action = normalizedStatus === "FROZEN" ? "unfreeze" : "freeze";
  const actionLabel = action === "freeze" ? "Freeze" : "Unfreeze";
  const buttonClass =
    action === "freeze"
      ? "border-amber-400 text-amber-950 bg-amber-400 hover:bg-amber-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]"
      : "border-emerald-400 text-emerald-950 bg-emerald-400 hover:bg-emerald-300 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)]";

  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{label}</p>
      <button
        onClick={() => onAction(action, accountId)}
        disabled={!accountId}
        className={`w-full rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${buttonClass}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default AccountActionButtons;
