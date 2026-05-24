import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Cpu, Workflow, ShieldCheck, Sparkles, Zap, GitMerge, Target, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PulseRTL" },
      { name: "description", content: "PulseRTL is an autonomous RTL verification and signoff engineering workspace. Learn why it is the best tool for Verilog, SystemVerilog, and Embedded C hardware validation." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-14">

        {/* PAGE HEADER */}
        <div className="mb-10 border-b border-slate-200 pb-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-1">About PulseRTL</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mb-3">
            The Engineering Workspace for RTL Verification
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            PulseRTL is a focused, workflow-oriented verification workspace for <strong className="text-slate-800">Verilog, SystemVerilog and Embedded C</strong> hardware designs.
            Instead of generic AI chat, it runs a structured <strong className="text-slate-800">8-stage agentic pipeline</strong> — parsing,
            linting, timing analysis, optimization, testbench synthesis, edge case detection, output prediction, and a formal
            EDA signoff report — giving you a complete picture of your design's hardware correctness in one run.
          </p>
        </div>

        {/* WHY IT'S THE BEST */}
        <div className="mb-10">
          <h2 className="font-display text-lg font-bold text-slate-800 mb-1">Why PulseRTL is the Best Tool for RTL Engineers</h2>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-5">Built for silicon. Not for demos.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Workflow,
                title: "Structured Agentic Pipeline",
                body: "Unlike one-shot AI tools, PulseRTL runs 8 deterministic, sequential analysis stages on every submission — just like a real EDA toolchain — so no issue is ever missed.",
              },
              {
                icon: ShieldCheck,
                title: "Hardware-Aware Intelligence",
                body: "Deep knowledge of latch inference, blocking vs non-blocking misuse, clock domain crossing, metastability, and setup/hold hazards that generic tools cannot detect.",
              },
              {
                icon: Zap,
                title: "Zero Setup. Instant Signoff.",
                body: "No Vivado. No Quartus. No simulation license. Paste your RTL and get a complete EDA-standard verification report in seconds, directly in your browser.",
              },
              {
                icon: Sparkles,
                title: "Optimized RTL Output",
                body: "Produces a clean, rewritten, synthesizable version of your design alongside the analysis — ready to deploy directly to FPGA or ASIC toolchains.",
              },
              {
                icon: GitMerge,
                title: "HLS Translation Engine",
                body: "Translate C/C++, Python, or VHDL into synthesizable Verilog, VHDL, or SystemVerilog. Seamlessly export the result to the Verifier for immediate signoff.",
              },
              {
                icon: Target,
                title: "Formal Signoff Reports",
                body: "Every run produces a formal EDA verification report: circuit type classification, module hierarchy, timing stability score, coverage assessment, and next-step guidelines.",
              },
              {
                icon: Cpu,
                title: "Live Timing Waveforms",
                body: "Renders cycle-accurate digital timing waveforms with logic state overlays (1, 0, X) directly in the browser — no oscilloscope or external simulator required.",
              },
              {
                icon: ShieldCheck,
                title: "Auto-Generated Testbenches",
                body: "Every analysis produces a complete, self-checking testbench with clock generation, reset stimuli, boundary conditions, and SystemVerilog assertions.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <f.icon className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CREATOR SECTION */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
          <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">Built by</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Shreyas Yadav M</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-sm">
                Designing tools that bridge the gap between hardware logic and software engineering workflow.
              </p>
            </div>
            <a
              href="https://shreyasyadavm.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/25 bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors font-mono"
            >
              <ExternalLink className="h-3 w-3" />
              shreyasyadavm.me
            </a>
          </div>
        </div>

        <div>
          <Link to="/" className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1">
            ← Return to Verification Workspace
          </Link>
        </div>
      </main>
    </div>
  );
}
