---
title: "distribution Lite profile manifest単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-21
updated: 2026-08-21
owner: QA / TL
plan: docs/plans/PLAN-L7-642-distribution-lite-profile-manifest.md
pair_artifact: docs/design/helix/L6-function-design/distribution-lite-profile-manifest.md
---

# distribution Lite profile manifest単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DISTLITE-001 | current profile | `consumer_core_v1`のidentity、authority、allowlist／exclusion exact set、digest、refinement束縛が一致する | `tests/distribution-profile.test.ts` |
| U-DISTLITE-002 | profile fail-close | duplicate、allow／exclude overlap、profile digest driftを個別failureとして拒否する | `tests/distribution-profile.test.ts` |
| U-DISTLITE-003 | refinement fail-close | Requirement IR refinementの欠落とdigest driftを個別failureとして拒否する | `tests/distribution-profile.test.ts` |

文字列の存在だけで合格にせず、loaderの戻り値とfailure codeを実測する。artifact path projectionは後続sliceで検証する。
