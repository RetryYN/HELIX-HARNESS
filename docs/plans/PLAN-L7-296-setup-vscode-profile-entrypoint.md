---
plan_id: PLAN-L7-296-setup-vscode-profile-entrypoint
title: "PLAN-L7-296: setup project VS Code profile entrypoint 固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "HELIX project setup の初回 workflow に VS Code profile 起動の manual-local 証跡を additive に追加する。PLAN-M-02 cutover、外部 apply、secret、infra 変更は行わない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/setup.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - setup VS Code profile entrypoint"
  - role: qa
    slot_label: "QA - setup first-run matrix regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-296-setup-vscode-profile-entrypoint.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/lint/doc-consistency.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - docs/design/harness/L6-function-design/setup-solo-team.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T23:35:00+09:00"
    tests_green_at: "2026-07-03T23:35:00+09:00"
    verdict: approve
    scope: "HELIX 導入済み VSCode で新規 project を開く `code --profile HELIX .` 導線を setup JSON/text と first-run matrix に追加し、manual-local 証跡として自動 command から分離する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/setup.test.ts tests/cli-surface.test.ts tests/doctor.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:35:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:ad3384f00523dc6f43ccb3ef13e1c761b39277a397cbd03391e3db8a829a7849"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T23:35:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

## 目的

`helix setup project` は VS Code task / Workspace Trust / consumer doctor / version-up dry-run を初回 workflow に含めているが、HELIX 導入済み VSCode で新規 folder をどの profile で開くかは構造化されていなかった。

この PLAN では VS Code 公式 CLI の profile 起動 (`code --profile HELIX .`) を `manual-local` の初回検証行として追加し、setup 完了・automatic task 許可・PLAN-M-02 cutover 完了のいずれにも読み替えないよう固定する。

## DoD

- [x] `runHelixProjectSetup()` が `vscode.profileName=HELIX` と `profileOpenCommand=code --profile HELIX .` を返す。
- [x] `postSetupWorkflow.verificationMatrix[]` に `vscode-profile-open` を追加する。
- [x] `manualVerificationCommands[]` に `code --profile HELIX .` を分離し、CI/doctor 用の automatic `verificationCommands[]` へ混ぜない。
- [x] CLI text が `manual-verification-command:` と `vscode-profile:` を表示する。
- [x] consumer doctor が first-run matrix 11 行を fail-close で検査する。
- [x] PLAN-M-02 承認前の `helix setup project` / `.helix` activation は引き続き blocked のままにする。
