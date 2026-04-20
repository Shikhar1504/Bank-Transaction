import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Registration failed");
      }
      setAuth(response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-600/10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      <div className="w-full max-w-[420px] relative animate-fade-in-up">
        <div className="glass-panel p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30 flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white text-base font-bold font-display">A</span>
              </div>
              <span className="text-sm font-bold text-slate-300 font-display tracking-tight">AegisLedger</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white font-display">Create account</h1>
            <p className="text-sm text-slate-500 mt-1">Start your secure banking journey</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                required
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                minLength={6}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10"
              />
              <p className="text-xs text-slate-600 mt-1">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm font-medium text-rose-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link className="font-semibold text-brand-400 hover:text-brand-300 transition-colors" to="/login">
              Sign in here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-700 mt-4">
          <Link to="/" className="hover:text-slate-500 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
