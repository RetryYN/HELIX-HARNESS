---
plan_id: PLAN-REVERSE-1293-cursor-cloud-independent-execution
title: "PLAN-REVERSE-1293: Cursor Cloud第三者実行admissionのfullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-13
updated: 2026-09-13
owner: Codex / TL
github_issue_id: 1293
behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
responsibility_owner: cursor-cloud-execution
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: value_object
forward_routing: L5
promotion_strategy: reuse-with-hardening
parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md
pair_artifact: docs/test-design/helix/L7-cursor-cloud-independent-execution-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1293のCursor Cloud第三者実行admissionをL5/L6へReverse fullbackする"
contract_preconditions: "PLAN-L7-1690の実装、U-CCI-001..018、current HEADのCIと独立review証拠が取得できる"
contract_postconditions: "Forward実装とReverseを双方向接続し、L5/L6契約への適合と未完の実cloud義務を同時に保持する"
contract_invariants: "要求意味・公開契約・provider境界を変更せず、実cloud dispatch、Release、運用実証を完了へ昇格しない"
contract_failures: "双方向link、U-CCI trace、CI、独立review、main read-afterの欠落をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "新runtimeを追加しないReverse接着であり、repo-wide backfill gateが検出した実orphanを既存Redとして用いる"
mutation_oracle_required: true
mutation_oracle_evidence: "PLAN-L7-1690から本Reverse参照が欠落した候補HEADでtests/backfill-pairing.test.ts U-BACKFILL-006がreverseOrphans 1件を検出した。双方向link後のgreenを同testで確認する。"
complexity_effect: net_neutral
complexity_justification: "新しいruntime分岐を作らず、既存Forward PLANとL5/L6/L7成果物をReverse vehicleで再接着する"
removal_trigger: "Cursor Cloud実行capability全体のterminal Reverseが本証拠を統合し、個別vehicle参照が不要になった時"
backprop_scope:
  - layer: L5-detailed-design
    decision: verified
    evidence_path: docs/design/helix/L5-detail/cursor-cloud-independent-execution-contract.md
    reason: "L7実装がL5のassignment、ownership、budget、外部観測、safe release契約を変更せず満たすことを再照合する。"
  - layer: L6-function-design
    decision: verified
    evidence_path: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md
    reason: "U-CCI-001..018とfailure precedenceが実装およびテストへexactに接続されていることを再照合する。"
  - layer: implementation
    decision: verified
    evidence_path: src/runtime/cursor-cloud-independent-execution.ts
    reason: "副作用を持たないNode admissionとして実装され、provider通信や第二writerを追加していない。"
  - layer: unit-test
    decision: verified
    evidence_path: tests/cursor-cloud-independent-execution.test.ts
    reason: "U-CCI-001..018がnegative pathを含めて実装契約を検証する。"
agent_slots:
  - role: tl
    slot_label: "TL — L5/L6へのfullbackと残義務の確認"
  - role: qa
    slot_label: "QA — current HEADのU-CCI-001..018とmutation証拠の再検証"
dependencies:
  parent: docs/plans/PLAN-L7-1690-cursor-cloud-independent-execution.md
  requires:
    - docs/plans/PLAN-L7-1690-cursor-cloud-independent-execution.md
  references:
    - docs/plans/PLAN-L5-105-cursor-cloud-independent-execution-contract.md
    - docs/plans/PLAN-L7-1690-cursor-cloud-independent-execution.md
  blocks: []
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-1293-cursor-cloud-independent-execution.md
    artifact_type: markdown_doc
---

# Cursor Cloud第三者実行admissionのfullback

## R0 観測

`PLAN-L7-1690-cursor-cloud-independent-execution`で、L5契約を満たすpure Node admissionと
U-CCI-001..018が実装された。一方、Forward実装PLANからReverse合流への双方向linkがなく、
repo-wide backfill gateが`reverseOrphans`として検出した。

## R1 分類

要求意味や公開契約の変更ではなく、既存L5/L6契約に対する実装・単体検証の適合確認である。
したがって新しい設計を追加せず、fullbackをL5へ返す。

## R2 検証

- L5のassignment、ownership、budget、外部観測、safe release境界を維持する。
- L6のU-CCI-001..018と実装testの対応を維持する。
- provider通信、credential、課金、副作用、第二台帳・scheduler・writerを追加しない。
- 実cloud dispatchと運用実証は後続義務として残し、本fullbackで完了へ昇格しない。

## R3 判断

実装は既存設計を満たしており、上位要求の変更候補はない。current HEADの全回帰と独立reviewが
greenになった場合にだけR4合流を確定する。

## R4 Forward合流

Forward routingはL5とする。`PLAN-L7-1690`との双方向link、U-CCI-001..018、全回帰、
独立review、main read-afterを確認するまで本PLANをconfirmedへ昇格しない。

## 受入条件

- backfill pairingの`reverseOrphans`と`reverseLinkMissing`が0になる。
- L5/L6、実装、L7テスト設計、U-CCI-001..018のtraceを保持する。
- 実cloud dispatch、Release、運用検証の残義務を閉じない。
