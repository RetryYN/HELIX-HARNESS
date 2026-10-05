# HARNESS Stage3 review09 Root追加所見補正監査 — 2026-10-06

本文commit `4b73e6c3ce85c67506c6ca2c55b1ae5609cde1e9`、base `5acae384305b01d10e88eeb2e6406f847baf66df`。正式review comment `IC_kwDOTG8BRc8AAAABZcGRXg` のbody SHA-256 `566da3a02b8c701ff7c53ce9cbd1d732239c56e2f72822a4d8f80358edde7ad6`、53 findingを旧review09監査から引継ぎ、Root追加3群を別記した。Root追加所見の事前固定記録SHA-256は`a6b1e663385c6f36c071938dde4e77673d43daa637ab12289b75bf69fd16635c`。

## 固定範囲とsource pin

6正本はmain prefix byte一致。固定L2/L11 source sectionは26件、旧source crosswalkは13親、paired/consumer source pinは15件を元revisionの全file SHA、span raw-LF SHA、literalで再計算した。詳細はJSONに保存。

## CASE・AC対応

FV CASE定義は1285件unique、全FV定義数はreview09開始時1275件から1285件。Stage3の13親は開始時964定義から974定義へ増え、追加10件はすべて独立fixtureで、index行は追加していない。既存CASEは保持。現行13親974定義はliteral marker（`索引のみ`、`index only`、`index:`）でindex 67件、個別fixture/未明示定義 907件に区別。追加CASE10件は全て個別fixture。対象親別件数はJSONの`case_counts.stage3_parent_counts`に記録。

完全IDのFV内参照dangling 0件、AC dangling 0件、review09 table header/row error 0件、duplicate ID 0件。

049は5 check×TP/FP/FN/TNをtruth labelとdetector出力のfixtureとして記録し、誤分類出力を期待cellの正解と数えない。NVへprecision/recallの分子・分母、0分母unknown、fixture例が最低試行数や新閾値でない点を同期した。

## 過去監査と検証

過去Stage3監査38件はpre-body commitとbyte一致。`git diff --check`を実行、base prefix全件一致。旧runtime/test/CI/Bunは起動していない。本文と監査は別commitにする。

Rootの意味検収、最新main統合木のstale/residual検査、独立reviewは未完。FVの全定義総数にはindexも個別fixtureも含む。追加分10件は個別fixtureと明示したが、既存964行を機械的に再分類していない。
