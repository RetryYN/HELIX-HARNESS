---
title: "workflow execution routing CLI機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
plan: docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-routing-cli-runtime-unit-test-design.md
---

# workflow execution routing CLI機能設計

## 責務

`helix route eval`をcurrent typed routing consumerへ接続する。signal、execution form、4個のrisk conditionを
個別入力として受け、execution formとboolean setの省略・未知値をconsumer呼出前にexit 2で拒否する。

## 出力・監査契約

JSONはstrict routing receiptだけを返す。textは同じreceipt fieldをkey/value表示し、commandを再構成しない。
approval required時のaudit eventもtyped receiptを埋め込み、旧mode／model／catalog identity、program／argv、
raw command、recommended commandを保存しない。

classification registry／policy projectionの読込・digest検証失敗はreceipt生成前のcontract admission failureである。
requirementsの7 dispositionへ推測変換せず、stdoutとauditを生成しないままexit 1でfail-closeする。

- `U-WFEXCLI-001`: pair-cell signalをtyped identity／registered command IDへ解決する。
- `U-WFEXCLI-002`: policy由来action stageを返しraw commandを出力しない。
- `U-WFEXCLI-003`: execution formまたは4 boolean不足をexit 2で拒否する。
- `U-WFEXCLI-004`: approval audit eventへlegacy identity／raw invocationを保存しない。
- `U-WFEXCLI-005`: design／test design登録をG3 freeze digestへ伝播する。
- `U-WFEXCLI-006`: authority contract読込失敗をtyped dispositionへ偽装せずreceipt生成前に拒否する。

旧route-map入力はcurrent CLIから外し、後続input-only compatibility adapterでのみ扱う。
