# WR257: CONNECT composite L8のU-ID表

status: scaffold証拠

authority_effect: none

request: `WR257-CONNECT-COMPOSITE-L8-SLIM` / Issue #3510

## 目的と境界

`docs/helix-connect/L8-unit-verification/composite-edge-terminal.json`を、既存のsource case IDと局所probeを保持したU-ID表へ縮約した。HELIX-CONNECTは機構であり、HELIX-HARNESSの製品数には含めない。要求、L4/L5/L9/L3/L10の意味、authority、実行状態は変更しない。

保持した宣言は、L9由来source case 91件、局所probe 27件、同一sourceの再照合1件、primitive 7件、typed carrier境界1件。91件それぞれに固有U-IDを付け、既存L9 source case IDは別列に保った。各分岐U-IDを固定L9 JSON Pointerへ、L5公開関数4件を固定L5 signature/algorithm pointerへ結び、L5 failure_rule 26件も個別に照合した。L9 `failure_reasons.area`が根拠となるruleはL9 caseまたは既存局所probeのU-IDへ結んだ。L9にfailure例がなかったF02 `stop_position` は `LOCAL-C007-F02-STOP-POSITION-ABSENT` と `...DUPLICATE`、B01 `technical_content` は `LOCAL-C007-B01-TECHNICAL-TERMINAL-BUSINESS-NOT-ACCEPTED-READONLY-OWNER-PROBE` の既存期待差分で対応した。元L3/L10（F02はfunctional pair、B01はbusiness pair）、L4 contract、L5 ruleの固定pointerを照合し、probe期待値全体は基準L8との静的比較で保った。26 ruleすべてに既存分岐またはprobeの根拠がある。局所probeへのU-IDは既存27宣言のラベルであり、宣言数を増やさない。L5 `unit_case_refs`の不在とは別の対応表であり、`unit_case_refs`は捏造していない。

各91分岐行には、識別子、役割、独立oracle参照、L5契約から導いた期待判断、正常系/反例系、未検証状態を記録した。期待判断はL9の全返却値を転記せず、行の条件とL5 failure ruleまたは関数契約pointerから導いた。L9 expectedは独立oracleへの既存参照としてのみ残す。共通の合成fixture限定・qualification境界は`common_expectation_boundary`に一度だけ記録した。27局所probeは事前固定した期待差分全体を保ち、大きな配列・recordの共通値のみrevisionとJSON Pointerを持つ`source_ref`で参照する。`source_ref`は既存値を指す索引であり、期待値の生成器ではない。

raw fixture、inline mutated bytes、全返却値、fixture digestはL8から外した。期待差分全体の重複配列は参照へ集約した。L9の91 source caseは期待oracle全体と正確なpointerで結び、L5に`unit_case_refs`がない事実を記録した。L5 unit caseへの偽の対応は作っていない。L7 test citationも未確認のままとし、L9/L10 source参照をtest citationへ読み替えていない。

すべての行は`not_executed`であり、合成fixtureの内容比較を記録する索引に限る。実source/owner適格性、通信、permission、receiver effect、業務Accepted、正式schema/codec、L7 test、実装Ready、製品合格を成立させない。未識別の非等価mutation familyと全意味域閉包は未検証である。

## 容量と宣言の照合

| 項目 | 基準 `663b75324810a6f004668a1451de5b03acc542c3` | 現在 |
|---|---:|---:|
| L8 bytes | 1,014,166 | 340,192 |
| source case | 91 | 91 IDを維持 |
| 局所probe | 27 | 27 IDと期待差分全体を維持 |
| source再照合 / primitive / typed境界 | 1 / 7 / 1 | 同数を維持 |
| L5 public function / failure_rule | 4 / 26 | 4関数を全対応、26 ruleをL9分岐および/または既存局所probe期待差分へ照合（uncovered=0） |
| L9分岐U-ID / 行の期待 | 91 | 91個の固有U-IDと固定L9 pointer、L5から導いた期待判断を対応（正常系3・反例系88、全件未検証） |
| L5 `unit_case_refs` | 無し | 無しを明記、捏造なし |

実測値は`static-evidence.json`に記録した。検査は文書ID、JSON Pointer、source revision/bytes pin、意味表の保持を確かめる静的照合であり、製品testではない。

## 旧HELIXと失敗事例

対象JSON内の`legacy_comparison`に記録された旧HELIX source/assetと変更前本文を読み直した。保持する点は検証対象と期待の対を特定し、未確認を成功にしないこと。変更点は旧runtime・CI・実行材料を移さず、現行L9 sourceとL4/L5 pinへ静的に結ぶこと。旧asset本文や実行物は複製していない。

再発防止の起点として、依頼にあるPR #4003 R1（行ごとの意味差を落とさない）とPR #3999 R2 F2（fixture digestをL8に残さない）を照合した。先例PR #4002のCONNECT009 U-ID表形式を参照し、同じ形を無条件で当てはめず、本対象ではL5 `unit_case_refs`が存在しないことを記録した。各source caseの意味・oracle pointer、全probeの期待差分値、所有境界、未検証点は本対象から個別に保った。

## 再現可能な静的照合

`python3 -B scaffold/research/wr257-connect-composite-l8-slim-20261101/validate_static_index.py`は、基準L8との宣言ID/順序/件数比較、L9 source/expected pointerとbasisの照合、全27期待差分の復元比較、L4/L5/L9 exact bytes pin、91 U-IDとL9分岐の一対一対応、各行のL5契約由来期待とpointer、正常系/反例系/未検証状態、L5の4 public function/26 failure_ruleのpointerとcoverage、27局所probe U-IDと期待差分の基準比較、L3/L10/L4/L5固定source pointer、L5 `unit_case_refs`不在、fixture hash除去、6-key `removed_materials`とDT-VT-105境界を確認する。`--record`は同じ結果を`static-evidence.json`へ記録する。

`scfctl validate`と`scfctl stale`はscaffold Bindingとsource pinの静的確認である。いずれも実装・動作・検証合格・承認を生成しない。旧CLI、runtime、test、CIは起動していない。
