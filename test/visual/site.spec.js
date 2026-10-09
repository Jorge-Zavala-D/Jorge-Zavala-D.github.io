const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const routes = ["/", "/research/", "/public-work/", "/teaching/", "/cv/", "/contact/"];
for (const route of routes) {
  test(`${route} is accessible and responsive`, async ({ page }, testInfo) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    await expect(page.locator('link[rel="stylesheet"][href*="/assets/css/main.css"]')).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    await testInfo.attach("accessibility-results", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)).not.toBe("none");
    await page.screenshot({ path: `output/playwright/${testInfo.project.name}-${route.replaceAll("/", "") || "home"}.png`, fullPage: true });
    if (process.env.CHECK_SCREENSHOTS)
      await expect(page).toHaveScreenshot(`${route.replaceAll("/", "") || "home"}.png`, { fullPage: true, maxDiffPixelRatio: 0.01 });
  });
}

test("CV content and downloads have one authoritative source", async ({ page, request }) => {
  await page.goto("/cv/");
  await expect(page.locator("body")).toContainText("Alexandra Scacco");
  await expect(page.locator("body")).toContainText("Identifying High-Risk Provinces for Violent Extremism in Burkina Faso Using Machine Learning");
  const pdf = await request.get("/assets/pdf/Jorge_Zavala_CV.pdf");
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("development files are not published", async ({ request }) => {
  for (const path of [
    "/scripts/sync-cv.ps1",
    "/test/style_contract.js",
    "/AGENTS.md",
    "/CLAUDE.md",
    "/requirements.txt",
    "/assets/rendercv/rendercv_output/Albert_Einstein_CV.pdf",
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test("all internal page links and downloads resolve", async ({ page, request, baseURL }) => {
  const links = new Set();
  for (const route of routes) {
    await page.goto(route);
    for (const href of await page.locator("a[href]").evaluateAll((nodes) => nodes.map((node) => node.href))) {
      const url = new URL(href);
      if (url.origin === new URL(baseURL).origin) {
        url.hash = "";
        links.add(url.href);
      }
    }
  }
  for (const link of links) expect((await request.get(link)).ok(), link).toBe(true);
});

test("external references do not return broken-link responses", async ({ page, request, baseURL }, testInfo) => {
  test.skip(!process.env.CHECK_EXTERNAL_LINKS, "External references are checked against the deployed site.");
  test.setTimeout(180000);
  const links = new Set();
  for (const route of routes) {
    await page.goto(route);
    for (const href of await page.locator("a[href]").evaluateAll((nodes) => nodes.map((node) => node.href))) {
      const url = new URL(href);
      if (["http:", "https:"].includes(url.protocol) && url.origin !== new URL(baseURL).origin) {
        url.hash = "";
        links.add(url.href);
      }
    }
  }
  const results = [];
  for (const url of links) {
    try {
      const response = await request.get(url, { timeout: 15000 });
      const status = response.status();
      results.push({ url, status, manualReview: [401, 403, 405, 429, 999].includes(status) });
    } catch (error) {
      results.push({ url, manualReview: true, reason: error.message });
    }
  }
  await testInfo.attach("external-link-results", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
  for (const result of results.filter((result) => result.status)) {
    expect(result.status, result.url).not.toBe(404);
    expect(result.status, result.url).not.toBe(410);
    expect(result.status, result.url).toBeLessThan(500);
  }
});
