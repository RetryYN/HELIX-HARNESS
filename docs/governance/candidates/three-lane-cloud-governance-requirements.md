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
- `3L-R-05 Cursor Worker Boundary`: HELIXがprovider起動前に専用branchを事前発行し、発行済みbranchをassignmentへ束縛する。CursorはIssueまたはPLANの択一、専用branch、allowed path、budget、TTL内だけを書き、main／別branch／HELIX DBへ書かない。providerによる事後branch発行を代用にしない。
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
- `3L-R-14 External Read-after`: 起動後・成果回収時にbranch owner、assignment、candidate HEADをGitHub／providerから再取得し、起動前の3L-R-24の束縛と照合する。HEADの進行は当該assignmentに帰属する変更として検証し、base HEADとの単純な同値を要求しない。PR、requested／effective model、usage、cost、changed path、testも外部sealし、worker自己申告を正本にしない。owner交代、別branch、帰属不能なHEADは成果取り込みを拒否する。
- `3L-R-23 Single Writer`: 同一branchの同時writerは1件に限定する。起動前に排他的なwriter所有を確保し、2件目をprovider起動前に拒否する。単なる事前一覧確認だけを排他と見なさない。完了・取消・期限切れによる安全な返却まで所有を保持し、遅延workerが返却後のbranchへ書ける場合は再配車しない。
- `3L-R-24 Pre-dispatch Identity`: provider起動直前にbranch owner、assignment、base HEADを外部再取得し、発行済みbranchと承認されたscopeの束縛に一致する場合だけ起動する。未発行、owner不明、不一致、stale HEADは起動を拒否し、起動後の検査成功で相殺しない。
- `3L-R-25 Phased Assignment Migration`: Phase AはIssue正本と事前発行branch、action-bound assignment、3L-R-23の排他、前後2 leg照合、budget／TTLで限定運用する。Phase Bは#860のlease／fenceへ接続する。切替時は新規dispatchを停止し、旧assignmentを終端・取消・隔離して遅延write不能を検証した後、owner／branch／HEADと新lease／fenceの対応を束縛して再開する。旧tokenの再利用やA/B双方のwriter許可を拒否し、移行を証明できなければ停止を保つ。Phase Aでも排他・境界強制を省略しない。

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

## L1からの導出対応

| 上位要求 | 詳細要件 |
|---|---|
| 3L-BR-001 | 3L-R-01、3L-R-02、3L-R-03 |
| 3L-BR-002 | 3L-R-04、3L-R-09、3L-R-10 |
| 3L-BR-003 | 3L-R-05、3L-R-12、3L-R-14、3L-R-23、3L-R-24、3L-R-25 |
| 3L-BR-004 | 3L-R-06、3L-R-11 |
| 3L-BR-005 | 3L-R-07、3L-R-08、3L-R-09、3L-R-10、3L-R-11 |
| 3L-BR-006 | 3L-R-12、3L-R-13、3L-R-14、3L-R-15、3L-R-23、3L-R-24 |
| 3L-BR-007 | 3L-R-15、3L-R-16、3L-R-17 |
| 3L-BR-008 | 3L-R-18、3L-R-19、3L-R-20 |
| 3L-BR-009 | 3L-R-21、3L-R-22 |

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
