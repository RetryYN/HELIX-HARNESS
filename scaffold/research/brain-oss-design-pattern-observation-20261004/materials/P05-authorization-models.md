# P05 認可modelの観察（D08 Security、D03 Backend）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| openfga/openfga | https://github.com/openfga/openfga | 97943bf64d85ac3015272d90ab1145696db9ef5b | Apache-2.0 | false | 2026-10-04 | Zanzibar型ReBAC。consistency preferenceを持つが、zookieは持たない（issue #1777）。SpiceDBとの対照に使う |
| authzed/spicedb | https://github.com/authzed/spicedb | dbc16016e92987c531658eae0770261c77434adf | Apache-2.0 | false | 2026-10-04 | Zanzibar型ReBAC。ZedToken（zookieの後継）、4種のconsistency、caveat、new enemyのe2eを持つ |
| casbin/casbin | https://github.com/casbin/casbin | 524f3f2dc9baef696d748db491d49b3055d359d1 | Apache-2.0 | false | 2026-10-04 | ACL/RBAC/ABACをmodel設定とeffect式の組合せで表すlibrary型PDP |
| open-policy-agent/opa | https://github.com/open-policy-agent/opa | 3f2d1bd96090b9ecf29c29fabe1eaf38883ea140 | Apache-2.0 | false | 2026-10-04 | 汎用policy engine。policyと判定の分離、Regoのtest機構、bundle revisionを持つ |
| cerbos/cerbos | https://github.com/cerbos/cerbos | dde4d11e09f76d3d380db8c999831185c13542e8 | Apache-2.0 | false | 2026-10-04 | 既定拒否と、role単位のdeny優先を明文化したPDP。YAMLのpolicy testと、評価errorの扱い（strictEvaluation）を持つ |

## 観察

### P05-O01 effect結合式によるallow／denyの合成（Casbin PolicyEffect）
- 出典：casbin、`effector/default_effector.go` 行35–111（https://github.com/casbin/casbin/blob/524f3f2dc9baef696d748db491d49b3055d359d1/effector/default_effector.go#L35-L111）、`constant/constants.go` 行28–34（https://github.com/casbin/casbin/blob/524f3f2dc9baef696d748db491d49b3055d359d1/constant/constants.go#L28-L34）、`enforcer.go` 行858–921（https://github.com/casbin/casbin/blob/524f3f2dc9baef696d748db491d49b3055d359d1/enforcer.go#L858-L921）、`examples/rbac_with_deny_model.conf` 行1–13（https://github.com/casbin/casbin/blob/524f3f2dc9baef696d748db491d49b3055d359d1/examples/rbac_with_deny_model.conf#L1-L13）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：model（`.conf`）は `request_definition`、`policy_definition`、`role_definition`、`policy_effect`、`matchers` の5区画を宣言する。`Enforcer.enforce` は、policy行ごとにmatcherを評価してmatch配列を作り、`p_eft` 列から `Allow`／`Deny`／`Indeterminate` のeffect配列を作る（`eft` 列がないときは `Allow` とみなす）。そのあと `DefaultEffector.MergeEffects` が `policy_effect` の文字列をもとに1つの判定へまとめる。対応する式は固定の5種で、allow-override、deny-override、allow-and-deny、priority、subjectPriority である。未対応の式は `Deny` とerrorを返す。最終的に、`effect == Allow` のときだけ `true` を返す（`Indeterminate` は拒否になる）。
- 解いている問題と前提：同じenforcerでACL、RBAC、ABACを切り替えるために、合成規則をmodel側の宣言に置いている。policyはin-memoryに載ること、matcherは式評価器で評価されることが前提である。
- 必要な入力：request tupleの列構成、policy行の列構成（`eft` 列を持つかどうか）、5種の結合式のどれを使うか。
- trade-off・失敗の仕方：`DenyOverrideEffect`（`!some(where (p_eft == deny))`）は、denyが1件もmatchしなければ最後の行で `Allow` を返す（行58–61）。名前はdeny優先だが、既定拒否ではない。既定拒否と組み合わせるには、allow-and-deny（`some(allow) && !some(deny)`）を選ぶ必要がある。effectの評価は行ごとに短絡する（行876–882）。
- 反例・適用しない場合：priority系は、policyの並び順をeffectの意味に使う。Cerbos（O10）は並び順を使わない。
- 互換・非互換：O02（RBACのrole解決）と組み合わせて使う。O10（Cerbosのrole単位の結合）とは結合の単位が違う。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P05-O02 role継承グラフの深さ上限付き探索と、enforcer無効化時の全許可（Casbin RoleManager／EnableEnforce）
- 出典：casbin、`rbac/default-role-manager/role_manager.go` 行312–350（https://github.com/casbin/casbin/blob/524f3f2dc9baef696d748db491d49b3055d359d1/rbac/default-role-manager/role_manager.go#L312-L350）、`enforcer.go` 行620–624 と 行715–717（https://github.com/casbin/casbin/blob/524f3f2dc9baef696d748db491d49b3055d359d1/enforcer.go#L620-L624 、https://github.com/casbin/casbin/blob/524f3f2dc9baef696d748db491d49b3055d359d1/enforcer.go#L715-L717）、`persist/watcher.go` 行20–32（https://github.com/casbin/casbin/blob/524f3f2dc9baef696d748db491d49b3055d359d1/persist/watcher.go#L20-L32）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`HasLink(name1, name2, domains...)` は、`g` 関係（user→role、role→role）を幅優先で辿る。`hasLinkHelper` は残りの深さが負になると `false` を返して探索を打ち切る。上限はconstructorの `maxHierarchyLevel` で決まる。照会のために一時作成したroleは、deferで削除する。`EnableEnforce(false)` にすると、`enforce` が先頭で `true` を返す（docコメントに「all access will be allowed」と明記されている）。複数instance間の同期は `Watcher` interfaceが担う。他instanceからの更新を受けると、callbackで `LoadPolicy` を再実行する。
- 解いている問題と前提：循環や深いrole継承でも停止させること。policyの正本はDB adapterにあり、各instanceはin-memoryの写しを持つことが前提である。
- 必要な入力：role継承の深さ上限（値は持ち込まない）、domainを使うかどうか、watcherの実装。
- trade-off・失敗の仕方：深さ上限を超えた継承は、errorではなく `false`（不一致）になり、黙って拒否される。enforcer無効化は、拒否ではなく全許可に倒れる（fail-open）。watcherによる同期は通知と再読込みであり、判定がどの版のpolicyを使ったかを示すtokenはない。
- 反例・適用しない場合：SpiceDBとOpenFGAは、role継承をrelationのrewriteとして表し、cycleは訪問済み集合で止める（O03）。
- 互換・非互換：O01と組み合わせて使う。O06（revision指定の判定）のような、判定と版の対応付けは持たない。
- 限界：深さの値などの製品固有値は持ち込まない。

### P05-O03 relation rewrite（union／intersection／exclusion）のグラフ評価と、resolverの層構成（OpenFGA Check）
- 出典：openfga、`docs/check/README.md` 行36–62、行459–462、行535–593（https://github.com/openfga/openfga/blob/97943bf64d85ac3015272d90ab1145696db9ef5b/docs/check/README.md#L36-L62 、https://github.com/openfga/openfga/blob/97943bf64d85ac3015272d90ab1145696db9ef5b/docs/check/README.md#L459-L462 、https://github.com/openfga/openfga/blob/97943bf64d85ac3015272d90ab1145696db9ef5b/docs/check/README.md#L535-L593）。信頼性ラベル：primary。本文確認：済
- 何をしているか：Checkは `object#relation@user` を始点に、rewrite規則（direct、computed userset、tuple-to-userset、union／intersection／exclusion）に沿って有向グラフを展開する。exclusion（`but not`）はbase集合とsubtracted集合を並行に評価し、「baseがfalse」または「subtractedがtrue」が先に確定した時点で短絡する。cycleは訪問済みsubproblem（`VisitedPaths`）で検出し、再dispatchしない。resolverは `CachedCheckResolver` → `DispatchThrottledCheckResolver` → `LocalChecker` の順に重なり、LocalCheckerは子問題を先頭層へ戻してloopbackする。
- 解いている問題と前提：RBAC（roleをrelationとして表す）、階層（親folderの継承）、例外（restricted）を1つのgraph modelで表すこと。tuple数が多く、子問題の重複が多いことが前提である。
- 必要な入力：型ごとのrelation定義（authorization model）と、relationship tuple。
- trade-off・失敗の仕方：文書内の「Resolution Depth／Breadth」の節は `todo: fill me out` のままで、深さや並列度の制御は文書化されていない。throttle層は、dispatch数が閾値を超えると遅延を入れる（閾値は持ち込まない）。
- 反例・適用しない場合：Casbin（O01）は、グラフのrewriteではなく行単位のmatcherとeffect式で表す。OPA（O08）は、任意のdocumentに対するルール評価で表す。
- 互換・非互換：O04（consistency）、O05（model ID）と組み合わせて使う。SpiceDBの差集合（O07）と構造が対応する。
- 限界：製品固有の値は持ち込まない。

### P05-O04 consistency preferenceの2値と、cache・replicaの迂回（OpenFGA）。zookieは未実装
- 出典：openfga、`docs/caching.md` 行13–24（https://github.com/openfga/openfga/blob/97943bf64d85ac3015272d90ab1145696db9ef5b/docs/caching.md#L13-L24）、`pkg/storage/mysql/mysql.go` 行182–192（https://github.com/openfga/openfga/blob/97943bf64d85ac3015272d90ab1145696db9ef5b/pkg/storage/mysql/mysql.go#L182-L192）、`pkg/server/commands/check_command.go` 行108–125（https://github.com/openfga/openfga/blob/97943bf64d85ac3015272d90ab1145696db9ef5b/pkg/server/commands/check_command.go#L108-L125）、issue https://github.com/openfga/openfga/issues/1777 （本文と、maintainerのcommentを読んだ）。信頼性ラベル：primary。本文確認：済
- 何をしているか：requestの `ConsistencyPreference` が `HIGHER_CONSISTENCY` のときは、check query cacheとiterator cacheを使わず（model・typesystemのcacheだけは常に使う）、cache invalidation時刻も計算しない。さらに、MySQL datastoreはprimary DBへ読みを回す。それ以外のときは、secondary DBが設定されていればそちらを読む。
- 解いている問題と前提：遅延と鮮度を、requestごとに2値で選ばせること。cacheはreplicaごとのin-memoryで共有されない、と文書が明記している。
- 必要な入力：呼び出し側が、どのrequestで新しさを必要とするかを判断すること。
- trade-off・失敗の仕方：caching.md は、query cacheを有効にするとCheckとListObjectsが「eventually consistent」になると明記している。issue #1777 では、maintainerが次の2点を述べている。zookieは未実装であること。cacheを有効にするとnew enemy problemから守られないこと。また、zookieを使うと、利用者側でtokenを保存し、どのentityのtokenを送るかを選ぶ手間が増えること。代替として、既存の最終更新時刻とcache TTLの比較で、整合読みを選ぶ方法がcommentで示されている（TTLの値は持ち込まない）。
- 反例・適用しない場合：SpiceDB（O06）は、revisionを埋め込んだtokenで「少なくともこの時点より新しい」判定を指定できる。
- 互換・非互換：O06とは、整合の指定方法が非互換である（2値の選択とtoken指定）。
- 限界：製品固有の値（cache TTL、件数）は持ち込まない。

### P05-O05 immutableなauthorization modelのIDと、未指定時の最新model解決（OpenFGA）
- 出典：openfga、`docs/caching.md` 行24（https://github.com/openfga/openfga/blob/97943bf64d85ac3015272d90ab1145696db9ef5b/docs/caching.md#L24-L24）、`pkg/typesystem/resolver.go` 行57–79（https://github.com/openfga/openfga/blob/97943bf64d85ac3015272d90ab1145696db9ef5b/pkg/typesystem/resolver.go#L57-L79）、`pkg/server/server.go` 行1078–1108（https://github.com/openfga/openfga/blob/97943bf64d85ac3015272d90ab1145696db9ef5b/pkg/server/server.go#L1078-L1108）。信頼性ラベル：primary。本文確認：済
- 何をしているか：modelの更新は、常に新しいmodel ID（ULID）を作る。requestにmodel IDがなければ `FindLatestAuthorizationModel` で最新を解決する（singleflightで重複照会をまとめる）。解決したIDは、response headerとtraceに載せる。
- 解いている問題と前提：policy（model）の版を固定参照できるようにし、model・typesystemのcacheを無効化不要にすること。
- 必要な入力：呼び出し側が、model IDを固定するか最新に追随するかを決めること。
- trade-off・失敗の仕方：ID未指定のrequestは、model更新の直後から新しいmodelで評価される。どの版で判定したかは、response headerを記録しなければ追跡できない。
- 反例・適用しない場合：SpiceDBは、schema hashをZedTokenに入れる（O06）。OPAは、bundle revisionをdecision logに記録する（O08）。
- 互換・非互換：O04と組み合わせて使う。O08（判定と版の記録）と対応する。
- 限界：製品固有の値（cacheの寿命など）は持ち込まない。

### P05-O06 revision・datastore ID・schema hashを埋め込んだ一貫性token（SpiceDB ZedToken）と4種のconsistency
- 出典：spicedb、`pkg/zedtoken/zedtoken.go` 行85–111、行150–205（https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/pkg/zedtoken/zedtoken.go#L85-L111 、https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/pkg/zedtoken/zedtoken.go#L150-L205）、`pkg/middleware/consistency/consistency.go` 行32–51、行111–218、行286–331（https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/pkg/middleware/consistency/consistency.go#L32-L51 、https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/pkg/middleware/consistency/consistency.go#L111-L218 、https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/pkg/middleware/consistency/consistency.go#L286-L331）。信頼性ラベル：primary。本文確認：済
- 何をしているか：ZedTokenは、revision文字列、datastore unique IDの先頭部分、schema hashをprotobufに詰めてbase64にした、不透明な値である。decode時には、旧形式の `DeprecatedV1Zookie` も受け入れる。consistency middlewareはrequestごとに評価revisionを決め、contextへ入れる。
  - `minimize_latency` または未指定：最適化されたrevision。
  - `fully_consistent`：head revision。
  - `at_least_as_fresh`：tokenのrevisionと現在の最適化revisionのうち、新しい方。
  - `at_exact_snapshot`：tokenのrevisionそのもの（失効していればerror）。
  - cursor付きのrequestは、cursorのrevisionを優先する。
  - 別のdatastoreのtokenが来たときの扱いは、`MismatchingTokenOption`（full consistency扱い／min latency扱い／error）で選ぶ。
- 解いている問題と前提：書込み後の判定が、その書込みを反映していること（new enemy problemの回避）。datastoreがMVCCのrevisionを持つことが前提である。
- 必要な入力：書込みの応答で得たtokenを、呼び出し側がどこに保存し、どの判定に添えるか。
- trade-off・失敗の仕方：exact snapshotは、GCされたrevisionではerrorになる（`CheckRevision`）。tokenの不一致の扱いを最小遅延にすると、警告logを出すだけで鮮度の保証を失う。`default` 分岐は、未対応のconsistencyを `Internal` errorにする（行217–218）。
- 反例・適用しない場合：OpenFGA（O04）はtokenを持たず、2値の選択だけを提供する。Casbin（O02）は、判定とpolicy版を対応付けない。
- 互換・非互換：O07（new enemyのe2e）が、この仕組みの有効性を検証している。O04とは非互換である。
- 限界：製品固有の値（prefix長など）は持ち込まない。

### P05-O07 差集合（exclusion）とcaveatによる三値の判定、およびnew enemyのe2e検証（SpiceDB）
- 出典：spicedb、`internal/graph/check.go` 行1175–1253（https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/internal/graph/check.go#L1175-L1253）、`internal/graph/membershipset.go` 行156–173（https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/internal/graph/membershipset.go#L156-L173）、`internal/services/v1/permissions_queryplan.go` 行152–166（https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/internal/services/v1/permissions_queryplan.go#L152-L166）、`e2e/newenemy/README.md` 行1–23、行54–71（https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/e2e/newenemy/README.md#L1-L71）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`difference` は、base子を評価してから、残りの子を順に差し引く。どれかの子がerrorなら、判定ではなくerrorを返す。`MembershipSet.Subtract` は、差し引く側にcaveatがなければ完全に除去し、caveatがあれば「base caveat AND NOT sub caveat」の式に置き換える。API応答は `HAS_PERMISSION`、`NO_PERMISSION`、`CONDITIONAL_PERMISSION`（不足contextを示す `PartialCaveatInfo` 付き）の三値である。e2eのnew enemy試験は、`permission allowed = direct - excluded` のschemaで、exclude書込み → direct書込み → 後者のrevisionでのcheck、が誤って許可されないことを確かめる。
- 解いている問題と前提：除外規則（deny相当）と条件付き付与を、二値に潰さずに返すこと。分散DB（CockroachDB）でのclock skewを想定している。
- 必要な入力：caveatの評価に必要なcontextを、呼び出し側が渡せるかどうか。
- trade-off・失敗の仕方：README.md によると、CockroachDB上では特定の条件（rangeの分散、clock skew）でnew enemyが起こりうる。Zanzibarは、これをSpannerのTrueTimeで防いでいる（行59–71）。queryplan経路の `MissingRequiredContext` は、空配列とTODOコメントのままである（行159–163）。
- 反例・適用しない場合：OpenFGAのexclusionは、boolean二値で短絡する（O03）。Cerbosは、条件errorを既定で「不一致」とみなす（O11）。
- 互換・非互換：O06と組み合わせて使う。O11（errorを不一致にする扱い）と対照的である。
- 限界：製品固有の値は持ち込まない。

### P05-O08 policyと判定の分離（PDP）、`default` による未定義と拒否の区別、bundle revisionの記録（OPA）
- 出典：opa、`docs/docs/philosophy/index.md` 行42–70（https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/docs/docs/philosophy/index.md#L42-L70）、`docs/docs/policy-language.md` 行2068–2110（https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/docs/docs/policy-language.md#L2068-L2110）、`v1/topdown/errors.go` 行51–55、行132–138（https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/v1/topdown/errors.go#L51-L55 、https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/v1/topdown/errors.go#L132-L138）、`docs/docs/management-bundles/index.md` 行283–288（https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/docs/docs/management-bundles/index.md#L283-L288）、`docs/docs/management-decision-logs.md` 行30–50、行69–70（https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/docs/docs/management-decision-logs.md#L30-L70）、`docs/docs/comparisons/access-control-systems.md` 行14–100、行102–140（https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/docs/docs/comparisons/access-control-systems.md#L14-L140）。信頼性ラベル：primary。本文確認：済
- 何をしているか：サービス（PEP）がqueryを送り、OPA（sidecar、daemon、library）がpolicyとdataから判定を返す。`default allow := false` がないと、どのルールも成立しないとき `allow` は「undefined」になる（falseではない）。完全定義のルールが異なる値を出すと、`eval_conflict_error` になる。bundleの `.manifest` には `revision` を書け、decision logの各eventには `bundles[_].revision` が入る。RBAC、ABAC、職務分離（SOD）は、Regoのルールとして書く例が示されている。SODについては「OPAのAPIでは不正なrole割当の拒否を強制できない、違反の列挙はできる」と明記されている。
- 解いている問題と前提：policyを再ビルドなしで更新すること、判定を記録して監査すること。dataはpush型またはpull型で読み込む。
- 必要な入力：PEPがundefinedをどう扱うか、bundleのrevisionの付け方、decision logの送り先。
- trade-off・失敗の仕方：`default` を書かないと、PEP側の解釈がundefinedに依存する。conflict errorは「policyが読み込んだdataを想定していない」ことを示す、とコメントにある（行51–54）。
- 反例・適用しない場合：Cerbosは、PDP自体が既定拒否を返す（O10）。SpiceDBとOpenFGAは、tupleと判定時のrevisionを結び付ける（O05、O06）。
- 互換・非互換：O09（test）と組み合わせて使う。判定と版の対応付けは、O05、O06と同じ目的である。
- 限界：製品固有の値は持ち込まない。

### P05-O09 policy test：命名規約によるtest発見、`with` による差し替え、空実行の失敗化（OPA）
- 出典：opa、`docs/docs/policy-testing.md` 行164–230、行431–470（https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/docs/docs/policy-testing.md#L164-L230 、https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/docs/docs/policy-testing.md#L431-L470）、`v1/tester/runner.go` 行40–44（https://github.com/open-policy-agent/opa/blob/3f2d1bd96090b9ecf29c29fabe1eaf38883ea140/v1/tester/runner.go#L40-L44）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`test_` で始まるルールをtestとして発見し（`TestPrefix`）、`todo_test_` はSKIPPEDにする。結果はPASS、FAIL（undefinedまたはtrue以外）、ERROR（実行時error）、SKIPPEDに分かれる。`with` で `input`、`data`、関数を差し替えられる（arityの一致などの制約がある）。`--fail-on-empty` を付けると、test 0件を失敗にする。coverageの節もある。
- 解いている問題と前提：policy自体を同じ言語で検証すること。
- 必要な入力：入力とdataのfixture、期待値。
- trade-off・失敗の仕方：test名の誤記などでtestが1件も実行されなくても、既定では成功扱いになる、と明記されている（`--fail-on-empty` が対策）。
- 反例・適用しない場合：Cerbos（O12）は、YAMLの表で、未記載の組を「DENYを期待」とみなす。SpiceDB（O13）は、assertTrue／False／Caveatedの三値で書く。
- 互換・非互換：O08と組み合わせて使う。
- 限界：製品固有の値は持ち込まない。

### P05-O10 既定拒否、role単位のdeny優先、principal→resource→role policyの評価順、scopeの継承規則（Cerbos）
- 出典：cerbos、`docs/modules/policies/pages/evaluation.adoc` 行11–49、行67–120（https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/docs/modules/policies/pages/evaluation.adoc#L11-L120）、`internal/ruletable/check.go` 行58–95、行414–454、行513–530（https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/internal/ruletable/check.go#L58-L95 、https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/internal/ruletable/check.go#L414-L454 、https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/internal/ruletable/check.go#L513-L530）、`docs/modules/policies/pages/scope_permissions.adoc` 行7–33（https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/docs/modules/policies/pages/scope_permissions.adoc#L7-L33）、`docs/modules/policies/pages/derived_roles.adoc` 行8–12（https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/docs/modules/policies/pages/derived_roles.adoc#L8-L12）。信頼性ラベル：primary。本文確認：済
- 何をしているか：出力は、全actionを `EFFECT_DENY`／`noPolicyMatch` で初期化してから、評価結果で上書きする。最後まで `NO_MATCH` のactionは `DENY` にする（行451–453）。
  - 同じroleの中でALLOWとDENYが両方matchすればDENYになる。ただし複数roleのうち1つがALLOWなら、全体はALLOWになる（文書は、admin兼一般userの締め出しを避けるため、と説明している）。
  - `setEffect` は、一度DENYになったactionを後から上書きしない。
  - principal policyのALLOW／DENYが確定したactionでは、resource policyを見ない。
  - role policyは許可を絞るだけで、付与はしない。
  - derived roleは、IdPのroleと属性から実行時に派生する。
  - scopeは下位から上位へ辿る。`OVERRIDE_PARENT` では最初の決定が勝つ。`REQUIRE_PARENTAL_CONSENT_FOR_ALLOWS` では、上位のALLOWも必要になる。
  - 入力がschema検証に失敗し、reject設定なら、全actionをDENYにする（行130–150）。
- 解いている問題と前提：RBACにABAC条件とtenant階層（scope）を重ねること。roleはIdPから来ることが前提である。
- 必要な入力：resource kind、version、scope、principalのrole、属性のschema。
- trade-off・失敗の仕方：deny優先はrole単位に限られる。別roleのALLOWは、あるroleのDENYを越える。scope内で `scopePermissions` が食い違うと、build時errorになる。
- 反例・適用しない場合：Casbinのallow-and-deny（O01）は、role単位ではなく、matchした全行でdenyを優先する。
- 互換・非互換：O11（条件error）、O12（test）と組み合わせて使う。O01とは結合の単位が非互換である。
- 限界：製品固有の値は持ち込まない。

### P05-O11 条件評価errorの扱い：既定は「不一致」扱い、strictEvaluationでは拒否（Cerbos）
- 出典：cerbos、`docs/modules/configuration/pages/engine.adoc` 行95–108（https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/docs/modules/configuration/pages/engine.adoc#L95-L108）、`internal/ruletable/check.go` 行366–378、行679–695、行758–774（https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/internal/ruletable/check.go#L366-L378 、https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/internal/ruletable/check.go#L679-L695 、https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/internal/ruletable/check.go#L758-L774）、PR https://github.com/cerbos/cerbos/pull/3312 （本文を読んだ。2026-08-07 merge）。信頼性ラベル：primary。本文確認：済
- 何をしているか：CEL条件の評価がerrorになると、既定ではそのルールをskipし（不一致とみなす）、評価を続ける。CELの結果がnullやbool以外のときは `false` になる。`strictEvaluation` を有効にすると、errorのあったルールが対象とするactionをDENYにする。変数のerrorは、その変数を参照するactionだけをDENYにする。policy testも `--strict-evaluation` で同じmodeで実行できる。
- 解いている問題と前提：属性の欠落や型の不一致に対する、可用性と安全性の均衡をとること。
- 必要な入力：属性schemaの厳密さ、error時にどちらへ倒すかの方針。
- trade-off・失敗の仕方：文書は、既定の動作では「`EFFECT_DENY` ルールが黙ってskipされうる」と明記している。DENYルールが評価errorで落ちると、別のALLOWが勝つ可能性がある。PR #3312 は、これに対するopt-inの対策である。
- 反例・適用しない場合：SpiceDBの差集合は、子のerrorをerrorとして返す（O07）。OPAは、conflictを `eval_conflict_error` にする（O08）。
- 互換・非互換：O10と組み合わせて使う。O07とは、errorを判定として扱うか、errorとして伝播するかで対照的である。
- 限界：既定値の詳細は持ち込まない。

### P05-O12 principal×resource×actionの行列testで、未記載の組をDENY期待とする（Cerbos）
- 出典：cerbos、`docs/modules/policies/pages/compile.adoc` 行18–24、行176–181（https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/docs/modules/policies/pages/compile.adoc#L18-L24 、https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/docs/modules/policies/pages/compile.adoc#L176-L181）、`internal/verify/test_matrix.go` 行33–70、行236–243（https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/internal/verify/test_matrix.go#L33-L70 、https://github.com/cerbos/cerbos/blob/dde4d11e09f76d3d380db8c999831185c13542e8/internal/verify/test_matrix.go#L236-L243）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`_test` 接尾辞のYAML／JSONで、principals、resources（group可）、actions、expectedを定義する。`buildTestMatrix` は全principal×resourceの直積を作り、expectedがない組には `buildDefaultExpectation`（全actionをDENY）を当てる。inputにない組へのexpectationは、errorにする。suiteとtest単位の `options` で、`now`、policy version、scope、strictEvaluationを固定できる。
- 解いている問題と前提：既定拒否のmodelで、「許可されるべきもの」だけを列挙すれば残りの拒否も検証されること。
- 必要な入力：principal、resource、auxDataのfixture。時刻依存の条件を固定する `now`。
- trade-off・失敗の仕方：expectationの書き忘れは、DENYの期待として扱われる。そのため、許可漏れ（本来ALLOWなのにDENYになる場合）を見逃さない一方、意図して書いたかどうかは区別されない。
- 反例・適用しない場合：OPA（O09）は個別のルールでtrueを確かめる。SpiceDB（O13）は、三値をそれぞれ明示する。
- 互換・非互換：O10、O11と組み合わせて使う。
- 限界：fixtureの値は持ち込まない。

### P05-O13 schema・relationship・assertion・期待relationを1ファイルにまとめたvalidation file（SpiceDB）
- 出典：spicedb、`pkg/validationfile/fileformat.go` 行20–47（https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/pkg/validationfile/fileformat.go#L20-L47）、`pkg/validationfile/blocks/assertions.go` 行15–28（https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/pkg/validationfile/blocks/assertions.go#L15-L28）、`pkg/development/assertions.go` 行18–95（https://github.com/authzed/spicedb/blob/dbc16016e92987c531658eae0770261c77434adf/pkg/development/assertions.go#L18-L95）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`ValidationFile` は、`schema`、`relationships`、`assertions`、`validation`（期待relationの一覧）を持つ。`RunAllAssertions` は、assertTrueを `MEMBER`、assertCaveatedを `CAVEATED_MEMBER`、assertFalseを `NOT_MEMBER` と照合する。assertion側にcaveatを書くとerrorになる（contextは別に渡す）。失敗は、行・列付きの `DeveloperError` と、check debug情報を返す。
- 解いている問題と前提：ReBACのschemaとデータの組で、判定を再現可能に検証すること。
- 必要な入力：テスト用のrelationship集合と、caveat context。
- trade-off・失敗の仕方：三値のassertionにより、条件付き許可を許可と取り違えることを検出できる。旧形式のfield（`namespace_configs`、`validation_tuples`）はdeprecatedとして残っている。
- 反例・適用しない場合：OpenFGAのrepo内では、`tests/check` のGo testが同じ役割を担う（YAML形式のmodel testはCLI側にあると思われるが、未確認）。
- 互換・非互換：O07と組み合わせて使う。
- 限界：製品固有の値は持ち込まない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 新旧判定の整合（new enemy） | SpiceDB：revisionを埋め込んだZedTokenで `at_least_as_fresh`／`at_exact_snapshot` を指定する（O06） | OpenFGA：`HIGHER_CONSISTENCY` でcacheを迂回し、primary DBを読む。tokenはない（O04、#1777） | 利用者側でtokenを保存・選択する負担を受け入れるかどうか。datastoreがrevisionを公開するかどうか |
| policy版と判定の対応付け | OpenFGA：immutableなmodel IDを、responseのheaderに載せる（O05） | OPA：bundleのrevisionを、decision logに記録する（O08）。Casbin：watcherで再読込みするだけで、版は記録しない（O02） | policyを常駐サービスが持つか、library内のin-memoryが持つか |
| deny優先の単位 | Cerbos：role単位ではdeny優先。roleをまたぐとallowが勝つ（O10） | Casbin：allow-and-denyは、match全行でdeny優先（O01）。SpiceDB／OpenFGA：exclusion（差集合）として表す（O03、O07） | roleを「独立した権限束」とみなすか、明示の除外をrelationとして持つか |
| 既定拒否 | Cerbos：PDPがNO_MATCHをDENYにする（O10） | OPA：`default allow := false` をpolicy作成者が書く。書かないとundefinedになる（O08）。Casbin：deny-overrideは、denyがなければ許可する（O01） | 既定値をengineが持つか、policy記述者が持つか |
| 評価errorの扱い | Cerbos：既定ではルールをskipし、strictEvaluationならDENY（O11） | SpiceDB：差集合の子のerrorはerrorとして返す（O07）。OPA：conflictはerror（O08） | 可用性を優先するか、errorを判定から分離するか |
| policy test | Cerbos：行列で、未記載の組をDENY期待にする（O12） | OPA：`test_` ルールと `with` によるmock（O09）。SpiceDB：三値assertionと期待relation（O13） | 判定が二値か三値か、policyと同じ言語でtestを書くか |
| role継承の停止 | Casbin：深さ上限で打ち切り、`false` を返す（O02） | OpenFGA：訪問済みsubproblemでcycleを止める（O03） | 階層をrole graphとして持つか、relation rewriteとして持つか |

## 見つからなかったこと・gap
- OpenFGAのconsistency token（zookie）は、#1777 時点で未実装である。roadmap（openfga/roadmap#67）の現状は読んでいない。
- OpenFGAのYAML形式のmodel test（`fga model test`）は、本repoではなくCLI repoにあると思われるが、未確認である。
- OpenFGAの docs/check/README.md の「Resolution Depth／Breadth」の節は未記載（todo）である。
- SpiceDBの queryplan経路で返す `MissingRequiredContext` の中身は、TODOのままである。
- Casbinのissue検索は、`gh search` が「repository cannot be searched」で失敗したため、issueを根拠にしたtrade-offは採れていない。
- PDPを停止したときのPEP側の挙動（fail-open／fail-closed）は、OPAのEnvoy pluginなどの別repoにあり、対象外とした。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- casbin：`effector/`、`constant/constants.go`、`enforcer.go`（enforce本体、EnableEnforce）、`rbac/default-role-manager/role_manager.go`（HasLink周辺）、`persist/watcher.go`、`examples/*model.conf` の一部。transaction系、distributed enforcer、cached enforcerは読んでいない。
- openfga：`docs/caching.md`（前半）、`docs/check/README.md`（概要、exclusion、高度な挙動）、`docs/architecture/architecture.md`、`pkg/storage/mysql/mysql.go`、`pkg/server/commands/check_command.go`、`pkg/server/server.go`（resolveTypesystem）、`pkg/typesystem/resolver.go`。検索した語：`HIGHER_CONSISTENCY`。issue #1777 を読んだ。internal/graphの実装本体、ListObjects、authzen、postgresは読んでいない。
- spicedb：`pkg/zedtoken/zedtoken.go`、`pkg/middleware/consistency/consistency.go`、`internal/graph/check.go`（difference）、`internal/graph/membershipset.go`（Subtract）、`internal/services/v1/permissions_queryplan.go`（一部）、`pkg/validationfile/`、`pkg/development/assertions.go`、`e2e/newenemy/README.md`。検索した語：`AtLeastAsFresh`、`new enemy`、`CONDITIONAL_PERMISSION`。schema DSLのparser、各datastoreのrevision実装、dispatchのcluster構成は読んでいない。
- opa：`docs/docs/philosophy/index.md`、`policy-language.md`（Default Keyword）、`policy-testing.md`（形式、結果、mock）、`management-bundles/index.md`（manifest）、`management-decision-logs.md`（event形式）、`comparisons/access-control-systems.md`（RBAC、SOD）、`v1/topdown/errors.go`、`v1/tester/runner.go`（prefix定数）。topdownの評価器本体、partial evaluation、server APIのundefinedの応答形式は読んでいない。
- cerbos：`internal/ruletable/check.go`（主要部）、`internal/verify/test_matrix.go`、`docs/modules/policies/pages/{evaluation,compile,scope_permissions,derived_roles}.adoc`（冒頭）、`docs/modules/configuration/pages/engine.adoc`（strict evaluation）。PR #3312 を読んだ。query planner（`plan.go`）、audit、storageのreloadは読んでいない。
- gh apiの呼出しは約12回。本文は作業用の一時領域（作業用の一時領域）に、blob:noneでcloneし、固定SHAへcheckoutして読んだ。コード、test、buildは一切実行していない。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの一次資料（コードと公式docs）、および公式repoのissue・PRの観察である。ブログは使っていない。
- scope：D08 Security、D03 Backendのどちらに属させるか、また「一貫性token」をD03（データ整合）側に分けるかは未決である。
- 評価根拠：HELIXでの成立を示す根拠はない。全件が未評価の候補素材である。
- 版：各観察は上表の固定commitに紐づく。OSS側の更新に伴う再照合の方針は未決である。
- 状態：未評価。HELIX-BRAINへの登録、採否、選定はしていない（HELIXBRAIN-L2-026／027の経路に委ねる）。
