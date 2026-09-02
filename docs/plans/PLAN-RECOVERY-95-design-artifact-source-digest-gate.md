---
plan_id: PLAN-RECOVERY-95-design-artifact-source-digest-gate
title: "PLAN-RECOVERY-95: 設計書artifact_path source_digest照合gate"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1468
behavior_contract_id: DESIGN-ARTIFACT-SOURCE-DIGEST-DRIFT-001
responsibility_owner: design-artifact-source-digest
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "設計実在性bindingがcurrent designのruntime assetをartifact_pathとsource_digestで記録している"
contract_postconditions: "全current authority pinが実ファイルbyte digestと照合され、新規driftと欠落targetがdoctorで拒否される"
contract_invariants: "既存のDesign Reality parser、Node transaction boundary、baseline縮小運用を再利用し、別manifest／DB／workflowを追加しない"
contract_failures: "新規source digest drift、pin先欠落、unsafe path、repo外target、不正baseline、baseline拡張をfail-closeする"
tdd_red_required: true
red_test: "baseline外のstale pinを一件追加したfixtureがdesign_artifact_source_digest_driftで失敗することを実測"
red_at: "2026-09-02T19:19:52Z"
green_at: "2026-09-02T23:29:45Z"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/design-artifact-source-digest.test.ts の U-DASD-002/U-DASD-003 で actualDigest 比較を無効化する seeded mutation (if true) を注入したところ 2 tests failed (exit 1, 2026-09-02T19:19:52Z)。実装復元後は同コマンドが6 tests passed (exit 0, 2026-09-02T19:20:08Z)。U-DASD-001〜006は一致、new drift、baseline debt、missing target、compatibility、baseline expansionを個別に検査する"
complexity_effect: net_neutral
complexity_justification: "既存design-reality-binding parser／digest実装へ全design走査とbaseline縮小判定を追加し、設計書pinの手作業照合漏れを除く"
removal_trigger: "なし。current design authorityと実装byteの恒久的な整合契約"
backprop_decision: not_required
backprop_decision_reason: "既存のDesign Reality Bindingを補強するgovernance Recoveryであり、新しいユーザー要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/design-reality-binding.md
pair_artifact: docs/test-design/helix/L8-design-artifact-source-digest-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
  requires:
    - docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
    - src/lint/design-reality-binding.ts
  references:
    - "issue:1402"
    - "issue:1466"
    - "issue:1468"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-95-design-artifact-source-digest-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-artifact-source-digest.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-artifact-source-digest-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/design-artifact-source-digest-baseline.json, artifact_type: config }
  - { artifact_path: src/lint/design-artifact-source-digest.ts, artifact_type: source_module }
  - { artifact_path: tests/design-artifact-source-digest.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: tests/doctor-cause-digest-contract.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — 設計書pinと実ファイルauthorityの境界監査" }
  - { role: se, slot_label: "SE — 全design binding走査とbaseline validator" }
  - { role: qa, slot_label: "QA — new drift／missing target／baseline expansion反例" }
  - { role: tl, slot_label: "TL — #1468 Recovery収束と#1466後続同期" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-09-02T22:52:18Z"
    tests_green_at: "2026-09-02T22:52:18Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    reviewed_head_sha: 8bf1ba6e436b057c74f136f82a016da70e2de575
    scope: "PR #1469 exact HEADで設計書artifact_pathの実ファイルbyte digest照合、new drift／missing target／baseline expansion／unsafe path拒否、既存compatibility debt隔離を確認しblocker 0。"
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1469#issuecomment-5517543369"
    green_commands:
      - kind: smoke
        command: "gh run view 33690103758 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-09-02T22:52:18Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:6abbae8088381ac4f7e0f73fcd1c92396a5db4d0d15de944bf11920aa9ee56da"
        result: "exact HEAD 8bf1ba6e436b057c74f136f82a016da70e2de575のCI run 33690103758がterminal success、DB convergence=true"
---

# 設計書artifact digest照合 Recovery

設計書が `current_authority: true` と宣言する実装assetを、実ファイルの現在byteへ毎回照合する。
既知の6件はbaseline debtとして残し、新規の静かな腐敗だけを止める。baselineの縮小は、該当設計書pinを
実測digestへ更新したPRで行う。

## 終端read-after

実装PR #1469（merge commit `d105a15c68aee71d754f538186be3cb51b0246f0`）のClaude exact-HEAD approveと
CI successを確認した。その後の同一main post-merge harness-checkで、全shard、DB rebuild、doctor、
typed lane status、CodeQLがsuccessとなった。設計書pinの実ファイルdigest照合と既存baseline debt隔離を
このmain read-afterへ束縛し、`completion_claim_allowed: true`、`backfill_state: complete`へ遷移する。
