---
title: "Cursor Cloud Agent environment admission単体テスト設計"
layer: L8
kind: recovery
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: QA / Security
parent_design: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md
pair_artifact: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md
---

# Cursor Cloud Agent environment admission単体テスト設計

| Oracle | 正常系 | 反例 |
|---|---|---|
| U-CURSOR-ENV-001 | environment.jsonがrepo-owned Dockerfileとinstall scriptをexact選択 | snapshot-only、Dockerfile欠落、別scriptを拒否 |
| U-CURSOR-ENV-002 | Node 24.20.0 imageとmanifest digestをexact固定 | tag-only、wrong digest、別majorを拒否 |
| U-CURSOR-ENV-003 | Node範囲再検証後にfrozen installと検証列を実行 | range check、`npm ci`、typecheck、build、test、statusの各欠落を拒否 |
| U-CURSOR-ENV-004 | repo内writeだけでBuildする | curl／wget／nvm、host-global path、`/tmp`、`|| true`、warning fallbackを拒否 |

mutationではimage digest一桁変更、Node下限削除、`npm ci`から`npm install`への縮退、host shim再導入、fail-open追加を
個別に投入し、各反例が独立してredになることを確認する。
