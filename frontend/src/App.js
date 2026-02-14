import { useEffect, useState } from "react";
import { API } from "./config";

export default function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    const res = await fetch(`${API}/history`);
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const scanMessage = async () => {
    if (!message) return alert("Enter SMS or Transcript");

    const res = await fetch(`${API}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setResult(data);
    setMessage("");
    loadHistory();
  };

  const deleteScan = async (id) => {
    await fetch(`${API}/delete/${id}`, { method: "DELETE" });
    loadHistory();
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: "center" }}>
         ScamShield – Scam SMS Analyzer
      </h1>

      <div className="card">
        <h2>Paste SMS / Call Transcript</h2>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Example: Your bank account will be blocked. Click link to verify OTP..."
        />

        <button className="scan-btn" onClick={scanMessage}>
           Analyze Message
        </button>

        {result && (
          <div style={{ marginTop: 15 }}>
            <h3>Result: {result.result}</h3>
            <p>Category: {result.category}</p>
            <p>Risk Score: {result.score}/100</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2> Scan History</h2>

        {history.length === 0 && <p>No scans yet.</p>}

        {history.map((s) => (
          <div
            key={s.id}
            style={{
              padding: 10,
              borderBottom: "1px solid gray",
              marginBottom: 10,
            }}
          >
            <p>
              <b>{s.result}</b> ({s.score}/100)
            </p>
            <p>{s.message}</p>
            <small>{s.date}</small>
            <br />
            <button className="delete-btn" onClick={() => deleteScan(s.id)}>
              Cancel/Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
