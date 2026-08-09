---
plan_id: PLAN-L5-98-event-projection-checkpoint-replay
title: "PLAN-L5-98 (add-design): orchestration event projectionとcheckpoint replayの詳細設計"
kind: add-design
layer: L5
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
contract_preconditions: "PLAN-L4-72（orchestration event projectionとcheckpoint replayの基本設計）がconfirmedであり、8 componentの責務境界とfail-close 8系統、canonicalization契約とscope選択の責務分割が凍結済みである"
contract_postconditions: "event envelope／append-only log snapshot／projection snapshot／checkpoint record／checkpoint scope／recovery budgetのtyped schema、判定関数8種と各関数の判定順序、EVENT_* failure code 19種（うちEVENT_RECOVERY_REQUIREDはroute値でありunion memberは18種）、L8 unit oracle U-EPR-001..088を固定する"
contract_invariants: "append-only列を書き換えない、同一event_idのside effectは1回だけ、正規化とsha256算出はsrc/runtime/digest.tsのcanonicalJson／sha256Digestを使い第二の算出系を作らない、createL3G3LogicalDbReceiptを呼び出さない、scope未指定時に全体スコープへ暗黙フォールバックしない、#213／#214のreceipt・lease・accounting authorityを再実装しない"
contract_failures: "event片肺、exact set欠落とunknown field相殺、append-only違反、duplicate side effect、causal inversion、illegal transition、projection drift、orphan lane、checkpoint／HEAD／parent欠落、全体スコープdigest流用、non-idempotent replay、無制限retry"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "receipt検証・lease CAS・slot会計は#213／#214のexportへ委譲し、正規化とsha256算出はsrc/runtime/digest.tsの既存exportをそのまま使う。新規はpure judgementの6 schemaと8関数に限定し、新規DB table・新規CLI・network呼び出しを作らない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed schema・判定順序・digest責務分割の詳細設計" }
  - { role: qa, slot_label: "QA — U-EPR-001..088のunit oracle設計とmutation方針" }
  - { role: tl, slot_label: "TL — #213／#214資産との接続点監査とfailure code体系の重複排除" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md, artifact_type: test_design }
review_evidence:
  - reviewer: "code-reviewer independent subagent (AI-B)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T17:05:00+09:00"
    tests_green_at: "2026-08-09T17:02:28+09:00"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "L5/L8 pair（PLAN-L5-98、L5詳細設計、L8 unit test design）を2ラウンド独立レビュー。Round1（HEAD 383a6faa）: Critical 1件（EVENT_APPEND_ONLY_VIOLATIONとEVENT_DUPLICATE_DIGEST_MISMATCHがevaluateIdempotentIngestの同一分岐へ区別不能に割り当てられており実装不能。入力が{envelope, log}だけでありlog.entriesはappend済みeventのexact listであるため、ステップ3へ到達する入力は常に同時に書き換え要求でもあり、2 codeへ分けると一方が到達不能になる。L8のU-EPR-034とU-EPR-038を両方greenにする実装が存在しない）とImportant 2件（EVENT_LOG_SNAPSHOT_INVALIDがselectCheckpointScopeの到達関数として記載されているのに§2.6へ対応ステップが無い／§1.1の片肺proseが§2.1の判定順序と矛盾しU-EPR-S-004がL8未カバー）、Minor 4件を検出しrequest_changes。fix commit 54288123でEVENT_APPEND_ONLY_VIOLATIONをEVENT_DUPLICATE_DIGEST_MISMATCHへ統合し（failure code 20→19種、union member 18種）、§2.3と§2.6へ前提検査のステップ0を追加、§1.1を片肺2方向で別codeになる記述へ修正、U-EPR-087／088を追加してoracleをU-EPR-001..088へ拡張、Minor 4件も反映して全件解消。Round2（本ブランチHEAD 54288123）: reviewerはEVENT_APPEND_ONLY_VIOLATIONの残存参照をrepo全体へgrepして0件であることを確認し、§5表の行数を実測して19行・union member 18種が記述と一致することを検証、U-EPR-087／088が実在分岐へ到達することと両表への追記漏れが無いこと（両表とも88件・重複ID無し）を実測確認、既存ステップ番号の再採番が発生していないことをdiffで確認したうえでverdict=approve / blockers 0。統合後もL4 §6のfail-close『append済みeventの書き換えを拒否し訂正は後続eventの追記だけで表現する』が挙動として満たされることも確認済み。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/design-language.test.ts tests/design-reality-binding.test.ts tests/design-coverage.test.ts tests/sub-doc-section-structure.test.ts tests/doc-consistency.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T17:02:09+09:00", evidence_path: tests/design-reality-binding.test.ts, output_digest: "sha256:f01b41dc9aa3955d867989d8d1e9930f40468ac56317fc695dcd9292f295a289", result: "5 suites / 65 tests green" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T17:02:28+09:00", evidence_path: docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md, output_digest: "sha256:d8dfa303b90267d1bc2f1d1a14778a39d71c5484b06ce42b5347f116a22b044c", result: "PLAN checked=863、violation 0" }
dependencies:
  parent: docs/plans/PLAN-L4-72-event-projection-checkpoint-replay.md
  requires:
    - docs/plans/PLAN-L4-72-event-projection-checkpoint-replay.md
  blocks:
    - issue:215
---

# orchestration event projectionとcheckpoint replayの詳細設計（L5/L8 pair）

## 目的

PLAN-L4-72 で凍結した責務境界を、typed schema・判定関数契約・failure code 体系へ降ろす。
event envelope の exact set 11 field、各関数の判定順序、checkpoint scope 選択と replay 照合の分離、
Recovery routing の bounded 性を固定し、L8 unit test design と pair で凍結する。

## 範囲

- typed schema 6 種。内訳は event envelope と append-only log snapshot、projection snapshot、
  そして checkpoint record・checkpoint scope・recovery budget の 6 件である。
- 判定関数 8 種（`admitEventEnvelope` / `evaluateCausalOrder` / `evaluateIdempotentIngest` /
  `evaluateLifecycleTransition` / `evaluateProjectionDrift` / `selectCheckpointScope` /
  `evaluateCheckpointReplay` / `routeRecovery`）の契約と判定順序。
- `EVENT_*` failure code 19 種（うち `EVENT_RECOVERY_REQUIRED` は route 値であり union member は 18 種）と、`WORK_GRAPH_*` / `WORKER_LIFECYCLE_*` / `SCHEDULER_*` を
  再定義しない透過契約。
- L8 unit oracle U-EPR-001..088 と mutation 方針。

## 範囲外

- 判定関数の実装本体と mutation runner の実行（後続 L6/L7 PLAN）。
- DB projection、CLI surface、GitHub Projects API 呼び出しの追加。
- MIC-R-01..04（#213）と MIC-R-05..06（#214）の再定義。

## 再利用資産

- `src/runtime/digest.ts`: `canonicalJson` と `sha256Digest`。正規化と算出のプリミティブとして
  そのまま使い、第二の canonicalization 規則・第二の sha256 算出系を定義しない。
- `src/runtime/work-graph-receipt-acceptance.ts`: `acquireWorkGraphLease` の fence token CAS。
  event の lease 系譜として参照するだけで、本層は lease を取得も解放もしない。
- `src/runtime/worker-lifecycle-receipt.ts`: `verifyWorkerLifecycleReceipt` による terminal 判定。
- `src/runtime/slot-scheduler-quota-handover.ts`: `admitSlotAccountingRow` による slot 会計。
- `src/doctor/l3-g3-logical-db-receipt.ts`: `createL3G3LogicalDbReceipt` は同じプリミティブを使う
  既存 authority だが、**本設計からは呼び出さない**（doctor 専用の重量関数であり、lane / event
  境界の scope 選択も持たない）。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L5 詳細設計 doc 起草（typed schema・判定順序・digest 責務分割・failure code） | [直列] | downstream_dependency (L8 oracle は L5 の failure code と判定順序に依存) |
| 2 | L8 unit test design 起草（U-EPR oracle と eligible 束縛表） | [直列] | downstream_dependency (Step1 の判定関数に 1:1 対応させる) |
| 3 | review（独立 AI-B）と pair-freeze 準備 | [直列] | shared_state (両 doc 完成後の全体整合レビュー) |
