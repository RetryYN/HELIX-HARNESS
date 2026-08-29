---
plan_id: PLAN-L7-574-github-workflow-identity-admission
title: "PLAN-L7-574 (impl): GitHub typed workflow identityをadmissionへ配線する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #733 GitHub typed identity admission consumer"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 733
behavior_contract_id: GITHUB-WORKFLOW-IDENTITY-ADMISSION-001
responsibility_owner: github-workflow-identity-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: adapter
contract_preconditions: "Issue／PR typed identity value objectは存在するが、GitHub admission本線が照合せずDB／episodeへ不一致を流せる"
contract_postconditions: "変更typed PLANが指定するIssueとPRとPLANをrequirements registryへexact照合し、required CIでfail-closeする"
contract_invariants: "requirements registryが意味authorityであり、prose／label／legacy identityを推測またはcurrent出力へ再投影しない"
contract_failures: "複数PLAN、PLAN invalid、Issue API failure、invalid Issue response、authority invalid、contract invalid、Issue／PR／PLAN mismatchを別reasonで閉じる"
tdd_red_required: false
tdd_red_waiver_reason: "isolated stacked branchでadapterと反例oracleを同一atomic patchとして作成したため、存在しないRed時刻を捏造しない。confirm前にmutation killを実測する"
mutation_oracle_evidence: "2026-08-15T21:07:49ZにPLAN tuple mismatch判定を!==から===へ一時変異し、U-GWIDADM-001がexpected ok／received plan_mismatchで1 failed、5 passed、exit 1となるkillを実測した。apply_patchで復元後greenを再確認する"
complexity_effect: justified_positive
complexity_justification: "GitHub workflow内の自由文判定をrequirements-owned reusable adapterへ集約し、PR admissionで一度だけ評価する"
removal_trigger: "GitHub workflow identity contract schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-001, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-002, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-003, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-004, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-005, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-006, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-007, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-008, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-009, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-010, test_path: tests/github-workflow-identity-admission.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — GitHub admission adapter" }
  - { role: qa, slot_label: "QA — authority／I/O／tuple反例" }
  - { role: tl, slot_label: "TL — requirements authority／CI境界" }
review_evidence:
  - reviewer: claude-code-opus
    review_kind: cross_agent
    reviewed_at: "2026-08-15T21:59:43Z"
    tests_green_at: "2026-08-15T21:58:37Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-5
    scope: "Issue #733 GitHub typed identity admission sliceについて、requirements-owned strict identity、Issue／PR／PLAN exact tuple、GitHub API failure分離、legacy非再出力、required CI配線、manifest 15件、digest inventoryとdesign-reality追従をClaude Code Opusが確認した。artifact type是正後のblockerはPLAN confirmationのみで、実装blocker 0。PR terminal receiptはcurrent HEADのCI／DB convergence後に別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/github-workflow-identity-admission.test.ts tests/harness-check-workflow.test.ts tests/github-workflow-identity-contract.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/design-reality-binding.test.ts tests/digest.test.ts && npx --no-install tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T21:58:37Z"
        evidence_path: tests/github-workflow-identity-admission.test.ts
        output_digest: "sha256:dcf4f497cffa49f5afd375e5b2cd84f10f8181f4fa7768f405d6ec7c5558fd65"
        result: "6 files／141 tests passed。strict admission、workflow配線、G3 digest、design reality、digest inventoryを含み、tsc --noEmitもgreen"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T21:59:43Z"
  review_binding:
    reviewer: claude-code-opus
    reviewed_at: "2026-08-15T21:59:43Z"
    evidence_digest: "sha256:6a46a559444e2d18059aa37e52765149c23dd9efd681cd8f1dcf91632b130e4f"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-574-github-workflow-identity-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/adapters/github-workflow-identity-admission.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/github-workflow-identity-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md
  references:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  blocks: []
---

# GitHubのtyped workflow identity admission

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | GH-FR-020／GH-AC-018を要件正本へ追加 | [直列] | requirements confirmed |
| 2 | adapter、CLI、required CI配線を実装 | [直列] | U-GWIDADM-001..007 green |
| 3 | mutation、targeted、全CI、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

DB projection、execution episode、right-arm evidenceは#205の後続原子的sliceとする。
