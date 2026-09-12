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
pair_artifact: docs/design/helix/L5-detail/resident-lane-assignment-contract.md
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

`tests/resident-lane-assignment.test.ts`を正本oracleとする。event/restart/#1256接続はL9後続oracleであり、
pure testの成功から結合完了を推論しない。
