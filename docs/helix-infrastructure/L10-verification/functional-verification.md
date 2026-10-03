# HELIX-INFRASTRUCTURE L10 機能総合検証（部分草稿）

**状態：部分草稿・未承認・未実行。** 本書は`../L3-requirements/functional-requirements.md`のAC候補をシステム境界で照合する設計である。以下は検証fixtureとoracle設計であり、runtime実行結果・green・実装許可を意味しない。採否はL3と一体で通常のPO L3承認へ送る。

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
