---
plan_id: PLAN-RECOVERY-83-runner-attestation-journal-authority
title: "PLAN-RECOVERY-83: runner attestation journal authority"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1391
behavior_contract_id: RUNNER-ATTESTATION-JOURNAL-AUTHORITY-001
responsibility_owner: closure-evidence-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Fable 5.1監査で発見したrunner attestation dual-writeとJSONL欠落fail-openを正規Recoveryする"
contract_preconditions: "production materializationがclosure-materialization-journal.v2とcommitted marker recoveryを所有する"
contract_postconditions: "production writerが一つに収束し、DB rowがあるJSONL欠落とjournal replay不一致をclosure前にfail-closeする"
contract_invariants: "SQLiteとfilesystemをSAVEPOINTだけでcrash atomicと主張せず、既存journal/recoveryを再利用する"
contract_failures: "dead writer残存、JSONL欠落fail-open、prepared rollbackまたはcommitted finish-forward不成立を拒否する"
tdd_red_required: true
red_test: "U-CAUTO-019追加時はDB attestation存在下でJSONL削除後もallowed=true"
red_at: "2026-09-02T08:36:39+09:00"
green_at: "2026-09-02T08:37:08+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/closure-auto-approval.test.tsでverifyRunnerAttestationChainのJSONL不存在分岐を旧return nullへ戻すmutationによりU-CAUTO-019がallowed=trueでfailedし、DB count照合へ復元後はgreen。tests/closure-evidence-materialization.test.tsでrecoverClosureEvidenceMaterializationのcommitted分岐を無効化するとU-CMAT-012がmanifest ENOENTでred、復元後はU-CMAT-011/012を含む13 tests green。"
complexity_effect: net_negative
complexity_justification: "test-only dead writerを削除し、既存production materialization journalだけをwrite authorityとして残す"
removal_trigger: "なし。runner attestation durabilityの恒久不変条件"
backprop_decision: not_required
backprop_decision_reason: "既存closure evidence authorityの意味を変えず、実装分岐とfail-openを回復する"
parent_design: docs/design/helix/L6-function-design/runner-attestation-journal-authority.md
pair_artifact: docs/test-design/helix/L8-runner-attestation-journal-authority-unit-test-design.md
dependencies:
  parent: PLAN-L7-433-closure-auto-approval
  requires:
    - docs/plans/PLAN-L7-433-closure-auto-approval.md
  references:
    - "issue:1391"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-83-runner-attestation-journal-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/runner-attestation-journal-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-runner-attestation-journal-authority-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-auto-approval.ts, artifact_type: source_module }
  - { artifact_path: tests/closure-auto-approval.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-evidence-materialization.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — runner attestation durabilityとjournal authorityのRecovery監査" }
  - { role: se, slot_label: "SE — production writerとjournal recovery一本化" }
  - { role: qa, slot_label: "QA — JSONL欠落とdurability boundary mutation" }
  - { role: tl, slot_label: "TL — closure判定前fail-closeとdead path退役" }
review_evidence: []
---

# Runner attestation journal authorityの復旧

test-onlyの旧dual-write exportを削除し、productionの`closure-materialization-journal.v2`を唯一の
write/recovery authorityとする。DBとJSONLのexact set一致前にclosureを許可しない。
