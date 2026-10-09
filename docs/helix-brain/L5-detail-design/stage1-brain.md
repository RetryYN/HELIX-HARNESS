# HELIX-BRAIN Stage 1（007/008/028）詳細設計

status: draft_for_independent_review
owner: HELIX-BRAIN
paired_l8: ../L8-detail-verification/stage1-brain-detail-verification.md
base: main `fc95f868ba6be60323e1c448429e0812c1c1b7cf`
current_main_observed: origin/main `fc95f868ba6be60323e1c448429e0812c1c1b7cf`（fc95統合時に再照合）
source_pair_base_candidate_commit: `eb3b52444093f0de6491d4f1b707132670afb9e4`（編集開始時の候補。編集開始時の比較基準）

本書は固定Stage 1親007/008/028の6 ACに対するL4のデータ境界を、L6へ渡せる関数境界と型へ具体化する。要件の意味、owner、state、拒否理由、依存、版を追加・変更しない。対象はBRAIN知識source trace、knowledge record照会、descriptor/knowledge compatibility照合に限る。製品への書込み・送信・採用操作を実装する契約ではない。

## 1. 固定入力とtrace

| 入力 | 固定対象 | SHA-256 |
|---|---|---|
| BRAIN L4 | `docs/helix-brain/L4-basic-design/stage1-brain.md`（§1–6） | `a981efc23ea0e85303a600f469d2d989b991b378a4b89ac94cf34bce004ccc9c` |
| BRAIN L9 | `docs/helix-brain/L9-integration-verification/stage1-brain-integration-verification.md`（§1–6） | `2f61e7f4ff86db837b014f6500a143727df9611099106561aa74edca3e434787` |
| 共通カーネルL4/L9 | BRAIN L4 §4に固定されたK1–K10契約 | 同節の固定SHAを参照し、ここで再定義しない |

親本文はBRAIN L4 §1の6文書pinに固定する。対象revisionは007 `2919f7344f90ff8bde4db60ef7142b3c47bea0a8`、008/028 `debb4e3d682c5ad4835dafed7dbcbf33f24e9c8f`。007の委任formal/condition-3/main read-after chainと008/028の直接PO判断はL4 §1の範囲に限る。L3/L10本文全体の新しい承認状態は本書から生成しない。

| 契約 | L4 direct parent | L4/L9 locator | この詳細設計で下ろす境界 |
|---|---|---|---|
| 007 provenance trace | `BRAIN-007-AC-01/02` | L4 §2–3、L9 `IV-BRAIN-001`–`010` | 7 provenance groupとLABO評価対象revisionの計8 group、source identity/revisionのatomic field、owner別recordの読み取り・trace |
| 008 revision/state | `BRAIN-008-AC-01/02` | L4 §2–4、L9 `IV-BRAIN-011`–`019` | exact identity/revision/stateの照会、5状態とOS project-useの分離、旧revision保持 |
| 028 compatibility | `BRAIN-028-AC-01/02` | L4 §2–4、L9 `IV-BRAIN-020`–`027` | descriptor/knowledge軸の個別照合、HARNESS owner依存、range未解決時の局所Unknown |
| NFR測定 | 親007/008/028の既存NFR | L9 `IV-BRAIN-NFR-007-01/02`, `008-01/02`, `028-01/02/03` | 候補測定値を結果フィールドとして数えるだけ。新しいthreshold/SLA/acceptanceを作らない |

6件のfunctional AC以外に独立business ACはない。L4 §2とL9 §4のbusiness rowは「独立business outcomeなし」を保持する。業務KPI、画面条件、promotion threshold、承認gateを追加しない。

## 2. 共通の型・呼出し境界

以下はL4にある型の公開形を保つ詳細設計候補である。`SubjectRef`、`Observed<T>`、`ResultKey`、K2 `ResultRecord`、`EvidenceRef`、`UnknownReason`、`Applicable`、`BrainKnowledgeState`は共通カーネルまたはBRAIN L4の既存型を参照する。`ResultRecord`はK5 `restore`が復元する保存結果型であり、ここでrecord key/digest shapeを再定義しない。新しい結果class/reasonは定義しない。外部owner recordの読取はcaller側の読み取りsnapshotとして渡し、このpure evaluatorがowner権限やrecordの真正性を作らない。

```text
BrainSourceTraceInput = {
  knowledge: SubjectRef,
  provenance: Observed<ProvenanceRef>,
  evidence: Observed<EvidenceRef>,
  adopted_reason: Observed<ReasonRef>,
  evaluated_scope: Observed<ScopeRef>,
  counterexample: Observed<CounterexampleRef>,
  limitation: Observed<LimitationRef>,
  labo_evaluation_target: Observed<SubjectRef>,
  owner_records: {
    labo: Observed<SubjectRef>, os_registration: Observed<SubjectRef>,
    brain_verification: Observed<SubjectRef>, adoption: Observed<SubjectRef>
  }
}
BrainKnowledgeRecord = {
  knowledge: SubjectRef, version: Observed<VersionRef>,
  state: Observed<BrainKnowledgeState>, supersession: Observed<SubjectRef>
}
DescriptorCompatibilityInput = {
  descriptor: SubjectRef,
  descriptor_fields: Observed<DescriptorFieldSet>,
  requested_compatibility: Observed<VersionRef>,
  knowledge: SubjectRef,
  knowledge_state: Observed<BrainKnowledgeState>,
  declared_dependencies: OwnerDeclaredDependencySnapshot
}
```

`OwnerDeclaredDependencySnapshot`はL4固定親に列挙されたHARNESS L2-010/011およびBRAIN側のexact refsを、各ownerが読み取り可能な形で供給する境界名である。新しいregistry、authority source、dependency discovery algorithmを意味しない。実装言語上のclass/record表現、field ordering、serializationはL6で候補を選ぶ。runtime shape不正の分類は本書で新設しない。

| 公開関数候補 | 入力 → 戻り値 | 所有と副作用境界 | L4/L9 trace |
|---|---|---|---|
| `trace_source(input: BrainSourceTraceInput) -> BrainSourceTrace` | BRAIN knowledge ref、8 group、owner-record snapshot → L4のfield別K1観測を持つtrace | 読み取り専用。source completenessを認証せず、accepted/mature/adoptionを変更しない。各groupとownerを保持し、missing/stale/unknown/conflictを肯定にしない。 | 007 AC-01/02; `IV-BRAIN-001`–`010`; `IV-BRAIN-NFR-007-01/02` |
| `read_knowledge(query_key: ResultKey, records: Sequence<ResultRecord>) -> Observed<BrainKnowledgeRecord>` | K2 `key_of`が返したexact knowledge query keyとK5 `restore`が復元したrecord集合 → K2 `lookup`が選んだ保存結果 | BRAIN ownerの読み取りprojection。`ResultRecord`はK2の`key`、`key_digest`、`result: Observed<T>`、`result_digest`、`producer`を保持する既存CK型。record key/result digestを新しいBRAIN fieldとして複製しない。`key_of`が`ResultKey`を返した場合だけ呼び、K2 `Rejected`は呼出し元へそのまま返す。recordを更新しない。 | 008 AC-01/02; `IV-BRAIN-011`–`019`; `IV-BRAIN-NFR-008-01/02` |
| `compare_compatibility(descriptor, descriptor_fields, requested_compatibility, knowledge, knowledge_state) -> Observed<Applicable>` | L4 `DescriptorCompatibilityQuery`の`result`を除く既存field shape → 固定owner契約が供給する場合の比較観測 | callerは`result`を入力できない。descriptor/rangeの解釈と比較値はHARNESS descriptor/contract ownerの責務、knowledge identity/revision/version/stateはBRAIN ownerの責務。固定HARNESS owner契約に比較器とその結果の供給元が無いため、現時点では肯定結果を生成せず該当結果をUnknownのまま保つ。 | 028 AC-01/02; `IV-BRAIN-020`–`027`; `IV-BRAIN-NFR-028-01/02/03` |

これらは実装候補の公開面であり、L4/L9が定義していないowner IO、K3 permission、K5 append、K6 receipt作成、採否・state transition APIを含まない。状態変更を行う既存operationが後続で必要になった場合も、固定L4/K3 owner permissionとK4/ACの範囲に限り別途詳細化する。read APIの全呼出しにpermission gateを追加しない。

## 3. 個別API契約

### 3.1 `trace_source`

入力のgroupはL4 §2の形をそのまま使う。7 provenance groupは、`ProvenanceRef`内のsource subgroup（source identityとsource revisionの二つのatomic field）と、これとは別のprovenance group、evidence、adopted reason、evaluated scope、counterexample、limitationである。source identity/revisionのmember名や内部encodingは固定L4に列挙されていないため、本書で補わない。独立したLABO evaluation targetを加えて計8 groupとする。戻り値はL4 `BrainSourceTrace`そのもので、各provenance/owner fieldがそれぞれの`Observed<T>`を持つ。trace全体を包む`Observed<BrainSourceTrace>`は作らず、fieldごとのUnknown/Unobserved/Staleをそのfieldに保持する。

関数は入力fieldをowner別・field別にそのまま保持し、field単位の解決状態を返す。全field解決はfixtureで全fieldがValueであることとして確認し、trace全体に別のK1判定を付けない。入力に既存のUnknown/Unobserved/Staleが含まれるとき、その状態を該当fieldの所在とともに保持し、他fieldの読み取り結果を消さない。empty group集合を全充足へ読み替えない。source/LABO/OS/BRAIN/adoption間のwrite-backはしない。accepted/matureのしきい値、promotion action、source truthの証明はこの関数の責務ではない。

### 3.2 `read_knowledge`

引数`query_key`は、K2 `key_of`が`ResultKey`として返したexact keyであり、その`subject`が照会するknowledge `SubjectRef`である。必須key field欠落、Digest形式不正、inputs identity重複でK2が`Rejected`を返した場合は、呼出し元がその拒否をそのまま伝搬し、本関数を呼ばない。拒否をK1 `Observed`へ変換するtransportは置かない。record入力はK5 `restore`から得たK2既存型`ResultRecord[]`で、各recordが`key`、`key_digest`、`result`、`result_digest`、`producer`を持つ。関数は独自のrecord key/digestを合成せず、この集合と`query_key`をK2 `lookup(records, query_key)`へ渡す。旧revision Rのrecordを照会R2へ返さず、同revision content conflictを上書きしない。OS project-use履歴はこのrecordに格納・更新せず、OS ownerの別recordのまま扱う。

5状態 `current | superseded | deprecated | experimental | retired`は列挙値をそのまま保持し、別の優先順・利用可能性・遷移順を定めない。K2 lookupが返すK1 `Observed` class/stateは保存結果のものを維持する。K2 `Rejected(missing_key|invalid_digest|duplicate_identity)`はK2 `key_of`境界から呼出し元へ返し、`read_knowledge`へ入力せずK1 `Observed`にも変換しない。`version_target`はactual versionを満たさない。

照会から比較への接続では、`read_knowledge`のK2結果を先に確定し、その型付き結果を変換せず保持する。結果が照会したexact `ResultKey`に対する`Value(BrainKnowledgeRecord)`の場合だけ、そのrecordの既存`knowledge`と`state` fieldを`compare_compatibility`へ渡す。K2結果が`Stale`、`Unobserved`、`Unknown`のいずれかなら、その結果を`Observed<BrainKnowledgeRecord>`のまま保持し、prior値をcurrentとしてunwrapせず、比較器を呼ばない。これらを外側の`Observed<Applicable>`へどう写すかは固定L4/L5に対応mappingがないため局所未決とする。新しい公開型、K1 reason、K2結果の再分類は作らない。

### 3.3 `compare_compatibility`

descriptor側のidentity/kind、contract/artifact version、dependency identity/version、declared compatibility range、verification scopeはHARNESS descriptor/contract ownerの読み取り値である。knowledge identity/revision/version/stateはBRAIN側のexact recordである。入力はL4 `DescriptorCompatibilityQuery`の`result`を除くfieldから成り、caller提供の`result`やApplicable判定を受け取らない。関数はこの二軸を別々に照合し、軸の入替えやowner間write-backをしない。

固定HARNESS owner契約にrange comparatorとその結果の供給元が定義されていないため、本L5からApplicableを生成する経路は未定義であり、現時点では対象結果をUnknownとして保持する。既存のL4 `DescriptorCompatibilityQuery.result`は観測結果fieldであり、callerが入力する値ではない。comparatorのowner-side供給元が固定契約に明記された後に限り、そのownerが生成した観測を接続できる。range grammar/comparatorや供給APIは本設計で追加しない。range欠落・読取不能・解釈不能・依存未登録は該当field/ownerへ戻し、具体reasonが固定契約に無ければその分類は未決のままとする。outside-rangeを`NotApplicable`とするのは既存K1 reason/authority/re-entry条件が成立する場合だけであり、条件不明ならUnknownのまま。`version_target`をactual contract/artifact/knowledge versionとして使わない。

### 3.4 K契約・境界

| 既存契約 | BRAIN側での詳細化 | 境界 |
|---|---|---|
| K1 | `Observed<T>`を各field/operationで保持。empty/missing/unknown/staleを肯定しない。 | K1 class/reasonを追加しない。 |
| K2 | `key_of`成功時のexact `ResultKey`とK5 `restore`が返す`ResultRecord[]`をそのまま`lookup`へ渡す。 | identity/digest/duplicate拒否をK1 `Observed` variantにしない。独自record key/result digestを追加しない。 |
| K3 | 権限を要する既存状態変更だけcurrent owner declaration/current permissionで照合する。 | 読み取りcomparisonへ新規permission要求を足さない。 |
| K4/G3 | 既存declared obligation/oracle closureを参照する。 | BRAIN固有gate/共通義務を追加しない。 |
| K5/K6 | owner別recordとreceipt/read-setの既存契約を参照する。 | pure functionからphysical appendやsource truthを主張しない。 |
| K7/K8/K9/K10 | lifecycle、明示分類、independent review、typed dependencyを既存ownerへ接続する。 | BRAIN stateをgeneration/label/review/adoptionと混同しない。 |

### 3.5 旧sourceからの再利用・再導出・置換

資産ID、旧path、該当行、全文SHA-256およびledger状態はL4 §5の固定表（固定L4 bytesのlines 117–129）を正本とする。以下は当該旧sourceを再読し、このL5での利用範囲とconsumer/failureを下流化した対応表である。台帳行はいずれもHistorical/unresolvedであり、現行consumerの宣言ではない。旧test/runtime/CLIは実行していない。

| 旧資産ID・L4 §5 locator | 旧consumer/failureの意味 | L5での扱いと理由 |
|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` §5 row 1 | source-to-knowledgeの直接要件ではない隣接L3 | L2/L11からsource-trace fieldsを再導出。旧文を要件APIとして再利用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` row 2、`LEGACY-ASSET-1B990E15398E929D29BD` row 3、`LEGACY-ASSET-B1F8D6CA3685EBF0F322` row 4 | self-promotion、missing/stale/dangling provenance、owner境界漏れ | failure類型をtrace_sourceのfield保持・候補state不変へ再導出。旧role/schema/thresholdを置換。 |
| `LEGACY-ASSET-3345D03D82B0A5E7D9A6` row 5、`LEGACY-ASSET-8FECCE93E3996E8AAAFF` row 6 | migration/worker隣接範囲、memory runtime consumer | BRAIN runtime/memory JSONL/compaction/role tupleへ拡張せず、当該旧runtimeは置換対象外。 |
| `LEGACY-ASSET-9B7682EBDEA171005D45` row 7、`LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` row 8 | version/digest mismatch、exact package reference drift | exact SubjectRef/revisionとfield別照合へ再導出。旧package schema/case IDを再利用しない。 |
| `LEGACY-ASSET-C6052714FB506FB6271E` row 9 | typed identity/versioned registry、unknown/duplicate/conflicting reference | identity/revision/stateの分離を再導出。skill taxonomy/statusは置換。 |
| `LEGACY-ASSET-9114D4E463E95B67DD0C` row 10、`LEGACY-ASSET-C6ADB99F1353965C5449` row 11 | descriptor/schema境界、version/schema mismatch | descriptorとknowledge軸の分離および単独field oracleへ再導出。WCC schema/packetは置換。 |
| `LEGACY-ASSET-F542125805B777D8A56A`、`LEGACY-ASSET-34DF3B535879CC73FA86`、`LEGACY-ASSET-9A772391C7FB1298D45F` L4 §5末段 | 旧L3/L10層・functional/business/NFR分離、system verificationへのtrace | 文書分離と要求→oracle traceだけ保持。旧層番号、gate、runtime、business/NFR値を移さない。 |

## 4. L6への受渡しと未決境界

L6は上記3関数の候補signatureと型を保ち、pure input projection、K1/K2結果伝搬、owner snapshotとの境界、固定fieldの一変異をunit境界へ下ろす。`read_knowledge`はK2 key成功後とK5 `restore`の`ResultRecord[]`を受け、recordのkey/result digestを独自に構成しない。compatibilityのowner comparator供給元とUnknownのreason mappingは未決であり、解決までApplicable positiveを実装済みとして扱わない。物理reader/writer、database、adoption writer、LABO実行、OS操作、descriptor registry、permission transportは本設計から実装対象に昇格しない。fixture値は合成入力であり製品設定ではない。

| 未決事項 | 影響範囲 | 現在の扱い |
|---|---|---|
| compatibility comparatorのowner-side供給元と具体reason mapping | 028 range比較 | 固定HARNESS owner契約に comparator/result供給元がない。caller resultを受けず対象比較をUnknownに保つ。新API/reason/grammar/algorithmを作らない。 |
| source visibility/read authority | 007 source input読取 | 上流で解決済みのsource snapshotがなければ対象fieldだけUnknown。新permission APIを作らない。 |
| owner recordの実readerと物理完全性 | 007/008各owner record | L6/L7 stub/fixture境界。設計で存在・真正性・実読を主張しない。 |
| 不正なruntime shapeの分類 | 全API | 固定L4にない新reasonを作らず、型妥当性を入力前提として扱う。 |

L5/L8はdraftであり、L6/L7、実装、実行、receipt、NFR実測、採用・releaseの証拠ではない。
