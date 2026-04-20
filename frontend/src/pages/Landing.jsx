import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const TECH_STACK = [
  { name: "Node.js", color: "from-green-500/20 to-emerald-500/10 text-green-400 border-green-500/30" },
  { name: "Express 4", color: "from-slate-500/20 to-slate-400/10 text-slate-300 border-slate-500/30" },
  { name: "MongoDB", color: "from-emerald-600/20 to-teal-500/10 text-emerald-400 border-emerald-500/30" },
  { name: "Mongoose", color: "from-red-500/20 to-rose-500/10 text-red-400 border-red-500/30" },
  { name: "Zod", color: "from-blue-500/20 to-sky-500/10 text-blue-400 border-blue-500/30" },
  { name: "Tailwind CSS", color: "from-teal-500/20 to-cyan-500/10 text-teal-300 border-teal-500/30" },
];

const SYSTEM_CONCEPTS = [
  { group: "Data Integrity", items: ["Atomic Transactions", "Double-Entry Ledger", "Immutable Data Pattern", "Source of Truth Pattern"] },
  { group: "Concurrency & Resilience", items: ["Idempotency", "Retry Mechanism", "Race Condition Handling", "Indexing Strategy"] },
  { group: "Architecture & Security", items: ["Event-Driven Architecture", "Observability (Audit Logs)", "Separation of Concerns", "Pagination for Scalability"] },
  { group: "Authentication", items: ["JWT & RBAC Authorization", "Token Blacklisting", "Rate Limiting", "System Role Fallbacks"] },
];

function Landing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-hidden bg-surface-900 relative selection:bg-brand-500/30 selection:text-white">
      {/* ── BACKGROUNDS ── */}
      <div className="absolute inset-0 bg-grid-pattern z-0 pointer-events-none opacity-60" />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-600/20 blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-sky-500/10 blur-[100px] mix-blend-screen animate-blob" style={{ animationDelay: "4s" }} />
      </div>

      {/* ── HEADER ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20 flex items-center justify-center border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 blur-sm scale-150 rounded-full animate-pulse-slow"></div>
            <span className="text-white text-lg font-bold font-display relative z-10">A</span>
          </div>
          <span className="text-xl font-bold text-white font-display tracking-tight drop-shadow-sm">AegisLedger</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="relative group px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-500/0 via-brand-400/20 to-brand-500/0 -translate-x-full group-hover:animate-shimmer" />
            Launch App →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-20 pb-32 px-4 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-300 mb-8 shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Production-grade · Full-stack · Open Source
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-[5rem] font-bold tracking-tight leading-[1.05] mb-8 drop-shadow-2xl">
            <span className="text-white">Banking Backend for</span>
            <br />
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-2 bg-gradient-to-r from-brand-500/20 to-violet-500/20 blur-xl rounded-full"></span>
              <span className="relative" style={{ background: "linear-gradient(135deg, #c7d2fe 0%, #a78bfa 50%, #2dd4bf 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                High-Stakes Scale.
              </span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
            Engineered with strict <span className="text-slate-200 font-semibold">MongoDB constraints</span>, atomic sessions, and bounding-box retries.
            <span className="block mt-2 text-brand-300/80 font-medium text-base">Built to handle the edge cases that break real systems.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 text-white px-8 py-4 text-sm font-bold shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all hover:bg-brand-500 hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:transition-all group-hover:duration-1000 group-hover:translate-x-full" />
              <span className="relative z-10 flex items-center gap-2">
                Open Developer Account
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <a
              href="#architecture"
              className="px-8 py-4 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              View Architecture ↓
            </a>
          </div>
        </div>

        {/* ── FLOATING UI PREVIEW ── */}
        <div className={`mt-24 w-full max-w-4xl mx-auto relative transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/20 to-transparent blur-3xl -z-10" />
          <div className="glass-panel-premium rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 glow-indigo border-t border-white/20">
            {/* Window header */}
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                <svg className="w-3 h-3 text-brand-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                POST /api/transactions
              </div>
              <div className="w-12" /> {/* Spacer */}
            </div>
            {/* Fake Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
              <div className="p-6 bg-surface-900/60 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
                <span className="text-brand-400">const</span> payload = {'{'}<br/>
                &nbsp;&nbsp;<span className="text-sky-300">"fromAccount"</span>: <span className="text-emerald-300">"65a...8f9"</span>,<br/>
                &nbsp;&nbsp;<span className="text-sky-300">"toAccount"</span>: <span className="text-emerald-300">"65b...1e2"</span>,<br/>
                &nbsp;&nbsp;<span className="text-sky-300">"amount"</span>: <span className="text-violet-300">10000</span>,<br/>
                &nbsp;&nbsp;<span className="text-sky-300">"idempotencyKey"</span>: <span className="text-emerald-300">"req_9x...2a"</span><br/>
                {'}'};<br/><br/>
                <span className="text-slate-500">// Enforces atomicity out of the box</span><br/>
                <span className="text-brand-400">await</span> api.post(<span className="text-emerald-300">"/transactions"</span>, payload);
              </div>
              <div className="p-6 bg-surface-900/80 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Transaction Success</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">Status: 201 Created</p>
                  </div>
                </div>
                <div className="space-y-2 border-l-2 border-white/5 pl-4 ml-5">
                  <p className="text-xs text-slate-400"><span className="text-brand-400 font-mono text-[10px]">VERIFIED</span> Idempotency check passed</p>
                  <p className="text-xs text-slate-400"><span className="text-emerald-400 font-mono text-[10px]">COMMITTED</span> MongoDB Acid Session</p>
                  <p className="text-xs text-slate-400"><span className="text-sky-400 font-mono text-[10px]">WRITTEN</span> Double-entry ledger synced</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SYSTEM ARCHITECTURE DIAGRAM SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-32">
        <div className="glass-panel-premium rounded-3xl p-8 md:p-12 border border-brand-500/20 shadow-2xl shadow-brand-500/10 mb-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-3 tracking-tight">System Design & Transaction Flow</h2>
            <p className="text-slate-400 text-sm max-w-3xl mx-auto leading-relaxed">
              Built to prevent race-condition overdrafts and duplicate network charges at the database level.
              Every transfer routes through a rigid state machine.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
            
            {/* Step 1: Request */}
            <div className="flex flex-col items-center w-full lg:w-48 text-center shrink-0">
              <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h4 className="text-sm font-bold text-white">Idempotency Check</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Unique Compound Index on <code className="text-brand-400 bg-brand-500/10 rounded px-1">{`{idempotencyKey, fromAccount}`}</code> drops duplicates instantly.</p>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex shrink-0 opacity-50">
               <svg className="w-8 h-8 text-brand-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </div>

            {/* Step 2: Mongodb Session */}
            <div className="flex flex-col items-center w-full lg:w-64 text-center relative shrink-0">
              <div className="absolute inset-0 bg-brand-500/20 blur-[60px] rounded-full z-0" />
              <div className="relative z-10 w-full rounded-2xl border border-brand-500/30 bg-surface-900/80 p-6 shadow-xl shadow-brand-500/10 backdrop-blur-xl">
                 <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-brand-400 mb-4 border-b border-white/5 pb-2">Atomic MongoDB Session</h4>
                 <div className="space-y-3 text-left">
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/><span className="text-xs text-slate-300 tracking-tight leading-none whitespace-nowrap">Validate Ownership</span></div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/><span className="text-xs text-slate-300 tracking-tight leading-none whitespace-nowrap">Guarded Balance Decrement</span></div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/><span className="text-xs text-slate-300 tracking-tight leading-none whitespace-nowrap">Target Account Increment</span></div>
                   <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5"><div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"/><span className="text-xs text-white font-semibold">Write Immutable Ledger</span></div>
                 </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex shrink-0 opacity-50">
               <svg className="w-8 h-8 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </div>

            {/* Step 3: Event & Audit */}
            <div className="flex flex-col items-center w-full lg:w-48 text-center shrink-0">
              <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-sm font-bold text-white">Event & Audit</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                 <span className="text-emerald-400 font-mono text-[10px]">transaction.completed</span> emitted to Event Bus. Outcome written to Audit Log.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── BENTO BOX ARCHITECTURE SECTION ── */}
      <section id="architecture" className="relative z-10 max-w-7xl mx-auto px-4 pb-32">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Architected for Reliability</h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">Modern distributed systems fail. AegisLedger is built to survive those failures gracefully using classic hardcore database engineering.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          
          {/* Bento Item 1: Atomic (Span 2) */}
          <div className="md:col-span-2 glass-panel-premium rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-32 h-32 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-400 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">ACID MongoDB Transactions</h3>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed">
              Every money movement is wrapped in a dedicated MongoDB Session. It's strictly all-or-nothing. Balances, double-entry ledger logs, and transaction states commit together or roll back completely on failure.
            </p>
          </div>

          {/* Bento Item 2: Idempotency */}
          <div className="glass-panel-premium rounded-3xl p-8 relative overflow-hidden flex flex-col justify-end group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/20 blur-3xl group-hover:bg-violet-500/30 transition-colors" />
            <div className="mb-auto">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Idempotent by Design</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              A unique compound index drops duplicate charges instantly. Safe retries guaranteed.
            </p>
          </div>

          {/* Bento Item 3: Retries */}
          <div className="glass-panel-premium rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Bounded Retry State Machine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Failed transactions re-enter PROCESSING automatically. Tracker caps attempts safely at 3 to prevent infinite loops.
            </p>
          </div>

          {/* Bento Item 4: Double Entry (Span 2) */}
          <div className="md:col-span-2 glass-panel-premium rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center sm:flex-row sm:items-center sm:justify-between group">
             <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none" />
             <div className="relative z-10 max-w-md">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-display">Immutable Double-Entry Ledger</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Every single transaction forces dual writes: an immutable DEBIT entry for the sender, and a CREDIT entry for the receiver. Perfect for audits and forensic reconciliation.
                </p>
             </div>
             <div className="relative z-10 hidden sm:block">
                <div className="space-y-3">
                  <div className="px-4 py-2 rounded-lg border border-white/5 bg-white/5 text-xs font-mono text-slate-300 shadow-lg shadow-black/20 flex gap-4">
                     <span className="text-rose-400 font-bold">DEBIT</span> <span>User A</span> <span>$1,000.00</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg border border-white/5 bg-white/5 text-xs font-mono text-slate-300 shadow-lg shadow-black/20 flex gap-4 ml-8 relative">
                     <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 border-t border-white/20"/>
                     <span className="text-emerald-400 font-bold">CREDIT</span> <span>User B</span> <span>$1,000.00</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── CORE SYSTEM DESIGN PRINCIPLES ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-32">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Core System Design Principles</h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            An exhaustive implementation of backend patterns required for enterprise financial software.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SYSTEM_CONCEPTS.map((conceptGroup, idx) => (
            <div key={idx} className="glass-panel-premium rounded-2xl p-6 border border-white/10 hover:border-brand-500/30 transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-4">{conceptGroup.group}</h3>
              <ul className="space-y-3">
                {conceptGroup.items.map((item, idy) => (
                  <li key={idy} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm font-medium text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="relative z-10 w-full border-y border-white/10 bg-white/[0.02] py-8 overflow-hidden backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Built With Precision</p>
            <div className="flex flex-wrap justify-center gap-3">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech.name}
                  className={`inline-flex items-center px-4 py-2 rounded-xl border bg-gradient-to-br text-sm font-semibold shadow-sm transition-all hover:scale-105 cursor-default ${tech.color}`}
                >
                  {tech.name}
                </span>
              ))}
            </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-32 px-4 max-w-4xl mx-auto text-center">
         <h2 className="font-display text-4xl font-bold text-white mb-6">Code that belongs in production.</h2>
         <p className="text-slate-400 mb-10 text-lg leading-relaxed max-w-2xl mx-auto">
            Experience the system firsthand. Register an account, fund it via the system endpoint, and test concurrent transfers, duplicate keys, and ledger creation yourself.
         </p>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-500 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-brand-600/20 transition-all active:scale-95"
            >
              Get Started Free
            </Link>
         </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 text-center py-10 border-t border-white/5">
        <p className="text-xs font-medium text-slate-600 tracking-wide">
          AegisLedger — Forged for Resiliency.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
