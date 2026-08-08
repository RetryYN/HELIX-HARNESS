---
plan_id: PLAN-L4-71-slot-scheduler-quota-handover
title: "PLAN-L4-71 (add-design): 8-slot schedulerとquota handoverの基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #214 8-slot schedulerとquota handoverをMIC要件へexact traceして実装する"]
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 214
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: slot-scheduler-quota-handover
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "Issue #213（work graphと三段receipt検収）がcloseし、acquireWorkGraphLease／releaseWorkGraphLease／verifyWorkerLifecycleReceiptがmain上でcurrent authorityである"
contract_postconditions: "slot capacity accounting、dependency-aware dispatch、bounded queue／backpressure、quota handover、slot単位failure isolation、capacity evidence gateの責務境界とL9 oracleを固定する"
contract_invariants: "同時稼働slot ≦ 8、lease二重所有0、unbounded queue 0、#213のlease／terminal receipt契約を破壊しない、agent-slotsのfail-open観測をfail-close authorityへ読み替えない"
contract_failures: "8超過、dependency前倒し、unbounded queue、lease二重所有、quota枯渇、handover喪失、1 lane failureによる独立lane消失、4-slot結果による8-slot claim"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "#213のfence token CASとterminal receipt検証をそのまま再利用し、新規はslot accounting／dispatch／queue／handoverのpure serviceに限定する。第二のlease実装とDB tableを作らず、conflict exclusionのバッチ判定も本PLANの単一実装に閉じる"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-slot-scheduler-quota-handover-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — scheduler／capacity／failure isolation境界の基本設計" }
  - { role: qa, slot_label: "QA — fail-close 8系統のL9 system oracle設計" }
  - { role: tl, slot_label: "TL — MIC-R-05..06 exact traceと#213 lease資産との境界監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/slot-scheduler-quota-handover.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-slot-scheduler-quota-handover-system-test-design.md, artifact_type: test_design }
review_evidence:
  - reviewer: "code-reviewer independent subagent (AI-B)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T01:09:00+09:00"
    tests_green_at: "2026-08-09T01:04:50+09:00"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "worktree HEAD 5b0dad25 の L4/L9 pair（PLAN-L4-71、L4基本設計、L9 system test design）を2ラウンド独立レビュー。Round1 Important 2件（MIC-AC-009のMIC-R-02 trace欠落とTL merge authorityの権限境界未記載、conflict exclusionの実装重複リスク）とMinor 2件（capacity evidence failure code未引用、handover 3軸の単一mutation化リスク）を全件修正し、Round2でverdict=approve / blockers 0。Round2のMinor 1件（oracle表の並び順崩れ）も反映済み。commitlint type違反解消のためのリベース後HEAD e9ac7d5f に対しても、gate green（2026-08-09T01:04:50+09:00）を先に確認したうえで最終確認レビューを実施し、内容が意味的に完全一致であることをdiffで突合してapprove / blockers 0を得た。reviewerはsrc/runtime/work-graph-receipt-acceptance.tsのevaluateDelegationRequestOrderingを実読してper-task判定のみであることを確認し、design-reality-binding JSONのdigestとsha256sum実測一致も検証済み。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/design-language.test.ts tests/design-reality-binding.test.ts tests/design-coverage.test.ts tests/sub-doc-section-structure.test.ts tests/doc-consistency.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T01:04:50+09:00", evidence_path: tests/design-language.test.ts, output_digest: "sha256:c0f599c2a372386591c8dda2b36cd197a0d4b6528be0896787ccef1dafbc8464", result: "5 suites / 65 tests green" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T01:04:00+09:00", evidence_path: docs/plans/PLAN-L4-71-slot-scheduler-quota-handover.md, output_digest: "sha256:d66f5c5c3d4c071eaf7a77a1807c75ccb347b5a11c18be0540199e279d641df4", result: "PLAN checked=853、violation 0" }
dependencies:
  parent: docs/plans/PLAN-L3-43-management-integration-cell-model.md
  requires:
    - docs/plans/PLAN-L4-70-work-graph-receipt-acceptance.md
  blocks:
    - issue:214
---

# 8-slot schedulerとquota handoverの基本設計（L4/L9 pair）

## 目的

Issue #214 の behavior contract を L4 基本設計として固定する。最大 8 並列 slot を
slot／parent／task／dependency／state／quota snapshot／lease／start 時刻／terminal 時刻で
accounting し、dependency-aware scheduling、bounded queue と backpressure、quota threshold 前の
handover、slot 単位 failure isolation を保証する責務境界を定義し、L9 system test design と
pair で凍結する。

## 範囲

- scheduler／capacity／failure isolation の責務境界（L4）と system-level oracle（L9）。
- fail-close 8 系統: 8 超過 / dependency 前倒し / unbounded queue / lease 二重所有 / quota 枯渇 /
  handover 喪失 / 1 lane failure による独立 lane 消失 / 4-slot 結果による 8-slot claim。
- MIC-FR-001 / MIC-R-05..06 / MIC-AC-005..009 への exact trace。MIC-AC-009 は `MIC-R-02` へも
  紐づくため MIC-R-02 を trace 先に含めるが、TL の merge authority は #213 の Parent acceptance
  evaluator に残し、本 PLAN では権限を移さない。

## 範囲外

- L5 詳細 schema・state machine・負荷 fixture の実装形（後続 L5/L8 PLAN）。
- deterministic scheduler・backpressure・lease recovery の実装と mutation tests（後続 L6/L7 PLAN）。
- event projection と checkpoint replay の実装（#215）。
- GitHub Projects projection（MIC-R-07 系）。

## 再利用資産

- `src/runtime/work-graph-receipt-acceptance.ts`: fence token CAS の `acquireWorkGraphLease` /
  `releaseWorkGraphLease`、required cell binding の exact set 検証。
- `src/runtime/worker-lifecycle-receipt.ts`: `verifyWorkerLifecycleReceipt` による terminal 判定。
- `src/runtime/agent-slots.ts`: fail-open な並列観測記録。capacity gate の authority ではないため、
  本設計では明示的に「読み替え禁止」の境界として参照する。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L4 基本設計 doc 起草（責務境界・state 遷移・fail-close・trace 表） | [直列] | downstream_dependency (L9 oracle は L4 の fail-close 一覧に依存) |
| 2 | L9 system test design 起草（U-SSQ-S oracle） | [直列] | downstream_dependency (Step1 の fail-close 系統に 1:1 対応させる) |
| 3 | review（独立 AI-B）と pair-freeze 準備 | [直列] | shared_state (両 doc 完成後の全体整合レビュー) |
