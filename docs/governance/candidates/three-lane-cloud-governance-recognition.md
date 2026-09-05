---
canonical_vmodel: L1-L12
candidate_layer: L12
canonical_pair: L1
title: "三社固定レーン・Cursor Cloud資源分散・GitHub監査認識設計"
layer: L12
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-05
owner: PO / QA
plan: PLAN-L3-78-three-lane-cloud-governance-authority
parent_design: docs/governance/candidates/three-lane-cloud-governance-requests.md
pair_artifact: docs/governance/candidates/three-lane-cloud-governance-requests.md
---

# 三社固定レーン・Cursor Cloud資源分散・GitHub監査認識設計

L1の9要求を、実PR throughput、Cursor billing-cycle、Codex control reserve、Claude review inventory、GitHub Auditor finding、HELIX-Bench qualification receiptから認識する。

## 認識条件

- 3L-BR-001: `codex_control/cursor_cloud_execution/claude_independent_review`のexact set。Cursor停止時は明示DEGRADEDで既存Codex＋Claude経路へ縮退し、別provider laneを暗黙追加しない。
- 3L-BR-002: Codex pressure上昇時もcontrol／Recovery／merge余力を保持する。
- 3L-BR-003: HELIX事前発行branchで限定実taskを回収でき、二重writerを拒否し、起動前後のowner／HEAD証拠を追跡できる。Phase A/Bの移行時も排他が途切れない。
- 3L-BR-004: Claudeのblind exact-HEAD review在庫がboundedであり、HEAD更新後の旧receiptを受理しない。
- 3L-BR-005: pool別cost、forecast、runway、accepted merge当たり費用をread-afterできる。Codex pressure、Cursor費用、Claude在庫を別軸表示し、単一scoreへの畳み込みを拒否する。
- 3L-BR-006: dispatch前policy、cloud hook／environment、run後admissionの三層を個別に検証し、いずれかを欠く実行を拒否する。prompt遵守や他層の成功で相殺しない。
- 3L-BR-007: deterministic P0/P1 gateをsemantic modelのPASSで相殺できず、P2だけで無関係scopeを停止しない。
- 3L-BR-008: model revisionごとの資格・称号・権限を追跡し、更新時に失効する。
- 3L-BR-009: Cursor WIP=2で実task 5件以上を7日canaryし、違反0件。billing-cycle末まで枯渇と過少利用、費用、Codex relief、差戻し、escaped defect、ローカル資源削減を実測し、未使用を成功としない。

本書はplan固有の人間承認済みcandidate recognitionであり、canonical promotionが成立するまで
current completionへ加算しない。
