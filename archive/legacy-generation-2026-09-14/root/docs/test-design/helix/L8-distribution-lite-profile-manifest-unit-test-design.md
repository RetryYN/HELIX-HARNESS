---
title: "distribution Lite profile manifest単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
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
| U-DISTLITE-004 | freeze digest伝播 | Lite設計を登録したdesign catalogの実digestがG3 freeze packetとreviewed digestへ一致して伝播する | `tests/l3-g3-freeze-packet-v2.test.ts` |
| U-DISTLITE-005 | catalog parse fail-close | schema parse失敗と、file読込／JSON parse失敗の2経路をそれぞれ`catalog_invalid`で拒否する。正しいcatalogは同codeを出さない（過検知の否定）。設計`## 機能契約`が名指しするparse失敗境界のoracle束縛（Issue #882） | `tests/distribution-profile.test.ts` |

文字列の存在だけで合格にせず、loaderの戻り値とfailure codeを実測する。artifact path projectionは後続sliceで検証する。

## 検出力の実測（mutation、Issue #882）

| 変異 | 結果 |
|---|---|
| schema経路の`catalog_invalid`を別codeへ差し替える | U-DISTLITE-005 red |
| load経路の`catalog_invalid`を別codeへ差し替える | U-DISTLITE-005 red |
| `repoRoot`束縛を落として自repoのcatalogを読む | U-DISTLITE-005 red |
| JSON parse失敗を握りつぶし実catalogへ差し替える | U-DISTLITE-005 red |
| 読込失敗をschema不正なcatalogへ差し替える | survive（結果として`catalog_invalid`のままでfail-closeは保たれるため、oracleの欠落ではない） |
