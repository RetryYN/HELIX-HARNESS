---
title: "非CodexエージェントAGENTS.mdランタイム境界 単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-06
updated: 2026-08-06
owner: QA
plan: docs/plans/PLAN-RECOVERY-13-kimi-runtime-boundary.md
pair_artifact: docs/design/helix/L6-function-design/kimi-runtime-boundary.md
---

# 非CodexエージェントAGENTS.mdランタイム境界 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-KIMIB-001 | `REVIEWED_SAFE_DISPOSITIONS` の AGENTS.md エントリ | AGENTS.md を編集して registry digest を未更新のまま残す、または registry digest を誤値へ変える mutation を digest 不一致で red にする。`finalDisposition` が `compatibility_labeled` から外れる mutation も red | `tests/l12-hybrid-recognition.test.ts` |

## 位置づけ

L1-L12 drift gate（`tests/l12-hybrid-recognition.test.ts` の集計 fixture）は分類件数の総和しか
固定しないため、AGENTS.md 単体の digest 逸脱を名指しできない。U-KIMIB-001 は registry digest と
repo root の `AGENTS.md` 実ファイル sha256 の exact 一致を直接検証する早期フェンスである
（CI run 31031918548 の再発防止）。

## 実行

```
npx --no-install vitest run --project fast tests/l12-hybrid-recognition.test.ts
```
