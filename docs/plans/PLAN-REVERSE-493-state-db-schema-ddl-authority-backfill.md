---
plan_id: PLAN-REVERSE-493-state-db-schema-ddl-authority-backfill
title: "PLAN-REVERSE-493: state DB schema DDL authorityの設計backfill"
kind: reverse
layer: cross
workflow_phase: R0
confirmed_reverse_type: design
route_mode: reverse
promotion_strategy: reuse-as-is
drive: agent
status: draft
created: 2026-08-13
updated: 2026-08-13
owner: Codex / TL
github_issue_id: 644
behavior_contract_id: STATE-DB-SCHEMA-DDL-AUTHORITY-001
responsibility_owner: state-db-schema-authority
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
entry_signals:
  - "po_directive:2026-08-13 PR #645でmergeしたschema DDL authorityをReverse R0から上位設計へ照合する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "schema DDLのdeterminismとmigration後schema照合は既存state DB責務の検証強化であり、新しいproduct requirementを追加しない。"
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md
    reason: "state DB component境界、transaction owner、migration責務を変更せず、read-only authority比較だけを追加した。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/state-db-schema-ddl-authority.md
    reason: "pinned digest、sqlite_schema exact set、missing／extra／changed分類がmerged implementationと一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md
    reason: "schemaDdlDigest、readSqliteSchemaObjects、compareSchemaAuthorityのread-only契約が実装exportと一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
    reason: "U-SDDA-001..005がgolden digestとSQLite object driftの正負oracleを実テストへ束縛する。"
agent_slots:
  - { role: se, slot_label: "SE — R0/R2 implementation／design trace採取" }
  - { role: qa, slot_label: "QA — R1 mutation oracleとmigration round-trip反証" }
  - { role: tl, slot_label: "TL — R3意図照合とR4 Forward再入判定" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-493-state-db-schema-ddl-authority-backfill.md, artifact_type: markdown_doc }
dependencies:
  parent: null
  requires: []
  references:
    - docs/design/helix/L5-detail/state-db-schema-ddl-authority.md
    - docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md
    - docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
    - src/state-db/schema-authority.ts
    - tests/state-db-schema-authority.test.ts
---

# PLAN-REVERSE-493: state DB schema DDL authorityの設計backfill

## R0 現状採取

PR #645のmerge commit `d2dd5d53f67a90a3c6b8657328240b45e9ddbce9`を基準に、
`schemaDdlDigest`、`readSqliteSchemaObjects`、`compareSchemaAuthority`、pinned digest、
fresh migration後の`sqlite_schema`照合、U-SDDA-001..005を採取する。
schema migration追加、DB write path変更、PLAN-L7-448 #6 parser／#19 fixture lifecycleは観測範囲へ含めない。

## R1 観測テスト設計

- canonical DDL bytesはrepository-owned pinned digestと一致する。
- fresh migration後のtable／index／trigger exact setは同じauthorityへ収束する。
- missing／extra／changed objectは個別の反例としてfail-closeする。
- schema／migration機能、transaction boundary、DB write ownerは変更されていない。

## R2 As-Is設計

実装は既存state DB schemaの意味を変えず、自己比較oracleを独立authorityへ置換している。
新しいmigration、table、index、trigger、永続化ownerを追加していないため、L3／L4の再設計ではなく
既存L5／L6設計を`reuse-as-is`で照合する。

## R3 意図照合

Issue #644の意図はDDL driftの独立検出であり、schema自体の機能追加ではない。
mutation killとcurrent-head CIが成立しても、parser #6とfixture lifecycle #19の完了は主張しない。

## R4 Forward再入

R0では`PLAN-L7-551`をfrontmatter上のReverse targetへまだ昇格させない。
R1〜R3の反証と意図照合を終えたR4でのみ、`forward_routing: gap-only`、双方向link、独立reviewを揃える。
