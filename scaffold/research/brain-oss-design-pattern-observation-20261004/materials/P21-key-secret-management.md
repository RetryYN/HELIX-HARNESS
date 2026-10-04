# P21 鍵・秘密の管理（保管、更新、失効、範囲）の観察（D08 Security）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（鍵長、期限、閾値、回数、割合、既定値等）は持ち込まない。実際の鍵・token・証明書の例は書かない。技術選定・採用推奨ではない。

埋めようとしたgap：[D08 Security §4 gap](../../brain-domain-material-inventory-20261004/materials/D08-security.md)「鍵・秘密の管理（保管、更新、失効、範囲）」（旧台帳で`todo`。旧は漏洩の検知だけ。D08-M07）。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| getsops/sops | https://github.com/getsops/sops | 86bc0b08c13b3db3496f85270f8c061e0120927a（default branch: main） | MPL-2.0 | false | 2026-10-05 | 設定fileを値単位で暗号化するtool。file単位のdata keyを複数の外部master key（KMS、PGP、age、Vault transit等）で包むenvelope encryption、key groupとShamir分割、暗号化する範囲の指定、data keyの作り直しによる回転をコードで読める |
| tink-crypto/tink-go | https://github.com/tink-crypto/tink-go | 30e42cb06b207947e6101b0c057f0746ca3ffbbb（main） | Apache-2.0 | false | 2026-10-05 | 暗号APIの誤用を防ぐことを目的にしたlibrary（Go版）。keyset（複数の鍵の版と主鍵）、鍵の状態遷移、鍵IDの接頭辞、秘密を平文で出す経路の隔離、KMS envelope AEADを持つ |
| openbao/openbao | https://github.com/openbao/openbao | 2fff36bce80801e8f8d2ad5485948af16ee5db4d（main） | MPL-2.0 | false | 2026-10-05 | 秘密管理server（Vaultのfork）。transitの鍵の版と復号可能な最小版、storage barrierの鍵の自動回転、leaseによる動的秘密の更新・失効を実装している |
| cert-manager/cert-manager | https://github.com/cert-manager/cert-manager | 8d77f2aeab4eca19270f21862fb5ec305ee9dd28（master） | Apache-2.0 | false | 2026-10-05 | Kubernetes上の証明書の発行・更新controller。更新の契機を検査の連鎖で表し、秘密鍵の回転方針（毎回作り直すか、再利用するか）を明示の設定にしている。既定値の変更の判断記録がPRに残っている |
| spiffe/spire | https://github.com/spiffe/spire | eb3c6af4a51b962e88c0cb367f7e894d625ed4e2（main） | Apache-2.0 | false | 2026-10-05 | workload identity（SPIFFE）の実装。短命な証明書（SVID）の自動回転、CA鍵の準備→有効化→旧化の段階、侵害時のtaint（汚染の印）とrevoke（信頼束からの除去）の区別、selectorによる発行範囲を持つ |

## 観察

### P21-O01 data keyを外部の鍵で包むenvelope encryption（file単位とmessage単位）
- 出典：sops、`sops.go` 行771–839（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/sops.go#L771-L839）、行848–891（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/sops.go#L848-L891）。tink-go、`aead/kms_envelope_aead.go` 行121–216（https://github.com/tink-crypto/tink-go/blob/30e42cb06b207947e6101b0c057f0746ca3ffbbb/aead/kms_envelope_aead.go#L121-L216）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - sopsは、fileごとに乱数のdata keyを1つ作り、`UpdateMasterKeysWithKeyServices` で、metadataに並ぶ各master keyにdata keyを暗号化させ、結果を各master keyの `EncryptedDataKey` として保存する。master keyによる暗号化・復号は `keyservice.KeyServiceClient` を経由して行い、1つのmaster keyについては、渡されたservicesのどれか1つで成功すれば足りる。復号は `GetDataKeyWithKeyServices` が、groupごとに、そのgroupのどれか1つのmaster keyで断片（groupが1つならdata key全体）を取り出す（P21-O02）。取り出したdata keyは `Metadata.DataKey` に保持され、再度の外部呼出しを省く。
  - tinkの `KMSEnvelopeAEAD.Encrypt` は、呼出しごとに新しいDEK（data encryption key）を作り、KEK（key encryption key、通常は外部KMSのAEAD）でDEKを暗号化し、「暗号化DEKの長さ＋暗号化DEK＋payload」の形の1つのciphertextにまとめる。`Decrypt` はこの形を分解し、KEKでDEKを戻してからpayloadを復号する。
- 解いている問題と前提：大量のdataを外部KMSへ送らずに、鍵の管理（保管・権限・監査）だけを外部の鍵管理に寄せる。KEKは外部に残り、平文のDEKは処理の間だけ手元にある。
- 必要な入力：master key（KEK）の識別子の一覧、各KEKへの到達経路（sopsはkeyservice、tinkは `tink.AEAD` 実装）、DEKの種別（tinkはDEKのkey templateを、許可した種別の一覧で検査する。行43–54、75–83）。
- trade-off・失敗の仕方：
  - sopsはdata keyをfile単位で共有するため、1つのfileの中の全値が同じdata keyに依存する。tinkは呼出し単位でDEKを作るため、KEKへの呼出し回数が暗号化の回数に比例する。
  - tinkは、DEKをKEKで暗号化するときの関連data（associated data）を空にしている（行159、210）。payload側の関連dataでは束縛するが、暗号化DEKそのものは別のciphertextへ差し替えて使える形である（差し替えた場合はpayloadの認証で失敗する）。
  - tinkの形式は暗号化DEKだけを持ち、どのKEKで包んだかを記録しない。KEKの回転時に、どのKEKで復号すべきかはKEK側（KMS）の扱いに依存する。
- 反例・適用しない場合：OpenBaoのtransitは、dataを鍵の持ち主（server）へ送って暗号化させる方式で、利用側にDEKを渡さない（P21-O08）。ただしtransitも `datakey` path（`internal/builtin/logical/transit/path_datakey.go` 行20–79）でDEKを返す使い方を持つ。
- 互換・非互換：P21-O02（KEKを複数のgroupに分ける）、P21-O04（data keyの作り直しによる回転）と組み合わさる。sopsは `hc_vault_transit_uri` をmaster keyの種類に持ち（`config/config.go` 行178–197）、P21-O08のtransitをKEKとして使える。
- 限界：DEK・nonceの長さ等の値は持ち込まない。このrepoで成立していることは、HELIXで成立することを意味しない。

### P21-O02 key groupとShamir分割による「group内はOR、group間は閾値」の復号条件
- 出典：sops、`sops.go` 行681–702（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/sops.go#L681-L702）、行783–806（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/sops.go#L783-L806）、行859–884。信頼性ラベル：primary。本文確認：済
- 何をしているか：`Metadata.KeyGroups` はmaster keyの組（`KeyGroup`）の並びで、`ShamirThreshold` は「data keyを戻すのに要るgroupの数」である。groupが1つなら、group内のどのmaster keyもdata key全体を包む。groupが複数なら、data keyをShamir秘密分散でgroupの数に分け、各groupのmaster keyはそれぞれ自分のgroupの断片だけを包む。閾値が未設定なら、全groupを要求する値に置く（行790–792）。復号時は、成功したgroupの断片が閾値に満たなければ、groupごとの失敗理由をまとめた `getDataKeyError` を返す。
- 解いている問題と前提：
  - 暗号上の仕組みとしてsourceが保証するのは、「group内はどれか1つのmaster keyで断片を戻せる（OR）」「data keyを戻すには閾値以上のgroupの断片が要る」という復号の条件だけである（行783–806、859–884）。
  - 各groupを独立した持ち主（別々のcloud account、別々の鍵管理系、別々の運用者）に割り当てれば、1つの持ち主だけでは復号できない構成にできる。ただし、これは組織上の前提であり、そう割り当てられる可能性にとどまる。sourceは、同じ人物や同じ系が複数のgroupのmaster keyを持つことを検査も排除もしない。閾値やgroupの構成の選び方次第で、分離が成り立たないこともある。復号は鍵へのaccessだけで決まり、人間の承認eventを検証しない。したがって、この仕組みだけでは「複数の持ち主の合意」を保証しない。
- 必要な入力：groupの分け方（どのmaster keyを同じgroupにするか）、閾値。分離を狙う場合は、groupと持ち主の対応をsopsの外で管理し、確かめる手段が要る。
- trade-off・失敗の仕方：閾値を上げるほど、1つの鍵管理系の障害で復号できなくなる場面が増える（可用性と分離の交換）。groupが1つのときはShamirを使わない分岐になる（行784–787のcomment）ため、「groupを1つにして閾値を設定した」構成は分割として働かない。
- 反例・適用しない場合：tinkのkeysetやOpenBaoのtransitは、1つの鍵の版を1つの持ち主が管理する形で、k-of-nを鍵の層では表さない。OpenBao自身の起動時のunseal（root keyの分割）は今回読んでいない。
- 互換・非互換：P21-O01（envelope）の上に乗る。P21-O04の回転時には、groupの構成も変えられる（ただし `rotate` が鍵を足すのは先頭のgroupだけ。P21-O04）。
- 限界：閾値・group数の値は持ち込まない。

### P21-O03 暗号化する範囲を値の経路で選び、経路を関連dataとMACで束縛する
- 出典：sops、`sops.go` 行445–516（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/sops.go#L445-L516）、行535–585（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/sops.go#L535-L585）、`cmd/sops/common/common.go` 行84–108（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/cmd/sops/common/common.go#L84-L108）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `shouldBeEncrypted` は、値のkeyの経路（path）とcommentを見て、暗号化するかを決める。既定はすべて暗号化で、`UnencryptedSuffix`／`UnencryptedRegex`／`UnencryptedCommentRegex` は除外、`EncryptedSuffix`／`EncryptedRegex`／`EncryptedCommentRegex` は「一致したものだけ暗号化」へ切り替える。
  - 各値の暗号化では、経路を `:` で連結した文字列を関連data（AAD）として渡す（行557–558）。値を別の経路へ移すと復号に失敗する。
  - 木全体（既定は全値、`MACOnlyEncrypted` なら暗号化した値だけ）のhashをMACとして計算し、data keyで暗号化してmetadataに置く。`DecryptTree` は計算したMACと保存したMACを比べ、不一致なら `MacMismatch` で止める。`IgnoreMac` の指定でこの検査を外せる。
- 解いている問題と前提：設定fileのうち秘密の値だけを暗号化し、keyの名前や構造は差分reviewで読める形に残す。そのうえで、平文の値の改ざんや値の入替えを検出する。
- 必要な入力：秘密とみなす値の規則（suffix、正規表現、comment）、平文の部分も改ざん検出の対象にするかの選択。
- trade-off・失敗の仕方：
  - 規則が誤っていると、秘密が平文のまま残る。規則はfile外（P21-O04のcreation rule）にも置けるため、規則の誤りがfileを見ただけでは分からない場合がある。
  - `MACOnlyEncrypted` を有効にすると、平文で残した値の改ざんはMACで検出されない。
  - 暗号化したcommentが除外規則に一致すると復号できなくなるため、暗号化時にerrorで止める（行562–571）。
- 反例・適用しない場合：tinkのAEADは値の経路を知らず、関連dataは呼出し側が渡す（P21-O07）。OpenBaoのbarrierは、storageのpathを関連dataにする版を持つ（`internal/vault/barrier/aes_gcm.go` 行1036–1047、P21-O09）。
- 互換・非互換：P21-O01の上に乗る。P21-O04の範囲指定（fileのpathで鍵を選ぶ）とは、選ぶ対象（fileか値か）が異なる。
- 限界：hash関数・暗号方式の名前と値は持ち込まない。

### P21-O04 回転＝data keyの作り直しとmaster keyの追加・削除、鍵の範囲＝fileのpathに対する最初に一致した規則
- 出典：sops、`cmd/sops/rotate.go` 行26–89（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/cmd/sops/rotate.go#L26-L89）、`config/config.go` 行126–130、178–197、570–611（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/config/config.go#L570-L611）、`aes/cipher.go` 行36–53、123、141–158（https://github.com/getsops/sops/blob/86bc0b08c13b3db3496f85270f8c061e0120927a/aes/cipher.go#L36-L53）。issue：getsops/sops#220（https://github.com/getsops/sops/issues/220、closed）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `rotate` は、暗号化fileを読み込み（行27–37）、監査eventを送り（行39–41）、その後に木を復号する（行43–52）。復号ではMACを検査するが、`IgnoreMAC` の指定でこの検査を外せる。続いて、指定されたmaster keyを先頭のgroupへ足し、指定されたmaster keyを全groupから外す。その後に新しいdata keyを作って全値を暗号化し直す。master keyの削除は、新しいdata keyを外したkeyで包まないことで効く。
  - 鍵の範囲は、設定fileの `creation_rules` で表す。規則は `path_regex` と、使うmaster key・key group・閾値・暗号化範囲（P21-O03）を持つ。`parseCreationRuleForFile` は、設定fileからの相対pathに対し、上から順に最初に一致した規則（`path_regex` が空の規則は全件に一致）を使い、一致する規則がなければerrorにする。
  - cipherは、復号したときに平文と関連dataの組ごとにIVを記録し（`aes/cipher.go` 行123）、同じcipher instanceで同じ組を暗号化するときは、記録したIVを再利用する（行150–158。記録が無ければ乱数で作る）。IVを記録するのは復号時だけである。commentは「復号して再暗号化しても暗号文が変わらないように」と目的を書いている。
- 解いている問題と前提：鍵の持ち主の入替え（人の異動、鍵の侵害）を、file単位の作業で反映する。どのfileをどの鍵で守るかを、repositoryのpath構造に沿って宣言する。
- 必要な入力：追加・削除するmaster key、pathと鍵の対応の規則、規則の順序。
- trade-off・失敗の仕方：
  - 回転はfileごとに明示の操作が要る。master keyを外しても、外したkeyで包まれていた過去のfile（gitの履歴を含む）は、その鍵で開けられるまま残る（data keyの作り直しは、以後の版にしか効かない）。
  - 規則は最初の一致で決まるため、順序の誤りで、意図より広い鍵が適用されうる。
  - IVの再利用は、変更のない値の暗号文を安定させ差分を小さくする代わりに、同じ値が版をまたいで変わらなかったことを外から観測できる。issue #220の主題はIVの長さで、計数によるIVは代案として挙げられている。issueはcloseされている（本書はIVの長さ等の値を持ち込まない）。
- 反例・適用しない場合：OpenBao transitは、鍵の版を上げても既存の暗号文はそのまま復号でき、作り直し（rewrap）は別の操作である（P21-O08）。tinkは新しい鍵を足して主鍵を移し、古い鍵は無効化まで復号に使える（P21-O05）。
- 互換・非互換：P21-O01・O02・O03の上に乗る。範囲をpathで宣言する点は、P21-O14（SPIREのselectorによる発行範囲）と同じ「宣言した条件に一致したものだけに鍵・身元を与える」形である。
- 限界：規則の具体的な正規表現や鍵の識別子は持ち込まない。

### P21-O05 keysetの中の鍵の版と状態遷移（主鍵、有効、無効、削除）
- 出典：tink-go、`keyset/manager.go` 行268–332（https://github.com/tink-crypto/tink-go/blob/30e42cb06b207947e6101b0c057f0746ca3ffbbb/keyset/manager.go#L268-L332）、行355–364、`keyset/handle.go` 行254–283（https://github.com/tink-crypto/tink-go/blob/30e42cb06b207947e6101b0c057f0746ca3ffbbb/keyset/handle.go#L254-L283）。信頼性ラベル：primary。本文確認：済
- 何をしているか：keysetは複数の鍵を持ち、各鍵はID、状態（Enabled／Disabled等）、主鍵かどうかを持つ。`SetPrimary` は有効な鍵だけを主鍵にでき、他の鍵の主鍵印を外す。`Disable` と `Delete` は主鍵に対しては拒否する。`Delete` はkeysetから鍵を取り除く物理削除で戻せず、主鍵でなければ、無効化を経ていない有効な鍵も削除できる（行320–331）。`Enable`／`Disable` は、有効・無効以外の状態の鍵を拒否する。鍵IDは、keyset内で使ったことのないIDを乱数で選ぶ。`keysetToEntries` のcommentによれば、有効でない主鍵は検証（`Validate`）で拒否する。
- 解いている問題と前提：回転を「新しい鍵を足す→主鍵を移す→古い鍵を無効化→削除」という段階で行えるようにする。無効化は戻せるが、削除は戻せない。この順序（無効化を経てから削除する等）はlibraryが強制しない。暗号化は主鍵だけで行い、復号は有効な鍵で行う（P21-O06）。
- 必要な入力：鍵のtemplate（種別とparameter）、主鍵を移す時期、無効化と削除の時期。
- trade-off・失敗の仕方：keysetの変更はhandleを作り直すまで使う側に届かない（`Manager.Handle` が新しいhandleを返す）。複数の処理系が同じkeysetを使う場合、主鍵を移す前に新しい鍵が全処理系へ行き渡っていないと、新しい鍵で作った暗号文を古いkeysetの処理系が復号できない（この順序の保証はlibraryの外にある）。
- 反例・適用しない場合：OpenBao transitは状態ではなく「最小の版の番号」で使える鍵を表す（P21-O08）。sopsは鍵の版を持たず、回転のたびにdata keyを作り直す（P21-O04）。
- 互換・非互換：P21-O06（鍵IDの接頭辞による選択）が前提。P21-O13のSPIREの「準備→有効化→旧」と段階の考え方が近い。
- 限界：状態の名前と遷移の詳細はこのlibrary固有であり、HELIXへ持ち込まない。

### P21-O06 暗号文に鍵IDの接頭辞を付け、復号時に候補の鍵を絞る
- 出典：tink-go、`aead/aead_factory.go` 行131–159（https://github.com/tink-crypto/tink-go/blob/30e42cb06b207947e6101b0c057f0746ca3ffbbb/aead/aead_factory.go#L131-L159）、`internal/prefixmap/prefixmap.go` 行71–92（https://github.com/tink-crypto/tink-go/blob/30e42cb06b207947e6101b0c057f0746ca3ffbbb/internal/prefixmap/prefixmap.go#L71-L92）。信頼性ラベル：primary。本文確認：済
- 何をしているか：keysetから作ったAEADは、暗号化を主鍵で行い、主鍵の識別子を含む暗号文を返す（commentは「主鍵の識別子と暗号文の連結」と書く）。復号では、暗号文の先頭が接頭辞に一致する鍵と、接頭辞を持たない（RAW）鍵を候補にし、順に試して最初に成功したものを返す。どれも成功しなければ、理由を区別しない1つのerrorを返す。成功は鍵IDとともに、失敗は鍵IDなしで、monitoringのloggerへ記録する。
- 解いている問題と前提：鍵が複数あるときに、どの鍵で作った暗号文かを持ち運び、回転後も古い暗号文を復号できるようにする。
- 必要な入力：鍵ごとの出力接頭辞の種類（接頭辞を付けるか、付けないか）。
- trade-off・失敗の仕方：接頭辞を持たない鍵は、すべての復号で候補になる。RAW鍵が多いと試行が増える。失敗理由を区別しないため、「鍵が無い」のか「改ざん」なのかを呼出し側は区別できない（区別させないことで情報を漏らさない設計とも読めるが、意図を述べた文書は読んでいない）。
- 反例・適用しない場合：OpenBao transitは、暗号文の先頭に版の番号を文字列で付け、版の番号から鍵を直接選び、許可された範囲外の版を明示のerrorで拒否する（P21-O08）。OpenBao barrierは、暗号文の先頭にterm（鍵の世代）を付ける（P21-O09）。sopsは各値に方式名とIVを書くが、鍵の版は持たない（P21-O04）。
- 互換・非互換：P21-O05の状態と組み合わさる（無効な鍵は候補に入らない前提。どこで除かれるかは `keyset.Handle` のprimitive生成側で、今回は読んでいない）。
- 限界：接頭辞の長さ等の値は持ち込まない。

### P21-O07 暗号APIの誤用を防ぐ設計：秘密の平文出力の隔離、秘密を含まない表示、明示のaccess token
- 出典：tink-go、`keyset/handle.go` 行244–252、304–311、406–414、510–524（https://github.com/tink-crypto/tink-go/blob/30e42cb06b207947e6101b0c057f0746ca3ffbbb/keyset/handle.go#L304-L311）、行470–492、`insecurecleartextkeyset/insecurecleartextkeyset.go` 行15–20、52–56（https://github.com/tink-crypto/tink-go/blob/30e42cb06b207947e6101b0c057f0746ca3ffbbb/insecurecleartextkeyset/insecurecleartextkeyset.go#L15-L20）、`insecuresecretdataaccess/insecuresecretdataaccess.go` 行15–24（https://github.com/tink-crypto/tink-go/blob/30e42cb06b207947e6101b0c057f0746ca3ffbbb/insecuresecretdataaccess/insecuresecretdataaccess.go#L15-L24）、`secretdata/secretdata.go` 行15–39。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - keysetの書出しの通常の経路（`Write`／`WriteWithAssociatedData`）は、master key（AEAD）による暗号化を必須にする。`WriteWithNoSecrets`／`NewHandleWithNoSecrets` は、対称鍵・非対称の秘密鍵・種別不明の鍵が含まれていればerrorにする（`hasSecrets`）。
  - 平文での読み書きは別package `insecurecleartextkeyset` に分け、package docに「危険な関数を含み、利用を制限・監査できるよう分けた」と書く。
  - 秘密の値を返すAPIは `insecuresecretdataaccess.Token` を引数に要求し、`secretdata.Bytes` は不変の値を包んでtokenなしでは中身を出さない。commentは、build systemと組み合わせてこのtokenの利用箇所を制限すると書く。
  - `Handle.String` は鍵の種類・状態・IDだけ（`KeysetInfo`）を返し、鍵の値を含まない。
- 解いている問題と前提：利用者に方式・nonce・鍵の値を扱わせず、危険な操作を「名前が危険と分かるpackage」と「明示のtoken」に寄せて、code reviewやbuild規則で検出できるようにする。logやdebug出力からの秘密の漏れを型で防ぐ。
- 必要な入力：危険な経路の利用を許すmoduleの一覧（build規則）、keysetを暗号化するmaster key。
- trade-off・失敗の仕方：tokenは空の構造体で、Goの言語機能としては誰でも作れる。制限はbuild system側に依存し、それが無い環境では命名と監査だけが防御になる（commentの「Within Google」の記述）。平文package自体は残るため、利用を禁止するのではなく見つけやすくする設計である。
- 反例・適用しない場合：sopsは利用者に方式を選ばせないが、`IgnoreMac` のように検査を外す選択肢をCLIの引数で持つ（P21-O03）。OpenBao transitは `exportable` と `allow_plaintext_backup` を鍵ごとの属性にし（`sdk/helper/keysutil/policy.go` 行475–516）、出せる鍵かどうかを鍵の側で宣言する。SPIREのKeyManagerは鍵を `crypto.Signer` としてだけ渡し、値を出すmethodを持たない（P21-O13）。
- 互換・非互換：P21-O05・O06の上の層。P21-O01のKMS envelopeでは、KEKの値は外部に残る。
- 限界：Google内のbuild規則の実体は読んでいない。

### P21-O08 鍵の版の範囲（最小の復号版・暗号化版・保持版）と、作り直し（rewrap）・刈込み（trim）
- 出典：openbao、`sdk/helper/keysutil/policy.go` 行478–499（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/sdk/helper/keysutil/policy.go#L478-L499）、行617–697（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/sdk/helper/keysutil/policy.go#L617-L697）、行1104–1131（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/sdk/helper/keysutil/policy.go#L1104-L1131）、`internal/builtin/logical/transit/path_trim.go` 行84–99、116–121（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/builtin/logical/transit/path_trim.go#L84-L121）、`path_rewrap.go` 行197–204。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - transitの鍵（`Policy`）は版の番号を持ち、`LatestVersion`（最新）、`MinDecryptionVersion`（復号を許す最小版）、`MinEncryptionVersion`（暗号化に使う最小版）、`MinAvailableVersion`（保存されている最小版。これ未満は削除済み）を持つ。
  - 復号では、暗号文の接頭辞から版を読み、最新より新しい版を「too new」、最小復号版より古い版を `ErrTooOld` として拒否する。
  - `handleArchiving` は、最小復号版より古い鍵を作業用のmapから外し、別のarchiveに残す。最小復号版を下げれば、archiveから戻す。commentは「安全のため、archiveからは消さない」と書く。保存を先に行い、mapからの削除は保存成功後に行う（行690–694）。
  - `trim` は保持版（`MinAvailableVersion`）を上げて古い版を本当に消す。下げることはできず、最小暗号化版・最小復号版の両方を設定し、それ以下であることを求める。
  - `rewrap` は、既存の暗号文を復号して最新版で暗号化し直す。既に最新版なら何もしない（help文）。
- 解いている問題と前提：回転（版を上げる）と失効（古い版を使えなくする）と破棄（古い版を消す）を別の操作に分け、それぞれ戻せる・戻せないを区別する。「使えなくする」は版の番号を上げるだけで戻せるが、「消す」は戻せない。
- 必要な入力：最小復号版・最小暗号化版・保持版を上げる時期、既存の暗号文を作り直す経路（rewrapの呼出し）、自動回転の周期（`AutoRotatePeriod`、行527–529）。
- trade-off・失敗の仕方：最小復号版を上げても、作り直していない暗号文は復号できなくなる（`ErrTooOld`）。rewrapは利用側が暗号文を持ち込んで行う必要があり、server側は既存暗号文の所在を知らない。trimの後は、古い版の暗号文は回復できない。
- 反例・適用しない場合：tinkは状態（有効・無効）で表し、無効化は戻せる（P21-O05）。sopsは版を持たず、回転は作り直しと同義（P21-O04）。
- 互換・非互換：P21-O06の「暗号文に版を書く」と同じ前提。P21-O01のKEKとして使える（sopsのmaster keyの種類）。
- 限界：版の番号の扱いは本実装固有。自動回転の周期等の値は持ち込まない。

### P21-O09 storageを守る鍵の世代（term）と、使用回数・経過時間による自動回転
- 出典：openbao、`internal/vault/barrier/keyring.go` 行17–64（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/vault/barrier/keyring.go#L17-L64）、行102–154（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/vault/barrier/keyring.go#L102-L154）、`internal/vault/barrier/aes_gcm.go` 行1016–1050、1180–1198、1205–1247（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/vault/barrier/aes_gcm.go#L1205-L1247）、`internal/vault/core.go` 行3095–3130（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/vault/core.go#L3095-L3130）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `Keyring` は、連番のterm（世代）ごとの暗号鍵と、keyring自体を暗号化するroot keyを持つ。commentによれば、全dataは最新のtermの鍵で暗号化し、古いtermの鍵は過去のdataの復号のために残す。暗号文の先頭にtermを書く。
  - `AddKey` は、同じtermに別の値の鍵を入れようとするとerrorにし、追加したtermが現在の有効termより大きい場合に限ってそれを有効にし（行123–126）、それ以外のtermの暗号化回数の推定を0に戻す。`RemoveKey` は有効なtermを外せない。
  - 判定：`CheckBarrierAutoRotate` は、回転の設定（`Disabled`、`MaxOperations`、`Interval`）に照らして、暗号化回数が上限を超えた、有効な鍵の導入から周期を過ぎた、などの回転の理由を返す。この関数は理由を判定して返すだけで、回転は行わない（理由が無ければ計数を保存する）。
  - 実行：同じcommitの `internal/vault/core.go` 行3095–3130（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/vault/core.go#L3095-L3130）では、`autoRotateBarrierLoop` が周期的に `checkBarrierAutoRotate` を呼ぶ。`checkBarrierAutoRotate` は、理由が空でなければ `sealManager.RotateBarrierKey` を呼んで回転を実行し、失敗した場合はerrorのlogを出す（行3108–3130）。暗号化のたびに計数を増やし（`encryptTracked`）、他のnodeの暗号化回数も足し込む（`AddRemoteEncryptions`）。
- 解いている問題と前提：同じ鍵での暗号化回数に、暗号方式から来る上限がある前提で、回数と時間の両方で回転を起こす。分散構成では回数をnode間で集計する。
- 必要な入力：回数の上限、周期、回転を無効にするかどうか、node間の計数の集約経路。
- trade-off・失敗の仕方：回数は推定（commentは追跡の損失を見込んで上限の手前に置くと書く）で、node間の集約が遅れると実際の回数を下回る。古いtermの鍵は残り続けるため、回転は「新しい書込みの鍵を変える」ことで、既存dataの再暗号化ではない。
- 反例・適用しない場合：transitの鍵は版の範囲を外から操作する（P21-O08）。tinkは回数を数えない（P21-O05）。
- 互換・非互換：P21-O06・O08と同じ「暗号文に世代を書き、古い世代を復号用に残す」形。storageのpathを関連dataにする版（`AESGCMVersion2`、行1039–1044）は、P21-O03のsopsの経路のAADと同じ考え方である。
- 限界：回数の上限、最小周期などの定数はsourceにあるが持ち込まない。

### P21-O10 lease付きの動的秘密：発行時の登録、tokenへの紐付け、上限付きの更新、失効の再試行
- 出典：openbao、`internal/vault/expiration.go` 行1482–1560（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/vault/expiration.go#L1482-L1560）、行1129–1149（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/vault/expiration.go#L1129-L1149）、行1258–1323、行244–290（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/vault/expiration.go#L244-L290）、`sdk/framework/lease.go` 行35–113（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/sdk/framework/lease.go#L35-L113）、`internal/builtin/logical/database/secret_creds.go` 行20–163（https://github.com/openbao/openbao/blob/2fff36bce80801e8f8d2ad5485948af16ee5db4d/internal/builtin/logical/database/secret_creds.go#L20-L163）。issue：openbao/openbao#2413（https://github.com/openbao/openbao/issues/2413、題名のみ）。信頼性ラベル：primary。本文確認：済（issueは題名のみ）
- 何をしているか：
  - backendが秘密（例：databaseの利用者）を作って返すと、`Register` が、要求のpathと乱数から作ったlease IDで `leaseEntry`（発行したtoken、path、発行時刻、期限、backendの内部data）を保存し、発行したtokenからの索引を作る。batch tokenの場合は、orphanなら索引を作らず、親があれば親tokenに索引を付ける（行1531–1540）。登録に失敗した場合は、作った秘密をbackendに失効させ、entryと索引を消す（deferの巻戻し）。
  - 更新（`Renew`）は、lease単位のlockの下で、backendの `Renew` を呼び、`CalculateTTL` で新しい期限を決める。`CalculateTTL` は、mountの上限、backendの上限、明示の上限のうち最も短いものを最大値にし、「発行時刻＋最大値」を越える期限を切り詰めて警告を返す。最大値を過ぎていれば更新を拒否する。
  - 失効は、lease単位（`Revoke`）、pathの接頭辞単位（`RevokePrefix`。commentは接頭辞がmountの表に対応すると書く）、token単位（`RevokeByToken`。索引を使う。commentは、token storeの失効処理からだけ呼ぶべきと書き、token tidyからも呼ばれると補っている。行1144–1148）を持つ。
  - 期限到来時の失効が失敗すると、指数的な間隔で再試行し、回数を使い切るか回復不能なerrorなら、そのleaseを「irrevocable（失効できない）」として記録する。
  - database backendは、lease更新時にdatabase側の利用者の有効期限も延ばし、失効時は利用者を消すstatementを実行する。roleが消されていても、leaseの内部dataに埋めたdatabase名と失効statementで失効できる経路を持つ（行135–163）。
- 解いている問題と前提：長命の共有秘密をやめ、利用者ごと・期限付きの秘密を発行し、期限・token・発行元pathのどれからでもまとめて失効できるようにする。発行の記録が失敗したら秘密自体を残さない。
- 必要な入力：秘密を作る・延ばす・消す操作（backendごと）、既定と上限の期限、tokenの親子関係、失効失敗の扱い。
- trade-off・失敗の仕方：
  - 失効は外部system（database等）への操作であり、失敗しうる。再試行を使い切ったleaseは、期限を過ぎても外部に秘密が残る状態になり、運用者の対応が要る。#2413は、irrevocable leaseの失効後に件数metricが減らない不具合の題名である（本文は読んでいない）。
  - 上限は発行時刻から数えるため、更新を続けても上限を越えて延びない。長時間の処理は途中で秘密を取り直す必要がある。
- 反例・適用しない場合：sopsとtinkは発行・失効の概念を持たず、鍵の持ち主が鍵を外すことで以後の復号を止める（P21-O04）。SPIREは失効の代わりに短命の証明書と信頼束からの除去を使う（P21-O13）。cert-managerは期限前の更新を扱い、失効（CRL等）は今回読んだ範囲に無い（P21-O11）。
- 互換・非互換：失効をtokenとpathの木構造でまとめる点は、P21-O04・O13の「範囲の宣言」と別の軸（発行経路による範囲）である。
- 限界：期限の既定値、再試行の回数、database側の猶予の値は持ち込まない。

### P21-O11 更新の契機を検査の連鎖で表し、更新時刻を実際の有効期間から計算する
- 出典：cert-manager、`internal/controller/certificates/policies/policies.go` 行28–103（https://github.com/cert-manager/cert-manager/blob/8d77f2aeab4eca19270f21862fb5ec305ee9dd28/internal/controller/certificates/policies/policies.go#L28-L103）、`pkg/util/pki/renewaltime.go` 行56–99（https://github.com/cert-manager/cert-manager/blob/8d77f2aeab4eca19270f21862fb5ec305ee9dd28/pkg/util/pki/renewaltime.go#L56-L99）、`pkg/apis/certmanager/v1/types_certificate.go` 行176–215（https://github.com/cert-manager/cert-manager/blob/8d77f2aeab4eca19270f21862fb5ec305ee9dd28/pkg/apis/certmanager/v1/types_certificate.go#L176-L215）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `NewTriggerPolicyChain` は、再発行を起こす検査を順に並べた連鎖で、Secretが無い、必要なkeyが欠けている、秘密鍵と公開鍵が合わない、発行者の注釈が仕様と違う、秘密鍵の種類が仕様と違う、現在の発行要求が仕様と違う、期限が近い、を含む。`Chain.Evaluate` は最初に違反した検査の理由を返して止まる。同じ検査の多くを `NewReadinessPolicyChain`（準備完了でないとみなす検査）でも使い、最後の検査だけ「期限が近い」が「期限切れ」に替わる。
  - `RenewalTime` は、要求した期間ではなく、発行された証明書の `notBefore`〜`notAfter` から、期限前の余裕（絶対時間または割合）を引いて更新時刻を決める。発行者が推奨する更新の窓（ARI）があれば、その窓の中から乱択する。更新の方針が無効なら更新時刻を返さない。
  - 更新時刻を秒に切り詰める理由として、statusに保存した値と再計算の値のずれで更新が起きなくなった不具合のPR（#4399）を参照している（行73–82）。
- 解いている問題と前提：「期限が近い」だけでなく、仕様と実体のずれ（鍵の種類の変更、発行者の変更、Secretの破損）も同じ再発行の経路に乗せる。発行者が要求と違う期間で発行しても、実際の期間で更新時刻を決める。
- 必要な入力：期限前の余裕の指定（絶対時間か割合のどちらか一方）、更新の窓、比較する仕様の項目。
- trade-off・失敗の仕方：連鎖は最初の違反で止まるため、複数のずれがあるときに報告されるのは1つだけである。APIの説明には、期限前の余裕に最小値の制約がある（行186–187、203–205。値は持ち込まない）。原文は制約の理由を書いていない。余裕と期間の関係が不適切だと更新が繰り返し起きうるため、という理由は本書の推論である。
- 反例・適用しない場合：SPIREは、残り期間と有効期間の比で回転し、jitterで分散する（P21-O13）。OpenBaoのleaseは、利用側が明示に更新を呼ぶ（P21-O10）。
- 互換・非互換：P21-O12（秘密鍵の作り直しの方針）と組み合わさる。
- 限界：期限前の余裕の既定・最小値はAPIの説明にあるが持ち込まない。

### P21-O12 再発行時の秘密鍵の扱いを明示の方針にし、次の秘密鍵を所有の確認できる別のSecretに置く
- 出典：cert-manager、`pkg/apis/certmanager/v1/types_certificate.go` 行348–414（https://github.com/cert-manager/cert-manager/blob/8d77f2aeab4eca19270f21862fb5ec305ee9dd28/pkg/apis/certmanager/v1/types_certificate.go#L348-L414）、`pkg/controller/certificates/keymanager/keymanager_controller.go` 行159–213（https://github.com/cert-manager/cert-manager/blob/8d77f2aeab4eca19270f21862fb5ec305ee9dd28/pkg/controller/certificates/keymanager/keymanager_controller.go#L159-L213）、行236–271、行339–390（https://github.com/cert-manager/cert-manager/blob/8d77f2aeab4eca19270f21862fb5ec305ee9dd28/pkg/controller/certificates/keymanager/keymanager_controller.go#L339-L390）。PR：cert-manager/cert-manager#7723（https://github.com/cert-manager/cert-manager/pull/7723、merged）、#8287（https://github.com/cert-manager/cert-manager/pull/8287、merged、題名のみ）。信頼性ラベル：primary。本文確認：済（#8287は題名のみ）
- 何をしているか：
  - `privateKey.rotationPolicy` は `Never`（Secretに鍵があれば再利用し、仕様と合わなければ警告して人の対応を待つ）と `Always`（再発行のたびに作り直す）を持つ。APIの説明は、既定がある版で `Never` から `Always` に変わったと書く。
  - keymanager controllerは、発行中（Issuing条件）の間だけ「次の秘密鍵」を、所有者参照と専用labelを付けた別のSecretに作る。発行中でなければそのSecretを消す。候補が複数あれば、statusの `nextPrivateKeySecretName` と名前が一致するSecretだけを残し、それ以外を消す（行193–198、`deleteSecretResources` 行290–304）。一致するSecretが無ければ全部消す。
  - `Never` で既存の鍵が仕様と合わない場合は、新しい鍵を作らず、警告eventを出し、次の鍵の名前をstatusから外す（「古い、または信頼できない名前を残さない」とcomment）。既存の鍵が読めない場合は作り直す。
  - Secretの名前はAPI serverに選ばせ、statusに書かれた名前を信用しない。commentは、statusのsubresourceだけを書ける主体が任意の名前を入れうること、その名前が別のCertificateの `secretName` でありうること、それを採ると他のCertificateのSecretを消したりその鍵で署名したりしうることを書く。statusの名前が指すSecretが自分の所有でなければ採らず、警告eventを出す。
- 解いている問題と前提：証明書の更新と秘密鍵の回転を分けて考え、利用者の期待（再発行で鍵も替わる）に既定を合わせる。PR #7723の本文は、issue #7601（https://github.com/cert-manager/cert-manager/issues/7601、本書では本文を読んでいない）の記述を引用して変更理由としている。引用された記述は、秘密鍵が漏れた利用者が再発行で鍵も新しくなると期待するのは合理的で、それに反する既定は驚きになる、という趣旨である。鍵を置く場所の名前を、書ける主体の権限が違うfield（status）から受け取らない。
- 必要な入力：回転方針、鍵の種類の仕様、所有の判定（所有者参照とlabel）。
- trade-off・失敗の仕方：`Always` は更新のたびに鍵が替わるため、鍵の固定（pinning）をしている相手とは両立しない（PR本文は、鍵を保ちたい利用者は `Never` を明示する必要があると書く）。`Never` は仕様の変更時に人の対応で止まる。
- 反例・適用しない場合：SPIREのworkload証明書は回転のたびに鍵も新しくする前提で、方針の選択を持たない（P21-O13の範囲で読んだ限り）。sopsはdata keyを回転のたびに作り直す（P21-O04）。
- 互換・非互換：P21-O11の更新の契機の上に乗る。「書ける主体の違うfieldを信用しない」は、P21-O07の「危険な経路を型と名前で分ける」と同じく、権限の境界を値の出所で守る考え方である。
- 限界：鍵の種類・長さの既定値は持ち込まない。既定の変更の段階（feature gateの段階）は製品固有。

### P21-O13 短命な身元証明書：署名鍵の準備→有効化→旧化、侵害時のtaintとrevokeの区別
- 出典：spire、`pkg/server/ca/manager/manager.go` 行258–363（https://github.com/spiffe/spire/blob/eb3c6af4a51b962e88c0cb367f7e894d625ed4e2/pkg/server/ca/manager/manager.go#L258-L363）、行859–903（https://github.com/spiffe/spire/blob/eb3c6af4a51b962e88c0cb367f7e894d625ed4e2/pkg/server/ca/manager/manager.go#L859-L903）、`pkg/server/ca/manager/slot.go` 行716–768（https://github.com/spiffe/spire/blob/eb3c6af4a51b962e88c0cb367f7e894d625ed4e2/pkg/server/ca/manager/slot.go#L716-L768）、`doc/spire_server.md` 行808–874（https://github.com/spiffe/spire/blob/eb3c6af4a51b962e88c0cb367f7e894d625ed4e2/doc/spire_server.md#L808-L874）、`pkg/server/plugin/keymanager/keymanager.go` 行16–38（https://github.com/spiffe/spire/blob/eb3c6af4a51b962e88c0cb367f7e894d625ed4e2/pkg/server/plugin/keymanager/keymanager.go#L16-L38）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - serverは現行と次の2つのslotでCA鍵を持つ。`PrepareX509CA` は、KeyManagerにslotの鍵IDで鍵を作らせ、上位の発行者または自己署名でCA証明書を作り、slotを `PREPARED` にしてjournalへ追記する。準備したCAが現行より長く生きない場合や、上位の鎖より長く生きる場合は警告する。`RotateX509CA` は、次のslotが期限切れなら拒否し、現行と次を入れ替え、旧slotを `OLD` にする。準備と有効化の時期は、slotの有効期間に対する閾値（`preparationThreshold`、`keyActivationThreshold`）で決まる。
  - 手動の操作は `prepare`（新しい鍵を作り、信頼束に入れる）、`activate`（署名に使い始める）、`taint`（旧い鍵を汚染として印を付ける）、`revoke`（旧い鍵を信頼束から除き、全体へ伝える）に分かれる（server文書）。上位の発行者が汚染された場合、`processTaintedUpstreamAuthorities` は、現行のCAがその上位に署名されていれば先に準備・回転し、次にdatastoreに汚染を記録し、最後にagent側へ通知して、汚染された鍵で署名された証明書の強制回転を起こす（commentは「中間が安全になってから通知する」順序を書く）。
  - KeyManagerのinterfaceは、鍵をIDで生成・取得し、`crypto.Signer` として返す。鍵の値を取り出すmethodを持たない。
- 解いている問題と前提：失効listを配る代わりに、証明書を短命にして自動で回し、侵害時は「新しい鍵で発行し直させる」（taint）と「旧い鍵を信頼しない」（revoke）を段階として分ける。新しい鍵は、使い始める前に信頼束へ配っておく。
- 必要な入力：CA・証明書の有効期間、準備と有効化の閾値、上位の発行者の有無、信頼束の配布経路、鍵の保管先（KeyManager plugin：disk、memory、外部KMS等）。
- trade-off・失敗の仕方：revokeを早く行うと、まだ回転していない下流の証明書が検証できなくなる。taintの後に回転が全体へ行き渡ったことを確かめてからrevokeする、という順序が運用に残る（文書は操作を分けるだけで、待つ条件は今回読んだ範囲に無い）。準備の段階を飛ばすと、新しい鍵が信頼束へ届く前に使われる。
- 反例・適用しない場合：cert-managerは更新時刻を発行者の期間から計算し、侵害時の一括強制回転の仕組みは今回読んだ範囲に無い（P21-O11）。OpenBaoは失効をleaseで表す（P21-O10）。
- 互換・非互換：P21-O05（tinkの段階的回転）とP21-O08（版の範囲）に近い段階の考え方。KeyManagerの「値を出さない鍵」はP21-O07と同じ考え方。
- 限界：有効期間、閾値の割合や上限、journalの保持期間などの定数はsourceにあるが持ち込まない。

### P21-O14 workload側の回転：残り期間による判定、汚染の通知による強制回転、selectorの部分集合による身元の範囲
- 出典：spire、`pkg/common/rotationutil/rotationutil.go` 行34–145（https://github.com/spiffe/spire/blob/eb3c6af4a51b962e88c0cb367f7e894d625ed4e2/pkg/common/rotationutil/rotationutil.go#L34-L145）、`pkg/agent/svid/rotator.go` 行162–230（https://github.com/spiffe/spire/blob/eb3c6af4a51b962e88c0cb367f7e894d625ed4e2/pkg/agent/svid/rotator.go#L162-L230）、`pkg/agent/manager/cache/lru_cache.go` 行105–125（https://github.com/spiffe/spire/blob/eb3c6af4a51b962e88c0cb367f7e894d625ed4e2/pkg/agent/manager/cache/lru_cache.go#L105-L125）、`doc/spire_agent.md` 行11、65。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `shouldRotateX509` は、期限を過ぎていれば回転する。それ以外は、利用可能性の目標による判定と、有効期間に対する割合による判定の2つを順に行い、いずれかが真なら回転する（OR。目標による判定が偽でも割合による判定へ進む。行70–84）。目標が未設定の場合、または有効期間と目標の差が小さい場合（`shouldFallbackX509Default`）は、目標による判定を使わない（行122–145）。JWT形式の身元も同じく有効期間に対する割合で判定する。割合の周りにjitterを置き、回転の要求が一時に集中しないようにする（commentの説明）。
  - agentの `rotator` は、通知された汚染済みの上位鍵の一覧に自分の証明書の鎖が含まれていれば汚染の印を立て、次の判定で期限に関係なく回転する。再attestation可能な方式なら、回転は再attestationとして行う。
  - workloadへ渡す身元は、registration entryのselectorが、workloadをattestationして得たselectorの集合の部分集合である場合に限る（cacheのcomment）。selectorはworkload attestor（docker、k8s、unix等）が作る（agent文書）。agent文書は、selectorの値に機微な情報が含まれうるため、logに出すselectorの接頭辞を設定で限ると書く。
- 解いている問題と前提：秘密を人が配らず、workloadの実行時の属性（どこで、誰として動いているか）から身元を決め、短い期間で自動に回す。秘密の範囲は「どの属性の組に一致したら発行するか」の宣言で表す。
- 必要な入力：selectorを作るattestor、registration entry（親と、selectorの組と、身元）、回転の判定の方針。
- trade-off・失敗の仕方：selectorの組が緩いと、意図しないworkloadが同じ身元を得る（部分集合の判定のため、entry側のselectorが少ないほど広く当たる）。cacheのcommentは、性能のためにcacheに出し入れするdataを複製せず、利用者がdataを変更してはならないと書く（契約で守る不変条件）。
- 反例・適用しない場合：sopsはfileのpathで鍵を選ぶ（P21-O04）。OpenBaoはtokenとpolicyで秘密の取得を許す（policyの読み方は今回読んでいない）。
- 互換・非互換：P21-O13のserver側の段階と対になる。P21-O11（cert-manager）とは、更新時刻の決め方（割合とjitterか、余裕の指定か）が異なる。
- 限界：割合、jitterの幅、目標値などは持ち込まない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 鍵の保管（KEKとDEKの分離） | sops：file単位のdata keyを複数のmaster keyで包む（O01） | tink：message単位のDEKをKEKで包む（O01）。OpenBao transit：利用側にDEKを渡さずserverで暗号化（O08） | dataの単位（file、message、request）。KEKへの呼出し回数を許せるか |
| 鍵の版の表し方 | tink：鍵IDと状態（有効・無効）、主鍵（O05・O06） | OpenBao transit：版の番号と最小版（O08）。OpenBao barrier：term（O09）。sops：版なし（O04） | 古い暗号文を残すか、作り直すか |
| 回転の契機 | OpenBao barrier：暗号化回数と周期（O09）。cert-manager：検査の連鎖と期限前の余裕（O11） | SPIRE：残り期間とjitter、汚染の通知（O14）。sops：人の明示操作（O04） | 方式から来る使用回数の上限、自動化の有無 |
| 回転と失効の分離 | OpenBao transit：最小復号版（戻せる）とtrim（戻せない）（O08） | tink：無効化（戻せる）と削除（O05）。SPIRE：taintとrevoke（O13） | 戻せる操作と戻せない操作を分けるか |
| 動的秘密と失効 | OpenBao：lease、token索引、path接頭辞、失効の再試行（O10） | SPIRE：短命の証明書と信頼束からの除去（O13）。cert-manager：期限前更新（O11） | 外部systemに秘密を作るか、自分で署名する身元か |
| 秘密の範囲 | sops：fileのpathと最初に一致した規則、値の経路（O03・O04） | SPIRE：selectorの部分集合（O14）。OpenBao：発行pathとtoken（O10） | 静的なfileか、実行時の属性か、発行の経路か |
| 誤用の防止 | tink：平文出力の別package、token、秘密を含まない表示（O07） | SPIRE：鍵をSignerとしてだけ渡す（O13）。OpenBao：鍵ごとの `exportable`（O07）。cert-manager：statusの名前を信用しない（O12） | 危険な経路を型で分けるか、属性で宣言するか、出所で拒否するか |
| 鍵の再利用の既定 | cert-manager：既定を再利用から毎回作り直しへ変更（O12、PR #7723） | sops：回転ごとにdata keyを作り直す。変更のない値のIVは再利用（O04） | 利用者の期待と、差分・固定（pinning）との両立 |

## 見つからなかったこと・gap
- 5 repoとも、「どの秘密がどこで使われているか」の一覧（秘密の在庫）を持つ仕組みは、今回読んだ範囲に無かった。OpenBaoのleaseは発行した秘密の一覧になるが、静的な秘密（kv）は対象外である（kvは読んでいない）。
- 漏洩を検知した後の手順（どの範囲を回転・失効するか）を設計文書として書いたものは、SPIREのtaint／revokeの操作説明（O13）以外に見つからなかった。taintからrevokeまでに何を確かめて待つかは、SPIREの文書にも無かった。
- sopsで、master keyを外した後に過去の版（gitの履歴）に残る暗号文の扱いは、コードの範囲では扱われていない（O04）。公式のdocsはwebsiteに移っており、repo内の `README.rst` は短い入口だけだった。
- tinkの、無効な鍵を復号の候補から除く箇所（primitive setの生成）は読んでいない（O06）。
- OpenBaoのtoken・ACL policy（pathごとの許可）による秘密の範囲、response wrapping（`internal/vault/wrapping.go` のcubbyholeでの一回限りの受渡し）、unseal（root keyの分割）は、存在を確認しただけで読んでいない。
- cert-managerの失効（CRL、OCSP）は、今回読んだ範囲に無かった。
- ADR形式の設計記録は5 repoとも見当たらなかった。判断の根拠はcode comment、API説明、PR本文にある（cert-manager #7723は例外的に変更理由と選んだ案が本文にある）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：5 repoを作業用の一時領域へ `git clone --filter=blob:none --no-checkout` し、固定commitをcheckout（core.hooksPathを無効化）。読むだけで、build・test・script・hookは実行していない。GitHub APIでmetadata、PR、issueを読んだ。
- sops：`sops.go`（440–700, 760–900）、`cmd/sops/rotate.go`（全体）、`cmd/sops/common/common.go`（75–125）、`config/config.go`（120–205, 570–616）、`aes/cipher.go`（25–60, 115–160）、`keyservice/server.go`（1–40）、`README.rst`（見出し）。issue #220。読んでいないもの：各master key実装（`kms`、`age`、`pgp`、`hcvault`等）、`keyservice` のgRPC定義、`stores`、`audit`、`decrypt`。
- tink-go：`keyset/manager.go`（255–364）、`keyset/handle.go`（240–360, 400–530）、`aead/aead_factory.go`（120–159）、`aead/kms_envelope_aead.go`（15–230）、`internal/prefixmap/prefixmap.go`（71–92）、`insecurecleartextkeyset/insecurecleartextkeyset.go`（15–60）、`insecuresecretdataaccess/`（package全体）、`secretdata/secretdata.go`（comment）。読んでいないもの：`keyset/validation.go`、primitive setの生成、`jwt`、`streamingaead`、`keyderivation`、`docs/`。
- openbao：`sdk/helper/keysutil/policy.go`（80–90, 470–535, 615–700, 1100–1135）、`internal/builtin/logical/transit/path_trim.go`（46–121）、`path_rewrap.go`（help文）、`path_datakey.go`（20–79の項目説明）、`internal/vault/barrier/keyring.go`（1–160）、`internal/vault/barrier/aes_gcm.go`（1016–1050, 1160–1250）、`internal/vault/core.go`（3095–3130）、`internal/vault/expiration.go`（240–300, 1129–1160, 1258–1330, 1482–1560）、`sdk/framework/lease.go`（30–113）、`internal/builtin/logical/database/secret_creds.go`（1–170）。issue #2413（題名のみ）。読んでいないもの：token store、ACL policy、`wrapping.go`（存在のみ）、seal／unseal、`pki` backend、`website/`。
- cert-manager：`internal/controller/certificates/policies/policies.go`（1–132）、`pkg/util/pki/renewaltime.go`（56–100）、`pkg/apis/certmanager/v1/types_certificate.go`（175–220, 345–420）、`pkg/controller/certificates/keymanager/keymanager_controller.go`（155–272, 288–305, 336–390）。PR #7723（本文）、#8287（題名のみ）。読んでいないもの：`checks.go` の各検査の本体、`issuing` controller、`revisionmanager`、ACMEの発行経路、CRL・OCSP。
- spire：`pkg/server/ca/manager/manager.go`（36–50, 258–365, 859–905）、`slot.go`（700–770）、`pkg/server/plugin/keymanager/keymanager.go`（1–80）、`pkg/agent/svid/rotator.go`（160–240）、`pkg/common/rotationutil/rotationutil.go`（1–145）、`pkg/agent/manager/cache/lru_cache.go`（100–125）、`doc/spire_server.md`（740–875）、`doc/spire_agent.md`（11–33, 65）。読んでいないもの：`journal.go`、`pkg/server/ca/rotator`、datastoreのtaint処理、node attestation、`doc/authorization_policy_engine.md`。
- 検索した語：`rotate`、`ShamirThreshold`、`KeyGroups`、`MinDecryptionVersion`、`ErrTooOld`、`trim`、`rewrap`、`irrevocable`、`RevokePrefix`、`RevokeByToken`、`CalculateTTL`、`RotationPolicy`、`NextPrivateKeySecretName`、`taint`、`revoke`、`ShouldRotateX509`、`subset`、`hasSecrets`、`insecure`。GitHub検索：「DefaultPrivateKeyRotationPolicyAlways」（cert-manager PR）、「iv reuse」（sops issue）、「irrevocable lease」（openbao issue）。
- 選ばなかった候補：hashicorp/vault（license変更後のrepoで、同じ系統のopenbaoを読んだ）、tink-java（Go版で足りると判断）、external-secrets、sealed-secrets（今回は5 repoで足りると判断して読んでいない）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。cert-manager #7723のようにPR本文に変更理由がある場合、それをコードと同じ強さの根拠にするか、判断史として別に扱うかは未決。題名だけ読んだissue・PR（openbao #2413、cert-manager #8287）の扱いも未決。
- scope：観察は、鍵・秘密の管理のうち、保管（envelope）、版と回転、失効（lease、taint／revoke）、範囲（path、selector）、誤用防止に限っている。HELIXのD08で、どの層（製品のdata暗号化、基盤の秘密配布、workload間の身元）へ対応させるかは未決。D08の「Web展開後の内容を1.0の必須にしない」の境界に、どの観察が当たるかも未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。cert-managerの既定値の変更のように、製品の版で意味が変わる設定がある。commit SHAとreleaseの版のどちらを主キーにするかは未決。
- 状態：全観察（P21-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
