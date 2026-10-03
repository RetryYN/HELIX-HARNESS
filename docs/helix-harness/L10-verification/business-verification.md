# HELIX-HARNESS L10 業務検証設計（部分草稿の適用範囲記録）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, 011, 022, 023 and Stage 2b HARNESS-L2-012..020, 024, Stage 2c HARNESS-L2-030..032 partial draft
paired_l3: ../L3-requirements/business-requirements.md
execution_status: designed_only_not_executed

本部分scope（Stage 1・2aおよびStage 2cのHARNESS-L2-030/031/032）では独立したbusiness requirementを導出していないため、別のbusiness acceptance oracleを定義しない。機能contractの正常・反例・unknown／未観測の検証は[functional-verification.md](functional-verification.md)にある同一AC IDで行う。これを事業価値の検証や利用者受入へ読み替えない。

| 状態 | 判定材料 |
|---|---|
| この部分scopeで独立business criterionなし | `functional-requirements.md`の範囲表と`functional-verification.md`に列挙されたACが対応していること。 |
| Stage 2bの固定親 | 独立business criterionなし。Prototype/PoC適用性、設計義務、Provisional、release・運用・reverse/handoff・要求形成の工程条件を、収益・費用・製品優先順位へ読み替えない。機能AC/L10の正常・反例・unknownが一致することだけをこのscopeで確認する。 |
| 将来のbusiness criterionが未提示 | 未評価として保持する。売上、費用、優先順位、採用意向などを技術oracleから推定しない。 |
| Stage 2c生成・packet receipt | 030/031の候補と032の受渡しreceiptだけでは実行・合格・業務完了を生成せず、functional L10の同じACを参照する。 |
| H022のstage evidence | L3機能ACとL11利用者recordの段階条件をfunctional L10で確認し、事業価値達成へ読み替えない。 |
| owner／scopeが異なる基準が入力された | その要求を所有するL1/L2またはLABO／呼出し側へ戻す。ここで新しいacceptance stateを作らない。 |

この記録は、HARNESS全体のbusiness要件非適用、PO承認、要求retire、事業価値達成を意味しない。
