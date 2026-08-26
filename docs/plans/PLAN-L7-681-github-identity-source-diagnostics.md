---
plan_id: PLAN-L7-681-github-identity-source-diagnostics
title: "PLAN-L7-681 (impl): GitHub workflow identity診断のIssue／PR sourceを分離する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #1050のworkflow identity parse failureでIssue／PR sourceを失わない"
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 1050
engineering_discipline_required: true
behavior_contract_id: GITHUB-WORKFLOW-IDENTITY-DIAGNOSTIC-001
responsibility_owner: github-workflow-identity-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
backprop_decision: not_required
backprop_decision_reason: "既存のgeneric parser契約を保持し、adapter境界へsource-awareな診断写像だけを追加するため、上位要求の意味を変更しない"
contract_preconditions: "Issue／PR bodyを同一のtyped generic parserで検査し、parserがfailure reasonとdetailを返す"
contract_postconditions: "adapterの全parser failureがissue_またはpr_のsource-specific reasonとなり、CLI／JSONで欠落surfaceを機械識別できる"
contract_invariants: "generic parserのfailure reason、valid pair、Issue／PR tuple mismatchは変更せず、proseからsourceを推測しない"
contract_failures: "Issue／PRのparse failureが同じgeneric reasonへ縮退する、またはsource-specific診断がvalid pairを阻害する"
tdd_red_required: true
red_test: "U-GWIDADM-021がIssue／PRの全generic parser failureをsource-specific reasonへ写像し、tuple mismatchだけはcomparison reasonを保持することを検出する"
complexity_effect: net_neutral
complexity_justification: "parserを複製せず、既存adapterの二つの呼び出し点へpureなsource mappingを追加する"
removal_trigger: "admission parserがsource-aware typed failureを直接返すversioned contractへ移行した時"
parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-021, test_path: tests/github-workflow-identity-admission.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-681-github-identity-source-diagnostics.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/adapters/github-workflow-identity-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/github-workflow-identity-admission.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: PLAN-L7-574-github-workflow-identity-admission
  requires:
    - docs/design/helix/L6-function-design/github-workflow-identity-admission.md
    - docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — Issue／PR source-aware admission mapping" }
  - { role: qa, slot_label: "QA — generic parser failureの全reason回帰" }
  - { role: tl, slot_label: "TL — parser／adapter／CLI境界の契約確認" }
---

# GitHub workflow identity診断のsource分離

## 目的

Issue #1050で確認された、Issue bodyとPR bodyのworkflow identity contract parse failureが同じreasonへ
畳み込まれ、operatorとCI self-healが欠落surfaceを識別できない問題を是正する。generic parserは既存の
schema／authority判定を所有したまま変更せず、adapter境界で`issue_`／`pr_`を付与したtyped reasonへ写像する。

## 実装範囲

1. parserが返す全failure reasonをIssue／PR surface別のunionへ写像する。
2. `workflow_identity_contract_issue_pr_mismatch`のように両面比較が原因のfailureはgeneric comparison reasonを保持する。
3. current CLI messageとJSON resultがsource-specific reasonをそのまま出力することを確認する。
4. Issue／PRのmissing、duplicate、JSON、schema、legacy、authority、identity、signal各failureとvalid pairを
   回帰テストし、generic parserの既存テストは変更しない。

## 受入条件

- `issue_workflow_identity_contract_missing`と`pr_workflow_identity_contract_missing`を個別に返す。
- missing以外の全parser failureでもIssue／PR surfaceを失わない。
- Issue／PR tuple mismatchはsource単独のparse failureとして誤分類しない。
- current valid pairは従来どおりpassし、generic parserのreason契約は不変である。
- targeted test、typecheck、Biome、PLAN lint、full `harness-check`、Claude exact-HEAD review、main read-afterを通過する。
