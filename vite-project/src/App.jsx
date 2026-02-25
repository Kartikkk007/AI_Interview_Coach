import { useState, useEffect } from "react";
import { Code as CodeIcon, Play, RotateCcw, CheckCircle, ArrowLeft } from "lucide-react"; 
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";

function App() {
  const [aiReady, setAiReady] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [code, setCode] = useState(`function solution() {\n  // write your code here\n}`);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [warning, setWarning] = useState("");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(checkReady);
      }
    }, 300);
    return () => clearInterval(checkReady);
  }, []);

  const generateQuestion = async () => {
    const validLevels = ["Beginner", "Medium", "Intermediate"];

    if (!validLevels.includes(difficulty)) {
      setWarning("Please select a difficulty level before generating a question.");
      return;
    }

    setWarning("");
    setLoading(true);
    setFeedback("");
    setSolved(false);
    setCode(`function solution() {\n  // write your code here\n}`);
    setQuestionData(null);

    try {
      const res = await window.puter.ai.chat(
        `Generate a random ${difficulty} level coding interview question. 
         Return ONLY valid JSON:
         {
          "problem": "string",
          "example": "string",
          "constraints": "string",
          "note": "string"
         }`
      );

      const reply = typeof res === "string" ? res : res.message?.content || "";
      // Clean potential markdown from AI response
      const cleanJson = reply.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      setQuestionData(parsed);
    } catch (error) {
      setFeedback(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const checkSolution = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await window.puter.ai.chat(
        `You are a helpful interview coach.
         The question is: "${questionData?.problem}".
         Here is the candidate's solution:
         ${code}

         1. If correct, say "Correct! Well Done."
         2. If wrong, give hints but don't reveal the full answer.`
      );
      const reply = typeof res === "string" ? res : res.message?.content || "";
      setFeedback(reply);

      if (reply.includes("Correct!")) setSolved(true);
    } catch (error) {
      setFeedback(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-slate-950 to-emerald-900 flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="text-4xl font-bold text-white flex items-center gap-3">
        <CodeIcon size={40} /> AI Interview Coach
      </h1>

      <div className="flex gap-4">
        {["Beginner", "Medium", "Intermediate"].map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-4 py-2 rounded ${difficulty === level ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-gray-300'}`}
          >
            {level}
          </button>
        ))}
      </div>

      <button 
        onClick={generateQuestion}
        disabled={loading || !aiReady}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Question"}
      </button>

      {warning && <p className="text-red-400">{warning}</p>}

      {questionData && (
        <div className="w-full max-w-4xl bg-slate-900/50 p-6 rounded-xl border border-slate-700 text-white">
          <h2 className="text-xl font-bold mb-2">{questionData.problem}</h2>
          <p className="text-gray-400 text-sm mb-4">Example: {questionData.example}</p>
          
          <CodeMirror
            value={code}
            height="300px"
            theme={dracula}
            extensions={[javascript({ jsx: true })]}
            onChange={(value) => setCode(value)}
            className="rounded overflow-hidden"
          />

          <div className="mt-4 flex gap-4">
            <button 
              onClick={checkSolution}
              className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700"
            >
              <Play size={18} /> Submit Solution
            </button>
          </div>

          {feedback && (
            <div className={`mt-4 p-4 rounded ${solved ? 'bg-emerald-900/40 border border-emerald-500' : 'bg-slate-800'}`}>
              <p className="whitespace-pre-wrap">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;