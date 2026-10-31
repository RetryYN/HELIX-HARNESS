# WR257: CONNECT composite L8のU-ID表

status: scaffold証拠

authority_effect: none

request: `WR257-CONNECT-COMPOSITE-L8-SLIM` / Issue #3510

## 目的と境界

`docs/helix-connect/L8-unit-verification/composite-edge-terminal.json`に、既存source IDを保持したU-ID対応を記録した。HELIX-CONNECTは機構であり、HELIX-HARNESSの製品数には含めない。要求、L4/L5/L9/L3/L10の意味、authority、実行状態は変更しない。

宣言数はL9由来source case 91件、局所probe 27件、source再照合1件、primitive 7件、typed carrier境界1件の計127件である。91件のL9 source IDは`cases`配列に維持し、各case objectに固有U-ID、L5 function/rule refs、短い行別期待を結んだ。U-ID表現をconsumerが読む配列形は維持している。`l5_unit_traceability`は各source caseと固定L9 pointer、L5公開関数4件、failure_rule 26件の対応を示す。

各caseの期待はL3/L10/L4/L5の契約とL9の対象条件から独立に短く導出し、L9 full expectedは固定pointerで参照する。正常系3件・反例系88件を区別し、全件`not_executed`とする。11群60件に同じ対象・期待が重複していた状態を解消し、edge/field/状態、対象、行別判断を区別した。rule本文やowner routeは行へ複製せず、固定L5 refsへ寄せた。

27局所probeは各ID、function、source case/pointer、短い固有反例、期待判断、境界、未実行状態だけを持つ。変更操作列や返却差分値はL8に置かず、固定基準revision `663b75324810a6f004668a1451de5b03acc542c3`とのvalidator内比較に限る。source refがある場合は固定revision/pointerを検証し、比較・由来照合だけに使う。7 primitive caseは比較の関係（対応・相違・判定不能）を記録し、関数全体のreturn objectを置かない。

L5 `unit_case_refs`は元文書に存在しないと記録し、捏造していない。F02 `stop_position`は既存probe `LOCAL-C007-F02-STOP-POSITION-ABSENT`と`...DUPLICATE`、B01 `technical_content`は既存probe `LOCAL-C007-B01-TECHNICAL-TERMINAL-BUSINESS-NOT-ACCEPTED-READONLY-OWNER-PROBE`の固定期待とL3/L10/L4/L5の対応からrule被覆へ結んだ。probe U-IDは既存27宣言のラベルであり、宣言数は増やさない。26 ruleはすべて根拠を持ち、uncovered=0である。

raw fixture、型付きraw fixture、mutation再構成レシピ、full return、fixture digest、実行生成物はL8に置かない。91 source caseは固定L9 source/expected pointerへ結ぶ。L7 test citationは未確認であり、L9/L10参照をtest citationへ読み替えていない。

すべてのcase/probeはfixture-only・`not_executed`であり、合成fixtureの意味を照合する静的索引である。実source/owner適格性、通信、permission、receiver effect、業務Accepted、正式schema/codec、L7 test、実装Ready、製品合格を成立させない。未識別の非等価mutation familyと全意味域閉包は未検証である。

## 宣言と測定

| 項目 | 基準 `663b75324810a6f004668a1451de5b03acc542c3` | 現在 |
|---|---:|---:|
| L9 source cases | 91 | 91 ID・順序・配列形を維持しU-ID対応 |
| 局所probe | 27 | 27 ID・固有反例・短い期待判断を維持 |
| source再照合 / primitive / typed境界 | 1 / 7 / 1 | 同じ宣言数と区別を維持 |
| L5 public function / failure_rule | 4 / 26 | 全関数・全ruleを固定参照へ対応、uncovered=0 |
| L9分岐U-ID / 行別期待 | 91 | 91件、正常3・反例88、全件未検証 |
| L8 ownership cap violations | — | 0件（merge overlayのcheck-childで確認） |
| L5 `unit_case_refs` | 無し | 無しを明記、捏造なし |

fresh fetchおよび`git ls-remote`で確認したorigin/mainと候補HEADのmerge overlay上で`check-child`を実行した。配列consumerの例外なく完了し、L8 ownership cap failureは0件だった。checker全体のexit codeは1で、L9 ownership cap 91件、pair照合およびnegative four-way照合の残存failureがある。全体passとは扱わず、対象revision・overlay commit・raw report hashを`checker-evidence/`へ保存した。

初回`static-evidence.json`は8510d76時点の原bytesとして復元し固定した。後続の測定は旧revision/blob SHAとともにappend-onlyの別証拠へ保存し、現行測定はbindingのartifact一覧から対象L8 hashに一致するappendixを参照する。既存証拠を上書きしない。

## 旧HELIXと失敗事例

対象JSON内の`legacy_comparison`に記録された旧HELIX source/assetと変更前本文を照合した。保持点は検証対象と期待の対を特定し、未確認を成功にしないこと。変更点は旧runtime・CI・実行材料を移さず、現行L9 sourceとL4/L5 pinへ静的に結ぶこと。旧asset本文や実行物は複製していない。

再発防止の起点として、依頼にあるPR #4003 R1（行ごとの意味差を落とさない）とPR #3999 R2 F2（fixture digestをL8に残さない）を照合した。先例PR #4002のCONNECT009 U-ID表形式を参照し、同じ形を無条件で当てはめず、本対象ではL5 `unit_case_refs`が存在しないことを記録した。

## 再現可能な静的照合

`python3 -B scaffold/research/wr257-connect-composite-l8-slim-20261101/validate_static_index.py`は、127宣言のID/順序/件数、`cases`配列、91 U-IDとL9 pointer、各行のL5由来期待、11群60件の行別区別、27 probeの短い反例・期待と固定履歴の比較、4 function/26 ruleの参照とcoverage、L3/L10/L4/L5固定pin、L5 `unit_case_refs`不在、fixture hashの除外、`removed_materials`とDT-VT-105境界を確認する。固定履歴の変更操作列・返却差分値は比較時のみ読み、現行L8へ複製しない。

`python3 -B scaffold/tools/design_verification_checker.py check-child`はmerge overlayで実行し、consumerのcrashがないこととL8 ownership cap failure=0を確認する。`scfctl validate`と`scfctl stale`はScaffold Bindingとsource pinの静的確認に限る。いずれも実装・動作・承認・完了を生成しない。旧CLI、runtime、test、CIは起動していない。
