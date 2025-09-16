"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const [query, setQuery] = useState("");
  const [forceRefresh, setForceRefresh] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setResp(null);
    setError(null);
    try {
      const r = await fetch(`${API}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, forceRefresh }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Request failed");
      console.log("data", data);
      setResp(data);
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Boardy Semantic Cache — Services</h1>
        <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <textarea
            className="w-full border rounded p-2"
            rows={4}
            placeholder="Ask something..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={forceRefresh}
              onChange={(e) => setForceRefresh(e.target.checked)}
            />
            <span>Force refresh (bypass cache)</span>
          </label>
          <button
            onClick={send}
            disabled={loading || !query.trim()}
            className="self-start bg-black text-white px-4 py-2 rounded-lg disabled:opacity-40"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {resp && (
          <div className="bg-white p-4 rounded-xl shadow space-y-3">
            <div className="text-sm text-gray-500">
              source: <b>{resp?.metadata?.source}</b>
              {resp?.metadata?.matchScore != null
                ? ` (score ${resp.metadata.matchScore.toFixed(3)})`
                : ""}
            </div>
            <div className="whitespace-pre-wrap">{resp?.response}</div>
            <pre className="text-xs bg-gray-100 p-2 rounded">
              {JSON.stringify(resp?.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
