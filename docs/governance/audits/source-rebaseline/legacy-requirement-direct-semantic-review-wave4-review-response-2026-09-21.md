---
title: "旧要求・旧asset直接semantic review wave 4 review response"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# PR #1916 review response

## round 1 — `RH-1916-GUI-01`

reviewed HEAD: `2faf486a24e221cd8b1adfaeb69f1a14480a810d`

| finding | 対応 |
|---|---|
| `MAJOR-1916-01-01` | controlled term bindingへ、anchor非空、atom source fragment内、required term内の3条件を復元した。BR-10のjoin切れatomは引用との共通termが無いためdesign被覆から外し、BR-33のrelease decision sourceも実cutover atomへ直接束縛せず`rejected`へ変更した。 |
| `MAJOR-1916-01-02` | statusのphase表をmetadataのphase assessmentとexact set照合し、全状態値をcode spanへ入れた。 |
| `MINOR-1916-01-01` | unit別`connective_fragments`とdigestをcoverage receiptへ保持し、allowlist・長さ・重複・atom fragment非重複を検査する位置ベースの無損失被覆へ戻した。 |
| `MINOR-1916-01-02` | status件数をledger、metadata、218-unit crosswalkから導出し、引用rangeの`1 <= start <= end <= line count`検査を復元した。 |

修正後のsemantic countは`confirmed` 3、`rejected` 1、`unresolved` 5である。18種類のnegative mutationとして、
空anchor、引用termに架からないanchor、phase表改変、引用range不正を追加し、すべて拒否した。


## round 2 — `RH-1916-GUI-02`

reviewed HEAD: `08d611dfed9a1729920c1c876d07b7fad1dfe6a8`

| finding | 対応 |
|---|---|
| `MINOR-1916-02-01` | BR10 A03を設計partialへ戻す案は採らず、引用中のevent envelope内参照欠落と、要求がいうIssueからmemoryまでの横断join切れを区別した。A03へ束縛しない理由をedgeのcounterevidenceへ明記した。 |
| `MINOR-1916-02-02` | `caus`部分一致を廃止した。英数字は3文字以上かつ英数字境界一致、日本語を含むanchorは2文字以上で、atom原文とrequired termの双方に同一tokenがある場合だけ許す。設計edgeは`同一`／`同一因果連鎖`へ変更し、同一tokenを持たない旧実装sourceは隣接sourceとして棄却した。同じ検査をwave 3 verifierにも適用した。 |

修正後のsemantic countは`confirmed` 3、`rejected` 2、`unresolved` 4である。旧実装sourceの存在は消しておらず、
直接対応を確立できないedgeとして記録を残す。
