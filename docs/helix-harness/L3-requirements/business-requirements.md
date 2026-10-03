# HELIX-HARNESS L3 業務要件（部分草稿の適用範囲記録）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, 011, 022, 023 and Stage 2b HARNESS-L2-012..020, 024, Stage 2c HARNESS-L2-030..032; Stage 3 HARNESS-L2-034,036,038,039,040,041,042,043,044,046,047,049,054; Stage 4 HARNESS-L2-026..029; Stage 5 HARNESS-L2-021,025,033,035,037
paired_l10: ../L10-verification/business-verification.md

Stage 1、Stage 2a、Stage 2b、Stage 2cおよび対象Stage 3親について、対象親から独立した業務基準・価値閾値・事業判断を追加しない。単体工程親は既存ownerと工程契約を定めるが、ここで別の業務ownerや業務stateを割り当てない。これはHELIX-HARNESS全体の業務要件非適用を意味せず、現在の固定親から事業意味を追加しない範囲記録である。

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
| `HARNESS-L2-024` | 独立したbusiness requirementを導出しない | 質問優先と形成資料の十分性は工程契約であり、事業価値・優先順位・人間の合意を推定しない。 |
| `HARNESS-L2-030` | 独立したbusiness requirementを導出しない | case生成は共有技術能力であり、実行・受入・品質判断を所有しない。 |
| `HARNESS-L2-031` | 独立したbusiness requirementを導出しない | 許可入力のreduction/regression候補は業務上の障害優先度・完了判定を新設しない。 |
| `HARNESS-L2-032` | 独立したbusiness requirementを導出しない | packet受渡しはexecutorの実行や業務完了を意味しない。 |
| `HARNESS-L2-034` | 独立したbusiness requirementを導出しない | metric/完成判定契約は技術verification責務。収益・ROIの基準を作らない。 |
| `HARNESS-L2-036` | 独立したbusiness requirementを導出しない | selected verification scopeの完全性から製品価値や全ticket一律policyを推定しない。 |
| `HARNESS-L2-038` | 独立したbusiness requirementを導出しない | reverse content closureは選択scopeの意味traceであり、事業判断を新設しない。 |
| `HARNESS-L2-039` | 独立したbusiness requirementを導出しない | Experience/UI relationから見た目の優先順位や市場価値を推定しない。 |
| `HARNESS-L2-040` | 独立したbusiness requirementを導出しない | ledger catalogは組織の事業分類・投資優先順位を所有しない。 |
| `HARNESS-L2-041` | 独立したbusiness requirementを導出しない | template obligation/gapは事業要望や採否を作らない。 |
| `HARNESS-L2-042` | 独立したbusiness requirementを導出しない | refactor routeから費用対効果・事業継続判断を推定しない。 |
| `HARNESS-L2-043` | 独立したbusiness requirementを導出しない | example adequacyは業務成功率・顧客価値のthresholdを持たない。 |
| `HARNESS-L2-044` | 独立したbusiness requirementを導出しない | obligation portfolioは最小費用/投資判断のbusiness ownerを代替しない。 |
| `HARNESS-L2-046` | 独立したbusiness requirementを導出しない | workflow/Scrum適用はPOが選択したstyle範囲を保持し、事業方式を再選択しない。 |
| `HARNESS-L2-047` | 独立したbusiness requirementを導出しない | specialist benefit evidenceは調達・要員・ROI判断を生成しない。 |
| `HARNESS-L2-049` | 独立したbusiness requirementを導出しない | prototype measurementからユーザー合意、market fit、製品価値を推測しない。 |
| `HARNESS-L2-054` | 独立したbusiness requirementを導出しない | handoff candidateはassignment/実行開始を承認せず、事業責務をOSへ移さない。 |

## 旧business資産との照合

`LEGACY-ASSET-A6E2C7F0565E5F804F06`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`、全文SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）を確認した。BR-21にあるbusiness評価・着手条件は今回の固定親に含まれず、別の事業意味として除外する。これは旧BR-21の全体dispositionや拒否ではなく、このL3部分scopeで再利用しない判断である。旧business fileの分類名や文面だけから新しいbusiness要件を起こさない。

関連する機能・受入条件は[機能要件](functional-requirements.md)とそのACを正本にする。追加のbusiness criterionが採択済みL2から必要になった場合は、該当ownerと親revisionを確認したうえでこの正本へ追補し、L10に同じcriteriaの別ACを重複作成しない。

## Stage 4の業務分類

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| HARNESS-L2-026 | 独立business requirementを導出しない | artifact traceとPattern競合の提示から製品価値・優先順位・承認を作らない。 |
| HARNESS-L2-027 | 独立business requirementを導出しない | 静的source observationを実顧客dataや業務成果に読み替えない。 |
| HARNESS-L2-028 | 独立business requirementを導出しない | 保存designとのtraceはbusiness decisionや要求変更を生成しない。 |
| HARNESS-L2-029 | 独立business requirementを導出しない | proposalは実装、migration、release、顧客価値判断ではない。 |


## Stage 5の業務分類

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| HARNESS-L2-021 | 独立したbusiness requirementを導出しない | 端から端の技術traceと運用評価の受け口から事業成果・ROI・改善実行を推定しない。 |
| HARNESS-L2-025 | 独立したbusiness requirementを導出しない | 設計整合とoracle coverageは業務価値や利用者受入を決めない。 |
| HARNESS-L2-033 | 独立したbusiness requirementを導出しない | failure回帰traceは障害優先順位・business completionを決めない。 |
| HARNESS-L2-035 | 独立したbusiness requirementを導出しない | candidate必要性の説明は投資・採否・予算承認の判断を生成しない。 |
| HARNESS-L2-037 | 独立したbusiness requirementを導出しない | 二段設計workflowは業務目的・利用者価値を再選択しない。 |

Stage 5に独立したbusiness criterionはない。各機能criterionはfunctional L3/L10の同一AC/caseで照合し、売上・費用・市場価値・利用者受入を技術oracleへ読み替えない。旧business-detailのBR-21は今回の固定親に含まれず、この部分scopeでは再利用しない。