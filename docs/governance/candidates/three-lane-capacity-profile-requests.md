---
title: "三社レーン動的capacity profile要求"
status: draft_candidate
authority_status: pending_canonical_promotion
version: "0.5.0-candidate"
candidate_layer: L1
owner_issue: 1358
plan_id: PLAN-L3-1358-three-lane-capacity-profile-v05
parent_authority: docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md
pair_artifact: docs/governance/candidates/three-lane-capacity-profile-recognition.md
---

# 三社レーン動的capacity profile要求

## 3L-BR-010 作成・検収・統合能力を別々に拡張する

Codex worker、Cursor worker、Claude reviewer、CI、Merge Trainを別々のcapacityとして管理し、下流の実処理能力に応じて安全に並列度を拡張する。登録可能なpool上限を常時active WIPと解釈せず、速さを未検収PR数ではなくaccepted throughputとtime-to-acceptedで評価する。

初期運用ではCursorを1件から開始して2件、3件へ段階拡張する。成立後の定常目標はCodex worker 3件、Cursor worker 3件、Claude reviewer 2件とする。Codex／Cursorは実測capacity admission成立時だけ最大5件までburstでき、Claude reviewerの追加burstは独立review待ちが実ボトルネックである場合だけ認める。

詳細要件と受入条件は同一candidate familyへ束縛する。本候補単独で現行WIP、8-slot能力上限、provider課金、runtime dispatch権限を変更しない。
