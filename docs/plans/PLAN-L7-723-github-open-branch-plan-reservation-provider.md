---
plan_id: PLAN-L7-723-github-open-branch-plan-reservation-provider
title: "PLAN-L7-723: GitHub open branch PLAN reservation provider"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1256
behavior_contract_id: OBPRGH-AC-001
responsibility_owner: github-open-branch-plan-reservation-provider
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: adapter
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1256 GitHub current main／open PR materialをproduction authorityへ供給する"
contract_preconditions: "GitHub repositoryをexact owner/nameで指定でき、PLAN-L7-722のtyped production authority inputがcanonicalである"
contract_postconditions: "current mainとopen PRの全page／exact HEAD／PLAN materialをread-after付きで取得し、既存production authorityへ渡せる"
contract_invariants: "providerは競合意味論を持たず、部分page、truncated tree、HEAD race、open set race、invalid PLANをlocal greenへfallbackしない"
contract_failures: "GitHub API／schema／pagination／base64／frontmatter／identity／HEAD／lifecycle／read-after不一致をsurface unavailableのstable digestへ閉じる"
tdd_red_required: false
tdd_red_waiver_reason: "隔離worktreeでeffect adapterと反例oracleを同一atomic sliceとして追加したため、存在しないRed時刻を捏造しない。confirm前にread-after mutation killを実測する"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-01T15:20:20+09:00にopen PR exact-set read-after比較を一時除去し、npx --no-install vitest run tests/github-open-branch-plan-reservation-provider.test.tsでU-OBPRGH-002が1 failed／4 passedとなりmutationをkillした。直後にguardを復元した。"
complexity_effect: justified_positive
complexity_justification: "GitHub effect取得を単一providerへ隔離し、reservation conflict／inheritance／release判定は既存semantic coreへ一方向委譲する"
removal_trigger: "GitHub event journalが同じpagination／read-after保証を持つcanonical PLAN material snapshotを直接発行する時"
backprop_decision: not_required
backprop_decision_reason: "Issue #1256とPLAN-L7-722が要求する既存production authorityの未接続effect sliceであり、意味contractは変更しない。"
parent_design: docs/design/helix/L6-function-design/github-open-branch-plan-reservation-provider.md
pair_artifact: docs/test-design/helix/L8-github-open-branch-plan-reservation-provider-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-722-open-branch-plan-reservation-production-authority.md
  requires:
    - docs/plans/PLAN-L7-722-open-branch-plan-reservation-production-authority.md
  references:
    - issue:1256
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-open-branch-plan-reservation-provider.md, oracle_id: U-OBPRGH-001, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-open-branch-plan-reservation-provider.md, oracle_id: U-OBPRGH-002, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-open-branch-plan-reservation-provider.md, oracle_id: U-OBPRGH-003, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-open-branch-plan-reservation-provider.md, oracle_id: U-OBPRGH-004, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-open-branch-plan-reservation-provider.md, oracle_id: U-OBPRGH-005, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-open-branch-plan-reservation-provider.md, oracle_id: U-OBPRGH-006, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-723-github-open-branch-plan-reservation-provider.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-open-branch-plan-reservation-provider.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-open-branch-plan-reservation-provider-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/adapters/github-open-branch-plan-reservation-provider.ts, artifact_type: source_module }
  - { artifact_path: tests/github-open-branch-plan-reservation-provider.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — GitHub pagination／read-after effect provider" }
  - { role: qa, slot_label: "QA — race／truncation／pagination／terminal反例" }
  - { role: tl, slot_label: "TL — effect境界と後続preflight／doctor／DB責務" }
---

# GitHub open branch PLAN予約provider

## 工程表

1. current mainとopen PRを全pageで取得し、exact HEADへ束縛する。
2. PLAN blobをfrontmatter identity、owner Issue、responsibility、source digestへ投影する。
3. main refとopen PR exact setをread-afterし、race／truncation／invalid inputをfail-closeする。
4. targeted oracle、mutation、typecheck、Biomeをgreen化する。
5. 後続sliceでassignment provider、PR preflight、doctor、DB projectionへ同じauthority inputを接続する。

本PLANはGitHub effect providerだけを所有し、Issue #1256のcompletionを単独では主張しない。
