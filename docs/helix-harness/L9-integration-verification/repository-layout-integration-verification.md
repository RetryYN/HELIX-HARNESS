# HELIX リポジトリ構成 L9結合検証設計

status: draft_for_l4_review
owner: HELIX-HARNESS（L4と同じ）
paired_l4: ../L4-basic-design/repository-layout.md
base: main `7fac0cbf0b42532c08dbb08684f586c7481c05c0`

本書は[リポジトリ構成L4](../L4-basic-design/repository-layout.md)と対になる結合検証の設計の下書きである。検証項目はL4の規則（`RL-*`）と共通カーネル（CK）の受口を参照し、要求やL3のACを新しく作らない。L3のACの総合検証はL10の責務である。

本書は検証の設計であり、実行・合格の記録ではない。新世代CIは未構築であり、旧CI・旧testを実行せず、その合格を証拠にしない。試作は`scaffold/`に置き、Scaffold Bindingへ登録する。ディレクトリ`helix/`・`declarations/`・`records/`は試作でも本repoに作らず、試作用の一時repositoryで組む。

## 1. 検証の範囲

- **宣言→台帳→配置の照合**：`declaration.json`、型番台帳（CK 15.4）、フォルダのpath、`declarations/`。
- **release→切替→実行**：ReleaseManifest、`ReleaseLog`、CK 15.2の`PointerLog`、`RuntimeLog`、`ledger_view`。
- **repo→配布**：`DistributionProfile`による投影、secret classifier（SECURITY）。
- **論理ID→物理path→K5**：`enc`、segmentのfile、CK 9.5の`read`。
- **パック→パック**：依存の宣言とK10（CK 14章）。

## 2. 検証項目

各項目は正常を一つ持ち、反例は一つの条件だけを変える。期待は一つの結果クラスで書く。

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
| `IV-RL-21` | RL-V4 | 投影の出力は`include`の閉包のmanifestの成果物と一致する | 許可したパックのフォルダに、manifestに無いfileを一つ足す | 出力は変わらない（path globで拾わない） |
| `IV-RL-22` | 6.1 | `Ab`と`ab`が`_41b`と`ab`になり、大文字小文字を区別しないFSでも別file | 入力をNFDの文字列にする | `Rejected(invalid_id)` |
| `IV-RL-23` | 6.1 | `con`が`_63on`、80byteの結果はそのまま | 結果を81byteにする | `_h`＋64桁の形になり、内容から論理IDを戻せる |
| `IV-RL-24` | RL-P1 | segmentのpathが内容の`enc(log_id)`・`enc(writer)`と一致する | segmentを別writerのdirectoryへ移す | `Unknown(conflict)` |
| `IV-RL-25` | RL-P2 | 全pathの大文字小文字を畳んだ値が一意 | 大文字を小文字にそのまま写す（`_xx`にしない）`enc`の変異で`A`と`a`のlogを作る | `Unknown(conflict)`（新しい書込みは`Rejected`） |
| `IV-RL-26` | RL-P3 | LFのままのsegmentを読める | 1行をCRLFへ変換する | `Unknown(unreadable)`（CK K5-I3(f)） |
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
