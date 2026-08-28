import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const requirement = readFileSync(
  join(
    root,
    "docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md",
  ),
  "utf8",
);
const acceptance = readFileSync(
  join(root, "docs/test-design/helix/technology-environment-reconciliation-acceptance.md"),
  "utf8",
);

const requiredIds = Array.from(
  { length: 12 },
  (_, index) => `TER-R-${String(index + 1).padStart(2, "0")}`,
);

function acceptanceRequirementIds(text: string): Set<string> {
  return new Set(
    [...text.matchAll(/^\| TER-AC-\d{3} \| ([^|]+) \|/gm)].flatMap((row) =>
      [...(row[1] ?? "").matchAll(/TER-R-\d{2}/g)].map((match) => match[0]),
    ),
  );
}

function isTracked(path: string): boolean {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", "--", path], {
      cwd: root,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

describe("Technology Environment Reconciliation Authority", () => {
  it("TER-AC-001: 6 FRと12 requirementをexact setで保持する", () => {
    expect([...requirement.matchAll(/^### (TER-FR-\d{3})/gm)].map((m) => m[1])).toEqual(
      Array.from({ length: 6 }, (_, index) => `TER-FR-${String(index + 1).padStart(3, "0")}`),
    );
    expect([...requirement.matchAll(/`(TER-R-\d{2}) /g)].map((m) => m[1])).toEqual(
      Array.from({ length: 12 }, (_, index) => `TER-R-${String(index + 1).padStart(2, "0")}`),
    );
  });

  it("TER-AC-002..018: L10 oracleを欠落なく保持する", () => {
    expect([...acceptance.matchAll(/^\| (TER-AC-\d{3}) /gm)].map((m) => m[1])).toEqual(
      Array.from({ length: 18 }, (_, index) => `TER-AC-${String(index + 1).padStart(3, "0")}`),
    );
    expect(acceptance).toContain("repository設定の存在だけでgreenにしない");
    expect(acceptance).toContain("同一enumへ畳み込まない");
    expect(acceptance).toContain("self-host例外、手編集receiptを拒否");
    expect([...acceptanceRequirementIds(acceptance)].sort()).toEqual(requiredIds);
    expect(
      [...acceptanceRequirementIds(acceptance.replaceAll("TER-R-12", "TER-R-11"))].sort(),
    ).not.toEqual(requiredIds);
  });

  it("既存authorityをtyped edgeで再利用し、7 sliceを依存順に分離する", () => {
    for (const id of [
      "TECH-STACK-FR-001",
      "WCC-FR-01",
      "WCC-FR-05",
      "HR-FR-P4-01",
      "HR-FR-P7-01",
      "HR-NFR-P8-01",
    ]) {
      expect(requirement).toContain(`  - ${id}`);
    }
    expect([...requirement.matchAll(/^\| TER-(\d{2}) \| #(\d+) /gm)]).toHaveLength(7);
    expect(requirement).toContain("別DB正本、別workflow分類、provider固有Coreを作らない");
    expect(requirement).toContain("Action full SHA、runner/toolchain effective identity");
    expect(requirement).toContain("#1185はTERの新しいCore sliceではなく");
    expect(requirement).toContain("Bootstrap Trust Root #1186");
  });

  it("typed authority edgeの参照先を実在IDへ束縛する", () => {
    const authorities: Record<string, string> = {
      "TECH-STACK-FR-001": "docs/design/helix/L3-requirements/technology-stack-authority.md",
      "WCC-FR-01": "docs/design/helix/L4-basic-design/worker-wrapper-admission.md",
      "WCC-FR-05": "docs/design/helix/L4-basic-design/worker-wrapper-admission.md",
      "HR-FR-P4-01": "docs/design/helix/L4-basic-design/pillar-basic-design.md",
      "HR-FR-P7-01": "docs/design/helix/L4-basic-design/pillar-basic-design.md",
      "HR-NFR-P8-01": "docs/design/harness/L4-basic-design/external-if.md",
    };
    for (const [id, path] of Object.entries(authorities)) {
      const text = readFileSync(join(root, path), "utf8");
      expect(text, `${id} must resolve in ${path}`).toContain(id);
    }
  });

  it("提案sourceをrepository authorityとして残さない", () => {
    for (const source of [
      "HELIX_技術環境継続追従_新要求.md",
      "HELIX_技術環境継続追従_新要求 (1).md",
      "HELIX_構造的抜け穴_全点検報告_2026-08-29.md",
    ]) {
      expect(isTracked(source), source).toBe(false);
    }
  });
});
