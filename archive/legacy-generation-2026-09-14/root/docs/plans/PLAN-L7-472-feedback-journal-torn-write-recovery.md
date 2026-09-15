---
plan_id: PLAN-L7-472-feedback-journal-torn-write-recovery
title: "PLAN-L7-472 (impl): feedback lifecycle journal の torn write 復旧 oracle"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-27 Claude拡張へのHook配線の問題を修正する (PLAN-L7-471 の cross-runtime review で torn write 復旧の受入条件が要求された)"
created: 2026-07-27
updated: 2026-07-27
owner: Claude / TL
engineering_discipline_required: true
behavior_contract_id: U-FLIFE-014
responsibility_owner: feedback-lifecycle-journal
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "`.helix/logs/feedback-lifecycle.jsonl` が append-only journal として運用され、追記は `appendEvents` の 1 回の write で行われる"
contract_postconditions: "最終 JSON 行の途中 byte で切断された journal は、同一 operationId の 1 回の retry で全 receipt が valid 行として存在し `resolveFeedbackLifecycle(...).damaged` が空になる"
contract_invariants: "捨てるのは末尾の不完全行だけであり、改行で閉じた中間行の破損は従来どおり damaged として fail-close する"
contract_failures: "完全な行が 1 本も無い journal は全捨てする (先頭 event の torn write)。journal 不在・空は no-op"
tdd_red_required: true
red_at: "2026-07-27T04:05:00+09:00"
green_at: "2026-07-27T04:12:00+09:00"
mutation_oracle_evidence: "`src/feedback/lifecycle-node.ts` から `truncateTornTail` 呼び出しと `readJsonLines` の末尾読み捨てを外した mutation を注入した状態で `npx --no-install vitest run tests/feedback-lifecycle.test.ts -t 'U-FLIFE-014'` が red (failed) になることを実測し、復元後に green を再確認した。切断位置は先頭直後 (1 byte) / 中央 / 末尾直前の 3 境界を同一 oracle 内で回している"
complexity_effect: justified_positive
complexity_justification: "既存 journal format を変えず、lock 保持中の末尾検査と truncate だけを足して、1 回の write が atomic ではないことに起因する damaged 恒久化を閉じる。length-prefix / checksum format への移行は reader/writer 全面変更を伴うため採らない"
removal_trigger: "journal が length-prefix または checksum 付き record format へ移行し、部分書込みを format 自体で検出できるようになった時点で末尾 truncate を削除する"
parent_design: docs/design/harness/L6-function-design/feedback-lifecycle.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - {
      parent_design: docs/design/harness/L6-function-design/feedback-lifecycle.md,
      oracle_id: U-FLIFE-014,
      test_path: tests/feedback-lifecycle.test.ts,
    }
agent_slots:
  - role: se
    slot_label: "SE — journal 末尾 torn write の truncate 実装"
  - role: qa
    slot_label: "QA — 切断境界を parameterize した収束 oracle の検証"
  - role: tl
    slot_label: "TL — append-only 契約と fail-close 境界の review"
generates:
  - { artifact_path: docs/plans/PLAN-L7-472-feedback-journal-torn-write-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: tests/feedback-lifecycle.test.ts, artifact_type: test_code }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-26T23:07:29Z"
  review_binding:
    reviewer: "Codex CLI / codex-gpt-5.6"
    reviewed_at: "2026-07-26T23:07:29Z"
    evidence_digest: "sha256:0f3b5c7713407393bb82ba99937dea949d3fa1adfa407b440a45dbefa1357421"
  entries: []
review_evidence:
  - reviewer: "Codex CLI / codex-gpt-5.6"
    review_kind: cross_agent
    reviewed_at: "2026-07-26T23:07:29Z"
    tests_green_at: "2026-07-26T23:04:53Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: codex-gpt-5.6
    scope: "PLAN-L7-471 の cross-runtime review で要求された torn write 復旧契約を、正しい親 (feedback-lifecycle.md) を持つ additive PLAN として分離し U-FLIFE-014 を所有させた判断を review した。reviewer は分離の妥当性 (kind=impl / layer=L7 / parent_design / binding / generates の一貫性)、tests/feedback-lifecycle-surface.test.ts を deps 形状追随として generates から外す説明、および U-FLIFE-014 を単一 it 内の 3 境界ループにして 1 oracle = 1 executable case 規約へ適合させた形を approve した。末尾 torn write の truncate 実装 (src/feedback/lifecycle-node.ts、PLAN-L7-471 所有) は 4 回目 review で approve 済みで以降未変更。reviewer 環境は node_modules/.vite-temp が EROFS で Vitest を起動できないため、green evidence は worker 側実測を束縛する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/session-start-budget.test.ts tests/feedback-lifecycle.test.ts tests/feedback-lifecycle-surface.test.ts tests/setup.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-26T23:04:53Z"
        evidence_path: tests/feedback-lifecycle.test.ts
        output_digest: "sha256:dad6d65ff57e18e9a1dccf53f83cd3641be5d3f80f551ac636c1cb568a238376"
        result: "78 passed"
dependencies:
  parent: docs/plans/PLAN-L7-471-session-start-hook-budget.md
  requires: []
  references:
    - docs/design/harness/L6-function-design/feedback-lifecycle.md
    - docs/test-design/harness/L8-unit-test-design.md
    - docs/plans/PLAN-L7-471-session-start-hook-budget.md
  blocks: []
---

# PLAN-L7-472: feedback lifecycle journal の torn write 復旧 oracle

## 目的

PLAN-L7-471 が feedback lifecycle の追記口を `appendEvents` 1 本へ畳んだ結果、
1 回の `writeSync` で複数 event を書くようになった。しかし **1 回の write は atomic ではない**。
batch の途中で crash すると「JSON の途中 byte まで durable」な末尾不完全行が残り、
これを残したまま追記すると破損行と次の event が連結され、retry しても valid receipt に
ならず `damaged_lifecycle` が恒久化する。

この失敗モードは逐次 append 時代から存在していた（1 event の write も atomic ではない）。
batch 化は 1 write あたりの byte 数を増やすため露出確率を上げる。本 PLAN は
その復旧契約と oracle を、実装 PLAN-L7-471 とは別に `feedback-lifecycle.md` を親として所有する。

## 起票理由（PLAN-L7-471 から分離した理由）

`plan-specific-vpair-binding` は PLAN の `verification_bindings` を単一 `parent_design` へ束縛する。
U-FLIFE-014 の正当な親は `docs/design/harness/L6-function-design/feedback-lifecycle.md` であり、
PLAN-L7-471 の `parent_design`（`orchestration-memory.md`）とは異なる。
誤った親を宣言して binding を通すのではなく、正しい親を持つ additive PLAN として分離し、
`tests/feedback-lifecycle.test.ts` の descent obligation を機械的に閉じる。

## 変更

1. **末尾 torn write の truncate**: lock 保持中に journal 末尾を検査し、改行で終わっていなければ
   後方走査で最後の完全な行境界まで `ftruncateSync` してから追記する。完全な行が 1 本も無ければ
   journal 全体を捨てる（先頭 event の torn write）。実装は `src/feedback/lifecycle-node.ts`
   （PLAN-L7-471 の `generates`）。
2. **読み取り側の末尾読み捨て**: `readJsonLines` はファイル末尾が改行でない場合に最終行を読み捨てる。
   追記側が必ず event ごとに `\n` を付け、truncate も改行境界へ揃えるため、
   「完全な行が改行を欠く」ことはない。改行で閉じた中間行の破損は読み捨てず damaged にする。
3. **oracle**: U-FLIFE-014 を追加。切断位置を **先頭直後 (1 byte) / 中央 / 末尾直前** の 3 境界で
   parameterize し、同一 operationId の 1 回の retry で全 receipt が valid 行として存在し
   `damaged` が空になることを検証する。raw journal 側でも damaged 0 を確認する。
4. **既存 oracle の追随**: 追記口の 1 本化に伴い、`{ ...base, appendEvent: <crash 注入> }` で
   耐久性を検証していた U-FLIFE-003 / U-FLIFE-013 の stub を `appendEvents` へ移し、
   batch 内 prefix だけが durable になる torn write を注入する形へ置き換えた。
   `tests/feedback-lifecycle-surface.test.ts` の deps stub も同様に追随させたが、こちらは新規 oracle を
   持たない (既存 U-FLIFE-006 の deps 形状追随のみ) ため `generates` には載せない。

## 非対象

- journal format 自体の変更（length-prefix / checksum）。`removal_trigger` に記載。
- journal の compaction。
- 中間行破損の自動修復（fail-close を維持する）。

## 完了条件

- U-FLIFE-014 が 3 境界すべてで green。
- 既存 U-FLIFE-001..013 が非退行。
- `helix plan lint` / `helix doctor` が本 PLAN 起因の violation を出さない。
