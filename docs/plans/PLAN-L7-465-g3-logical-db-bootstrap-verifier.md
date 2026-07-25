---
plan_id: PLAN-L7-465-g3-logical-db-bootstrap-verifier
title: "PLAN-L7-465 (troubleshoot): G3 logical DB bootstrap verifier責務分離"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-25 PR #122のCIを自己修復し、L3 freezeを先取りせず最新HEADレビューとDB convergenceを閉じる"
created: 2026-07-25
updated: 2026-07-25
owner: Codex / TL
github_issue_id: 30
engineering_discipline_required: true
behavior_contract_id: GH-AC-016
responsibility_owner: g3-logical-db-bootstrap-verifier
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L3-20のG1/G3 packetがversioned logical DB policyと再現可能receiptを要求する"
contract_postconditions: "repository-owned verifierが同一tracked authorityから2回rebuildし、normalization exact setを含むtyped convergence receiptを返す"
contract_invariants: "L3 freeze状態を変更せず、L6 canonical implementation分母へ算入せず、runtime logsをauthorityへ混入させない"
contract_failures: "policy/schema/source provenance、population、stale/orphan、digest一致のいずれかが崩れた場合はconverged=falseまたは非zeroでfail-closeする"
tdd_red_required: true
red_at: "2026-07-24T19:35:00Z"
green_at: "2026-07-24T21:53:00Z"
mutation_oracle_evidence: "tests/l3-g3-freeze-packet-v2.test.tsでruntime-log provenance、empty checkpoints、stale/orphan vacuity、policy locator drift、digest divergenceに加え、schema/canonical JSON/table/column/row order/normalization marker/rebuild count/tracked workspace/runtime mode/excluded pathの宣言改変をseedしてkilled"
complexity_effect: justified_positive
complexity_justification: "G3承認前にDB convergence主張を実計算で反証可能にする最小の一時verifier。独立jobやdependencyを増やさず既存doctor ownerとruntime digest authorityを再利用する"
removal_trigger: "G3 freeze成立後、同等のcanonical DB receipt commandへ移管しconsumer=0を確認した時点でbootstrap policy/verifierを削除する"
backprop_decision: not_required
backprop_decision_reason: "L3 packetが既に要求するDB convergence証拠の実行責務を分離するCI self-healであり、要求・設計・freeze状態の意味を変更しない"
parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md
pair_artifact: docs/governance/l3-g3-logical-db-bootstrap-policy.json
verification_bindings:
  - { parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md, oracle_id: U-G3DB-001, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md, oracle_id: U-G3DB-002, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md, oracle_id: U-G3DB-003, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md, oracle_id: U-G3DB-004, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md, oracle_id: U-G3DB-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md, oracle_id: U-G3DB-006, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md, oracle_id: U-G3DB-007, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - role: aim
    slot_label: "AIM — incident scopeとL3 freeze非算入境界"
  - role: se
    slot_label: "SE — bootstrap verifierとmutation oracle"
  - role: tl
    slot_label: "TL — L3 freeze非算入境界と実行証拠review"
generates:
  - { artifact_path: docs/plans/PLAN-L7-465-g3-logical-db-bootstrap-verifier.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l3-g3-logical-db-bootstrap-policy.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: src/doctor/l3-g3-logical-db-receipt.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/governance/l3-g3-logical-db-bootstrap-policy.json
  references:
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
    - src/runtime/digest.ts
  blocks: []
---

# PLAN-L7-465: G3 logical DB bootstrap verifier責務分離

## 目的

G1/G3承認packetのDB convergence主張を実行可能に検証する一時verifierを、未承認のL3 freeze PLANから分離する。
L3のstatusやdefinition frozen数を先取りせず、検証コード・test・失敗契約だけをL7 troubleshoot責務として閉じる。

## 範囲

- versioned policyを読み、tracked authorityから隔離DBを2回再構築する。
- canonical projection/checkpoint digest、schema、population、stale/orphan/findingをtyped receiptにする。
- plan/session/feedback/provider handoverに加え、runtime verification、pair-agent、loop iteration、
  model opt-inの混入、空集合による恒真、policy locator driftをmutation oracleで拒否する。
- policyが宣言するschema version、canonical JSON、table/column/row order、runtime-log除外pathと
  projection stepをrepository-owned verifierの実装定数とexact比較し、未実装の宣言変更をfail-closeする。
- provider handoverはDB再構築結果ではなくruntime受け渡し状態なので、projection入力から明示除外する。

## 非対象

- POによるG1/G3承認。
- L6 canonical product implementationおよび1,246件の実行分母。
- 新しいCI job、dependency、永続runtime serviceの追加。

## 完了条件

- PLAN-L3-20が実行成果物を所有せず、policyとpacketだけを所有する。
- U-G3DB-007がpolicyの正規化・sort・除外path・非実行projection step宣言を実装とexactに束縛し、
  各fieldのmutationを拒否する。
- receiptが実際に適用したcanonicalization contract、sort規則、normalization marker、observation列のexact setを
  出力し、再現値の意味を自己記述する。
- source/testは本PLANの単一責務へ帰属し、targeted test、typecheck、Biome、doctorがgreenになる。
- Claude AI-Bの最新HEAD reviewとfull CI receiptをPR #124へ外部束縛する。
