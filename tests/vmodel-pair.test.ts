/**
 * vmodel pair-freeze lint test (IMP-067、PLAN-L7-11)。
 * design doc ⇔ test-design doc の pair_artifact 双方向整合・孤児0 (設計層 pair freeze、G1-G6)。
 * L7-unit-test-design §1.13 U-VPAIR-001〜006 を被覆 + 実 repo 完全性ガード。
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzePairFreeze,
  analyzeVerificationGroups,
  L0_L7_AUTOMATION_PLAN_IDS,
  loadPairDocs,
  loadVerificationPlanEvidence,
  type PairDoc,
  pairFreezeMessages,
  parsePairDoc,
  stripInlineComment,
  verificationGroupMessages,
} from "../src/vmodel/lint";

const doc = (
  path: string,
  layer: string | null,
  pa: string | null,
  status: string | null = null,
): PairDoc => ({
  path,
  layer,
  pairArtifact: pa,
  status,
});

function uniqueMatches(text: string, pattern: RegExp): string[] {
  return [...new Set([...text.matchAll(pattern)].map((match) => match[1] ?? match[0]))].sort();
}

function expandHacRefs(text: string): string[] {
  const ids = new Set<string>();
  for (const match of text.matchAll(/\b(HAC-[A-Z0-9]+-\d+)([a-z])\/([a-z])\b/g)) {
    ids.add(`${match[1]}${match[2]}`);
    ids.add(`${match[1]}${match[3]}`);
  }
  for (const match of text.matchAll(/\b(HAC-[A-Z0-9]+-\d+[a-z])\b/g)) {
    ids.add(match[1] ?? "");
  }
  return [...ids].filter(Boolean).sort();
}

function markdownTableRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| ") && !line.startsWith("|---"))
    .map((line) =>
      line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim()),
    );
}

describe("vmodel pair-freeze lint (U-VPAIR)", () => {
  it("U-VPAIR-001: parsePairDoc / stripInlineComment — frontmatter 抽出 + inline コメント除去", () => {
    expect(stripInlineComment("self  # wireframe mock 自体が③ペア")).toBe("self");
    expect(stripInlineComment("docs/test-design/harness/L9-system-test-design.md")).toBe(
      "docs/test-design/harness/L9-system-test-design.md",
    );
    const d = parsePairDoc(
      "docs/design/harness/L2-screen/wireframe.md",
      "---\nlayer: L2\npair_artifact: self  # mock\n---\n",
    );
    expect(d.layer).toBe("L2");
    expect(d.pairArtifact).toBe("self");
  });

  it("U-VPAIR-002: pair-missing / ref-unresolved を検出", () => {
    const docs = [
      doc("docs/design/harness/L4-basic-design/data.md", "L4", null), // pair 欠落
      doc(
        "docs/design/harness/L4-basic-design/function.md",
        "L4",
        "docs/test-design/harness/NOPE.md",
      ), // 不実在
    ];
    const r = analyzePairFreeze(docs);
    expect(r.ok).toBe(false);
    expect(r.orphans.map((o) => o.reason).sort()).toEqual(["pair-missing", "ref-unresolved"]);
  });

  it("U-VPAIR-003: trace-bidir — test-design の dir 集合参照が design dir を含めば成立、無ければ孤児", () => {
    const ok = analyzePairFreeze([
      doc(
        "docs/design/harness/L4-basic-design/data.md",
        "L4",
        "docs/test-design/harness/L9-system-test-design.md",
      ),
      doc(
        "docs/test-design/harness/L9-system-test-design.md",
        "L4",
        "docs/design/harness/L4-basic-design/",
      ),
    ]);
    expect(ok.ok).toBe(true);
    expect(ok.pairs).toBe(1);

    const orphan = analyzePairFreeze([
      doc(
        "docs/design/harness/L4-basic-design/data.md",
        "L4",
        "docs/test-design/harness/L9-system-test-design.md",
      ),
      doc(
        "docs/test-design/harness/L9-system-test-design.md",
        "L4",
        "docs/design/harness/L5-detailed-design/", // 別 dir を逆参照
      ),
    ]);
    expect(orphan.ok).toBe(false);
    expect(orphan.orphans[0]?.reason).toBe("trace-orphan");
  });

  it("U-VPAIR-003b: trace-bidir — test-design の単一 design doc 逆参照でも成立", () => {
    const ok = analyzePairFreeze([
      doc(
        "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
        "L3",
        "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      ),
      doc(
        "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
        "L3",
        "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      ),
    ]);
    expect(ok.ok).toBe(true);
    expect(ok.pairs).toBe(1);
  });

  it("U-VPAIR-004: self-pair / L2 group — wireframe=self は孤児にしない、group hub 経由で成立", () => {
    const r = analyzePairFreeze([
      doc("docs/design/harness/L2-screen/wireframe.md", "L2", "self"),
      doc(
        "docs/design/harness/L2-screen/screen-list.md",
        "L2",
        "docs/design/harness/L2-screen/wireframe.md",
      ),
    ]);
    expect(r.ok).toBe(true);
    expect(r.pairs).toBe(2); // wireframe(self) + screen-list(group)
  });

  it("U-VPAIR-004b: README / roadmap は対象外 (pair 欠落でも孤児にしない)", () => {
    const r = analyzePairFreeze([
      doc("docs/design/harness/L3-functional/README.md", "L3", null),
      doc("docs/design/harness/L3-functional/roadmap.md", "L3", null),
    ]);
    expect(r.ok).toBe(true);
    expect(r.orphans).toEqual([]);
  });

  it("U-VPAIR-005: 実 repo 完全性回帰ガード — 全 V-pair 双方向、孤児0", () => {
    const r = analyzePairFreeze(loadPairDocs());
    if (!r.ok) {
      throw new Error(`pair-freeze 孤児あり:\n${JSON.stringify(r.orphans, null, 2)}`);
    }
    expect(r.ok).toBe(true);
    expect(r.pairs).toBeGreaterThan(0);
  });

  it("U-VPAIR-005b: HELIX L1 pillar 全件が L3 design と L12 acceptance に降下済み", () => {
    const l1 = readFileSync("docs/design/helix/L1-requirements/pillar-requirements.md", "utf8");
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l12 = readFileSync("docs/test-design/helix/L3-pillar-acceptance-test-design.md", "utf8");

    const l1Ids = [
      ...uniqueMatches(l1, /\b(HBR-P\d+)\b/g),
      ...uniqueMatches(l1, /\b(HNFR-(?:P\d+|AC))\b/g),
    ].sort();
    const l3Ids = [
      ...uniqueMatches(l3, /\b(HBR-P\d+)\b/g),
      ...uniqueMatches(l3, /\b(HNFR-(?:P\d+|AC))\b/g),
    ].sort();
    const l12Ids = [
      ...uniqueMatches(l12, /\b(HBR-P\d+)\b/g),
      ...uniqueMatches(l12, /\b(HNFR-(?:P\d+|AC))\b/g),
    ].sort();

    expect(l1Ids).toEqual([
      "HBR-P0",
      "HBR-P1",
      "HBR-P2",
      "HBR-P3",
      "HBR-P4",
      "HBR-P6",
      "HBR-P7",
      "HBR-P8",
      "HBR-P9",
      "HNFR-AC",
      "HNFR-P3",
      "HNFR-P5",
      "HNFR-P8",
    ]);
    expect(l3Ids).toEqual(l1Ids);
    expect(l12Ids).toEqual(l1Ids);

    expect(l3, "confirmed HELIX L3 requirements must not retain draft wording").not.toContain(
      "起草済",
    );
    expect(l1).toContain("§2.8 Asset / progress visualization 要求");
    expect(l3).toContain("§0.1 L1 amendment frontier");
    expect(l3).toContain("§0.2 意味ベース機能一覧と要求修正境界");
    expect(l3).toContain("PLAN-DISCOVERY-10-helix-asset-visualization");
    expect(l3).toContain("L1 §2.8 を含む revised");
    expect(l3).toContain("要求修正後の revised request 全体");
    expect(l3).toContain("pair-agent TDD route");
    expect(l3).toContain("`.ut-tdd -> .helix` rename");
    expect(l3).toContain("S3 verified / S4 PO decision pending");
    expect(l3).toContain("G-SF `semantic_feature_frontier_record`");
    expect(l3).toContain(
      "asset/progress visualization: `classification=frontier_pending_decision`",
    );
    expect(l12).toContain("§0.1 amendment frontier oracle");
    expect(l12).toContain("visualization 要求も L3/L4/L6/L7 fully descended");
    expect(l12).toContain("G-SF oracle");
    const l3ClosureRows = markdownTableRows(l3).filter((row) => row[2] === "確定済");
    const l12TraceRows = markdownTableRows(l12).filter((row) => row[1]?.includes("HR-"));
    for (const id of l1Ids) {
      const l3Row = l3ClosureRows.find((row) => row[0] === id);
      expect(l3Row, `${id} must have a concrete L3 closure row`).toBeDefined();
      expect(l3Row?.[1], `${id} must descend to HR-*`).toMatch(/\bHR-(?:FR|NFR|BR)-/);

      const l12Row = l12TraceRows.find((row) => row[0]?.split(/\s*\/\s*/).includes(id));
      expect(l12Row, `${id} must have a concrete L12 trace row`).toBeDefined();
      expect(l12Row?.[1], `${id} must trace to HR-*`).toMatch(/\bHR-(?:FR|NFR)-/);
      expect(l12Row?.[2], `${id} must trace to HAT-*`).toMatch(/\bHAT-/);
    }
  });

  it("U-VPAIR-005e: HELIX L0-L4 current-state docs do not retain pre-confirmation descent wording", () => {
    const l1 = readFileSync("docs/design/helix/L1-requirements/pillar-requirements.md", "utf8");
    const l14 = readFileSync("docs/test-design/helix/L1-pillar-operational-test-design.md", "utf8");
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const planL306 = readFileSync("docs/plans/PLAN-L3-06-helix-pillar-descent.md", "utf8");
    const planL451 = readFileSync("docs/plans/PLAN-L4-51-helix-pillar-basic-design.md", "utf8");

    expect(l3).toContain("Forward L3 confirmed 正本");
    expect(l3).not.toContain("Forward L3 正本候補");
    expect(l1).toContain("PLAN-L3-06 / PLAN-L4-51 で要求・block 化済み");
    expect(l1).not.toContain(
      "残 GAP（typed contract / effort-budget / Glossary SSoT）は L3 で起票",
    );
    expect(l14).toContain("本書上の `not-implemented` は runtime 実装未完了の状態");
    expect(l14).toContain("right-arm verification source");
    expect(l14).toContain("90 日超過なら");
    expect(l14).toContain("source_status_delta");
    expect(l14).toContain("adoption_decision_delta");
    expect(l14).toContain("workflow_route_impact");
    expect(l14).toContain("`completionDecisionPacket`");
    expect(l14).toContain("outstanding.completionReadiness.ok=true");
    expect(l14).toContain("L14 completion overlay");
    expect(l14).not.toContain("他柱は L1 宣言のみ");
    expect(l14).not.toContain("not-implemented 柱（P6/P8 等）は L3 で優先設計");
    expect(planL306).toContain(
      "| `docs/design/helix/L3-requirements/pillar-functional-requirements.md` | confirmed |",
    );
    expect(planL451).toContain("U-VPAIR-007a/b/c/d/e/f");
  });

  it("U-VPAIR-005c: HELIX L3 FR/NFR と HAC は HAT acceptance に孤児なく接続", () => {
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l12 = readFileSync("docs/test-design/helix/L3-pillar-acceptance-test-design.md", "utf8");
    const l3RequirementIds = uniqueMatches(l3, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);
    const hatRequirementIds = uniqueMatches(
      l12,
      /^\| HAT-(?!ID\b|O)[^|]+ \| (HR-(?:FR|NFR)-[^ |]+) \|/gm,
    );
    const l3AcIds = uniqueMatches(l3, /^\| (HAC-[^ |]+) \|/gm);
    const hatAcIds = expandHacRefs(l12);

    expect(l3RequirementIds).toHaveLength(43);
    expect(hatRequirementIds).toEqual(l3RequirementIds);
    expect(l3AcIds).toHaveLength(86);
    expect(hatAcIds).toEqual(l3AcIds);
  });

  it("U-VPAIR-005j: HELIX L3 route-B back-fill 要件も L12 acceptance に孤児なく接続", () => {
    const backfillDocs = [
      readFileSync("docs/design/helix/L3-requirements/orchestration-memory.md", "utf8"),
      readFileSync("docs/design/helix/L3-requirements/orchestration-memory-runtime.md", "utf8"),
      readFileSync("docs/design/helix/L3-requirements/orchestration-runtime-bridge.md", "utf8"),
    ].join("\n");
    const l12 = readFileSync("docs/test-design/helix/L3-pillar-acceptance-test-design.md", "utf8");
    const downstreamPillarDocs = [
      readFileSync("docs/design/helix/L4-basic-design/pillar-basic-design.md", "utf8"),
      readFileSync("docs/design/helix/L5-detail/pillar-detail-design.md", "utf8"),
      readFileSync("docs/test-design/helix/L4-pillar-system-test-design.md", "utf8"),
      readFileSync("docs/test-design/helix/L5-pillar-integration-test-design.md", "utf8"),
    ].join("\n");
    const l4Design = readFileSync(
      "docs/design/helix/L4-basic-design/pillar-basic-design.md",
      "utf8",
    );
    const l5Design = readFileSync("docs/design/helix/L5-detail/pillar-detail-design.md", "utf8");
    const l4TestDesign = readFileSync(
      "docs/test-design/helix/L4-pillar-system-test-design.md",
      "utf8",
    );
    const l5TestDesign = readFileSync(
      "docs/test-design/helix/L5-pillar-integration-test-design.md",
      "utf8",
    );
    const l6FunctionDesign = readFileSync(
      "docs/design/helix/L6-function-design/orchestration-memory.md",
      "utf8",
    );
    const l6UnitTestDesign = readFileSync("docs/test-design/helix/orchestration-memory.md", "utf8");
    const l4Plan = readFileSync("docs/plans/PLAN-L4-51-helix-pillar-basic-design.md", "utf8");
    const l5Plan = readFileSync("docs/plans/PLAN-L5-09-helix-pillar-detail-design.md", "utf8");
    const backfillRequirementIds = uniqueMatches(backfillDocs, /^## (HR-(?:BR|NFR)-[A-Z0-9]+) /gm);
    const hatBackfillRequirementIds = uniqueMatches(
      l12,
      /^\| HAT-O[^|]+ \| (HR-(?:BR|NFR)-[A-Z0-9]+) \|/gm,
    );

    expect(backfillRequirementIds).toEqual([
      "HR-BR-07",
      "HR-BR-07R",
      "HR-BR-12",
      "HR-BR-12R",
      "HR-BR-13R",
      "HR-BR-14R",
      "HR-NFR-03",
      "HR-NFR-03R",
    ]);
    expect(hatBackfillRequirementIds).toEqual(backfillRequirementIds);
    for (const required of [
      "Route-B back-fill L3 要件",
      "## §1.1 Route-B back-fill acceptance",
      "## §2.1 Route-B back-fill trace",
      "U-ORCH-001 / U-ORCH-002 / U-ORCH-005",
      "U-MEM-001 / U-MEM-002 / U-MEM-003",
      "U-ORCH-BRIDGE-01",
      "U-ORCH-BRIDGE-02",
    ]) {
      expect(l12).toContain(required);
    }
    expect(downstreamPillarDocs.match(/Route-B back-fill L3 要件 8 件/g)).toHaveLength(4);
    expect(downstreamPillarDocs.match(/二重計上しない/g)).toHaveLength(4);
    for (const required of [
      "HR-NFR-03R | job-queue 競合排他 | HB-P1",
      "HR-NFR-03 | hybrid 自己評価禁止 + memory secret reject | HB-P3 / HB-P7",
      "HR-BR-13R | tick の実 runtime bridge | HB-P2 / HB-AC",
      "HR-BR-14R | loop run entrypoint | HB-P1 / HB-P2",
    ]) {
      expect(l4Design).toContain(required);
    }
    for (const required of [
      "HR-NFR-03R | HB-P1 | HC-P1",
      "HR-NFR-03 | HB-P3 / HB-P7 | HC-P3 / HC-P7",
      "HR-BR-13R | HB-P2 / HB-AC | HC-P2 / HC-AC",
      "HR-BR-14R | HB-P1 / HB-P2 | HC-P1 / HC-P2",
    ]) {
      expect(l5Design).toContain(required);
    }
    for (const required of [
      "## §1.1 Route-B boundary observation",
      "HR-NFR-03R | HB-P1 | job queue claim",
      "HR-NFR-03 | HB-P3 / HB-P7 | worker 自己 pass 禁止",
      "HR-BR-14R | HB-P1 / HB-P2 | loop run entrypoint",
    ]) {
      expect(l4TestDesign).toContain(required);
    }
    for (const required of [
      "## §1.1 Route-B contract observation",
      "HR-NFR-03R | HC-P1 | scheduler/job contract",
      "HR-NFR-03 | HC-P3 / HC-P7 | verification profile",
      "HR-BR-14R | HC-P1 / HC-P2 | loop CLI",
    ]) {
      expect(l5TestDesign).toContain(required);
    }
    for (const id of backfillRequirementIds) {
      expect(l6FunctionDesign, `${id} must descend into L6 function design`).toContain(id);
    }
    for (const required of [
      "契約 11 本",
      "11 契約",
      "nodeTickDeps",
      "ut-tdd loop run",
      "U-ORCH-BRIDGE-01",
      "U-ORCH-BRIDGE-02",
      "Route-B back-fill L3 要件 8 件",
      "HR-BR-13R` は `nodeTickDeps`",
      "HR-BR-14R` は",
    ]) {
      expect(l6FunctionDesign).toContain(required);
    }
    for (const required of [
      "`nodeTickDeps` | U-ORCH-BRIDGE-01",
      "`ut-tdd loop run` | U-ORCH-BRIDGE-02",
      "### U-ORCH-BRIDGE-01",
      "### U-ORCH-BRIDGE-02",
      "HR-BR-13R",
      "HR-BR-14R",
      "tests/orchestration/loop-bridge.test.ts",
    ]) {
      expect(l6UnitTestDesign).toContain(required);
    }
    expect(l6FunctionDesign).not.toContain("契約関数 9 本");
    expect(l6FunctionDesign).not.toContain("9 契約 ↔");
    expect(l4Plan).toContain("### Step 6: [直列] Route-B back-fill 境界監査");
    expect(l4Plan).toContain("HB-P1 / HB-P2 / HB-P3 / HB-P7 / HB-AC");
    expect(l5Plan).toContain("### Step 7: [直列] Route-B back-fill contract 境界監査");
    expect(l5Plan).toContain("HC-P1 / HC-P2 / HC-P3 / HC-P7 / HC-AC");
  });

  it("U-VPAIR-005o: upstream A-146 substance-gap findings are lowered through HELIX L3-L6", () => {
    const l3 = readFileSync("docs/design/helix/L3-requirements/upstream-substance-gap.md", "utf8");
    const l4 = readFileSync("docs/design/helix/L4-basic-design/upstream-substance-gap.md", "utf8");
    const l5 = readFileSync("docs/design/helix/L5-detail/upstream-substance-gap.md", "utf8");
    const harnessPhysicalData = readFileSync(
      "docs/design/harness/L5-detailed-design/physical-data.md",
      "utf8",
    );
    const harnessFunctionSpec = readFileSync(
      "docs/design/harness/L6-function-design/function-spec.md",
      "utf8",
    );
    const harnessSetupSoloTeam = readFileSync(
      "docs/design/harness/L6-function-design/setup-solo-team.md",
      "utf8",
    );
    const harnessUnitTestDesign = readFileSync(
      "docs/test-design/harness/L7-unit-test-design.md",
      "utf8",
    );
    const l6 = readFileSync(
      "docs/design/helix/L6-function-design/upstream-substance-gap.md",
      "utf8",
    );
    const testDesign = readFileSync("docs/test-design/helix/upstream-substance-gap.md", "utf8");
    const combined = [l3, l4, l5, l6, testDesign].join("\n");
    const upstreamIds = uniqueMatches(l3, /\b(A146-\d)\b/g);
    const l3Ids = uniqueMatches(l3, /\b(HU-FR-\d{2})\b/g);
    const l4Ids = uniqueMatches(l4, /\b(HUT-SYS-\d{2})\b/g);
    const l5Ids = uniqueMatches(l5, /\b(HU-C\d{2})\b/g);
    const l6Oracles = uniqueMatches(testDesign, /\b(U-UPSTREAM-\d{3})\b/g);

    expect(upstreamIds).toEqual([
      "A146-1",
      "A146-2",
      "A146-3",
      "A146-4",
      "A146-5",
      "A146-6",
      "A146-7",
      "A146-8",
    ]);
    expect(l3Ids).toEqual([
      "HU-FR-01",
      "HU-FR-02",
      "HU-FR-03",
      "HU-FR-04",
      "HU-FR-05",
      "HU-FR-06",
      "HU-FR-07",
      "HU-FR-08",
    ]);
    expect(l4Ids).toEqual([
      "HUT-SYS-01",
      "HUT-SYS-02",
      "HUT-SYS-03",
      "HUT-SYS-04",
      "HUT-SYS-05",
      "HUT-SYS-06",
      "HUT-SYS-07",
      "HUT-SYS-08",
    ]);
    expect(l5Ids).toEqual([
      "HU-C01",
      "HU-C02",
      "HU-C03",
      "HU-C04",
      "HU-C05",
      "HU-C06",
      "HU-C07",
      "HU-C08",
    ]);
    expect(l6Oracles).toEqual([
      "U-UPSTREAM-001",
      "U-UPSTREAM-002",
      "U-UPSTREAM-003",
      "U-UPSTREAM-004",
      "U-UPSTREAM-005",
      "U-UPSTREAM-006",
      "U-UPSTREAM-007",
      "U-UPSTREAM-008",
      "U-UPSTREAM-009",
    ]);
    for (const required of [
      "source_upstream_commit: 7f83ca8",
      "source_upstream_commit_full: 7f83ca811353ed90b3e981178a1b0c9977dd5863",
      "A-146-substance-gap-consolidated-remediation.md",
      "green command digest",
      "runtime provenance",
      "distribution curation",
      "FE design coverage",
      "signal -> mode",
      "kind x drive",
      "runtime matcher compatibility",
      "blanket `docs/governance/` allow",
      "presence-only",
      "hash-only restamp",
      "target-runtime tool event evidence",
    ]) {
      expect(combined).toContain(required);
    }
    for (const required of [
      "Telemetry provenance invariant",
      "projection-only telemetry",
      "runtime_rows=0",
      "projection_rows>0",
      "source=runtime-hook:skill-suggest",
      "projectReviewEvidenceRegistry",
      "projectHookEvents",
      "recognized verification command",
    ]) {
      expect(harnessPhysicalData).toContain(required);
    }
    for (const required of [
      "projectRuntimeTestRunFromSessionEvent",
      "projectRuntimeGuardrailDecisionFromSessionEvent",
      "projectRuntimeSkillInvocationFromSessionEvent",
      "projectRuntimeModelTelemetryForDoctor",
      "runtime=hook-session-log",
      "guardrail=forced-stop",
      "source=runtime-hook:skill-suggest",
    ]) {
      expect(harnessFunctionSpec).toContain(required);
    }
    for (const required of [
      "U-DBPROJ-PROV-01",
      "U-DBPROJ-PROV-02",
      "U-DBPROJ-PROV-03",
      "U-DBPROJ-PROV-04",
      "U-DBPROJ-PROV-05",
      "projection provenance",
      "non-verification Bash events",
      "ordinary `tool_use` events",
      "generic `Bash (bash)` events",
    ]) {
      expect(harnessUnitTestDesign).toContain(required);
    }
    for (const required of [
      "Claude/Codex hook",
      "subagent",
      "command templates",
      "bare `ut-tdd`",
      "not spawnable on PATH",
      "root の開発用 `.claude` / `.codex` 状態",
    ]) {
      expect(`${harnessSetupSoloTeam}\n${harnessUnitTestDesign}`).toContain(required);
    }
    for (const required of [
      ".codex/config.toml",
      ".codex/hooks.json",
      "Claude subagent templates",
      "Claude slash-command templates",
    ]) {
      expect(harnessUnitTestDesign).toContain(required);
    }
    expect(testDesign).toContain("| A146-8 | HU-FR-08 | HUT-SYS-08 | HU-C08 | U-UPSTREAM-009 |");
    expect(l6).toContain(
      "Findings already generally covered by pillar docs remain separately traceable",
    );
    for (const required of [
      "verification strategy",
      "RuntimeVerificationClass",
      "L7.5 RUN & Debug",
      "projection_only_unverified",
      "missing_runtime_provenance",
      "RuntimeVerificationLogEvent",
      "correlation_id",
      "redaction_policy",
      "U-VERIFYSTRAT-001",
      "U-VERIFYSTRAT-002",
      "U-VERIFYSTRAT-003",
      "U-VERIFYSTRAT-004",
      "U-VERIFYSTRAT-005",
      "U-VERIFYSTRAT-006",
    ]) {
      expect(`${l6}\n${testDesign}`).toContain(required);
    }
  });

  it("U-VPAIR-005c.1: HELIX 検証戦略は L3/L4/L5/L6 の右腕 test-design に降下済み", () => {
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l4Test = readFileSync("docs/test-design/helix/L4-pillar-system-test-design.md", "utf8");
    const l5Test = readFileSync(
      "docs/test-design/helix/L5-pillar-integration-test-design.md",
      "utf8",
    );
    const l6 = readFileSync(
      "docs/design/helix/L6-function-design/upstream-substance-gap.md",
      "utf8",
    );
    const l6Test = readFileSync("docs/test-design/helix/upstream-substance-gap.md", "utf8");
    const combined = `${l3}\n${l4Test}\n${l5Test}\n${l6}\n${l6Test}`;

    for (const required of [
      "検証戦略 overlay",
      "system verification strategy",
      "integration verification strategy",
      "runtime verification log design",
      "L7.5 RUN & Debug",
      "projection-only telemetry",
      "runtime provenance",
      "RuntimeVerificationLogEvent",
      "U-VERIFYSTRAT-005",
      "U-VERIFYSTRAT-006",
    ]) {
      expect(combined).toContain(required);
    }
  });

  it("U-VPAIR-005d: HELIX L1 external delta の具体化語彙が L3/L12 に降下済み", () => {
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l12 = readFileSync("docs/test-design/helix/L3-pillar-acceptance-test-design.md", "utf8");
    const combined = `${l3}\n${l12}`;

    for (const required of [
      "MicroVM",
      "gVisor",
      "semantic-release",
      "Release Please",
      "0.75",
      "層境界数値",
      "raw-evidence pointer",
      "action-binding approval",
      "short-lived/fine-grained token",
      "prompt injection",
      "security filter",
      "apply_patch",
      "write_file",
      "exec_command",
      "local_shell",
      ".ut-tdd",
      ".helix",
      "doctor baseline",
      "import report",
      "skip_sub_doc",
      "simple-composable workflow",
      "trace span",
      "PLAN 駆動",
      "API/SDK 採用前提ではなく",
      "harness DB trace",
      "provider API direct call",
      "SDK 常駐実行",
      "repo-local CLI adapter",
      "dry-run plan",
      "bounded context",
      "ubiquitous language",
      "anti-corruption boundary",
      "Red evidence",
      "acceptance oracle",
      "least privilege",
      "risk owner",
      "https://www.anthropic.com/engineering/building-effective-agents",
      "https://developers.openai.com/api/docs/guides/agents/integrations-observability",
      "https://www.cisa.gov/resources-tools/resources/careful-adoption-agentic-ai-services",
      "https://www.nist.gov/itl/ai-risk-management-framework",
      "https://martinfowler.com/bliki/BoundedContext.html",
      "https://martinfowler.com/bliki/UbiquitousLanguage.html",
      "https://martinfowler.com/bliki/TestDrivenDevelopment.html",
      "https://arxiv.org/abs/2603.17973",
      "https://playwright.dev/docs/best-practices",
      "https://playwright.dev/docs/test-parallel",
      "https://opentelemetry.io/docs/what-is-opentelemetry/",
      "test isolation",
      "parallel worker/resource budget",
      "fast<=120s",
      "default<=600s",
      "full<=1800s",
      "p95 duration budget",
      "timeout",
      "検証戦略 overlay",
      "L7.5 RUN & Debug",
      "projection-only telemetry",
      "実 `session_id`",
      "trace/metric/log observability",
      "screen-list / screen-flow / screen-detail / ui-element / business-flow / wireframe",
      "back-propagation workflow",
      "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets",
      "https://github.com/googleapis/release-please",
      "https://semantic-release.gitbook.io/semantic-release",
      "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
      "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/",
      "https://github.com/firecracker-microvm/firecracker",
      "https://gvisor.dev/docs/",
    ]) {
      expect(combined).toContain(required);
    }
  });

  it("U-VPAIR-005e: PLAN-L3-06 readiness audit が PO 承認証跡と confirmed 状態を保持", () => {
    const plan = readFileSync("docs/plans/PLAN-L3-06-helix-pillar-descent.md", "utf8");

    for (const required of [
      "§G-REQ.L3 readiness audit",
      "L1 HBR/HNFR 全件が L3 へ降下済み",
      "L3 FR/NFR/HAC が L12 HAT に孤児なく接続",
      "テスト速度・負荷が要件化済み",
      "L2 design template / mock workflow が要件化済み",
      "実装精度・L階層 regression fence が要件化済み",
      "計測・改善基盤が要件化済み",
      "外部データ / prompt injection / tool injection / exfiltration 対策が要件化済み",
      "security filter と trust-boundary が要件化済み",
      "L1 §2.5 外部研究 delta は一次出典確認を要求",
      "2026-06-28 URL audit",
      "primary source 9/9",
      "Codex runtime parity / hosted API preflight が要件化済み",
      "Distribution / full setup / version-up が要件化済み",
      "2026-06 best-practice 照会結果が要件化済み",
      "2026-06-28 best-practice URL audit",
      "source 11/11",
      "automated fetch は 10/11 が HTTP 200",
      "bot-blocked 403",
      "HR-FR-P2-04",
      "HR-FR-P7-03",
      "HR-NFR-P3-04",
      "HR-NFR-P8-03",
      "HR-NFR-P5-03",
      "HR-FR-P4-03",
      "HR-FR-P9-03",
      "HR-NFR-AC-03",
      "API 非前提 / PLAN 駆動が横断要件化済み",
      "G-REQ.L3 を false green にしない",
      "approved",
      "G-REQ.L3 reached",
      "full doctor green は別 PLAN の frontier",
    ]) {
      expect(plan).toContain(required);
    }
  });

  it("U-VPAIR-005f: HELIX best-practice overlay は API/SDK 採用前提へ退行しない", () => {
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l12 = readFileSync("docs/test-design/helix/L3-pillar-acceptance-test-design.md", "utf8");
    const plan = readFileSync("docs/plans/PLAN-L3-06-helix-pillar-descent.md", "utf8");
    const combined = `${l3}\n${l12}\n${plan}`;

    for (const required of [
      "API/SDK 採用前提ではなく",
      "外部 API/SDK 呼び出し前提でもなく",
      "PLAN artifact",
      "repo-local CLI adapter",
      "harness DB trace",
      "dry-run plan",
      "https://developers.openai.com/api/docs/guides/agents/integrations-observability",
    ]) {
      expect(combined).toContain(required);
    }

    for (const forbidden of [
      "openai.github.io/openai-agents-python",
      "OpenAI Agents SDK を採用",
      "OpenAI Agents SDK を実行",
      "provider API direct call を前提にする",
      "provider API direct call を必須とする",
      "SDK 常駐実行を前提にする",
      "SDK 常駐実行を必須とする",
    ]) {
      expect(combined).not.toContain(forbidden);
    }
  });

  it("U-VPAIR-005g: PLAN-L3-06 は repo 全体の L3 精読 audit を保持", () => {
    const plan = readFileSync("docs/plans/PLAN-L3-06-helix-pillar-descent.md", "utf8");

    for (const required of [
      "#### L3 精読 audit",
      "docs/design/harness/L3-functional/functional-requirements.md",
      "docs/design/harness/L3-functional/business-detail.md",
      "docs/design/harness/L3-functional/nfr-grade.md",
      "docs/design/harness/L3-functional/README.md",
      "docs/design/harness/L3-functional/roadmap.md",
      "docs/design/helix/L3-requirements/orchestration-memory.md",
      "docs/design/helix/L3-requirements/orchestration-memory-runtime.md",
      "docs/design/helix/L3-requirements/orchestration-runtime-bridge.md",
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "harness confirmed L3 sub-doc は上書きせず",
      "HELIX 名前空間の additive descent",
      "下位詳細として参照",
    ]) {
      expect(plan).toContain(required);
    }
  });

  it("U-VPAIR-005h: PLAN-L3-06 は目的文ベースの completion audit を保持", () => {
    const plan = readFileSync("docs/plans/PLAN-L3-06-helix-pillar-descent.md", "utf8");

    for (const required of [
      "### Objective completion audit",
      "L3 設計をすべて精読し、L1 要求との差異を埋める",
      "Forward workflow に従い要求を 100% 満たせる状態にする",
      "テスト速度アップ・負荷を要件化する",
      "実装精度を要件化する",
      "L階層単位のデグレ防止を要件化する",
      "計測・改善基盤を要件化する",
      "外部データ / prompt injection / tool injection / exfiltration 対策を要件化する",
      "security filter を用意する",
      "L2 を飛ばす場合の L2 design template / workflow を要件化する",
      "loop engineering / AI-driven development を 2026-06 最新情報で照会し、API 前提ではなく PLAN 駆動にする",
      "DDD best practice を照会し要件化する",
      "TDD best practice を照会し要件化する",
      "harness engineering best practice を照会し要件化する",
      "provider API direct call / SDK 常駐実行を前提にしない",
      "HR-NFR-P5-03",
      "HR-NFR-P3-02",
      "HR-NFR-P3-03",
      "HR-FR-P4-03",
      "HR-FR-P8-04",
      "HR-FR-P1-04",
      "HR-FR-P2-04",
      "HR-FR-P7-03",
      "HR-NFR-P3-04",
      "HR-NFR-AC-03",
      "approved",
    ]) {
      expect(plan).toContain(required);
    }
  });

  it("U-VPAIR-005i: PLAN-L3-06 は PO approval packet と承認後検証手順を保持", () => {
    const plan = readFileSync("docs/plans/PLAN-L3-06-helix-pillar-descent.md", "utf8");

    for (const required of [
      "### PO approval packet",
      "Codex/TL は自己承認しない",
      "scope",
      "completeness",
      "safety",
      "operating model",
      "evidence freshness",
      "false-green prevention",
      "承認により昇格したファイル",
      "docs/plans/PLAN-L3-06-helix-pillar-descent.md",
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      "承認後に再実行するコマンド",
      "bun run vitest run tests/vmodel-pair.test.ts",
      "bun run src/cli.ts plan lint docs/plans/PLAN-L3-06-helix-pillar-descent.md",
      "bun run typecheck",
      "bun run lint",
      "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
      "G-REQ.L3` が reached",
      "G-REQ.L3` が reached",
      "external API / infra / GitHub 設定変更はこの承認には含めない",
      "action-binding approval",
    ]) {
      expect(plan).toContain(required);
    }
  });

  it("U-VPAIR-005k: harness L3 roadmap は startup Core Read ではなく freeze 境界の動的参照", () => {
    const readme = readFileSync("docs/design/harness/L3-functional/README.md", "utf8");
    const roadmap = readFileSync("docs/design/harness/L3-functional/roadmap.md", "utf8");
    const agents = readFileSync("AGENTS.md", "utf8");
    const claude = readFileSync("CLAUDE.md", "utf8");
    const combined = `${readme}\n${roadmap}`;

    expect(agents).toContain("Do not load `docs/design/harness/L3-functional/roadmap.md`");
    expect(claude).toContain("Do not load `docs/design/harness/L3-functional/roadmap.md`");
    expect(combined).toContain("Core Reads には含めず");
    expect(combined).toContain("V-model freeze 境界");
    expect(combined).toContain("検証サイクルを実行するときだけ動的に参照");
    expect(combined).not.toContain("AGENTS.md Core Reads が常時参照");
    expect(combined).not.toContain("常時参照配線");
  });

  it("U-VPAIR-005l: harness L3 workflow taxonomy は L4 operational 正本と一致", () => {
    const l3 = readFileSync("docs/design/harness/L3-functional/functional-requirements.md", "utf8");
    const l4 = readFileSync("docs/design/harness/L4-basic-design/function.md", "utf8");

    for (const required of [
      "Forward spine + 10 駆動モデル + 2 工程専門",
      "Forward は entry mode ではなく全駆動モデルの合流先",
      "Discovery / Scrum / Reverse / Recovery / Incident / Refactor / Retrofit / Add-feature / version-up / Research",
      "screen-design / frontend-design は独立 mode ではなく工程専門",
      "L3 FR 26 件すべてで人間判断点",
      "Forward spine + 10 entry modes + 工程専門 2",
    ]) {
      expect(l3).toContain(required);
    }

    expect(l4).toContain(
      "Forward spine (主線、合流先) + 駆動モデル (entry mode、10 種) + 工程専門",
    );
    expect(l4).toContain("Forward は駆動モデルの 1 つでなく");
    expect(l4).toContain("screen-design / frontend-design は**独立した駆動モデルでなく");
    expect(l3).not.toContain("9 mode + 工程専門 2 = 11 mode");
    expect(l3).not.toContain("全 18 FR で人間判断点");
  });

  it("U-VPAIR-005m: harness P1 carry count は L4未起票と実装済/fullbackを混同しない", () => {
    const l3 = readFileSync("docs/design/harness/L3-functional/functional-requirements.md", "utf8");
    const l4 = readFileSync("docs/design/harness/L4-basic-design/function.md", "utf8");
    const combined = `${l3}\n${l4}`;

    for (const required of [
      "L4 未起票 sub-PLAN 8 件",
      "実装済 1 件",
      "FR-L1-42 provider handover",
      "L7/Reverse fullback 1 件",
      "FR-L1-51 artifact progress",
      "A-50 で 7 件削減",
      "全行が L4 sub-PLAN 待ちではない",
      "FR-L1-42 は provider-handover 実装済",
      "FR-L1-51 は PLAN-L7-56 / PLAN-REVERSE-56 で扱う",
    ]) {
      expect(combined).toContain(required);
    }

    expect(combined).not.toContain("残 P1 L4 carry = 9 件");
    expect(combined).not.toContain("P1 sub-PLAN 9 件");
    expect(combined).not.toContain("P1 carry 10 件の機能 building block");
    expect(combined).not.toContain("A-50 で 6 件削減");
  });

  it("U-VPAIR-005n: harness L3 functional AC は L12 AT-FR に全件接続", () => {
    const functional = readFileSync(
      "docs/design/harness/L3-functional/functional-requirements.md",
      "utf8",
    );
    const acceptance = readFileSync(
      "docs/test-design/harness/L3-acceptance-test-design.md",
      "utf8",
    );
    const acIds = uniqueMatches(functional, /^#### (AC-FR-\d+-\d+)/gm);
    const atMappedAcIds = uniqueMatches(
      acceptance,
      /\| \*\*AT-FR-\d+-\d+\*\* \| [^|\n]*(AC-FR-\d+-\d+)/g,
    );

    expect(acIds).toHaveLength(85);
    expect(atMappedAcIds).toHaveLength(85);
    expect(atMappedAcIds).toEqual(acIds);
    expect(functional).toContain("AC-FR は **85 件**");
    expect(functional).toContain("全 85 AC-FR-* を AT-FR-* で被覆");
    expect(acceptance).toContain("AT-FR 合計 = 85 件");
    expect(acceptance).toContain("AC-FR / AT-FR 85 件");
    expect(acceptance).not.toContain("AT-FR 計 79 件");
    expect(acceptance).not.toContain("AT-FR 合計 = 58 + 21");
  });

  it("U-VPAIR-007a: HELIX L3 43要件は L4 basic design に全件降下済み", () => {
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l4 = readFileSync("docs/design/helix/L4-basic-design/pillar-basic-design.md", "utf8");
    const l3RequirementIds = uniqueMatches(l3, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);
    const l4PillarTrace = l4.split("## §2 L3 -> L4 trace")[1]?.split("## §2.1 Route-B")[0] ?? "";
    const l4RequirementIds = uniqueMatches(l4PillarTrace, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);

    expect(l3RequirementIds).toHaveLength(43);
    expect(l4RequirementIds).toEqual(l3RequirementIds);
    for (const required of [
      "HB-P0 forward-convergence",
      "HB-P1 continuous-autonomy",
      "HB-P2 agent-loop-contract",
      "HB-P3 verification-governance",
      "HB-P4 repair-learning",
      "HB-P6 github-distribution",
      "HB-P7 shared-knowledge",
      "HB-P8 external-security",
      "HB-P9 db-convergence",
      "HB-AC adapter-consistency",
      "provider API direct call",
      "SDK 常駐実行",
      "security filter",
      "parallel worker/resource budget",
      "L2 skip",
      "bounded context",
      "Red evidence",
      "L1 §2.8 asset/progress visualization amendment",
      "S4 confirmed 後",
    ]) {
      expect(l4).toContain(required);
    }
  });

  it("U-VPAIR-007b: HELIX L4 design と L9 system test design は単一 doc pair で双方向接続", () => {
    const ok = analyzePairFreeze([
      doc(
        "docs/design/helix/L4-basic-design/pillar-basic-design.md",
        "L4",
        "docs/test-design/helix/L4-pillar-system-test-design.md",
        "confirmed",
      ),
      doc(
        "docs/test-design/helix/L4-pillar-system-test-design.md",
        "L4",
        "docs/design/helix/L4-basic-design/pillar-basic-design.md",
        "confirmed",
      ),
    ]);
    expect(ok.ok).toBe(true);
    expect(ok.pairs).toBe(1);
  });

  it("U-VPAIR-007c: HELIX L4 system test design は L3 43要件を1件も漏らさない", () => {
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l4 = readFileSync("docs/design/helix/L4-basic-design/pillar-basic-design.md", "utf8");
    const l9 = readFileSync("docs/test-design/helix/L4-pillar-system-test-design.md", "utf8");
    const l3RequirementIds = uniqueMatches(l3, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);
    const l4TestIds = uniqueMatches(l4, /\| (HST-[^ |]+) \|$/gm);
    const l9RequirementIds = uniqueMatches(
      l9,
      /^\| HST-(?!ID\b)[^|]+ \| (HR-(?:FR|NFR)-[^ |]+) \|/gm,
    );
    const l9TestIds = uniqueMatches(l9, /^\| (HST-(?!ID\b)[^ |]+) \|/gm);

    expect(l9RequirementIds).toEqual(l3RequirementIds);
    expect(l9TestIds).toHaveLength(43);
    expect(l4TestIds).toEqual(l9TestIds);
    expect(l9).toContain("L1 §2.8 asset/progress visualization amendment");
    expect(l9).toContain("Tree View / Webview boundary");
  });

  it("U-VPAIR-007d: 既存 harness L4 本体も HELIX pillar overlay の scope/carry/boundary を持つ", () => {
    const functionDoc = readFileSync("docs/design/harness/L4-basic-design/function.md", "utf8");
    const architectureDoc = readFileSync(
      "docs/design/harness/L4-basic-design/architecture.md",
      "utf8",
    );
    const dataDoc = readFileSync("docs/design/harness/L4-basic-design/data.md", "utf8");
    const externalIfDoc = readFileSync(
      "docs/design/harness/L4-basic-design/external-if.md",
      "utf8",
    );

    for (const required of [
      "PLAN-L4-51",
      "harness core only",
      "HR-FR-*` 30 件 + `HR-NFR-*` 13 件",
      "HELIX pillar block overlay",
      "HB-P8 external-security",
    ]) {
      expect(functionDoc).toContain(required);
    }

    for (const required of [
      "HELIX pillar overlay",
      "no provider API/SDK core dependency",
      "HB-P8 external-security",
      "raw external text is not instruction",
      "hosted API/developer tool surface",
    ]) {
      expect(architectureDoc).toContain(required);
    }

    for (const required of [
      "HELIX pillar projection carry",
      "approval action ledger",
      "research source ledger",
      "security event ledger",
      "glossary/context-map projection",
      "contract ledger",
    ]) {
      expect(dataDoc).toContain(required);
    }

    for (const required of [
      "external research/input boundary",
      "sandbox/external execution boundary",
      "release/GitHub rules boundary",
      "hosted API/developer tool boundary",
      "raw external text is not instruction",
      "repo-local hooks are not mechanical coverage",
    ]) {
      expect(externalIfDoc).toContain(required);
    }
  });

  it("U-VPAIR-007e: HELIX L4 block ID 参照は許可済み10 blockだけを使う", () => {
    const allowedBlocks = [
      "HB-AC",
      "HB-P0",
      "HB-P1",
      "HB-P2",
      "HB-P3",
      "HB-P4",
      "HB-P6",
      "HB-P7",
      "HB-P8",
      "HB-P9",
    ];
    const docs = [
      readFileSync("docs/design/helix/L4-basic-design/pillar-basic-design.md", "utf8"),
      readFileSync("docs/test-design/helix/L4-pillar-system-test-design.md", "utf8"),
      readFileSync("docs/design/harness/L4-basic-design/function.md", "utf8"),
      readFileSync("docs/design/harness/L4-basic-design/architecture.md", "utf8"),
      readFileSync("docs/plans/PLAN-L4-51-helix-pillar-basic-design.md", "utf8"),
    ].join("\n");
    const referencedBlocks = uniqueMatches(docs, /\b(HB-(?:P\d+|AC))\b/g);

    expect(referencedBlocks).toEqual(allowedBlocks);
    expect(docs).not.toContain("HB-P5");
    expect(docs).toContain("`HNFR-P5` は `HB-P1` / `HB-P3` に降下");
  });

  it("U-VPAIR-007f: HELIX L4 completion docs do not retain stale draft status claims", () => {
    const planL451 = readFileSync("docs/plans/PLAN-L4-51-helix-pillar-basic-design.md", "utf8");
    const planL450 = readFileSync("docs/plans/PLAN-L4-50-orchestration-memory-hybrid.md", "utf8");

    expect(planL450).toMatch(/^status:\s*archived$/m);
    expect(planL451).not.toContain("`status: draft` のまま残っていた");
    expect(planL451).toContain("現行では `status: archived` に閉じる対象");
  });

  it("U-VPAIR-008: L4 master は confirmed L4 child と L9 UI標準 pair を漏らさない", () => {
    const master = readFileSync("docs/plans/PLAN-L4-00-master.md", "utf8");
    const l9 = readFileSync("docs/test-design/harness/L9-system-test-design.md", "utf8");
    const confirmedL4Plans = [
      "docs/plans/PLAN-L4-01-data.md",
      "docs/plans/PLAN-L4-02-architecture.md",
      "docs/plans/PLAN-L4-03-function.md",
      "docs/plans/PLAN-L4-04-external-if.md",
      "docs/plans/PLAN-L4-05-workflow-orchestration.md",
      "docs/plans/PLAN-L4-06-design-refresh.md",
      "docs/plans/PLAN-L4-10-internal-asset-master.md",
      "docs/plans/PLAN-L4-11-roster.md",
      "docs/plans/PLAN-L4-12-skill-pack.md",
      "docs/plans/PLAN-L4-13-drift-lint.md",
      "docs/plans/PLAN-L4-14-ui-standard.md",
      "docs/plans/PLAN-L4-51-helix-pillar-basic-design.md",
    ];

    for (const planPath of confirmedL4Plans) {
      const plan = readFileSync(planPath, "utf8");
      const planId = plan.match(/^plan_id:\s*(\S+)/m)?.[1];
      expect(plan, `${planPath} must be confirmed`).toMatch(/^status:\s*confirmed$/m);
      expect(plan, `${planPath} must not leave open DoD checkboxes`).not.toMatch(/^- \[ \]/m);
      expect(master, `${planId} must be in PLAN-L4-00 roadmap spans`).toContain(
        `plan_id: ${planId}`,
      );
    }

    for (const required of [
      "ui-standard+tokens",
      "PLAN-L4-14-ui-standard",
      "related_l4_ui_standard",
      "related_l4_tokens",
      "ST-UI-01",
      "ST-UI-02",
      "ST-UI-03",
      "ST-UI-04",
      "ui-standard.md / tokens.yaml",
    ]) {
      expect(`${master}\n${l9}`).toContain(required);
    }
  });

  it("U-VPAIR-009a: HELIX L4 43要件は L5 detail design に全件降下済み", () => {
    const l4 = readFileSync("docs/design/helix/L4-basic-design/pillar-basic-design.md", "utf8");
    const l5 = readFileSync("docs/design/helix/L5-detail/pillar-detail-design.md", "utf8");
    const l4PillarTrace = l4.split("## §2 L3 -> L4 trace")[1]?.split("## §2.1 Route-B")[0] ?? "";
    const l5PillarTrace =
      l5.split("## §2 L4 -> L5 -> L8 trace")[1]?.split("## §2.1 Route-B")[0] ?? "";
    const l4RequirementIds = uniqueMatches(l4PillarTrace, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);
    const l5RequirementIds = uniqueMatches(l5PillarTrace, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);

    expect(l4RequirementIds).toHaveLength(43);
    expect(l5RequirementIds).toEqual(l4RequirementIds);
    for (const required of [
      "HC-P0 forward-return-contract",
      "HC-P1 autonomous-work-contract",
      "HC-P2 agent-loop-contract",
      "HC-P3 verification-contract",
      "HC-P4 repair-feedback-contract",
      "HC-P6 distribution-contract",
      "HC-P7 knowledge-contract",
      "HC-P8 security-boundary-contract",
      "HC-P9 convergence-db-contract",
      "HC-AC adapter-consistency-contract",
      "action-binding approval",
      "preflight 欠落",
      "## §3 L5 contract matrix",
      "Required inputs",
      "State / projection boundary",
      "Contract output",
      "Fail-close / block condition",
      "ForwardReturnDecision",
      "AutonomyResumeDecision",
      "LoopDispatchDecision",
      "L1 §2.8 asset/progress visualization amendment",
      "VisualizationSnapshot",
      "VerificationEvidenceProfile",
      "SecurityBoundaryDecision",
      "ConvergenceStatus",
      "## §4 source-design audit and anti-corruption boundary",
      "HELIX-process-L0-L14.md",
      "db-integration.md",
      "recovery-workflow.md",
      "asset-mapping.md",
    ]) {
      expect(l5).toContain(required);
    }
  });

  it("U-VPAIR-009b: HELIX L5 design と L8 integration test design は単一 doc pair で双方向接続", () => {
    const ok = analyzePairFreeze([
      doc(
        "docs/design/helix/L5-detail/pillar-detail-design.md",
        "L5",
        "docs/test-design/helix/L5-pillar-integration-test-design.md",
        "confirmed",
      ),
      doc(
        "docs/test-design/helix/L5-pillar-integration-test-design.md",
        "L5",
        "docs/design/helix/L5-detail/pillar-detail-design.md",
        "confirmed",
      ),
    ]);
    expect(ok.ok).toBe(true);
    expect(ok.pairs).toBe(1);
  });

  it("U-VPAIR-009c: HELIX L5 integration test design は L3 43要件を1件も漏らさない", () => {
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l5 = readFileSync("docs/design/helix/L5-detail/pillar-detail-design.md", "utf8");
    const l8 = readFileSync("docs/test-design/helix/L5-pillar-integration-test-design.md", "utf8");
    const l3RequirementIds = uniqueMatches(l3, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);
    const l5TestIds = uniqueMatches(l5, /\| (LIT-[^ |]+) \|$/gm);
    const l8RequirementIds = uniqueMatches(
      l8,
      /^\| LIT-(?!ID\b)[^|]+ \| (HR-(?:FR|NFR)-[^ |]+) \|/gm,
    );
    const l8TestIds = uniqueMatches(l8, /^\| (LIT-(?!ID\b)[^ |]+) \|/gm);

    expect(l8RequirementIds).toEqual(l3RequirementIds);
    expect(l8TestIds).toHaveLength(43);
    expect(l5TestIds).toEqual(l8TestIds);
    for (const required of [
      "## §3 integration observation contract",
      "contract input",
      "projection/evidence",
      "contract output",
      "fail-close behavior",
      "negative path",
      "## §4 source-design coverage",
      "workflow は Forward と DB trace へ戻る",
      "budget / lock / stop reason",
      "catalog / registry / contract ledger",
      "L1 §2.8 asset/progress visualization amendment",
      "visualization read-model / graph IR / drill-down",
    ]) {
      expect(l8).toContain(required);
    }
  });

  it("U-VPAIR-009d: L5 master は HELIX pillar detail child と L5-L8 pair wording を持つ", () => {
    const master = readFileSync("docs/plans/PLAN-L5-00-master.md", "utf8");
    const plan = readFileSync("docs/plans/PLAN-L5-09-helix-pillar-detail-design.md", "utf8");
    const docs = [
      readFileSync("docs/design/helix/L5-detail/pillar-detail-design.md", "utf8"),
      readFileSync("docs/test-design/helix/L5-pillar-integration-test-design.md", "utf8"),
      plan,
    ].join("\n");
    const allowedContracts = [
      "HC-AC",
      "HC-P0",
      "HC-P1",
      "HC-P2",
      "HC-P3",
      "HC-P4",
      "HC-P6",
      "HC-P7",
      "HC-P8",
      "HC-P9",
    ];

    expect(plan).toMatch(/^status:\s*confirmed$/m);
    expect(plan).not.toMatch(/^- \[ \]/m);
    expect(master).toContain("plan_id: PLAN-L5-09-helix-pillar-detail-design");
    expect(master).toContain("HELIX pillar detail");
    expect(master).toContain("L5↔L8 V-pair");
    expect(`${master}\n${plan}`).not.toContain("L5↔L9");
    expect(plan).not.toContain(
      "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    );
    expect(plan).toContain(".ut-tdd/evidence/helix-l5/20260629-l5-09-vmodel-pair.json");
    expect(plan).toContain(".ut-tdd/evidence/helix-l5/20260629-l5-09-plan-lint.json");
    expect(uniqueMatches(docs, /\b(HC-(?:P\d+|AC))\b/g)).toEqual(allowedContracts);
    expect(docs).not.toContain("HC-P5");
  });

  it("U-VPAIR-009e: HELIX L5 HC contracts are lowered into L6 function contracts and L7 oracles", () => {
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l5 = readFileSync("docs/design/helix/L5-detail/pillar-detail-design.md", "utf8");
    const l6 = readFileSync(
      "docs/design/helix/L6-function-design/pillar-function-design.md",
      "utf8",
    );
    const l7 = readFileSync("docs/test-design/helix/L6-pillar-unit-test-design.md", "utf8");
    const l3RequirementIds = uniqueMatches(l3, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);
    const l6RequirementIds = uniqueMatches(l6, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);
    const l7RequirementIds = uniqueMatches(
      l7,
      /^\| HU-PILLAR-[^|]+ \| (HR-(?:FR|NFR)-[^ |]+) \|/gm,
    );
    const l7OracleIds = uniqueMatches(l7, /^\| (HU-PILLAR-(?![A-Z ]+\|)[^ |]+) \|/gm);
    const allowedContracts = [
      "HC-AC",
      "HC-P0",
      "HC-P1",
      "HC-P2",
      "HC-P3",
      "HC-P4",
      "HC-P6",
      "HC-P7",
      "HC-P8",
      "HC-P9",
    ];

    const pair = analyzePairFreeze([
      doc(
        "docs/design/helix/L6-function-design/pillar-function-design.md",
        "L6",
        "docs/test-design/helix/L6-pillar-unit-test-design.md",
        "confirmed",
      ),
      doc(
        "docs/test-design/helix/L6-pillar-unit-test-design.md",
        "L6",
        "docs/design/helix/L6-function-design/pillar-function-design.md",
        "confirmed",
      ),
    ]);

    expect(pair.ok).toBe(true);
    expect(l6RequirementIds).toEqual(l3RequirementIds);
    expect(l7RequirementIds).toEqual(l3RequirementIds);
    expect(l7OracleIds).toHaveLength(49);
    expect(uniqueMatches(`${l5}\n${l6}\n${l7}`, /\b(HC-(?:P\d+|AC))\b/g)).toEqual(allowedContracts);
    for (const required of [
      "function contract",
      "30 function contract",
      "ForwardReturnDecision",
      "VerificationProfileDecision",
      "AdapterParityDecision",
      "fast<=120s/default<=600s/full<=1800s",
      "p95 duration budget",
      "projection-only telemetry cannot close",
      "RuntimeVerificationLogEvent",
      "projectRuntimeAdapterAssets",
      "MAX_TEAM_PARALLEL=8",
      "PLAN-L7-190",
      "PLAN-L7-196",
      "telemetry provenance source map",
      "Bash (skill)",
      "forced_stop",
      "runtime-hook:skill-suggest",
      "HU-PILLAR-NAC-03",
      "HU-PILLAR-DIST-01",
      "HU-PILLAR-CONFIG-01",
      "HU-PILLAR-PROV-04",
      "L1 §2.8 asset/progress visualization amendment",
      "§0.1 実装可能機能一覧の意味境界",
      "pair-agent TDD / loop trace",
      "GitHub/setup/release/identifier rename",
      "`.ut-tdd -> .helix`",
      "view-model function",
      "VSCode Tree View / Webview",
    ]) {
      expect(`${l6}\n${l7}`).toContain(required);
    }
  });

  it("U-VPAIR-009f: old HELIX extension candidates are lowered through HELIX L3-L6", () => {
    const l3 = readFileSync("docs/design/helix/L3-requirements/legacy-helix-extension.md", "utf8");
    const l4 = readFileSync("docs/design/helix/L4-basic-design/legacy-helix-extension.md", "utf8");
    const l5 = readFileSync("docs/design/helix/L5-detail/legacy-helix-extension.md", "utf8");
    const l6 = readFileSync(
      "docs/design/helix/L6-function-design/legacy-helix-extension.md",
      "utf8",
    );
    const testDesign = readFileSync("docs/test-design/helix/legacy-helix-extension.md", "utf8");
    const combined = [l3, l4, l5, l6, testDesign].join("\n");
    const l3Ids = uniqueMatches(l3, /^\| (HLX-FR-\d{2}) \|/gm);
    const l4Ids = uniqueMatches(l4, /\b(HLX-SYS-\d{2})\b/g);
    const l5Ids = uniqueMatches(l5, /\b(HLX-C\d{2})\b/g);
    const l6Oracles = uniqueMatches(testDesign, /\b(U-HLX-\d{3})\b/g);

    const pair = analyzePairFreeze([
      doc(
        "docs/design/helix/L6-function-design/legacy-helix-extension.md",
        "L6",
        "docs/test-design/helix/legacy-helix-extension.md",
        "confirmed",
      ),
      doc(
        "docs/test-design/helix/legacy-helix-extension.md",
        "L6",
        "docs/design/helix/",
        "confirmed",
      ),
    ]);

    expect(pair.ok).toBe(true);
    expect(l3Ids).toEqual([
      "HLX-FR-01",
      "HLX-FR-02",
      "HLX-FR-03",
      "HLX-FR-04",
      "HLX-FR-05",
      "HLX-FR-06",
      "HLX-FR-07",
      "HLX-FR-08",
      "HLX-FR-09",
      "HLX-FR-10",
      "HLX-FR-11",
      "HLX-FR-12",
    ]);
    expect(l4Ids).toEqual([
      "HLX-SYS-01",
      "HLX-SYS-02",
      "HLX-SYS-03",
      "HLX-SYS-04",
      "HLX-SYS-05",
      "HLX-SYS-06",
      "HLX-SYS-07",
      "HLX-SYS-08",
      "HLX-SYS-09",
      "HLX-SYS-10",
      "HLX-SYS-11",
      "HLX-SYS-12",
    ]);
    expect(l5Ids).toEqual([
      "HLX-C01",
      "HLX-C02",
      "HLX-C03",
      "HLX-C04",
      "HLX-C05",
      "HLX-C06",
      "HLX-C07",
      "HLX-C08",
      "HLX-C09",
      "HLX-C10",
      "HLX-C11",
      "HLX-C12",
    ]);
    expect(l6Oracles).toEqual([
      "U-HLX-001",
      "U-HLX-002",
      "U-HLX-003",
      "U-HLX-004",
      "U-HLX-005",
      "U-HLX-006",
      "U-HLX-007",
      "U-HLX-008",
      "U-HLX-009",
      "U-HLX-010",
      "U-HLX-011",
      "U-HLX-012",
      "U-HLX-013",
    ]);
    for (const required of [
      "source_legacy_commit: 1cb4c3e",
      "source_legacy_commit_full: 1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23",
      "source-family disposition",
      "82 commands",
      "139 modules",
      "17 files",
      "14 files",
      "19 agents / 31 roles",
      "18 hooks",
      "130 skills",
      "49 docs",
      "35 scripts / 98 Bats",
      "existing-pillar-covered",
      "harden-via-current-cli",
      "concept-only-ts-reimplementation",
      "catalog-not-bulk-import",
      "core injection",
      "guard-surface registry",
      "agent / role / model roster",
      "workflow process inventory",
      "DB / registry / telemetry / HTTP API surface",
      "continuous-run / scheduler / job / budget",
      "learning / feedback / recipe loop",
      "TL advisor evidence",
      "detector axis registry",
      "recommender catalog",
      "RUN & Debug trace",
      "buildWorkPreflightDecision",
      "classifyTechnicalQuestion",
      "registerDetectorAxis",
      "buildRecommendationDecision",
      "analyzeRunDebugTrace",
      "buildCoreInjectionContract",
      "classifyLegacyHookSurface",
      "buildAgentRolePolicyDecision",
      "mapWorkflowInventoryToPillar",
      "classifyLegacyDbSurface",
      "buildContinuousRunControlDecision",
      "buildLearningFeedbackDecision",
      "helix/core-manifest.tsv",
      ".claude/settings.json",
      "cli/lib/agent_slots.py",
      "HELIX-workflows/helix-process/*.md",
      "cli/lib/helix_db.py",
      "cli/helix-auto-run",
      "cli/lib/learning_engine.py",
      "PLAN-M-02-helix-identifier-rename.md",
    ]) {
      expect(combined).toContain(required);
    }
  });

  it("U-VPAIR-006: pairFreezeMessages — 孤児なし OK / 孤児あり reason 別文言", () => {
    expect(pairFreezeMessages({ ok: true, orphans: [], pairs: 5 })[0]).toContain("OK");
    const msgs = pairFreezeMessages({
      ok: false,
      pairs: 0,
      orphans: [
        {
          path: "docs/design/harness/L3-functional/README.md",
          reason: "pair-missing",
          detail: "layer L3",
        },
      ],
    });
    expect(msgs.join(" ")).toContain("pair 欠落");
  });
});

describe("verification trigger (U-VTRIG、層群 freeze の機械発火、IMP-068)", () => {
  it("U-VTRIG-001: analyzeVerificationGroups — 層群ごとに confirmed/draft を集計", () => {
    const docs = [
      doc("docs/design/harness/L1-requirements/a.md", "L1", "x", "confirmed"),
      doc("docs/design/harness/L3-functional/b.md", "L3", "x", "confirmed"),
      doc("docs/design/harness/L4-basic-design/c.md", "L4", "x", "draft"),
    ];
    const groups = analyzeVerificationGroups(docs, []);
    const l03 = groups.find((g) => g.id === "L0-L3");
    expect(l03?.confirmed).toBe(2);
    expect(l03?.total).toBe(2);
    expect(l03?.frozen).toBe(true);
    const l46 = groups.find((g) => g.id === "L4-L6");
    expect(l46?.draft).toBe(1);
    expect(l46?.frozen).toBe(false);
  });

  it("U-VTRIG-002: frozen 判定 — draft があれば未完了、placeholder(park) は発火を妨げない", () => {
    const withPark = analyzeVerificationGroups(
      [
        doc("docs/design/harness/L1-requirements/a.md", "L1", "x", "confirmed"),
        doc("docs/design/harness/L2-screen/b.md", "L2", "x", "placeholder"),
      ],
      [],
    ).find((g) => g.id === "L0-L3");
    expect(withPark?.frozen).toBe(true); // placeholder=park、confirmed 1 件で発火可
    expect(withPark?.placeholder).toBe(1);

    const withDraft = analyzeVerificationGroups(
      [
        doc("docs/design/harness/L1-requirements/a.md", "L1", "x", "confirmed"),
        doc("docs/design/harness/L3-functional/b.md", "L3", "x", "draft"),
      ],
      [],
    ).find((g) => g.id === "L0-L3");
    expect(withDraft?.frozen).toBe(false); // draft あり → Forward 進行中
  });

  it("U-VTRIG-003: 層群に pair 孤児があれば freeze 未完了", () => {
    const g = analyzeVerificationGroups(
      [doc("docs/design/harness/L1-requirements/a.md", "L1", "x", "confirmed")],
      [{ path: "docs/design/harness/L1-requirements/a.md", reason: "pair-missing", detail: "" }],
    ).find((g) => g.id === "L0-L3");
    expect(g?.frozen).toBe(false);
    expect(g?.hasOrphan).toBe(true);
  });

  it("U-VTRIG-006: L0-L7 freeze requires confirmed L7 automation PLAN evidence", () => {
    const docs = [
      doc("docs/design/harness/L1-requirements/a.md", "L1", "x", "confirmed"),
      doc("docs/design/harness/L2-screen/b.md", "L2", "x", "confirmed"),
      doc("docs/design/harness/L3-functional/c.md", "L3", "x", "confirmed"),
      doc("docs/design/harness/L4-basic-design/d.md", "L4", "x", "confirmed"),
      doc("docs/design/harness/L5-physical-data/e.md", "L5", "x", "confirmed"),
      doc("docs/design/harness/L6-function-design/f.md", "L6", "x", "confirmed"),
    ];
    const missing = analyzeVerificationGroups(docs, [], new Map()).find((g) => g.id === "L0-L7");
    expect(missing?.frozen).toBe(false);
    expect(missing?.missingPlanIds).toEqual([...L0_L7_AUTOMATION_PLAN_IDS]);

    const statuses = new Map(L0_L7_AUTOMATION_PLAN_IDS.map((id) => [id, "confirmed"]));
    const frozen = analyzeVerificationGroups(docs, [], statuses).find((g) => g.id === "L0-L7");
    expect(frozen?.frozen).toBe(true);
    expect(frozen?.confirmedPlanIds).toHaveLength(L0_L7_AUTOMATION_PLAN_IDS.length);

    const noEvidence = new Map(
      L0_L7_AUTOMATION_PLAN_IDS.map((id) => [
        id,
        { status: "confirmed", hasReviewEvidence: false, hasGenerates: true },
      ]),
    );
    const evidenceMissing = analyzeVerificationGroups(docs, [], noEvidence).find(
      (g) => g.id === "L0-L7",
    );
    expect(evidenceMissing?.frozen).toBe(false);
    expect(evidenceMissing?.evidenceMissingPlanIds).toEqual([...L0_L7_AUTOMATION_PLAN_IDS]);

    const fullEvidence = new Map(
      L0_L7_AUTOMATION_PLAN_IDS.map((id) => [
        id,
        { status: "confirmed", hasReviewEvidence: true, hasGenerates: true },
      ]),
    );
    const evidenceReady = analyzeVerificationGroups(docs, [], fullEvidence).find(
      (g) => g.id === "L0-L7",
    );
    expect(evidenceReady?.frozen).toBe(true);
    expect(evidenceReady?.evidenceReadyPlanIds).toHaveLength(L0_L7_AUTOMATION_PLAN_IDS.length);
  });

  it("U-VTRIG-004: verificationGroupMessages — freeze 完了(park 表示) / Forward 進行中", () => {
    const frozen = verificationGroupMessages([
      {
        id: "L0-L3",
        label: "上流",
        gate: "L3 検証サイクルゲート",
        total: 5,
        confirmed: 4,
        draft: 0,
        placeholder: 1,
        hasOrphan: false,
        requiredPlanIds: [],
        confirmedPlanIds: [],
        missingPlanIds: [],
        evidenceReadyPlanIds: [],
        evidenceMissingPlanIds: [],
        frozen: true,
      },
    ]);
    expect(frozen[0]).toContain("freeze 完了");
    expect(frozen[0]).toContain("検証サイクル発火可");
    expect(frozen[0]).toContain("park");
    // 検証サイクルゲート名が主見出しに surface される (PLAN-REVERSE-36)。
    expect(frozen[0]).toContain("L3 検証サイクルゲート");
    const progress = verificationGroupMessages([
      {
        id: "L4-L6",
        label: "設計",
        gate: "L6 検証サイクルゲート",
        total: 18,
        confirmed: 0,
        draft: 18,
        placeholder: 0,
        hasOrphan: false,
        requiredPlanIds: [],
        confirmedPlanIds: [],
        missingPlanIds: [],
        evidenceReadyPlanIds: [],
        evidenceMissingPlanIds: [],
        frozen: false,
      },
    ]);
    expect(progress[0]).toContain("Forward 進行中");
  });

  it("U-VTRIG-005: 実 repo ガード — L3/L4-L6/L0-L7 の freeze 完了を surface", () => {
    const docs = loadPairDocs();
    const { orphans } = analyzePairFreeze(docs);
    const groups = analyzeVerificationGroups(docs, orphans, loadVerificationPlanEvidence());
    expect(groups.find((g) => g.id === "L0-L3")?.frozen).toBe(true);
    expect(groups.find((g) => g.id === "L4-L6")?.frozen).toBe(true);
    // 全 3 検証サイクルゲート名が実 repo の surface に出る (PLAN-REVERSE-36、命名の壊れを CI で検知)。
    const surface = verificationGroupMessages(groups).join("\n");
    expect(surface).toContain("L3 検証サイクルゲート");
    expect(surface).toContain("L6 検証サイクルゲート");
    expect(surface).toContain("設計検証サイクルゲート");
    expect(surface).toContain("実装検証サイクルゲート");
    expect(surface).toContain("freeze 完了");
    expect(groups.find((g) => g.id === "L0-L7")?.frozen).toBe(true);
  });
});
