# P04 Scaling・DR・費用の観察（D07 Infrastructure、HELIXBRAIN-L2-INFRA-005/006/008/010/011）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| kubernetes/autoscaler | https://github.com/kubernetes/autoscaler | 743cf902a6f761dd115280a3d2dfea6f4796e381（master） | Apache-2.0 | false | 2026-10-04 | node容量のautoscaling（Cluster Autoscaler設計文書）と、resource推奨・適用の分離（VPA） |
| kedacore/keda | https://github.com/kedacore/keda | 57d70084ea701e58294256c4ec59511e528ddd46（main） | Apache-2.0 | false | 2026-10-04 | 外部metricから決定までの流れ、0↔1の活性化、metric障害時のfallback |
| vitessio/vitess | https://github.com/vitessio/vitess | fb653f2727a2afabe18e2b81999ba4ae69213b37（main） | Apache-2.0 | false | 2026-10-04 | sharding・resharding、協調型backpressure（throttler）、failover規則（ERS設計文書） |
| cloudnative-pg/cloudnative-pg | https://github.com/cloudnative-pg/cloudnative-pg | 887bffe481a37c198a2f7c6cb9023b415faad515（main） | Apache-2.0（docs/src は各fileに CC-BY-4.0 のSPDX表記あり） | false | 2026-10-04 | backup／restore／PITR、自動failover、quorum failover、cluster間DR |
| opencost/opencost | https://github.com/opencost/opencost | 2b3962dc51040d79c860de4eadb0afb102cdce27（develop） | Apache-2.0 | false | 2026-10-04 | 費用配分モデル（spec）と、配分を計算するpipeline |

注：kubernetes/autoscaler の固定commitでは、Cluster Autoscaler の core（scale-down・expander の実装）がこのrepositoryにありません。`cluster-autoscaler/main.go` は `sigs.k8s.io/cluster-autoscaler/pkg/core` 等を import しています（別repository kubernetes-sigs/cluster-autoscaler、未読）。このため CA は同repoの設計文書 `cluster-autoscaler/FAQ.md` と API型を根拠にしました。

## 観察

### P04-O01 活性化（0↔1）と規模決定（1↔N）を別の部品に分ける
- 出典：kedacore/keda、`pkg/scaling/executor/scale_scaledobjects.go` 行37–128（https://github.com/kedacore/keda/blob/57d70084ea701e58294256c4ec59511e528ddd46/pkg/scaling/executor/scale_scaledobjects.go#L37-L128）、同 行197–250（https://github.com/kedacore/keda/blob/57d70084ea701e58294256c4ec59511e528ddd46/pkg/scaling/executor/scale_scaledobjects.go#L197-L250）、`apis/keda/v1alpha1/scaledobject_types.go` 行99–168（https://github.com/kedacore/keda/blob/57d70084ea701e58294256c4ec59511e528ddd46/apis/keda/v1alpha1/scaledobject_types.go#L99-L168）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：`scaleExecutor.RequestScale` は、trigger が active か（`isActive`）とerrorがあるか（`isError`）を受け取り、switch で場合分けします。KEDA自身が行うのは 0（または `IdleReplicaCount`）と最小値のあいだの移動（`scaleFromZeroOrIdle`／`scaleToZeroOrIdle`）だけです。コメントは「HPA will handle other scale in operations」と書いており、1↔N は HPA に任せています。HPAの安定化設定（`HorizontalPodAutoscalerBehavior`）は `AdvancedConfig.HorizontalPodAutoscalerConfig.Behavior` を通じて HPA にそのまま渡します。0へ縮める判断には `LastActiveTime` と `CooldownPeriod`／`InitialCooldownPeriod` を使い、cooldown 中は `ScalerCooldown` を condition に記録します。
- 解いている問題と前提：イベント駆動の負荷（queue等）で 0 まで縮めたい一方、HPA は 0 replica で自分を無効化します（`getHPAHealth` のコメント 行146–157）。Kubernetes の scale subresource と HPA があることが前提です。
- 必要な入力：trigger の定義、最小・最大・idle の replica 数、cooldown の長さ、HPA behavior（stabilization 等）。
- trade-off・失敗の仕方：外部から scale されて `LastActiveTime` が nil の場合は cooldown を無視して縮めます（行220–221のコメント）。trigger の一部だけが error のときは `PartialTriggerError` で Ready を Unknown にし、scale しません（行81–84）。issue #7488（https://github.com/kedacore/keda/issues/7488、closed）では、0 へ縮めても以前の Fallback condition が残り、GitOps 側から失敗に見えたことが報告されています。
- 反例・適用しない場合：VPA（O03）は台数ではなく1台あたりの資源量を変えます。CA（O04）は pod ではなく node を扱い、0↔1 のような活性化の段を持ちません。
- 互換・非互換：O02（fallback）と組み合わさります。O03 と同じ resource に同時に掛けた場合の扱いは今回読んだ範囲には出てきません。
- 限界：polling 間隔、cooldown、既定の最小・最大値は持ち込みません。

### P04-O02 metric取得に失敗したとき、決定器に代わりの入力を渡す（fallback）
- 出典：kedacore/keda、`pkg/fallback/fallback.go` 行114–174（https://github.com/kedacore/keda/blob/57d70084ea701e58294256c4ec59511e528ddd46/pkg/fallback/fallback.go#L114-L174）、行242–317（https://github.com/kedacore/keda/blob/57d70084ea701e58294256c4ec59511e528ddd46/pkg/fallback/fallback.go#L242-L317）、`apis/keda/v1alpha1/scaledobject_types.go` 行131–141・400–424（https://github.com/kedacore/keda/blob/57d70084ea701e58294256c4ec59511e528ddd46/apis/keda/v1alpha1/scaledobject_types.go#L131-L141）、`scale_scaledobjects.go` 行93–104。信頼性ラベル：primary。本文確認：済
- 何をしているか：`GetMetricsWithFallback` は metric ごとの連続失敗回数を status の `Health` に数えます（`IncrementFailure`）。成功すると回数を0に戻します。回数が `FailureThreshold` を超えると `doFallback` が動き、`Behavior`（`static`／`currentReplicas`／`currentReplicasIfHigher`／`currentReplicasIfLower`／`scalingModifiers`）に従って目標 replica 数を決めます。その数に metric の target 値を掛けた「合成metric値」を返すため、replica 数を直接書かずに HPA の計算式を通して目標 replica 数を得させる、という間接的な形です。`Value` 型の metric では ready replica 数で割ってから合成します。
- 解いている問題と前提：metric の取得元が落ちたとき、scale を止めたままにするか、決めた水準で運転を続けるかを選ばせます。HPA が external metric を target で割って replica 数を出す、という計算式が前提です。
- 必要な入力：失敗閾値、fallback 時の replica 数、どの振る舞いにするか、metric の target の種類（`AverageValue` か `Value` か）。
- trade-off・失敗の仕方：`CheckFallbackValid` は、cpu／memory の trigger だけの場合は fallback を拒否します（行400–424）。`Value` 型で ready replica が0なら fallback できず、error になります（行273–285付近）。executor 側には、minReplicas が0のとき 0 に縮めると HPA が fallback 値まで上げられなくなるため、わざと縮めない case があります（`scale_scaledobjects.go` 行93–99 のコメント）。issue #8056（https://github.com/kedacore/keda/issues/8056、open）は、scaler に接続できず `GetMetricSpec` の段階で失敗すると失敗回数が増えず、fallback が発火しない構造的な穴を報告しています。
- 反例・適用しない場合：VPA は履歴がないときに推奨の上限・下限を無限大や0に寄せ、強制的な変更を抑えます（O03）。安全側に倒す向きが KEDA と逆です。
- 互換・非互換：O01 と組み合わさります。`scalingModifiers` の振る舞いでは、placeholder の値を式の nil として扱わせます（行144–153）。
- 限界：閾値や fallback 時の replica 数は持ち込みません。

### P04-O03 推奨（下限・目標・上限の3値）と適用判断を分け、範囲外になったときだけ動かす
- 出典：kubernetes/autoscaler、`vertical-pod-autoscaler/pkg/recommender/logic/recommender.go` 行130–190（https://github.com/kubernetes/autoscaler/blob/743cf902a6f761dd115280a3d2dfea6f4796e381/vertical-pod-autoscaler/pkg/recommender/logic/recommender.go#L130-L190）、`estimator.go` 行26–160（同repo同commit `vertical-pod-autoscaler/pkg/recommender/logic/estimator.go#L26-L160`）、`pkg/updater/priority/update_priority_calculator.go` 行128–152（`.../update_priority_calculator.go#L128-L152`）、`pkg/updater/priority/priority_processor.go` 行47–95、`pkg/updater/restriction/pods_eviction_restriction.go` 行35–76。信頼性ラベル：primary。本文確認：済
- 何をしているか：recommender は `ResourceEstimator` を decorator のように重ねて組み立てます。percentile 推定（`NewPercentileCPUEstimator`）に安全余裕（`WithCPUMargin`）を掛け、さらに履歴の長さに応じた信頼度係数（`WithCPUConfidenceMultiplier`）を掛けます。これを Target／LowerBound／UpperBound の3系統で別々に作ります。updater は、pod の現在の request が LowerBound と UpperBound の範囲外のとき（`OutsideRecommendedRange`）、または短時間で OOM が起きたときだけ更新します。範囲内なら、pod が一定以上の時間動いていて、差分も一定以上ある場合に限ります。実際の eviction は `PodsEvictionRestriction.CanEvict` が replica 群ごとの許容数で絞ります。
- 解いている問題と前提：推奨値が揺れるたびに再起動が起きるのを防ぎます（範囲によるヒステリシス）。履歴の短い pod に強い変更を掛けないため、コメントは「履歴なしなら上限は無限大、下限は0」と説明しています。資源使用量の履歴（histogram）を持っていることが前提です。
- 必要な入力：percentile、安全余裕、信頼度の係数と指数、更新を許す最小の差分と最小の稼働時間、eviction の許容割合。
- trade-off・失敗の仕方：短時間の OOM でも resource が変わらなければ evict しません（行149–152）。`StartTime` がない pod は更新しません（TODO として残っています）。replica 数が最小値を下回る群は evict しません（`belowMinReplicas`）。
- 反例・適用しない場合：KEDA や HPA は台数を変えるもので、1台の再起動を伴いません。CA は「unneeded 状態が続いた時間」で安定させ、範囲による帯は使いません（O04）。
- 互換・非互換：O04（CA）とは、VPA が request を増やせば CA の scale-up 信号（unschedulable）になる、という形でつながります。
- 限界：percentile、余裕、係数、時間の値（コメントにある具体値を含む）は持ち込みません。

### P04-O04 node容量：需要信号（置けないpod）からの模擬配置、拡張先選択の戦略差し替え、全条件と継続時間による縮小
- 出典：kubernetes/autoscaler、`cluster-autoscaler/FAQ.md` 行783–819（scale-up、https://github.com/kubernetes/autoscaler/blob/743cf902a6f761dd115280a3d2dfea6f4796e381/cluster-autoscaler/FAQ.md#L783-L819）、行821–877（scale-down）、行944–975（Expanders）。信頼性ラベル：primary（公式repo内の設計文書。実装は別repoで未読）。本文確認：済
- 何をしているか：拡張は、scheduler が置けなかった pod（PodCondition が unschedulable）を信号にします。node group ごとに template node を作り、そこに pod が入るかを模擬します。複数の group が候補になると、expander（`random`／`most-pods`／`least-waste`／`least-nodes`／`price`／`priority`）で1つを選びます。縮小は、使用率が閾値未満、全 pod が他へ移せる、無効化の annotation がない、という条件がすべて成り立ち、その状態が一定時間続いた node を対象にします。非空 node は1台ずつ消し、空の node はまとめて消します。
- 解いている問題と前提：同じ group の machine は同じ容量と label を持つ、という前提で模擬配置を簡略化しています（文書もそう書いています）。node の登録は CA の責務外と明記しています。
- 必要な入力：node group の定義、拡張先の選択戦略、縮小の使用率閾値と継続時間、移せない pod の種類。
- trade-off・失敗の仕方：模擬は実際の scheduler より単純で、全 pod が置かれるまで何度か反復が要ることがあります。シナリオ例（行866–877）では、A を消して pod を X へ移すと、同じ X を移動先にしていた B は条件を満たさなくなることがあると説明しています。依存のない C は続けて消せます。node が規定時間内に登録されなければ、模擬の対象から外して別の group を試します。
- 反例・適用しない場合：KEDA や VPA は workload 側の調整器で、模擬配置を持ちません。
- 互換・非互換：O05（先行容量）と組み合わさります。O03 の request 変更が信号の発生源になります。
- 限界：scan 間隔、使用率閾値、継続時間、一度に消す台数は持ち込みません。

### P04-O05 低優先度の placeholder で先に容量を持っておく（overprovisioning／CapacityBuffer）
- 出典：kubernetes/autoscaler、`cluster-autoscaler/FAQ.md` 行427–442（https://github.com/kubernetes/autoscaler/blob/743cf902a6f761dd115280a3d2dfea6f4796e381/cluster-autoscaler/FAQ.md#L427-L442）、`cluster-autoscaler/apis/capacitybuffer/autoscaling.x-k8s.io/v1beta1/types.go` 行52–66・102–134（https://github.com/kubernetes/autoscaler/blob/743cf902a6f761dd115280a3d2dfea6f4796e381/cluster-autoscaler/apis/capacitybuffer/autoscaling.x-k8s.io/v1beta1/types.go#L102-L134）。信頼性ラベル：primary。本文確認：済
- 何をしているか：FAQ の方式では、低優先度の pause pod が容量を押さえておきます。本当の pod が来ると pause pod が preempt され、今度は pause pod が置けなくなるので CA の scale-up を引き起こします。`CapacityBuffer` CRD はこれを API にしたもので、`PodTemplateRef` と `ScalableRef` のどちらか一方で buffer 1単位の形を示し、`Replicas`／percentage／`limits` から buffer の量を決めます（最大を取ってから limits で上限を掛ける、とコメントにあります）。`ProvisioningStrategy` で使い方を切り替えます。
- 解いている問題と前提：node の起動が遅いため、反応型の scale-up だけでは急な負荷に間に合わない、という問題です。priority と preemption があることが前提です。
- 必要な入力：buffer 1単位の形、量の決め方（固定数か、cluster の大きさに比例か）、上限。
- trade-off・失敗の仕方：FAQ は、cluster の大きさに比例させるには別の部品（cluster-proportional-autoscaler）が要ると書いています。空き容量の費用は O10 の idle cost になります。
- 反例・適用しない場合：KEDA の 0 への縮小（O01）は、反対に空き容量をなくす方向です。
- 互換・非互換：O04 と組み合わさります。O10 では、この容量が配分対象（idle）として表に出ます。
- 限界：buffer の量は持ち込みません。

### P04-O06 協調型のbackpressure：利用側が throttler に問い合わせ、app ごとに比率・期限・除外を持つ
- 出典：vitessio/vitess、`doc/design-docs/ReplicationLagBasedThrottlingOfTransactions.md` 行1–47（https://github.com/vitessio/vitess/blob/fb653f2727a2afabe18e2b81999ba4ae69213b37/doc/design-docs/ReplicationLagBasedThrottlingOfTransactions.md#L1-L47）、`go/vt/vttablet/tabletserver/throttle/throttler.go` 行1287–1335（`IsAppThrottled`、https://github.com/vitessio/vitess/blob/fb653f2727a2afabe18e2b81999ba4ae69213b37/go/vt/vttablet/tabletserver/throttle/throttler.go#L1287-L1335）、`.../throttle/base/app_throttle.go` 行25–32、`.../throttle/check.go` 行126–222。信頼性ラベル：primary。本文確認：済（throttler は github/freno に由来すると file 冒頭に書かれています）
- 何をしているか：tablet throttler は replication lag や負荷の metric を集めて集約し、`Check(appName, scope, metricNames)` で利用側（vreplication、online DDL 等）からの問い合わせに答えます。`AppThrottle` は `Ratio`（0〜1の確率）、`ExpireAt`、`Exempt` を持ちます。`IsAppThrottled` は、app 名が一致する指示、`:` で区切った各部分の指示、特別な app `all` の指示、の順に判定します。期限切れの指示は無視します。別の仕組みである transaction throttler（設計文書）は、`BEGIN` の時点で lag に応じて rate limit を掛け、gRPC の `UNAVAILABLE` を返します。
- 解いている問題と前提：大量の書込みで replica の遅延が増えるのを、書き手の側で抑えます。設計文書は、COMMIT ではなく BEGIN で判定する理由を「大量の作業をしてから throttle され、rollback されるのを避ける」と書いています。
- 必要な入力：対象の metric と閾値、監視する cell や tablet 種別、app 名の体系、優先や除外の方針。
- trade-off・失敗の仕方：設計文書の「Caveats」は、最大の rate を探り続けるので上限を一時的に少し超えることがある、transaction の重さを区別しない、と書いています。throttler が disabled のときは、check に対して常に OK を返します（throttler.go 行540–541）。
- 反例・適用しない場合：KEDA や HPA は容量を増やして応えます。この throttler は容量を固定したまま、要求側を遅らせます。
- 互換・非互換：O07（resharding の copy・catchup 中の負荷）と同時に使う前提の設計です。
- 限界：lag の閾値や比率の値は持ち込みません。

### P04-O07 resharding：key range の被覆一致を検証し、書込み切替に「後戻りできない点」を置き、逆方向の複製を張る
- 出典：vitessio/vitess、`go/vt/vtctl/workflow/resharder.go` 行73–142（https://github.com/vitessio/vitess/blob/fb653f2727a2afabe18e2b81999ba4ae69213b37/go/vt/vtctl/workflow/resharder.go#L73-L142）、`go/vt/topotools/split.go` 行28–50（`ValidateForReshard`）、`go/vt/key/key.go` 行54–125、`go/vt/vtctl/workflow/server.go` 行3156–3463（`switchWrites`、https://github.com/vitessio/vitess/blob/fb653f2727a2afabe18e2b81999ba4ae69213b37/go/vt/vtctl/workflow/server.go#L3156-L3463）、`doc/design-docs/VTGateBuffering.md` 行1–60。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  1. `buildResharder` は、移行元の shard が serving で、移行先の shard が非 serving であることを確かめます。`ValidateForReshard` は、移行元と移行先に同じ key range がないこと、両側の range を `KeyRangeAdd` で隣接結合した結果が一致することを検証します。
  2. `switchWrites` は、移行元と移行先の両方の keyspace の lock を取ります。そのうえで、移行元の書込み停止 → stream 停止 → `LOCK TABLES`（MoveTables の場合）→ 位置の採取 → catchup 待ち → stream の移行 → sequence の再設定 → 逆方向 stream の作成、と進みます。journal を作る直前に「This is the point of no return」とコメントがあります（行3396–3397）。journal 作成の後は、移行先で書込みを許可し、routing rules を更新し、逆方向の workflow を開始し、workflow を freeze します。各段階で lock が保持されているかを再確認し、失敗すれば `cancelMigration` で戻します。
  3. VTGate は切替中の query を buffer し、keyspace が一貫した状態に戻ってから再試行します（設計文書）。
- 解いている問題と前提：書込みを止める時間を短くしつつ、データを失わず shard を分割・統合することです。GTID の位置と topo の lock service があることが前提です。
- 必要な入力：sharding key（vindex）と key range の割当、移行元と移行先の shard 構成、catchup を待つ上限時間、逆方向の複製を張るかどうか。
- trade-off・失敗の仕方：journal を作った後は取消しではなく「残りの工程を完了させる」経路になります（journal が既にあれば残りを続行する、行3404–3416）。lock の TTL を待ち時間の倍数より長く取る理由がコメントにあります（行3196–3200付近）。MoveTables では DeniedTables の変更が watch で通知されないため、SrvVSchema を作り直して代用している、と設計文書にあります。
- 反例・適用しない場合：CNPG は sharding を持たず、1つの primary と replica の構成です（O08、O09）。
- 互換・非互換：O06 と組み合わさります。逆方向の複製は、切替後に戻す（rollback）ための経路です。
- 限界：shard の数、timeout、lock を繰り返す回数は持ち込みません。

### P04-O08 failover の規則を「確実性優先・判断できなければ失敗」として文書で固定する
- 出典：vitessio/vitess、`doc/design-docs/EmergencyReparentShard.md` 行1–28（https://github.com/vitessio/vitess/blob/fb653f2727a2afabe18e2b81999ba4ae69213b37/doc/design-docs/EmergencyReparentShard.md#L1-L28）。信頼性ラベル：primary。本文確認：済
- 何をしているか：ERS（緊急の primary 交代）の規則を「review requirements, not aspirations」として列挙しています。主な規則は次のとおりです。
  - 最も進んだ候補が明確でなければ error にする。
  - shard lock を全工程で保持し、段階の境目ごとに `CheckShardLocked` で確かめる。
  - 受信したが未適用の transaction を持つ tablet は昇格させない。
  - semi-sync の ack を返す側が足りず前に進めない候補は昇格させない（`canEstablishForTablet`）。
  - 明示指定した primary（`NewPrimaryAlias`）でも安全確認は省かない。
  - split brain を解く override には運用者が明示して指定する必要があり、VTOrc のような自動の呼出し元には許さない。
  - 昇格の記録を `PopulateReparentJournal` に必ず書く。
- 解いている問題と前提：障害時の可用性回復を急ぎつつ、errant GTID や分岐した履歴を生まないことです。MySQL GTID と、durability policy（`policy.Durabler`）がすべての規則の出どころである、という前提です。
- 必要な入力：durability policy、昇格の可否規則（`MustNot`、cell をまたぐ昇格の禁止）、各段階の上限時間。
- trade-off・失敗の仕方：段階を増やすほど停止時間が延びるので、RPC や作業を増やすな、と明記しています。split brain の override では、捨てた枝の transaction が失われ、tablet の再構築が要ることがあります。
- 反例・適用しない場合：CNPG は lease と quorum で同じ問題に当たっています（O09）。
- 互換・非互換：O07 の切替も、lock の再確認という同じ原理を使っています。
- 限界：timeout の値は持ち込みません。

### P04-O09 自動failover：二段階の手順、昇格 lease、quorum（R+W>N）による昇格の可否
- 出典：cloudnative-pg/cloudnative-pg、`docs/src/failover.md` 行7–64・65–121・200–250・298–430（https://github.com/cloudnative-pg/cloudnative-pg/blob/887bffe481a37c198a2f7c6cb9023b415faad515/docs/src/failover.md#L298-L430）、`internal/controller/replicas_quorum.go` 行40–135（https://github.com/cloudnative-pg/cloudnative-pg/blob/887bffe481a37c198a2f7c6cb9023b415faad515/internal/controller/replicas_quorum.go#L40-L135）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  1. 二段階の手順：`TargetPrimary` を pending にして旧 primary を停止させ、WAL receiver がすべて止まってから選出と昇格に進みます。停止は fast shutdown を試み、失敗すれば immediate shutdown にします。
  2. 昇格 lease：Kubernetes の `Lease` を持っている instance だけが昇格できます。きれいに停止したときは、WAL を archive し終えてから lease を解放します。旧 primary が解放できない場合は期限切れを待ちます。
  3. quorum：`evaluateQuorumCheckWithStatus` は、`FailoverQuorum` CR（primary が更新し、operator が読む）にある synchronous standby の集合 N と同期数 W、ready な候補との積集合 R を使い、R+W>N のときだけ昇格を許します。metadata がなければ failover を拒否します。
  4. `failoverDelay` で、短い不安定のときに failover が早まるのを避けられます。
- 解いている問題と前提：RTO と RPO の両立です。文書は、shutdown の待ち時間を長くすれば RPO 側に有利、短くすれば RTO 側に有利、と trade-off を明記しています（行200–234）。lease だけでは、API server から切り離されたまま健康な primary の split brain は防げないので、primary isolation check と併用せよ、と書いています（行97–121）。
- 必要な入力：同期複製の方式と数、データ耐久性と可用性のどちらを優先するか、failover の遅延、shutdown の待ち時間。
- trade-off・失敗の仕方：quorum を満たさなければ「昇格せずに待つ」。手動の `promote` は最後の手段とされています。`synchronous_commit` を local にした commit は保証外です。issue #8679（https://github.com/cloudnative-pg/cloudnative-pg/issues/8679、closed）は、instance 数による検証が quorum の理屈より厳しすぎるという報告です。
- 反例・適用しない場合：Vitess ERS は最も進んだ候補を GTID で判定します（O08）。quorum の集合計算ではありません。
- 互換・非互換：O10（backup と WAL archive）とつながっています。lease が守る対象は archive の終端です。
- 限界：遅延、lease、timeout の値は持ち込みません。

### P04-O10 DR：base backup と継続的な WAL archive、新 cluster として復元（PITR）、token を使った cluster 間の役割交代
- 出典：cloudnative-pg/cloudnative-pg、`docs/src/backup.md` 行47–67・160–200・252–268・492–512（https://github.com/cloudnative-pg/cloudnative-pg/blob/887bffe481a37c198a2f7c6cb9023b415faad515/docs/src/backup.md#L160-L200）、`docs/src/recovery.md` 行7–50・267–282・402–440、`docs/src/replica_cluster.md` 行189–226・286–400（https://github.com/cloudnative-pg/cloudnative-pg/blob/887bffe481a37c198a2f7c6cb9023b415faad515/docs/src/replica_cluster.md#L286-L400）。信頼性ラベル：primary（文書は CC-BY-4.0）。本文確認：済
- 何をしているか：
  - backup：物理 base backup と WAL archive の2つで構成します。方式（object store か volume snapshot か）を表で比べ、PITR に WAL archive が必須であること、retention の可否など、能力の違いを示しています。retention や backup 本体は CNPG-I plugin へ移しつつあり、core の `retentionPolicy` は deprecated です。
  - 復元：「not performed in-place」とあり、`bootstrap.recovery` で新しい cluster を作ります。PITR では `targetTime`／`targetXID`／`targetName` 等で、WAL をどこまで再生するかを指定します。
  - cluster 間の DR：`.spec.replica.primary` を変えて降格すると、`.status.demotionToken`（pg_controldata の情報）が出ます。それを相手側の `promotionToken` に入れて昇格させます。token を省くと failover として扱われ、旧 primary の再構築が要ります。
- 解いている問題と前提：消失データの範囲（RPO）を WAL archive で、復旧時間（RTO）を base backup の間隔と方式で決めます。文書は、backup の頻度が RTO を左右するので、実際に復元して時間を測れ、と書いています（行252–268）。
- 必要な入力：backup の方式と保管先、base backup の周期、retention、復元の目標点、cluster 間の topology（`externalClusters`）。
- trade-off・失敗の仕方：時刻指定の後に transaction がないと復元は失敗します。timezone のない時刻は UTC として解釈されます（recovery.md 行402–425）。volume snapshot は大きな DB の RTO に有利ですが、PITR には WAL archive が要ります。
- 反例・適用しない場合：cluster 間の昇格は、spec を2つ同時に書き換える宣言的な手順で、自動化されていません（文書には自動 failover の記述がありません）。Vitess は逆方向の複製で切替を戻します（O07）。
- 互換・非互換：O09 と組み合わさります。
- 限界：backup の周期（文書の推奨値を含む）と保持期間は持ち込みません。

### P04-O11 費用の恒等式と配分モデル：workload＋idle＋overhead、max(request, usage)、共有費の配り方
- 出典：opencost/opencost、`spec/opencost-specv01.md` 行16–99・151–269（https://github.com/opencost/opencost/blob/2b3962dc51040d79c860de4eadb0afb102cdce27/spec/opencost-specv01.md#L151-L269）、`pkg/costmodel/allocation_helpers.go` 行261–271・1918–1930（https://github.com/opencost/opencost/blob/2b3962dc51040d79c860de4eadb0afb102cdce27/pkg/costmodel/allocation_helpers.go#L261-L271）。信頼性ラベル：primary。本文確認：済
- 何をしているか：spec は、Total = Asset + Overhead、Asset = 時間で掛かる allocation 費 + 量で掛かる usage 費、Total = Workload + Idle + Overhead、という恒等式を定めています。workload 費は、allocation 費のある資源では max(request, usage) とします。計算は container 単位で行い、その後で任意の次元（namespace、label 等）に集計します。共有費（system workload、idle、overhead）の配り方として、均等、asset 消費に比例、独自 metric の3つを挙げています。実装では、usage が request を下回れば core 時間を request の水準に引き上げます。そのうえで node の単価（`CostPerCPUHr` 等）を掛けます。
- 解いている問題と前提：共有 cluster の費用を tenant へ配ることです。会計用語（COGS、SG&A）に対応させています。scheduler が request で資源を予約する、という前提です。
- 必要な入力：資源の単価（または請求データ）、配分する単位、共有費の対象と配り方、usage 課金だけの資源を idle 率から外すかどうか。
- trade-off・失敗の仕方：request が大きすぎる workload は、使っていなくても費用を負担します（workload idle として見える）。usage 課金だけの資源は効率100%とみなし、cluster の idle 率に入れない、と spec にあります。
- 反例・適用しない場合：CA の `price` expander（O04）は拡張先を選ぶ時点で費用を使います。OpenCost は事後に配分します。
- 互換・非互換：O05 の先行容量は idle として現れます。O12 へ続きます。
- 限界：単価や上限値（`CPU_SANITY_LIMIT` 等）は持ち込みません。

### P04-O12 配分は順序のある pipeline：idle 係数 → 共有係数 → filter → 分配
- 出典：opencost/opencost、`core/pkg/opencost/allocation.go` 行39–48・1527–1552・1563–1625（https://github.com/opencost/opencost/blob/2b3962dc51040d79c860de4eadb0afb102cdce27/core/pkg/opencost/allocation.go#L1563-L1625）。関数全体は行1563–2225。信頼性ラベル：primary。本文確認：済
- 何をしているか：`AllocationSet.AggregateBy(aggregateBy, *AllocationAggregationOptions)` は、冒頭のコメントで11段の順序を定めています。external・idle・shared の分離 → idle と共有の係数計算 → filter → idle の分配 → key を作って集計 → 共有資源に乗った idle の再分配 → 共有費の分配 → 残った idle の処理、の順です。option には `ShareIdle`、`ShareSplit`（`ShareWeighted`＝費用に比例、`ShareEven`＝均等、`ShareNone`）、`SharedNamespaces`／`SharedLabels`、`SharedHourlyCosts`（固定の overhead）、`IdleByNode`、`SplitIdle`、`Reconcile` があります。`ShareIdle` は `ShareWeighted` 以外なら `ShareNone` に正規化されます（行1622–1625）。idle の配り方は比例か配らないかの2択です。
- 解いている問題と前提：filter を掛けたときでも、その部分集合が全体のときと同じ idle の取り分を受け取るようにすること（idle filtration coefficients）です。配分の結果が順序に依存するので、順序を固定しています。
- 必要な入力：集計の key、共有とみなす対象、idle と共有費の配り方、固定 overhead の額。
- trade-off・失敗の仕方：係数が0になって配れない idle が残る場合の救済段（段10・11）があります。external の allocation が key を作れない場合は「otherwise... ignore them?」というコメントのまま残っています（未決のまま）。
- 反例・適用しない場合：spec は独自 metric による配分を挙げていますが、今回読んだ option には対応する項目を確認できませんでした（gap）。
- 互換・非互換：O11 を実装したものです。
- 限界：固定費の額は持ち込みません。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| scale 判断の揺れを抑える | KEDA：0↔1 は cooldown（最後に active だった時刻から）、1↔N は HPA behavior に委ねる（O01） | VPA：下限〜上限の帯の中では動かさない。最小稼働時間と最小差分で抑える（O03）。CA：unneeded の状態が続いた時間と、1台ずつの縮小（O04） | 変える対象が台数か、1台の大きさか、node か。変更に再起動を伴うか |
| 入力 metric が得られないとき | KEDA：失敗回数が閾値を超えたら、方針に従う代わりの値を合成する（O02） | VPA：履歴が短い間は信頼度係数で上限・下限を広げ、強い変更を抑える（O03） | 目的が欠損時の運転継続か、根拠不足時の変更抑制か |
| 負荷が容量を超えたとき | CA／KEDA：容量を増やす（O01、O04）。先行容量で起動遅れを吸収する（O05） | Vitess：容量を固定して要求側を遅らせる（throttler の check、BEGIN 時の拒否）（O06） | 容量を伸ばせるか、遅延（lag）の上限を守ることが主目的か |
| failover 先の決め方 | Vitess ERS：GTID で最も進んだ候補を確定し、確定できなければ error。override には運用者の指定が必要（O08） | CNPG：lease で早すぎる昇格を防ぎ、R+W>N を満たさなければ待つ（O09） | 複製の方式（GTID・semi-sync か、PostgreSQL の同期複製か）と、topology を持つ仕組み（topo lock か k8s Lease・CR か） |
| 切替を戻す | Vitess：逆方向の複製を張ってから切り替える。journal の後は前へ進めるだけ（O07） | CNPG：降格 token を相手に渡して役割を入れ替える。token がなければ旧側を再構築（O10） | 移動の単位が shard・table か、cluster 全体か |
| 費用と容量の判断のつながり | CA：拡張時の選択に price expander を使う（O04） | OpenCost：事後に配分し、idle を見えるようにする（O11、O12） | 判断が事前（調達）か事後（帰属）か |
| 共有費・余剰の配り方 | OpenCost spec：均等・比例・独自 metric の3方式を挙げる（O11） | OpenCost 実装：idle は比例か配らないかに正規化。共有は比例か均等（O12） | spec は方式を挙げる文書、実装は filter 下での一貫性を優先している |

## 見つからなかったこと・gap
- Cluster Autoscaler の core 実装（scale-down の計画、expander のコード）は、固定commitでは kubernetes/autoscaler の外（`sigs.k8s.io/cluster-autoscaler`、repo kubernetes-sigs/cluster-autoscaler、main=1fa5ecd7e57a4b8757cd36144a7a93571b8ea8bc を確認しただけ）にあり、読んでいません。CA の観察は FAQ と API 型だけを根拠にしています。
- HPA 本体の安定化アルゴリズム（stabilization window、behavior policy の評価）は kubernetes/kubernetes にあり、範囲外で未読です。KEDA が behavior を渡している事実だけを観察しました。
- KEDA の `scalingModifiers` の式評価（`pkg/scaling/modifiers/formula.go`）は、冒頭の説明コメントだけ読み、本体は未読です。
- OpenCost spec の「独自 metric による共有費配分」に当たる実装 option は、今回読んだ範囲では見つかりませんでした。
- OpenCost の `Reconcile`（請求データとの突合せ）は option 名を確認しただけで、処理は未読です。
- Vitess の VTOrc（自動回復の起動側）、`go/vt/throttler`（transaction throttler の実装）は未読です。設計文書だけに依っています。
- CNPG の WAL archive と backup 本体は plugin（Barman Cloud Plugin、別repo）へ移っており、retention の実装は未読です。
- 費用の上限（budget）や費用に基づく自動の縮小判断を持つ仕組みは、5つの repo のどれにも見つかりませんでした。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 取得方法：5つの repo すべてを 作業用の一時領域に `git clone --filter=blob:none` し、sparse-checkout で固定commitを checkout しました。コード、test、build、hook は一切実行していません。`gh api` は repo の metadata・commit・issue に約15回使いました。
- kubernetes/autoscaler：`cluster-autoscaler/FAQ.md`（scale-up／scale-down／expanders／overprovisioning の節）、`cluster-autoscaler/main.go` と `go.mod`（core が別 module にあることの確認）、`cluster-autoscaler/apis/capacitybuffer/.../v1beta1/types.go`、`vertical-pod-autoscaler/pkg/recommender/logic/{recommender,estimator}.go`、`pkg/updater/priority/{update_priority_calculator,priority_processor}.go`、`pkg/updater/restriction/pods_eviction_restriction.go`。proposals/ と VPA enhancements/ は未読です。
- kedacore/keda：`apis/keda/v1alpha1/scaledobject_types.go`、`pkg/scaling/executor/scale_scaledobjects.go`、`pkg/fallback/fallback.go`、`pkg/scaling/scale_handler.go`（grep のみ）、`pkg/scaling/modifiers/formula.go`（冒頭のみ）。issue は #8056、#7488 を本文まで、#7801 は題名だけ見ました。検索語："fallback scale to zero"。
- vitessio/vitess：`doc/design-docs/{ReplicationLagBasedThrottlingOfTransactions,VTGateBuffering,EmergencyReparentShard}.md`、`go/vt/vtctl/workflow/{resharder,server}.go`（`switchWrites`）、`go/vt/topotools/split.go`、`go/vt/key/key.go`（関数一覧）、`go/vt/vttablet/tabletserver/throttle/{throttler,check}.go`、`base/app_throttle.go`。`switchReads`、`traffic_switcher.go` の本体、VTOrc は未読です。
- cloudnative-pg/cloudnative-pg：`docs/src/{failover,backup,recovery,replica_cluster}.md`（上記の節）、`internal/controller/replicas_quorum.go`。issue は #8679 を本文まで（本文中の連絡先は転記していません）、#8790 は題名だけ見ました。検索語："failover quorum data loss"。
- opencost/opencost：`spec/opencost-specv01.md`、`core/pkg/opencost/allocation.go`（定数、option 型、`AggregateBy` の冒頭と順序コメント、share 係数の部分）、`pkg/costmodel/allocation_helpers.go`（request による引上げ、単価の適用）。検索語："idle share even" では issue が0件でした。
- 数値（間隔、閾値、時間、件数、比率、単価）は、出典の文書やコメントに書かれていても転記していません。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：全観察が外部 OSS の一次資料（source と公式文書）です。O04・O05 の CA は「公式repo内の設計文書」で、実装は未確認です。この区別を由来の属性として持つか未決です。
- scope：対象の大きさ（pod／node／shard／cluster／費用の集計単位）がばらばらです。D07 Infrastructure のどの HELIXBRAIN-L2-INFRA ID（005/006/008/010/011）に当てるかは、作成側では決めていません。暫定の目安として、O01〜O05 は scaling・容量、O06・O07 は backpressure・sharding、O08〜O10 は DR・failover、O11・O12 は費用です。
- 評価根拠：どれも「外部 repo で採られている」という観察で、HELIX での有効性の証拠ではありません（HELIXBRAIN-L2-026／027 の経路は未適用）。
- 版：固定commit SHA で版を表しました。CNPG の文書は CC-BY-4.0 なので、本文を引用する場合の表記要件は未決です（今回は構造の観察だけで、本文の転記はしていません）。
- 状態：全件「未評価の候補素材」です。HELIX-BRAIN への登録と採否は行っていません。
