---
title: "HARNESSに対する新世代CIの要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-14
updated: 2026-09-25
mechanism: HELIX-HARNESS
split_from: docs/helix-os/candidates/next-generation-ci-requirements.md
decision_record: docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md
---

# HARNESSに対する新世代CIの要求候補

2026-09-25のPO判断（候補を機構ごとに分ける）により、[元の候補](../../helix-os/candidates/next-generation-ci-requirements.md)からHELIX-HARNESSに対する要求だけを分けた。文言は元のまま保持する。
目的、責務の分け方、停止条件は元の候補にある。本書から要求の採用・承認・実装許可を生成しない。

## HARNESSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| NCI-HARNESS-001 | layer、V-pair、artifact class、変更種別、riskから必要な検証義務を決められる | 同じ変更でも上流意味review、設計検証、実装test、利用者受入、運用評価が混在しない |
| NCI-HARNESS-002 | 各検証義務が対象revision、入力、oracle、expected failure、証拠形式、有効期限、差戻し先を持つ | command成功やjob greenだけでは義務充足にならない |
| NCI-HARNESS-003 | required、conditional、informational、not-applicableを理由付きで区別し、unknownをskipへ変換しない | profile縮小時も必要検査が消えず、非適用条件を再評価できる |
| NCI-HARNESS-004 | 上流変更からstale化する下流と再検証範囲を導出できる | 旧authorityに対するgreenや無関係なfull runで新revisionの欠落を相殺しない |
