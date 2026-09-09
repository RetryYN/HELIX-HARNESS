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

// Package同梱と任意download実行を区別する。許容RUN全体を閉じ、追加命令を黙認しない。
function hasBoundedPrerequisites(source: string): boolean {
  const lines = source.replace(/\\\r?\n\s*/gu, " ").split(/\r?\n/u);
  const runs = lines.filter((line) => /^RUN\s/iu.test(line));
  const expected =
    "RUN apt-get update && apt-get install --no-install-recommends -y git ca-certificates curl && git --version && curl --version && dpkg-query -W git ca-certificates curl && apt-get clean";
  return (
    runs.length === 1 &&
    runs[0]?.trim().replace(/\s+/gu, " ") === expected &&
    lines.every(
      (line) =>
        !(/^\s*ADD\s/iu.test(line) && /(?:https?:\/\/|git@|ssh:\/\/)/iu.test(line)) &&
        !(/^\s*COPY\s/iu.test(line) && /--from(?:=|\s)/iu.test(line)),
    ) &&
    lines.every((line) => !/\b(?:curl|wget)\b/u.test(line) || line === runs[0])
  );
}

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
      if (String(forbidden) !== String(/\bcurl\b/u)) {
        expect(dockerfile, String(forbidden)).not.toMatch(forbidden);
      }
    }
    expect(hasBoundedPrerequisites(dockerfile)).toBe(true);
  });

  it("U-CURSOR-ENV-005: clone前にimageへGitとHTTPS証明書を組み込む", () => {
    expect(dockerfile).toMatch(
      /RUN apt-get update\s*\\\n\s*&& apt-get install --no-install-recommends -y git ca-certificates/u,
    );
    expect(dockerfile).toContain("&& git --version");
    expect(install).not.toContain("apt-get");
  });

  it("U-CURSOR-ENV-006: package同梱だけを許容しdownload実行と検査欠落を拒否する", () => {
    expect(hasBoundedPrerequisites(dockerfile)).toBe(true);
    const mutations = [
      `${dockerfile}\nADD https://example.invalid/tool /opt/tool`,
      `${dockerfile}\nADD git@example.invalid:tool /opt/tool`,
      `${dockerfile}\nADD ssh://example.invalid/tool /opt/tool`,
      `${dockerfile}\nCOPY --from=ghcr.io/example/tool:latest /tool /opt/tool`,
      `${dockerfile}\nRUN curl https://example.invalid/tool`,
      `${dockerfile}\nRUN wget https://example.invalid/tool`,
      `${dockerfile}\nRUN echo payload | sh`,
      `${dockerfile}\nRUN echo payload | bash`,
      `${dockerfile}\nENV DOWNLOADER=curl`,
      `${dockerfile}\nCMD curl`,
      dockerfile.replace("&& curl --version", "&& true"),
      dockerfile.replace("-y git ca-certificates curl", "-y git ca-certificates curl wget"),
      dockerfile.replace("&& dpkg-query -W git ca-certificates curl", "&& true"),
    ];
    for (const mutant of mutations) {
      expect(mutant).not.toBe(dockerfile);
      expect(hasBoundedPrerequisites(mutant), mutant).toBe(false);
    }
  });
});
