---
canonical_vmodel: L1-L12
canonical_layer: L12
canonical_pair: L1
title: "常駐レーン要求の利用者受入・認識設計"
layer: L12
kind: add-design
status: confirmed
created: 2026-09-01
updated: 2026-09-01
owner: PO / QA
plan: PLAN-L3-75-resident-lane-orchestration-authority
parent_design: docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md
pair_artifact: docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md
---

# 常駐レーン要求の利用者受入・認識設計

| L1要求 | L12で認識する結果 |
|---|---|
| `BR-1` | Codex TLが待機中も別frontierを進め、worker→PR→Claude→元worker→mergeが継続する |
| `BR-2` | 全assignmentがIssueまたはPLANのexactly one、専用branch、base/candidate HEAD、leaseへ遡れる |
| `BR-3` | worker自己reviewがなく、Claude exact-HEAD検収と同branch差戻しを確認できる |
| `BR-4` | provider追加・停止が論理lane authorityを変更せず、既存Codex＋Claude経路を壊さない |
| `BR-5` | HELIX Control Planeが通知を中央配送し、通知欠落をevent replayで回復できる |
| `BR-6` | fixed routingからmeasured advisoryへ段階移行し、自動配車は承認前に有効化されない |
| `BR-7` | FE/BE/設計/task class別のHELIX-Bench evidenceへ適性判断を遡れる |
| `BR-8` | resident lane、native subagent、CLI workerと実model／effortが別identityで表示される |

`CN-1..6`は全canaryで維持する。特にL1-L12 authority、Node transactional boundary、requirements-first、
action-binding approval、secret非記録、main PR-onlyを一件でも破る結果を受入れない。
