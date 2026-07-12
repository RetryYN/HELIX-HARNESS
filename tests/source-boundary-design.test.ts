import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

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
  status?: string;
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
      "buildVisualizationTree(view: VisualizationContract): GenericTree": [
        "U-SBOUND-001",
        "U-SBOUND-002",
        "U-SBOUND-005",
      ],
      "decorateVscodeTree(tree: GenericTree, commands: CommandCatalog): VscodeTree": [
        "U-SBOUND-002",
        "U-SBOUND-005",
      ],
      "projectVisualizationEvidence(view: VisualizationContract, summary: TreeSummary): ProjectionRows":
        ["U-SBOUND-001"],
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
    expect(l6).toContain("452が`src/lint/source-edge-extractor.ts`を単一owner");
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
      [successorPaths[2]]: [
        "U-SBOUND-003",
        "U-SBOUND-007",
        "U-SBOUND-008",
        "U-SBOUND-011",
        "U-SBOUND-012",
        "IT-SBOUND-005",
        "IT-SBOUND-006",
        "U-SBOUND-013",
      ],
    };
    for (const [path, ids] of Object.entries(expected)) {
      const plan = frontmatter(path);
      expect(plan.verification_bindings?.map((binding) => binding.oracle_id)).toEqual(ids);
    }
    const ratchet = frontmatter(successorPaths[2]);
    expect(ratchet.dependencies?.requires).not.toContain(
      "docs/plans/PLAN-L7-428-enforcement-wiring-gap.md",
    );
    expect(ratchet.dependencies?.references).toContain(
      "docs/plans/PLAN-L7-428-enforcement-wiring-gap.md",
    );
    expect(existsSync("docs/plans/PLAN-L7-428-enforcement-wiring-gap.md")).toBe(true);
    expect(read(successorPaths[2])).toContain("src/lint/source-edge-extractor.ts");
  });

  it("U-SBOUND-001: state-dbからpresentationを分離する", () =>
    expect(l8).toContain("state-db→vscode"));
  it("U-SBOUND-002: presentationからpersistence実装を分離する", () =>
    expect(l8).toContain("vscode→state-db"));
  it("U-SBOUND-003: 未指定policyをfail-closeする", () =>
    expect(l8).toContain("missing owner default"));
  it("U-SBOUND-004: analyzerからeffect authorityを除く", () =>
    expect(l8).toContain("write/child-process"));
  it("U-SBOUND-005: projectorをadapter-neutralにする", () =>
    expect(l8).toContain("VS Code command constant"));
  it("U-SBOUND-006: probe failureをtyped receiptにする", () =>
    expect(l8).toContain("timeout/nonzero/missing binary"));
  it("U-SBOUND-007: policy metadata欠落を検出する", () =>
    expect(l8).toContain("owner/rationale/review trigger"));
  it("U-SBOUND-008: source edgeを一意に正規化する", () => {
    expect(l8).toContain("literal require/import-equals");
    expect(l8).toContain("computed requireをunknownで拒否");
  });
  it("U-SBOUND-009: stale authorityのeffectを拒否する", () => {
    expect(l8).toContain("untrusted issuer/改ざん/scope拡大/revocation");
    expect(l6).toContain("self-issued/plain object");
  });
  it("U-SBOUND-010: partial materializeをacceptedにしない", () =>
    expect(l8).toContain("port throw/partial write/CAS drift"));

  it("U-SBOUND-013: 452 terminalを450/451 terminalかつtemporary 0へ拘束する", () => {
    const ratchet = frontmatter(successorPaths[2]);
    if (!new Set(["confirmed", "completed"]).has(ratchet.status ?? "")) return;
    for (const prerequisite of successorPaths.slice(0, 2)) {
      expect(new Set(["confirmed", "completed"])).toContain(frontmatter(prerequisite).status);
    }
    const codingRules = read("src/lint/coding-rules.ts");
    expect(codingRules).toContain("const TEMPORARY_SOURCE_DIRECTIONS = [] as const");
  });
});
