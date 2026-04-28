require("dotenv/config");
const { execFile } = require("child_process");
const path = require("path");

const {
  extractClaims,
  extractClaimsString,
  summarizeUrls,
  makeTranscriptSnippet,
} = require("../../utils/geminiService");

const { checkClaims } = require("../../utils/factCheckService");

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

async function runFromTranscript(transcript) {
  const claims = await extractClaims(transcript, { max: 5 });
  if (!claims?.length) {
    return { claims: [], claimsText: "", snippet: "", results: [] };
  }
  const claimsText = await extractClaimsString(transcript, { max: 5 });
  const snippet = makeTranscriptSnippet(claims);

  const factChecks = await checkClaims(claims);

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

async function runFromLink(link) {
  const transcript = await tiktokToTranscript(link);
  return runFromTranscript(transcript);
}

if (require.main === module) {
  const link = process.argv[2];
  if (!link) {
    console.error("Usage: node backend/app/pipeline/runClaimCheck.js <tiktok-url>");
    process.exit(1);
  }
  runFromLink(link)
    .then(res => {
      console.log("\n=== Extracted Claims Snippet ===\n");
      console.log(res.snippet);
      console.log("=== Results ===");
      console.dir(res.results, { depth: null });
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runFromTranscript, runFromLink };
