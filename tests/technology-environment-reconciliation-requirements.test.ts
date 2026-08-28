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
});
