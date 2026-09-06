// PLAN-RECOVERY-1430-evidence-substance
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { renderAppShell } from "../src/web/render";
import { loadUiTokens } from "../src/web/tokens";

let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser.close();
});

describe("G10 real browser evidence", () => {
  it("U-GES-015: 実Chromiumでrender・keyboard・a11y boundaryを検査する", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const tokens = loadUiTokens();
    await page.setContent(renderAppShell(tokens), { waitUntil: "load" });

    expect(await page.locator("html").getAttribute("lang")).toBe("ja");
    expect(await page.locator("main article").count()).toBeGreaterThan(0);
    expect(await page.locator("h1").count()).toBe(await page.locator("main article").count());
    expect(await page.locator(".status-badge[aria-label]").count()).toBeGreaterThan(0);
    expect(
      await page.locator(".status-error, .status-warn, .status-empty").count(),
    ).toBeGreaterThan(0);
    expect(await page.locator("button[aria-label]").count()).toBeGreaterThan(0);

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused.count()).resolves.toBe(1);
    const target = await focused.evaluate((element) => {
      const browserGlobal = globalThis as unknown as {
        getComputedStyle(value: unknown): {
          outlineStyle: string;
          outlineWidth: string;
        };
      };
      const style = browserGlobal.getComputedStyle(element);
      const rect = (
        element as unknown as { getBoundingClientRect(): { width: number; height: number } }
      ).getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(target.width).toBeGreaterThanOrEqual(tokens.size.control.minTarget);
    expect(target.height).toBeGreaterThanOrEqual(tokens.size.control.minTarget);
    expect(target.outlineStyle).not.toBe("none");
    expect(Number.parseFloat(target.outlineWidth)).toBeGreaterThan(0);

    const screenshotPath = process.env.HELIX_G10_SCREENSHOT;
    expect(screenshotPath, "HELIX_G10_SCREENSHOT must bind this browser run to an image").toBeTruthy();
    const absolute = resolve(screenshotPath as string);
    mkdirSync(dirname(absolute), { recursive: true });
    await page.screenshot({ path: absolute, fullPage: true });
    await page.close();
  }, 60_000);
});
