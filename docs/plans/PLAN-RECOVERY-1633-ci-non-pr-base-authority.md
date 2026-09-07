---
plan_id: PLAN-RECOVERY-1633-ci-non-pr-base-authority
title: "non-PR CI eventのbranch base authority誤算出を復旧する"
kind: recovery
layer: cross
drive: agent
status: confirmed
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
  - { artifact_path: .helix/evidence/review-1634/vitest-targeted.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1634/tsc.log, artifact_type: other }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L6-function-design/branch-kind-authority-input.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-branch-kind-authority-input.md, artifact_type: test_design }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-006, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-007, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-008, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-001, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-002, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-003, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-004, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-005, test_path: tests/ci-branch-base-resolver.test.ts }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-07T21:20:57Z"
    tests_green_at: "2026-09-07T21:16:53Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 9867601a-a3ad-4369-980c-11757d63a7de
    reviewed_head_sha: 2799eda2f92254b17dbaa97b5b4a2b477bca8dca
    scope: "独立verdictの正本は https://github.com/RetryYN/HELIX-HARNESS/pull/1634#issuecomment-5575637859 。実測との接合追認は同PR comment 5575738122。reviewed_atは追認コメントのGitHub公開時刻で、元sealed receiptのreviewedAt=21:06:30Zを変更しない。green_commandsは作成側の実stdout/stderrであり、追認側のtscは依存不足exit 2のためgreenと記録しない。terminal failureのreceiptはPLAN技術検収用に限り、merge許可・hosted全回帰成功には使わない。"
    green_commands:
      - kind: unit_test
        command: "npm exec --yes --package=node@24.15.0 -- npx --no-install vitest run tests/ci-branch-base-resolver.test.ts tests/harness-check-workflow.test.ts tests/github-review-ci-generation.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-07T21:16:45Z"
        evidence_path: .helix/evidence/review-1634/vitest-targeted.log
        output_digest: "sha256:483fa1bcaccadcd4a8a80ecb1a653742abba9ae9b796e181c6f84fc86f1f6430"
      - kind: typecheck
        command: "npm exec --yes --package=node@24.15.0 -- npx --no-install tsc --noEmit -p . --extendedDiagnostics"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-07T21:16:53Z"
        evidence_path: .helix/evidence/review-1634/tsc.log
        output_digest: "sha256:6b823e1e25470cb5504e2766136ac38dd3552050589f248bd53709831409fc9d"
---

# non-PR CI branch base authorityの復旧

run `34136409737`では、multi-commit PRのcurrent candidate HEADを
`workflow_dispatch`で検証した際、branch-kindだけが`candidate^`をbaseとしてPLANを見失った。
同じworkflowのimpact-planはcurrent PR baseを解決しており、同一run内でauthorityが分岐していた。

本Recoveryは、pull_requestではeventの明示baseを保持し、非PR eventではcandidate HEADに一致する
open PRをGitHubから一意に解決してread-afterする。該当PRがない場合だけrepository default branchの
remote refとのmerge-baseを使う。複数PR、head/base drift、取得不能、不正SHAはfail-closeする。

branch-kindのPLAN必須規則は緩和しない。第一親fallback、新しい意味正本、event concurrency規則、
PR #1628のruntime実装は非対象とする。#1638の正規修復後は、実測と独立技術reviewに基づく
PLAN confirmed化を先に行い、current HEADのfull CI成功・新世代の独立receipt・main read-afterを
mergeおよび完了主張の条件として分離する。completion_claim_allowedは引き続きfalseである。

## 証跡転記の出典と境界

元sealed receiptはrun 34161349785 attempt 1のfailureを真正に保存している。
receipt digest `sha256:f92d022981c0ca3eaded37be3c47278c93401f42dc9e7aa1a36d4328ebe3e9e5`、
reviewedAt `2026-09-07T21:06:30Z` は変更しない。その後同じ実装HEADで採取した79テストと
型検査の出力を、独立sessionがcomment 5575738122で追認した。追認の公開時刻は21:20:57Zであり、
元review時刻へ後発の検査を遡及させない。これは人間承認を追加する操作ではない。

read-onlyの実GitHub resolver canaryもcandidate 2799eda2fに対しmain c67e2a010を返し、
PR APIのhead/baseと一致した。hosted workflow全体の成功・merge成立とは別の検証である。
