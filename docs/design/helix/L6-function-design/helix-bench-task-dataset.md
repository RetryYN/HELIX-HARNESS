---
title: "HELIX-Bench task dataset機能設計"
layer: L6
kind: function-design
status: draft
plan: PLAN-L7-719-helix-bench-task-dataset
parent_design: docs/design/helix/L3-requirements/helix-bench-evaluation.md
pair_artifact: docs/test-design/helix/L8-helix-bench-task-dataset-unit-test-design.md
---

# HELIX-Bench task dataset機能設計

## 責務

実行profileやprovider選定とは独立して、HELIX-Benchのpublic task、fixture、hidden oracleを
version付きregistryとして検証する。runner、scorer、routing、worker admissionは所有せず、
既存worker blind benchmarkを下位receiptとして再利用する。

## 物理分離

- config/helix-bench/public-tasks.v1.json: workerへ提示可能なpromptと15-field snapshot。
- config/helix-bench/fixtures.v1.json: 再現用入力。未来正解、secret、PIIを持たない。
- config/helix-bench/hidden/hidden-oracles.v1.json: blind judge専用の負極性oracle。

public taskはhidden oracleのdigestだけを持つ。hidden field名、期待failure、mutation、過去scoreを
public promptへ再出力しない。loaderは10〜20 task、5カテゴリ被覆、exact field set、fixture／oracle
digest、historical result非再利用をAND条件で検査する。

## Cursor canary正規化

Issue #1287由来taskはexternal_worker_candidate=trueとするだけで、Cursor、Grok、Kimi等を
dataset authorityや固定加点軸へしない。provider／modelは将来run receiptのversion付き入力である。
