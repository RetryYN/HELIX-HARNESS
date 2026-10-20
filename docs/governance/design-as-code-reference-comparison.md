# Design as Code 参照比較（Issue #3168、research候補）

- evidence_kind: research。authority_effect: none。比較結果から要求採否・技術採用・新gate・工程・CI起動を決めない。
- 確認日: 2026-10-20。動的な公式文書の確認範囲を記録する。表示上のリリース番号は採用版ではない。
- 親: #3139 / [FT-DESIGN-REFACTOR-001](feature-tickets/FT-DESIGN-REFACTOR-001.md)。HELIX照合revisionは `a51b2f6c269736138dd240affd889ea75b02c286`。Devinの原案baseは `a0c57fb810e166c9ad7f7cc7b22e7daf52cf8e3e`。
- 技術候補の原入力・採否は #3051を参照し、本書に二重正本を作らない。以下の事実は一次資料の記述、HELIXへの写像と追試案は仮説である。

## 1. 一次資料と確認範囲

| 対象 | 一次資料・確認箇所 | 版・確認した事実 | 留保 |
|---|---|---|---|
| LikeC4 | [Introduction](https://likec4.dev/dsl/intro/)、Top-level statements | `.likec4`/`.c4`のsourceを一modelへまとめ、specification・model・views・globalを分ける。ページ上のlatest表示は1.60.0 | 個々のvalidate規則や独立oracle、増分検証の全機能は未調査 |
| Structurizr | [Why as code?](https://docs.structurizr.com/as-code)、Version control friendly / Traditional Git collaboration workflows / Developer-friendly | C4 modelのDSLから図を生成し、modelとviewを分離する。Git差分、複数の接続されたmodelへの分割、validate/inspect/exportの入口を説明。binaries表示は2026.09.19 | implied relationshipsやinspectがHELIXの影響集合を正しく導くかは未実証。表示用の関係生成を影響解析能力と同一視しない |
| OMG SysML v2 / KerML | [SysML 2.0](https://www.omg.org/spec/SysML/2.0)、Normative Documents / Normative Machine Readable Documents / History。[Language PDF](https://www.omg.org/spec/SysML/2.0/Language/PDF)の要求・verification case節 | 2.0のadoptionは2025-09。確認ページのLanguage PDF IDはformal/26-03-02。規範XMI、KerML library `.kpar`、abstract syntaxのJSON Schemaを掲載。要求とverification caseをモデル内で表す | adoption時点と現掲載PDF IDを混同しない。KerML独立仕様・API規格・tool間の実相互運用は今回未検証 |
| Specmatic / OpenAPI | [Contract Testing](https://docs.specmatic.io/spec_driven_api_development/contract_testing)、How examples are used / Externalising examples | request/response example名で対応を選び、API仕様への適合を検査する。response exampleの値は既定では実応答と直接比較しないが、Matchersを使えば応答値も検証できる。外部JSON exampleを扱える | 「構造検査しかできない」とは評価しない。個別Matcherの網羅・後方互換規則・全製品機能は未調査。OpenAPI全体の仕様比較ではない |
| TLA+ / AWS | [TLA+文書入口](https://docs.tlapl.us/)、[AWS掲載論文](https://www.amazon.science/publications/how-amazon-web-services-uses-formal-methods)、同ページから辿れる2015年CACM論文 pp.66–68のPrecise Designs / Formal Methods for Real-World Systems | TLA+で性質と設計を記述し、TLCでモデルの実行経路を検査する事例。AWSは2011年からの形式仕様・model checkingによる複雑な設計の問題発見を報告 | 記述したモデルと性質の範囲に依存する。モデルでの成功は製品コード・実接続の正しさの証明ではない。HELIX用モデルは未作成 |

## 2. HELIXへ写像する仮説と残る境界

| 観点 | 比較から使えそうな考え方 | HELIXで別途確かめること |
|---|---|---|
| 意味正本と生成view | LikeC4/Structurizrのmodelとviewの分離、SysMLの機械可読表現 | HELIXのJSON正本と閲覧用viewの対応。図やJSON形式が似ていても要求の意味や承認は継承しない |
| 独立oracleと反例 | Specmaticの契約適合・Matcherによる値検査、TLA+の性質と遷移の分離 | oracleの出典・独立性、原材料と候補の照合、モデルの抽象化で落とした意味。tool導入だけでは独立性は成立しない |
| 変更影響・片側交換 | modelの分割・版管理、API契約検査、変更後の性質の再検査 | 版付きport/adapter/consumer、固定側不変更、非互換/unknownの返却。参照一覧を影響閉包とみなさない。TLCはGit差分から検査範囲を自動導出する仕組みではない |
| Red→Green→Refactor | 性質や契約を先に定義し、反例を修正後も再検査する | 変更前に欠陥を識別する凍結oracle、最小修正、意味保存、影響先の再照合。各toolがHELIXの工程を実装済みとは扱わない |
| owner資格と両端binding | APIや状態モデルへ権限・出典を明示すれば、一部の性質を検査できる可能性 | BRAIN→CORE→OSの誰が何を供給・判定するか、revision/scope/source資格、未供給・古い成功の扱い。外部toolが一律に扱えないとも、HELIX固有の新技術とも断定しない |

## 3. 具体例: 欠落・null・owner資格を分ける

これは比較のための合成例であり、新要求や正式なwire schemaではない。三つの入力 `{} / {"revision": null} / {"revision": "r1"}` はpresenceと値が異なる。同じ `r1` を受け取っても、供給者が対象scopeとrevisionについて有効な資格を持つかは別の判定になる。

- 構造・値: required/type/null許容を契約へ明示すれば、欠落とnullの違いはAPI/schema検査で扱える。さらにSpecmaticのMatcherで値を検査できる。ただしその期待値・許容条件を正しく設計する責務は残る。JSON Schema/OpenAPIの版による表現差は追試で固定する。
- 資格・意味: schemaにowner文字列があるだけでは資格は成立しない。どのsource・版・scope・根拠と照合するかをHELIXが定義する。外部toolへ認可の意味や書込authorityを移さない。
- 反例: 同じ形・同じrevisionでも別scopeの資格、失効資格、偽の資格根拠を与える。形式適合だけでは成功にしない。一方、正当なnullを一律missingへ正規化して拒否する退行も区別する。ここでnullの許容・拒否を要求として新規決定しない。
- モデル検査: 上記状態と遷移、例えば「資格が成立する前に採用しない」をTLA+へ記述できれば反例探索の候補になる。原契約との写像、状態数、抽象化で省く範囲を別に確認する。モデルも実行結果も今回は作成していない。
- 変更影響: 表示名変更、null許容の契約変更、資格規則の変更を別変更にする。consumerと対oracleを辿り、関係が未確認なら検査を広げる。各toolにこのHELIXの影響集合を自動算定する能力があるかは未実証である。

## 4. 現行契約・五観点との対応

以下は照合revisionの文書内の所在であり、製品runtimeの実装成立を示さない。root keyの参照はその固定revisionへ結ぶ。

| 現行対象・所在 | 比較の戻し先 |
|---|---|
| HARNESS005 [L8 verification-discipline](../helix-harness/L8-unit-verification/verification-discipline.json) `/verification_scope`、`/cases` | 契約検査・モデル検査をどの検証義務へ充て、何を未評価に残すか |
| HARNESS015 [L8 tdd-development-flow](../helix-harness/L8-unit-verification/tdd-development-flow.json) `/expected_data_boundary`、`/cases` | 凍結oracle、実装前Red、修正後の同じoracleによる再検証と意味保存Refactor |
| OS020 [L9 ci-profile-execution-recovery](../helix-os/L9-integration-verification/ci-profile-execution-recovery.json) `/scope`、`/remaining` | 検証profileの選択・運転・結果回収と復旧。外部検査toolの成功と製品CI成立を分ける |
| CONNECT006 [L8 one-side-replacement-recovery](../helix-connect/L8-unit-verification/one-side-replacement-recovery.json) `/consumer_contracts`、`/unclosed` | 片側交換で固定側の契約を維持できる範囲、非互換/unknownの返却 |

親ticketの五観点は、**責務・契約・依存・検証・構造**である。責務はowner/authority、契約はpresence・版と失敗、依存はproducer/consumerと片側交換、検証は独立oracle/反例、構造はmodel/view分離と責務単位の分割へ対応する。共通化・外部化・抽象化は同じ意味と変更理由を持つ範囲で比較し、万能基底や全機構改版を増やさない。

変更耐性・容易性・可用性・回復性の評価は、この五観点と別の横断比較である。変更ファイル/契約数、再検証時間、検出漏れ、他作業の停止・復旧時間、検証負荷を同じrevision・条件で測る案を親ticketへ返す。今回の比較から性能・費用・自動化率の優位性は主張しない。

## 5. 旧sourceとの対応・次の追試

起点は [旧design-refactoring-domain-model](../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md) §0–1（LEGACY-ASSET-603D0E8D8193914F4AC0）と [旧design-template-json-authority](../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md) §1–2（LEGACY-ASSET-4F5A1F0739EC1111D91D）。意味署名、consumer/oracle保全、意味正本と生成viewの分離を保持する。変えるのは既存の設計改善候補を外部一次資料と比較する点で、理由は #3168とPOのDesign as Code比較指示である。旧runtime・DB・固定role数・gateは移植しない。

Conceptの機構交換とauthority分離、七原則の原子PR・DDD/TDD・最小変更・adapter境界・計測へ照合する。JSONの形式一致を意味・承認・完成に読み替えず、外部toolの導入や実行は今回行わない。

次の候補は、上記合成例を一つの最小API契約と小さい状態モデルへ別々に写し、欠落/null/資格の各反例が識別できるか比較すること。その前に原要求・対oracle、tool/仕様版、期待の導出者、未モデル化範囲を固定する。これは追試案であり実装着手や新gateの許可ではない。各toolの全機能・ライセンス・運用・相互運用・実測は未評価のまま保持し、採否と必要な上流還流は別の既存経路へ戻す。
