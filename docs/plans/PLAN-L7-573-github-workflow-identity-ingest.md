---
plan_id: PLAN-L7-573-github-workflow-identity-ingest
title: "PLAN-L7-573 (impl): Issue／PR typed workflow identityをexact ingestする"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.3
  registry_source_digest: sha256:240060052c365a6c4f339bd4b634e1c8cb2a194f33e489ed36672338a91f6c8b
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #731 GitHub typed workflow identity ingest"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 731
behavior_contract_id: GITHUB-WORKFLOW-IDENTITY-INGEST-001
responsibility_owner: github-workflow-identity-contract
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "Issue／PR proseと旧fieldからworkflow identityを推測でき、同一episodeのtyped identityをexact比較するvalue objectがない"
contract_postconditions: "marker付きstrict JSONをrequirements catalogへexact照合し、Issue／PR一致だけをtyped value objectとして返す"
contract_invariants: "requirements registryが意味authorityであり、GitHub prose／label／legacy identityをcurrent contractへ再出力しない"
contract_failures: "missing、duplicate、invalid、drift、unknown、decision待ち、ambiguity、signal矛盾、Issue／PR不一致を別reasonでfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated stacked branchでpure schemaと反例oracleを同一atomic patchとして作成したため、存在しない実装前Red時刻を捏造しない。confirm前にseeded mutation killを実測する"
mutation_oracle_evidence: "2026-08-15T20:10:11ZにIssue／PR mismatch判定をmismatches.length>0から<0へ一時変異し、tests/github-workflow-identity-contract.test.tsのU-GWID-005がexpected issue_pr_mismatch／received okで1 failed、4 skipped、exit 1となるkillを実測した。apply_patchで復元後、同oracle greenを再確認する"
complexity_effect: justified_positive
complexity_justification: "Issue／PRで重複する自由文解析を単一strict value objectへ置換し、DB／episode adapterが再利用できる境界を追加する"
removal_trigger: "GitHub workflow identity contract schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-001, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-002, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-003, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-004, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-005, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-006, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — GitHub identity strict value object" }
  - { role: qa, slot_label: "QA — malformed／drift／mismatch反例" }
  - { role: tl, slot_label: "TL — requirements authority／episode境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/github-workflow-identity-contract.ts, artifact_type: source_module }
  - { artifact_path: tests/github-workflow-identity-contract.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-572-typed-plan-signal-identity-consistency.md
  references:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  blocks: []
---

# GitHubのtyped workflow identity取込

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | marker付きstrict contract schemaを実装 | [直列] | U-GWID-001..003 green |
| 2 | signal照合とIssue／PR consistencyを実装 | [直列] | U-GWID-004／005 green |
| 3 | pair登録、mutation、targeted、全CI、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

GitHub API adapter、DB projection、execution episode、right-arm bindingは#205の後続原子的sliceとする。
