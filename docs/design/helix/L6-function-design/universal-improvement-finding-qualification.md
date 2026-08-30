---
title: "Universal Improvement finding適格化機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
plan: docs/plans/PLAN-L7-706-universal-improvement-finding-qualification.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-finding-qualification-unit-test-design.md
related_l3: docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md
---

# Universal Improvement finding適格化機能設計

## 1. 責務境界

本機能はUIL-03として、#1232の正規化済みevent exact setと、同eventのdetector identityへ束縛されたtrigger evidenceを
入力にする。findingの適格化、同一原因・scope・baselineのdedupe、expiry、supersession、counterevidence保持だけを担う。
metric計算、semantic impact、candidate synthesis、route、Issue／PLAN／Requirement／DB authority writeを行わない。

## 2. 型付きtrigger evidence

trigger kindは`invariant_violation`、`recurrence`、`metric_budget_exceeded`、`worsening_trend`、
`structural_drift`、`release_boundary`、`provider_change`、`scheduled_safety_net`のexact setとする。
各evidenceはdetector ID／version、invariant ID、root cause ID、scope authority、baseline revision、event ID exact set、
event digest exact set、観測時刻、expiry、counterevidence、supersessionを別fieldへ束縛する。

scheduled safety-netは観測欠落をsurfaceするだけで、単独では`qualified`へ昇格しない。detector不明、event未解決、
wrong baseline、event digest不一致、未来時刻、無効expiry、同一identity内の矛盾をfail-closeする。

## 3. finding identityとterminal disposition

finding identityはroot cause、scope authority、baseline revision、invariant ID、trigger kindから決定的に生成する。
同一identityのretry／at-least-once deliveryは一件へ集約し、event、evidence、counterevidenceをbytewise exact setへする。
同じidentityでdetector、trigger verdict、supersessionが矛盾する場合は推測せず全体をfail-closeする。

dispositionは`qualified`、`rejected`、`expired`、`superseded`、`counterevidence_required`を分離する。
`not_triggered`はrejected、期限超過はexpired、supersession指定はsuperseded、counterevidenceありは
counterevidence_requiredとし、いずれも理由とdigestを保持する。出力はfinding IDでsortしexact set digestを生成する。

## 4. 後続境界

qualified findingだけをUIL-04 semantic impact／candidate synthesisへ渡す。その他dispositionもdedupe evidenceとして保持するが、
過去のrejected／expiredを成功扱いせず、別baselineのfindingへ流用しない。
