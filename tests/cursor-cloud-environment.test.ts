// PLAN-RECOVERY-76 / TER-CURSOR-CLOUD-ENV-001
// PLAN-RECOVERY-1293-cursor-image-git
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const environment = JSON.parse(readFileSync(".cursor/environment.json", "utf8")) as Record<
  string,
  unknown
>;
const dockerfile = readFileSync(".cursor/Dockerfile", "utf8");
const install = readFileSync(".cursor/install.sh", "utf8");
const imageDigest = "sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e";

describe("Cursor Cloud Agent environment admission", () => {
  it("U-CURSOR-ENV-001: repo-owned Dockerfileとinstall scriptをexact選択する", () => {
    expect(environment).toEqual({
      name: "HELIX-HARNESS",
      build: { dockerfile: "Dockerfile", context: "." },
      install: "bash .cursor/install.sh",
    });
  });

  it("U-CURSOR-ENV-002: Node image identityをversionとmanifest digestへ固定する", () => {
    expect(dockerfile).toContain(`FROM node:24.20.0-bookworm-slim@${imageDigest}`);
    expect(dockerfile).toContain(`io.helix.node.manifest-digest="${imageDigest}"`);
    expect(dockerfile).not.toMatch(/^FROM\s+[^\n@]+$/mu);
  });

  it("U-CURSOR-ENV-003: range確認からstatusまでの検証列を省略しない", () => {
    for (const required of [
      "set -euo pipefail",
      "major !== 24",
      "minor < 15",
      "npm ci",
      "npm run typecheck",
      "npm run build",
      "vitest run tests/cursor-cloud-environment.test.ts",
      "npm run helix -- status --json",
    ]) {
      expect(install, required).toContain(required);
    }
    expect(install.indexOf("major !== 24")).toBeLessThan(install.indexOf("npm ci"));
  });

  it("U-CURSOR-ENV-004: runtime download、host write、native fallbackを拒否する", () => {
    for (const forbidden of [
      /\bcurl\b/u,
      /\bwget\b/u,
      /\bnvm\b/u,
      /\/usr\/local/u,
      /\/tmp(?:\/|\b)/u,
      /\|\|\s*true/u,
      /警告:/u,
      /npm\s+install(?:\s|$)/u,
    ]) {
      expect(install, String(forbidden)).not.toMatch(forbidden);
      expect(dockerfile, String(forbidden)).not.toMatch(forbidden);
    }
  });

  it("U-CURSOR-ENV-005: clone前にimageへGitとHTTPS証明書を組み込む", () => {
    expect(dockerfile).toMatch(
      /RUN apt-get update\s*\\\n\s*&& apt-get install --no-install-recommends -y git ca-certificates/u,
    );
    expect(dockerfile).toContain("&& git --version");
    expect(install).not.toContain("apt-get");
  });
});
