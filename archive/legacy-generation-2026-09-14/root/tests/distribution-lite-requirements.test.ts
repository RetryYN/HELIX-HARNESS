import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const l3 = readFileSync(
  "docs/design/helix/L3-requirements/distribution-package-release-requirements.md",
  "utf8",
);
const l10 = readFileSync(
  "docs/test-design/helix/distribution-package-release-system-test-design.md",
  "utf8",
);

describe("HELIX-HARNESS-LITE distribution requirements", () => {
  it("ST-DIST-LITE-001: profile identityと唯一のsource authorityを固定する", () => {
    for (const source of [l3, l10]) {
      expect(source).toContain("consumer_core_v1");
    }
    expect(l3).toContain("HELIX-HARNESS-LITE");
    expect(l3).toContain("development repository `HELIX-HARNESS`のみ");
    expect(l3).toContain("RetryYN/HELIX-HARNESS-DevOS");
    expect(l3).toContain("別製品authorityを追加しない");
    expect(l3).toContain("canonical Requirement IR");
  });

  it("ST-DIST-LITE-002: allowlist昇格と初期除外境界を固定する", () => {
    expect(l3).toContain("versioned promotion receipt");
    expect(l3).toContain("#188 switching／routing／allocation");
    expect(l3).toContain("#819 resident multi-runtime lane");
    expect(l3).toContain("CLI help、");
    expect(l3).toContain("setup、schema、doctor、generated docsからも到達不能");
    expect(l3).toContain("Lite独自仕様");
  });

  it("ST-DIST-LITE-003: safe staged releaseと不可逆cutoverを分離する", () => {
    expect(l3).toContain("standing authorization receipt");
    expect(l3).toContain("追加承認なしで自走できる");
    expect(l3).toContain("repository切替、");
    expect(l3).toContain("identifier／state cutover");
    expect(l3).toContain("action-binding approval境界へ残す");
    expect(l10).toContain("stage skip");
    expect(l10).toContain("policy外cutover");
  });
});
