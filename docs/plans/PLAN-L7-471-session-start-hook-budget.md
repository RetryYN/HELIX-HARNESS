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
contract_postconditions: "session_start event と harness memory recall が feedback 経路より前に確定し、full lifecycle reconcile は SessionStart から外れて `helix feedback reconcile` が担う。surface receipt は打ち切らず全 ref を記録し、hook 本体だけが stdout、委譲/team spawn は stderr へ SessionStart の全 surface (feedback / attempt escalation) を出す"
contract_invariants: "surface の fail-open 性質、feedback 表示内容、lifecycle receipt の意味論 (同一 session の全 ref を receipt 化する契約を含む) を変えない。receipt を打ち切らないため deferral も発生しない。journal は末尾の torn write だけを truncate し、中間行の破損は従来どおり fail-close する"
contract_failures: "DB 不在・ロック・破損では従来どおり runtime を止めない。maintenance 保留は surface する feedback がある場合だけ明示し、machine-readable JSON 経路の stdout を汚さない"
tdd_red_required: true
red_at: "2026-07-27T01:11:20+09:00"
green_at: "2026-07-27T01:11:39+09:00"
mutation_oracle_evidence: "修正前 HEAD (0d184551) の `src/cli.ts` へ戻した状態で tests/session-start-budget.test.ts の U-SSBUDGET-001/002/003 が 3 件とも fail することを実測し、修正復元で 3 件 green を再確認した"
complexity_effect: justified_positive
complexity_justification: "新 service・dependency・schema を追加せず、lifecycle deps の追記口を batch 1 本へ畳み、出力先 1 引数と末尾 torn write の truncate を足すだけで SessionStart を 24.4s から 4.38s へ収束させ、恒常的に失われていた session_start event と memory recall を回復する。打ち切り機構を持たないため receipt 意味論は無変更"
removal_trigger: "feedback lifecycle が append-only jsonl 全 replay を止め、reconcile が hook 予算内に収まるようになった時点で maintenance 分離と deferral 表示を削除する"
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
  - {
      parent_design: docs/design/helix/L6-function-design/orchestration-memory.md,
      oracle_id: U-SSBUDGET-006,
      test_path: tests/session-start-budget.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/orchestration-memory.md,
      oracle_id: U-SSBUDGET-007,
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
  - { artifact_path: src/feedback/lifecycle-node.ts, artifact_type: source_module }
  - { artifact_path: src/policy/feedback-lifecycle.ts, artifact_type: source_module }
  - { artifact_path: src/feedback/lifecycle-surface.ts, artifact_type: source_module }
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
3. **receipt append の batch 化 (打ち切りではなく I/O 回数の是正)**: 13.29s の原因は receipt の
   *件数* ではなく、`appendEvent` が 1 event ごとに open/write/fsync/close していたこと
   (5,305 × 約 2.5ms)。`FeedbackLifecycleDeps` の追記口を `appendEvents` **1 本へ畳み**、
   同一 lock・同一 fence 内で全 event を 1 度だけ durable write する。I/O 回数が O(N) → O(1) に
   なり、**打ち切りは不要**。したがって「同一 SessionStart の全 ref を receipt 化する」契約
   (feedback-lifecycle.md) は迂回せずそのまま維持される。単発 append は 1 要素配列で呼ぶ。

   逐次版 (`appendEvent`) を併存させる設計を一度取ったが、`{ ...base, appendEvent: <crash 注入版> }`
   で耐久性を検証していた既存 oracle (U-FLIFE-003 / U-FLIFE-013) が batch 側の実装をそのまま拾い、
   注入した障害を素通りさせた (実測 2 件 fail)。**片方だけ差し替えた deps が黙って別経路を走る**ため、
   口は 1 本に保つ。既存 oracle は batch 内 prefix だけが durable になる torn write を注入する形へ
   置き換え、同じ収束性 (retry で不足 receipt へ収束) を検証する。
4. **surface 出力先の分離**: hook 本体 (`helix session start`) だけが stdout を使い、委譲 /
   team run の session spawn は stderr を使う。後者は stdout を machine-readable JSON として
   返すため、surface を混ぜると `helix codex --execute --json` / `helix team run --json` が
   parse 不能になる (実測: SyntaxError)。surface を捨てるのではなく経路を分ける。
   分離は SessionStart が stdout へ書く **すべての** surface に適用する。feedback surface だけに
   適用した版では attempt escalation が迂回経路として残り、feedback が空でも JSON を壊した
   (U-SSBUDGET-007 で固定)。

5. **torn write の復旧**: 1 回の `writeSync` は atomic ではないので、batch の途中 crash では
   「JSON の途中 byte まで durable」という末尾不完全行が残り得る (逐次 append 時代から存在する
   失敗モードだが、batch 化で 1 write あたりの byte 数が増える)。これを残したまま追記すると
   破損行と次の event が連結され、retry しても valid receipt にならず `damaged_lifecycle` が
   恒久化する。lock 保持中に末尾を検査し、**改行で終わっていなければ最後の完全な行境界まで
   truncate** してから追記する。読み取り側も末尾の不完全行だけを読み捨てる。中間行の破損は
   従来どおり fail-close (U-FLIFE-014 で固定)。
6. **保守の受け皿**: `helix feedback reconcile` を追加し、予算のない経路で reconcile + projection を行う。
7. **schema 作成の分離**: `migrate` は従来 `maintainFeedbackLifecycle` が兼ねていたため、maintenance を
   外すと「空 DB は作られたが table が無い」状態が残り、DB 依存 command が `no such table` で落ちる。
   実測 0.01s で予算に影響しないので、maintenance とは独立に SessionStart で常に実行する。
8. **予算の余裕**: SessionStart hook timeout を 5s → 15s。repo の `.claude/settings.json`、配布 template
   (`docs/templates/adapter/.claude/settings.json`)、および `helix setup project` が生成する
   built-in consumer template (`src/setup/templates.ts`) の 3 面すべてを揃える。

## 効果 (同一 DB 複製での実測)

- 24.4s → **4.38s**（全 5,305 件を receipt 化した上で）
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
