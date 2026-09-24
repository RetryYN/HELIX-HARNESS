---
title: "HARNESSに対するAI可読上流文書の要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-14
updated: 2026-09-25
mechanism: HELIX-HARNESS
split_from: docs/helix-os/candidates/ai-readable-authority-requirements.md
decision_record: docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md
---

# HARNESSに対するAI可読上流文書の要求候補

2026-09-25のPO判断（候補を機構ごとに分ける）により、[元の候補](../../helix-os/candidates/ai-readable-authority-requirements.md)からHELIX-HARNESSに対する要求だけを分けた。文言は元のまま保持する。
目的、責務の分け方、停止条件は元の候補にある。本書から要求の採用・承認・実装許可を生成しない。

## HARNESSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| AIDOC-HARNESS-001 | AIが適用する工程契約を、対象HARNESS版、layer、pair、artifact、required oracleから取得できる | runtimeやproviderが変わっても工程意味が変わらない |
| AIDOC-HARNESS-002 | AI向け要約から承認済み正本と該当節へ逆参照でき、生成要約をauthorityにしない | 要約欠落・陳腐化を原文revisionで検出できる |
| AIDOC-HARNESS-003 | 未承認、stale、compatibility、historical、unknownを明示し、実行可能なcurrent契約と区別する | 古い文書が検索で見つかっただけでは適用されない |
