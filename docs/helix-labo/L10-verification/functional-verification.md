# HELIX-LABO L10 機能総合検証（部分草稿）

**状態：部分草稿・未承認・未実行。** 本書は`../L3-requirements/functional-requirements.md`のStage 1およびStage 2a assigned AC候補をシステム境界で照合する設計である。以下は検証fixtureとoracle設計であり、runtime実行結果・green・実装許可を意味しない。採否はL3と一体で通常のPO L3承認へ送る。

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

### 観測点とoracle

L2-056/L11-056は入力field群とobserved≠evaluatedを明示。単発結果の取込品質をsource stateとの正確なprovenanceで測定し、標本数自体を結果取込の成功条件にしない。評価側に必要標本数があればtask/model/scope限定の根拠・比較・測定候補を示せる。 各fixtureはparent identity/scope/revisionを記録し、証拠欠落を成功や新しいauthorityへ読み替えない。


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
