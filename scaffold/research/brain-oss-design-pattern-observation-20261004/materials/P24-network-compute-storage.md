# P24 network・compute・storageの構成知識の観察（D07 Infrastructure）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、優先度の範囲、重み、件数上限、容量、port番号等）は持ち込まない。技術選定・採用推奨ではない。

埋めるgap：[SCF-B-0155 D07](../../brain-domain-material-inventory-20261004/materials/D07-infrastructure.md) §5「network・compute・storageの構成知識」。旧台帳はnetwork・server設計書を`na`としていた（D07-M09。HELIX自身がlocal CLIで常設serverを持たないため）。本書は、仮想networkのpolicy、computeの割当てと配置、storageの抽象について、「どの宣言で何を決め、どこで強制されるか」を観察する。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| kubernetes/kubernetes | https://github.com/kubernetes/kubernetes | a35a8c1a36c8ec8c61256fb7fb7aef0b70806938（default branch: master） | Apache-2.0 | false | 2026-10-05 | 宣言（API型のdoc comment）と強制（scheduler plugin、kubeletのeviction）が同じrepositoryにあり、「宣言した値をどの部品が読むか」を型と実装の両方で追える |
| container-storage-interface/spec | https://github.com/container-storage-interface/spec | 25b3f10249abe6033887ed5177e856b9f73b1105（master） | Apache-2.0 | false | 2026-10-05 | orchestrator（CO）とstorage provider（SP）の間のprotocol仕様。access mode、topology、snapshot、冪等性をMUST／SHOULDで定めており、storage抽象の境界を仕様として読める |
| cilium/cilium | https://github.com/cilium/cilium | 5b9d3405552533d2cde0c093315536ea8183b624（main） | Apache-2.0 | false | 2026-10-05 | identityベースのnetwork policyと、L3／L4／L7を1つのpolicy言語で書き分ける実装。L7の強制点（proxy）とL3／L4の強制点が分かれている |
| kubernetes-sigs/network-policy-api | https://github.com/kubernetes-sigs/network-policy-api | 6de926f16e091be30b96c49a9a2e95e606f8baf0（main） | Apache-2.0 | false | 2026-10-05 | 名前空間単位のNetworkPolicyの上下に、cluster管理者の層（tier）を足す提案API。層と優先度の評価順、Pass（委譲）の意味が型とNPEPに書かれている |
| kubernetes/enhancements | https://github.com/kubernetes/enhancements | f7be055669b365e9b4ab3905bda6ef385e0c84ca（master） | Apache-2.0 | false | 2026-10-05 | 上の実装の設計判断（storage容量の追跡、非preemptingの優先度、snapshot）をKEPで読む。P16で読んだKEP template・sig-network 536とは別のKEPを選んだ |

（rook/rookは今回読んでいない。CSIの仕様とKubernetes側のstorage型で「宣言と強制の境界」を観察でき、特定のstorage実装の内部は本テーマの問いから外れると判断した。）

## 観察

### P24-O01 namespace単位のallow-onlyのnetwork policy：選ばれた時点で既定拒否に変わり、規則は加算で合成される
- 出典：kubernetes、`staging/src/k8s.io/api/networking/v1/types.go` 行61–109（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/networking/v1/types.go#L61-L109）、行198–206（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/networking/v1/types.go#L198-L206）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - `NetworkPolicySpec.podSelector` が対象podを選ぶ。複数のpolicyが同じpodを選んだ場合、ingress規則は加算で合成される（行66–67）。
  - ingressは、podを選ぶpolicyが1つもない場合（かつcluster側のpolicyが許す場合）、送信元がpod自身のnodeである場合、または全policyの規則のどれか1つに一致する場合に許可される（行73–76）。規則のlistが空のpolicyは何も許さず、「選んだpodを既定で隔離する」だけの役割になる（行77–78）。
  - `policyTypes` を省略すると、egress節があればEgressを含み、ingressは常に含まれる。egressだけのpolicyや「egressを全部拒否する」policyは、`policyTypes` を明示しないと書けない（行96–104）。
  - peerは `podSelector` と `namespaceSelector` の組で選び、`namespaceSelector` が無ければpolicy自身のnamespace内のpodを選ぶ（行198–206）。
- 解いている問題と前提：アプリ開発者が自分のnamespace内で、label（宣言）だけで通信の許可を書く。規則には「拒否」がなく、合成が加算（和集合）なので、policyの順序に依存しない。
- 必要な入力：podとnamespaceのlabel設計、方向（ingress／egress）、port・protocol、CIDR。
- trade-off・失敗の仕方：
  - 型は宣言だけで、強制の場所を持たない。Status fieldは今の型には無い。commentでtombstoneされた形で残され、protobufのtag番号を予約している理由（将来statusを再実装する場合は別の名前とtagを使う）が書かれているだけである（行42–45、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/networking/v1/types.go#L42-L45）。適用されたかどうかをAPIから読めない。
  - `policyTypes` の既定がingressに寄るため、egress拒否を意図したpolicyが黙ってingressだけのpolicyになりうる（commentが明示的に注意している）。
  - 「拒否」と「cluster全体の規則」を表せない。後者はP24-O02の層で補う提案がある。
- 反例・適用しない場合：Cilium（P24-O04）はdeny規則とcluster全体のpolicyを持つ。network-policy-api（P24-O02）は層と優先度で順序を導入する。
- 互換・非互換：P24-O02はこの型を「NetworkPolicy tier」として中段に組み込む。P24-O03（identity）は、この宣言をどう強制するかの1つの実装である。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。port・CIDRの例示値は持ち込まない。

### P24-O02 policyの層（tier）と層内の優先度、Pass（下の層への委譲）による評価順の明示
- 出典：network-policy-api、`apis/v1alpha2/clusternetworkpolicy_types.go` 行60–108、177–210（https://github.com/kubernetes-sigs/network-policy-api/blob/6de926f16e091be30b96c49a9a2e95e606f8baf0/apis/v1alpha2/clusternetworkpolicy_types.go#L60-L108、https://github.com/kubernetes-sigs/network-policy-api/blob/6de926f16e091be30b96c49a9a2e95e606f8baf0/apis/v1alpha2/clusternetworkpolicy_types.go#L177-L210）、`npeps/npep-285-combine-crds.md` 行21–52（https://github.com/kubernetes-sigs/network-policy-api/blob/6de926f16e091be30b96c49a9a2e95e606f8baf0/npeps/npep-285-combine-crds.md#L21-L52）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `ClusterNetworkPolicySpec.tier` が層を決める。評価順はAdmin tier → NetworkPolicy tier（namespaceの `v1.NetworkPolicy`）→ Baseline tierで、どの層も判断しなかった通信にはKubernetesの既定（全pod間で通信可）が適用される（行62–90）。
  - Admin tierが判断（Accept／Deny）した通信は、それ以上評価しない。`v1.NetworkPolicy` は、選んだpodについて常に最終判断を下す（行71–82）。
  - 層内では `priority` の小さいものが先に評価される。同じ層・同じpriorityで複数のpolicyが一致した場合、実装はどれを適用してもよく、利用者は結果を確実には知れない、と明記している（行93–104）。
  - 規則の `action` はAccept・Deny・Passで、Passは現在の層の残りの規則を飛ばして次の層へ評価を渡す（行190–208）。Acceptについては、他の手段（独自のnftables規則、service mesh等の上位層）で落とされる可能性が残ると注記している（行197–200）。
  - NPEP-285は、AdminとBaselineを1つのCRDに統合するとき、層を `spec.tier` という別fieldにする案と、priorityの符号で層を表す案を比べ、後者はPassの意味の説明が難しくなるとして前者を選んだ（行45–52）。
- 解いている問題と前提：cluster管理者が、開発者のpolicyで上書きできない規則（Admin）と、開発者が上書きできる既定（Baseline）の両方を表す。担当者（persona）と層を対応させる。
- 必要な入力：層の割当て、層内のpriority、規則ごとのaction、対象（namespace selectorかpod selectorのどちらか1つ。行162–167）。
- trade-off・失敗の仕方：同一層・同一priorityの重なりは結果が不定になる（行98–104）。priorityの一意性は利用者の運用に委ねられ、APIは強制しない。規則数には型で上限があり、値は持ち込まない。statusの報告は実装に任される（行44）。
- 反例・適用しない場合：`v1.NetworkPolicy`（P24-O01）は順序を持たない加算合成である。Cilium（P24-O04）は層を持たず、deny規則がallow規則に常に優先する。
- 互換・非互換：P24-O01をNetworkPolicy tierとして内包する。P24-O04のdeny優先とは、「拒否を上位に置く」点は同じで、「委譲（Pass）を持つか」で異なる。
- 限界：v1alpha2の提案APIで、NPEP-285のstatusはExperimentalである（同ファイル行4）。priorityの範囲・規則数の上限の値は持ち込まない。

### P24-O03 IPではなくlabel由来のidentityでpolicyを強制する（identity-based security）
- 出典：cilium、`Documentation/security/network/identity.rst` 行13–54（https://github.com/cilium/cilium/blob/5b9d3405552533d2cde0c093315536ea8183b624/Documentation/security/network/identity.rst#L13-L54）。信頼性ラベル：primary（公式repository内の設計文書）。本文確認：済
- 何をしているか：IPアドレスのfilterで「frontendからbackendへの接続を許す」を書くと、frontendのpodが起動・停止するたびに、backendが動く全nodeの許可IP一覧を更新する必要がある（行21–41）。Ciliumはsecurityをnetwork addressから切り離し、labelから導いたpodのidentityに基づいて強制する。identityは複数のpodで共有され、新しいfrontend podの起動時にはkey-value storeでidentityを解決するだけでよく、backend側のnodeで何もする必要がない（行43–54）。
- 解いている問題と前提：podごとにIPを割り当てるnetwork modelでは、IPの数とchurnが大きい。宣言（label selector）と強制（packetの照合）の間に、IPではなくidentityという中間の名前を置くことで、強制側の更新をpodの増減から切り離す。identityをcluster内で共有するstoreがある前提である。
- 必要な入力：identityを導くlabelの集合、identityを配るstore、packetにidentityを対応付ける手段（本文書の範囲では詳細を読んでいない）。
- trade-off・失敗の仕方：文書は、新しいpodの起動をidentityの解決が終わるまで遅らせる必要が残ると書いている（行52–54）。identityの解決がstoreに依存するため、storeの可用性が強制の前提になる（文書から導いた推論で、障害時の挙動は読んでいない）。
- 反例・適用しない場合：`v1.NetworkPolicy`（P24-O01）の型自体はlabel selectorとCIDRを宣言するだけで、強制方式を定めない。cluster外の宛先はIP・CIDRやFQDNで書くしかない。
- 互換・非互換：P24-O01・O02の宣言を受ける側の強制方式の1つ。P24-O04の層別の強制と組み合わさる。
- 限界：identityの数値表現、datapath（eBPF）上の照合、cluster間のidentity共有は読んでいない。

### P24-O04 L3／L4／L7を1つのpolicyに書くが、強制点と失敗の仕方は層ごとに違う（L7はL4規則に埋め込み、node-local proxyで強制）
- 出典：cilium、`Documentation/security/policy/layer7.rst` 行12–64（https://github.com/cilium/cilium/blob/5b9d3405552533d2cde0c093315536ea8183b624/Documentation/security/policy/layer7.rst#L12-L64）、`Documentation/security/policy/deny.rst` 行12–20、65–67（https://github.com/cilium/cilium/blob/5b9d3405552533d2cde0c093315536ea8183b624/Documentation/security/policy/deny.rst#L12-L67）、`Documentation/security/policy/intro.rst` 行14–68（https://github.com/cilium/cilium/blob/5b9d3405552533d2cde0c093315536ea8183b624/Documentation/security/policy/intro.rst#L14-L68）、`pkg/policy/api/l4.go` 行208–257、278–313（https://github.com/cilium/cilium/blob/5b9d3405552533d2cde0c093315536ea8183b624/pkg/policy/api/l4.go#L208-L313）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 型の上で、L7規則（`L7Rules`）はL4の `PortRule.Rules` の中にだけ置ける（l4.go 行208–257）。`L7Rules` はHTTPかDNSのどちらか1つだけを持つunionである（行298–313）。deny用の `PortDenyRule` はL7規則の欄を持たない（行278–286）。
  - 同じ `PortProtocol` を持つ複数の `toPorts` 規則が、重なるendpointの集合を選ぶ場合に限り、同じ種類のL7規則は合成され、種類が違えばpolicyは拒否される（layer7.rst 行33–36）。L7規則のないL4規則と、L7規則付きのL4規則が並ぶと、後者のL7部分は効かない（layer7.rst 行33–44）。
  - L3／L4の違反はpacketのdropになるが、L7の違反はdropせず、可能ならprotocol固有の拒否応答（HTTPの拒否、DNSのREFUSED）を返す（行46–50）。L7 policyはnode-localのEnvoyを経由し、Envoyがagent podに埋め込まれている場合、L7の通信はagentの可用性に依存する（行61–64）。
  - deny policyは、CiliumのpolicyかKubernetesのNetworkPolicyかにかかわらず、allowに優先する（deny.rst 行15–17）。L7とFQDNによるdenyはできない（行65–67）。
  - 強制modeはagentの設定（default／always／never）で決まる。defaultでは、policyに選ばれたendpointが方向ごとに既定拒否へ移る。`EnableDefaultDeny` を無効にした規則は、この切替えの判定から除かれる。ただしL7規則にはこの設定が効かず、L7のallow-allを含まないL7規則を足すとdropが起きると警告している（intro.rst 行14–68）。
- 解いている問題と前提：1つの宣言でIP・port・HTTP path等を書きたいが、強制の仕組み（kernel datapathとuser spaceのproxy）が層ごとに違う。型の入れ子（L7はL4の下）で、L7を評価できる通信を「どのportか」に限定している。
- 必要な入力：L4のport・protocol、L7のprotocol種別と規則、agentの強制mode、proxyの配置（DaemonSetか埋込みか）。
- trade-off・失敗の仕方：
  - L7は応答で拒否するため、利用者から見える失敗の形がL3／L4と違う。
  - L7の強制がproxyとagentの可用性に依存する（layer7.rst 行61–64）。
  - 既定拒否の切替えが「最初のpolicyが選んだ時点」で起きるため、観察目的のpolicyでも通信が落ちうる。`EnableDefaultDeny` はそれを避ける手段だが、L7には効かない（intro.rst 行56–68）。
- 反例・適用しない場合：`v1.NetworkPolicy`（P24-O01）はL7もdenyも持たない。network-policy-api（P24-O02）はAcceptが上位層（service mesh等）で覆りうると注記し、L7を範囲外に置いている。
- 互換・非互換：P24-O03のidentityでL3を照合し、L7はproxyで照合する。P24-O02の層と、deny優先の規則は別の順序付けで、両方を同時に使う場合の評価順は今回読んでいない。
- 限界：HTTP規則の照合項目の詳細、Envoyの設定生成、host policyのL7（DNSだけが機能するとの注記、layer7.rst 行54–58）は観察の範囲外。

### P24-O05 schedulerの拡張点（extension point）で配置の判断を段階に分ける
- 出典：kubernetes、`staging/src/k8s.io/kube-scheduler/framework/interface.go` 行441–469、521–602、654–740（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/kube-scheduler/framework/interface.go#L441-L469、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/kube-scheduler/framework/interface.go#L521-L602、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/kube-scheduler/framework/interface.go#L654-L740）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - podの配置は、PreEnqueue（queueへ入れる前のgate）→ QueueSort（queue内の順序。有効にできるのは1つ）→ PreFilter → Filter（podを動かせないnodeを除く。旧称predicate）→ PostFilter（どのnodeにも置けなかったときに呼ばれる。preemptionの置き場所）→ PreScore／Score（残ったnodeの順位付け）→ Reserve／Unreserve → Permit → PreBind → Bindの拡張点に分かれる。
  - Filterは「Success以外ならそのnodeを除く」。statusは `Unschedulable`、`UnschedulableAndUnresolvable`、`Error` を返す（行556–558）。preemptionの候補から外れる扱いが書かれているのは次の2つの場合に限られる。
    - PreFilterが `PreFilterResult` でnodeを除いた場合。frameworkはそのnodeを `UnschedulableAndUnresolvable` とみなし、preemptionの候補から外す（行528–531）。
    - PostFilterで独自のpreemptionを実装する場合。`UnschedulableAndUnresolvable` のnodeを無視するのはplugin側の責任である。frameworkは、全nodeがそのstatusでもPostFilterを呼ぶ（行588–590）。
  - Filterは、渡されたnodeInfoを見るよう求められている。preemptionの評価では、一部のpodを取り除いたnodeInfoの複製が渡されるためである（行562–568）。
  - Reserveが失敗すると全pluginのUnreserveが呼ばれ、Unreserveは冪等でなければならない（行676–685）。Permitは、bindを承認・拒否・待機させる（行720–726）。
- 解いている問題と前提：配置条件（資源、affinity、volume、topology）を独立したpluginに分け、どの段で「除外」「順位付け」「予約」「待機」を行うかを固定する。各pluginはcluster状態のsnapshotに対して判断する。
- 必要な入力：podの宣言（requests、affinity、toleration、volume）、nodeの状態のsnapshot、有効にするpluginの構成。
- trade-off・失敗の仕方：PreEnqueueは軽くなければならず、外部endpointの呼出しなどの重い処理を置くとevent handlerで他のpodのenqueueを止める、とcommentが注意している（行448–450）。Filterの判断はsnapshotに基づくため、bindまでの間に状態が変わりうる。そのためReserve／Unreserveの対で仮の確保を取り消せるようにしている。
- 反例・適用しない場合：配置を利用者が直接指定する場合（`nodeName`。plugin `nodename` は存在を確認しただけで読んでいない）。
- 互換・非互換：P24-O06（資源のFilter）、P24-O08（preemptionはPostFilter）、P24-O09（affinity・spread）、P24-O12・O10（volumeの制約）は、この拡張点のどこかに置かれる。
- 限界：PodGroup・Placement系の新しい拡張点（行604–611、804以降）は読んでいない。plugin構成の既定値は持ち込まない。

### P24-O06 配置のfit比較は実効の要求（effective requests）で行い、上限（limits）を別の配置上限として直接は比べない：QoS classは要求と上限の関係から導く
- 出典：kubernetes、`pkg/scheduler/framework/plugins/noderesources/fit.go` 行296–333、654–692、740–766（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/scheduler/framework/plugins/noderesources/fit.go#L296-L333、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/scheduler/framework/plugins/noderesources/fit.go#L654-L766）、`pkg/apis/core/v1/helper/qos/qos.go` 行38–42、105–120（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/apis/core/v1/helper/qos/qos.go#L38-L120）、`staging/src/k8s.io/component-helpers/resource/helpers.go` 行253–287（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/component-helpers/resource/helpers.go#L253-L287）、`staging/src/k8s.io/api/core/v1/types.go` 行3157–3159（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/core/v1/types.go#L3157-L3159）、`pkg/apis/core/v1/defaults.go` 行170–197（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/apis/core/v1/defaults.go#L170-L197）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `computePodResourceRequest` のdoc commentは、init containerは順に動くため各次元の最大を取り、通常のcontainerは同時に動くため合計を取り、Overheadの資源も足すと説明している（fit.go 行296–302）。実際の計算は `resource.PodRequests` に委ねる（行325–329）。
  - `resource.PodRequests` の計算では、通常のinit containerとrestartable init container（実行し続けるinit container）を区別する（helpers.go 行253–287）。
    - restartable init containerの要求は、通常のcontainerの合計に加え、さらに累積していく。
    - 通常のinit containerごとに、自分の要求に、それより前に並ぶrestartable init containerの累積を足した値を作る。
    - その値の各次元の最大と、通常のcontainerの合計との、各次元の最大を取る。
    - したがって「init containerは各次元の最大」と言えるのは、restartable init containerが無い場合に限られる。
  - containerが要求（requests）を省略し、上限（limits）を明示した場合、要求は上限の値にdefaultされる（types.go 行3157–3159）。defaultは、v1.Podのdefault処理で、通常のcontainerとinit containerの両方について、上限にあって要求に無い資源を上限からcopyする形で行われる（defaults.go 行170–197。PodTemplateには適用しないとcommentにある）。
  - このため、上限は、要求を省略したときの値の出どころとして、配置の比較に入りうる。比較そのものは、default後の実効の要求と、nodeの残りとの間で行われる。上限を、要求とは別の配置上限としてnodeと直接比べる処理は、今回読んだFilterの範囲には無かった。
  - Filterは、nodeの `Allocatable` から、そのnodeで既に要求された量（`GetRequested`）を引いた残りと、podの要求を比べる。足りない資源ごとに理由を残し、podの要求がnodeのAllocatable全体を超える場合は `Unresolvable` にする（行740–766、683–685）。実使用量ではなく要求量の合計で判断している。
  - QoS classは、全containerのcpu・memoryの要求と上限が等しく指定されていればGuaranteed、どれも指定されていなければBestEffort、それ以外はBurstableになる（qos.go 行38–42）。ただし、feature gate `PodLevelResources` が有効で、pod単位の資源（`pod.Spec.Resources`）が指定されている場合は、containerごとではなくpod単位の値で判定する分岐が先にある。この分岐には、別のfeature gateによる条件も加わる（行44–48）。資源ごとの判定は「要求と上限がどちらも0」「等しくない」「等しく0でない」で分ける（行105–120）。
- 解いている問題と前提：配置時点で使用量は分からないため、宣言された要求（省略時は上限からdefaultされた値を含む）で容量を予約する。上限には、ほかに実行時の制限としての役割（今回読んだ範囲では、どこで強制するかのcodeは読んでいない）と、QoS classの導出への寄与がある。
- 必要な入力：containerごとの要求と上限、init containerの有無と種別（通常かrestartableか）、RuntimeClassのoverhead、nodeのAllocatable。
- trade-off・失敗の仕方：要求を小さく宣言すると、実使用が要求を超えたpodがnode上に集まりうる。そのpodはnode圧迫時の追い出しで先に選ばれる（P24-O07）。要求も上限も宣言しないpodはBestEffortになる。上限だけを宣言したcontainerでは、要求が上限からdefaultされるため、配置で予約される量は上限と同じになる。restartable init containerは、通常のcontainerと並んで要求が累積されるため、通常のinit containerより配置に必要な量を大きくしうる。
- 反例・適用しない場合：DRA（動的資源割当て）で扱う資源は、`shouldDelegateResourceToDRA` でこのFilterの比較から外れる（行786–788。DRAの本体は読んでいない）。設定で無視する拡張資源も比較から外れる（行774–784）。
- 互換・非互換：P24-O05のPreFilter／Filterに置かれる。P24-O07（追い出しの順位）とP24-O08（preemption）が、要求量を判断の基準として共有する。
- 限界：fit.goのdoc commentにある資源量の例示は持ち込まない。score（least／most allocated等）の方式は読んでいない。

### P24-O07 node圧迫時の追い出し順位：要求超過 → 優先度 → 要求に対する超過量
- 出典：kubernetes、`pkg/kubelet/eviction/helpers.go` 行679–730、816–845（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/kubelet/eviction/helpers.go#L679-L730、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/kubelet/eviction/helpers.go#L816-L845）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - memory圧迫時、kubeletは `orderedBy(exceedMemoryRequests, priority, memory)` でpodを並べる。まず使用量が要求を超えているpodを先にし、次に優先度の低いpodを先にし、最後に要求を超えた分の使用量が大きいpodを先にする（行816–821）。
  - 統計の取れないpodは先に追い出す（行697–699、716–718）。
  - PID圧迫では優先度とprocess数で、disk圧迫では要求超過・優先度・disk使用量で並べる（行823–833）。
  - 複数の閾値に同時に達したときは、memoryの信号を他より先に扱う（行841–845）。
- 解いている問題と前提：配置（scheduler）は要求量で行うが、実行時の資源不足はnode上でしか分からない。node上のagent（kubelet）が、宣言（要求・優先度）と実測（使用量）を組み合わせて回収の順を決める。
- 必要な入力：podの要求量、優先度、nodeの実測統計、閾値の定義（値は持ち込まない）。
- trade-off・失敗の仕方：要求を正しく宣言したpodは、優先度より先に「要求を超えていない」ことで守られる。統計の欠けたpodが先に追い出されるため、監視の欠落が追い出しの判断に影響する。
- 反例・適用しない場合：scheduler側のpreemption（P24-O08）は、配置のために優先度の低いpodを退ける別の仕組みで、実測量ではなく要求量と優先度で判断する。
- 互換・非互換：P24-O06の要求量、P24-O08の優先度を共有する。QoS class（P24-O06）は、この順位関数には直接は現れない（今回読んだ範囲）。
- 限界：閾値・猶予期間の値、cgroupによる上限の強制、OOM killerとの関係は読んでいない。

### P24-O08 優先度による先取り（preemption）：PDB違反は禁止せず優先順位で減らし、先取りしない優先度を別に宣言する
- 出典：kubernetes、`pkg/scheduler/framework/plugins/defaultpreemption/default_preemption.go` 行341–420、448–482（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/scheduler/framework/plugins/defaultpreemption/default_preemption.go#L341-L420、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/scheduler/framework/plugins/defaultpreemption/default_preemption.go#L448-L482）、`pkg/scheduler/framework/preemption/preemption.go` 行355–382、455–535（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/scheduler/framework/preemption/preemption.go#L355-L382、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/scheduler/framework/preemption/preemption.go#L455-L535。指摘を受けて引用した行だけを読み、それ以外は読んでいない）、`staging/src/k8s.io/api/core/v1/types.go` 行3109–3118、4668–4674（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/core/v1/types.go#L3109-L3118、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/core/v1/types.go#L4668-L4674）。enhancements、`keps/sig-scheduling/902-non-preempting-priorityclass/README.md` 行50–120（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-scheduling/902-non-preempting-priorityclass/README.md#L50-L120）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `SelectVictimsOnNode` は、先取り可能な候補をいったん全部nodeから取り除き、それでもpodが置けなければそのnodeを諦める。置ける場合は、重要度の高い候補から順に戻し（reprieve）、戻すと置けなくなる候補だけを犠牲（victim）にする。PDBに違反する候補を先に戻そうとし、戻せなかった違反の数を数えて返す（行353–440）。
  - node間では、`DryRunPreemption` が違反のない候補を違反のある候補より前に並べる（preemption.go 行455–458、512–516、534）。`pickOneNodeForPreemption` も、score関数がなければPDB違反の最も少ないnodeを第1の基準にする（行355–382）。
  - まとめると、node内では戻す順、node間では違反数の少ない候補を優先する。どちらも優先順位であり、PDB違反を禁止してはいない。
  - 候補は、先取りする側より優先度が低いpodに限られる（行478–482）。pod affinityが犠牲候補に向いている場合は、性能上の理由で扱わないとcommentが書いている（行368–373）。
  - `preemptionPolicy=Never` のpodは先取りしない。指名されたnodeで先取りによる終了中のpodがある間は、追加の先取りをしない。ただし、指名先nodeがFilterで `UnschedulableAndUnresolvable` とされた場合は、再び先取りの対象にしてよい（行448–475。例外は行459–463）。
  - KEP-902は、先取りしない優先度を、queueの順序は上げたいが実行中のbatch jobの途中の仕事を捨てたくない用途のために提案した（行65–74）。PriorityClassの値はpod admission時にPodSpecへ写され、schedulerはPriorityClassを知らずに済み、PriorityClassを変えても既存podに影響しない、と理由を挙げている（行113–119）。先取りから守ることは非目標で、PDBを使うとしている（行81–83）。
  - KEPの提案は `Preempting *bool` というfieldだったが（行87–110）、固定commitの型は `PreemptionPolicy`（`PreemptLowerPriority`／`Never`）という列挙型である。Priority admission controllerが有効な場合に限り、admission controllerがPriorityClassNameから値を入れ、利用者が直接設定するのを防ぐ（types.go 行3109–3118、4668–4672）。
- 解いている問題と前提：容量が足りないときに、どのworkloadを先に置き、どれを退けるかを、宣言（優先度・先取りの可否・PDB）で決める。
- 必要な入力：PriorityClass（値と先取りの可否）、PDB、nodeの状態。
- trade-off・失敗の仕方：PDBは先取りでは保証にならない（node内の戻す順と、node間の候補の順の優先だけ）。先取りの判断と、犠牲podの実際の終了の間に時間差があり、その間の重複した先取りを抑える分岐がある。
- 反例・適用しない場合：kubeletの追い出し（P24-O07）は配置のためではなく資源回収のためで、PDBを見る分岐はそこでは見当たらなかった（今回読んだ順位関数の範囲）。
- 互換・非互換：P24-O05のPostFilterに置かれる。P24-O06の要求量で「置けるか」を判定し直す。
- 限界：設計文書（KEP）のfield名と実装のfield名が異なる。KEPのGraduation節の版番号は持ち込まない。async preemption等の後続KEPは題名だけ確認した。

### P24-O09 配置の制約を「hard／soft」と「配置時だけ／実行中も」の2軸で宣言し、強制する部品を分ける
- 出典：kubernetes、`staging/src/k8s.io/api/core/v1/types.go` 行4223–4244、4326–4365、4367–4408、5022–5077（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/core/v1/types.go#L4223-L4244、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/core/v1/types.go#L4326-L4408、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/core/v1/types.go#L5022-L5077）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - node affinityとpod anti-affinityのfield名は `requiredDuringSchedulingIgnoredDuringExecution`（hard。配置時に満たさなければ置かない。実行中に満たさなくなっても追い出すかどうかは保証しない）と、`preferredDuringSchedulingIgnoredDuringExecution`（soft。重みの合計でnodeを順位付けする）である。実行中も強制する `RequiredDuringSchedulingRequiredDuringExecution` はcommentの中に「NOT YET IMPLEMENTED」として残されている（行4328–4343、4224–4244）。
  - taintのeffectは強制する部品が違う。NoScheduleとPreferNoScheduleはschedulerが強制し、NoScheduleはschedulerを通らずkubeletに直接渡されたpodと実行中のpodを止めない。NoExecuteは実行中のpodも追い出し、強制はNodeControllerが担う（行4389–4407）。kubeletでも強制する `NoScheduleNoAdmit` は未実装のcommentである（行4399–4403）。
  - topology spreadは `topologyKey`（nodeのlabelで分割の単位を決める）、`whenUnsatisfiable`（DoNotSchedule＝置かない／ScheduleAnyway＝偏りを減らすnodeを優先）で宣言する。DoNotScheduleでも、既存の偏りを解消するのではなく「今より偏らせない」ことだけを保証する、と例で説明している（行5056–5075）。
- 解いている問題と前提：可用性（zone・nodeへの分散）と局所性（同じ場所に置く）を、label（topology）と制約の強さで表す。配置後の状態変化に対する扱いを、field名そのものに書き込んでいる。
- 必要な入力：nodeのtopology label（zone、host等）、podのlabel、制約の強さ、許容するtaint。
- trade-off・失敗の仕方：hard制約を重ねると置けないpodが増える。「配置時だけ」の制約は、labelの変更やnodeの増減の後に崩れても戻されない（再配置は別の部品の仕事になる）。
- 反例・適用しない場合：storageのtopology（P24-O10・O11）は、volumeの到達可能性という別の入力から同じ「置けるnode」の制約を作る。
- 互換・非互換：P24-O05のFilter（hard）とScore（soft）に対応する。P24-O08のpreemptionは、affinityが犠牲候補に向く場合を扱わない。
- 限界：重みの範囲、maxSkewの既定値・例示値は持ち込まない。`minDomains`、`nodeAffinityPolicy`・`nodeTaintsPolicy` の詳細は読んでいない。

### P24-O10 storageの抽象：classで供給方式を宣言し、volumeの作成をpodの配置まで遅らせる
- 出典：kubernetes、`staging/src/k8s.io/api/storage/v1/types.go` 行30–122（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/storage/v1/types.go#L30-L122）。enhancements、`keps/sig-storage/1472-storage-capacity-tracking/README.md` 行94–126、232–270、700–745、1128–1164（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-storage/1472-storage-capacity-tracking/README.md#L94-L126、https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-storage/1472-storage-capacity-tracking/README.md#L232-L270、https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-storage/1472-storage-capacity-tracking/README.md#L700-L745、https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-storage/1472-storage-capacity-tracking/README.md#L1128-L1164）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `StorageClass` はcluster単位の型で、`provisioner`（作成を担う部品）と、provisionerへ渡す不透明な `parameters` を持ち、どちらも変更不可である。`parameters` の中身をCSI側は不透明な属性として扱う（CSI spec.md 行810、https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L810-L810）。回収方針、mount option、拡張の可否、`volumeBindingMode`、`allowedTopologies` を宣言する（行30–88）。
  - `volumeBindingMode` がImmediateならPVCは即座に供給・結合される。`WaitForFirstConsumer` なら、PVCを参照する最初のpodが作られるまで供給・結合を遅らせ、podの配置の中で行う（行107–122）。
  - KEP-1472は、遅延結合でもschedulerはstorageの残り容量を知らずにnodeを選ぶため、volume作成が失敗してpodが止まりうる、と問題を書いている（行96–121）。CSI driverは通常localのUnix domain socketしか公開せず、schedulerと同じhostで動くとも限らないため、schedulerが直接問い合わせられない。そこで、sidecarが容量情報をAPI serverへ書き、schedulerがそれを読む（行234–270）。
  - 容量の照合はvolumeごとに独立で、同じpodの他のvolumeや他のpodのために作成中のvolumeの影響を数えない。「最大volumeサイズ」と「残り容量」のどちらで表しても偽陰性・偽陽性がありうる、と書いている（行726–736）。schedulerで残り容量を模型化する案は、storageが単純に分割できるbyte量ではないことが多いため、storage communityが支持しない、とDrawbacksに記録している（行1130–1159）。
- 解いている問題と前提：storageの到達範囲（topology）や残り容量がnodeによって違うとき、volumeを先に作るとpodを置けないnodeにvolumeができる。作成をpodの配置に合わせて遅らせ、配置の入力に容量情報を加える。
- 必要な入力：provisionerの名前と不透明なparameter、結合の時期、許すtopology、driverが報告する容量。
- trade-off・失敗の仕方：容量情報は公開に遅れがあり、忙しいclusterでは古い情報で判断する（行1132–1138）。scale testでは再試行が必要になったと記録している（行1140–1148）。mount optionsは検証されず、不正ならmountが失敗するだけである（行63–65）。parameterはCSI側で不透明な属性として扱われ（CSI spec.md 行810）、その中身の意味はprovisionerに委ねられる。
- 反例・適用しない場合：Immediateの結合は配置を待たない。容量の報告を宣言しないdriverでは、schedulerは従来どおり容量を見ない（KEP 行268–270）。
- 互換・非互換：P24-O11（CSIのtopology要求）がvolume作成側の契約で、P24-O09（podの配置制約）と同じnodeの集合を絞る。容量の照合は、schedulerの既存のvolume scheduling library（`CheckVolumeBinding`）のtopology照合を拡張して行う、とKEPは書いている（行702–713）。それがP24-O05のどの拡張点に置かれるかは、volume binding pluginの本体を読んでおらず確認していない。
- 限界：KEPの例示容量や性能測定の値は持ち込まない。`CSIStorageCapacity` の型の詳細（行281以降）は読んでいない。

### P24-O11 CO（orchestrator）とSP（storage provider）の間の契約：capabilityの申告、topology要求、名前による冪等な作成
- 出典：container-storage-interface/spec、`spec.md` 行19–33、69–100、473–478、640–680、802–840、1095–1135、1180–1200（https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L19-L33、https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L69-L100、https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L473-L478、https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L640-L680、https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L802-L840、https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L1095-L1135、https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L1180-L1200）。信頼性ラベル：primary（仕様）。本文確認：済
- 何をしているか：
  - 仕様の主な対象はCOとPluginの間のprotocolで、PluginはController PluginとNode Pluginに分かれうる（行69–100）。COはPluginの申告するcapabilityを見て、どのRPCを呼ぶかを決める（行640–643）。
  - `VOLUME_ACCESSIBILITY_CONSTRAINTS` を申告したPluginのvolumeは、全nodeから同じようには到達できない。COは、CreateVolumeの応答のtopologyと `NodeGetInfo` のtopologyを使って、workloadを置くnodeからvolumeに届くことを確かめなければならない（行645–651）。応答の `accessible_topology` を省略すれば、COはvolumeが全nodeから到達可能とみなしてよく（MAY）、任意のnodeにworkloadを置いてよい（行1102–1105）。
  - `TopologyRequirement` は `requisite`（このどれかから到達できなければならない）と `preferred`（この順に試す）を持つ。requisiteのどれからも到達可能にできなければ、SPはCreateVolumeを失敗させる（行1121–1135、1180–1199）。
  - CreateVolumeは冪等でなければならない。同じ `name` のvolumeが既にあり、要求と両立すれば成功を返す（行807–808）。`name` はCOが冪等性のために生成し、Pluginが冪等性を守れない場合はCOの回復処理で未使用のvolumeが複数できうる、と書いている（行827–835）。
  - 1つのvolumeに同時に飛ぶ呼出しは1つまでにするのがCOの責任だが、COが状態を失った後は同時呼出しが起こりうるので、Pluginはできるだけ穏当に扱い、`ABORTED` を返してよい（行473–478）。
- 解いている問題と前提：orchestratorとstorage実装を分け、どちらも相手の内部を知らずに組み合わせられるようにする。到達範囲（topology）を、配置とvolume作成の両方が参照する共通の語彙（key-valueの組）にする。
- 必要な入力：Pluginのcapability、nodeのtopology（`NodeGetInfo`）、COが生成するvolume名、topology要求。
- trade-off・失敗の仕方：冪等性の実装はSPに委ねられ、守れない場合の結果（未使用volumeの発生）はCO側に残る。topologyの語彙（keyの意味）はSPごとに決まり、仕様は意味を定めない（例はregion・zone）。
- 反例・適用しない場合：capabilityを申告しないPlugin、または `accessible_topology` を返さないPluginでは、COはtopologyを照合しなくてよい（MAY）。照合が実際に省かれるかはCOの実装次第で、これは仕様の文言から導いた推論である。
- 互換・非互換：P24-O10の遅延結合は、このtopology要求を配置後のnodeから組み立てる側にあたる（KEP-1472 行110–113の記述）。P24-O12のaccess modeも同じcapabilityの仕組みで申告される。
- 限界：エラーコード表の全体、secret、group snapshotは読んでいない。size上限等の値は持ち込まない。

### P24-O12 access mode：「何台のnodeから」「何個のworkloadから」「読み書きか」を宣言し、強制はRPCの応答とschedulerに分かれる
- 出典：kubernetes、`staging/src/k8s.io/api/core/v1/types.go` 行973–987（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/core/v1/types.go#L973-L987）、`pkg/scheduler/framework/plugins/volumerestrictions/volume_restrictions.go` 行241–304（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/scheduler/framework/plugins/volumerestrictions/volume_restrictions.go#L241-L304、https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/pkg/scheduler/framework/plugins/volumerestrictions/volume_restrictions.go#L322-L334）。container-storage-interface/spec、`spec.md` 行986–1018、2726–2754（https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L986-L1018、https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L2726-L2754）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - KubernetesのPVのaccess modeは、ReadWriteOnce（1台のhostから読み書き）、ReadOnlyMany、ReadWriteMany、ReadWriteOncePod（1つのpodから読み書き。他のmodeと併用できない）である（types.go 行975–987）。ReadWriteOnceの単位はpodではなくhostである。
  - ReadWriteOncePodは、schedulerの `VolumeRestrictions` pluginが強制する。PreFilterは、podが使うPVCのうちReadWriteOncePodのものと、そのうち既に他のpodに使われているPVCの数を計算し、cycle stateに保存するだけである（volume_restrictions.go 行175–205、241–256。数えているのは使用中のRWOPのPVCで、行247–249）。`Unschedulable` を返すのはFilterで、保存された数が0でなければ拒否する（行296–304、322–334）。preemptionで解消しうるかも評価する（Filterのcomment、行320–321）。
  - CSIのaccess modeは、SINGLE_NODE_WRITER、SINGLE_NODE_READER_ONLY、MULTI_NODE_READER_ONLY、MULTI_NODE_SINGLE_WRITER、MULTI_NODE_MULTI_WRITER、SINGLE_NODE_SINGLE_WRITER／SINGLE_NODE_MULTI_WRITER（後2者はalpha）を列挙する（spec.md 行986–1018）。
  - 同じnode上で2回目の `NodePublishVolume` が来たとき、target pathと引数の一致・不一致とaccess modeの組合せで、OK・ALREADY_EXISTS・FAILED_PRECONDITIONのどれを返すかを表で定める（行2735–2751）。SINGLE_NODE_WRITERは、writerの数を明確にする2つのmodeで置き換える意図で、古いCOのために、新modeを支える場合も受け付けなければならない（行2753–2754）。
- 解いている問題と前提：共有の度合い（node単位、workload単位）と書込みの可否を宣言し、二重mountによるdata破壊を防ぐ。強制は「配置前（scheduler）」と「mount時（Pluginの応答）」の2か所に分かれる。
- 必要な入力：volumeの共有の度合い、Pluginの申告するcapability、PVCを使用中のpodの情報。
- trade-off・失敗の仕方：ReadWriteOnceは「1台のhost」なので、同じnode上の複数podからは同時に書けうる（型のcommentから導いた推論。kubelet側の挙動は読んでいない）。podの単位で排他したい場合は別のmodeが要り、旧modeとの互換のために列挙が増えている。
- 反例・適用しない場合：access modeを申告しない一時volume（emptyDir等）は対象外。
- 互換・非互換：P24-O05のPreFilter／Filterに置かれ、P24-O08のpreemptionと連動する。P24-O11のcapability申告と組み合わさる。
- 限界：KubernetesのaccessModeとCSIのaccess modeの対応表（変換の箇所）は読んでいない。

### P24-O13 snapshotを「要求」「実体」「class」の3つの型に分け、切り取り（cut）と後処理の完了を区別する
- 出典：container-storage-interface/spec、`spec.md` 行2128–2169（https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L2128-L2169）、`spec.md` 行670–679（https://github.com/container-storage-interface/spec/blob/25b3f10249abe6033887ed5177e856b9f73b1105/spec.md#L670-L679）。enhancements、`keps/sig-storage/177-volume-snapshot/README.md` 行72–76、115–127、219–233（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-storage/177-volume-snapshot/README.md#L72-L76、https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-storage/177-volume-snapshot/README.md#L115-L127、https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-storage/177-volume-snapshot/README.md#L219-L233）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - CSIの `CreateSnapshot` は冪等で、snapshotが切り取られるまでblockする。切り取り後に後処理（uploadなど）があるSPは、成功を返しつつ `ready_to_use` をfalseにし、COは同じ要求を繰り返して `ready_to_use` がtrueになるのを待つ（spec.md 行2133–2139、2161–2169）。COは任意で（MAY）、切り取りの前にapplicationを止める（freeze）ことができる。freezeした場合は、切り取りの後、後処理の完了を待たずに再開（thaw）できる（行2148–2158）。snapshotから元volumeを巻き戻す操作は範囲外である（行2144）。
  - `SNAPSHOT_ACCESSIBILITY_CONSTRAINTS`（alpha）を申告するPluginのsnapshotは全topologyから使えるとは限らず、COは応答のtopologyで、snapshotからvolumeを作れる場所を確かめる（行670–679）。
  - KEP-177は、元の設計文書が承認・実装された後に書かれ、test plan、graduation、production readinessの節を補ったものだと冒頭で述べている（行72–76）。beta化で、alphaと非互換に `DeletionPolicy` を必須にし、「利用者に明示させて混乱の余地をなくす」とした（行119–123）。`VolumeSnapshot`（利用者の要求）と `VolumeSnapshotContent`（storage上の実体の表現）を `BoundVolumeSnapshotContentName` で結び付ける（行124–127）。
  - controllerを、3つのCRDを見るsnapshot-controllerと、ContentとClassだけを見てCSIを呼ぶsidecarに分けた。削除はfinalizerで順序付け、deletion policyがretainなら、storage上のsnapshotとContentを残す（行219–233）。
- 解いている問題と前提：利用者のnamespaceの要求と、cluster単位のstorage上の実体を分け、供給方式（class）と削除時の扱い（policy）を宣言で決める。切り取りの完了と使用可能になる時点を分け、applicationを止める時間を短くする。
- 必要な入力：元volume（またはsnapshot handle）、snapshot class、deletion policy、Pluginのcapability。
- trade-off・失敗の仕方：後処理が長くかかりうる（行2149）ため、COは繰返しの呼出しで状態を監視する。失敗時はCOがsnapshotを明示的に消すべきとされ（行2165–2166）、後始末はCO側に残る。alpha→betaの変更はAPIの非互換を伴った。
- 反例・適用しない場合：applicationの整合性（freezeの範囲）はCOの責任で、仕様はfreezeの方法を定めない。
- 互換・非互換：P24-O10の「class＋要求＋結合された実体」と同じ形（StorageClass／PVC／PV）を、snapshotに当てたもの。P24-O11のcapability申告と冪等な名前付き作成を共有する。
- 限界：設計文書の本体（design-proposals-archive）は別repositoryで、読んでいない。group snapshot、snapshot metadata serviceは読んでいない。

### P24-O14 宣言の値を「写して固定する」か「参照して読む」か：admissionでpodへ写す設計と、API serverへ公開して読む設計
- 出典：enhancements、`keps/sig-scheduling/902-non-preempting-priorityclass/README.md` 行113–119（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-scheduling/902-non-preempting-priorityclass/README.md#L113-L119）、`keps/sig-storage/1472-storage-capacity-tracking/README.md` 行232–270（https://github.com/kubernetes/enhancements/blob/f7be055669b365e9b4ab3905bda6ef385e0c84ca/keps/sig-storage/1472-storage-capacity-tracking/README.md#L232-L270）。kubernetes、`staging/src/k8s.io/api/core/v1/types.go` 行4668–4674（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/core/v1/types.go#L4668-L4674）、`staging/src/k8s.io/api/storage/v1/types.go` 行43–54（https://github.com/kubernetes/kubernetes/blob/a35a8c1a36c8ec8c61256fb7fb7aef0b70806938/staging/src/k8s.io/api/storage/v1/types.go#L43-L54）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 優先度と先取りの可否は、PriorityClassという共有の宣言から、pod admission時にPodSpecへ写される。KEP-902はその利点として、schedulerがPriorityClassを知らずに済むこと、PriorityClassを変えても既存podに影響しないこと、static podにも設定できることを挙げる（行113–119）。型のcommentも、Priority admission controllerが有効な場合に、admission controllerが値を入れ、利用者による直接の設定を防ぐと書いている（types.go 行4668–4672）。
  - 一方、storage容量は時間で変わる外部の状態で、sidecarがAPI serverへ公開し、schedulerがそれを読む（KEP-1472 行241–270）。StorageClassの `provisioner` と `parameters` には変更不可のtag（`+k8s:immutable`）が付いている（storage/v1 types.go 行43–54）。原文にはtagがあるだけで理由は書かれていない。作成済みvolumeとの不一致を避けるため、というのは作成側の推論である。
- 解いている問題と前提：宣言（class）を変えたときに、既に動いているもの（pod、volume）へ影響させるかどうか。強制する部品（scheduler）が、どの宣言を直接読むかを減らす。
- 必要な入力：変更の頻度、既存の対象への影響を許すかどうか、強制する部品が読める場所（API server）。
- trade-off・失敗の仕方：写す方式では、classを変えても既存podは古い値のままになる（意図された性質）。参照する方式では、公開の遅れが判断の古さになる（P24-O10）。変更不可にする方式では、変えたいときに新しいclassを作り直す必要がある。
- 反例・適用しない場合：network policy（P24-O01〜O04）は写さず、強制側が常に最新の宣言を読んで反映する（反映の遅れや適用状態はAPIから読めない。P24-O01）。
- 互換・非互換：P24-O08（優先度）、P24-O10（storage class）、P24-O13（snapshot class）の宣言の扱いを横断した観察である。
- 限界：この観察は、複数の出典を並べて作成側が抽出した比較で、どの出典もこの区別を一般原則としては書いていない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| network policyの合成 | Kubernetes `v1.NetworkPolicy`：allowだけを加算で合成し、順序を持たない（O01） | network-policy-api：層（Admin／NetworkPolicy／Baseline）とpriority、Accept／Deny／Pass（O02）。Cilium：denyがallowに常に優先（O04） | 誰が書くか（開発者か管理者か）。拒否を表す必要があるか |
| policyの強制の単位 | IP・CIDRのfilter（identity.rstが従来方式として挙げる） | Cilium：label由来のidentity（O03） | podのchurnの大きさ。identityを配るstoreを持てるか |
| L7の強制 | Kubernetes `v1.NetworkPolicy`：L7を持たない（O01） | Cilium：L4規則に埋め込み、node-localのproxyで強制し、違反には応答を返す（O04） | proxyを経由できるか。dropと応答のどちらを失敗の形にするか |
| 資源の割当て | scheduler：実効の要求（省略時は上限からdefault。restartable init containerは累積）とAllocatableの残りで配置し、上限を別の配置上限として直接は比べない（O06） | kubelet：実使用量と要求・優先度で追い出し（O07） | 判断の時点（配置前か実行中か） |
| 容量不足時の優先 | scheduler：優先度の低いpodを先取り。PDBは、node内では戻す順、node間では違反数の少ない候補の優先として扱い、違反は禁止しない（O08） | 先取りしない優先度（`PreemptionPolicy=Never`）でqueueの順序だけを上げる（O08） | 途中の仕事を捨ててよいか |
| 配置の制約の強さ | hard／soft×配置時だけ（affinity、spread）（O09） | taint：effectごとに強制する部品が違う（scheduler／NodeController）（O09） | 実行中の変化に追従させるか |
| volumeとnodeの到達範囲 | Kubernetes：`WaitForFirstConsumer` で作成を配置まで遅らせ、容量を公開して照合（O10） | CSI：requisite／preferredのtopology要求と、capabilityの申告（O11） | storageが全nodeから同じように届くか |
| 共有の度合い | Kubernetes：ReadWriteOnce（host単位）とReadWriteOncePod（pod単位、schedulerで強制）（O12） | CSI：nodeの数×writerの数を列挙し、2回目のpublishの応答表で強制（O12） | 排他の単位（host／pod／workload） |
| snapshot | CSI：冪等な作成、切り取りと `ready_to_use` の区別（O13） | Kubernetes：要求・実体・classの3型と、finalizerによる削除の順序（O13） | storage側の後処理の有無。削除時に実体を残すか |
| 宣言の変更の波及 | PriorityClass：admissionでpodへ写して固定（O14） | storage容量：API serverへ公開して読む。StorageClassは変更不可（O14） | 既存の対象へ影響させるか |

## 見つからなかったこと・gap
- network policyの「適用された状態」：`v1.NetworkPolicy` はstatusを持たず（P24-O01）、ClusterNetworkPolicyのstatusは実装任せである（P24-O02）。宣言がどのnodeでいつ強制されたかを確認する共通の仕組みは、今回読んだ範囲では見つからなかった。
- Ciliumのdeny優先と、network-policy-apiの層（Admin／Baseline）を同時に使った場合の評価順は、今回読んだ文書には書かれていなかった（CiliumのClusterNetworkPolicy対応は読んでいない）。
- 資源の上限（limits）をどこで強制するか（cgroup、container runtime）は、kubernetesのkubelet・runtime側のcodeを読んでおらず、確認できなかった。
- node単位のvolume数の上限（CSIの `max_volumes_per_node`、schedulerの `nodevolumelimits` plugin）は存在を確認しただけで読んでいない。
- KubernetesのaccessModeとCSIのaccess modeの変換箇所（external-provisioner等、別repository）は読んでいない。
- 仮想networkそのもの（IPAM、routing、overlay）の構成は、Ciliumの `Documentation/network/concepts/` の一覧を確認しただけで読んでいない。本テーマの問い（policyの宣言と強制）に絞ったためである。
- rook/rookなど、特定のstorage実装の内部（Cephの配置、複製）は読んでいない。
- ADR形式の設計記録はどのrepoにも見当たらなかった。判断の根拠は、KEP・NPEP・型のdoc comment・文書にある。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：5 repoを作業用の一時領域へ `git clone --filter=blob:none --no-checkout` し（core.hooksPathを無効化）、固定commitの必要なfileだけを `git show <sha>:<path>` で読んだ。build・test・script・hookは実行していない。SPDX・archived・default branchは `gh api repos/<owner>/<repo>` で取得した。
- kubernetes：`staging/src/k8s.io/api/networking/v1/types.go`（25–206）、`staging/src/k8s.io/kube-scheduler/framework/interface.go`（440–470, 521–612, 654–740）、`pkg/scheduler/framework/plugins/noderesources/fit.go`（296–335, 650–790）、`pkg/apis/core/v1/helper/qos/qos.go`（commentの全体）、`pkg/kubelet/eviction/helpers.go`（679–730, 814–845）、`pkg/scheduler/framework/plugins/defaultpreemption/default_preemption.go`（280–300, 340–420, 448–490）、`staging/src/k8s.io/api/core/v1/types.go`（970–992, 3109–3118, 4223–4245, 4325–4410, 4655–4675, 5020–5080）、`staging/src/k8s.io/api/storage/v1/types.go`（30–125）、`pkg/scheduler/framework/plugins/volumerestrictions/volume_restrictions.go`（38–100, 174–340）、`pkg/scheduler/framework/preemption/preemption.go`（355–382, 455–536。照合担当の指摘を受けて読んだ範囲だけ）、`pkg/apis/core/v1/helper/qos/qos.go`（43–49）、`staging/src/k8s.io/component-helpers/resource/helpers.go`（240–289）、`staging/src/k8s.io/api/core/v1/types.go`（3150–3162）、`pkg/apis/core/v1/defaults.go`（165–215）。これら3つは独立reviewの指摘を受けて読んだ範囲だけで、`PodRequests` の前半（pod単位の資源、overhead、status由来の資源の分岐）とdefaults.goの他の関数は読んでいない。読んでいないもの：`pkg/scheduler/framework/plugins/volumebinding/`、`nodevolumelimits/`、`podtopologyspread/`、`interpodaffinity/`、`dynamicresources/`、kubeletのcgroup・admission、`plugin/pkg/admission/priority`。
- container-storage-interface/spec：`spec.md`（19–33, 69–100, 164–215, 473–479, 640–680, 802–840, 984–1018, 1095–1135, 1180–1200, 2128–2170, 2709–2755）と見出し一覧。読んでいないもの：`csi.proto`、`lib/`、エラー表の全体、GroupController、SnapshotMetadata。
- cilium：`Documentation/security/network/identity.rst`（全体）、`Documentation/security/policy/layer7.rst`（1–75）、`deny.rst`（全体）、`intro.rst`（1–75）、`pkg/policy/api/l4.go`（1–330）。読んでいないもの：`pkg/policy/api/rule.go`・`rules.go`、`pkg/policy/` の解決処理、`bpf/`、`pkg/identity/`、`Documentation/network/concepts/` の本文、`Documentation/security/policy/caveats.rst`。
- kubernetes-sigs/network-policy-api：`apis/v1alpha2/clusternetworkpolicy_types.go`（1–210）、`npeps/npep-285-combine-crds.md`（1–80）と一覧。読んでいないもの：`apis/v1alpha1/`（ANP・BANP）、NPEP-122・126・133・137・187、conformance test。
- enhancements：`keps/sig-storage/1472-storage-capacity-tracking/README.md`（見出し、94–126, 232–272, 700–745, 1128–1166）、`keps/sig-scheduling/902-non-preempting-priorityclass/README.md`（見出し、50–158）、`keps/sig-scheduling/268-priority-preemption/README.md`（60–84。testと実装履歴へのlinkだけで、設計本文は別repositoryの設計文書にある）、`keps/sig-storage/177-volume-snapshot/README.md`（見出し、72–77, 115–150, 219–234, 578–592）。sig-storage・sig-schedulingのKEP directory一覧で、題名に capacity／priority／preempt／topology／snapshot を含むものを確認した（557-csi-topology、3280-guarantee-pdb-when-preemption-happens、4832-async-preemption 等は題名だけ）。
- 検索した語：`NetworkPolicy`、`policyTypes`、`Tier`、`Pass`、`identity`、`L7Rules`、`PortDenyRule`、`EnableDefaultDeny`、`Plugin interface`、`computePodResourceRequest`、`Allocatable`、`ComputePodQOS`、`rankMemoryPressure`、`PreemptionPolicy`、`PreemptNever`、`PodDisruptionBudget`、`IgnoredDuringExecution`、`TaintEffect`、`whenUnsatisfiable`、`VolumeBindingMode`、`WaitForFirstConsumer`、`allowedTopologies`、`ReadWriteOncePod`、`accessibility_requirements`、`requisite`、`VOLUME_ACCESSIBILITY_CONSTRAINTS`、`idempot`、`ready_to_use`。
- 選ばなかった候補：rook/rook（理由は「調べたrepository」の注記）。kubernetes/design-proposals-archive（KEP-268・177が本文を委ねている先だが、今回は読んでいない）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。仕様（CSI spec）、提案API（network-policy-apiのv1alpha2、NPEPはExperimental）、設計提案（KEP）、型のdoc comment、実装（scheduler・kubeletのcode）が混在している。KEP-902の提案field（`Preempting`）と実装の型（`PreemptionPolicy`）のように、設計文書と実装が食い違う場合の由来の区別は未決である。
- scope：観察は「宣言（API型）と、それを強制する部品」の境界に限った。HELIXのD07で、これをnetwork・compute・storageのどの知識recordに対応させるか、またP12（topology・provider抽象）やP17（負荷制御）と重なる部分をどう分けるかは未決である。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。network-policy-apiはalpha APIで、名前・fieldの変更が続いている（NPEP-285の改名の経緯）。CSIのaccess mode・snapshot topologyにもalphaの列挙値がある。再観察の時期は未決である。
- 状態：全観察（P24-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
