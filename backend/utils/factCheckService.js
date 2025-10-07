import axios from "axios";

export async function checkClaims(
  claims,
  { languageCode = "en", maxPerClaim = 2 } = {}
) {
  const key = process.env.GOOGLE_FACT_CHECK_API_KEY;
  if (!key) throw new Error("GOOGLE_FACT_CHECK_API_KEY is not set");

  const out = {};
  await Promise.all(
    claims.map(async (claim) => {
      try {
        const { data } = await axios.get(
          "https://factchecktools.googleapis.com/v1alpha1/claims:search",
          { params: { query: claim, languageCode, key } }
        );

        const reviews = (data?.claims || [])
          .flatMap((c) =>
            (c.claimReview || []).map((cr) => ({
              url: cr.url,
              title: cr.title,
              publisher: cr.publisher?.name || cr.publisher,
              textualRating: cr.textualRating,
              reviewDate: cr.reviewDate,
            }))
          )
          .sort(
            (a, b) =>
              new Date(b.reviewDate || 0) - new Date(a.reviewDate || 0)
          )
          .slice(0, maxPerClaim);

        out[claim] = reviews;
      } catch {
        out[claim] = [];
      }
    })
  );

  return out;
}

export default { checkClaims };