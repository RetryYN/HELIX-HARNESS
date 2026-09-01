---
canonical_vmodel: L1-L12
candidate_layer: L10
canonical_pair: L3
title: "REFACTORING Trigger Policy／RF0 Admission受入テスト設計"
layer: L10
status: draft_candidate
created: 2026-09-02
updated: 2026-09-02
owner: QA / TL
plan: PLAN-L3-77-refactoring-trigger-authority
parent_design: docs/governance/candidates/refactoring-trigger-admission-requirements.md
pair_artifact: docs/governance/candidates/refactoring-trigger-admission-requirements.md
---

# REFACTORING Trigger Policy／RF0 Admission受入テスト設計

| AC ID | 対応 | 合格条件 | Negative Oracle |
|---|---|---|---|
| RTG-AC-001 | RTG-R-01 | 同一event exact set、baseline、policy versionから同一trigger evidence exact set／digestを返す | runtime hardcode、event順序、retryで結果を変えない |
| RTG-AC-002 | RTG-R-01 | threshold、window、minimum sample、hysteresis、cooldown、expiryを一件ずつ別判定する | stale policy、wrong baseline、window無視を拒否 |
| RTG-AC-003 | RTG-R-02 | hard trigger、threshold、trend、recurrence、release boundary、provider change、safety-netを別々に実証する | 単一metric、LOC、file size、Issue数、AI評価だけでadmitしない |
| RTG-AC-004 | RTG-R-02 | safety-net単独ではscan coverageだけを記録する | substantive finding／RF0 admissionを生成しない |
| RTG-AC-005 | RTG-R-03 | candidate、finding、evidence、policy、baseline、scope、routeのexact一致時だけRF0へadmitする | unknown scopeを`code_clean`へfallbackしない |
| RTG-AC-006 | RTG-R-03 | semantic changed／unknown、実装故障、provider driftを別route／decisionへ送る | 非refactorをREFACTORINGへ丸めない |
| RTG-AC-007 | RTG-R-04 | primary scope exactly oneとrelated scopesを保持する | primary複数、owner不明、related欠落をgreenにしない |
| RTG-AC-008 | RTG-R-04 | requirement／definitionをauthority再freeze前はauthority_pendingにする | current9 scopeへ暗黙追加しない |
| RTG-AC-009 | RTG-R-05 | 全scopeのrevision、source exact set、policy digest、finding countを記録する | missing source、partial scan、stale policyを全評価済みにしない |
| RTG-AC-010 | RTG-R-05 | findingなし評価とterminal no_actionを別状態にする | scan実行をcandidate終端へ丸めない |
| RTG-AC-011 | RTG-R-06 | UIL-04〜06未到達時はshadow admissionだけを生成する | RF0実行、Issue／PLAN／authority writeを行わない |
| RTG-AC-012 | RTG-R-06 | false-positive、missed-trigger、duplicate、coverage、lead time、rework、CI costをbefore／after比較する | 単一改善値だけでadoptionを確定しない |

12件を独立oracleとして保持し、happy-pathでfailure classを相殺しない。
