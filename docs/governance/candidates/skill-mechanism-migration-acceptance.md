---
title: "新Skill機構への責務移行"
status: draft_candidate
authority_status: approved_pending_canonical_promotion
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1594#issuecomment-5562000029"
approved_revision: "2.0"
candidate_layer: L10
owner_issue: 1594
plan_id: PLAN-L3-1594-skill-mechanism-migration
---

# 新Skill機構への責務移行の独立受入

各行は要件候補の同番号S-Rへ対応する。合格は実測証拠取得後に記録し、以下は未実行のoracle仕様である。

## S-AC01 ↔ S-R01

固定件数に依存せず、HEADに存在する対象の全件へowner・consumer・分類・処置またはunknownを記録する。複合責務と証拠不足を別扱いにする。

## S-AC02 ↔ S-R02

有効な短いJSONを受理する。unknown identity、未指定all、極性衝突、誤digest、Skillからの権限付与をそれぞれ拒否する。知識本文を必要時に取得できる。

## S-AC03 ↔ S-R03

scaffold・catalog・recommend・qualityの同一契約を検証する。1200字未満でも有効なら通し、未記入・参照不整合・旧identity再出力は拒否する。

## S-AC04 ↔ S-R04

適用と除外を推薦より先に評価し、role/task/Skillの重複注入を防ぐ。退役資産の通常推薦・setup再生成を拒否し、目的・AC・制約は残す。

## S-AC05 ↔ S-R05

無一致時の全文投入を上限付き参照・検索へ置換し、不足を明示する。Skillゼロでもmemory recallを維持し、取得内容から承認を生成しない。

## S-AC06 ↔ S-R06

recommended/injected/retrieved/outcomeを区別し、推定invocationを実取得へ昇格しない。HEAD・設定・測定法・期間付き同条件比較を行い、観測不能と少標本を明示する。

## S-AC07 ↔ S-R07

#322は固定60件backfillから対象全件の処置へ改訂する。Policy移管先の受領・実保護証拠がなければその項目の旧保護を維持し、他項目は独立進行できる。

## S-AC08 ↔ S-R08

1 familyで旧新比較後にconsumerを移す。物理削除にはcurrent consumerゼロ・能力保持または後継E2E・rollbackを要求し、履歴を保持する。②未完成でも①の独立受入が成立する。

## 証拠契約

各結果へsource HEAD、入力と契約digest、実行command/result、独立review、consumer、比較条件、残課題を束縛する。
相手要求のgreenを本要求の代替証拠にしない。要求文書の整理だけでruntime成立・性能改善・退役完了を主張しない。
