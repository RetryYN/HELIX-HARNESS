---
decision_record_id: HDEC-DESIGN-AS-CODE-TDD-2026-10-21
decision_status: recorded
decider_role: PO
decided_at: 2026-10-21
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 設計成果物を対象にしたTDD方式の採用

## PO原文

2026-10-21のCodex会話で、POは継続作業の目標を次のように更新した。引用は今回の方式に関する部分である。

> 新概念として設計書を実装として捉えてTDDでレッド、グリーン、リファクタで最小設計をする仕組みを採用する。例）L4とL9からL5を導く仕組み。詳細はイシュー#3502を確認。

同じ目標には「限定要件定義をV12モデルエンジンの定義に従って基本設計と詳細設計まで完遂し、適時イシュー整理をすること」と「Design as Codeの思想のもとにエージェント原則とConceptを死守すること」が含まれる。

## 反映する内容と境界

以下は原文を作業へ対応付けるAIの整理であり、引用と区別する。

- 設計書そのものを変更対象とし、上位の設計と対検証から独立した期待・反例を先に定め、不足を識別するRed、最小設計のGreen、同じ期待と影響先を保持するRefactorの循環を採用する。具体例はL4とL9を入力としてL5を導く作業である。製品コードを先に増やすことを、この方式の実証へ読み替えない。
- [#3502](https://github.com/RetryYN/HELIX-HARNESS/issues/3502)と[方法比較監査](../audits/v12-development-method-review-2026-10-21.json)は具体化の参照であり、Issue本文の全提案を一括採用したと補完しない。同Issueの「L6 Red／L7 Green＋Refactor」という層の再割当てについて、今回の原文には対応する定義変更がない。[現行Concept](../../concept/helix-concept.md)の層とV-pairを保持し、必要な差分が見つかれば根拠を伴う変更候補として分ける。
- [設計リファクタリングの調査](../feature-tickets/FT-DESIGN-REFACTOR-001.md)の反例先行・独立期待・意味保存・consumer追随を起点にする。設計JSONの容量削減や復元同等性、製品コードのTDD実行記録は、それぞれの対象の証拠として保持し、設計導出の実証とは分ける。
- 採用したのは設計改善の方式である。生成器・設計CI・上位pairから下位pairを導く機構が実装済みであること、限定要件や全設計の完了、製品CI・利用者受入・release・内部デプロイの成立を宣言しない。既存のauthority、独立review、還流先を保持し、新しい承認gateは追加しない。

## 旧source・保持点・変更点

起点は `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md` §0〜§1（LEGACY-ASSET-603D0E8D8193914F4AC0）の意味署名・consumer／oracle保全と、同archiveの `docs/governance/ddd-tdd-rules.md:23–24,117–125` の実欠陥を検出するRed・同じoracleでの意味保存である。旧sourceは読み取り参照に限る。

保持するのは独立期待、元要求・責務・失敗意味とconsumerの保全である。変更するのは、設計成果物を対象に上位pairから最小設計を反例先行で導く方式を、比較候補から今回のPO指示による採用方針へ進める点である。具体的な実行方法と不足は対象設計・対検証で確かめる。旧層番号・runtime・DB・旧gateを移植せず、下流のGreenから上流の意味変更を生成しない。
