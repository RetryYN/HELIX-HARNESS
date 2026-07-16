---
title: "HELIX L8 検証契約 — Python source atomization pure worker"
layer: L8
artifact_type: test_design
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: QA / TL
plan: PLAN-L7-458-python-source-atomization-pure-worker
design_slice: HDS-HIL-12
pair_artifact: docs/design/helix/L6-function-design/python-source-atomization-pure-worker.md
requirements: [HR-FR-HIL-12, HAC-HIL-12a, HAC-HIL-12b, HAC-HIL-12c]
---

# Python source atomization pure worker 検証契約

## 目的と境界

`source_atomization.scrum_mode.v1` を、汎用broker・DB commit・activationより先に検証できる
proposal-only workerとして固定する。入力はinline Markdownだけとし、PythonへDB path、repository、`.helix`、
credential、current stateを渡さない。NodeはPython出力を信用せず、atomとdigestを独立再導出する。

## oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PYATOM-001 | strict JSONLと決定性 | 1 requestからcanonical proposal＋completeの2行だけを返し、同一入力は同一bytesとなる | `tests/source-atomization-scrum-worker.test.ts` |
| U-PYATOM-002 | authority境界 | DB／repo／`.helix`／state／credential系fieldをNodeとPythonの双方が拒否する | `tests/source-atomization-scrum-worker.test.ts` |
| U-PYATOM-003 | 独立oracle | Node再原子化、lineage、atom count、全digest、terminal framingの不一致をfail-closeする | `tests/source-atomization-scrum-worker.test.ts` |
| U-PYATOM-004 | defense-in-depth | `socket.*`、`open`、代表的`os.*`、`subprocess.*`の監査eventを拒否する。`os.stat/getcwd`や事前取得済み`ctypes` native handleがaudit hookだけでは閉じないことを前提に、OS sandboxとは判定しない | `tests/source-atomization-scrum-worker.test.ts` |

## 合否

4/4 greenでもPython runtime全体、DB transaction、terminal receipt、HARNESS activationの完了とは扱わない。
本artifactが証明するのはpure proposal workerの限定境界だけである。
filesystem／network／child processのdefault denyは後続brokerのOS-level反例で別途証明する。
