---
title: "HELIX L6 機能設計 — Python source atomization pure worker"
layer: L6
kind: add-design
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
plan: PLAN-L7-458-python-source-atomization-pure-worker
related_l6: docs/design/helix/L6-function-design/python-worker-runtime.md
pair_artifact: docs/test-design/helix/L8-python-source-atomization-contracts.md
requirements: [HR-FR-HIL-12, HAC-HIL-12a, HAC-HIL-12b, HAC-HIL-12c]
---

# Python source atomization pure worker

## 目的とauthority境界

closed capability `source_atomization.scrum_mode.v1` は、汎用worker runtimeから先行して検証するpure
proposal workerである。入力はinline Markdownだけとし、PythonへDB、repository、`.helix`、credential、
current stateのauthorityを渡さない。NodeはPythonのproposalを信用せず、atomとdigestを独立再導出する。

## oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PYATOM-001 | strict JSONLと決定性 | canonical proposal＋completeの2行以外を拒否し、同一入力を同一bytesへ固定する | `tests/source-atomization-scrum-worker.test.ts` |
| U-PYATOM-002 | authority境界 | DB／repository／`.helix`／state／credential fieldをNodeとPythonの双方で拒否する | `tests/source-atomization-scrum-worker.test.ts` |
| U-PYATOM-003 | 独立oracle | Node再原子化、lineage、count、digest、terminal framingの不一致をfail-closeする | `tests/source-atomization-scrum-worker.test.ts` |
| U-PYATOM-004 | defense-in-depth | Python audit hookが`socket.*`、`open`、`os.*`、`subprocess.*`等の監査eventを拒否する。audit eventを発火しないAPIや事前取得済みnative handleを含むsecurity sandboxの証明には使わない | `tests/source-atomization-scrum-worker.test.ts` |

## 非目標

generic broker、descriptor registry、lease/fence、DB staging/commit、terminal receipt、artifact publish、
active pointer、外部service接続は本sliceに含めない。OS-level sandboxによるfilesystem／network／child processの
default denyも後続brokerの責務であり、audit hookはその代替ではない。4 oracleのgreenをPython runtime全体の完了へ読み替えない。
