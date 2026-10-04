# P01 Architecture styleと境界分割の観察（D01 Software Architecture／D02 Application Architecture）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| kgrzybek/modular-monolith-with-ddd | https://github.com/kgrzybek/modular-monolith-with-ddd | 91c8ef24b4cb6ef558c95d8267fa07d68c7059f8（master） | MIT | false | 2026-10-04 | ADR（architecture-decision-log）とNetArchTestによるarchitecture testが同じrepoにあり、決定とその強制を対で読めるため |
| dotnet/eShop | https://github.com/dotnet/eShop | dc7ea499cd356924fb6689b3702964a5869dbae9（main） | MIT | false | 2026-10-04 | サービス分割、RabbitMQ event bus、transactional outbox、Aspire AppHostによる構成定義を持つmicroservices参照実装のため |
| GoogleCloudPlatform/microservices-demo | https://github.com/GoogleCloudPlatform/microservices-demo | 38e7348eb289eb5b87c0c6e8cb19ced0449dc389（main） | Apache-2.0 | false | 2026-10-04 | 多言語のgRPC microservices。共有protoによる契約と同期orchestrationを観察できるため |
| ddd-by-examples/library | https://github.com/ddd-by-examples/library | 5225ff7a0f0c1e0751b91cdd64f925cd001d7555（master） | MIT | false | 2026-10-04 | package単位のmodular monolithで、bounded contextごとに局所architecture（hexagonal／CRUD）を変え、ArchUnitで強制しているため |
| spring-projects/spring-modulith | https://github.com/spring-projects/spring-modulith | c103395eedd6909eab57648c6d55246808723b48（main） | Apache-2.0 | false | 2026-10-04 | module境界の検証、named interface、event publication registryを、frameworkの機能として提供しているため |

すべて作業用の一時領域へ`git clone --filter=blob:none`し、上の固定commitを`git checkout`した。どのrepoでもコード、test、buildは実行していない。

## 観察

### P01-O01 bounded contextをmodule境界にする分割（modular monolith）
- 出典：
  - modular-monolith-with-ddd `docs/architecture-decision-log/0002-use_modular-monolith-system-architecture.md` 行19–24（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/docs/architecture-decision-log/0002-use_modular-monolith-system-architecture.md#L19-L24）
  - 同 `0004-divide-the-system-into-4-modules.md` 行11–40（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/docs/architecture-decision-log/0004-divide-the-system-into-4-modules.md#L11-L40）
  - library `README.md` 行82–107（https://github.com/ddd-by-examples/library/blob/5225ff7a0f0c1e0751b91cdd64f925cd001d7555/README.md#L82-L107）、同 行501–550（https://github.com/ddd-by-examples/library/blob/5225ff7a0f0c1e0751b91cdd64f925cd001d7555/README.md#L501-L550）
  - 信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：MMDDDは、subdomain（Meetings＝core、Administration・Payments＝supporting、UserAccess＝generic）をbounded contextへ1対1に写し、各contextを`src/Modules/<Name>/{Application,Domain,Infrastructure,IntegrationEvents}`の組として分けている。全moduleは1 processで動く（ADR0002「All modules must run in one single process」）。ADR0004は、単一moduleを内部で分ける案と4 moduleに分ける案を比べ、後者を採っている。結果として「APIを各moduleに定義する」「データも分ける」「API/GUI層は全moduleを知る」ことを受け入れている。libraryは、各contextをJava packageに割り当てている（`catalogue`、`lending`、`commons`）。そのうえで、contextごとに局所architectureを変えている。lendingはdomain model＋hexagonal、catalogueは「CRUD-like local architecture」である（README 行88–92）。
- 解いている問題と前提：MMDDDのADR0004は、Big Ball of Mudの回避、moduleの自律性、チームへの委譲（行40）を目的に挙げている。libraryはEvent Stormingでcontextとその複雑さを特定したことを前提にしている（行104–106）。
- 必要な入力：subdomainの分類とbounded contextの境界。contextごとの複雑さの見立て（libraryで局所architectureを選ぶ根拠になっている）。
- trade-off・失敗の仕方：ADR0004 行21・35は、初期の実装負荷が増えること、全体の複雑さが上がることを明記している。MMDDDの実体はADRの「4 modules」と食い違う。`src/Modules`には`Registrations`があり、5 moduleになっている。ADRの更新がコードに追従していない例として観察した。
- 反例・適用しない場合：MMDDDのissue #344（https://github.com/kgrzybek/modular-monolith-with-ddd/issues/344 、本文確認済）が指摘するとおり、README自身がdomain exploration、strategic DDD、architecture評価をout of scopeとしている。境界をどう発見したかは、このrepoからは読めない。
- 互換・非互換：O02、O03、O05、O07と組み合わせて使われている。O10（独立deployするservice）とは、process境界の置き方が異なる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P01-O02 moduleごとの単一facade（Command／Query実行interface）
- 出典：
  - modular-monolith-with-ddd `docs/architecture-decision-log/0006-create-facade-between-api-and-business-module.md` 行13–33（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/docs/architecture-decision-log/0006-create-facade-between-api-and-business-module.md#L13-L33）
  - `src/Modules/Meetings/Application/Contracts/IMeetingsModule.cs` 行3–10（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/src/Modules/Meetings/Application/Contracts/IMeetingsModule.cs#L3-L10）
  - `src/Modules/Meetings/Infrastructure/MeetingsModule.cs` 行9–29（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/src/Modules/Meetings/Infrastructure/MeetingsModule.cs#L9-L29）
  - ADR0016 `0016-create-ioc-container-per-module.md` 行41–50（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/docs/architecture-decision-log/0016-create-ioc-container-per-module.md#L41-L50）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：各moduleは`I<Name>Module`を公開する。これは`ExecuteCommandAsync`（結果あり・なし）と`ExecuteQueryAsync`の3メソッドだけを持つ。interfaceはApplication.Contracts assemblyにあり、実装はInfrastructure assemblyにある。実装は、moduleごとのcomposition root（`MeetingsCompositionRoot`）からlifetime scopeを開き、MediatRへ委譲する。API層から見えるのはCommand、Query、戻り値の型だけである。ADR0016により、IoC containerもmoduleごとに別に持つ。
- 解いている問題と前提：API層と業務moduleの結合を、最小の契約に絞る（ADR0006 行13）。host applicationの依存を「Application Service Layerだけ」にする（ADR0016 行36）。
- 必要な入力：Command／Queryの型の置き場所（Contracts）。module外へ見せる型の範囲。
- trade-off・失敗の仕方：ADR0006 行33は、encapsulationのために追加作業（internal constructorによる生成など）が発生すると書いている。ADR0016 行38–39は、コードの重複と「non-standard approach」を欠点として挙げている。
- 反例・適用しない場合：spring-modulith（O05）は単一facadeを要求しない。module base packageのpublic型全体、またはnamed interfaceをAPIとみなす。libraryも単一facadeを置かず、package-private scopeで隠している（README 行501–506）。
- 互換・非互換：O03（facadeを通さない依存をtestで検出）と組み合わせて使われている。O05とは「APIの宣言の仕方」が異なる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P01-O03 namespace文字列と除外リストによるmodule間依存のarchitecture test（NetArchTest）
- 出典：
  - modular-monolith-with-ddd `docs/architecture-decision-log/0017-implement-archictecture-tests.md` 行11–24（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/docs/architecture-decision-log/0017-implement-archictecture-tests.md#L11-L24）
  - `src/Tests/ArchTests/Modules/ModuleTests.cs` 行24–45（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/src/Tests/ArchTests/Modules/ModuleTests.cs#L24-L45）
  - `src/Tests/ArchTests/SeedWork/TestBase.cs` 行12–18（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/src/Tests/ArchTests/SeedWork/TestBase.cs#L12-L18）
  - `src/Modules/Meetings/Tests/ArchTests/Module/LayersTests.cs` 行21–30（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/src/Modules/Meetings/Tests/ArchTests/Module/LayersTests.cs#L21-L30）
  - `src/Modules/Meetings/Tests/ArchTests/Domain/DomainTests.cs` 行11–62（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/src/Modules/Meetings/Tests/ArchTests/Domain/DomainTests.cs#L11-L62）
  - issue #177（https://github.com/kgrzybek/modular-monolith-with-ddd/issues/177 、本文確認済）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：testには3つの階層がある。
  - 全体test（`ModuleTests`）：moduleごとにContracts、Domain、Infrastructureの3 assemblyを集める。`INotificationHandler<>`の実装、`IntegrationEventHandler`で終わる名前、`EventsBusStartup`を除いた型について、他moduleのnamespace文字列（`TestBase`の定数）への依存がないことを確かめる。
  - module内test（`LayersTests`）：Domain→Application、Application→Infrastructureの禁止を確かめる。
  - Domain test：Value ObjectやDomain Eventのimmutable性、Aggregate Root以外のEntityがpublic memberを持たないこと等を、reflectionで確かめる。
- 解いている問題と前提：ADR0017 行11は、compilerでは強制できない設計規則が、code reviewだけでは逸脱することを問題にしている。前提は、namespaceとassemblyの命名規約がmodule境界と一致していることである。
- 必要な入力：module名とnamespaceの対応表。境界をまたいでよい型の列挙（除外リスト）。
- trade-off・失敗の仕方：
  - testそのものが誤ることがある。issue #177は、`ModuleTests`の対象assemblyにInfrastructureが2回入り、Contractsが検査されていなかった誤りの報告である（修正済み）。
  - 固定commitでも、各moduleの`LayersTests`の`DomainLayer_DoesNotHaveDependency_ToInfrastructureLayer`は、本体で`ApplicationAssembly`を検査している（行21–30。Administration、UserAccess、Registrations、Paymentsでも同形）。test名と検査内容が食い違ったまま残っている。
  - `TestBase`の定数と`ModuleTests`には`Registrations`がない。新しいmoduleを追加しても、全体testの対象に自動では入らない。
  - 除外は型名の接尾辞で行う。そのため、名前の規約に従えば境界を越えられる。
  - ADR0017 行22–24は、reflection実装の負担とtest速度を欠点に挙げている。
- 反例・適用しない場合：eShopはarchitecture testを持たない（`NetArchTest`／`ArchUnit`をgrepして0件）。層の分離はproject reference（csproj）というcompile時の構造で表している（O06）。
- 互換・非互換：O04、O05と同じ問題を別の手段で解いている。O07のhandler群は、このtestの除外対象になっている。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P01-O04 package path patternによるhexagonal層・context間依存のArchUnit規則
- 出典：
  - library `src/test/groovy/io/pillopl/library/ModularArchitectureTest.java` 行15–40（https://github.com/ddd-by-examples/library/blob/5225ff7a0f0c1e0751b91cdd64f925cd001d7555/src/test/groovy/io/pillopl/library/ModularArchitectureTest.java#L15-L40）
  - `src/test/groovy/io/pillopl/library/lending/architecture/LendingHexagonalArchitectureTest.java` 行15–67（https://github.com/ddd-by-examples/library/blob/5225ff7a0f0c1e0751b91cdd64f925cd001d7555/src/test/groovy/io/pillopl/library/lending/architecture/LendingHexagonalArchitectureTest.java#L15-L67）
  - `src/test/groovy/io/pillopl/library/lending/architecture/NoSpringInDomainLogicTest.java` 行11–33（https://github.com/ddd-by-examples/library/blob/5225ff7a0f0c1e0751b91cdd64f925cd001d7555/src/test/groovy/io/pillopl/library/lending/architecture/NoSpringInDomainLogicTest.java#L11-L33）
  - `README.md` 行276–308（https://github.com/ddd-by-examples/library/blob/5225ff7a0f0c1e0751b91cdd64f925cd001d7555/README.md#L276-L308）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：`noClasses().that().resideInAPackage("..model..").should().dependOnClassesThat().resideInAPackage(...)`の形で、次を禁止している。
  - model→application／infrastructure／ui
  - application→infrastructure／ui
  - ui→infrastructure
  - catalogue→lending
  - commons→catalogue／lending
  - lendingのmodel／applicationから`org.springframework..`への依存

  README 行276–283は、Maven moduleへの分割も代替になると述べたうえで、ArchUnitを選んでいる。
- 解いている問題と前提：hexagonalの抽象度の混在と、frameworkのdomainへの侵入を防ぐ。前提は、package名に層名（model／application／infrastructure）が規約どおり入っていることである。
- 必要な入力：層名とpackage名の規約。許す依存方向の一覧。
- trade-off・失敗の仕方：
  - 規則は一方向だけである。catalogue→lendingは禁止しているが、lending→catalogueは禁止していない。実際に`lending/book/model/AvailableBook.java`等は`io.pillopl.library.catalogue.BookId`をimportしている（grep確認）。
  - `..ui..`を禁止対象にしているが、実在するpackageは`lending/patronprofile/web`であり、`ui`という名前のpackageはない。名前の規約がずれると、規則は何も検査しなくなる。
  - `NoSpringInDomainLogicTest`はapplication→Springを禁止している。一方、`lending/book/application/CreateAvailableBookOnInstanceAddedEventHandler.java`、`PatronEventsHandler.java`、`patron/application/hold/HandleDuplicateHold.java`は`org.springframework.context.event.EventListener`をimportしている。annotationのみの参照が違反として検出されるかは、使用しているArchUnitの版（pom上は0.9.3）の仕様による。testを実行していないため、検出されるかは判定していない。
  - test fileは`src/test/groovy`にあるが、拡張子は`.java`である。compile対象になる経路は、gmavenplusの`addTestSources`に依存する（pom 行163–188）。
- 反例・適用しない場合：catalogueは「CRUD-like」のため、hexagonal規則の対象外である（`@AnalyzeClasses(packages = "io.pillopl.library.lending")`）。
- 互換・非互換：O03と同じ目的である。O05のjMolecules連携（`ensureHexagonal`）は、同じ種類の規則をframework側から提供している。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P01-O05 packageの規約から導いたmodule modelの一括検証（cycle、internal参照、allowedDependencies、named interface）
- 出典：
  - spring-modulith `src/docs/antora/modules/ROOT/pages/fundamentals.adoc` 行11–21、行144–172、行221–264、行266–297、行299–416（https://github.com/spring-projects/spring-modulith/blob/c103395eedd6909eab57648c6d55246808723b48/src/docs/antora/modules/ROOT/pages/fundamentals.adoc#L144-L172 ほか同fileの各範囲）
  - `verification.adoc` 行22–62（https://github.com/spring-projects/spring-modulith/blob/c103395eedd6909eab57648c6d55246808723b48/src/docs/antora/modules/ROOT/pages/verification.adoc#L22-L62）
  - `spring-modulith-core/src/main/java/org/springframework/modulith/core/ApplicationModules.java` 行445–498・611–618（https://github.com/spring-projects/spring-modulith/blob/c103395eedd6909eab57648c6d55246808723b48/spring-modulith-core/src/main/java/org/springframework/modulith/core/ApplicationModules.java#L445-L498）
  - `spring-modulith-core/src/main/java/org/springframework/modulith/core/ApplicationModule.java` 行1359–1425（https://github.com/spring-projects/spring-modulith/blob/c103395eedd6909eab57648c6d55246808723b48/spring-modulith-core/src/main/java/org/springframework/modulith/core/ApplicationModule.java#L1359-L1425）
  - `spring-modulith-api/src/main/java/org/springframework/modulith/ApplicationModule.java` 行49–70（https://github.com/spring-projects/spring-modulith/blob/c103395eedd6909eab57648c6d55246808723b48/spring-modulith-api/src/main/java/org/springframework/modulith/ApplicationModule.java#L49-L70）
  - `spring-modulith-examples/spring-modulith-example-full/src/test/java/example/ModularityTests.java` 行27–39
  - issue GH-1778（https://github.com/spring-projects/spring-modulith/issues/1778 、本文確認済）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：`ApplicationModules.of(Application.class)`は、main packageの直下のsub-packageをmoduleとみなし、base packageをAPI、それより下のpackageをinternalとして、modelを組み立てる。`detectViolations`は3種の違反を集めて`Violations`として返す。`verify`は一度だけ実行して例外を投げる。
  1. ArchUnitの`SlicesRuleDefinition.slices().beFreeOfCycles()`によるmodule間のcycle
  2. `VerificationOptions`で足した追加検証（例：jMoleculesのhexagonal規則）
  3. moduleごとの`detectDependencies`

  依存の判定（`isValidDependencyWithin`）は次の順で行う。同一moduleなら許可する。`allowedDependencies`の宣言があり、そこに含まれなければ違反とする。対象moduleが`Type.OPEN`なら許可する。対象の型がexposed（APIまたはnamed interface）でなければ違反とする。`@NamedInterface`はinternal packageの一部を名前付きで公開する。`allowedDependencies`は`module::interface`の形で、named interfaceを指定できる。
- 解いている問題と前提：publicにせざるを得ないinternal型をcompilerでは守れない（fundamentals 行165–171）。前提はpackageの配置規約である。`allowedDependencies`の既定値は「制限なし」で、空配列にすると全依存を禁止する（api 行49–62）。
- 必要な入力：main packageの位置。moduleとして扱うpackageの単位。公開するnamed interface。必要なら許可する依存の一覧。
- trade-off・失敗の仕方：
  - Open moduleは、既存コードの段階的な移行のためにある。docsは、完全にmodule化した状態で使うと、分割が不十分であることの兆候になると注意している（fundamentals 行263–264）。
  - 違反messageが曖昧だった不具合がある。GH-1778では、sharedModulesで許可したmoduleのinternal型を参照したとき「Allowed targets」と出て原因が読めなかった。コード 行1374–1377のコメントと、行1378–1387の修正コードが、この修正である。
  - `verify`は一度だけ実行される（`verified` flag）。`detectViolations`は毎回実行される（行445–468）。
- 反例・適用しない場合：MMDDD（O03）はassembly／namespaceの文字列を手書きで列挙し、frameworkによる導出をしない。libraryは個別のArchUnit規則で、module modelを持たない。
- 互換・非互換：O03、O04と同じ問題を解いている。testing.adocの`@ApplicationModuleTest`のbootstrap mode（STANDALONE等、testing.adoc 行79–96）は、同じmodule modelをintegration testの範囲指定に再利用している。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P01-O06 portの置き場所とadapterの実装（hexagonal／clean）
- 出典：
  - library `src/main/java/io/pillopl/library/lending/patron/application/hold/FindAvailableBook.java` 行8–12（https://github.com/ddd-by-examples/library/blob/5225ff7a0f0c1e0751b91cdd64f925cd001d7555/src/main/java/io/pillopl/library/lending/patron/application/hold/FindAvailableBook.java#L8-L12）
  - `.../patron/application/hold/PlacingOnHold.java` 行21–60
  - `.../patron/model/Patrons.java` 行5–10
  - `.../book/infrastructure/BookDatabaseRepository.java` 行28（https://github.com/ddd-by-examples/library/blob/5225ff7a0f0c1e0751b91cdd64f925cd001d7555/src/main/java/io/pillopl/library/lending/book/infrastructure/BookDatabaseRepository.java#L28）
  - eShop `src/Ordering.Domain/AggregatesModel/OrderAggregate/IOrderRepository.cs` 行6–13（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.Domain/AggregatesModel/OrderAggregate/IOrderRepository.cs#L6-L13）
  - `src/Ordering.Domain/Ordering.Domain.csproj` 行7–10、`src/Ordering.Infrastructure/Ordering.Infrastructure.csproj` 行9–10、`src/Ordering.API/Ordering.API.csproj` 行19–23
  - `src/Ordering.Domain/SeedWork/Entity.cs` 行19–24
  - MMDDD ADR `0010-use-clean-architecture-for-writes.md`（題名のみ確認、本文は未読）
  - 信頼性ラベル：primary。本文確認：済（ADR0010を除く）
- 何をしているか：
  - library：application service `PlacingOnHold`は、application層のport `FindAvailableBook`（関数型interface）と、model層のrepository port `Patrons`を受け取る。aggregate `Patron`の結果（`Either<BookHoldFailed, BookPlacedOnHoldEvents>`）を、`Patrons.publish`へ渡す。adapterの`BookDatabaseRepository`（package-private）は`BookRepository`、`FindAvailableBook`、`FindBookOnHold`を同時に実装する。patron側のportを、book側のinfrastructureが満たしている。
  - eShop：repository interfaceをDomain projectに置き、Infrastructure projectで実装している。依存方向はcsprojのProjectReferenceで固定されている（Domainは他projectを参照しない。InfrastructureはDomainを参照する。APIは両方を参照する）。
- 解いている問題と前提：domainをframeworkとインフラから分け、stubなしでunit testできるようにする（library README 行96–101）。
- 必要な入力：portをどの層（model／application）に置くかの規約。adapterの可視性。
- trade-off・失敗の仕方：eShopのDomain projectは、MediatRへのPackageReferenceを持つ。`Entity`のdomain eventの型は`INotification`である。domainがmediator libraryに依存しており、libraryの「model→Spring禁止」（O04）とは逆の選択になっている。libraryでは、1つのadapterが複数aggregateのportを実装するため、adapterの変更が複数のaggregateに及ぶ。
- 反例・適用しない場合：libraryのcatalogueは、portとadapterの分離を採らない（CRUD）。
- 互換・非互換：O04（規則による強制）とeShopのcompile時の強制は、同じ境界を別の手段で守っている。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P01-O07 process内のevent busとinboxによるmodule間の非同期通信
- 出典：
  - modular-monolith-with-ddd `docs/architecture-decision-log/0014-event-driven-communication-between-modules.md` 行15–61（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/docs/architecture-decision-log/0014-event-driven-communication-between-modules.md#L15-L61）
  - `0015-use-in-memory-events-bus.md` 行47–56
  - `src/BuildingBlocks/Infrastructure/EventBus/InMemoryEventBus.cs` 行18–55（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/src/BuildingBlocks/Infrastructure/EventBus/InMemoryEventBus.cs#L18-L55）
  - `src/Modules/Payments/Infrastructure/Configuration/EventsBus/EventsBusStartup.cs` 行18–25
  - `.../EventsBus/IntegrationEventGenericHandler.cs` 行10–37（https://github.com/kgrzybek/modular-monolith-with-ddd/blob/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8/src/Modules/Payments/Infrastructure/Configuration/EventsBus/IntegrationEventGenericHandler.cs#L10-L37）
  - `.../Processing/Inbox/ProcessInboxJob.cs` 行6–10
  - library `src/main/java/io/pillopl/library/lending/book/application/CreateAvailableBookOnInstanceAddedEventHandler.java` 行14–27、`catalogue/Catalogue.java` 行37
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - MMDDD：ADR0014は、直接呼出しとpublish/subscribeの得失を比べ、後者を選んでいる。直接呼出しは「例外として将来許す」としている。eventはbounded contextの「Published Language」になる（行60）。ADR0015は、外部brokerではなくin-memory busを選び、別processへ分離するときはmiddlewareへ切り替える必要があると記録している（行56）。実装の`InMemoryEventBus`はsingletonで、event型のFullNameをkeyにhandler listを持つ。受信側（Payments）の`EventsBusStartup`は、他moduleの`IntegrationEvents` assemblyの型を購読する。汎用handlerは、受信したeventを自moduleのschemaの`InboxMessages`表へ書くだけである。実処理は、Quartz jobの`ProcessInboxJob`が後で行う。
  - library：catalogueは`DomainEvents.publish`でeventを出し、lending側はSpringの`@EventListener`で受ける。
- 解いている問題と前提：moduleの自律性と、moduleどうしが直接依存しないこと。eventual consistencyを受け入れることが前提である（ADR0014 行59）。
- 必要な入力：module間で公開するevent（integration event）の一覧と置き場所（`<Module>.IntegrationEvents` assembly）。
- trade-off・失敗の仕方：
  - ADR0014 行42–46は、間接化、複雑化、即時一貫性がないことを挙げている。
  - `InMemoryEventBus.Publish`は、dictionaryのindexer（行46）でhandlerを引く。購読者がいないevent型をpublishした場合の扱いは、コード上に防御がない。
  - 受信側が送信側のIntegrationEvents assemblyに依存するため、O03のtestでは`EventsBusStartup`とhandlerを除外対象にしている。
  - library README 行229–235は、eventでも結合は消えず、不要なeventの公開がfeature envyを招くと書いている。
- 反例・適用しない場合：eShop（O08）は、process間でbroker（RabbitMQ）を使う。spring-modulithは、Springのapplication eventにpublication registryを重ねる（O08）。
- 互換・非互換：O03の除外規則と組み合わせて使われている。O08（送信側の保証）と対になる受信側の保証（inbox）である。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値（polling間隔等）は持ち込まない。

### P01-O08 transactional outbox／event publication registry（送信の永続化と状態遷移）
- 出典：
  - eShop `src/Ordering.API/Application/Behaviors/TransactionBehavior.cs` 行20–63（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.API/Application/Behaviors/TransactionBehavior.cs#L20-L63）
  - `src/Ordering.API/Application/IntegrationEvents/OrderingIntegrationEventService.cs` 行13–41
  - `src/IntegrationEventLogEF/Services/IntegrationEventLogService.cs` 行10–59（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/IntegrationEventLogEF/Services/IntegrationEventLogService.cs#L10-L59）
  - `src/IntegrationEventLogEF/EventStateEnum.cs` 行3–9
  - eShop issue #159（https://github.com/dotnet/eShop/issues/159 、本文確認済）
  - spring-modulith `src/docs/antora/modules/ROOT/pages/events.adoc` 行5–7・128–131・198–290（https://github.com/spring-projects/spring-modulith/blob/c103395eedd6909eab57648c6d55246808723b48/src/docs/antora/modules/ROOT/pages/events.adoc#L198-L290）
  - library `src/main/java/io/pillopl/library/commons/events/publisher/StoreAndForwardDomainEventPublisher.java` 行11–28、`DomainEventsConfig.java` 行12–15
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - eShop：MediatRのpipeline behaviorがtransactionを開き、command処理の中で`AddAndSaveEventAsync`を呼ぶ。integration eventは、同じDB transactionで`IntegrationEventLogEntry`として保存される。commitの後、そのtransactionIdの`NotPublished`の行を読み、`InProgress`→publish→`Published`へ進める。例外の場合は`PublishedFailed`にする。
  - spring-modulith：`@TransactionalEventListener`ごとに、publication logの行をbusiness transactionの中で書く。状態はPUBLISHED／PROCESSING／COMPLETED／FAILED／RESUBMITTED／ABANDONEDである。staleness monitorで停滞した行をFAILEDにし、`FailedEventPublications.resubmit`で再投入する。
  - library：保存して後で送る`StoreAndForwardDomainEventPublisher`（固定間隔の`@Scheduled`。値は持ち込まない）を持つ。ただし、`DomainEventsConfig`がbeanとして登録しているのは`JustForwardDomainEventPublisher`をmeteringで包んだものである。store-and-forwardは配線されていない。
- 解いている問題と前提：業務状態の変更とeventの送出の原子性を保つ。spring-modulithのdocs 行128–131は、listenerの失敗や、listener起動前のprocess停止でeventが失われることを問題として明記している。
- 必要な入力：eventを保存するstoreが、業務DBと同じtransaction境界にあること。再送の方針。
- trade-off・失敗の仕方：
  - eShopで`PublishedFailed`や未送出の行を再送する処理は、固定commitのsrc内で`RetrieveEventLogsPendingToPublishAsync(transactionId)`の呼出し1箇所しか見つからなかった（grep）。transaction単位の即時送出だけである。
  - issue #159は、handlerが直接publishしないことを不具合と誤認した報告である。outboxの経路（TransactionBehavior経由）がコードから読みにくいことを示している。closeのcommentも「cancellation/outboxのintegration testがあれば改善する」と述べている。
  - eShopの`IntegrationEventLogService`は、entry assemblyから名前が`IntegrationEvent`で終わる型を集め、短い型名で復元する（行13–16・28）。
  - spring-modulithはこの種の停滞と再送をlifecycleとして明示している（events.adoc 行223–290）。
- 反例・適用しない場合：MMDDDのin-memory bus（O07）は、送信側を同期のin-process呼出しにし、受信側でinboxに永続化している。microservices-demo（O10）にはoutboxもbrokerもない。
- 互換・非互換：O07のinboxとは送信側と受信側の対になる。O09（契約）と組み合わせて使われている。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P01-O09 service間の契約の共有方法：型名の一致による複製（eShop）と単一protoの生成（microservices-demo）
- 出典：
  - eShop `src/EventBusRabbitMQ/RabbitMQEventBus.cs` 行31–33・192–196（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/EventBusRabbitMQ/RabbitMQEventBus.cs#L31-L33）
  - `src/EventBus/Extensions/EventBusBuilderExtensions.cs` 行20–38
  - `src/Ordering.API/Application/IntegrationEvents/Events/OrderStatusChangedToPaidIntegrationEvent.cs` 行3–21
  - `src/Catalog.API/IntegrationEvents/Events/OrderStatusChangedToPaidIntegrationEvent.cs` 行3
  - `src/Webhooks.API/IntegrationEvents/OrderStatusChangedToPaidIntegrationEvent.cs` 行3
  - microservices-demo `protos/demo.proto` 行15–26・224–225（https://github.com/GoogleCloudPlatform/microservices-demo/blob/38e7348eb289eb5b87c0c6e8cb19ced0449dc389/protos/demo.proto#L15-L26）
  - `src/checkoutservice/genproto.sh` 行19–23
  - `src/paymentservice/proto/demo.proto`、`src/currencyservice/proto/demo.proto`、`src/adservice/src/main/proto/demo.proto`（diffで比較）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - eShop：publish側はevent型の短い名前（`GetType().Name`）をrouting keyにする。購読側は`AddSubscription<T,TH>`で`typeof(T).Name`を型にmapする。契約の共有libraryはなく、同じ名前のrecordを各serviceが別のnamespaceに独自に定義している。Orderingの`OrderStatusChangedToPaidIntegrationEvent`は5つのpropertyを持ち、CatalogとWebhooksの同名recordは2つのpropertyだけを持つ。受信側は必要な部分だけを定義している。
  - microservices-demo：全serviceの契約（`package hipstershop`、各`service`と`rpc`）を、root `protos/demo.proto`の1 fileにまとめている。Go系serviceは`genproto.sh`でrootのprotoから生成する。Node／Java系serviceはprotoのcopyをservice内に持つ。固定commitでは、copyはrootと`option go_package`の行だけが異なっていた。
- 解いている問題と前提：deploy単位を分けたまま、通信の契約をそろえる。eShopは、受信側が送信側のassemblyに依存しないことを優先している（tolerant readerの形）。microservices-demoは、単一repoの中で1つのschemaを正本にしている。
- 必要な入力：eventまたはrpcの名前空間。名前の衝突を避ける規約。copyの同期手段。
- trade-off・失敗の仕方：
  - eShopは短い型名で照合する。そのため、改名や同名の衝突がcompile時には検出されない。受信側で型が解決できないeventは、warningを出して捨てる（RabbitMQEventBus 行192–196）。
  - microservices-demoのcopyは手作業の同期に依存する。固定commitでは差分が1行だけだったが、同期を強制する仕組みはfile上に見当たらなかった。
- 反例・適用しない場合：MMDDDは、module間の契約を`<Module>.IntegrationEvents` assemblyとして共有し、型で参照する（O07）。spring-modulithは、event型をpublishするmoduleのAPIの一部として扱う（fundamentals 行16–18）。
- 互換・非互換：O08と組み合わせて使われている。O07の型共有とは、受信側の依存の向きが逆である。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P01-O10 中央serviceによる同期のorchestration（補償なし）
- 出典：
  - microservices-demo `src/checkoutservice/main.go` 行111–116・230–280（https://github.com/GoogleCloudPlatform/microservices-demo/blob/38e7348eb289eb5b87c0c6e8cb19ced0449dc389/src/checkoutservice/main.go#L230-L280）
  - `docs/purpose.md` 行1–15（https://github.com/GoogleCloudPlatform/microservices-demo/blob/38e7348eb289eb5b87c0c6e8cb19ced0449dc389/docs/purpose.md#L1-L15）
  - `docs/adding-new-microservice.md` 行1–40
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：`checkoutService.PlaceOrder`は、環境変数から得た各serviceのアドレス（shipping、productcatalog、cart、currency、email、payment）へgRPCで順に同期呼出しする。順序は、cart取得と商品・通貨換算、配送見積、決済（`chargeCard`）、配送（`shipOrder`）、cartを空にする、確認メール、である。cartを空にする処理のエラーは無視している（`_ = cs.emptyUserCart(...)`）。メール送信の失敗はwarningのlogだけで、成功を返す。決済の成功後に配送が失敗したとき、決済を取り消す処理はコード上にない。
- 解いている問題と前提：purpose.mdは、このrepoの目的をGKE、Anthos、Cloud Operations等のdemoとし、それに合わない変更はforkで行うよう求めている。業務の整合性の設計は目的に含まれていない。
- 必要な入力：呼出し先service群のアドレス（`mustMapEnv`は欠けるとpanicする）。各呼出しを必須とするか、ベストエフォートとするかの区別。
- trade-off・失敗の仕方：コード上で、ステップごとに失敗の扱いが異なる（Internal、Unavailable、無視、warning）。決済と配送の間に部分失敗の窓がある。issue検索（"charge shipping fail compensation OR rollback"）では、該当するissueは見つからなかった。
- 反例・適用しない場合：eShopの注文処理は、Ordering、Payment、Catalogの間をintegration eventでつなぐchoreographyである（O08、O09）。MMDDDは、module間の直接呼出しを例外扱いにしている（ADR0014 行52）。
- 互換・非互換：O08（outbox）とは結合の型が異なる。同じrepo内でO09の単一protoと組み合わせて使われている。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P01-O11 composition定義でのservice、datastore、依存の宣言（論理DBの分離と共有）
- 出典：
  - eShop `src/eShop.AppHost/AppHost.cs` 行9–59・98–103（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/eShop.AppHost/AppHost.cs#L9-L59）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：Aspireの`DistributedApplication`で、redis、rabbitmq、postgresを宣言する。1つのpostgres serverに`catalogdb`、`identitydb`、`orderingdb`、`webhooksdb`を論理databaseとして分け、各serviceへ`WithReference`で渡す。
  - `orderingdb`は`ordering-api`と`order-processor`の2つのdeploy単位が共有している。order-processorは「EF migrationを持つordering-api」の起動を待つ（行48–51）。
  - identity-apiは他のappのcallback URLを環境変数で受け取る。コメントは「cyclic reference」と明記している（行98–103）。
- 解いている問題と前提：database-per-serviceを論理databaseの単位で表し、起動順と依存の向きを1箇所で宣言する。
- 必要な入力：serviceごとのdatastoreの所有関係。起動の依存順序。
- trade-off・失敗の仕方：1つのbounded context（Ordering）が複数のdeploy単位とDBを共有している。schema migrationの所有者がordering-apiに偏り、起動順への依存として現れている。認証基盤との間には循環参照がある。
- 反例・適用しない場合：MMDDDは単一processの単一DBで、moduleごとにschemaを分けている（例：`[payments].[InboxMessages]`、O07）。microservices-demoは、Kubernetes manifest／kustomizeでserviceを宣言している（docs/adding-new-microservice.md 行26–40）。
- 互換・非互換：O08（outboxは業務DBと同じDBにあることが前提）と組み合わせて使われている。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値（port、image tag等）は持ち込まない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| module間依存の強制 | MMDDD：NetArchTestでassembly／namespace文字列を列挙し、型名の接尾辞で除外する（O03） | spring-modulith：packageの規約からmodule modelを導き、cycle、internal参照、allowedDependenciesを一括検証する（O05）。library：個別のArchUnit規則（O04）。eShop：csprojのProjectReferenceでcompile時に固定する（O06） | module境界を表す単位（assembly、package、project）と、規約からmodelを自動で導けるか |
| moduleのAPIの宣言 | MMDDD：Command／Queryの3メソッドのfacade interface（O02） | spring-modulith：base packageのpublic型と`@NamedInterface`。library：package-private scope | API層とmoduleの間に単一の入口を置くか、型の可視性で表すか |
| module／service間の非同期通信 | MMDDD：in-memory singleton bus＋受信側inbox（O07） | eShop：RabbitMQ＋送信側outbox（O08）。spring-modulith：application event＋publication registry | 同じprocessか、別processか。brokerを持つか |
| 送信失敗からの回復 | eShop：状態を`PublishedFailed`にする。src内では再送の経路を確認できなかった | spring-modulith：FAILED／RESUBMITTED／ABANDONEDのlifecycleと、staleness monitor | outboxをアプリ固有の実装とするか、frameworkの機能として提供するか |
| 契約の共有 | eShop：同名のrecordを受信側ごとに複製し、短い型名で照合する（O09） | microservices-demo：単一のprotoから生成する（copyあり）。MMDDD：IntegrationEvents assemblyを型で参照する | 受信側が送信側のbuild成果物に依存してよいか、言語が混在しているか |
| 複数serviceにまたがる業務の進行 | microservices-demo：checkoutが同期orchestrationし、補償はない（O10） | eShop：integration eventによるchoreography | repoの目的（platform demoか、業務参照実装か） |
| context内の局所architecture | library：lendingはhexagonal、catalogueはCRUDとcontextごとに変える（O01） | MMDDD：全moduleを同じ層構成にし、DDDのtactical patternを「most of modules」に適用する | contextごとの複雑さの見立てを設計に反映するか |
| domainのframework非依存 | library：model／applicationからSpringへの依存をArchUnitで禁止する（O04） | eShop：DomainがMediatRの`INotification`に依存する（O06） | domain eventの配送をmediatorの型で表すかどうか |

## 見つからなかったこと・gap
- eShopで、`PublishedFailed`や`NotPublished`のまま残った行を再送する処理を、src内でgrepしたが見つからなかった。test、docs、他branchは見ていない。
- microservices-demoで、決済後に配送が失敗した場合の補償について、issueを1回検索した範囲では該当がなかった。
- MMDDDのADR0010（clean architecture for writes）、ADR0007（CQRS）、ADR0009（2層の読み取り）は題名だけ確認し、本文は読んでいない。
- libraryのArchUnit testが実際に合格しているか（application層のSpring annotationが違反として検出されるか）は、実行していないため判定していない。
- libraryで「domain eventとintegration eventを区別する」と書かれた節（README 行229–235）は「soon」とあるだけで、固定commitでは該当する実装を確認していない。
- microservices-demoのprotoのcopyについて、同期を強制するCIやscriptがあるかは未確認である（`.github`は読んでいない）。
- 各repoの機構の比較（性能やチーム規模の効果）を示す一次資料は見つからなかった。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- gh api：5 repoそれぞれで`repos/<o>/<r>`とcommits（default branch）を取得した。issueは`gh search issues`を6回、`gh issue view`を4回（eShop #159、MMDDD #177・#344、spring-modulith #1778）実行した。呼出し合計は約20回である。
- modular-monolith-with-ddd：`docs/architecture-decision-log/0002,0004,0006,0014,0015,0016,0017`は全文を読んだ。`src/Tests/ArchTests/{Modules/ModuleTests.cs, Api/ApiTests.cs, SeedWork/TestBase.cs}`、`src/Modules/*/Tests/ArchTests/Module/LayersTests.cs`（5 module分の該当行）、`Meetings/Tests/ArchTests/Domain/DomainTests.cs`（行1–80）、`IMeetingsModule.cs`、`MeetingsModule.cs`、`InMemoryEventBus.cs`、Paymentsの`EventsBusStartup.cs`と`IntegrationEventGenericHandler.cs`も読んだ。grep：`IntegrationEvent`、`Outbox`、`Inbox`、`InternalCommand`、`ProcessInbox`。
- eShop：`src/eShop.AppHost/AppHost.cs`、`IntegrationEventLogEF/{EventStateEnum.cs, Services/IntegrationEventLogService.cs（行1–60）}`、`EventBus/Abstractions/IEventBus.cs`、`EventBus/Extensions/EventBusBuilderExtensions.cs`（行20–40）、`EventBusRabbitMQ/RabbitMQEventBus.cs`（該当行）、`Ordering.API/Application/{IntegrationEvents/OrderingIntegrationEventService.cs, Behaviors/TransactionBehavior.cs}`、3つの`OrderStatusChangedToPaidIntegrationEvent.cs`、Ordering系の3つのcsproj、`IOrderRepository.cs`を読んだ。grep：`NetArchTest|ArchUnit`（0件）、`PublishedFailed`、`RetrieveEventLogsPendingToPublishAsync`、`routingKey`。
- microservices-demo：`protos/demo.proto`（service定義をgrep、行1–22）、`src/checkoutservice/{main.go（関数一覧、行230–286）, genproto.sh}`、`docs/purpose.md`、`docs/adding-new-microservice.md`（行1–40）を読み、protoのcopy 3つをdiffした。
- library：`README.md`（行82–107、229–308、501–550）、`ModularArchitectureTest.java`、`LendingHexagonalArchitectureTest.java`、`NoSpringInDomainLogicTest.java`、`FindAvailableBook.java`、`PlacingOnHold.java`（行1–60）、`Patrons.java`、`CreateAvailableBookOnInstanceAddedEventHandler.java`、`commons/events/{DomainEvents.java, publisher/StoreAndForwardDomainEventPublisher.java, publisher/DomainEventsConfig.java}`、`pom.xml`（行90–200）を読んだ。grep：`import io.pillopl.library.catalogue`、`import org.springframework`（application配下）、`ui`／`web`のpackage。
- spring-modulith：`src/docs/antora/modules/ROOT/pages/{verification.adoc（全文）, fundamentals.adoc（行1–30、117–330）, events.adoc（行1–11、47–56、128–140、198–290）, testing.adoc（行1–20、79–96）}`、`spring-modulith-core/.../ApplicationModules.java`（行430–500、605–630）、`.../ApplicationModule.java`（行1340–1430）、`spring-modulith-api/.../ApplicationModule.java`（行40–75）、`spring-modulith-example-full/.../ModularityTests.java`、`inventory/package-info.java`を読んだ。
- 読んでいないもの：各repoのCI設定、MMDDDの残りのADRと各moduleのApplication／Domainの本体、eShopのBasket、Catalog、Webhooks、PaymentProcessor、OrderProcessorの本体、microservices-demoのcheckout以外のservice本体とhelm／kustomize、spring-modulithのevents実装のコード（docsのみ読んだ）とmoments、observability。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：全観察は外部OSSの固定commitを一次資料として読んだものである。O01〜O03、O07はADRの記述と実装の両方に由来する。ADRと実装が食い違う箇所（module数、LayersTestsの名前と本体）を、観察としてどう区別して登録するかは未決である。
- scope：各観察がD01（system全体のstyle、process境界）とD02（application内の層、module）のどちらに属するかは決めていない。O01、O10、O11はD01寄り、O02〜O06はD02寄り、O07〜O09は両方にまたがると見えるが、判断していない。
- 評価根拠：どの観察もHELIXでの有効性を評価していない。外部repoでの採用は、HELIXでの成立を意味しない。O04のtestが合格しているか、O08の再送経路があるかなど、実行しなければ確かめられない点は未検証のまま残している。
- 版：引用はすべて上表の固定commit SHAに結び付けている。spring-modulithのdocsは「since 2.0／2.2」の版注記を持つ。版の扱い（どの版の機能として記録するか）は未決である。
- 状態：全11件を「未評価の候補素材」とする。HELIX-BRAINへの登録や採否はしていない。選定、推奨、優劣の結論は書いていない。
