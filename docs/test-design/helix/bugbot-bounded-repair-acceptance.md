---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "HELIX-bugbot 限定修復の総合テスト設計"
layer: L10
kind: redesign
status: draft
authority_status: canonical_source
approval_record_id: L3-PO-1642-001
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1642#issuecomment-5575191622"
approved_revision: "1.0"
approved_candidate_head: 98cdc24c12e47057b1a7d6d3b156a96bf5ef4d8d
approved_raw_digest: "sha256:095ddf1e237c26d15cb4f227a03ae9b11267f6cedff94ea563246fa3b6192375"
version: "1.0"
owner_issue: 1642
plan: PLAN-L3-1642-bugbot-bounded-repair
parent_design: docs/design/helix/L3-requirements/bugbot-bounded-repair-requirements.md
pair_artifact: docs/design/helix/L3-requirements/bugbot-bounded-repair-requirements.md
---

# 限定修復の総合テスト設計

本書は承認済みBBR-AC01..07のcanonical sourceであり、
[L3要件](../../design/helix/L3-requirements/bugbot-bounded-repair-requirements.md)とL3↔L10を構成する。
来歴と残義務は[既存PLAN](../../plans/PLAN-L3-1642-bugbot-bounded-repair.md)へ接続する。
新配置の独立技術review前は文書・PLANともdraftを維持する。Requirement IR admission、実装、
修復ごとの契約・独立検証・実consumer検証は未完了であり、配置だけで自動適用を許可しない。
以下は原稿本文由来の受入条件。別紙02/03/05は未提供で、18シナリオ全件対応を主張しない。
各反例は独立oracle・mutationで拒否を検証し、合法入力が通る対照例を持つ。実証は未実施。

| ID | 対応要件 | 合格条件 |
|---|---|---|
| BBR-AC01 | BBR-R01 | 既存対象限定検査で版・HEAD・観測/期待・根拠・強制度を返す。助言・合法REDを完成条件で誤拒否しない |
| BBR-AC02 | BBR-R02 | 登録済み適用可能、意味判断必要、承認不足/未知を各処理先へ分け、proposalを実行許可に昇格させない |
| BBR-AC03 | BBR-R03 | 修復ID/版・実装・失敗コード・schema・write-set・副作用・予算等の不足を拒否。直前HEAD/bytes/Policy/生成器/所有権/lease/fence変更を各々拒否し、他者変更を保全。未信頼command・候補PR内修復器を特権実行しない。GH-FR-011のAI自己修復を修復器の自動write許可へ変換しない。既存対象・契機・episode・scope・権限が一致する対照例は既存経路で通し、追加差分だけ承認・正本化へ返す。新しい自動適用は修復ごとの契約・独立検証・実consumer検証の各欠落を個別に拒否し、すべて成立した対象範囲だけ有効化する対照例を検証。要求承認だけ・登録だけ・他修復または他consumerの合格から包括的書込み許可を導出しない |
| BBR-AC04 | BBR-R04 | 同一修復再適用は差分ゼロ、重複eventで二重実行しない。session変更で試行/予算がresetせず、循環・再発・期限超過は停止してRecoveryへ返る |
| BBR-AC05 | BBR-R04 | 部分失敗とCAS競合で差分/記録を保全。不明な外部副作用を再試行せず、Helpと許可された調査は維持。HEAD変更後のstale CI/reviewでmergeしない |
| BBR-AC06 | BBR-R05 | 各禁止修復を個別拒否。旧Policy巻戻しや残義務削除で緑化せず、意味矛盾を上流へ送る |
| BBR-AC07 | BBR-R01, BBR-R02, BBR-R03, BBR-R04, BBR-R05 | 一つの実consumerで検出→許可確認→隔離差分→適用→再検証→独立reviewを通す。生成・適用・検収を別証拠で残す |

AC07ではAと同じ費用・時間・手戻り指標に加え、誤修復・未解消数を比較する。
対象consumer・採否閾値を測定前に固定し、実行回数だけで改善としない。
実装PLAN、実receipt、旧入口移管/rollback、CI、review、main read-afterを別々に提出する。
