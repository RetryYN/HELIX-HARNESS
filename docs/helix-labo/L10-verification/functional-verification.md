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


状態：未承認のL3/L10候補。対象はStage 2bの採択親 HELIXLABO-L2-002〜010のみ。固定L2/L11が要件authority、PO記録は親の採択登録、G0記録は実装順序だけを示す。本文は実装・実行・リリース許可や要件承認を生成しない。Stage 2bの親・case範囲、source disposition、固定根拠は[このcutoutの不変監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-review01-repair04-2026-10-05.json)に固定する。

## Stage 2b — HELIXLABO-L2-002/003/004/005 のシステム検証候補

状態：未実行の合成fixtureとoracle設計。固定parentは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO adoption basisは `633bf12ea8f948db8ba3d6600179c4a9507377a7`、G0順序sourceは `1880c422311a7f8321dbb0e2b98fa12c69449201`。L3 functional ACが唯一の条件正本で、本書は完全IDで同じACを照合する。未承認L3や後続親を依存authorityにしない。通常例とnegativeは示す一変数以外を共通baselineに保ち、未見正常例は同一fixed scopeの未見identityで既存ACを再確認する。owner戻し先は固定契約が指定する既存source/authorityだけを使い、新ownerを作らない。

### 002 — HELIXLABO-L2-002 / `LABO-002-FR-01`

- **L10-LABO-002-CASE-01 normal observed trace** (`LABO-002-AC-01`) — source identity/revision付きで、要求・ticket・Worker・実装・atomic CI・boundary integration・proof CI・release・deployment・runtime・incident・recovery等、選択scope内で実際に観測された固定L2列挙eventだけを与える。期待：episode候補から各eventへ逆参照でき、列挙field・environment・resultが保たれる。未発生eventを生成せず、source canonical eventは不変。
- **L10-LABO-002-CASE-02 normal partial episode** (`LABO-002-AC-01`, `LABO-002-AC-02`) — 有効なsourceを保ちつつ未発生stageがある部分episodeを与える。期待：観測済eventは結び、未発生/未完義務は明記し、完了補完をしない。
- **L10-LABO-002-CASE-03 normal orphan** (`LABO-002-AC-02`) — 他eventと安全に結べない有効source eventだけを与える。期待：孤立eventとしてsource/revision付きで残し、成功/失敗の推測やdropをしない。
- **L10-LABO-002-CASE-04 negative false relation** (`LABO-002-AC-03`) — event内容を固定し、時刻だけが一致するfixtureとpathだけが一致するfixtureを独立に作る。期待：いずれも一episodeに結合せず、因果を断定しない。
- **L10-LABO-002-CASE-05 negative missing obligation** (`LABO-002-AC-02`, `LABO-002-AC-03`) — 他fieldを固定し、未完義務だけを欠落させた入力/出力を与える。期待：未完を保持し、完了補完を拒否する。
- **L10-LABO-002-CASE-06 negative correction overwrite** (`LABO-002-AC-03`) — 同一event identity/revisionに対する誤relationの訂正を与える。期待：訂正relationだけを変え、元event payload/identity/revisionを保持する。
- **L10-LABO-002-CASE-07 unseen normal** (`LABO-002-AC-01`) — 既存fixtureにない許可source/event identityで、選択scope内で観測されたstage traceを与える。期待：CASE-01と同じ逆参照・列挙field保持を満たし、未発生stageを生成せずscope外へ一般化しない。
- **L10-LABO-002-CASE-08 negative source identity missing** (`LABO-002-AC-01`, `LABO-002-AC-03`) — 他条件一定でsource identityまたはrevisionだけを欠落させる。期待：契約上必須のidentity/revision/scope欠落・stale・wrong-revisionは不成立とし、固定親で指定された既存sourceまたはconnection ownerへ戻す。

- **L10-LABO-002-CASE-09 negative L2-001 dependency identity/revision** (`LABO-002-AC-03`) — 共通baselineからobservation source identityだけをmissing、次に別fixtureでrevisionだけをstale/wrong-revisionへ変える。期待：episode成功扱いにせず、元observation/契約ownerへ返す。別sourceで補完しない。
- **L10-LABO-002-CASE-10 negative L2-001 field census** (`LABO-002-AC-01`, `LABO-002-AC-03`) — `episode_id, requirement_revision, ticket_id, responsibility_id, product, mechanism, worker, provider, model, configuration, artifact, CI/test, release, deployment, runtime, failure, rework, cost, time, result`の各schema fieldを、共通baselineから一つずつ独立に欠落させる。identity/revision/scope envelopeはfield列とは別に扱い、CASE-15で検査する。期待：選択source contractが対象scopeで要求するfieldの欠落はmissingとして記録して成功扱いせず、当該契約の既存source/connection ownerへ戻す。要求されないfieldの欠落も値unknownへ偽装せずmissingとして保持し、未発生eventか判別できる根拠がなければunknown/unresolvedに留める。観測値unknownは値unknownとして保持し、非発生eventはCASE-17どおりnot_observedとして保持する。別sourceで補完しない。20列の分類はFRと同じ：context `episode_id, requirement_revision, ticket_id, responsibility_id, product, mechanism, worker, provider, model, configuration, artifact`、観測値 `CI/test, cost, time, result`、条件付きevent `release, deployment, runtime, failure, rework`。
- **L10-LABO-002-CASE-11 negative L2-011 connection receipt** (`LABO-002-AC-03`) — L2-011のAggregate→Correlate接続を同一baselineでidentity/revision/scope/欠測表示/episode↔observation逆参照の各field一つずつmissing/unknown/stale/wrong-revisionにした独立fixtureで照合する。期待：接続成立を主張せず、欠けたfieldを他sourceで補完せず、既存connection/source ownerへ戻す。

- **L10-LABO-002-CASE-12 negative status collapse** (`LABO-002-AC-01`, `LABO-002-AC-02`) — 同一の許可sourceから7状態 `success, failure, rejected, cancelled, blocked, unknown, not_observed` をそれぞれ独立recordで与える。unknown/not_observedをsuccessに変換する、failure/rejectedを落とす、または状態を一つにまとめる変異を各々独立に試す。期待：7値とsource identity/revisionを保持し、誤変換を全て拒否する。
- **L10-LABO-002-CASE-13 normal correlation with undetermined causality** (`LABO-002-AC-01`, `LABO-002-AC-03`) — 有効なsource relationと相関 evidenceを与えるが、causation evidenceは与えない。期待：相関関係を保持し、因果は未確定と明示する。
- **L10-LABO-002-CASE-14 negative proximity-only causality** (`LABO-002-AC-03`) — 相関relation evidenceのない無関係eventについて、時刻だけが近いfixtureとpathだけが一致するfixtureを独立に作る。期待：いずれも相関relationや因果を創作しない。CASE-13の有効relation evidenceをこのcaseへ流用しない。
- **L10-LABO-002-CASE-15 negative source contract envelope** (`LABO-002-AC-01`, `LABO-002-AC-03`) — 同じ正常baselineでsource identity、source revision、選択scopeを一つずつ独立に欠落させる。別fixtureでidentityを不一致、revisionをstale/wrong-revision、scopeを未許可へそれぞれ変える。20列は保持したまま変異する。期待：envelope不成立としてobservationを成功扱いせず、固定source contractが指定するsource/connection ownerへ戻す。
- **L10-LABO-002-CASE-16 normal unknown observed value** (`LABO-002-AC-01`) — source identity/revision/scopeと全20 schema列が揃い、観測済みitemの `cost` または `result` 値がsource上でunknownの正常fixtureを与える。期待：値unknownをunknownのまま保持し、ゼロ・success・欠落へ変換しない。
- **L10-LABO-002-CASE-17 normal event not occurred** (`LABO-002-AC-01`, `LABO-002-AC-02`) — 選択scopeと期間、全20 schema列を保ち、sourceが `release, deployment, runtime, failure, rework` の該当event未発生を明示する部分episodeを与える。期待：各該当列を `not_observed` として保持し、未完義務と部分状態を表示する。発生eventや値を補わず、部分episodeを契約failureや完了扱いにしない。

### 003 — HELIXLABO-L2-003 / `LABO-003-FR-01`

- **L10-LABO-003-CASE-01 normal mixed decomposition** (`LABO-003-AC-01`) — 一episode内に良かった点/悪かった点、条件依存、汎用/product固有、system/operation、unknown/unnecessaryの複数根拠を与える。期待：各親分類区分を独立し、source evidence/revision付きで保持する。
- **L10-LABO-003-CASE-02 negative whole-episode binary adoption** (`LABO-003-AC-02`) — CASE-01と同一入力に対して全体を採用/不採用の一値へ丸める要求だけを加える。期待：一括分類をせず各軸を維持。
- **L10-LABO-003-CASE-03 negative unknown guessed** (`LABO-003-AC-02`) — unknown根拠だけを与え、他分類の証拠は固定する。期待：unknownを推測で汎用/不要/成功等へ変換しない。
- **L10-LABO-003-CASE-04 negative conditional success generalized** (`LABO-003-AC-02`) — 成功条件だけ一つある入力を無条件一般化しようとする。期待：条件依存を明記し、scope外の成功主張を拒否。
- **L10-LABO-003-CASE-05 negative missing source evidence** (`LABO-003-AC-03`) — source evidence identity/revisionだけを欠落。期待：分類を確定せず理由付きで元evidence/history source ownerへ戻す。
- **L10-LABO-003-CASE-06 negative evidence contradiction** (`LABO-003-AC-03`) — 同一分類軸について根拠source間に矛盾を一つ置く。期待：conflict/未確定を保持し、根拠を上書きせずsource ownerへ返す。
- **L10-LABO-003-CASE-07 unseen normal** (`LABO-003-AC-01`) — 未見episode identityだが固定scope内で各分類根拠が揃った入力。期待：CASE-01と同一分類構造/traceで扱い、能力を範囲外へ一般化しない。

- **L10-LABO-003-CASE-08 negative L2-002/L2-012 dependency field** (`LABO-003-AC-01`, `LABO-003-AC-03`) — episode ID/revision、source evidence identity/revision、event/result state、relation/未完状態、L2-012接続のscope/revision/evidence traceの各fieldを一つだけmissing, unknown, stale, wrong-revisionに変える独立fixture群。期待：分類を確定せず、別episode/sourceで補完せず、該当evidenceまたは接続ownerへ返す。
- **L10-LABO-003-CASE-09 negative individual classification basis** (`LABO-003-AC-01`, `LABO-003-AC-02`, `LABO-003-AC-03`) — 良かった点、悪かった点、条件依存、汎用候補、product固有、system化候補、operationで補う候補、unknown、不必要の9分類それぞれについて、共通baselineの一分類だけ根拠を欠落、反証と矛盾、または誤った分類根拠へ置換する独立fixtureを作る。期待：他分類は保持し、当該分類だけunresolved/unknownとして元evidence ownerへ返す。根拠のない分類を作らない。

- **L10-LABO-003-CASE-10 negative unfinished duty loss** (`LABO-003-AC-02`, `LABO-003-AC-03`) — CASE-01のepisode/sourceを保ち、未完義務identityだけを分類出力から落とす変異を与える。期待：義務は未完のまま保持し、元source ownerへ理由付きで戻す。完了扱い・脱落はいずれも不成立。

### 004 — HELIXLABO-L2-004 / `LABO-004-FR-01`

- **L10-LABO-004-CASE-01 normal full axes** (`LABO-004-AC-01`) — 方式A/B双方のpurpose, structure, behavior, assumption, constraint, guarantee, costを独立source付きで与え、未完義務identityを一件含める。期待：7/7軸・未完義務identityとrevisionを保ち、守で元の意味/目的/条件/構造を先に保持、破で部分比較、離で根拠付きcandidateを示す。
- **L10-LABO-004-CASE-02 normal partial match** (`LABO-004-AC-01`, `LABO-004-AC-02`) — CASE-01の一軸だけ異なり、他軸は一致する比較対象。期待：一致部分と異なる軸を分け、全体同等とはしない。
- **L10-LABO-004-CASE-03 normal condition-dependent difference** (`LABO-004-AC-01`, `LABO-004-AC-02`) — 一つの前提/条件だけを変更し、それ以外は共通にする。期待：条件依存差と適用scopeを軸別に示す。
- **L10-LABO-004-CASE-04 negative original meaning unavailable** (`LABO-004-AC-03`) — 原方式のpurpose/meaning本文だけを利用不能にする。期待：変換candidateを出さずsource clarificationへ戻す。
- **L10-LABO-004-CASE-05 negative source evidence missing** (`LABO-004-AC-03`) — 意味本文は保持し、evidence identity/revisionだけ欠落。期待：再構成を保留し元source ownerへ不足を返す。
- **L10-LABO-004-CASE-06 negative candidate marked adopted** (`LABO-004-AC-02`) — candidate内容は同一でadopted/authority表示だけを付与する要求。期待：採択状態を出力しない。
- **L10-LABO-004-CASE-07 unseen normal** (`LABO-004-AC-01`) — 未見方式identityで7軸すべてと根拠source revisionが揃う。期待：CASE-01の比較traceを保ち、同等性をscope外へ拡張しない。

- **L10-LABO-004-CASE-08 negative L2-013 dependency and comparison-source fields** (`LABO-004-AC-01`, `LABO-004-AC-03`) — L2-013各分類根拠・反証・unknown・条件・接続identity/revision/scope/evidence trace、および方式A/Bの比較source identity/revisionについて、各field一つだけmissing, unknown, stale, wrong-revisionへ変えた独立fixtureを作る。期待：欠損軸を他source/軸で補完せず、比較を確定せず、既存evidence/source/connection ownerへ戻す。
- **L10-LABO-004-CASE-09 negative seven-axis census** (`LABO-004-AC-01`, `LABO-004-AC-02`, `LABO-004-AC-03`) — `purpose, structure, behavior, assumption, constraint, guarantee, cost`の各軸を一つずつmissingまたは異なる値へ変更した別fixtureで照合する。期待：欠損/差分軸を明記し、残り6軸だけで全体同等を主張せず、根拠不足は元source ownerへ戻す。

- **L10-LABO-004-CASE-10 negative transform-before-reading** (`LABO-004-AC-03`) — 原方式sourceは存在するが、意味・目的・条件・構造を読む前に変換candidateを出す要求だけを加える。期待：candidateを生成せず、元方式sourceを先に読み、意味がなお不明なら元source ownerへ明確化依頼を返す。

- **L10-LABO-004-CASE-11 negative unfinished duty loss** (`LABO-004-AC-01`, `LABO-004-AC-03`) — CASE-01の比較sourceと未完義務を保ち、変換candidateから未完義務identityだけを落とす変異を与える。期待：再構成candidateを確定せず義務を未完のまま保持し、該当元source ownerへ理由付きで戻す。

### 005 — HELIXLABO-L2-005 / `LABO-005-FR-01`

- **L10-LABO-005-CASE-01 normal 12 operations** (`LABO-005-AC-01`) — 12 operationを別々のcandidate rowとして与え、各々のsource identity/revision、維持意味、変更意味、条件、scopeを明示する。期待：12 identityを欠落なく個別保持し、候補の実行/採択をしない。
- **L10-LABO-005-CASE-02 normal alternatives retained** (`LABO-005-AC-01`) — 既存機構へ吸収、責務移動、operationへ戻す、retireを候補に並べ、追加機構候補も比較目的で残す。期待：親の全選択肢と各meaning/condition/scopeを記録し、追加件数の増減自体を改善指標にしない。
- **L10-LABO-005-CASE-03 negative meaning change hidden** (`LABO-005-AC-02`, `LABO-005-AC-03`) — 変更候補のmeaning fieldだけを隠す/同一扱いにする。期待：意味差を明示し、未確定ならunknown、判断を上流へ戻す。
- **L10-LABO-005-CASE-04 negative automatic adoption** (`LABO-005-AC-03`) — candidate identityだけで採択/実施状態を生成する要求。期待：candidate-only状態で止め、operation changeを行わない。
- **L10-LABO-005-CASE-05 negative automatic retire** (`LABO-005-AC-03`) — RETIRE candidateだけを根拠に対象を退役させる要求。期待：退役を実行せず上流判断対象として残す。
- **L10-LABO-005-CASE-06 negative mechanism-count objective** (`LABO-005-AC-03`) — 新機構の追加件数または増加だけを改善目的/成功指標として与える。期待：件数増加を成果理由として採用せず、また件数最小化という逆向きの制限も作らず、meaning/condition/scopeに基づく候補比較を維持する。
- **L10-LABO-005-CASE-07 negative insufficient source/condition** (`LABO-005-AC-02`, `LABO-005-AC-03`) — source revisionまたは適用条件だけを欠落させる。期待：候補をunknown/unresolvedに保ち、元候補source ownerへ不足を返す。
- **L10-LABO-005-CASE-08 unseen normal** (`LABO-005-AC-01`) — 未見candidate identityだが固定12 operation vocabulary中のoperationでsource, meaning delta, condition, scopeが揃う。期待：既存ACで根拠付きcandidateとしてtraceでき、採択/実行しない。

- **L10-LABO-005-CASE-09 negative L2-004/L2-014 dependency fields** (`LABO-005-AC-01`, `LABO-005-AC-02`, `LABO-005-AC-03`) — Vector output identity/revision/scope、元意味、部分比較、条件差、evidence、L2-014接続traceの各fieldを一つだけmissing, unknown, stale, wrong-revisionに変えた独立fixture群。期待：候補を確定せず別sourceで補完せず、元仮説/sourceまたは既存接続ownerへ戻す。
- **L10-LABO-005-CASE-10 negative candidate tuple census** (`LABO-005-AC-01`, `LABO-005-AC-02`) — 12 operationそれぞれについて、候補の維持意味、変更意味、適用条件、scopeの4 fieldを一つだけmissingまたはbaselineからmismatchにする別fixtureを作る。期待：対象fieldだけunresolvedにし候補を確定しない。ほかのoperationやsourceで補完しない。
- **L10-LABO-005-CASE-11 negative individual dependency identity/revision** (`LABO-005-AC-01`, `LABO-005-AC-02`, `LABO-005-AC-03`) — L2-004/014の各parent identity、source revision、version、scopeを一つずつmissing/stale/wrong-revisionとする独立fixture。期待：candidateを実行・採択せず、当該元仮説/契約ownerへ戻す。

- **L10-LABO-005-CASE-12 normal unfinished duty retained** (`LABO-005-AC-01`, `LABO-005-AC-02`) — candidateに意味差・条件・scopeが揃い、既存の未完義務identityも含む通常入力を与える。期待：12 operation候補との比較を保ち、義務を完了・消失へ変換しない。

### L3 ACとcase対応・共通oracle

| 親句 | L3 functional AC | L10 case |
|---|---|---|
| 002 episode chain/field/source | `LABO-002-AC-01` | `L10-LABO-002-CASE-01, L10-LABO-002-CASE-02, L10-LABO-002-CASE-07, L10-LABO-002-CASE-08, L10-LABO-002-CASE-10, L10-LABO-002-CASE-12, L10-LABO-002-CASE-13, L10-LABO-002-CASE-15, L10-LABO-002-CASE-16, L10-LABO-002-CASE-17` |
| 002 orphan/missing/incomplete and status fidelity | `LABO-002-AC-02` | `L10-LABO-002-CASE-02, L10-LABO-002-CASE-03, L10-LABO-002-CASE-05, L10-LABO-002-CASE-12, L10-LABO-002-CASE-17` |
| 002 false correlation/correction and dependency rejection | `LABO-002-AC-03` | `L10-LABO-002-CASE-04, L10-LABO-002-CASE-05, L10-LABO-002-CASE-06, L10-LABO-002-CASE-08, L10-LABO-002-CASE-09, L10-LABO-002-CASE-10, L10-LABO-002-CASE-11, L10-LABO-002-CASE-13, L10-LABO-002-CASE-14, L10-LABO-002-CASE-15` |
| 003 independent categories/evidence | `LABO-003-AC-01` | `L10-LABO-003-CASE-01, L10-LABO-003-CASE-07, L10-LABO-003-CASE-08, L10-LABO-003-CASE-09` |
| 003 unknown/condition/contradiction/unfinished duty | `LABO-003-AC-02` | `L10-LABO-003-CASE-02, L10-LABO-003-CASE-03, L10-LABO-003-CASE-04, L10-LABO-003-CASE-09, L10-LABO-003-CASE-10` |
| 003 return to evidence source | `LABO-003-AC-03` | `L10-LABO-003-CASE-05, L10-LABO-003-CASE-06, L10-LABO-003-CASE-08, L10-LABO-003-CASE-09, L10-LABO-003-CASE-10` |
| 004 seven axes/守破離 candidate | `LABO-004-AC-01` | `L10-LABO-004-CASE-01, L10-LABO-004-CASE-02, L10-LABO-004-CASE-03, L10-LABO-004-CASE-07, L10-LABO-004-CASE-08, L10-LABO-004-CASE-09, L10-LABO-004-CASE-11` |
| 004 partial match/not authority | `LABO-004-AC-02` | `L10-LABO-004-CASE-02, L10-LABO-004-CASE-03, L10-LABO-004-CASE-06, L10-LABO-004-CASE-09` |
| 004 clarification before transformation | `LABO-004-AC-03` | `L10-LABO-004-CASE-04, L10-LABO-004-CASE-05, L10-LABO-004-CASE-08, L10-LABO-004-CASE-09, L10-LABO-004-CASE-10, L10-LABO-004-CASE-11` |
| 005 12 operations/delta/conditions/scope | `LABO-005-AC-01` | `L10-LABO-005-CASE-01, L10-LABO-005-CASE-02, L10-LABO-005-CASE-08, L10-LABO-005-CASE-09, L10-LABO-005-CASE-10, L10-LABO-005-CASE-11, L10-LABO-005-CASE-12` |
| 005 unresolved meaning/conditions and unfinished duty | `LABO-005-AC-02` | `L10-LABO-005-CASE-03, L10-LABO-005-CASE-07, L10-LABO-005-CASE-09, L10-LABO-005-CASE-10, L10-LABO-005-CASE-11, L10-LABO-005-CASE-12` |
| 005 no LABO decision/adoption/retirement | `LABO-005-AC-03` | `L10-LABO-005-CASE-03, L10-LABO-005-CASE-04, L10-LABO-005-CASE-05, L10-LABO-005-CASE-06, L10-LABO-005-CASE-07, L10-LABO-005-CASE-09, L10-LABO-005-CASE-11` |

判定ではmissing/unknownを実測zeroや成功として扱わない。source identity/revision不足は元source owner、relationの誤りはその関係を供給した既存source/contract owner、上流meaning変更判断は既存上流authorityへ戻す。LABOはsource stateを変更せず、Worker/モデルの配置・資格を決めず、candidateを採択・実行しない。旧L10/test/runtimeを実行していない。

## Stage 2b — HELIXLABO-L2-006/007/008/009/010 総合verification oracle

状態：未実行の合成fixture・oracle設計。対象は固定された5親だけ。固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO adoption `633bf12ea8f948db8ba3d6600179c4a9507377a7`、G0順序記録 `1880c422311a7f8321dbb0e2b98fa12c69449201`。G0は順序のみで採択authorityではない。固定source pins、旧資産起点/差分、case countは[本件不変source/pair監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-review01-repair04-2026-10-05.json)に固定する。各caseは[L3 functional AC](../L3-requirements/functional-requirements.md)を照合し、実行、assignment、資格、system/operation変更、target registration/routing、PO判断を生成しない。通常例・negativeは記載した一変数だけを変え、未見正常は固定scope内の未見identityで既存ACを再確認する。

### HELIXLABO-L2-006 — Experiment Engine (`LABO-006-FR-01`)

固定親の14列挙evaluation categoriesは各々別に扱い、success/failureおよびFP/FNの値はそれぞれ分けて観測する。比較baselineは同じticket/experiment/target version、宣言条件、oracle、scopeに結ばれたbaseline/current、candidate、hybridのarmである。assignment/ticketはOS、実行result/contractはWorkerまたは提供source、oracle/仮説/条件は原source ownerの責務で、LABOは補わない。

- **L10-LABO-006-CASE-01 normal comparison**（`LABO-006-AC-01`, `LABO-006-AC-02`）— 同じOS ticket/operation identity、assignment identity、experiment identity、target revision、比較条件、oracle identity/revision/scopeを持つbaseline/current、candidate、hybridの別armを与える。Worker result source/contractを同assignment・experiment・対象版へ結び、品質、success/failure、FP/FN、rework、speed、CI/Worker time、token/API cost、人間介入、context、complexity、recovery time、release lead、ops load、cross-product reuseを個別に観測する。期待：arm/14列挙category（success/failureとFP/FNは個別値）ごとに結果と出典を保持し、総合加点や「一度動いた」だけの改善認定をしない。
- **L10-LABO-006-CASE-02 unseen normal**（`LABO-006-AC-01`, `LABO-006-AC-02`）— 未見experiment/target revisionと異なる有効oracleの組合せだが、各armのsource identity、同一条件、assignment/result linkが完全なfixture。期待：L10-LABO-006-CASE-01と同じdimension別比較を同一scope内で行い、異なるoracle結果を混ぜず、scope外へ一般化しない。
- **L10-LABO-006-CASE-03 negative comparison condition**（`LABO-006-AC-01`, `LABO-006-AC-03`）— L10-LABO-006-CASE-01からcandidate armの評価条件だけを変える。期待：同条件比較にせず、該当armをincomparableとして残す。
- **L10-LABO-006-CASE-04 negative oracle identity**（`LABO-006-AC-01`, `LABO-006-AC-03`）— 他fieldは同じままcandidate armのoracle identityだけ欠落または別identityにする別fixture。期待：oracle差を隠さず比較不能/unknownとし、improvementを生成しない。
- **L10-LABO-006-CASE-05 negative oracle revision or scope**（`LABO-006-AC-01`, `LABO-006-AC-03`）— oracle revisionだけstale/wrong revisionとするfixtureと、oracle適用scopeだけ外すfixtureを独立に作る。期待：該当比較をunassessed/incomparableにし、元oracle ownerへ戻す。
- **L10-LABO-006-CASE-06 negative OS assignment missing**（`LABO-006-AC-02`, `LABO-006-AC-03`）— 他identity/linkを保ちOS assignment identityだけ欠落させる。期待：実行を割当済みとして扱わずOSへ戻す。
- **L10-LABO-006-CASE-07 negative Worker result contract/source**（`LABO-006-AC-02`, `LABO-006-AC-03`）— assignmentを保ちWorker result contract/source linkだけ欠落または不一致にする独立fixture。期待：結果をscoreせず、result source ownerへ戻す。
- **L10-LABO-006-CASE-08 negative ticket identity**（`LABO-006-AC-02`）— Worker/experiment/resultは同じままticket identityだけを変える。期待：別ticketの観測を結合しない。
- **L10-LABO-006-CASE-09 negative experiment identity**（`LABO-006-AC-02`）— 他identityを保ちexperiment identityだけを変える。期待：別experimentを結合しない。
- **L10-LABO-006-CASE-10 negative target version**（`LABO-006-AC-02`, `LABO-006-AC-03`）— 他fieldを保ちresult target versionだけ不一致にする。期待：同じ対象版の比較として扱わず、元source ownerへ戻す。
- **L10-LABO-006-CASE-11 negative single metric missing**（`LABO-006-AC-03`）— L10-LABO-006-CASE-01の一dimensionの観測値だけ欠落させ、別fixtureで別dimensionを欠落させる。期待：当該dimensionだけunknown/missingで保持し、他metricから補完せず、ゼロへ置換しない。
- **L10-LABO-006-CASE-12 negative interrupted run**（`LABO-006-AC-03`）— 1 armだけ実験を中断し、他条件は完全なままにする。期待：partial/interrupted結果を保持しsuccess/improvementへ変換しない。
- **L10-LABO-006-CASE-13 negative LABO assignment request**（`LABO-006-AC-02`）— 同一比較情報に「LABOがWorkerを選び割当・起動する」という要求だけ追加する。期待：LABO assignmentを生成せずOS assignment ownerへ戻す。
- **L10-LABO-006-CASE-14 negative required quality reduced for speed**（`LABO-006-AC-01`）— L10-LABO-006-CASE-01と同じticket/experiment/target revision、比較条件、oracle identity/revision/scope、OS assignment、Worker result linkを保ち、candidate armはoracleまたは宣言済み比較条件が定める必要品質条件を下回る一方、speed観測はbaseline/currentより改善したfixtureとする。品質とspeed以外のdimension値は同一にする。期待：品質条件の不成立とspeed改善を別dimensionに記録し、品質低下を理由付きで残す。speedで品質違反を相殺せず、比較全体をimprovementとしない。新しい品質閾値は作らない。

観測点：14列挙categoryの各field/出典、ticket・experiment・target版・oracle・assignment・resultの同一性、比較可能/incomparable/unassessed/interrupted状態、戻し先。

- **L10-LABO-006-CASE-15 negative one-run-is-improvement** (`LABO-006-AC-01`, `LABO-006-AC-03`) — 他arm条件・oracle・scopeを同一にし、candidate armが一回成功した事実だけを追加して改善認定を要求する。期待：一回の成功だけから比較改善を認定せず、比較根拠不足を明示する。
- **L10-LABO-006-CASE-16 normal output retention** (`LABO-006-AC-01`, `LABO-006-AC-03`) — 比較出力にfailure、counterexample、applicability scope、cost、limitsをそれぞれ別fieldで含む入力を与える。期待：5項目すべてをsource/revision付きで保持し、反例を評価可能にし、costやlimitを省略しない。

### HELIXLABO-L2-007 — Assurance Allocation Engine (`LABO-007-FR-01`)

六条件を別々に照合する: 同条件再現性、機械判定可能性、oracle適用性、副作用限定、retry/rollback可能性、冪等性。

- **L10-LABO-007-CASE-01 normal six conditions**（`LABO-007-AC-01`, `LABO-007-AC-02`）— declared scopeのrule candidateに六条件それぞれのevidence locatorが揃ったfixture。期待：supported状態を条件別に記録し、systemization candidateとoperation continuation candidateの両方、および条件・限界を示す。既存authorityへ採用を委ねる。
- **L10-LABO-007-CASE-02 unseen normal operation continuation**（`LABO-007-AC-01`, `LABO-007-AC-02`）— 未見candidateに一条件unknown、残り条件のevidence、文脈依存を含むoperation continuationの根拠を与える。期待：unknownを維持し、operation continuation candidateを消さず、systemization可と判定しない。
- **L10-LABO-007-CASE-03 negative repeatability**（`LABO-007-AC-01`）— 共通baselineから同条件再現性evidenceだけを除く。期待：当該条件unknown、他条件の状態は維持。
- **L10-LABO-007-CASE-04 negative machine decidability**（`LABO-007-AC-01`）— 機械判定可能性evidenceだけを除く。期待：当該条件unknown、system化を確定しない。
- **L10-LABO-007-CASE-05 negative oracle**（`LABO-007-AC-01`）— oracle identity/revision/applicability evidenceだけを除く。期待：当該条件unknown、推測oracleを作らない。
- **L10-LABO-007-CASE-06 negative side effect boundary**（`LABO-007-AC-01`）— side-effect bound evidenceだけを外す。期待：boundedと判定しない。
- **L10-LABO-007-CASE-07 negative retry/rollback**（`LABO-007-AC-01`）— retry/rollback可能性evidenceだけを外す。期待：条件unknownとして保持。
- **L10-LABO-007-CASE-08 negative idempotency**（`LABO-007-AC-01`）— idempotency evidenceだけを外す。期待：条件unknownとして保持。
- **L10-LABO-007-CASE-09 negative connection counterexample loss**（`LABO-007-AC-01`, `LABO-007-AC-02`）— L2-016経由evidenceからcounterexampleだけ欠落させる。期待：comparability/counterexample不足を明記し、systemization evidenceに昇格しない。
- **L10-LABO-007-CASE-10 negative shadow auto-promotion**（`LABO-007-AC-03`）— other evidenceを変えずstage label `Shadow`から自動Mechanism Candidate/productionへ昇格する要求だけを加える。期待：自動遷移・承認・資格を生成しない。
- **L10-LABO-007-CASE-11 negative operation candidate erased**（`LABO-007-AC-02`, `LABO-007-AC-03`）— high FPまたは例外多数のoperation continuation候補だけをsystemization-only表示へ消す要求。期待：operation候補と限界を保持する。
- **L10-LABO-007-CASE-12 negative new qualification gate**（`LABO-007-AC-03`）— stage名から追加approval/qualification gateが必要とする提案だけを追加。期待：固定親にないgateを生成しない。

観測点：6条件別supported/contradicted/unknown、各locator、candidate種別・scope・counterexample・unresolved condition。総合scoreまたは自動昇格なし。

- **L10-LABO-007-CASE-13 normal observed shadow stage** (`LABO-007-AC-02`, `LABO-007-AC-03`) — 六条件評価とoperation/systemization両candidateを保ち、shadowという説明stageだけを観測済みとする。期待：stage labelとcandidate評価を別記録し、自動昇格・gateを生成しない。
- **L10-LABO-007-CASE-14 normal contradicted condition** (`LABO-007-AC-01`, `LABO-007-AC-02`) — 6条件のうち1条件だけ反証evidenceを与える。期待：その条件をcontradicted、残りを各根拠どおりsupported/unknownとし、operation continuation candidateを消さず、systemization-onlyにしない。
- **L10-LABO-007-CASE-15 normal repeated episode input** (`LABO-007-AC-01`) — 同一条件を明示した複数episodeのevidenceを与える。期待：反復入力とepisode identityを保持し、各六条件の判定に結び付ける。反復数だけで候補を自動昇格しない。
- **L10-LABO-007-CASE-16 negative individual operation-exclusion criteria** (`LABO-007-AC-02`) — 共通normal baselineから、文脈依存、意味判断、例外多数、不完全oracle、高い誤検知、過剰拘束の各条件を一つずつ独立変異として与える。各fixtureでoperation continuationをsystemization-onlyから除く要求を加える。期待：各変異でoperation候補を保持し、該当限界を記録する。他条件は固定する。
- **L10-LABO-007-CASE-17 negative dependency evidence variants and return** (`LABO-007-AC-01`, `LABO-007-AC-02`) — L2-006/016由来の比較可能性欠落、interrupted/undecidable、counterexample欠落、experiment identity stale、revision staleを独立fixtureとする。期待：条件をunknown/unresolvedに保ち、該当L2-006/016 experiment/evidence ownerへ理由付きで戻す。CASE-03〜08の単独条件欠落も、その条件 evidence ownerへ返す。

- **L10-LABO-007-CASE-18 negative maximize systemization rate** (`LABO-007-AC-02`, `LABO-007-AC-03`) — 同一のcandidate/evidence populationに対し、operation continuation候補を減らすことをsystemization率最大化の目的として追加する変異だけを与える。期待：systemization率を目的・成功指標にせず、六条件評価・両candidate・未完条件を保持し、新しい合格率/thresholdを作らない。
- **L10-LABO-007-CASE-19 negative candidate mislabeled as unfinished operation** (`LABO-007-AC-02`) — operation continuation candidateを支える同じ証拠入力で、(a)別途未完義務の証拠を含むfixtureと、(b)未完義務の証拠がないfixtureを分ける。各fixtureで変えるのは出力上、candidate自体を「未完成」と表示することだけとする。期待：candidateを未完成と表示せず、operation continuation candidateの評価を保つ。(a)では独立した未完義務identity/stateを保持し、(b)では未完義務を生成しない。operationの実行状態・完了状態は入力条件にも判定対象にも加えない。

### HELIXLABO-L2-008 — Operational Fallback Engine (`LABO-008-FR-01`)

- **L10-LABO-008-CASE-01 normal continue candidate**（`LABO-008-AC-01`, `LABO-008-AC-02`）— current system version、owner-provided outcome、例外、FP、workaround/cost、guarantee、conditions、unfinished dutiesを含み、証拠がsystem継続候補を支えるfixture。期待：continue candidateと全evidence・保証・未完義務を保持する。
- **L10-LABO-008-CASE-02 unseen normal operational fallback**（`LABO-008-AC-01`, `LABO-008-AC-02`）— 未見revisionの運用結果からoperation復帰候補が支持され、operation条件・current guarantee・unfinished dutyが揃うfixture。期待：fallbackを正規の改善candidateとして示し、失敗/retireへ読み替えず、切替実行をしない。
- **L10-LABO-008-CASE-03 negative current version**（`LABO-008-AC-01`, `LABO-008-AC-03`）— current system versionだけmissing/stale。期待：currentとして使わずunknownで現responsibility ownerへ戻す。
- **L10-LABO-008-CASE-04 negative operational result**（`LABO-008-AC-01`）— owner-provided operational resultだけを欠落させる。期待：結果を捏造せずunresolved。
- **L10-LABO-008-CASE-05 negative exception evidence**（`LABO-008-AC-01`）— 例外発生は宣言されているがexception evidenceだけ欠落する。期待：例外を消さず根拠不足を保持。
- **L10-LABO-008-CASE-06 negative false-positive evidence**（`LABO-008-AC-01`）— FPなしと主張しながらFP observationだけ欠落。期待：no-FP claimを確定しない。
- **L10-LABO-008-CASE-07 negative workaround burden**（`LABO-008-AC-01`）— workaround existsを維持し負担fieldだけ欠落。期待：負担をゼロにしない。
- **L10-LABO-008-CASE-08 negative change cost**（`LABO-008-AC-01`）— change-cost observationだけmissing。期待：費用ゼロや無費用改善へ変換しない。
- **L10-LABO-008-CASE-09 negative guarantee/condition**（`LABO-008-AC-02`）— guaranteeまたは復帰先operation conditionを個別subfixtureで一つだけ欠落。期待：未確定とし候補を完結表示しない。
- **L10-LABO-008-CASE-10 negative unfinished duty loss**（`LABO-008-AC-02`）— fallback candidateからunfinished duty identityだけを除く。期待：元義務を保持し候補に再掲、義務完了としない。
- **L10-LABO-008-CASE-11 negative disputed owner**（`LABO-008-AC-03`）— 他情報を固定し現在のresponsibility ownerだけunknown/conflict。期待：routeを推測せずunresolvedとして保持。
- **L10-LABO-008-CASE-12 negative LABO executes switch**（`LABO-008-AC-03`）— valid fallback candidateへsystem/operationを即時切替える要求だけを加える。期待：候補を保ち、切替を実行しない。

観測点：source revision別のevidence、候補種別、現行保証・復帰条件・unfinished-duty identity、owner不確定状態、実切替なし。

- **L10-LABO-008-CASE-13 negative system permanently fixed** (`LABO-008-AC-01`, `LABO-008-AC-03`) — 他の運用evidenceを固定しsystemは永久に変更しないという要求だけを加える。期待：固定前提を採用せずcontinue/modify/fallback候補を保持する。
- **L10-LABO-008-CASE-14 negative fallback mislabeled failed/retired** (`LABO-008-AC-01`, `LABO-008-AC-02`) — 正常なoperation復帰candidateのlabelだけをfailureまたはretirementへ変える要求を与える。期待：operation復帰候補を正しく保持し、失敗/退役と表示しない。
- CASE-03〜CASE-10で必須情報が欠落・stale・conflictの場合、各期待にはunresolved表示に加えて不足fieldの現行責務のowner、理由、元identity/revisionへの返却を含める。ownerが不明なら推測せずunknownとして保持する。

- **L10-LABO-008-CASE-15 normal modify candidate** (`LABO-008-AC-01`, `LABO-008-AC-02`) — CASE-01と同じcurrent versionと責務ownerを使い、evidenceがsystem修正候補を支持する独立fixtureを与える。期待：modify candidateをcontinue/fallbackと別に記録し、保証・条件・未完義務を保持する。
- **L10-LABO-008-CASE-16 negative L2-007 dependency identity/revision/scope** (`LABO-008-AC-03`) — 他入力を固定し、選択したL2-007 candidate identity、revision、scopeをそれぞれ独立fixtureで欠落・stale・不一致にする。期待：依存candidateを成立済み扱いせずunknown/unresolvedとして保持し、元identity/revisionと理由を付けて現行責務のownerへ戻す。
- **L10-LABO-008-CASE-17 negative L2-017 dependency identity/revision/scope** (`LABO-008-AC-03`) — 他入力を固定し、L2-017のcurrent guarantee、reevaluation candidate、unfinished-duty、owner-provided resultのidentity/revision/scopeをそれぞれ独立fixtureで欠落・stale・不一致にする。期待：依存結果を補完せずunknown/unresolvedとして保持し、元identity/revisionと理由を付けて現行責務のownerへ戻す。

### HELIXLABO-L2-009 — Generalization Engine (`LABO-009-FR-01`)

正常例はscope段階を取り違えないよう、各scope claimを独立fixtureとする。

- **L10-LABO-009-CASE-01 normal single episode scope**（`LABO-009-AC-01`）— 一episode内のevidenceとapplicability conditionだけを与える。期待：single-episode claimに限定し、反復以上へ一般化しない。
- **L10-LABO-009-CASE-02 normal repeated episodes scope**（`LABO-009-AC-01`）— 複数episodeの同条件evidence、sample conditions、反例を与える。期待：支持範囲をrepeated episodesに限る。
- **L10-LABO-009-CASE-03 normal cross-project scope**（`LABO-009-AC-01`）— 複数project identityと適用条件・反例を提供する。期待：cross-project evidenceを保ち、cross-product/general structureへ拡張しない。
- **L10-LABO-009-CASE-04 normal cross-product scope**（`LABO-009-AC-01`, `LABO-009-AC-02`）— 複数productの明示identity、各evidence/sample condition、counterexampleとproduct-specific/generalの区別がある。期待：その証拠が支える場合に限りcross-productまで示し、5段階scopeごとのFeedback先を分け、product固有meaningをBRAINへ送らない。
- **L10-LABO-009-CASE-05 normal general-structure scope**（`LABO-009-AC-01`, `LABO-009-AC-02`）— product固有条件を超えたgeneric-structure claimを支える明示evidence、scope、counterexampleを与える。期待：evidenceが直接支持する範囲だけgeneral structureを示し、上位scopeのFeedback先を下位scopeと混同しない。
- **L10-LABO-009-CASE-06 unseen normal bounded scope**（`LABO-009-AC-01`, `LABO-009-AC-02`）— 未見のmulti-project identityを持つevidenceと、一条件外のcounterexampleを与える。期待：支持scopeをevidenceが支える段階へ狭め、counterexample・sample conditionを保持する。
- **L10-LABO-009-CASE-07 negative invalid experiment evidence**（`LABO-009-AC-01`, `LABO-009-AC-03`）— 他条件を保ちexperiment result/oracle validityだけ欠落またはincomparableにする。期待：scope unassessed、元experiment/oracle ownerへ戻す。
- **L10-LABO-009-CASE-08 negative sample condition**（`LABO-009-AC-01`, `LABO-009-AC-03`）— sample conditionだけ欠落。期待：母集団や適用範囲を推測しない。
- **L10-LABO-009-CASE-09 negative counterexample omitted**（`LABO-009-AC-01`, `LABO-009-AC-03`）— 他evidenceは同じでcounterexampleだけを隠す。期待：counterexampleなしの広いclaimを出さない。
- **L10-LABO-009-CASE-10 negative applicability boundary**（`LABO-009-AC-01`, `LABO-009-AC-03`）— scope applicability limitだけ欠落/矛盾にする。期待：scope unknownのままとする。
- **L10-LABO-009-CASE-11 negative unsupported cross-product**（`LABO-009-AC-01`）— cross-product evidenceだけないのにcross-product claimを出す要求。期待：支持済みの下位scopeまでに留める。
- **L10-LABO-009-CASE-12 negative product-specific to BRAIN**（`LABO-009-AC-02`）— product-specific meaningの行先だけBRAINへ変える要求。期待：target product ownerの意味を保ちBRAINへrouteしない。
- **L10-LABO-009-CASE-13 negative unsupported generic structure**（`LABO-009-AC-01`, `LABO-009-AC-03`）— generic-structure evidenceなしでそのclaimだけ出す。期待：generic構造を認定せずunknown。
- **L10-LABO-009-CASE-14 negative single episode overgeneralization**（`LABO-009-AC-01`）— L10-LABO-009-CASE-01と同じ一episode evidenceからrepeated/cross-project以上のscopeを主張。期待：single episodeを超えない。

観測点：5 level別evidence/counterexample/sample condition、主張scopeと最大supported scope、scope別Feedback destination。最小標本数を追加しない。

- **L10-LABO-009-CASE-15 negative counterexample narrows scope** (`LABO-009-AC-02`, `LABO-009-AC-03`) — 既存supported claimへ反例一件だけを加え、反例条件では再現しないfixtureを与える。期待：反例のsource locatorを保持し、claim scopeを反例が許す範囲まで狭める。scopeを狭めず反例を捨てる出力は不成立。
- **L10-LABO-009-CASE-16 negative stale experiment evidence** (`LABO-009-AC-03`) — CASE-02のevidence identityを保ちrevisionだけをstaleにする。期待：現行evidenceとみなさずscopeをunknown/unassessedとし、元experiment/evidence ownerへ理由付きで戻す。
- CASE-08/09/10/13の不足・矛盾・counterexample・applicability-boundary各fixtureは、unresolvedに加え該当experiment/evidence owner、元identity/revision、差戻し理由をoracleとする。owner未指定時はunknownのままにする。

### HELIXLABO-L2-010 — Feedback Derivation Engine (`LABO-010-FR-01`)

各正常fixtureで、次の8 valid actionを8つの別target-specific proposal rowに一つずつ使う: `maintain`, `redefine`, `replace`, `split`, `merge`, `systemize`, `operational_fallback`, `retire`。8値は全て有効normal inputでありnegative扱いしない。各rowは16 mandatory fieldsを全て持つ。

- **L10-LABO-010-CASE-01 normal complete proposal family**（`LABO-010-AC-01`, `LABO-010-AC-02`, `LABO-010-AC-03`）— 完全なsource/evidence/scope付きの一target evidenceを共通baselineとし、actionを支持する根拠だけを変えた8個の独立subfixtureを用意する。各subfixtureは16 fieldを全て持つ1 proposal rowを出し、valid action set `maintain`, `redefine`, `replace`, `split`, `merge`, `systemize`, `operational_fallback`, `retire` を8件それぞれ一度ずつ使う。期待：列挙値を保持し、target-specific candidateとしてのみ記録する。LABOから登録/routing/ticket/変更を行わない。
- **L10-LABO-010-CASE-02 unseen normal multi-target family**（`LABO-010-AC-01`, `LABO-010-AC-02`, `LABO-010-AC-03`）— 未見のepisode/target identityから2つ以上のtarget identityを別々に扱う。各targetについて、actionを支持する根拠だけを変えた8個の独立subfixtureを用意し、各々に16 field完備の1 proposal rowを出してvalid action set `maintain`, `redefine`, `replace`, `split`, `merge`, `systemize`, `operational_fallback`, `retire` を8件それぞれ一度ずつ使う。期待：target間でresponsibility/evidenceを混ぜず、すべて提案状態に留める。
- **L10-LABO-010-CASE-03 negative source_episode**（`LABO-010-AC-01`）— L10-LABO-010-CASE-01から`source_episode`だけ欠落させる。期待：推定せず未確定。
- **L10-LABO-010-CASE-04 negative source_revision**（`LABO-010-AC-01`）— `source_revision`だけmissing/staleにする。期待：同じrevisionと偽装しない。
- **L10-LABO-010-CASE-05 negative target_mechanism**（`LABO-010-AC-01`, `LABO-010-AC-03`）— `target_mechanism`だけ欠落/unknownにする。期待：targetを確定しない。
- **L10-LABO-010-CASE-06 negative target_responsibility**（`LABO-010-AC-01`, `LABO-010-AC-03`）— `target_responsibility`だけ欠落/矛盾にする。期待：ownerを推測しない。
- **L10-LABO-010-CASE-07 negative observation**（`LABO-010-AC-01`）— `observation`だけ欠落。期待：別fieldから補完しない。
- **L10-LABO-010-CASE-08 negative evidence**（`LABO-010-AC-01`）— `evidence` identity/revisionだけ欠落またはstaleにする。期待：proposalをevidence-supportedとしない。
- **L10-LABO-010-CASE-09 negative failure_or_success**（`LABO-010-AC-01`）— `failure_or_success`だけunknown/missingにする。期待：成功/失敗を推定しない。
- **L10-LABO-010-CASE-10 negative hypothesis**（`LABO-010-AC-01`）— `hypothesis`だけ欠落。期待：根拠なく仮説を補わない。
- **L10-LABO-010-CASE-11 negative experiment**（`LABO-010-AC-01`）— `experiment` identity/result linkだけ欠落または別experimentへする。期待：別実験で補完しない。
- **L10-LABO-010-CASE-12 negative result**（`LABO-010-AC-01`）— `result`だけ欠落/unknownにする。期待：結果を確定しない。
- **L10-LABO-010-CASE-13 negative counterexample**（`LABO-010-AC-01`, `LABO-010-AC-03`）— `counterexample`だけ欠落。期待：counterevidenceを捨てない。
- **L10-LABO-010-CASE-14 negative scope**（`LABO-010-AC-01`, `LABO-010-AC-03`）— `scope`だけmissingまたはL2-009支持範囲より広くする。期待：範囲unknown/unresolved。
- **L10-LABO-010-CASE-15 negative confidence**（`LABO-010-AC-01`）— `confidence`だけ欠落/unknownとする。期待：別fieldから数値補完しない。
- **L10-LABO-010-CASE-16 negative regression_risk**（`LABO-010-AC-01`）— `regression_risk`だけ欠落。期待：リスクなしへ変換しない。
- **L10-LABO-010-CASE-17 negative recommended_action**（`LABO-010-AC-01`, `LABO-010-AC-02`）— `recommended_action`だけunknown/missingにする。期待：8 valid actionのどれかを推測しない。
- **L10-LABO-010-CASE-18 negative revalidation_condition**（`LABO-010-AC-01`）— `revalidation_condition`だけ欠落。期待：再確認条件を作らない。
- **L10-LABO-010-CASE-19 negative invalid action enum**（`LABO-010-AC-02`）— 完備proposalの`recommended_action`だけを列挙外値に変更する。期待：invalid/unknownで保留し、8 valid actionの一つへ写像しない。L10-LABO-010-CASE-01/02で有効とした8値はnegativeに使わない。
- **L10-LABO-010-CASE-20 negative unknown target**（`LABO-010-AC-03`）— `target_mechanism`だけunknown。期待：OS routing candidateに留め、確定target/routingを生成しない。
- **L10-LABO-010-CASE-21 negative target responsibility revision**（`LABO-010-AC-03`）— 他fieldを固定しtarget responsibility source revisionだけwrong/stale。期待：target owner/OS sourceへ戻し、責務を推測しない。
- **L10-LABO-010-CASE-22 negative overbroad scope/counterexample**（`LABO-010-AC-03`）— source scopeは維持し、proposal scopeだけL2-009 supported levelを越える。期待：広いproposalを確定しない。
- **L10-LABO-010-CASE-23 negative automatic routing** (`LABO-010-AC-03`) — 完備proposalからOS routingを生成する要求だけを加える。期待：proposalを保持し、routingを生成しない。ticket、registration、authority、placementはCASE-25〜28で別々に照合する。

- **L10-LABO-010-CASE-24 normal same experiment multi-target** (`LABO-010-AC-01`, `LABO-010-AC-03`) — 同一experiment/evidenceから複数targetに関係する通常入力を与える。期待：experiment identityを各proposalに保持し、target別proposal行へ分離する。targetごとの16 field/evidence/responsibilityを混ぜない。
- **L10-LABO-010-CASE-25 negative ticket creation** (`LABO-010-AC-03`) — CASE-01の完備proposalにticket生成を要求する変異だけを加える。期待：ticketを生成せずproposal状態を保つ。
- **L10-LABO-010-CASE-26 negative registration creation** (`LABO-010-AC-03`) — 完備proposalにOS registration生成を要求する変異だけを加える。期待：registrationを生成しない。
- **L10-LABO-010-CASE-27 negative authority transfer to LABO** (`LABO-010-AC-03`) — target authorityをLABOへ移す要求だけを加える。期待：authority移転を拒否し、targetの既存owner/authorityを維持する。
- **L10-LABO-010-CASE-28 negative placement execution** (`LABO-010-AC-03`) — 完備proposalを根拠にtargetへ配置する要求だけを加える。期待：配置を実行せずproposalをnon-authorityとして保持する。
- CASE-03〜CASE-18の各mandatory field欠落/不一致は、unresolvedだけでなく当該fieldのsource/evidence ownerへ元proposal identity/revisionと理由を添えて戻す。ownerが特定できない場合はrouteを生成せずunknownに留める。

### 固定親句→FR/AC→L10 caseの完全対応

各case IDを省略せず記載し、複数ACの対応も明示する。

| 固定親句・AC | 対応L10 case ID |
|---|---|
| baseline/current・candidate・hybridと14比較軸、および必要品質の速度相殺禁止 (`LABO-006-AC-01`) | `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-02`, `L10-LABO-006-CASE-03`, `L10-LABO-006-CASE-04`, `L10-LABO-006-CASE-05`, `L10-LABO-006-CASE-14`, `L10-LABO-006-CASE-15`, `L10-LABO-006-CASE-16` |
| OS assignment/Worker result identity (`LABO-006-AC-02`) | `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-02`, `L10-LABO-006-CASE-06`, `L10-LABO-006-CASE-07`, `L10-LABO-006-CASE-08`, `L10-LABO-006-CASE-09`, `L10-LABO-006-CASE-10`, `L10-LABO-006-CASE-13` |
| 比較不能・失敗・反例・欠測・中断 (`LABO-006-AC-03`) | `L10-LABO-006-CASE-03`, `L10-LABO-006-CASE-04`, `L10-LABO-006-CASE-05`, `L10-LABO-006-CASE-06`, `L10-LABO-006-CASE-07`, `L10-LABO-006-CASE-10`, `L10-LABO-006-CASE-11`, `L10-LABO-006-CASE-12`, `L10-LABO-006-CASE-15`, `L10-LABO-006-CASE-16` |
| 6 assurance conditionsを別々に評価 (`LABO-007-AC-01`) | `L10-LABO-007-CASE-01`, `L10-LABO-007-CASE-02`, `L10-LABO-007-CASE-03`, `L10-LABO-007-CASE-04`, `L10-LABO-007-CASE-05`, `L10-LABO-007-CASE-06`, `L10-LABO-007-CASE-07`, `L10-LABO-007-CASE-08`, `L10-LABO-007-CASE-09`, `L10-LABO-007-CASE-14`, `L10-LABO-007-CASE-15`, `L10-LABO-007-CASE-17` |
| systemization/operation continuationの両候補と限界 (`LABO-007-AC-02`) | `L10-LABO-007-CASE-01`, `L10-LABO-007-CASE-02`, `L10-LABO-007-CASE-09`, `L10-LABO-007-CASE-11`, `L10-LABO-007-CASE-13`, `L10-LABO-007-CASE-14`, `L10-LABO-007-CASE-16`, `L10-LABO-007-CASE-17`, `L10-LABO-007-CASE-18`, `L10-LABO-007-CASE-19` |
| 自動昇格・資格・新gateを生成しない (`LABO-007-AC-03`) | `L10-LABO-007-CASE-10`, `L10-LABO-007-CASE-11`, `L10-LABO-007-CASE-12`, `L10-LABO-007-CASE-13`, `L10-LABO-007-CASE-18` |
| 運用証拠に基づくcontinue/modify/fallback候補 (`LABO-008-AC-01`) | `L10-LABO-008-CASE-01`, `L10-LABO-008-CASE-02`, `L10-LABO-008-CASE-03`, `L10-LABO-008-CASE-04`, `L10-LABO-008-CASE-05`, `L10-LABO-008-CASE-06`, `L10-LABO-008-CASE-07`, `L10-LABO-008-CASE-08`, `L10-LABO-008-CASE-13`, `L10-LABO-008-CASE-14`, `L10-LABO-008-CASE-15` |
| 保証・復帰条件・unfinished duty保持 (`LABO-008-AC-02`) | `L10-LABO-008-CASE-01`, `L10-LABO-008-CASE-02`, `L10-LABO-008-CASE-09`, `L10-LABO-008-CASE-10`, `L10-LABO-008-CASE-14`, `L10-LABO-008-CASE-15` |
| LABOはswitchせず不明ownerを推測しない (`LABO-008-AC-03`) | `L10-LABO-008-CASE-03`, `L10-LABO-008-CASE-04`, `L10-LABO-008-CASE-05`, `L10-LABO-008-CASE-06`, `L10-LABO-008-CASE-07`, `L10-LABO-008-CASE-08`, `L10-LABO-008-CASE-09`, `L10-LABO-008-CASE-10`, `L10-LABO-008-CASE-11`, `L10-LABO-008-CASE-12`, `L10-LABO-008-CASE-13`, `L10-LABO-008-CASE-16`, `L10-LABO-008-CASE-17` |
| 5 scope levelsの証拠・sample条件 (`LABO-009-AC-01`) | `L10-LABO-009-CASE-01`, `L10-LABO-009-CASE-02`, `L10-LABO-009-CASE-03`, `L10-LABO-009-CASE-04`, `L10-LABO-009-CASE-05`, `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-07`, `L10-LABO-009-CASE-08`, `L10-LABO-009-CASE-09`, `L10-LABO-009-CASE-10`, `L10-LABO-009-CASE-11`, `L10-LABO-009-CASE-13`, `L10-LABO-009-CASE-14` |
| counterexampleによるscope縮小とFeedback先分離 (`LABO-009-AC-02`) | `L10-LABO-009-CASE-04`, `L10-LABO-009-CASE-05`, `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-12`, `L10-LABO-009-CASE-15` |
| missing/unknown/incomparableを未確定に保つ (`LABO-009-AC-03`) | `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-07`, `L10-LABO-009-CASE-08`, `L10-LABO-009-CASE-09`, `L10-LABO-009-CASE-10`, `L10-LABO-009-CASE-13`, `L10-LABO-009-CASE-16` |
| 全16 mandatory fields (`LABO-010-AC-01`) | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-03`, `L10-LABO-010-CASE-04`, `L10-LABO-010-CASE-05`, `L10-LABO-010-CASE-06`, `L10-LABO-010-CASE-07`, `L10-LABO-010-CASE-08`, `L10-LABO-010-CASE-09`, `L10-LABO-010-CASE-10`, `L10-LABO-010-CASE-11`, `L10-LABO-010-CASE-12`, `L10-LABO-010-CASE-13`, `L10-LABO-010-CASE-14`, `L10-LABO-010-CASE-15`, `L10-LABO-010-CASE-16`, `L10-LABO-010-CASE-17`, `L10-LABO-010-CASE-18`, `L10-LABO-010-CASE-24` |
| 8 valid actionと列挙外unknown (`LABO-010-AC-02`) | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-17`, `L10-LABO-010-CASE-19` |
| target-specific proposal/OS・target authority境界 (`LABO-010-AC-03`) | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-05`, `L10-LABO-010-CASE-06`, `L10-LABO-010-CASE-13`, `L10-LABO-010-CASE-14`, `L10-LABO-010-CASE-20`, `L10-LABO-010-CASE-21`, `L10-LABO-010-CASE-22`, `L10-LABO-010-CASE-23`, `L10-LABO-010-CASE-24`, `L10-LABO-010-CASE-25`, `L10-LABO-010-CASE-26`, `L10-LABO-010-CASE-27`, `L10-LABO-010-CASE-28` |

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
- **L10-LABO-055-CASE-07 normal denominator reconstruction** — 同一許可済source receiptから、結果確認前に固定した明示scopeのeligible result集合・集計対象、算入結果、missing/failure/refusal/stopped/unknown各dispositionと理由、計算規則、scorer/oracle revisionを再構成する。期待：数値metric/集約水準とその分母が一致し、定性的水準も適用条件・根拠・未評価部分へ戻れる。確認 LABO-055-AC-04。
- **L10-LABO-055-CASE-08 negative unjustified exclusion** — 他のfixture内容を固定し、eligibleなfailure 1件だけを理由なく分母から除く。期待：水準を受け入れず、当該結果と欠落理由不備を残す。確認 LABO-055-AC-04。
- **L10-LABO-055-CASE-09 negative missing cost zero** — 他のfixture内容を固定し、missing費用だけを0として集計する。期待：集計を拒否し、費用missingを保持する。確認 LABO-055-AC-04。
- **L10-LABO-055-CASE-10 negative post-result denominator change** — 他条件を固定し、結果確認後に事前固定されたeligible denominatorまたは集計対象だけを変更する。期待：同一receiptから再構成できない集計として拒否する。確認 LABO-055-AC-04。
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
- **L10-LABO-057-CASE-06 negative result/verification mutation** — result state、result revisionのstale/改変、verification state、人確認receiptを各独立fixtureで欠落/改変する。期待：共通不成立としてどのreceipt方式でも受領を成立させず、stale/改変結果を成功補正しない。送受result/revision/verification/人確認receipt不一致はOS/LABOへ戻し、schema/classification問題はLABO/SECURITYへ戻す。確認 LABO-057-AC-01, LABO-057-AC-03。
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
- **L10-LABO-057-CASE-18 negative CONNECT absent** — 他条件と有効なhuman receipt fixtureを固定し、採択CONNECT contractだけを不在にする。期待：CONNECT方式を成立根拠に数えず、同義務を満たすhuman receiptにより受領成立する。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-19 negative CONNECT unknown** — 他条件と有効なhuman receipt fixtureを固定し、CONNECT contractの有効性だけunknownにする。期待：CONNECT方式を成立根拠に数えず、有効なhuman receiptにより受領成立する。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-20 negative human receipt absent** — 他条件と有効なCONNECT contract fixtureを固定し、human receiptだけを不在にする。期待：human receipt方式を成立根拠に数えず、有効なCONNECT contractにより受領成立する。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-21 negative human receipt unknown** — 他条件と有効なCONNECT contract fixtureを固定し、human receiptの有効性だけunknownにする。期待：human receipt方式を成立根拠に数えず、有効なCONNECT contractにより受領成立する。確認 LABO-057-AC-02, LABO-057-AC-03。
- **L10-LABO-057-CASE-22 negative source/delivery mismatch** — source identityとdelivery identityだけ不一致にし、受領receipt一致は保つ。期待：OSへ戻し、受領成立にしない。確認 LABO-057-AC-03。
- **L10-LABO-057-CASE-23 negative send/receive receipt mismatch** — sourceとdeliveryは一致、送信receiptと受領receiptだけ不一致にする。期待：接続・受領を成立扱いせず、受領成功を主張しない。OS/LABOへ戻し、原記録と未完義務を保持する。確認 LABO-057-AC-03。
- **L10-LABO-057-CASE-24 normal receipt return/history destination** — CONNECT契約とhuman receiptを別々の正常fixtureで成立させる。期待：LABO受領receiptを返し、後続の履歴化先を各方式で示して追跡できる。評価済みへの昇格やassignmentはしない。確認 LABO-057-AC-04。
- **L10-LABO-057-CASE-25 negative neither method establishes receipt** — 3つの独立subfixtureを与える：(a) CONNECT contractとhuman receiptがともに不在、(b) ともにunknown、(c) 一方が不在で他方がunknown。期待：いずれも有効な方式がなく、受領成功を主張せず未受領と元の未完義務を保持する。各subfixtureは他条件を固定し、片方式だけ有効なCASE-18〜21と区別する。確認 LABO-057-AC-02, LABO-057-AC-03、固定L11:154。

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
| 057 CONNECTまたはhuman receiptの代替方式と同等義務、どちらも不在/unknownなら未受領（固定L11:154） | LABO-057-FR-01; LABO-057-AC-02, LABO-057-AC-03 | L10-LABO-057-CASE-01, L10-LABO-057-CASE-02, L10-LABO-057-CASE-09, L10-LABO-057-CASE-10, L10-LABO-057-CASE-11, L10-LABO-057-CASE-12, L10-LABO-057-CASE-13, L10-LABO-057-CASE-18, L10-LABO-057-CASE-19, L10-LABO-057-CASE-20, L10-LABO-057-CASE-21, L10-LABO-057-CASE-25 |
| 057 receipt返却/履歴化先、delivery成功から評価済み・assignmentを生成しない | LABO-057-FR-01; LABO-057-AC-04 | L10-LABO-057-CASE-16, L10-LABO-057-CASE-17, L10-LABO-057-CASE-24 |
| 057 source/送達不一致はOSへ、送受receipt不一致はOS/LABOへ戻す | LABO-057-FR-01; LABO-057-AC-03 | L10-LABO-057-CASE-22, L10-LABO-057-CASE-23 |
| 057 OS-027 optional、receipt/delivery mismatch・どちらも成立しない失敗・owner別戻し | LABO-057-FR-01; LABO-057-AC-03 | L10-LABO-057-CASE-03, L10-LABO-057-CASE-04, L10-LABO-057-CASE-05, L10-LABO-057-CASE-06, L10-LABO-057-CASE-07, L10-LABO-057-CASE-08, L10-LABO-057-CASE-09, L10-LABO-057-CASE-10, L10-LABO-057-CASE-11, L10-LABO-057-CASE-12, L10-LABO-057-CASE-13, L10-LABO-057-CASE-14, L10-LABO-057-CASE-18, L10-LABO-057-CASE-19, L10-LABO-057-CASE-20, L10-LABO-057-CASE-21, L10-LABO-057-CASE-22, L10-LABO-057-CASE-23, L10-LABO-057-CASE-25 |

### 共通判定とowner戻し先

正例とnegativeは記載した一変数だけを変える。unseen normalは同じ固定scope/contract内の未見identityを用いて同じACを再確認する。sourceまたはscope不明を成功/実績0/失敗へ丸めない。OSはassignment/ticket/source/scope/delivery identity、Workerまたは元result sourceは実行/result/revision、SECURITYは許可/classificationを所有する。oracle適用性不足はBenchがunassessedとして記録し、訂正依頼は元oracle/criteria source ownerへ戻す。LABO/Benchをoracle owner・assignment owner・資格判定者にしない。固定親に独立business outcomeがないのでbusiness caseを重複作成しない。

## Stage 4 — HELIXLABO-L2-036/037/038/039/040/041/052/054総合検証（未実行fixture設計）

状態：合成fixtureとoracle設計。旧test/runtime/CIは実行していない。対応L3は[functional requirements Stage 4](../L3-requirements/functional-requirements.md)。親別正常、独立negative、未見正常を別case IDで示す。

| L10 Case ID | 固定parent / L3 AC | 入力fixture・単一変異 | 期待oracle | 不合格となる誤判定 |
|---|---|---|---|---|
| `L10-LABO-036-CASE-01` | `HELIXLABO-L2-036` / `LABO-036-AC-01` | 正常fixture：選択HARNESS対象 `req-036-A@rev-17` のverification-contract evidence `ev-036-vc-17`、scope `S-036-A`、source revision `rev-17`、HARNESS connector `conn-H-A` を使い、要求・contract自体は変えずFeedback candidateを返す。 | 同一対象revisionの許可された工程evidenceを用い、根拠・範囲付きFeedback candidateをHARNESSへ返す。 | 誤判定：親の固定条件を満たすcandidate/traceを不成立扱いする、または親にない成果・変更を生成する。 |
| `L10-LABO-036-CASE-02` | `HELIXLABO-L2-036` / `LABO-036-AC-02` | 単独negative：LABOが要求意味を直接変更する。 | 直接変更を拒否し、元要求とcandidateを分け、変更を行わない。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-036-CASE-03` | `HELIXLABO-L2-036` / `LABO-036-AC-02` | 単独negative：LABOがverification contractを直接変更する。 | 直接変更を拒否し、contractはHARNESSの正本に残す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-036-CASE-04` | `HELIXLABO-L2-036` / `LABO-036-AC-02` | 単独negative：実験結果を根拠に工程contractを即時実変更する（結果の個数・表示方法は問わない）。 | 実変更を拒否しcandidateを保持してHARNESSへ返す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-036-CASE-05` | `HELIXLABO-L2-036` / `LABO-036-AC-02` | 単独negative：Feedback target revisionを欠落させる。 | candidateの適用対象を確定せず、target不明をrouting候補へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-036-CASE-06` | `HELIXLABO-L2-036` / `LABO-036-AC-01` | 未見正常fixture：同じHARNESS対象 `req-036-A@rev-17` とscope `S-036-A` 内の未見maintenance evidence `ev-maint-036-B@rev-17` をcandidate化し、contract変更済みとはしない。 | 未見のmaintenance工程evidenceを同じscope付きcandidate形式で返し、工程契約変更済みとはしない。 | 誤判定：scope内の未見evidenceを一律拒否する、またはunknown/未評価を既知の成功・権限へ外挿する。 |
| `L10-LABO-037-CASE-01` | `HELIXLABO-L2-037` / `LABO-037-AC-01` | 正常fixture：OS target `ticket-target-037-A` と選択OS connector `conn-OS-A`、scope `S-037-A`、retry event `retry-037-01@rev-4` を用いて、ticket/stateを変更せずcandidateを返す。 | OS target identityと選択connectorが特定された運転evidenceをFeedback candidateとしてOSへ返す。 | 誤判定：親の固定条件を満たすcandidate/traceを不成立扱いする、または親にない成果・変更を生成する。 |
| `L10-LABO-037-CASE-02` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 単独negative：LABOがticketを発行する。 | ticketを作らずcandidateに留める。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-037-CASE-03` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 単独negative：LABOがworker placementを変更する。 | assignmentを変更せず、OS責務のまま保持する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-037-CASE-04` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 単独negative：LABOがpriorityを変更する。 | priorityを変更せず、OS責務のまま保持する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-037-CASE-05` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 単独negative：LABOが運転stateを更新する。 | stateを変更せず、OSが持つ既存記録を参照したcandidateに留める。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-037-CASE-06` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 単独negative：FeedbackをOS routingへ渡さず迂回する。 | OS routing迂回を拒否し、ticket/operationを作らない。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-037-CASE-07` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 単独negative：LABOがticket/operationを実行する。 | 実行を開始せず、OSが持つ既存記録を参照したcandidateに留める。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-037-CASE-08` | `HELIXLABO-L2-037` / `LABO-037-AC-01` | 未見正常fixture：同じOS target/connector/scopeを保った別の未見recovery event `recovery-037-B@rev-4` をcandidate化し、operationを実行しない。 | 未見のretry/recovery evidenceを対象scopeとともにcandidate化し、実運転を生成しない。 | 誤判定：scope内の未見evidenceを一律拒否する、またはunknown/未評価を既知の成功・権限へ外挿する。 |
| `L10-LABO-038-CASE-01` | `HELIXLABO-L2-038` / `LABO-038-AC-01` | 正常fixture：許可済み隔離evidence `authz-038-A@rev-3`、scope `S-038-A`、SECURITY target/data-handling contract `sec-contract-038-A` を用いる。fixtureにはsecret値を含めず保護candidateだけを渡す。 | 許可evidenceだけを取り扱い情報保護candidateをSECURITYへ渡す。restricted dataを通常packet/evidenceへ流さない。実secret値はfixtureに含めない。 | 誤判定：親の固定条件を満たすcandidate/traceを不成立扱いする、または親にない成果・変更を生成する。 |
| `L10-LABO-038-CASE-02` | `HELIXLABO-L2-038` / `LABO-038-AC-02` | 単独negative：LABOがauthorityを直接変更する。 | authority変更を拒否し、candidateに留める。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-038-CASE-03` | `HELIXLABO-L2-038` / `LABO-038-AC-02` | 単独negative：合成restricted-data markerを通常packetへ含める。 | packetを成立扱いせず、情報保護責務をSECURITYへ戻す。実secret値はfixtureにも記録しない。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-038-CASE-04` | `HELIXLABO-L2-038` / `LABO-038-AC-02` | 単独negative：選択scopeが不明なevidenceを許可evidenceとして扱う。 | 許可判定を推測せずunknownとしてSECURITYへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-038-CASE-05` | `HELIXLABO-L2-038` / `LABO-038-AC-01` | 未見正常fixture：scope `S-038-A` とSECURITY contractを保った別の許可済み隔離evidence `authz-038-B@rev-3` を扱い、authority判断をSECURITYに残す。 | 異なる情報保護evidenceの未見正常例でもauthority判断はSECURITYに残す。 | 誤判定：scope内の未見evidenceを一律拒否する、またはunknown/未評価を既知の成功・権限へ外挿する。 |
| `L10-LABO-039-CASE-01` | `HELIXLABO-L2-039` / `LABO-039-AC-01` | 正常fixture：既存OS/SECURITY routing `route-039-A` 経由のWorker result `worker-039-A/result-12@rev-8` と許可結果を使い、assignment/executionは変更せずtarget-specific candidateを扱う。 | 既存OS/SECURITY routingを通ったWorker result identityと許可結果をtarget-specific Feedback candidateとして扱う。 | 誤判定：親の固定条件を満たすcandidate/traceを不成立扱いする、または親にない成果・変更を生成する。 |
| `L10-LABO-039-CASE-02` | `HELIXLABO-L2-039` / `LABO-039-AC-02` | 単独negative：LABOがWorker assignmentを変更する。 | assignmentを変更せずOSへ返す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-039-CASE-03` | `HELIXLABO-L2-039` / `LABO-039-AC-02` | 単独negative：LABOがWorkerを直接実行する。 | 実行を行わず候補記録に留める。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-039-CASE-04` | `HELIXLABO-L2-039` / `LABO-039-AC-02` | 単独negative：LABOがWorkerを直接停止する。 | 停止を行わず候補記録に留める。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-039-CASE-05` | `HELIXLABO-L2-039` / `LABO-039-AC-02` | 単独negative：result identityを別Workerのresultへ差し替える。 | resultとWorker identityの不一致をunknownとして保持する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-039-CASE-06` | `HELIXLABO-L2-039` / `LABO-039-AC-02` | 単独negative：OS routingを欠いた結果をtarget-specificとして受け入れる。 | target-specific candidateとして確定せずOSへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-039-CASE-07` | `HELIXLABO-L2-039` / `LABO-039-AC-02` | 単独negative：SECURITY routingを要する結果で同routingを欠落させる。 | 許可結果として確定せずSECURITYへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-039-CASE-08` | `HELIXLABO-L2-039` / `LABO-039-AC-01` | 未見正常fixture：同じroutingとWorker identityを保った別の許可済みrecovery result `worker-039-A/result-13@rev-8` をtarget-specific candidateにする。 | 未見のrecovery resultも元Worker identityと既存routingを保って扱う。 | 誤判定：scope内の未見evidenceを一律拒否する、またはunknown/未評価を既知の成功・権限へ外挿する。 |
| `L10-LABO-040-CASE-01` | `HELIXLABO-L2-040` / `LABO-040-AC-01` | 正常fixture：選択connection `conn-040-A`、上流採択scope `S-040-A`、contract version `cv-7`、trace `trace-040-07`、CONNECT connector `connect-040-A` を結ぶretry candidateを返す。 | 選択されたconnection identityとその上流採択scopeのcontract versionに結び付くretry/trace evidenceをCONNECT candidateにする。 | 誤判定：親の固定条件を満たすcandidate/traceを不成立扱いする、または親にない成果・変更を生成する。 |
| `L10-LABO-040-CASE-02` | `HELIXLABO-L2-040` / `LABO-040-AC-01` | 未選択scopeの正常対照：この試行では当該upstream target/connectionが未選択で、選択scopeにこの要求は含まれない。 | 未選択対象を存在すると捏造せず、1.0一律依存の失敗にしない。 | 未選択だけを理由にstage全体を不成立または新gateにする変異は不合格。 |
| `L10-LABO-040-CASE-03` | `HELIXLABO-L2-040` / `LABO-040-AC-02` | 単独negative：connection identityを欠落させる。 | 接続単位のcandidateとして確定せずunknownにする。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-040-CASE-04` | `HELIXLABO-L2-040` / `LABO-040-AC-02` | 単独negative：選択connectionのcontract versionを別revisionへ差し替える。 | 異revision evidenceを成功扱いせずCONNECTへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-040-CASE-05` | `HELIXLABO-L2-040` / `LABO-040-AC-02` | 単独negative：接続traceを欠落させる。 | trace欠落を保ち候補を完了扱いしない。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-040-CASE-06` | `HELIXLABO-L2-040` / `LABO-040-AC-02` | 単独negative：LABOがconnector contractを直接変更する。 | contract変更を拒否しCONNECT ownerへ返す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-040-CASE-07` | `HELIXLABO-L2-040` / `LABO-040-AC-01` | 未見正常fixture：別の上流選択connection `conn-040-B` と固有scope/version/trace tupleを用い、Aのidentityを混ぜずcandidateにする。 | 別の選択connectionに関する未見traceでも別identityを混合せず扱う。 | 誤判定：scope内の未見evidenceを一律拒否する、またはunknown/未評価を既知の成功・権限へ外挿する。 |
| `L10-LABO-041-CASE-01` | `HELIXLABO-L2-041` / `LABO-041-AC-01` | 正常fixture：選択Product Core対象 `product-041-A` version `pv-5`、個別connector `pc-041-A`、scope `S-041-A` のUX/domain evidence `ev-041-A` を製品別candidateで返す。 | 選択製品identityと版に対応した個別connectorがあるscopeでproduct固有candidateを該当Product Coreへ返す。 | 誤判定：親の固定条件を満たすcandidate/traceを不成立扱いする、または親にない成果・変更を生成する。 |
| `L10-LABO-041-CASE-02` | `HELIXLABO-L2-041` / `LABO-041-AC-01` | 未選択scopeの正常対照：この試行では当該upstream target/connectionが未選択で、選択scopeにこの要求は含まれない。 | 未選択対象を存在すると捏造せず、1.0一律依存の失敗にしない。 | 未選択だけを理由にstage全体を不成立または新gateにする変異は不合格。 |
| `L10-LABO-041-CASE-03` | `HELIXLABO-L2-041` / `LABO-041-AC-02` | 単独negative：product identityを欠落させる。 | 製品を推測せずowner不明として戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-041-CASE-04` | `HELIXLABO-L2-041` / `LABO-041-AC-02` | 単独negative：別のProduct Coreをtargetとして指定する。 | 誤routeを拒否し正しいowner確認まで確定しない。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-041-CASE-05` | `HELIXLABO-L2-041` / `LABO-041-AC-02` | 単独negative：product固有meaningをBRAIN向けgeneric structureとして送る。 | generic化を拒否し製品側の意味を保持する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-041-CASE-06` | `HELIXLABO-L2-041` / `LABO-041-AC-01` | 未見正常fixture：同じ選択製品scopeの未見domain evidence `ev-domain-041-B@pv-5` をProduct Core別candidateに保ち、generic化しない。 | 未見の別domain evidenceも該当Product Core別に保ち、製品meaningを汎用化しない。 | 誤判定：scope内の未見evidenceを一律拒否する、またはunknown/未評価を既知の成功・権限へ外挿する。 |
| `L10-LABO-052-CASE-01` | `HELIXLABO-L2-052` / `LABO-052-AC-01` | 正常fixture：L2-035 payload `payload-035-A` のsource `source-052-A@rev-6`、scope `S-052-A`、state `unassessed` をINTELLIGENCE receipt `receipt-052-A` と対応させ、受領を評価成功にしない。 | 035 payloadの境界を保ち、LABO source revisionからINTELLIGENCE receiptまで同一revision、適用scope、unassessed状態を対応づける。 | 誤判定：親の固定条件を満たすcandidate/traceを不成立扱いする、または親にない成果・変更を生成する。 |
| `L10-LABO-052-CASE-02` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：receiptのsource revisionを別revisionにする。 | revision不一致でreceipt照合を成立させずLABO再評価へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-03` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：receiptの適用scopeを別scopeにする。 | scope不一致で受領を成功扱いせずLABO再評価へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-04` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：payloadのunassessed状態だけをassessedへ変える。 | 状態を元のまま保持し評価済みへの昇格を拒否する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-05` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：035 payload schemaを複製・再定義する。 | 052からschema定義を追加せず、035境界を参照する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-06` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：receiptからmodel変更を自動生成する。 | 変更を生成せずINTELLIGENCE判断に残す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-07` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：receiptからtrainingを自動生成する。 | training許可を生成せずsource状態を保持する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-08` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：receiptからbot稼働を自動生成する。 | bot稼働を生成せずINTELLIGENCE判断に残す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-09` | `HELIXLABO-L2-052` / `LABO-052-AC-01` | 未見正常fixture：別種の評価材料 `payload-035-B` でもsource revision/scope/stateがreceiptに一致し、receiptを評価成功としない。 | 別種の評価材料でも035 payloadとsame revision/scope/stateを保ち、受領を評価成功としない。 | 誤判定：scope内の未見evidenceを一律拒否する、またはunknown/未評価を既知の成功・権限へ外挿する。 |
| `L10-LABO-054-CASE-01` | `HELIXLABO-L2-054` / `LABO-054-AC-01` | 正常fixture：L2-055 output `waterline-055-A` のwork kind `maintenance`, model class `class-A`, scope `S-054-A`, evidence `ev-055-A`, state `unassessed` をINTELLIGENCE connector `int-054-A` へ同一tupleで渡し、OS assignmentを作らない。 | 055の出力を同じwork kind、model class、評価範囲、根拠、unassessed状態でINTELLIGENCEへ渡す。 | 誤判定：親の固定条件を満たすcandidate/traceを不成立扱いする、または親にない成果・変更を生成する。 |
| `L10-LABO-054-CASE-02` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：接続中に水準だけを変更する。 | 055の水準を不変に保ち不一致を不成立とする。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-03` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：work-kindだけを別値へ変える。 | 別work kindへ水準を流用せず再評価へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-04` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：model classだけを別値へ変える。 | 別model classへ水準を流用せず再評価へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-05` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：評価範囲だけを別scopeへ変える。 | 別scopeへ水準を流用せず再評価へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-06` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：根拠を欠落させる。 | evidence欠落をunknownのまま保持し再評価へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-07` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：unassessedをassessedとして表示する。 | 未評価のまま保持し実績化を拒否する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-08` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：LABOがmodelを指定する。 | model指定を生成せず、配置案はINTELLIGENCE、指定/割当はOSへ残す。 | 誤判定：LABOのmodel指定を受け入れ、提案・指定の状態を混同する。 |
| `L10-LABO-054-CASE-09` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：LABOがworkerを割当する。 | assignmentを生成せずOSへ残す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-10` | `HELIXLABO-L2-054` / `LABO-054-AC-01` | 未見正常fixture：適用可能な既存055 outputを伴う別work-kind/model-class組 `maintenance-B/class-B` を扱い、同じtupleをINTELLIGENCEへ渡す。 | 未見のwork-kind/model-classでも適用可能な既存055出力のみ受け渡し、unknownを成功実績へ外挿しない。 | 誤判定：scope内の未見evidenceを一律拒否する、またはunknown/未評価を既知の成功・権限へ外挿する。 |
| `L10-LABO-036-CASE-07` | `HELIXLABO-L2-036` / `LABO-036-AC-02` | 個別negative：source identity欠落。source/evidence identityだけを欠落。他fieldは正常baselineと同じ。 | identity不明をunknownとして保持し対象を推測せずrouting候補へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-036-CASE-09` | `HELIXLABO-L2-036` / `LABO-036-AC-02` | 個別negative：HARNESS connector欠落。HARNESS connectorだけを欠落。evidence identity/revision/scopeは正常baselineのまま。 | 接続先を推測せずhandoff未完了として保持する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-036-CASE-10` | `HELIXLABO-L2-036` / `LABO-036-AC-02` | 個別negative：適用scope欠落。scopeだけを欠落させ、target revision/evidence/connectorは正常baselineのまま。 | scope不明を保ち対象を推測せずrouting候補へ戻す。 | 誤判定：scope欠落/unknownを適用可能なcandidateとして受け入れる、または範囲を推測する。 |
| `L10-LABO-037-CASE-09` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 個別negative：OS target identity欠落。OS target identityだけを欠落。運転evidence/scope/connector以外は正常baselineのまま。 | target不明をOSへ戻しticket/routing/operationを生成しない。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-037-CASE-10` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 個別negative：scope欠落。選択scopeだけを欠落。OS target/evidence/connectorは正常baselineのまま。 | scopeを推測せずOSへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-037-CASE-11` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 個別negative：OS connector欠落。選択OS connectorだけを欠落。target/evidence/scopeは正常baselineのまま。 | routing未確定として保持しOSへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-038-CASE-06` | `HELIXLABO-L2-038` / `LABO-038-AC-02` | 個別negative：SECURITY contract欠落。SECURITY data-handling/target contractだけを欠落。許可evidence/scopeは正常baselineのまま。 | 許可範囲を推測せずSECURITYへ戻しcandidateを未確定に保つ。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-038-CASE-07` | `HELIXLABO-L2-038` / `LABO-038-AC-02` | 個別negative：許可evidence identity欠落。許可evidence identityだけを欠落。他fieldは正常baselineのまま。 | 許可evidenceとして確定せずunknownをSECURITYへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-039-CASE-09` | `HELIXLABO-L2-039` / `LABO-039-AC-02` | 個別negative：Worker result identity欠落。Worker result identityだけを欠落。既存OS/SECURITY routingと許可結果は保持。 | resultをtarget-specificとせずunknownとしてOSへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-040-CASE-08` | `HELIXLABO-L2-040` / `LABO-040-AC-02` | 個別negative：CONNECT connector欠落。選択connection/採択scope/contract version/traceを保ちCONNECT connectorだけを欠落。 | CONNECT先を推測せずcandidateを未完了として保持する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-040-CASE-10` | `HELIXLABO-L2-040` / `LABO-040-AC-02` | 個別negative：上流採択scope欠落。選択connection/version/trace/CONNECT connectorを保ちscopeだけを欠落させる。 | scope不明をunknownとして保持しcandidateを確定しない。 | 誤判定：scope不明を有効な接続candidateとして扱う、または未選択scopeを新gateにする。 |
| `L10-LABO-041-CASE-07` | `HELIXLABO-L2-041` / `LABO-041-AC-02` | 個別negative：product version欠落。選択product identityを保ち対応版だけを欠落。個別connector/evidenceは正常baselineのまま。 | 版を推測せずcandidateを確定しない。該当Product Core ownerへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-041-CASE-08` | `HELIXLABO-L2-041` / `LABO-041-AC-02` | 個別negative：個別connector欠落。product identity/version/scope/evidenceは保ち当該製品connectorだけを欠落。 | 別製品へ迂回せず未完了として該当Product Core ownerへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-10` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 個別negative：source identity欠落。035 payloadのsource identityだけを欠落。revision/scope/unassessed/receiptは正常baselineのまま。 | lineageを成立扱いせず該当source/evidence ownerへ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-11` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 個別negative：source revision欠落。source revisionだけを欠落。payload/scope/state/receiptは正常baselineのまま。 | revisionをunknownとして保持しLABO再評価へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-12` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 個別negative：scope欠落。適用scopeだけを欠落。source/payload/state/receiptは正常baselineのまま。 | scopeをunknownとして保持しLABO再評価へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-052-CASE-13` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 個別negative：receipt欠落。INTELLIGENCE receiptだけを欠落。source tupleは正常baselineのまま。 | 受領済みとせず循環未完了で保ちLABO再評価へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-11` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 個別negative：unknown job成功保証。L2-055に既存評価がないwork-kind/model-class tupleへ過去水準だけを適用し成功保証を出す。 | 未知tupleをunknownのまま保ち成功保証を拒否し055水準生成側へ戻す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-12` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 個別negative：scoreによるscope変更。正常055出力とscoreは一定のままscoreを理由に適用scopeだけを拡大する。 | scope変更を拒否し055の評価範囲を保持する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-13` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 個別negative：scoreによるbranch変更。正常055出力とscoreは一定のままscoreを理由にbranchだけを変更する。 | branch変更を拒否しcandidateに留める。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-14` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 個別negative：scoreによるmerge authority変更。正常055出力とscoreは一定のままscoreを理由にmerge authorityだけを変更する。 | authority変更を拒否し既存ownerへ残す。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-15` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 個別negative：INTELLIGENCE connector欠落。055 output tupleを保ちINTELLIGENCE connectorだけを欠落。 | 受領済みとせずconnection未完了を保持する。 | 誤判定：禁止作用、欠落、unknownまたは不一致を成立candidate/受領済み/成功/authority変更として受け入れる。期待oracleの不成立・unknown保持と固定親のowner戻しを無視する。 |
| `L10-LABO-054-CASE-16` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 個別negative：評価scope欠落。055 outputのwork-kind/model-class/evidence/stateは保ち評価scopeだけを欠落させる。 | unknownを保持して水準生成側へ再評価を戻し、範囲外成功を保証しない。 | 誤判定：scope不明を有効tupleとし、未知scopeへ水準を適用する。 |
| `L10-LABO-036-CASE-11` | `HELIXLABO-L2-036` / `LABO-036-AC-02` | 単独negative：別接続のconnectorをHARNESS接続へ代用する。source、revision、scopeは正常baselineのままconnector identityだけを別connectionのものにする。 | 固有connectorとの一致を要求し、代用connectorでhandoffを成立させない。 | 誤判定：別connectionのconnectorを同一接続のものとして成功扱いする。 |
| `L10-LABO-036-CASE-12` | `HELIXLABO-L2-036` / `LABO-036-AC-02` | 単独negative：HARNESS接続の片側だけ成功し他方に未完義務が残る。 | 片側成功で接続全体を成功扱いせず、未完義務を保持する。 | 誤判定：一方の成功を接続全体の成立とする。 |
| `L10-LABO-037-CASE-12` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 単独negative：別OS接続のconnectorを選択OS connectionへ代用する。 | 接続固有connectorでないものを拒否しroutingを未完了にする。 | 誤判定：別接続のconnectorでOS向けcandidateを成功扱いする。 |
| `L10-LABO-037-CASE-13` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 単独negative：OS接続の片側だけ成功し他方に未完義務が残る。 | 接続全体を成功扱いせず、未完義務とOS戻しを保持する。 | 誤判定：片側成功でrouting/接続全体を成立扱いする。 |
| `L10-LABO-038-CASE-08` | `HELIXLABO-L2-038` / `LABO-038-AC-02` | 単独negative：別SECURITY接続のconnectorを代用する。 | 固有connectorでないため拒否し、許可範囲を確定しない。 | 誤判定：別接続のconnectorで保護candidateを成立させる。 |
| `L10-LABO-038-CASE-09` | `HELIXLABO-L2-038` / `LABO-038-AC-02` | 単独negative：合成restricted-data markerを通常evidenceへ流す。 | 通常evidenceを成立扱いせずSECURITYへ戻す。実secret値はfixtureに含めない。 | 誤判定：restricted dataが通常evidenceに含まれた状態を許可する。 |
| `L10-LABO-038-CASE-10` | `HELIXLABO-L2-038` / `LABO-038-AC-02` | 単独negative：SECURITY接続の片側だけ成功し他方に未完義務が残る。 | 接続全体を成功扱いせず失敗側と未完義務を保持する。 | 誤判定：片側成功だけで接続全体を成功とする。 |
| `L10-LABO-039-CASE-10` | `HELIXLABO-L2-039` / `LABO-039-AC-02` | 単独negative：Worker execution接続へ別接続のconnectorを代用する。 | connector identity不一致を保持しtarget-specific resultを成立させない。 | 誤判定：別connection connectorでWorker resultを受理する。 |
| `L10-LABO-039-CASE-11` | `HELIXLABO-L2-039` / `LABO-039-AC-02` | 単独negative：適用されるOS/SECURITY接続の片側だけ成功する。 | 両親条件が適用される接続では片側だけで全体成功にせず、未完義務を保持する。 | 誤判定：片側の成功をOS/SECURITY経由の全体成立とする。 |
| `L10-LABO-040-CASE-11` | `HELIXLABO-L2-040` / `LABO-040-AC-02` | 単独negative：選択connectionのcontract versionだけを欠落させる。 | 欠落版を隠さずunknownとして保持し、接続candidateを完了扱いしない。 | 誤判定：contract version欠落を有効な接続として受理する。 |
| `L10-LABO-040-CASE-12` | `HELIXLABO-L2-040` / `LABO-040-AC-02` | 単独negative：選択connectionに別connectionのconnectorを代用する。 | 接続固有connector不一致を拒否しCONNECTへ戻す。 | 誤判定：別接続connectorで接続単位candidateを成立させる。 |
| `L10-LABO-041-CASE-09` | `HELIXLABO-L2-041` / `LABO-041-AC-02` | 単独negative：Product Core個別connectorへ別製品connectorを代用する。 | 対象製品identityに対応するconnectorだけを受理し、誤routeを拒否する。 | 誤判定：別製品connectorを対象製品向けとして受理する。 |
| `L10-LABO-041-CASE-10` | `HELIXLABO-L2-041` / `LABO-041-AC-02` | 単独negative：Product Core接続の片側だけ成功し未完義務が残る。 | 接続全体を成功扱いせず、未完義務を保持する。 | 誤判定：片側成功でproduct candidateの接続全体を成立扱いする。 |
| `L10-LABO-041-CASE-11` | `HELIXLABO-L2-041` / `LABO-041-AC-02` | 単独negative：LABOがProduct Core正本へ直接書き込む。 | 直接書込みを拒否し正本を製品側に残す。 | 誤判定：LABOがProduct Coreの正本を更新する。 |
| `L10-LABO-052-CASE-14` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：receiptからtraining実行・完了を循環成立の前提にする。 | 必須化を拒否し、receiptと材料循環の成立判定を独立に保つ。 | 誤判定：training実行または完了がないことだけで材料受領を不成立とする。 |
| `L10-LABO-052-CASE-15` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：receiptから調整実行・完了を循環成立の前提にする。 | 必須化を拒否し、評価材料循環を未完了扱いへ誤変換しない。 | 誤判定：調整実行・完了を新たな受領条件にする。 |
| `L10-LABO-052-CASE-16` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：LABOがINTELLIGENCEの現在判断を生成・所有する。 | 判断をLABO成果として確定せずINTELLIGENCEへ残す。 | 誤判定：現在判断をLABO所有の結果として受理する。 |
| `L10-LABO-052-CASE-17` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：LABOがINTELLIGENCEの予測を生成・所有する。 | 予測をLABO成果として確定せずINTELLIGENCEへ残す。 | 誤判定：予測をLABO所有の結果として受理する。 |
| `L10-LABO-052-CASE-18` | `HELIXLABO-L2-052` / `LABO-052-AC-02` | 単独negative：LABOがINTELLIGENCEの配置案を生成・所有する。 | 配置案をLABO成果として確定せずINTELLIGENCEへ戻す。 | 誤判定：配置案をLABO所有の結果として受理する。 |
| `L10-LABO-054-CASE-17` | `HELIXLABO-L2-054` / `LABO-054-AC-01` | 正常fixture：055 outputをINTELLIGENCE配置案 `placement-proposal-054-A` とOS指定/割当 `os-assignment-054-A` の別状態へ関連付け、同scopeの受領を確認する。 | INTELLIGENCE案とOS指定/割当を別状態で保ち、055の水準・scope・根拠・未評価を保持する。 | 誤判定：正常な別状態を一律拒否、またはproposalをassignmentへ昇格する。 |
| `L10-LABO-054-CASE-18` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：L2-055水準を別定義し重複waterlineを生成する。 | 055の既存水準生成を参照し、別定義や重複生成を拒否する。 | 誤判定：水準生成を接続要件で再定義する。 |
| `L10-LABO-054-CASE-19` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：055 waterlineを別Bench定義へ置き換える。 | 固定055出力との同一性を保ち、別定義で成立させない。 | 誤判定：接続側で別waterline定義を採用する。 |
| `L10-LABO-054-CASE-20` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：INTELLIGENCE配置案とOS指定/割当を一状態へ統合する。 | 二つの状態を別々に保持し、配置案から指定/割当を生成しない。 | 誤判定：配置案をOS指定/割当と同一視する。 |
| `L10-LABO-054-CASE-21` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：LABOがmodelを変更する。 | 変更を生成せず、配置案はINTELLIGENCE、指定/割当はOSへ残す。 | 誤判定：LABOのmodel変更を受け入れ、提案・指定・割当の境界を混同する。 |
| `L10-LABO-037-CASE-14` | `HELIXLABO-L2-037` / `LABO-037-AC-02` | 単独negative：LABOがOS operationを運転済みとして記録する。 | 運転済み記録を生成せずOS向け提案を保つ。 | 誤判定：提案をOS運転済みの記録に昇格する。 |
| `L10-LABO-040-CASE-13` | `HELIXLABO-L2-040` / `LABO-040-AC-02` | 単独negative：選択connection接続の片側だけ成功する。 | 全体接続を成功扱いせず未完義務を保持する。 | 誤判定：片側成功だけで全体candidateの接続を成立扱いする。 |
| `L10-LABO-054-CASE-22` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：INTELLIGENCE専用接続へ別接続のconnectorを代用する。 | 固有connector不一致を拒否し同scopeの受渡しを成立させない。 | 誤判定：別connectorで専用接続を成立させる。 |
| `L10-LABO-054-CASE-23` | `HELIXLABO-L2-054` / `LABO-054-AC-02` | 単独negative：INTELLIGENCE専用接続の片側だけ成功する。 | 全体受渡しを成功扱いせず未完義務を保持する。 | 誤判定：片側成功だけで全体受渡しを成立させる。 |

## Stage 2b 接続・条件補足22件（未承認・未実行）

固定L2 parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO basis `633bf12`、L2 full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`。L11共通pinは同ファイルのStage2b基本エンジン表を参照する。以下は設計fixtureでありruntime testや実装許可ではない。

| 親L2 / PO registration / decision / semantic digest | L2 raw span SHA-256 | FR/AC/case |
|---|---|---|
| `HELIXLABO-L2-012` / `MPR-RC-HELIXLABO-L2-012-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L60 / `sha256:bce298745ed3da0c1538e5bf7324a22da4b16e68715f915e46c48fa7731435a4` | L167–170 `fa1281a914381cc416a7630bebb7a4547abc3fa7f78cf96d90f947be965ad728` | `LABO-012-FR-01`, `LABO-012-AC-01/02`; 個別fixture: `L10-LABO-012-C01`, `L10-LABO-012-C02`, `L10-LABO-012-C04`, `L10-LABO-012-C05`, `L10-LABO-012-C06`, `L10-LABO-012-C07`, `L10-LABO-012-C08`, `L10-LABO-012-C09`, `L10-LABO-012-C10`|
| `HELIXLABO-L2-013` / `MPR-RC-HELIXLABO-L2-013-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L61 / `sha256:f2072a508c91ea00ff35ba233c945365b4dffe3e2d5a3c800152ce38add38876` | L171–174 `58416ed8ae9464b5e48264a3a121c35fced5b290fd1343f12270fdf429fcc56c` | `LABO-013-FR-01`, `LABO-013-AC-01/02`; 個別fixture: `L10-LABO-013-C01`, `L10-LABO-013-C04`, `L10-LABO-013-C05`, `L10-LABO-013-C06`, `L10-LABO-013-C07`, `L10-LABO-013-C08`, `L10-LABO-013-C09`, `L10-LABO-013-C10`, `L10-LABO-013-C11`, `L10-LABO-013-C12`, `L10-LABO-013-C13`, `L10-LABO-013-C14`, `L10-LABO-013-C15`, `L10-LABO-013-C16`, `L10-LABO-013-C17`|
| `HELIXLABO-L2-014` / `MPR-RC-HELIXLABO-L2-014-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L62 / `sha256:3d255c00ffd8f560dd9a181790bcc294bfae57e0571acac032ea1eba0f8760d8` | L175–178 `0f2cd059b20388f4012379e895c7b124c2f1fdd6b0b1d17281b3ee248ae4385c` | `LABO-014-FR-01`, `LABO-014-AC-01/02`; 個別fixture: `L10-LABO-014-C01`, `L10-LABO-014-C04`, `L10-LABO-014-C05`, `L10-LABO-014-C06`, `L10-LABO-014-C07`, `L10-LABO-014-C08`, `L10-LABO-014-C09`, `L10-LABO-014-C10`, `L10-LABO-014-C11`, `L10-LABO-014-C12`|
| `HELIXLABO-L2-015` / `MPR-RC-HELIXLABO-L2-015-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L63 / `sha256:c55dbc5072f5a55a2e35c7d7acd39392441d19ca3f3c3db387c313c63e73437c` | L179–182 `71522fc0ea82bd050c976d565aa4b0092df047538cd67634dd18cb52c434fbe3` | `LABO-015-FR-01`, `LABO-015-AC-01/02`; 個別fixture: `L10-LABO-015-C01`, `L10-LABO-015-C04`, `L10-LABO-015-C05`, `L10-LABO-015-C06`, `L10-LABO-015-C07`, `L10-LABO-015-C08`, `L10-LABO-015-C09`, `L10-LABO-015-C10`, `L10-LABO-015-C11`, `L10-LABO-015-C12`|
| `HELIXLABO-L2-016` / `MPR-RC-HELIXLABO-L2-016-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L64 / `sha256:439c9ed877915de9a0d2f3028fce04a12f451d7812946e3322be8b46306e8467` | L183–186 `7f79a3cecff61f2667bdce6214cf5e8de9c6b2ba6169de3ae28b33c01a42ede7` | `LABO-016-FR-01`, `LABO-016-AC-01/02`; 個別fixture: `L10-LABO-016-C01`, `L10-LABO-016-C03`, `L10-LABO-016-C04`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C08`, `L10-LABO-016-C09`, `L10-LABO-016-C10`, `L10-LABO-016-C11`|
| `HELIXLABO-L2-017` / `MPR-RC-HELIXLABO-L2-017-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L65 / `sha256:34ceade9563b09db94ef5d031c66df4c2741db3d13aa126ca0aa74b9a92b5440` | L187–190 `0a6fa1d91e9d1fd88e191ba8594b0348b092e82e1517fa68edc801bd8210c763` | `LABO-017-FR-01`, `LABO-017-AC-01/02`; 個別fixture: `L10-LABO-017-C01`, `L10-LABO-017-C03`, `L10-LABO-017-C04`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C08`, `L10-LABO-017-C09`, `L10-LABO-017-C10`, `L10-LABO-017-C11`, `L10-LABO-017-C12`, `L10-LABO-017-C13`|
| `HELIXLABO-L2-018` / `MPR-RC-HELIXLABO-L2-018-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L66 / `sha256:d1b31fb8d379f9dcfcdc6213ac4d7fcb193e20d7d59276e231f548f3db9dcfdd` | L191–194 `582e5b71bc97b9fe10e7ab1b22498b9dd023e91c393aaee3af8cedede135fd29` | `LABO-018-FR-01`, `LABO-018-AC-01/02`; 個別fixture: `L10-LABO-018-C01`, `L10-LABO-018-C03`, `L10-LABO-018-C04`, `L10-LABO-018-C05`, `L10-LABO-018-C06`, `L10-LABO-018-C07`, `L10-LABO-018-C08`, `L10-LABO-018-C09`, `L10-LABO-018-C10`|
| `HELIXLABO-L2-019` / `MPR-RC-HELIXLABO-L2-019-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L67 / `sha256:e7a90eba26b101083aa9fa449b220ea53d5c8230eed1f82980797cdabbb51d65` | L195–198 `2c931ae3ef60fcd739ce16a8c03e1ddc1c80462b4c791b8f8a79ec4ff3707670` | `LABO-019-FR-01`, `LABO-019-AC-01/02`; 個別fixture: `L10-LABO-019-C01`, `L10-LABO-019-C04`, `L10-LABO-019-C05`, `L10-LABO-019-C06`, `L10-LABO-019-C07`, `L10-LABO-019-C08`, `L10-LABO-019-C09`, `L10-LABO-019-C10`, `L10-LABO-019-C11`|
| `HELIXLABO-L2-020` / `MPR-RC-HELIXLABO-L2-020-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L68 / `sha256:61ae506fe25a2218b3c2581e47eb76a167f8344cc792d5c27d4895bd65121501` | L199–202 `1de241d1126644a0f5bdf4775b091ae87977920a7552ea999b5094bc52480082` | `LABO-020-FR-01`, `LABO-020-AC-01/02`; 個別fixture: `L10-LABO-020-C01`, `L10-LABO-020-C04`, `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10`, `L10-LABO-020-C11`, `L10-LABO-020-C12`|
| `HELIXLABO-L2-021` / `MPR-RC-HELIXLABO-L2-021-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L69 / `sha256:00dda7b8a7675bba719585e6fbb94e43a2f273146b195d00daae5718f3f1fc9e` | L203–206 `2a420b02039e3701f61387f78236753dfd59924b05bc4f0dfaa3215fec12a50b` | `LABO-021-FR-01`, `LABO-021-AC-01/02`; 個別fixture: `L10-LABO-021-C01`, `L10-LABO-021-C04`, `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10`, `L10-LABO-021-C11`, `L10-LABO-021-C12`, `L10-LABO-021-C16`, `L10-LABO-021-C13`|
| `HELIXLABO-L2-022` / `MPR-RC-HELIXLABO-L2-022-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L70 / `sha256:4dba319cb6d4abe7c909c9ffc1c9e50593efe4aa6d26548fd0434375baeae783` | L207–210 `c9de9a9d703d3a2605715ecd57511cea1cc8625891eafadea5eb2b01b6a3837d` | `LABO-022-FR-01`, `LABO-022-AC-01/02`; 個別fixture: `L10-LABO-022-C01`, `L10-LABO-022-C04`, `L10-LABO-022-C05`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11`, `L10-LABO-022-C12`, `L10-LABO-022-C13`, `L10-LABO-022-C14`, `L10-LABO-022-C16`, `L10-LABO-022-C15`, `L10-LABO-022-C17`, `L10-LABO-022-C18`|
| `HELIXLABO-L2-023` / `MPR-RC-HELIXLABO-L2-023-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L71 / `sha256:aafe6d1641624bd7986d5fd6c6a1c67644221c9df0f4503433f442c98f26a36b` | L211–214 `c9cf147b928712f82694042c22cb9951530186f1dc3036ed36c19b2b1c487cc1` | `LABO-023-FR-01`, `LABO-023-AC-01/02`; 個別fixture: `L10-LABO-023-C01`, `L10-LABO-023-C04`, `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09`, `L10-LABO-023-C11`, `L10-LABO-023-C12`, `L10-LABO-023-C16`, `L10-LABO-023-C13`|
| `HELIXLABO-L2-024` / `MPR-RC-HELIXLABO-L2-024-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L72 / `sha256:b9716e90512221b17da8f2eb3df7d8ea64bcdab2e4223ea32a720ae8c19ddbd4` | L215–218 `300c79db30dd775aa504d23005b53d51bb966b6c52b9d722aa2efa41239e7fa7` | `LABO-024-FR-01`, `LABO-024-AC-01/02`; 個別fixture: `L10-LABO-024-C01`, `L10-LABO-024-C04`, `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09`, `L10-LABO-024-C16`, `L10-LABO-024-C17`, `L10-LABO-024-C18`|
| `HELIXLABO-L2-025` / `MPR-RC-HELIXLABO-L2-025-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L73 / `sha256:e6cc467c72635a5fb91257cfb90f6a1039654d8f34a28454353566e3f3c28bf3` | L219–222 `11ddd89eb4195637bea7e61ef1af9b2e6096603ab2b601da4f35aaac4ccafac0` | `LABO-025-FR-01`, `LABO-025-AC-01/02`; 個別fixture: `L10-LABO-025-C01`, `L10-LABO-025-C04`, `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09`, `L10-LABO-025-C10`, `L10-LABO-025-C16`|
| `HELIXLABO-L2-026` / `MPR-RC-HELIXLABO-L2-026-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L74 / `sha256:64944055712d4d2c8ad4817624c5eeacba241c5bf7a008da18b2cfcdb53ec150` | L223–226 `a47b3ed9e39ae16dac5c50ab0d87282b5109c20874830693e5019e38742428ae` | `LABO-026-FR-01`, `LABO-026-AC-01/02`; 個別fixture: `L10-LABO-026-C01`, `L10-LABO-026-C04`, `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09`, `L10-LABO-026-C16`|
| `HELIXLABO-L2-027` / `MPR-RC-HELIXLABO-L2-027-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L75 / `sha256:ee444d777dfa4e45646584941998a8fa812b0070d62261e0c9ae3249928b8bab` | L227–230 `23833b323d44a786c302f054e22ead8a33e41ecdf66ff54fa1068ae1ac1eb30d` | `LABO-027-FR-01`, `LABO-027-AC-01/02`; 個別fixture: `L10-LABO-027-C01`, `L10-LABO-027-C04`, `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11`, `L10-LABO-027-C12`, `L10-LABO-027-C16`|
| `HELIXLABO-L2-028` / `MPR-RC-HELIXLABO-L2-028-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L76 / `sha256:f51b751526a581ca0cd80821dfdb9b558d3e2d4d0d3cb123420ea7391e45564e` | L231–234 `672081ff4372f097f39959b294ce961a35da899fb0e21b3d4a2f1cd3278851fd` | `LABO-028-FR-01`, `LABO-028-AC-01/02`; 個別fixture: `L10-LABO-028-C01`, `L10-LABO-028-C03`, `L10-LABO-028-C04`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C09`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`, `L10-LABO-028-C13`, `L10-LABO-028-C14`, `L10-LABO-028-C15`, `L10-LABO-028-C16`|
| `HELIXLABO-L2-029` / `MPR-RC-HELIXLABO-L2-029-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L77 / `sha256:c37e1dbc85f2c6fcfb9b55e28d867faf9c4727a3615bd36882a71353eed3c89f` | L235–238 `10ee9155ebdbcb711715fddb6bddc644421559d8be4a3c404e22fdf3eedfdb29` | `LABO-029-FR-01`, `LABO-029-AC-01/02`; 個別fixture: `L10-LABO-029-C01`, `L10-LABO-029-C04`, `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C09`, `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12`, `L10-LABO-029-C16`, `L10-LABO-029-C17`, `L10-LABO-029-C18`, `L10-LABO-029-C19`|
| `HELIXLABO-L2-030` / `MPR-RC-HELIXLABO-L2-030-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L78 / `sha256:79a9ed7a30f650e949b2f092958a3e84c428e7ff84c0e6409fd056196d4c1e50` | L239–242 `9631b221fb6c1cb7b135324e0f914084146031297e2b82b95d64e14cc0df3613` | `LABO-030-FR-01`, `LABO-030-AC-01/02`; 個別fixture: `L10-LABO-030-C01`, `L10-LABO-030-C04`, `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10`|
| `HELIXLABO-L2-034` / `MPR-RC-HELIXLABO-L2-034-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L82 / `sha256:3d6fa067472bd28ce86fa0da805972e817170bde8602652a2e070b9af572cdbf` | L255–258 `ca533b2327c362fa9c455470b9e3a524ffb883f43b2641d897d5b133b8db3231` | `LABO-034-FR-01`, `LABO-034-AC-01/02`; 個別fixture: `L10-LABO-034-C01`, `L10-LABO-034-C03`, `L10-LABO-034-C04`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08`, `L10-LABO-034-C09`, `L10-LABO-034-C10`, `L10-LABO-034-C11`, `L10-LABO-034-C12`|
| `HELIXLABO-L2-035` / `MPR-RC-HELIXLABO-L2-035-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L83 / `sha256:8cdd8f7cbbdeb905ea12b600ff007e25ad5f0bb6196c70009402ef1453662bfd` | L259–262 `deba00a65917db6a1d3663472a52aaf23ea7a586fd4035e14ed7e72f2afcfb44` | `LABO-035-FR-01`, `LABO-035-AC-01/02`; 個別fixture: `L10-LABO-035-C01`, `L10-LABO-035-C04`, `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C11`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15`, `L10-LABO-035-C16`, `L10-LABO-035-C17`, `L10-LABO-035-C18`, `L10-LABO-035-C19`|
| `HELIXLABO-L2-058` / `MPR-RC-HELIXLABO-L2-058-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L98 / `sha256:0ff4f665f3a465611b2489a908bfb161e852fa5706393d04c21d59c3598d9f17` | L403–415 `b2bbcdc2a4687314eef773ecae25517776e548be7df8c23818549eb6841ac9cf` | `LABO-058-FR-01`, `LABO-058-AC-01/02`; 個別fixture: `L10-LABO-058-C01`, `L10-LABO-058-C06`, `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C09`, `L10-LABO-058-C10`, `L10-LABO-058-C11`, `L10-LABO-058-C12`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`, `L10-LABO-058-C26`, `L10-LABO-058-C27`, `L10-LABO-058-C28`, `L10-LABO-058-C29`, `L10-LABO-058-C30`, `L10-LABO-058-C31`, `L10-LABO-058-C32`, `L10-LABO-058-C33`, `L10-LABO-058-C34`, `L10-LABO-058-C35`, `L10-LABO-058-C36`, `L10-LABO-058-C37`, `L10-LABO-058-C38`, `L10-LABO-058-C39`, `L10-LABO-058-C40`, `L10-LABO-058-C41`|

### L10-LABO-012-C01 — Correlate episodeから分類対象へ

- 対応: `LABO-012-AC-01`; 親: `HELIXLABO-L2-012`。
- 入力fixture: `L2-002`が出したepisode identity、source/evidence locator、relation identityとrevision、欠測/unknown状態を渡す。
- 期待oracle:分類対象が元episode・証拠・relation revisionへ戻れ、relationと欠測状態をそのまま保持する。因果関係を新たに確定しない。

### L10-LABO-012-C02 — relation版不一致

- 対応: `LABO-012-AC-02`; 親: `HELIXLABO-L2-012`。
- 入力fixture: relation revisionだけを訂正元と不一致にし、episodeとevidenceは有効な対照を用意する。
- 期待oracle:現在relationとして分類せず、不一致版を明示して訂正sourceへ戻す。有効なepisode/evidenceは保持する。

### L10-LABO-012-C03 — evidence欠落・unknown保持

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-012-AC-02`; 親: `HELIXLABO-L2-012`。
- 入力fixture: (a)分類根拠field欠落、(b)上流unknownをsuccessへ置換、(c)欠落とrelation不一致の併発を分ける。
- 期待oracle:欠落・unknown・版不一致を別理由で示し、分類成立へ丸めず、不足evidenceまたは訂正source ownerへ戻す。

### L10-LABO-012-C04 — 同じrelation契約のheld-out正常

- 対応: `LABO-012-AC-01`; 親: `HELIXLABO-L2-012`。
- 入力fixture: fixture名は未見だが既存`L2-002` relation schema/revisionとevidence linkに適合するepisodeを与える。
- 期待oracle:同一のprovenance・unknown保持規則で分類対象へ渡す。未見というだけで失敗にしない。

### L10-LABO-013-C01 — 分類軸付き比較仮説

- 対応: `LABO-013-AC-01`; 親: `HELIXLABO-L2-013`。
- 入力fixture: source/revisionへ結ばれた根拠付き分解結果と、意味・条件の異なる二つの比較候補を与える。
- 期待oracle:Vector向け仮説が各分類軸とその根拠を保持し、意味差と条件差を別々に比較できる。

### L10-LABO-013-C02 — 分類軸または根拠の欠落

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-013-AC-02`; 親: `HELIXLABO-L2-013`。
- 入力fixture: 分類軸とsource evidenceを一つずつ欠落させ、欠落fieldごとの対照を作る。
- 期待oracle:根拠のない比較仮説を確定せず、欠落軸を示してsource evidence ownerへ戻す。残る有効軸は保持する。

### L10-LABO-013-C03 — 軸混同・矛盾

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-013-AC-02`; 親: `HELIXLABO-L2-013`。
- 入力fixture: meaningの差をcondition差へ混ぜる、または相反する分類根拠を同一fieldへ畳む。
- 期待oracle:軸の混同/矛盾を明示しunknownまたは未確定にし、元source meaningを上書きしない。

### L10-LABO-013-C04 — 親分類軸のheld-out正常

- 対応: `LABO-013-AC-01`; 親: `HELIXLABO-L2-013`。
- 入力fixture: 未見の分類内容だが固定親の既存分類軸・evidence形式内に入る分解結果を与える。
- 期待oracle:各既存軸と根拠を保った比較仮説を返し、新しい分類語彙やauthorityを追加しない。

### L10-LABO-014-C01 — 保持点と明示差分

- 対応: `LABO-014-AC-01`; 親: `HELIXLABO-L2-014`。
- 入力fixture: 元方式の意味・目的・条件が既知の部分比較candidateと、変更しないfield/変えるfieldが記されたtransformation candidateを与える。
- 期待oracle:元意味を保持するfieldと差分fieldをsource revision付きで対比し、candidateとして返す。実変更は行わない。

### L10-LABO-014-C02 — 元意味不明または差分欠落

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-014-AC-02`; 親: `HELIXLABO-L2-014`。
- 入力fixture: (a)元目的がunknown、(b)変更fieldを記さないcandidateを個別に与える。
- 期待oracle: (a)元source/L1 ownerへ意味確認を戻す。(b)差分を補作せずcandidateを未確定にする。

### L10-LABO-014-C03 — 明示された意味変更proposal

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-014-AC-01`／`LABO-014-AC-02`; 親: `HELIXLABO-L2-014`。
- 入力fixture: (a)目的反転または制約除去を差分として明示するproposal、(b)同じ変更を隠して意味保持を装うcandidate、(c)差分をsource/L1判断前に採用・実施する要求を分ける。
- 期待oracle: (a)意味変更案として比較可能なcandidateに保ち、source/L1 ownerの判断材料として返す。(b)(c)だけを不成立とし、隠蔽または自動確定/実施を許さない。

### L10-LABO-014-C04 — 明示条件内のheld-out正常

- 対応: `LABO-014-AC-01`; 親: `HELIXLABO-L2-014`。
- 入力fixture: 未見の方式だが元意味・目的・条件のsource evidenceと変更fieldが明確なcandidateを与える。
- 期待oracle:保持点と差分を同じ比較規則で返し、candidateを実変更へ昇格しない。

### L10-LABO-015-C01 — 3比較armの一致条件

- 対応: `LABO-015-AC-01`; 親: `HELIXLABO-L2-015`。
- 入力fixture: baseline/currentを一つの比較基準armとし、candidate/hybridを加えた3 armにsource revision、target version、適用条件、同一evaluation oracleを付ける。
- 期待oracle:3 armの比較条件を再構成可能にし、arm間の差は候補構成だけとして明示する。Worker実行は起動しない。

### L10-LABO-015-C02 — oracleまたは対象版の個別欠落

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-015-AC-02`; 親: `HELIXLABO-L2-015`。
- 入力fixture: 3 arm中のoracleを一つだけ欠落させるfixtureと、target versionを一つだけ欠落させるfixtureを別々に与える。
- 期待oracle:該当armの不備を示しexperiment comparisonを成立扱いせず、当該比較の評価oracle/source ownerへ戻す。

### L10-LABO-015-C03 — 比較条件の混在

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-015-AC-02`; 親: `HELIXLABO-L2-015`。
- 入力fixture: arm間の適用条件を一つだけずらし、別fixtureではscopeとrevisionを組合せて不一致にする。
- 期待oracle:一致しないarmを比較可能と扱わず、条件差を保持して当該比較の評価oracle/source ownerへ戻す。assignmentや実行を開始しない。

### L10-LABO-015-C04 — 同一条件のheld-out正常

- 対応: `LABO-015-AC-01`; 親: `HELIXLABO-L2-015`。
- 入力fixture: 未見candidate transformationを3 armへ適用するが、全armでtarget version・oracle・適用条件を同一にする。
- 期待oracle:比較条件を分離して追跡可能なcandidateとして返し、未見名を理由に排除しない。

### L10-LABO-016-C01 — 比較証拠から二種類の評価材料へ

- 対応: `LABO-016-AC-01`; 親: `HELIXLABO-L2-016`。
- 入力fixture: 同一target/oracle/versionに結ばれた比較結果、counterexample、failure/status、比較可能性を与える。
- 期待oracle:system候補とoperation候補の評価材料を分け、counterexampleと比較可能性を両方保つ。

### L10-LABO-016-C02 — oracle不一致・反例

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-016-AC-02`; 親: `HELIXLABO-L2-016`。
- 入力fixture: oracleと比較resultの不一致、またはscope内counterexampleをそれぞれ単独で与える。
- 期待oracle:相反証拠を消さず判定不能/operation候補として保留し、system化の根拠へ丸めない。

### L10-LABO-016-C03 — 中断による比較不能

- 対応: `LABO-016-AC-02`; 親: `HELIXLABO-L2-016`。
- 入力fixture: baseline/current/candidate/hybridの一armを中断しresult receiptを欠落させる。
- 期待oracle:中断状態と未取得armを記録し、operation候補を保留する。比較完了またはsystem化と表示しない。

### L10-LABO-016-C04 — 完全証拠のheld-out正常

- 対応: `LABO-016-AC-01`; 親: `HELIXLABO-L2-016`。
- 入力fixture: 未見のoperation/ruleだが比較可能なresult、oracle、反例状態、完了状態がすべて明示されたfixtureを与える。
- 期待oracle:既存判定項目へ評価材料を分類し、反復回数だけでsystemizationしない。

### L10-LABO-017-C01 — 現行保証付き再評価candidate

- 対応: `LABO-017-AC-01`; 親: `HELIXLABO-L2-017`。
- 入力fixture: current rule version、system/operation eligibility evidence、現行保証、未完義務一覧、各義務ownerを与える。
- 期待oracle:再評価candidateと未完義務を版/owner付きで返す。運用切替は行わない。

### L10-LABO-017-C02 — 現行版・保証欠落

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-017-AC-02`; 親: `HELIXLABO-L2-017`。
- 入力fixture: current rule revisionとcurrent guaranteeを一つずつ欠落させ、旧版対照も与える。
- 期待oracle:現行条件を補完せず再評価を保留し、該当rule/guarantee ownerへ返す。

### L10-LABO-017-C03 — 所有者の運転結果不足

- 対応: `LABO-017-AC-02`; 親: `HELIXLABO-L2-017`。
- 入力fixture: eligibilityと現行保証は揃うが、operation ownerの運転結果だけが未提出のfixtureを与える。
- 期待oracle:未完義務とownerを保ち、ownerへ結果を求める再評価候補として返す。LABOは切替を完了扱いしない。

### L10-LABO-017-C04 — 義務を保つheld-out正常

- 対応: `LABO-017-AC-01`; 親: `HELIXLABO-L2-017`。
- 入力fixture: 未見rule candidateだが現行保証とowner運転結果が一致し、残る未完義務も個別owner付きで明示される。
- 期待oracle:scope内の再評価candidateを返し、未完義務を保持する。operational fallbackの切替は実行しない。

### L10-LABO-018-C01 — 証拠支持範囲の導出

- 対応: `LABO-018-AC-01`; 親: `HELIXLABO-L2-018`。
- 入力fixture: comparison result、標本のtask/model/condition scope、結果revision、および該当counterexampleを与える。
- 期待oracle:支持される適用範囲を標本条件・result・反例へ結び、未評価条件を区別する。

### L10-LABO-018-C02 — 標本条件・反例欠落

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-018-AC-02`; 親: `HELIXLABO-L2-018`。
- 入力fixture: 標本条件だけが欠落するfixtureと、comparison resultだけがstaleとなるfixtureを分けて与える。
- 期待oracle:支持範囲を確定せず、欠落またはstale条件を示してexperiment evaluatorへ戻す。

### L10-LABO-018-C03 — 適用境界の反例

- 対応: `LABO-018-AC-02`; 親: `HELIXLABO-L2-018`。
- 入力fixture: あるscope内では結果が支持されるが、隣接する条件で反例が発生するsample matrixを与える。
- 期待oracle:反例が示す範囲を支持scopeから除外し、隣接scopeへ一般化しない。反例を消さず評価ownerへ戻す。

### L10-LABO-018-C04 — 条件内held-out正常

- 対応: `LABO-018-AC-01`; 親: `HELIXLABO-L2-018`。
- 入力fixture: 未見sampleだが、宣言済みtask/model/condition scopeとcomparison oracleに適合し、反例がないfixtureを与える。
- 期待oracle:証拠が支持する範囲だけをcandidateへ追加し、親の範囲を越える主張をしない。

### L10-LABO-019-C01 — target別feedback正常

- 対応: `LABO-019-AC-01`; 親: `HELIXLABO-L2-019`。
- 入力fixture: scope-bound insight、source evidence/revision、責任候補、およびidentityが異なるtarget二つを与える。
- 期待oracle:各targetに別個のfeedback candidateを返し、evidence/scope/ownerを各candidateへ結ぶ。

### L10-LABO-019-C02 — target identity/evidence不足

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-019-AC-02`; 親: `HELIXLABO-L2-019`。
- 入力fixture: target identityがunknownのfixtureと、targetは既知だがsource evidenceが欠落するfixtureを分ける。
- 期待oracle:target不明はOS routing candidateへ戻し、根拠不足はsource/target ownerへ返す。推測routingしない。

### L10-LABO-019-C03 — target混在の否定

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-019-AC-02`; 親: `HELIXLABO-L2-019`。
- 入力fixture: 二targetのresponsibility/evidenceを一proposalに混ぜ、またはtarget owner変更をLABOに要求する。
- 期待oracle:target別に分離できる情報は保持するが、混合提案・OS routing・owner変更は実行せず不足を示す。

### L10-LABO-019-C04 — identityを保つheld-out正常

- 対応: `LABO-019-AC-01`; 親: `HELIXLABO-L2-019`。
- 入力fixture: 未見target identityでもscope-bound insight、責任候補、target evidenceが揃い、OS routing不要と明示されたfixtureを与える。
- 期待oracle:そのtargetだけのfeedback candidateを作る。未見という理由で排除せず、他targetへ一般化しない。

### L10-LABO-020-C01 — operation復帰後のobservation

- 対応: `LABO-020-AC-01`; 親: `HELIXLABO-L2-020`。
- 入力fixture: operation ownerが復帰後に記録したresult、対象source identity/revision、fallback前の旧rule版、復帰後の新rule版、未完義務を与える。
- 期待oracle:新observationにresultと旧/新rule版、source provenance、残る義務/ownerを結ぶ。切替はowner実行済み入力として扱い、LABOは実行しない。

### L10-LABO-020-C02 — 前後版/resultの個別欠落

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-020-AC-02`; 親: `HELIXLABO-L2-020`。
- 入力fixture: 旧rule version、新rule version、operation resultをそれぞれ一つずつ欠落させる。
- 期待oracle:欠落fieldごとに理由を示し、新しいsuccess observationにせずsource ownerへ戻す。

### L10-LABO-020-C03 — stale版・義務消失

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- 対応: `LABO-020-AC-02`; 親: `HELIXLABO-L2-020`。
- 入力fixture: resultに結ぶrule版をstaleにし、または未完義務をresult後に消すmutationを与える。
- 期待oracle:版不一致または義務欠落でobservationを保留し、前後のversion/未完状態を保持する。

### L10-LABO-020-C04 — identity付きheld-out正常

- 対応: `LABO-020-AC-01`; 親: `HELIXLABO-L2-020`。
- 入力fixture: 未見のoperation結果sourceだがL2-008 result contract、L2-001 observation field、前後rule versionとownerが全て結合している。
- 期待oracle:同じprovenance規則でobservationへ集積し、未見source名を理由に拒否せず、後続義務を保持する。

### L10-LABO-021-C01 — 許可source正常

- Parent/AC: `HELIXLABO-L2-021` / `LABO-021-AC-01`。
- 入力fixture: 許可されたHARNESS history record、current source contract/revision、data-use scope、source attributionを与える。
- 期待oracle: observationがsource ID/revision/許可scope/raw locatorを保ちHARNESS raw recordは不変。

### L10-LABO-021-C02 — 許可/版/範囲失敗

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-021` / `LABO-021-AC-02`。
- 入力fixture: (a)未許可scope、(b)unknown/stale revision、(c)source contract欠落を個別、併発も投入。
- 期待oracle: 対象入力hold/unknown、HARNESS ownerへ差戻し。他sourceは区別しauthority侵害0。

### L10-LABO-021-C03 — raw authority boundary

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-021` / `LABO-021-AC-02`。
- 入力fixture: inputがHARNESS raw recordまたはcurrent authorityをLABOから変更しようとする。
- 期待oracle: writeback/authority change 0、観測に限定。

### L10-LABO-021-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-021` / `LABO-021-AC-01`。
- 入力fixture: 別の許可HARNESS history categoryだが同じsource contractを満たす。
- 期待oracle: 未見categoryを一律拒否せず、scope/revisionを保持しobservation。

### L10-LABO-022-C01 — 許可OS record正常

- Parent/AC: `HELIXLABO-L2-022` / `LABO-022-AC-01`。
- 入力fixture: OS ticket/operation/assignment/receipt、accepted source version、uncompletedおよびcompleted status各1件を投入。
- 期待oracle: OS identity/revision、status/unfinished obligationを区別してobservation。

### L10-LABO-022-C02 — stale/欠落

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-022` / `LABO-022-AC-02`。
- 入力fixture: ticket/assignment/receiptを一つずつ欠落またはstale化する。
- 期待oracle: 不一致をOSへ戻し、完了・成功・evaluation済にしない。

### L10-LABO-022-C03 — 状態混同

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-022` / `LABO-022-AC-02`。
- 入力fixture: unknown/interruptedとsuccessful receiptを混在させる。
- 期待oracle: unknown/unfinishedを別fieldに残し成功へ融合しない。

### L10-LABO-022-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-022` / `LABO-022-AC-01`。
- 入力fixture: 異なるOS operation typeでsame contract/source revisionは適合。
- 期待oracle: operation typeを維持し同じprovenanceでobservation。

### L10-LABO-023-C01 — 知識利用正常

- Parent/AC: `HELIXLABO-L2-023` / `LABO-023-AC-01`。
- 入力fixture: 許可知識asset、exact source revision、利用/適用result、scope/attributionを与える。
- 期待oracle: usage resultとknowledge identity/revisionを区別し記録、sourceを不変保持。

### L10-LABO-023-C02 — source identity/permission欠落

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-023` / `LABO-023-AC-02`。
- 入力fixture: (a)identityなし、(b)revision mismatch、(c)permission/scope不明を個別・併発。
- 期待oracle: (a)identity不明と(b)revision mismatchはBRAIN source ownerへ戻す。(c)permission/scope未知の戻し先は各独立CASE C08/C09へ参照し、summaryはoracleを束ねない。別valid sourceを混同しない。

### L10-LABO-023-C03 — knowledge writeback否定

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-023` / `LABO-023-AC-02`。
- 入力fixture: LABO observationがBRAIN asset canonical text/stateを更新しようとする。
- 期待oracle: writeback 0。

### L10-LABO-023-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-023` / `LABO-023-AC-01`。
- 入力fixture: 別の許可されたknowledge-use category/asset IDで同じcontractに適合。
- 期待oracle: usage observationへtraceするがBRAIN評価/authorityを生成しない。

### L10-LABO-024-C01 — 判断結果正常

- Parent/AC: `HELIXLABO-L2-024` / `LABO-024-AC-01`。
- 入力fixture: authorized review/prediction/diagnosis result、producer decision revision、target revision、time/source identityを分離投入。
- 期待oracle: 観測事実とdecision output/source versionを別々に保持。

### L10-LABO-024-C02 — 版/履歴失敗

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-024` / `LABO-024-AC-02`。
- 入力fixture: (a)stale decision revision、(b)target revision mismatch、(c)past assessmentをcurrent authorityと誤指定。
- 期待oracle: INTELLIGENCE ownerへ戻し、historical assessmentをcurrent authorityにしない。

### L10-LABO-024-C03 — 判断/観測混同

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-024` / `LABO-024-AC-02`。
- 入力fixture: prose judgmentだけをsource factとして与える、または欠測をsuccess推測にする。
- 期待oracle: fact/evaluated judgment distinctionを保ち、不足はunknown。

### L10-LABO-024-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-024` / `LABO-024-AC-01`。
- 入力fixture: 未見判断型だがaccepted INTELLIGENCE contractで許可されている。
- 期待oracle: 同じscope/revision oracleで取込可能、new authorityは生成しない。

### L10-LABO-025-C01 — 許可scope正常

- Parent/AC: `HELIXLABO-L2-025` / `LABO-025-AC-01`。
- 入力fixture: SECURITY許可済みsafety/incident evidenceとdata-use scope locator、revision、必要最小fieldを与える。
- 期待oracle: scopeとsource revisionに制限されたobservation。restricted authority/raw payloadは転送しない。

### L10-LABO-025-C02 — scope/制限失敗

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-025` / `LABO-025-AC-02`。
- 入力fixture: (a)scope missing、(b)restricted field混入、(c)revision staleを個別・併発。
- 期待oracle: 対象入力拒否/hold、SECURITYへ返しsecret/restricted contentを記録/拡散しない。

### L10-LABO-025-C03 — source authority境界

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-025` / `LABO-025-AC-02`。
- 入力fixture: LABOがSECURITY finding disposition/policyを変更するmutation。
- 期待oracle: policy/finding authority変更0。

### L10-LABO-025-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-025` / `LABO-025-AC-01`。
- 入力fixture: 別の許可safe summaryだけからincident outcomeを観測。
- 期待oracle: 未見incident classをrejectせず許可scope内要約のみ保持。

### L10-LABO-026-C01 — resource/runtime正常

- Parent/AC: `HELIXLABO-L2-026` / `LABO-026-AC-01`。
- 入力fixture: 許可source revisionとresource/runtime observation/environment identityを与える。
- 期待oracle: environment/status/revisionを明示して保持しresource sourceに戻れる。

### L10-LABO-026-C02 — stale/unknown

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-026` / `LABO-026-AC-02`。
- 入力fixture: (a)environment revision stale、(b)resource state unknown、(c)source contract missingを個別・併発。
- 期待oracle: healthy/currentへ補完せずsource ownerへ差戻す。

### L10-LABO-026-C03 — resource authority境界

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-026` / `LABO-026-AC-02`。
- 入力fixture: LABO outputからresource allocation/config authorityを変更しようとする。
- 期待oracle: resource authority change 0。

### L10-LABO-026-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-026` / `LABO-026-AC-01`。
- 入力fixture: 別resource classだが同じsource contract/data scopeに適合。
- 期待oracle: 許可sourceとして同一provenance oracleへ通す。

### L10-LABO-027-C01 — accepted contract正常

- Parent/AC: `HELIXLABO-L2-027` / `LABO-027-AC-01`。
- 入力fixture: 個別 connection contract/schema version, source ID, request/response trace, accepted receiptを与える。
- 期待oracle: source/schema/trace/payload一致、driftなしのobservation。

### L10-LABO-027-C02 — contract mismatch

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-027` / `LABO-027-AC-02`。
- 入力fixture: (a)schema drift、(b)trace identity欠落、(c)stale contract versionを別々に投入。
- 期待oracle: unknown/holdとCONNECT/source ownerへの戻し。

### L10-LABO-027-C03 — drift＋部分有効

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-027` / `LABO-027-AC-02`。
- 入力fixture: 契約が一部fieldを読めるが一つにschema mismatch/unknownがある。
- 期待oracle: 一致fieldのsourceは保持し、不一致をnormalizationで隠さず成功扱いしない。

### L10-LABO-027-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-027` / `LABO-027-AC-01`。
- 入力fixture: 未見の接続sourceだが個別contractとtraceを満たす。
- 期待oracle: contractに従い接続observationを作り、新しいconnector policyは発明しない。

### L10-LABO-028-C01 — OS-assigned Worker result正常

- Parent/AC: `HELIXLABO-L2-028` / `LABO-028-AC-01`。
- 入力fixture: OS assignment ID/revision、task class、Worker identity、result source/revision/status/verificationを揃えて投入。
- 期待oracle: task/assignment/sourceをtraceし、状態はobservedのまま評価済へ上げない。

### L10-LABO-028-C02 — assignment/result failure

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-028` / `LABO-028-AC-02`。
- 入力fixture: (a)assignment missing、(b)wrong task class、(c)Worker result revision staleを個別・併発。
- 期待oracle: (a)assignment missingはOSへ戻す。(b)task class不一致と(c)result revision staleはWorker result source ownerへ戻す。resultはhold/unknownとし、Workerをauthority ownerにしない。

### L10-LABO-028-C03 — evaluation promotion否定

- Parent/AC: `HELIXLABO-L2-028` / `LABO-028-AC-02`。
- 入力fixture: 単一successful Worker outputだけでeligible/qualified/evaluated claimを追加。
- 期待oracle: 観測は保持するが評価済みclaim 0。

- 失敗時戻し先: 当該Worker result source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-028-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-028` / `LABO-028-AC-01`。
- 入力fixture: 未見task classだがOS assignment/result contractは満たす。
- 期待oracle: observationとして記録し評価区分はunassessed。

### L10-LABO-029-C01 — CI/test正常

- Parent/AC: `HELIXLABO-L2-029` / `LABO-029-AC-01`。
- 入力fixture: 実際に実行された結果、対象head/revision、test scope、log/receiptを与える。
- 期待oracle: scope付き結果をsource revisionへtraceし実行statusを分離。

### L10-LABO-029-C02 — non-pass inputs

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-029` / `LABO-029-AC-02`。
- 入力fixture: (a)not run、(b)stale head、(c)interrupted/cancelled、(d)scope missingを個別投入。
- 期待oracle: いずれもpassにしない。source ownerへmissing scopeを返す。

### L10-LABO-029-C03 — 複合failure

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-029` / `LABO-029-AC-02`。
- 入力fixture: stale targetとinterrupted status、receipt mismatchを同時投入。
- 期待oracle: first causeと各missing conditionを残しsuccess0。

### L10-LABO-029-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-029` / `LABO-029-AC-01`。
- 入力fixture: 未見CI/test suiteだがHARNESS verification contractとOS execution evidenceは一致。
- 期待oracle: 新しいtest nameでもscope/revision verified observation。

### L10-LABO-030-C01 — 採択製品scope正常

- Parent/AC: `HELIXLABO-L2-030` / `LABO-030-AC-01`。
- 入力fixture: 採択済みProduct Core contract、専用connector、source/product identity、版、許可利用結果を与える。
- 期待oracle: product-specific observation identityとmeaningを保持。

### L10-LABO-030-C02 — version/source mismatch

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-030` / `LABO-030-AC-02`。
- 入力fixture: (a)source contract missing、(b)product/version mismatch、(c)different source same apparent labelを個別・併発。
- 期待oracle: hold/unknown、異なるsource identitiesを統合しない。

### L10-LABO-030-C03 — 未選択製品否定

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-030` / `LABO-030-AC-02`。
- 入力fixture: 未採択/unselected Product Core sourceをinputに見せて必須connectionとして強制する。
- 期待oracle: 未選択時にrequired dependency 0、未観測状態維持。

### L10-LABO-030-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-030` / `LABO-030-AC-01`。
- 入力fixture: 異なる採択済みproduct/source contractを明示的に選択。
- 期待oracle: 当該scopeでのみ同じprovenance ruleを適用し、version intentをsource contractに従う。

### L10-LABO-034-C01 — 内部generic evidence正常

- Parent/AC: `HELIXLABO-L2-034` / `LABO-034-AC-01`。
- 入力fixture: 複数の独立product/meaning/episode、scope evidence、counterexample、source revisionsを含むgeneric structure candidateを用意。
- 期待oracle: 1.0内部evidence candidateは支持範囲/反例/sourceを保持しBRAIN送付向けとして区別。外部取得/knowledge評価は行わない。

### L10-LABO-034-C02 — single/product-specific failure

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-034` / `LABO-034-AC-02`。
- 入力fixture: (a)single episode、(b)single product meaning、(c)unknown scopeを個別・併発。
- 期待oracle: candidateをholdしL2-009へ戻す。汎用構造として送らない。

### L10-LABO-034-C03 — version boundary

- Parent/AC: `HELIXLABO-L2-034` / `LABO-034-AC-02`。
- 入力fixture: 外部知識evaluation loop (2.0) を1.0 candidate入力へ混ぜる。
- 期待oracle: 2.0 content is excluded from this 1.0 requirement/case. Internal evidence remains possible when qualified. It must not be promoted to external loop.

### L10-LABO-034-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-034` / `LABO-034-AC-01`。
- 入力fixture: 別の複数product evidence群でsupported generic structureと適用限界が明記。
- 期待oracle: 同じ根拠規則で内部候補化し、特定例名に依存しない。

### L10-LABO-035-C01 — 評価packet正常

- Parent/AC: `HELIXLABO-L2-035` / `LABO-035-AC-01`。
- 入力fixture: 判断精度/failure corpus/counterexample/model-provider compare/FP-FN/diagnosis-review-bot materialをsource revision/scope/unassessed state付きで入力。
- 期待oracle: evaluation-material packetをINTELLIGENCE境界へ渡す。L2-052は全材料/revision到達、L2-054はBench水準接続と役割分離。

### L10-LABO-035-C02 — scope/revision failure

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-035` / `LABO-035-AC-02`。
- 入力fixture: (a)evidence source revision missing、(b)unassessed field omitted、(c)stale model/provider evaluationを個別・併発。
- 期待oracle: unknown/unassessedを保持し、source revision欠落・staleは当該source ownerへ戻す。connector contract自体の不成立だけCONNECT契約ownerへ返す。current judgmentを偽装しない。

### L10-LABO-035-C03 — learning/operation exclusion

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-035` / `LABO-035-AC-02`。
- 入力fixture: packetからmodel tuning/learning、current placement、bot operationを要求するmutation。
- 期待oracle: LABOはevaluation material only。3.0+ learning/adjustment、current judgment/placement/bot executionを1.0で行わない。

### L10-LABO-035-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-035` / `LABO-035-AC-01`。
- 入力fixture: 異なる許可evaluation material typeだが同じ accepted connector/data scope/revision ruleに適合。
- 期待oracle: unassessed state付きpacketとして受渡し、052/054 duplicate authorityを作らない。

### L10-LABO-058-C01 — 単一選択source正常

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-01`。
- 入力fixture: scope=1 operation, selected={Worker}, explicit selection reason, current source/contract revision, data-use permission, valid OS assignment/result receipt; BRAIN等はunselectedと明示。
- 期待oracle: Worker input/closureだけを必須化し、選択理由（explicit selection reason）を表示してobservationを返す。unselected BRAIN等はunobservedであり接続稼働は条件外。

### L10-LABO-058-C02 — selected-source missing/unknown

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-02`。
- 入力fixture: (a)selected Worker connector欠落、(b)permission unknown、(c)selected receipt staleを個別に投入。
- 期待oracle: 個別CASEではconnector contract不足をsource/CONNECT、permission unknownをSECURITY、receipt staleを当該receipt source ownerへ戻す。selected inputをunselectedに変えない。

### L10-LABO-058-C03 — 複数source/閉包

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。個別oracleは同親の独立CASEへtraceする。

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-02`。
- 入力fixture: selected={Worker, SECURITY summary} と両sourceのpermission/version/connector closureを与え、片方を一つずつ欠落させる。
- 期待oracle: full closure時のみ両source observation、片方欠落時は該当input不成立。他方有効sourceは個別識別。

### L10-LABO-058-C04 — 未選択／選択不明

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-02`。
- 入力fixture: (a)selection=none with permission state known, (b)selection criterion unknown, (c)no selected source but unauthorized raw bytes supplied。
- 期待oracle: (a)no source observation and no success/evaluation claim; (b)clarification; (c)unauthorized intake 0。


### L10-LABO-058-C05 — Web/WEB-OSおよび外部取得の版境界

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-01`, `LABO-058-AC-02`。
- 入力fixture: Web/WEB-OSがunselectedの呼出し、既存source contractが採択済みでWebをexplicitly selectedする呼出し、外部取得2.0を1.0へ混ぜるattemptを分けて与える。
- 期待oracle: unselected Webはrequired runtime dependencyにならず、selected時のみ既存採択contractを要求し、external 2.0 inputは1.0へ入らない。

## Stage 2b — 22親の独立反例fixture追補


### L10-LABO-017-C10 — 未完義務の単独脱落

- 対応AC: `LABO-017-AC-02`。固定親: `HELIXLABO-L2-017`。
- 独立fixture（一条件だけ変更）: 再評価candidate、current rule version、適格性材料、保証、owner結果は有効のまま、出力する未完義務一覧から既存義務1件だけを落とす。
- 期待oracle: candidate成功として受けず、未完義務と既存ownerを保持してそのownerへ不足を返す。

### L10-LABO-020-C12 — LABOによる運用切替要求

- 対応AC: `LABO-020-AC-02`。固定親: `HELIXLABO-L2-020`。
- 独立fixture（一条件だけ変更）: 復帰後result・old/new rule version・未完義務は有効なまま、LABOへfallback/運用切替の実行だけを要求する。
- 期待oracle: LABOは実行せず復帰後observationと前後版を保持する。運用実行をLABOへ割り当てない。

### L10-LABO-016-C10 — 比較可能性だけを落とす

- 対応AC: `LABO-016-AC-02`。固定親: `HELIXLABO-L2-016`。
- 独立fixture（一条件だけ変更）: 比較結果・scope・condition・counterexample・oracleを有効のまま、比較可能性fieldだけを出力から落とす。
- 期待oracle: system適格/完了とせず、比較可能性欠落をunknownとして保持しoperation候補として保留する。

### L10-LABO-021-C16 — HARNESS source identityの混合

- 対応AC: `LABO-021-AC-02`。固定親: `HELIXLABO-L2-021`。
- 独立fixture（一条件だけ変更）: HARNESS入力の個別identity/revision、許可scope、source contractとresultはそれぞれ有効のまま、異なる許可sourceの2 observationを1つのobservation identityへ統合する出力変異だけを行う。
- 期待oracle: 統合を拒み、各sourceのidentity/revisionを分けたobservationとして保持する。source正本/authorityを書き換えず、fixtureにないownerや戻し先を追加しない。

### L10-LABO-022-C16 — OS source identityの混合

- 対応AC: `LABO-022-AC-02`。固定親: `HELIXLABO-L2-022`。
- 独立fixture（一条件だけ変更）: OS入力の個別identity/revision、許可scope、source contractとresultはそれぞれ有効のまま、異なる許可sourceの2 observationを1つのobservation identityへ統合する出力変異だけを行う。
- 期待oracle: 統合を拒み、各sourceのidentity/revisionを分けたobservationとして保持する。source正本/authorityを書き換えず、fixtureにないownerや戻し先を追加しない。

### L10-LABO-023-C16 — BRAIN source identityの混合

- 対応AC: `LABO-023-AC-02`。固定親: `HELIXLABO-L2-023`。
- 独立fixture（一条件だけ変更）: BRAIN入力の個別identity/revision、許可scope、source contractとresultはそれぞれ有効のまま、異なる許可sourceの2 observationを1つのobservation identityへ統合する出力変異だけを行う。
- 期待oracle: 統合を拒み、各sourceのidentity/revisionを分けたobservationとして保持する。source正本/authorityを書き換えず、fixtureにないownerや戻し先を追加しない。

### L10-LABO-024-C16 — INTELLIGENCE source identityの混合

- 対応AC: `LABO-024-AC-02`。固定親: `HELIXLABO-L2-024`。
- 独立fixture（一条件だけ変更）: INTELLIGENCE入力の個別identity/revision、許可scope、source contractとresultはそれぞれ有効のまま、異なる許可sourceの2 observationを1つのobservation identityへ統合する出力変異だけを行う。
- 期待oracle: 統合を拒み、各sourceのidentity/revisionを分けたobservationとして保持する。source正本/authorityを書き換えず、fixtureにないownerや戻し先を追加しない。

### L10-LABO-025-C16 — SECURITY source identityの混合

- 対応AC: `LABO-025-AC-02`。固定親: `HELIXLABO-L2-025`。
- 独立fixture（一条件だけ変更）: SECURITY入力の個別identity/revision、許可scope、source contractとresultはそれぞれ有効のまま、異なる許可sourceの2 observationを1つのobservation identityへ統合する出力変異だけを行う。
- 期待oracle: 統合を拒み、各sourceのidentity/revisionを分けたobservationとして保持する。source正本/authorityを書き換えず、fixtureにないownerや戻し先を追加しない。

### L10-LABO-026-C16 — INFRASTRUCTURE source identityの混合

- 対応AC: `LABO-026-AC-02`。固定親: `HELIXLABO-L2-026`。
- 独立fixture（一条件だけ変更）: INFRASTRUCTURE入力の個別identity/revision、許可scope、source contractとresultはそれぞれ有効のまま、異なる許可sourceの2 observationを1つのobservation identityへ統合する出力変異だけを行う。
- 期待oracle: 統合を拒み、各sourceのidentity/revisionを分けたobservationとして保持する。source正本/authorityを書き換えず、fixtureにないownerや戻し先を追加しない。

### L10-LABO-027-C16 — CONNECT source identityの混合

- 対応AC: `LABO-027-AC-02`。固定親: `HELIXLABO-L2-027`。
- 独立fixture（一条件だけ変更）: CONNECT入力の個別identity/revision、許可scope、source contractとresultはそれぞれ有効のまま、異なる許可sourceの2 observationを1つのobservation identityへ統合する出力変異だけを行う。
- 期待oracle: 統合を拒み、各sourceのidentity/revisionを分けたobservationとして保持する。source正本/authorityを書き換えず、fixtureにないownerや戻し先を追加しない。

### L10-LABO-028-C16 — Worker source identityの混合

- 対応AC: `LABO-028-AC-02`。固定親: `HELIXLABO-L2-028`。
- 独立fixture（一条件だけ変更）: Worker入力の個別identity/revision、許可scope、source contractとresultはそれぞれ有効のまま、異なる許可sourceの2 observationを1つのobservation identityへ統合する出力変異だけを行う。
- 期待oracle: 統合を拒み、各sourceのidentity/revisionを分けたobservationとして保持する。source正本/authorityを書き換えず、fixtureにないownerや戻し先を追加しない。

### L10-LABO-029-C16 — CI/test source identityの混合

- 対応AC: `LABO-029-AC-02`。固定親: `HELIXLABO-L2-029`。
- 独立fixture（一条件だけ変更）: CI/test入力の個別identity/revision、許可scope、source contractとresultはそれぞれ有効のまま、異なる許可sourceの2 observationを1つのobservation identityへ統合する出力変異だけを行う。
- 期待oracle: 統合を拒み、各sourceのidentity/revisionを分けたobservationとして保持する。source正本/authorityを書き換えず、fixtureにないownerや戻し先を追加しない。

### L10-LABO-029-C17 — OS実行証拠だけが欠落

- 対応AC: `LABO-029-AC-02`。固定親: `HELIXLABO-L2-029`。
- 独立fixture（一条件だけ変更）: HARNESS verification contract・対象revision・検査scope・実行済みresult stateを有効のまま保持し、OS実行証拠だけを欠落させる。未実行状態との複合変異にしない。
- 期待oracle: passを生成しない。OS実行証拠の追加owner routeを固定L2-029から導けないためunknownを保持し、CIを起動しない。

### L10-LABO-029-C18 — HARNESS verification contractだけがstale

- 対応AC: `LABO-029-AC-02`。固定親: `HELIXLABO-L2-029`。
- 独立fixture（一条件だけ変更）: OS実行証拠・対象revision・検査scope・result stateは有効のまま、HARNESS verification contractだけを現行対象よりstaleにする。
- 期待oracle: HARNESS verification contractのstaleを現行契約へ読み替えずpassを生成しない。OS実行証拠は有効に保持し、契約不成立をunknownとして残す。追加routingを生成せずCIを起動しない。



以下の既存C01以降には複数変異を束ねたcase family/summaryがあるため、そのcase IDだけで個別negative数を主張しない。以下に追補するRoot検収追補見出しは、それぞれ記載した一つの入力条件だけを変えた独立fixtureであり、結果をIDごとに照合する。いずれも合成fixtureであり、実装・source更新・接続・assignment・判断を実行しない。


### L10-LABO-012-C05 — 根拠source identity欠落

- 対応AC: `LABO-012-AC-02`。親: `HELIXLABO-L2-012`。
- 入力fixture: 固定episodeとrelationは有効のまま、分類に使うevidence identityだけを欠落させる。期待：分類を確定せず欠落を示し、固定L2-012のevidence source責務へ戻す。

### L10-LABO-012-C06 — 相関を因果へ変換

- 対応AC: `LABO-012-AC-02`。親: `HELIXLABO-L2-012`。
- 入力fixture: 時刻・pathが近いだけの二eventに因果関係の根拠fieldだけを与えない。期待：相関候補は保持しても因果を確定しない。
- 失敗時戻し先: 訂正sourceへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-013-C05 — 一分類根拠の欠落

- 対応AC: `LABO-013-AC-02`。親: `HELIXLABO-L2-013`。
- 入力fixture: 比較結果と他の分類軸を保ち、1軸のsource evidenceだけを欠落させる。期待：欠落軸だけunknownとし、他の有効軸を保持する。不足は固定L2-013のsource evidenceへ戻し、LABOが根拠を補作しない。

### L10-LABO-013-C06 — unknownの成功化

- 対応AC: `LABO-013-AC-02`。親: `HELIXLABO-L2-013`。
- 入力fixture: 分解結果のunknownだけをsuccess相当の肯定分類へ変える。期待：変換を拒みunknownを保ち、根拠欠落を示す。
- 失敗時戻し先: source evidenceへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-014-C05 — 元目的の欠落

- 対応AC: `LABO-014-AC-02`。親: `HELIXLABO-L2-014`。
- 入力fixture: 他の元方式情報とcandidate差分を保ち、元目的だけを不明にする。期待：変換候補を確定せずL1/sourceへ目的確認を戻す。

### L10-LABO-014-C06 — 変更差分の欠落

- 対応AC: `LABO-014-AC-02`。親: `HELIXLABO-L2-014`。
- 入力fixture: 元目的・構造・条件を保ち、candidateが変更する部分だけを記載しない。期待：差分を補作せず未確定candidateにする。

- 失敗時戻し先: 既存L1/source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-014-C07 — candidateの自動昇格

- 対応AC: `LABO-014-AC-02`。親: `HELIXLABO-L2-014`。
- 入力fixture: 有効な差分candidateを与え、candidate→変更済み正本の状態遷移だけを要求する。期待：正本変更は行わず候補状態を保つ。

- 失敗時戻し先: このCASEは要求された変更・実行の拒否と正本不変を照合する。追加の戻し先は生成しない。

### L10-LABO-015-C05 — baseline版の不一致

- 対応AC: `LABO-015-AC-02`。親: `HELIXLABO-L2-015`。
- 入力fixture: 他arm条件を保ち、baseline/current armの対象版だけをcandidate armと不一致にする。期待：比較成立としない。
- 失敗時戻し先: 当該比較の評価oracle/source ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-015-C06 — oracleの欠落

- 対応AC: `LABO-015-AC-02`。親: `HELIXLABO-L2-015`。
- 入力fixture: 同一scope・対象版・条件を保ち、評価oracle identityだけを欠落させる。期待：experiment成立を主張せず当該比較の評価oracle/source ownerへ戻す。

### L10-LABO-015-C07 — scopeの不一致

- 対応AC: `LABO-015-AC-02`。親: `HELIXLABO-L2-015`。
- 入力fixture: 版・oracle・条件を保ち、1 armのscopeだけを異ならせる。期待：異なるscopeを同一比較としない。
- 失敗時戻し先: 当該比較の評価oracle/source ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-015-C08 — 条件の不一致

- 対応AC: `LABO-015-AC-02`。親: `HELIXLABO-L2-015`。
- 入力fixture: scope・版・oracleを保ち、比較条件の1項目だけを変更する。期待：条件差を隠さず比較不能を記録する。
- 失敗時戻し先: 当該比較の評価oracle/source ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-016-C05 — 反例の脱落

- 対応AC: `LABO-016-AC-02`。親: `HELIXLABO-L2-016`。
- 入力fixture: 他の比較材料を保ち、固定scope内のcounterexampleだけを出力から欠落させる。期待：評価材料不成立を記録し、反例を保持する。
- 失敗時戻し先: operation候補として保留し、不足・不一致を評価材料（出力）に記録する。LABOはsource正本を変更しない。

### L10-LABO-016-C06 — oracleと結果の不一致

- 対応AC: `LABO-016-AC-02`。親: `HELIXLABO-L2-016`。
- 入力fixture: 比較結果を保ち、oracle判定だけが結果と矛盾するfixtureにする。期待：判定不能を維持しsystem適格へ昇格しない。
- 失敗時戻し先: operation候補として保留し、不足・不一致を評価材料（出力）に記録する。LABOはsource正本を変更しない。

### L10-LABO-016-C07 — 中断状態の消去

- 対応AC: `LABO-016-AC-02`。親: `HELIXLABO-L2-016`。
- 入力fixture: 一つの比較armを中断し、その状態だけを未記録にする。期待：中断と未取得結果を記録し、比較完了としない。
- 失敗時戻し先: operation候補として保留し、不足・不一致を評価材料（出力）に記録する。LABOはsource正本を変更しない。

### L10-LABO-017-C05 — 現行rule版の欠落

- 対応AC: `LABO-017-AC-02`。親: `HELIXLABO-L2-017`。
- 入力fixture: 適格性材料と保証を保ち、現行rule revisionだけを欠落させる。期待：再評価を確定せず既存rule source ownerへ戻す。

### L10-LABO-017-C06 — 現行保証の欠落

- 対応AC: `LABO-017-AC-02`。親: `HELIXLABO-L2-017`。
- 入力fixture: 現行rule版と他材料を保ち、current guaranteeだけを欠落させる。期待：保証を推測せず未確定を維持する。
- 失敗時戻し先: 現行保証の運転ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-017-C07 — owner運転結果の欠落

- 区分: `L10-LABO-017-C03`の索引。個別fixture・negative件数・NFR分母に算入しない。

- 対応AC: `LABO-017-AC-02`。親: `HELIXLABO-L2-017`。
- 入力fixture: 現行版・保証・適格性を保ち、operation ownerの運転結果だけを未提出にする。期待：未完義務を保持しそのownerへ結果を戻す。

### L10-LABO-017-C08 — 切替の自動実行

- 対応AC: `LABO-017-AC-02`。親: `HELIXLABO-L2-017`。
- 入力fixture: 全再評価材料が揃ったcandidateについて切替実行だけを要求する。期待：LABOは候補を返すが運用切替を行わない。

- 失敗時戻し先: このCASEは要求された変更・実行の拒否と正本不変を照合する。追加の戻し先は生成しない。

### L10-LABO-018-C05 — 標本条件の欠落

- 対応AC: `LABO-018-AC-02`。親: `HELIXLABO-L2-018`。
- 入力fixture: comparison resultを保ち、標本の適用条件だけを欠落させる。期待：適用範囲を確定せずexperiment evaluationへ戻す。

### L10-LABO-018-C06 — 反例の欠落

- 対応AC: `LABO-018-AC-02`。親: `HELIXLABO-L2-018`。
- 入力fixture: scope内で観測されたcounterexampleだけをGeneralization入力から落とす。期待：根拠が揃うまでgeneralizationを確定しない。
- 失敗時戻し先: experiment evaluationへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-018-C07 — 適用範囲の過大化

- 対応AC: `LABO-018-AC-02`。親: `HELIXLABO-L2-018`。
- 入力fixture: 他のevidenceを保ち、結果を支持範囲より広いscopeへ適用する変異だけを与える。期待：証拠が支持する範囲へ限定し反例を保持する。
- 失敗時戻し先: experiment evaluationへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-019-C05 — target identityの欠落

- 対応AC: `LABO-019-AC-02`。親: `HELIXLABO-L2-019`。
- 入力fixture: 範囲付き知見と責任情報を保ち、target identityだけをunknownにする。期待：確定targetへroutingせず既存OS routing候補へ戻す。

### L10-LABO-019-C06 — responsibilityの欠落

- 対応AC: `LABO-019-AC-02`。親: `HELIXLABO-L2-019`。
- 入力fixture: target identityを保ち、責任候補だけを欠落させる。期待：担当を推測せず候補を未確定にする。
- 期待oracle: feedbackを確定せずresponsibilityをunknownのまま保持する。固定親はtarget不明時のみOS routingを規定するため、このCASEは拒否・保留を記録し、新しい戻し先を生成しない。LABOはsource正本を変更しない。

### L10-LABO-019-C07 — source evidenceの欠落

- 対応AC: `LABO-019-AC-02`。親: `HELIXLABO-L2-019`。
- 入力fixture: target/responsibilityを保ち、根拠source linkだけを欠落させる。期待：feedbackを確定せず不足を記録する。
- 失敗時戻し先: source evidenceへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-019-C08 — 複数targetの統合

- 対応AC: `LABO-019-AC-02`。親: `HELIXLABO-L2-019`。
- 入力fixture: 別identityの二targetを一つのfeedback candidateへ統合する変異だけを与える。期待：targetごとのcandidate identityを分けて保持する。

- 失敗時戻し先: このCASEは要求された変更・実行の拒否と正本不変を照合する。追加の戻し先は生成しない。

### L10-LABO-020-C05 — 旧rule版の欠落

- 対応AC: `LABO-020-AC-02`。親: `HELIXLABO-L2-020`。
- 入力fixture: 復帰後resultとnew rule revisionを保ち、pre-fallback rule revisionだけを欠落させる。期待：前後版比較を完成扱いしない。

- 失敗時戻し先: source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-020-C06 — 復帰後resultの欠落

- 対応AC: `LABO-020-AC-02`。親: `HELIXLABO-L2-020`。
- 入力fixture: 旧新rule版を保ち、post-operation resultだけを欠落させる。期待：新observationを生成したと主張しない。

- 失敗時戻し先: source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-020-C07 — 未完義務の脱落

- 対応AC: `LABO-020-AC-02`。親: `HELIXLABO-L2-020`。
- 入力fixture: 有効な復帰後resultを保ち、未完義務identityだけをobservationから落とす。期待：未完義務を保持しsource ownerへ不足を戻す。

### L10-LABO-020-C08 — source上書き

- 対応AC: `LABO-020-AC-02`。親: `HELIXLABO-L2-020`。
- 入力fixture: 復帰後観測をsource canonical stateへ書き戻す変異だけを与える。期待：書戻しを拒否し、観測とsourceを分離する。

- 失敗時戻し先: このCASEは要求された変更・実行の拒否と正本不変を照合する。追加の戻し先は生成しない。

### L10-LABO-021-C05 — source identity欠落

- 対応AC: `LABO-021-AC-02`。親: `HELIXLABO-L2-021`。
- 入力fixture: 許可済HARNESS recordからsource identityだけを欠落させる。期待：observation成立を主張せずHARNESS ownerへ戻す。

### L10-LABO-021-C06 — source revision stale

- 対応AC: `LABO-021-AC-02`。親: `HELIXLABO-L2-021`。
- 入力fixture: 他の契約fieldを保ちsource revisionだけをstaleにする。期待：current observationとして扱わずHARNESS ownerへ戻す。

### L10-LABO-021-C07 — scope不許可

- 対応AC: `LABO-021-AC-02`。親: `HELIXLABO-L2-021`。
- 入力fixture: source identity/revisionを保ちdata scopeだけを許可範囲外にする。期待：取込を拒否しHARNESS ownerへ戻す。

### L10-LABO-021-C08 — raw authorityの書戻し

- 対応AC: `LABO-021-AC-02`。親: `HELIXLABO-L2-021`。
- 入力fixture: 許可observationを与え、HARNESS raw recordへのLABO書戻しだけを要求する。期待：書戻しを拒否しsource authorityを保持する。

### L10-LABO-022-C05 — ticket identity欠落

- 対応AC: `LABO-022-AC-02`。親: `HELIXLABO-L2-022`。
- 入力fixture: 許可OS運転recordからticket identityだけを欠落させる。期待：ticket帰属を推測せずOS ownerへ戻す。

### L10-LABO-022-C06 — source contract／revision stale索引

- 区分: family/summary索引。個別fixture・negative件数・NFR分母に算入しない。
- 対応: `LABO-022-AC-02`。固定親: `HELIXLABO-L2-022`。
- 個別fixture: contractだけstaleは `L10-LABO-022-C17`、source revisionだけstaleは `L10-LABO-022-C18` を照合する。各変異のunknown保持とOS source ownerへの戻しを別々に確認する。

### L10-LABO-022-C07 — 未完状態の完了化

- 対応AC: `LABO-022-AC-02`。親: `HELIXLABO-L2-022`。
- 入力fixture: 入力sourceの未完statusだけをcompletedへ変換する。期待：元の未完/unknownを保ち成功として集約しない。
- 失敗時戻し先: OS source ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-022-C08 — OS正本の変更

- 対応AC: `LABO-022-AC-02`。親: `HELIXLABO-L2-022`。
- 入力fixture: 有効な観測に対するOS canonical state更新だけを求める。期待：LABOからOS正本を変更しない。
- 失敗時戻し先: OS source ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-023-C05 — source identity欠落

- 対応AC: `LABO-023-AC-02`。親: `HELIXLABO-L2-023`。
- 入力fixture: BRAIN利用結果からknowledge source identityだけを欠落させる。期待：observationを確定せずBRAIN ownerへ戻す。

### L10-LABO-023-C06 — source version不一致

- 対応AC: `LABO-023-AC-02`。親: `HELIXLABO-L2-023`。
- 入力fixture: 他の入力を保ちknowledge source revisionだけを現行契約と不一致にする。期待：別版で補完せずBRAINへ戻す。

### L10-LABO-023-C07 — knowledge正本の変更

- 対応AC: `LABO-023-AC-02`。親: `HELIXLABO-L2-023`。
- 入力fixture: 許可されたknowledge-use observationと同時にBRAIN正本更新だけを求める。期待：observationと正本を分け、書戻しを行わない。
- 失敗時戻し先: BRAIN knowledge ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-024-C05 — 判断revisionのstale

- 対応AC: `LABO-024-AC-02`。親: `HELIXLABO-L2-024`。
- 入力fixture: 判断結果のidentity/scopeを保ちdecision revisionだけをstaleにする。期待：current resultとして受けずINTELLIGENCE ownerへ戻す。

### L10-LABO-024-C06 — 過去評価のcurrent authority化

- 対応AC: `LABO-024-AC-02`。親: `HELIXLABO-L2-024`。
- 入力fixture: 正確な過去評価をcurrent authorityとして表示する変異だけを与える。期待：historical labelを保持し現在の判断へ昇格しない。

- 失敗時戻し先: INTELLIGENCE ownerへこのCASEの不足・不整合を返す。

### L10-LABO-024-C07 — 観測事実と判断の混同

- 対応AC: `LABO-024-AC-02`。親: `HELIXLABO-L2-024`。
- 入力fixture: source observationとdecision resultを別入力にし、出力でdecisionをfactへ置き換える変異だけを与える。期待：両者を区別して保持する。

- 失敗時戻し先: INTELLIGENCE ownerへこのCASEの不足・不整合を返す。

### L10-LABO-025-C05 — data-use scope欠落

- 対応AC: `LABO-025-AC-02`。親: `HELIXLABO-L2-025`。
- 入力fixture: 許可済みSECURITY evidenceからscope/permit referenceだけを欠落させる。期待：取込を確定せずSECURITYへ戻す。

### L10-LABO-025-C06 — restricted data混入

- 対応AC: `LABO-025-AC-02`。親: `HELIXLABO-L2-025`。
- 入力fixture: 合成fixtureのrestricted-marker fieldだけを通常observationへ含める。秘密値は使わない。期待：該当inputを拒否しSECURITY境界を保つ。

- 失敗時戻し先: SECURITY ownerへこのCASEの不足・不整合を返す。

### L10-LABO-025-C07 — authority移転

- 対応AC: `LABO-025-AC-02`。親: `HELIXLABO-L2-025`。
- 入力fixture: 許可済み安全性evidenceのsource authorityだけをLABOへ移す出力変異を与える。期待：authority transferを拒否する。

- 失敗時戻し先: SECURITY ownerへこのCASEの不足・不整合を返す。

### L10-LABO-026-C05 — resource revision stale

- 対応AC: `LABO-026-AC-02`。親: `HELIXLABO-L2-026`。
- 入力fixture: resource/runtime evidenceのrevisionだけをstaleにする。期待：currentとして扱わずINFRASTRUCTURE sourceへ戻す。

### L10-LABO-026-C06 — resource state unknownの確定化

- 対応AC: `LABO-026-AC-02`。親: `HELIXLABO-L2-026`。
- 入力fixture: resource stateのunknownだけをavailable/successへ変える。期待：unknownを保ちresource availabilityを確定しない。

- 失敗時戻し先: INFRASTRUCTURE source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-026-C07 — resource authority移転

- 対応AC: `LABO-026-AC-02`。親: `HELIXLABO-L2-026`。
- 入力fixture: 有効observationとともにresource authorityをLABOへ移す変異だけを与える。期待：source authorityをINFRASTRUCTUREに保持する。

- 失敗時戻し先: INFRASTRUCTURE source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-027-C05 — connection identity欠落

- 対応AC: `LABO-027-AC-02`。親: `HELIXLABO-L2-027`。
- 入力fixture: 他contract情報を保ち選択connection identityだけを欠落させる。期待：接続観測を確定しない。
- 失敗時戻し先: 該当CONNECT/source ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-027-C06 — schema version mismatch

- 対応AC: `LABO-027-AC-02`。親: `HELIXLABO-L2-027`。
- 入力fixture: 選択connection/source identityを保ちschema versionだけを非互換revisionにする。期待：drift/unknownを明示しCONNECTまたはsource ownerへ戻す。

### L10-LABO-027-C07 — provenance欠落

- 対応AC: `LABO-027-AC-02`。親: `HELIXLABO-L2-027`。
- 入力fixture: connection/schemaを保ちsource provenanceだけを欠落させる。期待：観測元を推測せず保留する。
- 失敗時戻し先: 該当source ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-027-C08 — drift隠蔽

- 対応AC: `LABO-027-AC-02`。親: `HELIXLABO-L2-027`。
- 入力fixture: 一つの有効recordと一つのdrifted recordを与え、drifted側だけをcurrentに含める変異を与える。期待：有効recordを保ち、drifted recordは別にunknownとする。

- 失敗時戻し先: 当該CONNECT/source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-028-C05 — assignment identity欠落

- 対応AC: `LABO-028-AC-02`。親: `HELIXLABO-L2-028`。
- 入力fixture: Worker resultを保ちOS assignment identityだけを欠落させる。期待：割当済み作業と扱わずOSへ戻す。

### L10-LABO-028-C06 — task class不一致

- 対応AC: `LABO-028-AC-02`。親: `HELIXLABO-L2-028`。
- 入力fixture: assignmentとresultを保ちtask classだけを不一致にする。期待：異なるclassの結果を同一評価へ結合しない。

- 失敗時戻し先: 当該Worker result source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-028-C07 — Worker result revision stale

- 対応AC: `LABO-028-AC-02`。親: `HELIXLABO-L2-028`。
- 入力fixture: assignmentを保ちWorker result contract revisionだけをstaleにする。期待：受領を保留しresult source ownerへ戻す。

### L10-LABO-028-C08 — 別ticket/experimentの混在

- 対応AC: `LABO-028-AC-02`。親: `HELIXLABO-L2-028`。
- 入力fixture: ticket identityだけ異なる二resultを一つのexperimentへ結合する変異だけを与える。期待：別ticket/experimentを分離する。

- 失敗時戻し先: 当該Worker result source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-029-C05 — 未実行をpass化

- 対応AC: `LABO-029-AC-02`。親: `HELIXLABO-L2-029`。
- 入力fixture: testがnot-runの状態だけをpassへ変換する。期待：not-runを保持しpassを生成しない。
- 失敗時戻し先: 対象revision/inspection scopeの欠落は固定L2-029に従ってsource ownerへ戻す。未実行やstaleの検証結果から戻し先を新設しない。

### L10-LABO-029-C06 — target revision stale

- 対応AC: `LABO-029-AC-02`。親: `HELIXLABO-L2-029`。
- 入力fixture: 実行済resultを保ち対象revisionだけを現行対象と不一致にする。期待：現行対象の合格として扱わない。
- 失敗時戻し先: 対象revision/inspection scopeの欠落は固定L2-029に従ってsource ownerへ戻す。未実行やstaleの検証結果から戻し先を新設しない。

### L10-LABO-029-C07 — inspection scope欠落

- 対応AC: `LABO-029-AC-02`。親: `HELIXLABO-L2-029`。
- 入力fixture: test resultとtarget revisionを保ちinspection scopeだけを欠落させる。期待：範囲不明の合格を主張せずsource ownerへ戻す。

### L10-LABO-029-C08 — 中断をpass化

- 区分: `L10-LABO-029-C09`の索引。個別fixture・negative件数・NFR分母に算入しない。

- 対応AC: `LABO-029-AC-02`。親: `HELIXLABO-L2-029`。
- 入力fixture: 実行途中のcancelled/interrupted statusだけをpassへ変換する。期待：中断状態を保持しpassを生成しない。
- 失敗時戻し先: 対象revision/inspection scopeの欠落は固定L2-029に従ってsource ownerへ戻す。未実行やstaleの検証結果から戻し先を新設しない。

### L10-LABO-030-C05 — product identity欠落

- 対応AC: `LABO-030-AC-02`。親: `HELIXLABO-L2-030`。
- 入力fixture: 許可Product Core resultからproduct identityだけを欠落させる。期待：意味/帰属を推測せず当該利用を拒否し、固定親にない返却先を新設しない。

### L10-LABO-030-C06 — source revision不一致

- 対応AC: `LABO-030-AC-02`。親: `HELIXLABO-L2-030`。
- 入力fixture: product/source identityを保ちsource revisionだけをstaleにする。期待：current product observationとして扱わない。
- 失敗時戻し先: 該当Product Core source ownerへ不足・不一致を返す。LABOはsource正本を変更しない。

### L10-LABO-030-C07 — 別product source統合

- 対応AC: `LABO-030-AC-02`。親: `HELIXLABO-L2-030`。
- 入力fixture: meaningが異なる二product sourceを一identityへ統合する変異だけを与える。期待：統合を拒否し、各source identityと別々のobservationを保つ。固定親にない返却先を新設しない。


### L10-LABO-030-C08 — product authority移転

- 対応AC: `LABO-030-AC-02`。親: `HELIXLABO-L2-030`。
- 入力fixture: product resultを受け、Product Core meaning/authorityを書き換える出力変異だけを与える。期待：書換えを拒否しsource authority/meaningを保持する。固定親にない返却先を新設しない。


### L10-LABO-034-C05 — 単一episodeのgeneric化

- 対応AC: `LABO-034-AC-02`。親: `HELIXLABO-L2-034`。
- 入力fixture: 一episodeだけが支持するpatternをgeneric structureと主張する変異を与える。期待：BRAIN向けgeneric candidateにせずL2-009へ戻す。

### L10-LABO-034-C06 — product固有meaning混入

- 対応AC: `LABO-034-AC-02`。親: `HELIXLABO-L2-034`。
- 入力fixture: 他のgeneric evidenceを保ち、product固有meaningだけをgeneric candidateへ含める。期待：generic送信を拒否し元のproduct固有meaningを保持し、一般化材料をL2-009へ戻す。

### L10-LABO-034-C07 — scope支持不足

- 対応AC: `LABO-034-AC-02`。親: `HELIXLABO-L2-034`。
- 入力fixture: 複数source identityはあるが一つのmeaning/product scopeしか支持しない入力を与える。期待：支援されるscopeだけを記録し一般化せずL2-009へ戻す。

### L10-LABO-035-C05 — unassessed marker欠落

- 対応AC: `LABO-035-AC-02`。親: `HELIXLABO-L2-035`。
- 入力fixture: 同じ評価packetのunassessed stateだけを欠落させる。期待：評価済みと扱わず元状態を保持する。

- 失敗時戻し先: 当該source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-035-C06 — 評価payload field欠落

- 対応AC: `LABO-035-AC-02`。親: `HELIXLABO-L2-035`。
- 入力fixture: 当該packetが含むと宣言したFP/FNまたはcounterexample fieldのうち一fieldだけを欠落させる。期待：宣言済みpacket fieldの欠落をunknownのまま明示し、列挙項目すべてを毎回必須化しない。

- 失敗時戻し先: 当該source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-035-C07 — 学習許可への変換

- 対応AC: `LABO-035-AC-02`。親: `HELIXLABO-L2-035`。
- 入力fixture: 完全な評価packetの受渡しを学習/調整許可へ変換する変異だけを与える。期待：材料受渡しと学習権限を分離し許可を生成しない。

### L10-LABO-035-C08 — LABOによるcurrent判断実行

- 対応AC: `LABO-035-AC-02`。親: `HELIXLABO-L2-035`。
- 入力fixture: INTELLIGENCE用材料からcurrent judgementをLABOが実行する要求だけを加える。期待：判断を実行せずINTELLIGENCE境界へ残す。

### L10-LABO-058-C06 — 選択条件unknown

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: source identity/revisionはあるが今回の選択条件だけをunknownにする。期待：L2-058どおり要求された呼出しscope ownerへ条件確認を返し、全source closureを一律必須化しない。

### L10-LABO-058-C07 — 選択source closure欠落

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: 選択済みsourceはWorkerのみと明示し、そのsource receiptだけを欠落させる。期待：selected-missingとして当該入力不成立とし、L2-058に従い当該source ownerへ不足receiptを戻す。unselected sourceは未観測のまま。

### L10-LABO-058-C08 — 未選択sourceを必須化

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: Worker-only選択を保ち、BRAIN connector欠落だけを理由に全呼出しを拒む変異を与える。期待：不要な未選択依存でWorker入力を拒まない。

### L10-LABO-058-C09 — 無選択と未許可payload

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: selection=noneかつ許可状態既知の入力へ未許可raw bytesだけを追加する。期待：取込/観測成功0、無選択は許可を作らない。

### L10-LABO-058-C10 — Web/WEB-OS未採択の混入

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: 1.0でWeb/WEB-OS contract未採択・未選択とし、当該connector不在だけを変異する。期待：LABO 1.0全体を不成立にせず、その未選択入力を未観測とする。

### L10-LABO-058-C11 — reference-onlyを実行依存化

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: 全source list/reference資料だけを実行時必須connectorへ変える。期待：参照情報と当該呼出しの実行依存を分ける。

## Root検収追補 — 親ごとの単一変異fixture（未実行）

各見出しが独立した一fixtureである。summary/C02/C03やこの索引を複数の単独negativeとして数えない。

### L10-LABO-012-C07 — unknownをsuccessへ変換

- 対応AC: `LABO-012-AC-02`。固定親: `HELIXLABO-L2-012`。
- 独立fixture（変更は一条件だけ）: 同一のepisode/source/evidence/relationを保ち、観測値のstatus一つだけをunknownからsuccess相当へ変える。
- 期待oracle: success化を拒みunknownとsource stateを保持。欠落/unknown根拠は固定L2-012のsource/evidence責務へ戻す。

### L10-LABO-013-C07 — 良かった点の分類軸欠落

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: 他の分類軸・evidenceを有効に保ち、「良かった点」の分類field一つだけを欠落させる。
- 期待oracle: 当該分類だけ未確定で保持し他軸を残す。source evidenceの不足を理由付きで元sourceへ戻す。

### L10-LABO-013-C08 — 悪かった点の意味を反転

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: 分類field・sourceを保ち、「悪かった点」の意味値一つだけを反転させる。
- 期待oracle: 根拠と一致しない意味分類を拒みunknown/矛盾として元sourceへ戻す。

### L10-LABO-013-C09 — 条件依存分類から条件を欠落

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: 条件付き評価の条件field一つだけを欠落させ、他分類とevidenceは維持する。
- 期待oracle: 無条件の分類へ一般化せず条件依存をunknownに保ちsource evidenceへ戻す。

### L10-LABO-013-C10 — 汎用候補から根拠を欠落

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: 汎用候補の分類根拠identity一つだけを欠落させる。
- 期待oracle: 汎用性を確定せず当該軸だけunknownで保持してsource evidenceへ戻す。

### L10-LABO-013-C11 — product固有分類を汎用へ置換

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: 有効なproduct固有分類を汎用へ置き換える一変数だけを行う。
- 期待oracle: product固有meaningを保持し、根拠のない汎用化を拒む。

- 失敗時戻し先: 元source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-013-C12 — system化候補とoperation候補を混同

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: 他の分類を固定し、system化候補field一つをoperation候補へ入れ替える。
- 期待oracle: 分類軸の混同を拒み、各候補を別軸・別根拠で維持する。

- 失敗時戻し先: 元source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-013-C13 — operationで補う候補の欠落

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: operationで補う候補だけを出力から落とし、入力evidenceは維持する。
- 期待oracle: 該当軸の欠落を検出し、system候補へ吸収せず元sourceへ戻す。

### L10-LABO-013-C14 — 不明を不要へ読み替え

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: classification stateのunknownだけをunnecessaryへ変える。
- 期待oracle: unknownとunnecessaryを別状態で保持し、未確定を不要にしない。

- 失敗時戻し先: 元source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-013-C15 — 不要を採用へ読み替え

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: 明示されたunnecessaryだけを採用/positiveへ変える。
- 期待oracle: unnecessaryを保持し、二択採否へ丸めない。

- 失敗時戻し先: 元source ownerへこのCASEの不足・不整合を返す。

### L10-LABO-013-C16 — 反証の脱落

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: 他の分類とevidenceを維持し、反証evidence一つだけをdecomposition outputから落とす。
- 期待oracle: 反証の存在を保持し、分類の根拠・条件を確定しない。反証を落とした分類結果は不成立としてsource evidenceへ戻す。

### L10-LABO-014-C08 — 目的を逆転

- 対応AC: `LABO-014-AC-02`。固定親: `HELIXLABO-L2-014`。
- 独立fixture（変更は一条件だけ）: 元方式のpurpose fieldだけを反対の目的へ変更し、structure/condition/evidenceを固定する。purpose変更を差分として明示せず、元意味を保持したと主張する。
- 期待oracle: 隠された目的変更を意味保持として確定せず、意味確認を既存L1/sourceへ戻す。

### L10-LABO-014-C09 — constraintを除去

- 対応AC: `LABO-014-AC-02`。固定親: `HELIXLABO-L2-014`。
- 独立fixture（変更は一条件だけ）: 有効な元方式のconstraint一つだけをcandidateから除去し、その変更を差分として明示せず意味保持と主張する。
- 期待oracle: 制約除去を保持意味として扱わず差分未確定でL1/sourceへ戻す。

### L10-LABO-015-C09 — target revision欠落

- 対応AC: `LABO-015-AC-02`。固定親: `HELIXLABO-L2-015`。
- 独立fixture（変更は一条件だけ）: baseline/current、candidate、hybridの他条件を維持しtarget versionだけを欠落させる。
- 期待oracle: 3-arm比較を成立扱いせずtarget版不足を保持し、固定L2-015に基づく当該比較の評価oracle/source ownerへ戻す。

### L10-LABO-016-C08 — 有効なcounterexampleの正常保持

- 対応AC: `LABO-016-AC-01`。固定親: `HELIXLABO-L2-016`。
- 独立fixture（変更は一条件だけ）: 比較可能なrunに親が定めるcounterexampleが存在し、oracle/resultと同一experimentに結び付く正常入力を与える。
- 期待oracle: counterexampleを評価材料へ保持し、比較結果に反する証拠として隠さず、system成立へ自動昇格しない。

### L10-LABO-018-C08 — 比較結果revision stale

- 対応AC: `LABO-018-AC-02`。固定親: `HELIXLABO-L2-018`。
- 独立fixture（変更は一条件だけ）: sample condition・counterexample・scopeを保ち、comparison result revisionだけをtarget/current revisionより古くする。
- 期待oracle: stale resultで適用範囲を支持せずunknown/未確定を保持し実験評価へ戻す。

### L10-LABO-019-C09 — target responsibility owner変更

- 対応AC: `LABO-019-AC-02`。固定親: `HELIXLABO-L2-019`。
- 独立fixture（変更は一条件だけ）: target identity/scope/evidenceを保ち、responsibility owner fieldだけをtarget evidenceと不整合なowner指定へ差し替える。
- 期待oracle: target identityがknownである本CASEでは誤ったowner routingを拒否しunknown/holdを保持する。OS routingは固定L2-019が指定するtarget unknown条件に限る。存在しないownerを新設しない。

### L10-LABO-020-C09 — new rule version欠落

- 対応AC: `LABO-020-AC-02`。固定親: `HELIXLABO-L2-020`。
- 独立fixture（変更は一条件だけ）: operation後resultとold rule versionを保ち、new rule versionだけを欠落させる。
- 期待oracle: before/afterを推測せず未完観測としてsource ownerへ戻す。

### L10-LABO-020-C10 — new rule version stale

- 対応AC: `LABO-020-AC-02`。固定親: `HELIXLABO-L2-020`。
- 独立fixture（変更は一条件だけ）: operation resultとrule identityを保ち、new rule versionだけを現在対象よりstaleにする。
- 期待oracle: stale版をcurrentとせず差分/未完義務を保ち、元source ownerへ戻す。

### L10-LABO-021-C09 — HARNESS source contract欠落

- 対応AC: `LABO-021-AC-02`。固定親: `HELIXLABO-L2-021`。
- 独立fixture（変更は一条件だけ）: 有効なobservation以外を保ち、選択HARNESS inputのsource contract envelope一つだけを欠落させる。
- 期待oracle: observation成立を拒み欠落をunknown/contract defectとしてHARNESS ownerへ戻す。

### L10-LABO-021-C10 — HARNESS source authority移管

- 対応AC: `LABO-021-AC-02`。固定親: `HELIXLABO-L2-021`。
- 独立fixture（変更は一条件だけ）: 選択source contractのidentity/version/scopeは保ち、authority owner fieldだけをLABOへ移す。
- 期待oracle: authority移管を拒み元HARNESS authorityを保持する。

- 失敗時戻し先: このCASEは要求された変更・実行の拒否と正本不変を照合する。追加の戻し先は生成しない。

### L10-LABO-022-C09 — OS assignment欠落

- 対応AC: `LABO-022-AC-02`。固定親: `HELIXLABO-L2-022`。
- 独立fixture（変更は一条件だけ）: ticket/source identityとresultを保ち、対応OS assignment referenceだけを欠落させる。
- 期待oracle: assignment/result対応を確定せずOS assignment ownerへ不足を戻す。

### L10-LABO-022-C10 — receipt stale

- 対応AC: `LABO-022-AC-02`。固定親: `HELIXLABO-L2-022`。
- 独立fixture（変更は一条件だけ）: ticket/result/assignmentを保ち、receipt revisionだけを新しいassignmentより古くする。
- 期待oracle: stale receiptを新assignmentの証拠にせずOS ticket/receipt ownerへ戻す。

### L10-LABO-022-C11 — unknown assignmentを完了化

- 対応AC: `LABO-022-AC-02`。固定親: `HELIXLABO-L2-022`。
- 独立fixture（変更は一条件だけ）: assignment statusだけをunknownにし、他のticket fieldとreceiptは固定する。
- 期待oracle: unknownをcompleteへ変えず未完としてOSへ戻す。

### L10-LABO-023-C08 — permission unknown

- 対応AC: `LABO-023-AC-02`。固定親: `HELIXLABO-L2-023`。
- 独立fixture（変更は一条件だけ）: BRAIN asset identity/revisionを保ち、許可状態だけをunknownにする。
- 期待oracle: knowledge useを成功/許可扱いせずSECURITY既存permission ownerへ戻す（L2-058:413の許可不足時source owner/SECURITY境界に基づく）。

### L10-LABO-023-C09 — scope unknown

- 対応AC: `LABO-023-AC-02`。固定親: `HELIXLABO-L2-023`。
- 独立fixture（変更は一条件だけ）: BRAIN source identity/revision/permissionを保ち、当該sourceが宣言する利用scopeだけをunknownにする。呼出し側のsource選択/scopeは既知として固定する。
- 期待oracle: source利用scopeを推測せずobservationを確定しない。当該BRAIN source contract ownerへ不足を戻す。呼出し側のsource選択/scope自体がunknownの場合は、このfixtureと混同せずL2-058の既存call-scope ownerへ戻す。

### L10-LABO-023-C10 — BRAIN canonical write移管

- 区分: `L10-LABO-023-C07`の索引。個別fixture・negative件数・NFR分母に算入しない。

- 対応AC: `LABO-023-AC-02`。固定親: `HELIXLABO-L2-023`。
- 独立fixture（変更は一条件だけ）: 有効なBRAIN source/resultを保ち、出力先だけをBRAIN canonical writeへ変更する。
- 期待oracle: canonical writeを拒否し、sourceを不変に保ちLABO observationだけを記録対象とする。

### L10-LABO-024-C08 — target revision差異

- 対応AC: `LABO-024-AC-02`。固定親: `HELIXLABO-L2-024`。
- 独立fixture（変更は一条件だけ）: 判断/observationの他fieldを保ち、target revisionだけを現対象版と異ならせる。
- 期待oracle: 異版resultを現行判断へ結合せずINTELLIGENCE source ownerへ戻す。

### L10-LABO-024-C09 — revision欠落を成功化

- 対応AC: `LABO-024-AC-02`。固定親: `HELIXLABO-L2-024`。
- 独立fixture（変更は一条件だけ）: 許可された判断sourceからrevision field一つだけを欠落させる。
- 期待oracle: missing revisionをcurrent successとせずunknownで保持してINTELLIGENCEへ戻す。

### L10-LABO-025-C08 — SECURITY source revision stale

- 対応AC: `LABO-025-AC-02`。固定親: `HELIXLABO-L2-025`。
- 独立fixture（変更は一条件だけ）: permission/scope/evidenceを保ち、SECURITY source revisionだけを現行より古くする。
- 期待oracle: stale許可をcurrentとせずrestricted evidenceを展開せずSECURITYへ戻す。

### L10-LABO-025-C09 — treatment policy write

- 対応AC: `LABO-025-AC-02`。固定親: `HELIXLABO-L2-025`。
- 独立fixture（変更は一条件だけ）: 他のobservationは有効なまま、LABOがSECURITY treatment policyを更新する一動作だけを試みる。
- 期待oracle: policy writeを拒み元SECURITY authorityを不変に保つ。拒否のみを記録し、このCASEから新しい戻し先を生成しない。

### L10-LABO-026-C08 — INFRA resource contract欠落

- 対応AC: `LABO-026-AC-02`。固定親: `HELIXLABO-L2-026`。
- 独立fixture（変更は一条件だけ）: resource identity/stateを保ち、選択resource contract envelopeだけを欠落させる。
- 期待oracle: current resource observationを確定せずINFRASTRUCTURE resource/contract ownerへ戻す。

### L10-LABO-026-C09 — resource config直接write

- 対応AC: `LABO-026-AC-02`。固定親: `HELIXLABO-L2-026`。
- 独立fixture（変更は一条件だけ）: 正常なresource/runtime observationで、LABO側からresource configurationへ書き込む試行だけを加える。
- 期待oracle: 書込みを拒否しINFRASTRUCTURE authority/configurationを不変にする。拒否のみを記録し、このCASEから新しい戻し先を生成しない。

### L10-LABO-027-C09 — trace ID欠落

- 対応AC: `LABO-027-AC-02`。固定親: `HELIXLABO-L2-027`。
- 独立fixture（変更は一条件だけ）: 選択CONNECT connection/schema/provenanceを保ちtrace IDだけを欠落させる。
- 期待oracle: 受領をtraceable successとして扱わずCONNECT/source contract ownerへ不足を戻す。

### L10-LABO-027-C10 — connection contract stale

- 対応AC: `LABO-027-AC-02`。固定親: `HELIXLABO-L2-027`。
- 独立fixture（変更は一条件だけ）: connection identity/schema/provenance/traceは保ち、contract revisionだけを選択版よりstaleにする。
- 期待oracle: stale contractを有効とせずunknown/不成立をCONNECT contract ownerへ戻す。

### L10-LABO-027-C11 — 全sourceの暗黙共有

- 対応AC: `LABO-027-AC-02`。固定親: `HELIXLABO-L2-027`。
- 独立fixture（変更は一条件だけ）: 有効な単一source connectionを保ち、未選択sourceにも同一connector契約が適用済みとするclaimだけを追加する。
- 期待oracle: 選択scope外のsource共有を推定せず、各source contractを別々に扱う。

- 失敗時戻し先: 当該CONNECT connector ownerへこのCASEの不足・不整合を返す。

### L10-LABO-028-C09 — L2-006 experiment/target identity正常

- 対応AC: `LABO-028-AC-01`。固定親: `HELIXLABO-L2-028`。
- 独立fixture（変更は一条件だけ）: 有効なOS assignment/result receiptと、L2-006の同一experiment identity・同一target versionを持つ正常結果を与える。
- 期待oracle: resultをそのexperimentとtarget versionにだけ束縛して記録する。Workerは機構owner/authority ownerにならず、LABOは実行・割当しない。

### L10-LABO-028-C10 — experiment identity不一致

- 対応AC: `LABO-028-AC-02`。固定親: `HELIXLABO-L2-028`。
- 独立fixture（変更は一条件だけ）: 上記正常fixtureのresultのexperiment identityだけを別experimentにする。
- 期待oracle: resultを割当と結合せずunknown/不成立で保持し、experiment identityが誤っている当該Worker result source ownerへ訂正を戻す。正常なOS assignment/receiptは保持し、receipt不備とは混同しない。

### L10-LABO-028-C11 — target version不一致

- 対応AC: `LABO-028-AC-02`。固定親: `HELIXLABO-L2-028`。
- 独立fixture（変更は一条件だけ）: experiment identityは一致したまま、result target versionだけを別版にする。
- 期待oracle: 版を補正/流用せずresult source ownerへ戻す。

### L10-LABO-028-C12 — receiptとresult sourceの戻し先分離

- 対応AC: `LABO-028-AC-02`。固定親: `HELIXLABO-L2-028`。
- 独立fixture（変更は一条件だけ）: receipt identityは有効だがresult source referenceだけを欠落させる。
- 期待oracle: 有効なreceiptを保持し、result source欠落だけを当該result source ownerへ戻す。receipt状態は変更しない。

### L10-LABO-029-C09 — 中断のpass化拒否

- 対応AC: `LABO-029-AC-02`。固定親: `HELIXLABO-L2-029`。
- 独立fixture（変更は一条件だけ）: target/scope/source revisionを維持し、実行state一つをcancelledへ変える。
- 期待oracle: 中断された結果をpassにせず元sourceの実行stateとして保持する。cancelledとinterruptedの追加分類規則は要求しない。固定L2-029に明記のないHARNESS routeは作らず、拒否・unknownを保持する。

### L10-LABO-030-C09 — source contract欠落

- 対応AC: `LABO-030-AC-02`。固定親: `HELIXLABO-L2-030`。
- 独立fixture（変更は一条件だけ）: 採択済product identity/sourceは保ち、source contractだけを欠落させる。
- 期待oracle: product observationを確定せずProduct Core/source contract ownerへ戻す。

### L10-LABO-030-C10 — unadoptedとunselectedを区別

- 対応AC: `LABO-030-AC-02`。固定親: `HELIXLABO-L2-030`。
- 独立fixture（変更は一条件だけ）: 選択sourceは有効だが、別のunadopted sourceだけを選択済みとして加える。
- 期待oracle: unadopted inputを拒み、正常なunselected sourceは未観測のまま残す。拒否のみを記録し、このCASEから新しい戻し先を生成しない。

### L10-LABO-034-C08 — scope unknown

- 対応AC: `LABO-034-AC-02`。固定親: `HELIXLABO-L2-034`。
- 独立fixture（変更は一条件だけ）: generic evidence/source identitiesを保ち、適用scope fieldだけをunknownにする。
- 期待oracle: generic applicabilityを確定せずscopeをL2-009へ戻す。

### L10-LABO-035-C09 — source version欠落

- 対応AC: `LABO-035-AC-02`。固定親: `HELIXLABO-L2-035`。
- 独立fixture（変更は一条件だけ）: 評価payload/evidenceは保ち、selected source versionだけを欠落させる。
- 期待oracle: version不明の評価をassessedにせず、欠落した版情報の当該source ownerへ戻す。sourceとINTELLIGENCE receiptの同一revision到達/packet境界の不一致はL2-052の別条件として扱う。

### L10-LABO-035-C10 — source version stale

- 対応AC: `LABO-035-AC-02`。固定親: `HELIXLABO-L2-035`。
- 独立fixture（変更は一条件だけ）: 評価内容を保ち、selected source revisionだけをstaleにする。
- 期待oracle: stale evidenceで現在の評価を確定せず、staleな材料を出した当該source ownerへ訂正を戻す。INTELLIGENCE receiptとの同一revision到達不一致はL2-052の別条件として扱う。

### L10-LABO-035-C11 — 一般評価材料とBench専用接続の正常分離

- 対応AC: `LABO-035-AC-01`。固定親: `HELIXLABO-L2-035`、固定L11:86（035評価材料境界）および94（054 Bench専用接続）。
- 正常fixture: 035/052の一般評価packetと、055が生成して054が渡すBench水準packetを別identity・契約として与える。それぞれsource revision・scope・根拠・未評価状態が揃う。
- 期待oracle: 一般評価材料は035/052で、Bench水準は055/054の別契約で保持する。035 payloadへBench水準を重複定義せず、転送を学習・配置・bot実行の許可にしない。

### L10-LABO-035-C12 — unassessedをassessed成功化

- 対応AC: `LABO-035-AC-02`。固定親: `HELIXLABO-L2-035`。
- 独立fixture（変更は一条件だけ）: 評価statusだけをunassessedのままにし、他のevidence fieldは有効にする。
- 期待oracle: unassessedを成功/適性へ変えず、その状態のまま評価材料としてINTELLIGENCE境界へ渡す。欠落・不一致などsource defectがない限り、未評価だけを理由にsourceへ差戻ししない。

### L10-LABO-035-C13 — LABOによる配置実行

- 対応AC: `LABO-035-AC-02`。固定親: `HELIXLABO-L2-035`。
- 独立fixture（変更は一条件だけ）: 評価payloadを保ち、LABO自身がmodel placementを実行する要求だけを加える。
- 期待oracle: 配置を実行せずINTELLIGENCE境界に残す。

### L10-LABO-035-C14 — bot execution生成

- 対応AC: `LABO-035-AC-02`。固定親: `HELIXLABO-L2-035`。
- 独立fixture（変更は一条件だけ）: 評価payloadを保ち、LABOがbot training/operationを実行したとするclaimだけを追加する。
- 期待oracle: bot実行を許可/実績として生成せず範囲外として保持する。

### L10-LABO-058-C12 — 複数selected source正常閉包

- 対応AC: `LABO-058-AC-01`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: WorkerとOSの複数選択sourceそれぞれに、source/operation/scope/contract version/permission/receiptと安全依存の有効なclosureを与える。
- 期待oracle: 各選択sourceを個別に照合し、全部の必要closureを結ぶ。別source/未選択sourceを暗黙追加しない。

### L10-LABO-058-C13 — 複数selected source closure欠落

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 上記正常fixtureからOS selected sourceのreceipt一つだけを欠落させる。
- 期待oracle: OS sourceのreceipt不足を保持し全入力成功にせず、L2-022の既存OS assignment/receipt ownerへ不足を戻す。ほかの有効な選択sourceのreceiptで補完しない。

### L10-LABO-058-C14 — source変更後に旧receipt流用

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 有効receipt後、selected source identityだけを変更し旧receiptを使い続ける。
- 期待oracle: 明示された新sourceについて依存closureを再照合し、旧receiptを流用しない。不足するsource/connection contractは新sourceまたはCONNECTの既存ownerへ、permission/classificationはSECURITYへ戻す。選択sourceまたは呼出しscope自体がunknownの場合に限り、既存call-scope ownerへ確認を戻す。

### L10-LABO-058-C15 — operation変更後に旧receipt流用

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: source identityを保ち、selected operationだけをreceipt後に変更する。
- 期待oracle: operation条件で再closureし旧receiptを流用しない。owner戻し先は固定L2で特定されないため拒否のみとする。

### L10-LABO-058-C16 — scope変更後に旧receipt流用

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: source/operationを保ち、selected scopeだけをreceipt後に変更する。
- 期待oracle: scope条件で再closureし旧receiptを流用しない。scope変更による既存receipt不一致は固定L2:413に従い当該選択source owner／SECURITYへ返す。

### L10-LABO-058-C17 — contract version変更後に旧receipt流用

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: source/operation/scopeを保ち、contract versionだけをreceipt後に更新する。
- 期待oracle: version条件で再closureし旧receiptを流用しない。source contract欠落/不一致は元source/CONNECT ownerへ戻す。

### L10-LABO-058-C18 — 安全依存をreference-only化

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: selected sourceの他のcontract/receiptを保ち、安全依存一つだけをreference-onlyと分類する。
- 期待oracle: 安全依存closureを必須として扱い、reference-only区分による省略を拒む。permission/classificationはSECURITY ownerへ戻す。

### L10-LABO-058-C19 — unselected sourceを観測成功化

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 有効なWorker-only callで未選択OS source一つだけをobserved-successとして出力する。
- 期待oracle: 未選択sourceをnot_observedのまま保ち、選択sourceへ混ぜない。

### L10-LABO-058-C20 — 単一call passを全source 1.0完了化

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 一つの選択sourceでcall passの結果だけを与え、all-source 1.0 completion claimを加える。
- 期待oracle: call successと対応範囲のみ保持し、全source対応完了を生成しない。

### L10-LABO-058-C21 — 外部2.0を1.0へ混入

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: Web未選択の1.0 callにexternal acquisition 2.0 payloadだけを加える。
- 期待oracle: 2.0 inputを1.0対象へ含めず、未選択Webを未観測に保つ。


### L10-LABO-058-C22 — 選択source permission unknown

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 選択source identity/revision/scope/receiptを保ち、permission stateだけをunknownにする。
- 期待oracle: selected inputの成立を許可せず、権限不確実性をSECURITY permission ownerへ戻す。未選択sourceは未観測のまま保持する。

### L10-LABO-058-C23 — 選択source receipt stale

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 選択source/operation/scope/contractを保ち、receipt revisionだけをsourceの現行revisionより古くする。
- 期待oracle: stale receiptを有効closureとして扱わず、fixtureでstaleとしたreceiptの当該source ownerへ再照合を戻す。connection contract revision自体がstaleの場合だけCONNECT ownerへ戻す。

### L10-LABO-058-C24 — source追加後にclosure再確認

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: receipt済みの選択source集合にsourceを一つだけ追加し、追加sourceのpermission/receiptは有効なまま、connection contractだけを欠落させる。
- 期待oracle: 明示追加されたsourceを未観測/未完として示し、そのsourceのconnection/contract不足は当該sourceまたはCONNECTの既存ownerへ、このfixtureのpermission/receiptは維持しconnection closureだけを再照合する。追加sourceの選択自体がunknownの場合に限り、既存call-scope ownerへ確認する。

### L10-LABO-058-C25 — source削除後の旧receipt再利用

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: receipt済み選択source集合からsourceを一つだけ除去し、旧集合のreceiptを新集合へ流用する。
- 期待oracle: 明示削除後の新source集合でclosureを再照合し、除外sourceの旧receiptを新集合へ流用しない。選択集合が不明な場合だけ既存call-scope ownerへ確認し、明示された集合のreceipt不足は該当source/CONNECT、permission/classification不足はSECURITYへ戻す。

### L10-LABO-012-C08 — 上流episodeへの書戻し

- 対応AC: `LABO-012-AC-02`。固定親: `HELIXLABO-L2-012`。
- 独立fixture（変更は一条件だけ）: 有効episodeのLABO分類出力から上流episode canonicalへの書戻し試行だけを加える。
- 期待oracle: 書戻しを拒みepisode/relation authorityを維持し訂正sourceへ戻す。

### L10-LABO-012-C09 — 反証脱落

- 対応AC: `LABO-012-AC-02`。固定親: `HELIXLABO-L2-012`。
- 独立fixture（変更は一条件だけ）: 元episodeの根拠とrevisionを保ち反証evidenceだけを出力から落とす。
- 期待oracle: 反証を保持し分類成立にせず訂正sourceへ戻す。

### L10-LABO-013-C17 — 元source meaning上書き

- 対応AC: `LABO-013-AC-02`。固定親: `HELIXLABO-L2-013`。
- 独立fixture（変更は一条件だけ）: 有効な分類比較の出力から元source meaningへの上書き試行だけを加える。
- 期待oracle: source meaningを不変にしsource evidenceへ戻す。

### L10-LABO-014-C10 — 元適用条件unknown

- 対応AC: `LABO-014-AC-02`。固定親: `HELIXLABO-L2-014`。
- 独立fixture（変更は一条件だけ）: 元purpose/structure/evidenceを保ち元方式の適用条件だけをunknownにする。
- 期待oracle: 変換候補を確定せずL1/sourceへ元条件の確認を戻す。

### L10-LABO-015-C10 — LABOによるWorker割当起動

- 対応AC: `LABO-015-AC-02`。固定親: `HELIXLABO-L2-015`。
- 独立fixture（変更は一条件だけ）: 正常比較条件にLABO自身がWorkerを割り当てる要求だけを加える。
- 期待oracle: LABOから選定・割当・起動を生成せずOS assignment ownerへ返す（L2-006のOS割当Worker実験条件に基づく）。

### L10-LABO-016-C09 — 実行完了だけでsystem適格化

- 対応AC: `LABO-016-AC-02`。固定親: `HELIXLABO-L2-016`。
- 独立fixture（変更は一条件だけ）: 比較可能な結果・反例・oracleを維持し実験実行完了だけを根拠とするsystem適格claimを加える。
- 期待oracle: 自動system適格化を拒みoperation候補として保留し、判定不能を記録する。

### L10-LABO-017-C09 — 例外記録脱落

- 対応AC: `LABO-017-AC-02`。固定親: `HELIXLABO-L2-017`。
- 独立fixture（変更は一条件だけ）: 現行rule版・保証・運転結果を保ち例外記録だけを次段の出力から落とす。
- 期待oracle: 例外を保持し再評価を成功確定せず現行運転ownerへ戻す。

### L10-LABO-018-C09 — 単一標本の一般構造化

- 対応AC: `LABO-018-AC-02`。固定親: `HELIXLABO-L2-018`。
- 独立fixture（変更は一条件だけ）: 標本条件・反例・oracleを保ち標本数だけを1とした知見を一般構造として要求する。
- 期待oracle: 一例から支持範囲を広げずexperiment evaluationへ戻す。

### L10-LABO-018-C10 — 標本母数欠落

- 対応AC: `LABO-018-AC-02`。固定親: `HELIXLABO-L2-018`。
- 独立fixture（変更は一条件だけ）: 比較結果・標本条件・反例を保ち母数だけを欠落させる。
- 期待oracle: 母数を推測せずgeneralizationを未確定に保ちexperiment evaluationへ戻す。

### L10-LABO-019-C10 — LABOによるtarget owner変更

- 対応AC: `LABO-019-AC-02`。固定親: `HELIXLABO-L2-019`。
- 独立fixture（変更は一条件だけ）: target別Feedback候補を維持しLABOからtarget ownerを変更する要求だけを加える。
- 期待oracle: owner変更要求を拒否し、既知targetの責務と候補を保持する。この変異からOS routingを生成しない。

### L10-LABO-019-C11 — 責務区分混合

- 対応AC: `LABO-019-AC-02`。固定親: `HELIXLABO-L2-019`。
- 独立fixture（変更は一条件だけ）: target identityとevidenceを保ちgeneric/product-specific/OS/INTELLIGENCEの責務区分だけを統合する。
- 期待oracle: 責務の混合を拒否し、既知targetごとの責務と候補を保持する。この変異からOS routingを生成しない。

### L10-LABO-021-C11 — source revision unknown

- 対応AC: `LABO-021-AC-02`。固定親: `HELIXLABO-L2-021`。
- 独立fixture（変更は一条件だけ）: 有効HARNESS identity/scope/contractを保ちsource revisionだけをunknownにする。
- 期待oracle: current observationを成立させずHARNESS source ownerへ戻す。

### L10-LABO-027-C12 — LABOによるconnection contract改定

- 対応AC: `LABO-027-AC-02`。固定親: `HELIXLABO-L2-027`。
- 独立fixture（変更は一条件だけ）: 有効connection observationからlogical connection contractへのLABO側書込み試行だけを加える。
- 期待oracle: contractを不変にし該当CONNECT/source ownerへ戻す。

### L10-LABO-028-C13 — Worker authority owner claim

- 対応AC: `LABO-028-AC-02`。固定親: `HELIXLABO-L2-028`。
- 独立fixture（変更は一条件だけ）: 有効OS assignment/receipt/resultを保ちWorkerを機構authority ownerとするclaimだけを加える。
- 期待oracle: Workerを実行者として保持しauthority owner化を拒否する。固定L2-028に明記のないOS routing先を生成しない。

### L10-LABO-028-C14 — OS receipt欠落

- 対応AC: `LABO-028-AC-02`。固定親: `HELIXLABO-L2-028`。
- 独立fixture（変更は一条件だけ）: assignment identity・result source/revisionを保ちOS receiptだけを欠落させる。
- 期待oracle: assignment受領を成立させずOS assignment/receipt ownerへ戻す。

### L10-LABO-028-C15 — unknown result評価済み化

- 対応AC: `LABO-028-AC-02`。固定親: `HELIXLABO-L2-028`。
- 独立fixture（変更は一条件だけ）: 有効assignment/receipt/sourceを保ちresult state unknownをqualifiedとするclaimだけを加える。
- 期待oracle: unknownを維持し評価済みにせず、当該Worker result source ownerへ根拠不足を戻す。

### L10-LABO-029-C10 — LABOからCI実行起動

- 対応AC: `LABO-029-AC-02`。固定親: `HELIXLABO-L2-029`。
- 独立fixture（変更は一条件だけ）: 有効CI/test observationにLABO自身のCI/test実行起動要求だけを加える。
- 期待oracle: LABOから実行を起動しない。固定L2-029に実行起動の戻し先指定がないため拒否のみとする。

### L10-LABO-029-C11 — verification authority書換え

- 対応AC: `LABO-029-AC-02`。固定親: `HELIXLABO-L2-029`。
- 独立fixture（変更は一条件だけ）: 有効CI/test結果にLABOからverification authorityを書き換える要求だけを加える。
- 期待oracle: authority書換えを拒否し元resultを保持する。L2-029がこの操作のowner routeを指定していないため戻し先は新設しない。

### L10-LABO-034-C09 — 顧客固有ルールgeneric化

- 対応AC: `LABO-034-AC-02`。固定親: `HELIXLABO-L2-034`。
- 独立fixture（変更は一条件だけ）: 複数episodeの支持を保ち顧客固有ルール一つだけをgeneric structure candidateへ含める。
- 期待oracle: generic送信を拒み元の固有意味を保持しL2-009へ戻す。

### L10-LABO-035-C15 — Bench水準の重複定義

- 対応AC: `LABO-035-AC-02`。固定親: `HELIXLABO-L2-035`。
- 独立fixture（変更は一条件だけ）: 正常035 evaluation packetへmodel class別Bench水準fieldだけを加える。
- 期待oracle: 035 payloadで水準を受理せずL2-054/055の専用契約へ分離する。

### L10-LABO-058-C26 — call成功をBench評価済み化

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 正常call成功へBench assessed claimだけを加える。
- 期待oracle: callの観測成立だけを保持し、Bench評価済みclaimを拒否する。このCASEでは戻し先を追加せず、Bench評価済みを生成しないことを照合する。

### L10-LABO-058-C27 — call成功を割当許可化

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 正常call成功へassignment permission claimだけを加える。
- 期待oracle: 割当許可の生成を拒否し、call観測を保持する。拒否のみを記録し、このCASEからOS assignment owner等の戻し先を生成しない。

### L10-LABO-058-C28 — 未選択を理由に1.0義務削除

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 正常callで未選択sourceの1.0完成義務だけを一覧から削除する要求を加える。
- 期待oracle: 呼出し依存と完成義務を分け一覧の義務を保持してLABOの要求範囲へ返す。

### L10-LABO-058-C29 — 001観測出力項目変更

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: 正常callから既存001の最低観測出力項目一つだけを削除する要求を加える。
- 期待oracle: 001観測契約を不変にしLABO001契約へ戻す。

### L10-LABO-058-C30 — source追加後permission欠落

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: sourceを明示追加した新集合のcontractと他closureを有効にし、追加sourceのpermissionだけを欠落させる。
- 期待oracle: 追加sourceの成立を拒み未完義務を保持しSECURITY permission ownerへ戻す。有効な別sourceは維持する。

### L10-LABO-058-C31 — source追加後receipt欠落

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 独立fixture（変更は一条件だけ）: sourceを明示追加した新集合のcontractと他closureを有効にし、追加sourceのreceiptだけを欠落させる。
- 期待oracle: 追加sourceの成立を拒み未完義務を保持し追加sourceの既存receipt ownerへ戻す。有効な別sourceは維持する。

### L10-LABO-014-C11 — 明示した目的変更candidate正常

- 対応AC: `LABO-014-AC-01`。固定親: `HELIXLABO-L2-014`。
- 正常fixture: 元purpose/structure/conditionを既知としてpurpose変更だけを明示差分に含むcandidateを与える。
- 期待oracle: 変更案と保持点を分けsource/L1 ownerの判断材料として返す。candidateの採用・実変更を生成しない。

### L10-LABO-014-C12 — 明示したconstraint変更candidate正常

- 対応AC: `LABO-014-AC-01`。固定親: `HELIXLABO-L2-014`。
- 正常fixture: 元purpose/structure/conditionを既知としてconstraint除去だけを明示差分に含むcandidateを与える。
- 期待oracle: 変更案と保持点を分けsource/L1 ownerの判断材料として返す。candidateの採用・実変更を生成しない。

### L10-LABO-015-C11 — LABOからWorker選定

- 対応AC: `LABO-015-AC-02`。固定親: `HELIXLABO-L2-015`。
- 独立fixture（変更は一条件だけ）: 正常比較条件へLABO自身がWorkerを選定する要求だけを加える。
- 期待oracle: 選定を生成せずOS assignment ownerへ返す（L2-006のOS割当Worker実験条件に基づく）。

### L10-LABO-015-C12 — LABOからWorker起動

- 対応AC: `LABO-015-AC-02`。固定親: `HELIXLABO-L2-015`。
- 独立fixture（変更は一条件だけ）: 正常比較条件へLABO自身がWorkerを起動する要求だけを加える。
- 期待oracle: 起動を生成せずOS assignment ownerへ返す（L2-006のOS割当Worker実験条件に基づく）。

### L10-LABO-029-C12 — verification結果書換え

- 対応AC: `LABO-029-AC-02`。固定親: `HELIXLABO-L2-029`。
- 独立fixture（変更は一条件だけ）: 有効CI/test observationへLABO自身がverification結果を書き換える要求だけを加える。
- 期待oracle: 元CI/test結果を不変に保ち、verification結果書換え要求を拒否する。このCASEは拒否と元結果の不変だけを照合し、固定L2-029が定めない戻し先を新設しない。検査scope欠落のみ、固定親どおりsource ownerへ戻す。

### L10-LABO-012-C10 — relation authority書換え

- 対応AC: `LABO-012-AC-02`。固定親: `HELIXLABO-L2-012`。
- 独立fixture（変更は一条件だけ）: 有効episode/evidenceを保ちLABOから上流relation authorityを変更する要求だけを加える。
- 期待oracle: relation authorityを不変にし訂正sourceへ戻す。

### L10-LABO-020-C11 — 復帰後観測の版統合

- 対応AC: `LABO-020-AC-02`。親: `HELIXLABO-L2-020`。
- 入力fixture: pre-fallback rule revision R1、post-operation rule revision R2、復帰後result、未完義務、source ownerが揃う正常入力を保持し、出力の復帰後観測だけを旧版R1と同じ版へ統合する。
- 期待: 統合を拒否し、R1/R2と復帰後観測・未完義務を別に保持する。版の不一致をsource ownerへ返し、新しいrule版を捏造しない。

### L10-LABO-021-C12 — data scope unknown

- 対応AC: `LABO-021-AC-02`。親: `HELIXLABO-L2-021`。
- 入力fixture: 許可されたHARNESS source identity/revision、source contract、個別connectorを保持し、data scopeだけをunknownにする。
- 期待: 取込成功にせずunknownを保持し、HARNESS ownerへdata scopeの不足を返す。既知不許可のC07と区別し、許可範囲を推測しない。

### L10-LABO-023-C11 — BRAIN正本authorityのLABO移管

- 対応AC: `LABO-023-AC-02`。親: `HELIXLABO-L2-023`。
- 入力fixture: BRAIN source identity/revision、利用permission/scope、許可された利用結果を保持し、source canonical owner/authorityの所在だけをLABOへ移すclaimを加える。
- 期待: 移管を拒否し、正本とauthorityの所在をBRAINに保持する。LABO observationの取得を正本移管に変換しない。BRAIN source ownerへ不整合を返す。

### L10-LABO-035-C16 — 適用scope unknown

- 対応AC: `LABO-035-AC-02`。親: `HELIXLABO-L2-035`。
- 入力fixture: 正常evaluation packetのsource identity/revision・評価状態・connectorを保持し、適用scopeだけをunknownにする。
- 期待: 評価済みへ変えずscope unknownを保持し、当該source ownerへ不足を戻す。

### L10-LABO-035-C17 — 適用scope欠落

- 対応AC: `LABO-035-AC-02`。親: `HELIXLABO-L2-035`。
- 入力fixture: 正常evaluation packetのsource identity/revision・評価状態・connectorを保持し、適用scope fieldだけを欠落させる。
- 期待: 受渡しを完成扱いせず、当該source ownerへ適用scopeの欠落を戻す。

### L10-LABO-058-C32 — Web明示選択正常

- 対応AC: `LABO-058-AC-01`。親: `HELIXLABO-L2-058`。
- 入力fixture: Web sourceを明示選択し、既存L2-031の採択source contract、個別connector、安全・permission・scope・revision・receiptを同じ対象へ有効に束縛する。
- 期待: 選択Web sourceの条件だけでobservation候補を照合する。実際のWeb採択・稼働を成立させず、Web未選択の1.0呼出しへ条件を追加しない。

### L10-LABO-058-C33 — Web選択contract未採択

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: C32の選択と他の安全・接続条件を保持し、選択Web source contractの採択状態だけを未採択にする。
- 期待: 当該Web入力を成立させず、source ownerへ未採択contractを戻す。他の有効sourceと未選択source状態を保持する。

### L10-LABO-058-C34 — Web選択connector欠落

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: C32の選択・採択source contract・安全条件を保持し、当該Web sourceの個別connectorだけを欠落させる。
- 期待: 当該入力を成立させずCONNECTの当該connector ownerへ不足を戻す。別source connectorの暗黙共用をしない。

### L10-LABO-022-C12 — receipt欠落

- 対応AC: `LABO-022-AC-02`。親: `HELIXLABO-L2-022`。
- 入力fixture: 有効ticket/source identity・revisionとassignmentを保持し、receiptだけを欠落させる。
- 期待: 未完を保持し、受領済みや完了へ変換せずOSへreceipt不足を戻す。

### L10-LABO-022-C13 — ticket stale

- 対応AC: `LABO-022-AC-02`。親: `HELIXLABO-L2-022`。
- 入力fixture: 有効assignment/receiptとsource契約を保持し、ticket revisionだけを現行対象よりstaleにする。
- 期待: 旧ticketをcurrentとして取り込まず、未完と不一致をOSへ戻す。

### L10-LABO-022-C14 — assignment stale

- 対応AC: `LABO-022-AC-02`。親: `HELIXLABO-L2-022`。
- 入力fixture: 有効ticket/source/receiptを保持し、assignment revisionだけを現行対象よりstaleにする。
- 期待: 旧assignmentで受領や完了を成立させずOSへ不一致を戻す。

### L10-LABO-023-C12 — knowledge use既知不許可

- 対応AC: `LABO-023-AC-02`。親: `HELIXLABO-L2-023`。
- 入力fixture: BRAIN source identity/revision、source契約、利用scopeを保持し、permissionだけを既知不許可にする。
- 期待: knowledge useを受理せず、既知不許可をunknownと混同せずSECURITY permission ownerへ戻す。

### L10-LABO-034-C10 — LABO観測をBRAIN取込済み化

- 対応AC: `LABO-034-AC-02`。親: `HELIXLABO-L2-034`。
- 入力fixture: 有効なgeneric structure candidateとsource evidenceを保持し、LABO観測のみを根拠にBRAIN取込済み/authority成立とするclaimだけを加える。
- 期待: claimを拒否しcandidateを保持する。BRAIN取込済み・authorityを生成しない。このCASEは拒否のみを照合し追加ownerを作らない。

### L10-LABO-058-C35 — 001観測本文変更

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: 正常callの他条件を保持し、既存001の観測本文の状態区分一つだけを書き換える要求を加える。
- 期待: 既存001観測本文を不変に保持しLABO001契約へ差分を戻す。

### L10-LABO-058-C36 — 001責務変更

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: 正常callの他条件を保持し、001の観測責務だけをsource正本変更責務へ変更する要求を加える。
- 期待: 責務変更を拒否し001の観測責務とsource正本を保持してLABO001契約へ戻す。

### L10-LABO-058-C37 — WEB-OS明示選択正常

- 対応AC: `LABO-058-AC-01`。親: `HELIXLABO-L2-058`。
- 入力fixture: WEB-OS sourceを明示選択し、既存L2-032の採択済みsource contract、個別connector、tenant/customer scope、source identity/revision/data scope、許可されたtenant/job/deployment/runtime観測を同じ対象へ有効に束縛する。
- 期待: 選択WEB-OS sourceの条件だけでobservation候補を照合し、tenant/customer scopeとWEB-OS authorityをsource側に保持する。実際のWEB-OS採択・稼働を成立させず、未選択の1.0呼出しへ条件を追加しない。

### L10-LABO-058-C38 — WEB-OS選択contract未採択

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: C37の選択と他のscope・connector・observation条件を保持し、選択WEB-OS source contractの採択状態だけを未採択にする。
- 期待: 当該WEB-OS入力を成立させず、source ownerへ未採択contractを戻す。他の有効sourceと未選択source状態を保持する。

### L10-LABO-058-C39 — WEB-OS選択connector欠落

- 対応AC: `LABO-058-AC-02`。親: `HELIXLABO-L2-058`。
- 入力fixture: C37の選択・採択source contract・tenant/customer scopeを保持し、当該WEB-OS sourceの個別connectorだけを欠落させる。
- 期待: 当該入力を成立させずCONNECTの当該connector ownerへ不足を戻す。別source connectorの暗黙共用をしない。


### review04 独立一条件変異fixture（未実行）

### L10-LABO-016-C11 — oracle欠落

- 対応AC: `LABO-016-AC-02`。固定親: `HELIXLABO-L2-016`。
- 入力/期待oracle: 他の比較可能性・反例・結果を保ちoracle identityだけ欠落。欠落のみunknownとして保持しsystem適格性を導かない。比較結果はoperation候補として保留し、固定L2にないowner routeを追加しない。

### L10-LABO-017-C11 — system/operation適格性入力欠落

- 対応AC: `LABO-017-AC-02`。固定親: `HELIXLABO-L2-017`。
- 入力/期待oracle: 他のcurrent rule、保証、owner結果、例外、未完義務を保ち適格性材料だけ欠落。候補を成立させず、固定L2:189の依存L2-007が持つ適格性sourceへ不足を返す。

### L10-LABO-017-C12 — system/operation条件欠落

- 対応AC: `LABO-017-AC-02`。固定親: `HELIXLABO-L2-017`。
- 入力/期待oracle: 他の入力を保ちsystem/operation条件だけ欠落。条件を推定せずunknownで保持し切替候補を成立させない。固定L2:189の依存L2-007の適格性sourceへ不足を返す。

### L10-LABO-017-C13 — system永続固定

- 対応AC: `LABO-017-AC-02`。固定親: `HELIXLABO-L2-017`。
- 入力/期待oracle: 例外・負担・変更費用増加の証拠と未完義務を保つ入力に対し出力だけsystem永続固定とする。固定出力を拒否しoperation復帰候補と未完義務を保持する。切替は実行しない。

### L10-LABO-021-C13 — HARNESS contract version stale

- 対応AC: `LABO-021-AC-02`。固定親: `HELIXLABO-L2-021`。
- 入力/期待oracle: source identity/revision/scopeは有効のままcontract versionだけ過去版。current扱いせずHARNESS source contract ownerへ戻す。

### L10-LABO-022-C15 — OS source contract欠落

- 対応AC: `LABO-022-AC-02`。固定親: `HELIXLABO-L2-022`。
- 入力/期待oracle: ticket/assignment/receipt/revisionを保ちOS source contractだけ欠落。完了扱いせず、固定L2-022に従いOSへ戻す。

### L10-LABO-022-C17 — OS source contract stale

- 対応AC: `LABO-022-AC-02`。固定親: `HELIXLABO-L2-022`。
- 入力/期待oracle: ticket/assignment/receipt/revisionを保ちcontract versionだけstale。current contractへ結び直さずunknownを保持し、固定L2:209に従ってOS source ownerへstaleを戻す。

### L10-LABO-022-C18 — OS source revision stale

- 対応AC: `LABO-022-AC-02`。固定親: `HELIXLABO-L2-022`。
- 入力/期待oracle: contractをcurrentに保ちsource revisionだけstale。current扱いせず固定L2のOS source ownerへ戻す。

### L10-LABO-023-C13 — BRAIN source contract欠落

- 対応AC: `LABO-023-AC-02`。固定親: `HELIXLABO-L2-023`。
- 入力/期待oracle: source identity/version/scope/permissionを保ちcontractだけ欠落。利用成功とせず固定L2-023の依存であるBRAIN source contract不成立として拒否/unknownを保持する。source identity不明の場合だけ固定L2-023に明記されたBRAINへ戻す。BRAIN正本は移管しない。

### L10-LABO-024-C17 — INTELLIGENCE正本書戻し要求

- 対応AC: `LABO-024-AC-02`。固定親: `HELIXLABO-L2-024`。
- 入力/期待oracle: 判断/revision/evidenceを保ちLABO observationからINTELLIGENCE判断記録へ書戻す操作だけ加える。拒否しsource authority保持。固定親に戻し先なし。

### L10-LABO-029-C19 — OS execution receipt不一致

- 対応AC: `LABO-029-AC-02`。固定親: `HELIXLABO-L2-029`。
- 入力/期待oracle: target revision/scope/HARNESS verification contractを保ちOS execution receipt identityだけ不一致。passにせず、固定親に明記のないrouteは作らず拒否/unknown。

### L10-LABO-034-C11 — BRAIN connector欠落

- 対応AC: `LABO-034-AC-02`。固定親: `HELIXLABO-L2-034`。
- 入力/期待oracle: generic evidence/scopeを保ちBRAIN個別connector契約だけを欠落させる。candidate送付済みにせずunknownを保持し、固定L2:159–162/257の個別connector依存から再導出したCONNECTの当該connector契約ownerへ不足を返す。

### L10-LABO-034-C12 — BRAIN connector契約版stale

- 対応AC: `LABO-034-AC-02`。固定親: `HELIXLABO-L2-034`。
- 入力/期待oracle: 他のgeneric evidence/scopeを保ちconnector契約版だけをstaleにする。受渡し済みとせずunknownを保持し、固定L2:159–162/257に基づくCONNECTの当該connector契約ownerへstaleを返す。

### L10-LABO-035-C18 — INTELLIGENCE connector欠落

- 対応AC: `LABO-035-AC-02`。固定親: `HELIXLABO-L2-035`。
- 入力/期待oracle: payload/revision/unassessedを保ちINTELLIGENCE個別connector契約だけを欠落させる。受渡し済みとせずunknownを保持し、固定L2:159–162/261に基づくCONNECTの当該connector契約ownerへ不足を返す。

### L10-LABO-035-C19 — INTELLIGENCE connector不一致

- 対応AC: `LABO-035-AC-02`。固定親: `HELIXLABO-L2-035`。
- 入力/期待oracle: payload/revision/unassessedを保ちconnector契約identityだけを宣言と不一致にする。契約版を保持し、受渡し済みとせずunknownを保持して、固定L2:159–162/261に基づくCONNECTの当該connector契約ownerへ不一致を返す。L2-052の到達revision不一致とは別。

### L10-LABO-058-C40 — 選択source scope欠落

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 入力/期待oracle: 選択source/version/permission/receiptを保ちscopeだけ欠落。当該取込を完了せずunknownを保持し、固定L2:413に従い当該選択source ownerへscope不足を返す。

### L10-LABO-025-C10 — SECURITY finding disposition変更

- 対応AC: `LABO-025-AC-02`。親: `HELIXLABO-L2-025`。
- 入力fixture: 許可されたSECURITY evidenceとsource authorityを保持し、LABOからsource finding dispositionを書き換える要求だけを加える。
- 期待: disposition変更を拒否し元のSECURITY findingを保持する。SECURITY ownerへ不整合を返し、LABO observationをsource findingの決定に変換しない。


### L10-LABO-024-C18 — 稼働中判断を過去実績へ混入

- 対応AC: `LABO-024-AC-02`。固定親: `HELIXLABO-L2-024`。
- 入力fixture: 有効な稼働中判断と過去評価それぞれのsource identity/revision/evidenceを保持し、出力分類だけを「稼働中判断を過去実績」とする。
- 期待oracle: 混入を拒否し、現行判断と過去評価を別状態で保持する。これだけで新たな権威・判断を生成しない。固定親に戻し先指定がないため、返却先を創作せず不合格を記録する。

### L10-LABO-058-C41 — 058補足を001実行の再帰前提にしない

- 対応AC: `LABO-058-AC-02`。固定親: `HELIXLABO-L2-058`。
- 入力fixture: L2-001の必須入力・選択source・適用される安全/版条件は満たし、058 supplementは未実行で存在しない正常baselineを固定する。001の実行判定条件だけに「058 supplementが必須」という再帰前提を追加する一変異を与える。
- 期待oracle: supplementがないことだけで001固有の有効な観測を拒否しない。同時に、058を実行済み、採択済み、または他のsource dependencyを満たしたと扱わない。固定L2-058に戻し先が指定されていないため追加しない。

## Stage 5 — HELIXLABO-L2-050 L10 fixture候補

本節は固定L2-050だけの未実行fixture設計である。各negativeは明記した基準状態から一つの条件だけを変える。ownerは固定L2-050/L11-050にある既存境界のみを用いる。ここに書くfixtureは実行・承認・変更を行わない。

### CASE-LABO-050 — 内部改善循環

- `L10-LABO-050-CASE-01`（対応AC: `LABO-050-AC-01`）正常: 許可観測とepisodeから開始し、Observed→Correlated→Hypothesized→Experimented→Evaluated→Feedback Candidate→OS registration/routing→target change→verification→deployment/operation→LABO re-observationをすべて別状態で記録する。同じticket/experiment/target revision、対応するOS assignment/Worker result、source/target revision、各receiptと未完義務を結ぶ。effectとregressionは別判定結果。Oracleは11段階と未完義務を追跡でき、LABO評価、OS登録、target-owner変更/検証/deployment/operation、LABO再観測の責務を混ぜないこと。
- `L10-LABO-050-CASE-02`（対応AC: `LABO-050-AC-02`）未見正常: CASE-01と同じtarget identity・ticket・episodeを保ち、許可された後続target revisionの遅着re-observationだけを追加する。Oracleは同一episodeへ追記し、過去record/revisionを上書きしないこと。

| CASE | 対応AC | 種類 | 基準入力 / 単独変異 | 期待oracle / 既存戻し先 |
|---|---|---|---|---|
|`L10-LABO-050-CASE-03a`|`LABO-050-AC-03`|negative|CASE-01のOS assignment観測record側ticket identityだけを欠落させる。他のidentity/receiptは有効。|ticketを補完せず別recordを結合しない。完了を拒否しOSへ戻す。|
|`L10-LABO-050-CASE-03b`|`LABO-050-AC-03`|negative|CASE-01のOS assignmentとticketを保ち、Worker-result側experiment identityだけをassignment側と異なる値にする。|結果を当該実験の評価へ結合せずunknown/未完了とし、実験/評価bindingを担うLABOへ戻す。|
|`L10-LABO-050-CASE-03c`|`LABO-050-AC-03`|negative|CASE-01でtarget ownerのcurrent target revision、ticket、experiment、assignmentを保ち、Worker-result側target revisionだけ旧版にする。|旧版resultをcurrent targetへ流用せずstaleとして保持し、実験評価bindingを担うLABOへ戻す。target authorityはtarget ownerに残す。|
|`L10-LABO-050-CASE-03d`|`LABO-050-AC-03`|negative|CASE-01でOS assignment receiptだけ欠落。|runを割当済みに見せず完了を拒否。OSへ戻す。|
|`L10-LABO-050-CASE-03e`|`LABO-050-AC-03`|negative|CASE-01でWorker resultのtarget identityだけ別値。|結果を対象experimentへ束縛せず完了を拒否し、実験評価bindingを担うLABOへ戻す。target authorityはtarget ownerに残す。|
|`L10-LABO-050-CASE-03f`|`LABO-050-AC-03`|negative|CASE-01で変更後LABO re-observation receiptだけ欠落。|循環をopenのまま保ち、再観測を補完しない。LABOへ戻す。|
|`L10-LABO-050-CASE-03g`|`LABO-050-AC-03`|非独立ラベル|同時欠落案の識別子を保持する。現行fixtureやoracleを構成しない。|このラベル単独ではnegative分母へ入れない。|
|`L10-LABO-050-CASE-04a`|`LABO-050-AC-03`|negative|CASE-01の入力状態でregistration/routingの実行者だけをLABOにする。|LABOによるregistrationを拒否する。registration/routingはOS。|
|`L10-LABO-050-CASE-04b`|`LABO-050-AC-03`|negative|CASE-01の入力状態でtarget changeの実行者だけをLABOにする。|LABOによるtarget直接変更を拒否する。target ownerの権限を保つ。|
|`L10-LABO-050-CASE-05`|`LABO-050-AC-03`|negative|CASE-01でOS registration receiptだけ欠落。|登録を推測せず循環未完了。OSへ戻す。|
|`L10-LABO-050-CASE-06`|`LABO-050-AC-03`|negative|CASE-01でticket/experiment/assignment/Worker result/target identityをすべてcurrentに保ち、verification receiptのrevisionだけ旧版にする。|旧verification receiptをcurrent target changeへ適用せず未完義務をopenにし、target ownerへ戻す。|
|`L10-LABO-050-CASE-07`|`LABO-050-AC-03`|索引（独立fixtureではない）|既存IDを維持する非独立索引。`CASE-06`のrevision変更による旧verification非適用を参照する。|CASE-06を直接照合し、独立欠落変異として数えない。|
|`L10-LABO-050-CASE-08`|`LABO-050-AC-03`|索引（独立fixtureではない）|既存IDを維持する非独立索引。deployment欠落の`CASE-13`とoperation欠落の`CASE-14`を個別参照する。|CASE-13とCASE-14の各oracleを個別に確認し、束ねた追加fixtureにしない。|
|`L10-LABO-050-CASE-09`|`LABO-050-AC-03`|索引（独立fixtureではない）|`CASE-03f`の変更後re-observation欠落を参照する既存索引。|CASE-03fを直接照合し、二重計上しない。|
|`L10-LABO-050-CASE-10`|`LABO-050-AC-03`|索引（独立fixtureではない）|effect-only欠落CASE-22とregression-only欠落CASE-23をそれぞれ直接参照する既存索引。|実fixture CASE-22/23を直接照合し、索引を分母に含めない。|
|`L10-LABO-050-CASE-11`|`LABO-050-AC-03`|negative|CASE-01の採択前candidateを基準に、candidateをcanonicalへ変える操作だけを変異。|canonical化を拒否しcandidateのまま保持。target authorityはtarget ownerに残す。|
|`L10-LABO-050-CASE-12`|`LABO-050-AC-03`|negative|CASE-01の過去source recordとidentity/revisionを保ち、後続観測でそのrecordを上書きする操作だけを変異する。設計注記: 固定親にないsource-owner identity入力やunknown-owner条件はfixtureへ追加しない。|上書きを拒否し、過去recordと後続観測を別状態で保持する。|
|`L10-LABO-050-CASE-13`|`LABO-050-AC-03`|negative|CASE-01でtarget deployment resultだけ欠落。その他のreceiptは有効。|deployment resultを補わず循環未完了。target ownerへ戻す。|
|`L10-LABO-050-CASE-14`|`LABO-050-AC-03`|negative|CASE-01でtarget operation resultだけ欠落。その他のreceiptは有効。|operation resultを補わず循環未完了。target ownerへ戻す。|
|`L10-LABO-050-CASE-15`|`LABO-050-AC-03`|negative|CASE-01でtarget-change後のverification receiptだけ欠落。deployment/operation receiptは有効。|循環未完了。target ownerへ戻す。|
|`L10-LABO-050-CASE-16`|`LABO-050-AC-03`|negative|有効source/ticket/experiment/target revision、OS assignment、評価済みcandidate、OS registration/routing完了を基準にし、target changeは未実施、verification/deployment/operation/re-observation/effect/regressionはopenとしCI成功receiptは既存状態に置く。唯一の変異はこのCI成功だけを根拠に後続義務完了を主張すること。|CI結果をstage receiptの代替にせず全open義務を保持する。登録はOS、target後段はtarget owner、再観測/評価はLABO。|
|`L10-LABO-050-CASE-17`|`LABO-050-AC-03`|negative|有効source/ticket/experiment/target revisionでFeedback candidateは発行済み、OS registrationとtarget後続義務は未完。唯一の変異はFeedback発行だけで改善完了と主張すること。|candidate状態と未完義務を保つ。登録はOS、change/verification/operationはtarget owner、再観測/評価はLABO。|
|`L10-LABO-050-CASE-18`|`LABO-050-AC-03`|negative|有効source/ticket/experiment/target revisionでOS registration完了、target change以降は未観測/open。唯一の変異はregistrationだけで完了と主張すること。|後続義務をopenのまま保つ。registrationはOS、変更/検証/運用はtarget owner、再観測/評価はLABO。|
|`L10-LABO-050-CASE-19`|`LABO-050-AC-03`|negative|有効source/ticket/experiment/target revisionでtarget-change結果あり、verification/deployment/operation/re-observation/evaluationは未観測/open。唯一の変異はtarget-changeだけで完了と主張すること。|後続義務をopenのまま保ち、既存owner境界へ戻す。|
|`L10-LABO-050-CASE-20`|`LABO-050-AC-03`|negative|CASE-01でtarget-change result receiptだけ欠落し、他のreceiptは有効。|change successを推測せず循環未完了。target ownerへ戻す。|
|`L10-LABO-050-CASE-21`|`LABO-050-AC-03`|negative|有効なsource/ticket/experiment/target revisionとpositive candidate countを含む部分循環を基準にし、registration/change/verification/operation/re-observation/effect/regressionはopenのままにする。唯一の変異はcandidate countだけで循環完了と主張すること。|candidate countだけでは完了しない。countからcandidate adoption、registration、target change、後続結果を生成せず、各open dutyを既存owner境界に残す。|
|`L10-LABO-050-CASE-22`|`LABO-050-AC-03`|negative|CASE-01と同じ有効なidentity・stage receipt・target revision・re-observationで、regression evaluationはありeffect evaluationだけ欠落。唯一の欠落はeffect evaluation。|effect未評価として完了を拒否しLABOへ戻す。regressionの有効結果を保持する。|
|`L10-LABO-050-CASE-23`|`LABO-050-AC-03`|negative|CASE-01と同じ有効なidentity・stage receipt・target revision・re-observationで、effect evaluationはありregression evaluationだけ欠落。唯一の欠落はregression evaluation。|regression未評価として完了を拒否しLABOへ戻す。effectの有効結果を保持する。|
|`L10-LABO-050-CASE-24`|`LABO-050-AC-03`|negative|CASE-01と同じassignment/ticket/experiment/target/result条件を保ち、Worker-result側ticket identityだけをassignment側と異なる値にする。|別ticketの証拠を結合せず完了を拒否し、OSへ戻す。|
|`L10-LABO-050-CASE-25`|`LABO-050-AC-03`|negative|CASE-01を基準にWorker-result側experiment identityだけ欠落させる。他のidentity/receiptは有効。|experimentを推測・結合せず評価を未完了に保ち、experiment/evaluation bindingを担うLABOへ戻す。|
|`L10-LABO-050-CASE-26`|`LABO-050-AC-03`|negative|CASE-01を基準にWorker-result側target revisionだけ欠落。他のidentity/receiptとcurrent target revisionは有効。|欠落版を補完せずcurrent結果として扱わない。実験評価bindingを担うLABOへ戻し、target authorityはtarget ownerに残す。|
|`L10-LABO-050-CASE-27`|`LABO-050-AC-03`|negative|CASE-01を基準にOS assignmentとその他identityを有効に保ち、Worker-result receiptだけ欠落。|Worker実行結果を推測せず評価を未完了に保ち、OSへ戻す。|
|`L10-LABO-050-CASE-28`|`LABO-050-AC-03`|negative|CASE-01を基準にWorker resultとepisode/experiment/ticketを有効に保ち、OS assignment receiptのtarget identityだけWorker result/current targetと異なる値にする。|assignment/resultを結合せず完了を拒否しOSへ戻す。|
|`L10-LABO-050-CASE-29`|`LABO-050-AC-03`|negative|CASE-01の11段階すべてのreceipt・identity・結果を有効に保ち、stage event順序だけを変え、OS registration/routingをFeedback Candidateより先に置く。|固定段階順序との不一致を受け入れず循環を未完了に保つ。LABO評価の責務区分は維持する。|
|`L10-LABO-050-CASE-30`|`LABO-050-AC-03`|negative|CASE-01からticket/experiment/target identity、OS assignment、Worker result、registration、candidateなど前段receiptを引き継いで有効に保つ。target changeとverification receiptも有効とし、deployment/operation/re-observation/effect/regression receiptだけは未観測/open。唯一の変異はverification receiptだけを根拠に循環完了を出力すること。|verificationだけで完了とせず循環を未完了に保つ。deployment/operationはtarget owner、re-observation/effect/regression evaluationはLABOの既存責務に残す。|

Stage 5のCASE IDはこの本文で各々の種類・参照先を定義する。CASE-01/02は正常fixture、03gは非独立ラベル、07/08/09/10は非独立索引、CASE-24–30は本追補で追加した単独fixtureである。定義は37件（独立fixture32件、非独立ラベル/索引5件）であり、索引・ラベルをnegative分母へ加えない。


### CASE-LABO-059 — 比較評価と既決優先関係

本節はf6dad2aのHELIXLABO-L2-059 / L11 G13を起点とする未実行fixture設計である。CASE-01の数値実測や全source receiptが存在すると仮定しない。合成fixtureは固定sourceで意味が定まるfield状態だけを表し、実運転/実権限/実結果ではない。negativeは記した一項目だけを変える。正常、単独negative、複合fixture、非独立indexを混ぜない。

- `L10-LABO-059-CASE-01`（対応AC: `LABO-059-AC-01`） 正常: 選択目的に必要な同条件run、同一quality oracle、OS receipts、価格source・通貨・適用時点、適用scope内の既決priorityを与え、quality gateの後に費用・時間・人介入を別表示する。

- `L10-LABO-059-CASE-02`（対応AC: `LABO-059-AC-02`） 未見正常: 未見taskの条件が選択比較scopeで適用可能な場合、選択二者群だけを比較し未選択群の不足は未測定として残す。旧版群を選択する場合は保存済みの歴史receiptだけを読み、旧runtimeを実行しない。

CASE-01は旧snapshot上の高水準正常説明である。各下記candidateの合成baselineは該当固定条件に必要なfieldが存在し、identity/revisionはsymbolicなsource referenceで一致する状態を示すにとどまる。未知の値・実験結果・authorizationを作らない。

| CASE ID | 対応AC | 入力状態 / 単独変異 | 期待oracle / 戻し先 |
|---|---|---|---|
| `L10-LABO-059-CASE-03a` | LABO-059-AC-03 | task scopeだけ異なる | 同条件比較を不成立にする。 |
| `L10-LABO-059-CASE-03b` | LABO-059-AC-03 | quality oracle revisionだけ異なる | 比較不能。HARNESSへ戻す。 |
| `L10-LABO-059-CASE-03c` | LABO-059-AC-03 | decision scopeだけ適用境界外 | decisionを流用せず、POが選択した既存decision ownerへ戻す。 |
| `L10-LABO-059-CASE-03d` | LABO-059-AC-03 | priority/toleranceだけ未決 | 値を創作せず判断待ちとする。 |
| `L10-LABO-059-CASE-03e` | LABO-059-AC-03 | human intervention timeだけ欠落 | amount unknown、総金額不完全を表示する。時間/effortの提供元を識別できればLABO-055または該当sourceへ戻し、source identityが不明なら戻し先unknown。 |
| `L10-LABO-059-CASE-03f` | LABO-059-AC-03 | rescue costだけ除外 | 総費用の成功比較にしない。欠落した救援費用・effortの提供元が識別できれば該当sourceまたはLABO-055へ戻し、identity不明ならunknown。 |
| `L10-LABO-059-CASE-03g` | LABO-059-AC-03 | accepted outcome数だけ0 | low-cost 成功へ変換しない。 |
| `L10-LABO-059-CASE-03h` | LABO-059-AC-03 | HELIX支援cohortと実験conditionだけ混同 | 別軸へ戻し、比較目的を再確認する。 |
| `L10-LABO-059-CASE-03i` | LABO-059-AC-03 | 必要な群のreceiptだけ欠落 | その比較だけ未測定/比較不能。 |
| `L10-LABO-059-CASE-03j` | LABO-059-AC-03 | 価格sourceだけ欠落 | 金額を0や推定値で補わずunknownにする。price source identityが分かるときはLABO-055またはそのsourceへ、特定できないときはunknown。 |
| `L10-LABO-059-CASE-03k` | LABO-059-AC-03 | currencyだけ欠落 | 換算せず金額比較を未評価にする。currencyを含むprice evidenceのsourceが識別できればLABO-055またはそこへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-03l` | LABO-059-AC-03 | effective timeだけ欠落 | 適用価格を確定せず当該比較を未評価にする。適用価格sourceが識別できればLABO-055またはそこへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-03m` | LABO-059-AC-03 | rework costだけ除外 | 総費用の成功比較にしない。欠落したrework費用・effortの提供元が識別できれば該当sourceまたはLABO-055へ戻し、identity不明ならunknown。 |
| `L10-LABO-059-CASE-04a` | LABO-059-AC-03 | LABOがWorkerを割当 | 拒否。OS ownerへ戻す。 戻し先: OS。 |
| `L10-LABO-059-CASE-04b` | LABO-059-AC-03 | LABOがpriority/toleranceを確定 | 拒否。既存decision ownerに残す。 |
| `L10-LABO-059-CASE-05` | LABO-059-AC-03 | 単独変異: 有効なscope内decisionにrunごとの再確認を要求だけを変更。その他の入力は `CASE-01` と同一。 | この有効なscope内decisionへのrunごとの再確認要求を拒否し、既決decisionをそのまま再利用する。このケースからdecision ownerへの再確認・戻しを生成しない（固定L2-059:420/422、L11:170）。 |
| `L10-LABO-059-CASE-06` | LABO-059-AC-03 | 単独変異: decisionの有効期限切れだけを変更。その他の入力は `CASE-01` と同一。 | 優先値を適用せず既存decision ownerへ返す 戻し先: 既存decision owner。 |
| `L10-LABO-059-CASE-07` | LABO-059-AC-03 | 基準入力ではquality oracleが不成立、他receipt/price/適用可能decisionは有効。入力を固定し、出力だけを低価格で品質不成立を成功化する。 | 誤った成功出力を拒否し、品質不成立/比較不成立を保つ。quality oracleを変更せず、oracle自体の不明時だけHARNESS/要求ownerへ返す。 |
| `L10-LABO-059-CASE-08` | LABO-059-AC-03 | 基準入力ではquality oracleが不成立、他receipt/duration/適用可能decisionは有効。入力を固定し、出力だけを短いdurationで品質不成立を成功化する。 | 誤った成功出力を拒否し、品質不成立/比較不成立を保つ。quality oracleを変更せず、oracle自体の不明時だけHARNESS/要求ownerへ返す。 |
| `L10-LABO-059-CASE-09` | LABO-059-AC-03 | 単独変異: selected comparison scope だけ異なる。その他の入力は `CASE-01` と同一。 | 同条件比較を分離し比較不能にする 戻し先: LABO。 |
| `L10-LABO-059-CASE-10` | LABO-059-AC-03 | 単独変異: scorer revision だけ異なる。その他の入力は `CASE-01` と同一。 | 異なるscorerを比較群へ混ぜない 戻し先: LABO。 |
| `L10-LABO-059-CASE-11` | LABO-059-AC-03 | 単独変異: run protocol だけ異なる。その他の入力は `CASE-01` と同一。 | 異なるprotocolを比較群へ混ぜない 戻し先: LABO。 |
| `L10-LABO-059-CASE-12` | LABO-059-AC-03 | 単独変異: hardware class だけ異なる。その他の入力は `CASE-01` と同一。 | 異なるhardware条件を比較群へ混ぜない 戻し先: LABO。 |
| `L10-LABO-059-CASE-13` | LABO-059-AC-03 | 単独変異: toolchain revision だけ異なる。その他の入力は `CASE-01` と同一。 | 異なるtoolchain条件を比較群へ混ぜない 戻し先: LABO。 |
| `L10-LABO-059-CASE-14` | LABO-059-AC-03 | 単独変異: requirement/task revision だけ異なる。その他の入力は `CASE-01` と同一。 | 異なるrevisionを比較群へ混ぜない 戻し先: HARNESS。 |
| `L10-LABO-059-CASE-15` | LABO-059-AC-03 | 単独変異: no-Harness runに他のHELIX支援が残る条件だけを変更。その他の入力は `CASE-01` と同一。 | 当該cohortをHELIXなしと呼ばない 戻し先: LABO。 |
| `L10-LABO-059-CASE-16` | LABO-059-AC-03 | 単独変異: historical runへ現行OS assignmentを遡及付与だけを変更。その他の入力は `CASE-01` と同一。 | 当時のauthority/receiptを保持し後付けassignmentを拒否する 戻し先: OS。 |
| `L10-LABO-059-CASE-17` | LABO-059-AC-03 | 単独変異: subscription/API-equivalent区分costの欠落だけを変更。その他の入力は `CASE-01` と同一。 | 総費用を完全とせず該当費用欠落を示す。subscription/API-equivalentの価格sourceが識別できればLABO-055またはそのsourceへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-18` | LABO-059-AC-03 | 単独変異: CI cost receiptだけ欠落。その他の入力は `CASE-01` と同一。 | CI費用はunknownのまま金額総額を不完全とする。cost receipt欠落だけから実行不在を推測せず、価格/計上sourceが識別できればLABO-055または該当sourceへ返し、identity不明はunknown。 |
| `L10-LABO-059-CASE-19` | LABO-059-AC-03 | 単独変異: duration start-event definition だけ異なる。その他の入力は `CASE-01` と同一。 | durationを比較不能とし定義差を保持する 戻し先: LABO。 |
| `L10-LABO-059-CASE-20` | LABO-059-AC-03 | 単独変異: 未価格human timeの通貨0変換だけを変更。その他の入力は `CASE-01` と同一。 | human effortを別掲し金額総額不完全とする 戻し先: LABO。 |
| `L10-LABO-059-CASE-21` | LABO-059-AC-03 | 単独変異: 二つのselected cohortを三cohortとする主張だけを変更。その他の入力は `CASE-01` と同一。 | 二者結果を三者比較完了へ拡張しない 戻し先: LABO。 |
| `L10-LABO-059-CASE-22` | LABO-059-AC-03 | 索引（独立fixtureではない）: `L10-LABO-059-CASE-18`と同一の単独入力変異。 | 主fixture `L10-LABO-059-CASE-18` のoracleを参照し、同じケースを重複計上しない。 |
| `L10-LABO-059-CASE-23` | LABO-059-AC-03 | 単独変異: review cost receipt だけ欠落。その他の入力は `CASE-01` と同一。 | 費用内訳を不完全としunknownを保つ。該当review/費用条件の提供sourceが識別できればLABO-055またはそこへ戻し、識別できなければunknown。 |
| `L10-LABO-059-CASE-24` | LABO-059-AC-03 | 単独変異: retry cost receiptだけ欠落。その他の入力は `CASE-01` と同一。 | 費用内訳を不完全としunknownを保つ。該当retry/費用条件の提供sourceが識別できればLABO-055またはそこへ戻し、識別できなければunknown。 |
| `L10-LABO-059-CASE-25` | LABO-059-AC-03 | 単独変異: rescue cost receiptだけ欠落。その他の入力は `CASE-01` と同一。 | 費用内訳を不完全としunknownを保つ。該当rescue/費用条件の提供sourceが識別できればLABO-055またはそこへ戻し、識別できなければunknown。 |
| `L10-LABO-059-CASE-26` | LABO-059-AC-03 | 単独変異: human-fix cost receiptだけ欠落。その他の入力は `CASE-01` と同一。 | 費用内訳を不完全としunknownを保つ。human-fix/effort条件の提供sourceが識別できればLABO-055または該当sourceへ戻し、識別できなければunknown。 |
| `L10-LABO-059-CASE-27` | LABO-059-AC-03 | 単独変異: duration end-event definition だけ異なる。その他の入力は `CASE-01` と同一。 | durationを比較不能とし定義差を保持する。 |
| `L10-LABO-059-CASE-28` | LABO-059-AC-03 | 単独変異: duration clock identity だけ異なる。その他の入力は `CASE-01` と同一。 | durationを比較不能としclock差を保持する。 |
| `L10-LABO-059-CASE-29` | LABO-059-AC-03 | 単独変異: duration stop/wait rule だけ異なる。その他の入力は `CASE-01` と同一。 | durationを比較不能とし定義差を保持する。 |
| `L10-LABO-059-CASE-30` | LABO-059-AC-03 | 初回candidate単価だけを根拠に安価と認定し、retry・救援・rework・人修正を含む総費用を無視する。その他は `CASE-01` と同一。 | 初回candidate価格だけで安価認定せず、CASE-01と同じ適用scopeのretry・救援・rework・人修正込み総費用と既決priorityで判定する。 |
| `L10-LABO-059-CASE-31` | LABO-059-AC-03 | 歴史結果だけをcurrent性能へ転用 | current性能の主張を未評価とし、当時のscope/revisionに限定する。 |
| `L10-LABO-059-CASE-32` | LABO-059-AC-03 | AI稼働回数を人間介入回数へ算入 | AI runと人間介入を分離し、介入値を再計算する。 |
| `L10-LABO-059-CASE-33` | LABO-059-AC-03 | 索引（独立fixtureではない）: CASE-41〜43のprovider/API/token費用除外を分けて参照する。 | 各単独fixtureを参照し、複数費目を一つのfixtureに束ねない。 |
| `L10-LABO-059-CASE-34` | LABO-059-AC-03 | 索引（独立fixtureではない）: CASE-45のWorker/parent effort費用除外を参照する。 | 主fixture CASE-45を参照し、重複計上しない。 |
| `L10-LABO-059-CASE-35` | LABO-059-AC-03 | 索引（独立fixtureではない）: CASE-39/40/44のrollback/recovery/integration費用除外を分けて参照する。 | 各単独fixtureを参照し、複数費目を一つのfixtureに束ねない。 |
| `L10-LABO-059-CASE-36` | LABO-059-AC-03 | 索引（独立fixtureではない）: CASE-46/47の評価運転費用または対象作業費用の除外を分けて参照する。 | 各単独fixtureを参照し、両方向を別々に検証する。 |
| `L10-LABO-059-CASE-37` | LABO-059-AC-03 | 未完runを低費用成功へ変換 | 未完/unknownを保ち、accepted outcomeなしの低費用成功としない。 |
| `L10-LABO-059-CASE-38` | LABO-059-AC-03 | 未評価effortを`provider_default_unbenchmarked`値として確定扱い | 未評価と表示し、確定性能/費用に含めない。 |
| `L10-LABO-059-CASE-39` | LABO-059-AC-03 | rollback費用だけを総費用から除外 | 総費用を不完全とし成功比較にしない。rollback費用sourceまたはLABO-055の該当effort sourceが識別できればそこへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-40` | LABO-059-AC-03 | recovery費用だけを総費用から除外 | 総費用を不完全とし成功比較にしない。recovery費用sourceまたはLABO-055の該当effort sourceが識別できればそこへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-41` | LABO-059-AC-03 | provider費用だけを総費用から除外 | 総費用を不完全とし成功比較にしない。provider price sourceが識別できればLABO-055またはそこへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-42` | LABO-059-AC-03 | API費用だけを総費用から除外 | 総費用を不完全とし成功比較にしない。API price sourceが識別できればLABO-055またはそこへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-43` | LABO-059-AC-03 | token費用だけを総費用から除外 | 総費用を不完全とし成功比較にしない。token price sourceが識別できればLABO-055またはそこへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-44` | LABO-059-AC-03 | 単独変異: integration費用だけを総費用から除外。その他は `CASE-01` と同一。 | 総費用を不完全とし成功比較にしない。integration費用sourceが識別できればLABO-055または該当sourceへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-45` | LABO-059-AC-03 | Worker/parent effort費用だけを除外 | 総費用を不完全とし成功比較にしない。Worker/parent effortはLABO-055または識別可能なeffort sourceへ、identity不明ならunknown。 |
| `L10-LABO-059-CASE-46` | LABO-059-AC-03 | 評価運転費用だけを除外 | 対象作業と評価運転の費用範囲を片側だけにせず、比較を不完全にする。費用またはeffort evidence欠落はLABO-055/該当sourceへ返し、identity不明ならunknown。 |
| `L10-LABO-059-CASE-47` | LABO-059-AC-03 | 対象作業費用だけを除外 | 対象作業と評価運転の費用範囲を片側だけにせず、比較を不完全にする。費用またはeffort evidence欠落はLABO-055/該当sourceへ返し、identity不明ならunknown。 |

- `L10-LABO-059-CASE-48`（対応AC: LABO-059-AC-01）正常: 固定decisionが適用可能で、比較目的と選択scope内のquality pass候補が複数あるが、decisionの入力から候補間の優劣を導けない状態を与える。実測値やpriority/toleranceは作らない。期待oracleは同順位/判定不能/要人判断であり、万能rankingを出さない。

| CASE識別子 | 対応受入基準 | 入力状態／単独変異 | 期待結果／既存の戻し先 |
|---|---|---|---|
| `L10-LABO-059-CASE-49` | LABO-059-AC-03 | CASE-48の入力fieldをすべて固定し、出力relationだけを同順位/比較不能から全候補の万能順位へ変える。 | 出力変異を拒否し、L2-059:421どおり同順位/判定不能/要人判断を保つ。入力側の有効decisionやpriority/toleranceを変更しない。 |
| `L10-LABO-059-CASE-50` | LABO-059-AC-03 | 基準では対象work cohortの支援構成fieldは「HELIXなし」。この支援構成fieldだけを「HELIX componentあり」へ変える。no-HELIX claimと評価運転側OS assignmentは入力として固定する。 | 入力cohortの支援構成を読み、HELIXなしというclaimを拒否する。評価運転側OS assignmentと混ぜない。L2-059:420/426。 |
| `L10-LABO-059-CASE-51` | LABO-059-AC-03 | 現行実験のOS assignment receipt fieldだけをmissingにする。実験条件・結果等は基準のまま。receipt欠落を実assignment operation不存在へ読み替えない。 | assignmentを推定せず、当該run/resultをunknownまたは比較不能とし、L2-059:429のOS/観測source区分へ返す。 |
| `L10-LABO-059-CASE-52` | LABO-059-AC-03 | 他のfieldは基準のまま、receiptにある既知CI費用だけを総費用出力から除く。 | 総費用を不完全として成功費用比較を拒否する。金額や実CI実行値は作らない。L2-059:423/429の費用source区分。 |
| `L10-LABO-059-CASE-53` | LABO-059-AC-03 | 他のfieldは基準のまま、receiptにある既知rerun費用だけを総費用出力から除く。 | 総費用を不完全として成功費用比較を拒否する。金額や実rerun値は作らない。L2-059:423/429の費用source区分。 |
| `L10-LABO-059-CASE-54` | LABO-059-AC-03 | 他のfieldは基準のまま、receiptにある既知review費用だけを総費用出力から除く。 | 総費用を不完全として成功費用比較を拒否する。金額や実review値は作らない。L2-059:423/429の費用source区分。 |
| `L10-LABO-059-CASE-55` | LABO-059-AC-03 | 基準入力では人間調査の数量receiptをknownとして保つ。出力数量fieldだけを省く。費用receipt、入力数量、他のfieldは固定する。 | 入力の既知数量を保持したまま出力欠落を拒否し、比較を不完全と示す。貨幣費用とは別掲し、換算や0円化をしない。L2-059:423–424。 |
| `L10-LABO-059-CASE-56` | LABO-059-AC-03 | 基準入力では人間検証の数量receiptをknownとして保つ。出力数量fieldだけを省く。費用receipt、入力数量、他のfieldは固定する。 | 入力の既知数量を保持したまま出力欠落を拒否し、比較を不完全と示す。貨幣費用とは別掲し、換算や0円化をしない。L2-059:423–424。 |
| `L10-LABO-059-CASE-57` | LABO-059-AC-03 | 他のfieldとartifact identityは合成baselineのまま、artifact digestだけを別値へ変える。 | digest不一致のartifactを同一比較へ混ぜず、artifact sourceが特定できる場合は対応sourceへ、特定できない場合は戻し先unknown。L2-059:427/429。 |
| `L10-LABO-059-CASE-58` | LABO-059-AC-03 | 他のfieldとsource identityは合成baselineのまま、source revisionだけを変える。 | revision不一致のsource resultを混ぜず、OSまたは観測sourceへ。L2-059:427/429。 |
| `L10-LABO-059-CASE-59` | LABO-059-AC-03 | 他のfieldとWorker revisionは合成baselineのまま、Worker identityだけを別identityへ変える。 | assignment/result identityを混ぜず、assignment/receipt側の原因はOSまたは観測sourceへ返す。L2-059:427/429。 |
| `L10-LABO-059-CASE-60` | LABO-059-AC-03 | 他のfieldとmodel identityは合成baselineのまま、model versionだけを別値へ変える。 | 異なるmodel versionの結果を同一比較に混ぜず、LABO-055または該当sourceへ。provider labelとは別field。L2-059:427/429。 |
| `L10-LABO-059-CASE-61` | LABO-059-AC-03 | 他のfieldとeffort evidence class/valueは合成baselineのまま、そのeffort evidence identityだけを別identityへ変える。 | 異なるeffort evidenceを同一比較に混ぜず、LABO-055または該当sourceへ。L2-059:427/429。 |
| `L10-LABO-059-CASE-62` | LABO-059-AC-03 | 他のfieldとprice source identityは合成baselineのまま、price source versionだけを変える。currency/effective time/classは固定する。 | 異なるprice source versionを混ぜず、price/測定sourceへ。L2-059:427/429。 |
| `L10-LABO-059-CASE-63` | LABO-059-AC-03 | 入力と測定は固定し、出力claim scopeだけを実際に測定したcohort/task/conditionの外へ広げる。 | claimを証拠が支える範囲へ限定し、未見一般化を保証しない。L2-059:428。 |
| `L10-LABO-059-CASE-64` | LABO-059-AC-03 | provider表示labelだけを入力で変更する。actual provider identity/versionとmodel identity/version、effort、task、測定、oracle、scopeは固定する。 | provider labelによる固定加点/減点を拒否しscoreを変えない。実model identityはCASE-60のfieldで区別する。L2-059:428および旧R-03再導出。 |
| `L10-LABO-059-CASE-65` | LABO-059-AC-03 | 入力と他の出力は固定し、LABOの出力field target changeだけに新しい作用/値を生成する。 | LABO evidenceからtarget changeを生成せず、変更権限は既存境界に残す。 固定親に指定のない戻し先・owner・権限を新設しない。L2-059:428。 |
| `L10-LABO-059-CASE-66` | LABO-059-AC-03 | 入力と他の出力は固定し、LABOの出力field registrationだけに新しい作用/値を生成する。 | registrationを生成しない。 固定親に指定のない戻し先・owner・権限を新設しない。L2-059:428。 |
| `L10-LABO-059-CASE-67` | LABO-059-AC-03 | 入力と他の出力は固定し、LABOの出力field routingだけに新しい作用/値を生成する。 | routingを生成しない。 固定親に指定のない戻し先・owner・権限を新設しない。L2-059:428。 |
| `L10-LABO-059-CASE-68` | LABO-059-AC-03 | 入力と他の出力は固定し、LABOの出力field ticket issuanceだけに新しい作用/値を生成する。 | ticketを起票しない。 固定親に指定のない戻し先・owner・権限を新設しない。L2-059:428。 |
| `L10-LABO-059-CASE-69` | LABO-059-AC-03 | 入力と他の出力は固定し、LABOの出力field permissionだけに新しい作用/値を生成する。 | permissionを変更しない。 固定親に指定のない戻し先・owner・権限を新設しない。L2-059:428。 |
| `L10-LABO-059-CASE-70` | LABO-059-AC-03 | 入力と他の出力は固定し、LABOの出力field merge authorityだけに新しい作用/値を生成する。 | merge authorityを変更しない。 固定親に指定のない戻し先・owner・権限を新設しない。L2-059:428。 |


#### CASE索引と分類

既存a4a365由来CASE60件はすべて保持する。CASE-30は複数費目を含む既存compound、CASE-22/33/34/35/36は非独立indexであり、独立negativeへ再分類しない。CASE-01/02を正常fixtureとし、既存の独立negative52件を保つ。追加はCASE-48正常1件、CASE-49–70 negative22件である。追加negativeは単独変異（入力field 9件、固定入力からの出力変異13件）として定義し、CASE-64だけはprovider label入力を変えscore不変を期待する。独立fixtureの設計数は既存54＋追加23＝77、別に既存compound1・index5を定義として保持する。実行・合格・実測数ではない。


### CASE-LABO-060 — 支援有無の同一設定比較

以下は固定f6dad2aのL2/L11から設計した未実行fixture候補であり、合成givenを実測・実権限・実運用と扱わない。現行分類案は正常候補2、negative候補47、非独立索引候補8。単一点性・独立性は独立review未確認であり、57個のID保持や一意性はfixture集合の完全性を証明しない。索引候補は独立fixture・negative分母へ重ねない。既存a4a365の51 IDを保持し、責務境界の誤出力を照合するCASE-47–52を追加する。

- `L10-LABO-060-CASE-01`（対応AC: `LABO-060-AC-01`） 正常候補（合成fixture）: 同一task snapshot・要求/設計revision/scope・環境・toolchain/run protocol・元Worker/model identityとmodel/provider/version/effort設定、開始前固定のHARNESS-L2-022 oracle、対応するOS assignment/result receiptを与え、新規比較runでは適用されるSECURITY許可も保持する。固定L11:181の例に沿い、両runで`PATCH /applications/{id}`のdraft編集は受理し、approved編集は拒否して保存値を変えない。支援側のみINTELLIGENCEがstate/API設計、validator code、過去regression exampleを選び、approved境界で詰まった元Workerへ限定相談と修正指示を渡す。元Workerが修正し、元Worker・INTELLIGENCE支援者のいずれともidentity/context/authorityを区別したindependent reviewerが確認した後、HELIXOS-L2-020が事前oracleを再実行してpassする。支援側の追加model/provider、相談、再実行、review、人作業時間・実費を保持し、対照runへの助言漏れがない。これは実測済みrunの主張ではない。
- `L10-LABO-060-CASE-02`（対応AC: `LABO-060-AC-02`） 未見正常候補（合成fixture）: 未見task T*内で支援あり/なしのmatched pairを与える。両runのtask snapshot・scope・対象revision・environment/protocol・元Worker/model/provider/version/effort・当該taskの固定oracle・OS assignment/結果receiptをそろえ、新規比較runでは適用されるSECURITY許可も保持し、対象支援経路の利用有無だけを比較する。実際に選択したsupport sourceと相談のみを記録し、未選択経路を実行依存にしない。両runは当該taskのoracleと矛盾しない結果を返すが、一taskの結果を一般有効性へ拡張しない。実測済みrunの主張ではない。

| CASE ID | 対応AC | 単一の入力変異または索引先 | 期待oracle / 既存戻し先 |
|---|---|---|---|
| `L10-LABO-060-CASE-03a` | `LABO-060-AC-03` | 群間の元Worker model identityだけが異なる（選択された追加support modelは別fieldとして固定し、その追加費用/evidenceは入力に保持） | 同一設定比較を拒否する。支援側で追加選択されたmodel自体を一律禁止しない。 |
| `L10-LABO-060-CASE-03b` | `LABO-060-AC-03` | 対照runに助言contextだけが漏れる | 対照runを支援なし群と認定せず、支援有無比較を未評価に保ち成功比較を出さない。 |
| `L10-LABO-060-CASE-03c` | `LABO-060-AC-03` | oracle revisionだけ異なる | 比較を未評価にしHARNESSへ戻す。 |
| `L10-LABO-060-CASE-03d` | `LABO-060-AC-03` | 支援者時間だけ欠落 | 効果/総費用を確定しない。 |
| `L10-LABO-060-CASE-03e` | `LABO-060-AC-03` | 片方のOS result receiptだけ欠落 | 比較不能としてOSへ戻す。 |
| `L10-LABO-060-CASE-04a` | `LABO-060-AC-03` | LABOがrun/相談を開始 | 拒否。OS/既存相談ownerへ。 戻し先: OS。 |
| `L10-LABO-060-CASE-04b` | `LABO-060-AC-03` | LABOが支援結果からassignmentを作成 | 拒否。OS assignmentを不変にする。 |
| `L10-LABO-060-CASE-05` | `LABO-060-AC-03` | 群間の元Worker provider設定だけが異なる（support側の追加provider/model利用は選択source・費用evidenceとして入力に保持） | 同一設定比較を不成立にする。追加support providerの使用は一律禁止しない。 |
| `L10-LABO-060-CASE-06` | `LABO-060-AC-03` | 群間の元Worker model version設定だけが異なる（追加support model/versionは別の選択入力として固定） | 同一設定比較を不成立にする。追加support resourceを一律禁止しない。 |
| `L10-LABO-060-CASE-07` | `LABO-060-AC-03` | 群間の元Worker effort設定だけが異なる（支援が追加するeffortと人作業時間は入力・費用として保持） | 同一設定比較を不成立にする。支援に伴う追加effort自体は測定対象に残す。 |
| `L10-LABO-060-CASE-08` | `LABO-060-AC-03` | 単独変異: task identity だけ異なる。その他の入力は `CASE-01` と同一。 | 同一設定比較を未評価にしOSのtask/run receipt ownerへ戻す。 |
| `L10-LABO-060-CASE-09` | `LABO-060-AC-03` | 単独変異: scope だけ異なる。その他の入力は `CASE-01` と同一。 | 同一設定比較不成立 戻し先: LABO。 |
| `L10-LABO-060-CASE-10` | `LABO-060-AC-03` | 単独変異: toolchain だけ異なる。その他の入力は `CASE-01` と同一。 | 比較不能にし、toolchain receiptのsource ownerが特定できればそのowner、特定不能ならunknown。 |
| `L10-LABO-060-CASE-11` | `LABO-060-AC-03` | 単独変異: protocol だけ異なる。その他の入力は `CASE-01` と同一。 | 比較不能にし、task/run protocol receiptはOS、比較scopeはLABOへ戻す。 |
| `L10-LABO-060-CASE-12` | `LABO-060-AC-03` | 単独変異: price source だけ欠落。その他の入力は `CASE-01` と同一。 | 費用unknown、0補完なし。price source ownerが識別できればそこへ戻す。 |
| `L10-LABO-060-CASE-13` | `LABO-060-AC-03` | 単独変異: currency だけ欠落。その他の入力は `CASE-01` と同一。 | 換算せず金額比較unknown。currency source ownerが識別できればそこへ戻す。 |
| `L10-LABO-060-CASE-14` | `LABO-060-AC-03` | 単独変異: effective time だけ欠落。その他の入力は `CASE-01` と同一。 | 適用価格unknown。price source ownerが識別できればそこへ戻す。 |
| `L10-LABO-060-CASE-15` | `LABO-060-AC-03` | 単独変異: helper identity receiptだけ欠落。その他の入力は `CASE-01` と同一。 | 支援者情報欠落fieldをunknownにし支援効果を確定しない 戻し先: OS。 |
| `L10-LABO-060-CASE-16` | `LABO-060-AC-03` | 選択INTELLIGENCE proposal/use packetに結ぶhandoff receiptだけ欠落 | 利用済みと扱わない。欠けた証拠がINTELLIGENCE proposal/use sourceならINTELLIGENCEへ、OS handoff receiptならOSへ返し、ownerを特定できない欠落はunknownに保つ。 |
| `L10-LABO-060-CASE-17` | `LABO-060-AC-03` | 単独変異: 選択されたINTELLIGENCE proposal/use evidenceに結ばれるreviewer identityだけがhelper identityと同一。その他の入力は `CASE-01` と同一。 | 比較条件不成立とし、成功比較を出さない。comparison scope/evaluation capabilityの未完は固定L2-060の比較範囲に従いLABOへ返す。 |
| `L10-LABO-060-CASE-18` | `LABO-060-AC-03` | baseline入力: 固定HARNESS oracleでquality不成立。単独の誤出力変異: 低support costを理由に不成立qualityを成功/比較成功へ変換 | quality不成立・非相殺を維持し、成功比較を出さない。comparison scope/evaluation capabilityの戻し先はLABO。 |
| `L10-LABO-060-CASE-19` | `LABO-060-AC-03` | baseline: 選択sourceは設計/validator/regressionのみ、相談経路は未選択。その他の比較条件・receipt・oracleは正常。単独の誤出力変異: 未選択相談receiptを必須化する。 | 未選択相談を比較全体の必須依存にしない。選択時だけ必要なreceiptと区別し、比較scopeの誤った必須化はLABOへ戻す。 |
| `L10-LABO-060-CASE-20` | `LABO-060-AC-03` | baseline入力: CASE-01と同じ正常な費用evidenceを保持。単独の誤出力変異: 追加支援者費用だけを比較費用から除外する。 | 費用内訳不完全を示し、比較費用を確定しない。入力sourceの欠落と取り違えず、比較集計の誤りは固定L2-060のcomparison scope/evaluation capabilityの責務であるLABOへ戻す。LABO-055へ価格/effort source所有を移さない。 |
| `L10-LABO-060-CASE-21` | `LABO-060-AC-03` | baseline入力: human-time quantityは既知、換算率/price evidenceはunknown。単独の誤出力変異: 出力貨幣費用を0とする | 既知時間量を保持し、金額だけ未確定とする。0円化と時間量の消去を拒否する。 |
| `L10-LABO-060-CASE-22` | `LABO-060-AC-03` | 索引（独立fixtureではない）: 選択runのSECURITY data-use/実行許可欠落CASE-34を参照する。 | 主fixture CASE-34を参照し、許可不足を成功扱いしない。 |
| `L10-LABO-060-CASE-23` | `LABO-060-AC-03` | 索引（独立fixtureではない）: `L10-LABO-060-CASE-15`と同一の単独入力変異。 | 主fixture `L10-LABO-060-CASE-15` のoracleを参照し、同じケースを重複計上しない。 |
| `L10-LABO-060-CASE-24` | `LABO-060-AC-03` | 単独変異: helper version だけ欠落。その他の入力は `CASE-01` と同一。 | 支援比較未完。 戻し先: OS。 |
| `L10-LABO-060-CASE-25` | `LABO-060-AC-03` | 単独変異: helper effort だけ欠落。その他の入力は `CASE-01` と同一。 | 支援費用/効果未完。 戻し先: OS。 |
| `L10-LABO-060-CASE-26` | `LABO-060-AC-03` | 索引（独立fixtureではない）: `L10-LABO-060-CASE-16` のINTELLIGENCE proposal/use packet receipt欠落だけを参照する | 主fixture CASE-16のoracleへ到達する。同じ変異を独立negativeに重複計上しない。 |
| `L10-LABO-060-CASE-27` | `LABO-060-AC-03` | 索引（独立fixtureではない）: `L10-LABO-060-CASE-28` のOS handoff receipt欠落だけを参照する | 主fixture CASE-28のoracleへ到達する。同じ変異を独立negativeに重複計上しない。 |
| `L10-LABO-060-CASE-28` | `LABO-060-AC-03` | 単独変異: 選択sourceに対するOS handoff receiptだけ欠落。その他の入力は `CASE-01` と同一。 | 選択source利用の受領を確定せず、OS handoff/register責務に不足を返す。 |
| `L10-LABO-060-CASE-29` | `LABO-060-AC-03` | 索引（独立fixtureではない）: `L10-LABO-060-CASE-34` の選択run SECURITY data-use/実行許可欠落を参照する | CASE-34のpermission oracleへ到達する。CASE-22/29を独立fixtureに数えない。 |
| `L10-LABO-060-CASE-30` | `LABO-060-AC-03` | 索引（独立fixtureではない）: OS assignment欠落CASE-36を参照する。 | 主fixture CASE-36を参照し、割当証拠の欠落を成功扱いしない。 |
| `L10-LABO-060-CASE-31` | `LABO-060-AC-03` | 索引（独立fixtureではない）: HARNESS-L2-022 oracle契約事前固定欠落CASE-37を参照する。 | 主fixture CASE-37を参照し、oracle契約を事前固定しない比較を未評価とする。 |
| `L10-LABO-060-CASE-32` | `LABO-060-AC-03` | 索引（独立fixtureではない）: 選択INTELLIGENCE proposal/source欠落CASE-43を参照する。 | 主fixture CASE-43を参照し、選択支援sourceの証拠を欠落のまま保持する。 |
| `L10-LABO-060-CASE-33` | `LABO-060-AC-03` | 単独変異: 選択history主張のhistorical receiptだけ欠落。その他の入力は `CASE-01` と同一。 | history主張の根拠不足のまま未評価とし、historical receiptのsource ownerへ戻す。 |
| `L10-LABO-060-CASE-34` | `LABO-060-AC-03` | 選択runのSECURITY data-use/実行許可だけ欠落 | 該当runを許可済み扱いせず、SECURITYへ戻す。 |
| `L10-LABO-060-CASE-35` | `LABO-060-AC-03` | 選択runのevidence revisionだけstale | そのrunを比較不能にし、該当source ownerへ戻す。 |
| `L10-LABO-060-CASE-36` | `LABO-060-AC-03` | OS assignmentだけ欠落 | 実行結果を比較証拠とせずOSへ戻す。 |
| `L10-LABO-060-CASE-37` | `LABO-060-AC-03` | HARNESS-L2-022 oracle契約の事前固定だけ欠落 | oracle比較を未評価にしHARNESS/要求ownerへ戻す。 |
| `L10-LABO-060-CASE-38` | `LABO-060-AC-03` | 選択比較母集団中のrunを一件だけ黙って除外 | 母集団不完全として比較を未評価にする。 |
| `L10-LABO-060-CASE-39` | `LABO-060-AC-03` | retry費用/時間だけ欠落 | 該当内訳をunknownとし、総費用/効果比較を確定しない。 |
| `L10-LABO-060-CASE-40` | `LABO-060-AC-03` | rework費用/時間だけ欠落 | 該当内訳をunknownとし、総費用/効果比較を確定しない。 |
| `L10-LABO-060-CASE-41` | `LABO-060-AC-03` | review費用/時間だけ欠落 | 該当内訳をunknownとし、総費用/効果比較を確定しない。 |
| `L10-LABO-060-CASE-42` | `LABO-060-AC-03` | CI費用/時間だけ欠落 | 該当内訳をunknownとし、総費用/効果比較を確定しない。 |
| `L10-LABO-060-CASE-43` | `LABO-060-AC-03` | 選択support proposal/use evidenceの欠落だけ（欠けたevidence fieldは入力上特定可能） | 利用済みと扱わない。proposal/use source欠落はINTELLIGENCEへ、OS handoff/assignment receipt欠落はOSへ原因別に返す。field/ownerを特定できなければunknownを保持する。 |
| `L10-LABO-060-CASE-44` | `LABO-060-AC-03` | 選択母集団に含まれるfailed runだけを除外 | failed stateを保持し、比較母集団を不完全とする。該当run receiptはOSへ戻す。 |
| `L10-LABO-060-CASE-45` | `LABO-060-AC-03` | 選択母集団に含まれるunknown runだけを除外 | unknownを成功/失敗へ変換せず、比較母集団を不完全とする。該当run receiptはOSへ戻す。 |
| `L10-LABO-060-CASE-46` | `LABO-060-AC-03` | 未見類似taskでHARNESS oracleの適用性だけunknown。片群receipt、支援者時間、比較scopeはCASE-01と同一 | 非適用と推測せず未評価/比較不能を保つ。oracle適用性の既存戻し先はHARNESS/requirement owner。 |

追加CASE-47–52の正常入力と比較出力はCASE-01と同じ。比較可能性・quality・効果evidenceを返す正当な出力、既存INTELLIGENCE proposal参照、OS assignment/result receipt、入力authority evidenceを固定する。各fixtureではLABO出力の次の一判断だけを追加し、その他の入力・比較結果・source状態は変更しない。合成の誤出力であり、実際のproposal発行・採用・配置・承認・mergeは行わない。

| CASE ID | 対応AC | 固定入力からの単独誤出力変異 | 期待oracle / 既存責務境界 |
|---|---|---|---|
| `L10-LABO-060-CASE-47` | `LABO-060-AC-03` | INTELLIGENCEの支援proposalをLABO自身の決定として出力する。 | 当該誤出力を拒否し、proposalを決めずINTELLIGENCEの既存proposal責務を保持する。比較可能性・quality・効果evidenceは保持し、正当な材料返却を誤拒否しない。比較出力の越権はLABO評価へ戻し、具体的なauthority ownerは入力の既存identityで追跡し不明ならunknownを保持する。 |
| `L10-LABO-060-CASE-48` | `LABO-060-AC-03` | INTELLIGENCEのWorker推奨をLABO自身の決定として出力する。 | 当該誤出力を拒否し、推奨を決めずINTELLIGENCEへ評価材料のみ返す。比較可能性・quality・効果evidenceは保持し、正当な材料返却を誤拒否しない。比較出力の越権はLABO評価へ戻し、具体的なauthority ownerは入力の既存identityで追跡し不明ならunknownを保持する。 |
| `L10-LABO-060-CASE-49` | `LABO-060-AC-03` | 比較結果から対象支援経路の採用をLABOが確定する。 | 当該誤出力を拒否し、採用判断を生成せず、入力の既存採否authorityを変更しない。比較可能性・quality・効果evidenceは保持し、正当な材料返却を誤拒否しない。比較出力の越権はLABO評価へ戻し、具体的なauthority ownerは入力の既存identityで追跡し不明ならunknownを保持する。 |
| `L10-LABO-060-CASE-50` | `LABO-060-AC-03` | 比較結果からWorker配置水準をLABOが確定する。 | 当該誤出力を拒否し、配置水準を生成せず、INTELLIGENCE/OSへの評価材料に留める。比較可能性・quality・効果evidenceは保持し、正当な材料返却を誤拒否しない。比較出力の越権はLABO評価へ戻し、具体的なauthority ownerは入力の既存identityで追跡し不明ならunknownを保持する。 |
| `L10-LABO-060-CASE-51` | `LABO-060-AC-03` | 比較結果から対象revisionの受入authorityをLABOが生成する。 | 当該誤出力を拒否し、受入authorityを生成せず、既存対象revisionのauthorityを保持する。比較可能性・quality・効果evidenceは保持し、正当な材料返却を誤拒否しない。比較出力の越権はLABO評価へ戻し、具体的なauthority ownerは入力の既存identityで追跡し不明ならunknownを保持する。 |
| `L10-LABO-060-CASE-52` | `LABO-060-AC-03` | 比較結果から対象HEADのmerge authorityをLABOが生成する。 | 当該誤出力を拒否し、merge authorityを生成せず、既存対象HEADのauthorityを保持する。比較可能性・quality・効果evidenceは保持し、正当な材料返却を誤拒否しない。比較出力の越権はLABO評価へ戻し、具体的なauthority ownerは入力の既存identityで追跡し不明ならunknownを保持する。 |

## Stage 5 — HELIXLABO-L2-061 L10 fixture候補


対象は選択taskの比較適格性と履歴整合である。すべて合成fixture候補であり、実行・受入・権限・資格を生成しない。CASE-01/02はnormal/未見normal。旧a4 snapshot由来のCASE定義132 IDを保持する（表130、normal bullet 2）。索引は非独立で分母に重ねず、個別fixture扱い/網羅性は独立reviewで確かめる。15 fieldはtask ID/version、fixture digest、requirement IDs、acceptance IDs、base HEAD、allowed/forbidden paths、hidden-oracle digest、seed、toolchain versions、timeout/retry/cache policy、hardware class。missing/value unknown/stale/mismatchを区別する。

| CASE ID | 対応AC | 準備・一つの変異または索引 | 期待oracle / 責務境界 |
|---|---|---|---|
| `L10-LABO-061-CASE-01` | `LABO-061-AC-01` | 正常: 選択比較のtask ID/version、fixture digest、requirement/acceptance IDs、base HEAD、allowed/forbidden paths、hidden-oracle digest、seed、toolchain versions、timeout/retry/cache policy、hardware classを個別fieldとしてtask snapshotへ結び、適用時のcontext/author/judge/run receiptも保持する。 | 正常系の比較適格/同条件保持を照合する。 |
| `L10-LABO-061-CASE-02` | `LABO-061-AC-02` | 未見正常: 選択契約内の未見fixtureを同じ適用条件で照合し、明示非適用fieldは根拠つきで非適用とする。 | 正常系の比較適格/同条件保持を照合する。 |
| `L10-LABO-061-CASE-03a` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-34の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03b` | `LABO-061-AC-03` | baselineはCASE-01と同じ選択task契約。単独変異: oracle revisionだけが適用契約とstale。 | 当該task比較を成立扱いせず、固定task/oracle ownerへ戻す。入力から具体owner identityを識別できる場合だけ示し、識別できなければowner identity unknownを保つ。 |
| `L10-LABO-061-CASE-03c` | `LABO-061-AC-03` | Worker-visible contextだけ漏洩。 | 比較を無効にし、SECURITYへ常に戻す。漏洩元を識別できる場合は入力source ownerへも戻し、source identity不明時だけsource ownerをunknownとする。 |
| `L10-LABO-061-CASE-03d` | `LABO-061-AC-03` | 索引（独立fixtureではない）: author/judge同一の `L10-LABO-061-CASE-12` と、identity名は異なるがcontext/session共有の `L10-LABO-061-CASE-13` を参照する。二つの独立した反例をこの索引だけで二重計上しない。 | CASE-12/13各々のoracleを直接照合し、この行を独立negativeに含めない。 |
| `L10-LABO-061-CASE-03e` | `LABO-061-AC-03` | 単独変異: 選択task契約に記録されたhidden oracle適用性だけunknown。その他の入力はCASE-01と同一。 | 非適用と推論せずunknownを保持し、固定task/oracle ownerへ返す。入力から具体owner identityを識別できない場合はidentity unknown。 |
| `L10-LABO-061-CASE-03f` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-28の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03t` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-31の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03g` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-35の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03h` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-39の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03i` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-42の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03j` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-45の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03k` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-46の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03l` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-51の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03m` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-52の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03n` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-57の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03o` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-60の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03p` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-61の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03q` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-66の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03r` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-67の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-03s` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-72の同一変異を参照する。 | 主fixtureを参照し、同じ変異を二重計上しない。 |
| `L10-LABO-061-CASE-04a` | `LABO-061-AC-03` | 単独の誤出力: LABOが固定task/oracle契約を自ら変更した、または変更権限があると主張する。入力契約・source identityはCASE-01と同じ。 | 変更を拒否し、task/oracle条件不明・不一致は既存task/oracle ownerへ返す。新しい変更権限を生成しない。 |
| `L10-LABO-061-CASE-24` | `LABO-061-AC-01` | 正常: canonical judge oracleは秘匿されたままjudgeが検証に使い、Workerへ答えを見せない。 | canonical judge oracleの使用をWorker leakageと誤分類せず、他の条件が揃う比較を有効に保つ。 |
| `L10-LABO-061-CASE-25` | `LABO-061-AC-03` | 索引（独立fixtureではない）: `L10-LABO-061-CASE-21`と同一の単独入力変異。 | 主fixture `L10-LABO-061-CASE-21` のoracleを参照し、同じケースを重複計上しない。 |
| `L10-LABO-061-CASE-26` | `LABO-061-AC-03` | 索引（独立fixtureではない）: `L10-LABO-061-CASE-22`と同一の単独入力変異。 | 主fixture `L10-LABO-061-CASE-22` のoracleを参照し、同じケースを重複計上しない。 |
| `L10-LABO-061-CASE-27` | `LABO-061-AC-03` | 索引（独立fixtureではない）: `L10-LABO-061-CASE-23`と同一の単独入力変異。 | 主fixture `L10-LABO-061-CASE-23` のoracleを参照し、同じケースを重複計上しない。 |
| `L10-LABO-061-CASE-73` | `LABO-061-AC-03` | 準備: L10-LABO-061-CASE-01と同じ比較入力に、identityと失敗状態を正しく保持した失敗runを1件加える。単独変異: そのrunの不成立だけを他runの成功平均で相殺する。 | 失敗状態を保持し、成功へ読み替えない。 |
| `L10-LABO-061-CASE-74` | `LABO-061-AC-03` | 索引（独立fixtureではない）: `L10-LABO-061-CASE-82`〜`L10-LABO-061-CASE-86`のmodel/runtime/toolchain/actor/version個別欠落を参照する。 | 各単独CASEのoracleを使い、5条件を一変異へ束ねない。 |
| `L10-LABO-061-CASE-75` | `LABO-061-AC-03` | 055通常履歴へhidden判定条件を強制 | 非選択の通常履歴にblind条件を要求しない。 |
| `L10-LABO-061-CASE-76` | `LABO-061-AC-03` | snapshot完全だが059 quality oracle不合格 | 完全性と品質を別判定し、品質不成立を保持する。 |
| `L10-LABO-061-CASE-77` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-103〜106のassignment、permission、admission、judge任命とL10-LABO-061-CASE-113のqualification主張を個別参照する。 | 各主fixtureのoracleを使い、異なる権限/資格を一変異として数えない。 |
| `L10-LABO-061-CASE-78` | `LABO-061-AC-03` | 適用field名だけ存在し値が空 | 値欠落としてunknown/未評価とし、field存在を値ありと扱わない。 |
| `L10-LABO-061-CASE-79` | `LABO-061-AC-03` | 単独変異: 別runのsnapshotだけを選択比較へ流用する。元runのsnapshot/receiptと選択run identityはCASE-01のまま。 | run identity不一致として比較から除外し、元receipt・不一致理由・対象範囲は履歴へ保持する。receiptを削除/成功扱いしない。 |
| `L10-LABO-061-CASE-80` | `LABO-061-AC-03` | 索引（独立fixtureではない）: `L10-LABO-061-CASE-11`と同一のrequired real-context reference欠落を参照する。 | 主fixtureL10-LABO-061-CASE-11を参照し、同一欠落を二重計上しない。 |
| `L10-LABO-061-CASE-81` | `LABO-061-AC-03` | 単独変異: 漏洩検出時の入力source identityだけ未記録。 | 漏洩runを無効/未評価とし、漏洩判定/許可境界は常にSECURITYへ返す。source owner identityは特定できずunknownとして保持する。 |
| `L10-LABO-061-CASE-82` | `LABO-061-AC-03` | 単独変異: historical runの当時model記録だけ欠落。その他のhistory/task条件はCASE-01と同一。 | historical条件unknownとし、current modelで補わない。欠落した実行証拠は実行主体へ戻し、入力から主体を識別できなければidentity unknownを保つ。 |
| `L10-LABO-061-CASE-83` | `LABO-061-AC-03` | 単独変異: historical runの当時runtime記録だけ欠落。その他のhistory/task条件はCASE-01と同一。 | historical条件unknownとし、current runtimeで補わない。欠落した実行証拠は実行主体へ戻し、入力から主体を識別できなければidentity unknownを保つ。 |
| `L10-LABO-061-CASE-84` | `LABO-061-AC-03` | 単独変異: historical runの当時toolchain記録だけ欠落。その他のhistory/task条件はCASE-01と同一。 | historical条件unknownとし、current toolchainで補わない。欠落した実行証拠は実行主体へ戻し、入力から主体を識別できなければidentity unknownを保つ。 |
| `L10-LABO-061-CASE-85` | `LABO-061-AC-03` | 単独変異: historical runの当時actor記録だけ欠落。その他のhistory/task条件はCASE-01と同一。 | 実行者unknownとして保持し、current actorで埋めない。記録責務を持つ実行主体を入力から識別できない場合はidentity unknown。 |
| `L10-LABO-061-CASE-86` | `LABO-061-AC-03` | 単独変異: historical runの当時version conditionだけsnapshotから欠落。fieldの厳密な物理identityは未特定。 | historical runをcurrent比較へ流用しない。version field/sourceを推測で確定せず、task/oracle condition unknownとして保持する。 |
| `L10-LABO-061-CASE-05` | `LABO-061-AC-03` | 単独変異: hidden answerを無害な分類labelとして露出だけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | run不適格; SECURITYへ常に返す。漏洩元を識別できる場合は入力source ownerへも返し、source identity不明時だけsource ownerをunknownとする。 |
| `L10-LABO-061-CASE-06` | `LABO-061-AC-03` | 単独変異: 将来の答えの露出だけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | run不適格; SECURITYへ常に返す。漏洩元を識別できる場合は入力source ownerへも返し、source identity不明時だけsource ownerをunknownとする。 |
| `L10-LABO-061-CASE-07` | `LABO-061-AC-03` | 単独変異: secret dataの露出だけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | run不適格; SECURITYへ常に返す。漏洩元を識別できる場合は入力source ownerへも返し、source identity不明時だけsource ownerをunknownとする。 |
| `L10-LABO-061-CASE-08` | `LABO-061-AC-03` | 単独変異: PIIの露出だけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | run不適格; SECURITYへ常に返す。漏洩元を識別できる場合は入力source ownerへも返し、source identity不明時だけsource ownerをunknownとする。 |
| `L10-LABO-061-CASE-09` | `LABO-061-AC-03` | 単独変異: 非公開review内容の露出だけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | run不適格; SECURITYへ常に返す。漏洩元を識別できる場合は入力source ownerへも返し、source identity不明時だけsource ownerをunknownとする。 |
| `L10-LABO-061-CASE-10` | `LABO-061-AC-03` | 単独変異: 派生添付からrestricted contentが漏洩だけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | run不適格とし、常にSECURITYへ返す。漏洩した添付の入力sourceが識別できればそのownerへも返し、source identity不明時だけsource ownerをunknownとする。 |
| `L10-LABO-061-CASE-11` | `LABO-061-AC-03` | 単独変異: required real-context referenceの欠落だけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | 未確認のまま隔離済みと推定せず、実行context/assignment evidenceは実行主体へ戻す。実行主体を入力で識別できない場合はidentity unknownを保つ。 |
| `L10-LABO-061-CASE-12` | `LABO-061-AC-03` | 単独変異: 作成者が同じartifactをjudgeすることだけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | 独立judge条件を成立扱いせず、比較を未評価のまま保つ。 |
| `L10-LABO-061-CASE-13` | `LABO-061-AC-03` | 単独変異: judge名は異なるがcontext/sessionを共有することだけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | context共有として独立性を成立扱いせず、比較を未評価のまま保つ。 |
| `L10-LABO-061-CASE-14` | `LABO-061-AC-03` | 単独変異: fixture versionだけ異なる。その他の入力は `L10-LABO-061-CASE-01` と同一。 | cohortを分離して未評価とし、固定L2のtask/oracle ownerへ返す。 |
| `L10-LABO-061-CASE-15` | `LABO-061-AC-03` | 単独変異: protocol versionだけ異なる。その他の入力は `L10-LABO-061-CASE-01` と同一。 | cohortを分離して未評価とし、固定L2のtask/oracle ownerへ返す。 |
| `L10-LABO-061-CASE-16` | `LABO-061-AC-03` | 単独変異: scorer version だけ異なる。その他の入力は `L10-LABO-061-CASE-01` と同一。 | cohortを分離して未評価とし、固定L2のtask/oracle ownerへ返す。具体identityが入力から特定できない部分はunknownとして保持する。 |
| `L10-LABO-061-CASE-17` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `fixture_digest`だけが固定digestと異なる。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | exact fixture evidenceを結ばず比較不能にし、固定L2のtask/oracle ownerへ返す。 |
| `L10-LABO-061-CASE-18` | `LABO-061-AC-03` | 単独変異: selected taskのhidden applicabilityだけを根拠なくnot-applicableへ変える。その他はCASE-01と同一。 | N/A化を拒否しunknownを保つ。固定task/oracle ownerへ戻す。入力からHARNESSを識別できる場合だけHARNESSとし、identity不明ならunknown。 |
| `L10-LABO-061-CASE-19` | `LABO-061-AC-03` | 単独変異: canonical judge oracleをWorker漏洩と誤分類だけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | oracle提示とWorker-visible漏洩を区別し正常比較を保つ 戻し先: LABO。 |
| `L10-LABO-061-CASE-20` | `LABO-061-AC-03` | 単独変異: historical resultを後からcurrent comparisonへ割当だけを変更。その他の入力は `L10-LABO-061-CASE-01` と同一。 | current cohortへ遡及流用せず、LABO比較を未完に保つ。 |
| `L10-LABO-061-CASE-21` | `LABO-061-AC-03` | 単独変異: actor identityだけ欠落。その他の入力はCASE-01と同一。 | runを比較可能とせずactor identity unknownを保つ。入力でOSの実行主体を識別できる場合だけOSへ戻し、具体identityを識別できなければ実行主体identity unknownとする。 |
| `L10-LABO-061-CASE-22` | `LABO-061-AC-03` | 単独変異: permission evidence だけ欠落。その他の入力は `L10-LABO-061-CASE-01` と同一。 | 許可済み比較としない 戻し先: SECURITY。 |
| `L10-LABO-061-CASE-23` | `LABO-061-AC-03` | 単独変異: run receiptだけ欠落。その他の入力はCASE-01と同一。 | runを比較可能とせずreceipt不足を保持する。入力でOSのreceipt発行主体を識別できる場合だけOSへ戻し、識別できなければ実行主体identity unknownとする。 |
| `L10-LABO-061-CASE-28` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `task_id`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-29` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `task_id`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-30` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `task_id`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-31` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `task_version`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-32` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `task_version`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-33` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `task_version`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-34` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `fixture_digest`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: 固定L2のtask/oracle owner。 |
| `L10-LABO-061-CASE-35` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `fixture_digest`だけが記録後staleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: 固定L2のtask/oracle owner。 |
| `L10-LABO-061-CASE-36` | `LABO-061-AC-03` | 索引（独立fixtureではない）: L10-LABO-061-CASE-17と同じ選択task `fixture_digest`不一致を参照する。 | L10-LABO-061-CASE-17を主fixtureとして直接参照し、同じfield変異を二重計上しない。 |
| `L10-LABO-061-CASE-37` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `requirement_ids`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: 固定task/oracle owner。 |
| `L10-LABO-061-CASE-38` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `requirement_ids`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: 固定task/oracle owner。 |
| `L10-LABO-061-CASE-39` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `requirement_ids`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: 固定task/oracle owner。 |
| `L10-LABO-061-CASE-40` | `LABO-061-AC-03` | 単独変異: 選択task CASE-01の`acceptance_ids`だけ欠落。残る14条件は同一。 | 比較不能・unknownを保ち、固定task/oracle ownerへ返す。入力からHARNESSを識別できる場合だけ具体化し、identity不明はunknownとする。 |
| `L10-LABO-061-CASE-41` | `LABO-061-AC-03` | 単独変異: 選択task CASE-01の`acceptance_ids`だけstale。残る14条件は同一。 | 比較不能・unknownを保ち、固定task/oracle ownerへ返す。入力からHARNESSを識別できる場合だけ具体化し、identity不明はunknownとする。 |
| `L10-LABO-061-CASE-42` | `LABO-061-AC-03` | 単独変異: 選択task CASE-01の`acceptance_ids`だけ実runと不一致。残る14条件は同一。 | 同一snapshotとして受理せず、固定task/oracle ownerへ返す。入力からHARNESSを識別できる場合だけ具体化し、identity不明はunknownとする。 |
| `L10-LABO-061-CASE-43` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `base_head`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-44` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `base_head`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-45` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `base_head`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-46` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `allowed_paths`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-47` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `allowed_paths`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-48` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `allowed_paths`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-49` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `forbidden_paths`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-50` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `forbidden_paths`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-51` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `forbidden_paths`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-52` | `LABO-061-AC-03` | 単独変異: 選択task CASE-01の`hidden_oracle_digest`だけ欠落。残る14条件は同一。 | 比較不能・unknownを保ち、固定task/oracle ownerへ返す。入力からHARNESSを識別できる場合だけ具体化し、identity不明はunknownとする。 |
| `L10-LABO-061-CASE-53` | `LABO-061-AC-03` | 単独変異: 選択task CASE-01の`hidden_oracle_digest`だけstale。残る14条件は同一。 | 比較不能・unknownを保ち、固定task/oracle ownerへ返す。入力からHARNESSを識別できる場合だけ具体化し、identity不明はunknownとする。 |
| `L10-LABO-061-CASE-54` | `LABO-061-AC-03` | 単独変異: 選択task CASE-01の`hidden_oracle_digest`だけ実runと不一致。残る14条件は同一。 | 同一snapshotとして受理せず、固定task/oracle ownerへ返す。入力からHARNESSを識別できる場合だけ具体化し、identity不明はunknownとする。 |
| `L10-LABO-061-CASE-55` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `seed`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-56` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `seed`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-57` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `seed`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-58` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `toolchain_versions`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-59` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `toolchain_versions`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-60` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `toolchain_versions`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-61` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `timeout_policy`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-62` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `timeout_policy`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-63` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `timeout_policy`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-64` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `retry_policy`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-65` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `retry_policy`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-66` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `retry_policy`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-67` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `cache_policy`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-68` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `cache_policy`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-69` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `cache_policy`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-70` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `hardware_class`だけ欠落。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-71` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `hardware_class`だけが記録後にstaleとなり現行task契約へ適用できない。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 条件値を補完せず当該runを比較不能・unknownにする。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-72` | `LABO-061-AC-03` | 単独変異: 選択task `L10-LABO-061-CASE-01` の `hardware_class`だけが実runの値と不一致。残る14条件と他入力は `L10-LABO-061-CASE-01` と同一。 | 比較群を分離し、同一snapshotとして受理しない。戻し先: task契約owner。 |
| `L10-LABO-061-CASE-87` | `LABO-061-AC-03` | 適用task snapshotの `task_id` の値だけunknown（fieldは存在）。残る14条件はL10-LABO-061-CASE-01と同一。 | task identityを補完せず当該runをunknown/比較不能にする。task契約ownerへ戻す。 |
| `L10-LABO-061-CASE-88` | `LABO-061-AC-03` | `task_version` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | revisionを推測せず比較不能。task契約ownerへ戻す。 |
| `L10-LABO-061-CASE-89` | `LABO-061-AC-03` | `fixture_digest` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | fixture identityを補完せず、固定L2のtask/oracle ownerへ返す。 |
| `L10-LABO-061-CASE-90` | `LABO-061-AC-03` | `requirement_ids` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | 要求対応を推測せず固定task/oracle ownerへ戻す。 |
| `L10-LABO-061-CASE-91` | `LABO-061-AC-03` | `acceptance_ids` の値だけunknown。残る14条件はCASE-01と同一。 | 受入条件を推測せず固定task/oracle ownerへ返す。入力からHARNESSまたは要求ownerを識別できる場合だけ具体化し、identity不明はunknownとする。 |
| `L10-LABO-061-CASE-92` | `LABO-061-AC-03` | `base_head` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | base identityを補完せず比較不能とし、固定L2のtask契約ownerへ返す。 |
| `L10-LABO-061-CASE-93` | `LABO-061-AC-03` | `allowed_paths` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | 許可pathを推測せず比較不能とし、固定L2のtask契約ownerへ返す。 |
| `L10-LABO-061-CASE-94` | `LABO-061-AC-03` | `forbidden_paths` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | 禁止pathを推測せず比較不能とし、固定L2のtask契約ownerへ返す。 |
| `L10-LABO-061-CASE-95` | `LABO-061-AC-03` | `hidden_oracle_digest`の値だけunknown。CASE-01の既知のhidden-oracle利用/適用性と他14条件は保持する。 | digestだけ比較不能・未評価とし、既知の適用性を未確定化したりnot-applicableへ置換したりしない。固定task/oracle ownerへ返す。 |
| `L10-LABO-061-CASE-96` | `LABO-061-AC-03` | `seed` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | 適用時のseedを補完せず比較不能とし、固定L2のtask契約ownerへ返す。 |
| `L10-LABO-061-CASE-97` | `LABO-061-AC-03` | `toolchain_versions` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | 当時toolchain条件を補完せず当該runをunknown/比較不能にしhistorical/currentを混同せず、固定L2のtask/oracle ownerへ返す。 |
| `L10-LABO-061-CASE-98` | `LABO-061-AC-03` | `timeout_policy` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | 適用policyを推測せず比較不能とし、固定L2のtask契約ownerへ返す。 |
| `L10-LABO-061-CASE-99` | `LABO-061-AC-03` | `retry_policy` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | 適用policyを推測せず比較不能とし、固定L2のtask契約ownerへ返す。 |
| `L10-LABO-061-CASE-100` | `LABO-061-AC-03` | `cache_policy` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | 適用policyを推測せず比較不能とし、固定L2のtask契約ownerへ返す。 |
| `L10-LABO-061-CASE-101` | `LABO-061-AC-03` | `hardware_class` の値だけunknown。残る14条件はL10-LABO-061-CASE-01と同一。 | hardware条件を補完せず比較不能とし、固定L2のtask契約ownerへ返す。 |
| `L10-LABO-061-CASE-102` | `LABO-061-AC-03` | normal baseline（通常履歴の非適用対照）: 選択taskではない055通常履歴で、task条件の明示的な非適用理由を維持する。単独変異はその履歴へtask snapshot 15条件すべてを適用対象と誤分類すること。 | 非適用条件を15個の欠落/不合格へ変換せず誤分類を拒否する。このfixtureは選択taskのfield-missing分母へ入れず、hidden oracle/blindの選択task反例はL10-LABO-061-CASE-75で別に照合する。 |
| `L10-LABO-061-CASE-103` | `LABO-061-AC-03` | 単独変異: result receiptだけを根拠にOS assignmentが成立したと主張。その他の入力はL10-LABO-061-CASE-01と同一。 | assignmentを生成せず、既存authority状態を維持する。 |
| `L10-LABO-061-CASE-104` | `LABO-061-AC-03` | 単独変異: result receiptだけを根拠に実験permissionが成立したと主張。その他の入力はL10-LABO-061-CASE-01と同一。 | permissionを生成せず、既存SECURITY境界を維持する。 |
| `L10-LABO-061-CASE-105` | `LABO-061-AC-03` | 単独変異: result receiptだけを根拠にadmissionが成立したと主張。その他の入力はL10-LABO-061-CASE-01と同一。 | admissionを生成せず、既存authority状態を維持する。 |
| `L10-LABO-061-CASE-106` | `LABO-061-AC-03` | 単独変異: result receiptだけを根拠にjudge任命が成立したと主張。その他の入力はL10-LABO-061-CASE-01と同一。 | judge任命を生成せず、既存authority状態を維持する。 |
| `L10-LABO-061-CASE-107` | `LABO-061-AC-03` | 準備: L10-LABO-061-CASE-01と同じ比較入力に失敗runを1件、identity・失敗状態・不成立理由を正しく保持して加える。単独変異: そのrunだけを履歴から削除する。 | 失敗runを削除せず失敗状態を保持し、比較を適格化しない。 |
| `L10-LABO-061-CASE-108` | `LABO-061-AC-03` | 単独変異: historical runの当時authority/permission証拠だけ欠落。current証拠を使わない他入力はL10-LABO-061-CASE-01と同一。 | 当時の許可状態をcurrentから補完せず、そのrunだけunknown/比較不能にする。欠落したpermission evidenceはSECURITYへ戻す。 |
| `L10-LABO-061-CASE-109` | `LABO-061-AC-03` | synthetic canary fixture: L10-LABO-061-CASE-01の通常入力・適用field・source identity/revision/receiptを保持し、実secret/PII値は含めない。単独変異は機微な生値を監査出力へ複写する要求だけ。 | 複写を拒否し、secret/PIIを監査出力へ残さない。他fieldやfixture値を実データで補わない。 |
| `L10-LABO-061-CASE-111` | `LABO-061-AC-03` | 準備: L10-LABO-061-CASE-01と同じ比較入力にWorker-visible leakageで無効となったrunを1件、無効状態を正しく保持して加える。単独変異: そのrunの不成立だけを低費用で相殺する。 | 無効/未評価を保持し、低費用で相殺しない。 |
| `L10-LABO-061-CASE-112` | `LABO-061-AC-03` | 準備: L10-LABO-061-CASE-01と同じ比較入力にtask/oracle版不一致で無効となったrunを1件、無効状態を正しく保持して加える。単独変異: そのrunの不成立だけを短時間で相殺する。 | 無効/未評価を保持し、短時間で相殺しない。 |
| `L10-LABO-061-CASE-113` | `LABO-061-AC-03` | 単独変異: result receiptだけを根拠にWorker qualificationが成立したと主張。その他の入力はL10-LABO-061-CASE-01と同一。 | qualificationを生成せず、既存資格/authority状態を維持する。 |
| `L10-LABO-061-CASE-114` | `LABO-061-AC-03` | 準備: L10-LABO-061-CASE-01と同じ比較入力にWorker-visible leakageで無効となったrunを1件、invalid stateとidentityを正しく保持して加える。単独変異: その無効runだけを他runの平均点で相殺する。 | 無効runを有効化せず、平均点による相殺を拒否する。 |


## Stage 5 — HELIXLABO-L2-063 修復再発評価と予防候補

状態: `MPR-RC-HELIXLABO-L2-063-001` のPO判断で親063は採択済み、`version_target: 1.0`。以下はL3/L10の機能候補で、実行・修復・採用・実運用の許可や結果を生成しない。CASE行は旧公開本文から保持した設計fixtureであり、単一点性・独立性・完全性は別途意味検収を要する。

### LABO-063-AC-01 — 修復知識と同一episodeの再発評価

合成入力として、許可された観測source、対象/版、原因候補と適用条件、OS実行receipt、修復手順/result evidence、HARNESS verification、LABO evaluation、後続event・counterexampleを元episodeへ結ぶ。明確な成功/再発防止の根拠がある範囲だけをLABO知識として保持し、既決閾値/観測範囲が入力されている場合だけ同一問題・手順・条件・版/episodeを集計する。根拠付きgate/detector予防候補をFeedbackへ返し、未処理頻出はwarningとして残す。candidateからgate有効化、target adoption、変更、完了を生成しない。合成例であって実測や実修復を示さない。

### LABO-063-AC-02 — 条件一致の未見正常

未見の再発eventについて、source/revision、cause、適用条件、episode relationが識別可能な範囲だけ新しいevidenceとして保持する。過去の成功を別cause/scopeへ一般化せず、汎用化は固定範囲で評価された知識に限る。入力閾値・母集団が不明ならunknownを返し、0や頻度判定に置き換えない。

### LABO-063-AC-03 — 欠落、陳腐化、状態境界、原因別返却

L10定義の単独変異候補を固定sourceへ照合する。cause/applicability、対象版、修復手順/result、OS execution/registration、LABO evaluation、HARNESS verification、post-operation observationのmissing/staleを分ける。観測または対象版を提供する既存sourceが欠ける場合はその提供主体へ返し、identityが根拠から定まらなければunknownを維持する。修復成功/再発防止/effect evidence不足はLABO評価へ、OS assignment/execution/registration/routing欠落はOSへ、HARNESS契約/verification不足はHARNESSへ返す。新しい汎用ownerを作らない。

**段階境界**: 予防candidateと未処理頻出warningは、固定L2の条件に従って並列に返す出力であり、warningの先行をcandidate発行の前提にしない。候補発行、OS registration/routing、target owner adoption、target change、HARNESS verification、post-operation observation/effect evaluationは別状態で追跡する。別episode/revisionの証拠混載、候補/登録/修復成功のみからの完了主張を拒否する。LABOはknowledgeを評価・保持するが、canonical sourceへ直接writeせず、gateを有効化せず、採否/assignment/permission/authorityを生成しない。変更後条件での観測が無ければ旧成功を現行有効性へ流用しない。

#### 旧source・consumerからの再導出

直接旧sourceは `LEGACY-ASSET-EE5DBACC7F28F7D1F605` の `pillar-functional-requirements.md` HR-FR-P4-02 と HAC-P4-02a/b（baseline `6fabd12512a3659fff4a956692cdd61faeeb16ce`:149,230–231; pre-isolation `2d4991042be55268bac30a8bbcdac45b3865030a`:155,239–240）である。対応consumer `LEGACY-ASSET-44DD86E3DEC09E65EF51` は `L3-pillar-acceptance-test-design.md:112` HAT-P4-02。成功repair単位のrecipe保持、backlog連携、同種反復の候補化、放置warningを保持し、旧unitのcloseを現063全循環完了へ拡張しない。旧runtime/testを実行証拠としない。

関連sourceは別系列のUIL `LEGACY-ASSET-02D897E62EF2FA267267`（`universal-improvement-loop-requirements.md:175–181` R-11、183–187 R-12、210–220 sequence）とconsumer `LEGACY-ASSET-0B5B38F146D9538C9A36`（`universal-improvement-loop-acceptance.md:36–37` AC-017/018）。複数episode/counterexample/version/applicabilityのcandidate意味、採択後の同一invariant/finding/scope/windowの再発・効果消失を因果接続する関連知見として扱い、P4直接sourceや同一承認/閾値へ混ぜない。HMC-BR-003は1.0〜2.x知識をLABOが評価・保持、3.0からIntelligenceが改善に使う責務区分。旧Learning/Skill authorityやprovider memoryは復活させない。

#### CASE inventory（旧IDを保持）

以下の表は旧公開063の全69完全ID定義を保持する。既存CASE literalの分類は候補にすぎず、fixtureの独立性や固定親意味の完全被覆を主張しない。L10-LABO-063-CASE-58はL10-LABO-063-CASE-13と同じpost-operation observation omission軸を保持しつつ、固定L2の原因区分に沿う観測提供主体への返却を明示する。識別可能な個体identityを作らず、identity不明はunknownとする。

| CASE ID | AC | 入力・変異 | 期待状態/oracle |
|---|---|---|---|
| `L10-LABO-063-CASE-01` | `LABO-063-AC-01` | 準備: repair result、HARNESS verification、target revision、同一episodeに結ばれた後続再発eventと反例があり、適用条件/入力閾値は根拠付きで与えられる。 | 同一条件で支持された予防candidateと根拠だけを返す。adoption、target変更、権限、gate有効化を生成しない。 |
| `L10-LABO-063-CASE-02` | `LABO-063-AC-02` | 未見正常: 条件一致する未見再発eventと、そのsource/revision/cause/applicability/episode relationが追跡できる。 | 新しいevidenceとして保持し、別scope/causeへgeneralizeしない。 |
| `L10-LABO-063-CASE-03a` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-46のHARNESS verification receipt欠落を直接参照する。 | L10-LABO-063-CASE-46を唯一のfixtureとして参照し、L10-LABO-063-CASE-33との重複を数えない。 |
| `L10-LABO-063-CASE-03b` | `LABO-063-AC-03` | target revisionだけ別 | evidenceを混ぜずtarget ownerへ。 戻し先: target owner。 |
| `L10-LABO-063-CASE-03c` | `LABO-063-AC-03` | recurrence relationだけ欠落 | 再発効果の判断を未完としてLABO評価へ戻す。 |
| `L10-LABO-063-CASE-03d` | `LABO-063-AC-03` | counterexampleだけ除外 | 予防candidate範囲を支持済みとしない。 |
| `L10-LABO-063-CASE-04a` | `LABO-063-AC-03` | LABOがcanonical recipeへwrite | 拒否し既存ownerを保つ。 戻し先: canonical recipeの既存owner。 |
| `L10-LABO-063-CASE-04b` | `LABO-063-AC-03` | 一件から汎用knowledgeへpromotion | 拒否。既存knowledge ownerへ戻す。 |
| `L10-LABO-063-CASE-18` | `LABO-063-AC-03` | 原因候補だけ欠落 | 予防範囲を確定せず未完にする。欠落した原因候補の既存source ownerが識別できればそこへ返し、識別不能はunknown。 |
| `L10-LABO-063-CASE-19` | `LABO-063-AC-03` | 適用条件だけ欠落 | 別条件へ一般化せず未完にする。適用条件の既存source ownerが識別できればそこへ返し、識別不能はunknown。 |
| `L10-LABO-063-CASE-20` | `LABO-063-AC-03` | 修復手順だけ欠落 | 成功手順とせず未完にする。修復手順のcanonical source providerが識別できればそこへ返し、識別不能はunknown。 |
| `L10-LABO-063-CASE-21` | `LABO-063-AC-03` | 修復結果証拠だけ欠落 | 結果をunknownとし、該当結果source ownerが識別できればそこへ返し、identity不明はunknownとする。 |
| `L10-LABO-063-CASE-22` | `LABO-063-AC-03` | OS execution receiptだけ欠落 | 実行成立とせずOSへ戻す。 |
| `L10-LABO-063-CASE-23` | `LABO-063-AC-03` | LABO evaluation receiptだけ欠落 | 効果評価receiptがないためLABO評価を未完としてLABOに留める。 |
| `L10-LABO-063-CASE-24` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-45のHARNESS verification receipt staleを参照する。 | 主fixtureを使い、同じstale変異を二重計上しない。 |
| `L10-LABO-063-CASE-25` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-49（candidate欠落）とL10-LABO-063-CASE-50（warning欠落）を束ねる主索引。 | 各単独fixtureを参照し、複合変異を独立計上しない。 |
| `L10-LABO-063-CASE-26` | `LABO-063-AC-03` | 単独変異: 未登録の予防candidateを発行しただけで予防完了とする。 | 登録/実施/再観測の完了を推定せず、予防効果を未完のまま保持する。 |
| `L10-LABO-063-CASE-27` | `LABO-063-AC-03` | target変更後の条件だけ変更し再観測なし | 未見条件として前結果を流用せず、変更後target/条件の観測source ownerが識別できればそこへ返す。未識別はunknown。 |
| `L10-LABO-063-CASE-28` | `LABO-063-AC-03` | cause candidateだけstale | 再発/予防評価を保留し、原因候補source providerが識別できればそこへ返す。LABO効果評価も未完のまま保持し、identity不明はunknownとする。 |
| `L10-LABO-063-CASE-29` | `LABO-063-AC-03` | applicability conditionだけstale | 条件一致を推測せず、適用条件source providerが識別できればそこへ返す。LABO効果評価も未完のまま保持し、identity不明はunknownとする。 |
| `L10-LABO-063-CASE-30` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-47（procedure stale）とL10-LABO-063-CASE-48（result evidence stale）。 | 各単独fixtureを参照し、複合変異を独立計上しない。 |
| `L10-LABO-063-CASE-31` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-22のOS execution receipt欠落を参照する。 | 主fixtureを使いOS execution receipt ownerへ返す。 |
| `L10-LABO-063-CASE-32` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-23のLABO evaluation receipt欠落を参照する。 | 主fixtureを使いLABO評価を未完として保持する。 |
| `L10-LABO-063-CASE-33` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-03aとL10-LABO-063-CASE-46の同一receipt欠落を指し、L10-LABO-063-CASE-46を直接参照する。 | L10-LABO-063-CASE-46のoracleを参照し、L10-LABO-063-CASE-03aとの重複および独立fixtureとしての二重計上をしない。 |
| `L10-LABO-063-CASE-34` | `LABO-063-AC-03` | repair candidateだけで成功手順とする | 成功を拒否し未完義務を保持する。 |
| `L10-LABO-063-CASE-35` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-41（cause candidateだけ異なる）とL10-LABO-063-CASE-42（applicability conditionだけ異なる）を束ねる主索引。 | 各単独fixtureのoracleを参照し、複合変異を独立計上しない。 |
| `L10-LABO-063-CASE-36` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-25と同じL10-LABO-063-CASE-49/50二fixtureを指し、L10-LABO-063-CASE-49とL10-LABO-063-CASE-50を直接参照する。 | L10-LABO-063-CASE-49/50を参照し、L10-LABO-063-CASE-25との重複計上をしない。 |
| `L10-LABO-063-CASE-37` | `LABO-063-AC-03` | OS登録だけで予防完了とする | 予防効果を未完とする。 |
| `L10-LABO-063-CASE-38` | `LABO-063-AC-03` | 単独変異: LABOがgateを直接有効化する。 | 作用を拒否し、既存owner境界を保つ。 |
| `L10-LABO-063-CASE-39` | `LABO-063-AC-03` | 索引（独立fixtureではない）: L10-LABO-063-CASE-35と同じL10-LABO-063-CASE-41/42二fixtureを指し、L10-LABO-063-CASE-41とL10-LABO-063-CASE-42を直接参照する。 | L10-LABO-063-CASE-41/42を参照し、L10-LABO-063-CASE-35との重複計上をしない。 |
| `L10-LABO-063-CASE-40` | `LABO-063-AC-03` | target revisionが変わった後に未再観測 | 旧条件の結果を流用せず未完とする。変更後targetの観測providerが識別できればそこへ再観測根拠を返し、LABO効果評価も未完のまま保持する。source identityが特定できなければunknownを保持する。 |
| `L10-LABO-063-CASE-41` | `LABO-063-AC-03` | cause candidateだけ異なる候補へ置換 | 既存条件から一般化せず未評価とする。 |
| `L10-LABO-063-CASE-42` | `LABO-063-AC-03` | applicability conditionだけ異なる候補へ置換 | 条件外へ流用せず未評価とする。 |
| `L10-LABO-063-CASE-43` | `LABO-063-AC-03` | OS execution receiptだけstale | 実行成立を推測せずOSへ戻す。 |
| `L10-LABO-063-CASE-44` | `LABO-063-AC-03` | LABO evaluation receiptだけstale | 効果評価を未完としLABOで再評価する。 |
| `L10-LABO-063-CASE-45` | `LABO-063-AC-03` | HARNESS verification receiptだけstale | 検証成立とせずHARNESSへ戻す。 |
| `L10-LABO-063-CASE-46` | `LABO-063-AC-03` | HARNESS verification receiptだけ欠落 | 検証成立とせずHARNESSへ戻す。 |
| `L10-LABO-063-CASE-47` | `LABO-063-AC-03` | repair procedureだけstale | 成功手順とせず、修復手順のcanonical source providerが識別できればそこへ返す。 |
| `L10-LABO-063-CASE-48` | `LABO-063-AC-03` | repair result evidenceだけstale | 結果をunknownとし、識別できる結果evidence提供元へstale evidenceを返す。LABOはその結果の効果評価を未完として保持する。提供元identityを特定できない場合は戻し先unknown。 |
| `L10-LABO-063-CASE-49` | `LABO-063-AC-03` | 頻出検出後の予防candidateだけ欠落 | warningを予防candidateの代替とせず、予防完了を保留する。 |
| `L10-LABO-063-CASE-50` | `LABO-063-AC-03` | 頻出検出後のwarningだけ欠落 | candidateの存在だけで未処理warningを隠さず、完了を保留する。 |
| `L10-LABO-063-CASE-05` | `LABO-063-AC-01` | 準備: 成功終結した修復とrecipe/知識recordが元episode・target revisionへ結ばれている。OS backlog登録状態は別field。 | LABO評価知識を保持する。OS backlog登録までこの正常fixtureの合格条件に含めない。 |
| `L10-LABO-063-CASE-06` | `LABO-063-AC-03` | 準備: L10-LABO-063-CASE-01と同一入力。単独変異: OS backlog登録だけが失敗。 | 評価知識は保持し、登録未完義務だけをOSへ返す。 |
| `L10-LABO-063-CASE-07` | `LABO-063-AC-01` | 正常候補: 同一identity/cause/applicability/revision/episodeのrepair反復と、適用する既決thresholdが入力されている。 | 同一性のあるeventだけ集計し、与えられたthresholdを評価する。新thresholdを作らない。 |
| `L10-LABO-063-CASE-08` | `LABO-063-AC-03` | 準備: L10-LABO-063-CASE-01と同一入力。単独変異: 同一observationのduplicate receiptだけを追加。 | 重複を別事例にせず、頻度を増やさない。 |
| `L10-LABO-063-CASE-09` | `LABO-063-AC-03` | 準備: 母集団または事前定義thresholdがunknown。単独変異: denominator/thresholdを0と扱う。 | unknownを0に変換せず、頻出/非頻出を断定しない。 |
| `L10-LABO-063-CASE-10` | `LABO-063-AC-01` | 正常候補: 同一条件の再発と既に定められた適用thresholdを満たす根拠が入力される。 | 根拠付きgate/detector candidateを返すが、直接有効化・強制しない。 |
| `L10-LABO-063-CASE-11` | `LABO-063-AC-03` | 準備: 頻出条件を満たした未処理warningがある。単独変異: warningだけを非表示にする。 | 未処理warningを可視のまま保持し完了扱いしない。registration未完はその義務だけOSへ返す。 |
| `L10-LABO-063-CASE-12` | `LABO-063-AC-03` | 準備: recipe/sourceの適用版が変更され、再評価未完。単独変異: 旧revisionの頻度/成功をcurrentへ流用する。 | 旧結果を新revisionへ流用せず、適用範囲のLABO再評価を未完とする。 |
| `L10-LABO-063-CASE-13` | `LABO-063-AC-03` | 準備: target change後の運用後観測windowがある。単独変異: その観測だけを欠落させる。 | 循環未完を保持し、観測提供主体が分かればそこへ返す。個体identityがsourceで特定できなければunknown。 |
| `L10-LABO-063-CASE-14` | `LABO-063-AC-03` | 準備: 現行source/revision evidenceはない。単独変異: 旧memory/recipeの復元だけをcurrent knowledgeとして扱う。 | 現行有効性を生成せず、識別可能な既存source ownerへ戻す。identity不明はunknown。 |
| `L10-LABO-063-CASE-15` | `LABO-063-AC-03` | 準備: 特定repairのscope/cause evidenceがある。単独変異: 個別知識を評価なしにBRAIN一般知識へ適用する。 | 無条件の一般化を拒否し、LABOの適用範囲評価を未完保持する。 |
| `L10-LABO-063-CASE-16` | `LABO-063-AC-03` | 準備: L10-LABO-063-CASE-01と同一入力。単独変異: recurrence frequencyだけからpermission/authorityを生成する。 | permission/authorityを生成しない。fixed sourceがdestinationを特定しないため宛先ownerはunknownのまま。 |
| `L10-LABO-063-CASE-17` | `LABO-063-AC-03` | 準備: L10-LABO-063-CASE-01と同一入力。単独変異: LABOがtarget ownerのcanonical recipeへ直接writeする。 | writeを拒否し、canonical sourceの既存owner境界を保つ。 |
| `L10-LABO-063-CASE-51` | `LABO-063-AC-03` | 準備: target change後の検証/観測義務と旧revision evidenceがある。単独変異: 変更結果receiptだけを欠落させる。 | target change成功とせず循環を未完にし、既存target ownerへ返す。 |
| `L10-LABO-063-CASE-52` | `LABO-063-AC-03` | 準備: 成功repairのepisode/scope/sourceは正常。単独変異: recipe/知識recordだけを欠落させる。 | 成功終結からknowledge retentionを推定せず、LABO保持評価を未完にする。 |
| `L10-LABO-063-CASE-53` | `LABO-063-AC-03` | 準備: L10-LABO-063-CASE-01のsource/revision/cause/episode evidenceを保持。単独変異: 修復結果recordのepisode identityだけが異なる。 | 別episodeのrecordを混ぜず不成立。識別可能なrecord providerへ返し、identity不明はunknown。 |
| `L10-LABO-063-CASE-54` | `LABO-063-AC-03` | 準備: 同一repair eventの正規receiptがある。単独変異: duplicate send/observationだけを別件として数える。 | 重複を再発件数へ加算せず頻度を水増ししない。 |
| `L10-LABO-063-CASE-55` | `LABO-063-AC-03` | 準備: 対象event群の母集団がunknown。単独変異: denominatorを0へ置き換える。 | unknownを0にせず、母集団/頻度をunknownとして保持する。 |
| `L10-LABO-063-CASE-56` | `LABO-063-AC-03` | 準備: 同条件の未解消再発が入力された既決thresholdを満たし、他fieldは有効。単独変異: prevention candidateだけを欠落させる。 | candidate欠落を記録し、予防完了にしない。 |
| `L10-LABO-063-CASE-57` | `LABO-063-AC-03` | 準備: 同条件の未解消再発が入力thresholdを満たす。単独変異: warningだけを欠落させる。 | warning欠落を記録し、candidateの有無で未処理状態を隠さない。 |
| `L10-LABO-063-CASE-58` | `LABO-063-AC-03` | 準備: target変更後の未完義務とpost-operation observation windowが存在する。単独変異: post-operation observationだけを欠落。 | 循環を未完としてLABO evaluationへ保持し、欠けた観測/対象版は観測提供主体へ返す。source identityが固定根拠から決まらない場合はunknown。 |
| `L10-LABO-063-CASE-59` | `LABO-063-AC-03` | 準備: target revisionが変更され、再評価未完。単独変異: 旧revisionのfrequency/successだけを新revisionへ適用する。 | 旧結果を流用せず、current revisionでの評価を未完のまま保持する。 |
| `L10-LABO-063-CASE-60` | `LABO-063-AC-03` | 準備: L10-LABO-063-CASE-01と同一入力。単独変異: LABO evaluation knowledgeをcanonical memoryへ直接writeする。 | 正本化を拒否し、LABOの評価保持と既存canonical ownerを分ける。 |
| `L10-LABO-063-CASE-61` | `LABO-063-AC-03` | 準備: cause/applicability scopeが特定repairに限定される。単独変異: 評価なしでBRAIN一般へ適用する。 | scope外の一般化を拒否し、支持された適用範囲のみを保持する。 |
| `L10-LABO-063-CASE-62` | `LABO-063-AC-03` | 準備: L10-LABO-063-CASE-01と同一入力。単独変異: recurrence frequencyだけでexecution authority/permissionを生成する。 | authority/permissionを生成せず、既存権限境界を保持する。 |
| `L10-LABO-063-CASE-63` | `LABO-063-AC-03` | 索引（独立fixtureではない）: `L10-LABO-063-CASE-64`（原因だけ異なるeventを同一群へ混入）と`L10-LABO-063-CASE-65`（適用条件だけ異なるeventを同一群へ混入）を直接参照する。 | 各主fixtureのoracleを個別に確認し、二条件を一つの変異へ束ねず、独立fixtureとして二重計上しない。 |
| `L10-LABO-063-CASE-64` | `LABO-063-AC-03` | 準備: 対象source/revision/適用条件が同一の再発eventを保持する。単独変異: cause identityだけが異なるeventを同一再発群へ加える。 | 原因別にgroupを分け、頻度を混ぜない。 |
| `L10-LABO-063-CASE-65` | `LABO-063-AC-03` | 準備: 対象source/revision/causeが同一の再発eventを保持する。単独変異: applicability conditionだけが異なるeventを同一再発群へ加える。 | 適用条件別にgroupを分け、頻度を混ぜない。 |

### L10-LABO-065 — functional verification候補

この設計は固定L2/L11の同じ対象revisionに対する未実行fixture候補である。CASE表は旧functional-verification本文の全定義を一度ずつ保持し、各行はCASE ID、対応FR、AC、baseline、単独変異または索引動作、期待oracle/戻し先の6列で表す。旧literal自体にbaseline等が書かれていない場合は、その不足を隠して埋めず「旧literalに差分指定なし」と記す。準備条件を明記したcaseはその条件をbaselineに保つ。

#### 66 CASE定義

| CASE ID | FR | AC | baseline | 単独変異・索引動作 | 期待oracle・戻し先 |
|---|---|---|---|---|---|
| `L10-LABO-065-CASE-01` | `FR-LABO-065-01`, `FR-LABO-065-02`, `FR-LABO-065-03`, `FR-LABO-065-04`, `FR-LABO-065-05`, `FR-LABO-065-06` | `LABO-065-AC-01` | 選択scope、許可fixture、8軸receiptとtask scorecard receiptが揃う | なし（正常） | smoke/full-benchを別出力。8軸とscorecard fieldを対応付け、適用外理由とunknownを区別する。 |
| `L10-LABO-065-CASE-02` | `FR-LABO-065-01`, `FR-LABO-065-02` | `LABO-065-AC-02` | 選択scope内の未見task/runtime。旧literalにscope変更なし | なし（未見正常） | receiptのある範囲だけ評価し、既存条件を保つ。thresholdやscope一般化を追加しない。 |
| `L10-LABO-065-CASE-03a` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01のfull-benchを参照する索引状態 | CASE-03f–03mの軸別欠落fixtureを参照。独立変異なし | 各軸fixtureを個別に照合する。索引行を独立fixture・独立変異に数えない。 |
| `L10-LABO-065-CASE-03b` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01のsmoke/full-bench正常状態 | smoke resultだけをfull-bench扱い | full-benchへの昇格を拒否し、smokeとfull結果を分離する。 |
| `L10-LABO-065-CASE-03c` | `FR-LABO-065-03` | `LABO-065-AC-03` | CASE-01相当の初回task receipt | first_pass receiptだけstale | first_passを確定せずunknownに保つ。OS/run-record責務へ戻す。 |
| `L10-LABO-065-CASE-03d` | `FR-LABO-065-04` | `LABO-065-AC-03` | 選択scopeのCASE-01正常状態（旧literalに差分指定なし） | applicable diff/lint definitionだけ不明 | countを0で補わずunknown、比較未評価。LABO評価契約または識別可能なsource ownerへ。 |
| `L10-LABO-065-CASE-03e` | `FR-LABO-065-05` | `LABO-065-AC-03` | CASE-01相当のscorecard/cost receipt | price sourceだけ欠落 | 費用をunknownとして保持し0にしない。 |
| `L10-LABO-065-CASE-03f` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01の選択scopeと残り7軸の証拠が有効 | correctness軸の証拠だけ欠落 | correctness軸を未評価とし、8軸full-benchを未完にする。 |
| `L10-LABO-065-CASE-03g` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01の選択scopeと残り7軸の証拠が有効 | mutation-kill軸の証拠だけ欠落 | mutation-kill軸を未評価とし、8軸full-benchを未完にする。 |
| `L10-LABO-065-CASE-03h` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01の選択scopeと残り7軸の証拠が有効 | instruction/scope-following軸の証拠だけ欠落 | instruction/scope-following軸を未評価とし、8軸full-benchを未完にする。 |
| `L10-LABO-065-CASE-03i` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01の選択scopeと残り7軸の証拠が有効 | skill-A/B軸の証拠だけ欠落 | skill-A/B軸を未評価とし、8軸full-benchを未完にする。 |
| `L10-LABO-065-CASE-03j` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01の選択scopeと残り7軸の証拠が有効 | quality軸の証拠だけ欠落 | quality軸を未評価とし、8軸full-benchを未完にする。 |
| `L10-LABO-065-CASE-03k` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01の選択scopeと残り7軸の証拠が有効 | concision軸の証拠だけ欠落 | concision軸を未評価とし、8軸full-benchを未完にする。 |
| `L10-LABO-065-CASE-03l` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01の選択scopeと残り7軸の証拠が有効 | security軸の証拠だけ欠落 | security軸を未評価とし、8軸full-benchを未完にする。 |
| `L10-LABO-065-CASE-03m` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01の選択scopeと残り7軸の証拠が有効 | second-diff-extensibility軸の証拠だけ欠落 | second-diff-extensibility軸を未評価とし、8軸full-benchを未完にする。 |
| `L10-LABO-065-CASE-03n` | `FR-LABO-065-03` | `LABO-065-AC-03` | CASE-01相当のtask result receipt | retry_count receiptだけ欠落 | retry_countを補わずunknownに保つ。OS/run-record責務へ。 |
| `L10-LABO-065-CASE-03o` | `FR-LABO-065-05` | `LABO-065-AC-03` | CASE-01相当のquality/cost receipt | quality-judge resultだけ欠落 | scorecardを完了扱いしない。品質証拠不足を保持する。 |
| `L10-LABO-065-CASE-04a` | `FR-LABO-065-06` | `LABO-065-AC-03` | 既存decision owner/runtime stateに変更なし | LABOがruntime/providerを選ぶ誤出力 | 選択を拒否し既存decision ownerの状態を保持する。 |
| `L10-LABO-065-CASE-04b` | `FR-LABO-065-06` | `LABO-065-AC-03` | OS assignmentとSECURITY permissionは入力状態のまま | scoreからpermission/assignmentを生成する誤出力 | 生成を拒否しOS/SECURITY境界を保つ。 |
| `L10-LABO-065-CASE-26` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当のblind scopeでhidden answerがWorker-visible外にある | hidden answerをWorker-visible fixtureへ混入 | 当該証拠を不適格とし、他軸で相殺しない。 |
| `L10-LABO-065-CASE-27` | `FR-LABO-065-04` | `LABO-065-AC-03` | CASE-01相当のapplicable lint metric | lint未計測を0と報告 | unknownを保持し0に置き換えない。 |
| `L10-LABO-065-CASE-28` | `FR-LABO-065-05` | `LABO-065-AC-03` | CASE-01相当のeffective-cost breakdown | retry costだけ欠落 | 費用を不完全/unknownとし、資格・比較成功へ補わない。 |
| `L10-LABO-065-CASE-29` | `FR-LABO-065-02` | `LABO-065-AC-03` | task間の他条件とrubric revisionは一致 | fixture revisionだけ不一致 | 異なる条件を同一比較に混ぜず、該当taskを未評価にする。 |
| `L10-LABO-065-CASE-30` | `FR-LABO-065-02` | `LABO-065-AC-03` | task間の他条件とfixture revisionは一致 | rubric revisionだけ不一致 | 異なる条件を同一比較に混ぜず、該当taskを未評価にする。 |
| `L10-LABO-065-CASE-31` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当のbench manifest一式 | bench manifestだけ欠落 | full-bench未完。LABO評価契約または識別可能なmanifest sourceへ戻す。 |
| `L10-LABO-065-CASE-32` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当のfixture set | fixture digestだけ欠落 | 同一性を確認できず未評価。HARNESS/要求owner責務区分へ。個別identity不明はunknown。 |
| `L10-LABO-065-CASE-33` | `FR-LABO-065-02`, `FR-LABO-065-05` | `LABO-065-AC-03` | security failureが有効な不成立、他receiptは有効 | 他軸の平均scoreだけでsecurity failureを相殺 | 不成立を保持し、合格に変換しない。 |
| `L10-LABO-065-CASE-34` | `FR-LABO-065-05` | `LABO-065-AC-03` | quality failureが有効な不成立、他receiptは有効 | 低価格だけでquality failureを相殺 | 不成立を保持し、合格に変換しない。 |
| `L10-LABO-065-CASE-35` | `FR-LABO-065-05` | `LABO-065-AC-03` | quality failureが有効な不成立、他receiptは有効 | 短時間だけでquality failureを相殺 | 不成立を保持し、合格に変換しない。 |
| `L10-LABO-065-CASE-36` | `FR-LABO-065-04` | `LABO-065-AC-03` | metric applicabilityが未確定/根拠未提示 | 対象外根拠なしにmetricをzero扱い | zeroを認定せずunknown/未評価。CASE-12の実測zeroと区別し、L2:514の適用性・測定責務へ。 |
| `L10-LABO-065-CASE-37` | `FR-LABO-065-02` | `LABO-065-AC-03` | 既存qualification結果は別runtime version/scope | 別versionまたは過去scoreだけで未見scopeを資格済みとする | 新scopeを未評価のまま保つ。 |
| `L10-LABO-065-CASE-38` | `FR-LABO-065-01` | `LABO-065-AC-03` | 選択runの他receiptは有効 | assignment receiptだけ欠落 | runを評価不能としOSへ戻す。 |
| `L10-LABO-065-CASE-39` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当のfixture/score receipt | oracleだけ欠落 | 合否を確定しない。HARNESS/要求owner責務区分へ。 |
| `L10-LABO-065-CASE-40` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当のbench manifest inputs | rubric digestだけ欠落 | rubric/scorer identityを確定せずfull-bench未完。HARNESS/要求owner区分へ。具体identity不明はunknown。 |
| `L10-LABO-065-CASE-05` | `FR-LABO-065-01`, `FR-LABO-065-03` | `LABO-065-AC-01` | 旧literalはCASE-01と同じ正常入力 | なし（正常） | 通常scorecardをfield別に返す。完全性・独立性をID数から推論しない。 |
| `L10-LABO-065-CASE-06` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当のblind score/digestとmachine manifest | blind score/digestをmachine manifestで代替 | 資格証拠とせず、blind judge evidenceを要求する。 |
| `L10-LABO-065-CASE-07` | `FR-LABO-065-01`, `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当でtask/fixture/oracle/rubric等は一致 | task revisionだけ比較対象と不一致 | task revision不一致のため比較から分離する。task条件/sourceの不足は固定L2:514のHARNESSまたは要求owner責務区分へ戻す。scope/task/assignment/resultの観測receipt自体が不足する場合はOSまたは観測source責務区分へ戻す。入力に個別source identityがない場合はunknownを別に保持し、CASE IDだけからidentityを推測しない。 |
| `L10-LABO-065-CASE-08` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当でjudgeはWorker/helperと独立 | judge identityだけWorker/helperと同一 | independent judge条件不成立。evaluation scope owner責務区分へ。 |
| `L10-LABO-065-CASE-09` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当でjudge contextは独立 | judge contextだけ共有 | 独立性不成立。evaluation scope owner責務区分へ。 |
| `L10-LABO-065-CASE-10` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当でcandidate nameはblind | hidden candidate nameだけ可視 | blind証拠不適格。evaluation scope owner責務区分へ。 |
| `L10-LABO-065-CASE-11` | `FR-LABO-065-03` | `LABO-065-AC-03` | 最初のAttempt失敗、retry成功、他receipt有効 | first_passをtrueと誤報 | `first_pass=false`とretry結果を保つ。OS/run-record責務へ。 |
| `L10-LABO-065-CASE-12` | `FR-LABO-065-04` | `LABO-065-AC-01` | applicable diff/lint metricと測定receiptがある | なし。実測値0を入力 | 0を実測として保持しunknownにしない。 |
| `L10-LABO-065-CASE-13` | `FR-LABO-065-05` | `LABO-065-AC-03` | CASE-24とCASE-25の個別cost receipt欠落 | 索引としてCASE-24/25を束ねる。独立変異なし | 各主caseを直接参照し、複合・二重計上しない。 |
| `L10-LABO-065-CASE-14` | `FR-LABO-065-05` | `LABO-065-AC-03` | trend群の測定条件が一致 | trend categoryだけ異なる | 異なるcategoryを分離し、LABO評価へ。 |
| `L10-LABO-065-CASE-15` | `FR-LABO-065-06` | `LABO-065-AC-03` | scorecard evidence valid、decision ref expected | handoff decision identityだけ欠落 | decision 未決として既存decision owner区分へ戻す。 |
| `L10-LABO-065-CASE-16` | `FR-LABO-065-06` | `LABO-065-AC-03` | scorecard evidence valid、decision identity有効 | handoff decision revisionだけstale | stale decisionを適用しない。既存decision owner区分へ。 |
| `L10-LABO-065-CASE-17` | `FR-LABO-065-06` | `LABO-065-AC-03` | scorecard evidence valid、decision identity/revision有効 | handoff statusだけunknown | decisionを確定せず保留。既存decision owner区分へ。 |
| `L10-LABO-065-CASE-18` | `FR-LABO-065-01`, `FR-LABO-065-02` | `LABO-065-AC-03` | 選択qualification scopeを基準とする | scopeだけ選択scope外 | 適用外を失効/失敗として数えず未評価。 |
| `L10-LABO-065-CASE-19` | `FR-LABO-065-05` | `LABO-065-AC-03` | CASE-03eのprice source欠落 | 同じprice source欠落を索引参照。独立変異なし | CASE-03eをprimaryとして直接参照。 |
| `L10-LABO-065-CASE-20` | `FR-LABO-065-05` | `LABO-065-AC-03` |適用可能なcost sourceと他条件は揃い、CASE-03eのprice source欠落とは別の正常状態 |選択費用根拠fieldだけ欠落 |費用evidenceをunknownにする。cost sourceは存在するが選択根拠fieldが欠けた状態。CASE-03eと具体fieldが同一かは未確定のまま保持し、費用の個別source identityが不明ならunknown。 |
| `L10-LABO-065-CASE-21` | `FR-LABO-065-05` | `LABO-065-AC-03` | CASE-01相当のprice source/currency/effective time | currencyだけ欠落 | 換算せず金額unknown。具体source identity不明ならunknown。 |
| `L10-LABO-065-CASE-22` | `FR-LABO-065-05` | `LABO-065-AC-03` | CASE-01相当のprice source/currency/effective time | effective timeだけ欠落 | 適用価格unknown。LABO評価契約または識別可能なsource ownerへ。 |
| `L10-LABO-065-CASE-23` | `FR-LABO-065-03` | `LABO-065-AC-01` | 最初のAttempt失敗、次のAttempt成功 | なし（正常なretry sequence） | `first_pass=false`、`retry_count=1`を別fieldで保持。 |
| `L10-LABO-065-CASE-24` | `FR-LABO-065-05` | `LABO-065-AC-03` | CASE-01相当のcost breakdown | rescue-cost receiptだけ欠落 | 内訳unknown、0補完しない。source identity不明ならunknown。 |
| `L10-LABO-065-CASE-25` | `FR-LABO-065-05` | `LABO-065-AC-03` | CASE-01相当のcost breakdown | human-retry-cost receiptだけ欠落 | 内訳unknown、CASE-24とfieldを区別。source identity不明ならunknown。 |
| `L10-LABO-065-CASE-41` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当、scorer/task scope/fixture setは一致 | oracle identityだけ別値 | 同条件比較を未評価。oracle責務区分（HARNESS/要求owner）へ。個別identity不明はunknown。 |
| `L10-LABO-065-CASE-42` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当、oracle/task scope/fixture setは一致 | scorer identityだけ別値 | scorer mismatchで比較未評価。測定/評価契約という既知責務区分へ、具体source identityは推測しない。 |
| `L10-LABO-065-CASE-43` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当、oracle/scorer/fixture setは一致 | task scopeだけ別値 |task scope不一致を同条件比較へ混ぜず未評価。scope/task条件の根拠不足は固定L2:514のHARNESSまたは要求owner責務区分へ戻す。scopeを示す観測receiptが欠ける場合はOSまたは観測source責務区分へ戻す。個別source identityはunknownとして別に保持し、原因区分からidentityを推測しない。 |
| `L10-LABO-065-CASE-44` | `FR-LABO-065-02` | `LABO-065-AC-03` | CASE-01相当、oracle/scorer/task scopeは一致 | fixture setだけ別集合 | 異なるfixture集合を同条件比較に混ぜず未評価。HARNESS/要求owner責務区分へ、個別identity不明はunknown。 |
| `L10-LABO-065-CASE-45` | `FR-LABO-065-03` | `LABO-065-AC-03` | 初回Attempt失敗、retry後passの状態を準備 | retry passをfirst_passとして報告 | first_passとretry結果を分離し、後続passで初回結果を上書きしない。 |
| `L10-LABO-065-CASE-46` | `FR-LABO-065-05` | `LABO-065-AC-03` | trend内で他条件・測定定義一致 | task classだけ異なる結果を混入 | task class別に分離し同一trendへ合算しない。 |
| `L10-LABO-065-CASE-47` | `FR-LABO-065-06` | `LABO-065-AC-03` | scorecard有効、採用状態は未変更 | scoreだけからadoption decisionを生成 | decisionを生成せず既存owner stateを保持。 |
| `L10-LABO-065-CASE-48` | `FR-LABO-065-05` | `LABO-065-AC-03` | trend内で他条件・task class一致 | measurement definitionだけ異なる結果を混入 | 測定定義別に分離し同一trendへ合算しない。 |
| `L10-LABO-065-CASE-49` | `FR-LABO-065-06` | `LABO-065-AC-03` | scorecard有効、limited状態は未変更 | scoreだけからlimited decisionを生成 | decisionを生成せず既存owner stateを保持。 |
| `L10-LABO-065-CASE-50` | `FR-LABO-065-06` | `LABO-065-AC-03` | scorecard有効、quarantine状態は未変更 | scoreだけからquarantine decisionを生成 | decisionを生成せず既存owner stateを保持。 |
| `L10-LABO-065-CASE-51` | `FR-LABO-065-06` | `LABO-065-AC-03` | scorecard有効、retire状態は未変更 | scoreだけからretire decisionを生成 | decisionを生成せず既存owner stateを保持。 |

#### fixture分類・比較記録（CASE定義表とは別の分類候補）

旧literal上の正常ラベル候補はCASE-01、02、05、12、23（5件）、索引ラベル候補は03a、13、19、20（4件）、その他57件である。この文字列分類は入力fixtureの独立性・single-mutation性・coverageを証明しない。

- CASE-05は旧literalがCASE-01と同じ正常入力と明記する。IDを保持した直接参照候補とし独立fixture分母へ重ねない。
- CASE-19はCASE-03eと同じprice-source欠落を明記するためCASE-03eへの直接参照候補。CASE-20は「選択費用根拠」欠落と記すが、CASE-03eのprice sourceと同じfieldかはliteralだけで確定できない。CASE-20はIDを保ち独立fixtureには数えず、同一field確認後に限ってCASE-03eへ直接参照する。索引chainは作らない。
- CASE-11とCASE-45はともに初回Attempt失敗・retry成功後の値を`first_pass=true`と誤報し、正しいoracleは初回/retryの分離である。45はその状態を準備条件として明記するが、実Attempt receiptがないため同じ入力と断定せず、直接非独立参照候補として保持する。CASE-23は同じattempt sequenceを正しく記録する正常oracleであり、negativeと混ぜない。
- CASE-03a、13は参照先を各主caseへ直接つなぐ索引候補。03aは03f–03mの軸別caseへ、13は24/25へ参照する。索引自体を変異やcoverageに数えない。

#### 固定の責務区分と限界

CASE-41–44では原因fieldと既知責務区分を保ち、個別owner identity不明を別のunknownとして残す。oracle/fixture/rubric/acceptanceはHARNESSまたは要求owner、scorer/quality/cost/measurementは固定L2-065:514の評価契約または該当source責務、task/attempt/assignment/resultはOS/観測source、blind/context分離はevaluation scope ownerへ戻す。親が定めない個別identityは推測しない。全normal/negative/unknown observationは固定L2/L11の母集団定義に従い、normalを分母から外す新ルールを作らない。

各CASEは未実行・未承認。ID数、文字列ラベル、行数は意味完全性やcoverage証明ではない。旧source full file、全66 literal/raw-LF SHA-256、review05 rawとfinding処置は別添JSONに保持する。



## Stage 5 — HELIXLABO-L2-064 Worker比較評価の候補名遮蔽と再現条件

状態: 親064はPO採択済み、対象版1.0。下記は未承認のL3/L10設計候補であり、比較実行、judge任命、Worker起動、qualification、assignment/admissionを生成しない。全CASEは合成入力で、実測・実比較の証拠ではない。 実際に比較runを行う場合は、既存OS assignmentと適用されるSECURITY許可を入力条件として用いる。

**共通正常基準 B0**: selected scope `S0`、run `R0`、記録側runtime/model identity `I0` と版 `V0`、有効なmapping `M0→I0`、judge-visible資料 `D0` と可視scope（candidate nameなし）、fixture `F0`/revision `Fv0`、rubric `R0b`、judge `J0`、sample identity `Q0`、retry condition `T0` を比較前に固定する。元identityは記録側に保持し、judgeへの提示資料と分ける。記号は合成fixture値で、sample/retry数や閾値を定めない。各negative行はこの基準からmutation欄の一fieldだけを変える。入力不変の行はoracle欄の誤出力だけを評価する。索引行はfixture入力を持たない。

| CASE ID | FR ID | AC ID | 正常baseline / fixture入力 | 唯一変異・索引役割 | 期待状態・oracle / 戻し先 |
|---|---|---|---|---|---|
| `L10-LABO-064-CASE-01` | `FR-LABO-064` | `LABO-064-AC-01` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | 変異なし（正常fixture） | 選択scope内で候補名がjudgeから隠れ、元identity・版を記録側から追跡でき、固定条件を保った比較記録だけを返す。 |
| `L10-LABO-064-CASE-02` | `FR-LABO-064` | `LABO-064-AC-02` | 未見のcandidate pair P1、scope S1を入力。P1のruntime/model identity・versionは記録側で追跡可能、judge-visible資料とmetadataには候補名がなく、fixture/rubric/judge/sample/retryは比較前に固定。 | 変異なし（未見正常）。一般履歴は比較scopeに含めない。 | P1/S1の証拠だけを同条件比較の候補にする。通常履歴へのblind必須化、別scopeへの外挿、実比較実施を主張しない。 |
| `L10-LABO-064-CASE-03a` | `FR-LABO-064` | `LABO-064-AC-03` | B0 | metadataのcandidate_name_visibleだけfalse→true。添付本文と他fieldは不変。 | metadata露出runをblind済みとしない。元runと条件を保存し、evaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-03b` | `FR-LABO-064` | `LABO-064-AC-03` | B0 | identity mapping fieldだけ欠落。元identity自体と他条件はB0のまま。 | identity対応をunknownにし、元identityの追跡不能を観測元へ返す。mapping source ownerを作らない。 |
| `L10-LABO-064-CASE-03c` | `FR-LABO-064` | `LABO-064-AC-03` | 索引（fixtureなし） | CASE-08 rubric revision不一致fixtureを直接参照。 | CASE-08のoracleを参照し、独立negativeに数えない。 |
| `L10-LABO-064-CASE-03d` | `FR-LABO-064` | `LABO-064-AC-03` | 索引（fixtureなし） | CASE-03a metadata候補名露出fixtureを直接参照。author/judge作成contextの別条件は追加しない。 | CASE-03aを唯一のfixtureとして参照し、同じ露出変異を重複計上しない。 |
| `L10-LABO-064-CASE-04a` | `FR-LABO-064` | `LABO-064-AC-03` | 索引（fixtureなし） | CASE-37 assignment-output、CASE-38 smoke-only qualification-claim、CASE-39 admission-outputの各fixtureを直接列挙する。 | 各oracleは個別に判定。04a自体をnegativeとして数えず、異なる誤出力を一つに束ねない。 |
| `L10-LABO-064-CASE-17` | `FR-LABO-064` | `LABO-064-AC-03` | 索引（fixtureなし） | CASE-07 fixture revision mismatchを直接参照。 | CASE-07のoracleを参照し、同一変異を二重計上しない。 |
| `L10-LABO-064-CASE-18` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | rubric revision fieldだけ欠落。 | 同条件比較を未評価とし、固定条件不足としてevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-19` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | judge_version fieldだけstale。 | staleなjudge条件の結果を有効化せず、元runを保持しevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-20` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | sample identity fieldだけ欠落。 | sampleを推測・補完せず比較を未評価にしevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-21` | `FR-LABO-064` | `LABO-064-AC-03` | 索引（fixtureなし） | CASE-11 retry condition mismatch fixtureを直接参照。 | CASE-11 oracleを参照し、索引を独立negativeに数えない。 |
| `L10-LABO-064-CASE-22` | `FR-LABO-064` | `LABO-064-AC-03` | 比較入力は選択scope内で他条件有効、security failure=SF1を含む。 | 入力不変。出力だけでSF1の失敗を他runの高score平均により相殺する。 | SF1を不合格として保持し平均で相殺しない。評価結果から許可を生成しない。 |
| `L10-LABO-064-CASE-23` | `FR-LABO-064` | `LABO-064-AC-03` | 通常履歴run H1は未実行で、選択blind比較外。 | 入力不変。未実行H1へ後付けblind-evaluated markerを出力する。 | H1をblind済みとしない。実行時の履歴状態を保持し、評価ownerへ戻す。 |
| `L10-LABO-064-CASE-24` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | candidate-name metadataのjudge-visibleだけfalse→true。runtime revision、他資料、mappingは不変。 | 当該blind結果を無効として保持し、過去結果を継承しない。再評価義務をtask/evaluation ownerへ返す。 |
| `L10-LABO-064-CASE-25` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | judge-visible資料本文にcandidate nameを直接表示。他のmetadataは不変。 | 候補名が見えるためblind成立を拒否し、evaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-26` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | identity mapping revisionだけcurrentからstaleへ。 | 古いmappingを再利用せずidentityをunknownにする。元identity追跡不能は観測元へ返す。 |
| `L10-LABO-064-CASE-27` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | fixture revision fieldだけ欠落。 | 同条件比較を未評価としevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-28` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | judge version fieldだけ欠落。 | judge条件を推測せずblind評価を確定しない。evaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-29` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | retry condition fieldだけ欠落。 | 同条件比較を未評価としevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-30` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | selected comparison run identityだけ欠落。 | runを特定せず比較結果を確定しない。入力source/run recordから元identityを追跡できない場合は観測元へ返し、比較scope・固定条件自体が不明ならevaluation ownerへ戻す。再評価義務はtask/evaluation ownerへ引き継ぎ、個別owner identityがsourceで特定できない場合はunknownを保つ。 |
| `L10-LABO-064-CASE-05` | `FR-LABO-064` | `LABO-064-AC-03` | 索引（fixtureなし） | CASE-03b identity mapping欠落fixtureを直接参照。 | CASE-03b oracleを参照し重複計上しない。 |
| `L10-LABO-064-CASE-06` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | judge-visible scope fieldだけunknown。 | scopeを推測せず比較不能としてevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-07` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | fixture revision fieldだけFv0→Fv1。他のfield、特にruntime revision=V0は不変。 | fixture版の異なるrunを同条件比較へ混ぜず、比較不能を保持しevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-08` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | rubric revisionだけR0b以外へ不一致。 | 同条件比較を拒否し、固定条件不足としてevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-09` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | judge versionだけJ0以外へ不一致。 | 異なるjudge結果を同条件としない。evaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-10` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | sample identityだけQ0以外へ不一致。 | 異なるsampleを同条件とせずevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-11` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | retry conditionだけT0以外へ不一致。 | retry条件の異なるrunを混ぜずevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-12` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | 添付artifactのjudge-visible本文だけcandidate nameを含む。 | 候補名露出runをblind済みとせずevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-13` | `FR-LABO-064` | `LABO-064-AC-03` | 索引（fixtureなし） | CASE-03a metadata露出fixtureを直接参照。 | CASE-03a oracleを参照し、別fixtureまたは独立露出軸と数えない。 |
| `L10-LABO-064-CASE-14` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | 新output format用identity mappingだけ欠落。他field有効。 | 当該形式のidentity対応を未評価とする。元identityの追跡不能は対応する観測元へ、identity/owner不明はunknown。 |
| `L10-LABO-064-CASE-15` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | evidence selectorだけfull blind evidence→smoke resultへ置換。 | smoke-onlyをfull blind evidenceの代替にせず、比較条件/適格性を未完に保つ。再評価義務はtask/evaluation ownerへ。 |
| `L10-LABO-064-CASE-16` | `FR-LABO-064` | `LABO-064-AC-03` | 索引（fixtureなし） | CASE-12 添付本文露出、CASE-03a metadata露出、CASE-14 new-format mapping欠落の3主fixtureをそれぞれ直接参照。 | 個別oracleを参照。索引連鎖や独立fixtureとして数えない。 |
| `L10-LABO-064-CASE-31` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | 対象run scope membershipだけselected→out-of-scope。 | scope外runを比較母集団へ含めない。evaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-32` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準B0：合成入力。selected comparison scope=S0、run=R0、record-side runtime/model identity=I0/revision=V0、追跡可能なmapping=M0→I0、judge-visible資料D0と可視scopeは候補名なし、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample identity=Q0、retry condition=T0を比較前に固定。元identityは記録側に残し、judge提示資料とは分離する。数値・実測・実行済を示さない。 | selected judgeのoracle verification availabilityだけavailable→unavailable。 | 検証不能を未評価として保持し、平均点で補わずevaluation ownerへ戻す。 |
| `L10-LABO-064-CASE-33` | `FR-LABO-064` | `LABO-064-AC-03` | new output format、runtime revision=V0、mapping=M0は有効、metadata候補名はjudge-visible=false。 | candidate-name metadata visibilityだけfalse→true。 | blind成立を拒否し旧結果を継承しない。再評価義務をtask/evaluation ownerへ返す。 |
| `L10-LABO-064-CASE-34` | `FR-LABO-064` | `LABO-064-AC-02` | B0相当で候補名は非表示、mapping追跡可能、比較条件固定。runtime revision fieldだけ異なるcandidateを記録するが、他条件/visibilityは同一。 | 変異なし（正常な差分対照）。 | runtime版差のみから露出・拒否・過去結果無効を推定しない。別scope/版へ成功を外挿しない。 |
| `L10-LABO-064-CASE-35` | `FR-LABO-064` | `LABO-064-AC-03` | 選択scopeの有効run群にscope逸脱run X1が記録済み。 | 入力不変。出力だけでX1の不成立を他runの高score平均で相殺。 | X1をscope外として保持し平均相殺しない。比較範囲と再評価義務をtask/evaluation ownerへ返す。 |
| `L10-LABO-064-CASE-36` | `FR-LABO-064` | `LABO-064-AC-03` | 選択scopeのrun群に検証不能run X2が記録済み。 | 入力不変。出力だけでX2の不成立を他runの高score平均で相殺。 | X2をunknown/未評価として保持し平均相殺しない。検証不能の根拠を解消する再評価義務をtask/evaluation ownerへ返す。 |
| `L10-LABO-064-CASE-37` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準N0：B0の比較条件と証拠は有効。評価結果は比較範囲の材料だけで、assignment/admission状態は既存値のまま。 | 入力不変。比較結果だけからOS assignmentを新規生成した出力。 | assignment生成を拒否し既存OS stateを変更しない。 |
| `L10-LABO-064-CASE-38` | `FR-LABO-064` | `LABO-064-AC-03` | 選択scopeと比較条件は明示され、観測結果はsmoke passのみ。full-evaluation evidenceは無い。 | 入力不変。smoke passだけで完全適格性が確定したとclaimする。 | 完全適格性のclaimを不成立/未評価とする。一般のqualification生成を禁止せず、full-evaluation evidenceの不足とtask/evaluation ownerへの再評価義務を示す。CASE-15のblind evidence代替oracleと混同しない。 |
| `L10-LABO-064-CASE-39` | `FR-LABO-064` | `LABO-064-AC-03` | 共通正常基準N0：B0の比較条件と証拠は有効。評価結果は比較範囲の材料だけで、assignment/admission状態は既存値のまま。 | 入力不変。比較結果だけからOS admissionを新規生成した出力。 | admission生成を拒否し既存境界を保つ。 |
| `L10-LABO-064-CASE-40` | `FR-LABO-064` | `LABO-064-AC-03` | 合成正常基準B0（本行で完結するfixture定義）：scope=S0、run=R0、record-side runtime/model identity=I0、revision=V0、mapping=M0→I0、judge-visible docs=D0、candidate nameはjudge非表示、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample=Q0、retry=T0。比較対象run R0/S0に対する既存OS assignment=OS-A0はcurrent/適用scope一致、既存SECURITY permission=SEC-P0もcurrent/適用scope一致。全入力は合成値で、実権限・実行・実際の評価結果ではない。 | 入力不変。評価結果を根拠にR0/S0用のcomparison_execution_permit=CP1を新規生成する出力だけを追加。 | 比較実施許可を生成しない。OS-A0/SEC-P0の既存入力を変更せず、比較許可の生成を拒否する。 |
| `L10-LABO-064-CASE-41` | `FR-LABO-064` | `LABO-064-AC-03` | 合成正常基準B0（本行で完結するfixture定義）：scope=S0、run=R0、record-side runtime/model identity=I0、revision=V0、mapping=M0→I0、judge-visible docs=D0、candidate nameはjudge非表示、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample=Q0、retry=T0。比較対象run R0/S0に対する既存OS assignment=OS-A0はcurrent/適用scope一致、既存SECURITY permission=SEC-P0もcurrent/適用scope一致。全入力は合成値で、実権限・実行・実際の評価結果ではない。 | 入力不変。scoreを根拠に、SECURITY_permission=SEC-P1を新規発行する出力だけを追加。 | SEC-P1を発行しない。既存SEC-P0を変更せず、LABOの評価結果から許可を作らない。 |
| `L10-LABO-064-CASE-42` | `FR-LABO-064` | `LABO-064-AC-03` | 合成正常基準B0（本行で完結するfixture定義）：scope=S0、run=R0、record-side runtime/model identity=I0、revision=V0、mapping=M0→I0、judge-visible docs=D0、candidate nameはjudge非表示、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample=Q0、retry=T0。比較対象run R0/S0に対する既存OS assignment=OS-A0はcurrent/適用scope一致、既存SECURITY permission=SEC-P0もcurrent/適用scope一致。全入力は合成値で、実権限・実行・実際の評価結果ではない。 Worker起動eventは存在しない。 | 入力不変。LABO評価結果からworker_started=trueのeventを出力する変異だけを追加。 | Worker起動eventを生成しない。LABO出力からWorkerを起動状態にしない。 |
| `L10-LABO-064-CASE-43` | `FR-LABO-064` | `LABO-064-AC-03` | 合成正常基準B0（本行で完結するfixture定義）：scope=S0、run=R0、record-side runtime/model identity=I0、revision=V0、mapping=M0→I0、judge-visible docs=D0、candidate nameはjudge非表示、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample=Q0、retry=T0。比較対象run R0/S0に対する既存OS assignment=OS-A0はcurrent/適用scope一致、既存SECURITY permission=SEC-P0もcurrent/適用scope一致。全入力は合成値で、実権限・実行・実際の評価結果ではない。 | OS-A0 fieldだけをmissingにする。SEC-P0およびB0の他入力は不変。 | 同条件比較の成立として扱わず、比較未評価のまま元run R0と条件を保持する。task/evaluation ownerに再評価義務を残す。OS/SECURITY入力状態を変更しない。 |
| `L10-LABO-064-CASE-44` | `FR-LABO-064` | `LABO-064-AC-03` | 合成正常基準B0（本行で完結するfixture定義）：scope=S0、run=R0、record-side runtime/model identity=I0、revision=V0、mapping=M0→I0、judge-visible docs=D0、candidate nameはjudge非表示、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample=Q0、retry=T0。比較対象run R0/S0に対する既存OS assignment=OS-A0はcurrent/適用scope一致、既存SECURITY permission=SEC-P0もcurrent/適用scope一致。全入力は合成値で、実権限・実行・実際の評価結果ではない。 | OS-A0 statusだけをunknownにする。SEC-P0およびB0の他入力は不変。 | 同条件比較の成立として扱わず、比較未評価のまま元run R0と条件を保持する。task/evaluation ownerに再評価義務を残す。OS/SECURITY入力状態を変更しない。 |
| `L10-LABO-064-CASE-45` | `FR-LABO-064` | `LABO-064-AC-03` | 合成正常基準B0（本行で完結するfixture定義）：scope=S0、run=R0、record-side runtime/model identity=I0、revision=V0、mapping=M0→I0、judge-visible docs=D0、candidate nameはjudge非表示、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample=Q0、retry=T0。比較対象run R0/S0に対する既存OS assignment=OS-A0はcurrent/適用scope一致、既存SECURITY permission=SEC-P0もcurrent/適用scope一致。全入力は合成値で、実権限・実行・実際の評価結果ではない。 | SEC-P0 fieldだけをmissingにする。OS-A0およびB0の他入力は不変。 | 同条件比較の成立として扱わず、比較未評価のまま元run R0と条件を保持する。task/evaluation ownerに再評価義務を残す。OS/SECURITY入力状態を変更しない。 |
| `L10-LABO-064-CASE-46` | `FR-LABO-064` | `LABO-064-AC-03` | 合成正常基準B0（本行で完結するfixture定義）：scope=S0、run=R0、record-side runtime/model identity=I0、revision=V0、mapping=M0→I0、judge-visible docs=D0、candidate nameはjudge非表示、fixture=F0/revision=Fv0、rubric=R0b、judge=J0、sample=Q0、retry=T0。比較対象run R0/S0に対する既存OS assignment=OS-A0はcurrent/適用scope一致、既存SECURITY permission=SEC-P0もcurrent/適用scope一致。全入力は合成値で、実権限・実行・実際の評価結果ではない。 | SEC-P0 statusだけをunknownにする。OS-A0およびB0の他入力は不変。 | 同条件比較の成立として扱わず、比較未評価のまま元run R0と条件を保持する。task/evaluation ownerに再評価義務を残す。OS/SECURITY入力状態を変更しない。 |

CASE IDは旧公開a4 revisionの42定義IDを保持する。索引は定義行のまま維持するが、独立fixture/negative分母へ重ねない。AC対応は各行に記載し、CASE-04aはCASE-37/38/39の別々のoracleを直接参照する。

## Stage 5 — HELIXLABO-L2-067 first-eligible candidateと同一Attempt内修復

状態: 未承認L3/L10設計候補。PO row 82のD1条件付き親採択はこのL3 candidateの承認、fixture実行、資格/assignment/permission/completion/Worker起動を生成しない。

**共通正常基準 B0（合成fixture）**: 合成B0: task=T0/scope=S0/revision=V0。既存task contractが事前に定めたeligibility predicate=P0/revision=P0rとoracle=O0/revision=O0rを候補結果前に入力。OS assignment=ASG0、AttemptID=AT0は既存・current・同一scope。比較実施に必要な既存SECURITY許可=SEC0もcurrent/適用scope一致。candidate/event identity・digest・order・eligibility判定receipt・変更receipt・oracle receiptは全て合成値で揃う。このfixtureではcandidate identity/digestを含む実行event観測sourceをSRC0、既知責務区分をOS event/record sourceとし、具体的個体owner IDはunknownのままにする。入力identity/digest欠落時もSRC0/OS観測source責務へ不足を返し、個体IDの不明を戻し先欠落に変えない。C0はP0でineligible、次のC1が最初のeligible candidateでO0結果fail、同じAT0内のrepair event E1でC1→C2、C2の既存O0結果passとして最終提出する。LABOはこの既存receiptを観測するだけ。これは設計用fixtureで、実比較・実権限・実承認・実完了ではない。 すべてsynthetic値で実績ではない。既存30 definitionsはIDと意味を保持しており、raw source literal/hashをauthoring companion JSONに全件収録する。fixture/owner/data valuesは新規authorityではない。

| CASE ID | FR ID | AC ID | baseline / fixture入力 | 単独変異・索引役割 | 期待oracle / 戻し先 |
|---|---|---|---|---|---|
| `L10-LABO-067-CASE-01` | `LABO-067-FR-01` | `LABO-067-AC-01` | B0（共通fixture定義。未見正常は当該既存predicateの適用範囲内） | 正常fixture（変異なし） | 事前predicate/oracle、Attempt identity、順序付きcandidate digest/eventからfirst eligibleと同一Attempt内roundを再構成し、元digestを維持する。 |
| `L10-LABO-067-CASE-02` | `LABO-067-FR-01` | `LABO-067-AC-02` | B0とは別の未見task class T1を選び、既存predicate/oracleの適用範囲内である根拠をtask/要求ownerのsourceから与える。残るreceiptはB0相当。 | 未見正常fixture（変異なし） | 既存predicateの適用可能な未見taskだけ照合し、総Attempt countを出さない。 |
| `L10-LABO-067-CASE-03a` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | predicate revisionだけ欠落 | first eligibleを決めずtask/要求 ownerへ戻す。 |
| `L10-LABO-067-CASE-03b` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: candidate digestだけ欠落。その他の入力はCASE-01と同一。 | candidate resultをunknown/未評価として保持し、B0で既知のSRC0/OS event観測source責務へdigest不足を返す。個体owner IDはunknownのまま、既知責務区分とLABO観測義務を維持する。 |
| `L10-LABO-067-CASE-03c` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: repair event orderだけ不明。その他の入力はCASE-01と同一。 | repair countを確定せず、Attempt/event順序を記録するOSへ不足を返す。event identity自体が特定不能ならunknownを保つ。 |
| `L10-LABO-067-CASE-03d` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: eventが別Attempt identityに属する。その他の入力はCASE-01と同一。 | 別Attemptのeventを同一repair roundへ混ぜず、Attempt/assignment receiptを記録するOSへ返す。identityが特定不能ならunknownを保つ。 |
| `L10-LABO-067-CASE-03e` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: duplicate deliveryだけ追加。その他の入力はCASE-01と同一。 | duplicate deliveryを追加roundに数えず、既存OS event receiptへ返す。event identityが特定不能ならunknownを保つ。 |
| `L10-LABO-067-CASE-03f` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 最終提出から初回candidateを逆算 | first-eligible identity/resultを推定で補わずunknown/未評価を保持し、候補の順序付きeventを持つ既存OS sourceへ不足を返す。 |
| `L10-LABO-067-CASE-03g` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: eligible判定eventだけ欠落。predicate・oracle・candidate digest・Attempt入力はCASE-01と同一。 | first eligibleを推測せず未評価とし、欠落eventの記録はOSへ戻す。event identity不明はunknownを保つ。 |
| `L10-LABO-067-CASE-04a` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | LABOがcandidateを修復 | 修復を拒否し、受領したcandidate/digestと既存OS実行状態を保つ。candidateの所有者をtask/要求ownerと推測しない。 |
| `L10-LABO-067-CASE-04b` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | LABOがWorkerを割当 | 拒否しOSへ。 |
| `L10-LABO-067-CASE-15` | `LABO-067-FR-01` | `LABO-067-AC-03` | 索引参照のみ。独立fixtureではない。 | 索引（独立fixtureではない）: CASE-03aのpredicate revision欠落を参照する。 | 主fixtureのoracleを使い、同じ変異を二重計上しない。 |
| `L10-LABO-067-CASE-16` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 適用oracleだけ欠落 | 結果をunknownとしtask/要求ownerへ戻す。 |
| `L10-LABO-067-CASE-17` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 総Attempt countを本候補指標とする | 拒否し本候補のscope外としてsource holdingに残す。 |
| `L10-LABO-067-CASE-18` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 065 first_passをcandidate resultへ置換 | 別指標を保持し置換しない。 |
| `L10-LABO-067-CASE-19` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 065 retry_countへ内部repair roundを加算 | 別指標を保持し加算しない。 |
| `L10-LABO-067-CASE-20` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 入力の059品質条件を変更せず、quality不成立を許容する新しいquality_gate値だけをLABO出力へ誤追加する。 | 拒否し固定親の比較意味を保つ。 |
| `L10-LABO-067-CASE-21` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | result receiptだけ欠落 | candidate resultをunknownとしOS record ownerへ戻す。 |
| `L10-LABO-067-CASE-22` | `LABO-067-FR-01` | `LABO-067-AC-03` | 索引参照のみ。独立fixtureではない。 | 索引（独立fixtureではない）: `L10-LABO-067-CASE-03d` の別Attempt event混入を参照する。 | 主fixture03dを直接参照し、同じ変異を二重計上しない。 |
| `L10-LABO-067-CASE-23` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: first-eligible candidateに適用するoracle revisionだけ欠落。oracle本体・predicate・candidate/event receiptはCASE-01と同一。 | first-eligible resultを確定せずunknown/未評価とし、task/要求ownerへ戻す。 |
| `L10-LABO-067-CASE-05` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: candidate identityだけ欠落。その他の入力は `CASE-01` と同一。 | first eligibleを特定せずunknown/未評価に保ち、B0で既知のSRC0/OS event観測source責務へcandidate identity不足を返す。個体owner IDはunknownのまま、既知責務区分とLABO観測義務を維持する。 |
| `L10-LABO-067-CASE-06` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: assignment identityだけ欠落。その他の入力は `CASE-01` と同一。 | 実行を選択Attemptに結ばない 戻し先: OS。 |
| `L10-LABO-067-CASE-07` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: Attempt identityだけ欠落。その他の入力は `CASE-01` と同一。 | roundを数えない 戻し先: OS。 |
| `L10-LABO-067-CASE-08` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: oracle revisionだけが選択scopeの版と異なる。oracle本体・predicate・candidate/event receiptはCASE-01と同一。 | stale/別revisionのoracle判定をfirst-eligible resultへ流用せずunknown/未評価とし、task/要求ownerへ戻す。 |
| `L10-LABO-067-CASE-09` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0の既存predicate選択根拠decision receipt DP0も追跡可能な準備入力。 | DP0 receiptだけ欠落。 | 適用predicateの判断が追跡不能ならunknownを保持し、task/要求 ownerへ戻す。 |
| `L10-LABO-067-CASE-10` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: result後にpredicateを選択だけを変更。その他の入力は `CASE-01` と同一。 | result後選択を拒否し、predicateを決めるtask/要求 ownerへ戻す。 |
| `L10-LABO-067-CASE-11` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: 後続passがfirst resultを後続resultへ上書きだけを変更。その他の入力は `CASE-01` と同一。 | first resultを保持し後続resultによる上書きを拒否。戻し先: LABO出力責務。 |
| `L10-LABO-067-CASE-12` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0のうちrepair event receipt E1だけ欠落した準備入力。他入力は有効。 | 入力不変で、不明なrepair round countを0と出力する。 | round count unknown 戻し先: OS。 |
| `L10-LABO-067-CASE-13` | `LABO-067-FR-01` | `LABO-067-AC-03` | 索引参照のみ。独立fixtureではない。 | 索引（独立fixtureではない）: `L10-LABO-067-CASE-05`、`L10-LABO-067-CASE-06`、`L10-LABO-067-CASE-07`。candidate、assignment、Attempt identityの各単独変異を参照する。 | 各単独CASEのoracleを個別に確認し、複合変異を独立計上しない。 |
| `L10-LABO-067-CASE-14` | `LABO-067-FR-01` | `LABO-067-AC-03` | 共通正常基準B0（下記合成fixture定義） | 単独変異: new revisionがselected predicate scopeにないだけを変更。その他の入力は `CASE-01` と同一。 | 未見revisionをunknownとし、predicate/oracleはtask/要求 ownerへ戻す。 |
| `L10-LABO-067-CASE-24` | `LABO-067-FR-01` | `LABO-067-AC-01` | B0（C0→C1 first-eligible fail→同一AT0内E1でC2 final pass） | 変異なし。first Attempt AT0内にineligible C0の後で最初のeligible C1を観測し、C1→C2の修復を1回含む。 | first_eligible_candidate_resultはC1に適用された既存O0のfailを保持し、same_attempt_repair_round_countは観測できた1 roundとする。これは065の最初のAttempt結果/first_passまたはretry_countへ換算・代替・加算しない。総Attempt countを出さない。 |
| `L10-LABO-067-CASE-25` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0（他入力・receiptは有効） | 適用predicate/oracleとreceiptはB0のまま有効。predicate sourceのspecific individual owner IDだけunknownにし、responsibility role=task/要求ownerは既知のまま。 | 既存predicate/oracle receiptからfirst-eligible resultを観測し、owner個体IDだけunknownとして保持する。roleを特定個人へ置換せず、新しいownerを作らない。 |
| `L10-LABO-067-CASE-26` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0（他入力・receiptは有効） | 既存OS assignment ASG0は有効。OSが持つ個別AttemptIDだけunknownにし、OSという責務roleは既知のまま。 | candidate/repair eventsを特定Attemptに結ばずrepair countを確定しない。AttemptIDを生成・代替せずunknownを保持し、既存OS Attempt sourceへ不足を返す。 |
| `L10-LABO-067-CASE-27` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0（predicate、assignment、Attemptは有効） | AttemptIDとOS event receipt/payloadはB0のまま有効。記録したLABO observerのspecific individual IDだけunknownにし、LABO observation roleは既知のまま。 | event receiptからfirst-eligible/roundを観測し、observer individual IDだけunknownとして保持する。LABO roleを特定個人へ置換せず、actor identityを創作しない。 |
| `L10-LABO-067-CASE-28` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0（OS assignment/Attemptその他は有効） | 比較実施に必要な既存SECURITY許可の適用状態だけunknown。 | 同条件比較の成立として扱わず未評価/比較不能にする。LABOは許可を生成せず、SECURITY permission source/roleを既存入力のまま扱う。個体sourceが不明ならunknownを保持し、新しいpermission ownerを作らない。 |
| `L10-LABO-067-CASE-29` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0（existing ASG0/AT0 and SEC0 remain unchanged） | 結果/evaluation materialから新しいOS assignment `ASG1`だけをLABO出力に追加する。 | assignment生成を拒否し、既存OS stateを変更しない。assignment/Attempt identityの責務roleはOSに留める。 |
| `L10-LABO-067-CASE-30` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0（existing SEC0 remains unchanged） | score/evaluation materialから新しいSECURITY permission `SEC1`をLABO出力に追加する。 | permission生成を拒否し、SEC0/SECURITY authority stateを変更しない。既存permission sourceの照合に留める。 |
| `L10-LABO-067-CASE-31` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0の観測入力は有効。採否decisionはこのfixtureで未決のまま。 | candidate/oracle/repair evidenceだけからadoption=trueをLABO出力に追加する。 | 採否を生成せず、観測証拠と既存採否状態を分離する。固定L2の採否を作らない境界を保持する。 |
| `L10-LABO-067-CASE-32` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0（Workerは未起動のまま） | LABO evaluation resultから`worker_started=true` eventを出力する。 | Worker起動を生成しない。実行/assignment stateは既存OS責務のまま保持する。 |
| `L10-LABO-067-CASE-33` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0の観測入力を不変とし、既存資格状態を入力状態のまま保持する。 | LABO観測出力に新しい`qualification`だけを生成する誤出力を加える。 | `qualification`を生成せず観測材料だけを返し、既存資格状態を変更しない。個体identityが不明でも固定L2の既知責務区分を保持する。 |
| `L10-LABO-067-CASE-34` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0の観測入力を不変とし、既存admission状態を入力状態のまま保持する。 | LABO観測出力に新しい`admission`だけを生成する誤出力を加える。 | `admission`を生成せず観測材料だけを返し、既存admission状態を変更しない。個体identityが不明でも固定L2の既知責務区分を保持する。 |
| `L10-LABO-067-CASE-35` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0の観測入力を不変とし、task/要求ownerの既存predicateを入力状態のまま保持する。 | LABO観測出力に新しい`eligibility_predicate`だけを生成する誤出力を加える。 | `eligibility_predicate`を生成せず観測材料だけを返し、task/要求ownerの既存predicateを変更しない。個体identityが不明でも固定L2の既知責務区分を保持する。 |
| `L10-LABO-067-CASE-36` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0の観測入力を不変とし、task/要求ownerの既存oracleを入力状態のまま保持する。 | LABO観測出力に新しい`oracle`だけを生成する誤出力を加える。 | `oracle`を生成せず観測材料だけを返し、task/要求ownerの既存oracleを変更しない。個体identityが不明でも固定L2の既知責務区分を保持する。 |
| `L10-LABO-067-CASE-37` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0の観測入力を不変とし、既存contractのthreshold有無を入力状態のまま保持する。 | LABO観測出力に新しい`threshold`だけを生成する誤出力を加える。 | `threshold`を生成せず観測材料だけを返し、既存contractのthreshold有無を変更しない。個体identityが不明でも固定L2の既知責務区分を保持する。 |
| `L10-LABO-067-CASE-38` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0の観測入力を不変とし、既存candidate選択状態を入力状態のまま保持する。 | LABO観測出力に新しい`selected_candidate`だけを生成する誤出力を加える。 | `selected_candidate`を生成せず観測材料だけを返し、既存candidate選択状態を変更しない。個体identityが不明でも固定L2の既知責務区分を保持する。 |
| `L10-LABO-067-CASE-39` | `LABO-067-FR-01` | `LABO-067-AC-03` | B0の観測入力と既存059の費用定義・比較条件を保持する。LABOは既存cost gateを変更していない。 | 入力を変更せず、LABOの観測出力へ既存059のcost gateを変更する値だけを誤追加する。 | cost gateの変更を拒否し、059の費用・比較条件を保持する。067は観測材料だけを返し、誤出力をLABO評価責務へ戻す。 |

新CASE-24–38はCASE-01–23と照合する追加fixture候補であり、欠落個体identityではknown role classを保つ。CASE-29/30/31/32はassignment/SECURITY permission/採否/Worker-start生成という別出力を単独で拒否する。old CASE-04bのWorker assignment拒否もそのまま残し、ID数から意味完全性を主張しない。

## Stage 5 — HELIX-LABO L10 機能総合検証候補 — HELIXLABO-L2-069

合成scope S069はこの069節だけのfixture labelで、他親のscope labelとの同一性・参照関係を表さない。現在51 CASE行（旧36 IDと起草追加10 ID、新規修正5 ID。索引を含む）。

FVの現行baseline/mutation/oracle文は旧公開文書のliteral copyではなく、固定L2/L11からの再導出候補である。表の1行目は正常baselineを表す。単独変異行は同じ条件から記載の1点だけを変える。索引IDは旧literalを保全する監査対象だが独立fixtureとして実行・計上しない。

| CASE | AC | 種別 | baseline | 単独変異 | oracle候補 |
|---|---|---|---|---|---|
| `L10-LABO-069-CASE-01` | `LABO-069-AC-01` | 正常 | 同一ticket family・scope・revisionのreturn reason、適用母数、window/source completeness、再発行後resultと証拠付きrelationが有効。 | 変異なし | 正常fixtureの評価candidateに、固定L2所定の理由別傾向・counterexample・regression risk・revalidation conditionをすべて含める。oracleは4項目それぞれの出力有無と固定scope/revision/windowに結び付いた根拠を確認し、返却理由・件数・分母・scope/revision/window、再発行後resultの成立/不成立/未評価、元closure/source authorityの保持、ticket不変更と併せて判定する。新しい数値threshold・計算方式は要求しない。 |
| `L10-LABO-069-CASE-02` | `LABO-069-AC-02` | 未見正常 | CASE-01と同じ有効条件。reasonのみ既存分類にない。 | 新しいreason classを追加せずunknown/unclassifiedを保持。 | 該当resultを既知の成立/不成立へ推測変換せず、未評価として既存OSまたは識別可能なsource-owner区分へ返す。 |
| `L10-LABO-069-CASE-03a` | `LABO-069-AC-03` | 索引・独立fixtureではない | CASE-09のdenominator欠落を参照。 | 独立変異なし。 | CASE-09を参照し二重計上しない。 |
| `L10-LABO-069-CASE-03b` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | 観測window内の結果観測だけ未完。 | window未満をdefect 0や成立へ変換せず、未評価として保持する。 |
| `L10-LABO-069-CASE-03c` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | 再発行結果と元findingを結ぶevidence-backed relationだけ欠落。 | 因果・比較を出さず、relation/evidence不足を固定L2のOSまたは識別可能なsource-owner区分へ返す。 |
| `L10-LABO-069-CASE-03d` | `LABO-069-AC-03` | 索引・独立fixtureではない | CASE-06のstale revisionを参照。 | 独立変異なし。 | CASE-06を参照し二重計上しない。 |
| `L10-LABO-069-CASE-03e` | `LABO-069-AC-03` | 単独変異 | 同じ適用範囲の前回と今回の件数を有効な同一条件として提示。 | 件数が減少したという表示だけをquality closureへ変換。 | 件数減少のみを品質証明とせず、gate/actionable・terminal化根拠等の入力にない結果を作らない。 |
| `L10-LABO-069-CASE-04a` | `LABO-069-AC-04` | 単独変異 | CASE-01 valid baseline。OSが保有するticket。 | LABOがticket本文を編集。 | 変更を拒否し元ticketを保持。OSのticket責務を侵さない。 |
| `L10-LABO-069-CASE-20` | `LABO-069-AC-03` | 単独変異 | 同scope/revisionの適合ticket identity、母数・分類・window・source completeness・resultが有効。 | ticket identityだけ欠落。 | 件数/rate/resultを未評価とし、OSまたは識別可能なsource-owner区分へ返す。identity値を捏造しない。 |
| `L10-LABO-069-CASE-21` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。OS assignmentとticketの束縛が有効。 | assignment identityだけ欠落。 | run/ticket対応を確定せず、既存OS責務へ不足を返す。 |
| `L10-LABO-069-CASE-22` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。source identity以外は揃う。 | source identityだけ欠落。 | source ownerを推測しない。特定できない個別source identityはunknownのまま、既存OSまたは識別可能なsource-owner区分へ不足を返す。 |
| `L10-LABO-069-CASE-23` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。観測windowの他情報は揃う。 | 観測時点だけ欠落。 | window比較を確定せず、既存OSまたは識別可能な観測source-owner区分へ時点不足を返す。 |
| `L10-LABO-069-CASE-24` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。evidence以外は揃う。 | relation/result evidenceだけ欠落。 | 成立/不成立を確定せず不足を返す。時間的近接やpathから因果を補わない。 不足証拠は既存OSまたはsource ownerへ返す。個別identityが不明でも既知責務区分を保つ。 |
| `L10-LABO-069-CASE-25` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。評価可能/未評価状態がsourceにある。 | 評価状態だけ欠落。 | state unknownとしてrate/resultを確定せず、既存OSまたは識別可能な状態source-owner区分へ不足を返す。 |
| `L10-LABO-069-CASE-26` | `LABO-069-AC-03` | 単独変異 | 同一scope・対象revisionで定義されたcohort。 | 異なるscopeまたはrevisionのrecordだけ混入。 | 異なるcohortに分離し、まとめない。 |
| `L10-LABO-069-CASE-27` | `LABO-069-AC-03` | 索引・独立fixtureではない | CASE-11の未実行ticket成功表示変異を参照。 | 独立変異なし。 | CASE-11 oracleを参照し二重計上しない。 |
| `L10-LABO-069-CASE-05` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | ticket scopeだけ欠落。 | 比較不能/未評価。既存OSへscope不足を返す。 |
| `L10-LABO-069-CASE-06` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | 対象revisionだけstale。 | current比較に使わず、元revisionを保持し既存OSへ返す。 |
| `L10-LABO-069-CASE-07` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | source completenessだけ不明。 | 母数/rateを確定せずunknownを保持し、既存OSまたは識別可能なsource-owner区分へ返す。 |
| `L10-LABO-069-CASE-08` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | 再発行後resultだけ欠落。 | 成立状況unknown/未評価。結果を補完せず返す。 不足証拠は既存OSまたはsource ownerへ返す。個別identityが不明でも既知責務区分を保つ。 |
| `L10-LABO-069-CASE-09` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | 適用denominatorだけ欠落。 | rateを出さず、既存OSまたは識別可能なsource-owner区分へ母数不足を返す。 |
| `L10-LABO-069-CASE-10` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | 結果観測後に分類だけ変更。 | 事後分類から成功を作らず、入力分類とsource revisionを保持する。 |
| `L10-LABO-069-CASE-11` | `LABO-069-AC-03` | 単独変異 | ticketに実行結果がない。 | 未実行ticketを成功と表示。 | 成功扱いしない。実行結果のない状態を保つ。 |
| `L10-LABO-069-CASE-12` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | censored observationをfailure 0として表示。 | 打切り状態を保持しzero扱いしない。 |
| `L10-LABO-069-CASE-13` | `LABO-069-AC-03` | 単独変異 | 一件のticketとその個別結果。 | 一件だけから全体の因果効果/改善を主張。 | 全体因果効果や発行精度の改善を出さない。個別assessmentとevidence-backed relationの範囲に限る。 |
| `L10-LABO-069-CASE-14` | `LABO-069-AC-04` | 単独変異 | 通常packet向けに適用中のdata-use条件を満たす入力。 | restricted dataを通常packetへ複写。 | packet出力を拒否し、適用中のSECURITY/data-use条件を保つ。固定L2以上の新ownerを作らない。 |
| `L10-LABO-069-CASE-15` | `LABO-069-AC-04` | 索引・独立fixtureではない | CASE-04aとCASE-16/17/18を直接参照。 | 独立変異なし。 | 各主fixtureを個別参照し索引連鎖・二重計上をしない。 |
| `L10-LABO-069-CASE-16` | `LABO-069-AC-04` | 単独変異 | CASE-01 valid baseline。 | LABOがpriorityだけを変更。 | 変更を拒否。固定L2が判断ownerを特定しない場合、個別ownerを捏造せずunknownを保持する。 |
| `L10-LABO-069-CASE-17` | `LABO-069-AC-04` | 単独変異 | CASE-01 valid baseline。 | LABOがverification oracleだけを変更。 | 変更を拒否。識別可能なsource責務がない場合は新routeを作らずunknownを保つ。 |
| `L10-LABO-069-CASE-18` | `LABO-069-AC-04` | 単独変異 | CASE-01 valid baseline。 | LABOがOS assignmentだけを変更。 | 変更を拒否し、既存OS責務へ戻す。 |
| `L10-LABO-069-CASE-19` | `LABO-069-AC-04` | 索引・独立fixtureではない | CASE-04a ticket変更を直接参照。 | 独立変異なし。 | CASE-04aを参照し二重計上しない。 |
| `L10-LABO-069-CASE-28` | `LABO-069-AC-03` | 単独変異 | 受入findingのreason/source identity/revisionは有効。 | oracle不足を示すsourceだけ欠落。 | closure/成功に変換せずsource欠落unknownを保ち、既存OSまたは識別可能なsource-owner区分へ返す。 |
| `L10-LABO-069-CASE-29` | `LABO-069-AC-02` | 未見正常 | 固定L11「未見例」のscope内。有効source identity/revision付きoracle不足finding。 | reasonだけ既存分類に一致しない。 | 新分類を作らずunknown/unclassifiedを保つ。固定L2の戻し先roleはOSまたは識別可能なsource-owner区分。個別IDが証拠にない場合はunknown。 |
| `L10-LABO-069-CASE-30` | `LABO-069-AC-03` | 単独変異 | 受入findingのsource identity/revisionは有効。 | oracle不足reasonだけ欠落。 | 既知成立/不成立へ推測せずunknown/unclassifiedを保ち、固定L2既存戻し先へ不足を返す。 |
| `L10-LABO-069-CASE-31` | `LABO-069-AC-03` | 単独変異 | 有効source identity/windowのfindingが返却済み。固定L2の戻し先区分はOSまたは識別可能なsource-owner。 | 返却後追跡が未実施なのにdefect 0と主張。 | 未追跡は未評価として保ち0扱いしない。route roleは既知のOS/source-owner区分に限り、証拠に個人/具体source identityがない場合はそのidentityをunknownのままにする。 |
| `L10-LABO-069-CASE-32` | `LABO-069-AC-03` | 単独変異 | CASE-01 valid baseline。 | 欠測値だけを0として集計。 | 欠測を0にせずunknownを保持。欠測原因sourceが識別不能なら新ownerを作らず、固定L2のOS/source-owner区分と個別identity unknownを分ける。 |
| `L10-LABO-069-CASE-33` | `LABO-069-AC-03` | 単独変異・CASE-13と意図的に重複 | CASE-01の有効evidence-backed relationと個別再発行後assessment（既存CASE-13も単一ticketを扱う）。 | 単一caseから`causal_effect_improvement=true`を生成。 | 個別relation/resultは保持できるが、固定L2が禁じる単一事例からの因果効果・発行精度改善は生成しない。CASE-13と重複する境界再照合で、新しい因果方式/閾値は加えない。 |
| `L10-LABO-069-CASE-34` | `LABO-069-AC-04` | 単独変異 | 評価candidateのみを返す正常baseline。OSがassignmentを保持。 | 評価結果から`assignment` fieldを書き換える。 | assignmentを生成/変更せず、OSの既存責務を保つ。 |
| `L10-LABO-069-CASE-35` | `LABO-069-AC-04` | 単独変異 | 評価candidateのみを返す正常baseline。OSがticket登録・routing・発行を保持。 | 評価結果から`ticket_issue` fieldを生成する。 | ticket issue/reissueを生成せず、OSの既存責務を保つ。 |
| `L10-LABO-069-CASE-36` | `LABO-069-AC-04` | 単独変異 | 評価candidateのみを返す正常baseline。適用中のauthority条件を保持。 | 評価結果から`permission` fieldを付与する。 | permissionを生成せず、適用中の既存authority条件を保つ。 |
| `L10-LABO-069-CASE-37` | `LABO-069-AC-04` | 単独変異 | 評価candidateのみを返す正常baseline。authority fieldは入力値どおり。 | 評価結果から`authority` fieldを拡張/変更する。 | authorityを生成/変更せず、入力の既存authority境界を保つ。 |
| `L10-LABO-069-CASE-38` | `LABO-069-AC-04` | 単独変異 | 評価candidateのみを返す正常baseline。ticket採否は既存ownerの状態。 | 評価結果から`adoption_decision` fieldを生成する。 | 採否決定を生成しない。評価candidateと既存owner decisionを区別する。 |
| `L10-LABO-069-CASE-39` | `LABO-069-AC-04` | 単独変異 | 評価candidateのみを返す正常baseline。実行状態は既存owner/sourceの状態。 | 評価結果から`execution_started` fieldを生成する。 | 実行開始を生成せず、評価をproposalとして返す。 |
| `L10-LABO-069-CASE-40` | `LABO-069-AC-04` | 単独変異 | 評価candidateのみを返す正常baseline。改善完了状態は既存owner/sourceの状態。 | 評価結果から`improvement_complete` fieldを生成する。 | 改善完了を生成しない。元ticket/source stateを保持する。 |
| `L10-LABO-069-CASE-41` | `LABO-069-AC-04` | 単独変異 | 本069節内の合成scope S069の返却/再発行評価inputは必要証拠不足により未評価。既存target/placementを入力のまま保持し、元closureは不変。 | 入力不変で、未評価結果だけから`target_changed=true`をLABO出力に新規生成する。 | `target_changed`を生成せず評価candidateと不足証拠を返す。OS/source ownerの入力状態とINTELLIGENCEの配置案責務を保ち、誤出力をLABO評価責務へ戻す。 不足証拠は既存OSまたはsource ownerへ返す。個別identityが不明でも既知責務区分を保つ。 |
| `L10-LABO-069-CASE-42` | `LABO-069-AC-04` | 単独変異 | 本069節内の合成scope S069の返却/再発行評価inputは必要証拠不足により未評価。既存target/placementを入力のまま保持し、元closureは不変。 | 入力不変で、未評価結果だけから`placement_changed=true`をLABO出力に新規生成する。 | `placement_changed`を生成せず評価candidateと不足証拠を返す。OS/source ownerの入力状態とINTELLIGENCEの配置案責務を保ち、誤出力をLABO評価責務へ戻す。 不足証拠は既存OSまたはsource ownerへ返す。個別identityが不明でも既知責務区分を保つ。 |
| `L10-LABO-069-CASE-43` | `LABO-069-AC-04` | 単独変異（M1） | 本節内だけの固定scope label `S069`を持つ、L2-069の必要条件を満たした評価済みticket-return/reissue candidate。ticket family・scope・対象revision、evidence-backed relation、denominator、reason分類、window、source completeness、再発行後result、元closureは有効で不変。`placement_changed`は正常candidateの出力にない。 | 評価済みresultからLABO出力field `placement_changed=true`だけを新規生成する。 | `placement_changed`を拒否し、入力のtarget/placement・元closureを変えず、配置案を既存INTELLIGENCE責務に残す。評価済みか未評価かにかかわらず、L2配置境界からplacement変更をLABO出力に生成しない。 |
| `L10-LABO-069-CASE-44` | `LABO-069-AC-01` | 単独変異（M2・理由別傾向） | CASE-01と同一の有効なticket family/scope/revision、relation/evidence、denominator、分類、window、source completeness、再発行後resultを用い、評価candidateにはL2-069所定の4項目（理由別傾向・counterexample・regression risk・revalidation condition）を含める。 | 出力candidateの`reason-specific trends`項目だけを欠落させ、他の全項目・証拠・適用条件は保持する。 | AC-01の正常candidateとして合格させず、理由別傾向の欠落を明示する。残る3項目と既存必須出力は保持される。新しい指標、数値threshold、統計方式は追加しない。 出力欠落の修正はLABO評価責務へ戻し、他の入力・出力を変更しない。 |
| `L10-LABO-069-CASE-45` | `LABO-069-AC-01` | 単独変異（M2・counterexample） | CASE-01と同一の有効条件。評価candidateにはL2-069所定の4項目すべてを含め、counterexampleは固定scope/revisionと根拠sourceに結び付く。 | 出力candidateの`counterexample`項目だけを欠落させ、他の全項目・証拠・適用条件は保持する。 | AC-01の正常candidateとして合格させず、counterexampleの欠落を明示する。新しい反証規則や閾値は追加しない。 出力欠落の修正はLABO評価責務へ戻し、他の入力・出力を変更しない。 |
| `L10-LABO-069-CASE-46` | `LABO-069-AC-01` | 単独変異（M2・regression risk） | CASE-01と同一の有効条件。評価candidateにはL2-069所定の4項目すべてを含め、regression riskは固定scope/revisionと根拠sourceに結び付く。 | 出力candidateの`regression risk`項目だけを欠落させ、他の全項目・証拠・適用条件は保持する。 | AC-01の正常candidateとして合格させず、regression riskの欠落を明示する。severityやrisk閾値を新設しない。 出力欠落の修正はLABO評価責務へ戻し、他の入力・出力を変更しない。 |
| `L10-LABO-069-CASE-47` | `LABO-069-AC-01` | 単独変異（M2・revalidation condition） | CASE-01と同一の有効条件。評価candidateにはL2-069所定の4項目すべてを含め、revalidation conditionは固定scope/revisionと根拠sourceに結び付く。 | 出力candidateの`revalidation condition`項目だけを欠落させ、他の全項目・証拠・適用条件は保持する。 | AC-01の正常candidateとして合格させず、revalidation conditionの欠落を明示する。新しい再検証threshold、期限、方式は追加しない。 出力欠落の修正はLABO評価責務へ戻し、他の入力・出力を変更しない。 |

### 観測点・判定限界

同一source/revision/scopeでの比較条件、resultごとの成立/不成立/未評価、元closureの不変、evidence-backed relationの根拠、route roleとsource個別identityの別々の記録、評価出力によるticket/authority状態変更の有無を観測する。合格・実行結果は未取得である。本表はfixture候補であり、その行数やID保持から完全性・実行合格を推論しない。
