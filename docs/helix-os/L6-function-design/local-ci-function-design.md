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

基準はmain `b443e3f1d8c5a48fc6246955f4d99a6f61f70de5`。L4/L5の旧source・採用済み親・変更理由のcrosswalkを継承し、実行結果を継承しない。

| 入力path | 本文SHA-256 |
|---|---|
| `docs/helix-os/L4-basic-design/local-ci.md` | `5400436e17b6973741101138f113b387384d1f42ab6da6b27f19d337042d6988` |
| `docs/helix-os/L9-integration-verification/local-ci-integration-verification.md` | `fa260a0fa0135d97950df20841e9f996572afbe2a6ca979d09401266c6edf600` |
| `docs/helix-os/L5-detail-design/local-ci-detail-design.md` | `c9db039a90a6ec6c151eb4d26e85ae239078568b026a7301592fd72b05228c61` |
| `docs/helix-os/L8-detail-verification/local-ci-detail-verification.md` | `25164b701df3e19ca0ff697f099c95cf48e3c6a1aa5e40cf3dcf04c0fd383560` |

## 1. 関数群

`CiState`は既存語彙`success|fail|denied|skipped|interrupted|stale`に限る。APIで入力不足・unsupported・未観測・不正形式が起きた場合は既存K1の`Unknown`/`Unobserved`/`Stale`/`Rejected`を外側結果として保持し、`CiState`やreceiptの`aggregate_state`へ写さない。API入力が未構成でも診断を保持し、successに数えない。

`run_local_ci`が常に実行対象とするrequired setは、順に`LC-SCF-001`、`LC-SCF-002`、`LC-GOV-001`、`LC-DIFF-001`、`LC-DESIGN-001`の5件である。これは段階選択ではなく固定全量集合であり、個別関数の前後条件で除外しない。

### `F-LCI-01` — `resolve_target(repo, base_ref, head_ref) -> CiApiResult<CiTarget>`

- **Pre**: repoは固定checkout、base/head refはGit objectへ解決可能。host-side reader/clean probeと共通の固定Git executable identity/digest、Git 2.35.2以降のversion、global/system config無効、`core.fsmonitor=false`・`core.hooksPath=/dev/null`等の固定argv/config、allowlisted environmentを、version/probe以外のGit操作前に確認する。
- **処理**: 同じ固定argv/config/environmentで`git --version`を確認してからmerge-base、head commit/treeをGit plumbingで取得し、HEAD=current headか確認する。version floor未満/parse不能/identity不一致は`Unknown(unsupported)`、fixed argv/config不一致はprobe前`Rejected(invalid_input)`とし、別Gitやinstallへfallbackしない。
- **Post**: `CiTarget`はbase, merge_base, head_commit, head_treeを保持する。必須target ref field自体が未入力でK2 keyを構成できない場合は`Rejected(missing_key)`。fieldはあるがOID形式が不正、または指定OIDがcommit objectへ解決できない場合は`Rejected(invalid_input)`。指定refが複数objectへ解決され、ref値を含むkeyは構成できる場合は`Unknown(ambiguous)`とし、存在しないtarget identityを補わない。current Git sourceの読取不能は、先にtarget subject/input refsでkeyを構成できたときだけ`Unknown(unreadable)`。

### `F-LCI-02` — `read_fixed_snapshot(target) -> CiApiResult<SourceSnapshot>`

- **Pre**: `target.head_tree`が存在し、固定manifestと10-document corpusがtargetから内部解決可能。`resolve_target`と同じ固定Git executable identity/version (`>=2.35.2`)/argv/config/environment preflightをsource probe前に通す。Git 2.35.2未満・version parse不能・identity不一致は`Unknown(unsupported)`、固定argv/config不一致はprobe前`Rejected(invalid_input)`。
- **処理**: host-side trusted readerが固定argvの`git ls-tree -r -z`からpath→blob identityを解決し、`git cat-file blob`で必要bytesだけを読む。self-contained snapshot/private minimal objectsにはdeclared trees/blobs、merge-base/head commitsと`git diff`/scfctlに必要な宣言済みbaseline ancestorsを含め、remote/credential helperなしのprivate configを使う。sandboxへoriginal checkout/`.git`/`.git/config`は渡さない。repo filesystemをdocs source authorityにしない。
- **Post**: 各declared source bytesはtarget treeに一意に束縛され、実行snapshotには必要最小inputだけがある。K2 keyに必要なmanifest/source ref自体の入力欠落は`Rejected(missing_key)`、key構成後に宣言source pathがtarget treeにない場合は`Unknown(missing_input)`、Git blobの読取失敗は`Unknown(unreadable)`、symlink/non-blobまたはdeclared digestとのbytes不一致は`Unknown(conflict)`。version floor未満等は`Unknown(unsupported)`、fixed argv/config不一致はprobe前`Rejected(invalid_input)`。

### `F-LCI-03` — `check_clean_checkout(target) -> CiApiResult<CiTarget>`

- **Pre**: local runnerは対象repo rootで開始し、`resolve_target`と同じ固定Git executable identity/version (`>=2.35.2`)/argv/config/environment preflightをGit status/index/worktree probe前に通す。Git 2.35.2未満・version parse不能・identity不一致は`Unknown(unsupported)`、固定argv/config不一致はprobe前`Rejected(invalid_input)`。
- **Post**: index/worktree/untrackedを列挙し全てclean、HEAD/treeとtarget一致なら`Observed<CiTarget>`のValueを返す。差分があれば実行stateではなく既存K1外側`Stale`を返す。この関数は`CheckExecution`を生成せず、index/worktreeを書き換えない。

### `F-LCI-04` — `compile_plan(target) -> CiApiResult<LocalCiPlan>`

- **Pre**: target、固定config version、manifest source refsは固定定義から内部解決可能。keyに必要なtarget/source refが欠ける場合は`Rejected(missing_key)`。callerからconfig/manifest差替えを受けない。
- **処理**: required check IDsを固定順に構成し、argv literalを作る。呼出側はselection, argv, working directoryを上書きできない。
- **Post**: SCF validate、SCF stale、GOV、DIFF、DESIGNの各stepが一件ずつあり、すべてrequired/local、DIFFだけmerge-unit verifierも選択される。これは`CommandSpec.selection`の独立した`required`/`local`/`merge_unit` fieldで表し、実行先配属がrequired集合を除外しない。必須key refの未入力は`Rejected(missing_key)`、入力済みOIDの不正/未解決は`Rejected(invalid_input)`、manifest自体の必須field欠落・余分field・型不正・固定ID以外のunsupported dispositionは`Rejected(invalid_input)`、key構成済みmanifest内の必須ID/edge欠落は`Unknown(missing_input)`、blob読取失敗は`Unknown(unreadable)`、symlink/non-blob/重複ID等の構造競合は`Unknown(conflict)`であり、独自`CiInputError`型は追加しない。manifest構造preflightが不成立なら`compile_plan`は外側結果だけを返し、`run_local_ci`はcheckerを一つも起動せずexecution row/receiptを作らない。

### `F-LCI-05` — `run_step(snapshot, spec, process) -> CiApiResult<CheckExecution>`

- **Pre**: exact targetから作ったself-contained checkout外private snapshotがverified、original checkout/`.git/config`は不在、sandbox preflightで専用の空のnetwork namespace（host network非共有）/read-only input/private scratchを確立、command pathとentrypoint/transitive checker bytes digestがcurrent一致。python checker argvが固定`-B`契約を満たさない場合、またはallowlisted environmentに`PYTHONDONTWRITEBYTECODE=1`がない場合はspawn前に`Rejected(invalid_input)`。
- **処理**: `shell=False`で固定argvを実行する。Python checker argvには`-B`を固定し、envはPATH、LANG、LC_ALL等の必要値と`PYTHONDONTWRITEBYTECODE=1`だけをallowlistする。govcheckは`sys.executable gen_rulebook.py --check`で子process argvへ親の`-B`を転送しないため、この固定envを親子双方へ渡してchild bytecode cacheも抑止する。HOMEと他の継承値は除外し、環境値は記録しない。portable executable identity/name/version/digestだけをreceiptへ保持し、host解決pathは外部local設定に限る。process groupを監視し、govcheckの`gen_rulebook.py --check`子processも対象とする。stdout/stderr pipeは信頼側supervisorが回収してsha256化し、checker sandboxにはreceiptもparent directoryも見せず、本文を保存しない。
- **Post**: exit 0→`success`、非zero→`fail`、隔離/監視境界が確立できない→`denied`、全process groupの終了/reap確認後のtimeout→`interrupted(reason=timeout)`、supervisor外のrun全体cancel要求と停止/reap確認後→`interrupted(reason=cancelled)`。timeoutはstep後に後続required stepを続け、cancelは後続を起動せず残りを`interrupted(reason=cancelled)`として記録する。停止を確認できない場合は後続stepを開始せず`denied`。step前後にHEAD/tree/transitive checker digestを確認し、実行前の不一致なら起動せず`Stale`、実行後の変化なら既実行evidenceを保持してrunを`stale`にする。

### `F-LCI-06` — `run_local_ci(target) -> CiApiResult<LocalCiReceipt>`

- **Pre**: `resolve_target`/clean/snapshot共通の固定Git executable/version/config/argv/environment境界を通し、targetと固定config/manifestは内部解決する。caller指定のconfig/manifestを受け取らない。
- **処理順**: resolve→clean check→self-contained private snapshot/minimal objects→plan→sandbox preflight→全required stepを固定順で実行→再度clean/HEAD/tree/transitive checker確認→aggregate→external receipt write。manifest自体の必須field欠落・余分field・型不正・unsupported dispositionのpass化は外側`Rejected(invalid_input)`。snapshot/plan構造preflightで必須ID/edge欠落・未解決参照を検出したら外側`Unknown(missing_input)`、重複定義/曖昧edge等の構造競合なら外側`Unknown(conflict)`を返し、いずれもcheckerを一つも起動せずexecution rowもreceiptも作らない。必須key ref field欠落は`Rejected(missing_key)`、入力済みOID不正/未解決は`Rejected(invalid_input)`、key構成後のsource read failureは`Unknown(unreadable)`として同じく実行前に止める。これらは実行開始後のchecker失敗とは別境界である。sandboxへoriginal checkout/`.git/config`/receipt/receipt parent directoryを渡さない。checkerから見えるwritable領域はreceiptと分離したprivate scratchだけで、stdout/stderr pipeとexecution digestを信頼側supervisorが受け取りreceiptをcheckout外へ書く。構造preflightが成立してcheckerが起動した後に非zeroを返した場合はexecution `fail`とし、残りのrequired stepを続けて5件すべてのexecution rowをreceiptへ記録する。target/checker bindingの実行前変化時は実行を開始せず外側`Stale`、実行後変化時は以後を起動せず未開始stepを`state=stale, started_at=null, exit_code=null`でreceiptに残す。timeoutではprocess停止/reap後に`reason=timeout`をexecutionへ記録して後続required stepを続ける。supervisor外run cancel要求ではprocess tree停止/reap確認後に未開始stepを`state=interrupted, reason=cancelled, started_at=null, exit_code=null`で残して後続を起動しない。停止を確認できなければ`denied`とし後続を起動しない。
- **Post**: 全5 step successかつmanifest/disposition structure completeの場合のみaggregate `success`。受信または再検証した`LC-DESIGN-001` successとmanifest検査結果`structure_complete=false`の不整合組はaggregation前に`Rejected(invalid_input)`。一般fold語彙には`skipped`があるが、local required `skipped`はfold前にschema validationで`Rejected(invalid_input)`としreceiptへ採用しない。aggregateの固定優先順は`stale > interrupted > denied > fail > skipped > success`。`aggregate_state`と各`CheckExecution.state`は前記既存`CiState`に限る。invalid inputでreceiptを構成できない場合は`Rejected`を外側に返しreceiptを作らない。入力不足・unsupported・未観測等は既存クラスと診断を保持し、`CiState`やsuccessへ混ぜない。部分実行でも既実行のstep evidenceを消さない。

### `F-LCI-07` — `verify_receipt(compact_json, current_target) -> CiApiResult<ReceiptCheck>`

- **Pre**: JSON bytes inputはbounded、canonical schema version 1。
- **処理**: strict JSON parse（duplicate keys reject）、repo-relative referencesとallowlisted IDsだけを許す。planは固定5 ID、fixed-contract selection basis、plan `state=success`、current plan config/manifest digestを検証し、receipt直下の`config_digest`を`plan.config_digest`とexact compareする。execution rowsは別fieldとして検証し、selected required `skipped`を`Rejected(invalid_input)`にする。`LC-DESIGN-001` execution successと`design_manifest_digest`から固定targetで再解決したmanifest bytesの独立構造検査結果が`structure_complete=false`の組は`Rejected(invalid_input)`としてfold前に拒否する。初期driverのtransport診断ではdispatch targetとreceipt target/refsを照合し、差異をK1保存結果ではなく診断に保持する。formal projectionでは`recorded_key`、保存済み`oldValue`、current inputsからcurrent K2 keyを再構成し、既存K2の共通lookup規則で判定する。単純なtarget revisionの前後方向だけで`Stale`を決めない。target treeからcontract/config/manifest/checker refsを再読してreceiptとの関係を照合する。同一targetを主張するreceipt内のconfig/checker digestがcurrent固定bytesのdigestと違えば`Unknown(conflict)`を返す。keyを構成できない必須入力欠落は`Rejected(missing_key)`、key構成後のsource read failureは`Unknown(unreadable)`、不正形式は`Rejected(invalid_input)`とし、これらをreceipt aggregateへ写さない。
- **Post**: driverは非K1 diagnosticを返し、formal projectionだけがcurrent K2 lookupに基づく既存result型を返す。hash一致でもlocal execution issuerを真正とはしない。

### `F-LCI-08` — `run_merge_unit_verifier(dispatch) -> CiApiResult<ProviderResult>`

- **Pre**: workflowはworkflow_dispatch、input JSONはenv経由、readonly permission。
- **処理**: exact target headをcheckoutし、receiptを照合し、同じbase/head/contract/settingsで`LC-DIFF-001`を実行してlocal/Actions statusを比較する。SCF validate/stale、GOV/design manifestはlocal-onlyでありActionsでは行わない。
- **Post**: formal APIのdispatch targetとcheckout current targetが不一致なら既存K1外側`Stale`とし、`ProviderResult`を返さない。初期CLIは同じ不一致をK1 resultではなく診断へ記録する。successはmerge/branch protection authorityを持たない。

## 2. Receipt構築

`receipt_body`のcanonical JSONはtarget identity、contract/manifest/config digests、checker SubjectRefs、runtime version、step state/exit code/output digestsを含む。外側digestを計算しcompact inputへ出す。出力先は`$XDG_CACHE_HOME/helix/local-ci`かsystem tempでrepo root外。receiptと同じtreeにreceiptを記録しないため、receipt保存が自分のhead_treeを変えることはない。

Receipt lifecycle:

1. local run前にexact targetを固定。
2. 実行ごとに新規receipt。既存receiptを更新しない。
3. run後にsame target/checker digest再計算。変化すればstale。
4. compact JSONはworkflow_dispatch inputとしてmerge-unitで渡す。input over-limit/unavailableはpositiveにならず、その既存`Unobserved`/`Unknown`診断を保持する。
5. full output logsは保存せず、必要なevidenceはstdout/stderr digestとexecution metadata。output digestは実行本文を後から再構成/真正化しない。

## 3. `DesignScopeManifest`関数境界

`F-LCI-09`内の4関数はmanifest上も個別source contract keyとなる。固定`DesignScopeManifest={version, files, coverage_edges, coverage_dispositions, source_scopeouts, legacy_pins, unsupported_items}`は全field必須である。`DesignFile={path, role, source_kind, expected_pair, definition_ranges, reference_ranges}`とし、各rangeは`{range_id, start_heading, end_heading, grammar: heading_id|table_column, id_column}`。`CoverageEdge={source_id, source_path, verifier_id, verifier_path, outcome_ref}`。`CoverageDisposition`は`mapped={source_id,state,edge_ids}`、`partial={source_id,state,edge_ids,reason,owner_ref,operational_owner,return_path}`、`not_exercised={source_id,state,edge_ids:[],reason,owner_ref,operational_owner,return_path}`のdiscriminated unionで、operational ownerは`{state:known,ref}`または`{state:unresolved}`。`SourceScopeout={source_id,reason,owner_ref,operational_owner,return_path}`。`LegacyPin={asset_id,archive_path,full_file_sha256,line_start,line_end,span_sha256|null}`である。`UnsupportedItem={id:U-LCI-01|U-LCI-02|U-LCI-03|U-LCI-04,reason,disposition:non_pass}`とし未知ID・`pass` dispositionは受け付けない。`F-LCI-09a load_design_manifest(snapshot) -> CiApiResult<DesignScopeManifest>`は全fieldと上記型、path+role+pair+source-kind、definition/reference range selector grammarを確認する。必須field欠落・余分field・型不正・unsupported dispositionのpass化は`Rejected(invalid_input)`、固定corpus上のID/edge欠落は`Unknown(missing_input)`、重複/曖昧定義は`Unknown(conflict)`とする。`F-LCI-09b resolve_id_graph(definitions, references) -> CiApiResult<IdGraph>`はID一意性・定義者・参照先を検査する。`F-LCI-09c verify_coverage_edges(edges, id_graph) -> CiApiResult<CoverageReport>`はL4→L9、L5→L8、L6→L7のcontract/fixtureの実在を検査する。`mapped`/`partial` sourceは一つ以上のedgeを要求し、`partial`には理由・既存owner ref・operational owner状況・return pathも必要とする。`not_exercised` sourceは`edge_ids=[]`と理由・既存owner ref・operational owner状況・return pathを要求し、edge先の一意解決を要求しない。設計対象外の抽出等はcoverage dispositionに混ぜず`source_scopeouts`で個別検査する。`F-LCI-09d verify_legacy_pins(pins) -> CiApiResult<PinReport>`はasset ledgerのasset ID/path/full SHAとarchive blobを照合し、line bytesのspan SHAは独立に計算する。各sub-IDは別々のL7 oracle edgeと正常baselineを持つ。

これらの関数は宣言範囲とID relationを検査し、文章全体の意味等価性や未知概念を推測しない。`verify_coverage_edges`は`RL-D4`から既存`IV-RL-56`/`IV-RL-57`/`IV-RL-59`へのpartial設計edgeを保持し、code-graph extractionの未設計・未検証は別の`source_scopeouts` fieldとして確認する。L4の4件のscope外`unsupported_items`とこのscopeoutは理由付きnon-pass dispositionのまま独立inventoryに保持し、構造manifest completeなら固定5-step successを妨げない。required ID/pin/edgeの欠落やunsupportedは`LC-DESIGN-001` successを阻止する。

## 4. L7 trace

各function ID `F-LCI-xx`はL7 unit oracle ID `UT-LCI-xx`へ一対一以上でつなぐ。L7 test codeはIDと入力/期待型を参照し、この本文を複製しない（repository-layout RL-T2）。Fixturesは合成Git objectとsynthetic receiptだけである。
