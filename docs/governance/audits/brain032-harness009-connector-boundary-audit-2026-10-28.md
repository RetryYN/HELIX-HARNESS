# BRAIN032・HARNESS009・OS002の接続境界照合（2026-10-28）

対象依頼: WR-CLAUDE-H009-BRAIN032-CONNECTOR-CHECK-3547-20261028-76（Issue #3547）。本書は静的監査記録であり、要求採用、設計変更、実接続の資格・配送・完了を生成しない。
調査revision: `6954c5ba09993105d80d0d395837cf8a8d217a43`。明記した固定source以外はこのrevisionを指す。

結論: 既存の採用済みL2接続要求はあるが、調査範囲で032/009と009/OS002の個別端点契約pair・登録を確認できず、「コネクタ経由で疎結合」の成立証拠はない。
H009によるBRAINのprivate runner呼出しと、OS002によるH009のprivate型aliasは、**設計上の直接結合**である。現在の実装が機構間で実際にprivate呼出し・配送を行っているとの判定ではない。

## 出典とauthority

以下の略号とJSON Pointerを組み合わせて対象を特定する。

| 略号 | repository内path |
|---|---|
| B3 | `docs/helix-brain/L3-requirements/functional-requirements.json` |
| B4 | `docs/helix-brain/L4-basic-design/template-semantic-supply.json` |
| B5 | `docs/helix-brain/L5-detail-design/template-semantic-supply.json` |
| H3 | `docs/helix-harness/L3-requirements/functional-requirements.json` |
| H4 | `docs/helix-harness/L4-basic-design/product-template-application.json` |
| H5 | `docs/helix-harness/L5-detail-design/product-template-application.json` |
| O4 | `docs/helix-os/L4-basic-design/project-template-trace.json` |
| O5 | `docs/helix-os/L5-detail-design/project-template-trace.json` |
| C3 | `docs/helix-connect/L3-requirements/functional-requirements.json` |
| C4 | `docs/helix-connect/L4-basic-design/connection-registration-descriptor.json` |
| C5 | `docs/helix-connect/L5-detail-design/connection-registration-descriptor.json` |
| G7 | `docs/governance/audits/g7-connect-source-identity-inventory.json` |

[BRAINの9/28 PO判断](../decisions/helix-brain-requirements-po-decision-2026-09-28.md)は、固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2本文（SHA-256 `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`）の019・022・030をconnection/1.0として採用している。
`docs/helix-brain/L2-requirements/brain-requirements.md` の当該3節は、固定採用節と調査revisionで同一である。draft/candidate metadataやG7の行欠落を理由に未採用とは扱わない。
019は製品Coreへの候補供給、022はrequired input→HARNESS-L2-009、030はBRAIN→COREの照会・受領、接続identity/版/互換、schema、scope/correlationと受領先009を既に要求する。
032の採用は[10/10判断](../decisions/brain-template-contract-032-po-decision-2026-10-10.md)を参照し、同L2本文の032節は019/022/030の版付きhandoff確認も求める。
B5/H5 `/authority_boundary` の限定scopeと固定親を適用する。BRAIN032の14 pairは `47354be8c1ef225dd7eacffe390d268c0dfee784`、CORE009の11 pairは `e509851ce7c27c09f85cb1a6e3b9a1d231885de3` に束縛される。個別detailの未閉鎖と実装未成立は別に読む。

## 受渡しの棚卸し

分類は「コネクタ経由で疎結合」「直接結合」「未定義」。未定義は下記の個別接続binding・登録が未確認の意味であり、業務意味自体の不在とは限らない。
以下は監査用の受渡し単位であり、独立connection数・新たに必要なconnector数ではない。返却と要求を同じ行にまとめたものもある。

| 項目・送り手→受け手／材料 | L3・L4・L5の具体的根拠 | 分類・理由 |
|---|---|---|
| 1 B032→H009: 15項目の汎用descriptor意味、identity/版、出典、定義不足・未決材料 | B3 `/requirements/0` (032-F01)、`/requirements/1` (F02)、`/requirements/2` (F03)。H3 `/requirements/23` (009-F01)、`/requirements/27` (F05)、`/requirements/28` (F06)。詳細は次の2〜4 | 未定義。意味の所有と製品適用は分離されるが、個別接続identity・両端契約版pair・登録との対応は未確認 |
| 2 B032 source occurrence→H009 ApplicationInputBinding: 元source一件と配列位置pair | H4 `/selected_brain_source_occurrence_contract`、同 `/projection`、同 `/qualification_boundary` | 未定義。局所的な純DTO mapping。SupplyInput全体の輸送、資格移送、ApplicationInput全体の組立てを含まず、connector成立の証拠にはならない |
| 3 B032 public F02 Comparison→H009 F06: 選択knowledge・原source・pointerの対応と定義不足根拠 | H4 `/selected_brain_definition_source_contract/carrier`、同 `/ordered_contract`。H5 `/functions/6/brain_definition_source_read_binding`、同 `/brain_definition_source_return_writer` | 未定義。既存public Comparison/Axesを保持し、private DescriptorDefinitionAssessment/DescriptorTargetCallObservationをimportしないと明記する。private結合と一括扱いせず、公開材料と接続binding未成立を区別する |
| 4 H009→BRAIN F03要求／BRAIN→H009返却: 選択field入力と同call F03Evaluation | H4 `/selected_brain_field_definition_application_contract/logical_private_ports_and_types`、同 `/statement_reader_contract`、同 `/operation_effect`。H5 `/selected_brain_field_definition_application_detail/private_types/brain_runner_return`、同detail `/writer_and_call_contract/call_order/2`。B5 `/field_value_applicability_detail/public_and_private_callers/private_full_runner` | 直接結合。private runnerのsymbol・3-member返却whole・内部memberに依存。logical portであり、process/RPC/wire/deliveryを成立させる記述ではない |
| 5 H009→BRAIN owner: knowledge定義/版不足のBackflow材料（identity、出典、影響field/obligation、未完範囲） | H3 `/requirements/27`。H5 `/functions/6/brain_definition_source_read_binding`、同 `/brain_definition_source_return_writer` | 未定義。返却責務はあるが、個別の配送契約・技術receiptは未確認。ticket発行はOSの責務のまま |
| 6 H009→OS002: general proposal publicationと元RecordTraceInputの独立受領 | H5 `/general_proposal_exchange_detail/private_types`、同 `/publication_entry`、同 `/publication_writer`。O4 `/contracts/3/core_proposal_receiving`。O5 `/core_proposal_receiving_detail/fixed_existing_type_aliases` | 直接結合。CONNECT receiving boundaryを記す一方、OSがCOREのprivate型を直接pinする。OSからCOREのprivate関数を呼ぶ記述ではない |

項目4のB5 `/field_value_applicability_detail/public_and_private_callers/private_full_runner/private_return` は `closed_private_caller_result` で、`supply_analysis`、`descriptor_target_call_observation`、`field_value_evaluation` の3 memberだけを許す。
H5は `run_descriptor_target_flow_with_field_value_detail(raw: RawValue)` を条件成立時に一度呼び、wholeを保持し、実memberの `field_value_evaluation` をF03Evaluationとして取り出す。cast・再構築しない条件も相手のprivate返却shapeへの依存を解消しない。
H5 `/selected_brain_field_definition_application_detail/private_types/statement_profile/typed_private_records/domain_type_imports` はB4のF03BRawValue/PresenceRawとB5 `/type_contract/types/MeaningFact` を固定source `051fff3fffb4801f638c0af2f9f61fc60f184110` から参照する。
MeaningFactの当該定義にはvisibility宣言がなく、aliasだけでprivate型とは判定しない。明示privateのrunner・返却wholeへの依存とは分ける。
項目6の4 aliasは `CoreProposalPublication`、`PublicationSourceCarrier`、`PublicationRecord`、`GeneralProposalView`。各O5定義のkindは `same_candidate_cross_mechanism_private_type_binding`、sourceはH5 `/general_proposal_exchange_detail/private_types/<型名>`（固定source `929a862c60309502e2b5935fadabbf290fc36185`）。
O4はCORE ownerが形成したpublicationをCONNECTが渡し、OSはCORE private関数を呼ばず独立照合すると明記する。H5のprivate publication生成自体もdeliveryをeffectに含めない。[PR #3768](https://github.com/RetryYN/HELIX-HARNESS/pull/3768)はこのpinの作業来歴であり、接続資格や過去の障害証拠ではない。

## CONNECTへの登録・互換との対応

[G7棚卸し本文](g7-connect-source-connection-inventory.md)とG7はsource `680dcaa123591947679210ce2f1515794f3f14f3` の293 identityを扱う歴史的なsource inventoryであり、live registryではない。
G7 `/identities/13` (BRAIN019)、`/identities/16` (BRAIN022)はCONNECT L2-001/002/003/005/006へ対応する。`/identities/48` (HARNESS009)はunitで `connect_candidate_ids=[]`、`/identities/63` (HXT-CORE-02)は別のCORE/OS接続の汎用対応である。
030/032の一致行はこのG7にはない。これを採用済み030の不在や、本項目6が自動的にHXT-CORE-02と同一である根拠にはしない。
[CONNECT L2](../../helix-connect/L2-requirements/connect-requirements.md)「G7接続棚卸しidentityとの対応」、G7、CONNECT L3/L4/L5を調査したが、上記private F03呼出し・proposal publicationの具体的な接続identityと両端契約revision pairを束縛した登録は確認できなかった。他repositoryや実環境に存在しないとの全称主張ではない。
B4/B5/H4のCONNECT要求ID参照は0。H5の1参照は `/wire_codec_contract/source_basis/22/source_value/evidence_refs/4` の `original.HELIXCONNECT-L2-002.L2`（numeric carrier根拠）で、この接続の登録ではない。CONNECTという語の有無だけでは判定しない。
C3 `/requirements/0` (001-F01)、`/requirements/1` (001-F02)は端点所有者・意味契約版・adapter/transport版・状態等の登録を要求する。
C3 `/requirements/2` (002-F01)、`/requirements/3` (002-F02)は参照互換照合と変更時stale、`/requirements/5` (003-F01)は契約束縛envelope、`/requirements/11` (006-F01)は片側交換時の互換を定める。
C4/C5は汎用論理descriptor設計である。C5 `/scope/boundary`、`/qualification_boundary`、`/implementation_readiness`、`/unclosed` は、実endpoint資格・owner authority・schema/codec・registry・transport等が未成立である範囲を明記する。汎用設計の存在を個別登録・通信実行へ読み替えない。

## 直接結合を解く場合の端点契約候補と影響

次は既存のC3契約へ具体的な受渡しを対応させるための候補であり、新しい要求・gate・transportの採用ではない。HTTP/RPC、新サービス化、別process化は選択していない。

| 対象・設計owner | 各ownerが公開すべき最小の意味契約候補 | 変更候補／維持すること |
|---|---|---|
| 項目4: BRAIN owner、HARNESS/CORE owner | BRAINは選択field要求とF03評価返却の公開schema identity/版、必要入力・source/field対応・根拠・未決/失敗意味を所有する。COREは製品側要求の形成と返却材料の解釈を所有する | B4/B5の公開端点契約、H4のlogical port、H5のprivate runner/whole pinをowner公開schemaとadapter mappingへ対応させる候補。BRAINのF03判定・unknown/negative・provenance、COREの製品適用判断は移管しない |
| 項目6: HARNESS/CORE owner、OS owner | COREはpublicationの公開schema identity/版・source/evidence対応を所有し、OSは受領入力・独立検証・受領結果を所有する | H4/H5 publication境界とO4/O5受領aliasを公開契約へ対応させる候補。OSは相手private型を直接importせず、自分の受領型へ照合する。COREの提案意味、OSのselected/used集合・登録・authorityは維持する |
| 両対象: CONNECT ownerと両端owner | 接続identity/目的、両端owner・方向・scope、各意味契約identity/版・互換範囲、別管理のadapter/transport版、状態・stale再照合。operation/correlation、期限、冪等キー、結果・技術receipt/trace、未完の返却先、適用するSECURITY/data-use参照 | CONNECT側は登録・互換・配送の技術契約を束縛する。成功配送から意味の採否、適用、受入、完了を生成しない。002-F01の参照照合と実送信適格性を混同しない |

現在のBRAIN unit `helix/helix-brain/units/HELIXBRAIN-UNIT-DESCRIPTOR-DEFINITION/src/descriptor_definitions.py:305–345` は `compare_values_and_applicability`→内部評価委譲→`values_applicability.py::evaluate_field_values_detail`→既存4-member public Comparisonという経路である。
調査revisionのunit全treeで `run_descriptor_target_flow_with_field_value_detail` のsymbol一致は0であり、3-member private full-runnerはL5設計宣言と実装を区別する。同revisionの `helix/` ではH009 runtime sourceも確認できず、他repositoryの不存在は主張しない。
接続境界の再導出だけを根拠に、実装済みF03評価・public Comparisonの振る舞いを変えない。後続は公開端点・adapterの責務と承認済み設計を先に対応させる。本監査ではsourceや設計を変更しない。

## L2と統制への返却

新規L2要求の追加が必要と確定できる証拠は今回得ていない。採用済み019/022/030と032のhandoff条件へ、項目4の具体的入出力・公開端点をまず対応付ける。G7への行追加だけでも設計のprivate結合は解消しない。
項目6はHXT-CORE-02等の既存接続との目的・方向・scopeの同一性をCORE/OS ownerが確認し、CONNECT ownerが個別登録との対応を示す必要がある。
既存採用範囲を越える別の接続目的・業務意味が必要となる場合だけ、未対応の意味と既存identityとの差を**PO判断候補**として統制へ返す。候補IDや追加要求を推測で採用しない。単なる技術binding整理を理由に新しい人間承認手続きを設けない。

## 旧source・失敗との対応と調査限界

[9/26 PO判断](../decisions/labo-core-engine-po-decisions-2026-09-26.md):62–70は、エンジン間の接続要求ごとにコネクタを置き疎結合にする方針と、L2で接続一覧を持つ整理を記録する。
旧asset `LEGACY-ASSET-BD13CC67526B48D461F9`、`archive/legacy-generation-2026-09-14/root/docs/adr/ADR-003-runtime-adapter-boundary-subscription-cli.md`:8–45を直接参照した。本文SHA-256は `ffbe51c4a34cdaf4c072393a0864d916c7a4e1d6eaf4788bb0260e8280291f37`。
A-71（同14行）は、adapter境界未固定によりprovider認証前提がL4/L5へ漏れた具体的失敗である。保持する点はowner境界とadapterによる変更隔離。変更する点はprovider起動方式の隔離から、機構間の公開端点契約への依存へ意味を再導出すること。理由は今回のprivate runner/型pinである。旧CLI・認証方針や旧実装は移植しない。
[旧対応を整理したCONNECT L1](../../helix-connect/L1-planning/connect-intent.md):45–49と、同L2:262–267、[V字工程PO判断](../decisions/harness-v-valley-process-po-decisions-2026-09-26.md):41–60も照合した。後者は高リスク変更の密結合と重い全量検証の失敗を記録するが、今回の型結合から大改修に至った特定incidentを識別しない。
検索範囲は上記旧ADR、CONNECT L1/L2、現行governanceの判断・監査記録、[既存F02/Core境界監査](brain032-f02-core-consumer-boundary-2026-10-21.json)。直接結合→大改修の個別Issue/PRは特定できなかった。A-71を大改修の実証に置き換えず、派生repositoryの個別事例も未特定として返す。未発見を根拠に予防規則は足さない。
既存F02/Core監査が参照する旧asset `LEGACY-ASSET-603D0E8D8193914F4AC0`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md` §§0–1）は公開振る舞い・failure・consumer・oracleの比較を求める。名称類似での型統合は採らず、意味と観測可能な結果を保つ点を維持する。

## 検証範囲

上記path・JSON Pointer・固定source、L2採用節の同一性、現行symbol、文書参照を静的に照合した。成果差分は本監査1ファイルだけとし、L2〜L5とsourceを変更しない。
実endpoint登録・通信・配送・互換operation、旧runtime/test/CIは実行していない。この監査からBRAIN032全体、L8、OSの受入・完了を宣言しない。
