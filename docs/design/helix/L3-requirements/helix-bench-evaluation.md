---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "HELIX-Bench 評価契約"
layer: L3
kind: add-design
status: draft
created: 2026-07-29
updated: 2026-07-29
owner: PM / TL / PO承認必須
plan: PLAN-L3-49-helix-bench-evaluation
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/helix-bench-evaluation-acceptance.md
next_pair_freeze: L10
---

# HELIX-Bench 評価契約

## §0 authorityと責務境界

HELIX-Benchは、単体modelのcoding能力ではなく、HELIXが管理する**組織編成と実行規律が、
要求からaccepted changeまでをどれだけ正確、安全、低費用に完遂できるか**を比較する評価契約である。

- behavior contractは`HELIX-BENCH-FR-001`だけとする。
- 既存`HR-FR-HIL-22`／`WCC-FR-07`〜`WCC-FR-08`はworker admission用の下位benchである。
  HELIX-Benchはそれを重複実装せず、system／team／harness profile比較の入力receiptとして再利用する。
- 開発上のdevelopment style、case-driven model、specialist capability、runtime mode、team composition、
  harness profileを別axisとして保持する。
- provider名、model名、IDE名を必須enumにせず、version付きrun inputとして記録する。
- benchmark runner、dataset、dashboard、provider接続、worker admission判断はL4以降で設計し、
  本L3/L10 pairでは実装しない。

## §1 振る舞い契約

### HELIX-BENCH-FR-001 再現可能なHELIX実行編成比較

HELIXは、同一task snapshotを複数のteam compositionとharness profileで反復実行し、要求束縛、
設計trace、scope統制、review収束、accepted change単位のcapacity／costを、特定providerやHELIX自身を
優遇しないversioned scorerで比較できなければならない。

#### HELIX-BENCH-R-01 評価カテゴリ

```yaml
benchmark_categories:
  - Requirement Binding
  - Design Trace
  - Controlled Implementation
  - Review Convergence
  - Cost & Capacity
```

カテゴリ追加・削除・別名化はscoring version変更と再freezeなしに行わない。

#### HELIX-BENCH-R-02 評価指標

```yaml
benchmark_metrics:
  - Task Success Rate
  - Scope Violation Rate
  - Requirement Drift Rate
  - Design Trace Completeness
  - Test Adequacy
  - Review Blocker Count
  - Review Rounds
  - CI Rerun Count
  - Time to Lane Ready
  - Parent Token Reduction
  - Cost per Accepted Change
  - Merge Acceptance Rate
```

失敗、scope違反、stale evidence、review未収束、費用欠測を欠損として捨てず、分母とfailure reasonへ残す。

#### HELIX-BENCH-R-03 比較axis

`team_composition`と`harness_profile`を直交させる。

```yaml
team_composition_classes:
  - single_runtime_model
  - parent_worker
  - multi_runtime_team
  - management_tl_paired_cells
harness_profiles:
  - no_harness
  - rule_file_only
  - helix_partial
  - helix_full
```

実runは具体runtime／model／effort／roleをversion付きで持つが、scorerはprovider名やmodel名を
固定加点・減点に使わない。development style等の工程axisもteam compositionへ混ぜない。

#### HELIX-BENCH-R-04 task snapshotの再現性

各taskは次のexact field setを持つ。

```yaml
required_task_snapshot:
  - task_id
  - task_version
  - fixture_digest
  - requirement_ids
  - acceptance_ids
  - base_head
  - allowed_paths
  - forbidden_paths
  - hidden_oracle_digest
  - seed
  - toolchain_versions
  - timeout_policy
  - retry_policy
  - cache_policy
  - hardware_class
```

public taskとhidden oracleを分離し、future answer、secret、PII、private review contextをfixtureへ含めない。

#### HELIX-BENCH-R-05 run protocolの固定

warmup、repeat count、timeout、retry、CI capacity、cache、parallelismをrun protocol versionへ固定する。
比較可能なのは同一task snapshot、scoring version、protocol version、hardware classのrunだけとし、
差がある場合は別cohortとして表示する。manual intervention、tool denial、network access、
training contamination疑義、fixture leakageをrun receiptへ記録する。

#### HELIX-BENCH-R-06 evidenceとscoring

successは自己申告ではなく、artifact、diff、test、negative oracle、independent review、CI、DB、
lane-ready、merge receiptから算出する。scorerはraw receiptから再計算可能で、metricごとのnumerator、
denominator、missing/failure disposition、weight、normalization、confidence intervalを出力する。

scope violation、security finding、data loss、hidden-oracle leakageを平均点で相殺しない。
accepted changeが0の場合、cost／token reductionを成功値へ変換しない。

#### HELIX-BENCH-R-07 costとcapacity

wall time、parent／worker token、CI実行回数、retry、review round、provider費用、hardware／CI capacityを
記録し、`accepted_change_count`へ正規化する。価格はsource、currency、effective timestamp、
subscription/API-equivalent区分を保持し、費用欠測を0円にしない。

#### HELIX-BENCH-R-08 integrityと履歴

scorer、task、fixture、oracle、protocolのversionとdigestを保持する。benchmark authorとblind judgeを
分離し、hidden oracleをworker contextへ渡さない。historical resultはそのmodel/runtime/version、
toolchain、task snapshotの証拠であり、current性能の代替にしない。

## §2 初期task portfolio

最初の10〜20 taskはHELIX-HARNESSの実Issue／PRを再構成し、少なくとも次のfailure境界を区別する。

- style／case-driven／specialist axisの分離
- legacy taxonomyのcompatibility input隔離
- PLAN metadataとexact scope
- 右腕のright-arm negative oracle
- Design HARNESS drift
- external worker admission
- CI failureの局所修正
- Reverse fullbackとcurrent styleへの再接続

task採用時は元PRの未来正解、review comment、secret、個人情報を除去し、hidden oracle側だけに
mutationと期待結果を保持する。

## §3 非対象

- benchmark runner、dataset packaging、dashboard、model/provider adapterの実装。
- provider／model採用、価格契約、worker admissionの決定。
- L4以降の設計降下、L6/L7 implementation、実benchmark scoreの主張。
- benchmark結果によるG1/G3要件承認の置換。
