---
plan_id: PLAN-RECOVERY-1404-confirmed-design-active-bun-command
title: "PLAN-RECOVERY-1404: confirmed設計のactive Bun command収束"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex
created: 2026-09-09
updated: 2026-09-09
github_issue_id: 1404
behavior_contract_id: ISSUE-1404-ACTIVE-BUN-COMMAND-SLICE1
responsibility_owner: confirmed-design-runtime-command-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: configure
ddd_modeling_decision: policy
contract_preconditions: "confirmed設計、現行Node wrapper、Bun legacy候補inventoryを同一HEADで照合する"
contract_postconditions: "confirmed設計のactive commandをNode.js 24/npm正本へ収束し、reviewed-safe projectionを追従する"
contract_invariants: "historical記録を消さず、実wrapperのsource-first順序、L1-L12 authority gate、既存consumerを維持する"
contract_failures: "active Bun commandの残置、wrapper順序の逆転、inventory・digest・count pinのstale化、新規候補の無検出を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "既存のL12 canonical／hybrid recognition oracleへ、confirmed設計のcommand置換に伴うinventory・digest・count追従だけを適用するslice。新しいruntime分岐や検査義務は追加しない。"
complexity_effect: net_neutral
complexity_justification: "既存lintとrecognition projectionを再利用し、別authorityや別scannerを追加しない"
removal_trigger: "Bun compatibility/historical tokenの正規registry移管とconsumer 0を独立検収した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/l12-reviewed-safe-inventory-lifecycle.md
pair_artifact: docs/test-design/helix/L8-l12-reviewed-safe-inventory-lifecycle-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/l12-reviewed-safe-inventory-lifecycle.md, oracle_id: U-L12INV-004, test_path: tests/l12-canonical-authority.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references:
    - issue:1404
    - issue:1126
    - issue:1395
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1404-confirmed-design-active-bun-command.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/harness/L6-function-design/closure-evidence-materialization.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/function-spec.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/l12-reviewed-safe-inventory-lifecycle.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-l12-reviewed-safe-inventory-lifecycle-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-canonical-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
agent_slots:
  - { role: tl, slot_label: "TL — 現行runtime commandとconfirmed設計の意味整合を確認" }
  - { role: qa, slot_label: "QA — active Bun残置とrecognition pin driftの反例を検証" }
  - { role: aim, slot_label: "AIM — historical保持とcurrent authority収束の境界を照合" }
review_evidence: []
---

# confirmed設計のactive Bun command収束

## 対象

Issue #1404で実測されたconfirmed L6設計2件のactive Bun commandを、Node.js 24/npmの現行実装へ置換する。`docs/design/harness/`はcurrent implementation authorityではなくcompatibility design referenceであることを明示し、historicalなBun記録は削除しない。

## 受入条件

- closure evidence commandは`npx vitest`を使い、`bunx`をactive commandとして出力しない。
- wrapper説明は実装どおり`src/cli.ts`を先に実行し、存在しない場合だけ`dist/helix`へfallbackする。
- changed design、reviewed-safe digest、candidate inventory、件数oracleが同一HEADで一致する。
- `tests/l12-canonical-authority.test.ts`と`tests/l12-hybrid-recognition.test.ts`がgreenである。
- full CI、exact-HEAD独立review、main read-afterが揃うまで完了主張しない。

## 工程表

1. R0: Issue #1404、現行wrapper、confirmed設計、recognition inventoryを照合した。
2. R1/R2: active Bun commandとstale pinを既存L12 oracleが拒否することを確認した。
3. R3: Cursor成果を正規branchへ回収し、Codexがwrapper順序、inventory、digest、件数を追従した。
4. R4: PLAN companion追加後のfresh CIと独立reviewを行い、main read-afterで終端する。

## 完了境界

局所テスト32件、design-language gate、diff-checkはgreen。現時点のCI failureはPR scope manifestのPLAN companion不足とtyped expansion形式に限定される。本PLANはそのownershipを正規化するが、独立reviewとfresh CI成功まではdraftを維持する。
