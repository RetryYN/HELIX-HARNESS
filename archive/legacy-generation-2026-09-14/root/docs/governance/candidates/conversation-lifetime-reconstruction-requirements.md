---
title: "会話寿命管理と外部状態からの継続再構成"
status: draft_candidate
authority_status: awaiting_human_approval
version: "1.0"
candidate_layer: L3
owner_issue: 1610
plan_id: PLAN-L3-1610-conversation-lifetime-reconstruction
---

# 会話寿命管理と外部状態からの継続再構成の要件候補

## CLR-R01 再開必要情報の判定

目的、受入、未解決意図、判断理由と棄却案、未完作業、失敗仮説を、現在必要な本文、再取得可能な参照、
会話にしかない未保存情報、撤回・旧版、不明へ分類する。文書やdigestの存在だけで意味保存済みとせず、
重要情報が未保存または不明なら自動切替を保留する。

## CLR-R02 既存正本への保存

要求、判断、code、test、実行証跡、現在地は既存の責務所有先へ保存する。会話にしかない人間の意図は
出典付き原文または必要部分として、仮説・棄却理由は未確定情報として保持する。checkpointは論理作業、PLAN、
repo／branch／worktree／HEAD、未commit・未追跡変更、契約版、未完義務、実行中worker／CI／外部操作、証拠、
累積予算と失敗回数を必要範囲で束縛する派生viewとし、第二正本にしない。未承認意図を正式要求へ昇格しない。

## CLR-R03 再構成可能範囲の分離

必要情報の保存、後続consumerでの再取得、版・意味・未完義務の対応、安全な切替可能性が確認できたscopeだけを
次回以降のmodel inputから外す。会話原本、Git履歴、監査証拠の削除を意味せず、反復要約を正本にしない。

## CLR-R04 条件付き切替

安全なtask／工程境界、圧縮反復、再読込不能、旧指示混入、切替費用を評価し、現session継続、標準compact、
新session再構成を選ぶ。provider固有のcompact／resume／fork／new sessionを実測能力へ束縛し、
非対応・hook未発火・観測不能を成功扱いしない。

## CLR-R05 論理作業と累積制約の継承

safe point、save/read-after、旧writer停止またはhandover、successor再束縛、再構成確認の順を守る。
assignment、lease/fence、operation ID、author history、budget、deadline、retry、未完義務をsession切替で初期化せず、
同一branchの二重writerと二重副作用を防ぐ。新sessionを独立reviewer成立の根拠にしない。

## CLR-R06 最小restart packet

目的・受入・許容境界、対象状態、未解決意図・仮説、未完指摘、実行中処理、次候補と参照先を必要最小限で渡す。
上限超過時に必須情報を黙って切らず分割取得または切替保留へ送る。撤回claim、取消権限、secret、private reasoning、
他案件情報、作成側の結論誘導を混入させない。

## CLR-R07 品質・費用比較

同一task、HEAD、要求、provider／model／設定でlong history、標準compact、external reconstructionを隔離比較する。
意図・受入保持、成果品質、重大見逃し、失敗反復、再取得量、切替回数、token/cache、時間、保存・再構成を含む費用を
記録し、初期context減少だけで採用しない。結果はHELIX-Benchへ接続可能にする。

## CLR-R08 段階導入と責務境界

shadow再構成、無副作用復元、単一task境界、未commit・未追跡差分・長期実行の順に範囲を拡張する。既存continuation、memory、
supervisor、handover、provider capabilityを再利用し、新しいMemory DB、圧縮専用巨大Skill、別の配車・修復engineを作らない。
Skill、Rule導出、会話寿命を別要求・別受入・別完了状態として維持する。

## 導入順

#1608のversioning／invalidation／propagation authorityを先に正本化し、#1370、#873、#1448、#861、#1373の
既存ownerへ差分を接続する。候補承認、canonical昇格、#397 IR admission、runtime実装、operational enablementを別状態で追う。
