---
title: "HELIX-INFRASTRUCTURE Stage 1 基本設計"
canonical_vmodel: L1-L12
canonical_layer: L4
canonical_pair: L9
layer: L4
kind: design
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
paired_l9: ../L9-integration-verification/stage1-infrastructure-integration-verification.md
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 基本設計

本書は、承認済みの `HELIXINFRASTRUCTURE-L2-001` と `HELIXINFRASTRUCTURE-L2-006` に対するL3/L10固定revision `7a74a8bfce440f5bd40c8d7da9be0ebdcdaf8f0d` の下流設計候補である。L2-005は006の採択済み入力依存として、当該操作に適用される復旧義務を読む場合だけ参照する。L2-005を本Stageの親や受入対象へ加えない。

この設計は資源観測と限定復旧operationの情報境界を定める。実環境への操作、実装選定、実装・実行、実測合格、サービス全体の健全性、incident close、release/deploymentを示さない。独立path/authorityのownerがsourceで確定しない場合、その依存operationの状態は `Unknown` として保持し、ownerを新設・代替しない。

## 固定対象と文書pin

対象はStage 1、`version_target: 1.0` のL2-001/006のみ。L2/L11の固定revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、L2全体SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11全体SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`。PO判断は[2026-10-05記録](../../governance/decisions/helix-infrastructure-stage1-l3-l10-po-decision-2026-10-05.md)、対象6文書のpinは[修正監査JSON](../../governance/audits/requirements-stage/l3-l10-infra-stage1-review02-repair-2026-10-05-7a74a8bfc.json)を参照する。

| 固定本文 | SHA-256 |
|---|---|
| L3機能 `L3-requirements/functional-requirements.md` | `22d90beb7fcec36e33b63cc3fa7921e224ff6ced66ea8f9a5f2fdb71570d28b6` |
| L3業務 `L3-requirements/business-requirements.md` | `c2b22bc5af8bf721c9f6e4594e81046dde2ed2a9555fa0643accb76f8a37f97e` |
| L3 NFR `L3-requirements/nfr-grade.md` | `a381b4b88fe6b5621fecf1195470b45bd5fbfd1f1dc88fee7dc3cf259abbb3ab` |
| L10機能 `L10-verification/functional-verification.md` | `e9e3132d779e3ea9c8e4cfef2d066d0f5394cfb76069cb2af90468c4930172a7` |
| L10業務 `L10-verification/business-verification.md` | `8801b848f6b16d5214a45b3652446a228e829c687f9203e50c02ad2bf5ddbe70` |
| L10 NFR `L10-verification/nfr-verification.md` | `562545cfb95e81bce5db29628b5fbb3a82c20fbb41db6867364ff60b2c84c63a` |

L3/L10 functional、business、NFRのいずれも全体pinを対象とし、AC locatorのみを承認範囲とみなさない。親・AC・caseの現在の索引は[Stage 1 obligation crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md)を併用する。crosswalkのcoverage状態は本書から変更しない。

## 旧HELIX sourceからの再利用・再導出・置換

旧sourceは読み取り資料として比較し、旧CLI、workflow、test、runtime、CI、provider adapterを実行・移植しない。旧sourceの全体SHA-256はarchive資産と照合した。

| 旧資産 / 読取箇所 / 全文SHA-256 | 旧consumer・失敗境界 | 現行での扱い |
|---|---|---|
| `LEGACY-ASSET-F542125805B777D8A56A` `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13–21,101,148–168` / `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | FR+ACと対のverificationを後続設計へ渡す。AC欠落では旧G3を通さない。旧phase/gate文脈は現行authorityではない。 | 形式上のtraceを再導出し、現行L3/L10 pinへ接続。旧G3/AP-4は置換し、追加gateを作らない。 |
| `LEGACY-ASSET-17C4BF78919578FEBB18` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:68–73,74–98,108–119,140–171` / `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` | OPS-R-01 consumerは環境/resource/credential referenceを区別し、曖昧target・期限切れcredentialを閉じる。OPS-R-03はrollback計画とreceiptを分け、rollback successからincident closureを導かない。 | identity、source、unknown、rollback evidenceの意味を部分再利用。provider/schema、旧permission、全lifecycle/incident、旧SLOは置換し、固定L2 scopeと現行ownerへ再導出。 |
| `LEGACY-ASSET-F46AB11BD14F2C0469F4` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/product-lifecycle-operations-acceptance.md:20–39` / `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58` | OPS-AC-001/003はambiguous identity、logical-only target、secret値保存、rollback対象・backup欠落のnegativeを観測。 | 正常/negativeの比較観点を再導出。旧oracle、実行経路、acceptance値は再利用せず、新L10は固定L3/L10 caseに従う。 |
| `LEGACY-ASSET-653A097F9C9EE51F6FDD` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-concept-v4.0.md:36,79–85,116–128` / `8c492aae7a3c2f2c27dd24794d2ba4c7a9fc025737fa7ea61215b3b6658a5e59` | HELIX固有plane/topologyを前提に旧運用consumerが参照。 | 旧plane名・topologyは置換し、固定L2で指定された機構/resource identityとowner宣言のみを使う。 |
| `LEGACY-ASSET-235F57A4DC453383E6C7` `archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/concept/HELIX_CONCEPT_v0.1.md:69–91,234–238` / `ab9d93f843875c1cd9b61049721c455ae067548196c216e64168711156afd475` | 古い資源制約・不足時扱いを構想が参照。数値や配置判断は当時の概念入力。 | 資源属性と観測範囲をsource付きで記録する意味を再導出。数値、organism/plane、容量/費用採否は継承しない。 |

旧L3/L10要件が挙げる旧consumer/failureと現行の使い分けを上表に整理した。旧credential値を記録しない旧記述は保持するが、固定L2-010のsecurity条件を上書きせず、backup/snapshotへの無限定な禁止を作らない。未確定のsecurity適用はSECURITYへ返す。

## 現行共通型と責務境界

共通型は、基準HEAD `7d48e458fcff7e03df18abc4f768981410685cf7` の[HELIX-HARNESS common kernel L4](../../helix-harness/L4-basic-design/common-kernel.md)（SHA-256 `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b`）§§2–10,14–17と、その[L9 oracle](../../helix-harness/L9-integration-verification/common-kernel-integration-verification.md)（SHA-256 `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b`）を既存契約のまま使う。

| 現行契約 | 本対象での利用 | owner / 戻し先 |
|---|---|---|
| K1 `Observed<T>`（Value / Unknown / Unobserved / Stale / NotApplicable） | 観測値と未観測・解決不能・旧revisionを区別。missingは宣言/完全走査等で必要対象が無いと確認できた場合だけ。読めない・scopeを解決できない・観測不能は `Unknown` / `Unobserved` の既存理由を使い、成功へ丸めない。 | 観測対象のresource/path/storage source owner。 |
| K2 `ResultKey` / `SubjectRef` / role-bound inputs | resource, environment, path, storage, runtime, operation, authority sourceとrevision/digestをcurrent keyへ固定。source変更後の旧結果をcurrentと扱わない。 | 各raw sourceの宣言owner。 |
| K3 authority tuple / current owner resolver | L2-006独立operationのtarget/action/revision/scope/別SECURITY authority/expiryを既存authority契約へ渡す。resource stateや`ready`から許可を生成しない。 | SECURITY authority/policy owner、対象owner。 |
| K5 append-only evidence / projection | source observation、operation開始前後、結果、未完義務の追跡に使う。部分読取・損傷を完全記録や不存在へ読み替えない。 | 証拠source/ledger owner。 |
| K6 verifier/read receipts | L10設計の固定verifierとsource read receiptの範囲に限定。receiptは物理適用や実環境健全性そのものではない。 | verifier ownerと観測source owner。 |
| K7 operation state / K4 obligation | 限定operation・前提・結果・未完義務をoperation単位に保持。復旧義務不明/未充足は該当state-changing operationだけを保留。 | WorkerはL2-010契約下で実操作する。適用義務は採択済みL2-005 source ownerへ返す。 |
| K9 independent observation / K10 dependency closure | independent pathの依存閉包と物理観測を別に保つ。宣言されたedge/graphはroute実体や成功receiptではない。 | resource/path/OS/SECURITYの宣言済みowner。 |

Owner割当は親文書の既存境界に限る。INFRASTRUCTUREはresource/state、COREは参照される設計意味、CONNECTはlogical connection、SECURITYはauthority/network security boundary、OSはassignment/change state、Workerはsecurity制約下の実操作、LABOは結果評価を持つ。返却先ownerが特定できないときは `unknown` と未完観測範囲を残す。ownerを新設しない。

### 観測とmissingの境界

- 必要な宣言/resource/field/path/義務が存在しないことを、対象scopeの完全なsource読取で確認できたときに限って「missing」と記録する。これは成功や完全性を意味しない。
- sourceが未登録、解決不能、読取不能、部分更新、scope不明、物理状態の観測不能なら `Unknown` または `Unobserved` とする。以前の観測値を現行値へ昇格しない。
- assignment、構成図、declaration、logical pathは、実物の存在・適用・疎通を証明しない。物理実体を観測するsourceがない場合は物理状態をunknownのままにし、実在/不在を推測しない。
- `unknown`、`missing`、`stale`、競合、未承認は同義にしない。影響するAC/operationだけを保留し、Stage全体や無関係operationへ広げない。

## INFRA-001 設計trace

L3 functional `INFRA-001-FR-01-01..04` / INFRA-001-AC-01..04（固定L3機能 §INFRA-001, lines 43–70）とL10-INFRA-001-C01–C15（固定L10機能全文 lines 1–79）を1対1の要件根拠として扱う。

| L3 obligation | L10 case | 設計で維持する状態・境界 |
|---|---|---|
| INFRA-001-AC-01 resource identityと7属性、source/revision | L10-INFRA-001-C01, L10-INFRA-001-C02, L10-INFRA-001-C03, L10-INFRA-001-C04, L10-INFRA-001-C13, L10-INFRA-001-C14 | 宣言scopeの全resourceを別identityでsource/revisionへ結ぶ。値か明示unknownを持つ。重複/不明identityで補完しない。L10-INFRA-001-C02はstaging/production混同と各environment軸の差を分け、L10-INFRA-001-C04は返却先owner既知/unknownを分ける。L10-INFRA-001-C13は独立fixture、L10-INFRA-001-C14は読取失敗と部分更新を分ける。 |
| INFRA-001-AC-02 environment独立、8軸 | L10-INFRA-001-C01, L10-INFRA-001-C02, L10-INFRA-001-C03, L10-INFRA-001-C13 | environmentごとにscope/version/authority/source/config/network/credential scope/dataを照合。同名だけで統合しない。対象外environmentの観測を成功証拠にしない。 |
| INFRA-001-AC-03 logical CONNECT identityとphysical path identity、8軸 | L10-INFRA-001-C05, L10-INFRA-001-C06, L10-INFRA-001-C07, L10-INFRA-001-C08 | logical referenceとphysical pathは別identity。pathごとsource/destination/protocol/endpoint/direction/purpose/security boundary/dependencyを記録。欠落軸はunknown。route許可はCONNECT/SECURITYのownerへ返す。 |
| INFRA-001-AC-04 persistent/temporary storage、6属性とrecovery参照、resource/runtime属性 | L10-INFRA-001-C09, L10-INFRA-001-C10, L10-INFRA-001-C11, L10-INFRA-001-C12, L10-INFRA-001-C15 | 対象scope内でのみfield列挙。未観測runtimeを存在すると仮定しない。security classification、ticket、capability、authorityは別owner。`ready` / productionだけから許可を出さない。 |

### NFR候補を設計に反映する範囲

NFR候補値は同じL3承認にまとめ、値別PO gateを作らない。いずれも合格済み実測ではない。

| NFR | L4で追跡する測定母集団と固定事項 | 対応するL10 |
|---|---|---|
| INFRA-NFR-001-01 | 宣言fixture scope内のresource 7属性、environment 8軸、承認対象CORE設計revision、runtime revision。全必須fieldをsource-qualifiedで照合する候補。実環境全数は主張しない。 | L10-INFRA-001-C01–04,L10-INFRA-001-C13–14。unknownを除外・補完しない。 |
| INFRA-NFR-001-02 | 各宣言network pathの8軸、各storageの6属性とrecovery reference。軸単位で欠落/unknownを観測する候補。 | L10-INFRA-001-C05–10。未見protocol/pathをallowlist化しない。 |
| INFRA-NFR-001-03 | logical connection/physical pathを別identityで追跡し、誤併合0件を候補にする。 | L10-INFRA-001-C05–08。等しいname/endpointを根拠に同一化しない。 |
| INFRA-NFR-006-01 | operation eligibilityの6条件（target/action/revision/scope/別SECURITY authority/expiry）を個別照合する候補。細目は採択済みL2-010 §L126–134（特にL129,L132）を横断入力とする。 | L10-INFRA-006-C01–04,L10-INFRA-006-C16–17。6条件別のnegativeを分離し、credential値は記録しない。 |
| INFRA-NFR-006-02 | bootstrap/health check/service stop/rollback/recoveryの5種類を別々に照合する候補。完全自動failoverは必須にしない。 | L10-INFRA-006-C01–08,L10-INFRA-006-C13–19。未定義第6 operationを通さず、完全自動failover不在だけで5種を否定しない。 |
| INFRA-NFR-006-03 | health probe 5秒×3回は初期技術候補。比較は1秒×1回/10秒×5回。probe結果は各回記録し、service-wide health/severityはL2-004側owner未確定ならunknownとする。 | L10-INFRA-006-C05,C14,C19およびL10 NFR `INFRA-NFR-006-03`の遅延/timeout/retry/途中復帰変異。これはSLOや達成値ではない。 |

### business要件の境界

固定L3 business（全体SHA `c2b22b...`）は、2親に独立business outcomeがないため独立business要件を設けず、機能FR/ACを正本とする。固定L10 business（SHA `8801b8...`）も独立business test/oracleを設けない。したがって業務行（L3 lines 17,19 / L10 line 19）はこの境界を維持する参照義務であり、業務成功、incident close、復旧完了、配置/費用の採否を作らない。

## INFRA-006 設計trace

L3 functional `INFRA-006-FR-01-01..03` / INFRA-006-AC-01..03（固定L3機能 §INFRA-006, lines 71–92）とL10-INFRA-006-C01–C19（固定L10機能全文 lines 1–79）を根拠とする。通常HELIX/OS control plane停止時の経路検証は合成fixture上の設計であり、現実環境への操作指示ではない。

| L3 obligation | L10 case | 設計で維持する状態・境界 |
|---|---|---|
| INFRA-006-AC-01 independent path、別SECURITY authority、owner不明時停止 | L10-INFRA-006-C01, L10-INFRA-006-C02, L10-INFRA-006-C03, L10-INFRA-006-C04, L10-INFRA-006-C16, L10-INFRA-006-C17 | 対象/operation/scope/revision/expiryを既存K3 owner resolverで照合。通常operation authorityを流用しない。path/authority ownerが明確なら返し、owner自体が不明なら成功にせず未解決owner/dutiesを保持。 |
| INFRA-006-AC-02 5限定operation、各operation前提/authority/結果、L2-005義務の条件適用 | L10-INFRA-006-C01, L10-INFRA-006-C02, L10-INFRA-006-C03, L10-INFRA-006-C04, L10-INFRA-006-C05, L10-INFRA-006-C06, L10-INFRA-006-C07, L10-INFRA-006-C08, L10-INFRA-006-C13, L10-INFRA-006-C14, L10-INFRA-006-C15, L10-INFRA-006-C16, L10-INFRA-006-C17, L10-INFRA-006-C18, L10-INFRA-006-C19 | 5 operationを個別caseに保ち、6th operationを拒否。health checkはread-only。state-changing rollback/recoveryだけ適用されるL2-005義務を読む。義務unknown/未充足は該当operationだけ止める。fully automatic failoverを適格条件にしない。 |
| INFRA-006-AC-03 結果・eligible revision・未完義務を保持、stale overwrite防止 | L10-INFRA-006-C09, L10-INFRA-006-C10, L10-INFRA-006-C11, L10-INFRA-006-C12 | success/refusal/failure/partial/unknownを分け、最後のeligible revisionと未完義務を追跡。old successで新しい部分/失敗状態を上書きしない。 |

### INFRA-NFR-006-01..03と運用境界

006-01はtarget/action/revision/scope/別authority/expiryの6条件を個別照合し、欠落/unknown/expired等を通過させない候補である。006-02は5 operationの個別coverage候補で、停止中control planeを唯一routeにしない。006-03の5秒×3回は健康probeの候補で、operation-health observation以外のsystem health、incident/severity、可用性SLOを作らない。固定L2が定めないowner・条件は推測せずunknownとする。

L3/L10に明示の未確定事項（ownerが特定できないresource/path/authority、適用復旧義務が解決しない場合）は、該当するsource owner/SECURITY/OSへ返すかunknownのまま保持する。L2の意味、scope、owner、versionを変える必要が出た場合だけ、当該要求へ戻す。技術的な値候補の個別判断や新承認手続きは作らない。
