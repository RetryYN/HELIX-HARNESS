# v1.3条件行の実効次20件比較監査（source-qualified位置21–40）

- 監査基点: `0a91e269671a3a7b30d3ee7d1ef084d959791975`。
- 固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`、SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、資産 `LEGACY-ASSET-02319C2481B9E01698D5`、台帳行956。
- 判定件数: partial 8 / unknown 1 / gap 11。formal successor 0、source condition closure 0、authority effect none。L11受入実行、実装許可、全旧source no-loss closureを主張しない。
- 詳細な原文、line digest、条件単位の意味比較、残余、固定F6参照行とSHAは[JSON証跡](v13-effective-next20-rows21-40-condition-audit-2026-10-01.json)にある。

## 順位の再現

queue `v13-condition-closure-work-queue-2026-09-30.json`（303行、SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`）から、`priority=primary_residual`かつ`queue_state=unresolved_for_closure_work`の255行を対象にした。32 focused auditは各ファイルSHAをjoin proofで固定し、ID tokenだけではなくsource-qualified identity tuple（source item ID、source path、source file SHA、物理行、line SHA）でqueueへ照合する。raw token hit 136件のうち、identityとして有効なhitは124件（明示tuple 116、policy-lines複合5、overlay親子複合2、同一bytes snapshot atom 1）。raw-onlyの不一致12件はidentity hitに数えない。その結果の候補pool131件をsource物理行順に並べ、21–40番を選んだ。

この順位・母集団再構成は[独立join proof](v13-effective-rank-selection-reconstruction-review-2026-10-01.json)（exact commit `0a91e269671a3a7b30d3ee7d1ef084d959791975`、JSON SHA-256 `424c0348780596e14aec1f1234bdd0842f06e54017846edab33fda694429c186`、MD SHA-256 `e7775b06e2f5ae869cf064a9aae2ce970e98887cfdf611015f3522c45e45519f`）に固定される。正しいfirst20はcommit `7ebcbbb0864e331943b993f3b145fddb77f505a2`で2つのJSONと2つのMDをpinし、ID列を継承する。今回の20 IDはfirst20と重複しない。

## 選定された20条件

| 実効位置 | Source ID / 行 | 比較状態 | 固定F6の比較先 | 残余の要点 |
|---:|---|---|---|---|
| 21 | `REQSRC-SUP-00077` / 102 | 部分比較 | HARNESS-L2-002／003、HARNESS-L2-002／003 | 旧sourceの詳細なReverse出力・状態機械条件とcurrent pairのexact clause crosswalk。 |
| 22 | `REQSRC-SUP-00081` / 107 | 部分比較 | HARNESS-L2-002／003、HARNESS-L2-002／003 | 参照先FR/SRV各行、宣言oracle、confirmed親文書・受入文書とのsource-condition単位対応。 |
| 23 | `REQSRC-SUP-00089` / 119 | 部分比較 | HARNESS-L2-002／003、HARNESS-L2-003／004、HARNESS-L2-016 | Design Refactorの判断根拠と機能追加分離を固定F6で直接確認できるoracle。 |
| 24 | `REQSRC-SUP-00097` / 129 | 部分比較 | HARNESS-L2-002、HARNESS-L2-002 | compatibility inventoryとcurrent projection/registryの分離、欠落・drift・invalidを独立に扱うexact oracle。 |
| 25 | `REQSRC-SUP-00105` / 139 | 部分比較 | HARNESS-L2-002／003 | 旧parent development-style enumを固定しない前提での移行条件・旧source固有意味の明示的照合。 |
| 26 | `REQSRC-SUP-00108` / 142 | 不明 | 特定できず | execution modeの意味・owner・適用範囲をcurrent adopted L2/L11のどこへ置くかはunknown。 |
| 27 | `REQSRC-SUP-00112` / 147 | 部分比較 | HARNESS-L2-002、HARNESS-L2-002 | route identity推測禁止、曖昧入力、旧route移行のexact source-level条件。 |
| 28 | `REQSRC-SUP-00114` / 149 | 直接対応を未特定 | 特定できず | legacy route identifierのsurface別出力制約と非統一条件。 |
| 29 | `REQSRC-SUP-00146` / 190 | 直接対応を未特定 | 特定できず | typed signal/condition/style/execution-form境界。 |
| 30 | `REQSRC-SUP-00147` / 192 | 直接対応を未特定 | 特定できず | classification/policy registry version、requirements/classification decision linkageを含むreceipt contract。 |
| 31 | `REQSRC-SUP-00150` / 195 | 直接対応を未特定 | 特定できず | command IDとprogram/argvの再検証境界。 |
| 32 | `REQSRC-SUP-00151` / 196 | 直接対応を未特定 | 特定できず | receiptから除外する旧mode/model/catalog/route値。 |
| 33 | `REQSRC-SUP-00153` / 199 | 直接対応を未特定 | 特定できず | disposition enumのexact set。 |
| 34 | `REQSRC-SUP-00154` / 200 | 直接対応を未特定 | 特定できず | classification/policy outcome enumのexact set。 |
| 35 | `REQSRC-SUP-00155` / 201 | 直接対応を未特定 | 特定できず | exit-class mappingとconsumerが類似名称で推定しない条件。 |
| 36 | `REQSRC-SUP-00161` / 208 | 直接対応を未特定 | 特定できず | approval dispositionとexit mapping。 |
| 37 | `REQSRC-SUP-00163` / 210 | 直接対応を未特定 | 特定できず | classification decision dispositionとexit mapping。 |
| 38 | `REQSRC-SUP-00165` / 213 | 部分比較 | HARNESS-L2-002／003、HARNESS-L2-002／003 | 同一HEAD/policy digest binding、承認receipt有効性とactionの結び付け。 |
| 39 | `REQSRC-SUP-00167` / 215 | 直接対応を未特定 | 特定できず | consumer acceptance boundary。 |
| 40 | `REQSRC-SUP-00170` / 220 | 部分比較 | HARNESS-L2-002、HARNESS-L2-002 | source tokenからcurrent typed identityへのexact one-way conversion set。 |

### `REQSRC-SUP-00089`（位置23）

この旧source行は、Design Refactorの分類根拠としてsemantic similarity、影響consumer、oracle、dependency graphを使い、名称類似だけで統合しないことを求める。同じ行はPerformance Refactorの計測条件を事前固定し、機能追加を同じepisodeへ混載しないことも定める。固定F6 L2/L11には、意味を保つrefactor、Backflow、SR3のexactly-one route、Performance Refactorの測定条件と前後比較があるためpartialとした。4つのDesign Refactor判断根拠と機能追加混載禁止の直接oracleは固定F6で確認できず残す。この判定と残余は固定F6 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`に対する結果であり、後発decisionはF6比較へ遡及適用しない。

`origin/main` snapshot commit `50686b6762788574cb471967e8c24846d3dd56ae`のHDEC-REQUIREMENTS-57-2026-09-29は`HARNESS-L2-042`（`MPR-RC-HARNESS-L2-042-001`）を採択している（[decision](../../decisions/po-decision-2026-09-29-57candidates.md)、decision file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、line 47）。採択されたL2/L11 source revisionは`318ec4a04abb3c1cc17111b3d939f913facd5fd3`。L2/L11 file SHAは`111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`／`3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、section digestは`7da6b3394cbc96bdf028a4738000554e1cf7a946595c4abf43504b24968f34eb`／`3ba00726800c61f1de165e48e6f62ea4359a368a50a9e9cd1517deb09df395f9`。coverage receipt（`harness-refactor-episode-coverage-receipt-2026-09-28.json`、同snapshotでのSHA-256 `6d10e3976c204ad15d739b86ace90b08595c00463f7aecfbcf2778f8c98aa15e`）は、2つのL119 revision atomについてPerformance Refactorを既採択L2/L11-016に、Design Refactor条件とepisode分離を042に保全するsplitを記録する。receipt作成時の`unadopted`表記はPO決定前の記録である。後発決定はこのF6比較を置き換えず、旧`REQSRC-SUP-00089`の全条件closureまたはformal successor assignmentを示さない。

別identityの`HARNESS-L2-051`（PHCAP-08 stage-exit evidence）は、HDEC-REQUIREMENTS-11-2026-09-29 line 31で採択されている（[decision](../../decisions/po-decision-2026-09-29-11candidates.md)、commit `50686b6762788574cb471967e8c24846d3dd56ae`、decision file SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`）。L2-051は00089のDesign Refactor条件とは別identityであり、この比較の根拠ではない。

### 旧artifactの位置40行を位置41へcarryover

旧raw-token 119候補pool artifactの原bytesは[履歴snapshot JSON](history-snapshots/v13-effective-raw119-rows21-40-e7482ab-original-2026-10-01.json)と[Markdown](history-snapshots/v13-effective-raw119-rows21-40-e7482ab-original-2026-10-01.md)に保持し、snapshot commit `c005b9b738f0a73660b29ee39e97c1b061d453db`で再現できる。元HEAD `e7482ab4d189add0b437972540973ff86cd26f40`はbranch未公開の歴史的provenanceである。旧artifactは`REQSRC-SUP-00171`を旧位置40に選んでいたが、source-qualified再構成では実効位置41となる。過去の意味比較記録はJSONの`out_of_slice_carryover`へ全文保持し、今回の選定20件・判定件数には含めない。このauditは当該条件の削除、closure、意味の再判定を主張しない。旧artifactは誤った順位の過去記録としてpinするだけで、今回の選定根拠にはしない。

## source、asset、固定pairとauthority

旧archive source全体、資産明細台帳（file SHAと行956のSHA）、source snapshotのSHAをJSONに記録した。選定行20件のsource path、source file SHA、物理行、line SHAはqueue identityと照合した。19件は旧artifactのmeaning comparisonを再確認したうえで再利用し、source/F6 line pinsを再計算した。新規の`00089`はline119と近接contextを旧sourceから独立に採取した。

2026-09-28のPO判断はL1とfixed L2/L11 revision `f6dad2a...`、明示24候補の範囲を定める。固定L2/L11ファイル全体のSHAと、比較した各行のSHAをJSONに記録した。2026-09-26のV-valley decisionはread-onlyの判断史としてpinし、固定F6の対象範囲を広げない。未採択候補や後続decisionからF6へ要求意味を追加していない。

## 非主張と確認範囲

この20件の順位はsource identityによる選定であり、意味被覆や全未解決条件数を示さない。partial、unknown、gapは個別source条件の今回の固定pair比較の結果であり、要求採択やformal successorを生成しない。source identity hitは意味closureを証明せず、identity hitがないことも他所に意味比較がない証拠ではない。

検証は文書、ID、line/file SHA、順位、MD/JSON同期の静的確認に限定した。旧CLI、runtime、test、CIは実行していない。
