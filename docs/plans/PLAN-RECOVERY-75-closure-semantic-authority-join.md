---
plan_id: PLAN-RECOVERY-75-closure-semantic-authority-join
title: "PLAN-RECOVERY-75: closure semantic authority exact join"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1345
behavior_contract_id: CLOSURE-SEMANTIC-AUTHORITY-JOIN-001
responsibility_owner: closure-evidence-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "recovery_gap:probe green後もsemantic authorityをjoinする正規portがなくclosureが恒久blockする"
contract_preconditions: "probe executionはprocess値だけを証明し、semantic値を発明しない"
contract_postconditions: "validated bundleだけがPLAN＋artifact kindへexact joinされapproval scopeへdigest束縛される"
contract_invariants: "bundle欠落、wrong PLAN／HEAD／oracle、unaccepted runtimeは従来どおりfail-closeする"
contract_failures: "source path escape、digest／payload不一致、重複record、HEAD／oracle driftをstable errorで拒否する"
tdd_red_required: true
red_test: "semantic authority receiptの入力portがないため実receiptが存在してもplaceholderが恒久的に残る"
red_at: "2026-09-01T21:12:00+09:00"
green_at: null
mutation_oracle_required: true
mutation_oracle_evidence: null
complexity_effect: justified_positive
complexity_justification: "既存probe materializerへtyped bundle loaderを一つ追加し、別authority DBや別closure engineを作らない"
removal_trigger: "closure authority projectionが同じtyped bundleをDBから完全供給する時"
backprop_decision: not_required
backprop_decision_reason: "既存#24のfail-close意図を維持し、欠けていたjoin portだけを回復する"
parent_design: docs/design/helix/L6-function-design/closure-semantic-authority-join.md
pair_artifact: docs/test-design/helix/L8-closure-semantic-authority-join-unit-test-design.md
dependencies:
  parent: PLAN-L7-440-closure-evidence-semantic-authority
  requires:
    - docs/plans/PLAN-L7-440-closure-evidence-semantic-authority.md
  references:
    - "issue:1345"
    - "issue:655"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-75-closure-semantic-authority-join.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/closure-semantic-authority-join.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-closure-semantic-authority-join-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/state-db/closure-evidence-semantic-authority.ts, artifact_type: source_module }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: cli_extension }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-evidence-semantic-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — closure authorityと推測禁止境界" }
  - { role: se, slot_label: "SE — typed bundleとexact join" }
  - { role: qa, slot_label: "QA — wrong PLAN／HEAD／oracle／digest mutation" }
  - { role: tl, slot_label: "TL — #655終端線と原子scope統制" }
review_evidence: []
---

# Closure semantic authority exact join

Probeが証明できない意味値を発明せず、既存authority artifactの実体とdigestを検証してからだけ
evidence candidateへ投影する。approval／apply境界は変更しない。
