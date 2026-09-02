---
plan_id: PLAN-RECOVERY-85-git-argument-boundary
title: "PLAN-RECOVERY-85: git argument boundary"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1429
behavior_contract_id: GIT-ARGUMENT-BOUNDARY-001
responsibility_owner: git-argument-boundary
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:外部監査で検出したP0 Git引数境界欠落を正規Recoveryする"
contract_preconditions: "version-up remoteとcommitlint rangeが文字列入力を受ける"
contract_postconditions: "許可remote／rangeだけがGit processへ到達し、悪性値は副作用前にfail-closeする"
contract_invariants: "正常なremote tag検出とcommitlint range、shell:false、argument array実行を維持する"
contract_failures: "大小文字transport helper、option形、HTTPS credential付きremote、malformed range、未境界process callを拒否する"
tdd_red_required: true
red_test: "HEAD..を受理した初期validatorと、既存fake gitが--終端を認識しない回帰を実測した"
red_at: "2026-09-02T11:38:42+09:00"
green_at: "2026-09-02T11:40:48+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "quality audit fixtureでsafeRangeをrangeへ戻すmutationがunsafe_git_argument_boundary／exit非greenとなり、typed値へ復元後はtests/git-argument-boundary.test.ts、tests/quality-audit.test.ts、tests/version-up-readiness.test.tsの71 tests green／exit 0。"
complexity_effect: net_neutral
complexity_justification: "2入力を単一typed boundary moduleへ集約し、process wrapperを重複実装しない"
removal_trigger: "なし。外部入力からprocess invocationへの恒久境界"
backprop_decision: not_required
backprop_decision_reason: "既存security authorityのprocess引数不変条件を復旧し、新しい要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/git-argument-boundary.md
pair_artifact: docs/test-design/helix/L8-git-argument-boundary-unit-test-design.md
dependencies:
  parent: PLAN-L7-230-destructive-git-command-guard
  requires:
    - docs/plans/PLAN-L7-230-destructive-git-command-guard.md
  references:
    - "issue:1389"
    - "issue:1390"
    - "issue:1429"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-85-git-argument-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/git-argument-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-git-argument-boundary-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/git-argument-boundary.ts, artifact_type: source_module }
  - { artifact_path: tests/git-argument-boundary.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/audit/quality.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/quality-audit.test.ts, artifact_type: test_code }
  - { artifact_path: tests/version-up-readiness.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — process argument injection境界のRecovery監査" }
  - { role: se, slot_label: "SE — remote／revision typed identity" }
  - { role: qa, slot_label: "QA — side-effect negative oracleとstatic mutation" }
  - { role: tl, slot_label: "TL — P0 process boundary終端" }
review_evidence: []
---

# Git引数境界の復旧

remote identityとrevision rangeをprocess起動前に検証し、Gitのtransport／option再解釈を拒否する。
同型退行はquality auditで検出する。
