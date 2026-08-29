---
plan_id: PLAN-REVERSE-565-workflow-model-process-typed-authority
title: "PLAN-REVERSE-565: workflow model process文書をrequirements typed authorityへ再接着する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-17T08:45:20Z"
    tests_green_at: "2026-08-17T08:45:13Z"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Codex TLが今回のPR差分を対象に、10個のworkflow process文書のtyped axis、requirements v1.3.12／registry v1.1.4参照、L1-L12 canonical境界、legacy compatibility-only境界、L12 recognition inventoryとの整合を確認した。専用oracleと既存L12 authority oracleを合わせた39 testsがgreenで、Claude Codeの独立exact-HEADレビューは未実施のため本entryはClaudeレビューを代替しない。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/l12-canonical-authority.test.ts tests/l12-hybrid-recognition.test.ts tests/l12-recognition-inventory-count.test.ts tests/feedback-test-owner-residual-disposition.test.ts tests/process-workflow-model-authority.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-17T08:45:13Z"
        evidence_path: tests/process-workflow-model-authority.test.ts
        output_digest: "sha256:db859ab04c01a6c64d2562a1771f006e6d1d3f30de3caa08a65832edffe40be5"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206のworkflow model process文書が旧requirements、旧layer、旧mode分類をcurrent guidanceとして再出力している"
created: 2026-08-17
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: WORKFLOW-MODE-PROCESS-TYPED-AUTHORITY-001
responsibility_owner: workflow-model-process-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "workflow model process文書がrequirements v1.2、L0-L14、旧mode、旧駆動モデルを現行手順として案内している"
contract_postconditions: "各文書がrequirements v1.3.12とregistry v1.1.4を意味authorityとし、workflow_modelまたはspecialist_workflowのtyped identity、L1-L12、legacy compatibility境界を案内する"
contract_invariants: "development style、case-driven model、workflow model、subroute、specialist drive、PLAN kind、execution mode、specialist workflow、capabilityを混同しない"
contract_failures: "旧requirements、L0-L14、Bun、旧駆動モデル、旧modeをcurrent guidanceへ再導入した文書を受理しない"
tdd_red_required: false
tdd_red_waiver_reason: "既存の旧process guidanceを対象にnegative oracleを追加し、旧定義の再導入を同一sliceでfail-closeする"
mutation_oracle_evidence: "U-WMPA-001〜005がauthority、typed identity、L1-L12、legacy隔離、旧定義再導入を独立assertする"
complexity_effect: net_negative
complexity_justification: "複数の旧mode説明をrequirements-owned typed axisへ収束させ、文書surfaceの意味正本を一つにする"
removal_trigger: "workflow process文書がregistryから完全生成され、手書きprojection consumerが0になった時点"
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "requirements v1.3.12 §4、§4.1、§4.2、§9.2、§10のtyped axisとstate machine境界を文書へ投影する。"
  - layer: L10-system-test
    decision: preserve
    evidence_path: docs/test-design/helix/github-autonomous-operations-acceptance.md
    reason: "旧authority再導入と異軸混同を専用oracleへ具体化する。"
agent_slots:
  - { role: se, slot_label: "SE — workflow model processのtyped authority再投影" }
  - { role: qa, slot_label: "QA — 旧定義／layer／mode再導入mutation" }
  - { role: tl, slot_label: "TL — requirements registryとの意味一致" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-565-workflow-model-process-typed-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/add-feature.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/design-bottomup.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/incident.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/refactor.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/research.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/retrofit.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/reverse.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/version-up.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/specialist-workflows.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/.gitkeep, artifact_type: markdown_doc }
  - { artifact_path: tests/process-workflow-model-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/layer-authority-drift.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/feedback-test-owner-disposition-residual.json, artifact_type: json_config }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-canonical-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-REVERSE-563-process-readme-typed-authority.md
  requires:
    - docs/plans/PLAN-REVERSE-560-process-workflow-authority-index.md
    - docs/plans/PLAN-REVERSE-561-scrum-discovery-typed-process.md
    - docs/plans/PLAN-REVERSE-562-drive-route-system-typed-authority.md
    - docs/plans/PLAN-REVERSE-563-process-readme-typed-authority.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - config/workflow-classification-catalog.v1.json
---

# workflow model process文書のtyped authority再接着

## R0 現状採取

Issue #206のcurrent-main inventoryで、個別workflow文書にrequirements v1.2、旧L0-L14、旧mode／駆動モデルの
説明が残り、requirements v1.3.12のtyped registryと矛盾することを確認した。索引、Scrum／Discovery、
drive-route、process READMEは先行sliceで是正済みだが、個別workflow文書が旧定義を再出力している。

## R1 skip判定

既知のauthority driftを正規化するReverse sliceなのでR1をskipする。新しいworkflow identityやstate machineを
推測せず、registryに存在するaxisとIDだけを文書へ投影する。

## R2 As-Is照合

意味authorityはrequirements、typed mirrorはregistry、catalogはgenerated projection、旧分類は
compatibility-onlyである。`REVERSE`、`RECOVERY`、`INCIDENT`、`REFACTOR`、`RETROFIT`、`RESEARCH`、
`ADD_FEATURE`、`VERSION_UP`はworkflow model、`design-bottomup`は`specialist_workflow:SCREEN_DESIGN`へ分離する。

## R3 意図照合

本sliceは旧語の置換だけでなく、各文書の入口、state、Forward再入、evidence、承認境界をtyped identityへ
再束縛する。L0-L14はcurrent判断から外し、L1-L12とL0 charter anchorを案内する。

## R4 Forward再入

専用oracle、PLAN lint、design-language、typecheck、全回帰、doctor、DB convergence、Claude exact-HEAD review、
main read-afterが揃うまでcompletion claimを許可しない。runtime／CLI／DB／doctorのconsumer移行は#204の後続sliceで行う。
