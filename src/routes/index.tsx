import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, Play, Cpu, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CodeEditor } from "@/components/CodeEditor";
import { AgentPipeline, PIPELINE_STEPS } from "@/components/AgentPipeline";
import { OutputTabs } from "@/components/OutputTabs";
import { ScoreCards } from "@/components/ScoreCards";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { EXAMPLES } from "@/lib/examples";
import { analyzeCode, type AnalysisResult } from "@/lib/analysis.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseRTL — Verification Pipeline Workspace" },
      { name: "description", content: "Autonomous AI verification and signoff copilot for Verilog, SystemVerilog and Embedded C." },
      { property: "og:title", content: "PulseRTL — RTL Verification & Signoff Engine" },
      { property: "og:description", content: "Autonomous verification and testbench generation suite." },
    ],
  }),
  component: Home,
});

const INITIAL_PLACEHOLDER = `// ===================================================================
// PulseRTL Autonomous Signoff & Timing Suite
//
// PASTE YOUR RTL (Verilog / SystemVerilog) OR EMBEDDED C CODE HERE...
//
// Then choose your target language, and click "Run Verification Pipeline"
// to begin timing hazard, latch inference, and synthesizability checks.
// ===================================================================
`;



// ---------------------------------------------------------------------------
// In-memory workspace store — survives client-side navigation because the
// JS module stays loaded. Resets to initial values on every page refresh
// because the browser reloads all JS modules from scratch.
// ---------------------------------------------------------------------------
let _memCode: string = INITIAL_PLACEHOLDER;
let _memLang: string = "verilog";

function Home() {
  // Bootstrap from the in-memory store (populated by prior navigation)
  const [code, setCode] = useState<string>(() => _memCode);
  const [language, setLanguage] = useState<string>(() => _memLang);
  const [activeStep, setActiveStep] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const analyzeFn = useServerFn(analyzeCode);

  // Keep the in-memory store in sync so re-mounting after navigation restores state
  const handleSetCode = (v: string) => { _memCode = v; setCode(v); };
  const handleSetLanguage = (v: string) => { _memLang = v; setLanguage(v); };

  // Show the browser's native "Changes may not be saved" dialog on refresh/close
  // when the user has pasted real code into the editor.
  useEffect(() => {
    const hasRealCode = code !== INITIAL_PLACEHOLDER && code.trim().length > 10;
    if (!hasRealCode) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [code]);


  // Auto-load code from local storage if redirected from the HLS Synthesizer
  useEffect(() => {
    const importCode = localStorage.getItem("pulselt_import_code");
    const importLang = localStorage.getItem("pulselt_import_lang");
    if (importCode) {
      handleSetCode(importCode);
      if (importLang) {
        handleSetLanguage(importLang === "vhdl" ? "systemverilog" : importLang);
      }
      setResult(null);
      setActiveStep(-1);
      
      // Clean up localStorage to prevent loops
      localStorage.removeItem("pulselt_import_code");
      localStorage.removeItem("pulselt_import_lang");
      
      toast.success("Successfully imported translated hardware design from High Level Synthesizer!");
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      if (code === INITIAL_PLACEHOLDER || code.trim().length < 15) {
        throw new Error("Please paste your Verilog, SystemVerilog or Embedded C code in the editor before running the pipeline.");
      }

      const startTime = Date.now();
      let step = 0;
      setActiveStep(0);
      const interval = setInterval(() => {
        step = Math.min(step + 1, PIPELINE_STEPS.length - 1);
        setActiveStep(step);
      }, 700);

      try {
        const data = await analyzeFn({ data: { code, language } });
        clearInterval(interval);
        const elapsed = Date.now() - startTime;
        if (elapsed < 1600) await new Promise((r) => setTimeout(r, 1600 - elapsed));
        setActiveStep(PIPELINE_STEPS.length);
        return data;
      } catch (e) {
        clearInterval(interval);
        setActiveStep(-1);
        throw e;
      }
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Verification pipeline complete! Reports ready.");
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Analysis failed");
    },
  });

  const onUpload = (f: File) => {
    if (f.size > 200_000) return toast.error("File too large (max 200KB)");
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext === "v") handleSetLanguage("verilog");
    else if (ext === "sv") handleSetLanguage("systemverilog");
    else if (ext === "c" || ext === "h") handleSetLanguage("c");
    const reader = new FileReader();
    reader.onload = () => {
      handleSetCode(String(reader.result ?? ""));
      setResult(null);
      setActiveStep(-1);
      toast.success(`Loaded file: ${f.name}`);
    };
    reader.readAsText(f);
  };

  const loadExample = (key: string) => {
    const ex = EXAMPLES[key];
    if (!ex) return;
    handleSetCode(ex.code);
    handleSetLanguage(ex.language);
    setResult(null);
    setActiveStep(-1);
    toast.success(`Loaded example: ${ex.label}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />

      <main ref={workspaceRef} className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        {/* DASHBOARD HEADER */}
        <div className="mb-4 flex flex-col justify-between gap-4 border-b border-slate-200 pb-3 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="h-2 w-2 rounded-full bg-primary pulse-ring" />
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                RTL Signoff & Timing Analysis
              </p>
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
              RTL Verification Workspace
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <Select value={language} onValueChange={handleSetLanguage}>
              <SelectTrigger className="h-9 w-40 bg-white border-slate-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-xs">
                <SelectItem value="verilog">Verilog</SelectItem>
                <SelectItem value="systemverilog">SystemVerilog</SelectItem>
                <SelectItem value="c">Embedded C</SelectItem>
              </SelectContent>
            </Select>

            <input
              ref={fileRef} type="file" accept=".v,.sv,.svh,.c,.h,.txt" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.currentTarget.value = ""; }}
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="h-9 gap-1.5 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 text-xs">
              <Upload className="h-3.5 w-3.5" /> Upload File
            </Button>

            <Button
              size="sm"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || code.length < 5}
              className="h-9 gap-1.5 bg-gradient-primary shadow-glow hover:opacity-95 text-xs font-semibold text-white transition-all duration-200"
            >
              <Play className="h-3.5 w-3.5" />
              {mutation.isPending ? "Executing Pipeline…" : "Run Verification Pipeline"}
            </Button>
          </div>
        </div>

        {/* WORKSPACE SPLIT PANEL */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* LEFT PANEL — Monaco Code Editor */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                Source Implementation Editor
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">
                {language}
              </span>
            </div>

            <CodeEditor value={code} onChange={handleSetCode} language={language} height="520px" />
            
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1.5">
              <span>{code.split("\n").length} lines · {code.length} characters</span>
              <span>UTF-8 · Tab Size: 2</span>
            </div>
          </div>

          {/* RIGHT PANEL — Execution Pipeline & Scorecards */}
          {/* RIGHT PANEL — Consolidated Engineering Diagnostics */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white shadow-elegant overflow-hidden">
              {/* Parent Panel Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-3.5 py-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Engineering Diagnostics
                </span>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200/60 px-2 py-0.5 rounded-full shadow-sm">
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    mutation.isPending ? "bg-primary animate-pulse shadow-[0_0_8px_oklch(0.52_0.18_258)]" : result ? "bg-success" : "bg-slate-400"
                  )} />
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500">
                    {mutation.isPending ? "Analysis Active" : result ? "Signoff Complete" : "Pipeline Idle"}
                  </span>
                </div>
              </div>

              {/* Panel Body */}
              <div className="p-3.5 space-y-3.5">
                {/* 1. Execution Pipeline Steps */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Signoff Pipeline Tasks
                  </span>
                  <AgentPipeline activeStep={activeStep} running={mutation.isPending} />
                </div>

                {/* 3. Diagnostics Metrics (ScoreCards) */}
                <div className="space-y-1 border-t border-slate-100 pt-3">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Verification Metrics
                  </span>
                  {result ? (
                    <ScoreCards
                      riskLevel={result.riskLevel}
                      codeQualityScore={result.codeQualityScore}
                      timingStability={result.timingStability}
                      verificationCoverage={result.verificationCoverage}
                    />
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/20 p-4 text-center">
                      <p className="text-xs text-slate-400 font-mono">
                        Awaiting active run to populate timing, safety, quality, and coverage metrics.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE TABBED RESULTS SYSTEM */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 pt-8 border-t border-slate-200"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary mb-1 block font-semibold">
                  Analysis Complete
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight text-slate-900">
                  Verification Reports & Synthesis Artifacts
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Target Platform: FPGA / ASIC Synthesizable
              </span>
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-elegant">
              <OutputTabs result={result} originalCode={code} language={language} />
            </div>
          </motion.div>
        )}
      </main>

      <footer className="mt-12 border-t border-slate-100 bg-slate-50/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Cpu className="h-3.5 w-3.5 text-slate-400" /> PULSERTL // RTL SIGN-OFF WORKSPACE
          </div>
          <div>v1.2-beta · Direct API Engine</div>
        </div>
      </footer>
    </div>
  );
}
