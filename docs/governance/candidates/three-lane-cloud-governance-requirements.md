---
canonical_vmodel: L1-L12
candidate_layer: L3
canonical_pair: L10
title: "三社固定レーン・Cursor Cloud資源分散・GitHub監査要件"
layer: L3
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-05
owner: PO / Codex TL
plan: PLAN-L3-78-three-lane-cloud-governance-authority
parent_design: docs/governance/candidates/three-lane-cloud-governance-requests.md
pair_artifact: docs/governance/candidates/three-lane-cloud-governance-acceptance.md
next_pair_freeze: L10_during_canonical_promotion
---

# 三社固定レーン・Cursor Cloud資源分散・GitHub監査要件

- 文書ID: `HELIX-3LANE-REQ-001`
- バージョン: `0.4.0-candidate`
- 状態: `requirements-reentry-approved / canonical promotion待ち`
- 置換候補: resident lane authority v0.3
- 主Issue: `#1358`

## 0. Authority境界

本要件はprovider-neutral assignment／lease／event／receipt schemaを維持しつつ、currentのN-provider resident meshを初期実行authorityから外す。provider追加はversion-upで行い、model名、provider session、通知本文、料金推測を正本にしない。

## 1. Feature契約

### 3L-FR-001 正規lane identity

- `3L-R-01 Lane Exact Set`: current第一級laneを`codex_control`、`cursor_cloud_execution`、`claude_independent_review`のexact 3件へ固定する。
- `3L-R-02 Model/Lane Separation`: Grok、Kimi、Composerをrequested／effective model候補として保持し、lane identityへ昇格しない。
- `3L-R-03 Availability`: lane identityとruntime availabilityを分離し、Cursor停止を明示DEGRADEDとして扱う。

### 3L-FR-002 Assignment・authority・review loop

- `3L-R-04 Control Authority`: Codexだけがscope、branch、assignment、budget、統合、merge admissionを発行する。
- `3L-R-05 Cursor Worker Boundary`: CursorはIssueまたはPLANの択一、専用branch、allowed path、budget、TTL内だけを書き、main／別branch／HELIX DBへ書かない。
- `3L-R-06 Independent Review`: Claudeはblind exact-HEAD reviewを行い、changes requestedはscope／設計変更を除き元Cursor assignment・同branchへ返す。

### 3L-FR-003 資源予算とrunway

- `3L-R-07 ResourceBudgetSnapshot`: Cursor ModelsとOther Modelsのpool、billing cycle、consumed／committed／remaining／reserve、on-demand cap、3日／7日burn、forecast、runway、evidence digestを保持する。
- `3L-R-08 Unknown and Reserve`: usage不明を0円／無制限へ推測せず新規dispatchを拒否する。reserveはversioned policyで保持する。
- `3L-R-09 Separate Pressure Axes`: Codexを`NORMAL/ELEVATED/HIGH/CRITICAL`、Cursorを`GREEN/AMBER/ORANGE/RED/UNKNOWN`、Claudeをreview inventoryとして別軸管理する。

### 3L-FR-004 決定的な資源dispatch

- `3L-R-10 Dispatch Matrix`: Codex pressure、Cursor runway、Claude inventory、task riskからWIPとdispatch可否を決定的に導出する。
- `3L-R-11 Bounded WIP`: Cursor WIP=2を初期値とし、7日実測、GREEN、review在庫0〜1、first-pass gate 70%以上でのみ3へburstする。4以上は別承認とする。

### 3L-FR-005 HELIX policyの強制

- `3L-R-12 WorkerPolicyBundle`: scope／branch／base SHA／assignment／allowed path／requirement／PLAN／test／secret／network／model pool／budget／TTL／completion schemaをdigestへ束縛する。
- `3L-R-13 Cloud Enforcement`: repository-owned environment、hook、single writer、secret最小権限、max cost、TTLをCursor実行中に強制する。
- `3L-R-14 External Read-after`: HEAD、PR、requested／effective model、usage、cost、changed path、testをGitHub／providerから外部sealし、worker自己申告を正本にしない。

### 3L-FR-006 GitHub統制監査

- `3L-R-15 Deterministic Core`: authority、dependency、branch、lease、path、secret、supply-chain、review、CI、Reverse、closure、Issue graphをNode gateで判定し、モデル結果で上書きしない。
- `3L-R-16 Semantic Advisory`: scope creep、責務混載、diff意味差、設計不一致、便乗refactor、test弱化、graph意味不備をfinding化し、worker branchを直接修正しない。
- `3L-R-17 Severity Scope`: P0はhard block、P1はaffected-scope block、P2はscheduled findingとし、P2で無関係PRを止めない。

### 3L-FR-007 HELIX-Bench資格

- `3L-R-18 Audit Task Classes`: `GH-AUTHORITY/GH-BRANCH/GH-PR-SCOPE/GH-REVIEW-CI/GH-MERGE-CLOSURE/GH-GRAPH/GH-SECURITY`を独立classにする。
- `3L-R-19 Qualification Lifecycle`: `UNBENCHMARKED→SHADOW→ADVISORY→REVERSIBLE_WRITE→BOUNDED_BLOCK→GOVERNANCE_RECEIPT`を正規遷移とし、`REVOKED`を分離する。
- `3L-R-20 Identity Separation`: 称号、task qualification、GitHub authority、assignment roleを別fieldにし、model revision変更、opaque backend、重大miss、期限切れで旧資格を継承しない。

### 3L-FR-008 運用実証

- `3L-R-21 Seven-day Canary`: WIP=2で7日間、canary専用でない実taskを最低5件処理し、cost、accepted PR、first-pass gate、rework、time-to-accepted、Codex relief、local processを測る。
- `3L-R-22 Billing-cycle Read-after`: cycle末まで予算枯渇と過少利用を監査し、accepted throughputとescaped defectを含めてpolicyを再評価する。

## 2. 禁止authority

モデルへmerge、Issue close、branch削除、ruleset、release、credential、L3承認、security例外を与えない。Cursor専用DB／queue／assignment authority、provider間direct messaging、N-provider supervisorを初期current pathへ追加しない。

## 3. 実装owner

| Slice | Owner |
|---|---|
| authority v0.4 | #1358 |
| Cursor Cloudのlane core | #1293 |
| Assignment／lease | #860 |
| capability／provenance | #861／#862 |
| monthly budget／WIP | #1359（#873／#214再利用） |
| Notification Fabric | #854 |
| GitHub Auditor | #1360（#1322再利用） |
| Bench qualification | #1361（#1295／#1296再利用） |
| operational E2E | #1362 |

本candidateを独立review・canonical freeze前にruntime、DB current output、generated docsへ投影してはならない。
