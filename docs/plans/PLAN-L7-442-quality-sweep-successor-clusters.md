---
plan_id: PLAN-L7-442-quality-sweep-successor-clusters
title: "PLAN-L7-442 (troubleshoot): quality sweep第4巡 successor cluster正式化"
kind: troubleshoot
layer: L7
drive: agent
status: draft
route_mode: incident
entry_signals:
  - "po_directive:2026-07-13 /goal『ハーネスメモリを確認しながら起票があれば潰す・抜け漏れを許さない』に基づき、PLAN-L7-433 annex敵対監査の採用carryをorphan化させず正式追跡する"
created: 2026-07-13
updated: 2026-07-13
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "本PLANは採用carryの追跡・分割境界だけを正式化し、要求/設計を変更しない。各clusterの実装前に個別PLANでL5/L6 backpropを判断する。"
agent_slots:
  - role: aim
    slot_label: "AIM — cluster優先度と高影響境界の妥当性判定"
  - role: se
    slot_label: "SE — inventory再測定とsuccessor Vペア起票"
  - role: qa
    slot_label: "QA — orphan carry 0とcluster重複/欠落の敵対検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-442-quality-sweep-successor-clusters.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires: []
  references:
    - docs/plans/PLAN-L7-433-quality-sweep4-improvements.md
---

# PLAN-L7-442: quality sweep successor cluster正式化

## 目的

`docs/reference/quality-sweep4-2026-07-12.md` §4で採用したcarryを、prose annexだけに残さず正式な
successorへ束ねる。本PLANはresearch/triageであり実装しない。各clusterはinventory再測定、L5/L6設計、
test-design oracle、個別impl/refactor PLANの順で降下する。一括big-bang変更は禁止する。

## cluster 登録表

| cluster | annex # | 優先度 | 設計入口 | impl起票条件 |
|---|---|---|---|---|
| QS4-GUARD | 18,20,32 | P0 | destructive grammar、override audit transaction、fail-close順序 | actor/tool/command threat modelとnegative oracle確定 |
| QS4-DURABILITY | 29,30 | P0 | `PLAN-L7-445-qs4-durability-inventory` | secret/path redactionとcrash recovery Vペア確定 |
| QS4-BOUNDARY | 11,13,15 | P1 | `PLAN-L7-446-qs4-boundary-inventory` | live graph baselineと禁止方向のL5確定。#14は既出`PLAN-L7-428` W2へ一意接続 |
| QS4-DOCTOR-CONTEXT | 1,2,3,4,8,9,10,22,24,25,26,28 | P1 | `PLAN-L7-447-qs4-doctor-context-inventory` | I/O/AST/program count benchmarkとpublic surface snapshot確定 |
| QS4-TEST-INFRA | 6,19,21 | P2 | `PLAN-L7-448-qs4-test-infra-inventory` | escaped syntax/cleanup/schema digest oracle確定 |

部分既出のannex #18/#22は既存実装を捨てず、残差だけをclusterへ入れる。既出解消7件と棄却2件は
本PLANの実装対象にしない。

## 工程表

| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [直列] | P0 clusterの現状inventoryとL5/L6設計を作る | QS4-GUARD / DURABILITYのVペアfreeze |
| 2 | [並列] | BOUNDARY / DOCTOR-CONTEXT / TEST-INFRAを独立測定 | 各benchmarkと設計判断記録 |
| 3 | [直列] | clusterごとにimpl/refactor PLANへ降下 | 全採用carryがexact PLAN IDへ接続 |
| 4 | [直列・review] | 別runtime/model familyがorphan carry 0を確認 | review evidence + PLAN lint green |

## 完了条件

- annex採用/部分既出23行すべてがclusterと後続exact PLAN IDへ接続される。
- 各実装PLANはparent design、pair artifact、oracle/test citationを持つ。
- P0完了前にP1/P2の高影響mutationを実行しない。
- release/tag/cutover/外部infraは本PLANの権限外とする。
