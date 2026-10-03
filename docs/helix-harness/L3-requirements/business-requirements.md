# HELIX-HARNESS L3 業務要件（部分草稿の適用範囲記録）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, 011, 022, 023 and Stage 2b HARNESS-L2-012..020, Stage 2c HARNESS-L2-030..032
paired_l10: ../L10-verification/business-verification.md

Stage 1、Stage 2a、Stage 2bおよびStage 2cの部分草稿では、対象親から独立した業務基準・価値閾値・事業判断を追加しない。Stage 2bの単体工程親は既存ownerと工程契約を定めるが、ここで別の業務ownerや業務stateを割り当てない。これはHELIX-HARNESS全体の業務要件非適用を意味せず、現在の固定親から事業意味を追加しない範囲記録である。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-010` | 独立したbusiness requirementを導出しない | packのowner/release-unit分類はL2で定義済み。収益・製品優先順位・release decisionは本L3で決めない。 |
| `HARNESS-L2-011` | 独立したbusiness requirementを導出しない | 呼出し側の保存・表示・業務上の完了判断をHARNESSへ移さない。権限はSECURITYが所有する。 |
| `HARNESS-L2-023` | 独立したbusiness requirementを導出しない | 条件別dependency classificationから新しい利用方針やownerを作らない。 |
| `HARNESS-L2-022` | 独立したbusiness requirementを導出しない | 段階別検証・利用者受入の意味は固定L2/L11と機能ACに残し、別の事業価値基準を追加しない。 |
| `HARNESS-L2-012` | 独立したbusiness requirementを導出しない | UI合意と技術PoCの適用性・結果を分け、利用価値の判断を作らない。 |
| `HARNESS-L2-013` | 独立したbusiness requirementを導出しない | 要求形成の出力を草稿として扱い、企画・優先順位を新設しない。 |
| `HARNESS-L2-014` | 独立したbusiness requirementを導出しない | Design Templateは設計義務を導くが、事業上の要求意味を決定しない。 |
| `HARNESS-L2-015` | 独立したbusiness requirementを導出しない | Provisionalな単体開発結果を製品価値・release判断へ読み替えない。 |
| `HARNESS-L2-016` | 独立したbusiness requirementを導出しない | performance候補を含む技術比較から製品価値や優先順位を推定しない。 |
| `HARNESS-L2-017` | 独立したbusiness requirementを導出しない | Release Portと適格条件は親に従い、販売・顧客優先順位・配備決定を追加しない。 |
| `HARNESS-L2-018` | 独立したbusiness requirementを導出しない | 運用品質要求のownerは製品側にあり、共通SLOや費用閾値をHARNESSが決定しない。 |
| `HARNESS-L2-019` | 独立したbusiness requirementを導出しない | 既存成果の逆方向変換は企画・事業判断を自動承認しない。 |
| `HARNESS-L2-020` | 独立したbusiness requirementを導出しない | 隣接stage handoffの互換性確認から新しい価値基準や優先順位を作らない。 |
| `HARNESS-L2-030` | 独立したbusiness requirementを導出しない | case生成は共有技術能力であり、実行・受入・品質判断を所有しない。 |
| `HARNESS-L2-031` | 独立したbusiness requirementを導出しない | 許可入力のreduction/regression候補は業務上の障害優先度・完了判定を新設しない。 |
| `HARNESS-L2-032` | 独立したbusiness requirementを導出しない | packet受渡しはexecutorの実行や業務完了を意味しない。 |

## 旧business資産との照合

`LEGACY-ASSET-A6E2C7F0565E5F804F06`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`、全文SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）を確認した。BR-21にあるbusiness評価・着手条件は今回の固定親に含まれず、別の事業意味として除外する。これは旧BR-21の全体dispositionや拒否ではなく、このL3部分scopeで再利用しない判断である。旧business fileの分類名や文面だけから新しいbusiness要件を起こさない。

関連する機能・受入条件は[機能要件](functional-requirements.md)とそのACを正本にする。追加のbusiness criterionが採択済みL2から必要になった場合は、該当ownerと親revisionを確認したうえでこの正本へ追補し、L10に同じcriteriaの別ACを重複作成しない。
