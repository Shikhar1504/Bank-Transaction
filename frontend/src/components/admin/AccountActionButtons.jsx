function AccountActionButtons({ label, accountId, accountStatus, onAction }) {
  const normalizedStatus = accountStatus || "ACTIVE";
  const action = normalizedStatus === "FROZEN" ? "unfreeze" : "freeze";
  const actionLabel = action === "freeze" ? "Freeze" : "Unfreeze";
  const buttonClass =
    action === "freeze"
      ? "border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-500/50"
      : "border-emerald-500/30 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50";

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
