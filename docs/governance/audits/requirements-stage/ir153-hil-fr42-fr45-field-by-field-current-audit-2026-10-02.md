# IR153 HIL-FR-42／45 現行条件の項目別照合

- 監査基準HEAD: `6265c512bae65789b177e38404c8266726799f46`（専用worktreeの固定base）。
- 目的: 旧HIL-FR-42/45の原文条件、出力、関連HR/HAC/HATを、基準HEADの現行L2/L11本文と実PO判断へ項目別に対応させる。要求本文・MPR・receipt・採否・successor割当は変更しない。
- 旧経路のruntime、test、CI、CLIは実行していない。読み取りとSHA/見出し境界の静的照合のみ。

## Source identityと原条件

旧raw sourceは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`（asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）。HIL-FR-42:132のLFを除いた物理行SHA-256は`346e683c5f9c58018a57c29e652b84b79612466a24a3df6124d271ac0ddeddb8`。HIL-FR-45:135は`618f08eec7918d50938b2b09914da9be34524d5f9662b5bdfd1dfa43aed4b871`。

旧IRは`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`（SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）の`#/HIL-FR-42`、`#/HIL-FR-45`。両recordはrevision 1 / kind `functional` / `specified` / `frozen`と記載し、HR-FR-HIL-17、HAC-HIL-17a/b/c、HAT-HIL-17、authority RAS-HIL-17を参照するが、design_template_ids・design_obligation_ids・required_design_artifact_kindsは空で、pending_resolutionにtemplate選択待ちを残す。旧IRのstatus語は現行authority状態へ読み替えない。旧system contract file `requirements-ir/system_contracts.json` SHA-256 `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab` の`#/HR-FR-HIL-17`、HIL L3 functional requirements:51/80、L3 acceptance design `L3-infinity-loop-acceptance-test-design.md:49`のHAT参照まで読んだ。HRのsemantic digestは`46638389e09a375aa1059fb3b6d3321703bfb2763c3777b2c321e06d25bc1fa7`。関連`acceptance_cases.json`はSHA-256 `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`で、HAC-17aは「atom/challengeを決定routeし完全revisionだけactive」、17bは「TBD/N/A/orphan/change欠落でfreeze拒否」、17cは「template gapは独立review前active 0」。`system_tests.json` SHA-256 `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`のHAT-17はstatus `designed_not_implemented`、必要証拠source/authority/oracle・template/obligation/change/review、負境界aggregate/TBD/N/A・self-promotion・staleを記す。これらは設計済み旧oracle referenceであり実行していない。HRはFR41–45とNFR26–28をまとめた原文・oracle参照であり、FR42/45単独の追加条件と推定しない。

Carry-forward ledger `docs/governance/legacy-migration/requirement/legacy-requirement-carry-forward.jsonl` は42行75／45行78で両identityを`preserved_pending_rehome`、`successor_requirement_ids: []`、`decision_record: null`と記録する。今回の照合でもこの状態を維持する。過去監査 `legacy-ir108-fr42-fr45-condition-correction-2026-09-28.md`（db2a455時点）とroot review 28a9906を読み、当時の判定を最新採否として流用せず、今回の本文・判断固定を再計算した。

## 現行revisionと採否の固定

基準HEAD時点の現在本文file SHA-256は次のとおり。

| 文書 | file SHA-256 |
|---|---|
| `docs/helix-harness/L2-requirements/product-requirements.md` | `94e476d2792da0200b2a334e591b02e08401b845a84794b6990e039775968bcf` |
| `docs/helix-harness/L11-acceptance/product-acceptance.md` | `0f682b3fdbb7bf43baa33af68a215bf369d56a562d12a496b8c88cac9563dffd` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | `48c35d7ef629d99305aac79e548e638057e3ffe728976bff82e3ed1008e093fe` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | `3faf77574ffc6d33720e2d882cd3c7d30268b9103fb76054d1837f81467a413a` |

現行節digestは`###`から次の同階層以上の見出し直前まで、末尾空行を除きUTF-8 LF一つで終えたbyte列で算出した。採否判断ファイルの基準HEAD full SHA-256は、57候補decision `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、11候補decision `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`、live26 decision `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`、基盤HARNESS decision `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`、current MPR register `b44f9a4aecb8c2fab5f7517ebe55234399805c3435d1446a6836283da8ab3a93`。063 source receipt `hr17-residual-coverage-receipt-2026-09-29.json` full SHA-256 `a4e0e656275cf5d942741af6fdca6dfcfb1b0ffcd6c395ad6abb6d44a45d8b1f`。

| Current pair | 基準HEADのsection範囲 / SHA-256 | 採否根拠と意味範囲 |
|---|---|---|
| HARNESS-L2-035 L2/L11 | L2:719–728 raw-section SHA `7eabe1b8feefc4f7d954cf182a20d6db5c9f7ebd3e253767cc41c9def6d61896`; L11:485–491 `65328061d5933e205a1ce1bf8689f19b1ab820623a2c637f13bb475477100670` | PO decision `po-decision-2026-09-29-57candidates.md:40,122` adopts MPR `MPR-RC-HARNESS-L2-035-002` and its scope-measurement supplement. The decision/register semantic digest is `4e37d81…3a29c2`; it is a different digest definition from this audit's raw section SHA. Holds upstream authority/rationale, scope/non-goal, acceptance contribution, necessity/alternatives/budget derivation and circular-scope rejection. It is not a general requirement-field schema. |
| HARNESS-L2-040 L2/L11 | L2:946–955 `c349606d7798e3f4eb5e6cb31e0618a83dcfa05f9fc888b0ce618f6d160757df`; L11:689–697 `366518f8e32ac4dda1e5f4ec88ef0cfed6bc363d597955ffffb1a82d706fc212` | PO `po-decision-2026-09-29-57candidates.md:45` adopts exact `MPR-RC-HARNESS-L2-040-002`; pair digest matches current body. Holds catalog/pair contract, stable row subject ID/revision, source span, semantic digest, status, owner, upstream/downstream edges, coverage receipt/snapshot scope. Generic required-node/edge catalog, not the FR42 enumerated graph schema or all FR45 fields. |
| HARNESS-L2-041 L2/L11 | L2:957–968 `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`; L11:699–714 `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b` | PO `po-decision-2026-09-29-11candidates.md:27` adopts exact registration `MPR-RC-HARNESS-L2-041-003`; both current digests match the decision. Holds selected-template identity/revision/applicability, atom or reasoned gap, extraction scope/source span and negative oracle. Applies only to the selected template/scope and does not write canonical ledger rows. |
| HARNESS-L2-053 L2/L11 | L2:1139–1152 `ebc78869f6d94668d9fed00d0a0415d068d85c0f61c0d98f01a9c4ec39710587`; L11:851–864 `c22abfd29780a4016b0fcef74d6b2c29b3628b81c12d0fcb0b1fcabfb48bb61f` | PO `po-decision-2026-09-29-11candidates.md:33` adopts exact `MPR-RC-HARNESS-L2-053-001`. Despite candidate wording in the historical body, PO decision is authority. Holds path-independent identity/revision, semantic diff, rename/move history and split/merge/supersede relation with authority/oracle/typed-edge evidence for the selected HIL-FR-53 source atoms; not all FR45 field schema or FR45 source disposition. |
| HARNESS-L2-063 L2/L11 | L2:1238–1248 `f0a1014c9514d70e8cbee63faca3ae6679c43240c89e095c4b484b161ed75b46`; L11:952–963 `fb545fc06feb1b032899cc24e8b579bb2032747a4e65f40ae354103b0bda2233` | PO `po-decision-2026-09-30-live26.md:48,72` adopts exact `MPR-RC-HARNESS-L2-063-001`, only 3 selected HR-FR-HIL-17 slices (`behavior`, `transition_contract`, `failure_and_evidence`), with `version_target` unspecified. Receipt `hr17-residual-coverage-receipt-2026-09-29.json` and MPR row 638 define the source subset; no 11-ID/source-contract-wide closure or formal FR42/45 successor is claimed. Holds selected-source/authority atoms, typed edge/oracle closure, gap/challenge, change/stale checks and freeze eligibility within that subset. |
| HELIXOS-L2-038 L2/L11 | L2:1096–1113 `c3b0424bd39ac7c91166c87738fbefc1b20a11b904012d9ada768a113ccbe013`; L11:671–673 `eabb68eaafc76f0080fbe9cb9c6904005c88b72e7cee9563f2515b4488de2e5d` plus conditional L11:690 section `86287e73d09522940b2a07bf8f304135ff3d495904df055088f07fff077766ed` | PO `po-decision-2026-09-29-11candidates.md:35,38,40` adopts `-002` together with HARNESS-041 `-003`; this is OS snapshot/proposal append/negative quarantine support, not requirement-definition meaning or row-schema authority. |

Base HARNESS requirements include L2-003/004/005/008/009 rows at `product-requirements.md:54–60`; L2-014 at `:379–386`; L2-022 at `:447–466`. The exact current bytes are covered by the HARNESS file SHA above. L11 baseline acceptance requirements include L2-003/004/005 at `product-acceptance.md:40–50`, L2-014 at `:274–282`, L2-022 at `:300–330`. These pairs preserve change trace/backflow, risk-based verification, selected template-derived design duties, and oracle/stage distinctions. L2-025/026 (`product-requirements.md:530–555` and L11 `:342–354`) are `registered_proposal` in the 2026-09-28 decision (`helix-harness-requirements-po-decision-2026-09-28.md:54–55`), so their concrete API/permission/state/composite trace examples are candidate-only evidence.

採否は上記PO decisionの対象registration revision・L2/L11 digestから読んだ。`draft_candidate`等の本文frontmatterは採否の根拠にしていない。L2-040/041、OS-038、L2-063のcandidate metadataにあるversion未指定または候補表記は、そのPO decisionを打ち消さない。

## FR45 — 13 ledger fields

「保持」はFR45全体のsuccessorや台帳実装を意味しない。特定の行き先本文がfieldの意味を持つ範囲だけを示す。採択本文で個別fieldの保存・oracleが明記されないものは、generic `typed edge` やMPRの管理fieldだけから充足と判定しない。

| 旧field | 現行の個別行き先とauthority | 項目判定・残る例 |
|---|---|---|
| source atom | HARNESS-L2-041 `:960–965`（template atom/source span/gap、採択pair）；HARNESS-L2-063 `:1241–1247`, L11 `:952–963`（source identity/span/authority revision/disposition/challenge、3 slice限定で採択）；L2-040 `:951–954`（row source span） | 部分保持。選択template／063の選択source atomに限る。FR45全件の個別origin atom集合をcanonical requirement revisionへ拘束する横断条件・formal rehomeは未証明。 |
| canonical statement | HARNESS-L2-040 `:951` row semantic digest/source span、HARNESS-L2-063 `:1242–1247` source atom semantic closure | 未完。選択scopeのdigest/原文spanは保持するが、全requirement rowのcanonical statement byte/textとimmutable revisionの組を要求・受入する採択schemaは特定できない。反例: statement文字列だけ差替え、他の既知edgeとsource spanは揃えた入力をledger/closureが拒否するoracleがない。 |
| BR/FR/TR/NFR type | HARNESS L2-040 `:951` ledger typeは層契約種別、L2-063 `:1242` atom/modality、OS-038 L2 `:1096–1113` catalog type | 未完。これらの`type`はrequirement kind taxonomyではない。旧の4値をrequirement atom fieldとして保存・非適用理由まで扱う採択本文なし。 |
| modality | HARNESS-L2-063 `:1242` に各source atomの適用modality、L11 `:952–963`で対象scopeのoracle | 限定保持。採択063の3 sliceに限る。全FR45 requirement fieldを含む記録契約でない。 |
| priority | HARNESS-L2-024/L11 `:240–254` が質問提示順位を扱う | 未完。question ordering priorityはrequirement ledger row priorityと同じ意味でない。source requirementごとのpriorityを保持・変更追跡する採択条件を確認できない。 |
| scope/non-goal | 採択HARNESS-L2-035 L2 `:722–727`/L11 `:485–491` が候補の目的・scope/non-goalと不要拡張を上流根拠へ照合 | 部分保持。候補導出と受入寄与を扱うが、全canonical requirement rowへのscope/non-goal属性、revisionごとの継承・変更receiptを規定しない。 |
| authority/rationale | 採択HARNESS-L2-035 L2 `:722–727`; HARNESS-L2-063 `:1241–1247`（source authority revision/disposition、3 slice限定）; OS-038 L2 `:1096–1113`（OS側のsnapshot/proposal authority参照） | 部分保持。上流根拠・authority状態は選択範囲で追跡される。全requirement rowのrationale fieldと、requirement changeごとのdecision owner/review authority bindingは未確認。 |
| acceptance oracle | 採択HARNESS-L2-022 L2 `:447–466`/L11 `:300–330`（成功・反例、stage、oracle/evidence関係）；HARNESS-L2-063 `:1242–1247`（同一freeze scopeの全required oracle closure） | 部分保持。設計/受入oracle契約と063の選択subsetのclosureはある。FR45各requirement rowにacceptance oracle identity/revisionを型付き保存し、欠落時にそのrowのchangeを止めるfield-level契約は未確認。 |
| owner | HARNESS-L2-040 `:951` rowにowner、L11 `:689–697`同revision coverage | 行fieldとして保持。これはlayer-ledger row ownerであり、requirement-specific ownerが誰かを生成・推定せずに入力し、欠落をfinding化するかはFR45全行について未確定。 |
| risk | HARNESS-L2-005 `:56` が変更のriskから検証義務を導出。L2-014 `:382` がtemplate選択入力にrisk/domain | 部分保持。変更/設計選択のrisk利用はあるが、FR45 requirement row自体のrisk field、分類・変更の保存oracleは見当たらない。 |
| capability/service | HARNESS-L2-014 `:382`/L2-009 `:60` がservice/unit/connection/compositeとtemplate選択、L2-040 `:951` のledger type/node/edge catalog、L2-063 `:1242` の要求relation | 部分保持。設計能力の選択・relationはあるが、FR45全requirement rowから capability/service endpointへ結ぶ必須 typed relationのschema・orphan oracleは採択本文で特定できない。 |
| template applicability | 採択HARNESS-L2-041 L2 `:958–965`/L11 `:699–714`; HARNESS-L2-063 `:1242–1247` | template選択scopeでは保持。exact identity/revision/applicabilityを入力し、atom/gapと適用条件を照合。063の全source scopeへ拡張せず、requirement registry全行のapplicability field closureも主張しない。 |
| design obligation | HARNESS-L2-014 `:382–386`、L2-041 `:958–968`/L11 `:699–714`、L2-063 `:1242–1247`/L11 `:952–963` | 部分保持。templateからの義務導出、active template要素のatom/gap、selected 063 freeze対象の全typed edge/oracle閉包はある。FR45全rowのdesign-obligation endpointと個別dispositionの固定は未証明。 |

## FR42 — 11 graph viewpoints

| 旧graph node/facet | 現行の個別行き先とauthority | 項目判定・残る境界 |
|---|---|---|
| API | HARNESS-L2-014 `:379–386` は要求kind/対象/構成/risk/domainに合わせ設計義務を導く。L2-025/026 `:530–555`のAPI/command例はcandidate-only。 | 部分保持。設計入力／義務一般は採択済み。API node/edgeをsource atomから必須化する採択ledger schemaは確認できない。 |
| data | HARNESS-L2-014 `:382–386`; L2-022 `:447–466`; L2-025/026候補にstate/data invariant例 | 部分保持。pair/oracle全般とcandidate例はあるが、FR42全scopeのdata edge必須性は未固定。 |
| state | HARNESS-L2-003/004 `:54–55`, L2-014 `:382–386`; L2-025/026 candidate | 部分保持。状態やrevision/backflowの規則はある。source→個別state obligationの必須edge型は未確認。 |
| event | L2-040 `:951–954` row/pair edgeと同一revision coverage、OS-038運転snapshot | generic relationしか確認できず未完。event facet専用の必須node/oracleは採択L2/L11に列挙されない。 |
| failure | HARNESS-L2-003/005 `:54,56`, L2-022 `:447–466`; L11 `:40–50` oracle/negative examples | 検証failure/反例は保持。FR42 source atomからfailure obligation nodeへの個別edge閉包は未確認。 |
| security | HARNESS-L2-003/005 quality/risk boundary, HELIX-SECURITYの別authority/受入契約 | safety/securityは隣接契約を参照するが、FR42の各requirement→security obligation edgeを作り閉じるHARNESS採択schemaは確認できない。別機構をHARNESSの必須nodeと推定しない。 |
| observability | HARNESS-L2-018 `:416–421` は運用品質・observability scopeを扱う | 運用要求のscopeは保持するが、対象FR42ごとのobservability design obligation/receipt edgeは未確認。 |
| lifecycle | HARNESS-L2-003工程状態、L2-014設計対、L2-022段階状態 | artifact/process lifecycleの別契約はあるが、graphの個別lifecycle node/edgeとoracle closureは固定されない。 |
| operation | HARNESS-L2-022運転と契約の分離、HELIXOS-L2-038のOS側snapshot/write | 運転責務境界は保持。要求からoperation obligationへのgraph edgeを作る意味契約は別途明示されていない。 |
| test oracle | HARNESS-L2-022 `:447–466`、L11 `:300–330`、HARNESS-L2-063 `:1242–1247` | 一般oracleとselected freeze scopeのoracle closureは保持。063は3 source slice限定で、FR42全source closureとはならない。 |
| gate | HARNESS-L2-003/005、L2-022、L2-063 selected `eligible/incomplete/unknown` closure | 適用工程・検証・selected freeze gateがある。全必須design obligationを個別判定し、未消込1件でpair-freeze拒否する共通gateは、063の限定subset外で独立には特定できない。 |

## FR42 — 四つの出力

| 旧output | 現行行き先と採否 | 対応範囲と残る条件 |
|---|---|---|
| obligation graph | 採択L2-040 L2 `:951–954` catalog/row/typed upstream-downstream edges; 採択L2-063 L2/L11 `:1242–1247`, `:952–963` closure | graphに相当するrelation/closureは限定scopeである。13項目のFR45 fieldとFR42の明示node/facetから必須graphを全件生成するschemaではない。 |
| discharge receipt | L2-063 `:1242–1247` freeze receipt candidateとL11 positive/negative closure | receipt名の違いを欠落理由にはしない。meaning closureは3 slice採択範囲にあるが、旧FR42全条件のdischarge receiptは未証明。 |
| coverage receipt | 採択L2-040 L2/L11 `:951–955`, `:689–697`; L2-063 source coverage receipt固定3 atom | layer/pair coverageは保持。個別FR42 source/facet/obligation全体のcoverageを閉じたclaimはない。 |
| unresolved finding | 採択L2-041 L2/L11 `:962–965`, `:699–714` gap finding; L2-063 `:1242–1247` challenge/gap/incomplete/unknown | template gap・selected-source gapは可視化される。全FR42 atom/facet orphanまたは未消込を同一pair freeze gateで必ずfinding化する範囲は限定される。 |

## FR45 — 四つの出力とidentity change

| 旧output/condition | 現行行き先と採否 | 対応範囲と残る条件 |
|---|---|---|
| requirement definition/revision | 採択L2-040 `:951–954` stable subject ID/row revision/semantic digest、採択OS-038 `:1096–1113` snapshot identity/revision | row identity/revision管理はある。FR45 13 fieldの各値をimmutable requirement revisionへ結ぶ型付き定義schemaは未確認。 |
| typed edge | 採択L2-040 `:951–954` upstream/downstream typed contract、L2-063 `:1242–1247` all selected-scope typed edge closure | generic edge contract/closureはある。FR42の列挙node/facetまたはFR45の13各fieldを必要端点にする現採択taxonomyを確認できない。 |
| change/applicability receipt | 採択L2-063 `:1242–1247` before/after revision、source/template/ledger identity、affected edge/oracle、stale range; 採択L2-041 applicability; adopted HARNESS-L2-053 `:1139–1152`, L11 `:851–864` | 063はselected source sliceでchange/stale scopeを保持。053はHIL-FR-53由来の選択atomに対してidentity revision lineage・rename/split/merge/supersede relationを採択済みで述べるが、FR45全行・全atomへの適用またreject/N/Aまでの対応は宣言しない。FR45のoperation別receiptは、split/merge/rename/supersede/reject/N/Aごとに前後semantic digest両方・全source atom disposition・downstream stale・review authorityが揃う場合に限り適用可、という独立採択oracleが残る。 |
| orphan/stale finding | 採択L2-040 `:954`, L2-063 `:1243–1247`/L11 `:952–963`; OS-038 L11 `:671–690` | coverage/stale/quarantine findingとselected-scope fail-closeは保持。FR45 identity-change receiptの不足時、当該operationを適用しないというfield/operation-specific oracleは未確認。 |

## 残差を確かめる反例と次候補の境界

監査で真の候補不足として記録する範囲は、既存採択pairと重複しない以下の二つに限定する。これらは候補本文ではなく、root検収用の必要条件メモであり、採択・formal successorを作らない。

1. **FR42 graph/schema-and-freeze scope**: あるrequirement atomのAPIまたはfailure obligationをledger契約に追加しないまま、catalogに宣言済みのedgeだけを全て閉じ、他のoracleもgreenにした入力を考える。現行L2-040は必須node/edgeをcatalogが定義するとするが、FR42が列挙するsource→requirement→capability/service→domain object→11 facetsの必須taxonomyを固定しない。063は「freeze対象」のclosureを強制する一方、adopted 3 slice source scopeを越えるFR42 atom全体をselected対象へ含めるとは決めていない。必要な候補条件は、対象scopeの全source/requirement atomsから明示されたnode/facet・design obligation・L11 oracleまでの個別対応を生成し、欠落edge、未消込、orphan、placeholder、理由なきN/A、aggregate dischargeを1件でも含む場合はpair-freeze eligibleにしないこと。templateを使わないscopeも必要契約をunknown/未完とし、空成功へ落とさない。
2. **FR45 field schema and operation-bound change receipt**: requirement rowのsource span/owner/semantic digestと一般edgeが存在するが、canonical statement、BR/FR/TR/NFR、priority、risk、capability/serviceのいずれかを持たない入力、またはsplitを実行しながら前後semantic digestの片方、1個以上のsource atom disposition、影響downstream stale、review authorityをreceiptから落とした入力を考える。採択L2-040/063の一般row/closure/change conditionsは全FR45 fieldsとoperation receipt境界を列挙しない。採択HARNESS-L2-053はFR53の選択atomに対してsplit/merge/supersede等のidentity lineageとsemantic diffを保持するため、その範囲をFR45残差へ二重計上しない。FR45のreject/N/AやFR45 source atom全件へ同じ適用条件があるとは確認できない。必要な候補条件は旧13項目をtyped field/edge schemaとして個別保持し、列挙されたoperationの適用を、前後digest・全atom処置・downstream stale・review authorityを同一scope/revisionのreceiptで検査できる場合だけ許可すること。これは新しいapprovalを足す提案ではなく、旧FR45が列挙するレビュー権限を既存decision boundaryに結ぶ意味条件である。

他の欄・facetは明示的に「部分保持／範囲外／未確認」と記録した。名称不在だけから別候補を起こさず、FR42/45のformal source dispositionや全量closureも宣言しない。旧output名と現行receipt名の不一致だけは不足根拠としていない。

## 静的検証

- 基準HEADは専用worktreeで`6265c512bae65789b177e38404c8266726799f46`。基準本文file SHAと見出しsection digestを上表の規則で再計算し、040/041/063/OS-038のPO固定digestとの一致を確認した。
- 旧raw行LF除外hash、legacy IR/source file SHA、MPR source pointers、HR/HAC/HAT references、carry-forward statusを照合した。
- 元旧行の引用bytesを変更せず、archive runtime/test/CI/CLIは実行していない。
- この監査はFR42/45の全source条件に対する個別意味対応結果であり、runtime実装・受入実行・要求採択・formal successor・Stage完了の証拠ではない。
