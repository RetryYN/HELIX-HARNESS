import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PLAN_PATH = "docs/plans/PLAN-L3-36-atomic-development-contract.md";
const DESIGN_PATH = "docs/design/helix/L3-requirements/github-atomic-development-requirements.md";
const TEST_DESIGN_PATH = "docs/test-design/helix/github-atomic-development-system-test-design.md";
const FREEZE_PACKET_PATH = "docs/governance/l3-rebaseline-g3-freeze-packet.md";

const plan = readFileSync(PLAN_PATH, "utf8");
const design = readFileSync(DESIGN_PATH, "utf8");
const testDesign = readFileSync(TEST_DESIGN_PATH, "utf8");
const ciDesign = readFileSync(
  "docs/design/helix/L3-requirements/github-ci-performance-requirements.md",
  "utf8",
);
const requirements = readFileSync("docs/governance/helix-harness-requirements_v1.3.md", "utf8");
const freezePacket = readFileSync(FREEZE_PACKET_PATH, "utf8");

describe("PLAN-L3-36 atomic development contract", () => {
  it("pairs GH-FR-024..028 with GH-AC/T-035..039 exactly", () => {
    for (const id of ["024", "025", "026", "027", "028"]) {
      expect(design).toContain(`GH-FR-${id}`);
    }
    for (const id of ["035", "036", "037", "038", "039"]) {
      expect(design).toContain(`GH-AC-${id}`);
      expect(testDesign).toContain(`GH-T-${id}`);
      expect(testDesign).toContain(`GH-AC-${id}`);
    }
    expect(design).toContain(`pair_artifact: ${TEST_DESIGN_PATH}`);
    expect(testDesign).toContain(`pair_artifact: ${DESIGN_PATH}`);
  });

  it("uses one behavior contract and one DDD responsibility owner as the atomic unit", () => {
    expect(design).toContain("exactly-one acceptance behavior");
    expect(design).toContain("exactly-one責務owner");
    expect(design).toContain("複数aggregate");
    expect(design).toContain("characterization oracle");
    expect(plan).toContain("1 behavior contract + 1 responsibility owner");
  });

  it("keeps PR CI targeted while recovering the exact skipped set after merge", () => {
    expect(design).toContain("変更behaviorのtargeted oracle");
    expect(design).toContain("main合流直後のfull regression");
    expect(design).toContain("省略したtest/gate集合はdigest付き");
    expect(design).toContain("full profileへfail-close");
    expect(design).toContain("最初のterminal recovery receiptへexactly-one");
    expect(design).toContain("nightly再実行を二重回収として分母へ加算しない");
    expect(design).toContain("p95 60秒");
    expect(design).toContain("p95 3分");
    expect(design).toContain("Performance Recovery");
    expect(testDesign).toContain("post-merge一次回収receipt");
    expect(testDesign).toContain("nightly補完receipt");
    expect(plan).toContain("run `30022734228` の22分2秒");
  });

  it("blocks legacy removal and next-task projection without predecessor evidence", () => {
    for (const marker of [
      "characterization contract freeze",
      "new/old dual-green",
      "consumer=0",
      "rollback receipt",
    ]) {
      expect(design).toContain(marker);
    }
    expect(design).toContain("exactly-one ready action");
    expect(design).toContain("prose順や人手選択をauthorityにせず");
    expect(testDesign).toContain("GitHub/PLAN/workflow/DB projection digest");
  });

  it("keeps implementation and queue allocation outside this design PR", () => {
    expect(plan).toContain("status: confirmed");
    expect(plan).toContain("issuecomment-5061958725");
    expect(plan).toContain("別PRでexact採番");
    expect(plan).toContain("5 workstreamを分離");
    expect(plan).toContain("合計15枠");
    expect(plan).toContain("実装はL4以降");
    expect(design).toContain("本書の存在だけでPR高速化");
    expect(freezePacket).toContain("`L3Q-PC-036..045`");
    expect(freezePacket).toContain("`L3Q-IT-023..027`");
    expect(freezePacket).toContain("pair closure 10枠、L6/L7 5枠、15枠");
  });

  it("curates the predecessor HELIX behavior without bulk-porting its runtime", () => {
    expect(plan).toContain("1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23");
    expect(plan).toContain("HELIX-workflows/helix-process/refactor-workflow.md");
    expect(plan).toContain("cli/lib/refactor_engine.py");
    expect(plan).toContain("local `fcntl` lockやtest件数一致をauthorityにせず");
    expect(plan).toContain("PRごとの直列full regression");
    expect(plan).toContain("bulk移植");
  });

  it("requires an exclusive writer lease and explicit review handoff", () => {
    expect(design).toContain("exactly-one writer lease");
    expect(design).toContain("reviewerはread-only lease");
    expect(design).toContain("writerのrelease event");
    expect(design).toContain("reviewerのacquire event");
    expect(design).toContain("stale-recovery receipt");
    expect(design).toContain("active takeoverを同時にconsumeまたはsupersede");
    expect(design).toContain("複数active lease");
    expect(design).toContain("active entryがある間15分");
    expect(design).toContain("heartbeatは15分");
    expect(design).toContain("TTLは45分");
    expect(design).toContain("lease acquireに成功した");
    expect(testDesign).toContain("GH-T-039");
  });

  it("removes the full-every-PR contradiction and registers the authority", () => {
    expect(ciDesign).not.toContain("PR作成前、merge直前、main merge後");
    expect(ciDesign).toContain("main merge後とnightly");
    expect(ciDesign).toContain("省略した集合はmain merge後に一次回収");
    expect(ciDesign).toContain("再実行を二重計上しない");
    expect(requirements).toContain(DESIGN_PATH);
    expect(requirements).toContain(TEST_DESIGN_PATH);
    expect(requirements).toContain("memory takeover通知だけではwrite ownershipを移譲しない");
  });
});
