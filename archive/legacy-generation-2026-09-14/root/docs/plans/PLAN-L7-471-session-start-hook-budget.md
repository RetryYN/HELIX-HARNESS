---
plan_id: PLAN-L7-471-session-start-hook-budget
title: "PLAN-L7-471 (impl): SessionStart hook の予算収束と保守処理の分離"
kind: impl
layer: L7
drive: agent
status: confirmed
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
mutation_oracle_evidence: "修正前 HEAD (0d184551) の `src/cli.ts` へ戻した状態で `npx --no-install vitest run tests/session-start-budget.test.ts` の U-SSBUDGET-001/002/003 が 3 件とも fail することを実測し、修正復元で green を再確認した。さらに `dispatch(session_start)` を side effects の後ろへ戻す mutation を注入した状態で `npx --no-install vitest run tests/session-start-budget.test.ts -t 'U-SSBUDGET-008'` が red (failed) になり、復元で green になることを実測した (順序契約が実際に kill されることの確認)。U-SSBUDGET-008 の停止点は時間ではなく恒久 barrier で決めており、**mutation に加えて親 process を 8 秒 stall させた条件でも red** になることを実測した (lock retry 上限に依存する旧 fixture はこの条件で false green になる)。U-FLIFE-014 / U-SSBUDGET-007 も同様に修正前 red を個別実測している"
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
  - {
      parent_design: docs/design/helix/L6-function-design/orchestration-memory.md,
      oracle_id: U-SSBUDGET-008,
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
  - { artifact_path: docs/governance/helix-objective-evidence-audit.md, artifact_type: markdown_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: tests/session-start-budget.test.ts, artifact_type: test_code }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-26T23:07:29Z"
  review_binding:
    reviewer: "Codex CLI / codex-gpt-5.6"
    reviewed_at: "2026-07-26T23:07:29Z"
    evidence_digest: "sha256:d9f94314456f4713b7f5feb486a37c7985d1cfafd7ea5bddd114c810a03846ff"
  entries: []
review_evidence:
  - reviewer: "Codex CLI / codex-gpt-5.6"
    review_kind: cross_agent
    reviewed_at: "2026-07-26T23:07:29Z"
    tests_green_at: "2026-07-26T23:04:53Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: codex-gpt-5.6
    scope: "SessionStart hook 予算収束 (PLAN-L7-471) を 10 回の successive-HEAD cross-runtime review で収束させた。verdict 列は approve_after_fixes / reject / reject / approve / approve_after_fixes x6 / approve (11 回目で Blocker/High/Medium/Low すべて 0) で、**実装 (src/cli.ts, src/feedback/lifecycle-node.ts, src/policy/feedback-lifecycle.ts, src/feedback/lifecycle-surface.ts) は 4 回目 HEAD 454d8479 の approve 以降一切変更していない**。2 回目 reject は receipt spool の lock-free read-modify-write race / crash loss / failed-100 非収束で、spool 機構ごと削除し真のコスト要因 (appendEvent の per-event open/write/fsync/close) を batch 追記へ畳んで解消した (24.4s → 4.38s、receipt は打ち切らず全 5,305 件を記録)。3 回目 reject は torn write で末尾不完全行が残ると同一 operationId retry が収束せず damaged が恒久化する件と、stdout/stderr 分離が attempt escalation に適用されず委譲 JSON を壊す件で、lock 保持中の末尾 truncate と全 surface への分離適用で解消した。5 回目以降の指摘はすべて oracle / fixture の厳密性に対するもので、実装欠陥は 1 件も出ていない: 完了条件の誇張 (無改変 main 0d184551 で同一 test が同一 assertion で fail することを実測して切り分け)、他 PLAN 所有 test の trace closure (PLAN-L7-472 へ分離)、U-SSBUDGET-002 の weak oracle (耐久 event 直接 assert へ置換)、U-SSBUDGET-008 の false-green race (時間依存の lock 足止めを FIFO 恒久 barrier へ置換。projection 未作成で journal を一度も読んでいなかった誤り green も同時に是正)、wrapper のみ kill による orphan leak (修正前の版が残した orphan が実測 2.5 時間生存。detached process group + 消滅待ちへ変更)、失敗経路の cleanup 順序、cleanup 失敗時の fail-close (group 消滅を確認できない場合は barrier を保持し AggregateError で本体 error と併せて報告)。10 回目 High (cleanup 失敗時に barrier を解放する) は catch ベースへ組み替え、group 消滅を確認できたときだけ barrier を解放する fail-close とし、本体 error と cleanup error を AggregateError で併報する形にして 11 回目で approve を得た。U-SSBUDGET-008 は mutation (dispatch を side effects の後ろへ移動) + 親 10 秒 stall で red、正常時は重い構成で連続 green、red 経路直後も orphan 0 件を実測している。reviewer 環境は node_modules/.vite-temp が EROFS で Vitest を起動できないため静的 review であり、green evidence は worker 側実測を束縛する。full gate 正本は GitHub Actions の harness-check とし、そこでの green を merge 条件とする。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/session-start-budget.test.ts tests/feedback-lifecycle.test.ts tests/feedback-lifecycle-surface.test.ts tests/setup.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-26T23:04:53Z"
        evidence_path: tests/session-start-budget.test.ts
        output_digest: "sha256:dad6d65ff57e18e9a1dccf53f83cd3641be5d3f80f551ac636c1cb568a238376"
        result: "78 passed"
dependencies:
  parent: docs/plans/PLAN-L7-455-sessionstart-feedback-receipt-batch.md
  requires: []
  references:
    - docs/design/helix/L6-function-design/orchestration-memory.md
    - docs/test-design/harness/L8-unit-test-design.md
    - docs/plans/PLAN-L7-455-sessionstart-feedback-receipt-batch.md
    - docs/plans/PLAN-L7-472-feedback-journal-torn-write-recovery.md
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

## 本 PLAN が触った他 PLAN 所有の test

`tests/feedback-lifecycle.test.ts` と `tests/feedback-lifecycle-surface.test.ts` の変更
(追記口 1 本化に伴う U-FLIFE-003 / U-FLIFE-013 の stub 追随、および torn write 復旧 oracle
U-FLIFE-014 の追加) は、正しい親 `docs/design/harness/L6-function-design/feedback-lifecycle.md` を
持つ **PLAN-L7-472-feedback-journal-torn-write-recovery** が所有する。
`verification_bindings` は PLAN 単一 `parent_design` へ束縛される規約のため、誤った親を宣言して
本 PLAN の `generates` へ載せることはしない。

`tests/setup.test.ts` と `tests/cli-surface.test.ts` の変更は、本 PLAN の template digest 更新と
decision count 変動に追随する change-detector の再 pin であり、新規 oracle ではない。

## 非対象

- open feedback 5,305 件 (うち `unresolved-join` 5,191 件) の triage。別 episode とする。
- 103MB へ成長した `.helix/logs/feedback-lifecycle.jsonl` の compaction。
- feedback lifecycle の意味論 (receipt / state 遷移 / 表示内容) の変更。
- hook 以外の呼び出し面 (`feedback list`) の保守挙動の変更。

## 完了条件

- `session start` が full reconcile を回さず、保留を明示する。
- `session_start` と memory recall が feedback 経路より前に確定する。
- `helix feedback reconcile` が保守本体を実行できる。
- targeted test / typecheck / lint / doctor が green になる。
- affected suite に **本差分起因の新規 failure が 0 件** であること。ローカルには Node 24.15 を
  要求する `tests/cli-surface.test.ts > exposes clean distribution planning with preflight,
  rollback, and contract metadata` の環境 failure が 1 件あるが、これは無改変 main でも再現する
  既存 debt であり本差分起因ではない。実測: 無改変 `origin/main` (commit `0d184551`) を detached
  worktree へ checkout し `npx vitest run tests/cli-surface.test.ts -t "clean distribution planning"`
  を実行 → exit 1、同一 test が同一 assertion で fail (`Tests 1 failed`)。
- 本 PLAN の full gate 正本は GitHub Actions の `harness-check` であり、そこでの green を
  merge 条件とする (ローカル Node は 22 系のため full gate 正本にしない)。
