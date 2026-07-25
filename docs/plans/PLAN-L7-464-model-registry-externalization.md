---
plan_id: PLAN-L7-464-model-registry-externalization
title: "PLAN-L7-464 (refactor): model registry (ID/単価/標準effort) の外部化と Opus 5 追随"
kind: refactor
layer: L7
drive: agent
status: confirmed
route_mode: refactor
entry_signals:
  - "po_directive:2026-07-25 モデル設定とエフォート設定を外部化してモデル更新時の変更を楽にする"
created: 2026-07-25
updated: 2026-07-25
owner: Claude
engineering_discipline_required: true
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
backprop_decision: not_required
backprop_decision_reason: "既存の model SSoT (PLAN-L7-65/309) と標準 effort registry (PLAN-L7-310/311) の値の置き場所を JSON へ外部化する behavior-preserving refactor。新規 L1/L3 要求は追加しない。"
behavior_contract_id: U-MREG-001..004
responsibility_owner: src/schema/model-registry.ts (parseModelRegistry)
no_code_decision: modify
ddd_modeling_decision: none
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
contract_preconditions: "RAW_MODEL_REGISTRY は 5 セクション (modelIds/claudePricing/openaiPricing/familyStandardEffort/exactModelStandardEffort) を持つ object である。"
contract_postconditions: "parseModelRegistry は検証済みの MODEL_IDS / CLAUDE_PRICING / OPENAI_PRICING / FAMILY_STANDARD_EFFORT / EXACT_MODEL_STANDARD_EFFORT を返し、再 export 経路 (model-policy/model-effort/token-tracker) は外部化前と同一の値・型・参照を保つ。"
contract_invariants: "opus 帯以外の全 registry 値は外部化前と不変。model ID の正本定義は本 module 1 箇所のみ (model-policy.ts / tier-router.ts に生 literal を残さない)。"
contract_failures: "section 欠落・effort enum 外・非数値単価・空 id・空 section・cached 型不正は fail-closed で throw し (U-MREG-004)、壊れた registry を silent 受理しない。repository state は変更しない。"
complexity_effect: net_neutral
complexity_justification: "散在していた 5 テーブルを単一 TS module へ集約し fail-closed loader 1 本を追加。既存 export は再 export で維持し consumer/test の import を不変に保つ。分岐・新 detector は増やさない。"
removal_trigger: "モデル registry の SSoT は本 module に一元化済み。将来 client.models.retrieve のライブ単価連携を入れる場合は loader を差し替える。"
tdd_red_required: false
mutation_oracle_required: false
agent_slots:
  - role: se
    slot_label: "SE - registry 外部化 loader と re-export 配線"
  - role: qa
    slot_label: "QA - fail-closed 検証と boundary/回帰整合"
generates:
  - artifact_path: docs/plans/PLAN-L7-464-model-registry-externalization.md
    artifact_type: markdown_doc
  - artifact_path: src/schema/model-registry.ts
    artifact_type: source_module
  - artifact_path: tests/model-id-ssot.test.ts
    artifact_type: test_code
  - artifact_path: src/team/model-policy.ts
    artifact_type: source_module
  - artifact_path: src/team/model-effort.ts
    artifact_type: source_module
  - artifact_path: src/state-db/token-tracker.ts
    artifact_type: source_module
  - artifact_path: src/lint/agent-model-ssot.ts
    artifact_type: source_module
  - artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts
    artifact_type: source_module
  - artifact_path: docs/governance/feedback-refactor-disposition.json
    artifact_type: json_config
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/fe-lead.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pdm-tech-innovation.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pdm-marketing-innovation.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pdm-innovation-manager.md
    artifact_type: markdown_doc
  - artifact_path: tests/model-registry.test.ts
    artifact_type: test_code
  - artifact_path: tests/model-effort.test.ts
    artifact_type: test_code
  - artifact_path: tests/tier-router.test.ts
    artifact_type: test_code
  - artifact_path: tests/team-run.test.ts
    artifact_type: test_code
  - artifact_path: tests/pair-agent.test.ts
    artifact_type: test_code
  - artifact_path: tests/effort-observation.test.ts
    artifact_type: test_code
  - artifact_path: tests/team-launch-policy.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-65-deterministic-model-policy.md
  requires:
    - docs/plans/PLAN-L7-65-deterministic-model-policy.md
    - docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
    - docs/plans/PLAN-L7-452-source-boundary-policy-ratchet.md
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-25T09:14:45+09:00"
    tests_green_at: "2026-07-25T09:14:40+09:00"
    verdict: approve
    scope: "intra_runtime code-reviewer が src correctness を 5 軸で approve (2026-07-25T05:59、Critical/Important ゼロ、再 export の値・型・参照不変 U-MREG-002 / fail-closed U-MREG-004 / module-boundary 既存 exception 内)。その後 cross-runtime (Codex) review が『モデル更新は 1 ブロックで完結』の over-claim を検出したため、本 revision で PLAN §0 scope 限界・§3 受入条件・model-registry.ts コメントを『TypeScript consumer SSoT に限定、.claude/agents/*.md は同期必須の静的 projection』へ是正 (errata)。corrected tree で tsc green・targeted 120 green・plan lint green を fresh 再確認 (2026-07-25T09:14)。cross-runtime 最終判定は Codex exact-HEAD 再レビューに委ねる。"
    worker_model: claude-opus-4-8
    reviewer_model: claude-sonnet-5
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/model-registry.test.ts tests/model-effort.test.ts tests/agent-model-ssot.test.ts tests/tier-router.test.ts tests/team-run.test.ts tests/pair-agent.test.ts tests/effort-observation.test.ts tests/team-launch-policy.test.ts tests/token-tracker.test.ts tests/source-boundary-integration.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-25T09:14:23+09:00"
        evidence_path: tests/model-registry.test.ts
        output_digest: "sha256:6239f2d58a8852f03ef84b331bc6ad6103d8c9c6bdb2887acaf2956427932d65"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-25T09:14:30+09:00"
        evidence_path: src/schema/model-registry.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-464-model-registry-externalization.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-25T09:14:35+09:00"
        evidence_path: docs/plans/PLAN-L7-464-model-registry-externalization.md
        output_digest: "sha256:2bbc8975c39beef8b31c032606a0dc29d589d01017f0eb420d363622d4e17c67"
---

# PLAN-L7-464: model registry 外部化と Opus 5 追随 (refactor)

## 0. 目的

PO ルール (2026-07-25):「モデル設定とエフォート設定とかを外部化してモデル更新時の変更を楽に
したい」。散在していた model ID / 単価 / 標準 effort の 5 テーブルを単一 TS module へ集約し、以後の
モデル更新のうち **TypeScript consumer 側 (model-policy / model-effort / token-tracker / tier-router と
その利用 test) を config 1 ブロックの編集で完了**できるようにする (再 export のため consumer/test の
コード・import 変更を伴わせない)。あわせて Opus 5 リリースに追随し、opus 帯 model ID と標準 effort を
config 値として更新する。

**scope 限界 (over-claim 是正)**: 本 PLAN の「1 ブロックで完結」は **TypeScript consumer SSoT に限定**する。
`.claude/agents/*.md` frontmatter の `model:` は本 registry から導出されない**同期必須の静的 projection**であり、
model ID 更新時は registry 編集に加えて当該 manifest の手動同期が必要 (`agent-model-ssot` が drift を
fail-close で強制)。この静的 projection を registry から自動導出して手動同期を無くす generator は
**別原子的 PLAN/PR** で扱い、本 PLAN の scope 外とする。

## 1. スコープ

- **外部化正本**: `src/schema/model-registry.ts` の `RAW_MODEL_REGISTRY` 1 ブロックに 5 セクションを集約する。
  - `modelIds` (roster、MODEL_IDS の実体) / `claudePricing` / `openaiPricing` /
    `familyStandardEffort` / `exactModelStandardEffort`。
  - **TypeScript consumer 側のモデル更新はこの 1 ブロックの編集で完結**する (再 export のため consumer/test の
    import は不変、散在 literal を編集して回らない)。**agent manifest (`.claude/agents/*.md`) の `model:` は
    別途手動同期が必要な静的 projection**であり本 1 ブロックには含まれない (§0 scope 限界を参照)。
- **検証**: 同 module が `parseModelRegistry` で `RAW_MODEL_REGISTRY` を schema 検証・**fail-closed** に
  throw し (effort enum 外 / 非数値単価 / 空 section 等)、検証済みの 5 定数を export する。
- **データ形式の根拠**: データは JSON でなく **TS const** で持つ。`src/` 配下は runtime-portability policy が
  非 TS ファイルを禁じ (`core-non-typescript-file`)、かつ esbuild single-bundle では外部 JSON の runtime
  path 解決が壊れるため、TS const が唯一 portable かつ bundler-safe な externalization である。
- **配置根拠**: roster を使う `team` と単価を使う `state-db` の双方が module-boundary policy
  (PLAN-L7-452) 上 import できる共通 foundational owner が `schema` であるため `src/schema/` に置く
  (state-db→team は deny のため team には置けない)。
- **再配線**: `src/team/model-policy.ts` (MODEL_IDS) / `src/team/model-effort.ts`
  (FAMILY_STANDARD_EFFORT・EXACT_MODEL_STANDARD_EFFORT) / `src/state-db/token-tracker.ts`
  (CLAUDE_PRICING・OPENAI_PRICING) は loader を再 export し、既存 import を不変に保つ。
- **scraper 修正**: `src/lint/agent-model-ssot.ts` は model-policy.ts の text-scrape をやめ、
  検証済み `MODEL_IDS` (`src/schema/model-registry.ts`) を直接 import して roster を得る。
- **governance doc 同期**: `.claude/CLAUDE.md` の family 標準 effort 記述を opus=medium へ是正する。
- **Opus 5 追随 (registry 値)**: `modelIds.claude.opus` = `claude-opus-5`、
  `familyStandardEffort.opus` = `medium` (sonnet と同帯へ是正)、`claudePricing` に
  `claude-opus-5` ($5/$25) 追加 (旧 `claude-opus-4-8` は歴史 usage 計算のため残置)。
- **agent override 撤去**: opus subagent 4 件 (fe-lead / pdm-tech-innovation /
  pdm-marketing-innovation / pdm-innovation-manager) の `model` を `claude-opus-5` にし、冗長な
  `effort: high` 明示行を撤去 (registry 標準 medium を継承)。

## 2. 対象外

- fable (`advisor-fable`) の標準 effort は high 維持。sonnet 系 agent の明示 `effort: high` も対象外。
- ライブ単価連携 (client.models.retrieve) は後続 (removal_trigger 参照)。
- 任意 model-id 文字列を fixture に使うテスト (review-evidence / guardrail-invariant-advisory /
  projection-writer / doctor 等) は MODEL_IDS 解決に非結合のため不変。

## 3. 受入条件

- `parseModelRegistry` が破損 registry (section 欠落 / effort enum 外 / 非数値単価 / 空 id / 空 section /
  cached 型不正) を fail-closed で throw する (U-MREG-004)。正常 config で opus=opus-5 / opus 標準
  effort=medium / opus-5 単価が取れる (U-MREG-001)。再 export 経路が正本と同一参照 (U-MREG-002)。
- 既存 coupled oracle (U-EFFORT-002/006, U-TIER-005, U-EFF-003/004, U-TEAMRUN-003) が新値で green。
- `agent-model-ssot` が外部化後も全 agent frontmatter を roster に解決し drift 0。
- **claim 正確性 (over-claim 是正)**: PLAN/PR/コメントの「1 ブロックで完結」記述が **TypeScript consumer SSoT に
  scope 限定**され、`.claude/agents/*.md` の `model:` を同期必須の静的 projection として明記していること
  (agent manifest 自動導出 generator は別 PLAN/PR)。
- module-boundary (PLAN-L7-452) 違反 0 (IT-SBOUND-005 green)。
- 型検査 (`tsc --noEmit`)・対象単体テスト・`helix plan lint`・`helix doctor` (db rebuild 後の
  change-set-integrity / agent-model-ssot / source-boundary 各ゲート) がいずれも成功する。

## 4. carry (持ち越し)

- モデル更新の運用手順: TypeScript consumer 側は config 1 ブロック編集で完了し、あわせて
  `.claude/agents/*.md` の `model:` 静的 projection を手動同期する (agent-model-ssot が drift を強制)。
- agent manifest を registry から自動導出し手動同期を撤廃する generator は別原子的 PLAN/PR で扱う。
- ライブ単価連携 (client.models.retrieve) は別 PLAN。
