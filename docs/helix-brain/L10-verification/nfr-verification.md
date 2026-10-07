# HELIX-BRAIN L10 非機能検証 — Stage 1（007/008/028）

**状態：部分草稿・未承認・未実行。** 対測定設計は`../L3-requirements/nfr-grade.md`の技術候補を検証する。全ケースで対象revision・fixture・入力・観測結果を記録し、閾値適用前にcandidate statusを保持する。固定L2/L11範囲を越えるSLA、承認gate、ownerを作らない。

| 親L2 | 測定項目・入力/変異 | L10判定材料（AC/L10 trace） | 限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` | required provenance group coverage: 7 provenance group（source identity/revision、provenance、evidence、adopted reason、evaluated scope、counterexample、limitation）とLABO評価対象revisionの計8 groupを満たすnormal fixtureを使う。 | 8/8 group trace、missing reason、candidate維持、accepted/mature誤遷移0候補を観測。source identity/revisionは同一group内の別atomic fieldとして個別にmissing/stale/dangling/mismatchへ変異し、LABO対象revisionの欠落と不一致はC10/C05で別々に照合する。`BRAIN-007-AC-01/02`; C01–C03,C05,C06,C09,C10。 | group分母8とsource identity/revisionを分けたatomic mutant集合を混同しない。実績数/verifier人数は測らず、新しいthresholdにしない。 |
| `HELIXBRAIN-L2-007` | false promotion: AI-generated-only、single success-only、counterexample/limitation欠落、LABO target revision missing/mismatchと、LABO評価／OS登録／OS振分け／独立検証のみを採否へ代用する4変異を個別投入。 | accepted/mature遷移なし。不足field/sourceとLABO評価対象revisionの欠落・不一致を区別しowner stateを観測。`BRAIN-007-AC-02`; C02–C05,C07,C10。 | 未実行の設計候補。 |
| `HELIXBRAIN-L2-008` | state distinction/pin stability: 5 named stateを個別入力し、Product CoreがRを参照後にR superseded/R2追加する。R参照にR2を返す変異と同revision Rの内容を書き換える変異を個別投入する。 | stateを別値として保持し既存Core R参照とOS usageを維持、owner状態を分離。黙った置換の各変異を拒否／検出しBRAINへ戻す。`BRAIN-008-AC-01/02`; C01,C07,C08,C09。 | state遷移順やretentionは追加しない。 |
| `HELIXBRAIN-L2-008` | unknown handling: identity/revision/state unknown/conflict、actual version欠落、version_targetのactual代用を個別投入。 | currentへの暗黙解決なし、candidate use停止、BRAIN知識stateとOS project-useの相互writebackなし。`BRAIN-008-AC-02`; C02,C03。 | state名・version grammarを新設しない。 |
| `HELIXBRAIN-L2-028` | range/identity matrix: BRAIN-L2-028が指定するdescriptorと採択HARNESS L2-010/011のpack/call境界依存を分け、合成fixtureが宣言するrangeの内側・外側・欠落・解釈未確定を試す（fixture値は試験入力のみ）、descriptor/knowledge fieldを独立変異。 | 宣言range内かつ全field整合時だけapplicable。outside/unknown/mismatchは停止し、knowledge側はBRAIN（L2-008）、descriptor/range側はHARNESS ownerへ戻す。`BRAIN-028-AC-01/02`; C01–C04,C07。 | 固定L2にrange syntax/comparatorはないため製品規則として採択しない。range field自体がfixtureに欠ける場合、その枝は未評価/unknown。 |
| `HELIXBRAIN-L2-028` | boundary ownership: version_target代用とcommon exchange/update/rollback/unfinished-obligation義務のBRAIN移管を個別要求。 | 実版代用を拒否し、common lifecycleはHARNESS契約へ返しBRAINで再定義しない。`BRAIN-028-AC-02`; C05–C06。 | BRAIN専用NFRではなく親境界の測定候補。 |
| `HELIXBRAIN-L2-028` | version軸の取り違え：各軸に異なる合成値を与え、artifact←knowledge revision、knowledge version←contract、descriptor内version入替えとdescriptor／knowledge identityの双方向代入を独立投入。 | 各変異を分母に記録し誤受理0候補、該当field・期待軸・BRAIN（L2-008）／HARNESS owner戻し先を観測。`BRAIN-028-AC-02`; C08。 | 欠測・未評価を分母から除かず、実測合格としない。version構文は決めない。 |

測定値は候補であり未実施。結果をPO判断、L3承認、実装・実行許可へ読み替えない。


## Stage 2b — INFRA候補NFRの対測定

候補境界は固定L2/L11で明示された各対象集合のcoverage 100%・誤受理0件。分母0は割合を算出せず「算出なし」と記録する。missing/unknown/stale/conflict/fixture未実行は分母から除外せず、別stateで保持する。これは製品SLAでも実測結果でもない。

| 親 | 測定候補・入力変異 | L10 case / 観測 | 限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-INFRA-001` | 20初期subdomain + 4変更操作。各domain/operationを個別欠落し、Runtime inventory固定も試す。 | `L10-BRAIN-INFRA-001-C01–C05`。coverage 100%候補/誤受理0候補。missing/unknown/stale/wrong-targetを分け、Domain固定negativeを測る。 | fixture上の構造被覆。実資源数や性能を主張しない。 |
| `HELIXBRAIN-L2-INFRA-002` | Domain 2、Pattern 2、Part 8、固定例の全relation endpoint。nodeとendpointを別々に欠落。 | `L10-BRAIN-INFRA-002-C01–C05`。各階層/endpointとrelation typeを個別に照合。 | provider設定や実構成網羅を意味しない。 |
| `HELIXBRAIN-L2-INFRA-003` | L2 20 atomic fieldとL11 18 groupの別分母。trade-off/evidenceは別field。親にないfield別evidence/scope義務を追加していないことをFR/C01/C04で文書照合（NFR fixture mutationには数えない）。 | `L10-BRAIN-INFRA-003-C01–C05`。各分母のcoverage候補100%、missing/unknown/stale/対象違いを別記録。 | 2分母を統合した加重scoreを作らない。 |
| `HELIXBRAIN-L2-INFRA-004` | 10 characteristic、Pattern、required Design Input/relationを個別欠落・unknown化。NIO-L3-01/02はtyped input/design obligation類例。 | `L10-BRAIN-INFRA-004-C01–C05`。値を創作せず、HARNESS/Product Core戻し先を照合。 | 製品閾値、NFR ownerを新設しない。 |
| `HELIXBRAIN-L2-INFRA-005` | 13 failure×6観点=78 cellと、normal configurationへの同一identity/hierarchy/relationを測定。未見failureは別normal fixture。 | `L10-BRAIN-INFRA-005-C01–C05`。各cellと正常構成relationの欠落を別記録。 | 設計候補を実incident証拠にしない。 |
| `HELIXBRAIN-L2-INFRA-006` | 10 recovery候補と予防/復旧区分を独立に欠落。010 relation unknownのまま006を照合。 | `L10-BRAIN-INFRA-006-C01–C06`。C06のunknown relation通常fixtureと010完成gate誤変異を対で測る。 | INFRA-010 completionをgateにしない。 |
| `HELIXBRAIN-L2-INFRA-007` | 6方式×6軸=36 cell。release/deployment actionとstage/state進行を別々にnegative投入。 | `L10-BRAIN-INFRA-007-C01–C06`。36 cellとC06 progress negativeを別集計。 | 実deployの結果を主張しない。 |
| `HELIXBRAIN-L2-INFRA-008` | 8候補×6軸=48 cell。根拠のない負荷閾値の創作と特定規模値の創作を別々に測定し、unknown workload normalも個別に保持する。 | `L10-BRAIN-INFRA-008-C01–C05`。cell欠落と未知workload扱いを観測し、unknownを適用可へ変換しない。 | 実行能力、workload閾値、SLOを追加しない。 |
| `HELIXBRAIN-L2-INFRA-009` | 11 design observation pointsとPattern/failure relations。raw telemetry知識化、missing/stale/collector停止をnegative投入。 | `L10-BRAIN-INFRA-009-C01–C05`。設計観測点の被覆とfalse healthyを別に記録する。 | 独立secret/PII契約を追加しない。 |
| `HELIXBRAIN-L2-INFRA-010` | backup-only、restore verification、required recovery conditionsを独立変異。 | `L10-BRAIN-INFRA-010-C01–C05`。3条件すべて揃う場合だけRecoverability Evidence Candidateを記録。C03では根拠のない一律RTO/RPO創作を別fixtureで測る。 | Candidateは実recoverability/RTO/RPOの確定ではない。 |
| `HELIXBRAIN-L2-INFRA-011` | 7 group/8 atomic characteristicを別分母。価格provenanceは価格を含むfixtureだけでprovider/time/sourceを個別変異。 | `L10-BRAIN-INFRA-011-C01–C05`。恒久価格定数化と構造比較からの価格生成をnegativeにする。 | scopeは必須条件でなく、価格なし構造正常fixtureを保つ。 |
| `HELIXBRAIN-L2-INFRA-012` | 1 abstract identity/4 enumerated implementation identityとrelations。provider fact evidence/version欠落を個別変異し、列挙外implementationの未見normalとS3→GCS swapの正常fixtureを分ける。 | `L10-BRAIN-INFRA-012-C01–C06`。abstract identity/relation意味の維持と未評価compatibility unknownを観測。 | provider approval gateなし。 |
| `HELIXBRAIN-L2-INFRA-013` | 6 resource class/capability relation。providerとcompute classを別個に固定するnegative、unseen edge device normal。 | `L10-BRAIN-INFRA-013-C01–C05`。未見classをabstractとして保持する。 | actual resource state/credential/actionを推定しない。 |
| `HELIXBRAIN-L2-INFRA-014` | 固定2 topology例と9 relation type/type/endpoints/meaning。 | `L10-BRAIN-INFRA-014-C01–C05`。固定例とunlisted topologyを照合し、undeclared edgeはunknownで保持。 | 実topology完全性を主張しない。 |
| `HELIXBRAIN-L2-INFRA-015` | 固定Domain pair relationとunlisted pair。direction/evidence/uncertaintyを個別変異。 | `L10-BRAIN-INFRA-015-C01–C05`。may-affect＋unknownを許容し、根拠ないcauses強化だけを誤受理扱い。 | 全pair適用率やevidence gateなし。 |
| `HELIXBRAIN-L2-INFRA-016` | 11 anti-pattern×4要素=44 cell。L11 signalはmanifestation/detection clue両方へ対応。 | `L10-BRAIN-INFRA-016-C01–C05`。44 cell、signal対応、条件外universal banを別観測。 | 固定親にないsecret/PII条件を追加しない。 |
| `HELIXBRAIN-L2-INFRA-017` | 6 state、BRAIN version/project versionの別軸と固定4入力を個別欠落・不一致。success、複数条件評価、failureは別fixture。 | `L10-BRAIN-INFRA-017-C01–C08`。C06は一回success保持と誤昇格、C08はfailure保持と隠蔽/成功変換を対で測る。 | scopeを新規必須にせず、state閾値を作らない。 |
値は起草候補で未承認・未実測であり、結果をL3承認、実装許可、運用実績へ読み替えない。

## Stage 2b追補 — 採択済み001〜006の部分草稿

001–006の測定・判定構造の形式比較元は旧`LEGACY-ASSET-DB669724249A14A665F0`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34,58–74`、全文SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）。測定構造だけを再導出し、旧IPA値・pass条件・runtimeは置換する。

**状態：候補のみ（独立review／L3承認前）。** Stage 1 prefixはPO承認済みのbytesを保持し、既存INFRA Stage2b 17親suffixは最新main `4729c34ec29c2c72f345993958bbc94e1ed6f131`のbytesをそのまま保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

### L10-BRAIN-001-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-001-NFR-01`、`BRAIN-001-AC-01`〜`BRAIN-001-AC-04`。固定10 Domain全てと4変更操作を別母集団で用い、追加候補6領域を必須化せず、fixture選択で固定列挙を狭めない。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-002-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-002-NFR-01`、`BRAIN-002-AC-01`〜`BRAIN-002-AC-04`。固定4階層と各identity/parent/relation/responsibilityを全て母集団に残し、fixture選択で狭めない。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-003-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-003-NFR-01`、`BRAIN-003-AC-01`〜`BRAIN-003-AC-04`。親のdescriptor 12要素を全て必須母集団に含め、fixture選択で狭めない。required inputおよび充足/不充足/unknownは別状態軸で記録する。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-004-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-004-NFR-01`、`BRAIN-004-AC-01`〜`BRAIN-004-AC-04`。固定3例×6比較軸を全て母集団に残し、fixture選択で例/軸を狭めない。選択権と軸の欠落は別に照合する。機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-005-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-005-NFR-01`、`BRAIN-005-AC-01`〜`BRAIN-005-AC-04`。L2-005/L11:33の7 relation種と、L2:135の二つのrelation chainを全て必須母集団に含め、機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

### L10-BRAIN-006-NFR-01 — 列挙意味条件と誤確定の観測

対応 `BRAIN-006-NFR-01`、`BRAIN-006-AC-01`〜`BRAIN-006-AC-04`。固定L2-006/L11:34の15知識例を全て必須母集団に含め、機能CASE表の正常・項目別変異・未見・owner戻しfixtureを使用する。実出力の値がfixture source/期待oracleと一致するNchecked、選択された必須項目Nrequired、missing/unknown/意味不整合を誤成功へ変換したNfalse、各不足理由/戻し先を照合する。件数だけ/名称だけの案Aが意味変異を見逃すかを案Bと比較する。未選択sourceを分母に加えず、入力必須欠落を未適用扱いにしない。Nplannedのvalid/failed/missing/censored分類、単位、分母0、valid0、未測定をL3候補どおりに観測する。実行済みの測定値はまだなく、候補の成立を断定しない。

## Stage 2b追補 — 採択済み009/010/011/012/029候補の測定

**状態：未承認・未実行。** 下記測定はL3技術候補と対応するfunctional CASE fixtureを照合する。旧HARNESS IPA/CI/runtime値は証拠にしない。結果をPO判断、L3承認または実行許可へ読み替えない。

| 親L2／candidate | 入力母集団とoracle | 判定と限界 |
|---|---|---|
| `HELIXBRAIN-L2-009` / `BRAIN-009-NFR-01` | C01–C13で選択された各Unit/relationと必要source/scope/versionを分母候補にする。端点、relation根拠、owner別状態の一致数、unknown/欠落を誤昇格した数を別記する。 | relation名のみと全trace照合を比較。L2-025未完と成立の正常遷移を対で計る。未選択Unit/sourceは未観測。率の分母0では率なし。 |
| `HELIXBRAIN-L2-010` / `BRAIN-010-NFR-01` | C01–C11の選択failure条件についてcondition/impact/counterexample/evidence/source/scopeを別項目として照合し、普遍禁止/適用への誤一般化を個別記録。 | failure名の一致だけと条件付き意味の照合を比較し、success-only保持とRegression固有条件欠落を別変異で照合。sourceにないfailure不存在を推定しない。 |
| `HELIXBRAIN-L2-011` / `BRAIN-011-NFR-01` | C01–C12の選択sourceに含まれるproduct-specific要素と一般化根拠/provenanceを分母候補とし、各変異の漏れ・source喪失・根拠超過（C11）・候補事実化（C12）を独立計数。 | 語数だけとsource-linked分離を比較。共有範囲の人判断戻しと過度一般化を個別に照合する。未選択sourceは分母外かつ未観測。 |
| `HELIXBRAIN-L2-012` / `BRAIN-012-NFR-01` | C01–C13のselected queryで列挙output tuple各要素、候補状態、未決decisionを別々に照合。field欠落・誤authority生成を独立記録。 | 返却候補数だけとtuple/decision状態照合を比較し、request input欠落とresponse field欠落、sourceにないrelation/alternativeの正常不在を分ける。候補受領は採用oracleではない。 |
| `HELIXBRAIN-L2-029` / `BRAIN-029-NFR-01` | C01–C53の選択構成を対象とし、identity/source/version、applicability、required input、constraint、trade-off、negative/failure、5 relation type/端点/意味の必要項目を列挙し、各項目のmissing/unknown/stale/mismatchと誤適用を別記する。 | relation label数だけと条件付きtuple照合を比較。常時必須・操作時・選択source条件を分け、未選択source/参照資料は未観測。L2-030のreceipt義務は測定対象外。 |

各測定の計画母集団を`Nplanned`、契約scope内の必須要素数を`Nrequired`、期待oracleと照合できた数を`Nchecked`、unknown/欠落を成功へ誤変換した数を`Nfalse`として記録する。処理失敗、入力欠落、観測欠落、打切りは重ねず理由付きで分ける。正しいoracle不合格も判定可能な観測に含め、処理失敗へ隠さない。`Nrequired=0`では率を算出せず、欠けた必須条件を対象外にしない。未実施は未測定。時間測定には根拠ある開始/終了条件と単位を要し、valid時間標本0なら分位値なしとする。固定SLA、最低標本数、追加承認gateは設けない。

## Stage 4 — 根拠付きNFR候補の対測定（未実行）

以下は`nfr-grade.md`の明示NFR IDに対応する候補を、実行ではなく文書上の独立fixtureで照合する設計である。測定結果・承認・runtime合格を意味しない。必須field/relation母集団は固定親の列挙に限る。未選択sourceは未観測で分母外、missing/unknown/stale/conflictを成功や未適用へ変換しない。

| NFR候補 | functional CASEと測定分母 | 候補判定・記録 |
|---|---|---|
| `BRAIN-018-NFR-01` | `L10-BRAIN-018-C01`, `L10-BRAIN-018-C02`, `L10-BRAIN-018-C03`, `L10-BRAIN-018-C04`, `L10-BRAIN-018-C05`, `L10-BRAIN-018-C06`, `L10-BRAIN-018-C07`, `L10-BRAIN-018-C08`, `L10-BRAIN-018-C09`, `L10-BRAIN-018-C10`, `L10-BRAIN-018-C11`, `L10-BRAIN-018-C12`, `L10-BRAIN-018-C13`, `L10-BRAIN-018-C14`, `L10-BRAIN-018-C15`, `L10-BRAIN-018-R-product-relation-missing`, `L10-BRAIN-018-R-contract-identity-missing`, `L10-BRAIN-018-R-contract-version-unknown`, `L10-BRAIN-018-C16` | required field coverage候補100%、raw original受領・誤昇格0。relation欠落、unknown/隔離、Product Core戻しを個別記録。 |
| `BRAIN-019-NFR-01` | `L10-BRAIN-019-C01`, `L10-BRAIN-019-C02`, `L10-BRAIN-019-C03`, `L10-BRAIN-019-C04`, `L10-BRAIN-019-C05`, `L10-BRAIN-019-C06`, `L10-BRAIN-019-C07`, `L10-BRAIN-019-C08`, `L10-BRAIN-019-C09`, `L10-BRAIN-019-C10`, `L10-BRAIN-019-C11`, `L10-BRAIN-019-C12`, `L10-BRAIN-019-C13`, `L10-BRAIN-019-C14`, `L10-BRAIN-019-C15`, `L10-BRAIN-019-R-query-constraint`, `L10-BRAIN-019-R-query-identity`, `L10-BRAIN-019-R-query-version`, `L10-BRAIN-019-R-response-required`, `L10-BRAIN-019-R-response-constraint`, `L10-BRAIN-019-R-response-applicability`, `L10-BRAIN-019-R-multiple-candidates`, `L10-BRAIN-019-R-contract-identity-missing`, `L10-BRAIN-019-R-contract-version-unknown`, `L10-BRAIN-019-C16` | candidate field coverage候補100%、unsupported suggestion/採用昇格0。unknown fieldとquery不足を別分類し、source-declared複数候補を個別照合。 |
| `BRAIN-020-NFR-01` | `L10-BRAIN-020-C01`, `L10-BRAIN-020-C02`, `L10-BRAIN-020-C03`, `L10-BRAIN-020-C04`, `L10-BRAIN-020-C05`, `L10-BRAIN-020-C06`, `L10-BRAIN-020-C07`, `L10-BRAIN-020-C08`, `L10-BRAIN-020-C09`, `L10-BRAIN-020-C10`, `L10-BRAIN-020-C11`, `L10-BRAIN-020-C12`, `L10-BRAIN-020-C13`, `L10-BRAIN-020-C14`, `L10-BRAIN-020-R-source-identity-missing`, `L10-BRAIN-020-R-version-missing`, `L10-BRAIN-020-R-evaluation-identity-missing`, `L10-BRAIN-020-R-evaluation-promotion`, `L10-BRAIN-020-R-independent-verification`, `L10-BRAIN-020-R-infra-state-normal`, `L10-BRAIN-020-R-infra-state-missing`, `L10-BRAIN-020-R-infra-evidence-missing`, `L10-BRAIN-020-R-infra-revision`, `L10-BRAIN-020-R-infra-unselected`, `L10-BRAIN-020-R-007008-provenance-missing`, `L10-BRAIN-020-R-identity-missing`, `L10-BRAIN-020-R-state-missing`, `L10-BRAIN-020-R-os-registration-pending`, `L10-BRAIN-020-R-contract-identity-missing`, `L10-BRAIN-020-R-contract-version-unknown`, `L10-BRAIN-020-C15` | 列挙field coverage候補100%、不一致/部分評価からの誤昇格0。各fixtureの固定親に基づく不足owner（LABO/OS）と状態分離を確認する。 |
| `BRAIN-021-NFR-01` | `L10-BRAIN-021-C01`, `L10-BRAIN-021-C02`, `L10-BRAIN-021-C03`, `L10-BRAIN-021-C04`, `L10-BRAIN-021-C05`, `L10-BRAIN-021-C06`, `L10-BRAIN-021-C07`, `L10-BRAIN-021-C08`, `L10-BRAIN-021-C09`, `L10-BRAIN-021-C10`, `L10-BRAIN-021-C11`, `L10-BRAIN-021-C12`, `L10-BRAIN-021-C13`, `L10-BRAIN-021-C14`, `L10-BRAIN-021-C15`, `L10-BRAIN-021-R-version-mismatch`, `L10-BRAIN-021-R-adoption`, `L10-BRAIN-021-R-contract-identity-missing`, `L10-BRAIN-021-R-contract-version-unknown`, `L10-BRAIN-021-C16`, `L10-BRAIN-021-C18`, `L10-BRAIN-021-C17`, `L10-BRAIN-021-R-promotion` | 必須field coverage候補100%、runtime conclusion/BRAIN knowledge mutation 0。query不足はINTELLIGENCE、knowledge source/version不整合はBRAIN L1または当該知識ownerへ返す。 |
| `BRAIN-022-NFR-01` | `L10-BRAIN-022-C01`, `L10-BRAIN-022-C02`, `L10-BRAIN-022-C03`, `L10-BRAIN-022-C04`, `L10-BRAIN-022-C05`, `L10-BRAIN-022-C06`, `L10-BRAIN-022-C07`, `L10-BRAIN-022-C08`, `L10-BRAIN-022-C09`, `L10-BRAIN-022-C10`, `L10-BRAIN-022-C11`, `L10-BRAIN-022-C12`, `L10-BRAIN-022-C13`, `L10-BRAIN-022-R-design-choice`, `L10-BRAIN-022-R-field-definition-missing`, `L10-BRAIN-022-R-priority`, `L10-BRAIN-022-C14`, `L10-BRAIN-022-C15`, `L10-BRAIN-022-C16`, `L10-BRAIN-022-C17` | 両方向required trace coverage候補100%、未充足義務誤完了0。値unknownとfield definition missing、知識不足とHARNESS対応付け不備を別母集団にする。 |
| `BRAIN-023-NFR-01` | `L10-BRAIN-023-C01`, `L10-BRAIN-023-C02`, `L10-BRAIN-023-C03`, `L10-BRAIN-023-C04`, `L10-BRAIN-023-C05`, `L10-BRAIN-023-C06`, `L10-BRAIN-023-C07`, `L10-BRAIN-023-C08`, `L10-BRAIN-023-C09`, `L10-BRAIN-023-C10`, `L10-BRAIN-023-R-applicability-missing`, `L10-BRAIN-023-R-required-input-missing`, `L10-BRAIN-023-R-counterexample-missing`, `L10-BRAIN-023-C11`, `L10-BRAIN-023-C12`, `L10-BRAIN-023-C13`, `L10-BRAIN-023-C14` | required coverage候補100%、製品固有要素の誤混入/direct promotion 0。未評価部分は未評価として残す。 |
| `BRAIN-030-NFR-01` | `L10-BRAIN-030-C01`, `L10-BRAIN-030-C02`, `L10-BRAIN-030-C03`, `L10-BRAIN-030-C04`, `L10-BRAIN-030-C05`, `L10-BRAIN-030-C06`, `L10-BRAIN-030-C07`, `L10-BRAIN-030-C08`, `L10-BRAIN-030-C09`, `L10-BRAIN-030-C10`, `L10-BRAIN-030-C11`, `L10-BRAIN-030-C12`, `L10-BRAIN-030-C13`, `L10-BRAIN-030-C14`, `L10-BRAIN-030-C15`, `L10-BRAIN-030-C16`, `L10-BRAIN-030-C17`, `L10-BRAIN-030-C18`, `L10-BRAIN-030-C19`, `L10-BRAIN-030-C20`, `L10-BRAIN-030-C21`, `L10-BRAIN-030-C22`, `L10-BRAIN-030-C23`, `L10-BRAIN-030-C24`, `L10-BRAIN-030-C25`, `L10-BRAIN-030-C26`, `L10-BRAIN-030-C27`, `L10-BRAIN-030-C28`, `L10-BRAIN-030-C29`, `L10-BRAIN-030-C30`, `L10-BRAIN-030-C31`, `L10-BRAIN-030-C32`, `L10-BRAIN-030-C33`, `L10-BRAIN-030-C34`, `L10-BRAIN-030-C35`, `L10-BRAIN-030-R-compatibility-range-missing`, `L10-BRAIN-030-R-reference-substitution`, `L10-BRAIN-030-R-correlation-mismatch`, `L10-BRAIN-030-R-version-stale`, `L10-BRAIN-030-R-version-mismatch`, `L10-BRAIN-030-R-source-mismatch`, `L10-BRAIN-030-R-applicability-unknown`, `L10-BRAIN-030-R-reverse-revision`, `L10-BRAIN-030-R-reverse-field`, `L10-BRAIN-030-R-reverse-scope`, `L10-BRAIN-030-R-obligation-receipt`, `L10-BRAIN-030-R-design-completion`, `L10-BRAIN-030-R-implementation-ready`, `L10-BRAIN-030-R-state-conclusion`, `L10-BRAIN-030-R-permission-conclusion`, `L10-BRAIN-030-R-design-conclusion`, `L10-BRAIN-030-R-screen-conclusion`, `L10-BRAIN-030-R-db-conclusion`, `L10-BRAIN-030-R-mixed-fields`, `L10-BRAIN-030-R-relation-conflict`, `L10-BRAIN-030-C36`, `L10-BRAIN-030-C37`, `L10-BRAIN-030-C38`, `L10-BRAIN-030-C39`, `L10-BRAIN-030-C40` | 各適用母集団coverage候補100%、誤受領/誤昇格0。required definition missingとvalue unknown、未選択と未観測、参照資料とauthorityを別にする。 |

各測定は`Nplanned`, `Nrequired`, `Nchecked`, false-accept count、およびvalid/failed/missing/censored/unexecuted理由を記録する。`Nrequired=0`では割合を算出せず、valid fixture数0では結果率/実績を作らない。正しいoracle rejectionも照合可能な測定として扱い、処理失敗と混ぜない。候補100%/0境界は要求field照合の技術候補で、製品SLAや採択値ではない。固定性能期限・最低標本数・新承認gateを加えない。


## Stage 5 — NFR verification disposition

L2-024/025の固定sourceは独立数値NFRを指定していないため、NFR ID、threshold、時間測定CASEを追加しない。機能CASEで契約の意味を照合し、business/NFR判定をfunctional successと重複させない。

| 親L2 | NFR L10判定 | functional CASE参照 |
|---|---|---|
| `HELIXBRAIN-L2-024` | 独立NFRなし。実測や性能達成の主張はない。 | `BRAIN-024-AC-01/02`、functional fixture `L10-BRAIN-024-C01`–`C45` |
| `HELIXBRAIN-L2-025` | 独立NFRなし。独立検証stateはfunctional oracleであり性能目標ではない。 | `BRAIN-025-AC-01`〜`BRAIN-025-AC-06`、functional fixture `L10-BRAIN-025-C01`–`C70` |

旧RCLS shadow判定値は現行NFR/合格基準として使用しない。
