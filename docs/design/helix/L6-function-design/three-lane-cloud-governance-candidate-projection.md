---
canonical_vmodel: L1-L12
canonical_layer: L6
canonical_pair: L7
title: "三社固定レーンauthority candidate projection設計"
status: draft
plan: PLAN-L3-78-three-lane-cloud-governance-authority
parent_design: docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md
pair_artifact: docs/test-design/helix/L8-three-lane-cloud-governance-candidate-projection.md
---

# 三社固定レーンauthority candidate projection設計

## 責務

design catalogはdraft候補の物理所在だけを登録する。候補の`status: draft`、PLANのL3承認不在、`completion_claim_allowed: false`を維持し、runtime、DB current output、generated guidanceへcurrent authorityとして投影しない。

catalog digest更新は候補文書の存在検査に限定する。PLAN-L3-75の承認、review evidence、current registry versionをPLAN-L3-78へ継承しない。

## 失敗境界

- candidateをcurrent authorityとして出力した場合はfail-closeする。
- PLAN固有のL3承認なしで`confirmed`へ進めない。
- catalog未登録、digest未追従、L1／L3／L10／L12 pair欠落を拒否する。
