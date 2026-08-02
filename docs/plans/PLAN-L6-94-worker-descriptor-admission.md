---
plan_id: PLAN-L6-94-worker-descriptor-admission
title: "PLAN-L6-94 (add-design): worker descriptor admission関数設計"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-03 Feature #92の連続dispatchとしてIssue #225 WCC-FR-01をL6/L7へ降下する"
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-01
responsibility_owner: worker-descriptor-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-86の型・failure・state・L8 oracleがmainへmerge済みで、実装inventoryで確認したsource実態との意味残差を同一contract内で是正する"
contract_postconditions: "strict parser、2 source projection、snapshot canonicalizer、identity resolver、decision、stale predicateが副作用なしで一意になる"
contract_invariants: "source write 0、spawn 0、新永続registry 0、暗黙capability mapping 0、digest self-reference 0"
contract_failures: "invalid、digest drift、not found、ambiguous、inactive、capability mismatch、staleを固定順でfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "production pure module 1件、永続state／I/O／workflow 0で既存sourceを共通decisionへ縮約する"
removal_trigger: "not_applicable: compatibility layerや重複ownerを追加しない"
parent_design: docs/design/helix/L5-detail/worker-descriptor-admission.md
pair_artifact: docs/test-design/helix/L8-worker-descriptor-admission-runtime-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — source projection／digest／resolver関数設計" }
  - { role: qa, slot_label: "QA — 13 executable mutation oracle" }
  - { role: tl, slot_label: "TL — source実在性と後続責務境界監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-94-worker-descriptor-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/worker-descriptor-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-descriptor-admission-runtime-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-86-worker-descriptor-admission.md
  requires:
    - docs/plans/PLAN-L4-60-worker-descriptor-admission.md
    - docs/design/helix/L5-detail/worker-descriptor-admission.md
    - docs/test-design/helix/L8-worker-descriptor-admission-unit-test-design.md
    - docs/test-design/helix/L9-worker-descriptor-admission-system-test-design.md
  blocks:
    - docs/plans/PLAN-L7-497-worker-descriptor-admission.md
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-02T16:53:04Z"
    tests_green_at: "2026-08-02T16:53:04Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "PR #355 HEAD ebfa49ece8e75c6dc9bede42635feeaa16d25880をread-only再照合。WCC-FR-01の19-path exact scope、source実在性、identity/capability、digest連鎖、decision forge、stale、13 oracle、後続非混載を確認。Critical/High/Medium 0、content blocker 0。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-descriptor-admission.test.ts tests/worker-descriptor-admission-design.test.ts tests/worker-descriptor-admission-detail-design.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-02T16:53:04Z", evidence_path: tests/worker-descriptor-admission.test.ts, output_digest: "sha256:55a9beac5c3372af0c1a4f6b2e2aa58a8757b20e6d972287450aea4087afaa29", result: "3 files / 25 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-02T16:53:04Z", evidence_path: src/runtime/worker-descriptor-admission.ts, output_digest: "sha256:de9f3a3e20bc6727d81567c2067302d474f6870d3ae848bc5b118b4db1058ce6", result: "exit 0; stdout empty" }
---

# PLAN-L6-94: worker descriptor admission関数設計

1. 実在specialist entryとPython descriptor contractをsource inputへ固定し、実装済みでないregistryをclaimしない。
2. source record、projection entry、snapshot、decisionのdigest payloadをexact化する。
3. identity 2-tuple解決とcapability別検証で全failureを到達可能にする。
4. L7 executable oracleをL8/L9へexact traceする。
5. 独立AI-B content review後にpairをconfirmedへ遷移する。
