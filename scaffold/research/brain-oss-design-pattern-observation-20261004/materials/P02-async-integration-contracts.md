# P02 非同期連携の契約の観察（D05 API / Integration）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| cloudevents/spec | https://github.com/cloudevents/spec | 2ed3806b4ad8fda35813263cfefb2d73098b7655 | Apache-2.0 | false | 2026-10-04 | event envelopeの最小必須属性、重複判定キー、type／dataschemaによる版の扱い、順序（sequence）と廃止（deprecation）の拡張を仕様として定めている一次資料 |
| MassTransit/MassTransit | https://github.com/MassTransit/MassTransit | 5d6a89578fe9bc5ec17df0fb3d307a0b16cde2a7 | Apache-2.0 | false | 2026-10-04 | 実装側のenvelope、型URNで互換を判定する仕組み、inbox／outbox、即時retryとredeliveryの二段、error／skippedの振分けを一つのcodebaseで持つ |
| eventuate-tram/eventuate-tram-core | https://github.com/eventuate-tram/eventuate-tram-core | e472ed72b8635d0488a95d0892b8901c0158a7d1 | NOASSERTION（LICENSE.md本文はApache License 2.0の文言） | false | 2026-10-04 | transactional outbox、(consumer_id, message_id)の表による重複検出、集約IDをpartition keyにする作りが小さなコードで読める |
| asyncapi/spec | https://github.com/asyncapi/spec | 1dd65fd2c1ed13f06365c1e870c61cdc82d8a981 | Apache-2.0 | false | 2026-10-04 | 非同期APIの契約を記述する形式。send／receiveの向き、message schemaの形式、版の層の分け方を定めている |
| temporalio/temporal | https://github.com/temporalio/temporal | 92aff3961b3842a3573cac1a96c9d627b6e2cd0d | MIT | false | 2026-10-04 | activity retryをserver側の状態で持ち、retryの境界をworkflow historyと分ける作り。古い試行の応答をtokenで捨てる |

注：eventuate-tram-coreはGitHub APIでは`NOASSERTION`と判定される。`LICENSE.md`の冒頭はApache License 2.0の文言だったが、SPDX値としては`NOASSERTION`と記録する。

## 観察

### P02-O01 重複判定キーを `source`+`id` に置き、意味を一意性に限る envelope
- 出典：cloudevents/spec、`cloudevents/spec.md` 行286–318（https://github.com/cloudevents/spec/blob/2ed3806b4ad8fda35813263cfefb2d73098b7655/cloudevents/spec.md#L286-L318）、`cloudevents/primer.md` 行326–352（https://github.com/cloudevents/spec/blob/2ed3806b4ad8fda35813263cfefb2d73098b7655/cloudevents/primer.md#L326-L352）。信頼性ラベル：primary。本文確認：済
- 何をしているか：必須属性を`id`／`source`／`specversion`／`type`の4つに絞る。producerは「`source`+`id`」を個々のeventごとに一意にする義務を負う。ネットワークエラーなどで再送するときは同じ`id`を使ってよく、consumerは`source`と`id`が同じeventを重複とみなしてよい。1つのsourceに複数のproducerがいる場合は、producerどうしで協調して一意性を保つ。primerは、`id`を一意性の確認以外の目的に使うことを推奨していない。1つの出来事から複数のeventが生じるときは、それぞれに別の`id`を付け、関連付けはdata側で表す。
- 解いている問題と前提：仲介者が複数あり、再送されうる配送路で、受信側が重複を判定するための最小の取り決め。一意性をどう保証するかは仕様の範囲外としている（primer行333–336）。
- 必要な入力：sourceの命名規則、sourceとproducerの対応（1対1か多対1か）、再送時に`id`を引き継ぐ責務を誰が持つか。
- trade-off・失敗の仕方：一意性の保証はproducerの実装に任されているため、仕様は再送で`id`が変わる実装を検出できない。重複とみなす扱いもMAY（任意）であり、受信側に重複排除を義務付けていない。
- 反例・適用しない場合：MassTransitは`MessageId`に加えて`CorrelationId`／`ConversationId`／`InitiatorId`などをenvelopeに持つ（O04）。CloudEventsが`id`だけで一意性を表し、相関の表現をdataや拡張へ出しているのとは違う。
- 互換・非互換：O05（受信側の重複検出表）、O06（inbox）と組み合わせられる。CloudEventsの`id`は受信側の重複判定キーの候補になる。
- 限界：このrepoで成立していることはHELIXで成立することを意味しない。

### P02-O02 互換性の段階を `type` と `dataschema` の2属性に分けて表す
- 出典：cloudevents/spec、`cloudevents/primer.md` 行256–319（https://github.com/cloudevents/spec/blob/2ed3806b4ad8fda35813263cfefb2d73098b7655/cloudevents/primer.md#L256-L319）、`cloudevents/spec.md` 行353–370、422–431（https://github.com/cloudevents/spec/blob/2ed3806b4ad8fda35813263cfefb2d73098b7655/cloudevents/spec.md#L353-L370 、 #L422-L431）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`type`は、consumerがeventを識別する主な手段であり、互換のある変更では変えない。互換のない変更では`type`を変え、旧eventと新eventを一定期間（場合によっては無期限に）並行して出すよう勧めている。`dataschema`は情報的な扱いで、互換のある変更でも変えるのが一般的とされる。URIを固定して配信内容だけ更新する方法もあるが、URIをキーにschemaをcacheするconsumerには不便だと明記している。仕様自体は版付けの方式を強制せず、producerに委ねる。
- 解いている問題と前提：producerとconsumerが別々に進化する状況で、consumerが購読やfilterに使うキー（type）を、互換のない変更のときだけ動かす。
- 必要な入力：data content typeごとの「後方互換」の定義（primerは、その意味がcontent typeによって変わると書いている）。
- trade-off・失敗の仕方：旧typeと新typeの並行発行はproducerの負担になる。`dataschema`のURIを固定する方法はconsumer側のcacheと衝突する（primer行313–316）。
- 反例・適用しない場合：AsyncAPIは版を文書の`info.version`（アプリケーション単位）に持つ。message単位の版はproposal段階で未導入である（O08、asyncapi/spec#1068）。
- 互換・非互換：O03（廃止の通知）と組み合わせると、旧typeを並行発行して廃止するまでの期間を表せる。O04（MassTransitの型URN）は、typeに相当する識別子をCLR型から作る別の解き方である。
- 限界：版の数え方や並行期間の長さは持ち込まない。

### P02-O03 event typeの廃止を envelope 拡張で通知する
- 出典：cloudevents/spec、`cloudevents/extensions/deprecation.md` 行23–86（https://github.com/cloudevents/spec/blob/2ed3806b4ad8fda35813263cfefb2d73098b7655/cloudevents/extensions/deprecation.md#L23-L86）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`deprecated`（必ずtrue）、`deprecationfrom`、`deprecationsunset`、`deprecationmigration`（移行先文書のURI）を拡張属性としてevent自体に載せる。sunsetは延ばせるが短縮してはならない。廃止日を未来の日付で先に告知することは勧めていない。sunset後に届いたeventは処理をやめてよい、とconsumer側の扱いもSHOULDで定めている。
- 解いている問題と前提：consumerの一覧をproducerが把握していなくても、配送路を通じて廃止を伝えたい。
- 必要な入力：移行先のtype、sunsetの決め方、移行文書の置き場所。
- trade-off・失敗の仕方：通知はevent受信時にしか届かないため、eventを受けていないconsumerには伝わらない。sunsetを延ばす操作はできるが短縮できないため、短縮が必要になっても手段がない。
- 反例・適用しない場合：AsyncAPIは文書のSchema Objectに`deprecated`を持つ（`spec/asyncapi.md` 行1987）。廃止を実行時のmessageではなく、設計時の契約文書で表している。
- 互換・非互換：O02と組み合わせられる。
- 限界：期間の値は持ち込まない。

### P02-O04 envelopeに実装型のURN一覧を載せ、受信側はURN一致で型を選ぶ
- 出典：MassTransit、`src/MassTransit.Abstractions/Serialization/Serialization/MessageEnvelope.cs` 行7–24（https://github.com/MassTransit/MassTransit/blob/5d6a89578fe9bc5ec17df0fb3d307a0b16cde2a7/src/MassTransit.Abstractions/Serialization/Serialization/MessageEnvelope.cs#L7-L24）、`src/MassTransit.Abstractions/MessageTypeCache.cs` 行151–186（…/src/MassTransit.Abstractions/MessageTypeCache.cs#L151-L186）、`src/MassTransit/Serialization/EnvelopeSerializerContext.cs` 行85–98（…/src/MassTransit/Serialization/EnvelopeSerializerContext.cs#L85-L98）、`src/MassTransit.Abstractions/MessageUrn.cs` 行100–125、`src/MassTransit.Abstractions/Attributes/MessageUrnAttribute.cs` 行10–41。信頼性ラベル：primary。本文確認：済
- 何をしているか：`MessageEnvelope`は`MessageId`／`CorrelationId`／`ConversationId`／`InitiatorId`／`SourceAddress`／`DestinationAddress`／`ResponseAddress`／`FaultAddress`／`MessageType[]`／`ExpirationTime`／`SentTime`／`Headers`／`Host`を持つ。`MessageTypeCache<T>.GetMessageTypes`は、送信する型そのものに加えて、基底classと実装interfaceのうち「有効なmessage型」と判定したものを列挙し、`MessageType`配列に入れる。受信側の`IsSupportedMessageType<T>`は、受信側の型から作ったURNが配列のどれかと（大文字小文字を区別せずに）一致するかを見る。URNは既定ではCLR型名から作る。`[MessageUrn]`属性を付ければ、型名と切り離した名前を明示できる。
- 解いている問題と前提：producerとconsumerが同じclassを共有していなくても、共通のinterface（契約型）のURNが一致すれば受信できるようにする。.NETの型体系を契約の記述に使うことが前提になっている。
- 必要な入力：契約として公開する型（interface）の境界、URN名の固定方針（型名に従うか、属性で固定するか）。
- trade-off・失敗の仕方：既定ではnamespaceやclassの名前変更がURNの変更になり、受信側で型が一致しなくなる。`MessageUrnAttribute`はこの結び付きを外すための手段である。
- 反例・適用しない場合：Eventuate Tramは既定でJavaのclass名をそのまま`event-type` headerにし、`DomainEventNameMapping`で外部名との対応を差し替えられるようにしている（O07）。CloudEventsは`type`を逆DNS名などのproducer定義の文字列にし、言語の型と切り離している（O02）。
- 互換・非互換：O02とは、型識別子の作り方（言語型から作るか、宣言した文字列か）で対になる。
- 限界：.NET固有の型解決をHELIXへ持ち込めるとはみなさない。

### P02-O05 受信側の重複検出を「(consumer_id, message_id) 主キーへのINSERT」と業務処理の同一トランザクションで行う
- 出典：eventuate-tram-core、`eventuate-tram-consumer-jdbc/src/main/java/io/eventuate/tram/consumer/jdbc/SqlTableBasedDuplicateMessageDetector.java` 行30–55（https://github.com/eventuate-tram/eventuate-tram-core/blob/e472ed72b8635d0488a95d0892b8901c0158a7d1/eventuate-tram-consumer-jdbc/src/main/java/io/eventuate/tram/consumer/jdbc/SqlTableBasedDuplicateMessageDetector.java#L30-L55）、`eventuate-tram-in-memory/src/main/resources/eventuate-tram-embedded-schema.sql` 行16–21、`eventuate-tram-consumer-common/src/main/java/io/eventuate/tram/consumer/common/DuplicateDetectingMessageHandlerDecorator.java` 行14–22、`eventuate-tram-messaging/src/main/java/io/eventuate/tram/messaging/consumer/BuiltInMessageHandlerDecoratorOrder.java` 行3–7、`eventuate-tram-consumer-jdbc/.../TransactionalNoopDuplicateMessageDetector.java` 行19–35。信頼性ラベル：primary。本文確認：済
- 何をしているか：`received_messages`表の主キーは(CONSUMER_ID, MESSAGE_ID)である。`isDuplicate`は行をINSERTし、重複キー例外が出たら重複と判定する。`doWithMessage`は、INSERTとhandlerの呼出しを同じトランザクションの中で行う。この検出器は、decorator chainの中で決まった順位（受信前後のhookと、handler前後のhookの間）に挟まる。重複検出を使わない構成でも、`TransactionalNoopDuplicateMessageDetector`がhandlerをトランザクションで包む。
- 解いている問題と前提：at-least-onceの配送路で、受信側の状態変更が二重に適用されるのを防ぐ。業務DBと重複記録が同じDB・同じトランザクションにあることが前提である。
- 必要な入力：consumerを識別するID（subscriber単位）、producer側で確定したmessage ID（O09）、記録表を置くDB。
- trade-off・失敗の仕方：handlerが例外を出したときも`message_id`が保存されてしまう不具合が報告され、修正の後に「後続のmessageは処理され、offsetは問題のmessageからcommitされず、再起動時に大半が重複としてskipされる。処理を止める必要がある」という追記が付いた（https://github.com/eventuate-tram/eventuate-tram-core/issues/48 、closed。0.13.3.RELEASEで修正と記録）。また、このrepo内では`received_messages`の行を消す処理を見つけられなかった（検索範囲は末尾に記載）。
- 反例・適用しない場合：MassTransitのinboxは受信回数、消費完了の時刻、outbox送出の完了時刻、最後に送った連番も持ち、重複判定の窓を過ぎた行を消す（O06）。
- 互換・非互換：O01（envelopeの一意ID）とO09（送信側でIDを確定する仕組み）が前提になる。
- 限界：このrepoで成立していることはHELIXで成立することを意味しない。

### P02-O06 inbox状態を「消費済み → outbox送出済み → 片付け」の段階で進め、重複判定の窓を過ぎたら消す
- 出典：MassTransit、`src/MassTransit/Middleware/OutboxMessagePipe.cs` 行29–140（https://github.com/MassTransit/MassTransit/blob/5d6a89578fe9bc5ec17df0fb3d307a0b16cde2a7/src/MassTransit/Middleware/OutboxMessagePipe.cs#L29-L140）、`src/Persistence/MassTransit.EntityFrameworkCoreIntegration/EntityFrameworkCoreIntegration/InboxState.cs` 行7–63、`.../InboxCleanupService.cs` 行78–85、`src/MassTransit/Middleware/OutboxConsumeFilter.cs` 行31–42。信頼性ラベル：primary。本文確認：済
- 何をしているか：`InboxState`は`MessageId`、`ConsumerId`（endpoint名とconsumer型から作るhash）、`LockId`、`ReceiveCount`、`Consumed`、`Delivered`、`LastSequenceNumber`、`ExpirationTime`を持つ。`OutboxMessagePipe.Send`は3つの分岐で進む。(1)未消費ならconsumerを実行して`SetConsumed`する。(2)消費済みでoutboxが未送出なら、溜めたmessageを`LastSequenceNumber`より後のものから送出する。(3)送出済みならoutboxの行を消し、処理の継続を止める。宛先のないoutbox messageは警告を出して飛ばす。`InboxCleanupService`は、送出済みで重複判定の窓を過ぎたinbox行を削除する。
- 解いている問題と前提：受信処理の結果として出すmessageを、受信の重複排除と同じ記録の上で、少なくとも一度確実に送り出す。一度に全部が進まなくても、再配送のたびに途中の段階から再開できる。
- 必要な入力：重複判定の窓の長さ、consumerの識別方法、outboxとinboxを置くDB。
- trade-off・失敗の仕方：重複判定は窓の範囲に限られ、窓を過ぎてから届いた重複は検出されない（窓の値は持ち込まない）。outboxの送出が恒常的に失敗するmessageについて、作者は「N回失敗したらdetect／skip／dead-letterする組込みの仕組みはない」「手動で該当のoutbox messageやoutbox stateを消すしかない」と回答している（https://github.com/MassTransit/MassTransit/issues/6231 、open）。同じissueでは、送出のretry／backoffを後続版でopt-inとして提供すると述べている。しかし固定commitで`ConfigureDeliveryRetry`をgrepしても該当はなく、このcommitにはまだ入っていない。
- 反例・適用しない場合：Eventuate Tramの検出表は重複の判定だけを持ち、受信処理から出るmessageの送出状態とは結び付けていない（O05）。
- 互換・非互換：O05とは同じ問題を別の粒度で解いている。O10（retry／redelivery）と組み合わせると、再配送が段階を進める駆動力になる。
- 限界：窓、件数、timeoutの値は持ち込まない。

### P02-O07 event typeの外部名と実装classの対応を差し替え可能にし、未知のtypeは捨てる受信dispatcher
- 出典：eventuate-tram-core、`eventuate-tram-events/src/main/java/io/eventuate/tram/events/common/EventUtil.java` 行11–25（https://github.com/eventuate-tram/eventuate-tram-core/blob/e472ed72b8635d0488a95d0892b8901c0158a7d1/eventuate-tram-events/src/main/java/io/eventuate/tram/events/common/EventUtil.java#L11-L25）、`.../events/common/DomainEventNameMapping.java` 行6–10、`.../events/common/DefaultDomainEventNameMapping.java` 行3–14、`.../events/subscriber/DomainEventDispatcher.java` 行37–57。信頼性ラベル：primary。本文確認：済
- 何をしているか：event messageは、payload（JSON）に加えて`PARTITION_ID`（集約ID）、`event-aggregate-id`、`event-aggregate-type`、`event-type`のheaderを持つ。`DomainEventNameMapping`は「eventから外部type名」と「外部type名からclass名」の双方向の対応を定める。既定の実装はclass名をそのまま使う。dispatcherは受信時に外部名をclass名へ置き換え、該当するhandlerがなければ何もせずに返る。
- 解いている問題と前提：producerとconsumerが同じJava classを持つ構成を既定にしつつ、外部へ公開する名前を切り離す余地を残す。
- 必要な入力：外部type名の命名方針、集約型名。
- trade-off・失敗の仕方：既定ではclass名の変更がwire上の契約の変更になる。handlerのないtypeはdispatcherで黙って捨てられ、skipを記録する分岐はこのdispatcherのコードにはない。
- 反例・適用しない場合：MassTransitは、どのconsumerにも届かず失敗もしなかったmessageを`DeadLetterFilter`でdead letter pipe（skipped）へ送り、`LogSkipped`する（O10）。
- 互換・非互換：O04（URNの属性による固定）と同じ目的で、別の手段をとっている。
- 限界：Javaの型名の扱いをHELIXへ持ち込めるとはみなさない。

### P02-O08 非同期APIの契約を「application視点のsend／receive」で書き、反対側の文書を機械的に導かない
- 出典：asyncapi/spec、`spec/asyncapi.md` 行22–60（https://github.com/asyncapi/spec/blob/1dd65fd2c1ed13f06365c1e870c61cdc82d8a981/spec/asyncapi.md#L22-L60）、行216–224（Version String）、行254–264（Info Object）、行1241–1263（Message Object）、行1870–1899（Multi Format Schema Object）、行998–1010（Operation Reply Object）、行2648–2661（Correlation ID Object）。信頼性ラベル：primary。本文確認：済
- 何をしているか：文書は、1つのapplicationが行うoperation（`action: send|receive`）と、そのchannel、messageを記述する。sender側の文書からreceiver側の文書を導くことを推奨せず、channelが一致する保証がないことを理由に挙げている。版の層は3つに分かれる。(a)仕様の版は`asyncapi`のmajor.minor.patchで、patchはtoolingが区別しない。(b)application APIの版は`info.version`。(c)payloadとheadersのschemaの形式は`schemaFormat`で表し、AsyncAPI Schema／JSON Schemaは必須対応、Avro／OpenAPI／RAML／Protobufは推奨対応である。Message Objectの`headers`はapplication headerのschemaに限り、protocol headerを定義してはならない。request／replyは`reply`で表し、replyのmessageは列挙したmessageのうち厳密に1つに合致しなければならない。相関IDの位置はruntime expressionで指す。
- 解いている問題と前提：protocolに依存しない機械可読の契約記述。topologyや設計パターンを仮定せず、protocol固有の事項はbindingsへ分ける。
- 必要な入力：どのapplicationの視点で書くか、schemaの形式、header（application／protocol）の境界。
- trade-off・失敗の仕方：版はapplication単位であり、message単位の版がないと、1つのmessageを変えただけでapplication全体の版が上がるという問題提起が未解決のまま残っている（https://github.com/asyncapi/spec/issues/1068 、open）。失敗時のretryとdead-letterの経路を標準で表せず、vendor拡張に頼っているという提起もある（https://github.com/asyncapi/spec/issues/1234 、open、2026-08-06起票）。仕様本文で`idempot`、`retry`、`dead letter`、`ordering`をgrepしても該当はなかった。
- 反例・適用しない場合：CloudEventsは、実行時のeventそのものに版の手がかり（type／dataschema）と廃止を載せる（O02、O03）。AsyncAPIは設計時の文書で記述する。
- 互換・非互換：AsyncAPIは`schemaFormat`／`contentType`でpayloadの形式を、CloudEventsは`datacontenttype`／`dataschema`で同じことを表しており、併用は可能に見える。ただし、両者の対応付けを本文で直接確認したわけではない（gapに記載）。
- 限界：このrepoで成立していることはHELIXで成立することを意味しない。

### P02-O09 送信側はIDを業務トランザクション内のoutbox行で確定し、relayが別に配送する
- 出典：eventuate-tram-core、`README.adoc` 行51–60（https://github.com/eventuate-tram/eventuate-tram-core/blob/e472ed72b8635d0488a95d0892b8901c0158a7d1/README.adoc#L51-L60）、`eventuate-tram-producer-jdbc/src/main/java/io/eventuate/tram/messaging/producer/jdbc/MessageProducerJdbcImpl.java` 行26–35、`eventuate-tram-messaging/src/main/java/io/eventuate/tram/messaging/producer/MessageHeaderUtils.java` 行9–20、`eventuate-tram-messaging/src/main/java/io/eventuate/tram/messaging/common/Message.java` 行10–30。信頼性ラベル：primary。本文確認：済
- 何をしているか：producerは、業務データを更新するACIDトランザクションの中でOUTBOX表にINSERTし、その行のIDを`ID` headerとして確定する。brokerへの配送は別のrelay（CDC。MySQL binlogやPostgres WALの追跡、または他のDB向けのpolling）が行う。`DESTINATION`／`DATE`を付け、`PARTITION_ID`が未設定ならランダムな値を入れる。domain eventでは集約IDが入る（O07）。
- 解いている問題と前提：DBの更新とmessageの送信の二重書込み問題。relayは再送しうるが、IDは発生元で確定しているため、受信側（O05）で重複を判定できる。
- 必要な入力：outbox表を置けるDB、relayの運用、partition keyの選び方。
- trade-off・失敗の仕方：relayは別のrepository／serviceであり、配送の順序やretryの性質はここからは読めない。partition keyを指定しないとランダムな値になり、そのmessageについて同じ集約の内部での順序の手がかりがなくなる（順序を何が保証するかはbroker／relay側にあり、未確認）。
- 反例・適用しない場合：MassTransitのbus outboxは、受信処理の中で出すmessageをinbox状態と結び付けて送る（O06）。CloudEventsは永続化の過程を仕様の範囲外としている（primer行148–154）。
- 互換・非互換：O05、O01と組み合わせられる。
- 限界：このrepoで成立していることはHELIXで成立することを意味しない。

### P02-O10 失敗の段階を分ける：即時retry → 遅延redelivery → error（faulted）／skipped（未配達）
- 出典：MassTransit、`src/MassTransit/Middleware/RetryFilter.cs` 行9–24（https://github.com/MassTransit/MassTransit/blob/5d6a89578fe9bc5ec17df0fb3d307a0b16cde2a7/src/MassTransit/Middleware/RetryFilter.cs#L9-L24）、`src/MassTransit/Middleware/RedeliveryRetryFilter.cs` 行9–130、`src/MassTransit/Middleware/ErrorTransportFilter.cs` 行7–27、`src/MassTransit/Middleware/DeadLetterFilter.cs` 行8–40、`src/MassTransit.Abstractions/MessageHeaders.cs` 行56、71。信頼性ラベル：primary。本文確認：済
- 何をしているか：`RetryFilter`はprocess内でpolicyに従って再実行する。`RedeliveryRetryFilter`は、messageの再配送回数（`MT-Redelivery-Count` header）の分だけretry contextを進めてpolicyの残りを判定し、残っていれば`ScheduleRedelivery(delay)`で遅延再配送を予約して、今回の受信を消費済みとして通知する。予約に失敗した場合は`TransportException`にする。retryを使い切った例外は`ErrorTransportFilter`がerror transportへ移す。consumerに届かず、faultedでもないmessageは、`DeadLetterFilter`がdead letter pipeへ送り、skippedとして記録する。
- 解いている問題と前提：一時的な失敗と恒久的な失敗を区別し、遅延を挟むretryで受信の流れを塞がない。「処理して失敗した」（error）と「受け手がいなかった」（skipped）を別の行き先にする。試行回数は、message自体（header）が運ぶ。
- 必要な入力：retryするか否かの例外分類、遅延の方針、scheduler（遅延再配送の手段）。
- trade-off・失敗の仕方：試行回数がheaderで運ばれるため、headerを失う経路があると回数が数え直しになる（推測。コードでは`GetRedeliveryCount`を読むだけ）。同じissue #6231の利用者の設定では、`DiscardFaultedMessages`／`DiscardSkippedMessages`でerror／skippedの行き先を捨てていた。outbox側の送出失敗はこの段階付けの外にあり、運用者に見えないと作者自身が書いている（O06）。
- 反例・適用しない場合：Temporalは試行回数をmessageではなくserver側の状態（ActivityInfo.Attempt）に持つ（O11）。Temporalのserver内部のDLQは、業務messageではなく、server内部のtaskの終端エラー（例：data破損による復号失敗）用である（O12）。CloudEventsはrouting情報をeventに含めない方針で、その理由として、届かないwebhook宛てのeventをdead-letter queueへ送れることを挙げている（primer行157–175）。
- 互換・非互換：O06と組み合わせられる（再配送がinboxの段階を進める）。
- 限界：retry回数や間隔の値は持ち込まない。

### P02-O11 activityのretryをserver状態で進め、workflow historyには最終結果だけを書く。古い試行の応答はtokenの試行番号で拒否する
- 出典：temporalio/temporal、`service/history/workflow/mutable_state_impl.go` 行6877–6972（https://github.com/temporalio/temporal/blob/92aff3961b3842a3573cac1a96c9d627b6e2cd0d/service/history/workflow/mutable_state_impl.go#L6877-L6972）、`service/history/api/respondactivitytaskfailed/api.go` 行84–122、`service/history/api/activity_util.go` 行58–80、`service/history/workflow/retry.go` 行29–112、`common/retrypolicy/retry_policy.go` 行24–64、102–141、`docs/architecture/history-service.md` 行248。信頼性ラベル：primary。本文確認：済
- 何をしているか：`RetryActivity`は、retry policyの有無、取消要求、ScheduleToStart／ScheduleToCloseのtimeout（これらは`RETRY_STATE_TIMEOUT`扱い）、`IsRetryableFailure`（取消、終了、非retryの型、`NonRetryable`の印）を順に判定する。retryできる場合は`nextBackoffInterval`で次の間隔を計算し、ActivityInfoの`Attempt`を進めてretry timer taskを作る。応答handlerは、retryが`IN_PROGRESS`でないときにだけ`ActivityTaskFailed`をhistoryへ追加し、workflow taskを作る。設計文書は「activity retryはworkflow historyにeventを加えない」と書いている。workerから届いたtask tokenの`Attempt`が現在のActivityInfoと違えば`IsActivityTaskNotFoundForToken`がtrueになり、`ErrActivityTaskNotFound`で拒否される。application failureは`NextRetryDelay`でbackoffを上書きできる。
- 解いている問題と前提：workflow（決定論的に再実行される側）とactivity（副作用を持ち、失敗しうる側）の間に再試行の境界を置く。workflowのコードからは、retryの途中経過が見えず最終結果だけが見える。試行回数をserverが一元的に持ち、遅れて届いた古い試行の応答を状態に反映しない。
- 必要な入力：retry policy（最大試行回数、間隔、係数、有効期限、非retryのerror型）、failureの分類（application／timeout／取消）。
- trade-off・失敗の仕方：ScheduleToCloseのtimeoutが「実際に到達した」場合と「次の試行が期限を越えると予測された」場合で、SDKへ返すretry stateが揃っていなかった不具合がある（https://github.com/temporalio/temporal/issues/3667 、closed。コード行6892–6908のコメントが参照している）。また、`docs/architecture/workflow-lifecycle.md` 行501–509のsequence図の注記は、失敗とretryの際に`ActivityTaskFailed, ActivityTaskScheduled`をhistoryへ追加すると書いており、同じ文書の図（行551–558）、history-service.md 行248、api.go 行112–117のコードと食い違っている（文書側の不整合として観察）。コードの`// TODO treat 0 as 0, not infinite`（retry.go 行29）は、0を「無制限」とみなす既定の解釈がまだ残っていることを示している。
- 反例・適用しない場合：MassTransitは試行回数をmessage headerで運ぶ（O10）。Eventuate Tramのこのrepoには、受信handlerにretry policyを持たせる仕組みは見当たらず（未確認の範囲は末尾に記載）、再処理はbrokerのoffset／再配送に依存しているように読める（issue #48の記述）。
- 互換・非互換：O10とは「試行回数を誰が持つか」で対になる。O01／O05の受信側の重複排除はmessage IDで判定し、Temporalは試行番号とversionの照合で古い応答を拒否する。
- 限界：retryの既定値（`DefaultDefaultRetrySettings`）は持ち込まない。

### P02-O12 server内部taskの終端エラー用DLQと、purge／mergeによる人手の解消
- 出典：temporalio/temporal、`docs/admin/dlq.md` 行1–50（https://github.com/temporalio/temporal/blob/92aff3961b3842a3573cac1a96c9d627b6e2cd0d/docs/admin/dlq.md#L1-L50）、`docs/architecture/retry.md` 行52–55。信頼性ラベル：primary。本文確認：済
- 何をしているか：「data破損による復号失敗」のような非retryの終端エラーを起こしたserver内部task（transfer／timer／replication／visibility）をDLQへ入れる。予期しないerrorについては試行回数の上限設定で、特定のerrorについては正規表現の設定で、DLQへ回す対象を決める。検知はmetricとlogで行い、運用者はtaskをpurge（除去）するか、merge（元のqueueへ戻して再試行）する。別文書では、gRPC handler側のretryはclient側のretryと掛け算で増えるため、handler側は控えめにすると書いている。
- 解いている問題と前提：自動retryでは解けない失敗を、処理の流れから外して人手の判断へ回す。対象は業務messageではなく、platform内部のtaskである。
- 必要な入力：終端エラーの分類、検知の経路、purgeとmergeの判断者。
- trade-off・失敗の仕方：正規表現での照合はすべてのtaskの失敗に適用されるため性能に影響しうる、と文書自体が注意している。
- 反例・適用しない場合：MassTransitのerror／skippedは業務messageの行き先である（O10）。MassTransitのoutbox送出の失敗には、固定commit時点で同等の退避先がない（O06）。
- 互換・非互換：O10と、層の違う（platform内部か業務messageか）退避の仕組みとして並べられる。
- 限界：設定名と値は持ち込まない。

### P02-O13 順序の範囲を「source単位」「partition key単位」に限定して宣言する
- 出典：cloudevents/spec、`cloudevents/extensions/sequence.md` 行1–21、37–52（https://github.com/cloudevents/spec/blob/2ed3806b4ad8fda35813263cfefb2d73098b7655/cloudevents/extensions/sequence.md#L1-L52）、`cloudevents/extensions/partitioning.md` 行27–40。eventuate-tram-core、`EventUtil.java` 行20（`PARTITION_ID`＝集約ID）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`sequence`は同じ`source`の範囲でだけ比べられる、辞書順で比較できる文字列である（必要ならゼロ埋めにする）。単調増加かつ連続であることを推奨している。sourceが違えば比べられない。複数の次元（sourceとsubjectなど）で順序が要るときは、次元をsourceに含めるか、別の拡張を定義する。`partitionkey`は因果関係やグループ化のためのkeyで、経路の途中で変わったり消えたりしうると明記している。Eventuate Tramはdomain eventの`PARTITION_ID`に集約IDを入れ、同じ集約のeventを同じpartitionへ寄せる。
- 解いている問題と前提：大域的な全順序を約束せず、順序が意味を持つ範囲をkeyで区切る。
- 必要な入力：順序が要る単位（集約、source、subject）の決定。
- trade-off・失敗の仕方：partitionkeyは途中の経路で書き換わりうるため、端から端までの順序の保証にはならない（仕様の本文）。sequenceの意味や値域はproducerとconsumerの帯域外の取り決めに委ねられている。
- 反例・適用しない場合：MassTransitのoutboxは、1回の受信処理の中で出すmessageに`SequenceNumber`を付け、`LastSequenceNumber`から再開する（O06）。これは業務の順序というより送出の再開位置の記録である。
- 互換・非互換：O01（id）とは独立しており、併用できる。
- 限界：このrepoで成立していることはHELIXで成立することを意味しない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 重複の判定キー | CloudEvents：`source`+`id`をproducerが一意にする義務を負い、重複とみなすかはconsumerの任意（O01） | Eventuate：(consumer_id, message_id)を主キーにして受信側DBで判定（O05）。MassTransit：(MessageId, ConsumerId)に受信回数・段階・期限を付けたinbox（O06） | 仕様は判定キーの意味だけを定め、実装は記録の置き場所と寿命まで決める |
| 重複記録の寿命 | Eventuate：このrepo内に削除処理が見当たらない（O05） | MassTransit：送出完了後、重複判定の窓を過ぎたら削除（O06） | 窓を設けると記録量を抑えられるが、窓を過ぎた重複は検出できない |
| 試行回数の持ち主 | MassTransit：message header（再配送回数）で運ぶ（O10） | Temporal：serverのActivityInfo.Attemptに持ち、tokenの試行番号で古い応答を拒否（O11） | broker中心か、状態を持つserver中心か |
| retryの境界 | MassTransit：process内retryと遅延redeliveryの二段（O10） | Temporal：activityのretryはworkflow historyに出さず、最終結果だけ（O11） | 受信側が呼び出し元と分かれているか、workflowが決定論的に再実行されるか |
| 回復できない失敗の退避先 | MassTransit：error（faulted）とskipped（未配達）を分ける（O10）。outbox送出の失敗は固定commit時点で退避先がない（O06、#6231） | Temporal：platform内部taskの終端エラーをDLQへ入れ、purge／mergeで人手解消（O12）。AsyncAPI：契約に記述する標準の手段がない（#1234） | 業務messageの層か、platform内部の層か、契約文書の層か |
| 型・版の識別 | CloudEvents：互換のない変更でだけ`type`を変え、`dataschema`で詳細を示す（O02）。廃止はevent拡張で通知（O03） | MassTransit：実装型と契約interfaceのURN一覧を載せて一致判定（O04）。Eventuate：class名を既定にし、対応表で外部名を差し替え（O07）。AsyncAPI：`info.version`はapplication単位、schemaの形式は`schemaFormat`（O08） | 言語非依存の文字列か、言語の型体系か。実行時のmessageか、設計時の文書か |
| 未知のtypeの扱い | Eventuate：handlerがなければ黙って返る（O07） | MassTransit：skippedとしてdead letter pipeへ送る（O10） | 未配達を観測対象にするかどうか |
| 順序の範囲 | CloudEvents：source単位のsequence、経路で変わりうるpartitionkey（O13） | Eventuate：集約IDをpartition keyにする（O09、O13）。MassTransit：outbox内の連番は送出の再開位置（O06） | 順序を業務の単位で語るか、送出処理の単位で語るか |
| 送信の確実性 | Eventuate：業務トランザクション内のoutbox行とCDC relay（O09） | MassTransit：受信処理に結び付いたbus outboxの段階遷移（O06） | 送信の起点が業務の更新か、受信処理か |

## 見つからなかったこと・gap
- Eventuate Tramでpartition単位の順序を実際に保つ実装（Kafka consumer側のswimlane等）は、このrepoではなく別repository（eventuate-messaging-kafka等）にあると推測される。このrepoの`EventuateTramKafkaMessageConsumer`は委譲するだけで、順序の機構は確認できていない。
- Eventuate Tramで`received_messages`の行を消す処理は、このrepoの`*.java`／`*.sql`／`*.yml`を検索しても見つからなかった。CDC側やdocs側にあるかは未確認。
- Eventuate Tramの受信handlerのretry policyや、dead-letterの仕組みは、このrepoでは見つけられなかった。
- MassTransitのoutbox送出retry（issue #6231で作者が言及した`ConfigureDeliveryRetry`）は、固定commitに存在しない。
- AsyncAPIの本文には、配送保証（at-least-once等）、冪等性、retry、dead-letter、順序の語が見当たらなかった。bindings側（別repository `asyncapi/bindings`）は読んでいない。
- AsyncAPIとCloudEventsの併用（AsyncAPIのmessageにCloudEventsのenvelopeを載せる記述）は、両repoの本文では確認していない。
- Temporalの文書`workflow-lifecycle.md` 行501–509の注記は、コードと設計文書（history-service.md 行248）と食い違っている。どちらが現行の意図かは、コード側（api.go 行112–117）を優先して観察した。
- consumerとproducerの互換性をCIで検査する仕組み（schema registryの互換モード、contract test）は、5つのrepoのいずれでも本文で確認していない。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- cloudevents/spec：`cloudevents/spec.md`（行282–372、422–433、487–534）、`cloudevents/primer.md`（行146–202、248–353）、`cloudevents/extensions/sequence.md`（全文）、`partitioning.md`（行1–40）、`deprecation.md`（行1–86）。bindings、formats、`v2.md`、`subscriptions/`、`cesql/`は読んでいない。
- MassTransit：`MessageEnvelope.cs`、`EnvelopeSerializerContext.cs`（行80–100）、`MessageUrn.cs`（行98–128）、`MessageUrnAttribute.cs`（行1–40）、`MessageTypeCache.cs`（行150–200）、`InboxState.cs`、`OutboxConsumeFilter.cs`、`OutboxConsumeOptions.cs`、`OutboxMessagePipe.cs`（行1–140）、`InboxCleanupService.cs`（行70–98）、`DeadLetterFilter.cs`、`ErrorTransportFilter.cs`、`RedeliveryRetryFilter.cs`（行1–130）、`RetryFilter.cs`（行1–30）、`MessageHeaders.cs`（grepのみ）。検索語：`SupportedMessageTypes`、`ConfigureDeliveryRetry`、`DuplicateDetectionWindow`。issue検索：「outbox」（#6231を本文まで確認）。transport別の実装、saga、job service、testsは読んでいない。
- eventuate-tram-core：`README.adoc`（行1–215のgrepと行45–70）、`SqlTableBasedDuplicateMessageDetector.java`、`TransactionalNoopDuplicateMessageDetector.java`、`DuplicateDetectingMessageHandlerDecorator.java`、`DuplicateMessageDetector.java`、`BuiltInMessageHandlerDecoratorOrder.java`、`Message.java`、`MessageHeaderUtils.java`、`MessageProducerJdbcImpl.java`、`EventUtil.java`、`DomainEventNameMapping.java`、`DefaultDomainEventNameMapping.java`、`DomainEventDispatcher.java`（行30–66）、`EventuateTramKafkaMessageConsumer.java`、`eventuate-tram-embedded-schema.sql`（行14–21）。検索語：`swimlane`（該当なし）、`received_messages`。issue：#48。commands、reactive系、micronaut系は読んでいない。
- asyncapi/spec：`spec/asyncapi.md`（行13–60、216–275、998–1011、1241–1268、1870–1900、2648–2662、grep行1987）。検索語：`idempot|retry|retries|dead.letter|at-least|exactly.once|ordering|deprecated`。issue：#1234、#1068を本文まで確認（#697はタイトルのみ）。`examples/`は読んでいない。
- temporalio/temporal（sparse checkout）：`docs/architecture/retry.md`（全文）、`docs/architecture/history-service.md`（行236–252）、`docs/architecture/workflow-lifecycle.md`（行500–560）、`docs/admin/dlq.md`（行1–50）、`service/history/workflow/retry.go`（行1–200）、`common/retrypolicy/retry_policy.go`（全文）、`service/history/workflow/mutable_state_impl.go`（行6877–7010）、`service/history/api/respondactivitytaskfailed/api.go`（行75–125）、`service/history/api/activity_util.go`（行58–80）。issue：#3667。workflow update、nexus、matching service、SDK側（別repository）は読んでいない。
- repository内のコード、script、test、buildはどれも実行していない。clone先は作業用の一時領域配下（cloudevents-spec、MassTransit、eventuate-tram-core、asyncapi-spec、temporal）。gh apiとgh CLIの呼出しは約20回。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：仕様（CloudEvents、AsyncAPI）と実装（MassTransit、Eventuate Tram、Temporal）が混ざっている。両者を同じ「外部観察」の種類として扱うか、仕様由来と実装由来を区別するかは未決。
- scope：O12（Temporalのplatform内部DLQ）は業務messageの契約ではなくplatform内部の運用であり、D05 API／Integrationのscopeに入れるかは未決。O11も、厳密にはworkflow engineの内部境界である。
- 評価根拠：すべて未評価の候補素材である。HELIXでの採否、適合性、外部での成功は評価していない（HELIXBRAIN-L2-026／027の経路に委ねる）。
- 版：固定commitのSHAを版として記録した。仕様（CloudEvents 1.0.3-wip、AsyncAPI 3.1.0）の版表記と、commit SHAのどちらを主キーにするかは未決。
- 状態：全観察を「未評価」とする。文書とコードの食い違い（Temporalのworkflow-lifecycle.md）や、open issue（MassTransit #6231、AsyncAPI #1068／#1234）に依存する観察は、上流の変化で古くなりうる。再確認の契機をどう持つかは未決。
- ライセンス：eventuate-tram-coreのSPDXが`NOASSERTION`であることの扱い（本文の文言に基づいてApache-2.0として扱うか）は未決。
