import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string): string => readFileSync(path, "utf8");

const surfaces = {
  l13: "docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md",
  l7: "docs/process/forward/L07-implementation.md",
} as const;

describe("current runtime command guidance", () => {
  it("U-CRG-001: keeps L13 smoke and rename rehearsal on Node/npm", () => {
    const body = read(surfaces.l13);
    expect(body).toContain("npm run build && node ./dist/helix.js doctor");
    expect(body).toContain("npm run helix -- rename dist-smoke --no-write --target helix --json");
    expect(body).not.toMatch(/\bbun(?:\s+run|\s+test)?\b/i);
  });

  it("U-CRG-002: keeps the Forward L7 test step on the npm test script", () => {
    const body = read(surfaces.l7);
    expect(body).toContain("npm run test");
    expect(body).not.toMatch(/\bbun(?:\s+run|\s+test)?\b/i);
  });
});
