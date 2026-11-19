const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { readFileSync } = require("node:fs");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

test("live verification waits for the expected release and both distinct CVs", async () => {
  let releases = 0;
  let academicRequests = 0;
  const professional = "assets/pdf/Jorge_Zavala_CV.pdf";
  const academic = "assets/pdf/Jorge_Zavala_Academic_CV.pdf";
  const commit = "a".repeat(40);
  const server = createServer((req, res) => {
    assert.match(req.url, /^\/(site-version\.json|assets\/pdf\/Jorge_Zavala_(Academic_)?CV\.pdf)\?verify=/);
    const path = req.url.split("?")[0].slice(1);
    if (path === "site-version.json") {
      releases++;
      if (releases === 1) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ commit: releases === 2 ? "b".repeat(40) : commit }));
    } else {
      res.writeHead(200);
      const swapAcademic = path === academic && ++academicRequests === 1;
      res.end(readFileSync(swapAcademic ? professional : path));
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await promisify(execFile)(process.execPath, ["test/wait-for-live-cv.js"], {
      env: { ...process.env, SITE_URL: `http://127.0.0.1:${server.address().port}`, EXPECTED_SITE_COMMIT: commit },
      timeout: 45000,
    });
    assert.equal(releases, 4);
    assert.equal(academicRequests, 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
