---
title: "HELIX L9 結合テスト設計 — 文書semantic diff"
layer: L9
artifact_type: test_design
status: draft
created: 2026-07-14
updated: 2026-07-14
pair_artifact: docs/design/helix/L5-detail/
---

# 文書semantic diff 結合oracle

| ID | Given / When | Then | 実装test |
|---|---|---|---|
| IT-DOCDIFF-001 | fixture git revisionとcurrent docsをCLI比較 | JSON/Markdownが同じsnapshot digestを示す | `tests/cli-surface.test.ts` |
| IT-DOCDIFF-002 | `--base`なし、未知revision、archive失敗 | 非zero、DB/state/release副作用0 | `tests/cli-surface.test.ts` |
| IT-DOCDIFF-003 | 明示`--out` / dry-run | 専用artifact root外・既存targetを拒否し、dry-run書込み0。成功時はdigest receiptを返す | `tests/cli-surface.test.ts` |
| IT-DOCDIFF-004 | 記録なき変更fixture | JSON/Markdownともwarning対象を隠さない | `tests/cli-surface.test.ts` |
