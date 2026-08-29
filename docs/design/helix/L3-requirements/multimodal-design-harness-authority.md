---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "Multi-modal Design HARNESS authority"
layer: L3
kind: add-design
status: confirmed
created: 2026-07-29
updated: 2026-07-29
owner: PM / TL / PO承認必須
plan: PLAN-L3-51-multimodal-design-harness-authority
parent_design: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/multimodal-design-harness-authority-acceptance.md
next_pair_freeze: L10
---

# Multi-modal Design HARNESS正本

## §0 authorityと既存責務

Design HARNESSは、特定のdesign toolまたはAI generatorではなく、設計candidate、canonical artifact、
検証、承認、来歴をL1〜L12へ接続する**専門capability**である。

- behavior contractは`VDH-MULTIMODAL-FR-001`だけとする。
- Vモデル、Production Scrum、V設計＋Scrum実装Hybridのdevelopment styleに含めない。
- Discovery／PoC等のcase-driven modelに含めず、選択済み経路上で必要時に発火する。
- 既存VDH-FR-001〜019はWeb／Mobile UIとfrontend traceのconsumerとして保持する。
- #192 Authoring Admissionのexactly-one promotion transactionを再実装しない。
- provider、tool、storage、model、IDEをconcept authorityにしない。

## §1 振る舞い契約

### VDH-MULTIMODAL-FR-001 tool-neutral Design IRとevidence promotion

HELIXは、複数modalityの設計をtool-neutralなDesign IR候補へ正規化し、current verification、
independent review、approval、provenanceを満たしたartifactだけをcanonicalへ昇格できなければならない。

#### VDH-MM-R-01 modalityの完全集合

```yaml
design_modalities:
  - web
  - mobile
  - game_ui
  - scene_3d
  - video_storyboard
  - chart
  - editor_doc
```

modality固有形式を共通IRへ潰さず、共通identity／trace／approval／evidence envelopeと
versioned modality profileを分離する。unsupported capabilityは黙って欠落させずdispositionを持つ。

#### VDH-MM-R-02 lifecycleの完全集合

```yaml
design_artifact_lifecycle:
  - candidate
  - verified
  - approved
  - canonical
  - deprecated
```

external generator、adapter、Reverse extractorの出力は常に`candidate`から開始する。
`verified`はoracle成立、`approved`は独立authorityの採否、`canonical`は#192のatomic admission、
`deprecated`はconsumer／replacement／retentionを持つ。状態を飛び越えない。

#### VDH-MM-R-03 Design IRの共通封筒

L4以降のDesign IRは、少なくとも次の責務を別fieldとして保持する。

```yaml
design_ir_envelope:
  - artifact_identity
  - requirement_trace
  - modality_profile
  - component_and_state
  - interaction
  - data_binding
  - responsive_and_environment
  - accessibility_contract
  - token_and_exchange_binding
  - asset_reference
  - provenance
  - verification_receipt
  - approval
  - release_binding
```

class名、file path、tool node ID、storage URIだけを意味主キーにしない。

#### VDH-MM-R-04 交換形式のauthority

- design tokenはtool-neutralなversioned token standardへ束縛する。
- 3D、chart、editor等はmodalityごとのopen exchange spec候補を持てる。
- Figma、Penpot、Sketch、Canva、Adobe、Storybook、game engine、storageはadapter／consumer候補であり、
  canonical authorityではない。
- DTCG、glTF、Vega-Lite等の具体採用は、一次情報、version、license、lossless/lossy mapping、
  unsupported field、round-trip evidenceをL4/L5でfreezeしてから行う。

#### VDH-MM-R-05 検証領域の完全集合

```yaml
design_verification_domains:
  - state
  - interaction
  - visual
  - accessibility
  - performance
  - localization
  - provenance_rights
  - distribution
```

visual一致だけでcompleteにしない。modality profileはapplicability、required oracle、N/A reason、
environment、baseline、threshold、manual review、stale条件を持つ。

#### VDH-MM-R-06 evidenceとpromotion

promotion inputはartifact revision／digest、requirement trace、verification exact set、independent review、
approval authority、provenance、policy、current HEAD、release bindingを持つ。
missing、stale、partial、別HEAD、自己承認、denied policyを平均点や別modalityのgreenで相殺しない。
candidateとcanonicalを同じpath／ID／statusで上書きしない。

#### VDH-MM-R-07 Reverse sourceの完全集合

```yaml
design_reverse_sources:
  - dom_runtime
  - component_ast
  - screenshot_frame
  - asset_metadata
```

Reverse出力はsource digest、extractor ID／version、confidence、deterministic／probabilistic区分、
uncertainty、findingを持つcandidateである。confidenceだけでcanonicalへ自動昇格しない。
OCR、CV、MLLM、screenshot-to-codeはproposal generatorであってauthorityではない。

#### VDH-MM-R-08 来歴／security／legal

- canonical、derived artifact、evidence、third-party送信dataを分類する。
- prompt／input／output digest、generator／model version、seed、変換履歴、license、権利、
  approval、公開先をsidecar receiptへ保持する。
- embedded metadata消失を前提にsidecar provenanceをauthorityと相互参照する。
- credential、OAuth delegation、API key、data residency、retention、network policyをadapter境界へ閉じる。
- third-party SaaSへの送信はdata classificationとaction-binding approvalに従う。
- unclassified license、unknown provenance、denied residency、cross-project assetをcanonicalへ昇格しない。

## §2 調査sourceの採否

### source束縛

```yaml
research_source:
  local_path: null
  retired_local_input: deep-research-report.md
  digest: sha256:a94aa99e0f22c40e75816beb46105b0c2f75173ccf430577df5355635f2dca39
  role: research_input
  source_snapshot: https://github.com/RetryYN/HELIX-HARNESS/issues/255#issuecomment-5108796110
  coverage_ledger: https://github.com/RetryYN/HELIX-HARNESS/issues/255#issuecomment-5108280627
  repository_coverage_ledger: docs/research/design-harness-deep-research-coverage-2026-07-29.md
  canonical_authority: false
```

source pathだけ、digestなしのIssue snapshotだけ、Issue本文だけ、opaque citation markerだけでは
同一内容の証拠にしない。
L3 reviewは原文digest、immutable snapshot、repo-owned coverage ledgerを照合し、各章のatomが
次のdispositionとdownstream ownerへ到達したことを確認する。

調査sourceのatomは次へexactly-once分類する。

```yaml
research_dispositions:
  - adopt
  - adapt
  - candidate_research
  - reject
```

architecture principleとauthority境界は`adopt`／`adapt`できる。toolランキング、製品機能、
version、license、pricing、工数は一次情報確認前は`candidate_research`であり、採用receiptにしない。
現行L1〜L12と3軸authorityに反する旧taxonomy、縮退route、禁止runtime、Design専用layerを
要求するatomは`reject`する。

## §3 非対象

- Design IR JSON Schema、adapter、registry、ledger、storage、runner、MLの実装。
- tool、provider、SaaS、model、open standardの最終採用。
- existing VDH 9 runtime sliceの実装または完成主張。
