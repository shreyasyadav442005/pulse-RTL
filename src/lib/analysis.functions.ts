import { createServerFn } from "@tanstack/react-start";

export type AnalysisResult = {
  issues: { line?: number; severity: "error" | "warning" | "info"; message: string; suggestion?: string }[];
  timingWarnings: { type: string; message: string; risk: "low" | "medium" | "high" }[];
  optimizedCode: string;
  testbench: string;
  edgeCases: { name: string; description: string }[];
  outputPrediction: string;
  simpleExplanation: string;
  engineeringSummary: string;
  circuitType: string;

  // Engineering metrics
  riskLevel: number;
  codeQualityScore: number;
  timingStability: number;
  verificationCoverage: number;

  // Visual Waveform rendering data
  waveform?: {
    signals: { name: string; wave: string; data?: string[] }[];
  };
};

const SYSTEM_PROMPT = `You are PulseRTL, a senior RTL verification and embedded systems engineer.
Analyze the provided Verilog / SystemVerilog / Embedded C code with extreme engineering rigor.

Detect:
- Syntax issues (missing semicolons, undeclared signals, width mismatches, invalid assignments, port/module problems)
- Timing & hardware risks (latch inference, combinational loops, blocking vs non-blocking misuse, setup/hold, reset issues, metastability)
- Optimization opportunities (pipelining, reset handling, naming, reduced combinational depth, FSM simplification)

Then generate the following structural elements:
- Rewrite an optimized, clean, synthesizable version of the code
- Generate a complete self-checking testbench (clock, reset, stimulus, monitoring, assertions)
- Propose realistic hardware edge test cases (overflow, max values, reset-during-op, illegal states)
- Predict output waveform behavior in clean, pre-formatted plain text
- Explain functionality in simple engineering terms
- Provide a concise engineering summary
- Identify the specific functional circuit type/function (e.g. '4-bit Binary Counter', 'SPI Master Transceiver', '3-to-8 Decoder', 'Traffic Light FSM Controller', '8-bit Arithmetic Logic Unit', etc.) based on the code's behavioral operations and port configurations, returning it as 'circuitType'.
- Score the following metrics (0-100):
  1. riskLevel (higher risk = worse/more dangerous)
  2. codeQualityScore (cleanliness, style, best practices)
  3. timingStability (susceptibility to latch/timing hazards, higher is more stable)
  4. verificationCoverage (estimated coverage of the generated testbench)
- Predict timing diagram waveform details under 'waveform' in simplified WaveDrom format to visualize variables. Let it span 8-16 clock cycles.

Respond ONLY with valid JSON matching the schema. Do not wrap in markdown code blocks.`;

const SCHEMA_HINT = `{
  "issues": [{"line": 12, "severity": "error|warning|info", "message": "...", "suggestion": "..."}],
  "timingWarnings": [{"type": "latch|loop|blocking|reset|setup-hold|metastability", "message": "...", "risk": "low|medium|high"}],
  "optimizedCode": "full rewritten module as string with \\n newlines",
  "testbench": "complete testbench module as string",
  "edgeCases": [{"name": "...", "description": "..."}],
  "outputPrediction": "text description of expected waveform/output transitions",
  "simpleExplanation": "plain-language explanation",
  "engineeringSummary": "concise technical summary",
  "circuitType": "specific functional circuit type/function identified",
  "riskLevel": 0,
  "codeQualityScore": 0,
  "timingStability": 0,
  "verificationCoverage": 0,
  "waveform": {
    "signals": [
      {"name": "clk", "wave": "010101010101"},
      {"name": "rst", "wave": "110000000000"},
      {"name": "out", "wave": "0...1...2...", "data": ["0", "1", "2"]}
    ]
  }
}`;

export const analyzeCode = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; language: string }) => {
    if (!data?.code || data.code.length < 5) throw new Error("Code is required");
    if (data.code.length > 30000) throw new Error("Code too long (max 30k chars)");
    return data;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured on the server. Please add it to your environment or .env file.");
    }

    const userPrompt = `Language: ${data.language}\n\nCode:\n\`\`\`\n${data.code}\n\`\`\`\n\nRespond with JSON conforming to this schema:\n${SCHEMA_HINT}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: userPrompt
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: SYSTEM_PROMPT
            }
          ]
        },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) {
        throw new Error("Gemini API rate limit exceeded. Please check your usage plan or try again shortly.");
      }
      throw new Error(`Gemini API error (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const contentText: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed: any;
    try {
      const cleaned = contentText.replace(/^```json\s*|\s*```$/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Defensive defaults
    return {
      issues: parsed.issues ?? [],
      timingWarnings: parsed.timingWarnings ?? [],
      optimizedCode: parsed.optimizedCode ?? "",
      testbench: parsed.testbench ?? "",
      edgeCases: parsed.edgeCases ?? [],
      outputPrediction: parsed.outputPrediction ?? "",
      simpleExplanation: parsed.simpleExplanation ?? "",
      engineeringSummary: parsed.engineeringSummary ?? "",
      circuitType: parsed.circuitType ?? "Standard Synchronous Logic Module",
      riskLevel: Math.max(0, Math.min(100, parsed.riskLevel ?? 20)),
      codeQualityScore: Math.max(0, Math.min(100, parsed.codeQualityScore ?? 80)),
      timingStability: Math.max(0, Math.min(100, parsed.timingStability ?? 75)),
      verificationCoverage: Math.max(0, Math.min(100, parsed.verificationCoverage ?? 60)),
      waveform: parsed.waveform ?? undefined,
    } satisfies AnalysisResult;
  });

export const synthesizeCode = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; fromLanguage: string; toLanguage: string }) => {
    if (!data?.code || data.code.length < 5) throw new Error("Source code is required");
    return data;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured on the server. Please add it to your environment or .env file.");
    }

    const systemPrompt = `You are PulseRTL, an elite High-Level Synthesis (HLS) compiler and RTL translation engine.
Your task is to translate software algorithms (C/C++, Python) or hardware descriptions (VHDL, Verilog, SystemVerilog) from a source language to a target hardware description language (Verilog, VHDL, or SystemVerilog).

CRITICAL REQUIREMENTS:
1. The generated code MUST be 100% syntactically correct and fully synthesizable for standard FPGA/ASIC toolchains.
2. The generated code must contain ZERO compilation errors, latch inferences (unless explicitly needed, e.g. for specialized circuits, but standard registers/flops are strongly preferred), setup/hold hazards, or combinational loops.
3. You must use clean, standard digital design conventions:
   - Synchronous resets, clear clock edges, parameterized widths where appropriate.
   - For Verilog: use non-blocking assignments (<=) inside sequential always blocks and blocking assignments (=) inside combinational always blocks.
   - Explicitly declare all ports, inputs, outputs, registers (reg/logic), and wires.
   - Do NOT use un-synthesizable constructs (e.g., #delay, initial blocks for logic, dynamic loops, floating-point divisions unless using specific IP blocks).
4. The translated module must represent a highly accurate, cycle-by-cycle behavioral or structural translation of the source code.
5. Provide ONLY the final code inside a JSON format with a single key 'translatedCode'. Do NOT wrap the code in markdown inside the JSON value. Keep comments in the code explaining the interface and mapping.
6. The generated code MUST be robust enough that when verified inside the PulseRTL Verifier, it receives 0 errors and a High Code Quality Score (90+).

Respond ONLY with valid JSON matching the schema:
{
  "translatedCode": "string containing the full synthesizable module code with \\n newlines"
}`;

    const userPrompt = `Source Language: ${data.fromLanguage}
Target Language: ${data.toLanguage}

Source Code:
\`\`\`
${data.code}
\`\`\`

Translate this design into highly accurate, 100% synthesizable ${data.toLanguage.toUpperCase()} code. Ensure it is clean, optimized, and ready for digital signoff.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: userPrompt
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: systemPrompt
            }
          ]
        },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) {
        throw new Error("Gemini API rate limit exceeded. Please check your usage plan or try again shortly.");
      }
      throw new Error(`Gemini API error (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const contentText: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed: any;
    try {
      const cleaned = contentText.replace(/^```json\s*|\s*```$/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error("Failed to parse AI translation response as JSON");
    }

    return {
      translatedCode: parsed.translatedCode ?? ""
    };
  });

