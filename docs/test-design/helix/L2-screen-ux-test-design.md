---
title: "HELIX L2 Visual Intent ↔ L11 Human Visual Acceptance テスト設計"
authority_mode: pending_target_authoring
authority_model: HELIX-L12-V-TARGET-v1
authority_receipt: VMAUTH-2026-07-16-01
layer: L11
kind: test_design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/design/helix/L2-screen/screen-mock-boundary.md
---

# HELIX L2 Visual Intent ↔ L11 Human Visual Acceptance テスト設計

> L1–L12 target authoring candidate専用であり、receipt activation前は現行L2↔L10 runtime gateのPASS証拠へ使わない。
> active compatibility boundaryは`docs/design/helix/L10-ux/ux-evidence-boundary.md`が保持する。

本書はcanonical `L2↔L11`の片肺を防ぐためのhuman visual acceptance boundaryである。L2 prototype/agreementは、
L8 atomic visual contract、L9 cross-screen continuity、L10 browser/data visual systemの機械証拠がcurrentで、L11において
同一revisionのvisual intent・体験・preferenceを人間が判定するまで、visual acceptanceや運用完了の根拠にしない。

## テスト観点

| ID | 対応 | 検証観点 | 合格条件 |
|---|---|---|---|
| HUX-L2-01 | L2-AC-01 | visualization の node / edge / blocker が DB/docs 由来で再現できる | LLM 生成図を正本にせず deterministic read model から再生成できる |
| HUX-L2-02 | L2-AC-02 | component-derived UI slice、L10 machine evidence、L11 human acceptanceを区別する | L10 greenだけをvisual acceptance扱いせず、current L2 agreementへbindしたL11 human receiptを要求する |
| HUX-L2-03 | L2-AC-03 | S4 未了の visualization を confirmed UI scope にしない | `PLAN-DISCOVERY-10` が S4 decision なしなら frontier として残す |

## 完了境界

L10は実browser・representative product-data・responsive/motion/visual-a11y/semantic continuityの機械検証である。
L11完了には同一revision evidence packet、criteria別human verdict、preference/dissent、reject時Redesign routeが必要である。
現時点では双方frontierとして扱う。
