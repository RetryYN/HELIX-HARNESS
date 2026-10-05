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


状態：未承認のL3/L10候補。対象はStage 2bの採択親 HELIXLABO-L2-002〜010のみ。固定L2/L11が要件authority、PO記録は親の採択登録、G0記録は実装順序だけを示す。本文は実装・実行・リリース許可や要件承認を生成しない。Stage 2bの親・case範囲、source disposition、固定根拠は[このcutoutの不変監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-opus-review01-repair-2026-10-05.json)に固定する。

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
- **L10-LABO-002-CASE-08 negative source identity missing** (`LABO-002-AC-01`, `LABO-002-AC-03`) — 他条件一定でsource identityまたはrevisionだけを欠落させる。期待：episode成功扱いにせずmissing/unknownを明示し、元source/関係契約のownerへ戻す。

- **L10-LABO-002-CASE-09 negative L2-001 dependency identity/revision** (`LABO-002-AC-03`) — 共通baselineからobservation source identityだけをmissing、次に別fixtureでrevisionだけをstale/wrong-revisionへ変える。期待：episode成功扱いにせず、元observation/契約ownerへ返す。別sourceで補完しない。
- **L10-LABO-002-CASE-10 negative L2-001 field census** (`LABO-002-AC-01`, `LABO-002-AC-03`) — `episode_id, requirement_revision, ticket_id, responsibility_id, product, mechanism, worker, provider, model, configuration, artifact, CI/test, release, deployment, runtime, failure, rework, cost, time, result`の各fieldについて、共通baselineから一fieldだけを順にmissing, unknown, stale, wrong-revisionへ変えた独立fixtureを作る。期待：契約上必須のidentity/revision等の欠落・staleは不成立として対応source ownerへ返し、未発生eventだけはCASE-02と同じpartialとして保持する。他sourceから埋めない。
- **L10-LABO-002-CASE-11 negative L2-011 connection receipt** (`LABO-002-AC-03`) — L2-011のAggregate→Correlate接続を同一baselineでidentity/revision/scope/欠測表示/episode↔observation逆参照の各field一つずつmissing/unknown/stale/wrong-revisionにした独立fixtureで照合する。期待：接続成立を主張せず、欠けたfieldを他sourceで補完せず、既存connection/source ownerへ戻す。

- **L10-LABO-002-CASE-12 negative status collapse** (`LABO-002-AC-01`, `LABO-002-AC-02`) — 同一の許可sourceから7状態 `success, failure, rejected, cancelled, blocked, unknown, not_observed` をそれぞれ独立recordで与える。unknown/not_observedをsuccessに変換する、failure/rejectedを落とす、または状態を一つにまとめる変異を各々独立に試す。期待：7値とsource identity/revisionを保持し、誤変換を全て拒否する。
- **L10-LABO-002-CASE-13 normal correlation with undetermined causality** (`LABO-002-AC-01`, `LABO-002-AC-03`) — 有効なsource relationと相関 evidenceを与えるが、causation evidenceは与えない。期待：相関関係を保持し、因果は未確定と明示する。
- **L10-LABO-002-CASE-14 negative proximity-only causality** (`LABO-002-AC-03`) — CASE-13をbaselineとし、時刻だけが近いfixtureとpathだけが一致するfixtureを別々に作る。各fixtureは他の関係根拠を持たない。期待：どちらも相関・因果を創作せず、相関ありの場合も因果断定しない。

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
| 002 episode chain/field/source | `LABO-002-AC-01` | `L10-LABO-002-CASE-01, L10-LABO-002-CASE-02, L10-LABO-002-CASE-07, L10-LABO-002-CASE-10` |
| 002 orphan/missing/incomplete | `LABO-002-AC-02` | `L10-LABO-002-CASE-02, L10-LABO-002-CASE-03, L10-LABO-002-CASE-05, L10-LABO-002-CASE-08` |
| 002 false correlation/correction and dependency rejection | `LABO-002-AC-03` | `L10-LABO-002-CASE-04, L10-LABO-002-CASE-06, L10-LABO-002-CASE-08, L10-LABO-002-CASE-09, L10-LABO-002-CASE-10, L10-LABO-002-CASE-11, L10-LABO-002-CASE-12, L10-LABO-002-CASE-13, L10-LABO-002-CASE-14` |
| 003 independent categories/evidence | `LABO-003-AC-01` | `L10-LABO-003-CASE-01, L10-LABO-003-CASE-07, L10-LABO-003-CASE-08, L10-LABO-003-CASE-09, L10-LABO-003-CASE-10` |
| 003 unknown/condition/contradiction | `LABO-003-AC-02` | `L10-LABO-003-CASE-02, L10-LABO-003-CASE-03, L10-LABO-003-CASE-04, L10-LABO-003-CASE-06, L10-LABO-003-CASE-09` |
| 003 return to evidence source | `LABO-003-AC-03` | `L10-LABO-003-CASE-05, L10-LABO-003-CASE-06, L10-LABO-003-CASE-08, L10-LABO-003-CASE-09` |
| 004 seven axes/守破離 candidate | `LABO-004-AC-01` | `L10-LABO-004-CASE-01, L10-LABO-004-CASE-02, L10-LABO-004-CASE-03, L10-LABO-004-CASE-07, L10-LABO-004-CASE-08, L10-LABO-004-CASE-09, L10-LABO-004-CASE-11` |
| 004 partial match/not authority | `LABO-004-AC-02` | `L10-LABO-004-CASE-02, L10-LABO-004-CASE-06, L10-LABO-004-CASE-09` |
| 004 clarification before transformation | `LABO-004-AC-03` | `L10-LABO-004-CASE-04, L10-LABO-004-CASE-05, L10-LABO-004-CASE-08, L10-LABO-004-CASE-09` |
| 005 12 operations/delta/conditions/scope | `LABO-005-AC-01` | `L10-LABO-005-CASE-01, L10-LABO-005-CASE-02, L10-LABO-005-CASE-08, L10-LABO-005-CASE-09, L10-LABO-005-CASE-10, L10-LABO-005-CASE-11` |
| 005 unresolved meaning/conditions | `LABO-005-AC-02` | `L10-LABO-005-CASE-03, L10-LABO-005-CASE-07, L10-LABO-005-CASE-09, L10-LABO-005-CASE-10, L10-LABO-005-CASE-11` |
| 005 no LABO decision/adoption/retirement | `LABO-005-AC-03` | `L10-LABO-005-CASE-03, L10-LABO-005-CASE-04, L10-LABO-005-CASE-05, L10-LABO-005-CASE-06, L10-LABO-005-CASE-07, L10-LABO-005-CASE-09, L10-LABO-005-CASE-11` |

判定ではmissing/unknownを実測zeroや成功として扱わない。source identity/revision不足は元source owner、relationの誤りはその関係を供給した既存source/contract owner、上流meaning変更判断は既存上流authorityへ戻す。LABOはsource stateを変更せず、Worker/モデルの配置・資格を決めず、candidateを採択・実行しない。旧L10/test/runtimeを実行していない。

## Stage 2b — HELIXLABO-L2-006/007/008/009/010 総合verification oracle

状態：未実行の合成fixture・oracle設計。対象は固定された5親だけ。固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO adoption `633bf12ea8f948db8ba3d6600179c4a9507377a7`、G0順序記録 `1880c422311a7f8321dbb0e2b98fa12c69449201`。G0は順序のみで採択authorityではない。固定source pins、旧資産起点/差分、case countは[本件不変source/pair監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-opus-review01-repair-2026-10-05.json)に固定する。各caseは[L3 functional AC](../L3-requirements/functional-requirements.md)を照合し、実行、assignment、資格、system/operation変更、target registration/routing、PO判断を生成しない。通常例・negativeは記載した一変数だけを変え、未見正常は固定scope内の未見identityで既存ACを再確認する。

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
- **L10-LABO-006-CASE-14 negative required quality reduced for speed**（`LABO-006-AC-01`）— L10-LABO-006-CASE-01と同じticket/experiment/target revision、比較条件、oracle identity/revision/scope、OS assignment、Worker result linkを保ち、candidate armはoracleが事前に宣言した必要品質条件を下回る一方、speed観測はbaseline/currentより改善したfixtureとする。品質とspeed以外のdimension値は同一にする。期待：品質条件の不成立とspeed改善を別dimensionに記録し、品質低下を理由付きで残す。speedで品質違反を相殺せず、比較全体をimprovementとしない。新しい品質閾値は作らない。

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
- CASE-03〜CASE-10で必須情報が欠落・stale・conflictの場合、各期待にはunresolved表示に加えて不足fieldの既存source/current responsibility owner、理由、元identity/revisionへの返却を含める。ownerが不明なら推測せずunknownとして保持する。

- **L10-LABO-008-CASE-15 normal modify candidate** (`LABO-008-AC-01`, `LABO-008-AC-02`) — CASE-01と同じcurrent versionと責務ownerを使い、evidenceがsystem修正候補を支持する独立fixtureを与える。期待：modify candidateをcontinue/fallbackと別に記録し、保証・条件・未完義務を保持する。

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
| baseline/current・candidate・hybridと14比較軸、および必要品質の速度相殺禁止 (`LABO-006-AC-01`) | `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-02`, `L10-LABO-006-CASE-03`, `L10-LABO-006-CASE-04`, `L10-LABO-006-CASE-05`, `L10-LABO-006-CASE-11`, `L10-LABO-006-CASE-14` |
| OS assignment/Worker resultを同じticket・experiment・対象版へ束縛 (`LABO-006-AC-02`) | `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-02`, `L10-LABO-006-CASE-06`, `L10-LABO-006-CASE-07`, `L10-LABO-006-CASE-08`, `L10-LABO-006-CASE-09`, `L10-LABO-006-CASE-10`, `L10-LABO-006-CASE-13` |
| 比較不能・失敗・反例・欠測・中断の保持 (`LABO-006-AC-03`) | `L10-LABO-006-CASE-03`, `L10-LABO-006-CASE-04`, `L10-LABO-006-CASE-05`, `L10-LABO-006-CASE-06`, `L10-LABO-006-CASE-07`, `L10-LABO-006-CASE-10`, `L10-LABO-006-CASE-11`, `L10-LABO-006-CASE-12` |
| 6 assurance conditionsを別々に評価 (`LABO-007-AC-01`) | `L10-LABO-007-CASE-01`, `L10-LABO-007-CASE-02`, `L10-LABO-007-CASE-03`, `L10-LABO-007-CASE-04`, `L10-LABO-007-CASE-05`, `L10-LABO-007-CASE-06`, `L10-LABO-007-CASE-07`, `L10-LABO-007-CASE-08`, `L10-LABO-007-CASE-09`, `L10-LABO-007-CASE-14`, `L10-LABO-007-CASE-15`, `L10-LABO-007-CASE-17` |
| systemization/operation continuationの両候補と限界 (`LABO-007-AC-02`) | `L10-LABO-007-CASE-01`, `L10-LABO-007-CASE-02`, `L10-LABO-007-CASE-09`, `L10-LABO-007-CASE-11`, `L10-LABO-007-CASE-14`, `L10-LABO-007-CASE-15`, `L10-LABO-007-CASE-16`, `L10-LABO-007-CASE-17` |
| 自動昇格・資格・新gateを生成しない (`LABO-007-AC-03`) | `L10-LABO-007-CASE-10`, `L10-LABO-007-CASE-11`, `L10-LABO-007-CASE-12`, `L10-LABO-007-CASE-13`, `L10-LABO-007-CASE-16` |
| 運用証拠に基づくcontinue/modify/fallback候補 (`LABO-008-AC-01`) | `L10-LABO-008-CASE-01`, `L10-LABO-008-CASE-02`, `L10-LABO-008-CASE-03`, `L10-LABO-008-CASE-04`, `L10-LABO-008-CASE-05`, `L10-LABO-008-CASE-06`, `L10-LABO-008-CASE-07`, `L10-LABO-008-CASE-08` |
| 保証・復帰条件・unfinished duty保持 (`LABO-008-AC-02`) | `L10-LABO-008-CASE-01`, `L10-LABO-008-CASE-02`, `L10-LABO-008-CASE-09`, `L10-LABO-008-CASE-10` |
| LABOはswitchせず不明ownerを推測しない (`LABO-008-AC-03`) | `L10-LABO-008-CASE-03`, `L10-LABO-008-CASE-04`, `L10-LABO-008-CASE-05`, `L10-LABO-008-CASE-06`, `L10-LABO-008-CASE-07`, `L10-LABO-008-CASE-08`, `L10-LABO-008-CASE-09`, `L10-LABO-008-CASE-10`, `L10-LABO-008-CASE-11`, `L10-LABO-008-CASE-12`, `L10-LABO-008-CASE-13`, `L10-LABO-008-CASE-14`, `L10-LABO-008-CASE-15` |
| 5 scope levelsの証拠・sample条件 (`LABO-009-AC-01`) | `L10-LABO-009-CASE-01`, `L10-LABO-009-CASE-02`, `L10-LABO-009-CASE-03`, `L10-LABO-009-CASE-04`, `L10-LABO-009-CASE-05`, `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-07`, `L10-LABO-009-CASE-08`, `L10-LABO-009-CASE-09`, `L10-LABO-009-CASE-10`, `L10-LABO-009-CASE-11`, `L10-LABO-009-CASE-13`, `L10-LABO-009-CASE-14` |
| counterexampleによるscope縮小とFeedback先分離 (`LABO-009-AC-02`) | `L10-LABO-009-CASE-04`, `L10-LABO-009-CASE-05`, `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-12`, `L10-LABO-009-CASE-15` |
| missing/unknown/incomparableを未確定に保つ (`LABO-009-AC-03`) | `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-07`, `L10-LABO-009-CASE-08`, `L10-LABO-009-CASE-09`, `L10-LABO-009-CASE-10`, `L10-LABO-009-CASE-13`, `L10-LABO-009-CASE-16` |
| 全16 mandatory fields (`LABO-010-AC-01`) | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-03`, `L10-LABO-010-CASE-04`, `L10-LABO-010-CASE-05`, `L10-LABO-010-CASE-06`, `L10-LABO-010-CASE-07`, `L10-LABO-010-CASE-08`, `L10-LABO-010-CASE-09`, `L10-LABO-010-CASE-10`, `L10-LABO-010-CASE-11`, `L10-LABO-010-CASE-12`, `L10-LABO-010-CASE-13`, `L10-LABO-010-CASE-14`, `L10-LABO-010-CASE-15`, `L10-LABO-010-CASE-16`, `L10-LABO-010-CASE-17`, `L10-LABO-010-CASE-18`, `L10-LABO-010-CASE-24`, `L10-LABO-010-CASE-25`, `L10-LABO-010-CASE-26`, `L10-LABO-010-CASE-27`, `L10-LABO-010-CASE-28` |
| 8 valid actionと列挙外unknown (`LABO-010-AC-02`) | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-17`, `L10-LABO-010-CASE-19` |
| target-specific proposal/OS・target authority境界 (`LABO-010-AC-03`) | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-05`, `L10-LABO-010-CASE-06`, `L10-LABO-010-CASE-13`, `L10-LABO-010-CASE-14`, `L10-LABO-010-CASE-20`, `L10-LABO-010-CASE-21`, `L10-LABO-010-CASE-22`, `L10-LABO-010-CASE-23`, `L10-LABO-010-CASE-24`, `L10-LABO-010-CASE-25`, `L10-LABO-010-CASE-26`, `L10-LABO-010-CASE-27`, `L10-LABO-010-CASE-28` |
