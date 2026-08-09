---
plan_id: PLAN-L7-532-screen-generated-identity
title: "PLAN-L7-532 (add-impl): screen 系の生成 identity を digest 全長の単射導出にする"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-09 デザインハーネスを進めること（#175 の申し送り消化）"
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-SAPID-001
responsibility_owner: screen-applicability
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retired
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "#175 の計画スライス（PLAN-L7-510〜515）は全て merge 済み。src/design/screen-applicability.ts は 9 箇所で source digest を `.slice(7, 19)`（12 hex = 48 bit）へ切り詰めて identity を生成しており、identity は DB key と重複判定の正本として使われている"
contract_postconditions: "9 箇所すべての生成 identity が source digest hex を全長で埋め込む単射導出になる。L6 設計 §3.1 に invariant を明文化し、U-SAPID-001（3 経路の behavioral 検査）と U-SAPID-002（module 全体の source backstop）で固定する"
contract_invariants: "非衝突ケースの外部挙動は identity 文字列の長さ以外変わらない（決定性・冪等性・既存 oracle 180 件は不変）。identity の可読性のための短縮は表示側の責務とし、identity 自体では行わない"
contract_failures: "切り詰め導出の再導入を U-SAPID-001（behavioral、3 経路）と U-SAPID-002（source backstop、module 全体）で fail-close する。U-SAPID-002 は module を読めていない場合に空振り green にならないよう export 存在確認を伴う"
tdd_red_required: true
red_at: "2026-08-09T14:01:06Z"
green_at: "2026-08-09T14:02:02Z"
mutation_oracle_evidence: "3/3 killed（実測）。(1) reentry task_id を .slice(7, 19) へ戻す = killed（U-SAPID-001 の behavioral 比較）、(2) plan route operation_id を戻す = killed（同）、(3) **behavioral に未カバーの** agreement_id を戻す = killed（U-SAPID-002 の source backstop）。restore 後 exit 0 を確認済み。sha256 の実衝突は構成できないため oracle は衝突事例ではなく導出の単射性を観測しており、この設計上の限界は L8 テスト設計 §7 に明記する"
complexity_effect: net_negative
complexity_justification: "`.slice(7, 19)` 9 箇所を `.slice(7)` へ置換し、識別子長の恣意的な定数（19）を除去した。分岐も型も増えていない"
removal_trigger: "identity を digest 由来ではない採番（例 ULID + digest 参照）へ移行し、単射性が採番側で保証されるようになった時"
parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_artifact: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAPID-001, test_path: tests/screen-generated-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAPID-002, test_path: tests/screen-generated-identity.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #175 申し送りのうち実害のある 1 件を切り出す" }
  - { role: se, slot_label: "SE — 9 箇所の identity 導出を単射化する" }
  - { role: qa, slot_label: "QA — 衝突を作れない前提での oracle 設計と mutation 実測" }
  - { role: tl, slot_label: "TL — source backstop を behavioral oracle の代用にしない境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-532-screen-generated-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/screen-applicability-prototype.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/screen-generated-identity.test.ts, artifact_type: test_code }
  - { artifact_path: src/design/screen-applicability.ts, artifact_type: source_module }
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T14:12:00Z"
    tests_green_at: "2026-08-09T14:13:34Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLI は他レーンで使用中のため規定代替の intra_runtime_subagent（claude-sonnet-5, read-only）が判定した。approve（Critical 0 / Important 1 / Minor 1）。**観点3（identity 長 12→64 hex で壊れる呼び出し側）**: reviewer は harness-db-tables-screen.ts の列定義に長さ制約が無いこと、生成 prefix 9 種のハードコード参照と固定長 regex が 0 件であること、duplicate_gate 判定（screen-applicability-store.ts:483 / screen-applicability-sqlite-store.ts:229）が純粋な文字列一致であることを確認し、壊れる呼び出し側は検出されなかった。PLAN §1 の実害主張は過大主張ではなく実コードで裏付くと判定。未確認として screen_decisions / prototype_tasks の実 PK 制約と既存 harness.db 内の 12-hex 既存データを挙げたが、本 fix は衝突リスクを下げる方向にしか作用しないため blocking ではないとした。**Important 1 件**: screen 系以外に同クラスの切り詰め identity が残る（refactor-candidates.ts:197/:357 の stableHash().slice(0,19) が最も近い。ほかに memory-promotion.ts:60、projection-writer.ts:2140）。本 diff の regression ではなく既存コードの同種欠陥であり、PLAN に対象外である旨の明示が無い点が指摘だったため、§4 へ箇所・用途・判断の表を追記し follow-up issue へ送る扱いにした。Minor 1 件（表示行が長くなる）は機能影響なしとして受容。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/screen-generated-identity.test.ts tests/screen-applicability.test.ts tests/screen-reentry.test.ts tests/screen-plan-route.test.ts tests/screen-stage-closure-gate.test.ts tests/screen-store-sqlite.test.ts tests/screen-cli.test.ts tests/design-coverage.test.ts tests/design-language.test.ts tests/impl-plan-trace.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T14:13:34Z", evidence_path: tests/screen-generated-identity.test.ts, output_digest: "sha256:bb83f8212d5801d90e71f956f7f91c6dc285daff4f8ca0503d807f45c3b9bf17", result: "10 files / 152 tests green、skip 0" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T14:13:34Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力なし）" }
      - { kind: lint, command: "npx --no-install biome check tests/screen-generated-identity.test.ts src/design/screen-applicability.ts", runner: node, scope: changed-files, exit_code: 0, completed_at: "2026-08-09T14:13:34Z", evidence_path: biome.json, output_digest: "sha256:89e7f11703bc002fbd332fc4b00dee4b6fb4fe6c51e4ba364d3b01fb13d6b3bc", result: "Checked 2 files、error 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-09T14:12:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-09T14:12:00Z"
    evidence_digest: "sha256:6bd3fd5d306daddcc7e8148126ad5295dc0fed90b28343ae3fb1dd39b1abd71c"
  entries: []
dependencies:
  parent: docs/plans/PLAN-L7-515-screen-applicability-cli.md
  requires:
    - docs/plans/PLAN-L7-513-screen-stage-closure-store.md
  references:
    - docs/design/helix/L5-detail/screen-applicability-prototype.md
  blocks: []
---

# PLAN-L7-532: screen 系の生成 identity を digest 全長の単射導出にする

## §1 何が問題か

`src/design/screen-applicability.ts` は 9 種の identity を source digest から生成していた。内訳は
decision と再判定 task、prototype task、walkthrough receipt、agreement、backprop receipt、
gate candidate、screen freeze operation、plan route operation である。いずれも `.slice(7, 19)` で
**12 hex = 48 bit へ切り詰めて**いた。identity は DB key と重複判定の正本である。

切り詰めた identity が衝突すると次の実害が出る。

1. `operation_id` の衝突: `committedOperations` / `screen_terminal_receipts` の重複判定に当たり、
   **相異なる正当な operation が `duplicate_gate` として fail-close で拒否**される
   （`src/design/screen-applicability-store.ts` と `screen-applicability-sqlite-store.ts`）。
2. `task_id` の衝突: `buildPlanScreenRouteBundle` の write_set が同一 key の insert を 2 件持ち、
   commit が壊れる。

48 bit の衝突確率は低いが、切り詰めに利益は無い（可読性は表示側で足りる）。invariant を
設計に明文化し、機械で固定する。

## §2 oracle の設計（衝突を作れない前提）

sha256 の実衝突は構成できないため、oracle は衝突事例ではなく**導出の単射性**を観測する。
生成 identity から source digest を全長復元できれば、相異なる digest は相異なる identity になる。

- **U-SAPID-001（behavioral）**: 再判定 task / prototype task / plan route operation の 3 経路で、
  生成 identity が `<prefix>-<source digest hex 全長>` と完全一致することを検査する。
- **U-SAPID-002（source backstop）**: 残る 6 経路の behavioral fixture は既存 suite 側にあり本書で
  再構築しないため、module 全体に切り詰め導出が 1 箇所も残らないことを source 面で固定する。
  これは behavioral oracle の**代用ではなく未カバー分の backstop**であり、test 本文と L8 設計の
  双方に明記した。fence が空振りしないよう module 内 export の存在も確認する。

## §3 工程表

### Step 1: red oracle の作成 [直列]

根拠: downstream_dependency（invariant の観測点が決まらないと実装の是非を判定できない）。

### Step 2: 9 箇所の identity 導出を単射化 → green [直列]

根拠: file_conflict（単一 module への集中編集）。

### Step 3: 設計 §3.1 と L8 §7 の記述 [直列]

根拠: downstream_dependency（実装済み挙動を設計正本へ反映する）。

### Step 4: review Step（別 runtime 判定。Codex 使用中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（実装と設計記述が揃ってからでないと判定できない）。

## §3.1 実装計画

- `src/design/screen-applicability.ts`: `.slice(7, 19)` 9 箇所を `.slice(7)` へ置換する。
  対象となる識別子は 9 種（decision、再判定 task、prototype task、walkthrough receipt、
  agreement、backprop receipt、gate candidate、screen freeze operation、plan route operation の
  各 ID）である。分岐・型・API signature は変更しない。
- `tests/screen-generated-identity.test.ts`: U-SAPID-001 / U-SAPID-002 を新設する。
- `docs/design/helix/L6-function-design/screen-applicability-prototype.md`: §3.1 に単射性 invariant。
- `docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md`: §7 に oracle 表と
  「誤って green になる経路」を追記する。

## §4 本 PLAN の非対象

#175 の残る申し送りは本 PLAN で扱わない。

- `WALKTHROUGH_ITERATION_LIMIT`（=16）の policy 化 — 現状は fail-close する module 定数であり、
  実害が出ていない。policy 化は port / store 側の設計判断を伴うため別スライス。
- rule digest 差分 reentry — `evaluateScreenReentry` は scope_digest 差のみを trigger にしており、
  rule_digest 差での再入場が未配線である（`reentry_trigger` の宣言値は
  `scope_or_rule_digest_change` なので宣言と実装に乖離がある）。実害の有無を含めて別スライスで扱う。
- 破損 DB fixture の spawn 統合テスト / `openHarnessDbReadOnly` 二段構成。
- CI の `skill suggest` timeout flake（#93 側で Codex が担当）。

### repo 全体の同種切り詰め（review round1 の指摘、対象外の明示）

reviewer が screen 系以外にも同クラスの切り詰め identity を検出した。本 PLAN は Issue #175 の
スコープ（screen 系）に限定するため扱わないが、silent に落とさず follow-up issue へ送る。

| 箇所 | 用途 | 判断 |
|---|---|---|
| `src/state-db/refactor-candidates.ts:197` / `:357` | refactor candidate の `subject`（`stableHash(...).slice(0, 19)`） | **最も近い**。ただし `file.path` prefix があり衝突条件が厳しく、advisory projection であって fail-close gate ではない。follow-up で扱う |
| `src/runtime/memory-promotion.ts:60` | session dedup key（96 bit） | 単一 field の hash で余裕があり緊急度低 |
| `src/state-db/projection-writer.ts:2140` | review evidence 派生 ID（sha1 48 bit） | 同クラス。follow-up で扱う |
| `src/cli.ts` probe / correlation id、`src/lint/memory-handover-isolation.ts` の short hash | 表示・probe 用途 | identity 衝突の文脈ではない |
