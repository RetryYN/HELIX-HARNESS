# LABO Stage 5 — 親050 L3/L10起草時点記録

**状態:** 本文 `8a906345116487b7194bfc1cf344609754f2f962` に対する作成側の時点記録です。要求承認、L3承認、独立review、実行合格を生成しません。過去の監査を変更しません。

## 対象と版

対象は `HELIXLABO-L2-050` / `MPR-RC-HELIXLABO-L2-050-001`、Stage 5、1.0 target candidateです。PO basis `633bf12ea8f948db8ba3d6600179c4a9507377a7` のL2-050とL11-050、およびPO decision rowを固定しました。G0のStage配属は導入revision `59336627f11475456038db80ce6232ee39bbfa8f` に固定しています。G0配属とPO basisは別の根拠であり、Stage候補や配属を本文承認・release包含と読み替えません。

## 固定条項から本文・CASEへの対応
| 固定source atom / locator | 条件 | 対応CASE ID | 現在の文書上の対応 |
|---|---|---|---|
| L2-050:300; L11-050:100 | 観測済み状態と許可されたsource観測 | 01, 02, 03a, 03c | 部分対応: 正常traceは一括。Observed段階だけの遷移fixtureはない。 |
| L2-050:300,302; L11-050:100 | Correlated段階と同一episode identity | 01, 03a, 03b, 03c | 結合不整合の負例は対応。正常段階はCASE-01に束ねられる。 |
| L2-050:300; L11-050:100 | Hypothesized段階 | 01 | 正常traceのみ。独立negativeなし。 |
| L2-050:300,302; L11-050:100 | OS assignmentとWorker resultに結ばれたExperimented段階 | 01, 03b, 03c, 03d, 03e | 列挙されたbinding負例あり。正常experiment証拠はCASE-01に束ねられる。 |
| L2-050:300,302; L11-050:100 and §24#15 | Evaluated段階 | 01, 03g, 10, 22, 23 | 文書上、effect-only欠落とregression-only欠落を別IDの独立条件として記載。実行確認はしていない。 |
| L2-050:300; L11-050:100, §24#13/#15 | Feedback Candidate状態、採択前candidate、発行・候補数だけでの完了主張 | 01, 11, 17, 21 | CASE11のcanonical化、CASE17の発行のみ、CASE21の候補数のみを別fixture定義とoracleで扱う。実行・独立reviewは未確認。 |
| L2-050:300,302; L11-050:100, §24#13/#15 | OS registrationとtarget routing | 01, 05, 04a, 17, 18 | 有無・責務・registration単独主張に対応。 |
| L2-050:300,302; L11-050:100, §24#13 | Target ownerによるtarget change process | 01, 04b, 06, 19, 20 | 責務、revision、変更単独・receipt欠落を扱う。 |
| L2-050:300,302; L11-050:100, §24#14 | Target変更後のverification | 01, 06, 15, 16, 19 | 欠落/stale/誤完了の条件あり。 |
| L2-050:300,302; L11-050:100 | Deployment/operation段階 | 01, 13, 14, 16, 18, 19 | 個別missing resultと誤完了主張あり。 |
| L2-050:300,302; L11-050:100, §24#14/#15 | 変更後のLABO re-observation | 01, 02, 03f, 09, 16, 18, 19 | 対応あり。CASE-09は独立fixtureに数えない。 |
| L2-050:300,302; L11-050:100 | 同一ticket/experiment/target revisionへのbinding | 01, 03a, 03b, 03c, 03d, 03e | 対応あり。 |
| L2-050:300,302; L11-050:100 | 未完義務とsource/target revisionの保持 | 01, 02, 03c, 03f, 15, 16, 17, 18, 19, 20 | 広く対応。全missing義務×全success claimの直積fixtureまではない。 |
| L2-050:300; L11-050:100, §24#15 | 変更後のeffect評価 | 01, 03g, 10, 16, 17, 18, 19, 22 | effect単独欠落fixtureを文書化。別々の成功信号反例とindexを区別。 |
| L2-050:300; L11-050:100, §24#15 | Effect評価とは独立したregression評価 | 01, 03g, 10, 23 | regression単独欠落fixtureを文書化。CASE-03g/10は重複計上しない。 |
| L2-050:300; L11-050:100, §24#13/#15 | 一つの成功信号だけで循環を完了しない | 16, 17, 18, 19, 21 | L2列挙の5つの単独完了主張を別CASEとして文書化。fixture実行は未確認。 |
| L2-050:300; L11-050:100 | 採択前candidateをcanonicalにしない | 11, 17 | 対応あり。 |
| L2-050:300; L11-050:100 | 過去recordを上書きしない | 02, 12 | 対応あり。 |
| L2-050:300,302; L11-050:100; §24#13 | LABO evaluation、OS registration、target-owner changeの責務分離 | 04a, 04b, 17, 18, 19 | 対応あり。 |
| L2-050:300; L11-050:100 | 既知normalとheld-out normalを区別 | 01, 02 | normalとheld-out normalを記述。 |

## CASE定義と索引

現在のFVには30定義があります。旧coverage matrix (`/tmp/labo5-review05-parent050-coverage-worker.md`) は候補revision `a4a365d` 時点の読み合わせ記録であり、effect/regression/candidate-countの旧gap記述を現在状態として再利用していません。既存27定義（table 25、normal bullet 2）を保持し、CASE21（candidate数だけで完了を主張）、CASE22（effect評価のみ欠落）、CASE23（regression評価のみ欠落）を追加しました。独立fixture定義は25、非独立indexは5です。CASE-03gとCASE-10は22/23を参照し、CASE-07/08/09も個別fixtureへ対応します。定義のliteral、AC ID、物理行、raw-LF line SHA、NFR-grade/NFR-verification双方の明示参照行とraw-LF line SHAはJSON内の30行censusに保存しています。件数はfixture実行や被覆合格の証拠ではありません。

## 旧sourceの扱い

旧UIL要件 (`LEGACY-ASSET-02D897E62EF2FA267267`: 43–76, 162–196) とpaired acceptance (`LEGACY-ASSET-0B5B38F146D9538C9A36`: 20–42) を起点とし、event/effect/recurrence観測、変更前後の追跡、反例、過去記録保持を再利用しました。source/target revision結合と現行LABO→OS→target-owner責務は固定L2/L11から再導出しました。旧自律loop、routing、recipe promotion、memory/workflow/runtimeは現行境界へ置換し、旧runtime/test/CIは実行していません。隣接L3/L10 assets `LEGACY-ASSET-C7F0C3B79CBAA72960BF` (L3 requirements:33–83) と `LEGACY-ASSET-FA8C6E69463183D6A19B` (paired acceptance:31–56) も比較資料として識別し、意味を無条件移植していません。full-file/raw-span pinsとledger row pinsはJSONの`source_pins`に記録しています。

## 検証と限界

作成時の静的確認では、6文書のbase `55760269a69e6e740e47bb99d550b618af3361ce` 全bytesをprefixとして保持し、6文書以外に本文変更がないこと、27既存ID保持、3追加、30定義、5列のtable、参照解決、5 indexの独立NFR分母除外を確認しました。`git diff --check` はPASSです。Rootは全6 diffと `govcheck` / `diffcheck` をPASSと報告し、`scfctl validate bindings` は147件、fail 0 / stale 0 / residual 0と報告しました。旧runtime/test/CIは実行していません。

正式review05の15件は親050に直接割り当てられたfindingが0件。対象親ごとの記録へ引き継ぐ。この親のCASE/条件coverageとは別であり、15件の解消を主張しません。

六本文のfull SHA、base prefix SHA/bytes、suffix行・SHA、fixed/PO/G0/legacy source pins、全30 CASE definition censusはこの記録のJSON companionにあります。意味上の最終検収と独立reviewは未成立です。
