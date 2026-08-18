---
title: "typed workflow guide生成・bounded dynamic injection単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-19
updated: 2026-08-19
owner: QA / TL
plan: docs/plans/PLAN-L7-635-workflow-guide-dynamic-injection.md
pair_artifact: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md
---

# typed workflow guide生成・bounded dynamic injection単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFGUIDE-001 | guide projection | workflow_model identity、authority tuple、phase、gate、digestを出力 | `tests/workflow-guide.test.ts` |
| U-WFGUIDE-002 | current output | mode、model、共通route identity、legacy routeが出力されたらred | `tests/workflow-guide.test.ts` |
| U-WFGUIDE-003 | axis separation | development_style identityをworkflowとして受理したらred | `tests/workflow-guide.test.ts` |
| U-WFGUIDE-004 | specialist drive | `scrum`等のworkflow語を`--drive`で受理したらred | `tests/workflow-guide.test.ts` |
| U-WFGUIDE-005 | signal binding | mismatch、decision待ち、曖昧signalを推測したらred | `tests/workflow-guide.test.ts` |
| U-WFGUIDE-006 | exact set | registryの全workflow_model identityにguideが生成されない場合red | `tests/workflow-guide.test.ts` |
| U-WFGUIDE-007 | bounded surface | 選択外workflowをtext surfaceへ混入したらred | `tests/workflow-guide.test.ts` |

registryまたはcatalogのstale化はloaderのdigest検査でfail-closeし、legacy側のgreenでcanonical側の失敗を相殺しない。
