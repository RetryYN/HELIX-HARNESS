---
plan_id: PLAN-REVERSE-494-nfr-typed-registry-backfill
title: "PLAN-REVERSE-494: NFR typed registryの設計backfill"
kind: reverse
layer: cross
workflow_phase: R0
confirmed_reverse_type: design
route_mode: reverse
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 219
behavior_contract_id: NFR-TYPED-REGISTRY-001
responsibility_owner: nfr-registry
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md
entry_signals:
  - "po_directive:2026-08-14 PR #621でmergeしたNFR typed registryをReverse R0から上位設計へ照合する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "HR-NFR-REG-001..003のtyped registry要求を実装したsliceであり、要求の意味は変更しない。"
  - layer: L4-basic-design
    decision: inspect
    evidence_path: docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md
    reason: "registry、measurement、probeの責務境界とL9 oracleがmerged implementationへ一致するかR2で照合する。"
  - layer: L5-detailed-design
    decision: inspect
    evidence_path: docs/design/helix/L5-detail/nfr-typed-registry-quality-taxonomy.md
    reason: "exact schema、authority、stable-ID migration契約をR2で実装へ照合する。"
  - layer: L6-function-design
    decision: inspect
    evidence_path: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md
    reason: "pure validator、migration admission、read-only doctor adapterをR2で実装exportへ照合する。"
  - layer: verification-design
    decision: inspect
    evidence_path: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md
    reason: "U-NFRREG-001..017とIT-NFRREG-001..003の正負oracleをR1で実測する。"
agent_slots:
  - { role: se, slot_label: "SE — R0 implementation／trace採取" }
  - { role: qa, slot_label: "QA — R1 schema／migration／doctor反証" }
  - { role: tl, slot_label: "TL — R2設計照合、R3意図照合、R4再入判定" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-494-nfr-typed-registry-backfill.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md
  requires:
    - docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md
  references:
    - docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md
    - docs/design/helix/L5-detail/nfr-typed-registry-quality-taxonomy.md
    - docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md
    - docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md
    - docs/test-design/helix/L9-nfr-typed-registry-quality-taxonomy-system-test-design.md
    - config/nfr-registry.json
    - src/requirements/nfr-registry.ts
    - src/doctor/nfr-registry-check.ts
    - tests/nfr-registry.test.ts
    - tests/nfr-registry-doctor.test.ts
review_evidence: []
---

# PLAN-REVERSE-494: NFR typed registryの設計backfill

## R0 現状採取

PR #621のmerge commit `ba88d9df282e12fe77decf5fcf2b190a32e6c53d`を基準に、
`config/nfr-registry.json`、`analyzeNfrRegistry`、`parseNfrRegistry`、
`admitNfrRegistryMigration`、`checkNfrRegistry`、U-NFRREG-001..017、
IT-NFRREG-001..003を採取する。PR #621 final HEAD `728f6b4f47f90bf1495c5e82402abe25601b4c0f`は
current-head独立reviewとharness-check successを持つ。

観測した実装責務は、typed declarationのstrict構造検査、source digest／repository realpath境界、
stable-ID revision migration admission、read-only doctor reportingである。network、command execution、
DB mutation、threshold評価、probe実行、履歴保存は含まれない。

## R0 境界

- #219／HR-NFR-REG-001..003だけを対象にする。
- #220のmeasurement evaluation／threshold verdictを対象外とする。
- #221のprobe execution／history／DB保存を対象外とする。
- #223のfinding disposition／GitHub mutationを対象外とする。
- R0では設計をconfirmedへ昇格させず、R1の反証、R2のAs-Is設計、R3のIssue意図、R4のForward再入を未成立として維持する。

## R1以降

R1はschema、authority、digest、migration、doctor fail-close oracleを実測する。R2はL4〜L6設計と実装を
照合し、R3はIssue #219の意図と#220／#221／#223境界を再確認する。R4でgap-only Forward再入と
PLAN-L7-550の`backfill_state`を判定する。
