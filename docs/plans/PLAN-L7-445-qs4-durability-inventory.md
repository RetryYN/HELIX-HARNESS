---
plan_id: PLAN-L7-445-qs4-durability-inventory
title: "PLAN-L7-445 (research): QS4 durability Vペア入口監査"
kind: research
layer: L7
drive: agent
status: draft
route_mode: research
entry_signals: ["po_directive:2026-07-13 /goal『抜け漏れを許さず検出力を強化』に基づきPLAN-L7-442 QS4-DURABILITY #29/#30をexact successorへ接続"]
created: 2026-07-13
updated: 2026-07-13
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "現状inventoryとVペア起票境界を確定するresearch。設計変更は後続L5/L6 PLANで判断する。"
agent_slots: [{ role: aim, slot_label: "AIM — durability threat境界" }, { role: se, slot_label: "SE — redaction/atomic write inventory" }, { role: qa, slot_label: "QA — crash/corruption oracle監査" }]
generates: [{ artifact_path: docs/plans/PLAN-L7-445-qs4-durability-inventory.md, artifact_type: markdown_doc }]
dependencies: { parent: docs/plans/PLAN-L7-442-quality-sweep-successor-clusters.md, requires: [] }
---
# PLAN-L7-445: QS4 durability Vペア入口監査
## 工程表
| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [直列] | #29 redacted cause digestの全writer/read pathを測定 | raw path/secret流出点と既存oracle一覧 |
| 2 | [直列] | #30 atomic state writeとcorrupt≠missing分岐を測定 | crash windowとrecovery route一覧 |
| 3 | [直列] | L5/L6 design PLANとL8/L9 pairを起票 | exact PLAN ID、parent、pair、oracle固定 |
| 4 | [review] | 独立reviewerがorphan 0を確認 | Blocker/High 0 |
## 完了条件
- #29/#30がexact design/impl PLANへ接続される。
- secret/path redaction、partial write、fsync/rename、corrupt recoveryのnegative oracleがある。
