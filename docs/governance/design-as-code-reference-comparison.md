# Design as Code 参照比較（Issue #3168、research候補）

- evidence_kind: research / scaffold。authority_effect: none（要求採否・技術採用・新gate/工程・CI起動の承認ではない）
- 一次資料の確認日: 2026-10-20。参照は記載URLの本文を同日取得した記述に限る。未確認の製品機能は「未確認」とし、取得できた原記述が示す事実とHELIXへの仮説を分ける。
- 親: Issue #3139 / `docs/governance/feature-tickets/FT-DESIGN-REFACTOR-001.md`。base `a0c57fb810e166c9ad7f7cc7b22e7daf52cf8e3e`。
- 重複する技術調査は #3051（T01〜T10）を参照とし、本書はその結論を二重正本にしない。
- 旧起点（read-only）: `LEGACY-ASSET-603D0E8D8193914F4AC0` `design-refactoring-domain-model.md` §0〜§1（意味署名・consumer/oracle保全・見た目だけの共通化拒否）、`LEGACY-ASSET-4F5A1F0739EC1111D91D` `design-template-json-authority.md` §1〜§2（意味正本・catalog・生成viewの分離）。保持するのは意味・consumer・oracle・証拠保全の方針、変更するのは外部先行事例の比較を一次資料から比較表へ具体化する点である。旧runtime・固定role・gateは移植しない。

## 1. 対象と一次資料

| 対象 | 一次資料URL | 確認日 | 確認できた版・状態 |
|---|---|---|---|
| LikeC4 | https://likec4.dev/dsl/intro/ | 2026-10-20 | docs上の現行記述。latest release表記 v1.60.0 |
| Structurizr | https://docs.structurizr.com/as-code | 2026-10-20 | docs上の現行記述。CLI binaries表記 v2026.09.19 |
| OMG SysML v2 / KerML | https://www.omg.org/spec/SysML/2.0 | 2026-10-20 | Version 2.0、formal、publication 2025-09。規範機械可読文書（SysML.xmi・Systems-Library.kpar等）付記 |
| Specmatic / OpenAPI | https://docs.specmatic.io/spec_driven_api_development/contract_testing | 2026-10-20 | docs上の現行記述 |
| TLA+ / AWS事例 | https://docs.tlapl.us/ ・ https://www.amazon.science/publications/how-amazon-web-services-uses-formal-methods | 2026-10-20 | tlapl.us公式文書入口。AWS記事は公開ページを確認したが詳細本文の取得は本セッション未完了（後述の留保参照） |

## 2. 一次資料が示す事実（原記述に確認できた範囲）

- **LikeC4**: `.likec4`/`.c4` 拡張子のDSLでarchitectureを記述し、全sourceを単一modelへmergeする。top-level statementは `specification`（element kind）・`model`（要素・関係）・`views`（visualization）・`global`（共有predicate）に分かれ、modelとviewsが文法的に分離される。`views` blockは同一block内のlocal styleを許す。validate・CLI・model API等のtooling guideが存在する。
- **Structurizr**: 「models as code」ツールで、C4 model向けDSLを正本として図をrenderingする。UI駆動の図作成手段を持たず、version control friendly・text diff・Git collaborationを設計理由として明示する。`validate`/`inspect` command、workspace versioning/branches、implied relationships等を持つ。
- **OMG SysML v2**: 汎用modeling言語で、要求・構造・振る舞い・analysis case・verification caseを表す。Version 2.0はformal specification（2025-09）。規範の機械可読文書（abstract syntaxのMOF XMI、KerML model interchange project `.kpar`、v1→v2 transformation model）が同梱される。KerMLはtextual notation基盤で、standard API/servicesが別規格としてある。
- **Specmatic / OpenAPI**: API specificationをcontract testとして実行する。request examplesを送出し、応答がspec適合（signature）かを検査する。response exampleの値はデフォルトで応答値と比較せず（contract test≠API test、signature検査とlogic検査の区別を明記）、複数候補応答はexample名の対応で選ぶ。examplesの外部JSON化・backward compatibility rulesを持つ。
- **TLA+ / AWS**: TLA+は状態機械としての仕様記述と有限状態探索（model checking）による不変条件・性質の反例検出を持つ。AWSの公式発表では、分散系設計（DynamoDB・S3・EBS内部アルゴリズム等）のレビューにTLA+/TLCを用い、微妙なバグを実装前に検出したと報告されている（本セッションではAWS記事の本文詳細を再取得できていないため、記述の対応関係は公開要旨・周知内容として仮説扱いで記す）。

## 3. 観点別比較（事実→HELIX仮説）

| 観点 | LikeC4 | Structurizr | SysML v2 | Specmatic/OpenAPI | TLA+/AWS | HELIXとの差（仮説） |
|---|---|---|---|---|---|---|
| 意味正本とview分離 | model/viewsを文法分離。viewsはmodelのprojection | DSL正本→図は生成view | 標準モデル＋text/graph表現＋XMI/kpar | specが契約正本、test/mockは派生 | 仕様記述が正本、実行結果は検査結果 | HELIXはJSON意味正本＋生成view＋hash/版付き参照。viewの正本化禁止と同型 |
| 独立oracleと反例 | validateは構造検査まで | validate/inspectionsは構造整合 | verification caseは標準内だが実行はtool依存 | contract testはsignature適合のみ、値oracleは比較しない（原記述に明示） | TLCは不変条件の反例traceを有限model上で検出 | HELIXは独立期待値・原source・hash照合を分離。形式検査はdesignの一部性質に限る |
| 変更影響と片側交換 | 未確認（model mergeとviews依存はある） | implied relationships/inspectionsが影響表示を支援 | 標準のrefinement/constraint関係はあるが実証例は未確認 | backward compatibility rules・破壊変更検出 | 変更前後の状態遷移をmodel比較できる（実運用で広く使われるかは未確認） | HELIXの片側交換・固定側不変は版付きcontract+逆変換照合で担保 |
| Red→Green→Refactor相当 | 未確認 | 未確認 | 未確認 | spec-first→実装→contract test回帰は類似 | 仕様で先に反例を潰す点が近いが実行単位が違う | 反例先行の設計TDD思想とは類縁だが、HELIXは候補fixtureと逆変換oracleを持つ |
| owner/資格・両端binding | 対象外（図モデル） | 対象外 | requirement/verificationの標準概念はある | API契約の境界はprovider/consumerだがowner資格は対象外 | 状態として資格をモデル化は可能だが標準ではない | BRAIN→CORE→OSのowner-qualified両端binding・未供給資格の検出はHELIX固有領域 |

## 4. 具体例: missing/null と owner資格を独立した問題として扱う

例: BRAIN→COREの入力scopeで、要求されたknowledge revisionが未供給（missing）であることと、値が`null`で保持されることは別の問題で、さらにその検出を報告できるownerの資格（誰が供給責任を持つか）も独立している。

- **OpenAPI/Specmaticが支援する部分**: required field欠落・nullable違反・型不一致といった構造的検査は仕様から機械的に検出できる。request example名で応答候補を選ぶ仕組みは、入出力対応の静的表現として近い。
- **支援しない部分**: spec上の「missing」と「null値の正当な出現」をdomain意味として区別する検査、検出した欠落を誰の資格境界の問題とするかの追跡、原source・独立期待と照合した上での意味合致の判定。API契約conformanceは「signatureが合うか」までで、「同じ意味を持つ原資料と一致するか」は判定しない（原記述でもcontract testはresponse値比較をしないと明記）。
- **TLA+が支援する部分**: missing/qualifiedの状態を仕様に含めれば、有限model上で「供給なしに完了しない」「nullと欠落を混同しない」性質を反例traceで確認できる（HELIXへ適用した場合の仮説。実モデルは未作成）。
- **Structurizr/LikeC4・SysML v2の位置**: architecture/要求・検証caseの表現は支援するが、フィールド単位のmissing/nullの意味検査・owner資格の帰属は対象外またはtool依存。
- **HELIXが別途必要とする部分**: owner-qualifiedな供給責任の追跡、原source/独立期待との照合、未証明状態の記録、影響先だけの再検証とunknown時の拡大、不変量の逆変換oracle。既存アプローチは構造・契約・有限model検査までで、意味・資格・証拠保全の層はHELIX側の設計対象として残る。

## 5. 現行対象との対応（本文書の位置づけ）

- HARNESS005 `docs/helix-harness/L8-unit-verification/verification-discipline.json`: 検証規律（独立期待・原source・照合）の設計。contract/spec検査は構造被覆として補完だが、意味oracleの独立性を代替しない。
- HARNESS015 `docs/helix-harness/L8-unit-verification/tdd-development-flow.json`: Red→Green→Refactor。TLA+/contract testの「先に反例・契約を固定」は類縁だが、意味保存refactorと逆変換はHELIX固有の確認単位。
- OS020 `docs/helix-os/L9-integration-verification/ci-profile-execution-recovery.json`: profile/実行回復の設計。形式検査は状態・復旧条件の一部には役立つが、影響先だけの再検証と失敗後復旧の管理は別領域。
- CONNECT006 `docs/helix-connect/L8-unit-verification/one-side-replacement-recovery.json`: 片側交換。Specmaticのbackward compatibilityやport/adapter互換判定は支援範囲の一部。互換不能・unknownの取扱いはHELIX側で明示する。
- 親ticket 5観点（意味変更と非意味差の区別・片側交換・共通化/外部化・影響先再検証・計測可能性）への写像: 1)意味/非意味差はmodel正本とview分離の考えに対応、2)片側交換はcontract/backward compatibility判定の補完、3)共通化・外部化はmodel merge・implied relationshipのtrade-offに対応、4)影響先再検証はTLA+/contract回帰の類縁だがunknown拡大は未確認、5)計測は各toolのmetrics/CI guideへ仮説として示すに留める。

## 6. 限界・留保・未確認点

- この比較は一次資料を同日に確認した範囲の記録であり、製品機能の全評価ではない。AWS記事は公開ページを確認したが本文詳細の再取得は本セッション未完了であり、記述は公開要旨・周知内容の仮説とする。
- toolの導入・ライセンス・実運用・設計承認は本書からは判断しない。候補としての適用可能性と残る境界の記録である。
- 各toolのvalidate・inspection・model-checking能力がHELIXの要求する「意味oracleの独立性」を代替しないのは一次資料の記述と整合するが、全機能の調査ではない。
- 件数・性能・コストの推定はない。追試として、実例fixtureへ対応する最小model・spec・contract例を作って反例検出・変更影響を確かめることが挙げられる（これは候補であり今回の作業範囲外）。
- 設計変更・上流還流・採否の判断は別に行い、現行設計作業には割り込ませない。

