function AccountActionButtons({ label, accountId, accountStatus, onAction }) {
  const normalizedStatus = accountStatus || "ACTIVE";
  const action = normalizedStatus === "FROZEN" ? "unfreeze" : "freeze";
  const actionLabel = action === "freeze" ? "Freeze" : "Unfreeze";
  const buttonClass =
    action === "freeze"
      ? "border-amber-300 text-amber-700 hover:bg-amber-50"
      : "border-emerald-300 text-emerald-700 hover:bg-emerald-50";

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <button
        onClick={() => onAction(action, accountId)}
        disabled={!accountId}
        className={`w-24 rounded-md border px-2 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default AccountActionButtons;
