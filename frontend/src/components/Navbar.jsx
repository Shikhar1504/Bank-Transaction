import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

function navClasses({ isActive }) {
  return isActive
    ? "relative rounded-lg px-3 py-2 text-sm font-semibold text-white bg-white/10 transition-all"
    : "relative rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:text-white hover:bg-white/5";
}

function Navbar() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore API error and clear client auth state anyway.
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="sticky top-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 mb-8">
      <header className="glass-nav mx-auto max-w-7xl rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <span className="text-white text-sm font-bold font-display">A</span>
            </div>
            <span className="text-base font-bold tracking-tight text-white font-display">
              AegisLedger
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/dashboard" className={navClasses}>Dashboard</NavLink>
            <NavLink to="/transfer" className={navClasses}>Transfer</NavLink>
            <NavLink to="/transactions" className={navClasses}>History</NavLink>
            {user?.role === "ADMIN" && (
              <>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400/70 px-2">Admin</span>
                <NavLink to="/admin/users" className={navClasses}>Users</NavLink>
                <NavLink to="/admin/transactions" className={navClasses}>Transfers</NavLink>
                <NavLink to="/admin/stats" className={navClasses}>Stats</NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-brand-300">{initials}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-semibold text-slate-200 leading-tight">{user?.name || "User"}</span>
                <span className="text-[11px] text-slate-500 leading-tight">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-300 active:scale-95"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Navbar;

