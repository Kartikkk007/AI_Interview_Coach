import { useState } from "react";
import { Terminal, Play } from "lucide-react";

export default function DryRun({ questionData, currentCode, aiReady, dark, RichText }) {
  const [testInput, setTestInput] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const d = dark;
  const muted = d ? "#6b7db3" : "#5a6a99";
  const borderColor = d ? "#1e2d5a" : "#c8d4f0";
  const inputBg = d ? "#0a0e1a" : "#f0f4ff";
  const inputText = d ? "#e8eeff" : "#0d1440";
  const outputBg = d ? "rgba(10,14,26,0.8)" : "rgba(240,244,255,0.8)";
  const accent = "#3d6bff";

  const runSimulatedTest = async () => {
    if (!aiReady || !testInput.trim()) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await window.puter.ai.chat(
        `Act as a code interpreter for this problem: "${questionData?.problem}".
         User code: "${currentCode}".
         Test input: "${testInput}".
         Simulate execution. If correct, show expected output. If there's a bug, explain it briefly with hints.`
      );
      const reply = typeof res === "string" ? res : res.message?.content || "";
      setOutput(reply);
    } catch {
      setOutput("Simulation failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header label */}
      <div className="flex items-center gap-2 mb-3">
        <Terminal size={13} style={{ color: accent }} />
        <span className="text-xs uppercase tracking-widest font-mono" style={{ color: muted }}>Dry Run / Test</span>
      </div>

      {/* Input */}
      <div className="relative mb-3">
        <textarea
          rows={2}
          placeholder={`Enter test input, e.g. [1, 2, 3] or "hello"`}
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-xs resize-none outline-none transition-all duration-200 font-mono"
          style={{
            background: inputBg, color: inputText,
            border: `1px solid ${borderColor}`,
            boxShadow: "none",
          }}
          onFocus={e => e.target.style.borderColor = accent}
          onBlur={e => e.target.style.borderColor = borderColor}
        />
      </div>

      {/* Run button */}
      <button
        onClick={runSimulatedTest}
        disabled={loading || !testInput.trim() || !aiReady}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
        style={{ background: `linear-gradient(135deg, ${accent}, #7c3dff)`, boxShadow: `0 0 14px ${accent}55` }}
      >
        {loading ? (
          <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running…</>
        ) : (
          <><Play size={13} /> Run Test</>
        )}
      </button>

      {/* Output */}
      {output && (
        <div className="mt-3 rounded-xl overflow-hidden border backdrop-blur-xl"
          style={{ borderColor, background: outputBg, animation: "slideUp 0.3s ease" }}>
          <div className="px-4 py-2 flex items-center gap-2 border-b"
            style={{ borderColor, background: d ? "#0d1424" : "#e8eeff" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#2dd4bf" }} />
            <span className="text-xs uppercase tracking-widest font-mono" style={{ color: muted }}>Console Output</span>
          </div>
          <div className="p-4">
            <RichText text={output} dark={d} accentColor="#2dd4bf" />
          </div>
        </div>
      )}
    </div>
  );
}