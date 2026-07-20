/**
 * Plan frontmatter schema for HELIX (requirements_v1.2 §1.1 / §1.9 / §1.10 A).
 * §1 enum を単一正本 (./index) から合成し、§1.1 排他制約 / §1.1.parent_design /
 * charter(L0) を superRefine で fail-close 検証する。
 * 最終同期: requirements v1.2 §1.1-§1.1.排他制約 / §1.2.2 / §3.3 / §3.4
 *
 * 注: kind×drive matrix (§1.6) / 必須 role (§1.8) / dependencies.requires の
 * status=completed 検証 (§1.10 C-E) は cross-record / matrix lookup を伴うため
 * plan lint エンジン側 (将来 PLAN) で実装する。本 schema は単一 PLAN 内
 * (intra-record) の §1.1 制約に限定する。
 */
import { z } from "zod";
import {
  GREEN_COMMAND_KINDS,
  GREEN_COMMAND_RUNNERS,
  GREEN_COMMAND_SCOPES,
  greenCommandMatchesKind,
} from "./green-command";
import {
  artifactTypeSchema,
  decisionOutcomeSchema,
  driveSchema,
  forwardRoutingSchema,
  isValidSubDocForLayer,
  kindSchema,
  layerSchema,
  promotionStrategySchema,
  reverseTypeSchema,
  roleSchema,
  scrumTypeSchema,
  statusSchema,
  subDocSchema,
  workflowPhaseSchema,
} from "./index";

/**
 * §1.10 A plan_id 形式 (phase-aware + 駆動モデル legible): `PLAN-<token>-<NN>-slug`。
 * token = ① Forward 工程 = `L0`〜`L14` (該当工程、token↔layer 一致) / ② 横断駆動モデル = `DISCOVERY`(kind=poc) / `REVERSE`(kind=reverse) / `RECOVERY`(kind=recovery) (token↔kind 一致、layer=cross) / ③ `M` (master plan)。
 * 旧 `X`(cross) は駆動モデルを潰し ID から読めなかったため、駆動モデル名トークンへ置換 (option 1、PO 2026-06-01)。
 * NN = token 内 2 桁以上連番 (L7 等で 99 到達後は 100+ も許容、`\d{2,}`)、slug = kebab。**旧 flat `PLAN-001..004` は archived 別名前空間** (衝突しない)。
 * 狙い: ID 単体で 工程/駆動モデル + phase を判別 → state(DB) が phase↔PLAN を拾える。
 */
export const planIdSchema = z
  .string()
  .regex(/^PLAN-(L(?:[0-9]|1[0-4])|DISCOVERY|REVERSE|RECOVERY|M)-\d{2,}(-[a-z0-9-]+)?$/, {
    message:
      "plan_id は PLAN-<token>-<NN>-slug 形式 (token = L0〜L14 / DISCOVERY / REVERSE / RECOVERY / M、§1.10 A)",
  });

/** §1.10 A 駆動モデルトークン ↔ kind 対応 (横断駆動プランの ID legibility 正本) */
export const DRIVE_TOKEN_TO_KIND: Record<string, string> = {
  DISCOVERY: "poc",
  REVERSE: "reverse",
  RECOVERY: "recovery",
};

/** §1.8 agent_slots エントリ */
export const agentSlotSchema = z.object({
  role: roleSchema,
  slot_label: z.string().min(1),
});

const greenCommandEvidenceSchema = z
  .object({
    kind: z.enum(GREEN_COMMAND_KINDS),
    command: z.string().min(1),
    runner: z.enum(GREEN_COMMAND_RUNNERS),
    scope: z.enum(GREEN_COMMAND_SCOPES),
    exit_code: z.literal(0),
    completed_at: z.string().optional(),
    evidence_path: z.string().min(1),
    output_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/i),
  })
  .superRefine((cmd, ctx) => {
    // 退役前のBun receiptは記録を改変せず読めるようにする。新規採用可否はreview lintが時刻で判定する。
    if (cmd.runner === "bun") return;
    if (!greenCommandMatchesKind(cmd.kind, cmd.command)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["command"],
        message:
          "green_commands[].command must match green_commands[].kind (IMP-108 green command definition)",
      });
    }
  });

/** §1.1 generates エントリ (双方向 trace の起点) */
export const generatesEntrySchema = z.object({
  artifact_path: z.string().min(1),
  artifact_type: artifactTypeSchema,
});

/** PLAN-L6-65: L7実装PLANのL6設計・L8 oracle・生成testを同一tupleへ拘束する。 */
export const PLAN_SPECIFIC_ORACLE_ID_PATTERN =
  /^(?:U|IT)-[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3}[a-z]?$/;

export const verificationBindingSchema = z
  .object({
    parent_design: z.string().min(1),
    oracle_id: z.string().regex(PLAN_SPECIFIC_ORACLE_ID_PATTERN),
    test_path: z
      .string()
      .refine(
        (value) =>
          value === value.normalize("NFC") &&
          value.startsWith("tests/") &&
          !value.includes("\\") &&
          value
            .split("/")
            .every((segment) => segment !== "" && segment !== "." && segment !== ".."),
        "test_path はNFC正規化済みcanonical tests/** pathのみ",
      ),
  })
  .strict();

/** authority exemption解消を対象findingと機械結合する証拠。 */
export const resolvesAuthoritySchema = z
  .object({
    authority_path: z.literal("config/plan-specific-vpair-binding-authority.json"),
    fingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    target_plan_id: planIdSchema,
    reason: z.string().min(1),
  })
  .strict();

/** §1.9 dependencies */
export const dependenciesSchema = z.object({
  parent: z.string().nullable().default(null),
  requires: z.array(z.string()).default([]),
  blocks: z.array(z.string()).default([]),
  references: z.array(z.string()).default([]),
});

const sha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/i);
const carryEvidenceSchema = z
  .object({
    path: z.string().min(1),
    digest: sha256Schema,
  })
  .strict();
const carryGateRepassSchema = z
  .object({
    command: z.string().min(1),
    completed_at: z.string().datetime(),
    exit_code: z.literal(0),
    evidence_path: z.string().min(1),
    output_digest: sha256Schema,
  })
  .strict();
const leftArmCarryEntrySchema = z
  .object({
    carry_id: z.string().regex(/^CARRY-\d{3}$/),
    finding_kind: z.enum(["signature_mismatch", "api_contract_drift", "architecture_violation"]),
    summary: z.string().min(10),
    detected_at: z.string().datetime(),
    finding_evidence: carryEvidenceSchema,
    pushback_target: z
      .object({
        layer: z.enum(["L4", "L5", "L6"]),
        gate: z.enum(["G4", "G5", "G6"]),
      })
      .strict(),
    affected_artifacts: z.array(z.string().min(1)).min(1),
    resolution_plan_id: planIdSchema,
    gate_repass: carryGateRepassSchema,
  })
  .strict();
export const leftArmCarrySchema = z
  .object({
    schema_version: z.literal("left-arm-carry.v1"),
    decision: z.enum(["no_pushback", "pushback_resolved"]),
    assessed_at: z.string().datetime(),
    review_binding: z
      .object({
        reviewer: z.string().min(1),
        reviewed_at: z.string().datetime(),
        evidence_digest: sha256Schema,
      })
      .strict(),
    entries: z.array(leftArmCarryEntrySchema),
  })
  .strict();

/** §1.1 全 variant 共通フィールド (variant 固有制約は superRefine で fail-close) */
const frontmatterBaseSchema = z.object({
  plan_id: planIdSchema,
  title: z.string().min(1),
  kind: kindSchema,
  drive: driveSchema,
  status: statusSchema.default("draft"),
  layer: layerSchema.optional(),
  sub_doc: subDocSchema.optional(),
  master_hub: z.boolean().optional(),
  workflow_phase: workflowPhaseSchema.optional(),
  parent_design: z.string().optional(),
  decision_outcome: decisionOutcomeSchema.nullable().optional(),
  confirmed_reverse_type: reverseTypeSchema.optional(),
  scrum_type: scrumTypeSchema.nullable().optional(),
  forward_routing: forwardRoutingSchema.nullable().optional(),
  route_mode: z.string().min(1).optional(),
  entry_signals: z.array(z.string().min(1)).optional(),
  promotion_strategy: promotionStrategySchema.nullable().optional(),
  agent_slots: z.array(agentSlotSchema).min(1, "agent_slots は 1 件以上 (§1.8)"),
  generates: z.array(generatesEntrySchema).default([]),
  verification_bindings: z.array(verificationBindingSchema).optional(),
  resolves_authority: resolvesAuthoritySchema.optional(),
  /** PLAN-L6-70: L7 reviewで発見した左腕矛盾と再凍結証拠をfinding単位で結合する。 */
  left_arm_carry: leftArmCarrySchema.optional(),
  dependencies: dependenciesSchema,
  /** §6.8.2 Issue 起点スパイン: 解決対象 GitHub Issue 番号 (任意、Phase 0-B で recommended)。
   *  feature/hotfix branch の close 漏れ機械検知 + PR `Closes #NN` 連携に使う。 */
  github_issue_id: z.number().int().positive().nullable().optional(),
  backprop_decision: z.enum(["not_required"]).optional(),
  backprop_decision_reason: z.string().optional(),
  /** PLAN-DISCOVERY-09 version-up: 将来版へ保全 (deferred-but-committed-future) する PLAN のマーカー。
   *  status=draft でのみ有効 (landed には付与不可、Codex Critical: landing-time 除外禁止)。label は
   *  version-up ledger に照合する (forward-convergence.ts VERSION_UP_ALLOWED_TARGETS)。 */
  version_target: z.string().optional(),
  /** PLAN-L7-428: cutover分類のtyped authority。本文regexより優先する。 */
  irreversible_impact: z.enum(["none", "cutover", "migration"]).optional(),
  /** migration import trace reference (optional migration ledger path) */
  v2_import: z.string().optional(),
  /** review 前置エビデンス (requirements §7.8.7 / .claude/CLAUDE.md MUST、IMP-071)。
   *  design/impl/add-* PLAN が confirmed (gate/freeze 到達) に至る前に通した review を構造的に記録する。
   *  review_kind = cross_agent (hybrid) | intra_runtime_subagent (claude/codex 単体) | human (standalone/escalation)。
   *  機械強制 = doctor checkReviewEvidence (fail-close → hard)。freeze 後の増分追補も entry を append する
   *  (concept §2.1.2.1 の review tier と整合、review-skip の silent 化を機械で塞ぐ)。 */
  review_evidence: z
    .array(
      z.object({
        reviewer: z.string().min(1),
        review_kind: z.enum(["cross_agent", "intra_runtime_subagent", "human"]),
        reviewed_at: z.string().min(1),
        verdict: z.string().min(1),
        scope: z.string().optional(),
        /** test→review 順序強制 (IMP-077): 定量検証 (vitest/doctor/lint) が green になった時刻。
         *  `tests_green_at ≤ reviewed_at` (定量テスト→定性レビュー) が全駆動モデル普遍の不変条件
         *  (未検証成果物をレビューしない)。当初 optional、実 repo back-fill 後 presence hard。 */
        tests_green_at: z.string().optional(),
        green_commands: z.array(greenCommandEvidenceSchema).optional(),
        /** cross-review semantic 強制 (IMP-076): レビュー対象成果物を産出した model /
         *  reviewer の model。review_kind=cross_agent では両者 present かつ相異が必須
         *  (same_model_approval: forbidden、concept §2.1.2.1)。単体 runtime は相異 model を
         *  供給できないため cross_agent を僭称できない。intra_runtime_subagent/human は任意。 */
        worker_model: z.string().optional(),
        reviewer_model: z.string().optional(),
      }),
    )
    .optional(),
  /** PLAN-L7-89: 本 PLAN が誤記/誤った前提を訂正・無効化する先行 PLAN の plan_id 群 (errata back-link)。
   *  confirmed PLAN の主張が後で誤りと判明したとき、後継が `supersedes: [先行 plan_id]` を宣言し、
   *  先行 PLAN は本 PLAN の plan_id を訂正注記として持つ (双方向)。doctor plan-supersession が
   *  「宣言された supersede 先が実在 + 相互 back-reference 済」を fail-close 強制する (誤記の silent 放置を塞ぐ)。 */
  supersedes: z.array(z.string()).optional(),
});

/** layer=cross を取る横断駆動 kind (Discovery=poc / Reverse=reverse / Recovery=recovery) */
const CROSS_KINDS = new Set<string>(["poc", "reverse", "recovery"]);
/** workflow_phase (S/R) を取る kind (Scrum=poc S0-S4 / Reverse R0-R4)。recovery は phase を持たない */
const WORKFLOW_KINDS = new Set<string>(["poc", "reverse"]);

const custom = z.ZodIssueCode.custom;

/**
 * §1.1 排他制約 + §1.1.parent_design + charter(L0) + §1.10 E を fail-close 検証する frontmatter schema。
 */
export const legacyFrontmatterSchema = frontmatterBaseSchema.superRefine((fm, ctx) => {
  const isCrossKind = CROSS_KINDS.has(fm.kind);
  const isWorkflowKind = WORKFLOW_KINDS.has(fm.kind);

  if (isCrossKind) {
    // §1.1: 横断駆動 (poc/reverse/recovery) → layer は cross のみ
    if (fm.layer !== "cross") {
      ctx.addIssue({
        code: custom,
        path: ["layer"],
        message: `kind=${fm.kind} は layer=cross のみ許可 (§1.1)`,
      });
    }
    // §1.1: poc/reverse は workflow_phase 必須 / recovery は phase を持たない (禁止)
    if (isWorkflowKind && !fm.workflow_phase) {
      ctx.addIssue({
        code: custom,
        path: ["workflow_phase"],
        message: `kind=${fm.kind} は workflow_phase 必須 (§1.1)`,
      });
    }
    if (!isWorkflowKind && fm.workflow_phase) {
      ctx.addIssue({
        code: custom,
        path: ["workflow_phase"],
        message: `kind=${fm.kind} に workflow_phase は禁止 (§1.1)`,
      });
    }
  } else {
    // §1.1: 横断駆動以外 → 実 layer 必須 / workflow_phase 禁止
    if (!fm.layer || fm.layer === "cross") {
      ctx.addIssue({
        code: custom,
        path: ["layer"],
        message: `kind=${fm.kind} は実 layer 必須 (cross 不可、§1.1)`,
      });
    }
    if (fm.workflow_phase) {
      ctx.addIssue({
        code: custom,
        path: ["workflow_phase"],
        message: `kind=${fm.kind} に workflow_phase は禁止 (§1.1)`,
      });
    }
  }

  if (
    fm.kind === "design" &&
    !fm.master_hub &&
    fm.layer &&
    ["L1", "L2", "L3", "L4", "L5", "L6"].includes(fm.layer)
  ) {
    if (!fm.sub_doc) {
      ctx.addIssue({
        code: custom,
        path: ["sub_doc"],
        message: "kind=design + layer=L1-L6 は sub_doc 必須 (§1.10.G.1)",
      });
    } else if (!isValidSubDocForLayer(fm.layer, fm.sub_doc)) {
      ctx.addIssue({
        code: custom,
        path: ["sub_doc"],
        message: "sub_doc は layer 別 VALID_SUB_DOCS のみ (§1.10.G.1)",
      });
    }
  }

  // §1.10 A: plan_id の駆動トークン ↔ kind 一致 (横断駆動プランの ID legibility、fail-close)
  const driveTok = fm.plan_id.match(/^PLAN-(DISCOVERY|REVERSE|RECOVERY)-/)?.[1];
  if (driveTok && DRIVE_TOKEN_TO_KIND[driveTok] !== fm.kind) {
    ctx.addIssue({
      code: custom,
      path: ["plan_id"],
      message: `plan_id token=${driveTok} は kind=${DRIVE_TOKEN_TO_KIND[driveTok]} のみ (現 kind=${fm.kind}、§1.10 A)`,
    });
  }

  // §1.1: kind=poc → workflow_phase ∈ {S0..S4}
  if (fm.kind === "poc" && fm.workflow_phase && !fm.workflow_phase.startsWith("S")) {
    ctx.addIssue({
      code: custom,
      path: ["workflow_phase"],
      message: "kind=poc は workflow_phase ∈ {S0..S4} (§1.1)",
    });
  }
  // §1.1: kind=reverse → workflow_phase ∈ {R0..R4}
  if (fm.kind === "reverse" && fm.workflow_phase && !fm.workflow_phase.startsWith("R")) {
    ctx.addIssue({
      code: custom,
      path: ["workflow_phase"],
      message: "kind=reverse は workflow_phase ∈ {R0..R4} (§1.1)",
    });
  }

  // §3.5: kind=poc は scrum_type を S3 以降必須 (S0-S2 は null 可、6 種 = §3.2)
  if (
    fm.kind === "poc" &&
    (fm.workflow_phase === "S3" || fm.workflow_phase === "S4") &&
    !fm.scrum_type
  ) {
    ctx.addIssue({
      code: custom,
      path: ["scrum_type"],
      message: "kind=poc は workflow_phase S3 以降で scrum_type 必須 (6 種、§3.5 / §3.2)",
    });
  }

  // §1.1: kind=poc + S4 → decision_outcome 必須
  if (fm.kind === "poc" && fm.workflow_phase === "S4" && !fm.decision_outcome) {
    ctx.addIssue({
      code: custom,
      path: ["decision_outcome"],
      message: "kind=poc + S4 は decision_outcome 必須 (§1.1 / §1.2.2)",
    });
  }
  // §1.2.2: decision_outcome は S4 outcome 専用。S3 verified evidence を PO 決定済みに偽装しない。
  if (fm.kind === "poc" && fm.decision_outcome && fm.workflow_phase !== "S4") {
    ctx.addIssue({
      code: custom,
      path: ["decision_outcome"],
      message: "kind=poc の decision_outcome は workflow_phase=S4 専用 (§1.2.2)",
    });
  }
  // Discovery/Scrum の terminal 宣言は S4 decision 後のみ。S0-S3 の検証途中で confirmed/completed にしない。
  if (
    fm.kind === "poc" &&
    (fm.status === "confirmed" || fm.status === "completed") &&
    fm.workflow_phase !== "S4"
  ) {
    ctx.addIssue({
      code: custom,
      path: ["workflow_phase"],
      message:
        "kind=poc の confirmed/completed は workflow_phase=S4 + decision_outcome 後のみ (§1.2.2)",
    });
  }

  // §3.3: kind=reverse → confirmed_reverse_type 必須
  if (fm.kind === "reverse" && !fm.confirmed_reverse_type) {
    ctx.addIssue({
      code: custom,
      path: ["confirmed_reverse_type"],
      message: "kind=reverse は confirmed_reverse_type 必須 (§3.3)",
    });
  }
  // §3.4: kind=reverse + R4 → forward_routing / promotion_strategy 必須
  if (fm.kind === "reverse" && fm.workflow_phase === "R4") {
    if (!fm.forward_routing) {
      ctx.addIssue({
        code: custom,
        path: ["forward_routing"],
        message: "kind=reverse + R4 は forward_routing 必須 (§3.4)",
      });
    }
    if (!fm.promotion_strategy) {
      ctx.addIssue({
        code: custom,
        path: ["promotion_strategy"],
        message: "kind=reverse + R4 は promotion_strategy 必須 (§3.4)",
      });
    }
  }

  // §1.1.parent_design: kind=impl (L7) は parent_design 必須
  if (fm.kind === "impl" && !fm.master_hub && !fm.parent_design) {
    ctx.addIssue({
      code: custom,
      path: ["parent_design"],
      message: "kind=impl (L7) は parent_design 必須 (§1.1.parent_design)",
    });
  }

  // charter(L0): kind=charter は layer=L0 のみ (root, parent_design 不要)
  if (fm.kind === "charter" && fm.layer !== "L0") {
    ctx.addIssue({
      code: custom,
      path: ["layer"],
      message: "kind=charter は layer=L0 のみ (§1.3 / §2.1.1)",
    });
  }

  // PLAN-DISCOVERY-09: version_target (version-up parked) は status=draft のみ有効 (landed 除外禁止)
  if (fm.version_target && fm.status !== "draft") {
    ctx.addIssue({
      code: custom,
      path: ["version_target"],
      message:
        "version_target は status=draft のみ有効 (landed=confirmed/completed には付与不可、PLAN-DISCOVERY-09)",
    });
  }

  // §1.10 E: kind=add-* は dependencies.parent 必須 (null 不可)
  if ((fm.kind === "add-design" || fm.kind === "add-impl") && !fm.dependencies.parent) {
    ctx.addIssue({
      code: custom,
      path: ["dependencies", "parent"],
      message: "kind=add-* は dependencies.parent 必須 (§1.10 E)",
    });
  }

  // §1.1: kind=add-design は L3-L6 / kind=add-impl は L7 (§1.3 主な layer の fail-close 化、DISCOVERY 起票監査)
  if (fm.kind === "add-design" && fm.layer && !["L3", "L4", "L5", "L6"].includes(fm.layer)) {
    ctx.addIssue({
      code: custom,
      path: ["layer"],
      message: "kind=add-design は layer ∈ {L3,L4,L5,L6} (§1.3 設計追補、§1.1)",
    });
  }
  if (fm.kind === "add-impl" && fm.layer !== "L7") {
    ctx.addIssue({
      code: custom,
      path: ["layer"],
      message: "kind=add-impl は layer=L7 (§1.3 実装追補、§1.1)",
    });
  }
});

/**
 * 新規・更新PLANのauthoring入口。L13/L14はlegacy loaderでしか受理しない。
 * L0はcanonical layerではなくcharter anchorとしてkind=charterだけを例外受理する。
 */
export const currentAuthoringFrontmatterSchema = legacyFrontmatterSchema.superRefine((fm, ctx) => {
  if (fm.layer === "L13" || fm.layer === "L14") {
    ctx.addIssue({
      code: custom,
      path: ["layer"],
      message: `${fm.layer} はlegacy compatibility read専用。current authoringはL1-L12を使用する`,
    });
  }
  if (fm.layer === "L0" && fm.kind !== "charter") {
    ctx.addIssue({
      code: custom,
      path: ["layer"],
      message: "L0は層外charter anchor専用。current PLAN layerとして使用しない",
    });
  }
});

/** @deprecated 既存consumer互換。新規authoringはcurrentAuthoringFrontmatterSchemaを明示使用する。 */
export const frontmatterSchema = legacyFrontmatterSchema;

export type Frontmatter = z.infer<typeof legacyFrontmatterSchema>;
export type CurrentAuthoringFrontmatter = z.infer<typeof currentAuthoringFrontmatterSchema>;
