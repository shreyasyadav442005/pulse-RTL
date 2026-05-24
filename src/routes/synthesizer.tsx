import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Upload, Play, Cpu, RefreshCw, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { synthesizeCode } from "@/lib/analysis.functions";

export const Route = createFileRoute("/synthesizer")({
  head: () => ({
    meta: [
      { title: "High Level Synthesizer — PulseRTL" },
      { name: "description", content: "Translate C/C++, VHDL, or Python code into synthesizable Verilog, VHDL, or SystemVerilog." },
    ],
  }),
  component: SynthesizerPage,
});

const INITIAL_CONVERT_PLACEHOLDER = `// ===================================================================
// PulseRTL High-Level Synthesizer (HLS)
//
// PASTE YOUR SOURCE CODE HERE (e.g. C/C++, Python, VHDL, or Verilog)...
//
// Then choose your source and target languages on the right,
// and click "Execute Synthesis Translation" below.
// ===================================================================
`;

function SynthesizerPage() {
  const [sourceCode, setSourceCode] = useState(INITIAL_CONVERT_PLACEHOLDER);
  const [translatedCode, setTranslatedCode] = useState<string>("");
  const [fromLanguage, setFromLanguage] = useState<string>("c");
  const [toLanguage, setToLanguage] = useState<string>("verilog");
  
  const synthesizeFn = useServerFn(synthesizeCode);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      if (sourceCode === INITIAL_CONVERT_PLACEHOLDER || sourceCode.trim().length < 10) {
        throw new Error("Please paste your source implementation to convert.");
      }
      return await synthesizeFn({ data: { code: sourceCode, fromLanguage, toLanguage } });
    },
    onSuccess: (data) => {
      setTranslatedCode(data.translatedCode);
      toast.success(`HLS Compiler: Successfully translated design to ${toLanguage.toUpperCase()}!`);
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Code synthesis failed");
    },
  });

  const handleExport = () => {
    if (!translatedCode) return;
    // Save to localStorage for the home page to pick up automatically on mount
    localStorage.setItem("pulselt_import_code", translatedCode);
    localStorage.setItem("pulselt_import_lang", toLanguage);
    toast.success("Design exported! Redirecting to PulseRTL Verifier...");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar hideLinks={true} showBack={true} />

      <main className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        
        {/* PAGE HEADER */}
        <div className="mb-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 mb-0.5">
            <RefreshCw className="h-4 w-4 text-primary animate-pulse" />
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              RTL Language Conversion & Translation
            </p>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
            RTL Translation & Verification
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Compile software algorithms or translate other hardware modules into premium, synthesizable Verilog, VHDL, or SystemVerilog files.
          </p>
        </div>

        {/* WORKSPACE SIDE-BY-SIDE SPLIT VIEW */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          
          {/* LEFT: SOURCE CODE INPUT */}
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                1. Source Algorithm / Module Input
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">Source Language:</span>
                <Select value={fromLanguage} onValueChange={setFromLanguage}>
                  <SelectTrigger className="h-6 w-28 bg-white border-slate-200 text-[10px] font-mono py-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-[10px] font-mono">
                    <SelectItem value="c">C / C++</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="verilog">Verilog</SelectItem>
                    <SelectItem value="vhdl">VHDL</SelectItem>
                    <SelectItem value="systemverilog">SystemVerilog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-elegant">
              <CodeEditor value={sourceCode} onChange={setSourceCode} language={fromLanguage} height="480px" />
              
              {/* COMPILING DIALOG OVERLAY */}
              <AnimatePresence>
                {mutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in"
                  >
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <h3 className="font-display text-base font-bold text-slate-900 mb-1">
                      High-Level Synthesis Compiler Running
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs font-mono">
                      Translating {fromLanguage.toUpperCase()} logic structures into synthesizable, clock-accurate {toLanguage.toUpperCase()} registers...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BUTTON BAR */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
                <span className="text-[10px] font-mono text-slate-500 pl-1.5">Convert to</span>
                <Select value={toLanguage} onValueChange={setToLanguage}>
                  <SelectTrigger className="h-7 w-32 border-none bg-slate-100 text-xs font-semibold py-0 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-xs">
                    <SelectItem value="verilog">Verilog</SelectItem>
                    <SelectItem value="vhdl">VHDL</SelectItem>
                    <SelectItem value="systemverilog">SystemVerilog</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || sourceCode.length < 10}
                className="h-10 px-5 gap-1.5 bg-primary text-white hover:opacity-95 font-semibold text-xs shadow-glow transition-all ml-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${mutation.isPending ? "animate-spin" : ""}`} />
                Execute Synthesis Translation
              </Button>
            </div>
          </div>

          {/* RIGHT: CONVERTED HARDWARE DESIGN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                2. Synthesized Hardware Module
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">
                {toLanguage}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 shadow-elegant bg-white overflow-hidden">
              <CodeEditor 
                value={translatedCode || "// Converted compilable code will populate here after executing translation..."} 
                language={toLanguage} 
                height="480px" 
                readOnly={true} 
              />
            </div>

            {/* EXPORT ACTION */}
            <div className="flex justify-end">
              <Button
                onClick={handleExport}
                disabled={!translatedCode}
                className="h-10 px-5 gap-1.5 bg-gradient-primary text-white font-semibold text-xs shadow-glow transition-all"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Verify Converted Code inside Verifier
              </Button>
            </div>
          </div>

        </div>

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
