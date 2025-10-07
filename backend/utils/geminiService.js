import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to your root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// now the guard will pass if the file has the key
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Extract up to N short, checkable claims from a transcript.
 * Returns an array of strings.
 */
export async function extractClaims(transcript, opts = {}) {
  const max = Number.isFinite(opts.max) ? opts.max : 5;

  const prompt = `
  You will receive a raw transcript. Extract up to ${max} short, checkable factual claims.

  Rules:
  - Output JSON only with this exact shape: {"claims": ["...", "..."]}.
  - Each claim must be 3 to 12 words, self-contained, and verifiable.
  - No opinions, no questions, no quotes, no speaker names, no sources.
  - Remove duplicates and keep distinct ideas only.
  - **Always include the main thesis or central assertion** (e.g., “The Earth is flat.”).
  - If there are fewer than ${max}, return fewer. If none, return {"claims": []}.

  Transcript:
  """${transcript}"""
  `;

  const resp = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
  });

  const text = resp.response.text().trim();
  let claims = [];
  try {
    const json = toJson(text);
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed.claims)) claims = parsed.claims;
  } catch {
    claims = [];
  }
  return postProcessClaims(claims).slice(0, max);
}

/**
 * Same extraction but returns one newline-joined string,
 * ready to pass into your factCheck service.
 */
export async function extractClaimsString(rawTranscript, opts = {}) {
  const max = Number.isFinite(opts.max) ? opts.max : 5;
  const claims = await extractClaims(rawTranscript, { max });

  const lines = claims.map(c => {
    const s = String(c || "").trim();
    return "  " + (/[.!?]$/.test(s) ? s : s + ".");
  });

  return lines.join("\n");
}

/**
 * Build the exact JS snippet if you need it for display.
 */
export function makeTranscriptSnippet(claims) {
  const clean = postProcessClaims(claims).slice(0, 6);
  const body = clean.map(c => `  ${/[.!?]$/.test(c) ? c : c + "."}`).join("\n");
  return `const transcript = \`\n${body}\n\`;\n`;
}

/**
 * Convenience: from raw transcript to JS snippet directly.
 */
export async function extractClaimsAsSnippet(transcript, opts = {}) {
  const claims = await extractClaims(transcript, opts);
  return makeTranscriptSnippet(claims.length ? claims : ["No clear claims detected."]);
}

/**
 * Summarize a set of URLs relative to a claim.
 * items: Array of { claim, url, title?, publisher? }
 * Returns [{ id, url, summary }]
 */
export async function summarizeUrls(items) {
  const input = {
    items: items.map((it, i) => ({
      id: i,
      claim: it.claim,
      url: it.url,
      title: it.title || "",
      publisher: it.publisher || ""
    }))
  };

  const prompt = `
You will receive a JSON with items. For each item, write a neutral 2 to 3 sentence teaser summary that informs but invites the user to read.
Do not exceed 3 sentences. Return JSON only:
{"summaries":[{"id":0,"url":"...","summary":"..."}, ...]}

Items JSON:
${JSON.stringify(input)}
`;

  const resp = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 768 }
  });

  const text = resp.response.text().trim();
  try {
    const json = toJson(text);
    const parsed = JSON.parse(json);
    return Array.isArray(parsed.summaries) ? parsed.summaries : [];
  } catch {
    return [];
  }
}

/* Helpers */

function toJson(s) {
  const fenced = s.match(/```json([\s\S]*?)```/i) || s.match(/```([\s\S]*?)```/);
  const body = fenced ? fenced[1] : s;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return body.slice(start, end + 1).trim();
  throw new Error("Model did not return JSON");
}

function postProcessClaims(items) {
  const seen = new Set();
  const out = [];
  for (const raw of items || []) {
    let s = String(raw || "").trim();
    s = s.replace(/^["'“”]+|["'“”]+$/g, "");
    s = s.replace(/\s+/g, " ");
    if (!s) continue;
    if (s.length > 140) s = s.slice(0, 137).trim() + "...";
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}
