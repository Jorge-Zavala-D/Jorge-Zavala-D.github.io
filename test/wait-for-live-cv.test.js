const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { readFileSync } = require("node:fs");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

test("live verification rejects missing or stale releases and mismatched CV bytes", async () => {
  let requests = 0;
  const pdf = readFileSync("assets/pdf/Jorge_Zavala_CV.pdf");
  const commit = "a".repeat(40);
  const server = createServer((req, res) => {
    assert.match(req.url, /^\/(site-version\.json|assets\/pdf\/Jorge_Zavala_CV\.pdf)\?verify=/);
    requests++;
    if (requests === 1) {
      res.writeHead(404);
      res.end();
    } else if (req.url.startsWith("/site-version.json")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ commit: requests === 2 ? "b".repeat(40) : commit }));
    } else {
      res.writeHead(200);
      res.end(requests === 4 ? Buffer.from("%PDF-wrong") : pdf);
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await promisify(execFile)(process.execPath, ["test/wait-for-live-cv.js"], {
      env: { ...process.env, SITE_URL: `http://127.0.0.1:${server.address().port}`, EXPECTED_SITE_COMMIT: commit },
      timeout: 45000,
    });
    assert.equal(requests, 6);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
