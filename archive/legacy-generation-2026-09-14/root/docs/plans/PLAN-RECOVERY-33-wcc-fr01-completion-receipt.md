---
plan_id: PLAN-RECOVERY-33-wcc-fr01-completion-receipt
title: "PLAN-RECOVERY-33 (recovery): WCC-FR-01 completion binding欠落を回復し#194 closure graphを充足する"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 /goal順序指示 #194 外部worker共通admissionを正式close（WCC-FR-01 completion receipt欠落の回復）"
created: 2026-08-06
updated: 2026-08-06
owner: Claude / TL（PO承認必須）
engineering_discipline_required: true
behavior_contract_id: WCC-FR01-COMPLETION-001
responsibility_owner: worker-descriptor-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "worker-descriptor-admission runtime（agent_id/contract_version/capability_class強制）とL3 WCC-FR-01要件が存在し、#194 closure graphがWCC-FR-01のcompletion receiptのみ欠落している"
contract_postconditions: "WCC-FR-01のL3要件がruntime admissionで強制されることをU-WCC-FR01-001がcurrent-HEADで束縛し、本PRのv2 review receiptを根拠にWCC-FR-01 completion receiptを#225へ掲載できる"
contract_invariants: "WCC-FR-01の要件文言・descriptor schema・既存U-WDA-001を変更しない。#194 closure graphの他8契約(WCC-FR-02..09)のreceiptに触れない"
contract_failures: "descriptor schemaがagent_id/contract_version/capability_classのいずれかを落とす、またはL3 §1がversioned descriptor 3フィールドをmandateしなくなった場合にU-WCC-FR01-001がredになる"
tdd_red_required: true
red_at: "2026-08-06T22:52:00Z"
green_at: "2026-08-06T22:53:49Z"
mutation_oracle_evidence: "tests/wcc-fr-01-descriptor-binding.test.ts の U-WCC-FR01-001 で検証。descriptor から agent_id / contract_version / capability_class を各々削除し digest 再計算した mutation を parseWorkerDescriptor へ投入し ok=false（fail-close）になることを worktree で実測（3 passed、欠落時 reject）。"
complexity_effect: net_neutral
complexity_justification: "既存 worker-descriptor-admission runtime と L3 要件を跨ぐ requirement→implementation binding test 1本を追加し、新 runtime state/detector/dependency を増やさない"
removal_trigger: "#194 が close され WCC pair の全 completion receipt が closure graph で恒常検証されるようになった時点で、本 binding を worker-descriptor-admission の恒常 acceptance へ統合する"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-06T22:53:49Z"
  review_binding:
    reviewer: claude-intra-runtime
    reviewed_at: "2026-08-06T22:53:49Z"
    evidence_digest: "sha256:81e3007562770595e87f2e30ecb512ea4529b6507b5cbdcb6096ef9d57aff60a"
  entries: []
parent_design: docs/design/helix/L3-requirements/worker-common-contract.md
pair_artifact: docs/test-design/helix/worker-common-contract-acceptance.md
verification_bindings:
  - { parent_design: docs/design/helix/L3-requirements/worker-common-contract.md, oracle_id: U-WCC-FR01-001, test_path: tests/wcc-fr-01-descriptor-binding.test.ts }
agent_slots:
  - role: aim
    slot_label: "AIM — WCC-FR-01 completion receipt回復実装"
  - role: tl
    slot_label: "TL — requirement→implementation binding契約review"
  - role: qa
    slot_label: "QA — descriptor欠落 mutation-oracle回帰"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-33-wcc-fr01-completion-receipt.md, artifact_type: markdown_doc }
  - { artifact_path: tests/wcc-fr-01-descriptor-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-497-worker-descriptor-admission.md
  requires: []
  references:
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
  blocks:
    - "issue:#194"
review_evidence:
  - reviewer: claude-intra-runtime
    review_kind: intra_runtime_subagent
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
    tests_green_at: "2026-08-06T22:53:49Z"
    reviewed_at: "2026-08-06T22:53:49Z"
    verdict: approve
    scope: "単一runtime運用時の代替証跡。WCC-FR-01のL3要件文言とruntime descriptor schema強制の一致・欠落mutationのred・既存U-WDA-001非重複をworktreeで検証。#194 closure graphのWCC-FR-01 completion receipt根拠を生成する。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/wcc-fr-01-descriptor-binding.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T22:53:49Z", evidence_path: tests/wcc-fr-01-descriptor-binding.test.ts, output_digest: "sha256:321b4dd9b8fa865fbdac4c9d9f4a5849d673cd83c11d51669e29adceb148e323" }
---

# PLAN-RECOVERY-33: WCC-FR-01 completion binding欠落の回復と#194 closure graph充足

## 目的

#194（外部worker共通admission）を正式closeするには、closure graph gate（#373）が canonical contract
`WCC-FR-01`〜`WCC-FR-09` 各々の completion receipt を要求する。調査の結果、`WCC-FR-02`〜`WCC-FR-09` の
8件は子Issue（#225/226/227）へ掲載済みだが、**`WCC-FR-01`（委譲面: versioned descriptor）のみ receipt が
欠落**していた。実装は #355（descriptor admission、merged・CI green）だが、当時 v2 review-receipt 形式が
未導入で closure gate 準拠の証跡が残らなかった。

本recoveryは捏造ではなく、current-HEAD の実 evidence として `WCC-FR-01` の要件（L3）が runtime
worker-descriptor-admission で実際に強制されることを束縛する検証を追加し、本PRの正規 v2 review receipt を
根拠に `WCC-FR-01` completion receipt を #225 へ掲載可能にする。

## 非対象

- descriptor schema・WCC-FR-01 要件文言・既存 U-WDA-001 の変更。
- 他8契約（WCC-FR-02..09）の receipt。
- #194 closing PR 本体（本PR merge 後に別途起票）。

## 変更

- `tests/wcc-fr-01-descriptor-binding.test.ts`（新規）: U-WCC-FR01-001。L3 §1 WCC-FR-01 行が
  versioned descriptor の3フィールド（agent_id/contract_version/capability_class）を mandate すること、
  runtime `parseWorkerDescriptor` が完全 descriptor を受理し、3フィールド欠落（digest 再計算後）を
  fail-close することを requirement→implementation で束縛する。

## 完了条件

- U-WCC-FR01-001 が green（L3 要件文言一致＋descriptor 受理＋欠落 reject）。
- targeted test・typecheck・harness-check が green。
- 本PRの current-HEAD v2 review receipt を根拠に WCC-FR-01 completion receipt を #225 へ掲載し、
  #194 closure graph の receipt 9/9 を充足する。
