import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath =
  "docs/design/helix/L3-requirements/management-integration-cell-requirements.md";
const acceptancePath = "docs/test-design/helix/management-integration-cell-acceptance.md";
const planPath = "docs/plans/PLAN-L3-43-management-integration-cell-model.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const plan = readFileSync(planPath, "utf8");

describe("L3/L10 management-integration cell contract", () => {
  it("MIC-U-001: exposes exactly one current behavior contract and seven supporting requirements", () => {
    expect([...requirement.matchAll(/^### (MIC-FR-\d{3}) /gm)].map((row) => row[1])).toEqual([
      "MIC-FR-001",
    ]);
    expect([...requirement.matchAll(/^#### (MIC-R-\d{2}) /gm)].map((row) => row[1])).toEqual(
      Array.from({ length: 7 }, (_, index) => `MIC-R-${String(index + 1).padStart(2, "0")}`),
    );
    expect(plan).toContain("behavior_contract_id: MIC-FR-001");
    expect(plan).toContain("responsibility_owner: management-integration-cell-orchestration");
  });

  it("MIC-U-002: binds every development cell to the exact required field set", () => {
    const match = requirement.match(/required_cell_binding:\n((?: {2}- [a-z_]+\n)+)/);
    expect(match).not.toBeNull();
    const fields = [...(match?.[1] ?? "").matchAll(/ {2}- ([a-z_]+)/g)].map((row) => row[1]);
    expect(fields).toEqual([
      "lane_id",
      "issue_id",
      "behavior_contract_id",
      "responsibility_owner",
      "base_head",
      "candidate_head",
      "writer_lease",
      "target_reviewer",
      "effective_rule_packet_digest",
      "allowed_paths",
      "forbidden_paths",
      "lane_ready_receipt",
    ]);
  });

  it("MIC-U-003: keeps PM dispatch, TL merge, and paired writer/reviewer authorities separate", () => {
    expect(requirement).toContain("PMはrepo-owned工程表と`harness.db`のdependency frontier");
    expect(requirement).toContain("TLはmain、統合順序、merge queue");
    expect(requirement).toContain("ペア開発セルはmainへ直接mergeしてはならない");
    expect(requirement).toContain("別identity、別session、独立contextのreviewer");
    expect(requirement).toContain("reviewerはwriter lease、Ready化、merge authorityを取得しない");
  });

  it("MIC-U-004: keeps all execution axes orthogonal", () => {
    for (const text of [requirement, acceptance]) {
      expect(text).toContain("V-model");
      expect(text).toContain("Production Scrum");
      expect(text).toContain("Hybrid");
      expect(text).toContain("Discovery");
      expect(text).toContain("PoC");
      expect(text).toContain("Design HARNESS");
      expect(text).toContain("cell topology");
    }
    expect(requirement).toContain("組織・統合軸");
    expect(acceptance).toContain(
      "development style、case-driven model、specialist process、組織軸が独立field",
    );
  });

  it("MIC-U-005: projects schedule state to GitHub without creating a second authority", () => {
    expect(requirement).toContain(
      "repo-owned工程表と`harness.db`を計画・状態authorityとし、GitHub Issue／PR／Projectsは",
    );
    expect(requirement).toContain("read-side projection");
    expect(requirement).toContain("Projectの列移動、field編集、Issue close、green表示だけで");
    expect(acceptance).toContain("typed packetとread-back snapshotのidentity/stateが一致");
  });

  it("MIC-U-006: L10 acceptance is exact and covers every supporting requirement", () => {
    const acceptanceIds = [...acceptance.matchAll(/\| `(MIC-AC-\d{3})` \|/g)].map((row) => row[1]);
    expect(acceptanceIds).toEqual(
      Array.from({ length: 12 }, (_, index) => `MIC-AC-${String(index + 1).padStart(3, "0")}`),
    );
    for (let index = 1; index <= 7; index += 1) {
      expect(acceptance).toContain(`MIC-R-${String(index).padStart(2, "0")}`);
    }
  });

  it("MIC-U-007: does not revive closed-branch WCC orchestration IDs as current trace", () => {
    expect(requirement).toContain(
      "closed PR #90だけに存在した`WCC-FR-13`〜`WCC-FR-15`はcurrent mainの要件ではなく",
    );
    expect(requirement).toContain("本書のID、");
    expect(requirement).toContain("traceへ再利用しない");
    expect(acceptance).toContain("旧`WCC-FR-13`〜`WCC-FR-15`へのtraceは0件");
    expect(plan).toContain("closed PR #90の`WCC-FR-13`〜`WCC-FR-15`を正本traceへ再利用しない");
  });
});
