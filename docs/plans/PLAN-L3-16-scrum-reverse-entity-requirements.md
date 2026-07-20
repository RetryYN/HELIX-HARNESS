---
plan_id: PLAN-L3-16-scrum-reverse-entity-requirements
title: "PLAN-L3-16 (add-design): Scrum差分→V逆流の DB entity / state machine 要件化 (FeatureSlice 系)"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-20 Scrum差分をVへ戻すDBモデル (FeatureSlice/ReverseDerivation/ProvisionalVProjection/CanonicalVPublication) を要件化する"
created: 2026-07-20
updated: 2026-07-20
owner: Claude / TL
parent_design: docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — SR0〜SR4 receipt から entity/state machine への写像設計レビュー"
  - role: qa
    slot_label: "QA — entity 遷移の acceptance oracle / 逆引き trace 検証観点の設計"
generates:
  - artifact_path: docs/plans/PLAN-L3-16-scrum-reverse-entity-requirements.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/scrum-reverse-entity-model.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/scrum-reverse-entity-model-acceptance.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
  requires:
    - docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md
  references:
    - docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
  blocks: []
review_evidence: []
---

# PLAN-L3-16: Scrum差分→V逆流の DB entity / state machine 要件化

## §0 位置づけ

requirements v1.3 §SCRUM_REVERSE は SR0〜SR4 の工程要件と receipt を定義するが、それを担う harness.db 側の
entity と state machine が未定義である (2026-07-20 監査)。本 PLAN は Production Scrum の slice delta を
V モデル資産へ引き戻す経路を、進捗値ではなく **別 entity・別 state machine** として L3 要件化する。

対象 entity (概念名。最終名称は本 PLAN の design doc で確定し、glossary へ登録する):

| 概念 | 役割 | 対応工程 |
| --- | --- | --- |
| `FeatureSlice` | Production Scrum の価値 slice 単位。slice delta と release-ready 判定を保持 | S1〜S4 / release 合流 |
| `ReverseDerivation` | 実装・実測・運用事実からの逆生成 (evidence→contract→mapping→proposal) | SR0〜SR3 |
| `ProvisionalVProjection` | pair-freeze 前の暫定 V 資産投影。canonical と混在させない | SR3〜SR4 前 |
| `CanonicalVPublication` | SR4 pair-freeze 済みの正本公開状態。Forward 再合流の入口 | SR4 以降 |

inventory-first: 旧試行 `archive/obsolete-requirements-authority-pre153` (worker evaluation contracts 系
29 commit) と `infinity-loop-platform-basic-design.md` の table 群 (`agent_contract_versions` 等の様式) を
behavior atom として採取し、bulk import せず粒度 L3=FR で取捨選択する。

## §工程表

### Step 1: 既存資産棚卸し [直列]
- 直列理由 = **downstream_dependency** (Step 2 の entity 設計は棚卸し結果に依存)。
- scrum-reverse-verification-engine / ai-vision-design-harness-engine / universal-workflow-ai-judgment-engine の
  SR 要件と、`archive/obsolete-requirements-authority-pre153` の salvage 判定を行い採否表を作る。

### Step 2: entity / state machine 要件設計 [直列]
- 直列理由 = **downstream_dependency** (Step 1 の採否表が前提)。
- `scrum-reverse-entity-model.md` に 4 entity の state machine (状態・遷移・遷移条件 receipt・禁止遷移) と
  FR/AC を定義し、`scrum_slice_ready` 式へ接続する。

### Step 3: acceptance test design [並列]
- `scrum-reverse-entity-model-acceptance.md` に遷移 oracle (SR4 receipt なし release-ready 拒否、provisional と
  canonical の混在 0 件、slice からの L1〜L12 逆引き) を設計する。

### Step 4: v1.3 への要件昇格 [直列]
- 直列理由 = **file_conflict** (PLAN-L3-15 / L3-17 / L3-18 と同一ファイル `helix-harness-requirements_v1.3.md` を編集)。
- design doc で確定した FR/AC を v1.3 の SCRUM_REVERSE 節へ追記する。

### Step 5: 機械検証 + review [直列]
- 直列理由 = **downstream_dependency** (Step 2-4 green が前提)。
- `helix plan lint` / `helix doctor` green の後、別 runtime または `intra_runtime_subagent` review を記録する。

## §受入条件 (falsifiable AC)

- AC-1: `scrum-reverse-entity-model.md` に 4 entity の state machine 定義 (状態一覧・遷移表・禁止遷移) が存在する。
- AC-2: v1.3 に「SR4 receipt を持たない slice は `CanonicalVPublication` へ遷移できない」旨の falsifiable AC が
  存在し、prose claim ではなく test design (`scrum-reverse-entity-model-acceptance.md`) を cite する。
- AC-3: provisional / canonical 分離 (`ProvisionalVProjection` を canonical trace の根拠にしない) が AC 化される。
- AC-4: `helix plan lint` exit 0、`helix doctor` exit 0。

## §6 用語更新 (§G.9)

- 新規語: `FeatureSlice` / `ReverseDerivation` / `ProvisionalVProjection` / `CanonicalVPublication` (仮称)。
  design doc 確定時に L0 glossary (`glossary-ssot.md`) へ登録する。
