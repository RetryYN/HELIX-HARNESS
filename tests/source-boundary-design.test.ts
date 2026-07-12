import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const l5 = read("docs/design/harness/L5-detailed-design/source-boundary-architecture.md");
const l6 = read("docs/design/harness/L6-function-design/source-boundary-contracts.md");
const l8 = read("docs/test-design/harness/L8-source-boundary-contracts.md");
const l9 = read("docs/test-design/harness/L9-source-boundary-integration.md");

const successorPaths = [
  "docs/plans/PLAN-L7-450-state-db-vscode-decoupling.md",
  "docs/plans/PLAN-L7-451-lint-effect-port-separation.md",
  "docs/plans/PLAN-L7-452-source-boundary-policy-ratchet.md",
] as const;

type PlanFrontmatter = {
  parent_design?: string;
  pair_artifact?: string;
  verification_bindings?: Array<{ oracle_id?: string; test_path?: string }>;
  generates?: Array<{ artifact_path?: string }>;
  dependencies?: { requires?: string[]; references?: string[] };
};

const frontmatter = (path: string): PlanFrontmatter => {
  const match = read(path).match(/^---\n([\s\S]*?)\n---/);
  expect(match, `${path} frontmatter`).not.toBeNull();
  return parse(match?.[1] ?? "") as PlanFrontmatter;
};

describe("PLAN-L5/L6-79 source boundary design V-pair", () => {
  it("freezes forbidden directions and total fail-close policy", () => {
    expect(l5).toContain("persistence→presentation");
    expect(l5).toContain("type-only import");
    expect(l5).toContain("default `deny`");
    expect(l5).toContain("`unspecified`としてfail-close");
    for (const id of ["U-SBOUND-001", "U-SBOUND-002", "U-SBOUND-003"]) {
      expect(l8).toContain(id);
    }
  });

  it("binds every public contract to a negative oracle", () => {
    const contractOracles: Record<string, string[]> = {
      "projectVisualization(view: VisualizationViewModel): GenericTreeNode[]": [
        "U-SBOUND-001",
        "U-SBOUND-002",
        "U-SBOUND-005",
      ],
      "buildEvidenceProjection(rows: MetricRow[]): EvidenceProjection": ["U-SBOUND-001"],
      "analyzeSnapshot<T>(snapshot: T, rules: AnalyzerRules<T>): Finding[]": ["U-SBOUND-004"],
      "runProbe(intent: ProbeIntent, port: ProbePort): ProbeReceipt": [
        "U-SBOUND-006",
        "U-SBOUND-009",
      ],
      "materializeLintArtifact(intent: MaterializeIntent, port: WritePort): MaterializeReceipt": [
        "U-SBOUND-009",
        "U-SBOUND-010",
      ],
      "extractSourceEdges(docs: SourceDocument[]): SourceEdge[]": ["U-SBOUND-008"],
      "evaluateSourceBoundary(edge: SourceEdge, policy: BoundaryPolicy): BoundaryDecision": [
        "U-SBOUND-003",
        "U-SBOUND-007",
      ],
      "validateBoundaryPolicyCoverage(catalog: ModuleCatalog, edges: SourceEdge[], policy: BoundaryPolicy): PolicyFinding[]":
        ["U-SBOUND-003", "U-SBOUND-007"],
    };
    for (const [contract, oracleIds] of Object.entries(contractOracles)) {
      expect(l6).toContain(`\`${contract}\``);
      for (const id of oracleIds) expect(l8).toContain(id);
    }
    expect(l6).toContain("partial write");
    expect(l6).toContain("idempotency key");
  });

  it("assigns one exact extractor owner and treats PLAN-L7-428 as provenance", () => {
    expect(l5).toContain("`src/lint/source-edge-extractor.ts`");
    expect(l6).toContain("PLAN-L7-452が`src/lint/source-edge-extractor.ts`を単一owner");
    expect(l8).toContain("U-SBOUND-008");
  });

  it("freezes integration, mutation, drift, and durability oracles", () => {
    for (let index = 1; index <= 8; index += 1) {
      expect(l9).toContain(`IT-SBOUND-${String(index).padStart(3, "0")}`);
    }
    expect(l9).toContain("全live edgeにtotal decision");
    expect(l9).toContain("snapshot driftでeffect 0");
    expect(l9).toContain("partial targetをacceptedにしない");
  });

  it("structurally binds every exact successor to the L6/L8 V-pair", () => {
    for (const path of successorPaths) {
      expect(existsSync(path), path).toBe(true);
      const plan = frontmatter(path);
      expect(plan.parent_design).toBe(
        "docs/design/harness/L6-function-design/source-boundary-contracts.md",
      );
      expect(plan.pair_artifact).toBe("docs/test-design/harness/L8-source-boundary-contracts.md");
      expect(plan.verification_bindings?.length).toBeGreaterThan(0);
      expect(
        plan.verification_bindings?.every((binding) => binding.oracle_id && binding.test_path),
      ).toBe(true);
      expect(plan.generates?.some((item) => item.artifact_path === path)).toBe(true);
    }
  });

  it("binds successor-specific oracle sets and keeps PLAN-L7-428 out of dependencies", () => {
    const expected: Record<string, string[]> = {
      [successorPaths[0]]: ["U-SBOUND-001", "U-SBOUND-002", "U-SBOUND-005"],
      [successorPaths[1]]: ["U-SBOUND-004", "U-SBOUND-006", "U-SBOUND-009", "U-SBOUND-010"],
      [successorPaths[2]]: ["U-SBOUND-003", "U-SBOUND-007", "U-SBOUND-008"],
    };
    for (const [path, ids] of Object.entries(expected)) {
      const plan = frontmatter(path);
      expect(plan.verification_bindings?.map((binding) => binding.oracle_id)).toEqual(ids);
    }
    const ratchet = frontmatter(successorPaths[2]);
    expect(ratchet.dependencies?.requires).not.toContain(
      "docs/plans/PLAN-L7-428-function-reachability.md",
    );
    expect(ratchet.dependencies?.references).toContain(
      "docs/plans/PLAN-L7-428-function-reachability.md",
    );
    expect(read(successorPaths[2])).toContain("src/lint/source-edge-extractor.ts");
  });

  it("U-SBOUND-001", () => expect(l8).toContain("state-db→vscode"));
  it("U-SBOUND-002", () => expect(l8).toContain("vscode→state-db"));
  it("U-SBOUND-003", () => expect(l8).toContain("missing owner default"));
  it("U-SBOUND-004", () => expect(l8).toContain("write/child-process"));
  it("U-SBOUND-005", () => expect(l8).toContain("VS Code command constant"));
  it("U-SBOUND-006", () => expect(l8).toContain("timeout/nonzero/missing binary"));
  it("U-SBOUND-007", () => expect(l8).toContain("owner/rationale/review trigger"));
  it("U-SBOUND-008", () => expect(l8).toContain("direct/type-only/re-export/dynamic"));
  it("U-SBOUND-009", () => expect(l8).toContain("capability/authority/snapshot/idempotency"));
  it("U-SBOUND-010", () => expect(l8).toContain("port throw/partial write/CAS drift"));
});
