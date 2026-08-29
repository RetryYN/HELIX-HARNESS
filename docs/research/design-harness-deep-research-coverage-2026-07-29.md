---
title: "Design HARNESS deep research source coverage"
status: confirmed
created: 2026-07-29
updated: 2026-07-29
owner: PM / TL
plan: PLAN-L3-51-multimodal-design-harness-authority
source_role: research_input_coverage
canonical_authority: false
---

# Design HARNESS深掘り調査source coverage

## 1. source束縛

```yaml
source:
  local_path: null
  retired_local_input: deep-research-report.md
  line_count: 620
  byte_count: 49243
  digest: sha256:a94aa99e0f22c40e75816beb46105b0c2f75173ccf430577df5355635f2dca39
  immutable_snapshot: https://github.com/RetryYN/HELIX-HARNESS/issues/255#issuecomment-5108796110
  snapshot_payload_match: exact_first_49243_bytes
  snapshot_wrapper_difference: details_header_and_terminal_newline_only
```

このledgerは調査原文を正本化しない。原文の設計atomを欠落させず、現行L1〜L12へ降下する先、
追加調査が必要な候補、棄却理由をrepo内で監査可能にする。
immutable snapshotはGitHub comment本文全体のdigestではなく、`<details>`内payloadの先頭49,243 bytesを
原文とbyte比較し、原文digestと一致することを確認した。包装文とpayload末尾にGitHub comment用の改行を
加えた差だけを許可し、章名・要約・抜粋だけのsnapshotを全量取得証拠にしない。
rootのlocal inputはIssue #1195で退役し、以後は上記immutable snapshot、digest、本ledgerを再検証境界とする。

## 2. 全章coverage

### 2.1 原文H2見出しのexact mapping

| 原文H2見出し | 開始行 | 終了行 | semantic unit |
|---|---:|---:|---|
| エグゼクティブサマリー | 3 | 12 | Executive Summary |
| エコシステム棚卸しと比較表 | 13 | 75 | Ecosystem inventory and comparison |
| Design IR | 76 | 438 | Design IR関連: ER model; JSON Schema skeleton; Multi-modality YAML examples; candidate/canonical separation |
| 検証スイート | 439 | 457 | Verification suite |
| Reverse pipeline | 458 | 491 | Reverse pipeline（原文と同名） |
| HELIXアダプタアーキテクチャとロードマップ | 492 | 581 | Adapter architecture; Concrete repository/storage layout; Roadmap and person-month estimates |
| セキュリティ・ライセンス・データレジデンシー・IP | 582 | 591 | Security/license/residency/IP |
| 推奨採用順序 | 592 | 620 | Recommended adoption order |

原文H2見出しは上記8件をexact setとし、開始行は原文の実見出し行、終了行は次見出しの直前またはEOFである。
1章を複数semantic unitへ分解できるが、原文見出しの欠落、重複、未定義unit、行範囲の空白／重複を許可しない。

### 2.2 semantic unitへの分解

| sourceの章 | 採否 | 現行の降下先 | 下流の完了条件 |
|---|---|---|---|
| Executive Summary | adapt | L3 multi-modal authority | architecture principleと製品・実装候補を分離 |
| Ecosystem inventory and comparison | candidate_research | L4 adapter option inventory | 一次情報、version、license、data policy、benchmarkを再確認 |
| Design IR ER model | adapt | L4 component/data relation | identity、ownership、cardinality、transaction、stale境界をfreeze |
| Design IR JSON Schema skeleton | adapt | L5 detail contract | required/optional、version、migration、negative fixtureをfreeze |
| Multi-modality YAML examples | adapt | L5 modality fixtures | 7 modality profileへ変換し、lossy／unsupported fieldを明示 |
| candidate/canonical separation | adopt | L3 lifecycle/promotion | #192 atomic admissionへ接続し、直canonicalを拒否 |
| Verification suite | adapt | L10 acceptance、L8/L9 execution design | 8 domainのapplicability、oracle、threshold、N/A、stale条件をfreeze |
| Reverse pipeline | adapt | Reverse contract | 4 source、digest、extractor、confidence、uncertainty、reviewをfreeze |
| Adapter architecture | adapt | L4 boundary/data flow | provider-neutral I/F、credential、retry、idempotency、promotionをfreeze |
| Concrete repository/storage layout | candidate_research | L4 option decision | Git/object storage等を比較し、vendorをauthorityにしない |
| Roadmap and person-month estimates | candidate_research | dependency frontier | 暦・工数を正本化せずcapacity、dependency、exit criteriaへ再計画 |
| Security/license/residency/IP | adapt | L3 promotion boundary、L4 security boundary | classification、transmission approval、SBOM、rights、residencyをfreeze |
| Recommended adoption order | candidate_research | L4 technology option inventory | rankingを採用receiptにせずfit、cost、risk、benchmarkで再評価 |

`adopt`と`adapt`は、記載したdownstream artifactと対応する右腕oracleがfreezeされるまで
「設計取り込み完了」と数えない。`candidate_research`は未採用であり、棄却ともみなさない。

## 3. 設計atom降下台帳

| atom family | L3で固定する境界 | L4/L5で固定する設計 | 右腕で必要な証拠 |
|---|---|---|---|
| modality | 7種のexact setとprofile分離 | modality capability、required/optional、exchange mapping | positive/negative fixture、round-trip、unsupported判定 |
| lifecycle | candidate→verified→approved→canonical→deprecated | transition、authority、consumer、retention、rollback | 状態飛越し・自己承認・別HEAD・直上書き拒否 |
| Design IR | 14責務のenvelope | entity、field、cardinality、identity、version、migration | schema validation、orphan 0、lossy mapping検出 |
| component/state/interaction | tool IDを意味主キーにしない | state machine、event、condition、transition、error | state/interaction oracleとunreachable state検出 |
| data/responsive/a11y | 独立責務として保持 | binding、viewport/environment、WCAG/profile contract | real-data、responsive、a11yの正負証拠 |
| token/exchange/asset | tool非依存authority | version付きtoken/spec、asset relation、round-trip policy | version／license／mapping／asset integrity |
| verification | 8 domain exact set | applicability、threshold、baseline、manual review、stale | domain別receipt。平均点や他modality greenで相殺しない |
| Reverse | 4 source exact set | extractor contract、confidence semantics、uncertainty/finding | deterministic/probabilistic分離、人間/policy gate |
| adapter | provider/tool非authority | port、capability negotiation、retry、idempotency、rate/error | contract test、failure injection、credential非漏洩 |
| storage/registry/ledger | candidate/canonical分離 | object/version/lineage、atomic promotion、rebuild projection | digest、transaction、rebuild convergence、rollback |
| provenance/legal/security | unknownを昇格しない | sidecar schema、classification、license、rights、residency | policy denial、cross-project拒否、transmission approval |
| operation | canonical後も観測対象 | SLO、drift、retention、deprecation、incident/re-entry | telemetry、stale detection、consumer 0、replacement証拠 |

## 4. modality fixtureのcoverage

原文のWeb、Mobile、Game UI、3D Scene、Video Storyboard、Chartの例はL5 fixture inputとして保持する。
`editor_doc`は原文のエディタ／文書統合要件からprofile化するが、原文に同粒度の完全fixtureがないため、
既存6例からの無断推測で埋めず、L5でpositive/negative fixtureを新規設計する。

## 5. 完了条件

```text
source_coverage_closed =
  source_digest_matches
  AND source_sections_exactly_once
  AND design_atom_families_exactly_once
  AND every_adopt_or_adapt_has_downstream_owner
  AND every_candidate_research_has_reverification_route
  AND rejected_atom_has_reason
```

このledgerの存在だけではL4/L5設計完了を主張しない。対応する設計、右腕oracle、current HEAD receiptが
成立した時点で各行をclosedへ遷移する。
