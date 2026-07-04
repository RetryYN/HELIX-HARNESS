---
title: "Harness L12 受入検証証跡境界"
layer: L12
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/test-design/harness/L3-acceptance-test-design.md
---

# Harness L12 受入検証証跡境界

L12 は L3 acceptance test design の実施層である。受入は doctor green だけでは閉じず、completion readiness と semantic frontier が閉じていることを必要とする。

## 対象

| 項目 | 証跡 |
|---|---|
| L3 acceptance test design | `docs/test-design/harness/L3-acceptance-test-design.md` |
| completion decision packet | `completion-decision-packet.v1` |
| semantic frontier | `semantic-frontier-consistency` |
| objective audit | `objective-evidence-audit` |

## 合否条件

- `completionClaimAllowed=true`。
- S4 / version-up / cutover / action-binding approval の supporting packet が stale でない。
- L12 の判断が L3 acceptance criteria と双方向 trace できる。

## 未完了 blocker

`completion=blocked` の間は L12 受入を全体完了根拠にしない。未完了 packet は人間判断へ渡す材料であり、承認や apply を代行しない。
