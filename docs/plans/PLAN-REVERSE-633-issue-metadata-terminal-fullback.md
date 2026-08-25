---
plan_id: PLAN-REVERSE-633-issue-metadata-terminal-fullback
title: "PLAN-REVERSE-633: Issue metadata enforcementの終端fullback監査"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
forward_routing: L5
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 633
behavior_contract_id: ISSUE-METADATA-ENFORCEMENT-001
responsibility_owner: github-issue-admission
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
  - "po_directive:Issue #633の2つのForward PLANを実装・Issue・PLANの終端へReverse fullbackする"
contract_preconditions: "PLAN-L7-555とPLAN-L7-663の実装PR、required CI、独立review、DB projection/replay、Issue #633のlive metadataが取得できる"
contract_postconditions: "2つのForward PLAN、本Reverse PLAN、Issue #633のscope・state・completion claimが同一current-main evidenceへ束縛される"
contract_invariants: "実装PR #671/#982の証拠をReverse固有の検収と混同せず、open successor #634/#635を先取りしてcloseせず、Issue/PLANの不一致を推測補完しない"
contract_failures: "Forward/Reverse双方向link、current HEAD、required CI、独立review、DB convergence、Issue dependency audit、main read-afterのいずれかが不一致ならcompletion claimへ昇格しない"
tdd_red_required: false
tdd_red_waiver_reason: "既存のIssue metadata classifier／scheduled auditのnegative oracleと、Reverse fullback専用のPLAN・Issue・dependency・DB収束gateを再利用するdocs-only照合であり、新しいRedを捏造しない"
mutation_oracle_evidence: "tests/issue-metadata-audit.test.ts と tests/issue-metadata-audit-workflow.test.ts の既存mutation oracleを再利用し、Reverse固有の双方向link欠落・Issue graph不一致・receipt staleはbackfill-pairing、issue-dependency-audit、closure contractでfail-closeする"
complexity_effect: net_neutral
complexity_justification: "既存の2つのForward PLAN、Issue metadata実装、scheduled workflow、既存のIssue/PLAN/DB gateを再実装せず、#633の終端照合へ束ねる"
removal_trigger: "Issue #633の2つのForward PLANと本Reverseの終端証拠が#204全surface収束へ統合された時点"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md
    reason: "Issue metadata taxonomy、live audit、writeなしの監査境界は既存requirementsとForward実装で確定しており、本Reverseは新しい要求を追加しない。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "既存のIssue metadata classifierとscheduled workflowの責務境界を再実装せず、main上の実装証拠を照合するだけである。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/helix/L5-detail/issue-scope-authority-gates.md
    reason: "Issue/PLAN scope authorityとmetadata failureの詳細契約はForward側で確定しており、Reverseはschemaを変更しない。"
  - layer: verification-design
    decision: not_impacted
    evidence_path: docs/test-design/harness/L8-unit-test-design.md
    reason: "既存のclassifier／workflow oracleを再利用し、Reverse固有の終端条件は既存gateで検証する。"
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-IMETA-001, test_path: tests/issue-metadata-audit.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-IMETA-WF-001, test_path: tests/issue-metadata-audit-workflow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-633-issue-metadata-terminal-fullback.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
modifies: []
dependencies:
  parent: docs/plans/PLAN-L7-663-issue-metadata-scheduled-audit.md
  requires:
    - docs/plans/PLAN-L7-555-issue-metadata-enforcement.md
    - docs/plans/PLAN-L7-663-issue-metadata-scheduled-audit.md
    - src/runtime/issue-metadata-audit.ts
    - .github/workflows/issue-metadata-audit.yml
  references:
    - docs/plans/PLAN-L7-555-issue-metadata-enforcement.md
    - docs/plans/PLAN-L7-663-issue-metadata-scheduled-audit.md
    - src/runtime/issue-metadata-audit.ts
    - tests/issue-metadata-audit.test.ts
    - .github/workflows/issue-metadata-audit.yml
    - tests/issue-metadata-audit-workflow.test.ts
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — Issue metadata／Reverse pair／snapshot反例" }
  - { role: tl, slot_label: "TL — #633 terminal境界と#634/#635解放条件" }
---

# PLAN-REVERSE-633: Issue metadata enforcementの終端Reverse fullback

## R0 現状採取

Issue #633が所有する `PLAN-L7-555-issue-metadata-enforcement` と
`PLAN-L7-663-issue-metadata-scheduled-audit` を、PR #671／#982のcanonical merge、required CI、Claude
独立review、DB projection/replayと照合する。実装済みという事実だけではForward PLANやIssueの終端を推測しない。

## R1 観測契約

- #555はIssue metadata classifierとそのnegative oracleを所有する。
- #663は全Issue metadataのscheduled／workflow_dispatch監査配線とworkflow oracleを所有する。
- #633は2つのForward PLANの実装を再実装せず、Issue／PLAN／PR／current-mainの終端関係だけを所有する。
- #634と#635は後続Issueであり、本Reverseからclosedやcompletion claimを先取りしない。

各値はmain tree、GitHub live state、required CI、DB projection/replay、Issue dependency auditから再取得し、過去のproseだけで補完しない。

## R2 As-Is整合

Issue metadataのclassifier、scheduled audit、Issue writeなしの監査境界はForward実装の責務として維持する。
本Reverseは新しいtaxonomy、GitHub write adapter、別のIssue/PLAN authority、別DB projectionを追加しない。
`PLAN-L7-555` と `PLAN-L7-663` の `requires` から本Reverseへ接続し、本Reverseの `references` から両Forward PLANへ
戻る双方向linkを必須とする。

## R3 意図照合

Issue #633の意図は、起票metadataの機械強制とscheduled live監査をmainへ着地させ、実装PR・Forward PLAN・Issueの
completion claimを一致させることである。#634の依存graphや#635のworkflow guideを#633へ混載しない。

## R4 Forward再入・終端条件

次の全条件を同一candidateへ束縛した時だけ、本PLANと両Forward PLANを終端化する。

1. #555／#663のmerge HEAD、required CI、独立review receiptが実装PRと一致する。
2. Forward/Reverse PLANの双方向link、Issue #633のplan_ids、PR scopeが一致する。
3. targeted／full regression、typecheck、DB rebuild/replay、doctor、Issue dependency auditがgreenである。
4. current-main read-afterでIssue #633のterminal条件とoutstanding projectionが一致する。
5. 本Reverse PRのcurrent HEADをClaude Code Opusが独立reviewし、blocker 0のreceiptを残す。

条件未成立の間は `status: draft`、`backfill_state: pending_reverse`、`completion_claim_allowed: false` を維持する。
条件成立後、同一PRの原子的更新で本PLANと両Forward PLANを
`status: confirmed`、`backfill_state: complete`、`completion_claim_allowed: true`へ遷移させる。
Issue #633のcloseは、その後のcanonical mergeとmain read-afterでのみ行い、#634/#635の未解決依存を成功へ丸めない。
