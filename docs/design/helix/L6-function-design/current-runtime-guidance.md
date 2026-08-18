---
title: "current runtime command guidance境界"
layer: L6
artifact_type: design
status: draft
created: 2026-08-18
updated: 2026-08-18
owner: Codex / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
runtime_authority: docs/adr/ADR-009-node-python-linux-runtime.md
plan: docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md
pair_artifact: docs/test-design/helix/L8-current-runtime-guidance-test-design.md
---

# current runtime command guidance境界

## 目的

現行の人間向け設計／process文書が、実行可能なNode.js 24＋npmのsource checkoutまたはbuilt artifactを
案内する境界を定義する。これはruntimeの実装を変更するsliceではなく、実行例のauthorityを一つへ
再接着する文書adapterである。

## 契約

- source checkoutでは`npm run helix -- <command>`または`npm run <script>`を使用する。
- distribution smokeでは`npm run build`と`node ./dist/helix.js <command>`を使用する。
- `bun`、`bun run`、`bun test`をcurrent commandとして出力しない。
- historical／migrationのBun記録はこのcurrent guidance contractの入力にしない。

## 非対象

runtime実装、CLIのfield／schema、requirements registry、legacy adapter、配布cutoverは後続の原子sliceで
扱う。文書のcommand表記を変えても、実際の外部副作用やrelease操作は発生させない。
