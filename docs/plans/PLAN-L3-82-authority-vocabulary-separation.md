---
plan_id: PLAN-L3-82-authority-vocabulary-separation
title: "PLAN-L3-82 (redesign): authority語彙分離"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-09-04T18:03:15Z"
  plan_id: PLAN-L3-82-authority-vocabulary-separation
  approval_record_id: L3-PO-1449-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1449#issuecomment-5544538084"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  # current routerのlegacy input-only token。AVS canonical化後はrequest_directiveへ移行する。
  - "po_directive:Issue #1449 会話・selection・approval・disposition・runtime judgmentのgeneric decision混在を是正する"
created: 2026-09-02
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1449
behavior_contract_id: AUTHORITY-VOCABULARY-SEPARATION-001
responsibility_owner: authority-vocabulary
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: dual_green
backprop_decision: not_required
backprop_decision_reason: "本PLANがIssue-onlyの語彙補正をL1/L3/L10 source authorityへ戻すAuthority Sliceである。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "#1449、#1448、#1364、#1384の責務境界をread-afterできる"
contract_postconditions: "decision／selection／approval／disposition／runtime_judgment／directiveの境界と20 oracleがplan固有承認候補になる"
contract_invariants: "会話非authority、AI human provenance生成禁止、ADR decision限定、approval exact binding、memory coordination-onlyを維持する"
contract_failures: "相談・叱責・質問・directiveのauthority昇格、directiveをrationaleにした思考放棄、全件人間判断への丸投げ、generic decision再出力、superseded memory再浮上を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは未承認requirements candidateのみを起草し、runtime／rule enforcementは承認後のL4以降へ分離する。"
complexity_effect: net_negative
complexity_justification: "generic decision／PO attributionへ混在する意味をtyped identityとowner authorityへ分離する。"
removal_trigger: "candidateがplan固有承認とcanonical promotionを経てcurrent source authorityへ置換された時"
parent_design: docs/governance/candidates/authority-vocabulary-requests.md
pair_artifact: docs/governance/candidates/authority-vocabulary-acceptance.md
dependencies:
  parent: docs/governance/candidates/authority-vocabulary-requests.md
  requires: []
  references:
    - issue:1364
    - issue:1384
    - issue:1448
    - issue:1449
    - issue:1580
  blocks:
    - issue:1448
generates:
  - { artifact_path: docs/plans/PLAN-L3-82-authority-vocabulary-separation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/authority-vocabulary-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/authority-vocabulary-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/authority-vocabulary-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — 会話入力とauthorityの分離" }
  - { role: se, slot_label: "SE — typed vocabularyとcompatibility adapter" }
  - { role: qa, slot_label: "QA — authority昇格・思考放棄・memory再浮上反例" }
  - { role: tl, slot_label: "TL — ADR／requirements／approval／learning責務境界" }
review_evidence: []
---

# authority語彙分離

## Authority境界

本PLANはIssue #1449のtyped human gate recordでL3候補承認済みである。canonical L1/L3/L10昇格、Requirement IR、Claude/Codex managed rule、runtime、schema、DB、memory admissionへの反映は別工程とし、draftとcompletion falseを維持する。

承認対象は承認時点main `ab6126a89262c91ecc4b87a0b8f0b9724917c84b` の3候補本文である。frontmatterを除いたSHA-256はrequests `fcd862d7481ffec6c52376dc0a13d5f4df5d6548f3b6ed3f09173d160259efce`、requirements `59d9aa5711ac248b4895f33547303fad63ae63053e152a9c949420ffceeb7d1a`、acceptance `4392eca32ddf6d1769f5d461f274d6e6bead17ffdc6284c23254b34f23aceaad`で、意味集合はBR 6件、FR 5件、R 16件、AC 16件とする。

## 実装順

1. candidateのplan固有承認とcanonical source authority化
2. #397 Requirement IR admission
3. 語彙inventoryとexact compatibility map
4. Claude/Codex shared brief・managed marker・rule-drift
5. memory admission・SessionStart projection
6. schema／DB／CLI／generated docsの原子的移行
7. doctor／mutation／Reverse fullback／main反映後の再読
