---
title: "worker risk admission L6関数テスト設計"
layer: L6
artifact_type: test_design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L6-102-worker-risk-admission.md
pair_artifact: docs/design/helix/L6-function-design/worker-risk-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
---

# worker risk admission L6関数テスト設計

`decideWorkerRiskAdmission`のexact input、capability lookup、critical pre-filter、用途別policy、stable sort、receipt sealを
U-WRA-001〜005へ束縛する。critical分岐、receipt seal、effort justification、required risk最小score判定を
除去するmutationはRedでなければならない。
