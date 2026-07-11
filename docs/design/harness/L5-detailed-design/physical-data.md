---
layer: L5
sub_doc: physical-data
status: confirmed
pair_artifact: docs/test-design/harness/L8-integration-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_br: docs/design/harness/L1-requirements/business-requirements.md
next_pair_freeze: L8
plan: docs/plans/PLAN-L5-01-physical-data.md
v2_import: docs/migration/v2-import-ledger.md
---

> **SSoT 参照**: 論理モデル = [data.md](../L4-basic-design/data.md) (L4) / 実装 enum SSoT = `src/schema/index.ts` / 永続化方針 = `.helix/` YAML/JSON state + `.helix/harness.db` SQLite projection DB ([ADR-001](../../../adr/ADR-001-helix-harness-redesign-and-language.md))。本 doc は data.md §8 の論理 state schema を **物理 schema (フィールド型/必須任意/default/file レイアウト + projection table)** に詳細化する (D-DB)。
>
> **用語更新 (G.9) / 機能要求更新 (G.10) の所在**: per-工程 delta は生成元 [PLAN-L5-01](../../../plans/PLAN-L5-01-physical-data.md) の §6/§7 に記録 (L4 sub-doc と同規約)。
> **V-pair**: `pair_artifact = L8-integration-test-design.md` は L5 sub-doc 群の集合 pair (PLAN-L5-00-master 経由、L5↔L8)。

# HELIX-HARNESS — L5 詳細設計: 物理データ設計 (Physical-Data)

data.md (論理ドメインモデル) の §8 state schema を、`.helix/` YAML/JSON state と `.helix/harness.db` SQLite projection DB の **物理 schema** に詳細化する (PLAN-L5-01-physical-data)。各 file は `src/schema` の zod で読込時 validate し、projection DB は V-model 製本・別駆動 model run・trace/coverage/finding 照合に使う。

## §1 state file レイアウト

```
.helix/
├── plan_registry/<plan_id>.json          # Plan 集約 (本文は docs/plans/*.md)
├── artifact/
│   ├── <artifact_id>.json                # Artifact 集約
│   └── trace/<plan_id>.json              # trace edge list (双方向 12 edge)
├── phase.yaml                            # Workflow 集約 (現工程位置)
├── gate_runs/<gate_id>-<ts>.json         # gate 判定証跡 (append)
├── mode.yaml                             # 実行 mode (値オブジェクト)
├── audit/session-log.jsonl               # continuation source event (append-only)
├── audit/
│   ├── failure_log.jsonl                 # 監査 (append-only)
│   ├── agent-invocations/<ts>.json       # agent-guard 記録
│   └── *.jsonl                           # Evaluation (Phase B、invocation_log 等)
└── drive/<drive>/                        # drive 別区画 (FR-L1-40、be/fe/...)
    └── plan_registry/<plan_id>.json      # 区画隔離された Plan state
```

> `<ts>` = ISO8601 timestamp。`.helix/` の大半は gitignored (runtime state)。本文 doc (`docs/plans/*.md`) は git 追跡、registry JSON は state。

## §2 集約別 物理 schema (JSON フィールド)

### §2.1 Plan (`plan_registry/<plan_id>.json`)

| フィールド | 型 | 必須/任意 | default | 制約 / zod |
|---|---|---|---|---|
| `plan_id` | string | 必須 | — | PlanId パターン (§4)。primary key |
| `title` | string | 必須 | — | 1 文字以上 |
| `kind` | enum | 必須 | — | `kindSchema` (12 種) |
| `layer` | enum | 必須 | — | `layerSchema` (16 種) |
| `sub_doc` | enum\|null | 条件付き | null | design+L1-L6 で必須、`VALID_SUB_DOCS[layer]` (IMP-026) |
| `drive` | enum | 必須 | — | `driveSchema` (5 種、専門職のみ: be/fe/fullstack/db/agent。mode 値除去済 = PLAN-DISCOVERY-04 V7 / PLAN-REVERSE-01 R3。SSoT = data.md §3 / `src/schema/index.ts`) |
| `status` | enum | 省略可 | `"draft"` (運用既定) | `statusSchema.default("draft")` (draft/confirmed/completed/archived) |
| `workflow_phase` | enum\|null | 条件付き | null | kind=poc/reverse で必須、`workflowPhaseSchema` (10) |
| `decision_outcome` | enum\|null | 条件付き | null | kind=poc+S4 で必須、`decisionOutcomeSchema` (3) |
| `confirmed_reverse_type` | enum\|null | 条件付き | null | kind=reverse で必須、`reverseTypeSchema` (5) |
| `forward_routing` | enum\|null | 条件付き | null | reverse+R4 で必須、`forwardRoutingSchema` (5) |
| `promotion_strategy` | enum\|null | 条件付き | null | reverse+R4 で必須、`promotionStrategySchema` (4) |
| `agent_slots` | array<{role,slot_label}> | 任意 | `[]` | `agentSlotSchema` = {role:`roleSchema`, slot_label} のみ (frontmatter.ts 実装)。**model フィールドは持たない** — subagent の model 明示は agent-guard (別経路、`.claude/hooks/agent-guard.ts`) が管理。plan_registry に model を二重保存しない |
| `generates` | array<{artifact_path,artifact_type}> | 任意 | `[]` | artifact_type=`artifactTypeSchema` (19) |
| `dependencies` | {parent?,requires[],blocks[]} | 任意 | `{}` | 循環依存禁止 (§7) |
| `carry` | array<string> | 任意 | `[]` | child entity |
| `created`/`updated` | string(date) | 必須 | — | ISO date |

### §2.2 Artifact (`artifact/<artifact_id>.json` + `trace/<plan_id>.json`)

| フィールド | 型 | 必須/任意 | 制約 |
|---|---|---|---|
| `artifact_id` | string | 必須 | primary key |
| `artifact_type` | enum | 必須 | `artifactTypeSchema` (19) |
| `path` | string | 必須 | repo 相対 path |
| `pair_artifact` | string\|null | 任意 | V-model pair (6 組、§7) |
| `trace.edges` | array<{from,to,kind}> | 必須 | 双方向 12 directed edge (G7) |
| `acceptance_criteria` | array<{ac_id,...}> | 任意 | AcId パターン (§4) |
| `acceptance_tests` | array<{at_id,...}> | 任意 | AtId、AC↔AT 被覆 |

### §2.3 Workflow (`phase.yaml` + `gate_runs/`)

| フィールド | 型 | 必須/任意 | 制約 |
|---|---|---|---|
| `current_phase` | enum | 必須 | `layerSchema` (L0-L14) |
| `gates.<gate_id>.status` | enum | 必須 | `pending`/`passed`/`failed`/`bypassed` |
| `gates.<gate_id>.evidence` | string(path) | 任意 | `gate_runs/<gate_id>-<ts>.json` |
| (gate_runs file) `gate_id` | string | 必須 | GateId パターン (§4)。primary key |
| (gate_runs file) `timestamp` | string(ts) | 必須 | ISO8601、ファイル名 `<ts>` と一致 |
| (gate_runs file) `plan_id` | string\|null | 任意 | 関連 Plan への参照 (foreign key) |
| (gate_runs file) `checks` | array<{name,result}> | 必須 | 決定論 check 結果 (FR-05) |

### §2.4 mode (`mode.yaml`、値オブジェクト state)

| フィールド | 型 | 必須/任意 | 制約 |
|---|---|---|---|
| `mode` | enum | 必須 | `orchestrationModeSchema` (`VALID_ORCHESTRATION_MODES` 5 種) |
| `runtime` | object | 任意 | detect 結果 (claude/codex 検出、standalone/claude-only/codex-only/hybrid) |
| `drive` | enum\|null | 任意 | 既定 drive (`driveSchema`) |
| `updated` | string(ts) | 必須 | ISO8601 |

### §2.5 継続状態の読みモデル (`harness.db` + session log + bounded memory)

| フィールド | 型 | 必須/任意 | 制約 |
|---|---|---|---|
| `session_id` | string | 必須 | append-only event と projection の相関ID |
| `plan_id` | string\|null | 任意 | active PLANへの参照。proseから推測しない |
| `next_action` | string\|null | 任意 | DB projectionに保存された構造化次行動 |
| `event_seq` | integer | 必須 | session内単調増加。再投影の冪等key |
| `projected_at` | string(ts) | 必須 | DB projectionの鮮度根拠 |
| `memory_ref` | string\|null | 任意 | bounded breadcrumbへの参照。進捗SSoTではない |

物理不変条件: `handover/CURRENT.json` および同等の単一current prose fileを生成・読込しない。
crash後はappend-only eventを冪等 replayし、DB projectionを優先する。memory不一致はfindingにし、
memoryからDBをsilent overwriteしない。provider delegation evidence / operations transition recordは別schema・別lifecycleで保持する。

### §2.6 評価 (`audit/*.jsonl`、Phase B)

| フィールド | 型 | 必須/任意 | 制約 |
|---|---|---|---|
| `batch_id` | string | 必須 | primary key |
| `invocation_log` | array | 任意 | AI 呼び出し記録 (FR-L1-20、append-only) |
| `scores` | object | 任意 | accuracy_score / kpi (Phase B) |

### §2.7 SQLite 投影 DB (`harness.db`)

`harness.db` は legacy DB schema を流用せず、YAML/JSON state と docs を正規化して V-model feedback loop に使う projection DB。Bun runtime では `bun:sqlite` を第一候補とし、Node 互換が必要な adapter のみ `better-sqlite3` を検討する。

| table | primary key | 主な列 | 入力 |
|---|---|---|---|
| `plan_registry` | `plan_id` | `kind`, `layer`, `sub_doc`, `drive`, `status`, `parent`, `updated_at`, `decision_outcome`, `source_hash` | `docs/plans/*.md`, `.helix/plan_registry/*.json` |
| `artifact_registry` | `artifact_id` | `artifact_type`, `path`, `pair_artifact`, `status`, `updated_at` | docs/test-design、source catalog、trace state を保存する |
| `model_runs` | `run_id` | `runtime`, `model`, `role`, `drive`, `plan_id`, `started_at`, `completed_at`, `evidence_path` | Codex / Claude / worker / reviewer の execution evidence |
| `trace_edges` | `edge_id` | `from_artifact`, `to_artifact`, `edge_kind`, `plan_id`, `status` | artifact trace state |
| `coverage` | `coverage_id` | `scope`, `subject_id`, `metric`, `value`, `threshold`, `status` | test coverage / trace coverage / plan coverage を保存する |
| `findings` | `finding_id` | `kind`, `severity`, `subject_id`, `source`, `status`, `evidence_path` | doctor / vmodel lint / review findings を保存する |
| `gate_runs` | `gate_run_id` | `gate_id`, `plan_id`, `status`, `checked_at`, `evidence_path` | `.helix/gate_runs/*.json`, CI evidence |
| `session_events` / continuation projection | `(session_id,event_seq)` | `plan_id`, `event_kind`, `next_action`, `recorded_at`, `payload_hash` | append-only session log。DB read modelを再構成可能にする |

物理不変条件: `trace_edges` の orphan 0、`coverage.status=fail` の gate fail-close、`findings.status=open` の severity 別 gate 判定、`model_runs.plan_id` と `plan_registry.plan_id` の参照整合を doctor / vmodel lint が検証する。`plan_registry.source_hash` は PLAN markdown 全文の sha256 で、persisted `harness.db` と現在の `docs/plans/*.md` の fingerprint 不一致は `drive-db-registration` hard gate で stale として扱う。projection は自動生成だが、検出対象の機械 SSoT として扱い、入力 state との不一致は `findings` に保存する。

Telemetry provenance invariant（upstream A-146 / PLAN-L7-188）: 何かが "fired"、
"executed"、"was used"、"works" したと主張する telemetry table は、runtime provenance と
deterministic projection を区別しなければならない。`skill_invocations`、`test_runs`、
`guardrail_decisions`、`model_runs` が projection row だけを含む場合
(`runtime_rows=0` かつ `projection_rows>0`)、runtime-substance evidence として使えない。
runtime capture を配線中の間、default doctor はこれを partial migration state として表示してよいが、
verification-strategy close は projection-only telemetry を substance として扱ってはならない。
Runtime Claude/Codex session usage は doctor/readiness view 用に overlay してよい。一方で決定論的な
`db rebuild` は source projection のままであり、user runtime log は scan しない。Runtime `forced_stop`
session event は non-empty session provenance 付きで `guardrail_decisions` へ project され、
runtime `Bash (skill)` event は `source=runtime-hook:skill-suggest` 付きで `skill_invocations` へ
project される。generic shell event は skill / guardrail telemetry を捏造してはならない。

## §3 値オブジェクトの物理表現 + SubDoc zod 化 (IMP-026)

data.md §3 の 12 値オブジェクトは全て **enum string** で物理表現 (JSON では文字列)。

| 値オブジェクト | 物理表現 | src/schema 状態 |
|---|---|---|
| Kind/Layer/Drive/WorkflowPhase/ArtifactType/DecisionOutcome/PromotionStrategy/ForwardRouting/Role/OrchestrationMode/ReverseType | enum string | **実装済** (11 zod enum) |
| Status (lifecycle) | enum string (`VALID_STATUSES` 4 種) | **実装済** (data.md §5 lifecycle の物理) |
| **SubDoc** | enum string (層別) | **実装済** (`VALID_SUB_DOCS` / `subDocSchema` / layer×sub_doc superRefine、IMP-026) |

**SubDoc zod 化方針 (IMP-026 解消済み)** — 値域は **requirements §1.10.G.1 が SSoT** で、`src/schema/index.ts` / `src/schema/frontmatter.ts` に実装済み:
```
// src/schema/index.ts:
export const VALID_SUB_DOCS = {
  L1: ["business", "functional", "screen", "technical", "nfr"],              // 5
  L2: ["screen-list", "screen-flow", "wireframe", "ui-element"],             // 4
  L3: ["business-requirement", "functional-requirement", "nfr-grade"],       // 3
  L4: ["architecture", "function", "screen", "data", "external-if"],         // 5
  L5: ["internal-processing", "module-decomposition", "physical-data", "if-detail"], // 4
  L6: ["function-spec", "class-design", "edge-case"],                        // 3
} as const;
// subDocSchema + frontmatter superRefine で layer×sub_doc 整合を fail-close
```
> 値域の SSoT は requirements §1.10.G.1。本 doc は物理化 (zod 定数 + superRefine) を設計し、実装は L7 (`src/schema` 追加 + frontmatter.ts superRefine 拡張)。
> **⚠ 既存 doc との不整合 (IMP-029)**: 実在の L3 sub-doc frontmatter は `sub_doc: functional` / `business-detail` 等で、G.1 spec の `functional-requirement` / `business-requirement` と食い違う。IMP-026 実装時に既存 doc の `sub_doc` 値を G.1 へ正規化するか G.1 を実態へ合わせるかの decision が必要 (本 doc は G.1 を SSoT として記述)。

## §4 ID 採番 / index / 参照整合

| ID 型 | 物理パターン (regex) | 採番 | index |
|---|---|---|---|
| PlanId (**設計仕様**) | `^PLAN-L\d+-\d{2}-[a-z0-9-]+$` (層別) / `^PLAN-\d{3}-[a-z0-9-]+$` (cross) | 起票時 (layer×sub-doc 通し連番) | filename = plan_id |
| FrL1Id | `^FR-L1-\d{2}$` | 要求定義時 | registry 内 key |
| FrId | `^FR-\d{2}$` | L3 詳細化時 | — |
| AcId | `^AC-(FR\|NFR\|UX)-\d{2}-\d{2}$` 等 | AC 設計時 | artifact 内 |
| AtId | `^AT-.+$` | テスト設計時 | artifact 内 |
| ImpId | `^IMP-\d{3}$` | backlog 観測時 | backlog table |
| GateId | `^G\d+(\.\d+)?$` (G0.5-G14) | 固定 | phase.yaml key |

- **参照整合 (物理)**: 集約間は ID 文字列参照のみ (data.md §2)。孤児検出 = 参照先 file/key の存在確認 (`helix doctor`)。
- **採番衝突防止**: 同一 layer+sub_doc の status∉archived 2 重起票は plan lint で exit 1 (requirements §G.1)。
- **IMP-004 解消済み (2026-07-05 監査)**: `src/schema/frontmatter.ts` の `planIdSchema` は層別 `PLAN-L0..L14`、`DISCOVERY`、`REVERSE`、`RECOVERY`、`M` 系を受ける。`tests/plan-id-naming.test.ts` が全 PLAN の naming を検証し、旧 flat `PLAN-001` 系だけに閉じる実装 drift は残さない。

## §5 state file ↔ `src/schema` zod 1:1 対応

| state file | zod スキーマ (src/schema) | 検証タイミング |
|---|---|---|
| `plan_registry/*.json` (frontmatter 部) | `frontmatter.ts` (frontmatterBaseSchema + kind 別 superRefine) | PLAN 起票 / lint |
| 各 enum フィールド | `kindSchema`/`layerSchema`/`driveSchema`/... (index.ts、11) | 読込時 |
| sub_doc | `subDocSchema` (**実装済、IMP-026**) | 読込時 |
| status | `statusSchema` | 読込時 |
| `gate_runs/*.json` の command | `recommendedCommandV1Schema` | gate 実行時 |

> **読込原則**: state file は読込時に必ず zod で `parse` し、不正な state を早期 fail-close (ADR-001 enum drift 根絶)。書込時は型付きオブジェクト → JSON serialize。

## §6 drive 別区画 (FR-L1-40)

- 物理: `.helix/drive/<drive>/plan_registry/<plan_id>.json` (`<drive>` ∈ `VALID_DRIVES` 5 種)
- 隔離不変条件: 同一 plan_id が複数 drive 区画に存在 → fail-close (data.md §6、`helix doctor` 検出)
- `skip_sub_doc` 機械強制: drive×sub_doc 整合 (requirements §G.1: fe/fullstack/agent で L2/L10 skip → exit 1)

## §7 不変条件の物理検証点

| data.md §6 不変条件 | 物理検証点 | 実装 |
|---|---|---|
| 逆ピラミッド禁止 | artifact trace に design+impl あれば test_design+test_code edge 必須 | G6/G7 (trace file 検証) |
| pair = V-model 6 組 | `pair_artifact` ↔ `V_MODEL_PAIRS` 照合 | zod refine (実装済 enum) |
| **ペア未充足 = back-fill 未完の機械検知 (A-84)** | 設計 artifact に対し対のテスト設計 artifact が state に不在、または `placeholder_deps` 未解消 → fail-close。back-fill 完了まで error 継続 (V-model 最終整合=孤児0 を DB 側で保証、人手非依存) | **doctor / vmodel lint (L7)**、FR-L1-49 drift lint も同機構 (IMP-033 rule) |
| kind=poc → S0-S4 ∧ cross | frontmatter superRefine | **実装済** (frontmatter.ts) |
| kind=design+L1-L6 → sub_doc ∈ VALID_SUB_DOCS | frontmatter superRefine | **実装済** (IMP-026) |
| agent_slot.model allowlist | agent-guard (別経路) | **実装済** |
| 集約間参照整合 | doctor / lint hard gates (backfill、impl-plan-trace、tracked-canonical、dependency-drift、descent-obligation) | 実装済 |

> **back-fill の整合保証 (PO 確定 2026-06-01)**: 上位設計 (L4 等) が仕様未確定で対のテスト設計を書けない項目は Artifact に `placeholder_deps` (依存: どの層で何が確定したら書けるか) を持たせる。L6 機能設計で仕様確定 → テスト設計を back-fill → `placeholder_deps` 解消。最終形では **未解消の placeholder / pair edge 欠落は doctor が孤児として fail-close**し、V-model 状態が最終的に整う (孤児 0) ことを **DB(state) 側から機械保証**する。「入るべきところが入っていなければ DB 側からも検知」(PO)。現状: 専用 `placeholder-deps` doctor gate は `src/lint/placeholder-deps.ts` に実装済みで、stale な L7 待ち `placeholder_deps` を持つ active design/test-design docs は fail-close する。

## §8 carry → L7 実装

- **SubDoc zod 化** (IMP-026): `src/schema/index.ts` に `VALID_SUB_DOCS` + `subDocSchema` 追加、`frontmatter.ts` superRefine 拡張 (layer×sub_doc) + テスト実装済み
- **state 読込/書込 module**: `.helix/` file ↔ zod parse/serialize の実装 (architecture.md runtime/state)
- **doctor check_business_entity_coverage**: state file ↔ src/schema 齟齬検出の実装 (data.md §8 / L1 §10.2 carry)
- **`placeholder_deps` + ペア未充足検知** (A-84、PO back-fill 整合保証): Artifact schema に `placeholder_deps: array<{waiting_layer, waiting_spec}>` を追加し、doctor / vmodel lint で「設計 artifact に対の test_design artifact 不在 or `placeholder_deps` 未解消 → fail-close」を実装する。back-fill 完了で解消、V-model 最終整合 (孤児0) を DB 側で機械保証。FR-L1-49 drift lint と同じ IMP-033 rule engine に rule 型として登録。**Current status**: active design/test-design docs の L7 待ち `placeholder_deps` と旧「未実装」記述は `src/lint/placeholder-deps.ts` + doctor hard gate で fail-close 済み。**`waiting_layer` の2類型 (A-85 self-review I-3)**: ① **spec back-fill 型** (`waiting_layer` = 設計層、例 L6) = 対のテスト設計を*書く*のに上位仕様 (関数 signature 等) 確定待ち (例 ST-ASSET-04)。② **実装状態解消型** (`waiting_layer` = L7) = テスト設計は書けているが検証対象の状態が実装/コンテンツ整備で初めて materialize する (例 ST-ASSET-05 skill curate 完了 / ST-ASSET-07 guard→roster 切替)。**2類型認識の機械化 (IMP-107、2026-06-19)**: `src/lint/placeholder-deps.ts` が両類型を構造認識する — 型② (L7) の active doc 残存は **hard-fail** (repo は L7 到達済ゆえ解消されるべき)、型① (L1-L6) は item 単位の正当な carry でありうるため **検出数のみ surface** (band freeze ≠ item spec 確定、false-positive 回避)、未知 `waiting_layer` (L0-L14 外) は typo として hard-fail。**型①の threshold** (= IT-ASSET-07「waiting_layer 到達後の未解消 = failure」) は `descent-obligation` lint の impl-ahead 検査 (defer ledger: impl 未着地=deferred carry / 着地済+未 discharge=unmet 違反) が**正本担当**し重複させない。green message は「L7 waits=0 / spec-backfill waits=N [threshold=descent-obligation]」と coverage を明示し、「green = placeholder_deps 完全 fail-close」の誤読を塞ぐ。oracle U-PHDEPS-001..006。
- **物理 schema の object 型詳細** (agent_slots/generates/dependencies の入れ子型) は L7 実装時に zod object で確定
- evaluation_batch (Phase B) の物理 schema は Phase B telemetry 着手時に詳細化
## §9 Harness DB 参照 feedback projection (PLAN-L5-08)

PLAN-L5-08 は、SQLite を単なる storage ではなく reference-feedback mechanism として扱う user requirement に対し、不足していた L5 slice を追加する。DB は引き続き docs/state/logs の projection であり、governance docs の authoring source ではない。

外部根拠: SQLite FTS5 は external/contentless index pattern を support するため、`search_index` は primary content storage ではなく rebuildable projection として定義する。OpenTelemetry semantic conventions は logs/traces/metrics correlation のために attributes 付き named events を support する。W3C PROV は entity/activity/agent を中心に provenance を表現し、ここでは artifact/run/agent または skill へ対応づける。

### §9.1 projection table 拡張

| table | primary key | 必須列 | 目的 |
|---|---|---|---|
| `drive_runs` | `drive_run_id` | `plan_id`, `session_id`, `drive`, `mode`, `layer`, `kind`, `started_at`, `completed_at`, `status` | non-V-model mode を含む drive/model execution lane をすべて追跡する。 |
| `route_modes` | `route_mode_id` | `plan_id`, `drive_run_id`, `mode`, `drive`, `layer`, `kind`, `source`, `indexed_at` | `drive_runs.mode` を routing / workflow 監査用の first-class read model として投影し、mode 別検索・差分確認を drive run 本体から分離する。 |
| `hook_events` | `event_id` | `session_id`, `plan_id`, `hook_name`, `event_type`, `occurred_at`, `digest`, `evidence_path` | SessionStart/PostToolUse/Stop、gate、PLAN event を state projection へ join する。 |
| `skill_invocations` | `skill_invocation_id` | `session_id`, `plan_id`, `skill_id`, `layer`, `drive`, `fired_at`, `source`, `accepted` | 実際の skill firing event を永続化する。 |
| `skill_recommendations` | `skill_recommendation_id` | `session_id`, `plan_id`, `skill_id`, `rank`, `score`, `reason`, `recommended_at` | skill firing rate と recommendation quality の分母を永続化する。 |
| `feedback_events` | `feedback_event_id` | `finding_id`, `plan_id`, `signal_type`, `severity`, `status`, `next_action`, `created_at` | repeated findings と drift を replanning input へ変換する。 |
| `quality_signals` | `signal_id` | `source`, `subject_id`, `metric`, `value`, `threshold`, `status`, `computed_at` | orphan count、coverage、stale approval、gate-confirm coupling、schedule lint などの machine-check metrics を保存する。 |
| `search_index` | `search_id` | `subject_type`, `subject_id`, `path`, `title`, `tokens`, `summary`, `updated_at` | PLAN/artifact/finding/skill/model/session query の lookup cost を下げる。 |
| `workflow_runs` | `workflow_run_id` | `plan_id`, `drive_run_id`, `workflow`, `phase`, `ready_status`, `blocked_reason`, `human_required`, `checked_at` | workflow automation readiness を queryable かつ data-backed にする。 |
| `guardrail_decisions` | `guardrail_decision_id` | `plan_id`, `session_id`, `guardrail`, `decision`, `mode`, `human_signoff_required`, `evidence_path`, `decided_at` | agent-guard、review evidence、escalation、same-model approval check の safety decision を永続化する。 |
| `automation_assets` | `asset_id` | `asset_type`, `path`, `trigger`, `role`, `capability`, `drift_status`, `indexed_at` | skill/roster/command docs を automation input と search subject として catalog 化する。 |
| `loop_iterations` | `loop_iteration_id` | `plan_id`, `iteration`, `worker_provider`, `verifier_provider`, `verdict`, `stop_reason`, `blocked_reason`, `cost_usd`, `evidence_path`, `recorded_at` | P2 loop の iteration 証跡 (`.helix/state/loop/*.iterations.jsonl`) を projection し、hybrid 自己評価 (worker===verifier) を `verifier-provider-mismatch` doctor gate で機械検査可能にする (PLAN-L7-176/177 §4 carry、PLAN-L7-304)。 |

PLAN-L7-304 は、上記 `loop_iterations` の schema registry と `idx_loop_iterations_plan` を扱う L7 impl slice である。
PLAN-L7-305 は、既存 `loop-store` が出す iteration 証跡の JSONL rebuild 投影と
`verifier-provider-mismatch` doctor gate を扱う。runtime provider dispatch の変更は対象外とする。

§2.7 の既存 table は引き続き必須である。新しい row は、対応する source ID が存在する場合、既存の `plan_registry`、`artifact_registry`、`model_runs`、`findings`、`gate_runs` を参照しなければならない。join key 欠落は silent skip ではなく `findings` row にする。

### §9.2 skill/model 指標

Skill firing rate は chat memory ではなく永続化済み row から算出する。

- `skill_firing_rate = count(skill_invocations where fired) / count(skill_recommendations)`
- `skill_acceptance_rate = count(skill_invocations where accepted=true) / count(skill_invocations)`
- `model_selection_trace = model_runs.plan_id + drive_runs.drive_run_id + skill_recommendations.reason`
- `automation_readiness = workflow_runs.ready_status + open findings by plan/workflow + guardrail_decisions.decision`
- `guardrail_block_rate = count(guardrail_decisions where decision=block) / count(guardrail_decisions)`

DB は ID、reason、score、redacted summary だけを保存する。raw provider transcript、secret、credential、PII は対象外である。

### §9.3 indexes と invariants

必須 indexes:

- `idx_plan_layer_drive_status(plan_id, layer, drive, status)`
- `idx_trace_from_to(from_artifact, to_artifact)`
- `idx_findings_subject_status(subject_id, status, severity)`
- `idx_hook_session_plan(session_id, plan_id, occurred_at)`
- `idx_route_modes_plan_mode(plan_id, mode, drive_run_id)`
- `idx_skill_plan_skill(plan_id, skill_id, fired_at)`
- `idx_search_subject(subject_type, subject_id)`

不変条件:

- すべての `drive_runs`、`hook_events`、`skill_*`、`feedback_events`、`quality_signals` row は `plan_id` または `session_id` を持つ。
- すべての `workflow_runs`、`guardrail_decisions`、`automation_assets` row は source path または evidence path のいずれかを持ち、non-ready automation は closing finding なしに ready として現れない。
- すべての non-green lint/doctor/vmodel/gate result は `findings` と任意の `quality_signals` として表現できる。
- `search_index` は docs/state/logs から rebuild 可能であり、削除・再構築しても authoritative state は変わらない。

### §9.4 単体テスト evidence 履歴 projection (A-122 / IMP-109)

Phase 2 close review では、DB design が workflow、guardrail、skill、quality signal を既に project できる一方で、単体テスト固有の feedback question にはまだ答えられないことが分かった。Phase 4 DB implementation 開始前に、次の projection table を追加する。これらは derived data のままであり、authoring source は test files、PLAN artifacts、vitest/Bun output、CI logs、`.helix/` evidence である。

| table | primary key | 必須列 | 目的 |
|---|---|---|---|
| `test_cases` | `test_case_id` | `test_file`, `test_name`, `oracle_id`, `plan_id`, `fr_id`, `artifact_id`, `kind`, `first_seen_at`, `last_seen_at` | 各 unit-test oracle を PLAN/FR/artifact から query 可能にする。 |
| `test_runs` | `test_run_id` | `session_id`, `plan_id`, `command`, `runner`, `runtime`, `os`, `shell`, `started_at`, `completed_at`, `exit_code`, `evidence_path`, `output_digest`, `green_definition_id` | 実行済み quantitative test command を 1 件記録する。特に Bun/vitest/doctor/lint run を対象にする。`review_evidence.green_commands[]` は PLAN-local green command projection の frontmatter source である。 |
| `test_results` | `test_result_id` | `test_run_id`, `test_case_id`, `status`, `duration_ms`, `failure_digest`, `started_at`, `completed_at` | case/run 別に pass/fail/skip/todo を追跡する。 |
| `test_artifact_edges` | `edge_id` | `test_case_id`, `artifact_id`, `edge_kind`, `plan_id`, `source_path` | `trace_edges` を過負荷にせず、test evidence を V-model trace へ join し直す。 |
| `test_flake_events` | `flake_event_id` | `test_case_id`, `window`, `pass_count`, `fail_count`, `flake_score`, `computed_at`, `evidence_path` | unstable tests と duration regressions を quality signals として surface する。 |
| `runtime_verification_events` | `event_id` | `plan_id`, `requirement_id`, `test_oracle_id`, `claim`, `session_id`, `source`, `runtime_surface`, `correlation_id`, `evidence_path`, `occurred_at`, `redaction_policy`, `verification_class`, `accept_status` | L7.5 RUN & Debug runtime verification JSONL を deterministic dashboard 用の DB row へ project する。Projection-only または incomplete row は `accept_status=accepted` になれない。 |

必須 UT-derived metrics:

- `ut_oracle_coverage = count(test_cases where oracle_id is not null) / expected U-* oracle count by plan`.
- `ut_plan_green_rate = count(test_runs where plan_id=X and exit_code=0) / count(test_runs where plan_id=X)`.
- `ut_flake_score` は概念名であり、DB metric 名は `flake_score` とする。oracle 単位の pass/fail
  履歴揺れから算出し、plan scoped ID (`plan_id + oracle_id + window`) で `test_flake_events` に保存する。
  非 0 の flake は oracle 単位の `quality_signals(source=ut-history, metric=flake_score)` も作る。
- `duration_regression` は直近 duration と過去中央値の比率で算出し、aggregate signal に加えて
  原因 oracle の `quality_signals(source=ut-history, metric=duration_regression)` として保存する。
- `duration_trend_ms` は oracle/run 時点ごとの duration 観測点として
  `quality_signals(source=ut-history, subject_id=oracle:<plan_id>:<oracle_id>, metric=duration_trend_ms)` に保存する。
  `value` は duration ms、`threshold` はその時点より前の duration 中央値、`computed_at` は run completed_at
  とする。これにより専用 table / migration を増やさず、rebuild 可能な時系列 trend を query できる。
- `review_evidence.green_commands[].evidence_path` が structured JSON を指し、`cases[]` を含む場合、
  deterministic rebuild は既存 `test_runs` に紐づけて `test_cases` / `test_results` /
  `test_artifact_edges` を投影し、DB から unit-test history input を復元して `test_flake_events` /
  `quality_signals` / `feedback_events` へ接続する。2026-07-03 の PLAN-L7-240 以降は、同じ
  `evidence_path` で Vitest/Jest-compatible JSON reporter、Playwright JSON reporter、JUnit XML の
  最小 reporter artifact も正規化し、既存 table に投影する。parser は DB schema を増やさず、
  HTML / trace / coverage / attachment / 任意 XML 仕様全体は扱わない。
- `green_definition_compliance = every test_runs.green_definition_id resolves and every required command in that definition has exit_code=0`.
- `review_green_command_compliance = every 2026-06-23-or-later confirmed/completed review_evidence entry has at least one projected test_runs row with exit_code=0, evidence_path, and output_digest`.

現在の実装注記 (2026-06-30): `projectReviewEvidenceRegistry` は deterministic harness.db rebuild 中に
`review_evidence.green_commands[]` を projection-only evidence として `test_runs` へ project する。
`projectHookEvents` は、sanitized command target が recognized verification command
(`vitest`, `test`, `tsc`, `doctor`, `lint`, `eslint`) であり、row が non-empty `session_id` と
session JSONL `evidence_path` を保持する場合に限り、session-log `tool_use` event から runtime-provenance
`test_runs` row を追加 derivation してよい。General UT runner ingestion、flake history、duration regression projection は別の IMP-109 scope のまま残す。
L7.5 RUN & Debug append-only rows は `runtime_verification_events` へ project する。dashboard は generic
`test_runs` や projection-only telemetry row から runtime acceptance を推論せず、`verification_class` と
`accept_status` を直接読む必要がある。

実装制約:

- Bun は default execution runtime である。collector は利用可能な場合 Bun/vitest JSON output を読み、individual case data が無い場合は command/evidence digest へ fallback する。
- DB writes は core runtime で `bun:sqlite` を使う。External adapter は、同じ schema と rebuild semantics を維持する場合に限り compatibility layer を使ってよい。
- Raw provider transcripts、secrets、PII は挿入しない。`failure_digest` は persistence 前に redaction を適用した bounded digest とする。
- missing `plan_id`、unresolved `oracle_id`、green definition mismatch は `findings` row になり、silent drop しない。

### §9.5 Cross-artifact relation graph と diagram projection (A-124 / IMP-118..120)

DB は cross-cutting impact analysis を query 可能にしなければならない。authoring source は docs、source files、test files、PLAN frontmatter、audit records、logs、state files のままである。relation graph は rebuildable projection であり、「これが変わった場合、他に何を review / fix / test / redraw すべきか」に harness が答えるための read model である。

| table | primary key | 必須列 | 目的 |
|---|---|---|---|
| `graph_nodes` | `node_id` | `node_type`, `subject_id`, `section_id` (nullable), `path`, `name`, `layer`, `kind`, `status`, `source`, `indexed_at` | source files、modules、docs、PLANs、FR/AC/AT IDs、DB tables、tests、findings、diagrams を graph nodes へ normalize する。`section_id` は doc 内 section 粒度を保ち、impact expansion が section-level change を whole-doc node へ潰さないようにする (A-128 F-3 / IMP-129①)。 |
| `dependency_edges` | `edge_id` | `from_node_id`, `to_node_id`, `edge_kind`, `strength`, `source`, `evidence_path`, `is_expected`, `is_actual`, `indexed_at` | import/reference/test/projection/implementation edge を保存し、design-declared expected edge と observed actual edge を区別する。 |
| `impact_rules` | `impact_rule_id` | `trigger_edge_kind`, `trigger_node_type`, `required_node_type`, `required_action`, `severity`, `gate`, `enabled` | relation edge を required co-change、review、test、Reverse、diagram-refresh action へ変換する。 |
| `impact_results` | `impact_result_id` | `change_set_id`, `root_node_id`, `impacted_node_id`, `required_action`, `status`, `reason`, `evidence_path`, `computed_at` | diff/session/PLAN ごとの computed impact expansion を 1 件保存する。 |
| `artifact_progress` | `artifact_path` | `artifact_type`, `artifact_hash`, `state`, `color`, `linked_test_ids`, `linked_test_paths`, `linked_test_count`, `passed_test_run_ids`, `passed_test_run_count`, `dependency_checked`, `dependency_check_run_id`, `dependency_checked_at`, `dependency_check_source`, `open_dependency_impacts`, `recovery_plan_ids`, `reason`, `indexed_at` | rebuildable artifact progress color row を保存する。red は unchecked/open dependency impact、yellow は実装済みだが未検証または recovery 中、green は linked passing test run を持つ artifact を示す。 |
| `artifact_progress_events` | `artifact_progress_event_id` | `artifact_path`, `artifact_type`, `previous_color`, `color`, `state`, `trigger`, `test_run_ids`, `dependency_check_run_id`, `recovery_plan_ids`, `reason`, `occurred_at` | artifact progress row から導出した workflow trigger 用 rebuildable event view。 |
| `tool_runs` | `tool_run_id` | `tool_name`, `tool_version`, `command`, `input_scope`, `exit_code`, `started_at`, `completed_at`, `evidence_path` | dependency-cruiser、Knip、Madge、Graphviz、Mermaid、D2 などの optional adapter run を記録する。 |
| `diagram_artifacts` | `diagram_id` | `graph_snapshot_id`, `format`, `path`, `renderer`, `scope`, `created_at`, `evidence_path` | 生成された Mermaid/DOT/D2/SVG/PNG diagram output を traceable artifact として保存する。 |
| `graph_snapshots` | `graph_snapshot_id` | `scope`, `node_count`, `edge_count`, `hash`, `created_at`, `source_digest` | diagram と impact result を stable graph snapshot から再現可能にする。 |

現 L7 実装では、`rebuildHarnessDb` が repo scope の `graph_snapshots` から Mermaid / DOT / D2 の
標準 text export 行を `diagram_artifacts` へ射影する。Graphviz / D2 CLI で SVG/PDF/PNG 等を
生成する外部 renderer 実行、`visualizes` edge から diagram refresh action への接続は `IMP-148`
の継続 scope とする。`graph export --scope` の repo-relative filtering は PLAN-L7-244 で実装済み。
`dependency_edges.edge_kind` は PLAN-L7-245 で、内部 relation graph edge のうち `derives-from` を
`references`、`generates` を向き反転して `implements`、`covered-by` を向き反転して `tests`、
`behavioral-contract` を `declares_module` として投影する。`pairs` / `upstream`、`projects_to`、
`visualizes`、`impact_rules.trigger_edge_kind` との完全同期は `IMP-148` の継続 scope とする。

必須 edge kinds:

- `imports`: TS/JS import relation。
- `references`: Markdown/YAML/JSON path または ID reference。
- `declares_module`: design artifact が source module/building block を declare する。
- `implements`: source module が PLAN/FR/artifact を implement する。
- `tests`: test case/file が source module、artifact、FR、oracle を exercise する。
- `projects_to`: source doc/state/log が DB table へ project される。
- `visualizes`: diagram artifact が graph snapshot または scope を visualize する。

`artifact_progress` color semantics (FR-L1-51 / PLAN-L7-56 / PLAN-REVERSE-56):

- `red`: `dependency_checked = 0`、`open_dependency_impacts > 0`、または impact expansion 上、changed artifact に required design/requirement/test back-propagation が欠落している状態。これには "implementation exists but L1/L3/L4/L5 registration is missing" も含む。
- `yellow`: implementation または recovery work は存在するが、linked test evidence が無い、または linked passing `test_runs` row が無い状態。新しい artifact は dependency と test-run evidence が揃うまで yellow として projection に入る。
- `green`: `passed_test_run_count > 0`、`passed_test_run_ids` が passing `test_runs` rows を識別し、`dependency_checked = 1` かつ `open_dependency_impacts = 0`。
- `dependency_check_run_id` / `dependency_checked_at` は dependency state を正当化した relation-impact check を記録する。`dependency_checked=1` は "no rows" だけから推論しない。
- `recovery_plan_ids` は red/yellow artifact を green へ戻す active recovery/fullback/refactor PLAN を記録する。active recovery は red impact row を yellow recovering row に変えるが、closure には green test-run evidence と clean dependency impact が引き続き必要である。
- `feedback_events.source_table/source_id/source_color` は red/yellow `artifact_progress` row を workflow trigger input として記録し、recovery/reverse/refactor work を prose handover ではなく DB state から開始できるようにする。

必須 indexes:

- `idx_graph_node_type_subject(node_type, subject_id)`.
- `idx_graph_path(path)`.
- `idx_dependency_from_kind(from_node_id, edge_kind)`.
- `idx_dependency_to_kind(to_node_id, edge_kind)`.
- `idx_impact_change_status(change_set_id, status)`.
- `idx_artifact_progress_color(color, state)`.
- `idx_artifact_progress_tests(passed_test_run_count, dependency_checked)`.
- `idx_artifact_progress_events_path(artifact_path, occurred_at)`.
- `idx_feedback_source(source_table, source_id)`.
- `idx_tool_name_scope(tool_name, input_scope)`.
- `idx_diagram_scope_format(scope, format)`.

不変条件:

- すべての edge は existing `graph_nodes` を参照する。
- すべての non-local source change は、`impact_results` row または impact expansion が実行できなかった理由を説明する `findings` row のいずれかを生成しなければならない。
- expected-vs-actual mismatch は `findings` row になり、silent repair しない。
- diagram artifacts は `graph_snapshots` から derive される。diagram を削除しても graph state は削除しない。
- external tool output は gate use 前に normalize する。tool-specific JSON/DOT/Mermaid/D2 output は evidence であり、gate source of truth ではない。

Tool adapter profile:

- Core parser: TypeScript/Bun AST と Markdown/YAML scanner。これが default SSoT path である。
- Optional dependency rule/graph は `dependency-cruiser` を使う。
- Optional unused dependency/export/file detector は `knip` を使う。
- Optional circular graph helper は `madge` を使う。
- Optional renderers: 大きな SVG/PDF/PNG には Graphviz DOT、GitHub-readable Markdown diagram には Mermaid、presentation-quality architecture diagram には D2 を使う。

初期 impact rules:

- changed `src/**` node は、related design artifact、test/test-design artifact、reverse dependencies の review を要求する。
- changed design/test-design doc は paired V-model artifact と trace edge review を要求する。
- changed DB projection table は、その `projects_to` source docs/state/logs と dependent quality/impact queries の review を要求する。
- changed relation graph snapshot は、同じ scope の diagram artifacts を refresh するか stale として mark することを要求する。

### §9.6 MCP と external verification profile projection (A-125 / IMP-121..124)

A-125 は、externally installed MCP servers、plugins、test foundations で relation graph を拡張する。これらは authoring source ではない。environment-dependent な verification profiles であり、discovery、probe result、invocation、normalized findings を query 可能にする必要がある。

| table | primary key | 必須列 | 目的 |
|---|---|---|---|
| `mcp_server_profiles` | `mcp_profile_id` | `name`, `package_ref`, `source_url`, `transport`, `command`, `args_digest`, `allowed_tools`, `read_only`, `requires_network`, `requires_docker`, `requires_auth`, `risk_tier`, `enabled`, `source`, `indexed_at` | Playwright、GitHub read-only、filesystem-workspace、git-workspace、fetch、sqlite、Docker MCP gateway などの allowed MCP profile を catalog 化する。 |
| `mcp_profile_triggers` | `trigger_id` | `mcp_profile_id`, `signal`, `workflow`, `layer`, `gate`, `reason`, `enabled` | agent memory に依存せず、workflow signal を profile recommendation へ map する。 |
| `mcp_server_runs` | `mcp_run_id` | `mcp_profile_id`, `session_id`, `plan_id`, `command`, `method`, `tool_name`, `started_at`, `completed_at`, `exit_code`, `evidence_path`, `normalized_status` | MCP Inspector、profile probe、allowed MCP tool invocation を永続化する。 |
| `verification_profiles` | `verification_profile_id` | `name`, `profile_type`, `package_refs`, `requires_docker`, `requires_browser`, `requires_network`, `green_definition_id`, `trigger_signals`, `enabled` | Vitest browser + Playwright、Testcontainers、MSW などの external test foundation を catalog 化する。 |
| `verification_recommendations` | `verification_recommendation_id` | `change_set_id`, `plan_id`, `profile_id`, `profile_kind`, `reason`, `source_rule`, `accepted`, `created_at` | relation-graph impact expansion が変更に対して recommend した MCP/test profile を保存する。 |
| `external_tool_findings` | `external_finding_id` | `source_run_id`, `source_kind`, `finding_type`, `severity`, `subject_id`, `path`, `status`, `digest`, `created_at` | MCP、browser、container、mock/test profile output を gate-queryable findings へ normalize する。 |

必須 indexes:

- `idx_mcp_profile_name(name)`.
- `idx_mcp_triggers_signal(signal, workflow, gate)`.
- `idx_mcp_runs_profile_plan(mcp_profile_id, plan_id, started_at)`.
- `idx_verification_profile_type(profile_type, enabled)`.
- `idx_verification_recommendations_change(change_set_id, profile_kind, accepted)`.
- `idx_external_tool_findings_subject(subject_id, status, severity)`.

不変条件:

- すべての enabled MCP profile は allow-list と明示的な `risk_tier` を持つ。
- `requires_auth=true` の profile は、repo-tracked config だけでは enable できない。
- workspace filesystem/git profile は mount または repository path を workspace root に scope しなければならない。
- browser / Docker profile は available でなくても recommend されうる。absence は silent pass ではなく `findings` row になる。
- external command が実際に run した場合、`mcp_server_runs` と `verification_recommendations` は `tool_runs` (§9.5) または `test_runs` (§9.4) へ join する (cross-section reference を A-128 F-3 / IMP-129⑤ で明示)。
- gate decision は normalized profile/run/finding rows を使う。raw MCP output、screenshots、traces、logs は bounded evidence artifacts のまま残す。

初期 trigger rules:

- `ui_flow`, `web_target`, `browser_regression` -> `playwright-mcp` と `vitest-browser-playwright` を recommend する。
- `ci_failure`, `pr_review`, `backlog_sync` -> `github-mcp-readonly` を recommend する。write-capable GitHub profile は human approval を要求する。
- `db_integration`, `migration`, `service_contract` -> `testcontainers-node` と DB projection review を recommend する。
- `api_mock_gap`, `flaky_external_api` -> `msw` を recommend する。
- `mcp_server_added`, `mcp_profile_changed` -> accept 前に MCP Inspector `tools/list` smoke を要求する。

### §9.7 Canonical document export 投影 (A-126 / IMP-126)

A-126 は canonical HELIX document 向けに generated spreadsheet / Excel / PPTX conversion を追加する。これらの output は authoring source ではない。concept/planning docs、requirements、detailed design、PLAN、ADR、test-design、trace rows、normalized evidence links から derive される。

| table | primary key | 必須列 | 目的 |
|---|---|---|---|
| `document_export_profiles` | `document_export_profile_id` | `name`, `source_doc_family`, `format`, `renderer`, `package_ref`, `source_url`, `built_in`, `requires_package`, `requires_d2`, `enabled`, `risk_tier`, `trigger_signals` | canonical document family 向けの CSV、Markdown summary、XLSX、PPTX、D2-PPTX export profile を catalog 化する。 |
| `document_export_runs` | `document_export_run_id` | `profile_id`, `session_id`, `plan_id`, `source_doc_family`, `source_paths_digest`, `source_snapshot_hash`, `redaction_profile`, `started_at`, `completed_at`, `exit_code`, `evidence_path`, `normalized_status` | document conversion attempt 1 件と、それを build するのに使った source snapshot を記録する。 |
| `document_export_datasets` | `document_export_dataset_id` | `export_run_id`, `dataset_kind`, `row_count`, `column_digest`, `source_paths`, `source_section_digest`, `created_at`, `hash` | renderer output を再現・audit できるように、pre-render document matrix/deck dataset summary を永続化する。 |
| `document_export_artifacts` | `document_export_artifact_id` | `export_run_id`, `format`, `path`, `renderer`, `byte_size`, `hash`, `created_at`, `evidence_path`, `stale_status` | 生成された CSV/Markdown/XLSX/PPTX artifact metadata を traceable document conversion evidence として保存する。 |
| `document_export_triggers` | `trigger_id` | `document_export_profile_id`, `signal`, `workflow`, `layer`, `gate`, `reason`, `enabled` | export trigger signal (requirements §6.8.11 の `document_export_profile_changed` を含む) を export profile recommendation へ map する。これは `mcp_profile_triggers` と対称である (A-128 F-3 / IMP-129④)。 |

必須 indexes:

- `idx_document_export_profile_family(source_doc_family, format, enabled)`.
- `idx_document_export_run_family(source_doc_family, plan_id)`.
- `idx_document_export_run_snapshot(source_snapshot_hash)`.
- `idx_document_export_artifact_format(format, stale_status)`.
- `idx_document_export_triggers_signal(signal, workflow, gate)`.

不変条件:

- すべての export artifact は `document_export_run` を参照する。
- すべての export run は source document paths、source snapshot hash、redaction profile を持つ。
- built-in CSV / Markdown table export は external package なしで利用できる。
- XLSX / PPTX / D2-PPTX profile は renderer readiness が証明されるまで disabled とする。renderer availability 欠落は finding になる。
- export dataset は、存在する場合に source section IDs、FR/AC/AT IDs、PLAN IDs、ADR IDs、trace IDs、status fields、evidence links を保持する。
- export dataset は rendering 前に redacted される。raw provider transcripts、credentials、secrets、PII、raw MCP payloads、screenshots、browser traces は export rows に保存しない。
- generated files は evidence のみである。Canonical Markdown/docs は source of truth のまま残る。

初期 export profiles:

- `doc-csv-matrix`: requirements、design、PLAN、ADR、trace、test-design の matrix row。
- `doc-markdown-summary`: source link 付きの GitHub-readable conversion summary。
- `doc-xlsx-workbook`: ExcelJS または SheetJS optional renderer による multi-sheet workbook。
- `doc-pptx-deck`: PptxGenJS optional renderer による concept/requirements/design/ADR/PLAN/test-design deck。
- `doc-d2-pptx-diagram`: D2 optional renderer による graph/architecture/workflow diagram deck output。

### §9.8 Screen entity と FR/BR→screen trace projection (IMP-140)

IMP-140: 15 screens (PM/HM/GD) と FR/BR→screen trace は `screen-list.md` / `screen-requirements.md` doc source にだけ存在し、harness.db には無かった。この projection により、HM-04 (DB browse)、HM-01 (feature-list → screen-requirement)、PM-06 (design-doc viewer) を doc-only ではなく DB-driven にする。Screens は not-implemented である (NFR-08、src/web は Phase B)。

| table | primary key | 必須列 | 目的 |
|---|---|---|---|
| `screens` | `screen_id` | `name`, `category`, `url`, `l1_ref`, `status`, `implemented`, `indexed_at` | `screen-list.md` §1 から 15 screens を project する (画面 ID / 名 / カテゴリ / URL / L1 参照)。`implemented=0` / `status=not-implemented` (NFR-08)。 |
| `screen_trace` | `screen_trace_id` | `screen_id`, `requirement_id`, `requirement_kind`, `relation`, `source` | `screen-requirements.md` §5.5 から FR/BR/UX → screen reverse-trace edge を project する。`requirement_kind` ∈ {fr, br, ux}。DB から HM-01 feature-list → screen-requirement navigation を駆動する。 |

必須 indexes:

- `idx_screens_category(category, screen_id)`.
- `idx_screen_trace_screen(screen_id, requirement_kind)`.

不変条件:

- `screens` row count は screen-requirements §1 の declared count と一致する (15 = PM 6 + HM 8 + GD 1)。`doc-consistency` gate も同じ doc source を count する。
- すべての `screen_trace.screen_id` は `screens.screen_id` を参照する (orphan trace edge なし)。
- src/web (Phase B) までは `screens.implemented=0` とする。変更には NFR-08 implementation-truthfulness evidence が必要である。
- Source of truth は docs のままである。この projection は `helix db rebuild` で deterministic に rebuild される derived read model であり、別 authoring surface は持たない。
