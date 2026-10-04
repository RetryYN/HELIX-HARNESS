# D02 Application Architecture：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`brain-requirements.md` 90）の初期領域の一つ。本書では「1つのapplicationの内部の層、責務の持ち主、境界、副作用の置き場所、domain modelの使い方」を扱うと仮に読む。system全体の構造はD01、処理の中身（transaction、error、validation）はD03に置いた。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D02-M01 | LEGACY-ASSET-D492D527A60A660722FF | `.claude/agents/be-logic.md` | 27–39、54–62 | b1d9a75378b40fd6d7fea643654f1a9a8d04471824e08c27c07c3ead86f834a9 | 層構成（Controller／Handler→Service→Repository→外部、Domain Modelは依存なし）、依存性注入（constructor注入、interfaceに依存）、設計原則（単一責務、副作用の分離、guard節、不変のdomain object）、test容易性（Serviceは Repositoryをmock、Domainは純粋関数test） | Pattern候補「層状architecture」、Design Unit候補「層ごとの責務と依存の向き」、Part候補「依存性注入」 | 旧世代のAI agent設定で、一般論を短く列挙しただけ。適用条件・負の例・代替案（hexagonal等）を持たない。汎用だがL2-003の成立条件を満たさない |
| D02-M02 | LEGACY-ASSET-809B35B3C91567A97AF5 | `docs/design/harness/L5-detailed-design/source-boundary-architecture.md` | 20–30、47–57、59–63、65–71 | 6bee024905701ca99ccd09e2a357e3b91fbf5370e4118630cfb1da5119d07610 | 持ち主ごとの「所有するもの／禁止するもの」表（persistence、contract、純粋projector、adapter、analyzer、executor、composition root）、依存はcontractへ一方向・既定denyで許可方向だけを列挙・未知はfail-close、副作用（write、process、git）は明示commandのexecutorだけが行い受領記録を返す、循環を解く移行順序 | Pattern候補「既定denyの境界policy」、Pattern候補「副作用の実行者の限定（読取りと実行の分離）」、Part候補「composition root」 | 実測された循環（11–18）とmodule名はHELIX固有。表の形と規則は汎用候補。type-only importも同じ辺とする判断（50–51）はTypeScript固有 |
| D02-M03 | LEGACY-ASSET-5E22432B0A5A8F7CC8B3 | `docs/governance/ddd-tdd-rules.md` | 14–33、123–131 | 9eac2cc9e5fa8f1177b39f86681fa928cb22070666a5306dce7ae6943597d7af | 「DDDは手段」：Entity、Aggregate、Value Object、Domain Service、Policy、Port、Adapterは責務と不変条件が必要なときだけ使い、状態・identity・lifecycleの無い変換は純粋関数、domain modelが要らない変更は`none`とする。「全てをclass化」は違反。no-code-first（変更なし→削除→設定→再利用→修正→追加の順）、契約先行、正味の複雑さの管理。下位contractへの境界map | Pattern候補「domain modelの要否判定」、Anti-Pattern候補「全てをclass化」「1実装しかない投機的interface」 | HELIXの開発規律（PLAN、lint）として書かれ、規則（35–84）はHELIXの機械検査。思想（14–33）だけが汎用候補。既存DT-MSG-006が試験性の観点で同じ資産（別の行）を使っている |
| D02-M04 | LEGACY-ASSET-A4DD57E39031B1402494 | `docs/design/harness/L4-basic-design/data.md` | 46–56、117–126 | b94e3ec801d6275af18976abdd88eaff44da23494ce654dbde9c3fa2ebaae1c6 | 集約の境界とtransaction一貫性の単位、集約間はIDだけで参照、集約間の整合性規則を即時（immediate）と結果整合（eventual）に分け、読みmodelは集約の状態からの投影（CQRS）とする | Pattern候補「集約境界と整合性の種類」、Design Unit候補「集約間整合性規則の表」 | 集約（Plan、Artifact、Workflow、Evaluation）はHELIX自身のdomainで固有。表の形と「IDだけで参照」「即時／結果整合を規則ごとに書く」が汎用候補。D06にも関係する |
| D02-M05 | LEGACY-ASSET-D7D41FD277B04C92AF20 | `docs/skills/incremental-implementation.md` | 44–75 | e19c9916563e052b0f44463f6489982c9801b1be776658b565b433052ccc5c2f | 複数形の戻り値は判別可能なunionや`Result<T, E>`で表す、外部入力は`unknown`で受けてguardで絞る、I/Oと計算を分け、書込み関数で業務logicを計算しない、公開面を最小にする | Part候補「I/Oと計算の分離」「外部入力の型の絞り込み」 | TypeScript前提。「関数は30行まで」（74–75）は数値なので持ち込まない。命名規律（55–64）はHELIXの規約 |
| D02-M06 | LEGACY-ASSET-113C7FC63E63A3538EE3 | `docs/skills/refactoring.md` | 31–75 | 1ea97b9df1d030678c5cf25745a3b674440f9b4e14a709ad428053d4d61ae0a2 | 観測できる境界の特定、回帰の柵（characterisation test）を先に作る、1 commitに構造変更1つ、振る舞い不変の確認、構造を変えたら対の設計文書を更新 | Pattern候補「振る舞い不変の構造変更」 | `npm`・`helix doctor`等の手順はHELIX固有。Applicationの構造を変えるときの知識として汎用候補 |
| D02-M07 | LEGACY-ASSET-B0BBA6BC8EEF832B1D73 | `.claude/agents/refactor-scout.md` | 33–40、51–56 | f12c30d26c49aaf64688d803064ff38c8d721390e4730992e3044e04fda41098 | 構造改善の候補種別（module分割、helper抽出、重複関数の統合、literalの外出し、code分岐に埋まったpolicyの外出し）と、振る舞いが変わる提案はrefactorにしない制約 | Anti-Pattern候補「code分岐に埋め込まれたpolicy」、Part候補「構造改善の種別」 | 種別はHELIXのdetector向け。判定基準（何をもって「多すぎる」か）は持たない |
| D02-M08 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 662–674、1075–1088 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「共通部品・クラス設計書」を`todo`、「外部化・差し替え設計書」を`done`（実体はtool adapterのlint）、「ドメイン実装方針・値オブジェクト設計書」を`done`（実体はddd-tdd-rulesのlint）と記録していたこと | gapの根拠 | `done`の実体がlintであり、知識文書ではない点に注意 |

## 2. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-004-logic-design.md` | ユースケース、decision table、状態×イベント、異常系、冪等性 | 処理の中身はD03で扱い、本書では参照だけ |
| `scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-004-unit-behavior.md`・`DT-MSG-005-composite-architecture.md`・`DT-MSG-006-design-testability.md` | 単体の入出力・副作用、構成体の依存の向き、設計時のtestability | 設計templateの欄として既にある |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「ドメイン・業務フロー」（ZIP 19、27、30、39） | ZIP由来の候補。重ねない |
| `scaffold/verification-test-template-seed-20261001/materials/reference-repositories.md` C4 | dependency-cruiser／ArchUnit（依存規則の検査） | 外部参考として既にある |

## 3. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027（2.0、LABO経由）である。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| Ports and Adapters（Hexagonal Architecture） | 提唱者（Alistair Cockburn）の公開文書 | 層状（D02-M01）以外の構成の選択肢。D02-M02の「adapter」「executor」は近いが、旧はstyleとして比較していない | 名前と考え方の参照に留める |
| Domain-Driven Design（Evans）の戦略的設計（bounded context、context map） | 書籍 | D02-M03・M04は戦術的設計（集約、値object）だけで、application間・context間の関係を持たない | 書籍の本文を写さない。著作権に注意 |
| Patterns of Enterprise Application Architecture（Fowler） | 書籍 | Transaction Script／Domain Model／Table Module等、domain logicの組み方の選択肢と適用条件（D02-M03の`none`／純粋関数／domain modelの判定を比較できる形にする材料） | 同上 |

## 4. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| application構成のstyle（層状、ports and adapters、clean、vertical slice等）を並べた比較と適用条件・負の例 | 旧はD02-M01の層状の列挙だけ。`hexagonal`・`clean architecture`は旧の本文に見つからなかった（§5） |
| moduleの凝集・結合をどう測り、いつ分割・統合するかの判断 | D02-M07は候補種別だけで判定基準を持たない。旧台帳も共通部品設計を`todo`（D02-M08） |
| 状態を持つapplication（session、cache、background job）の責務の置き場 | 旧の素材はstateless寄りのCLIを前提にしている |
| bounded context間の関係（共有kernel、腐敗防止層等） | D02-M03・M04は1 context内の戦術的設計だけ。腐敗防止層はD05のADR-003（外部runtimeの隔離）に1件あるのみ |

## 5. 検索範囲と結果

- 範囲：`.claude/agents/`（be-logic、refactor-scout、code-reviewer）、`docs/skills/`（incremental-implementation、refactoring、spec-driven-development、code-minimalism）、`docs/governance/ddd-tdd-rules.md`、`docs/design/harness/L4-basic-design/`・`L5-detailed-design/`の見出し、`docs/design/design-catalog.yaml`の`common`・`domain`・`std`区分。
- 語：`layer`、`層`、`DDD`、`aggregate`、`集約`、`hexagonal`、`ports and adapters`、`clean architecture`、`CQRS`、`composition root`、`依存性注入`。
- 結果：`hexagonal`・`clean architecture`は0件。`ports and adapters`は旧の再基線化の差分文書2件に語として出るだけで、構成の知識ではなかった。`CQRS`は2件（D02-M04ほか）。`docs/design/harness/L5-detailed-design/module-decomposition.md`はHELIX自身のmodule一覧で、汎用の素材にしなかった。

## 6. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とする。

| 属性 | 未決事項 |
|---|---|
| 由来 | D02-M01は旧AI agentへの指示文で、実績ではない。指示文を「知識の由来」として記録してよいか、由来の種類（実績、指示、規則、判断記録）を分けるかが未決 |
| 適用scope | D02-M02・M03はTypeScriptのCLIで成り立った規則。言語・実行形態を越えて成り立つかの評価が無い |
| 評価根拠 | D02-M02の移行順序は旧の実測（循環の解消）を持つが、旧testの合格は証拠にしない。新たな評価の主体（LABO）と対象revisionが未決 |
| 限界・反例 | D02-M03の「全てをclass化は違反」は反例の一種として使えるが、条件（どの規模・どの変更で）が書かれていない。L2-010は条件の無い否定を適用しないため、条件の補い方が未決 |
| 版 | D02-M01（agent設定）とD02-M02（設計文書）は同じ旧世代でも書かれた時期・権威が違う。版を文書単位で振るか、知識の単位で振るかが未決 |
| 状態 | 全件「未評価の候補素材」。本書では決めない |
| 領域の帰属 | D02-M04（集約）はD06と、D02-M06（refactor）はD01と、どちらの領域にrelationで結ぶかが未決（L2-005） |
