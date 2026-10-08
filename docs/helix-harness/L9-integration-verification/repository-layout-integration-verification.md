# HELIX リポジトリ構成 L9結合検証設計

status: design_pair_defined
owner: HELIX-HARNESS（L4と同じ）
paired_l4: ../L4-basic-design/repository-layout.md
base: main `66abf6bf158baebc6bfceb5ccf693d425aae41a9`

`design_pair_defined`はL4契約と対のoracleを定義した状態のみを表し、review済み・承認済み・実装済み・実行済み・合格とは同義でない。

本書は[リポジトリ構成L4](../L4-basic-design/repository-layout.md)と対になる結合検証の設計である。検証項目はL4の規則（`RL-*`）と共通カーネル（CK）の受口を参照し、要求やL3のACを新しく作らない。L3のACの総合検証はL10の責務である。

本書は検証の設計であり、実行・合格の記録ではない。新世代CIは未構築であり、旧CI・旧testを実行せず、その合格を証拠にしない。試作は`scaffold/`に置き、Scaffold Bindingへ登録する。ディレクトリ`helix/`・`declarations/`・`records/`は試作でも本repoに作らず、試作用の一時repositoryで組む。

## 1. 検証の範囲

- **宣言→台帳→配置の照合**：`declaration.json`、型番台帳（CK 15.4）、フォルダのpath、`declarations/`。
- **release→切替→実行**：ReleaseManifest、`ReleaseLog`、CK 15.2の`PointerLog`、`RuntimeLog`、`ledger_view`。
- **repo→配布**：`DistributionProfile`による投影、secret classifier（SECURITY）。
- **論理ID→物理path→K5**：`enc`、segmentのfile、CK 9.5の`read`。
- **パック→パック**：依存の宣言とK10（CK 14章）。

## 2. 検証項目

各項目は正常を一つ持ち、反例は一つの条件だけを変える。期待は一つの結果クラスで書く。一点の変異が派生値（digest、release_id、鍵）を変える場合は、fixtureで派生値を整合させ、検査の対象の成分だけが変わるようにする。複数の成分を合成する受口では、外側の結果だけでなく、対象の成分の識別とクラスを必須の出力として照合する。一点の変異が別の受口の検査にも当たる場合は、項目に対象の受口を明記し、その受口の出力だけを照合する（例：IV-RL-39）。IV-RL-21、23、53は拒否を返す反例でなく、境界値での正常（出力が変わらないこと、符号化が成功すること、完全に走査した0件が肯定になること）を確かめる項目である。

| ID | 規則 | 正常 | 一点の変異 | 期待 |
|---|---|---|---|---|
| `IV-RL-01` | RL-C1 | パックPの依存は`declaration.json`だけにある | 同じ依存の値を`declarations/`の宣言にも書く | その項目は`Unknown(conflict)` |
| `IV-RL-02` | RL-C2 | 宣言は`AC-HARNESS-L3-010-01`の項目と封筒だけを持つ | `internal_deployment_state`の項目を一つ足す | `Unknown(unregistered)` |
| `IV-RL-03` | RL-C2 | `declarations/`にパックの項目が無い | あるパックの「検証範囲」を`declarations/`へ移す | `Unknown(conflict)` |
| `IV-RL-04` | RL-C3 | `VersionRegistered`の`declaration_digest`が宣言のbytesと一致し、宣言は使える | `VersionRegistered`の行だけを除く | `Unknown(unregistered)` |
| `IV-RL-05` | RL-C3 | 同上 | 版を変えずに`declaration.json`を1byte変える | `Unknown(conflict)` |
| `IV-RL-06` | RL-C4 | フォルダ名が`enc(identity)`と一致する | フォルダ名だけを別の型番にする | `Unknown(conflict)` |
| `IV-RL-07` | RL-C4 | 機構のフォルダが宣言のowner機構と一致する | フォルダを別機構の下へ移す | `Unknown(conflict)` |
| `IV-RL-08` | RL-C4 | identityは宣言から読む | 宣言の`identity`だけを消す（フォルダ名は残す） | `Unknown(missing_input)`（フォルダ名から補わない） |
| `IV-RL-09` | RL-C5 | 台帳の全型番にフォルダと宣言がある | 登録済みの一つのフォルダを消す | `Unknown(missing_input)` |
| `IV-RL-10` | RL-C6 | 内部デプロイの状態はCKのIV-LDG-03のとおり`PointerLog`から導く | 台帳の行に内部デプロイの状態を書く | `Unknown(unregistered)`（CKのIV-LDG-01の追加項目と同じ判定） |
| `IV-RL-11` | RL-R1 | manifestの再読でdigestが一致する | 同じ`release_id`で`artifacts`の1件を変えたmanifestを置く | `Unknown(conflict)` |
| `IV-RL-12` | RL-R2 | `eligibility.combined = Positive`で`ReleaseEstablished`を追記できる | 必要な検証器のreceiptを一つ除く | `Rejected`（追記されない） |
| `IV-RL-13` | RL-R3 | 起動前の再計算で成果物のdigestが一致する | 成果物の1byteを変える | `Unknown(conflict)` |
| `IV-RL-14` | RL-R4 | `ReleaseEstablished`済みのmanifestを指す`GenerationStaged`は追記できる | `ReleaseEstablished`の無いmanifestを指す | `Rejected(not_eligible)` |
| `IV-RL-15` | RL-R5 | `PointerMoved`と`RuntimeObserved(healthy)`があれば三つのfieldがそれぞれ値を持つ | `RuntimeObserved`だけを除く | 実行のfieldは`Unobserved(not_run)`（現行の世代のfieldは変わらない） |
| `IV-RL-16` | RL-R5 | 同上 | 観測を`unhealthy`にする | `Appended(RollbackRequired)`で、pointerは動かない |
| `IV-RL-17` | RL-R6 | rollbackの前後で案件state・recordのdigestが同じで、成果物は移動先のmanifestのものになる | 移動先の`data format`を現在の案件dataと非互換と宣言する | `Rejected(not_eligible)` |
| `IV-RL-18` | RL-R8 | repositoryを置かない環境で、成果物ストアと宣言済みの依存だけから起動・復旧する | manifestの成果物の参照先の一つをrepository内のpathにする | `Unknown(conflict)`（証拠に`tree_reference`） |
| `IV-RL-19` | RL-V2 | `fixtures/`の合成dataがsecret classifierを通る | fixtureに合成のcredential形式の値を一つ入れる | `Rejected`（SECURITYの分類器の判定） |
| `IV-RL-20` | RL-V5 | `include`の閉包に除外の型番が無く、投影が成果物の集合を返す | 閉包にLABOの型番を一つ依存として加える | `Unknown(conflict)`（投影を止める） |
| `IV-RL-21` | RL-V4 | 投影の出力は`include`の閉包のmanifestの成果物と一致する | 許可したパックのフォルダに、manifestに無いfileを一つ足す | 出力は変わらない（path globで拾わない）（境界値の正常） |
| `IV-RL-22` | 6.1 | `Ab`と`ab`が`_41b`と`ab`になり、大文字小文字を区別しないFSでも別file | 入力をNFDの文字列にする | `Rejected(invalid_id)` |
| `IV-RL-23` | 6.1 | `con`が`_63on`、80byteの結果はそのまま | 結果を81byteにする | `_h`＋64桁の形になり、内容から論理IDを戻せる（境界値の正常） |
| `IV-RL-24` | RL-P1 | segmentのpathが内容の`enc(log_id)`・`enc(writer)`と一致する | segmentを別writerのdirectoryへ移す | `Unknown(conflict)` |
| `IV-RL-25` | RL-P2 | 全pathの大文字小文字を畳んだ値が一意 | 大文字を小文字にそのまま写す（`_xx`にしない）`enc`の変異で`A`と`a`のlogを作る | `Unknown(conflict)`（新しい書込みは`Rejected`） |
| `IV-RL-26` | RL-P3 | 各行の実bytesが`canonical_json(LogEntry)`＋LF一つと一致する | 1行の改行だけをCRLFへ変換する（解析後の値と`entry_digest`は変わらない） | `Unknown(unreadable)`（RL-P3の読取り条件。CK K5-I3(h)に対応） |
| `IV-RL-27` | RL-P4 | base側のbytesがhead側の先頭と一致するcommit | 途中の行の1byteを変えるcommit | `Rejected` |
| `IV-RL-28` | RL-P5 | 二つのbranchが別writerのsegmentへ追記し、両方が入る | 二つのbranchが同じsegmentへ`seq=n+1`を追記し、両方の行を残してmergeする | `Unknown(unreadable)`（CK K5-I3(d)の重複） |
| `IV-RL-29` | RL-P6 | repo外に固定した`SegmentHead`で末尾までを確かめる | 履歴を書き換えて末尾の1行を消す | `Unknown(unreadable)`（CK K5-I3(g)）。固定したheadを持たない読み手では検出できないことも記録する |
| `IV-RL-30` | RL-P7 | `PointerLog`は`store: stage`で、置き場が排他の追記を提供する | `PointerLog`の`LogDecl`を`store: repository`にする | `Rejected`（宣言を受け入れない） |
| `IV-RL-31` | RL-P8 | `records/`の各directoryに`store: repository`の`LogDecl`がある | 宣言の無いdirectoryを一つ足す | `Unknown(unregistered)` |
| `IV-RL-32` | RL-P9 | `store: stage`の実体を`{store, locator, digest}`で読める | 実体の1byteを変える | `Unknown(unreadable)` |
| `IV-RL-33` | RL-D1 | 宣言した依存だけを実行時に使う | 宣言に無い他パックを一つ呼ぶ | 依存の検査は`Negative`（`AC-HARNESS-L3-010-01`の不合格） |
| `IV-RL-34` | RL-D2 | OSのunitがHARNESSのunitをconnection経由で使う。共通カーネルのパックへの直接の依存は通る | connectionを外して直接依存にする | `Negative` |
| `IV-RL-35` | RL-D3 | `helix/`のコードは宣言を`FixedRef`の入力で受ける | 実行時に`docs/`のpathを一つ直接読む | `Negative` |
| `IV-RL-36` | RL-D5 | 正式なパックの依存に`scaffold/`が無い | `scaffold/`の部品を一つ依存に加える | `Negative` |
| `IV-RL-37` | RL-T1 | unit・connection・compositeの各`tests/`の結果が別に記録される | unitの`tests/`を除き、compositeの検証だけを通す | unitの義務は`Unobserved(not_run)`（上位の合格から導かない） |
| `IV-RL-38` | RL-P3 | 各行の実bytesが`canonical_json(LogEntry)`＋LF一つと一致する | 1行のJSONのkeyの順だけをcanonicalでない順にする（値は同じ） | `Unknown(unreadable)` |
| `IV-RL-39` | RL-C2（`check_decl_items`へ単独で与える） | OS所有のcompositeの`declaration.json`が封筒・識別項目（identity、版、owner＝OS）・構成項目だけを持ち、bytesのdigestが`VersionRegistered`と一致し、`helix/helix-os/composites/<enc(identity)>/`に置かれ、C2・C3・C4をすべて通る | 別fixtureとして、識別項目の`owner`だけを除いた宣言を作り、そのbytesのdigestで`VersionRegistered`を登録し直す（登録digestを固定したままの変更の拒否はIV-RL-05で扱う） | `check_decl_items`の出力で、成分`{C2, owner}`が`Unknown(missing_input)`。C4の照合もownerが無いため成立しないが、本項はC2の受口の出力だけを照合する（pathから補わない） |
| `IV-RL-40` | RL-C2（C3・C4は通す） | 同上 | IV-RL-39と同じく、構成項目の`data format`だけを除いた宣言のbytesで登録し直す | `Unknown(missing_input)`（RL-C2） |
| `IV-RL-41` | RL-R2(d)、G8-I5 | 変異後のmanifest M′について、(a)M′の`stage_key`のstage receipt、(b)変えた成果物X′の`build_chain`（X′と同じrevision・digestの項目を持つBuildManifestを用意）、(c)X′のbytesを、いずれも肯定にしたfixture。X′と同じidentityの旧revisionのXには、実行物の検証のreceiptだけがある | 成果物の`ArtifactRef`の`revision`だけを替える（identity・digestは同じ。release_id・`stage_key`の変化は派生として上のfixtureで整合させる） | `required`の出力で、成分`{d, X′}`が`Stale`、他の成分は肯定（外側の`ReleaseEstablished`は`Rejected`）。(d)を省く実装はこの成分を出せず不合格 |
| `IV-RL-42` | RL-R2(b)、G8-I2 | 変異後のmanifest M″について、(a)stage receipt、(c)bytes、(d)別identityの成果物Yを`subject`とする実行物の検証のreceiptを、いずれも肯定にしたfixture | 一つの成果物を、bytesとdigestが自己整合した別identityの`ArtifactRef` Yに替える（Yを作ったbuildの項目は置かない） | `required`の出力で、成分`{b, Y}`が`Unobserved(not_run)`、他の成分は肯定（外側は`Rejected`）。(b)を省く実装は不合格 |
| `IV-RL-43` | RL-R2 | 読み手が導き直した`stage_key`が記録と一致する | 記録の`stage_key`の`subject`だけをcompositeの`SubjectRef`にする | `Unknown(conflict)` |
| `IV-RL-44` | 4.1 stage_key | 宣言の役割とmanifestのfieldが一対一 | manifestから`rollback`だけを除く | `Unknown(missing_input)` |
| `IV-RL-45` | RL-C7 | 宣言の参照するACのdigestが、指すrevisionの`docs/`のbytesと一致する | `docs/`の文書を1byte変え、宣言の参照digestは変えない | `Unknown(conflict)`（宣言の側の写しを使わない） |
| `IV-RL-46` | RL-R7 | 現行の世代とrollback先の世代の成果物が成果物ストアにある | rollback先の世代の成果物を一つ消す | 保持の検査は`Unknown(missing_input)` |
| `IV-RL-47` | RL-V3 | 分類記録のある資産は記録どおりの分類を返す | repo内の一つの資産の分類記録だけを除く | `Unknown(missing_input)`（publicとしない） |
| `IV-RL-48` | RL-V6 | `include`の閉包の成果物だけが投影される | `include`を空にする（repoはpublicのまま） | `Unknown(missing_input)`（CK K1-I4。全体を投影しない） |
| `IV-RL-49` | RL-T2 | `tests/`が参照する検証設計の項目IDが、指すrevisionの`docs/`にある | 参照する項目IDを`docs/`に無いIDへ替える | `Unknown(missing_input)` |
| `IV-RL-52` | RL-T2（複製） | `tests/`は有効な項目IDだけを参照し、`check_design_copy`は全単位の成分と走査の完全性の成分が肯定で`Positive` | 有効なID参照を保ったまま、L9のある項目の表の行（正常・変異の欄）を正規化後に同じ文字列としてtestのコメントに加える | その単位の成分が否定の`Value`で、`check_design_copy`は`Negative` |
| `IV-RL-53` | RL-T2（0件） | 同上 | `tests/`のコメント・文字列literalを0件にする（fileは残し、完全に走査できる） | `Positive`（境界値の正常。完全性の成分が肯定で、各単位は一致なし） |
| `IV-RL-54` | RL-T2（走査） | 同上 | `tests/`の一つのfileを読めなくする | 完全性の成分が`Unknown(unreadable)`で、`check_design_copy`は`Undetermined` |
| `IV-RL-50` | RL-K1 | rootのfileが9.2の一覧と理由の追記に一致する | 理由の追記の無いroot fileを一つ足す | `Negative` |
| `IV-RL-51` | RL-K2 | 開発・実行・検証・配布のsurfaceにBunの参照が無い | 一つの設定にBunのlockまたはcommandを足す | `Negative`（`HELIXOS-L2-132`の003） |

L4の規則のうち、次は独立の反例を置かず、対応を示す。

- RL-V1：repositoryのvisibilityはGitHubの設定で、パックや記録の結合の境界ではない。本書は構成判断のとおり設定を変えず、観測もしないため範囲外とする。
- RL-D4：影響範囲はCKのIV-K10-04〜08で検証する。循環を否定にしないことはIV-K10-03の期待のとおりで、本書は循環の反例を置かない。
- RL-T3：fixtureの合成dataはIV-RL-19（secret classifier）で検証する。案件dataの混入の判定もSECURITYの同じ分類器による。
- RL-K3：ツールチェーンがL5〜L6で未決であり、パックに閉じる設定がまだ無いため範囲外とする。設定が生じた層の対の検証で扱う。

## 3. 判定と戻し先

- 判定はK1の型で記録する。検証器が未実装・未実行の項目は`Unobserved`であり、合格に数えない。
- 反例が通った場合、規則の誤りならL4（本書の対）、CKの型・受口の誤りならCK（共通カーネルL4の10章の反映事項を含む）、L3のACと矛盾すればL3へ戻す（HARNESS-L2-003／004）。IV-RL-19の分類の誤りはSECURITYの分類器の所有者へ戻す。
- 本書の項目数や合格数を、L3／L10の承認や品質の証拠にしない。

## 4. 旧HELIXとの対応

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-A2F6A697D7FFFD490B57`／`docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:88-93`／`336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c` | path traversal、symlink、duplicate／case collisionを実行前の静的検査で拒否し、静的な失敗を実行の成功で相殺しない | 対象をartifactから論理IDの符号化とrecordsへ広げる（IV-RL-22〜25） | `semantic_rederive` |
| `LEGACY-ASSET-9FD4DE252D3C27F88915`／`docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md:27-32`／`05bcaccb027a0e7bd9e82444751c961de8ac2b3102867cb5c7ba3b6babd34230` | 1byteの差替え、別HEADを展開・起動の前に拒否する | Linux／Windows smokeは移さない（IV-RL-13、18） | `semantic_rederive` |
| `LEGACY-ASSET-809B35B3C91567A97AF5`／`docs/design/harness/L5-detailed-design/source-boundary-architecture.md:53-57`／`6bee024905701ca99ccd09e2a357e3b91fbf5370e4118630cfb1da5119d07610` | 未宣言の向きを`unspecified`としてfail-closeする | 判定をパックの宣言とK10へ置く（IV-RL-33〜36） | `semantic_rederive` |
