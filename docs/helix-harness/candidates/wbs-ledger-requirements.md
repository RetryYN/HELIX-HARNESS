---
title: "HARNESSに対する作業分解（WBS）の形の要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-18
updated: 2026-09-25
mechanism: HELIX-HARNESS
split_from: docs/helix-os/candidates/wbs-ledger-requirements.md
decision_record: docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md
---

# HARNESSに対する作業分解（WBS）の形の要求候補

2026-09-25のPO判断（候補を機構ごとに分ける）により、[元の候補](../../helix-os/candidates/wbs-ledger-requirements.md)からHELIX-HARNESSに対する要求だけを分けた。文言は元のまま保持する。
目的、責務の分け方、停止条件、HELIX-OSに対する要求は元の候補にある。本書から要求の採用・承認・実装許可を生成しない。

## HARNESSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| WBS-HARNESS-001 | 作業単位が持つべき形（依存、並列・直列、scope、予算上限、期限、V-pair＝対応する検証、受入条件、変更の種類、工程順序、停止・差戻し条件）を規範として定め、OSはそれを台帳のschemaへ写す | HARNESSは台帳を運転せず、OSは規範を改変しない。規範に無い形の作業単位は台帳に入らない |

## L11受入候補

全件未実行である。

- HARNESSの規範に無い形の作業単位を登録しようとし、拒否する。OSが規範の項目を改変しようとし、拒否する。（WBS-HARNESS-001）
