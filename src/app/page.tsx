export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        {/* Brand Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Milestone 0 — Foundation Ready
        </div>

        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            LeaseLens
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Know what you&apos;re signing.
          </p>
        </div>

        {/* Description Box */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm text-left space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-3">
            Project Status: Milestone 0 Initialized
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            LeaseLens is an AI-powered residential lease analyzer designed to help tenants identify key financial obligations, important deadlines, and potentially risky clauses before signing.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-400">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
              <span className="block text-slate-500 mb-1 font-mono uppercase tracking-wider text-[10px]">Framework</span>
              <span className="font-semibold text-slate-200">Next.js + TypeScript</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
              <span className="block text-slate-500 mb-1 font-mono uppercase tracking-wider text-[10px]">Styling</span>
              <span className="font-semibold text-slate-200">Tailwind CSS</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-slate-500">
          Foundation setup complete. Ready to proceed to Milestone 1 upon user instruction.
        </p>
      </div>
    </main>
  );
}
