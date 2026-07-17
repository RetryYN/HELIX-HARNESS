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

## §3.1 local artifactの出力

`--out` は任意 filesystem path ではなく、repository root 配下の HELIX 排他管理 root
`.helix/artifacts/document-diff/` からの canonical 相対pathだけを受け取る。絶対path、`..`、backslash、NUL、
symlink、既存 target、root 外への解決は fail-close とする。new-file-only のため既存 artifact の上書き・削除・
source Markdown の書換えは行わない。

専用 port は temp file (0600) → file fsync → same-directory atomic no-replace publish → temp unlink → directory fsync の順で
durable にpublishする。既存targetを上書きできる通常renameはnew-file-only契約に使用せず、競合時もfail-closeする。
publish後のdirectory fsyncまたはcontent再読込が失敗した場合は、receiptを返す前にoutputをcompensating removeし、
compensating unlink後のdirectory fsyncまで完了させる。補償自体が失敗した場合は
`document_report_compensation_ambiguous`で通常失敗と区別し、成功artifactとreceiptなしartifactを混在させない。
path と content digest と durable status だけを receipt へ返す。`--dry-run` は port を一切呼ばない。既存
`lint-artifact-write-port` と `document-agent-metadata-write-port` は所有root・authorization・更新契約が異なるため
直接再利用しない。tag、release、GitHub API、DB、runtime state、subprocess spawn はこの出力機能の非目標である。

## §4 実装降下

L7実装PLANは本書を`parent_design`、個別L8を`pair_artifact`にし、U-DOCDIFFとIT-DOCDIFFの実test pathを完全bindingする。自動公開・tag・release作成は本機能の非目標である。
