---
title: "workflow execution routing consumer機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
plan: docs/plans/PLAN-L7-566-workflow-execution-routing-consumer.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-routing-consumer-runtime-unit-test-design.md
---

# workflow execution routing consumer機能設計

## 責務

観測signalをrequirements由来typed classificationへ変換した後にだけ、generated execution policyを
解決する。入力はsignal、execution form、4個のexact booleanであり、signalからstyle、execution form、
risk conditionを推測しない。

公開CLIの入力は上記runtime inputだけとする。分類ambiguity／policy ambiguityのdeterministic oracle用に
第2引数へcontract pairを注入できるが、catalog／projectionの各strict schemaで再検証してから使用し、
未検証objectをrouting receiptへ流さない。このseamはCLI optionへ投影しない。

## 出力契約

receiptはclassification／policy registry version、requirements／classification／policy digest、typed
identity、registered policy ID、exact disposition、requirements定義のexit class/codeだけを返す。
未解決fieldは`null`とし、旧mode／model／catalog identity、program／argv／raw commandを出力しない。

- `U-WFEXROUTE-001`: exact classificationとpolicyを`resolved`へ損失なく接続する。
- `U-WFEXROUTE-002`: unknown／decision待ち／ambiguityをexact classification dispositionへ写像する。
- `U-WFEXROUTE-003`: binding欠落または条件未登録を`policy_unsupported`で閉じる。
- `U-WFEXROUTE-004`: approval policy対象はinvocationを出さず`approval_required`で閉じる。
- `U-WFEXROUTE-005`: design／test design登録をG3 freeze digestへ伝播する。

command execution、approval receipt検証、CLI／DB projection、legacy adapterは別transaction境界とする。
