---
title: "GitHub CI性能・Recovery要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: PO / TL
pair_artifact: docs/test-design/helix/github-ci-performance-system-test-design.md
---

# GitHub CI性能・Recovery要件定義

## 1. 目的と適用境界

本書はGitHub自走とmerge admissionの正確性要件を弱めず、重要検査とFull verificationの実測性能、性能予算超過時の
RecoveryをL3要件として追加する。性能超過をcorrectness failureと混同せず、検査削減や閾値緩和による見かけ上の改善を拒否する。

## 2. 非機能要件

- `GH-NFR-009` Important-check latency: 内部CIとGitHub Actionsは別環境・別receiptで重要検査を実行し、それぞれp95 60秒以内を目標とする。重要検査集合は要件・設計・Vペア・trace、security・権限・secret、DB event・projection・checkpoint・schema、build・type・主要unit/integration、migration・rollback・互換性、文脈レビューreceiptのHEAD整合を含む。
- `GH-NFR-010` Full-verification latency: Full verificationはp95 3分以内を目標とし、PR作成前、merge直前、main merge後に実行する。監査修正直後は変更L、上下隣接、対応Vペア、trace consumerを対象とする影響検査を行い、その結果をFull verificationの代替にしない。
- `GH-NFR-011` Performance recovery: correctnessがgreenで性能予算だけを超過した場合、merge可否と性能Recoveryを分離する。同じepisodeでRecovery Issueを起票し、実測HEAD、環境、cold/warm cache、区間計測、原因分類、改善前後p50/p95、検査範囲非縮退証拠、修正・独立クロスレビュー・再検証receiptを保存する。検査省略、閾値緩和、GitHub Actionsへの検査先送りを性能改善と認めない。

## 3. 受入条件

| AC | 合格条件 |
|---|---|
| GH-AC-017 | 重要検査が内部CIとGitHub Actionsで別環境・別receiptとして実行され、各p95 60秒以内、Full verificationがp95 3分以内としてHEAD・環境・区間別に計測される |
| GH-AC-018 | correctness greenかつ性能予算超過時はmerge判定とPerformance Recoveryを分離し、必須計測証拠を持つRecovery Issueを同episodeで起票して、検査範囲を縮退させず改善closureまで追跡する |

## 4. freeze境界

本書は性能目標、測定証拠、RecoveryのL3契約だけを定義する。runner構成、計測実装、DB schema、dispatch制御はL4以降へ降下し、
このPRでは実装や実行証拠を先取りしない。
