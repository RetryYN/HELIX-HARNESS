# 証拠深度集計と実際の判断入力の照合（#2100）

確認mainは`330fbf8fed2d5960fe386443bcceb946bfa74f6c`。本監査はauthorityを持たず、[JSON証拠](evidence-depth-current-consumer-2100-2026-10-10.json)に14入力のhashと実際の採用入力6sourceを固定した。

## 集計の再計算

移動後の`scaffold/research/`へloaderとREADMEのcommandを追随した。現在の14束から768行/726 unique ID/42重複出現を再計算し、既存projectionと一致した。旧分類recordとprojectionは変更していない。0142の機械的一次分類direct 35と0141の選択区間候補direct 26を別欄に保持し、正式更新marker true 0/false 666/missing-or-mixed 60を採否率へ転用しない。既存4負例も確認した。

## 実際の人間判断とBRAIN配置

SEEDFIRST固定案`5b52bee6397125b8b9b8ca7f4a1b695605b0123e`に対するPO回答は[採用記録](../../decisions/seedfirst-knowledge-po-decision-2026-10-10.md)から読む。[BRAIN意味JSON](../../../helix-brain/knowledge/requirements-acceptance-template-knowledge.json)へ配置した内容と[receipt](../seedfirst-knowledge-adoption-receipt-2026-10-10.json)を照合した。知識の限定採用と旧資産全体の正式配置を分ける。

旧source6件の原文区間、file/区間hash、用途、研究束との交差をJSONへ全数記録した。そのうち旧L5 template-authority assetは0107の`direct_product_basis`候補でもあるが、現行の採用根拠はL74–77の意味と比較・PO判断であり、分類ラベルを転記していない。残る5sourceは14束外であり、集計被覆へ追加しない。機械的一次分類0142と選択区間候補0141の資産はこの採用入力に含まれず、意味レビュー済みへ昇格させていない。固定packet・decision・配置JSONにも分類/深度markerを根拠として入れていない。

これは実際の限定知識採用入力の照合であり、726資産すべての意味レビューやconsumer closureを証明しない。元14束の分類状態と正式資産台帳は不変で、機械的35件や選択区間26件の採否は残る。旧sourceを実行せず、schema/runtime/新しい分類器も作らない。

## Issueの完了条件との対応

| #2100の条件 | 確認証拠 |
|---|---|
| 原文保全・一次分類・選択区間・責務比較・正式採否を区別 | 既存projectionの別fieldとmarkerの限界。formal markerを承認扱いにしない |
| 0142 direct35と0141 direct26を無条件合算しない | 現在入力からの再計算とmixed-marker負例 |
| 768行/726 unique、重複と未判断を再計算 | 14入力hash、42重複、formal marker missing/mixed60を保持 |
| 実際の製品配置・人間判断入力で一次分類を意味reviewに昇格しない | main上SEEDFIRSTの固定packet→原文6source/比較→PO回答→限定BRAIN知識の全入力追跡 |
| 原文/候補/反証・authority境界を保持 | 14record/既存projection/資産台帳/L2/L11/MPR/Binding不変、4負例、旧runtime未実行 |

独立review側に、上の証拠が#2100本文の全条件を満たすかとclose可否を確認する。今後の消費側を永続保証するIssueへ範囲を拡大せず、今回の静的確認と全旧資産の移管完了を区別する。要求全体と#1813、#2846は未完のままである。
