---
title: "HELIX L12 運用/価値証跡インデックス"
layer: L12
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
---

# HELIX L12 運用/価値証跡インデックス

L12 は L3 acceptance test design の実施層である。acceptance は projection や doctor green だけでは閉じず、未完了 frontier が無いことを completion packet で確認する。

## 証跡

| 項目 | 証跡 |
|---|---|
| L3 要件 | `docs/design/helix/L3-requirements/pillar-functional-requirements.md` |
| L12 test-design | `docs/test-design/helix/L3-pillar-acceptance-test-design.md` |
| completion packet | `completion-decision-packet.v1` |
| semantic records | confirmed current meaning records / semantic feature frontier records（確定済み意味 record / semantic frontier record） |

## 証跡対応

| L12 観点 | source / surface | test / oracle | 境界 |
|---|---|---|---|
| L3→L12 acceptance trace | `docs/test-design/helix/L3-pillar-acceptance-test-design.md` の HAT 46 件 | `tests/vmodel-pair.test.ts` の L1/L3/L12 trace assertion | L3 FR/NFR/HAC が acceptance row に接続されることを見る。実 UAT pass の代替にはしない。 |
| semantic current meaning | `src/lint/semantic-frontier-consistency.ts` の confirmed current record 検査 | `tests/semantic-frontier-consistency.test.ts` | confirmed meaning record と L12 HAT の双方向接続を要求し、prose-only feature list を拒否する。 |
| completion acceptance boundary | `src/lint/completion-decision-packet.ts` / `src/lint/outstanding.ts` | `tests/completion-decision-packet.test.ts` / `tests/outstanding.test.ts` | `outstanding.completionReadiness.ok=false` または packet stale の間は、acceptance を frontier のまま保持する。 |
| objective progress evidence | `src/lint/objective-evidence-audit.ts` / `docs/governance/helix-objective-evidence-audit.md` | `tests/goal-evidence-audit.test.ts` | 90% などの progress 表示を whole-program completion 証跡にしない。G-10 が blocked の間は `completionClaimAllowed=false` を維持する。 |

## 受入境界

`outstanding.completionReadiness.ok=false` の間は、L12 運用/価値検証を全体完了根拠にしない。S4、version-up、cutover の packet が stale または未記録なら運用/価値検証は frontier のまま残す。
