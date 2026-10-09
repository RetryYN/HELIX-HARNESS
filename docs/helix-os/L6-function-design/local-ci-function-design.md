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

対象target treeのcurrent L4/L5/L6/L7 bytesを実読し、そこに固定された旧source・採用済み親・変更理由のcrosswalkを用いる。下表は起草時の固定入力snapshotを識別する履歴値でありcurrent target pinではない。`dc803dacfbbe56f6daf7724832b1bfa238ff2087`も過去設計snapshotの履歴refであり、current targetや実行結果として継承しない。

| 入力path | 本文SHA-256 |
|---|---|
| `docs/helix-os/L4-basic-design/local-ci.md` | `e7cf8d12704b3d241aba1b6342a9873a7ae4be98f7e41fb90290844a527965ae` |
| `docs/helix-os/L9-integration-verification/local-ci-integration-verification.md` | `2c30c82701758525a13822b69329cff67b8fd5485d3d5fc4dc1f6e285c63a7e1` |
| `docs/helix-os/L5-detail-design/local-ci-detail-design.md` | `05ba206ce78eaecba0585dec3d08fa18e6dfb6b31e80423b5fea1455ca08a868` |
| `docs/helix-os/L8-detail-verification/local-ci-detail-verification.md` | `8f19d4ead8729255bf9dc6efcbf83d1c3d41e46a9c46e7f3558f240037f1681b` |

## 1. 関数群

`CiState`は既存語彙`success|fail|denied|skipped|interrupted|stale`に限る。APIで入力不足・unsupported・未観測・不正形式が起きた場合は既存K1の`Unknown`/`Unobserved`/`Stale`/`Rejected`を外側結果として保持し、`CiState`やreceiptの`aggregate_state`へ写さない。API入力が未構成でも診断を保持し、successに数えない。

`run_local_ci`が常に実行対象とするrequired setは、順に`LC-SCF-001`、`LC-SCF-002`、`LC-GOV-001`、`LC-DIFF-001`、`LC-DESIGN-001`、`LC-STAGE1-L7-001`の6件である。これは段階選択ではなく固定全量集合であり、個別関数の前後条件で除外しない。

### `F-LCI-01` — `resolve_target(repo, base_ref, head_ref) -> CiApiResult<CiTarget>`

- **Pre**: repoは固定checkout、base/head refはGit objectへ解決可能。local host-side reader/clean probeは`LocalCiConfig.executables.git`を固定選択し、同一roleのGit executable identity/digest、Git 2.35.2以降のversion、global/system config無効、`core.fsmonitor=false`・`core.hooksPath=/dev/null`等の固定argv/config、allowlisted environmentを、version/probe以外のGit操作前に確認する。provider用`provider_git` pinへfallbackしない。
- **処理**: 同じlocal-role fixed argv/config/environmentで`git --version`を確認してからmerge-base、head commit/treeをGit plumbingで取得し、要求された`head_ref`とcheckoutのHEAD/treeが一致するか確認する。一致しない場合は既存K1の外側`Stale`を返し、`CiTarget`のValueを返さない。version floor未満/parse不能/identity不一致は`Unknown(unsupported)`、fixed argv/config不一致はprobe前`Rejected(invalid_input)`とし、別Gitやinstallへfallbackしない。
- **Post**: checkout HEAD/treeが要求headと異なる場合は外側`Stale`を返し、`CiTarget` Valueを返さない。一致する`CiTarget`はbase, merge_base, head_commit, head_treeを保持する。必須target ref field自体が未入力でK2 keyを構成できない場合は`Rejected(missing_key)`。fieldはあるがOID形式が不正、または指定OIDがcommit objectへ解決できない場合は`Rejected(invalid_input)`。指定refが複数objectへ解決され、ref値を含むkeyは構成できる場合は`Unknown(ambiguous)`とし、存在しないtarget identityを補わない。current Git sourceの読取不能は、先にtarget subject/input refsでkeyを構成できたときだけ`Unknown(unreadable)`。

### `F-LCI-02` — `read_fixed_snapshot(target) -> CiApiResult<SourceSnapshot>`

- **Pre**: `target.head_tree`が存在し、固定manifestと12-document corpusがtargetから内部解決可能。local snapshot readerは`executables.git`を一度固定選択し、`resolve_target`と同じidentity/version (`>=2.35.2`)/argv/config/environment preflightをsource probe前に通す。Git 2.35.2未満・version parse不能・identity不一致は`Unknown(unsupported)`、固定argv/config不一致はprobe前`Rejected(invalid_input)`。provider roleのpinを試さない。
- **処理**: host-side trusted readerが固定argvの`git ls-tree -r -z`からpath→blob identityを解決し、`git cat-file blob`で必要bytesだけを読む。self-contained snapshot/private minimal objectsにはdeclared trees/blobs、merge-base/head commitsと`git diff`/scfctlに必要な宣言済みbaseline ancestorsを含め、remote/credential helperなしのprivate configを使う。sandboxへoriginal checkout/`.git`/`.git/config`は渡さない。repo filesystemをdocs source authorityにしない。
- **Post**: 各declared source bytesはtarget treeに一意に束縛され、実行snapshotには必要最小inputだけがある。K2 keyに必要なmanifest/source ref自体の入力欠落は`Rejected(missing_key)`、key構成後に宣言source pathがtarget treeにない場合は`Unknown(missing_input)`、Git blobの読取失敗は`Unknown(unreadable)`、symlink/non-blobまたはdeclared digestとのbytes不一致は`Unknown(conflict)`。version floor未満等は`Unknown(unsupported)`、fixed argv/config不一致はprobe前`Rejected(invalid_input)`。

### `F-LCI-03` — `check_clean_checkout(target) -> CiApiResult<CiTarget>`

- **Pre**: local runnerは対象repo rootで開始し、`executables.git`を固定選択して`resolve_target`と同じGit identity/version (`>=2.35.2`)/argv/config/environment preflightをGit status/index/worktree probe前に通す。Git 2.35.2未満・version parse不能・identity不一致は`Unknown(unsupported)`、固定argv/config不一致はprobe前`Rejected(invalid_input)`。provider pinへの切替はない。
- **Post**: index/worktree/untrackedを列挙し全てclean、HEAD/treeとtarget一致なら`Observed<CiTarget>`のValueを返す。差分があれば実行stateではなく既存K1外側`Stale`を返す。この関数は`CheckExecution`を生成せず、index/worktreeを書き換えない。

### `F-LCI-04` — `compile_plan(target) -> CiApiResult<LocalCiPlan>`

- **Pre**: target、固定config version、manifest source refsは固定定義から内部解決可能。suite-specific source refsの解決はplan前preflightでは行わず、第6 stepの直前に行う。local planは`executables.git` pinと`provider_git`のexact pinまたは未採取`null`を同じshared config bytesに保持する。keyに必要なtarget/source refが欠ける場合は`Rejected(missing_key)`。callerからconfig/manifest/role差替えを受けない。
- **処理**: required check IDsを固定順に構成し、argv literalを作る。呼出側はselection, argv, working directoryを上書きできない。
- **Post**: SCF validate、SCF stale、GOV、DIFF、DESIGN、開発source L7 suiteの各stepが一件ずつあり、すべてrequired/local、DIFFだけmerge-unit verifierも選択される。これは`CommandSpec.selection`の独立した`required`/`local`/`merge_unit` fieldで表し、実行先配属がrequired集合を除外しない。必須key refの未入力は`Rejected(missing_key)`、入力済みOIDの不正/未解決は`Rejected(invalid_input)`、manifest自体の必須field欠落・余分field・型不正・固定ID以外のunsupported dispositionは`Rejected(invalid_input)`、key構成済みmanifest内の必須ID/edge欠落は`Unknown(missing_input)`、blob読取失敗は`Unknown(unreadable)`、symlink/non-blob/重複ID等の構造競合は`Unknown(conflict)`であり、独自`CiInputError`型は追加しない。manifest構造preflightが不成立なら`compile_plan`は外側結果だけを返し、`run_local_ci`はcheckerを一つも起動せずexecution row/receiptを作らない。

### `F-LCI-05` — `run_step(snapshot, spec, process) -> CiApiResult<CheckExecution>`

- **Pre**: exact targetから作ったself-contained checkout外private snapshotがverified、original checkout/`.git/config`は不在、sandbox preflightで提供環境に既存の`bwrap`をtrusted host-local設定から解決し、name、opaqueな`--version` literal、全bytes SHA-256がprofile pinと一致すること、専用の空のnetwork namespace（host network非共有）/read-only input/private scratchを確立、command pathとentrypoint/transitive checker bytes digestがcurrent一致。system package/upstream provenanceは要件化しない。不在・identity不一致・preflight不能はchecker起動前`denied`で、install/host/別binary fallbackなし。python checker argvが固定`-B`契約を満たさない場合、またはallowlisted environmentに`PYTHONDONTWRITEBYTECODE=1`がない場合はspawn前に`Rejected(invalid_input)`。
- **処理**: `shell=False`で固定argvを実行する。Python checker argvには`-B`を固定し、envはPATH、LANG、LC_ALL等の必要値と`PYTHONDONTWRITEBYTECODE=1`だけをallowlistする。govcheckは`sys.executable gen_rulebook.py --check`で子process argvへ親の`-B`を転送しないため、この固定envを親子双方へ渡してchild bytecode cacheも抑止する。HOMEと他の継承値は除外し、環境値は記録しない。portable executable identity/name/version/digestだけをreceiptへ保持し、host解決pathは外部local設定に限る。process groupを監視し、govcheckの`gen_rulebook.py --check`子processも対象とする。stdout/stderr pipeは信頼側supervisorが回収してsha256化し、checker sandboxにはreceiptもparent directoryも見せず、本文を保存しない。
- **Post**: exit 0→`success`、非zero→`fail`、隔離/監視境界が確立できない→`denied`、全process groupの終了/reap確認後のtimeout→`interrupted(reason=timeout)`、supervisor外のrun全体cancel要求と停止/reap確認後→`interrupted(reason=cancelled)`。timeoutはstep後に後続required stepを続け、cancelは後続を起動せず残りを`interrupted(reason=cancelled)`として記録する。停止を確認できない場合は後続stepを開始せず`denied`。step前後にHEAD/tree/transitive checker digestを確認し、実行前の不一致なら起動せず外側`Stale`、実行後の変化なら既実行evidenceを保持してrun-level stale処理へ渡す。F-LCI-06では、required step完了前の変化は後続を起動せず、未開始stepをstale行として記録してaggregateへfoldする。全required step完了後の最終再照合で初めて検出した変化は外側`Stale`とし、実行evidenceは診断artifactへ保持するが`LocalCiReceipt`は発行しない。

F05はsandbox preflight denied等の未起動rowでは`started_at=null, finished_at=null, exit_code=null`かつ`suite_evidence`なしを保持する。F10のcomplete suite resultを通常回収できた場合だけF05がcompact `suite_evidence`を付け、suite failでもfailed/error/skip IDを含むfull artifactを残す。起動後timeout・停止不能等でcomplete resultが無ければsummaryは省略し、部分diagnosticを保持する。F06が途中のcancel/staleまたは停止不能で未開始suite rowを6行receiptへ置く場合も同じnull時刻/exitとsummary不在を検証する。source ref不足による外側`Unknown(missing_input)`はこの6行receipt経路に入らず、先行5件のdiagnosticだけを残す。

### `F-LCI-06` — `run_local_ci(target) -> CiApiResult<LocalCiReceipt>`

- **Pre**: `resolve_target`/clean/snapshot共通のlocal-role `executables.git` identity/version/config/argv/environment境界を通し、targetと固定config/manifestは内部解決する。caller指定のconfig/manifest/roleを受け取らない。provider pinのnull/差異はlocal Git readerを切り替えない。
- **処理順**: resolve→clean check→self-contained private snapshot/minimal objects→plan→sandbox preflight→全required stepを固定順で実行（第6 step直前にだけsuite source inventoryを解決）→再度clean/HEAD/tree/transitive checker確認→aggregate→external receipt write。manifest自体の必須field欠落・余分field・型不正・unsupported dispositionのpass化は外側`Rejected(invalid_input)`。snapshot/plan構造preflightで必須ID/edge欠落・未解決参照を検出したら外側`Unknown(missing_input)`、重複定義/曖昧edge等の構造競合なら外側`Unknown(conflict)`を返し、いずれもcheckerを一つも起動せずexecution rowもreceiptも作らない。必須key ref field欠落は`Rejected(missing_key)`、入力済みOID不正/未解決は`Rejected(invalid_input)`、key構成後のsource read failureは`Unknown(unreadable)`として同じく実行前に止める。これらは実行開始後のchecker失敗とは別境界である。sandboxへoriginal checkout/`.git/config`/receipt/receipt parent directoryを渡さない。checkerから見えるwritable領域はreceiptと分離したprivate scratchだけで、stdout/stderr pipeとexecution digestを信頼側supervisorが受け取りreceiptをcheckout外へ書く。構造preflightが成立してcheckerが起動した後に非zeroを返した場合はexecution `fail`とし、残りのrequired stepを続けて6件すべてのexecution rowをreceiptへ記録する。sandbox preflight失敗はchecker未起動の全6行を`denied`でreceiptへ残し、各行の開始/終了/exitはnull、suite summaryは不在とする。実行開始前のtarget/checker不一致は外側`Stale`としてexecution/receiptを作らない。実行開始後、未開始stepがある時点でtarget/checker bindingの変化を検出した場合は以後を起動せず、未開始stepを`state=stale, started_at=null, finished_at=null, exit_code=null`の行でreceiptに残す。timeoutではprocess停止/reap後に`reason=timeout`をexecutionへ記録して後続required stepを続ける。supervisor外run cancel要求ではprocess tree停止/reap確認後に未開始stepを`state=interrupted, reason=cancelled, started_at=null, finished_at=null, exit_code=null`で残して後続を起動しない。停止を確認できなければ`denied`とし後続を起動しない。全required step完了後の最終target/checker再照合だけで変化を検出した場合は外側`Stale`とし、実行evidenceを診断artifactへ保持するが`LocalCiReceipt`を発行しない。
- **Post**: 全6 step successかつmanifest/disposition structure completeの場合のみaggregate `success`。F10のsource-ref preflightがUnknownを返した場合は、先行5件の実execution evidenceを`PartialRunDiagnosticArtifact`へ残して外側Unknownを返し、未起動suite rowとLocalCiReceiptを作らない。未起動suite rowを作らず、UnknownをCheckExecution.stateやaggregateへ写さない。受信または再検証した`LC-DESIGN-001` successとmanifest検査結果`structure_complete=false`の不整合組はaggregation前に`Rejected(invalid_input)`。一般fold語彙には`skipped`があるが、local required `skipped`はfold前にschema validationで`Rejected(invalid_input)`としreceiptへ採用しない。aggregateの固定優先順は`stale > interrupted > denied > fail > skipped > success`。`aggregate_state`と各`CheckExecution.state`は前記既存`CiState`に限る。invalid inputでreceiptを構成できない場合は`Rejected`を外側に返しreceiptを作らない。入力不足・unsupported・未観測等は既存クラスと診断を保持し、`CiState`やsuccessへ混ぜない。部分実行でも既実行のstep evidenceを消さない。

### `F-LCI-07` — `verify_receipt(compact_json, current_target) -> CiApiResult<ReceiptCheck>`

- **Pre**: JSON bytes inputはbounded、canonical schema version 1。
- **処理**: strict JSON parse（duplicate keys reject）、repo-relative referencesとallowlisted IDsだけを許す。planは固定6 ID、fixed-contract selection basis、plan `state=success`、current plan config/manifest digestを検証し、receipt直下の`config_digest`を`plan.config_digest`とexact compareする。role別pinを含むshared configが変われば旧receiptのdigestはcurrentと異なるため`Unknown(conflict)`とし、local runを再実施するまでprovider照合をpositiveにしない。execution rowsは別fieldとして検証し、selected required `skipped`を`Rejected(invalid_input)`にする。`LC-DESIGN-001` execution successと`design_manifest_digest`から固定targetで再解決したmanifest bytesの独立構造検査結果が`structure_complete=false`の組は`Rejected(invalid_input)`としてfold前に拒否する。初期driverのtransport診断ではdispatch targetとreceipt target/refsを照合し、差異をK1保存結果ではなく診断に保持する。formal projectionでは`recorded_key`、保存済み`oldValue`、current inputsからcurrent K2 keyを再構成し、既存K2の共通lookup規則で判定する。単純なtarget revisionの前後方向だけで`Stale`を決めない。target treeからcontract/config/manifest/checker refsを再読してreceiptとの関係を照合する。同一targetを主張するreceipt内のconfig/checker digestがcurrent固定bytesのdigestと違えば`Unknown(conflict)`を返す。keyを構成できない必須入力欠落は`Rejected(missing_key)`、key構成後のsource read failureは`Unknown(unreadable)`、不正形式は`Rejected(invalid_input)`とし、これらをreceipt aggregateへ写さない。
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

全fieldと上記型、path+role+pair+source-kind、definition/reference range selector grammarと固定literal expansion表を確認する。heading_idはfence外の見出し構造行全文literalから固定対応表の既存IDだけを展開し、略記がなくても対応表を要求する。見出し/entry欠落・空展開はUnknown(missing_input)、見出しliteral/展開ID重複はUnknown(conflict)とする。bullet_idは宣言範囲の先頭IDだけ、exact_headingはstart_heading全文literal一件だけをsection_locatorとして読む。range外tokenや未登録略記から定義を補わず、exact_heading範囲内の子見出しを追加section_locatorにしない。必須field欠落・余分field・型不正・unsupported dispositionのpass化は`Rejected(invalid_input)`、固定corpus上のID/edge欠落は`Unknown(missing_input)`、重複/曖昧定義は`Unknown(conflict)`とする。固定corpusは12 path/role/pairを持つ。main基準のrequired source inventory 189 IDへ、source-only suiteの3 source ID（L4 `LC-STAGE1-L7-001`、L5 `D-LCI-06`、L6 `F-LCI-10`）を加えたcandidateは192 IDである。さらにCommon Kernel L5のK4/G3 exact-heading locator 1件を加えたinventoryは193 source IDとなる。L8のK4/G3 fixture 73件（K4=51/G3=22）はverifier definitionsでありsource countには含めない。L8のexpanded fixture IDはverifier definitionsでありsource countには含めない。

`parent_ac_coverage`もmanifest schemaで検証する。一般必須field欠落の`Rejected(invalid_input)`に対する例外として、このlist自体またはOS-020-01/03の片方のrow欠落は`Unknown(missing_input)`とする。重複またはL4 §1との不一致は`Unknown(conflict)`、passへの変更・unknown field・型不正・空理由は`Rejected(invalid_input)`である。理由比較はL4表のreason cellとのliteral一致に限り、自然言語の意味推論をしない。この専用記録はF09cのcoverage graphへ取り込まない。

### `F-LCI-09b` — `resolve_id_graph(definitions, references) -> CiApiResult<IdGraph>`

ID一意性・定義者・参照先を検査する。Common Kernel L8のK1/K2/K3/K5/K4-G3 fixture表ではcase列のexact cell literal展開を定義IDとし、同じexpanded IDをそのliteralが現れたraw table rowへ一意に結ぶ。L8第2列のL9 oracleと第3列に明記されたL4 invariantsはtyped referenceのまま保持し、fixture sourceへ昇格しない。展開IDが別rowに重複定義される場合は`Unknown(conflict)`、必要なliteral展開またはrow bindingがない場合は`Unknown(missing_input)`とする。

### `F-LCI-09c` — `verify_coverage_edges(edges, id_graph) -> CiApiResult<CoverageReport>`

L4→L9、L5→L8、L6→L7のcontract/fixtureの実在、edge_id全体一意性、dispositionから同source edgeへの解決を検査する。OutcomeRefのverifier_path/range_id/verifier_id/outcome_columnがedge先の一意な定義行の非空期待値cellへ戻ることを確かめる。Common Kernel L5→L8は5つのL5 locatorそれぞれについて、対応するL8 rangeのliteral expansionが列挙する全fixture IDへ一件ずつedgeを要求する。K4/G3は固定73 destination（K4=51、G3=22）で、各raw rowの第2列L9 oracleと第3列のL4 invariantはtyped referenceのまま保持する。versioned checker configuration内の独立固定inventoryはK1/K2=164、K3=194、K5=91、K4/G3=73（K4=51/G3=22）を別集合で保持し、manifestのrange expansion、definition row、coverage edge、dispositionを集合ごと照合する。manifest範囲・edge・dispositionを同時に削除しても独立リストとの不一致を検出する。同sourceに他edgeが残っていても一件のedgeと対応するdisposition referenceが同時に削除された欠落を検出する。各edgeのverifier ID、L5 source locator、raw-row binding、OutcomeRefは同じpair rangeと一致する。L8第2列のL9 IDや第3列のL4 IDを`source_id`へ置いたedge、K1/K2/K3/K5/K4-G3のlocator交差、expanded IDの別行への付替えは`Unknown(conflict)`とする。欠落edge/locator/outcome cellは`Unknown(missing_input)`であり、実行や意味被覆を推論しない。edge_id重複は`Unknown(conflict)`。`mapped`/`partial` sourceは一つ以上のedgeを要求し、`partial`には理由・既存owner ref・operational owner状況・return pathも必要とする。`not_exercised` sourceは`edge_ids=[]`と理由・既存owner ref・operational owner状況・return pathを要求し、edge先の一意解決を要求しない。設計対象外の抽出等はcoverage dispositionに混ぜず`source_scopeouts`で個別検査する。

### `F-LCI-09d` — `verify_legacy_pins(pins) -> CiApiResult<PinReport>`

asset ledgerのasset ID/path/full SHAとarchive blobを照合し、line bytesのspan SHAは独立に計算する。各sub-IDは別々のL7 oracle edgeと正常baselineを持つ。

これらの関数は宣言範囲とID relationを検査し、文章全体の意味等価性や未知概念を推測しない。`verify_coverage_edges`は`RL-D4`から既存`IV-RL-56`/`IV-RL-57`/`IV-RL-59`へのpartial設計edgeを保持し、code-graph extractionの未設計・未検証は別の`source_scopeouts` fieldとして確認する。L4の4件のscope外`unsupported_items`とこのscopeoutは理由付きnon-pass dispositionのまま独立inventoryに保持し、構造manifest completeなら固定6-step successを妨げない。required ID/pin/edgeの欠落やunsupportedは`LC-DESIGN-001` successを阻止する。

## 4. L7 trace

各function ID `F-LCI-xx`はL7 unit oracle ID `UT-LCI-xx`へ一対一以上でつなぐ。L7 test codeはIDと入力/期待型を参照し、この本文を複製しない（repository-layout RL-T2）。Fixturesは合成Git objectとsynthetic receiptだけである。


## 5. 開発source L7 suiteのfunction

### F-LCI-10 run_source_l7_suite(snapshot) -> CiApiResult<L7SuiteEvidence>

Pre: snapshotはCiTarget.head_commit/head_treeから作られたverified private readonly snapshotである。suite inventoryは内部の固定SourceL7SuiteInventoryから選び、callerがrow/path/ID/argv/runnerを指定・上書きできない。K1/K2/K3/K5/K6候補ではparent/dependency trace、L6/L7 refs、495 executable formal ID mappingと各rowのcoverage kind、別の10 K6 not-exercised disposition、implementation ref、test_k1.py/test_k2.py/test_k3.py/test_k5.py/test_k6.py refs、CPython 3.11+ standard-library runner identityが揃う。K3 UT-189はsignature構造のみ、UT-190はK6 stub境界であるため既存stub分類に置き、他192 K3 rowは対応callableを直接呼ぶ。declaration、ModelNumberDeclared、VersionRegistered、usable pack inputを要求せず、欠落・不在をqueryしない。target-tree上のimplementation/test/runner bytesを再計算し、test refsが固定pathと一致する。required ref欠落はUnknown(missing_input)、入力済み不一致はUnknown(conflict)、runner/toolchain非対応はUnknown(unsupported)でspawn前に停止する。

suite sourceを実行snapshotへ加える際、既にsnapshot.sourcesとsource_refsにあるpathはbytesとdigestを再照合して再利用し、同一bytesを再書込み・source ref重複追加しない。既存pathのbytes不一致またはsymlinkは`Unknown(conflict)`、既存source identityに対するfile欠落は`Unknown(missing_input)`として停止し、read-only modeを緩めて修復しない。

処理: 固定argv `python3 -B scaffold/local-ci/source_l7_runner.py --suite stage1-l7-source`をshell=False、既存sandbox/private snapshot/network隔離/process supervision境界で一度起動する。runnerはCoreの固定5 test modules、L5 §8.1の製品補助modules、§8.2の機構helper modulesを固定path/aliasでloadし、全TestCase.id()を取得する。Core identitiesは既存586件・SHA-256 `aca81abd7dd60c29512431c2d8223fd509d4c7a3a3fd7f1fc70847658ba0042d`、製品補助27件・SHA-256 `e5d71feabe981041144583fb0ee0f4754dd76d881e08fb44b48e5bf25d0b8239`と機構helper 103件・SHA-256 `017eaa7ad0ed602e16d4c0a11678337d0100b55b97bcc17ecba93a3ef72ce39a`を別々に照合し、相互にdisjointな候補union 716件・SHA-256 `a673e0343f8f2b91f78bc1c13785b5d2d44f7efb6c8dbdbf65cd4af5ae34cad4`を扱う。formal 505-ID closureは従来どおり495 executable mapping rows（K1/K2 165、K3 194、K5 91、K6 45）と10件のK6 not-exercised dispositionに分かれる。mappingは441 primary/52 stub/2 partial callable、SHA-256 `7473135901595324b2b6a42ac59b4af877398e5e1471950da54969b60059ea9c`であり、10件は2 partial_design/8 owner_unconnectedである。mapping rowとcoverage kindはCore partition内だけで照合する。`primary_callable` rowだけがprimary behavior coverageを示し、`partial_callable`はその行のL7で列挙された部分assertionに限り、`owner_or_fixture_stub` rowはstub境界の結果に限定する。候補716 identitiesを一度ずつ実行し、discovered/executed IDs、failure/error/skip/expected-failure/unexpected-success countsを回収する。別path/追加moduleの自動scanやcbce source fallbackはしない。旧baselineの196件とsorted-ID digestは履歴証拠でありcurrent expected値へ流用しない。

Post: discovery setの不一致はrunner起動後に検出される`Unknown(conflict)`診断として保持し、F05が実行結果を`CheckExecution.state=fail`へ写す。discovery mismatchではcompleteなsuite resultを得ていないためcompact `suite_evidence`を付けず、部分diagnosticを残す。composite inventoryのexpected 716 identitiesを各一回実行して全ID別結果を通常回収した場合は、pass/fail双方でfull identity artifactとcompact summaryを作る。全件failure=0/error=0/skipped=0/expected_failure=0/unexpected_success=0/exit=0、target/source refsが前後一致した場合だけ`CiApiResult<L7SuiteEvidence>`の成功値を返す。F06/F05が成功値からcompact `suite_evidence`をexecution rowへ結び、receiptへ記録する。full identity arraysは別external artifactへ保存し、compact summaryにはartifact SHA/count/ID-set digest/mapping digest/refsと、Core・product_supplemental・mechanism_helperそれぞれの`discovered_count`/`discovered_ids_sha256`/`executed_count`/`executed_ids_sha256`を持つ`partition_evidence`を置く。全source trace配列はfull artifactだけに保持する。run中target/source/runner driftは既存Stale境界を使いpositive receiptを作らない。実行後に全expected IDsの結果を回収した上でfailure/error/skip/expected-failure/unexpected-success/nonzeroとなった場合はF05が`CheckExecution.state=fail`とID別evidenceへ写し、complete summaryを保持する。実行ID集合が欠ける場合はcomplete resultでないためsummaryを省略して部分diagnosticを保持する。欠落source refs/toolchainはrunner spawn前に止めるが、discovery mismatchとexecution failはspawn後の別境界である。これはCore K1/K2/K3/K5/K6候補と固定4機構supplemental unitのL7 runだけであり、Stage 1全unit L7 coverage、OS-020/HARNESS適合、pack registration/usability、L8-L10合格を意味しない。

L7SuiteIdentityArtifact.discovered_test_idsとexecuted_test_idsはcurrent inventoryが固定した全expected identitiesを各々保持する。505 formal IDs（495 callable mapping rowsと10別disposition）とcoverage-kind付きtest identity mappingは別集合/別digestであり、集合を同数へ整形・切詰めしない。保存前のrunner payload validatorはinventory内のexpected count/ID-set digestと実arrayの両方を照合し、countだけでidentity欠落を許さない。compact receipt validatorはartifact digest、counts、ID-set digests、mapping digest、refsを必須にし、full arrayをcompact inputへ要求しない。Core expected identitiesは586件、sorted-ID SHA-256 `aca81abd7dd60c29512431c2d8223fd509d4c7a3a3fd7f1fc70847658ba0042d`で固定する。製品補助27件はdigest `e5d71feabe981041144583fb0ee0f4754dd76d881e08fb44b48e5bf25d0b8239`、helper 103件はdigest `017eaa7ad0ed602e16d4c0a11678337d0100b55b97bcc17ecba93a3ef72ce39a`、candidate union 716件はdigest `a673e0343f8f2b91f78bc1c13785b5d2d44f7efb6c8dbdbf65cd4af5ae34cad4`で照合し、mapping/identity/inventory digestsはSourceL7SuiteInventoryから再計算する。旧baselineの196を流用しない。

F10は5 outcome組のcounts/IDs/exitの整合を検証する。expected failureとunexpected successをsuccessへ畳まず、5組が空でexitだけ非zeroのpayloadはconflictとしてcomplete summaryを作らない。準備段階のmissing_inputとconflictはともに先行5件のpartial diagnosticを保存する。L7 placeholderは対象本文の明示許可値へ完全一致で展開し、未知値と余分なsuffixを拒む。artifact fallbackはuid別固定private rootとし、再読可能なdigest名を維持する。

### F-LCI-10の補助identity partition

次の追補は同じ`F-LCI-10 run_source_l7_suite`の入力集合を明示し、別関数・check・実行stepを作らない。上記のCore契約は保護prefixとして維持し、Core `586` identities、`505` formal ID closure、`495` callable mapping、K6の10 dispositionと各digestを変更しない。追加partitionはL5 §8.1の製品補助27 identityと§8.2の機構helper103候補であり、Core9、製品補助8、helper16の合計33 code/test refsと、これらのsource closureに必要な14 unique L6/L7 document refsを合わせ、計47 refsを実target treeから読む。

runner起動前にtrusted driver/preflightが、同じ`CiTarget.head_tree`からCore・製品補助・機構helperの33 implementation/test refsと14 unique L6/L7 document refs、計47 source refsを読み、期待digestと照合する。同preflightは機構別formal locator、原non-execution status cell、owner-return locatorの独立source trace集合も固定L7 bytesから解決する。欠落は既存`Unknown(missing_input)`、入力済ref/traceの内容不一致、supplemental IDの重複/余分/欠落は既存inventory conflictとして扱い、欠けた機構を飛ばして縮退実行しない。これに加え17個の固定alias/pathに属するCore・製品補助・helper test moduleのclass/method identityを、target bytesのASTだけで照合する。このtrusted段階ではtest moduleをimport/loadせず、AST parse失敗は既存`Unknown(unreadable)`、固定identityの不足は`Unknown(missing_input)`、重複・余分・不一致は`Unknown(conflict)`とする。解決は`LC-STAGE1-L7-001`の既存pre-spawn/noncomplete境界を使い、新しいK1 reason・receipt status・owner判定を作らない。runnerには検証済みの固定module inventoryだけを渡す。実import/discoveryはsandbox内runnerで再照合し、runnerはTestCase IDsとoutcomeを採取する。runnerはsource refsやformal/status/owner traceを読まずstdoutにも含めない。

trusted preflightはL5 §8.1/§8.2の固定alias/pathに属するCore・製品補助・helper test moduleのtarget bytesをAST解析し、既存class/methodと三partitionの候補716件identity集合を照合する。AST処理はimport、module load、test executionを行わず、固定された静的loop/登録helperだけを評価する。実import/discoveryと実行はsandbox runnerの責務であり、同じ固定setとの不一致は起動後の既存diagnostic境界を使う。runner候補はL5 §8.1/§8.2の固定aliasでCore 5、製品補助4、helper8 test modulesをloadする。`projection` basenameを共有するLABO/SECURITYは固定source pathに基づき`sys.modules["projection"]` entryだけをload前に一時置換し、test module globalsに束縛後に当該entryだけを復元する。`SupplementalTestIdentity`の27 identities、Coreの586 identities、helperの103 identitiesは別partition field/ID namespaceで保持し、三者が揃う候補union716件の重複を検査する。現行eeb6 runtimeの実行対象613件はCore586＋製品補助27のprefixであり、helperを含まない。Core discovery digestは従前の586件のまま別に検査する。helper103を含む候補716件の最大合法complete resultは134,755-byte body/134,756-byte LF capture/180,450-byte helper frameであり、candidate boundは134,755/134,756/180,580 bytesである。Core-only586とproduct27までの613時点値は比較履歴として保持する。eeb6 main runtimeはこの716 candidateへ未更新であり、設計から実行能力を推論しない。586 Core-only測定値90,514/90,515/121,474は比較履歴として保持する。Core 495 mappingと補助27 identityの間にformal-ID mapping/coverage edgeを作らない。

trusted sideは機構別L7 formal locator、L7 original status cell、owner return locatorを`MechanismFormalLocator`、`MechanismOriginalNonexecutionStatus`、`MechanismOwnerReturnTrace`としてfull external evidenceの独立inventory trace集合へ含める。trace集合はsupplemental test identityと1対1・行単位に結び付けない。これらはsource bytesの一意なlocator情報であり、formal mappingや実行結果ではない。`NotDeclaredBySource`は原L7にowner return locatorがないことを表すsource observationであり、ownerが存在しない、判定済み、許可済みという意味を持たない。status cell内容の正規化・統合・K6 dispositionへの変換をしない。

補助moduleのpassはそのmethodの局所assertionだけを示す。BRAINの既存K1/K2 payload保持候補、LABOのprivate projection helper、HARNESSのprivate comparison helper、INFRAのprivate projection/aggregation helperの結果を各製品formal L7 binding、source/owner authenticity、K3 permission、K5 restore、NFR測定、L8/L9/L10 passへ昇格しない。target-tree L6/L7 docsはsource refsとして固定されるが、それらの正式IDや未実施statusをsupplemental test identityへ自動変換しない。

K5の91 formal mappingは67 primary（公開API直呼び41、private helper直呼び24、K2 lookup依存2）と24 stub（UT-018/019/021–032/046/077–083/085/086）に分ける。直接のK5挙動65件とK2依存2件を区別し、UT-046のno-writeback、UT-085/086のowner completion/late条件はこのmappingから被覆を主張しない。K5 mapping SHA-256は `9e25d170dc5dc5bb48af57dd487fdc2939715f71f7c0679b84005e5aeb341acc`。

K6の45 formal mapping rowsは43 primary callableと2 partial callable（UT-035/036）であり、7 regression identitiesはformal mappingへ含めない。UT-010〜013/050〜052/054はowner_unconnected、UT-018/019はpartial_designとして、10件のnot-exercised dispositionに保持する。K6 callable mapping SHA-256は`12e75e7a54064d6f1bc9d5a7fbd2225b9bec4b04c6fa18a643e81ca035c194fd`、disposition SHA-256は`886884b4168945fd2d510f6ed787e46160821ebbb0292a6f82941434a8ef4e7d`。K6追加後のcode/test refsは9件、targetから読むL6/L7 refsは2件である。Core-only 586時点の最大合法payloadは90,514-byte body/90,515-byte capture/121,474-byte supervisor responseで、これは比較履歴として保持する。現在の613 identities（Core 586＋supplemental 27）を5つの互いに素なoutcome familyへ割り当てる最大合法complete payloadは99,820-byte body/99,821-byte LF capture/133,870-byte supervisor responseである。current boundsはbody/capture/response 99,820/99,821/134,000 bytesとし、切詰めや上限超過からcomplete artifact/positive receiptを作らない。単一/三familyの586/613比較形はL9 IV-LCI-99と同じ測定を保持する。直前534時点の82,000/82,001/120,000は履歴値である。切詰めや上限超過からcomplete artifact/positive receiptを作らない。


### F-LCI-10の機構helper partition候補

L5 §8.2で閉じる候補103 alias identitiesと16 implementation/test refs、helperの8 source-L6/L7 unique pathsを、既存F-LCI-10の第三partitionとして扱う。Core 586、製品補助27、helper 103のexpected sets/digestsを別々に再計算し、同一target tree内の716 unionにも一意性を検査する。Core 505 formal closure/495 mapping/10 dispositionと製品補助27は変更しない。helper identitiesはformal mappingや機構fixture coverageへ結ばない。

Trusted preflightは固定alias/pathとsource bytes digest、paired L6/L7 refsを確認し、ASTから列挙したclass/method identity集合をL5のliteral表と照合する。directory scan、任意module import、test名推測、formal ID生成はしない。欠落ref/identityは既存`Unknown(missing_input)`、duplicate/extra/cross-partition collision/digest mismatchは既存`Unknown(conflict)`、閉じたhelper metadataへの余分fieldは既存`Rejected(invalid_input)`としてsource suite境界へ保持する。これは設計候補であり、eeb6 mainのruntime runnerにはhelper103 source closureがまだ反映されていない。design manifestには本設計追補の固定identity/source closureが反映されているが、runtime runnerの更新やhelper partitionの実行を主張しない。
