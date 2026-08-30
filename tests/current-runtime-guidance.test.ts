import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string): string => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json")) as {
  bin?: { helix?: string };
  engines?: { node?: string };
  scripts?: Record<string, string>;
};

const surfaces = {
  l13: "docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md",
  l7: "docs/process/forward/L07-implementation.md",
  setup: "docs/reference/setup-guide.md",
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

  it("U-CRG-003: binds guidance to the package authority", () => {
    const l13 = read(surfaces.l13);
    expect(packageJson.scripts?.helix).toBe("tsx src/cli.ts");
    expect(packageJson.scripts?.test).toContain("vitest");
    expect(packageJson.scripts?.build).toContain("--outfile=dist/helix.js");
    expect(packageJson.bin?.helix).toBe("./dist/helix.js");
    expect(l13).toContain("npm run build && node ./dist/helix.js doctor");
    expect(l13).toContain("npm run helix -- rename dist-smoke --no-write --target helix --json");
  });

  it("U-CRG-004: keeps consumer setup guidance on the package Node/npm authority", () => {
    const body = read(surfaces.setup);
    expect(body).toContain(`Node.js ${packageJson.engines?.node}`);
    expect(body).toContain("`npm ci`");
    expect(body).toContain("`npm run helix -- setup project --dry-run --json`");
    expect(body).toContain("`npm run helix -- doctor --profile consumer --json`");
    expect(body).toContain("package-local `npm run helix -- <command>`");
    expect(body).not.toMatch(/`npm run helix (?!-- )/u);
    expect(body).not.toMatch(/\bbun\b/i);
  });
});
