---
plan_id: PLAN-L7-658-lite-consumer-distribution-docs
title: "PLAN-L7-658 (impl): Lite consumer文書をartifactへ束縛する"
kind: impl
layer: L7
drive: agent
status: completed
backfill_state: complete
completion_claim_allowed: true
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #958でLite consumer配布文書をartifactへ束縛する"
created: 2026-08-23
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 958
behavior_contract_id: DISTRIBUTION-LITE-CONSUMER-DOCUMENTS-001
responsibility_owner: distribution-lite-consumer-documents
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "#947のprofile-bound deterministic builderが存在する"
contract_postconditions: "consumer文書5件がmanifest exact digestとarchive bytesへ束縛される"
contract_invariants: "Full HELIX唯一正本、Lite fork 0、development guidance再出力0"
contract_failures: "文書欠落、digest drift、旧identity、absolute path、unsupported commandをtyped redにする"
tdd_red_required: true
red_test: "U-DISTDOC-001..005が文書未投影をredにする"
red_at: null
green_at: 2026-08-23T20:13:49Z
mutation_oracle_evidence: "Claude pre-confirm reviewで9 seeded mutationを実測し、document exact-set検査除去をtests/distribution-lite-documents.test.tsのU-DISTDOC-004、sensitive-content検査除去を同U-DISTDOC-005、manifest document provenance照合除去をtests/distribution-lite-consumer-canary.test.tsのU-DISTDOC-006が各1 test redとしてKILLEDした。N9は等価変異、N2／N3／N4／N6／N7のSURVIVEDは非blocker Issue #970へ分離した"
complexity_effect: justified_positive
complexity_justification: "配布文書をartifact identityへ含めるdocument manifest projectionを追加する"
removal_trigger: "全distribution profileが同一generated document registryへ統合された時"
agent_slots:
  - { role: se, slot_label: "SE — document projection／manifest binding" }
  - { role: qa, slot_label: "QA — missing／drift／command mutation" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-documents-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-001, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-002, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-003, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-004, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-004b, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-005, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-006, test_path: tests/distribution-lite-consumer-canary.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-658-lite-consumer-distribution-docs.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-consumer-documents-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: README-LITE.md, artifact_type: markdown_doc }
  - { artifact_path: THIRD_PARTY_NOTICES.md, artifact_type: markdown_doc }
  - { artifact_path: PROVENANCE.md, artifact_type: markdown_doc }
  - { artifact_path: DISCLAIMER.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/repository-structure.md, artifact_type: markdown_doc }
  - { artifact_path: config/distribution-capability-artifact-catalog.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/design-language.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-lite-package.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-lite-consumer-canary.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-lite-documents.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-consumer-canary.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md
    - docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
  references:
    - issue:958
  blocks:
    - issue:856-lite-distribution
review_evidence:
  - reviewer: "Claude Code / independent AI-B"
    review_kind: cross_agent
    reviewer_session_id: "dc96b0e4-d8a6-4ba0-b7e9-a8e3c0d6ce8a"
    reviewed_at: "2026-08-23T19:44:49Z"
    tests_green_at: "2026-08-23T19:43:57Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude-opus-5
    reviewed_head_sha: ca994769aa795593df477a0fd5a6f5c04ed6c596
    scope: "PR #963 current exact HEAD ca994769aa795593df477a0fd5a6f5c04ed6c596をClaude Codeが検収し、Issue #958の文書exact set、単一source authority、development guidance非再出力、manifest／canary接合、CI／DB projection／replayを照合した。approve／blocker 0。Actions run 32660919570はfull regression、Biome、pre/post DB rebuild、Linux／Windows Lite canary、CodeQLがgreen。canonical comment: https://github.com/RetryYN/HELIX-HARNESS/pull/963#issuecomment-5388099775。receipt digest: sha256:ad070951f5b204f396599c126e5414f1777390552a8d4cd6203796580e51dd98"
    green_commands:
      - kind: integration_test
        command: "GitHub Actions harness-check run 32660919570 full regression vitest run"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-23T19:43:57Z"
        evidence_path: tests/distribution-lite-documents.test.ts
        output_digest: "sha256:a232c159a6ac628edb5a84cf751060ef0ca9e69dc883054ad4b59502698b5eea"
        result: "current HEADのfull regression、Biome、pre/post DB rebuild、Linux／Windows Lite canary、CodeQLがgreen。Claude current exact-HEAD reviewはapprove／blocker 0。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-23T19:44:49Z"
  review_binding:
    reviewer: "Claude Code / independent AI-B"
    reviewed_at: "2026-08-23T19:44:49Z"
    evidence_digest: "sha256:11f32d1b77cae3e0d96ca7ac5564ca56c4f3c12cdfc77f1d7ce3a5e38cfd7db9"
  entries: []
---

# PLAN-L7-658: Lite consumer配布文書

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 文書exact setをRed→Green | 5文書のpath／digest／区分を固定 |
| 2 | consumer READMEを投影 | development guidance再出力0 |
| 3 | manifest／archive接合 | sourceとoutput bytesが一致 |
| 4 | negative oracle | 欠落／旧identity／absolute pathを拒否 |
| 5 | CI／doctor／Claude review | blocker 0 |

## 終端収束

PR #963 は canonical merge（merge commit `fed0d57c64fa9c6f3929c52be414247b064c28f2`）され、
最終 current HEAD `cb805bd655f61af8a15151f88a039d8da85eb148` に対する Claude Opus sealed receipt
（[receipt comment](https://github.com/RetryYN/HELIX-HARNESS/pull/963#issuecomment-5388232242)、
CI run `32662470388` success、DB projection/replay convergence）が成立した。さらに current main
`d47148be43124d5bdd1daf02e3424ef8cbc57457` の post-merge harness-check／CodeQL success
（run `32673218418`）で、文書exact set、license、provenance、README projectionの回帰がないことを
read-after確認した。したがって本PLANのconsumer文書束縛契約は terminal とする。

## 非対象

tag、publish、remote sync、promotion、DevOS cutoverは実行しない。
