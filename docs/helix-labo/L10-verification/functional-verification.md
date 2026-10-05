# HELIX-LABO L10 総合検証 — Stage 1（001/011の候補）

状態：未実行の合成fixture・oracle設計。L3承認、実装許可、実際の接続の存在、業務完了を生成しない。

旧HELIXのtest-design起点は旧L10定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`（`LEGACY-ASSET-34DF3B535879CC73FA86`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）の要件挙動をsystem-levelで照合する意味を保持する。旧test-designは旧L10文書そのものとは扱わず、ここでは対のoracle設計からfailure classだけを参照する。旧source/test/runtimeを実行しない。

## 共通oracle

[L3機能要件](../L3-requirements/functional-requirements.md)の同じACを照合する。採択済みCONNECT L2/L11の合成fixtureで選択connection identity・revision・scopeを固定し、未承認L3の成功を仮定しない。適用するmain固定の操作別正本は[L2-001](../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-001-接続登録と端点契約の識別unit)/[L11-001](../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-001-接続登録)（登録）、[L2-002](../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-002-契約互換性照合とstale再検証unit)/[L11-002](../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-002-契約版照合とstale再検証)（互換照合）、[L2-003](../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-003-契約に束縛した通信unit)/[L11-003](../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-003-契約に束縛した通信)（通信）である。これは固定L2/L11への通常のcanonical参照確認で、新しいgateではない。接続条件とLABOの業務入力を独立・併発変異にし、技術判断と元source/correlationの戻し先を混同しない。固定CONNECT L2に専用戻し先がない比較不能はunknown/staleで停止し、新ownerを設けない。旧runtime/test/CIは実行しない。

## HELIXLABO-L2-001 — L10 oracle（対応 `LABO-001-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-labo/L2-requirements/labo-requirements.md:69-76` span SHA-256 `9c1f285a0835a56fd7042025636ff68c2bca46d31eb2df693465d02fe772a104`。対L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`.
- 対応AC: `LABO-001-AC-01`, `LABO-001-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-LABO-001-C01**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：L2-021〜030から個別採択されたsource contract revisionを明示し、その許可sourceの実在field/status eventを取り込む。入力対象は、開発ログ、Worker/AI判断、CI/test/review、backflow/recovery/incident/refactor、release/deployment/runtime、利用、再作業、費用/token/API、model/provider、correction/rollback/product resultのうち選択source contractで宣言されたもの。**期待oracle**：許可sourceごとに20 fieldとsource identity/revisionを保持し、実在statusだけを出す。未発生statusを捏造しない。
- **L10-LABO-001-C02**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：一sourceだけ破損し他sourceは有効。**期待oracle**：破損対象のsource statusは変更せず、LABO側に理由付きprocessing hold/warningを記録してsource ownerへ返し、他sourceの有効recordは維持する。
- **L10-LABO-001-C03**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：元source snapshotにfailure/rejected/cancelled/blocked/unknown/not_observed eventがあるのにsuccess-only projectionが落とす。**期待oracle**：非success event欠落を検出し理由付きprocessing hold/warningにする。source status自体を変更しない。元sourceに非success eventがないcaseは拒否しない。
- **L10-LABO-001-C04**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：source revision欠落と既知の過去revisionをcurrentとして提示する変異を別々に与える。**期待oracle**：revision欠落は固定L2-001 L2:73のsource責務へ戻す。過去revisionをcurrentと偽装した変異は元recordとsource statusを保ってLABO processing holdとし、固定parentにない戻し先を作らない。正確に過去revisionとして示す入力はhistoricalとして保持する。
- **L10-LABO-001-C05**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：secretまたは許可scope外の情報を与える。 **期待oracle**：secret/out-of-scope inputは取り込み成功にならず、source ownerへ理由付きで返る。
- **L10-LABO-001-C06**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：LABOからsource canonical recordへ書き戻そうとする。 **期待oracle**：LABO observationは保持するがsource canonical stateへのwritebackは0であり、要求を権限境界で拒否する。
- **L10-LABO-001-C07**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：Web/WEB-OS source contractが未選択/未採択の場合に1.0必須と誤認する。 **期待oracle**：Web/WEB-OS未選択時はsource接続をoptional/unconfiguredとして示し、1.0必須依存エラーにしない。
- **L10-LABO-001-C08**（AC `LABO-001-AC-01`に対応）：許可sourceにsuccess eventだけが存在するsnapshot。**期待oracle**：success recordを正常に取り込み、未発生のfailure/rejected/cancelled/blocked/unknown/not_observedを生成せず、存在しないstatusの欠落errorも出さない。
- **L10-LABO-001-C09**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：既知の過去source revision・観測時点が保持されたhistorical observationと、同じ古いrevisionをcurrentと偽装した入力を別々に与える。 **期待oracle**：正確な過去revisionのhistoryはhistoricalとして保存・追跡し、currentと偽装したものだけをLABO側のstale holdとして拒否し、source statusは変更しない。
- **L10-LABO-001-C10**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：許可source observationから20 fieldの各fieldを一つずつ独立に欠落させ、別sourceには有効recordを与える。**期待oracle**：欠落observationは成功扱いせず欠落理由付きprocessing holdとしてsource責務へ返す。他source recordは保持し、欠落値とsource statusを推測補完しない。

- **L10-LABO-001-C12**（AC `LABO-001-AC-02`）：元source status `unknown`だけを`success`へ変換する。**期待oracle**：元status `unknown`を保ち、LABO処理の理由付きholdとする。source ownerへの新しい戻し先を作らない。
- **L10-LABO-001-C13**（AC `LABO-001-AC-02`）：元source status `not_observed`だけを`success`へ変換する。**期待oracle**：元status `not_observed`を保ち、LABO処理の理由付きholdとする。source ownerへの新しい戻し先を作らない。
- **L10-LABO-001-C14**（AC `LABO-001-AC-02`）：異なるsource identityのrecordを同一identityへ混ぜる。**期待oracle**：identity混合を拒否し、独立recordを横断完了とせず元記録を保って理由付きholdにする。source ownerへの新しい戻し先を作らない。
- **L10-LABO-001-C15**（AC `LABO-001-AC-02`）：source scope欠落または未許可のまま横断済み／完了と主張する。**期待oracle**：横断完了を示さずscope理由とsource ownerへの戻しを記録する。

### 観測点とoracle

source identity/revisionごとの観測；20 field identitiesと7 source status classifications；source statusとLABO processing hold/warningの分離；source単位のmissing reasonと戻し先；source単位warningと他sourceの独立性。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは元source status/recordを保ち、LABO処理のhold・拒否を理由と分けて記録する。固定parentに明示された欠落・権限外情報の戻し先だけを使い、専用戻し先がないLABO側の誤変換・混合はholdして新routeを作らない。誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：旧`AC-FR-BR21-09`（`business-detail.md:137-145`）は壊れたinvocation_logだけをskipし他sourceを保つHARNESS dashboardのfailure例。部分source破損を分離するfailure classのみ類例にし、旧4 source/5 metric/30秒pollを移さない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## HELIXLABO-L2-011 — L10 oracle（対応 `LABO-011-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-labo/L2-requirements/labo-requirements.md:163-166` span SHA-256 `9fcf8b7b648681c7ff08080565a2d708cdd9c5a619e40e8f8bad6196f4c36cb6`。対L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`.
- 対応AC: `LABO-011-AC-01`, `LABO-011-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-LABO-011-C01**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：L2-001 Aggregate identity/outputをsource revision付きで参照し、field一つを欠測にしたsource-backed observationをepisode candidateへ渡す。実際に選択したCONNECT connection identity/revision、schema version、source provenanceを入力する。`HELIXLABO-L2-011`は要求parent IDであり、CONNECT connection identityとは別。**期待oracle**：episodeから元observationへ戻り、欠測は欠測のまま、revision・fieldと選択connection契約が一致する。
- **L10-LABO-011-C02**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：observation ID欠落、observation ID不一致、source revision欠落、source revision不一致、relation不一致と、選択connectionのcontract identity/revision/schema/provenance不一致・欠落を別々に変異し、併発も一つ与える。consumer receiptは選択connection identity・admitted contract revision・scopeへ結び、別scope/旧revision流用も独立変異とする。**期待oracle**：relation不一致は元recordを保ってCorrelateへ戻す。observation ID/source revision欠落は固定L2-001 L2:73のsource責務へ戻す。observation ID/source revision不一致は元recordを保ってholdし、新しいsource責務routeを作らない。relation不一致である根拠がある場合だけCorrelateへ戻す。connector技術判定は固定CONNECT L2/L11に従い、明示戻し先がない比較不能はunknown/staleで停止しownerを新設しない。両failure routeを混同しない。
- **L10-LABO-011-C03**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：Aggregate engine成功だけでCorrelate接続も成功と主張する。 **期待oracle**：Aggregateの成功状態とAggregate→Correlate接続状態を分離し、未接続を成功表示しない。
- **L10-LABO-011-C04**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：relationだけを不一致にする。**期待oracle**：relationを補完せずunresolvedと元recordを保持してCorrelateへ戻す。
- **L10-LABO-011-C05**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：因果らしく見えるevidenceを含むeventを与える。**期待oracle**：evidenceの有無によらずL2-011出力のcausal assertionは0で、因果未確定を保つ。
- **L10-LABO-011-C06**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：relation不一致をCorrelateへ戻して再照合する。**期待oracle**：元source record/revisionを保持し、relationを黙って補完・上書きしない。訂正後revisionは別入力として照合する。

- **L10-LABO-011-C08**（AC `LABO-011-AC-02`）：C01の欠測fieldをepisode側で落とす独立変異。**期待oracle**：欠測保持条件を満たさず不成立とする。
- **L10-LABO-011-C09**（AC `LABO-011-AC-02`）：C01の欠測fieldをsuccessまたは既定値へ変える独立変異。**期待oracle**：欠測を補完せず不成立とする。
- **L10-LABO-011-C10**（AC `LABO-011-AC-02`）：observation IDだけを欠落させる。**期待oracle**：元recordを保持し、L2-001のsource責務へ理由付きで戻す。
- **L10-LABO-011-C11**（AC `LABO-011-AC-02`）：source revisionだけを欠落させる。**期待oracle**：元recordを保持し、L2-001のsource責務へ理由付きで戻す。
- **L10-LABO-011-C12**（AC `LABO-011-AC-02`）：source revisionだけを不一致にする。**期待oracle**：元recordを保持してholdし、source ownerへの新しいrouteを作らない。relation不一致である根拠がある場合だけCorrelateへ戻す。
- **L10-LABO-011-C13**（AC `LABO-011-AC-02`）：要求parent IDをCONNECT connection identityとして、または別connectionのidentity/receiptを選択connectionの代わりに使う。**期待oracle**：固定L2-159に従い要求IDと実connectionを区別し、代用connection/receiptを拒否する。receipt不一致を明示して受領・接続成功を生成せず停止し、固定parentにない戻し先を作らない。

### 観測点とoracle

input observation identity/source revision；episode candidate identityとrelation evidence；source refの往復一致；欠測のroundtripと種別別戻し先；evidenceの有無によらずcausal assertionがないこと。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは元source record/statusを保ち、固定parentに明示された戻し先だけを使う。observation ID/source revision欠落はL2-001 L2:73、relation不一致はL2-011に従いCorrelateへ戻す。revision不一致やconnector代用など専用戻し先がない場合は理由付きhold/unknownで止め、routeを新設しない。誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：直接対応する旧oracleは確認できない。旧BR-21の部分失敗時にrecordを失わない考えのみ類例で、因果・時間相関規則は継承しない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## 未見正常fixture

- **L10-LABO-001-C11**（`LABO-001-AC-01`）：既存fixtureにない許可source identity/revisionと実在statusの組合せを、固定source contractの20 field宣言・観測時点とともに与える。既存正常oracleで20 field・実在status・出典を保持し、未発生statusを生成せず他sourceを巻き込まない。宣言範囲外やsource不足は正常例に含めない。
- **L10-LABO-011-C07**（`LABO-011-AC-01`）：同じ採択済み契約範囲内の未見observation/episode identityを、source revision・field・欠測・選択connectionの完全な束縛情報とともに与える。episodeから元観測へ往復参照でき、欠測は欠測、evidenceの有無によらず因果未確定のままとなる。

親ごとの正常・否定・未見正常は同じAC条件で評価し、未観測を実績0件や成功へ写像しない。

## Stage 2a — HELIXLABO-L2-055/056/057 総合verification oracle

状態：未実行の合成fixture設計。全caseは固定L2/L11の意味を照合し、実operationの許可・business outcome・Worker資格・配置を生成しない。固定親commitは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO採択basisは`633bf12ea8f948db8ba3d6600179c4a9507377a7`。完全pinとraw inclusive span SHAはsource-pins handoffに記録する。L3 ACが唯一の条件正本であり、本表は対応する全IDを完全表記する。

### 055 — HELIXLABO-L2-055-002

固定親句：許可済みWorker作業履歴をtask type×model classで集計し、対応可能性水準・根拠・評価範囲・評価済み/未評価を出力する。未評価classは未評価。履歴だけで未知作業の成功保証をせず、配置案・選択・指定・割当・権限変更をしない。不足/不整合は該当history sourceへ返す。

- **L10-LABO-055-CASE-01 normal** — 2 task types×2 model classesに複数source/revisionと許可履歴を与える。証拠状態が同じでも、固定L11が定める採用する評価oracle/基準の適用scope内の2群にはfixture上で異なる評価結果水準を返す。期待：4群を混ぜずgroup identity・state counts・evidence・期間/範囲・revisionを保ち、oracle/基準の異なる水準と根拠を別々に保持する。水準値はoracle/基準fixtureが返す宣言値をそのまま照合し、本書で尺度・順序を定義しない。配置等を出力しない。確認 LABO-055-AC-01, LABO-055-AC-02。
- **L10-LABO-055-CASE-02 negative (identity missing)** — 他fieldは同一でtask typeだけ欠落。期待：確定groupへ割り当てず不明理由を示し、原history sourceへ戻す。確認 LABO-055-AC-01, LABO-055-AC-03。
- **L10-LABO-055-CASE-03 negative (identity conflict)** — 1つのsource identityだけ別model classと矛盾。期待：該当履歴をconflictとして保持し、誤groupへ集計しない。訂正先は元history source。確認 LABO-055-AC-01, LABO-055-AC-03。
- **L10-LABO-055-CASE-04 negative (oracle unavailable/out of scope)** — 結果state・group identityは固定し、独立subfixtureごとに評価oracle未提示、または適用scope外とする。期待：履歴と証拠充足状態は保持するが、oracle由来の対応可能性水準は生成せず未評価とする。確認 LABO-055-AC-02。
- **L10-LABO-055-CASE-05 negative (authority leakage)** — 履歴からWorker選択/割当/permission変更を出力させる要求。期待：それらを出力しない。identity不足はOS/元source、許可/classification不足はSECURITYへ戻す。確認 LABO-055-AC-03。
- **L10-LABO-055-CASE-06 unseen normal** — 既存fixtureにないtask type×model classの許可履歴を与えるが、固定L11が定める採用する評価oracle/基準はその組合せを含む明示scopeを適用可能とし、評価結果・根拠・revision・receiptも提供する。期待：独立groupとしてtraceし、証拠充足状態とoracle/基準由来水準を分けて記録する。scope外へ成功を一般化しない。確認 LABO-055-AC-01, LABO-055-AC-02。
- **L10-LABO-055-CASE-07 normal denominator reconstruction** — 同一許可済source receiptから、明示scopeのeligible result集合、算入結果、missing/failure/refusal/stopped/unknown各dispositionと理由、計算規則、scorer/oracle revisionを再構成する。期待：数値metric/集約水準とその分母が一致し、定性的水準も適用条件・根拠・未評価部分へ戻れる。確認 LABO-055-AC-04。
- **L10-LABO-055-CASE-08 negative unjustified exclusion** — 他のfixture内容を固定し、eligibleなfailure 1件だけを理由なく分母から除く。期待：水準を受け入れず、当該結果と欠落理由不備を残す。確認 LABO-055-AC-04。
- **L10-LABO-055-CASE-09 negative missing cost zero** — 他のfixture内容を固定し、missing費用だけを0として集計する。期待：集計を拒否し、費用missingを保持する。確認 LABO-055-AC-04。
- **L10-LABO-055-CASE-10 negative post-result denominator change** — 結果確認後に対象分母だけを変更する。期待：同一receiptから再構成できない集計として拒否する。確認 LABO-055-AC-04。
- **L10-LABO-055-CASE-11 negative scorer revision omitted** — metric値は同一のままscorer/oracle revisionだけを欠落させる。期待：数値だけを出した水準を受け入れず、採点根拠不足を保持する。確認 LABO-055-AC-04。
- **L10-LABO-055-CASE-12 negative mean cancels failure** — 他条件を固定し重大なquality/scope/security/data-loss failureだけを平均値で相殺する。期待：相殺された水準を不成立とし、failureを失敗のまま残す。確認 LABO-055-AC-04。
- **L10-LABO-055-CASE-13 negative failure rounded to unassessed** — known failureだけをunassessedへ置換し他は固定する。期待：失敗の観測を保持し、未評価へ丸めた結果を拒否する。確認 LABO-055-AC-02, LABO-055-AC-04。
- **L10-LABO-055-CASE-14 unseen applicability unknown** — 新しいtask class/source/scorer-oracle revisionの結果を与えるが、既存水準の適用可能性だけ不明とする。期待：source結果は保持し、過去水準を流用せず当該範囲をunassessedとする。確認 LABO-055-AC-02, LABO-055-AC-04。

### 056 — HELIXLABO-L2-056-003

固定親句：初回結果をsource/scope/revision付きobservationとして追加し、observedとperformance-assessedを区別する。assessedは採用oracle/criteria revision、task/model class/scope、根拠・比較条件・結果・失敗/反例/unknownとreceiptが適用できる範囲だけ。五結果stateを偽らず記録し、source authority/stateを変えず、assignment/資格化しない。不足時はOS/SECURITY/Workerまたは元resultへ戻す。oracle適用性不足はBench記録をunassessedのまま保持し、訂正依頼を元oracle/criteria source ownerへ戻す。Benchをoracle owner/assignment先にしない。

- **L10-LABO-056-CASE-01 normal observed-only** — 固定L2の初回result field一式（ticket/assignment/task/attempt、Worker/実行契約revision、要求revision/scope、state、budget、deadline、verification、人確認、data-use class、source receipt）を揃え、許可receiptはあるが適用oracleなし。期待：全fieldをprovenance付き1 observationへ保持し、observed/unassessedとする。確認 LABO-056-AC-01, LABO-056-AC-03。
- **L10-LABO-056-CASE-02 normal success** — successだけを入力。他条件一定。期待：success保持。確認 LABO-056-AC-02。
- **L10-LABO-056-CASE-03 normal failure** — failureだけを入力。他条件一定。期待：failure保持。確認 LABO-056-AC-02。
- **L10-LABO-056-CASE-04 normal refusal** — refusalだけを入力。他条件一定。期待：refusal保持。確認 LABO-056-AC-02。
- **L10-LABO-056-CASE-05 normal interruption** — interruptionだけを入力。他条件一定。期待：interruption保持。確認 LABO-056-AC-02。
- **L10-LABO-056-CASE-06 normal unknown** — unknownだけを入力。他条件一定。期待：unknown保持。確認 LABO-056-AC-02。
- **L10-LABO-056-CASE-07 scoped assessed normal** — exact oracle/criteria identity+revision、task/model class/scope、根拠・比較条件、result/failure/counterexample/unknown、評価者、評価時点、対象result/oracleに束縛したdecision receiptが一つのscope内で一致。期待：assessed表示と当該oracle結果だけをそのscopeへ付し、別scopeへ一般化しない。確認 LABO-056-AC-03。
- **L10-LABO-056-CASE-08 negative source identity missing** — source identityだけ欠落。期待：正当化された観測にせずOS/元sourceへ戻す。確認 LABO-056-AC-01, LABO-056-AC-04。
- **L10-LABO-056-CASE-09 negative scope mismatch** — oracle以外を固定しscopeだけ不一致。期待：unassessed維持、訂正は元oracle/criteria source ownerへ。確認 LABO-056-AC-03。
- **L10-LABO-056-CASE-10 negative stale oracle** — oracle/criteria revisionだけをstale化。期待：assessedへ昇格せずunassessed、訂正先は元oracle/criteria source owner。確認 LABO-056-AC-03。
- **L10-LABO-056-CASE-11 negative missing evidence** — 判定根拠・比較条件・評価者・評価時点・decision receiptを独立subfixtureごとに一項目だけ欠落またはstale化する。budgetとdeadlineもそれぞれ個別にmissing/conflict化する。期待：oracle evidenceの各欠落では評価履歴をunassessedに保ち、budget/deadlineは推測補完せずfieldの欠落・不確実性と元recordを保持し、result stateを書き換えずOSの元ticket/assignment sourceへ訂正依頼する。元oracle/criteria由来の不足は元source ownerへ戻し、receipt fieldについて新ownerを追加しない。確認 LABO-056-AC-01, LABO-056-AC-03。
- **L10-LABO-056-CASE-12 negative state coercion** — unknown observationのstateだけsuccessへ変異。期待：変異拒否、原unknown保持。確認 LABO-056-AC-02。
- **L10-LABO-056-CASE-13 negative duplicate/conflict** — 同一source identityのduplicateと同一revision内の矛盾stateを別fixtureにする。期待：原record/conflictを保持し自動統合しない。result/revisionはWorker/OS、assignment/source/scopeはOS、permission/classificationはSECURITYへ。確認 LABO-056-AC-04。
- **L10-LABO-056-CASE-14 negative qualification/assignment** — assessedをWorker qualificationまたはassignmentへ変換する要求。期待：promotion/assignmentなし。確認 LABO-056-AC-04。
- **L10-LABO-056-CASE-15 unseen normal** — 未見ticket/attempt/source revision、および既存fixture未使用のtask/model class組合せを与える。全fieldが整合し、固定L11が定める採用する評価oracle/基準の明示scopeがその組合せに適用できる結果・根拠・評価者・時点・decision receiptを返す。期待：observedとscope限定assessedを別々に記録し、単一成功をscope外へ一般化しない。確認 LABO-056-AC-01, LABO-056-AC-03。
- **L10-LABO-056-CASE-16 negative receipt/run mismatch** — receiptの実run照合結果だけを不一致にし、元receiptと実績は別々に保持する。期待：receipt値で実績を上書きせず、対応水準の根拠へ混ぜない。確認 LABO-056-AC-05。
- **L10-LABO-056-CASE-17 negative task/model class mismatch** — task classだけを宣言済み評価対象から変えるfixtureと、model classだけを変えるfixtureを分ける。期待：各不一致の観測を保持し、当該評価scopeは未評価/評価不能。確認 LABO-056-AC-05。
- **L10-LABO-056-CASE-18 negative ticket identity join** — ticket identityだけを別ticketにし、他のrun fieldを固定する。期待：別ticketのresultを同じ実績へ結合せず未評価を保つ。確認 LABO-056-AC-05。
- **L10-LABO-056-CASE-19 negative Worker revision join** — Worker identityだけを別runへ変えるfixtureと、実行契約revisionだけを別runへ変えるfixtureを分ける。期待：異なる実行者/版を同一実績として結合せず未評価を保つ。確認 LABO-056-AC-05。
- **L10-LABO-056-CASE-20a negative score changes scope** — 実績と評価scoreを固定し、scoreからscopeだけを変更する要求を与える。期待：scopeを変えず、scoreを適用根拠にしない。確認 LABO-056-AC-05。
- **L10-LABO-056-CASE-20b negative score changes authority** — 実績と評価scoreを固定し、assignment/qualification/authorityだけを変更する要求を与える。期待：authorityを変えず、scoreを適用根拠にしない。確認 LABO-056-AC-04, LABO-056-AC-05。
- **L10-LABO-056-CASE-21 negative stale Worker contract** — 実行契約revisionだけをstaleにする。期待：source/resultは保持するが現行評価範囲へ算入せず、未評価/評価不能にする。確認 LABO-056-AC-03, LABO-056-AC-05。
- **L10-LABO-056-CASE-22 negative verification missing** — verification fieldだけを欠落させる。期待：result stateと観測を保持し、verificationを補完せず未評価を保つ。確認 LABO-056-AC-01, LABO-056-AC-03, LABO-056-AC-05。
- **L10-LABO-056-CASE-23 negative counterexample set insufficient** — 他条件を固定し、適用対象で必要な反例/unknownの入力だけを欠落させる。期待：評価根拠が不足した範囲を未評価に保つ。確認 LABO-056-AC-03, LABO-056-AC-05。
- **L10-LABO-056-CASE-24 unseen applicability unknown** — 新provider/model versionと異なるtoolchain/source revisionを持つresultを与えるが、既存評価条件との互換性だけをunknownにする。期待：resultを観測として保持し、同条件成功・class水準へ推定せず未評価を維持し、再評価条件を元source/oracle ownerへ返す。確認 LABO-056-AC-03, LABO-056-AC-05。

### 057 — HELIXLABO-L2-057-002

固定親句：OS resultをLABO-028へ同一identity/scopeで渡す。状態、要求/契約revision、verification、人確認、未完義務を送受間で保持する。OS-027は任意provenance。採択CONNECT contractまたは同義務を備えた明示human receiptのいずれかで成立し、source identity/revision/schema/scope照合、ack、trace、dedupe、stale-stop、同一ID retry/未完保持を示す。双方が同一義務を満たす。source/送達/送受receipt不一致はOS/LABO、schema/classification不一致はLABOまたはSECURITYへ戻す。

- **L10-LABO-057-CASE-01 normal CONNECT** — 採択CONNECT contract fixtureで送受信。期待：全identity/revision/scope/state/verification/human receipt/data-use/unfinished duties一致、ack/trace/dedupe/stale-stop/same-ID retry証拠あり。確認 LABO-057-AC-01, LABO-057-AC-02。
- **L10-LABO-057-CASE-02 normal explicit human receipt** — CONNECTと独立したhuman receipt fixtureで同じidentity/revision/schema/scope・ack/trace/dedupe/stale-stop/retry/unfinished dutyを明示。期待：CASE-01と同一義務の場合だけ成立。確認 LABO-057-AC-01, LABO-057-AC-02。
- **L10-LABO-057-CASE-03 negative identity mutation** — ticket/task/assignment/attempt/Worker identityを一度に1項目ずつ欠落または変更。期待：不成立、元result/未完義務を保持しOSへ。確認 LABO-057-AC-01, LABO-057-AC-03。
- **L10-LABO-057-CASE-04 negative request/contract revision** — request revisionとcontract/schema revisionを独立fixtureでstale化する。期待：request/source revision不足はOS、contract/schema不足はLABOへ戻し、どちらも受領成立にせず未完義務を保持する。delivery identity不一致はCASE-22、送受receipt不一致はCASE-23で別判定する。確認 LABO-057-AC-01, LABO-057-AC-03。
- **L10-LABO-057-CASE-05 negative scope mutation** — scopeだけ変更。期待：別scope receiptを流用せず不成立、OSへ。確認 LABO-057-AC-01, LABO-057-AC-03。
- **L10-LABO-057-CASE-06 negative result/verification mutation** — result state、verification state、人確認receiptを各独立fixtureで欠落/改変。期待：不一致を止め成功補正なし。送受result/verification/人確認receipt不一致はOS/LABOへ戻し、schema/classification問題はLABO/SECURITYへ戻す。確認 LABO-057-AC-01, LABO-057-AC-03。
- **L10-LABO-057-CASE-07 negative data-use mutation** — data-use classだけ欠落/不一致。期待：許可判定を代行せず保留、SECURITY/contract ownerへ。確認 LABO-057-AC-01, LABO-057-AC-03。
- **L10-LABO-057-CASE-08 negative unfinished duty erased** — 未完義務だけreceiptから除く。期待：不成立、元義務を保持。確認 LABO-057-AC-01, LABO-057-AC-03。
- **L10-LABO-057-CASE-09 negative ack absent** — CONNECT契約とhuman receiptを別fixtureにし、各々ackだけ欠落。期待：どちらも未受領としてretry/未完義務保持。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-10 negative trace absent** — CONNECT契約とhuman receiptを別fixtureにし、各々ackあり/traceだけ欠落。期待：どちらも受領証明なし、未完保持。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-11 negative stale-stop absent** — CONNECT契約とhuman receiptを別fixtureにし、各々stale contract revisionを与えて停止しないreceiptを試す。期待：どちらもstaleで停止、未完保持。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-12 negative retry identity changed** — CONNECT契約とhuman receiptを別fixtureにし、各々transient failure後retry IDだけ変更。期待：どちらも同一ID要件を満たさず元未完義務を保持。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-13 negative duplicate retry** — CONNECT契約とhuman receiptを別fixtureにし、各々ack消失後same-ID retryと遅延duplicate receiptを与える。期待：各方式で観測1件、duplicateは別resultにせずtrace、正しいreceiptまで未完保持。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-14 negative 027 dependency** — OS-027 provenanceだけあり057 receipt証拠なし。期待：依存/受領成立にしない。確認 LABO-057-AC-03。
- **L10-LABO-057-CASE-15 unseen normal** — 未見ticket/task/attempt identityだが必須項目完全なCONNECT receipt。期待：同じACで往復一致し受領。新しいfield/義務を足さない。確認 LABO-057-AC-01, LABO-057-AC-02。
- **L10-LABO-057-CASE-16 negative delivery-success promotion** — receipt到達は成功だが、評価oracle適用/結果判定だけ未完了。期待：履歴化先は記録してもassessedへ昇格しない。確認 LABO-057-AC-04。
- **L10-LABO-057-CASE-17 negative assignment** — 受領成功後にLABOがWorker assignmentを出す要求を与える。期待：assignmentなし、OS責務を保持。確認 LABO-057-AC-04。
- **L10-LABO-057-CASE-18 negative CONNECT absent** — human receiptを固定し、採択CONNECT contractだけを不在にする。期待：CONNECT方式で成立を主張せず未受領を保持。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-19 negative CONNECT unknown** — human receiptを固定し、CONNECT contractの有効性だけunknownにする。期待：有効な契約と推測せず未受領を保持。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-20 negative human receipt absent** — CONNECT contractを固定し、human receiptだけを不在にする。期待：human receipt方式で成立を主張せず未受領を保持。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-21 negative human receipt unknown** — CONNECT contractを固定し、human receiptの有効性だけunknownにする。期待：receipt成立と推測せず未受領を保持。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-22 negative source/delivery mismatch** — source identityとdelivery identityだけ不一致にし、受領receipt一致は保つ。期待：OSへ戻し、受領成立にしない。確認 LABO-057-AC-03。
- **L10-LABO-057-CASE-23 negative send/receive receipt mismatch** — sourceとdeliveryは一致、送信receiptと受領receiptだけ不一致にする。期待：OS/LABOへ戻し、原記録と未完義務を保持する。確認 LABO-057-AC-03。
- **L10-LABO-057-CASE-24 normal receipt return/history destination** — CONNECT契約とhuman receiptを別々の正常fixtureで成立させる。期待：LABO受領receiptを返し、後続の履歴化先を各方式で示して追跡できる。評価済みへの昇格やassignmentはしない。確認 LABO-057-AC-04。

### 親句→FR/AC→CASE crosswalk

| 固定親句 | FR / AC | L10 case |
|---|---|---|
| 055 task type×model class別集計、source/revision/evidence/range、対応可能性水準と証拠充足状態 | LABO-055-FR-01; LABO-055-AC-01, LABO-055-AC-02 | L10-LABO-055-CASE-01, L10-LABO-055-CASE-06, L10-LABO-055-CASE-14 |
| 055 eligible denominator、個別disposition/理由、計算規則/scorer revision、同一receiptからの再構成 | LABO-055-FR-01; LABO-055-AC-04 | L10-LABO-055-CASE-07, L10-LABO-055-CASE-08, L10-LABO-055-CASE-09, L10-LABO-055-CASE-10, L10-LABO-055-CASE-11, L10-LABO-055-CASE-12, L10-LABO-055-CASE-13, L10-LABO-055-CASE-14 |
| 055 oracle不足時の未評価維持、unknown成功保証なし、配置/選択/指定/割当/権限変更禁止 | LABO-055-FR-01; LABO-055-AC-02, LABO-055-AC-03 | L10-LABO-055-CASE-04, L10-LABO-055-CASE-05 |
| 055不足/矛盾を原history sourceへ戻す | LABO-055-FR-01; LABO-055-AC-01, LABO-055-AC-03 | L10-LABO-055-CASE-02, L10-LABO-055-CASE-03 |
| 056初回result observation（budget/deadlineを含む）、観測/評価区別、provenance | LABO-056-FR-01; LABO-056-AC-01, LABO-056-AC-03 | L10-LABO-056-CASE-01, L10-LABO-056-CASE-07, L10-LABO-056-CASE-11 |
| 056五state個別保持 | LABO-056-FR-01; LABO-056-AC-02 | L10-LABO-056-CASE-02, L10-LABO-056-CASE-03, L10-LABO-056-CASE-04, L10-LABO-056-CASE-05, L10-LABO-056-CASE-06, L10-LABO-056-CASE-12 |
| 056実績receiptとrunの同一性・実行契約/要求revision・scope・result/verification/human receipt/data-useの照合（固定L11:141–144,198–203） | LABO-056-FR-01; LABO-056-AC-01, LABO-056-AC-03, LABO-056-AC-04, LABO-056-AC-05 | L10-LABO-056-CASE-16, L10-LABO-056-CASE-17, L10-LABO-056-CASE-18, L10-LABO-056-CASE-19, L10-LABO-056-CASE-20a, L10-LABO-056-CASE-20b, L10-LABO-056-CASE-21, L10-LABO-056-CASE-22, L10-LABO-056-CASE-23, L10-LABO-056-CASE-24 |
| 056oracle/criteria identity+revision・task/model class/scope・根拠/比較/result/反例/unknown/評価者/時点/receipt適用範囲 | LABO-056-FR-01; LABO-056-AC-03 | L10-LABO-056-CASE-07, L10-LABO-056-CASE-09, L10-LABO-056-CASE-10, L10-LABO-056-CASE-11 |
| 056不足/矛盾/stale、owner戻し先、source authority、qualification禁止 | LABO-056-FR-01; LABO-056-AC-01, LABO-056-AC-02, LABO-056-AC-03, LABO-056-AC-04 | L10-LABO-056-CASE-08, L10-LABO-056-CASE-13, L10-LABO-056-CASE-14 |
| 057 exact receipt identity/scope/state/unfinished duty | LABO-057-FR-01; LABO-057-AC-01 | L10-LABO-057-CASE-01, L10-LABO-057-CASE-02, L10-LABO-057-CASE-03, L10-LABO-057-CASE-04, L10-LABO-057-CASE-05, L10-LABO-057-CASE-06, L10-LABO-057-CASE-07, L10-LABO-057-CASE-08 |
| 057 CONNECT/human receipt両方式の同等義務 | LABO-057-FR-01; LABO-057-AC-02 | L10-LABO-057-CASE-01, L10-LABO-057-CASE-02, L10-LABO-057-CASE-09, L10-LABO-057-CASE-10, L10-LABO-057-CASE-11, L10-LABO-057-CASE-12, L10-LABO-057-CASE-13 |
| 057 receipt返却/履歴化先、delivery成功から評価済み・assignmentを生成しない | LABO-057-FR-01; LABO-057-AC-04 | L10-LABO-057-CASE-16, L10-LABO-057-CASE-17, L10-LABO-057-CASE-24 |
| 057 source/送達不一致はOSへ、送受receipt不一致はOS/LABOへ戻す | LABO-057-FR-01; LABO-057-AC-03 | L10-LABO-057-CASE-22, L10-LABO-057-CASE-23 |
| 057 OS-027 optional、receipt/delivery mismatch・failure未成立・owner別戻し | LABO-057-FR-01; LABO-057-AC-03 | L10-LABO-057-CASE-03, L10-LABO-057-CASE-04, L10-LABO-057-CASE-05, L10-LABO-057-CASE-06, L10-LABO-057-CASE-07, L10-LABO-057-CASE-08, L10-LABO-057-CASE-09, L10-LABO-057-CASE-10, L10-LABO-057-CASE-11, L10-LABO-057-CASE-12, L10-LABO-057-CASE-13, L10-LABO-057-CASE-14, L10-LABO-057-CASE-18, L10-LABO-057-CASE-19, L10-LABO-057-CASE-20, L10-LABO-057-CASE-21, L10-LABO-057-CASE-22, L10-LABO-057-CASE-23 |

### 共通判定とowner戻し先

正例とnegativeは記載した一変数だけを変える。unseen normalは同じ固定scope/contract内の未見identityを用いて同じACを再確認する。sourceまたはscope不明を成功/実績0/失敗へ丸めない。OSはassignment/ticket/source/scope/delivery identity、Workerまたは元result sourceは実行/result/revision、SECURITYは許可/classificationを所有する。oracle適用性不足はBenchがunassessedとして記録し、訂正依頼は元oracle/criteria source ownerへ戻す。LABO/Benchをoracle owner・assignment owner・資格判定者にしない。固定親に独立business outcomeがないのでbusiness caseを重複作成しない。
