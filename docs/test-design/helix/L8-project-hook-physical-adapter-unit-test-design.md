---
title: "project hook physical adapter L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L7-652-project-hook-physical-adapter.md
pair_artifact: docs/design/helix/L6-function-design/project-hook-physical-adapter.md
---

# project hook physical adapter L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CNWHOOKPHYS-001 | physical capture | realpath、common-dir、device／inode、HEADの一件でも欠落したreceiptを作らない | `tests/project-hook-physical-adapter.test.ts` |
| U-CNWHOOKPHYS-002 | source separation | observed／current authority各3 fileを別々にread/hashし同一objectへ上書きしない | `tests/project-hook-physical-adapter.test.ts` |
| U-CNWHOOKPHYS-003 | platform boundary | WindowsをNode statでsameへ推測せずunsupported failure | `tests/project-hook-physical-adapter.test.ts` |
| U-CNWHOOKPHYS-004 | read-only | request mutation 0、Gitはrev-parseだけ、filesystem write 0 | `tests/project-hook-physical-adapter.test.ts` |
| U-CNWHOOKPHYS-005 | root separation | execution／loader／sessionを異なるrealpath・device・inodeで与えても各rootを独立captureし、execution値で補完しない | `tests/project-hook-physical-adapter.test.ts` |
| U-CNWHOOKPHYS-006 | native smoke | Linux／macOSの一時Git repoでnative realpath、common-dir、stat、HEADを実測し、mock greenだけで完了しない | `tests/project-hook-physical-adapter.test.ts` |
