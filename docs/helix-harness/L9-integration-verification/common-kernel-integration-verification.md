# HELIX 共通カーネル L9結合検証設計（K1・K2・K5・K6）

status: draft_for_l4_review
owner: HELIX-HARNESS（L4と同じ）
paired_l4: ../L4-basic-design/common-kernel.md
base: main `3d2f78ce4ed11fa07d987fffa3632b20b0f7c51d`（引用した本文のSHA-256は`f88c96ce`で固定した。付録A。`f88c96ce`から`3d2f78ce`までに引用した本文は変わっていない）

本書は[共通カーネルL4](../L4-basic-design/common-kernel.md)のK1・K2・K5・K6と対になる結合検証の設計の下書きである。L9は、L4の基本設計を、機構の境界をまたぐ結合の範囲で照合する（HARNESS-L2-003／004、`docs/helix-harness/L2-requirements/product-requirements.md:110`）。本書の検証項目は、L4の不変条件（`K1-I*`、`K2-I*`）を参照し、要求やL3のACを新しく作らない。L3のACの総合検証はL10の責務であり、本書はL10の代わりにならない。

本書は検証の設計であり、実行・合格の記録ではない。新世代CIは未構築であり、旧CI・旧testを実行せず、その合格を証拠にしない。試作で実行する場合は`scaffold/`に置き、Scaffold Bindingへ登録する。

## 1. 検証の範囲

結合の境界は次の三つとする。

- **機構の写像→カーネル**：各機構の状態語を`Observed<T>`へ写す関数（L4 2.5）。
- **カーネル内の合成と判定**：`combine`、`admit`、`disposition`、`key_of`、`lookup`、`record`。
- **正本とprojection**（K5、L4 9章）：`append`、`current_head`、`read`、`restore`、`project`、`verify`。K2の`record`はsegmentへの追記、`lookup`の記録集合はprojectionとして通す。
- **検証receipt**（K6、L4 10章）：`run`、`admit_receipt`、`reverify`、`required`。receiptはK2の記録としてK5のlogへ置き、`restore`→`lookup`を通して照会する。
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
| `IV-K1-06` | K1-I4：有効な判定成分0件 | 必須集合が1件以上で全成分が肯定なら`Positive` | (a)成分0件、(b)成立した`NotApplicable`1件だけ、(c)成立した`NotApplicable`3件だけ、の3経路で、いずれも`verdict = Undetermined`、`set_reason = Unknown(missing_input)`、`admit`の`reasons`は`{whole, Unknown, missing_input}`の1件で空でない。`Positive`にする実装、理由0件の`Withheld`を返す実装は不合格 |
| `IV-K1-07` | K1-I5：N/Aの成立 | 理由・authority・再入条件をすべて持つ`disposition`は`NotApplicable`となり、`excluded`に入る | 三つのいずれか一つを欠いた入力（3通り）は、それぞれ`Unknown(invalid_disposition)`として`non_values`に入る |
| `IV-K1-08` | K1-I6：鍵全体の欠落 | 鍵の完全な各クラスの成分は、`combine`が受理し、`lookup`の結果として返せる。`record`は`Value`・`Unknown`・`Unobserved`・`NotApplicable`を受理する（`Stale`の`record`は鍵と無関係に`stale_not_recordable`で拒否される。IV-K2-11で別に照合し、本項の`missing_key`と区別する） | 5クラスそれぞれの鍵を欠いた成分を、`combine`（`Observed[]`）へ、また鍵を欠いた`key`を`record`へ、鍵を欠いた`query_key`を`lookup`へ渡すと、いずれも`missing_key`で拒否され、成分に数えられない。`Unknown`や`Unobserved`へ読み替えて先へ渡す実装は不合格 |
| `IV-K1-09` | K1-I7：「無い」の確定 | 完全走査の証拠付きで0件なら`Value`（0件） | 部分走査、読取失敗の各入力は`Value`（0件）にならない |
| `IV-K1-10` | K1-I8：fail-openの限定 | 宣言付きの表示用投影は非`Value`を省略して表示してよい | その投影の出力を`combine`へ渡す経路は拒否される |
| `IV-K1-11` | 写像表（L4 2.4） | 写像表の各語が、表のクラスへ一度ずつ写る | `mismatch`・`incompatible`を`Unknown`へ、`not_observed`を`Value`へ写す実装は不合格。表に無い語は`Unknown(unsupported)`になる |
| `IV-K1-12` | K1-I6：鍵のfieldの単独欠落 | 全fieldのある鍵は受理される | `ResultKey`の`operation`、`operation_version`、`subject`、`inputs`、`scope`、`subject`の`kind`・`identity`・`revision`・`digest`、入力1件の`kind`・`identity`・`revision`・`digest`を一つずつ欠いた13fixtureを、`combine`の成分の鍵、`record`の`key`、`lookup`の`query_key`の3境界へ渡すと、いずれも`missing_key`で拒否される（13×3） |
| `IV-K1-13` | K1-I6：`admit`境界の鍵検査 | `combine`が作った鍵の完全な`Combined`は`admit`で判定される | `combine`を経ずに作った判定`Positive`の`Combined`で、成分1件の鍵全体を欠いたものと、その成分の鍵からIV-K1-12と同じ13fieldを一つずつ欠いた13fixture（`scope`、`subject`の`digest`等を含む）を`admit`へ直接渡すと、いずれも`missing_key`で拒否され、`Admitted`にも通常の`Withheld`にもならない（1＋13） |

### K2

IV-K2-01〜17は一つの記録を置いた後に照会の鍵を一か所だけ変え、IV-K2-18〜20は複数の記録を置く。fixtureを分け、同じ反例を複数の期待で照合しない。

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
| `IV-K2-13` | K2-I6：digestの型 | `sha256:`付き64桁同士で比較する | prefix無しのhex、短縮形、40桁のgit commitを`Digest`と比較する入力は型の不一致で拒否される |
| `IV-K2-14` | K2-I7：層を分けた版 | pack版の変更でrelease unit版・統合製品版・段階の版の照会は変わらない | packの昇格からrelease unitの版を昇格させる実装は不合格 |
| `IV-K2-15` | `key_of`：入力の整列 | 入力の並び順が違っても同じ`KeyDigest` | 同じidentityを二重に含む入力は拒否される |
| `IV-K2-16` | K2-I2の2(b)：`kind`の単独変更 | — | `subject`の`kind`だけを変えた照会と、入力1件の`kind`だけを変えた照会は、いずれも`Unknown(conflict)`。`kind`を比べずに記録の値を返す実装は不合格 |
| `IV-K2-17` | K2-I2の1：`identity`の単独変更 | — | `subject`の`identity`だけを変えた照会と、入力の件数を保ったまま1件の`identity`を別のidentityへ置き換えた照会は、いずれも`Unobserved(not_run)` |
| `IV-K2-18` | K2-I2の3：旧revision＋完全一致 | 旧R1の`Value`とR2の`Value`の2記録があり、照会がR2のとき、R2の`Value`を返す。旧R1の`Unknown`とR2の`Value`でも同じ | R1の`Stale`を返す実装、追記順だけで選ぶ実装は不合格 |
| `IV-K2-19` | K2-I2の2：完全一致＋同revision競合 | — | 照会と完全一致する`Value`の記録と、同じrevisionで`digest`の違う記録の2件があるとき、`Unknown(conflict)`。完全一致の`Value`を返す実装は不合格 |
| `IV-K2-20` | K2-I2の4：旧revisionだけの複数記録 | — | 旧R0の`Value`と旧R1の`Value`だけがあり照会がR2のとき、追記順で最後の記録を`prior`とする`Stale`。旧R1が`Unknown`なら`Unobserved(not_run, superseded = R1の記録)` |

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
