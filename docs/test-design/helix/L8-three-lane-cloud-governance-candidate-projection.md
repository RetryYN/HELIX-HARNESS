---
canonical_vmodel: L1-L12
canonical_layer: L8
canonical_pair: L5
title: "三社固定レーンauthority candidate projectionテスト設計"
status: draft
plan: PLAN-L3-78-three-lane-cloud-governance-authority
parent_design: docs/design/helix/L6-function-design/three-lane-cloud-governance-candidate-projection.md
---

# 三社固定レーンauthority candidate projectionテスト設計

## Oracle

- `U-3LANE-004`: PLAN-L3-78がdraftかつL3承認recordなしであることを固定する。
- `U-3LANE-005`: 投入原稿がrepository authorityとして残らないことを固定する。
- `U-DESIGNCOV-013`: L1／L3／L6候補をcatalogへ登録し、物理未登録を拒否する。
- `U-DESLANG-004`: 新しい人間向け説明が日本語正本であることを固定する。

## Mutation

旧PLANのapproval流用、candidateのconfirmed化、raw directive再配置、catalog entry欠落を個別にred化する。
