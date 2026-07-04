---
title: "Harness L13 デプロイ後検証境界"
layer: L13
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
---

# Harness L13 デプロイ後検証境界

L13 は配布、consumer smoke、monitoring、rollback 判断の層である。現時点では local build と consumer readiness の証跡を扱い、実 production / external service 変更は action-binding approval 前に実行しない。

## 対象

| 項目 | 証跡 |
|---|---|
| build smoke | `bun run build` |
| local binary smoke | `./dist/ut-tdd doctor` |
| consumer doctor | `./scripts/ut-tdd doctor --profile consumer` |
| rename dry-run | `./scripts/ut-tdd rename plan --json` |

## 合否条件

- 配布 surface と consumer template が同じ contract を示す。
- smoke が read-only または local artifact 生成に限定される。
- rollback / monitoring / backup plan が不可逆 apply 前に記録されている。

## 未完了 blocker

repository/package rename、branch protection 実適用、tag publish、state dir move は、承認済み execution window と rollback plan なしに L13 完了扱いにしない。
