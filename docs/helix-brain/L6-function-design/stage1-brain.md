---
title: "HELIX-BRAIN Stage 1 関数設計"
canonical_vmodel: L1-L12
canonical_layer: L6
canonical_pair: L7
layer: L6
kind: function_design
status: draft_candidate
authority_status: draft_candidate
stage: 1
paired_l5: ../L5-detail-design/stage1-brain.md
paired_l5_sha256: bc6c79656b0d67235f85ff21b6b47beeafbc12edccf5ca819fdd8a7d7d824ead
paired_l7: ../L7-unit-test-design/stage1-brain-unit-test-design.md
---

# HELIX-BRAIN Stage 1 関数設計

本書はBRAIN Stage 1のL5にある3公開関数候補とL8のfixture定義を、関数境界・入力保持・呼出し順へ下ろす設計草稿である。対象親は007/008/028、functional ACは6件、L9 functional oracleは27件、NFR oracleは7件である。親の意味、owner、state、reason、依存、versionを変更しない。外部owner reader、採否・state変更、実source読取、append/write、実行操作は本書に含めない。

## 1. 固定入力と状態

| 文書 | 固定対象 | SHA-256 |
|---|---|---|
| BRAIN L4 | `docs/helix-brain/L4-basic-design/stage1-brain.md` §1–6 | `a981efc23ea0e85303a600f469d2d989b991b378a4b89ac94cf34bce004ccc9c` |
| BRAIN L9 | `docs/helix-brain/L9-integration-verification/stage1-brain-integration-verification.md` §1–6 | `2f61e7f4ff86db837b014f6500a143727df9611099106561aa74edca3e434787` |
| BRAIN L5 | `docs/helix-brain/L5-detail-design/stage1-brain.md` 全文 | `bc6c79656b0d67235f85ff21b6b47beeafbc12edccf5ca819fdd8a7d7d824ead`（main `dce225c5ab731b9a95cf98a15ae7b670c63dd110`） |
| BRAIN L8 | `docs/helix-brain/L8-detail-verification/stage1-brain-detail-verification.md` 全文 | `7f1e074b5bd53f3bb41b8114a4d65265cf85e3bd47bb7bd8f23aa027951a8afa`（同main、上記L5を一方向参照） |
| Common Kernel L4 | `docs/helix-harness/L4-basic-design/common-kernel.md`（BRAIN L4 §4固定snapshot） | `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b` |
| Common Kernel L9 | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`（BRAIN L4 §4固定snapshot） | `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b` |

L3/L10親の対象revisionとauthority chainはBRAIN L4 §1を正本とする。007は`2919f7344f90ff8bde4db60ef7142b3c47bea0a8`、008/028は`debb4e3d682c5ad4835dafed7dbcbf33f24e9c8f`に限る。後続の別親改訂やmainの現在bytesへ承認を継承しない。PR #2777のmain統合は設計の根拠・実装許可・L9合格を生成しない。

L5の公開境界は`trace_source(input: BrainSourceTraceInput) -> BrainSourceTrace`、`read_knowledge(query_key: ResultKey, records: Sequence<ResultRecord>) -> Observed<BrainKnowledgeRecord>`、`compare_compatibility(descriptor, descriptor_fields, requested_compatibility, knowledge, knowledge_state) -> Observed<Applicable>`である。L8には97 functional fixture定義IDと7 NFR定義ID、計104の一意IDがある。L9は27 functionalと7 NFR、計34 oracleであり、fixture suffixから増やさない。L8 §2.1の3組再利用は同じ変異定義の複数IV traceであり、独立変異数へ重ねて数えない。

## 2. 実装候補と型境界

純粋projection候補はCPython 3.11+標準ライブラリ、`dataclasses`/`typing`、試験には`unittest`を選択する。固定L4/L5は言語を指定しない。既存共通カーネルのPython 3.11+詳細設計との型表現の揃いやすさ、外部依存なしにimmutable入力・Sequence順序・generic Observedを表現できる点を理由とする技術候補であり、要求や製品toolchainの選択ではない。Bun、旧runtime、旧CLIは使わない。

公開domain shapeはL4/L5にあるものだけを利用する。内部で運搬する場合はfrozen dataclass相当のin-memory containerに写せるが、wire schema、ProvenanceRefのmember encoding、DescriptorFieldSetのmember名、新enum/reason、独自ResultRecord/ResultKeyは作らない。`SubjectRef`は`kind/identity/revision/digest`を維持し、path/name/version_targetで代替しない。

```text
Observed<T>                  # Common Kernel K1既存型
SubjectRef, ResultKey        # Common Kernel K2既存型
ResultRecord                 # Common Kernel K2/K5既存型
BrainSourceTraceInput        # BRAIN L5 §2既存field shape
BrainSourceTrace             # BRAIN L4 §2のfield別Observed shape
BrainKnowledgeRecord         # BRAIN L4 §2既存shape
BrainKnowledgeState          # current | superseded | deprecated | experimental | retired
DescriptorCompatibilityInput # BRAIN L5 §2のL4 query.result除外shape
DescriptorFieldSet           # opaque existing owner shape; member shape未定
Applicable                   # BRAIN L4 §2の結果名。payload定義・producer未決
```

`BrainSourceTrace`は`Observed<BrainSourceTrace>`で包まず、各fieldが独立した`Observed<T>`を保つ。ProvenanceRefのsource identity/revisionは一group内の別atomic fieldだが、その内部member名・encodingは未定である。LABO、OS、BRAIN verification、adoption recordはそれぞれ別fieldとし、一つのrecordへ統合しない。

007のcoverage対象は7 provenance group（source identity/revisionは同一group内の2 atomic field）とLABO評価対象revisionの1 group、計8 groupである。これらとは別に4 owner record（LABO、OS registration、BRAIN verification、adoption）を個別fieldとして保持する。

## 3. L5公開関数のアルゴリズム

| Function ID | L5 API | 実装候補の段階 | assertion境界と未接続 |
|---|---|---|---|
| `BRAIN-L6-FN-01` | `trace_source(input)` | L5入力の`knowledge`、provenance/evidence/adopted_reason/evaluated_scope/counterexample/limitation/LABO target、4 owner recordを対応するL4 `BrainSourceTrace` fieldへ1:1投影する。全fieldを走査し、値の解決・比較・unwrap・再分類をせず返却shapeを組み立てる。 | 各`Observed<T>`のvariant・payload・key/evidenceを同じfieldで完全比較する。source identity/revision内部の6変異はmember shape未定のためmaterializeしない。ownerの意味判定・source authenticity・採否はassertしない。 |
| `BRAIN-L6-FN-02` | `read_knowledge(query_key, records)` | `query_key`はK2 `key_of`成功済みのexact `ResultKey`、`records`はK5 `restore`のValue payloadとする。列順を保った全record列とqueryを既存K2 `lookup(records, query_key)`へ渡し、そのK1 `Observed<BrainKnowledgeRecord>`をそのまま返す。 | own sort/current選択/record keyやdigestの再構成をしない。K2のValue/Stale/Unknown/Unobservedをそのままassertする。raw key拒否はこのAPIへ入れず、key_of境界で期待する。 |
| `BRAIN-L6-FN-03` | `compare_compatibility(...)` | HARNESS descriptor ownerのcurrent comparator/result producerは固定L4/L5に無い。descriptor fieldの読取、range parse、比較値の供給元も未接続のため、本APIのexecutable bodyとK1結果constructorはholdする。 | L8の期待class/reasonを満たしたと主張しない。callerがApplicableを注入する入力・比較callback・新APIを加えない。既存Observedを持つread projectionと比較oracleを区別する。 |

### 3.1 `trace_source`の処理順

1. typed `BrainSourceTraceInput`を受け取る。runtime shape不正を新しいK1/Rejected reasonへ分類しない。
2. L4の固定fieldと同名の入力fieldを1:1に写す。各Observedをbranchで評価せずそのまま保持する。
3. `owner_records`の4 roleを同名roleへ保持する。別ownerの値をidentityから推測して入れ替えない。
4. field別`BrainSourceTrace`を返す。group coverageはfixture/NFR側の記録であり、返却結果へ合成statusを追加しない。

検証範囲はpure projection、field位置、非Value保持である。LABOが評価済みか、sourceが完全に読めたか、owner recordが実在・真正か、candidateをaccepted/matureへ進めるべきかは解決しない。

### 3.2 `read_knowledge`とK2/K5境界

呼出し側はK2 `key_of`結果を先に確認する。`Rejected(missing_key|invalid_digest|duplicate_identity)`なら`read_knowledge`とlookupを呼ばず、K2拒否をK1 `Observed`へ変換しない。K2 `ResultKey`が得られた場合だけ、K5 `restore`を一度呼ぶ。restoreがUnknown/Unobserved/Stale等なら、その同じ非Valueをその場で伝搬し、lookupを呼ばない。restoreがValueの`ResultRecord[]`を返した場合に限りFN-02へ渡す。これはcallerの順序制約であり、新しいBRAIN public APIではない。

K2 lookupは固定Common Kernelの既存規則を使う。queryとrecordの完全keyを比較し、exact keyがなければK2のNotRun/Stale/Conflict規則に従う。旧revisionのValue/non-Valueをcurrentとしてunwrapしない。K5 restoreの完全prefix/record integrityを再実装せず、timestamp sortや独自current候補選択もしない。ResultRecordの`key`/`key_digest`/`result`/`result_digest`/`producer`を更新・補完しない。

L8の`KEY-MISSING`/`KEY-DIGEST`/`KEY-DUPLICATE`等はBRAIN `read_knowledge`のfixtureではなく共通K2 key boundaryの既存oracleを参照する。L7から既存共通K2 unit/oracleを再実装・二重計上しない。

### 3.3 `compare_compatibility`の局所hold

L4 `DescriptorCompatibilityQuery.result`は出力観測fieldでありcallerの入力にしない。固定HARNESS owner契約にdescriptor comparator・range grammar・owner結果供給元がないため、L5 signatureだけから具体的なApplicable/NotApplicable/Unknown mappingを実装してはならない。Unknown reasonを推測したり、理由のないK1 `Unknown`を構成したりしない。

L8の比較行はL9期待を落とす理由にはならない。実行可能なのは`read_knowledge`で既存knowledge record/Observedをそのまま取得して保持するfixtureである。descriptor member変異、range比較、cross-axis mismatch、lifecycle入力の非呼出しは、L5のmember/API/owner接続が無い箇所をowner返却・構造holdとして維持する。該当L9 oracleの満たし方や外側Observedへの写像が固定されるまではL7でpass oracleへ数えない。

## 4. Unit境界、依存、NFR

`trace_source`と`read_knowledge`は副作用のない関数候補である。K2 `lookup`への委譲とK5 restoreの呼出し順だけが既存共通関数境界であり、新しいowner callback/context parameterをBRAIN APIへ足さない。テストではsynthetic typed records/Observedを作り、必要なら既存K2/K5境界をstubする。実reader、HARNESS comparator、LABO/OS/BRAIN owner record、adoption operationはstubの成功から実接続済みとしない。

| L8/L9 scope | L6対象関数/境界 | 実装可能なassertion | 局所保留 |
|---|---|---|---|
| IV-001–010、007 NFR | `trace_source` | field-by-field equality、Observed variant/payload保持、未知identityの非置換 | source id/revision member名、LABO評価、owner mismatch分類、adoption判定 |
| IV-011–019、IV-012 key boundary、008 NFR | `read_knowledge` / K2 `key_of`/`lookup` / K5 caller boundary | exact record lookup、state/value保持、K2既存拒否/stale/conflict、不一致revisionの非fallback、restore非Valueでlookup未呼出 | restore caller product接続と外部owner record実在 |
| IV-020–027、028 NFR | compare API境界、knowledge record projection | K2 `read_knowledge`側のrecord保持のみ | comparator/result producer、DescriptorFieldSet member reader/encoding、range syntax、Applicable output |
| IV-025 lifecycle | API shape / no-call | BRAIN L5の3 API入力・出力に共通lifecycle actionが無いことのtrace | HARNESS lifecycle oracleはHARNESS ownerへ返す。BRAINから新K1 classificationを返さない |

NFR数値・coverage値はL3/L10のcandidate measurementであり、このL6にthreshold/SLA/合格条件を追加しない。L7 NFR caseは既存functional ID fixturesのmeasurement projectionで、別のfunctional mutation setを作らない。Business independent oracleは固定L4/L9どおり存在せず、L6関数を追加しない。

## 5. 旧HELIX対応

旧asset ID、path、span、full SHA-256、ledger statusはBRAIN L4 §5 lines 115–129を正本とする。L5 §3.5 / L4 §5の14 asset rowsを対象にし、archive bytesをread-onlyで再確認した。L4に記録されたfull SHA-256はarchive bytesの再計算値と一致し、ledger rowは全て`Historical/unresolved/unknown/consumer_refs=[]`である。

| 旧source群（L4 §5のasset/span/SHA） | L6/L7で保持する失敗・境界 | 再利用・再導出・置換 |
|---|---|---|
| `C7F0C3B79CBAA72960BF` (L4 row 1)、`FA8C6E69463183D6A19B` (row 2) | source-to-knowledgeが旧要件の直接対象ではないこと、worker≠promoter境界 | 現L2/L11/L4/L5 trace fieldから再導出。旧API/role schema/promotionを移さない。 |
| `1B990E15398E929D29BD` (row 3)、`B1F8D6CA3685EBF0F322` (row 4) | provenance missing/stale/dangling、owner混同 | field単位のObserved保持とowner role分離へ再導出。old memory schema/threshold/runtimeは置換しない。 |
| `3345D03D82B0A5E7D9A6` (row 5)、`8FECCE93E3996E8AAAFF` (row 6) | migration/worker隣接、orchestration memory runtime | BRAIN source trace scopeへ拡張せず、旧JSONL/CLI/compactionは再利用も実行もしない。 |
| `9B7682EBDEA171005D45` (row 7)、`6C9D2BE4E3C77D78F8EB` (row 8) | package version/digest mismatch、exact reference drift | K2 exact SubjectRef/revision lookupへ再導出。package schema/case/runtimeは置換。 |
| `C6052714FB506FB6271E` (row 9) | typed identity/versioned registry、unknown/duplicate/conflict | identity/revision/state分離を再導出しskill taxonomyを置換対象外にする。 |
| `9114D4E463E95B67DD0C` (row 10)、`C6ADB99F1353965C5449` (row 11) | descriptor/schema boundaryとversion mismatch | axis separationとfield fixtureへ再導出。WCC schema/packetは移さない。 |
| `F542125805B777D8A56A` (row 12), `34DF3B535879CC73FA86` (row 13), `9A772391C7FB1298D45F` (row 14) | 旧L3/L10成果物分離、ACからverificationへのtrace、失敗時差戻し | 文書・trace形だけ再導出。旧layer番号/G3/G10 gate/runtimeを作らない。 |

引用sourceの完全path、行範囲、SHA-256は各asset IDからBRAIN L4 §5へ戻る。個々の全文SHAを別途再掲して現行pinと誤認させない。旧consumer/failure記述は対応L3/test-designに記録された歴史であり、ledger上の現行consumerではない。archive runtime、CLI、test、CIを起動していない。

## 6. 実装外の残件

- `trace_source`のtop-level field projectionと`read_knowledge`のK2 lookup委譲はpure unit候補。production owner readerの接続は含まない。
- K5 restore非Valueの短絡はcaller boundaryのfixture候補であり、BRAIN production call siteはL4/L5で定義されていない。
- `compare_compatibility`のcomparator/result producer、descriptor member reader/encoding、Applicable payloadとK1 result mappingは局所未決。これらを埋めるまでcompare結果のunit oracleはhold。
- 製品module path/declaration/owner bootstrapはこのpairで確定しない。後続実装に登録済みidentityやL10 test executionを仮定しない。

このL6の設計statusはdraft_candidateのままである。以下は局所source候補の実装のみを示し、source owner connection、正式L8/L9/L10合格、L3再承認を示さない。

## 7. 局所source候補の実装状態

次のsource-only候補はL5で定めた公開関数のうち、既存観測のfieldwise保持と既存K2 lookupへの委譲だけを実装する。これは登録済みpackではない。`declaration.json`、型番、version、owner登録、依存登録は無く、repository-layout RL-C3を満たした利用可能packとも数えない。現owner reader、source currentness/truth、採用判断、descriptor comparatorは接続していない。

| 候補path | 実装した契約 | 未接続境界 |
|---|---|---|
| `helix/helix-brain/units/stage1-brain/src/brain.py` | L5 `BrainSourceTraceInput`と`BrainSourceTrace`の既存field shapeを局所dataclassで表現し、`trace_source`は各入力Observedを対応fieldへそのまま投影する。`read_knowledge`は渡されたexact `ResultKey`とK5 restore済みrecord列をCommon Kernelの既存`lookup`へ渡し、その戻り値をそのまま返す。 | 入力の生成元、owner declaration/current reader、K2 `key_of`・K5 `restore`のproduction caller、K3 permissionやK6 receiptは未接続。`compare_compatibility`は実装せず、公開API結果を生成しない。 |
| `helix/helix-brain/units/stage1-brain/tests/test_brain.py` | 合成入力に限り、field/owner別のObserved保持とK2 lookupのValue/Unknown/Unobserved/Stale結果保持を検査する。 | L8 formal fixture一式、production reader、descriptor comparator、adoption、NFR測定の実行ではない。 |

この実装候補の固定source bytesは`brain.py` SHA-256 `b2b856c3073d7a51e594362de3eaff9af7b76b6e9af6633fd214d2f3e8a05cce`、test bytesは`test_brain.py` SHA-256 `18ebfeaedc496c37adc0f000f472e8eb00b83f774cc05504be5259feb177a42f`である。L7 §7に記したunit commandの実行はこのcandidate bytesだけを対象にし、L8/L9 system fixtureを実行したものではない。

CPython 3.11+標準ライブラリと`unittest`を用いる。既存Common Kernel sourceへのimportはこの未登録source候補をローカルで確かめるためだけのもので、pack dependency declaration/registrationが存在することを意味しない。実装とtestは合成のK1/K2値を使い、旧source/runtimeは実行しない。

実際に検査できた局所候補の範囲は対L7 §7に記録する。`trace_source`は値の投影であり、sourceを実読したこと、ProvenanceRef memberの解釈、owner recordの真正性、adoptionの可否をassertしない。`read_knowledge`はK2の結果を変更しないlookup委譲であり、照会keyの生成、K5 restore非Valueのcaller短絡、保存sourceの実読をassertしない。L8/L9の正式oracleの充足状態は更新しない。
