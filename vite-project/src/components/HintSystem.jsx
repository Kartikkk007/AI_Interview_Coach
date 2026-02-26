import { useState } from "react";
import { Lightbulb } from "lucide-react";

export default function HintSystem({ questionData, currentCode, aiReady, dark, RichText }) {
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const d = dark;
  const muted = d ? "#6b7db3" : "#5a6a99";
  const borderColor = d ? "#1e2d5a" : "#c8d4f0";
  const hintBg = d ? "rgba(15,22,40,0.7)" : "rgba(255,255,255,0.7)";

  const getHint = async () => {
    if (!aiReady || !questionData) return;
    setLoading(true);
    setOpen(true);
    setHint("");
    try {
      const res = await window.puter.ai.chat(
        `The user is stuck on this problem: "${questionData.problem}".
         Their current code is: "${currentCode}".
         Provide a short, conceptual hint to help them progress without giving away the full solution.`
      );
      const reply = typeof res === "string" ? res : res.message?.content || "";
      setHint(reply);
    } catch {
      setHint("Could not retrieve hint. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={getHint}
        disabled={loading || !aiReady}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #b45309, #f59e0b)", boxShadow: "0 0 14px #b4530955" }}
      >
        <Lightbulb size={15} />
        {loading ? (
          <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Thinking…</>
        ) : "Get Hint"}
      </button>

      {open && (
        <div className="mt-3 rounded-xl overflow-hidden border backdrop-blur-xl"
          style={{ borderColor: "#b45309", background: hintBg, animation: "slideUp 0.3s ease",
            boxShadow: "0 0 20px #b4530922" }}>
          <div className="px-4 py-2 flex items-center gap-2 border-b"
            style={{ borderColor, background: d ? "#1a1200" : "#fff8e6" }}>
            <Lightbulb size={13} style={{ color: "#f59e0b" }} />
            <span className="text-xs uppercase tracking-widest font-mono" style={{ color: "#f59e0b" }}>Hint</span>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex gap-1.5 items-center" style={{ color: muted }}>
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400"
                    style={{ animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
                <span className="text-xs ml-1">Generating hint…</span>
              </div>
            ) : (
              <RichText text={hint} dark={d} accentColor="#f59e0b" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}