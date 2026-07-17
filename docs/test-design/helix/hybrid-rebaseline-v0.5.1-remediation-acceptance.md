---
title: "REBASELINE v0.5.1 是正 受入テスト設計"
layer: L3
executed_at_layer: L10
artifact_type: test_design
status: proposed
created: 2026-07-18
updated: 2026-07-18
owner: QA
pair_artifact: docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.1-remediation-requirements.md
---

# REBASELINE v0.5.1 是正 受入テスト設計

| AC-ID | 対応要件 | 合格条件 |
|---|---|---|
| AC-V051-01 | 要件1〜4 | 36 findingがglobal unique IDを保ち、critical/major/minorの全件に許可済み終端とmachine oracleがある |
| AC-V051-02 | 要件2、7 | requirement、AC、test/oracle、evidence、decision、target fileが双方向に閉じ、orphan/danglingが0件である |
| AC-V051-03 | 要件5〜6 | authority epochとpackage投影値が単一SSoTへ一致する |
| AC-V051-04 | 要件8〜9 | positive/negative fixtureとSQLite制約が不正状態を実際に拒否する |
| AC-V051-05 | 要件10〜11 | freshness全fixtureと列挙log必須条件がfail-closeする |
| AC-V051-06 | 要件12 | 独立再監査で新規critical/majorが0件である |
