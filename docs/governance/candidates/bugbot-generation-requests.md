---
title: "HELIX-bugbot 定型生成の利用目的"
status: draft_candidate
version: "1.0"
candidate_layer: L1
owner_issue: 1639
plan_id: PLAN-L3-1639-bugbot-generation
---

# 定型生成の要求候補

BBG-BR01: HELIXを使う開発者・workerが、意味入力に集中でき、同じPLAN/PR定型欄や派生物を
繰り返し手修正せずに既存検証へ渡せること。対象は既存Authoringの利用者とCI/Cursor先行経路。
新しい業務設計・思考順序を固定することは目的ではない。

BBG-BR02: 手作業削減によってscope、承認、証跡、独立レビューの真正性を下げないこと。
生成の成功と実行・検収の成功は別に扱う。

要件候補は[BBG-R01..04](bugbot-generation-requirements.md)、
受入候補は[BBG-AC01..06](bugbot-generation-acceptance.md)へ接続する。
BR01→R01/R02/R04→AC01/02/05/06、BR02→R03/R04→AC03/04/05で追跡する。

CI #93・Cursor #1293と並行する先行対象。既存GH-FR-007/014を再利用し、
#1608の変更伝播と対象単位で接続する。承認済み意味の実装接続と、意味・受入改訂の差分を
実装前に分類する。新規権限の付与、別Bot製品化、全管理機構完成待ちは含めない。
