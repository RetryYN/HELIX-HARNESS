---
title: "ルールの機械導出と診断・Help"
status: draft_candidate
authority_status: approved_pending_canonical_promotion
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1595#issuecomment-5562000124"
approved_revision: "2.0"
candidate_layer: L10
owner_issue: 1595
plan_id: PLAN-L3-1595-rule-derivation
---

# ルールの機械導出と診断・Helpの独立受入

各行は要件候補の同番号G-Rへ対応する。合格は実測証拠取得後に記録し、以下は未実行のoracle仕様である。

## G-AC01 ↔ G-R01

承認済み不変条件だけをHard対象にする。助言・文章量・設計選好で合法操作をblockしない。意図と実強制能力を分離し、未解決では既存保護を維持する。

## G-AC02 ↔ G-R02

同じversion・digestの入力から同じ検証器接続と説明を導出する。未登録検証器・自由文コード・説明の評価式実行を拒否し、第二Policy正本を作らない。

## G-AC03 ↔ G-R03

公開・破壊・権限外書込みを副作用前に阻止する。判定後にHEAD/権限/leaseを変えた反例も拒否する。各CLI/Hook/provider入口の実阻止と許可されたRED試作を独立実証する。

## G-AC04 ↔ G-R04

診断にcode・対象・観測/期待状態・根拠digest・検証器version・安全な候補を出す。詳細Helpは必要時取得し、契約変更で失効する。秘密・未信頼入力を安全表示し、整文による権限変更を拒否する。

## G-AC05 ↔ G-R05

原因種別ごとに既存Recoveryへ返し、反復予算を守る。Guard failure時も許可されたHelpを取得できる。修復候補から権限拡張・証跡捏造・他者変更削除はできない。

## G-AC06 ↔ G-R06

Rule単位のPolicy対応と移管を確認後、startup/Hook/setup/consumerを同じversion・digestへ揃える。目的・AC・今回制約を保持し、旧本文の再注入を拒否する。

## G-AC07 ↔ G-R07

SkillゼロでもGuardとHelpが成立する。Skill集合を変えても同一操作・状態・Policyの許可判定は不変。①との依存は対象/digest限定で全体blockしない。

## G-AC08 ↔ G-R08

一系統から導入し、生成テスト以外の反例・誤拒否・mutation・consumer E2Eで検証する。保護維持とrollback成立後に対象consumerだけ切り替える。

## 証拠契約

各結果へsource HEAD、入力と契約digest、実行command/result、独立review、consumer、比較条件、残課題を束縛する。
相手要求のgreenを本要求の代替証拠にしない。要求文書の整理だけでruntime成立・性能改善・退役完了を主張しない。
