---
title: "CI Critical-path Scheduler機能設計"
layer: L6
kind: function-design
status: confirmed
created: 2026-08-30
updated: 2026-08-31
owner: Codex / TL
plan: PLAN-L7-707-ci-critical-path-scheduler
parent_design: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
pair_artifact: docs/test-design/helix/L8-ci-critical-path-scheduler-unit-test-design.md
---

# CI Critical-path Scheduler L6設計

## 責務

`CiVerificationPlan`のrequired obligation exact setを不変入力として受け取り、typed telemetry、runner compatibility、
resource budget、exclusive resource、artifact localityから実行配置だけを決定する。verification選定、test生成、workflow実行、
deferred obligation回収は所有しない。

## 入力authority

- candidate/base HEAD、Verification Plan receipt由来のexpected candidate HEAD、Registry digest
- obligation DAGとobligation class
- artifact/capabilityごとのsource HEAD、lockfile、Node/toolchain、platform、input/output digest期待値
- p50/p95、variance、queue、flake、cacheのbounded telemetry
- runner OS compatibility、CPU/memory budget、timeout、backpressure、最大並列度、exclusive resourceのlease/fence token

telemetryがstale、標本不足、obligation分が欠落、identity不一致の場合は推測値で最適化せず、timeoutを上限時間とする安全な既定DAGへfallbackする。required obligationを
skipして高速化してはならない。

## 出力契約

- obligation exact setとdependency closureを保存したexecution DAG
- job配置、並列group、resource class、artifact再利用の判定
- critical path予測、runner-minute予測、failure feedback latency予測
- fallback理由、拒否したartifact／resourceのfinding、plan digest
- local→boundary→global/releaseのphase順と、先行phase failure時に未開始heavy nodeだけを止めるbounded cancel policy

artifact reuseはsource HEAD、lockfile、Node/toolchain、platform、input/output digestの全一致を要求する。statefulまたはglobal
mutable resourceはactive leaseとfence tokenなしに並列配置しない。
同一parallel groupのCPUとmemoryは個別jobではなく合計値をbudget以内に保ち、backpressure中は並列度を1へ保守化する。
expected candidate HEADとartifact identityのいずれかが欠落した場合は、形式上validな別HEADや部分identityから推測せず
fail-closeする。critical path、makespan、quotaはclass/resource barrier適用後の最終parallel groupから再計算する。
bounded cancelはrequired obligationを削除せず、同一runで未開始のheavy nodeを停止対象としてreceiptへ残し、後続terminal
recovery obligationを#1208へ引き渡す。

## failure境界

wrong HEAD/platform/lockfile/toolchain artifact、dependency逆転、cycle、resource conflict、quota超過、stale telemetry、
lease/fence欠落、runner/resource/timeout非互換を別findingでfail-closeする。unknown cache、high variance/flake、backpressureは
required setを維持したconservative fallbackとしてreceiptへ残す。
