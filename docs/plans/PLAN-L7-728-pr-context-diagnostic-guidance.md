---
plan_id: PLAN-L7-728-pr-context-diagnostic-guidance
title: "PLAN-L7-728 (refactor): PR scope manifestの受理形式を診断へ投影する"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
entry_signals:
  - "structural"
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1515
behavior_contract_id: GH-AC-040
responsibility_owner: pr-scope-guard
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "判定対象と拒否条件は変更せず、既存契約の受理形式を診断とtemplateへ明示する。"
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "GH-AC-040、PLAN-L7-466、analyzePrContextの既存scope判定がcurrent authorityである"
contract_postconditions: "scope manifest各findingが受理形式と修正方向を示し、PR templateが同じ形式を案内する"
contract_invariants: "gateの受理範囲、unsafe path検査、atomic contract/owner検査、exact diff照合を緩和しない。新CI job、別authority、暗黙の自動承認を追加しない"
contract_failures: "診断が実際のvalidator規則と異なる形式を案内する、またはtemplateがparserにより重複fieldとして解釈される場合はfail-closeする"
tdd_red_required: true
red_at: "2026-09-04T19:59:00+09:00"
complexity_effect: net_negative
complexity_justification: "失敗後にmerged PR本文を探索する手戻りを減らし、既存parser・既存CI・既存templateへ説明を集約する"
removal_trigger: "typed PR metadataが受理形式と修正提案をimmutableに提供し、本文parserが廃止された時点"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-466-pr-scope-contract.md
  requires:
    - docs/design/helix/L3-requirements/github-atomic-development-requirements.md
  references:
    - issue:1515
    - docs/plans/PLAN-L7-466-pr-scope-contract.md
    - .github/PULL_REQUEST_TEMPLATE.md
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-728-pr-context-diagnostic-guidance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/lint/github-guards.ts, artifact_type: source_module }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
  - { artifact_path: .github/PULL_REQUEST_TEMPLATE.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: se, slot_label: "SE — 既存pr-context findingの受理形式診断" }
  - { role: qa, slot_label: "QA — 診断とvalidator規則の不一致反例" }
  - { role: tl, slot_label: "TL — gate緩和なしの責務境界確認" }
review_evidence: []
---

# PLAN-L7-728: PR scope manifestの受理形式診断

## 目的

Issue #1515で確認された、PR本文のscope manifestが内容ではなく記法差で拒否されたときに、
validatorの受理形式が診断から読み取れない問題を是正する。判定ロジックや拒否条件は変更せず、
既存の`analyzePrContext`のfinding messageと`.github/PULL_REQUEST_TEMPLATE.md`へ同じ入力規則を投影する。

## 対象

- `pr_scope_manifest_missing`、contract／owner／path family／expected path／companionの各findingに受理形式を追加する。
- exact path mismatchの既存提案に、入力形式の説明を補う。
- PR templateに、1行1項目・同一行の値・comma区切り・backtickを値へ付けない規則を明記する。
- 専用oracleで、記法を緩和せず診断が実validator規則を説明することを固定する。

## 非対象

- backtickや`;`を受理するparser寛容化。
- contract ID、owner、path safety、root family禁止、exact diff集合の判定変更。
- 新しいCI job、detector、DB state、別のrequirements authority。
- 既存PR本文の遡及修正。

## 完了条件

対象findingの受理形式、template、テストが同じ規則を示し、targeted test、typecheck、Biome、
plan lint、全回帰、Claude current-HEAD review、DB convergence、main read-afterがgreenになること。
