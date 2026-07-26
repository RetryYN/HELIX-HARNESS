---
plan_id: PLAN-L7-471-session-start-hook-budget
title: "PLAN-L7-471 (impl): SessionStart hook の予算収束と保守処理の分離"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-27 Claude拡張へのHook配線の問題を修正する"
created: 2026-07-27
updated: 2026-07-27
owner: Claude / TL
engineering_discipline_required: true
behavior_contract_id: U-SSBUDGET-001
responsibility_owner: session-start-budget
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "SessionStart hook が bounded budget (適用前の旧予算 5s、適用後 15s) で `helix session start` を呼び、harness.db の open feedback と `.helix/logs/feedback-lifecycle.jsonl` が実運用規模まで成長している"
contract_postconditions: "session_start event と harness memory recall が feedback 経路より前に確定し、full lifecycle reconcile と上限超過 receipt は SessionStart から外れて `helix feedback reconcile` が担う。上限超過 receipt は receipt session ごと spool され、reconcile が冪等に drain して全件 receipt 化する"
contract_invariants: "surface の fail-open 性質、feedback 表示内容、lifecycle receipt の意味論 (同一 session の全 ref を receipt 化する契約を含む) を変えず、打ち切り件数と drain 件数を必ず stdout へ明示する"
contract_failures: "打ち切りを無言で行わず、DB 不在・ロック・破損では従来どおり runtime を止めない"
tdd_red_required: true
red_at: "2026-07-27T01:11:20+09:00"
green_at: "2026-07-27T01:11:39+09:00"
mutation_oracle_evidence: "修正前 HEAD (0d184551) の `src/cli.ts` へ戻した状態で tests/session-start-budget.test.ts の U-SSBUDGET-001/002/003 が 3 件とも fail することを実測し、修正復元で 3 件 green を再確認した"
complexity_effect: justified_positive
complexity_justification: "新 service・dependency・schema を追加せず、既存 3 呼び出し面へ options 1 個と上限定数 1 個を足すだけで SessionStart を 24.4s から 4.19s へ収束させ、恒常的に失われていた session_start event と memory recall を回復する"
removal_trigger: "feedback lifecycle が append-only jsonl 全 replay を止め、receipt 追記が open 件数に比例しなくなった時点で SESSION_START_RECEIPT_LIMIT と deferral 表示を削除する"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - {
      parent_design: docs/design/helix/L6-function-design/orchestration-memory.md,
      oracle_id: U-SSBUDGET-001,
      test_path: tests/session-start-budget.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/orchestration-memory.md,
      oracle_id: U-SSBUDGET-002,
      test_path: tests/session-start-budget.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/orchestration-memory.md,
      oracle_id: U-SSBUDGET-003,
      test_path: tests/session-start-budget.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/orchestration-memory.md,
      oracle_id: U-SSBUDGET-004,
      test_path: tests/session-start-budget.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/orchestration-memory.md,
      oracle_id: U-SSBUDGET-005,
      test_path: tests/session-start-budget.test.ts,
    }
agent_slots:
  - role: se
    slot_label: "SE — SessionStart 実行順と保守分離の実装"
  - role: qa
    slot_label: "QA — 予算 oracle と打ち切り可視化の検証"
  - role: tl
    slot_label: "TL — hook 境界と fail-open 規律の review"
generates:
  - { artifact_path: docs/plans/PLAN-L7-471-session-start-hook-budget.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/feedback/receipt-spool.ts, artifact_type: source_module }
  - { artifact_path: src/setup/template-markers.ts, artifact_type: source_module }
  - { artifact_path: src/setup/templates.ts, artifact_type: source_module }
  - { artifact_path: docs/design/harness/L6-function-design/feedback-lifecycle.md, artifact_type: design_doc }
  - { artifact_path: .claude/settings.json, artifact_type: config }
  - { artifact_path: docs/templates/adapter/.claude/settings.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L6-function-design/orchestration-memory.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/session-start-budget.test.ts, artifact_type: test_code }
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L7-455-sessionstart-feedback-receipt-batch.md
  requires: []
  references:
    - docs/design/helix/L6-function-design/orchestration-memory.md
    - docs/test-design/harness/L8-unit-test-design.md
    - docs/plans/PLAN-L7-455-sessionstart-feedback-receipt-batch.md
  blocks: []
---

# PLAN-L7-471: SessionStart hook の予算収束と保守処理の分離

## 目的

SessionStart hook が予算超過で毎回 kill され、`session_start` event と harness memory recall が
恒常的に失われていた状態を解消する。DB-backed 引き継ぎ (`CLAUDE.md`: 「引き継ぎ feedback は
harness.db から受け取る」) と memory 正本 recall (charter P7) を、hook 予算内で確実に届ける。

## 観測事実 (修正前、実測)

| 対象 | 実測値 |
|---|---|
| `helix session start` 実行時間 | 24.4s (user 12.1s) |
| `.claude/settings.json` の SessionStart timeout | 5s |
| 直近 3 session log の `session_start` 記録 | 0 件 (`46a766bf` / `9ac9584c` / `bb6e6bbe`) |
| 内訳: `reconcileFeedbackLifecycle(full)` 初回 / 定常 | 14.97s / 1.63s |
| 内訳: `projectFeedbackLifecycle` | 1.39s → 3.10s (event 増で成長) |
| 内訳: `recordFeedbackSurfaces` (5,305 件) | 13.29s |
| 内訳: `selectTakeoverFeedback` + render (本来の責務) | 0.12s |

surface 本体は 0.12s であり、残りはすべて保守処理だった。さらに旧実装は
`runSessionStartSideEffects` → `dispatch` → `surfaceMemory` の順で、**最も高価な処理が先頭**に
あったため、kill 時に `session_start` も memory recall も 1 件も残らなかった。
hook は fail-open のため、この失敗は誰にも観測されないまま継続していた。

## 先行 PLAN-L7-455 との関係（重複ではなく successor）

PLAN-L7-455 (troubleshoot, confirmed 2026-07-14) は同じ経路の **計算量** を是正し、
`recordFeedbackSurfaces` を単一 lock・単一 journal snapshot の batch API 化した
（本 PLAN の実測でも batch 化は効いており、`readEvents` は 0.26s に収まっている）。

しかし L7-455 の受入条件は「SessionStart feedback path が **30 秒以内**（実測 18.34 秒）」であり、
**SessionStart hook の実予算 5s とは別のバー**だった。計算量は改善したが予算境界は閉じておらず、
その後の open feedback 増加（5,211 → 5,305 ref）と journal 成長（53MB → 103MB）で
実測 24.4s へ戻り、hook は毎回 kill されていた。

本 PLAN は L7-455 の成果を前提に、**バーを hook 予算へ揃える**責務を負う。
すなわち計算量ではなく「何を SessionStart の責務に置くか」の境界を変更する。
L7-455 は誤った claim をしていないため supersede ではなく successor として接続する。

## 変更

1. **実行順の是正**: `dispatch(session_start)` と `surfaceMemory` を side effects より前に出す。
   予算超過で kill されても、安く・失うと痛い 2 つは必ず確定する。
2. **保守の分離**: `runSessionStartSideEffects` / `surfaceTakeoverFeedbackToStdout` に
   `maintainLifecycle` を追加し、hook 経路では full reconcile と projection を回さない。
3. **receipt 上限と回収**: hook 経路の surface receipt を `SESSION_START_RECEIPT_LIMIT`(100) で打ち切り、
   **打ち切った分は捨てずに `.helix/state/feedback-receipt-spool.jsonl` へ receipt session ごと 1 行 append** する。
   打ち切り件数を stdout へ明示する (silent truncation にしない)。
4. **保守の受け皿**: `helix feedback reconcile` を追加し、予算のない経路で reconcile + projection を行い、
   **spool を冪等に drain して全 ref を元の receipt session で receipt 化する**。operationId は
   `(sessionId, ref)` から決定論的に導出するため、即時書き込みと後追い drain は idempotent replay になる。
5. **schema 作成の分離**: `migrate` は従来 `maintainFeedbackLifecycle` が兼ねていたため、maintenance を
   外すと「空 DB は作られたが table が無い」状態が残り、DB 依存 command が `no such table` で落ちる。
   実測 0.01s で予算に影響しないので、maintenance とは独立に SessionStart で常に実行する。
6. **予算の余裕**: SessionStart hook timeout を 5s → 15s。repo の `.claude/settings.json`、配布 template
   (`docs/templates/adapter/.claude/settings.json`)、および `helix setup project` が生成する
   built-in consumer template (`src/setup/templates.ts`) の 3 面すべてを揃える。

## 効果 (同一 DB 複製での実測)

- 24.4s → **4.19s**
- `session_start` event が記録される (修正前 0 件)
- feedback surface と memory recall が hook 出力へ届く
- 保留 (reconcile / receipt) は stdout に件数付きで表示される

## 非対象

- open feedback 5,305 件 (うち `unresolved-join` 5,191 件) の triage。別 episode とする。
- 103MB へ成長した `.helix/logs/feedback-lifecycle.jsonl` の compaction。
- feedback lifecycle の意味論 (receipt / state 遷移 / 表示内容) の変更。
- hook 以外の呼び出し面 (`feedback list`) の保守挙動の変更。

## 完了条件

- `session start` が full reconcile を回さず、保留を明示する。
- `session_start` と memory recall が feedback 経路より前に確定する。
- `helix feedback reconcile` が保守本体を実行できる。
- targeted test / typecheck / lint / doctor / full CI が green になる。
