import { motion } from "framer-motion";

export interface WaveSignal {
  name: string;
  wave: string;
  data?: string[];
}

interface WaveformViewerProps {
  signals: WaveSignal[];
}

export function WaveformViewer({ signals }: WaveformViewerProps) {
  if (!signals || signals.length === 0) return null;

  // Find max cycles
  const cycles = Math.max(...signals.map(s => s.wave.length));
  
  const cycleWidth = 46;
  const rowHeight = 56;
  const labelWidth = 140;
  const paddingRight = 40;
  const svgWidth = labelWidth + cycles * cycleWidth + paddingRight;
  const svgHeight = signals.length * rowHeight + 36; // Extra space for cycle indexes at the bottom

  // Helper to choose high-contrast colors per signal
  const getSignalColor = (name: string, wave: string): string => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes("clk") || lowercaseName.includes("clock")) {
      return "#0284c7"; // Sky 600 for Clock
    }
    if (lowercaseName.includes("rst") || lowercaseName.includes("reset")) {
      return "#dc2626"; // Red 600 for Reset
    }
    // Check if the wave contains multi-bit states
    const hasBusChars = wave.split("").some(c => !["0", "1", "L", "H", "x", "X", "."].includes(c));
    if (hasBusChars) {
      return "#7c3aed"; // Violet 600 for Bus
    }
    return "#059669"; // Emerald 600 for Data Signals
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-inner">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="auto" className="font-mono text-xs select-none">
        {/* Draw vertical dotted cycle boundary grid lines */}
        {Array.from({ length: cycles + 1 }).map((_, c) => {
          const x = labelWidth + c * cycleWidth;
          return (
            <g key={c}>
              <line
                x1={x}
                y1={10}
                x2={x}
                y2={signals.length * rowHeight + 10}
                stroke="#e2e8f0" /* Light slate grid line */
                strokeDasharray="3,3"
                strokeWidth="1.2"
              />
              <text
                x={x}
                y={signals.length * rowHeight + 25}
                textAnchor="middle"
                fill="#475569" /* Slate cycle text */
                className="text-[9px] font-bold"
              >
                T{c}
              </text>
            </g>
          );
        })}

        {/* Draw each signal row */}
        {signals.map((sig, sIdx) => {
          const rowY = sIdx * rowHeight + 10;
          const clr = getSignalColor(sig.name, sig.wave);

          // Resolve wave strings to remove "." extensions for easy state checks
          let waveChars: string[] = [];
          let current = "0";
          for (let c = 0; c < sig.wave.length; c++) {
            if (sig.wave[c] === ".") {
              waveChars.push(current);
            } else {
              current = sig.wave[c];
              waveChars.push(current);
            }
          }

          const topY = rowY + 12;
          const botY = rowY + 36;
          const midY = rowY + 24;

          let dataIdx = 0;

          return (
            <g key={sig.name}>
              {/* Signal Name Label (Dark Slate-900 for maximum readability) */}
              <text
                x={10}
                y={rowY + 28}
                fill="#0f172a"
                className="font-bold font-mono text-xs"
              >
                {sig.name}
              </text>

              {/* Separator line under row */}
              <line
                x1={0}
                y1={rowY + rowHeight}
                x2={svgWidth}
                y2={rowY + rowHeight}
                stroke="#e2e8f0"
                strokeWidth="0.8"
              />

              {/* Draw cycle-by-cycle wave segment */}
              {waveChars.map((char, c) => {
                const xStart = labelWidth + c * cycleWidth;
                const xEnd = xStart + cycleWidth;
                const xMid = xStart + cycleWidth / 2;

                const prevChar = c > 0 ? waveChars[c - 1] : null;
                const isBus = !["0", "1", "L", "H", "x", "X"].includes(char);
                const prevIsBus = prevChar && !["0", "1", "L", "H", "x", "X"].includes(prevChar);

                // 1. Compute transition vertical boundary line
                let transitionElement = null;
                if (c > 0 && prevChar !== char) {
                  // Only draw a straight vertical line if both are single-bit variables.
                  // (Buses handle transitions through their closed crossover hexagon shape).
                  if (!isBus && !prevIsBus) {
                    const prevY = (prevChar === "1" || prevChar === "H") ? topY : (prevChar === "x" || prevChar === "X") ? midY : botY;
                    const currY = (char === "1" || char === "H") ? topY : (char === "x" || char === "X") ? midY : botY;
                    transitionElement = (
                      <line
                        x1={xStart}
                        y1={prevY}
                        x2={xStart}
                        y2={currY}
                        stroke={clr}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    );
                  }
                }

                // 2. Draw actual signal wave trace
                if (isBus) {
                  const isStart = (c === 0 || sig.wave[c] !== ".");
                  const isEnd = (c === cycles - 1 || sig.wave[c + 1] !== ".");

                  let points = "";
                  if (isStart && isEnd) {
                    // Single-cycle bus bubble
                    points = `${xStart},${midY} ${xStart+4},${topY} ${xEnd-4},${topY} ${xEnd},${midY} ${xEnd-4},${botY} ${xStart+4},${botY}`;
                  } else if (isStart) {
                    // Starting segment of a multi-cycle bus block
                    points = `${xStart},${midY} ${xStart+4},${topY} ${xEnd},${topY} ${xEnd},${botY} ${xStart+4},${botY}`;
                  } else if (isEnd) {
                    // Ending segment of a multi-cycle bus block
                    points = `${xStart},${topY} ${xEnd-4},${topY} ${xEnd},${midY} ${xEnd-4},${botY} ${xStart},${botY}`;
                  } else {
                    // Continuous middle segment
                    points = `${xStart},${topY} ${xEnd},${topY} ${xEnd},${botY} ${xStart},${botY}`;
                  }

                  // Data label rendering (stretch and center across extended multi-cycle blocks)
                  let textLabel = null;
                  if (isStart && sig.data && sig.data[dataIdx] !== undefined) {
                    const labelText = sig.data[dataIdx];
                    dataIdx++;

                    // Find block duration
                    let blockLen = 1;
                    while (c + blockLen < sig.wave.length && sig.wave[c + blockLen] === ".") {
                      blockLen++;
                    }

                    const labelX = xStart + (blockLen * cycleWidth) / 2;
                    textLabel = (
                      <text
                        x={labelX}
                        y={midY + 3.5}
                        textAnchor="middle"
                        fill="#0f172a"
                        className="text-[9px] font-bold font-mono"
                      >
                        {labelText}
                      </text>
                    );
                  }

                  return (
                    <g key={c}>
                      <polygon
                        points={points}
                        fill={`${clr}18`} /* Soft transparent fill */
                        stroke={clr}
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      {textLabel}
                    </g>
                  );
                } else {
                  // Single-bit variable trace
                  const y = (char === "1" || char === "H") ? topY : (char === "x" || char === "X") ? midY : botY;
                  const labelText = (char === "1" || char === "H") ? "1" : (char === "x" || char === "X") ? "X" : "0";
                  const labelY = (char === "1" || char === "H") ? topY - 4 : (char === "x" || char === "X") ? midY - 4 : botY + 10;
                  return (
                    <g key={c}>
                      {transitionElement}
                      <line
                        x1={xStart}
                        y1={y}
                        x2={xEnd}
                        y2={y}
                        stroke={clr}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <text
                        x={xMid}
                        y={labelY}
                        textAnchor="middle"
                        fill={clr}
                        className="text-[8px] font-extrabold font-mono opacity-80 select-none pointer-events-none"
                      >
                        {labelText}
                      </text>
                    </g>
                  );
                }
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
