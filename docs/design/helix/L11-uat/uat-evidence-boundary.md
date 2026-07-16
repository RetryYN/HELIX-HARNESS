---
title: "HELIX L11 総合レビュー・UAT 境界"
layer: L11
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-05
owner: Codex
retention_policy: operations-governance
retention_authority: operations-governance
retention_mode: indefinite
---

# HELIX L11 総合レビュー・UAT 境界

L11 は、要件・実装・テスト・運用判断をまとめて確認する層である。現在は review evidence と completion packet の仕組みはあるが、open decisions が残るため全体 UAT close ではない。

## pair 境界

L11 は L3/L4/L5/L6 のような単一の test-design と直接 pair-freeze する設計層ではなく、L8-L10 の検証証跡、L12 acceptance、L14 completion packet を横断して UAT 可否を確認する evidence boundary である。したがって `pair_artifact` を持たないことを UAT 完了や pair 欠落の証跡に読み替えない。

## 現在の証跡

| 項目 | 証跡 |
|---|---|
| review 証跡 | `review-evidence` doctor gate |
| completion packet | `bun run src/cli.ts completion decision-packet --json` |
| semantic frontier | `src/lint/semantic-frontier-consistency.ts` |
| 未解決 feedback / continuation | harness.db feedback lifecycle / continuation read model / completion packet |

## 証跡対応

| L11 観点 | source / surface | test / oracle | 境界 |
|---|---|---|---|
| cross-agent review evidence | `review-evidence` / `guardrail-invariants` doctor gate | `tests/doctor.test.ts` と review evidence lint 系 test | worker と reviewer が分離され、定量テスト後に定性レビューが記録されることを見る。review green だけでは UAT close にしない。 |
| completion decision packet | `src/lint/completion-decision-packet.ts` / `bun run src/cli.ts completion decision-packet --json` | `tests/completion-decision-packet.test.ts` / `tests/cli-surface.test.ts` | `completionClaimAllowed=false` の間は L11 承認を出さず、S4 / version-up / cutover packet を人間レビューへ残す。 |
| semantic frontier consistency | `src/lint/semantic-frontier-consistency.ts` | `tests/semantic-frontier-consistency.test.ts` / `tests/vmodel-pair.test.ts` | prose-only feature list では UAT 証跡にしない。confirmed meaning record と L12 acceptance row の双方向接続を見る。 |
| 未解決 feedback / continuation | `src/feedback/` / `src/runtime/continuation.ts` / harness.db | `tests/feedback-lifecycle*.test.ts` / `tests/continuation-event-first.test.ts` | open feedback、未投影event、DB/memory矛盾を完了claimに混ぜない。DB projectionを正とし、provider delegation evidenceは監査専用の別型としてjoinしない。 |

## 未完了境界

S4 decision、version-up activation、action-binding approval、cutover decision が残る状態では、L11 は全体承認を出さない。
