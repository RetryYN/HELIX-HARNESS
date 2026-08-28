---
title: "pending Reverse pairing readiness機能設計"
canonical_layer_scheme: L1-L12
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
authority: docs/design/harness/L6-function-design/backfill-pairing.md
plan: docs/plans/PLAN-L7-699-pending-reverse-pairing-readiness.md
pair_artifact: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md
---

# pending Reverse pairing readiness機能設計

## 目的

current Reverseが`draft`かつ`backfill_state=pending_reverse`である間、pair identityとexecution
dependencyを混同せず、Forward／Reverse双方のexact `dependencies.references`だけをpair成立として扱う。

## 関数契約

| 関数 | シグネチャ | 事前条件 | 事後条件 | 失敗契約 |
|---|---|---|---|---|
| `analyzeBackfill` | `(plans: ParsedPlan[], glossaryText: string) => BackfillResult` | ForwardとReverseのPLAN identity、status、backfill state、referencesが解析済み | pending Reverseは双方向references一致時だけ`reverseLinkMissing`を生成しない | 片方向、wrong Reverse ID、draft／state不一致を`reverseLinkMissing`としてfail-close |

terminal／legacy Reverseは既存の`requires`契約を維持する。pending pairの成立をexecution dependency readyへ
昇格させず、legacy greenでcurrent failureを相殺しない。

## 検証接続

`U-BACKFILL-008`を`tests/backfill-pairing.test.ts`が所有し、双方向正例と片方向、wrong ID、state不一致、
`backfill_state`条件除去mutationを検査する。
