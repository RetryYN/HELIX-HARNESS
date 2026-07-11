import { describe, expect, it } from "vitest";
import {
  analyzeSecretScan,
  loadSecretScanArtifacts,
  secretScanMessages,
} from "../src/lint/secret-scan";
import { isSecretLike, SECRET_PATTERN } from "../src/security/secret-policy";

// 検査対象の secret 様 token は実 credential と誤認されないよう連結で組み立てる
// (fixture 専用、not-a-secret。scanner の走査対象は docs/.helix であり tests/ は含まれない)。
const fakeNarrow = `sk-${"A".repeat(24)}`;
const fakeAws = `AKIA${"Z".repeat(16)}`;
const fakeGithub = `ghs_${"b".repeat(20)}`;
const fakeBearer = `Authorization: Bearer ${"t".repeat(24)}`;
const fakeAssignment = `api_key = "${"k".repeat(16)}"`;
const fakePrivateKey = "-----BEGIN RSA PRIVATE KEY-----";

describe("secret-scan lint", () => {
  it("U-SSCAN-000: security policyはnarrow secret tokenの単一正本を直接公開する", () => {
    expect(SECRET_PATTERN.test(fakeNarrow)).toBe(true);
    expect(isSecretLike(fakeNarrow)).toBe(true);
    expect(isSecretLike("planning-and-task-breakdown")).toBe(false);
  });
  it("U-SSCAN-001: 各 marker の secret 様 token を path/line/marker 付きで violation 報告する", () => {
    const result = analyzeSecretScan([
      { path: "docs/a.md", text: `# doc\n${fakeNarrow}\n` },
      { path: "docs/b.md", text: `${fakeAws}\n` },
      { path: "docs/c.md", text: `token: ${fakeGithub}\n` },
      { path: "docs/d.md", text: `${fakePrivateKey}\n` },
      { path: "docs/e.md", text: `${fakeBearer}\n` },
      { path: "docs/f.md", text: `${fakeAssignment}\n` },
    ]);

    expect(result.ok).toBe(false);
    expect(result.checked).toBe(6);
    const byPath = new Map(result.violations.map((v) => [v.path, v]));
    expect(byPath.get("docs/a.md")).toMatchObject({ line: 2, marker: "narrow-secret-token" });
    expect(byPath.get("docs/b.md")).toMatchObject({ line: 1, marker: "aws-access-key" });
    expect(byPath.get("docs/c.md")).toMatchObject({ line: 1, marker: "github-token" });
    expect(byPath.get("docs/d.md")).toMatchObject({ line: 1, marker: "private-key-block" });
    expect(byPath.get("docs/e.md")).toMatchObject({ line: 1, marker: "authorization-bearer" });
    expect(byPath.get("docs/f.md")).toMatchObject({ line: 1, marker: "secret-assignment" });
    expect(secretScanMessages(result)[0]).toContain("violation");
  });

  it("U-SSCAN-002: allow marker 行と語境界外の部分一致は violation にしない", () => {
    const result = analyzeSecretScan([
      // redacted / example / placeholder / dummy を含む行は例示として許容する
      { path: "docs/allow.md", text: `redacted example: ${fakeNarrow}\n` },
      { path: "docs/allow2.md", text: `placeholder token ${fakeGithub} (dummy)\n` },
      // SECRET_PATTERN は語境界アンカー: hyphenated slug 中の "sk" は token ではない
      {
        path: "docs/word.md",
        text: "task-breakdown と risk-assessment-of-something-long を扱う\n",
      },
      // 16 文字未満の短い prefix 一致は token 扱いしない
      { path: "docs/short.md", text: "sk-breakdown ghp_short\n" },
    ]);

    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("U-SSCAN-003: clean な artifact 集合は ok=true で OK message 1 行を返す", () => {
    const result = analyzeSecretScan([
      {
        path: "docs/clean.md",
        text: "# HELIX 設計\n\n`helix doctor` は gate evidence を確認する。\n",
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.checked).toBe(1);
    const messages = secretScanMessages(result);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain("OK");
  });

  it("U-SSCAN-004: 実 repo regression — docs / .helix runtime state 面に credential marker が無い", () => {
    const artifacts = loadSecretScanArtifacts(process.cwd());
    expect(artifacts.length).toBeGreaterThan(0);

    const result = analyzeSecretScan(artifacts);
    expect(result.violations.map((v) => `${v.path}:${v.line}:${v.marker}`)).toEqual([]);
    expect(result.ok).toBe(true);
  });
});
