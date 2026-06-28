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

    const l3ClosureRows = markdownTableRows(l3).filter((row) => row[2] === "起草済");
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

  it("U-VPAIR-005c: HELIX L3 FR/NFR と HAC は HAT acceptance に孤児なく接続", () => {
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    const l12 = readFileSync("docs/test-design/helix/L3-pillar-acceptance-test-design.md", "utf8");
    const l3RequirementIds = uniqueMatches(l3, /^\| (HR-(?:FR|NFR)-[^ |]+) \|/gm);
    const hatRequirementIds = uniqueMatches(
      l12,
      /^\| HAT-(?!ID\b)[^|]+ \| (HR-(?:FR|NFR)-[^ |]+) \|/gm,
    );
    const l3AcIds = uniqueMatches(l3, /^\| (HAC-[^ |]+) \|/gm);
    const hatAcIds = expandHacRefs(l12);

    expect(l3RequirementIds).toHaveLength(43);
    expect(hatRequirementIds).toEqual(l3RequirementIds);
    expect(l3AcIds).toHaveLength(86);
    expect(hatAcIds).toEqual(l3AcIds);
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

  it("U-VTRIG-005: 実 repo ガード — L3 承認後も別層 draft を Forward 進行中として surface", () => {
    const docs = loadPairDocs();
    const { orphans } = analyzePairFreeze(docs);
    const groups = analyzeVerificationGroups(docs, orphans, loadVerificationPlanEvidence());
    expect(groups.find((g) => g.id === "L0-L3")?.frozen).toBe(true);
    expect(groups.find((g) => g.id === "L4-L6")?.frozen).toBe(false);
    // 全 3 検証サイクルゲート名が実 repo の surface に出る (PLAN-REVERSE-36、命名の壊れを CI で検知)。
    const surface = verificationGroupMessages(groups).join("\n");
    expect(surface).toContain("L3 検証サイクルゲート");
    expect(surface).toContain("L6 検証サイクルゲート");
    expect(surface).toContain("設計検証サイクルゲート");
    expect(surface).toContain("実装検証サイクルゲート");
    expect(surface).toContain("Forward 進行中");
    expect(groups.find((g) => g.id === "L0-L7")?.frozen).toBe(false);
  });
});
