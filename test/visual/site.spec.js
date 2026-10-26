const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const routes = ["/", "/research/", "/publications/", "/policy/", "/teaching/", "/cv/"];
for (const route of routes) {
  test(`${route} is accessible and responsive`, async ({ page }, testInfo) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    if (route === "/") {
      const portrait = page.locator(".hero__portrait img");
      await expect(portrait).toHaveJSProperty("complete", true);
      expect(await portrait.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
      expect(await portrait.evaluate((img) => img.currentSrc)).toMatch(/jorge-zavala-profile-(480|800|1400)\.webp$/);
    }
    await expect(page.locator('link[rel="stylesheet"][href*="/assets/css/main.css"]')).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    await testInfo.attach("accessibility-results", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)).not.toBe("none");
    await page.screenshot({
      path: `output/playwright/${testInfo.project.name}-${route.replaceAll("/", "") || "home"}.png`,
      fullPage: true,
      scale: "css",
    });
    if (process.env.CHECK_SCREENSHOTS || ["all", "changed"].includes(testInfo.config.updateSnapshots))
      await expect(page).toHaveScreenshot(`${route.replaceAll("/", "") || "home"}.png`, { fullPage: true, scale: "css", maxDiffPixelRatio: 0.01 });
  });
}

test("CV content and downloads have one authoritative source", async ({ page, request }) => {
  await page.goto("/cv/");
  await expect(page.locator("body")).toContainText("Alexandra Scacco");
  await expect(page.locator("body")).toContainText("Identifying High-Risk Provinces for Violent Extremism in Burkina Faso Using Machine Learning");
  const sections = await page.locator(".cv-section").evaluateAll((nodes) =>
    nodes.map((node) => ({
      name: node.id,
      content: node.textContent.replace(node.querySelector(".cv-section__header").textContent, "").trim(),
    }))
  );
  expect(sections.length).toBeGreaterThan(0);
  for (const section of sections) expect(section.content.length, `${section.name} must not be empty`).toBeGreaterThan(0);
  const pdf = await request.get("/assets/pdf/Jorge_Zavala_CV.pdf");
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("the new work in progress is listed once with consistent public metadata", async ({ page }) => {
  const title = "Evaluating Coercive Governments Abroad: Threat, Performance, and Electoral Democracy";
  for (const route of ["/", "/research/", "/publications/", "/cv/"]) {
    await page.goto(route);
    const heading = page.getByRole("heading", { name: title });
    await expect(heading).toHaveCount(1);
    const project = heading.locator("xpath=ancestor::article[1]");
    await expect(project).toContainText("With Daniel Kuhlen and Giovanna Lapresa");
    await expect(project).toContainText(/working title/i);
    await expect(project).toContainText("Work in progress");
    await expect(project.locator('a[href*=".pdf"], a[href*="doi.org"]')).toHaveCount(0);
  }
});

test("Harris custom-program teaching keeps the three-course appointment and historical roles distinct", async ({ page }) => {
  for (const route of ["/teaching/", "/cv/"]) {
    await page.goto(route);
    const appointment = route === "/teaching/" ? page.locator("#uchicago-gdp7") : page.locator("#teaching .cv-entry").filter({ hasText: "DSC GDP7" });
    await expect(appointment).toHaveCount(1);
    for (const text of [
      "Advanced Policy Evaluation",
      "Policy Analysis",
      "Economic Modeling and Forecasting",
      "Sheng-Hao Lo",
      "October–November 2026",
      "Remote",
      "non-degree professional training",
      "Saudi Arabia",
    ]) {
      await expect(appointment).toContainText(text, { ignoreCase: true });
    }
    const previousAppointment =
      route === "/teaching/" ? page.locator("#uchicago-gdp6") : page.locator("#teaching .cv-entry").filter({ hasText: "DSC GDP6" });
    await expect(previousAppointment).toHaveCount(1);
    await expect(previousAppointment).toContainText("November 2025");
    await expect(previousAppointment).toContainText("Mastering Public Policy Practices");
    for (const text of ["Statistics I", "Statistics II", "Math and Coding Camp", "Economics for Public Policy", "Econometrics I"]) {
      await expect(page.locator("body")).toContainText(text);
    }
  }
  await page.goto("/");
  await expect(page.locator(".appointments")).toContainText("University of Chicago, Harris School of Public Policy");
  await expect(page.locator(".appointments")).toContainText("Hertie School");
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
  for (const result of results.filter((result) => result.status && !result.manualReview)) {
    expect(result.status, result.url).not.toBe(404);
    expect(result.status, result.url).not.toBe(410);
    expect(result.status, result.url).toBeLessThan(500);
  }
});
