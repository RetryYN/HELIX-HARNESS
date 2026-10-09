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
| `D-LCI-02` | 6-step command plan/argv/継続/timeout | `CASE-L8-LCI-04`〜`-10`, `-41`, `-50`〜`-51`, `-67`, `-80`〜`-83` |
| `D-LCI-03` | 明示design manifest、ID/coverage関係、過去source pin、parent AC適用記録 | `CASE-L8-LCI-12`〜`-20`, `-53`〜`-54`, `-62`〜`-66`, `-68`〜`-73`, `-84`〜`-95`, `-113`〜`-117` |
| `D-LCI-04` | 外部canonical receipt/privacy/aggregate/key境界 | `CASE-L8-LCI-21`〜`-28`, `-42`〜`-46`, `-57`, `-60` |
| `D-LCI-05` | workflow_dispatch target/input/selected check parityとrole別Git identity | `CASE-L8-LCI-29`〜`-40`, `-55`, `-74`〜`-79` |
| `D-LCI-06` | 開発source L7 suite inventory/discovery/execution evidence | `CASE-L8-LCI-100`〜`-112`, `-118`〜`-130`, `-131`〜`-141` |

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
                        parent_ac_coverage: list[ParentAcCoverage],
                        source_scopeouts: list[SourceScopeout],
                        legacy_pins: list[LegacyPin],
                        unsupported_items: list[UnsupportedItem]}
ParentAcCoverage = {parent_ac_id: AC-OS-020-01|AC-OS-020-03,
                    state: not_exercised, reason: str}
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
               design_manifest_digest: Sha256, source_l7_inventory_digest: Sha256, commands: list[CommandSpec],
               state: success}
CheckExecution = {check_id: str, portable_executable_identity: {name: str, version: str, sha256: Sha256},
                  state: success|fail|denied|skipped|interrupted|stale, exit_code: int|null, argv: list[str], cwd_rel: ".",
                  started_at: str|null, finished_at: str|null,
                  reason?: timeout|cancelled,
                  timeout_seconds: 300, sandbox_profile_digest: Sha256|null,
                  stdout_sha256: Sha256|null, stderr_sha256: Sha256|null,
                  result_complete?: boolean, suite_evidence?: L7SuiteEvidence,
                  partial_diagnostic_sha256?: Sha256}
CiState = success|fail|denied|skipped|interrupted|stale
PartialRunDiagnosticArtifact = {schema_version: 1, artifact_kind: "partial_local_ci_diagnostic",
                                diagnostic: {classification, reason, detail}, target: CiTarget,
                                config_digest: Sha256, design_manifest_digest: Sha256,
                                source_l7_inventory_digest: Sha256,
                                completed_executions: list[CheckExecution]}
LocalCiReceipt = {schema_version: 1, target: CiTarget, contract_ref: SubjectRef,
                   config_digest: Sha256, design_manifest_digest: Sha256,
                   checker_refs: list[SubjectRef], runtime_identity: RuntimeIdentity, source_l7_inventory_digest: Sha256,
                   plan: LocalCiPlan, executions: list[CheckExecution], aggregate_state: CiState,
                   created_at: str}
ProviderResult = {check_id: "LC-DIFF-001", local_state: CiState,
                  provider_state: CiState, selected_check_parity: boolean,
                  provider_git_identity: GitExecutableIdentity, positive: boolean}
```

`LC-DESIGN-001`の固定current corpusはCommon Kernel L4/L5/L8/L9の4文書、repository-layout L4/L9の2文書、およびlocal-CIのL4–L9 6文書、計12文書である。各`DesignFile.expected_pair`は対文書のpathを指定する。Common Kernel L5はK1/K2/K3/K5/K4-G3の5箇所を`exact_heading` section locatorとして固定する。K4/G3は`## 8. K4/G3 義務評価API`を`start_heading`、`end_heading=null`（文書末尾まで）とする。K1/K2は`### 3.2 K1 API contract`（end `### 3.3 K2: reference and key records`）と`### 3.4 K2 API contract`（end `### 3.5 role-bound input alias binding`）、K3は`#### 6.1.3 K3 function/API contract`（end `#### 6.1.4 invariantからL5 functionへのtrace`）、K5は`#### 6.2.2 公開関数とprivate helper`（end `#### 6.2.3 不変条件の分解`）を指す。これらは文書locatorで、意味上のAPI IDではない。対応するL8のfixture rangesはK1/K2/K3/K5/K4-G3で独立させる。K2範囲は`## 5. K3–K10と未実施範囲`まで、K3は`### 5.1 K3 fixtures`から`#### 5.1.2 K3 reason mappingの未決`まで、K5は`### 5.2 K5 fixtures`から`## 6. K1/K2 unit範囲と登録oracleの境界`までである。case literalはfixed manifestの明示展開で全量列挙し、省略suffixを推測しない。第3列literal `evaluate / ObligationView構造` は既存Common Kernel L5のK4/G3 locator `## 8. K4/G3 義務評価API` へ完全一致で展開する文書locatorであり、新しいAPIまたはsourceを生成しない。各L8 rowの第2列L9 oracleと第3列L4 contract/invariantはtyped referenceのまま保持し、coverage sourceは`expected_pair`の対応L5 locatorに限る。K1/K2/K3/K5/K4-G3のlocator交差やL4/L9 referenceのsource昇格はUnknownである。各rangeのOutcomeRefは同じraw definition rowの期待cellを使い、K1/K2は第5列、K3は第6列、K5/K4-G3は第4列を固定する。#2738基準はsource 187件/edge 725件（既存185/561にK1/K2 locator2/fixture164を追加）である。K3/K5のlocator2件とfixture285件・edge285件、local-CI trace 38 edgeを加えたmain dc803dac baselineはsource 189件、definition 1,182件、reference 1,252件、edge 1,048件である。開発source suiteの既存41 trace edgeと今回の24 edge（計65）・追加参照を反映した候補はsource 192件、definition 1,250件、reference 1,296件、edge 1,113件である。さらにCommon Kernel K4/G3のL5 locator 1件とL8 fixture 73件（K4=51/G3=22）を追加したinventoryはsource 193件、definition 1,340件、reference 1,545件、edge 1,201件である。manifestと独立inventoryへ同期した実計数が一致するまでは構造成功に含めない。checker側はK1/K2=164、K3=194、K5=91、K4/G3=73（K4=51/G3=22）の独立固定inventoryをcomponent別に保持し、各literal expansion、row binding、edge、dispositionをそれぞれ照合する。同時削除で必須集合を縮めず、本文から実行合格や意味被覆を推論しない。

`suite_evidence`は`LC-STAGE1-L7-001`で起動後にcompleteなsuite identity/resultを通常回収できた場合に必須（success/fail双方）であり、他checkでは禁止する。状態別のschema条件は次のとおり。

| suite rowの状態 | 開始・終了・exit | `result_complete` / evidence参照 | receipt内の扱い |
|---|---|---|---|
| 未起動 (`denied` preflight、または先行step後の`stale`/`interrupted`/`denied`) | `started_at=null`, `finished_at=null`, `exit_code=null` | `false`、`suite_evidence`とpartial refは不在 | 固定6行の一行として保持。未開始理由を既存state/diagnosticで残す |
| 起動済み、complete結果を通常回収 (`success`またはsuite結果による`fail`) | 実測時刻・exitを保持 | `true`、compact summary必須 | compact summaryとfull external identity artifactを相互参照 |
| 起動済み、timeout/停止不能/途中終了でcomplete結果なし | 開始時刻と得られた終了情報を保持。exit不明ならnull | `false`、summary不在、`partial_diagnostic_sha256`必須 | 固定6行を保持し、得られた部分結果を外部diagnosticへ残す |

この条件はsandbox preflightで6行すべてが未起動`denied`となる場合、または実行途中のcancel/stale/停止不能で第6 suite行が未起動のまま残る場合にも適用する。current targetから第6 suite source refsが欠ける場合は異なる実行前境界であり、先行5件のpartial diagnosticを保持して外側`Unknown(missing_input)`を返し、suite rowもreceiptも作らない。validatorはstate・時刻・exit・evidence有無を照合し、未完了suiteにsummaryを捏造しない。

`IdRange`のstart headingは範囲開始を含み、end headingは範囲終了を含まない（nullは文書末尾）。range境界のheading literalは対象文書内で一意に解決する。Markdown headingは行頭の1〜6個の`#`と直後の空白で始まる構造行だけを指し、fenced code block内のheading状テキストはheadingとして読まない。table_columnのid_columnは1始まりの列番号、heading_id/bullet_id/exact_headingではnull。Common Kernel L8 K1/K2 rangeではcase definitionのid列を1列目（1始まり）として固定し、3列目（1始まり）のL5 API/L4 contract literalを上記のpair別referenceとして明示展開する。L9 oracle列は2列目、期待結果のoutcome cellは5列目である。L4/K1・K2、L9/IV-K1・K2 tokensはL4/L9の既存定義へ解決するtyped referenceであり、L5 source locatorとしては数えない。

`heading_id`は固定manifestの`literal_expansions`に列挙したheading literalだけを選び、そのliteralの`ids`を既存ID定義として展開する。literalは文書中のheading構造行全文とのexact一致であり、`literal`→`ids`の対応は明示する。例えばL6見出し``### `F-LCI-09a` — `load_design_manifest(snapshot) -> CiApiResult<DesignScopeManifest>` ``は、manifestにその全文literalと既存ID`F-LCI-09a`を明示した場合だけそのIDの定義となる。見出し内の文字列検索や見出し番号からIDを合成しない。`heading_id`で選ばれたliteralがrange内に無い場合、必要なheading literalまたはその展開entryがmanifestに無い場合、あるいは`ids`が空配列の場合は`Unknown(missing_input)`とする。対応表にないheadingは定義へ加えず、固定corpusで必要な既存IDを満たさない欠落として扱う。選択literalがrange内で複数回現れる場合、対応表で同一IDを重ねて定義する場合、または展開IDが他selectorの定義と衝突する場合は`Unknown(conflict)`とし、最初の出現や片方を選ばない。`heading_id`の展開先は既存IDに限り、manifestにない新しい識別子を作らない。

`bullet_id`は選択範囲内の行頭`- **<ID> <label>**`の先頭IDだけを定義として読む。箇条書き本文中の参照tokenを定義へ昇格しない。`exact_heading`は既存見出し全文のexact literalを構造locator keyとし、`definition_kind=section_locator`で通常のID定義と区別する。source_idはそのrangeのstart_heading全文と一致し、pathとrangeを併せて解決する。exact_headingはstart_headingだけを一つのsection locatorとして取り、範囲内の子見出しを追加定義にしない。各sectionのend_headingは固定manifestに次の同階層見出しの全文literalを明記し、最終sectionだけnullとする。実行時に「次の見出し」を推測しない。これはL4が検査対象とする機構sectionを指定するための参照であり、文書にない意味上のcontract IDを作らない。見出し番号だけやcode commentから合成IDを生成せず、見出し変更はmanifest更新なしに解決しない。range_idは同一file内で一意とし、`IdDefinition`/`IdReference`はpathとrange_idの組で定義域/参照域へ戻る。これらのselectorは固定manifestのcode constantであり、任意の自由本文を意味解析しない。各rangeの`literal_expansions`は明示したcell/heading/bulletのliteralからexact ID列への固定対応表で、heading_id以外で略記のないrangeは空配列とする。heading_idは略記の有無によらず選択する見出し全文と既存IDの対応を列挙する。suffixや範囲の省略記法を自由regexで推測しない。対応表にない略記は構造不足、展開後の重複IDは競合として扱う。各`edge_id`はmanifest全体で一意で、dispositionの`edge_ids`は同じsourceに属する実在edgeへ解決する。`outcome_ref`はverifier pathとIDがedge先と一致し、指定rangeのdefinition tableのid列セルで同じ展開IDを持つraw rowへ一意に戻り、その行の1始まりoutcome columnの非空cellを指す。expanded IDが複数行へ結び付く、case列展開とrow bindingが異なる、またはIDが`expected_pair`外の文書に属する場合は`Unknown(conflict)`、ID/row/outcome cellが欠ける場合は`Unknown(missing_input)`である。Common Kernel L8のoutcome columnは5で、同じraw rowから展開された複数fixtureは同じ期待結果cellを共有してよいが、各ID→row結合は個別に一意である。列番号だけで文面の意味の正しさを認定しない。

`CiState`は既存の六値だけを取り、receiptの`aggregate_state`にも`Unknown`等を入れない。一般fold語彙に`skipped`があることと、このlocal schemaでrequired rowをskip可能なことは別であり、required `skipped`はfold前に拒否する。入力不足・非対応・未観測・stale・不正形式はK1/K2の既存外側結果型`Observed<T>`内のclassまたは`Rejected`として診断付きで返し、successに数えない。これらとcheck実行状態を混同しない。`LocalCiPlan.state=success`は開発repo用固定6件の計画作成だけを意味し、generic OS-020 profile/義務選択やexecution結果を意味しない。planは`selection_basis`、選択集合、plan用`config_digest`、manifest digestを保持し、`LocalCiReceipt.executions`の各実行stateやaggregateとは別fieldである。required selected checkの`skipped`はこのlocal contractでは許可しないschema-invalid値で、receipt validatorは`Rejected(invalid_input)`を返す。`CheckExecution.state=skipped`は既存語彙に残るが、この6件のselected-required receipt rowには使えない。receipt validatorはaggregation前に整合を検証する。受信receiptに`LC-DESIGN-001` executionがsuccessと記録されている場合、validatorはreceiptの`design_manifest_digest`で固定targetのmanifest bytesを解決し、manifest validatorの独立した構造検査結果を照合する。これはreceipt fieldではなく検証時に導出する結果であり、その結果が`structure_complete=false`なら`Rejected(invalid_input)`とする。これを`Unknown`やaggregate `fail`へ写さず、架空のreceipt fieldを要求しない。

`LocalCiReceipt.executions`は6つのrequired check IDを固定順に各一度保持する。欠落・重複・順序違い、または一つでもsuccess以外のexecutionがあればaggregate successを作らない。receipt直下の`config_digest`は`plan.config_digest`と完全一致する。`CheckExecution.reason`は中断理由のoptional fieldであり、`state=interrupted`では`timeout|cancelled`のいずれかを必須とし、それ以外のstateでは省略する。

supervisor外からrun全体への中止要求を受け、起動中process treeの停止・reapを確認できた場合は、未開始の残りstepを`state=interrupted, reason=cancelled, started_at=null, finished_at=null, exit_code=null`で列挙する。開始済みprocessの停止・reapを確認できない場合は未開始stepを`denied`とし、後続を起動しない。timeout後の`interrupted(reason=timeout)`は別条件であり、process treeの停止・reap確認を要する。sandbox preflight失敗時は各required executionを`denied`で記録する。receipt構成前、targetまたは必須source refが欠けてK2 keyを作れない場合は外側`Rejected(missing_key)`、key構成後のsource read failureは`Unknown(unreadable)`、bytesを読んだ後のID/edge欠落はsnapshot/planの構造preflightで検出し、run全体の外側`Unknown(missing_input)`として返す。この時点ではcheckerを一つも起動せず、execution行もreceiptも作らない。重複定義等の構造競合も同じpreflight境界で外側`Unknown(conflict)`とする。構造preflightが成立した後に実際の`LC-DESIGN-001` checkerが非zeroを返す場合は、他checkerと同じexecution `fail`で6行receiptを作り、外側Unknownへ置換しない。aggregateは実行された各stepの状態を固定優先順`stale > interrupted > denied > fail > skipped > success`で畳み、全6件が`success`の場合だけ`success`とする。all required selected stepsの`skipped`はinvalid receiptなので集約しない。全step stateと診断は個別executionに残す。 実行前のtarget/clean/checker不一致は外側`Stale`でreceiptを作らない。途中の再照合で変化を検出し未開始stepがある場合はL4 §2.3どおり後続を起動せず、未開始stepを`state=stale, started_at=null, finished_at=null, exit_code=null`として6行receiptへ保持し、既存foldで集約する。全step終了後の最終再照合で変化を検出し未開始stepがない場合は、run全体を既存外側`Stale`として返し、`LocalCiReceipt`を発行しない。既実行stepのevidenceはreceiptとは別の診断artifactへ保持する。全step successを残したままaggregateだけをstaleへ上書きせず、架空のstale execution行も作らない。

正準形式はUTF-8 JSON、key sort、不要な空白なし、NaN/Infinityなしとし、保存ファイルの末尾だけLFとする。`receipt_digest`は保存後の`sha256(canonical_bytes(receipt))`を別渡しし、`LocalCiReceipt`のfieldにしない。source/contract/checker参照は現行CKに従うK2 `SubjectRef`/`HeadInputRef`でrevision/digestを保持する。local receiptはrepo K5 logへのappendでない外部run artifactであり、それだけでK1/K2 acceptanceにならない。

## 3. 設定とcommand定義

`LocalCiConfig`はL4 §2.1と一致する6 command argvを持つversioned code constantである。6件すべて`required=true`かつ`local=true`とし、`LC-DIFF-001`だけ`merge_unit=true`、他5件は`false`とする。required集合と実行先配属は独立fieldであり、6件全てrequiredのままDIFFだけをmerge-unit verifierでも照合する。shell/command substitution/caller指定のexecutableやchecker pathを認めない。portable executable設定は既存local Git pinを`executables.git`に維持し、Actions用に`executables.provider_git: GitExecutableIdentity|null`を一つ追加する。`bwrap`は別の既存実行環境binaryとしてprofileへ{name, opaque version literal, exact bytes SHA-256}を束縛し、system packageやsemantic versionを仮定しない。`null`はprovider Git bytesをまだ採取していない状態であり、仮digestではない。`local`入口は`git`、provider入口は`provider_git`を内部で固定選択し、dispatch/receipt/callerからroleや実行pathを指定できない。両pin mapを含む固定versioned config bytesはlocal/providerで共通であり、`config_digest`はそのcanonical JSON bytes、6 command argv、固定selection rule、`DesignScopeManifest` version、300秒timeout、sandbox profile/監視設定をhashする。provider pinが`null`でもlocal runのplanはその設定値をdigestへ含めて作れるが、providerは照合済みpositiveを返せない。pinが後で加わるとshared config digestが変わるため、旧receiptは`Unknown(conflict)`となり、新configでのlocal runが必要である。local receiptの`runtime_identity`と`LC-DIFF-001` execution identityはlocal実行で実測したidentityだけを保持する。providerがpin済みbinaryを検証した後は、`ProviderResult.provider_git_identity`にproviderの実測identityを保持する。どちらもhost pathを含めない。checker identityはrepo-relative path、source Git `SubjectRef`、current SHA-256、interpreter identityを記録し、`govcheck.py`とtransitive child `gen_rulebook.py`を両方含む。実行前にreaderが`head_tree`との参照一致を確かめ、実行後にtarget/checker digestを再照合する。Python checkerはargvに`python3 -B`を固定し、`PYTHONDONTWRITEBYTECODE`による代替起動を認めない。それに加えてallowlisted environmentに`PYTHONDONTWRITEBYTECODE=1`を固定する。govcheckの現行child起動は`sys.executable gen_rulebook.py --check`で親argvの`-B`を転送しないため、親子双方へ固定envを渡しreadonly snapshotへpycacheを書かない。checkout変更はstaleである。

信頼済みhost-side `SourceSnapshotReader`はexact target Git treeから必要なblob bytesと最小Git objectだけを解決し、self-contained private snapshotへ出力する。private object setにはdeclared trees/blobs、merge-base/head commitおよび`git diff`/scfctlに必要な宣言済みbaseline ancestorsを含め、remote/credential helperのないprivate Git configを作る。sandboxへoriginal checkout、original `.git/`、`.git/config`、original object storeをmountしない。private snapshotと生成した最小Git objectsはread-onlyとし、runner backendはtrusted host-local settingで解決した提供環境の既存`bwrap`についてname、opaque `--version` literal、全binary bytes SHA-256をこの設計のprofileへpinし、一致した実体だけを許す。今回の環境ではCodex同梱`~/.local/bin/bwrap`が解決候補として確認されているが、pathは環境固有で記録せず、upstream provenance/真正性やsystem package由来は主張しない。これはregistered runner artifactとのclaimではない。`--unshare-all`, `--die-with-parent`, `--new-session`, read-only bind、`--tmpfs /tmp`, `--clearenv`を含む固定argvを使い、選択した既存binary/runtimeは必要範囲だけread-only、receiptと分離したprivate `/tmp`のみcheckerからwritableにする。receiptと親directoryはsandboxへmountせず、信頼側supervisorだけがcheckout外へatomic writeする。govcheckの`gen_rulebook.py --check`子processも同じsandbox・supervisor境界に置き、checker argvは`python3 -B`、親子の固定envは`PYTHONDONTWRITEBYTECODE=1`としてbytecode cacheを抑止する。network namespace、read-only mount、private scratchのいずれかをpreflightで確立できない場合、checker起動前に各stepを`denied`とし、host実行・別sandbox・installへfallbackしない。rootのhost probeでexisting binaryがnamespace startできた観測は設計実行合格ではなく、実行ごとのpreflightを省略しない。

supervisorは各process groupの起動/終了を監視する。300秒は短い30秒候補で誤中断を避け、長い600秒候補よりhang feedbackを早める折衷として選ぶAI技術候補であり要求値/SLOではない。TERM grace 5秒も即時KILLより正常終了を許し、長いgraceより待ち時間を抑える候補である。timeout到達時はTERMを送り5秒後に残存process groupをKILLし、govcheckの`gen_rulebook.py --check`子processを含む全processの停止・reap確認後`interrupted(reason=timeout)`を記録して後続stepを続ける。supervisor外からrun全体への中止要求時も起動中process treeの停止・reapを確認後に`interrupted(reason=cancelled)`とし、停止を確認できない場合は残りstepを開始せず`denied`にしてprocessをsuccessとして扱わない。

`LC-SCF-002`は`python3 -B scaffold/tools/scfctl.py stale`を実行し、全未retired bindingの上流revisionをread-onlyで照合する。scfctl既存契約ではstaleなしはexit 0、stale一件以上はexit 1となる。`validate`の正常終了からstale=0を推定しない。

`LC-DIFF-001`は`merge_base`と`head_commit`を受け取り、`--no-ext-diff --no-textconv`を固定する。commit diff全体を検査する。Gitが報告するwhitespace errorと追加行にあるconflict markerを対象とし、すべての競合markerの意味検出を主張しない。local CIは検査対象treeとsubmitted commitを一致させるためclean worktreeを要求し、untracked/staged変更はstaleとして止める。stage/package selectorでrequired checkを外せない。

## 4. source readerとdesign manifest

`resolve_target`は必須head/base ref自体が入力に無い場合だけ`Rejected(missing_key)`とする。入力済みOIDが存在するcommit objectへ解決できない場合は入力境界の`Rejected(invalid_input)`として返し、初期CLIでもref解決不能の非K1診断を残す。存在するcurrent target refでkey構成後のGit読取不能は`Unknown(unreadable)`であり、未解決OIDを架空refで埋めない。

`SourceSnapshotReader`とclean probeのhost-side Git plumbingは、固定argv/configを使い`GIT_CONFIG_NOSYSTEM=1`と`GIT_CONFIG_GLOBAL=/dev/null`でglobal/system Git configを無効化し、`-c core.fsmonitor=false`と`-c core.hooksPath=/dev/null`を固定する。Git公式[core.fsmonitor仕様](https://git-scm.com/docs/git-config#Documentation/git-config.txt-corefsmonitor)は、Git 2.35.1以前ではboolean値を認識せず`false`をhook pathnameとして起動する可能性を明記する（参照日2026-10-09）。その互換性境界に合わせ、reader用Gitの技術候補は2.35.2以降とする。host-local設定から解決した同一Git executableのbytes identityを取り、reader/source probe前に`git --version`だけを実行してversionとdigestを確認する。versionを安全にparseできない、2.35.2未満、または候補identity/digestと不一致なら`Unknown(unsupported)`を返し、status/source probe、checker、hookを起動しない。unsupported環境へinstallや別Gitへのfallbackはしない。diffを実行するcommandには`--no-ext-diff --no-textconv`を固定する。readerはallowlist外のhost環境変数（`GOVCHECK_ROOT`等を含む）を継承しない。任意hook/fsmonitor/external commandを起動しない。これらのGit argv/config/environment policyとreader Git version floorはversioned checker configurationへ含める。`SourceSnapshotReader`は宣言pathのbytesを`git ls-tree -r -z <head_tree>`と`git cat-file blob <blob_oid>`で解決する。current design documentに対するsymlink/non-blob入力は`Unknown(conflict)`としてsource preflightで拒み、check前にpath/digestを照合する。runtime codeから`docs/` filesystem pathを直接読まない。current-document manifestにはCommon Kernel L4/L5/L8/L9、repository-layout L4/L9の6文書と今回のOS local-CI pair文書6件を明示する。Common Kernel L5の5 locator（K1/K2/K3/K5/K4-G3）、対応するL8 fixture table expansion、L8のL9/L4 typed reference rangesはL4 §2.2とこの節のselector contractどおりに固定する。各identifierのdefinition rangeとreference rangeを分け、parserは任意token検索ではなく明示column/range grammarからIDを読む。

`verify_design_manifest`は定義一意性、各参照の一意な定義への解決、定義と参照の分離、各L4 invariant/repository-layout機構契約からL9 verifierへの明示mapped/partial edgeまたは明示not_exercised disposition、各L5詳細契約からL8 case、各L6 functionからL7 unit oracleへのedge、edge先の定義域内実在を検査する。各sourceの`CoverageDisposition`は`mapped`/`partial`では設計edgeを、`partial`/`not_exercised`では理由・既存`owner_ref`・operational ownerの特定状況・return pathを明示する。設計edgeがある契約を、fixtureが未実行という理由で`not_exercised`へ変更しない。抽出機能等の設計scope外項目は`source_scopeouts`に別記し、coverage edge/dispositionや実行状態と混同しない。`RL-D4`は`IV-RL-56`/`IV-RL-57`/`IV-RL-59`への`partial`設計edgeを持ち、code-graph extraction自体をsource scopeoutとして記録する。個々のedge先IDは一意に解決すること。過去sourceは`LegacyPin`として読み、current source relationにしない。full file digestとoptional line-span digestは独立fieldである。

`parent_ac_coverage`はL4 §1「親ACの適用範囲」が明示するOS親ACの適用記録であり、必須listとする。`AC-OS-020-01`と`AC-OS-020-03`を各一件だけ含め、各rowは`state=not_exercised`、空白以外の`reason`を持ち、ID・state・理由がL4の同表に記載された扱いと理由literalに一致する（理由文の意味推論はしない）。list全体または一方のrowが欠ける場合は`Unknown(missing_input)`、同じparent ACの重複またはL4記載との不一致は`Unknown(conflict)`、`pass`等への昇格・unknown field・型不正・空理由は`Rejected(invalid_input)`とする。一般必須field欠落の`Rejected(invalid_input)`規則に対するこのfieldの例外として、`parent_ac_coverage`自体の欠落も`Unknown(missing_input)`とする。`AC-OS-020-02`は境界fixtureで一部を照合するためこのlistへ含めず、HARNESS parent ACを追加しない。この親AC listは`coverage_dispositions`や`coverage_edges`の要素ではなく、そこへ混ぜたりgraph edgeへ変換したりしない。

manifestには固定corpusのexact contract IDを入れ、regexから全意味の被覆を推測しない。scanが確かめるのはIDとrelationの整合性だけである。L4に登録した`RL-V1`/`RL-K3`/`RL-T3`/`RL-D4`等のknown `partial`/`not_exercised` contractを、必要edgeの欠落やscope外`unsupported_items`と別型のnon-pass dispositionで保持する。D4 code-graph extractionの設計scopeoutも`source_scopeouts`に別保持する。L4の4件のscope外`unsupported_items`も別inventory fieldに保持し、すべてのdispositionとscopeoutが構造的に明示されていれば固定6-step successを妨げない。required ID/pin/edgeが欠落またはunsupportedなら`LC-DESIGN-001`はsuccessにならない。文面の等価性、非構造化意味の完全性、oracleの正しさは証明せず、unknownはnon-passとする。

## 5. receipt配置とGitHub transport

`write_receipt(path)`は信頼側supervisorだけが実行し、checker sandboxにはreceipt/parent directoryをmountしない。repository root配下のcanonical pathを拒み、呼出し元が明示したcheckout外のprivate pathへ書く。一時sibling経由でatomic writeし、Git index/treeを変更しない。full evidenceは外部に保持する。compact receiptは出力本文と絶対pathを除き、check ID、status、exit code、stdout/stderr SHA-256を含める。

GitHub provider adapterのtriggerは`workflow_dispatch`だけである。inputはexact base/headとcompact receipt JSONで、JSONをenvironment経由で受け取り、shellへ展開せずdataとしてparseする。provider pinが`null`ならtrusted preflightがprovider入口のtrusted固定設定が解決した既存Gitのname literal、`--version`、実binary bytes SHA-256だけを読む。target ref/source/status/diff Git operationは呼ばず、identity tupleを診断dataとして示す`Unobserved(not_run)`で終わり、`ProviderResult`を生成しない。pinがある場合はprovider roleだけを照合し、不一致は`Unknown(unsupported)`としてtarget/source/status/diffの前に止め、local Gitへのfallback/installをしない。target headをcheckoutし、tree/config/contract/manifest/checker refsをGit blobから再計算して照合する。receipt schema、planの固定6 required ID・selection basis・plan config digest・plan state、6 required execution IDの完全性、step stateとaggregate successの整合を検査する。selected required rowが`skipped`なら`Rejected(invalid_input)`で集約しない。local-only stepのstatus/output digestを再実行・再現しない。Actions側で実行する`LC-DIFF-001`だけ、receipt内の同じgate結果と比較し、同じtarget/config digest/fixed argv/Git policy/environmentを使う。binary version/bytes identityは各実行環境のrole別evidenceとして残し、providerのidentityをreceiptのlocal runtime identityと一致させない。`ProviderResult.provider_git_identity`は実測provider binaryを表しauthorityではない。role pin mapを含むshared config digestが変わった場合、旧receiptは`Unknown(conflict)`でありpositiveには使わない。`LC-SCF-001`/`LC-SCF-002`/`LC-GOV-001`/`LC-DESIGN-001`/`LC-STAGE1-L7-001`はlocal-onlyである。dispatch/receiptの欠落、不正形式、上限超過、stale、exact headに結び付かない状態はnon-observed/non-positiveとしparityを主張しない。secretを保存せず、branch protection/required checkを変更しない。

provider上限（inputs 25個、input payload 65,535文字）は2026-10-09参照の[workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatchinputs)と[manual run](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)に基づく。compact encodingはprovider上限を超えないようにするが、文字数上限を要求閾値にはしない。runには`workflow_dispatch`がdefault branchに存在する必要がある。

## 6. failureとauthority境界

required local checkは全件`success`を返す必要がある。stepの削除、diagnosticの抑制、stale receiptの代用では失敗を修復できない。localとActionsは別executionであり、同一base/head/configで選択した同一gate (`LC-DIFF-001`) だけを比較する。CI resultは承認、acceptance、merge admission、release、branch protection変更を付与しない。digest単独ではartifact authenticityを証明しないため、reviewerは外部receiptとsource-bound output digestを権限ではなくevidenceとして読む。

## 7. manifest契約の具体化理由

現行L4 common-kernelのK1-I1等とrepository-layoutのRL-D4等は箇条書き定義であり、heading/tableだけのselectorでは既存契約を読み取れなかった。dispositionはedge IDを参照する一方でedge型に識別子がなく、期待値locatorも文字列のままだった。この不足をbullet selector、明示展開表、edge identity、table outcome locatorで閉じる。さらにL4 §1が既に求めるOS親AC別の未検証記録をmanifestへ保持する型がなかったため、`parent_ac_coverage`を独立必須fieldとして追加する。L4本文・要求意味・coverageの採否は変えず、旧sourceの再利用・再導出の記録はL4/L5既存crosswalkを維持する。型と参照の構造検査の具体化であり、新しい承認手続きや意味被覆の主張を作らない。

再導出の確認範囲は旧 `helix-harness-requirements_v1.2.md:1446–1475`（L4固定asset `LEGACY-ASSET-BACB1FC117A09D20F273`）のlocal trace/doc-consistencyとmerge単位CI、および旧 `source-boundary-contracts.md:28–42`（`LEGACY-ASSET-0327D0DF98618D3066FD`、full SHA-256 `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a`）のmissing pairを黙認しない・literalでないedgeをunknownとして残す契約である。旧workflowやoracle実装は移さず、明示manifestの構造検査へ再導出した。child bytecode補足は現行 `scaffold/governance/tools/govcheck.py:73` の実際の起動argvが根拠であり、旧runtimeを起動した結果ではない。

`parent_ac_coverage`の保持点は旧asset `LEGACY-ASSET-BACB1FC117A09D20F273`（`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.2.md:1446–1475`、full SHA-256 `41b38c068e91a767f964ce5ce5d7d5568c1984b3b122b808f9eff61e5a0af401`）のlocal trace/doc-consistencyであり、L4が宣言する各親ACの適用範囲をmanifestにも別記する。旧asset `LEGACY-ASSET-0327D0DF98618D3066FD`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:28–42`、full SHA-256 `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a`）のmissing pairを黙認せずunknownへ残す保持点に沿い、親AC欠落もcoverage graphの空edgeで表さずmissing入力にする。変更はL4に存在する二つのOS-020 parent applicabilityを固定listで照合する技術表現に限り、新しい親・承認・coverage edgeは作らない。

Common Kernel L8 K1表の第3列で同じ`同上`が異なるL4 invariantを指したため、7行の省略を各々の直前明示API/contractと同じliteralへ展開した。fixture ID、他列、入力・期待値・親を変えず、既存のexact literal expansionで参照を一意にする。checkerに前行推測やunionによる参照補完を追加しない。これはD-LCI-03の既存構造契約の具体化であり、新しい要求、schema field、oracle、承認gateではない。


## 8. 開発source L7 suiteのdetail contract

LC-STAGE1-L7-001の入力は、pack宣言/登録台帳とは独立したSourceL7SuiteInventoryである。inventoryにはsuite ID、親・依存trace、L6/L7文書refs、formal IDとdiscovery identityの対応、実装/test refs、runner/toolchain profileを固定する。親・依存関係は対象L6/L7設計の宣言範囲に限って記録し、別revisionや登録済みpackから補わない。runner profileは既存Common Kernel候補に合わせたCPython 3.11+と標準ライブラリに固定し、runner/toolchain identityもtarget/source refsへ束縛する。`FormalL7CallableMapping={formal_l7_id, module_path, callable_qualname, coverage_kind, unittest_identity}`は実行可能な495行で、formal ID集合とmapping digestをdiscovery集合とは別に照合する。coverage kindは`primary_callable`、`owner_or_fixture_stub`、`partial_callable`を区別する。さらに`FormalL7NotExercisedDisposition={formal_l7_id, disposition}`の10行をcallable/unittest identityなしで同じformal ID closureに含める。K1/K2は165、K3は194、K5は91、K6は55である。全体は505 formal IDs（495 mapping rowsと10 disposition）、441 primary/52 stub/2 partial callableであり、10 not-exercisedはK6の2 partial_designと8 owner_unconnectedに限る。K6 mappingは43 primary/2 partial callableの45行で、7非formal regression identitiesはdiscoveryへ含めるがformal mappingへ数えない。K5の67 primaryは公開API直呼び41、private helper直呼び24、K2 lookup依存2から成り、直接のK5挙動は65件である。K5の24 stubは既存のsentinel/未写像/owner未接続21件とUT-046/085/086を含み、同mappingから未被覆条件の充足を主張しない。K3 UT-189/190も既存stub分類のまま保持する。
Current Core suite inventoryは9つのcode/test refsと2つのtarget内L6/L7 document refsを持つ。追加の4機構source refs/docsは§8.1の別partitionに固定する。従来7 refsは`common_kernel.py` SHA-256 `ce9c7a87cd318c2ff5d12f68c71129f6ad99f0b78616f89c501ccdd2c4643178`、`permission.py` `6a2f3b0d82dd38b03a4b27b2f98ed58217286eb9912c6a984a6a5549ac6c9f8b`、`journal.py` `78dba87db2b55cb349ed8fbc5d0483cdb933a8cce4d45e910c5f9cbcaefeb907`、`test_k1.py` `da847ab19a9c3fa0df17c360bc489c9da2470f53d3ee6487ea0e822905e561ff`、`test_k2.py` `3b1a6ede6642292ef31e458ca519bc293917da5e4654f85eda9ccf4a350d1582`、`test_k3.py` `1dd8ff995c40e428e6952f607731f3215c3a44785a8b4f0b0ff6c7c340a2c62a`、`test_k5.py` `c7d3dcedec9e63a1beb364147036135ae966c4330241f236f9842686e9134574`のままで、K6は`verification.py` SHA-256 `173c885b4b2400cf7479d7cabeabd14b65bfc8b2a025b6256d6463c52f5f958c`と`test_k6.py` `3d6e6a873cdc80ac7ba7810a5b94d6b104e2d54b8523a8e01da0c80cf6fdda86`を加える。495-row callable mapping SHA-256は`7473135901595324b2b6a42ac59b4af877398e5e1471950da54969b60059ea9c`。K6 callable mappingは45行（43 primary/2 partial）、SHA-256 `12e75e7a54064d6f1bc9d5a7fbd2225b9bec4b04c6fa18a643e81ca035c194fd`。10 dispositionのSHA-256は`886884b4168945fd2d510f6ed787e46160821ebbb0292a6f82941434a8ef4e7d`。K1/K2 165行の既存SHA `ca5c7a91e666a13062e6cd22a2bf157f54dad0ce7aa79f3815b70e19c7d11f19`と199 identities SHA `2203c7ba4c3064940792d0cd19b8e0e5e6b0123ed0f5ad302472213b1be3c874`は同じprefixのまま、K3 194行とK5 91行も固定値のまま保持する。
Expected discovery setは586件、sorted-ID SHA-256 `aca81abd7dd60c29512431c2d8223fd509d4c7a3a3fd7f1fc70847658ba0042d`。K5の115 discovery identitiesのSHA-256は`fd8edf4364fe9eac9e707ffe18852f249ea3f82e26ffe8780343c15672e25715`、K6の52 identities SHA-256は`52e558bc65de379093d9a3fa46ce7d59909f23a33a15e6a135d1fcf09cd4c857`。suite IDは`common-kernel-k1-k2-k3-k5-k6`。Core固定inventory digestは`950dc37c36bdc9ac65a497ee09f07e1ee81c3444fa205491cd228a8c3bdc03b5`であり、従来のmapping、formal ID closure/dispositions、9 Core source refs、586 Core expected identitiesを含む。pack declaration、ModelNumberDeclared、VersionRegistered、usable stateを型に含めず、inventoryをdirectory scanから作らない。旧baseline 162/196、359/419およびK5時点534は履歴比較値でありcurrent期待値に流用しない。L6/L7 document refsはtargetから都度実読し、そのrevision/digestをsuite evidenceへ束縛する。
SuiteSourceRefは既存SubjectRefの`{kind:"source", identity:path, revision:target.head_commit, digest:"sha256:"+bytes_sha256}`で保持し、target head treeは同artifact/summaryの`target.head_tree`へ結ぶ。Git readerはtree entryのblob OIDからbytesを解決するが、blob OIDをreceiptの別fieldには複製しない。全implementation/test/runner refsをtarget treeから解決する。cbce baseline SHAはL4 §2.1のsource history/crosswalkにある設計根拠であり、current targetの欠落を補う入力ではない。candidate source/testが対象treeに存在しない場合、suite resolverは既存Unknown(missing_input)を返しprocessを起動しない。exact source refsが同一targetにある場合はpack registration statusに関係なくsuiteを実行できる。

L7SuiteIdentityArtifactはschema/kind、suite ID、target、Core/product/helper source refs、Core 495 callable mappingのdigestとrows、Core 586およびsupplemental 27のinventory/discovery subdigest、`partition_evidence.core`/`.product_supplemental`/`.mechanism_helper`それぞれの`discovered_count`/`discovered_ids_sha256`/`executed_count`/`executed_ids_sha256`、合成716件のdiscovered/executed ID arraysとsorted-ID digest、test/failure/error/skip/expected-failure/unexpected-success countsおよび各結果ID arrays、exit code、stateを持つfull external evidenceである。`mechanism_l7_source_trace`は`formal_locators`、`nfr_reuse_indexes`、`oracle_index_rows`、`source_status_cells`、`owner_return_cells`、`owner_boundary_cells`、`status_not_declared`、`owner_return_not_declared`、`source_context_sections`を別配列で持つ。traceのID集合はformal locator 496件、LABO reuse index 5件、LABO NFR oracle index 5件、status cell 529件、owner-return cell 278件、owner boundary 357件として固定する。source contextは11 sectionの完全なbyte spanを対象source ref、見出し、1始まりの行locator、byte count、span SHA-256で保持し、section本文bytes自体はsource refから再取得する。これらのtrace参照はfull artifactだけに保持し、実行IDやcompact summaryへ展開しない。Core mapping/dispositionは従前どおりであり、補助IDsにmapping rowsを作らない。artifact digestは保存されたcanonical UTF-8 JSON+LF bytesのSHA-256とし、receipt body digest（canonical body、LFなし）と区別する。artifactは`$XDG_CACHE_HOME/helix/local-ci/artifacts/`または`tempfile.gettempdir()/helix-local-ci-artifacts-<uid>/`配下へcheckout外保存し、root directory 0700、artifact 0600、atomic/no-overwriteとする。既存rootがsymlink、他owner、またはprivate mode不適合なら拒否し、無関係な既存directoryをchmodしない。同じdigestの既存artifactはno-followでowner/mode/regular-fileを再検証してexact bytes一致時だけ再利用し、異なるbytesはconflictとする。IDsは実runnerからunittest.TestCase.id()として取得し、artifact bytesとtarget/source refsを照合する。現在mainにあるrunnerはCore586＋製品補助27の613 identityまでであり、helper103を含む716は本追補の設計候補である。10 not-exercised dispositionsはsource_l7_inventory_digestで固定し、実行mappingやtest結果へ含めない。旧baselineで観測した196は履歴上のdiscovery countであり、505 formal-ID closure数やPython test method定義数とも別である。current expected discoveryは586件（sorted-ID SHA-256 `aca81abd7dd60c29512431c2d8223fd509d4c7a3a3fd7f1fc70847658ba0042d`）で固定する。

`L7SuiteEvidence`はcompact summaryであり、suite ID、保存artifact SHA-256/byte count、合成discovered/executed countとdigest、Core formal mapping digest、target/source refs、failure/error/skip/expected-failure/unexpected-success counts、ならびに`partition_evidence`を持つ。`partition_evidence`は`core`、`product_supplemental`、`mechanism_helper`の固定3 keyだけを持ち、各値は`discovered_count`、`discovered_ids_sha256`、`executed_count`、`executed_ids_sha256`の4 fieldである。full ID arraysとraw source traceはcompactへ複製しない。実際の`CheckExecution.state`とexit codeは同rowに保持し、compact summaryへ重複させない。full identity arraysを`LocalCiReceipt`や65,535文字上限のdispatch inputへ複製しない。`CheckExecution.suite_evidence`は`LC-STAGE1-L7-001`の`result_complete=true`に限り保持し、incomplete rowは`result_complete=false`および起動済みなら`partial_diagnostic_sha256`で部分artifactを指す。other five rowsではsuite専用fieldを省略する。dispatch側はcompact summaryのschema・target/source/config refs・digest/count/outcome consistencyだけを照合し、full artifactを再取得せず、実IDsやL7実行を再証明しない。artifactが作成側で得られない場合はlocal positive receiptを出さない。LocalCiPlan/LocalCiReceiptの`source_l7_inventory_digest`は閉じた複合SourceL7SuiteInventoryのbytes digestとし、その中の17個の固定test-module alias/path inventory、Core fixed inventory digest `950dc...03b5`、formal mapping、固定source hashesを束縛する。機構別formal/status/owner/context traceはfull artifact内の独立配列で保持し、inventory digestへ混ぜない。Core fixed inventory digestは別の保護されたcomponent digestとして照合する。

固定runner argvは`python3 -B scaffold/local-ci/source_l7_runner.py --suite stage1-l7-source`とする。runner設計はtarget snapshot内の明示されたsuite inventoryだけをloadし、Core、L5 §8.1の製品補助、§8.2の機構helper partitionを個別に照合する。Core discovery setは586 identities、製品補助setは27 identities、機構helper setは候補103 identitiesとして各別digestを持ち、同じtarget内の候補unionを716件として導出する。三partitionのexpected IDsが一意かつ相互disjointであることを検査してから、登録済みsourceの各identityを一度ずつ実行する。formal mappingは既存Coreの495行のみで、補助test identityをformal mappingへ加えない。runner自身とtoolchain identityもtarget/config refsへ固定し、shell/glob/任意plugin discoveryを介さない。CPython 3.11+と標準ライブラリの技術候補はこのlocal suite runnerに限り、製品runtimeを定めない。

6-check固定集合はplan/receiptの必要構造である。source suiteが未登録packであることだけではexecutionを止めない一方、現対象treeからrequired source/testを読めない場合の非肯定は維持する。レビュー対象base `5bc41c69904e33e90b3c3036643972eaeab7ee03`のruntimeが対象とするのはCore586と製品補助27（613）であり、このidentity集合は`eeb6ae7`から不変である。suite成功の設計条件はCore 586、製品補助27、機構helper103の三partitionを別々に照合し、候補716件全件を同一targetで各一度実行した結果である。機構helper103はruntime未登録の設計候補であり、現行runtimeの実行成功を意味しない。機構のformal locator、元status、owner returnは実行対象外のsource traceであり、formal L7 mappingやcoverage edgeにはしない。その他のStage 1機構のstateは変えず、Stage 1全体L7 coverage、各L8/L9 oracle、OS-020/HARNESS適合を意味しない。

runner outcomeの5組は`failure_count/failed_ids`、`error_count/error_ids`、`skip_count/skipped_ids`、`expected_failure_count/expected_failure_ids`、`unexpected_success_count/unexpected_success_ids`である。全組のcountとunique ID集合を照合し、ID配列はfull artifactだけに保持する。expected failureもこの固定suiteでは許容せず、5 countのいずれかが非zeroならstep failとする。runner exitが非zeroなのに5組すべて空なら結果の矛盾としてcomplete evidenceを発行しない。XDG未設定時のartifact rootは上記のuid別固定pathであり、保存先を失う一時directoryを毎回作らない。source準備が`Unknown(missing_input)`または`Unknown(conflict)`で停止した場合は、両方とも先行5件の外部partial diagnosticを保持し、suite行とreceiptを作らない。formal ID照合は現行CK L7に明記されたplaceholder値の明示展開だけを許し、任意文字列regexからIDを合成しない。

### 8.1 4機構の製品補助test partition

`LC-STAGE1-L7-001`は同一checkのまま、既存Common Kernel suiteを不変の`core_partition`とし、§8.1の製品補助testを`product_supplemental_partition`、§8.2の機構helperを`mechanism_helper_partition`として分ける。呼出しは`python3 -B scaffold/local-ci/source_l7_runner.py --suite stage1-l7-source`とし、`check_id`は引き続き`LC-STAGE1-L7-001`、固定6 step、local-only、`merge_unit=false`である。`common-kernel-k1-k2-k3-k5-k6`はCore partitionの歴史的識別子として保持する。suite successは当該design candidateの三partition全件が同一targetから実行され、全結果が揃う場合に限る。機構helper103はruntime未登録の設計候補なので、この設計条件を現行runtimeの実行成功とは扱わない。新しいcheck、L7 requirement、formal mapping, owner registration, product acceptanceを作らない。

Core側の固定値は変更しない。`formal_id_closure={505}`, `FormalL7CallableMapping=495`, `FormalL7NotExercisedDisposition=10`, Core discovery identities `586`とその既存digestは従来どおり別に検証する。§8.1の製品補助expected setは27 identitiesで独自のsorted-ID SHA-256 `e5d71feabe981041144583fb0ee0f4754dd76d881e08fb44b48e5bf25d0b8239`を持つ。Core 586件とのdisjoint union 613件のsorted-ID SHA-256は`739e4f7078047a1bd19eb3c77a723d9a85809cd82193c383d04bb365b4bce5de`であり、§8.1までの歴史的prefix digestとして保持する。三partitionのcandidate unionは§8.2で別digestにより束縛する。§8.1の二partition prefix（Core 586＋製品補助27）について、完全なtarget treeに両required partitionがあるときだけ、composite discoveryは613 identitiesとなる。これは§8.2で機構helper partitionを加える716 identitiesの三partition候補とは別のprefix値である。composite digestを算出してもCore 586 digestを置換しない。10件のK6 dispositionはCore側に限り、機構別の原statusをK6語彙へ写さない。

```text
MechanismFormalLocator = {
  mechanism: BRAIN|LABO|HARNESS|INFRA,
  formal_id: SourceL7FormalId,
  source_l7_ref: SuiteSourceRef,
  source_row_locator: SourceCellRef,
  l8_refs: list[SourceCellRef],
  l9_refs: list[SourceCellRef]
}
MechanismOriginalNonexecutionStatus = {
  formal_locator_ref: MechanismFormalLocatorRef,
  status_cell_ref: SourceCellRef,
  raw_status_literal: str
}
MechanismOwnerReturnTrace = {
  formal_locator_ref: MechanismFormalLocatorRef,
  owner_return_ref: DeclaredOwnerReturnRef | NotDeclaredBySource
}
SupplementalTestId = one of the 27 IDs in the fixed table below
SupplementalTestIdentity = {
  supplemental_id: SupplementalTestId,
  mechanism: BRAIN|LABO|HARNESS|INFRA,
  source_ref: SuiteSourceRef,
  test_source_ref: SuiteSourceRef,
  module_key: fixed alias,
  callable_qualname: str,
  unittest_identity: fixed module_key + class + method
}
MechanismSupplementalPartition = {
  mechanism_l6_refs: list[SuiteSourceRef],
  mechanism_l7_refs: list[SuiteSourceRef],
  formal_locators: list[MechanismFormalLocator],
  original_nonexecution_statuses: list[MechanismOriginalNonexecutionStatus],
  owner_return_traces: list[MechanismOwnerReturnTrace],
  supplemental_tests: list[SupplementalTestIdentity]
}
SourceL7SuiteInventory = {
  core_partition: existing fixed Core inventory,
  product_supplemental_partition: the existing four fixed product-supplemental inventories,
  mechanism_helper_partition: the fixed §8.2 helper candidate inventory
}
```

`MechanismFormalLocator`は各機構L7が定義する正式IDを、元L7行・対応L8/L9 locatorとともに記録する参照型で、`FormalL7CallableMapping`ではない。`MechanismOriginalNonexecutionStatus`はL7がpartial/hold/not-exercised等の非実行状態を記すformal rowだけを対象に、raw status cellとliteralを保持する。`MechanismOwnerReturnTrace`はowner返却locatorを明記した場合はそのcellを、明記しない場合は`NotDeclaredBySource`を保持する。両traceはformal locatorとは別の閉じたsource-reference typeであり、status語彙を正規化したりK6 dispositionへ変換したりしない。owner return locatorの不在を接続・合格へ読み替えない。formal identityとsupplemental identityの間にedgeや暗黙対応を置かない。

機構別formal locator sourceは次表の固定L7 bytes/rangeで閉じる。対象範囲に現れるsource-specific formal ID、元status、owner return referenceはL7原文から行単位で読み、そのsource ref digestへ束縛する。別機構のID、後続機構、repository scanで集合を広げない。

| 機構 | L6/L7 source bytes | formal locator範囲と個数 | 原status・owner returnの保存箇所 | 非formal index/setupの扱い |
|---|---|---|---|---|
| BRAIN | L6 `31e32f042f896dce387376cce7134690b32d1d77d92e1f8319ba5edce5587930`、L7 `e45e5d320cb975c2c4cf3072a439b98d7da8d45f8ce2c43c562427bfefc9178e` | L7 §2の104 `UT-BRAIN-*` locator rows | L7 §2のassertion/status cellと§6–§7の局所hold・未実行・返却境界。各status/owner locatorを原文参照で保持 | L7 NFR locatorも元種別を保つ。既存holdを補助testへ昇格しない |
| LABO | L6 `2e50852c9abeacb5096fb3ccd0050d4209bb8fd4788a66e819fb6bb5fce1cb2d`、L7 `1e7e31010138b1e40799d8dbaa3bd3a2b357fb2c6fd5eb1853ece6326632815a` | L7 §3の83 functional/status/scope `LABO-UT-*` locator rows | L7 §3の状態列、§5の返却/未被覆区分。各rowに記録された原statusとowner locatorを保持 | §3の5 `nfr_reuse_index` rowsは別参照indexであり、formal test identityでも実行identityでもない |
| HARNESS | L6 `7aff92b54a51bc0997fb23ec2591f76b3ba55a9b13d12259368eec45f69691dd`、L7 `10b307fdd290e3506975acf8156640c9a7d8b613cb50f4912ccd44407a6f5aa2` | L7 §3の269 `UT-HARNESS-*` formal rows | L7 §3の対応行、§5のscope外/未実施区分。status・owner return locatorは各L7原文へ戻す | §4の既存10 `UT-HARNESS-SUP-*` locator設計はL7にある別設計参照。5 local unittestへ正式結合しない |
| INFRA | L6 `0e6f25978dd67e7cb09c7c6097def7be93e8851ac75476c4fa591ecb87b25564`、L7 `ae28caf95df4ede573f3e83dd53bc25401cf08e60351cad9d2157f11f613a0b0` | L7 §3–§4の40 functional/NFR `INFRA-L7-*` oracle rows | L7 §5の248 fixture対応と§9.1の各fixture別実装status/hold/return text。正式IDへstatusを推定せずL7 row referencesを保持 | §6の5 `INFRA-L7-SETUP-*`はL9 oracle由来formal IDではなく、source/test locator setup候補のためformal closure外 |

補助test inventoryは次の27件のみを許す。`module_key`は各fileを一度だけロードする固定runner aliasであり、`unittest_identity`はそのalias・class・methodの連結で照合する。`formal_id`、`coverage_kind`、`L8/L9` pass edgeはsupplemental rowに存在しない。

| supplemental ID | mechanism | source/test ref | module key / callable qualname |
|---|---|---|---|
| `SUP-BRAIN-001` | BRAIN | `helix/helix-brain/units/stage1-brain/src/brain.py` / `helix/helix-brain/units/stage1-brain/tests/test_brain.py` | `l7_sup_brain_test_brain` / `BrainProjectionTests.test_trace_source_projects_each_declared_field_and_keeps_owner_roles` |
| `SUP-BRAIN-002` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainProjectionTests.test_trace_source_preserves_k1_variants_without_reclassifying_other_fields` |
| `SUP-BRAIN-003` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainProjectionTests.test_trace_source_keeps_owner_observations_in_their_own_fields` |
| `SUP-BRAIN-004` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_returns_exact_k2_lookup_value` |
| `SUP-BRAIN-005` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_preserves_k2_no_match` |
| `SUP-BRAIN-006` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_preserves_saved_unknown_observation` |
| `SUP-BRAIN-007` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_keeps_nested_version_unknown_in_record_value` |
| `SUP-BRAIN-008` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_keeps_nested_state_unknown_in_record_value` |
| `SUP-BRAIN-009` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_keeps_each_declared_state_payload` |
| `SUP-BRAIN-010` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_preserves_prior_value_as_k2_stale` |
| `SUP-BRAIN-011` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_preserves_prior_nonvalue_as_k2_unobserved` |
| `SUP-BRAIN-012` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_preserves_same_key_content_conflict` |
| `SUP-BRAIN-013` | BRAIN | same | `l7_sup_brain_test_brain` / `BrainKnowledgeLookupTests.test_read_knowledge_does_not_mutate_restored_records` |
| `SUP-LABO-001` | LABO | `helix/helix-labo/units/stage1-labo/src/projection.py` / `helix/helix-labo/units/stage1-labo/tests/test_projection.py` | `l7_sup_labo_test_projection` / `PrivateProjectionTests.test_all_twenty_fields_are_retained_without_value_interpretation` |
| `SUP-LABO-002` | LABO | same | `l7_sup_labo_test_projection` / `PrivateProjectionTests.test_each_single_missing_field_is_local_and_does_not_mutate_input` |
| `SUP-LABO-003` | LABO | same | `l7_sup_labo_test_projection` / `PrivateProjectionTests.test_all_seven_declared_status_values_are_preserved_separately` |
| `SUP-LABO-004` | LABO | same | `l7_sup_labo_test_projection` / `PrivateProjectionTests.test_episode_candidate_shape_retains_refs_and_relation_only` |
| `SUP-HARNESS-001` | HARNESS | `helix/helix-harness/units/harness-stage1/src/stage1_pack.py` / `helix/helix-harness/units/harness-stage1/tests/test_stage1_pack.py` | `l7_sup_harness_test_stage1_pack` / `PrivatePackComparisonTests.test_exact_ref_baseline_is_match_and_retains_all_refs` |
| `SUP-HARNESS-002` | HARNESS | same | `l7_sup_harness_test_stage1_pack` / `PrivatePackComparisonTests.test_single_revision_mutation_is_domain_mismatch` |
| `SUP-HARNESS-003` | HARNESS | same | `l7_sup_harness_test_stage1_pack` / `PrivatePackComparisonTests.test_explicit_fields_keep_order_and_detect_one_mutation` |
| `SUP-HARNESS-004` | HARNESS | same | `l7_sup_harness_test_stage1_pack` / `PrivatePackComparisonTests.test_explicit_missing_and_multiple_states_are_not_inferred` |
| `SUP-HARNESS-005` | HARNESS | same | `l7_sup_harness_test_stage1_pack` / `PrivatePackComparisonTests.test_existing_owner_nonvalue_is_returned_by_identity` |
| `SUP-INFRA-001` | INFRA | `helix/helix-infrastructure/units/infrastructure-stage1/src/infrastructure.py` / `helix/helix-infrastructure/units/infrastructure-stage1/tests/test_infrastructure.py` | `l7_sup_infra_test_infrastructure` / `TestImplementedProjections.test_resource_projection_subset_preserves_baseline_and_unreadable_mutation` |
| `SUP-INFRA-002` | INFRA | same | `l7_sup_infra_test_infrastructure` / `TestImplementedProjections.test_resource_projection_subset_preserves_unseen_declared_role` |
| `SUP-INFRA-003` | INFRA | same | `l7_sup_infra_test_infrastructure` / `TestImplementedProjections.test_axis_pair_retains_values_and_unknown_without_comparison_class` |
| `SUP-INFRA-004` | INFRA | same | `l7_sup_infra_test_infrastructure` / `TestImplementedProjections.test_path_storage_projection_treats_owner_keys_as_opaque` |
| `SUP-INFRA-005` | INFRA | same | `l7_sup_infra_test_infrastructure` / `TestImplementedProjections.test_nfr_helper_counts_supplied_states_and_keeps_missing_denominator` |

固定補助source/test bytesのSHA-256は次のとおり。L6/L7 document refsと実装/test refsは別roleで保持し、path存在・directory scanから集合を増やさない。

| mechanism | L6 SHA-256 | L7 SHA-256 | implementation source SHA-256 | test source SHA-256 |
|---|---|---|---|---|
| BRAIN | `31e32f042f896dce387376cce7134690b32d1d77d92e1f8319ba5edce5587930` | `e45e5d320cb975c2c4cf3072a439b98d7da8d45f8ce2c43c562427bfefc9178e` | `b2b856c3073d7a51e594362de3eaff9af7b76b6e9af6633fd214d2f3e8a05cce` | `18ebfeaedc496c37adc0f000f472e8eb00b83f774cc05504be5259feb177a42f` |
| LABO | `2e50852c9abeacb5096fb3ccd0050d4209bb8fd4788a66e819fb6bb5fce1cb2d` | `1e7e31010138b1e40799d8dbaa3bd3a2b357fb2c6fd5eb1853ece6326632815a` | `5c61fe620c35eeb2786b740ccd37086e0e81bdf797a95cbf9588c585537ab60a` | `a60abe0042543a6bceedbff4f284356dc2d2c347343ba6469423e1dd26b9613c` |
| HARNESS | `7aff92b54a51bc0997fb23ec2591f76b3ba55a9b13d12259368eec45f69691dd` | `10b307fdd290e3506975acf8156640c9a7d8b613cb50f4912ccd44407a6f5aa2` | `2a6db3be14fe2d094a3947c36b4e911708d0ec95c6bcd59bec4ffd338e088c5d` | `4ea1ee6a0056fba259298ce935f981dcfbef0dc00c296971b25cbc2806138d88` |
| INFRA | `0e6f25978dd67e7cb09c7c6097def7be93e8851ac75476c4fa591ecb87b25564` | `ae28caf95df4ede573f3e83dd53bc25401cf08e60351cad9d2157f11f613a0b0` | `7bd177a70a01edd1adb439df290ef0c7d7d37940bff2072532eee28bd8ac7ffd` | `e24e83f6dedf47202962687a9e00c70a85f9328e2587838a9ef349242e5add21` |

ID集合は上表のSupplementalTestId 27件（BRAIN 13、LABO 4、HARNESS 5、INFRA 5）だけで閉じる。current main `691ab36b9832c585fb77373899533165733b443b` 時点で存在するSECURITYの10件、CONNECTの4件、Common Kernel K4/G3の14件はこのsource-suite inventoryへ登録しない。これらは今回のsupplemental set、Core inventory、formal mappingのいずれにも含めず、directory/test scanから追加しない。機構L7の新規locator、隣接test file、test method scan結果も自動で取り込まない。missing source/refは既存pre-spawn `Unknown(missing_input)`境界、digest mismatchは既存`Unknown(conflict)`/Stale境界へ戻し、部分集合へ縮退して実行・positive artifactを作らない。27 identitiesはformal mappingに含まれないため、495 mapping、505 closure、K6の10 disposition、Core 586 expected identities/digestは不変である。full external artifactはCore/Supplementalを別array・別digestで保持し、compact summaryも両partitionのcount/digestを別fieldで示す。formal locator・原non-execution status・owner-return refsは各source-reference typeを保ち、full external artifactの独立trace配列に格納する。これらのtraceはcomposite inventory digestに含めず、実行結果へstatusやownerを投影しない。

### 8.2 機構helper identity partition（候補）

このpartitionはCore 586および製品補助27とは独立した固定103 unittest identity集合であり、formal L7 ID、mapping、coverage edge、owner接続、pack登録、製品受入へ昇格しない。機構helperの候補対象はK4/G3 14、SECURITY 10、CONNECT 4、K7/G5 5、K9 17、K10 18、K8 29、INFRA resource projection 6である。sorted-LF identity digestは`017eaa7ad0ed602e16d4c0a11678337d0100b55b97bcc17ecba93a3ef72ce39a`。Core/product/helper候補unionは716 identities、digest `a673e0343f8f2b91f78bc1c13785b5d2d44f7efb6c8dbdbf65cd4af5ae34cad4`。既存Core 586 digest、product27 digest、formal mapping/disposition digestは別々に維持する。

`MechanismHelperIdentity`は固定metadataの技術候補であり、formal IDではない。module aliasは固定runner key、callableはtarget内test class/method identityであり、directory scanや動的test discoveryから増やさない。Core 9 + product27 8 + helper 16 = 33 code/test refsを一意にpinし、unique L6/L7 document pathは14件（Core 2、product27 8、helperで増えるSECURITY/CONNECT 4。Common KernelとINFRA refsは既存pathを共有）である。SCF-B-0158の既存upstream fieldでsource bytesをpinし、存在しないinventory digest fieldは追加しない。

| family | implementation / test | implementation SHA-256 | test SHA-256 | paired L6 / L7 refs |
|---|---|---|---|---|
| K4/G3 (14) | `helix/helix-harness/units/common-kernel/src/_k4_g3.py` / `helix/helix-harness/units/common-kernel/tests/test_k4_g3_private_helpers.py` | `693b8a22b92f57f9a3427e8550f5cf039258e902c5a6fb2020b46926a7b08a8a` | `13b502cc5de90df3a16c53225ef40e4243a28a704bd04e9a9d769f768bf8bf1a` | Common Kernel L6/L7 |
| SECURITY (10) | `helix/helix-security/units/stage1-security/src/projection.py` / `helix/helix-security/units/stage1-security/tests/test_projection.py` | `250f7318c73f2e3133aa60f77643fba983dfad9bec262a62065c4cc11811d799` | `45797b347d6edde5a87c6525bc30d5cf5cf21faae145a5ca5ddfe4581e12f8d1` | SECURITY L6/L7 |
| CONNECT (4) | `helix/helix-connect/units/connect-stage1/src/connection_contract.py` / `helix/helix-connect/units/connect-stage1/tests/test_connection_contract.py` | `e98e09c1eaa2b20c17891dfa0c2c1d1fb7510eeef3d53880847cfd02c3dcbd72` | `19f9efdba21ca5965f78a30ae43ed08e29adccfb98d673fe96a150bbb119a04e` | CONNECT L6/L7 |
| K7/G5 (5) | `helix/helix-harness/units/common-kernel/src/_k7_g5_private.py` / `helix/helix-harness/units/common-kernel/tests/test_k7_g5_private.py` | `e13bff0ec554ab8a244949e3f318c86c00e88556ca9286fca51bd409c9b5917c` | `32aebb1851310f7938dd5cbf056f0041f5caafd26a2db8b1737fe5fb6f200ff9` | Common Kernel L6/L7 |
| K9 (17) | `helix/helix-harness/units/common-kernel/src/_k9_private.py` / `helix/helix-harness/units/common-kernel/tests/test_k9_private.py` | `0dfa4865ce839727aa77bcd96d638b850bc91cb484b0c6e4d32539d947157be2` | `4250bf09434833b5e317a513f7ccd70ab3e4d6a9aabf6d551f1845be2c802415` | Common Kernel L6/L7 |
| K10 (18) | `helix/helix-harness/units/common-kernel/src/_k10_graph.py` / `helix/helix-harness/units/common-kernel/tests/test_k10_graph.py` | `fe48cb7f1ada152d96420c7264300f8533a68682e330e9c8578bc84d32250bfc` | `f58048ca009c390dcc33efa3e7202165fa48100dba52906114f85a1e5102414c` | Common Kernel L6/L7 |
| K8 (29) | `helix/helix-harness/units/common-kernel/src/_k8_label.py` / `helix/helix-harness/units/common-kernel/tests/test_k8_label.py` | `eb0cf6439172ede0164be6e68679eb500e3ae9445c34e5a01b0fce9c18f867ac` | `6804c46a277e6d57fa7682cdadd94ed52107e3089db7a61d318cca6bcd07b842` | Common Kernel L6/L7 |
| INFRA resource (6) | `helix/helix-infrastructure/units/infrastructure-stage1/src/_private_resource_projection.py` / `helix/helix-infrastructure/units/infrastructure-stage1/tests/test_resource_projection.py` | `f06c193f403cda7478e2195d36d1c0b7e97600bbef8a44565ced883a65c039bb` | `c57ef11a6c32d226880d7fc9e44de553cdd38410cacd3fd19812000deeebc768` | `docs/helix-infrastructure/L6-function-design/stage1-infrastructure.md` / `docs/helix-infrastructure/L7-unit-test-design/stage1-infrastructure-unit-test-design.md` |

helper familyのsource module解決も固定表を使う。LABOとSECURITYは`projection.py`という同じbasenameを持ち、対応testはそれぞれ`import projection as candidate`と`from projection import ...`をmodule load時に行う。候補loaderは各test moduleをloadする直前に、対応する固定source pathのmodule objectだけを`sys.modules["projection"]`へ一時bindingし、test moduleのglobalへ参照が束縛された後、module loadまたはtest executionが例外で終わる場合も含めて`finally`で以前の`projection` entryだけを正確に復元する。entryが元々なければ一時entryを削除し、無関係な`sys.modules`項目は変更しない。directory scanやbasenameからの自動選択も行わない。これはPython import cacheに対する技術候補であり、runtimeに未実装・未検証である。source/test bytes変更は既存digest照合で止める。

`SourceL7SuiteInventory`のpartition fieldは`core_partition`、`product_supplemental_partition`、`mechanism_helper_partition`の3固定keyを持つ候補形とする。一方、`L7SuiteIdentityArtifact.partition_evidence`は既存schemaどおり`core`、`product_supplemental`、`mechanism_helper`の3固定keyを持つ。両者は同じ三partitionを指すが、field名はそれぞれの閉じたschemaに従い、相互に別名置換しない。各artifact partitionについてdiscovered/executed countとsorted-ID digestを保持する。composite 716 count/digestは独立したunion値である。raw source traceはfull artifact内のsource referenceとして保持し、`source_l7_inventory_digest`へ含めない。formal mapping、Core 586 digest、product27 digestは既存値を置換しない。

| helper ID | fixed unittest identity |
|---|---|
| `SUP-CK-K4-G3-001` | `l7_sup_ck_test_k4_g3_private_helpers.DispositionCompletenessTests.test_deferred_requires_each_existing_field` |
| `SUP-CK-K4-G3-002` | `l7_sup_ck_test_k4_g3_private_helpers.DispositionCompletenessTests.test_not_applicable_requires_each_existing_field` |
| `SUP-CK-K4-G3-003` | `l7_sup_ck_test_k4_g3_private_helpers.HandoffDeltaTests.test_extra_completed_id_is_unregistered_delta` |
| `SUP-CK-K4-G3-004` | `l7_sup_ck_test_k4_g3_private_helpers.HandoffDeltaTests.test_matching_unfinished_and_digest_pairs` |
| `SUP-CK-K4-G3-005` | `l7_sup_ck_test_k4_g3_private_helpers.HandoffDeltaTests.test_missing_new_set_inherited_record` |
| `SUP-CK-K4-G3-006` | `l7_sup_ck_test_k4_g3_private_helpers.HandoffDeltaTests.test_missing_new_set_unfinished_id` |
| `SUP-CK-K4-G3-007` | `l7_sup_ck_test_k4_g3_private_helpers.HandoffDeltaTests.test_missing_old_set_inherited_record` |
| `SUP-CK-K4-G3-008` | `l7_sup_ck_test_k4_g3_private_helpers.HandoffDeltaTests.test_missing_old_set_unfinished_id` |
| `SUP-CK-K4-G3-009` | `l7_sup_ck_test_k4_g3_private_helpers.HandoffDeltaTests.test_new_set_record_digest_pair_mismatch` |
| `SUP-CK-K4-G3-010` | `l7_sup_ck_test_k4_g3_private_helpers.HandoffDeltaTests.test_old_set_record_digest_pair_mismatch` |
| `SUP-CK-K4-G3-011` | `l7_sup_ck_test_k4_g3_private_helpers.ObligationIdDeltaTests.test_empty_set_does_not_get_a_private_positive_result` |
| `SUP-CK-K4-G3-012` | `l7_sup_ck_test_k4_g3_private_helpers.ObligationIdDeltaTests.test_exact_set_has_no_delta` |
| `SUP-CK-K4-G3-013` | `l7_sup_ck_test_k4_g3_private_helpers.ObligationIdDeltaTests.test_missing_set_member_is_reported_without_fabricating_result` |
| `SUP-CK-K4-G3-014` | `l7_sup_ck_test_k4_g3_private_helpers.ObligationIdDeltaTests.test_unregistered_view_member_is_reported` |
| `SUP-SECURITY-001` | `l7_sup_security_test_projection.ExplicitReferenceComparisonTests.test_fixed_ref_all_fields_equal` |
| `SUP-SECURITY-002` | `l7_sup_security_test_projection.ExplicitReferenceComparisonTests.test_fixed_ref_digest_mismatch` |
| `SUP-SECURITY-003` | `l7_sup_security_test_projection.ExplicitReferenceComparisonTests.test_fixed_ref_locator_mismatch` |
| `SUP-SECURITY-004` | `l7_sup_security_test_projection.ExplicitReferenceComparisonTests.test_fixed_ref_store_mismatch` |
| `SUP-SECURITY-005` | `l7_sup_security_test_projection.ExplicitReferenceComparisonTests.test_subject_ref_all_fields_equal` |
| `SUP-SECURITY-006` | `l7_sup_security_test_projection.ExplicitReferenceComparisonTests.test_subject_ref_digest_mismatch` |
| `SUP-SECURITY-007` | `l7_sup_security_test_projection.ExplicitReferenceComparisonTests.test_subject_ref_identity_mismatch` |
| `SUP-SECURITY-008` | `l7_sup_security_test_projection.ExplicitReferenceComparisonTests.test_subject_ref_kind_mismatch` |
| `SUP-SECURITY-009` | `l7_sup_security_test_projection.ExplicitReferenceComparisonTests.test_subject_ref_revision_mismatch` |
| `SUP-SECURITY-010` | `l7_sup_security_test_projection.ProjectionPreservationTests.test_projection_preserves_existing_result_objects_and_all_slots` |
| `SUP-CONNECT-001` | `l7_sup_connect_test_connection_contract.ObservationSlotProjectionTests.test_all_existing_k1_nonvalues_remain_opaque_slots` |
| `SUP-CONNECT-002` | `l7_sup_connect_test_connection_contract.ObservationSlotProjectionTests.test_existing_unknown_mutation_is_retained_without_classification` |
| `SUP-CONNECT-003` | `l7_sup_connect_test_connection_contract.ObservationSlotProjectionTests.test_private_helper_rejects_malformed_python_rows` |
| `SUP-CONNECT-004` | `l7_sup_connect_test_connection_contract.ObservationSlotProjectionTests.test_synthetic_declaration_slots_keep_explicit_order_and_objects` |
| `SUP-CK-K7-G5-001` | `l7_sup_ck_test_k7_g5_private.K7G5PrivatePartialTests.test_ck_g5_ut_035_keeps_two_classes_for_one_identity` |
| `SUP-CK-K7-G5-002` | `l7_sup_ck_test_k7_g5_private.K7G5PrivatePartialTests.test_ck_g5_ut_036_single_missing_class_is_detected` |
| `SUP-CK-K7-G5-003` | `l7_sup_ck_test_k7_g5_private.K7G5PrivatePartialTests.test_ck_k7_ut_006_explicit_head_mismatch_is_only_a_bool` |
| `SUP-CK-K7-G5-004` | `l7_sup_ck_test_k7_g5_private.K7G5PrivatePartialTests.test_ck_k7_ut_033_target_identity_mismatch_is_only_a_bool` |
| `SUP-CK-K7-G5-005` | `l7_sup_ck_test_k7_g5_private.K7G5PrivatePartialTests.test_ck_k7_ut_035_composition_ref_mismatch_is_only_a_bool` |
| `SUP-CK-K9-001` | `l7_sup_ck_test_k9_private.K9PolarityDelegationTests.test_distinct_complete_nonempty_are_positive_through_existing_k1_fold` |
| `SUP-CK-K9-002` | `l7_sup_ck_test_k9_private.K9PolarityDelegationTests.test_empty_component_set_uses_k1_existing_missing_input_set_diagnostic` |
| `SUP-CK-K9-003` | `l7_sup_ck_test_k9_private.K9PolarityDelegationTests.test_nonaffirmative_facts_are_not_fabricated_as_negative_or_positive_values` |
| `SUP-CK-K9-004` | `l7_sup_ck_test_k9_private.K9PolarityDelegationTests.test_resolved_rule_version_is_bound_into_combined_polarity_refs` |
| `SUP-CK-K9-005` | `l7_sup_ck_test_k9_private.K9PolarityDelegationTests.test_same_is_negative_and_all_nonvalues_survive_the_existing_k1_fold` |
| `SUP-CK-K9-006` | `l7_sup_ck_test_k9_private.K9ShapeProjectionTests.test_private_shapes_preserve_l4_field_order_and_names` |
| `SUP-CK-K9-007` | `l7_sup_ck_test_k9_private.RoleBoundSourceAliasTests.test_exact_alias_duplicate_deduplicates_through_common_k2_helper` |
| `SUP-CK-K9-008` | `l7_sup_ck_test_k9_private.RoleBoundSourceAliasTests.test_exact_k9_alias_uses_raw_content_digest_and_context_fields` |
| `SUP-CK-K9-009` | `l7_sup_ck_test_k9_private.RoleBoundSourceAliasTests.test_nullable_source_is_not_replaced_with_a_fabricated_ref` |
| `SUP-CK-K9-010` | `l7_sup_ck_test_k9_private.RoleBoundSourceAliasTests.test_same_alias_identity_with_different_raw_revision_is_rejected_by_k2_helper` |
| `SUP-CK-K9-011` | `l7_sup_ck_test_k9_private.RoleBoundSourceAliasTests.test_same_raw_ref_on_creator_and_reviewer_sides_keeps_both_aliases` |
| `SUP-CK-K9-012` | `l7_sup_ck_test_k9_private.TargetAndAxisComparisonTests.test_all_six_review_target_fields_compare_in_fixed_order` |
| `SUP-CK-K9-013` | `l7_sup_ck_test_k9_private.TargetAndAxisComparisonTests.test_axis_comparison_retains_every_slot_and_axis_after_a_collision` |
| `SUP-CK-K9-014` | `l7_sup_ck_test_k9_private.TargetAndAxisComparisonTests.test_nonvalue_inventory_short_circuits_before_axis_comparison` |
| `SUP-CK-K9-015` | `l7_sup_ck_test_k9_private.TargetAndAxisComparisonTests.test_resolved_axis_requires_existing_key_and_unresolved_relation` |
| `SUP-CK-K9-016` | `l7_sup_ck_test_k9_private.TargetAndAxisComparisonTests.test_unresolved_axis_preserves_the_existing_nonvalue_and_does_not_compare` |
| `SUP-CK-K9-017` | `l7_sup_ck_test_k9_private.TargetAndAxisComparisonTests.test_value_inventory_allows_axis_comparison_to_proceed` |
| `SUP-CK-K10-001` | `l7_sup_ck_test_k10_graph.K10ConditionAndClosureTests.test_closure_fields_keep_effective_held_diagnostics_and_safety_separate` |
| `SUP-CK-K10-002` | `l7_sup_ck_test_k10_graph.K10ConditionAndClosureTests.test_each_depclass_variant_uses_its_own_condition_state` |
| `SUP-CK-K10-003` | `l7_sup_ck_test_k10_graph.K10ConditionAndClosureTests.test_false_reference_and_held_edges_do_not_expand_to_children` |
| `SUP-CK-K10-004` | `l7_sup_ck_test_k10_graph.K10ConditionAndClosureTests.test_missing_condition_entry_is_not_relabelled_as_unknown` |
| `SUP-CK-K10-005` | `l7_sup_ck_test_k10_graph.K10ConditionAndClosureTests.test_retired_edges_do_not_participate_in_closure` |
| `SUP-CK-K10-006` | `l7_sup_ck_test_k10_graph.K10ConditionAndClosureTests.test_transitive_property_single_field_change_controls_expansion` |
| `SUP-CK-K10-007` | `l7_sup_ck_test_k10_graph.K10ConditionAndClosureTests.test_transitive_true_expands_and_cycle_only_does_not_reject` |
| `SUP-CK-K10-008` | `l7_sup_ck_test_k10_graph.K10ConditionAndClosureTests.test_unknown_relation_on_reachable_walk_stays_unresolved` |
| `SUP-CK-K10-009` | `l7_sup_ck_test_k10_graph.K10ExistingShapeTests.test_scope_and_meaning_are_retained_without_normalization` |
| `SUP-CK-K10-010` | `l7_sup_ck_test_k10_graph.K10ExistingShapeTests.test_shape_fields_match_l4_and_graphdecl_identity_stays_outside_payload` |
| `SUP-CK-K10-011` | `l7_sup_ck_test_k10_graph.K10ImpactTests.test_candidate_path_cascade_is_reclassified_when_confirmed_path_reaches_node` |
| `SUP-CK-K10-012` | `l7_sup_ck_test_k10_graph.K10ImpactTests.test_confirmed_path_removes_node_from_candidate_only_possibly` |
| `SUP-CK-K10-013` | `l7_sup_ck_test_k10_graph.K10ImpactTests.test_propagation_candidate_and_held_fields_are_separate` |
| `SUP-CK-K10-014` | `l7_sup_ck_test_k10_graph.K10RelationComparisonTests.test_contradicts_pair_is_reported_without_a_k1_classification` |
| `SUP-CK-K10-015` | `l7_sup_ck_test_k10_graph.K10RelationComparisonTests.test_duplicate_relation_declaration_is_left_unresolved` |
| `SUP-CK-K10-016` | `l7_sup_ck_test_k10_graph.K10RelationComparisonTests.test_inverse_relation_uses_reverse_endpoints_and_declared_inverse_name` |
| `SUP-CK-K10-017` | `l7_sup_ck_test_k10_graph.K10RelationComparisonTests.test_symmetric_relation_requires_confirmed_reverse_edge` |
| `SUP-CK-K10-018` | `l7_sup_ck_test_k10_graph.K10RelationComparisonTests.test_unregistered_relation_and_resolved_endpoint_membership` |
| `SUP-CK-K8-001` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_case_binding_ref_excludes_result_pointers` |
| `SUP-CK-K8-002` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_closed_outcome_and_selector_inputs_reject_invalid_shapes` |
| `SUP-CK-K8-003` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_effect_event_and_binding_refs_missing_are_unknown` |
| `SUP-CK-K8-004` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_effect_none_is_confirmed_mismatch_before_unknown` |
| `SUP-CK-K8-005` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_fresh_selector_k3_denial_precedes_unknown` |
| `SUP-CK-K8-006` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_fresh_selector_precedence_mismatch_before_denial_and_unknown` |
| `SUP-CK-K8-007` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_k3_denial_precedes_k6_denial` |
| `SUP-CK-K8-008` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_k3_k6_unknowns_retain_every_component_candidate` |
| `SUP-CK-K8-009` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_k6_denial_precedes_unknown` |
| `SUP-CK-K8-010` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_label_transition_projection_does_not_erase_stale` |
| `SUP-CK-K8-011` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_mismatch_fields_use_closed_contract_order` |
| `SUP-CK-K8-012` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_missing_key_boundary_is_keyunavailable_only_when_selected` |
| `SUP-CK-K8-013` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_null_comparison_is_unknown_not_mismatch` |
| `SUP-CK-K8-014` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_observer_priority_maps_stale_and_notapplicable_exactly` |
| `SUP-CK-K8-015` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_observer_priority_retains_every_unknown_candidate` |
| `SUP-CK-K8-016` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_operation_version_is_ref_order_independent_and_revision_bound` |
| `SUP-CK-K8-017` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_polarity_mapping_is_versioned_by_resolved_api_ref` |
| `SUP-CK-K8-018` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_pure_effect_projection_keeps_none_and_nulls` |
| `SUP-CK-K8-019` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_pure_observed_label_preserves_nonvalue_and_untrusted` |
| `SUP-CK-K8-020` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_required_not_applicable_and_fresh_stale_map_to_missing_input` |
| `SUP-CK-K8-021` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_role_aliases_preserve_roles_and_exact_dedupe` |
| `SUP-CK-K8-022` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_role_bound_key_collision_rejects_before_k2_key_of` |
| `SUP-CK-K8-023` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_same_alias_any_different_ref_is_prekey_rejection` |
| `SUP-CK-K8-024` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_transition_validation_retains_components_and_assurance_by_identity` |
| `SUP-CK-K8-025` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_unknown_priority_and_all_candidate_retention` |
| `SUP-CK-K8-026` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_unobserved_priority_and_not_selected_boundary` |
| `SUP-CK-K8-027` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_untyped_dependency_object_is_not_treated_as_a_valid_result` |
| `SUP-CK-K8-028` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_valid_k1_disposition_is_not_a_nonvalue_candidate` |
| `SUP-CK-K8-029` | `l7_sup_ck_test_k8_label.K8PrivateProjectionTests.test_ck_k8_validated_positive_requires_all_existing_dependencies` |
| `SUP-INFRA-RESOURCE-001` | `l7_sup_infra_test_resource_projection.TestPrivateResourceProjection.test_six_source_qualified_fields_baseline_has_identity_and_fields_only` |
| `SUP-INFRA-RESOURCE-002` | `l7_sup_infra_test_resource_projection.TestPrivateResourceProjection.test_single_version_unknown_keeps_its_source_and_owner` |
| `SUP-INFRA-RESOURCE-003` | `l7_sup_infra_test_resource_projection.TestPrivateResourceProjection.test_unknown_unobserved_stale_and_not_applicable_are_retained` |
| `SUP-INFRA-RESOURCE-004` | `l7_sup_infra_test_resource_projection.TestPrivateResourceProjection.test_absent_mapping_field_is_not_filled_or_called_domain_absence` |
| `SUP-INFRA-RESOURCE-005` | `l7_sup_infra_test_resource_projection.TestPrivateResourceProjection.test_same_display_different_subject_refs_remain_distinct` |
| `SUP-INFRA-RESOURCE-006` | `l7_sup_infra_test_resource_projection.TestPrivateResourceProjection.test_projection_does_not_mutate_input_mapping_or_observations` |


この103行は候補source ASTから列挙したfixed alias表であり、実行済み・formal mapping・機構L7充足を意味しない。candidate test/source bytesがmainで確定した後、同一target tree上でpath/SHA/identity集合を再計算する。product27実行候補とhelper103候補の双方がmainとruntimeへ登録されるまで、合成716を実行済みと記録しない。
