# P12 Infrastructureのtopology graph・provider抽象・runtime resource抽象の観察（D07 Infrastructure、INFRA-012/013/014）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| opentofu/opentofu | https://github.com/opentofu/opentofu | 0f0b3235046684d52a1a1048e1c39a894867631c（main） | MPL-2.0 | false | 2026-10-04 | 宣言した構成から依存DAGを組む。provider plugin interfaceとprovider addressの層構造が一次sourceで読める（014・012） |
| crossplane/crossplane | https://github.com/crossplane/crossplane | 14517f9fdfe3fcf8811f5da5c50deb4498149bd3（main） | Apache-2.0 | false | 2026-10-04 | Composition、XRと構成resourceの所有関係、Usage（削除順の辺）、ProviderConfig、package runtimeを扱う。design docにtrade-offが記録されている（012・013・014） |
| kubernetes-sigs/cluster-api | https://github.com/kubernetes-sigs/cluster-api | 421161d7d8879dbae617dbdcdac9ebfcda3d29bf（main） | Apache-2.0 | false | 2026-10-04 | provider契約（Infra/Bootstrap/ControlPlane）、契約版付き参照、ClusterClassの「managed topology」（012・013・014） |
| cartography-cncf/cartography（旧 lyft/cartography。API上でrenameを確認） | https://github.com/cartography-cncf/cartography | 5197c502d85d9db03b12311728aa7a9a26916b69（master） | Apache-2.0 | false | 2026-10-04 | 観測したinventoryをgraph DBに入れる。schema宣言、tenant scope、mark-and-sweep、provider横断ontologyを持つ（014・012） |
| backstage/backstage | https://github.com/backstage/backstage | a7703e4ce4b403c2ece32094fdb516e4658d67a5（master） | Apache-2.0 | false | 2026-10-04 | catalogのentity relation（対になる型、kind制約）、Resource kindのADR、stitching、orphan（014） |

## 観察
（すべて未評価の候補素材。HELIX-BRAINへの登録や採否はしていない）

### P12-O01 構成から導く依存DAG：Transformerを順に並べたgraph builder
- 出典：opentofu
  - `internal/tofu/graph_builder.go` 行17–74（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/tofu/graph_builder.go#L17-L74）
  - `internal/tofu/graph_builder_plan.go` 行114–282（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/tofu/graph_builder_plan.go#L114-L282）
  - `internal/tofu/transform_reference.go` 行27–52、139–183（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/tofu/transform_reference.go#L27-L52 、#L139-L183）
  - `internal/dag/dag.go` 行89–151（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/dag/dag.go#L89-L151）
  - `internal/dag/walk.go` 行18–41（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/dag/walk.go#L18-L41）
  - `docs/architecture.md` 行159–220（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/docs/architecture.md#L159-L220）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `GraphBuilder.Build`は空のgraphから始まり、`GraphTransformer`の列を順に適用して頂点と辺を追加・削除する。最後に`g.Validate()`を実行する。
  - 操作（plan、apply、validate、import等）ごとに別のbuilderがあり、それぞれ別のtransformer列を持つ。plan用は、`ConfigTransformer`（構成から頂点）、`StateTransformer`（stateから頂点）、`AttachSchemaTransformer`、`ProviderTransformer`、`ReferenceTransformer`、`TargetingTransformer`、`TransitiveReductionTransformer`等を並べる。
  - 辺の意味は「must happen after」である（architecture.md 行177–180）。
  - 頂点は2種のinterfaceを実装する。`GraphNodeReferenceable`は`ReferenceableAddrs()`で「自分を指せるaddress」を返し、`GraphNodeReferencer`は`References()`で「自分が参照するaddress」を返す。`ReferenceTransformer`はreference mapを作って両者を突き合わせ、辺を張る。
  - `AcyclicGraph.Validate`は「単一root、2頂点以上の強連結成分がない、自己参照辺がない」を検査する。`Walker`は依存が済んだ頂点から並列に処理する。
- 解いている問題と前提：
  - 宣言された目標状態（構成）と現在のstateから、操作の実行順序を事前に計算する。
  - 前提は2つある。構成のどこから何を参照しているかを静的に解析できること。1回の実行で全体のgraphを手元に持てる規模であること。
- 必要な入力：
  - 全objectのaddress体系
  - 参照式の解析器（schemaが要る。そのため`AttachSchemaTransformer`は`ReferenceTransformer`より前に置く必要があるとコメントがある。plan builder 行216–218）
  - 操作の種類（plan、apply、destroy等）
- trade-off・失敗の仕方：
  - 循環はbuild時にerrorになる（dag.go `Validate`）。
  - destroy系では逆向きに張った辺と参照辺が循環を作る。そのため`ReferenceTransformer`は`GraphNodeDestroyer`への参照を飛ばす（transform_reference.go 行156–162のコメントと分岐）。
  - `ForcedCBDTransformer`は「apply時のcycleを避けるためcreate_before_destroyを強制する」とされる（plan builder 行262–264）。
  - transformerの順序に依存関係があり、並べ替えると壊れる（行216–218、行231–233）。
- 反例・適用しない場合：Crossplaneは事前のgraph計算を採らず、再試行による結果整合に任せる（P12-O06）。CartographyとBackstageのgraphは実行順序のためではなく、照会と可視化のためにある（P12-O12、O14）。
- 互換・非互換：O02（動的展開）、O04（provider頂点）と組で成立する。O06の「結果整合＋削除時だけ辺」とは前提が衝突する。
- 限界：単一process・単一実行内のgraphである。継続稼働のcontrol loopや、複数主体が同時に書くtopologyは対象外。HELIXで同じことが成り立つとは限らない。

### P12-O02 構成単位の静的graphと、実行時の動的部分graph（DynamicExpand）
- 出典：opentofu
  - `internal/tofu/graph.go` 行100–130（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/tofu/graph.go#L100-L130）
  - `docs/architecture.md` 行351–374（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/docs/architecture.md#L351-L374）
  - `internal/tofu/transform_reference.go` 行164–168（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/tofu/transform_reference.go#L164-L168）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 主graphは`resource`ブロックごとに1頂点で組む。
  - `GraphNodeDynamicExpandable`を実装する頂点は、評価後に`DynamicExpand`で部分graphを返す。部分graphにはinstanceごとの頂点が入る。部分graphも`Validate`し、rootが`rootNode`であることを確認してからwalkする。
- 解いている問題と前提：instance数（count等）が他の頂点の評価結果に依存し、主graphを作る時点では未知である。docsは「その時点ではunknownだから」と説明している。
- 必要な入力：構成側の単位（type）とinstance側の単位（instance key）を別のaddressとして区別すること。
- trade-off・失敗の仕方：
  - 部分graphが不正なときは「This is a bug in OpenTofu」というerrorを返して止まる（graph.go 行110–129）。
  - 異なるmodule instance間のresource instanceどうしの辺は張らない（transform_reference.go 行164–168）。そのため、instance粒度の依存を正確に取れない場面がある。
- 反例・適用しない場合：Cluster APIのClusterClassでは、topologyの形（ControlPlane、MachineDeployment群）を型として固定し、展開しない（O10）。
- 互換・非互換：O01の前提である。
- 限界：instanceの展開粒度は製品固有なので、HELIXへは持ち込まない。

### P12-O03 provider抽象：未設定と設定済みの2段interface、能力の申告、schema版の上げ
- 出典：opentofu
  - `internal/providers/provider.go` 行19–162、222–238（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/providers/provider.go#L19-L162 、#L222-L238）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `Unconfigured`には、`ConfigureProvider`の前でも呼べる操作を集める。`GetProviderSchema`、各種`Validate*Config`、`MoveResourceState`、`CallFunction`、`ConfigureProvider`、`Close`、`Stop`である。
  - `Configured`は`Unconfigured`を埋め込み、configure後にだけ意味を持つ操作を足す。`UpgradeResourceState`、`ReadResource`、`PlanResourceChange`、`ApplyResourceChange`、`ImportResourceState`、`ReadDataSource`、ephemeral resourceの`Open/Renew/Close`である。
  - `Interface`は`Configured`そのもので、コメントで将来分割したい意図が書かれている（行157–159）。
  - `ServerCapabilities`で、providerは任意機能（destroyのplan要否、schemaのcache可否）を申告する。
  - resource種別ごとの`Schema`はversionを持つ。古いstateは`UpgradeResourceState`でprovider自身に上げさせる。
- 解いている問題と前提：
  - 多数の外部実装（plugin process）を、同じlifecycleの契約で扱う。
  - 前提：
    - CRUDを「現在のstate＋提案state→計画state→適用」の形に揃えられる。
    - providerがschemaを自己申告する。
    - 別processのRPCとして動く（`Close`は「plugin processを止める」とある）。
- 必要な入力：resource種別の名前空間、schemaとその版、configureに渡す設定。
- trade-off・失敗の仕方：
  - `Stop`はblockせずすぐ返すこと、以後は呼ばないことを契約にしている。
  - 他の呼出しのcontextは取り消され得るので、継続が要る処理は`context.WithoutCancel`で切り離せ、とコメントにある（行63–80、107–117）。中断時の外部作用の整合をprovider側に委ねている。
  - `GetProviderSchemaOptional`がfalseのproviderは、instance化のたびにschemaを読む必要がある（行232–237）。
- 反例・適用しない場合：
  - Crossplaneのproviderは「CRDの組＋controller」としてKubernetes APIに載り、core側がRPCで呼ぶ形を採らない（O07、O08）。
  - Cluster APIは、メソッドのinterfaceではなくCRDのfieldの規則を契約にする（O09）。
- 互換・非互換：O04（address）と組。O09の「fieldを契約にする」とは別の流儀で、両立はできるが同じ層に重ねると二重定義になる。
- 限界：RPCとplugin process前提の設計で、HELIXの実行形態は未決である。

### P12-O04 providerを3層のaddressで指し、providerを頂点として依存graphに入れる
- 出典：opentofu
  - `internal/addrs/provider.go` 行16–63（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/addrs/provider.go#L16-L63）
  - `internal/addrs/provider_config.go` 行19–58、92–100（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/addrs/provider_config.go#L19-L58 、#L92-L100）
  - `internal/tofu/transform_provider.go` 行104–129、308–313（https://github.com/opentofu/opentofu/blob/0f0b3235046684d52a1a1048e1c39a894867631c/internal/tofu/transform_provider.go#L104-L129 、#L308-L313）
  - `docs/architecture.md` 行205–211
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：provider関連のaddressを3層に分け、依存graphに組み込む。
  - `Provider`は種別のFQNで、hostname/namespace/typeを持つ。比較のため小文字に正規化する。
  - `LocalProviderConfig`は、moduleから見た局所名とaliasである。
  - `AbsProviderConfig`は、module path＋`Provider`＋aliasで表す絶対addressである。
  - 局所名から絶対addressへの変換は構文だけでは決まらず、moduleのproviders表で引く（行46–48）。
  - resource側の頂点は`GraphNodeProviderConsumer`を実装し、`ProvidedBy()`で局所か絶対の要求を返す。`ProviderTransformer`は、同じmoduleか祖先moduleにあるprovider設定へ解決して`SetProvider`し、「providerの初期化が先」という辺を張る。
- 解いている問題と前提：同じ種別のproviderに複数の設定（alias）があり、module階層で継承する。その状況で、各resourceがどの設定のどのinstanceを使うかを一意に決める。
- 必要な入力：providerの登録元（registry hostとnamespace）、module階層、alias規則。
- trade-off・失敗の仕方：
  - 構文から型が決まらない`ProviderConfig`という両義型を残しており、「可能なら具体型を使え」とコメントがある（行19–38）。
  - provider関数の解決は`ProviderTransformer`とは別のmappingで持つ。コメントは「理想ではないが大きなrefactorになる」と書いている（`internal/tofu/transform_provider.go` 行308–313）。
- 反例・適用しない場合：Crossplaneは、MR（Managed Resource）ごとに`ProviderConfigReference`（kindとname）を持たせ、継承を持たない（O07）。
- 互換・非互換：O01、O03と組で成立する。O07とは「継承するか、明示参照か」で異なる。
- 限界：registryのhostnameや名前空間の具体値は製品固有なので、持ち込まない。

### P12-O05 合成resource（XR）が構成resourceの集合を所有する：参照の記録と、controller参照による削除の限定
- 出典：crossplane
  - `apis/apiextensions/v1/composition_types.go` 行23–61（https://github.com/crossplane/crossplane/blob/14517f9fdfe3fcf8811f5da5c50deb4498149bd3/apis/apiextensions/v1/composition_types.go#L23-L61）
  - `internal/controller/apiextensions/composite/composition_functions.go` 行851–880、942–1011、1013–1040（https://github.com/crossplane/crossplane/blob/14517f9fdfe3fcf8811f5da5c50deb4498149bd3/internal/controller/apiextensions/composite/composition_functions.go#L851-L880 、#L942-L1011 、#L1013-L1040）
  - `design/design-doc-composition.md` 行1–15、210–229（https://github.com/crossplane/crossplane/blob/14517f9fdfe3fcf8811f5da5c50deb4498149bd3/design/design-doc-composition.md#L1-L15）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `Composition`は`compositeTypeRef`（不変）と、function pipelineの列で構成される。
  - XRはpipelineが出したdesired構成resource群を持ち、`UpdateResourceRefs`で`spec.resourceRefs`に安定順で記録する。namespaced XRは自namespaceに限る。
  - 次回の観測では、`ObserveComposedResources`がそのrefsから既存の構成resourceを引く。
  - desiredに無くなったobservedは、`DeletingComposedResourceGarbageCollector`がforeground削除する。ただし、controller ownerReferenceが自XRのUIDと一致するものに限る。
- 解いている問題と前提：抽象（XR）と、具体的なinfra resourceの集合との対応を、継続的に収束させる。Kubernetesのowner参照とGCを前提にしている。
- 必要な入力：構成resourceの名前付け（pipeline上のresource名をannotationで付ける。無いと`errAnonymousCD`になる。行62）、所有者のUID。
- trade-off・失敗の仕方：
  - `spec.resourceRefs`は利用者が編集できる。そのため、refsだけを根拠に削除すると「confused deputy」になり得る。GHSA-77cv-mrm6-fr3cを根拠に、controller参照が無いものは消さず、別UIDならerrorにする（行966–990）。
  - backup/restoreでowner UIDが失われる場合も、消さずに次回の再採用を待つ（行980–985）。
  - 旧方式（P&T）からの移行で、名前の無いplaceholder refが残る（行858–867）。
  - design doc自体は「その後の進化で内容が変わった」と冒頭で断っている（行7–15）。
- 反例・適用しない場合：Backstageのrelationは所有ではなく宣言で、対象が無くても実体を消さない（O14）。Cartographyは観測側なので所有の概念を持たない（O12）。
- 互換・非互換：O06（Usage）と組で削除順を補う。O10（ClusterClassのSSA共同所有）とは、所有の単位が異なる。
- 限界：Kubernetes GCとowner参照に依存した設計である。

### P12-O06 作成は結果整合に任せ、削除順だけを明示の辺（Usage）で表す
- 出典：crossplane
  - `design/one-pager-generic-usage-type.md` 行7–90、405–474（https://github.com/crossplane/crossplane/blob/14517f9fdfe3fcf8811f5da5c50deb4498149bd3/design/one-pager-generic-usage-type.md#L7-L90 、#L405-L474）
  - `apis/protection/v1beta1/usage_types.go` 行120–147（https://github.com/crossplane/crossplane/blob/14517f9fdfe3fcf8811f5da5c50deb4498149bd3/apis/protection/v1beta1/usage_types.go#L120-L147）
  - 信頼性ラベル：primary（design docのStatusはDraft表記。API型は実在する）。本文確認：済
- 何をしているか：
  - `Usage`は`of`（使われる側）、任意の`by`（使う側）、`reason`、`replayDeletion`を持つ。
  - `by`があれば依存関係を、無ければ単独の保護を表す。`by`も`reason`も無い場合はCELで拒否する（`usage_types.go` 行121）。`by`無しでnamespaceをまたぐ`of`も拒否する。
  - 強制はadmission webhookが行い、使用中の削除を拒否する。
- 解いている問題と前提：
  - 作成はKubernetes流の結果整合（失敗と再試行）で収束する。一方、削除は依存側が先に消えないと、MRが永久にTerminatingになったり、外部の副作用resourceがorphanになったりする。
  - 文書はTerraformの事前依存graphを対比として明示している（行24–28）。
- 必要な入力：使う・使われる関係の宣言（参照かlabel selector）。cluster全体へのRBAC（RBAC managerが既に持つことを前提にしている。行86–88）。
- trade-off・失敗の仕方：
  - 比較表（行466–474）が2案を対比している。Webhookで拒否する案は実装が易しいが、利用者が再試行する必要がある。解決済みUsageで削除を遅らせる案は、XR→nested XR→MRを継続的に解決する必要がある。
  - 独自削除logicでowner参照を外す案（Option C）は、owner参照を使う外部tool（ArgoCD等）を壊すため退けている（行455–462）。
  - background削除では、親が消えた後に子が消えるので、orphanに気づきにくい（行59–65）。
- 反例・適用しない場合：OpenTofuは作成も削除も同じDAGで順序付ける（O01）。
- 互換・非互換：O05と併用する。O01の「全順序を事前計算する」とは前提が違う。
- 限界：admission webhookという仕組みはKubernetes固有である。

### P12-O07 credential束（ProviderConfig）と、使用marker数による削除保護
- 出典：crossplane
  - `apis/core/v2/resource.go` 行45–51、102–120、212–220、237–260（https://github.com/crossplane/crossplane/blob/14517f9fdfe3fcf8811f5da5c50deb4498149bd3/apis/core/v2/resource.go#L45-L51 、#L212-L260）
  - `design/one-pager-providerconfigusage-deletion-protection.md` 行7–48（https://github.com/crossplane/crossplane/blob/14517f9fdfe3fcf8811f5da5c50deb4498149bd3/design/one-pager-providerconfigusage-deletion-protection.md#L7-L48）
  - 信頼性ラベル：primary（docはDraft）。本文確認：済
- 何をしているか：
  - MRは`ProviderConfigReference`（kindとname）でcredential設定を明示参照する。
  - credentialの入手元は`CredentialsSource`列挙で抽象化している（None、Secret、InjectedIdentity、Environment等）。
  - providerは外部へ接続するたびに`ProviderConfigUsage`（「MR XはPC Yを使う」というmarker）を作る。PC reconcilerは、markerがある間は`in-use`finalizerを保持する。
  - 参照の解決には`Policy`（Resolve: Always/IfNotPresent、Resolution: Required/Optional）がある。
- 解いている問題と前提：使用中のcredentialを消して、MRが外部resourceを片付けられなくなる事態を防ぐ。
- 必要な入力：MRとPCの参照関係。marker objectの寿命の規則。
- trade-off・失敗の仕方：
  - docは「PCU数>0」を「MRがまだ在る」の代理指標として使っていると書く。foreground削除では、`blockOwnerDeletion`のためPCUがMRより先に消える。その結果、数が0になり、PCが先に消える競合が起きる（行26–48）。
  - 代替案として、汎用Usageへの収束やMR実体の監視が検討されている（見出し 行364–386。本文は未読）。
- 反例・適用しない場合：OpenTofuは、provider設定を依存graphの頂点にして順序で守る（O04）。
- 互換・非互換：O06のUsageと同じ問題を別の仕組みで解いており、docは統合を検討中としている。
- 限界：GCの意味論に依存する失敗である。marker作成・削除の競合は、Draftのone-pager（設計文書）が説明している内容である。API型（`resource.go`）は固定commitで確かめたが、ProviderConfigUsageを作成・削除するruntime実装（crossplane-runtime、別repository）は読んでいない。

### P12-O08 runtimeを抽象化しない：起動形態は既定の1種とexternal委譲だけにする
- 出典：crossplane
  - `design/one-pager-package-runtime-config.md` 行7–80、244–255（https://github.com/crossplane/crossplane/blob/14517f9fdfe3fcf8811f5da5c50deb4498149bd3/design/one-pager-package-runtime-config.md#L7-L80 、#L244-L255）
  - `apis/pkg/v1beta1/deployment_runtime_config_types.go` 行71–101（https://github.com/crossplane/crossplane/blob/14517f9fdfe3fcf8811f5da5c50deb4498149bd3/apis/pkg/v1beta1/deployment_runtime_config_types.go#L71-L101）
  - issue https://github.com/crossplane/crossplane/issues/2671（[RFC] Provider Runtime Interface、closed）
  - 信頼性ラベル：primary。本文確認：済（issueは冒頭部のみ）
- 何をしているか：
  - packageの長時間稼働process（package runtime）は、既定ではKubernetes Deploymentとして作る。
  - `DeploymentRuntimeConfig`は、Deployment、Service、ServiceAccountのtemplateで上書きする設定型である。
  - 起動flag `--package-runtime=External`ではruntimeを作らず、revisionとpayload（CRD）だけを配る。runtimeの実体化は外部controllerに任せる。
- 解いている問題と前提：
  - 利用者はDeployment設定を細かく制御したく、一部はDeployment以外で動かしたい。
  - docは、別形態の需要は「quite rare」と前提している。
- 必要な入力：packageのrevision。runtime設定への参照。
- trade-off・失敗の仕方：
  - RFC #2671のProvider Runtime Interface（runtimeの抽象層。Docker、外部serviceなど）は、複雑さと間接層を増やすとして退けた（行246–255）。
  - 旧`ControllerConfig`は、Deploymentを少しずつtemplate化して肥大したため非推奨になった（行29–35）。
- 反例・適用しない場合：OpenTofuは、plugin processを`Close`で止める程度の抽象しか持たず、runtimeの型を持たない（O03）。
- 互換・非互換：O11の`managed-by`委譲と同じ「外部へ委譲する印」の型である。
- 限界：需要が少ないという判断は、このrepo固有である。

### P12-O09 provider契約を「CRD fieldの規則＋契約版」で定め、coreはpathで読む
- 出典：cluster-api
  - `docs/book/src/developer/providers/contracts/overview.md` 行1–29（https://github.com/kubernetes-sigs/cluster-api/blob/421161d7d8879dbae617dbdcdac9ebfcda3d29bf/docs/book/src/developer/providers/contracts/overview.md#L1-L29）
  - `docs/book/src/developer/providers/contracts/infra-machine.md` 行1–63、205–229、291–334（https://github.com/kubernetes-sigs/cluster-api/blob/421161d7d8879dbae617dbdcdac9ebfcda3d29bf/docs/book/src/developer/providers/contracts/infra-machine.md#L1-L63）
  - `internal/contract/infrastructure_machine.go` 行23–56（https://github.com/kubernetes-sigs/cluster-api/blob/421161d7d8879dbae617dbdcdac9ebfcda3d29bf/internal/contract/infrastructure_machine.go#L23-L56）
  - `internal/contract/version.go` 行39–56、110–137（https://github.com/kubernetes-sigs/cluster-api/blob/421161d7d8879dbae617dbdcdac9ebfcda3d29bf/internal/contract/version.go#L39-L137）
  - `api/core/v1beta2/common_types.go` 行390–416
  - `api/core/v1beta2/machine_types.go` 行425–440
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - providerの種類（Infrastructure、Bootstrap、ControlPlane、IPAM等）ごとに、対象resource（InfraCluster、InfraMachine等）が満たす規則表を持つ。規則にはMandatoryかどうかの印が付く。例：`spec.providerID`、`status.initialization.provisioned`。
  - core側の`Machine`は`infrastructureRef`を`ContractVersionedObjectReference`（kind、name、apiGroupのみ）で持つ。versionはCRDの契約labelから引く。
  - `internal/contract`は、型を持たない（unstructured）objectのfield pathを、契約版ごとに返すaccessorである。
  - `GetCompatibleVersions`は、新しい契約が旧契約と一時的に互換であることを表す。
- 解いている問題と前提：core（Machine等）とprovider実装を、コード依存なしにfield規則だけで結ぶ。providerは別repositoryで別versionで出る。
- 必要な入力：契約版。CRDの契約label。field規則の表。
- trade-off・失敗の仕方：
  - 契約labelが無いか空なら、参照のversionを決められずerrorになる（version.go 行134–136）。
  - 文書は「契約に無いcoreの挙動に依存するな」と強く警告している（infra-machine.md 行24–39）。
  - 旧契約の互換は期限付きで撤去予定とされる（行320–334。期日は持ち込まない）。
- 反例・適用しない場合：OpenTofuはメソッドのinterfaceを契約にする（O03）。
- 互換・非互換：O03とは「契約の表現」の対立軸。O10の前提でもある（templateの規約）。
- 限界：Kubernetes CRDとunstructuredに依存する。

### P12-O10 「managed topology」：型で固定した構成の枠と、templateからのdesired state生成
- 出典：cluster-api
  - `docs/proposals/20210526-cluster-class-and-managed-topologies.md` 行70–99、532–604（https://github.com/kubernetes-sigs/cluster-api/blob/421161d7d8879dbae617dbdcdac9ebfcda3d29bf/docs/proposals/20210526-cluster-class-and-managed-topologies.md#L70-L99 、#L532-L604）
  - `exp/topology/scope/state.go` 行30–48（https://github.com/kubernetes-sigs/cluster-api/blob/421161d7d8879dbae617dbdcdac9ebfcda3d29bf/exp/topology/scope/state.go#L30-L48）
  - `exp/topology/desiredstate/desired_state.go` 行99–103
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `ClusterClass`は、topology（control plane、machine deployments、machine pools）を定義するtemplateの集合である。
  - `Cluster.spec.topology`を単一の操作点とする。
  - `ClusterState`は枠を型で固定する。Cluster、InfrastructureCluster、ControlPlane（＋InfraMachineTemplate、MachineHealthCheck）、MachineDeployments map、MachinePools mapである。provider固有のobjectは`unstructured`で持つ。
  - `Generate`は、blueprintからdesired stateを一括で計算する。topology controllerはServer Side Applyで書き、他のcontrollerとfieldを共同所有する。
- 解いている問題と前提：1つのclusterを構成するresourceが複数に散らばり、version upgradeやscaleが難しい問題を解く。同じ形のclusterを多数作ることを前提にしている。
- 必要な入力：
  - templateの規約：templateのfieldは生成objectの部分集合であること。生成objectの余分なfieldは任意か既定値付きであること。
  - SSAのmerge規則の注記（+MapType等）。
- trade-off・失敗の仕方：
  - `Generate`は「1つでも欠けたら全体が失敗」と明記し、部分reconcileは将来課題としている（desired_state.go 行100–102）。
  - ClusterClassは不変なので、infra templateにversion固定値を持たせるとupgrade不能になる（行580–584）。
  - provider側と共同所有するlist（例：subnet）はSSAの注記が要る（行594–599）。
  - upgradeとrollback、既存clusterの取込（adoption）、観測性は初版の範囲外とされた（行100–113）。
- 反例・適用しない場合：Crossplaneは枠を固定せず、function pipelineが任意のresource集合を出す（O05）。OpenTofuは任意のgraphを許す（O01）。
- 互換・非互換：O09の契約が前提。O05と目的は近いが、形を固定するかどうかで対立する。
- 限界：Kubernetes clusterという1領域に特化した形の固定である。

### P12-O11 管理主体の委譲印：外部管理への一方向の移行
- 出典：cluster-api
  - `docs/proposals/20210203-externally-managed-cluster-infrastructure.md` 行102–118、134–157、173–188（https://github.com/kubernetes-sigs/cluster-api/blob/421161d7d8879dbae617dbdcdac9ebfcda3d29bf/docs/proposals/20210203-externally-managed-cluster-infrastructure.md#L102-L188）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - InfraClusterに`cluster.x-k8s.io/managed-by`のannotationがあれば、provider controllerはreconcileせず、specもstatusも書かない。値は自由文字列で検査しない。
  - 外部の管理系は、契約上必須のfieldとready状態を自分で満たす。
  - core（Machine作成）は、管理主体が誰でも動く。
- 解いている問題と前提：既存infraや、権限制約下のinfraを、抽象の上には載せたまま実体の管理だけ外へ出す。
- 必要な入力：契約field（O09）。管理主体の印。
- trade-off・失敗の仕方：annotationは不変にできない。外部管理から管理下へ戻すと、作っていないinfraをcontrollerがreconcileし始め、結果を予測できない。そのためwebhookでこの方向の変換を禁じ、一方向操作として文書化するとしている（行175–188）。
- 反例・適用しない場合：Crossplaneは、runtimeの層でExternalを起動flagとして、cluster全体に一律に適用する（O08）。こちらはobject単位である。
- 互換・非互換：O08と同型。O05の「controller参照が無ければ消さない」と、所有確認の考え方が近い。
- 限界：個々の値は持ち込まない。本文に記したannotation名（`cluster.x-k8s.io/managed-by`）はcluster-apiの実装の観察であり、HELIXの名前として持ち込むものではない。出典は2種類に分かれる。annotationによるreconcile除外という契約は固定版のAPI commentとpredicateにもある内容だが、本観察が引いたのはproposalである。一方向性（管理下へ戻す変換をwebhookで禁じる）の記述も、proposalの文書に基づく。実装の契約と提案の記述を区別して読む。

### P12-O12 観測inventory graph：schema宣言、tenant scope、更新印によるmark-and-sweep
- 出典：cartography
  - `cartography/models/core/nodes.py` 行176–283（https://github.com/cartography-cncf/cartography/blob/5197c502d85d9db03b12311728aa7a9a26916b69/cartography/models/core/nodes.py#L176-L283）
  - `cartography/graph/cleanupbuilder.py` 行16–60、318–360（https://github.com/cartography-cncf/cartography/blob/5197c502d85d9db03b12311728aa7a9a26916b69/cartography/graph/cleanupbuilder.py#L16-L60 、#L318-L360）
  - `docs/root/dev/writing-intel-modules.md` 行515–519、660–690（https://github.com/cartography-cncf/cartography/blob/5197c502d85d9db03b12311728aa7a9a26916b69/docs/root/dev/writing-intel-modules.md#L515-L519 、#L660-L690）
  - PR https://github.com/cartography-cncf/cartography/pull/3235（closed、未merge）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `CartographyNodeSchema`は、`label`、`properties`、`sub_resource_relationship`（課金・組織単位。AWSAccount、GCPProject等）、`other_relationships`、`extra_node_labels`、`scoped_cleanup`を宣言する。そこからingest queryを生成する。
  - 各syncは`update_tag`を全nodeと全relationshipの`lastupdated`に刻む。今回の印を持たないものをcleanupで消す。
  - `scoped_cleanup`がTrueなら、現在のsub resourceの範囲だけを消す。tenantが無い種別はFalseにして全体を消す。
  - `cascade_delete`を指定すると、RESOURCE辺の子も消す。
  - `build_cleanup_queries`は4通りの組合せを分ける。sub resourceがありscopedがFalseという矛盾した組合せはValueErrorにする。
- 解いている問題と前提：
  - 複数のcloud・SaaSから集めた現状をgraphに統合し、照会する。
  - 前提：
    - 書き込み主体は観測（pull）だけである。
    - tenant単位で1つずつsyncする（docs 行673–677）。
    - IDは外部識別子（ARN等）である。
- 必要な入力：nodeのID体系。tenantにあたる単位。今回のsyncの印。
- trade-off・失敗の仕方：
  - 取得が空で返ると、cleanupがその範囲のnodeを消す。PR #3235は、regionの500を空として扱うと「1回分のregionのnodeを失う。no-opではなくdata loss」と明記している。同PRは、1 moduleの例外でaccount全体のsyncが失われる問題も扱っている（未merge）。
  - cascade_deleteはscoped cleanupでしか許さない（行55–60）。
- 反例・適用しない場合：Backstageは、parentがemitしなくなった子を即座に消さず、orphan印を付ける（O14）。OpenTofuは、stateとの差分をplanにしてから適用する（O01）。
- 互換・非互換：O13（ontology）を上に重ねる。O14のorphan方式とは、削除の方針で対立する。
- 限界：graph DB（Neo4j）の照会言語に依存する。件数の上限値などは持ち込まない。

### P12-O13 provider横断ontology：provider固有のnodeを共通の意味labelへ写像する
- 出典：cartography
  - `cartography/models/ontology/mapping/specs.py` 行6–75（https://github.com/cartography-cncf/cartography/blob/5197c502d85d9db03b12311728aa7a9a26916b69/cartography/models/ontology/mapping/specs.py#L6-L75）
  - `cartography/models/ontology/mapping/data/computeinstance.py` 行1–30、98–128（https://github.com/cartography-cncf/cartography/blob/5197c502d85d9db03b12311728aa7a9a26916b69/cartography/models/ontology/mapping/data/computeinstance.py#L1-L128）
  - `docs/root/modules/ontology/index.md` 行1–63（https://github.com/cartography-cncf/cartography/blob/5197c502d85d9db03b12311728aa7a9a26916b69/docs/root/modules/ontology/index.md#L1-L63）
  - 信頼性ラベル：primary。本文確認：済（docsが引くmedium記事とdiscussion #1579は読んでいない）
- 何をしているか：
  - `OntologyMapping(module_name, nodes)`の下に、`OntologyNodeMapping(node_label, fields, eligible_for_source)`がある。各`OntologyFieldMapping`は`ontology_field`、`node_field`、`required`、`special_handling`（反転、mapping、coalesce等）、`indexed`を持つ。
  - 例：AWSのEC2、GCP、Azure、DigitalOcean等のinstanceを、共通の`ComputeInstance`の意味fieldへ写す。各providerの状態語彙は、共通の正準集合へ写す（未写像はNULL）。provider固有の生の値は元nodeに残す。
  - 「source of truth」moduleを指定すると、その種別のontology nodeはそのmoduleだけが作る。他のmoduleは既存nodeへのlinkだけを張る（docs 行30–34）。
- 解いている問題と前提：異なるproviderの同種resourceを、1つの照会で横断する。providerのschemaは変えられないので、後から写像する前提である。
- 必要な入力：共通fieldの定義。識別子fieldの必須指定。写像表。
- trade-off・失敗の仕方：
  - required fieldが欠けると、そのrecordのontology nodeは作らない（docs 行53–63）。
  - 長い値はindex上限を超えるため`indexed=False`にする（specs.py 行17–19。値は持ち込まない）。
  - 写像できない状態値はNULLになる。
- 反例・適用しない場合：OpenTofuやCrossplaneは、provider固有の型をそのまま扱い、共通型へは写さない（O03、O05）。Cluster APIは、写像ではなく、provider側に共通fieldを実装させる（O09）。
- 互換・非互換：O12の上に重ねる層。O09の「実装側に契約fieldを課す」とは逆向きの解き方である。
- 限界：正準語彙の中身は製品固有なので、持ち込まない。

### P12-O14 宣言relation：対になる型、kind制約、他者が張った入辺の統合（stitching）、宙に浮いた参照の許容
- 出典：backstage
  - `packages/catalog-model/src/kinds/relations.ts` 行19–25、145–199（https://github.com/backstage/backstage/blob/a7703e4ce4b403c2ece32094fdb516e4658d67a5/packages/catalog-model/src/kinds/relations.ts#L19-L199）
  - `packages/catalog-model/src/model/modelActions/addRelationPair.ts` 行20–110（https://github.com/backstage/backstage/blob/a7703e4ce4b403c2ece32094fdb516e4658d67a5/packages/catalog-model/src/model/modelActions/addRelationPair.ts#L20-L110）
  - `plugins/catalog-backend/src/processors/BuiltinKindsEntityProcessor.ts` 行111–146、229–255（https://github.com/backstage/backstage/blob/a7703e4ce4b403c2ece32094fdb516e4658d67a5/plugins/catalog-backend/src/processors/BuiltinKindsEntityProcessor.ts#L111-L146 、#L229-L255）
  - `docs/architecture-decisions/adr005-catalog-core-entities.md` 行7–112（https://github.com/backstage/backstage/blob/a7703e4ce4b403c2ece32094fdb516e4658d67a5/docs/architecture-decisions/adr005-catalog-core-entities.md#L7-L112）
  - `docs/features/software-catalog/life-of-an-entity.md` 行170–213、242–292（https://github.com/backstage/backstage/blob/a7703e4ce4b403c2ece32094fdb516e4658d67a5/docs/features/software-catalog/life-of-an-entity.md#L170-L292）
  - issue https://github.com/backstage/backstage/issues/34090（closed、not_planned）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - ADR005は核のentityを3つ定める。Component、API、Resource（「runtimeに必要なinfra」で、Terraform等の宣言やcloud inventoryから索引化する想定）である。
  - relationはforwardとreverseの対で宣言する（`addRelationPair`のfromKind、toKind、forward、reverse）。例：Component/Resource間の`dependsOn`/`dependencyOf`、`partOf`/`hasPart`、`ownedBy`/`ownerOf`。命名規則がコメントにある（行19–25）。
  - processorは、specのfield（`dependsOn`、`dependencyOf`、`system`、`owner`）から両方向のrelationをemitする。
  - stitchingは、processed entity、error、自分がemitしたrelation、他entityがemitした自分宛てのrelationを集めて最終entityにする。entity hashが変わったときだけ再stitchする。
- 解いている問題と前提：
  - 組織と所有、software、infraの関係を、1つのcatalogで可視化する。
  - 前提：
    - 実行順序には使わず、表示と照会に使う。
    - owner relationは表示が主目的で、自動の権限付与に使うなと明記している（well-known-relations.md 行34–40）。
- 必要な入力：entity参照の書式（kind:namespace/name。既定kindと既定namespaceの補完あり）。relation型の語彙。
- trade-off・失敗の仕方：
  - 対象が存在しないrelationは許容し、entity pageに警告を出すだけである。issue #34090は、この警告を一覧で絞り込みたいという要望で、not_plannedで閉じられた。
  - parentがemitしなくなった子は`backstage.io/orphan`印を付ける（既定設定では削除）。fileが壊れて読めない場合はorphanにしない（行279–283）。
  - stitchingは固定処理で拡張できない（行211–213）。
  - 配列の順序が変わるとhashが変わって再stitchされ、性能問題になり得る（行205–207）。
- 反例・適用しない場合：OpenTofuでは、参照が解決できなければgraphを作れない（O01）。Crossplane Usageは、対象の参照が解決できないとき既定（Required）で失敗する（O07のPolicy）。
- 互換・非互換：O12（観測graph）と、O05やO10（所有と生成のtopology）の上に、表示用の層として重ねられる。削除の方針はO12と対立する。
- 限界：relation語彙は製品固有なので、持ち込まない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 依存の順序付け | OpenTofu：構成から事前にDAGを作り、循環をerrorにして並列walkする（O01） | Crossplane：作成は再試行で結果整合に任せ、削除順だけUsageの辺で守る（O06） | 単発実行で全体を計算するか、継続的なreconcileか |
| 不定数のinstance | OpenTofu：静的graph＋評価後の動的部分graph（O02） | Cluster API：topologyの枠を型で固定し、map内で数を持つ（O10） | 任意構成か、単一領域の定型か |
| provider契約の表現 | OpenTofu：メソッドinterface（2段lifecycle）＋能力申告＋schema版（O03） | Cluster API：CRD fieldの規則表＋契約版label＋path accessor（O09） | RPC pluginか、別repoのcontrollerがAPI objectを書くか |
| provider設定の選択 | OpenTofu：3層address＋module階層での継承解決（O04） | Crossplane：MRごとの明示参照（kind/name）＋使用marker（O07） | module継承の有無、GC任せの寿命かどうか |
| runtime形態の抽象 | Crossplane：抽象層を作らず、既定Deploymentとexternal委譲flag（O08） | Cluster API：object単位の`managed-by`印で外部委譲（O11） | cluster一律か、object単位か。需要の頻度の見積り |
| 消えた要素の扱い | Cartography：更新印のmark-and-sweepで、tenant scope内を削除（O12） | Backstage：orphan印を付け、既定では削除。宙に浮いた参照は警告だけ（O14） | 観測の真値を信じるか、宣言の誤りを許容するか |
| 抽象と実体の対応 | Crossplane：XRが構成resourceを所有し、controller参照の一致でのみGC（O05） | Cartography：provider固有nodeを共通labelへ後付けで写像（O13） | 生成（書き手）側か、観測（読み手）側か |
| 他者の書込みとの共存 | Cluster API：SSAでfieldを共同所有（O10） | Crossplane：refsは編集可能なので、所有の確認なしに削除しない（O05） | 共同所有を前提にするか、confused deputyを防ぐか |

## 見つからなかったこと・gap
- 014（topology graph）に直接使える「物理・論理topology（network、zone、hostの接続）」を表すmodelは、読んだ範囲では見つからなかった。各repoのgraphの意味は次のとおりで、ネットワーク到達性や配置topologyではない。
  - OpenTofuのgraph：実行順序
  - Crossplane：所有と削除の順
  - Cartography：観測した関係
  - Backstage：宣言relation
- 環境の層（dev/stg/prod等）をtopologyの第一級の概念として持つ例は、今回の範囲では未確認。
- 013（runtime resource）を、provider非依存の型（compute、storage、network等）として正規化しているのはCartographyのontology（観測側）だけだった。生成側（OpenTofu、Crossplane）は、provider固有型のまま扱っている。
- pulumi/pulumiは読んでいない（resource monitor、URN、parent/provider resource等は未確認）。
- 外部事例の成功がHELIXで再現するかどうかの評価根拠はない。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- opentofu：
  - 読んだ：`internal/providers/provider.go`、`internal/addrs/provider.go`、`internal/addrs/provider_config.go`、`internal/tofu/graph_builder.go`、`graph_builder_plan.go`、`transform_reference.go`、`transform_provider.go`（見出し＋行104–129、300–315）、`graph.go`（行90–130）、`internal/dag/dag.go`、`internal/dag/walk.go`（冒頭）、`docs/architecture.md`（Graph Builder、Sub-graphs）
  - 未読：`rfc/20240513-static-evaluation-providers.md`、plugin-protocol proto、apply側のgraph builder、issue
- crossplane：
  - 読んだ：`apis/apiextensions/v1/composition_types.go`、`apis/core/v2/resource.go`（一部）、`apis/protection/v1beta1/usage_types.go`、`apis/pkg/v1beta1/deployment_runtime_config_types.go`、`internal/controller/apiextensions/composite/composition_functions.go`（行840–1040）、design doc 4本（composition、generic-usage-type、package-runtime-config、providerconfigusage-deletion-protection。いずれも該当節のみ）、issue #2671（冒頭）
  - 未読：crossplane-runtime（MR reconciler、ProviderConfigUsage実装は別repo）、design-doc-provider-strategy、cross-resource-referencing
  - crank traceは固定commitでは`cmd/crank`が存在しなかった。
- cluster-api：
  - 読んだ：contracts `overview.md`、`infra-machine.md`（規則表・providerID・initialization）、`internal/contract/infrastructure_machine.go`、`version.go`、`api/core/v1beta2/common_types.go`・`machine_types.go`（該当部）、proposal 2本（ClusterClass、externally managed）、`exp/topology/scope/state.go`、`desired_state.go`（関数見出し）
  - 未読：runtime SDK、topology mutation hook、ClusterResourceSet
- cartography：
  - 読んだ：`models/core/nodes.py`、`relationships.py`（見出しのみ）、`graph/cleanupbuilder.py`、`models/ontology/mapping/specs.py`、`data/computeinstance.py`、`docs/root/dev/writing-intel-modules.md`（update_tag、cleanup）、`docs/root/modules/ontology/index.md`、PR #3235
  - 検索した語："cleanup stale partial sync failure"（issue検索）
  - 未読：MatchLinks、analysis jobs、`intel/ontology`の実装本体
- backstage：
  - 読んだ：`kinds/relations.ts`、`modelActions/addRelationPair.ts`、`BuiltinKindsEntityProcessor.ts`（該当部）、ADR005、`life-of-an-entity.md`（Stitching、Orphaning）、`well-known-relations.md`（冒頭）、issue #34090
  - 検索した語："relation target entity does not exist dangling"
  - 未読：`database/operations/relations/syncRelations.ts`、`stitcher/performStitching.ts`の実装本体、`system-model.md`
- 実行したこと：repositoryのコード・script・test・build・install・hookは一切実行していない。git clone（blobless）、checkout、`git show`、`gh api`で読んだだけ。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの一次source（code、design doc、ADR、PR、issue）。
  - design docの状態はまちまちで、区別が要る。CrossplaneのUsage・PCU one-pagerは「Draft」表記、composition docは「Accepted、ただしその後変化」と自己注記している。
  - PR #3235は未mergeで、反映された挙動ではない。
- scope：観測した対象ごとにscopeが違い、HELIXのどの対象機構・層に当てるかは未決。
  - 014：O01、O02、O05、O06、O10、O12、O14
  - 012：O03、O04、O07、O09、O13
  - 013：O08、O10、O11、O13
- 評価根拠：外部での採用実績はHELIXでの有効性の根拠にならない。HELIXBRAIN-L2-026／027の経路での評価は未実施。
- 版：固定commit（上表）。design docとcodeの食い違い（例：Compositionのmodeは現行Pipelineのみ）があるため、codeを正とするかdocを正とするかは観察ごとに未決。
- 状態：全観察「未評価の候補素材」。登録、採否、選定はしていない。
