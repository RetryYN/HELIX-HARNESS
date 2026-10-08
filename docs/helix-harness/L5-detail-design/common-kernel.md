# HELIX-HARNESS 共通カーネル L5詳細設計（K1/K2）

status: draft
owner: HELIX-HARNESS
parent_requirement: なし（要素別にL4 §2.1／§3.1の直接crosswalkへtrace。HARNESS-L2-031を親にしない）
paired_l8: ../L8-detail-verification/common-kernel-detail-verification.md
base: main `fe3332d6b8a2b2ff9bf0387b07c544b5bb45b464`

本書は共通カーネルL4のK1「結果の多値型」とK2「identity・revision・digestによる鍵」だけをL5へ詳述する。L4の型、判定、鍵、失敗分類、alias意味を変えない。K3〜K10は本書では`not_designed`であり、対応する現行L4/L9への参照だけを残す。実装、L6 algorithm、実行、物理writer enforcementは定義しない。対のL8もfixtureを設計するだけで未実行である。

## 1. 入力文書とtrace規則

| 入力 | 固定対象 | SHA-256 |
|---|---|---|
| Common Kernel L4 | `docs/helix-harness/L4-basic-design/common-kernel.md`（§2、§3、とりわけ§2.1/2.5/2.6、§3.1–3.4.1） | `4a2c4afcc2519df5d7bd58caf1a74a80b94b26fc85ef328ee7bb89f6f2e78187` |
| Pair L9 | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`（§2 K1/K2、IV-K1-01–13、IV-K2-01–21d） | `e01fd7ff0b4a0a141d4958b6bc38ca00a2753866d1e6ea98103f503bd409aaf3` |
| Stage 1 PO decision | `docs/governance/decisions/helix-harness-stage1-l3-l10-po-decision-2026-10-05.md`（§「対象revisionと本文SHA」「適用範囲」） | `efda65558a62b0d1caddd98d424704e60c5f827f6e9bf3eaadd861fd0259741e` |

L3 direct parentはL4各§のcrosswalk列記に限る。K1の直接由来は§2.1にあるHARNESS AC-HARNESS-L3-022-02、030-02、032-02/03、CONNECT CONNECT-AC-002-01/006-02、LABO LABO-001-AC-02、INFRA INFRA-001-AC-01、SECURITY SECURITY-AC-001-01、BRAIN BRAIN-008-AC-02。K2の直接由来は§3.1にあるHARNESS AC-HARNESS-L3-010-01/03、022-05、030-04、031-05、032-04、CONNECT CONNECT-AC-002-01、LABO LABO-001-AC-02、BRAIN BRAIN-008-AC-02、OS AC-OS-014-02、INTELLIGENCE AC-INT-010-06。K1-I6のkey必須条件からK2 §3.1のHARNESS 030-04/032-04へ、またK2記録/保存からK5 §9.3へつなぐ箇所は契約境界の相互参照であり、K1/K2それぞれの直接crosswalk親へ加えない。別のL3要求を追加せず、上記L4 crosswalk外へ親を拡張しない。HARNESS Stage 1の判断記録は対象本文revision `a77672513325aa9e79f3780af40455361b5d19a8`とL2-010/011/023に限るため、同判断を他機構または他親の承認根拠として流用しない。

L4はK1/K2を8機構共通部品として配置するが、単一の親要求を置かない（L4 §1.3）。本書も`parent_requirement: なし`の境界を保ち、各API節・L8ケースのtrace列に直接のL4 contract IDとL3 ACを記す。

## 2. 旧HELIX sourceと再導出

以下は旧sourceを起点に現行L4へ再導出した箇所である。archive assetは歴史資料であり、旧本文・旧runtime・旧testのコピーや実行を意味しない。asset ID、source行、source bytesのSHAを固定する。

| 旧source（asset ID／archive path:行／SHA-256） | 保持する点 | 変更・区分 |
|---|---|---|
| `LEGACY-ASSET-5E2592D7BB50EC290C9B`／`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md:22-30,48-70`／`d446588a1fe6999e458a41f2c4683d34459ff7b12b28a057642cc2f6e15e6898` | typed observation、unknownを肯定にしない、複数軸とfindingを保持 | 測定専用の状態・閾値から全機構のK1へ広げ、`Unobserved`/`NotApplicable`等を現行L4どおり定義する。**意味を再導出** |
| `LEGACY-ASSET-98372FEE8A3AC8F9C299`／`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md:97-99`／`3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830` | N/Aは理由・authority・再入条件を要し、未知や欠落からN/Aを作らない | 現行K1-I5のdisposition条件へ**意味を再導出** |
| `LEGACY-ASSET-BC214D81DE9E77B8A804`／`archive/legacy-generation-2026-09-14/root/docs/archive/cross-system-audit-2026-09-05/source/audit-report.md.txt:72-80`（F02）／`dcf0d4e0dcc4db772afac465df10f2412134cd65dcd019a18cb99c9fd39be53f` | 空の必須集合で個別検査が消えた失敗例 | 現行K1-I4の空集合`Unknown(missing_input)`を説明する失敗根拠。旧source規則のコピーではない |
| `LEGACY-ASSET-67B016392E3F7D58B053`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/module-decomposition.md:22-45,74-93`／`da787dcfd95b0b4011dc1979df1b6652e990f75ffb71750c6ff9c24a2a24739a` | owner境界、公開IF、依存を契約へ向ける構成 | 現行K2のpure key/lookup/record境界へ**意味を再導出**。旧module/pathは採らない |
| `LEGACY-ASSET-7873E44594456A8F925A`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/internal-processing.md:23-105`／`048755e3729a7deaaedc8259f3334859d408f0d99487e7459f9d1ed93b4e8072` | 入出力、pre/postcondition、失敗型をoperation単位に記述 | 現行K1/K2 signaturesとresult classへ**意味を再導出**。旧CLI code/exit codeを置換 |
| `LEGACY-ASSET-310E87378AFE8095809C`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/physical-data.md:22-42,101-114`／`a3064a3b705adcf0a5f76c3210aa431d87b7971aed2fe88f948a323a40c7772f` | source recordと派生projectionを区別 | K2の記録・lookupはL4のK5保存記録を入力するpure APIとして記す。旧SQLite/event schemaは**置換**し、本書で物理保存を選ばない |
| `LEGACY-ASSET-73B5C6C7D281E28EC541`／`archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-integration-test-design.md:48-75,120-145,182-193`／`c8b287ee4e103255081f00439b7fb2f3dfd259e0fb35a2760b48ad583524fe15` | L5 operationとL8 fixtureのtrace、normal/negative分離 | 現行L9 IDをfixtureへ結ぶ方法だけ**再導出**。旧test runner、旧pass状態、G8を移さない |
| `LEGACY-ASSET-829E9C1646D4883C8B99`／`archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-source-boundary-contracts.md:11-33`／`d0f7281b170a59d4ed26e618bee6b3c3c749c4f2ad1f1e2f8673ce0445f977f9` | 一件の変異と一つの期待結果を関連付ける観点 | L9で定義済みの期待値を単独fixtureへ分割する形を**再導出**。旧source boundaryのpolicyは移さない |

旧K2 analogは限定的である。`archive/legacy-generation-2026-09-14/root/src/shared/canonical-digest.ts`（`c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000`）と旧`tests/digest.test.ts`（`fef9cfe82f280fb79ff35b4516ee0e847965b57d479014bca32ff7ac8043a390:10-40,68-99,128-166`）はcanonical bytesとgolden consumer compatibilityの隣接根拠だが、現行K2のstale/conflict分類、ResultKey、role aliasとは同型ではない。bytes安定性を確認する発想のみ再導出し、Node `Buffer`/crypto、既存consumer digestは置換対象とする。旧`tests/measurement-evidence-evaluator.test.ts`（`cfe1051a4a8b1a0634744837d704ab558f8a8295ffedf0df9d54f94923ce1f92:157-185,258-279,323-355,404-448,507-517`）はunknown伝搬と全finding保持のsource consumer例として読むが、実行・合格証拠にはしない。

## 3. 共有値型

### 3.1 K1: `Observed<T>`

公開型と型フィールドはL4 §2.2をそのまま用いる。

```text
Observed<T> =
  | Value(value: T, key: ResultKey, evidence: EvidenceRef)
  | Unknown(reason: UnknownReason, key: ResultKey, evidence: EvidenceRef?)
  | Unobserved(key: ResultKey, why: UnobservedWhy, superseded: KeyDigest?)
  | Stale(prior: Value<T>, recorded_key: ResultKey, current_key: ResultKey)
  | NotApplicable(reason: Text, authority: AuthorityRef,
                  reentry_trigger: Text, key: ResultKey)
```

`UnknownReason`, `UnobservedWhy`, `Digest`, `SubjectRef`, `ResultKey`, `KeyDigest`はL4 §2.2/§3.2の閉じた型を参照し、ここで別名・値を増やさない。構築時の欠損拒否はL4 K1-I6の`Rejected(missing_key)`に従う。

### 3.2 K1 API contract

公開APIの表の返却型は通常の返却型を示す。鍵を受ける境界では、既存L4 K1-I6／K2-I6の欠落拒否を外側union `ApiBoundaryResult<T> = T | Rejected(missing_key)` として返す。`combine`、`admit`、`disposition`、`key_of`、`lookup`に適用し、`record`は既存の返却unionに同じ拒否を含む。例外や新しいresult class・reasonは追加しない。

`PolarityOf<T>`は値型ownerが持つ版付き写像で、kernelがdomain値を解釈しない。heterogeneous成分はL4 §2.5の成分別写像表現を使う。owner/callerのmapping解決境界で必要な写像が得られない場合、元の`Value`を`combine`へ渡さず、既存の完全なkeyを持つ`Unknown(missing_input)`を構成して他の成分とともに既存`combine`へ渡す。これはK1 mapping contractに必要な入力準備であり、新しいK1 APIやObserved classではない。

| API | 入力・出力 | 契約と失敗 |
|---|---|---|
| `combine(components, polarity) -> Combined<T>` | 均質値型の順序付き`Observed`列と単一`PolarityOf`。異種値型は各`(Observed, PolarityOf)`の列。各成分に対応するmappingを解決済みで渡す | 入力鍵をすべて検査。成分全体を入力順で保持し、全negative/non-value/excluded indexを返す。negativeがあれば`Negative`、それ以外のnon-valueがあれば`Undetermined`、全有効成分がpositiveなら`Positive`。判定成分ゼロは`Undetermined`と`set_reason=Unknown(missing_input)`。mapping未解決のdomain ValueをこのAPIへ渡す経路は置かない。 |
| `admit(combined) -> Admitted \| Withheld(reasons)` | `combine`結果型（境界では鍵を再検査） | positiveのみ`Admitted`。その他は、全negative・non-value・whole-set理由をL4順序で保持する空でない`Withheld`。`Observed`単体のshortcutを設けない。 |
| `disposition(reason, authority, reentry_trigger, key) -> Observed<T>` | N/A候補の明示根拠と完全鍵 | 三根拠すべてがある場合だけ`NotApplicable`。どれか欠ければ`Unknown(invalid_disposition)`。 |

**入力不変条件**: K1-I6で列挙されたK2 key fieldがすべて存在すること。これらのkey field欠落だけを`Rejected(missing_key)`とする。各Observed variant内部のdomain値/evidence等のshape妥当性は型で与えられる入力として扱い、K1-I6以上の欠落field/reason分類はここで定義しない。`Stale`はlookupで導出する読み取り結果であり、`record`可能な観測ではない。

**出力不変条件**: unknown・unobserved・staleをpositive valueへ変換しない。否定Valueとunknownを区別し、最初のnegativeで後続成分を落とさない。`NotApplicable`はpositiveではなく、その根拠付き成分だけ判定から除外できる。0件Valueを返す上位operationは完全走査証拠が入力にある場合に限る。

### 3.3 K2: reference and key records

```text
Digest       = "sha256:" + 64 lowercase hex
GitRevision  = 40 lowercase hex
SubjectRef   = { kind, identity, revision, digest }
ResultKey    = { operation, operation_version, subject: SubjectRef,
                 inputs: SubjectRef[] (identityで整列), scope }
KeyDigest    = Digest(canonical_json(ResultKey))
ResultRecord = { key, key_digest, result: Observed<T>, result_digest, producer }
```

`Digest`と`GitRevision`、短縮表示値を相互比較しない。`identity`は版を越えて安定、`revision`は版識別、`digest`はbytes SHA-256。文書refのrevision/digestはL4 §3.2どおり対象commit+pathと対象本文bytesに結び付く。構造化データのdigestはL4 canonical JSON bytesに結び付く。`inputs`はoperation ownerが宣言する結果依存refの全集合で、identity順に一意化する。

### 3.4 K2 API contract

| API | 入力・出力 | 契約と失敗 |
|---|---|---|
| `key_of(operation, operation_version, subject, inputs, scope) -> ResultKey` | ownerがcurrent宣言から再構成したref集合 | inputsをidentity順に並べる。同一identityの重複は拒否し、入力順に依存するkeyを作らない。必須key field欠落は`Rejected(missing_key)`。 |
| `lookup(records, query_key) -> Observed<T>` | K5 readerが復元した記録全体とcurrent key | L4 K2-I2順で判定。候補なし/identity-set変更は`Unobserved(not_run)`、同一identityのsame-revision digest差またはkind差は`Unknown(conflict)`、完全一致は保存class、旧Valueのみなら`Stale`、旧non-Valueのみならsuperseded付き`Unobserved(not_run)`。完全一致と競合候補が共存すれば競合を優先。lookupは入力記録を書き換えない。 |
| `record(records, key, result, producer) -> Recorded \| NoOp \| Conflict \| Rejected(missing_key \| stale_not_recordable)` | 完全keyと記録可能な観測 | 同じkey+result digestは`NoOp`。同keyの異なるresult digestは双方を保持して`Conflict`。stale resultは拒否。前recordを上書きしない。 |

`lookup`の候補優先順はL4 §3.3を適用する。すなわちoperation/version/scopeとsubject identity、inputs identity集合で候補を選び、候補全体を同revision異digest／kind違いについて先に検査し、次に完全一致を選択し、最後に旧revision規則を適用する。候補0件はL4どおり`Unobserved(not_run)`である。K5側で必要な記録集合を完全に復元できない読取不全を、空集合の正常結果とみなさない。

### 3.5 role-bound input alias binding

L4 §3.4.1の規則をK2 inputs構成・K6 read joinの境界として具体化する。ここではK3/K8/K9各ownerのrole vocabulary、resolver実装、reader実装は定義しない。

```text
RoleBoundInputAlias(context, role, raw_ref) -> SubjectRef
RoleBoundInputBindingRef -> SubjectRef
```

- alias identityはownerが宣言したrole/context/raw identityから作る。alias digestはraw source content digestをそのまま使う。raw refの`kind/identity/revision/digest`とaliasの対応を、current owner resolverが作るcanonical binding bytesへ全て含める。
- ownerがbinding revisionを持てばその版を使う。持たない場合はalias identity順の`{alias_identity, raw_revision}` mappingだけからrevisionを決定し、digestはrevision計算へ入れない。binding digestは全canonical binding bytesのdigest。
- `ResultKey.inputs`へ独立binding refと各source-content aliasを含める。readerはbinding canonical bytesを読み、各alias identityでraw source bytesを実読してraw digestを照合する。binding読取はsource実読の代替にならない。K6 read identityはL4 §10.3に定めるsubject＋non-verifier inputs集合へ厳密一致し、raw identityの別readを加えない。
- 同じalias identityでは完全一致raw refだけdeduplicateする。alias内の異なるraw refは`Rejected(missing_key)`。role/contextが異なるalias間ではraw identityが同じでも重複拒否へ流用しない。複数side/roleのsource readはalias identity単位で記録する。
- K3/K8/K9の既存owner binding revision方針とrole/context fieldは個別owner側に残す。K2はdigest意味を共通化するだけで、selection authorityや比較結果を決めない。

## 4. 失敗とowner境界

| 境界 | owner / consumer | 非肯定または拒否の返し方 |
|---|---|---|
| K1値の構築 | 各機構が自身の値型・値から`Observed`と`PolarityOf`を作る | K1-I6が列挙するkey field欠落は`Rejected(missing_key)`。variant fieldのshape validation/reason mappingは本書で定義しない。分類不能は`Unknown`、未実行は対応する`Unobserved`。kernelが機構statusを書き戻さない。 |
| K1合成・admit | kernel pure API／機構のoperation consumer | 否定は`Negative`、不明を含む肯定不能は`Undetermined`と全reasonで保持。N/A無効は`Unknown(invalid_disposition)`。 |
| K2 key宣言 | operation ownerがcurrent subject/input/scope全集合を供給 | 欠落key fieldやalias衝突は`Rejected(missing_key)`。ownerはlookup記録からcurrent refsを逆算しない。 |
| K2 read/lookup | K5 readerが全record bytesを復元しK2 pure lookupへ渡す | unavailability/corruptionはK5/K1の既存unknown classに保持。K2はpartial record listをcomplete扱いしない。 |
| K2 record | operation ownerが結果を提供、K5が記録を所有 | duplicate exact resultはNoOp、同key異bodyはConflict、staleは`stale_not_recordable`。 |
| role alias resolution | role/contextを宣言したownerがcurrent mapping bytesを供給、K6がsource readを確認 | caller mappingでowner resolverを上書きしない。binding/raw bytes不一致はsource observationとして肯定しない。 |

## 5. 言語候補（AI設計判断）

L5のpure K1/K2 APIの実装候補はPython標準ライブラリとする。HARNESS-L2-008は意味導出coreにPythonを明記し、L2-005はlanguage/toolを固定しない。K1/K2は値の構築・canonical key比較・決定的なclass返却が中心で、Pythonの型注釈、`dataclasses`/`enum`、`hashlib`、`json`を外部packageなしで表現できる。これはL4が定めるcanonical bytesとdigestの意味を変更せず実装できる候補という設計判断である。Python標準`json`の既定出力をそのままcross-runtime canonical formatとみなす判断は含まない。

TypeScript/Nodeは旧HELIX実装例があるが、歴史上の選択にすぎず、現行repository-layout RL-K2は旧Node/TypeScript/Vitest/Biome/package構成を引き継がず、Bunを禁止している。Rust等は型表現能力があるものの、今回の対象L3から言語根拠は得られず、Python候補より必要な選択根拠を持たない。K2 canonical byte互換の正規化仕様、package構成、K5 I/OやK6 runnerは別のL6範囲で設計する。本候補は追加要求・承認・gateではなく、Stage 1の実装可能範囲を広げない。

## 6. 今回の対象外

K3〜K10はすべて`not_designed`。既存契約とoracleはCommon Kernel L4 §4–11および追加所有者節§14（K10）、§15（K7）、§16（K3）、§17（K9）、§18（K8）と、Pair L9の対応IV項目（K3 IV-K3-01–17/14a–j、K4 IV-K4-01–10、K5 IV-K5-01–26、K6 IV-K6-01–15、K7 IV-K7-01–15、K8 IV-K8-01–26、K9 IV-K9-01–15、K10 IV-K10-01–14）を参照し、ここで型/APIやL6詳細を再記述しない。K1/K2のconsumer例も実装algorithm、永続化、時刻source、physical writer、approval/gateを定義しない。L3 semanticsの変更が必要な点はこの草稿で解決せず、その要求上流へ戻す。
