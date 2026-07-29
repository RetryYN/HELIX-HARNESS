---
plan_id: PLAN-L3-52-github-security-admission
title: "PLAN-L3-52 (add-design): GitHub security evidence admissionをL3/L10へ定義"
kind: add-design
layer: L3
drive: agent
status: confirmed
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
complexity_effect: net_neutral
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
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-29T22:01:50Z"
    reviewed_at: "2026-07-29T22:02:02Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #278 HEAD 893539ff2ebc2060d60283c82185464d47a20f9cをClaude AI-Bがclean detached checkoutでread-only reviewした。requirements／L10 test design／PLAN／catalog／freeze packet／digest／range oracleの11 pathを照合し、GH-FR-029、github-security-admission一責務、scanner非authority、partial／unknown coverage fail-close、GitHub settings applyとproduction deployのhuman approval境界、L3/L10 polarityを確認した。targeted 64 tests、PLAN lint、DB convergenceを同一HEADで再現し、Critical／High／Medium 0、verdict approve。DB projection/replay digest sha256:3b19947ca5bd392452a0404d510b3f9f2b71c291a8ae04f55382454405d9621、checkpoint/replay digest sha256:9ddc319ab6e76441fdbe328d45efd03af95bc194d3f58379dc7813a6026ebf7d、receipt digest sha256:3e8d9e5d122ca9925377fa5e930dfb51824813b7f37395385aa452e3b665ec8e。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/278#issuecomment-5123817288。session: 37c80915-2669-4ce2-ba3f-fa08ab988a17"
    green_commands:
      - kind: smoke
        command: "createL3G3LogicalDbReceipt(<clean detached worktree root>)"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-29T22:01:50Z"
        evidence_path: src/doctor/l3-g3-logical-db-receipt.ts
        output_digest: "sha256:3e8d9e5d122ca9925377fa5e930dfb51824813b7f37395385aa452e3b665ec8e"
generates:
  - artifact_path: docs/plans/PLAN-L3-52-github-security-admission.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-security-admission-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-security-admission-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/github-l3-trace-authority-hygiene.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-github-security-admission.test.ts
    artifact_type: test_code
  - artifact_path: tests/harness-memory-reconciliation-binding.test.ts
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

# PLAN-L3-52: GitHubセキュリティ証拠受入

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
