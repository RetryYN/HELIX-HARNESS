---
title: "HELIX-OSに対する要求エンジンの登録・改善要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-15
updated: 2026-09-25
mechanism: HELIX-OS
split_from: docs/helix-harness/candidates/requirement-engine-python-core-requirements.md
decision_record: docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md
---

# HELIX-OSに対する要求エンジンの登録・改善要求候補

2026-09-25のPO判断（候補を機構ごとに分ける）により、[元の候補](../../helix-harness/candidates/requirement-engine-python-core-requirements.md)からHELIX-OSに対する要求だけを分けた。文言は元のまま保持する。
目的、責務の分け方、停止条件は元の候補にある。本書から要求の採用・承認・実装許可を生成しない。

## HELIX-OSへの登録・改善要求候補

| ID | 要求 | 確認する結果 |
|---|---|---|
| REQENG-OS-001 | Concept、企画、指示、手動候補、要求エンジン入出力を意味未分類の原eventとして同じ因果IDで登録し、project、product、source、actor、permission、data classへ関連付ける | 要求分類schemaを先取りせず、登録を要求採用と混同せず、同じ指示からの再実行と訂正を追跡できる |
| REQENG-OS-002 | ユーザー指示と抽出結果の差、質問、訂正、採否理由、後続の差戻し、見逃し、誤検出を改善用eventとして保存する | 「指示を落とした」「意味を足した」「対象を誤った」を別の改善信号として比較できる |
| REQENG-OS-003 | 改善用eventからengine、製品固有pack、prompt、schema、HARNESS工程のどこを直す候補かを分け、採択後の変更・再検証・再観測へ接続する | ログ蓄積や自己評価だけで強化済みにせず、改善なし・退行・判定不能も保持する |
| REQENG-OS-004 | OSのtransactional consumerがHARNESS提供契約に従ってengine出力のschema、対象revision、権限、lease、重複、staleを再検証してから原子的に登録する | engine出力のcommand、SQL、path、codeを実行せず、部分登録や二重登録を成功にしない。実装技術はL3以降で選定する |
| REQENG-OS-005 | 入力と改善logは目的、同意、data分類、保持期間、利用可能scopeを持ち、secret、credential、不要なPII、生会話全文を既定の学習corpusへ入れない | 要求の根拠追跡を保ちながら、許可外の別project・別tenant・外部学習へ転用しない |
| REQENG-OS-006 | HARNESS engineが出したConcept／企画L1から採用要求までの意味差分と分類を同じ系譜へ登録し、判断者、戻す層、状態、改善eventをrouting・追跡する | OSが意味差分を独自算出せず、要求化漏れと企画外拡張を別findingとして正しいownerへ渡せる |
| REQENG-OS-007 | 原eventとは別のversioned分類projectionとして、単体、接続、構成体の要求identity候補と包含・接続relationを登録し、各状態、変更影響、証拠、未成立条件を別々に管理する | engine／schema／製品pack変更時に原eventを改変せず再分類でき、機能Aの完了をA–Cの接続済み・システムAの受入済みへ自動伝播しない |
