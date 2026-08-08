---
plan_id: PLAN-L7-527-slot-scheduler-quota-handover
title: "PLAN-L7-527 (add-impl): 8-slot schedulerとquota handoverの機能設計と実装"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #214 8-slot schedulerとquota handoverをMIC要件へexact traceして実装する"]
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 214
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: slot-scheduler-quota-handover
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-97のL5/L8 pairがconfirm済みであり、判定関数7種・判定順序・SCHEDULER_* failure code 16種が凍結されている"
contract_postconditions: "slot accounting／dispatch／queue／handover／failure isolation／frontier再計算／capacity evidenceのpure judgementが実装され、SCHEDULER_* 16 codeがexecutable oracleで到達可能になる"
contract_invariants: "#213のacquireWorkGraphLeaseを唯一のCASとして呼び出し第二のlease実装を作らない、DB／network／workflow変更0、agent-slotsのfail-open観測を判定入力にしない"
contract_failures: "U-SSQ-001..082がexact set欠落・unknown field相殺・capacity超過・dependency前倒し・unbounded queue・lease二重所有・事後handover・handover喪失・failure isolation breach・undersized capacity evidence・merge authority侵害のmutantをRedにする"
tdd_red_required: false
mutation_oracle_required: true
tdd_note: "classic Red-first cycle は踏んでいない（実装 → oracle の順で書いた）ため tdd_red_required=false とし、falsification 証跡は mutation_oracle_required=true 側の tracked runner に一本化する。red_at/green_at を実在しない Red 実行として宣言しない"
mutation_oracle_evidence: "output_digest sha256:b4456bd87eabf46aa3d86c5827beeb5606d256d9950259f1bd45b834d9ac7b5e（2026-08-08T18:38:34Z 実行）。tracked runner `tests/tools/slot-scheduler-mutation/run-mutation.ts` が source mutant 54 体を実生成して tests/slot-scheduler-quota-handover.test.ts を実行し、54/54 killed・survived 0・pattern_missing 0 で exit 0。初回 39 体では 2 体が生存し（exact set の surplus field 未カバー、handover 必須キー走査の到達不能な二重判定）oracle 追加と分岐削除で解消。独立レビューが検出した CAS 自己参照・failure code 再命名・未カバー分岐に対して mutant 8 体（handover-cas-observed-lease-self-referential 等）と oracle U-SSQ-066..074 を追加した。2 ラウンド目で検出された deepFreeze の入力凍結副作用（frozenClone による複製で解消）と未カバー分岐 5 件に対しても mutant 7 体と oracle U-SSQ-075..082 を追加した"
complexity_effect: net_negative
complexity_justification: "pure judgementの単一moduleへ集約し、#213のlease CASとterminal receipt検証を再利用してscheduler側の重複判定を作らない"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md
pair_artifact: docs/test-design/helix/L8-slot-scheduler-quota-handover-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-001, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-002, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-003, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-004, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-005, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-006, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-007, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-008, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-009, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-010, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-011, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-012, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-013, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-014, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-015, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-016, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-017, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-018, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-019, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-020, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-021, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-022, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-023, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-024, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-025, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-026, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-027, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-028, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-029, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-030, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-031, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-032, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-033, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-034, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-035, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-036, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-037, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-038, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-039, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-040, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-041, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-042, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-043, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-044, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-045, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-046, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-047, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-048, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-049, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-050, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-051, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-052, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-053, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-054, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-055, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-056, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-057, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-058, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-059, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-060, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-061, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-062, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-063, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-064, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-065, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-066, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-067, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-068, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-069, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-070, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-071, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-072, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-073, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-074, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-075, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-076, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-077, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-078, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-079, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-080, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-081, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-082, test_path: tests/slot-scheduler-quota-handover.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 判定順序とconflict exclusion 4軸のpure実装" }
  - { role: qa, slot_label: "QA — U-SSQ-001..082のexecutable oracleとmutation runner" }
  - { role: tl, slot_label: "TL — #213 lease資産の再利用境界と到達不能分岐の監査" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-slot-scheduler-quota-handover-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/slot-scheduler-quota-handover.ts, artifact_type: source_module }
  - { artifact_path: tests/slot-scheduler-quota-handover.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/slot-scheduler-mutation/run-mutation.ts, artifact_type: script }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T18:45:00Z"
  review_binding:
    reviewer: "code-reviewer independent subagent (AI-B)"
    reviewed_at: "2026-08-08T18:45:00Z"
    evidence_digest: "sha256:93e24dee0f54bb43046e804dd996b3de6c53e2feeda4401c0640dad20ad2b9b3"
  entries: []
review_evidence:
  - reviewer: "code-reviewer independent subagent (AI-B)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T18:45:00Z"
    tests_green_at: "2026-08-08T18:38:34Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "L6/L7実装スライス（PLAN-L7-527、L6機能設計、L6機能単体テスト設計、src/runtime/slot-scheduler-quota-handover.ts、tests/slot-scheduler-quota-handover.test.ts、tests/tools/slot-scheduler-mutation/run-mutation.ts）を3ラウンド独立レビュー。Round1: Critical 2件（evaluateQuotaHandoverがacquireWorkGraphLeaseのcurrentLeaseとexpectedFenceTokenの双方にpacket.writer_leaseを渡しCASが自己参照で無効化されていた／acquireWorkGraphLeaseの失敗を一律SCHEDULER_LEASE_DOUBLE_OWNERSHIPへ再命名しL5 §4の透過規定に違反していた）とImportant 3件・Minor 3件を検出しrequest_changes。reviewerはfence_token=999の偽造packetがok:trueで通ることをreproで実証した。Round2: Critical 0、Important 2件（deepFreezeが浅いspreadの上に再帰凍結をかけ呼び出し側の入力オブジェクトまで凍結する副作用／oracle・mutantの無い分岐が5件残存）とMinor 2件を検出しrequest_changes。Round3（HEAD 32619133）: frozenCloneによる副作用解消、oracle U-SSQ-075..082とmutant 7体の追加、failure型unionのQuotaHandoverResultへの限定を独立検証し、実装の全return分岐46箇所を列挙してoracle/mutantと突合したうえでverdict=approve / blockers 0。残存Minorは複合OR条件のサブ節網羅1件のみ。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/slot-scheduler-quota-handover.test.ts tests/design-language.test.ts tests/design-reality-binding.test.ts tests/design-coverage.test.ts tests/sub-doc-section-structure.test.ts tests/doc-consistency.test.ts tests/review-evidence.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T03:38:04+09:00", evidence_path: tests/slot-scheduler-quota-handover.test.ts, output_digest: "sha256:57e5d95cccf096a3f611a3e4ebdf02b5d96f0734af79bb243049b5705c7a0651", result: "7 suites / 177 tests green（うち slot-scheduler oracle 82 件）" }
dependencies:
  parent: docs/plans/PLAN-L5-97-slot-scheduler-quota-handover.md
  requires:
    - docs/plans/PLAN-L5-97-slot-scheduler-quota-handover.md
  blocks:
    - issue:214
---

# 8-slot schedulerとquota handoverの実装（L7、pair は L6 機能設計）

## 目的

PLAN-L5-97 で凍結した typed schema と判定関数契約を、pure judgement の単一 module と
executable oracle へ降ろす。capacity 会計、dependency-aware dispatch、bounded queue の
backpressure、quota threshold 前 handover、slot 単位 failure isolation、merge authority の
非移譲、capacity evidence の lane 数検査を実装し、分岐網羅を mutation runner で機械裏付けする。

## 範囲

- `src/runtime/slot-scheduler-quota-handover.ts` の 7 export と `SCHEDULER_*` 16 failure code。
- `tests/slot-scheduler-quota-handover.test.ts` の U-SSQ-001..082（静的タイトルの `it()` と 1:1）。
- `tests/tools/slot-scheduler-mutation/run-mutation.ts` の mutant 54 体。
- L6 機能設計と L6 機能単体テスト設計の pair。

## 範囲外

- DB projection、CLI surface、GitHub Projects への投影。
- event projection と checkpoint replay の実装（#215）。
- 実運用の 8-lane 負荷 fixture 実行（capacity evidence の受理判定だけを実装する）。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L6 機能設計と L6 機能単体テスト設計の起草 | [直列] | downstream_dependency (実装は L6 の責務割付に従う) |
| 2 | pure judgement 7 関数の実装と 82 oracle の Red→Green | [直列] | downstream_dependency (Step1 の判定順序に写像する) |
| 3 | mutation runner の作成と生存 mutant の解消 | [直列] | shared_state (実装と oracle の両方を触るため) |
| 4 | review（独立 AI-B）と pair-freeze 準備 | [直列] | shared_state (実装・oracle・doc の全体整合レビュー) |
