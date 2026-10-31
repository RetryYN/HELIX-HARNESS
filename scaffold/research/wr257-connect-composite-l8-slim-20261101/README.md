# WR257: CONNECT composite L8のU-ID表

status: scaffold evidence

authority_effect: none

request: `WR257-CONNECT-COMPOSITE-L8-SLIM` / Issue #3510

## 目的と境界

`docs/helix-connect/L8-unit-verification/composite-edge-terminal.json`を、既存のsource case IDと局所probeを保持するU-ID表へ縮約した。HELIX-CONNECTは機構であり、HELIX-HARNESSの製品数には含めない。要求、L4/L5/L9/L3/L10の意味、authority、実行状態は変更しない。

保持した宣言は、L9由来source case 91件、local probe 27件、同一sourceの再照合1件、primitive 7件、typed carrier境界1件。91件それぞれに新しいU-IDを付与し、既存のL9 source case IDは別列で保持した。各branch U-IDを固定L9 pointerへ、L5公開関数4件を固定L5 signature/algorithm pointerへ結び、各L5 failure_rule 26件も個別に照合した。L9 failure_reasonsのareaが根拠として解決するruleをL9 caseまたは既存local probeのU-IDへ結んだ。L9側にfailure例がなかったF02 `stop_position` は `LOCAL-C007-F02-STOP-POSITION-ABSENT` と `...DUPLICATE`、B01 `technical_content` は `LOCAL-C007-B01-TECHNICAL-TERMINAL-BUSINESS-NOT-ACCEPTED-READONLY-OWNER-PROBE` の既存期待deltaで対応した。元L3/L10（F02 functional pair、B01 business pair）、L4 contract、L5 ruleの固定pointerを照合し、probe期待全値はbase L8との静的比較で保持する。26 ruleすべてに既存branch/probe根拠がある。local probeへのU-IDは既存27宣言のラベルであり件数を増やさない。L5 `unit_case_refs`が無いこととは別の対応表であり、L5のunit_case_refsを捏造していない。各行は識別子、役割、独立oracle参照、差分意図または期待、fixture-only境界、未実行状態を持つ。27 local probeは事前固定した期待deltaの全値を保持し、pin済みL4/L9の既存値と一致する大きな配列・recordのみrevisionとJSON Pointerを持つ`source_ref`で参照する。`source_ref`は既存値の所在を共有する索引で、期待値の生成器ではない。

raw fixture、inline mutated bytes、full return全体、fixture digestはL8から外した。期待delta全値の重複配列は参照へ集約した。L9の91 source caseはL9期待全体と正確なpointerで結び、L5に`unit_case_refs`がない事実を記録した。L5 unit caseへの偽の対応は作らない。L7 test citationも未確認のままとし、L9/L10 source refをtest citationへ読み替えない。

すべての記録は`not_executed`であり、合成fixtureの内容比較の索引に限る。実source/owner qualification、通信、permission、receiver effect、業務Accepted、正式schema/codec、L7 test、実装Ready、製品合格を成立させない。未識別の非等価mutation familyと全意味域閉包は未検証。

## 容量と宣言の照合

| 項目 | base `663b75324810a6f004668a1451de5b03acc542c3` | 現在 |
|---|---:|---:|
| L8 bytes | 1,014,166 | 271,965 |
| source case | 91 | 91 IDを維持 |
| local probe | 27 | 27 IDと期待delta全値を維持 |
| source reuse / primitive / typed | 1 / 7 / 1 | 同数を維持 |
| L5 public function / failure_rule | 4 / 26 | 4関数を全対応、26 ruleをL9 branchおよび/または既存local probe期待deltaへ照合（uncovered=0） |
| L9 basic branch U-ID | 91 | 91個の固有U-IDと固定L9 pointerを対応 |
| L5 `unit_case_refs` | 無し | 無しを明記、捏造なし |

実測値は`static-evidence.json`に記録した。チェックは文書ID、JSON Pointer、source revision/bytes pin、意味表の保持を確かめる静的照合であり、製品testではない。

## 旧HELIXと失敗事例

対象JSON内の`legacy_comparison`に記録された旧HELIX source/assetと、変更前本文の記述を読み直した。旧記述の保持点は、検証対象と期待の対を特定し、未確認を成功にしないこと。変更点は旧runtime・CI・実行材料を移さず、現行のL9 sourceとL4/L5 pinへ静的に結ぶこと。旧assetの本文や実行物は複製していない。

再発防止の起点として、依頼にあるPR #4003 R1（行ごとの意味差を落とさない）とPR #3999 R2 F2（fixture digestをL8に残さない）を照合した。先例PR #4002のCONNECT009 U-ID表形式を参照し、同じ形を無条件で当てはめず、本対象ではL5 `unit_case_refs`が存在しないことを記録した。各source caseの意味・oracle pointer、全probeの期待delta値、所有境界、未検証点は本対象の内容から個別に保持した。

## 再現可能な静的照合

`python3 -B scaffold/research/wr257-connect-composite-l8-slim-20261101/validate_static_index.py`は、base L8との宣言ID/順序/件数比較、L9 source/expected pointerとbasisの照合、全27 expected deltaの復元比較、L4/L5/L9 exact bytes pin、91 U-IDとL9 branchの一対一対応、L5の4 public function/26 failure_ruleのsource pointer・rule witness coverage、27 local probe U-IDと期待deltaのbase比較、L3/L10/L4/L5固定source pointer、L5 `unit_case_refs`不在、fixture hash除去、6-key `removed_materials`とDT-VT-105境界を確認する。`--record`は同じ結果を`static-evidence.json`へ記録する。

`scfctl validate`と`scfctl stale`はscaffold Bindingとsource pinの静的確認である。いずれも実装・動作・検証合格・承認を生成しない。旧CLI、runtime、test、CIは起動していない。
