# Goal 6: 旧前提になった研究検査の始末案

status: `research_premise_candidate`
authority_effect: none
scope: Goal 1の29件とGoal 5の意味・契約不一致3件、計32 validator
comparison_base: Goal 1 / Goal 5 baseline `e57b2523b89dd29e6879c71e05ce49e86f1c07c0`; Goal 5 merge main `092de3d4114b6310c7904c5b8556ad649c0e0421`

## 対象と共通の確認

Goal 1の監査記録、旧分類6件の監査（[PR #2134](legacy-classification-validator-mismatch-2026-09-25.md)）、PHCAP-15の8件の監査（[PR #2135](phcap15-deploy-validator-mismatch-2026-09-25.md)）、#2136のreviewを読んだ。Goal 1ではmain `e57b2523b89dd29e6879c71e05ce49e86f1c07c0`の137 validator baselineから29件を扱った。Goal 5の監査は同じbaselineから17件を対象にし、wave37–50の14件は意味条件確認後に合格、0126・0144・0148は意味・契約不一致として失敗を維持した。Goal 5 PR #2138はmain `092de3d4114b6310c7904c5b8556ad649c0e0421`へmerge済みで、reviewed HEAD `c547ff71`のtree一致をread-after確認した。したがって本記録はGoal 1の29件とGoal 5で残った3件を合算した32件を扱い、各validatorのbaseline結果・source・根拠・処置をJSONLに記録する。

現行文書検索は`docs/concept/`、`docs/governance/candidates/`、`docs/governance/crosswalks/`、`docs/governance/decisions/`、`docs/helix-harness/`、`docs/helix-os/`、`docs/helix-web/`、`docs/helix-web-os/`、`docs/helix-brain/`、`docs/helix-labo/`、`docs/helix-intelligence/`を対象に、各bundle名の完全一致を調べた。32件すべて完全一致はなかった。Goal5追加3件についてasset IDと旧source pathも同じcanonical文書群で検索し、明示参照は見つからなかった。したがって以下は「現在の要求がこの研究束を使っている」とは主張しない。同じ主題を扱う現在の文書、識別子・asset IDの検索hit、Scaffold Bindingの明示的なupstream consumerを別に記録する。台帳内の同一ID出現は出典identityでありconsumerではない。Binding consumerは`scaffold/bindings/*.json`全件の`upstream[].path`を研究束artifact pathと照合して抽出し、ownerと下流参照を分けた。



## 新しい意味での検査案

各行の「始末案」を実際の検査条件へ移す場合の入出力・relation・不変条件・拒否する誤昇格は、JSONLの`rederived_check`へvalidator別に記録した。既存PO判断と現行方針を反映し、現在は`導き直し`31件、`履歴保持・検査退役候補`1件、新しいPO質問0件。全entryの根拠を`disposition_basis`へ記録した。共通の具体像は次のとおり。

- delegated-doc系は旧requirement/acceptance sourceのrevision・atom・edgeと現行Concept、対象別L1、機構別L2 candidateを照合し、各edgeのsource identityを保つ。旧承認状態やedgeから現行要求を自動継承しない。
- legacy分類系はarchive asset span→当時の四製品分類→現行機構/candidate relationをasset単位で追い、現行のsource spanとauthority stateを要件とする。旧分類からowner・承認・実装対象を決めない。
- PHCAP-15系（旧HELIXの工程・能力番号15に紐づく配備研究）は各assetの旧出典とConceptのサービス⑥「リリース」・OSの配布運転候補との関係を調べる。pool・gap・followupの目的差を保ち、台帳件数から要求採否を導かない。
- pre-isolation系はhistorical snapshot内のdigest整合、current counterpartの整合、revision間の明示relationを分けて検査し、旧/current digest一致を要求しない。67件holdingはそのscope外sourceの混入も拒否する。
- OUTSIDE67-069はPATH-052/056から分割後の機構別candidate pathを別identityとして照合する。旧単一pathからownerや候補同一性を推定しない。083はarchive/current bytes identityと意味relationを独立検査する。
- Web/Web-OS Vision起源4件はsource lineage・候補atom/composite・Vision coverage・candidate-only asset relationをVision研究として導き直し、要求へ接続しない。残る旧L1 anchor 1件は履歴記録を保ち、現在の要求anchor検査を退役候補としている。

再導出案・退役候補案は調査の提案であり、PO判断や実行ではない。全32件について、導き直しまたは履歴保持・検査退役候補を選んだ理由と、将来の退役候補時におけるowner/downstream影響をJSONLの`retirement_assessment`へ記録した。現在の正式な置換artifactが成立していないため、`scfctl check-replacement`や`retire`を実行したり、退役可能と結論したりしていない。現行契約では、役割・義務・接続・consumer・oracle・negative caseの全移管が合格し、その記録のread-after digestが一致して初めて退役できる（[scaffold/README.md](../../../../scaffold/README.md):50-68）。

## 検査退役候補と未実行の境界

退役候補は`rdp001-outside67-web-webos-l1-anchor-0121`の1件である。このvalidatorの役割は旧L1 anchorを現行L1要求へ結ぶことだが、9/24判断でWeb/Web-OS L1/L2はVision材料となり、要求は将来PO指示から起こす。下流Binding consumerは検出されていない。そこで4 path snapshotと11 anchor recordはsource provenanceとして保持し、現在の要求anchor検査は退役候補とする。owner SCF-B-0121の義務・oracle・negative caseを移す正式artifactと確認記録はまだなく、退役はしていない。

残る31件は導き直しを提案する。特に0080のlineage、0088の候補atom/composite、0091のVision候補coverage、0124のcandidate-only asset relationは現在要求への接続を使わず研究役割を維持する。0080には下流Binding 0081/0084/0088/0091/0124があるため、記録とsource lineageを残し、Vision資料を対象とする検査へ導き直す。どのentryもvalidator、inventory、Bindingは変更していない。退役候補1件を含め、`scfctl check-replacement`、`retire`は未実行。将来退役を実行する場合は、役割・義務・接続・consumer・oracle・negative caseをBinding全体で移し、合格後read-after digestが一致する必要がある（[scaffold/README.md](../../../../scaffold/README.md):50-68）。entry別のowner/downstreamと手順はJSONLの`retirement_assessment`に記録する。

## 各validatorの調査案

下表は検査ごとに、固定した意味、現在との食い違い、残る調査価値、Binding consumer、提案を記す。Goal 1由来29件に続くGoal 5の追加3件は末尾にまとめた。Binding IDは登録Bindingの`upstream`から当該研究束のパスを参照しているもの。既存PO判断を適用した根拠と、研究検査の処置理由はJSONLの`disposition_basis`へvalidatorごとに記録した。新しいPO質問は置いていない。退役を選ばない理由も各行にある。

| Validator | 固定していた意味・失敗 | 現在も役立つ点と明示consumer | 始末案 |
|---|---|---|---|
| `delegated-doc-003-028` | 旧`DELEGATED-DOC-003/028`と3 edgeを、旧承認4対象boundary/L1のdigestに結び付けたatom候補。現行boundary/HARNESS L1/OS L1のdigest不一致。 | 旧source atomと参照edgeの履歴・出典調査には使える。現在のConcept・要求・候補文書にbundle名の明示参照なし。owner `SCF-B-0005`; downstream consumerなし. | **導き直し**。旧要求意味・revisionを保持し、各successor対象と層へのsource traceを検査する。意味変更・採否はしない。|
| `delegated-doc-008-017` | 旧`DELEGATED-DOC-008/017`と5 edgeをatom候補として固定。固定boundary/L1 digestが現行と不一致。 | 旧L3/L10 pairのsource traceは保全価値がある。現行要求文書が研究束を明示参照する証拠は未確認。owner `SCF-B-0006`; downstream consumerなし. | **導き直し**。旧要求意味・revisionを保持し、各successor対象と層へのsource traceを検査する。意味変更・採否はしない。|
| `legacy-ai-instruction-product-classification-0145` | 固定BASEの旧AI指示・adapter・consumer template 72件を旧4製品責務候補として分類。現行入力が`E_INPUT_DRIFT`。 | 旧AI指示の資産、failure、consumerを読む候補一覧として有用。現行要求/candidate文書の明示consumerなし。owner `SCF-B-0145`; downstream consumers `SCF-B-0142`, `SCF-B-0149`. | **導き直し**。旧asset分類は履歴として保持し、現在Conceptと機構L1候補へ接続可能性を別に再導出する。実行可能性・owner・採否は作らない。 |
| `legacy-config-product-classification-0141` | 固定BASEの旧`config/**` 41件を四製品責務へ候補分類。現行product-boundaryとBinding closureが異なり`E_BINDING_CLOSURE`。 | 41件のsource spanと旧分類差を追跡できる。現行Concept/boundaryは現在の対象境界を記述するが、この研究束のconsumerではない。owner `SCF-B-0141`; downstream consumers `SCF-B-0142`, `SCF-B-0145`, `SCF-B-0149`. | **導き直し**。旧分類をsource snapshotとして保持し、現行機構境界との関係を未承認候補として再評価する。 |
| `legacy-execution-ticket-product-classification-0147` | 固定BASEのexecution-ticket 8資産を旧4製品L1で候補分類。完全Binding pinが一致せず`E_BINDING_BYTES`。 | 各assetの旧担当衝突と根拠は再評価材料になる。現行ticket意味を研究束から生成しない。owner `SCF-B-0147`; downstream consumers `SCF-B-0148`, `SCF-B-0149`. | **導き直し**。現行ticketの権限・発行責務は現行PO判断を起点に別導出し、旧4製品分類は歴史比較として保つ。 |
| `legacy-research-assets-product-classification-0142` | 固定BASEの旧`docs/research/assets/**` 57件を四製品責務候補へ分類。Binding upstream closureが不一致。 | 旧研究資産とその判断・failure・consumerのsource一覧として有用。現行候補文書の直接参照は未確認。owner `SCF-B-0142`; downstream consumers `SCF-B-0148`, `SCF-B-0149`. | **導き直し**。旧分類候補は保持し、現行の機構・研究責務境界に対する候補分類を別途導く。 |
| `legacy-schema-product-classification-0120` | 固定BASEの旧`src/schema/**` 31件を四製品責務候補へ分類。current boundary digestが違い`E_BINDING_INPUT_DIGEST`。 | schema資産の旧所有根拠・複数責務衝突を検索できる。現行Concept/boundaryとの同一性は未確定。owner `SCF-B-0120`; downstream consumers `SCF-B-0126`, `SCF-B-0141`, `SCF-B-0142`, `SCF-B-0144`, `SCF-B-0145`, `SCF-B-0149`. | **導き直し**。source/path identityを保ったまま、現行Conceptと機構L1候補に照らして候補関係を再評価する。 |
| `legacy-source-product-classification-0123` | 固定BASEの旧実装source 5領域59件を四製品責務候補へ分類。現行input setが`E_INPUT_SET`。 | 旧実装source分類の根拠・反証の履歴を参照できる。現行要求文書からの直接参照は未確認。owner `SCF-B-0123`; downstream consumers `SCF-B-0126`, `SCF-B-0141`, `SCF-B-0142`, `SCF-B-0144`, `SCF-B-0145`, `SCF-B-0149`. | **導き直し**。旧四製品relationを履歴として保ち、現在の対象境界・候補責務へのrelationを別のrevisionで再導出する。 |
| `phcap15-17-orphan-asset-links` | PHCAP-15/17の旧asset 6件が旧phase inventory、product-boundary、crosswalk-statusへどう接続したかをpin。3 input digestが不一致。 | orphan候補のasset identityと旧relationは引き続き調査に使える。現行phase inventoryにPHCAP-15はあるが、6 asset relationは現行判断を示さない。owner `SCF-B-0051`; downstream consumerなし. | **導き直し**。現行phase/candidate relationを再評価し、旧orphan状態は当時の観測として分離保持する。 |
| `phcap15-deploy-fifth12-research` | PHCAP-15 deploy poolから旧要求境界で選んだ第五12 assetを調査。phase ledger / product refsが不一致。 | 12 assetの旧pool選定重複・残分母の履歴に有用。正式要求consumerは未確認。owner `SCF-B-0063`; downstream consumerなし. | **導き直し**。旧assetの出典からConceptサービス⑥「リリース」とOSの配布物生成・配布・切戻し候補へのsource関係を検査する。旧要求接続・新しい採否は作らない。|
| `phcap15-deploy-final8-research` | 旧4対象製品境界・PHCAP-15を前提とする残り8 assetのdeploy research。ledger / product refsが不一致。 | 78件poolの過去の研究会計と未調査分母を追える。owner `SCF-B-0067`; downstream consumerなし. | **導き直し**。旧assetの出典からConceptサービス⑥「リリース」とOSの配布物生成・配布・切戻し候補へのsource関係を検査する。旧要求接続・新しい採否は作らない。|
| `phcap15-deploy-followup-research` | PHCAP-15 deployを現行4対象L1/L2/L11境界へつなぐ固定digest/span。現行phase/L1/L2 refsが不一致。 | deploy系legacy evidenceの各source refと残差を追える。owner `SCF-B-0055`; downstream consumerなし. | **導き直し**。旧assetの出典からConceptサービス⑥「リリース」とOSの配布物生成・配布・切戻し候補へのsource関係を検査する。旧要求接続・新しい採否は作らない。|
| `phcap15-deploy-gap-research` | PHCAP-15の旧4対象境界・draft requirementに対する17件のdeploy gap。現行phase/L1/L2 digest/spanと不一致。 | 旧assetごとのgap根拠は当時の研究履歴として有用。owner `SCF-B-0054`; downstream consumerなし. | **導き直し**。旧assetの出典からConceptサービス⑥「リリース」とOSの配布物生成・配布・切戻し候補へのsource関係を検査する。旧要求接続・新しい採否は作らない。|
| `phcap15-deploy-next12-research` | PHCAP-15 poolから選んだ次の12 assetのledgerと4対象 product refs。current ledger/refが不一致。 | pool選定の重複・研究対象履歴に有用。owner `SCF-B-0060`; downstream consumerなし. | **導き直し**。旧assetの出典からConceptサービス⑥「リリース」とOSの配布物生成・配布・切戻し候補へのsource関係を検査する。旧要求接続・新しい採否は作らない。|
| `phcap15-deploy-pool12-research` | PHCAP-15 deploy pool12のphase-ledger digestとcurrent boundary spansを固定。現行ledger/refが不一致。 | 12 assetの過去のpool選択理由が残る。owner `SCF-B-0059`; downstream consumerなし. | **導き直し**。旧assetの出典からConceptサービス⑥「リリース」とOSの配布物生成・配布・切戻し候補へのsource関係を検査する。旧要求接続・新しい採否は作らない。|
| `phcap15-deploy-research` | PHCAP-15を`draft_requirement`としてWeb/Web-OS L1/L2/L11およびOS L2へ接続。phase inventory、固定source refsのSHA/text/line SHAが不一致。 | deploy legacy source 78 asset poolの分類・failure・consumer追跡に価値がある。owner `SCF-B-0037`; downstream consumer `SCF-B-0054`. | **導き直し**。旧assetの出典からConceptサービス⑥「リリース」とOSの配布物生成・配布・切戻し候補へのsource関係を検査する。旧要求接続・新しい採否は作らない。|
| `phcap15-deploy-sixth12-research` | PHCAP-15 deploy poolから選んだ第六12 assetのledger / product refs。現行値と不一致。 | 旧poolの重複回避とasset研究会計は再現可能。owner `SCF-B-0065`; downstream consumerなし. | **導き直し**。旧assetの出典からConceptサービス⑥「リリース」とOSの配布物生成・配布・切戻し候補へのsource関係を検査する。旧要求接続・新しい採否は作らない。|
| `pre-isolation` | 旧6 pathのproduct-boundary、HARNESS README/L1をcoherentな現在前提として照合。現行digest不一致。 | 旧pre-isolation captureとarchive間の履歴差分は経時比較に使える。owner `SCF-B-0004`; downstream consumerなし. | **導き直し**。旧captureをその時点の状態として固定し、現行counterpartを別時点として並べる。旧snapshotを現行authorityへ更新しない。 |
| `pre-isolation-next` | 旧6 path candidateのboundary・OS/HARNESS L1 digestを現行同一性として検証。現行digest stale。 | 先行captureから次段階へ移ったhistoryとsource identityを追える。owner `SCF-B-0007`; downstream consumerなし. | **導き直し**。historical receiptと現在のpath/revision relationを分けた比較へ置き換える案。 |
| `pre-isolation-outside-holding-67-migration` | 67件historical holdingのphase inventory captureが現行のまま不変であることを要求。PHCAP-01 statusとConcept parent pathが変わり`E_PHASE_CAPTURE_UNCHANGED`。 | historical Wave verifierの固定入力と、その時点のauthority/path値を保つ価値がある。owner `SCF-B-0040`; downstream consumerなし. | **導き直し**。現行一致条件ではなく、旧captureの内部整合・由来を検証し、現行状態との差を時点付きで明示する調査へ導く。 |
| `pre-isolation-outside-l1-semantic` | historical `CURRENT_HEAD=3df81ad`の4対象L1承認・relation/SHAを現在の意味と比較。current work entry, boundary, anchor source, inventoryが一致しない。 | 旧4 L1 snapshotが当時のauthority inputだった記録として価値がある。owner `SCF-B-0036`; downstream consumerなし. | **導き直し**。旧approved relationと現行L1 candidateの差を比較し、現行PO判断後のWeb/Web-OS Vision分類を別に表す。 |
| `rdp001-delegated-doc001-atom-030` | 旧Concept v4.1と4対象L1 revisionを現在のauthority evidenceとしてdigest pin。v4.1 path不在、L1/boundary digest stale。 | 旧atom化のsource provenanceと対象revisionの履歴。`SCF-B-0032`は当該研究束をupstreamとして参照するBinding。 | **導き直し**。旧要求意味・revisionを保持し、各successor対象と層へのsource traceを検査する。意味変更・採否はしない。|
| `rdp001-outside67-followup-069` | OUTSIDE67-PATH-052/056を旧単一candidate pathのcounterpartとしてpin。両pathのprovenanceが一致しない。 | 旧source pairのlineageは残る。`SCF-B-0069`はこの研究束をregistry上のartifactとして束縛し、他Bindingからの下流upstream参照は検出されなかった。 | **導き直し**。9/25判断recordのpath mapping（:52-53）に沿ってHARNESS/OSの分割先を別々のcounterpartとして照合する。旧単一pathからowner/identityを推測しない。 |
| `rdp001-outside67-governance-crosswalk-followup-083` | historical PATH-038 archive counterpart hash equality claim。現行sourceのbytes/hashはarchiveと異なり、relationも等価でない。`E_COUNTERPART`と`E_CURRENT_COUNTERPART_RELATION`。 | archive snapshotとcurrent counterpartの差分証拠。`SCF-B-0083`は本research bundleのregistered ownerで、下流upstream参照は検出されなかった。 | **導き直し**。旧同一性主張を維持したまま、historical/current source driftとrelationを別々に比較する。#2136監査:98,113,123を参照。 |
| `rdp001-outside67-web-webos-l1-anchor-0121` | 旧4対象boundary digestを前提に11 Web/Web-OS L1 row anchorsを現行候補へ接続。boundary input digestが不一致。 | source pathと過去L1 anchorの出典link。現行L1文書は存在するがVision authority状態。owner `SCF-B-0121`; downstream consumerなし. | **履歴保持・検査退役候補**。9/24 PO判断:47によりWeb/Web-OSの旧L1要求anchor検査をやめ、4 source snapshotと11 anchor recordを履歴保持する。owner `SCF-B-0121`; downstream Binding consumerなし。将来はownerの検査義務・oracleを記録保全先へ移す。 |
| `rdp001-web-webos-vision-asset-semantic-0124` | 旧Vision 35候補×代表旧asset 12件のsemantic connection候補。current product-boundary digestが不一致。 | Vision sourceとlegacy assetのcandidate-only対応関係を保存する。owner `SCF-B-0124`; downstream consumerなし. | **導き直し**。35 Vision candidate×12旧assetをcandidate-only evidence relationとして再検査し、digest/所属から意味linkを作らない。 |
| `rdp001-web-webos-vision-coverage-0091` | 29 parent span / 35 candidate recordのcoverage、旧product-boundary入力、154 connection matrix。current product-boundary digest mismatch。 | Vision source coverage・未接続行のhistoryとして使える。owner `SCF-B-0091`; downstream consumerなし. | **導き直し**。29 span/35 candidateのmatrixをVision候補coverageとして保ち、phase/asset unknownを維持する。要求coverageにはしない。 |
| `rdp001-web-webos-vision-semantic-atoms-0088` | Web/Web-OSの旧Vision 9 spanをatomized/composite候補化。parent `SCF-B-0080` lineage digestが違う。 | 9 Vision spanのsource lineageと、未分解複合行の保全に有用。owner `SCF-B-0088`; downstream consumers `SCF-B-0091`, `SCF-B-0124`. | **導き直し**。9 spanのatom/composite候補とparent lineageをVision研究として維持し、複合行を要求やownerに分割しない。 |
| `rdp001-web-webos-vision-source-0080` | 旧Vision 29 spanを現行Web L2 9件/Web-OS L2 6件へのrequirement source relation候補として固定。現行source status/relationが一致せず`E_CURRENT_SOURCE`。 | 旧Visionから現行文書への起源追跡。owner `SCF-B-0080`; downstream consumers `SCF-B-0081`, `SCF-B-0084`, `SCF-B-0088`, `SCF-B-0091`, `SCF-B-0124`. | **導き直し**。旧Vision 29 spanのsource lineageを現行Vision資料へつなぎ直し、5下流研究束の候補入力を保つ。requirements linkは作らない。 |
| `legacy-implementation-residual-0126` | 固定BASEの四製品research union・overlapを入力に67件のimplementation_source残余を候補分類。Bindingの旧source closureが現行boundary/L1 revisionと合わず`E_BINDING_UPSTREAM`。 | 例: `LEGACY-ASSET-005BBC344AC83176CAE6`のsource span `screen-applicability-store.ts:247-264`。owner `SCF-B-0126`; downstream consumers `SCF-B-0141`, `SCF-B-0142`, `SCF-B-0145`, `SCF-B-0149`. | **導き直し**。旧union/overlap/new67の分母とsource identityを歴史として保持し、現行機構/candidate relationを別revisionでasset別に調べる。formal owner・admissionは作らない。 |
| `legacy-overlap-reconciliation-0144` | 固定main 429件と#2078 fixed HEADの36件比較。upstream row schemaは`path/sha256`のみを許し現行note付き契約と違う。背景には旧四製品比較範囲・LABO除外がある。 | `LEGACY-ASSET-08F8688895B787BD3D5C` / `src/cli/commands/rename.ts:14-113`はsource-specific resultとgeneric fallbackのmethod差の例。owner `SCF-B-0144`; downstream Binding consumerなし。 | **導き直し**。36件のsource identityと両側の研究方法差を維持し、semantic conflictは双方に独立したsource-specific interpretationがある場合だけ検査する。 |
| `legacy-test-design-worker-workflow-0148` | fixed BASEからPHCAP-07 worker/workflow test-design 52件の候補分類。non-upstream Binding core (`d334e2eb…`対`11fee501…`)が異なり`E_BINDING`。 | `LEGACY-ASSET-CDB0C680878837FF2E36`と`LEGACY-ASSET-6F5F69296B4AB47B96E5`のarchive spanを個別記録。PHCAP-07はcurrent inventoryでcandidate_only。owner `SCF-B-0148`; downstream consumers `SCF-B-0149`, `SCF-B-0150`. | **導き直し**。test-designの検証義務とworker/runtimeの実行責務を別relationとして現行境界へ照合。phase/owner admissionは生成しない。 |


## Goal 5から加えた3件

Goal 5の監査は、137 validatorの修復後も意味・契約不一致を解消できない3件を失敗のまま保持した。結果manifestの該当行は0126が22行、0144が28行、0148が51行で、いずれもbefore/afterがfailである。Goal 5判断記録（[findings](scaffold-validator-goal5-findings-2026-09-25.md):18-20）を読み、旧source identity、旧4対象L1 exact-SHA approval（[9/17 decision](../../decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md):21-32）、current PO decision、Binding ownerと直接downstream pathを個別照合した。

- **0126**：失敗条件は固定BASE `5562f04…`と8 research bundleのexact upstream closure。例としてasset `LEGACY-ASSET-005BBC344AC83176CAE6`は旧`src/design/screen-applicability-store.ts:247-264`を指し、HARNESS capability evidenceとWeb presentation applicabilityの候補衝突を記録する。現行product-boundaryは製品属性と機構責務を分ける。owner `SCF-B-0126`のclassification research JSONLは0141/0142/0145/0149が参照し、0145はinventoryも参照する。旧67件と重複53の再現可能なsource調査を残すため、current relationのasset別再導出を提案する。
- **0144**：失敗条件はstrict upstream row schemaと意味範囲の双方。36件はold main source-specific candidateと#2078 fallbackのmethod/state差であり、監査自身がsemantic conflict 0件とする。例のasset `LEGACY-ASSET-08F8688895B787BD3D5C`は旧`src/cli/commands/rename.ts:14-113`を参照する。SCF-B-0144のdownstream Binding upstreamは検出0だが、human candidate reviewの比較証拠という役割が残る。source/method identityとcurrent authority revisionを分けて再導出する。
- **0148**：固定BASEは`8a9fdc9…`。52件はPHCAP-07を含むbootstrap選択で、47件のHARNESS+OS split、3件HARNESS、2件根拠不足はいずれも候補でありformal owner/admissionは0。例の旧sourceはasset `LEGACY-ASSET-CDB0C680878837FF2E36`のUniversal Workflow test-design `:18-23`と、`LEGACY-ASSET-6F5F69296B4AB47B96E5`のworker benchmark test-design `:22-25`。現在のPHCAP-07もinventory `:439-457`で`candidate_only`。owner `SCF-B-0148`の研究JSONLは0149/0150、selection manifestは0150が参照する。test artifactの検証責務とruntimeの実行責務を分けて調べる。

3件とも退役候補にはせず、`rederive`とした。旧比較を履歴として正確に保つ研究問いが残り、0144を除く2件は下流Bindingもsourceを消費している。将来この調査束の代替を提案する場合は、owner/downstream全体の役割・義務・接続・consumer・oracle・negative case移管を検証する。今回その操作はしていない。

## 判断の根拠

2026-09-24のPO判断はWeb/Web-OSのL1/L2/L11を要求層から外してVision材料とする（[decision record](../../decisions/concept-requirement-po-decisions-2026-09-24.md):37-47）。9/25判断はOS候補のLABO/Intelligence移管と機構別candidate配置を選び、移管後候補は移す前のdraft stateを維持する（[decision record](../../decisions/mechanism-placement-po-decisions-2026-09-25.md):20-36,49-68）。それらの判断は、これら32研究束を退役させる決定ではない。

旧HELIXの対応前例は、[旧L12 hybrid recognition candidate inventory](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md):244,257。researchを`historical/context`に置き、採択する行だけをcurrent authorityへ再記述し、旧authority前提のopen itemを再routeし、完了履歴はhistoricalに保つ。台帳[LEGACY-ASSET-2BF51AD4471985920B94](../../legacy-asset-disposition.jsonl):985は`Historical`/`historical`、disposition `unresolved`である。これは扱いの前例であって、現行の退役規則やPO判断を新設する根拠ではない。

旧資産の個別調査sourceとconsumerは、旧分類・PHCAPの各Goal1監査、およびGoal 5 findingsと各旧source asset行を起点にする。旧archive本文は読むだけとし、source、runtime、test、CI、hook、adapterは実行していない。Goal 6はvalidator条件、inventory、bindingを変更せず、現在の始末案を比較する調査記録である。

## 適用した既存PO判断と方針

- **旧要求の保持と再配置**：2026-09-15のPO指示「旧要求はそのまま使いたい」に基づく[無損失carry-forward方針](../../legacy-requirement-carry-forward-policy.md):4,10-11,19-25,64-67は、旧要求の意味を削らず原文・revision・digestを保持し、新しい対象・層へ配置し、successorへのtraceと未移管条件を残す。9/24の[全体方針](../../decisions/concept-requirement-po-decisions-2026-09-24.md):52は、旧HELIXで実現されつつあったものを採用すると記録する。delegated-doc 3件はこの決定に沿い、意味の採否を再質問せずtrace検査へ導き直す。
- **旧配備研究の置き場所**：[Concept](../../../concept/helix-concept.md):241はサービス⑥をリリースとし、:259は配布物の生成・配布・切戻しをOSが運転すると定める。旧配備assetの検査はこの現在の境界への出典関係を調べる形へ導き直す。ここから新しい配備要求の採択は生成しない。
- **Web/Web-OS Visionの扱い**：9/24の[PO判断](../../decisions/concept-requirement-po-decisions-2026-09-24.md):42-47は旧Web/Web-OS L1/L2を要求から外してVision資料とし、要求は将来のPO指示から起こすと定める。0080/0088/0091/0124のsource lineage・atom候補・Vision coverage・candidate-only asset relationはVision資料の研究として続ける。0121だけは旧L1要求anchor検査を退役候補とし、snapshot/anchor記録を保つ。将来要求を作る場合は新しいPO指示とsource revisionで始める。

### 外部監査の記述の確認

前回reviewが引用した「判断に使う研究束だけを現行要求へ対応させればよい」という外部監査の方針は、このrepository内で根拠を確認できなかった。`docs/`内のMarkdown・JSON・JSONLで「外部監査」「external audit」「判断に使う研究束だけ」を検索した。外部監査roundや評価に関する別件の記録は見つかったが、この方針を述べる権威ある記録は確認できない。したがって、この引用を本記録の判断根拠にしていない。対象term・scope・別件hit例はGoal 1由来29行の`external_audit_claim_check`に記録し、Goal 5追加3行にはこのreviewer attributionを適用していない。


この記録から退役実行、validator・inventory・Binding変更は行わない。退役候補のvalidatorは0121だけで、現時点では未実行である。各提案を実施するPRでは、最新base・正式consumer・Scaffold Binding全体・置換記録を再確認する。
