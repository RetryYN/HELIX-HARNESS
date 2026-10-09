---
title: "HELIX-HARNESS Stage 1 L6関数設計"
layer: L6
status: draft
owner: HELIX-HARNESS
parents:
  - HARNESS-L2-010
  - HARNESS-L2-011
  - HARNESS-L2-023
paired_l5: ../L5-detail-design/stage1-harness.md
base: main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`
upstream_detail_revision: main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`
---

# HELIX-HARNESS Stage 1 L6関数設計

本書は固定3親のStage 1 L4契約に対するL5技術候補を、関数境界と内部評価へ具体化する。下表のmain `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`とpath別SHAは、このL6草稿が作られた時点の固定source snapshotとして保持する。このpairの当時の入力sourceは§1.1の履歴表に記録する。今回の補助traceの作業起点と入力L5/L8は§4.1に記録する。このL6/L7草稿は未実装・未実行で、製品登録、実運用、外部作用、合格を主張しない。

## 1. 固定sourceと境界

| source | 固定revision / SHA-256 | 用途 |
|---|---|---|
| Stage 1 L4 | main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `25fbd104fd47f39d22f542664e57fd44a440af8904e11b2f0b397ac6606b6cfb` | 固定3親のL4契約。 |
| Stage 1 L5 | main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `a0ed72f672606aee19e0124ee54ce47f6b409ab2e93b81cff1824f7c9cf7a92d` | 10 API候補とpayloadの固定source。 |
| Stage 1 L8 | main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `9eadffc05150c01114ff29ba0fb2d28449b927e06f5565fbb86510f59be89d26` | 7887時点の269合成fixture snapshot。 |
| Stage 1 L9 | main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `6cc4bc3ac56b8d1d94e05ddc4dda71c35df2941aab39e65fb9d43cda2deb36da` | 既存20 verifier/caseの範囲。 |
| Common Kernel L4 | `docs/helix-harness/L4-basic-design/common-kernel.md`; main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` | 7887時点の固定参照snapshot。K1/K2/K3/K5等の意味は当時のsnapshotであり、現行参照として扱わない。 |
| Common Kernel L5 | `docs/helix-harness/L5-detail-design/common-kernel.md`; main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `702a50b82fe7685198539f6a51f7203b72f2adef8edb08f8ce81f677b57a42f0` | 7887時点の固定参照snapshot。 |
| Common Kernel L6 | `docs/helix-harness/L6-function-design/common-kernel.md`; main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `0c11e55342f983d278a02ac4786178386bf8beefdcc824333ef0c5a93f5000b0` | 7887時点の固定参照snapshot。 |
| Common Kernel L7 | `docs/helix-harness/L7-unit-test-design/common-kernel-unit-test-design.md`; main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `89152ee3b58c291a88b7108fd0437c1349265eb85607c2da1f617d63ac3572c1` | 7887時点の固定参照snapshot。 |
| Common Kernel L8 | `docs/helix-harness/L8-detail-verification/common-kernel-detail-verification.md`; main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `6f598a9a9fd0ab58a30ec26bb290f958e2807a8ceb7fb7c368e0ecf4af1d876e` | 7887時点の固定参照snapshot。 |
| Common Kernel L9 | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`; main `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`; `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` | 7887時点の固定参照snapshot。 |

旧L7 snapshotにある`b95f9706bbf27a6d9b09041890ef0f0602bbdcb3`等のCommon Kernel revisionと上表のmain `7887edd6b82a4530d3b6a92bb5c3c7a2da5a3d44`は当時の履歴参照として保持し、現在sourceとして再利用しない。§1.1のCommon Kernel path別SHAも当時の履歴値であり、現行参照を主張しない。Stage 1 product L5/L8とcommon-kernel L5/L8は別文書である。各参照はpath別SHAで固定する。L6/L7の直接技術範囲はK1/K2/K3/K5の既存契約に限る。K6/K7は不透明なowner境界として結果型を区別して保持し、内部処理を実装・検証したとは主張しない。K4/G3の製品層参照も本pairへ詳細化しない。旧HELIX資産の12行はL5 §2と原台帳を起点に照合し、台帳のconsumer/failureを推測していない。

### 1.1 当時の入力source snapshot（main d736f99）

次表は旧追補作成時点main `d736f99edc4f43b6cd912b9db09d545a5e769e21`の入力bytesであり、本追補の現行参照ではなく履歴として保持する。上表の7887 snapshot値も上書きしない。この表と上表は当時の参照記録であり、現行参照ではない。今回の補助traceが使うL5/L8の作業起点・SHAは§4.1に記録する。

| 入力source | main d736f99のSHA-256 | L6で読む範囲 |
|---|---|---|
| Stage 1 L4 `../L4-basic-design/stage1-harness.md` | `25fbd104fd47f39d22f542664e57fd44a440af8904e11b2f0b397ac6606b6cfb` | 親AC、unit path、owner/operation境界。 |
| Stage 1 L5 `../L5-detail-design/stage1-harness.md` | `dc647e429ee99e6232509837cb89aa6ed451f566922dd19428ecb3f9c21851db` | 10 API候補と配置候補。 |
| Stage 1 L8 `../L8-detail-verification/stage1-harness-detail-verification.md` | `00bdb7d745e7688ccea43c5d11c9681c7d41fc7cbfeb96fa03ff00728a5bd166` | 269 fixtureの変異・主結果・構造assertion、配置setup 2件。 |
| Stage 1 L9 `../L9-integration-verification/stage1-harness-integration-verification.md` | `6cc4bc3ac56b8d1d94e05ddc4dda71c35df2941aab39e65fb9d43cda2deb36da` | 既存20 verifier ID。 |
| Common Kernel L4 `../L4-basic-design/common-kernel.md` | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` | K1/K2/K3/K5の公開契約。 |
| Common Kernel L5 `../L5-detail-design/common-kernel.md` | `3f3867df4e04927fbf05615984654f2994dd76ac71fed0ee420d5edce36a2c69` | APIと値型の境界。 |
| Common Kernel L6 `../L6-function-design/common-kernel.md` | `0127f51bde5ac82c64d34e62ada27f1030c173ad03cfa228ac031702ec57dddd` | Python 3.11+標準ライブラリ候補と現行関数設計。 |
| Common Kernel L7 `../L7-unit-test-design/common-kernel-unit-test-design.md` | `dbe64de862709f2b4a5a4088b593fc86f02d0de76aab01dc169feb9d6c247895` | `unittest`候補と既存test配置の先例。 |
| Common Kernel L8 `../L8-detail-verification/common-kernel-detail-verification.md` | `3d42cdd5ca45174e68cb5786052c2a33f1036198493bca38274c2488f925fa8f` | 既存K1/K2/K3/K5 fixture oracleの境界。 |
| Common Kernel L9 `../L9-integration-verification/common-kernel-integration-verification.md` | `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` | 既存Common Kernel oracle参照。 |

## 2. 旧HELIX由来の保持・変更

対象はL5 §2に固定された12資産。source span/full-file SHA、consumer/failure記録、保持・再導出・置換理由を同じ値で保持する。全12件の台帳状態は`unresolved`、`consumer_refs=[]`、`failure_refs` fieldなし。旧CLI、runtime、test、CIは起動していない。

| Asset / source（archive内path:行） | 全文SHA-256 | 読んだconsumer/failure要素 | 保持・再導出・置換 |
|---|---|---|---|
| `LEGACY-ASSET-9A772391C7FB1298D45F` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56` | `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4` | 3 sub-doc構成、L3→L12/L4 trace、G3/sub-gate/旧CLI運用の宣言。台帳consumerなし。 | functional/business/NFRの分離と要求→検証trace形式を再導出。旧L12/G3/roadmap/CLIは現行L3/L10/L4/L8へ置換し移さない。 |
| `LEGACY-ASSET-F542125805B777D8A56A` `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–166` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | L3 FR+AC、旧L10 UX検証/G3、engineering discipline/no-code-first。台帳consumerなし。 | pair構造だけ現行L4/L9、L5/L8へ再導出。旧gate/role/no-code/model選択はこの親scopeにないため置換。 |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:119–196` | `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | FR-03の4 artifact/12 directed edge、FR-04 PLAN kind/cycle、FR-05 G3 static gateとPO bypassのfail/pass例。AT/testをconsumerと呼ぶ記述は本文上あるが台帳consumer linkなし。 | 宣言境界・failure個別化の形のみ再導出。12 edge、PLAN schema/enum、G3/bypass、source trace implementationは固定親にないため置換。cycle handlingは023のclosure解決不能箇所に限定する。 |
| `LEGACY-ASSET-1B92155F959D7905DD1E` `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:60–69` | `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` | AT-FR-03/04/05 rowsをFR acceptanceとvitest/gateへ結ぶ。旧runner/testはconsumerと記述されるが台帳consumer linkなし。 | AC/case/negative/evidence trace構造のみ再導出。L10 fixed CASEへ対応し、旧AT ID・test runner・合格は使わない。 |
| `LEGACY-ASSET-DB669724249A14A665F0` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–23,29–68` | `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | 3OS/4AI mode/fail-close/KPI等を測る旧CI/test/CLI、NFR-15 server phase等を本文が指定。台帳consumer linkなし。 | 候補値・測定・境界を一行traceする形とexpiry観測の一部だけ再導出。旧IPA、OS/provider matrix、timeout/KPI/server phaseは固定親にないため置換。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:60–70` | `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | preflight/dispatch直前/直後snapshot、effect前blocked、effect後uncertain、issuer/signature/idempotency/CAS/partial-write failure。node artifact writer/OS portが想定consumerだが台帳consumer linkなし。 | L2-011/ NFR-011-02の時点分離を部分再導出。3 snapshot timingは保持。旧issuer/Node/fs/CAS/timeout/物理write設計は置換し、L6に新たに発明させない。 |
| `LEGACY-ASSET-B75E46DBE77592351574` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:60–92,115–142,209–212` | `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | candidate Slice/Module/Bundle registry, qualification, release/channel、rollback、CI closure/unknown、安全 dependency。特定consumerは台帳なし。 | identity/版分離/失敗復帰/安全closureを隣接比較として部分再導出。candidate schema/owner enum/promotion/CI/全体gateは固定親でないため置換。 |
| `LEGACY-ASSET-201EED9C5D6D2FF4D41B` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23–46,64–67` | `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` | BR-001/002/003/004/005/009の独立promotion/収載/成熟度/rollback/safety closure。台帳consumerなし。 | pack scopeや別version境界の比較材料のみ。Slice独立promotion/consumer releaseは別候補意味なので置換。 |
| `LEGACY-ASSET-67ADFAB856D954B3C5D2` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:37–47,58–81` | `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | mutation kill、verification coverage、phase/completion candidate。test rowsは本文の記述のみで台帳consumer linkなし。 | independent fixture構成のみ再導出。candidate AC/gate/promotionは持ち込まない。 |
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–47,84–104` | `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | BR-21 PLAN/skill/model metrics、auto-apply、人判断、skill deletion threshold。consumer ledgerなし。 | scope/sourceを分ける文書構造のみ参考。業務指標、HM-08、承認点、改善行動は今回親にないため置換し、independent business requirementを導かない。 |
| `LEGACY-ASSET-73B5C6C7D281E28EC541` `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-integration-test-design.md:48–75,120–145,182–193` | `c8b287ee4e103255081f00439b7fb2f3dfd259e0fb35a2760b48ad583524fe15` | IT-CONTRACT/ADAPTER/MODULE/STATE rows、G8 workflow/cmd/evidence/exit/defect routing。旧vitest/CLI workflowを記述。台帳consumer linkなし。 | requirement→fixture/negative/evidence対応だけ再導出。旧IT/G8/executable workflow・commands・gateは置換。 |
| `LEGACY-ASSET-829E9C1646D4883C8B99` `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-source-boundary-contracts.md:11–33` | `d0f7281b170a59d4ed26e618bee6b3c3c749c4f2ad1f1e2f8673ce0445f977f9` | lint/analyzer/write-port、authority receipt、snapshot/partial effectの負例群。台帳consumer linkなし。 | source-boundary/effect-negativeの構造を限定的比較に使う。旧write port、auth rules、effect callbackのimplementation/approvalは現行親にないため置換。 |

## 3. 関数IDとL5 API境界

FNはL5のAPI候補と1対1であり、API名/signatureを変更しない。内部`DomainEvaluation`は純粋なprivate helperで、L5の構造化payloadを組み立てる前の比較factのみを保持する。新しい公開union、K1 class/reason、K2 key、authority owner、永続recordを追加しない。

| L6関数 | L5 API候補 / signature | 完全入力時の主結果 | 責務境界 |
|---|---|---|---|
| `FN-HARNESS-01` | `read_pack_declaration(ref)` | declaration observation。既存K1の`Observed<T>`または入力元の既存非Valueを保持。 | 読み取り専用。folder/function catalogをpack declaration扱いしない。 |
| `FN-HARNESS-02` | `validate_pack_contract(declaration, invocation_context)` | `Observed<PackContractComparison>`の`Value` payload候補。 | owner、contract、dependency、scope/oracle、収載/除外、版fieldの純比較。受入/eligibilityを生成しない。 |
| `FN-HARNESS-03` | `resolve_dependency_closure(declaration, operation, selected_sources)` | `Observed<ClosureObservationCandidate>`の`Value` payload候補。 | 固定4分類と明示選択/conditionからclosure観測を作る。未選択sourceのfallback、実装有無由来の判断を作らない。 |
| `FN-HARNESS-04` | `compare_pack_revision(current, declared_range)` | `Observed<PackRevisionComparison>`の`Value` payload候補。 | declared/current refをfieldごと比較し、製品domain版差をK2 `Stale`/`Unknown(conflict)`へ写さない。 |
| `FN-HARNESS-05` | `build_pack_artifact_descriptor(input_refs, pack_revision)` | `Observed<PackArtifactDescriptorCandidate>`の`Value` payload候補。 | declaration指定descriptor/evidence refs、declared digestを保持。実build/署名/保存、digest algorithmの追加なし。 |
| `FN-HARNESS-06` | `compare_pack_replacement(before, after, target_pack)` | `Observed<PackReplacementComparison>`の`Value` payload候補。 | target/非targetのfield差とrecovery refを比較するだけ。rollback/write/replacement successを意味しない。 |
| `FN-HARNESS-07` | `prepare_pack_invocation(pack, caller_input, scope, authority_candidate_refs)` | `Observed<InvocationComparisonCandidate>`の`Value` payload候補。 | callerから受けるのはauthority candidate refs。K3 current-owner resolverがcurrent owner/sourceを再読し既存`PermissionCheck`を別結果として返す。HARNESSはpermissionを発行しない。 |
| `FN-HARNESS-08` | `resume_invocation(invocation_ref, saved_state_ref, caller_key)` | `Observed<ResumeComparisonCandidate>`の`Value` payload候補。 | 同一operation/key/state/scope/authority/expiryの比較。K3 permissionとeffect observationは別型・別入力。resume eligibility/dispatchを生成しない。 |
| `FN-HARNESS-09` | `return_operation_result(invocation_ref, progress_ref, result_ref, evidence_refs)` | `Observed<OperationResultEnvelopeCandidate>`の`Value` payload候補。 | correlation/progress/result/evidence/unfinished obligationを比較。保存/表示/business completeを代行しない。K5の既存event/result型を保持する。K6 `RequiredResult`等が入力される場合もopaque owner型のまま別境界に保持し、本pairはK6 verifier内部を実装・検証しない。 |
| `FN-HARNESS-10` | `measure_declared_nfr(candidate_id, fixture_evidence)` | L5指定のNFR-specific measurement record候補。 | 5固定NFR IDのfixture evidenceを整える。実測、SLO達成、approval、実際のdispatch/effectは主張しない。 |

L5 APIの既存非Value（`Unknown`、`Unobserved`、`NotApplicable`など）は入力元のclass/reasonをそのまま通す。K2 current lookupに実際に渡すsourceは共通kernel契約どおりであり、domain revision mismatchはK2 stale/conflictではない。既存K3 `PermissionCheck`/diagnosticとK5 event/resultはその型のまま保持する。K6 `RequiredResult`等のowner resultやassurance/evidenceはopaque境界のまま保持し、本pairはその内部componentや判定を実装・検証しない。

## 4. private comparison model

`DomainEvaluation`は実装候補のprivate pure helperであり、L5のpayloadを評価する途中状態として用いる。これはAPI戻り値でも保存型でもない。

```text
FieldComparison = match | mismatch
DeclaredFieldState = missing | multiple
FieldFact = 比較可能な左右source refsとFieldComparison、または読取済みDeclaredFieldStateと既存candidate refsを保持するprivate内部値
DomainEvaluation = { facts: tuple[FieldFact, ...], source_results: tuple[existing K1/K2/owner results, ...] }
```

このmodelはL5 §3.2 `FieldComparisonCandidate`と宣言field状態の内部表現である。比較可能な場合の`FieldFact.path`はL5の`field_ref`、`left_ref/right_ref`はL5の比較した左右source ref、`comparison`は同じ`match | mismatch`に対応する。読取済みfield欠落・複数候補は別の`DeclaredFieldState`と既存candidate refsとして保持し、`FieldComparison`の列挙に混ぜない。公開API・payload fieldを追加しない。`FieldFact.path`は内部表示専用の別名ではなく、L5 `FieldComparisonCandidate.field_ref`と同一の既存宣言field参照を指す。pathを正規化・推測・別fieldへ読み替えず、各fixtureの変異対象と同じfield identityをpayloadの`field_ref`に渡す。比較結果はL5どおり`match | mismatch`、読取済み宣言状態は別の`missing | multiple`とし、その他のdomain語彙は`revision_relation=current | stale`、`declaration_relation=consistent | contradictory`、`selection_state=selected | not_selected`、`expiry_relation=before | equal | after`である。これらは完全に読めた入力のValue payload内の観測値で、K1/K2 result class/reasonではない。


### 4.1 FN-HARNESS-04 `PackRevisionComparison`の局所構成

この追補はmain `f020c04f2fb219e319bcc13478f14b41eb881701`を作業基準とする。§1/§1.1の7887/d736時点source記録は過去snapshotとして保持し、今回の入力は本PRの追補後bytesであり、入力L5 SHA-256は`76fa0e803cb71adc74303322fc4ed00eeccc7b43bad6d8eb5a7718b058f95da1`、入力L8 SHA-256は`36337c13910ce635fa2e94f71d068813d4e6e71b7ca657ac0cbfe10331c9e657`である。旧assetの対応表とfull SHAは§2を正本とする。

FN-HARNESS-04のprivate pure constructorは、L5 §3.3の候補recordに列挙されたdeclared/current refs、caller-supplied cause refs、`revision_relation`、および元順序の全`facts` tupleを受けて候補payloadを組み立てる。`revision_relation`はこのconstructorへ渡された解決済み値を保持し、constructorはref equalityからそれを算出しない。cause refsも比較差分から推論しない。L5 `FieldComparisonCandidate`と同じshapeを持つ比較factは`facts`内に保持し、宣言欠落/複数factとの混在順序を崩さない。`field_comparisons`と宣言factの読み取りprojectionはこのtupleを順にfilterするだけであり、元のtupleを分割・再結合して順序を失う処理はしない。

このconstructorは純粋なpayload構築候補であり、K1 `Observed<T>`や公開unionを返すAPIではない。source/current-owner解決、`revision_relation`の供給主体、完全読取の保証、K1 non-Valueの優先returnは既存FN-HARNESS-04 API境界に属するが、L5/L4から具体reader/mappingを導けないため未接続として保持する。既存`DomainEvaluation.source_results`にある非Valueをconstructorへ渡してValue payloadへ変換せず、API側の既存K1 helperがある場合はその既存境界で同じclass/reason/evidenceを先に返す。SUP-005はこの入力側の保持境界を局所的に照合し、constructorのunion返却動作を試験しない。

旧asset `LEGACY-ASSET-B5B5E71B2AF1459D59A1`（旧functional requirements lines 119–196、SHA-256 `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`）のFR-03 trace edge列挙/欠落例と`LEGACY-ASSET-1B92155F959D7905DD1E`（旧acceptance design lines 60–69、SHA-256 `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1`）の要求とcaseの対応は、fact単位を追跡する形の比較根拠として再導出する。旧12-edge graph、fail-close、CLI/gate/test-runnerは移さない。`LEGACY-ASSET-0327D0DF98618D3066FD`（旧source boundary lines 60–70、SHA-256 `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a`）は既存非Value/effect境界を混ぜない比較根拠に限り、旧snapshot/Node writer/CASを本constructorへ追加しない。台帳の`consumer_refs`は空で`failure_refs` fieldもなく、旧consumer実行結果を根拠にしない。

完全読取済みfieldの異同は`FieldComparisonCandidate`等L5指定payloadへ入れる。完全読取済み宣言のfield欠落/複数候補もL5どおりpayload内の`missing`/`multiple`比較factとする。sourceそのものが読めない、または入力が既存K1/K2の非Valueなら、既存結果を保持し比較payloadで包まない。Domain mismatchをK1 `Negative`やK2 conflictにしない。K2 `Stale`は既存ResultKeyでcurrent lookupした結果に限り、同じdomain packのfield差には使わない。

`resolve_dependency_closure`では入力に存在するdependency declaration、選択状態、condition、scope、owner/version rangeをそのまま比較材料にする。分類は実dependencyの実装/利用可能性/成功を推定しない。未選択を選択済みへ変換せず、明示selected sourceが無いfallbackを作らない。unknown source inputは元の既存K1/K2 resultを同じclass/reason/evidenceで保持し、別reasonへの変換や既定reasonを設けない。`Unknown(unsupported)`はL8でstubがその観測能力を提供しないと明示した入力caseに限り、一般fallbackには使わない。

`prepare_pack_invocation`では`authority_candidate_refs`だけをK3へ渡す。actor/environment等のauthority contextやcurrent ownerをHARNESSが補完せず、K3 resolverがcurrent sourceを読む。K3 resultがNegative/Undetermined/Unknown等の場合もその型のまま別componentに保持し、candidate比較payloadのfield値から置換しない。K6 `RequiredResult`等も不透明なowner結果として保持するだけで、内部componentやassuranceは本pairの検査対象にしない。L8の人間delegation proxy各rowは、actor/source/revision/scope/receipt/verification receiptをK3 current-owner/source再読およびK6 receipt verifierへ接続する既存adapter bindingが固定sourceにないため局所保留とし、候補ref欠落を補完せず、許可・receipt completeness・closure完了へ昇格しない。

`resume_invocation`のexpiry/clock関係とpreflight・dispatch直前・dispatch直後のsnapshot比較は合成refだけで行う。比較結果は`Value<ResumeComparisonCandidate>`のpayloadに保持し、eligibility/許可/実dispatch/effect有無へ写さない。共通kernel K7の範囲はgeneration pointer/`EpochToken` fencingのみであり、HARNESSのoperation key/state/revision/expiryをK7へ移さない。expiry A/Bは両candidate値を保持し、このpairでどちらも採択しない。両候補ともexpiry後success count=0という固定L9 NFR条件は保つが、fixtureは実dispatch/effectを行わず、その実在や回数を証明しない。

出力mutation fixtureではAPI入力を固定する。APIのbaseline payloadと、L8が指定する比較用期待candidate/変異candidateとの差をtest harnessで検査する。変異後candidateをAPIが返したとは扱わず、API引数/戻り値へ未定義のoutput fieldを追加しない。

## 5. 旧資産からの保持点と局所境界

12 asset crosswalkは§2を唯一の再掲とし、旧CLI、G3/gate、旧AT/IT、旧OS writer、旧registry/Slice/approval、物理store、signature/secret、実CIやacceptanceを実装境界へ持ち込まない。保持するのは要求→検証対応、宣言fieldの個別化、fixture別の正常/negative、preflight/dispatch前後/後の時点分離、および部分的なscope/identity/version区別である。

初回pack declarationを正本化する物理操作、初期`VersionRegistered`/`ModelNumberDeclared`/`LogDecl`/manifest sequence、writer/assignment authorityは固定L2/L3で指定されていない。L6は初回登録、bootstrap、assignment、物理reader/writerを生成しない。K7をgeneration pointer/`EpochToken`以外へ拡張しない。このpairはK7内部処理を検証せず、当該opaque境界を明記する。人間proxyとowner adapter mappingは局所未決のままL4 §4.4 ownerへ返却する。expiry等号ではA/Bいずれのpredicateも選択せず、両候補が保持するexpiry後success count=0のL9条件を記録するだけで実行・effect evidenceを作らない。この局所未定はpure compare/classificationと別であり、未定でない関数責務を止めない。

製品L5 §5.1に記録した製品L4 §4.4/§5・L9 §5のK7割当てと共通Kernelのgeneration pointer/EpochToken責務の差は、同L4/L9 ownerへの未解決返却事項として保持する。L9のK7接合は未被覆であり、本pairの構造assertionで埋めない。

## 6. L4親と既存L9 verifierへの接続

現mainのL5/L8は固定11 AC、5 NFR、3 business boundaryの既存L9 20 verifierへ対応する。L7 §3には各fixtureと既存verifierの具体対応をすべて載せる。ここでL9 verifierやACを新設・合格扱いしない。

| 関数 | 主なL9既存verifier群 |
|---|---|
| `FN-HARNESS-01` / `FN-HARNESS-02` | `IV-HARNESS-S1-F-010-01`, `F-010-04`, `B-010`（B-010の3 fixtureはFN-02に対応） |
| `FN-HARNESS-03` | `IV-HARNESS-S1-F-023-01`, `F-023-02`, `F-023-03`, `N-023-01`, `B-023` |
| `FN-HARNESS-04` / `FN-HARNESS-05` / `FN-HARNESS-06` | `IV-HARNESS-S1-F-010-02`, `F-010-03`, `N-010-01`, `N-010-02` |
| `FN-HARNESS-07` | `IV-HARNESS-S1-F-011-01`, `F-011-02`, `F-011-05` |
| `FN-HARNESS-08` | `IV-HARNESS-S1-F-011-04`, `N-011-01`, `N-011-02` |
| `FN-HARNESS-09` | `IV-HARNESS-S1-F-011-03`, `B-011` |
| `FN-HARNESS-10` | `IV-HARNESS-S1-N-010-01`, `N-010-02`, `N-011-01`, `N-011-02`, `N-023-01`。L7 §4 SUP-006〜010の補足設計だけがFN-10を担い、§3の269行にはFN-10を割り当てない。 |

## 7. 実装・検証状態

関数、fixture、実行結果は未実装・未実行である。このpair内で旧runtime/CLI/hook/test/CIを実行しない。L7はテスト設計のみを示し、unit suite実行、L8/L9 integration、製品pack登録、owner/effect実証を主張しない。§1と§1.1の7887/d736 source表は履歴snapshotとして保持する。今回の補助traceで参照するL5/L8 bytesは§4.1に記録する。本L6/L7の未実装・未実行状態は、上流sourceがmainにあることから変わらない。

### 7.1 実装候補の観測状態（worktree `codex/harness-stage1-local-implementation`, base `d5bb3455526c816b3af965db239c4b56207a884f`）

この追補は実装候補の実際の状態を記録する。上段の「未実装・未実行」はこのL6/L7設計作成時点の記録として保持する。現候補source `helix/helix-harness/units/harness-stage1/src/stage1_pack.py`には、L6 §4のprivate field-ref comparison fact、明示された`missing | multiple` declaration fact、およびsource result保持を行うprivate `DomainEvaluation` modelだけがある。source/current-owner reader、L5公開API、K1 `Observed` wrapper、K1 ResultKey/PolarityMapping binding、declaration/registration、K3 owner接続、dispatch/effect、永続化は実装していない。5件のprivate helper testはpayload helperに限られ、正式L7 fixtureやL9 verifierへ対応付けていない。

全L8 formal fixture 269件（UT-HARNESS-001〜269）と補助fixture 10件（UT-HARNESS-SUP-001〜010）の実装statusは、L7 §7のstatus表のとおりすべて`not_exercised`である。これは計画分類（pure/private/hold）や5 helper testの件数を実装・合格へ読み替えないための記録であり、L8の19局所保留を変更しない。Observed wrapperの操作key/version/scopeおよびPolarityMappingは固定L5/L6に結び付けがないため、合成せず公開API経路を未達のままとする。L7 fixture単位のbaseline/single mutation/assertionを満たす実行はなく、coverage、L8/L9合格、owner接続、pack登録は未確認である。

## 8. source配置と関数所有の候補

L5 §7のunit候補rootとfile locatorをそのまま使い、API候補10件のsource所在を次のように具体化する。ここでの配置はL6関数設計上の候補で、実ファイル作成、unit宣言、pack identity/type number、型番台帳登録、import可能性、実reader/current-owner接続を意味しない。

| L6関数 | L5 API候補 | 候補source locator | 配置責務と境界 |
|---|---|---|---|
| `FN-HARNESS-01` | `read_pack_declaration(ref)` | `helix/helix-harness/units/harness-stage1/src/stage1_pack.py` | API入口候補はこのmoduleに置く。実宣言source readerのowner bindingが固定L4/L5にないため、実reader接続は未決のままにし、directory/catalogから宣言を合成しない。 |
| `FN-HARNESS-02` | `validate_pack_contract(declaration, invocation_context)` | 同上 | 宣言済みfieldの純比較候補。contract・owner・scope等の新schema、eligibility決定、登録は追加しない。 |
| `FN-HARNESS-03` | `resolve_dependency_closure(declaration, operation, selected_sources)` | 同上 | 既存4分類と明示入力を比較する候補。選択sourceのfallback、cycle policy、外部source readerは追加しない。 |
| `FN-HARNESS-04` | `compare_pack_revision(current, declared_range)` | 同上 | 宣言ref間の比較候補。domain revision差をK2 key/resultへ変換しない。 |
| `FN-HARNESS-05` | `build_pack_artifact_descriptor(input_refs, pack_revision)` | 同上 | 宣言された入力ref/descriptorの組立候補。artifact生成、hash方式、保存、署名は行わない。 |
| `FN-HARNESS-06` | `compare_pack_replacement(before, after, target_pack)` | 同上 | before/afterのfield比較候補。replacement/rollback/writeは行わない。 |
| `FN-HARNESS-07` | `prepare_pack_invocation(pack, caller_input, scope, authority_candidate_refs)` | 同上 | caller入力と既存K3結果を分離した比較候補。permission発行、current ownerの代行解決、dispatchを行わない。 |
| `FN-HARNESS-08` | `resume_invocation(invocation_ref, saved_state_ref, caller_key)` | 同上 | 保存状態/key/expiry等のfield比較候補。resume eligibilityや再dispatchを決めない。 |
| `FN-HARNESS-09` | `return_operation_result(invocation_ref, progress_ref, result_ref, evidence_refs)` | 同上 | result/evidence refsのcorrelation比較候補。保存、表示、業務完了、K5 appendを行わない。 |
| `FN-HARNESS-10` | `measure_declared_nfr(candidate_id, fixture_evidence)` | 同上 | 合成evidence refの測定候補を整える。実測・SLO達成・承認を生成しない。 |

10 API候補は同じ製品source moduleの公開境界候補であり、比較途中の`DomainEvaluation`等は当該module内のprivate helperに留める。L5にない公開helper、別owner module、外部adapter、runtime entrypointを追加しない。`declaration.json`はL5 §7の別locator候補であり、source moduleが宣言やowner状態を書き換える場所ではない。

| 候補path | 責務 |
|---|---|
| `helix/helix-harness/units/harness-stage1/declaration.json` | L4で既に定めるunit declaration項目の候補locator。具体schema値、identity/type number、owner、初回ledger event順は本pairで決めない。 |
| `helix/helix-harness/units/harness-stage1/tests/test_stage1_pack.py` | L7のfixture IDを`stage1_pack.py`候補APIへ結ぶ単体test module候補。 |
| `helix/helix-harness/units/harness-stage1/fixtures/` | 合成入力の候補置場。ファイル形式・命名schema・実pack dataは本pairで定義せず、実案件/credential/実行recordを置かない。 |

配置の保持点は旧`repository-structure.md` §2 (asset `LEGACY-ASSET-FDBA655B1CFF75DCDC0E`, lines 102–120 and §3 lines 122–131, SHA-256 `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262`) のsource/test配置とV-model artifact分離、およびrelease composition RLS-R-03 (asset `LEGACY-ASSET-A2F6A697D7FFFD490B57`, lines 54–58, SHA-256 `336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c`) のpathごとのsingle primary ownerである。旧asset ledgerは両件とも`unresolved`、`consumer_refs=[]`で、`failure_refs` fieldを持たないため、旧実装consumerやfailureを推定しない。旧root layout・Node/TypeScript/Vitest指定は置換し、L5が現行repository-layoutとCommon Kernelから再導出したunit root、Python標準lib候補へ接続する。

言語/runtime/test候補はL5 §7に従いCPython 3.11+標準libraryとする。根拠は、現行Common Kernel L6のPython 3.11+候補および現行source `helix/helix-harness/units/common-kernel/src/common_kernel.py`のfrozen dataclass/type annotation使用、Common Kernel L7 §2の`unittest`候補と`tests/test_k1.py`のtest module precedentである。HARNESSは型付き値の純比較を記述し、外部packageなしに既存K1/K2/K3/K5契約を参照するためこの候補を継承する。これは実行環境やpack dependencyの登録ではなく、Bun/旧Vitest実行を行わない。L6ではmodule/package wiringをまだ確定せず、L7で候補importとtest locationを具体化する。
