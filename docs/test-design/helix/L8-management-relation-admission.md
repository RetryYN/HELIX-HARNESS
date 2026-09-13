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

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-MREL-001 | owner inventory | owned fieldのexactly-one ownerまたはinventory digestが崩れたらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-002 | owner inventory | unknown fieldを受理したらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-003 | owner inventory | multi-ownerを`split_required`へ分離しなければRED | `tests/management-relation-admission.test.ts` |
| U-MREL-004 | Assignment relation | `agent_slots`とassignment relationが不一致なのに通したらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-005 | Assignment relation | 不正role／assignment relationを受理したらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-006 | dependency relation | 着手依存とparent/reference traceを混同したらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-007 | Assignment evidence | 失効証拠を受理する、または有効な旧ContractRevisionを拒否したらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-008 | transition event | transition順序、ID conflict、冪等再配信、二重遷移を誤判定したらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-009 | evidence subject | HEAD／contract／policy／approval kind／issuer trustのいずれかをexact照合しなければRED | `tests/management-relation-admission.test.ts` |
| U-MREL-010 | dual-read | canonical欠落をlegacy greenで相殺したらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-011 | migration phase | migration phase外の`legacy_only`を受理したらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-012 | writer boundary | same-operation dual-writeを受理したらRED | `tests/management-relation-admission.test.ts` |
| U-MREL-013 | digest boundary | management relation差分でproduct contract semantic digestが変わらない、かつadmission digestだけが追従しなければRED | `tests/management-relation-admission.test.ts` |
| U-MREL-014 | retirement | consumer-zero前のretirementを受理したらRED | `tests/management-relation-admission.test.ts` |

全oracleはnetwork、DB、clockに依存しないpure fixtureで実行する。schema緩和、比較削除、phase条件反転、
dual-write許容、失効無視、trace混同のmutationを少なくとも各対応fixtureが拒否する。
