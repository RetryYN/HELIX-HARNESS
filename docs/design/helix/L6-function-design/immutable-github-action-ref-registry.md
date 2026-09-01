---
title: "immutable GitHub Action ref registry機能設計"
layer: L6
kind: recovery
status: draft
created: 2026-09-01
updated: 2026-09-01
owner: Security / CI
plan: PLAN-RECOVERY-74-immutable-github-action-ref-registry
pair_artifact: docs/test-design/helix/L8-immutable-github-action-ref-registry-unit-test-design.md
---

# immutable GitHub Action ref registry機能設計

## 1. 責務

`GitHubActionImmutableRefRegistry`はlogical action identity、release metadata、実行に使うfull commit SHAを分離する。release tagは監査用metadataであり、workflowの実行authorityにはしない。

`toolchain-pin`はcurrent workflow、consumer template、setup生成物の全`uses:`を収集し、registryにexactly one存在する`action@commit_sha`だけを許可する。tag、branch、short SHA、unknown action、重複entry、wrong SHAをfail-closeする。

## 2. 入出力

入力はregistry JSON、package engine、lockfile、workflow YAML exact setである。出力はpath、rule、redacted messageからなる既存`ToolchainPinViolation`を維持し、別scanner結果を作らない。

registry entryは`action`、`release`、40桁`commit_sha`、HTTPS `source_url`を必須とする。registry自体のschema、version、確認時刻が不正な場合、workflow greenで相殺しない。

## 3. surface収束

current `.github/workflows`、`docs/templates/github/common`、`src/setup`が同じregistry SHAを使う。生成物検査はrelease tagではなくimmutable refを比較する。release metadataは行末コメントまたはregistryだけに保持できる。

## 4. 非対象

runner imageとNode/npm実効identityは#1340、GitHub実run／mutation終端は#1341が所有する。Actionの自動version-up、GitHub settings apply、credential操作は行わない。
