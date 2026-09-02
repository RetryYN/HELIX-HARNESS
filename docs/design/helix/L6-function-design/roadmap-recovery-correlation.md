---
layer: L6
artifact_type: design_doc
status: confirmed
pair_artifact: docs/test-design/helix/L8-roadmap-recovery-correlation-unit-test-design.md
created: 2026-09-02
plan: docs/plans/PLAN-RECOVERY-91-roadmap-recovery-correlation.md
---

# Roadmap Recovery相関 L6設計

`roadmapCurrentGate(report, currentGate)`はroadmap contradictionとcurrent-location Recoveryを別々に評価する。

- roadmap側対象PLANはcurrent gateの`planId`から得る。
- Recovery側対象PLANはrunway phaseの`sample_plan_ids`から得る。
- `currentGate.status === needs_recovery`かつ両集合が交差した場合だけ`current_location_recovery`とする。
- 集合が空、別PLAN、またはcurrent-locationがpassなら`independent`として`roadmap_current` blockerを残す。
- blocker件数と相関根拠は常にreasonsへ投影する。
