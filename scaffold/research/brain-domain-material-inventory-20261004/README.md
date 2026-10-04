# HELIX-BRAINの初期10領域の知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0155](../../bindings/SCF-B-0155.json)
基準：`origin/main` `064a1cf5af7634b75aa175608088c3a8bca1299e`（2026-10-04）

## 何をしたか

2026-10-04、POは次のように発言した（原文）。

> 並列で進められるのない？待機期間長すぎて時間がもったいないだろ。BRAIN素材をためまくるのがいいと思うがどうかね？

これを受け、review_mergeレーン（Claude）の下で、HELIXBRAIN-L2-001（`docs/helix-brain/L2-requirements/brain-requirements.md` 90）が1.0の初期領域として挙げる10領域ごとに、BRAINの知識の素材として使える旧HELIXの資産を棚卸しした。

- `materials/D01-software-architecture.md`〜`D10-ux-interaction.md`：領域ごとに、旧HELIXの素材（asset ID、path、行、全体SHA-256、何の知識か、知識recordにする場合の候補粒度、限界・古さ・HELIX固有か汎用か）、既存scaffold素材のうちその領域に当たるもの（参照のみ）、外部の一般的な参考（観点の名前のみ）、gap、検索範囲と結果、BRAIN L2の属性を付けるときの未決事項。
- 本README：置き場所と形の根拠、領域一覧と素材件数、領域横断の素材、既存素材との境界、SHA照合、生成しないもの、後続。

旧HELIXは`archive/`を読むだけにした。旧CLI・旧hook・旧runtime・旧test・旧CI・Bunは実行していない。外部toolは導入・実行していない。旧の`.claude/agents/`は旧世代のAI設定であり、AGENTS.mdに従い実行・session instructionとして使わず、設計の観点の出典として読んだだけである。

## 置き場所と形の根拠

| 判断 | 根拠 |
|---|---|
| 汎用の設計知識はBRAIN、製品固有の意味・採用判断は各製品のHELIX-HARNESS-CORE | `brain-requirements.md`「共通境界とパック契約」28。L2-006（Visual Identity等は製品COREに残す）、L2-011（製品固有意味との分離）、L2-012（BRAINは採用を決めない） |
| scaffoldに置き、採否・登録をしない | AGENTS.md「仮の物は`scaffold/`名前空間に限り、Scaffold Bindingへ登録して置く」。Bindingは[SCF-B-0155](../../bindings/SCF-B-0155.json)。先例は`scaffold/research/design-template-seed-sdop-20260929/`（SCF-B-0152）、`scaffold/verification-test-template-seed-20261001/`（SCF-B-0153）、`scaffold/research/design-template-seed-minimum-gap-20261004/`（SCF-B-0154） |
| READMEと材料の形 | 既存seedのREADME（status、authority_effect、binding、何をしたか、置き場所と形の根拠の表、境界、生成しないもの、後続）と、`materials/legacy-source-inventory.md`・`source-inventory.md`の表（asset ID、path、行、全体SHA-256、検索範囲と結果）に揃えた |
| 旧HELIXの素材を1.0の材料として棚卸しする | `brain-requirements.md` 33「版境界」：BRAINの初期内部実績・seedは`version_target: 1.0`。L1企画案（`docs/helix-brain/L1-planning/brain-intent.md` 74）「1.0では、自前の内部の実績と初期のseedから設計知識の体系を成り立たせる」 |
| 外部の参考は観点の名前に留める | 外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027で`version_target: 2.0`（LABOでの分解・比較・評価を経る）。本棚卸しで名前を挙げることはその経路の代わりにならない。網羅を狙わず、旧資産で欠けている観点を示す物に限った |
| 素材ごとに記録した属性 | HELIXBRAIN-L2-007（source、provenance、evidence、evaluated scope、counterexample、limitation）、L2-008（版・状態）、L2-003（applicability、negative case）、L2-010（Anti-Pattern）に対応させ、各領域の§「未決事項」に書いた |
| 素材の状態 | 全件「未評価の候補素材」。L2-007・L2-025は、AI生成・文書の存在・単一の実績だけで汎用知識へ昇格させない。本棚卸しは採用済み・評価済みの状態を生成しない |
| 候補粒度は案に留める | L2-002の`Domain → Pattern → Design Unit → Part`とL2-010のAnti-Patternの語で「なりうる粒度」を書いただけで、階層や種類を確定しない |
| 引用する旧assetの条件 | `docs/governance/legacy-asset-disposition.jsonl`の`source_path`完全一致で引き、最新revisionの`source_sha256`と実fileのSHA-256が一致するものだけを引用した（§SHA照合） |

## 領域一覧と素材件数

素材件数は各領域の§1の表の行数（素材ID）。同じ旧資産の別の行を別の素材として数えた行がある。「gapの根拠」の行（旧`design-catalog.yaml`の自己評価）も1件と数えた。

| 領域 | file | 素材件数 | うちgapの根拠の行 | 主なgap |
|---|---|---:|---:|---|
| Software Architecture | `materials/D01-software-architecture.md` | 12 | 1 | 品質特性のtrade-off、性能の構造、architecture styleの比較と負の例、viewpoint／view |
| Application Architecture | `materials/D02-application-architecture.md` | 8 | 1 | 構成style（層状、ports and adapters等）の比較、moduleの分割・統合の判断、bounded context間の関係 |
| Backend | `materials/D03-backend.md` | 7 | 1 | batch・background job、分散した副作用の一貫性（saga、補償）、並行制御、時間に依存する処理 |
| Frontend | `materials/D04-frontend.md` | 8 | 1 | 状態管理の選択肢、data取得の境界、responsive、frontendの性能、form。旧はFE内部設計の本文を起票していない |
| API / Integration | `materials/D05-api-integration.md` | 10 | 1 | 非同期連携の契約、API styleと版の方式の比較、外部公開APIの運用、rate limit |
| Data / Database | `materials/D06-data-database.md` | 7 | 1 | 分散dataの整合性、保存方式の比較、dataのlifecycle、schemaの版の進化 |
| Infrastructure | `materials/D07-infrastructure.md` | 9 | 1 | network・compute・storage、scaling・capacity、failureの型、topology、費用、DR。採択済みINFRA要求17件のうち、少量・部分的な素材があるのは11件、構造の話で素材を要しないのが2件（002、015）、素材がほぼ無いのが4件（008、011、014、017）（D07 §2） |
| Security | `materials/D08-security.md` | 7 | 1 | 認可modelの選び方、privacy設計、鍵の管理、Webに固有のsecurity（Web展開後、1.0の必須にしない） |
| Visual Design | `materials/D09-visual-design.md` | 13 | 1 | typography、grid・spacing、visual hierarchy、dashboard、色の体系、motion。L2-006の要素ごとの有無はD09 §2 |
| UX / Interaction | `materials/D10-ux-interaction.md` | 9 | 1 | form、Information Architecture、feedbackとundo、多言語、mobile・touch、利用者調査の方法 |
| 計 |  | 90 | 10 |  |

全体の傾向：旧HELIXはHELIX自身（local CLIと管理画面）を作った記録が中心で、**製品一般の設計知識は少ない**。比較的まとまっているのは、API契約と版（D05）、schema変更と移行（D06）、表示状態の網羅とa11yの確かめ方（D10）、製品固有の値と共通の規則を分ける仕組み・designの来歴と収束（D09）である。Infrastructureは旧HELIX自身が常設の基盤を持たなかったため、とくに少ない（D07）。

## 領域横断の素材

特定の領域に属さず、BRAINの知識の属性・状態・昇格の扱い（L2-007・008・025、INFRA-017）を考える材料になる旧資産。領域の素材件数には含めない。

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 限界 |
|---|---|---|---|---|---|---|
| X-M01 | LEGACY-ASSET-D65FB82C21C5EDBDFCE4 | `docs/design/helix/L5-detail/memory-learning-promotion.md` | 147–189 | 70ed887f35ca38a6e406d91b750848a9b89cde73825358c554ad009d473a115a | 反復した指摘を`pattern → recipe → shadow → skill／detector → gate`へ段階で昇格させる遷移、段の飛越しの拒否、recipeに再現fixture・期待oracle・scope・非目標・ownerを必須にする、shadowで同じfixtureをbaselineと候補に流して効果を独立に検証する、rollback先の封印、rollback済みの版を再activeにせずretiredへ進め同じ証拠だけでの再昇格を拒否する | HELIX自身の学習機構（skill・detector・gate）の設計で、BRAINの知識の昇格ではない。L2-025の「LABO評価→OS登録→BRAIN内の独立検証→採否」と順序・主体が違うので、そのまま写さない |
| X-M02 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 1–1431 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 設計文書の種類（PO提供ZIPのcatalog機構を移植したもの）ごとに`done`／`todo`／`na`と理由を持つ旧HELIXの自己評価の台帳。各領域の「gapの根拠」の行はこの台帳の該当項目を引いた | `done`の実体がlintである項目がある（D02、D04）。`na`はHELIX自身の製品境界による判断で、製品一般の不要を意味しない |
| X-M03 | LEGACY-ASSET-B9A51B5899D9D68E6221 | `docs/migration/helix-porting-map.md` | 85–89、96 | 7b16f5e4103226498c3aef7adbdd22d8aab681ece926241a3490bf885e0b2c8b | 旧HELIXの前身の`skills/`（design-doc、api-contract、db、ui、security等）を`docs/skills/*-pack.md`へcurateする移植計画 | 移植先の`docs/skills/design-pack.md`等の`*-pack.md`は旧HELIXの`docs/skills/`に存在しない。前身の`ui` skill等の知識が旧HELIXへ移されたかは確かめられない（前身のrepositoryは削除済みで、本棚卸しの範囲外）。Frontend・Visual Designの素材が少ない理由の一つの可能性として記録する |

## 既存素材との境界

| 既存素材 | 持っている物 | 本棚卸しとの境界 |
|---|---|---|
| `scaffold/research/design-template-seed-sdop-20260929/`（SCF-B-0152） | 設計templateのseed候補7件（log、非機能、保守・runbook、logic、外部依存、AWS、review） | templateの欄は持たない。各領域の§2で該当templateを参照するだけ |
| `scaffold/verification-test-template-seed-20261001/`（SCF-B-0153） | 検証・test技法のtemplate seed、`materials/source-inventory.md`（旧資産の検証側の棚卸し）、`materials/reference-repositories.md`（外部repository・OSS・標準） | 同じ旧資産の同じ行を引く素材（D04-M06、D09-M04・M10、D10-M01・M02・M06）は、検証templateの材料ではなく設計知識の観点で記録し、重なりを各行に明記した。外部参考は再掲しない |
| `scaffold/research/design-template-seed-minimum-gap-20261004/`（SCF-B-0154） | 最小seedの未被覆領域の設計template 6件と`materials/legacy-source-inventory.md` | 同じ旧資産（api-contract、db、data-migration、threat-model、external-if、if-detail、durability-boundaries等）を出典にするDT-MSGがある素材は、各行に「既存DT-MSG-00xが同じ資産を出典にしている」と書いた |
| `scaffold/research/design-pattern-inventory-20260925/` | ZIP（ハイブリッド設計ドキュメント）からの候補束と設計pattern候補 | ZIP由来の候補は各領域の§2で参照するだけで、重ねて棚卸ししない。ZIPは旧HELIXの資産ではない |
| `docs/helix-brain/L2-requirements/brain-requirements.md`のHELIXBRAIN-L2-INFRA-001〜017（53–69、220–390）、対のL11（`brain-acceptance.md` 41–57）、2026-09-28 PO decision（60–76） | 採択済みのInfrastructure要求と受入条件 | 要求の意味は変えない。D07 §2で採択済みの要求ごとに素材の有無だけを照らした。素材は未評価、要求は採択済みであり、両者の状態を混ぜない |
| `docs/helix-brain/candidates/infrastructure-domain-requirements.md` | 採択前のInfrastructure候補と、旧NIO-L3-01・02・03・06・09の引用 | 判断史と素材の由来を辿るためにだけ参照し、要求との対応の参照先にしない。旧NIO-L3（D07-M05）は既に引用済みで重ねて意味を起こさない |

## SHA照合

- 方法：引用した旧assetごとに、`docs/governance/legacy-asset-disposition.jsonl`から`source_path`が完全一致する行を引き、最大revisionの`source_sha256`と、`archive/legacy-generation-2026-09-14/root/<source_path>`の実fileのSHA-256（file全体）を比べた。行範囲は実fileの行数の内側にあることを確かめた。
- 結果：本READMEと`materials/`で引用した旧assetは78件（重複を除く）。うち65件は素材の表（領域の§1と本READMEの「領域横断の素材」）に asset ID・全体SHA-256付きで引用し、13件は本文中でpathと行を挙げた補足の参照（検索結果の説明等）である。78件全件で、台帳の最大revisionの`source_sha256`と実fileのSHA-256が一致した。表の行範囲は全件が実fileの行数の内側にあった。
- 一致しないassetは引用していない。台帳に無いfileは引用していない。
- 台帳上`RequirementSourceSnapshot`（revision 3）の資産（旧L1 nfr、L2画面設計のui-element・wireframe・screen-detail・screen-flow・business-flow）は、その旨を各行に書いた。

## 生成しないもの

- 素材の採否、BRAINへの登録、知識recordの作成、状態（採用済み・評価済み・成熟度）を生成しない。全件「未評価の候補素材」である。
- 要求の意味を生成しない。HELIXBRAIN-L2-001の領域の意味、L2-006の要素の割り振り、採択済みINFRA要求の意味を変えない。各領域の「この領域の範囲」と領域の境目は本棚卸しの仮置きである。
- 数値の閾値・既定値を生成しない。旧資産にある値（閾値、寸法、色、時間、件数）は「持ち込まない」と各行に書き、値は写していない。
- 技術選定を生成しない。旧資産や外部参考に出るtool・library・provider名は観点の名前であり、採用ではない。
- Web展開後のSecurity・Infrastructureの内容を1.0の必須に前倒ししない。securityの素材を全製品の義務にしない。
- 新しい規則・承認手続きを作らない。

## 後続

1. BRAINのL1は確定し、L2・L11は2026-09-28に採用済みである（`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md` 31–43、104–107）。本棚卸しは、採択済みの要求の意味を保ったまま、L3起草以下（要件、知識recordの設計、領域ごとの素材の評価）の材料の候補にする。各領域の「この領域の範囲」と領域の境目（とくにD01／D02、D04／D09／D10）は棚卸し上の仮の仕分けであり、L3起草で採択済みのHELIXBRAIN-L2-001・006の意味に照らして確かめる。領域の意味や範囲を変える必要が判明した場合に限り、上流のownerへ戻す。
2. L2-007・008・025の属性（由来の種類、適用scope、評価根拠、版、状態）を降ろすとき、各領域の§「未決事項」を入力の候補にする。共通して未決なのは、(a) 旧資産を「内部の実績」「指示・手順」「判断記録」のどれとして由来に記録するか、(b) HELIX固有の適用例と汎用の原理をどう分けて記録するか（L2-011）、(c) 旧testを証拠にしないとき評価をどこで行うか（L2-020のLABO）、(d) 外部標準の版と知識recordの版の結び方である。
3. 外部の参考に挙げた名前は、2.0の経路（L2-026・027）が成り立った後にLABOで扱う候補であり、1.0では使わない。
4. 正式なBRAINの知識storeと素材が入ったら、SCF-B-0155に対して`scfctl check-replacement` → `retire`で本scaffoldを撤去する。
