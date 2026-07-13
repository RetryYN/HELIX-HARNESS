---
title: "HELIX L6 機能設計 — 文書semantic diff"
layer: L6
kind: add-design
status: draft
created: 2026-07-14
updated: 2026-07-14
owner: Codex / TL
related_l12: docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
pair_artifact: docs/test-design/helix/L8-document-semantic-diff-contracts.md
related_l9: docs/test-design/helix/L9-document-semantic-diff-integration.md
---

# HELIX L6 機能設計 — 文書semantic diff

## §1 目的と境界

ZIP正本 `tools/diff_report.py` の二時点文書比較を、TypeScript/Bunのread-only機能として移植する。
入力は明示した基準snapshot（git revisionまたはread-only docs root）と現在snapshotだけであり、PLAN状態、harness.db、tag、release、GitHub releaseを変更しない。

## §2 契約

`src/runtime/document-semantic-diff.ts` は二つの `DocumentSnapshot` から、canonical相対path、content digest、typed declaration ID、見出し、表行量、改版履歴を比較し、次を決定論的に返す。

- 文書・definition ID・改版履歴の追加/削除
- 見出し単位の変更と表行数変化
- 本文変更があるのに改版履歴が増えない `unrecorded_change`
- parse/path/duplicate/encoding失敗の fail-close finding

`src/runtime/document-change-report.ts` は差分から日本語Markdown/JSON reportとrelease noteを投影する。historyの構造化categoryを優先し、未分類を捨てず「その他」に残す。`unrecorded_change`を「変更なし」に変換してはならない。

## §3 安全不変条件

- `--base` 不在、未知revision、不正path、symlink escape、YAML/Markdown解析不能は `ok=false` で終了する。
- git基準解決は引数固定のprocess adapter、revision形式検査、timeout、一時dir cleanupを用いる。shell文字列を組まない。
- outputはstdoutのみを既定とする。`--out` は明示artifact write portと許可rootを要求し、dry-runは書込み0件である。
- source本文・secret・provider payloadをreportへ転載しない。digestと構造化finding provenanceだけを残す。

## §4 実装降下

L7実装PLANは本書を`parent_design`、個別L8を`pair_artifact`にし、U-DOCDIFFとIT-DOCDIFFの実test pathを完全bindingする。自動公開・tag・release作成は本機能の非目標である。
