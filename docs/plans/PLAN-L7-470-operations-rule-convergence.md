---
plan_id: PLAN-L7-470-operations-rule-convergence
title: "PLAN-L7-470 (impl): GitHub収束運用ルールの正本整合"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-26 すぐ直せるfindingはcurrent PRで直し、独立責務だけIssueへ送る"
created: 2026-07-26
updated: 2026-07-26
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: github-review-convergence
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "GitHub運用正本、AI-A/AI-B adapter、finding promotion設計、既存rule-drift gateが存在する"
contract_postconditions: "AI-Aが作成、current PR局所修正、AI-B receiptの機械転記、Ready化を担い、read-only AI-Bが一巡収束review、転記再照合、明示mergeを担う。独立責務だけをsuccessor Issueへ送る"
contract_invariants: "native auto-merge、新review lane、新detector、新CI jobを追加せず、current behavior/correctness/securityを後続Issueへ逃がさない"
contract_failures: "AI-Bの編集・push、severity単独Issue化、局所findingのpromotion、独立改善のcurrent PR再流入、review無限反復、adapter driftをfail-closeする"
tdd_red_required: true
red_at: "2026-07-26T06:40:00+09:00"
green_at: "2026-07-26T07:02:00+09:00"
mutation_oracle_evidence: "tests/rule-drift.test.tsでmerge/review/disposition marker欠落のseeded mutationをkilledし、tests/harness-memory-reconciliation-binding.test.tsでauto-mergeとcurrent PR/Issue境界の旧文言を拒否する"
complexity_effect: net_neutral
complexity_justification: "既存rule-driftの共有marker集合へ4項目を追加し、新しいdetector、schema、CI job、dependencyを作らない"
removal_trigger: "全runtime adapterが単一のtyped運用policyから生成され、prose marker比較が不要になった時点で追加markerをgenerator契約へ統合する"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-RDRIFT-004, test_path: tests/rule-drift.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-MEMV2-005e, test_path: tests/harness-memory-reconciliation-binding.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — 運用正本とadapter marker整合"
  - role: qa
    slot_label: "QA — drift mutationとfreeze packet整合"
  - role: tl
    slot_label: "TL — current PR修正とsuccessor Issue境界"
generates:
  - { artifact_path: docs/plans/PLAN-L7-470-operations-rule-convergence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/operations-rule-audit-2026-07-26.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: src/lint/rule-drift.ts, artifact_type: source_module }
  - { artifact_path: tests/rule-drift.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-memory-reconciliation-binding.test.ts, artifact_type: test_code }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-26T00:21:09Z"
  review_binding:
    reviewer: "Claude AI-B / claude-opus-5[1m]"
    reviewed_at: "2026-07-26T00:21:09Z"
    evidence_digest: "sha256:5cf40c4703293af67082a5380377c745c25d924aa0f5495e7649996838e1254a"
  entries: []
review_evidence:
  - reviewer: "Claude AI-B / claude-opus-5[1m]"
    review_kind: cross_agent
    reviewed_at: "2026-07-26T00:21:09Z"
    tests_green_at: "2026-07-26T00:15:13Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: "claude-opus-5[1m]"
    scope: "PR #142 content HEAD fd95f903e62874e7ed30a33d72438d373ff640c3をclean detached checkoutでread-only再監査し、freeze packet事実分離、review receipt転記主体、有限再review条件、33 path exact scope、14件のL12 disposition継続、2件のL3 digest更新を承認した。新しい独立blocker 0、left_arm_carry=no_pushback。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/142#issuecomment-5081197528"
dependencies:
  parent: docs/plans/PLAN-L7-463-engineering-discipline-contract.md
  requires:
    - docs/design/helix/L3-requirements/github-merge-admission-requirements.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
  blocks: []
---

# PLAN-L7-470: GitHub収束運用ルールの正本整合

## 目的

PR #138で顕在化した重複実装とfinding dispositionのねじれを、運用正本、L1〜L5設計、runtime adapter、
既存`rule-drift`へ同じ契約として収束させる。

## 非対象

- finding promotion transaction本体の実装
- PR ownership leaseの実装
- CI高速化、spool prune、別review lane
- 新しいdetector、schema、dependency、CI job

## 完了条件

- native auto-mergeを禁止し、AI-Bのcurrent HEAD明示mergeだけを許可する。
- AI-Bはread-onlyで一巡収束し、blockerを同一HEADにつき一括返却する。
- AI-BはreceiptをPR commentへ記録し、AI-AがPLANへ機械転記してReady化し、AI-Bが最終HEADで再照合する。
- current contract内の局所correctness/securityはcurrent PRで修正する。
- 独立責務、別設計、lifecycle、性能改善だけをsuccessor Issueへ送り、current PRへ戻さない。
- L1/L3/L4/L5のfinding dispositionとtest designが同じtyped境界を持つ。
- targeted tests、plan lint、typecheck、freeze packet digest検査がgreenになる。
