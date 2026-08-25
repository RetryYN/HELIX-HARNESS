---
plan_id: PLAN-REVERSE-634-issue-dependency-doctor-terminal-fullback
title: "PLAN-REVERSE-634: Issue依存doctorをcurrent-mainへ再接着する終端fullback監査"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
forward_routing: L7
promotion_strategy: reuse-as-is
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 634
behavior_contract_id: ISSUE-DEPENDENCY-DOCTOR-FULLBACK-001
responsibility_owner: github-issue-hierarchy
change_slice: atomic
refactor_step: introduce_contract
no_code_decision: no_change
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #633/#634を先行し、Issue依存graphとPLAN bindingをReverse fullbackで終端する"
contract_preconditions: "PLAN-L7-556のIssue dependency doctor実装、main read-after、live Issue/PLAN snapshotが取得できる"
contract_postconditions: "Issue #634とPLAN-L7-556の実装・依存graph・PLAN binding・main read-afterを一つのR4 evidenceへ束縛し、未成立のnative/fullback証拠をcompletion claimへ昇格しない"
contract_invariants: "prose Refsを推測しない、open dependencyをclose済みと扱わない、Issue/PLANの不一致をlegacy greenで相殺しない、current canonical L1-L12だけを意味基準にする"
contract_failures: "main HEAD不一致、Issue dependency audit finding、PLAN/Issue双方向不一致、実装PRのreview/CI/DB receipt欠落、snapshot drift、未解決依存を検出したらfail-closeする"
tdd_red_required: true
red_test: "既存のIssue hierarchy／closure graph／dependency／metadata workflow oracleがfullback evidenceまたはcurrent-main snapshot不在を検出する"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-002, test_path: tests/issue-hierarchy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-ICGRAPH-002, test_path: tests/issue-closure-graph.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-DEPD-002, test_path: tests/dependency-drift.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IMETA-WF-001, test_path: tests/issue-metadata-audit-workflow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-634-issue-dependency-doctor-terminal-fullback.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
modifies: []
dependencies:
  parent: docs/plans/PLAN-L7-556-issue-dependency-doctor.md
  requires:
    - docs/plans/PLAN-L7-556-issue-dependency-doctor.md
    - src/runtime/issue-hierarchy.ts
    - tests/issue-hierarchy.test.ts
    - tests/issue-closure-graph.test.ts
agent_slots:
  - { role: qa, slot_label: "QA — Issue dependency fullback反例とsnapshot drift" }
  - { role: tl, slot_label: "TL — #634 terminal境界と#635解放判定" }
---

# PLAN-REVERSE-634: Issue依存doctorの終端Reverse fullback

## R0 現状採取

Issue #633のIssue metadata admissionはclosedで、Issue #634の依存graph doctor実装はmainへ統合済みである。
current mainの依存監査は `findings=0` だが、PLAN-L7-556は `completion_claim_allowed: false` と
`backfill_state: pending_reverse` を維持している。この状態を、実装済みという理由だけで終端扱いしてはならない。

## R1 観測契約

本ReverseはGitHub Issue #634、PLAN-L7-556、実装PRのmerge HEAD、required CI、Claude exact-HEAD receipt、
DB projection/replay、current-mainのIssue dependency audit、PLAN/Issue snapshotを再取得する。
各値はGitHubまたはmain treeから取得し、proseの過去記録だけで補完しない。

## R2 整合契約

- `depends_on` と `blocks` の双方向性をlive auditで検査する。
- open dependencyを持つIssueをterminalと扱わない。
- scalar `plan_id` と複数 `plan_ids` の意味を混同しない。
- `decision_count` とsnapshot `plan_ids`をlive projectionへ束縛する。
- #635の解放は#634自身のcompletion claimと混同せず、明示された依存状態で判定する。

## R3/R4 完了条件

current mainでtargeted／full regression／doctor／DB convergenceがgreen、Issue dependency auditが0 findings、
PLAN-L7-556のimplementation evidenceと本ReverseのR4 evidenceが一致し、Claude exact-HEAD reviewが成立した時だけ、
本PLANをconfirmed・`backfill_state: complete`・`completion_claim_allowed: true`へ遷移する。
条件未成立の場合はdraftまたはconfirmedのままclaimを許可せず、具体的なfindingを残す。
