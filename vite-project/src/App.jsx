import { useState, useEffect } from "react";
import { Code2, Play, Sun, Moon, Cpu, ChevronRight } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { githubLight } from "@uiw/codemirror-theme-github";

const BOILERPLATES = {
  javascript: `function solution() {\n  // write your code here\n}`,
  python: `def solution():\n    # write your code here\n    pass`,
  java: `class Solution {\n    public void solution() {\n        // write your code here\n    }\n}`,
  cpp: `void solution() {\n    // write your code here\n}`,
};

const LANG_EXTS = {
  javascript: [javascript({ jsx: true })],
  python: [python()],
  java: [java()],
  cpp: [cpp()],
};

export default function App() {
  const [dark, setDark] = useState(true);
  const [aiReady, setAiReady] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [code, setCode] = useState(BOILERPLATES.javascript);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [warning, setWarning] = useState("");
  const [solved, setSolved] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    const t = setInterval(() => {
      if (window.puter?.ai?.chat) { setAiReady(true); clearInterval(t); }
    }, 300);
    return () => clearInterval(t);
  }, []);

  const handleLanguageChange = (lang) => { setLanguage(lang); setCode(BOILERPLATES[lang]); };

  const generateQuestion = async () => {
    if (!["Beginner", "Medium", "Intermediate"].includes(difficulty)) {
      setWarning("Select a difficulty level first."); return;
    }
    setWarning(""); setLoading(true); setFeedback(""); setSolved(false); setQuestionData(null);
    try {
      const res = await window.puter.ai.chat(
        `Generate a random ${difficulty} level coding interview question for ${language}. Return ONLY valid JSON: {"problem":"string","example":"string","constraints":"string","note":"string"}`
      );
      const reply = typeof res === "string" ? res : res.message?.content || "";
      setQuestionData(JSON.parse(reply.replace(/```json|```/g, "").trim()));
    } catch (e) { setFeedback(`Error: ${e.message}`); }
    setLoading(false);
  };

  const checkSolution = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await window.puter.ai.chat(
        `You are a helpful interview coach. Question: "${questionData?.problem}". Language: ${language}. Solution:\n${code}\n\n1. If correct, say "Correct! Well Done." 2. If wrong, give hints in ${language} syntax but don't reveal the full answer.`
      );
      const reply = typeof res === "string" ? res : res.message?.content || "";
      setFeedback(reply);
      if (reply.includes("Correct!")) setSolved(true);
    } catch (e) { setFeedback(`Error: ${e.message}`); }
    setLoading(false);
  };

  const d = dark;
  const bg = d ? "bg-[#0a0e1a]" : "bg-[#f0f4ff]";
  const card = d ? "bg-[#0f1628]/80 border-[#1e2d5a]" : "bg-white/80 border-[#c8d4f0]";
  const text = d ? "text-[#e8eeff]" : "text-[#0d1440]";
  const muted = d ? "text-[#6b7db3]" : "text-[#5a6a99]";
  const accent = "#3d6bff";

  return (
    <div className={`min-h-screen ${bg} ${text} transition-colors duration-500 font-mono`}
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>

      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-0"
          style={{ backgroundImage: `linear-gradient(${d?"#1e2d5a":"#c8d4f0"} 1px, transparent 1px), linear-gradient(90deg, ${d?"#1e2d5a":"#c8d4f0"} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${accent}22, transparent 70%)`, animation: "pulse 6s ease-in-out infinite" }} />
      </div>

      <div className={`relative max-w-3xl mx-auto px-4 py-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accent}, #7c3dff)`, boxShadow: `0 0 20px ${accent}55` }}>
              <Cpu size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AI Interview Coach</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${aiReady ? "bg-emerald-400" : "bg-yellow-400"}`}
                  style={{ animation: aiReady ? "none" : "pulse 1s infinite" }} />
                <span className={`text-xs ${muted}`}>{aiReady ? "AI ready" : "Connecting…"}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setDark(!d)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-110 ${card}`}>
            {d ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-[#3d6bff]" />}
          </button>
        </div>

        {/* Controls card */}
        <div className={`rounded-2xl border backdrop-blur-xl p-5 mb-5 ${card}`}
          style={{ boxShadow: d ? "0 8px 32px #00000066" : "0 8px 32px #3d6bff15" }}>

          <p className={`text-xs uppercase tracking-widest mb-3 ${muted}`}>Difficulty</p>
          <div className="flex gap-2 mb-5">
            {["Beginner", "Medium", "Intermediate"].map((lvl) => (
              <button key={lvl} onClick={() => setDifficulty(lvl)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${difficulty === lvl
                  ? "text-white border-transparent scale-105"
                  : `${muted} border-current hover:scale-105`}`}
                style={difficulty === lvl ? { background: `linear-gradient(135deg, #0d9488, #2dd4bf)`, boxShadow: `0 0 14px #0d948855` } : {}}>
                {lvl}
              </button>
            ))}
          </div>

          <p className={`text-xs uppercase tracking-widest mb-3 ${muted}`}>Language</p>
          <div className="flex gap-2 flex-wrap mb-5">
            {["javascript", "python", "java", "cpp"].map((lang) => (
              <button key={lang} onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1 rounded-md text-xs font-semibold tracking-wider transition-all duration-200 border ${language === lang
                  ? "text-white border-transparent"
                  : `${muted} border-current hover:opacity-80`}`}
                style={language === lang ? { background: `linear-gradient(135deg, #0d9488, #2dd4bf)`, boxShadow: `0 0 10px #0d948855` } : {}}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {warning && <p className="text-red-400 text-xs mb-3">{warning}</p>}

          <button onClick={generateQuestion} disabled={loading || !aiReady}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${accent}, #7c3dff)`, boxShadow: `0 0 20px ${accent}44` }}>
            {loading && !questionData ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
            ) : (
              <><ChevronRight size={16} /> Generate Question</>
            )}
          </button>
        </div>

        {/* Question + Editor card */}
        {questionData && (
          <div className={`rounded-2xl border backdrop-blur-xl overflow-hidden mb-5 ${card}`}
            style={{ boxShadow: d ? "0 8px 32px #00000066" : "0 8px 32px #3d6bff15", animation: "slideUp 0.4s ease" }}>
            <div className="p-5 border-b" style={{ borderColor: d ? "#1e2d5a" : "#c8d4f0" }}>
              <div className="flex items-start gap-2">
                <Code2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: accent }} />
                <div>
                  <p className="text-sm font-semibold leading-relaxed">{questionData.problem}</p>
                  {questionData.example && <p className={`text-xs mt-2 ${muted}`}>Example: {questionData.example}</p>}
                </div>
              </div>
            </div>

            <div className="p-1">
              <CodeMirror value={code} height="260px"
                theme={d ? dracula : githubLight}
                extensions={LANG_EXTS[language]}
                onChange={(v) => setCode(v)}
                style={{ fontSize: "13px" }} />
            </div>

            <div className="p-4 flex items-center gap-3">
              <button onClick={checkSolution} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
                style={{ background: solved ? "linear-gradient(135deg,#059669,#10b981)" : `linear-gradient(135deg, ${accent}, #7c3dff)`, boxShadow: `0 0 14px ${solved ? "#059669" : accent}55` }}>
                {loading && questionData ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking…</>
                ) : (
                  <><Play size={14} /> {solved ? "Solved ✓" : "Submit"}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-2xl border backdrop-blur-xl p-5 text-sm leading-relaxed ${card}`}
            style={{
              borderColor: solved ? "#059669" : d ? "#1e2d5a" : "#c8d4f0",
              boxShadow: solved ? "0 0 20px #05966933" : "none",
              animation: "slideUp 0.35s ease"
            }}>
            <p className={`text-xs uppercase tracking-widest mb-2 ${solved ? "text-emerald-400" : muted}`}>
              {solved ? "✓ Correct" : "Feedback"}
            </p>
            <p className="whitespace-pre-wrap">{feedback}</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}