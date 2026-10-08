# HELIX 共通カーネル L9結合検証設計（K1・K2）

status: draft_for_l4_review
owner: HELIX-HARNESS（L4と同じ）
paired_l4: ../L4-basic-design/common-kernel.md
base: main `f88c96cee71371fbf3742748a1c01afc1b9efa5d`

本書は[共通カーネルL4](../L4-basic-design/common-kernel.md)のK1・K2と対になる結合検証の設計の下書きである。L9は、L4の基本設計を、機構の境界をまたぐ結合の範囲で照合する（HARNESS-L2-003／004、`docs/helix-harness/L2-requirements/product-requirements.md:110`）。本書の検証項目は、L4の不変条件（`K1-I*`、`K2-I*`）を参照し、要求やL3のACを新しく作らない。L3のACの総合検証はL10の責務であり、本書はL10の代わりにならない。

本書は検証の設計であり、実行・合格の記録ではない。新世代CIは未構築であり、旧CI・旧testを実行せず、その合格を証拠にしない。試作で実行する場合は`scaffold/`に置き、Scaffold Bindingへ登録する。

## 1. 検証の範囲

結合の境界は次の三つとする。

- **機構の写像→カーネル**：各機構の状態語を`Observed<T>`へ写す関数（L4 2.5）。
- **カーネル内の合成と判定**：`combine`、`admit`、`disposition`、`key_of`、`lookup`、`record`。
- **カーネル→消費側**：ある機構の結果を、別の機構の判定（gate、昇格、適格）が受け取る境界。

## 2. 検証項目

各項目は正常と反例を持つ。反例は一つの条件だけを変える。期待は観測できる出力で書く。

### K1

| ID | 対象 | 正常 | 反例と期待 |
|---|---|---|---|
| `IV-K1-01` | K1-I1、I2：機構をまたぐ縮退 | CONNECTの互換`Value(compatible)`とHARNESSの検証`Value(pass)`を`admit`へ渡すと`Admitted` | CONNECTの`Unknown(incomparable)`、`Stale`、`Unobserved(not_selected)`をそれぞれ一つずつ渡すと、いずれも`Withheld`で、理由に該当成分が入る |
| `IV-K1-02` | K1-I3：合成で失わない | 3成分が肯定の`Value`なら肯定 | 否定の`Value`と`Unknown`を同時に含む入力で、結果が否定かつ両方の成分を返す。最初の否定で後続を捨てる実装、単一の色へ縮約する実装は不合格 |
| `IV-K1-03` | K1-I4：空集合 | 必須集合が1件以上で全成分が肯定なら肯定 | 必須集合が空、または必須集合のfieldが欠落した入力は`Unknown(missing_input)`。肯定にする実装は不合格 |
| `IV-K1-04` | K1-I5：N/Aの成立 | 理由・authority・再入条件をすべて持つ`disposition`は`NotApplicable` | 三つのいずれか一つを欠いた入力（3通り）は、それぞれ`Unknown(invalid_disposition)` |
| `IV-K1-05` | K1-I7：「無い」の確定 | 完全走査の証拠付きで0件なら`Value`（0件） | 部分走査、読取失敗の各入力は`Value`（0件）にならない |
| `IV-K1-06` | K1-I8：fail-openの限定 | 宣言付きの表示用投影は非`Value`を省略して表示してよい | その投影の出力を`admit`へ渡す経路は拒否される |
| `IV-K1-07` | 写像表（L4 2.4） | 写像表の各語が、表のクラスへ一度ずつ写る | `mismatch`・`incompatible`を`Unknown`へ、`not_observed`を`Value`へ写す実装は不合格。表に無い語は`Unknown(unsupported)`になる |

### K2

| ID | 対象 | 正常 | 反例と期待 |
|---|---|---|---|
| `IV-K2-01` | K2-I1、I2：完全一致とstale | 記録時と同じ鍵の照会は`Value` | subject、oracle、契約、設定の各入力の`digest`を一つずつ変えた照会（4通り）は、いずれも`Stale`で、`recorded_key`と`current_key`の差が変えた入力だけを示す。記録の無い鍵は`Unobserved(not_run)` |
| `IV-K2-02` | K2-I2：記録を書き換えない | staleの判定前後で記録のbytesが同じ | staleを記録の上書きで付ける実装は不合格 |
| `IV-K2-03` | K2-I3：意味revision（PO判断2） | bytesが同じ入力の照会は`Value` | 空白だけを変えた本文（意味は同じと人が読めるもの）の照会も`Stale`になる。`Value`を返す実装（backdating）は、判定器が版とdigestで固定されるまで不合格 |
| `IV-K2-04` | K2-I4：冪等な記録 | 同じ鍵・同じ結果の2回目の`record`は`NoOp` | 同じ鍵・異なる結果の2回目は`Conflict`となり、両方の記録が残る。後の記録で上書きする実装は不合格 |
| `IV-K2-05` | K2-I5：版の置換 | identityとrevision Rを指定した照会はRの記録を返す | 同じidentityの別revision R2の記録を返す実装、同じRで`digest`が違う記録を正とする実装は不合格（後者は`Unknown(conflict)`） |
| `IV-K2-06` | K2-I6：digestの型 | `sha256:`付き64桁同士で比較する | prefix無しのhex、短縮形、40桁のgit commitを`Digest`と比較する入力は型の不一致で拒否される |
| `IV-K2-07` | K2-I7：層を分けた版 | pack版の変更でrelease unit版・統合製品版・段階の版の照会は変わらない | packの昇格からrelease unitの版を昇格させる実装は不合格 |
| `IV-K2-08` | `key_of`：入力の整列 | 入力の並び順が違っても同じ`KeyDigest` | 同じidentityを二重に含む入力は拒否される |

## 3. 判定と戻し先

- 項目の判定はK1の型で記録する。検証器が未実装または未実行の項目は`Unobserved`であり、合格に数えない。
- 反例が通った場合の戻し先は、L4の不変条件の誤りならL4（本書の対）、機構の写像関数の誤りなら当該機構のL4（未作成の間は当該機構のL3の所有者へ所見として返す）、L3のACと矛盾する場合はL3へ戻す（HARNESS-L2-003／004）。
- 本書の項目数や合格数を、L3／L10の承認や品質の証拠にしない。

## 4. 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-84DA9FA82E710D0C5E6A`／`docs/test-design/harness/L9-integration-test-design.md:1-25`／`04e4a1473d483511c1724de7445bc8202e028e4a5c3eb749c0ccb74a98febe7a` | L9を結合のoracleの置き場とし、module・adapter・stateの境界を検証する | 旧L5境界から現行のL4↔L9へ対を合わせる。旧oracle ID・件数・実行手順は移さない（除外class `legacy_test_design_or_oracle`） | `semantic_rederive` |
| `LEGACY-ASSET-2E09592A003B32C118C1`／`docs/governance/gate-design.md:35`／`d96852613b6d04c522872f110ad78dc6b2ade4007cc5a6a8b048eba273d3a726` | G9＝L4基本設計のoracleをL9で実行する対応 | 旧のsign-off（TL提案）は採らない（L4以降は自動。L4の5章） | `semantic_rederive` |
