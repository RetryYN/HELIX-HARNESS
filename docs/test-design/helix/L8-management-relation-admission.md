---
title: "Management Relation Admission単体テスト設計"
layer: L8
artifact_type: test-design
status: draft
created: 2026-09-13
updated: 2026-09-13
owner: QA
parent_design: docs/design/helix/L6-function-design/management-relation-admission.md
plan: docs/plans/PLAN-L7-730-management-relation-admission.md
---

# Management Relation Admission単体テスト設計

## oracle

| ID | 検証 |
|---|---|
| U-MREL-001 | owned fieldのexactly-one ownerとinventory digest |
| U-MREL-002 | unknown fieldのfail-close |
| U-MREL-003 | multi-ownerを`split_required`へ分離 |
| U-MREL-004 | `agent_slots`とassignment relationの一致 |
| U-MREL-005 | 不正role／assignment relationの拒否 |
| U-MREL-006 | 着手依存とparent/reference traceの非混同 |
| U-MREL-007 | 失効証拠の拒否と有効な旧ContractRevisionの受理 |
| U-MREL-008 | transition順序、ID conflict、冪等再配信、二重遷移 |
| U-MREL-009 | HEAD／contract／policy／approval kind／issuer trustのexact照合 |
| U-MREL-010 | canonical欠落をlegacy greenで相殺しない |
| U-MREL-011 | migration phase外の`legacy_only`拒否 |
| U-MREL-012 | same-operation dual-write拒否 |
| U-MREL-013 | product contract semantic digestとinventory digestを固定し、management relation差分だけadmission digestへ追従 |
| U-MREL-014 | consumer-zero前のretirement拒否 |

全oracleはnetwork、DB、clockに依存しないpure fixtureで実行する。schema緩和、比較削除、phase条件反転、
dual-write許容、失効無視、trace混同のmutationを少なくとも各対応fixtureが拒否する。
