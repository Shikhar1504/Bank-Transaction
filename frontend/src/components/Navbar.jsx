import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

function navClasses({ isActive }) {
  return isActive
    ? "rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700"
    : "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100";
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

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/dashboard" className="text-lg font-semibold text-slate-800">
          Bank Demo
        </Link>

        <nav className="flex flex-wrap gap-1">
          <NavLink to="/dashboard" className={navClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/transfer" className={navClasses}>
            Transfer
          </NavLink>
          <NavLink to="/transactions" className={navClasses}>
            Transactions
          </NavLink>
          {user?.role === "ADMIN" && (
            <>
              <NavLink to="/admin/users" className={navClasses}>
                Admin Users
              </NavLink>
              <NavLink to="/admin/transactions" className={navClasses}>
                Admin Tx
              </NavLink>
              <NavLink to="/admin/stats" className={navClasses}>
                Admin Stats
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
