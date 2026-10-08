# HELIX-HARNESS 共通カーネル L6関数設計（K1/K2）

status: draft
owner: HELIX-HARNESS
scope: K1/K2 only
paired_l5: ../L5-detail-design/common-kernel.md
paired_l7: ../L7-unit-test-design/common-kernel-unit-test-design.md
base: `main` at `33bbe8cd5f080be9e400e9259db22645bc620eda`

本書は現行Common Kernel L4 K1/K2の公開signatureと意味を、関数責務、内部処理、入出力境界へ下ろす候補である。要求、型の意味、失敗分類、owner authority、ResultKey lookup順を変更しない。Python 3.11+標準ライブラリを意味導出coreの実装候補とする技術的具体化を記すが、実装や実行結果は含まない。K3–K10は`not_designed`であり、L4/L9参照以外の詳細を定義しない。

## 1. 入力revisionと適用範囲

| source | 対象revision / SHA-256 | 対象 |
|---|---|---|
| Stage 1 PO decision | `docs/governance/decisions/helix-harness-stage1-l3-l10-po-decision-2026-10-05.md`, `efda65558a62b0d1caddd98d424704e60c5f827f6e9bf3eaadd861fd0259741e`; approved L3/L10 content revision `a77672513325aa9e79f3780af40455361b5d19a8` | HARNESS-L2-010/011/023 Stage 1 scope only |
| L4 Common Kernel | `docs/helix-harness/L4-basic-design/common-kernel.md`, content SHA-256 `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b` (main `33bbe8cd5f080be9e400e9259db22645bc620eda`) | K1 §2.1–2.6, K2 §3.1–3.5 |
| Repository Layout L4 | `docs/helix-harness/L4-basic-design/repository-layout.md`, content SHA-256 `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` (main `33bbe8cd5f080be9e400e9259db22645bc620eda`) | RL-C1–7, RL-D1–5, RL-T1–3, RL-K1–3 |
| L5 detail design | `docs/helix-harness/L5-detail-design/common-kernel.md`, content SHA-256 `6020c07fbe4fa0be0585a3c924ff238c63e17cc9279ec12f580c415e0293cc31` (本PRのcontent HEAD) | K1/K2 public types, signatures, owner boundary, old-source crosswalk |
| L9 integration oracle | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`, content SHA-256 `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b` (main `33bbe8cd5f080be9e400e9259db22645bc620eda`) | IV-K1-01–13; IV-K2-01–21d; design oracle, not run here |

K1/K2はL4 §1.3の共通部品であり単一の親要求を置かない。HARNESS Stage 1の下流traceは固定されたL2-010/011/023に限る。各契約からの直接親はL4 K1 §2.1、K2 §3.1のcrosswalkに従い、契約境界上のK1-I6→K2、K2 record→K5参照は追加の親要求にしない。後続stageを含む現在文書全体のbytesをStage 1 approved inputと扱わない。

旧sourceは再構築原則に従って先に読んだ。旧measurement evaluator、canonical digest、result idempotencyの限定的隣接要素を下記§7に対応づける。旧source/test/runtime/CLI/CIは一切実行していない。旧fixtureの歴史的passは新しい実行根拠ではない。

## 2. 公開型と関数signature

以下の型表現はL5のlanguage-neutral public APIをPython 3.11+で実装する候補である。`Observed`のvariantはL4 §2.2の意味・fieldを保ち、variantのshape妥当性は型として満たされた入力を前提とする。L4 K1-I6が`missing_key`とするのはResultKeyの5 fieldおよびsubject/input SubjectRefの4 fieldの欠落である。domain value/evidence等のshape不正へ`missing_key`を拡張せず、UnknownReasonを増やさない。

```text
ApiBoundaryResult<T> = T | existing Rejected(missing_key) case
# generic type-alias notation; add no Rejected class or reason

@dataclass(frozen=True)
class SubjectRef:
    kind: str
    identity: str
    revision: str
    digest: Digest

@dataclass(frozen=True)
class ResultKey:
    operation: str
    operation_version: str
    subject: SubjectRef
    inputs: tuple[SubjectRef, ...]  # identity順で一意
    scope: str

KeyOfResult = ResultKey | Rejected(missing_key | invalid_digest | duplicate_identity)

def combine(
    components: Sequence[Observed[T]],
    polarity: PolarityOf[T],
) -> ApiBoundaryResult[Combined[T]]: ...

# 同名combineの異種成分 overload: Sequence[tuple[Observed[object], PolarityOf[object]]]

def admit(combined: Combined[T]) -> ApiBoundaryResult[Admitted | Withheld]: ...

def disposition(
    reason: Text, authority: AuthorityRef, reentry_trigger: Text, key: ResultKey,
) -> ApiBoundaryResult[Observed[T]]: ...

def key_of(
    operation: Operation, operation_version: Version, subject: SubjectRef,
    inputs: Sequence[SubjectRef], scope: Scope,
) -> KeyOfResult: ...

def lookup(
    records: Sequence[ResultRecord[T]], query_key: ResultKey,
) -> ApiBoundaryResult[Observed[T]]: ...

def record(
    records: Sequence[ResultRecord[T]], key: ResultKey,
    result: Observed[T], producer: ProducerRef,
) -> Recorded | NoOp | Conflict | Rejected(missing_key | stale_not_recordable): ...
```

`ApiBoundaryResult[T]`はL4が既に定める`Rejected(missing_key)`を外側return unionへ足す型alias候補であり、新しいRejected classやreasonを作らない。keyを検査しないpublic normal returnはL5既存signatureどおりである。`record`はL5既存unionを使い、`Stale` resultはkey fieldの有無にかかわらず先に`Rejected(stale_not_recordable)`とし、非Stale resultの必須key field欠落だけを`Rejected(missing_key)`とする。いずれもL4/L5既存契約の境界であり、新しい結果classではない。その他の入力classをUnknownへ変換しない。

異種成分はL4 §2.5にある成分別`(Observed, PolarityOf)`入力形式を、同じ`combine`のoverloadとして表す。別の公開function名を作らず、同じ各成分対応を検査する。L5に書かれた`combine(components, polarity)`の公開境界は保持する。

`lookup`に与える`records`列はK5 `restore`が完全性を確認した全記録をK5の追記順で復元したものに限る。`Sequence`の順序を尊重し、K2はtimestampや別のsortで「最後」を再定義しない。K5 restoreが`Unknown(missing_input)`/`Unknown(unreadable)`等を返した場合はK2 lookupを呼ばず、その非Valueをcallerへ返す（L4 K5 `restore` / K2 §3.4）。

## 3. 関数と内部algorithm

関数IDはL6内のtrace識別子であり、新しいL4契約ID、public endpoint、approval/gateではない。各行は該当L4 invariantとL9 oracleを指し、L7 fixtureはこれらのIDを使う。

| ID | 関数 / visibility | 入力・出力 | 処理契約と失敗境界 | L4 / L9 trace |
|---|---|---|---|---|
| `CK-K1-FN-01` | `validate_result_key` / private | ResultKeyまたはObserved/Combinedに含まれる各key; valid/既存`Rejected(missing_key)` | L4 K1-I6が列挙するResultKey 5 field、SubjectRef 4 fieldを各受信境界で点検。欠落は呼出元へ既存`Rejected(missing_key)`として返し、成分として数えない。variant内domain value/evidence shapeをこの検査に混ぜない。 | K1-I6; IV-K1-08,12,13 |
| `CK-K1-FN-02` | `prepare_polarity_input` / caller/owner境界 | owner値とcurrent polarity mapping、完全key; 既存Observed input | 値型ownerがmappingを解決する。mappingありならその明示mappingで値を渡す。必要mappingが不在なら元のdomain Valueを`combine`へ渡さず、完全key付き`Unknown(missing_input)`を既存Observedとして構成する。これはkernel公開関数でなく、K1既存契約の入力準備境界。 | K1 §2.2/2.5; IV-K1-05 |
| `CK-K1-FN-03` | `combine` / public | 順序付き全components、単一polarity mappingまたはL4の各component `(Observed, PolarityOf)`; `ApiBoundaryResult[Combined]` | 各keyをFN-01で検査。欠落keyは外側unionの既存Rejected(missing_key)。正常時は全入力を順序のまま保持し、negative/non-value/excluded位置を全て蓄積する。否定が一つでもあればNegative、その他non-valueがあればUndetermined、全有効componentがpositiveならPositive。判定対象が0件ならUndetermined+whole `Unknown(missing_input)`。early-returnせず後続も蓄積する。 | K1-I1–I6; IV-K1-01–07,11 |
| `CK-K1-FN-04` | `admit` / public | Combined; `ApiBoundaryResult[Admitted or Withheld(reasons)]` | Combinedの全component keyをFN-01で再検査。欠落keyは外側unionの既存Rejected(missing_key)。正常時PositiveだけAdmitted。他は全negative/non-value/whole-set reasonをL4定義順でWithheldに保持する。Observed単体を受けるshortcutは置かない。 | K1-I2/I6; IV-K1-02–04,08,10,12,13 |
| `CK-K1-FN-05` | `disposition` / public | reason, authority, reentry_trigger, key; `ApiBoundaryResult[Observed]` | key欠落は外側unionの既存Rejected(missing_key)。keyが完全で3根拠がすべて成立した場合のみNotApplicableを返す。根拠欠落はL4既定のUnknown(invalid_disposition)。 | K1-I5/I6; IV-K1-07,12 |
| `CK-K2-FN-01` | `canonical_json_bytes` / private codec | L4 canonical JSON data model; UTF-8 bytes | CPython 3.11+ `json.dumps(ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False, check_circular=True).encode('utf-8', errors='strict')`候補。object keyは文字列限定、array order保持、Unicode normalizationなし。非JSON型、循環、孤立surrogate、nonfiniteはcodec入力不適合として拒否し、K1 class/`missing_key`/肯定へ変換しない。出力末尾にLFを付けない。 | K2 §3.2 (`canonical_json`); IV-K2-13,15,21a–d |
| `CK-K2-FN-02` | `sha256_digest` / private codec | exact bytes; prefixed Digest | `hashlib.sha256(bytes).hexdigest()`へ`sha256:` prefixとlowercase hexを付ける。structured dataはFN-01のcanonical bytesをhash。source-content refは取得したraw source bytesをそのままhashし、decode/re-encodeしない。K5 record newline/framingは別のstorage concern。 | K2 §3.2/I6; IV-K2-13,21,21c |
| `CK-K2-FN-03` | `key_of` / public | operation/version, owner current subject/input refs, scope; `KeyOfResult` | L4 §3.4の順で検査する。(1)必須key field欠落があれば`Rejected(missing_key)`、(2)必須fieldが存在する場合に`subject.digest`または任意の`input.digest`がDigest形式不正なら`Rejected(invalid_digest)`、(3)前段を通過後にinputs identity重複があれば`Rejected(duplicate_identity)`。各段で後続理由へ読み替えず、すべて通過した場合のみinputsをidentity順へ整列してResultKeyを返す。ownerが宣言したcomplete inputsだけを受け、legacy recordからcurrent refを逆算しない。KeyDigestはResultKeyのcanonical JSON bytesのdigest。 | K2 §3.2/3.4, K1-I6; IV-K2-13/13a/13b/15 |
| `CK-K2-FN-04` | `bind_alias_inputs` / private kernel construction; current mappingの解決はowner | role/context alias refs、独立binding ref; inputs | ownerが現在の全raw SubjectRef mappingをcanonical binding bytesにし、binding refと各source-content aliasをinputsへ含める。owner記録がbinding revisionを持つなら保持。ない場合はalias identity順の`{alias_identity, raw_revision}`だけから決定的に作りdigestをrevisionへ入れない。raw kind/identity/revision/digest全体はbinding bytesへ固定。完全一致raw refのみ同一alias内dedupし、同一alias内不一致はkey前にRejected(missing_key)。別aliasの同raw identityは拒否しない。 | K2 §3.4.1; IV-K2-21a/b/d |
| `CK-K2-FN-05` | `candidate_records` / private lookup step | complete records, query key; candidate subsequence preserving append order | query key欠落fieldは`lookup`外側unionの既存Rejected(missing_key)。operation/version/scope一致、subject identity一致、input identity set一致のrecordだけcandidate。候補0件ならUnobserved(not_run)。候補外identity集合変更は別の問い。 | K2-I2 step 1; IV-K2-08–09,17 |
| `CK-K2-FN-06` | `lookup_conflicts` / private lookup step | all candidates; conflict or continue | exact candidateの有無を先に選ばず、全candidateに対して同identity same-revision digest mismatch、またはkind mismatchを検査。どれかあればUnknown(conflict)。 | K2-I2 step 2; IV-K2-04–05,16,19 |
| `CK-K2-FN-07` | `lookup_exact_or_prior` / private lookup step | conflict-free candidates, query key; Observed | 全field exact matchがあれば保存classを返す。複数exactでresult_digest相違はUnknown(conflict)。exactなしなら旧revision候補を扱い、ValueはStale、Unknown/Unobserved/NotApplicableはsuperseded付きUnobserved(not_run)。旧候補複数は入力sequence上最後＝K5 append-order recordを使う。 | K2-I1/I2/I2b/I5; IV-K2-01–03,06–10,12,18,20 |
| `CK-K2-FN-08` | `record` / public pure decision | full records, key, `Observed` result, producer; Recorded/NoOp/Conflict/Rejected(missing_key \| stale_not_recordable) | `result`がStaleならkey検査より先に`Rejected(stale_not_recordable)`を返す（L5 K1-I6 / K2-I4）。非Stale resultのkeyを検査し、欠落は`Rejected(missing_key)`。正常な非Stale結果はownerが宣言encodingで構成済みのResultBodyのcanonical bytesからresult_digestを得る。同key+同result_digestならNoOp。同key+異result_digestなら双方保持するConflict。物理append/rollback/lockはしない。 | K1-I6, K2-I4; IV-K1-08, IV-K2-10–11 |
| `CK-K2-FN-09` | alias read handoff / owner + K6 boundary | expected key inputs, binding bytes, each alias source observation | callerがowner resolverを上書きしない。K6 readerがbinding bytesとaliasごとのraw bytesを別々に読む。raw bytes digest不一致はK6 L9のUnknown(conflict)。read identityはL4 K6 §10.3のsubject＋non-verifier inputs集合に一致し、raw identityの別readを加えない。K2自体はread receiptを作らない。 | K2 §3.4.1, K6 §10.3; IV-K2-21c, IV-K6 |

### 3.1 Canonical JSON候補の技術的具体化

L4 K2 §3.2はstructured dataについて「object keyを辞書順」「array順を保持」「非有限数を拒否」とする。上記Python serializer候補はその意味をコード選択へ具体化するが、新要求やcross-runtime equivalence claimではない。

```python
json.dumps(
    value,
    ensure_ascii=False,
    sort_keys=True,
    separators=(",", ":"),
    allow_nan=False,
    check_circular=True,
).encode("utf-8", errors="strict")
```

Codecの入力はJSON値モデルに限定し、辞書のkeyはすべて文字列であることをserialize前に確認する。Unicode normalizationは行わない。循環参照、nonfinite float、non-JSON Python object、孤立surrogateがあればcanonical bytesを出さず、内部codec failureとして上位へ返す。これはkey field missingではなく、K1 Observed resultにも自動変換しない。Public APIはL5の既存signatureに留め、内部例外名や新reason codeを公開しない。 `record`はL5 §3.4の入力前提どおり、ownerが宣言encodingで構成済みのcanonical JSON表現可能な`ResultBody`だけを受ける。範囲外の生の`T`から直接digestを求める公開経路を置かず、encoding未解決・範囲外値はowner境界で呼出しを保留する。private codecの拒否はその補助関数の単体入力検査であり、K2の返却unionや公開exception transportへ流さない。

`json.dumps`は文字列を返すため、その結果をUTF-8 strictでencodeする。canonical digest bytesにLF/newlineを付けない。K5 JSONLが必要とするrecord framing newlineはK5 storage layerのbytesであり、K2 canonical data digestへ含めない。

Python 3.11+の標準`json` optionは一次仕様に記載される（[Python 3.11 json documentation](https://docs.python.org/3.11/library/json.html)）。L7ではcanonical vectorsを固定し、float/integerの表現を含めて選択した実装環境で再現することを照合する。特にint、finite float、`-0.0`をvectorに含める。RFC 8785/JCSやNode `JSON.stringify`との互換を主張しない。

このserializerはK2 structured references/binding/keyに用いる。source-content aliasのdigestはraw source bytesのSHA-256であり、JSON parserを通さない。source bytesの一文字変更はraw digestの変更になる。raw digest変更に伴うrevision/key lookup結果はL4 K2 candidate orderに従う。

### 3.2 K5/K6 adapter境界

- K2 `lookup`の`records` inputは完全なK5 restore結果のrecord sequenceである。append orderがそのsequence orderに保持されることをpreconditionとする。K2関数はK5 partial readをempty sequenceとして処理しない。
- K2 `record`はpure decisionである。K5がappend-only保存とreadbackを所有する。L6 K1/K2にはfilesystem、database、lock、fsync、writer concurrency、transaction処理を追加しない。
- K2 alias bindingを作成してkeyへ含める責務はcurrent mapping ownerに残る。K6 readerは既存のrequired input/read-set contractに沿ってbinding bytesとsource bytesを照合する。L6はK6 readerのproduction implementationや署名/authorityを定めず、L7 K6 read boundaryはstub observationを使い「実読済み」の偽証を作らない。

## 4. 失敗分類と変換禁止

| 観測された条件 | L4での扱い | このL6で禁止する変換 |
|---|---|---|
| L4 K1-I6に列挙されたkey field欠落 | 受信境界で`Rejected(missing_key)` | 成分として数える、Unknown/Unobservedへ読み替える |
| polarity mapping不在 | caller/ownerが完全key付き`Unknown(missing_input)`を構成し、既存combineへ渡す | domain Valueをcombineへ渡す、kernelが独自mappingする、新タグ/新公開APIを導入する |
| K2 candidate集合にsame-revision/digest mismatchまたはkind mismatch | `Unknown(conflict)` | exact hitを先に返す、最新digestを選択する |
| K2 `key_of`での必須field欠落、Digest形式不正、inputs identity重複 | L5/L4 `KeyOfResult`の検査順に従い、それぞれ`Rejected(missing_key)`、`Rejected(invalid_digest)`、`Rejected(duplicate_identity)` | これらをK1 `Unknown`、共通`ApiBoundaryResult`、`record` unionへ移す、または検査順を変更する |
| exact match record | 記録されたclassのまま返す | 古い候補のappend orderでexact hitを置き換える |
| old Value / old non-Value | `Stale` / superseded `Unobserved(not_run)` | old revisionをcurrent Valueとして返す、staleを記録する |
| codec inputがcanonical JSON候補のdomain外 | bytesを作らない内部入力/codec failure | `Rejected(missing_key)`、K1 UnknownReason、肯定へ変換する |
| K5 restore incomplete/unreadable | restoreの既存非Valueを返し、lookupを呼ばない | partial list/空集合を完全記録集合としてlookupする |
| K6 source/binding digest不一致 | K6 current oracleに定めるUnknown(conflict)等 | binding readだけでraw source read済みにする、K2がsource bytesを自分で観測したと主張する |

`Stale`はlookupでだけ導出され、record不可。`record` conflict時には既存と新しいrecordの両方が保持され、上書きしない。これらの結果からapproval、gate、操作許可は生成しない。

## 5. K1/K2 L9 trace map

| L9 oracle | Function IDs |
|---|---|
| IV-K1-01–04 | `CK-K1-FN-02/03/04` |
| IV-K1-05 | `CK-K1-FN-02/03` |
| IV-K1-06–07 | `CK-K1-FN-03/05` |
| IV-K1-08–09,12–13 | `CK-K1-FN-01/03/04/05` |
| IV-K1-10–11 | `CK-K1-FN-03/04` |
| IV-K2-01–03,06–07,10,12 | `CK-K2-FN-05/07` |
| IV-K2-04–05,16,19 | `CK-K2-FN-05/06` |
| IV-K2-08–09,14–15,17 | `CK-K2-FN-03/05` |
| IV-K2-11 | `CK-K2-FN-08` |
| IV-K2-13 / 13a / 13b | `CK-K2-FN-01/02/03` |
| IV-K2-18,20 | `CK-K2-FN-05/07` |
| IV-K2-21 / 21a–d | `CK-K2-FN-01/02/04/09` |

## 6. 今回の対象外

K2 `key_of`はL5の専用`KeyOfResult`を返し、L4 §3.4が定める`missing_key`→`invalid_digest`→`duplicate_identity`の検査順を実装候補へ展開する。これらはK2 API境界の拒否であり、K1 `ApiBoundaryResult<T>`、`UnknownReason`、`record`の返却unionへ追加しない。役割内aliasの異なるraw refはL4 §3.4.1どおり`key_of`前に`Rejected(missing_key)`とする。

K3–K10は本書で`not_designed`。既存契約とoracleはCommon Kernel L4 §4–11、追加所有者節§14 (K10)、§15 (K7)、§16 (K3)、§17 (K9)、§18 (K8)、ならびにPair L9の対応IVを参照する。本書ではそれらの型やalgorithmを再記述しない。K1/K2からK5/K6へ渡す境界は上記§3.2だけであり、K5 physical writer実装、K6 verifier runner、K3/K8/K9個別authority semanticsを追加しない。

## 7. 旧HELIX source・保持点・差分理由

以下は既存L5 crosswalkと参照sourceの読み取りを起点とする。asset pathはarchive root相対。旧runtime/testを実行していない。

| 旧source / asset / source SHA | 読み取った保持点 | 現行差分と理由 |
|---|---|---|
| `LEGACY-ASSET-5E2592D7BB50EC290C9B`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md:22-30,48-70`, SHA `d446588a1fe6999e458a41f2c4683d34459ff7b12b28a057642cc2f6e15e6898`; consumer `archive/legacy-generation-2026-09-14/root/src/requirements/measurement-evidence-evaluator.ts:18-105,109-158,163-184,407-435,437-555`, SHA `9289fd16738f152b7c40d562e67aa57cfa8369cda7aecbe3743249d9c87e2f8a`; tests `archive/legacy-generation-2026-09-14/root/tests/measurement-evidence-evaluator.test.ts:157-185,258-279,323-355,404-448,507-517`, SHA `cfe1051a4a8b1a0634744837d704ab558f8a8295ffedf0df9d54f94923ce1f92` | 型付きobservation、不明状態を非肯定として保つこと、finding/component全件の保持、決定的なpure evaluation。 | 計測専用axisとred/green状態はK1ではない。componentを保持する規則をL4 `Observed`/`Combined`とcaller polarityへ再導出し、reason語彙/shape/thresholdは現L4に従う。Stage 1は機構横断の結果契約を持つため、旧evaluator schemaとfailure codeは置き換える。 |
| `LEGACY-ASSET-9A2C16ECB41E0E007EFF`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/digest-canonicalization-authority.md:12-30`, SHA `ac0dd11655279e0653726d4eeb06a90663c65663f36fc33a78be237f93f36b89`; old implementation `archive/legacy-generation-2026-09-14/root/src/shared/canonical-digest.ts:1-46`, SHA `c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000`; tests `archive/legacy-generation-2026-09-14/root/tests/digest.test.ts:10-28,128-170`, SHA `fef9cfe82f280fb79ff35b4516ee0e847965b57d479014bca32ff7ac8043a390` | canonical object key順/array順のtest、digest prefix型、不正値/nonfinite/cycle拒否、golden bytes互換性の確認方法。 | 旧Node実装は`JSON.stringify`、JSのkey sort、Node SHA-256を使う。現候補は上記CPython 3.11+ optionを用いる。`-0.0`を含む数値表記、UTF-8/Unicode、codec入力範囲の違いによりbytesが変わり得る。保持するのはprefix付きDigestの区別とcanonicalizable domain外を肯定しない点。`invalid_digest`/`duplicate_identity`とその優先順は旧sourceから移植せず、現行L4 §3.4/§3.4.1のK2境界から再導出する。L4 canonicalizationをStage 1のPython semantic-core候補で具体化する判断であり、旧consumer digestをauthorityとして継承せず、JCS/Node互換も主張しない。選択候補のbytesはL7 golden vectorで固定する。 |
| `LEGACY-ASSET-02319C2481B9E01698D5`, `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:361`, SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | 同じcommand IDとdigestなら既存receiptを返し、異なるdigestはconflictとする。 | 限定的なidempotency類似例として扱う。K2-I4のresult key意味へ再導出する。旧command receiptから現在のcandidate lookup順、alias型、stale policyを推測しない。 |
| L4 §3.5に記載のK2隣接source: pair gate (`LEGACY-ASSET-130EFBE7012012FF9281`)、engine detector (`LEGACY-ASSET-28B47108797C610AE0BC`)、exact CI HEAD binding (`LEGACY-ASSET-210D6B145CA997AE3CFA`) | revision/head変更で旧evidenceが失効すること、inputが明示されること。 | 完全keyとstale分類を現L4から再導出する。旧gate/engine固有のkeyや意味は共通K2を定義しない。 |

旧JS canonical encodingと選択したPython候補は、契約上同一bytesを保証しない。特に数値表記はruntimeに依存するため、旧golden outputを流用せず、L7で代表的なinteger、finite float、exponent、`-0.0`のvectorを固定する。保持するのは安定したcanonical bytes、型付きdigestの区別、範囲外入力の明示的拒否である。変更するのは実装codecとbytes vectorである。理由は現L4とStage 1のPython semantic-core候補であり、旧runtimeの存在や未完成さではない。上流要求の意味は変更しない。

## 8. 技術候補の比較と実装上の未決事項

| 候補 | 利点 | 制約と本草稿での判断 |
|---|---|---|
| CPython 3.11+標準lib `json`, `hashlib`, frozen dataclass, enum, tuple | Stage 1 semantic core候補に沿い、外部serializer依存がない。標準libがkey sort、compact separator、nonfinite拒否、循環参照検査、UTF-8 encodingを提供する。 | L6の実装候補として選ぶ。runtime相互等価の証明ではない。serializer optionとL7 byte vectorを固定する。 |
| 旧Node `canonicalJson` + `node:crypto` | 過去の実装とtestを比較資料にできる。 | 現行実装候補にはしない。実装言語/bytesは現authorityではなく、旧value digest互換もStage 1要求ではない。§7に旧sourceとの差分を記録する。 |
| RFC 8785/JCSまたは別canonical JSON package | 別途仕様化すればruntime横断codecにできる可能性がある。 | 採用しない。現L4/Stage 1にないbyte契約やtool依存を追加するため、相互運用性も主張しない。 |

以下は個別のPO質問や追加要求ではなく、技術候補である。L7 vectorでこの候補の挙動を固定する。vectorがL4意味を変更する場合、暗黙に採用しない。

- object keyは文字列とする。`json.dumps`が非文字列keyを文字列化する前に拒否する。
- object keyは固定したCPythonの挙動でsortし、array順を保持する。Unicode normalizationは行わない。
- UTF-8 encodingはstrictとする。孤立surrogateを含む文字列からdigestを出さない。
- `allow_nan=False`で`NaN`、正負infinityを拒否する。`check_circular=True`で循環containerを拒否する。その他の非JSON Python objectは`default` converterを設けずserializeに失敗させる。
- L7で選択したCPython候補のinteger/finite-float表記（負のzeroを含む）を固定する。locale形式やpretty whitespaceを使わない。
- raw source bytesはそのままhashする。source-content alias bytesにdecode、newline normalization、末尾LF追加、JSON canonicalizationをしない。

## 9. Unit packageと登録の接続点

K1/K2は一つのHARNESS-owned unitとして配置する候補であり、L6は既存L5 declaration項目を埋める追加関数や新しいschema fieldを定義しない。候補pathは`helix/helix-harness/units/common-kernel/`、identity/version/maturity/owner候補はL5 §7.1の`common-kernel` / `0.1.0` / `development` / `core: HELIX-HARNESS-CORE`である。`src/`はpure K1/K2、`tests/`はL7 suite、`fixtures/`は合成入力だけとし、K3–K10、K5 physical writer、K6 production readerは含めない。unit declarationの唯一のsource of truthと登録の解釈はrepository-layout RL-C1–7およびCK L4 §15.4/15.5に従う。

CPython 3.11+標準ライブラリ（`json`, `hashlib`, `dataclasses`, `enum`, `typing`）はL5/L6の実装候補、`unittest`はL7のrunner候補である。依存欄には登録済みHELIX pack依存を偽装して追加せず、標準library名を独立packageとして列挙しない。現declaration schemaにtoolchain専用fieldやroot設定を増やさない。pack dependencyが後に要る場合は、既存declared dependency type/identity/version欄の範囲で明示される。

Unitの初回登録は、declared bytesを含むGit revisionを先に確定し、その`FixedRef`と宣言全bytesのdigestをHARNESS ownerの`VersionRegistered`へ束縛する既存K5手順に従う。event schema、manifest writer、`SegmentOpened`条件はCK L4 §9.3/§15.4–15.5とL9 IV-LDG-01/02/04、IV-K5-22を再利用し、L6関数として実装しない。空の台帳から最初のmanifest segmentを作る操作は既存契約内で確認できず、物理bootstrapの証拠は未定義のままにする。これはK1/K2関数設計を止めず、初期登録を実在・完了として扱わない局所境界である。

## 10. Return境界union

L4 K1-I6で呼出し元へ返すK1拒否を、ここでは`ApiBoundaryResult[T] = T | Rejected(missing_key)`として表す。これは既存K1 `Rejected`結果の外側に置く型alias候補で、新しいclassやreasonではない。K1の`combine`、`admit`、`disposition`とK2 `lookup`は各L5既存signatureおよび`ApiBoundaryResult`境界を保つ。K2 `key_of`は別の専用union `KeyOfResult = ResultKey | Rejected(missing_key | invalid_digest | duplicate_identity)`を返し、定められた順で検査する。`record`はL5/L4既存unionを維持し、Stale resultなら鍵の有無を問わず`Rejected(stale_not_recordable)`を優先し、非Stale resultのkey field欠落なら`Rejected(missing_key)`を返す。公開exception transportは追加しない。recordの入力はL5 §3.4に従うcanonical JSON表現可能なResultBodyを前提とし、encoding未解決・範囲外の生値を渡す経路はowner境界で止める。private codecの範囲外入力をrecordの新しい返却結果へ変換しない。その他の失敗は既存L4 outcomeを使う。

## 11. 検証状態

本書は設計草稿である。L9 oracleは未実行。L6実装、unit test、serializer runtime、旧source/test/runtime、filesystem writerは実行していない。K5 append-order preconditionとK6 raw read behaviorは、後続の詳細設計およびL7 stubの境界としてのみ記述した。
