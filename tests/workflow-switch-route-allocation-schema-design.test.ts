import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const plan = readFileSync(
  "docs/plans/PLAN-L5-102-workflow-switch-route-allocation-schema.md",
  "utf8",
);
const design = readFileSync(
  "docs/design/helix/L5-detail/workflow-switch-route-allocation-schema.md",
  "utf8",
);
const l8 = readFileSync(
  "docs/test-design/helix/L8-workflow-switch-route-allocation-schema-unit-test-design.md",
  "utf8",
);
const catalog = readFileSync("docs/design/design-catalog.yaml", "utf8");

describe("workflow switch/route/allocation L5↔L8 schema", () => {
  it("U-UWJSCHEMA-DESIGN-001: strict rootとtyped identityを固定する", () => {
    expect(design).toContain("`helix-workflow-decision-envelope.v1`");
    expect(design).toContain("exact 9 field");
    for (const field of [
      "target_axis",
      "target_id",
      "registry_version",
      "registry_source_digest",
      "candidate_head",
      "policy_digest",
    ]) {
      expect(design).toContain(`\`${field}\``);
    }
    expect(design).toContain("旧`mode`／`model`／`catalog_route_id`／`route_class`から補完しない");
  });

  it("U-UWJSCHEMA-DESIGN-002: switch/route/allocation exact setと独立axisを固定する", () => {
    for (const section of ["## 3. switch契約", "## 4. route契約", "## 5. allocation契約"]) {
      expect(design).toContain(section);
    }
    expect(design).toContain("capabilityとcapacityを別配列として評価");
    expect(design).toContain(
      "capacityとconcurrency、cost limitとbudget、priorityとfairnessは独立axis",
    );
    expect(design).toContain("fallback cycle");
    expect(design).toContain("unbounded preemption");
  });

  it("U-UWJSCHEMA-DESIGN-003: measurement exact 9件とpublication unionを固定する", () => {
    expect(design.replace(/\s+/g, "")).toContain(
      "quality、latency、cost、queue、failure、fallback_rate、misdecision_rate、human_override、driftをexact9件",
    );
    expect(design).toContain("`full_v`");
    expect(design).toContain("`production_scrum`");
    expect(design).toContain("SR0〜SR4 exact 5件");
    expect(design).toContain("部分freeze");
  });

  it("U-UWJSCHEMA-DESIGN-004: proposal-onlyとside effect 0を保持する", () => {
    expect(design).toContain("`proposal_only:true`");
    expect(design).toContain("`commit_authority:false`");
    expect(design).toContain("`dispatch_authority:false`");
    expect(design).toContain("`approved`、`committed`、\n`dispatched`を持たない");
    expect(plan).toContain(
      "production parser、planner、evaluator、DB projection、CLI、assignment dispatch",
    );
  });

  it("U-UWJSCHEMA-DESIGN-005: L8 oracle exact 15件とmutation責務を固定する", () => {
    const ids = [...l8.matchAll(/`U-UWJSCHEMA-(\d{3})`/g)].map((match) => match[1]);
    expect(ids).toEqual(
      Array.from({ length: 15 }, (_, index) => String(index + 1).padStart(3, "0")),
    );
    expect(l8).toContain("全field deletion、unknown field insertion、型違反、境界値、配列重複");
    expect(l8).toContain("candidate、destination、allocationを生成しない");
  });

  it("U-UWJSCHEMA-DESIGN-006: L5↔L8 pairとcatalogを双方向に束縛する", () => {
    expect(design).toContain(
      "pair_artifact: docs/test-design/helix/L8-workflow-switch-route-allocation-schema-unit-test-design.md",
    );
    expect(l8).toContain(
      "pair_artifact: docs/design/helix/L5-detail/workflow-switch-route-allocation-schema.md",
    );
    expect(catalog).toContain(
      "docs/design/helix/L5-detail/workflow-switch-route-allocation-schema.md",
    );
  });
});
