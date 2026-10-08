# HELIX 共通カーネル L4基本設計（K1・K2）

status: draft_for_l4_review
owner: HELIX-HARNESS（工程の標準と検証義務の所有。2026-10-08のPO判断の判断2）
parent_requirement: なし（一つの親要求を定めず、要素ごとに承認済みL3のACへtraceする。2026-10-08のPO判断の判断2。1.3を参照）
paired_l9: ../L9-integration-verification/common-kernel-integration-verification.md
base: main `3d2f78ce4ed11fa07d987fffa3632b20b0f7c51d`（引用した本文のSHA-256は`f88c96ce`で固定した。付録A。`f88c96ce`から`3d2f78ce`までに引用した本文は変わっていない）

本書は、8機構が共通に使う結果の型と版の鍵（共通カーネル）のL4基本設計の下書きである。最初のPRはK1（結果の多値型）とK2（identity・revision・digestによる鍵）に限る。K3〜K10は末尾の「後続PRの計画」に置く。

本書は要求の意味、範囲、担当、版を作らない。各要素は承認済みL3のACを由来とし、由来の無い要素は「L2へ戻す論点」に分ける。本書は実装、実行、内部デプロイ、releaseの許可を含まない。本書の承認・merge・試作の合格から、L3以上の承認や完了を生成しない。

## 1. 配置

### 1.1 層とpair

現行の層とpairは、Concept（`docs/concept/helix-concept.md:239`）とHARNESS-L2-001（`docs/helix-harness/L2-requirements/product-requirements.md:99`）が定める`L4↔L9`である。旧HELIXも`L4 基本設計 ↔ L9 結合テスト`を対にしていた（`LEGACY-ASSET-80FD1264A2C50E2E4AA4`、`archive/legacy-generation-2026-09-14/root/docs/process/README.md:44-55`、SHA-256 `21a875ca5b46a8396485690a8405923ea197552fe4aa2302b1eaad6f7e650985`）。L9は「interface、依存の向き、stateとdataの所有、transaction、失敗の伝わり方、retry、timeout、冪等性、結合度、責務の重複」を見る（HARNESS-L2-003／004、同L2:110）。本書と対になる検証設計はL9に置く。

### 1.2 置き場所（提案）

| 層 | 置き場所 | 名前の根拠 |
|---|---|---|
| L4基本設計 | `docs/helix-harness/L4-basic-design/` | 旧`docs/design/<target>/L4-basic-design/`の層名を保持し、現行の対象別folder（`docs/<mechanism>/L3-requirements/`等）の下へ置き直す |
| L9結合検証 | `docs/helix-harness/L9-integration-verification/` | 旧`docs/test-design/harness/L9-integration-test-design.md`の「結合」を保持し、現行L10の`L10-verification/`に合わせて「verification」とする |

L3／L10の配置規則（`docs/governance/l3-l10-authoring-layout.md:7-34`）を同じ考え方でL4／L9へ延ばした。文書（`docs/`）の構成を変える判断ではなく、既存の判断（`docs/governance/decisions/po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md:68`「`docs/`の構成は既存の判断のまま変えない」）に反しない範囲で、新しい層のfolderを足すだけである。旧`docs/design/`と`docs/test-design/`への分離は採らない。現行は機構ごとのfolderに要求から検証までを置くためである。

共通カーネルを`docs/helix-harness/`に置くのは、HARNESSが「工程の標準と検証義務」を持つ（Concept原則10、`docs/concept/helix-concept.md:311`）ためである。8機構が使う型であっても、所有を一つにする（Concept原則4）。

### 1.3 未決（配置）

- **親要求**：一つの親要求の下に置かず、要素ごとに承認済みL3のACへ由来を辿る（2026-10-08のPO判断、`docs/governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md` 判断2）。HARNESS-L2-031の意味は「ログ・入力からの最小再現と回帰候補生成」（`docs/helix-harness/L2-requirements/product-requirements.md:627-645`）であり、「031＝共通部品」は031の所属の確定である（`docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:19,66`）。そのため031を親としない。
- **L4の配置規則の置き場**：L3／L10は`l3-l10-authoring-layout.md`が配置を定める。L4／L9の配置規則を同書へ追記するか、別に置くかは未決とする。本書の提案は、その規則が決まるまでの仮の配置である。
- **作業入口**：L4〜L6の設計と対の検証設計は、2026-10-08のPO判断（同判断記録の判断1）で、承認済みL3／L10を親とする範囲に限り、作業入口の「現在停止する作業」から外れた。

## 2. K1 結果の多値型 `Observed<T>`

### 2.1 由来

| 由来 | 位置 | 要点 |
|---|---|---|
| Concept | `docs/concept/helix-concept.md:316` | 不明を「問題なし」に読み替えない |
| HARNESS | `AC-HARNESS-L3-022-02`（`docs/helix-harness/L3-requirements/functional-requirements.md:231`） | 判定不能な品質は未評価のまま保持し、上位stateを作らない |
| HARNESS | `AC-HARNESS-L3-030-02`（同:254）、`AC-HARNESS-L3-032-02`／`032-03`（同:285-286） | missing・unknown・stale・不一致をfieldごとに扱い、未選択は未観測に保つ。unknown／not connectedを推測で接続済みにしない |
| CONNECT | `CONNECT-AC-002-01`（`docs/helix-connect/L3-requirements/functional-requirements.md:61`）、`CONNECT-AC-006-02`（同:159） | 互換をcompatible／incompatible／unknown／staleに区別し、unknownをcompatibleへ推定しない |
| LABO | `LABO-001-AC-02`（`docs/helix-labo/L3-requirements/functional-requirements.md:45`） | unknown・not_observedをsuccess化しない。非successのeventを除去しない |
| INFRASTRUCTURE | `INFRA-001-AC-01`（`docs/helix-infrastructure/L3-requirements/functional-requirements.md:51`） | 値または明示的unknownを持ち、既定値で補完しない。読取不能なら以前のobservationをcurrentとみなさない |
| SECURITY | `SECURITY-AC-001-01`（`docs/helix-security/L3-requirements/functional-requirements.md:68`） | 分類不能はunknown／untrustedと判定する |
| BRAIN | `BRAIN-008-AC-02`（`docs/helix-brain/L3-requirements/functional-requirements.md:85`） | unknown stateをcurrentへ暗黙に解決しない |

引用した本文は、base `f88c96ce`の各ファイル（SHA-256は付録A）である。各ACの承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による。

各機構のACは、それぞれの状態語で同じ規則を述べている。K1はこれを一つの型にまとめる設計であり、各機構の状態語と意味を置き換えない（2.4の写像表）。

### 2.2 型

```text
Observed<T> =
  | Value(value: T, key: ResultKey, evidence: EvidenceRef)
  | Unknown(reason: UnknownReason, key: ResultKey, evidence: EvidenceRef?)
  | Unobserved(key: ResultKey, why: UnobservedWhy)
  | Stale(prior: Value<T>, recorded_key: ResultKey, current_key: ResultKey)
  | NotApplicable(reason: Text, authority: AuthorityRef, reentry_trigger: Text, key: ResultKey)
```

| クラス | 意味 | 例 |
|---|---|---|
| `Value` | 対象の鍵（K2）について観測し、値が定まった | pass、fail、incompatible、0件（完全走査の結果） |
| `Unknown` | 観測を試み、または入力を受けたが、値を定められない | 比較不能、分類不能、parse不能、評価器の異常、入力の矛盾 |
| `Unobserved` | 観測していない。証拠が無い | 未選択の操作、未実行、receiptの未着 |
| `Stale` | 値はあるが、記録した鍵が現在の鍵と一致しない | 対象・oracle・契約のいずれかのrevisionが変わった |
| `NotApplicable` | 適用しないことを、理由・authority・再入条件とともに決めた | 非UI対象へのUI条件 |

`UnknownReason`は閉じた語彙とする：`ambiguous`、`unsupported`、`conflict`、`evaluation_error`、`indeterminate`、`unreadable`、`incomparable`、`unregistered`、`missing_input`、`invalid_disposition`。語彙の追加は本書の改訂で行う。`UnobservedWhy`は`not_selected`、`not_run`、`pending_receipt`の三つとする。

`fail`、`mismatch`、`incompatible`のように、観測して否定が定まったものは`Value`である。否定の確定と不明を混ぜない。

### 2.3 不変条件

- **K1-I1 縮退の禁止**：`Unknown`、`Unobserved`、`Stale`を、`Value`（特に肯定の値）へ変換する関数を置かない。`NotApplicable`は肯定の値ではない。
- **K1-I2 fail-closed**：肯定の判定（gate、昇格、適格、compatible等）は、全成分が肯定の`Value`の場合だけ成立する。理由の付いた`NotApplicable`の成分は、判定から除外できる。
- **K1-I3 合成**：成分の合成は、否定の`Value`が一つでもあれば否定、それ以外に非`Value`が一つでもあればその非`Value`の集合を保持する、全成分が肯定ならば肯定とする。最初の否定で後続の成分を捨てず、全成分を返す。合成結果を単一の色や点数に縮約しない。
- **K1-I4 空集合**：必須の集合が空または欠落している場合は`Unknown(missing_input)`とする。空集合の全称を真にしない。
- **K1-I5 N/Aの成立**：`NotApplicable`は`reason`、`authority`、`reentry_trigger`をすべて持つ場合だけ成立する。一つでも欠ければ`Unknown(invalid_disposition)`とする。
- **K1-I6 鍵の必須**：すべてのクラスが鍵（K2）を持つ。鍵の無い結果は受け取らない。
- **K1-I7 「無い」の確定**：「対象が無い」を`Value`（0件）とするのは、完全走査を示す証拠がある場合だけとする。部分走査や読取失敗は`Unknown(unreadable)`または`Unobserved`とする。
- **K1-I8 fail-openの限定**：表示や観測のための投影で、非`Value`を省略して表示する方策は、その投影の宣言に明示した場合だけ許す。その投影の出力を判定の入力にしない。

### 2.4 写像表（G10：不明の共通分類）

旧HELIXの局所語と、承認済みL3の状態語を、クラスに一度ずつ写像する。写像は語の置換ではなく、K1の型へ載せるときの対応である。各機構の本文と意味は変えない。

| 語 | 出どころ | クラス |
|---|---|---|
| `ambiguous` | 旧`docs/process/README.md:36-37`（`LEGACY-ASSET-80FD1264A2C50E2E4AA4`。曖昧・未知の入力を推測で昇格させずfail-close） | `Unknown(ambiguous)` |
| `unsupported` | 同上 | `Unknown(unsupported)` |
| `mismatch` | 旧measurement-evidence-evaluator（binding／baseline） | 否定の`Value` |
| `conflict` | 旧v1.3:361（同じcommand_idで異なるdigest） | `Unknown(conflict)`。K2のput規則も参照 |
| `absent` | 旧feedback-lifecycle（完全走査marker付きの不在） | 完全走査の証拠があれば`Value`（0件）、無ければ`Unknown(unreadable)` |
| `evaluation_error` | 旧design-template-json-authority | `Unknown(evaluation_error)` |
| `indeterminate` | 旧destructive-command-guard | `Unknown(indeterminate)`。blockと同じ扱いはK1-I2で満たす |
| `unknown` | CONNECT／INFRA／SECURITY／BRAIN／LABOのL3 | `Unknown`（理由は各機構の観測に従う） |
| `stale` | CONNECT-AC-002-01、HARNESS-030-04等 | `Stale` |
| `not_observed`／未観測 | LABO-001-AC-02、HARNESS-032-03 | `Unobserved` |
| 未評価 | AC-HARNESS-L3-022-02 | receiptが無ければ`Unobserved(pending_receipt)`、oracle・scope不足なら`Unknown(missing_input)` |
| `incompatible` | CONNECT-AC-002-01 | 否定の`Value` |
| `not_applicable` | 旧design-template-json-authority、HARNESS L3（非UI対象） | `NotApplicable` |

### 2.5 API境界

- `combine(components: Observed<T>[]) -> Observed<T[]>`：K1-I3に従う純関数。
- `admit(o: Observed<Bool>) -> Admitted | Withheld(reasons)`：K1-I2の判定。`Withheld`は理由（非`Value`の成分一覧）を必ず持つ。
- `disposition(reason, authority, reentry_trigger, key) -> Observed<T>`：K1-I5の検査を通った場合だけ`NotApplicable`を返す。

各機構は、自分の状態語から`Observed<T>`への写像関数を自分で持つ。カーネルは写像の向きを一方向（機構の語→カーネル）に限り、カーネルから機構の状態を書き戻さない。

### 2.6 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-5E2592D7BB50EC290C9B`／`docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md:48-70`／`d446588a1fe6999e458a41f2c4683d34459ff7b12b28a057642cc2f6e15e6898` | 軸ごとにunknownを持つ。fail／mismatchならred、残りにunknownがあればunknown。stale・推測値をgreenへ縮退しない。最初の失敗で後続を捨てない | 計測評価の局所型から全機構の型へ広げる。`Unobserved`と`NotApplicable`を独立のクラスにする | `semantic_rederive` |
| `LEGACY-ASSET-98372FEE8A3AC8F9C299`／`docs/design/helix/L5-detail/design-template-json-authority.md:97-99`／`3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830` | missing・unknown enumをN/Aへ丸めない。N/Aは`reason`・`authority`・`reentry_trigger`を持つdisposition | なし（K1-I5として再導出） | `semantic_rederive` |
| `LEGACY-ASSET-C35E93F2D36777CD7462`／`docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md:98-99`／`2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | 暗黙skip、stale skip、空理由を拒否する | gateごとの拒否条件を、型の不変条件へ移す | `semantic_rederive` |
| `LEGACY-ASSET-E7C5C528479A2FFDE118`／`docs/design/harness/L6-function-design/destructive-command-guard.md:25-26`／`aed67c9542f178fec521530fe8fef2ff952bcfaa7bc90888b068e7de67daefd8` | `indeterminate`をblockと同じ境界にする | 局所語を`Unknown(indeterminate)`へ写像する | `semantic_rederive` |
| `LEGACY-ASSET-F6E9EA3422A0EF1DF090`／`docs/design/harness/L6-function-design/feedback-lifecycle.md:94-103`／`2e0a028fc48c6acc92a5b09ada9fc511ed0389b71af9deee782ec81aa731a655` | 不在によるcloseは完全走査markerがある場合だけ。partial rebuildや読取失敗でcloseしない | `absent`を独立クラスにせず、K1-I7で`Value`（0件）の成立条件として扱う | `semantic_rederive` |
| `LEGACY-ASSET-63857110B2C14B808B15`／`docs/design/helix/L3-requirements/lifecycle-state-separation.md:150`／`a4077092ff5f268cfc58af2823573565f1144f3d88b696b9f59cf20112ff857b` | `unobserved`は証拠が一つも無い状態 | 運用観測の一entityから全機構の`Unobserved`へ広げる | `semantic_rederive` |
| `LEGACY-ASSET-BC214D81DE9E77B8A804`／`docs/archive/cross-system-audit-2026-09-05/source/audit-report.md.txt:72-80`（F02）／`dcf0d4e0dcc4db772afac465df10f2412134cd65dcd019a18cb99c9fd39be53f` | 失敗史：必須集合を空にすると個別検査が消えた | K1-I4の根拠 | 失敗史（区分なし） |
| `LEGACY-ASSET-85832C01812D05143691`／`docs/governance/rule-enforcement-gap-audit-2026-08-12.md:152-154`（ISSUE-22）／`da0331303c1766aea4e763d2d0ddee02e5cdbb0add900d0c779f0024a4886e7f` | 失敗史：fail-openのhookの失敗が握りつぶされた | 旧の意図的なfail-open（観測・表示）を既定から外し、K1-I8の明示宣言に限る | `replace`（既定値の変更） |

旧HELIXには、不明の分類の共通定義が無い（調査資料`legacy-crosswalk.md`§2の検索語と結果）。G10の共通定義（2.2のクラス集合と2.4の写像表）は**新規案**である。

### 2.7 未決と試作で確かめること

- `Unknown`と`Unobserved`の境界を、各機構のL3の語で一件ずつ確かめる（例：HARNESSの「未評価」の二分）。境界がL3の意味に触れる場合は、L2へ戻す論点にする（6章）。
- `UnknownReason`の語彙が、承認済みL3の否定fixtureをすべて表せるか。表せない語が出たら、語彙を足す前に`Value`の否定でないかを確かめる。
- 試作（`scaffold/`、Scaffold Binding登録）：HARNESSの検証結果とCONNECTの互換結果を同じ`Observed`で保存し、`combine`と`admit`がL3の否定fixtureをすべて`Withheld`にすることを確かめる。

## 3. K2 identity・revision・digestによる鍵

### 3.1 由来

| 由来 | 位置 | 要点 |
|---|---|---|
| Concept | `docs/concept/helix-concept.md:105` | 誰が・何を・どの要求と構成の版で・どの能力とモデルの版を使い・どうなったかを結ぶ |
| HARNESS | `AC-HARNESS-L3-010-01`／`010-03`（`docs/helix-harness/L3-requirements/functional-requirements.md:37,39`） | packのidentity・version・依存の版を宣言し、同じ宣言入力と版から同じ成果物を得る |
| HARNESS | `AC-HARNESS-L3-022-05`（同:234） | revision違い・scope違い・oracle失効では上位stateを作らない |
| HARNESS | `AC-HARNESS-L3-030-04`、`031-05`、`032-04`（同:256,272,287） | 契約・oracle・packを更新したら影響物を新revisionへtraceし直し、旧revisionのpass・receiptを流用しない |
| CONNECT | `CONNECT-AC-002-01`（`docs/helix-connect/L3-requirements/functional-requirements.md:61`） | 登録時と使用時のrevisionを区別し、端点・意味契約・adapter・互換範囲の変化をstaleの契機にする |
| LABO | `LABO-001-AC-02`（`docs/helix-labo/L3-requirements/functional-requirements.md:45`） | 既知の古いrevisionをcurrentとして偽装しない |
| BRAIN | `BRAIN-008-AC-02`（`docs/helix-brain/L3-requirements/functional-requirements.md:85`） | exact revision Rの参照へR2を返す置換と、同じRの内容の書換えを拒否する |
| OS | `AC-OS-014-02`（`docs/helix-os/L3-requirements/functional-requirements.md:22`） | pack・依存のidentity、契約と成果物の版を照合する |
| INTELLIGENCE | `AC-INT-010-06`（`docs/helix-intelligence/L3-requirements/functional-requirements.md:25`） | 共通pack契約のidentity・版・互換範囲が欠落・stale・不一致なら互換不成立 |
| PO判断 | `docs/governance/decisions/l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md:72-74`（判断2） | 意味revisionの判定器ができるまで、bytesが変われば意味が変わったとして扱う |

### 3.2 型

```text
Digest       = "sha256:" + 64 lowercase hex            # 内容のSHA-256
GitRevision  = 40 lowercase hex                         # git commit。Digestと混同しない
SubjectRef   = { kind, identity, revision, digest }
ResultKey    = { operation, operation_version, subject: SubjectRef,
                 inputs: SubjectRef[] (identityで整列), scope }
KeyDigest    = Digest(canonical_json(ResultKey))
ResultRecord = { key: ResultKey, key_digest: KeyDigest,
                 result: Observed<T>, result_digest: Digest, producer: ProducerRef }
```

- `kind`は対象の種別（要求、要件、設計文書、pack、契約、oracle、成果物、構成等）。閉じた語彙とし、各機構のL4で値を足す。型番（方針6）の`unit`／`connection`／`composite`は`kind`の下位区分として持つ。
- `identity`は版をまたいで変わらない識別子（例：`HARNESS-L2-031`、pack identity）。pathを`identity`にしない（方針6「フォルダのpathを型番やパックの境界の正本にしない」）。
- `revision`は対象の版の識別子。repository内の文書は`(GitRevision, path)`、登録の版は登録ID（例：`MPR-RC-…-002`）とする。
- `digest`は対象の内容bytesのSHA-256。文書は本文全体のbytes（AGENTS.md「過去の本文を指すときは対象のcommitと本文のSHA-256」）。構造化データは`canonical_json`（object keyを辞書順、配列順は保持、非有限数を拒否）のbytesとする。
- `inputs`は結果に影響する入力の全集合（oracle、契約、設定、依存、環境の版）。省いた入力は、その結果の鍵に含まれないため、変化しても検出できない。入力の全集合の宣言は各操作の所有者が持つ。
- `producer`は結果を出した検証器・Workerの識別と版である。真正性はK6（receipt）とEで扱い、本PRでは参照の枠だけを置く。

### 3.3 不変条件

- **K2-I1 完全一致**：記録した結果を使えるのは、照会の鍵と`key_digest`が完全に一致する場合だけとする。一つでも入力の`revision`または`digest`が違えば、使える値は無い。
- **K2-I2 staleの導出**：記録の`subject`と`inputs`の`identity`集合が照会と同じで、いずれかの`revision`または`digest`が違う場合、照会の結果は`Stale(prior, recorded_key, current_key)`とする。該当する記録が無い場合は`Unobserved(not_run)`とする。staleは記録を書き換えて付けるものではなく、照会のたびに鍵を比べて導く。
- **K2-I3 意味revision（G4、PO判断2）**：`same_meaning(a, b)`は版付きの関数とし、現在の実装は`a.digest == b.digest`だけとする。したがって、bytesが変われば常にstaleである。意味が同じなら下流を無効にしない仕組み（backdating）は、判定器を版とdigestで固定して置き換えるまで使わない。
- **K2-I4 冪等な記録**：同じ`key_digest`で同じ`result_digest`の記録は、既存の記録を返し、何もしない。同じ`key_digest`で異なる`result_digest`の記録は、両方を保持して`Unknown(conflict)`とし、後の記録で前の記録を上書きしない。
- **K2-I5 版の置換の禁止**：`identity`と`revision`を指定した参照へ、別の`revision`の記録を返さない。同じ`revision`で`digest`が変わった場合は、`Unknown(conflict)`とする。
- **K2-I6 digestの型**：`Digest`、`GitRevision`、prefixの無いhex、短縮したdigestを別の型とし、相互に比較しない。短縮形は表示だけに使う。
- **K2-I7 層を分けた版**：packの版、release unitの版、統合製品の版、段階（v0.x）の版を別の`SubjectRef`として持ち、一つの版の昇格から他の版を昇格させない（`AC-HARNESS-L3-010-03`）。

### 3.4 イベントとAPI境界

- イベント：`ResultRecorded(key_digest, result_digest, producer)`、`ResultConflictDetected(key_digest, result_digests[])`。staleはイベントにしない（K2-I2）。保存はK5（repository内の追記専用JSONL。依頼時のPO判断）で行い、本PRでは記録の形式だけを定める。
- `key_of(operation, operation_version, subject, inputs, scope) -> ResultKey`：`inputs`を`identity`で整列し、重複した`identity`を拒否する。
- `lookup(records, query_key, current_revisions) -> Observed<T>`：K2-I1、I2、I5に従う純関数。
- `record(records, key, result, producer) -> Recorded | NoOp | Conflict`：K2-I4に従う。

### 3.5 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-130EFBE7012012FF9281`／`docs/design/helix/L6-function-design/layer-ledger-pair-gate.md:191,283,287`／`458c7a428c4ce9a19506cd4061568dda091bdf2674517fafec235fc374d720ad` | pair receiptが`derived_from_digest`・`snapshot_digest`・`verdict: verified\|failed\|stale`を持つ。変更の原因ごとに後段の段階をstaleにする | 層pairに限っていた鍵を、全機構の結果の鍵へ広げる。staleを記録へのイベントでなく照会時の導出にする | `semantic_rederive` |
| `LEGACY-ASSET-28B47108797C610AE0BC`／`docs/design/helix/L6-function-design/engine-detector-execution.md:53,86,134`／`50262d5ab40b334db414b6d9502eb08559fa15ad35db0f93722ae6a778e3c805` | source・version・config・schemaの変化で証拠をstaleにする。入力digestの束（`FixedExecutionInputV1`） | 旧にもbackdatingは無い。本書もK2-I3で使わない（PO判断2） | `semantic_rederive` |
| `LEGACY-ASSET-9A2C16ECB41E0E007EFF`／`docs/design/harness/L6-function-design/digest-canonicalization-authority.md:12-30`／`ac0dd11655279e0653726d4eeb06a90663c65663f36fc33a78be237f93f36b89` | `sha256:<64 lowercase hex>`と`canonicalJson`。bare・truncated・domain固有のdigestを混同しない | なし（K2-I6として再導出） | `semantic_rederive` |
| `LEGACY-ASSET-02319C2481B9E01698D5`／`docs/governance/helix-harness-requirements_v1.3.md:361`／`788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | 同じ`command_id`と同じdigestなら既存receiptを返し、異なるdigestはconflict。reviewは対象revisionとHEADに固定し、後の変更でstaleにする | なし（K2-I4として再導出） | `semantic_rederive` |
| `LEGACY-ASSET-210D6B145CA997AE3CFA`／`docs/design/helix/L6-function-design/github-ci-status-head-binding.md:14-35`／`ada13578a51b0d9b154947a10b1aac1bcca6e211d9488d54c95ee4111a122526` | 別HEADの成功でgreenにしない。SHAが不正なら推測せずunavailable | 鍵をHEADだけから入力の組へ広げる | `semantic_rederive` |
| `LEGACY-ASSET-A127DEC3EEE6ED63CF17`／`docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:71`（UTW-005）／`bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872` | 失敗史：traceとreview証拠が最新HEADへ結び直されなかった | K2-I2（照会時の導出）の根拠 | 失敗史（区分なし） |

旧HELIXには、意味が変わらなければ下流を無効にしない仕組み（backdating）が無い。本書もPO判断2により使わない。backdatingを入れる時点で、判定器の版とdigestの固定とともに**新規案**として示す。

### 3.6 未決と試作で確かめること

- `kind`の語彙と、各機構の`identity`の形式（登録IDとpack identityの関係等）。各機構のL4で値を足す。
- `inputs`の全集合を誰が宣言するか。各操作の所有者が宣言する設計にしたが、宣言漏れを検出する方法はK10（依存グラフ）とK4（義務）で扱う。
- 時間による鮮度（観測の期限）はK2に含めない。K2のstaleは版の不一致だけである。時間の閾値はL2へ戻す論点とする（6章、G11）。
- 試作：同じ記録に対して、oracleのbytesを1byte変えた照会が`Stale`になり、元のbytesに戻した照会が`Value`に戻ることを確かめる。同じ鍵に異なる結果を2回記録して`Unknown(conflict)`になることを確かめる。

## 4. 用語の区別

旧HELIXと同じ語を使う場合、意味を次のように分ける（本書の設計判断。5章）。

| 語 | 本書と後続PRでの意味 | 旧HELIXでの意味 |
|---|---|---|
| operation authority tuple | 操作の許可を束ねる組（actor、target、operation、revision、environment、scope、expiry等）。SECURITYのL3が使う語に合わせる。K3で定める | 「authority tuple」はregistryやIssue／PRのidentityの組を指した（`LEGACY-ASSET-40605F1E36A5DDCE0D84`、`docs/design/helix/L6-function-design/github-workflow-identity-contract.md:33`、SHA-256 `cf46f99a4d5ace7ba11be2d168820b3026365dd3f61bcb68ae49867c5cf54806`）。本書はこの意味を「registry identity tuple」と呼ぶ |
| 遅着作用 | 失効した割当てやrunが後から返した、状態を変える作用。拒否する（K7で定める） | 旧HIL-FR-27「失効runのlate resultをcommitしない」（`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:117`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`） |
| 遅着観測 | 割当ての終了後に届いた観測（CI、review、費用）。追補する | 旧「遅着CI/review/costは追補する」（`LEGACY-ASSET-3A15E5645D2D2A59DFF5`、`docs/governance/candidates/execution-ticket-requirements.md:307`、SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`） |

## 5. 本書の設計判断と、旧HELIXとの差

次の表のうち、上の4行はL4起草者（AI）の設計判断であり、POの判断ではない。L4以降の設計はAIが行う（旧charter §3、AGENTS.md「再構築の原則」）ため、本書に理由と旧sourceを記録し、独立reviewで確かめる。下の2行（K9、G4）は、2026-10-08のPO判断記録による。

| 判断（出所） | 本書での適用 | 旧source（保持点・変更点） |
|---|---|---|
| 旧HELIX内の矛盾(a)は「L4以降は完全自動」に揃える（AIの設計判断） | 本書（L4）とL9に人の承認を置かない。独立reviewで確かめる | 旧charter §3（`LEGACY-ASSET-3B16BCFFAF353ADA813A`、`docs/design/helix/L0-charter/helix-charter_v0.1.md:18,22-30`、SHA-256 `8eff96bf58e6bb2cca247acef18c4f6cf07e304f3f23fb4179ddd8e5b19b23d8`）の「L4以降はAIが完全自動」を保持する。旧gate-design（`LEGACY-ASSET-2E09592A003B32C118C1`、`docs/governance/gate-design.md:23-40`、SHA-256 `d96852613b6d04c522872f110ad78dc6b2ade4007cc5a6a8b048eba273d3a726`）のG7・G11のPO sign-offは採らない（変更点）。理由：旧内部の矛盾を、現行の規則（AGENTS.md：人が持つ上流はConcept・L1・L2と、L3の承認）に揃える。G11（L11受入）の人の受入は、HARNESS-L2-022の利用者受入として別に残り、本判断で消えない |
| event logの正本はrepository内の追記専用JSONL。旧harness.dbは採らない（AIの設計判断。K5で詳細化） | K2の記録の保存先（K5で定める） | 旧ADR-007（`LEGACY-ASSET-8771887517A619A2D501`、`docs/adr/ADR-007-harness-db-sqlite-projection.md:18-30`、SHA-256 `50c05a00872be6c23de531aaecd6a6cfd26abec264718e0223ac2630f739dcdf`）の「projectionは再構築でき、authoring sourceではない」を保持する。harness.dbを正本にする点は`replace`。理由：現行は旧runtimeと`.helix/`を引き継がない |
| 信頼の根は、版とdigestで固定した検証器の集合をrepositoryで管理する。署名は後回し（AIの設計判断。K6・Eで詳細化） | K2の`producer`の枠（K6・Eで定める） | 旧closure-evidence-materialization（`LEGACY-ASSET-901EFEC93D536D3AA418`、`docs/design/harness/L6-function-design/closure-evidence-materialization.md:67-76`、SHA-256 `a8951a0cdd590da84612de8c6b6e5960ca5c32ad3b3d0c0d0511b9f5789c0264`）の「local hash単独では真正性を主張しない」を保持する。GitHub required-checkを信頼の根にする点は`replace`。理由：新世代CIは未構築で、旧CIは使えない |
| 旧用語の衝突は定義を分ける（AIの設計判断） | 4章 | 上表のとおり |
| K9独立性は作成と別runtime・別model family（PO判断：2026-10-08判断記録の判断1） | K9で適用する | 2026-10-08判断記録の判断1と旧PPS-R-03に従う |
| G4はbytes変化＝意味変化（PO判断：2026-10-08判断記録の判断2） | K2-I3 | 2026-10-08判断記録の判断2 |

## 6. L2へ戻す論点

本書で由来を見つけられず、要求の意味に触れるため、L4で決めないもの。

1. **時間による鮮度の閾値**（G11）：観測の期限、失効の許容遅延をどの機構が持つか。L2は数値を新設しない方針である。
2. **不明と未観測の境界の各機構での意味**（G10の一部）：LABOの「不明と未観測」、INFRAの鮮度、SECURITYのunknown／denyが、2.2の境界と異なる意味を持つ場合。

## 7. 人の判断が要る点

列挙だけであり、本書は新しい承認手続きを作らない。親要求の扱いと作業入口の停止は、2026-10-08のPO判断で決着した（1.3）。

1. L4／L9の配置規則の置き場（`l3-l10-authoring-layout.md`へ追記するか、別に置くか）。本書の配置は、その規則が決まるまでの提案である。人の上流の意味には触れないため、後続PRでAIが決め、独立reviewで確かめてよい。

## 8. PRの範囲と後続PRの計画

### 8.1 最初のPRの範囲と切り方の理由

最初のPRは、配置の提案、K1、K2、用語の区別、対のL9（K1・K2の結合検証）に限る。

- K1とK2は他のすべての要素の前提である（K3〜K10の結果はK1の型で返し、K2の鍵で保存する）。運用モデル「PRの原子性」の「対象PRが実際に参照する共通部品は先行PRで閉じる」に従い、先に閉じる。
- K1とK2は一つの変更目的（結果を版の鍵で保存し、不明を縮退させない）を成す。K2のstaleはK1の`Stale`クラスとして返るため、分けると片方だけでは検証できない。
- 運用モデルの`design_verification`は「後続の一つのV-pair」を扱うため、L4とL9を同じPRに置く。
- 人が読む本文はL4とL9を合わせて400行を少し超える。超える理由は、K1・K2が8機構のACへの由来の表と旧sourceの対応表を要することである。K1とK2は上の理由で分けられない。

### 8.2 後続PRの計画

各PRはL4の節と対のL9を同じPRに置く。依存の順に並べる。

| PR | 範囲 | 主な由来の候補（承認済みL3） | 組み込むG・E | 主な旧source（`legacy-crosswalk.md`） | 未決 |
|---|---|---|---|---|---|
| 2 | K5 状態は証拠から導出（追記専用JSONL＋projection） | CONNECT-AC-005-01（追記で訂正）、LABO-001-AC-02（source stateへwritebackしない） | — | event-projection-checkpoint-replay、ADR-007（置換）、handover-db-derivation | projectionの規模と再構築の費用（旧IMP-151、149） |
| 3 | K6 provenance／receipt、E 検証receiptの真正性、Phase 1の条件の具体（2026-10-08判断3） | HARNESS-L2-022系のreceipt、032-05 | E、G8（実行物の検証） | work-graph-receipt-acceptance、gate-evidence-substance、closure-evidence-materialization（置換）、check-registry（登録と実行の照合） | 署名を後回しにする間の改ざん検出の範囲。検証器の集合の配置 |
| 4 | K4 義務を一級データに | HARNESS-L2-022、030〜032、036 | G3（oracle種別：機械判定／LLM判断／人のIF） | descent-obligation、ci-deferred-obligation-recovery、ci-verification-plan、charter P3 | 未完義務の継承は新規案を含む |
| 5 | K10 型付き依存グラフ | HARNESS-L2-023（依存閉包）、INFRA | — | ci-responsibility-registry、design-registry | 関係型の性質宣言は新規案 |
| 6 | K7 世代pointer／fencing、型番の台帳形式とディレクトリ配置（方針6） | OS-014、INFRA | G5（取消しの伝播） | node-runtime-cutover、HIL-FR-27、ADR-009 | 自動切戻しとADR-009の差（Phase 2の判断時に扱う）。G5の統一伝播は新規案 |
| 7 | K3 operation authority tuple | SECURITY-AC-006-01ほかSECURITY Stage 1 | G5の受信側 | authority-vocabulary、security-capability-broker、source-boundary-contracts | 旧の軸（data_classification、sink、impact）の採否 |
| 8 | K9 独立性の記録 | 2026-10-08判断1、LABOのblind評価 | — | producer-provenance-separation、worker-independent-review | routeの軸は新規案 |
| 9 | K8 label遷移 | SECURITY-AC-001-01 | — | pillar P8、worker-context-authority、memory-learning-promotion | label伝播（taint型）は新規案 |

G14（外部標準の版固定）はCONNECTのL4で扱い、共通カーネルに含めない。

## 付録A 引用した現行文書のSHA-256（base `f88c96ce`）

| path | SHA-256 |
|---|---|
| `docs/concept/helix-concept.md` | `bbc787c5dc17de9eded156285ad82ef768788cfa31822dfffa477db073a5e715` |
| `docs/helix-harness/L2-requirements/product-requirements.md` | `9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `2180967f0075f467c99a553d34f688a1fdf434703803b1a34e7e147d6a7d2df5` |
| `docs/helix-connect/L3-requirements/functional-requirements.md` | `b3e4a47c0f49978880fc9bae7697d9b67eeaf72a112f821fef167c230c9d2e4b` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `362979fc4489c137d7641278a8ea8e55461f3592d56d802bb285ec34abc4a9b8` |
| `docs/helix-security/L3-requirements/functional-requirements.md` | `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` |
| `docs/helix-infrastructure/L3-requirements/functional-requirements.md` | `425d0746efe875dbfbeebc26562adea99a3cdd8e8ef6377a0164bca1d624cc2d` |
| `docs/helix-brain/L3-requirements/functional-requirements.md` | `6cf8be0c095fcd5ad5e52b6ee99e607c18d1b26be6f0d2e625e727d868a33cdf` |
| `docs/helix-os/L3-requirements/functional-requirements.md` | `666200db50ea9a2e7f0d67d57496a71368e497f2fdb6e3485d4838339000b393` |
| `docs/helix-intelligence/L3-requirements/functional-requirements.md` | `35e936a6d83d7a83310cc2a1900e8f199c54923472df9e9b0d7a9bdeec059457` |
| `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` | `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23` |
| `docs/governance/decisions/l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md` | `27b51768cbf010d201ccc2aafe8e4c893ec5ccb2a9a0bce662af343ef87809ee` |
| `docs/governance/decisions/po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md` | `a5061e7438c4be4ca9d14637ac9f5f04689fb00fd3b7cb7d9d59ae775f7a0571` |

旧sourceのpathは`archive/legacy-generation-2026-09-14/root/`からの相対pathである。旧sourceのSHA-256は本文bytesを再計算し、資産明細台帳の`source_sha256`と一致することを確かめた。旧資産の個別採否は、本書の区分候補を起点に、`docs/governance/legacy-asset-decisions.jsonl`の判断ログ契約に従って別に記録する。
