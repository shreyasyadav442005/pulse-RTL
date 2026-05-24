import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const PIPELINE_STEPS = [
  "Parsing RTL",
  "Detecting syntax issues",
  "Evaluating timing risks",
  "Optimizing architecture",
  "Generating testbench",
  "Creating edge cases",
  "Predicting outputs",
  "Building engineering summary",
];

interface Props {
  /** -1 = idle, 0..n-1 = currently running step, n = done */
  activeStep: number;
  running: boolean;
}

export function AgentPipeline({ activeStep, running }: Props) {
  // Static micro-status descriptions per phase to provide high-fidelity logging
  const microStatus = [
    "Compiling HDL structure...",
    "Scanning lint variables...",
    "Evaluating latch conditions...",
    "Simplifying logical blocks...",
    "Synthesizing dynamic asserts...",
    "Evaluating boundary limits...",
    "Drawing logical timings...",
    "Assembling metrics tables..."
  ];

  return (
    <div className="w-full">
      <ol className="space-y-1">
        {PIPELINE_STEPS.map((label, i) => {
          const done = i < activeStep || (!running && activeStep >= PIPELINE_STEPS.length);
          const current = running && i === activeStep;
          const timestamp = (i * 0.2 + 0.15).toFixed(2);
          
          return (
            <li
              key={i}
              className={cn(
                "group flex flex-col justify-center rounded-md border px-2.5 py-1.5 transition-all duration-300",
                current && "border-primary/45 bg-primary/5 shadow-[0_0_8px_oklch(0.52_0.18_258_/_0.15)]",
                done && "border-success/15 bg-success/5/20",
                !current && !done && "border-transparent opacity-55"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success">
                        <Check className="h-3 w-3" />
                      </motion.div>
                    ) : current ? (
                      <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground/35">
                        <Circle className="h-1.5 w-1.5 fill-current" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-[10px] font-mono text-slate-400">[{String(i + 1).padStart(2, "0")}]</span>
                <span
                  className={cn(
                    "text-xs transition-colors",
                    current && "text-slate-900 font-bold",
                    done && "text-slate-700 font-semibold",
                    !current && !done && "text-slate-400"
                  )}
                >
                  {label}
                </span>

                {/* Sub-label Simulation Timestamp */}
                {done && (
                  <span className="ml-auto text-[9px] font-mono text-slate-400 font-medium">
                    +{timestamp}s
                  </span>
                )}
              </div>

              {/* Collapsible active step micro-status indicator */}
              {current && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="pl-7 mt-0.5 overflow-hidden"
                >
                  <p className="text-[9px] font-mono text-primary font-semibold animate-pulse">
                    {microStatus[i] || "Executing..."}
                  </p>
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
