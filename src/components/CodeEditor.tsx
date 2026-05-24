import { useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface Props {
  value: string;
  onChange?: (v: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
}

const LANG_MAP: Record<string, string> = {
  verilog: "verilog",
  systemverilog: "verilog",
  vhdl: "vhdl",
  c: "c",
  cpp: "cpp",
  python: "python",
};

export function CodeEditor({ value, onChange, language, height = "420px", readOnly = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  useEffect(() => setMounted(true), []);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    // Register a basic Verilog language if not present
    if (!monaco.languages.getLanguages().some((l: { id: string }) => l.id === "verilog")) {
      monaco.languages.register({ id: "verilog" });
      monaco.languages.setMonarchTokensProvider("verilog", {
        defaultToken: "",
        keywords: [
          "module","endmodule","input","output","inout","wire","reg","logic","always","always_ff","always_comb","always_latch",
          "begin","end","if","else","case","endcase","casez","casex","default","posedge","negedge","assign","initial","parameter",
          "localparam","function","endfunction","task","endtask","generate","endgenerate","for","while","do","return","typedef",
          "enum","struct","packed","unique","priority","logic","bit","byte","integer","real","time","string","class","endclass",
          "interface","endinterface","package","endpackage","import","export","virtual","extends","super","this","null","void",
          "automatic","static","const","ref","forever","repeat","break","continue","fork","join","disable",
        ],
        operators: ["=","==","===","!=","!==","<=",">=","<",">","+","-","*","/","%","&","|","^","~","<<",">>","&&","||","!"],
        tokenizer: {
          root: [
            [/\/\/.*$/, "comment"],
            [/\/\*/, "comment", "@comment"],
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/"/, "string", "@string"],
            [/\d+'[bhdoBHDO][0-9a-fA-F_xzXZ]+/, "number"],
            [/\d+/, "number"],
            [/[a-zA-Z_]\w*/, { cases: { "@keywords": "keyword", "@default": "identifier" } }],
            [/[{}()\[\]]/, "@brackets"],
            [/[;,.]/, "delimiter"],
          ],
          comment: [
            [/[^\/*]+/, "comment"],
            [/\*\//, "comment", "@pop"],
            [/[\/*]/, "comment"],
          ],
          string: [
            [/[^\\"]+/, "string"],
            [/"/, "string", "@pop"],
          ],
        },
      });
    }
  };

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border bg-surface text-muted-foreground"
        style={{ height }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-[#1e1e2e] shadow-elegant">
      <Editor
        height={height}
        value={value}
        language={LANG_MAP[language] ?? "verilog"}
        onChange={(v) => onChange?.(v ?? "")}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          fontSize: 13,
          fontFamily: "JetBrains Mono, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 14, bottom: 14 },
          smoothScrolling: true,
          cursorBlinking: readOnly ? "solid" : "smooth",
          renderLineHighlight: readOnly ? "none" : "all",
          lineNumbersMinChars: 3,
          readOnly,
          domReadOnly: readOnly,
        }}
      />
    </div>
  );
}
