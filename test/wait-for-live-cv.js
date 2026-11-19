const { readFileSync } = require("node:fs");
const { createHash } = require("node:crypto");
const { setTimeout } = require("node:timers/promises");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const expected = ["assets/pdf/Jorge_Zavala_CV.pdf", "assets/pdf/Jorge_Zavala_Academic_CV.pdf"].map((path) => ({
  path,
  digest: hash(readFileSync(path)),
}));
const expectedCommit = process.env.EXPECTED_SITE_COMMIT;

(async () => {
  if (!/^[a-f0-9]{40}$/.test(expectedCommit || "")) throw new Error("EXPECTED_SITE_COMMIT must be the full build commit.");
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const version = await fetch(`${process.env.SITE_URL}/site-version.json?verify=${Date.now()}`, { signal: AbortSignal.timeout(15000) });
      if (version.ok && (await version.json()).commit === expectedCommit) {
        const matches = await Promise.all(
          expected.map(async ({ path, digest }) => {
            const response = await fetch(`${process.env.SITE_URL}/${path}?verify=${Date.now()}`, {
              signal: AbortSignal.timeout(15000),
            });
            return response.ok && hash(Buffer.from(await response.arrayBuffer())) === digest;
          })
        );
        if (matches.every(Boolean)) return;
      }
    } catch (error) {
      console.warn(`Pages not ready: ${error.message}`);
    }
    await setTimeout(10000);
  }
  throw new Error("GitHub Pages did not serve the expected build commit and both CVs within the verification window.");
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
