---
plan_id: PLAN-RECOVERY-61-review-receipt-producer-causality
title: "PLAN-RECOVERY-61 (recovery): review receipt producerの時系列証跡をfail-closeする"
kind: recovery
layer: cross
promotion_strategy: reuse-with-hardening
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:0ff1f90cd2e329b52f784ada54c18d06a79253488664290290327b81bef17f47
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #769 receipt producerが未来のreviewedAtを受理し、CI完了との因果順をproducer境界で検査していない"
created: 2026-08-18
updated: 2026-08-18
owner: Codex / TL
github_issue_id: 769
behavior_contract_id: REVIEW-RECEIPT-TEMPORAL-001
responsibility_owner: review-receipt-provenance
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "Claude receipt producerがreviewedAtとterminal harness-checkの完了時刻を別々に扱い、未来時刻またはCI完了前のreviewをsealできる"
contract_postconditions: "current receiptは実時計より未来のreviewedAtを拒否し、apply時は引用CIのupdatedAt以後のreviewedAtだけをsealする"
contract_invariants: "旧receipt本文を補正せず、v2/v3 compatibility read-only境界とcurrent v4 generation bindingを維持し、時系列違反をwarningで通さない"
contract_failures: "reviewed_at_future、CI timestamp欠落、CI完了前review、current generation不一致をfail-closeする"
tdd_red_required: true
mutation_oracle_evidence: "U-CPRCONV-036は未来時刻を注入してproducerがreviewed_at_futureで拒否することを検証する。既存admission oracleはcomment/CI causal orderを継続して検証する"
complexity_effect: justified_positive
complexity_justification: "receipt producerが時系列の意味を生成境界で検証するため、CI evidenceのgenerationにterminal updatedAtを束縛する"
removal_trigger: "GitHub receipt producerが別の型付きreview event APIへ移行し、旧pr-review-receipt経路が廃止された時点"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md
  requires:
    - issue:769
  blocks: []
  references:
    - docs/governance/github-operation-rules.md
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L5-detail/github-cross-review-admission.md
    - docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
    - src/runtime/claude-pr-convergence.ts
    - src/cli.ts
agent_slots:
  - { role: aim, slot_label: "AIM — #769 future timestamp incidentと因果順の境界確定" }
  - { role: se, slot_label: "SE — receipt producerとCI terminal timestampの型付き接続" }
  - { role: qa, slot_label: "QA — future reviewedAt、timestamp欠落、CI完了前reviewのnegative oracle" }
  - { role: tl, slot_label: "TL — admission側の既存causal gateとの二重計測を監査" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-61-review-receipt-producer-causality.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }

---

# PLAN-RECOVERY-61：review receipt producerの時系列証跡をfail-closeする

## 背景

Issue #769の実測で、Claude receiptの`reviewedAt`がGitHub commentの作成時刻およびCI generationより未来になる事象を確認した。current admissionはこのreceiptを拒否するが、producer自体は不正な時系列を生成・投稿できるため、レビュー証跡の供給側に再発防止が必要である。

## 契約

```text
terminal harness-check
  → run / attempt / conclusion / updatedAt
  → Claude review receipt producer
  → comment seal
  → current-head admission
```

producerは、未来の`reviewedAt`、timestampが欠落したCI evidence、CI完了前のreviewをfail-closeする。既存のcomment read-after、current-head、DB convergence、v4 generation bindingは緩和しない。

## 実装範囲

- `buildClaudePrReviewReceipt`で未来の`reviewedAt`を拒否する。
- `pr-review-receipt --apply`で、current terminal CIの`updatedAt <= reviewedAt`を検証する。
- `pr-notify`は既存のgeneration文字列だけを外部へ渡し、内部ではtimestamp欠落をfail-closeする。
- v2/v3 receiptはcompatibility read-onlyのまま保持する。

## 検証

- `U-CPRCONV-036`: 未来の`reviewedAt`を注入したreceipt生成を拒否する。
- 既存の`U-GCRA-004`および`U-GCRA-003b`: comment/CI causal orderとstale generationを拒否する。
- targeted Vitest、typecheck、Biome、PLAN lint、全回帰、doctor、Claude exact-HEAD review、DB convergenceを実行する。

## 非対象

- 過去に投稿済みのreceipt本文の改変・削除。
- GitHub Actionsのworkflow実行方式変更。
- release、tag、配布repo切替、action-binding approval。
