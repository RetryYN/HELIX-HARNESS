# 上流再整備の実行backlog

status: draft_backlog
created: 2026-09-14
updated: 2026-09-14

## 目的

[上流再整備と既存資産統制方針](upstream-rebaseline-and-asset-governance-policy-2026-09-14.md)を、
HELIX-OSが順に実行・停止・再開できる作業単位へ分ける。GitHub Issueは必要に応じた作業projectionであり、
本backlogの意味・順序・完了状態を所有しない。

## 実行順序

| Wave | 目的 | 主入力 | 成果物 | 人間境界 | 自動走行の出口 |
|---|---|---|---|---|---|
| U0 | 旧実行面をarchive-first隔離し、母集団とauthorityを固定 | 上流authority管理台帳、旧Core Reads、Requirement IR、候補、旧資産 | 非実行archive、現行の最小上流入口、source exact set、状態、対象、owner、未解決一覧 | 新しい製品境界・安全境界だけ判断 | 旧workflow／AI startup／runtime entryがcurrent pathになく、全sourceがclassifiedまたはreason付きunresolved |
| U1 | 上位Conceptを対象別に確定 | L0 charter、Concept v3.1、Concept v4候補、最新責務決定 | HELIX全体、HARNESS、HELIX-OS、個別製品のConcept revision | Concept・製品identityを承認 | 旧Conceptとの差分、supersede、rollback、下流impactが確定 |
| U2 | 対象別L1を再構成 | P0–P9、柱要求、Concept revision | HARNESS L1、HELIX-OS L1、個別製品L1 | 企画・価値・scopeを確認 | 全L1がexact target、親Concept、非対象、成功条件を持つ |
| U3 | 対象別L2とL11を確定 | 対象別L1、既存L2案、prototype／非UI適用性 | 合意revision付きL2、対応L11受入設計 | 要求・prototype・N/A・合意を確認 | 全L2がL1親、利用場面、成功結果、L11 pairを持つ |
| U4 | L3要件とL10を再凍結 | 合意済みL2、v1.3、candidate L3、Requirement IR | 対象別L3、L10、IR revision、canonicalization receipt | L3要件revisionを承認 | 全L3がL2親、AC、failure、L10 pair、impactを持つ |
| U5 | L4–L9とL6↔L7を再導出 | 凍結L3／L10、既存設計・実装・test | 対象別設計、test contract、実装slice、trace | 不可逆・外部作用だけ判断 | 全変更が正規pair、owner、oracle、green evidenceを持つ |
| U6 | runtime／projectionを新世代へ切替 | 検証済み下流、consumer一覧、migration plan | runtime、DB、CLI、新世代CI、GitHub projectionの新revision | cutover等のaction-binding approval | 新要求oracleでgreen、rollback、consumer read-after、旧write停止。旧CIは実行しない |
| U7 | archive資産の意味移管と最終退役を閉じる | 新世代replacement、consumer切替、archive inventory | final disposition、replacement evidence、削除／長期保全判断 | 例外的な物理削除だけ破壊的操作確認 | 未移管0、旧runtime再有効化不可、archiveからの復元経路なし |

Waveを飛ばさない。U1–U4の上流が変わった場合、影響するU5–U7をstale化する。
U5以降の実装成功からU1–U4の意味を逆算して確定しない。

## 各Waveの作業契約

各作業単位は次を必須fieldとして持つ。

```yaml
work_unit_id: stable-id
wave: U0-U7
product_target: HARNESS | HELIX-OS | HELIX-Web | exact-other-product
source_asset_ids: []
upstream_revision: exact-revision
responsibility_owner: exact-owner
scope:
  include: []
  exclude: []
dependencies: []
required_pairs: []
acceptance_ids: []
allowed_actions: []
forbidden_actions: []
stop_conditions: []
rollback_target: null
evidence_required: []
state: proposed | ready | active | blocked | verified | accepted | superseded
```

GitHub Issue番号、branch、PRはこの契約への参照として追加できるが、`source_asset_ids`、`upstream_revision`、
`acceptance_ids`をIssue本文から補完しない。fieldが不足する作業単位は`ready`にしない。

## 最初のwork unit

| ID | Wave | 対象 | 入力 | 出口 | 現在状態 |
|---|---|---|---|---|---|
| URB-U0-001 | U0 | HELIX全体 | 上流authority管理台帳、旧active path | 非実行archive、最小上流入口、既知母集団と未解決sourceのexact inventory | active（実行面隔離済み、文書分離中） |
| URB-U1-001 | U1 | HELIX全体 | Concept v3.1、v4候補、責務決定 | `candidates/helix-concept-v4.1.md` | drafted_awaiting_human_approval |
| URB-U2-HARNESS-001 | U2 | HARNESS | Concept revision、柱対応表 | 外部提供物としてのL1企画 | upstream_waiting |
| URB-U2-OS-001 | U2 | HELIX-OS | Concept revision、柱対応表 | 管理・統制・改善機構としてのL1企画 | upstream_waiting |
| URB-U2-WEB-001 | U2 | HELIX-Web | Concept revision、Vision原文 | 管理対象製品としてのL1企画 | upstream_waiting |
| URB-U3-HARNESS-001 | U3 | HARNESS | HARNESS L1、L2案6件、L11案 | 合意revision付きL2／L11 | upstream_waiting |
| URB-U3-OS-001 | U3 | HELIX-OS | OS L1、L2案9件、L11案 | 合意revision付きL2／L11 | upstream_waiting |
| URB-U3-WEB-001 | U3 | HELIX-Web | Web L1、Vision由来L2案8件、L11案 | 合意revision付きL2／L11 | upstream_waiting |
| URB-U3-AIDOC-001 | U3 | HARNESS / HELIX-OS | 対象別L1、AI可読文書要求候補 | 合意revision付きAI文書L2／L11 | upstream_waiting |
| URB-U4-001 | U4 | 対象別 | v1.3対応表、IR差分proposal、候補L3／L10 | 対象別L3／L10とIR revision | upstream_waiting |
| URB-U5-001 | U5 | 対象別 | 凍結L3／L10、既存資産台帳 | 下流再導出と検証済み実装slice | upstream_waiting |
| URB-U6-001 | U6 | HELIX-OS | 検証済みslice、consumer、migration | runtime／projection切替 | upstream_waiting |
| URB-U7-001 | U7 | HELIX全体 | replacement evidence、consumer read-after、archive inventory | 意味移管と最終退役の閉鎖 | upstream_waiting |

`verified（文書範囲）`は、runtime実装・全repository資産・利用者受入まで完了した意味ではない。
U1のConcept candidate revisionは起草済みであり、製品identityと責務境界の人間確認が次の上流gateである。

URB-U1-001のcandidateはremote branchへ同期済みである。ただし旧PR #1795はclosedであり、そのCIとreview admissionを
U1のreview・承認・完了根拠にしない。上流意味reviewの専用laneが未整備のため、補助状態は`review_waiting`とする。
archive-first commit `064280b5c`もremote branchへ同期済みで、新runは0である。旧PRを再開せず、新しいPRを共有・reviewへ
使う。mainのbranch protectionに旧`harness-check` required contextが残る間はPRを開かず、外部設定の解除許可を先に得る。
解除後もreview routeが明示されるまでreviewを起動せず、上流承認やmergeへ自動進行しない。

## 停止規律

- 対象製品、上流revision、owner、pair、acceptanceが不明なら停止する。
- candidate承認とcanonical admission、実装と検証、PR mergeと利用者受入を同一状態にしない。
- 凍結sourceの本文を先に変更してdigestだけ追従させない。
- 未移管条件、consumer、rollback、historical evidenceが不明でも非実行archiveへは隔離できるが、物理削除しない。
- CIを回すこと自体を前進や完了にしない。実行する検査と判断対象を先に固定する。
- remote sync、上流意味review、人間decision、下流CIを別operationにする。branch pushからPR作成を自動導出しない。
- 上流review専用laneが未整備なら`review_waiting`で停止し、旧PR／旧CI receiptを代替証拠にしない。
- 新世代CIは承認上流から新規導出する。旧CIを動かさず、dual-green・job parity・旧workflow適合を移行条件にしない。
- AI可読文書も承認上流から新規導出する。現行Core Reads、prompt、adapterを新世代のbaselineとして移植しない。
