---
plan_id: PLAN-L4-72-event-projection-checkpoint-replay
title: "PLAN-L4-72 (add-design): orchestration event projectionとcheckpoint replayの基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #215 event projectionとcheckpoint replayをMIC要件へexact traceして実装する"]
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 215
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: event-projection-checkpoint-replay
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "Issue #213（work graphと三段receipt検収）とIssue #214（8-slot schedulerとquota handover）がcloseし、acquireWorkGraphLease／verifyWorkerLifecycleReceipt／admitSlotAccountingRow／canonicalJson／sha256Digestがmain上でcurrent authorityである"
contract_postconditions: "event envelope 11 fieldのexact set、因果順序判定、冪等ingest、lifecycle transition、projection drift検出、checkpoint scope選択とreplay検証、Recovery routingの責務境界とL9 oracleを固定する"
contract_invariants: "append-only列を書き換えない、同一event_idのside effectは1回だけ、canonicalization規則とsha256算出はsrc/runtime/digest.tsのcanonicalJson／sha256Digestを再利用し第二の算出系を作らない、createL3G3LogicalDbReceipt自体はdoctor専用の重量関数として本設計から呼び出さない、lane／event境界のscope選択は本設計の新規責務として既存資産と主張しない、#213／#214のreceipt・lease・accounting authorityを再実装しない、GitHub表示からstateを逆流させない"
contract_failures: "event片肺、duplicate side effect、causal inversion、illegal transition、projection drift、checkpoint／HEAD／parent欠落、orphan lane、non-idempotent replay"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "canonicalization規則とsha256算出はsrc/runtime/digest.tsのcanonicalJson／sha256Digestをそのまま使い、receipt検証・lease CAS・capacity会計は#213／#214のexportへ委譲する。新規はevent受理・因果順序・冪等・drift判定・checkpoint scope選択のpure judgementに限定し、新規DB table・新規CLI・network呼び出しを作らない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-event-projection-checkpoint-replay-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — event／projection／replay境界の基本設計" }
  - { role: qa, slot_label: "QA — fail-close 8系統のL9 system oracle設計" }
  - { role: tl, slot_label: "TL — MIC-R-07 exact traceと#213／#214資産との境界監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-event-projection-checkpoint-replay-system-test-design.md, artifact_type: test_design }
review_evidence:
  - reviewer: "code-reviewer independent subagent (AI-B)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T15:40:00+09:00"
    tests_green_at: "2026-08-09T15:37:43+09:00"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "L4/L9 pair（PLAN-L4-72、L4基本設計、L9 system test design）を5ラウンド独立レビュー。Round1（HEAD eb3911ef）: Critical 1件（checkpoint digestのスコープ不一致。createL3G3LogicalDbReceiptはhead_sha／parent_lane_id／event境界を引数に取らず、logicalDatabaseDigestの絞り込みもincludeTableによるテーブル単位に留まりcheckpoint_tablesに対するリポジトリ全体スコープであるため、L4が主張する『算出済みdigest対を受け取るだけ』は実装不能で、無関係laneの追記が他laneのcheckpointを恒常的にdriftさせるか実装者が第二のdigest算出系を起こすかの二択になる）とImportant 2件を検出しrequest_changes。fix commit 89894859でcanonicalization契約の再利用とlane／event境界のscope選択を責務分割し、Checkpoint scope selectorをcomponentへ追加（7→8）して解消。Round2（HEAD 89894859）: Criticalはresolved、新規Important 2件（§7の機械可読bindingがproseと乖離しcreateL3G3LogicalDbReceiptをexisting_runtimeとして宣言／§3正本グラフにscope selectorが欠落）を検出しrequest_changes。fix commit cb639753でbindingをsrc/runtime/digest.tsのcanonicalJson／sha256Digestへ差し替え、§3へscope selectorノードを挿入して解消。Round3（HEAD cb639753）: 新規Important 2件（§7 proseの個数表記が4件のまま実際は5件／L9のU-EPR-S-035と§2が旧createL3G3LogicalDbReceipt経由の枠組みのまま残存しL4と矛盾）を検出しrequest_changes。fix commit 8eee4735で解消。Round4（HEAD 8eee4735）: 新規Important 1件（PLAN本文のcontract_invariants／complexity_justification／再利用資産がRound2のdigest切替に追従せずL4と矛盾）を検出しrequest_changes。fix commit cfa5e619で解消。Round5（本ブランチHEAD cfa5e619）: PLAN／L4 design／L9 test designの3ファイルへcreateL3G3LogicalDbReceipt／canonicalJson／sha256Digestを横断grepして全出現箇所を突合し、digest再利用の枠組み・component数8・fail-close対応・trace表に矛盾が無いことを確認。contract_postconditions／contract_failures／pair_artifact／generates／dependencies／agent_slots／§工程表の反映漏れも無しと判定してverdict=approve / blockers 0。reviewerはsrc/doctor/l3-g3-logical-db-receipt.tsのlogicalDatabaseDigestとcreateL3G3LogicalDbReceiptのシグネチャ、src/runtime/digest.tsのcanonicalJson／sha256Digest、docs/governance/l3-g3-logical-db-bootstrap-policy.jsonのcheckpoint_tablesを実読し、§7 design-reality-binding JSONの5 assetのsource_digestがsha256sum実測と一致することを検証済み。green commandも独立に再実行して報告値との一致を確認している。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/design-language.test.ts tests/design-reality-binding.test.ts tests/design-coverage.test.ts tests/sub-doc-section-structure.test.ts tests/doc-consistency.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T15:37:31+09:00", evidence_path: tests/design-reality-binding.test.ts, output_digest: "sha256:3003bd91df73915e263f6ba8678ad9d22abf3a55940ad6d6d39184e382973a80", result: "5 suites / 65 tests green" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T15:37:43+09:00", evidence_path: docs/plans/PLAN-L4-72-event-projection-checkpoint-replay.md, output_digest: "sha256:8a2151d15185af88cce92c78b24673443008ff2d314ef3104292a0226ff7ee76", result: "PLAN checked=861、design-reality-binding checked=34、violation 0" }
dependencies:
  parent: docs/plans/PLAN-L3-43-management-integration-cell-model.md
  requires:
    - docs/plans/PLAN-L4-71-slot-scheduler-quota-handover.md
  blocks:
    - issue:215
---

# orchestration event projectionとcheckpoint replayの基本設計（L4/L9 pair）

## 目的

Issue #215 の behavior contract を L4 基本設計として固定する。request から terminal までの
orchestration event を append-only で保持し、event envelope 11 field から projection・checkpoint・
receipt を exactly-once 相当で再構築する責務境界を定義し、L9 system test design と pair で凍結する。

## 範囲

- event／DB／read-model／replay の責務境界（L4）と system-level oracle（L9）。
- fail-close 8 系統: event 片肺 / duplicate side effect / causal inversion / illegal transition /
  projection drift / checkpoint・HEAD・parent 欠落 / orphan lane / non-idempotent replay。
- MIC-FR-001 / MIC-R-07 / MIC-AC-010..011 への exact trace。

## 範囲外

- L5 詳細 schema・state transition・dedupe・causal order・checkpoint schema の実装形（後続 L5/L8 PLAN）。
- ingest／replay／project／checkpoint transaction の実装と fault／race／mutation tests（後続 L6/L7 PLAN）。
- 新規 DB table、CLI surface、GitHub Projects API 呼び出しの実装（後続 PLAN の transactional boundary）。
- MIC-R-01..04（#213）と MIC-R-05..06（#214）の再定義。

## 再利用資産

- `src/runtime/work-graph-receipt-acceptance.ts`: `acquireWorkGraphLease` の fence token CAS と
  required cell binding の exact set 検証。event source の lease 系譜として参照する。
- `src/runtime/worker-lifecycle-receipt.ts`: `verifyWorkerLifecycleReceipt` による terminal 判定。
- `src/runtime/slot-scheduler-quota-handover.ts`: `admitSlotAccountingRow` による slot 会計。
- `src/runtime/digest.ts`: `canonicalJson`（object key 順・array 順・JSON 妥当性）と `sha256Digest`。
  本設計はこの 2 export をそのまま使い、第二の canonicalization 規則・第二の sha256 算出系を定義しない。
- `src/doctor/l3-g3-logical-db-receipt.ts`: `createL3G3LogicalDbReceipt` は同じプリミティブを import して
  使う既存 authority だが、**本設計からは呼び出さない**。bootstrap policy を読み込んで harness.db を
  2 回 full rebuild する doctor 専用の重量関数であり、event 単位の判定経路で呼ぶ対象ではない。
  加えて `head_sha` / `parent_lane_id` / event 境界を引数に取らず、`logicalDatabaseDigest` の絞り込みも
  `includeTable` によるテーブル単位に留まるため、lane / event 境界の scope 選択は既存資産に存在せず
  本設計の新規責務となる。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L4 基本設計 doc 起草（責務境界・state 遷移・fail-close・trace 表） | [直列] | downstream_dependency (L9 oracle は L4 の fail-close 一覧に依存) |
| 2 | L9 system test design 起草（U-EPR-S oracle） | [直列] | downstream_dependency (Step1 の fail-close 系統に 1:1 対応させる) |
| 3 | review（独立 AI-B）と pair-freeze 準備 | [直列] | shared_state (両 doc 完成後の全体整合レビュー) |
