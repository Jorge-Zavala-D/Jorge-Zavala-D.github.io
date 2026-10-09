const { readFileSync } = require("node:fs");
const { createHash } = require("node:crypto");
const { setTimeout } = require("node:timers/promises");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const expected = hash(readFileSync("assets/pdf/Jorge_Zavala_CV.pdf"));

(async () => {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`${process.env.SITE_URL}/assets/pdf/Jorge_Zavala_CV.pdf?verify=${Date.now()}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok && hash(Buffer.from(await response.arrayBuffer())) === expected) return;
    } catch (error) {
      console.warn(`Pages not ready: ${error.message}`);
    }
    await setTimeout(10000);
  }
  throw new Error("GitHub Pages did not serve the expected CV within the verification window.");
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
