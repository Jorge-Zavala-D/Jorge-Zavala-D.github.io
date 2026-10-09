const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { readFileSync } = require("node:fs");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

test("live CV verification tolerates an initial missing deployment and requires matching bytes", async () => {
  let requests = 0;
  const pdf = readFileSync("assets/pdf/Jorge_Zavala_CV.pdf");
  const server = createServer((req, res) => {
    assert.match(req.url, /^\/assets\/pdf\/Jorge_Zavala_CV\.pdf\?verify=/);
    requests++;
    if (requests === 1) {
      res.writeHead(404);
      res.end();
    } else {
      res.writeHead(200);
      res.end(pdf);
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await promisify(execFile)(process.execPath, ["test/wait-for-live-cv.js"], {
      env: { ...process.env, SITE_URL: `http://127.0.0.1:${server.address().port}` },
      timeout: 25000,
    });
    assert.equal(requests, 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
