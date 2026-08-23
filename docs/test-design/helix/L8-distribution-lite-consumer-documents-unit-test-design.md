---
title: "distribution Lite consumer配布文書単体・接合テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-23
updated: 2026-08-23
owner: QA / TL
plan: docs/plans/PLAN-L7-658-lite-consumer-distribution-docs.md
pair_artifact: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md
---

# distribution Lite consumer配布文書単体・接合テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DISTDOC-001 | document manifest | 5文書のpath／source／digest／区分をexact一致 | `tests/distribution-lite-documents.test.ts` |
| U-DISTDOC-002 | README projection | development READMEの無変換再出力を拒否しconsumer README bytesをarchiveで確認 | `tests/distribution-lite-documents.test.ts` |
| U-DISTDOC-003 | command admission | READMEの全HELIX commandがLite registryへadmit | `tests/distribution-lite-documents.test.ts` |
| U-DISTDOC-004 | missing document | 各文書欠落をarchive write前に拒否 | `tests/distribution-lite-documents.test.ts` |
| U-DISTDOC-004b | one-byte source mutation | 5文書を個別に1 byte削除し、古いsource HEADでの包装を`source_head_dirty`で拒否 | `tests/distribution-lite-documents.test.ts` |
| U-DISTDOC-005 | old identity／absolute path | 旧配布identity、個人absolute path、credential例を拒否 | `tests/distribution-lite-documents.test.ts` |
| U-DISTDOC-006 | canary receipt provenance | manifestと異なるdocument digestを渡したreceiptを`manifest_identity_mismatch`で拒否 | `tests/distribution-lite-consumer-canary.test.ts` |
| U-DISTDOC-007 | empty document | 5文書それぞれを空白bytesへ置換し`document_empty`で拒否 | `tests/distribution-lite-documents.test.ts` |
| U-DISTDOC-008 | distribution identity | 正規READMEから配布先identity tokenだけを除去し`consumer_readme_invalid`で拒否 | `tests/distribution-lite-documents.test.ts` |
| U-DISTDOC-009 | builder wiring | clean commit上の文書検証redをartifact生成前に`distribution_documents_invalid`で拒否 | `tests/distribution-lite-documents.test.ts` |
| U-DISTDOC-010 | runtime third-party input | esbuild metafileが`node_modules/` inputを申告した場合にartifact candidateを`distribution_documents_invalid`で拒否 | `tests/distribution-lite-runtime-third-party.test.ts` |

文書の存在だけでなく、archiveへ投影したbytesとmanifest digestを照合する。
