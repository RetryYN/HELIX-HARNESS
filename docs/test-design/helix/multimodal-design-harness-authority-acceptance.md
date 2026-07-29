---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "Multi-modal Design HARNESS authority 受入テスト設計"
layer: L10
kind: test-design
status: confirmed
created: 2026-07-29
updated: 2026-07-29
owner: QA / 独立AI-B
plan: PLAN-L3-51-multimodal-design-harness-authority
parent_design: docs/design/helix/L3-requirements/multimodal-design-harness-authority.md
pair_artifact: docs/design/helix/L3-requirements/multimodal-design-harness-authority.md
---

# Multi-modal Design HARNESS authority 受入テスト設計

## §1 受入oracle

| AC ID | trace | 正常系oracle | 異常系oracle |
|---|---|---|---|
| `VDH-MM-AC-001` | §0 | Design HARNESSをstyle／case／layerと別軸の専門capabilityとして解決する | Scrum subtype、4番目style、独立V-model layerにしたらfail |
| `VDH-MM-AC-002` | R-01 | 7 modalityがexact setである | UIだけへ縮小、未知modalityを暗黙許可、unsupportedを欠落させたらfail |
| `VDH-MM-AC-003` | R-02 | 5 lifecycleがexact順序で遷移する | generator出力をcanonicalへ直書き、verifiedとapprovedを同一化したらfail |
| `VDH-MM-AC-004` | R-03 | Design IR envelope 14責務がexact setである | tool node ID、path、URIだけを意味主キーにしたらfail |
| `VDH-MM-AC-005` | R-04 | exchange specとtool adapterを別authorityで扱う | Figma、Penpot、Storybook、S3等をcanonical sourceにしたらfail |
| `VDH-MM-AC-006` | R-04 | concrete spec採用前にversion／license／mapping／round-tripを検証する | DTCG、glTF、Vega-Liteを調査ランキングだけで採用したらfail |
| `VDH-MM-AC-007` | R-05 | 8 verification domainがexact setである | visual greenだけでcomplete、N/A理由なし、別modality greenで相殺したらfail |
| `VDH-MM-AC-008` | R-06 | current HEADのartifact／oracle／review／approval／provenanceをatomic promotionへ渡す | stale、partial、別HEAD、自己承認、別path上書きを許したらfail |
| `VDH-MM-AC-009` | R-07 | 4 Reverse sourceをsource digestとconfidence付きcandidateへ正規化する | screenshot／ML出力をauthorityまたは自動canonicalにしたらfail |
| `VDH-MM-AC-010` | R-07 | deterministicとprobabilistic extractorを区別する | DOM／ASTとscreenshot推定を同じconfidence semanticsにしたらfail |
| `VDH-MM-AC-011` | R-08 | provenance sidecar、license、residency、credential、transmission policyを検査する | unknown rights、denied residency、cross-project assetを昇格したらfail |
| `VDH-MM-AC-012` | §2 | source path／digest／coverage ledgerを照合し、4 research dispositionへsource atomをexactly-once分類する | pathだけ、Issue本文だけ、opaque citation、tool順位、工数をcurrent採用証拠へしたらfail |
| `VDH-MM-AC-013` | §0 | #192と既存VDH 19要件をconsumerとして接続する | Design固有CASを複製、UI runtime分母を勝手に増減したらfail |
| `VDH-MM-AC-014` | §3 | L3/L10 pairと実装境界を分離する | schema、adapter、storage、ML実装を本PRへ混載したらfail |

## §2 完了境界

本pairはmulti-modal authorityをfreezeする。L4/L5設計、runtime、tool採用、verification execution、
production運用の完了を主張しない。
