---
plan_id: PLAN-L7-658-lite-consumer-distribution-docs
title: "PLAN-L7-658 (impl): Lite consumer文書をartifactへ束縛する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #958でLite consumer配布文書をartifactへ束縛する"
created: 2026-08-23
updated: 2026-08-23
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
green_at: null
mutation_oracle_evidence: "U-DISTDOC-004で5文書のexact-set欠落を個別拒否し、U-DISTDOC-004bでREADME／LICENSE／attribution／provenance／免責を各1 byte削除して`source_head_dirty`を実測する。U-DISTDOC-005で旧guidance／absolute path／credential文字列をtyped拒否する"
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
    reviewed_at: "2026-08-23T17:59:26Z"
    tests_green_at: "2026-08-23T17:48:50Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude-opus-5
    reviewed_head_sha: db24d0995a75d2f64465d3af0e784a78f03e4d60
    scope: "PR #963 exact HEAD db24d0995a75d2f64465d3af0e784a78f03e4d60をClaude Codeがread-onlyでpre-confirm検収した。Issue #958、文書exact set、単一source authority、development guidance非再出力、manifest／canary接合を照合し、内容blocker 0／非blocker 1でapprove。非blockerは規則単位mutation oracle不足としてIssue #970へ分離した。Actions run 32655109923はfull regression、Biome、pre/post DB rebuild、Linux／Windows Lite canary、CodeQLがgreenで、唯一のredは本PLANがreview前draftであることを拒否したmergedPlanStatus。canonical comment: https://github.com/RetryYN/HELIX-HARNESS/pull/963#issuecomment-5387595635"
    green_commands:
      - kind: integration_test
        command: "GitHub Actions harness-check run 32655109923 full regression vitest run"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-23T17:48:50Z"
        evidence_path: tests/distribution-lite-documents.test.ts
        output_digest: "sha256:7baf83418b6f9342d610445e16d6adb351cc694bba26b81932589c030b02bee2"
        result: "full regression、Biome、pre/post DB rebuild、Linux／Windows Lite canary、CodeQL green。doctorの唯一redはconfirm前mergedPlanStatusであり、本review evidence記録とconfirmed遷移で解消対象。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-23T17:59:26Z"
  review_binding:
    reviewer: "Claude Code / independent AI-B"
    reviewed_at: "2026-08-23T17:59:26Z"
    evidence_digest: "sha256:7baf83418b6f9342d610445e16d6adb351cc694bba26b81932589c030b02bee2"
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

## 非対象

tag、publish、remote sync、promotion、DevOS cutoverは実行しない。
