const { devices } = require("@playwright/test");
const path = require("node:path");

module.exports = {
  testDir: __dirname,
  testMatch: "site.spec.js",
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: path.resolve(__dirname, "../../output/playwright/report") }]],
  outputDir: path.resolve(__dirname, "../../output/playwright/results"),
  use: { baseURL: process.env.SITE_URL || "http://127.0.0.1:4000", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: process.env.SITE_URL
    ? undefined
    : {
        cwd: path.resolve(__dirname, "../.."),
        command: "npx http-server _site -a 127.0.0.1 -p 4000 -c-1",
        url: "http://127.0.0.1:4000",
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1366, height: 900 } } },
    { name: "mobile", use: { ...devices["iPhone 12"], browserName: "webkit" } },
  ],
};
