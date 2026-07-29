---
plan_id: PLAN-L3-52-github-security-admission
title: "PLAN-L3-52 (add-design): GitHub security evidence admissionをL3/L10へ定義"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-29 Codex Security CLIをL gate、slice、deploy gateへ接続しGitHub security設定を整備する"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: GH-FR-029
responsibility_owner: github-security-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "GH-FR-006/009/010/019/021/025とGitHub／Codex Securityのread-only capability観測が存在する"
contract_postconditions: "複数security scannerのcoverage／finding／policy receiptが同一HEAD／artifactへ束縛され、slice／merge／deploy admissionをexactly once判定する"
contract_invariants: "scannerをauthorityにせず、coverage不完全をfinding 0で相殺せず、GitHub settings applyとproduction deployはaction-binding human approvalを維持する"
contract_failures: "HEAD/artifact drift、partial/unknown coverage、required scanner未設定、Critical/High、期限切れwaiver、credential過剰露出、未pin Actionをfail-closeする"
tdd_red_required: false
complexity_effect: neutral
complexity_justification: "既存scannerを複製せず、その証拠を統合するadmission decision一責務だけを追加する"
removal_trigger: "上位Admission Engineがsecurity evidence schemaと同一判定を吸収し本ownerのconsumerが0になった時点"
github_issue_id: 270
parent_design: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — slice／merge／deployment security admission境界"
  - role: qa
    slot_label: "QA — coverage、severity、permission、driftのnegative oracle"
generates:
  - artifact_path: docs/plans/PLAN-L3-52-github-security-admission.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-security-admission-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-security-admission-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: tests/l3-github-security-admission.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
  requires:
    - docs/plans/PLAN-L3-36-atomic-development-contract.md
  references:
    - docs/design/helix/L3-requirements/github-atomic-development-requirements.md
    - docs/plans/PLAN-L3-19-github-operations-projection.md
    - docs/plans/PLAN-L3-24-github-environment-promotion.md
  blocks: []
---

# PLAN-L3-52: GitHub security evidence admission

## §工程表

### Step 1: capability／authority gap監査 [直列]

- GitHub security設定、CodeQL、secret／dependency保護、Actions policyをread-only観測する。
- Codex Security CLIのbeta capability、exit code、coverage、CI境界を公式仕様へ照合する。

### Step 2: L3/L10 pair定義 [直列]

- `GitHubSecurityAdmission`一責務へscanner evidenceを統合する。
- PR、candidate、deploymentのprofileとnegative oracleを定義する。

### Step 3: 独立review [直列]

- authoring runtimeと異なるAI-Bがcurrent HEAD、公式仕様、既存GH責務との重複、L3/L10 polarityを確認する。
- Critical／High／Medium 0とfull CI greenを同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- scanner追加とadmission判定の責務が分離される。
- Codex Security利用不能やcoverage不完全をgreenにしない。
- PR diff、candidate deep、deployment artifactを同一profileへ潰さない。
- GitHub設定変更とproduction操作は人間承認境界を維持する。
- L4以降のworkflow実装やGitHub settings applyを混載しない。
