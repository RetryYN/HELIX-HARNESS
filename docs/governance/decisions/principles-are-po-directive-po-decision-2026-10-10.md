---
title: "七大原則はPOの指令であり承認対象ではない PO decision record（2026-10-10）"
decision_record_id: HDEC-PRINCIPLES-PO-DIRECTIVE-2026-10-10
decision_status: recorded
decider_role: PO
decided_at: 2026-10-10
recorded_at: 2026-10-10
source: 2026-10-10（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 七大原則はPOの指令であり承認対象ではない（2026-10-10）

## 記録の範囲

本書は、[HELIXエージェントの七大原則](../../concept/helix-principles.md)の位置づけについてのPOの判断を記録する。
本書から、Concept・L1・L2・L11の変更、要求の採否・版の変更、新しい承認手続き・merge gate、実装、CI、release、内部デプロイを生成しない。

## 経緯

七大原則は、2026-09-16にPOが示した（同文書「PO提示原文」）。その後、同文書のfrontmatterには`authority_status: awaiting_human_approval`と`authority_effect_before_approval: none`が書かれた。[Concept v4.1と4本のL1の承認記録](concept-v4.1-and-four-l1-approval-2026-09-17.md)の64行も、七大原則の独立したauthority承認を承認の対象外とした。

エージェントはこの「承認待ち」の表記を理由に、七大原則を適用しなかった。2026-10-10、Claudeは、七大原則の本文を正式に承認するかをPOに尋ねた。

## POの発言（原文）

> なぜ承認を求められるのかわからない。そもそも指令である。

## 判断

- 七大原則は、POが2026-09-16に出した指令である。承認の対象ではなく、指令を出した時点から効力を持つ。エージェントは企画、要求整理、設計、実装、検証、運用改善のすべてに適用する。
- 同文書の具体化本文は、Conceptと同じく、人の指示をAIが反映して同じファイルを更新する。改訂ごとの承認記録や昇格手続きは置かない。
- 具体化本文がPO提示原文と食い違う場合は、原文を優先し、本文を直す。
- 2026-09-17の判断記録の64行と、七大原則に付いた「候補」「承認待ち」の表記は、本書により効力を失う。判断記録は書き換えない。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| 旧`CLAUDE.md`「自律境界（charter §3）」（`archive/legacy-generation-2026-09-14/root/CLAUDE.md` 82–85行）：人は企画・要求・デザインモックを持ち、要件は承認のみ | 人が持つ上流は人が出す。AIはそれを承認待ちの候補に置き換えない | 人の指令であるエージェント原則を、Conceptと同じくその場で改訂する1文書として扱う |

## 本書から生成しないもの

- Concept・L1・L2・L11の変更、および要求の採否・版の変更。
- 新しい承認手続き・merge gate。
- 実装、CI、release、内部デプロイ。
- Issue close。
