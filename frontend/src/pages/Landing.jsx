import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/25",
    border: "group-hover:border-emerald-500/30",
    title: "Atomic Transactions",
    desc: "Every money movement is wrapped in a MongoDB session — all-or-nothing. Balances, ledger, and status commit together or roll back together."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    color: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/25",
    border: "group-hover:border-violet-500/30",
    title: "Idempotency Engine",
    desc: "A unique compound index on {idempotencyKey, fromAccount} prevents duplicate charges. Retries always return the same result safely."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/25",
    border: "group-hover:border-amber-500/30",
    title: "Bounded Retry Logic",
    desc: "Failed transactions re-enter PROCESSING state with retryCount tracking, capped at 3 attempts. State-machine-driven, never infinite."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/25",
    border: "group-hover:border-sky-500/30",
    title: "Double-Entry Ledger",
    desc: "Every transfer writes immutable DEBIT + CREDIT entries. Audit trail is append-only, perfect for forensics and reconciliation."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "from-rose-500 to-pink-500",
    glow: "shadow-rose-500/25",
    border: "group-hover:border-rose-500/30",
    title: "RBAC & JWT Auth",
    desc: "Role-based access control (USER / ADMIN / SYSTEM) with JWT cookies, Bearer fallback, token blacklisting, and Zod-validated payloads."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "from-indigo-500 to-brand-500",
    glow: "shadow-indigo-500/25",
    border: "group-hover:border-indigo-500/30",
    title: "Event-Driven Architecture",
    desc: "Domain events (transaction.completed, transaction.failed) are emitted post-execution and consumed by decoupled notification listeners."
  },
];

const TECH_STACK = [
  { name: "Node.js", color: "bg-green-500/15 text-green-300 border-green-500/25" },
  { name: "Express 4", color: "bg-slate-500/15 text-slate-300 border-slate-500/25" },
  { name: "MongoDB", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  { name: "Mongoose", color: "bg-red-500/15 text-red-300 border-red-500/25" },
  { name: "Zod", color: "bg-blue-500/15 text-blue-300 border-blue-500/25" },
  { name: "JWT", color: "bg-violet-500/15 text-violet-300 border-violet-500/25" },
  { name: "bcrypt", color: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
  { name: "React 19", color: "bg-sky-500/15 text-sky-300 border-sky-500/25" },
  { name: "Vite", color: "bg-purple-500/15 text-purple-300 border-purple-500/25" },
  { name: "Tailwind CSS", color: "bg-teal-500/15 text-teal-300 border-teal-500/25" },
];

function Landing() {
  return (
    <div className="min-h-screen font-sans overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-brand-600/15 blur-[120px] animate-blob" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute -bottom-20 left-1/3 w-[450px] h-[450px] rounded-full bg-sky-600/8 blur-[100px] animate-blob" style={{ animationDelay: "6s" }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30 flex items-center justify-center">
            <span className="text-white text-sm font-bold font-display">A</span>
          </div>
          <span className="text-base font-bold text-white font-display tracking-tight">AegisLedger</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            Sign in
          </Link>
          <Link to="/register" className="px-5 py-2 text-sm font-semibold text-white rounded-xl bg-brand-600 hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/30 active:scale-95">
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-16 pb-28 text-center px-4 max-w-5xl mx-auto animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300 mb-10 shadow-lg shadow-brand-500/10">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
          Production-grade · Full-stack · Open Source
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          <span className="text-white">Banking Built for</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #a5b4fc 0%, #c084fc 50%, #67e8f9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Real Failures
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          A production-grade Node.js + MongoDB banking backend with atomic transfers,
          idempotency enforcement, bounded retries, double-entry ledgering, and full RBAC.
          <span className="block mt-2 text-slate-500 text-base">Built to handle the edge cases that break real systems.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="group flex items-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-brand-600/30 transition-all active:scale-95 hover:shadow-brand-500/40 hover:-translate-y-0.5"
          >
            Open Account
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-3.5 text-sm font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
          >
            Sign In
          </Link>
        </div>

        {/* Transaction lifecycle preview */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { status: "INITIATED", color: "border-slate-600/50 bg-slate-700/30 text-slate-300", dot: "bg-slate-400" },
            { status: "PROCESSING", color: "border-amber-500/40 bg-amber-500/15 text-amber-300", dot: "bg-amber-400 animate-pulse" },
            { status: "COMPLETED", color: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300", dot: "bg-emerald-400" },
          ].map((item, i) => (
            <div key={item.status} className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${item.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                {item.status}
              </span>
              {i < 2 && (
                <svg className="h-4 w-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </div>
          ))}
          <span className="text-xs text-slate-600 ml-1">(+ retry on FAILED, max 3)</span>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-white mb-3">Engineering Decisions That Matter</h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">Each feature solves a real production problem that costs companies money when done wrong.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 ${feature.border} hover:bg-white/[0.06]`}
            >
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
              <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg ${feature.glow} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-display">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "100%", label: "Atomic", sub: "All writes or none", color: "text-emerald-400" },
            { value: "0", label: "Duplicate Charges", sub: "Idempotency enforced", color: "text-violet-400" },
            { value: "3×", label: "Max Retries", sub: "State-machine controlled", color: "text-amber-400" },
            { value: "2×", label: "Ledger Entries", sub: "DEBIT + CREDIT per transfer", color: "text-sky-400" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className={`text-4xl font-bold font-display ${stat.color}`}>{stat.value}</p>
              <p className="text-sm font-semibold text-slate-200">{stat.label}</p>
              <p className="text-xs text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-24 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-6">Tech Stack</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {TECH_STACK.map((tech) => (
            <span
              key={tech.name}
              className={`inline-flex items-center rounded-lg border px-3.5 py-1.5 text-xs font-semibold ${tech.color} transition-all hover:-translate-y-0.5 cursor-default`}
            >
              {tech.name}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 pb-28 text-center">
        <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-brand-600/10 p-10">
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-brand-500/15 blur-3xl" />
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Ready to explore?</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Register an account, fund it via the system endpoint, and make real transfers
              to see idempotency, retries, and the ledger in action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-brand-600/25 transition-all active:scale-95"
              >
                Create Free Account
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 text-center py-8 border-t border-white/5 text-xs text-slate-600">
        <p>AegisLedger — Production-grade Banking API · Built with Node.js, Express & MongoDB</p>
      </footer>
    </div>
  );
}

export default Landing;
