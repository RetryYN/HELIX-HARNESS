---
title: "HELIX L8 単体テスト設計 — 文書semantic diff"
layer: L8
artifact_type: test_design
status: draft
created: 2026-07-14
updated: 2026-07-14
pair_artifact: docs/design/helix/L6-function-design/document-semantic-diff.md
---

# 文書semantic diff 単体oracle

| ID | oracle | 期待結果 | 実装test |
|---|---|---|---|
| U-DOCDIFF-001 | 同一snapshot | empty delta、stable digest | `tests/document-semantic-diff.test.ts` |
| U-DOCDIFF-002 | 文書/ID追加削除 | canonical順の構造化delta | `tests/document-semantic-diff.test.ts` |
| U-DOCDIFF-003 | 見出し・表・history差分 | 意味単位を混同しない | `tests/document-semantic-diff.test.ts` |
| U-DOCDIFF-004 | 本文変更のみ | `unrecorded_change` warningを必ず出す | `tests/document-semantic-diff.test.ts` |
| U-DOCDIFF-005 | history category | 日本語note、未分類保持 | `tests/document-change-report.test.ts` |
| U-DOCDIFF-006 | 不正基準/path/重複/parse failure | fail-close | `tests/document-semantic-diff.test.ts` |
| U-DOCDIFF-007 | input順/改行/NFC | 同一の決定論的結果 | `tests/document-semantic-diff.test.ts` |
| U-DOCDIFF-008 | local artifact port | canonical相対path・専用root・new-file-only・symlink/traversal/digest/atomic publishを強制し、dry-runはwrite 0 | `tests/document-report-write-port.test.ts` |
| IT-DOCDIFF-003 | CLI artifact output | 専用root外・既存targetを拒否し、dry-runはwrite 0 | `tests/cli-surface.test.ts` |
