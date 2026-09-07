---
title: "HELIX-bugbot 限定修復の受入候補"
status: draft_candidate
version: "1.0"
candidate_layer: L10
owner_issue: 1639
plan_id: PLAN-L3-1640-bugbot-bounded-repair
---

# 限定修復の受入候補

原稿本文由来の受入候補。別紙02/03/05は未提供で、18シナリオ全件対応を主張しない。
各反例は独立oracle・mutationで拒否を検証し、合法入力が通る対照例を持つ。実証は未実施。

| ID | 対応要件 | 合格条件 |
|---|---|---|
| BBR-AC01 | BBR-R01 | 既存対象限定検査で版・HEAD・観測/期待・根拠・強制度を返す。助言・合法REDを完成条件で誤拒否しない |
| BBR-AC02 | BBR-R02 | 登録済み適用可能、意味判断必要、承認不足/未知を各処理先へ分け、proposalを実行許可に昇格させない |
| BBR-AC03 | BBR-R03 | 修復ID/版・実装・失敗コード・schema・write-set・副作用・予算等の不足を拒否。直前HEAD/bytes/Policy/生成器/所有権/lease/fence変更を各々拒否し、他者変更を保全。未信頼command・候補PR内修復器を特権実行しない |
| BBR-AC04 | BBR-R04 | 同一修復再適用は差分ゼロ、重複eventで二重実行しない。session変更で試行/予算がresetせず、循環・再発・期限超過は停止してRecoveryへ返る |
| BBR-AC05 | BBR-R04 | 部分失敗とCAS競合で差分/記録を保全。不明な外部副作用を再試行せず、Helpと許可された調査は維持。HEAD変更後のstale CI/reviewでmergeしない |
| BBR-AC06 | BBR-R05 | 各禁止修復を個別拒否。旧Policy巻戻しや残義務削除で緑化せず、意味矛盾を上流へ送る |
| BBR-AC07 | BBR-R01, BBR-R02, BBR-R03, BBR-R04, BBR-R05 | 一つの実consumerで検出→許可確認→隔離差分→適用→再検証→独立reviewを通す。生成・適用・検収を別証拠で残す |

AC07ではAと同じ費用・時間・手戻り指標に加え、誤修復・未解消数を比較する。
対象consumer・採否閾値を測定前に固定し、実行回数だけで改善としない。
実装PLAN、実receipt、旧入口移管/rollback、CI、review、main read-afterを別々に提出する。
