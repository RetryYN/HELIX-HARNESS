---
plan_id: PLAN-RECOVERY-1627-review-request-changes-fail-close
title: "PLAN-RECOVERY-1627: 未解消review変更要求のfail-close"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-08
updated: 2026-09-08
owner: Codex / TL
github_issue_id: 1627
behavior_contract_id: REVIEW-REQUEST-CHANGES-FAIL-CLOSE-001
responsibility_owner: independent-review-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: strengthen_contract
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
contract_preconditions: "同一PR・HEADのsealed review receipt集合と変更PLANをexactに取得できる"
contract_postconditions: "未解消blockは無関係sessionのapproveで消えず、mergeとterminal PLAN昇格を拒否する"
contract_invariants: "正規supersession、独立review、exact HEAD、CI／DB真正性を維持する"
contract_failures: "receipt履歴取得不能、未解消block、偽のreview evidenceをfail-closeする"
tdd_red_required: true
red_test: "U-CPRCONV-044で別session approveが未解消blockを上書きできる現行挙動を再現した"
red_at: "2026-09-08T00:44:43+09:00"
green_at: null
mutation_oracle_required: true
mutation_oracle_evidence: null
complexity_effect: net_negative
complexity_justification: "既存sealed receiptとreview admissionへsupersession集約関数を追加し、別証拠基盤を作らない"
removal_trigger: "なし。独立review authorityの恒久的なfail-close境界"
backprop_decision: not_required
backprop_decision_reason: "承認済みIssue #1627による既存review authorityのRecoveryであり新要求追加ではない"
parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md
pair_artifact: docs/test-design/helix/L8-review-receipt-plan-binding-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-CPRCONV-044, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-CPRCONV-045, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-GCRA-014, test_path: tests/github-cross-review-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRCF-001, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRCF-002, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRCF-003, test_path: tests/review-receipt-plan-binding.test.ts }
dependencies:
  parent: null
  requires:
    - "issue:1622"
  references:
    - "issue:1620"
    - "issue:1625"
    - "issue:1627"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1627-review-request-changes-fail-close.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/review-receipt-plan-binding.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/review-receipt-plan-binding.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — review authorityとsupersession境界監査" }
  - { role: se, slot_label: "SE — receipt履歴とmerge／terminal admission接続" }
  - { role: qa, slot_label: "QA — 別session上書きと履歴取得不能の反例" }
  - { role: tl, slot_label: "TL — #1627 Recovery収束" }
review_evidence: []
---

# 未解消review変更要求のfail-close

同一PR・HEADの`verdict: block`を変更要求として扱い、同じreviewer sessionの後続approve、または
対象receiptを明示したsupersessionが成立するまでmerge admissionを拒否する。

## Postmortem

- 再発: PR #1620、#1625、#1628で判断側の未解消blockとPLAN／merge候補の状態が乖離した。
- 原因: admissionが単一approve receiptだけを評価し、同一HEADのreceipt履歴を集約していなかった。
- 封じ込め: GitHub comment上のsealed receipt集合をread-afterし、mergeとterminal PLAN昇格の両入口で検査する。
- 非対象: review schemaの別正本化、独立review省略、provider actor再設計。
