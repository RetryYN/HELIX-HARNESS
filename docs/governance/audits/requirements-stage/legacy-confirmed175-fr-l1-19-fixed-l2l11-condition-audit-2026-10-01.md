# confirmed175 FR-L1-19 固定L2/L11条件照合（2026-10-01）

旧functional-requirementsのsource-qualified identity `harness/L1-requirements/functional-requirements.md::FR-L1-19`を、旧source/consumerとPO固定f6 L2/L11に照合したread-only静的監査。作成基準mainは`6404579af5c41d686db15b3e3c7a15d98931841c`、固定要求revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。全行、consumer、固定対象、判断record、後発pairのSHAは[JSON](legacy-confirmed175-fr-l1-19-fixed-l2l11-condition-audit-2026-10-01.json)に記録した。

旧source line 50 / asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`の状態は`confirmed`、carryは`preserved_pending_rehome`。queueは`not_individually_compared`・evidenceなしだった。監査結果は旧要求の後継割当0、authority effect none、closureなしである。

## 固定した現行L2/L11

- HELIX-LABO `HELIXLABO-L2-050` / 同IDのL11：改善候補を受けてOS登録・routing、target変更、検証、運用、LABO再観測まで追う。変更後の効果・退行を独立評価し、未完義務を保持する。
- HELIX-INTELLIGENCE `HELIXINTELLIGENCE-L2-010` / 同IDのL11：task属性とLABO Bench evidenceから、未評価を明示したtask別Worker配置案を出す。割当と進行はOSに残す。
- HELIX-INTELLIGENCE `HELIXINTELLIGENCE-L2-011` / 同IDのL11：同一corpus・scopeでmodel/provider結果を比較し、条件不一致は不確実として返す。差替えは自動実行しない。

これらはf6固定blobの採択pairであり、採択を再判断していない。LABO-050は改善循環の一部、INTELLIGENCE-010/011は配置・model能力評価の隣接責務であり、FR19固有のrecipe engineと同一視しない。

## 条件ごとの照合

| 旧FR-L1-19条件 | 固定pairで確認できる範囲 | 残る差分 |
|---|---|---|
| 成功実行recipeの蓄積、`pattern_key` | LABO-050が改善episodeから対象変更・再観測までを追跡 | recipe identity、pattern key、成功判定、保存／保持条件はない |
| 頻出トラブルを予防ruleへ変換 | LABO-050が変更後効果・退行を評価 | failure分類、同種頻出判定、予防rule/gate/detector出力はない |
| skill recommendation改善 | INTELLIGENCE-010はWorker配置案、011はmodel/provider比較 | skill推薦対象・推薦精度oracle・精度改善出力はない |
| L単位注入更新 | 対応する条件なし | layer scoped injection、更新契約・結果判定なし |
| 入力5種（feedback hook、skill発火、recovery log、interrupt履歴、detector結果） | LABO-050は許可観測・episode・experiment・評価済Feedback候補を受ける | 列挙された5種全てのsource契約・結合条件は固定pairにない |
| 出力3種（recipe、予防rule、推薦精度改善） | target change、verification、operation、re-observationの循環 | 旧3出力の生成・精度評価は確認できない |
| skill破棄／改修自動化、`skill_rating`閾値以下を廃止候補化、削除は人の確認（F6=a） | 対応する条件なし | 閾値の数値自体も旧行にない。候補表示から削除権限を推論しない |
| success/failureのevent-sourced recipe log | 対応する条件なし | append-only/event sourceとpattern key保存要件なし |
| PR/GHA/job summaryからfailure eventをpull | 対応する条件なし | GitHub source intake/pull契約なし |
| failure type分類、同種再発検出、preventive PLAN自動提案 | LABO-050はcandidateをOSへ登録・routingする循環 | taxonomy、repeat oracle、自動PLAN提案なし |
| human/AI roster共用audit、GitHub failure sourceとlocal `failure_log`の分離 | 対応する条件なし | roster共有・二source store境界なし |

旧consumerのtechnical requirementsはPhase B条件として`KPI D-07 ≥ 50%`を挙げるが、これは旧実装工程条件であり、FR19のskill rating cut-off値ではない。functional requirementsの別FR-L1-36 consumerは未使用skillの30日判定等を持つが、その別identityの条件をFR19へ混ぜていない。旧行の「閾値」は数値なしのまま保持した。行にある`P1`、`HM-08 / GD-01`、`feedback_hook 5軸`もidentity metadataとして維持し、5軸名や成功oracle、頻度の分母／window／閾値は推測しない。

## 後発の採択pair proximity screen

57候補・11候補・live26の3判断記録にある採択／条件付き採択の明示identityをJSONのcompact indexに全件記録した。個別の近接評価は、recipe/repeat-prevention、task/model qualification、repair/feedback計測、評価済feedbackによる次回配置案入力に接するpairを対象とした。一般workflow、connection、ticket、命名、security／infrastructureなどは、上記FR19出力を定義しない意味分類ごとに非近接とした。

| Pair | 判定 | 近接する範囲と限界 |
|---|---|---|
| HELIXLABO-L2-063 | 近接。57候補判断で採択、live26で限定選択を確認 | 成功修復知見、同種修復反復、予防候補とFeedback handoffは旧recipe/preventionに近い。live26は候補の6 atomすべてでなく3条件だけを選択。FR19全体の後継ではなく、skill recommendation・L単位injection・GitHub pullを含まない。|
| HELIXLABO-L2-065 | 隣接。57候補でD1条件付き採択 | Task/model qualification、first Attempt/retry/effective costは評価材料。recipe蓄積、予防rule、skill推薦更新、injectionではない。|
| HELIXLABO-L2-066 | 隣接。57候補で採択 | 比較時の誤修復・未解消case計数。頻出失敗の分類やrule promotionはない。|
| HELIXLABO-L2-067 | 隣接。57候補でD1条件付き採択 | 最初のeligible candidate結果とAttempt内修復round。065指標等と換算せず、recipe生成も行わない。|
| HELIXLABO-L2-069 | 隣接。57候補で採択 | Ticket返却・再発行後の成立状況と因果主張の制限。recipe accumulationではない。|
| HELIXLABO-L2-070 | 隣接。live26採択 | Scope付きtelemetry/scorecardでunknownを保持。learning promotionやskill推薦更新ではない。|
| HELIXLABO-L2-071 | 隣接。live26採択 | GitHub監査task class別model資格。資格をpermission/assignmentへ変換せず、skill retirementとは別。|
| HELIXINTELLIGENCE-L2-074 | 隣接。57候補で採択 | 評価済みticket feedbackを次回placement proposalに引用する。skill recommendation accuracy向上やL単位injectionの証拠ではない。|

後発pairの採択はそれぞれのsource/registration範囲に限る。LABO-063についてlive26が選択した3条件を旧FR19へ流用・拡張しない。MPRは`registered_proposal`、`authority_effect: none`の記録であり、候補内容や採択の表示からFR-L1-19のformal successorを作らない。

## 非主張と検証

旧条件・例外・負の境界を削除／採択／retireしていない。固定pairの部分接点を完全被覆・代替・実装成立とは扱わない。旧runtime、CLI、hook、CI、testは実行していない。
