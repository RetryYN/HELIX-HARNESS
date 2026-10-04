# DT-MSG-003 権限・privacy・外部interface（操作ごとの権限、dataの最小化、保持と削除、外部interfaceの契約）

status: scaffold（seed候補。採否なし）
authority_effect: none

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-MSG-003`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-BRAIN（汎用の構造）。製品への適用と設計義務の導出はHELIX-HARNESS-CORE（HARNESS-L2-009）。HELIX自身の機構の権限・secret・egress・公開区分の要求はHELIX-SECURITYのL2候補が持ち、本templateはそれを再定義しない |
| 適用条件 | §1：利用者・actorごとに許す操作が違う対象。§2・§3：個人や組織の情報、秘密、外部へ出るdataを扱う対象。§4：外部（別の持ち主、別の製品、公開されるAPI・CLI・file形式）に向けたinterfaceを持つ対象。当たらない節は理由付きN/A |
| 適用判定の記録 | required／conditional／N/A／unresolvedと、理由・判断者・対象revision・再評価条件（DST-HARNESS-006、DT-VT-001 §2の形） |
| 必須入力 | 誰が何をしてよいかについて要求が定めていること。扱うdataの種類と、それを扱う目的。保持・削除・外部提供についての要求と準拠すべき法令・規格（DT-SDOP-002 Eの入力）。外部interfaceのconsumer。**権限の範囲、個人情報の扱い、法令の解釈は要求側・人の判断であり、設計者やAIが補わない。欠けたら上流へ戻す（DST-HARNESS-004）** |
| 関係 | DT-SDOP-002 E（認証方式・暗号化・脆弱性診断・監査ログ等、案件全体のsecurity要件の値）、DT-SDOP-006（AWS採用時）、DT-MSG-001（接続を越えるdataの分類）、DT-MSG-002 §2（削除）、DT-MSG-005（構成体の境界）、DT-VT-104・105 |
| 区分 | unit（操作ごとの権限）、connection（外部interface、外部へ出るdata） |
| 対（V-pair） | 主にL3↔L10（誰が何をしてよいかの要件）、L4↔L9（境界と外部interface）、L5↔L8（拒否・errorの振る舞い）。検証の方法はDT-VT-103〜105 |
| 計測 | 数値（保持期間、期限、rate limit）を置かない。値は要求とL3以降で導く |
| 1.0の境界 | Web公開に伴う公開境界（全sinkへの公開区分の強制、外部からの攻撃への対策の必須化、脆弱性scanの必須化）は本templateの1.0の必須欄にしない。Web展開後に扱う（PO方針。SCF-B-0152・0153 READMEと同じ扱い） |
| 出典 | design-template-system-requirements.md 82行（permission、privacy、external interface）。旧資産は下の「旧HELIXとの対応」 |
| 限界 | 法令・規格の適合を判断する物ではない。欄を埋めても安全であることを示さない。脅威の洗い出しは機械的な確認では済まない（旧`threat-model.md` 98–99と同旨） |
| 置き換え | 正式な権限・privacy・外部interface templateが入ったら`superseded`とし、各欄の行き先を対応づける |

### 不成立例（negative oracle）

- 「ログインしていれば使える」のように、一つの許可から書き込み・削除・公開まで全部を許したことにする。
- 権限が欠けた・分からない・期限切れのときの扱いを書かない、またはそのときに許可する。
- 他人・他の組織・削除済みの対象を、IDを直接指定して操作できるかを考えていない。
- 扱うdataの項目を目的と結び付けず、「念のため」全部を取る・渡す・残す。
- 個人情報・秘密をlog、error message、追跡の記録、AIへのcontextへそのまま出す。
- 保持期間と削除の方法を書かない。または削除の記録なしに消す。
- 外部interfaceに版がなく、項目の削除・rename・型変更を予告なしに行う。
- 外部interfaceのerrorの返し方に、内部の情報（stack trace、内部のpath、DBのerror）を含める。
- 外部interfaceのconsumerを把握せず、使われている項目を消す。
- 逆に、要求にない制限（全操作に人の承認、全dataの暗号化必須等）を設計者が足して、要求の意味を変える。

### 正例と境界の負例

- 正例：文書の編集機能。§1で閲覧・編集・削除・公開を別の操作として書き、権限が分からないときは拒否。§2で保存する項目ごとに目的を書き、表示名だけが要る箇所へ連絡先を渡さない。§3でlogに本文と個人の識別子を残さず、保持の値は「L3で導く」と未決の行き先がある。§4で外部APIの版と、項目を消すときの予告の手順がある。
- 境界の負例：社内の一人だけが使う、外部へdataを出さない計算tool。§1は「利用者1名、操作の区別なし」と理由付きで簡略、§2・§3は扱うdataを書いたうえで個人情報なしならN/A、§4はN/A。

### 完了条件

当たる節が埋まっている、または理由付きN/Aである。権限が欠けた・分からないときに許可しないことが書かれている。扱うdataの各項目が目的に結ばれている。外部interfaceは版と変更の手順を持つ。値が未決の欄は未決の行き先がある。**完了条件を満たしても、安全であること・法令に適合すること・要求を満たすことを意味しない。**

## 設計の要点

- 権限は操作ごとに分ける（読む、書く、消す、実行する、外へ出す、公開する）。一つの許可から別の操作の許可を作らない。
- 分からない・欠けた・期限切れを許可へ読み替えない。ここだけは常に守る。それ以外の制限の深さは要求とriskで決め、全部を最大にしない（DT-SDOP-002の「全部を最大にしない」と同じ考え方）。
- dataは目的に要る分だけ取り、要る分だけ渡し、要る間だけ残す。
- 個人情報・秘密は、値ではなく分類・digest・理由を記録する。
- 外部interfaceは約束である。版を付け、壊す変更は予告と移行の手順を経る。

## 本体

### 1. 操作ごとの権限

| 操作 | 対象 | 許すactor・role | 条件（scope、期限、状態） | 欠けた・分からない・期限切れのとき | 拒否の返し方 |
|---|---|---|---|---|---|
| | | | | 拒否 | |

- 「自分の物以外」（他人・他の組織・削除済み）を直接指定したときの扱い：
- roleを一段下げたときに同じ操作ができないこと：
- 権限・認証の方式（DT-SDOP-002 Eの値）との対応：

### 2. dataの分類と最小化

| 項目 | 分類（公開／内部／機密／個人情報／秘密） | 目的（要求ID） | 根拠（法令・契約。要求にある場合） | 取る | 渡す先 | 残す（保存先） |
|---|---|---|---|---|---|---|
| | | | | 要／不要 | | 要／不要 |

- 分類が付いていない項目を、公開と推定しない。
- 目的に結べない項目は取らない。取る場合は要求へ戻して目的を確かめる。

### 3. privacy（保持・削除・記録）

| 項目 | 保持の要求 | 削除の方法と記録 | log・error・追跡・AIへのcontextへ出してよいか | 出すときの形（伏せる、digest、分類だけ） |
|---|---|---|---|---|
| | 値はL3以降 | | | |

- 利用者の依頼による削除・開示・訂正の要求があるか（要求にある場合だけ書く。設計者が足さない）：
- 国・地域を越える移転、外部への委託があるか（要求にある場合だけ書く）：

### 4. 外部interfaceの契約

| 項目 | 記入 |
|---|---|
| interface ID | |
| provider（持ち主） | |
| 既知のconsumer | |
| 項目（名前、型、必須／任意、意味） | |
| errorの契約（種類、返す条件、返す内容。内部の情報を含めない） | |
| 互換の区分（stable／beta／internal） | |
| 版の付け方 | |
| 壊す変更（削除、rename、型変更、意味の変更）の扱い | 新しい版、予告、移行の期間（値はL3以降）、consumerの移行の確認 |
| 壊さない変更（任意の項目の追加等） | |
| 外部へ通信を足すときに先に書くもの | 宛先、認証の方式、失敗時の振る舞い |

### 5. 脅威の確認（対象に応じて）

外部からの入力や権限の境界を持つ対象では、境界ごとに次を問う（STRIDE、出典：Microsoftの脅威分類。採用・手法の選定ではない）。深い分析の進め方はHELIX-OSの司会進行で扱う手法（SCF-B-0152 `os-decision-facilitation-input.md`）であり、本templateは問いの欄だけを持つ。

| 境界 | なりすまし | 改ざん | 否認 | 情報の漏れ | 停止 | 権限の昇格 | 答えのない問い（open） |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

### 6. 検証への対応

| 欄 | 確かめる内容 | DT-VTの観点 | oracle ID |
|---|---|---|---|
| §1 | 許可・拒否・欠落時の拒否・他人の対象 | | |
| §3 | log・errorに出ないこと | | |
| §4 | 項目のrename・削除がconsumerの契約でfailになること | DT-VT-104 | |

## 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点 | 理由 |
|---|---|---|---|
| `LEGACY-ASSET-E2D57A016FBD3D312CFA` `docs/skills/api-contract.md` 33–48・59–66・75（SHA-256 `b839109625d6744a72570bd54c681b04bf63b3daf6e71877e6cd1cacb13f9ab4`） | provider、consumer一覧、schema、error契約、互換class（stable／beta／internal）、stableでは削除・rename前に廃止期間、壊す変更は版を上げてconsumerを更新、不正入力とschema不一致のerror経路を最低1つずつ | `helix doctor`、`artifact_registry`、PLAN `generates`は持ち込まない | 旧CLI・旧PLAN形式は現行の経路ではない |
| `LEGACY-ASSET-1748EB65920E9CD3056C` `docs/skills/api.md` 32–46・48–56（SHA-256 `8cd7e609a65e1cbd8ccec7d243535862668157915059f2ffef89e5f4f652d9e6`） | L3は呼ぶ側から見えるものだけ、L4でshape・error・版の方針、L5でserialisation・認証方式・rate limit、壊す変更は新しい版・足す変更は壊さない、版の判断をコードのcommentだけに置かない | `/v<N>/` path prefix、`Deprecation` header等の具体の方式は持ち込まない | 方式は製品・L5で選ぶ。seedは欄だけを持つ |
| `LEGACY-ASSET-2489EB465FD99C6961DB` `docs/skills/security.md` 40–49（SHA-256 `0ceae9a477ff610c41e80c01ce4bd7f180dc318b52e7273614e9a3d350bb902e`） | 認証・認可logicの変更とPIIの処理・保存は、自己判断せず上へ上げる境界 | agent-guardの5規則、`.claude/settings.json`、`HELIX_ALLOW_RAW_AGENT`は持ち込まない | 旧HELIX自身のruntimeの防御であり、製品設計の汎用の欄ではない。現行では人の判断が要る範囲をAGENTS.mdの規則で決める |
| `LEGACY-ASSET-EAE3071CBB838B8FB1E3` `docs/skills/threat-model.md` 49–62・92–99（SHA-256 `e510618606aca9d65c6f9cc8bdf48bc6f520ceceb683736c28b756a85af77158`） | 境界ごとのSTRIDE-liteの問い、答えのない問いはopenとして残す、内部だけの面も省かない、機械的な確認のgreenを脅威分析の完了としない | 旧HELIX固有の4つの面（agent tool、hook、allowlist、state file）と`helix guardrail`は持ち込まない | 製品ごとの面は適用時に書く |
| `LEGACY-ASSET-679FD45E5E541F11BC62` `docs/skills/security-and-hardening.md` 81–87（SHA-256 `ab370c7eda5b7d14af1d730191d4866f6e012ab89a63444a05ccb0afe24dec74`） | 新しい外部通信は、宛先・認証の方式・失敗時の振る舞いを設計に先に書く。文書・記録に個人情報を残さない | npm・Biome・`helix guardrail`のhardening手順は持ち込まない | 実装時の点検手順であり設計templateの欄ではない |
| `LEGACY-ASSET-EF44FCF2D722F986E609` `.claude/agents/be-api.md` 47–50・68–73（SHA-256 `f4f9c9645c248a3e998ee5b92307ce0b04edc6421dc1eb4779820c867e489cbd`） | 入力・業務・DBの各層での確かめ、errorの返し方に内部の情報を含めない | JWT、REST、status codeの具体の推奨は持ち込まない | 技術の選定ではない |
| `LEGACY-ASSET-C3DE79BA9451172F3E43` `docs/design/helix/L5-detail/product-data-connector.md` 142–154（SHA-256 `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04`） | 全項目に分類を持たせる、AIのcontextへ渡せる項目を明示のallowlistに限る、未分類を通常の保存に入れない、伏せた記録には方針・項目path・digest・件数だけを残す、保持期限の削除にも記録を要する | `HIL_*` token、freshnessの値は持ち込まない | 判定の考え方だけを汎用の欄にする |
| `LEGACY-ASSET-7A6AE033EE171D1CE604` `docs/skills/harness-observability.md` 70–74（SHA-256 `5c29e78ac67741011e7bdad3837935d3cb329319e146c43e8c8bf884b9fcf240`） | 観測の記録にkey・token・credential・PII・promptの本文を保存しない、記録の前に伏せる段を置く | `projection-writer.ts`は持ち込まない | 実装の置き場所は現行で決める |
| `LEGACY-ASSET-12A39A2481B480E18FE2` `docs/skills/test-thinking.md` 55–57（SHA-256 `853f22744fe2cad42f5cb586d84e7198daaf01c00acbcfac56c383c220a8d545`） | 「自分のもの以外」を常に試す（IDOR）、roleを一段下げて同じ操作 | テストの視点を、設計時に権限の欄へ書く問いとして使う | 設計の段で欄があれば検証の段で確かめられる（DT-MSG-006） |

「data minimization（目的に要る分だけ取り、渡し、残す）」を製品設計のtemplateの欄として持つ物は、旧HELIXでは見つからなかった。旧HELIX自身も設計文書種の台帳`LEGACY-ASSET-EC07511FF3E241F15359` `docs/design/design-catalog.yaml` 696–700でプライバシー設計書を`status: todo`（「PIIはescalation対象として触れるがDPIA/ROPA相当の設計書は無い」）、737–741で外部連携設計書を`todo`としていた（SHA-256 `4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864`）。近い記述は旧`product-data-connector.md` 142–154（allowlistと分類）と、現行HELIXSECURITY-L2-006（security-requirements.md 123–124、HELIX自身のegressのdata minimization）である。§2の「項目ごとに目的を結ぶ」欄は新規案である（検索範囲は`materials/legacy-source-inventory.md` §2）。STRIDEは一般の脅威分類（出典：Microsoft）であり、旧`threat-model.md`も用いていた。採用・手法の選定ではない。

### 参考資料（PO提供の参照用ZIP。旧HELIXの資産ではない）

| 参照 | 使った点 | 使わない点 |
|---|---|---|
| `archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`（SHA-256 `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3`）内 `hybrid-docgen/templates/36_プライバシー設計書.yaml` 11–18・32–40（entry SHA-256 `925a90f9ea7db642b19a42c7d760e8c6a8e54d397037af4981c507ea5229c0de`） | 個人dataの種別・目的・法的根拠・保存先の表（ROPA）、本人の権利への対応、越境移転・委託、最小化・保持・削除の章立て（§2・§3の欄） | DPIA（影響評価）の章を必須の欄にしない。DPIAが要るかは要求・法令の判断であり、全対象に課すと過剰な制限になる。ZIP内のtoolは実行しない（`scaffold/research/design-pattern-inventory-20260925/README.md` 101–103 HVM-REJECT-01〜03） |
