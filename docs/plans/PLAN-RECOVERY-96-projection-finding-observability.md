---
plan_id: PLAN-RECOVERY-96-projection-finding-observability
title: "PLAN-RECOVERY-96: projection writerの黙示的欠落をfindingとして可視化する"
kind: recovery
layer: cross
drive: db
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1440
behavior_contract_id: PROJECTION-FINDING-OBSERVABILITY-001
responsibility_owner: projection-finding-observability
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
  - "regression_dev:projection writerのsilent skip、collision、parse失敗の黙示成功をfindingへ回復する"
contract_preconditions: "confirmed System Synthesisのstable identity・deterministic projection・fail-close原則とPLAN-L7-46 projection writerが存在する"
contract_postconditions: "projectionの欠落・衝突・破損・依存不整合がsuccess相当へ消えず、findingまたはtyped failureとしてrebuild/replayで同一に観測できる"
contract_invariants: "source文書を変更せず、既存finding storeとDB transaction boundaryを再利用し、#1397の責務を変更しない"
contract_failures: "malformed evidence、plan_id欠落、span collision、parse error、row-count mismatch、reason欠落、cache digest driftを黙って成功させない"
tdd_red_required: true
mutation_oracle_required: true
mutation_oracle_evidence: "未実施。U-PFO-001〜009を実装前Redへ追加し、黙示skip、namespace除去、parse error消失、依存順序変更を各mutationで捕捉する"
complexity_effect: net_neutral
complexity_justification: "既存projection writerとfinding storeの欠落経路を型付き失敗へ収束し、新しいDB authorityや別projectionを増やさない"
removal_trigger: "既存projection writerの恒久的acceptanceへ統合し、Recovery専用の重複検査が不要になった時点でsource PLANから統合する"
backprop_decision: not_required
backprop_decision_reason: "confirmed System Synthesisの意味を変更せず、既存L7 projectionのfail-openを回復する"
parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md
pair_artifact: docs/test-design/helix/L8-projection-finding-observability-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-46-projection-writer.md
  requires:
    - docs/plans/PLAN-L7-46-projection-writer.md
  references:
    - "issue:1440"
    - "issue:1397"
    - "issue:1391"
    - "issue:1420"
    - docs/design/helix/L3-requirements/system-synthesis-requirements.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md, oracle_id: U-PFO-001, test_path: tests/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md, oracle_id: U-PFO-002, test_path: tests/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md, oracle_id: U-PFO-003, test_path: tests/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md, oracle_id: U-PFO-004, test_path: tests/test-report-parser.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md, oracle_id: U-PFO-005, test_path: tests/slow/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md, oracle_id: U-PFO-006, test_path: tests/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md, oracle_id: U-PFO-007, test_path: tests/feedback-refactor-disposition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md, oracle_id: U-PFO-008, test_path: tests/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/projection-finding-observability.md, oracle_id: U-PFO-009, test_path: tests/slow/projection-writer.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — projection欠落のRecovery監査" }
  - { role: se, slot_label: "SE — projection writerのtyped failureとstable identity" }
  - { role: qa, slot_label: "QA — silent skip・collision・rebuild順序mutation" }
  - { role: tl, slot_label: "TL — DB projection／finding境界と#1397非対象確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-96-projection-finding-observability.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/projection-finding-observability.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-projection-finding-observability-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/feedback-refactor-disposition.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
modifies:
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/test-report-parser.ts, artifact_type: source_module }
  - { artifact_path: tests/projection-writer.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/projection-writer.test.ts, artifact_type: test_code }
  - { artifact_path: tests/test-report-parser.test.ts, artifact_type: test_code }
  - { artifact_path: tests/feedback-refactor-disposition.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
review_evidence: []
---

# PLAN-RECOVERY-96: projection writerの黙示的欠落をfindingとして可視化する

## 目的

Issue #1440で確認されたprojection writerのsilent skip、stable identity衝突、JSON parse失敗の正常値化、
rebuild依存順の暗黙化、drive registration理由の欠落、cache digest未束縛を、既存のSystem Synthesis／projection
authorityへ束縛して回復する。DBを直接修正するのではなく、同じsourceからrebuild／replayした結果に欠落理由を残す。

## 実装範囲

1. malformed green-command evidenceとmissing `plan_id`をfinding化する。
2. model-run identityをrun単位でnamespaceし、span collisionをfail-closeする。
3. JSON readerを`{ value, parseError }`相当のtyped resultへ変更し、破損JSONをactive/incompleteとして投影しない。
4. rebuildのdependency row-count／join invariant、drive registrationのtyped reason、refactor cacheのsource digestを追加する。
5. metadata parse boundaryを明示し、既存transaction boundaryを変更せず再現可能なfindingへする。

## 非対象

- Issue #1397のtransaction boundary／atomicity本体。
- 新しいDB table、別のfinding store、source documentの自動修正。
- Issue／PLANの自動closeや、Issue本文を正本とするprojection。

## 完了条件

- [ ] U-PFO-001〜009のTDD Red→Greenがcurrent HEADで確認できる。
- [ ] silent skip、collision上書き、parse error消失、dependency order mutationを各oracleがredにする。
- [ ] DB rebuildとreplayのprojection／finding exact setが一致する。
- [ ] typecheck、targeted test、全回帰、doctor、Claude exact-HEAD reviewがgreenになる。
- [ ] #1440へmain read-afterの実測証拠を接続し、Recoveryの終端状態を正本へ反映する。

本PLANは要求追加ではなく、confirmed System Synthesisと既存PLAN-L7-46の欠落経路を回復するdraftである。実装・完了・Issue closeは、上記証拠が揃うまで主張しない。
