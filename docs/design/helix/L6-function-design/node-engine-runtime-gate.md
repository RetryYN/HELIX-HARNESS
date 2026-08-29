---
title: "実行中Node runtimeのengines適合gate"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-21
updated: 2026-08-29
owner: Claude / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
runtime_authority: docs/adr/ADR-009-node-python-linux-runtime.md
plan: docs/plans/PLAN-L7-643-node-engine-runtime-gate.md
pair_artifact: docs/test-design/helix/L8-node-engine-runtime-gate-unit-test-design.md
---

# 実行中Node runtimeのengines適合gate

## §背景

ADR-009はNode.js LTS範囲をruntime前提として定めており、`package.json`の`engines.node`が
その正本である。既存検査は次の2点を見ている。

- `runtime-portability`: `engines.node`が**宣言されている**こと（`package-missing-node-engine`）。
- `toolchain-pin`: `engines.node`が**具体semver range**であること（`node-engine-unpinned`）。

しかし**実行中のNodeがその範囲を満たすか**はどこも検査していない。結果として、範囲外のNodeで
ローカルgateを回してgreenと報告し、CI（範囲内）との差が静かに残る（Issue #660）。
ローカルとCIのgate結果が乖離した状態でevidenceを生成すると、そのevidenceは
「CIで再現する保証が無い測定値」になる。

## §責務境界

本gateは**実行中runtimeとengines宣言の適合だけ**を判定する。
宣言の有無・pin品質は既存gateの責務であり重複させない。ただし宣言が読めない場合に
「適合している」と扱うことは避け、fail-closeする。

## §oracle

- `U-NODEENG-001`: `engines.node`の範囲外runtimeを`node_engine_runtime_out_of_range`で拒否し、
  範囲内は通す。境界（下限のpatch-1、上限の等値）を含めて固定する。
- `U-NODEENG-002`: `engines.node`宣言が無い場合は`node_engine_declaration_missing`でfail-closeする。
- `U-NODEENG-003`: 解釈できないrange（`^` `~` `||` `x` 等）を「満たしている」と扱わず
  `node_engine_range_unsupported`で閉じる。runtime表記が壊れている場合も同様。
- `U-NODEENG-004`: version表記の省略形（`v24.15.0` / `24.15` / `24`）を正規化し、
  prerelease表記は受理しない。
- `U-NODEENG-005`: comparator列をAND連結として解釈し、演算子省略は完全一致として扱う。
- `U-NODEENG-006`: GitHub review receiptなど外部証拠writeの前にhard gateを実行し、範囲外runtimeでは
  warningではなく固有codeでthrowする。
- `U-NODEENG-007`: `pr-review-receipt`ではinput解析、GitHub read/write、receipt slot claim、DB projection
  より前にruntime authorityを検査し、部分証拠を残さない。

## §range解釈の範囲を狭く取る理由

`>=X.Y.Z <A`形式のAND連結だけを解釈し、それ以外はfail-closeする。
semver全機能を実装して解釈を誤るより、**解釈できないrangeを通さない**方を優先する。
検査対象を広げる必要が生じた場合は、対応するoracleを先に追加する。

## §境界

`engines.node`の値自体は変更しない。ローカル環境の修復手段（Node導入手順）も本sliceの範囲外とする。
doctorでは乖離を可視化し、外部証拠write commandでは同じ判定コアをhard preconditionとして使う。
doctorを先に手動実行したという申告でwrite boundaryの検査を省略してはならない。
