---
title: "会話寿命管理と外部状態からの継続再構成"
status: draft_candidate
authority_status: awaiting_human_approval
version: "1.0"
candidate_layer: L10
owner_issue: 1610
plan_id: PLAN-L3-1610-conversation-lifetime-reconstruction
---

# 会話寿命管理と外部状態からの継続再構成の受入候補

以下は未実行のoracle仕様であり、文書作成だけで合格を主張しない。

## CLR-AC01 ↔ CLR-R01 再開必要情報

未保存意図、不明な重要情報、壊れた参照、版混在を個別fixtureで検出し、自動切替を拒否して原状態を保全する。

## CLR-AC02 ↔ CLR-R02 保存とread-after

既存ownerへ保存した状態をread-afterし、checkpointが派生viewであること、未承認意図を正本化しないこと、
保存失敗やevent cursor不整合を完了扱いしないことを確認する。

## CLR-AC03 ↔ CLR-R03 再構成可能範囲

外部状態と必要な残余情報だけで旧会話全文なしに同じ受入を満たす。未保存の設計関係がある反例ではscopeを外さない。

## CLR-AC04 ↔ CLR-R04 実挙動による方式選択

compact、resume／fork、新sessionを実provider挙動で区別し、非対応、hook未発火、測定不能をgreenにしない。

## CLR-AC05 ↔ CLR-R05 継続identityと二重副作用防止

途中crash、重複通知、旧writer遅延を注入し、二重副作用が0であること、lease/fence、operation ID、budget、deadline、retry、
担当履歴、未完義務が切替を跨いで保持されること、新sessionが独立reviewへ誤昇格しないことを確認する。

## CLR-AC06 ↔ CLR-R06 restart packet境界

必要情報不足時は分割取得または保留となり、撤回claim、取消権限、secret、private reasoning、他案件情報、作成側私的文脈を拒否する。

## CLR-AC07 ↔ CLR-R07 比較受入

3方式を同一task／evidence setで比較し、品質、critical見逃し、retry、token/cache、時間、総費用、unknownを記録する。
provider更新時に同じbenchmarkを再測定できる。

## CLR-AC08 ↔ CLR-R08 段階導入

shadow、無副作用復元、単一task切替、未commit・長期処理を順に実証し、既存保護を迂回しない。
生成・保存・受信・利用・検証・operational enablementを別状態で報告する。

## 共通証拠

source HEAD、契約digest、assignment／lease、checkpointとevent cursor、実行command/result、exact-HEAD独立review、
consumer read-after、rollback結果を束縛する。mandatory regressionとrelease/cutover approval境界を弱めない。
