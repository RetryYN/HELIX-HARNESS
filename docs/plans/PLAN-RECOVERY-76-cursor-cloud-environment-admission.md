---
plan_id: PLAN-RECOVERY-76-cursor-cloud-environment-admission
title: "PLAN-RECOVERY-76: Cursor Cloud Agent environment admission"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1356
behavior_contract_id: TER-CURSOR-CLOUD-ENV-001
responsibility_owner: provider-environment-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Cursor Cloud Agentを早期実用化し、PR #1355のPoCをHELIX安全境界へ収束する"
contract_preconditions: "PLAN-L3-72 Technology Environment Reconciliationがconfirmedで、Cursor Cloud Agent PoCのBuild成功がPR #1355で観測済み"
contract_postconditions: "repo-owned DockerfileがNode image manifestをexact固定し、install phaseはhostを書き換えず全検証をfail-closeで実行する"
contract_invariants: "provider固有security core、credential永続化、runtime download、host-global shim、PATH export依存を追加しない"
contract_failures: "wrong digest、Node range drift、download、host write、fallback、検証列欠落を個別に拒否する"
tdd_red_required: true
red_test: "PR #1355はmutable download、checksum欠落、host-global overwrite、warning fallbackを許す"
red_at: "2026-09-02T02:35:00+09:00"
green_at: "2026-09-02T02:46:30+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-02T02:46:14+09:00に.cursor/DockerfileのFROM manifest digest先頭をbからaへ一桁変更すると、tests/cursor-cloud-environment.test.tsのU-CURSOR-ENV-002だけが1 failed／他3 passed／exit 1となりwrong digest mutationをkilledした。正本digestへ復元後、targeted 4 tests、bash -n、PLAN lint、typecheckをgreenへ戻した。"
complexity_effect: net_negative
complexity_justification: "89行のprovider固有installerとhost shimを、digest固定Dockerfileと検証専用scriptへ置換する"
removal_trigger: "Cursorがrepo-owned environment contractを廃止し、同等のdigest-pinned runtime authorityを別surfaceへ移した時"
backprop_decision: not_required
backprop_decision_reason: "confirmed TER authorityのprovider adapter Recoveryであり要求意味は変更しない"
parent_design: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md
pair_artifact: docs/test-design/helix/L8-cursor-cloud-environment-admission-unit-test-design.md
dependencies:
  parent: PLAN-L3-72-technology-environment-reconciliation
  requires:
    - docs/plans/PLAN-L3-72-technology-environment-reconciliation.md
  references:
    - "issue:1356"
    - "issue:1355"
    - "issue:1185"
    - "issue:679"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md, oracle_id: U-CURSOR-ENV-001, test_path: tests/cursor-cloud-environment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md, oracle_id: U-CURSOR-ENV-002, test_path: tests/cursor-cloud-environment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md, oracle_id: U-CURSOR-ENV-003, test_path: tests/cursor-cloud-environment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md, oracle_id: U-CURSOR-ENV-004, test_path: tests/cursor-cloud-environment.test.ts }
generates:
  - { artifact_path: .cursor/Dockerfile, artifact_type: config }
  - { artifact_path: docs/plans/PLAN-RECOVERY-76-cursor-cloud-environment-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-cursor-cloud-environment-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/cursor-cloud-environment.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: .cursor/environment.json, artifact_type: json_config }
  - { artifact_path: .cursor/install.sh, artifact_type: script }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — TER／host side-effect authority再利用" }
  - { role: se, slot_label: "SE — digest-pinned Cursor Build境界" }
  - { role: qa, slot_label: "QA — digest／range／download／host mutation" }
  - { role: tl, slot_label: "TL — PoCからcurrent adapterへの一方向収束" }
review_evidence: []
---

# Cursor Cloud Agent環境admissionのRecovery

PR #1355の成功した環境知見を保持しつつ、非正規branchとhost shim実装はcanonicalへ持ち込まない。
Dockerfile routeのfresh Build実測、Claude exact-HEAD review、CI、main read-after後にだけ完了候補とする。
