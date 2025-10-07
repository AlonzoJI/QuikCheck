import "dotenv/config";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

import {
  extractClaims,
  extractClaimsString,
  summarizeUrls,
  makeTranscriptSnippet,
} from "../../utils/geminiService.js";

import factCheckPkg from "../../utils/factCheckService.js";
const { checkClaims } = factCheckPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust if your script lives elsewhere
const pyScript = path.resolve(__dirname, "../linkVerification/linkConversion.py");

function tiktokToTranscript(link) {
  return new Promise((resolve, reject) => {
    execFile(
      "python3",
      [pyScript, link],
      { maxBuffer: 10 * 1024 * 1024 },
      (err, stdout) => {
        if (err) return reject(err);
        try {
          const data = JSON.parse(stdout);
          if (data?.success && data?.transcript_text) return resolve(data.transcript_text);
          reject(new Error(data?.error || "No transcript_text"));
        } catch {
          reject(new Error("Python did not return JSON"));
        }
      }
    );
  });
}

/**
 * Main pipeline from raw transcript:
 * 1) Extract short claims with Gemini
 * 2) Fact check each claim (top 1–2 reviews)
 * 3) Summarize unique URLs (Gemini)
 * Returns: { claims, claimsText, snippet, results }
 */
export async function runFromTranscript(transcript) {
  // 1) Extract claims (array) and also build the joined string + snippet for display
  const claims = await extractClaims(transcript, { max: 5 });
  if (!claims?.length) {
    return { claims: [], claimsText: "", snippet: "", results: [] };
  }
  const claimsText = await extractClaimsString(transcript, { max: 5 });
  const snippet = makeTranscriptSnippet(claims);

  // 2) Fact check array of claims
  const factChecks = await checkClaims(claims);

  // 3) Collect unique URLs to summarize
  const items = [];
  const seen = new Set();
  for (const [claim, reviews] of Object.entries(factChecks)) {
    for (const r of reviews || []) {
      if (!r?.url || seen.has(r.url)) continue;
      seen.add(r.url);
      items.push({ claim, url: r.url, title: r.title || "", publisher: r.publisher || "" });
    }
  }

  const summaries = items.length ? await summarizeUrls(items) : [];
  const byUrl = new Map(summaries.map(s => [s.url, s.summary || ""]));

  // 4) Build per-claim results
  const results = claims.map(claim => {
    const sources = (factChecks[claim] || []).map(r => ({
      url: r.url,
      title: r.title,
      publisher: r.publisher,
      rating: r.textualRating,
      reviewDate: r.reviewDate,
    }));
    const s = sources.map(x => ({ url: x.url, summary: byUrl.get(x.url) || "" }));
    return { claim, sources, summaries: s };
  });

  return { claims, claimsText, snippet, results };
}

export async function runFromLink(link) {
  const transcript = await tiktokToTranscript(link);
  return runFromTranscript(transcript);
}

// Minimal CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const link = process.argv[2];
  if (!link) {
    console.error("Usage: node backend/app/pipeline/runClaimCheck.js <tiktok-url>");
    process.exit(1);
  }
  runFromLink(link)
    .then(res => {
      // Show the exact snippet your fact checker likes
      console.log("\n=== Extracted Claims Snippet ===\n");
      console.log(res.snippet);
      console.log("=== Results ===");
      console.dir(res.results, { depth: null });
    })
    .catch(err => { console.error(err); process.exit(1); });
}
