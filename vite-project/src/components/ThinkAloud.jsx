import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, RotateCcw, Radio } from "lucide-react";

// Circular score ring
function ScoreRing({ score, label, color }) {
  const r = 28, circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ - fill}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div className="absolute" style={{ marginTop: "-48px" }}>
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>/10</span>
      </div>
      <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
    </div>
  );
}

export default function ThinkAloud({ questionData, currentCode, aiReady, dark, RichText }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [liveText, setLiveText] = useState("");
  const [scores, setScores] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [open, setOpen] = useState(false);
  const recognitionRef = useRef(null);

  const d = dark;
  const accent = "#3d6bff";
  const muted = d ? "#6b7db3" : "#5a6a99";
  const borderColor = d ? "#1e2d5a" : "#c8d4f0";
  const cardBg = d ? "rgba(15,22,40,0.85)" : "rgba(255,255,255,0.85)";
  const inputBg = d ? "#0a0e1a" : "#f0f4ff";
  const textColor = d ? "#e8eeff" : "#0d1440";

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setSupported(false);
    }
  }, []);

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let final = transcript;

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { final += t + " "; }
        else interim = t;
      }
      setTranscript(final);
      setLiveText(interim);
    };

    recognition.onerror = () => stopRecording();
    recognition.onend = () => { setRecording(false); setLiveText(""); };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
    setLiveText("");
  };

  const toggleRecording = () => recording ? stopRecording() : startRecording();

  const reset = () => {
    stopRecording();
    setTranscript(""); setLiveText(""); setScores(null); setFeedback("");
  };

  const analyze = async () => {
    if (!transcript.trim() || !aiReady) return;
    setLoading(true);
    setScores(null);
    setFeedback("");
    try {
      const res = await window.puter.ai.chat(
        `You are an expert technical interview coach evaluating a candidate's "think aloud" communication.

Problem: "${questionData?.problem}"
Candidate's Code:
${currentCode}

Candidate's Spoken Explanation (transcript):
"${transcript}"

Evaluate the candidate on these 4 dimensions, scoring each out of 10:
1. Clarity — how clearly did they explain their approach?
2. Structure — did they break down the problem logically before coding?
3. Technical Accuracy — did their explanation match what the code actually does?
4. Confidence — did they sound confident and avoid filler/confusion?

Return ONLY valid JSON in this exact shape:
{
  "clarity": <number>,
  "structure": <number>,
  "technical": <number>,
  "confidence": <number>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": "<1-2 specific things they did well>",
  "improvements": "<1-2 specific actionable suggestions>"
}`
      );
      const reply = typeof res === "string" ? res : res.message?.content || "";
      const parsed = JSON.parse(reply.replace(/```json|```/g, "").trim());
      setScores(parsed);
      setFeedback(parsed.summary);
    } catch (e) {
      setFeedback("Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  if (!supported) return (
    <div className="text-xs font-mono px-3 py-2 rounded-lg" style={{ color: muted, background: inputBg, border: `1px solid ${borderColor}` }}>
      ⚠ Speech recognition not supported in this browser. Try Chrome.
    </div>
  );

  return (
    <div>
      {/* Toggle header */}
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono mb-3 transition-opacity hover:opacity-80"
        style={{ color: "#a78bfa" }}>
        <Radio size={13} />
        Think Aloud Analysis
        <span className="ml-1 opacity-50">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="rounded-xl overflow-hidden border backdrop-blur-xl"
          style={{ borderColor: "#7c3dff", background: cardBg, animation: "slideUp 0.3s ease", boxShadow: "0 0 24px #7c3dff18" }}>

          {/* Panel header */}
          <div className="px-4 py-2.5 flex items-center justify-between border-b"
            style={{ borderColor, background: d ? "#0d0a1f" : "#f3f0ff" }}>
            <div className="flex items-center gap-2">
              <Radio size={13} style={{ color: "#a78bfa" }} />
              <span className="text-xs uppercase tracking-widest font-mono" style={{ color: "#a78bfa" }}>Think Aloud Recorder</span>
            </div>
            {transcript && (
              <button onClick={reset} className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity" style={{ color: muted }}>
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>

          <div className="p-4 space-y-4">
            {/* Instructions */}
            <p className="text-xs leading-relaxed" style={{ color: muted }}>
              Press <strong style={{ color: textColor }}>Record</strong> and explain your approach out loud as you code — just like a real interview. The AI will score your communication.
            </p>

            {/* Record button + live indicator */}
            <div className="flex items-center gap-3">
              <button onClick={toggleRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: recording ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#7c3dff,#a78bfa)",
                  boxShadow: recording ? "0 0 18px #dc262666" : "0 0 14px #7c3dff55"
                }}>
                {recording ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Record</>}
              </button>

              {recording && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: "pulse 1s ease-in-out infinite" }} />
                  <span className="text-xs font-mono" style={{ color: "#ef4444" }}>Recording…</span>
                </div>
              )}
            </div>

            {/* Live interim text */}
            {liveText && (
              <div className="px-3 py-2 rounded-lg text-xs italic font-mono"
                style={{ background: inputBg, color: muted, border: `1px dashed ${borderColor}` }}>
                {liveText}
              </div>
            )}

            {/* Transcript box */}
            {(transcript || recording) && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: muted }}>Transcript</p>
                <div className="rounded-xl px-4 py-3 text-sm leading-relaxed min-h-[60px]"
                  style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }}>
                  {transcript || <span style={{ color: muted }}>Waiting for speech…</span>}
                  {liveText && <span style={{ color: muted }}>{" " + liveText}</span>}
                </div>
              </div>
            )}

            {/* Analyze button */}
            {transcript && !recording && (
              <button onClick={analyze} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${accent}, #7c3dff)`, boxShadow: `0 0 14px ${accent}55` }}>
                {loading ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing…</>
                ) : (
                  <><Send size={13} /> Analyze Communication</>
                )}
              </button>
            )}

            {/* Score rings */}
            {scores && (
              <div style={{ animation: "slideUp 0.4s ease" }}>
                <p className="text-xs uppercase tracking-widest mb-3 font-mono" style={{ color: muted }}>Communication Scores</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { key: "clarity",    label: "Clarity",    color: "#3d6bff" },
                    { key: "structure",  label: "Structure",  color: "#a78bfa" },
                    { key: "technical",  label: "Technical",  color: "#2dd4bf" },
                    { key: "confidence", label: "Confidence", color: "#f59e0b" },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="flex flex-col items-center gap-1 relative py-2">
                      <svg width="68" height="68" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                        <circle cx="34" cy="34" r="28" fill="none" stroke={color} strokeWidth="5"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 - (scores[key] / 10) * 2 * Math.PI * 28}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }} />
                      </svg>
                      <div className="absolute top-3 flex flex-col items-center" style={{ marginTop: "10px" }}>
                        <span className="text-base font-bold leading-none" style={{ color }}>{scores[key]}</span>
                        <span className="text-xs leading-none" style={{ color: "rgba(255,255,255,0.3)" }}>/10</span>
                      </div>
                      <span className="text-xs font-mono uppercase tracking-widest" style={{ color: muted }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Strengths & improvements */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(45,212,191,0.2)" }}>
                    <p className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: "#2dd4bf" }}>✓ Strengths</p>
                    <p className="text-xs leading-relaxed" style={{ color: textColor }}>{scores.strengths}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: "rgba(124,61,255,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                    <p className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: "#a78bfa" }}>↑ Improve</p>
                    <p className="text-xs leading-relaxed" style={{ color: textColor }}>{scores.improvements}</p>
                  </div>
                </div>

                {/* Summary */}
                {feedback && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor }}>
                    <p className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: muted }}>Overall Assessment</p>
                    <RichText text={feedback} dark={d} accentColor="#a78bfa" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}