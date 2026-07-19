---
plan_id: PLAN-L7-351-literal-policy-externalization
title: "PLAN-L7-351 (refactor): externalize-literal/policy 解消 slice — templates.ts managed-block 定数化と requirements-binding policy の判定（PLAN-L7-150 子 slice）"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-150 accepted debt 台帳の externalize-literal/policy 候補を behavior-invariant に解消する子 slice。配布 template のバイト列・policy 判定の意味は変更しない。"
owner: Claude (Fable)
parent_design: docs/process/modes/refactor.md
pair_artifact: tests/setup.test.ts
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - literal 定数化と policy 候補の判定"
  - role: tl
    slot_label: "TL - 配布 template バイト列不変の検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-351-literal-policy-externalization.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/template-markers.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: src/config/requirements-binding-policy.ts
    artifact_type: source_module
  - artifact_path: src/config/requirements-binding.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/requirements-binding-config.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
  references:
    - docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
    - docs/plans/PLAN-L7-166-setup-template-catalog-split.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T16:03:00+09:00"
    tests_green_at: "2026-07-06T16:03:00+09:00"
    verdict: approve
    scope: "managed-block / hook JSON literal の定数化、requirements-binding policy catalog 抽出、template byte manifest fence、起点 refactor feedback 3 件の actionable 解消。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/setup.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T16:00:22+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:c90354be8b471aab663eabc1a3f633d550a4657cddaa3f54d8b810e698f7e45e"
      - kind: unit_test
        command: "npx --no-install vitest run tests/requirements-binding-config.test.ts tests/projection-writer.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T16:00:50+09:00"
        evidence_path: tests/requirements-binding-config.test.ts
        output_digest: "sha256:ef2e9299001c630ccc195510d39828671fcba8a7069e8e5301476553853b6a55"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T16:01:34+09:00"
        evidence_path: src/config/requirements-binding.ts
        output_digest: "sha256:9c0b1515efef406881aeebdcea6c65af22d4ea6568b059d9e76628733ba4fbb4"
      - kind: smoke
        command: "npx --no-install tsx src/cli.ts db rebuild"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T16:02:02+09:00"
        evidence_path: src/setup/templates.ts
        output_digest: "sha256:68417e3c510ba0b7ba4040c05b160c79b5492b46326401a1f4d01b05272cfb10"
---

# PLAN-L7-351 (refactor): externalize-literal/policy 解消 slice

## 起点 signal

- feedback quality_signal（open、2026-07-06 実測 3 件）:
  - `refactor-candidate:externalize-literal:src-setup-templates.ts-literal:sha256:4b69611db37f`（13 回出現）
  - `refactor-candidate:externalize-literal:src-setup-templates.ts-literal:sha256:7111fbd12620`（13 回出現）
  - `refactor-candidate:externalize-policy:src-config-requirements-binding.ts-policy:sha256:39498a6e822a`
- いずれも PLAN-L7-150 台帳で `accepted_debt + attached_plan=PLAN-L7-150`。本 PLAN はその実行 slice。

## 0. 目的

`src/setup/templates.ts` の managed-block マーカー文字列（`<!-- HELIX:managed:start -->` /
`<!-- HELIX:managed:end -->`、各 13 回出現）と共通説明文を named constant へ外部化する。
あわせて `src/config/requirements-binding.ts` の externalize-policy 候補を「false positive として
台帳 close」か「catalog/config 外部化」かを判定して決着する（台帳の処置方針どおり）。

## 1. スコープ（Sonnet 実装手順、挙動不変）

### Step 1: templates.ts literal 定数化

1. `src/setup/template-markers.ts` を新設し、
   `HELIX_MANAGED_BLOCK_START` / `HELIX_MANAGED_BLOCK_END` / 共通説明文定数を定義。
2. `src/setup/templates.ts` の該当 literal をテンプレートリテラル参照へ置換。
3. fence: **配布 template の生成バイト列が不変**であること。改善前に全 template 出力の
   sha256 を記録し、置換後に全一致を確認（`tests/setup.test.ts` にスナップショット比較が
   無ければ digest 比較テストを追加）。

### Step 2: requirements-binding policy 候補の判定

1. `src/config/requirements-binding.ts` の検出根拠（policy 語彙 + 分岐 2 箇所）を読み、
   (a) 当該分岐が catalog/config へ外部化すべき運用可変点なら最小の設定境界へ抽出、
   (b) requirements-binding 自体が policy SSoT であり抽出先が無いなら **false positive として
   PLAN-L7-150 台帳の disposition を `resolved(false_positive)` へ更新**し、根拠を記録する。
2. どちらの場合も detector 側（projection-writer）の rule は変更しない。

### Step 3: 検証

1. `npx --no-install tsx src/cli.ts db rebuild` 後、`npx --no-install tsx src/cli.ts feedback list --emit` で対象
   externalize 候補 3 件が actionable から消える（または台帳 resolved と整合する）ことを確認。

## 2. 対象外

- template 内容・配布物の意味変更（バイト列不変が不変条件）。
- detector rule の変更。
- split-module 系（PLAN-L7-349 ほか別 slice）。

## 3. スケジュール（schedule steps）

- step 1 (mode: parallel): Step 1（literal）と Step 2（policy 判定）— 触るファイル独立、並列可。
- step 2 (mode: serial): Step 3（検証と台帳更新）。

## 4. 受入条件（falsifiable / 検証コマンド）

- 配布 template バイト列不変（改善前後の sha256 全一致を本文に記録）。
- `npx --no-install vitest run tests/setup.test.ts` green、`npm run typecheck` green。
- `npx --no-install tsx src/cli.ts doctor` に本 PLAN 起因の新規 fail なし。
- 実装着手時に `generates:` へ新設 module / test を追記（draft 時点は本 PLAN md のみ）。

## 5. carry（持ち越し）

- 他 module の literal 重複の横展開（detector の次回検出に委ねる）。

## 6. 実装記録（2026-07-06）

- Step 1: `src/setup/template-markers.ts` を新設し、managed block start/end、adapter 共通説明文、
  hook JSON の `"type": "command"` / `"timeout": 5` 行を定数化した。`src/setup/templates.ts` の配布
  template 生成内容は不変。
- Step 2: `src/config/requirements-binding.ts` は schema / parse / load の SSoT として残し、運用可変の
  policy/default catalog だけを `src/config/requirements-binding-policy.ts` へ分離した。これにより
  detector の `*-policy.ts` 既存 exemption と整合し、detector rule 自体は変更していない。
- Step 3: `PLAN-L7-150` 台帳の起点 3 件を `resolved` として `PLAN-L7-351` に接続した。

## 7. 検証証跡（2026-07-06）

- 配布 template manifest: `loadTemplates(process.cwd())` 50 件。before / after とも
  `sha256:d96cd383574639148525231b4b9b1df4a0f18fc783462189542be151be2f9a1b` で一致。
- 代表 template digest:
  - `adapter/AGENTS.md`: `sha256:61beb2e0a281fa655666e82c197e4d6ebbdc5b40551d1671d10a2b210bc672e9`
  - `adapter/.claude/settings.json`: `sha256:ff280e9812d758fe346d56728092b295462e56c25e03c89c1b3c3127e31703d8`
  - `adapter/.codex/hooks.json`: `sha256:65b9904b19d7402937d8bf701f89319555dd9ba698be11ab46cdea05b3ee38d6`
- `npx --no-install tsx src/cli.ts db rebuild`: exit 0、projection ok、rows 54194。
- `npx --no-install tsx src/cli.ts feedback list --emit`: 起点 3 件
  `refactor_candidate:externalize-literal`（`src/setup/templates.ts` high 2 件）と
  `refactor_candidate:externalize-policy`（`src/config/requirements-binding.ts` high 1 件）は actionable から消失。
  残存 actionable は `split-module` と、並行 PLAN の `src/lint/plan-entry-routing.ts` 由来
  `missing-test-coverage` であり、本 PLAN の対象外。
