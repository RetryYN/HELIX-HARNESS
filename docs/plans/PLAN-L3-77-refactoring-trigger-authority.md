---
plan_id: PLAN-L3-77-refactoring-trigger-authority
title: "PLAN-L3-77: REFACTORING trigger policyとRF0 admissionをL3/L10へfreezeする"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: false
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-09-01T19:56:11Z"
  plan_id: PLAN-L3-77-refactoring-trigger-authority
  approval_record_id: L3-PO-1353-002
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1353#issuecomment-5499608673"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:2026-09-02 HELIX_REFACTORING_TRIGGER_IMPROVEMENT_DIRECTIVE_v0.1.mdを最適化して正本へ取り込む"
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1353
behavior_contract_id: REFACTORING-TRIGGER-ADMISSION-001
responsibility_owner: system-synthesis-refactoring-trigger-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "本PLAN自体がRequirement Re-entryのauthority sliceであり、L3/L10 pairへ直接再freezeするため追加backprop vehicleは不要。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "System Synthesis、UIL、Universal Workflow、REFACTORING RF0-RF6のauthorityがcurrent mainに存在する"
contract_postconditions: "SYN-R-11/R-12とSYN-AC-015..020がtrigger policy、RF0 admission、anti-starvationを閉じる"
contract_invariants: "新route／DB／event busを作らず、単一metricやsafety-netだけでrefactorを発火せず、意味変更をREFACTORINGへ入れない"
contract_failures: "stale policy、wrong baseline、partial scan、missing source、unknown scope、semantic change、runtime hardcodeを拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3/L10 authorityだけを更新し、policy registry、evaluator、adapter、projectionを後続原子sliceへ分離する。"
complexity_effect: justified_positive
complexity_justification: "既存UIL event／findingとSystem Synthesis RF0を2契約で接続し、251行の独立指示書を新正本として残さない。"
removal_trigger: "System Synthesisのcurrent requirements baselineへ吸収され、後続runtime全sliceがmain read-afterまで終端した時。"
parent_design: docs/design/helix/L3-requirements/system-synthesis-requirements.md
pair_artifact: docs/governance/candidates/refactoring-trigger-admission-acceptance.md
dependencies:
  parent: docs/design/helix/L3-requirements/system-synthesis-requirements.md
  requires: []
  blocks: []
  references:
    - "issue:1353"
    - "issue:1033"
    - "issue:1040"
    - "issue:1170"
    - "issue:1210"
agent_slots:
  - { role: tl, slot_label: "TL — UIL／System Synthesis／Universal Workflow責務境界" }
  - { role: qa, slot_label: "QA — trigger policy／admission／anti-starvation mutation" }
review_evidence:
  - reviewer: claude-code
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    review_kind: cross_agent
    reviewed_at: "2026-09-02T05:00:30+09:00"
    tests_green_at: "2026-09-02T04:59:37+09:00"
    verdict: approve
    scope: "PLAN-L3-77 exact-HEAD 78a6965dd 独立検収。前回検収HEADとの差分が承認record差し替えだけであること、canonical requirements無変更のcandidate隔離、RTG-R-01..06とRTG-AC-001..012のexact対応、承認とcanonical promotionの境界分離、verification緩和拒否を確認した。承認判断自体は本evidenceの射程外。"
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewed_head_sha: 78a6965ddf6e9569941337937f20d22e77935aad
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/design-language.test.ts tests/design-coverage.test.ts tests/oracle-test-trace.test.ts tests/ddd-tdd-rules.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-02T04:59:37+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:bd06cb2cf9986e76079bb88f7758fd9e5ac6ccf0fe463a895e3b456ac875a19a"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-02T04:59:37+09:00"
        evidence_path: docs/plans/PLAN-L3-77-refactoring-trigger-authority.md
        output_digest: "sha256:2f279fd5db8d5b9f62e1bc861a4c29f0ae1169894351e4964eacc099eb91187c"
generates:
  - { artifact_path: docs/plans/PLAN-L3-77-refactoring-trigger-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/refactoring-trigger-admission-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/refactoring-trigger-admission-acceptance.md, artifact_type: markdown_doc }
---

# REFACTORING trigger authorityのfreeze

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 既存UIL trigger、System Synthesis RF0-RF6、Universal Workflow routingを棚卸し | owner重複と新規Coreがない |
| 2 | Trigger PolicyとRF0 AdmissionをL3/L10へ追加 | 6 R／12 ACがexact対応する |
| 3 | 元指示書を処分 | root原稿をcurrent authorityとして残さない |
| 4 | PO L3 approval、independent review、G3再freeze | 後続runtime sliceを開始できる |

本PLANではruntime、registry、DB、CLIを変更しない。PO L3 approvalは新しいplan固有recordで成立したが、
`docs/governance/candidates/`の成果物はcanonical promotion前の隔離を維持し、current authorityやG3 freezeへ先行投影しない。
後続のpromotion sliceで正規L3/L10へ移動してから、policy、evaluator、admission、projection、anti-starvation、
dogfood／Reverseへ原子的に分割する。
