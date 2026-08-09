---
plan_id: PLAN-L7-533-screen-rule-digest-reentry
title: "PLAN-L7-533 (add-impl): rule digest 差でも no-UI skip を再判定させる"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-09 デザインハーネスを進めること（#175 の申し送り消化）"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-SAPRULE-001
responsibility_owner: screen-applicability
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: removed
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "decision と no-UI receipt は reentry_trigger に scope_or_rule_digest_change を宣言し、L6 §1 も『scope/capability/rule 差で stale ＋ task 一件』と規定していた。しかし evaluateScreenReentry の signature には rule 入力が無く、判定は scope_digest 差だけだった。canonicalizeScreenScope は rule set を scope_digest に畳まないため、適用ルールだけの変更では再判定が起きない"
contract_postconditions: "evaluateScreenReentry が現行 rule digest を引数で受け取り、scope_digest 差と rule_digest 差のいずれでも stale ＋ 再判定 task を exactly-one 返す。trigger_digest は from/to の scope と rule を全て畳むため scope 差 trigger と rule 差 trigger は別 identity になる。L6 設計 §1 の signature 表と §3.2 の契約を実装と一致させる"
contract_invariants: "scope 差だけの既存経路（U-SAP-004）の**判定結果**は不変（ok/fail と failure code が変わらない）。ただし trigger_digest に from/to の rule digest を畳んだため、**identity のバイト値（trigger_digest / task_id）は変わる**。production 呼び出し側 0 件・永続化済み task 0 件のため影響は無いが、『既存挙動は完全に不変』とは主張しない。両方不変なら従来どおり HIL_SCREEN_RECEIPT_STALE で再入場しない。同一入力の再送は決定的同値（増分 0）"
contract_failures: "currentRuleDigest が空・sha256: 接頭辞なし・本体なしの場合は差分判定へ進まず HIL_SCREEN_APPLICABILITY_INVALID で fail-close する（不正 digest が『差がある』と誤解釈されて再入場が発火するのを防ぐ）"
tdd_red_required: true
red_at: "2026-08-09T14:48:37Z"
green_at: "2026-08-09T14:49:52Z"
mutation_oracle_evidence: "tests/screen-rule-reentry.test.ts に対する mutation 実測（vitest run --project fast）で 3/3 killed。(1) 差分条件から rule 差を落とす = killed、(2) currentRuleDigest の形式検査を外す = killed、(3) trigger_digest から from_rule_digest を落とす = **初回 survive**。redundant ではなく遷移元の束縛が緩むため、同一 receipt・同一遷移先で遷移元 rule だけ異なる 2 件が別 digest になることを固定する oracle を追加して killed にした。restore 後 exit 0。red は実装前の 5 件中 4 件 fail で確認済み（rule 差で再入場しない / trigger が潰れる / 決定的同値以前に判定不能 / 不正 digest が fail-close しない）"
complexity_effect: net_neutral
complexity_justification: "引数 1 個と形式検査 1 分岐、差分条件 1 項の追加。既存分岐の構造は変えていない"
removal_trigger: "scope_digest 自体が rule set を畳む設計へ移行し、rule 差が scope 差に含まれるようになった時"
parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_artifact: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAPRULE-001, test_path: tests/screen-rule-reentry.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 申し送りのうち宣言と実装の乖離を切り出す" }
  - { role: se, slot_label: "SE — rule 差を判定へ配線する" }
  - { role: qa, slot_label: "QA — 下流 gate が捕まえないことの確認と不正 digest の fail-close" }
  - { role: tl, slot_label: "TL — signature 変更の呼び出し側影響" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-533-screen-rule-digest-reentry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/screen-applicability-prototype.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/screen-rule-reentry.test.ts, artifact_type: test_code }
  - { artifact_path: src/design/screen-applicability.ts, artifact_type: source_module }
dependencies:
  parent: docs/plans/PLAN-L7-515-screen-applicability-cli.md
  requires:
    - docs/plans/PLAN-L7-532-screen-generated-identity.md
  references:
    - docs/design/helix/L5-detail/screen-applicability-prototype.md
  blocks: []
---

# PLAN-L7-533: rule digest 差でも no-UI skip を再判定させる

## §1 何が問題か

decision と no-UI receipt は `reentry_trigger: "scope_or_rule_digest_change"` を宣言し、L6 設計 §1 も
「scope/capability/rule 差で stale ＋ task 一件」と規定していた。しかし実装の
`evaluateScreenReentry` は `scope_digest` 差だけを trigger にしており、signature に rule 入力が無かった。

`canonicalizeScreenScope` が畳むのは snapshot 面（snapshot_id・capability_ids・phase・
public_surface_digest）だけで rule set を含まない。したがって**適用ルールだけが変わった場合、
既存の no-UI skip receipt は再判定されないまま有効であり続ける**。ルールが厳しくなって
本来 UI 扱いになるべき capability が、古い skip のまま素通りしうる。

下流の identity 照合はこの漏れを捕まえない。`evaluateScreenFreeze`
（`src/design/screen-applicability.ts:1028`）の `skip.rule_digest !== decision.rule_digest` と、
store の `commitStageClosureAndGate`（`src/design/screen-applicability-store.ts:561`）が返す
`no_ui_identity` は、skip と decision の**双方が同じ古い rule digest を持つ**ため一致してしまう。

## §2 実測による確認

実装前に probe で確認した事実は次の 2 点である。

1. `rule_set_digest` を変えても `canonicalizeScreenScope` が返す `scope_digest` は不変
2. その状態で `evaluateScreenReentry` は `HIL_SCREEN_RECEIPT_STALE`（= 再入場しない）を返す

## §3 工程表

### Step 1: red oracle の作成 [直列]

根拠: downstream_dependency（宣言と実装のどちらを正とするかを oracle で確定させる）。

### Step 2: 現行 rule digest を判定へ配線 → green [直列]

根拠: file_conflict（単一 module への集中編集）。

### Step 3: 設計 §1 signature 表と §3.2、L8 §8 の記述 [直列]

根拠: downstream_dependency（実装済み挙動を設計正本へ反映する）。

### Step 4: review Step（別 runtime 判定。Codex 使用中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（実装と設計記述が揃ってからでないと判定できない）。

## §3.1 実装計画

- `src/design/screen-applicability.ts`: `evaluateScreenReentry` に第 3 引数 `currentRuleDigest` を追加し、
  形式検査（`sha256:` 接頭辞と非空本体）を差分判定より前に置く。差分条件を
  「scope_digest 差 **または** rule_digest 差」へ広げ、`trigger_digest` に from/to の rule digest を畳む。
  digest 形式検査用の内部 helper `isSha256Digest` を追加する。
- `tests/screen-rule-reentry.test.ts`: U-SAPRULE-001 を新設する。
- 既存呼び出し側（`tests/screen-reentry.test.ts`、`tests/screen-generated-identity.test.ts`）は
  receipt が保持する `rule_digest` を渡す形へ更新する（既存 oracle の意味は変えない）。

## §4 signature 変更の影響範囲

`evaluateScreenReentry` の production 呼び出し側は 0 件である（現時点で本関数を呼ぶのは test だけ）。
`ScreenTransactionPortV1.staleForReentry` は commit 側の port であり本関数を経由しない。

## §4.1 identity バイト値の変化（review round1 Minor）

`trigger_digest` の構成に from/to の rule digest が入ったため、rule 不変・scope 差のみの既存経路でも
`trigger_digest` と `task_id` の**具体値**は変わる。判定結果（ok/fail と failure code）は不変であり、
production 呼び出し側が 0 件で永続化済みの再判定 task も存在しないため実害は無い。
「既存挙動は完全に不変」と書くと誤りになるため、contract_invariants の表現を判定結果に限定した。

## §5 本 PLAN の非対象

- `WALKTHROUGH_ITERATION_LIMIT` の policy 化（実害が出ておらず port / store の設計判断を伴う）
- 破損 DB fixture の spawn 統合テスト / `openHarnessDbReadOnly` 二段構成
- CI の `skill suggest` timeout flake（#93 側で Codex が担当）
- **再判定 task の実配線**: 本 PLAN は evaluator の判定を正すところまでである。rule 変更を検知して
  実際に再判定 task を発行・永続化する運用経路（誰が現行 rule digest を渡すか）は未配線であり、
  後続スライスで扱う。この境界を曖昧にしないため §4 に呼び出し側 0 件であることを明記した。
