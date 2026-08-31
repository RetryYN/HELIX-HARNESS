---
title: "HELIX-Bench task dataset単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L3
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-01
updated: 2026-09-01
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-719-helix-bench-task-dataset.md
parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md
pair_artifact: docs/design/helix/L6-function-design/helix-bench-task-dataset.md
github_issue_id: 1294
behavior_contract_id: HELIX-BENCH-DATASET-001
responsibility_owner: helix-bench-task-dataset
---

# HELIX-Bench task dataset単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-HBDATA-001 | snapshot exact set | 10 task、5カテゴリ、15-field exact setを正例とし、task数、カテゴリ、field set driftを拒否 | `tests/helix-bench-task-dataset.test.ts` |
| U-HBDATA-002 | fixture binding | fixture digest一致を正例とし、fixture欠落、内容driftを拒否 | `tests/helix-bench-task-dataset.test.ts` |
| U-HBDATA-003 | blind separation | public／hidden物理分離を正例とし、oracle欠落、非空negative mutation欠落、digest drift、field漏洩を拒否 | `tests/helix-bench-task-dataset.test.ts` |
| U-HBDATA-004 | history boundary | historical refs空を正例とし、過去scoreのcurrent証拠流用を拒否 | `tests/helix-bench-task-dataset.test.ts` |
| U-HBDATA-005 | external worker normalization | external worker候補を正例とし、provider名のauthority固定を拒否 | `tests/helix-bench-task-dataset.test.ts` |
| U-HBDATA-006 | initial denominator | 初期datasetの11件化、fixture／oracle件数driftを拒否しexact 10件を維持 | `tests/helix-bench-task-dataset.test.ts` |
| U-HBDATA-007 | typed field boundary | public taskおよび15-field snapshotのstring／boolean／array／record型driftを個別に拒否 | `tests/helix-bench-task-dataset.test.ts` |
| U-HBDATA-008 | nested registry boundary | malformed fixture／oracle entryを例外化せずtyped failureで拒否 | `tests/helix-bench-task-dataset.test.ts` |

datasetのgreenをrunner、scorer、provider採用、routing判断の完成証拠へ拡張しない。
