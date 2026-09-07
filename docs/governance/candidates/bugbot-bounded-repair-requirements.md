---
title: "HELIX-bugbot 限定修復の追加契約候補"
status: draft_candidate
authority_status: awaiting_human_approval
version: "1.0"
candidate_layer: L3
owner_issue: 1639
plan_id: PLAN-L3-1640-bugbot-bounded-repair
---

# 逸脱検出・限定修復

本書は追加契約候補であり、自動適用権限を発行しない。BBR IDは候補内ID。
L1/L10・専用PLANは同名候補に接続する。承認差分の確定、正本化・IR admissionは未完了。
既存GH-FR-011のCI自己修復権限内の機械化と、新しい適用対象・契機・権限差分を分ける。
#1595は別途の自動修復を対象外としている。その承認をBへ継承しない。

### BBR-R01 対象限定検査（原稿B01）

作成・変更確定・push前、PR/CI、必要な全域監査の既存入口へ接続する。別daemonは作らない。
Policy版、HEAD、観測・期待状態、根拠、強制度、修復候補を返す。助言をHard化せず、
許可された途中編集やREDテストに完成条件を強制しない。

### BBR-R02 処理先分離（原稿B02）

適用条件と安全性を検証できる登録済み処理のみ機械修復する。複数解・意味判断は既存workerへproposalとして返す。
承認不足・矛盾・取得不能・未知は追加観測・判断・待機へ送る。候補・許可・適用・検収を別状態にする。

### BBR-R03 自動適用契約（原稿B03）

既存操作契約へ修復ID/版、信頼済み実装、失敗コード、入力schema、事前条件、write-set、
副作用区分、予算・期限・再試行、事後検証、失敗処理を束縛する。登録・有効化は通常検収を通す。
LLM confidenceや自己申告で許可しない。
適用直前にHEAD・入力bytes・Policy・生成器・workspace所有権・lease/fenceを再照合する。
隔離差分を検証し既存transaction/CASで反映する。write-set逸脱は拒否し、他者の変更を保全する。
外部文章のcommand、候補PRが改変した修復器、未信頼入力を特権実行しない。

### BBR-R04 収束と停止（原稿B04）

再適用の差分ゼロ、findingの重複排除、episode累積の試行・予算を要求し、session変更でresetしない。
相互修復の循環・同一失敗再発・期限超過で停止して既存Recoveryへ返す。
内部正常化後に候補を確定し、HEAD変更でstaleとなるCI/reviewを正規更新する。
修復成功で独立検収・merge許可を代替しない。途中失敗の差分・記録を保全し、不明な外部副作用を再試行しない。
全面rollback可能と仮定せず、失敗した修復がHelpや許可された調査まで塞がないようにする。

### BBR-R05 禁止修復（原稿B05）

承認・証跡補作、Guard解除、必須test削除、閾値緩和、scope拡張、意味digest無審査更新、
他者変更破棄、branch/worktree一括削除、無許可push/merge/publish/credential操作は禁止する。
旧Policyで現行資産を巻き戻さず、矛盾は上流改訂へ送る。

## 段階投入と受入への引渡し

統制①が限定適用契約を担当し、書込みは既存Authoring/Recovery、状態は既存event/receipt/DB投影を使う。
棚卸し→対象限定整形・再生成→PLAN/PR定型生成→実receipt引用→実証済み変換・worker返却の順で進める。
#192/#1595/#1608全体の完了を一律前提にしない。CI #93、Cursor #1293と並行するが安全修復を押しのけない。
未定義の権限差分だけL1/L3/L10承認・正本化・該当#397 admission後に有効化する。

独立oracle・mutation・合法入力誤拒否・実consumer・二重実行・途中失敗を検証する。
信頼済み修復器差替え、CAS競合、lease取消、累積予算超過、循環、禁止緑化を反例とする。
成功件数だけで評価せず、Aと同条件の費用・時間・手戻り・誤修復・未解消数を測定する。
旧入口移管・rollback証拠、CI・review・main read-afterを提出し、残義務削除で合格しない。

原文: Issue #1639本文。SHA-256 `c97b9dd32b8327696d77ae3f86cebeae0e3a2545766d3e4bb2c0f484e6a4828a`。
別紙02/03/05は未提供。本文由来の受入観点は別紙03の18シナリオ確認の代替ではない。
