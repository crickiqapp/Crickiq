import { useState } from "react";

const PLAYERS = {
  "Virat Kohli": { role: "Batsman", team: "India", matches: 500, avg: 57.3, sr: 93.2, format: "All formats" },
  "Rohit Sharma": { role: "Batsman", team: "India", matches: 450, avg: 48.9, sr: 89.4, format: "All formats" },
  "Jasprit Bumrah": { role: "Bowler", team: "India", matches: 180, avg: 22.1, economy: 4.6, format: "All formats" },
  "MS Dhoni": { role: "Wicket-Keeper", team: "India", matches: 600, avg: 50.6, sr: 87.6, format: "All formats" },
  "Shubman Gill": { role: "Batsman", team: "India", matches: 120, avg: 51.2, sr: 91.3, format: "All formats" },
  "Hardik Pandya": { role: "All-Rounder", team: "India", matches: 210, avg: 31.4, sr: 130.2, format: "T20/ODI" },
  "KL Rahul": { role: "Batsman", team: "India", matches: 280, avg: 46.7, sr: 85.3, format: "All formats" },
  "Ravindra Jadeja": { role: "All-Rounder", team: "India", matches: 380, avg: 35.2, economy: 4.1, format: "All formats" },
};

const FORMATS = ["Test", "ODI", "T20I", "IPL"];
const CONDITIONS = ["Home", "Away", "Neutral", "Day/Night"];
const OPPOSITIONS = ["Australia", "England", "Pakistan", "South Africa", "New Zealand", "West Indies", "Sri Lanka", "Bangladesh"];

function ScoreBadge({ score }) {
  const color = score >= 85 ? "#00e676" : score >= 70 ? "#ffeb3b" : score >= 55 ? "#ff9800" : "#f44336";
  const label = score >= 85 ? "Elite" : score >= 70 ? "Good" : score >= 55 ? "Average" : "Poor";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        border: `3px solid ${color}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 18px ${color}44`
      }}>
        <span style={{ color, fontSize: 18, fontWeight: 800 }}>{score}</span>
      </div>
      <span style={{ color, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>{label.toUpperCase()}</span>
    </div>
  );
}

function StatBar({ label, value, max = 100, color = "#00e676" }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "#aaa", fontSize: 12 }}>{label}</span>
        <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 5, background: "#1a2233", borderRadius: 3 }}>
        <div style={{
          height: "100%", width: `${Math.min((value / max) * 100, 100)}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: 3, transition: "width 0.8s ease"
        }} />
      </div>
    </div>
  );
}

export default function CricIQ() {
  const [playerInput, setPlayerInput] = useState("");
  const [format, setFormat] = useState("ODI");
  const [condition, setCondition] = useState("Home");
  const [opposition, setOpposition] = useState("Australia");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleInput = (val) => {
    setPlayerInput(val);
    if (val.length > 1) {
      const s = Object.keys(PLAYERS).filter(p => p.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(s);
    } else {
      setSuggestions([]);
    }
  };

  const analyze = async () => {
    if (!playerInput.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSuggestions([]);

    const playerData = PLAYERS[playerInput] || null;
    const prompt = `You are CricIQ, an expert cricket performance analyst with deep knowledge of cricket statistics, player psychology, pitch conditions, and match situations.

Analyze the following player for fantasy cricket and coaching purposes:

Player: ${playerInput}
${playerData ? `Known Stats: Role: ${playerData.role}, Team: ${playerData.team}, Career Avg: ${playerData.avg}, Strike Rate/Economy: ${playerData.sr || playerData.economy}` : ""}
Format: ${format}
Condition: ${condition}
Opposition: ${opposition}

Respond ONLY in this JSON format (no markdown, no backticks):
{
  "performanceScore": <number 0-100>,
  "fantasyScore": <number 0-100>,
  "consistencyScore": <number 0-100>,
  "pressureScore": <number 0-100>,
  "role": "<Batsman/Bowler/All-Rounder/Wicket-Keeper>",
  "team": "<team name>",
  "keyStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "watchOut": ["<concern1>", "<concern2>"],
  "fantasyTip": "<1 sentence fantasy tip>",
  "coachInsight": "<2 sentence coaching insight about this player in these conditions>",
  "prediction": "<1 sentence performance prediction for next match>",
  "bestFormat": "<which format suits this player best>",
  "rivalryFactor": "<how does this player perform vs this opposition specifically>"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(i => i.text || "").join("").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setResult({ ...parsed, player: playerInput });
    } catch (e) {
      setError("Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const bg = "#0a0f1e";
  const card = "#0e1628";
  const border = "#1a2640";
  const green = "#00e676";
  const blue = "#2196f3";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Inter', sans-serif", padding: "20px 16px", color: "#fff" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>🏏</span>
          <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: "#fff" }}>Cric<span style={{ color: green }}>IQ</span></span>
        </div>
        <p style={{ color: "#5a7a9a", fontSize: 13, margin: 0 }}>AI-Powered Cricket Performance Analyzer</p>
      </div>

      {/* Input Card */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <label style={{ color: "#7a9ab8", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Player Name</label>
        <div style={{ position: "relative", marginTop: 8 }}>
          <input
            value={playerInput}
            onChange={e => handleInput(e.target.value)}
            placeholder="e.g. Virat Kohli, Rohit Sharma..."
            style={{
              width: "100%", padding: "12px 16px", background: "#0a1020",
              border: `1px solid ${border}`, borderRadius: 10, color: "#fff",
              fontSize: 15, outline: "none", boxSizing: "border-box"
            }}
          />
          {suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "110%", left: 0, right: 0, background: "#111c2e", border: `1px solid ${border}`, borderRadius: 10, zIndex: 10, overflow: "hidden" }}>
              {suggestions.map(s => (
                <div key={s} onClick={() => { setPlayerInput(s); setSuggestions([]); }}
                  style={{ padding: "10px 16px", cursor: "pointer", fontSize: 14, borderBottom: `1px solid ${border}` }}
                  onMouseEnter={e => e.target.style.background = "#1a2640"}
                  onMouseLeave={e => e.target.style.background = "transparent"}
                >{s}</div>
              ))}
            </div>
          )}
        </div>

        {/* Format & Condition Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div>
            <label style={{ color: "#7a9ab8", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Format</label>
            <select value={format} onChange={e => setFormat(e.target.value)}
              style={{ width: "100%", marginTop: 6, padding: "10px 12px", background: "#0a1020", border: `1px solid ${border}`, borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }}>
              {FORMATS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: "#7a9ab8", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)}
              style={{ width: "100%", marginTop: 6, padding: "10px 12px", background: "#0a1020", border: `1px solid ${border}`, borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Opposition */}
        <div style={{ marginTop: 14 }}>
          <label style={{ color: "#7a9ab8", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Opposition</label>
          <select value={opposition} onChange={e => setOpposition(e.target.value)}
            style={{ width: "100%", marginTop: 6, padding: "10px 12px", background: "#0a1020", border: `1px solid ${border}`, borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }}>
            {OPPOSITIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <button onClick={analyze} disabled={loading || !playerInput.trim()}
          style={{
            width: "100%", marginTop: 18, padding: "14px",
            background: loading ? "#1a2640" : `linear-gradient(135deg, ${green}, #00bcd4)`,
            border: "none", borderRadius: 12, color: loading ? "#5a7a9a" : "#000",
            fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: 0.5, transition: "all 0.2s"
          }}>
          {loading ? "⚙️ Analyzing..." : "🔍 Analyze Player"}
        </button>
      </div>

      {error && <div style={{ background: "#2a0a0a", border: "1px solid #f44336", borderRadius: 12, padding: 14, color: "#f44336", fontSize: 14, marginBottom: 16 }}>{error}</div>}

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Player Header */}
          <div style={{ background: `linear-gradient(135deg, #0e1628, #0a1f35)`, border: `1px solid ${green}33`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{result.player}</h2>
                <p style={{ margin: "4px 0 0", color: "#5a9ab8", fontSize: 13 }}>{result.role} • {result.team}</p>
                <p style={{ margin: "2px 0 0", color: "#3a6a88", fontSize: 12 }}>{format} • {condition} • vs {opposition}</p>
              </div>
              <ScoreBadge score={result.performanceScore} />
            </div>
          </div>

          {/* Score Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Fantasy Score", value: result.fantasyScore, icon: "⭐", color: "#ffeb3b" },
              { label: "Consistency", value: result.consistencyScore, icon: "📊", color: blue },
              { label: "Pressure IQ", value: result.pressureScore, icon: "🧠", color: "#e91e63" },
              { label: "Performance", value: result.performanceScore, icon: "🏏", color: green },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
                <div style={{ fontSize: 11, color: "#5a7a9a", fontWeight: 600, marginTop: 2 }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Score Bars */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, color: "#7a9ab8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Performance Breakdown</h3>
            <StatBar label="Fantasy Score" value={result.fantasyScore} color="#ffeb3b" />
            <StatBar label="Consistency" value={result.consistencyScore} color={blue} />
            <StatBar label="Pressure IQ" value={result.pressureScore} color="#e91e63" />
            <StatBar label="Overall Performance" value={result.performanceScore} color={green} />
          </div>

          {/* Key Strengths */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 18 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#7a9ab8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>💪 Key Strengths</h3>
            {result.keyStrengths?.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                <span style={{ color: green, marginTop: 2 }}>✓</span>
                <span style={{ color: "#cde", fontSize: 14 }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Watch Out */}
          <div style={{ background: card, border: `1px solid #f4433622`, borderRadius: 14, padding: 18 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#f44336", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>⚠️ Watch Out</h3>
            {result.watchOut?.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#f44336", marginTop: 2 }}>!</span>
                <span style={{ color: "#cde", fontSize: 14 }}>{w}</span>
              </div>
            ))}
          </div>

          {/* Fantasy Tip */}
          <div style={{ background: `linear-gradient(135deg, #1a2f1a, #0e1628)`, border: `1px solid ${green}44`, borderRadius: 14, padding: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 13, color: green, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>⭐ Fantasy Tip</h3>
            <p style={{ margin: 0, color: "#cde", fontSize: 14, lineHeight: 1.6 }}>{result.fantasyTip}</p>
          </div>

          {/* Coach Insight */}
          <div style={{ background: `linear-gradient(135deg, #0a1a2f, #0e1628)`, border: `1px solid ${blue}44`, borderRadius: 14, padding: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 13, color: blue, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>🎯 Coach Insight</h3>
            <p style={{ margin: 0, color: "#cde", fontSize: 14, lineHeight: 1.6 }}>{result.coachInsight}</p>
          </div>

          {/* Rivalry & Prediction */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 12, color: "#ff9800", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>🆚 vs {opposition}</h3>
              <p style={{ margin: 0, color: "#cde", fontSize: 13, lineHeight: 1.5 }}>{result.rivalryFactor}</p>
            </div>
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 12, color: "#9c27b0", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>🔮 Prediction</h3>
              <p style={{ margin: 0, color: "#cde", fontSize: 13, lineHeight: 1.5 }}>{result.prediction}</p>
            </div>
          </div>

          {/* Best Format */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <div>
              <div style={{ fontSize: 11, color: "#5a7a9a", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Best Format</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: green, marginTop: 2 }}>{result.bestFormat}</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "8px 0 16px", color: "#2a4a6a", fontSize: 11 }}>
            Powered by CricIQ AI • Your Cricket Intelligence Platform
          </div>
        </div>
      )}
    </div>
  );
}
