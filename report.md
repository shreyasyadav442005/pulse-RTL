# PulseRTL — Complete Project Workflow & Data Flow Report

> **Version:** v1.2-beta  
> **Stack:** React 19 + TanStack Start + TanStack Router + Vite + Tailwind CSS v4  
> **AI Engine:** Google Gemini 2.5 Flash (via Direct REST API)  
> **Target Platforms:** FPGA / ASIC (Vivado, Quartus, Yosys)  
> **Standards:** IEEE 1364 (Verilog), IEEE 1800 (SystemVerilog)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack & Dependencies](#2-technology-stack--dependencies)
3. [Directory Structure](#3-directory-structure)
4. [Application Architecture](#4-application-architecture)
5. [Routing System](#5-routing-system)
6. [Data Flow — RTL Verification Pipeline](#6-data-flow--rtl-verification-pipeline)
7. [Data Flow — HLS Synthesizer Pipeline](#7-data-flow--hls-synthesizer-pipeline)
8. [Component Breakdown](#8-component-breakdown)
9. [Server-Side Functions & AI Integration](#9-server-side-functions--ai-integration)
10. [AnalysisResult Data Schema](#10-analysisresult-data-schema)
11. [Waveform Rendering System](#11-waveform-rendering-system)
12. [Engineering Summary & Circuit Classification](#12-engineering-summary--circuit-classification)
13. [Error Handling](#13-error-handling)
14. [UI Design System](#14-ui-design-system)
15. [End-to-End Flow Diagrams](#15-end-to-end-flow-diagrams)

---

## 1. Project Overview

**PulseRTL** is an autonomous RTL (Register Transfer Level) verification and signoff engineering workspace. It is a browser-based EDA (Electronic Design Automation) tool that accepts hardware description code in **Verilog**, **SystemVerilog**, or **Embedded C**, then runs it through a Gemini-powered analysis pipeline to:

- Detect syntax errors, timing hazards, and latch inferences
- Produce an optimized, synthesizable version of the submitted code
- Generate self-checking testbenches
- Predict digital logic timing waveforms with cycle-by-cycle accuracy
- Classify the specific functional circuit type (e.g., `4-bit Binary Counter`, `SPI Master Transceiver`)
- Output a formal EDA Verification Signoff Report

The project also includes a **High-Level Synthesizer (HLS)** that translates software algorithms (C/C++, Python) or hardware descriptions (VHDL) into synthesizable Verilog, VHDL, or SystemVerilog. Converted designs can be seamlessly exported and loaded into the main Verifier for immediate signoff.

---

## 2. Technology Stack & Dependencies

### Core Framework
| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.x |
| Routing & SSR | TanStack Router + TanStack Start | 1.x |
| Build Tool | Vite | 7.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Animation | Framer Motion | 12.x |
| Deployment Runtime | Cloudflare Workers (via `@cloudflare/vite-plugin`) | — |

### AI & Data
| Purpose | Library |
|---------|---------|
| AI Analysis Engine | Google Gemini 2.5 Flash REST API |
| Server Functions | `@tanstack/react-start` `createServerFn` |
| Client State Mutations | `@tanstack/react-query` `useMutation` |

### UI Components
| Category | Library |
|----------|---------|
| Primitives | Radix UI (accordion, tabs, select, badge, dialog, etc.) |
| Code Editor | `@monaco-editor/react` (Monaco Editor) |
| Toast Notifications | Sonner |
| Icons | Lucide React |

---

## 3. Directory Structure

```
siliconpilot-ai-main/
├── src/
│   ├── components/           # All reusable UI components
│   │   ├── AgentPipeline.tsx   # 8-step pipeline tracker
│   │   ├── CodeEditor.tsx      # Monaco editor wrapper
│   │   ├── Navbar.tsx          # Sticky top navigation bar
│   │   ├── OutputTabs.tsx      # Tabbed analysis results viewer
│   │   ├── ScoreCards.tsx      # 4-metric engineering score cards
│   │   ├── WaveformViewer.tsx  # SVG timing waveform renderer
│   │   └── ui/                 # Radix UI primitive wrappers (Button, Badge, Tabs, etc.)
│   │
│   ├── lib/
│   │   ├── analysis.functions.ts  # Server functions + Gemini API calls
│   │   ├── examples.ts            # Built-in RTL code examples
│   │   ├── utils.ts               # Tailwind class utility (cn)
│   │   ├── error-capture.ts       # SSR error capture helper
│   │   └── error-page.ts          # Static error page renderer
│   │
│   ├── routes/
│   │   ├── __root.tsx        # Root shell: QueryClient, Toaster, HTML wrapper
│   │   ├── index.tsx         # / — Main RTL Verification Workspace
│   │   ├── synthesizer.tsx   # /synthesizer — HLS Translation Page
│   │   ├── docs.tsx          # /docs — Documentation & User Manual
│   │   └── about.tsx         # /about — About page
│   │
│   ├── styles.css            # Global Tailwind CSS + design tokens
│   ├── router.tsx            # TanStack router instantiation
│   ├── server.ts             # Cloudflare Worker fetch handler
│   └── start.ts              # App entry point
│
├── .env                      # GEMINI_API_KEY environment variable
├── package.json              # Dependencies & scripts
├── vite.config.ts            # Vite + Cloudflare plugin config
├── tsconfig.json             # TypeScript configuration
└── report.md                 # This file
```

---

## 4. Application Architecture

PulseRTL uses a **full-stack React SSR architecture** via TanStack Start:

```
Browser (Client)
     │
     ▼
TanStack Router  ──────── File-based routing from /src/routes/
     │
     ▼
React Pages (Client-rendered after SSR hydration)
     │
     │  (on form submit / button click)
     ▼
TanStack Query (useMutation)
     │
     │  (calls createServerFn — crosses the server boundary)
     ▼
TanStack Start Server Functions  (/src/lib/analysis.functions.ts)
     │
     │  (HTTP POST to Gemini API)
     ▼
Google Gemini 2.5 Flash REST API
     │
     │  (JSON response parsed and returned)
     ▼
React State (setResult / setTranslatedCode)
     │
     ▼
UI Components (OutputTabs, WaveformViewer, ScoreCards, etc.)
```

### Key Architectural Decisions

- **`createServerFn`**: TanStack Start's server function boundary. Code inside these functions runs exclusively on the server (Node.js/Cloudflare Worker), keeping the `GEMINI_API_KEY` entirely server-side and never exposed to the browser.
- **Direct API Model**: No backend database. The application communicates directly with the Gemini API per request. No user authentication is required.
- **LocalStorage Bridge**: The HLS Synthesizer → Verifier handoff uses `localStorage` as a one-time transfer mechanism. After the verifier reads the code, the keys are immediately deleted to prevent loops.

---

## 5. Routing System

TanStack Router provides type-safe, file-based routing:

| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/routes/index.tsx` | Main RTL Verification Workspace |
| `/synthesizer` | `src/routes/synthesizer.tsx` | HLS Code Translation Tool |
| `/docs` | `src/routes/docs.tsx` | User Documentation & Manual |
| `/about` | `src/routes/about.tsx` | Project information page |
| `*` (404) | `src/routes/__root.tsx` | NotFoundComponent |

The root route (`__root.tsx`) wraps all child routes in a `QueryClientProvider` (for React Query), a global `Toaster` component (for toast notifications), and injects the global stylesheet (`styles.css`).

---

## 6. Data Flow — RTL Verification Pipeline

This is the primary user journey. Below is the complete step-by-step data flow.

### Step 1 — Code Input
The user inputs code via one of three methods:
- **Type/Paste** directly into the Monaco editor (`CodeEditor.tsx`)
- **Upload a File** (`.v`, `.sv`, `.svh`, `.c`, `.h`) — FileReader API reads the file and sets it as editor state
- **Import from HLS Synthesizer** — On mount, `index.tsx` checks `localStorage` for `pulselt_import_code` and `pulselt_import_lang`, loads them, then immediately clears both keys

```
User Input ──► code (useState) + language (useState)
                       │
                       ▼
              CodeEditor.tsx (Monaco)
              ↳ Syntax highlighting via custom Monarch tokenizer for Verilog/SV
              ↳ Line count + character count shown below editor
```

### Step 2 — Pipeline Trigger
When the user clicks **"Run Verification Pipeline"**:

```
Button onClick ──► mutation.mutate()  [useMutation from @tanstack/react-query]
                       │
                       ▼
              Input Validation:
              - Rejects if code equals placeholder text
              - Rejects if code.length < 15 characters
```

### Step 3 — Pipeline Animation
While the API call is in-flight, the pipeline animation runs:

```
setActiveStep(0)  ──► setInterval fires every 700ms
                       │ increments step 0..7
                       ▼
              AgentPipeline.tsx renders 8 steps:
              [01] Parsing RTL           → "Compiling HDL structure..."
              [02] Detecting syntax      → "Scanning lint variables..."
              [03] Evaluating timing     → "Evaluating latch conditions..."
              [04] Optimizing arch       → "Simplifying logical blocks..."
              [05] Generating testbench  → "Synthesizing dynamic asserts..."
              [06] Creating edge cases   → "Evaluating boundary limits..."
              [07] Predicting outputs    → "Drawing logical timings..."
              [08] Building summary      → "Assembling metrics tables..."
```

Each step renders with animated icons (idle ● → spinning ⟳ → done ✓) and a simulated timestamp (e.g., `+0.35s`) for completed steps.

### Step 4 — Server Function Call

```
analyzeFn({ data: { code, language } })
    │
    │  [crosses server boundary via createServerFn]
    ▼
analyzeCode() handler in analysis.functions.ts
    │
    ├── Reads GEMINI_API_KEY from process.env
    ├── Validates: code.length >= 5, code.length <= 30,000
    │
    ▼
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
    Body:
    ├── systemInstruction: SYSTEM_PROMPT (RTL engineer persona + detection rules)
    ├── contents[0]: userPrompt (language + code + SCHEMA_HINT)
    └── generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
```

**SYSTEM_PROMPT directives to Gemini:**
1. Detect syntax issues, timing risks, optimization opportunities
2. Rewrite optimized synthesizable code
3. Generate self-checking testbench
4. Propose realistic edge test cases
5. Predict output waveform in plain text
6. Write a functional explanation
7. Write an engineering summary
8. **Classify the specific circuit type** (e.g., `"4-bit Binary Counter"`) as `circuitType`
9. Score 4 metrics: riskLevel, codeQualityScore, timingStability, verificationCoverage
10. Generate WaveDrom-format waveform signals (8–16 clock cycles)

### Step 5 — Response Parsing

```
Gemini JSON Response
    │
    ├── Strip markdown code fences (```json ... ```) if present
    ├── JSON.parse(cleaned)
    │
    └── Defensive defaults applied:
        issues                → [] if missing
        timingWarnings        → [] if missing
        optimizedCode         → "" if missing
        testbench             → "" if missing
        edgeCases             → [] if missing
        outputPrediction      → "" if missing
        simpleExplanation     → "" if missing
        engineeringSummary    → "" if missing
        circuitType           → "Standard Synchronous Logic Module" if missing
        riskLevel             → clamped to [0, 100], default 20
        codeQualityScore      → clamped to [0, 100], default 80
        timingStability       → clamped to [0, 100], default 75
        verificationCoverage  → clamped to [0, 100], default 60
        waveform              → undefined if missing
```

### Step 6 — State Update & UI Render

```
setResult(data)  ──► AnalysisResult object stored in React state
                        │
                        ├── ScoreCards.tsx  (riskLevel, codeQualityScore,
                        │                   timingStability, verificationCoverage)
                        │
                        └── OutputTabs.tsx  (8 tabs, all data)
                                │
                                ├── Tab: Issues
                                ├── Tab: Timing Warnings
                                ├── Tab: Optimized Code (side-by-side Monaco)
                                ├── Tab: Testbench (Monaco, downloadable)
                                ├── Tab: Edge Cases
                                ├── Tab: Output Prediction
                                │     └── WaveformViewer.tsx (SVG)
                                ├── Tab: Explain Simply
                                └── Tab: Engineering Summary (Signoff Report)
```

---

## 7. Data Flow — HLS Synthesizer Pipeline

### Step 1 — Source Input
User pastes source code (C/C++, Python, VHDL, Verilog, or SystemVerilog) into the Monaco editor on the **Synthesizer** page.

```
sourceCode (useState) + fromLanguage (useState) + toLanguage (useState)
```

### Step 2 — Translation Trigger
User selects the target language and clicks **"Execute Synthesis Translation"**:

```
mutation.mutate()
    │
    ├── Validates: code not placeholder, code.length >= 10
    │
    ▼
synthesizeFn({ data: { code, fromLanguage, toLanguage } })
    │  [createServerFn server boundary]
    ▼
synthesizeCode() handler in analysis.functions.ts
```

### Step 3 — Gemini HLS Translation

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
    Body:
    ├── systemInstruction: HLS system prompt (synthesizable code rules)
    │     Rules enforced:
    │     ├── 100% synthesizable output (no #delay, no initial blocks for logic)
    │     ├── Synchronous resets, clear clock edges
    │     ├── Non-blocking (<=) in sequential, blocking (=) in combinational
    │     ├── Zero latch inferences, zero combinational loops
    │     └── Explicit port, register, wire declarations
    │
    ├── contents[0]: userPrompt (source lang, target lang, source code)
    └── generationConfig: { responseMimeType: "application/json", temperature: 0.1 }

Response schema: { "translatedCode": "string" }
```

### Step 4 — Display & Export

```
setTranslatedCode(data.translatedCode)
    │
    ├── Rendered in right-side Monaco editor (read-only)
    │
    └── "Verify Converted Code" button:
            │
            └── localStorage.setItem("pulselt_import_code", translatedCode)
                localStorage.setItem("pulselt_import_lang", toLanguage)
                navigate({ to: "/" })
                    │
                    └── index.tsx useEffect reads keys on mount
                        ─► sets code + language state
                        ─► clears localStorage keys
                        ─► toast notification shown
```

---

## 8. Component Breakdown

### `Navbar.tsx`
- **Purpose:** Sticky top navigation bar across all pages
- **Props:** `hideLinks?: boolean`, `showBack?: boolean`
- **Behavior:**
  - Shows **PulseRTL** logo + subtitle `"RTL Verification & Timing Analysis Workspace"`
  - Main links: Synthesizer → Docs → About (hidden on Synthesizer page via `hideLinks`)
  - Synthesizer page shows a `← Back to Verifier` button instead

---

### `CodeEditor.tsx`
- **Purpose:** Monaco Editor wrapper supporting Verilog/SV/C/Python
- **Props:** `value`, `onChange`, `language`, `height`, `readOnly`
- **Key Features:**
  - Registers a custom Monarch tokenizer for `verilog` language if not already present
  - Supports all Verilog/SystemVerilog keywords, operators, string literals, and number formats
  - Uses `vs-dark` theme with `JetBrains Mono` font
  - Read-only mode for output panels (Optimized Code, Testbench) — cursor changes to `solid`

---

### `AgentPipeline.tsx`
- **Purpose:** Animated 8-step execution pipeline tracker
- **Props:** `activeStep: number`, `running: boolean`
- **Steps:**
  1. Parsing RTL
  2. Detecting syntax issues
  3. Evaluating timing risks
  4. Optimizing architecture
  5. Generating testbench
  6. Creating edge cases
  7. Predicting outputs
  8. Building engineering summary
- **Visual States:**
  - `idle`: dimmed dot, 55% opacity
  - `current`: blue border glow, spinning loader, micro-status text pulses
  - `done`: green checkmark, simulated timestamp (`+0.35s`)

---

### `ScoreCards.tsx`
- **Purpose:** Four animated metric cards displayed in the Engineering Diagnostics panel
- **Props:** `riskLevel`, `codeQualityScore`, `timingStability`, `verificationCoverage` (all `number`, 0–100)
- **Metrics & Thresholds:**

| Metric | Green (good) | Amber (warn) | Red (critical) |
|--------|-------------|-------------|----------------|
| Risk Level | < 40 → "Optimal Safety" | 40–69 → "Moderate Risk" | ≥ 70 → "Critical Risk" |
| Code Quality | ≥ 85 → "Excellent" | 60–84 → "Acceptable" | < 60 → "Needs Refactor" |
| Timing Stability | ≥ 80 → "Stable" | 50–79 → "Warnings" | < 50 → "Metastable" |
| Coverage | ≥ 90 → "High Coverage" | 70–89 → "Sufficient" | < 70 → "Low Coverage" |

Each card has a `h-1` animated progress bar that fills from 0 to the metric value over 1 second.

---

### `OutputTabs.tsx`
- **Purpose:** Full 8-tab diagnostic results system rendered after analysis completes
- **Props:** `result: AnalysisResult`, `originalCode: string`, `language: string`
- **Internal Logic:**
  - Detects literal module/entity name via regex: `/(?:module|entity)\s+(\w+)/i`
  - Provides fallback waveform signals if `result.waveform` is empty (counter, FSM, or GPIO patterns)
  - Educational explainer function `getEducationalExplanation()` maps issue messages to deep hardware engineering explanations

**Tab contents:**

| Tab | Content |
|-----|---------|
| Issues | Per-issue cards with severity icon, line number, message, suggestion, and collapsible "Why This Was Flagged" accordion |
| Timing Warnings | Warning cards with type, risk badge (LOW/MEDIUM/HIGH), message, and "Why This Was Flagged" accordion |
| Optimized Code | Side-by-side Monaco diff (original left, optimized right). If zero issues → "RTL Module is Synthesizable" card |
| Testbench | Full testbench in Monaco editor with Download button |
| Edge Cases | Grid of edge case cards (name + description) |
| Output Prediction | WaveformViewer SVG timing diagram + text prediction below |
| Explain Simply | Plain-language functional description |
| Engineering Summary | Formal EDA signoff report (circuit type, module name, verification status, timing, coverage, next steps) |

---

### `WaveformViewer.tsx`
- **Purpose:** Renders cycle-by-cycle SVG timing waveforms from WaveDrom-style signal data
- **Props:** `signals: WaveSignal[]` where `WaveSignal = { name: string; wave: string; data?: string[] }`
- **Wave Notation:**
  - `0` / `1` / `L` / `H` — Digital low/high states
  - `x` / `X` — Unknown/don't-care state
  - `.` — Continue previous state
  - Any other character — Multi-bit bus value (uses `data[]` labels)
- **Rendering Details:**
  - `cycleWidth = 46px`, `rowHeight = 56px`, `labelWidth = 140px`
  - Signal color assignment: clock=sky, reset=red, bus=violet, other=emerald
  - Vertical dotted grid lines + cycle index labels (`T0`, `T1`, ...) at bottom
  - Single-bit traces: horizontal lines at `topY`, `midY`, or `botY` with vertical transition lines
  - **Logic state labels**: `1`, `0`, or `X` rendered centered inside each clock cycle in matching signal color at 8px bold monospace
  - Bus traces: polygon hexagon shapes with transparent fill + data value label centered across multi-cycle blocks

---

## 9. Server-Side Functions & AI Integration

Both server functions live in `src/lib/analysis.functions.ts` and are created with `createServerFn({ method: "POST" })` from `@tanstack/react-start`.

### `analyzeCode`
```
Input validation: code >= 5 chars, code <= 30,000 chars

→ POST to Gemini 2.5 Flash
  system: SYSTEM_PROMPT (RTL engineer persona)
  user: language + code + SCHEMA_HINT
  config: responseMimeType="application/json", temperature=0.2

→ Response: full AnalysisResult JSON
```

### `synthesizeCode`
```
Input validation: code >= 5 chars

→ POST to Gemini 2.5 Flash
  system: HLS compiler persona (synthesizable code rules)
  user: source lang + target lang + source code
  config: responseMimeType="application/json", temperature=0.1

→ Response: { translatedCode: string }
```

**Error Handling in Server Functions:**
- Missing `GEMINI_API_KEY` → throws descriptive error
- HTTP 429 (rate limit) → throws user-friendly message
- Any other non-2xx → throws with status code + first 200 chars of response body
- JSON parse failure → throws `"Failed to parse AI response as JSON"`

---

## 10. AnalysisResult Data Schema

```typescript
type AnalysisResult = {
  // Diagnostic arrays
  issues: {
    line?: number;
    severity: "error" | "warning" | "info";
    message: string;
    suggestion?: string;
  }[];

  timingWarnings: {
    type: string;           // e.g. "latch", "blocking", "metastability"
    message: string;
    risk: "low" | "medium" | "high";
  }[];

  // Generated code artifacts
  optimizedCode: string;    // Full synthesizable rewritten module
  testbench: string;        // Self-checking testbench module

  // Behavioral analysis
  edgeCases: { name: string; description: string }[];
  outputPrediction: string;  // Plain-text waveform description
  simpleExplanation: string; // High-level functional description
  engineeringSummary: string; // Concise technical summary

  // AI-classified circuit type (e.g. "4-bit Binary Counter")
  circuitType: string;

  // Engineering metrics (0–100)
  riskLevel: number;
  codeQualityScore: number;
  timingStability: number;
  verificationCoverage: number;

  // WaveDrom-compatible timing waveform
  waveform?: {
    signals: {
      name: string;         // Signal label
      wave: string;         // WaveDrom wave string (e.g. "010101...")
      data?: string[];      // Bus value labels
    }[];
  };
};
```

---

## 11. Waveform Rendering System

The waveform viewer operates on a purely SVG-based custom renderer (no third-party WaveDrom library).

### Wave Character Resolution
Before drawing, the raw `wave` string is pre-processed to expand `.` (hold) characters:
```
Input:  wave = "0...1..."
Result: waveChars = ["0","0","0","0","1","1","1","1"]
```

### Rendering Logic Per Cycle
For each cycle `c` and character `char`:

1. **Determine signal type:** `isBus = !["0","1","L","H","x","X"].includes(char)`
2. **Single-bit signals:**
   - Calculate `y = topY (char=1/H) | midY (char=x/X) | botY (char=0/L)`
   - Draw horizontal `<line>` at y from `xStart` to `xEnd`
   - If transition from previous char: draw vertical `<line>` connecting prev y to curr y
   - **Overlay logic state label:** Draw `<text>` at `xMid` with:
     - `labelText = "1" | "0" | "X"`
     - `labelY = topY-4 (high) | botY+10 (low) | midY-4 (unknown)`
     - Style: `text-[8px] font-extrabold font-mono opacity-80`
3. **Bus signals (multi-bit):**
   - Detect block start/end positions
   - Draw hexagon `<polygon>` shapes (start cap, middle rectangle, end cap)
   - Render centered data label from `sig.data[dataIdx]`

### Signal Color Mapping
| Signal Name Contains | Color | Tailwind Approx |
|---------------------|-------|-----------------|
| `clk` / `clock` | `#0284c7` | Sky 600 |
| `rst` / `reset` | `#dc2626` | Red 600 |
| Bus characters | `#7c3aed` | Violet 600 |
| Everything else | `#059669` | Emerald 600 |

---

## 12. Engineering Summary & Circuit Classification

### Circuit Type Detection
The Gemini model is instructed to analyze the behavioral operations, port configurations, and always-block logic to identify the specific functional circuit class and return it as `circuitType`.

Example outputs:
- `"4-bit Synchronous Binary Counter"`
- `"3-State Traffic Light FSM Controller"`
- `"SPI Master Transceiver"`
- `"8-bit Arithmetic Logic Unit"`
- `"3-to-8 Priority Encoder"`

### Module Name Extraction
`OutputTabs.tsx` also extracts the raw module/entity name from the source code using:
```typescript
const match = originalCode.match(/(?:module|entity)\s+(\w+)/i);
const detectedModuleName = match ? match[1] : "";
```

The Engineering Summary "Module Class & Type" field renders:
```
4-bit Synchronous Binary Counter  (counter_4bit)
                                   ↑ detectedModuleName (muted, monospace)
```

---

## 13. Error Handling

| Layer | Mechanism | Behavior |
|-------|-----------|----------|
| Client input validation | `useMutation.mutationFn` throws | `toast.error(e.message)` |
| File upload size check | `if (f.size > 200_000)` | `toast.error("File too large")` |
| Server `GEMINI_API_KEY` missing | `createServerFn` throws | Error propagates to client toast |
| Gemini API rate limit (429) | Explicit status check | User-friendly rate limit message |
| Gemini API error | `res.ok` check | Status code + body prefix in error |
| JSON parse failure | `try/catch` on `JSON.parse` | `"Failed to parse AI response"` |
| SSR catastrophic error | `server.ts` catch + `normalizeCatastrophicSsrResponse` | Returns branded 500 HTML error page |
| Route not found | `__root.tsx` `NotFoundComponent` | 404 page with "Go home" link |
| Route component crash | `__root.tsx` `ErrorComponent` | Error page with "Try again" + "Go home" |

---

## 14. UI Design System

### Color Palette
```css
--primary:          oklch(0.52 0.18 258)    /* Electric blue */
--success:          oklch(0.65 0.15 145)    /* Emerald green */
--warning:          oklch(0.75 0.18 75)     /* Amber */
--destructive:      oklch(0.60 0.22 25)     /* Red */
--background:       #f8fafc                  /* Slate 50 */
--surface:          #ffffff                  /* White */
--border:           oklch(0.88 0.01 240)    /* Light slate */
```

### Typography
- **Display font:** System sans-serif stack (Inter-like via font-display)
- **Mono font:** JetBrains Mono (Monaco editor), system-mono (UI labels)
- **Size scale:** `text-[9px]` labels → `text-xs` body → `text-sm` descriptions → `text-xl` headings

### Spacing Philosophy (IDE-dense)
- Global page padding: `py-4 px-4 md:px-6` (compact)
- Card padding: `p-3` to `p-5` (tight)
- Section gaps: `gap-3` to `gap-4` (compact)
- Progress bar height: `h-1` (ultra-thin)
- Metric card font: `text-2xl font-bold` for metric value, `text-[9px]` for label

### Key Design Tokens
```
shadow-elegant   → Subtle card shadow
shadow-glow      → Electric-blue glow on primary buttons
glass            → Backdrop-blur navbar effect
pulse-ring       → Animated pulsing ring indicator
bg-gradient-primary → Blue gradient for action buttons
```

---

## 15. End-to-End Flow Diagrams

### Primary Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (CLIENT)                         │
│                                                                 │
│  User Input                                                     │
│  ┌──────────┐   paste/upload/import                            │
│  │ Monaco   │ ──────────────────────► code (useState)          │
│  │ Editor   │                         language (useState)      │
│  └──────────┘                              │                   │
│                                            │ onClick           │
│                                      ┌─────▼──────┐           │
│                                      │  "Run       │           │
│                                      │  Pipeline"  │           │
│                                      │  Button     │           │
│                                      └─────┬───────┘           │
│                                            │                   │
│                                      mutation.mutate()         │
│                                            │                   │
│                                   ┌────────▼──────────┐       │
│                                   │  AgentPipeline     │       │
│                                   │  (8-step animation)│       │
│                                   └────────┬───────────┘       │
└────────────────────────────────────────────│───────────────────┘
                                             │ createServerFn
══════════════════════════ SERVER BOUNDARY ══╪════════════════════
                                             │
┌────────────────────────────────────────────│───────────────────┐
│                        SERVER (Node/CF)    │                   │
│                                            ▼                   │
│                               analyzeCode({ code, language })  │
│                                            │                   │
│                                    POST Gemini API             │
│                                   (Gemini 2.5 Flash)           │
│                                            │                   │
│                                    Parse JSON response         │
│                                    Apply defaults              │
│                                    Return AnalysisResult       │
└────────────────────────────────────────────│───────────────────┘
                                             │
══════════════════════════ SERVER BOUNDARY ══╪════════════════════
                                             │
┌────────────────────────────────────────────│───────────────────┐
│                        BROWSER (CLIENT)    │                   │
│                                            ▼                   │
│                               setResult(AnalysisResult)        │
│                                            │                   │
│                         ┌──────────────────┼────────────┐     │
│                         │                  │            │     │
│                   ScoreCards           OutputTabs   (metric)  │
│                   (4 metrics)          (8 tabs)               │
│                         │                  │                   │
│                         │          ┌───────┴──────────────┐   │
│                         │          │ WaveformViewer (SVG)  │   │
│                         │          │ Logic state overlays  │   │
│                         │          │ (1, 0, X labels)      │   │
│                         │          └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### HLS Synthesizer → Verifier Handoff Flow

```
/synthesizer page
     │
     │  User pastes C/Python/VHDL code
     │  Selects fromLanguage → toLanguage
     │  Clicks "Execute Synthesis Translation"
     │
     ▼
synthesizeCode() [server function]
     │
     ├── Gemini 2.5 Flash (temperature: 0.1 — very deterministic)
     │
     └── Returns { translatedCode: string }
          │
          ▼
     User reviews translated Verilog/SV/VHDL in right Monaco editor
          │
          │  Clicks "Verify Converted Code inside Verifier"
          ▼
     localStorage.setItem("pulselt_import_code", translatedCode)
     localStorage.setItem("pulselt_import_lang", toLanguage)
          │
     navigate({ to: "/" })
          │
          ▼
     / (index.tsx) mounts
     useEffect reads localStorage keys
     setCode(importCode) + setLanguage(importLang)
     localStorage.removeItem both keys
     toast.success("Successfully imported...")
          │
          ▼
     Monaco editor pre-loaded with translated hardware design
     User runs full RTL verification pipeline
```

---

*Report generated for PulseRTL v1.2-beta — RTL Verification & Timing Analysis Workspace*  
*All component paths are relative to `d:/WEB-Stuffs/siliconpilot-ai-main/`*
