---
title: "指示経路の変更耐性と更新・縮退追従"
status: draft_candidate
authority_status: awaiting_human_approval
version: "1.0"
candidate_layer: L10
owner_issue: 1608
plan_id: PLAN-L3-1608-instruction-path-change-resilience
---

# 指示経路の変更耐性と更新・縮退追従の受入候補

以下は未実行のoracle仕様であり、文書作成だけで合格を主張しない。

## IPC-AC01 ↔ IPC-R01 責務分離

意味正本、適用判断、Skill、adapter、consumerのownerを分離し、Skillゼロでもmandatory Guardが成立する。

## IPC-AC02 ↔ IPC-R02 導出と来歴

wrong obligation、source/generator/output digest、HEAD、provider/model/version/call formを個別に拒否し、
正しいprovenanceをread-afterで再現する。

## IPC-AC03 ↔ IPC-R03 影響解析

正本一か所の変更から必要出力だけを更新する。不要出力を再生成せず、影響不明を`unknown`として検証拡大または保留へ送る。

## IPC-AC04 ↔ IPC-R04 実行単位の版固定

互換更新、意味変更、権限取消を別fixtureで検証し、権限取消が次の副作用前に効くこと、継続状態が暗黙resetされないことを確認する。

## IPC-AC05 ↔ IPC-R05 原子的更新と復元

partial applicationと旧新混在を拒否する。中断・rollback後にretired outputや取消済み権限がcurrent consumerへ再出現しない。

## IPC-AC06 ↔ IPC-R06 有効化状態の分離

generated/distributed/loaded/behavior_verified/operationally_appliedを別々に観測し、生成済みだが未読込の反例をgreenにしない。

## IPC-AC07 ↔ IPC-R07 再読込不能経路

再読込不能providerでsafe-point、保存/read-after、旧session停止、successor再束縛、再取得を実測し、旧指示・撤回claim・secretの持越しを拒否する。

## IPC-AC08 ↔ IPC-R08 提供元差と縮退

合法なprovider差を許容しつつunsupported、wrong adapter/version、load unknownをfail-closeまたは明示DEGRADEDにする。
SkillとRuleの一方のgreenを他方の完成証拠にしない。

## 共通証拠

source HEAD、契約digest、実行command/result、exact-HEAD独立review、consumer read-after、rollback結果を束縛する。
mandatory regression、release/cutover approval境界を弱めない。
