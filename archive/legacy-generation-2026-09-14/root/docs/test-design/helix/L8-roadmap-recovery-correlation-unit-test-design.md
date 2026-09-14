---
layer: L8
artifact_type: test_design
status: confirmed
pair_artifact: docs/design/helix/L6-function-design/roadmap-recovery-correlation.md
created: 2026-09-02
plan: docs/plans/PLAN-RECOVERY-91-roadmap-recovery-correlation.md
---

# Roadmap Recovery相関 L8テスト設計

| Oracle | 入力 | 期待 |
| --- | --- | --- |
| U-VMFIT-ROADREC-001 | current-location pass＋roadmap blocker | `independent`、`needs_fit`、`roadmap_current` blockerあり |
| U-VMFIT-ROADREC-002 | needs_recovery＋同一PLAN | `current_location_recovery`、roadmap blocker免除、件数をreasonへ保持 |
| U-VMFIT-ROADREC-003 | needs_recovery＋別PLAN | `independent`、roadmap blockerあり |

相関条件を`status === contradicted && aligned`へ戻すmutationで001または003がredになることを要求する。
