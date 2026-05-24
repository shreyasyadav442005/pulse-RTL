import { motion } from "framer-motion";
import { AlertTriangle, Cpu, Activity, CheckCircle2 } from "lucide-react";

interface Props {
  riskLevel: number;
  codeQualityScore: number;
  timingStability: number;
  verificationCoverage: number;
}

function MetricCard({
  label,
  value,
  icon,
  statusText,
  statusColor,
  barColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  statusText: string;
  statusColor: string;
  barColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
          {icon}
          {label}
        </span>
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${statusColor}`}>
          {statusText}
        </span>
      </div>
      <div className="flex items-baseline gap-0.5 mb-1.5">
        <span className="font-mono text-2xl font-bold tracking-tight text-slate-900">{Math.round(value)}</span>
        <span className="text-[10px] font-mono text-slate-400">%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export function ScoreCards({
  riskLevel,
  codeQualityScore,
  timingStability,
  verificationCoverage,
}: Props) {
  // Determine risk level status (low risk is good, so low risk gets green, high gets red)
  const getRiskStatus = (val: number) => {
    if (val >= 70) return { text: "Critical Risk", color: "bg-destructive/10 text-destructive border-destructive/20", bar: "bg-destructive" };
    if (val >= 40) return { text: "Moderate Risk", color: "bg-warning/10 text-warning border-warning/20", bar: "bg-warning" };
    return { text: "Optimal Safety", color: "bg-success/10 text-success border-success/20", bar: "bg-success" };
  };

  // Determine code quality status
  const getQualityStatus = (val: number) => {
    if (val >= 85) return { text: "Excellent", color: "bg-primary/10 text-primary border-primary/20", bar: "bg-primary" };
    if (val >= 60) return { text: "Acceptable", color: "bg-primary/10 text-primary border-primary/20", bar: "bg-primary" };
    return { text: "Needs Refactor", color: "bg-destructive/10 text-destructive border-destructive/20", bar: "bg-destructive" };
  };

  // Determine timing stability status
  const getTimingStatus = (val: number) => {
    if (val >= 80) return { text: "Stable", color: "bg-success/10 text-success border-success/20", bar: "bg-success" };
    if (val >= 50) return { text: "Warnings", color: "bg-warning/10 text-warning border-warning/20", bar: "bg-warning" };
    return { text: "Metastable", color: "bg-destructive/10 text-destructive border-destructive/20", bar: "bg-destructive" };
  };

  // Determine verification coverage status
  const getCoverageStatus = (val: number) => {
    if (val >= 90) return { text: "High Coverage", color: "bg-success/10 text-success border-success/20", bar: "bg-success" };
    if (val >= 70) return { text: "Sufficient", color: "bg-primary/10 text-primary border-primary/20", bar: "bg-primary" };
    return { text: "Low Coverage", color: "bg-warning/10 text-warning border-warning/20", bar: "bg-warning" };
  };

  const risk = getRiskStatus(riskLevel);
  const quality = getQualityStatus(codeQualityScore);
  const timing = getTimingStatus(timingStability);
  const coverage = getCoverageStatus(verificationCoverage);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MetricCard
        label="Risk Level"
        value={riskLevel}
        icon={<AlertTriangle className="h-3.5 w-3.5" />}
        statusText={risk.text}
        statusColor={risk.color}
        barColor={risk.bar}
      />
      <MetricCard
        label="Code Quality"
        value={codeQualityScore}
        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        statusText={quality.text}
        statusColor={quality.color}
        barColor={quality.bar}
      />
      <MetricCard
        label="Timing Stability"
        value={timingStability}
        icon={<Activity className="h-3.5 w-3.5" />}
        statusText={timing.text}
        statusColor={timing.color}
        barColor={timing.bar}
      />
      <MetricCard
        label="Verification Coverage"
        value={verificationCoverage}
        icon={<Cpu className="h-3.5 w-3.5" />}
        statusText={coverage.text}
        statusColor={coverage.color}
        barColor={coverage.bar}
      />
    </div>
  );
}
