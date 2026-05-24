import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — PulseRTL" },
      { name: "description", content: "Documentation for PulseRTL: how the agent pipeline analyzes RTL and embedded code." },
    ],
  }),
  component: Docs,
});

function Docs() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold">PulseRTL Documentation</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">Workspace User Manual</h1>
          <p className="text-sm text-slate-500 mt-1">
            Understanding the signoff methodologies, automated translations, and static analysis checkers of PulseRTL.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Main Manual Body */}
          <div className="md:col-span-2 space-y-8 prose prose-slate max-w-none">
            
            {/* USE SECTION */}
            <section>
              <h2 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">
                What is the Use of PulseRTL?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                PulseRTL is an <strong className="text-slate-800">AI-assisted static signoff and RTL timing validation workspace</strong>. It acts as an automated pre-synthesis checker, bridging the gap between raw hardware descriptive lines and synthesizable gate placements.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                In digital design, minor structural errors can lead to expensive timing glitches on silicon. PulseRTL targets and resolves these early in the workflow:
              </p>
              
              <ul className="space-y-2.5 text-xs text-slate-600 pl-4 list-disc mb-4">
                <li>
                  <strong className="text-slate-800">Sequential Latch Inference Detection:</strong> Prevents digital structures from generating unintended level-sensitive latches due to incomplete case statements or missing assignment fallbacks, avoiding serious setup/hold bottleneck states.
                </li>
                <li>
                  <strong className="text-slate-800">Timing & Clock Domain Crossing Checkers:</strong> Scans assignments to catch race-condition bugs, such as blocking assignments (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px] text-slate-700">=</code>) inside edge-triggered registers, ensuring predictable synchronous behavior.
                </li>
                <li>
                  <strong className="text-slate-800">Automated Testbench Synthesis:</strong> Autonomously generates comprehensive self-checking testbench files complete with clock triggers, resetting stimuli, boundary checks, and system monitoring asserts to save engineers hours of manual setup.
                </li>
                <li>
                  <strong className="text-slate-800">Dynamic Timing Diagrams:</strong> Renders interactive, cycle-by-cycle logic waveforms directly in the browser, showing transitions, crossovers, and bus crossover hex bubbles.
                </li>
              </ul>
            </section>

            {/* HOW TO SECTION */}
            <section>
              <h2 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">
                How to Use PulseRTL?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                The platform is designed around a focused two-stage engineering workflow:
              </p>

              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">RTL Translation & Conversion</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If you are working with high-level software algorithms (C/C++, Python) or legacy hardware descriptions (VHDL) and need synthesizable outputs:
                    </p>
                    <ol className="list-decimal pl-4 mt-1.5 text-xs text-slate-500 space-y-1">
                      <li>Navigate to the <strong className="text-slate-700">Synthesizer</strong> page using the main header links.</li>
                      <li>Paste your source logic and select the target hardware description language (Verilog, VHDL, SystemVerilog).</li>
                      <li>Execute the translation compiler to review the clock-accurate converted design.</li>
                      <li>Click <strong className="text-slate-700">Verify Converted Code</strong> to load it inline into the primary verifier automatically.</li>
                    </ol>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">RTL Verification & Diagnostics</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If you have Verilog/SystemVerilog/C registers ready for verification:
                    </p>
                    <ol className="list-decimal pl-4 mt-1.5 text-xs text-slate-500 space-y-1">
                      <li>Paste your hardware descriptive lines directly into the Monaco editor on the left column.</li>
                      <li>Choose your workspace language and click <strong className="text-slate-700">Run Verification Pipeline</strong> in the dashboard title area.</li>
                      <li>Watch the 8-stage <strong className="text-slate-700">Engineering Diagnostics</strong> pipeline evaluate AST tokens, timing stability, and coverage.</li>
                    </ol>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">Diagnostic Auditing & Signoff</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Review compilation signoff reports generated at the bottom of the workspace:
                    </p>
                    <ol className="list-decimal pl-4 mt-1.5 text-xs text-slate-500 space-y-1">
                      <li><strong className="text-slate-700">Issues / Timing Warnings:</strong> Inspect warnings and click the <strong className="text-slate-700">"Why This Was Flagged"</strong> accordion block under each issue for a deep educational guide.</li>
                      <li><strong className="text-slate-700">Optimized Code / Testbench:</strong> Audit side-by-side comparative views for warnings or download ready-to-run <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">.sv</code> compiler modules.</li>
                      <li><strong className="text-slate-700">Timing Summary:</strong> View the final EDA-standard executive validation report detailing coverage, safety ratings, and placements guidelines.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Quick Specifications Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Workspace Specs
              </h4>
              <div className="space-y-3 text-[11px] font-mono leading-normal text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Analysis Engine</span>
                  <span className="font-semibold text-slate-800">AI Verification</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Supported Inputs</span>
                  <span className="font-semibold text-slate-800">C, Python, V, SV</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Signoff Standards</span>
                  <span className="font-semibold text-slate-800">IEEE 1364 / 1800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Platforms</span>
                  <span className="font-semibold text-slate-800">FPGA / ASIC</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Signoff Checklist
              </h4>
              <ul className="text-xs text-slate-500 space-y-1.5 list-none pl-0">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Synthesizable module structure
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Zero level-sensitive latches
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Synchronous reset timing
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Self-checking asserts coverage
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-150 pt-5">
          <Link to="/" className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1">
            ← Return to Verification Workspace
          </Link>
        </div>
      </main>
    </div>
  );
}
