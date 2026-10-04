# D08 Security：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`brain-requirements.md` 90）の初期領域の一つ。本書では「製品の設計で使うsecurityの知識：脅威の洗い出し、認証・認可の方式、入力の扱い、秘密の扱い、依存の供給網、errorやlogからの漏れ、外から来る内容の扱い」を扱うと仮に読む。HELIX自身の機構の安全（HELIX-SECURITY）の要求ではない。

**過剰に制限しない／前倒ししない**：本書の素材は、対象に応じて使う知識の候補であり、全製品に課す義務ではない。公開境界の強制、脆弱性scanの必須化、本番のnetwork policy等、Web展開後に扱う内容は1.0の必須にしない（`scaffold/verification-test-template-seed-20261001/README.md`「Web展開後に扱う内容」、`scaffold/research/design-template-seed-minimum-gap-20261004/README.md`「未作成にした領域と理由」のsecurityの行）。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D08-M01 | LEGACY-ASSET-45405D360662F07F483D | `.claude/agents/security-audit.md` | 21–79 | fdedf0641aaf0a6a8439ef72128fcbd0a036d51095156283f06b4a1a134c2d3d | 推測で脆弱性を断定せず、悪用経路の証拠（箇所と再現条件）でseverityを決める、実害（data流出、権限昇格、仕様不達）に繋がる所見だけを高severityにする。OWASP Top 10の分類ごとの確かめ方、認証・認可の監査点（tokenの署名と期限、cookieの属性、権限matrix、API keyの更新方針）、入力の扱い（許可list方式、escape・parameter化、upload）、秘密の扱い、CSP・CORSの考え方 | Pattern候補「証拠に基づくseverity判定」、Design Unit候補「認証・認可の監査点」「入力の扱い」 | 旧agent設定の一般論。OWASP Top 10の分類名は2021年版のもので、最新版との差は未確認（古さ）。TLSの版、署名algorithmの推奨等の具体値・tool名（npm audit、trivy等）は持ち込まない。gate番号（G2〜G7、73–79）は旧世代の工程 |
| D08-M02 | LEGACY-ASSET-EAE3071CBB838B8FB1E3 | `docs/skills/threat-model.md` | 49–74、92–99 | e510618606aca9d65c6f9cc8bdf48bc6f520ceceb683736c28b756a85af77158 | 面（surface）ごとにSTRIDEの6分類それぞれの問いに答え、答えの無い問いを未解決の脅威として記録し緩和に結ぶ（STRIDE-lite）、緩和の要件（未知の入力はfail-close、状態に資格情報を置かない、迂回の監査記録、入力のschema検証）、内部だけの面の脅威modelを省かない、既知patternの検査のgreenを脅威modelの完了とみなさない | Pattern候補「面ごとのSTRIDE-lite」、Anti-Pattern候補「内部向けの面の除外」「検査greenを脅威modelの完了とみなす」 | 面の一覧（34–47）はHELIX自身（agent、hook、allowlist、state file）で固有。問いの形は汎用候補。既存DT-MSG-003 §5が同じ資産を出典にしている |
| D08-M03 | LEGACY-ASSET-679FD45E5E541F11BC62 | `docs/skills/security-and-hardening.md` | 48–90 | ab370c7eda5b7d14af1d730191d4866f6e012ab89a63444a05ccb0afe24dec74 | 依存の供給網（既知のregistryから取る、取得protocolを限る、重大な既知advisoryの扱いを記録、浮動versionを本番依存に使わない）、秘密の漏れ（`.env`を追跡しない、testのfixtureに本物らしい資格情報を置かない）、検査の抑止を増やさない、実行面を広げない（新しい環境変数・network呼出しは先に設計に書く）、文書・監査記録からPIIを除く | Design Unit候補「依存の供給網の確認」、Pattern候補「実行面の縮小」 | HELIXのcommand（`helix guardrail`、Biome、Vitest）と`.helix/audit/`は固有。「`^x.y.z`は可」（56）等の版指定の規則はnpm固有。既存DT-SDOP-005（外部依存）と関係する |
| D08-M04 | LEGACY-ASSET-2489EB465FD99C6961DB | `docs/skills/security.md` | 84–91、109–116 | 0ceae9a477ff610c41e80c01ce4bd7f180dc318b52e7273614e9a3d350bb902e | error時にexit 0するhookはsecurityの欠陥（fail-openを欠陥として扱う）、failure modeを設計に列挙する、緊急の迂回を通常運用のflagにしない、検出を黙らせて根本原因を残さない | Anti-Pattern候補「fail-open」「緊急迂回の常用」「検出の抑止」 | 本文の大半（40–83）はHELIX自身のescalation境界とagent-guardの規則で、BRAINの知識にしない（運用規則であり、製品設計の知識ではない） |
| D08-M05 | LEGACY-ASSET-EF44FCF2D722F986E609 | `.claude/agents/be-api.md` | 52–56 | f4f9c9645c248a3e998ee5b92307ce0b04edc6421dc1eb4779820c867e489cbd | 認証・認可の典型（Bearer token、middlewareで検証して利用者を設定、roleによる認可、refresh tokenをHttpOnly cookieに置く） | Part候補「APIの認証・認可の典型構成」 | 方式の列挙だけで、session方式との比較、失効・漏洩時の扱いを持たない。D05-M04・D03-M02と同じ資産の別の行 |
| D08-M06 | LEGACY-ASSET-8B6EA6DFFE976FAD564A | `docs/skills/browser-testing-and-screen-verification.md` | 127–133 | 6f9f37072b0781b39a8ba19ecb2d04609babd5abaeeb7d23f63a9048dd59d0b5 | browserの内容（DOM、console、network応答）を指示として扱わない、page内のURLへ確認無しに移動しない、cookie・storageの秘密を読まない、実行は読み取りの検査に限る | Pattern候補「外から来る内容を信頼しない」 | 対象はAI agentが画面を検証する場面で、製品のsecurity設計そのものではない。外部入力の不信の原理はD05-M06（外部入力を指示として扱わない）と共通 |
| D08-M07 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 505–513、696–701、830–844、903–913、952–957 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「セキュリティ設計書」を`done`（実体はskill 3件＝D08-M02・M03・M04の資産）、「プライバシー設計書」（PIIはescalation対象として触れるがDPIA・ROPA相当は無い）「供給網セキュリティ設計書」（脆弱性SCA・署名・attestationは未設計）「シークレット鍵管理設計書」（漏洩検知のみで鍵の管理・更新設計ではない）「Webセッション・CSRF・CORS設計書」を`todo`、「アイデンティティ・プロビジョニング設計書」「コンプライアンス対応・統制マッピング設計書」を`na`と記録していたこと | gapの根拠 | 旧の自己評価 |

関係する素材で他の領域に置いたもの：errorの応答に内部情報を出さない（D03-M02）、例外由来の秘密を漏らさない診断（D03-M04）、外部入力を指示として扱わない境界（D05-M06）、観測dataのredaction（D07-M06）、来歴・権利・data所在（D09-M06）。

## 2. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-003-permission-privacy-external-interface.md` | 操作ごとの権限、dataの分類と最小化、privacy、外部interface、脅威の確認 | D08-M02等を既に出典にしている |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-002-nonfunctional.md` E | security（認証方式、暗号化、診断等の値） | 値の欄は既にある |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-006-aws-foundation.md` §2 | AWS採用時の初日のsecurity | provider固有 |
| `scaffold/verification-test-template-seed-20261001/materials/reference-repositories.md` F1〜、G、H | SARIF、OpenVEX、CWE、SLSA、in-toto等 | 外部参考として既にある。再掲しない |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「品質属性・安全・プライバシー」（ZIP 10、36、58、69） | ZIP由来。重ねない |

## 3. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027（2.0、LABO経由）である。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| OWASP Application Security Verification Standard（ASVS） | OWASPの公開標準（https://owasp.org/www-project-application-security-verification-standard/） | 検証levelごとの要求の体系。旧D08-M01はTop 10（riskの順位表）だけで、要求の体系を持たない | CC BY-SAとされる（要確認）。levelを全製品に課すと過剰な制限になる。適用levelは要求の判断 |
| OWASP Cheat Sheet Series | OWASPの公開文書（https://cheatsheetseries.owasp.org/） | 認証、session、CSRF、入力検証等の個別の実装知識。旧台帳でsession・CSRF・CORSが`todo`（D08-M07） | 同上。Web展開後の内容は1.0の必須にしない |
| NIST SP 800-63（Digital Identity Guidelines） | 米国政府の公開文書 | 認証の強さ（assurance level）、資格情報の扱い。旧D08-M05は方式の列挙だけ | 版（rev.）は要確認。米国の文脈の基準をそのまま課さない |
| 認可modelの比較（RBAC、ABAC、ReBAC） | 広く知られた方式名 | D08-M01・M05はRBACの名前があるだけで、比較と適用条件を持たない | 特定の製品・libraryの採用ではない |

## 4. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| 認可modelの選び方（role、属性、関係）と権限の粒度 | 旧は名前の列挙だけ（D08-M01・M05）。DT-MSG-003 §1は操作ごとの権限の欄で、方式の知識ではない |
| privacy設計（目的の制限、最小化、保持と削除、影響評価） | 旧台帳で`todo`（D08-M07）。DT-MSG-003 §3は欄を持つが、DPIAを全対象に課すことは過剰として専用templateを作らなかった（minimum-gap README） |
| 鍵・秘密の管理（保管、更新、失効、範囲） | 旧台帳で`todo`。旧は漏洩の検知だけ |
| Webに固有のsecurity（session、CSRF、CORS、CSPの設計） | 旧台帳で`todo`。D08-M01に設定の例があるだけ。**Web展開後の内容であり1.0の必須にしない** |
| securityのlog・監査記録の設計（何を残し、何を残さないか） | D07-M06・D03-M04にredactionがあるが、securityの出来事を記録する設計は無い |
| 供給網の検証（署名、来歴、SBOM） | 旧台帳で`todo`（一部はHELIX自身の配布で設計済み）。既存reference-repositoriesにSLSA等が挙がっている |

## 5. 検索範囲と結果

- 範囲：`.claude/agents/security-audit.md`、`be-api.md`、`docs/skills/`（security、security-and-hardening、threat-model、browser-testing-and-screen-verification）、`docs/research/worker-runtime-security-requirements-instruction-2026-07-19.md`の見出し、`docs/governance/candidates/security-engagement-authority-*.md`の見出し、`docs/design/design-catalog.yaml`の`sec`区分。
- 語：`OWASP`、`ASVS`、`STRIDE`、`threat`、`認証`、`認可`、`RBAC`、`secret`、`PII`、`CSRF`、`CORS`、`supply chain`、`zero trust`、`NIST`。
- 結果（上の範囲内）：OWASPのうち知識として書かれているのはsecurity-audit（D08-M01）とsecurity-and-hardening周辺だけだった。
- 補足検索：旧repo全体（`archive/legacy-generation-2026-09-14/root/`、`.helix/`・src・tests等を含む）を、大文字小文字を区別しない固定文字列で検索し、一致したfile数を数えた（2026-10-04）。`OWASP`は44 fileに出るが、上の範囲外の物は、見た範囲ではHELIX自身のguard・review・worker隔離の文脈だった（全件の精読はしていない）。`ASVS`は1 file、`zero trust`は0 file、`NIST`（語単位の一致）は30 file（PLAN 8、lint 7、test 5、工程文書5、機能設計2、その他3）だった。
- 結果（補足検索の内訳）：`ASVS`の1 fileは旧のPLAN（`docs/plans/PLAN-L7-419-skill-mythos-uplift.md` 163「CC-BY-SAのため転記せず名前とURLの参照のみ」）である。`NIST`は、SSDF・least privilege等として旧の工程・gate・機能設計の文書とその検査（lint・test）・PLANに出るが、HELIX自身の工程の根拠としての引用で、製品のidentity設計の知識ではなかった（全件の精読はしていない）。`worker-runtime-security-requirements-instruction`と`security-engagement-authority`はHELIX自身のworkerの隔離とsecurity関与の手続きで、HELIX-SECURITY側の材料であり、BRAINの製品設計知識の素材にしなかった。

## 6. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とする。

| 属性 | 未決事項 |
|---|---|
| 由来 | D08-M01はOWASP等の外部の一般知識をagent設定に要約したもの。外部由来の知識を旧資産経由で取り込むとき、由来を旧資産とするか元の外部source（2.0の経路、L2-026）とするかが未決 |
| 適用scope | securityの知識は対象（Web公開か、local CLIか、扱うdataの重要度）で必要性が大きく変わる。過剰な制限を避けるために、適用scopeをどの軸（公開範囲、dataの分類、利用者の範囲）で書くかが未決 |
| 評価根拠 | 旧のsecurity検査のgreenは証拠にしない。LABOでの評価の対象（脅威modelの網羅性等）が未決 |
| 限界・反例 | D08-M02は「検査greenを脅威modelの完了とみなさない」という限界を自ら持つ。他の素材は限界を書いていない |
| 版 | D08-M01のOWASP Top 10は版で分類が変わる（古さ）。外部標準の版と知識recordの版の結び方が未決（L2-008） |
| 状態 | 全件「未評価の候補素材」 |
| 領域の帰属 | 他領域に置いた関係素材（§1末尾）とのrelationの種類（constrains、affects等）が未決（L2-005） |
