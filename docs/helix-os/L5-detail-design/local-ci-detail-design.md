---
title: "HELIX-OS Stage 1 local CI 詳細設計"
status: design_pair_defined
owner: HELIX-OS
paired_l8: ../L8-detail-verification/local-ci-detail-verification.md
stage: 1
version_target: 1.0
---

# HELIX-OS Stage 1 local CI 詳細設計

本書はL4 `local-ci.md`の契約をデータ型、手順、command境界へ下ろす。上流意味、check集合、対象scopeを追加しない。

| 詳細契約ID | 範囲 | L8検証 |
|---|---|---|
| `D-LCI-01` | target/snapshot/clean worktree束縛 | `CASE-L8-LCI-01`〜`-03`, `-11`, `-47`〜`-49`, `-52`, `-56`, `-58`〜`-59`, `-61` |
| `D-LCI-02` | 5-step command plan/argv/継続/timeout | `CASE-L8-LCI-04`〜`-10`, `-41`, `-50`〜`-51`, `-67`, `-80`〜`-83` |
| `D-LCI-03` | 明示design manifest、ID/coverage関係、過去source pin | `CASE-L8-LCI-12`〜`-20`, `-53`〜`-54`, `-62`〜`-66`, `-68`〜`-73` |
| `D-LCI-04` | 外部canonical receipt/privacy/aggregate/key境界 | `CASE-L8-LCI-21`〜`-28`, `-42`〜`-46`, `-57`, `-60` |
| `D-LCI-05` | workflow_dispatch target/input/selected check parityとrole別Git identity | `CASE-L8-LCI-29`〜`-40`, `-55`, `-74`〜`-79` |

## 1. 実行API

AI設計判断として、driver実装言語はCPython 3.11+ standard libraryのみとする。追加package/lockfileを要さず、subprocess argv配列、Git plumbing、SHA-256、JSONを扱える。現行driverとそのfixtureは`scaffold/local-ci/`配下で新しいScaffold Bindingに登録する。`scfctl`/`govcheck` adapter依存が残る間は正式pack登録済み・OS unit完成とは主張しない。adapter移管と依存閉包後のOS unit移管先候補は`helix/helix-os/units/os-ci-runner/{declaration.json,src,tests,fixtures}`である。OS所有宣言は移管後にlayout既存のdeclaration/OperationDecl/VerifierSet境界へ分ける。新しいrepository-root file/configは設けない。

```text
CiApiResult<T> = Observed<T> | Rejected
resolve_target(repo, base_ref, head_ref) -> CiApiResult<CiTarget>
read_fixed_snapshot(target) -> CiApiResult<SourceSnapshot>
check_clean_checkout(target) -> CiApiResult<CiTarget>
compile_plan(target) -> CiApiResult<LocalCiPlan>
run_step(snapshot, spec, process) -> CiApiResult<CheckExecution>
run_local_ci(target) -> CiApiResult<LocalCiReceipt>
verify_receipt(compact_json, current_target) -> CiApiResult<ReceiptCheck>
run_merge_unit_verifier(dispatch) -> CiApiResult<ProviderResult>
export_compact(receipt) -> UTF8Json
```

`CiApiResult<T>`は既存K1の`Observed<T>`と入力境界の`Rejected`を参照する別名であり、新しいresult class/schemaではない。`Unknown`/`Unobserved`/`Stale`は`Observed<T>`内の既存classとして保持し、`CiState`や`CheckExecution.state`へ混ぜない。後者は六値の実行状態だけを保持する。`read_fixed_snapshot(target)`、`compile_plan(target)`、`run_local_ci(target)`は固定versioned `LocalCiConfig`とmanifestを内部で解決し、呼出側のargv/executable/path/selection上書きを受け取らない。`runner`/`process`はtest seamで、本番ではL4の候補`bwrap`をportable executable identity、opaqueな`--version` literal、全bytes digestで固定してfixed argvで起動する。system package由来・semantic version・upstream provenanceの保証は含めない。解決したhost executable pathはhost-local設定でのみ保持し、portable identity/version/digestと固定argvのbytes bindingを実行前に照合する。pathはplan、execution、receiptへ保存しない。これはregistered runner artifactとの主張ではなく、不在・opaque version literalまたはbytes digest不一致・preflight不能なら起動前に`denied`とし、install/host/別binary fallbackをしない。`bwrap`候補は提供環境で利用可能なbinaryをtrusted側から解決し、その`--version`のliteral表示と全bytes SHA-256を採取する。`~/.local/bin/bwrap`は観測環境での候補pathにすぎず、pathをportable identityへ含めない。上流provenanceは未証明で、system package由来とは扱わない。そのsandbox内のfixed checker argvを`subprocess.Popen(..., shell=False, start_new_session=True, env=allowlisted_env, text=False)`で実行する。Python supervisorは親processと子processを含むprocess groupのtimeout/終了/reapを監視し、exit status、開始/終了、stdout/stderr pipeを回収してdigestを取る。govcheckの`gen_rulebook.py --check`子processもこの境界内である。任意log本文と環境変数値は採取しない。`SourceSnapshot`は後述する固定target source refsとread-only private snapshot/minimal objectsを束縛する`IsolatedRun`のAPI上の別名である。checker失敗後は次のstepを続ける。supervisor外からrun全体の中止要求を受けた場合は、起動中process treeの停止・reap確認後に未開始stepを`interrupted(reason=cancelled)`として記録し、停止を確認できなければ未開始stepを`denied`として後続を起動しない。構成前のinvalid inputは外側`Rejected`としreceiptを作らない。

この型aliasは正式OS APIの契約形であり、初期`scaffold/local-ci/` CLIのJSON診断や外部receiptをK1の`Observed<T>`として保存する宣言ではない。将来formal resultを保存する場合、operation keyは既存K2の型を用い、`operation_id="OS-LOCAL-CI-001"`, `operation_version="1"`、current targetを表す既存K2 `SubjectRef`（repository identity、target descriptorのrevision）と既存target scope、`config_digest`/`design_manifest_digest`/各checkerのcurrent `HeadInputRef`を全て入力に含める。`CiTarget.head_tree`は`GitTreeOid`としてtarget fieldに保持し、`SubjectRef.digest`へ直接代入しない。target descriptorの`SubjectRef.revision`は`canonical_json({base_commit, merge_base, head_commit, head_tree})`で表す複合版とし、個別の`GitRevision`とは別の既存K2 revision文字列である。base/merge-base変更も対象revision変更として扱い、同じhead commitのまま正当なbase変更が起きた場合を同revision異digestのconflictにしない。`SubjectRef.digest`は固定target全体（`repository_id`、`base_commit`、`merge_base`、`head_commit`、`head_tree`、`worktree_clean`）を既存K2のcanonical JSON bytesへ符号化したbytesのSHA-256とし、`GitTreeOid`の直接代入およびSubjectRef identityだけのhashとは区別する。source refsは固定target Git treeから実読し、そのbytesからcurrent digestを再計算する。必須target/source refが欠けてK2 keyを構成できないときは`Rejected(missing_key)`であり、任意のplaceholder refや鍵を持たない`Unknown`を生成しない。key構成後のsource read errorは`Unknown(unreadable)`として既存外側結果に残す。初期driverはこのK1/K2保存境界へ移管済みとは主張せず、独自K1 recordも作らない。

## 2. 正準データ型

```text
CiTarget = {
  repository_id: str, base_commit: GitOid, merge_base: GitOid,
  head_commit: GitOid, head_tree: GitTreeOid, worktree_clean: true
}
IdRange = {range_id: str, start_heading: str, end_heading: str|null,
           grammar: heading_id|table_column|bullet_id|exact_heading, id_column: int|null,
           literal_expansions: list[{literal: str, ids: list[str]}]}
DesignFile = {path: RepoRelativePath, role: l4|l9|l5|l8|l6|l7,
              source_kind: current_contract, expected_pair: RepoRelativePath,
              definition_ranges: list[IdRange], reference_ranges: list[IdRange]}
IdDefinition = {id: str, path: RepoRelativePath, range_id: str, definition_kind: str}
IdReference = {id: str, path: RepoRelativePath, range_id: str, reference_kind: str}
OutcomeRef = {verifier_path: RepoRelativePath, range_id: str,
              verifier_id: str, outcome_column: int}
CoverageEdge = {edge_id: str, source_id: str, source_path: RepoRelativePath,
                verifier_id: str, verifier_path: RepoRelativePath, outcome_ref: OutcomeRef}
CoverageDisposition = {source_id: str, state: mapped, edge_ids: list[str]} |
                      {source_id: str, state: partial, edge_ids: list[str], reason: str,
                       owner_ref: ContractRef, operational_owner: {state: known, ref: ContractRef}|{state: unresolved}, return_path: str} |
                      {source_id: str, state: not_exercised, edge_ids: [], reason: str,
                       owner_ref: ContractRef, operational_owner: {state: known, ref: ContractRef}|{state: unresolved}, return_path: str}
SourceScopeout = {source_id: str, reason: str, owner_ref: ContractRef,
                  operational_owner: {state: known, ref: ContractRef}|{state: unresolved}, return_path: str}
UnsupportedItem = {id: U-LCI-01|U-LCI-02|U-LCI-03|U-LCI-04,
                   reason: str, disposition: non_pass}
DesignScopeManifest = {version: str, files: list[DesignFile],
                        coverage_edges: list[CoverageEdge],
                        coverage_dispositions: list[CoverageDisposition],
                        source_scopeouts: list[SourceScopeout],
                        legacy_pins: list[LegacyPin],
                        unsupported_items: list[UnsupportedItem]}
LegacyPin = {asset_id: str, archive_path: RepoRelativePath,
             full_file_sha256: Sha256, line_start: int, line_end: int,
             span_sha256: Sha256|null}
ExecutableIdentity = {name: str, version: str, sha256: Sha256}
SandboxProfile = {backend: {name: "bwrap", version: str, sha256: Sha256},
                  profile_digest: Sha256, network: connectivity_disabled_in_private_namespace, process_tree: monitored,
                  bytecode_cache: disabled, input_mounts: list[ReadOnlyMount], writable_mounts: list[PrivateScratch],
                  host_home: absent, credentials: absent}
IsolatedRun = {target: CiTarget, source_refs: list[HeadInputRef], private_snapshot_path: OutsideCheckoutPath,
               private_minimal_git_objects: {declared_blobs_and_trees, merge_base_head_commits, required_baseline_ancestors},
               private_git_config: no_remote_no_credential_helper, original_checkout_mount: absent,
               original_git_config_mount: absent, receipt_mount: absent, sandbox_profile: SandboxProfile,
               git_reader_identity: {name: "git", version: str, sha256: Sha256}}
GitExecutableIdentity = {name: "git", version: str, sha256: Sha256}
LocalCiConfig.executables = {git: GitExecutableIdentity, provider_git: GitExecutableIdentity|null,
                             python: ExecutableIdentity, bwrap: ExecutableIdentity}
RuntimeIdentity = {python: ExecutableIdentity, git: GitExecutableIdentity, bwrap: ExecutableIdentity}
SourceSnapshot = IsolatedRun
CommandSpec = {check_id: str, argv: list[str], cwd_rel: ".",
               selection: {required: true, local: true, merge_unit: boolean},
               timeout_seconds: 300}
LocalCiPlan = {target: CiTarget, contract_id: "OS-LOCAL-CI-001",
               contract_version: "1", selected_check_ids: list[str],
               selection_basis: "fixed_local_ci_contract", config_digest: Sha256,
               design_manifest_digest: Sha256, commands: list[CommandSpec],
               state: success}
CheckExecution = {check_id: str, portable_executable_identity: {name: str, version: str, sha256: Sha256},
                  state: success|fail|denied|skipped|interrupted|stale, exit_code: int|null, argv: list[str], cwd_rel: ".",
                  started_at: str|null, finished_at: str|null,
                  reason?: timeout|cancelled,
                  timeout_seconds: 300, sandbox_profile_digest: Sha256|null,
                  stdout_sha256: Sha256|null, stderr_sha256: Sha256|null}
CiState = success|fail|denied|skipped|interrupted|stale
LocalCiReceipt = {schema_version: 1, target: CiTarget, contract_ref: SubjectRef,
                   config_digest: Sha256, design_manifest_digest: Sha256,
                   checker_refs: list[SubjectRef], runtime_identity: RuntimeIdentity,
                   plan: LocalCiPlan, executions: list[CheckExecution], aggregate_state: CiState,
                   created_at: str}
ProviderResult = {check_id: "LC-DIFF-001", local_state: CiState,
                  provider_state: CiState, selected_check_parity: boolean,
                  provider_git_identity: GitExecutableIdentity, positive: boolean}
```

`IdRange`のstart headingは範囲開始を含み、end headingは範囲終了を含まない（nullは文書末尾）。range境界のheading literalは対象文書内で一意に解決する。Markdown headingは行頭の1〜6個の`#`と直後の空白で始まる構造行だけを指し、fenced code block内のheading状テキストはheadingとして読まない。table_columnのid_columnは1始まりの列番号、heading_id/bullet_id/exact_headingではnull。

`heading_id`は固定manifestの`literal_expansions`に列挙したheading literalだけを選び、そのliteralの`ids`を既存ID定義として展開する。literalは文書中のheading構造行全文とのexact一致であり、`literal`→`ids`の対応は明示する。例えばL6見出し``### `F-LCI-09a` — `load_design_manifest(snapshot) -> CiApiResult<DesignScopeManifest>` ``は、manifestにその全文literalと既存ID`F-LCI-09a`を明示した場合だけそのIDの定義となる。見出し内の文字列検索や見出し番号からIDを合成しない。`heading_id`で選ばれたliteralがrange内に無い場合、必要なheading literalまたはその展開entryがmanifestに無い場合、あるいは`ids`が空配列の場合は`Unknown(missing_input)`とする。対応表にないheadingは定義へ加えず、固定corpusで必要な既存IDを満たさない欠落として扱う。選択literalがrange内で複数回現れる場合、対応表で同一IDを重ねて定義する場合、または展開IDが他selectorの定義と衝突する場合は`Unknown(conflict)`とし、最初の出現や片方を選ばない。`heading_id`の展開先は既存IDに限り、manifestにない新しい識別子を作らない。

`bullet_id`は選択範囲内の行頭`- **<ID> <label>**`の先頭IDだけを定義として読む。箇条書き本文中の参照tokenを定義へ昇格しない。`exact_heading`は既存見出し全文のexact literalを構造locator keyとし、`definition_kind=section_locator`で通常のID定義と区別する。source_idはそのrangeのstart_heading全文と一致し、pathとrangeを併せて解決する。exact_headingはstart_headingだけを一つのsection locatorとして取り、範囲内の子見出しを追加定義にしない。各sectionのend_headingは固定manifestに次の同階層見出しの全文literalを明記し、最終sectionだけnullとする。実行時に「次の見出し」を推測しない。これはL4が検査対象とする機構sectionを指定するための参照であり、文書にない意味上のcontract IDを作らない。見出し番号だけやcode commentから合成IDを生成せず、見出し変更はmanifest更新なしに解決しない。range_idは同一file内で一意とし、`IdDefinition`/`IdReference`はpathとrange_idの組で定義域/参照域へ戻る。これらのselectorは固定manifestのcode constantであり、任意の自由本文を意味解析しない。各rangeの`literal_expansions`は明示したcell/heading/bulletのliteralからexact ID列への固定対応表で、heading_id以外で略記のないrangeは空配列とする。heading_idは略記の有無によらず選択する見出し全文と既存IDの対応を列挙する。suffixや範囲の省略記法を自由regexで推測しない。対応表にない略記は構造不足、展開後の重複IDは競合として扱う。各`edge_id`はmanifest全体で一意で、dispositionの`edge_ids`は同じsourceに属する実在edgeへ解決する。`outcome_ref`はverifier pathとIDがedge先と一致し、指定rangeのtable定義行へ一意に戻り、1始まりoutcome columnの非空cellを指す。列番号だけで文面の意味の正しさを認定しない。

`CiState`は既存の六値だけを取り、receiptの`aggregate_state`にも`Unknown`等を入れない。一般fold語彙に`skipped`があることと、このlocal schemaでrequired rowをskip可能なことは別であり、required `skipped`はfold前に拒否する。入力不足・非対応・未観測・stale・不正形式はK1/K2の既存外側結果型`Observed<T>`内のclassまたは`Rejected`として診断付きで返し、successに数えない。これらとcheck実行状態を混同しない。`LocalCiPlan.state=success`は開発repo用固定5件の計画作成だけを意味し、generic OS-020 profile/義務選択やexecution結果を意味しない。planは`selection_basis`、選択集合、plan用`config_digest`、manifest digestを保持し、`LocalCiReceipt.executions`の各実行stateやaggregateとは別fieldである。required selected checkの`skipped`はこのlocal contractでは許可しないschema-invalid値で、receipt validatorは`Rejected(invalid_input)`を返す。`CheckExecution.state=skipped`は既存語彙に残るが、この5件のselected-required receipt rowには使えない。receipt validatorはaggregation前に整合を検証する。受信receiptに`LC-DESIGN-001` executionがsuccessと記録されている場合、validatorはreceiptの`design_manifest_digest`で固定targetのmanifest bytesを解決し、manifest validatorの独立した構造検査結果を照合する。これはreceipt fieldではなく検証時に導出する結果であり、その結果が`structure_complete=false`なら`Rejected(invalid_input)`とする。これを`Unknown`やaggregate `fail`へ写さず、架空のreceipt fieldを要求しない。

`LocalCiReceipt.executions`は5つのrequired check IDを固定順に各一度保持する。欠落・重複・順序違い、または一つでもsuccess以外のexecutionがあればaggregate successを作らない。receipt直下の`config_digest`は`plan.config_digest`と完全一致する。`CheckExecution.reason`は中断理由のoptional fieldであり、`state=interrupted`では`timeout|cancelled`のいずれかを必須とし、それ以外のstateでは省略する。

supervisor外からrun全体への中止要求を受け、起動中process treeの停止・reapを確認できた場合は、未開始の残りstepを`state=interrupted, reason=cancelled, started_at=null, finished_at=null, exit_code=null`で列挙する。開始済みprocessの停止・reapを確認できない場合は未開始stepを`denied`とし、後続を起動しない。timeout後の`interrupted(reason=timeout)`は別条件であり、process treeの停止・reap確認を要する。sandbox preflight失敗時は各required executionを`denied`で記録する。receipt構成前、targetまたは必須source refが欠けてK2 keyを作れない場合は外側`Rejected(missing_key)`、key構成後のsource read failureは`Unknown(unreadable)`、bytesを読んだ後のID/edge欠落はsnapshot/planの構造preflightで検出し、run全体の外側`Unknown(missing_input)`として返す。この時点ではcheckerを一つも起動せず、execution行もreceiptも作らない。重複定義等の構造競合も同じpreflight境界で外側`Unknown(conflict)`とする。構造preflightが成立した後に実際の`LC-DESIGN-001` checkerが非zeroを返す場合は、他checkerと同じexecution `fail`で5行receiptを作り、外側Unknownへ置換しない。aggregateは実行された各stepの状態を固定優先順`stale > interrupted > denied > fail > skipped > success`で畳み、全5件が`success`の場合だけ`success`とする。all required selected stepsの`skipped`はinvalid receiptなので集約しない。全step stateと診断は個別executionに残す。 実行前のtarget/clean/checker不一致は外側`Stale`でreceiptを作らない。途中の再照合で変化を検出し未開始stepがある場合はL4 §2.3どおり後続を起動せず、未開始stepを`state=stale, started_at=null, finished_at=null, exit_code=null`として5行receiptへ保持し、既存foldで集約する。全step終了後の最終再照合で変化を検出し未開始stepがない場合は、run全体を既存外側`Stale`として返し、`LocalCiReceipt`を発行しない。既実行stepのevidenceはreceiptとは別の診断artifactへ保持する。全step successを残したままaggregateだけをstaleへ上書きせず、架空のstale execution行も作らない。

正準形式はUTF-8 JSON、key sort、不要な空白なし、NaN/Infinityなしとし、保存ファイルの末尾だけLFとする。`receipt_digest`は保存後の`sha256(canonical_bytes(receipt))`を別渡しし、`LocalCiReceipt`のfieldにしない。source/contract/checker参照は現行CKに従うK2 `SubjectRef`/`HeadInputRef`でrevision/digestを保持する。local receiptはrepo K5 logへのappendでない外部run artifactであり、それだけでK1/K2 acceptanceにならない。

## 3. 設定とcommand定義

`LocalCiConfig`はL4 §2.1と一致する5 command argvを持つversioned code constantである。5件すべて`required=true`かつ`local=true`とし、`LC-DIFF-001`だけ`merge_unit=true`、他4件は`false`とする。required集合と実行先配属は独立fieldであり、5件全てrequiredのままDIFFだけをmerge-unit verifierでも照合する。shell/command substitution/caller指定のexecutableやchecker pathを認めない。portable executable設定は既存local Git pinを`executables.git`に維持し、Actions用に`executables.provider_git: GitExecutableIdentity|null`を一つ追加する。`bwrap`は別の既存実行環境binaryとしてprofileへ{name, opaque version literal, exact bytes SHA-256}を束縛し、system packageやsemantic versionを仮定しない。`null`はprovider Git bytesをまだ採取していない状態であり、仮digestではない。`local`入口は`git`、provider入口は`provider_git`を内部で固定選択し、dispatch/receipt/callerからroleや実行pathを指定できない。両pin mapを含む固定versioned config bytesはlocal/providerで共通であり、`config_digest`はそのcanonical JSON bytes、5 command argv、固定selection rule、`DesignScopeManifest` version、300秒timeout、sandbox profile/監視設定をhashする。provider pinが`null`でもlocal runのplanはその設定値をdigestへ含めて作れるが、providerは照合済みpositiveを返せない。pinが後で加わるとshared config digestが変わるため、旧receiptは`Unknown(conflict)`となり、新configでのlocal runが必要である。local receiptの`runtime_identity`と`LC-DIFF-001` execution identityはlocal実行で実測したidentityだけを保持する。providerがpin済みbinaryを検証した後は、`ProviderResult.provider_git_identity`にproviderの実測identityを保持する。どちらもhost pathを含めない。checker identityはrepo-relative path、source Git `SubjectRef`、current SHA-256、interpreter identityを記録し、`govcheck.py`とtransitive child `gen_rulebook.py`を両方含む。実行前にreaderが`head_tree`との参照一致を確かめ、実行後にtarget/checker digestを再照合する。Python checkerはargvに`python3 -B`を固定し、`PYTHONDONTWRITEBYTECODE`による代替起動を認めない。それに加えてallowlisted environmentに`PYTHONDONTWRITEBYTECODE=1`を固定する。govcheckの現行child起動は`sys.executable gen_rulebook.py --check`で親argvの`-B`を転送しないため、親子双方へ固定envを渡しreadonly snapshotへpycacheを書かない。checkout変更はstaleである。

信頼済みhost-side `SourceSnapshotReader`はexact target Git treeから必要なblob bytesと最小Git objectだけを解決し、self-contained private snapshotへ出力する。private object setにはdeclared trees/blobs、merge-base/head commitおよび`git diff`/scfctlに必要な宣言済みbaseline ancestorsを含め、remote/credential helperのないprivate Git configを作る。sandboxへoriginal checkout、original `.git/`、`.git/config`、original object storeをmountしない。private snapshotと生成した最小Git objectsはread-onlyとし、runner backendはtrusted host-local settingで解決した提供環境の既存`bwrap`についてname、opaque `--version` literal、全binary bytes SHA-256をこの設計のprofileへpinし、一致した実体だけを許す。今回の環境ではCodex同梱`~/.local/bin/bwrap`が解決候補として確認されているが、pathは環境固有で記録せず、upstream provenance/真正性やsystem package由来は主張しない。これはregistered runner artifactとのclaimではない。`--unshare-all`, `--die-with-parent`, `--new-session`, read-only bind、`--tmpfs /tmp`, `--clearenv`を含む固定argvを使い、選択した既存binary/runtimeは必要範囲だけread-only、receiptと分離したprivate `/tmp`のみcheckerからwritableにする。receiptと親directoryはsandboxへmountせず、信頼側supervisorだけがcheckout外へatomic writeする。govcheckの`gen_rulebook.py --check`子processも同じsandbox・supervisor境界に置き、checker argvは`python3 -B`、親子の固定envは`PYTHONDONTWRITEBYTECODE=1`としてbytecode cacheを抑止する。network namespace、read-only mount、private scratchのいずれかをpreflightで確立できない場合、checker起動前に各stepを`denied`とし、host実行・別sandbox・installへfallbackしない。rootのhost probeでexisting binaryがnamespace startできた観測は設計実行合格ではなく、実行ごとのpreflightを省略しない。

supervisorは各process groupの起動/終了を監視する。300秒は短い30秒候補で誤中断を避け、長い600秒候補よりhang feedbackを早める折衷として選ぶAI技術候補であり要求値/SLOではない。TERM grace 5秒も即時KILLより正常終了を許し、長いgraceより待ち時間を抑える候補である。timeout到達時はTERMを送り5秒後に残存process groupをKILLし、govcheckの`gen_rulebook.py --check`子processを含む全processの停止・reap確認後`interrupted(reason=timeout)`を記録して後続stepを続ける。supervisor外からrun全体への中止要求時も起動中process treeの停止・reapを確認後に`interrupted(reason=cancelled)`とし、停止を確認できない場合は残りstepを開始せず`denied`にしてprocessをsuccessとして扱わない。

`LC-SCF-002`は`python3 -B scaffold/tools/scfctl.py stale`を実行し、全未retired bindingの上流revisionをread-onlyで照合する。scfctl既存契約ではstaleなしはexit 0、stale一件以上はexit 1となる。`validate`の正常終了からstale=0を推定しない。

`LC-DIFF-001`は`merge_base`と`head_commit`を受け取り、`--no-ext-diff --no-textconv`を固定する。commit diff全体を検査する。Gitが報告するwhitespace errorと追加行にあるconflict markerを対象とし、すべての競合markerの意味検出を主張しない。local CIは検査対象treeとsubmitted commitを一致させるためclean worktreeを要求し、untracked/staged変更はstaleとして止める。stage/package selectorでrequired checkを外せない。

## 4. source readerとdesign manifest

`resolve_target`は必須head/base ref自体が入力に無い場合だけ`Rejected(missing_key)`とする。入力済みOIDが存在するcommit objectへ解決できない場合は入力境界の`Rejected(invalid_input)`として返し、初期CLIでもref解決不能の非K1診断を残す。存在するcurrent target refでkey構成後のGit読取不能は`Unknown(unreadable)`であり、未解決OIDを架空refで埋めない。

`SourceSnapshotReader`とclean probeのhost-side Git plumbingは、固定argv/configを使い`GIT_CONFIG_NOSYSTEM=1`と`GIT_CONFIG_GLOBAL=/dev/null`でglobal/system Git configを無効化し、`-c core.fsmonitor=false`と`-c core.hooksPath=/dev/null`を固定する。Git公式[core.fsmonitor仕様](https://git-scm.com/docs/git-config#Documentation/git-config.txt-corefsmonitor)は、Git 2.35.1以前ではboolean値を認識せず`false`をhook pathnameとして起動する可能性を明記する（参照日2026-10-09）。その互換性境界に合わせ、reader用Gitの技術候補は2.35.2以降とする。host-local設定から解決した同一Git executableのbytes identityを取り、reader/source probe前に`git --version`だけを実行してversionとdigestを確認する。versionを安全にparseできない、2.35.2未満、または候補identity/digestと不一致なら`Unknown(unsupported)`を返し、status/source probe、checker、hookを起動しない。unsupported環境へinstallや別Gitへのfallbackはしない。diffを実行するcommandには`--no-ext-diff --no-textconv`を固定する。readerはallowlist外のhost環境変数（`GOVCHECK_ROOT`等を含む）を継承しない。任意hook/fsmonitor/external commandを起動しない。これらのGit argv/config/environment policyとreader Git version floorはversioned checker configurationへ含める。`SourceSnapshotReader`は宣言pathのbytesを`git ls-tree -r -z <head_tree>`と`git cat-file blob <blob_oid>`で解決する。current design documentに対するsymlink/non-blob入力は`Unknown(conflict)`としてsource preflightで拒み、check前にpath/digestを照合する。runtime codeから`docs/` filesystem pathを直接読まない。current-document manifestには既存mainのL4/L9文書4件と今回のOS pair文書6件を明示する。各identifierのdefinition rangeとreference rangeを分け、parserは任意token検索ではなく明示column/range grammarからIDを読む。

`verify_design_manifest`は定義一意性、各参照の一意な定義への解決、定義と参照の分離、各L4 invariant/repository-layout機構契約からL9 verifierへの明示mapped/partial edgeまたは明示not_exercised disposition、各L5詳細契約からL8 case、各L6 functionからL7 unit oracleへのedge、edge先の定義域内実在を検査する。各sourceの`CoverageDisposition`は`mapped`/`partial`では設計edgeを、`partial`/`not_exercised`では理由・既存`owner_ref`・operational ownerの特定状況・return pathを明示する。設計edgeがある契約を、fixtureが未実行という理由で`not_exercised`へ変更しない。抽出機能等の設計scope外項目は`source_scopeouts`に別記し、coverage edge/dispositionや実行状態と混同しない。`RL-D4`は`IV-RL-56`/`IV-RL-57`/`IV-RL-59`への`partial`設計edgeを持ち、code-graph extraction自体をsource scopeoutとして記録する。個々のedge先IDは一意に解決すること。過去sourceは`LegacyPin`として読み、current source relationにしない。full file digestとoptional line-span digestは独立fieldである。

manifestには固定corpusのexact contract IDを入れ、regexから全意味の被覆を推測しない。scanが確かめるのはIDとrelationの整合性だけである。L4に登録した`RL-V1`/`RL-K3`/`RL-T3`/`RL-D4`等のknown `partial`/`not_exercised` contractを、必要edgeの欠落やscope外`unsupported_items`と別型のnon-pass dispositionで保持する。D4 code-graph extractionの設計scopeoutも`source_scopeouts`に別保持する。L4の4件のscope外`unsupported_items`も別inventory fieldに保持し、すべてのdispositionとscopeoutが構造的に明示されていれば固定5-step successを妨げない。required ID/pin/edgeが欠落またはunsupportedなら`LC-DESIGN-001`はsuccessにならない。文面の等価性、非構造化意味の完全性、oracleの正しさは証明せず、unknownはnon-passとする。

## 5. receipt配置とGitHub transport

`write_receipt(path)`は信頼側supervisorだけが実行し、checker sandboxにはreceipt/parent directoryをmountしない。repository root配下のcanonical pathを拒み、`$XDG_CACHE_HOME/helix/local-ci/`またはprivate system-temp task directoryへ書く。一時sibling経由でatomic writeし、Git index/treeを変更しない。full evidenceは外部に保持する。compact receiptは出力本文と絶対pathを除き、check ID、status、exit code、stdout/stderr SHA-256を含める。

GitHub provider adapterのtriggerは`workflow_dispatch`だけである。inputはexact base/headとcompact receipt JSONで、JSONをenvironment経由で受け取り、shellへ展開せずdataとしてparseする。provider pinが`null`ならtrusted preflightが固定済み`/usr/bin/git`のname literal、`--version`、実binary bytes SHA-256だけを読む。target ref/source/status/diff Git operationは呼ばず、identity tupleを診断dataとして示す`Unobserved(not_run)`で終わり、`ProviderResult`を生成しない。pinがある場合はprovider roleだけを照合し、不一致は`Unknown(unsupported)`としてtarget/source/status/diffの前に止め、local Gitへのfallback/installをしない。target headをcheckoutし、tree/config/contract/manifest/checker refsをGit blobから再計算して照合する。receipt schema、planの固定5 required ID・selection basis・plan config digest・plan state、5 required execution IDの完全性、step stateとaggregate successの整合を検査する。selected required rowが`skipped`なら`Rejected(invalid_input)`で集約しない。local-only stepのstatus/output digestを再実行・再現しない。Actions側で実行する`LC-DIFF-001`だけ、receipt内の同じgate結果と比較し、同じtarget/config digest/fixed argv/Git policy/environmentを使う。binary version/bytes identityは各実行環境のrole別evidenceとして残し、providerのidentityをreceiptのlocal runtime identityと一致させない。`ProviderResult.provider_git_identity`は実測provider binaryを表しauthorityではない。role pin mapを含むshared config digestが変わった場合、旧receiptは`Unknown(conflict)`でありpositiveには使わない。`LC-SCF-001`/`LC-SCF-002`/`LC-GOV-001`/`LC-DESIGN-001`はlocal-onlyである。dispatch/receiptの欠落、不正形式、上限超過、stale、exact headに結び付かない状態はnon-observed/non-positiveとしparityを主張しない。secretを保存せず、branch protection/required checkを変更しない。

provider上限（inputs 25個、input payload 65,535文字）は2026-10-09参照の[workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatchinputs)と[manual run](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)に基づく。compact encodingはprovider上限を超えないようにするが、文字数上限を要求閾値にはしない。runには`workflow_dispatch`がdefault branchに存在する必要がある。

## 6. failureとauthority境界

required local checkは全件`success`を返す必要がある。stepの削除、diagnosticの抑制、stale receiptの代用では失敗を修復できない。localとActionsは別executionであり、同一base/head/configで選択した同一gate (`LC-DIFF-001`) だけを比較する。CI resultは承認、acceptance、merge admission、release、branch protection変更を付与しない。digest単独ではartifact authenticityを証明しないため、reviewerは外部receiptとsource-bound output digestを権限ではなくevidenceとして読む。

## 7. manifest契約の具体化理由

現行L4 common-kernelのK1-I1等とrepository-layoutのRL-D4等は箇条書き定義であり、heading/tableだけのselectorでは既存契約を読み取れなかった。dispositionはedge IDを参照する一方でedge型に識別子がなく、期待値locatorも文字列のままだった。この不足をbullet selector、明示展開表、edge identity、table outcome locatorで閉じる。L4本文・要求意味・coverageの採否は変えず、旧sourceの再利用・再導出の記録はL4/L5既存crosswalkを維持する。型と参照の構造検査の具体化であり、新しい承認手続きや意味被覆の主張を作らない。

再導出の確認範囲は旧 `helix-harness-requirements_v1.2.md:1446–1475`（L4固定asset `LEGACY-ASSET-BACB1FC117A09D20F273`）のlocal trace/doc-consistencyとmerge単位CI、および旧 `source-boundary-contracts.md:28–42`（`LEGACY-ASSET-0327D0DF98618D3066FD`、full SHA-256 `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a`）のmissing pairを黙認しない・literalでないedgeをunknownとして残す契約である。旧workflowやoracle実装は移さず、明示manifestの構造検査へ再導出した。child bytecode補足は現行 `scaffold/governance/tools/govcheck.py:73` の実際の起動argvが根拠であり、旧runtimeを起動した結果ではない。
