# HELIX-BRAIN Stage 1（007/008/028）基本設計

status: draft_for_independent_review
owner: HELIX-BRAIN（知識identity、revision、state、descriptor照合）
paired_l9: ../L9-integration-verification/stage1-brain-integration-verification.md
base: main `7d48e458fcff7e03df18abc4f768981410685cf7`

本書は固定されたStage 1親007/008/028の設計を、共通カーネルK1〜K10へ接続する。親の意味、owner、列挙値、版を変更しない。L9は本書の型・境界・依存を一方向に参照する。設計文書の存在、status、L9設計、静的照合はL3承認、実装、L9実行、合格、採否、releaseを生成しない。

## 1. authorityと対象revision

Stage 1の実装着手判断は `docs/governance/decisions/stage1-implementation-and-ci-unlock-po-decision-2026-10-09.md` の対象範囲に従う。本書はそのunlockを上流承認の代替にしない。固定した承認本文の正本は次の6本文である。L3本文のfront matterに残る当時の草稿表示はそのbytesの一部であり、承認状態は別の判断記録・条件3・main read-afterのchainで決まる。

| 対象 | 承認済み本文revision | 固定文書 | SHA-256 |
|---|---|---|---|
| BRAIN-007 | `2919f7344f90ff8bde4db60ef7142b3c47bea0a8` | L3 `functional-requirements.md` | `2868fd63e0ded8fb0861e1707bbd021f6cf86ae2ff5d542c0d3bddd2da938759` |
| BRAIN-007 | 同上 | L3 `business-requirements.md` | `035d6c2b93ea7d72d016b81cc712135f81ac5dec9f14d20cd7971db6fae96cd7` |
| BRAIN-007 | 同上 | L3 `nfr-grade.md` | `4a391af39f7c4fbf2062cd5a1c6a895498625f651d60e56596a612ca2d831daf` |
| BRAIN-007 | 同上 | L10 `functional-verification.md` | `215a4f91a657e5967d5f202f1d92073c033022d882365a0c9f30171c8e6ed552` |
| BRAIN-007 | 同上 | L10 `business-verification.md` | `0ab3f29516c6a0ce7185424b988f8abcfab5340b00fad48e3f77d7154e22b997` |
| BRAIN-007 | 同上 | L10 `nfr-verification.md` | `61c4a7cf4405565bdc133bd6e2bf2de3effc71a8c34b283b934baee5d50ef21b` |
| BRAIN-008/028 | `debb4e3d682c5ad4835dafed7dbcbf33f24e9c8f` | L3 `functional-requirements.md` | `537ff96382641b614c4f256d30403d4b5df5154ea7fb623c0a809c263c030a9a` |
| BRAIN-008/028 | 同上 | L3 `business-requirements.md` | `98c768a580ea16fffb5c11dfaa6508c91e7dba6d6d55f8d097f540ff9092c264` |
| BRAIN-008/028 | 同上 | L3 `nfr-grade.md` | `8d987bddc9d4625937c5c7c16d1754a475ca699d27e09eb39e04489681288fbc` |
| BRAIN-008/028 | 同上 | L10 `functional-verification.md` | `031fccb6716b42e693983d2c3789b80070ec4910afcc198243a5b26a3eaaa216` |
| BRAIN-008/028 | 同上 | L10 `business-verification.md` | `5224d78282a60ef1ac2dd0fc4bbc2bfaf3073e738e0baf7ad697d3656040c804` |
| BRAIN-008/028 | 同上 | L10 `nfr-verification.md` | `21a47fed4e9269367d765111b05e3541c8ee3649f474990fdc5b27f20798e237` |

承認chainは対象別に限定する。

| 親 | authority根拠 | 効力範囲 |
|---|---|---|
| 007 | `helix-brain-stage1-parent007-l3-l10-delegated-decision-2026-10-07.md`、formal #6040506426、condition 3 #6040860539、main merge/read-after #6040960721。記録は対象revision `2919f734…` の6本文SHAを固定。 | 後続の別親変更を含む対象revisionに対する007のみ。 |
| 008/028 | `helix-brain-stage1-l3-l10-po-decision-2026-10-05.md` とPR #2577の直接PO判断comment #5985291728。 | `debb4e3d…` の6本文について008/028のみ。007の後続判断を継承しない。 |

現行mainのpost-confirmation索引は `docs/governance/l3-l10-po-post-confirmation.md:187` とそこから参照される固定snapshotを読むための案内であり、上記対象revisionを広げない。現在main `7d48e458fcff7e03df18abc4f768981410685cf7` はPR #2738を統合済みである。承認済み親本文は上表のtarget revision bytesに固定し、mainの後続編集で差し替えない。

## 2. 適用するL3/L10義務

対象はfunctional 6 ACとその対L10 27 case familyであり、別business ACはない。L3 business各親行（007/008/028）とL10 business各親行は、固定L2/L11に独立business outcomeが無いと記録する。HARNESS旧business-detailのBR-21/HM-08、KPI、画面・集計条件をBRAINへ加えない。

| 親 | ACと固定L3範囲 | L10 functional case family | 適用するNFR/L10測定義務 |
|---|---|---|---|
| 007 | `BRAIN-007-AC-01/02`、L3 functional lines 11–62 | C01–C10 | 8必須group（7 provenance group＋LABO対象revision）のcoverageとfield別missing/stale/wrong-revisionを区別。AI生成のみ・成功1件のみ・owner状態代用・LABO対象revision不一致での誤昇格を別々に観測。分母/coverage/誤昇格0は未測定の技術候補であり新閾値ではない。 |
| 008 | `BRAIN-008-AC-01/02`、L3 functional lines 61–106 | C01–C09 | 5状態の個別識別、旧revision参照の維持、R→R2黙置換・同revision bytes書換え・unknown/version_target代用の別変異を照合。新しい遷移順、保持期間、version grammarは設けない。 |
| 028 | `BRAIN-028-AC-01/02`、L3 functional lines 107–159 | C01–C08 | descriptorとknowledgeの軸、range内/外/欠落/解釈不能、actual versionとversion_target、共通lifecycle境界を個別照合する。range syntax/comparator、製品値、誤受理0は未採択候補・未測定である。 |

NFR候補の元本文は固定L3 `nfr-grade.md` と固定L10 `nfr-verification.md`（§1のfull SHA）である。007のsource identityとsource revisionは一つのprovenance groupを構成する二つのatomic fieldである。これをprovenance/evidence/adopted reason/evaluated scope/counterexample/limitationの6 groupと合わせた7 provenance groupに、LABO評価対象revisionの1 groupを加えた計8 groupを試し、group数を9へ増やさない。028のrange fixture値は試験入力に限り、製品契約のrange grammarや比較器を決めない。未評価・欠損・unknownを分母から外して成功扱いしない。全27 L10 case IDとAC/期待oracle/戻し先は対L9 §3に個別行で対応づけ、親のL10本文を複製しない。

依存・戻し先も固定親どおりとする。007はL1-007、L2-011/025、LABO→BRAIN L2-020のexact revisionを記録し、評価未実施・LABO対象revision欠落/不一致をLABOへ返す。008はL1-008、L2-028、CORE/OS接続L2-018/019/025を参照し、knowledge identity/version/stateはBRAIN、実project usageはOS ownerへ返す。028はBRAIN L2-008と採択済みHARNESS L2-010/011のpack/call境界依存を分け、knowledge軸はBRAIN、descriptor/contract/range軸はHARNESS ownerへ返す。未解決入力は該当operationの`Unknown(missing_input|unregistered|unsupported|conflict)`等に留め、Stage全体の新gateにしない。

## 3. BRAIN固有の記録と解決面

BRAINは知識identity/revision/stateと007 provenanceの関係を所有する。OSのproject-use記録、LABO observation/evaluation、BRAIN内の独立検証、adoptionは別owner・別recordであり、互いに代用またはwrite-backしない。candidateからaccepted/matureへの条件を新設せず、既存owner契約に適合した採否根拠が固定親どおりに存在する場合だけ、その記録を辿れるようにする。

```text
BrainSourceTrace = {
  knowledge: SubjectRef,                   # Pattern / Unit / Partのexact identity/revision
  provenance: Observed<ProvenanceRef>,
  evidence: Observed<EvidenceRef>,
  adopted_reason: Observed<ReasonRef>,
  evaluated_scope: Observed<ScopeRef>,
  counterexample: Observed<CounterexampleRef>,
  limitation: Observed<LimitationRef>,
  labo_evaluation_target: Observed<SubjectRef>,
  owner_records: { labo: Observed<SubjectRef>, os_registration: Observed<SubjectRef>,
                   brain_verification: Observed<SubjectRef>, adoption: Observed<SubjectRef> }
}
BrainKnowledgeRecord = { knowledge: SubjectRef, version: Observed<VersionRef>,
                         state: Observed<BrainKnowledgeState>, supersession: Observed<SubjectRef> }
BrainKnowledgeState = current | superseded | deprecated | experimental | retired
DescriptorCompatibilityQuery = {
  descriptor: SubjectRef, descriptor_fields: Observed<DescriptorFieldSet>,
  requested_compatibility: Observed<VersionRef>,
  knowledge: SubjectRef, knowledge_state: Observed<BrainKnowledgeState>,
  result: Observed<Applicable>
}
```

`ProvenanceRef`群ではsource identityとsource revisionを別atomic fieldとして同じ一つのprovenance groupに保持し、provenance/evidence/adopted reason/evaluated scope/counterexample/limitationを各一groupとして合わせて7 provenance groupにする。LABO対象revisionが第8の独立groupであり、knowledge candidate revisionとの完全一致を照合する。fieldを解決できない、sourceを読めない、またはowner recordが確認できない場合はそのfield/operationだけ非肯定で返す。ここでの型はfieldとowner境界の技術表現であり、新しいstate、promotion threshold、receipt真正性の証明ではない。

008の5状態はBRAIN knowledge axisにのみ属する。OS project-useは別のexact recordとして返し、BRAIN state変更でOS historyを更新せず、OS更新でBRAIN stateを変えない。unknown identity/revision/stateは最新のcurrentを推測せず使用を止める。K2のexact-reference比較が同revision content changeを`Unknown(conflict)`として知らせる場合も、BRAINのrevisionを後付けで書き換えない。

028は以下の比較軸を独立に保持する。

| 軸 | owner | 照合対象 |
|---|---|---|
| descriptor identity/kind、contract version、artifact version、dependency identity/version、declared compatibility range、verification scope | HARNESS descriptor/contract owner | 各fieldのexact referenceと固定L2-010/011依存revision |
| knowledge identity/revision/version/state | BRAIN | 008のexact knowledge record、versionはactual versionとして解決 |
| common pack/call boundary | HARNESS共通契約 | L2-010/011で定めた範囲。BRAINで再定義しない |

range fieldが欠落・読取不能・解釈不能なら`Unknown`であり、適用可能とも`NotApplicable`とも決めない。declared rangeの内外判定はdescriptor ownerのcurrent契約が比較方法を与える場合だけ行う。outsideをK1 `NotApplicable`で返せるのは既存の理由・authority・再入条件が解決する場合だけであり、それ以外は`Unknown`とする。固定L2にrange grammar/comparatorがないことを本設計で埋めない。`version_target`はactual versionとして扱わない。relation endpoint/conflict意味判定は本親の照合へ混ぜない。

## 4. 共通カーネル契約との接続

実装者はmain `7d48e458fcff7e03df18abc4f768981410685cf7` の `docs/helix-harness/L4-basic-design/common-kernel.md`（SHA-256 `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b`）を対象revisionとして参照し、下記の現行契約をBRAIN専用に複製しない。対となる共通カーネルL9 `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` のSHA-256は `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b` である。

| 契約 | BRAINでの使用 | 境界 |
|---|---|---|
| K1 `Observed<T>` | 各fieldのValue/Unknown/Unobserved/Stale/成立済NotApplicableを保持する。 | missing/unknownを肯定へ縮退しない。empty groupのcoverageを全称真にしない。 |
| K2 `SubjectRef`/`ResultKey`、`KeyOfResult`、lookup/record | knowledge、descriptor、依存、oracle、operation版、scopeを正確に鍵付けし、旧revisionの結果を別revisionへ返さない。 | `key_of`境界は`ResultKey`または`Rejected`（`missing_key`、`invalid_digest`、`duplicate_identity`）を返す。欠落→digest形式不正→inputs内identity重複の順で検査する。これらはK1 `Observed<T>` variantではない。`version_target`、短縮SHA、pathをidentity代用にしない。operation入力全集合はowner宣言。 |
| K3 operation authority | BRAINが既存ownerの権限付き状態変更を行う場合、current declaration/current permissionをそのoperationで照合する。 | 読取照合の全てに新たな許可を要求しない。K3がauthorizationを生成せず、BRAIN独自grant語彙を作らない。 |
| K4 obligation / G3 oracle | 既存義務とoracleの型、依存閉包、受入結果を参照する。 | 007/008/028から新しい共通義務・gateを追加しない。 |
| K5 append-only log/projection | owner記録と結果の追記・再構築・lookupを既存log契約で行う。 | OS/LABO/BRAINの異なるowner recordを一つのBRAIN logに統合しない。 |
| K6 receipt/E | oracle結果とreceiptの鍵・producer/read set・真正性契約を使う。 | receiptがあることのみでsource truth、authority、物理的実施、adoptionを証明したとしない。 |
| K7/G5 generation/fencing | 共通exchange/update/rollback/unfinished-obligationと切替時fenceを利用する場合はHARNESS/OS既存owner契約へ接続する。 | knowledge state遷移をK7世代pointerと同一視しない。BRAINでcommon lifecycleを再定義しない。 |
| K8 input-label transition | SECURITYが明示した入力分類・経路があるoperationでのみ参照する。 | BRAIN knowledge stateやadoptionをK8 labelに読み替えない。K8は権限承認を生成しない。 |
| K9 independent review | 独立reviewが実施された場合に限り、K9のidentity/context/authority/route観測とその結果receiptを別途結ぶ。 | 本設計の存在や草稿作成者をreview実施事実にしない。review結果はBRAIN adoption、L3承認または要件完了を生成しない。 |
| K10 typed dependency graph | 固定親が列挙するL1/L2/owner dependenciesを型付き参照として保持する。 | 未宣言依存を推測せず、依存欠落は対象operationをUnknownにする。 |

## 5. 旧HELIXとの対応

旧sourceと失敗類型は参照のみであり、旧workflow、test、runtimeを実行しない。asset ID、archive path、該当行、全文SHA-256は台帳と固定L3の旧対応表を照合した。ここでいうconsumer/failureは対応L3が旧test-design等から記録した失敗類型を指す。台帳の対象行は`asset_class=Historical`、`disposition=unresolved`、`implementation_status=unknown`、`consumer_refs=[]`であり、台帳自身は現行consumerを宣言していない。L3記載のconsumer/failureを失敗史の参照として保持し、旧schema/API/thresholdは再利用しない。

| 親 | 旧source（asset ID / archive path:行 / full SHA-256） | consumer・failureとして保持する意味 | この設計での扱い |
|---|---|---|---|
| 007 | `LEGACY-ASSET-C7F0C3B79CBAA72960BF` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:41` / `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | source-to-knowledgeの直接要件ではない隣接L3。 | source trace意味は固定BRAIN L2/L11から再導出。 |
| 007 | `LEGACY-ASSET-FA8C6E69463183D6A19B` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:39` / `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | HAT-HIL-07のself-promotion/verified completion境界。 | worker≠promoterの失敗類型だけをL10へ再導出。旧role schemaは使わない。 |
| 007 | `LEGACY-ASSET-1B990E15398E929D29BD` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-memory-learning-promotion-unit-test-design.md:31–49` / `54b69856ccc617f81b31fbc918424cf3b12f4c0ca382586f8ea8db1e291a40a9` | unit consumerでprovenance欠落/stale/dangling等が昇格へ漏れる失敗類型。 | 個別field変異を現ACに合わせて再導出。memory schema/size/thresholdは除外。 |
| 007 | `LEGACY-ASSET-B1F8D6CA3685EBF0F322` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-memory-learning-promotion-integration-test-design.md:38–56` / `0e84cdc06c0e88205a4948136c7506c307ef8d7d27fa1324a4d32f4cf90c4b5f` | integration consumerでsource/evidence不足とowner境界の漏れを試す類型。 | ownerごとのLABO/OS/BRAIN/adoption分離を親ACに沿って再導出。 |
| 007 | `LEGACY-ASSET-3345D03D82B0A5E7D9A6` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/skill-mechanism-migration-requirements.md:25–63` / `4b0d73bb7ad92a8377dd2ae72d58057c03d6e1fe732126c11059840d3d6533ab` | migration/worker境界の隣接資料。 | BRAIN migration/runtime要件へ拡張しない。 |
| 007 | `LEGACY-ASSET-8FECCE93E3996E8AAAFF` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/orchestration-memory-runtime.md:14–50` / `c4fae09ac57f335a572b1d86ad353e7985551caa364f991a08e15d24d603c857` | orchestration memory runtime consumer。 | memory JSONL/compaction/role tupleは置換対象にせず移さない。 |
| 008/028 | `LEGACY-ASSET-9B7682EBDEA171005D45` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md:68–85` / `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | package/profile versionとdigest mismatch、参照先置換のconsumer失敗。 | exact revision/unknown fail-close意味を再導出。package schema/profile IDを使わない。 |
| 008/028 | `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:22–32,38–45` / `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | ST-DIST version/digest driftとsystem consumer failure。 | 各field単独変異をL10へ再導出。旧case ID/閾値/runtime不使用。 |
| 008 | `LEGACY-ASSET-C6052714FB506FB6271E` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/skill-applicability-authority.md:23–78` / `5598eea36f7e5a3635b22a9f8320f0b388f47d57ca1fbb01887eda5ccbe2be49` | SKAPP typed identity/versioned registry、unknown/duplicate/conflicting reference。 | identity/revision/state軸を再導出。skill taxonomy/statusを移さない。 |
| 028 | `LEGACY-ASSET-9114D4E463E95B67DD0C` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:53–64` / `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | WCC provider descriptor/schema fieldの境界類例。 | descriptorとknowledgeの独立軸照合を再導出。WCC schemaをコピーしない。 |
| 028 | `LEGACY-ASSET-C6ADB99F1353965C5449` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md:18–37` / `c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d` | WCC acceptanceのversion/schema mismatch failure類型。 | field mismatch oracleのみ再導出。旧packetは移さない。 |

直接対応する旧BRAIN source-to-decision要件が無い範囲は固定L2/L11から再導出した。旧L3/L10定義と文書分離の形式的起点は固定本文が引用する `LEGACY-ASSET-F542125805B777D8A56A`（旧`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–168`、SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）、`LEGACY-ASSET-34DF3B535879CC73FA86`（旧`archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162–170,195–207`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）、`LEGACY-ASSET-9A772391C7FB1298D45F`（旧`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`、SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）である。保持はfunctional/business/NFRの分離とACから対のsystem verificationへのtrace。旧層番号、sub-gate、runtime、旧business/NFR値は移さない。

## 6. 未解決・未着手の境界

- Compatibility range syntax/comparatorが固定L2に無い場合は028のrange内外判定をUnknownとして残す。HARNESS ownerの既存契約が解決しない限りその照合operationだけ非肯定であり、PO承認や新gateを要求しない。
- 知識sourceの公開範囲・visibilityの上流意味は本書で決めない。入力sourceの権限や可視性が未解決なら該当read operationだけをUnknownにする。
- K6のreceipt bytes/producer identity検証は共通契約の参照であり、設計だけでreceipt真正性、実際のsource completeness、実装・runtimeの事実を証明しない。
- L4/L9は設計草稿。実装、L9実行、結果は未着手であり、L3 efficacy/completionと混ぜない。
