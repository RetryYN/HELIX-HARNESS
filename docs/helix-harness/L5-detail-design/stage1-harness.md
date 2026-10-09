---
title: "HELIX-HARNESS Stage 1 L5詳細設計"
layer: L5
status: design_pair_defined
owner: HELIX-HARNESS
parents:
  - HARNESS-L2-010
  - HARNESS-L2-011
  - HARNESS-L2-023
paired_l8: ../L8-detail-verification/stage1-harness-detail-verification.md
base: main `f0ba62ce833463eb5f747ac4b95659ecea49928a`
---

# HELIX-HARNESS Stage 1 L5詳細設計

本書はStage 1の固定3親に対するL4契約を、L6で具体化可能なcomponent、record候補、入出力境界へ分解する。示す型名/API名はL5の設計候補であり、実装済みAPI、pack登録、受入、execution、release authorityではない。対の[L8](../L8-detail-verification/stage1-harness-detail-verification.md)は既存L9 verifierと固定L10 caseへ合成fixtureを対応させる。HELIX-HARNESS製品の契約を共通kernel機構の設計/実装と同一視しない。

## 1. 固定scopeと本文source

対象は承認済み`HARNESS-L2-010`、`HARNESS-L2-011`、`HARNESS-L2-023`のみ。3親はL3/L10固定revision `a77672513325aa9e79f3780af40455361b5d19a8`の6本文全体を参照する。010/011に個別`version_target`を付けず、023の`1.0`を保つ。L3 functionalは11 AC、L10 functionalは12 source case。NFR候補/測定caseは5件、独立business requirement/oracleはなく、L9のbusiness境界verifierは親ごとの3件。

| 文書 | 固定path | SHA-256 |
|---|---|---|
| L3 business | `docs/helix-harness/L3-requirements/business-requirements.md` | `4edda6e444179db716442eaa39bffb8783eb3a8440b87dda5723c54aeb6294f3` |
| L3 functional | `docs/helix-harness/L3-requirements/functional-requirements.md` | `c63150540d6a1dce2ee8e566eaee4d518dd1fa868fd6af3cfb75b7df408f8ac7` |
| L3 NFR | `docs/helix-harness/L3-requirements/nfr-grade.md` | `d291fab1f81b8adb76d6cbfbcb0ca274105338b2e6a7fed3c4dbb1443d2f9bd2` |
| L10 business | `docs/helix-harness/L10-verification/business-verification.md` | `30942ad3414982c13016e7f196cae20f4a6dbe3e53b4175165f2505fb8be92bb` |
| L10 functional | `docs/helix-harness/L10-verification/functional-verification.md` | `9ec6d90c517535550bad43ba56abb6fba0eac0a62a766f9144b5277e69c6946c` |
| L10 NFR | `docs/helix-harness/L10-verification/nfr-verification.md` | `c04ad3e124cac5f659f0a03ff22eea79a8e7ca8b0998921d037b77185a01f078` |

L2/L11 authority and parent meaning remain those fixed by revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`: L2:340–351/L11:205–206 (010), L2:352–362/L11:206 (011), L2:463–498/L11:219–233 (023). L3/L10 status metadata remains part of those fixed bytes; target revision authority is read from the governance decision/crosswalk, not inferred from draft labels. [Stage 1 crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md) is the locator index, not a replacement for the pinned texts.

| 固定親 / AC | L3 functional span | L10 source cases | 適用NFR |
|---|---|---|---|
| 010 / `AC-HARNESS-L3-010-01`〜`04` | `functional-requirements.md:25–42` | `CASE-HARNESS-L10-010-01`〜`04` | `NFR-C-HARNESS-010-01`, `010-02` |
| 011 / `AC-HARNESS-L3-011-01`〜`04` | `functional-requirements.md:43–59` | `CASE-HARNESS-L10-011-01`〜`04`, `011-05` | `NFR-C-HARNESS-011-01`, `011-02` |
| 023 / `AC-HARNESS-L3-023-01`〜`03` | `functional-requirements.md:60–97` | `CASE-HARNESS-L10-023-01`〜`03` | `NFR-C-HARNESS-023-01` |

L3 business/L10 businessのscopeは各親について独立business ACを作らない。010は固定L2:320/350のFRS-BR-001/002/003/005/009とL2-008区別を既存functional ACで追う。011はcallerの保存/表示/業務完了判断をHARNESSへ移さず、023はdependency classificationから新しい利用方針・ownerを作らない。別の事業価値・利用者acceptance・release decisionを本pairで足さない。

## 2. 旧HELIX source、台帳、consumer/failure

12旧assetを台帳と原文で照合した。全12行のdispositionは`unresolved`、`consumer_refs`は空、台帳に`failure_refs` fieldはない。したがって台帳登録から旧consumerやfailureを推定しない。下表の旧source本文に記載されたfail behaviorは歴史資料上の内容として読んだが、旧CLI/test/runtime/CIは起動していない。資産はcopyせず、固定L2/L3/L10の意味に照らした保持・部分再導出・置換をこの設計に限って記録する。

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

## 3. 製品/API component境界（L6へ渡す候補）

以下は製品機能を割り当てる論理分解であり、共通kernelの詳細実装、Scaffold Binding、runtime、物理storeや初回登録手順を定義しない。型/関数名は仮の設計識別子で、戻り値のK1 class/key/Unknown reasonは必ず現行共通kernelの既存契約へ対応させる。候補を型名にしたことから実在record、registry row、receiptやapprovalは存在すると推定しない。

| Component/API候補 | 入力record候補 | 出力候補 / 前後条件 |
|---|---|---|
| `read_pack_declaration(ref)` | pack identity/revision ref、owner宣言、input/output contract、dependency declarations、verification scope/oracle、release unit inclusion/exclusion refs、pack maturity/version | declarationの観測record。source bytes/current ownerが照合できない値はUnknown/Unobserved。読み取り専用。folder/function catalogをpack declarationとして扱わない。 |
| `validate_pack_contract(declaration, invocation_context)` | declaration ref; pack identity/owner class+identity; pack version/maturity; capability/input/output refs; required dependency typed refs; operation/source condition; verification scope/oracle; release-unit/product version refs; caller invocation context | L4 010のcontract適合観測と差戻し対象。declared ownerが一つであること、収載/除外が明示されること。missing/unknown/conflictはpositiveにせず、product/caller全体を一律停止させる新gateを設けない。 |
| `resolve_dependency_closure(declaration, operation, selected_sources)` | pack revision、typed dependency refs (other pack/component/core/external execution connection), class 1–4, owner/version range/condition、operation scope、明示選択source/provider、既存authority refs | 有効closureと各dependencyのclass/condition/version/scope/reason ref。常時必須＋成立した条件依存だけを含める。未選択は未観測、unknown/contradictoryはheld/unknown。暗黙fallbackや新source選択をしない。classification-onlyで実装未存在をmissing/unknownとして返せる。 |
| `compare_pack_revision(current, declared_range)` | declared pack/contract/dependency refs、current refs、対象caller scope、既存read access ref | 現行revisionとの比較結果、原因dependency/pack refs、旧/新差分。別版結果の流用をしない。異なるpack/release unit/product maturityを昇格させない。 |
| `build_pack_artifact_descriptor(input_refs, pack_revision)` | 同一宣言input refs、pack version、artifact contract、metadata exclusion declaration | artifact descriptor/evidence refsと比較可能digest。実ビルド/署名/保存は行わない。非意味metadata除外はcontractに明記されたfieldのみ。 |
| `compare_pack_replacement(before, after, target_pack)` | 置換前後の全pack identity/version/evidence、単一target pack ref、直前qualified/明示replacement ref | 対象pack差分、対象外pack差分、復帰先比較。対象外version/evidence差分0を照合し、実rollback/writeをしない。 |
| `prepare_pack_invocation(pack, caller_input, scope, existing_authority)` | pack/capability identity、contract/dependency version、明示入力、project/tenant/environment scope、既存SECURITY authority refs、correlation/idempotency keys、expiry | invocation descriptor。missing/mismatch/expiry/authority unresolvedで実行しない。HARNESSはauthorityを発行/拡張しない。 |
| `resume_invocation(invocation_ref, saved_state_ref, caller_key)` | 同じoperation ref/key、保存state ref、pack/contract/dependency current refs、scope/authority/expiry refs、snapshot observation refs | resume eligibilityの既存型結果。実dispatchはしない。同一operation key変更・stale state・expiryはsuccessでない。callerの別keyは別operation。 |
| `return_operation_result(invocation_ref, progress_ref, result_ref, evidence_refs)` | operation/correlation refs、progress, terminal/uncompleted result ref、evidence refs, unfinished obligations | callerへ返すresult envelope候補と未完義務/handoff。callerによる保存/表示/business completeを代行しない。 |
| `measure_declared_nfr(candidate_id, fixture_evidence)` | 固定5 NFR ID、宣言条件、fixture result/evidence refs、対象revision | NFR-specific measurement record候補。candidate値をSLO/実測/承認へ昇格しない。 |

### 3.1 Candidate record fields

`PackDeclarationCandidate` は既存ownerが宣言したidentity/version/maturity、owner class+identity、一つのbehavior contractまたはmeaning-preserving coupled contract、input/output contract refs、dependency list、verification scope/oracle、release-unit included/excluded refsを別fieldで保持する。pack、release unit、integrated productのversion/maturityは別refであり、pack結果から上位版を算出しない。

`DependencyDeclarationCandidate` は`dependency_kind`（固定L2の4分類）、dependency identity/owner, declared contract version/range、operation/source condition ref、pack revision refを束ねる候補。物理実行結果やdependency successは宣言から生成しない。`InvocationCandidate` はpack/capability ref、caller inputs refs、scope、existing authority refs、operation/correlation/idempotency identity、expiry、saved state refを持つ。`ClosureObservationCandidate` は各dependencyのselected/not-selected/condition/evaluation state、scope/version/reason、K1 result ref、K2 key refを個別に束ねる候補。これらの名称とfieldsはL6の内部domain候補であり、公開wire schema、JSON schema、台帳列、type-ID、登録済みrecordは意味しない。

## 4. 処理境界とfailure return

1. pack declaration読取とpack eligibility判定は分ける。pack folder/function listing、code存在、test数、CI greenからmanifest、owner、version、receipt、登録済み意味を生成しない。
2. 010の単一pack compareは全pack list/evidenceをinputとして前後比較するが、別pack revisionを暗黙に更新しない。複数pack変更はこの比較oracleに混ぜない。
3. 011のcaller operationはexplicit input scopeと既存authority refsを束縛する。screen/GUI/local path/AI provider/CI productは必須にしない。HARNESSと製品ownerの責務をOS assignment、SECURITY authority、INFRA resourceから独立して保つ。
4. resume比較はpreflight、dispatch直前、dispatch直後のsnapshot refを分ける。dispatch前のexpired/driftはeffectなしblocked/held。dispatch後に実行結果が確定しない場合はuncertain/unknownとする。expiry equalityが未確定なら現行L3 NFRの案A/B同一clock比較をL8へ渡し、ここで選ばない。
5. 023 dependency classifierは依存実装の存在を前提にせず、declared identity/owner/version/conditionの可観測性を出す。必要な依存がmissing/unknown/stale、条件矛盾、explicit selected source不成立なら影響するoperationのみ非肯定。未選択sourceの存在/不在/eligibility/successを推測しない。
6. 返却resultはcallerへ相関付きで戻す。保存/表示や業務完了はcallerへ残す。receipt/evidenceはK5/K6既存契約に沿わせ、receiptだけでactual effect、登録authority、初回bootstrap、approvalを証明しない。

## 5. 初回登録・ledger bootstrapの未確定境界

固定L2/L3はpack identity/owner/version、宣言manifest、検証scope、release-unit収載/除外を要求するが、pack declarationを最初に正本化する物理操作、初期`VersionRegistered`/`ModelNumberDeclared`/`LogDecl`/manifest segmentを作る具体event sequence、writer/assignmentのauthorityをStage 1で指定していない。現行共通kernelには型番台帳・K5/K7・root構成に関する契約がある一方、それを初回bootstrapで満たす具体的producer/runが本pairの上流sourceからは確認できない。

したがって、L6は既存K5/K7/K8の現在のowner/writer/assignment contractを再利用し、登録済みcurrent refsが存在する操作のみを具体化する。初回のauthoritative declaration/ledger entry/OS assignment/runを草稿やfixtureから生成しない。既存contractで初回記録可能か不足する場合、その登録境界と関係するoperationだけUnknown/Unobservedとして保持し、登録例外、bootstrap-only permission、親gate、仮のowner/eventを追加しない。実物のowner sourceとproducerが見つかる範囲はL6でexact referenceに束ねる。この局所不明は他のL3/L10 trace、設計可能なpure classification/comparisonから独立している。

## 6. 11 AC・5 NFR・3 business boundaryのtrace

| 親 / AC | L5 component | 関連する既存L9 verifier |
|---|---|---|
| 010 / AC-010-01 | pack declaration、owner class+identity、dependencies、収載/除外 | IV-HARNESS-S1-F-010-01, F-010-04 |
| 010 / AC-010-02 | target-only replacement comparison | IV-HARNESS-S1-F-010-02 |
| 010 / AC-010-03 | deterministic descriptor/artifact compare、recovery reference、版成熟度分離、巨大pack return | IV-HARNESS-S1-F-010-03, N-010-01 |
| 010 / AC-010-04 | function/folder catalogとpack identityの区別 | IV-HARNESS-S1-F-010-04 |
| 011 / AC-011-01 | explicit invocation contract、pack/caller field binding、環境非依存 | IV-HARNESS-S1-F-011-01 |
| 011 / AC-011-02 | caller scope、既存authority、製品範囲 | IV-HARNESS-S1-F-011-02, F-011-05 |
| 011 / AC-011-03 | progress/result/evidence correlationとcaller handoff | IV-HARNESS-S1-F-011-03 |
| 011 / AC-011-04 | idempotent resume, snapshot/expiry, unresolved result | IV-HARNESS-S1-F-011-04, N-011-01, N-011-02 |
| 023 / AC-023-01 | typed dependency declarationsとclassification-only result | IV-HARNESS-S1-F-023-01 |
| 023 / AC-023-02 | condition/source closure、unknown/fallback/reselection境界 | IV-HARNESS-S1-F-023-02 |
| 023 / AC-023-03 | safe dependency, human delegation, deterministic closure | IV-HARNESS-S1-F-023-03, N-023-01 |
| business boundary 010 | 既存FRS business conditionsはfunctional AC内に維持 | IV-HARNESS-S1-B-010 |
| business boundary 011 | 保存/表示/業務完了はcallerへ残す | IV-HARNESS-S1-B-011 |
| business boundary 023 | classificationから利用方針/ownerを作らない | IV-HARNESS-S1-B-023 |

固定NFR 5件はNFR-C-HARNESS-010-01/02、011-01/02、023-01のみ。010-01はartifact bytes digest一致（contractが明記する非意味metadata除外のみ）、010-02はtarget外pack version/evidence差分0、011-01は同keyでeffect高々1回、011-02はexpiry後success 0と案A/B比較、023-01はD1–D15全15 fixtureで同一input/revisionのclosure/reason差分0。NFR候補は実測やSLOでない。

L8は既存L9の20 verifier ID（12 functional + 5 NFR + 3 business-boundary）を一件ずつ対応付ける。L8がIDやoracleを再発行するのでなく、L9 verifierの詳細fixture planを付ける。case内の複数mutationは一度に一fieldだけを変える個別synthetic fixtureに分ける。
