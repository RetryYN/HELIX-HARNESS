# HELIX-LABO L10 機能総合検証（部分草稿）

**状態：部分草稿・未承認・未実行。** 本書は`../L3-requirements/functional-requirements.md`のStage 1、Stage 2aおよびStage 2b基本エンジン9件のassigned AC候補をシステム境界で照合する設計である。以下は検証fixtureとoracle設計であり、runtime実行結果・green・実装許可を意味しない。採否はL3と一体で通常のPO L3承認へ送る。

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

### 観測点とoracle

source identity/revisionごとの観測；20 field identitiesと7 status classifications；source state/authorityとLABO observationの分離；missing/unknown reasonと戻し先；source単位warningと他sourceの独立性。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：旧`AC-FR-BR21-09`（`business-detail.md:137-145`）は壊れたinvocation_logだけをskipし他sourceを保つHARNESS dashboardのfailure例。部分source破損を分離するfailure classのみ類例にし、旧4 source/5 metric/30秒pollを移さない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## HELIXLABO-L2-011 — L10 oracle（対応 `LABO-011-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-labo/L2-requirements/labo-requirements.md:163-166` span SHA-256 `9fcf8b7b648681c7ff08080565a2d708cdd9c5a619e40e8f8bad6196f4c36cb6`。対L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`.
- 対応AC: `LABO-011-AC-01`, `LABO-011-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-LABO-011-C01**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：L2-001 Aggregate identity/outputをsource revision付きで参照してsource-backed observationをepisode candidateにし、元sourceへdereferenceできる。 **期待oracle**：episode candidateから元observation identity/source revisionへ戻れ、revision・fieldが一致する。
- **L10-LABO-011-C02**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：observation identity欠落、source revision欠落/不一致。 **期待oracle**：identity/revision不一致はunresolvedとして示し、元source recordを保持してcorrelation ownerへ返す。
- **L10-LABO-011-C03**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：Aggregate engine成功だけでCorrelate接続も成功と主張する。 **期待oracle**：Aggregateの成功状態とAggregate→Correlate接続状態を分離し、未接続を成功表示しない。
- **L10-LABO-011-C04**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：relation/field不一致またはsource observation欠落。 **期待oracle**：不一致relationは補完せずunresolvedを保持し、元recordと不一致理由をcorrelation側へ返す。
- **L10-LABO-011-C05**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：同時刻/同pathだが因果evidenceのないevent。 **期待oracle**：causal evidenceのないeventはrelated/unknownまでとし、causalに確定しない。
- **L10-LABO-011-C06**（AC `LABO-011-AC-01`／`LABO-011-AC-02`に対応）：correlation後の訂正でも元source eventを保持しcandidate discrepancyを記録する。 **期待oracle**：訂正後も元source eventをimmutable referenceで保ち、変更されたcandidate relationとdiscrepancyを別記録にする。

### 観測点とoracle

input observation identity/source revision；episode candidate identityとrelation evidence；source refの往復一致；unknown/missing stateと戻し先；evidenceなしのcausal assertionがないこと。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：直接対応する旧oracleは確認できない。旧BR-21の部分失敗時にrecordを失わない考えのみ類例で、因果・時間相関規則は継承しない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## 結果記録上の制約

実装前の静的な設計であり、fixture/期待出力の定義までを行う。実行、CI、旧test、旧runtimeによる合格主張は含まない。検証実装と実測は下流責務であり、ここでL4/L7を定義しない。


## HELIXLABO-L2-055 — L10 oracle（対応 `LABO-055-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 150–155行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `f6c97eeef48634ec11fc36f849763a35da358f5ce89490f6c785c9f67b4575c7`、heading「### HELIXLABO-L2-055 — HELIX-Bench 作業水準生成（1.0）」。
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` 191–197行、全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、該当span SHA-256 `c585c90b04dc2f8cf5c979ea4096a2c877029a234ce5f5154aac4267e23fa46c`、heading「### HELIXLABO-L2-055 — Bench分母・欠測・採点根拠」。
- 対応AC: `LABO-055-AC-01`, `LABO-055-AC-02`。正常・失敗・境界を別caseで置き、親のowner/state authorityをまたがせない。

### 検証fixtureとcase

- **L10-LABO-055-C01**（AC `LABO-055-AC-01`）: 許可history snapshotからtask/model class/scopeのeligible denominatorを作り、numeric metricまたはqualitative levelを出す。期待oracle: denominator、算入record、metric/scorer revision、basisと評価scopeから出力を再構成できる。
- **L10-LABO-055-C02**（AC `LABO-055-AC-01`／`LABO-055-AC-02`）: failed/missing/unknown resultを理由なく外し、結果後にdenominatorを縮める。期待oracle:各除外/dispositionと理由を示すか、根拠不十分として水準を保留し、scoreを高く補正しない。
- **L10-LABO-055-C03**（AC `LABO-055-AC-01`／`LABO-055-AC-02`）: 未評価model classを評価済みへ変更、またはfailed quality eventをaverageで相殺する。期待oracle: classをunassessedのまま、failureをfailureで保持し、未根拠levelを出さない。
- **L10-LABO-055-C04**（AC `LABO-055-AC-01`／`LABO-055-AC-02`）: 定性的なlevelを出すsnapshotでもscope、適用条件、判定根拠、未評価部分を記録する。期待oracle:同じsource receiptから判定範囲を再構成でき、配置・指定・割当・authorityを作らない。

### 観測点とoracle

L2-055/L11-055はeligible denominatorと各disposition/reasonおよびscorer revisionを明示し、未評価classも表示する。標本数、重み付け、信頼区間、固定cutoffは現scopeに指定がなく、全task class共通条件にはしない。別の評価判断が特定の必要数を要すると分かった場合はtask/model/scope別に根拠・比較・測定案をL3候補として示す。 各fixtureはparent identity/scope/revisionを記録し、証拠欠落を成功や新しいauthorityへ読み替えない。


## HELIXLABO-L2-056 — L10 oracle（対応 `LABO-056-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 379–390行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `d8d9c30b52c338580f535a913a4b04d67f0d3d59d79eb2645ed33c911b1621c7`、heading「### HELIXLABO-L2-056 — 初回Worker結果のBench観測取込（単体候補、1.0）」。
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` 138–147行、全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、該当span SHA-256 `b2c453c3cdc4aa99ee2df28d3c1a6c96dc2bd4d3d68d41c77ad49dc78243f3ed`、heading「### HELIXLABO-L2-056 初回Worker結果のBench観測取込」。
- 対応AC: `LABO-056-AC-01`, `LABO-056-AC-02`。正常・失敗・境界を別caseで置き、親のowner/state authorityをまたがせない。

### 検証fixtureとcase

- **L10-LABO-056-C01**（AC `LABO-056-AC-01`）: 初回の許可Worker resultと列挙されたassignment/task/Worker/revision/scope/status/verification/classification/source receiptを与える。期待oracle: 全fieldを保ち「観測済み・未評価」を追加する。
- **L10-LABO-056-C02**（AC `LABO-056-AC-01`／`LABO-056-AC-02`）: 初回success一件だけを与え、accepted/evaluated/qualifiedとする。期待oracle: 観測は記録するが、単発successだけを根拠に評価済み・適格化しない。
- **L10-LABO-056-C03**（AC `LABO-056-AC-01`／`LABO-056-AC-02`）: failed/rejected/interrupted/unknown statusesをそれぞれ与える。期待oracle: statusesを個別のまま履歴化しunknownやfailureをsuccessへまとめない。
- **L10-LABO-056-C04**（AC `LABO-056-AC-01`／`LABO-056-AC-02`）: stale/欠落source receipt、task class mismatch、scope/data-use/verification欠落や同一/矛盾記録を与える。期待oracle:無言統合せずsourceを保持しOS/SECURITY/Workerへ戻すか未評価を維持。評価済みは適用oracle・範囲・比較・反例・判定receiptまで揃ったcaseのみ。
- **L10-LABO-056-C05**（AC `LABO-056-AC-01`）: 観測resultとは独立して、対象task/model/scopeを判定できる評価oracleと基準revision、判定・比較条件、結果、failure/反例/unknownの扱い、評価者、時点、判定receiptがすべて揃うfixtureを与える。期待oracle: 該当scopeに限り「評価済み」とその根拠receiptを記録し、単なる観測済み状態と区別する。qualified/eligible/assignmentやWorker authorityは生成せず、他scopeへ一般化しない。

### 観測点とoracle

L2-056/L11-056は入力field群とobserved≠evaluatedを明示する。C01/C03/C04は結果取込と未評価・failure境界を、C05は完全な評価証跡があるscope限定の正常分岐を照合する。単発結果の取込品質に標本数を成功条件として足さず、評価側に標本数が必要ならtask/model/scope限定の根拠・比較・測定付き候補として扱う。どのcaseもqualified/eligible/assignment/authorityを生成せず、各fixtureはparent identity/scope/revisionを記録する。


## HELIXLABO-L2-057 — L10 oracle（対応 `LABO-057-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 391–402行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `d5a62f8588867f80e17e1931f7570c72c89f28eedfd30a5aa9a368fbaba8004d`、heading「### HELIXLABO-L2-057 — 初回実行結果のBench受領接続（接続候補、1.0）」。
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` 148–155行、全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、該当span SHA-256 `ac433c56cece7fae90458ab3e3edf556425b90af8c1917ec60a1c61479bb3b60`、heading「### HELIXLABO-L2-057 初回実行結果のBench受領接続」。
- 対応AC: `LABO-057-AC-01`, `LABO-057-AC-02`。正常・失敗・境界を別caseで置き、親のowner/state authorityをまたがせない。

### 検証fixtureとcase

- **L10-LABO-057-C01**（AC `LABO-057-AC-01`）: OS-L2-018/019/023のresultを同一source identityでaccepted CONNECT contract経由で送信し、LABO-028 accepted receiptを得る。期待oracle:送受revision/scope/status/evidence一致、trace/ackがあり、recordは後続LABO履歴へ渡せるがevaluationは作らない。
- **L10-LABO-057-C02**（AC `LABO-057-AC-01`／`LABO-057-AC-02`）: 採択済CONNECT契約が無いが、親で認める明示的な人手receiptにより同じschema/version/scope/identity/ack義務を示す。期待oracle:同義務が証明された場合だけ受領成立と記録する。人手receipt自体を新しい承認gateにしない。
- **L10-LABO-057-C03**（AC `LABO-057-AC-01`／`LABO-057-AC-02`）: CONNECT contractも人手receiptもない、またはackが欠落するfixture。期待oracle:未受領/unknownとしてOSへ返し、受領成功を主張しない。
- **L10-LABO-057-C04**（AC `LABO-057-AC-01`／`LABO-057-AC-02`）: 同じsource identityを再送し、またはduplicate delivery receiptを二度受ける。期待oracle:same-ID retryは冪等で新規observationを作らず重複を検出する。
- **L10-LABO-057-C05**（AC `LABO-057-AC-01`／`LABO-057-AC-02`）: stale revision/schema/scope mismatchやresult stateの改変、OS-027 absenceを別々に与える。期待oracle:不一致/staleは止めて未完義務を保ち、OS-027不在だけでは失格にしない。

### 観測点とoracle

L2-057/L11-057はack/trace/dedup/stale-stop/same-ID retry/unfinished obligationを明示。field一致と再送冪等性が親条件の直接測定候補。delivery acceptanceが生産する結果評価を増やさない。 各fixtureはparent identity/scope/revisionを記録し、証拠欠落を成功や新しいauthorityへ読み替えない。


## Stage 2b 基本エンジン（未承認・未実行の検証設計）

以下は `functional-requirements.md` の9 FR/18 ACへ対応する初回L10候補。固定親はPO basis `633bf12`、revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、L2 source full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`。共通L11 acceptance source `docs/helix-labo/L11-acceptance/labo-acceptance.md` は同一fixed revision、full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、common spans L43–47 `d4891130ef25adf720c5e68b584cb17bd12066ea29fc7c4b50585a1cc49d5a8b` / L109–116 `7e3bcd9acc0c1b35d2d6d5d56ffb5081825a4cae12386612a9a986a645cdc41d`。表中のcaseは設計であり実装済みtest/実行結果ではない。

| 親ID | registration / decision | L2 raw span | FR / AC | L10 cases |
|---|---|---|---|---|
| `HELIXLABO-L2-002` | `MPR-RC-HELIXLABO-L2-002-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L49 | L77–84 `d4ecde864ac4129741f32ac65d0075d1d0704cc7166b86491bbae6ef8865bf28` | `LABO-002-FR-01`, `LABO-002-AC-01/02` | `L10-LABO-002-C01..C04` |
| `HELIXLABO-L2-003` | `MPR-RC-HELIXLABO-L2-003-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L50 | L85–92 `5a5472b632726e3b6069e251024c59dbb4c076889bf48771d4cd306907922901` | `LABO-003-FR-01`, `LABO-003-AC-01/02` | `L10-LABO-003-C01..C04` |
| `HELIXLABO-L2-004` | `MPR-RC-HELIXLABO-L2-004-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L51 | L93–100 `6f1751ca2ca2dddd1e1065a68421d63e3c18ce656786c9c1fe318b1a4e458889` | `LABO-004-FR-01`, `LABO-004-AC-01/02` | `L10-LABO-004-C01..C04` |
| `HELIXLABO-L2-005` | `MPR-RC-HELIXLABO-L2-005-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L52 | L101–108 `3b7f37f57a9db5df451275962aa0a90f951cf61e23496828cb9a078f52bc36ee` | `LABO-005-FR-01`, `LABO-005-AC-01/02` | `L10-LABO-005-C01..C04` |
| `HELIXLABO-L2-006` | `MPR-RC-HELIXLABO-L2-006-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L53 | L109–116 `2d5aa6810c6a2a21c532e7f2a96ec39fdef9b8e6040b476b23187f3be0bd02ce` | `LABO-006-FR-01`, `LABO-006-AC-01/02` | `L10-LABO-006-C01..C04` |
| `HELIXLABO-L2-007` | `MPR-RC-HELIXLABO-L2-007-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L54 | L117–124 `89aa2011a64af3475f1bf23f6e52d2622535c96b374bebbc6926c5bab280c84e` | `LABO-007-FR-01`, `LABO-007-AC-01/02` | `L10-LABO-007-C01..C04` |
| `HELIXLABO-L2-008` | `MPR-RC-HELIXLABO-L2-008-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L55 | L125–132 `08da4c2fb64ede944ace1e21fe8f165a161fe981e902458a8263602040d581ce` | `LABO-008-FR-01`, `LABO-008-AC-01/02` | `L10-LABO-008-C01..C04` |
| `HELIXLABO-L2-009` | `MPR-RC-HELIXLABO-L2-009-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L56 | L133–140 `de30f29aef8d0d1af93e32843fadd823afc398352d9017fe24dfc84a2f7bd025` | `LABO-009-FR-01`, `LABO-009-AC-01/02` | `L10-LABO-009-C01..C04` |
| `HELIXLABO-L2-010` | `MPR-RC-HELIXLABO-L2-010-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L57 | L141–149 `6ffc430c2762f509b39c2baab152115de82834be0cf168575470ed3832f9294e` | `LABO-010-FR-01`, `LABO-010-AC-01/02` | `L10-LABO-010-C01..C04` |

### L10-LABO-002-C01 — `親の正常系列`

- 対応: `LABO-002-AC-01`; 親: `HELIXLABO-L2-002`。
- 入力fixture: L2-001から出た複数の許可observationを入力。 requirement revision→ticket→Worker→implementation→atomic CI→integration/proof CI→release/deployment/runtime→incident/recoveryのうち存在するeventと明示relationを含め、1つは未発生eventとして設定する。
- 期待oracle: episode graphは実在eventとrelation証拠を結び、未発生/不足eventを作らず、元source/revisionへの参照を往復保持。

### L10-LABO-002-C02 — `因果誤判定の個別・組合せ`

- 対応: `LABO-002-AC-02`; 親: `HELIXLABO-L2-002`。
- 入力fixture: (a)時間だけ近接の無関係event、(b)同pathだが別ticket/revision、(c)source identity欠落、(d)上記を同時投入。
- 期待oracle: (a)(b)は因果edgeを作らずrelation候補/孤立を保持。(c)はunknownとして当該event ownerへ戻す。(d)でも他の有効edgeを破棄せず誤因果0、未完義務を列挙。

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
- 期待oracle: 8分類が個別fieldとなり、それぞれ根拠とsource spanへ戻れる。矛盾する点はunknown保持。

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

### L10-LABO-004-C03 — `意味改変の否定`

- 対応: `LABO-004-AC-02`; 親: `HELIXLABO-L2-004`。
- 入力fixture: 差分候補が元の目的を反転、制約を除去、costを0仮定するmutation。
- 期待oracle: 候補は不成立として保持差分と根拠欠落を明示。候補を決定/実装しない。

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
- 入力fixture: 同一ticket/experiment/target version、OS assignment、Worker実行結果、baseline/current/candidate/hybrid条件、oracle、cost証跡を与える。
- 期待oracle: 成功/失敗、FP/FN、rework、time、CI/Worker時間、token/API、人介入、context、complexity、recovery、release lead time、ops burden、reuseを観測証拠に結び、結果と限界を出す。

### L10-LABO-006-C02 — `実験結果の個別失敗/組合せ`

- 対応: `LABO-006-AC-02`; 親: `HELIXLABO-L2-006`。
- 入力fixture: (a)OS assignment欠落、(b)oracle欠落、(c)baseline revision差、(d)interrupted run、(e)cost欠測、複数の組合せ。
- 期待oracle: 実験実行済みを捏造せず、比較不能/中断/unknownを明記。cost欠測を0扱いしない。個別理由を列挙し有効な別scope結果は分離。

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
- 入力fixture: 同一条件で反復されたepisodes、deterministic oracle、限定side effect、retry/rollback/idempotence evidenceを与える。
- 期待oracle: 各候補条件を独立判定しoperation継続とsystem化案を両方示す。自動昇格しない。

### L10-LABO-007-C02 — `条件欠落/不安定`

- 対応: `LABO-007-AC-02`; 親: `HELIXLABO-L2-007`。
- 入力fixture: (a)条件差あり、(b)oracle不明、(c)side effect不明、(d)rollback不可、(e)複合欠落。
- 期待oracle: systemizationを根拠不足とし、operation継続候補と具体的missing conditionを返す。

### L10-LABO-007-C03 — `単純頻度の否定`

- 対応: `LABO-007-AC-02`; 親: `HELIXLABO-L2-007`。
- 入力fixture: 件数だけ多いが異条件またはcounterexampleあり。
- 期待oracle: 頻度だけで再現可能と判定しない。反例・条件差を保持し、自動昇格0。

### L10-LABO-007-C04 — `held-out正常`

- 対応: `LABO-007-AC-01`; 親: `HELIXLABO-L2-007`。
- 入力fixture: 未見のrule candidateだが全親条件と証拠を持つ。
- 期待oracle: 同一oracleで分類し、特定旧candidate名や登録済みruleに依存しない。

### L10-LABO-008-C01 — `system運用正常`

- 対応: `LABO-008-AC-01`; 親: `HELIXLABO-L2-008`。
- 入力fixture: current system rule/version、通常結果、例外、誤検知、回避、変更cost、operation ownerを与える。
- 期待oracle: system継続/修正またはoperation再評価候補を出し、根拠・戻し条件・未完義務とownerを示す。切替はしない。

### L10-LABO-008-C02 — `return evidence欠落`

- 対応: `LABO-008-AC-02`; 親: `HELIXLABO-L2-008`。
- 入力fixture: (a)rule revision不明、(b)回避cost欠落、(c)現owner不明、(d)併発。
- 期待oracle: unknownを明記し、current ownerへ戻す。欠けた要素を補完してsystem維持/切替を確定しない。

### L10-LABO-008-C03 — `operation再評価境界`

- 対応: `LABO-008-AC-02`; 親: `HELIXLABO-L2-008`。
- 入力fixture: 既知system exceptionが繰返す一方、改善が未評価。
- 期待oracle: 再評価candidateを作成してもsystem execution stateは変更なし。未完義務を残す。

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
