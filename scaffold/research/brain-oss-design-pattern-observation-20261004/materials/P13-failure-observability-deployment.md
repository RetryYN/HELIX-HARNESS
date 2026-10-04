# P13 Failure構造・Observability・Deployment方式の観察（D07 Infrastructure、INFRA-005/007/009）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| open-telemetry/semantic-conventions | https://github.com/open-telemetry/semantic-conventions | a0dab2b810d9dd990294ca9e36c05983f88005c5（main） | Apache-2.0 | false | 2026-10-04 | telemetryの意味規約（属性の要求水準、errorの記録規約、規約の版移行）の一次資料 |
| argoproj/argo-rollouts | https://github.com/argoproj/argo-rollouts | ce554d91bd34cc71dc6b5f00f838570e0ef21d85（master） | Apache-2.0 | false | 2026-10-04 | progressive delivery（canary／blue-green）と分析結果の型（Failed／Error／Inconclusive）の実装 |
| fluxcd/flagger | https://github.com/fluxcd/flagger | c781cdc199d44cf84e21e90aedd8ff14c1df450e（main） | Apache-2.0 | false | 2026-10-04 | Argo Rolloutsと同じ問題（canary／blue-green／A/B）を別の失敗モデル（失敗checkの単一counter）で解いている |
| chaos-mesh/chaos-mesh | https://github.com/chaos-mesh/chaos-mesh | 93359158e54a444fb822d5ad64d30436263089a0（master） | Apache-2.0 | false | 2026-10-04 | 故障の型を種類（Kind）と操作（Action）に分けて宣言し、注入と回復を対にした状態機械を持つ |
| prometheus/prometheus | https://github.com/prometheus/prometheus | 961c9ba40923ca4d7adf4a7a9167e56d0406df83（main） | Apache-2.0 | false | 2026-10-04 | alert状態（pending／firing／inactive）と、評価そのものの失敗（rule health）を分けている |

clone先はscratchpad/oss/{semantic-conventions,argo-rollouts,flagger,chaos-mesh,prometheus}です（`--filter=blob:none`、hooksPathは無効化）。読んだのはファイルだけで、コード・script・test・build・hookは一切実行していません。litmuschaos/litmusは読んでいません（理由は「検索範囲と結果」に記載）。

## 観察

### P13-O01 telemetry属性の4段階要求水準（Required／Conditionally Required／Recommended／Opt-In）
- 出典：semantic-conventions、`docs/general/attribute-requirement-level.md` 行20–122（https://github.com/open-telemetry/semantic-conventions/blob/a0dab2b810d9dd990294ca9e36c05983f88005c5/docs/general/attribute-requirement-level.md#L20-L122）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：semantic conventionの各属性に要求水準を1つ付けます。水準ごとに「既定で含めるか」「設定で含められるか」「設定で除外できるか」を表で定めています（行45–59）。Requiredは全instrumentationが必ず埋める属性です。consumerは、Required属性があるかどうかで「そのtelemetryがその規約に従っているか」を判別できます（行70–74、例として`db.system.name`）。Conditionally Requiredは条件を規約側に明記させ、条件が成り立たない場合はOpt-Inとして扱うよう誘導します（行76–99）。他の規約の属性を参照する規約は、自分のscopeの中で要求水準を変更してよいとしています（行35–37）。
- 解いている問題と前提：多数のinstrumentation libraryの間で、取得コスト、cardinality、security、privacyの事情が違うことが前提です。高cardinalityになりうるmetric属性はOpt-Inしか許さない、と例示しています（行31–33）。
- 必要な入力：属性ごとの取得コスト、cardinality、機密性の評価。Conditionally Requiredの場合は条件文。
- trade-off・失敗の仕方：Opt-In属性は、設定機能を持たないinstrumentationでは出力が禁止されます（行115–117）。そのため規約上の属性があっても観測できない場合があります。文書内に「例が規約変更で壊れる」というTODOコメントがあります（行39、93）。
- 反例・適用しない場合：Prometheusのalerting rule（P13-O10）は、属性の要求水準ではなく、ruleを書く人が任意のlabelを付ける方式です。
- 互換・非互換：P13-O02（`error.type`の付与規約）、P13-O03（版移行）と組み合わさります。
- 限界：OTelでの水準区分は、HELIXの観測規約でも同じ区分が要るという根拠にはなりません。具体的な属性名は持ち込みません。

### P13-O02 失敗の定義と記録先の規約（span status＋`error.type`、成功と失敗を1本のmetricにまとめる）
- 出典：semantic-conventions、`docs/general/recording-errors.md` 行19–98（https://github.com/open-telemetry/semantic-conventions/blob/a0dab2b810d9dd990294ca9e36c05983f88005c5/docs/general/recording-errors.md#L19-L98）。同 `model/error/registry.yaml` 行1–45（https://github.com/open-telemetry/semantic-conventions/blob/a0dab2b810d9dd990294ca9e36c05983f88005c5/model/error/registry.yaml#L1-L45）。同 `model/error/deprecated/registry-deprecated.yaml` 行1–22（https://github.com/open-telemetry/semantic-conventions/blob/a0dab2b810d9dd990294ca9e36c05983f88005c5/model/error/deprecated/registry-deprecated.yaml#L1-L22）。信頼性ラベル：primary。本文確認：済（recording-errors.mdのStatusは`Development`、行3）
- 何をしているか：
  - 失敗の定義：「例外が送出された」または「error codeなど別の方法でerrorを返した」場合に失敗とします。ある状態コードがerrorかどうかは文脈で決まるとしています（HTTP 404の例、行29–37）。
  - 記録しないもの：retryした、またはhandleして正常に完了したerrorは記録しません（行39–40）。
  - spanへの記録：成功時はstatusを未設定のままにします。失敗時はstatus Errorと`error.type`を設定し、descriptionには機密を含めず、重複も入れません（行44–58）。
  - metricへの記録：成功と失敗を別metricに分けず、duration histogramに`error.type`を付けた1本のmetricにします。同じ操作のspanとmetricで`error.type`を一致させます（行65–82）。
  - `error.type`の属性定義：低cardinalityで予測可能な分類キーとし、instrumentationが独自の値を定めない場合のfallbackとして`_OTHER`を使います（registry.yaml 行14–18）。wrapper型は内側の型を使ってよいとしています。domain固有の識別子（状態コード等）は別属性に入れ、`error.type`はすべてのerrorを捕捉するために設定します（registry.yaml 行8–45）。
  - 廃止：`error.message`は`deprecated.reason: obsoleted`として、cardinalityが無制限になることとspan statusとの重複を理由に退けています（registry-deprecated.yaml 行13–22）。
- 解いている問題と前提：同じ操作のspan、metric、logを横断して、失敗率と失敗の分類を導けるようにすることです。一つのinstrumentationの中では`error.type`のcardinalityが低いことを前提にしています。一方で、多数のsourceを集約するconsumerは高cardinalityに備えるべきだとしています（`model/error/registry.yaml` 行34–37）。
- 必要な入力：domainごとの「どの状態コードをerrorとするか」（規約側で決める、`recording-errors.md` 行26–27）。instrumentationが報告するerrorの一覧（`model/error/registry.yaml` 行32）。
- trade-off・失敗の仕方：文脈によってerrorかどうかが変わるため、汎用instrumentationでは判定できない場合があります（行31–37）。同じ例外を何度も記録しない、handle済みの例外を記録しない、が明記されています（行93–94）。
- 反例・適用しない場合：Argo Rollouts（P13-O04）は、計測そのものが失敗した場合（Error）と、計測値が条件に違反した場合（Failed）を別のphaseにしています。OTelの`error.type`は「操作の失敗」だけを扱い、判定不能という型は持ちません。
- 互換・非互換：P13-O01（要求水準）と組み合わさります。P13-O10ではPrometheusのrule評価失敗の箇所がspan statusにErrorを設定しており（`rules/group.go` 行538–544）、同じ記録先を使っている実例です。
- 限界：記録の粒度と分類を決める方法の観察です。HELIXの失敗型そのものを決めるものではありません。例の値は持ち込みません。

### P13-O03 規約の版移行（新旧の並行出力をopt-inし、既定は旧規約を維持）
- 出典：semantic-conventions、`docs/http/README.md` 行13–37（https://github.com/open-telemetry/semantic-conventions/blob/a0dab2b810d9dd990294ca9e36c05983f88005c5/docs/http/README.md#L13-L37）。信頼性ラベル：primary。本文確認：済
- 何をしているか：旧版の規約を出力している既存instrumentationに、規約がstableになるまで既定の出力版を変えないよう求めます。そのうえで環境変数`OTEL_SEMCONV_STABILITY_OPT_IN`を導入させ、値を3通りに分けます。
  - `http`：新しい規約だけを出す。
  - `http/dup`：新旧両方を出す。
  - 指定なし：旧規約を出し続ける。
  `dup`が優先し、次のmajor versionで変数を廃止します。並行出力の期間には最低限の保守期間を課しています（値は持ち込みません）。属性名だけでなく、metric名、span名、単位も規約の一部として扱っています（行21–22）。
- 解いている問題と前提：telemetryの意味規約を変えると、既存のdashboardやalertが壊れます。consumerが移行を終えるまで、新旧を両方出せることを前提にしています。
- 必要な入力：規約のstability状態（stableかどうか）。category単位の切替名。
- trade-off・失敗の仕方：dupを出している期間は、出力量と重複が増えます。保守期間を義務づけている点から、移行に時間がかかることを前提にしていると読めます。
- 反例・適用しない場合：Argo Rolloutsの`dryRun`（P13-O04）は、規約ではなく判定の版を並行させる仕組みです（判定を結果に反映しない）。
- 互換・非互換：P13-O01と組み合わさります。
- 限界：期間の値は持ち込みません。HELIXの規約改訂の手続きを代替するものではありません。

### P13-O04 分析結果の4値型（Successful／Failed／Error／Inconclusive）と「最悪値」集約
- 出典：argo-rollouts、`pkg/apis/rollouts/v1alpha1/analysis_types.go` 行203–223（https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/pkg/apis/rollouts/v1alpha1/analysis_types.go#L203-L223）。`analysis/analysis.go` 行436–573、658–689（https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/analysis/analysis.go#L436-L573 、https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/analysis/analysis.go#L658-L689）。`utils/analysis/helpers.go` 行47–79（https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/utils/analysis/helpers.go#L47-L79）。`docs/features/analysis.md` 行861–870（https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/docs/features/analysis.md#L861-L870）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 型：`AnalysisPhase`はPending、Running、Successful、Failed、Error、Inconclusiveの6値です。このうち完了とみなすのはSuccessful、Failed、Error、Inconclusiveの4値です（`Completed()`）。同じ型をAnalysisRun、MetricResult、Measurementの3階層で共有しています。
  - metric単位の判定：`assessMetricFailureInconclusiveOrError`は、metricごとの計数をそれぞれの上限と比べます。対応は「failed回数とfailureLimit」「inconclusive回数とinconclusiveLimit」「連続error回数とconsecutiveErrorLimit」です。failureLimitが負の場合は適用外です（行665–666）。
  - run全体への集約：`assessRunStatus`は、完了したmetricのうち最悪のphaseをrunのphaseにします。最悪の順序は`analysisStatusOrder`という固定の列で、Successful＜Running＜Pending＜Inconclusive＜Error＜Failedです（helpers.go 行47–55）。同時にphaseごとの件数を`RunSummary`に数えます。
  - dryRun：`dryRun`に指定したmetricは集約の対象から外し、別の`DryRunSummary`に数えます。
  - 終了要求：まだ1件も計測していない段階で終了を指示された場合は、Successfulとして返します（行562–567）。
- 解いている問題と前提：配信を進めるか止めるかを、複数の計測providerの結果からまとめて決めることです。計測基盤そのものの失敗（Error）と、計測値の劣化（Failed）は運用上の意味が違う、という前提に立っています。
- 必要な入力：metricごとのsuccessCondition／failureCondition。各上限値。どのmetricをdryRunにするか。
- trade-off・失敗の仕方：
  - ErrorはFailedより軽く順位づけられているため、Errorだけで終わったrunはFailedとは区別されます。ただし、rollout側ではどちらもabortになります（P13-O05）。
  - 条件に当てはまらない計測値はInconclusiveになり、人の判断待ちになります。
  - issue #2250（https://github.com/argoproj/argo-rollouts/issues/2250 、open）では、Job型metricがInconclusiveを返せないことが「他のmetricに比べて不利」と報告されています。provider間で4値型をそろえられていない実例です。
- 反例・適用しない場合：Flagger（P13-O08）は、こうした区別を持たず、すべての失敗を1つのcounterに数えます。
- 互換・非互換：P13-O05（結果からrolloutの動作への対応づけ）と一体です。P13-O02の`error.type`とは、扱う対象が違います（操作の失敗か、判定の結果か）。
- 限界：上限の既定値は持ち込みません。この順序は、HELIXの検証結果の順序づけとして妥当であることを意味しません。

### P13-O05 判定不能（Inconclusive）を人の判断待ち（pause）へ、Failed／Errorをabortへ振り分ける
- 出典：argo-rollouts、`rollout/analysis.go` 行152–171、176–193（https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/rollout/analysis.go#L152-L193）。`docs/features/analysis.md` 行18、1158–1189（https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/docs/features/analysis.md#L1158-L1189）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `setPauseOrAbortForBlueGreen`は、AnalysisRunのphaseがInconclusiveなら`PauseReasonInconclusiveAnalysis`を付けてpauseします。ErrorかFailedならabortします。abortの理由文には、pre-promotionかpost-promotionかの区別とrunのmessageを入れます。
  - `needsNewAnalysisRun`は、Inconclusiveでpauseした後に、新しいAnalysisRunを作り直すかどうかを判定します。コメントによると、作り直しによってSuccessに化けることを防ぐための追加判定があります（行178–187）。
  - docsは、Inconclusiveを「計測は自動で行い、受け入れるかどうかは人が決める」用途と説明しています（行1188–1189）。success条件とfailure条件のどちらも満たさない場合と、条件そのものを定義していない場合がInconclusiveになる例を挙げています。
- 解いている問題と前提：自動判定で白黒がつかないときに、配信を止めつつ、失敗扱いにもしない状態が必要だという前提です。
- 必要な入力：pauseからの再開またはabortを、誰が操作するか。
- trade-off・失敗の仕方：コメント（行178–187）は、Inconclusiveの後にAnalysisRunを作り直す挙動が、上限に達したrunを成功に置き換える危険を持つことを示しています。
- 反例・適用しない場合：Flaggerには判定不能の型がありません。人の判断は、webhookの型（`confirm-promotion`等、P13-O08）で「先に止めておく」方式で入れます。
- 互換・非互換：P13-O04と一体です。P13-O06のblue-green手順のpre／post promotion analysisから呼ばれます。
- 限界：外部製品で人の判断に回す点があることは、HELIXでの人間decisionの範囲を決める根拠になりません（HELIXのauthority状態モデルは別の正本です）。

### P13-O06 blue-greenの2service（active／preview）とpre／post promotion analysis
- 出典：argo-rollouts、`docs/features/bluegreen.md` 行5–12、77–93（https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/docs/features/bluegreen.md#L77-L93 、https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/docs/features/bluegreen.md#L5-L12）。信頼性ラベル：primary。本文確認：済（実装`rollout/bluegreen.go`は行範囲を特定していないため、引用していません）
- 何をしているか：
  - 構成：`activeService`（本番traffic）と`previewService`（検証用）の2つのserviceのselectorを、ReplicaSetのhashに差し替えて切り替えます。
  - 手順：新revisionのReplicaSetを作り、previewに向けます。全podが利用可能になった後に`prePromotionAnalysis`を走らせます。`autoPromotionEnabled`がfalseならpauseします。activeを新revisionに切り替えた後に`postPromotionAnalysis`を走らせます。成功したらstableとし、待機時間の後に旧ReplicaSetを縮退させます。
  - 縮退を遅らせる理由：selectorの変更がnodeへ伝播するのに遅延があり、その間に旧podへtrafficが流れるため、と明記されています（行12）。
- 解いている問題と前提：trafficを段階的に分けられないservice meshなしの環境でも、切替と即時の戻しをできるようにすることです。新旧を同時に全量起動できるだけの容量があることが前提です（`previewReplicaCount`で縮小は可能）。
- 必要な入力：2つのservice。promotionを自動にするか手動にするか。pre／post analysisのtemplate。
- trade-off・失敗の仕方：切り替えは一括で、trafficの割合を段階的に変えません。post-promotion analysisの失敗はabortになります（P13-O05のメッセージ分岐）。伝播遅延の間は新旧が混在します。
- 反例・適用しない場合：Flaggerのblue-greenは別のモデルです。`analysis.iterations`があってmatchがない場合をblue-greenとみなし、primary（安定版のコピー）とcanary（対象）の間で全traffic切替またはmirrorを行います（`pkg/controller/scheduler.go` 行682–750）。
- 互換・非互換：P13-O05、P13-O07と組み合わさります。
- 限界：待機時間の値は持ち込みません。

### P13-O07 traffic制御の差し替え境界（routerやreconcilerのinterfaceとplugin化）
- 出典：
  - argo-rollouts、`rollout/trafficrouting/trafficroutingutil.go` 行8–24（https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/rollout/trafficrouting/trafficroutingutil.go#L8-L24）
  - argo-rollouts、`docs/features/traffic-management/index.md` 行1–21（https://github.com/argoproj/argo-rollouts/blob/ce554d91bd34cc71dc6b5f00f838570e0ef21d85/docs/features/traffic-management/index.md#L1-L21）
  - flagger、`pkg/router/router.go` 行24–29（https://github.com/fluxcd/flagger/blob/c781cdc199d44cf84e21e90aedd8ff14c1df450e/pkg/router/router.go#L24-L29）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Argo Rollouts：`TrafficRoutingReconciler`は`UpdateHash`、`SetWeight`、`SetHeaderRoute`、`SetMirrorRoute`、`VerifyWeight`、`RemoveManagedRoutes`、`Type`を持ちます。`VerifyWeight`は、検証できない場合にnilを返す三値です。docsは、traffic制御の手法を割合、header routing、mirrorの3つに分けています。新しいtraffic managerはcoreに受け付けず、pluginとして作ることを求めています（行17–19）。
  - Flagger：`router.Interface`は`Reconcile`、`SetRoutes(primaryWeight, canaryWeight, mirrored)`、`GetRoutes`、`Finalize`の4つだけです。重みは常にprimaryとcanaryの2者間です。
- 解いている問題と前提：mesh、ingress、gateway製品ごとの違いを、配信の判断loopから切り離すことです。Kubernetes標準のServiceでは割合制御ができない、という前提をdocsが明記しています（行13–15）。
- 必要な入力：使うtraffic providerと、それが割合、header、mirrorのどれに対応するか。
- trade-off・失敗の仕方：Argo Rolloutsは、反映を確認するメソッドを明示していますが、未対応ならnilになります。core contributionの受け付けを止めた理由として「coreを安定かつ最小に保つ」ことを挙げています（行17–19）。Flaggerはinterfaceが小さい代わりに、追加の行き先（多者間の重み）を表現しません。また、kubernetes providerではA/Bと段階的なtraffic増加ができず、警告を出して設定を書き換えます（scheduler.go 行470–479）。
- 反例・適用しない場合：Argo Rolloutsのblue-green（P13-O06）は、このinterfaceを使わずserviceのselectorで切り替えます。
- 互換・非互換：P13-O06、P13-O08と組み合わさります。
- 限界：K8s特有のinterfaceです。HELIXの配置方式に同じ境界が要るかどうかは、観察からは言えません。

### P13-O08 失敗checkの単一counterと閾値rollback、分析設定からの方式推定、webhook型による段階gate
- 出典：
  - flagger、`pkg/controller/scheduler.go` 行368–378、428–469、482–505、752–776（`runAnalysis`）、948–997（https://github.com/fluxcd/flagger/blob/c781cdc199d44cf84e21e90aedd8ff14c1df450e/pkg/controller/scheduler.go#L428-L505 、https://github.com/fluxcd/flagger/blob/c781cdc199d44cf84e21e90aedd8ff14c1df450e/pkg/controller/scheduler.go#L752-L776 、https://github.com/fluxcd/flagger/blob/c781cdc199d44cf84e21e90aedd8ff14c1df450e/pkg/controller/scheduler.go#L948-L997）
  - flagger、`pkg/controller/scheduler_metrics.go` 行316–344（https://github.com/fluxcd/flagger/blob/c781cdc199d44cf84e21e90aedd8ff14c1df450e/pkg/controller/scheduler_metrics.go#L316-L344）
  - flagger、`pkg/apis/flagger/v1beta1/canary.go` 行411–431、693–711（https://github.com/fluxcd/flagger/blob/c781cdc199d44cf84e21e90aedd8ff14c1df450e/pkg/apis/flagger/v1beta1/canary.go#L411-L431 、https://github.com/fluxcd/flagger/blob/c781cdc199d44cf84e21e90aedd8ff14c1df450e/pkg/apis/flagger/v1beta1/canary.go#L693-L711）
  - flagger、`pkg/apis/flagger/v1beta1/status.go` 行38–68（https://github.com/fluxcd/flagger/blob/c781cdc199d44cf84e21e90aedd8ff14c1df450e/pkg/apis/flagger/v1beta1/status.go#L38-L68）
  - flagger、`docs/gitbook/usage/how-it-works.md` 行76–84、338–385（https://github.com/fluxcd/flagger/blob/c781cdc199d44cf84e21e90aedd8ff14c1df450e/docs/gitbook/usage/how-it-works.md#L338-L385）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 単一counter：`runAnalysis`（scheduler.go 行752–776）は、rollout型のwebhook、組込みmetric、custom metricの順に判定し、1つでも不合格ならfalseを返します。不合格になる理由は、query失敗、`ErrNoValuesFound`（値なし）、閾値外、template取得失敗のいずれもありえます。結果はすべて`Status.FailedChecks`に1を加えるだけです。値なしと計測失敗は、eventの文言（warningかerrorか）だけで区別しています。
  - rollback：`FailedChecks`が`GetAnalysisThreshold()`以上になるか、progress deadlineを超えて再試行できない状態になると、`rollback`を呼びます。`rollback`は、全trafficをprimaryに戻し、canaryを0台に縮退させ、phaseをFailedにし、failure metricを加算し、post-rollout hookを呼びます。
  - 方式の推定：`DeploymentStrategy()`は、分析設定の形から方式を決めます。matchとiterationsがあればA/B、iterationsだけならblue-green、どちらもなければcanaryです。
  - 安定版の扱い：対象deploymentとは別に`-primary`のコピーを生成し、primaryを安定版として扱います。promotionでは対象のspecをprimaryへcopyします（how-it-works.md 行76–84）。
  - webhook型：`HookType`はpre-rollout、rollout、confirm-rollout、confirm-promotion、confirm-traffic-increase、post-rollout、rollback、eventです。HTTP応答によって、前進、停止、rollbackを外部から制御します。進行中のphaseでrollback hookが成立するとrollbackします（scheduler.go 行368–378）。
  - phase：Initializing、Initialized、Waiting、Progressing、WaitingPromotion、Promoting、Finalising、Succeeded、Failed、Terminating、Terminatedの11値です。
- 解いている問題と前提：設定を最小にし、1本の閾値でrollbackを決めることです。canaryに常にtrafficがあることを前提にしています（値なしの場合は「traffic未着の可能性」と表示する、scheduler_metrics.go 行155–158）。
- 必要な入力：分析の間隔、失敗回数の閾値、metric template、webhookの宛先。
- trade-off・失敗の仕方：
  - 値なしも失敗として数えるため、trafficがない環境では前進できません。issue #1353（https://github.com/fluxcd/flagger/issues/1353 、open）は「trafficがない状態でdeployを成功させたい」という要望です。同じ症状の報告がissue #1365、#1401、#1633、#1689（いずれもopen）にあります。
  - 失敗の原因は型としては残らず、eventの文言でしか判別できません。
- 反例・適用しない場合：Argo Rollouts（P13-O04）は、計測失敗をError、判定不能をInconclusiveとして、Failedとは別に数えます。
- 互換・非互換：P13-O07とは同じrepo内で組み合わさります。P13-O04とは失敗モデルが衝突します（同じ制御面に両方を混ぜると、失敗の数え方が食い違います）。
- 限界：閾値と間隔の値は持ち込みません。kubernetes providerに切り替えたときにiterationsを補う値も持ち込みません。

### P13-O09 故障の型（Kind×Action）と、注入／回復を対にしたrecord状態機械、step順序の不変条件
- 出典：
  - chaos-mesh、`api/v1alpha1/common_types.go` 行36–128（https://github.com/chaos-mesh/chaos-mesh/blob/93359158e54a444fb822d5ad64d30436263089a0/api/v1alpha1/common_types.go#L36-L128）
  - chaos-mesh、`controllers/chaosimpl/types/types.go` 行26–29（https://github.com/chaos-mesh/chaos-mesh/blob/93359158e54a444fb822d5ad64d30436263089a0/controllers/chaosimpl/types/types.go#L26-L29）
  - chaos-mesh、`controllers/common/records/controller.go` 行123–172（https://github.com/chaos-mesh/chaos-mesh/blob/93359158e54a444fb822d5ad64d30436263089a0/controllers/common/records/controller.go#L123-L172）
  - chaos-mesh、`controllers/README.md` 行37–79（https://github.com/chaos-mesh/chaos-mesh/blob/93359158e54a444fb822d5ad64d30436263089a0/controllers/README.md#L37-L79）
  - chaos-mesh、`controllers/common/pipeline/README.md` 行1–45（https://github.com/chaos-mesh/chaos-mesh/blob/93359158e54a444fb822d5ad64d30436263089a0/controllers/common/pipeline/README.md#L1-L45）
  - chaos-mesh、`api/v1alpha1/podchaos_types.go` 行43–64、`api/v1alpha1/networkchaos_types.go` 行49–73（https://github.com/chaos-mesh/chaos-mesh/blob/93359158e54a444fb822d5ad64d30436263089a0/api/v1alpha1/podchaos_types.go#L43-L64 、https://github.com/chaos-mesh/chaos-mesh/blob/93359158e54a444fb822d5ad64d30436263089a0/api/v1alpha1/networkchaos_types.go#L49-L73）
  - chaos-mesh、`api/v1alpha1/statuscheck_types.go` 行43–58、`api/v1alpha1/workflow_types.go` 行118–121
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 故障の型：故障の領域ごとにCRDのKindを分けています（PodChaos、NetworkChaos、IOChaos、StressChaos、TimeChaos、DNSChaos、HTTPChaos、JVMChaos、KernelChaos、各cloud用等。`api/v1alpha1/`のファイル一覧で確認）。各Kindの中で、Actionをenumで固定しています。例はPodChaosのpod-kill、pod-failure、container-killと、NetworkChaosのnetem、delay、loss、duplicate、corrupt、partition、bandwidthです。
  - 実装の契約：各実装は`ChaosImpl`の`Apply`と`Recover`の2つだけを実装し、1つの対象についてphaseを返します。
  - 状態の持ち方：stateは`DesiredPhase`（Run／Stop）と、対象ごとの`Record`（Phase、InjectedCount、RecoveredCount、Events）です。Recordのphaseは「Not Injected」「Injected」と、中間状態（接尾辞付き）で表します。
  - 一方向の循環：records controllerは「Not Injected → Not Injected/* → Injected → Injected/* → Not Injected」の循環を一方向にだけ進めます。中間状態から逆向きに戻ることを禁止しています（行123–126）。
  - 失敗の記録：ApplyやRecoverの失敗は、`RecordEvent`（Type=Failed、Operation=Apply／Recover、message、timestamp）として、件数上限付きでrecordに積みます。そのうえで再試行を要求します。
  - 書き手の分担：controllers/README.mdは「one writer per field」を規則にしています。desiredphase、condition、records、finalizersがそれぞれのfieldを所有します。
  - step順序：pipeline/README.mdは、finalizer初期化 → desiredPhase → condition → records → finalizer cleanupの順序を不変条件として明記しています。
  - 打ち切り：StatusCheck（HTTP、Synchronous／Continuous、連続失敗の閾値）と、workflowの`abortWithStatusCheck`で、実験の打ち切りを宣言します。
- 解いている問題と前提：注入した故障を必ず回復させることです。issue #2449（https://github.com/chaos-mesh/chaos-mesh/issues/2449 、closed）では、finalizerを付ける前にCRを削除すると、注入した故障が回復されずに残りました。controllerを別々に登録していると、informerの配送順で不正な遷移が起きる、というのが原因です（pipeline/README.md 行3）。
- 必要な入力：対象を選ぶselector。Action。duration。pause状態。中断条件（StatusCheck）。
- trade-off・失敗の仕方：
  - Apply／Recoverの失敗にbackoffはありません（`TODO: add backoff and retry mechanism`、行158、194）。
  - pipeline/README.mdによると、途中のstepを無効にすると、それ以降のstepがすべて抜け落ちます（行42–45）。
  - controller-runtimeの戻り値の契約（再試行するerror、RequeueAfter、TerminalError）を明文化しています（controllers/README.md 行70–79）。
- 反例・適用しない場合：Argo RolloutsやFlaggerは、故障を「起こす」のではなく、劣化を「判定する」側です。注入と回復を対にする構造は持ちません。
- 互換・非互換：P13-O10と組み合わせると、故障の注入とalertの発火で検知を確かめる構成になりえます（観察した範囲では、両者を結ぶ実装は確認していません）。
- 限界：件数の上限、閾値、間隔の値は持ち込みません。

### P13-O10 alert状態機械（inactive／pending／firing）と、評価失敗（rule health）の分離
- 出典：
  - prometheus、`rules/alerting.go` 行55–66、381–383、483–548、553–560（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/rules/alerting.go#L483-L548 、https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/rules/alerting.go#L55-L66）
  - prometheus、`rules/rule.go` 行31–33（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/rules/rule.go#L31-L33）
  - prometheus、`rules/group.go` 行538–553（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/rules/group.go#L538-L553）
  - prometheus、`docs/configuration/alerting_rules.md` 行35–46、94–120（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/docs/configuration/alerting_rules.md#L35-L46）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - alert状態：`AlertState`はUnknown（未評価）、Inactive、Pending、Firingの4値です。
  - 状態遷移：式の結果に要素が現れるとPendingにします。`for`（holdDuration）を超えて続くとFiringにします。結果から消えると、`keep_firing_for`の間はFiringを維持し、その後Inactiveにします。Firingのalertで、`ActiveAt`からの経過時間が新しい`for`（holdDuration）より短い場合は、Pendingに戻します（行531–537）。resolveしたalertは、一定期間保持して再送します（行496–515のコメントに理由があります）。
  - rule単位の状態：`State()`は、rule内の最大の状態（Firing＞Pending＞Inactive＞Unknown）を返します。
  - 評価失敗の分離：評価そのものが失敗した場合は、alert状態を変えません。`RuleHealth`をerr（ok／unknownと並ぶ値）にし、`LastError`を記録し、`rule_evaluation_failures_total`を加算します。span statusもErrorにします（group.go 行538–544）。
  - 責務の分担：docsは、alert ruleが「何が今壊れているか」を表し、要約、抑制、通知はAlertmanagerという別の層が担う、と分けています（行106–115）。PendingとFiringの状態は、合成時系列`ALERTS{alertstate=...}`として観測可能にしています（行94–104）。
- 解いている問題と前提：
  - 一時的なspikeによる誤発火を`for`で抑えます。データ欠損でalertが早く「resolved」になることを`keep_firing_for`で抑えます。
  - PR #11827（https://github.com/prometheus/prometheus/pull/11827 、merged）の本文は、2本のPromQLを使う案より単純なので`keep_firing_for`を選んだ、と述べています。動機はissue #11570（https://github.com/prometheus/prometheus/issues/11570）で、データ欠損時に式が空を返して誤ってresolveされ、on-call担当者を混乱させる問題です。
- 必要な入力：alert式。保持期間（for／keep_firing_for）。通知の層（Alertmanager）。
- trade-off・失敗の仕方：
  - 式が空を返すことは「異常なし」と区別されません。そのため、データ欠損は保持期間でしか吸収できません（#11570の問題設定）。
  - 上限を超えると、active alertを全部破棄してerrorを返します（行545–548）。
  - resolveの保持期間はcode内の定数です（値は持ち込みません）。
- 反例・適用しない場合：Flagger（P13-O08）は、値なしを失敗として数えます。Argo Rollouts（P13-O04）は、条件が当てはまらない場合をInconclusiveにします。「値がない」の扱いがrepoごとに3通りに分かれています。
- 互換・非互換：P13-O02（評価失敗をspan statusに記録する実例）、P13-O09と組み合わさります。
- 限界：保持期間などの値は持ち込みません。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 計測失敗と劣化判定を区別するか | Argo Rollouts：Error（連続error上限）とFailed（failureLimit）とInconclusiveを、別の型・別のcounterにする（P13-O04） | Flagger：query失敗、値なし、閾値外、webhook失敗をすべて`FailedChecks`の1つのcounterに数え、違いはevent文言だけ（P13-O08） | Argoは複数providerと人の介在を想定し、Flaggerは設定を最小にして閾値1本でrollbackを決める |
| 「値がない」の扱い | Prometheus：式の結果が空ならalertは消える。誤resolveは`keep_firing_for`で緩和する（P13-O10） | Flagger：`ErrNoValuesFound`で前進を止め、失敗checkとして数える（issue #1353等） | Prometheusは「今壊れているもの」の検知、Flaggerは「trafficが流れていることを前提にした配信判定」 |
| 判定不能を誰に渡すか | Argo Rollouts：Inconclusiveの型を作り、rolloutをpauseして人が再開かabortを選ぶ（P13-O05） | Flagger：判定不能の型を持たない。confirm系のwebhookで、事前に人や外部の承認を待つgateを置く（P13-O08） | 結果を見た後で人に渡すか、進める前に外部の承認を挟むか |
| blue-greenの切替単位 | Argo Rollouts：active／previewの2serviceのselectorをReplicaSetのhashに差し替える（P13-O06） | Flagger：`-primary`のコピーとcanaryの間で、routerにより全量切替またはmirror。iterationsの有無で方式を推定する（P13-O06反例、P13-O08） | Argoは独自のworkload型（Rollout）を持ち、Flaggerは既存のDeploymentを対象にして安定版のコピーを生成する |
| traffic制御の抽象 | Argo Rollouts：hash、weight、header、mirror、検証、managed routeの7メソッド。新providerはpluginのみ（P13-O07） | Flagger：Reconcile、SetRoutes、GetRoutes、Finalizeの4メソッド。重みはprimaryとcanaryの2者間（P13-O07） | 多者間の行き先と反映の確認が要るか |
| 失敗の分類キー | OTel：低cardinalityの`error.type`と`_OTHER`のfallbackを、spanとmetricで同じ値にそろえる（P13-O02） | Chaos Mesh：故障側の型を、Kind×Actionのenumで宣言する（P13-O09） | 観測側の分類（起きた失敗）か、注入側の分類（起こす故障）か |
| 状態の多重書込みの防止 | Chaos Mesh：fieldごとに書き手を1つにし、step順序を不変条件として明文化（P13-O09） | Argo Rollouts：AnalysisRunのphaseをcontrollerが集約し、rolloutはphaseを読んでpauseかabortを決める（P13-O05） | 独立したcontroller群の配送順の問題（#2449）を経験したかどうか |

## 見つからなかったこと・gap
- failureの型を、repoをまたいで共通にしたtaxonomy（故障の型、検知の型、判定の型を対応づけたもの）は、どのrepoにもありませんでした。対応づけは本記録の比較表が初出です（未評価）。
- OTelのsemantic conventionには、配信（deployment、rollout、canary）の成否を表す属性群があるかを詳しく確かめていません。`model/deployment`ディレクトリがあることだけは確認しています。
- Argo Rolloutsの`rollout/bluegreen.go`と`rollout/canary.go`の実装の行範囲、およびSLOやerror budgetに基づく判定は読んでいません。Prometheusの`docs/`には、SLOについての記述がありませんでした（詳細な検索はしていません）。
- Chaos Meshの故障注入の結果を、配信判定（Argo／Flagger）やalert（Prometheus）に結ぶ実装は確認していません。
- Litmus（ChaosEngine、probeのverdict）とは比較していません。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- semantic-conventions：`docs/general/attribute-requirement-level.md`（全文）、`docs/general/recording-errors.md`（全文）、`model/error/registry.yaml` 行1–60、`model/error/deprecated/registry-deprecated.yaml`、`docs/http/README.md` 行1–47。ディレクトリ一覧として`docs/`、`docs/general`、`docs/how-to-write-conventions`、`docs/non-normative`、`model/`を確認しました。`OTEL_SEMCONV_STABILITY_OPT_IN`をgrepしました。`docs/exceptions/*`、`naming.md`、`status-metrics.md`の本文と、移行guideは読んでいません。
- argo-rollouts：`pkg/apis/rollouts/v1alpha1/analysis_types.go` 行200–230、`analysis/analysis.go`（関数一覧と、行436–689）、`utils/analysis/helpers.go` 行40–80、`rollout/analysis.go` 行140–193、`docs/features/analysis.md`（見出しと、行861–880、1158–1190）、`docs/features/bluegreen.md`（見出しと、行77–95）、`rollout/trafficrouting/trafficroutingutil.go` 行8–24、`docs/features/traffic-management/index.md` 冒頭。issue #2250（本文）を読みました。#2866は本文が空のため引用していません。`gh search issues "inconclusive"`の結果一覧を確認しています。
- flagger：`pkg/controller/scheduler.go`（関数一覧と、行360–505、682–790、948–1003。`runAnalysis` 行752–776はこの範囲に含まれる）、`pkg/controller/scheduler_metrics.go`（行140–165、260–352）、`pkg/router/router.go`、`pkg/apis/flagger/v1beta1/canary.go`（定数一覧と、行405–431、693–711）、`pkg/apis/flagger/v1beta1/status.go` 行38–68、`docs/gitbook/usage/how-it-works.md`（行74–92、338–400）。`gh search issues "no values found"`の結果一覧と、#1353の本文を読みました。#1365、#1401、#1633、#1689はtitleだけで、本文は読んでいません。`deployment-strategies.md`と`webhooks.md`は読んでいません。
- chaos-mesh：`controllers/README.md` 行1–80、`controllers/common/pipeline/README.md` 行1–45、`api/v1alpha1/common_types.go` 行36–130、`controllers/chaosimpl/types/types.go` 行26–34、`controllers/common/records/controller.go` 行120–175（状態遷移とApply失敗の分岐）、`podchaos_types.go` 行40–72、`networkchaos_types.go`（Actionの定数）、`statuscheck_types.go` 行30–108、`workflow_types.go` 行112–122。issue #2449の本文を読みました。各Kindの実装（`chaosimpl/*`）、chaos daemon、docs siteは読んでいません。
- prometheus：`rules/alerting.go`（定数、関数一覧、行380–400、480–560）、`rules/rule.go` 行31–33、`rules/group.go` 行530–556、`docs/configuration/alerting_rules.md` 行30–120。PR #11827の本文とissue #11570の本文を読みました。Alertmanagerのrepositoryは読んでいません。
- litmuschaos/litmusは、gh apiの呼出し量の都合とChaos Meshとの重複を考えて選びませんでした。読んでいません。
- 前回（P01〜P07）のrepositoryは使っていません。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：全観察が外部OSSの一次資料（公式source repositoryのcodeとdocs、および公式issueやPR）です。旧HELIXのsourceとの対応は確認していません。HELIXBRAIN-L2-INFRA-005／007／009の旧HELIX側の根拠と照合するのは未実施です。
- scope：O01〜O03はtelemetryの意味規約（HELIXBRAIN-L2-INFRA-009）です。O04、O05、O08、O10は失敗と判定の構造（005）です。O06、O07はdeploymentの方式（007）です。O09は005と007の両方にかかります。どの層や対象に効く知識かは未決です。
- 評価根拠：未評価です。外部での採用実績や挙動は、HELIXでの成立を意味しません（HELIXBRAIN-L2-026／027の経路で扱う事項です）。
- 版：各観察は上表の固定commitに対するものです。semantic-conventionsの`recording-errors.md`はStatusがDevelopmentで、stableではありません。
- 状態：すべて「未評価の候補素材」です。HELIX-BRAINへの登録と採否は行っていません。閾値、時間、件数などの製品固有の値は、記録にも持ち込んでいません。
