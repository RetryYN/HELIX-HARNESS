import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// PLAN-RECOVERY-1728-infrastructure-operations-quality-intake
const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const digest = (path: string) =>
  createHash("sha256")
    .update(readFileSync(resolve(root, path)))
    .digest("hex");
const sequence = (size: number) =>
  Array.from({ length: size }, (_, index) => String(index + 1).padStart(2, "0"));
const ids = (source: string, prefix: string) =>
  [...source.matchAll(new RegExp(`^\\| ${prefix}-(\\d{2}) \\|`, "gm"))].map((match) => match[1]);

describe("インフラ・運用品質要求候補", () => {
  it("U-NIO-001: 9要求群と既存owner接続を欠落なく保持する", () => {
    expect(
      digest("docs/archive/intake/infrastructure-operations-handoff-under-4000-source_v0.1.md"),
    ).toBe("0e77630d44fff35d587b0577941a35ebd10429a20f2b00f3098486552ede60e2");
    expect(
      digest(
        "docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md",
      ),
    ).toBe("4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344");
    const intake = read("docs/governance/candidates/infrastructure-operations-quality-intake.md");
    expect(ids(intake, "NIO-CAND")).toEqual(sequence(9));
    for (const issue of [219, 220, 221, 222, 223, 1160, 1169, 290, 1033, 1318, 282, 186, 1035]) {
      expect(intake).toContain(`#${issue}`);
    }
  });

  it("U-NIO-002: L1/L3/L10を別候補としてexact setで保持する", () => {
    const l1 = read(
      "docs/governance/candidates/infrastructure-operations-quality-l1-request-candidates.md",
    );
    const l3 = read(
      "docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md",
    );
    const l10 = read(
      "docs/governance/candidates/infrastructure-operations-quality-l10-acceptance-candidates.md",
    );
    expect(ids(l1, "NIO-L1")).toEqual(sequence(5));
    expect(ids(l3, "NIO-L3")).toEqual(sequence(9));
    expect(ids(l10, "NIO-L10")).toEqual(sequence(9));
  });

  it("U-NIO-003: 自動権限化と運用完了の誤昇格を禁止する", () => {
    const intake = read("docs/governance/candidates/infrastructure-operations-quality-intake.md");
    const acceptance = read(
      "docs/governance/candidates/infrastructure-operations-quality-l10-acceptance-candidates.md",
    );
    expect(intake).toContain("runtime write authority");
    expect(intake).toContain("実装済み・運用済みとしない");
    expect(acceptance).toContain("未承認scopeへ自動修復");
    expect(acceptance).toContain("collector停止、欠測、stale evidenceをhealthyへ写像した場合はRED");
  });
});
