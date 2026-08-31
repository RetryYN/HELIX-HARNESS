# RLO / #819 approval packet（PO 判断依頼、2026-08-20）

> **Historical source packet:** 本packetはv0.2候補のdigestと当時の未決判断を保存する履歴資料であり、
> 2026-09-01のv0.3 current draftやL3 approval recordではない。現行候補は
> `PLAN-L3-75-resident-lane-orchestration-authority`が所有し、POの明示L3承認まではdraftを維持する。

- 作成: Claude（session 76a039fc）、Codex TL 壁打ち receipt 取得済み（T0 セカンドオピニオン、2026-08-20）
- 目的: resident-lane orchestration（RLO）の Forward 進行と関連 Issue の disposition について、
  PO の最終判断を一括で受けるための packet。承認までは Issue 本文・IR・PLAN status を変更しない。

## 対象文書（digest 固定）

| 文書 | version | sha256 |
|---|---|---|
| `docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` | 0.2 | `sha256:fe38ed57ee7c226d6ec562825bf9c8c9d08489c0dbaabad4453818ff1a60a198` |
| `docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md` | 0.2 | `sha256:5d2d56fa0dbd89c2e30c8ab6177226191ff8868a39a5d449328226381693d75f` |

PO 決定反映済み（2026-08-20）: scope 正本の Issue/PLAN 択一、構成別固定配車（2=現状、3=Grok worker）、
進行・設計・実装・レビュー 4 区分、設計の worker 委譲可、FE/BE 適性分離、既存 bench 契約
（`HR-FR-HIL-22`/`HIL-FR-61`）接続、durable タスクキュー＋hook 搬送路。

## PO に求める判断（5 点）

1. **#819 の active 化と再編**: 本文を要件書 付録 A で置換し、`parent_issue: 215 → 92`、
   `disposition: parked → active` とするか。これは scope・優先度・frontier の変更であり文言修正ではない。
2. **L3 revision の承認**: RLO 要件（`RESIDENT-LANE-ORCHESTRATION-001`）を L3 正本へ登録する承認
   （charter §3: L3 承認は PO 専権）。
3. **intake route の確定**: #819 は #502 の「update / requirement_ir_release_minus_1」ルートを流用せず、
   新規 orchestration capability として route・IR 分類（REUSE/AMEND/NEW）を別途確定する（Codex TL 見解）。
4. **PLAN 起票の許可**: `status: draft` で PLAN を起票し、承認後に confirmed へ進める。
5. **#502 の扱い**: `parked/future` 維持か、「Release -1 監査だけ開始」か（RLO とは独立の判断）。

## Codex TL 壁打ちの要旨（残リスク）

- 当時のIssue-only見解は後続PO決定で訂正済みである。currentはGitHub IssueまたはPLANのexactly oneをscope
  authorityとし、どちらの場合も専用branchを必須とする。IssueとPLANの併記を二重正本として拒否する。
- v0.2 文書は未追跡・GitHub Issue と未同期であり、文書の存在だけで承認済みとは扱えない。
- 「PO の関心＝暗黙の承認」とみなす即時 active 化は、Issue・IR・DB・PLAN 間の不整合を作るため不採用。

## 承認後の実行順（AI 側で自走）

1. #819 本文置換（付録 A、親 #92 化）
2. IR admission（REUSE/AMEND/NEW disposition）と L3 登録
3. PLAN confirmed 化 → Slice 1（Requirements authority）から Forward 進行
