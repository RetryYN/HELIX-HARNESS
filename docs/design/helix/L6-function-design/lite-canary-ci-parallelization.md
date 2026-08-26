---
title: "HELIX L6 機能設計 — Lite canary CI parallelization"
layer: L6
kind: add-design
status: draft
created: 2026-08-26
updated: 2026-08-26
owner: SE + TL
plan: docs/plans/PLAN-L7-682-lite-canary-ci-parallelization.md
pair_artifact: docs/test-design/helix/L8-lite-canary-ci-parallelization-unit-test-design.md
related_l5: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
github_issue_id: 1002
behavior_contract_id: LITE-CANARY-CI-PARALLEL-001
responsibility_owner: lite-canary-ci-orchestration
---

# HELIX L6 機能設計 — Lite canary CI parallelization

## 目的

Issue #1002では、既存の単一 required check `harness-check`、Full harness の回帰網、
`consumer_core_v1` の source HEAD／profile／artifact／digest binding を保ったまま、
profile dependency closure が許す pull request だけ Lite consumer canary の重い実行を
typed skipできるようにする。Linux Lite lane と Full lane は独立して起動し、Windows は
Linux が検証して upload した同一 artifact だけを消費する。

## 契約

- selector は毎回、profile catalog、manifest projection、distribution dependency closure
  の fast check を先に実行する。どれか一つでも失敗、未確定、path read failure、source／candidate
  HEAD digest不一致なら `required` を返す。
- importで表現できない配布入力（`README-LITE.md`等）とWindows durability laneの実行対象
  （`loop-store`実装／対応テスト）は `LITE_CANARY_COVERAGE_PATHS` として有効closureへ含める。
  そのpathがsourceから欠落した場合も `path_read_failed` として `required` へ倒し、変更を
  `authorized_skip` に丸めない。
- pull request の変更が closure／artifact に接触、削除、rename、generated dependency、
  manifest に該当する場合も `required` とする。非接触かつ fast check が全て green の場合だけ
  `authorized_skip` とし、skip code は `closure_unaffected` の一種類に限定する。
- push main、nightly、release-candidate context は変更が非接触でも常に heavy Lite canary
  を実行する。無型 boolean skip、`continue-on-error`、別の artifact builder は導入しない。
- Full lane は `harness-check-full` として Lite lane に `needs` を持たない。最終 `harness-check`
  aggregate は Lite、Windows、Full の各 job result と typed disposition／skip code の組を
  exact に検査し、`success:success:none` または
  `success:authorized_skip:closure_unaffected` 以外を拒否する。

## job境界とデータ流

```text
Lite selector → Linux build → Linux canary → upload
       └──── authorized typed skip ─────────────┘
                           ↓
                   Windows download/smoke

Full harness-check-full ───────────────────────┐
Lite + Windows + Full ──→ harness-check aggregate
```

Lite job が heavy lane を実行したときだけ artifact を生成・uploadする。Windows job は Lite
job の成功後にだけ起動し、heavy success のときだけ download／smoke を行う。Lite skip時は
Windowsも同じ typed skipを返すため、Windows側で別の成功判定や別 buildを持たない。
ただしWindows durability coverageまたは配布文書入力に変更がある場合は、共通closure接触として
Liteをrequiredにし、Linuxで検証済みartifactとWindows smokeを失わない。

## 代替案と採用理由

全 context で Lite canary を実行する案は判定が単純だが、closure 非接触の pull request に
同じ重い artifact buildを繰り返し、Issue #1002 の並列化による待ち時間短縮を得られない。
変更 path と fast closure の純粋な selector を採用し、判定不能を全て heavy 側へ倒すことで、
速度の利益を限定的に得ながら coverage と fail-close を維持する。判定の blast radius は
Lite lane の実行有無だけであり、Full gate、branch protection、artifact authority は変更しない。

## 非対象

branch protection の required check 名変更、Full回帰の縮小、distribution builder の追加、
tag／publish／release／cutover、shared state／DB、Windows専用 artifact build は対象外とする。
