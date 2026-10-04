# HELIX-LABO L10 機能総合検証（1.0対象親57件の草稿）

**状態：部分草稿・未承認・未実行。** 本書は`../L3-requirements/functional-requirements.md`のStage 1、Stage 2a、Stage 2bの31件、Stage 4のLABO-L2-036/037/038/039/040/041/052/054、およびStage 5のLABO-L2-050/059/060/061/063/064/065/066/067/068/069/070/071のassigned AC候補をシステム境界で照合する設計である。以下は検証fixtureとoracle設計であり、runtime実行結果・green・実装許可を意味しない。採否はL3と一体で通常のPO L3承認へ送る。

旧HELIXのtest-design起点として、旧L10定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`（`LEGACY-ASSET-34DF3B535879CC73FA86`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）の要件挙動をsystem-levelで照合する意味を保持する。旧test-designは旧L10文書そのものとは扱わず、ここでは対のoracle設計からfailure classだけを参照する。旧source/test/runtimeを実行しない。

## HELIXLABO-L2-001 — L10 oracle（対応 `LABO-001-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-labo/L2-requirements/labo-requirements.md:69-76` span SHA-256 `9c1f285a0835a56fd7042025636ff68c2bca46d31eb2df693465d02fe772a104`。対L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`.
- 対応AC: `LABO-001-AC-01`, `LABO-001-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-LABO-001-C01**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：L2-021〜030から個別採択されたsource contractのrevisionを明示し、その許可sourceの実在field/status eventを取り込む。 **期待oracle**：許可されたsourceごとに20 fieldとsource identity/revisionを保持し、実在するstatusを個別状態として出す。fixtureに存在しないstatusを捏造しない。
- **L10-LABO-001-C02**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：一つのsourceだけ破損し、他sourceは有効な場合、対象sourceのwarning/unknownを分離して有効sourceは保つ。 **期待oracle**：破損sourceだけwarning/unknownになり、他sourceの有効recordは維持される。
- **L10-LABO-001-C03**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：元source snapshotにはfailure/rejected/cancelled/blocked/unknown/not_observed eventが存在するのに、success-only projectionがそれらを落とすfixtureを与える。 **期待oracle**：元sourceの非success event欠落を検出し、そのsourceを欠落理由付きhold/warningにする。元source上に非success eventがないcaseは拒否しない。
- **L10-LABO-001-C04**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：source revision missing/staleをcurrentとして提示する。 **期待oracle**：missing/stale revisionはunknown/holdになり、current identityを付与せずsource ownerへ返る。
- **L10-LABO-001-C05**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：secretまたは許可scope外の情報を与える。 **期待oracle**：secret/out-of-scope inputは取り込み成功にならず、source ownerへ理由付きで返る。
- **L10-LABO-001-C06**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：LABOからsource canonical recordへ書き戻そうとする。 **期待oracle**：LABO observationは保持するがsource canonical stateへのwritebackは0であり、要求を権限境界で拒否する。
- **L10-LABO-001-C07**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：Web/WEB-OS source contractが未選択/未採択の場合に1.0必須と誤認する。 **期待oracle**：Web/WEB-OS未選択時はsource接続をoptional/unconfiguredとして示し、1.0必須依存エラーにしない。
- **L10-LABO-001-C08**（AC `LABO-001-AC-01`に対応）：観測期間内の許可sourceにsuccess eventのみが存在し、他statusは発生していないsnapshotを与える。 **期待oracle**：実在するsuccess recordを正常に取り込み、未発生のfailure/rejected/blocked/not_observedを生成せず、存在しないstatusの欠落errorも出さない。
- **L10-LABO-001-C09**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：既知の過去source revision・観測時点が保持されたhistorical observationと、同じ古いrevisionをcurrentと偽装した入力を別々に与える。 **期待oracle**：正確な過去revisionのhistoryはhistoricalとして保存・追跡し、currentと偽装したものだけをstale/unknownとして拒否する。
- **L10-LABO-001-C10**（AC `LABO-001-AC-01`／`LABO-001-AC-02`に対応）：他のfieldが有効な許可source observationから必須fieldを一つ欠落させ、別sourceには有効recordを与える。 **期待oracle**：field欠落observationは成功扱いせず欠落理由付きでholdしsource責務へ返す。他sourceの有効recordは保持し、欠落値を推測補完しない。

### 観測点とoracle

source identity/revisionごとの観測；20 field identitiesと7 status classifications；source state/authorityとLABO observationの分離；missing/unknown reasonと戻し先；source単位warningと他sourceの独立性。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：旧`AC-FR-BR21-09`（`business-detail.md:137-145`）は壊れたinvocation_logだけをskipし他sourceを保つHARNESS dashboardのfailure例。部分source破損を分離するfailure classのみ類例にし、旧4 source/5 metric/30秒pollを移さない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## HELIXLABO-L2-011 — L10 oracle（対応 `LABO-011-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-labo/L2-requirements/labo-requirements.md:163-166` span SHA-256 `9fcf8b7b648681c7ff08080565a2d708cdd9c5a619e40e8f8bad6196f4c36cb6`。対L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`.
- 対応AC: `LABO-011-AC-01`, `LABO-011-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-LABO-011-C01**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：L2-001 Aggregate identity/outputをsource revision付きで参照してsource-backed observationをepisode candidateにし、元sourceへdereferenceできる。専用connector `HELIXLABO-L2-011`のadmitted identity/revision、schema version、source provenanceを同時に入力する。 **期待oracle**：episode candidateから元observation identity/source revisionへ戻れ、revision・fieldと専用connector契約が一致する。
- **L10-LABO-011-C02**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：observation identity欠落、source revision欠落/不一致、または専用connector `HELIXLABO-L2-011`のidentity/revision/schema/provenance欠落・不一致を各単独および併発で投入。 **期待oracle**：identity/revision不一致はunresolvedとして示し、元source recordを保持して該当source/correlation ownerへ返す。connector不一致は接続成功にしない。
- **L10-LABO-011-C03**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：Aggregate engine成功だけでCorrelate接続も成功と主張する。 **期待oracle**：Aggregateの成功状態とAggregate→Correlate接続状態を分離し、未接続を成功表示しない。
- **L10-LABO-011-C04**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：relation/field不一致またはsource observation欠落。 **期待oracle**：不一致relationは補完せずunresolvedを保持し、元recordと不一致理由をcorrelation側へ返す。
- **L10-LABO-011-C05**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：同時刻/同pathだが因果evidenceのないevent。 **期待oracle**：causal evidenceのないeventはrelated/unknownまでとし、causalに確定しない。
- **L10-LABO-011-C06**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：relation不一致をcorrelationへ戻して再照合する際、元source eventを保持する。 **期待oracle**：不一致を黙って補完・上書きせず、元source recordとrevisionを保ってcorrelationへ戻す。source contractが訂正後revisionを供給する場合はそのrevisionを別の入力として照合するが、独立したdiscrepancy recordは必須にしない。

### 観測点とoracle

input observation identity/source revision；episode candidate identityとrelation evidence；source refの往復一致；unknown/missing stateと戻し先；evidenceなしのcausal assertionがないこと。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：直接対応する旧oracleは確認できない。旧BR-21の部分失敗時にrecordを失わない考えのみ類例で、因果・時間相関規則は継承しない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## 結果記録上の制約

実装前の静的な設計であり、fixture/期待出力の定義までを行う。実行、CI、旧test、旧runtimeによる合格主張は含まない。検証実装と実測は下流責務であり、ここでL4/L7を定義しない。


## HELIXLABO-L2-055 — L10 oracle（対応 `LABO-055-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 150–155行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `f6c97eeef48634ec11fc36f849763a35da358f5ce89490f6c785c9f67b4575c7`、heading「### HELIXLABO-L2-055 — HELIX-Bench 作業水準生成（1.0）」。
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` line 56（raw SHA-256 `9e169e5f6a6eead24677031a479dba94060fe6916e76f4e3b1508527880f13c5`、未知jobを履歴だけで成功保証しない）と採択追補191–197（全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、span SHA-256 `c585c90b04dc2f8cf5c979ea4096a2c877029a234ce5f5154aac4267e23fa46c`）、heading「### HELIXLABO-L2-055 — Bench分母・欠測・採点根拠」。
- 対応AC: `LABO-055-AC-01`, `LABO-055-AC-02`。正常・失敗・境界を別caseで置き、親のowner/state authorityをまたがせない。

### 検証fixtureとcase

- **L10-LABO-055-C01**（AC `LABO-055-AC-01`）: 許可history snapshotからtask/model class/scopeのeligible denominatorを作り、numeric metricまたはqualitative levelを出す。期待oracle: denominator、算入record、metric/scorer revision、basisと評価scopeから出力を再構成できる。
- **L10-LABO-055-C02**（AC `LABO-055-AC-01`／`LABO-055-AC-02`）: failed/missing/unknown resultを理由なく外し、結果後にdenominatorを縮める。期待oracle:各除外/dispositionと理由を示すか、根拠不十分として水準を保留し、scoreを高く補正しない。
- **L10-LABO-055-C03**（AC `LABO-055-AC-01`／`LABO-055-AC-02`）: 未評価model classを評価済みへ変更、またはfailed quality eventをaverageで相殺する。期待oracle: classをunassessedのまま、failureをfailureで保持し、未根拠levelを出さない。
- **L10-LABO-055-C04**（AC `LABO-055-AC-01`／`LABO-055-AC-02`）: 二つのfixtureを対にする。正常側は許可済みsource receiptに結び付く既知task class/model classの定性的水準を与え、適用条件・判定根拠・未評価部分を特定可能にする。未見側は新task class、source、scorer/oracle版を含み適用性根拠がないsnapshotと過去classの水準だけを与える。期待oracle: 正常側はsource receiptから水準のscope/適用条件/根拠/未評価部分を再構成できる。未見側は該当範囲を未評価に保ち、履歴だけで未知jobの成功を保証しない。どちらも配置案・指定・割当て・権限を生成しない。恣意的なsample数/thresholdを足さず、欠測理由とowner返却先を追跡できる。

### 観測点とoracle

L2-055/L11-055はeligible denominatorと各disposition/reasonおよびscorer revisionを明示し、未評価classも表示する。標本数、重み付け、信頼区間、固定cutoffは現scopeに指定がなく、全task class共通条件にはしない。別の評価判断が特定の必要数を要すると分かった場合はtask/model/scope別に根拠・比較・測定案をL3候補として示す。 各fixtureはparent identity/scope/revisionを記録し、証拠欠落を成功や新しいauthorityへ読み替えない。


## HELIXLABO-L2-056 — L10 oracle（対応 `LABO-056-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 379–390行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `d8d9c30b52c338580f535a913a4b04d67f0d3d59d79eb2645ed33c911b1621c7`、heading「### HELIXLABO-L2-056 — 初回Worker結果のBench観測取込（単体候補、1.0）」。
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` 138–147行、全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、該当span SHA-256 `b2c453c3cdc4aa99ee2df28d3c1a6c96dc2bd4d3d68d41c77ad49dc78243f3ed`、heading「### HELIXLABO-L2-056 初回Worker結果のBench観測取込」。
- 対応AC: `LABO-056-AC-01`, `LABO-056-AC-02`。正常・失敗・境界を別caseで置き、親のowner/state authorityをまたがせない。

### 検証fixtureとcase

- **L10-LABO-056-C01**（AC `LABO-056-AC-01`）: 初回の許可Worker resultについて、assignment/ticket/attempt、task class、Worker/model identity、実行契約revision、要求/source revision、scope、run identity、result status、verification、data-use classificationとsource receiptを入力する。receiptのmodel/source/revision/scope/run identityが実runと一致する正常例と、各identity/revision/scope/run不一致を個別に変異した対照を与える。期待oracle: 一致する正常例だけ全fieldを保ち「観測済み・未評価」を追加し、不一致例は元identityの観測と理由を保って水準へ算入しない。
- **L10-LABO-056-C02**（AC `LABO-056-AC-01`／`LABO-056-AC-02`）: 初回success一件だけを与え、accepted/evaluated/qualifiedとする。期待oracle: 観測は記録するが、単発successだけを根拠に評価済み・適格化しない。
- **L10-LABO-056-C03**（AC `LABO-056-AC-01`／`LABO-056-AC-02`）: failed/rejected/interrupted/unknown statusesをそれぞれ与える。期待oracle: statusesを個別のまま履歴化しunknownやfailureをsuccessへまとめない。
- **L10-LABO-056-C04**（AC `LABO-056-AC-01`／`LABO-056-AC-02`）: receiptのmodel/source/revision/scope/run identityの各々を実runと不一致にし、加えてtask class mismatch、data-use/verification欠落、new provider/model/toolchain、scorer/source revision mismatch、同一/矛盾記録を単独・併発で与える。期待oracle: 無言統合せず元observationと各不一致理由を保持し、該当範囲を未評価としてOS/SECURITY/Workerまたはoracle/source ownerへ戻す。評価済みは適用oracle・範囲・比較・反例・判定receiptまで揃ったcaseのみ。任意の期限・一律再評価間隔を作らず、sourceとの不一致を実績なしへ書き換えない。
- **L10-LABO-056-C05**（AC `LABO-056-AC-01`）: 観測resultとは独立して、対象task/model/scopeを判定できる評価oracleと基準revision、判定・比較条件、結果、failure/反例/unknownの扱い、評価者、時点、判定receiptがすべて揃うfixtureを与える。期待oracle: 該当scopeに限り「評価済み」とその根拠receiptを記録し、単なる観測済み状態と区別する。qualified/eligible/assignmentやWorker authorityは生成せず、他scopeへ一般化しない。

### 観測点とoracle

L2-056/L11-056は入力field群とobserved≠evaluatedを明示する。C01/C03/C04は結果取込と未評価・failure境界を、C05は完全な評価証跡があるscope限定の正常分岐を照合する。単発結果の取込品質に標本数を成功条件として足さず、評価側に標本数が必要ならtask/model/scope限定の根拠・比較・測定付き候補として扱う。どのcaseもqualified/eligible/assignment/authorityを生成せず、各fixtureはparent identity/scope/revisionを記録する。


## HELIXLABO-L2-057 — L10 oracle（対応 `LABO-057-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 391–402行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `d5a62f8588867f80e17e1931f7570c72c89f28eedfd30a5aa9a368fbaba8004d`、heading「### HELIXLABO-L2-057 — 初回実行結果のBench受領接続（接続候補、1.0）」。
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` 148–155行、全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、該当span SHA-256 `ac433c56cece7fae90458ab3e3edf556425b90af8c1917ec60a1c61479bb3b60`、heading「### HELIXLABO-L2-057 初回実行結果のBench受領接続」。
- 対応AC: `LABO-057-AC-01`, `LABO-057-AC-02`。正常・失敗・境界を別caseで置き、親のowner/state authorityをまたがせない。

### 検証fixtureとcase

- **L10-LABO-057-C01**（AC `LABO-057-AC-01`）: OS-L2-018/019/023のresultを同一source identityでaccepted CONNECT contract経由で送信し、LABO-028 accepted receiptを得る。human-confirmation statusとunfinished obligationがある入力ではsource/receipt双方へ同値を与える。期待oracle:送受revision/scope/status/evidence/human-confirmation/unfinished-obligationが一致し、trace/ackがあり、recordは後続LABO履歴へ渡せるがevaluationは作らない。
- **L10-LABO-057-C02**（AC `LABO-057-AC-01`／`LABO-057-AC-02`）: 採択済CONNECT契約が無いが、親で認める明示的な人手receiptにより同じschema/version/scope/identity/ack義務を示す。期待oracle:同義務が証明された場合だけ受領成立と記録する。人手receipt自体を新しい承認gateにしない。
- **L10-LABO-057-C03**（AC `LABO-057-AC-01`／`LABO-057-AC-02`）: CONNECT contractも人手receiptもない、またはackが欠落するfixture。期待oracle:未受領/unknownとしてOSへ返し、受領成功を主張しない。
- **L10-LABO-057-C04**（AC `LABO-057-AC-01`／`LABO-057-AC-02`）: 同じsource identityを再送し、またはduplicate delivery receiptを二度受ける。期待oracle:same-ID retryは冪等で新規observationを作らず重複を検出する。
- **L10-LABO-057-C05**（AC `LABO-057-AC-01`／`LABO-057-AC-02`）: stale revision/schema/scope mismatch、result stateの改変、人確認statusの欠落、unfinished obligationの削除、OS-027 absenceを別fixtureで与える。期待oracle:不一致/staleは止めて元statusと未完義務を保ち、OS-027不在だけでは失格にしない。

### 観測点とoracle

L2-057/L11-057はack/trace/dedup/stale-stop/same-ID retry/unfinished obligationを明示。field一致と再送冪等性が親条件の直接測定候補。delivery acceptanceが生産する結果評価を増やさない。 各fixtureはparent identity/scope/revisionを記録し、証拠欠落を成功や新しいauthorityへ読み替えない。


## Stage 2b 基本エンジン（未承認・未実行の検証設計）

以下は `functional-requirements.md` の9 FR/18 ACへ対応する初回L10候補。固定親はPO basis `633bf12`、revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、L2 source full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`。共通L11 acceptance source `docs/helix-labo/L11-acceptance/labo-acceptance.md` は同一fixed revision、full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、common spans L43–47 `d4891130ef25adf720c5e68b584cb17bd12066ea29fc7c4b50585a1cc49d5a8b` / L109–116 `7e3bcd9acc0c1b35d2d6d5d56ffb5081825a4cae12386612a9a986a645cdc41d`。表中のcaseは設計であり実装済みtest/実行結果ではない。

| 親ID | registration / decision | L2 raw span | 個別L11受入行（raw） | FR / AC | L10 cases |
|---|---|---|---|---|---|
| `HELIXLABO-L2-002` | `MPR-RC-HELIXLABO-L2-002-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L49 | L77–84 `d4ecde864ac4129741f32ac65d0075d1d0704cc7166b86491bbae6ef8865bf28` | L11 46 `ce062011fb183b86d221549f02b2885afe619ec15acbd3e3442e9fbe12fc3465` | `LABO-002-FR-01`, `LABO-002-AC-01/02` | `L10-LABO-002-C01..C04` |
| `HELIXLABO-L2-003` | `MPR-RC-HELIXLABO-L2-003-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L50 | L85–92 `5a5472b632726e3b6069e251024c59dbb4c076889bf48771d4cd306907922901` | L11 47 `3ae2ba712bfb8343c1e8b451c3c5803e1fddecaa94137dbe1ae6f793a340852f` | `LABO-003-FR-01`, `LABO-003-AC-01/02` | `L10-LABO-003-C01..C04` |
| `HELIXLABO-L2-004` | `MPR-RC-HELIXLABO-L2-004-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L51 | L93–100 `6f1751ca2ca2dddd1e1065a68421d63e3c18ce656786c9c1fe318b1a4e458889` | L11 48 `8bb5f1bb12ea7acac957089b86ed6a9743027e21d3d8d8082f265cf181d73025` | `LABO-004-FR-01`, `LABO-004-AC-01/02` | `L10-LABO-004-C01..C04` |
| `HELIXLABO-L2-005` | `MPR-RC-HELIXLABO-L2-005-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L52 | L101–108 `3b7f37f57a9db5df451275962aa0a90f951cf61e23496828cb9a078f52bc36ee` | L11 49 `01dc15d6bd73a2b3ebc8e72c4deb42746c8eadc43d54010791472345a10d5a92` | `LABO-005-FR-01`, `LABO-005-AC-01/02` | `L10-LABO-005-C01..C04` |
| `HELIXLABO-L2-006` | `MPR-RC-HELIXLABO-L2-006-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L53 | L109–116 `2d5aa6810c6a2a21c532e7f2a96ec39fdef9b8e6040b476b23187f3be0bd02ce` | L11 50 `b4ac64ec8fb37afed92f5a2603e9229af869fa0a480d7b092a6befc2cfe43c4f` | `LABO-006-FR-01`, `LABO-006-AC-01/02` | `L10-LABO-006-C01..C04` |
| `HELIXLABO-L2-007` | `MPR-RC-HELIXLABO-L2-007-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L54 | L117–124 `89aa2011a64af3475f1bf23f6e52d2622535c96b374bebbc6926c5bab280c84e` | L11 51 `afa339ed01fdff62267af2e2a4949cc57f0bdb194914c73a4089effa22420cae` | `LABO-007-FR-01`, `LABO-007-AC-01/02` | `L10-LABO-007-C01..C06` |
| `HELIXLABO-L2-008` | `MPR-RC-HELIXLABO-L2-008-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L55 | L125–132 `08da4c2fb64ede944ace1e21fe8f165a161fe981e902458a8263602040d581ce` | L11 52 `d2d4785d5f765725129590fcae76f91676a4a278ae3b831fe847c82c582d3eb2` | `LABO-008-FR-01`, `LABO-008-AC-01/02` | `L10-LABO-008-C01..C04` |
| `HELIXLABO-L2-009` | `MPR-RC-HELIXLABO-L2-009-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L56 | L133–140 `de30f29aef8d0d1af93e32843fadd823afc398352d9017fe24dfc84a2f7bd025` | L11 53 `5cf6b05ac4a5565415593b8892c37abe678889b6ba101851a9b1d7bad1e58e07` | `LABO-009-FR-01`, `LABO-009-AC-01/02` | `L10-LABO-009-C01..C04` |
| `HELIXLABO-L2-010` | `MPR-RC-HELIXLABO-L2-010-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L57 | L141–149 `6ffc430c2762f509b39c2baab152115de82834be0cf168575470ed3832f9294e` | L11 54 `7c26ac7e6e33c5f4765085decc6b3e0819a049667ad2920b301f439ea9269033` | `LABO-010-FR-01`, `LABO-010-AC-01/02` | `L10-LABO-010-C01..C04` |

| 親ID | registration / decision | L2 raw span | L11 raw span（採択対象） | FR / AC | L10 cases |
|---|---|---|---|---|---|
| `HELIXLABO-L2-055` | `MPR-RC-HELIXLABO-L2-055-002`, semantic `7796690dfd399e1f5d0cccddde8c7aeabb5da5dd2d8ab7edcdd3e71e74e84065`, PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L58` | L150–155 `f6c97eeef48634ec11fc36f849763a35da358f5ce89490f6c785c9f67b4575c7` | L11 L56 `9e169e5f6a6eead24677031a479dba94060fe6916e76f4e3b1508527880f13c5`（未知jobを履歴だけで成功保証しない）; adopted supplement L191–197 `c585c90b04dc2f8cf5c979ea4096a2c877029a234ce5f5154aac4267e23fa46c` | `LABO-055-FR-01`, `LABO-055-AC-01/02` | `L10-LABO-055-C01..C04` |
| `HELIXLABO-L2-056` | `MPR-RC-HELIXLABO-L2-056-003`, semantic `5965a1449b772ba7b53b1e47325a0f0ce77cbde29eb4f6d80c68c9911db48019`, PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L96` | L379–390 `d8d9c30b52c338580f535a913a4b04d67f0d3d59d79eb2645ed33c911b1621c7` | L11 L138–147 `b2c453c3cdc4aa99ee2df28d3c1a6c96dc2bd4d3d68d41c77ad49dc78243f3ed` + adopted supplement L198–203 `24d96629585ccb7f8bb248f7748d06575c3af38f892753d306733eb9609bb1e0` | `LABO-056-FR-01`, `LABO-056-AC-01/02` | `L10-LABO-056-C01..C05` |
| `HELIXLABO-L2-057` | `MPR-RC-HELIXLABO-L2-057-002`, semantic `4c8acbcfcf35bcdb62d6e5371141135b7a70da1d69115a41194065471b4fa63b`, PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L97` | L391–402 `d5a62f8588867f80e17e1931f7570c72c89f28eedfd30a5aa9a368fbaba8004d` | L11 L148–155 `ac433c56cece7fae90458ab3e3edf556425b90af8c1917ec60a1c61479bb3b60` | `LABO-057-FR-01`, `LABO-057-AC-01/02` | `L10-LABO-057-C01..C05` |
| `HELIXLABO-L2-070` | `MPR-RC-HELIXLABO-L2-070-001`, semantic `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`, PO decision `docs/governance/decisions/po-decision-2026-09-30-live26.md#L49` | L561–575 `82b94ab1ed63d1ab15476e61bfd4fec07c202a2b5874d5f3dffa6161969da064` | L11 L297–307 `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1` | `LABO-070-FR`, assigned AC | `CASE-LABO-L10-070-01/02` |
| `HELIXLABO-L2-071` | `MPR-RC-HELIXLABO-L2-071-001`, semantic `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f`, PO decision `docs/governance/decisions/po-decision-2026-09-30-live26.md#L50` | L576–584 `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f` | L11 L311–316 `1f8ef8bdb0a6daf2a0e24fb2150fd28c3339d33bd45537a1d039d563264d9655` | `LABO-071-FR`, assigned AC | `CASE-LABO-L10-071-01/02` |

### L10-LABO-002-C01 — `親の正常系列`

- 対応: `LABO-002-AC-01`; 親: `HELIXLABO-L2-002`。
- 入力fixture: L2-001から出た複数の許可observationを入力。 requirement revision→ticket→Worker→implementation→atomic CI→integration/proof CI→release/deployment/runtime→incident/recoveryのうち存在するeventと明示relationを含め、各実在eventにsuccess/failure/rejected/cancelled/blocked/unknown/not_observedの実在statusを割り当て、episode identityへの結合も記録する。未発生eventを一つ含める。
- 期待oracle: episode graphは実在eventを7 statusのいずれかとしてsource/revision・episode identity・relation証拠と一体に結び、未発生/不足statusを捏造せず元sourceへの参照を往復保持。

### L10-LABO-002-C02 — `因果誤判定の個別・組合せ`

- 対応: `LABO-002-AC-02`; 親: `HELIXLABO-L2-002`。
- 入力fixture: (a)時間だけ近接の無関係event、(b)同pathだが別ticket/revision、(c)source identity欠落、(d)上記を同時投入。無関係eventを同じepisodeへ結ぶmutationを個別に含める。
- 期待oracle: (a)(b)は同一episode/因果edgeを作らずrelation候補/孤立を保持し、無関係eventの結合数は0。(c)はunknownとして当該event ownerへ戻す。(d)でも他の有効edgeを破棄せず誤因果0、未完義務を列挙。

### L10-LABO-002-C03 — `訂正・戻し`

- 対応: `LABO-002-AC-02`; 親: `HELIXLABO-L2-002`。
- 入力fixture: 正しいrelationを後から訂正する入力とsource eventのimmutable snapshotを与える。
- 期待oracle: relation correctionだけが変化し元event bytes/identityと過去revisionは維持される。

### L10-LABO-002-C04 — `held-out正常`

- 対応: `LABO-002-AC-01`; 親: `HELIXLABO-L2-002`。
- 入力fixture: 未見の許可source typeだが既存source identity/revision/明示relation contractに従うevent群を与える。
- 期待oracle: 未知だから一律失敗とはせず、契約で解釈可能なrelationだけ同じprovenance oracleで出力。

### L10-LABO-003-C01 — `分類正常`

- 対応: `LABO-003-AC-01`; 親: `HELIXLABO-L2-003`。
- 入力fixture: evidence付きepisodeに良い点、悪い点、条件依存、generic/product/system/operation候補、不明、不要を含む有限fixtureを与える。
- 期待oracle: 9分類が個別fieldとなり、それぞれ根拠とsource spanへ戻れる。矛盾する点はunknown保持。

### L10-LABO-003-C02 — `分類欠落/二択化`

- 対応: `LABO-003-AC-02`; 親: `HELIXLABO-L2-003`。
- 入力fixture: (a)欠測 evidence、(b)contradiction、(c)分類軸を1つへ畳む、(d)複合mutation。
- 期待oracle: (a)(b)をunknown/未確定へ分離。(c)は不合格。複合時は不足fieldと戻し先をすべて示す。

### L10-LABO-003-C03 — `分類依存の誤昇格`

- 対応: `LABO-003-AC-02`; 親: `HELIXLABO-L2-003`。
- 入力fixture: generic根拠なしのsystem候補化、product固有根拠を汎用候補へ転送。
- 期待oracle: 上位候補は保留され、適用範囲と不足evidenceをsource ownerへ返す。

### L10-LABO-003-C04 — `held-out正常`

- 対応: `LABO-003-AC-01`; 親: `HELIXLABO-L2-003`。
- 入力fixture: 親の分類語彙に収まる新しい種類のsource evidenceで、どの分類にも十分入らないcaseを与える。
- 期待oracle: 親の既存fieldを使いunknown/unnecessary等へ根拠付き分類し、語彙やauthorityを新設しない。

### L10-LABO-004-C01 — `比較正常`

- 対応: `LABO-004-AC-01`; 親: `HELIXLABO-L2-004`。
- 入力fixture: 意味既知の既存方式と、同一source revisionに結びつく目的/構造/動作/仮定/制約/保証/cost evidenceを与える。
- 期待oracle: 7要素を個別比較し、守で維持、破で部分差分、離で有効部candidateを返す。変更前source identityを保存。

### L10-LABO-004-C02 — `意味不足/項目欠落`

- 対応: `LABO-004-AC-02`; 親: `HELIXLABO-L2-004`。
- 入力fixture: (a)目的不明、(b)guarantee evidence欠落、(c)cost不明、(d)複合欠落。
- 期待oracle: 未知項目を推測せずunknown。意味不明なら変換を停止しsource ownerへclarification。比較可能な他項目は失わない。

### L10-LABO-004-C03 — `意味差を明示した候補と自動確定の否定`

- 対応: `LABO-004-AC-02`; 親: `HELIXLABO-L2-004`。
- 入力fixture: (a)一要素だけが一致する部分candidateを方式全体の同等と表示、(b)目的反転または制約除去の意味差を明示したcandidate、(c)同じ差分を隠して元の意味を保つよう装うcandidate、(d)根拠なしcost=0補完、(e)候補を上流判断前に決定/実施へ昇格するmutationを分ける。
- 期待oracle: (a)一致fieldだけを比較可能として残し、全体同等とはしない。(b)意味変更proposalとして保持し、source/L1 ownerへ判断材料とともに戻す。(c)隠蔽、(d)無根拠補完、(e)自動確定/実施だけを不成立とする。意味変更案を示すこと自体は禁止しない。

### L10-LABO-004-C04 — `held-out正常`

- 対応: `LABO-004-AC-01`; 親: `HELIXLABO-L2-004`。
- 入力fixture: 未見の方式でも7要素の根拠とsourceが揃うfixture。
- 期待oracle: 固定enumeration追加なく比較candidateへ通し、解釈限界を示す。

### L10-LABO-005-C01 — `候補比較正常`

- 対応: `LABO-005-AC-01`; 親: `HELIXLABO-L2-005`。
- 入力fixture: 親のcandidate仮説と現行機構を入力し、keep/split/replace/operation fallback等の2案、保持/変更意味、適用条件、責務ownerを設定。
- 期待oracle: 列挙actionごと比較を保持。既存機構吸収やoperation復帰を含め、増設を前提化しない。意味変更は上流判断候補として出る。

### L10-LABO-005-C02 — `語彙/意味境界失敗`

- 対応: `LABO-005-AC-02`; 親: `HELIXLABO-L2-005`。
- 入力fixture: (a)許可外action、(b)保持/変更意味欠落、(c)owner移動先なし、(d)すべて併発。
- 期待oracle: 不明候補を確定させず不足要素とownerを示し差戻す。LABO stateやownerを変更しない。

### L10-LABO-005-C03 — `自動決定の否定`

- 対応: `LABO-005-AC-02`; 親: `HELIXLABO-L2-005`。
- 入力fixture: 候補出力から人の意味判断、retire実行、system変更が生成されるmutation。
- 期待oracle: 提案としてのみ記録され、決定/実変更/完了は0。

### L10-LABO-005-C04 — `held-out正常`

- 対応: `LABO-005-AC-01`; 親: `HELIXLABO-L2-005`。
- 入力fixture: 未見の適用条件で親の既存action語彙を使う複数candidate。
- 期待oracle: 意味差・限界が記録されていれば比較でき、追加action語彙や新gateを要求しない。

### L10-LABO-006-C01 — `比較可能な正常実験`

- 対応: `LABO-006-AC-01`; 親: `HELIXLABO-L2-006`。
- 入力fixture: 同一ticket/experiment/target version、OS assignment、Worker実行結果、baseline/current/candidate/hybrid条件、品質oracle、cost証跡を与える。
- 期待oracle: 品質を個別に判定し、成功/失敗、FP/FN、rework、time、CI/Worker時間、token/API、人介入、context、complexity、recovery、release lead time、ops burden、reuseを観測証拠に結び、結果と限界を出す。品質不成立を速度やcostで相殺しない。

### L10-LABO-006-C02 — `実験結果の個別失敗/組合せ`

- 対応: `LABO-006-AC-02`; 親: `HELIXLABO-L2-006`。
- 入力fixture: (a)OS assignment欠落、(b)oracle欠落、(c)baseline revision差、(d)interrupted run、(e)cost欠測、(f)品質を下げ速度改善と表示、(g)単一runを改善成立と表示、(h)異なる条件/evidenceを結合、複数の組合せ。
- 期待oracle: 実験実行済みを捏造せず、比較不能/中断/unknownを明記。cost欠測を0扱いしない。品質低下を速度改善で相殺せず、単発を改善と認定せず、異条件の証拠を結合しない。個別理由を列挙し有効な別scope結果は分離。

### L10-LABO-006-C03 — `owner境界`

- 対応: `LABO-006-AC-02`; 親: `HELIXLABO-L2-006`。
- 入力fixture: LABOがWorkerを選択/割当/起動しようとする入力または実行依頼。
- 期待oracle: 割当責務はOS、実行者はOS assignmentに従うWorkerへ戻す。LABOは評価に限定。

### L10-LABO-006-C04 — `held-out正常`

- 対応: `LABO-006-AC-01`; 親: `HELIXLABO-L2-006`。
- 入力fixture: 未見の評価対象指標だが親列挙のcost/quality/capacity範囲に入る測定を与える。
- 期待oracle: 根拠あるscope/limit付き比較へ含める。比較規則は固定oracleを保ち、未列挙内容を新しい成功条件にしない。

### L10-LABO-007-C01 — `再現可能な正常候補`

- 対応: `LABO-007-AC-01`; 親: `HELIXLABO-L2-007`。
- 入力fixture: 同一の再現条件を持つ反復episodes、machine判定可能な入力、独立oracle、限定side effect、retry/rollback/idempotence証拠を別fieldで与える。
- 期待oracle: 6条件群を個別に観測する。retry可否とrollback可否は同じ条件群の中でも別々に記録し、片方の証拠を他方へ代用しない。operation継続案とsystem化候補の双方を示し、自動昇格しない。

### L10-LABO-007-C02 — `条件欠落/不安定`

- 対応: `LABO-007-AC-02`; 親: `HELIXLABO-L2-007`。
- 入力fixture: 再現性、machine判定可能性、oracle、副作用範囲、retry可否、rollback可否、冪等性を一つずつ欠落/矛盾させ、最後に複合欠落を与える。
- 期待oracle: 欠落した条件名と証拠を個別に示し、systemizationへ進めずoperation継続候補を保留状態で返す。

### L10-LABO-007-C03 — `単純頻度の否定`

- 対応: `LABO-007-AC-02`; 親: `HELIXLABO-L2-007`。
- 入力fixture: 件数だけ多いが異条件またはcounterexampleがある候補と、条件/例外を含むsystemization率を最大化しようとする評価設定を別々に投入する。
- 期待oracle: 頻度だけで再現可能と判定しない。systemization率を最大化する目的関数を使わず反例・条件差を保持し、自動昇格0。

### L10-LABO-007-C04 — `held-out正常`

- 対応: `LABO-007-AC-01`; 親: `HELIXLABO-L2-007`。
- 入力fixture: 未見のrule candidateだが全親条件と証拠を持つ。
- 期待oracle: 同一oracleで分類し、特定旧candidate名や登録済みruleに依存しない。

### L10-LABO-007-C05 — 文脈依存・高FP・過剰拘束candidateの保持

- 対応: `LABO-007-AC-02`; 親: `HELIXLABO-L2-007`。
- 入力fixture: 正常operation対照に加え、意味判断の余地があるoracle、例外多数、期待値を確定できない不完全oracle、文脈依存、FP高、overconstraintの各理由を単独で含む候補を与える。
- 期待oracle:oracleの意味判断・例外・不完全性を個別に未確定として保持し、candidateはsystem化不適でもoperation candidateとして残す。各理由とscopeを表示し、oracleを完全/合格と偽装しない。

### L10-LABO-007-C06 — shadowとsystemization段階の区別

- 対応: `LABO-007-AC-01/02`; 親: `HELIXLABO-L2-007`。
- 入力fixture:同一candidateのoperation、shadow評価、systemization候補の別状態と、shadow evidence欠落を与える。
- 期待oracle:shadow段階をoperationやsystemization済みと同一視せず、親にない自動昇格・承認条件を設けない。

### L10-LABO-008-C01 — `system運用正常`

- 対応: `LABO-008-AC-01`; 親: `HELIXLABO-L2-008`。
- 入力fixture: current system rule/version、通常結果、例外、誤検知、回避、変更cost、operation ownerを与える。
- 期待oracle: system継続/修正またはoperation再評価候補を出し、根拠・戻し条件・未完義務とownerを示す。切替はしない。

### L10-LABO-008-C02 — `return evidence欠落`

- 対応: `LABO-008-AC-02`; 親: `HELIXLABO-L2-008`。
- 入力fixture: (a)rule revision不明、(b)回避cost欠落、(c)現owner不明、(d)operationの実行結果が失敗なのに成功/退役表示、(e)system→operation復帰をfailure/retiredと誤表示、(f)現行保証を失うが保証差分/未完義務を記録しない出力、(g)併発。
- 期待oracle: unknownを明記し、source/ownerへ戻す。保証喪失の差分と未完義務を保持し、ownerなしの完了宣言を出さない。operation復帰は親どおりoperation stateとして保持しfailure/retiredへ改変しない。欠けた要素を補完してsystem維持/切替を確定しない。

### L10-LABO-008-C03 — `operation再評価境界`

- 対応: `LABO-008-AC-02`; 親: `HELIXLABO-L2-008`。
- 入力fixture: 既知system exceptionが繰返す一方、改善が未評価の例と、system適用限界によりoperationへ戻す例を与える。併せてsystemからoperationへ戻す観測を入力し、operation自体の状態がfailureである場合と、system適用限界で戻した場合を分ける。
- 期待oracle: 再評価candidateを作成してもsystem execution stateは変更なし。戻し理由とoperation stateを区別し、未完義務を残す。

### L10-LABO-008-C04 — `held-out正常`

- 対応: `LABO-008-AC-01`; 親: `HELIXLABO-L2-008`。
- 入力fixture: 未見のexception typeだがrule revisionとowner/action evidenceあり。
- 期待oracle: exceptionとして追跡し適用限界付きcandidateを作る。未見だけを理由に確定拒否しない。

### L10-LABO-009-C01 — `scope段階正常`

- 対応: `LABO-009-AC-01`; 親: `HELIXLABO-L2-009`。
- 入力fixture: 独立した複数episode、比較可能な実験、条件/sample description、counterexampleを含むfixtureを与える。
- 期待oracle: single/repeated/cross-project/cross-product/general structureのうち根拠が支持する範囲だけを返す。対象scope/条件/反例を明記。

### L10-LABO-009-C02 — `単一例・反例`

- 対応: `LABO-009-AC-02`; 親: `HELIXLABO-L2-009`。
- 入力fixture: (a)single episode、(b)反例が上位scopeを限定、(c)product固有性、(d)併発。
- 期待oracle: (a)singleを越えない。(b)scopeを縮小。(c)汎用先へ送らない。(d)全て区別し証拠ownerへ戻す。

### L10-LABO-009-C03 — `未支持上位scope`

- 対応: `LABO-009-AC-02`; 親: `HELIXLABO-L2-009`。
- 入力fixture: 上位scopeに必要な独立条件が未観測または比較不能。
- 期待oracle: 上位generalizationをunknown/未支持とし、必要標本条件と追加観測案を示す。成功認定しない。

### L10-LABO-009-C04 — `held-out正常`

- 対応: `LABO-009-AC-01`; 親: `HELIXLABO-L2-009`。
- 入力fixture: 未見のcross-project fixtureで、複数source/projectの条件と反例を保持。
- 期待oracle: cross-projectまでの支持範囲を出し、cross-product等へ自動昇格しない。

### L10-LABO-010-C01 — `feedback正常`

- 対応: `LABO-010-AC-01`; 親: `HELIXLABO-L2-010`。
- 入力fixture: 評価済episode、experiment、counterexample、支持scopeとtarget responsibilityを与える。
- 期待oracle: 16必須fieldが埋まり、allowed actionのtarget-specific candidateとsource linksを返す。複数targetは別candidate。OSへ登録/routingは依頼先を示すだけ。

### L10-LABO-010-C02 — `field/evidence欠落`

- 対応: `LABO-010-AC-02`; 親: `HELIXLABO-L2-010`。
- 入力fixture: (a)source revision欠落、(b)counterexample未観測なのに空欄とunknown混同、(c)target owner不明、(d)required evidence不足、(e)併発。
- 期待oracle: 欠落はunknown/未充足として保持し候補を確定しない。source/target ownerへ返し、値を捏造しない。

### L10-LABO-010-C03 — `authority混同`

- 対応: `LABO-010-AC-02`; 親: `HELIXLABO-L2-010`。
- 入力fixture: feedback proseをapproval/decision/registration/owner changeとして取り込もうとする。
- 期待oracle: proposal/evidenceに限定。OS registration/routingとtarget owner decisionの発生0。

### L10-LABO-010-C04 — `held-out正常`

- 対応: `LABO-010-AC-01`; 親: `HELIXLABO-L2-010`。
- 入力fixture: 未見target mechanismだがtarget responsibility/evidence/scope/全16fieldが揃う。
- 期待oracle: target-specific candidateを出すが、新たなtarget authorityや許可actionを作らない。


## Stage 2b 接続・条件補足22件（未承認・未実行）

固定L2 parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO basis `633bf12`、L2 full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`。L11共通pinは同ファイルのStage2b基本エンジン表を参照する。以下は設計fixtureでありruntime testや実装許可ではない。

| 親L2 / PO registration / decision / semantic digest | L2 raw span SHA-256 | FR/AC/case |
|---|---|---|
| `HELIXLABO-L2-012` / `MPR-RC-HELIXLABO-L2-012-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L60 / `sha256:bce298745ed3da0c1538e5bf7324a22da4b16e68715f915e46c48fa7731435a4` | L167–170 `fa1281a914381cc416a7630bebb7a4547abc3fa7f78cf96d90f947be965ad728` | `LABO-012-FR-01`, `LABO-012-AC-01/02`, `L10-LABO-012-C01..04` |
| `HELIXLABO-L2-013` / `MPR-RC-HELIXLABO-L2-013-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L61 / `sha256:f2072a508c91ea00ff35ba233c945365b4dffe3e2d5a3c800152ce38add38876` | L171–174 `58416ed8ae9464b5e48264a3a121c35fced5b290fd1343f12270fdf429fcc56c` | `LABO-013-FR-01`, `LABO-013-AC-01/02`, `L10-LABO-013-C01..04` |
| `HELIXLABO-L2-014` / `MPR-RC-HELIXLABO-L2-014-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L62 / `sha256:3d255c00ffd8f560dd9a181790bcc294bfae57e0571acac032ea1eba0f8760d8` | L175–178 `0f2cd059b20388f4012379e895c7b124c2f1fdd6b0b1d17281b3ee248ae4385c` | `LABO-014-FR-01`, `LABO-014-AC-01/02`, `L10-LABO-014-C01..04` |
| `HELIXLABO-L2-015` / `MPR-RC-HELIXLABO-L2-015-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L63 / `sha256:c55dbc5072f5a55a2e35c7d7acd39392441d19ca3f3c3db387c313c63e73437c` | L179–182 `71522fc0ea82bd050c976d565aa4b0092df047538cd67634dd18cb52c434fbe3` | `LABO-015-FR-01`, `LABO-015-AC-01/02`, `L10-LABO-015-C01..04` |
| `HELIXLABO-L2-016` / `MPR-RC-HELIXLABO-L2-016-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L64 / `sha256:439c9ed877915de9a0d2f3028fce04a12f451d7812946e3322be8b46306e8467` | L183–186 `7f79a3cecff61f2667bdce6214cf5e8de9c6b2ba6169de3ae28b33c01a42ede7` | `LABO-016-FR-01`, `LABO-016-AC-01/02`, `L10-LABO-016-C01..04` |
| `HELIXLABO-L2-017` / `MPR-RC-HELIXLABO-L2-017-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L65 / `sha256:34ceade9563b09db94ef5d031c66df4c2741db3d13aa126ca0aa74b9a92b5440` | L187–190 `0a6fa1d91e9d1fd88e191ba8594b0348b092e82e1517fa68edc801bd8210c763` | `LABO-017-FR-01`, `LABO-017-AC-01/02`, `L10-LABO-017-C01..04` |
| `HELIXLABO-L2-018` / `MPR-RC-HELIXLABO-L2-018-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L66 / `sha256:d1b31fb8d379f9dcfcdc6213ac4d7fcb193e20d7d59276e231f548f3db9dcfdd` | L191–194 `582e5b71bc97b9fe10e7ab1b22498b9dd023e91c393aaee3af8cedede135fd29` | `LABO-018-FR-01`, `LABO-018-AC-01/02`, `L10-LABO-018-C01..04` |
| `HELIXLABO-L2-019` / `MPR-RC-HELIXLABO-L2-019-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L67 / `sha256:e7a90eba26b101083aa9fa449b220ea53d5c8230eed1f82980797cdabbb51d65` | L195–198 `2c931ae3ef60fcd739ce16a8c03e1ddc1c80462b4c791b8f8a79ec4ff3707670` | `LABO-019-FR-01`, `LABO-019-AC-01/02`, `L10-LABO-019-C01..04` |
| `HELIXLABO-L2-020` / `MPR-RC-HELIXLABO-L2-020-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L68 / `sha256:61ae506fe25a2218b3c2581e47eb76a167f8344cc792d5c27d4895bd65121501` | L199–202 `1de241d1126644a0f5bdf4775b091ae87977920a7552ea999b5094bc52480082` | `LABO-020-FR-01`, `LABO-020-AC-01/02`, `L10-LABO-020-C01..04` |
| `HELIXLABO-L2-021` / `MPR-RC-HELIXLABO-L2-021-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L69 / `sha256:00dda7b8a7675bba719585e6fbb94e43a2f273146b195d00daae5718f3f1fc9e` | L203–206 `2a420b02039e3701f61387f78236753dfd59924b05bc4f0dfaa3215fec12a50b` | `LABO-021-FR-01`, `LABO-021-AC-01/02`, `L10-LABO-021-C01..04` |
| `HELIXLABO-L2-022` / `MPR-RC-HELIXLABO-L2-022-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L70 / `sha256:4dba319cb6d4abe7c909c9ffc1c9e50593efe4aa6d26548fd0434375baeae783` | L207–210 `c9de9a9d703d3a2605715ecd57511cea1cc8625891eafadea5eb2b01b6a3837d` | `LABO-022-FR-01`, `LABO-022-AC-01/02`, `L10-LABO-022-C01..04` |
| `HELIXLABO-L2-023` / `MPR-RC-HELIXLABO-L2-023-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L71 / `sha256:aafe6d1641624bd7986d5fd6c6a1c67644221c9df0f4503433f442c98f26a36b` | L211–214 `c9cf147b928712f82694042c22cb9951530186f1dc3036ed36c19b2b1c487cc1` | `LABO-023-FR-01`, `LABO-023-AC-01/02`, `L10-LABO-023-C01..04` |
| `HELIXLABO-L2-024` / `MPR-RC-HELIXLABO-L2-024-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L72 / `sha256:b9716e90512221b17da8f2eb3df7d8ea64bcdab2e4223ea32a720ae8c19ddbd4` | L215–218 `300c79db30dd775aa504d23005b53d51bb966b6c52b9d722aa2efa41239e7fa7` | `LABO-024-FR-01`, `LABO-024-AC-01/02`, `L10-LABO-024-C01..04` |
| `HELIXLABO-L2-025` / `MPR-RC-HELIXLABO-L2-025-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L73 / `sha256:e6cc467c72635a5fb91257cfb90f6a1039654d8f34a28454353566e3f3c28bf3` | L219–222 `11ddd89eb4195637bea7e61ef1af9b2e6096603ab2b601da4f35aaac4ccafac0` | `LABO-025-FR-01`, `LABO-025-AC-01/02`, `L10-LABO-025-C01..04` |
| `HELIXLABO-L2-026` / `MPR-RC-HELIXLABO-L2-026-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L74 / `sha256:64944055712d4d2c8ad4817624c5eeacba241c5bf7a008da18b2cfcdb53ec150` | L223–226 `a47b3ed9e39ae16dac5c50ab0d87282b5109c20874830693e5019e38742428ae` | `LABO-026-FR-01`, `LABO-026-AC-01/02`, `L10-LABO-026-C01..04` |
| `HELIXLABO-L2-027` / `MPR-RC-HELIXLABO-L2-027-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L75 / `sha256:ee444d777dfa4e45646584941998a8fa812b0070d62261e0c9ae3249928b8bab` | L227–230 `23833b323d44a786c302f054e22ead8a33e41ecdf66ff54fa1068ae1ac1eb30d` | `LABO-027-FR-01`, `LABO-027-AC-01/02`, `L10-LABO-027-C01..04` |
| `HELIXLABO-L2-028` / `MPR-RC-HELIXLABO-L2-028-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L76 / `sha256:f51b751526a581ca0cd80821dfdb9b558d3e2d4d0d3cb123420ea7391e45564e` | L231–234 `672081ff4372f097f39959b294ce961a35da899fb0e21b3d4a2f1cd3278851fd` | `LABO-028-FR-01`, `LABO-028-AC-01/02`, `L10-LABO-028-C01..04` |
| `HELIXLABO-L2-029` / `MPR-RC-HELIXLABO-L2-029-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L77 / `sha256:c37e1dbc85f2c6fcfb9b55e28d867faf9c4727a3615bd36882a71353eed3c89f` | L235–238 `10ee9155ebdbcb711715fddb6bddc644421559d8be4a3c404e22fdf3eedfdb29` | `LABO-029-FR-01`, `LABO-029-AC-01/02`, `L10-LABO-029-C01..04` |
| `HELIXLABO-L2-030` / `MPR-RC-HELIXLABO-L2-030-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L78 / `sha256:79a9ed7a30f650e949b2f092958a3e84c428e7ff84c0e6409fd056196d4c1e50` | L239–242 `9631b221fb6c1cb7b135324e0f914084146031297e2b82b95d64e14cc0df3613` | `LABO-030-FR-01`, `LABO-030-AC-01/02`, `L10-LABO-030-C01..04` |
| `HELIXLABO-L2-034` / `MPR-RC-HELIXLABO-L2-034-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L82 / `sha256:3d6fa067472bd28ce86fa0da805972e817170bde8602652a2e070b9af572cdbf` | L255–258 `ca533b2327c362fa9c455470b9e3a524ffb883f43b2641d897d5b133b8db3231` | `LABO-034-FR-01`, `LABO-034-AC-01/02`, `L10-LABO-034-C01..04` |
| `HELIXLABO-L2-035` / `MPR-RC-HELIXLABO-L2-035-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L83 / `sha256:8cdd8f7cbbdeb905ea12b600ff007e25ad5f0bb6196c70009402ef1453662bfd` | L259–262 `deba00a65917db6a1d3663472a52aaf23ea7a586fd4035e14ed7e72f2afcfb44` | `LABO-035-FR-01`, `LABO-035-AC-01/02`, `L10-LABO-035-C01..04` |
| `HELIXLABO-L2-058` / `MPR-RC-HELIXLABO-L2-058-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L98 / `sha256:0ff4f665f3a465611b2489a908bfb161e852fa5706393d04c21d59c3598d9f17` | L403–415 `b2bbcdc2a4687314eef773ecae25517776e548be7df8c23818549eb6841ac9cf` | `LABO-058-FR-01`, `LABO-058-AC-01/02`, `L10-LABO-058-C01..05` |

### L10-LABO-012-C01 — Correlate episodeから分類対象へ

- 対応: `LABO-012-AC-01`; 親: `HELIXLABO-L2-012`。
- 入力fixture: `L2-002`が出したepisode identity、source/evidence locator、relation identityとrevision、欠測/unknown状態を渡す。時刻・場所だけ一致する無関係eventの対照と、因果関係の根拠を持つeventを別々に与える。 専用connector `HELIXLABO-L2-012` のadmitted contract identity/revision、schema version、source provenanceもfixtureへ結ぶ。
- 期待oracle:分類対象が元episode・証拠・relation revisionへ戻れ、relationと欠測状態をそのまま保持する。co-timed/co-locatedだけの例は相関candidateに止まりcausal claimを出さず、根拠が揃う場合も親のrelation evidenceに沿う。 `HELIXLABO-L2-012`のconnector contractと入力→出力（episode/evidence/relationから分類対象を作り、relation revision不一致は訂正sourceへ戻す）が一致することを観測し、別connectorの契約で代替しない。

### L10-LABO-012-C02 — relation版不一致

- 対応: `LABO-012-AC-02`; 親: `HELIXLABO-L2-012`。
- 入力fixture: relation revisionだけを訂正元と不一致にし、episodeとevidenceは有効な対照を用意する。別caseでcorrelation candidateだけからcausal conclusionを作る変異を与える。 専用connector `HELIXLABO-L2-012`のcontract revision/schema/provenance不一致または欠落を単独と併発で投入する。
- 期待oracle:現在relationとして分類せず、不一致版を明示して訂正sourceへ戻す。有効なepisode/evidenceは保持する。相関だけで因果を確定した結果は不成立としてrelation/evidence ownerへ戻す。 connector不一致は接続成功とせず、`HELIXLABO-L2-012`の固定親が指定するownerへ返す。

### L10-LABO-012-C03 — evidence欠落・unknown保持

- 対応: `LABO-012-AC-02`; 親: `HELIXLABO-L2-012`。
- 入力fixture: (a)分類根拠field欠落、(b)上流unknownをsuccessへ置換、(c)欠落とrelation不一致の併発を分ける。
- 期待oracle:欠落・unknown・版不一致を別理由で示し、分類成立へ丸めず、不足evidenceまたは訂正source ownerへ戻す。

### L10-LABO-012-C04 — 同じrelation契約のheld-out正常

- 対応: `LABO-012-AC-01`; 親: `HELIXLABO-L2-012`。
- 入力fixture: fixture名は未見だが既存`L2-002` relation schema/revisionとevidence linkに適合するepisodeを与える。
- 期待oracle:同一のprovenance・unknown保持規則で分類対象へ渡す。未見というだけで失敗にしない。

### L10-LABO-013-C01 — 分類軸付き比較仮説

- 対応: `LABO-013-AC-01`; 親: `HELIXLABO-L2-013`。
- 入力fixture: source/revisionへ結ばれた根拠付き分解結果と、意味・条件の異なる二つの比較候補を与える。 専用connector `HELIXLABO-L2-013` のadmitted contract identity/revision、schema version、source provenanceもfixtureへ結ぶ。
- 期待oracle:Vector向け仮説が各分類軸とその根拠を保持し、意味差と条件差を別々に比較できる。 `HELIXLABO-L2-013`のconnector contractと入力→出力（根拠付き分解から意味・条件別比較仮説へ渡し、分類軸と根拠を保持する）が一致することを観測し、別connectorの契約で代替しない。

### L10-LABO-013-C02 — 分類軸または根拠の欠落

- 対応: `LABO-013-AC-02`; 親: `HELIXLABO-L2-013`。
- 入力fixture: 分類軸とsource evidenceを一つずつ欠落させ、欠落fieldごとの対照を作る。 専用connector `HELIXLABO-L2-013`のcontract revision/schema/provenance不一致または欠落を単独と併発で投入する。
- 期待oracle:根拠のない比較仮説を確定せず、欠落軸を示してsource evidence ownerへ戻す。残る有効軸は保持する。 connector不一致は接続成功とせず、`HELIXLABO-L2-013`の固定親が指定するownerへ返す。

### L10-LABO-013-C03 — 軸混同・矛盾

- 対応: `LABO-013-AC-02`; 親: `HELIXLABO-L2-013`。
- 入力fixture: meaningの差をcondition差へ混ぜる、または相反する分類根拠を同一fieldへ畳む。
- 期待oracle:軸の混同/矛盾を明示しunknownまたは未確定にし、元source meaningを上書きしない。

### L10-LABO-013-C04 — 親分類軸のheld-out正常

- 対応: `LABO-013-AC-01`; 親: `HELIXLABO-L2-013`。
- 入力fixture: 未見の分類内容だが固定親の既存分類軸・evidence形式内に入る分解結果を与える。
- 期待oracle:各既存軸と根拠を保った比較仮説を返し、新しい分類語彙やauthorityを追加しない。

### L10-LABO-014-C01 — 保持点と明示差分

- 対応: `LABO-014-AC-01`; 親: `HELIXLABO-L2-014`。
- 入力fixture: 元方式の意味・目的・条件が既知の部分比較candidateと、変更しないfield/変えるfieldが記されたtransformation candidateを与える。 専用connector `HELIXLABO-L2-014` のadmitted contract identity/revision、schema version、source provenanceもfixtureへ結ぶ。
- 期待oracle:元意味を保持するfieldと差分fieldをsource revision付きで対比し、candidateとして返す。実変更は行わない。 `HELIXLABO-L2-014`のconnector contractと入力→出力（元意味・目的・条件付きpartial comparison candidateからtransformation candidateを作り、保持意味と変更部分を分ける）が一致することを観測し、別connectorの契約で代替しない。

### L10-LABO-014-C02 — 元意味不明または差分欠落

- 対応: `LABO-014-AC-02`; 親: `HELIXLABO-L2-014`。
- 入力fixture: (a)元目的がunknown、(b)変更fieldを記さないcandidateを個別に与える。 専用connector `HELIXLABO-L2-014`のcontract revision/schema/provenance不一致または欠落を単独と併発で投入する。
- 期待oracle: (a)元source/L1 ownerへ意味確認を戻す。(b)差分を補作せずcandidateを未確定にする。 connector不一致は接続成功とせず、`HELIXLABO-L2-014`の固定親が指定するownerへ返す。

### L10-LABO-014-C03 — 明示された意味変更proposal

- 対応: `LABO-014-AC-01`／`LABO-014-AC-02`; 親: `HELIXLABO-L2-014`。
- 入力fixture: (a)目的反転または制約除去を差分として明示するproposal、(b)同じ変更を隠して意味保持を装うcandidate、(c)差分をsource/L1判断前に採用・実施する要求を分ける。
- 期待oracle: (a)意味変更案として比較可能なcandidateに保ち、source/L1 ownerの判断材料として返す。(b)(c)だけを不成立とし、隠蔽または自動確定/実施を許さない。

### L10-LABO-014-C04 — 明示条件内のheld-out正常

- 対応: `LABO-014-AC-01`; 親: `HELIXLABO-L2-014`。
- 入力fixture: 未見の方式だが元意味・目的・条件のsource evidenceと変更fieldが明確なcandidateを与える。
- 期待oracle:保持点と差分を同じ比較規則で返し、candidateを実変更へ昇格しない。

### L10-LABO-015-C01 — 親指定比較条件の一致

- 対応: `LABO-015-AC-01`; 親: `HELIXLABO-L2-015`。
- 入力fixture: 選択された比較区分（baseline/current、candidate、hybridの対象arm）それぞれにsource revision、target version、適用条件、evaluation oracleを付ける。二者比較fixtureと三者関係を主張するfixtureを分ける。専用connector `HELIXLABO-L2-015` のadmitted contract identity/revision、schema version、source provenanceもfixtureへ結ぶ。
- 期待oracle:選択されたarmごとの比較条件を混同せず再構成し、条件差は候補構成として明示する。二者比較は二者の目的範囲で保持し、三者関係の主張だけ三者条件を要する。明示された別比較条件を本ACだけを根拠に排除せず、Worker実行は起動しない。`HELIXLABO-L2-015`のconnector contractと入力→出力が一致することを観測し、別connectorの契約で代替しない。

### L10-LABO-015-C02 — oracleまたは対象版の個別欠落

- 対応: `LABO-015-AC-02`; 親: `HELIXLABO-L2-015`。
- 入力fixture: 選択armのoracleを一つだけ欠落させるfixtureと、target versionを一つだけ欠落させるfixtureを別々に与える。未選択区分だけがない対照も与える。 専用connector `HELIXLABO-L2-015`のcontract revision/schema/provenance不一致または欠落を単独と併発で投入する。
- 期待oracle:選択armのoracleまたはtarget versionが欠けたfixtureだけを不成立として該当ownerへ戻す。未選択armがないだけの対照は、選択した目的の二者比較を成立のまま保持し不成立にしない。connector不一致は受領不成立として保留し、親が指定しないownerを推測しない。

### L10-LABO-015-C03 — 比較条件の混在

- 対応: `LABO-015-AC-02`; 親: `HELIXLABO-L2-015`。
- 入力fixture: 選択済みarmの一つだけ適用条件をずらし、別fixtureではscopeとrevisionを組合せて不一致にする。未選択armが存在しない比較も別に入力する。
- 期待oracle:選択済みarm間の条件/scope/revisionが不一致なら比較不成立として差を保持する。未選択armの不在だけなら選択済み二者比較は成立のまま保ち、assignment/実行を開始しない。

### L10-LABO-015-C04 — 同一条件のheld-out正常

- 対応: `LABO-015-AC-01`; 親: `HELIXLABO-L2-015`。
- 入力fixture: 未見candidate transformationを選択した比較armへ適用し、各armでtarget version・oracle・適用条件を対応づける。二者選択と三者関係の主張を分ける。
- 期待oracle:選択した比較条件を分離して追跡可能なcandidateとして返し、未見名を理由に排除しない。未選択armの不在だけで二者比較を排除しない。

### L10-LABO-016-C01 — 比較証拠から二種類の評価材料へ

- 対応: `LABO-016-AC-01`; 親: `HELIXLABO-L2-016`。
- 入力fixture: 同一target/oracle/versionに結ばれた比較結果、counterexample、failure/status、比較可能性を与える。 専用connector `HELIXLABO-L2-016` のadmitted contract identity/revision、schema version、source provenanceもfixtureへ結ぶ。
- 期待oracle:system候補とoperation候補の評価材料を分け、counterexampleと比較可能性を両方保つ。 `HELIXLABO-L2-016`のconnector contractと入力→出力（比較結果・反例・oracle・中断状態をsystem/operation評価材料へ渡し、判定不能はoperation候補に留める）が一致することを観測し、別connectorの契約で代替しない。

### L10-LABO-016-C02 — oracle不一致・反例

- 対応: `LABO-016-AC-02`; 親: `HELIXLABO-L2-016`。
- 入力fixture: oracleと比較resultの不一致、またはscope内counterexampleをそれぞれ単独で与える。 専用connector `HELIXLABO-L2-016`のcontract revision/schema/provenance不一致または欠落を単独と併発で投入する。
- 期待oracle:相反証拠を消さず判定不能/operation候補として保留し、system化の根拠へ丸めない。 connector不一致は接続成功とせず、`HELIXLABO-L2-016`の固定親が指定するownerへ返す。

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
- 入力fixture: current rule version、system/operation eligibility evidence、現行保証、未完義務一覧、各義務ownerを与える。 専用connector `HELIXLABO-L2-017` のadmitted contract identity/revision、schema version、source provenanceもfixtureへ結ぶ。
- 期待oracle:再評価candidateと未完義務を版/owner付きで返す。運用切替は行わない。 `HELIXLABO-L2-017`のconnector contractと入力→出力（適格性・現行保証から再評価候補と未完義務を返し、切替は実行しない）が一致することを観測し、別connectorの契約で代替しない。

### L10-LABO-017-C02 — 現行版・保証欠落

- 対応: `LABO-017-AC-02`; 親: `HELIXLABO-L2-017`。
- 入力fixture: current rule revisionとcurrent guaranteeを一つずつ欠落させ、旧版対照も与える。 専用connector `HELIXLABO-L2-017`のcontract revision/schema/provenance不一致または欠落を単独と併発で投入する。
- 期待oracle:現行条件を補完せず再評価を保留し、該当rule/guarantee ownerへ返す。 connector不一致は接続成功とせず、`HELIXLABO-L2-017`の固定親が指定するownerへ返す。

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
- 入力fixture: comparison result、標本のtask/model/condition scope、結果revision、および該当counterexampleを与える。 専用connector `HELIXLABO-L2-018` のadmitted contract identity/revision、schema version、source provenanceもfixtureへ結ぶ。
- 期待oracle:支持される適用範囲を標本条件・result・反例へ結び、未評価条件を区別する。 `HELIXLABO-L2-018`のconnector contractと入力→出力（比較結果・標本条件・反例から証拠が支持する適用範囲を返し、scopeを拡張しない）が一致することを観測し、別connectorの契約で代替しない。

### L10-LABO-018-C02 — 標本条件・反例欠落

- 対応: `LABO-018-AC-02`; 親: `HELIXLABO-L2-018`。
- 入力fixture: 標本条件だけが欠落するfixtureと、comparison resultだけがstaleとなるfixtureを分けて与える。 専用connector `HELIXLABO-L2-018`のcontract revision/schema/provenance不一致または欠落を単独と併発で投入する。
- 期待oracle:支持範囲を確定せず、欠落またはstale条件を示してexperiment evaluatorへ戻す。 connector不一致は接続成功とせず、`HELIXLABO-L2-018`の固定親が指定するownerへ返す。

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
- 入力fixture: scope-bound insight、source evidence/revision、責任候補、およびidentityが異なるtarget二つを与える。 専用connector `HELIXLABO-L2-019` のadmitted contract identity/revision、schema version、source provenanceもfixtureへ結ぶ。
- 期待oracle:各targetに別個のfeedback candidateを返し、evidence/scope/ownerを各candidateへ結ぶ。 `HELIXLABO-L2-019`のconnector contractと入力→出力（範囲付き知見とtarget/responsibility候補からtarget別feedbackを作り、target不明はOS routing候補へ戻す）が一致することを観測し、別connectorの契約で代替しない。

### L10-LABO-019-C02 — target identity/evidence不足

- 対応: `LABO-019-AC-02`; 親: `HELIXLABO-L2-019`。
- 入力fixture: target identityがunknownのfixtureと、targetは既知だがsource evidenceが欠落するfixtureを分ける。 専用connector `HELIXLABO-L2-019`のcontract revision/schema/provenance不一致または欠落を単独と併発で投入する。
- 期待oracle:target不明はOS routing candidateへ戻し、根拠不足はsource/target ownerへ返す。推測routingしない。 connector不一致は接続成功とせず、`HELIXLABO-L2-019`の固定親が指定するownerへ返す。

### L10-LABO-019-C03 — target混在の否定

- 対応: `LABO-019-AC-02`; 親: `HELIXLABO-L2-019`。
- 入力fixture: 二targetのresponsibility/evidenceを一proposalに混ぜ、またはtarget owner変更をLABOに要求する。
- 期待oracle:target別に分離できる情報は保持するが、混合提案・OS routing・owner変更は実行せず不足を示す。

### L10-LABO-019-C04 — identityを保つheld-out正常

- 対応: `LABO-019-AC-01`; 親: `HELIXLABO-L2-019`。
- 入力fixture: 未見target identityでもscope-bound insight、責任候補、target evidenceが揃い、OS routing不要と明示されたfixtureを与える。
- 期待oracle:そのtargetだけのfeedback candidateを作る。未見という理由で排除せず、他targetへ一般化しない。

### L10-LABO-020-C01 — operation復帰後のobservation

- 対応: `LABO-020-AC-01`; 親: `HELIXLABO-L2-020`。
- 入力fixture: operation ownerが復帰後に記録したresult、対象source identity/revision、fallback前の旧rule版、復帰後の新rule版、未完義務を与える。 専用connector `HELIXLABO-L2-020` のadmitted contract identity/revision、schema version、source provenanceもfixtureへ結ぶ。
- 期待oracle:新observationにresultと旧/新rule版、source provenance、残る義務/ownerを結ぶ。切替はowner実行済み入力として扱い、LABOは実行しない。 `HELIXLABO-L2-020`のconnector contractと入力→出力（operation復帰後結果・旧新rule版から新observationを作り、未完義務と前後版を保つ）が一致することを観測し、別connectorの契約で代替しない。

### L10-LABO-020-C02 — 前後版/resultの個別欠落

- 対応: `LABO-020-AC-02`; 親: `HELIXLABO-L2-020`。
- 入力fixture: 旧rule version、新rule version、operation resultをそれぞれ一つずつ欠落させる。 専用connector `HELIXLABO-L2-020`のcontract revision/schema/provenance不一致または欠落を単独と併発で投入する。
- 期待oracle:欠落fieldごとに理由を示し、新しいsuccess observationにせずsource/rule ownerへ戻す。 connector不一致は接続成功とせず、`HELIXLABO-L2-020`の固定親が指定するownerへ返す。

### L10-LABO-020-C03 — stale版・義務消失

- 対応: `LABO-020-AC-02`; 親: `HELIXLABO-L2-020`。
- 入力fixture: resultに結ぶrule版をstaleにし、または未完義務をresult後に消すmutationを与える。
- 期待oracle:版不一致または義務欠落でobservationを保留し、前後のversion/未完状態を保持する。

### L10-LABO-020-C04 — identity付きheld-out正常

- 対応: `LABO-020-AC-01`; 親: `HELIXLABO-L2-020`。
- 入力fixture: 未見のoperation結果sourceだがL2-008 result contract、L2-001 observation field、前後rule versionとownerが全て結合している。
- 期待oracle:同じprovenance規則でobservationへ集積し、未見source名を理由に拒否せず、後続義務を保持する。

### L10-LABO-021-C01 — 許可source正常

- Parent/AC: `HELIXLABO-L2-021` / `LABO-021-AC-01`。
- Input fixture: 許可されたHARNESS history record、current source contract/revision、data-use scope、source attributionを与える。選択親専用のHELIX-CONNECT contract identity/revision、schema、provenance/trace/receiptを別々に入力する。
- Observable oracle: observationがsource ID/revision/許可scope/raw locatorを保ちHARNESS raw recordは不変。専用connector契約とsource/schema/traceが一致した場合に限り受領し、他sourceのcontractで代用しない。

### L10-LABO-021-C02 — 許可/版/範囲失敗

- Parent/AC: `HELIXLABO-L2-021` / `LABO-021-AC-02`。
- Input fixture: (a)未許可scope、(b)unknown/stale revision、(c)source contract欠落を個別、併発も投入する。選択親専用connector identity/revision/schema/provenanceのmissing、stale、mismatchを個別に投入する。
- Observable oracle: 対象入力hold/unknown、HARNESS ownerへ差戻し。他sourceは区別しauthority侵害0。connector mismatchも受領成立にせず、HARNESS source/contract ownerへ戻す。

### L10-LABO-021-C03 — raw authority boundary

- Parent/AC: `HELIXLABO-L2-021` / `LABO-021-AC-02`。
- Input fixture: inputがHARNESS raw recordまたはcurrent authorityをLABOから変更しようとする。
- Observable oracle: writeback/authority change 0、観測に限定。

### L10-LABO-021-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-021` / `LABO-021-AC-01`。
- Input fixture: 別の許可HARNESS history categoryだが同じsource contractを満たす。 選択親専用のHELIX-CONNECT contract identity/revision/schema/provenanceを入力する。
- Observable oracle: 未見categoryを一律拒否せず、scope/revisionを保持しobservation。 専用connector契約が一致した場合だけ受領し、別connector契約で代用しない。

### L10-LABO-022-C01 — 許可OS record正常

- Parent/AC: `HELIXLABO-L2-022` / `LABO-022-AC-01`。
- Input fixture: OS ticket/operation/assignment/receipt、accepted source version、uncompletedおよびcompleted status各1件を投入。選択親専用のHELIX-CONNECT contract identity/revision、schema、provenance/trace/receiptを別々に入力する。
- Observable oracle: OS identity/revision、status/unfinished obligationを区別してobservation。専用connector契約とsource/schema/traceが一致した場合に限り受領し、他sourceのcontractで代用しない。

### L10-LABO-022-C02 — stale/欠落

- Parent/AC: `HELIXLABO-L2-022` / `LABO-022-AC-02`。
- Input fixture: ticket/assignment/receiptを一つずつ欠落またはstale化する。 選択親専用connector identity/revision/schema/provenanceのmissing、stale、mismatchを個別に投入する。
- Observable oracle: 不一致をOSへ戻し、完了・成功・evaluation済にしない。 専用connector mismatchも受領成立にせず、OS source/contract ownerへ戻し、別connectorへfallbackしない。

### L10-LABO-022-C03 — 状態混同

- Parent/AC: `HELIXLABO-L2-022` / `LABO-022-AC-02`。
- Input fixture: unknown/interruptedとsuccessful receiptを混在させる。
- Observable oracle: unknown/unfinishedを別fieldに残し成功へ融合しない。

### L10-LABO-022-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-022` / `LABO-022-AC-01`。
- Input fixture: 異なるOS operation typeでsame contract/source revisionは適合。 選択親専用のHELIX-CONNECT contract identity/revision/schema/provenanceを入力する。
- Observable oracle: operation typeを維持し同じprovenanceでobservation。 専用connector契約が一致した場合だけ受領し、別connector契約で代用しない。

### L10-LABO-023-C01 — 知識利用正常

- Parent/AC: `HELIXLABO-L2-023` / `LABO-023-AC-01`。
- Input fixture: 許可知識asset、exact source revision、利用/適用result、scope/attributionを与える。選択親専用のHELIX-CONNECT contract identity/revision、schema、provenance/trace/receiptを別々に入力する。
- Observable oracle: usage resultとknowledge identity/revisionを区別し記録、sourceを不変保持。専用connector契約とsource/schema/traceが一致した場合に限り受領し、他sourceのcontractで代用しない。

### L10-LABO-023-C02 — source identity/permission欠落

- Parent/AC: `HELIXLABO-L2-023` / `LABO-023-AC-02`。
- Input fixture: (a)identityなし、(b)revision mismatch、(c)permission/scope不明を個別・併発。 選択親専用connector identity/revision/schema/provenanceのmissing、stale、mismatchを個別に投入する。
- Observable oracle: 該当observation unknown/holdでBRAINへ戻し、別のvalid sourceを混同しない。専用connector mismatchも受領成立にせず、BRAIN source/contract ownerへ戻し、別connectorへfallbackしない。

### L10-LABO-023-C03 — knowledge writeback否定

- Parent/AC: `HELIXLABO-L2-023` / `LABO-023-AC-02`。
- Input fixture: LABO observationがBRAIN asset canonical text/stateを更新しようとする。
- Observable oracle: writeback 0。

### L10-LABO-023-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-023` / `LABO-023-AC-01`。
- Input fixture: 別の許可されたknowledge-use category/asset IDで同じcontractに適合。 選択親専用のHELIX-CONNECT contract identity/revision/schema/provenanceを入力する。
- Observable oracle: usage observationへtraceするがBRAIN評価/authorityを生成しない。 専用connector契約が一致した場合だけ受領し、別connector契約で代用しない。

### L10-LABO-024-C01 — 判断結果正常

- Parent/AC: `HELIXLABO-L2-024` / `LABO-024-AC-01`。
- Input fixture: authorized review/prediction/diagnosis result、producer decision revision、target revision、time/source identityを分離投入。選択親専用のHELIX-CONNECT contract identity/revision、schema、provenance/trace/receiptを別々に入力する。
- Observable oracle: 観測事実とdecision output/source versionを別々に保持。専用connector契約とsource/schema/traceが一致した場合に限り受領し、他sourceのcontractで代用しない。

### L10-LABO-024-C02 — 版/履歴失敗

- Parent/AC: `HELIXLABO-L2-024` / `LABO-024-AC-02`。
- Input fixture: (a)stale decision revision、(b)target revision mismatch、(c)past assessmentをcurrent authorityと誤指定。 選択親専用connector identity/revision/schema/provenanceのmissing、stale、mismatchを個別に投入する。
- Observable oracle: INTELLIGENCE ownerへ戻し、historical assessmentをcurrent authorityにしない。専用connector mismatchも受領成立にせず、INTELLIGENCE source/contract ownerへ戻し、別connectorへfallbackしない。

### L10-LABO-024-C03 — 判断/観測混同

- Parent/AC: `HELIXLABO-L2-024` / `LABO-024-AC-02`。
- Input fixture: prose judgmentだけをsource factとして与える、または欠測をsuccess推測にする。
- Observable oracle: fact/evaluated judgment distinctionを保ち、不足はunknown。

### L10-LABO-024-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-024` / `LABO-024-AC-01`。
- Input fixture: 未見判断型だがaccepted INTELLIGENCE contractで許可されている。 選択親専用のHELIX-CONNECT contract identity/revision/schema/provenanceを入力する。
- Observable oracle: 同じscope/revision oracleで取込可能、new authorityは生成しない。 専用connector契約が一致した場合だけ受領し、別connector契約で代用しない。

### L10-LABO-025-C01 — 許可scope正常

- Parent/AC: `HELIXLABO-L2-025` / `LABO-025-AC-01`。
- Input fixture: SECURITY許可済みsafety/incident evidenceとdata-use scope locator、revision、必要最小fieldを与える。選択親専用のHELIX-CONNECT contract identity/revision、schema、provenance/trace/receiptを別々に入力する。
- Observable oracle: scopeとsource revisionに制限されたobservation。restricted authority/raw payloadは転送しない。専用connector契約とsource/schema/traceが一致した場合に限り受領する。

### L10-LABO-025-C02 — scope/制限失敗

- Parent/AC: `HELIXLABO-L2-025` / `LABO-025-AC-02`。
- Input fixture: (a)scope missing、(b)restricted field混入、(c)revision staleを個別・併発。 選択親専用connector identity/revision/schema/provenanceのmissing、stale、mismatchを個別に投入する。
- Observable oracle: 対象入力拒否/hold、SECURITYへ返しsecret/restricted contentを記録/拡散しない。専用connector mismatchも受領成立にせず、SECURITY source/contract ownerへ戻し、別connectorへfallbackしない。

### L10-LABO-025-C03 — source authority境界

- Parent/AC: `HELIXLABO-L2-025` / `LABO-025-AC-02`。
- Input fixture: LABOがSECURITY finding disposition/policyを変更するmutation。
- Observable oracle: policy/finding authority変更0。

### L10-LABO-025-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-025` / `LABO-025-AC-01`。
- Input fixture: 別の許可safe summaryだけからincident outcomeを観測。 選択親専用のHELIX-CONNECT contract identity/revision/schema/provenanceを入力する。
- Observable oracle: 未見incident classをrejectせず許可scope内要約のみ保持。 専用connector契約が一致した場合だけ受領し、別connector契約で代用しない。

### L10-LABO-026-C01 — resource/runtime正常

- Parent/AC: `HELIXLABO-L2-026` / `LABO-026-AC-01`。
- Input fixture: 許可source revisionとresource/runtime observation/environment identityを与える。選択親専用のHELIX-CONNECT contract identity/revision、schema、provenance/trace/receiptを別々に入力する。
- Observable oracle: environment/status/revisionを明示して保持しresource sourceに戻れる。専用connector契約とsource/schema/traceが一致した場合に限り受領する。

### L10-LABO-026-C02 — stale/unknown

- Parent/AC: `HELIXLABO-L2-026` / `LABO-026-AC-02`。
- Input fixture: (a)environment revision stale、(b)resource state unknown、(c)source contract missingを個別・併発。 選択親専用connector identity/revision/schema/provenanceのmissing、stale、mismatchを個別に投入する。
- Observable oracle: healthy/currentへ補完せずsource ownerへ差戻す。専用connector mismatchも受領成立にせず、INFRASTRUCTURE source/contract ownerへ戻し、別connectorへfallbackしない。

### L10-LABO-026-C03 — resource authority境界

- Parent/AC: `HELIXLABO-L2-026` / `LABO-026-AC-02`。
- Input fixture: LABO outputからresource allocation/config authorityを変更しようとする。
- Observable oracle: resource authority change 0。

### L10-LABO-026-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-026` / `LABO-026-AC-01`。
- Input fixture: 別resource classだが同じsource contract/data scopeに適合。 選択親専用のHELIX-CONNECT contract identity/revision/schema/provenanceを入力する。
- Observable oracle: 許可sourceとして同一provenance oracleへ通す。 専用connector契約が一致した場合だけ受領し、別connector契約で代用しない。

### L10-LABO-027-C01 — accepted contract正常

- Parent/AC: `HELIXLABO-L2-027` / `LABO-027-AC-01`。
- Input fixture: 選択connection固有のadmitted contract/schema version, source ID, request/response trace, accepted receiptを与える。別connector契約しか存在しない対照も与える。選択親専用のHELIX-CONNECT contract identity/revision、schema、provenance/trace/receiptを別々に入力する。
- Observable oracle: 自身のsource/schema/trace/payload一致時だけobservationを受領する。別connector契約の暗黙共有/代用では受領成立しない。

### L10-LABO-027-C02 — contract mismatch

- Parent/AC: `HELIXLABO-L2-027` / `LABO-027-AC-02`。
- Input fixture: (a)schema drift、(b)trace identity欠落、(c)stale contract versionを別々に投入。 選択親専用connector identity/revision/schema/provenanceのmissing、stale、mismatchを個別に投入する。
- Observable oracle: unknown/holdとCONNECT/source ownerへの戻し。 専用connector mismatchも受領成立にせず、HELIX-CONNECT/source ownerへ戻し、別connectorへfallbackしない。

### L10-LABO-027-C03 — drift＋部分有効

- Parent/AC: `HELIXLABO-L2-027` / `LABO-027-AC-02`。
- Input fixture: 契約が一部fieldを読めるが一つにschema mismatch/unknownがある。
- Observable oracle: 一致fieldのsourceは保持し、不一致をnormalizationで隠さず成功扱いしない。

### L10-LABO-027-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-027` / `LABO-027-AC-01`。
- Input fixture: 未見の接続sourceだが個別contractとtraceを満たす。別connectorのcontractだけを流用したnegative対照も与える。 選択親専用のHELIX-CONNECT contract identity/revision/schema/provenanceを入力する。
- Observable oracle: 自身のadmitted contractに従う場合だけ接続observationを作る。別connector契約の暗黙共有/代用は拒否し、新しい共有許可経路は発明しない。 専用connector契約が一致した場合だけ受領し、別connector契約で代用しない。

### L10-LABO-028-C01 — OS-assigned Worker result正常

- Parent/AC: `HELIXLABO-L2-028` / `LABO-028-AC-01`。
- Input fixture: OS assignment ID/revision、task class、Worker identity、result source/revision/status/verificationに加え、L2-006のexperiment identity・target version・scopeを同一値で揃えて投入する。別experiment、別ticket、target version違いのresultを個別変異で与える。選択親専用のHELIX-CONNECT contract identity/revision、schema、provenance/trace/receiptを別々に入力する。
- Observable oracle: task/assignment/sourceおよびL2-006と同一experiment identity・target version・scopeをtraceし、状態はobservedのまま評価済へ上げない。

### L10-LABO-028-C02 — assignment/result failure

- Parent/AC: `HELIXLABO-L2-028` / `LABO-028-AC-02`。
- Input fixture: (a)assignment missing、(b)wrong task class、(c)Worker result revision staleを個別・併発。 選択親専用connector identity/revision/schema/provenanceのmissing、stale、mismatchを個別に投入する。
- Observable oracle: resultはhold/unknownとしWorkerをauthority ownerにしない。assignment不明・assignment/result mismatchは親指定のOS assignment ownerへ戻す。専用connector contract mismatchは受領不成立・unknownとして保留する。固定親が指定するassignment不明のOS戻し先と区別し、connector不一致のownerを推測しない。別connectorへfallbackしない。

### L10-LABO-028-C03 — evaluation promotion否定

- Parent/AC: `HELIXLABO-L2-028` / `LABO-028-AC-02`。
- Input fixture: 単一successful Worker outputだけでeligible/qualified/evaluated claimを追加。
- Observable oracle: 観測は保持するが評価済みclaim 0。

### L10-LABO-028-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-028` / `LABO-028-AC-01`。
- Input fixture: 未見task classだがOS assignment/result contractは満たす。 選択親専用のHELIX-CONNECT contract identity/revision/schema/provenanceを入力する。
- Observable oracle: observationとして記録し評価区分はunassessed。 専用connector契約が一致した場合だけ受領し、別connector契約で代用しない。

### L10-LABO-029-C01 — CI/test正常

- Parent/AC: `HELIXLABO-L2-029` / `LABO-029-AC-01`。
- Input fixture: 実際に実行された結果、対象head/revision、test scope、log/receiptを与える。選択親専用のHELIX-CONNECT contract identity/revision、schema、provenance/trace/receiptを別々に入力する。
- Observable oracle: scope付き結果をsource revisionへtraceし実行statusを分離する。専用connector契約identity/revision/schema/provenanceも一致したときだけ受領する。

### L10-LABO-029-C02 — non-pass inputs

- Parent/AC: `HELIXLABO-L2-029` / `LABO-029-AC-02`。
- Input fixture: (a)not run、(b)stale head、(c)interrupted/cancelled、(d)scope missingを個別投入。 選択親専用connector identity/revision/schema/provenanceのmissing、stale、mismatchを個別に投入する。
- Observable oracle: いずれもpassにしない。source ownerへmissing scopeを返す。 専用connector mismatchも受領成立にせず、検査scope/source不一致はHARNESS verificationまたはOS execution evidence ownerへ戻し、別connectorへfallbackしない。

### L10-LABO-029-C03 — 複合failure

- Parent/AC: `HELIXLABO-L2-029` / `LABO-029-AC-02`。
- Input fixture: stale targetとinterrupted status、receipt mismatchを同時投入。
- Observable oracle: first causeと各missing conditionを残しsuccess0。

### L10-LABO-029-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-029` / `LABO-029-AC-01`。
- Input fixture: 未見CI/test suiteだがHARNESS verification contractとOS execution evidenceは一致。 選択親専用のHELIX-CONNECT contract identity/revision/schema/provenanceを入力する。
- Observable oracle: 新しいtest nameでもscope/revision verified observation。 専用connector契約が一致した場合だけ受領し、別connector契約で代用しない。

### L10-LABO-030-C01 — 採択製品scope正常

- Parent/AC: `HELIXLABO-L2-030` / `LABO-030-AC-01`。
- Input fixture: 採択済みProduct Core contract、専用connector、source/product identity、版、許可利用結果を与える。
- Observable oracle: product-specific observation identityとmeaningを保持。

### L10-LABO-030-C02 — version/source mismatch

- Parent/AC: `HELIXLABO-L2-030` / `LABO-030-AC-02`。
- Input fixture: Product Core source/product mismatchと、選択された専用HELIX-CONNECT `HELIXLABO-L2-030` contractについてidentity欠落、不一致identity、revision欠落、stale revision、不対応schema、provenance欠落、不一致provenanceを各々単独で投入する。別fixtureではこれらの契約field変異を併発し、さらに異なるsourceが同じ表示labelを持つ例を与える。
- Observable oracle: 変異fieldごとに契約不成立の理由と当該Product Core ownerへの戻し先を保持し、結果を受領済みにしない。異なるsource identitiesを統合せず、他の一致field/製品stateも書き換えない。

### L10-LABO-030-C03 — 未選択製品否定

- Parent/AC: `HELIXLABO-L2-030` / `LABO-030-AC-02`。
- Input fixture: 未採択/unselected Product Core sourceをinputに見せて必須connectionとして強制する。
- Observable oracle: 未選択時にrequired dependency 0、未観測状態維持。

### L10-LABO-030-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-030` / `LABO-030-AC-01`。
- Input fixture: 異なる採択済みProduct Core source/productと、そのscope用に選択された専用HELIX-CONNECT `HELIXLABO-L2-030` contractを与える。contract identity/revision/schema/provenanceと許可利用結果のsource identity/revisionが対応し、選択状態を明示する。
- Observable oracle: 選択したcontractのidentity/revision/schema/provenanceとsourceを結び、当該product scopeでのみ同じprovenance ruleを適用する。version intentはsource contractに従い、別productへ横展開しない。

### L10-LABO-034-C01 — 内部generic evidence正常

- Parent/AC: `HELIXLABO-L2-034` / `LABO-034-AC-01`。
- Input fixture: 複数の独立product/meaning/episode、scope evidence、counterexample、source revisionsを含むgeneric structure candidateを用意。 選択された当該親専用connector contract identity/revision/schema/provenanceも入力する。
- Observable oracle: 1.0内部evidence candidateは支持範囲/反例/sourceを保持しBRAIN向けの構造candidateとして区別する。外部取得/knowledge評価は行わない。connector条件一致時のみ受領し、missing/stale/schema/provenance mismatchは受領不成立として保留する。connector mismatchは受領不成立・unknownとして保留し、L2-009の戻し先は一事例・適用範囲不明に限る。connector不一致の戻し先としてBRAIN source/consumerを推測しない。

### L10-LABO-034-C02 — single/product-specific failure

- Parent/AC: `HELIXLABO-L2-034` / `LABO-034-AC-02`。
- Input fixture: (a)single episode、(b)single product meaning、(c)顧客固有ルール、(d)unknown scopeを個別・併発。正常対照では複数meaning/product/episodeの根拠とgeneric候補を入力する。さらにBRAIN向け専用connectorのidentity欠落、revision stale、schema非対応、provenance不一致をそれぞれ独立に与える。
- Observable oracle: single case/product-specific meaning/顧客固有ルール/unknown scopeからの候補はholdしL2-009へ戻し、正常対照だけ根拠・scope付きgeneric candidateとして出す。connector各変異は受領不成立・unknownとして保留する。固定親が指定しない宛先やownerは推測せず、authority/ingestionを生成しない。

### L10-LABO-034-C03 — version boundary

- Parent/AC: `HELIXLABO-L2-034` / `LABO-034-AC-02`。
- Input fixture: 外部知識evaluation loop (2.0) を1.0 candidate入力へ混ぜる。
- Observable oracle: 2.0の内容はこの1.0要件・caseの対象外。条件を満たす内部evidenceの候補化は可能なまま保持し、外部loopへ昇格させない。

### L10-LABO-034-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-034` / `LABO-034-AC-01`。
- Input fixture: 別の複数product evidence群でsupported generic structureと適用限界が明記。
- Observable oracle: 同じ根拠規則で内部候補化し、特定例名に依存しない。

### L10-LABO-035-C01 — 評価packet正常

- Parent/AC: `HELIXLABO-L2-035` / `LABO-035-AC-01`。
- Input fixture: 判断精度/failure corpus/counterexample/model-provider compare/FP-FN/diagnosis-review-bot materialをsource revision/scope/unassessed state付きで入力。 選択された当該親専用connector contract identity/revision/schema/provenanceも入力する。
- Observable oracle: L2-035で扱う評価material packetをINTELLIGENCE境界へ渡す。052の全材料収集・同一revision到達が完了したとは表示せず、054のBench水準を035 payloadへ混ぜない。source revision/scope/unassessed状態と当該接続contractが一致する場合だけ受領する。connector mismatchは受領不成立・unknownとして保留し、固定L2-035が指定しないownerを推測しない。

### L10-LABO-035-C02 — scope/revision failure

- Parent/AC: `HELIXLABO-L2-035` / `LABO-035-AC-02`。
- Input fixture: (a)evidence source revision missing、(b)unassessed field omitted、(c)stale model/provider evaluationを個別・併発。さらにINTELLIGENCE向け専用connectorのidentity欠落、revision stale、schema非対応、provenance不一致をそれぞれ独立に与える。正常対照として全source/revision/scope/evaluation stateが宣言契約に適合するpayloadを入力する。
- Observable oracle: unknown/unassessedを保持し、payload不一致は受領不成立として該当inputの既存source/consumer relationを記録する。専用connector mismatchは受領不成立・unknownとして保留する。固定L2-035が指定しないINTELLIGENCE consumerやHELIX-CONNECT/source ownerへ返さない。正常対照だけ同一scopeの評価材料として受領し、current judgmentを偽装しない。

### L10-LABO-035-C03 — learning/operation exclusion

- Parent/AC: `HELIXLABO-L2-035` / `LABO-035-AC-02`。
- Input fixture: packetからmodel tuning/learning、current placement、bot operationを要求するmutation。
- Observable oracle: LABOはevaluation material only。3.0+ learning/adjustment、current judgment/placement/bot executionを1.0で行わない。

### L10-LABO-035-C04 — held-out正常

- Parent/AC: `HELIXLABO-L2-035` / `LABO-035-AC-01`。
- Input fixture: 異なる許可evaluation material typeだが同じ accepted connector/data scope/revision ruleに適合。
- Observable oracle: 未評価状態付きpacketとして受渡す。052の全材料到達や054のBench水準をこのpacketから主張せず、双方の責務を重複定義しない。

### L10-LABO-058-C01 — 単一選択source正常

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-01`。
- Input fixture: scope=1 operation, selected={Worker}, explicit selection reason, current source/contract revision, data-use permission, valid OS assignment/result receipt; BRAIN等はunselectedと明示。
- Observable oracle: Worker input/closureだけを必須化しobservationを返す。unselected BRAIN等はunobservedであり接続稼働は条件外。

### L10-LABO-058-C02 — selected-source missing/unknown

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-02`。
- Input fixture: (a)selected Worker connector欠落、(b)permission unknown、(c)selected receipt staleを個別に投入。
- Observable oracle: 各caseは該当inputを拒否/unknownでOS/source/SECURITYへ戻す。selected inputをunselectedに変えない。

### L10-LABO-058-C03 — 複数source/閉包

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-02`。
- Input fixture: selected={Worker, SECURITY summary} と両sourceのpermission/version/connector closureを与え、片方を一つずつ欠落させる。
- Observable oracle: full closure時のみ両source observation、片方欠落時は該当input不成立。他方有効sourceは個別識別。

### L10-LABO-058-C04 — 未選択／選択不明

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-02`。
- Input fixture: (a)selection=none with permission state known, (b)selection criterion unknown, (c)no selected source but unauthorized raw bytes supplied。
- Observable oracle: (a)no source observation and no success/evaluation claim; (b)clarification; (c)unauthorized intake 0。


### L10-LABO-058-C05 — Web/WEB-OSおよび外部取得の版境界

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-01`, `LABO-058-AC-02`。
- Input fixture: Web/WEB-OSがunselectedの呼出し、既存source contractが採択済みでWebをexplicitly selectedする呼出し、外部取得2.0を1.0へ混ぜるattemptを分けて与える。
- Observable oracle: unselected Webはrequired runtime dependencyにならず、selected時のみ既存採択contractを要求し、external 2.0 inputは1.0へ入らない。

## Stage 4 — HELIXLABO-L2-036/037/038/039/040/041/052/054 L10

親の固定revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2本文full SHA-256は`f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、対L11 full SHA-256は`bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`。対応するPO decisionは`docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`、行84–94。L10は旧test designを実行せず、各固定L2/L11と上記L3のACを測定可能にする。


### L10-LABO-058-C06 — source/scope/operation/version変更後の再照合

- Parent/AC: `HELIXLABO-L2-058` / `LABO-058-AC-02`。
- Input fixture: C01/C03で成立した選択source closureの後、source identity、scope、operation、contract/source versionを一つずつ変更し、さらに複数同時変更の入力を与える。
- Observable oracle: 旧closureを再利用せず変更後の各選択source固有のconnector・permission・version・result conditionを再照合する。条件不明/不一致のsourceだけunknown/holdとし、未選択sourceを必須化しない。

### L10-LABO-036 — HARNESS向けfeedback

- Parent/AC: `HELIXLABO-L2-036` / `LABO-036-AC-01, LABO-036-AC-02`。旧類例: `LEGACY-ASSET-02D897E62EF2FA267267` (`universal-improvement-loop-requirements.md:143–160`, SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`) と `LEGACY-ASSET-0B5B38F146D9538C9A36` (`universal-improvement-loop-acceptance.md:31–42`, SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`)、隣接起点として限定利用。
- **L10-LABO-036-C01 — 正常**：HARNESS対象revision/connector、V-model又はverification-contract issueに関する許可evidenceとsource参照を入力。期待値はscope付きcandidateをHARNESSへ返し、要求/contract revisionを変えず候補と実変更を区別する。
- **L10-LABO-036-C02 — 個別不一致**：target identity unknown、target revision missing/stale、connector stale、source evidence missingを一つずつ投入。target identity不明はOS routing候補へ返し、target以外のrevision/connector/source evidence欠落はHARNESS ownerへ戻す。原因を分け、欠けていないsourceは破棄しない。
- **L10-LABO-036-C03 — 境界変異**：candidate生成時に要求意味または工程contractを書き換え、実験結果を即時反映とする。いずれも該当candidateは不成立。意味差を明記した提案自体は許し、HARNESS側の判断材料として返す。
- **L10-LABO-036-C04 — 未見正常**：別のops-maintenance/refactor問題だが対象revisionとconnectorが有効なfixture。未見のproblem subtypeだけを理由に拒否せず、同じscope traceでcandidateを返す。

### L10-LABO-037 — OS運転feedback

- Parent/AC: `HELIXLABO-L2-037` / `LABO-037-AC-01, LABO-037-AC-02`。旧類例とpinは`LABO-036`記載と同一。OS target routingの隣接類例であり、旧運用を実行・継承しない。
- **L10-LABO-037-C01 — 正常**：ticket/WIP identity、worker placement、CI profile、検査・recovery等のうちfixtureで観測したfieldだけをsource/revision付きでOS candidateへ渡す。OSがticket/routingを保持する。
- **L10-LABO-037-C02 — 欠落・stale**：ticket identity欠落、source revision stale、OS connector missingを独立に投入。該当candidateをholdしOSへ戻す。別の有効fieldを消さない。
- **L10-LABO-037-C03 — owner boundary**：LABOがticket発行、worker assignment、priority/stateを直接更新、又はOS routingを迂回する変異を与える。期待値はOS-owned write 0、理由付きhold。提案を示すだけなら不成立としない。
- **L10-LABO-037-C04 — 未見正常**：cost/orderに異なる値を持つがOS target/connectorは有効な通常fixture。値の既定値やticket操作を推測せずcandidateとして保持する。

### L10-LABO-038 — SECURITY向けfeedback

- Parent/AC: `HELIXLABO-L2-038` / `LABO-038-AC-01, LABO-038-AC-02`。旧類例とpinは`LABO-036`記載と同一。旧authority非書込のfailure型だけを類例として参照。
- **L10-LABO-038-C01 — 正常**：許可されたsanitized evidence、target identity、SECURITY data-handling contractを与える。期待するcandidateは認可/隔離/credential/情報保護のscopeを示し、raw secret値を含まない。
- **L10-LABO-038-C02 — 個別authority不一致**：permission unknown、target contract missing、data scope mismatchを一つずつ与える。対象candidateをholdしてSECURITYへ戻し、不足の種類を区別する。
- **L10-LABO-038-C03 — 権限境界・sanitized変更提案**：二つの独立fixtureを与える。第一はLABOが現在のpermission/authorityを直接変更するmutationで、実変更0・candidateをSECURITYへ返す。第二は根拠とscopeを持つcredential非含有の変更差分candidateを提示し、現行authorityを不変のままSECURITYの判断材料へ送る。後者はcandidate提案として許容する。restricted/raw credentialを通常packetへ混入する別fixtureではpacket流出0、該当candidateはhold。
- **L10-LABO-038-C04 — 未見正常**：既許可の隔離又はdata-handling観測を別source revisionで投入し、contractとtargetが適合する。未見field値を理由に権限を追加要求せず、source/scope付きcandidateを返す。

### L10-LABO-039 — Worker実行結果feedback

- Parent/AC: `HELIXLABO-L2-039` / `LABO-039-AC-01, LABO-039-AC-02`。旧類例とpinは`LABO-036`記載と同一。target routingの類例のみ利用。
- **L10-LABO-039-C01 — 正常**：許可されたWorkerの実行/停止/復旧result identity・revisionとOS/SECURITY target routeを入力。candidateからWorker resultへ追跡可能で、assignmentは変更しない。
- **L10-LABO-039-C02 — 個別routing欠落**：Worker result revision欠落、OS route欠落、SECURITY routeが必要な条件でそのroute欠落を個別に投入。該当caseだけ保留し、責務不明またはOS routing欠落は固定親どおりOSへ戻す。SECURITY routingが適用されるscopeではそのroute欠落をSECURITYへ戻す。Worker resultの欠落/不一致はsuccessにしない。
- **L10-LABO-039-C03 — assignment境界**：LABOがWorkerを直接再割当・再実行する変異を与える。新しいassignment/execution 0、提案はcandidateのままOSへ返る。
- **L10-LABO-039-C04 — 未見正常**：異なるresult status（停止または復旧）が有効なsource identityとrouteを持つ。statusをsuccessへ正規化せず、与えられたstatusを保持する。

### L10-LABO-040 — CONNECT接続feedback

- Parent/AC: `HELIXLABO-L2-040` / `LABO-040-AC-01, LABO-040-AC-02`。旧類例とpinは`LABO-036`記載と同一。旧sourceに接続仕様の直接一致はなく、current connector scopeはL2から再導出。
- **L10-LABO-040-C01 — 正常**：接続identity、採択済み対象scope/version、retry観測、traceとCONNECT connectorを与える。対象接続だけのcandidateをCONNECTへ返し、traceを保つ。
- **L10-LABO-040-C02 — 個別version/trace failure**：connector version mismatch、trace missing、接続identity不一致を個別に投入。各々をunknown/holdでCONNECTへ戻し、別接続と混ぜない。
- **L10-LABO-040-C03 — owner boundary**：candidate作成時にconnector contractを直接改変する変異。contract write 0、差分はcandidateとして区別しCONNECTへ返す。
- **L10-LABO-040-C04 — 未見正常**：別の採択済み接続scopeで有効なversion/traceを与える。全未選択connectorの存在を要求せず、選択接続のcaseを評価する。

### L10-LABO-041 — Product Core別feedback

- Parent/AC: `HELIXLABO-L2-041` / `LABO-041-AC-01, LABO-041-AC-02`。旧類例とpinは`LABO-036`記載と同一。Product Core固有の現行scopeはL2から再導出。
- **L10-LABO-041-C01 — 正常**：単一の選択Product Core identity/version/connectorとdomain/UX/requirement evidenceを与える。candidateは同じ製品targetとsourceに返る。
- **L10-LABO-041-C02 — target failure**：target unknown、target version mismatch、個別connector missingを独立に投入。該当candidateをholdし対象product ownerへ返す。
- **L10-LABO-041-C03 — cross-owner negative**：product-specific meaningをBRAINのgeneric knowledgeへ送る変異。generic promotion 0。複数製品のsourceを同じ正本へ混ぜない。
- **L10-LABO-041-C04 — 未見正常**：別の明示選択済Product Coreとその有効contractを与える。未選択製品のconnectorを常時要求せず、そのtargetのscopeでのみ候補を返す。

### L10-LABO-054 — Bench水準のINTELLIGENCE接続

- Parent/AC: `HELIXLABO-L2-054` / `LABO-054-AC-01, LABO-054-AC-02`。旧起点は`LEGACY-ASSET-28FB139B26CD61CC51EE` (`helix-bench-evaluation.md:19–36,96–169`, SHA `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`) と `LEGACY-ASSET-A952A3A175EB82A4781B` (`helix-bench-evaluation-acceptance.md:28–41`, SHA `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`)。055水準/INTELLIGENCE接続とworker-admissionの責務分離だけ隣接類例。
- **L10-LABO-054-C01 — 正常**：055からtask type/model class/level/basis/evaluation scope/unassessedを含むpayload、採択済み専用connectorのidentity/revision/schema/provenance、および同じscopeのINTELLIGENCE受領を渡す。期待値は全fieldが一致し、LABO source→connector→INTELLIGENCE受領まで追跡できること。INTELLIGENCEの配置案とOSの指定/割当は別状態に保ち、unassessedもそのまま受け渡す。
- **L10-LABO-054-C02 — 個別payload/connector不一致**：level、scope、basis、unassessed marker、task type/model classを一つずつ改変する。別fixtureで専用connector identity欠落、revision stale、schema非互換、provenance欠落をそれぞれ個別に与える。個々の不一致は受領成立にせず、payload不一致は元scopeと理由を保持してL2-055水準生成側へ戻す。connector条件不成立は受領成立にせず接続を保留する。返却先を新設せず、固定親の既存責務境界を変えない。
- **L10-LABO-054-C03 — authority/extrapolation negative**：未評価jobを過去のlevelで成功保証、LABOがworker/modelを割当、scoreからscope/branch/merge authorityを作る変異。各出力を不成立とし、候補水準をそのまま持つ。
- **L10-LABO-054-C04 — 未見正常**：別task/model classについて055が評価範囲とunassessed状態を示した水準結果を同範囲で受領する。評価済みと偽らず受領し、未評価状態だけを理由に有効な受渡しを拒否しない。

### L10-LABO-052 — 評価材料受け渡し循環

- Parent/AC: `HELIXLABO-L2-052` / `LABO-052-AC-01, LABO-052-AC-02`。旧類例は`LEGACY-ASSET-02D897E62EF2FA267267` (`universal-improvement-loop-requirements.md:143–160`, SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`) と `LEGACY-ASSET-0B5B38F146D9538C9A36` (`universal-improvement-loop-acceptance.md:31–42`, SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`)。旧testは設計類型のみ参照、実行しない。
- **L10-LABO-052-C01 — 正常**：L2-035 payload、source provenance、同revision/scopeのINTELLIGENCE receiptを与える。sourceとreceiptのpayload identity/revision/scope/unassessedが一致し、受領まで辿れる。
- **L10-LABO-052-C02 — 個別closure failure**：035 schema mismatch、source revision stale、scope mismatch、receipt missingをそれぞれ独立に投入。該当材料だけ未完として保留し、source/evidenceまたはLABO再評価へ戻す。
- **L10-LABO-052-C03 — authority negative**：payload受渡しからcurrent judgment/prediction/placement/bot operationまたはtraining/model changeを生成するmutation。いずれも不成立。035 payload contractを052が再定義するmutationも不成立。
- **L10-LABO-052-C04 — 未見正常**：新しい評価材料種別でも035の既定義payload contractとprovenanceを満たす場合、同じscope/source revisionで受領追跡を成立させる。未評価フィールドは保持し、別材料や未選択sourceを必須にしない。

全caseは候補設計であり未実行である。成功条件は各親のidentity・scope・owner・receipt状態の観測で、旧test結果や文章上の宣言を合格証拠にしない。

## Stage 5 — HELIXLABO-L2-050/059/060/061 L10（部分草稿）

各caseは同番号のL3 ACを参照する。固定L2/L11 basisはmain `633bf12`。旧起点はStage 5 L3 functional-requirements.mdの項目別crosswalkに示したlegacy requirement/acceptance pairであり、旧test・runtimeは実行せず、旧数値や旧実装結果を現行合格証拠にしない。

### `HELIXLABO-L2-050` 内部改善循環

| case ID | FR / AC | 入力・操作 | 期待oracle |
|---|---|---|---|
| `CASE-LABO-L10-050-01` | `FR-LABO-L3-050` / `AC-LABO-L3-050-01` | 同一scopeのObservedから再観測までの各段階identity/source revision、OS assignment/Worker result、OS routing、target ownerの変更・検証receiptとLABO再観測を対応づける。 | 全段階を同一ticket/experiment/target revisionへ追跡でき、変更後効果・退行評価が独立に表示される。 |
| `CASE-LABO-L10-050-02` | `FR-LABO-L3-050` / `AC-LABO-L3-050-02` | assignment欠落、target revision drift、変更後観測欠落、effect evaluation欠落を別々にmutateする。 | 影響段階は未完のまま残り、candidate/OS登録/target変更/CI成功から完了へ進まない。元recordを上書きしない。 |
| `CASE-LABO-L10-050-03` | `FR-LABO-L3-050` / `AC-LABO-L3-050-03` | 未採択candidateだけが存在するrunと、別ticketでは循環が完了した対照を与える。 | candidateは候補状態、別ticketの結果は分離され、割当/target変更をLABOから作らない。 |

### `HELIXLABO-L2-059` 効果優先関係付き比較評価

| case ID | FR / AC | 入力・操作 | 期待oracle |
|---|---|---|---|
| `CASE-LABO-L10-059-01` | `FR-LABO-L3-059` / `AC-LABO-L3-059-01` | 同task/scope/oracle/scorer/protocol/hardwareの、あらかじめ選んだ2群のrun receipt、適用可能なscope/revision priority decision、retry/救援/rework/CI/review/人修正と価格sourceを与える。実験条件と支援cohortは別fieldで持つ。 | 品質条件を先に評価し、適用済みdecisionを再確認させず選択群に限定した比較を返す。cost・time・human effort・欠測を区分し、未換算人時間を0円にしない。 |
| `CASE-LABO-L10-059-02` | `FR-LABO-L3-059` / `AC-LABO-L3-059-02` | quality oracle failure、snapshot/protocol/hardware/decision scope mismatchを個別に変異する。別caseでretry、上位Worker救援、rework、CI/rerun、review、人修正のcostを各々除外し、accepted change=0を効率成功とする変異、historical runをcurrent性能へ流用、条件軸とcohort軸の混同、二群結果から三者関係を主張する変異を投入する。品質不合格runには低価格・短時間値を付け、missing priceと換算率のない人時間も与える。 | 比較可能/達成の主張を拒否し、各除外・cohort混同・過去結果流用を別理由で示す。重大失敗を別表示し、低価格/高速で品質不合格を相殺しない。accepted change=0は効率成功にせず、missing cost・未換算人時間は0円にしない。二群だけ有効な場合に限り二者結果を保ち、三者関係は主張しない。 |
| `CASE-LABO-L10-059-03` | `FR-LABO-L3-059` / `AC-LABO-L3-059-03` | 選択二群だけ有効なreceiptが揃い未選択第三群がない対照、decision失効/未決、非貨幣化人時間、price missingを個別に投入する。 | 選択二群の限定比較は返せる。未決decisionや不足指標はunknown/部分評価とし、未選択群を必須化せずmissing costを0へしない。 |

### `HELIXLABO-L2-060` Worker支援有無の同一設定比較

| case ID | FR / AC | 入力・操作 | 期待oracle |
|---|---|---|---|
| `CASE-LABO-L10-060-01` | `FR-LABO-L3-060` / `AC-LABO-L3-060-01` | 対応するsupport-on/off runに同一task snapshot、Worker/model/provider/version/effort、oracle、toolchain、protocolと各OS assignment/result receiptを与え、許可済みsupport-onで元Workerが修正し、元Worker・支援者とは異なるidentity/context/authorityのreviewerがreview、OS-L2-020同一oracle rerunを行ったreceiptを含める。支援側の実source・救援・人介入も添える。 | 支援有無だけ異なるpairと認定し、3者の分離とOS-L2-020の同一oracle検証を確認して、quality gateを保った群別結果・費用・人介入・再作業・欠測を返す。 |
| `CASE-LABO-L10-060-02` | `FR-LABO-L3-060` / `AC-LABO-L3-060-02` | model/effort差、片群assignment欠落、oracle revision差、支援contextがoff群へ漏れる場合、支援者をreviewerにする場合を一つずつ投入する。別変異ではretry、救援/rework、review、人修正のcostを欠かし、missing priceまたは換算率のない人時間を0円にする。quality oracle失敗側へ低価格/短時間を与える対照も含める。 | 当該pairを比較不能または費用不完全にし、片群だけの結果から支援効果を主張しない。支援者reviewを独立検証扱いにせず、支援の実行や割当はLABOから開始しない。missing cost・人時間を0円にせず、低価格/短時間でquality failureを相殺しない。 |
| `CASE-LABO-L10-060-03` | `FR-LABO-L3-060` / `AC-LABO-L3-060-03` | 支援on側の未選択sourceが不在でも実使用source一覧が明確な正常対照と、使用provenanceがunknownのpairを比較する。 | 未選択sourceを要求せず、unknown pairだけ未評価に残す。未選択を使ったことにも、比較成立にも推定しない。 |

### `HELIXLABO-L2-061` task・oracle隔離と履歴の完全性

| case ID | FR / AC | 入力・操作 | 期待oracle |
|---|---|---|---|
| `CASE-LABO-L10-061-01` | `FR-LABO-L3-061` / `AC-LABO-L3-061-01` | 合成15-field exact task snapshot、scorer/protocol/rubric/judge revision+digestを与え、public worker inputと隠匿oracleの境界を確認する。Worker側からoracleへ到達できない一方、authorとは別identity/session/contextのjudgeへ正しいoracleを渡し、その実role/context receiptをhistorical resultのmodel/runtime/task snapshotへ結ぶ。 | 15項目と必要digestが一致し、Workerにhidden contentがなく、judgeの正当なoracle accessが保たれる。役割・context分離receiptが正しく、歴史結果は歴史scopeでのみ追跡される。 |
| `CASE-LABO-L10-061-02` | `FR-LABO-L3-061` / `AC-LABO-L3-061-02` | 合成fixture上で15-fieldを1項ずつ欠落させ、各々独立にdigest drift、hidden answer漏出、future answer漏出、合成secret漏出、合成PII漏出、private review context漏出を変異する。別個の変異としてauthorをjudgeにする、identity名札だけ変えてcontextを共有、snapshot/oracle digest不一致、fixture/protocol/scorer version driftを試す。正常対照としてjudgeだけが固定oracleへ正当にアクセスするfixtureも与える。 | 各不一致・各漏出で該当比較を隔離し、重大漏洩/失敗を平均点で相殺せず、旧結果をcurrent evidenceへ再利用しない。judgeの正当なoracle accessをWorker漏出に数えない。記録するのはsource identityとreasonで、secret/PII/private contextの内容をauditへ複写しない。 |
| `CASE-LABO-L10-061-03` | `FR-LABO-L3-061` / `AC-LABO-L3-061-03` | hidden oracle非選択scopeと、新taskの適用性を比較する。前者は別契約を特定し、独立judge/blind要件が適用外とする契約上の根拠を提示する正常対照を含める。根拠欠落・unknown applicability、以前未見のattachment/derived descriptionにanswerが漏れるfixture、worker可視範囲が不明なcontext-reference欠落も個別に与える。 | 独立judge要件の適用外は別契約の明示根拠がある場合だけ記録し、oracle非選択のみで解除しない。適用性unknownと可視範囲不明は未検証でownerへ戻す。未見source由来answer漏出は漏洩として隔離する。通常履歴全体へhidden taskを要求しない。 |

### HELIXLABO-L2-063/064/065/066 — 再発評価・候補名遮蔽・scorecard・修復比較oracle

以下はL3 Stage 5の同番号AC候補に1対1で対応する。固定L2/L11 basisはmain `633bf12`。旧source/test-design起点はL3文書のitem crosswalkに記録し、legacy test/runtimeは実行しない。

| case ID | FR / AC | 入力・操作 | 期待oracle |
|---|---|---|---|
| `CASE-LABO-L10-063-01` | `FR-LABO-L3-063` / `AC-LABO-L3-063-01` | version/適用条件/独立検証receiptを持つ修復recipeと、同種episode、親指定threshold/母数/反例、LABO Feedback、OS登録、owner変更、再検証と運用後観測を同一系譜で与える。採択source atom `PILLAR-RECIPE-BASELINE-L0230`に対応するrecipe保存とimprovement backlog引継ぎの記録も含める。 | recipeを評価知識に保持し、親条件に基づく反復candidate/warningとbacklog引継ぎを出力しつつOS/ownerの各stateを混ぜない。 |
| `CASE-LABO-L10-063-02` | `FR-LABO-L3-063` / `AC-LABO-L3-063-02` | 未検証案、重複resend、原因/条件混合、thresholdまたは母数欠落、頻出なのにcandidate/warning欠落を個別に与える。さらに成功終結event後もprocedure/backlog receiptが未解決の入力（`PILLAR-RECIPE-BASELINE-L0230`相当の保存・引継ぎ記録欠落を含む）、registration/target changeだけでclosureを主張する入力、運用後観測receiptを欠く入力を別々に投入する。LABO gate有効化、HARNESS/provider memoryへの正本書込、未評価issue知識のBRAIN昇格、未評価知識からの実行authority生成も独立変異にする。 | 各個別エラーで成功recipe・同種反復・予防完了を主張しない。成功終結後の未解決procedure/backlogと運用後観測欠落を未完のまま示し、完了へ丸めない。gate activation、memory write、BRAIN promotion、authority writeはいずれも0とし、該当義務だけを原因別owner（source/LABO/OS/target）へ返す。 |
| `CASE-LABO-L10-063-03` | `FR-LABO-L3-063` / `AC-LABO-L3-063-03` | 新原因・改版recipeで同一適用性が確認できないfixtureと、旧成功recordのみの入力を与える。 | 頻出/現行有効性をunknownとして保持し、評価を未完にする。 |
| `CASE-LABO-L10-064-01` | `FR-LABO-L3-064` / `AC-LABO-L3-064-01` | 選択比較pairでjudge-visible資料を検査し、元identity mappingはrecord側にだけ保持。fixture/rubric/judge version/sample/retryの事前固定条件が同一のpairを与える。 | 候補名がjudge資料に現れず、全5条件が固定一致する場合だけblind比較を成立候補として返す。 |
| `CASE-LABO-L10-064-02` | `FR-LABO-L3-064` / `AC-LABO-L3-064-02` | 候補名直書き、添付metadata漏れ、judge視界不明を個別に与える。fixture/rubric/judge version/sample/retryの5条件はそれぞれ欠落・変更を別変異とし、さらにsmoke-only/平均相殺/assignment許可も独立に試す。 | 各対象pairは比較不成立。別pairへfindingを広げず、smoke結果をfull qualificationやassignmentへ読み替えない。 |
| `CASE-LABO-L10-064-03` | `FR-LABO-L3-064` / `AC-LABO-L3-064-03` | 通常history記録と、新runtime版/新output形式のjudge-visible資料が不足する比較を対照にする。 | historyにblind比較を強制せず、新比較は可視範囲がunknownなら過去blind証拠を継承せずevaluation ownerへ戻す。 |
| `CASE-LABO-L10-065-01` | `FR-LABO-L3-065` / `AC-LABO-L3-065-01` | 選択qualification scopeのmanifest/receipt、8軸各判定、machine smoke/blind full-benchを別記録する正常例と、独立task scorecardの6 fields及びfirst Attempt failure→retry successを与える。さらに同一task class/scope/measurement definition/revisionの複数receiptと、それぞれのtrend/failure findingを与える。 | 8/8軸を同一fixture/oracle/rubric版へ結び、6/6 fieldはscope definitionとreceiptを持つ。選択scope内で条件tupleの一致したtrend/failure findingだけを基準tupleとともに返し、条件違いを同じtrendへ混ぜない。retry成功をfirst_pass成功へ変えず、owner decisionを参照する。 |
| `CASE-LABO-L10-065-02` | `FR-LABO-L3-065` / `AC-LABO-L3-065-02` | 8軸を各々欠落/版違い、manifest/digest、smokeのみ、visible leak、authorとjudgeが同じ作成contextを共有する条件を個別に変異する。scorecardは6 fields各欠落、適用外理由欠落、unknown→0、retry first-pass誤記、retry/rework cost欠落を個別に投入する。trend入力はtask class/scope/measurement definition/revisionのいずれかをずらす。 | 該当scope/metricを未完・unknownとし、author/judge context共有は独立評価と認めない。異なる条件tupleのtrend混合も不成立にする。他軸成功で相殺せず、qualification/admissionをLABOから作らない。 |
| `CASE-LABO-L10-065-03` | `FR-LABO-L3-065` / `AC-LABO-L3-065-03` | qualification未選択の通常Worker history、新runtime/task/fixture/rubric版、未定のdiff/lint measurement definitionを比較する。 | 通常historyはqualification bench不要。新scopeは既存資格を継承せず、定義欠落はunknown/owner返却。 |
| `CASE-LABO-L10-066-01` | `FR-LABO-L3-066` / `AC-LABO-L3-066-01` | Aと候補の事前同一eligible case set、scope/revision/oracle/protocol/cutoff、両群のcase receiptを与え、各群の2 countを算出する。 | 両群のmisrepair_count/Nとunresolved_count/Nを別々に、分子/分母とcase-oracle receipt付きで示し、059費用比較も保つ。 |
| `CASE-LABO-L10-066-02` | `FR-LABO-L3-066` / `AC-LABO-L3-066-02` | A/候補のcase集合またはoracle条件を変える、結果後にN変更、重複/unknown除外、oracle receiptなし、分子のみ、成功/安価さで隠すmutationを独立に与える。 | 比較不能/未評価を返し、unknownを0・除外・成功として数えない。 |
| `CASE-LABO-L10-066-03` | `FR-LABO-L3-066` / `AC-LABO-L3-066-03` | A identity/versionまたは初見caseのoracle applicabilityが不明なfixtureを与える。 | Aやthresholdを推測せず該当比較のみunknownとしてownerへ戻し、他scopeは継続可能にする。 |

### HELIXLABO-L2-067/068/069/070/071 — 初回候補・Attempt・再発行・補助計測・資格oracle

固定parentはmain `633bf12`。L2 full SHA-256 `cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6`、L11 full SHA-256 `39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a`。070/071の採択rootはlive26 decision rows 49/50のexact registrationに従う。個別raw spanはL3 crosswalkを参照する。旧test-designは未実行の設計資料で、現行runtime/結果証拠として実行しない。

| L10 case | 対応FR / AC | Fixtureと操作 | 期待oracle |
|---|---|---|---|
| `CASE-LABO-L10-067-01` | `FR-LABO-L3-067` / `AC-LABO-L3-067-01` | 事前固定eligibility predicate/oracle revision、OS assignment Attempt A、eligible candidate Aの結果後にB/Cへ変更した順序付きdigest・event receiptを与える。同一Attempt内の修復と別Attempt Dを分け、065 first_pass/retry_countと068 Attempt identityを併記する。 | Aをfirst eligibleとして固定。B/CはAttempt Aの修復roundへ各々receiptどおり結び、Attempt Dと混ぜない。065/067/068の値は換算・上書きしない。 |
| `CASE-LABO-L10-067-02` | `FR-LABO-L3-067` / `AC-LABO-L3-067-02` | 事後predicate選択、predicate/oracle版欠落、candidate digest欠落、順序不明、重複event、Attempt境界交差、final-only入力を一変異ずつ投入し、round event一件欠落の比較fixtureも与える。 | 該当first-eligible/round値のみunknown/未評価。missing eventを0 roundにせず、source/OS/task ownerへ不足を返す。 |
| `CASE-LABO-L10-067-03` | `FR-LABO-L3-067` / `AC-LABO-L3-067-03` | 新task classまたはpredicate/oracle revisionで既存eligibility条件が適用できるか不明な正常未見fixtureを与える。 | 過去predicate/thresholdを継承せずunknownとする。他の既知scopeは評価を続けられる。 |
| `CASE-LABO-L10-068-01` | `FR-LABO-L3-068` / `AC-LABO-L3-068-01` | 同じ選択scopeでOS receiptが完全と示すAttempt identity A/B/Cと、Aの重複delivery、各々異なる成功/失敗/中断statusを与える。 | distinct Attempt countは3、A重複は加算せずstatusを改変しない。 |
| `CASE-LABO-L10-068-02` | `FR-LABO-L3-068` / `AC-LABO-L3-068-02` | Attempt identity欠落、scope外identity、実行前拒否、event gap、067 repair round、065 retry_countをそれぞれ独立変異する。 | identity不存在はAttemptに数えず、gap/完全性不明は総数unknown。067/065から数を推定しない。 |
| `CASE-LABO-L10-068-03` | `FR-LABO-L3-068` / `AC-LABO-L3-068-03` | 遅延した訂正、assignment引継ぎ後にlineage不明、同じIDの重複と新Attemptを区別不能の3ケースを与える。 | 観測部分値を総数にしないでunknownとし、OS記録ownerへ各不足根拠を返す。 |
| `CASE-LABO-L10-069-01` | `FR-LABO-L3-069` / `AC-LABO-L3-069-01` | 複数return reason classのticket cohort、事前に特定されたscope/revision/windowとsource-complete母数、元closure、後日findingとの根拠relation、再発行後の検証receiptを与える。 | reason別return count・該当分母と後続verification成立/不成立/未評価を分離し、元closureを保持。ticket/routing/priorityを変更しない。 |
| `CASE-LABO-L10-069-02` | `FR-LABO-L3-069` / `AC-LABO-L3-069-02` | 時間近接だけ、same-pathだけ、scope/revision混在、母数欠落、source incomplete、観測window未満、未追跡、打切り、未実行、単純count reductionを各々投入する。 | 原因帰属やrate/quality closureを断定しない。母数等欠落はunknown/comparison unavailable、観測途中等は0 defectにしない。 |
| `CASE-LABO-L10-069-03` | `FR-LABO-L3-069` / `AC-LABO-L3-069-03` | 初見reason class、oracle不足finding、再発行から元ticketへのrelation不在を含む未見正常fixtureを与える。 | reason/source identityを保持しunknown classは未分類、因果relationを捏造しない。固定親にないwindow/thresholdを合否規則にしない。 |
| `CASE-LABO-L10-070-01` | `FR-LABO-L3-070` / `AC-LABO-L3-070-01` | 9 selected atomsについて同一scope/revision/windowに属するevent・oracle・time・cost receiptを与える。4 duration、escaped defect、rollback/Recovery、observer overhead、freshness、067/068 co-present fieldsを別々に参照し、重なるwait区間を含むfixtureでも有効な個別duration fieldを与える。 | 各適用fieldはsource receiptへtrace可能。待機・実作業・review待ち・人待ちを分け、parentにaggregate total定義がないため加算して再計算しない。escaped defectは既存owner oracleに限り、same receipt費用は一度、067/068は各grainを保つ。 |
| `CASE-LABO-L10-070-02` | `FR-LABO-L3-070` / `AC-LABO-L3-070-02` | 4 durationを総所要時間へ加算して作る未定義total、重複wait区間の加算、別々にstart/end欠落、重複wait按分、欠測0、事後oracle/window、unconfirmed finding、rollback/overhead二重計上、推計、timestampなし、ageによる許可、roundをAttempt countへ加算、silent renameも変異する。 | 未定義aggregate totalは出力せず、4個別duration fieldは保持する。他の該当fieldは個別にunknown/invalidとして成功scorecardへ混ぜず、既存metric/authorityを変更しない。 |
| `CASE-LABO-L10-070-03` | `FR-LABO-L3-070` / `AC-LABO-L3-070-03` | selection scopeでは使わないsource/atomと、選択scope内のreceiptが一部未提供のcaseを対照する。 | unselectedをrequired dependencyにしない。selected内missingは理由付きunavailable/unknown、部分値をcomplete scorecardと称さない。 |
| `CASE-LABO-L10-071-01` | `FR-LABO-L3-071` / `AC-LABO-L3-071-01` | task class/revision別の評価証拠と資格状態、および独立した称号・permission・assignment role fieldsを与える。 | qualificationは対象class/revisionと評価範囲に結び、他fieldを変更しない。 |
| `CASE-LABO-L10-071-02` | `FR-LABO-L3-071` / `AC-LABO-L3-071-02` | major miss後も有効、model revision更新後の旧qualification/score/title継承、class/revision mismatch、title→permission、qualification→assignment、permission失効と資格失効の同一視を個別変異する。 | 該当qualificationだけを失効またはunknownとし、権限・assignmentを変更しない。 |
| `CASE-LABO-L10-071-03` | `FR-LABO-L3-071` / `AC-LABO-L3-071-03` | 未知task class、新model revision、major-miss根拠なしの独立未見正常caseを与える。 | qualificationをunknown/未評価とし、class名・title・別revisionから補完しない。 |

各fixtureの候補値は`../L3-requirements/nfr-grade.md`と同じ提案であり、L10 case自体は未実行。実装・runtime・実際のWorker起動を行わず、入力recordと期待stateを静的に照合する。
