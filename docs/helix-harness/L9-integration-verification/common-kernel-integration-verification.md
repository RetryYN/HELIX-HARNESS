# HELIX 共通カーネル L9結合検証設計（K1・K2・K5）

status: draft_for_l4_review
owner: HELIX-HARNESS（L4と同じ）
paired_l4: ../L4-basic-design/common-kernel.md
base: main `3d2f78ce4ed11fa07d987fffa3632b20b0f7c51d`（引用した本文のSHA-256は`f88c96ce`で固定した。付録A。`f88c96ce`から`3d2f78ce`までに引用した本文は変わっていない）

本書は[共通カーネルL4](../L4-basic-design/common-kernel.md)のK1・K2・K5と対になる結合検証の設計の下書きである。L9は、L4の基本設計を、機構の境界をまたぐ結合の範囲で照合する（HARNESS-L2-003／004、`docs/helix-harness/L2-requirements/product-requirements.md:110`）。本書の検証項目は、L4の不変条件（`K1-I*`、`K2-I*`）を参照し、要求やL3のACを新しく作らない。L3のACの総合検証はL10の責務であり、本書はL10の代わりにならない。

本書は検証の設計であり、実行・合格の記録ではない。新世代CIは未構築であり、旧CI・旧testを実行せず、その合格を証拠にしない。試作で実行する場合は`scaffold/`に置き、Scaffold Bindingへ登録する。

## 1. 検証の範囲

結合の境界は次の三つとする。

- **機構の写像→カーネル**：各機構の状態語を`Observed<T>`へ写す関数（L4 2.5）。
- **カーネル内の合成と判定**：`combine`、`admit`、`disposition`、`key_of`、`lookup`、`record`。
- **正本とprojection**（K5、L4 9章）：`append`、`read`、`project`、`verify`。K2の`record`はsegmentへの追記、`lookup`の記録集合はprojectionとして通す。
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

各項目は、損傷の無いsegmentを用意したうえで、一か所だけを変える。「境界」欄は変異を与える受け口である。複数segmentの項目（IV-K5-09〜11）は、segmentの組を明記する。

| ID | 対象 | 境界 | 正常 | 反例と期待 |
|---|---|---|---|---|
| `IV-K5-01` | K5-I1：既存行の変更 | `read` | 既知の`SegmentHead`と一致するsegmentは`Value` | 既存の1行のbytesを1byte変えたもの、1行を削除したもの、隣り合う2行を入れ替えたもの（3fixture）は、いずれも`Unknown(unreadable)`で、損傷の種類が別々に記録される |
| `IV-K5-02` | K5-I2：連鎖の各field | `read` | — | `seq`の欠番、`seq`の重複、`prev_digest`の不一致、`entry_digest`の不一致、解析できない行、未知の`schema_version`（6fixture）は、いずれも`Unknown(unreadable)`。損傷より前の行だけを返して`Value`にする実装は不合格 |
| `IV-K5-03` | K5-I3：既知の末尾との比較 | `read` | 既知の末尾より長く、既知の末尾までが一致するsegmentは`Value` | 既知の末尾より短いsegmentと、既知の末尾と同じ`seq`で`entry_digest`が違うsegmentは、いずれも`Unknown(unreadable)` |
| `IV-K5-04` | K5-I4：冪等な追記 | `append` | 同じ`key_digest`・同じ`result_digest`の2回目は`NoOp`で、segmentの行数が変わらない | 同じ`key_digest`・異なる`result_digest`の2回目は`Conflict`で、`ResultRecorded`と`ResultConflictDetected`が追記され、前の行のbytesが変わらない |
| `IV-K5-05` | 9.5：追記の受け口 | `append` | writerが一致し、鍵の完全なeventは`Appended` | writerの不一致、K2の鍵のfieldを一つ欠いたevent、存在しない`target`を指す`Correction`（3fixture）は、いずれも`Rejected`で、segmentが変わらない |
| `IV-K5-06` | K5-I1：訂正 | `append`→`project` | `Correction`を追記すると、元の行は残り、projectionは訂正後の値を返す | 元の行を書き換えて訂正する実装は、`IV-K5-01`の損傷として検出される |
| `IV-K5-07` | K5-I5：一つの問いは一つのlog | `append` | 宣言したlogへの追記は受理される | 同じ`operation`の結果を、宣言と別のlogへ追記すると`Rejected` |
| `IV-K5-08` | K5-I7：書き戻しの禁止 | `project`、`append` | — | projectionの出力をeventとして`append`する経路、projectionの出力を`record`へ渡す経路は、いずれも`Rejected` |
| `IV-K5-09` | K5-I8：決定的な再構築 | `project` | segment A・Bの組で、行の読込み順とsegmentの並び順を変えた3通りの入力が、同じ`output_digest`になる | 読込み順でprojectionが変わる実装は不合格 |
| `IV-K5-10` | K5-I6、K2-I2b：segmentをまたぐ順序 | `project`→`lookup` | 旧revisionの`Value`がsegment AとBに1件ずつあり、照会が新revisionのとき、`(segment, seq)`の辞書順で最後の記録を`prior`とする`Stale`が、入力の並び順によらず同じになる | 時刻のfieldや読込み順で`prior`を選ぶ実装は不合格 |
| `IV-K5-11` | K5-I9：全量の前提 | `project` | segment A・Bを損傷なく読めた場合、「0件」「閉じた」を出せる | Bが損傷している場合と、Bが`input_heads`に含まれるのに読めない場合は、いずれもprojectionが`Unknown(unreadable)`で、Aだけから「0件」「閉じた」を出さない。close済みの項目が、部分読取りで再びopenとして出る実装は不合格 |
| `IV-K5-12` | K5-I10：projectionの鮮度 | `lookup` | 同じ`input_heads`と`projector`の照会は保存したprojectionを返す | segmentに1行追記した照会、projectorの`version`を変えた照会は、K2-I2により`Stale`または`Unobserved(not_run)`。影響を受けないsegmentだけを`input_heads`とするprojectionは`Value`のまま |
| `IV-K5-13` | K5-I11：checkpoint | `verify` | checkpointからの差分の畳込みが全量の再構築と同じ`output_digest`なら、checkpointを使える | 差分の畳込みが全量と違う`output_digest`を返すcheckpointは`Unknown(conflict)`で、使われない |
| `IV-K5-14` | K5-I12：ドリフト | `verify` | 保存したprojectionが再構築と一致すれば`Value` | 保存したprojectionの`output`を1か所変えたものは`Unknown(conflict)`。projectorの版が違う二つのprojectionの差は`Unknown(conflict)`にならず、IV-K5-12の扱いになる |

## 3. 判定と戻し先

- 項目の判定はK1の型で記録する。検証器が未実装または未実行の項目は`Unobserved`であり、合格に数えない。
- 反例が通った場合の戻し先は、L4の不変条件の誤りならL4（本書の対）、機構の写像関数の誤りなら当該機構のL4（未作成の間は当該機構のL3の所有者へ所見として返す）、L3のACと矛盾する場合はL3へ戻す（HARNESS-L2-003／004）。
- 本書の項目数や合格数を、L3／L10の承認や品質の証拠にしない。

## 4. 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-84DA9FA82E710D0C5E6A`／`docs/test-design/harness/L9-integration-test-design.md:1-25`／`04e4a1473d483511c1724de7445bc8202e028e4a5c3eb749c0ccb74a98febe7a` | L9を結合のoracleの置き場とし、module・adapter・stateの境界を検証する | 旧L5境界から現行のL4↔L9へ対を合わせる。旧oracle ID・件数・実行手順は移さない（除外class `legacy_test_design_or_oracle`） | `semantic_rederive` |
| `LEGACY-ASSET-2E09592A003B32C118C1`／`docs/governance/gate-design.md:35`／`d96852613b6d04c522872f110ad78dc6b2ade4007cc5a6a8b048eba273d3a726` | G9＝L4基本設計のoracleをL9で実行する対応 | 旧のsign-off（TL提案）は採らない（L4以降は自動。L4の5章） | `semantic_rederive` |
| `LEGACY-ASSET-BB08D70A42B6445B2D1E`／`docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md:130-148`／`9e18d68b5e463192fb30b839eb164d79f7202a15374482f65181b238df8e513d` | L9の合否境界として、既存eventの書換え、同一event_idの異digest上書き、projectionとread-backの不一致、non-idempotent replay、全体scopeのdigestの流用を拒否する | causation・lane・GitHub Projectの項目は移さない。異digestは拒否でなくconflictとして両方を残す（L4 K5-I4） | `semantic_rederive` |
