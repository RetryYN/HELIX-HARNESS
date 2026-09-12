---
title: "Resident Lane Assignment契約 単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: QA / Codex TL
authority: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md
plan: docs/plans/PLAN-L7-860-resident-lane-assignment-kernel.md
pair_group:
  schema_version: helix-pair-group.v1
  group_id: helix-resident-lane-assignment-unit
  authority: docs/design/helix/
  members:
    - docs/design/helix/L5-detail/resident-lane-assignment-contract.md
    - docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md
---

# Resident Lane Assignment契約 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RLA-001 | schema/projection | exactly-one scope packetを受理する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-002 | strict input | scope欠落、Issue/PLAN併記、unknown provider fieldを拒否する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-003 | expiry | capture時刻を超えたleaseを専用codeで拒否する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-004 | branch ownership | 同一branchの異なるwriterを拒否する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-005 | scope ownership | 同一scopeの二active branchを拒否する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-006 | review binding | foreign branch、wrong HEAD、stale fenceを別codeで拒否する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-007 | review return | 元worker・同branchだけへ戻しforeign workerを拒否する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-008 | takeover | 旧lease終端、handover、新fenceのいずれか欠落を拒否する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-009 | idempotency | 同一packet再配信を同一projectionへ収束させる | `tests/resident-lane-assignment.test.ts` |
| U-RLA-010 | identity conflict | 同一assignment ID・異内容の再配信を拒否する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-011 | repository namespace | 別repositoryの同名branch／Issue scopeを競合させない | `tests/resident-lane-assignment.test.ts` |
| U-RLA-012 | repository identity | repositoryの大小文字差でbranch writer競合を回避させない | `tests/resident-lane-assignment.test.ts` |
| U-RLA-013 | tuple identity | delimiterを含むwriter tupleを曖昧な連結keyへ畳み込まない | `tests/resident-lane-assignment.test.ts` |
| U-RLA-014 | Issue identity | Issue repositoryの大小文字差を同一GitHub identityとして受理する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-015 | deterministic projection | 同一IDの競合recordも入力順に依存せず投影する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-016 | future lease | 観測時刻より未来開始のleaseをactiveへ昇格させない | `tests/resident-lane-assignment.test.ts` |
| U-RLA-017 | active filtering | 非有効leaseをactive競合判定から除外する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-018 | historical identity | 非active recordでもassignment ID改変を検出する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-019 | takeover replay | takeoverの単調revision列を最新assignmentへ再投影する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-020 | safe fence | safe integerを超えるlease fenceを拒否する | `tests/resident-lane-assignment.test.ts` |
| U-RLA-021 | PLAN namespace | repository非包含の同一PLAN scopeを別repository間で競合させない | `tests/resident-lane-assignment.test.ts` |

`tests/resident-lane-assignment.test.ts`を正本oracleとする。event/restart/#1256接続はL9後続oracleであり、
pure testの成功から結合完了を推論しない。
