# DT-MSG-001 接続契約（方向・データの意味・順序・timeout・再送・冪等性・部分失敗）

status: scaffold（seed候補。採否なし）
authority_effect: none

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-MSG-001`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-BRAIN（汎用の構造）。製品への適用と設計義務の導出はHELIX-HARNESS-CORE（HARNESS-L2-009） |
| 適用条件 | 二つ以上の単体（機構、module、外部service、process）の間でdataまたは操作の要求が境界を越える場合。接続の辺ごとに1回適用する。境界を越えない単体内の呼出しはN/A（理由必須） |
| 適用判定の記録 | required／conditional／N/A／unresolvedと、理由・判断者・対象revision・再評価条件（DST-HARNESS-006）。記録の欄はDT-VT-001 §2と同じ形を使う |
| 必須入力 | 接続の両端と、各端の意味契約の持ち主。方向（一方向／二方向）。越えるdataの意味（何を表すか、誰が正本を持つか）。両端の契約revisionと互換範囲。期限・再送・重複の扱いについて要求が定めていること。**欠けたら設計を進めず、欠けた入力を質問・要求候補として上流へ戻す（DST-HARNESS-004）** |
| 関係 | DT-SDOP-004 §4・§5（異常系の4問と冪等性・排他の方式。本templateは辺ごとの契約を持ち、方式の選択はSDOP-004を使う）、DT-SDOP-002 A（timeout・retry・circuit breakerの全体方針。本templateは辺ごとの値の置き場所だけを持つ）、DT-MSG-003 §4（外部interfaceのときの版・廃止）、DT-MSG-005（複数の辺の構成）、DT-VT-104（L4↔L9 境界の照合）、DT-VT-105（L5↔L8） |
| 区分 | connection |
| 対（V-pair） | 主にL4↔L9（境界の形）とL5↔L8（timeout・再送・冪等性の詳細）。検証の方法はDT-VT-104・105 |
| 計測 | 数値（timeout、再送の上限、backoff、期限）を置かない。値は要求とL3以降で根拠付きで導く。測る場合はHARNESS-L2-034の14項目に従う |
| 1.0の境界 | — （本番の障害注入・chaosはWeb展開後。DT-VT-104と同じ） |
| 出典 | DST-HARNESS-003（unit templateだけで接続を満たしたとしない）、design-template-system-requirements.md 80行（最小seedの接続領域）。HELIX自身の接続については現行のHELIXCONNECT-L2-001〜007・009の共通契約（connect-requirements.md 43–52）と同じ観点であることを確認した（意味は変えず参照のみ）。旧資産は下の「旧HELIXとの対応」 |
| 限界 | 欄の集合は材料であり、正式なschemaではない。業務上の意味（受け取った結果をどう判断するか）は接続先の持ち主が決め、本templateは決めない |
| 置き換え | 正式な接続契約templateが入ったら`superseded`とし、各欄の行き先を対応づける。旧版で書いた設計は旧版のまま読めるようにする |

### 不成立例（negative oracle）

- 方向を書かず、一方向の登録・受信・ACKから逆向きの送信を許したことにする。
- dataの項目名と型だけを書き、意味（何を表すか）と正本の持ち主を書かない。
- timeoutした呼出しを「失敗」または「成功」のどちらかに丸め、結果不明（unknown）として扱わない。
- 再送の上限、再送してよい失敗とそうでない失敗の区別を書かない。業務上の拒否まで再送する。
- 同じ冪等キーで内容（digest）が違う要求を、再送として処理する。
- 3件中2件が書けた等の部分成功を、成功または全体失敗に丸める。どこまで届いたかを残さない。
- 順序を前提にしているのに、順序が崩れた・欠けた・重複したときの扱いを書かない。
- 契約revisionが変わった後も、前に確かめた互換性で送信を続ける。
- 単体のtemplateを両端に適用しただけで、接続の設計を済んだとする（DST-HARNESS-003）。

### 正例と境界の負例

- 正例：機構Aから機構Bへの一方向の通知。dataの正本はA、Bは読むだけ。冪等キーはAが発行し、同じキー・同じdigestの再受信はBで効果なし、同じキー・違うdigestは衝突として拒否。timeout後はunknownとして記録し、再送は上限まで、上限に達したらAの持ち主へ未完として戻す。値は「L3で導く」と書かれている。
- 境界の負例：同一process内のpure関数の呼出し。境界を越えないので本templateはN/A（理由：process境界・持ち主の境界を越えない）。DT-MSG-004を使う。

### 完了条件

辺ごとに§1〜§7が埋まっている、または理由付きのN/Aである。unknown・部分成功の扱いが成功へ丸められていない。値が未決の欄は「L3以降で導く」と未決の行き先が書かれている。各欄が検証（DT-VT-104・105の観点）へ結ばれている。**完了条件を満たしても、接続の設計が正しいこと・要求を満たすことを意味しない。**

## 設計の要点

- 接続は単体の和ではない。両端が正しくても、間の約束（方向、意味、順序、期限、重複、途中まで）が書かれていなければ、接続は成り立たない。
- 結果は「成功・失敗・不明」の三つで持つ。不明を成功にも失敗にも丸めない。不明は持ち主へ戻す。
- 再送は「同じ操作を、同じ内容で、上限まで」に限る。内容が違えば再送ではなく別の操作である。
- 途中まで成功は最も穴が出る。どの段まで届いたかを、接続・操作・試行のidentityに結び付けて残す。
- 境界ではdataの意味と正本の持ち主を明示する。受け取った側は意味を書き換えない。

## 本体

### 1. 接続のidentityと方向

| 項目 | 記入 |
|---|---|
| 接続ID | |
| 接続元（持ち主） | |
| 接続先（持ち主） | |
| 方向 | 一方向／二方向（二方向は向きごとに別の行として書き、それぞれの権限を確かめる） |
| 同期・非同期 | |
| 越えるもの | data／操作の要求／event |

### 2. dataの意味と所有

| 項目（field） | 意味 | 正本の持ち主 | 相手側の項目との対応（変換） | 受け側が書き換えてよいか | 分類（DT-MSG-003 §2） |
|---|---|---|---|---|---|
| | | | | | |

### 3. 契約revisionと互換

- 両端の契約revision：
- 互換範囲（どの組合せなら通してよいか）：
- revisionが変わったときの扱い（stale化、再照合まで送信を止める）：
- 互換が確かめられないとき（unknown）の扱い：

### 4. 順序

- 順序の前提：なし／接続内で順序あり／因果順序（原因より先に結果を確定しない）
- 順序が崩れた・欠けた・重複したときの扱い：拒否／保留／並べ替え／無視（理由）
- 並列に流す場合の合流（join）の条件：

### 5. 期限・timeout・再送

| 項目 | 記入 |
|---|---|
| 期限（操作ごと） | 値はL3以降。ここでは「どの操作に期限が要るか」と根拠 |
| timeout時の結果 | unknownとして記録（成功・失敗に丸めない） |
| 再送してよい失敗 | 例：一時的な技術失敗 |
| 再送しない失敗 | 例：業務上の拒否、権限の失効、契約不一致 |
| 再送の上限・間隔 | 値はL3以降。上限に達したときの戻し先 |
| 再送で変えないもの | 操作ID、内容digest、scope、契約revision（一つの操作で旧新revisionを混ぜない） |

### 6. 冪等性と重複

- 冪等キー：発行元、含める要素、保存期間の決め方（値はL3以降）
- 同じキー・同じ内容：効果なしで同じ結果を返す
- 同じキー・違う内容：衝突として拒否
- 方式の選択（冪等キー、一意制約、状態チェック、処理済みIDの記録）：DT-SDOP-004 §5

### 7. 部分失敗と不明

| 段 | 届いたことを何で確かめるか | 途中で止まったときの状態 | 戻し先（持ち主） | 補償・再開の方法 |
|---|---|---|---|---|
| | | | | |

- ACKなし・結果未回収は未完として持ち主へ戻す。業務の完了にしない。
- 補償（取り消し）を行う場合は、補償自体の失敗の扱いも書く。

### 8. 追跡

- 辺・操作・試行のidentityと順序で、登録・照合・送信・受信・再送・終端・stale・拒否を辿れるか：
- 追跡に本文（raw payload）、secret、credentialを残さない（DT-MSG-003 §3）。

### 9. 検証への対応

| 欄 | DT-VT-104／105の観点 | oracle ID |
|---|---|---|
| | | |

## 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点 | 理由 |
|---|---|---|---|
| `LEGACY-ASSET-429C82941E059B0F3D12` `docs/skills/api-and-interface-design.md` 39–51（SHA-256 `721b1067ec8cafa5e5063eac2b573077b0da3c6c67fdfef48c8610432509e50b`） | 境界を越えるごとにsource、target、data direction（read／write／event）、ownership（各側のschemaを誰が持つか）を記録する | `helix vmodel lint`・PLAN `requires`への結び付けは持ち込まない | 旧CLI・旧PLAN形式は現行の経路ではない（AGENTS.md） |
| `LEGACY-ASSET-2EFC00A82748E40D2568` `docs/design/harness/L4-basic-design/external-if.md` 57–70・74–87・125–134（SHA-256 `52c9ec954373b1fe6c540379cb10f8af7670e0df8072598c4761eafba5732763`） | 境界ごとのprecondition／postcondition／invariant、外部が不在・errorのときの振る舞いを境界ごとに書く、silent fallbackを通常の経路にしない、L4は「what／形状」、引数・error型・retry・timeout・冪等性はL5で決める粒度の分け方 | 旧の具体的な外部service（Claude、Codex、GitHub、Sentry等）と旧mode名を写さない | 特定の製品の境界ではなく、汎用の接続の欄にする（BRAINは製品固有の意味を持たない） |
| `LEGACY-ASSET-A440E0F5465A4EBF9855` `docs/design/harness/L5-detailed-design/if-detail.md` 47–63（SHA-256 `e0eb73c02383e1151e72558e4eb0caf436d19105465dd739de3390216a931d96`） | retryは再送してよい種類（rate-limit、timeout）に限り、auth・不在は再送しない。同一intentの再実行で副作用を二重化しない。error分類ごとにfail-closeへ写す | 旧の「最大N回」「30s」等の例と、timeoutを「skip+warn」にする旧の扱いは持ち込まない | 数値は置かない（L3で導く）。timeoutを成功側へ寄せず、unknownとして持つ現行HELIXCONNECT共通契約（connect-requirements.md 49）と揃える |
| `LEGACY-ASSET-BB08D70A42B6445B2D1E` `docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md` 34–43・66–89（SHA-256 `9e18d68b5e463192fb30b839eb164d79f7202a15374482f65181b238df8e513d`） | 因果順序（原因より先に結果を確定しない）、同一ID・同一digestは副作用なしで吸収、同一ID・異digestは拒否、partial writeを成功扱いしない | 11 fieldのenvelope、`harness.db`、旧Issue番号は持ち込まない | 順序と冪等性の判定の考え方だけを汎用の欄にする |
| `LEGACY-ASSET-0327D0DF98618D3066FD` `docs/design/harness/L6-function-design/source-boundary-contracts.md` 38–39・60–70（SHA-256 `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a`） | timeout・nonzeroをsuccessにしない、partial targetをacceptedにしない、intentに冪等キー・期限を持たせる、送信後のdriftはuncertainとして返す | Node probe adapter、署名receipt、`O_EXCL`等の実装指定は持ち込まない | 実装方式はL5以降で選ぶ |
| `LEGACY-ASSET-E2D57A016FBD3D312CFA` `docs/skills/api-contract.md` 33–48（SHA-256 `b839109625d6744a72570bd54c681b04bf63b3daf6e71877e6cd1cacb13f9ab4`） | provider・consumer・schema・error契約・互換class、L5で冪等性の保証を足す | 契約docの置き場所（`docs/design/<product>/L4-basic/`）は持ち込まない | 置き場所は新世代の文書構成で決める |

旧HELIXに「方向・順序・timeout・再送・冪等性・部分失敗」を**一枚の接続契約template**として束ねた物は見つからなかった（検索範囲は`materials/legacy-source-inventory.md` §2）。旧HELIX自身も、設計文書種の台帳`LEGACY-ASSET-EC07511FF3E241F15359` `docs/design/design-catalog.yaml` 609–613（入出力設計書）・716–720（イベント・メッセージスキーマ設計書）・737–741（外部連携設計書）を`status: todo`（専用の設計templateが無い）としていた（SHA-256 `4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864`）。束ね方（§1〜§8の並び）は新規案である。各欄の意味は上の旧sourceに根拠がある。

### 参考資料（PO提供の参照用ZIP。旧HELIXの資産ではない）

| 参照 | 使った点 | 使わない点 |
|---|---|---|
| `archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`（SHA-256 `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3`）内 `hybrid-docgen/templates/42_外部連携設計書.yaml` 11–19・33–42・68–81（entry SHA-256 `7ea1c2d189fab2498b15af90443295e7a0529ce1ff30c16fc705023b167c68cb`）、`39_イベント・メッセージスキーマ設計書.yaml` 11–17（entry SHA-256 `0f7f8a839f461614dcb0ac6c093bd936444171bbcdeb5ad751b00c9c48ec5f3c`） | 連携先ごとの方向、エラー・リトライ、外部項目→内部項目の変換（§2の「相手側の項目との対応」欄）、スキーマの進化・版 | 章立てのExcel生成、`tools/build.py`、監視の閾値・通知先の欄（DT-SDOP-003の範囲）。ZIP内のtoolは実行しない（SCF-B-0151 README 101–103 HVM-REJECT-01〜03） |
