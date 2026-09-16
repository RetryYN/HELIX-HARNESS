---
title: "projection finding observability L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-03
updated: 2026-09-03
owner: QA / Codex TL
plan: docs/plans/PLAN-RECOVERY-96-projection-finding-observability.md
pair_artifact: docs/design/helix/L6-function-design/projection-finding-observability.md
related_l3: docs/design/helix/L3-requirements/system-synthesis-requirements.md
---

# projection finding observability L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PFO-001 | malformed green-command evidence | parse失敗を空projectionへせず、failure codeとsource pathを持つfindingへする | `tests/slow/projection-writer.test.ts` |
| U-PFO-002 | missing `plan_id` | PLAN rowを黙ってskipせず、missing identityをfindingとして記録する | `tests/slow/projection-writer.test.ts` |
| U-PFO-003 | model-run span collision | 異なるrunの同一spanが2行として保持され、namespace除去mutationを捕捉する | `tests/slow/projection-writer.test.ts` |
| U-PFO-004 | typed JSON parse result | malformed JSONを`null`の正常値として扱わず、parse errorを分離する | `tests/test-report-parser.test.ts`、`tests/projection-writer.test.ts` |
| U-PFO-005 | rebuild dependency order | upstream row不足・順序変更をrow-count/join invariantでredにする | `tests/slow/projection-writer.test.ts` |
| U-PFO-006 | drive registration reason | uninitialized、invalid input、internal errorをtyped reasonで区別する | `tests/drive-db-registration.test.ts` |
| U-PFO-007 | refactor candidate cache | source digest変更後に旧cacheを再利用せず、stale cacheをrejectする | `tests/requirements-binding-config.test.ts` |
| U-PFO-008 | metadata parse boundary | malformed metadataの失敗境界が契約どおりで、全rebuildの黙示成功を許さない | `tests/slow/projection-writer.test.ts` |
| U-PFO-009 | determinism / replay | 同値な入力順を変えた独立rebuildでもprojection／finding exact set digestが一致し、replay相当の結果になる | `tests/slow/projection-writer.test.ts` |

全テストは、実装が追加するfindingの存在だけでなく、黙示的success、衝突上書き、parse-error消失、依存順序mutationをredにする。
`#1397`のtransaction boundaryを変更するテストは本設計へ含めない。
