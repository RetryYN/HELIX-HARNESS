# LABO-070 review01 post-body時点監査

対象branch `l3-labo-stage5-parent070`、base `ceda1c53b53c53fffb8c23f394add1f2b809deb1`、body commit `8907d4dbb87f0335cd06afd106a37d85575ca0df`。統合checkpoint `/tmp/root-labo070-review01-integration-checkpoint.json` とv2候補を照合した。

## 六文書のfull/prefix/suffix pins

| 文書 | full SHA-256 / bytes | base prefix SHA-256 / bytes | Stage 5 suffix SHA-256 / bytes | LF (full/prefix/suffix) |
|---|---|---|---|---|
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `8afba7c65ea17a99577e0f2aecffcf28ba6f83f841d5e0f7de89a012b2af733c` / 322100 | `bc98d31fe6930feab7cf495910ddad472d0d36ba72d684f2225423f4d938babd` / 314756 | `036c4e5af615ac70be145a30b460b4e89916629118f7eb9362ce7b2834a5a202` / 7344 | 1892 / 1859 / 33 |
| `docs/helix-labo/L3-requirements/business-requirements.md` | `c889da99e33be3bdd8f17cbdfdca27be3a6cc093fe685dbf5ddc3e22ea0f7362` / 18847 | `b43af039eb0a27cb08bddbbd6e7b8789d477bdc3b15465425704013ab735de64` / 17357 | `c665f7e9296aed2dd50944ed75ae51734d0837ca759f3b4955f5f6284fa4d967` / 1490 | 153 / 144 / 9 |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | `f00cf1a5b36c64586ff68d3d0cfdcf5fd9d274d8e2cba9fda13126c730d8257f` / 74166 | `566456959d5cd9a993c9caf5ea0c1231f7ec332406ba853ba11933abca8a7743` / 70950 | `645295d1e8bc7b226f8d07df38592a3d911df7764a44b06da790c2bebaf9ffac` / 3216 | 271 / 255 / 16 |
| `docs/helix-labo/L10-verification/functional-verification.md` | `a69bf5b85474cf872c83381db0c7602dbc38b4cccdd5d5809b85585fb93f503d` / 544485 | `7d0567cf852a3b5b6218e808b89f74cebe5e8eaea61bf42a8fba8de3dde78b6c` / 487998 | `4f954af6f7c681d52f16fa804d09511f4a3b593e3ff4a7fabfa60066390c771a` / 56487 | 3407 / 3297 / 110 |
| `docs/helix-labo/L10-verification/business-verification.md` | `33459eb91b4c057bcb4ed31a5b333409076aef368d880ac36422fdff283f52f8` / 17673 | `d1d5748c4e38bf53b6da97d49009caa12f2b508bc6690e097cca412737e8a4d7` / 15332 | `d4eb73db5b72e80e4ad82f8d32da690f9cc5d21f1b13a1d66d75a05cb701334f` / 2341 | 161 / 146 / 15 |
| `docs/helix-labo/L10-verification/nfr-verification.md` | `2bb2875de91fd6a0000fce0a36f541bb1b72fa15cd4266e7c67f2029b3899999` / 64953 | `e89cedb7d9697c211d2366b2de30838ae0d9e4cc27e3aedaa0c19a28b1d7c946` / 60802 | `5348617f96b528d5be60acef655c8f44ce94252ce23d2a1316d425bcf72f48d0` / 4151 | 218 / 195 / 23 |

全六文書のfull SHA/bytesはRoot checkpointのactual pinと一致。各文書はbase文書のraw bytesに区切りLF一つを加えたprefixに続き、Stage 5 suffixはLF改行のみで末尾LFを持つ。CRはfull/prefix/suffixとも0。base prefix SHAはJSONの各記録を参照。

## v2候補とRoot補正

v2候補JSON SHA-256: `e503b21717dd366d5f3ed75e1b25a134a22f74319c48a47d0955e430e541ea19`（checkpoint記録値 `e503b21717dd366d5f3ed75e1b25a134a22f74319c48a47d0955e430e541ea19`）。Root補正はCASE99行の重複source責務区分返却文を1回削除した一点だけ。候補前後行と実body行はJSONに全文収録し、CASE99の意味・変異・scopeは不変。

## 固定親・旧source・review記録

固定L2/L11-070および068の実節SHAはJSON `fixed_parent_and_po.fixed_parent_pins` に収録。採択record live26 line49: `| `HELIXLABO-L2-070` | 承認（通常採択22件に含む） | `MPR-RC-HELIXLABO-L2-070-001` | `sha256:07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533` | `sha256:c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1` |`（line SHA `0cc2b7ac34f2a9dec7a072910ba43c90547a7cd8cdee9e337a8701412b8ca052`）。旧source line 399とconsumer span 84–104の実pinはJSON `legacy_sources` に収録。

旧84 literal定義/raw LF SHAをJSONに保持し、84 IDすべてが現行normative tableに存在し、literal hashが一致することを照合した。正式review raw R1–R6（comment 6025034326本文内）と初回review依頼rawはJSON `formal_review_raw` に保持。

## FV確認と限界

FVは101行、101 unique ID、全行6列。CASE98の次行がCASE99で、CASE99–101は同一normative table内に連続する。旧84 IDも保持。fixture実行・独立review・承認は未実施。R3–R6は未解消残余。ID数だけで意味完全性は主張しない。

## 六文書のactual Stage 5本文

### `docs/helix-labo/L3-requirements/functional-requirements.md`

SHA-256 `036c4e5af615ac70be145a30b460b4e89916629118f7eb9362ce7b2834a5a202`; 7344 bytes.

```markdown
## Stage 5 — HELIXLABO-L2-070 補助運用telemetryとAttempt scorecard併記

固定親はPO live26の49行が採択した `MPR-RC-HELIXLABO-L2-070-001`。source revision `ea6f756f96a7370de78e412d737c7a7ed472114a` のL2:561–574 SHA `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、L11:297–307 SHA `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1`をraw-LFで照合した。旧候補が参照した0abb2894の同範囲とbytesは一致し、採択状態はPO記録で確認する。

### LABO-070-FR-01 — 補助運用telemetryとAttempt scorecard併記

HELIXLABO-L1-005をprimary、L1-011をcontextとして、旧source line 399から固定親が選択した9 atomに限るscope付きscorecardを候補として提示する。既存のL2-059比較basis、L2-006品質評価、L2-001 provenanceを置換しない。対象task/scope、対象revision、window、source identity/revision、eventまたはresult receiptを各値に結び、条件が揃わない値はunknown/未評価/unavailableとする。異なるscope/revisionを混ぜず、欠落を0や成功へ変換しない。

1. **4種のduration**：queue wait、active time、review wait、Human waitを別々のfieldで提示する。各durationは適用sourceの開始・終了event、clock source、unit、occurred_at/observed_at、windowを保持する。境界が不明・無効ならunknown/invalidとする。重なる待ち時間を排他的と推定して按分せず、4値の合計でL2-059のend-to-end wall-clockを再定義しない。
2. **escaped defects**：既存の要求/受入ownerが適用するquality oracleとrevisionを用い、そのscopeで受入済みの対象へ関係付けられた受入境界後の検証済みdefect eventだけを観測値として示す。oracle、対象scope、受入境界、window、threshold、severity、合否を新設しない。oracle/event/relation/母数/追跡完全性が確かめられない場合は確定count/rateを出さずunknown/未評価とする。L2-006のquality結果と同一視しない。
3. **rollback/Recovery**：許可済みsourceのevent identity、scope、発生/結果state、receiptのみを観測する。費用・時間はL2-059の同一event/receipt参照に従い二重算入しない。欠落は「発生なし」でなくunknown。観測結果からLABOがrollbackを開始/決定したり、実行・復旧権限を作ったりしない。
4. **observer overhead**：計測・観測に直接帰属する実測資源とsource receiptをtask workから分けて示し、sourceの定義・単位を保つ。根拠のない推計や換算、未観測値の0扱いをしない。L2-059費用への算入は同じreceipt参照で一度だけとする。
5. **evidence freshness**：L2-001の既存source identity/revision/provenanceを保ち、sourceが持つeffective/occurred時刻とobserved時刻との差を観測値として示す。時刻欠落/不整合はage unknown/invalid。ageからfresh/staleの閾値、期限、適格性、採否、実験許可を作らない。
6. **Attempt系との併記**：scopeに適用可能なら、L2-067のfirst-eligible resultと同一Attempt内repair rounds、L2-068のdistinct total Attempt countを同じscorecardに別fieldとして置く。各定義revision/grain/identity/scope/receiptを保ち、換算・合算・代替しない。対象候補またはreceipt不在・不採択・scope不一致なら理由付きunavailable/unknownとし、併記完了を主張しない。070から067/068の採択を生成しない。
7. **既存指標境界**：telemetryを旧12指標へsilent renameせずidentity/version対応を割り当てない。coverage atomのtarget/denominator/oracle等、固定親が未解決としたatomはsource holdingに残す。

### 受入条件候補

- **LABO-070-AC-01 — 出典付きscorecard**：9 selected atomの適用可能な値を明示scope/revision/window/event-or-result receiptに結ぶ。各fieldの定義・単位・identityを保持し、出力値とsource receiptまたはsource-defined計算値の一致をL10正常fixtureで照合する。対象revisionとsource identity/revisionの一致はCASE-01およびCASE-99–101で確認する。
- **LABO-070-AC-02 — 正常な異単位field**：source定義に一致する異なるunitのfieldは別fieldのまま表示し、相互換算・合算しない。
- **LABO-070-AC-03 — 欠落・不一致の隔離**：必要event/clock/unit/time/source/revision/oracle/scope/relation/receiptが欠落・不明・矛盾・staleなら該当fieldだけunknown/invalid/unavailableとし、0・成功・不存在に置き換えない。他の根拠あるfieldは別に保持する。
- **LABO-070-AC-04 — 固定親の境界保持**：4 durationは独立、escaped defectは既存oracleと受入済対象/受入境界後の検証済みrelationに限定、rollbackは観測だけ、overheadは直接測定だけ、freshnessはage観測だけ。新window/threshold/severity/expiry/decisionを作らない。 出力生成境界はL10 CASE-85–93およびCASE-96–98で出力fieldごとに単独確認する。
- **LABO-070-AC-05 — Attempt co-presentation**：scope適用可能な067/068 fieldを元定義とreceiptどおり独立表示し、不在・不一致のfieldは理由付きunavailable/unknownにする。換算・合算・代替で完全scorecardに見せない。

### 旧sourceとの対応・限界

旧`LEGACY-ASSET-3A15E5645D2D2A59DFF5` の `execution-ticket-requirements.md:399`を意味再導出の起点とし、固定親が選んだ9 atomだけを保持する。旧runtime/storage/testをbyte再利用しない。sourceの別receiptにある067/068関連3 atom、source holdingの2 unresolved atom、行399の他3 atom・列挙外tail・隣接行・旧candidate全体のsuccessor/closureを主張しない。旧12指標、旧scorecard、旧severity/thresholdを現行へ移さない。

### 責務区分と出力境界

許可済みsource event/assignmentは既存source owner（OS等）の責務区分、quality/acceptance oracleは既存要求owner、data/execution permissionは適用されるSECURITY境界に従う。固定親が定める責務区分を保ち、individual source/owner identityが不明な場合はそのidentityだけをunknownとして別に保持する。observer overheadの直接計測資源またはreceiptが不足する場合、値はunknownとして、その資源・receiptを提供する既存source owner責務区分へ無条件で返す。個別source/owner identityが不明なら、そのidentityだけをunknownとして別に保持し、責務区分を消さず、新ownerも作らない。CASE-10/15/19のように入力が有効で070自身の出力が誤る場合、入力側sourceへ返却せず当該出力処理を訂正する。

CASE-85–93およびCASE-96–98は、source event・oracle・threshold・計測許可・要求採択・実験/run許可・Worker assignment・rollback permission/execution・L3承認・requirement completionの出力生成を一つずつ拒否し、他の根拠あるscorecard fieldと既存状態を保つ。これらのCASEは固定親が禁じる生成の確認であり、権限/decisionを新設しない。revision照合のCASE-99–101はAC-01のscorecard一致確認であり、権限生成fixtureではない。

```

### `docs/helix-labo/L3-requirements/business-requirements.md`

SHA-256 `c665f7e9296aed2dd50944ed75ae51734d0837ca759f3b4955f5f6284fa4d967`; 1490 bytes.

```markdown
## Stage 5 — HELIXLABO-L2-070 補助運用telemetryとAttempt scorecard併記

固定親はPO live26の49行が採択した `MPR-RC-HELIXLABO-L2-070-001`。source revision `ea6f756f96a7370de78e412d737c7a7ed472114a` のL2:561–574 SHA `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、L11:297–307 SHA `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1`をraw-LFで照合した。旧候補が参照した0abb2894の同範囲とbytesは一致し、採択状態はPO記録で確認する。

070が加える業務面の提供は、既存task/scopeに属する補助telemetryを、出典と適用範囲を保つscorecardとして観測可能にすることに限る。既存12指標・L2-059の比較basisやL2-006のquality評価を変更せず、採否・実験・rollback・実行許可を行わない。4種の待ち時間、escaped defect、rollback/Recovery、observer overhead、evidence freshness、067/068値を区別して表示できることを機能要件とL10で確認する。

旧source line 399のselected telemetry/coshow atomsを意味再導出する。旧HIL scorecard全体や旧consumerの業務成果を移管・採択したとは扱わない。

scorecardからsource event、oracle/threshold、計測または実行許可、要求採択、Worker assignment、rollback操作、L3承認、完了を生成しない。これら固定親の境界は、独立した業務成果を追加せずL10の単独出力fixtureで照合する。

```

### `docs/helix-labo/L3-requirements/nfr-grade.md`

SHA-256 `645295d1e8bc7b226f8d07df38592a3d911df7764a44b06da790c2bebaf9ffac`; 3216 bytes.

```markdown
## Stage 5 — HELIXLABO-L2-070 補助運用telemetryとAttempt scorecard併記

固定親はPO live26の49行が採択した `MPR-RC-HELIXLABO-L2-070-001`。source revision `ea6f756f96a7370de78e412d737c7a7ed472114a` のL2:561–574 SHA `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、L11:297–307 SHA `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1`をraw-LFで照合した。旧候補が参照した0abb2894の同範囲とbytesは一致し、採択状態はPO記録で確認する。

根拠付きの測定設計候補。数値、期間、severityの新閾値、性能SLOは設定しない。parameterごとのPO承認を求めない。

| 項目 | 測定対象 | 根拠・比較 | 限界 |
|---|---|---|---|
| duration fidelity | queue wait / active time / review wait / Human waitを個別値として保持。source-defined start/end event, clock, unit, occurred/observed time, scope/windowを追跡。 | 固定L2の4 duration clauses、FV CASE-01、05–09、23–50、52–53、63。 | 重複排他の推定、4値加算、059 wall-clock再定義なし。 |
| escaped-defect fidelity | 許可済みoracle/revision、受入済対象/scope、受入境界後のverified event relation、適用母数/追跡完全性を保持。 | 固定L2 escaped-defects節、FV CASE-01、03e、10–11、56–58、64。CASE-10は有効oracleのままの出力誤り拒否、CASE-56–58は入力不足時の既存責務区分への返却を個別照合。 | 新oracle/scope/window/severity/threshold/合否なし。 |
| rollback/Recovery fidelity | source event/result receipt、identity/scope/stateを保持し、059費用・時間とのreceipt参照を一回に保つ。 | 固定L2 rollback clause、FV CASE-03f/g、59–62、70、85、90–91。missing source inputは既存event/assignment責務区分へ返し、CASE-85/90/91は出力権限を個別拒否。 | 観測から操作・trigger permissionを生成しない。 |
| observer overhead | source定義に従った直接測定資源をtask workから区分。 | 固定L2 overhead clause、FV CASE-03h、12、71。 | unknownを0や推計値にしない。 |
| evidence freshness | sourceの有効時刻と観測時刻の差だけを値として提示。 | 固定L2 freshness clause、FV CASE-03i、14–15。CASE-15は有効入力からの誤ったauthority出力を拒否し、070出力処理を訂正。 | ageからexpiry/admission/permissionを作らない。 |
| metric identity | 067/068の定義revision/receiptと070 field identityを保持。 | 固定L2 Attempt co-presentationと既存12 metric境界、FV CASE-16–21、65–73。CASE-19の有効067/068 inputからの換算出力を拒否し、CASE-68はtotal countとresult state双方をunknownにする。 | 065 retry等への換算・合算・代替、旧12指標へのsilent renameなし。 |

authority境界の単独出力field確認はFV CASE-85–93/96–98に対応する。target revision/source revisionの一致確認はFV CASE-99–101に対応する。性能・保持・監視周期を数値化する根拠は固定parentにない。必要な値が生じたら既存source定義と対の測定候補を記録し、閾値を推測で追加しない。

```

### `docs/helix-labo/L10-verification/functional-verification.md`

SHA-256 `4f954af6f7c681d52f16fa804d09511f4a3b593e3ff4a7fabfa60066390c771a`; 56487 bytes.

```markdown
## Stage 5 — HELIXLABO-L2-070 補助運用telemetryとAttempt scorecard併記

固定親はPO live26の49行が採択した `MPR-RC-HELIXLABO-L2-070-001`。source revision `ea6f756f96a7370de78e412d737c7a7ed472114a` のL2:561–574 SHA `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、L11:297–307 SHA `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1`をraw-LFで照合した。旧候補が参照した0abb2894の同範囲とbytesは一致し、採択状態はPO記録で確認する。

対象は固定L2/L11が選択した9 atomに限る。旧FVの84 literalと各raw hashは添付JSONの `old_84_case_literal_audit` に保全し、本文の現行normative定義は旧84 IDを意味再導出した84行、CASE-85、およびCASE-86..101の16行からなる101行の6列表とする。raw literalは現行oracle、実行結果、現行完全性の証拠として扱わない。Index/alias行は独立変異として二重計上しない。行数・ID保持は意味完全性、独立性、実行合格または承認を示さない。

| CASE ID | AC ID | baseline | single mutation / normal setup | expected oracle / responsibility return | 範囲・制限 |
|---|---|---|---|---|---|
| `L10-LABO-070-CASE-01` | `LABO-070-AC-01` | 正常scorecard入力B0。全行の対象revisionは選択値T0で一致し、各source identity/revisionは有効receiptの実値である。9 selected atomの適用可能fieldへsource receiptと定義revisionを与え、各時刻・unit・identity・scope/window・event/result値を固定する。067/068値は独立元receiptに束縛する。異unitは各source定義と一致する別field。適用不可fieldは別正常profileで原因を一つずつ固定する。 | なし（正常/未見正常の入力） | 各出力値をsource receiptの値と照合する。各行の対象revisionは入力T0と完全一致し、各source identity/revisionも対応するreceiptの実値と完全一致する。revisionを省略・混在・別値へ置換しない。4 durationはsource-defined同clockの開始/終了時刻差を各unitのまま計算した期待値と一致し、event identity/clock/unit/occurred_at/observed_at/scope/windowも元sourceと一致する。escaped-defect観測は既存oracle/revisionで検証済みの受入境界後event集合とrelationに一致し、適用母数/追跡完全性の範囲だけを数える。rollback/Recoveryのidentity/scope/発生・結果stateは元event receiptと一致する。overheadは直接計測資源/receiptの値・定義・単位をそのまま保持し、ageはsource時刻とobserved時刻の差に一致する。適用可能な067 first-eligible/repair-round値と068 count/stateは元定義revision/identity/grain/scope/receiptの値にそれぞれ一致する。067/068不在の別正常profileでは各理由が入力の不採択/不在/scope不一致条件に対応することを照合し、そのfieldのみunavailable/unknownにする。059費用/時間の同一receiptは一度だけ算入し、換算・合算・代替をしない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-02` | `LABO-070-AC-02` | CASE-01同様の正常scorecard入力。新source eventのうち契約/単位/時刻が適用できるatomだけ計測し、残りはunknown/unavailableとする。 | なし（正常/未見正常の入力） | 適用可能なfieldは定義元・scope/window・unit・receiptへ結び、適用できないfieldはunknown/unavailableとする。換算・合算しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03a` | `LABO-070-AC-03` | 参照先主fixtureの入力をそのまま使用。 | なし（索引/alias。新たな変異を加えない） | CASE-06の主fixtureを参照する索引であり、独立変異を追加しない。主fixtureのoracleを確認し、本行を二重計上しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03b` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | active timeの実測unitだけが固定sourceのunitと不一致 | 換算せず当該fieldをunknown/invalidとし不足理由を示す。source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03c` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | review waitの実測unitだけが固定sourceのunitと不一致 | 換算せず当該fieldをunknown/invalidとし不足理由を示す。source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03d` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | Human waitの実測unitだけが固定sourceのunitと不一致 | 換算せず当該fieldをunknown/invalidとし不足理由を示す。source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03e` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | escaped-defect quality oracleだけ欠落（relationと他入力は保持） | defect countを確定せず、oracle不足は既存の要求owner責務区分へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03f` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | rollback result receiptだけ欠落 | event不在とせずunknown。戻し先: source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03g` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | Recovery result receiptだけ欠落 | event不在とせずunknown。戻し先: source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03h` | `LABO-070-AC-03` | CASE-01と同じ有効scorecard入力。observer overheadの対象資源・source責務区分は既知で、個別source/owner identityも確認できる。 | 単独変異: overheadの直接計測資源receiptだけを欠落させる。他fieldと責務区分は保持する。 | overhead値をunknown/未評価とし、直接計測資源またはreceiptを提供する既存source owner責務区分へ無条件で返す。個別identityが別途不明ならidentityだけunknownとし、責務区分を消さない。新ownerを作らない。 | 固定L2/L11の該当atomに限定。unknown値を0や推計へ変換しない。 |
| `L10-LABO-070-CASE-03i` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | evidence timestampだけ不正 | freshness ageをinvalid/unknownとし、既知のsource timestamp/evidence責務区分へ無条件で返す。個別source/owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03j` | `LABO-070-AC-03` | 参照先主fixtureの入力をそのまま使用。 | なし（索引/alias。新たな変異を加えない） | CASE-19の主fixtureを参照する索引であり、独立変異を追加しない。主fixtureのoracleを確認し、本行を二重計上しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-03k` | `LABO-070-AC-03` | 参照先主fixtureの入力をそのまま使用。 | なし（索引/alias。新たな変異を加えない） | CASE-70（rollback/Recovery費用の二重算入）とCASE-71（observer overheadの二重算入）を別々に参照する索引であり、新規変異を束ねず各主fixtureを重複計上しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-04a` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | LABOがtelemetry thresholdを作成 | 拒否し、固定親が個別特定しない判断ownerはunknownとして保持する。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-04b` | `LABO-070-AC-03` | 参照先主fixtureの入力をそのまま使用。 | なし（索引/alias。新たな変異を加えない） | CASE-51のrollback permission発行拒否を参照する索引であり、同じ変異を二重計上しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-54` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象durationのsource-defined definition revisionは既知でcurrent。 | 単独変異: 対象durationのdefinition revisionだけを欠落させる。 | duration値を定義不明としてunknownにし、定義とeventを提供する既存source責務区分へ無条件で返す。個別source/owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-55` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象durationのsource-defined definition revisionは既知でcurrent。 | 単独変異: 対象durationのdefinition revisionだけをstaleにする。 | stale定義をcurrentへ自動流用せず対象durationをunknown/未評価にし、定義/eventの既存source責務区分へ無条件で返す。個別source/owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-56` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、既存quality oracle/revision、受入済対象/scope、受入境界後のverified eventとそのrelationが揃う。 | 単独変異: verified defect eventと受入済対象を結ぶrelationだけを欠落させる。 | escaped-defectと断定せず該当fieldをunknown/未評価とし、relation/受入判断の既存要求・受入責務区分へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-57` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、既存quality oracle/revision、対象relation、適用母数と追跡完全性receiptが有効。 | 単独変異: escaped-defect母数または追跡完全性receiptだけを欠落させる。 | count/rateを確定せずunknown/未評価にし、quality/acceptanceの母数・追跡責務を持つ既存要求/受入責務区分へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-58` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、既存要求ownerのquality oracleとそのrevisionがcurrent。 | 単独変異: escaped-defect quality oracle revisionだけを欠落させる。 | 合否/countを確定せず、quality oracleを提供する既存要求owner責務区分へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-59` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、許可済みsourceのrollback event identity、scope、result state、receiptが有効。 | 単独変異: rollback event identityだけを欠落させる。 | rollback計数/resultをunknownとし、source event/assignmentの既存責務区分へ無条件で返す。個別source/owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-60` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、許可済みsourceのrollback event scopeと他receiptが有効。 | 単独変異: rollback event scopeだけを欠落させる。 | 別scopeを混ぜず該当fieldをunknown/未評価にし、source event/assignmentのscope責務区分へ無条件で返す。個別source/owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-61` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、許可済みsourceのRecovery event identity、scope、result state、receiptが有効。 | 単独変異: Recovery event identityだけを欠落させる。 | Recovery結果を確定せずunknown/未評価とし、source event/assignmentの既存責務区分へ無条件で返す。個別source/owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-62` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、許可済みsourceのRecovery event scopeと他receiptが有効。 | 単独変異: Recovery event scopeだけを欠落させる。 | 別scopeを混ぜず該当fieldをunknown/未評価にし、source event/assignmentのscope責務区分へ無条件で返す。個別source/owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-63` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、queue waitの開始/終了event、clock、unit、scope/window、receiptとsource宣言unitが有効。 | 単独変異: queue waitのunitだけを固定sourceの宣言unitと矛盾させる。その他の入力はCASE-01と同一。 | 換算せずqueue wait fieldをunknown/invalidとし、unitを定義するsource event/assignmentの既存責務区分へ無条件で返す。個別source/owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-64` | `LABO-070-AC-03` | 参照先主fixtureの入力をそのまま使用。 | なし（索引/alias。新たな変異を加えない） | CASE-58のescaped-defect oracle revision欠落を参照する索引であり、主fixtureのoracleを使い新たな変異を追加しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-05` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | queue-wait start eventだけ欠落 | queue waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-06` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | queue-wait end eventだけ欠落 | queue waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-07` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | queue-wait clock identityだけ欠落 | queue waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-08` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | queue-wait occurred_atだけ欠落 | queue waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-09` | `LABO-070-AC-03` | 参照先主fixtureの入力をそのまま使用。 | なし（索引/alias。新たな変異を加えない） | CASE-52（4種duration加算）とCASE-53（重複時間按分）を別々に参照する索引であり、複合変異を作らず各主fixtureを二重計上しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-10` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、既存要求ownerのquality oracle/revision、受入済対象/scope、受入境界後event receiptとfinding relationが有効。対象findingはsourceにより未確認である。 | 単独変異: 070の出力fieldだけを、未確認findingから escaped_defect=true へ昇格する。oracle・source・relation・他のscorecard入力と出力は不変。 | escaped-defectへの誤昇格を拒否し、有効な既存oracle/revisionと未確認stateを保つ。これは入力oracle不足ではなく070自身の候補出力誤りであり、当該出力処理を訂正する。要求ownerへ返却責務を追加しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-11` | `LABO-070-AC-03` | CASE-01と同じ有効入力。適用oracle/revisionとsource evidenceは有効で、入力側の不足はない。 | 単独変異: 070出力fieldだけでoutcome後に選んだoracleを採用する。oracle・source・他fieldは不変。 | 結果後のoracle選択を拒否し、既存oracle/revisionと元の入力を保持する。入力不足ではなく070自身の誤出力として当該出力処理を訂正し、正常な要求ownerへ不足責務を返さない。 | 固定L2/L11の該当atomに限定。新oracle・決定権を生成しない。 |
| `L10-LABO-070-CASE-12` | `LABO-070-AC-03` | CASE-01と同じ有効入力。overheadの直接計測資源receipt、定義、unit、source identity/revisionは揃い有効である。 | 単独変異: 070出力fieldだけでreceipt値の代わりにoverhead推計値を出す。他inputとreceiptは不変。 | 推計出力を拒否し、有効receiptの実測値・定義・unitを保持する。入力は正常でsource返却は行わず、070自身の出力処理を訂正する。新ownerを作らない。 | 固定L2/L11の該当atomに限定。実測値を推計・0扱いへ置換しない。 |
| `L10-LABO-070-CASE-13` | `LABO-070-AC-03` | 参照先主fixtureの入力をそのまま使用。 | なし（索引/alias。新たな変異を加えない） | CASE-70（rollback/Recovery費用）とCASE-71（observer overhead）の二重算入を別々に参照する索引であり、各主fixtureを二重計上しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-14` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | freshness timestampの欠落だけを変更。その他の入力は `CASE-01` と同一 | ageをunknownとし、既知のsource timestamp/evidence責務区分へ無条件で返す。個別identity不明は別fieldでunknownとする。ageからexpiry/authority/permissionを生成しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-15` | `LABO-070-AC-03` | CASE-01と同じ有効入力。evidence freshness age、既存source identity/revision/provenance、authority stateはすべて有効で、許可・権限出力は未生成。 | 単独変異: ageからauthority/permissionを生成する出力fieldだけを追加する。age・source・既存authority stateは不変。 | authority/permission生成を拒否し、ageと既存authority stateを保持する。入力は有効なのでsource不足への返却は行わず、070自身の誤出力として当該出力処理を訂正する。新owner/permissionを作らない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-16` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | 067 fieldのOS Attempt identity receiptだけ欠落。predicate/oracle・他fieldはCASE-01と同一 | 067 fieldを理由付きunavailableとし、complete co-present scorecardとしない。欠落したAttempt identity receiptはOSへ戻す。他fieldで代替しない。067 Attempt identity/evidenceの既存OS責務区分へ無条件で返し、個別identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-17` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | 068 fieldのOS Attempt identity receiptだけ欠落。predicate/oracleと他fieldはCASE-01と同一 | 068 fieldを理由付きunavailableとし、067/065で代替せずcomplete co-present scorecardとしない。欠落したAttempt identity receiptは既存OS責務区分へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-18` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | scope差だけを変更。その他の入力は `CASE-01` と同一 | 同一scorecard値として混ぜない 戻し先: LABO。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-19` | `LABO-070-AC-03` | CASE-01と同じ有効入力。適用可能な067 first-eligible/same-Attempt repair値と068 distinct Attempt値の定義revision、identity/grain、scope、receiptはそれぞれ有効で独立する。 | 単独変異: 070出力fieldだけで067と068の値を換算または代替する。両元metricの定義・receipt・他fieldは不変。 | 換算・代替出力を拒否し両元metricを別fieldのまま保持する。入力sourceは正常なのでmetric sourceへ返却せず、070自身の誤出力として当該出力処理を訂正する。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-20` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | unresolved coverageを結果なしに補ってclosureする。その他の入力は `CASE-01` と同一 | unknown/unresolvedを保ち、closure扱いしない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-21` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | 070の9 atomを既存12 metricへ混同だけを変更。その他の入力は `CASE-01` と同一 | metric identityを分ける 戻し先: LABO。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-22` | `LABO-070-AC-03` | 参照先主fixtureの入力をそのまま使用。 | なし（索引/alias。新たな変異を加えない） | CASE-04a（threshold生成拒否）とCASE-51（rollback permission生成拒否）を別々に参照する索引であり、複合変異を作らず各主fixtureを二重計上しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-23` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | queue waitのobserved_atだけ欠落 | queue waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-24` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | queue waitのmeasurement windowだけ欠落 | queue waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-25` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | queue waitのsource identityだけ欠落 | queue waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-26` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | queue waitのreceiptだけ欠落 | queue waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-27` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | active timeのstart eventだけ欠落 | active timeをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-28` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | active timeのend eventだけ欠落 | active timeをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-29` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | active timeのclock identityだけ欠落 | active timeをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-30` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | active timeのoccurred_atだけ欠落 | active timeをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-31` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | active timeのobserved_atだけ欠落 | active timeをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-32` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | active timeのmeasurement windowだけ欠落 | active timeをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-33` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | active timeのsource identityだけ欠落 | active timeをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-34` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | active timeのreceiptだけ欠落 | active timeをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-35` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | review waitのstart eventだけ欠落 | review waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-36` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | review waitのend eventだけ欠落 | review waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-37` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | review waitのclock identityだけ欠落 | review waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-38` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | review waitのoccurred_atだけ欠落 | review waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-39` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | review waitのobserved_atだけ欠落 | review waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-40` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | review waitのmeasurement windowだけ欠落 | review waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-41` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | review waitのsource identityだけ欠落 | review waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-42` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | review waitのreceiptだけ欠落 | review waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-43` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | human waitのstart eventだけ欠落 | human waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-44` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | human waitのend eventだけ欠落 | human waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-45` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | human waitのclock identityだけ欠落 | human waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-46` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | human waitのoccurred_atだけ欠落 | human waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-47` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | human waitのobserved_atだけ欠落 | human waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-48` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | human waitのmeasurement windowだけ欠落 | human waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-49` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | human waitのsource identityだけ欠落 | human waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-50` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、対象fieldはsource定義どおり有効。 | human waitのreceiptだけ欠落 | human waitをunknownとし、source event/assignmentの既存責務区分（OS等の既存source owner）へ無条件で返す。個別owner identity不明は別fieldでunknownとする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-51` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | LABOがrollback permissionを発行。その他の入力は `CASE-01` と同一 | permission発行を拒否。rollbackの実行ownerをこの候補から推定しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-52` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | 4種durationを加算。その他の入力は `CASE-01` と同一 | 各durationを別fieldのまま保持し、059のend-to-end時間へ合算しない。戻し先: LABO。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-53` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | 重複する待ち時間を排他的に按分。その他の入力は `CASE-01` と同一 | 重複時間を推測按分せず各durationを保持する。戻し先: LABO。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-65` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | LABO candidateの採択だけを根拠に、別定義の067/068結果も採択済みと主張。その他はCASE-01と同一 | 067/068の独立定義・receiptを参照し、070候補からその採択を推定しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-66` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | 067 fieldのpredicate revisionだけ欠落。OS Attempt identity・oracle・他fieldはCASE-01と同一 | 067 fieldを理由付きunavailableとし、固定親のtask/要求owner責務区分へ無条件で返す。個別owner identity不明は別fieldでunknownとする。complete co-present scorecardとしない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-67` | `LABO-070-AC-03` | OS Attempt identity receiptと他の全fieldは有効で、LABOが068集計を行う | LABO出力から068 distinct Attempt identity fieldだけ欠落 | 068 fieldを理由付きunavailableとし、OS receiptの不足と混同せずLABO集計を未完に保つ。complete co-present scorecardとしない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-68` | `LABO-070-AC-03` | B0と同じscope S0のAttempt identity A/B/C/D、scope全体のcapture-completeness receipt、identity集合の完全性receipt、event/correction lineage、全result receiptが揃い有効。 | 単独変異: Aのresult receiptだけを欠落させる。他のreceipt、identity、scope、event、state、完全性証拠は変えない。 | result receipt欠落だけでscope内total Attempt countをunknown/未評価とし、Aのresult stateも別fieldでunknownにする。完全性receiptがあっても総数4を確定しない。既知の観測source/OS記録責務区分へ無条件で返し、個体identity不明は別fieldでunknownとする。065/067で代替しない。根拠: 固定L2-068のAttempt記録完全性条件と、`MPR-RCPT-LABO-ATTEMPT-COUNT-2026-09-28` coverage receipt（S3C）。未mergeの068本文CASEには依存しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-69` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | outcomeを確認した後にobservation windowだけを選択する | 結果後に選んだwindowで判定せず未評価にする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-70` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | rollback/recovery費用を059の対象費用へ二重算入する。その他はCASE-01と同一 | 059費用への重複算入を拒否し、rollback/recovery費用を該当別fieldに保つ。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-71` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | measurement overheadを対象作業費用へ二重算入する。その他はCASE-01と同一 | overheadと対象作業費用を分離し二重計上を拒否する。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-72` | `LABO-070-AC-03` | 有効な068 distinct Attempt identity数と065 retry_countを別々に保持する | 068 identity数を065 retry_count+1で置き換える | 068の元identity数を保持し、retry_countから換算した値で置き換えない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-73` | `LABO-070-AC-03` | CASE-01の有効scorecard入力で、変異対象fieldはsource定義どおり有効。 | 067 fieldのoracle revisionだけ欠落。predicate/Attempt identity/他fieldはCASE-01と同一 | 067 fieldを理由付きunavailableとし、固定親のtask/要求owner責務区分へ無条件で返す。個別owner identity不明は別fieldでunknownとする。co-present complete scorecardとしない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-85` | `LABO-070-AC-04` | 許可済みsourceからrollback event identity・scope・result state・receiptを観測し、scorecardへ記録。LABOは操作しない。 | 観測eventから単一の`rollback_trigger_requested=true` output fieldを生成する。 | field生成を拒否。観測結果は保持するが、rollbackを開始/決定せずtrigger/permissionを作らない。固定L2のrollback/Recovery責務境界だけを判定する。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-86` | `LABO-070-AC-04` | CASE-01と同じ有効scorecard入力。requirement_adoption出力は未生成。 | 単独変異: `requirement_adopted=true` fieldだけを生成する。 | 要求採択を生成せず、他のscorecard fieldを保持する。PO decision/採択状態を変えない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-87` | `LABO-070-AC-04` | CASE-01と同じ有効scorecard入力。measurement_permission出力は未生成。 | 単独変異: `measurement_permission=true` fieldだけを生成する。 | 計測許可を生成せず、既存SECURITY等のauthority境界を保持する。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-88` | `LABO-070-AC-04` | CASE-01と同じ有効scorecard入力。experiment_run_permission出力は未生成。 | 単独変異: `experiment_run_permission=true` fieldだけを生成する。 | 実験/run許可を生成しない。許可判断は既存SECURITY境界に従い、対象fixtureから推定しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-89` | `LABO-070-AC-04` | CASE-01と同じ有効scorecard入力。worker_assignment出力は未生成。 | 単独変異: `worker_assignment` fieldだけを生成する。 | Worker assignmentを生成しない。既存OS assignment状態を変更しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-90` | `LABO-070-AC-04` | CASE-01と同じ有効scorecard入力。rollback_permission出力は未生成。 | 単独変異: `rollback_permission=true` fieldだけを生成する。 | rollback permissionを生成せず、観測eventを操作authorityへ変換しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-91` | `LABO-070-AC-04` | CASE-01と同じ有効scorecard入力。rollback_execution出力は未生成。 | 単独変異: `rollback_execution=true` fieldだけを生成する。 | rollbackを実行せず、観測結果だけを保持する。既存操作責務をこの候補から決めない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-92` | `LABO-070-AC-04` | CASE-01と同じ有効scorecard入力。L3 requirement approval出力は未生成。 | 単独変異: `l3_requirement_approved=true` fieldだけを生成する。 | L3承認を生成しない。既存委任authorityを変更しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-93` | `LABO-070-AC-04` | CASE-01と同じ有効scorecard入力。requirement completion出力は未生成。 | 単独変異: `requirement_complete=true` fieldだけを生成する。 | requirement completionを生成せず、測定receipt/scorecardを完了判断に変換しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-94` | `LABO-070-AC-03` | 有効な時間event receiptを持ち、既存source event/assignment責務区分とtest-only individual owner identityが既知。source category、event、clock、unit、scope/window、他receiptは有効。 | 単独変異: individual owner identityだけを欠落させる。source category、event、clock、unit、scope/window、全receiptは保持する。 | 個別owner identityのみunknownとして保持する。測定fieldは有効receiptに基づく値を保持しunknown/未完へ変えない。既知source event/assignment責務区分を維持し、個体identity unknownを測定根拠欠落と混同しない。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-95` | `LABO-070-AC-03` | active-time start/end eventが同じsource-defined clock identityで有効。source event/assignment責務区分、other scorecard fieldとreceiptもCASE-01相当で有効。 | 単独変異: end eventのclock identityだけをstart eventと異なる値にする。 | 異なるclock間の差を計算/換算せずactive-time fieldをunknown/invalidとし、既知source event/assignment責務区分へ無条件で返す。個別source/owner identity不明は別fieldでunknownとし、他fieldは保持する。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-96` | `LABO-070-AC-04` | CASE-01と同じ有効入力。許可済みsource event/receiptだけが存在し、LABO生成eventはない。 | 単独変異: `source_event_created=true` output fieldだけを生成する。 | source eventを生成せず、許可済みsource observationだけを保持する。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-97` | `LABO-070-AC-04` | CASE-01と同じ有効入力。適用oracleは既存要求ownerが供給し、LABO生成oracleはない。 | 単独変異: `acceptance_oracle_created=true` output fieldだけを生成する。 | oracleを生成/差し替えず、既存要求ownerのoracle・revisionに留める。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-98` | `LABO-070-AC-04` | CASE-01と同じ有効入力。候補が追加するthresholdは存在しない。 | 単独変異: `telemetry_threshold` output fieldだけを生成する。 | thresholdを生成せず、固定親が定めない値をunknown/未設定のままにする。 | 固定L2/L11の該当atomに限定。個別identity不明は既知責務区分と分離し、件数から完全性を主張しない。 |
| `L10-LABO-070-CASE-99` | `LABO-070-AC-01` | CASE-01と同じ有効入力。全source identity/revisionと他の対象revisionは有効。 | 単独変異: 一つのscorecard行のtarget revision出力fieldだけを欠落させる。source receipt、他行、他fieldは不変。 | target revision出力fieldの欠落を合格させず、対象revisionをunknown/未評価とする。入力は正常なので070自身の出力誤りとして当該出力処理を訂正し、source責務区分へ不足を返さず、他の根拠あるfieldは保持する。 | 固定L2の対象revision・同一scope条件に限定。T0/T1を混ぜて集計しない。 |
| `L10-LABO-070-CASE-100` | `LABO-070-AC-01` | CASE-01と同様に各fieldが実source receiptと一致する有効入力。別aggregateのT0行とT1行はそれぞれ有効で、別集計に保たれている。 | 単独変異: T0とT1の二行を同一scorecard aggregateへ混在させる出力fieldだけを生成する。他の入力・fieldは不変。 | 異なる対象revisionを含むaggregateを合格させず、T0/T1を別集計のまま保持する。正常入力に対する070自身の混在出力誤りとして当該出力処理を訂正し、sourceへ不足を返さない。 | 固定L2の異なるscope/revisionを同一集計に混ぜない境界に限定。新window/閾値を作らない。 |
| `L10-LABO-070-CASE-101` | `LABO-070-AC-01` | CASE-01と同じ有効入力。各sourceのtarget revision、identity、source_revision値、他receiptは有効。 | 単独変異: 一つの正常source入力receiptのsource_revision値だけを欠落させる。LABOの出力field欠落ではなく、他のreceipt/inputは不変。 | 当該fieldをunknown/未評価として合格させず、当該source identity/revision/provenanceを提供する既存source owner責務区分へ無条件で返す。個別identity unknownは別fieldとし、他の有効fieldは保持する。 | 固定L2のsource identity/revision保持に限定。欠落revisionを推測・補完しない。 |

**index/aliasの扱い**：旧index/alias IDは意味再導出した索引行として保持し、独立変異として数えない。raw旧84 literalは添付JSON監査に保全する。
```

### `docs/helix-labo/L10-verification/business-verification.md`

SHA-256 `d4eb73db5b72e80e4ad82f8d32da690f9cc5d21f1b13a1d66d75a05cb701334f`; 2341 bytes.

```markdown
## Stage 5 — HELIXLABO-L2-070 補助運用telemetryとAttempt scorecard併記

固定親はPO live26の49行が採択した `MPR-RC-HELIXLABO-L2-070-001`。source revision `ea6f756f96a7370de78e412d737c7a7ed472114a` のL2:561–574 SHA `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、L11:297–307 SHA `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1`をraw-LFで照合した。旧候補が参照した0abb2894の同範囲とbytesは一致し、採択状態はPO記録で確認する。

独立した業務成果・採否・運用完了の判定は追加せず、FR-01の観測scorecard境界をbusiness viewから照合する。

| 観測対象 | business-level oracle | 禁止する読替え |
|---|---|---|
| 4種duration | 各値は別のsource event境界・clock/unit・scopeに結ばれる。 | queue/review/Human/activeを推定按分または合算して059 wall-clockとする。 |
| escaped defect | 既存oracle/revisionと、受入済対象への受入境界後verified eventを追跡する。 | 未確認findingをdefectにする、severity/window/合否を新設する。 |
| rollback/Recovery | 観測済みevent/result receiptを表示する。 | 観測からtrigger・rollback実行・復旧許可を生成する。 |
| overhead/freshness | overhead直接観測値とtask workを分け、freshness ageをsource時刻に束ねる。 | unknown overhead=0、ageからexpiry/admissionを決める。 |
| 067/068同時表示 | 各fieldが適用可能なら独立定義とreceiptを同時に示す。 | 換算・合算・代替、未採択値の採択推定。 |

CASE-10/15/19は有効入力に対する070自身の出力誤りを拒否し、正常source/oracle/metricへ不足責務を返さない。CASE-85–93/96–98はFV主fixtureを参照し、固定親が禁じる各単独出力fieldの生成拒否と既存状態保持をbusiness viewから照合する。これらは業務成果や新しい採否/permissionを追加しない。CASE-01/99–101ではtarget revisionとsource identity/revisionをreceiptの実値と照合し、target revision出力欠落、target revision混在、入力source_revision欠落を別々に判定する。overhead直接計測receiptの不足は値をunknownにして既存source owner責務区分へ返し、個別identity unknownは分離する。

```

### `docs/helix-labo/L10-verification/nfr-verification.md`

SHA-256 `5348617f96b528d5be60acef655c8f44ce94252ce23d2a1316d425bcf72f48d0`; 4151 bytes.

```markdown
## Stage 5 — HELIXLABO-L2-070 補助運用telemetryとAttempt scorecard併記

固定親はPO live26の49行が採択した `MPR-RC-HELIXLABO-L2-070-001`。source revision `ea6f756f96a7370de78e412d737c7a7ed472114a` のL2:561–574 SHA `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、L11:297–307 SHA `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1`をraw-LFで照合した。旧候補が参照した0abb2894の同範囲とbytesは一致し、採択状態はPO記録で確認する。

実行前の測定設計候補。旧84 literalとraw ID/hashはJSON監査側に保持し、現行FVは旧84 IDを6列へ意味再導出し、CASE-85およびCASE-86..101を加えた101行の候補とする。以下は各測定軸に対する観測/判定材料で、実測結果ではない。

| 測定軸 | 合成入力・比較 | 判定材料 |
|---|---|---|
| duration | 4個別fieldのsource-defined start/end, clock, unit, occurred/observed time, scope/windowを与え、既存CASEの単独欠落/unit mismatch/overlap変異を適用。 | 各field独立。欠落/invalidはunknown。重複を排他按分せず、059 wall-clockへ再定義しない。 |
| escaped defect | 既存oracle/revision、受入済対象・scope・acceptance boundary後のverified event relationを与え、CASE-03e/10/11/56–58/64の各条件を別々に欠落。 | 対象/oracle/event relationが検証できた範囲だけ提示。CASE-10は入力oracleが有効なままescaped-defect誤出力を拒否し070出力処理を訂正する。母数・完全性不明はunknownでcount/rateなし。severity/window/thresholdを足さない。 |
| rollback/Recovery | source event・result receiptを正常観測し、CASE-03f/g/59–62/70とCASE-85の単一field変異を適用。 | missing receiptはunknown。059と同一receiptを一回参照。観測値をrollback action/permissionへ変換しない。CASE-85/90/91はtrigger/permission/execution出力を各単独で拒否する。 |
| overhead | direct measured observer-resource receiptを与え、CASE-03h/12/71でreceiptだけ欠落・対象workへの二重算入を変異。 | source定義単位の直接計測だけ保持。unknownはunknown、0や根拠なき推計値にしない。 |
| freshness | source effective/occurred timeとobserved timeを正常に与え、CASE-03i/14/15でtimestamp不正/欠落とage起点の権限生成を個別に変異。 | age観測値またはunknown/invalidのみ。CASE-15の入力は有効であり、ageからのauthority/permission誤出力を拒否して070出力処理を訂正する。expiry/適格性/採否/許可を生成しない。 |
| co-present metrics | 適用可能な067 first-eligible/same-Attempt repair fieldsと068 total Attempt fieldを各元receipt・revisionで示し、CASE-16–21/65–73を照合。 | identity/grain/revision/scope/receiptを分離し換算・合算・代替しない。CASE-19は正常な067/068入力の換算誤出力を拒否して070出力処理を訂正し、CASE-68はtotal Attempt countとresult stateの双方をunknownとする。欠落は原因別の既存責務区分へ返し、個別identity unknownを分ける。 |

window/threshold/severity/expiryの数値評価は行わない。固定親にない性能値や集計閾値を合否oracleへ足さない。

### 固定親の出力境界

| 検証対象 | 合成入力・比較 | 判定材料 |
|---|---|---|
| revision consistency | CASE-01の正常値とCASE-99–101を比較し、target revision出力欠落、異なるtarget revisionの同一aggregate混入、入力source_revision欠落を個別に判定する。 | 受理可能なtarget/source revisionはsource receiptと一致し、欠落や混在をunknown/未評価として扱う。 |
| authority/操作・source生成拒否 | 有効CASE-01 inputへ、CASE-85–93/96–98の各出力fieldを一つずつ単独生成する変異を適用。 | 各禁止fieldの生成を拒否し、他の根拠あるscorecard値および既存owner状態を保つ。CASE-10/15/19は正常入力の誤出力として070出力処理を訂正し、入力側ownerへ責務を移さない。 |

```

