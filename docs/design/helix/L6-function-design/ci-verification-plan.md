---
title: "CI Verification Plan合成機能設計"
layer: L6
kind: function-design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
plan: PLAN-L7-706-ci-verification-plan
parent_design: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
pair_artifact: docs/test-design/helix/L8-ci-verification-plan-unit-test-design.md
---

# CI Verification Plan合成機能設計

## §1 責務境界

本機能はCIS-R-07〜09を所有し、work authority、candidate／base HEAD、CI Responsibility Registry、semantic impact、
risk、deferred assignmentからtyped Verification Planを決定的に合成する。job配置、runner、実行順最適化、test生成は
#1207以降へ残し、required obligationを削除しない。

## §2 合成contract

- current outputはlocal、boundary、global invariant、deferred obligation、execution DAG、full fallback reasonを別fieldにする。
- changed test capabilityはgraph選定外でも必須とし、dependency closureを追加する。
- unknown／high-risk、selector／registry／security／schema／migration／rollback／lockfileはactive capability exact setへ
  full fallbackする。fallbackはfindingを相殺しない。
- PRで延期するobligationはRegistryの`defer_targets` allowlist内でmain／nightly／releaseのいずれかへexactly-once
  割り当て、dependencyを延期したままconsumerを即時実行しない。
- 同一入力とregistry digestは配列順を含む同一plan digestを返す。

## §3 compatibility境界

旧Impact CIのselected／deferred item IDは明示mapでcapability IDへ一方向変換する。unknown itemとselected／deferred overlapを
拒否し、旧path、test list、reason textをcurrent planのprimary identityへ再出力しない。旧full admissionは
`legacy_full_admission`としてfull fallbackへ変換する。

## §4 fail-close

wrong HEAD、同一base／candidate、stale registry digest、unknown capability、duplicate assignment、missing release target、
deferred dependency、registry admission failureを個別findingにする。plan生成自体を例外で失わず、`ok: false`とfull fallbackを
同時に保持して不足証拠を可視化する。
