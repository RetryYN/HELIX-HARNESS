# HELIX-HARNESS 共通カーネル L6関数設計（K1/K2/K3/K4/G3/K5/K6/K7/G5/K8/K9/K10）

status: draft
owner: HELIX-HARNESS
scope: K1/K2/K3/K4/G3/K5/K6/K7/G5/K8/K9/K10
paired_l5: ../L5-detail-design/common-kernel.md
paired_l7: ../L7-unit-test-design/common-kernel-unit-test-design.md
base: `main` at `40e5467dc7d67a990ff12323d40974a2e480f339` (current integration base; prior bases `79020598e03fd7234cfa00306f6f6d3a5bd82fd0`, `7715e7025212ea1a778ab9711e2f43241f7999c7`, `f75199749888f7261772ba26e9feb58a33d9a04f`, `d5bb3455526c816b3af965db239c4b56207a884f`, `30e957ee900da7735b6c691bdb63b55cae7a0c95`, `46cbf9297a11b7f23f561a57b5cab21768fe075c` retained as history)

本書は現行Common Kernel L4 K1/K2/K3/K4/G3/K5/K6/K7/G5/K8/K9/K10の公開signatureと意味を、関数責務、内部処理、入出力境界へ下ろす候補である。要求、型の意味、失敗分類、owner authority、ResultKey lookup順を変更しない。Python 3.11+標準ライブラリを意味導出coreの実装候補とする技術的具体化を記す。K3には本書§12.4に記録した専用候補実装と単体検証があるが、owner接続、L9統合検証、製品動作の証拠ではない。K4/G3は本書§14、K6は§13で既存L5/L8設計を関数責務へ下ろす。K9は§16で詳細化する。K8は§17でL4 §18/L9 IV-K8-01–26を4つの既存L5 API境界へtraceする設計追補であり、owner接続・L9実行は未了。K10は§18でL4 §14/L9 IV-K10-01–14を既存L5/L8契約に沿って関数・fixtureへ展開し、実行・owner接続は未了。

## 1. 入力revisionと適用範囲

| source | 対象revision / SHA-256 | 対象 |
|---|---|---|
| Stage 1 PO decision | `docs/governance/decisions/helix-harness-stage1-l3-l10-po-decision-2026-10-05.md`, `efda65558a62b0d1caddd98d424704e60c5f827f6e9bf3eaadd861fd0259741e`; approved L3/L10 content revision `a77672513325aa9e79f3780af40455361b5d19a8` | HARNESS-L2-010/011/023 Stage 1 scope only |
| L4 Common Kernel | `docs/helix-harness/L4-basic-design/common-kernel.md`, content SHA-256 `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` (main `d5bb3455526c816b3af965db239c4b56207a884f`) | K1 §2.1–2.6, K2 §3.1–3.5, K3 §16, K4/G3 §13, K5 §9.1–9.8, K6 §10.1–10.9 |
| Repository Layout L4 | `docs/helix-harness/L4-basic-design/repository-layout.md`, content SHA-256 `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` (unchanged at main `d5bb3455526c816b3af965db239c4b56207a884f`; earlier pin `33bbe8cd5f080be9e400e9259db22645bc620eda`) | RL-C1–7, RL-D1–5, RL-T1–3, RL-K1–3 |
| L5 detail design | `docs/helix-harness/L5-detail-design/common-kernel.md`, current main source at `d5bb3455526c816b3af965db239c4b56207a884f`, content SHA-256 `3f3867df4e04927fbf05615984654f2994dd76ac71fed0ee420d5edce36a2c69`; historical PR #2751 source retained: commit `8d671541472f27a2d4d7b47992b6f428c0835eed`, content SHA-256 `ff24f1c74d17e3e5ed4aaedfc8163018891df6785de59e2de4fac3c33edf8ef4` (merge `dc803dacfbbe56f6daf7724832b1bfa238ff2087`) | K1/K2 §3; K3 §6.1.1–6.1.5; K4/G3 §8.1–8.4; K5 §6.2.1–6.2.7; K6 §9.1–9.5 |
| L8 detail verification (K6 fixed snapshot) | `docs/helix-harness/L8-detail-verification/common-kernel-detail-verification.md`, fixed source snapshot at main `fcf00128a7503317fa1c779c38cc8df3877b4952`, content SHA-256 `bdac36e29b8cd0a5cec34cedce6d419f5d5ecc8daea70cba851067bcc308dfac`; historical PR #2751 source retained: commit `8d671541472f27a2d4d7b47992b6f428c0835eed`, content SHA-256 `3927337491a79f600d02a1b153628f556d267c954b79f4be90cc7c0743dec9ee` (merge `dc803dacfbbe56f6daf7724832b1bfa238ff2087`) | K3 §5.1; K5 §5.2; K6 §8.1–8.3; fixtures are design inputs, not executed here |
| L8 detail verification (K4/G3 fixed snapshot) | `docs/helix-harness/L8-detail-verification/common-kernel-detail-verification.md`, fixed source snapshot at main `cb75db4daa35e84d4b2a02e3cb80dab6a84f127d`, content SHA-256 `9d441f69221eb2800182f08e49c159c271a77eccc482bdbfb45bc960d2b48753` | K4/G3 §7; 73 fixture IDs; historical design inputs, not executed here |
| L9 integration oracle | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`, content SHA-256 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` (main `d5bb3455526c816b3af965db239c4b56207a884f`) | IV-K1-01–13; IV-K2-01–21d; IV-K3; IV-K4-01–10; IV-G3-01–05; IV-K5-01–26 and ledger oracles; IV-K6-01–15; design oracle, not run here |

K1/K2はL4 §1.3の共通部品、K3の直接親はL4 §16.1、K5の直接親は§9.2のcrosswalkであり、単一のまとめ親を置かない。HARNESS Stage 1の下流traceは固定されたL2-010/011/023に限る。各契約の親は対応するL4 crosswalkに従い、契約境界上のK1-I6→K2、K2 record→K5、K3→K5/K6/K7参照は追加の親要求にしない。後続stageを含む現在文書全体のbytesをStage 1 approved inputと扱わない。

旧sourceは再構築原則に従って先に読んだ。旧measurement evaluator/canonical digestに加え、K5のevent/projection/checkpoint source・failure・consumerを下記§7/§7.1に対応づける。旧source/test/runtime/CLI/CIは一切実行していない。旧fixtureの歴史的passは新しい実行根拠ではない。

L5/L9のcurrent sourceは§1記載のmain `d5bb3455526c816b3af965db239c4b56207a884f`のcontent SHAを参照する。K3/K5/K6のL8固定snapshotと、K4/G3のmain `cb75db4daa35e84d4b2a02e3cb80dab6a84f127d`固定snapshotは、それぞれの§1/§14で明示しcurrent L8 pinと混同しない。L8のPaired L7 pinはL8→L7の一方向固定であり、この統合ではL8のPaired L7 pinだけを現L7へ同期する。

## 2. 公開型と関数signature

以下の型表現はL5のlanguage-neutral public APIをPython 3.11+で実装する候補である。`Observed`のvariantはL4 §2.2の意味・fieldを保ち、variantのshape妥当性は型として満たされた入力を前提とする。L4 K1-I6が`missing_key`とするのはResultKeyの5 fieldおよびsubject/input SubjectRefの4 fieldの欠落である。domain value/evidence等のshape不正へ`missing_key`を拡張せず、UnknownReasonを増やさない。

```text
ApiBoundaryResult<T> = T | existing Rejected(missing_key) case
# generic type-alias notation; add no Rejected class or reason

@dataclass(frozen=True)
class PolarityMapping(Generic[T]):  # 既存PolarityOfのPython表現候補
    identity: str
    version: str
    classify: Callable[[T], Polarity]

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

`PolarityMapping`はL4 §2.2/L5 §3.2が既に定める版付き`PolarityOf`の具体表現である。ownerがidentity/versionと値からPolarityへのcallableを明示し、`combine`はそのcallableを用い、`Combined.polarity`にはidentity/versionを保存する。異種入力は成分ごとのmetadata対応も保持する。関数名・qualnameからidentityを推測せず、版を補完しない。公開signatureのpolarity引数を増やさず、domain mappingをkernelへ追加しない。

異種成分はL4 §2.5にある成分別`(Observed, PolarityOf)`入力形式を、同じ`combine`のoverloadとして表す。別の公開function名を作らず、同じ各成分対応を検査する。L5に書かれた`combine(components, polarity)`の公開境界は保持する。

`lookup`に与える`records`列はK5 `restore`が完全性を確認した全記録をK5の追記順で復元したものに限る。`Sequence`の順序を尊重し、K2はtimestampや別のsortで「最後」を再定義しない。K5 restoreが`Unknown(missing_input)`/`Unknown(unreadable)`等を返した場合はK2 lookupを呼ばず、その非Valueをcallerへ返す（L4 K5 `restore` / K2 §3.4）。

K5の型と公開関数は、§1で固定したcurrent main L5本文の§6.2.1–6.2.2に従う。PR #2751の旧content revisionは履歴参照として§1に残し、単独K5候補の旧section番号を現行locatorとして流用しない。以下は同じ引数と戻り型のPython候補表記であり、物理storeの振舞いを実装するものではない。

```text
def append(segment, event, writer) -> Appended(SegmentHead) | NoOp | Conflict | Rejected(reason): ...
def current_head(segment: SegmentId) -> Observed[SegmentHead]: ...
def read(segment: SegmentId, head: SegmentHead) -> Observed[list[LogEntry]]: ...
def restore(log: LogDecl, scope: ScopeDecl, input_heads: list[SegmentHead]) -> Observed[list[ResultRecord]]: ...
def project(projector: Projector, scope: ScopeDecl, input_heads: list[SegmentHead]) -> Observed[Projection]: ...
def verify(projection: Projection, checkpoint: Checkpoint | None = None) -> Observed[Projection]: ...
def ledger_view(input_heads: list[SegmentHead]) -> Observed[LedgerView]: ...
```

K5 model types (`LogDecl`, `SegmentId`, `FixedRef`, `LogEntry`, `SegmentHead`, `ScopeDecl`, `Projector`, `Projection`, `Checkpoint`, event union)は固定L5親の§6.2.1のとおり使う。`LedgerView` fieldと既存Rejected理由はL4/L5で定義された形に限り、本書で追加しない。

本候補実装の`schema_version="1"`はcodec試験を動かすための局所候補値であり、登録済みschema versionやowner宣言値ではない。公開appendと`ledger_view(input_heads)`のowner source resolverは未接続である。appendのprivate coreは既存K3/K7の実観測結果またはL5で定義された既存拒否だけを扱う。`Rejected(missing_key)`はResultRecorded内のResultKey必須field欠落と、K2 `key_of`が同じ理由を返す境界に限り、`stale_not_recordable`と`peer_unreadable`もそれぞれL5既存条件だけで使う。writer/manifest/log/event/target/重複conflict等で外側reasonが固定されない場合、またはshape/canonicalization不正の場合は`_UNMAPPED_APPEND_VALIDATION`から局所`NotImplementedError`で停止し、`Rejected`や公開API例外transportへ写さない。K2が同じSegmentIdへの異なるhead refsを`Rejected(duplicate_identity)`とした場合も同じplaceholderである。これらは公開K5 union・設計済みclassificationではなく、対応fixtureはcoverage/passへ数えない。`_event_shape_valid`と`_event_valid`はunhashable kind、malformed nested fields、non-finite canonical value等の入力例外を吸収し、shape falseまたは未写像placeholderへ止める。保存`ResultBody`の未知/欠落class fieldや語彙はdecoderが受理せず、`restore`既存の`Unknown(unreadable, evidence=result_body)`経路へ送る。`ScopeDecl.log_id`と`LogDecl.log_id`/manifest・各segmentの`log_id`不一致の戻り分類は固定されていないため、該当する公開処理は局所`NotImplementedError`placeholderで肯定を止める。これはK5 result unionやAPI例外transportではなく、L7 coverage/passへ数えない。

## 3. 関数と内部algorithm

関数IDはL6内のtrace識別子であり、新しいL4契約ID、public endpoint、approval/gateではない。各行は該当L4 invariantとL9 oracleを指し、L7 fixtureはこれらのIDを使う。

| ID | 関数 / visibility | 入力・出力 | 処理契約と失敗境界 | L4 / L9 trace |
|---|---|---|---|---|
| `CK-K1-FN-01` | `_validate_result_key` / private | ResultKeyまたはObserved/Combinedに含まれる各key; valid/既存`Rejected(missing_key)` | L4 K1-I6が列挙するResultKey 5 field、SubjectRef 4 fieldを各受信境界で点検。欠落は呼出元へ既存`Rejected(missing_key)`として返し、成分として数えない。variant内domain value/evidence shapeをこの検査に混ぜない。 | K1-I6; IV-K1-08,12,13 |
| `CK-K1-FN-02` | `_prepare_polarity_input` / caller/owner境界 | owner値とcurrent polarity mapping、完全key; 既存Observed input | 値型ownerがmappingを解決する。mappingありならその明示mappingで値を渡す。必要mappingが不在なら元のdomain Valueを`combine`へ渡さず、完全key付き`Unknown(missing_input)`を既存Observedとして構成する。これはkernel公開関数でなく、K1既存契約の入力準備境界。 | K1 §2.2/2.5; IV-K1-05 |
| `CK-K1-FN-03` | `combine` / public | 順序付き全components、単一polarity mappingまたはL4の各component `(Observed, PolarityOf)`; `ApiBoundaryResult[Combined]` | 各keyをFN-01で検査。欠落keyは外側unionの既存Rejected(missing_key)。Valueのowner polarity mappingはL4が定めるPositive/Negative callableであることをcaller preconditionとし、型外callable結果を新しいObserved/Rejectedへ写さない。正常時は全入力を順序のまま保持し、negative/non-value/excluded位置を全て蓄積する。否定が一つでもあればNegative、その他non-valueがあればUndetermined、全有効componentがpositiveならPositive。判定対象が0件ならUndetermined+whole `Unknown(missing_input)`集合診断（class/reasonだけ。Observedではなくkeyなし）。component追加・key生成・成分key流用はしない。early-returnせず後続も蓄積する。 | K1-I1–I6; IV-K1-01–07,11 |
| `CK-K1-FN-04` | `admit` / public | Combined; `ApiBoundaryResult[Admitted or Withheld(reasons)]` | Combinedの全component keyをFN-01で再検査。欠落keyは外側unionの既存Rejected(missing_key)。正常時PositiveだけAdmitted。ただし`Combined`を直接受ける境界では、少なくとも一つのValueがあり、全componentがValueまたは成立済みNotApplicableで、`excluded`が成立済みNotApplicable位置と一致し、negative/non-value indexとwhole-set reasonが空であることを確認する。成立済みNotApplicableはL4 K1-I5に従いexcluded componentとして許容する。Positiveなのにnon-value、invalid disposition、空の有効成分集合、または集合診断がある場合はAdmittedにしない。既存の観測理由をWithheldに保持し、componentとindexが矛盾して原因を特定できない場合は既定whole `Unknown(missing_input)`を使う。他のverdictでは全negative/non-value/whole-set reasonをL4定義順でWithheldに保持する。Observed単体を受けるshortcutは置かない。 | K1-I2/I6; IV-K1-02–04,08,10,12,13 |
| `CK-K1-FN-05` | `disposition` / public | reason, authority, reentry_trigger, key; `ApiBoundaryResult[Observed]` | key欠落は外側unionの既存Rejected(missing_key)。keyが完全で3根拠がすべて成立した場合のみNotApplicableを返す。根拠欠落はL4既定のUnknown(invalid_disposition)。 | K1-I5/I6; IV-K1-07,12 |
| `CK-K2-FN-01` | `_canonical_json_bytes` / private codec | L4 canonical JSON data model; UTF-8 bytes | CPython 3.11+ `json.dumps(ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False, check_circular=True).encode('utf-8', errors='strict')`候補。object keyは文字列限定、array order保持、Unicode normalizationなし。非JSON型、循環、孤立surrogate、nonfiniteはcodec入力不適合として拒否し、K1 class/`missing_key`/肯定へ変換しない。出力末尾にLFを付けない。 | K2 §3.2 (`canonical_json`); IV-K2-13,15,21a–d |
| `CK-K2-FN-02` | `_sha256_digest` / private codec | exact bytes; prefixed Digest | `hashlib.sha256(bytes).hexdigest()`へ`sha256:` prefixとlowercase hexを付ける。structured dataはFN-01のcanonical bytesをhash。source-content refは取得したraw source bytesをそのままhashし、decode/re-encodeしない。K5 record newline/framingは別のstorage concern。 | K2 §3.2/I6; IV-K2-13,21,21c |
| `CK-K2-FN-03` | `key_of` / public | operation/version, owner current subject/input refs, scope; `KeyOfResult` | L4 §3.4の順で検査する。(1)必須key field欠落があれば`Rejected(missing_key)`、(2)必須fieldが存在する場合に`subject.digest`または任意の`input.digest`がDigest形式不正なら`Rejected(invalid_digest)`、(3)前段を通過後にinputs identity重複があれば`Rejected(duplicate_identity)`。各段で後続理由へ読み替えず、すべて通過した場合のみinputsをidentity順へ整列してResultKeyを返す。ownerが宣言したcomplete inputsだけを受け、legacy recordからcurrent refを逆算しない。KeyDigestはResultKeyのcanonical JSON bytesのdigest。 | K2 §3.2/3.4, K1-I6; IV-K2-13/13a/13b/15 |
| `CK-K2-FN-04` | `_bind_alias_inputs` / private kernel construction; current mappingの解決はowner | role/context alias refs、独立binding ref; inputs | ownerが現在の全raw SubjectRef mappingをcanonical binding bytesにし、binding refと各source-content aliasをinputsへ含める。owner記録がbinding revisionを持つなら保持。ない場合はalias identity順の`{alias_identity, raw_revision}`だけから決定的に作りdigestをrevisionへ入れない。raw kind/identity/revision/digest全体はbinding bytesへ固定。完全一致raw refのみ同一alias内dedupし、同一alias内不一致はkey前にRejected(missing_key)。別aliasの同raw identityは拒否しない。 | K2 §3.4.1; IV-K2-21a/b/d |
| `CK-K2-FN-05` | `_candidate_records` / private lookup step | complete records, query key; candidate subsequence preserving append order | query key欠落fieldは`lookup`外側unionの既存Rejected(missing_key)。operation/version/scope一致、subject identity一致、input identity set一致のrecordだけcandidate。候補0件ならUnobserved(not_run)。候補外identity集合変更は別の問い。 | K2-I2 step 1; IV-K2-08–09,17 |
| `CK-K2-FN-06` | `_lookup_conflicts` / private lookup step | all candidates; conflict or continue | exact candidateの有無を先に選ばず、全candidateに対して同identity same-revision digest mismatch、またはkind mismatchを検査。どれかあればUnknown(conflict)。 | K2-I2 step 2; IV-K2-04–05,16,19 |
| `CK-K2-FN-07` | `_lookup_exact_or_prior` / private lookup step | conflict-free candidates, query key; Observed | 全field exact matchがあれば保存classを返す。複数exactでresult_digest相違はUnknown(conflict)。exactなしなら旧revision候補を扱い、ValueはStale、Unknown/Unobserved/NotApplicableはsuperseded付きUnobserved(not_run)。旧候補複数は入力sequence上最後＝K5 append-order recordを使う。 | K2-I1/I2/I2b/I5; IV-K2-01–03,06–10,12,18,20 |
| `CK-K2-FN-08` | `record` / public pure decision | full records, key, `Observed` result, producer; Recorded/NoOp/Conflict/Rejected(missing_key \| stale_not_recordable) | 呼出し側は`result.key == key`を保証する。K2はこのfield間一致を再判定せず、新しい拒否理由を作らない。`result`がStaleならkey検査より先に`Rejected(stale_not_recordable)`を返す（L5 K1-I6 / K2-I4）。非Stale resultのkeyとresult内keyをそれぞれ検査し、どちらかの必須key field欠落は`Rejected(missing_key)`。正常な非Stale結果はownerが宣言encodingで構成済みのResultBodyのdeep-copied snapshot canonical bytesからresult_digestを得る。recordは入力Observed payloadをdeep copyしてdigestと保存projectionを構成し、呼出し側の元payload変更から記録時snapshotを隔離する。呼出し側は返却record内のnested payloadを後から変更しない。同key+同result_digestならNoOp。同key+異result_digestなら双方保持するConflict。物理append/rollback/lockはしない。 | K1-I6, K2-I4; IV-K1-08, IV-K2-10–11 |
| `CK-K2-FN-09` | alias read handoff / owner + K6 boundary | expected key inputs, binding bytes, each alias source observation | callerがowner resolverを上書きしない。K6 readerがbinding bytesとaliasごとのraw bytesを別々に読む。raw bytes digest不一致はK6 L9のUnknown(conflict)。read identityはL4 K6 §10.3のsubject＋non-verifier inputs集合に一致し、raw identityの別readを加えない。K2自体はread receiptを作らない。 | K2 §3.4.1, K6 §10.3; IV-K2-21c, IV-K6 |

### K5 function candidates

| ID | 関数 / visibility | 入力・出力 | 処理契約と失敗境界 | L4 / L9 trace |
|---|---|---|---|---|
| `CK-K5-FN-01` | `decode_canonical_line` / private pure | raw line bytes; parsed `LogEntry`または内部codec不適合 | L4 §9.3のcanonical JSON+単一LF境界を解析用に確認し、record framingのLFをJSON value digestへ混ぜない。K1結果/reasonへcodec不適合を写さない。 | K5-I2/I3; IV-K5-02/03/24–26 |
| `CK-K5-FN-02` | `validate_entry_schema` / private pure | decoded entryと`LogDecl`; valid entryまたは既存のread非Value | L4 §9.3のEvent 5 variantを閉じて検査する。このPython候補では外側variant tagを`kind`に符号化し、`DeclaredEvent.event_type`はdomain event名として別に保持する。`kind`欠落・未知値・shape不一致はread-side `Unknown(unreadable)`とし、restore/projectで読み飛ばさない。これはL5/L4のwire schema選択ではない。schema_versionとevent-to-log対応も照合し、新しい拒否reason/Observed分類を作らない。 | K5-I2/I3/I5/I6; IV-K5-03/11 |
| `CK-K5-FN-03` | `validate_segment_prefix` / private pure | entry sequence、指定`SegmentHead`; `Observed[LogEntry[]]`相当 | seq連続、prev/entry digest、canonical line、固定headを検査し、部分prefixをValueへしない。parse不能行・duplicate seqを含む場合は隣接関係を推測せず、観測できたI3条件の証拠を別々に保持する。 | K5-I1–I4; IV-K5-01–08/24–26 |
| `CK-K5-FN-04` | `validate_manifest_prefix` / private pure | manifest entries、manifest head; valid prefixまたは既存非Value | manifest自身の固定prefixを同じentry/segment規則で検査する。bootstrap/genesis作成手順は扱わない。 | K5-I3/I11; IV-K5-21/22 |
| `CK-K5-FN-05` | `validate_scope_heads` / private pure | `ScopeDecl`, manifest prefix, 全`input_heads`; complete scopeか既存`Unknown` | manifest headまでの登録segmentとscope全segment/headの対応を照合し、空/欠落scopeやdamaged prefixを完全読取とみなさない。 | K5-I4/I11; IV-K5-12/17/21 |
| `CK-K5-FN-06` | `resolve_fixed_ref` / private boundary helper | `FixedRef`と明示store observation `{bytes, observed_digest}`; decoded valueまたは既存unreadable observation | resolver側の実bytes観測はadapter stub入力。宣言storeとdigestが合う場合だけ呼出側へbytesを渡し、欠落/不一致はL5/L9既存`Unknown(unreadable)`を保つ。I/Oやstore実在を本書で実装しない。 | K5-I3/I11; IV-K5-12/21 |
| `CK-K5-FN-07` | `validate_event_for_log` / private pure | `LogDecl`, writer/segment, event, owner-bound manifest segment/head, restored manifest/peer observations; append前判定 | writer/segment/log/event型、登録済みsegment、必要な全manifest peerの健全性を照合する。ResultKey必須field欠落だけは`missing_key`、その他L5がK5外側reasonを定めない条件は`_UNMAPPED_APPEND_VALIDATION`へ分ける。SegmentOpenedはprivate contextのowner-bound `ScopeDecl.manifest_head.segment`へ追記し、payload `event.segment`は同じlogの開設対象として別に検査する。owner resolverから得たmanifest head/segmentの固定bindingを使い、callerから宣言や任意のappend先を受け取らない。実owner resolverは未接続であり、fixtureの初期化済みmanifestはstub観測である。K3 current authority/K7 assignment・fenceはstub境界とし、非肯定を越えてappend adapterを呼ばない。 | K5-I5/I6/I8; IV-K5-10/11/22/23 |
| `CK-K5-FN-08` | `validate_result_key_and_body` / private pure | `ResultRecorded` body, `LogDecl`; valid eventまたはL5既存Rejected | Restoreの`_record_from_event`とappend preflightは同じpure ResultBody shape validatorを使う。保存ResultKeyはK2 `key_of`で検査し、保存key objectは`operation`, `operation_version`, `subject`, `inputs`, `scope`の既知5 fieldに閉じる。未知fieldをdigest再計算前に黙って捨てず、restoreではprivate `None`から既存`Unknown(unreadable, evidence=result_body)`へ送る。appendではStaleをkey validationより先に既存`Rejected(stale_not_recordable)`へ写す。その他のK5外側reason未定義部分はlocal stopへ送り、新reasonを作らない。FixedRefのbytes解決はこのshape検査に含めず、FixedRef.storeは`LogDecl.store`と一致させる。 | K5-I5/I6; IV-K5-11/12補助 |
| `CK-K5-FN-09` | `order_segment_heads` / private pure | segment heads/entries; ordered sequence | `(writer NFC UTF-8 bytes, segment_no numeric, seq numeric)`のL4順を使い、時刻や読込順から因果順を作らない。 | K5-I7; IV-K5-16 |
| `CK-K5-FN-10` | `resolve_correction_tree` / private pure | `DeclaredEvent` roots、Correction event列、構築済みprojection `ResultKey`; corrected projection candidatesまたはK1既存Unknown | `project`が投影するのはL4 K5-I8の`DeclaredEvent`根とその`Correction`木であり、`ResultRecorded`のK2 `ResultBody`復元はFN-08/17の`restore`責務とする。保存keyの既知5 field以外は拒否し、未知fieldを正規化時に捨てない。same-log対象のtreeだけを展開し、一本鎖/retraction/branchをL4の既存結果へ投影する。順不同branchを追記順で選ばない。branch/cycleの`Unknown(conflict)`は既に構築されたprojection keyを保持する。 | K5-I8; IV-K5-13 |
| `CK-K5-FN-11` | `build_projection_key` / private pure | `Projector`, `ScopeDecl`, scope内のdeduplicated `input_heads`; `ResultKey` | projector/version/digest、manifestと宣言scope segment head inputs、scopeをL4 K5-I12どおりkeyへ束縛する。完全一致headは一件にする。ScopeDecl外のheadは黙って除外せず、外側結果写像が未定義の局所`NotImplementedError` placeholderで停止する。current headを暗黙取得して保存headを差し替えない。seq=0のgenesis head digest参照はFN-15と同じ固定写像を使う。 | K5-I4/I12; IV-K5-09/18 |
| `CK-K5-FN-12` | `fold_events` / private pure | ordered complete `LogEntry[]`, projector/scope, complete projection key; projection output+digest or key-bearing existing `Unknown` | event列から決定的にprojectし、同じprojector/scope/headの出力digestを返す。K1 `Observed`のkey必須条件を守り、projectionで構築済みの完全keyを訂正競合診断へ渡す。projectionはsource/eventへ逆流しない。 | K5-I8–I11; IV-K5-13–17 |
| `CK-K5-FN-13` | `verify_checkpoint_extension` / private pure | checkpoint, current fixed heads, full rebuild state and candidate incremental state; existing verify observation | same scope/forward extension/anchor/state digest/incremental-vs-full一致のL4条件を照合する。L4 K5-I13が不一致全体を`Unknown(conflict)`とするため、この候補は詳細なbranch別diagnosticを加えず、既存`{checkpoint: mismatch}` evidenceを保つ。外部checkpoint authorityや新reasonを作らない。 | K5-I13; IV-K5-19/20 |
| `CK-K5-FN-14` | `_append_with_context` / private preflight and existing-result handoff | segment/event/writer、owner-bound manifest segment/head、復元済みpeer、実際のK3/K7結果; 既存L5 append resultまたはK7既存Rejected | pure preflightは実装候補として分離する。ResultRecorded key/body shapeをFN-08で検査し、K5/L5で既存理由が定まる条件だけをそのまま返す。`missing_key`はResultKey必須field欠落またはK2 `key_of`の同理由、`stale_not_recordable`はStale、`peer_unreadable`はL5 K5-I5のResultRecorded全peer読取不能に限る。writer/segment mismatch、未登録log/segment、SegmentOpened不適合、DeclaredEvent未宣言、Conflict event不適合、Correction target不適合、canonicalization failure等のreason未定義条件はprivate placeholderで停止し、append/read portを呼ばず、coverage/passに数えない。Staleはkey欠落より先に`stale_not_recordable`を返す。SegmentOpenedのappend先はowner-bound `ScopeDecl.manifest_head.segment`から導いたprivate context値と一致させる。物理append portとowner resolverは未接続なので公開append実装・正常append完了を主張しない。K7から実際に返った`Rejected(fenced \| revocation_pending \| missing_authorization)`はそのまま保持できるが、未束縛をこれらへ推定しない。 | K5-I1/I5/I6/I8; IV-K5-10–11/22–23 |
| `CK-K5-FN-15` | `current_head` / public store observation | segmentとreader stub; `Observed[SegmentHead]` | segment全体の健全性を前提に、観測された現在末尾をそのclass/evidenceで返す。projectへ暗黙注入しない。 | K5-I2/I4; IV-K5-09 |
| `CK-K5-FN-16` | `read` / public store observation | segment bytes/head observation; `Observed[LogEntry[]]` | raw prefix bytesをheadまで固定して復元し、FN-01–03でchainを検査する。JSON decode後にschema_versionやseqのtyped shape不正、nested valueのcanonicalization不能があってもhost例外を公開せず、既存`Unknown(unreadable)`へ既存I3 evidence `(a)`/`(b)`を付ける。seq gap/duplicateやchain、head、raw-byte非canonicalityの既存`(c)`–`(h)`検査は保つ。partial prefixを成功扱いしない。 | K5-I1–I4; IV-K5-01–08/24–26 |
| `CK-K5-FN-17` | `restore` / public store adapter boundary | log/scope/input headsとmanifest/segment/FixedRef observation stubs; `Observed[ResultRecord[]]` | FN-04–06のscope/head/FixedRef検証後、各`ResultRecorded`をFN-08相当の`_record_from_event`で復元する。保存keyのK2検証またはbody復元に失敗した場合はprivate `None`を経由し、全体を既存`Unknown(unreadable, evidence=result_body)`で返す。非Valueではpartial recordsをK2 lookupへ渡さない。実reader/FixedRef storeの作用はstub。 | K5-I3/I4/I11; IV-K5-12/16/21 |
| `CK-K5-FN-18` | `project` / public pure projection | projector/scope/fixed heads and complete entries; `Observed[Projection]` | FN-09–12の順序/訂正/foldを使い、Projection key/output/digestを生成する。head discoveryやevent writeを行わない。 | K5-I4/I8–I12; IV-K5-09/13–18 |
| `CK-K5-FN-19` | `verify` / public verify composition | saved projection, optional checkpoint and fixed complete inputs; `Observed[Projection]` | 保存output/digestと再構築値を照合し、checkpointはFN-13条件が全て成立するときだけ用いる。不一致はL4既存`Unknown(conflict)`を保つ。 | K5-I10/I13; IV-K5-19/20 |
| `CK-K5-FN-20` | `_project_ledger_view` / private pure field assembly | `Projector`, `ScopeDecl`, exact input heads、rows/release/generation/immediate/recovery/actualの各既存観測; `Value[LedgerView]`または実K2 key diagnostic | 既存L4の4 field（`rows`, `release`, `target`, `actual`）を別々に保持し、target内のgeneration/immediate/recoveryを混ぜない。K5-I12 keyを付ける。owner宣言からのfield解決、FixedRef読取、field別非肯定の生成は未接続で、ここでは観測値を変換しない。 | K5-I12; IV-LDG-01/03（補助UTで純projection部分だけ） |

`project`はK5-I8に従うDeclaredEvent/Correction projectionだけを組み立て、ResultRecordedを復元対象として解釈しない。K2 ResultRecordとFixedRefを完全読取して返すのは`restore`の境界である。この分離はL4 §9.5の`project`/`restore`定義と旧`LEGACY-ASSET-BB08D70A42B6445B2D1E`（旧event-projection-checkpoint-replay.md:36–42, 62–64, 78–89, 119–122、full SHAは§7表）および`LEGACY-ASSET-C35E93F2D36777CD7462`（旧infinity-loop-platform-basic-design.md:145–153、full SHAは§7表）の「event streamを正本、projectionを導出結果とする」保持点から再導出した。従って、well-formed event streamにResultRecorded bodyが存在しても`project`はbody復元を保証しない。`restore`は同じ完全scopeのResultRecordedを復元し、いずれかのbody/keyが不正なら部分recordsを返さず既存`Unknown(unreadable, evidence=result_body)`とする。これは新しいrole/API/result reasonではない。

K5-I13はcheckpoint条件の不成立を一つの`Unknown(conflict)`へ定め、枝別evidence fieldを要求しない。FN-13/19は保存checkpointのscope、projector、input-head集合、同sequence digest、state digest、再構築一致のどの単独不一致でも同じ既存`{checkpoint: mismatch}`を返す。branch別に異なるreason/evidenceを追加しない。初回manifestが未登録のbootstrapもL4 §9.4のmanifest登録条件と§9.6の空台帳境界に含まれず、通常append条件を迂回する例外を作らない。既存初期化manifestのowner bindingがない状態はローカル未接続境界として保持し、正式bootstrap手順・成功結果・新reasonを定めない。

### K5 appendの事前条件と担当関数

固定L5 §6.2.2、L4 §9.4の既存条件を次の関数で検査する。違反時は既存のRejected／非肯定結果を保持し、記録bytesを変えない。

| 対象 | 既存事前条件 | 担当関数 |
|---|---|---|
| 全event | writerがsegment.writerと一致し、segmentがmanifestに列挙済み。current authority/assignment/fenceを迂回しない。 | CK-K5-FN-07/14 |
| ResultRecorded | ResultKey必須field、key/result digest再計算、class別ResultBody、宣言Inline型、LogDecl operation記録先を照合し、Staleを拒否する。全manifest segmentを読み、同key同digestはNoOp、異digestはConflict、peer読取不能なら追記しない。 | CK-K5-FN-07/08/14 |
| ResultConflictDetected | result_digestsが2件以上あり、各digestが同じkey_digestのResultRecordedとしてlogに記録済み。 | CK-K5-FN-07/14 |
| Correction | targetは同じlogのDeclaredEventか、DeclaredEventを根とするCorrection。ResultRecorded/ResultConflictDetected/SegmentOpenedを対象にしない。 | CK-K5-FN-07/10/14 |
| SegmentOpened | owner-bound `ScopeDecl.manifest_head.segment`への追記で、writerはmanifest_writer。payload `event.segment`は同じlogの開設対象であり、append先と同じsegmentとは限らない。private append contextは既存owner読取から得たmanifest bindingを受け、caller宣言は受けない。初回bootstrap例外を設けない。 | CK-K5-FN-07/14 |
| DeclaredEvent | event_typeがLogDecl.event_typesに宣言済み。 | CK-K5-FN-07/14 |

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

- K2 `lookup`の`records` inputは完全なK5 restore結果のrecord sequenceである。append orderがそのsequence orderに保持されることをpreconditionとする。K2関数はK5 partial readをempty sequenceとして処理しない。K5の物理reader/append/store portはL7でstub観測だけを与え、純粋関数の試験結果から物理I/Oを証明しない。
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

## 5. K1/K2/K5 L9 trace map

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
| IV-K5-01–08, 24–26 | `CK-K5-FN-01/02/03/16` |
| IV-K5-09 | `CK-K5-FN-11/15/18/19` |
| IV-K5-10–11, 22–23 | `CK-K5-FN-07/08/14` |
| IV-K5-12, 21 | `CK-K5-FN-04/05/06/17` |
| IV-K5-13–15, 17 | `CK-K5-FN-09/10/12/14/18` |
| IV-K5-16 | `CK-K5-FN-09/17` |
| IV-K5-18 | `CK-K5-FN-11/18/19` |
| IV-K5-19–20 | `CK-K5-FN-12/13/19` |
| IV-LDG-01/03 | `CK-K5-FN-20`（純projection部分のみ。source resolverは未接続） |

## 6. 今回の対象外

K2 `key_of`はL5の専用`KeyOfResult`を返し、L4 §3.4が定める`missing_key`→`invalid_digest`→`duplicate_identity`の検査順を実装候補へ展開する。これらはK2 API境界の拒否であり、K1 `ApiBoundaryResult<T>`、`UnknownReason`、`record`の返却unionへ追加しない。役割内aliasの異なるraw refはL4 §3.4.1どおり`key_of`前に`Rejected(missing_key)`とする。

K3は§12、K6は§13で詳細化する。K8は本書§17でL4 §18/L9 IV-K8-01–26の既存契約を下位化し、K10は§18でL4 §14/L9 IV-K10-01–14を下位化する。K1/K2からK5/K6へ渡す境界は§3.2、K3のK5/K6/K7境界は§12、K6のK5/K2接続は§13であり、physical writer、production verifier/reader、未定義owner責務を追加しない。

## 7. 旧HELIX source・保持点・差分理由

以下は既存L5 crosswalkと参照sourceの読み取りを起点とする。asset pathはarchive root相対。旧runtime/testを実行していない。

| 旧source / asset / source SHA | 読み取った保持点 | 現行差分と理由 |
|---|---|---|
| `LEGACY-ASSET-5E2592D7BB50EC290C9B`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md:22-30,48-70`, SHA `d446588a1fe6999e458a41f2c4683d34459ff7b12b28a057642cc2f6e15e6898`; consumer `archive/legacy-generation-2026-09-14/root/src/requirements/measurement-evidence-evaluator.ts:18-105,109-158,163-184,407-435,437-555`, SHA `9289fd16738f152b7c40d562e67aa57cfa8369cda7aecbe3743249d9c87e2f8a`; tests `archive/legacy-generation-2026-09-14/root/tests/measurement-evidence-evaluator.test.ts:157-185,258-279,323-355,404-448,507-517`, SHA `cfe1051a4a8b1a0634744837d704ab558f8a8295ffedf0df9d54f94923ce1f92` | 型付きobservation、不明状態を非肯定として保つこと、finding/component全件の保持、決定的なpure evaluation。 | 計測専用axisとred/green状態はK1ではない。componentを保持する規則をL4 `Observed`/`Combined`とcaller polarityへ再導出し、reason語彙/shape/thresholdは現L4に従う。Stage 1は機構横断の結果契約を持つため、旧evaluator schemaとfailure codeは置き換える。 |
| `LEGACY-ASSET-9A2C16ECB41E0E007EFF`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/digest-canonicalization-authority.md:12-30`, SHA `ac0dd11655279e0653726d4eeb06a90663c65663f36fc33a78be237f93f36b89`; old implementation `archive/legacy-generation-2026-09-14/root/src/shared/canonical-digest.ts:1-46`, SHA `c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000`; tests `archive/legacy-generation-2026-09-14/root/tests/digest.test.ts:10-28,128-170`, SHA `fef9cfe82f280fb79ff35b4516ee0e847965b57d479014bca32ff7ac8043a390` | canonical object key順/array順のtest、digest prefix型、不正値/nonfinite/cycle拒否、golden bytes互換性の確認方法。 | 旧Node実装は`JSON.stringify`、JSのkey sort、Node SHA-256を使う。現候補は上記CPython 3.11+ optionを用いる。`-0.0`を含む数値表記、UTF-8/Unicode、codec入力範囲の違いによりbytesが変わり得る。保持するのはprefix付きDigestの区別とcanonicalizable domain外を肯定しない点。`invalid_digest`/`duplicate_identity`とその優先順は旧sourceから移植せず、現行L4 §3.4/§3.4.1のK2境界から再導出する。L4 canonicalizationをStage 1のPython semantic-core候補で具体化する判断であり、旧consumer digestをauthorityとして継承せず、JCS/Node互換も主張しない。選択候補のbytesはL7 golden vectorで固定する。 |
| `LEGACY-ASSET-02319C2481B9E01698D5`, `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:361`, SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | 同じcommand IDとdigestなら既存receiptを返し、異なるdigestはconflictとする。 | 限定的なidempotency類似例として扱う。K2-I4のresult key意味へ再導出する。旧command receiptから現在のcandidate lookup順、alias型、stale policyを推測しない。 |
| L4 §3.5に記載のK2隣接source: pair gate (`LEGACY-ASSET-130EFBE7012012FF9281`)、engine detector (`LEGACY-ASSET-28B47108797C610AE0BC`)、exact CI HEAD binding (`LEGACY-ASSET-210D6B145CA997AE3CFA`) | revision/head変更で旧evidenceが失効すること、inputが明示されること。 | 完全keyとstale分類を現L4から再導出する。旧gate/engine固有のkeyや意味は共通K2を定義しない。 |

旧JS canonical encodingと選択したPython候補は、契約上同一bytesを保証しない。特に数値表記はruntimeに依存するため、旧golden outputを流用せず、L7で代表的なinteger、finite float、exponent、`-0.0`のvectorを固定する。保持するのは安定したcanonical bytes、型付きdigestの区別、範囲外入力の明示的拒否である。変更するのは実装codecとbytes vectorである。理由は現L4とStage 1のPython semantic-core候補であり、旧runtimeの存在や未完成さではない。上流要求の意味は変更しない。


### 7.1 K5旧sourceの実読・保持点と差分

旧K5単独L5候補の§6.6に列挙されたassetをarchive本文と`legacy-asset-disposition.jsonl`で再確認し、下表のpath・対象行・宣言SHAを照合した。§6.6は当時の候補内crosswalk locatorであり、現在の固定L5親ではK5詳細が§6.2に配置されている。各SHAはarchive source bytesのSHA-256と一致する。旧source、consumer、failureを起点に保持点と置換点を分け、旧DB/runtime/testは実行していない。

| Asset / 旧source (archive root相対) | 行 / full SHA-256 | 下流で保つ点 | 再導出・置換理由 |
|---|---|---|---|
| `LEGACY-ASSET-BB08D70A42B6445B2D1E` `docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md` | 36–42, 62–64, 78–89, 119–122 / `9e18d68b5e463192fb30b839eb164d79f7202a15374482f65181b238df8e513d` | append-only、訂正追記、eventからのprojection/checkpoint、readback/replay照合 | projectionを正本にしない点をK5へ再導出。旧event envelope/identityとharness.db authorityは現L4のLogDecl/ResultKeyへ置換。 |
| `LEGACY-ASSET-C35E93F2D36777CD7462` `docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md` | 145–153 / `2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | event→projection→checkpoint、sequence/hash chain、canonical JSONL | append chainは再導出し、aggregate transaction/SQLite形はwriter別segmentと読み取り時検査へ置換。 |
| `LEGACY-ASSET-8771887517A619A2D501` `docs/adr/ADR-007-harness-db-sqlite-projection.md` | 18–22 / `50c05a00872be6c23de531aaecd6a6cfd26abec264718e0223ac2630f739dcdf` | projectionは再構築可能でauthoring sourceではない | roleは保持し、保存方式はL4 K5 JSONL/FixedRefへ置換。 |
| `LEGACY-ASSET-9EDE8332CF4F627105EA` `docs/design/harness/L6-function-design/handover-db-derivation.md` | 35–38 / `e95e612c601ccb226b90e515eca633439745bb9a2266c889031ef7518c39d18d` | event先行、冪等projection、append後の再投影 | SQLite/DB優先規則を移さず、K5 appendとprojectionの境界へ再導出。 |
| `LEGACY-ASSET-F6E9EA3422A0EF1DF090` `docs/design/harness/L6-function-design/feedback-lifecycle.md` | 76–104 / `2e0a028fc48c6acc92a5b09ada9fc511ed0389b71af9deee782ec81aa731a655` | terminal状態を再投影で復活させない、generationを分ける、absenceはfull scan根拠を要す | domain lifecycle/TTL/人操作は移さず、全量scopeとrevision-bound projection keyへ再導出。 |
| `LEGACY-ASSET-F677F6D81EB9FCAE2E3F` `docs/governance/handover-retirement-memory-audit-2026-07-11.md` | 34–35, 56, 81 / `93b4a0bd78ebc88266eb3d795ad29384169a1fa8698691acbb724984f462d8b4` | 巨大CURRENT、marker drift、closed feedback復活/open飽和のconsumer failure | single-current pointer/stateを正本にしない点とcomplete scopeの必要性をK5-I11へ接続。新閾値/TTLは設けない。 |
| `LEGACY-ASSET-6929C09B95A444D95B49` `docs/improvement-backlog.md` | 258–260 / `e6d327ff488860dcaa8d7a150ac893e5cf0940eb710396cdf7ae746f5689a9e2` | false projector driftと470MB全件読取の未確定性能懸念 | projector key/checkpointを現L4から再導出。測定値/閾値をL6保証にしない。 |
| `LEGACY-ASSET-67B016392E3F7D58B053` `docs/design/harness/L5-detailed-design/module-decomposition.md` | 22–45, 74–93 / `da787dcfd95b0b4011dc1979df1b6652e990f75ffb71750c6ff9c24a2a24739a` | pure coreとI/O境界、責務分離 | dependency/module graphは再利用せず、pure helpersとstore adapterの分離へ再導出。 |
| `LEGACY-ASSET-310E87378AFE8095809C` `docs/design/harness/L5-detailed-design/physical-data.md` | 22–42, 101–114 / `a3064a3b705adcf0a5f76c3210aa431d87b7971aed2fe88f948a323a40c7772f` | source recordとprojection分離、append journalの監査性 | 旧`.helix/`/SQLite/event schemaは置換。L6ではphysical layoutを再定義せずRL契約を参照。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` `docs/design/harness/L6-function-design/source-boundary-contracts.md` | 28–44, 60–70 / `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | declared source boundary、pathから権威を推測しない | source-edge policyは移さず、未登録segmentをmanifestで確認する現L4条件へ対応。 |
| `LEGACY-ASSET-656F75AF81EE933415D9` `docs/design/harness/L5-detailed-design/durability-boundaries.md` | 24–30, 43–52 / `b6c4c6f58259b6c09f6cd52a64ab1fb7b04114a41d2b1089fdc5b9730f8666d5` | ambiguous write/recoveryを肯定しないこと | atomic publish/claim/recovery implementationはL6から除外。K5 append portはstubに留め、L4/L9とRL-P7責務を越えない。 |
| `LEGACY-ASSET-B6DC14C1DA937E3AC96C` `docs/design/helix/L5-detail/node-runtime-cutover.md` | 47–53, 106–112, 123–129 / `49f3e4c324b19e728f7c05787bbd698f841728a526eedc7cec3f756b3601e9f9` | 失効epoch/古いwriterを通さないfailure条件 | これはK7 sourceでありK5一般APIへ移植しない。既存K7 fenceとの接続だけstub境界で参照。 |
| `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` | 117, 198 / `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | late result/fenceとdurable checkpointのhistorical context | old requirement snapshotをauthorityへ昇格しない。current L4 K7/K5接続のみ保持。 |
| `LEGACY-ASSET-BC2275DCE9BFFCF813C8` `docs/design/helix/L5-detail/python-worker-runtime.md` | 133–136 / `4c26544b5cf6e63ed226838ff5e04b3a669f6a9aa13456ffc5e5fb41fc755f8a` | canceled/expired runのlate result拒否と新run再開 | worker runtime semanticsはK5へ持ち込まず、既存current assignment/run fenceをstubとして接続。 |
| `LEGACY-ASSET-1B413588CFF3B1360B49` `docs/adr/ADR-009-node-python-linux-runtime.md` | 113–120 / `bdd1c9a00243b723342e42531ddeabbf2f7570594943c11226d5b0461769753c` | irreversible actionへauto fallbackしない historical context | K5 L6にcutover/rollback behaviorを追加しない。 |
| `LEGACY-ASSET-D461943347D372ECF6DA` `docs/governance/candidates/security-engagement-authority-requirements.md` | 33, 43 / `38a68e48ca26cb277b6f5d88439b33b58aecf48f5b650f7596aec04e438b6b16` | revoke伝播のhistorical failure context | 未承認候補から新要求/authorityを作らず、current K3/K7既存契約だけを呼出しstubとして保つ。 |

この追加はL5/L8で定義済みのK5意味をL6関数責務へ展開する。genesis/bootstrap、物理writer保証、旧CLI/DB/runtime/testの再利用は主張しない。

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

K1/K2は一つのHARNESS-owned unitとして配置する候補であり、L6は既存L5 declaration項目を埋める追加関数や新しいschema fieldを定義しない。候補pathは`helix/helix-harness/units/common-kernel/`、identity/version/maturity/owner候補はL5 §7.1の`common-kernel` / `0.1.0` / `development` / `core: HELIX-HARNESS-CORE`である。`src/`はpure K1/K2、`tests/`はL7 suite、`fixtures/`は合成入力だけとし、K3–K10の実装、K5 physical writer、K6 production readerは含めない。K3の関数fixture草稿は§12にtraceするが、L5 declarationの配置・登録scopeやunit identityを変更しない。unit declarationの唯一のsource of truthと登録の解釈はrepository-layout RL-C1–7およびCK L4 §15.4/15.5に従う。

CPython 3.11+標準ライブラリ（`json`, `hashlib`, `dataclasses`, `enum`, `typing`）はL5/L6の実装候補、`unittest`はL7のrunner候補である。依存欄には登録済みHELIX pack依存を偽装して追加せず、標準library名を独立packageとして列挙しない。現declaration schemaにtoolchain専用fieldやroot設定を増やさない。pack dependencyが後に要る場合は、既存declared dependency type/identity/version欄の範囲で明示される。

Unitの初回登録は、declared bytesを含むGit revisionを先に確定し、その`FixedRef`と宣言全bytesのdigestをHARNESS ownerの`VersionRegistered`へ束縛する既存K5手順に従う。event schema、manifest writer、`SegmentOpened`条件はCK L4 §9.3/§15.4–15.5とL9 IV-LDG-01/02/04、IV-K5-22を再利用し、L6関数として実装しない。空の台帳から最初のmanifest segmentを作る操作は既存契約内で確認できず、物理bootstrapの証拠は未定義のままにする。これはK1/K2関数設計を止めず、初期登録を実在・完了として扱わない局所境界である。

現在の`read`, `current_head`, `restore`, `project`, `verify`候補は公開関数を直接呼ぶfixtureで照合する。`current_head`は空でない実stream全体のseq/chainを検査し、seq=0 tailをgenesisへ読み替えない。異なるhead refsでK2が`Rejected(duplicate_identity)`を返す経路はK5外側への対応が未定義のため`NotImplementedError`で停止し、K5 API resultとして扱わない。`read`のhead.segment不一致はK5-I3(g)の指定head不成立として`Unknown(unreadable)`にする。`ScopeDecl.log_id`、`LogDecl.log_id`、manifest/segmentのlog identity不一致は、既存分類が定まらないため局所placeholderで停止する。appendのResultRecorded shape検証はrestoreとpure validatorを共有するが、K5外側reason未定義の不正key/bodyはprivate placeholderで肯定・I/Oを止める。appendと`ledger_view`の公開owner adapterは未実装であり、private core/helperの単体確認を公開API実装・実読・追記の合格へ数えない。

## 10. Return境界union

L4 K1-I6で呼出し元へ返すK1拒否を、ここでは`ApiBoundaryResult[T] = T | Rejected(missing_key)`として表す。これは既存K1 `Rejected`結果の外側に置く型alias候補で、新しいclassやreasonではない。K1の`combine`、`admit`、`disposition`とK2 `lookup`は各L5既存signatureおよび`ApiBoundaryResult`境界を保つ。K2 `key_of`は別の専用union `KeyOfResult = ResultKey | Rejected(missing_key | invalid_digest | duplicate_identity)`を返し、定められた順で検査する。`record`はL5/L4既存unionを維持し、Stale resultなら鍵の有無を問わず`Rejected(stale_not_recordable)`を優先し、非Stale resultのkey field欠落なら`Rejected(missing_key)`を返す。公開exception transportは追加しない。owner polarity callableの型外戻り値とcanonical JSON domain外の入力は既存型の前提違反であり、K1/K2のresult classやreasonへ写さない。recordの入力はL5 §3.4に従うcanonical JSON表現可能なResultBodyを前提とし、encoding未解決・範囲外の生値を渡す経路はowner境界で止める。scope外である完全な`key`と`result.key`の不一致はcaller precondition違反であり、新しいRejected reasonを作らない。入力Observedをdeep copyしたsnapshotからdigestを算出し、callerが保持する元dict/listの後続変更で記録済digestとsnapshotが分離しないようにする。callerは返却record内のnested payloadをさらに変更しない。private codecの範囲外入力をrecordの新しい返却結果へ変換しない。その他の失敗は既存L4 outcomeを使う。

## 11. 検証状態

本書は設計草稿である。L9 oracleは未実行。K3専用候補実装と194 formal L7 fixtureおよび26件の別ID回帰確認の実行範囲・結果・限界は§12.4に記録した。K1/K2/K5 suite、serializer runtime、旧source/test/runtime、filesystem writerはこのK3作業では実行していない。K5 append-order preconditionとK6 raw read boundaryは§13の設計およびL7 fixture境界として記述し、reader実接続やL9実行の証拠とはしない。


## 12. K3関数設計

本節はL4 §16の既存K3 API・不変条件を、§1のcurrent main L5親とPR #2751固定snapshotのL8親の関数責務へ下ろす技術草稿である。L4/L9の意味、K3 `PermissionCheck` union、owner責務、K1/K2契約を変更しない。L5の直接locatorは§6.1.1–6.1.5、L8は§5.1および§5.1.1–5.1.2である。PR #2751の当時のreview対象commit/content SHAは§1に履歴参照として保持する。

| 参照元 | 本文SHA-256 / revision | 対象範囲とpin状態 |
|---|---|---|
| Common Kernel L4 | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696`, main `d5bb3455526c816b3af965db239c4b56207a884f` | §16.1–16.6、固定上流契約 |
| Common Kernel L9 | `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`, main `d5bb3455526c816b3af965db239c4b56207a884f` | IV-K3-01–17、IV-K3-14a–j、oracle未実行 |
| K3 L5 parent | current §1 L5 blob at `d5bb3455526c816b3af965db239c4b56207a884f`, SHA-256 `3f3867df4e04927fbf05615984654f2994dd76ac71fed0ee420d5edce36a2c69`; historical PR #2751 commit/SHA is retained in §1 | §6.1.1–6.1.5 |
| K3 L8 parent | historical PR #2751 fixed source at commit `8d671541472f27a2d4d7b47992b6f428c0835eed`, SHA-256 `3927337491a79f600d02a1b153628f556d267c954b79f4be90cc7c0743dec9ee` (merge `dc803dacfbbe56f6daf7724832b1bfa238ff2087`) | §5.1–5.1.2 |

L4 §16.2の`PermissionQuery`、`PermissionQueryRef`、`OperationAuthorityTuple`、`AuthorityInputRef`、`AuthorityInputBindingRef`、`HeadInputRef`、`PermissionCheckResult`、`PermissionCheckDiagnostic`、`PermissionCheck`をその型のまま使う。公開APIは既存の`resolve_authority_context(query, input_heads)`と`check_permission(query, permission, input_heads)`の二つだけである。入力の`PermissionQuery`、`PermissionRecord`、`Digest`およびowner参照はL4のtyped input前提を満たすものとする。runtime shape validator、shape不正のreturn class、追加reasonは定義しない。

L4 §16.2の`PermissionQuery`は`{operation, target, revision: SubjectRef, requested_scope, operation_inputs}`の5 fieldである。operationは`read | write | execute | network | install | delete | merge | release | deploy | credential-use | security-change`の11種に限る。両公開APIはこの既存closed unionを入口で検査し、外の値は既存`PermissionCheckDiagnostic(invalid_query)`で返す。これはtyped `PermissionQuery`を構成していない入力の境界であり、新しいdomain state/reasonではない。callerはactor/environment/contextを渡さず、current owner resolverがOS assignment、INFRASTRUCTURE environmentおよび各ownerのcurrent declarationから構成する。

K3関数候補と責務境界は次のとおり。IDはL6 trace用で、新しい公開APIではない。

| ID | 関数 / 可視性 | 責務と境界 | L4 invariant / L9 trace |
|---|---|---|---|
| `CK-K3-FN-01` | `derive_permission_query_ref` / private | typed `PermissionQuery`からL4式どおりidentity/revision/digestを決定的に導く。caller提供refで上書きしない。 | K3-I4; IV-K3-03/14f–h |
| `CK-K3-FN-02` | `resolve_owner_mapping` / SECURITY等owner resolver境界 | owner current declarationsから全role-bound raw refsを解決し、完全mapping bytes・binding ref・source-content aliasesを得る。caller mappingはauthorityにしない。同一alias内の完全一致だけdedupし、同一alias異refはL4 `docs/helix-harness/L4-basic-design/common-kernel.md:256`で定めるとおりK2 `key_of`前に既存`Rejected(missing_key)`として返す。K3はprivate owner portの型付き戻り値を登録済みowner resolverの出力として受けるが、record/source/current refsの整合を別途照合する。 | K3-I4/I6; IV-K3-14/14a–j |
| `CK-K3-FN-03` | `construct_k3_key_inputs` / 内部合成 | query ref、binding ref、各namespaceのrole alias、current `HeadInputRef`、L4で列挙するoperation/code/config/declaration/source/adapter refsをowner宣言集合から組み立てる。role/kindを混同せず、raw refsを重複投入しない。K2 `key_of`専用拒否はL4 §16.4と固定L5 §6.1.3に従いK3 `PermissionCheckDiagnostic(reason: missing_key)`へ写す。K1 componentにはしない。 | K3-I4; IV-K3-03/14/15/16 |
| `CK-K3-FN-04` | current context再構成 / K5内部境界 | OS assignment、target relation、INFRA environment、operation/SECURITY declarations、time observation、revocation headsをcurrent owner prefixから再構成する。revocationはprivate typed `RevocationSnapshot(heads, observation)`で全current head集合との対応を示す。head ref `(segment, seq, entry_digest)`でexact duplicateだけをdeduplicateし、同じfull ref集合は入力順に関係なく一致する。head欠落は`Unknown(missing_input)`、異なるhead setは`Unknown(conflict)`。K5 `current_head/read/restore`はstub境界で、caller `input_heads`は期待値照合だけに用いる。 | K3-I1/I4/I5/I6; IV-K3-01/08/09/15/16 |
| `CK-K3-FN-05` | `resolve_current_effective_decision` / SECURITY source adapter境界 | registered source adapterの既存selection ruleとcurrent prefixを使う。private `PermissionSourceData`は登録sourceのexact bytes/declared issuer検査を行う既存owner adapterからの型付きhandoffである。K3は`record.ref`をselected current refおよびrequested permissionに、`record.source`を`AuthorityContext.source_current`に照合する。selector/tie-break/signature policyを新設せず、expiryの形式・比較も既存source adapterの宣言と返却`Observed`を保つ。 | K3-I3/I4; IV-K3-04/05/06 |
| `CK-K3-FN-06` | `compare_tuple_axes` / private pure comparison | actor/target/operation/revision/environment/explicit scope/expiryの7軸を独立に比較し全componentを保持する。expiryの解釈・比較はL4 §16.2に従いexisting source adapterの責務で、K3はTTL/時刻parseを再計算しない。 | K3-I1/I2/I6; IV-K3-01/02/09 |
| `CK-K3-FN-07` | `compare_required_operation_inputs` / private pure comparison | query、保存済み`PermissionRecord.operation_inputs`、owner current `AuthorityContext.operation_inputs`をidentity和集合で照合する。各identityについて三側のrefが揃い、`SubjectRef`全体（kind/identity/revision/digest）が一致した場合だけmatch。queryと保存値が互いに一致していても、owner current refとの一致を省略しない。owner declaration/required setを生成しない。 | K3-I7; IV-K3-10 |
| `CK-K3-FN-08` | expiry/revocation/source precondition composition / private | `RevocationSnapshot`と`AuthorityContext.revocation_heads`を`(segment, seq, entry_digest)`の集合として照合し、入力順は無視しexact duplicateだけをdeduplicateする。setが一致すれば既存owner `Observed`をkey/evidenceを含めそのまま`revocation` componentへ保持する。K3 query `ResultKey`へowner observation keyを書き換えない。current headsがあるのにsnapshot/observationが無ければK3 key付き`Unknown(missing_input)`、setが違えばK3 key付き`Unknown(conflict)`。head集合と観測がともに空でsnapshotもなければ追加componentを作らない。expiryは既存source adapterの解釈結果を保持する。新しい失効規則や時間parse/TTL/selector policyは補わない。 | K3-I3/I5; IV-K3-04–08/12 |
| `CK-K3-FN-09` | K1 component合成 / 既存K1 API境界 | 全K3 componentとK6の既存三assurance fieldを保持して既存K1 `combine`へ渡す。Observed語彙・reasonを増やさず、empty truthもL4既定どおり保持する。 | K3-I1–I7; IV-K3-05/10/13 |
| `CK-K3-FN-10` | `resolve_authority_context` / public | K3 operation enumを検査し、外の値は既存`invalid_query`でowner portを呼ばず返す。許容値はcurrent contextを再構成し、L4既存resolution/diagnostic unionを返す。保存・write effectなし。 | K3-I1/I2/I4/I6; IV-K3-01/02/08/09/15/16 |
| `CK-K3-FN-11` | `check_permission` / public | K3 operation enumを検査し、外の値は既存`invalid_query`でowner portを呼ばず返す。許容値はcontext、candidate、current decision、record/source bindings、7軸、required inputs、expiry/revocation、K6 assuranceを再照合しread-only `PermissionCheck`を返す。source outcomeはL4閉語彙とexact matchし、別文字caseを正規化せず既存`Unknown(unsupported)`へ保つ。`allow` recordに非空constraintsが同時にある場合はL4/L5にmappingが定義されないため同じ既存`Unknown(unsupported)`で非肯定に保持する。 | K3-I1–I7; IV-K3-01–13 |
| `CK-K3-FN-12` | K2 lookup / K5-K6-K7受け渡し / stub境界 | 既存consumerが保存結果を照会する場合に限り、fresh current keyと完全K5 restore列をK2 lookupへ渡す。K6へbinding bytes/raw aliasesを渡し、K7 consumerへresultを渡す境界も含む。新規lookup callerや保存ownerは作らず、L7のstubは実reader、writer、action、recoveryを実行しない。 | K3-I4/I5/I6; IV-K3-03/11/12/14/15/16/17 |

### 12.1 invariantとoracleの対応

| L4契約 | L6 function trace | L9 oracle |
|---|---|---|
| K3-I1/I2: 7軸と11 operationの分離、欠落/Unknown/確定不一致、全component保持 | FN-04/FN-06/FN-09/FN-10/FN-11 | IV-K3-01/02/09/13 |
| K3-I3: 既存current decisionのみ、source ownerの既存制約 | FN-05/FN-08/FN-11 | IV-K3-04/05/06 |
| K3-I4: 使用時current照合、完全K2 key、alias bindingとK6 read | FN-01/FN-02/FN-03/FN-12 | IV-K3-03/14/14a–j/15/16 |
| K3-I5: expiry/revocation/scope driftを含む使用時再確認 | FN-04/FN-08/FN-11/FN-12 | IV-K3-07/08/12 |
| K3-I6: request→decision→assignment→effective scopeのowner境界 | FN-04/FN-10/FN-11/FN-12 | IV-K3-09/11/12/17 |
| K3-I7: required operation inputのexact identity/value | FN-07/FN-09/FN-11 | IV-K3-10 |

### 12.2 rejection境界・未決

K3 APIの既存diagnostic reasonは`missing_key | invalid_query`である。固定L5 §6.1.3は`invalid_query`のpredicateがL4に列挙されていないとしていた。この点は保持し、一般query validatorや新しいreasonは足さない。L4 §16.2が`PermissionQuery.operation`のclosed unionを11値で列挙するため、実装のtyped API入口ではそのunionの厳密なmembershipだけを検査し、範囲外値には両公開APIがowner portを呼ぶ前に既存`PermissionCheckDiagnostic(invalid_query)`を返すと具体化する。これは閉じた型の入力境界の技術的導出であり、操作権限やdomain分類を追加しない。runtime shape全般のvalidatorは作らず、L4で列挙された不一致、owner observation、K1 componentはそれぞれ既存のValue/Unknown/Unobservedとして扱い、新しいreasonへまとめない。

K2 `key_of`の`invalid_digest`と`duplicate_identity`はK2専用`KeyOfResult`拒否である。正しいkind/role namespace、binding mapping、alias dedup、query/head refsの構成により、型付き正常経路から重複identityを作らない。完全なK2 keyを構成できないこれらの拒否はL4 §16.4と固定L5 §6.1.3に従い、K3 API境界で`PermissionCheckDiagnostic(reason: missing_key)`へ写す。K2専用reasonをK3へ追加せず、K1 Unknownへ変換・combine・recordしない。`PermissionQuery`や`Digest`のruntime shape不正を新しいreturn classへ送らない。

`PermissionSourceData.record.outcome`はL4閉語彙の正確な小文字literalと比較し、文字case変換しない。閉語彙外literalは既存`Unknown(unsupported)`に留める。L4 K3-I3が肯定の形として列挙するのは`allow`と、所有者が宣言した制約を実行前に強制できる`constrain`である一方、L4/L5は`allow`と非空`constraints`の同時存在を明示分類していない。非空制約を無視してPositiveにしないため、この曖昧な組合せは実装候補上、既存`Unknown(unsupported)`へ保持する。新reason、拒否variant、優先規則、制約実行は追加しない。これはL4で意味が確定するまで肯定を控える既存語彙の技術的適用で、L5の未決記述を変更しない。expiryの形式と比較は既存source adapterの責務であり、K3が再解釈しない。

owner contextの読み取りが完了しなくても、current tuple scopeがowner境界で解決済みなら内部`OwnerContextData.key_scope`へその値を保持する。これは公開APIやcaller指定値ではない。完全K2 keyをこのowner scopeから構成し、未読のcurrent context/decisionを既存`Unknown`としてcomponentsに残し、`Unresolved` contextを含む`PermissionCheckResult`を返す。scope自体が解決できないときは従来どおり`PermissionCheckDiagnostic(missing_key)`を返す。queryの`requested_scope`からscopeを補わず、owner scopeの欠落を読取失敗へ読み替えない。この内部表現はL4 §16.4の「key可能なら診断成分を保持、key不能ならmissing_key」を下流で形にする候補であり、要求や返却分類の追加ではない。

L8 IV-K3-15は`TARGET-DECL`と`OWNER-DECL`を別のlisted roleとして列挙し、L5 §6.1.4はowner resolverがcurrent `{role, raw SubjectRef}`全mappingを束縛すると定める。そのためfixture baselineにも`target_decl`と別のsynthetic `owner_decl` role/refを置き、各role aliasを個別に変異する。これは既存role mapping境界の合成入力であり、実owner declarationの保存場所、production owner/sourceの存在、または新しいAuthorityContext fieldを決めない。

K5 prefix/read/restore、K6の実byte読取、K7 apply/recoveryはstubまたはconsumer受け渡し境界に限る。K6 stubはL4が指定するread identityとbinding/raw byte digest関係をfixture入力として照合するだけでproduction readを証明しない。L4 §16でK3結果を永続化するowner/LogDeclが示されないため、新writerや保存責務を追加しない。selector、expiry parsing、signature verification policyも既存source adapterの宣言を越えて補わない。

### 12.3 旧source・台帳・consumer・failureの起点

旧sourceは全文を読み、SHAを実bytesから再計算した。各assetはlegacy disposition ledger上Historical/unresolvedで`consumer_refs`が空である。対応の保持点と差分理由を記し、旧runtime/testは起動していない。

| 旧asset / source pathと行 | 全文SHA-256・ledger | K3での扱いと差分理由 |
|---|---|---|
| `LEGACY-ASSET-17E4FD7C3DB0B3C82210`; `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:27–47,55–60` | `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4`; row 792, Historical/unresolved, consumer_refs空 | request/decision分離とscope/revision/actor/provenance/expiry束縛を比較起点に再導出。旧provider/memory/approval規則は導入しない。 |
| `LEGACY-ASSET-B62E49D2E156232B8C63`; `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:24–55,108–151` | `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`; row 482, Historical/unresolved, consumer_refs空 | typed axis/current provenance/unknown非肯定を再導出。旧8軸、physical identity、sandbox、runtime gateを現行7軸とoperation inputsへ置換した根拠を保持する。 |
| `LEGACY-ASSET-170112AB2FA2FFDBFEE9`; `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:全59行` | `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4`; row 2842, Historical/unresolved, consumer_refs空 | negative oracleとunknown保持を現L4/L9限定で再導出。旧physical/runtime acceptanceは継承しない。閲覧のみ、実行なし。 |
| `LEGACY-ASSET-E92D9979D003D353DB99`; `archive/legacy-generation-2026-09-14/root/tests/security-capability-broker-authority-design.test.ts:全67行` | `ff1ee8fefaf8416cafb4a706301cb7a7d4afe549f04e31c5560a1cac4d88d31e`; row 3866, Historical/unresolved, consumer_refs空 | source本文照合のstatic artifactとしてのみ参照。歴史的passやruntime proofへ使わない。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD`; `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:20–53,60–70` | `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a`; row 412, Historical/unresolved, consumer_refs空 | pure read/effect境界とdrift時の非肯定を比較起点にする。K3はread-onlyなので旧write port/receiptを追加しない。 |

旧PLAN-L3-62（`archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L3-62-security-capability-broker-authority.md`、全148行、SHA `ab38056d506369c383dab4ade8ad8de0719c273216cecdbf002ee5756196d3af`）も全文読了。計画のfailure記録は比較資料であり、独立取得していないIssue #679本文の検証済み主張へ拡張しない。旧L10/test/runtime/CLI/CIは実行していない。

### 12.4 対象外と検証状態

K3の候補実装は`helix/helix-harness/units/common-kernel/src/permission.py`に置き、L4公開signatureの`resolve_authority_context(query, input_heads)`と`check_permission(query, permission, input_heads)`を維持する。`_owner_mapping`、`_owner_context`、`_permission_source`、`_k6_assurance`はowner責務のprivate module境界であり、初期実装はsourceを取得せず既存型の非肯定結果を返す。unit testは`unittest.mock.patch`でこのprivate境界だけを置換する。呼出し側からmapping/callback/contextを注入する公開parameter、registry、global設定は設けない。L4 §16.4およびL5 §6.1.3の禁止はcaller-provided mappingをauthorityにしないことであり、試験内のprivate boundary stubはproduction owner接続を表さない。

K3 L8の194個別fixtureに一つずつ対応する`tests/test_k3.py`の静的unittest methodを維持する。formal fixture外の回帰は既存17件に今回の9件を加えた26件で、各条件を別method/IDにしてL7へ対応づける。formal fixture IDは`CK-K3-UT-001`–`CK-K3-UT-194`、回帰IDは各L7 method nameから`CK-K3-REG-*`を一意に対応させる。回帰はowner登録source、record/current ref、revocation head snapshotの集合順序・exact重複・entry digest、source observation key保持、issuer declaration一致/不一致、両公開入口のclosed operation、exact outcome literal、allow+constraints、query scope、required operation inputの同revision digest conflict、empty caller head expectation、全query-ref field、context target、resolution outcomeの境界を一変異ずつ検査する。K1/K2のcore module/test sourceは変更していない。

| 検証 | 対象 | 結果 |
|---|---|---|
| `python3 -m unittest discover -s helix/helix-harness/units/common-kernel/tests -p 'test_k3.py'` | CK-K3-UT-001–194とCK-K3-REG-* 26件 | 220 tests, OK。formal 194件と回帰26件を区別し、owner/K5/K6/K7境界は合成stub。 |
| `python3 -m py_compile helix/helix-harness/units/common-kernel/src/permission.py helix/helix-harness/units/common-kernel/tests/test_k3.py` | K3候補moduleと単体test | 成功。 |

この結果はK3 pure projection/case behaviorの候補単体検証に限る。private owner-port stubはsynthetic typed inputだけを与え、実source reader/登録確認/署名真正性、expiry/signature policy、K5 prefix/read/restore、K6 binding/raw byte実読、K7 apply/recovery、L9 oracle、CIへのK3登録、製品動作、外部作用の証拠ではない。revocation回帰はhead setの順序非依存・exact重複dedupとowner observation key/evidence保持を確認するが、K5実読を証明しない。`allow`と非空`constraints`の同時存在mappingはL4/L5で未決のままであり、既存Unknown(unsupported)を用いた非肯定回帰だけを加えた。K3実行記録やowner接続をmain上の完了として扱わない。このK3実装候補を作成した時点ではK8/K10詳細は`not_designed`だった。現在K8は§17、K10は§18に追補されている。K4/G3は§14、K5は§2–5/§7、K6は§13に記載する。

## 13. K6 関数設計

本節は、main `f13373132758fce43ebb3cd1ffe9fdc60523a23a` のL4 §10/L9 IV-K6-01–15と、同一mainのL5 §9/L8 §8のoracle snapshotを関数責務へ具体化する。K6公開API・型・既存class/reason、ownerの責務、部分被覆の境界は変えない。L8の55fixtureを設計入力として保持し、§13.6では実行45 ID（43局所assertion・2部分実行）と未実行10 ID（2部分設計・8未接続）を分ける。CIには未登録である。

### 13.1 固定入力と親範囲

| source | 固定本文 | 本節が使うlocator |
|---|---|---|
| L4 Common Kernel | `docs/helix-harness/L4-basic-design/common-kernel.md`, SHA-256 `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696`, main `fcf00128a7503317fa1c779c38cc8df3877b4952` | §10.1–10.9、特に§10.2 direct-parent crosswalk、§10.3 types、§10.6 APIs、§10.7–10.9 boundary |
| L5 Common Kernel | `docs/helix-harness/L5-detail-design/common-kernel.md`, SHA-256 `3f3867df4e04927fbf05615984654f2994dd76ac71fed0ee420d5edce36a2c69`, same main | §9.1–9.5 |
| L8 Common Kernel | `docs/helix-harness/L8-detail-verification/common-kernel-detail-verification.md`, K6 oracle snapshot SHA-256 `3d42cdd5ca45174e68cb5786052c2a33f1036198493bca38274c2488f925fa8f`, main `f13373132758fce43ebb3cd1ffe9fdc60523a23a` | §8.1 55 fixture rows, §8.2 mapping, §8.3 partial coverage |
| L9 Common Kernel | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`, SHA-256 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`, same main | IV-K6-01–15 |

親はL4 §10.2の既存crosswalkに限る。特にAC-OS-018-01、AC-OS-023-02、AC-OS-029-03を直接親としてtraceし、K1/K2/K4/K5への契約接続を新しい親に数えない。L8は55個のcase identity、L9は既存15 oracle identityを保持する。

### 13.2 公開APIと処理順

L5 §9.3で固定された公開境界をそのまま使う。

```text
run(verifier, base_key) -> ResultRecorded
admit_receipt(record, query_key, verifier_set) -> Observed<AdmittedReceipt>
reverify(admitted) -> Observed<AdmittedReceipt>
required(operation, base_key, verifier_set, reverify: Bool) -> RequiredResult
```

関数IDはこのL6内部trace用であり、新しい公開API、返却class/reason、owner portではない。12 FNは公開入口3件（FN-01/FN-09/FN-10）とprivate責務9件である。第4の公開API `admit_receipt` はFN-04–08の照合鎖を束ねる既存入口として保持する。FN-03はL5 §9.3の`required`行のrestore→lookupという内部手順に対応し、`admit_receipt`の公開引数や前処理にlookupを追加しない。

| L6 ID | 境界 / 可視性 | 関数責務 | 結果・接続 |
|---|---|---|---|
| `CK-K6-FN-01` | `run` / public | `base_key`からK6の既存receipt keyを導き、登録された検証器実行側が`ReceiptBody`を構成する。caller由来のresult/exit/output/read/registry/innerを受け入れず、既存2引数signatureの境界を維持する。 | 既存2引数signatureを満たす呼出しはK5 append境界へ既存`ResultRecorded`を返す。caller result/exit/output等を追加したsignature不適合attemptの`Rejected`はL9の既存期待を指し、`ResultRecorded`のvariantや追加公開引数を定義しない。実行環境・writer実接続はこの設計から実在を主張しない。 |
| `CK-K6-FN-02` | `derive_receipt_key` / private pure | L4 §10.3に従いbase keyのoperation versionを`VerifierRef.version`にし、verifierとVerifierSetのSubjectRefをK2 inputsへ追加する。 | ResultKeyだけを生成する。receipt lookup結果の`Value`/`Stale`等は生成せず、後続K5 restore/K2 lookupへ渡す。 |
| `CK-K6-FN-03` | receipt lookup preparation / private orchestration | K5 `restore`から固定prefixのrecord sequenceを得て、検証器ごとのFN-02 keyでK2 `lookup`を行う。timestampで並べ替えず、K5 append順とK2 exact/prior規則を保つ。 | restoreが非Valueなら同じ非Valueを当該componentへ伝播し、partial record lookupを実施しない。K2のStale/Unknown/UnobservedをK6新reasonへ変換しない。 |
| `CK-K6-FN-04` | `match_verifier_entry` / private owner boundary | K4-owned current VerifierSetにあるmemberのidentity/version/digest全fieldとreceipt verifier refを照合し、`deterministic`とchecks mappingは一致したentryからだけ得る。 | member不一致は既存`Unknown(unregistered)`。VerifierSetのcurrent読取・登録をK6が創作しない。 |
| `CK-K6-FN-05` | `validate_receipt_key_body` / private pure | query key、record key、body key、body verifier/set refsをFN-02の導出結果と照合し、K6-I3の一致を確認する。 | 確定不一致は既存`Unknown(conflict)`。lookup前のK2分類を再定義しない。 |
| `CK-K6-FN-06` | `validate_read_set` / private pure | `read` identity/digest集合をsubjectとnon-verifier inputsから作る期待集合と比較する。verifier/set refsをreadに追加しない。 | 期待read不足は`Unknown(missing_input)`、余分/違うdigestは`Unknown(conflict)`。実bytesの真正性はK6 reader owner境界に依存する。 |
| `CK-K6-FN-07` | `verify_fixed_outputs` / private owner reader boundary | 各`FixedRef`を既存reader境界で読み、receiptが記録するdigestを実bytesから再計算した値と比べる。 | digest不一致は`Unknown(conflict)`、読取不能は`Unknown(unreadable)`。この草稿はreader実装・物理sourceを作らない。 |
| `CK-K6-FN-08` | `rebuild_inner` / private pure | VerifierEntryの登録済みchecksとreceiptのevaluated/resultsをcheck identityごとに照合し、登録済みPolarityOfとK1既存combineへ全成分を渡す。保存innerと再合成値を比較する。 | 未評価は既存`Unobserved(not_run)`、未登録checkは`Unknown(unregistered)`、保存inner不一致は`Unknown(conflict)`。全componentとK1 diagnosticsを保持する。 |
| `CK-K6-FN-09` | `required` / public orchestration | K4 `required_for[operation]` member集合を読み、各verifierについてrestore→key lookup→receipt admissionを行い、全必要check成分をK1 combineへ渡す。非required verifierで欠落memberを置換しない。`reverify: Bool=true`なら受け入れた各receiptをFN-10の既存`reverify`へ渡し、返却されたreproductionと他assuranceを保持する。falseなら再実行せず既存の未実施/unsupported境界を保持する。 | APIは`RequiredResult{combined, assurance}`。`combined`にはK1 `Combined`のverdict/components/polarity/negatives/non_values/excluded/set_reason、`assurance`にはidentityごとの三項目を保持する。restoreが非Valueならそのcomponentへ保持する。K1 `Combined` componentにverifier/check識別を別々に保持する既存fieldはない。現実装はflat componentを渡すところまでであり、同一check identityが異なるverifierで現れる場合を含む識別付き保持は未達・部分対応として扱う（§13.5）。 |
| `CK-K6-FN-10` | `reverify` / public orchestration | deterministic entryだけ同じ固定入力で再実行し、保存innerとの再現を照合する。 | deterministic mismatch=`Unknown(conflict)`、非deterministic=`Unknown(unsupported)`。reproductionは過去実行・issuer authenticityの証拠へ拡張しない。 |
| `CK-K6-FN-11` | K5 append/correction / private integration boundary | FN-01のrecordを既存K5 append境界へ渡し、既存immutable/correction拒否を保つ。 | L8-K6-13の既存K5 `Rejected`をそのまま伝える。K5 writer/append operationをK6で新設しない。IV-K6-14はK5 append sequenceとK2 prior lookupを接続し時刻を選択に使わない。 |
| `CK-K6-FN-12` | consumer handoff / private boundary | `RequiredResult.combined`と`assurance`を別fieldとして保持し、`authority_effect="none"`、`issuer_authenticity=Unknown(unsupported)`を消費側へ渡す。 | IV-K6-15(1)のconsumer `Rejected`はL4にconsumer API/return typeがないため未接続。構造照合をconsumer拒否の実装/達成として主張しない。 |

処理鎖は`run`ではFN-02→FN-01→検証器側body構成→FN-11、`admit_receipt`ではFN-04→FN-05→FN-06→FN-07→FN-08、requiredではFN-03→FN-04–08を各memberに適用→`reverify=true`の場合だけ受け入れた各receiptをFN-09からFN-10へ渡す→K1合成、reverifyではFN-10である。これは責務順の候補であり、署名や検証器実行主体を新たに決めない。K2 lookupでprior Valueが返る場合は既存K2のStaleを維持し、別identity候補の非選択はUnobserved(not_run)のままとする。

### 13.3 既存oracleとの一対一trace

L8詳細caseの55 IDとL9 oracle、L4 invariantの対応は次節L7の55行で一件ずつ追跡する。ここでは再集約した対応のみを示し、fixtureを新しい意思決定やL9 oracleへ数えない。

| L4 invariant | L9 oracle | L5 API / L6 function | L8 fixture family | 結果境界 |
|---|---|---|---|---|
| K6-I1 issuer | IV-K6-02 | `run` / FN-01 | `L8-K6-02-*` | signature-incompatible attemptはL9既存`Rejected`。 |
| K6-I2 set membership/source | IV-K6-03/04 | `admit_receipt` / FN-04,FN-08 | `L8-K6-03-*`, `04-*` | 未登録はUnknown(unregistered)。IV-04(1)/(2)の一部assertionはL5 §9.5のowner return。 |
| K6-I3 key/body | IV-K6-01/05 | FN-02,FN-03,FN-05 | `01-*`, `05-*` | K2 lookup Stale/conflict/Unobservedはそのまま保持。 |
| K6-I4 read-set completeness | IV-K6-06 | FN-06 | `06-*` | 欠落 Unknown(missing_input)、余剰/不一致 Unknown(conflict)。 |
| K6-I5 output bytes | IV-K6-07 | FN-07 | `07-*` | 実読境界の不一致/conflictと読取不能/unreadableを分離。 |
| K6-I6 registered/evaluated | IV-K6-08 | FN-08 | `08-*` | Unknown(unregistered) component、保存inner mismatch/conflict。 |
| K6-I7 required set合成 | IV-K6-09/10 | `required` / FN-03,FN-09 | `09-*`, `10-*` | K1 Combinedの各fieldとassuranceを分離保持する。verifier×check識別付きのcomponent保持は既存型にcarrierがなく未達の部分対応。 |
| K6-I8 reproduction | IV-K6-11/12 | `reverify` / FN-10,FN-12 | `11-*`, `12-*` | reproductionとissuer authenticityを独立保持。 |
| K6-I9 no correction/time selection | IV-K6-13/14 | FN-03,FN-11 | `13-*`, `14-*` | K5 RejectedとK5 sequence orderを再利用。 |
| K6-I10 no authority/assurance | IV-K6-15 | FN-12 | `15-*` | API未定義のconsumer Rejectedを達成扱いにしない。 |

### 13.4 旧source・asset ledgerとの対応

全sourceはL5 §9.1に固定された対象revisionを再読し、asset ID、path/span、全体SHA-256、ledger row、consumer/failure、保持・変更理由を照合した。下表はその関数境界へのtraceであり、旧runtime/testは実行していない。ledgerの`consumer_refs`が空のassetは、consumer/failureを同sectionで明示された本文記載から追跡する。

| Asset ID / source path:span / full SHA-256 | L6で保持する意味と接続 | 差分理由・置換境界 |
|---|---|---|
| `LEGACY-ASSET-8E9E06111D6FE1538308` (ledger row 528) — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md:17–35` — `db4eb979037a611e51edaab22fe31f774fd7038d7ffb72bcf26ece6fb9de8b42` | 同対象版/先行ref照合をFN-02–05へ再導出。source consumerは同じHEAD/順序に束縛。 | 旧delegation/review/terminal workflowは作らず、current keyとK5/K2へ置換。 |
| `LEGACY-ASSET-A4EAB5E3345E3C125C77` (ledger row 535) — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md:16–31` — `d39b3cdc2e7d9f72ad03d0d3db5571a6b0de579fadf0b147b8a6d4f90dc2ed2c` | 実行側だけがreceipt execution/read等を作る点をFN-01へ。 | 旧broker/lifecycle writerを複製せず、physical execution bindingを局所境界に残す。 |
| `LEGACY-ASSET-78704C8347EBDD58FC52` (ledger row 657) — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/gate-evidence-substance.md:15–47` — `6f4a3cdbf5e66071525e6d4b76df2a8c9bedea355338321c5ea597cc1dd73ba6` | digestは宣言でなく実読bytesから照合する点をFN-06/07へ。consumer failureは複数保存digest不一致と実行証拠の誤認。 | gate固有reader・runtime実行証明を共通K6に追加せず、L4 FixedRef境界を用いる。 |
| `LEGACY-ASSET-901EFEC93D536D3AA418` (ledger row 373) — `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/closure-evidence-materialization.md:13–15,56–76` — `a8951a0cdd590da84612de8c6b6e5960ca5c32ad3b3d0c0d0511b9f5789c0264` | execution producerの境界をFN-01へ、non-atomic persistence/recovery問題をFN-11のK5境界へ。 | K6はSQLite/JSONL/filesystem atomicityやrecovery writerを持たず、K5既存契約へ接続。 |
| `LEGACY-ASSET-C4B746501A6562E3F8B4` (ledger row 473) — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md:53 (UTH-FR-022)` — `c0978eae37f6c7c8e113191404c0fd76328818e438b0ea5b3cf98ebd489a6639` | argv/scope/HEAD/exit/artifact/runnerのbinding思想をFN-02/06/07へ分解。 | 旧schemaを複製せず、L4 ReceiptBody/SubjectRef/FixedRefを保持。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` (ledger row 412) — `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:60–70` — `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | issuer/reader境界、実行前後の再照合とdrift uncertaintyをFN-01/03/07/12へ。 | 旧署名・policy schemaを移さず、署名根拠が無い限りissuer_authenticityはUnknown(unsupported)。 |
| `LEGACY-ASSET-D107FD145A2588FAAD09` (ledger row 532) — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-independent-review.md:20` — `9fff293ed71c7a0be0e4dfcd7a5cca70eaacfdbf2cd553a605fd15510a3c99b3` | actorをreceiptで自己申告させずexecution source側に置く点をFN-01へ。 | reviewer/actor identityやreview policyはK6に新設しない。 |
| `LEGACY-ASSET-6CC1A5B9E9472F1100AF` (ledger row 2917) — `archive/legacy-generation-2026-09-14/root/src/doctor/check-registry.ts:20–40` — `07e52e804cb83b74ec3026a25baca593e35f8f2107c581adc8afdf6a93fbb581` | registered/evaluated checkを別個に保持する点をFN-08/09へ。 | 件数だけでなくcheck identity別K1 componentにし、旧sourceは読取のみ。 |
| `LEGACY-ASSET-ED86DAA9D6A1511A591C` (ledger row 3021) — `archive/legacy-generation-2026-09-14/root/src/lint/pin-chain-derivation.ts:6–10` — `5f81fa005896bd34f66538084eabdf627b1df9025285a020bae4c0976fcaaca6` | deterministic reproductionとsemantic trustの分離をFN-10/12へ。 | 旧lintを実行/移植せず、reproductionを署名・review保証にしない。 |
| `LEGACY-ASSET-C0F9CE549442BA1D551E` (ledger row 1683) — `archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L7-428-enforcement-wiring-gap.md:87–110` — `dd527d30dfb5a601008656d4d38c0cdefcf44aa9cbe277bccc5fad4b8c81751c` | unit-only greenで接続されない検査を隠したfailureをFN-09/12へ保持。 | K6 fixture設計/単体構造をowner execution connectionやproduct acceptanceと同一視しない。 |
| `LEGACY-ASSET-B8D84651753481B5F2B9` (ledger row 996) — `archive/legacy-generation-2026-09-14/root/docs/governance/operations-rule-audit-2026-07-26.md:48 (ORA-015)` — `d32bb1a780a36cd0710cbd58d575e900ac14c154a0e84f5dc92423b46c01466e` | 別HEAD由来digestを誤用したfailureをFN-02/06/07へ。 | key/current readと実bytesを分離し、snapshotを混在させない。 |
| `LEGACY-ASSET-EC07511FF3E241F15359` (ledger row 328) — `archive/legacy-generation-2026-09-14/root/docs/design/design-catalog.yaml:838` — `4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864` | 署名/attestationが未設計という比較をFN-12の明示限界へ。 | 不在を根拠に署名・attestationを新要件化せず、issuer_authenticityを未証明に保つ。 |

### 13.5 部分被覆・未接続境界

- IV-K6-04(1)/(2)は、L8が明示するReceiptBody fieldの不在とK4 VerifierEntry由来値の照合まで部分被覆である。型外claimのparser意味やL9が求めるowner mapping assertionの残りはL4/L9 owner returnとして保持し、L6 helper/API/reasonで埋めない。
- IV-K6-15(1)はL4にconsumer API/Rejected return typeがないため未接続である。FN-12はfield分離と`authority_effect="none"`のhandoffまでであり、consumer rejectionやacceptanceを実装・達成したとはしない。
- K6-I7/L5 §9.3/L9 IV-K6-09が求めるverifier `m`とcheck識別を外側componentへ付ける契約について、既存K1 `Observed`/`Combined`にはverifier識別fieldがなく、`RequiredResult.assurance`は別項目である。ResultKey/evidenceへ識別を詰める既存規則も対象文書にないため、新field・key/evidence意味を追加しない。現候補はflat K1 componentの合成までで、識別付き保持は未達。UT-035/036を含むIV-K6-09の関連確認はpartialとして数え、同一check identityを複数verifierが持つ場合の識別喪失を非formal regressionで観測する。
- K4 current VerifierSet reader/member registration、検証器を実行するowner binding、K5 physical append/store、K6 output FixedRef readerの実接続は本設計で作らない。既存L5/L8/L9が返す型/classを変えず、対象境界の事実がない場合をValueにしない。
- K6の55 fixtureは設計traceである。§13.6でIDごとに、実行45件（43件は候補helper assertion、UT-035/036は部分実行）、未実行10件（UT-018/019はowner-returnの部分設計、残る8件は未接続）へ分ける。実行結果と設計上の部分対応を同じ件数へ足さない。これらはL9 pass、owner接続、physical read/write、CI inventory登録、製品範囲coverageを主張しない。UT-055のassurance分離確認は、IV-K6-15(1) consumer `Rejected`の未接続とは別の期待である。

### 13.6 候補実装と実行記録

実装候補は`helix/helix-harness/units/common-kernel/src/verification.py`、対応testは`helix/helix-harness/units/common-kernel/tests/test_k6.py`に置いた。既存のK1/K2/K3/K5 sourceとtestを変更せず、L5の4 API・12 FN・K1/K2の既存型/class/reasonを使う。CPython 3.11+標準libraryと`unittest`を使い、外部package、旧runtime、物理writerの代替は導入しない。

実装した範囲は、公開K6 APIではなくprivate pure helperによるreceipt key導出と既存K2 lookup、current memberとの完全ref比較、receipt key/body/read集合照合、明示入力されたFixedRef bytesとのdigest比較、保存innerのK1再合成、明示入力されたK4/K5 owner observationを使うrequired fold、明示入力されたexecution observationとのdeterministic reproduction比較である。 admissionではcallerから渡されたbase key・verifier member・verifier setからK2 keyを再導出し、query keyおよびbodyのverifier/setがその導出元と完全一致することを確認する。bodyが別のbase inputを指すだけでは一致として扱わない。FixedRefの実読結果数が出力数より少ない場合は`Unknown(missing_input)`、余分な読取結果は`Unknown(conflict)`とし、`zip`の短い側で処理を終えて肯定しない。実行時前提をPython `assert`で検査せず、明示した既存non-valueまたは`TypeError`で停止するため、`-O`でも判定が変わらない。K2 lookupが返すStored Observationを受入検査へ渡す際は、K5 restore済みsequenceから同じkey/resultを持つ元`ResultRecord`を引き戻し、元の`result_digest`と`producer`を保持する。wrapper metadataをlookup結果から再構成しない。current VerifierSet、restore済みsequence、FixedRef bytes、executor結果はprivate helperの明示的な型付き入力であり、未接続ownerの不在を`Unobserved`または`Unknown`へ作り替える既定reader/resolver/executorは置かない。synthetic observationを渡すtestはpure/helper境界だけを確認し、実owner/sourceの成立を示さない。

`run(verifier, base_key) -> ResultRecorded`は実装しない。現在のK5 append validationは、receipt Correctionの未写像条件を`journal.py`内の`_UNMAPPED_APPEND_VALIDATION`へ返し、`_append_with_context`が`NotImplementedError`にする（`journal.py:829–855, 992–1005`）。L8-K6-13の`Rejected`結果へ結ぶ既存transportがない。K5 sourceを変更せず、K6にunion、`None`、例外stub、架空の`ResultRecord`を加えず、この境界を保留する。

L8 §8.1のfixture IDとL7 §10のUT IDの対応は固定表どおりとし、実行は45 method、未実行は10 IDである。実行45件のうち43件は候補helper assertionまで確認し、`CK-K6-UT-035/036`の2件はverifier×check識別付き保持が未達の部分実行である。未実行10 IDのうち`CK-K6-UT-018/019`はL4/L9 owner-returnの部分設計であり、残る8件は`CK-K6-UT-010–013`（runのcaller field/rejection transport）、`050–051`（issuer authenticity/過去実行境界）、`052`（K5 append Correction rejection mapping未接続）、`054`（consumer rejection return未接続）である。UT-018/019の設計上の部分対応を実行済みに数えず、UT-035/036の部分実行と分離する。`CK-K6-UT-055`は異なるverifier identityのassurance値を分けて保持する既存期待を実行し、consumer rejectionを主張しない。L8 55行と15 IVのoracleは一切変更していない。

`test_k6.py`は45 fixture-ID methodに加え、(1)K5-restored original record metadata保持、(2)record result digest mutation拒否、(3)未接続のpublic owner-bound APIを公開しないこと、(4)owner polarity mappingが欠けたcomponentを完全key付き`Unknown(missing_input)`にし、そのkeyを保つこと、(5)同一check identityを異なるverifierが持つと現K1 component keyではverifier namespaceを区別できない境界の観測、(6)query inputsに含まれる別登録verifierをreceipt bodyが申告しても導出元member不一致として`Unknown(conflict)`にすること、(7)`python -O`で実admission経路を動かしFixedRefの読取観測欠落を`Unknown(missing_input)`にすること、の7 regressionを持つ。最後の二つはM01/M02への非formal regressionであり、L8 fixture数に含めない。namespace境界のregressionは部分対応を検出するもので、識別付き保持を成功条件として満たしたとは数えない。focused command `python3 -m unittest discover -s helix/helix-harness/units/common-kernel/tests -p 'test_k6.py' -v`と`python3 -O -m unittest discover -s helix/helix-harness/units/common-kernel/tests -p 'test_k6.py' -v`はいずれも52 method pass。全suite command `python3 -m unittest discover -s helix/helix-harness/units/common-kernel/tests`は586 method pass・0 failure・0 skipであった。既存suiteの534 methodにformal fixture method 45件と非formal regression 7件を加えた実行であり、旧test/CIは起動していない。

この候補追加で変更した実装blobのSHA-256は`verification.py`=`173c885b4b2400cf7479d7cabeabd14b65bfc8b2a025b6256d6463c52f5f958c`、`test_k6.py`=`3d6e6a873cdc80ac7ba7810a5b94d6b104e2d54b8523a8e01da0c80cf6fdda86`である。保護した既存source/test blobsは次のSHAと一致し、変更していない。

| 保護blob | SHA-256 |
|---|---|
| `common_kernel.py` | `ce9c7a87cd318c2ff5d12f68c71129f6ad99f0b78616f89c501ccdd2c4643178` |
| `journal.py` | `78dba87db2b55cb349ed8fbc5d0483cdb933a8cce4d45e910c5f9cbcaefeb907` |
| `permission.py` | `6a2f3b0d82dd38b03a4b27b2f98ed58217286eb9912c6a984a6a5549ac6c9f8b` |
| `test_k1.py` | `da847ab19a9c3fa0df17c360bc489c9da2470f53d3ee6487ea0e822905e561ff` |
| `test_k2.py` | `3b1a6ede6642292ef31e458ca519bc293917da5e4654f85eda9ccf4a350d1582` |
| `test_k3.py` | `1dd8ff995c40e428e6952f607731f3215c3a44785a8b4f0b0ff6c7c340a2c62a` |
| `test_k5.py` | `c7d3dcedec9e63a1beb364147036135ae966c4330241f236f9842686e9134574` |

旧sourceの参照asset ID、span、archive bytes全体SHA、ledger row、保持点および変更理由は§13.4の12行で記録する。archiveは読取のみで、実行していない。これらの単体結果はローカル候補の検査であり、L9、CI、K4/K5 owner接続、実reader/executor、製品動作の合格を表さない。

## 14. K4/G3 関数境界と旧source trace

本節はmain `cb75db4daa35e84d4b2a02e3cb80dab6a84f127d`のL4 §13（SHA-256 `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696`）、L5 §8（SHA-256 `3f3867df4e04927fbf05615984654f2994dd76ac71fed0ee420d5edce36a2c69`）、L8 §7（SHA-256 `9d441f69221eb2800182f08e49c159c271a77eccc482bdbfb45bc960d2b48753`）、L9 `### K4・G3`（SHA-256 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`）の既存契約を、L6内部責務へ対応づける。hashは当該mainで実bytesを照合した。L8固定ID/期待値はL8本文を正本とし、L9は統合oracleとして参照する。fixtureやoracleの実行は行っていない。

### 14.1 6つの既存API境界

公開面はL4/L5 §13.5/§8.3の6 APIだけである。下表の`CK-K4-FN-*`はL6 trace用識別子であり、関数内部のprivate stepを分けても公開signature、domain field、result/reason unionを追加しない。`ObligationSet`、`OperationDecl`、`VerifierSet`、`HumanDecision`、`ObligationView`、`Handoff`はL4 §13.2の既存型を使う。

| L6 function ID | 既存API / boundary | L4/L9 trace | 関数責務と境界 |
|---|---|---|---|
| `CK-K4-FN-01` | `derive(sources, rule, target, scope) -> ResultRecorded | Rejected(reason)` | K4-I1、G3-I1/I4; IV-K4-02、IV-G3-01/04 | owner固定の`sources`と`rule`からだけ`ObligationSet`を導出する。`obligation_id`はL4のsource.identity/target.identity/granularity/pair/operationに従いrevisionを含めない。K2既存key/record境界とK5既存`ResultRecorded`を使う。人の記録を求めない由来に`HumanInterface`が含まれる場合はL4既存`Rejected(reason)`を保ち、新reasonを作らない。ownerのatom選択やruleを補わない。 |
| `CK-K4-FN-02` | `evaluate(set_key, decls, verifier_set, input_heads) -> Observed<ObligationView>` | K4-I1–I4/I6、G3-I1–I4; IV-K4-02–07/10、IV-G3-01–04 | `input_heads`の固定K5 prefixをrestoreし、完全なValueの場合だけK2 lookupする。復元/lookupの非Valueを変更せず返す。各operationのbase keyはowner current `OperationDecl`のversion/target/inputs/scopeから作り、receiptから逆算しない。`VerifierSet.required_for[o]`はRequiredなMechanical/LlmJudgment義務のverifier集合と照合し、不一致は該当成分の既存`Unknown(conflict)`。欠落declは該当成分`Unknown(missing_input)`。`NotApplicable`はL4 K1-I5の成立時だけ除外し、根拠fieldが欠ける場合は既存`Unknown(invalid_disposition)`を保持する。`Deferred`は`Unobserved(pending_receipt)`として残す。K6既存`required`/`admit_receipt`の`inner`全成分とassuranceをobligation/verifier/check別に保持し、既存K1 `combine`へ渡す。 |
| `CK-K4-FN-03` | `check_view(view, set_key) -> Observed<ObligationView>` | K4-I1; IV-K4-01 | 固定setとviewのobligation_idを照合する。setにある成分の欠落は該当IDの`Unknown(missing_input)`、setにない成分は該当IDの`Unknown(unregistered)`。空setのwhole `set_reason=Unknown(missing_input)`を保つ。公開引数にobligation集合を追加せず、viewやcaller自己申告をsetの正本にしない。 |
| `CK-K4-FN-04` | `reverify_view(view, targets?) -> Observed<ObligationView>` | K4-I4、G3-I2/I3; IV-K4-07、IV-G3-03 | `targets`にある(obligation_id, verifier)のみK6既存`reverify`境界へ渡す。deterministic receiptの未実施/一致/不一致をL4既定の`Unobserved(not_run)`/`Value`/`Unknown(conflict)`としてassurance.reproductionに保持する。nondeterministic LLM receiptは`Unknown(unsupported)`を保つ。issuer_authenticityもL4が定める`Unknown(unsupported)`を含め、`combined`だけへ潰さない。 |
| `CK-K4-FN-05` | `inherit(old_view, new_set_key, decls, verifier_set, input_heads) -> Observed<{view, handoff}>` | K4-I5; IV-K4-08 | 新setを既存restore/lookup/evaluate境界で解決し、新revisionをcurrent decl/receiptから評価する。旧Positiveを継承せず、旧viewの全非Positive obligation_id（新setに無いものを含む）と記録を`inherited`に保持し、全未完IDを既存Handoffへ結ぶ。 |
| `CK-K4-FN-06` | `receive(handoff, from_view) -> Observed<Handoff>` | K4-I5; IV-K4-09 | `from_view`から旧PositiveでないID集合と各記録を再計算し、`Handoff.unfinished`および`inherited`のkey_digest/result_digestを照合する。欠落=`Unknown(missing_input)`、余分=`Unknown(unregistered)`、異なる記録=`Unknown(conflict)`をL4既存unionの範囲で返し、handoff自己申告を真値にしない。 |

`G3-I5`の種別別件数は情報だけであり、L4 §13.5にcount API/output fieldがないため公開関数を作らない。`IV-G3-05`は既存API面に割合由来の合否/承認fieldがないことを構造照合する範囲だけをL7へ渡す。K4-I4のMechanical/LlmJudgment verifier集合とHumanInterfaceのadapter接合、source ownerおよびK6 required_for/receiptへの読取経路はL4/L5で未確定なので、この節で接続を発明しない。`HumanDecision`をcaller引数やsynthetic K1 observationとして作らない。bindingが未確定なHumanInterface fixtureは設計だけを保持し未実行とし、binding未確定を`Unobserved`へ写さない。L9 IV-G3-04(9)後半のconsumer `Rejected`期待は既存6 APIに受け口がないため、L7は構造不一致を記録するだけでL9合格を主張しない。

### 14.2 K4/G3 invariant・oracle trace

| L4 invariant | L6 function | 既存L9 oracle |
|---|---|---|
| K4-I1 | FN-01/FN-02/FN-03 | IV-K4-01/02 |
| K4-I2 | FN-02 | IV-K4-04 |
| K4-I3 | FN-02 | IV-K4-05 |
| K4-I4 | FN-02/FN-04 | IV-K4-03/06/07 |
| K4-I5 | FN-05/FN-06 | IV-K4-08/09 |
| K4-I6 | FN-02 | IV-K4-10 |
| G3-I1 | FN-01/FN-02 | IV-G3-01 |
| G3-I2 | FN-02 | IV-G3-02 |
| G3-I3 | FN-02/FN-04 | IV-G3-03 |
| G3-I4 | FN-01/FN-02 | IV-G3-04 |
| G3-I5 | public API構造照合のみ | IV-G3-05 |

### 14.3 旧HELIX source・保持点・差分理由

L4 §13.6/L5 §8.1の9旧assetについて、archiveの指定spanを実読し、archive full-file SHA-256と`legacy-asset-disposition.jsonl`の`source_sha256`を照合した。source pathは`archive/legacy-generation-2026-09-14/root/`からの相対pathである。旧source/test/runtime/CLI/CIは実行していない。

| Asset ID / source path:lines / full SHA-256 | 保持するfailure・意図 | 現行への再導出と変更点 |
|---|---|---|
| `LEGACY-ASSET-FEB591CA3369A4AF7729`; `docs/design/harness/L6-function-design/descent-obligation.md:20–24,66–69`; `8f6a5104bdb15790cd282414ef0e2b24976787097bce0245b5cff02ac3aaf984` | pair freezeが在るdocumentだけを走査し、必要な下流pair成果物の欠落を見逃したabsence-blindness。defer/unmetを区別。 | 現行はowner固定source/ruleからObligationSet全体を導き、check_viewで欠落・余分IDを検査する。旧lint/DB/Layer enumを移さない。 |
| `LEGACY-ASSET-E7AB06BE3282A7D4CBDA`; `docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md:17–35`; `077592139976a41d786141018c116e2c09393e41c8132adf0a259b86443083a9` | deferredを一つの回収先へつなぎ、missing/duplicate/expired/cancelled/staleをsuccessで相殺しない。 | obligation_id単位のinherited/Handoffへ再導出する。期限、scheduler、main/nightly/releaseは新条件にしない。 |
| `LEGACY-ASSET-E9998EF887555DBB2751`; `docs/design/helix/L6-function-design/ci-verification-plan.md:20–35`; `21e0b8a05b965d6c1ad27c55bf28ff2d711daa4112c96589da63075b02fc5841` | 上流required obligation集合の一件欠落を拒否し、pendingを残す。 | caller listでなくK5 restore/K2 lookupの固定ObligationSetを集合正本にする。 |
| `LEGACY-ASSET-C35E93F2D36777CD7462`; `docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md:351,383`; `2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | Required/NotApplicable/Deferredを明示し、N/A根拠と再entry、defer未完を保つ。 | NotApplicableの3fieldは既存K1-I5、Deferredは`Unobserved(pending_receipt)`として保持し除外しない。旧expiry/freeze条件は移さない。 |
| `LEGACY-ASSET-BC214D81DE9E77B8A804`; `docs/archive/cross-system-audit-2026-09-05/source/audit-report.md.txt:72–80`; `dcf0d4e0dcc4db772afac465df10f2412134cd65dcd019a18cb99c9fd39be53f` | 実証拠と無関係なzero digestで成功し、必須集合を空にすると検査が消えたfailure F02。 | L4 K4-I1のempty set whole `set_reason=Unknown(missing_input)`へ再導出する。既存consumer-rejection経路を補わない。 |
| `LEGACY-ASSET-3B16BCFFAF353ADA813A`; `docs/design/helix/L0-charter/helix-charter_v0.1.md:39`; `8eff96bf58e6bb2cca247acef18c4f6cf07e304f3f23fb4179ddd8e5b19b23d8` | pair closure、片肺禁止、機械/AI判定の境界を保持。 | coverageだけから完了・承認を出さず、K4/G3の既存型へ再導出する。 |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605`; `docs/design/helix/L3-requirements/pillar-functional-requirements.md:152`; `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | L3–L7 gatesで機械/AI判定を形式化しcoverage単独passを禁止する保持点。 | L4 G3-I2/I3のoracle.kindへ再導出し、件数から受入を生成しない。 |
| `LEGACY-ASSET-D68CEADABCBECF13EFCB`; `docs/skills/judgment-core.md:70–73`; `e0c0fc7c3c813ba59e434ea19dad3f54e90f2b7bd8e1b5151c572a06b3d3c1e8` | 機械的pass/failはdoctor/lint/test、LLMは程度評価・盲点発見を担い、deterministic判定を代替しない。 | G3-I2へ再導出する。新しいverifier policyは作らない。 |
| `LEGACY-ASSET-98372FEE8A3AC8F9C299`; `docs/design/helix/L5-detail/design-template-json-authority.md:74`; `3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830` | verification欄にrequired oracle classとnegative/stale条件を分ける。 | OracleKind値域を現L4に従って扱う。旧JSON schema/value setを現行authorityとして再利用しない。 |

旧assetの完全一致再利用ではなく、失敗・保持点をL4 §13の型と既存K1/K2/K5/K6境界へ再導出する。変更理由は現行の固定contractとCPython semantic-core候補に沿った技術具体化であり、旧runtimeの有無や不在そのものではない。

### 14.4 private helperの実装候補と未接続境界

`helix/helix-harness/units/common-kernel/src/_k4_g3.py`にprivate pure helperを置き、L4で既に定義された値を受けた後の比較だけを行う。`_obligation_id_delta`は固定`ObligationSet`とviewから渡されたobligation ID集合の欠落/余分集合を返す。`_not_applicable_fields_complete`と`_deferred_fields_complete`はL4の各3 fieldが非nullであることだけを返す。`_handoff_delta`は`from_view`から既に導いた`obligation_id -> (key_digest, result_digest)`とHandoffから既に取り出したunfinished ID/record pairを比較し、missing/extra ID・missing/mismatched record ID集合を返す。戻りはPythonのbool/frozensetだけであり、K1 `Observed`、`Unknown`、`Unobserved`、`Rejected`、新しいK4/G3 domain型を生成しない。

対応するunitは`tests/test_k4_g3_private_helpers.py`に限定し、fixture入力境界から先のhelper assertionを検査する。この候補でprivate helper assertionを実行したL8 IDは`L8-K4-01-COMPLETE/MISSING/EXTRA/EMPTY-SET`、`L8-K4-05-NA-VALID/DEFERRED-VALID/NA-MISSING-REASON/NA-MISSING-AUTHORITY/NA-MISSING-REENTRY/DEFERRED-MISSING-TARGET/DEFERRED-MISSING-OWNER/DEFERRED-MISSING-DISCHARGE`、`L8-K4-09-RECEIVE-MATCH/MISSING-NEW-UNFINISHED/MISSING-OLD-UNFINISHED/EXTRA-UNFINISHED/MISSING-NEW-INHERITED/MISSING-OLD-INHERITED/MISMATCH-NEW-INHERITED/MISMATCH-OLD-INHERITED`の20件である。ID対応はhelperの比較範囲だけを示し、L8ケース全体やL9 oracleの実行ではない。`EMPTY-SET`の既存K1 whole `set_reason`確認は既存`combine([])`を直接使い、新しい診断を作らない。

実装状態は以下のとおり。73 fixture全体は未実行であり、20件はhelper-level assertionのみ、残り53件は未実装/未実施である。`CK-K4-UT-005`（公開API signature）と`CK-K4-UT-027`（Deferredを合成で落とさない）はこのhelperで扱わない。既存K2 lookup、K5 restore、K6 required/admit/reverify、OperationDecl/VerifierSet current source reader、K4 6 public APIは未接続であり、typed observation 36件はpartial実装と数えない。G3-I4 13件とG3-I5 2件はL4/L5 owner/API未接続のholdのまま、missing sourceを`Unobserved`へ写さない。K4/G3設計はCI登録、L9合格、owner source接続、製品動作を意味しない。

## 15. K7/G5 関数設計

本節はmain `4eefaafd153d1fe48f52d29cfc4eab14b1fb55df`にある既存Common Kernel L4 §15、L5 §11、L8 §10、L9 `IV-K7-01–15` / `IV-G5-01–10`の契約を、内部関数責務へ対応づける。これらは設計入力であり、fixture実行、owner接続、物理writer、内部デプロイの合格を示さない。既存K1/K2/K3/K4/G3/K5/K6 API、結果型、reason、K7/G5の9公開APIを変更しない。

直接由来はL4 §15.1のAC-OS-014-01/04/06、INFRA-005-AC-03/INFRA-006-AC-03、AC-HARNESS-L3-010-01/03・021-03、SECURITY-AC-009-01、2026-10-08方針6のPO判断に限る。K3 IV-K3-11/12/17、K5 event、K6 receipt、K10 graphは境界参照であり、新しい親へ昇格させない。

### 15.1 固定入力と旧source

| source | 現行固定revisionとcontent SHA-256 | 対象 |
|---|---|---|
| Common Kernel L4 | main `4eefaafd153d1fe48f52d29cfc4eab14b1fb55df`; `7d0d74ef75f4bf74ae50c2998b9d6d346ca01f4b14479d688e44aaeb8f10bd82` | §15.1–15.10（型、K7/G5不変条件、9 API、保証限界） |
| Common Kernel L5 | main `4eefaafd153d1fe48f52d29cfc4eab14b1fb55df`; `445c564a7b5678d7609daf4142090a26a3df73ce76522a29771a6dad5cdce3f2` | §11.1–11.5（9 API、型、invariant trace、owner境界） |
| Common Kernel L8 | main `4eefaafd153d1fe48f52d29cfc4eab14b1fb55df`; `9c895a423071749a8af067736f83efd4c42c56375bff3fd653e907b361f2ea7a` | §10.1–10.3（115個別fixture ID、K3-17/LDG-03境界） |
| Common Kernel L9 | main `4eefaafd153d1fe48f52d29cfc4eab14b1fb55df`; `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` | IV-K7-01–15、IV-G5-01–10、IV-LDG-01–04。K3-17は接続境界。 |

L4 §15.1/15.7に記録された旧source指定spanを読み、archive full-file SHA-256とledgerの`source_sha256`を照合した。旧source、CLI、runtime、test、CIは読取のみで、実行していない。

| asset / 旧source path:行 / full-file SHA-256 | 台帳 | 保持点 | 現行での差分と理由 |
|---|---|---|---|
| `LEGACY-ASSET-B6DC14C1DA937E3AC96C` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/node-runtime-cutover.md:47–53,106–112,123–129` / `49f3e4c324b19e728f7c05787bbd698f841728a526eedc7cec3f756b3601e9f9` | row 570; Historical/unresolved | pointer一件CAS、commit直前のauthority/writer epoch/lease再読、CAS敗者と古いfenceの作用0。 | runtime切替の状態機械やwriterは複製せず、L4 K7の段階世代pointer契約へ意味再導出。 |
| `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:117,198` / `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | row 424; RequirementSourceSnapshot; consumer_refs `requirement-carry-forward-ledgers`, `requirement-atomization-review` | 失効runの遅着結果をcommitせず、lease失効後の作用をfence不一致で拒否する歴史。 | source snapshotをcurrent要求やauthorityへ昇格しない。現行期待は承認済みL4 K7-I6に従う。 |
| `LEGACY-ASSET-BC2275DCE9BFFCF813C8` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/python-worker-runtime.md:133–136` / `4c26544b5cf6e63ed226838ff5e04b3a669f6a9aa13456ffc5e5fb41fc755f8a` | row 577; Historical/unresolved | cancel/timeout/reassignment後の古いfenceによるlate result拒否、新ownerは新しいrun/checkpointから再開。 | 旧runtimeを起動・移植せず、K7-I6の既存EpochToken比較へ再導出。 |
| `LEGACY-ASSET-1B413588CFF3B1360B49` / `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-009-node-python-linux-runtime.md:113–120` / `bdd1c9a00243b723342e42531ddeabbf2f7570594943c11226d5b0461769753c` | row 266; Historical/unresolved | 可逆切替、明示許可rollback、自動fallback禁止。 | Node/Bun選択・自動切戻しは採らず、既存K7-I3/I4/I5とPhase 2判断境界を保持。 |
| `LEGACY-ASSET-D461943347D372ECF6DA` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requirements.md:33,43` / `38a68e48ca26cb277b6f5d88439b33b58aecf48f5b650f7596aec04e438b6b16` | row 869; Historical/unresolved; 未承認candidate | revokeを新規処理だけでなくin-flight lease/credential/artifact accessへ伝える歴史的候補。 | 未承認candidateから要求や受け手一覧を作らない。現行recipient/class集合はL4 G5と承認済SECURITY-AC-009-01から得る。 |

受け手の全集合を依存グラフの影響から導くG5と、型番台帳をK5 logとして表す提案は旧sourceに同じ契約を確認できず、L4 §15.7が新規案と記録している。既存L4/L9より意味を広げず、物理writer、K3許可、K5 append/read、K6 receipt、K10 graph、SECURITY recipient owner、runtime observationをここで実装したことにしない。

### 15.2 9公開APIとprivate function境界

公開APIのsignatureと返却unionはL4 §15.6/L5 §11.3のまま用いる。次のprivate helper番号はL7 traceのための設計locatorであり、公開API、owner callback、例外/reason、保存形式を追加しない。`input_heads`は呼出側がownerのcurrent ref/headを選ぶ入力ではなく、current owner readとの照合用期待値に限る。`K7SnapshotRole`/`K7SnapshotHead`はK2 aliasとは独立したK7 role wrapperである。

| helper候補 | 接続する既存API | 担当する既存契約・戻りfield locator | owner/physical boundaryと状態 |
|---|---|---|---|
| `CK-K7G5-FN-01 pointer_current` | `request_move`, `ledger_view` | PointerLogのpointer_writer segment内seqと先行segmentへのWriterHandoff連鎖からcurrent `Generation`を読む。`LedgerView.target.generation`へ同じprojectionを供給。 | K5 restore/current-head・PointerLog ownerが未接続。指定prefixを渡したpure order projection候補のみ。欠損をValue化せずL4既存`Unknown(missing_input)`保持。 |
| `CK-K7G5-FN-02 stage_eligibility` | `stage_generation`, `request_move` | Generationのtarget/composition・ReleaseEstablished・ManifestRef exact照合、kind別new/current/held条件、stage_key由来条件を比較。`GenerationStaged`または`MoveRequested.eligibility`の既存field位置へ対応。 | ReleaseLog/manifest/K5 reader、OS/build current OperationDecl・VerifierSet、K6 receipt未接続。public結果はL4の`Appended`/`Rejected(not_eligible)`の範囲であり、helperから追記しない。 |
| `CK-K7G5-FN-03 move_snapshot` | `request_move`, `apply_move`, `verify_current` | current stage/build OperationDecl・VerifierSet・RL-R2(a)–(d) refs/headsをrole付きK7 snapshot集合として照合。`MoveRequested.eligibility_snapshot`と`PointerMoved.checked_heads`を別fieldに投影。 | OS/build declaration/ref/head resolver未接続。callerが渡す期待headsをcurrent sourceにしない。 |
| `CK-K7G5-FN-04 apply_precondition` | `apply_move`, `append_if_head` | `request.pointer_head`、from/current、eligibility snapshot、K3 current permissionをcommit境界前に照合し、head一致時の一行append条件へ渡す。head不一致の既存`Rejected(stale_head)`とeligibility driftの`Rejected(stale_eligibility)`を区別。 | K3 permission ownerおよびK5 atomic compare-and-append未接続。純粋な入力比較候補で、追記や原子性を主張しない。 |
| `CK-K7G5-FN-05 verify_current_inputs` | `verify_current` | checked_headsを履歴として保ちつつ、current owner declarationsから同じ依存集合を新導出し、全fixed refsのbytes/digestとcurrent headsを再取得した結果で適格性を再計算。`Observed<RequiredResult>`と必要時の`RollbackRequired`位置を維持。 | current owner source、fixed bytes reader、K6 receipt、K5 writer未接続。既定readerで`Observed`を合成しない。 |
| `CK-K7G5-FN-06 immediate_recovery_position` | `recover_move_observation`, `ledger_view` | `MoveAuthorizationObserved`を同じPointerLog segmentのPointerMoved seq+1、同じmove digest、phase、observed_atで分ける。recovery診断は`LedgerView.target.recovery_diagnostics`に保持し、欠けたimmediateを補わない。 | K5 segment reader/writerとK3 permission current-source未接続。停止注入・実ログは設計のみ。既存`Rejected(not_a_move | already_immediate)`以外のreasonを追加しない。 |
| `CK-K7G5-FN-07 failure_state_projection` | `apply_move`, `ledger_view`, `propagate` | failure後のRollbackRequired、pointer不変、case state/incident不変を別source/fieldに保持し、自動切戻しを出力しない。 | K5 append/store・実failure producer未接続。局所immutability projection/assertion候補だけであり、public actionを実施しない。 |
| `CK-K7G5-FN-08 effect_fence` | `admit_effect`, `apply_move` | scope/number/entry_digestのEpochToken一致→Propagation Positive→新しい許可記録の既存順序を照合し、old-token observationをLateObservationに分ける。 | EpochLog/current permission/propagation readerと作用consumer未接続。既存`Rejected(fenced | revocation_pending | missing_authorization)`だけを保ち、作用0を設計期待とする。 |
| `CK-K7G5-FN-09 ledger_projection` | `ledger_view` | 台帳rows、ReleaseLog release、PointerLog target `{generation, immediate_check, recovery_diagnostics}`、RuntimeLog actualをfield別に投影し、互いを補完に使わない。 | 各K5 source reader/project未接続。raw sourceを与えたpure separation assertion候補。K5保存・registry・登録は追加しない。 |
| `CK-K7G5-FN-10 recipient_set_projection` | `propagate` | current GraphDecl/GraphRulesからK10照会→impact→review_setで得るaffected/review義務identityをRecipientMap classへ写し、同一identityの全class、全graph/review component、empty set_reasonを保持。 | K10 current graph/rules query、SECURITY RecipientMap、review-set owner未接続。候補値からcurrent owner sourceを生成せず、unmapped kindは既存`Unknown(unregistered)`を保持。 |
| `CK-K7G5-FN-11 recipient_status_projection` | `propagate` | 各recipient current RecipientDecl SubjectRefでrevocation_apply keyを作る既存L5境界に接続し、K2 lookup/K6 required receiptから全inner、`set_reason`、`assurance`をidentity/verifier/check別に保つ。 | RecipientDecl/OperationDecl/VerifierSet current owner、K5 sequence restore、K6 reader未接続。receipt受領・適用・実作用や署名真正性を合成しない。 |

9つの公開APIへの結線は次表の範囲に限る。`append_if_head`はK5 owner受口でありL6候補はhead比較とhandoff境界までである。

| 既存公開API | L6 private function候補 | 既存戻りの観測位置・接続保留 |
|---|---|---|
| `stage_generation(generation)` | FN-02 | `Appended(GenerationStaged)` / `Rejected(not_eligible)`。ReleaseLog・固定manifest readerとOS pointer writer未接続。 |
| `request_move(target, from, to, kind, authorization, input_heads)` | FN-01/02/03 | `Appended(MoveRequested)` / `Rejected(stale_from | not_eligible)`。current stage/build owner、K3、RequestLog append未接続。 |
| `apply_move(request, input_heads)` | FN-03/04/05/06 | `Appended(PointerMoved)`、`AppliedUncertain(event, check, unfinished)`、既存`Rejected(stale_head | stale_eligibility | authorization_unverified, check)`。K3 current auth、K5 CAS、post-append observer未接続。 |
| `recover_move_observation(move_ref, input_heads)` | FN-06 | `Appended(MoveAuthorizationObserved)` / `Rejected(not_a_move | already_immediate)`。回復は診断行保存であり即時成功ではない。K5 append未接続。 |
| `verify_current(target)` | FN-03/05/07 | `Observed<RequiredResult>`とRollbackRequired field。fresh current readがなければ公開観測を作らずowner接続保留。 |
| `append_if_head(segment, expected_head, entry)` | FN-04 | `Appended` / `Rejected(stale_head)`。物理atomicityはrepository-layout RL-P7 owner。 |
| `admit_effect(effect, epoch_token, input_heads)` | FN-08 | `Appended` / 既存`Rejected(fenced | revocation_pending | missing_authorization)`。実作用・authorization producerなし。 |
| `propagate(revocation, graph_decl, graph_rules, condition_state, obligation_set_keys, decls, recipient_decls, verifier_set, input_heads)` | FN-10/11 | `Observed<PropagationView>`の`recipients`/`combined`/`assurance`と元K10/K6診断。owner current sourceなしにPositiveやrecipient refを合成しない。 |
| `ledger_view(input_heads)` | FN-01/06/09 | `Observed<LedgerView>`の`rows`/`release`/`target`/`actual`。PointerLogからactual、RuntimeLogからtarget、requestからどちらも導かない。各K5 reader未接続。 |

### 15.3 invariantからL9 oracleへのtraceと設計限界

| L4 invariant | L6 helper候補 | L9 oracle | L8 fixture family |
|---|---|---|---|
| K7-I1 | FN-01 | IV-K7-01 | L8-K7-01-* |
| K7-I2 | FN-03/04 | IV-K7-02/11/12 | L8-K7-02-*, 11-*, 12-* |
| K7-I2b | FN-03/04/05 | IV-K7-13 | L8-K7-13-* |
| K7-I3 | FN-02/03 | IV-K7-03/04/14/15 | L8-K7-03-*, 04-*, 14-*, 15-* |
| K7-I4/I4b | FN-04/06 | IV-K7-05; K3 IV-K3-11/12/17 boundary | L8-K7-05-* and RECOVERY-* |
| K7-I5 | FN-07 | IV-K7-06 | L8-K7-06-* |
| K7-I6 | FN-08 | IV-K7-07–10 | L8-K7-07-*–10-* |
| G5-I1 | FN-10 | IV-G5-01/02/09 | L8-G5-01/02/09-* |
| G5-I2 | FN-11 | IV-G5-03/04/10 | L8-G5-03/04/10-* |
| G5-I3/I4 | FN-08/10 | IV-G5-05/06 | L8-G5-05/06-* |
| G5-I5 | FN-07/10 | IV-G5-07 | L8-G5-07-* |
| G5-I6 | FN-06/08/09/11 | IV-G5-08; K3 IV-K3-17 boundary | L8-G5-08-* |
| 台帳release/target/actual分離 | FN-09 | IV-LDG-03 | L8-K7-LEDGER-* |

K3 IV-K3-17とIV-LDG-03はK7/G5境界の既存traceであり、K7/G5 oracle数へ加えない。IV-LDG-01/02/04は同じ§15にある接続参照で、L8 §10の115 fixture集合へ含めない。L7はL8 §10の115 IDを個別に参照し、L9のK7 15件/G5 10件を持つ既存oracle mapへtraceする。

純粋な候補処理は、明示的に与えられたtyped snapshotの順序、ref identity/digest、集合の重複保持、projection field分離、非肯定の全component保持を比較する範囲である。これらを実行する局所fixtureはK5/K10/K3/K6 ownerのsourceを読んだことや公開APIが接続されたことを示さない。明示source readerがない場合に`Value`、`Positive`、`Observed`を作る既定portは置かない。K5のread/append/restore/project、K3 current permission、K4/current verifier set、K6 receipt、K10 current graph/review_set、SECURITY RecipientMap/RecipientDecl、OS/build declarations、EpochLog、RuntimeLog、物理CAS、internal deploymentの各実owner境界は未接続である。L4/L5/L8/L9にないowner mappingや戻りreasonを新設せず、該当経路の実装・実行はowner返却としてholdする。

K7/G5は本節で関数責務へ下ろした設計候補であり、§15.4に記録したhelper-level部分実装以外のL6実装、115 formal fixtureのL7実行、L9 pass、K7/G5 CI inventory登録、製品のcurrent reader/writer、実deployment、L10達成を示さない。

### 15.4 private helperの限定実装・実行記録

main `27707fe9f1506afaa3ab88b665f655b7212233f9`から分離した候補実装で、`helix/helix-harness/units/common-kernel/src/_k7_g5_private.py`に既存`SegmentHead`/`SubjectRef`とPythonの`str`/`tuple`/`frozenset`だけを比較・保持するprivate helperを置いた。moduleの`__all__`は空であり、公開API、Generation/Epoch/Pointer/RecipientMap等のdomain型、return union、keyless `Unknown`、owner port、外部reader/writer、append/CAS、fence作用は追加していない。

`helix/helix-harness/units/common-kernel/tests/test_k7_g5_private.py`の5件は、L7 §12.5に列挙した3個のK7局所比較（UT-006/033/035）と、既存入力からのG5 identity/class集合保持・一class欠落比較（UT-035/036）を検査する。`python3 -m unittest discover -s helix/helix-harness/units/common-kernel/tests -p 'test_k7_g5_private.py' -v`は5件成功した。これはL8 formal fixture全体の実行ではなく、115 fixtureはすべて未実行である。helperの実装・test SHA-256はそれぞれ`e13bff0ec554ab8a244949e3f318c86c00e88556ca9286fca51bd409c9b5917c`、`32aebb1851310f7938dd5cbf056f0041f5caafd26a2db8b1737fe5fb6f200ff9`である。

この部分実装は9公開API、K5 source復元・current owner、K3 permission、K4 verifier set、K6 receipt、K10 graph/review set、OS/build declaration、SECURITY recipient source、physical append/CAS、internal deploymentを実装・接続していない。115 L8 formal fixture/L9 oracleの達成、製品動作、L10成立を主張しない。K7/G5 helper suiteは現行CI inventoryに未登録であり、local CIの586 Core discovery identityへ含めない。

## 16. K9 独立review関数設計

本節は、現行main `30e957ee900da7735b6c691bdb63b55cae7a0c95`に含まれるCommon Kernel L4 §17、L5 §10、L8 §9、L9 IV-K9-01–15を関数責務へ接続する設計である。参照本文のSHA-256はL4 `7d0d74ef75f4bf74ae50c2998b9d6d346ca01f4b14479d688e44aaeb8f10bd82`、L5 `445c564a7b5678d7609daf4142090a26a3df73ce76522a29771a6dad5cdce3f2`、L9 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`である。L8のK9 fixture locatorは`docs/helix-harness/L8-detail-verification/common-kernel-detail-verification.md` §9であり、L7から一方向に参照する。L8 fixtureの実行、owner接続、K9合格を意味しない。

直接親はL4 §17.1のConcept:236、AC-OS-029-03、AC-INTELLIGENCE-L3-072-08である。個別要素はL4 §17.1のcrosswalkからそれぞれtraceし、単一のまとめ親を置かない。K9-I1–I8と型はL4 §17、K9公開APIと詳細候補はL5 §10、oracleはL9 IV-K9-01–15を正本とする。L6はAPI/型/UnknownReason/K2優先順位を変更せず、K9が要求採択、reviewer採用、検証合格、Verified/Accepted、completion、authorityを生成しない境界を保つ。

### 16.1 公開API・型境界

公開面はL4 §17.4/L5 §10.3の次の2 APIだけである。Python候補実装はCPython 3.11+標準ライブラリに限定できるが、この技術候補はowner readやproduction connectionの実装を示さない。

```text
resolve_creator_inventory(
  current_assignment: SubjectRef,
  selected_source_records: SubjectRef[],
  actual_content_producer_graph: SubjectRef,
  owner_source_closure: SubjectRef[],
  input_heads: InputHeads
) -> Observed<{slots: ParticipantSlot[], selections: RoleSelection[], complete: Bool}>

check_review_independence(
  target: ReviewTarget,
  creator_inventory: SubjectRef,
  review_execution_record: SubjectRef,
  reviewer_origin_contract: SubjectRef,
  context_owner_contract: SubjectRef,
  authority_owner_record: SubjectRef,
  route_owner_contract: SubjectRef,
  input_heads: InputHeads
) -> ReviewIndependenceCheck | Rejected(missing_key, diagnostic)
```

`ParticipantSlot`、`RoleSelection`、`ContentProducerGraph`、`ParticipantBindingSet`、`ReviewTarget`、`ReviewAxisCheck`、`ReviewIndependence`、`K9IndependenceComponent`、`ReviewIndependenceCheck`の全fieldはL4 §17.2の既存shapeを使う。K9へ型・reason・API引数を追加しない。`resolve_creator_inventory`の戻りには外側Rejectedを追加しない。`check_review_independence`の外側Rejectedは既存signatureの`missing_key`に限る。APIが要求するSubjectRef全体の必須field欠落と、完全なrefが指すowner source内のdata欠落を混同しない。

### 16.2 関数責務候補

以下の`CK-K9-FN-*`はL6内trace IDで、private helper候補または既存APIの責務境界を示す。新しい公開関数ではない。ownerのcurrent declaration/source resolverやK6 readerを呼出し側の値で代替しない。

| L6 ID | 責務/visibility | 入出力と責務 | 失敗境界・L4/L9 trace |
|---|---|---|---|
| `CK-K9-FN-01` | `resolve_creator_inventory` API orchestration | 既存API refsと`input_heads`を受け、OS assignment、選択記録、actual content-producer graph、source closure/coverageの各owner-current観測を既存owner境界から取得する順序を束ねる。 | resolver/schema/read adapterが未登録の条件を実読済みと扱わず、各L4既定non-valueを保持する。K9-I1/I2; IV-K9-01/02。 |
| `CK-K9-FN-02` | private `_check_inventory_inputs` | 解決済みtyped observationsのref/source completeness、current-head一致、明示`not_selected`と欠落を区別し、I1–I3に沿って完全なroster候補を照合する。 | caller slot/complete claimを採らない。欠落=`Unknown(missing_input)`、closure未登録=`Unknown(unregistered)`、確定source間不一致=`Unknown(conflict)`、全量性未証明=`Unknown(unsupported)`。K9-I1–I3; IV-K9-01–04。 |
| `CK-K9-FN-03` | private `_fold_creator_inventory` | owner-resolved `ParticipantSlot[]`/`RoleSelection[]`/graph/closure observationsを純粋に照合し、既存`Observed<{slots,selections,complete}>`のshapeへ整える。 | source readをしないpure helper候補。空creatorは`Unknown(missing_input)`。未知selectionをnot_selectedへ変えない。K9-I2/I6; IV-K9-02/03/04。 |
| `CK-K9-FN-04` | `check_review_independence` API orchestration | exact ReviewTargetと各owner refをcurrent read境界へ渡し、creator inventory result/key、review execution origin、context/authority/route owner valuesを統合する。 | required key構成不能だけが既存外側`Rejected(missing_key, diagnostic)`。owner schema/data absenceはL4既定Observed result/componentとして保持し、新reasonを作らない。K9-I4/I5/I7; IV-K9-05–15。 |
| `CK-K9-FN-05` | private `_bind_review_target` | L4 ReviewTargetのartifact/base/task_scope/oracle/current_result/caseの6 refをowner-current bindingとfieldごとに比較する。 | fresh確定不一致の外側`Unknown(conflict)`はL4で固定。component/combinedへのtarget mismatch投影は既存unionに無く未接続であり、新componentを作らない。K9-I5; IV-K9-07。 |
| `CK-K9-FN-06` | private `_compare_resolved_axes` | owner contractから既に解決したidentity/context/authority/route比較identityをslot単位で比較し、既存`ReviewAxisCheck`のcreator/reviewer refs・comparison contract・identity fields・relationへ保持する。 | raw ref/revision/operation/target/source/provider/modelだけからdistinctを導かない。context/route schema未定義=`Unknown(unsupported)`、定義済みcurrent declaration未登録=`Unknown(unregistered)`。K9-I4/I5; IV-K9-06/08/09/10。 |
| `CK-K9-FN-07` | private `_combine_review_components` | L4指定のcomponent順でnonempty、roster completeness、slot×identity/context/authority/routeを保持し、既存K1 `combine`/owner `PolarityOf`を使う。 | sameがあればK1 Negativeと全non_valuesを併存保持。未知があればUndetermined。非empty/completeと全distinctが確認済みの時だけIndependent/Positive。mappingを推測しない。K9-I5/I6; IV-K9-04/06/08/09/10/15。 |
| `CK-K9-FN-08` | private `_lookup_current_k9_key` | 既存K2 `key_of`/`lookup`境界で、L5に定めるoperation/version/subject/inputs/scopeと完全current refsからK9保存結果を照合する。fresh evaluationからsaved lookupを分離する。 | same identity旧revisionのprior Value=`Stale`、同revision異digest=`Unknown(conflict)`、inputs identity set差=`Unobserved(not_run)`。prior non-ValueはK2分類のまま保持する。K9-I7; IV-K9-07/12/13/15。 |
| `CK-K9-FN-09` | private `_preserve_k6_assurance` | `ReviewIndependenceCheck.assurance`へ、既存K6のreproduction/issuer_authenticity等3項目を別欄のまま保持する。 | K6 authenticity/reproduction non-valueをK9 axis/result/authorityへ写さない。K9は`authority_effect="none"`を維持しacceptance/completionを返さない。K9-I8; IV-K9-05/14。 |

### 16.3 呼出し順、key、非Value

`resolve_creator_inventory`はrefs/key preflight、current owner heads/source reads、K5/K6の既存read/admission、owner source間のselection/graph/closure fold、K2 record/lookupの順で構成する候補である。`check_review_independence`はAPI key境界、inventory fixed refのcurrent照合、ReviewTarget 6 refのfresh一致、review originとowner axis sources、slot×4軸比較、K1 component combine、K2 saved result lookupの順である。L6は各owner resolverの登録・実装を主張しない。`input_heads`は期待headでありcurrent正本の指定ではない。

source inventoryの非ValueはL4 §17.3早期returnに従い、四軸比較へ進まない。完全なK9 refsを使ってreview keyを構成できる場合だけ、そのoperation自身の既存`Unknown` result/component/combinedを型どおり保持する。必要なtarget/owner/binding refsが欠けreview keyが構成できない場合は既存外側`Rejected(missing_key)`であり、inventory keyをreview keyへ流用しない。`resolve_creator_inventory`に外側Rejectedを新設しない。API key不可と、完全API ref配下でowner source fieldが欠ける`Unknown(missing_input)`も分ける。

四軸比較単位はrole slotであり、同raw refの重複をK2 duplicate identityとして拒否しない。L4 §17.3の`source_content` RoleBoundSourceRef aliasとParticipantBindingSet canonical bytesを使う。role/side/axis別aliasは保持し、binding bytes読取とK6が行うaliasごとの原source bytes実読を別にする。同じalias identity内で異なるraw refsは既存K2 key境界の`Rejected(missing_key)`であり、異なるrole/side間の同一raw refは衝突として保持する。

fresh owner-source mismatchはL4どおり`Unknown(conflict)`で、保存済みValueのStaleで代用しない。K2 prior lookupはcurrent keyを再導出した後にのみ行う。K4 `Deferred` receipt未着のK4 `ObligationView`は既存L8-K4-05 trace reuseの範囲に留め、K9 candidate/review段階へのprojectionは未接続。K6 binding/source read failureはK6自身の結果を保持し、K9 result/components/combinedへのmappingがない2 fixtureはK9 oracle充足へ数えない。

### 16.4 L4 invariant・L9 oracle trace

| L4 invariant | 関数 | L9 oracle |
|---|---|---|
| K9-I1 source-boundary | FN-01/FN-02 | IV-K9-01 |
| K9-I2 roster completeness | FN-01/FN-02/FN-03 | IV-K9-02 |
| K9-I3 role binding/dedup | FN-02/FN-04/FN-06/FN-08 | IV-K9-05 |
| K9-I4 owner contract | FN-04/FN-06 | IV-K9-08/09 |
| K9-I5 four axes/target | FN-05/FN-06/FN-07 | IV-K9-06/07/10 |
| K9-I6 empty creator rejection | FN-02/FN-03/FN-07 | IV-K9-04 |
| K9-I7 stage separation/reuse | FN-04/FN-08 | IV-K9-11/12/13/15 |
| K9-I8 no authority/assurance separation | FN-09 | IV-K9-14 |

K9 L9の15 oracleはL9 IV-K9-01–15のままであり、API/function IDsは新しいrequirementsやoraclesではない。L8のK9 §9.17に明記された返却事項（IV-K9-05 K6→K9投影、IV-K9-11 K4→K9段階接続、ReviewTarget mismatch component表現）を未接続のまま保ち、API/union/reasonを増やさない。

### 16.5 旧HELIX source・保持点・差分理由

旧assetのsource span、full-file SHA-256、台帳状態とconsumer照合はL5 §10.2の11行を正本とする。全11 assetは`Historical`/`unresolved`で`consumer_refs=[]`として台帳にあり、runtime/test/CLI/CIを起動していない。L6は以下の役割で旧根拠を再導出し、旧APIや過去の合格を再利用しない。

| L5 §10.2 asset | 保持するfailure/意図 | 現K9への対応と変更理由 |
|---|---|---|
| `LEGACY-ASSET-D107FD145A2588FAAD09` | actor自己申告でなくexecution originから導く | K9-I1/K6 origin source境界。sealed broker/保証は未接続。 |
| `LEGACY-ASSET-50A93B0E753DC3840E03` | 同provider/modelでも独立し得る正常系、三軸collision | 四軸L4 owner valuesから再導出。旧sandbox条件は不採用。 |
| `LEGACY-ASSET-FD3F979AF945CE3EC306` / `A04F169C5D514C5443D0` | producer/executor/publisher分離、scope/source binding | metadata/provider/runtimeを製品判定軸にしない。候補要求をauthorityへ昇格しない。 |
| `LEGACY-ASSET-7AFB0C65E70ED4C0856E` | role入替、wrong assignment/HEAD、spoof/staleを分ける | L8で一条件ごとに再導出。runtime-family rejectionは除外。 |
| `LEGACY-ASSET-0F15A8439F925AA1CB08` / `D4CB3FE6A76F3A54FED1` | L4/L9 pair、draft/no completion claim、後続lifecycle分離 | K9 observationがacceptance/completion/lifecycleを作らない。 |
| `LEGACY-ASSET-0449CFE6165EF25515B7` / `E8B32F8D6519FFCED39A` | strict receipt/origin、旧function flow・identity/session/context照合 | L4の2 API/4軸とK6 assuranceへ再導出。旧function名/brokerを移植しない。 |
| `LEGACY-ASSET-25EB3B29EA909B050987` | receiptを消費する後続lifecycle | K9は後続terminal stateを生成しない。 |
| `LEGACY-ASSET-D6816E22DAF2E990410B` | GitHub cross-review admissionのmixed/external条件 | 開発運用consumer固有であり製品K9へ持ち込まない。 |

旧source保持点は役割分離、actor自己申告拒否、collision/同provider-model正常例の分離、missing/unknown/stale非昇格、後続lifecycle分離である。変更は旧三軸・sealed broker/runtime-family条件を現Concept/L3の四軸とowner source境界へ再導出する点に限る。L5 §10.2の個別path/span/fullSHAがこの表のasset IDごとのsource locatorである。

### 16.6 確認できない範囲

OS assignment/selection/content-producer graph/source closureのcurrent reader、reviewer execution origin、context/route schema、SECURITY authority identity mapping、K6 read resultからK9結果へのprojectionは現L4/L5に具体owner adapterとして接続されていない。これらを推測で追加せず、各fixtureのowner未接続をL8 §9.17の返却先へ戻す。L7 unit designはL8の期待をtraceする設計であり、L8 fixture実行、K9 end-to-end実装、K6 authenticity、L9統合、登録済みunit packまたは製品動作を主張しない。

## 17. K8: input labelとauthority-effect observationの境界

### 17.1 固定入力とAPI境界

K8の直接traceはL4 §18.1で明記されたSECURITY-AC-001-01の要素別crosswalkに限る。K8専用の共通kernel親、分類語彙、target語彙、taint伝播、許可、作用実行を追加しない。L4/L9とL5/L8は下表source baseの固定snapshot本文である。現在mainの全本文SHAとは区別し、K8節の既存fixture本文を保持する。

| source | 対象・SHA-256 |
|---|---|
| L4 Common Kernel | `docs/helix-harness/L4-basic-design/common-kernel.md` §18; `7d0d74ef75f4bf74ae50c2998b9d6d346ca01f4b14479d688e44aaeb8f10bd82` |
| L5 Common Kernel | `docs/helix-harness/L5-detail-design/common-kernel.md` §12; `b6b2f2fe6d47d413a2d9e37d1ab26ea9017017d86a091ee2c8f5a144ac7cdc4a` |
| L9 Common Kernel | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` IV-K8-01–26; `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` |
| source base | `main` `46cbf9297a11b7f23f561a57b5cab21768fe075c` |

L5 §12.3の4公開signatureをそのまま保持する。下表はAPIの実装状態ではなく、L6責務境界を明示する。

| 既存API | L5返却型 | L6の関数責務 / 未接続境界 |
|---|---|---|
| `observe_input_label(input_ref, input_heads)` | `ObservedLabel | Rejected(missing_key)` | owner declaration/source readerのcurrent再読は未接続。入力`Observed`/trustを変換しない純projection候補のみ。 |
| `observe_authority_effect(case_ref, effect_observation_ref, input_heads)` | `Observed<EffectObservation> | Rejected(missing_key)` | case/effect-source readerは未接続。raw `none`/null/event/bindingの保持候補のみ。作用を生成しない。 |
| `validate_label_transition(case_ref, input_label_ref, route_ref, k3_permission_check_ref, effect_observation_ref, input_heads)` | `TransitionValidation | Rejected(missing_key)` | K3/K6 current owner readerとK5 evidence read/writeは未接続。既にtypedな入力間のL4 precedence・field比較だけがprivate純関数候補。 |
| `record_label_transition(case_ref, input_heads)` | `LabelTransition | Rejected(missing_key)` | owner binding/result-pointer source readと各current K2 key再構成/lookupは未接続。lookup結果を混ぜず配置する純projection候補のみ。 |

L4 K8-I1–I8とIV-K8 oracleの対応は次のとおり。L7 §14.2は162 fixture IDを各一度定義し、5 BASEと157 variantを分ける。`not run`/owner未接続を成功扱いしない。

| L9 oracle | L4 invariant | L5 API / boundary | L8 variant数 | L6責務と状態 |
|---|---|---|---:|---|
| `IV-K8-01` | K8-I1：入力出自とK2 key | `observe_input_label` / K2 `key_of`, `lookup` | 5 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | K2 key/lookup候補。owner current reader未接続のためL8全体は未実行 |
| `IV-K8-02` | K8-I2/I3：分類不能とuntrusted保持 | `observe_input_label` | 3 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | 既存Observedのclass/reason/trust保持候補。source reader未接続 |
| `IV-K8-03` | K8-I1：SECURITY declarationのoperation別current参照 | `observe_input_label`, `observe_authority_effect`, `validate_label_transition` | 4 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | operation別required sliceの構造候補。current declaration/reader未接続 |
| `IV-K8-04` | K8-I5/I6：fresh validationのroute・permission・作用照合 | `validate_label_transition` / private component evaluator | 9 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | typed component precedence・MismatchField順序のprivate純関数候補。K3/K6 reader未接続 |
| `IV-K8-05` | K8-I4：selectionと照会結果の分離 | `record_label_transition` | 5 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | pointerとNotSelected/KeyUnavailable projectionの境界。current lookup未接続 |
| `IV-K8-06` | K8-I6：effect sourceのcurrent再読 | `observe_authority_effect` / `record_label_transition` | 8 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | 原EffectObservation保持候補。effect source current reader未接続 |
| `IV-K8-07` | K8-I6：作用済み・未検証の保全 | `validate_label_transition`, `record_label_transition` | 3 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | effect事実とvalidation lookupの分離。owner source/K2 lookup未接続 |
| `IV-K8-08` | K8-I7：ACのread-only target別negative | consumer boundary / surface only | 11 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | consumer surfaceの構造照合のみ。外部target作用は未実施 |
| `IV-K8-09` | K6：receiptはauthority/effectを作らない | `validate_label_transition` / K6 result boundary | 3 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | 既存K6型の保持候補。K6 verifier/source未接続 |
| `IV-K8-10` | K2：revision/digestとidentity重複 | K2 `key_of` / `lookup` | 5 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | K2 key_of/lookup候補とalias入力形状。current owner refs未接続 |
| `IV-K8-11` | K8-I8：汎用taint機能を追加しない | public surface structure only | 5 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | 4 APIのsurface構造照合のみ。禁止API/語彙を追加しない |
| `IV-K8-12` | TransitionCaseとeffect binding | record projection / pointer diagnostics | 4 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | pointer diagnosticsとcurrent resultの分離。owner projection未接続 |
| `IV-K8-13` | K8 operation別K2 keyの正準形 | K2 operation-key lookup | 7 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | K2 lookup分類候補。operation current refs未接続 |
| `IV-K8-14` | K8CaseBindingRefの非循環case結合 | input-only binding canonical projection | 2 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | input-only binding bytesとresult pointersの非循環比較候補。owner binding未接続 |
| `IV-K8-15` | 確定不一致fieldの閉語彙 | private mismatch evaluator | 15 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | typed mismatch field比較・列順のprivate純関数候補。source exact read未接続 |
| `IV-K8-16` | fresh validationの単一結果と優先順 | private fresh precedence evaluator | 20 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | fresh precedenceのprivate純関数候補。API全体・K3/K6 owner reader未接続 |
| `IV-K8-17` | role aliasとsource実読 | role alias / raw-source reader boundary | 4 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | role aliasとraw source readの境界。raw source reader未接続 |
| `IV-K8-18` | case bindingの明示選択 | case binding reader boundary | 2 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | 明示case bindingの形状比較。current case resolver未接続 |
| `IV-K8-19` | current key再構成後のrecord lookup | record projection / K2 `lookup` | 6 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | K2 current lookup候補。current key再構成・pointer reader未接続 |
| `IV-K8-20` | K3/K6 assuranceとvalidation record evidence | saved evidence read/restore boundary | 17 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | evidence保存/復元・assurance保持はowner/K5未接続のため未実行 |
| `IV-K8-21` | classification keyの間接結合と非循環性 | input-only binding canonical projection | 2 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | input-only binding非循環性のcanonical bytes比較候補。owner binding未接続 |
| `IV-K8-22` | classification operation versionの正準化 | classification key builder / K2 `lookup` | 3 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | classification operation key比較候補。current classifier refs未接続 |
| `IV-K8-23` | observerの複合条件と主理由 | observer priority boundary | 3 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | 既定priorityの純粋候補。source reader/API境界未接続 |
| `IV-K8-24` | 未選択projectionとK1照会の差分 | explicit validation query / record projection | 3 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | NotSelected projectionとexplicit keyed queryの境界。current lookup未接続 |
| `IV-K8-25` | issuer診断とK6真正性 | issuer diagnostic / K6 result retention | 4 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | issuer診断/既存K6 result保持の構造候補。current issuer source未接続 |
| `IV-K8-26` | polarity識別と版 | K1 `PolarityOf` structure | 4 variant ID。L7 §14で個別ID・baseline・変異・expectedを固定。 | 既存PolarityOf identity/versionの構造照合。owner mapping未接続 |

### 17.2 L6 private候補と停止境界

次のpure candidateは既存L4/L5型で与えられた入力の保持・比較・順序処理だけを対象とする。新しい公開関数、domain語彙、reason、owner authority、current-source readerは作らない。

| private候補 | 既存型に対する局所責務 | 未接続境界 |
|---|---|---|
| `_retain_classification_observation` | 既存classification resultのclass/reason/source refと`trust="untrusted"`をそのまま保持する。 | SECURITY ClassificationDecl/current classifier/source reader、bytes/digest実読、K2/K5保存とlookup。 |
| `_retain_effect_observation` | typed `EffectObservation`内の`none`、event/binding nullと原refを落とさず保持する。 | case binding・effect source登録・source owner current readerと実読による`occurred`観測。caller申告を肯定化しない。 |
| `_compare_transition_fields` | L4 §18.4既定のfield集合・MismatchField列順と、完全値の比較を行う候補。比較不能な既存non-valueは保持し、Mismatchにしない。 | current source取得、K3/K6結果の生成・読取、保存evidenceの再構成。 |
| `_evaluate_fresh_components` | 既にtypedなK3/K6/effect/classification componentsのL4優先順を評価する候補。Observed effectとvalidated resultを分ける。 | API基盤key、current heads、K3 PermissionCheck/K6 RequiredResult reader、K2 record/evidence。 |
| `_project_current_lookups` | 各既存K2 lookup resultを別fieldへ配置し、NotSelected/KeyUnavailable/pointer diagnosticsを既存shapeのまま保つ。 | current case binding/result pointersのread、各operation keyの再構成とK2 lookup。 |
| `_check_polarity_mapping_shape` | 既存`k8_transition_polarity` identity/versionとpayloadの対応を構造照合する。 | owner mapping source解決と本番K1 combine接続。 |

API全体の`Rejected(missing_key)`はL5/L4の既存必須key境界に限る。`KeyUnavailable`, `NotSelected`, K1/K2 result, K3 `PermissionCheck`, K6 `RequiredResult`は異なる既存境界として保つ。K2 lookup Staleはrecord projectionの結果であり、fresh validation outcomeへ代入しない。作用が観測済みでもroute/binding欠落でvalidationを肯定しない。K7 `AppliedUncertain`等、他節の型や規則をここへ導入しない。

### 17.3 旧HELIX source・保持点・差分

旧sourceの指定span・asset ID・full-file SHAをL4 §18.2および台帳で照合した。保持するのは信頼境界、出自と作用の分離、未信頼入力の保持であり、旧runtimeや旧実装は再利用・実行しない。

| 旧asset | source locator / full-file SHA-256 | 保持点 | 変更点と理由 |
|---|---|---|---|
| `LEGACY-ASSET-18F7940E7994634D39A1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md:43,57,66,77,81` (source_snapshot_preservation) / `7a73fa86acd8e5a7b755a9479f67c4d2af1579e533df101b1b3294eeceb0d8cc` | 外部dataとinstructionを混同しないsource境界を調査起点として保持する。 | P8全体、旧sandbox/token/escalationは移さず、SECURITY-AC-001-01の限定traceへ再導出する。 |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:171,186` (historical/unresolved) / `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | raw input、trusted metadata、executable instructionの分離を保持する。 | 旧injection/exfiltrationの検出・処置動作は移さない。 |
| `LEGACY-ASSET-8DA932B4A1012B9D8F00` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-context-authority.md:19–24,30–53` (historical/unresolved) / `aca532c939e34f2a4fb6b47f74254ff76a49dfaea1eeb56ff5edd7f3a181acec` | current authority/scopeとhistorical inputを混同しない。 | 旧worker packet、launch/sandboxを移さない。 |
| `LEGACY-ASSET-AD72C8353ACD8C676C5F` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/worker-context-authority.md:19–46` (historical/unresolved) / `8818e7af133f2feb2268c6f2c8b04e509735ff330ab8510c2361086a242e6f12` | field/digest結合の厳密さを調査起点として保持する。 | 旧18-field schema/failure listは採用しない。 |
| `LEGACY-ASSET-2A73DCD3E15EC9B529CF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/worker-context-authority.md:19–29` (historical/unresolved) / `21406d2c7c72520f9928ce5e6ded143f8285c3975a3fb617293965661b01eff3` | 観測とauthority actionを分離する。 | attest/compile/launch APIや旧runtime authorityを移さない。 |
| `LEGACY-ASSET-D65FB82C21C5EDBDFCE4` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/memory-learning-promotion.md:39–48,72–89,91–145,147–165` (historical/unresolved) / `70ed887f35ca38a6e406d91b750848a9b89cde73825358c554ad009d473a115a` | raw evidence/progressとknowledge promotionを分離する。 | memory stages/threshold/DBは持ち込まない。 |
| `LEGACY-ASSET-256C9F8C3029B185B151` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/memory-learning-promotion.md:31–60,72–148` (historical/unresolved) / `e6e20a686ac0f9e019b9fd9803674c489b1e1674b7388efa20dfa3be648fb753` | pure read/classificationとcommit portの分離を調査起点とする。 | HIL taxonomy/promotion authorizationを移さない。 |

対象7 assetは旧本文の参照・判断史を起点にした意味再導出であり、旧runtime/test/CLI/CIの実行証拠ではない。consumer refsまたはfailure historyはL4 §18.2に記録された区分のまま保ち、現行のowner readerやK8動作として推定しない。

### 17.4 L9 oracleと検証範囲

本節は設計traceのみである。162 L8 fixture IDの内訳はBASE 5、variant 157。IV-K8-01–26ごとのvariant数は次の通りで合計157である。BASEは期待状態を示すが、実行methodやL9合格件数に数えない。

| IV | variants | IV | variants | IV | variants | IV | variants | IV | variants | IV | variants | IV | variants |
|---|---:|---|---:|---|---:|---|---:|---|---:|---|---:|---|---:|
| 01 | 5 | 02 | 3 | 03 | 4 | 04 | 9 | 05 | 5 | 06 | 8 | 07 | 3 |
| 08 | 11 | 09 | 3 | 10 | 5 | 11 | 5 | 12 | 4 | 13 | 7 | 14 | 2 |
| 15 | 15 | 16 | 20 | 17 | 4 | 18 | 2 | 19 | 6 | 20 | 17 | 21 | 2 |
| 22 | 3 | 23 | 3 | 24 | 3 | 25 | 4 | 26 | 4 |  |  |  |  |

K8の実owner reader、K3/K6 source current read、K5 evidence roundtrip、production API、CI manifest登録、fixture実行は未実施である。L7はL8のbaseline/mutation/expectedを逐語的に索引し、private candidate/structural-only/owner-unconnectedを区別する。fixture design inventoryをcoverage/passへ昇格させない。

## 18. K10 型付き依存グラフ関数設計

この節はmain `4a40597efbf867b6b5b5640060b2cac81de56de0` 時点のL4 §14/L9 K10 oracleと、同mainへ統合済みのL5 §13/L8 §12を関数責務へ下ろす。参照本文の開始時SHA-256はL4 `7d0d74ef75f4bf74ae50c2998b9d6d346ca01f4b14479d688e44aaeb8f10bd82`、L5 `1fb52363e169d6210b197b678e68881b49c87cecbf6e79e1767282996549b90a`、L8 `74ac95889ca8f436c7dcd643f0d9b7c1d20b0122ec615d0bd79219ab8b036d02`、L9 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`である。L5/L8はmain #2798に統合された設計根拠で、実装・fixture実行・owner source接続・L9合格を意味しない。K10直接親とStage 1 scopeはL4 §14.1およびL5 §13のとおり保持する。

### 18.1 型と6公開APIの実行順

L4 §14.2の型、L5 §13.1のsignature、戻りunionをそのまま用いる。新しいpublic type/field/API、K1 classification/reason、owner identityを追加しない。`GraphDecl`、`RelationVocab`、`Edge`、`ConditionState`、`GraphRules`、`GraphRef`、`Closure`、`Impact`および既存K2/K4/K5 record型は既存shapeを参照する。`SubjectRef`とtree locatorは別の位置情報であり、混同しない。

| L5 API | L4/L9 trace | L6の順序・責務候補 | 未接続境界 |
|---|---|---|---|
| `build_graph(decl, rules) -> ResultRecorded | Rejected(reason)` | K10-I1/I2; IV-K10-02 | `GraphDecl`/`GraphRules`の宣言済みrefsからK2 `ResultKey` inputsを並べ、source宣言に明記されたedge projectionのみをrecord body候補へ写す。`candidate`と`confirmed`を維持する。 | source/member mapping・reader、edge provenance owner、RelationVocab実体、K5 append/ResultRecorded発行は未接続。promotion候補はL8-K10-02-CANDIDATE-PROMOTION-ATTEMPTどおりhold。 |
| `check_graph(graph_ref, rules, input_heads) -> Observed<Combined>` | K10-I1/I3; IV-K10-01/03 | K2二段lookupのValue後だけgraph payloadを検査する。vocab membership、endpoint existence、symmetric/inverse/contradicts関係をedge単位に比較し、空集合は既存`set_reason`を渡す。 | current owner readerとrelation別`PolarityOf` mapping未定。純粋な型値比較と完全なObserved/Combinedのowner polarity解決を分離し、後者を完了としない。 |
| `closure(graph_ref, seed, condition_state, rules, input_heads) -> Observed<Closure>` | K10-I4; IV-K10-04/05 | edgeごとに単一の`DepClass` variantをその対応stateで分類し、`effective`、`held`、または既存diagnostic fieldへ投影する。`required`、trueの`operation_condition`、selectedの`selected_source`はそれぞれのvariantでeffectiveとなる。unknown状態はheld、false/not_selected/reference_onlyは診断へ保持する。`safety`は有効条件を持つedgeを落とさない性質であり、別のOR条件ではない。 | current ConditionState/GraphRules source readerとowner mapping未接続。全K1 componentのclass決定はowner polarityに依存する。cycle rejectionは追加しない。 |
| `impact(graph_ref, changed, condition_state, rules, input_heads) -> Observed<Impact>` | K10-I5; IV-K10-06/07 | `along`はfrom→to、`against`はto→from、`none`は非伝播。confirmed reachesをaffected、candidate-only reachesをpossiblyへ、unknown branchをheldへ保持する。 | current graph/condition owner readerとcomponent mappingは未接続。空affectedを肯定と同一視しない。 |
| `independent(graph_ref, op, condition_state, rules, input_heads) -> Observed<Combined>` | K10-I6; IV-K10-09–12 | graph checkの全componentと`set_reason`を`graph_check`役割のまま保持し、op/control_plane宣言欠落、effective到達、held枝を既存K1 `combine`へ同じscenario内で渡す。 | `control_plane`のownerはINFRASTRUCTURE。具体ref/sourceとrelation polarity未定。宣言graph上のprojectionに限り、実環境の復旧/起動状態は表さない。 |
| `review_set(impact, obligation_set_keys, decls, input_heads) -> Observed<{records, obligations}>` | K10-I7; IV-K10-08 | K2/K5 restored recordsとK4 obligationsをcurrent `OperationDecl.inputs`およびaffected identitiesで集合照合しexact review setを作る。保存済みrecord class/valueを変えない。 | K2 store/query、K5 restore/head、K4 obligation/OperationDecl owner reader未接続。Stale/conflict/not_run/supersededはK2 lookupの戻りを保持し、helper側で作らない。 |

各read APIはまず現行owner `GraphDecl`、source refs、`RelationVocab`、該当`GraphRules`を解決し、K2 `key_of`/`lookup`とL5で指定されたK5 restore順を通る。build recordがValueの時だけそのrecordから`GraphRef`を作り、次のqueryへ進む。前段non-Valueは同じclass/reasonと全fieldを保って返し、GraphRefを作らず、結果/edgeから入力を逆算しない。`GraphRef`はbuild recordの`key_digest`/`result_digest`由来というL4/L5境界を守る。operation/version/subject/inputs/scopeと、L4 §14.2で列挙する直接・間接使用rulesをkeyから落とさない。

### 18.2 private helper境界

L5 §13.2の8 helperはprivate decomposition候補のまま保つ。

| helper | 具体的な純粋処理候補 | 限界 |
|---|---|---|
| `_resolve_current_graph_inputs` | 既にownerが解決したrefs/headsをK2 query inputsと照合する。 | reader/ownerを作らず、caller mappingをcurrent owner値として偽装しない。 |
| `_build_record_and_graph_ref` | build record ValueからのみGraphRefを射影する。 | append、restore、lookupを実行したとはしない。non-Valueはそのまま上位へ返す。 |
| `_check_declared_edges` | explicit typed edge集合に対してrelation/member・endpoint・対向edge存在を比較する。 | PolarityOfからK1 classへ写すmappingは未定。cycleは判定しない。 |
| `_classify_condition` | DepClassと既に解決済みConditionStateの組からeffective/held/diagnostic候補fieldを投影する。 | source readerやcondition ownerを代替しない。 |
| `_walk_closure` | transitive=trueで次edgeへ展開し、falseではそのedge先を評価して止める。visitedは同一walkの重複展開防止のみ。 | visitedをcycle gate/rejectionにしない。 |
| `_walk_impact` | 既存typed propagation方向に沿ってaffected/possibly/held候補を分類する。 | current graph取得、K1 component polarityは別境界。 |
| `_enumerate_review_set` | 渡された既存record/obligation/decl valuesをidentity単位で比較する。 | K2/K4/K5の保存状態や復元完全性を作らない。 |
| `_combine_independence` | 全graph_check componentsとindependence componentsを識別付きで既存K1 combineに渡す。 | component key、reason、owner mappingを追加しない。 |

### 18.3 L4 invariant・L9 oracle trace

| L4 invariant | L5 API / helper | L9 oracle | L7 trace |
|---|---|---|---|
| K10-I1 vocabulary/endpoints | build_graph; check_graph / `_check_declared_edges` | IV-K10-01 | CK-K10-UT-001–004 |
| K10-I2 candidate/confirmed | build_graph; closure / `_walk_closure` | IV-K10-02 | CK-K10-UT-005–009 |
| K10-I3 symmetric/inverse/contradicts、cycle非拒否 | check_graph / `_check_declared_edges` | IV-K10-03 | CK-K10-UT-010–014 |
| K10-I4 closure条件 | closure / `_classify_condition`, `_walk_closure` | IV-K10-04/05 | CK-K10-UT-015–021 |
| K10-I5 propagation | impact / `_walk_impact` | IV-K10-06/07 | CK-K10-UT-022–030 |
| K10-I7 exact review set | review_set / `_enumerate_review_set` | IV-K10-08 | CK-K10-UT-031–039 |
| K10-I6 graph health/independence | independent / `_combine_independence` | IV-K10-09–12 | CK-K10-UT-040–050 |
| L4 §14.2 two-stage key/rules | all read APIs / `_resolve_current_graph_inputs`, `_build_record_and_graph_ref` | IV-K10-13/14 | CK-K10-UT-051–069 |

K10はL4 14 oracleに対応するL7 69 unique fixture IDを持つ。L7行はすべて入力差分・assert対象を一件ずつ記し、IV-K10-11だけはそのL8 scenarioが明示する複合component全体を一度に検査する。件数は設計locator数であり、実method数や実行数ではない。

### 18.4 旧source、保持点、差分理由

L5 §13.4の旧asset evidenceを起点に再確認した。旧sourceは静的読取のみで実行していない。各全文SHA-256は台帳登録値とarchiveのbytesが一致し、ledger状態はHistorical/unresolved、implementation unknown、consumer_refs空。

| Asset / source span / 全文SHA-256 / 台帳行 | 保持するfailure・意図 | 再導出・変更理由 |
|---|---|---|
| `LEGACY-ASSET-D94F2C0530850989B5F4`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/ci-responsibility-registry.md:26–36`, `1ec55190d3c6eb018fa4288f8fd91b47a94955afddc5c01d419ea4f9d5a1c144`, row 615 | explicit typed edgesと有向closure、名称/path/LLM推測の排除 | 現RelationVocab/source-declared Edgeへ再導出。旧cycle一律拒否は現L4 §14.7に沿い採用しない。 |
| `LEGACY-ASSET-EBEF9C2559936172AD8F`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-registry.md:39–50,79`, `e57a1a119c4013a2282e31be8a6ebd1b898a158f3a581bd470f83f1850e4e4ed`, row 549 | node/edge/version/authority/stale連係、semantic identity/path分離 | 現在のK2/K4/K5参照へ写し、旧state enum・transaction/write authorityは移さない。 |
| `LEGACY-ASSET-04F72C685179FF8BD977`, `archive/legacy-generation-2026-09-14/root/src/runtime/issue-hierarchy.ts:800–812`, `c1238598e6b9dd9832b08e2e679328489c7e44f7a79bf3a54e42c742f47adace`, row 3187 | `depends_on`の逆`blocks`欠落failure | 現vocabのsymmetric/inverse規則へ再導出。旧runtimeは除外classなので静的参照のみ。 |
| `LEGACY-ASSET-6929C09B95A444D95B49`, `archive/legacy-generation-2026-09-14/root/docs/improvement-backlog.md:17` (IMP-148), `e6d327ff488860dcaa8d7a150ac893e5cf0940eb710396cdf7ae746f5689a9e2`, row 1023 | vocabulary driftによるdesign/DB/collector/impact不整合 | 固定RelationVocabをK2 inputsに含める根拠。旧DB/collector/runtimeは移植しない。 |

旧assetのconsumer_refsは台帳で空である。上記consumer/failure対応はsource/IMP本文に記された失敗と現L4/L5責務からの再導出であり、旧実行による確認ではない。

### 18.5 未接続境界と実行状態

機構別RelationVocab、GraphDecl/source/member reader、edge provenance owner、ConditionState/GraphRules current resolver、PolarityOfからK1 resultへのmapping、INFRASTRUCTUREが所有するcontrol_planeの具体ref、K2/K4/K5 current store/headはこのpairで特定・生成しない。これらが必要なAPI全体、L8-K10-02-CANDIDATE-PROMOTION-ATTEMPTおよびsource-dependent class mappingは未接続/holdである。純粋比較候補を設計できる範囲はそのまま残し、holdを全体停止や新しいclassificationへ広げない。

K10の公開API、owner read/write、L8 fixture execution、L9 verification、CI登録、製品graph判定は実施または証明していない。cycle refusalや新gate/API/reason/typeは設けない。

### 18.6 private pure helperの局所実装記録

`helix/helix-harness/units/common-kernel/src/_k10_graph.py` はL4 §14.2の既存`RelationType`、`RelationVocab`、`Edge`、`GraphDecl`、`ConditionState`、`GraphRules`、`Closure`、`Impact`をfield単位で写したprivate projection候補である。`GraphDecl`のidentityはpayloadへ加えず、既存のFixedRef/SubjectRef metadata側に残す。`Impact`へ`held` fieldを追加せず、held identityは後段合成前のprivate中間値としてだけ保持する。`DepClass`は既存の単一variantを一件ずつ評価し、複数variantを束ねるOR規則を設けない。

実装したのは宣言済みrelationの一意参照・edge relation/既解決endpointとの比較、対称・逆関係・contradictsのedge比較、単一`DepClass`と明示済みcondition値の分類、確定edgeのclosure投影、propagation方向とcandidate/confirmedのimpact field投影である。到達に必要なrelation宣言が無い場合、relation名が曖昧な場合、必要condition entryが無い場合はhelperが`None`を返し、既存K1 class/reasonへ変換しない。同じtarget identityへ異なるdiagnostic stateが併存する場合も、どれかを選ばずclosure helperは`None`を返す。retired edgeはclosure対象から除外する。`safety`はそのedge自身の既存条件がeffectiveである場合にその到達先を保持し、別条件やOR判定を作らない。

このmoduleには公開K10 API、`Observed`/`Combined`のcomponent polarity mapping、source/owner reader、K2二段lookup、K5 restore/append、K4 obligation、current `GraphRules`解決を実装していない。比較用入力はすでに解決済みのtyped valueとして渡す。従ってlocal positiveはsourceの真正性やownerの現在値を示さない。

`python3 -m unittest discover -s helix/helix-harness/units/common-kernel/tests -p 'test_k10_graph.py' -v`で18件成功した。これらは18件のlocal unittest methodであり、L7 §15の69 locatorやL8 §12の69 fixtureを一括実行した証拠ではない。L7 §15.2に対応する局所assertionと未接続境界を記録する。実装source SHA-256は`fe48cb7f1ada152d96420c7264300f8533a68682e330e9c8578bc84d32250bfc`、test source SHA-256は`f58048ca009c390dcc33efa3e7202165fa48100dba52906114f85a1e5102414c`である。
