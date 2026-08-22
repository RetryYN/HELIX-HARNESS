import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const plan = readFileSync(
  "docs/plans/PLAN-L4-75-workflow-switch-route-allocation-boundary.md",
  "utf8",
);
const design = readFileSync(
  "docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md",
  "utf8",
);
const l9 = readFileSync(
  "docs/test-design/helix/L9-workflow-switch-route-allocation-system-test-design.md",
  "utf8",
);
const requirements = readFileSync(
  "docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md",
  "utf8",
);
const acceptance = readFileSync(
  "docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md",
  "utf8",
);
const catalog = readFileSync("docs/design/design-catalog.yaml", "utf8");

describe("workflow switch/route/allocation L4↔L9 boundary", () => {
  it("U-UWJBOUND-001: UWJ-FR/AC-011..015をexact pairへ束縛する", () => {
    for (const id of ["011", "012", "013", "014", "015"]) {
      expect(requirements).toContain(`UWJ-FR-${id}`);
      expect(acceptance).toContain(`UWJ-AC-${id}`);
      expect(plan).toContain(`UWJ-FR/AC-${id}`);
      expect(design).toContain(`UWJ-FR/AC-${id}`);
      expect(l9).toContain(`IT-UWJ-${id}`);
    }
    expect(plan).toContain(
      "pair_artifact: docs/test-design/helix/L9-workflow-switch-route-allocation-system-test-design.md",
    );
    expect(l9).toContain(
      "pair_artifact: docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md",
    );
  });

  it("U-UWJBOUND-002: switch/route/allocationの必須axisを欠落なく配置する", () => {
    expect(design).toContain(
      "decision point、candidate set、enable/disable、selection rule、fallback、reassessment trigger",
    );
    expect(l9).toContain(
      "decision point、candidate set、enable/disable、selection rule、fallback、reassessment trigger",
    );
    expect(design).toContain(
      "source、destinations、capability/capacity constraint、rule、fallback、dead-letter",
    );
    expect(l9).toContain(
      "source、destinations、capability constraint、capacity constraint、rule、fallback、dead-letter",
    );
    expect(design).toContain(
      "priority、deadline、capability、capacity、concurrency、cost/budget、objective、fairness/preemption、reallocation、degradation、fallback",
    );
    expect(l9).toContain(
      "`priority`、`deadline`、`capability`、`capacity`、`concurrency`、`cost/budget`、`objective`",
    );
  });

  it("U-UWJBOUND-003: current typed identityとlegacy隔離を同じ境界へ固定する", () => {
    for (const marker of [
      "target_axis",
      "target_id",
      "registry_version",
      "registry_source_digest",
      "generated catalog",
      "mode",
      "model",
      "catalog_route_id",
      "route_class",
    ]) {
      expect(design).toContain(marker);
      expect(l9).toContain(marker);
    }
    expect(design).toContain("意味authority");
    expect(l9).toContain("compatibility推測せず拒否");
  });

  it("U-UWJBOUND-004: proposal-only、measurement、publicationをfail-closeする", () => {
    for (const marker of [
      "ProposalAuthorityPort",
      "WorkflowMeasurementBindingPort",
      "WorkflowPublicationBoundary",
      "side effect 0",
      "SR0〜SR4",
      "system workflow backfill",
    ]) {
      expect(design).toContain(marker);
      expect(l9).toContain(marker);
    }
    expect(l9).toContain("DB/Git/GitHub/worker write 0");
    expect(l9).toContain("missing、stale、non-representative");
  });

  it("U-UWJBOUND-006: L8 schema oracleとL9 composition oracleを重複させない", () => {
    expect(design).toContain("field型、schema cardinality、");
    expect(design).toContain("局所判断のexact field oracleは後続L5↔L8が所有");
    expect(l9).toContain("binding欠落だけを所有する");
    expect(l9).toContain("field型、");
    expect(l9).toContain("schema cardinality、局所判断のexact field oracleはL5↔L8が所有");
    for (const id of ["001", "002", "003", "004", "005", "006", "007"]) {
      expect(l9).toContain(`IT-UWJ-AUTH-${id}`);
    }
  });

  it("U-UWJBOUND-005: design catalogへL4 artifactを登録する", () => {
    expect(catalog).toContain(
      "docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md",
    );
  });
});
