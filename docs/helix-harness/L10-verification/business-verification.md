# HELIX-HARNESS L10 業務検証設計（部分草稿の適用範囲記録）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023 only
paired_l3: ../L3-requirements/business-requirements.md
execution_status: designed_only_not_executed

本部分scopeでは独立したbusiness requirementを導出していないため、別のbusiness acceptance oracleを定義しない。機能contractの正常・反例・unknown／未観測の検証は[functional-verification.md](functional-verification.md)にある同一AC IDで行う。これを事業価値の検証や利用者受入へ読み替えない。

| 状態 | 判定材料 |
|---|---|
| この部分scopeで独立business criterionなし | `functional-requirements.md`の範囲表と`functional-verification.md`に列挙されたACが対応していること。 |
| 将来のbusiness criterionが未提示 | 未評価として保持する。売上、費用、優先順位、採用意向などを技術oracleから推定しない。 |
| owner／scopeが異なる基準が入力された | その要求を所有するL1/L2またはLABO／呼出し側へ戻す。ここで新しいacceptance stateを作らない。 |

この記録は、HARNESS全体のbusiness要件非適用、PO承認、要求retire、事業価値達成を意味しない。
