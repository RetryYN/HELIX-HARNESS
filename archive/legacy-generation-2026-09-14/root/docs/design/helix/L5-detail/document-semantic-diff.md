---
title: "HELIX L5 詳細設計 — 文書semantic diff"
layer: L5
kind: add-design
status: draft
created: 2026-07-14
updated: 2026-07-14
related_l6: docs/design/helix/L6-function-design/document-semantic-diff.md
pair_artifact: docs/test-design/helix/L9-document-semantic-diff-integration.md
---

# HELIX L5 詳細設計 — 文書semantic diff

## 境界

L6のread-only契約を、CLI、git revision adapter、filesystem snapshot adapter、任意artifact write portへ分離する。基準解決に失敗した時点でdiffやrelease noteの部分成功を返さず、構造化findingでfail-closeする。

## 結合不変条件

- CLI JSONとMarkdownは同一snapshot digest・finding集合を表す。
- `--out` は許可root外を拒否し、dry-runはDB/state/release/sourceを変更しない。
- historyなし変更はwarningのまま利用者へ可視化する。
