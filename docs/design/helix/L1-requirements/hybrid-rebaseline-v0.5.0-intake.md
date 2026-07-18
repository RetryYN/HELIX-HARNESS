---
title: "HELIX L1要求 — REBASELINE v0.5.0追突"
layer: L1
kind: add-design
status: draft
created: 2026-07-18
updated: 2026-07-18
owner: PO / TL
related_l3: docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md
---

# HELIX L1要求 — REBASELINE v0.5.0追突

| ID | business requirement | 失敗時 |
|---|---|---|
| HBR-V050-01 | v0.5.0の追加・変更要求を全件確認し、現行HELIXへ損失なく追突する | 未分類deltaを残したまま要件完了にしない |
| HBR-V050-02 | v0.5.0をL1–L12＋Production Scrum正本へ従属させる | 旧L0–L14又はroute欠落による上書きを拒否 |
| HBR-V050-03 | Python/Nodeの権威はcurrent accepted ADRへ一意に解決する | package内decisionだけによるauthority反転を拒否 |
| HBR-V050-04 | source integrityと意味整合を別gateで検証する | checksum PASSで内容矛盾を相殺しない |
| HBR-V050-05 | capsule、sandbox、trace、freshness強化を既存gateへ接続する | prompt-only fallbackとunverified full-ref claimを拒否 |

本格systemは完全L1–L12 V、適格な段階release／小規模systemはProduction Scrum＋縮約V、
非production実験はDiscovery/PoC、曖昧・複合・hard triggerは完全Vへfail-closeする。
