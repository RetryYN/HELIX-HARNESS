# HELIX-HARNESS L3 業務要件（部分草稿の適用範囲記録）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-022, HARNESS-L2-023 only
paired_l10: ../L10-verification/business-verification.md

このStage 1とStage 2aの部分草稿では、対象4件から独立した業務基準・価値閾値・事業判断を追加しない。各固定L2はpack境界、呼出しcontract、条件別依存closureを定める技術的なsystem contractであり、別の業務ownerや業務stateを割り当てていない。よって、この文書は「HELIX-HARNESSにbusiness requirementsがない」とする全体判断ではなく、この4親から意味を追加しないための適用範囲記録である。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-010` | 独立したbusiness requirementを導出しない | packのowner/release-unit分類はL2で定義済み。収益・製品優先順位・release decisionは本L3で決めない。 |
| `HARNESS-L2-011` | 独立したbusiness requirementを導出しない | 呼出し側の保存・表示・業務上の完了判断をHARNESSへ移さない。権限はSECURITYが所有する。 |
| `HARNESS-L2-023` | 独立したbusiness requirementを導出しない | 条件別dependency classificationから新しい利用方針やownerを作らない。 |
| `HARNESS-L2-022` | 独立したbusiness requirementを導出しない | 段階別検証・利用者受入の意味は固定L2/L11と機能ACに残し、別の事業価値基準を追加しない。 |

## 旧business資産との照合

`LEGACY-ASSET-A6E2C7F0565E5F804F06`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`、全文SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）を確認した。BR-21にあるbusiness評価・着手条件は今回のL2-010/011/023に含まれず、別の事業意味として除外する。これは旧BR-21の全体dispositionや拒否ではなく、このL3部分scopeで再利用しない判断である。旧business fileの分類名や文面だけから新しいbusiness要件を起こさない。

関連する機能・受入条件は[機能要件](functional-requirements.md)とそのACを正本にする。追加のbusiness criterionが採択済みL2から必要になった場合は、該当ownerと親revisionを確認したうえでこの正本へ追補し、L10に同じcriteriaの別ACを重複作成しない。
