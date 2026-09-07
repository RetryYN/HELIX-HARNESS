---
plan_id: PLAN-RECOVERY-1633-ci-non-pr-base-authority
title: "non-PR CI eventのbranch base authority誤算出を復旧する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-08
updated: 2026-09-08
owner: Codex / TL
github_issue_id: 1633
responsibility_owner: branch-kind-authority-input
behavior_contract_id: CI-NON-PR-BASE-AUTHORITY-RECOVERY
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — CI event別base authorityとfail-close境界を照合" }
  - { role: se, slot_label: "SE — 共通base resolverとworkflow接続を実装" }
  - { role: qa, slot_label: "QA — multi-commit・stale・ambiguous反例を検証" }
  - { role: tl, slot_label: "TL — branch policy非緩和と復帰条件を検収" }
parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md
pair_artifact: docs/test-design/helix/L7-branch-kind-authority-input.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: "1.1.6"
  registry_source_digest: "sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89"
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: [PLAN-RECOVERY-935-branch-authority-input]
  references: ["issue:1336", "issue:1604", "issue:1614"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1633-ci-non-pr-base-authority.md, artifact_type: markdown_doc }
  - { artifact_path: scripts/ci/resolve-branch-base.sh, artifact_type: script }
  - { artifact_path: tests/ci-branch-base-resolver.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L6-function-design/branch-kind-authority-input.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-branch-kind-authority-input.md, artifact_type: test_design }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-006, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-007, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-008, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-001, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-002, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-003, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-004, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-005, test_path: tests/ci-branch-base-resolver.test.ts }
review_evidence: []
---

# non-PR CI branch base authorityの復旧

run `34136409737`では、multi-commit PRのcurrent candidate HEADを
`workflow_dispatch`で検証した際、branch-kindだけが`candidate^`をbaseとしてPLANを見失った。
同じworkflowのimpact-planはcurrent PR baseを解決しており、同一run内でauthorityが分岐していた。

本Recoveryは、pull_requestではeventの明示baseを保持し、非PR eventではcandidate HEADに一致する
open PRをGitHubから一意に解決してread-afterする。該当PRがない場合だけrepository default branchの
remote refとのmerge-baseを使う。複数PR、head/base drift、取得不能、不正SHAはfail-closeする。

branch-kindのPLAN必須規則は緩和しない。第一親fallback、新しい意味正本、event concurrency規則、
PR #1628のruntime実装は非対象とする。current HEADのfull CIと独立review、main read-after成立まで
confirmed化および完了主張を行わない。
