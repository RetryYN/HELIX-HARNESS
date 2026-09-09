---
title: "Skill／Agent／Command Surface価値・置換・authority整理要求候補"
layer: L1
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
related_issue: 1382
plan_id: PLAN-L3-1382-surface-value-rationalization
pair_artifact: docs/governance/candidates/surface-value-rationalization-acceptance.md
---

# Skill／Agent／Command Surface価値・置換・authority整理要求候補

## SVR-BR-001 利用者価値

HELIXは、Skill／Agent／Command／Rule／Knowledgeの各surfaceを、名称や利用回数だけでなく、実際の効果、
context負担、consumer、後継能力、state／admission authorityで評価する。価値ある能力を失わず、重複した制御責務と
旧epochの通常経路への再生成を段階的に減らす。

## 責務境界

- #1382はsurfaceの価値評価、exactly-one分類、処置候補と後継契約への接続を所有する。
- #1372は全surface inventory、lifecycle、consumer／reverse reference graphを所有する。
- #1594は新Skill機構への移行と必要な能力供給を所有する。
- #863はobsolete control-plane ledger、#865はconsumer移行後のretirement gateを所有する。
- #397はcanonical main read-after後のRequirement IR classification／admissionを所有する。

本候補は上記ownerを置換せず、別ledger、別Skill IR、別retirement engineを作らない。

## authority境界

本書はIssue #1382をL1／L3／L10候補へmaterializeするsource候補であり、current runtime authorityではない。
独立技術review、plan固有L3承認、canonical promotion、main read-after、#397 Requirement IR admissionを経るまで、
runtime、setup、template、CLI、Guard、DB、generated current view、削除判断へ投影しない。

## 非対象

- runtime surfaceの削除、旧保護解除、consumer migration、provider設定変更
- provider-native内部reviewの独立review receipt／merge admissionへの昇格
- modelが強い、古い、未使用という主観だけによるREMOVE
- historical evidenceの改変、compatibility inputのcurrent outputへの再生成
