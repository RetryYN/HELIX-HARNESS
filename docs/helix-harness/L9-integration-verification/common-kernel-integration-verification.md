# HELIX 共通カーネル L9結合検証設計（K1〜K10・E・G3/G4/G5/G8/G10/G11・Phase 1・型番台帳/配置）

status: design_pair_defined
owner: HELIX-HARNESS（L4と同じ）
paired_l4: ../L4-basic-design/common-kernel.md
base: main `66abf6bf158baebc6bfceb5ccf693d425aae41a9`（引用した現行本文のSHA-256はL4付録A）

本書は[共通カーネルL4](../L4-basic-design/common-kernel.md)のK1〜K10、E、G3/G4/G5/G8/G10/G11、Phase 1の条件、型番台帳と配置に対する結合検証設計である。L9はL4の基本設計を機構の境界をまたぐ結合の範囲で照合する（HARNESS-L2-003／004、`docs/helix-harness/L2-requirements/product-requirements.md:110`）。本書の項目はL4の番号付き契約と不変条件を参照し、要求やACを作らない。L3 ACの総合検証はL10の責務である。

`design_pair_defined`はL4契約と対のoracleを定義したことだけを表す。review済み・承認済み・実装済み・実行済み・合格とは同義でなく、独立reviewは対象PRのexact base/HEAD記録で追う。

本書は検証の設計であり、実行・合格の記録ではない。新世代CIは未構築であり、旧CI・旧testを実行せず、その合格を証拠にしない。試作で実行する場合は`scaffold/`に置き、Scaffold Bindingへ登録する。

## 1. 検証の範囲

結合の境界は次のとおりとする。

- **機構の写像→カーネル**：各機構の状態語を`Observed<T>`へ写す関数（L4 2.5）。
- **カーネル内の合成と判定**：`combine`、`admit`、`disposition`、`key_of`、`lookup`、`record`。
- **正本とprojection**（K5、L4 9章）：`append`、`current_head`、`read`、`restore`、`project`、`verify`。K2の`record`はsegmentへの追記、`lookup`の記録集合はprojectionとして通す。
- **操作の許可**（K3、L4 16章）：既存authority sourceのadapter→`check_permission`→K7/各機構の消費側。
- **世代・取消し・台帳**（K7・G5、L4 15章）：`request_move`、`apply_move`、`admit_effect`、`propagate`、`ledger_view`。
- **依存グラフ**（K10、L4 14章）：`build_graph`、`check_graph`、`closure`、`impact`、`independent`。
- **義務**（K4・G3、L4 13章）：`derive`、`evaluate`、`check_view`、`inherit`、`receive`。
- **検証receipt**（K6、L4 10章）：`run`、`admit_receipt`、`reverify`、`required`。receiptはK2の記録としてK5のlogへ置き、`restore`→`lookup`を通して照会する。
- **独立性**（K9、L4 17章）：creator inventory resolver→四軸comparison→K2/K6 admission。製品の独立性を開発repoのreview経路と混同しない。
- **配置とconsumer記録**（L4 15.4〜15.5）：宣言→台帳viewと、repository-layout L4/L9のrelease/target/actual、配布、logical ID→physical locator契約への接続。物理storeの実装保証は文書上の照合から生成しない。
- **カーネル→消費側**：ある機構の結果を、別の機構の判定（gate、昇格、適格）が受け取る境界。

## 2. 検証項目

各項目は正常と反例を持つ。反例は一つの条件だけを変える。期待は観測できる出力で書く。

### K1

`combine`と`admit`の項目は、すべて`combine(成分, PolarityOf) -> Combined -> admit`の実際のAPI経路で照合する。単独の`Observed`を`admit`へ直接渡す経路は置かない（L4 2.5）。

| ID | 対象 | 正常 | 反例と期待 |
|---|---|---|---|
| `IV-K1-01` | K1-I1、I2：機構をまたぐ縮退 | CONNECTの互換`Value(compatible)`（CONNECTの`PolarityOf`でPositive）とHARNESSの検証`Value(pass)`（HARNESSの`PolarityOf`でPositive）を一つの`combine`へ渡すと`verdict = Positive`、`admit`は`Admitted` | CONNECTの成分を`Unknown(incomparable)`、`Stale`、`Unobserved(not_selected)`に一つずつ替えると、いずれも`verdict = Undetermined`、`admit`は`Withheld`で、`reasons`に替えた成分の位置とクラスだけが入る |
| `IV-K1-02` | K1-I3：否定と不明の同時 | — | `[Value(fail), Unknown(unreadable)]`を渡すと`verdict = Negative`、`components`に2成分が入力順のまま残り、`negatives = [0]`、`non_values = [1]`。`admit`の`reasons`は`{0, Value, negative_value}`と`{1, Unknown, unreadable}`の2件。片方を落とす実装、単一の色へ縮約する実装は不合格 |
| `IV-K1-03` | K1-I3：複数の異種非Value | — | `[Value(pass), Unknown(conflict), Unobserved(pending_receipt), Stale]`を渡すと`verdict = Undetermined`、`non_values = [1, 2, 3]`、`admit`の`reasons`は3件で、各クラスと理由が入る |
| `IV-K1-04` | K1-I2、I3：全肯定と否定だけ | `[Value(pass), Value(pass), Value(pass)]`は`Positive`、`Admitted` | `[Value(pass), Value(fail)]`は`Negative`、`Withheld`の`reasons`は`{1, Value, negative_value}`の1件で、空ではない |
| `IV-K1-05` | 写像の責務 | 成分ごとに`PolarityOf`を指定した組は合成できる | `PolarityOf`の無い値型の成分は`Unknown(missing_input)`として`non_values`に入る。カーネルが`compatible`等を自分で肯定に読む実装は不合格 |
| `IV-K1-06` | K1-I4：有効な判定成分0件 | 必須集合が1件以上で全成分が肯定なら`Positive` | (a)成分0件、(b)成立した`NotApplicable`1件だけ、(c)成立した`NotApplicable`3件だけ、の3経路で、いずれも`verdict = Undetermined`、`set_reason = Unknown(missing_input)`、`admit`の`reasons`は`{whole, Unknown, missing_input}`の1件で空でない。`Positive`にする実装、理由0件の`Withheld`を返す実装は不合格。`set_reason`はL4 §2.2のkeyなし集合診断であり、Observed成分ではない。架空key・N/A成分keyの流用や単独recordは不合格 |
| `IV-K1-07` | K1-I5：N/Aの成立 | 理由・authority・再入条件をすべて持つ`disposition`は`NotApplicable`となり、`excluded`に入る | 三つのいずれか一つを欠いた入力（3通り）は、それぞれ`Unknown(invalid_disposition)`として`non_values`に入る |
| `IV-K1-08` | K1-I6：鍵全体の欠落 | 鍵の完全な各クラスの成分は、`combine`が受理し、`lookup`の結果として返せる。`record`は`Value`・`Unknown`・`Unobserved`・`NotApplicable`を受理する（`Stale`の`record`は鍵と無関係に`stale_not_recordable`で拒否される。IV-K2-11で別に照合し、本項の`missing_key`と区別する） | 5クラスそれぞれの鍵を欠いた成分を、`combine`（`Observed[]`）へ、また鍵を欠いた`key`を`record`へ、鍵を欠いた`query_key`を`lookup`へ渡すと、いずれも`missing_key`で拒否され、成分に数えられない。`Unknown`や`Unobserved`へ読み替えて先へ渡す実装は不合格 |
| `IV-K1-09` | K1-I7：「無い」の確定 | 完全走査の証拠付きで0件なら`Value`（0件） | 部分走査、読取失敗の各入力は`Value`（0件）にならない |
| `IV-K1-10` | K1-I8：fail-openの限定 | 宣言付きの表示用投影は非`Value`を省略して表示してよい | その投影の出力を`combine`へ渡す経路は拒否される |
| `IV-K1-11` | 写像表（L4 2.4） | 写像表の各語が、表のクラスへ一度ずつ写る | `mismatch`・`incompatible`を`Unknown`へ、`not_observed`を`Value`へ写す実装は不合格。表に無い語は`Unknown(unsupported)`になる |
| `IV-K1-12` | K1-I6：鍵のfieldの単独欠落 | 全fieldのある鍵は受理される | `ResultKey`の`operation`、`operation_version`、`subject`、`inputs`、`scope`、`subject`の`kind`・`identity`・`revision`・`digest`、入力1件の`kind`・`identity`・`revision`・`digest`を一つずつ欠いた13fixtureを、`combine`の成分の鍵、`record`の`key`、`lookup`の`query_key`の3境界へ渡すと、いずれも`missing_key`で拒否される（13×3） |
| `IV-K1-13` | K1-I6：`admit`境界の鍵検査 | `combine`が作った鍵の完全な`Combined`は`admit`で判定される | `combine`を経ずに作った判定`Positive`の`Combined`で、成分1件の鍵全体を欠いたものと、その成分の鍵からIV-K1-12と同じ13fieldを一つずつ欠いた13fixture（`scope`、`subject`の`digest`等を含む）を`admit`へ直接渡すと、いずれも`missing_key`で拒否され、`Admitted`にも通常の`Withheld`にもならない（1＋13） |

### K2

IV-K2-01〜17は一つの記録を置いた後に照会の鍵を一か所だけ変え、IV-K2-18〜20は複数の記録を置く。IV-K2-21は三機構共通のsource-content alias、binding ref、source実読、K6 read identity一致を別fixtureで照合する。fixtureを分け、同じ反例を複数の期待で照合しない。

| ID | 対象 | 正常 | 反例と期待 |
|---|---|---|---|
| `IV-K2-01` | K2-I1：完全一致 | 記録時と全fieldが同じ照会は、記録したクラスのまま返る（`Value`、`Unknown`、`Unobserved`、`NotApplicable`の4fixture） | — |
| `IV-K2-02` | K2-I2の4、I2b：正当な新revision（旧記録が`Value`） | — | subject、oracle、契約、設定の各入力について、`revision`と`digest`をともに新しくした照会（4通り）は`Stale`で、`recorded_key`と`current_key`の差が変えた入力だけを示す |
| `IV-K2-03` | K2-I2b：旧記録が非`Value` | — | 旧記録が`Unknown`、`Unobserved`、`NotApplicable`の3fixtureで、subjectの`revision`を新しくした照会は、いずれも`Unobserved(not_run)`で`superseded`が旧記録を指す。`Stale`を作る実装、旧`NotApplicable`を持ち越す実装は不合格 |
| `IV-K2-04` | K2-I2の2：同じrevisionのdigest変更 | — | subject、oracle、契約、設定の各入力について、`revision`を同じまま`digest`だけを変えた照会（4通り）は`Unknown(conflict)`。`Stale`や`Value`を返す実装は不合格 |
| `IV-K2-05` | K2-I2の集約順 | — | 一つの入力で同じrevisionのdigest変更、別の入力でrevision変更を同時に与えた照会は`Unknown(conflict)`（2が4より優先） |
| `IV-K2-06` | K2-I3：revisionだけの変更 | — | `digest`が同じで`revision`だけを変えた照会は、旧記録が`Value`なら`Stale`。`Value`を返す実装（backdating）は、判定器が版とdigestで固定されるまで不合格 |
| `IV-K2-07` | K2-I3：意味revision（PO判断2） | — | 空白だけを変えた本文（意味は同じと人が読めるもの）を新revisionとした照会も`Stale`。`Value`を返す実装は不合格 |
| `IV-K2-08` | K2-I2の1：鍵のfieldの単独変更 | — | `operation`、`operation_version`、`scope`を一つずつ変えた照会（3通り）は、記録を候補にせず`Unobserved(not_run)`。別操作・別scopeの記録の値を返す実装は不合格 |
| `IV-K2-09` | K2-I2の1：入力集合の追加・削除 | — | `inputs`へidentityを一つ足した照会と、一つ除いた照会は、いずれも`Unobserved(not_run)` |
| `IV-K2-10` | K2-I2：記録を書き換えない | staleの判定前後で記録のbytesが同じ | staleを記録の上書きで付ける実装は不合格 |
| `IV-K2-11` | K2-I4：冪等な記録 | 同じ鍵・同じ結果の2回目の`record`は`NoOp` | 同じ鍵・異なる結果の2回目は`Conflict`となり、両方の記録が残る。その鍵の照会は`Unknown(conflict)`。`Stale`の`record`は`Rejected(stale_not_recordable)` |
| `IV-K2-12` | K2-I5：版の置換 | identityとrevision Rを指定した照会はRの記録を返す | 同じidentityの別revision R2の記録の値を返す実装は不合格（期待は`IV-K2-02`／`03`のとおり） |
| `IV-K2-13` | K2-I6 / §3.4：Digest prefix | `sha256:`付き64桁のDigestを受け入れる | 正常Digest一件のprefixだけを取り除く。`key_of`は`Rejected(invalid_digest)`。 |
| `IV-K2-13a` | K2-I6 / §3.4：Digest長 | 正常な`sha256:`付き64桁のDigest | Digestのhex部分だけを短縮する。`key_of`は`Rejected(invalid_digest)`。 |
| `IV-K2-13b` | K2-I6 / §3.4：Digest型 | 正常な`sha256:`付き64桁のDigest | Digest fieldだけを40桁の`GitRevision`値に置き換える。`key_of`は`Rejected(invalid_digest)`。 |
| `IV-K2-14` | K2-I7：層を分けた版 | pack版の変更でrelease unit版・統合製品版・段階の版の照会は変わらない | packの昇格からrelease unitの版を昇格させる実装は不合格 |
| `IV-K2-15` | `key_of`：入力の整列と重複identity | 重複のない同じinput setを順序だけ変えた入力は同じ`KeyDigest` | 基準の正規Digest付きinputを保ち、`inputs`へ同一identityのrefを一件だけ複製する。`key_of`は`Rejected(duplicate_identity)`。 |
| `IV-K2-16` | K2-I2の2(b)：`kind`の単独変更 | — | `subject`の`kind`だけを変えた照会と、入力1件の`kind`だけを変えた照会は、いずれも`Unknown(conflict)`。`kind`を比べずに記録の値を返す実装は不合格 |
| `IV-K2-17` | K2-I2の1：`identity`の単独変更 | — | `subject`の`identity`だけを変えた照会と、入力の件数を保ったまま1件の`identity`を別のidentityへ置き換えた照会は、いずれも`Unobserved(not_run)` |
| `IV-K2-18` | K2-I2の3：旧revision＋完全一致 | 旧R1の`Value`とR2の`Value`の2記録があり、照会がR2のとき、R2の`Value`を返す。旧R1の`Unknown`とR2の`Value`でも同じ | R1の`Stale`を返す実装、追記順だけで選ぶ実装は不合格 |
| `IV-K2-19` | K2-I2の2：完全一致＋同revision競合 | — | 照会と完全一致する`Value`の記録と、同じrevisionで`digest`の違う記録の2件があるとき、`Unknown(conflict)`。完全一致の`Value`を返す実装は不合格 |
| `IV-K2-20` | K2-I2の4：旧revisionだけの複数記録 | — | 旧R0の`Value`と旧R1の`Value`だけがあり照会がR2のとき、追記順で最後の記録を`prior`とする`Stale`。旧R1が`Unknown`なら`Unobserved(not_run, superseded = R1の記録)` |
| `IV-K2-21` | §3.4.1：role-bound input alias | K3/K8/K9すべてで各alias digestがraw source content digestと一致し、raw `SubjectRef`全fieldとrole/context mappingを独立binding ref bytesへ固定する。binding refと各aliasをK2 inputsへ含め、source bytesはalias identityのreadとして観測する。同一raw identity・異revisionの別role/side aliasは共存し、K6 read identityを10.3のsubject＋non-verifier inputsへ厳密一致させる | 同一aliasの完全一致だけdedupし、別aliasのraw identity一致をK2 duplicate拒否へ変換する実装は不合格 |
| `IV-K2-21a` | binding必須入力の欠落 | 完全なbinding refとalias集合はkeyへ入る | required `RoleBoundInputBindingRef`を欠く単独fixtureは`Rejected(missing_key)`。key差分やK1 `Unknown`を作る実装は不合格 |
| `IV-K2-21b` | 同一alias identity内の異ref | 1 alias identityに完全一致するraw refを一つだけbindingする | 同一alias identityへkind/revision/digestの異なるraw refを一つ追加する単独fixtureは`Rejected(missing_key)` |
| `IV-K2-21c` | alias source実読 | resolver bindingとalias ref digestが実source bytesに一致する | 1 aliasのsource bytesだけdigest不一致にするfixtureはK6 `Unknown(conflict)`。binding digest/key差分へ置換する実装は不合格 |
| `IV-K2-21d` | raw source revision更新 | 旧Value記録とcurrent raw refが同じalias identityを持つ | K3の決定的revision方式でraw revisionを一つだけ更新し、その新revisionのsource bytes/digestとbinding bytesを再計算したfixtureは、binding revisionも更新されK2 lookupが`Stale`となる。K8/K9ではowner記録のrevisionを更新した同条件を使う。同revision異digestの`Unknown(conflict)`になる実装は不合格 |

### K5

各項目は、損傷の無いsegmentを用意したうえで、一つの条件だけを変える。連鎖の検査（IV-K5-02〜08）では、対象の条件だけを破り、`entry_digest`と後続の行の`prev_digest`・`entry_digest`を必要に応じて再計算して、ほかの条件を成り立たせる。これにより、対象の検査だけを落とした実装がその項目で不合格になる。「境界」欄は変異を与える受け口である。

| ID | 対象 | 境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-K5-01` | K5-I1：既存行の変更 | `read` | 指定した`SegmentHead`と一致するprefixは`Value` | 既存の1行の改変、1行の削除、隣り合う2行の入替え（3fixture）は、いずれも`Unknown(unreadable)` |
| `IV-K5-02` | K5-I3(a)：解析できない行 | `read` | — | 1行をJSONとして解析できないbytesにした入力は`Unknown(unreadable)`で、`evidence`は(a) |
| `IV-K5-03` | K5-I3(b)：未知の`schema_version` | `read` | — | 1行の`schema_version`を未知の値にし、その行の`entry_digest`と後続の連鎖を再計算した入力は`Unknown(unreadable)`で、`evidence`は(b)だけ |
| `IV-K5-04` | K5-I3(c)：`seq`の欠番 | `read` | — | 途中の行の`seq`を1つ飛ばし、`entry_digest`と後続の連鎖を再計算した入力は、`evidence`が(c)だけの`Unknown(unreadable)` |
| `IV-K5-05` | K5-I3(d)：`seq`の重複 | `read` | — | 2行に同じ`seq`を付け、連鎖を再計算した入力は、`evidence`が(d)だけの`Unknown(unreadable)` |
| `IV-K5-06` | K5-I3(e)：`prev_digest` | `read` | — | 1行の`prev_digest`を別の正しい形のdigestに替え、その行と後続の`entry_digest`を再計算した入力は、`evidence`が(e)だけの`Unknown(unreadable)` |
| `IV-K5-07` | K5-I3(f)：`entry_digest` | `read` | — | 1行の`entry_digest`だけを替え、次の行の`prev_digest`をその値に合わせて後続を再計算した入力は、`evidence`が(f)だけの`Unknown(unreadable)` |
| `IV-K5-08` | K5-I3(g)：指定したhead | `read` | — | 内部では連鎖の整ったsegmentで、(1)指定した`head.seq`より短いもの、(2)同じ`seq`の行の`entry_digest`が違うもの（別の連鎖で書き直したもの）は、いずれも`evidence`が(g)だけの`Unknown(unreadable)` |
| `IV-K5-09` | K5-I4：固定prefix | `project`、`verify`、`lookup` | `seq=1`のheadでprojectionを保存した後にAへ`seq=2`を追記し、保存した`input_heads`で`verify`すると`Value`（`seq=2`を読まない） | 同じ状態で`current_head`（`seq=2`）を`input_heads`とした照会は、K2-I2の4により保存したprojectionを`Stale`として返す。旧headの再構築に`seq=2`を畳み込む実装は不合格 |
| `IV-K5-10` | K5-I5：冪等な追記 | `append` | 同じ`key_digest`・同じ`result_digest`の2回目は`NoOp`、異なる`result_digest`は`Conflict`で両方の行が残る | manifestが列挙するsegment Bだけが読めない状態で`ResultRecorded`を追記すると`Rejected(peer_unreadable)`で、segmentは変わらない |
| `IV-K5-11` | 9.5：eventの種類別の検査 | `append` | 各種類の正しいeventは`Appended` | 次を1fixtureずつ与え、いずれも`Rejected`でsegmentが変わらない：`ResultKey`の1field欠落、`key_digest`の不一致、`result_digest`の不一致、`Stale`の結果、3fieldの欠けた`NotApplicable`、宣言の無い値型の`Inline`、宣言と別のlogへの記録、`result_digests`が1件の`ResultConflictDetected`、logに無い`result_digest`を含む`ResultConflictDetected`、`ResultRecorded`を対象にする`Correction`、`manifest_writer`以外の`SegmentOpened`、未宣言の`event_type`、writerの不一致、manifestに無いsegment |
| `IV-K5-12` | 9.3：logからの復元 | `restore`→`lookup` | JSONLと`FixedRef`の実体から、`Value`（`Inline`と`FixedRef`の各1件）、`Unknown`、`Unobserved`、`NotApplicable`の記録を復元し、完全一致の照会で各々が記録したクラスのまま返る | `FixedRef`の実体が無いもの、bytesのSHA-256が`digest`と違うものは、その記録が`Unknown(unreadable)`として復元され、`Value`にならない |
| `IV-K5-13` | K5-I8：訂正 | `project` | (1)訂正の無い`DeclaredEvent`は元の内容、(2)Aで`DeclaredEvent` Dを対象にする`Correction` C1を`append`し（`Appended`）、Bで C1を対象にする`Correction` C2を`append`する（`Appended`）と、`project`はC2の`replacement`を返す、(3)末端に`replacement`の無い鎖は撤回（元の行は残り、集計に入らない） | (4)同じ対象への訂正がAとBに1件ずつあり、互いを対象にしない場合は、入力の並び順によらず`Unknown(conflict)`。追記順で後の訂正を採る実装は不合格。(5)同じ鍵で結果を改める2件目の`ResultRecorded`は、訂正ではなくK2-I4により`Unknown(conflict)`。(6)新しいrevisionの鍵で記録すると、旧結果はK2-I2により`Stale` |
| `IV-K5-21` | 9.5：`restore`の完全性 | `restore`→`lookup` | `scope.segments`がA・Bで両方のprefixを読めれば、復元した集合で`lookup`する（Bに同じ鍵の異なる結果があれば`Unknown(conflict)`）。Aだけを宣言したscopeは、そのscopeの鍵の照会にだけ使われる | (1)`input_heads`からBを落とすと`Unknown(missing_input)`、(2)`scope.segments`が0件は`Unknown(missing_input)`、(3)manifestの損傷は`Unknown(unreadable)`、(4)Bの損傷は`Unknown(unreadable)`。いずれも`lookup`は呼ばれず、照会の結果はその非`Value`。(5)Aに完全一致の`Value`、Bに同じ鍵の異なる結果があり、全体のscopeのままBをhead一覧から落とした照会は`Unknown(missing_input)`で、Aの`Value`を返す実装は不合格 |
| `IV-K5-14` | K5-I9：書き戻しの禁止 | `project`、`append` | — | projectionの出力をeventとして`append`する経路、`record`へ渡す経路は、いずれも`Rejected` |
| `IV-K5-15` | K5-I10：決定的な再構築 | `project` | segment A・Bで、行の読込み順とsegmentの並び順を変えた3通りの入力が同じ`output_digest`になる | 読込み順でprojectionが変わる実装は不合格 |
| `IV-K5-16` | K5-I7：segmentをまたぐ順序 | `restore`→`lookup` | 旧revisionの`Value`が同じwriterの`segment_no`=2と10にあり、照会が新revisionのとき、`prior`は10の記録（数値比較）。writerの表記がNFCとNFDで違う同じ名前は同じwriterとして比べる | `segment_no`を文字列として比べて2を選ぶ実装、時刻や読込み順で選ぶ実装は不合格 |
| `IV-K5-17` | K5-I11：全量の前提 | `project` | `scope.segments`がA・Bで、両方のprefixを読めれば「0件」「閉じた」を出せる | (1)`input_heads`からBを落としAを読めた場合は`Unknown(missing_input)`、(2)`scope.segments`が0件は`Unknown(missing_input)`、(3)Bが損傷は`Unknown(unreadable)`、(4)Aだけを宣言したscopeのprojectionは`Value`だが、log全体のscopeでの照会には`Unobserved(not_run)`（scopeが鍵に入る）、(5)close済みの項目が部分読取りでopenに戻る実装は不合格 |
| `IV-K5-18` | K5-I12：projectionの鍵 | `lookup` | 同じ`projector`・`scope`・`input_heads`の照会は保存したprojectionを返す | (1)segmentへの1行の追記は`Stale`、(2)projectorの`version`の更新は`Unobserved(not_run)`、(3)同じ`version`で`projector.digest`だけを変えた照会は`Unknown(conflict)`、(4)影響を受けないsegmentだけを入力とするprojectionは`Value`のまま。(3)を(2)と同じに扱う実装は不合格 |
| `IV-K5-19` | K5-I13：checkpoint | `verify` | `input_heads`がcheckpointの前方への延長で、`state_digest`が再計算と一致し、差分の結果が全量と一致すれば使える | (1)checkpointより短いhead、(2)checkpointの`seq`の行の`entry_digest`が違うhead、(3)`state`だけを改変し`state_digest`を据え置いたもの、(4)差分の結果が全量と違うもの、は各々`Unknown(conflict)`で使われない |
| `IV-K5-20` | 9.5：`verify` | `verify` | 改変の無いprojectionは`Value` | (1)`output`だけを改変（`output_digest`は据置き）、(2)`output_digest`だけを改変、(3)`output`と`output_digest`を互いに整合させて改変（再構築とは違う）、は各々`Unknown(conflict)`。(1)と(2)は保存値の再計算で、(3)は再構築との比較で検出される |
| `IV-K5-22` | assignment/runとsegment開設 | `manifest_writer`→writer append | current assignment/runとwriterの対応があり、manifest_writerがSegmentOpenedを登録してからwriterが追記する | manifest未登録、manifest未読、別writer/runの各fixtureでは書込み0件。path名から登録を生成しない |
| `IV-K5-23` | writer停止と過去prefix保持 | K3/K7 fence→writer append | assignment/run取消しまたは失効で旧writerの追記を止め、過去segmentを読取りに保つ | 新runへ旧writer/segmentを引き継いで追記するfixtureは不合格。current authority/fence非肯定、peer_unreadableでも追記0件。正常終了名だけから新しいEpochIssued/revokeを生成しない。遅着観測はcurrent writerのLateObservationに結び、旧writerの作用にしない。新SegmentClosedイベントや時刻閾値を要求しない |
| `IV-K5-24` | K5-I3(h)：CRLFの拒否 | `read` | canonical JSONのLogEntryの後にLF一つを持つ行を読み、raw bytesが解析値のcanonical bytesと一致する | その行のLFだけをCRLFへ変える。その他のschema/seq/digest/prefix/head条件を満たしていても(evidence h)の`Unknown(unreadable)` |
| `IV-K5-25` | K5-I3(h)：末尾空白の拒否 | `read` | canonical JSONのLogEntryの後にLF一つを持つ行を読み、raw bytesが解析値のcanonical bytesと一致する | LF直前にASCII spaceだけを追加する。その他の条件を保ち、(evidence h)の`Unknown(unreadable)` |
| `IV-K5-26` | K5-I3(h)：非canonical表記の拒否 | `read` | canonical JSONのLogEntryの後にLF一つを持つ行を読み、raw bytesが解析値のcanonical bytesと一致する | JSON値とentry_digestを保ったままkey順序を変えるなど非canonical表記にする。その他の条件を保ち、(evidence h)の`Unknown(unreadable)` |

### K6

各項目は、集合に登録した検証器と、その正しいreceiptを用意したうえで、一つの条件だけを変える。digestを変える変異では、変えた条件以外の検査が成り立つように、関係するdigest（本体の`FixedRef`、記録の`result_digest`、logの連鎖）を再計算する。`required`の項目は、必要な検証器をA・Bの二つとする。

| ID | 対象 | 境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-K6-01` | 10.3：receipt鍵の照会 | `restore`→`lookup` | 記録と同じreceipt鍵の照会は`Value` | (1)対象のidentityを保った新revision（旧記録は`Value`）は`Stale`、(2)対象の同じrevisionでdigestだけ変更は`Unknown(conflict)`、(3)集合の新revisionは`Stale`、(4)集合の同じrevisionでbytesだけ変更は`Unknown(conflict)`、(5)同じ版で検証器のbytesだけ変更は`Unknown(conflict)`、(6)検証器の版の更新は`Unobserved(not_run)`、(7)入力のidentityの追加・削除は`Unobserved(not_run)` |
| `IV-K6-02` | K6-I1：発行者 | `run` | 基底鍵だけを渡すと、検証器が`ReceiptBody`を作る | 結果、exit、出力digestのいずれか一つを呼出し側から渡す経路（3fixture）は、いずれも`Rejected` |
| `IV-K6-03` | K6-I2：集合への所属 | `admit_receipt` | 集合の`ref`と全fieldで一致する検証器のreceiptは`Value` | 集合に無い`identity`、`version`違い、`digest`違い（3fixture。鍵を再計算して整合させる）は、いずれも`Unknown(unregistered)` |
| `IV-K6-04` | K6-I2：集合から導く項目 | `admit_receipt`→`required` | — | (1)決定的でない検証器のreceiptに`deterministic: true`の欄を足し、派生digestを再計算しても、`reverifiable`は`false`のまま。(2)receiptの側で検査の写像を肯定へ替えても、集合の`checks`の写像が使われる |
| `IV-K6-05` | K6-I3：鍵と本体 | `admit_receipt` | — | (1)照会した鍵と違う記録の鍵のreceipt（旧対象revisionの正常なreceipt）を直接渡すと`Unknown(conflict)`、(2)別の入力のreceiptの本体を、`FixedRef`のdigestを合わせて差し替えたものは`Unknown(conflict)`、(3)本体の`verifier_set`だけを鍵と違えたものは`Unknown(conflict)` |
| `IV-K6-06` | K6-I4：readの完全性 | `admit_receipt` | `read`が期待集合と一致し、digestも一致すれば通る | (1)`subject`の要素だけを削除、(2)oracleの入力の要素だけを削除、(3)`read`を空、（各々派生digestを再計算）は`Unknown(missing_input)`。(4)期待集合に無いidentityの追加は`Unknown(conflict)`。(5)一つのdigestだけを鍵と違えたものは`Unknown(conflict)` |
| `IV-K6-07` | K6-I5：実体の再計算 | `admit_receipt` | `outputs`のbytesが記録したdigestと一致すれば通る | (1)出力のbytesだけを改変（digestは据置き）は`Unknown(conflict)`、(2)出力が無いものは`Unknown(unreadable)` |
| `IV-K6-08` | K6-I6：登録と評価 | `admit_receipt` | 登録と評価が一致し全検査が肯定なら、再合成した`inner`は`Positive` | (1)記録した`inner`の`verdict`だけを`Positive`に書き換えたもの（本体のdigestは再計算）は`Unknown(conflict)`。(2)未登録の検査の結果を含むものは、再合成で`Unknown(unregistered)`の成分になる |
| `IV-K6-09` | K6-I7：内部から外側への合成 | `admit_receipt`→`required`→`admit` | Aの全検査が肯定、Bの全検査が肯定なら、外側は`Positive`で`Admitted`、成分はA・Bの全検査 | (1)Aの1検査が否定・1検査が`Unknown`なら、外側は`Negative`で、`reasons`にAのその2成分が検証器と検査の識別付きで入る。(2)Aの1検査が未評価なら、外側は`Undetermined`で`Unobserved(not_run)`の成分を持つ（receiptがあることを肯定にしない）。(3)Aの`registered`が0件なら、外側に`Unknown(missing_input)`の成分。(4)Aの全検査が成立した`NotApplicable`なら、外側に`Unknown(missing_input)`の成分 |
| `IV-K6-10` | K6-I7：照会の非Value | `required` | — | (1)Aのreceiptが無いと、Aの成分は`Unobserved(not_run)`。(2)Aは旧対象revisionのreceiptだけなら`Stale`。(3)Aに完全一致のreceiptと、対象の同じrevisionでdigestの違う記録があれば`Unknown(conflict)`。(4)Aに同じ鍵で異なるreceiptが2件あれば`Unknown(conflict)`。(5)scopeのsegmentが`input_heads`から欠ければ、A・Bの成分は`Unknown(missing_input)`。(6)AとBの版が違っても、各々の鍵で照会される。(7)必要でない検証器Cのreceiptで、欠けたAを埋める実装は不合格 |
| `IV-K6-11` | K6-I8：再現の確認 | `reverify` | 決定的な検証器のreceiptは、再実行の`inner`のdigestが一致して`reproduction = Value` | (1)1検査の結果を書き換え、全digestを整合させた偽のreceiptは`reproduction = Unknown(conflict)`。(2)決定的でない検証器は`reproduction = Unknown(unsupported)` |
| `IV-K6-12` | 10.5：再現できても実行は証明されない | `admit_receipt`→`reverify`→消費側 | — | (1)実行していないのに、再現と同じ`inner`と整合したdigestを持つreceipt、(2)`execution`の欄だけを整合したdigestで書き換えたreceiptは、どちらも`reproduction = Value`になりうる。消費側は`issuer_authenticity = Unknown(unsupported)`を保持し、このreceiptから「過去に実行された」「その時刻に実行された」を出力する実装は不合格 |
| `IV-K6-13` | K6-I9：訂正の禁止 | `append` | — | receiptの記録を対象にする`Correction`は`Rejected`（K5-I8） |
| `IV-K6-14` | 10.3：時刻を使わない | `restore`→`lookup` | — | `started`・`completed`だけが違う2つの旧revisionのreceiptがあるとき、`prior`の選択はK5-I7の順序のまま。時刻で選ぶ実装は不合格 |
| `IV-K6-15` | K6-I10：authorityを作らない・保証の区別 | `required`の消費側 | — | (1)`Positive`の`RequiredResult`から、承認、merge可、受入、工程完了を出力する経路は`Rejected`。(2)`reproduction`が`Unknown(unsupported)`のA（決定的でない検証器）の成分を、`reproduction = Value`の成分と同じに扱う実装は不合格 |

### G8

各項目は、builderと実行物の検証器を集合に登録し、正しい`BuildReceipt`（`BuildManifest`を含む）と実行物のreceiptを用意したうえで、一つの条件だけを変える。digestを変える変異では、関係する派生digest（`FixedRef`、`result_digest`、logの連鎖）を整合させ、一般的な`FixedRef`の破損の検査で対象の検査の欠落を隠さない。

| ID | 対象 | 境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-G8-01` | G8-I1：対象の区別 | `required` | `subject`が`X`の必要な検証器のreceiptがそろえば、実行物の合成は`Positive` | (1)sourceと`X`のidentityが違い、sourceのreceiptだけがある場合、`X`の成分は`Unobserved(not_run)`。(2)同じidentityで`kind`だけが違うreceiptがある場合は`Unknown(conflict)`。`kind`を比べずに値を返す実装、sourceのreceiptを`X`の肯定として数える実装は不合格 |
| `IV-G8-02` | G8-I2：buildの受入と鎖 | `build_chain` | 受入を通り、`BuildManifest`の項目が`X`のidentity・revision・digestと一致すれば鎖が成り立つ | (a)の反例：(1)`BuildReceipt`が無い→`Unobserved(not_run)`、(2)sourceの旧revisionのreceiptだけ→`Stale`、(2')`S`と`X`を保ったまま、`build_key`のtoolchainのrevisionだけを新しくし、旧toolchainの自己整合したreceiptを渡す→`Stale`（receiptの側から鍵を採る実装は不合格）、(3)builderが集合に無い→`Unknown(unregistered)`、(4)builderの識別を欠く→拒否。(b)の反例：(5)同じbytesで`BuildManifest`の`artifact.identity`だけを替える→`Unobserved(not_run)`、(6)同じbytesで`artifact.revision`だけを替える→`Unknown(conflict)`、(7)別artifactの、自己整合した出力`FixedRef`を`X`の項目に入れる→`Unknown(conflict)` |
| `IV-G8-03` | G8-I3：配布物だけの差替え | `admit_artifact_bytes` | bytesの再計算が`X.digest`と一致すれば受け入れる | sourceとsourceのreceipt、`BuildReceipt`はそのままで、配布物のbytesだけを1byte変えた場合、`Unknown(conflict)`で展開・実行しない |
| `IV-G8-04` | G8-I4：artifactの再現 | `rebuild_compare`、`reverify` | 決定的なbuilderで再buildの`X`の項目のdigestが一致すれば`artifact_reproduction = Value` | (1)再buildの`inner`は一致するが`X`のdigestだけが違う場合、K6の`reproduction`は`Value`、`artifact_reproduction`は`Unknown(conflict)`。この比較だけを落とした実装は不合格。(2)決定的でないbuilderは`Unknown(unsupported)`。いずれも`issuer_authenticity`は`Unknown(unsupported)`のまま |
| `IV-G8-05` | G8-I5：合格は別の証拠 | `required` | — | buildの鎖とdigestの一致だけがあり、実行物の検証のreceiptが無い場合、合成は`Positive`にならない |
| `IV-G8-06` | G8-I6：段階の構成 | 段階の記録 | 段階はpackの`ArtifactRef`の組を持つ | source tagまたはsource revisionだけで段階を表す記録は拒否される |
| `IV-G8-07` | 11.4：toolchain | `restore`→`lookup` | — | (1)toolchainのidentityを保った新revision（旧記録が`Value`）→`Stale`、(2)同じrevisionでbytesだけ変更→`Unknown(conflict)`、(3)toolchainのidentityの追加・削除→`Unobserved(not_run)`、(4)旧記録が非`Value`→`Unobserved(not_run, superseded)`。宣言していないtoolchainの変更は検出されないことを、消費側が限界として持つ |

### Phase 1

各項目は、集合・`Corpus`・`Phase1Scope`を固定し、一つの条件だけを変える。他の条件は肯定に保つ。`Phase1Status`は記録を書き換えずに導く。

| ID | 対象 | 境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-P1-01` | P1-C1 | `Phase1Status` | 決定的なmemberだけの集合が固定されていれば、C1は肯定 | (1)集合が無く仮組みだけ→`Unknown(missing_input)`の成分、(2)memberが0件→C1の`set_reason`、(3)決定的でないmemberを含む→否定。いずれも`Phase1Status`は`Positive`にならない |
| `IV-P1-02` | P1-C2 | `Phase1Status` | `in_scope`の全要素が`bad_head`で検出され`fixed_head`で検出されなければ、C2は肯定 | (1)1要素を`bad_head`で検出しない→否定、(2)1要素を`fixed_head`の同じ箇所で検出→否定、(3)1要素のreceiptが無い→`Unobserved(not_run)`、(4)理由の無い除外→`Unknown(invalid_disposition)` |
| `IV-P1-03` | P1-C2：空と全N/A、前後の区分 | `Phase1Status` | `pre_freeze`と`post_freeze`の全成分が`{C2, partition, 要素}`として外側に出る | (1)`post_freeze`が0件で`pre_freeze`が肯定、(2)`pre_freeze`の全要素が成立した`NotApplicable`で`post_freeze`が肯定、の各場合に、C1・C3・C4が肯定でも`Phase1Status`は`Positive`にならず、外側に`{C2, 該当partition, set_reason}`の`Unknown(missing_input)`が残る。(3)`pre_freeze`の結果を`post_freeze`の検出として数える実装は不合格 |
| `IV-P1-04` | P1-C3：実行と非Value | `phase1_wiring`→`Phase1Status` | headとbaseのdigestが異なる通常のPRで、全memberのreceiptが受け入れられ（`read`に`<pr>#head`と`<pr>#base`の両方）、登録と評価が一致すればC3は肯定 | (1)`required_for`の識別の集合が全memberと違う→`Unknown(conflict)`の成分、(2)1PRで1memberのreceiptが無い→`Unobserved(not_run)`、(3)旧headのreceiptだけ→`Stale`、(4)同じ鍵で異なるreceipt→`Unknown(conflict)`、(5)`observation_base`のhead欠落→`Unknown(missing_input)`、(6)本体の`FixedRef`が読めない→`Unknown(unreadable)`、(7)登録と評価が違う→否定、(8)`prs`が0件→C3の`set_reason`。(9)評価済みの検査が`Unknown`や違反を返しても、C3の「実行済み」は肯定のまま |
| `IV-P1-05` | P1-C4 | `Phase1Status` | 対象外の型が列挙されていればC4は肯定 | 列挙が無ければ`Unknown(missing_input)`の成分 |
| `IV-P1-06` | 12.2：固定入力 | `Phase1Status` | 同じ固定入力（集合・`Corpus`・`Phase1Scope`・`observation_base`）からは同じ`Phase1Status` | (1)評価の時点で`prs`を検索し直して対象を増やす実装、(2)評価の時点で`partition`を計算し直す実装は不合格。(3)`Corpus`や`Phase1Scope`の新revisionでは旧結果は`Stale` |
| `IV-P1-07` | 12.1：authority | `Phase1Status`の消費側 | — | `Positive`の`Phase1Status`から、v0.1の成立、内部デプロイ、gateの変更を出力する経路は`Rejected` |

### K3

各fixtureは登録済みauthority sourceのcurrent prefix、current OS assignment、対象・環境のowner宣言、固定adapter/policy、全取消しprefix、期限内の時刻観測を用意する。queryは要求値として扱い、current宣言から再構成したcontextと一致するかを検査する。署名の無いK6 receiptの真正性を証明済みとしない。

| ID | 対象 | 境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-K3-01` | K3-I1・I2：tupleとcontext再構成 | `resolve_authority_context`→`check_permission` | current assignmentがactor A、owner宣言がqueryのtarget/revision/environment/scopeと一致し、7軸の各成分が全て肯定 | 7軸の欠落/unknown/確定不一致を一つずつ変異。欠落・unknownは非肯定、不一致は否定。project/環境/worktree/適用tenant越境も各々拒否。assignmentがactor Bなのにqueryや偽造contextがactor Aを申告する場合、呼出し側contextを受理せずBとの不一致を否定。current owner declaration/assignment refが入力prefixにはあるが対象・actorを決定できない場合は`Unknown(unregistered/missing_input)`。K2 keyの必須identity/ref自体を特定できない場合は`PermissionCheckDiagnostic(missing_key)`で、K1/K2結果を作らない |
| `IV-K3-02` | K3-I2：操作の分離 | `check_permission` | 11操作を各々独立fixtureで許可し、一致するoperationだけに有効 | readから残り10操作への単独置換を各々拒否。Agent利用権だけからwrite/deployを作らない |
| `IV-K3-03` | K3-I2・I4：版とK2 lookup | `check_permission`、K2 lookup | 同identity/revision/digestをcurrent sourceと対象で照合 | fresh checkで同identityの新revisionを観測すると、その比較は新keyの否定`Value`。同revisionの別digestは`Unknown(conflict)`、別identityは別tupleとして再照合。以前保存したcheckのkeyが変わったlookupだけはK2の`Stale`（`prior`/`recorded_key`/`current_key`を持つ）であり、fresh checkの不一致へ`Stale`を返す実装は不合格 |
| `IV-K3-04` | 16.2・K3-I3：sourceとcurrent effective decision | source adapter→K3 | 登録sourceの原記録と一意のcurrent effective decisionを読み、issuerと全bindingを照合 | 自己発行plain object、登録外source、同名の別source、issuer不一致、raw署名検証失敗/不能は非肯定。current allowの後に同tupleへのcurrent denyまたはconstrainがあるfixtureで、旧allow参照を指定しても旧allowを選ばず、current判断に従う。選択規則不明・競合候補複数は`Unknown(conflict/unregistered)`。K6 receiptのPositiveで代用する実装は不合格 |
| `IV-K3-05` | K3-I3：constrainの実行前提と実行結果 | K3→Worker/K6 | 実行前に強制可能な既存制約が全て適用設定され、その前提証拠が肯定ならcheckは狭いcontextに限って肯定可能。実行中・後の効果receiptは別観測 | deny、実行前制約設定の欠落/未観測/制約1件欠落、OS/Workerによる制約緩和は非肯定。実行後receiptの未着を許可前提にする実装、または許可Positiveを実行成功として記録する実装は不合格 |
| `IV-K3-06` | K3-I3：再利用・非生成 | K3→OS | 同一の有効なcurrent既決許可を通常task反復に再利用できる | request/ACK/review/CI green/照合成功だけから許可を発行する経路、通常taskごとに新human approveを要求する経路は不合格 |
| `IV-K3-07` | K3-I4・I5：expiry | 使用直前の照合 | sourceの既存expiry契約に従う期限内の観測で肯定 | 期限切れ、時刻読取不能、expiry解釈不能は肯定にならない。新TTLや猶予の既定値で通す実装は不合格 |
| `IV-K3-08` | K3-I4・I5：取消し | K3→G5→K7 | 有効なcurrent判断と全再照合で再開候補 | revoke、必要segment欠落/読取失敗を各々非肯定。G5伝播完了だけで旧許可を復活、旧Epochの作用受理、無関係scopeまで停止する実装は不合格 |
| `IV-K3-09` | K3-I6：段階の連続性 | request→decision→assignment→effective scope | 同じtupleと各段のowner参照が連結される | 各段を一つずつ別actor/target/operation/revision/environment/scope/expiryにし拒否。許可の肯定だけでWorker実適用済みとする実装は不合格 |
| `IV-K3-10` | K3-I7：required operation inputs | K3→SECURITY | `required_inputs[operation]`とquery・PermissionRecordのkey集合と値がidentityごとに完全一致 | purpose、classification、source、destination等を一つずつ別refへ変異し非肯定。required keyの欠落、余分なkey、PermissionRecord側bindingの不一致も各々検出。authority tuple一致だけで代用しない。旧sink enumやrisk要約で代用しない |
| `IV-K3-11` | 16.4・K7-I4：構成版/kindとCASの分離 | `apply_move` | target=段階identity、revision=`to.composition`、operation=deploy、MoveActionRefのkindを含む許可を照合し、K7適格性とCASが成立 | 許可と他条件を固定し移動先構成C1だけを適格なC2へ置換、kindだけを別kindへ置換する2 fixtureはK3で追記0。明示の包含規則がある広い既存許可だけは範囲内で再利用できる。from/to世代番号はK7適格性で照合し、同じ構成版・kindの許可に新しい世代番号ごとのPO再許可を加えない。pointer_headは許可bindingに含めず、末尾変異はK7 CASのstale_headで追記0 |
| `IV-K3-12` | 16.4・K7-I4/G5-I6：使用前・使用後照合 | `apply_move`→G5 | 使用直前checkがpositiveなら追記し、pointer_writerが同じmoveの`MoveAuthorizationObserved`を直後に追記し、直後checkもpositiveなら通常結果 | 使用前revoke/expiry/driftは追記0と`Rejected(authorization_unverified, check)`。append後の直後checkがnegative/unknown、観測欠落、またはobserved_at=nullならeventを保持して`AppliedUncertain`/未完の診断とし、`RollbackRequired`・G5待ちを残す。`MoveAuthorizationObserved`の別moveへの流用、直後checkを使用前pre-authorizationと誤認する実装、自動rollbackは不合格 |
| `IV-K3-13` | K3-I1・16.4：診断と真正性 | K3→消費側 | 全成分・reason・assuranceが残る | 一つのdenyで後続unknownを落とす、非肯定sourceを空集合の真にする、未証明issuer_authenticityを証明済みへ上げる、secret値を理由へ書く実装は不合格 |
| `IV-K3-14` | K3-I4：K2 keyのquery/operation inputs/制約 | permission check保存→lookup | `PermissionQueryRef`、query identityを含む`AuthorityInputBindingRef`、全operation input・制約のsource-content aliasをinputsへ含める。owner resolverがcurrent role/raw ref集合からfull mappingのimmutable canonical bytesを作り、K6はそのbufferとraw source bytesを読む。read identityは対応aliasとして記録し10.3のsubject＋non-verifier inputsへ厳密一致させる | 各subcaseは他fieldを固定し一つの変異だけを与える。異roleの同一raw identity・異revisionは別aliasで共存する。K3 wrapper→source-content変更によりoperation_versionを改訂し、旧version Positiveをlookupしない。余分なraw identity readやcaller bindingの採用は不合格 |
| `IV-K3-14a` | K3-I4：binding ref必須 | permission check K2 key construction | current owner resolverが作るbinding refと全alias refsをinputsに含める | binding refを一つだけ欠くfixtureは`Rejected(missing_key)` |
| `IV-K3-14b` | K3-I4：同一alias内の異ref | K2 `key_of` | 各alias identityに完全一致raw refを一つだけ置く | 同じalias identityへ異なるraw refを一つ追加するfixtureは`Rejected(missing_key)` |
| `IV-K3-14c` | K3-I4：source bytesのdigest | K6 source read | source bytesとalias digestが一致する | 1 sourceのbytesだけraw ref digestと不一致にするfixtureはK6 `Unknown(conflict)` |
| `IV-K3-14d` | K3-I4：binding mappingの真正性 | K6 binding read | `claimed_binding_digest = sha256(current_resolver_bytes)`で一致する | resolverが返すcurrent bytesを固定し、claim mappingだけを改変して`claimed_binding_digest != sha256(current_resolver_bytes)`にする単独fixtureはK6 `Unknown(conflict)`。不一致を検査する境界はK6 binding readで、K2 key変異だけで代用しない |
| `IV-K3-14e` | K3-I4：raw input revision更新 | K2 lookup | old Valueと同じalias identity・revision・digestを記録する | raw revisionを一つ更新し、bytes/digestに沿ってbinding revision・digestとaliasを再計算した照会は`Stale`。binding同revision異digestの`Unknown(conflict)`は不合格 |
| `IV-K3-14i` | K3-I4：同revisionのraw digest競合 | K2 lookup | 完全一致keyの旧`Value`を記録する | raw revisionを固定し1 sourceのdigestと対応bytesだけを変え、mapping digestを再計算する。binding revisionは変わらず、照会は`Unknown(conflict)`。digestをrevision導出へ入れて競合を隠す実装は不合格 |
| `IV-K3-14j` | K3-I4：alias identity集合変更 | K2 lookup | 完全一致keyの旧`Value`を記録する | 1 roleのraw identityを別identityへ替え、alias/bindingを再導出する。入力identity集合が変わるため`Unobserved(not_run)` |
| `IV-K3-14f` | K3-I4：PermissionQueryRef identity単独変更 | K2 lookup | query ref identityを含む完全一致keyで旧`Value`を記録する | query ref identityだけを変える照会はinputs identity集合が変わり`Unobserved(not_run)` |
| `IV-K3-14g` | K3-I4：PermissionQueryRef revision単独変更 | K2 lookup | 完全一致keyの旧`Value`を記録する | query ref revisionだけを変える照会は`Stale` |
| `IV-K3-14h` | K3-I4：PermissionQueryRef digest単独変更 | K2 lookup | 完全一致keyの旧`Value`を記録する | query ref digestだけを変える照会は`Unknown(conflict)` |
| `IV-K3-15` | K3-I4：K2 keyのcurrent context | permission check保存→lookup | 改訂済みoperation version、K3 code/config、current assignment、target/environment/各owner宣言、operation declaration、AuthorityDecl、policy、source current ref/adapterのrole-bound refsをkeyへ含める | 上記各参照とoperation versionを一つずつ変異。いずれかをkeyから省く、または旧operation versionのPositiveを再利用する実装は不合格 |
| `IV-K3-16` | K3-I4：K2 keyの観測状態 | permission check保存→lookup | role-boundな固定時刻観測refと全取消しprefixの`HeadInputRef`をkeyへ含める | 時刻観測、取消しprefixの各々を一つずつ変異。caller input_headsだけを取消し前の末尾へ変え、resolverが内部current_headを取得して差を非肯定にする。古いprefixを選ぶ実装は不合格。旧Positiveを再利用する実装は不合格。raw時刻値/`SegmentHead`をK2 inputへ直接入れる実装は不合格。record不在は`Unknown(missing_input)`、実行後receipt未着だけはK6側の`Unobserved(pending_receipt)`であり両者を混同しない |
| `IV-K3-17` | K7-I4：直後観測欠落の回復 | `recover_move_observation`→ledger/G5 | 停止でimmediate観測が欠けたmoveを再読し、回復時点のcurrent照合をphase=recoveryで同じmoveの診断として記録 | recoveryが肯定でも過去の直後成功・通常完了・G5待ち解消に変換しない。後続moveが既にあるfixtureでは元moveへの診断としてのみ追記し、現行を戻さず後続へ観測を流用しない。同じpointer segmentのPointerMoved seq+1以外（後続move後・別segment・別move）へimmediateを置くとK7-I4bによりUnknown(conflict)で待ちを解消しない。停止再開はseq+1が空いていてもrecovery経路を使う。これはログ判定のfixtureとは分け、PointerMoved追記後・観測前でプロセス停止を注入し、再起動の制御フローがrecover_move_observationへ入りphase=recoveryだけを追記することを観測する試験とする。ログだけでは停止・再開と遅い連続実行を識別できず、seq+1のimmediate偽装を検出できるとはしない。非move参照はRejected(not_a_move)、有効immediate既存はRejected(already_immediate)で追記0。check診断/時刻未観測はrecovery行のAppendedで全診断/nullを保持し、切替成功としない。自動pointer moveは不合格。停止注入で再起動経路がimmediateを追記した実装も不合格 |

### K7・G5・型番台帳

各項目は、検証済みの世代を二つ持つ段階、固定した台帳と依存グラフ、各受け手の正しいreceiptを用意したうえで、一つの条件だけを変える。

| ID | 対象 | 境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-K7-01` | K7-I1：順序とwriterの交代 | `apply_move`、`ledger_view` | pointer_writerがZからAへ交代し、Aのpointer segmentの最初の行が`WriterHandoff`（PointerLogのevent）で、Zのsegmentで0→1、Aのsegmentで1→2の二段の`PointerMoved`があれば、現行は2。`MoveRequested`と`RollbackRequired`は`RequestLog`にある | (1)segmentの辞書順（A＜Z）で順序を決める実装は不合格、(2)`WriterHandoff`の連鎖が途切れると現行は`Unknown(missing_input)`、(3)`WriterHandoff`を`RequestLog`にだけ置き、PointerLogに置かない場合も連鎖は途切れたものとして`Unknown(missing_input)` |
| `IV-K7-02` | K7-I2：条件付き追記の競合 | `append_if_head` | — | (1)同じ`pointer_head`の二つのrequestの両方が照合を終えた後で、先の方が追記すると、後の方の`append_if_head`は`Rejected(stale_head)`で何も追記しない（照合と追記の間に別の追記が入れる実装は不合格）、(2)古いprefixの末尾を`expected_head`に持つ追記は`Rejected(stale_head)` |
| `IV-K7-03` | K7-I3：適格性の入力 | `request_move` | RL-R2のstage_key（subject=移動先ManifestRef、manifest全fieldに対応するinputs）をcurrent OperationDeclから導き、stage/build/bytes/artifact検証の全成分が肯定なら、`RequiredResult`（`assurance`を含む）が`MoveRequested`に記録される | GenerationStagedのrelease未成立はIV-RL-14で照合する。compositionだけをsubjectにする旧鍵を照会へ流用する実装は不合格。`composition`は同じまま、(1)宣言の依存のrevisionだけ、(2)宣言のscopeだけ、(3)検証器の版だけを変えると、旧receiptは当たらず`Rejected(not_eligible)`。(4)同じrevisionでdigestの違う記録→`Unknown(conflict)`で`Rejected(not_eligible)`。(5)receiptのsegmentが`input_heads`から欠ける→`Unknown(missing_input)`で`Rejected(not_eligible)` |
| `IV-K7-04` | K7-I3：操作の種類 | `request_move` | (1)promote：`GenerationStaged`済みの新しい世代へ、(2)rebuild：`from`と同じ`composition`の新しい世代へ、(3)rollback：かつて現行だった保持している世代へ、の各々は記録される | (4)rebuildの移動先の`composition`だけが`from`と違う→`Rejected(not_eligible)`、(5)promote・rebuildの移動先が新しい世代でない（かつて現行だった世代）→`Rejected(not_eligible)`、(6)保持していない世代へのrollback→`Rejected(not_eligible)` |
| `IV-K7-11` | K7-I2：requestとapplyの二段 | `request_move`→`apply_move` | requestの後に、pointer segmentの末尾、stage/build各ownerのcurrent `OperationDecl`・`VerifierSet`、snapshotのfixed refsの再実bytes/digestと全segment末尾、照合済みの許可がいずれも変わらなければ、そのrequestの`apply_move`は成功する。request自身の`RequestLog`への追記では、pointer segmentの末尾は変わらずstaleにならない | requestとapplyの間に別の`PointerMoved`が一件入ると、`apply_move`は`Rejected(stale_head)`。旧いrequestを新しい末尾へ付け替えて適用する実装は不合格。適格性の入力の更新による拒否はIV-K7-13で照合する |
| `IV-K7-12` | K7-I2：fromの束縛 | `request_move`→`apply_move` | — | 現行が2のとき、`from`だけを保持している世代0に替え、`to`を世代0と同じ`composition`の新しい世代にしたrequest（rebuildの偽装）は`Rejected(stale_from)`。`from`を照合しない実装は不合格 |
| `IV-K7-13` | K7-I2b：適格性の入力の再読と追記後の検出 | `request_move`→`apply_move`、`verify_current` | requestの後に宣言と入力が変わらなければ、`apply_move`は成功し、`checked_heads`が記録される | (1)request→`OperationDecl`の依存Dのrevisionだけを更新→`apply_move`は`Rejected(stale_eligibility)`で追記しない、(2)`VerifierSet`の参照だけを更新→同じく拒否。(3)stage宣言を変えずbuild ownerの`OperationDecl`だけにartifact検証器を一つ追加→`Rejected(stale_eligibility)`で追記0。(4)読み直しの後、追記の前に依存Dが更新された場合、追記は成功しうるが、`verify_current`はstage/build両ownerのcurrent契約から同じ(a)〜(d)依存集合を導き、全segmentの`current_head`を取り直して求め直す。`Positive`でなければ`RollbackRequired`を追記し、pointerは動かさない。(5)宣言は変えずreceipt segmentにだけ同じ鍵で異なるdigestの`ResultRecorded`を追記→`verify_current`は`Unknown(conflict)`で`RollbackRequired`を追記。(6)`verify_current`が旧い`checked_heads`の固定prefixを再使用する実装は不合格。(7)必要なsegmentが欠けると`Unknown(missing_input)`で`Positive`にならない |
| `IV-K7-14` | K7-I3/RL-R4：manifest target一致 | `stage_generation` | target/compositeを一致させ、該当manifestに`ReleaseEstablished`があると記録できる | manifest.targetだけをgeneration.targetと異なる値へ変異し、他入力を固定→`Rejected(not_eligible)`、GenerationStaged追記0。 |
| `IV-K7-15` | K7-I3/RL-R4：manifest composite一致 | `stage_generation` | target/compositeを一致させ、該当manifestに`ReleaseEstablished`があると記録できる | manifest.compositeだけをgeneration.compositionと異なる値へ変異し、他入力を固定→`Rejected(not_eligible)`、GenerationStaged追記0。 |
| `IV-K7-05` | K7-I4：許可と適用の分離 | `apply_move`、`ledger_view`、`propagate` | — | `MoveRequested`の`authorization`が、(1)別のtarget、(2)別のkind/作用、(3)取り消された許可、(4)照合できない参照、の各々で、`PointerMoved`は追記されず、現行も内部デプロイの状態も変わらず、G5-I6の待ちも解消しない。K3のcurrent照合が全て肯定で、他のK7条件も成立するときだけ追記へ進む。正常は`IV-K3-11`、使用直後の変化は`IV-K3-12`で照合する |
| `IV-K7-06` | K7-I5：自動の切戻しをしない | 失敗の観測 | 失敗を観測すると`RollbackRequired`が追記され、pointerは変わらない | 失敗の観測でpointerを自動で前の世代へ動かす実装、rollbackで案件のstateを戻す実装、rollbackでincidentを閉じる実装は不合格 |
| `IV-K7-07` | K7-I6(1)：tokenの一致 | `admit_effect` | 現在の`EpochToken`と一致する作用は`Appended` | 一つずつ変える：(1)scopeだけ違う、(2)numberだけ小さい、(3)numberだけ大きい、(4)numberは同じで`entry_digest`が違う→いずれも`Rejected(fenced)`。作用の種類（K5への追記、artifactの書込み、`record`）ごとに行う |
| `IV-K7-08` | K7-I6(2)：伝播の未完 | `admit_effect` | — | 取消しの後に発行した現在の`EpochToken`を持つ作用でも、`PropagationView`が`Positive`でなければ`Rejected(revocation_pending)` |
| `IV-K7-09` | K7-I6(3)：新しい許可 | `admit_effect` | 伝播が完了し、新しい許可の記録があれば`Appended` | 伝播は完了したが新しい許可の記録が無い→`Rejected(missing_authorization)` |
| `IV-K7-10` | K7-I6：遅着観測 | `admit_effect` | 旧い`EpochToken`のCI・review・費用の観測は`LateObservation`として元のepisodeへ結ばれる | 旧い`EpochToken`の観測を作用として適用する実装は不合格 |
| `IV-G5-01` | G5-I1：受け手の全集合 | `propagate` | グラフ・`impact`・`review_set`から導いた全受け手が`applied`なら`Positive` | (1)導いた受け手の1件にreceiptが無い→`Unobserved(not_run)`、(2)導いていない受け手の`applied`を数える実装は不合格、(3)`RecipientMap`で写せないnode→`Unknown(unregistered)`、(4)受け手が0件→`set_reason` |
| `IV-G5-02` | G5-I1：グラフの非肯定を残す | `propagate` | — | 受け手Aは`applied`のまま、(1)グラフの無関係な所の`relation`だけを未登録にする→`check_graph`の成分が残り`Positive`にならない、(2)`decl.inputs`だけで取り消された記録に依存する義務が`approval_consumer`の受け手に入る、(3)`GraphRules`のcheck_graphの規則だけを新しくすると、旧の照会結果は使われない |
| `IV-G5-03` | G5-I2：状態の写像 | `propagate` | — | 1受け手ずつ`inner`を`received`→`Unobserved(pending_receipt)`、`failed`→否定。(3)`inner`に否定と`Unknown`がある→両方の成分が`{r, verifier, 検査}`付きで残る、(4)`inner`が0件→`set_reason`の成分 |
| `IV-G5-04` | G5-I2：receiptの照会 | `propagate` | `assurance`が`{r, verifier}`ごとに返る | 別fixtureで：(1)別の取消しの記録（別identity）を入力に持つ`applied`のreceipt→`Unobserved(not_run)`、(2)同じ取消しの記録の旧revisionを入力に持つreceipt（旧記録は`Value`）→`Stale`、(3)同じrevisionでdigestの違う記録→`Unknown(conflict)`、(4)別のscopeのreceipt→`Unobserved(not_run)`、(5)受け手のsegmentが`input_heads`から欠ける→`Unknown(missing_input)` |
| `IV-G5-05` | G5-I3：停止を続ける | `admit_effect` | — | `PropagationView`が`Positive`になる前に、取り消された記録に依存するscopeの作用を受理する実装は不合格（`Rejected(revocation_pending)`） |
| `IV-G5-06` | G5-I4：許可を作らない | `propagate`の消費側 | — | (1)取消しから承認・許可を出力する経路、(2)取消しを取り消して元の許可を戻す経路は不合格 |
| `IV-G5-07` | G5-I5：書き換えない | `propagate` | 取消しは新しい記録として追記され、承認の記録を入力に持つ結果は見直しの対象に入る | 取り消された記録や本文を書き換える実装は不合格 |
| `IV-G5-08` | G5-I6：内部デプロイ | `propagate`、`apply_move` | — | 現行の世代の構成が取り消された記録に依存するとき、`RollbackRequired`が追記され、`internal_deployment`は、同じmoveの`MoveAuthorizationObserved`のphase=immediateの直後checkが肯定でobserved_atが記録されcurrent receiptが成立するまで`Unobserved(not_run)`。直後観測欠落、非肯定checkと`AppliedUncertain`の各fixtureでも待ちが残り、pointerの事実と未完診断が保持される。これらや`MoveRequested`だけで待ちを解消する実装、pointerを自動で動かす実装は不合格 |
| `IV-G5-09` | G5-I1：一つのidentityに複数の種類 | `propagate` | `affected`のnode由来の種類（例：`worker_run`）と、`review_set`由来の`approval_consumer`が同じidentityに導かれると、両方の種類が保持され、種類ごとに成分ができる | 後から導いた種類で前の種類を上書きする実装は不合格 |
| `IV-G5-10` | G5-I2：受け手の現在の参照 | `propagate` | `RecipientDecl`の`SubjectRef`を基底鍵の`subject`に使う | (1)受け手のrevisionだけを新しくした宣言（旧記録は`Value`）→`Stale`、(2)同じrevisionでdigestだけ違う二つの宣言→`Unknown(conflict)`、(3)`RecipientDecl`に受け手が無い→`Unknown(missing_input)`、(4)旧いreceiptの`subject`を現在の参照に使う実装は不合格 |
| `IV-LDG-01` | 15.4：固定宣言登録 | `ledger_view` | `VersionRegistered`は`declaration: FixedRef`と正確な`declaration_digest`を持ち、固定bytesを実読し、HARNESS-L2-010/HELIXOS-L2-014の既存項目だけを導く。保存行は登録事実と参照のみ | (1)固定bytesが読めない/FixedRef.digest不一致→Unknown(unreadable)、(2)同じversionの登録declaration_digestと宣言bytesのdigestが不一致→Unknown(conflict)、(3)未登録version→Unknown(unregistered)、(4)scope受入の独立編集値や項目重複は不合格。release受入証拠はmanifestごとのReleaseEstablished.eligibilityに置き、同一release_idの異manifest digest、または同一(release_id, stage_key.key_digest)の異result_digestはUnknown(conflict)で全記録を保持する。異stage_keyでの正当な再成立は別entryとして保持する |
| `IV-LDG-02` | 15.4：書く主体 | `append` | unit/connectionの宣言行はHARNESS、compositeの宣言行はOSの所有segmentへ追記する | unit/connectionをOSが、compositeをHARNESSが書く経路は`Rejected`。VersionRegisteredは宣言ownerに従い、path名だけから登録事実を作る実装は不合格 |
| `IV-LDG-03` | 15.2/15.4：release・target・actual | `ledger_view` | `LedgerView`は既存台帳view rowsを保持し、release成立（ReleaseLog）、current generation target（PointerLog）、actual実行観測（RuntimeLog）を別fieldで返す。composite受入fieldは全量復元したReleaseLogから全manifest ref/stage_key/eligibilityを保持する。同一manifest・異stage_keyの二つの成立記録は別entryを持つValue、同一(release_id, stage_key.key_digest)でresult_digestだけ違う記録はUnknown(conflict)である。同一release_idでmanifest digestだけ違う記録もRL-R1のUnknown(conflict)。正常group Aと競合group Bが共存するとfield全体はUnknown(conflict)でA/B全記録をevidenceへ保持する。必要segmentだけ欠けるfixtureはUnknown(missing_input)、損傷だけあるfixtureはUnknown(unreadable)、両方ならunreadableで両診断を保持する。全量復元した該当証拠0件はUnobserved(not_run)で、manifest不存在を推定しない。target内でもimmediate checkとrecovery診断を区別する | PointerMovedからactual起動を出す、RuntimeObservedからtargetを出す、ReleaseEstablishedからdeploy済みを出す、またはrecoveryをimmediate完了へ流用する実装は不合格。targetの直後許可checkは同じmoveに束縛する |
| `IV-LDG-04` | 15.5：pathと登録の分離 | 配置の照合 | 宣言/台帳のidentity・owner・kindが一致し、参照先の固定bytesが読める場合だけ通る。path encodingとrecords layoutはrepository-layout L4/L9が唯一の正本 | (1)台帳未登録の型番folder→Unknown(unregistered)、(2)登録された型番のfolder/declaration.json欠落を配置照合で検出→Unknown(missing_input)（FixedRef resolverの読取不能はIV-LDG-01）、(3)folder名/pathからidentity・登録を推定する実装は不合格 |

### K10

各項目は、固定した`RelationVocab`・`GraphDecl`・`ConditionState`・`GraphRules`と、確定edgeだけの整合したグラフを用意したうえで、一つの条件だけを変える。

| ID | 対象 | 境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-K10-01` | K10-I1：語彙と端点 | `check_graph` | 語彙の型で端点のそろったedgeだけなら`Positive` | (1)語彙に無い`relation`→そのedgeが`Unknown(unregistered)`、(2)`to`がnodeに無い→`Unknown(missing_input)`、(3)edgeが0件→`set_reason` |
| `IV-K10-02` | K10-I2：候補と確定 | `build_graph`、`closure` | 承認済みの由来が宣言したedgeは`confirmed` | (1)LLMの提案のedge、(2)名称の類似だけのedge→いずれも`candidate`で、`confirmed`へ変える経路は`Rejected`。(3)`candidate`のedgeでだけつながる依存を`effective`に入れる実装は不合格 |
| `IV-K10-03` | K10-I3：性質 | `check_graph` | 性質を満たすグラフは`Positive` | (1)`symmetric`の型で逆向きのedgeが無い、(2)`inverse`の型で逆の型のedgeが無い、(3)同じ端点に`contradicts`の二つのedge→各々否定の成分。(4)循環は否定にならない |
| `IV-K10-04` | K10-I4：有効な閉包と診断 | `closure` | 必須の依存Aが`effective`で、選択されていないsource Bの依存だけがある場合、`combined`は`Positive`で、Bは`diagnostics`に`not_selected`として残る | 同じedgeで一つずつ変える：(1)Bの選択を`unknown`→`held`で`Unknown(missing_input)`（`not_selected`へ読み替える実装は不合格）、(2)`operation_condition`を`false`→`diagnostics`の`condition_false`で、成分に入らない、(3)`reference_only`→たどらず`diagnostics`に残る、(4)`transitive`が偽の型を推移的にたどる実装は不合格 |
| `IV-K10-05` | K10-I4：安全依存 | `closure` | 条件の成立した`safety`のedgeの先は`effective` | 条件の成立した`safety`のedgeの先を外す実装は不合格 |
| `IV-K10-06` | K10-I5：伝播の向き | `impact` | `A depends_on B`（`against`）でBが変わるとAが`affected`、`A affects B`（`along`）でAが変わるとBが`affected` | (1)全ての型を逆向きにたどる実装は、`affects`のBを落として不合格、(2)全ての型を順向きにたどる実装は、`depends_on`のAを落として不合格、(3)`candidate`のedgeでだけ到達するnodeは`possibly`で`affected`に入らない、(4)`held`に当たる枝の先は`Unknown(missing_input)`で「影響なし」にならない |
| `IV-K10-07` | K10-I5：条件の状態 | `impact` | — | 同じedgeの`operation_condition`を`true`／`false`／`unknown`に一つずつ変えると、先のnodeが各々`affected`／含まれない／`Unknown(missing_input)`になる |
| `IV-K10-08` | K10-I7：見直す対象 | `impact`→`review_set`→`lookup`・`evaluate` | `affected`のidentityを持つ記録と義務のexact setが返る。義務のsource・targetにDが無くても、その操作の`OperationDecl.inputs`にDがあり、`affected = [D]`なら、その義務が入る。`inputs`にDの無い操作の義務は入らない | currentの宣言を更新した後の照会で、(1)identityの集合を保った正当な新revisionで旧記録が`Value`→`Stale`、(2)同じrevisionでbytesだけ変更→`Unknown(conflict)`、(3)入力のidentityの集合の変更→`Unobserved(not_run)`、(4)旧記録が非`Value`→`Unobserved(not_run, superseded)`。(5)`affected`に無い記録を見直す実装、(6)`review_set`で記録のクラスを書き換える実装は不合格 |
| `IV-K10-09` | K10-I6：独立復旧の正常 | `independent` | 整合したグラフで、`op`からの閉包が`control_plane`を含まなければ`Positive` | — |
| `IV-K10-10` | K10-I6：グラフの不健全を引き継ぐ | `independent` | — | `control_plane`に到達しないグラフで、(1)`op`と無関係な所の未登録の`relation`、(2)欠けた端点、(3)edgeが0件、(4)`candidate`だけでつながるグラフ、の各々で、`independent`は`Positive`にならず、`check_graph`の成分（`{graph_check, …}`）が残る |
| `IV-K10-11` | K10-I6：到達と保留の共存 | `independent` | — | 閉包が`control_plane`のnodeに到達し、別の枝が`held`の場合、`combined`は否定で、`reasons`に到達の否定と`held`の`Unknown(missing_input)`の両方が入る。(2)`op`のnodeが無い、(3)`control_plane`の宣言が無い→各々`Unknown(missing_input)`の成分 |
| `IV-K10-12` | K10-I6：条件の状態 | `independent` | `op → R → control_plane`で、`R → control_plane`の`operation_condition`が`false`なら`Positive` | 同じedgeを`true`にすると否定、`unknown`にすると`Unknown(missing_input)` |
| `IV-K10-13` | 14.2：鍵と固定入力 | 照会の二段（`build_graph`の照会→`GraphRef`での下流の照会） | 記録と同じ鍵の照会は、両段とも`Value` | (1)グラフを保ってseedだけを変えた`closure`→下流の段で`Unobserved(not_run)`、(2)グラフを保って`ConditionState`だけを新revisionにした`closure`→下流の段で、旧記録が`Value`なら`Stale`。(3)`check_graph`の結果の再照会は記録と同じクラス。(4)`GraphDecl`の同じrevisionでbytesだけ変更→上流の段で`Unknown(conflict)`を返し、下流の段へ進まない、(5)edgeの由来のidentityを保った新revision（旧記録が`Value`）→上流の段で`Stale`を返し、下流へ進まない、(6)由来のidentityの追加・削除、build_graphの規則の版の更新→上流の段で`Unobserved(not_run)`、(7)上流が非`Value`なのに新しい`GraphRef`を作って下流を照会する実装は不合格、(8)グラフや結果の側から入力を採る実装は不合格 |
| `IV-K10-14` | 14.2：使う規則の束縛 | 下流の照会 | — | `GraphRef`・`ConditionState`・操作自身の規則を保ったまま、(1)check_graphの規則だけを新しくした`closure`・`impact`・`independent`の照会、(2)closureの規則だけを新しくした`independent`の照会は、各々旧の肯定の記録と完全一致せず、旧の`Value`を返さない（入力のidentityを保った新revisionなら`Stale`、版の更新でidentityが変わるなら`Unobserved(not_run)`） |

### K4・G3

各項目は、固定した`ObligationSet`（unit・connection・compositeの義務、各種別のoracleを含む）、各操作の`OperationDecl`、各義務の正しいreceiptまたは人の記録を用意したうえで、一つの条件だけを変える。他の義務は肯定に保つ。

| ID | 対象 | 境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-K4-01` | K4-I1：全集合 | `check_view` | `evaluate`の出力が集合の全`obligation_id`の成分を含めば通る | (1)1義務の成分を落とした`ObligationView`（評価器の変異）→その義務が`Unknown(missing_input)`、(2)集合に無い`obligation_id`の成分を足した`ObligationView`→`Unknown(unregistered)`、(3)`obligations`が0件の集合→`set_reason`、(4)`evaluate`へ義務の集合を渡す経路は存在しない（引数に無い） |
| `IV-K4-02` | 13.2：集合の鍵 | `restore`→`lookup` | 記録と同じ鍵の照会は`Value` | (1)由来のidentityを保った新revision（旧記録が`Value`）→`Stale`、(2)旧記録が非`Value`で(1)と同じ変更→`Unobserved(not_run, superseded)`、(3)由来の同じrevisionでbytesだけ変更→`Unknown(conflict)`、(4)規則の版の更新→`Unobserved(not_run)`、(5)規則の同じ版でbytesだけ変更→`Unknown(conflict)`、(6)由来のidentityの追加・削除→`Unobserved(not_run)` |
| `IV-K4-03` | 13.2：検証の基底鍵 | `evaluate` | 入力とscopeの違う二つの操作の義務が、各々の`OperationDecl`の基底鍵で照会される | (1)集合・targetを保ったまま、ある操作の`OperationDecl`の依存のrevisionだけを新しくし、旧依存のreceiptだけがある→その義務の成分は`Stale`。receiptの側から入力を採る実装は不合格。(2)`decls`にその操作が無い→`Unknown(missing_input)` |
| `IV-K4-04` | K4-I2：粒度の分離 | `evaluate` | — | unitの義務が全部肯定で、compositeの義務のreceiptが無い場合、compositeの成分は`Unobserved(not_run)`で、合成は`Positive`にならない |
| `IV-K4-05` | K4-I3：disposition | `evaluate` | 3fieldのそろった`NotApplicable`は除外され、3fieldのそろった`Deferred`は`Unobserved(pending_receipt)` | (1)`NotApplicable`の1fieldの欠落（3通り）、(2)`Deferred`の1fieldの欠落（3通り）→いずれも`Unknown(invalid_disposition)`。(3)`Deferred`を除外して`Positive`にする実装は不合格 |
| `IV-K4-06` | K4-I4：検証器との一致と展開 | `evaluate`→消費側 | `required_for[o]`と義務の検証器が一致すれば、義務ごとに展開される | (1)`required_for`にだけある検証器、(2)義務にだけある検証器→`Unknown(conflict)`の成分。(3)receiptの`inner`の否定と`Unknown`、(4)`inner`の`set_reason`が、いずれも`{obligation_id, verifier, 検査}`付きで消費側まで残る |
| `IV-K4-07` | K4-I4：assurance | `evaluate`→`reverify_view`→消費側 | (1)`evaluate`の直後、決定的な検証器のreceiptは`reproduction = Unobserved(not_run)`、(2)`reverify_view`で一致→`Value`、(3)LLMの検証器→`evaluate`の直後も`reverify_view`の後も`Unknown(unsupported)`、（4）`reverify_view`で不一致→`Unknown(conflict)`が、いずれも`{obligation_id, verifier}`ごとに`assurance`へ入り、`issuer_authenticity`は`Unknown(unsupported)` | `assurance`を落として`combined`だけを返す実装、(1)〜(3)を同じに扱う実装は不合格 |
| `IV-K4-08` | K4-I5：継承 | `inherit` | 旧revisionで`Positive`だった義務は継承せず、新しいreceiptから評価する | (1)旧で`Unobserved`の義務は`inherited`に結ばれ、新しいreceiptが無ければ`Unobserved(not_run)`、(2)旧の`Positive`を新revisionの肯定に流用する実装は不合格、(3)新しい集合に無い旧の未完の義務は`inherited`と`Handoff.unfinished`に残る |
| `IV-K4-09` | K4-I5：受渡し | `receive` | `Handoff.unfinished`が`from_view`から計算した未完の全`obligation_id`と一致すれば通る | (1)新しい集合にある未完の義務を1件除いた`Handoff`、(2)新しい集合に無い旧の未完の義務を1件除いた`Handoff`→いずれもその義務が`Unknown(missing_input)`。(3)未完でない義務を足した`Handoff`→`Unknown(unregistered)`。(4)`unfinished`はそのままで、`inherited`の1件だけを削除→その義務が`Unknown(missing_input)`、(5)`unfinished`はそのままで、`inherited`の1件だけを`from_view`と違う記録へ置換→`Unknown(conflict)`。(4)(5)は、新しい集合にある義務と、新しい集合に無い旧の未完義務の各々で行う |
| `IV-K4-10` | K4-I6：unknownは飛ばさない | `evaluate` | — | 1義務の成分が`Unknown`のとき、それを「対象外」として除外し`Positive`にする実装は不合格 |
| `IV-G3-01` | G3-I1：種別の固定 | `evaluate` | — | 評価の時点で義務の`oracle.kind`を変える経路は無い。種別を変えた集合は新しいrevisionで、旧結果は`Stale` |
| `IV-G3-02` | G3-I2：機械判定 | `evaluate` | 決定的な検証器のreceiptで`Mechanical`の義務を満たす | 決定的でない検証器のreceiptで満たそうとする→`Unknown(unsupported)` |
| `IV-G3-03` | G3-I3：LLMの判断 | `evaluate`→消費側 | 決定的でない検証器のreceiptで`LlmJudgment`の義務を満たし、`assurance`に`reproduction = Unknown(unsupported)`が残る | LLMの判断が`Unknown`を返した場合、その成分は肯定にならない |
| `IV-G3-04` | G3-I4：人のIF | `evaluate` | 受入を求める義務（`requires_positive`）で、同じtarget・revision・scope・判断種別の`accepted`の`HumanDecision`があれば肯定 | 一条件ずつ変える：(1)記録が無い、(2)別のtargetのidentity、(3)別のscope、(4)別の判断種別、(5)`pending`→いずれも`Unobserved(pending_receipt)`。(6)同じtargetの旧revision→`Stale`、(7)同じrevisionでdigestが違う→`Unknown(conflict)`、(8)`rejected`→否定。(9)記録だけを求める義務では`rejected`も肯定。ただし、その肯定から受入の状態を出力する経路は`Rejected`。(10)機械やLLMの`Positive`で`HumanDecision`を埋める実装は不合格、(11)由来のL3が人の記録を求めていない義務に`HumanInterface`を付けた集合は`derive`で拒否 |
| `IV-G3-05` | G3-I5：割合は情報 | 消費側 | 種別ごとの義務の数を数えられる | その数から合否・承認を出力する経路は`Rejected` |

### K9 独立reviewのL9検証案

fixtureは全体結果・component・inventoryそれぞれのK2 ResultKeyを区別して固定し、一項目ずつ変える。provider/modelはK9 predicateと入力keyに含めない。negativeは`Value(ReviewIndependence{outcome: NotIndependent, failed_axes, reason_codes})`として明示し、入力不足・source不明は`Unknown`、review未実施は`Unobserved`と区別する。**本表は文書上のoracle案で未実行。** K6 receiptの`issuer_authenticity=Unknown(unsupported)`は別assuranceに残り、実reviewerや過去実行の真正性を証明しない。

| ID | 対象 | 正常 | 反例と期待 |
|---|---|---|---|
| `IV-K9-01` | owner sourceからの参加者解決 | current OS assignment、selection owner record、actual content-producer graph、各source closureが同じtask scope/revisionで全て照合できる。resolverが参加者role slotsを導出し、creator/reviewerのaxis比較を行う | callerが`creator_slots`/`reviewer`を直接申告するAPI経路は拒否。commit metadata、publisher、provider/modelだけが与えられ登録owner sourceが無いfixtureは`Unknown(unregistered)`。caller slot直接申告は公開APIの引数型不一致として拒否し、K1結果を作らない。source ownerのorigin refに結ばれた参加者だけを使う |
| `IV-K9-02` | roster完全性とsource間照合 | registered source closureが全量を示し、OS assignment/selectionと実content-producer graphのrole/actor bindingが一致する場合だけ`completeness=Value(complete)` | (1)schema定義済みの必須owner source未登録はUnknown(unregistered)、(2)source ref欠落はUnknown(missing_input)、(3)selection unknownはUnknown(missing_input)、(4)走査契約はあるがgraph completenessを証明できないfixtureはUnknown(unsupported)。各単独caseでindependent positive 0件。(5)必要coverage evidence未着はUnknown(missing_input)でありUnobserved(pending_receipt)へ写さない。(6)登録済みcompleteなassignmentとcontent-producer graphに確定したrole差があれば、`Unknown(conflict)`に欠落/追加slotと全source差分を記録し、独立性collisionへ丸めない |
| `IV-K9-03` | selection状態 | optional support/consult/test sourceがowner記録で`not_selected`ならそのrole slotを要求せず、選択済みroleは全てcreator inventoryに含める | (1)選択記録自体が無いままslotを省くfixtureはUnknown(missing_input)。(2)selected記録が読め、登録済みcompleteなactual graphがそのslotを省くfixtureはUnknown(conflict)。(3)owner記録unknownをcallerがnot_selectedへ変えたfixtureは正本不一致のUnknown(conflict)。selection unknownのmissing_inputも診断へ保持するが、主reasonは確定conflictが不足5条件に先行する規則に従う。各source理由を保持し軸collisionとはしない。選択状態unknownなら`Unknown(missing_input)`であり、missing roleのままpositiveにしない |
| `IV-K9-04` | empty creator set | OS assignment/content-producer graphから少なくとも一つのcreator-side role slotが解決される | `creator_slots=[]`、または選択記録もoriginも無いまま比較対象0件ではK1-I4により`Unknown(missing_input)`。空集合の全称を真として`Independent`にする実装は不合格 |
| `IV-K9-05` | role-bound keyとsource実読 | creator ctx-1@r1とreviewer ctx-1@r2を左右別`source_content` aliasとして鍵に含め、binding bytesと各raw source bytesをK6で実読する。alias digestは各raw source digestと一致し、同じ比較identityなのでNotIndependent(context_collision) | 同じraw ref共有もslot/side別aliasでsameを観測。同一source identityで左右のrevision/digestが異なる変異も両alias・raw refsを保持してkeyを構成し、owner比較でNotIndependent(context_collision)を返す。同一alias identity内の異refだけkey前Rejected(missing_key, identity_ref_conflict)。役割対応だけ入替えればbinding digest/keyが変わる。raw refsをK2 inputsへ重ねて左右比較を拒否、raw content digest以外をalias digestにする、またはbinding実読だけでsource実読とする実装は不合格 |
| `IV-K9-06` | identity軸negative | reviewer identity refがcreator-sideの各slotとdistinctである | reviewerを元Worker、支援者、test author、consultant、または作成側起用subagentの各々と同一にする一変異ごとに、該当slotの`identity` check=`same`、outcome=`NotIndependent`。別publisher/commit executorで相殺しない |
| `IV-K9-07` | context軸・review target結合 | context owner contractから得たreviewer context refはcreator context refとdistinct。同時にartifact HEAD/base/task scope/oracle/current result/caseはcreator graphとreview receiptでexact一致 | (1)context refをcreatorと同じにすると`NotIndependent(context_collision)`。(2)targetの6要素それぞれについて別identity・旧revision・同revision異digestをfresh照合すると、確定不一致は全てUnknown(conflict)で比較を開始しない。保存済みValueのlookupでは同identity旧revision＋digestはStale、同revision異digestはUnknown(conflict)、identity集合差はUnobserved(not_run)と別fixtureで検査。別targetを独立contextとして受理する実装は不合格 |
| `IV-K9-08` | authority軸negative | reviewer用authority owner recordがcurrent review actionを対象にし、creator側authorityとdistinctとして解決される | owner contractで解決したauthority identityがcreatorと同一なら`NotIndependent(authority_collision)`。ref欠落は`Unknown(missing_input)`、authority契約schema未定義はUnknown(unsupported)、schema定義済みのcurrent owner record未登録はUnknown(unregistered)、記録はあるが当該作用への対応不能はUnknown(unsupported)と各単独fixtureで検査。同一authority identityのrecordでrevision/operation/target/sourceだけを変えたfixtureもNotIndependent。authority identityへの対応が未定義ならUnknown(unsupported)。creator側のdecisionやauthorityをreviewerへ継承してdistinct扱いする実装は不合格 |
| `IV-K9-09` | route/context owner契約 | context refはsession/context owner、route refはreview route ownerのcurrent contractによりparticipant slotへ結ばれる | context/routeの契約schema未定義はUnknown(unsupported)、定義済み契約のcurrent宣言未登録はUnknown(unregistered)と各単独fixtureでpositive 0件。provider/runtime/model名からrouteを補う、caller route claimだけでdistinctとする実装は不合格。route refがcreatorと同じ場合は`NotIndependent(route_collision)` |
| `IV-K9-10` | 四軸の個別collision | 各owner contractで解決した比較identityによる四軸の全比較がdistinctならoutcome=`Independent`候補。同provider/modelと別provider/modelのfixtureで四軸と対象を固定すると同じ結果になり、provider/modelをpredicateやkeyへ加えない | identity/context/authority/routeの各々を単独でsameにする4 fixtureは、他軸distinctでも対応するfailed axisを記した`NotIndependent`。複数collision時も全failed axisと対象slotを保持し、最初の一致だけで残りの観測を落とさない。same一軸＋Unknown(unsupported)別軸のfixtureはNegative/Value(NotIndependent)と全non_valuesを保持。sameなしUnknown一軸ならUndetermined/Unknown。Unknown/nullのcheckにも専用review_independence_component鍵があり、ComponentBindingRefのslot/axis/集合検査位置・current source revision・null理由を固定する。slot/axis/入力対応を一つずつ変え、元component鍵を流用できないこと、元source不存在時に架空SubjectRefや鍵なしUnknownを作らないことを確かめる。roster inventory=Unknown(conflict)で部分sourceにreviewerと同actorのslotが読めるfixtureは、inventoryのUnknown(conflict)と診断を返し、四軸比較・component合成・NotIndependent生成へ進まない。これとinventory Valueでsame＋axis Unknownを合成するfixtureを区別する。creator空集合はUnknown(missing_input)でIndependentを作らない。各軸で証拠ref/revisionだけ変え比較identityを固定したfixtureはsameを維持し、ref差だけでdistinctへ変換しない |
| `IV-K9-11` | review未実施と段階分離 | scope/sourceが有効なcandidateはidentity/version生成でき、review receipt未着は`Unobserved(pending_receipt)`の後続義務として残る | candidate作成前にreview receiptを必須化、receipt未着をsuccess/negativeへ読み替え、またはcandidate生成とreviewを一段階に畳む実装は不合格（AC-INTELLIGENCE-L3-072-08） |
| `IV-K9-12` | 同一scope evidenceの再利用 | same current exact ResultKeyへ結びついたvalidな既存review/shadow evidenceを再利用し、新Worker実験を要求しない | target、role binding、participant axis ref、owner contractまたはscopeが変わった入力で旧positiveを再利用しない。K2-I2どおり、同revision digest違いは`Unknown(conflict)`、旧Valueは`Stale`、入力identity集合変更は`Unobserved(not_run)` |
| `IV-K9-13` | K2競合と非Value | 同一key/result digestは冪等 | 同じkeyの異なるresult digestは両方保持し`Conflict`/`Unknown(conflict)`。missing inputは`Unknown(missing_input)`、未実施は`Unobserved(not_run)`、いずれもpositiveへ丸めない |
| `IV-K9-14` | receipt assuranceとauthority境界 | K9 relationとK6 `reproduction`/`issuer_authenticity`を別fieldで返す | `issuer_authenticity=Unknown(unsupported)`を真正なreviewer/過去実行の証明へ変換、K9 positiveからHARNESS総合Verified/Accepted/owner acceptanceを生成、またはindependence checkからauthorityを発行する経路はいずれも不合格 |
| `IV-K9-15` | inventory鍵と結果の再照合 | resolve_creator_inventory専用operation/K9版・subject=current assignment・target全6要素/selection/graph/closure/coverage/owner契約/code-configのinputs・task scopeでinventoryを固定し、K6 admission/current鍵が一致するときだけ使用 | operation/version/subjectと各入力/role binding/scopeを各々一つずつ変え、旧inventoryを流用しない。inventory非Valueの早期returnではreview_independence自身の鍵（inventory ref、EarlyInventoryBindingRefとtarget/既知契約）を持つUnknown、roster Unknown component一件の独自component鍵、combined=Undeterminedとそのnon_values一件を検査する。Unknownは同reason、Unobserved/Staleはmissing_input、NotApplicableはunsupportedへ写し元診断をevidenceへ残す。鍵構成不能はRejected(missing_key)。review/component/inventoryを別recordに保存してinventoryとのConflictが生じず、review鍵lookupで同じUnknownが返ることを確認。callerのplain complete値やreview_independenceの結果をinventoryとして代用しない |

copy output/finding payload偽装の真正性拒否は旧sealed brokerの保証をK9へ移植しない。K9独立性判定と、review実施側の証拠照合・K6実行起点/read-set/receiptは別検証である。K9 positiveだけから独立した証拠読取りが実施済み、またはcopy/finding偽装を検出済みとは主張しない（IV-K9-14、L4 17.5）。

#### K6/K2との整合

- `resolve_creator_inventory`と`check_review_independence`の結果はK2の`ResultKey`（operation/version/subject/inputs/scope）を持ち、K1 `Observed<T>`の`Value`/`Unknown`/`Unobserved`/`Stale`を保つ。
- K2 inputsはslot/role/axis/side付きRoleBoundSourceRefを使い、raw source refsは重ねて入れない。全raw refとrole対応はParticipantBindingSetのcanonical bytesへ固定し、K6はbinding bytesと各aliasからの元source bytesを別々に実読する。同identity異revisionの左右比較をkey前拒否へ逃がさない。
- K6-I1の実行起点receiptを使う場合も、K6-I10を維持する。issuer authenticityが未知なら実在actor/graphの真正性も未知のままである。構造上のsource closureを確認できないときはpositiveを作らない。
- `k9_independence_polarity`の識別・版でsame componentはNegative、distinct/complete/nonemptyはPositive、Unknownはnon-value。Negativeとnon_valuesの共存を保ち、全成分肯定の場合だけIndependentとする。写像を欠落・逆転したfixtureは不合格。
- caller提示assignment/selection/context契約/route契約のrefを一つずつ旧revisionへ変え、current prefixの正本を固定する。実読したcurrent refとの不一致はUnknown(conflict)で肯定しない。保存済み旧結果のlookupとは区別し、callerの古いrefを正本にする実装を検出する。さらにcaller input_headsだけを取消し前／割当変更前の末尾に固定し、resolverの内部current_headとの差を非肯定にする。古いprefixを読むだけでpositiveにする実装は不合格。
- route/context/authority owner contractが現在の入力に無いときは`Unknown`を返す。routeの存在をproviderやruntimeの同異で代替しない。

旧L9 trace：`LEGACY-ASSET-50A93B0E753DC3840E03`／`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-worker-independent-review-system-test-design.md:18-27`／`fd1bf27704c12072d56491ae66d21f9858f7275ec8c3f1a5e50714fd235eb672`。ST-WRR-003/004/006のaxis collision、同provider/modelでも三軸独立なら正常、actor自己申告・stale originを四軸とcurrent L3に合わせて再導出した。ST-WRR-002/006/007のcopy/finding payload真正性保証は上記K6境界へ委譲し、K9が保持した検出保証とはしない。ST-WRR-001のsealed capability実装、ST-WRR-008のUbuntu/AppArmor/bubblewrap経路はK9製品検証へ持ち込まない。

### K8 label遷移（SECURITY-AC-001-01）— L9結合検証設計案

本項はL4 §18のK8設計と対になる。K1 `Observed`、K2 key／lookup、K6 receipt、SECURITY `ClassificationDecl`、K3既存`PermissionCheck`、source ownerのcurrent readerの結合を照合する。各項目は設計上の正常／反例であり、L10の総合検証を実行・合格した記録ではない。旧test／runtime／CIは実行しない。

| ID | 対象 | API境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-K8-01` | K8-I1：入力出自とK2 key | `observe_input_label` → K2 `key_of` / `lookup` | sourceを`subject`に一度だけ置き、project、classification definitionとclassification operationに必要なcurrent declaration refsをinputsへ結んだ完全一致keyで分類結果を返す | source identityまたはproject identity差替えは別keyの`Unobserved(not_run)`。revision/digest更新後に旧`Value`を使えばK2どおり`Stale`。sourceをsubjectとinputsへ重複投入しない。同一identityでkind/revision/digestの異なるrefsを要する入力は`key_of`前に`Rejected(missing_key)`とし、片方を選ばない。必須field/key欠落はK1 `Unknown`やtrustedで補完しない |
| `IV-K8-02` | K8-I2/I3：分類不能とuntrusted保持 | `observe_input_label` | current定義による分類結果が`Value(classification)`でもtrustは`untrusted` | 分類不能`Unknown(indeterminate)`、source読取不能`Unknown(unreadable)`、未実施`Unobserved(not_run)`を各々与える。各結果クラスを保ちtrust=`untrusted`のまま。default classification／trusted／肯定へ変換する実装は不合格 |
| `IV-K8-03` | K8-I1：SECURITY declarationのoperation別current参照 | `observe_input_label` / `observe_authority_effect` / `validate_label_transition` | classification operationはsource/project/classification-definition/classifier sliceだけをcurrent再読し、route/effect sliceの不在にかかわらず分類する | 他条件なしでkey基盤が解決済みのfixtureを使う。classifier必須field欠落は`Rejected(missing_key)`、宣言済みclassifierの登録不在は`Unknown(unregistered)`。effect-source slice不在の`observe_authority_effect`は`Unknown(unregistered)`。selected validationでrequired route ref自体がない場合は`KeyUnavailable(Rejected(missing_key))`。classification operationまで停止する、caller supplied declaration/reader/verifierをcurrent根拠にする、または不在refを合成する実装は不合格 |
| `IV-K8-04` | K8-I5/I6：fresh validationのroute・permission・作用照合 | `validate_label_transition(case_ref, ...)` → K3 `check_permission` / K6 required result | current route verifier receipt、同じtupleへbindするK3 `PermissionCheck`、effect sourceのoccurred eventが全field一致すると`Value(Validated)` | selected validationの独立fixtureごとに期待値を固定する：実読値の確定不一致またはeffect=`none`は`Value(Mismatch{fields})`、K3 combined Negativeは`Value(Denied{source:permission_check})`、K6 combined Negativeは`Value(Denied{source:route_verification})`、dependency `Unknown(r)`はL4 reason順による単一`Unknown(r')`、dependency `Stale`またはbinding内容欠落は`Unknown(missing_input)`、required `NotApplicable`は`Unknown(missing_input)`、K3 diagnostic `invalid_query`は`Unknown(missing_input)`、K3/K6 Undeterminedは内側non-Value/set_reason展開後の単一Unknown、未実施は対応する単一`Unobserved(why)`。K2同revision異digestは`Unknown(conflict)`のまま保持する。record lookupのStaleをfresh outcomeへ混ぜず、非ValueをMismatchへ写す実装は不合格 |
| `IV-K8-05` | K8-I4：selectionと照会結果の分離 | `record_label_transition` | input bindingがnot_selectedならvalidation pointerがnullでも非nullでもNotSelected projectionであり、K1結果/鍵を作らない。非null pointerはselection不一致診断へ保持する | selectedかつcurrent key構成可能ならnull pointerでもcurrent K2 resultを返す。selectedかつ必須ref欠落なら非null pointerでもKeyUnavailable。read-only分類やK3/K6肯定から実作用を生成する実装は不合格 |
| `IV-K8-06` | K8-I6：effect sourceのcurrent再読 | `observe_authority_effect(case_ref, effect_observation_ref, input_heads)` / `record_label_transition` | fixed adapterがcase binding、SECURITY current effect-source登録、source owner current readerをfixed prefixから再読し、実読した原記録を`Observed<EffectObservation>`として返す。`none`、`event=null`、`binding=null`、binding内nullは原bytesどおり保持する | current reader未登録は`Unknown(unregistered)`、bytes読取不能は`Unknown(unreadable)`、未着は`Unobserved(not_run)`、required input/key基盤欠落は`Rejected(missing_key)`。fresh effect評価でcaller input_headsと内部current headが不一致なら現行headでkeyを作り`Unknown(missing_input)`。record projectionではcurrent lookup結果を変換せずhead不一致を`pointer_diagnostics`へ保持する。source/issuer/bindingの原事実を省略せず、caller申告値のみでObservedを肯定する実装は不合格 |
| `IV-K8-07` | K8-I6：作用済み・未検証の保全 | `validate_label_transition` / `record_label_transition(case_ref, input_heads)` | record projectionはcurrent effect lookupが`Value({outcome:"occurred", ...})`なら`observed_effect`にそのK2 resultを保持し、validation lookupを別fieldで保持する。fresh validationは別APIで評価する | fresh fixtureではroute refが存在するがeffect binding valueがnull/欠落なら`Unknown(missing_input)`、required route/permission ref自体がなくkeyを組めなければ`KeyUnavailable(Rejected(missing_key))`。record fixtureではvalidation pointerの旧Valueがcurrent key lookupで`Stale<TransitionOutcome>`となる場合その型を保持し、fresh evaluationを呼ばずに上書きしない。作用済み観測を消さない |
| `IV-K8-08` | K8-I7：ACのread-only target別negative | consumer boundary | read-only入力のeffectは`none`で、いずれのAC targetにも昇格しない | instruction、requirement、authority、persistence、learning、Agent instruction、Tool authority、memory、BRAIN、training data、security policyへのmutationをtargetごとに一つずつ与える。いずれか一つでもreadだけで昇格／`occurred`／trusted化すれば不合格 |
| `IV-K8-09` | K6：receiptはauthority/effectを作らない | K6 `required` / receipt `read` → K8 consumer | K6 `RequiredResult.combined=Positive`はroute verification componentとして保持し、receipt `authority_effect="none"`を保つ | receipt read set欠落fixtureはK6 `Unknown(missing_input)`。K6 combined Negative fixtureはfresh validation `Value(Denied{source:route_verification})`。K6 combined Undeterminedでset_reason=`Unknown(missing_input)`のみのfixtureはfresh validation `Unknown(missing_input)`。K3 permission/effectは各自の既存resultのまま保持し、receiptから生成しない |
| `IV-K8-10` | K2：revision/digestとidentity重複 | `key_of` / `lookup` | 各operationは必須sliceだけを入力にし、完全一致の共有SubjectRefはinputsで一件にdedupする。K8 RoleBound aliasは§3.4.1のsource-content digestでside/role/ref identityにより区別する | subject sourceをinputsにも重ねない。exact同一alias/refの重複は正規化で一件にする。同じalias内で同一identityのkind/revision/digestが異なるrefを与えた場合だけ`Rejected(missing_key)`。別aliasのK3 saved dependency R1とK8 current owner R2は共存し、current K3 lookupが古いValueを検出すれば`Stale`を保持する。同revisionでdigestだけ変えたK2照会は`Unknown(conflict)`、identity集合変更は`Unobserved(not_run)`。旧key結果をcurrentへ流用しない |
| `IV-K8-11` | K8-I8：汎用taint機能を追加しない | API surface / type contract | 公開面は宣言済み分類・入力label・明示route検証・実作用観測に閉じる。K8は汎用taint伝播型を設計しない | arbitrary sink graph、implicit inheritance、join/meet、declassification API、K8独自のclassification／target／permission語彙が追加された設計はscope不一致。必要論点は新要求化せず、既存SECURITY declaration、K3境界、明示route判断へ戻す |
| `IV-K8-12` | TransitionCaseとeffect binding | validate / record projection | current query keyはinput-only bindingから構成し、pointerは照会鍵や選択状態を決めない。別case/op/subject/scopeのpointerとfield欠落はpointer_diagnosticsへ保持する | selected・完全入力・null pointer・current Value(Denied)のfixtureはDeniedを返しpointer診断を添える。selected・必須ref欠落・非null pointerはKeyUnavailable。not_selected・非null pointerはNotSelectedとselection不一致診断。input binding基盤欠落/不正selectionのみAPI Rejected(missing_key)とし、current作用観測をpointer不備で消さない |
| `IV-K8-13` | K8 operation別K2 keyの正準形 | `observe_input_label` / `observe_authority_effect` / `validate_label_transition` / `record_label_transition` → K2 | 各operationのcurrent keyはL4のoperation/version/subject/scope/required-input規則で再構成する。fresh APIはcurrent入力評価を行い、record APIはそのcurrent keyでK2 `lookup`するだけである | 旧pointer keyをcurrent lookupに使わない。record lookupではoperation version/scope/subject identity集合の変更は`Unobserved(not_run)`、同じoperation/version/scope/identityでrevisionとdigestが更新し旧Valueがある場合は`Stale`、同revision異digestは`Unknown(conflict)`。selected validation fresh評価で実読値のref/binding不一致は`Value(Mismatch{fields})`、binding valueのnull/欠落は`Unknown(missing_input)`。classification/effect APIは各自のL4で定義されたResult型を保ち、validation mismatchを流用しない。classification/effect operationで必須key refが欠ければAPI `Rejected(missing_key)`、selected validationのrequired ref欠落でvalidation keyを作れなければprojection内`KeyUnavailable(Rejected(missing_key))`。InputLabelRefは分類唯一ResultRecordへ全field一致し、source refで代用しない |
| `IV-K8-14` | K8CaseBindingRefの非循環case結合 | case owner→K8 `key_of` | K8CaseBindingRef digest/revisionはinput-only case binding bytesと固定input-binding revisionに一致し、分類ResultKeyはInputLabelRef経由で含み、effect/validation result pointer keysとpointer source headは含まない | InputLabelRefを固定したままpointer keysだけを更新してもK8CaseBindingRef bytes/digest/revisionとinput-only HeadInputRefは不変。InputLabelRefまたは他のinput-only fieldの更新は対応するbinding refを更新する。全TransitionCase bytesやpointer source headをResultKey inputsへ入れる自己参照は不合格 |
| `IV-K8-15` | 確定不一致fieldの閉語彙 | validate fresh result | Mismatch.fieldsはL4 MismatchFieldの列挙順で、実際に確定した不一致fieldだけを各一回含む | 各field一つだけを変異したfixtureの期待fieldsはそのfield一件と完全一致する。二field変異はその二件だけを列挙順で返す。全fieldの無条件列挙、別名、重複、順序逆転は不合格。null比較不能はfieldsへ足さずUnknown(missing_input)候補へ保持する。ExplicitRouteRef.permission_check/API check ref差だけなら[permission_check]、route target/K3 query.target/tuple.target差だけなら[target]、owner revision_subject/K3 query.revision/tuple.revision差だけなら[revision_subject]と各々完全一致する |
| `IV-K8-16` | fresh validationの単一結果と優先順 | `validate_label_transition` fresh result | 同時条件を含むfixtureはL4 §18.4のfresh順序（API Rejected → selected KeyUnavailable / key構成可能not_selected明示照会Unobserved(not_selected) →確定Mismatch → K3 Denied → K6 Denied → Unknown → Unobserved → Validated）で一つの結果型・理由を返し、全component/assuranceは保持する | record lookupのStaleや保存済み結果のK2非Valueをfresh優先順へ投入しない。`record_label_transition`の`NotSelected`はprojectionでありfresh K1結果ではない。各優先条件単独と複合条件の期待型がL4と異なる実装は不合格 |
| `IV-K8-17` | role aliasとsource実読 | validation inputs / K6 receipt | saved R1/current R2はside/role別`source_content` aliasで共存し、alias.revision/digestは原ref.revision/digestと完全一致する。固定owner bindingがrole対応とraw SubjectRef全体を指定し、readerは原source実bytesを読みalias identityへ実digestを記録する | binding bytesだけを読んだreceiptはsource実読として受け入れない。原sourceを読んだdigestならK6-I4と一致する。同一alias内の異refだけkey前Rejected。異side/roleでraw identityが同じ・異revisionのrefは共存し、K3 current lookupが旧Valueを返せば`Stale`としてcomponentに保持する。current K3 lookupのStaleをfresh outcomeへ代入しない |
| `IV-K8-18` | case bindingの明示選択 | `observe_authority_effect(case_ref, ...)` / `validate_label_transition(case_ref, ...)` | 各APIは引数case_refのcurrent binding/scopeだけを読む。同じeffect refを持つ別caseは別binding/current keyへ結合される | case_ref欠落、またはそのcase bindingを読めない場合は`Rejected(missing_key)`。別caseから逆引きして補わず、0件/複数件の逆引きを使わない |
| `IV-K8-19` | current key再構成後のrecord lookup | `record_label_transition(case_ref, ...)` → K2 `lookup` | record APIは保存pointerでなく各operationのcurrent keyを再構成してlookupし、historical pointerのcase/operation/subject/scope不一致は`pointer_diagnostics`へだけ保持する | current operation version/scope/subject identity集合が変われば`Unobserved(not_run)`。同一operation/version/scope/identityでrevision+digestが更新し、旧Valueがあれば`Stale`。同revision異digestは`Unknown(conflict)`。pointerの古いResultKeyで旧recordを選んだりcurrent結果を消す実装は不合格 |
| `IV-K8-20` | K3/K6 assuranceとvalidation record evidence | K2 validation record / `record_label_transition` | validation operationの唯一ResultRecord.resultは`Observed<TransitionOutcome>`。components、raw refs、assuranceはそのresult evidenceが指す固定bytesから保存・復元し、current read後も元resultとassuranceを保持する | ResultRecordへ`TransitionValidation`全体を別resultとして重ねない。evidenceへ自身のResultKey/ResultRecord/result pointerを入れない。K3/K6 Value/non-Valueと全assuranceを一つずつ与えて完全保持を照合する。保存evidenceの実読失敗は`components=ValidationEvidenceUnavailable{state:evidence_unavailable,evidence_ref,reason:unreadable}`とし、K2 lookup result/evidence refを保持し、assuranceを補完しない。独立current effect lookupは保持する。issuer診断をK1/K2 result化せず、matchからauthenticityを推論しない |
| `IV-K8-21` | classification keyの間接結合と非循環性 | K8CaseBindingRef canonical bytes / K2 inputs | InputLabelRefの分類ResultKeyはK8CaseBindingRef経由でbinding digestへ反映し、effect/validation result pointer更新は反映しない | InputLabelRefを固定してeffect/validation pointerだけを変え、K8CaseBindingRef bytes/digest/revisionとinput-only HeadInputRefが不変であることを確認する。次にInputLabelRefだけを変え、対応するbinding refが更新することを確認する。分類ResultRecord keyがcase input bindingに依存する循環、pointer保存headの混入は不合格 |
| `IV-K8-22` | classification operation versionの正準化 | `observe_input_label` → K2 `key_of` / `lookup` | K8OperationVersionはclassification API contractとclassifier/schemaのcurrent contract refsを正準化し、分類keyを再構成する | classifier refのrevision更新でoperation_version/current keyが変わったとき旧結果を再利用せず`Unobserved(not_run)`。同一operation_version/scope/identityで同revision異digestなら`Unknown(conflict)`。route/effect-only declarationの欠落はclassification keyに含めず分類を止めない |
| `IV-K8-23` | observerの複合条件と主理由 | observe_input_label / observe_authority_effect | 必須key基盤が完全なら全Unknown候補を集めL4閉語彙順で一つを選ぶ | classifier未登録とsource読取不能の複合はUnknown(unreadable)、head不一致と読取不能もUnknown(unreadable)。必須key欠落と読取不能の複合はAPI Rejected(missing_key)。全候補をevidenceへ残し、入力走査順で主理由が変わる実装は不合格 |
| `IV-K8-24` | 未選択projectionとK1照会の差分 | case selection / keyed validation query | record_label_transitionはquery未発行のowner not_selectedをNotSelected projectionとして返す。同じnot_selected caseの完全なcurrent keyを構成できるvalidate_label_transition明示照会は鍵付きUnobserved(not_selected) | not_selected明示照会でcurrent validation keyの必須refを外せばAPI Rejected(missing_key)。完全keyならMismatch/Denied/Validatedへ進まない。record projectionに架空ResultKeyを作る、明示照会を鍵なしprojectionへ捨てる、成功へ写す実装は不合格 |
| `IV-K8-25` | issuer診断とK6真正性 | validation components | effect issuerは非K1のunproven診断、K6 receiptのissuer_authenticityは既存の鍵付きUnknown(unsupported)をそのまま保持する | effect sourceにK6の鍵を流用する、effect診断を鍵なしK1 Unknownへ変える、issuer一致だけでいずれかを肯定する実装は不合格 |
| `IV-K8-26` | polarity識別と版 | K1 combine consumer | HARNESS所有k8_transition_polarityとcurrent K8 validation API contractのrevision/digestを記録し、ValidatedだけPositive、Mismatch/DeniedはNegativeとする | 識別/版欠落、別ownerの写像、否定variantのPositive化を各々不合格とする |


判定はL4 K8-I1〜I8と各ケースの可観測結果の一致で行う。`Unknown`／`Unobserved`／`Stale`を成功やuntrusted解除へ縮退させない。特に作用sourceの実読結果と`validated_transition`を別々に判定し、作用済みの観測を失敗扱いで消さない。K6 receiptとK3 PermissionCheckは既存の検証・許可照合であり、どちらも実作用観測の代替ではない。

配置・release・配布・物理pathの詳細oracleは[リポジトリ構成L9](repository-layout-integration-verification.md)のIV-RL-01〜54を参照し、ここへ二重定義しない。IV-LDG-01〜04とIV-K7-03/14/15は共通カーネルへの接続、IV-K5-24〜26はraw bytes損傷条件を照合する。

## 3. 判定と戻し先

- 項目の判定はK1の型で記録する。検証器が未実装または未実行の項目は`Unobserved`であり、合格に数えない。
- 反例が通った場合の戻し先は、L4の不変条件の誤りならL4（本書の対）、機構の写像関数の誤りなら当該機構のL4（未作成の間は当該機構のL3の所有者へ所見として返す）、L3のACと矛盾する場合はL3へ戻す（HARNESS-L2-003／004）。
- 本書の項目数や合格数を、L3／L10の承認や品質の証拠にしない。

## 4. 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-84DA9FA82E710D0C5E6A`／`docs/test-design/harness/L9-integration-test-design.md:1-25`／`04e4a1473d483511c1724de7445bc8202e028e4a5c3eb749c0ccb74a98febe7a` | L9を結合のoracleの置き場とし、module・adapter・stateの境界を検証する | 旧L5境界から現行のL4↔L9へ対を合わせる。旧oracle ID・件数・実行手順は移さない（除外class `legacy_test_design_or_oracle`） | `semantic_rederive` |
| `LEGACY-ASSET-2E09592A003B32C118C1`／`docs/governance/gate-design.md:35`／`d96852613b6d04c522872f110ad78dc6b2ade4007cc5a6a8b048eba273d3a726` | G9＝L4基本設計のoracleをL9で実行する対応 | 旧のsign-off（TL提案）は採らない（L4以降は自動。L4の5章） | `semantic_rederive` |
| `LEGACY-ASSET-BB08D70A42B6445B2D1E`／`docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md:130-148`／`9e18d68b5e463192fb30b839eb164d79f7202a15374482f65181b238df8e513d` | L9の合否境界として、既存eventの書換え、同一event_idの異digest上書き、projectionとread-backの不一致、non-idempotent replay、全体scopeのdigestの流用を拒否する | causation・lane・GitHub Projectの項目は移さない。異digestは拒否でなくconflictとして両方を残す（L4 K5-I5） | `semantic_rederive` |
