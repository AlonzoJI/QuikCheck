import React, { useState } from "react";
import "../styles/tiktokChecker.css";

function normalizePublisher(p) {
  if (!p) return "";
  return typeof p === "string" ? p : (p.name || p.site || "");
}
function normalizeRating(r = "") {
  const s = String(r).toLowerCase();
  if (/(true|correct|accurate|mostly true)/.test(s)) return "true";
  if (/(false|fake|incorrect|pants on fire)/.test(s)) return "false";
  if (/(mixed|partly|half|needs context|missing context|misleading)/.test(s)) return "mixed";
  return "unknown";
}
function verdictForClaim(result) {
  const ratings = (result.sources || []).map(s => normalizeRating(s.rating));
  if (ratings.includes("true")) return { key: "verified", label: "VERIFIED", cls: "verification verified" };
  if (ratings.includes("false")) return { key: "debunked", label: "VERIFIED FALSE", cls: "verification unverified" };
  if (ratings.includes("mixed")) return { key: "mixed", label: "NEEDS CONTEXT", cls: "verification unverified" };
  if (!result.sources || result.sources.length === 0) return { key: "uncertain", label: "UNCERTAIN", cls: "verification unverified" };
  return { key: "unverified", label: "UNVERIFIED", cls: "verification unverified" };
}

const TikTokChecker = () => {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [results, setResults] = useState([]);

  async function handleAnalyze() {
    setErr("");
    setResults([]);

    const cleaned = link.replaceAll("\\", "").replace(/^"+|"+$/g, "").trim();
    if (!cleaned) { setErr("Please paste a TikTok link."); return; }

    setLoading(true);
    try {
      const r = await fetch("/api/tiktok-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleaned })
      });

      const raw = await r.text(); 
      let data;
      try { data = JSON.parse(raw); }
      catch { throw new Error(`Server did not return JSON. ${raw.slice(0,120)}`); }

      if (!r.ok || !data?.ok) throw new Error(data?.error || `Request failed ${r.status}`);

      setResults(data.results || []);
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const verified = results.filter(r => verdictForClaim(r).key === "verified");
  const unverified = results.filter(r => verdictForClaim(r).key !== "verified");

  return (
    // tt checker 
    <div className="tiktok-checker-section" id="tiktok-checker">

      {/* container */}
      <div className="checker-container">

        {/* header */}
        <div>
          <h2>TikTok Fact-Checker</h2>
          <p>Verify claims in TikTok videos with AI-powered analysis</p>
        </div>
        
        {/* link input */}
        <div className="input-section">
          <input
            type="text"
            placeholder="Paste Link Here"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* show errors using existing text style */}
        {err ? <p className="blurb">{err}</p> : null}
        
        {/* outputted results from search */}
        <div className="results-wrapper">

          {/* verified */}
          <div className="results-column">
            <h3 className="column-title verified-title">Verified</h3>
            <div className="results-grid">
              {verified.map((res, idx) => {
                const v = verdictForClaim(res);
                const top = res.sources?.[0];
                const blurb = res.summaries?.[0]?.summary || "";
                return (
                  <div className="result-card" key={`v-${idx}`}>
                    <h4 className="claim-text">“{res.claim}”</h4>
                    <div className={v.cls}>{v.label}</div>
                    {blurb ? <p className="blurb">{blurb}</p> : null}
                    {top ? (
                      <a href={top.url} className="source-link" target="_blank" rel="noreferrer">
                        {normalizePublisher(top.publisher) || "View Source"}
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* unverified (debunked / mixed / uncertain) */}
          <div className="results-column">
            <h3 className="column-title unverified-title">Unverified</h3>
            <div className="results-grid">
              {unverified.map((res, idx) => {
                const v = verdictForClaim(res);
                const top = res.sources?.[0];
                const blurb = res.summaries?.[0]?.summary || "";
                return (
                  <div className="result-card" key={`u-${idx}`}>
                    <h4 className="claim-text">“{res.claim}”</h4>
                    <div className={v.cls}>{v.label}</div>
                    {blurb ? <p className="blurb">{blurb}</p> : null}
                    {top ? (
                      <a href={top.url} className="source-link" target="_blank" rel="noreferrer">
                        {normalizePublisher(top.publisher) || "View Source"}
                      </a>
                    ) : (
                      <p className="blurb">No fact-check sources found yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TikTokChecker;
