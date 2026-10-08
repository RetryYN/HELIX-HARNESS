---
title: "L4〜L6の設計と対の検証設計の解禁、および共通カーネルの由来の取り方 PO decision record（2026-10-08）"
decision_record_id: HDEC-L4-L6-DESIGN-UNLOCK-2026-10-08
decision_status: recorded
decider_role: PO
decided_at: 2026-10-08
recorded_at: 2026-10-08
source: 2026-10-08（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの選択と発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# L4〜L6の設計の解禁と、共通カーネルの由来の取り方（2026-10-08）

## 記録の範囲

本書は、POが同じ日に示した三つの判断を記録する。

1. 作業入口の「現在停止する作業」のうち、L4〜L6の設計とその対の検証設計を解禁する。
2. 共通カーネル（L4の共通設計）は一つの親要求を定めず、要素ごとに承認済みL3のACへ由来を辿る。
3. 開発repoの運用規則と、製品（リリース側）の要求を区別する。

本書から、実装、新世代CIの実装・起動、release、deployment、内部デプロイ、L10の実行・合格、L2の変更、新しい承認手続き、Issue closeを生成しない。

## POの選択と発言

ClaudeはAskUserQuestionで、作業入口の`docs/governance/new-generation-start-here.md:109`に「L3以降の正式な設計・実装」が停止中の作業として残っていることを示した。そのうえで次を問い、POは次の選択肢を選んだ（原文）。

> 問い：「作業入口「現在停止する作業」に「L3以降の正式な設計・実装」が残ってる。L4に進むには、この停止をどうする？」
>
> POの選択：「L4以降の設計をまとめて解禁」
>
> 選択肢本文：「L4〜L6の設計文書（と対の検証設計）まで停止から外す。実装・CI・release・deploymentは停止のまま」

> 問い：「共通カーネル（K1〜K10）の親要求をどうする？HARNESS-L2-031は「最小再現と回帰候補生成」の要求で、親にはできなかった（私の指示ミス）。」
>
> POの選択：「親なしでACへ要素ごとにtrace (Recommended)」
>
> 選択肢本文：「1つの親を定めず、K1・K2の各規則を、実際の由来である8機構の承認済みL3のACへ要素ごとに辿る（下書きの今の形）。L2は変えない。所有はHARNESS（工程の標準と検証義務）」

続けて、Claudeが「L3／L10委任の独立性の条件（2026-10-08判断記録）が、Conceptの独立reviewの記述（providerが同じか別かでは独立性を決めない）と食い違う」として揃え方を問うた。これに対し、POは次のように述べた（原文）。

> じゃなくて、何度同じことを聞けば済むの？開発レポとリリース側は要件違うだろ。ムカつくな。開発レポはクロスレビュー必須。

## 判断1：L4〜L6の設計と対の検証設計の解禁

- L4〜L6の設計文書と、対になる検証設計（`L4↔L9`、`L5↔L8`、`L6↔L7`。[Concept](../../concept/helix-concept.md)の層の対）を、作業入口の「現在停止する作業」から外す。
- 設計の親は、承認済みのL3／L10（固定1.0の274親）である。承認済みでない、missing、unknown、conflict、staleの対象へは、従来どおり進まない（AGENTS.md「現在の境界」）。
- 実装、新世代CIの実装・起動、release、deploymentは、停止のまま残す。
- L4以降の設計の承認者は人に置かない。旧HELIXの自律境界（L3起草以下はAIが自走）のとおり、作成側と独立したreview側のreviewで確かめ、通常のPRの流れでmergeする。

## 判断2：共通カーネルの由来

- L4の共通設計（共通カーネル）は、一つの親要求の下に置かない。各規則は、実際の由来である承認済みL3のACへ、要素ごとに辿る。
- L2は変えない。「機構をまたいで一つの型を共有する」こと自体を定める要求は新設しない。
- 所有はHELIX-HARNESSとする（Concept原則10：HARNESSが工程の標準と検証義務を持つ）。

## 判断3：開発repoの運用規則と、製品（リリース側）の要求の区別

- [GitHub上流運用モデル](../github-upstream-operating-model.md)の「L3／L10承認の委任」（2026-10-08の[判断記録](l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md)）は、**開発repo（本repository）での作業の運用規則**である。開発repoでは、作成と別系統のクロスレビューを必須とする。
- [Concept](../../concept/helix-concept.md)の独立reviewの記述（作成側とは別のreviewerのidentity・context・authority・review routeで行い、providerが同じか別かでは独立性を決めない）は、**製品（リリース側）であるHELIXの要求**である。HELIXが利用者の作業に対して独立性を判定するときの仕様を定める。
- 両者は対象が違うため、食い違いとして扱わない。開発repoの運用規則を、製品の要求の根拠にしない。製品の要求を、開発repoの運用規則で書き換えない。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| 旧`CLAUDE.md`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）82–85行「自律境界」：人はL0企画・L1要求・L2デザインモックを持ち、L3要件は承認のみ。AIはL3起草とL4以降からGitHub PR／CI／merge／tagまでを完全自動で行い、不可逆操作だけをescalateする | L4以降の設計をAIが自走し、人の承認を置かないこと | 実装、CI、release、deploymentは、旧と違い、本書では解禁しない。新世代CIが無く、実装の許可も出ていないため |
| 旧`CLAUDE.md` 195–197行「GitHub 自走運用」：人のapproveを不要とし、品質ゲートをCIとクロスランタイムのreview evidenceに置いた | 開発repoの品質ゲートを、クロスランタイムのreviewに置くこと | なし（開発repoの運用規則であることを判断3で明記する） |

## 本書から生成しないもの

実装、新世代CIの実装・起動、release、deployment、内部デプロイ、L10の実行・合格、v0.1の宣言、L2の変更、新しい承認手続き・merge gate、Issue close。
