---
title: "HELIX-OS Stage 1 local CI 機能設計"
status: design_pair_defined
owner: HELIX-OS
paired_l7: ../L7-unit-test-design/local-ci-unit-test-design.md
stage: 1
version_target: 1.0
---

# HELIX-OS Stage 1 local CI 機能設計

本書はL4/L5契約を関数・前後条件へ結ぶL6設計である。driver実装は`scaffold/local-ci/`のBinding登録下で行い、正式OS unitへの移管はadapter依存閉包後に行う。この文書から登録済みOS unit・実行済みを主張しない。

## 固定入力

基準はmain `cb920c9dae9a4c2a7a023a361e654bddef4d4dd8`。L4/L5の旧source・採用済み親・変更理由のcrosswalkを継承し、実行結果を継承しない。

| 入力path | 本文SHA-256 |
|---|---|
| `docs/helix-os/L4-basic-design/local-ci.md` | `442d9934378a2ae73ab85f9b0afb3f976891e40b18fdab7088f4964f8c1f67b6` |
| `docs/helix-os/L9-integration-verification/local-ci-integration-verification.md` | `1db0e653929389831ccdf04ee9c4bc15450b1642f98f8fe0a3bb3dca19feae01` |
| `docs/helix-os/L5-detail-design/local-ci-detail-design.md` | `b146588e10b23519ca9d903e40cd7ab978c7de570b62ae97ebf73837c68bd3c1` |
| `docs/helix-os/L8-detail-verification/local-ci-detail-verification.md` | `df06c5de7e7248f40c7aa4a8aba5ec9e2c5a61fca306a66fde44d244f5b51ede` |

## 1. 関数群

`CiState`は既存語彙`success|fail|denied|skipped|interrupted|stale`に限る。APIで入力不足・unsupported・未観測・不正形式が起きた場合は既存K1の`Unknown`/`Unobserved`/`Stale`/`Rejected`を外側結果として保持し、`CiState`やreceiptの`aggregate_state`へ写さない。API入力が未構成でも診断を保持し、successに数えない。

`run_local_ci`が常に実行対象とするrequired setは、順に`LC-SCF-001`、`LC-SCF-002`、`LC-GOV-001`、`LC-DIFF-001`、`LC-DESIGN-001`の5件である。これは段階選択ではなく固定全量集合であり、個別関数の前後条件で除外しない。

### `F-LCI-01` — `resolve_target(repo, base_ref, head_ref) -> CiApiResult<CiTarget>`

- **Pre**: repoは固定checkout、base/head refはGit objectへ解決可能。local host-side reader/clean probeは`LocalCiConfig.executables.git`を固定選択し、同一roleのGit executable identity/digest、Git 2.35.2以降のversion、global/system config無効、`core.fsmonitor=false`・`core.hooksPath=/dev/null`等の固定argv/config、allowlisted environmentを、version/probe以外のGit操作前に確認する。provider用`provider_git` pinへfallbackしない。
- **処理**: 同じlocal-role fixed argv/config/environmentで`git --version`を確認してからmerge-base、head commit/treeをGit plumbingで取得し、要求された`head_ref`とcheckoutのHEAD/treeが一致するか確認する。一致しない場合は既存K1の外側`Stale`を返し、`CiTarget`のValueを返さない。version floor未満/parse不能/identity不一致は`Unknown(unsupported)`、fixed argv/config不一致はprobe前`Rejected(invalid_input)`とし、別Gitやinstallへfallbackしない。
- **Post**: checkout HEAD/treeが要求headと異なる場合は外側`Stale`を返し、`CiTarget` Valueを返さない。一致する`CiTarget`はbase, merge_base, head_commit, head_treeを保持する。必須target ref field自体が未入力でK2 keyを構成できない場合は`Rejected(missing_key)`。fieldはあるがOID形式が不正、または指定OIDがcommit objectへ解決できない場合は`Rejected(invalid_input)`。指定refが複数objectへ解決され、ref値を含むkeyは構成できる場合は`Unknown(ambiguous)`とし、存在しないtarget identityを補わない。current Git sourceの読取不能は、先にtarget subject/input refsでkeyを構成できたときだけ`Unknown(unreadable)`。

### `F-LCI-02` — `read_fixed_snapshot(target) -> CiApiResult<SourceSnapshot>`

- **Pre**: `target.head_tree`が存在し、固定manifestと10-document corpusがtargetから内部解決可能。local snapshot readerは`executables.git`を一度固定選択し、`resolve_target`と同じidentity/version (`>=2.35.2`)/argv/config/environment preflightをsource probe前に通す。Git 2.35.2未満・version parse不能・identity不一致は`Unknown(unsupported)`、固定argv/config不一致はprobe前`Rejected(invalid_input)`。provider roleのpinを試さない。
- **処理**: host-side trusted readerが固定argvの`git ls-tree -r -z`からpath→blob identityを解決し、`git cat-file blob`で必要bytesだけを読む。self-contained snapshot/private minimal objectsにはdeclared trees/blobs、merge-base/head commitsと`git diff`/scfctlに必要な宣言済みbaseline ancestorsを含め、remote/credential helperなしのprivate configを使う。sandboxへoriginal checkout/`.git`/`.git/config`は渡さない。repo filesystemをdocs source authorityにしない。
- **Post**: 各declared source bytesはtarget treeに一意に束縛され、実行snapshotには必要最小inputだけがある。K2 keyに必要なmanifest/source ref自体の入力欠落は`Rejected(missing_key)`、key構成後に宣言source pathがtarget treeにない場合は`Unknown(missing_input)`、Git blobの読取失敗は`Unknown(unreadable)`、symlink/non-blobまたはdeclared digestとのbytes不一致は`Unknown(conflict)`。version floor未満等は`Unknown(unsupported)`、fixed argv/config不一致はprobe前`Rejected(invalid_input)`。

### `F-LCI-03` — `check_clean_checkout(target) -> CiApiResult<CiTarget>`

- **Pre**: local runnerは対象repo rootで開始し、`executables.git`を固定選択して`resolve_target`と同じGit identity/version (`>=2.35.2`)/argv/config/environment preflightをGit status/index/worktree probe前に通す。Git 2.35.2未満・version parse不能・identity不一致は`Unknown(unsupported)`、固定argv/config不一致はprobe前`Rejected(invalid_input)`。provider pinへの切替はない。
- **Post**: index/worktree/untrackedを列挙し全てclean、HEAD/treeとtarget一致なら`Observed<CiTarget>`のValueを返す。差分があれば実行stateではなく既存K1外側`Stale`を返す。この関数は`CheckExecution`を生成せず、index/worktreeを書き換えない。

### `F-LCI-04` — `compile_plan(target) -> CiApiResult<LocalCiPlan>`

- **Pre**: target、固定config version、manifest source refsは固定定義から内部解決可能。local planは`executables.git` pinと`provider_git`のexact pinまたは未採取`null`を同じshared config bytesに保持する。keyに必要なtarget/source refが欠ける場合は`Rejected(missing_key)`。callerからconfig/manifest/role差替えを受けない。
- **処理**: required check IDsを固定順に構成し、argv literalを作る。呼出側はselection, argv, working directoryを上書きできない。
- **Post**: SCF validate、SCF stale、GOV、DIFF、DESIGNの各stepが一件ずつあり、すべてrequired/local、DIFFだけmerge-unit verifierも選択される。これは`CommandSpec.selection`の独立した`required`/`local`/`merge_unit` fieldで表し、実行先配属がrequired集合を除外しない。必須key refの未入力は`Rejected(missing_key)`、入力済みOIDの不正/未解決は`Rejected(invalid_input)`、manifest自体の必須field欠落・余分field・型不正・固定ID以外のunsupported dispositionは`Rejected(invalid_input)`、key構成済みmanifest内の必須ID/edge欠落は`Unknown(missing_input)`、blob読取失敗は`Unknown(unreadable)`、symlink/non-blob/重複ID等の構造競合は`Unknown(conflict)`であり、独自`CiInputError`型は追加しない。manifest構造preflightが不成立なら`compile_plan`は外側結果だけを返し、`run_local_ci`はcheckerを一つも起動せずexecution row/receiptを作らない。

### `F-LCI-05` — `run_step(snapshot, spec, process) -> CiApiResult<CheckExecution>`

- **Pre**: exact targetから作ったself-contained checkout外private snapshotがverified、original checkout/`.git/config`は不在、sandbox preflightで提供環境に既存の`bwrap`をtrusted host-local設定から解決し、name、opaqueな`--version` literal、全bytes SHA-256がprofile pinと一致すること、専用の空のnetwork namespace（host network非共有）/read-only input/private scratchを確立、command pathとentrypoint/transitive checker bytes digestがcurrent一致。system package/upstream provenanceは要件化しない。不在・identity不一致・preflight不能はchecker起動前`denied`で、install/host/別binary fallbackなし。python checker argvが固定`-B`契約を満たさない場合、またはallowlisted environmentに`PYTHONDONTWRITEBYTECODE=1`がない場合はspawn前に`Rejected(invalid_input)`。
- **処理**: `shell=False`で固定argvを実行する。Python checker argvには`-B`を固定し、envはPATH、LANG、LC_ALL等の必要値と`PYTHONDONTWRITEBYTECODE=1`だけをallowlistする。govcheckは`sys.executable gen_rulebook.py --check`で子process argvへ親の`-B`を転送しないため、この固定envを親子双方へ渡してchild bytecode cacheも抑止する。HOMEと他の継承値は除外し、環境値は記録しない。portable executable identity/name/version/digestだけをreceiptへ保持し、host解決pathは外部local設定に限る。process groupを監視し、govcheckの`gen_rulebook.py --check`子processも対象とする。stdout/stderr pipeは信頼側supervisorが回収してsha256化し、checker sandboxにはreceiptもparent directoryも見せず、本文を保存しない。
- **Post**: exit 0→`success`、非zero→`fail`、隔離/監視境界が確立できない→`denied`、全process groupの終了/reap確認後のtimeout→`interrupted(reason=timeout)`、supervisor外のrun全体cancel要求と停止/reap確認後→`interrupted(reason=cancelled)`。timeoutはstep後に後続required stepを続け、cancelは後続を起動せず残りを`interrupted(reason=cancelled)`として記録する。停止を確認できない場合は後続stepを開始せず`denied`。step前後にHEAD/tree/transitive checker digestを確認し、実行前の不一致なら起動せず外側`Stale`、実行後の変化なら既実行evidenceを保持してrun-level stale処理へ渡す。F-LCI-06では、required step完了前の変化は後続を起動せず、未開始stepをstale行として記録してaggregateへfoldする。全required step完了後の最終再照合で初めて検出した変化は外側`Stale`とし、実行evidenceは診断artifactへ保持するが`LocalCiReceipt`は発行しない。

### `F-LCI-06` — `run_local_ci(target) -> CiApiResult<LocalCiReceipt>`

- **Pre**: `resolve_target`/clean/snapshot共通のlocal-role `executables.git` identity/version/config/argv/environment境界を通し、targetと固定config/manifestは内部解決する。caller指定のconfig/manifest/roleを受け取らない。provider pinのnull/差異はlocal Git readerを切り替えない。
- **処理順**: resolve→clean check→self-contained private snapshot/minimal objects→plan→sandbox preflight→全required stepを固定順で実行→再度clean/HEAD/tree/transitive checker確認→aggregate→external receipt write。manifest自体の必須field欠落・余分field・型不正・unsupported dispositionのpass化は外側`Rejected(invalid_input)`。snapshot/plan構造preflightで必須ID/edge欠落・未解決参照を検出したら外側`Unknown(missing_input)`、重複定義/曖昧edge等の構造競合なら外側`Unknown(conflict)`を返し、いずれもcheckerを一つも起動せずexecution rowもreceiptも作らない。必須key ref field欠落は`Rejected(missing_key)`、入力済みOID不正/未解決は`Rejected(invalid_input)`、key構成後のsource read failureは`Unknown(unreadable)`として同じく実行前に止める。これらは実行開始後のchecker失敗とは別境界である。sandboxへoriginal checkout/`.git/config`/receipt/receipt parent directoryを渡さない。checkerから見えるwritable領域はreceiptと分離したprivate scratchだけで、stdout/stderr pipeとexecution digestを信頼側supervisorが受け取りreceiptをcheckout外へ書く。構造preflightが成立してcheckerが起動した後に非zeroを返した場合はexecution `fail`とし、残りのrequired stepを続けて5件すべてのexecution rowをreceiptへ記録する。実行開始前のtarget/checker不一致は外側`Stale`としてexecution/receiptを作らない。実行開始後、未開始stepがある時点でtarget/checker bindingの変化を検出した場合は以後を起動せず、未開始stepを`state=stale, started_at=null, exit_code=null`の行でreceiptに残す。timeoutではprocess停止/reap後に`reason=timeout`をexecutionへ記録して後続required stepを続ける。supervisor外run cancel要求ではprocess tree停止/reap確認後に未開始stepを`state=interrupted, reason=cancelled, started_at=null, exit_code=null`で残して後続を起動しない。停止を確認できなければ`denied`とし後続を起動しない。全required step完了後の最終target/checker再照合だけで変化を検出した場合は外側`Stale`とし、実行evidenceを診断artifactへ保持するが`LocalCiReceipt`を発行しない。
- **Post**: 全5 step successかつmanifest/disposition structure completeの場合のみaggregate `success`。受信または再検証した`LC-DESIGN-001` successとmanifest検査結果`structure_complete=false`の不整合組はaggregation前に`Rejected(invalid_input)`。一般fold語彙には`skipped`があるが、local required `skipped`はfold前にschema validationで`Rejected(invalid_input)`としreceiptへ採用しない。aggregateの固定優先順は`stale > interrupted > denied > fail > skipped > success`。`aggregate_state`と各`CheckExecution.state`は前記既存`CiState`に限る。invalid inputでreceiptを構成できない場合は`Rejected`を外側に返しreceiptを作らない。入力不足・unsupported・未観測等は既存クラスと診断を保持し、`CiState`やsuccessへ混ぜない。部分実行でも既実行のstep evidenceを消さない。

### `F-LCI-07` — `verify_receipt(compact_json, current_target) -> CiApiResult<ReceiptCheck>`

- **Pre**: JSON bytes inputはbounded、canonical schema version 1。
- **処理**: strict JSON parse（duplicate keys reject）、repo-relative referencesとallowlisted IDsだけを許す。planは固定5 ID、fixed-contract selection basis、plan `state=success`、current plan config/manifest digestを検証し、receipt直下の`config_digest`を`plan.config_digest`とexact compareする。role別pinを含むshared configが変われば旧receiptのdigestはcurrentと異なるため`Unknown(conflict)`とし、local runを再実施するまでprovider照合をpositiveにしない。execution rowsは別fieldとして検証し、selected required `skipped`を`Rejected(invalid_input)`にする。`LC-DESIGN-001` execution successと`design_manifest_digest`から固定targetで再解決したmanifest bytesの独立構造検査結果が`structure_complete=false`の組は`Rejected(invalid_input)`としてfold前に拒否する。初期driverのtransport診断ではdispatch targetとreceipt target/refsを照合し、差異をK1保存結果ではなく診断に保持する。formal projectionでは`recorded_key`、保存済み`oldValue`、current inputsからcurrent K2 keyを再構成し、既存K2の共通lookup規則で判定する。単純なtarget revisionの前後方向だけで`Stale`を決めない。target treeからcontract/config/manifest/checker refsを再読してreceiptとの関係を照合する。同一targetを主張するreceipt内のconfig/checker digestがcurrent固定bytesのdigestと違えば`Unknown(conflict)`を返す。keyを構成できない必須入力欠落は`Rejected(missing_key)`、key構成後のsource read failureは`Unknown(unreadable)`、不正形式は`Rejected(invalid_input)`とし、これらをreceipt aggregateへ写さない。
- **Post**: driverは非K1 diagnosticを返し、formal projectionだけがcurrent K2 lookupに基づく既存result型を返す。hash一致でもlocal execution issuerを真正とはしない。

### `F-LCI-08` — `run_merge_unit_verifier(dispatch) -> CiApiResult<ProviderResult>`

- **Pre**: workflowはworkflow_dispatch、input JSONはenv経由、readonly permission。trusted configの`executables.provider_git`が未採取`null`なら、provider入口のtrusted固定設定が解決した既存Gitからliteral name、`--version`、binary bytes SHA-256だけを採取するpreflightを行い、target/source/status/diff Git operationを行わず`Unobserved(not_run)`を返す。digestを埋めたplaceholderを作らず、`ProviderResult`/positiveを返さない。pinがある場合はprovider roleだけを検証し、identity/version不一致は`Unknown(unsupported)`としてtarget/source/status/diffの前に止め、local pinへのfallback/installをしない。
- **処理**: exact target headをcheckoutし、receiptを照合し、同じbase/head/contract/settingsで`LC-DIFF-001`を実行してlocal/Actions statusを比較する。`settings`はrole pin mapを含む同一shared config digest、fixed DIFF argv、同じGit policy/environment、selection、manifest version、timeoutを指す。local readerは`executables.git`、provider readerは`executables.provider_git`をそれぞれ入口で固定選択し、各実行identityは別々のevidenceとする。local/providerのbinary identity equalityはparity条件に追加せず、DIFF state parityも変更しない。version/bytes差がstate結果を変えた場合はparity=falseを保持しpositiveにしない。Actions側`ProviderResult.provider_git_identity`は照合した実測provider binary identityを示しauthorityではない。SCF validate/stale、GOV/design manifestはlocal-onlyでありActionsでは行わない。
- **Post**: formal APIのdispatch targetとcheckout current targetが不一致なら既存K1外側`Stale`とし、`ProviderResult`を返さない。初期CLIは同じ不一致をK1 resultではなく診断へ記録する。successはmerge/branch protection authorityを持たない。

旧sourceと変更理由は固定入力L4 §1の`LEGACY-ASSET-BACB1FC117A09D20F273`（local-first/merge-unit）、`LEGACY-ASSET-96CCD05C4CCA06F50D3D`（local evidence→CI evidence binding）、`LEGACY-ASSET-B62E49D2E156232B8C63`（mismatch時fallbackなし）を起点にする。保持するのは同じselected gate/settingsのreceipt照合とfail-closed。現行の単一`executables.git` pinがlocal 2.43.0と一致し、公開Ubuntu 24.04 image reportの2.55.0と異なるためproviderがtarget解決前にunsupportedとなるfailureを、役割別既存binary pinで解消する。旧sourceは両側binaryの完全一致を要求しておらず、検査意味・対象・state parityを維持したtechnical identity分離であり、新gate/要求変更ではない。provider identity未採取はpositive不可、pin更新後の旧receipt流用不可とする。`bwrap`も旧sourceにOS package指定やprovenance保証がないため、提供環境の既存binary名、`--version` literal、全bytes SHA-256をtrusted側で観測するprofile pinへ技術的に再導出する。確認された`~/.local/bin/bwrap`は環境固有pathでupstream provenance未証明の候補であり、semantic version/system packageを主張せず、未提供時にinstall/host fallbackしない。

## 2. Receipt構築

`receipt_body`のcanonical JSONはtarget identity、contract/manifest/config digests、checker SubjectRefs、runtime version、step state/exit code/output digestsを含む。外側digestを計算しcompact inputへ出す。出力先は`$XDG_CACHE_HOME/helix/local-ci`かsystem tempでrepo root外。receiptと同じtreeにreceiptを記録しないため、receipt保存が自分のhead_treeを変えることはない。

Receipt lifecycle:

1. local run前にexact targetを固定し、要求headとcheckout HEAD/treeの一致を確認する。不一致は外側`Stale`であり`CiTarget` Valueを返さない。
2. 実行ごとに新規receipt。既存receiptを更新しない。
3. step実行中にtarget/checker bindingの変化を検出した場合は後続stepを止め、unstarted stale rowsを含む全step evidenceをreceiptへ保持してaggregateを`stale`へfoldする。全step完了後の最終再照合で変化した場合は外側`Stale`とし、evidenceを診断artifactへ保持するがreceiptは発行しない。
4. compact JSONはworkflow_dispatch inputとしてmerge-unitで渡す。input over-limit/unavailableはpositiveにならず、その既存`Unobserved`/`Unknown`診断を保持する。
5. full output logsは保存せず、必要なevidenceはstdout/stderr digestとexecution metadata。output digestは実行本文を後から再構成/真正化しない。

## 3. `DesignScopeManifest`関数境界

`F-LCI-09`内の4関数はmanifest上も個別source contract keyとなる。データ型の正本は固定入力L5 §2であり、本書で別schemaを再定義しない。`IdRange`のheading_id/table_column/bullet_id/exact_heading、literal_expansions、通常IDとsection_locatorの分離、CoverageEdge.edge_id、typed OutcomeRef、各disposition/source_scopeout/legacy pin/unsupported itemはその固定型のまま受け取る。source/edge/outcomeの識別と型検査はF09a–cの前後条件で具体化し、自由本文やcode commentから合成IDを生成しない。

### `F-LCI-09a` — `load_design_manifest(snapshot) -> CiApiResult<DesignScopeManifest>`

全fieldと上記型、path+role+pair+source-kind、definition/reference range selector grammarと固定literal expansion表を確認する。heading_idはfence外の見出し構造行全文literalから固定対応表の既存IDだけを展開し、略記がなくても対応表を要求する。見出し/entry欠落・空展開はUnknown(missing_input)、見出しliteral/展開ID重複はUnknown(conflict)とする。bullet_idは宣言範囲の先頭IDだけ、exact_headingはstart_heading全文literal一件だけをsection_locatorとして読む。range外tokenや未登録略記から定義を補わず、exact_heading範囲内の子見出しを追加section_locatorにしない。必須field欠落・余分field・型不正・unsupported dispositionのpass化は`Rejected(invalid_input)`、固定corpus上のID/edge欠落は`Unknown(missing_input)`、重複/曖昧定義は`Unknown(conflict)`とする。

`parent_ac_coverage`もmanifest schemaで検証する。一般必須field欠落の`Rejected(invalid_input)`に対する例外として、このlist自体またはOS-020-01/03の片方のrow欠落は`Unknown(missing_input)`とする。重複またはL4 §1との不一致は`Unknown(conflict)`、passへの変更・unknown field・型不正・空理由は`Rejected(invalid_input)`である。理由比較はL4表のreason cellとのliteral一致に限り、自然言語の意味推論をしない。この専用記録はF09cのcoverage graphへ取り込まない。

### `F-LCI-09b` — `resolve_id_graph(definitions, references) -> CiApiResult<IdGraph>`

ID一意性・定義者・参照先を検査する。

### `F-LCI-09c` — `verify_coverage_edges(edges, id_graph) -> CiApiResult<CoverageReport>`

L4→L9、L5→L8、L6→L7のcontract/fixtureの実在、edge_id全体一意性、dispositionから同source edgeへの解決を検査する。OutcomeRefのverifier_path/range_id/verifier_id/outcome_columnがedge先の一意な定義行の非空期待値cellへ戻ることを確かめる。edge_id重複はUnknown(conflict)、必須edge/locator先欠落はUnknown(missing_input)であり、実行や意味被覆を推論しない。`mapped`/`partial` sourceは一つ以上のedgeを要求し、`partial`には理由・既存owner ref・operational owner状況・return pathも必要とする。`not_exercised` sourceは`edge_ids=[]`と理由・既存owner ref・operational owner状況・return pathを要求し、edge先の一意解決を要求しない。設計対象外の抽出等はcoverage dispositionに混ぜず`source_scopeouts`で個別検査する。

### `F-LCI-09d` — `verify_legacy_pins(pins) -> CiApiResult<PinReport>`

asset ledgerのasset ID/path/full SHAとarchive blobを照合し、line bytesのspan SHAは独立に計算する。各sub-IDは別々のL7 oracle edgeと正常baselineを持つ。

これらの関数は宣言範囲とID relationを検査し、文章全体の意味等価性や未知概念を推測しない。`verify_coverage_edges`は`RL-D4`から既存`IV-RL-56`/`IV-RL-57`/`IV-RL-59`へのpartial設計edgeを保持し、code-graph extractionの未設計・未検証は別の`source_scopeouts` fieldとして確認する。L4の4件のscope外`unsupported_items`とこのscopeoutは理由付きnon-pass dispositionのまま独立inventoryに保持し、構造manifest completeなら固定5-step successを妨げない。required ID/pin/edgeの欠落やunsupportedは`LC-DESIGN-001` successを阻止する。

## 4. L7 trace

各function ID `F-LCI-xx`はL7 unit oracle ID `UT-LCI-xx`へ一対一以上でつなぐ。L7 test codeはIDと入力/期待型を参照し、この本文を複製しない（repository-layout RL-T2）。Fixturesは合成Git objectとsynthetic receiptだけである。
