import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeBackfill,
  BACKFILL_RESULT_KEYS,
  backfillMessages,
  KIND_BACKFILL,
  loadBackfillDocs,
  type ParsedPlan,
  parseConditionalBackfillAuditPlanIds,
  parseGlossaryTerms,
  parsePlan,
  parseReferences,
  parseRequires,
} from "../src/lint/backfill-pairing";

function plan(over: Partial<ParsedPlan> = {}): ParsedPlan {
  return {
    file: "f.md",
    plan_id: "PLAN-L7-99-x",
    kind: "add-impl",
    status: "confirmed",
    created: "2026-06-21",
    updated: "2026-06-21",
    backpropDecision: "",
    backpropDecisionReason: "",
    routeMode: "",
    backfillState: "",
    workflowTargetAxis: "",
    workflowTargetId: "",
    workflowIdentityValid: false,
    requires: [],
    references: [],
    glossaryTerms: [],
    ...over,
  };
}

describe("U-BACKFILL-001 dependency参照 / glossary parser", () => {
  it("requires の YAML list path を抽出 / 無し・[] → []", () => {
    const fm = `---
plan_id: PLAN-REVERSE-06-x
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-06-handover-enforcement.md
    - docs/plans/PLAN-L7-08-agent-slots.md
  blocks: []
---
`;
    expect(parseRequires(fm)).toEqual([
      "docs/plans/PLAN-L7-06-handover-enforcement.md",
      "docs/plans/PLAN-L7-08-agent-slots.md",
    ]);
    expect(parseRequires("requires: []\n")).toEqual([]);
    expect(parseRequires("no requires here")).toEqual([]);
  });

  it("Reverse対象をreferencesから抽出する", () => {
    expect(parseReferences("references:\n  - docs/plans/PLAN-L7-08-agent-slots.md\n")).toEqual([
      "docs/plans/PLAN-L7-08-agent-slots.md",
    ]);
  });

  it("§6 用語更新 の太字 term を抽出", () => {
    const body = `## §6 用語更新

- **agent-slot**: 定義...
- **直列化 3 条件**: file_conflict / ...
- 通常行 (太字なし) は無視

## §7 次
- **無関係**: 別 section`;
    expect(parseGlossaryTerms(body)).toEqual(["agent-slot", "直列化 3 条件"]);
  });
});

describe("U-BACKFILL-002 parsePlan", () => {
  it("frontmatter + requires + glossary を構造化", () => {
    const content = `---
plan_id: PLAN-L7-08-agent-slots
kind: add-impl
status: confirmed
dependencies:
  requires:
    - docs/plans/PLAN-L6-07-agent-slots.md
---
## §6 用語更新
- **peak_parallel**: 同時実行ピーク`;
    const p = parsePlan("PLAN-L7-08-agent-slots.md", content);
    expect(p.plan_id).toBe("PLAN-L7-08-agent-slots");
    expect(p.kind).toBe("add-impl");
    expect(p.requires).toEqual(["docs/plans/PLAN-L6-07-agent-slots.md"]);
    expect(p.glossaryTerms).toEqual(["peak_parallel"]);
  });
});

describe("U-BACKFILL-003 KIND_BACKFILL matrix", () => {
  it("add-impl=required / refactor=conditional / impl・design・reverse・recovery=none", () => {
    expect(KIND_BACKFILL["add-impl"]).toBe("required");
    expect(KIND_BACKFILL.refactor).toBe("conditional");
    expect(KIND_BACKFILL.troubleshoot).toBe("conditional");
    expect(KIND_BACKFILL.impl).toBe("none");
    expect(KIND_BACKFILL.design).toBe("none");
    expect(KIND_BACKFILL.reverse).toBe("none");
    expect(KIND_BACKFILL.recovery).toBe("none");
  });
});

describe("U-BACKFILL-004 analyzeBackfill", () => {
  const glossary = "用語集: agent-slot は ... peak_parallel は ...";

  it("required (add-impl) をReverseが参照する → 孤児なし", () => {
    const plans = [
      plan({ plan_id: "PLAN-L7-08-agent-slots", kind: "add-impl" }),
      plan({
        plan_id: "PLAN-REVERSE-06-x",
        kind: "reverse",
        created: "2026-07-19",
        updated: "2026-07-19",
        references: ["docs/plans/PLAN-L7-08-agent-slots.md"],
      }),
    ];
    const r = analyzeBackfill(plans, glossary);
    expect(r.reverseOrphans).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("legacy Reverseはupdatedが新しくなってもcreated時点のrequires方式を維持する", () => {
    const plans = [
      plan({ plan_id: "PLAN-L7-08-agent-slots", kind: "add-impl" }),
      plan({
        plan_id: "PLAN-REVERSE-06-x",
        kind: "reverse",
        created: "2026-06-21",
        updated: "2026-07-19",
        requires: ["docs/plans/PLAN-L7-08-agent-slots.md"],
      }),
    ];
    expect(analyzeBackfill(plans, glossary).reverseOrphans).toEqual([]);
  });

  it("required (add-impl) に Reverse が無い → reverseOrphan + ok=false", () => {
    const r = analyzeBackfill([plan({ plan_id: "PLAN-L7-50-orphan", kind: "add-impl" })], glossary);
    expect(r.reverseOrphans).toEqual([{ plan_id: "PLAN-L7-50-orphan", kind: "add-impl" }]);
    expect(r.ok).toBe(false);
  });

  it("conditional (refactor) に Reverse 無し → conditionalPending (warn のみ、ok を落とさない)", () => {
    const r = analyzeBackfill([plan({ plan_id: "PLAN-L7-05-x", kind: "refactor" })], glossary);
    expect(r.conditionalPending).toHaveLength(1);
    expect(r.reverseOrphans).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("§6 用語が glossary 未 merge → glossaryGap + ok=false", () => {
    const r = analyzeBackfill(
      [
        plan({
          plan_id: "PLAN-L6-07-agent-slots",
          kind: "add-design",
          glossaryTerms: ["未登録語"],
        }),
      ],
      glossary,
    );
    expect(r.glossaryGaps).toEqual([{ plan_id: "PLAN-L6-07-agent-slots", term: "未登録語" }]);
    expect(r.ok).toBe(false);
  });

  it("endsWith 誤判定なし: 別 plan_id の suffix では back-fill 済と見なさない", () => {
    const plans = [
      plan({ plan_id: "PLAN-L7-1", kind: "add-impl" }),
      plan({
        plan_id: "PLAN-REVERSE-9-x",
        kind: "reverse",
        // 別 plan の path。`PLAN-L7-1` の suffix だが境界が違う
        requires: ["docs/plans/PLAN-X-L7-1.md"],
      }),
    ];
    const r = analyzeBackfill(plans, glossary);
    expect(r.reverseOrphans).toEqual([{ plan_id: "PLAN-L7-1", kind: "add-impl" }]);
  });

  it("archived は対象外", () => {
    const r = analyzeBackfill(
      [plan({ plan_id: "PLAN-L7-99-old", kind: "add-impl", status: "archived" })],
      glossary,
    );
    expect(r.reverseOrphans).toEqual([]);
  });
});

describe("U-BACKFILL-004a required backfill bidirectional pairing", () => {
  const glossary = "agent-slot peak_parallel";

  it("new required add-impl must also require its Reverse backfill PLAN", () => {
    const plans = [
      plan({
        plan_id: "PLAN-L7-108-green-evidence",
        kind: "add-impl",
        updated: "2026-06-23",
      }),
      plan({
        plan_id: "PLAN-REVERSE-108-green-evidence",
        kind: "reverse",
        created: "2026-07-19",
        updated: "2026-07-19",
        references: ["docs/plans/PLAN-L7-108-green-evidence.md"],
      }),
    ];
    const r = analyzeBackfill(plans, glossary);
    expect(r.reverseOrphans).toEqual([]);
    expect(r.reverseLinkMissing).toEqual([
      {
        plan_id: "PLAN-L7-108-green-evidence",
        reverse_plan_id: "PLAN-REVERSE-108-green-evidence",
      },
    ]);
    expect(r.ok).toBe(false);
  });

  it("new required add-impl passes when the Reverse pairing is bidirectional", () => {
    const plans = [
      plan({
        plan_id: "PLAN-L7-108-green-evidence",
        kind: "add-impl",
        updated: "2026-06-23",
        requires: ["docs/plans/PLAN-REVERSE-108-green-evidence.md"],
      }),
      plan({
        plan_id: "PLAN-REVERSE-108-green-evidence",
        kind: "reverse",
        created: "2026-07-19",
        updated: "2026-07-19",
        references: ["docs/plans/PLAN-L7-108-green-evidence.md"],
      }),
    ];
    const r = analyzeBackfill(plans, glossary);
    expect(r.reverseOrphans).toEqual([]);
    expect(r.reverseLinkMissing).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-BACKFILL-008: draft pending Reverseは双方向referencesでpassする", () => {
    const plans = [
      plan({
        plan_id: "PLAN-L7-696-forward",
        kind: "add-impl",
        updated: "2026-08-28",
        references: ["docs/plans/PLAN-REVERSE-696-forward.md"],
      }),
      plan({
        plan_id: "PLAN-REVERSE-696-forward",
        kind: "reverse",
        status: "draft",
        backfillState: "pending_reverse",
        created: "2026-08-28",
        updated: "2026-08-28",
        references: ["docs/plans/PLAN-L7-696-forward.md"],
      }),
    ];
    const result = analyzeBackfill(plans, glossary);
    expect(result.reverseLinkMissing).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it.each([
    ["forward reference欠落", [], "draft", "pending_reverse"],
    ["wrong Reverse ID", ["docs/plans/PLAN-REVERSE-999-wrong.md"], "draft", "pending_reverse"],
    ["state不一致", ["docs/plans/PLAN-REVERSE-696-forward.md"], "draft", "complete"],
  ])("U-BACKFILL-008: %sをfail-closeする", (_label, references, status, backfillState) => {
    const plans = [
      plan({
        plan_id: "PLAN-L7-696-forward",
        kind: "add-impl",
        updated: "2026-08-28",
        references: references as string[],
      }),
      plan({
        plan_id: "PLAN-REVERSE-696-forward",
        kind: "reverse",
        status,
        backfillState,
        created: "2026-08-28",
        updated: "2026-08-28",
        references: ["docs/plans/PLAN-L7-696-forward.md"],
      }),
    ];
    expect(analyzeBackfill(plans, glossary).reverseLinkMissing).toEqual([
      {
        plan_id: "PLAN-L7-696-forward",
        reverse_plan_id: "PLAN-REVERSE-696-forward",
      },
    ]);
    expect(analyzeBackfill(plans, glossary).ok).toBe(false);
  });
});

describe("U-BACKFILL-004b conditional backprop decision gate", () => {
  const glossary = "agent-slot peak_parallel";
  const typedAuthority = {
    registryVersion: "1.1.4",
    registrySourceDigest: "sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f",
    identities: new Set(["workflow_model:ADD_FEATURE"]),
  };

  it("conditional kind updated after enforcement without Reverse or no-backprop decision fails", () => {
    const r = analyzeBackfill(
      [plan({ plan_id: "PLAN-L7-104-x", kind: "refactor", updated: "2026-06-22" })],
      glossary,
    );
    expect(r.conditionalDecisionMissing).toEqual([{ plan_id: "PLAN-L7-104-x", kind: "refactor" }]);
    expect(r.conditionalPending).toEqual([]);
    expect(r.ok).toBe(false);
  });

  it("conditional kind can explicitly declare no design backprop required", () => {
    const r = analyzeBackfill(
      [
        plan({
          plan_id: "PLAN-L7-104-x",
          kind: "refactor",
          updated: "2026-06-22",
          backpropDecision: "not_required",
          backpropDecisionReason: "internal cleanup only; no contract or design change",
        }),
      ],
      glossary,
    );
    expect(r.conditionalDecisionMissing).toEqual([]);
    expect(r.conditionalPending).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("Add-feature Route Bはpending_reverseを明示すれば先行buildを許可する", () => {
    const plan = parsePlan(
      "PLAN-L7-999.md",
      `---
plan_id: PLAN-L7-999
kind: add-impl
status: confirmed
created: 2026-07-28
updated: 2026-07-28
route_mode: add-feature
backfill_state: pending_reverse
---`,
    );
    const result = analyzeBackfill([plan], "");
    expect(result.reverseOrphans).toEqual([]);
    expect(result.conditionalPending).toEqual([{ plan_id: "PLAN-L7-999", kind: "add-impl" }]);
    expect(result.ok).toBe(true);
  });

  // PLAN-L7-647-typed-backfill-pending-routing
  it("U-TPWBACK-001: typed ADD_FEATUREはlegacy route_modeなしでpending_reverseを受理する", () => {
    const typed = parsePlan(
      "PLAN-L7-1000.md",
      `---
plan_id: PLAN-L7-1000
kind: add-impl
status: draft
created: 2026-08-21
updated: 2026-08-21
backfill_state: pending_reverse
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
---`,
      typedAuthority,
    );

    const result = analyzeBackfill([typed], "");
    expect(result.reverseOrphans).toEqual([]);
    expect(result.conditionalPending).toEqual([{ plan_id: "PLAN-L7-1000", kind: "add-impl" }]);
    expect(result.ok).toBe(true);
  });

  it.each([
    [
      "別axis",
      "specialist_drive",
      "ADD_FEATURE",
      "sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f",
    ],
    [
      "別ID",
      "workflow_model",
      "REVERSE",
      "sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f",
    ],
    [
      "authority drift digest",
      "workflow_model",
      "ADD_FEATURE",
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ],
  ])(
    "U-TPWBACK-001: typed identityが%sならpending_reverseを推測しない",
    (_case, axis, id, digest) => {
      const typed = parsePlan(
        "PLAN-L7-1001.md",
        `---
plan_id: PLAN-L7-1001
kind: add-impl
status: draft
created: 2026-08-21
updated: 2026-08-21
backfill_state: pending_reverse
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: ${digest}
  target_axis: ${axis}
  target_id: ${id}
---`,
        typedAuthority,
      );

      expect(analyzeBackfill([typed], "").reverseOrphans).toEqual([
        { plan_id: "PLAN-L7-1001", kind: "add-impl" },
      ]);
    },
  );

  it("Add-feature以外やpending_reverse欠落のadd-implはReverse必須を維持する", () => {
    const forward = parsePlan(
      "PLAN-L7-998.md",
      `---
plan_id: PLAN-L7-998
kind: add-impl
status: confirmed
created: 2026-07-28
updated: 2026-07-28
route_mode: forward
backfill_state: pending_reverse
---`,
      typedAuthority,
    );
    const missingState = parsePlan(
      "PLAN-L7-997.md",
      `---
plan_id: PLAN-L7-997
kind: add-impl
status: confirmed
created: 2026-07-28
updated: 2026-07-28
route_mode: add-feature
---`,
    );
    const result = analyzeBackfill([forward, missingState], "");
    expect(result.reverseOrphans.map((item) => item.plan_id).sort()).toEqual([
      "PLAN-L7-997",
      "PLAN-L7-998",
    ]);
    expect(result.ok).toBe(false);
  });

  it("legacy conditional debt remains a warning baseline", () => {
    const r = analyzeBackfill(
      [
        plan({
          plan_id: "PLAN-L7-100-standard-deliverable-section-structure",
          kind: "troubleshoot",
          updated: "2026-06-22",
        }),
      ],
      glossary,
    );
    expect(r.conditionalDecisionMissing).toEqual([]);
    expect(r.conditionalPending).toEqual([
      { plan_id: "PLAN-L7-100-standard-deliverable-section-structure", kind: "troubleshoot" },
    ]);
    expect(r.ok).toBe(true);
  });
});

describe("U-BACKFILL-004c legacy conditional audit sync", () => {
  const glossary = "agent-slot peak_parallel";

  it("fails when the legacy conditional allowlist is missing from the audit table", () => {
    const r = analyzeBackfill([], glossary, new Set());

    expect(r.legacyAuditGaps).toContainEqual({
      plan_id: "PLAN-L7-05-biome-debt",
      location: "audit",
    });
    expect(r.ok).toBe(false);
  });

  it("fails when the audit table contains an entry outside the allowlist", () => {
    const r = analyzeBackfill([], glossary, new Set(["PLAN-L7-999-unknown-legacy"]));

    expect(r.legacyAuditGaps).toContainEqual({
      plan_id: "PLAN-L7-999-unknown-legacy",
      location: "allowlist",
    });
    expect(r.ok).toBe(false);
  });

  it("parses legacy audit table PLAN ids", () => {
    const ids = parseConditionalBackfillAuditPlanIds(`| PLAN | kind | observed issue |
|---|---|---|
| PLAN-L7-05-biome-debt | refactor | No Reverse link. |
`);

    expect(ids).toEqual(new Set(["PLAN-L7-05-biome-debt"]));
  });
});

describe("U-BACKFILL-005 backfillMessages", () => {
  it("孤児なし → OK / 孤児あり → warn 文言", () => {
    expect(backfillMessages(analyzeBackfill([], "")).some((m) => m.includes("OK"))).toBe(true);
    const orphan = analyzeBackfill([plan({ plan_id: "PLAN-L7-50-o", kind: "add-impl" })], "");
    expect(backfillMessages(orphan).some((m) => m.includes("without Reverse backfill"))).toBe(true);
  });
});

describe("U-BACKFILL-005b backfill result docs sync", () => {
  it("requirements and concept list all machine backfill result keys", () => {
    const root = process.cwd();
    const requirements = readFileSync(
      join(root, "docs", "governance", "helix-harness-requirements_v1.2.md"),
      "utf8",
    );
    const concept = readFileSync(
      join(root, "docs", "governance", "helix-harness-concept_v3.1.md"),
      "utf8",
    );

    for (const key of BACKFILL_RESULT_KEYS) {
      expect(requirements).toContain(key);
      expect(concept).toContain(key);
    }
  });
});

describe("U-BACKFILL-006 実 repo の back-fill 完全性 (回帰ガード)", () => {
  it("docs/plans/ 全 add-impl が Reverse 合流済 + §6 用語が L0 §10 に merge 済 (required orphan 0 / glossary gap 0)", () => {
    const docs = loadBackfillDocs();
    const r = analyzeBackfill(docs.plans, docs.glossaryText, docs.auditedLegacyIds);
    // 失敗時に具体 PLAN/term を出して直せるように
    expect({
      reverseOrphans: r.reverseOrphans,
      reverseLinkMissing: r.reverseLinkMissing,
      legacyAuditGaps: r.legacyAuditGaps,
      glossaryGaps: r.glossaryGaps,
    }).toEqual({
      reverseOrphans: [],
      reverseLinkMissing: [],
      legacyAuditGaps: [],
      glossaryGaps: [],
    });
  });
});
