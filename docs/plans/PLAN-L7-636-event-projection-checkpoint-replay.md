---
plan_id: PLAN-L7-636-event-projection-checkpoint-replay
title: "PLAN-L7-636 (impl): orchestration event projection と checkpoint replay の pure 判定を実装する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
entry_signals:
  - "issue:215 event projectionとcheckpoint replayのpure judgement"
  - "dependency:issue-503 closed後のL6/L7再入"
created: 2026-08-19
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 215
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-98のL5/L8 pairとIssue #503の到達可能性是正がcurrent authorityとして存在し、U-EPR-001..102がcanonical表として固定されている"
contract_postconditions: "8 pure judgement exportsがL5 schema、failure code、判定順序を再定義せず実装され、U-EPR-001..102のexecutable oracleとsource mutationで分岐が反証可能になる"
contract_invariants: "入力を変更しない、digestはsrc/runtime/digest.tsを再利用する、scope未指定を全体scopeへ昇格しない、DB／filesystem／network／CLI writeを持たない、#213/#214/#499の責務を再実装しない"
contract_failures: "event片肺、unknown field相殺、duplicate side effect、causal inversion、illegal transition、projection drift、orphan lane、checkpoint／HEAD／parent欠落、scope流用、non-idempotent replay、無制限retryをfail-closeする"
tdd_red_required: false
mutation_oracle_required: true
mutation_oracle_evidence: "未実施。実装PRでsource mutantとU-EPR oracleの実測結果を記録する"
complexity_effect: net_negative
complexity_justification: "pure judgementを1 moduleへ集約し、既存digestと#213/#214のauthorityを再利用する。transactional I/Oは#499へ分離する"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md
pair_artifact: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
agent_slots:
  - { role: se, slot_label: "SE — pure judgement moduleとtyped input/output" }
  - { role: qa, slot_label: "QA — U-EPR-001..102とmutation oracle" }
  - { role: tl, slot_label: "TL — #213/#214境界と#499引き渡し" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-636-event-projection-checkpoint-replay.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/event-projection-checkpoint-replay.ts, artifact_type: source_module }
  - { artifact_path: tests/event-projection-checkpoint-replay.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/event-projection-mutation/run-mutation.ts, artifact_type: script }
dependencies:
  parent: docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
  requires:
    - docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
    - docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
  blocks:
    - issue:215
    - issue:499
---

# orchestration event projection と checkpoint replay の pure 判定

## 目的

旧 `PLAN-L7-531-event-projection-checkpoint-replay` は既存の `PLAN-L7-531-psc-l9-gate-system.md`
と採番キーが衝突するため採用しない。本PLANは、L5/L8 pairのcurrent authorityをL6/L7実装へ
接続するための正規IDである。採番訂正と実装着手を同じ完了主張にしない。

## 実装範囲

- event envelope、causal order、idempotent ingest、lifecycle transition
- projection drift、checkpoint scope、checkpoint replay、bounded recovery routing
- U-EPR-001..102のexecutable oracleとsource mutation

## 非対象

- `#499`のtransactional I/O、append、projection table、checkpoint persistence
- 新CLI、GitHub Projects API、network、filesystem write
- #213/#214のlease、terminal、slot accounting authorityの再実装

このPLANはdraftかつ`completion_claim_allowed: false`であり、実装・検証・Claude独立reviewが
同一HEADで成立するまでconfirmedまたは完了扱いにしない。
