---
canonical_vmodel: L1-L12
candidate_layer: L1
canonical_pair: L12
title: "三社固定レーン・Cursor Cloud資源分散・GitHub監査要求"
layer: L1
kind: redesign
status: approved_pending_canonical_promotion
created: 2026-09-02
updated: 2026-09-02
owner: PO / Codex TL
plan: PLAN-L3-78-three-lane-cloud-governance-authority
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/governance/candidates/three-lane-cloud-governance-recognition.md
next_pair_freeze: L12
---

# 三社固定レーン・Cursor Cloud資源分散・GitHub監査要求

- 文書ID: `HELIX-3LANE-BRQ-001`
- バージョン: `0.4.0-candidate`
- 状態: `requirement-reentry-approved / canonical promotion待ち`
- 置換候補: `HELIX-RLO-BRQ-001 v0.3.0`
- Behavior Contract: `THREE-LANE-CLOUD-CAPACITY-ORCHESTRATION-001`

## 要求

### 3L-BR-001 第一級レーンをexact 3件へ固定する

第一級レーンはCodex Control／Integration、Cursor Cloud Execution、Claude Independent Reviewの3件だけとする。Grok、Kimi、ComposerはCursor内部またはbounded workerのmodel候補であり、resident lane identityにしない。

### 3L-BR-002 Codexの管制余力を保護する

Codexはfrontier、要求・設計、Issue／PLAN、branch、assignment、資源配分、統合、Recovery、merge admissionを所有し、量産実装によってcontrol reserveを枯らさない。

### 3L-BR-003 Cursorを第一級cloud実装capacityとして常用する

CursorはHELIX発行のscope正本、専用branch、budget、TTL、policy bundleの範囲で実装、test、commit、draft PR、同branch差戻し対応を行う。ローカル長時間worker負荷をCursor Cloudへ移す。

### 3L-BR-004 Claudeの独立検収を維持する

Claudeはworker会話を受け取らず、Issue／PLAN、PR、exact HEAD、diff、AC、CI receiptだけでblind reviewする。HEAD更新後は旧receiptを失効させる。

### 3L-BR-005 異なる資源を別軸で管理する

Codex pressure、Cursor monthly cloud spend、Claude review quota／inventoryを偽の単一scoreへ畳み込まず、accepted throughput、quality、cycle survival、review backpressureを同時に最適化する。

### 3L-BR-006 HELIX規則を三層で強制する

dispatch前policy bundle、Cursor cloud hook／environment、run後GitHub admissionの三層でscope、branch、secret、language、test、costを強制し、prompt遵守だけを合格証拠にしない。

### 3L-BR-007 GitHub監査をHELIX capabilityとして所有する

決定的規則はNode gateが強制し、semantic findingだけを評価済みモデルへ委譲する。GitHub監査を第四provider laneや別Control Planeにしない。

### 3L-BR-008 モデル能力をrevision単位で段階認定する

HELIX-BenchはGitHub監査task classごとにmodel revisionを評価し、称号、資格、権限、assignment roleを分離する。重大missやmodel更新で資格を失効させる。

### 3L-BR-009 実運用で資源分散を証明する

Cursor WIP=2の7日canaryとbilling-cycle read-afterにより、accepted merge量、費用、Codex relief、Claude差戻し、escaped defect、ローカル資源削減を測定する。Cursorを使わず残高だけを守る運用を成功扱いしない。

## L12認識条件

- 第一級レーンexact setが3件である。
- Cursor予算枯渇と過少利用の双方が検出される。
- Codex control reserveとClaude review inventoryがboundedである。
- deterministic監査をモデルPASSで相殺できない。
- model revision変更時に旧資格・称号・権限を継承しない。
- Cursor停止時に明示DEGRADEDでCodex＋Claudeへ縮退する。

本candidateはplan固有のPO L3承認済みである。独立review、CI、DB convergenceと別のcanonical promotionが成立するまで、v0.3 current authorityを置換しない。
