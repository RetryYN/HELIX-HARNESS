---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "常駐マルチランタイム・レーン オーケストレーション要件"
layer: L3
kind: add-design
status: draft
created: 2026-08-20
updated: 2026-09-01
owner: PO / Codex TL
plan: PLAN-L3-75-resident-lane-orchestration-authority
parent_design: docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/resident-lane-orchestration-acceptance.md
next_pair_freeze: L10
---

# HELIX 常駐マルチランタイム・レーン オーケストレーション要件定義書

- 文書ID: `HELIX-RLO-REQ-001`
- バージョン: `0.3.0-draft`
- 作成日: `2026-08-20`
- 最終更新: `2026-09-01`（Issue #826、#1293、#1294〜#1296の現行決定を反映）
- 状態: `requirements-draft / L3承認待ち`
- 要求正本: `docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md`（`HELIX-RLO-BRQ-001`、L1 粒度）
- 対象リポジトリ: `RetryYN/HELIX-HARNESS`
- 主対象Issue: `#819`
- 推奨親Capability: `#92`
- Behavior Contract: `RESIDENT-LANE-ORCHESTRATION-001`

---

## 1. 文書目的

本書は、現行の「Codex推進＋Claude独立検収」を維持しながら、Codex、Grok Build、Cursor等を独立した常駐workerレーンとしてバックグラウンド稼働させるための要件を定義する。

中核ルールは次の一文に集約する。

> **workerへ仕事を渡すときは、GitHub IssueまたはPLANのexactly oneと、専用branchを同時に渡す。**

複雑な自動配車やsubagent網を先に作らず、IssueまたはPLANをscope正本、branchを変更先正本、leaseを現在所有者正本として扱う。各runtimeはレーン内でnative subagentを利用してよいが、HELIXから見た責任主体は親レーン一つに限定する。

---

## 2. 現在地と変更理由

### 2.1 現行HELIXの到達点

2026-08-20時点のmainは、PR #818のmerge commit `ae159ed4` である。

現在までに次が実装または完成域へ到達している。

- 外部worker共通admission、隔離、proposal-only境界
- Work Graph、dependency、scope、lease／fenceの統制
- 最大8-slot scheduler、bounded queue、quota handover、failure isolation
- worker／reviewer／parent acceptanceの分離
- exact-HEAD review receiptの束縛
- event envelope、因果順、重複、状態遷移、projection drift、checkpoint replayのpure判定
- 再現可能な配布archiveのprimitive
- requirements-owned workflow identityとguide生成

2026-08-20時点の主要進行PR #820では、次を実装中だった。この段落はsource snapshotであり、current readiness authorityには使わない。

- durable JSONL journal
- SQLite projection
- atomic checkpoint
- replay
- fault／race境界
- projection rowのappend-only保護

### 2.2 未完成部分

次は未完成である。

- Codex、Grok Build、Cursorを独立した常駐providerレーンとして管理する仕組み
- Issue＋専用branchを必須にしたdispatch契約
- PRのClaude検収後、同じworker・同じbranchへ自動差戻しする経路
- provider sessionが終了しても継続するバックグラウンドcontrol plane
- runtime capabilityの検出、常駐、休眠、heartbeat、再起動
- worker別の固定配車とWIP制御
- cost、fairness、fallback等を使う動的自動配車
- third-party consumer向け正式release

### 2.3 現行Issue #819の是正点

現行#819は方向自体は正しいが、次の不足がある。

1. `parent_issue: 215`となっており、event projectionの子として扱われている
2. resident provider laneより、lane内sub-agent capacityが前面に出ている
3. Issue＋専用branchの必須契約がない
4. Claudeの変更要求を元workerへ戻す循環が定義されていない
5. 一つのbranchを一人だけが所有する排他契約が弱い
6. 初期運用の固定配車、WIP上限、review在庫上限がない
7. Codexの一つの会話・プロセスを常駐正本にしない規則がない

本書では#819を、#215の子ではなく**#92配下の独立オーケストレーションCapability**として再定義する。

---

## 3. ゴール

### 3.1 業務ゴール

- Codex TLが開発frontierを継続的に進める
- Grok Build、Cursor、Codex workerへ独立タスクを並行配車する
- worker完了後、PRをClaudeへ自動送付する
- Claudeの変更要求を元workerへ戻し、同じbranchで修正させる
- workerやreviewerのquota、停止、障害で全体を停止させない
- providerを追加しても既存のCodex＋Claude経路を壊さない

### 3.2 技術ゴール

- task assignmentをIssue＋branch＋base SHA＋leaseへ束縛する
- provider processではなくHELIX control planeを状態正本にする
- 一つのbranchに同時に一つのwriterだけを許可する
- provider内部sub-agentの活動を親レーンのscopeとbudget内へ閉じる
- PR、review、changes requested、mergeをappend-only eventへ記録する
- runtime未導入時も既存経路を同じ結果で維持する
- 初期段階では固定配車とし、動的配車はadvisoryから始める

---

## 4. 非ゴール

初期リリースでは、次を実装しない。

- AIが自由にtaskを自己生成し、好きなbranchへ書く仕組み
- 一つのbranchを複数providerが同時編集する仕組み
- workerからmainへの直接push
- workerによる自己review、自己acceptance、自己merge
- Claude独立検収の代替
- 8-slotを常時すべて埋める運用
- provider別会話履歴をHELIXの正本にすること
- cost／fairness／品質スコアによる完全自動配車
- runtime未導入時の擬似成功・暗黙fallback
- sub-agentを独立した最終責任主体として扱うこと

---

## 5. 基本アーキテクチャ

```text
                           HELIX CONTROL PLANE
                queue / assignment / lease / heartbeat
                 event / checkpoint / review / merge gate
                                   │
                           Codex TL Resident Lane
                 分解・Issue化・branch発行・固定配車
                      ┌────────────┼────────────┐
                      │            │            │
               Grok Build       Cursor     Codex Worker
               Worker Lane    Worker Lane   Worker Lane
                      │            │            │
                      └────── PR / exact HEAD ──┘
                                   │
                         Claude Review Resident Lane
                              │             │
                      changes requested    approve
                              │             │
                      元worker・同branch     │
                              └───────┬─────┘
                                      │
                          HELIX CI / receipt / merge
                                      │
                           Codex TLが次frontierへ
```

### 5.1 常駐の定義

常駐とは、単一providerプロセスや単一チャットを永久稼働させることではない。

常駐する正本は次である。

- HELIX daemon
- queue
- assignment
- lease／fence
- heartbeat
- branch HEAD
- PR／review状態
- append-only event
- checkpoint

Codex、Grok Build、Cursor、Claudeの個別sessionは終了・compact・再起動してよい。session終了後も論理レーンは継続し、HELIXが次sessionを起動して同じassignmentを再開する。

---

## 6. Authority分離

| 対象 | 正本 | 説明 |
|---|---|---|
| 何を実装するか | GitHub Issue | scope、要求、受入条件、依存関係 |
| どこへ書くか | 専用branch | workerの変更先 |
| どの時点から始めたか | base SHA | branch作成時のmain |
| 誰が現在書けるか | HELIX lease／fence | branchの単独writer |
| 現在どこまで進んだか | HELIX event＋checkpoint | runtimeを跨ぐ継続状態 |
| review対象 | PR＋exact HEAD | Claudeが検査する候補 |
| merge可否 | CI＋Claude receipt＋HELIX admission | workerには権限を与えない |
| workflow意味 | requirements-owned registry | provider名やbranch名を意味正本にしない |
| provider能力 | runtime capability registry | 導入済みruntimeだけを利用可能にする |

### 6.1 二重正本禁止

- Work GraphはIssue依存関係から投影し、Issueと別の意味正本にしない
- scheduler状態はassignment／leaseから導出し、独自の作業意味を持たない
- DB projectionはeventから再構築可能にする
- GitHub labelは表示・検索surfaceであり、workflow意味正本にしない
- branch名のprovider文字列は表示情報であり、worker authorityに使わない

---

## 7. 役割定義

### 7.1 HELIX Control Planeの責務

保有する権限:

- assignment発行
- branch lease発行・更新・失効
- queue／WIP制御
- runtime起動・停止
- heartbeat監視
- PR review dispatch
- review差戻し
- CI／receipt admission
- merge実行またはmerge許可
- event／checkpoint永続化

保有しない権限:

- 要件を勝手に変更する
- Claude reviewを省略する
- Issueなしでtaskを生成する
- leaseなしでbranch writerを切り替える

### 7.2 Codex TL Resident Laneの責務

責務:

- frontier確認
- Issueの分解
- 子Issue作成提案
- 専用branch発行
- 固定ルールによるworker選択
- scope／依存／設計変更時の例外処理
- merge後の次frontier選択

通常は行わない:

- 全タスクを自分で実装する
- Claudeの細かな変更要求を毎回中継する
- worker会話をreviewerへ渡す
- provider session内の記憶を正本化する

### 7.3 Worker Resident Laneの責務

対象:

- Grok Build
- Cursor
- Codex worker
- 将来追加されるadmitted runtime

権限:

- 割当Issueを読む
- 割当branchへcommit／pushする
- 割当branchからdraft PRを作る
- 同じPR・同じbranchで変更要求へ対応する
- 親レーン内でsub-agentを利用する

禁止:

- main直接push
- 別Issueの実装
- 指定外branchへの書込み
- 別branchの無断作成
- 自己review／自己merge
- HELIX DB正本への直接書込み
- credential／secretの無断取得
- provider会話だけを完了証拠にする

### 7.4 Claude Review Resident Laneの責務

責務:

- Issue、PR、exact HEAD、diff、受入条件を用いた独立review
- blocker／non-blocker分類
- mutation／negative oracle確認
- approveまたはchanges requested
- sealed review receipt発行

禁止:

- worker会話の引継ぎによるアンカリング
- worker branchの直接修正
- workerと同一identity／session／contextでの自己検収
- CI未完了HEADの承認
- 古いHEAD／古いCI generationのreceipt再利用

### 7.5 Sub-agentの境界

sub-agentは親レーン内部の実装手段であり、HELIX上の独立workerではない。

- 親Issueと親branchからscopeを広げない
- 独立leaseを持たない
- main／PR／DBへ直接出力しない
- 成果は親レーンが検証・集約する
- sub-agent使用量は親レーンbudgetへ算入する
- 独立branchが必要になった場合は、子Issueと新branchを発行して正式レーンへ昇格する

---

## 8. 中核不変条件

### RLO-INV-001: scope正本必須（v0.2改版、PO決定 2026-08-20）

assignmentは必ずscope正本を**一つだけ**参照しなければならない。scope正本は次のいずれかとする。

- **GitHub Issue**: Issue番号、repository、Issue body digest、受入条件digest
- **PLAN**: `plan_id`、PLAN file digest、受入条件digest（Forward / Scrum workflowなど
  Issueを起票しないフロー用）

どちらも持たないassignment、両方を同時に持つassignment（二重正本）を拒否する。
v0.1の「Issue必須」はGitHub起点Capabilityフローに限定した形へ緩和する。

### RLO-INV-002: 専用branch必須

assignmentは必ず専用branchを一つ持たなければならない。main、共有作業branch、他Issue所有branchを指定してはならない。

### RLO-INV-003: 一branch一writer

一つのbranchに同時に有効なwriter leaseを一つだけ許可する。runtime内sub-agentは親writerの内部要員であり、別writerとして数えない。

### RLO-INV-004: Issueとbranchの一対一

原則として一つのIssueは一つのactive branchだけを持つ。

並列化が必要な場合は次の形に分解する。

```text
親Issue
├─ 子Issue A → branch A → worker A
├─ 子Issue B → branch B → worker B
└─ 子Issue C → branch C → worker C
```

同じIssueを複数branchへ暗黙分割してはならない。

### RLO-INV-005: base SHA固定

branch作成時のmain SHAをassignmentへ記録する。base変更時は再base／merge receiptを発行し、旧baseに束縛されたreview／completion receiptを無効化する。

### RLO-INV-006: 同じworkerへ差戻す

Claudeのchanges requestedは原則として、PRを作成した元workerへ同じIssue・同じbranchで返す。

Codex TLへ戻すのは次の場合だけとする。

- scope変更
- 依存関係変更
- 要件・設計変更
- worker交代
- branch再作成
- security／authority違反

### RLO-INV-007: session非正本

provider session IDはprovenanceとして記録するが、queue、task、branch、lease、完了状態の正本にしない。

### RLO-INV-008: provider optionalの原則

Grok Build、Cursor等が未導入・停止中でも、Codex＋Claudeの既存経路は同じ結果で動かなければならない。

### RLO-INV-009: lane-local failureの隔離

通常障害は該当laneだけを停止する。

全体停止を許すのは次に限定する。

- event log破損
- authority digest不一致
- security境界破壊
- 同一branchの二重writer
- merge authority破壊
- DB schema／checkpointの非回復不整合

---

## 9. Assignment契約

### 9.1 最小assignment packet

scope正本の本文を複製せず、参照とdigestだけを持つ。`scope_ref`はIssue形
（`issue:<repo>#<number>`）またはPLAN形（`plan:<plan_id>`）の択一とする。

```json
{
  "schema_version": "helix-resident-lane-assignment.v2",
  "assignment_id": "assignment:RetryYN/HELIX-HARNESS#819:feature/819-resident-lanes",
  "repository": "RetryYN/HELIX-HARNESS",
  "scope_ref": "issue:RetryYN/HELIX-HARNESS#819",
  "scope_body_digest": "sha256:...",
  "acceptance_digest": "sha256:...",
  "branch": "feature/819-resident-lanes",
  "base_sha": "40-hex",
  "assigned_lane_id": "grok-build-worker-01",
  "assigned_role": "worker",
  "lease_fence": 1,
  "created_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

### 9.2 branch命名

branch prefixはprovider名ではなくworkflow種別を表す。

推奨:

```text
feature/<issue>-<slug>
fix/<issue>-<slug>
docs/<issue>-<slug>
refactor/<issue>-<slug>
recovery/<issue>-<slug>
```

worker identityはassignment／leaseに記録する。`grok/`、`cursor/`、`codex/`をworkflow意味の正本にしない。

### 9.3 assignment発行条件

- scope正本（Issueまたは PLAN）がopen / active状態
- scope正本がtyped workflow identityを持つ（PLANの場合は`kind`/`layer`が現行schemaに一致）
- dependencyがREADY
- branch名が未使用または当該Issue所有
- base SHAがcurrent mainまたは承認済みstack base
- writer leaseが未取得
- runtime capabilityがAVAILABLE
- WIP上限内
- security admission済み

---

## 10. レーン状態機械

```text
DORMANT
  ↓ runtime detected
AVAILABLE
  ↓ assignment + lease
ASSIGNED
  ↓ session started
RUNNING
  ↓ commits + PR
PR_OPEN
  ↓ Claude dispatch
UNDER_REVIEW
  ├─ changes requested → CHANGES_REQUESTED → RUNNING
  ├─ approve           → APPROVED
  └─ reviewer failure  → REVIEW_PAUSED
APPROVED
  ↓ CI + receipt
MERGE_PENDING
  ↓ merge
MERGED
```

例外状態:

- `PAUSED`: 人間判断、quota、外部障害
- `STALE`: base／HEAD／Issue digestが変化
- `LEASE_EXPIRED`: heartbeat欠落
- `REASSIGN_PENDING`: takeover待ち
- `FAILED`: lane固有の終端失敗
- `CANCELLED`: Issue取消しまたはPO判断

### 10.1 takeover

別workerへの引継ぎは次をすべて満たす場合だけ許可する。

1. 旧leaseが明示releaseまたはexpiry
2. branchの最新remote HEADを確認
3. 未push workが存在しないことを旧worker receiptまたはtimeout policyで確定
4. 新fence tokenを発行
5. reassignment receiptを記録
6. 新workerが同じIssue・同じbranchをcheckout
7. Claudeの旧receiptは無効化

---

## 11. 機能要件

### 11.1 Control Planeの要件

**RLO-FR-001**
HELIXはバックグラウンドdaemonとして、assignment、lease、heartbeat、PR、review、CI、merge状態を保持しなければならない。

**RLO-FR-002**
daemon再起動後、provider会話を参照せずevent／checkpoint／GitHub read-afterから状態を復元しなければならない。

**RLO-FR-003**
同じassignment eventの重複受信は冪等に吸収しなければならない。

### 11.2 Runtime Capabilityの要件

**RLO-FR-004**
各runtime adapterは、`installed / authenticated / available / busy / paused / unavailable`をtyped状態で返さなければならない。

**RLO-FR-005**
未導入runtimeは`unavailable`として投影し、全体failureにしてはならない。

**RLO-FR-006**
runtime固有機能はadapter内部へ隔離し、共通assignment／completion／heartbeat契約を変更してはならない。

### 11.3 Dispatch

**RLO-FR-007**（v0.2改版）
scope正本（IssueまたはPLAN）なし、branchなし、base SHAなし、leaseなしのdispatchを
拒否しなければならない。scope正本の二重指定（Issue＋PLAN）も拒否する。

**RLO-FR-008**
一つのbranchに二つ目のactive writer leaseを発行してはならない。

**RLO-FR-009**
Issue依存関係が未完了の場合、assignmentをREADYへ進めてはならない。

**RLO-FR-010**
workerはassignmentで指定されたbranch以外へpushできないようにしなければならない。

### 11.4 Worker Executionの要件

**RLO-FR-011**
workerはIssue本文、受入条件、branch、base SHA、allowed／forbidden path、検証commandを受け取らなければならない。

**RLO-FR-012**
worker完了時は、PR番号、exact HEAD、changed paths、test evidence、worker receiptを返さなければならない。

**RLO-FR-013**
workerの「完了しました」という自然言語だけで状態を`review_ready`へ進めてはならない。

### 11.5 Review Loopの要件

**RLO-FR-014**
PRがreview readyになったら、Issue、PR番号、exact HEAD、diff、受入条件だけをClaudeへ渡さなければならない。

**RLO-FR-015**
worker会話、自己評価、内部sub-agent会話をClaudeへ渡してはならない。

**RLO-FR-016**
changes requested時は元worker・同Issue・同branchへ返さなければならない。

**RLO-FR-017**
worker交代が必要な場合、lease失効とreassignment receiptなしに別workerへ渡してはならない。

**RLO-FR-018**
HEAD変更後は旧review receiptを無効化しなければならない。

### 11.6 Merge

**RLO-FR-019**
mergeには次を必須とする。

- current exact HEAD
- current CI generation success
- current Claude approve receipt
- DB convergence
- Issue／branch／assignment一致
- scope一致
- branch lease terminal
- unresolved blocker 0

**RLO-FR-020**
workerにmerge authorityを与えてはならない。

### 11.7 WIP／Backpressureの要件

**RLO-FR-021**
初期運用のactive worker assignment上限を2とする。

**RLO-FR-022**
Claude review待ちPR在庫上限を2とする。

**RLO-FR-023**
review在庫が上限に達した場合、新規worker dispatchを停止しなければならない。

**RLO-FR-024**
8-slotは能力上限であり、初期の常時稼働数として扱ってはならない。

### 11.8 Sub-agentの要件

**RLO-FR-025**
sub-agentは親assignmentのIssue、branch、scope、budget、lease ownerを継承しなければならない。

**RLO-FR-026**
sub-agentが独立branchまたはPRを必要とする場合、子Issue＋専用branchを発行し、正式worker laneへ昇格しなければならない。

### 11.9 Recovery

**RLO-FR-027**
heartbeat timeout時、laneを`LEASE_EXPIRED`へ進め、新規commitを拒否しなければならない。

**RLO-FR-028**
runtime再起動時、branch HEADとcheckpointが一致する場合だけ同じassignmentを再開しなければならない。

**RLO-FR-029**
checkpoint不一致、branch drift、provider mismatchは自動継続せず`REASSIGN_PENDING`または`RECOVERY`へ送らなければならない。

### 11.10 Routing

**RLO-FR-030**
初期リリースは固定配車表を使用しなければならない。

**RLO-FR-031**
AI routerは候補提案のみとし、control planeのdispatch authorityを直接持ってはならない。

**RLO-FR-032**
自動routingは実績データと明示PO承認後にだけ有効化しなければならない。

### 11.11 Worker適性bench（v0.2追加）

**RLO-FR-033**
新規provider（Grok Build、Cursor等）のworker admissionは、既存bench契約
`HR-FR-HIL-22`／`HIL-FR-61`に従うbench evidenceなしに行ってはならない。

**RLO-FR-034**
bench適性はFE実装／BE実装／設計の軸で分離して記録し、片方の適性を他方へ
流用してはならない。適性記録はprovider名ではなくモデル世代単位で保持し、
モデル変更検知時は再benchまで旧適性を新モデルへ引き継いではならない。

### 11.12 通知搬送路（v0.2追加、PO決定 2026-08-20）

**RLO-FR-035**
dispatch／review dispatch／差戻しの通知は、control planeの**durableタスクキュー**
（event正本から導出）を一次経路とし、provider側の受け口は既存経路
（Codex: `helix codex`委譲・CLI session起動、Claude: SessionStart surface＋
`harness.db` feedback_events＋hook lifecycle）を使わなければならない。
新規メッセージング基盤を導入してはならない。

**RLO-FR-036**
通知の正本はHELIX event（`review_dispatched`等）とし、provider側受信の欠落は
queueからの再送（event replay）で回復しなければならない。通知受領の有無で
assignment状態を分岐させてはならない。

### 11.13 resident／native／CLI identityとCursor policy（v0.3追加）

#### RLO-FR-037 Resident／native／CLI identityの分離

resident lane、native subagent、CLI worker invocationを別identity、別capacity、別receipt fieldとして保持し、
provider名、model名、session IDをlogical lane authorityへ使用してはならない。

#### RLO-FR-038 Codex resident laneの親子authority

Codex resident laneはSolを親TL／管制、Lunaをnative workerとして扱う。Lunaは親assignmentのscope、branch、
budgetを継承し、terminal／review／merge authorityを持たない。Terraをcurrent候補やsilent fallbackへ戻してはならない。

#### RLO-FR-039 Cursor Cloud workerのmodel receipt

Cursor Cloud workerはrequested/effective modelを分離し、初期policyとして標準Grok、上位Kimi、下位Composerを扱う。
model availability、provider response、candidate HEAD、usage、charged costをread-afterできないrunを成功にしてはならない。

#### RLO-FR-040 HELIX-Bench由来のeffort policy

reasoning effortはHELIX-Benchのtask class別evidenceから導出する。未評価時は
`provider_default_unbenchmarked`として明示し、score単独でscope、branch、assignment、merge authorityを変更しない。

---

## 12. 初期固定配車（v0.2改版、PO決定 2026-08-20）

配車対象タスクは**進行・設計・実装・レビューの4区分**とし、runtime構成数に応じた
固定配車を既定とする。実装適性は**フロントエンド／バックエンドで分離**して計測・割当する。

| 構成 | 進行 | 設計 | 実装（FE / BE 別適性） | レビュー |
|---|---|---|---|---|
| 2 runtime（現状） | Codex TL | Codex | Codex worker | Claude |
| 3 runtime（＋Grok Build） | Codex TL | Codex | Grok Build（FE/BE適性はbenchで確定） | Claude |
| 4 runtime（＋Cursor） | Codex TL | Codex | Grok Build＋Cursor（FE/BEをbench結果で割当） | Claude |

補足:

- merge、queue、lease、receiptは常にHELIX Control Planeが保持する。
- **設計タスクはworkerへ委譲してよい**（HELIXは設計ウエイトが大きいため）。ただし
  設計成果の統合判断とL層へのfreeze（正本化）は進行レーン（Codex TL）が保持し、
  委譲先はbenchで設計適性evidenceを得たworkerに限る。
- worker適性（FE実装／BE実装／設計）の判定は既存bench契約
`HR-FR-HIL-22`（blind benchmark admit/retireの判定）／`HIL-FR-61`（Worker Acceptance Benchの受入）／
  worker共通契約（PLAN-L3-18）に従う。本Capabilityで新規benchを発明しない。
  Cursorはモデル世代単位で適性を記録し、モデル変更検知時に再benchする。

### 12.1 runtime内部と外部workerの三分離（v0.3）

- `resident_lane`: HELIX Control Planeがassignment、branch、lease、heartbeatを所有する論理常駐レーン。
- `native_subagent`: 親resident lane内部の実装手段。親scope／branch／budgetを継承し、独立writerにならない。
- `cli_worker`: 自身のprovider以外の能力をbounded taskとして補完する外部invocation。

Codex resident laneのcurrent既定はSol TL／管制からLuna native workerへ委譲する。Terraはcurrent候補から除外し、
過去receiptだけをhistorical evidenceとして保持する。Cursor Cloud workerの初期model policyは標準Grok、上位Kimi、
下位Composerとする。effortはHELIX-Benchのtask class別evidenceから導出し、未評価時は
`provider_default_unbenchmarked`をreceiptへ残す。score単独でscope、branch、merge、release authorityを変更しない。

### 12.2 配車例外

次の場合はCodex TL判断へ戻す。

- allowed pathを広げる必要がある
- Issue受入条件が不足している
- 二つ以上のIssueへ跨る
- base変更が必要
- architecture decisionが必要
- provider固有制約で実装不能
- security／credential／production impactを含む

---

## 13. Completion契約

worker completion packet:

```json
{
  "schema_version": "helix-resident-lane-completion.v1",
  "assignment_id": "assignment:...",
  "issue_number": 819,
  "branch": "feature/819-resident-lanes",
  "base_sha": "40-hex",
  "head_sha": "40-hex",
  "worker_lane_id": "grok-build-worker-01",
  "session_id": "provider-session-ref",
  "changed_paths": ["src/...", "tests/..."],
  "test_evidence": [
    {
      "command": "npm test -- ...",
      "exit_code": 0,
      "output_digest": "sha256:..."
    }
  ],
  "pr_number": 821,
  "status": "review_ready",
  "receipt_digest": "sha256:..."
}
```

自然言語summaryは補助情報であり、typed fieldとdigestを代替しない。

---

## 14. Event契約

最低限、次のeventをappend-onlyで保持する。

```text
assignment_created
branch_bound
lease_acquired
lane_session_started
lane_heartbeat
commit_observed
pr_opened
review_dispatched
review_changes_requested
review_approved
lease_released
lane_reassigned
merge_admitted
merged
assignment_closed
assignment_failed
```

各eventは次を含む。

- assignment ID
- Issue
- branch
- base SHA
- current HEAD
- lane ID
- runtime ID
- causation ID
- correlation ID
- fence token
- payload digest
- occurred_at
- schema version

### 14.1 HEADのscope

HEADはrepository全体で一つに固定しない。

- assignment／branchごとにcandidate HEADを持つ
- 複数resident laneは異なるbranch HEADを同時に持てる
- checkpoint、review、completionはlaneのHEADへ束縛する
- global journalの再生時に、全laneのeventを単一`currentHeadSha`へ一致させてはならない
- merge後のmain HEADは別のauthorityとして記録する

---

## 15. 非機能要件

### RLO-NFR-001: 耐久性

daemonまたはprovider processが終了しても、確定済みassignment、lease、branch HEAD、PR、review状態を失ってはならない。

### RLO-NFR-002: 決定性

同じIssue、branch、HEAD、event列から同じassignment／projection／checkpointを再構築できなければならない。

### RLO-NFR-003: 障害分離

一つのruntime停止は該当laneだけを停止し、依存しないlaneとClaude reviewを継続させなければならない。

### RLO-NFR-004: セキュリティ

- main direct write禁止
- secret／credentialは明示admission時だけ
- remote runtimeには必要最小限のrepository権限
- allowed path外変更を拒否
- destructive操作は既存capability brokerへ委譲
- worker outputは再検証後にだけeventへ取り込む

### RLO-NFR-005: 可観測性

最低限、次を表示できなければならない。

- runtime availability
- active assignment
- Issue／branch／HEAD
- lease owner／fence／expiryの検証
- last heartbeat
- PR／review状態
- queue長
- review在庫
- retry／reassignment回数
- provider別成功率、所要時間、差戻し率

### RLO-NFR-006: コスト制御

- provider別budgetを設定可能
- sub-agent使用量を親laneへ集約
- budget到達前にcheckpoint
- budget超過で無制限継続しない
- 初期版ではcostによる自動配車を行わない

### RLO-NFR-007: 互換性

Grok Build、Cursor等が存在しない環境では、Codex TL＋Codex worker＋Claude review経路が従来どおりgreenでなければならない。

### RLO-NFR-008: Portabilityの要件

provider adapterはcontrol plane coreから分離し、Windows／WSL／Linux／remote VMの差をadapterで吸収する。

---

## 16. 受入条件

### Assignment

- **RLO-AC-001** GitHub IssueまたはPLANのexactly oneが無いdispatchと、両方を持つdispatchが失敗する
- **RLO-AC-002** branchなしのdispatchが失敗する
- **RLO-AC-003** base SHAなしのdispatchが失敗する
- **RLO-AC-004** 同一branchへの二重writer leaseが失敗する
- **RLO-AC-005** 一Issue二active branchが失敗する
- **RLO-AC-006** 子Issueへ分割した場合だけ複数branchを許可する

### Worker

- **RLO-AC-007** workerが別branchへpushしようとすると拒否される
- **RLO-AC-008** workerがmainへpushしようとすると拒否される
- **RLO-AC-009** scope外path変更がreview前に拒否される
- **RLO-AC-010** sub-agentが直接PRを作成できない

### Review

- **RLO-AC-011** PR作成後、ClaudeへIssue＋PR＋exact HEADが送られる
- **RLO-AC-012** worker会話を渡さずblind reviewになる
- **RLO-AC-013** changes requestedが元worker・同branchへ戻る
- **RLO-AC-014** HEAD変更後に旧Claude receiptが無効になる
- **RLO-AC-015** approve後もcurrent CI generationが違えばmergeできない

### Recovery

- **RLO-AC-016** worker crash後、lease expiry前のtakeoverを拒否する
- **RLO-AC-017** lease expiry後、新fenceで同branchを別workerへ引き継げる
- **RLO-AC-018** daemon再起動後、queue／assignment／leaseを復元できる
- **RLO-AC-019** provider未導入でも既存Codex＋Claude経路が同じ結果になる
- **RLO-AC-020**一lane failureで独立laneを停止させない

### WIP

- **RLO-AC-021** active worker 2件で3件目dispatchをbackpressureする
- **RLO-AC-022** review待ち2件で新規dispatchを停止する
- **RLO-AC-023** review在庫減少後にdispatchを再開する

### Multi-branch HEADの前提

- **RLO-AC-024** 異なるbranch HEADを持つ2laneのeventを同じjournalへ保存できる
- **RLO-AC-025** lane AのHEAD変更がlane Bのcheckpointをstaleにしない
- **RLO-AC-026** merge後main HEADとworker candidate HEADを別authorityとして保持する

### Runtime identity／model policyの前提

- **RLO-AC-027** 同一runをresident lane、native subagent、CLI workerへ同時分類するmutationが失敗する
- **RLO-AC-028** Lunaが独立branch／terminal／review／merge authorityを取得するmutationとTerra silent fallbackが失敗する
- **RLO-AC-029** Cursor runのrequested/effective model、usage、cost、candidate HEAD欠落とwrong model tierを個別に拒否する
- **RLO-AC-030** effort未評価を推測値へ変換せず`provider_default_unbenchmarked`として追跡する

---

## 17. 既存HELIXとの接続

### 17.1 再利用するCapability

| 既存Issue | 再利用内容 |
|---|---|
| #194 | external worker admission、隔離、proposal-only |
| #213 | Work Graph、dependency、lease／fence、三段receipt |
| #214 | 8-slot上限、bounded queue、quota handover、failure isolation |
| #215 / #636 | eventのpure判定 |
| #499 | durable journal、projection、checkpoint、replayの永続化 |
| #769 | CI generation付きreview receipt |
| #694 | requirements-owned workflow identityの正本化 |
| #188 | 将来のswitching／routing／allocation／measurement |

### 17.2 Issue #819の推奨再編

```yaml
issue_role: capability
parent_issue: 92
blocks:
  - 92
blocked_by:
  - 194
  - 213
  - 214
duplicate_search: completed
disposition: active
behavior_contract_id: RESIDENT-LANE-ORCHESTRATION-001
```

段階依存:

- requirements／固定配車設計: 今すぐ着手可能
- durable restart／checkpoint integration: #499 completion後
- 動的routing: #694収束＋#188実装後
- 完全自動routing authority: 実運用evidence＋PO承認後

### 17.3 #215との関係

#819は#215の子ではない。

#215／#499はevent耐久層を提供する下位Capabilityであり、resident laneはそのconsumerである。したがって兄弟関係または#92配下の上位Capabilityとして扱う。

---

## 18. 原子的実装分割

### Slice 1: Requirements authorityの確定

- 本要件をL3へ正本化
- #819を#92配下へ再編
- Issue＋branch必須契約
- role／authority分離
- L4/L9 acceptance skeleton

### Slice 2: Assignment／Branch Lease Kernelの実装

- `ResidentLaneAssignmentV1`
- Issue read-after
- branch発行
- base SHA束縛
- 一branch一writer lease
- duplicate／stale／scope oracleの検証

### Slice 3: Runtime Capability Registryの実装

- adapter interface
- installed／authenticated／available状態
- Codex、Claude、Grok Build、Cursor adapterを別PR化
- 未導入runtimeの互換oracle

### Slice 4: Resident Lane Supervisorの実装

- background daemon
- heartbeat
- session restart
- budget／pause／resume
- lane-local failure isolationの検証

### Slice 5: Worker→PR→Claude→Worker Loopの実装

- worker completion packet
- PR自動作成
- Claude review dispatch
- changes requestedを元workerへ返す
- exact HEAD／CI generation／review receiptの束縛

### Slice 6: Recovery／Reassignmentの実装

- lease expiry
- reassignment receipt
- same branch takeover
- stale session拒否
- checkpoint再開

### Slice 7: WIP／Backpressureの実装

- active worker上限2
- review在庫上限2
- queue pause／resume
- metrics

### Slice 8: Provider Canaryの実施

- Grok Build 1 lane
- Cursor 1 lane
- Codex worker 1 lane
- Claude review 1 lane
- 同時worker 2件まで
- 実Issue／実branch／実PRでE2E

### Slice 9: Advisory Routerの実装

- #188のcandidate／capacity／cost／quality入力
- dispatch候補の提案のみ
- HELIXまたはCodex TLが最終dispatch
- 自動authorityは無効

---

## 19. 段階リリース

### Release 0: 現行ペア固定

```text
Codex TL／worker → Claude review
```

要件とeventだけ追加し、挙動を変えない。

### Release 1: 一常駐worker追加

```text
Codex TL
├─ Grok Build worker
└─ Claude reviewer
```

Issue＋branch＋lease＋PR差戻しを実証する。

### Release 2: 二worker運用

```text
Codex TL
├─ Grok Build
├─ Cursor
└─ Claude reviewer
```

active worker 2、review在庫2でbackpressureを実証する。

### Release 3: Durable Recoveryの段階

#499のjournal／projection／checkpointを接続し、daemon／provider再起動後の復元を実証する。

### Release 4: Advisory Routingの段階

worker候補、capacity、所要時間、差戻し率を使い、候補だけを提案する。

### Release 5: 限定自動配車

十分な実測とPO承認後、低リスク・原子taskだけを自動配車する。security、architecture、irreversible操作はCodex TLまたは人間判断を維持する。

---

## 20. リスクと抑制策

| リスク | 抑制策 |
|---|---|
| providerを増やしてreview在庫が膨張 | worker WIP 2、review在庫2 |
| branch競合 | 一branch一writer、子Issue分割 |
| Codex停止で全体停止 | session非正本、daemon＋event正本 |
| Grok／Cursor未導入で失敗 | optional capability、既存経路維持 |
| sub-agentがscopeを逸脱 | 親Issue／branch／budget継承 |
| Claudeが詰まる | dispatch backpressure、review優先lease |
| base driftで再review増加 | merge-ready優先、低優先merge停止 |
| 自動routing誤判断 | 初期固定配車、advisory限定 |
| multi-lane HEADを単一HEAD扱い | lane単位HEAD／checkpoint |
| control planeが複雑化 | Issue、branch、lease、event、receipt以外を正本にしない |
| GitHub障害で停止 | local branch継続、event保留、復旧後read-after |
| worker takeoverで未push変更消失 | expiry前takeover禁止、remote HEAD／checkpoint確認 |

---

## 21. 品質ゲート

各実装PRは次を満たす。

- 1 behavior contract
- 1 responsibility owner
- 1 Issue
- 1 dedicated branch
- `change_slice: atomic`
- L4/L9、L5/L8、L6/L7の該当pair
- targeted positive／negative oracleの実行
- mutation oracle
-全回帰
- doctor
- DB convergence
- Claude exact-HEAD independent reviewの実行
- post-merge main read-afterの実行

さらに、本Capabilityでは次のpre-merge simulationを必須とする。

```text
PR差分をmain候補へ仮適用
→ merged-plan-status
→ assignment／branch ownership
→ outstanding projection
→ doctor
```

merge後にしか発火しないgovernance違反を事前検出する。

---

## 22. 決定事項

本書で固定する決定は次である。

1. Codex＋Claudeの現行ペアは維持する
2. Codexは常時frontierを進めるTLレーンとする
3. Grok Build、Cursor、Codex workerを独立常駐worker候補とする
4. Claudeは独立review専用レーンとする
5. task dispatchには必ずscope正本（IssueまたはPLAN、択一）と専用branchを渡す
   （Forward / Scrum はIssueを立てないためPLAN正本を使う）
6. 一branch一writerとする
7. changes requestedは元worker・同branchへ戻す
8. sub-agentは親レーン内部だけで使う
9. provider sessionは正本にしない
10. 初期は固定配車、active worker 2、review在庫2とする
11. 8-slotは能力上限であり初期稼働数ではない
12. 動的配車はadvisoryから開始する
13. resident laneは#215の子ではなく#92配下のCapabilityとする
14. event／checkpointは複数branch HEADをlane単位で扱う
15. 未導入runtimeがあっても既存経路を壊さない
16. 配車タスクは進行・設計・実装・レビューの4区分とし、実装適性はFE/BEで分離する
17. 設計タスクはworkerへ委譲可（統合判断とL層freezeは進行レーン保持）
18. worker適性は既存bench契約（`HR-FR-HIL-22`／`HIL-FR-61`）で判定し、モデル世代単位で記録する
19. 通知搬送路はdurableタスクキュー＋既存Codex/Claude経路（hook surface）とし、新規基盤を作らない

---

## 23. 完了定義

本Capabilityは、次をすべて満たしたときに完成とする。

- Codex TLがIssueとbranchを発行してworkerへ配車できる
- Grok BuildとCursorの少なくとも一方が常駐workerとして動く
- workerが同branchからPRを作る
- Claudeがblind exact-HEAD reviewを行う
- changes requestedが元workerへ戻り、同PRで修正される
- approve後にHELIX admissionがmergeする
- runtime／daemon再起動後にassignmentを復元できる
- 同一branchの二重writerが0
- Issueなし／branchなしdispatchが0
- main直接pushが0
- worker自己承認が0
- review在庫上限とbackpressureが実運用で成立
- provider未導入時に既存Codex＋Claude経路が同一結果
- 2worker＋1reviewerの連続canaryが停止なく完走
- fault、timeout、stale lease、provider mismatch、HEAD driftの全negative oracleがgreen
- main read-after、DB convergence、rollback rehearsalが成立

---

## 24. 直近実行順

1. #820のtransactional I/Oを独立レビューしてmainへ収束
2. #819の本文を本書の方針で置換し、親を#92へ変更
3. L3 requirementsへ`RESIDENT-LANE-ORCHESTRATION-001`を追加
4. Assignment／Issue／branch／lease kernelを最初の実装sliceとする
5. 現行Codex＋Claude経路をRelease 0 canaryとして固定
6. Grok Build adapterを最初の追加worker候補とする
7. Cursor adapterを別sliceで追加
8. PR→Claude→元worker差戻しをE2E化
9. #499 completion後にheartbeat／restart／checkpointを接続
10. 実運用データが溜まるまで#188の自動routing authorityを有効化しない

---

## 付録A: #819置換用の要約

```yaml
title: "feat(orchestration): Issue＋branch固定の常駐multi-runtime laneを実装する"
issue_role: capability
parent_issue: 92
behavior_contract_id: RESIDENT-LANE-ORCHESTRATION-001
disposition: active
```

目的:

```text
Codex TLが常時frontierを進め、
Issue＋専用branchをGrok Build／Cursor／Codex workerへ割り当て、
workerのPRをClaudeが独立reviewし、
変更要求を元worker・同branchへ返し、
HELIXがCI／receipt確認後にmergeする。
```

最重要不変条件:

```text
Issueなしdispatch禁止
branchなしdispatch禁止
一branch一writer
main直接push禁止
worker自己review禁止
changes requestedは元worker・同branch
provider sessionは非正本
未導入runtimeはoptional
初期worker WIP=2、review在庫=2
```
