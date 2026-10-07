# LABO Stage 5 親050/061/063 旧source・本文pin追補

- 基準main: `e7a695d4b2de64aec69a1a123de2fde33be724cf` (`origin/main`, 2026-10-08)。
- authority effect: `none`。この追補は既存audit/decisionを変更せず、承認・実行・完了を生成しない。
- 先行audit 6ファイルのSHA-256は併記JSONの`previous_reports`に固定した。旧recordは不変。

## 固定親revisionの訂正

親050の旧audit JSONは固定sourceをL2:298–302/L11:98と記録していた。公式委任decision `helix-labo-stage5-parent050-l3-l10-po-decision-2026-10-06.md` が指定する固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の正しい範囲はL2:298–303（raw-LF SHA `cf8c0d89eed3ce45df65af0f5813f94a2e8bfc0508547c5157f11ac117f3f907`）、L11:120–126（`9cb6f2b92ea221e92a410a39cc4012ac2050337d08a41ac51bac7863a8e8c5bd`）。この過去pin誤記を追補で直す。

親061と063の公式委任decisionはauthority sourceを`318ec4a04abb3c1cc17111b3d939f913facd5fd3`とする。061はL2:457–469/L11:205–215、063はL2:480–489/L11:225–231。以前の監査が使った`633bf12...`は後続本文snapshotとして区別し、該当する固定span bytesの比較元には使えるがauthority sourceの同一性には置き換えない。318ec4a固定spanと現行mainの該当spanはSHA一致を実検算した。

## 050の旧sourceとpaired consumer

対象FRは固定された11段階を同一ticket/experiment/target revisionで追い、L2-022 assignmentとL2-028 Worker resultを別証拠として結ぶ。OS registration/routing、target ownerの変更・verification・deployment/operation、LABOの再観測を分け、効果とregressionも別判定にする。各identity/receipt不成立と責務変異、部分成功からの完了誤判定を個別caseで扱い、03gはラベル、07–10は索引として分母外と明記。BR/BVは独立KPIを追加せず、NFRは32個の独立fixtureと5個の非fixtureを分ける。前回の050該当6本文spanと現在mainの対象spanは全てSHA一致した（full-file SHAが変わった文書もあり、現行full SHAをJSONへ固定）。

旧UIL requirementsのR-01/02/15（43–76）、change/effect/terminal（162–196）、recipe/recurrence（175–187）、lifecycle（210–220）を読み、paired UIL acceptance AC-001–023（20–42、特にAC-020 line39）を確認した。関連sourceとして旧Pillar P4-02/HAC-P4-02a/b（requirements:155–156, 237–242; paired HAT-P4-02 line112）、Infinity Loop FR/AC section 33–83とpaired HAT-HIL-02 line34を読み、形式上のconsumer関係を区別した。asset ID、full SHA、全span SHAはJSONに記録した。

## 061/063の旧sourceとpaired consumer

061では旧Bench R-04のtask snapshot 15 field（96–120）とR-08の版/digest・author/judge・履歴（143–147）、paired acceptance AC-005/006（32–33）とAC-012/013（39–40）を実読した。現行FR/FV/NFR/NFRVの対象scope SHAは先行auditと一致し、required fieldの識別、hidden oracleのWorker context隔離、author/judgeの独立、history保持、authority非生成、固定ownerへ戻す不成立区分に新差分を確認しなかった。

063では旧Pillar HR-FR-P4-02 line155、HAC-P4-02a/b lines239–240とpaired HAT-P4-02 line112を直接source/consumerとして読み直した。旧UIL R-11/R-12 lines175–187および210–220、paired UIL-AC-017/018 lines36–37は関連sourceとして区別した。現行FR/FV/NFR/NFRV scope SHAは先行auditと一致し、LABO knowledge/OS registration/対象owner変更・採否/HARNESS verification/post-operation observationの責務分離、cause/applicability/revisionの分離、unknown保持、索引の非二重計上に新しい差分を確認しなかった。

## Findingsと限界

追加で確定した本文gapはない。050公式decisionにR1/R2として既に記録された「OS ticket/receipt不備とexperiment/target binding不成立の細分化根拠が固定親にない」「CASE-19/29の戻し先が固定根拠から明示されない」は現存する既知残余として残す。061公式decision R1–R13、063 R1–R17も既知残余のまま保持する。これらを新gateや承認停止条件に拡張しない。

未確認: archive全source/全consumerの網羅性、fixture実行、独立review。旧runtime/CLI/test/CIは実行していない。本結果は限定spanの意味照合であり、全274親完了ではない。

機械可読な全file/span pinsと各既知残余の分類は [`root-labo-stage5-050-061-063-supplement-e7a695d4.json`](/tmp/root-labo-stage5-050-061-063-supplement-e7a695d4.json) にある。
