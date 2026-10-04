# P03 分散データ整合性の観察（D06 Data / Database、D03 Backend）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| eventuate-tram/eventuate-tram-sagas | https://github.com/eventuate-tram/eventuate-tram-sagas | a7a99181b6668f3283b5920a5ff3bac415422eeb（master） | GitHub API上は NOASSERTION。`LICENSE.md` 冒頭はApache License 2.0の文言（SPDXは未判定のまま記録する） | false | 2026-10-04 | orchestration型sagaの実装と、補償・semantic lockを持つ一次資料 |
| debezium/debezium | https://github.com/debezium/debezium | 15bcfe1892b435a561eac9851fd1dd622617079f（main） | Apache-2.0 | false | 2026-10-04 | CDCで動くtransactional outboxのrelay（Outbox Event Router SMT） |
| AxonIQ/AxonFramework（旧 AxonFramework/AxonFramework から転送済み） | https://github.com/AxonIQ/AxonFramework | 4aae3b4c86603b913ad34fbc076ec7bb1c1dce41（main） | Apache-2.0 | false | 2026-10-04 | CQRS／event sourcingのframework。5.0で`Saga`クラスを廃止し、snapshotとevent versioningを再設計している |
| dotnet/eShop | https://github.com/dotnet/eShop | dc7ea499cd356924fb6689b3702964a5869dbae9（main） | MIT | false | 2026-10-04 | アプリ内のIntegrationEventLog（outbox）と、choreography型の注文フロー |
| pyeventsourcing/eventsourcing | https://github.com/pyeventsourcing/eventsourcing | 575d42c10a821828639b90178ed56703abe9c9f1（9.5） | BSD-3-Clause | false | 2026-10-04 | 読みmodelのtracking、snapshot、`class_version`によるupcastを持つ小さめの一次資料 |

## 観察
（すべて未評価の候補素材。HELIX-BRAINへの登録・採否は行っていない）

### P03-O01 アプリ内outbox：同一transactionへの書込みと、commit直後のin-process publish（eShop IntegrationEventLog）
- 出典：dotnet/eShop
  - `src/IntegrationEventLogEF/Services/IntegrationEventLogService.cs` 行19–70（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/IntegrationEventLogEF/Services/IntegrationEventLogService.cs#L19-L70）
  - `src/IntegrationEventLogEF/EventStateEnum.cs` 行3–9（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/IntegrationEventLogEF/EventStateEnum.cs#L3-L9）
  - `src/IntegrationEventLogEF/IntegrationEventLogEntry.cs` 行11–20（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/IntegrationEventLogEF/IntegrationEventLogEntry.cs#L11-L20）
  - `src/Ordering.API/Application/Behaviors/TransactionBehavior.cs` 行20–63（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.API/Application/Behaviors/TransactionBehavior.cs#L20-L63）
  - `src/Ordering.API/Application/IntegrationEvents/OrderingIntegrationEventService.cs` 行13–41（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.API/Application/IntegrationEvents/OrderingIntegrationEventService.cs#L13-L41）
  - `src/Catalog.API/IntegrationEvents/CatalogIntegrationEventService.cs` 行11–40（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Catalog.API/IntegrationEvents/CatalogIntegrationEventService.cs#L11-L40）
  - issue #159 https://github.com/dotnet/eShop/issues/159
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `IntegrationEventLogEntry`は、event ID、型名、JSON本文、状態、送信回数、`TransactionId`を持つ。
  - `SaveEventAsync`は、業務の`DbContext`と同じDB transactionを`UseTransaction`で共有してlogを書く。
  - Ordering側では、MediatRのpipeline `TransactionBehavior`がcommandごとにtransactionを開く。commit後に、`PublishEventsThroughEventBusAsync(transactionId)`がそのtransactionで書いた`NotPublished`の行を`CreationTime`順に読み、`InProgress`→publish→`Published`と状態を進める。例外が起きた行は`PublishedFailed`にする。
  - Catalog側は`ResilientTransaction`の中で業務更新とlog書込みを1つのtransactionにまとめ、publishは別メソッド`PublishThroughEventBusAsync`で行う。
  - issue #159では、cancel用eventが「EventBusに送られていない」と報告された。維持者は「outboxに保存され、commit後に`TransactionBehavior`がpublishする」と回答して閉じた。
- 解いている問題と前提：業務DBの更新と「eventを出すという事実」を同じlocal transactionにまとめる（Catalog側のコメント行36に「local transactionで原子性を得る」とある）。前提は単一のRDB（EF Core）、同じprocessでのpublish、RabbitMQのevent bus。
- 必要な入力：event型の解決方法（entry assemblyにある型のうち、名前が`IntegrationEvent`で終わるものを対象にする。行13–16）、transaction IDの採番、状態遷移の定義。
- trade-off・失敗の仕方：
  - `PublishedFailed`や、commit後にprocessが落ちて残った`NotPublished`の行を後から再送する経路は、固定commitのsrc全体を`PublishedFailed`、`RetrieveEventLogsPendingToPublishAsync`、`TimesSent`でgrepしても見つからなかった。publishの起点は、そのtransaction IDを持つ直後の呼出しだけである。
  - `TimesSent`は加算されるが、加算値を読む利用者はmigration以外に見つからなかった。
  - `OrderingIntegrationEventService.cs` 行23–31（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.API/Application/IntegrationEvents/OrderingIntegrationEventService.cs#L23-L31）では、`InProgress`への更新 → `PublishAsync` → `Published`への更新（行23–25）を一つのtryに入れ、どこかで例外が出ればcatchで`MarkEventAsFailedAsync`を呼ぶ（行27–31）。したがって、publish自体の失敗も、publish成功後の`Published`更新の失敗も、失敗状態への更新が成功すれば`PublishedFailed`になる（後者はbrokerへ送信済みなのに失敗と記録される）。行が`InProgress`のまま残るのは、途中でprocessが止まった場合か、`MarkEventAsFailedAsync`自体が失敗した場合である。どの場合も、上で述べたとおり後から再送する経路はsrc内で確認できていない。そのため、二重送信や欠落が実際に起きるかどうかは再送経路の有無に依存し、この範囲では判定していない。
- 反例・適用しない場合：DebeziumはrelayをDBの外（CDC）に出している（O02）。pyeventsourcingは、下流がupstreamのnotification logをpullするため、outboxの表を別に持たない（O09）。
- 互換・非互換：O03（受信側の冪等化）と組で読む必要がある。O02とは、relayの位置が異なる別解である。
- 限界：sample applicationであり、運用規模の前提は書かれていない。状態値・型名の規約は持ち込まない。

### P03-O02 CDCで動くoutbox relay：insertだけを行うoutbox表と、行からmessageへの写像（Debezium Outbox Event Router）
- 出典：debezium/debezium
  - `documentation/modules/ROOT/pages/transformations/outbox-event-router.adoc` 行17–27、118–180（https://github.com/debezium/debezium/blob/15bcfe1892b435a561eac9851fd1dd622617079f/documentation/modules/ROOT/pages/transformations/outbox-event-router.adoc#L17-L27 、 https://github.com/debezium/debezium/blob/15bcfe1892b435a561eac9851fd1dd622617079f/documentation/modules/ROOT/pages/transformations/outbox-event-router.adoc#L118-L180）
  - `debezium-connect-plugins/src/main/java/io/debezium/transforms/outbox/EventRouterDelegate.java` 行96–122、215–247、305–316（https://github.com/debezium/debezium/blob/15bcfe1892b435a561eac9851fd1dd622617079f/debezium-connect-plugins/src/main/java/io/debezium/transforms/outbox/EventRouterDelegate.java#L96-L122 、 #L215-L247 、 #L305-L316）
  - `debezium-connect-plugins/src/main/java/io/debezium/transforms/outbox/EventRouterConfigDefinition.java` 行230–237、298–303（https://github.com/debezium/debezium/blob/15bcfe1892b435a561eac9851fd1dd622617079f/debezium-connect-plugins/src/main/java/io/debezium/transforms/outbox/EventRouterConfigDefinition.java#L230-L237 、 #L298-L303）
  - `documentation/modules/ROOT/pages/integrations/outbox.adoc` 行391–397（https://github.com/debezium/debezium/blob/15bcfe1892b435a561eac9851fd1dd622617079f/documentation/modules/ROOT/pages/integrations/outbox.adoc#L391-L397）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - アプリはoutbox表へinsertするだけである。connectorがその変更をCDCで読み、SMT `EventRouter`（実装は`EventRouterDelegate`）が1行を1つのKafka messageに写す。
  - 写し方：`aggregatetype`でtopicを決め、`aggregateid`をmessage keyにする（partition内の順序のため）。`id`はheaderに入れ、文書は重複除去に使えると説明している。`payload`がmessageの値になる。
  - tombstoneと、CDC envelopeに合わないheartbeatやschema変更は素通しまたは無視する。DELETEは無視する。UPDATEは「想定外」とし、`table.op.invalid.behavior`の設定に従って警告・errorログ・停止のどれかにする。
  - 列`table.field.event.schema.version`を指定すると、行ごとのschema版で値のschemaを選ぶ（`EventRouterDelegate.java` 行184–187）。
  - Quarkus拡張の文書には、insert直後に行を消してもCDCのemitには影響しないという選択肢がある（outbox.adoc 行391–395。文書上のbooleanの既定値は持ち込まない）。
- 解いている問題と前提：サービス内部の状態と、他サービスが読むeventとの不一致を避ける（adoc 行17）。前提はKafka Connect、CDCが可能なDB、行の構造が同じoutbox表（行27）。MongoDBは別SMTを使う（行37–39）。
- 必要な入力：outbox表の列と、その意味の対応（id、key、routing、payload、追加列の配置）。順序を守る単位（keyにする列）。UPDATEを受けたときの振る舞い。payloadの直列化形式（JSONかAvroか）。
- trade-off・失敗の仕方：
  - 表をappend-onlyとして扱う前提がコードに出ている。UPDATEは既定では警告して捨てるので、アプリが行を更新すると黙って届かない構成になりうる。
  - 必須の列がなければ`ConnectException`で止まる（`EventRouterDelegate.java` 行147、157）。
  - 追加列が欠けたときの扱いは、設定で例外かskipを選ぶ（ConfigDefinition 行295–296）。
  - 重複配信を前提に、消費側でidによる重複除去を行うことは文書で「例えば」として示されるだけで、SMTは保証しない。
- 反例・適用しない場合：eShop（O01）はrelayをアプリprocess内に置き、状態列を更新する。この更新はDebeziumの前提（UPDATEは想定外）と正反対である。
- 互換・非互換：O03・O09（受信側の重複除去）を前提にする。O01とは表の使い方が非互換（状態更新型か、insertのみか）。
- 限界：Quarkus拡張の実装は別repository（debezium-quarkus）に移っており、本commitではREADMEだけを確認した。Kafka固有のpartition意味論は持ち込まない。

### P03-O03 受信側の冪等化：request IDの記録表（eShop IdentifiedCommand／RequestManager）
- 出典：dotnet/eShop
  - `src/Ordering.API/Application/Commands/IdentifiedCommandHandler.cs` 行3–48（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.API/Application/Commands/IdentifiedCommandHandler.cs#L3-L48）
  - `src/Ordering.Infrastructure/Idempotency/RequestManager.cs` 行13–37（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.Infrastructure/Idempotency/RequestManager.cs#L13-L37）
  - `src/Ordering.API/Application/IntegrationEvents/EventHandling/OrderStockRejectedIntegrationEventHandler.cs` 行6–25（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.API/Application/IntegrationEvents/EventHandling/OrderStockRejectedIntegrationEventHandler.cs#L6-L25）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `IdentifiedCommand<T,R>`はcommandをclient由来のGUIDで包む。handlerは`ClientRequest`表にそのIDがあれば、重複用の結果（`CreateResultForDuplicateRequest`）を返す。なければ行を書いてから内側のcommandを送る。
  - `RequestManager.CreateRequestForCommandAsync`は存在を確認してから書く。重複時には例外を投げる。
- 解いている問題と前提：clientの再送による二重処理を避ける。存在確認と書込みの間の競合は、表の主キー制約に依存していると読める（明示のlockはない）。
- 必要な入力：request IDの発行元（呼出し側）、重複時に返す値。
- trade-off・失敗の仕方：
  - integration event handlerの一つ（`OrderStockRejectedIntegrationEventHandler`）は、`IdentifiedCommand`で包まずに素のcommandを`mediator.Send`している（行15、24）。この経路では、重複配信への防御はaggregateの状態ガード（O04）に頼る形になる。
  - integration eventを受けて状態を変える別のcommand handler（`SetStockConfirmedOrderStatusCommandHandler.cs`、`SetStockRejectedOrderStatusCommandHandler.cs`、`SetPaidOrderStatusCommandHandler.cs` の各行22）には、作業時間を模したdelayがある（具体値は持ち込まない）。`IdentifiedCommandHandler.cs`にはない。
- 反例・適用しない場合：pyeventsourcingは、別表のrequest IDではなく、処理位置（tracking）を一意制約付きで書き、同じtransactionに入れる（O09）。
- 互換・非互換：O01、O02の後段に置くことが前提。O04と重ねて使っている。
- 限界：IDの寿命や表の掃除は確認していない。

### P03-O04 choreography型の流れ：状態遷移ガードを補償として使う（eShop Order aggregate）
- 出典：dotnet/eShop
  - `src/Ordering.Domain/AggregatesModel/OrderAggregate/Order.cs` 行99–168（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.Domain/AggregatesModel/OrderAggregate/Order.cs#L99-L168）
  - `src/Ordering.Infrastructure/OrderingContext.cs` 行47–61（https://github.com/dotnet/eShop/blob/dc7ea499cd356924fb6689b3702964a5869dbae9/src/Ordering.Infrastructure/OrderingContext.cs#L47-L61）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 中央のorchestratorはない。Catalog、Paymentなどからのintegration eventを受けたhandlerが、Orderの状態遷移メソッドを呼ぶ。
  - 各メソッドは、遷移元の状態が期待どおりのときだけ遷移する。在庫拒否時の`SetCancelledStatusWhenStockIsRejected`は、`AwaitingValidation`のときだけ`Cancelled`にする。`SetCancelledStatus`は、`Paid`や`Shipped`からの取消しを例外にする。
  - `SaveEntitiesAsync`はdomain eventをcommitの前にdispatchする。コメントには、commit前とcommit後の2案と、commit後ならeventual consistencyと補償が必要になることが書かれている（行49–54）。
- 解いている問題と前提：参加サービスが互いを知らずに注文の流れを進め、失敗を「取消し状態への遷移」で表す。前提は、1つのaggregateが流れの状態を持つこと。
- 必要な入力：状態の集合、許される遷移、各eventと遷移の対応。
- trade-off・失敗の仕方：遷移元が合わないeventは、在庫拒否の経路では何もせずに終わる（例外にならない）。重複や順序の入替わりは吸収されるが、想定外の状態で届いたeventは痕跡を残さない（観察した事実）。流れ全体はコードを横断しないと見えない。この点はAxon文書がvertical slicesの欠点として「単一の場所に流れが書かれない」と述べていることと同型である（O07）。
- 反例・適用しない場合：Eventuate（O05）は、流れを1つのsaga定義に集め、補償を逆順に自動で実行する。
- 互換・非互換：O01（eventの搬送）とO03（冪等化）を前提にする。
- 限界：eShopはsampleであり、取消し機能もUIの一部にしかない（issue #159のやり取り）。

### P03-O05 orchestration型saga：step列、実行位置、補償方向フラグ（Eventuate Tram Sagas）
- 出典：eventuate-tram/eventuate-tram-sagas
  - `eventuate-tram-sagas-orchestration-simple-dsl/src/main/java/io/eventuate/tram/sagas/simpledsl/AbstractSimpleSagaDefinition.java` 行29–63（https://github.com/eventuate-tram/eventuate-tram-sagas/blob/a7a99181b6668f3283b5920a5ff3bac415422eeb/eventuate-tram-sagas-orchestration-simple-dsl/src/main/java/io/eventuate/tram/sagas/simpledsl/AbstractSimpleSagaDefinition.java#L29-L63）
  - `.../simpledsl/SagaExecutionState.java` 行5–52（https://github.com/eventuate-tram/eventuate-tram-sagas/blob/a7a99181b6668f3283b5920a5ff3bac415422eeb/eventuate-tram-sagas-orchestration-simple-dsl/src/main/java/io/eventuate/tram/sagas/simpledsl/SagaExecutionState.java#L5-L52）
  - `eventuate-tram-sagas-orchestration/src/main/java/io/eventuate/tram/sagas/orchestration/SagaManagerImpl.java` 行77–125、161–231（https://github.com/eventuate-tram/eventuate-tram-sagas/blob/a7a99181b6668f3283b5920a5ff3bac415422eeb/eventuate-tram-sagas-orchestration/src/main/java/io/eventuate/tram/sagas/orchestration/SagaManagerImpl.java#L77-L125 、 #L161-L231）
  - `orders-and-customers/.../sagas/createorder/CreateOrderSaga.java` 行24–31（https://github.com/eventuate-tram/eventuate-tram-sagas/blob/a7a99181b6668f3283b5920a5ff3bac415422eeb/orders-and-customers/src/main/java/io/eventuate/examples/tram/sagas/ordersandcustomers/orders/sagas/createorder/CreateOrderSaga.java#L24-L31）
  - `orders-and-customers/.../orders/service/OrderService.java` 行35–44（https://github.com/eventuate-tram/eventuate-tram-sagas/blob/a7a99181b6668f3283b5920a5ff3bac415422eeb/orders-and-customers/src/main/java/io/eventuate/examples/tram/sagas/ordersandcustomers/orders/service/OrderService.java#L35-L44）
  - `README.adoc` 行21–33（https://github.com/eventuate-tram/eventuate-tram-sagas/blob/a7a99181b6668f3283b5920a5ff3bac415422eeb/README.adoc#L21-L33）
  - issue #75、#80、#74、#72、#70（https://github.com/eventuate-tram/eventuate-tram-sagas/issues/75 ほか。いずれもOPEN）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - saga定義は`step()`の列である。各stepは、前進の動作（participantへのcommandまたはlocal処理）、補償、またはその両方を持つ。例では第1stepが補償だけを持つ（注文の却下）。
  - 実行状態`SagaExecutionState`は「現在のstep番号＋補償中か」の組である。`nextStepToExecute`は、補償中なら逆向きに、該当動作を持たないstepを飛ばして進む。
  - replyが失敗なら`startCompensating`へ切り替える。補償中に失敗replyが来たら、`handleFailedCompensatingTransaction`で「failedのend state」に落とす。
  - `SagaManagerImpl`は、saga instance（型、ID、状態名、直列化したsaga data、lockした資源の一覧）を`SagaInstanceRepository`に保存する。replyを受けるたびに、状態を読む→定義に渡す→commandを送る→保存する、を繰り返す。replyを待たないstep（local処理）は成功replyを模して連続処理する。
  - 開始は、業務transactionの中で`sagaInstanceFactory.create`を呼ぶ形である（OrderService）。
  - README 行33：基盤のEventuate Trambが「DB更新とmessage publishを原子的に行う」と述べている（transactional messagingは別repository）。
- 解いている問題と前提：サービスごとにDBを分け、分散transactionを使えない環境で、local transactionの列とその補償で整合を取る（README 行21–30）。前提はJDBC/JPA、Spring Boot/Micronaut、message broker、CDC。
- 必要な入力：stepの順序、各stepの補償、成功replyと失敗replyの判定、participantのchannel。
- trade-off・失敗の仕方：
  - 補償の失敗は、retryせず失敗終端にする。issue #75は、旧commitでこの扱いがreply処理を壊すことを指摘しており、現commitには`makeFailedEndState`がある。issueはOPENのままで、両者の対応関係は未確認。
  - 失敗時に補償ではなくretryしたいという要望は#80、participantのtimeoutは#74で、どちらもOPENである（現実装にtimeoutはない）。
  - 想定外の例外でsagaが詰まる報告（#72）、終了したinstanceの掃除方針の質問（#70）もOPENである。
- 反例・適用しない場合：eShop（O04）は中央の定義を持たない。Axon 5は`Saga`クラス自体をなくし、状態の置き場所を利用者が選ぶ（O07）。
- 互換・非互換：O06（semantic lock）とは同じsaga instanceを共有して連動する。O01／O02系のtransactional messagingを下に敷く。
- 限界：timeoutやretryの方針はこのrepoにない。具体的なstep数や構成は持ち込まない。

### P03-O06 saga間の分離：資源ごとのlock表と、待たせるmessageのstash（Eventuate SagaLockManager）
- 出典：eventuate-tram/eventuate-tram-sagas
  - `eventuate-tram-sagas-participant/src/main/java/io/eventuate/tram/sagas/participant/SagaCommandDispatcher.java` 行30–93（https://github.com/eventuate-tram/eventuate-tram-sagas/blob/a7a99181b6668f3283b5920a5ff3bac415422eeb/eventuate-tram-sagas-participant/src/main/java/io/eventuate/tram/sagas/participant/SagaCommandDispatcher.java#L30-L93）
  - `eventuate-tram-sagas-common/src/main/java/io/eventuate/tram/sagas/common/SagaLockManagerImpl.java` 行31–103（https://github.com/eventuate-tram/eventuate-tram-sagas/blob/a7a99181b6668f3283b5920a5ff3bac415422eeb/eventuate-tram-sagas-common/src/main/java/io/eventuate/tram/sagas/common/SagaLockManagerImpl.java#L31-L103）
  - `.../common/SagaLockManagerSql.java` 行20–24（https://github.com/eventuate-tram/eventuate-tram-sagas/blob/a7a99181b6668f3283b5920a5ff3bac415422eeb/eventuate-tram-sagas-common/src/main/java/io/eventuate/tram/sagas/common/SagaLockManagerSql.java#L20-L24）
  - `SagaManagerImpl.java` 行110–116、175–178
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - participantのcommand handlerは、pre-lockまたはreplyでlock対象（資源）を宣言できる。`claimLock`は`saga_lock_table`へのinsertを試みる。重複キーなら`SELECT ... FOR UPDATE`で所有者を確かめ、自分なら成功、他人なら失敗にする。
  - 失敗した場合、commandは`StashMessageRequiredException`で`saga_stash_table`へ退避する。replyには`REPLY_LOCKED`のheaderが付き、orchestratorはそれを「saga instanceが持つ資源」として覚える。
  - saga終了時に`SagaUnlockCommand`を送る。`SagaLockManagerImpl.unlock`（行71–103）は所有者を照合し、stashがあれば`ORDER BY message_id LIMIT 1`（`SagaLockManagerSql.java` 行23）で選んだ1件に所有を移して、そのmessageを返す。なければlock行を消す。ただし呼出し側の`SagaCommandDispatcher.java` 行35は`ifPresent(m -> super.messageHandler(message))`で、返されたstashのmessage `m`ではなく、unlockのmessage自体を渡している。stashしたmessageを再処理するという意図と、固定commitの実装の観察は一致しない。選択順はmessage_idの順で、作成時刻の順であるかは確認していない。
- 解いている問題と前提：sagaにはisolationがないので、同じ資源を触る別sagaの割込みを、業務上のlockで直列化する（semantic lock）。前提はRDBの一意制約と行lock。
- 必要な入力：lock対象の識別子の作り方（型＋ID。`LockTarget`）、どのcommandがlockを取るか。
- trade-off・失敗の仕方：
  - 所有者の不一致や不在では`RuntimeException`を投げる（unlock 行74–80）。
  - `addLockedHeader`には、空の場合が未対応であることを示すTODOコメントがある（Dispatcher 行100–101）。
  - sagaが終端に達しなければlockは解けない。ほかの経路でlockを解放する処理は、この範囲に見当たらない（#72の「詰まる」報告との関係は未確認）。
- 反例・適用しない場合：eShopはlockを持たず、状態ガードで後着を無効化する（O04）。Axon文書は、長く続く処理ではlockを保持できないことをsagaの前提として書いている（O07）。
- 互換・非互換：O05に付随する。O04とは、分離の取り方が別解である。
- 限界：deadlockの検出、lockの寿命、監視は確認していない。

### P03-O07 「Sagaクラスなし」の分解：状態の置き場所・相関・開始と終了を個別に選ぶ（Axon Framework 5 saga-guide）
- 出典：AxonIQ/AxonFramework
  - `docs/saga-guide/modules/ROOT/pages/index.adoc` 行6–14、29–47、49–73（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/docs/saga-guide/modules/ROOT/pages/index.adoc#L6-L73）
  - `.../choosing-an-approach.adoc` 行46–104（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/docs/saga-guide/modules/ROOT/pages/choosing-an-approach.adoc#L46-L104）
  - `.../state-in-a-repository.adoc` 行100–107（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/docs/saga-guide/modules/ROOT/pages/state-in-a-repository.adoc#L100-L107）
  - `.../state-from-process-events.adoc` 行92–103（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/docs/saga-guide/modules/ROOT/pages/state-from-process-events.adoc#L92-L103）
  - `.../vertical-slices.adoc` 行141–147（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/docs/saga-guide/modules/ROOT/pages/vertical-slices.adoc#L141-L147）
  - `.../deadlines.adoc` 行140–151（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/docs/saga-guide/modules/ROOT/pages/deadlines.adoc#L140-L151）
  - 信頼性ラベル：primary（公式repo内の文書）。本文確認：済
- 何をしているか：
  - 5.0.0以降は`Saga`クラスを持たない（index 行29）。processを次の3つの決定に分ける。
    - 状態をどこに置くか：repositoryの表、context内のevent、process自身のevent、または置かない。
    - 受信eventをどう相関させるか：保存した対応表、tag、または計算で求める値。
    - 開始と終了を何で表すか。
  - 補償は「rollbackではなくprocessの別step」と定義している（index 行11–14）。vertical slicesでは「却下されたら支払を取り消す」を独立したsliceとして明示しないと、未処理が残ると書く（vertical-slices 行141–147）。
  - 状態の置き場所の比較表では、event storeの「context」（順序が保たれる単位）を跨げるかを決め手にしている（choosing 行78–81、index 行59–61）。
  - 行を消して終える方式が安全なのは、送るcommandがすべて冪等な場合に限る。そうでなければtombstone行を残すと書く（state-in-a-repository 行100–106）。
  - process eventを追記する方式では、二重追記を防ぐのはtransactionではなく、sourceしたentityのappend条件だと明記している。何もsourceせずに追記すると、楽観的同時実行制御がないまま黙って追記されると警告している（state-from-process-events 行92–103）。
- 解いている問題と前提：秒から週の単位で続き、所有者が複数ある処理ではlockを持てず、全体をrollbackできない（index 行6–9）。前提はAxonのevent store context（Axon Server）と、event handler／command handlerという部品。
- 必要な入力：処理が過去に依存するか、event store contextを跨ぐか、相関値を計算で導けるか、送るcommandが冪等か。
- trade-off・失敗の仕方：
  - 各方式のcostを表に明記している（choosing 行87–103）。repository方式は1stepで2つの作用があり、command失敗時に書込みをrollbackする必要がある。context event方式は、eventを出さないstepの痕跡が残らない。
  - pollingでdeadlineを処理する方式では、全instanceで掃引が走る、replayで過去の未決が一斉に期限切れに見える、という注意点を挙げ、受信側の冪等性に強く依存すると書く（deadlines 行140–151。具体の時間例は持ち込まない）。
  - workflows（preview、別licence）を第一推奨とする記述がある（choosing 行52–56）。これは文書の主張として記録するにとどめ、評価しない。
- 反例・適用しない場合：Eventuate（O05）は、状態の形（step番号＋補償フラグ）をframeworkが決める。
- 互換・非互換：O08（streaming processorの再配信）を前提にした冪等性の議論である。O05の「一体型saga」とは設計方針が対立する。
- 限界：文書は自社製品（Axon Server、Axoniq Platform）の存在を前提に書かれている。製品名に依存する選択肢は持ち込まない。

### P03-O08 読みmodelの更新：token・segment・sequencing policy・replay（Axon Streaming Event Processor）
- 出典：AxonIQ/AxonFramework
  - `docs/reference-guide/modules/events/pages/event-processors/streaming.adoc` 行200–258、703–716、1040–1049、1094–1101（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/docs/reference-guide/modules/events/pages/event-processors/streaming.adoc#L200-L258 、 #L703-L716 、 #L1040-L1049 、 #L1094-L1101）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - processorはsegmentごとに`TrackingToken`を持ち、claimしたsegmentのeventを順に処理する。
  - handlerの作業とtokenの更新は同じtransactionで行う（行233–234）。
  - `SequencingPolicy`が返す識別子が同じeventは順に処理し、異なれば並列に処理してよい。既定ではaggregate単位で、aggregate情報がなければ全体を逐次にする（行709–714）。
  - replayはtokenを巻き戻して行う。全segmentのclaimが要るので、processorを停止してから`resetTokens`する。`@ResetHandler`、`@DisallowReplay`、`ReplayStatus`で、handlerごとにreplay時の振る舞いを分ける。
  - ただし固定commitの文書には、replayは5.0では利用できず5.1で再導入予定という警告がある（行1043–1049）。
- 解いている問題と前提：書込み側と非同期に、順序を保ちながら並列に読みmodelを更新し、作り直せるようにする。
- 必要な入力：sequencing policy（順序を守る単位）、segment数、token store、失敗時のerror handler（再throwか、dead-letterか）。
- trade-off・失敗の仕方：
  - 文書が失敗モードを具体的に列挙している。1つのsegmentは無関係な多数のsequenceを含む。abortするとtokenが進まず、同じeventで止まり、同じsegmentの全sequenceが待たされる（行212–223）。
  - 既定の`PropagatingErrorHandler`は無期限にretryする。これは読みmodelを壊さないための意図された挙動だと説明している（行231–232）。
  - ほかにtransactionを壊すDB例外、token storeに届かない、遅いhandler、claimの奪い合いを挙げる（行233–239）。
  - 緩和策として、handlerの冪等化、segment単位の監視、dead-letter queueによる退避を挙げる（行249–258）。
- 反例・適用しない場合：pyeventsourcingはsegmentを持たず、アプリ単位の単一位置で追従する（O09）。
- 互換・非互換：O07の冪等性の前提を供給する。O09とは、位置記録の粒度が異なる別解である。
- 限界：segment数やclaimのtimeoutの値は持ち込まない。replayは対象版では文書上「未提供」である。

### P03-O09 読みmodelのtrackingを同じtransactionで一意に記録し、書込み直後の読みを待つ（pyeventsourcing projection）
- 出典：pyeventsourcing/eventsourcing
  - `docs/topics/projection.rst` 行8–21、333–343（https://github.com/pyeventsourcing/eventsourcing/blob/575d42c10a821828639b90178ed56703abe9c9f1/docs/topics/projection.rst#L8-L21 、 #L333-L343）
  - `eventsourcing/persistence.py` 行648–716（https://github.com/pyeventsourcing/eventsourcing/blob/575d42c10a821828639b90178ed56703abe9c9f1/eventsourcing/persistence.py#L648-L716）
  - `eventsourcing/projection.py` 行205–245、356–413（https://github.com/pyeventsourcing/eventsourcing/blob/575d42c10a821828639b90178ed56703abe9c9f1/eventsourcing/projection.py#L205-L245 、 #L356-L413）
  - `eventsourcing/postgres.py` 行878–937、1027–1049（https://github.com/pyeventsourcing/eventsourcing/blob/575d42c10a821828639b90178ed56703abe9c9f1/eventsourcing/postgres.py#L878-L937 、 #L1027-L1049）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `TrackingRecorder`は、処理した位置（application名＋notification ID）を、view更新と原子的に記録する抽象である。
  - 文書（行16–21）は、次の4条件がそろえばviewが「信頼できる決定的関数」になると述べる。
    1. 順に処理する
    2. trackingをview更新と原子的に書く
    3. trackingを一意に制約する
    4. 最後のtrackingから再開する
  - Postgres実装には2つの方式がある。単一行方式は、application名を主キーにし、より大きい位置のときだけ更新する。戻り行がなければ`IntegrityError`にする。旧来の複数行方式は、（application名, notification ID）を主キーにする。
  - `EventSourcedProjection.process_event`は、policyが`ProcessingEvent`に集めた新しいeventを、trackingと一緒に記録する。`save`を直接呼ばないよう、docstringで指示している（行236–244）。下流アプリの状態更新と「上流のどこまで処理したか」が1つの記録になるので、outbox表を別に持たない構成になっている。
  - UIの側は、`save`が返すnotification IDを`ProjectionRunner.wait`に渡し、viewがその位置に達するまで待てる（read-your-writes）。待ち方はbackoff付きのpolling。timeoutの場合は`TimeoutError`、runnerのthreadがerrorになった場合はそのerrorを再送出する。
- 解いている問題と前提：非同期のviewはeventually consistentなので、利用者に古い表示を見せる危険がある（文書 行337–343）。前提は、全体順序を持つapplication sequence（notification log）とpull型の購読。
- 必要な入力：application名（trackingの鍵）、viewのstorage（trackingと同じtransactionに入れられること）、待機の上限。
- trade-off・失敗の仕方：
  - 単一行方式では、位置が後退または同じtrackingは`IntegrityError`になる。これが重複処理の検出になる。
  - 処理loopで例外が起きるとrunnerは停止状態になり、次の`run_forever`または`wait`で例外が再送出される（projection.py 行365–393、406–410）。skipや退避の仕組みは、この範囲に見当たらない。
  - backoffの初期値・上限・既定のtimeoutは持ち込まない。
- 反例・適用しない場合：Axon（O08）は、並列化のためにsegmentとsequencing policyを持つ。eShopのOrdering queryは、書込み側と同じ`OrderingContext`を直接読み、別の読みmodelを持たない（`src/Ordering.API/Application/Queries/OrderQueries.cs` 行3–10）。
- 互換・非互換：O02やO01の重複配信を受け止める側の別解である。O03（request ID表）とは目的が近く、鍵が異なる（入口のIDか、上流の位置か）。
- 限界：全体順序を持つ単一sequenceを前提にしており、複数sourceの合流は別設計になる。

### P03-O10 snapshotはcacheであり、版が合わなければ捨てて全件から再構成する（Axon Framework 5）
- 出典：AxonIQ/AxonFramework
  - `docs/reference-guide/modules/tuning/pages/snapshotting.adoc` 行36–50、82–95、236–252（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/docs/reference-guide/modules/tuning/pages/snapshotting.adoc#L36-L50 、 #L82-L95 、 #L236-L252）
  - `eventsourcing/src/main/java/org/axonframework/eventsourcing/handler/SnapshottingEntityLifecycleHandler.java` 行180–239（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/eventsourcing/src/main/java/org/axonframework/eventsourcing/handler/SnapshottingEntityLifecycleHandler.java#L180-L239）
  - `docs/reference-guide/modules/events/pages/event-versioning.adoc` 行9–22、59–76（https://github.com/AxonIQ/AxonFramework/blob/4aae3b4c86603b913ad34fbc076ec7bb1c1dce41/docs/reference-guide/modules/events/pages/event-versioning.adoc#L9-L76）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 読込み時にsnapshotがあれば、そこから初期化し、その位置より後のeventを適用する。
  - `SnapshotPolicy`は、eventごとの判定と、全体の評価（`EvolutionResult`：適用件数、sourcing時間）の両方で作成を決める。
  - `Snapshot`は位置・版・payload・時刻・metadataを持つ。既定では1 entityにつき1件だけ保持し、上書きする。
  - 実装では、snapshotの版が現行の型の版と一致しないか、変換に失敗すると、内部例外`SnapshotIncompatibleException`を投げる。これを捕まえて、streamの先頭から全件を再構成する。コメントには「版の扱いが対応するまで無視する」とある（行225）。
  - snapshotの保存失敗は警告ログだけで、呼出し側には伝えない（行205–210）。
  - eventのschema進化は、主に「処理時のpayload変換」で吸収する。保存形式はそのまま残し、handlerが望む型にその場で変換する。構造的な変更（分割・改名・破棄）は、商用側のevent transformation（upcasterの後継）に回している（event-versioning 行70–76）。
- 解いている問題と前提：snapshotは正しさに必要ないcacheと位置付け、互換性のないsnapshotが正しさを損なわないようにする（行238–246）。
- 必要な入力：entityの版（`MessageType`の解決）、snapshot policy、converter。
- trade-off・失敗の仕方：版を上げると、既存snapshotはすべて無効になり、次の読込みが全件再構成になる（文書と実装から読める挙動）。`SnapshotStore`は文書上「暫定API」である（行85）。
- 反例・適用しない場合：pyeventsourcing（O11）は、snapshotを捨てずにupcastで現行版へ持ち上げる。
- 互換・非互換：O08（replay）とは独立している。O11とは、版不一致時の方針が反対である。
- 限界：snapshotを作る閾値は持ち込まない。商用機能に依存する部分は観察対象外とする。

### P03-O11 `class_version`とupcast連鎖：eventとsnapshotを同じ規則で持ち上げる（pyeventsourcing）
- 出典：pyeventsourcing/eventsourcing
  - `eventsourcing/domain.py` 行1835–1874（https://github.com/pyeventsourcing/eventsourcing/blob/575d42c10a821828639b90178ed56703abe9c9f1/eventsourcing/domain.py#L1835-L1874）
  - `docs/topics/domain.rst` 行2779–2794（https://github.com/pyeventsourcing/eventsourcing/blob/575d42c10a821828639b90178ed56703abe9c9f1/docs/topics/domain.rst#L2779-L2794）
  - `eventsourcing/application.py` 行760–775、792–857（https://github.com/pyeventsourcing/eventsourcing/blob/575d42c10a821828639b90178ed56703abe9c9f1/eventsourcing/application.py#L760-L775 、 #L792-L857）
  - `docs/topics/application.rst` 行1249–1288（https://github.com/pyeventsourcing/eventsourcing/blob/575d42c10a821828639b90178ed56703abe9c9f1/docs/topics/application.rst#L1249-L1288）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - aggregateとdomain eventのクラスに`class_version`を付ける。保存された状態の版から現行の版まで、`upcast_vX_vY`という静的メソッドを順に呼んで持ち上げる。
  - snapshotは`Snapshot.take`でaggregateの`vars`を写し、版が1より大きければ版も記録する。`mutate`で同じupcast連鎖を通して復元する。
  - 自動snapshotは`snapshotting_intervals`（aggregate型→間隔）で設定し、`save`の中で記録の直後に同期的に作る。
  - 文書の例では、同じaggregateに対して複数のsnapshotが並んで残る（application.rst 行1280–1288）。
  - snapshotを作るときのprojector関数がなく、eventが`CanMutateProtocol`も満たさない場合は`ProgrammingError`にする。
- 解いている問題と前提：deploy後にクラスの形を変えても、保存済みのeventとsnapshotを読めるようにする（domain.rst 行2782–2794）。「snapshotを使わないならaggregateにupcastは要らない」とも書いている。
- 必要な入力：版番号の付け方（単調増加）、隣接する版の間の変換、snapshotの間隔（値は持ち込まない）。
- trade-off・失敗の仕方：
  - upcastの欠落（`getattr`の失敗）は復元時の例外になる（domain.py 行1864–1865）。
  - snapshotの作成は`save`と同期しているので、書込みの経路に処理時間が加わる（コードの構造から読める範囲。性能の数値はない）。
- 反例・適用しない場合：Axon（O10）は、版不一致のsnapshotを捨てる。eventについては、処理時の型変換を主にしている。
- 互換・非互換：O09（tracking付きのprocess）でも`_take_snapshots`が呼ばれる（projection.py 行226）。O10とは非互換の方針である。
- 限界：Python内での型の解決（topic）を前提にしている。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| DB更新とevent送出の原子性（relay） | eShop：同じtransactionでlog行を書く。commit直後に同じprocessがpublishし、状態列を更新する（O01） | Debezium：insertだけのoutbox表をCDCが読み、SMTがmessageへ写す。UPDATEは想定外（O02） | relayをアプリ内に置けるか、CDC基盤があるか。表を状態機械にするか、append-onlyにするか |
| 〃（別解） | Eventuate：基盤のEventuate Tramが原子的なpublishを担う（README 行33。本体は別repo） | pyeventsourcing：下流がupstreamのnotification logをpullし、処理結果とtrackingを1回で記録する（O09） | push型のbrokerを使うか、pull型の購読か |
| 重複配信への防御 | eShop：client request IDの表と、aggregateの状態ガード（O03、O04） | pyeventsourcing：上流位置のtrackingを一意制約付きで原子的に記録する（O09）。Axon：handlerの冪等化を推奨し、tokenはhandlerと同じtransactionで書く（O08） | 鍵を入口のIDにするか、上流sequenceの位置にするか |
| sagaの流れの持ち方 | Eventuate：1つのstep列の定義と、frameworkが持つ実行状態（O05） | eShop：中央なし。eventごとの状態遷移（O04）。Axon 5：`Saga`型なしで、状態・相関・開始終了を個別に選ぶ（O07） | 流れを1か所で読めることを優先するか、変更の局所性・transactionの小ささを優先するか |
| 補償が失敗したとき | Eventuate：failedのend stateに落とし、retryしない（O05。#75、#80がOPEN） | Axon文書：補償を独立したslice／stepとして明示し、冪等性に依存する（O07） | frameworkが補償を自動で起動するか、利用者のhandlerとして書くか |
| saga間の干渉 | Eventuate：資源lock表とstash（O06） | eShop：状態ガードで後着を無効化する（O04） | 業務上の排他が必要か、状態遷移で足りるか |
| 読みmodelの順序と並列 | Axon：segment＋sequencing policy＋claim（O08） | pyeventsourcing：アプリ単位の単一位置。並列化の仕組みは観察範囲になし（O09） | 規模と並列度の前提 |
| 書込み直後の読み | pyeventsourcing：notification IDで`wait`する（O09） | eShop Ordering：同じDBから直接読む（別の読みmodelなし） | 読みmodelを分離しているか |
| snapshotの版不一致 | Axon：捨てて全件から再構成し、1件だけ保持する（O10） | pyeventsourcing：upcast連鎖で現行版へ持ち上げ、複数件残る（O11） | snapshotを純粋なcacheとみなすか、版の変換を書く負担を受けるか |
| eventのschema進化 | Axon：処理時のpayload変換。構造変更は別機構（O10） | pyeventsourcing：`class_version`＋`upcast_vX_vY`（O11）。Debezium：outbox行ごとのschema版列（O02） | 保存形式を不変に保つか、読込み時に正規化するか |

## 見つからなかったこと・gap
- eShopで、`PublishedFailed`や残った`NotPublished`のlogを再送するbackground処理は、src内のgrepでは見つからなかった。存在しないのか別の場所にあるのかは、src外（AppHost設定など）を読んでいないため断定できない。
- Debezium Quarkus outbox拡張の実装（insert直後の削除など）は別repository（debezium/debezium-quarkus）に移っており、未読。DebeziumのissueはGitHub外（Jira）で管理されているとみられ、trade-offのissue根拠は取得していない。
- Eventuateのtransactional messaging本体（eventuate-tram-core、CDC）は別repositoryで、未読。#75と現行コード（`handleFailedCompensatingTransaction`）の関係は未確認。
- Axon 5のreplayは、対象版の文書上「5.0では利用不可」である。dead-letter queueの実装と、商用のevent transformation、workflowsは読んでいない。
- Axonのsagaに関するGitHub issueは引いていない（文書のみ）。
- CQRSの読みmodelの遅延を「測る」仕組み（lag metricの実装）は、Axonの監視文書を見出しまで確認しただけで、本文は未読。
- choreography sagaにtimeoutを持たせる実装は、どのrepoにもなかった（EventuateはOPENの#74、Axonはdeadlinesの文書のみ）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 取得：5 repoについて`gh api repos/<o>/<r>`（default branch、license、archived）と`commits/<branch>`（SHA）。cloneは作業用の一時領域で、`--filter=blob:none`＋指定SHAのcheckout。eShopは同じ作業用の一時領域に同じSHAのcloneが既にあったので、それを読んだ。コード・build・testは一切実行していない。
- eShop：`src/IntegrationEventLogEF/**`、`Catalog.API/IntegrationEvents/CatalogIntegrationEventService.cs`、`Ordering.API/Application/{Behaviors/TransactionBehavior.cs, IntegrationEvents/OrderingIntegrationEventService.cs, Commands/IdentifiedCommandHandler.cs, Commands/SetStockRejectedOrderStatusCommandHandler.cs, IntegrationEvents/EventHandling/OrderStockRejectedIntegrationEventHandler.cs, Queries/OrderQueries.cs}`、`Ordering.Infrastructure/{OrderingContext.cs, Idempotency/RequestManager.cs}`、`Ordering.Domain/.../Order.cs`。grep語：`PublishedFailed`、`RetrieveEventLogsPendingToPublishAsync`、`TimesSent`、`IdentifiedCommand`、`RequestManager`。issue検索：「outbox OR IntegrationEventLog OR PublishedFailed」→#159を読んだ。未読：OrderProcessor／GracePeriodManagerService、PaymentProcessor、RabbitMQEventBusの本文。
- Debezium：`transformations/outbox-event-router.adoc`（行7–200、398–548の見出し）、`integrations/outbox.adoc`（行12–22、383–400）、`EventRouterDelegate.java`（行90–250、305–316）、`EventRouterConfigDefinition.java`（行225–305）。未読：`mongodb-outbox-event-router.adoc`、`MongoEventRouter.java`、`JsonSchemaData.java`、Oracle provider。
- Eventuate：`README.adoc` 行1–60、simple-dslの`AbstractSimpleSagaDefinition`、`SimpleSagaDefinition`、`SagaExecutionState`、orchestrationの`SagaManagerImpl`、participantの`SagaCommandDispatcher`、commonの`SagaLockManagerImpl`／`SagaLockManagerSql`、例の`CreateOrderSaga`／`OrderService`／`CustomerServiceProxy`。issueは全一覧を取得し、#75、#80、#74、#72、#70の本文を読んだ。未読：reactive系とmicronaut系のmodule、`docs/design/*.diagram`（図のみ）、`SagaInstanceRepositoryJdbc`。
- Axon：`docs/saga-guide/.../{index, choosing-an-approach, state-in-a-repository, state-from-process-events, vertical-slices, deadlines}.adoc`（該当範囲）、`events/pages/event-processors/streaming.adoc`（行1–60、174–304、703–726、1040–1110、1158–1194）、`tuning/pages/snapshotting.adoc`（行36–100、236–253）、`events/pages/event-versioning.adoc`（全77行）、`SnapshottingEntityLifecycleHandler.java` 行180–240、`Snapshot.java`（grepのみ）。grep語：`upcast`、`snapshot`、`ReplayToken`、`ResetHandler`。未読：`axon-5/*.md`の設計文書、`migration/paths/sagas.adoc`、dead-letter-queueの文書と実装、examples/saga-recipesのコード本体。
- pyeventsourcing：`docs/topics/projection.rst` 行8–30、330–345、`docs/topics/domain.rst` 行2779–2866、`docs/topics/application.rst` 行1150–1290、`eventsourcing/{domain.py 1830–1875, application.py 760–862, persistence.py 648–730, projection.py 186–252 / 356–415, postgres.py 878–945 / 1027–1050, system.py 100–150}`。未読：`dcb/`（Dynamic Consistency Boundary）、`sqlite.py`、`popo.py`の該当実装、`docs/topics/dcb.rst`。
- gh api／ghの呼出しは約30回。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：
  - 全観察はOSSの一次資料（コードと公式repo内の文書）による。
  - O07、O08、O10の一部は、ベンダーが自社製品の文書として書いたもので、推奨表現（workflowsの第一推奨など）を含む。由来を「公式文書（製品推奨を含む）」と区別するかは未決。
  - eShopとEventuateの例はsample applicationである。framework本体と同じ由来区分にするかは未決。
- scope：D06（outbox、tracking、snapshot、schema進化）とD03（saga、冪等化、lock）に跨る。1件の観察を両方のdomainに属させるか、主domainを1つに決めるかは未決。
- 評価根拠：すべて未評価。HELIXでの採否には、HELIXBRAIN-L2-026／027の経路（2.0）での評価が必要。外部の採用実績はHELIXでの成立を意味しない。
- 版：各観察は上表の固定commitに紐づく。Axonは5.x系で、replayが「5.0では利用不可」と書かれているなど、版によって機能の有無が変わる。版の印の付け方（repo commitか、製品のrelease版か）は未決。
- 状態：全件「未評価の候補素材」。Eventuate #75のように、OPENのissueと現行コードの関係が未確認のものは「根拠に未照合がある」という印が要るかが未決。
- ライセンス：Eventuateは、GitHub API上のSPDXがNOASSERTIONで、ファイル本文はApache-2.0の文言である。BRAINの由来属性にどちらを記録するかは未決。
