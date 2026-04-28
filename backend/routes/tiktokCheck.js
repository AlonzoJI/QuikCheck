const express = require("express");
const router = express.Router();

router.post("/api/tiktok-check", async (req, res) => {
  try {
    let { url } = req.body || {};
    if (!url) return res.status(400).json({ ok: false, error: "Missing url" });

    url = String(url).replace(/\\/g, "").replace(/^"+|"+$/g, "").trim();
    const { runFromLink } = require("../app/pipeline/runClaimCheck");
    const data = await runFromLink(url);
    const { snippet = "", results = [] } = Array.isArray(data) ? { results: data } : data;
    return res.json({ ok: true, snippet, results });
  } catch (e) {
    const status = e?.status === 503 ? 503 : 500;
    return res.status(status).json({
      ok: false,
      error: e?.status === 503 ? "AI model is busy. Please try again." : String(e.message || e),
    });
  }
});

module.exports = router;