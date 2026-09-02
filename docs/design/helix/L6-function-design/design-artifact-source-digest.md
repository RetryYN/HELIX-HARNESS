---
title: "設計書artifact_path source_digest照合関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-09-03
updated: 2026-09-03
owner: SE
plan: docs/plans/PLAN-RECOVERY-95-design-artifact-source-digest-gate.md
parent_design: docs/design/helix/L6-function-design/design-reality-binding.md
pair_artifact: docs/test-design/helix/L8-design-artifact-source-digest-unit-test-design.md
behavior_contract_id: DESIGN-ARTIFACT-SOURCE-DIGEST-DRIFT-001
responsibility_owner: design-artifact-source-digest
---

# 設計書artifact_path source_digest照合関数設計

設計実在性projectionの `existing_runtime` / `current_authority: true` assetを、
`artifact_path` の実ファイルbyte digestへ束縛する。既存のDesign Reality marker/schemaと
`sha256Digest`を再利用し、別のdesign manifestやDBを追加しない。

`config/design-artifact-source-digest-baseline.json` は、既存の既知stale pinだけを一時的に
可視化する。baselineに無い新規drift、欠落target、repo外target、不正digestはfail-closeする。
既知debtの修正時はbaseline entryを削除し、baselineを増やしてgateを回避してはならない。

| 関数 | 契約 | failure |
|---|---|---|
| `loadDesignArtifactSourceDigestBaseline` | baseline schema／canonical digest／初期allowlistを検証 | schema不正、digest不一致、baseline拡張 |
| `analyzeDesignArtifactSourceDigest` | 全current design bindingを再帰走査し、実ファイルbyte digestと照合 | 新規drift、target欠落、unsafe path、repo外参照 |
| `designArtifactSourceDigestMessages` | doctorへpins、stale、baseline debtを正確に投影 | findingの抑制・成功偽装をしない |

既知baseline debtは `baseline_debt` としてdoctorへ表示するが、構造的なfailureを隠すものではない。
baselineは初期6 fingerprintのsubsetに限り、同じ設計書・artifactでも別の誤digestを追加できない。
source変更時の更新責務は、そのsourceをpinする全設計書を同一PRで更新することとする。
