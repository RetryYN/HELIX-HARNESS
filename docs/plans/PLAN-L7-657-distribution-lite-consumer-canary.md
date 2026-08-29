---
plan_id: PLAN-L7-657-distribution-lite-consumer-canary
title: "PLAN-L7-657 (impl): Lite clean consumer canaryを成立させる"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #948で同一Lite artifactのclean Linux consumerとWindows smokeを成立させる"
created: 2026-08-23
updated: 2026-08-23
owner: Codex / TL
github_issue_id: 948
behavior_contract_id: DISTRIBUTION-LITE-CONSUMER-CANARY-001
responsibility_owner: distribution-lite-consumer-canary
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "#947のprofile-bound deterministic tarball／manifest／checksumがgreen"
contract_postconditions: "同一artifactをclean Linux／Windowsで実行しconsumer build、completion evidence、rollback receiptへ束縛する"
contract_invariants: "Full HELIX唯一正本、consumer所有bytes保全、同一artifact、remote write 0"
contract_failures: "差替え、checksum、HEAD、profile、physical path、setup ownership、OS artifact driftをtyped拒否する"
tdd_red_required: true
red_test: "U-DISTCAN-001..004が未検証artifactの実行可能性を拒否する"
red_at: 2026-08-23T17:02:16+09:00
green_at: 2026-08-24T01:06:45+09:00
mutation_oracle_evidence: "tests/distribution-lite-consumer-canary.test.tsのtarballへ1 byteを追加するとU-DISTCAN-002がartifact_digest_mismatchでredになり、復元後green。並列全回帰で共有checkoutの一時変更がproductionの`source_head_dirty`へ混入する反例を検出し、local canary fixtureもcommit済HEADの隔離cloneへ固定した。U-DISTCAN-006a／007aでsetup applyが変更0を返す反例、CI改変を存在だけでdoctor／completionがgreenにする反例、同bytes symlinkをunchangedとしてadmitする反例を検出し、実変更receiptとexact physical state／CI bytesへ固定した。U-DISTCAN-008／008aでWindows上の別build・`--version`だけではsame-artifact要件を満たさない反例を検出し、Linuxで生成・検証・uploadした同一receipt／tarballをWindowsへdownloadしてPowerShell setup／status／doctor／minimal workflowまで実行するrequired chainへ固定した"
complexity_effect: justified_positive
complexity_justification: "配布artifactを実行前に再検証する共通admissionとOS別receiptを追加する"
removal_trigger: "consumer release transactionが同じadmission／canary receiptを単一promotion kernelへ統合した時"
agent_slots:
  - { role: se, slot_label: "SE — artifact admission／consumer runtime composition" }
  - { role: qa, slot_label: "QA — Linux／Windows／rollback mutation" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-001, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-002, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-003, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-004, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-005, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-006, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-006a, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-006b, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-007, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-007a, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-009, test_path: tests/distribution-lite-consumer-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-009a, test_path: tests/distribution-lite-consumer-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-008, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-008a, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-008b, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-008c, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DRG-012c, test_path: tests/design-registry-screen-intake.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-010, test_path: tests/distribution-lite-consumer-canary.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/setup/distribution-lite-consumer-canary.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-lite-consumer-services.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-lite-consumer-lifecycle.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-cli.ts, artifact_type: source_module }
  - { artifact_path: config/distribution-capability-artifact-catalog.json, artifact_type: config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-lite-consumer-canary.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-consumer-services.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-consumer-lifecycle.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-registry-screen-intake.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md
    - docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  references:
    - issue:948
  blocks:
    - issue:856-clean-consumer-canary
review_evidence:
  - reviewer: "Codex Luna / intra-runtime verifier"
    review_kind: intra_runtime_subagent
    reviewer_session_id: "01a02f60-0b6b-71b3-ba7c-936f68042762"
    reviewed_at: "2026-08-23T16:09:14Z"
    tests_green_at: "2026-08-23T16:09:14Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: codex:gpt-5.6-luna
    reviewed_head_sha: 4918026e8fae16debbb24b449e316baf9370da2c
    scope: "PR #962 exact HEAD 4918026e8fae16debbb24b449e316baf9370da2cをLuna/xhighがread-onlyで限定再検収した。ancestor symlinkはCI／state両方の事前検査で書込み前に拒否され部分適用しないこと、U-DISTCAN-007がdry-run→apply→再実行の各段階でconsumer所有bytesを保全すること、L8 citationが実testへ一致することを照合し、APPROVE／blocker 0。"
    green_commands:
      - kind: smoke
        command: "git diff --check HEAD^ HEAD"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-23T16:09:14Z"
        evidence_path: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "Luna verifier session内でexit 0、出力0 bytes。親runtimeでは対象2 files／6 testsとtypecheckをexit 0で再実行済み。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-23T16:09:14Z"
  review_binding:
    reviewer: "Codex Luna / intra-runtime verifier"
    reviewed_at: "2026-08-23T16:09:14Z"
    evidence_digest: "sha256:04ec8ffcd7736f54c4919cb788590d7030f00fb3e6365a97a34fe1c23ef9ec41"
  entries: []
---

# PLAN-L7-657: Lite clean consumer検証

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | artifact admissionをRed→Green | 差替え／checksum／HEAD／profileを実行前に拒否 |
| 2 | consumer runtime serviceを接続 | setup／status／doctor／minimal workflow／completionが実起動 |
| 3 | Linux fresh process E2E | installからgenerated CIまでgreen |
| 4 | Windows＋rollback rehearsal | 同一artifactとconsumer bytes保全 |
| 5 | 全CI／doctor／Claude exact-HEADレビュー | blocker 0 |

## 非対象

tag、publish、remote sync、promotion、DevOS cutoverは実行しない。
