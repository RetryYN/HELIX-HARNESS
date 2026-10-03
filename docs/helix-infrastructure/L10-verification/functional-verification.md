# HELIX-INFRASTRUCTURE L10 機能総合検証（部分草稿）

**状態：部分草稿・未承認・未実行。** 本書は`../L3-requirements/functional-requirements.md`のStage 1・Stage 2a・Stage 2b・Stage 4 assigned AC候補をシステム境界で照合する設計である。以下は検証fixtureとoracle設計であり、runtime実行結果・green・実装許可を意味しない。採否はL3と一体で通常のPO L3承認へ送る。

旧HELIXのtest-design起点として、旧L10定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`（`LEGACY-ASSET-34DF3B535879CC73FA86`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）の要件挙動をsystem-levelで照合する意味を保持する。旧test-designは旧L10文書そのものとは扱わず、ここでは対のoracle設計からfailure classだけを参照する。旧source/test/runtimeを実行しない。

## HELIXINFRASTRUCTURE-L2-001 — L10 oracle（対応 `INFRA-001-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:32-41` span SHA-256 `3291942a92945d75c2e95d3c2be284d2349e9b89527ff9b7c56b70f785720b77`。対L11 `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` full SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`.
- 対応AC: `INFRA-001-AC-01`, `INFRA-001-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-INFRA-001-C01**（AC `INFRA-001-AC-01`／`INFRA-001-AC-02`に対応）：複数environmentに同role resourceを置き、resource/config/network/credential/data/version/authority scopeも別にする。承認対象CORE設計参照とresource/environment/interface identityをfixtureへ結び、environment identityが混同されないことを確認する。 **期待oracle**：environmentごとの各resource/scope identityとrole/location/version/dependency/lifecycleを分け、各recordをsource/revisionへ結ぶ。
- **L10-INFRA-001-C02**（AC `INFRA-001-AC-01`／`INFRA-001-AC-02`に対応）：stagingだけのresourceをproduction evidenceとして主張する。 **期待oracle**：staging/developmentのrecordはstaging/developmentに留まり、production成立を示す結果は返さない。
- **L10-INFRA-001-C03**（AC `INFRA-001-AC-01`／`INFRA-001-AC-02`に対応）：logical CONNECT linkはあるがphysical pathがない/異なるcase。 **期待oracle**：logical CONNECT edgeとphysical/runtime routeを別recordにし、route各tuple欠落時はunknownとして補完しない。
- **L10-INFRA-001-C04**（AC `INFRA-001-AC-01`／`INFRA-001-AC-02`に対応）：dependency/version欠落、stale observation、source読取不能を与える。 **期待oracle**：欠落version/dependencyまたはstale/read-failed sourceをunknown/未完観測として残し、resource source/設計ownerへ返す。
- **L10-INFRA-001-C05**（AC `INFRA-001-AC-01`／`INFRA-001-AC-02`に対応）：persistent/temporary storage指定にowner/recovery属性欠落を与える。 **期待oracle**：persistent/temporaryを区別し、owner/durability/backup/retention/environment/confidentiality/recoveryの欠落属性はunknownにする。
- **L10-INFRA-001-C06**（AC `INFRA-001-AC-01`／`INFRA-001-AC-02`に対応）：対象Model Runtimeの一属性にsource/revisionを欠き、対象外runtimeの存在を推定する。 **期待oracle**：対象scope内の各Model Runtime属性をsource/revisionへ結び、対象外resourceを推定せず、能力評価/ticket/security stateをINFRASTRUCTURE正本にしない。

### 観測点とoracle

resource identity/role/environment/location/version/dependency/lifecycle；network path tupleとCONNECT logical edgeの区別；storage owner/durability/backup/retention等の記録；source/revision/unknown状態；Model Runtime scopeとsource付き属性；SECURITY authorityとresource stateの分離。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：旧NFR gradeとpillar FR/NFR・HAT設計の測定可能性とnormal/negative/boundary構成を起点にする。runtime topology個別の旧直接oracleはない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## HELIXINFRASTRUCTURE-L2-006 — L10 oracle（対応 `INFRA-006-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:82-91` span SHA-256 `35b634d00f4139bc7fbf91f0c3674f6420fec4f84cc1504f2b489845b31965ef`。対L11 `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` full SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`.
- 対応AC: `INFRA-006-AC-01`, `INFRA-006-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-INFRA-006-C01**（AC `INFRA-006-AC-01`／`INFRA-006-AC-02`に対応）：HELIX-OSと通常control planeが利用不能で、独立minimum recovery resourceと別SECURITY authorityをsource/revision付きで識別するfixtureを置く。bootstrap、health check、service stop、rollback、recoveryの各許可operationを個別に限定pathへ対応付ける。 **期待oracle**：HELIX-OS停止中も列挙された限定操作だけが独立resource path・別authorityで照合可能で、結果にtarget revisionとremaining workが残る。
- **L10-INFRA-006-C02**（AC `INFRA-006-AC-01`／`INFRA-006-AC-02`に対応）：各復旧操作が停止対象control planeへ戻って依存する反例。 **期待oracle**：停止中control planeへの依存辺を検出しrecovery successにせず、安全停止と依存箇所を返す。
- **L10-INFRA-006-C03**（AC `INFRA-006-AC-01`／`INFRA-006-AC-02`に対応）：通常authority、欠落/unknown authority、対象外operationの反例。 **期待oracle**：通常authority・unknown credential/policy・範囲外target/operationを拒否し、operationを実行可能扱いしない。
- **L10-INFRA-006-C04**（AC `INFRA-006-AC-01`／`INFRA-006-AC-02`に対応）：部分復旧で残る操作があるのにcomplete successを主張する反例。 **期待oracle**：部分復旧はpartial/stoppedとし、最終適格revision、未完操作、制約を記録する。
- **L10-INFRA-006-C05**（AC `INFRA-006-AC-01`／`INFRA-006-AC-02`に対応）：完全自動failoverを1.0必須能力とする反例。 **期待oracle**：完全自動failoverの有無を1.0必須条件にせず、failoverを除いても列挙scopeの成否を判定する。

### 観測点とoracle

unavailable nodeを含む依存関係；operationとtarget scope；別SECURITY authority identity/revision；最終適格revisionと残作業；success/unknown/stopped状態。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：旧L3のnormal/negative/boundary観点だけを使う。独立recovery pathの直接oracleは旧scopeから確認できない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## 結果記録上の制約

実装前の静的な設計であり、fixture/期待出力の定義までを行う。実行、CI、旧test、旧runtimeによる合格主張は含まない。検証実装と実測は下流責務であり、ここでL4/L7を定義しない。


## HELIXINFRASTRUCTURE-L2-003 — L10 oracle（対応 `INFRA-003-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 52–61行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `44e32ca4dd7884e3bace925f48b9d76893035f6fcc46dfe958dd249b3b6eea99`、heading「### HELIXINFRASTRUCTURE-L2-003 Compute・Network・Storage・Model資源と容量」。
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 54–63行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `064f0a0391c19e8726b2252b4dcefa786800983a769a556955ed55108aa4e5db`、heading「### HELIXINFRASTRUCTURE-L2-003 Compute・Network・Storage・Model資源と容量」。
- 対応AC: `INFRA-003-AC-01`, `INFRA-003-AC-02`。ケースはowner境界を保つend-to-end evidenceと未完義務を観測する。

### 検証fixtureとcase

- **L10-INFRA-003-C01**（AC `INFRA-003-AC-01`）: 対象environmentのresource snapshotと起動要求の各dimensionに要求量未満でない観測値を与える。対象Model Runtimeがあるfixtureではmodel/version/server/GPU-memory requirement/concurrency/latency/capacity/health/endpointの全属性にsource/revisionと観測範囲を持たせる。期待oracle: demand/available値とruntime属性が同じresource identity・対象revisionに結びつき、不足のない結果材料をOS/INTELLIGENCEへ返す。モデル能力評価をInfrastructureから推定せず、Infrastructure自身がplacement/costを選ばない。
- **L10-INFRA-003-C02**（AC `INFRA-003-AC-01`／`INFRA-003-AC-02`）: CPU/storage/network/model resourceのいずれかでavailable < requestedにする。期待oracle: capacity unavailableと不足dimensionを明示し、queue/delay等の未完状態を保持してdecision ownerへ返す。
- **L10-INFRA-003-C03**（AC `INFRA-003-AC-01`／`INFRA-003-AC-02`）: 同じfixtureの一属性をstale、欠落、計測不能、別environment identityに変える。期待oracle: sufficient/healthyを返さずunknownとsource/revision理由を保持する。
- **L10-INFRA-003-C04**（AC `INFRA-003-AC-01`／`INFRA-003-AC-02`）: 自動増減autoscalingまたは固定utilization/latency目標がなければ失格とするfixture。期待oracle:高度autoscalingと新しいSLAを1.0必須条件にせず、明示されたcapacity/dependencyだけ判定する。

### 観測点とoracle

L2/L11は要求量照合とunknown・不足の扱いを明示する。要求量は各起動要求にある値をsourceとし、汎用GPU/CPU閾値は発明しない。 各caseでは、要求field/state、source/revision、owner、unknown/partial、戻し先を照合し、成立していない状態を成功扱いしない。


## HELIXINFRASTRUCTURE-L2-004 — L10 oracle（対応 `INFRA-004-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 62–71行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `eec7bc7e7e6f7bb710fd2a191195c6fd656b81d78a8c8aff2bb76b26bca7a2a8`、heading「### HELIXINFRASTRUCTURE-L2-004 Runtime ObservabilityとIncident State」。
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 64–73行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `c2a55878949b2659e2000c847df3aa263bbc69ad407b3097e694a1c138631013`、heading「### HELIXINFRASTRUCTURE-L2-004 Runtime ObservabilityとIncident State」。
- 対応AC: `INFRA-004-AC-01`, `INFRA-004-AC-02`。ケースはowner境界を保つend-to-end evidenceと未完義務を観測する。

### 検証fixtureとcase

- **L10-INFRA-004-C01**（AC `INFRA-004-AC-01`）: L2列挙の8 runtime/incident stateをそれぞれsource/revision付きで入力する。期待oracle: 8状態を個別表示し、owner/sourceへtraceできる。
- **L10-INFRA-004-C02**（AC `INFRA-004-AC-01`／`INFRA-004-AC-02`）: telemetry/collector欠測、古いsource revisionを投入する。期待oracle: unknown/unobservedまたはstaleとしてsource ownerへ戻り、healthy/currentへ変換しない。
- **L10-INFRA-004-C03**（AC `INFRA-004-AC-01`／`INFRA-004-AC-02`）: approved incident definitionにないseverity/causeを加えて入力する。期待oracle:承認済みmeaningを参照し、未承認severity/causeを作らない。
- **L10-INFRA-004-C04**（AC `INFRA-004-AC-01`／`INFRA-004-AC-02`）: L2-019 detailed freshness/confidence stateをfixtureから除く。期待oracle:この欠落だけで明示1.0の観測/incident state受入を落とさず、後続条件を先取りしない。

### 観測点とoracle

8状態とunknown/healthy区別、L2-019後続境界は固定L2/L11の列挙から取る。freshness時間やcollector-confidence数値はL2-019 scopeのため1.0へ作らない。 各caseでは、要求field/state、source/revision、owner、unknown/partial、戻し先を照合し、成立していない状態を成功扱いしない。


## HELIXINFRASTRUCTURE-L2-005 — L10 oracle（対応 `INFRA-005-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 72–81行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `4d2e826d42920d60b234a0cd1f23be671829fb052e9235a46fc1a36426acff5f`、heading「### HELIXINFRASTRUCTURE-L2-005 Backup・Restore・Rollback」。
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 74–83行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `7a26bfaffee4f4b526deb40fb24536531672dceefc243f340c78a44c11d5d408`、heading「### HELIXINFRASTRUCTURE-L2-005 Backup・Restore・Rollback」。
- 対応AC: `INFRA-005-AC-01`, `INFRA-005-AC-02`。ケースはowner境界を保つend-to-end evidenceと未完義務を観測する。

### 検証fixtureとcase

- **L10-INFRA-005-C01**（AC `INFRA-005-AC-01`）: backup target/source revision/time/completeness/location/integrity/expiryとprocedureを与える。期待oracle:backup設定とbackup execution stateが別で、対象state ownerとsource revisionへ全fieldをtraceできる。
- **L10-INFRA-005-C02**（AC `INFRA-005-AC-01`／`INFRA-005-AC-02`）: job successfulでもbackup completeness/integrity false、staleまたはtarget外revisionのfixture。期待oracle:backup存在/job成功だけからrestore可能とせず、failure/理由/変更前の適格stateを保持する。
- **L10-INFRA-005-C03**（AC `INFRA-005-AC-01`／`INFRA-005-AC-02`）: compatible restore environmentで実restoreし、integrity、dependency reconnection、startup、verificationを全て照合する正常caseと、各条件を個別に欠落させるcase。期待oracle:実restore resultと検証結果を区別し、条件不足を成功にしない。
- **L10-INFRA-005-C04**（AC `INFRA-005-AC-01`／`INFRA-005-AC-02`）: configuration/artifact/dependency/data compatibility不明またはrollback target/procedure不明のfixture。期待oracle:rollback適格性を保留し、previous eligible state/failure/未完義務をrecovery design owner/OSへ戻す。
- **L10-INFRA-005-C05**（AC `INFRA-005-AC-01`／`INFRA-005-AC-02`）: 親に指定されない汎用RTO/retention-day/RPO閾値を判定に注入する。期待oracle:今回のoperation-scoped criteriaに不要な数値を必須gateにしない。別途数値scopeが要件上必要なら、根拠・比較・測定方法付きL3候補として示す。

### 観測点とoracle

このscopeはoperation-specific restore/recovery integrityを検証し、固定時間や保持期間を一律主張しない。L2/L1で別の時間・期間要件が必要と分かったときは比較根拠・測定方法付きL3 candidateを提示する。 各caseでは、要求field/state、source/revision、owner、unknown/partial、戻し先を照合し、成立していない状態を成功扱いしない。


## HELIXINFRASTRUCTURE-L2-009 — L10 oracle（対応 `INFRA-009-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 114–123行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `b27aee4ffe80a11d8259e5af0ee0e716907c66ba0d65faa0fe9c0216487a7c16`、heading「### HELIXINFRASTRUCTURE-L2-009 OS Runtime Resource StateとWork/Change Stateの接続」。
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 116–125行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `db7eccb04c92d0cc674f4c2b0452b20ede329bd83bc09d46aaed99af2c61c9ea`、heading「### HELIXINFRASTRUCTURE-L2-009 OS Runtime Resource StateとWork/Change Stateの接続」。
- 対応AC: `INFRA-009-AC-01`, `INFRA-009-AC-02`。ケースはowner境界を保つend-to-end evidenceと未完義務を観測する。

### 検証fixtureとcase

- **L10-INFRA-009-C01**（AC `INFRA-009-AC-01`）: stage releaseを使わない通常OS Work/Change ticketとInfrastructure resource/runtime revisionを相互参照する。期待oracle:両者の別owner SSoT・evidence・stop/resumeを保ったversioned connectionが成立する。
- **L10-INFRA-009-C02**（AC `INFRA-009-AC-01`／`INFRA-009-AC-02`）: HELIXOS-L2-014 stage packへ収載するfixture。期待oracle: stage ID、contract/artifact/dependency version、runtime revisionは別identityとして同stage evidenceで関連付く。
- **L10-INFRA-009-C03**（AC `INFRA-009-AC-01`／`INFRA-009-AC-02`）: target/revision mappingを欠落・不一致にし、OS ticketをresource stateの正本として提示する。期待oracle:unknown/hold、OSまたはInfrastructure ownerへ戻し、部分変更と未完operationを維持する。
- **L10-INFRA-009-C04**（AC `INFRA-009-AC-01`／`INFRA-009-AC-02`）: 通常接続にstage pack完成、全7製品または後続L1-023を必須条件として注入する。期待oracle:通常接続を独立に判定し、これらを必須化しない。

### 観測点とoracle

L2/L11は通常接続とpack収載を分け、identityとscopeを明記。相互参照の列挙fieldを検査し、stage completenessを一律前提化しない。 各caseでは、要求field/state、source/revision、owner、unknown/partial、戻し先を照合し、成立していない状態を成功扱いしない。


## HELIXINFRASTRUCTURE-L2-010 — L10 oracle（対応 `INFRA-010-FR-01`）

- 親: PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 126–135行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `550d8ffed768dd86e5604fe82ba94efba3bd1cb51a7ede68654ba524e3dec798`、heading「### HELIXINFRASTRUCTURE-L2-010 SECURITY authority・Worker操作の構成体」。
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 128–137行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `15225795b3c03a72922512501bcf696cf13b66d3861a94d0806fa39dfd292cc7`、heading「### HELIXINFRASTRUCTURE-L2-010 SECURITY authority・Worker操作の構成体」。
- 対応AC: `INFRA-010-AC-01`, `INFRA-010-AC-02`。ケースはowner境界を保つend-to-end evidenceと未完義務を観測する。

### 検証fixtureとcase

- **L10-INFRA-010-C01**（AC `INFRA-010-AC-01`）: 通常OS/Worker operationに有効SECURITY authorityを与え、target/action/revision/scope/expiryとOS assignment/result receipt、実際のbefore/after resource stateを照合する。期待oracle:許可範囲内のeffectだけをactual-state evidence付きで受け入れる。
- **L10-INFRA-010-C02**（AC `INFRA-010-AC-01`／`INFRA-010-AC-02`）: read-only operationからupdate-admissionを省き、同時にtarget scopeのwrite-setを空、許可resource stateをbefore/afterで宣言する。期待oracle:valid ordinary authority下でread-onlyを認め、宣言scopeのwrite=0と前後値を確認する。
- **L10-INFRA-010-C03**（AC `INFRA-010-AC-01`／`INFRA-010-AC-02`）: state updateでupdate-admission denied/unknown/mismatch、authority expired/target/revision/scope mismatch、または適用recovery obligation missingを個別に与える。期待oracle:変更前に停止しSECURITY/OSへ理由付き返却。credential raw valueを保存しない。
- **L10-INFRA-010-C04**（AC `INFRA-010-AC-01`／`INFRA-010-AC-02`）: 独立bootstrap/recovery fixtureではOS/control plane停止、L2-006 pathと別SECURITY authority、OS ticket不在を与える。期待oracle:限定recovery actionのみ可能で、通常ticketの一般免除にはせず、OS復旧後にoperation/resultを同期する。

### 観測点とoracle

L2/L11はauthority field、条件付きadmission、read-only write set、限定recovery例外をそれぞれ明示。実scope/fixture単位で照合し旧risk enum/approval機構は持ち込まない。 各caseでは、要求field/state、source/revision、owner、unknown/partial、戻し先を照合し、成立していない状態を成功扱いしない。


## HELIXINFRASTRUCTURE-L2-002 — L10 oracle（対応 `INFRA-002-FR-01`）

固定親・旧sourceのexact path/全文・span SHAはL3機能本文の「INFRA-002 固定親と旧資産の起点」と「Stage 2bの項目別再導出」を参照する。fixtureは同じ対象environment/resource/revisionに結び、他scopeの観測や設計承認を代用しない。

- **L10-INFRA-002-C01**（AC `INFRA-002-AC-01`）：承認済designとtargetおよび一致actualを別sourceで与える。期待oracleは三つの入力と一致drift結果の相互traceであり、source bytesとauthorityは不変。
- **L10-INFRA-002-C02**（AC `INFRA-002-AC-01,AC-02`）：同じfixtureをresource missing、unexpected、version/config/network/permission/capacity差、runtime replacement、unknown dependencyの9類型に独立変異する。既知の差は種類・値・sourceを返し、unknown dependencyは未確認のまま。異なる二つの差異を持つ未見の組合せでも、片方を隠さず別々に示す。
- **L10-INFRA-002-C03**（AC `INFRA-002-AC-02`）：design/target/observationを各々missing、stale、互換不明にした9入力を与える。該当部分の比較を保留し、source ownerと未確認scopeを返す。unknownを一致、missingをresource不存在の確定にしない。
- **L10-INFRA-002-C04**（AC `INFRA-002-AC-01,AC-02`）：unexpected resourceまたはactual設定をdesign/targetへ昇格しようとする入力を与える。比較前後の正本・authority状態は不変で、更新候補は採択/修正実行にならない。driftを消すため比較入力を上書きした結果は不合格。
- **L10-INFRA-002-C05**（AC `INFRA-002-AC-02`）：有限scopeの一部だけ正しいsourceがあり、残りが別environment/別revision/unknownである未見fixtureを与える。確認済み部分と未確認部分を区別し、元ownerへ返す。OS ticket/SECURITY authority/Worker契約を欠く状態では修正操作を生成しない。

## HELIXINFRASTRUCTURE-L2-007 — L10 oracle（対応 `INFRA-007-FR-01`）

固定親と旧sourceはL3機能本文の該当節でpinする。これは再構築の検証設計であり、今回復旧操作を実施した記録ではない。後続の承認済み設計・既存authorityに従う隔離環境で結果を観測する。

- **L10-INFRA-007-C01**（AC `INFRA-007-AC-01`）：元machineを利用不能とし、外部から取得できる完全なapproved design/config/artifact/dependency/data backup/version/deployment evidenceを与える。隔離環境の再構築、再接続、起動、固定oracle実結果を順に照合し、すべて成立したdeclared scopeだけを再構築済みにする。消失machine/control planeへの依存はなく、操作authorityは別sourceから取得する。
- **L10-INFRA-007-C02**（AC `INFRA-007-AC-01,AC-02`）：作成側に伏せた同scopeの別artifact/dependency版組合せで再構築する。入力と結果版・実制約を照合し、未対応組合せは未評価とする。前fixtureのgreenを別版へ流用しない。
- **L10-INFRA-007-C03**（AC `INFRA-007-AC-02`）：文書/backupだけ存在し実再構築証拠がない入力と、必要情報が消失machine内だけにある入力を別々に与える。どちらもrebuildable/successにせず、欠落情報とsource ownerを返す。
- **L10-INFRA-007-C04**（AC `INFRA-007-AC-02`）：design/config/artifact/dependency/data/version/deployment evidenceを一つずつmissing/stale/異版にする。さらにcredential authority不足、依存再接続失敗、起動失敗、verification failure、verification unknownを個別に与える。起動だけの成功や一部復元を全scope成功にしない。authority不足は該当SECURITY sourceへ返す。
- **L10-INFRA-007-C05**（AC `INFRA-007-AC-02`）：一部復元後に依存またはverificationで止まり、同じscope/版の不足を補って再開する。復元済み部分と残義務、停止原因、owner、再構築結果のprovenanceを維持し、再開前の未完結果を成功にしない。条件が変わる再開は新revisionで再照合する。

| 親 | ACの同一正本参照 | case集合 | 成立範囲 |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-002` | `INFRA-002-AC-01, INFRA-002-AC-02` | `L10-INFRA-002-C01..05` | 指定resource/environmentと固定三入力の比較 |
| `HELIXINFRASTRUCTURE-L2-007` | `INFRA-007-AC-01, INFRA-007-AC-02` | `L10-INFRA-007-C01..05` | 宣言した隔離復旧scope・版・固定oracleの結果 |

## Stage 4 — HELIXINFRASTRUCTURE-L2-008/025 L10 oracle

この検証設計はstatic fixtureの期待結果を定める。deployment変更、resource placement、scaling、operation実行は行わない。固定親のsource/revisionとscopeをL3機能本文の各親節で参照する。

### HELIXINFRASTRUCTURE-L2-008（INFRA-008-FR-01）

- L10-INFRA-008-C01（AC INFRA-008-AC-01）: approved design、別revisionのdeployment target、actual observationを与える。design→target mappingとtarget→actual比較を個別に追える。
- L10-INFRA-008-C02（AC INFRA-008-AC-02）: design approval、target mapping、actual observationを一項目ずつmissing/stale/mismatchにする。該当sideだけunknown/holdとなり、他入力は保持される。
- L10-INFRA-008-C03（AC INFRA-008-AC-03）: driftをactual→designへ書き戻す、またはINFRAがdesignを変更する要求を与える。両方拒否され、design bytes/authority不変でHARNESS-COREへ戻る。
- L10-INFRA-008-C04（AC INFRA-008-AC-04）: L2-001/002 versioned interfaceを正常入力した後、missing/stale/version mismatch/scope mismatchを個別に与える。該当時target確定はholdし、design意味やrevisionを推定しない。

### HELIXINFRASTRUCTURE-L2-025（INFRA-025-FR-01）

- L10-INFRA-025-C01（AC INFRA-025-AC-01）: CPU/memory/GPU/storage/network demand/available、process/container environment、INFRASTRUCTURE-L2-001/003 design/capacity revision、Worker contract、OS assignment/ticket/work ref、SECURITY isolation conditionを結んだ正常fixtureを与える。oracleはSEC policyの適用可能性宣言と実resource/environment上の適用/観測receiptを別々に確認し、policy revision・対象resource・environmentが一致して必要capacityが足り、OS work identityを保つこと。適用可能と宣言しても未適用/異条件/異revisionの反例は不成立。
- L10-INFRA-025-C02（AC INFRA-025-AC-02）: 5資源dimensionを各々requested>availableへ、SEC isolation適用不能、ticket/assignment unknown、stale environmentを独立変異する。不成立理由とownerを返し、利用可能/isolatedを推定しない。
- L10-INFRA-025-C03（AC INFRA-025-AC-03）: resource move前後の元/移動先state、unfinished task/obligation、ticket/request/work refsを与える。identityと未完義務が保持される正常moveと、元state破棄・移動先のみのcapacity条件を元へ誤適用する反例を比較する。
- L10-INFRA-025-C04（AC INFRA-025-AC-04）: Worker=machine、resource=assignment、resource stateからSECURITY policyを推定、自動scaling/placementを行う、この接続からoperation authorityを作る試みを別々に与える。全て拒否し副作用0を確認する。対照fixtureでは既存許可scope内の隔離条件適用/観測を成立させ、実際の適用まで禁止しないことを確認する。

両親の観測tupleはsource/revision、resource/worker identity、owner、unknown/hold、reference continuityである。確認済み部分と未確認部分は分離し、全体successへ丸めない。
