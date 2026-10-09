---
title: "HELIX-OS Stage 1 local CI 単体検証設計"
status: design_pair_defined
owner: HELIX-OS
paired_l6: ../L6-function-design/local-ci-function-design.md
stage: 1
version_target: 1.0
---

# HELIX-OS Stage 1 local CI 単体検証設計

本書はL6 `local-ci-function-design.md`の単体関数を合成inputで検証するoracle設計である。unit test実装・実行、CI起動、合格を表さない。検証codeはfixture IDを参照し、設計本文をcopyしない（repository-layout RL-T2）。

固定入力は対のL6本文SHA-256 `3f09a698ae46818c766a6c28231aa52ba5e2d54cf5745d1293325bed8be0e7e9`と、その固定入力表のL4/L5/L8/L9である。

## 1. 原則

- すべてのfixtureは一時Git repository、synthetic blob、stub processであり、archive内sourceや実旧CLI/hook/runtime/test/CIを実行しない。
- 一ケース一変異。派生commit/tree/digest値はfixture側で再計算し、検査対象以外の条件を固定する。
- 前提条件不成立は既存K1の`Observed<T>`内classまたは`Rejected`として返し、独自result classを追加せず、例外をsuccessや既定値へ変換しない。
- 一つのL6 function IDに最低一つのL7 test IDを結び、coverage manifestが参照先IDと期待型を確認する。
- `F-LCI-04`/`F-LCI-06`の正常baselineはrequired set `LC-SCF-001` → `LC-SCF-002` → `LC-GOV-001` → `LC-DIFF-001` → `LC-DESIGN-001` → `LC-STAGE1-L7-001`の全件を順序どおり含む。個別stepの負例でも残りのrequired setを省略しない。
- generic `CiState`には`skipped`語彙があるが、local receiptの6 selected required rowsではschema validationでfold前に拒否する。

## 2. 関数と単体oracleの対応

| L6 function | 正常baseline oracle | 負例oracle | 正常baselineの期待 | 負例条件 |
|---|---|---|---|---|
| `F-LCI-01 resolve_target` | `UT-LCI-24` | `UT-LCI-01`, `UT-LCI-02`, `UT-LCI-50`, `UT-LCI-51`, `UT-LCI-82` | base/head/merge-base確定の`Observed<CiTarget>` | base ref欠落 / 別head / local Git unsupported / fixed argv不整合 |
| `F-LCI-02 read_fixed_snapshot` | `UT-LCI-25` | `UT-LCI-03`, `UT-LCI-04`, `UT-LCI-50`〜`UT-LCI-52`, `UT-LCI-62` | 宣言blob bytesとdigest一致の`Observed<SourceSnapshot>` | digest不一致 / symlink / Git unsupported / argv不整合 / declared path欠落 / blob読取失敗 |
| `F-LCI-03 check_clean_checkout` | `UT-LCI-26` | `UT-LCI-05`, `UT-LCI-06`, `UT-LCI-50`, `UT-LCI-51` | clean index/worktree/untrackedの`Observed<CiTarget>` | staged / untracked変更 / Git unsupported / fixed argv不整合 |
| `F-LCI-04 compile_plan` | `UT-LCI-27` | `UT-LCI-07`, `UT-LCI-08`, `UT-LCI-56`, `UT-LCI-63`〜`UT-LCI-64` | 固定6 step/argv/plan stateの`Observed<LocalCiPlan>` | 必須step欠落 / caller上書き / selection配属上書き / manifest schema不正 |
| `F-LCI-05 run_step` | `UT-LCI-28`, `UT-LCI-83` | `UT-LCI-09`〜`UT-LCI-11`, `UT-LCI-22`, `UT-LCI-40`〜`UT-LCI-45`, `UT-LCI-48`, `UT-LCI-53`, `UT-LCI-61`, `UT-LCI-84`〜`UT-LCI-86` | isolated snapshot上exit 0とstdout/stderr hashの`Observed<CheckExecution>` | nonzero / fixed argv拒否 / cancel/timeout / isolation boundary / reap失敗 / child bytecode抑止env欠落 |
| `F-LCI-06 run_local_ci` | `UT-LCI-29` | `UT-LCI-12`, `UT-LCI-13`, `UT-LCI-22`, `UT-LCI-39`, `UT-LCI-49`, `UT-LCI-53`, `UT-LCI-54`, `UT-LCI-57`〜`UT-LCI-60`, `UT-LCI-62`〜`UT-LCI-64` | 6 step successとsupervisor生成の外部receipt `Observed<LocalCiReceipt>` | 途中fail継続 / target drift / required skip / receipt境界 / cancel reap失敗 / manifest preflight / target ref境界 / manifest schema不正 |
| `F-LCI-07 verify_receipt` | `UT-LCI-30` | `UT-LCI-14`, `UT-LCI-15`, `UT-LCI-16`, `UT-LCI-38`, `UT-LCI-54`, `UT-LCI-55`, `UT-LCI-80` | current refsと一致するcanonical receiptの`Observed<ReceiptCheck>` | duplicate JSON keys / target stale / checker digest conflict / plan-execution混同 / manifest-result不整合 / base変更 / provider pin変更後の旧config digest |
| `F-LCI-08 run_merge_unit_verifier` | `UT-LCI-31`, `UT-LCI-76` | `UT-LCI-17`, `UT-LCI-18`, `UT-LCI-37`, `UT-LCI-77`〜`UT-LCI-81` | exact dispatchと同一selected diff照合の`Observed<ProviderResult>` | dispatch欠落 / write permission / target不一致 / identity未採取・不一致 / 旧config digest / state parity不一致 |
| `F-LCI-09a load_design_manifest` | `UT-LCI-32`, `UT-LCI-89` | `UT-LCI-19`, `UT-LCI-57`, `UT-LCI-63`〜`UT-LCI-64`, `UT-LCI-65`, `UT-LCI-69`〜`UT-LCI-75`, `UT-LCI-87`〜`UT-LCI-88`, `UT-LCI-90`〜`UT-LCI-91`, `UT-LCI-96`〜`UT-LCI-97`, `UT-LCI-99`, `UT-LCI-115`, `UT-LCI-119` | 12文書とK4/G3 locator追補後required source 193 IDを含む全manifest fieldが揃うmanifest | required source/parent AC欠落 / Common Kernel locator・fixture展開欠落 / run-level structural preflight / manifest schema不正 |
| `F-LCI-09b resolve_id_graph` | `UT-LCI-33` | `UT-LCI-23`, `UT-LCI-36`, `UT-LCI-58`, `UT-LCI-65`, `UT-LCI-69`〜`UT-LCI-75`, `UT-LCI-91`〜`UT-LCI-92`, `UT-LCI-94`〜`UT-LCI-95`, `UT-LCI-98`, `UT-LCI-116`〜`UT-LCI-117` | 12文書の一意なdefinitionと解決済みtyped reference/fixture-row graph | duplicate definition / unresolved reference / pair不整合 / expanded fixture row曖昧 |
| `F-LCI-09c verify_coverage_edges` | `UT-LCI-34` | `UT-LCI-20`, `UT-LCI-46`, `UT-LCI-47`, `UT-LCI-66`〜`UT-LCI-68`, `UT-LCI-92`〜`UT-LCI-95`, `UT-LCI-97`〜`UT-LCI-99`, `UT-LCI-118` | current inventoryのrequired 1,211 edge（K4/G3 design-oracle追加後）、mapped/partial sourceと理由付きnot_exercised sourceを持つmixed manifest | required edge/disposition欠落 / wrong pair / OutcomeRef row曖昧 |
| `F-LCI-09d verify_legacy_pins` | `UT-LCI-35` | `UT-LCI-21` | asset ID/path/full SHAとspan SHAを別々に計算 | span bytesとdigest不一致 |
| `F-LCI-10 run_source_l7_suite` | `UT-LCI-100` | `UT-LCI-101`〜`UT-LCI-113`, `UT-LCI-120`〜`UT-LCI-132`, `UT-LCI-133`〜`UT-LCI-143` | exact target source suiteのinventory-bound identitiesを持つfull external artifactとcompact summaryを束縛した`Observed<L7SuiteEvidence>` | K1/K2/K3/K5/K6 source欠落 / mapping/discovery不一致 / skip/fail / runner mismatch / target drift / bounded frame / receipt suite ID欠落 |

## 3. 単体oracle詳細

### `F-LCI-09a` — manifest読込oracle

`UT-LCI-32`を正常baselineとし、`UT-LCI-19`、`UT-LCI-57`、`UT-LCI-63`〜`UT-LCI-64`、`UT-LCI-65`、`UT-LCI-69`〜`UT-LCI-75`、`UT-LCI-87`〜`UT-LCI-88`, `UT-LCI-115`, `UT-LCI-119`でmanifestの必須source、parent AC applicability記録、run-level preflight、schema、unsupported dispositionを検査する。親ACはL5 `parent_ac_coverage`の専用listだけで検査し、coverage edge/disposition graphには混ぜない。

### `F-LCI-09b` — ID graph解決oracle

`UT-LCI-33`を正常baselineとし、`UT-LCI-23`、`UT-LCI-36`、`UT-LCI-58`、`UT-LCI-65`、`UT-LCI-69`〜`UT-LCI-75`, `UT-LCI-116`〜`UT-LCI-117`で重複定義と未解決参照を検査する。

### `F-LCI-09c` — coverage edge検証oracle

`UT-LCI-34`を正常baselineとし、`UT-LCI-20`、`UT-LCI-46`、`UT-LCI-47`、`UT-LCI-66`〜`UT-LCI-68`, `UT-LCI-118`でrequired edge、partial、not_exercised、scopeoutの分離を検査する。

### `F-LCI-09d` — 旧資産pin検証oracle

`UT-LCI-35`を正常baselineとし、`UT-LCI-21`でasset ID/path/full SHAとspan bytesの不一致を検査する。

### `F-LCI-01` / `F-LCI-06` — target一致とrun driftのoracle

`UT-LCI-02`は要求headとcheckout HEAD/treeの不一致を対象とし、既存K1外側`Stale`を返して`CiTarget` Valueを作らない。`UT-LCI-13`は全6 required step完了後の最終target/checker再照合だけでdriftを検出するcaseであり、外側K1 `Stale`、実行evidenceを診断artifactへ保持、`LocalCiReceipt`なし、aggregate foldなしを期待する。step完了前に検出するdriftは既存L4 run-level契約どおり、後続を止め、未開始stepをstale行としてreceiptに残してaggregateを`stale`へfoldする。

### 単体oracle一覧

| Test ID | 入力 | 一点の変異 | 期待する型付き結果 |
|---|---|---|---|
| `UT-LCI-01` | 合成base/head refが存在 | base refを削除 | `Rejected(missing_key)` |
| `UT-LCI-02` | 要求headとcheckout HEAD/treeが一致 | 存在する別headを要求 | 既存K1外側`Stale`、`CiTarget` Valueなし |
| `UT-LCI-03` | 宣言済みの通常Git blobが存在 | pathは維持してblob bytesを変更 | expected digest照合後`Unknown(conflict)` |
| `UT-LCI-04` | source pathは通常blob | tree entryをsymlink modeへ変更 | `Unknown(conflict)`、link先を辿らない |
| `UT-LCI-05` | clean index/worktree | add staged change | 外側K1 `Stale`、`CheckExecution.state`は生成しない |
| `UT-LCI-06` | clean tracked files | add one untracked file | 外側K1 `Stale`、`CheckExecution.state`は生成しない |
| `UT-LCI-07` | fixed planに6 IDが各一度ある | `LC-GOV-001`を削除 | `Unknown(missing_input)` |
| `UT-LCI-08` | argv specがL4/L5 constantと一致 | callerが別commandを渡す | `Rejected(invalid_input)`、上書き拒否 |
| `UT-LCI-09` | stub processはbytes outputでexit 0 | exit statusを1へ変更 | stateは`fail`、出力本文でなくSHAのみ保存 |
| `UT-LCI-10` | checker argvは固定`python3 -B`とL4/L5 constantに一致 | fixed argv一項へshell metacharacterを加える | spawn前`Rejected(invalid_input)`、shell/checkerを起動しない |
| `UT-LCI-11` | cancel要求なし、stub processが実行中で停止/reap可能 | supervisor外run全体cancel要求を一つ加える | process停止/reap確認後`state=interrupted, reason=cancelled`、exit 0を捏造しない |
| `UT-LCI-12` | 6 checkがpass | SCF validateをnonzeroにする | SCF `fail`、残り5 stepも実行しaggregate `fail` |
| `UT-LCI-13` | 全6 required step後のtarget/checker再照合が一致 | 最終再照合でhead treeを変える | 既存K1外側`Stale`、実行evidenceを診断artifactへ保持、`LocalCiReceipt`なし、aggregate foldなし |
| `UT-LCI-14` | keyを一意に持つcanonical JSON | `head_commit` keyを重複 | `Rejected(invalid_input)` |
| `UT-LCI-15` | receipt targetがcurrent targetと一致 | `head_tree`だけを変える | `Stale` |
| `UT-LCI-16` | receipt checker refsがcurrent refsと一致 | same targetのreceipt内govcheck digestだけを変更 | `Unknown(conflict)` |
| `UT-LCI-17` | dispatch inputとexact checkoutが存在 | compact receipt inputを削除 | `Unobserved(not_run)` |
| `UT-LCI-18` | permissionsはread-onlyでdiffだけ選択 | write scopeを加える | write前に`Rejected(invalid_input)` |
| `UT-LCI-19` | manifestに全12 corpus path/role/source-kindがあり、K1/K2/K3/K5/K4-G3 locatorと全expanded fixture IDを含む | required source rowを一つ削除 | `Unknown(missing_input)`、corpus不完全 |
| `UT-LCI-20` | mapped/partial sourceに既存verifierへの一意な明示edgeがある | mapped/partial sourceのrequired L4→L9 edgeを削除 | coverage `Unknown(missing_input)`。理由付き`not_exercised` sourceは空edge listのまま許容 |
| `UT-LCI-21` | asset ID/path/full digestと別計算のspan digest | 指定line span bytesと不一致のdigestに変える | `Unknown(conflict)` |
| `UT-LCI-22` | `LC-SCF-002`が`scfctl.py stale`をread-onlyで実行し、stale bindingなしでzeroを返す | stubがstale bindingを1件報告 | `run_step`のexecution `fail`、後続stepを継続して`run_local_ci` aggregateは`success`にならない |
| `UT-LCI-23` | definition IDが一意で全参照を解決できる | 一つのdefinition IDを重複 | `Unknown(conflict)`、定義を一つへ畳まない |
| `UT-LCI-24` | 合成base/head refとHEADが一致 | `resolve_target`専用正常baseline | `Observed<CiTarget>` |
| `UT-LCI-25` | 固定corpus pathは通常のGit blob | 正常baseline | `Observed<SourceSnapshot>` |
| `UT-LCI-26` | index/worktree/untrackedがclean | 正常baseline | `Observed<CiTarget>` |
| `UT-LCI-27` | 6 check IDとargvが固定順に存在 | 正常baseline | `Observed<LocalCiPlan>` |
| `UT-LCI-28` | stub processがexit 0、stdout/stderr bytesが存在 | 正常baseline | `Observed<CheckExecution{state:success}>`、本文でなくdigestを保持 |
| `UT-LCI-29` | 6 stepすべてexit 0、target/checker不変 | 正常baseline | `Observed<LocalCiReceipt{aggregate_state:success}>` |
| `UT-LCI-30` | exact target/current config/checker refsでcanonical receipt | 正常baseline | `Observed<ReceiptCheck>` |
| `UT-LCI-31` | workflow_dispatch、exact checkout、receipt一致、diff check exit 0 | 正常baseline | `Observed<ProviderResult>` |
| `UT-LCI-32` | fixed corpus path/role/pair/source-kindが揃う | `load_design_manifest`専用正常baseline | `Observed<DesignScopeManifest>` |
| `UT-LCI-33` | definitionsは一意、すべてのreferencesが解決 | `resolve_id_graph`専用正常baseline | `Observed<IdGraph>` |
| `UT-LCI-34` | mixed baseline: `RL-V1`/`RL-K3`は理由・owner・return path付き`not_exercised, edge_ids=[]`、他mapped/partial sourceはrequired edgeと一意destinationを持つ | `verify_coverage_edges`専用正常baseline | `Observed<CoverageReport>`、設計非検証dispositionはnon-passのまま保持 |
| `UT-LCI-35` | asset ID/path/full SHAとspan SHAが独立して一致 | `verify_legacy_pins`専用正常baseline | `Observed<PinReport>` |
| `UT-LCI-36` | definition IDが一意で全参照を解決できる | 一つのreferenceのdestination definitionを削除 | `Unknown(missing_input)`、unresolved referenceを保持 |
| `UT-LCI-37` | dispatch targetとcheckout current targetが一致 | checkout headだけ別の既存commitへ変更 | 外側K1 `Stale`、照合済みProviderResultを返さない |
| `UT-LCI-38` | plan state=`success`、execution state=`fail`で別field | plan stateだけをexecution `fail`へ変更 | `Rejected(invalid_input)`、plan enum違反をreceiptへ採用しない |
| `UT-LCI-39` | 6 selected required executionがsuccess | 一件のstateだけを`skipped`に変えreceipt schemaへ渡す | `Rejected(invalid_input)`、aggregate `skipped`を作らない |
| `UT-LCI-40` | exact target blobs/treesとrequired baseline ancestorsだけのprivate snapshot、read-only input、private scratch、専用の空のnetwork namespace（host network非共有）をpreflightで確認 | network namespaceだけを使えない環境にする | `denied`、checkerを起動しない |
| `UT-LCI-41` | self-contained snapshot/minimal objectsはread-only、original checkout/.gitはmountしない | private snapshot mountだけをwritableにする | `denied`、checkerを起動しない |
| `UT-LCI-42` | Python checker argvは設計固定の`python3 -B` | argvから`-B`だけを除く | `Rejected(invalid_input)` before spawn、readonly境界不成立とは推論しない |
| `UT-LCI-43` | checkerとgovcheck childはtimeout前に正常終了する | 300秒候補timeoutに到達し、親子process全て停止/reapされる | `interrupted(reason=timeout)`、未開始後続required stepを続行可能 |
| `UT-LCI-44` | timeout後に全processが停止/reapされる | `gen_rulebook.py --check` childだけが残存する | `denied`、残存確認中は後続stepを起動しない |
| `UT-LCI-45` | govcheck entrypointとtransitive `gen_rulebook.py` refsが一致 | child checker bytes digestだけを変える | 外側K1 `Stale`、govcheckを起動しない |
| `UT-LCI-46` | `RL-V1`/`RL-K3` not_exercised、`RL-D4`の`IV-RL-56`/`IV-RL-57`/`IV-RL-59` partial edge、別fieldのD4 code-graph extraction scopeout、`RL-T3` partial edgeを保持 | `RL-D4`の`IV-RL-57` edgeを削除する | `Unknown(missing_input)`、structural completeを主張しない |
| `UT-LCI-47` | `RL-T3`はclassifier edgeだけを`partial`、`RL-D4`は3件の既存設計edgeを`partial`とし抽出scopeoutを別fieldに保持、`RL-V1`/`RL-K3`は理由付きnot_exercised | `RL-T3`をpass dispositionに変更する | `Rejected(invalid_input)`、契約passへ昇格しない |
| `UT-LCI-48` | original checkout/`.git`/`.git/config`をsandboxにmountせず、private configにremote/credential helperがない | mount listへoriginal `.git/config`だけを加える | `denied`、checkerを起動しない |
| `UT-LCI-49` | checker sandboxにreceipt/parent directoryを見せず、信頼側supervisorだけがpipe結果から外部receiptを書く | receipt parent directoryだけをchecker sandboxへmountする | `denied`、checkerを起動しない |
| `UT-LCI-50` | fixed Git executable identityとGit 2.35.2+ versionが確認できる | 同一Gitのversionだけを2.35.1にする | version check後、他Git probe/checker起動前に`Unknown(unsupported)` |
| `UT-LCI-51` | fixed Git versionとidentity、global/system config無効、fsmonitor/hook無効のargv/config/env | fixed reader argvから`-c core.fsmonitor=false`だけを外す | Git probe前`Rejected(invalid_input)`、任意fsmonitor/hookを起動しない |
| `UT-LCI-52` | declared source ref/keyが構成済み、source pathはtarget treeに通常blobとしてある | pathをtreeから削除する | `Unknown(missing_input)`。必須key ref自体の欠落とは区別 |
| `UT-LCI-53` | supervisor外cancel要求に対しstub process treeは停止/reapを確認できる | 同じcancel要求後、stubが停止/reap確認を拒む | `denied`、未開始stepを起動せずsuccess扱いしない |
| `UT-LCI-54` | receiptの`design_manifest_digest`のmanifest検査結果がcomplete、`LC-DESIGN-001` executionはsuccess | receipt bodyは固定し独立検査結果をstructure incompleteへ変える | aggregation前`Rejected(invalid_input)`。架空receipt fieldを要求せず`Unknown`/aggregate failへ写さない |
| `UT-LCI-55` | formal保存済みValueとcurrent target descriptor revision/digestが完全一致 | head commit/treeを維持しbase_commitだけを別の存在するbaseへ変更し、merge_baseとL5のdescriptor revision/digestを再計算 | 既存K2 lookupの`Stale`、head同一を理由に同revision異digestのconflictへ誤分類しない |
| `UT-LCI-56` | all six `CommandSpec` rows required/local、DIFFだけmerge_unit=true | callerがSCF stale rowのrequiredだけfalseにする（localはtrueのまま） | `Rejected(invalid_input)`、required setまたは配属を上書きしない |
| `UT-LCI-57` | 他の5 required checkと全target/config refsは有効、manifestは完全 | 固定manifestの必須ID/edgeを一つ欠落させる | `run_local_ci`外側`Unknown(missing_input)`。checkerを一つも起動せず、`CheckExecution`行もreceiptも作らない |
| `UT-LCI-58` | 他の5 required checkと全target/config refsは有効、manifestのID/edgeは一意 | definition IDを重複させる | `run_local_ci`外側`Unknown(conflict)`。checkerを一つも起動せず、`CheckExecution`行もreceiptも作らない |
| `UT-LCI-59` | 必須target/source key ref fieldが全て入力済み | 必須key ref fieldそのものを一つ削除する | `Rejected(missing_key)`、Git checkerを起動せずexecution/receiptを作らない。値のある未解決OIDとは区別 |
| `UT-LCI-60` | 必須ref fieldは存在しOID形式も有効、他のsourceは読める | 入力済みOIDをcommit objectへ解決できない値へ変更する | `Rejected(invalid_input)`、OID解決probeで不成立を確認し、checkerを起動せずexecution/receiptを作らない |
| `UT-LCI-61` | fixed Python checker argvに`-B`があり、allowlisted envに`PYTHONDONTWRITEBYTECODE=1`がある | envから`PYTHONDONTWRITEBYTECODE`だけを除く | govcheck childが`-B`を継承しないためspawn前`Rejected(invalid_input)`、checker/childを起動しない |
| `UT-LCI-62` | target/source refsでkeyを構成済み、declared blobを通常tree entryとして解決できる | `git cat-file blob`相当のreaderをunreadableにする | `Unknown(unreadable)`。欠落OID field、未解決入力OID、target tree上のmissing pathとは区別 |
| `UT-LCI-63` | 全必須`DesignScopeManifest` fieldが既定型で存在し、固定target/source refsを構成済み | top-level `unsupported_items` fieldを一つ欠落させる | `Rejected(invalid_input)`、schema不成立としてchecker実行前に止め、execution/receiptを作らない |
| `UT-LCI-64` | 各`UnsupportedItem`は固定ID、reason、`disposition=non_pass`を持つ | 一件のdispositionだけを`pass`へ変える | `Rejected(invalid_input)`、未知のpass語彙を受け入れずchecker実行前に止める |
| `UT-LCI-65` | 宣言range内のbullet定義とrange外/本文参照は別 | range内定義だけ削除 | F09a/bの構造preflightは`Unknown(missing_input)`、参照から定義を補わない |
| `UT-LCI-66` | edge_id全体一意、同source dispositionへ結線済み | 一つのedge_idを重複 | F09cは`Unknown(conflict)`、checker/execution/receipt未作成 |
| `UT-LCI-67` | disposition.edge_idsが同source実在edgeへ解決 | 一つのedge参照だけを未登録IDへ変更 | F09cは`Unknown(missing_input)`、checker/execution/receipt未作成 |
| `UT-LCI-68` | typed OutcomeRefがverifier定義行の非空期待値cellへ解決 | outcome_columnだけを列数外へ変更 | F09cは`Unknown(missing_input)`、意味から期待値を補わない |
| `UT-LCI-69` | 略記literalにexact ID列の固定展開表がある | 対応表entry一つを削除 | F09a/bは`Unknown(missing_input)`、regexで展開を推測しない |
| `UT-LCI-70` | exact_headingのstart/end literalが一意、通常IDとsection_locatorを分離 | 文書側start見出しだけを変更 | F09a/bは`Unknown(missing_input)`、番号やcode commentから合成IDを生成しない |
| `UT-LCI-71` | heading_idの見出しliteralがrange内で一意、fenced code内の同文は対象外 | 通常heading行として同literal一行を追加 | F09a/bは`Unknown(conflict)`、最初の一行へ縮約しない |
| `UT-LCI-72` | heading_idの見出しliteralと展開entryが存在 | 見出し行だけを削除 | F09a/bは`Unknown(missing_input)`、fenced codeやrange外から補わない |
| `UT-LCI-73` | 見出しliteralから必須IDへの固定entryがある | entryだけを削除 | F09a/bは`Unknown(missing_input)`、見出し内tokenからIDを推測しない |
| `UT-LCI-74` | heading_idのentryは必須既存ID一件を展開 | idsだけを空配列へ変更 | F09a/bは`Unknown(missing_input)`、空集合を充足扱いしない |
| `UT-LCI-75` | 見出しliteralと展開先IDが一意 | 一つのIDを別entryのidsにも追加 | F09a/bは`Unknown(conflict)`、重複IDをdedupしない |
| `UT-LCI-76` | local `executables.git`とprovider `executables.provider_git`はそれぞれ合成binary identityと一致し、shared config/target/argv/policyは同じ | 正常baseline（変異なし） | local receiptにlocal実測identity、`ProviderResult`にprovider実測identityを記録し、同じselected DIFF stateを照合する。identity相互同一性を要求しない |
| `UT-LCI-77` | trusted provider configにexact `provider_git` pinがある | `provider_git`だけを`null`へ変える | provider入口のtrusted固定設定が解決した既存Gitのname/version/bytes SHAだけをpreflight採取し、`Unobserved(not_run)`。target/source/status/diff未実行、positive resultなし |
| `UT-LCI-78` | provider実行binary bytes SHAが`provider_git` pinと一致 | provider binary bytes SHAだけをpinと異ならせる | `Unknown(unsupported)` before target/source/status/diff probe。local pinを試さない |
| `UT-LCI-79` | provider name/version/bytes SHAがpinと一致 | provider reported versionだけをpinと異ならせる | `Unknown(unsupported)` before target/source/status/diff probe |
| `UT-LCI-80` | local receipt plan/config digestとcurrent shared role-pin configが一致 | current configの`provider_git` pinだけを更新し旧receiptは固定 | `Unknown(conflict)`、provider DIFF未実行。新configでlocal receiptを作り直す |
| `UT-LCI-81` | 同じconfig digest/target/argv/policyでproviderとlocal DIFF stateが一致 | provider diff stateだけを`fail`へ変える | `selected_check_parity=false`、positive不可。既存stateを補正しない |
| `UT-LCI-82` | local reader binary bytes/versionが`executables.git` pinと一致 | local Git bytes SHAだけをpinと異ならせる | `Unknown(unsupported)` before target/source/status probe。provider pinへのfallbackなし |
| `UT-LCI-83` | 提供環境の既存`bwrap` name/version literal/full-byte SHAがprofileと一致しnormal sandbox preflightが成立 | 変異なし | checker起動前にidentityを照合し、provenanceをclaimしない |
| `UT-LCI-84` | 実`bwrap` bytes SHAがtrusted profile pinと一致 | bytes digestだけをpinと異ならせる | `denied`、checker未起動、install/host/別binary fallbackなし |
| `UT-LCI-85` | 実`bwrap --version` literalがtrusted profile labelと一致 | version literalだけをpinと異ならせる | `denied`、checker未起動、semantic version比較なし |
| `UT-LCI-86` | trusted host-local settingがprofile pinned `bwrap`を解決する | binary availabilityだけを不成立にする | `denied`、checker未起動、package install/host/別binary fallbackなし |
| `UT-LCI-87` | manifestの`parent_ac_coverage`にOS-020-01/03が一件ずつあり、state/reasonはL4 §1と一致 | `AC-OS-020-03` rowだけを削除 | F09aは`Unknown(missing_input)`、LC-DESIGN-001非肯定、execution/receiptなし |
| `UT-LCI-88` | 必須2 parent AC rowのID/state/reasonはL4 §1と一致 | `AC-OS-020-01.state`だけを`pass`へ変更 | F09aは`Rejected(invalid_input)`、OS-020 AC passを作らずexecution/receiptなし |
| `UT-LCI-89` | 12 path/role/pair/source-kind、suiteおよびK4/G3 locator追補後193 required source ID、K1/K2/K3/K5/K4-G3の5 exact_heading locator、およびK1/K2=164、K3=194、K5=91、K4/G3=73（K4=51/G3=22）のexpanded fixture definitionsが揃う | `load_design_manifest`専用正常baseline | `Observed<DesignScopeManifest>`、source count 193。section locatorとexpanded verifier IDを区別する |
| `UT-LCI-90` | CK L5のK1/K2/K3/K5/K4-G3 exact-heading locatorが各一つ定義される | K2 locatorのrequired source rowだけを削除 | F09aは`Unknown(missing_input)`、run-level preflight、checker/execution/receiptなし |
| `UT-LCI-91` | K1 111/K2 53/K3 194/K5 91/K4-G3 73 literal-expansion IDが各一つずつraw L8 fixture rowへ結び付く | K1 expansionの中間suffix IDを一件だけ対応表から削除 | F09a/bは`Unknown(missing_input)`、regexや隣接IDから補わない |
| `UT-LCI-92` | K1/K2/K3/K5/K4-G3 L8 rowの第2列L9 oracle・第3列L4 refsはtyped reference、coverage sourceはexpected_pair一致のL5 locator | 一つのK1 rowへK2 locatorをsource referenceとして割当 | F09b/cは`Unknown(conflict)`、L9/L4 refsをL5 sourceへ昇格しない |
| `UT-LCI-93` | 各expanded K1/K2/K3/K5/K4-G3 verifier IDへ一件のrequired edgeがあり、dispositionが全edgeを参照する | 一つのK2 edgeとそのedge IDのdisposition referenceを同時に削除（同sourceの別edgeは維持） | F09cは`Unknown(missing_input)`、K1/K2=164、K3=194、K5=91、K4/G3=73（K4=51/G3=22）の必須destination inventoryの不足として検出 |
| `UT-LCI-94` | expanded verifier IDはID列セルを持つ同じraw rowの対応するOutcomeRef列（K1/K2は5、K3は6、K5/K4-G3は4）へ一意に結合 | 一つのexpanded IDのOutcomeRef row bindingだけを別raw rowへ変更 | F09b/cは`Unknown(conflict)`、別rowの期待値を流用しない |
| `UT-LCI-95` | K1/K2/K3/K5/K4-G3 table column 3のL4 invariant IDはL4 typed referenceとして解決し、L5→L8 sourceはpair locatorだけ | 一つの`K1-I*`/`K2-I*` refをcoverage `source_id`として登録 | F09b/cは`Unknown(conflict)`、既存L4→L9 source edgeをL5→L8へ流用しない |
| `UT-LCI-96` | CK L5のK1/K2/K3/K5/K4-G3 exact-heading locator range IDが各一件存在する | L5 K3 locatorの`range_id`だけを既存K5 locatorの`range_id`へ変更する | F09aは既存の一般重複range検査により`Unknown(conflict)`、run-level preflight、execution/receiptなし。range削除は別負例で`Unknown(missing_input)` |
| `UT-LCI-97` | K3=194/K5=91/K4-G3=73の各IDが独立inventory、raw definition rowへ一致（L9 IV-LCI-71） | `L8-K5-17-CLOSED-PARTIAL-READ`のraw table row、対応edge/disposition referenceを同時に削除し、独立K5 inventoryは維持。K5 rangeは全IDをraw table cellで直接定義しliteral expansionがないため、expansion削除は含めない | F09a/cは`Unknown(missing_input)`、checker/execution/receiptなし |
| `UT-LCI-98` | K3/K5第2/3列typed refsとedge source、OutcomeRefが同じrowを指す | 一つのK3 edgeのsource locatorだけをK5 locatorへ変更 | F09b/cは`Unknown(conflict)`、別pair/期待値の流用なし |
| `UT-LCI-99` | K3=194/K5=91/K4-G3=73の各IDが独立inventory、literal expansion、raw definition rowへ一致（L9 IV-LCI-71） | `L8-K3-14-ROLE-ALIAS-COEXISTS`をmanifest literal expansion、raw definition row、対応edge/disposition referenceから同時に削除し、独立K3 inventoryは維持 | F09a/cは`Unknown(missing_input)`、checker/execution/receiptなし |
| `UT-LCI-114` | Common Kernel K4/G3 raw inventoryはK4 51件/G3 22件を別集合として73 unique IDで保持 | `test_ut_lci_89_common_kernel_component_inventories_are_independent`の同じcurrent fixture baseline | 既存UT89のbaseline assertionで73件の定義を固定inventoryと照合し、L5→L8 edge先へ含める（追加test methodは作らない） |
| `UT-LCI-115` | K4/G3固定73 IDが各一つのraw rowへ結び付く | `L8-G3-04-RECORD-ONLY-NO-ACCEPTANCE-OUTPUT`のrowだけ削除 | F09a/bは`Unknown(missing_input)`、他rowや参照で補わない |
| `UT-LCI-116` | K4/G3 raw tableは固定inventory外のIDを含まない | `L8-K4-EXTRA`の定義行だけ追加 | F09a/bは`Unknown(conflict)` |
| `UT-LCI-117` | 各K4/G3 fixture IDはraw definition rowに一度だけ現れる | `L8-K4-01-COMPLETE` rowを一度複製 | F09bは`Unknown(conflict)`、一意なrow bindingなし |
| `UT-LCI-118` | K4/G3各fixture edgeのsourceはK4/G3 L5 locator、outcomeは同row第4列 | `L8-K4-01-COMPLETE` edgeのsource locatorだけをK5 locatorへ差替 | F09cは`Unknown(conflict)`、別component sourceへ流用しない |
| `UT-LCI-119` | Common Kernel L5 K4/G3 exact-heading locatorのdefinition rangeがmanifestに一件存在する | K4/G3 L5 locatorのdefinition rangeだけをmanifestから削除する | F09aは`Unknown(missing_input)`、L5 locatorが必須sourceとして未定義となりrun-level preflightで停止。IV-LCI-91に対応するdesign-manifest検査であり、suite runner/receiptは作らない |

result参照はすべて型付きIDである。`UT-LCI-*`は設計識別子でありtestの実行証拠ではない。test passからL8/L9/L10承認やmerge/release許可を作らない。


## 4. 開発source L7 suite runnerの単体oracle

以下は候補suite boundaryを検査する。formal ID closureは505件（495 callable mappingと10 K6 not-exercised disposition）、Python unittest discovery identitiesは586件であり別集合である。current expected discovery setのsorted-ID SHA-256は`aca81abd7dd60c29512431c2d8223fd509d4c7a3a3fd7f1fc70847658ba0042d`としてsource inventoryへ固定し、exact target L6/L7 refsとともに照合する。K1/K2既存の165-row mappingと199 identitiesは個別の保護済みprefixである。K5は91 formal IDs、67 primary（41 public API、24 helper、2 K2 lookup）と24 stubであり、UT-046/085/086の局所assertion範囲はL4 §2.1の未被覆境界を維持する。K6は55 formal IDsのうち45 callable rows（43 primary/2 partial callable）、10別disposition（2 partial_design/8 owner_unconnected）を持つ。

| Unit test ID | 正常前提 | 一点の変異／観測 | 期待 |
|---|---|---|---|
| UT-LCI-100 | Core-only baseline: target treeに9 Core code/test refs、formal closure、Core inventory-bound expected discovery set、runnerが揃い、registration/declaration/usable packは入力されない。505 formal IDsは495 callable mapping rows（441 primary/52 stub/2 partial callable）と10 K6 not-exercised disposition（2 partial_design/8 owner_unconnected）へ分かれ、586 expected identitiesがすべてpass | 変異なしbaseline | 495-row callable mappingと一致するdiscovery/execution ID arraysを持つfull external identity artifactとcompact summary、failure/error/skip/expected-failure/unexpected-success=0。expected sorted-ID SHA-256は`aca81abd7dd60c29512431c2d8223fd509d4c7a3a3fd7f1fc70847658ba0042d`。K6 callable mapping SHAは`12e75e7a54064d6f1bc9d5a7fbd2225b9bec4b04c6fa18a643e81ca035c194fd`、not-exercised disposition SHAは`886884b4168945fd2d510f6ed787e46160821ebbb0292a6f82941434a8ef4e7d`。pack状態を照会しない。旧baselineの196件/count digestをcurrent expected値へ流用しない |
| UT-LCI-101 | UT-LCI-100の他条件 | implementation source blob refを一件だけinventoryから除く | Unknown(missing_input)、runner未起動 |
| UT-LCI-102 | UT-LCI-100の他条件 | test_k2.py blob refだけを欠落させる | Unknown(missing_input)、K1だけを実行しない |
| UT-LCI-103 | exact source refsとcurrent inventory expected identities | coverage kind付きformal ID mappingからK2の一IDを除く | Unknown(missing_input)、spawn前inventory preflightで停止し、coverage欠落を実行済みとしない |
| UT-LCI-104 | current inventory expected discovery setが揃う | runner後のactual discovery ID一件だけを別IDへ置換 | `Unknown(conflict)`診断を保持し、F05はsuite `CheckExecution.state=fail`へ写す。complete resultを回収できないためcompact `suite_evidence`なしで部分diagnosticを残す。count一致だけで受理せず、outer K1 Unknown receiptへ置換しない |
| UT-LCI-105 | 正常suite | 一expected testだけをskipにする | CheckExecution.state=fail、skipped IDを保持 |
| UT-LCI-106 | 正常suite | 一assertionだけをfailureにする | CheckExecution.state=fail、full artifactのfailed_idsへ該当identityを保持 |
| UT-LCI-107 | discovery IDs一致 | runner exit codeだけを非zeroにする | CheckExecution.state=fail、success receiptなし |
| UT-LCI-108 | target-pinned CPython 3.11+ runner identity一致 | runner bytes digestだけをcurrent source/config identityと不一致にする | `Unknown(conflict)`をspawn前に返す。unsupportedなversion/profileは別条件で`Unknown(unsupported)`とし、digest不一致と混ぜない |
| UT-LCI-109 | suite source refs=head tree | run前再読でtest source digestだけを変える | Stale、suite未開始 |
| UT-LCI-110 | suite実行開始済み | run中にimplementation source digestだけを変える | Stale、正のsuite receiptなし |
| UT-LCI-111 | full identity artifactにactual discovery/execution IDs、formal mapping digest、target/source refsがある | discovered_test_idsだけを保存前payloadから除く | Unknown(conflict)、count/digestだけではfull evidenceとしない。F05はsuite step fail、compact summaryなし、partial diagnosticを保持する。providerは保存後artifactを再取得しない。 |
| UT-LCI-112 | compact receiptにartifact digest、discovery/execution count+ID-set digest、formal mapping digest、target/source refsがある | executed_ids_sha256だけをcompact summaryから除く | Rejected(invalid_input)、provider compact schema不完全でpositive不可 |
| UT-LCI-113 | full identity artifactに実discovered/executed ID arrays、mapping digest、target/source refsがある | executed_test_ids配列だけを保存前payloadから除く | Unknown(conflict)、full evidence不完全、success receiptなし。F05はsuite step fail、compact summaryなし、partial diagnosticを保持する。providerは保存後artifactを再取得しない。 |
| UT-LCI-120 | K3 implementation ref集合に`permission.py`のcurrent target bytesが一つある | exact target treeから`permission.py` blobだけを読めなくする | Unknown(missing_input)、先行5 checkのpartial diagnosticを保持して第6 runner spawn前に停止。K1/K2 source refsだけで縮退しない |
| UT-LCI-121 | `test_k3.py`がfixed test module refsに一件含まれる | exact target treeから`test_k3.py` blobだけを読めなくする | Unknown(missing_input)、先行5 checkのpartial diagnosticを保持してrunner spawn前停止。K1/K2 modulesだけへ縮退しない |
| UT-LCI-122 | target L7はfixed K3 formal IDsを全て表す | target L7本文から`CK-K3-UT-001`の行だけを除く | Unknown(conflict)、target L7と固定inventoryの不一致としてsuite spawn前に停止する。固定inventory自体の欠落は別境界 |
| UT-LCI-123 | K3の194 formal mapping identitiesはfixed mappingと一致する | K3 mappingの一つの`unittest_identity`だけをunknown identityへ差し替え、mutation側mapping digestを再計算する | runner起動後のfixed inventory検査がUnknown(conflict)。unittest discovery/execution前にnoncomplete診断を返し、F05はstep fail/partial diagnosticとして保持。complete evidenceは作らない |
| UT-LCI-124 | K3 formal IDsは一意なmapping rowへ結び付く | K3 mappingの一つの`formal_l7_id`だけを重複させ、mutation側mapping digestを再計算する | runner起動後のfixed inventory検査がUnknown(conflict)。unittest discovery/execution前にnoncomplete診断を返し、F05はstep fail/partial diagnosticとして保持。complete evidenceは作らない |
| UT-LCI-125 | K3の220 expected discovery identitiesを含む586個のfixed identity set | actual discoveryからK3 identity `test_k3.K3FormalFixtures.test_CK_K3_UT_001`だけを除く | Unknown(conflict)をspawn後partial diagnosticへ残し、F05はsuite step fail。count/formal rowsだけで補完せずcompact suite evidenceを作らない |
| UT-LCI-126 | actual discovery identitiesはfixed 586件で一意 | discovery結果にK3 identity `test_k3.K3FormalFixtures.test_CK_K3_UT_001`だけを重複追加 | Unknown(conflict)をspawn後partial diagnosticへ残し、F05はsuite step fail。重複をdedupして肯定しない |
| UT-LCI-127 | Core 586件だけを5 outcome familyへ互いに素に割り当てた比較値はbody/capture/helperが90,514/90,515/121,474 bytes。設計候補613件（Core 586＋補助27）の最大合法complete frameは99,820-byte body、99,821-byte LF capture、133,870-byte helper responseであり、1/3/5 familyの形を比較する | 最大合法613件frameのbodyだけを99,821 bytesへ1 byte増やす | runnerはcomplete artifactを出さず`Unknown(conflict)`の部分diagnosticを返す。切詰め結果からcomplete summaryやpositive receiptを作らない。現在のscaffold runtime上限は`source_l7_runner.py` body 99,820 bytes、`runner.py` LF付きcapture 99,821 bytes、supervisor frame 134,000 bytes。586 Core-only比較時点の90,514/90,515/122,000 bytesは履歴値として保持する |
| UT-LCI-128 | current source suiteの9 code/test refsがtarget treeに揃う | `journal.py` blobだけをcurrent target source refsから欠落させる | `Unknown(missing_input)`、先行5 checkのpartial diagnosticを保持して第6 check spawn前に停止 |
| UT-LCI-129 | UT-LCI-128の他条件 | `test_k5.py` blobだけをcurrent target source refsから欠落させる | `Unknown(missing_input)`、K1/K2/K3 modulesだけへ縮退せずrunner未起動 |
| UT-LCI-130 | target L7は505個の固定formal IDsをすべて含む | target L7本文からK6 disposition `CK-K6-UT-010`の行だけを除く | `Unknown(conflict)`、target L7とfixed inventoryの不一致としてrunner起動前に停止 |
| UT-LCI-131 | K5の91 mapping rowsはformal ID、callable、module、coverage kind、unittest identityの全固定値に一致 | `CK-K5-UT-001.coverage_kind`だけを`owner_or_fixture_stub`へ変更し、mutation側K5/full mapping digestを再計算 | runner discovery前の`Unknown(conflict)`、K5 mapping固定値との差をnoncomplete diagnosticへ残す |
| UT-LCI-132 | compact suite summaryの`suite_id`は`stage1-l7-source` | summaryの`suite_id`だけを旧値`common-kernel-k1-k2-k3-k5-k6`へ戻す | `Rejected(invalid_input)`、旧Core-only summaryをcurrent composite suite evidenceとして受理しない |

他Stage 1 unitsの未実装/partial/not_exercised coverageはこの候補suite executionとは別に残し、Stage 1全L7 successを主張しない。

## 5. 4機構 supplemental identity partition oracle

この節はL5 §8.1で固定した4機構の27 source-only unittest identitiesを、既存`F-LCI-10`の同じLC-STAGE1-L7-001 suiteへ加える構造・実行集合oracleである。下表のSUP identityは機構L7のformal UT IDではない。機構formal locator/status/owner-return refsはL5の別型で保持し、Core 505 formal IDs・495 mapping・586 discovery setへ足さない。`SUP` listはBRAIN 13、LABO 4、HARNESS 5、INFRA 5で閉じる。main `691ab36b9832c585fb77373899533165733b443b`時点のSECURITY 10件、CONNECT 4件、Common Kernel K4/G3 14件は未登録のまま除外し、後続対象をscanから追加しない。

| Unit test ID | 正常前提 | 一点の変異／観測 | 期待 |
|---|---|---|---|
| `UT-LCI-133` | exact target tree内にCore baseline 586 identitiesと、L5 §8.1の4 source/test pair・8 L6/L7 refs・27 unique supplemental identitiesがある。formal locator/status/owner-return refsは各機構L7原文に結び、supplemental rowにformal ID fieldがない | 変異なし | Core identities/count/digestは586の固定値を保持し、supplemental identitiesは27の別set/digestとして一回ずつ得られる。composite discovery候補613件。505/495とK6 10 dispositionを保持し、機構formal IDへの新mappingなし |
| `UT-LCI-134` | `UT-LCI-133`の他条件 | 27 supplemental identityから`SUP-BRAIN-001`だけを固定 inventoryから除く | `Unknown(missing_input)`、4機構全体を縮退実行せず、complete artifact/positive receiptなし |
| `UT-LCI-135` | `UT-LCI-133`の他条件 | 固定対象外の`SUP-SECURITY-001`一件だけを追加する | `Unknown(conflict)`、未登録mechanism/test identityをscan・appendしない |
| `UT-LCI-136` | 27 supplemental IDsは一意 | `SUP-LABO-001`一行だけを重複させる | `Unknown(conflict)`、重複をdeduplicateせず、suite successなし |
| `UT-LCI-137` | Coreとsupplemental partitionは別ID namespaceで一意 | supplemental rowの一件だけの`unittest_identity`をCore 586 identities中の一つと一致させる | `Unknown(conflict)`、partition境界を保ち、同一identityを二回実行・片方だけ採用しない |
| `UT-LCI-138` | 機構formal locator rowsはsource L7 bytesの原row/status/owner-return locatorへ一致 | BRAIN formal locator一行の元status cell refだけを別L7 rowへ差し替える | `Unknown(conflict)`、元status・owner returnを再解釈せず、supplemental identityへ写さない |
| `UT-LCI-139` | supplemental identityはsource/test refs・module alias・callable qualnameで完全に固定され、formal ID fieldを持たない | `SUP-HARNESS-001` rowだけに`formal_l7_id` fieldを追加する | `Rejected(invalid_input)`、formal bindingを推測・生成しない |
| `UT-LCI-140` | 全supplemental source/testとL6/L7 document refsはtarget tree上で固定SHAと一致 | `test_infrastructure.py`のtarget blobだけを参照から欠落させる | 既存F-LCI-10 pre-spawn `Unknown(missing_input)`。部分subsetの実行・complete artifact・positive receiptなし |
| `UT-LCI-141` | owner return locatorはsource L7に明記された場合だけexact cell refで保持し、非記載は`NotDeclaredBySource` | 一件のdeclared owner return cell refだけを別L7 rowへ差し替える | `Unknown(conflict)`、owner returnの意味を推定せず、実行ID/正式mappingへ昇格しない |
| `UT-LCI-142` | supplemental ID setはL5 §8.1の27件だけ。CONNECTの4件は明示的に対象外 | `SUP-CONNECT-001` ID-shaped rowを一件だけ補助setへ追加する | `Unknown(conflict)`、CONNECT sourceをscan/登録せず、27件のsetを維持する |
| `UT-LCI-143` | supplemental ID setはL5 §8.1の27件だけ。Common Kernel K4/G3の14件は明示的に対象外 | `SUP-CK-K4-001` ID-shaped rowを一件だけ補助setへ追加する | `Unknown(conflict)`、K4/G3 sourceをscan/登録せず、27件のsetを維持する |

これらのoracleは固定inventoryと実runner resultのidentity境界だけを検査し、4機構の正式L7 fixture/pass・L8/L9 oracle・製品登録/owner接続を検査または生成しない。`UT-LCI-133`のcomposite count 613は設計上の期待集合で、実際のdiscovery/execution件数ではない。L5 §8.1の27行ごとのmethod assertion内容は各製品source/test bytesに属し、本書で再分類しない。実装時の非formal回帰では、trusted側AST preflightが固定9 alias/pathからclass/method identityを照合し、test moduleをimportしないこと、重複class/function/methodや欠落・余分identityを既存diagnosticで止めることを確認する。これは既存613 identity inventoryの構造照合であり、新たなformal fixture、coverage mapping、製品L7合格ではない。実test moduleのimport/discoveryはsandbox内runnerで引き続き照合する。

既存oracleの負例内訳: UT-LCI-105/106はerror、expected failure、unexpected successも個別に変異させ、各該当ID/countを保持したfailを確かめる。UT-LCI-107は5 outcomeが空の非zero exit、bool count、余分なfield、count/ID不一致、過大frame、不正JSON、未開始結果を各々拒む。UT-LCI-103はplaceholder未知値/余分なsuffixを個別に拒む。UT-LCI-111/113は作成前payload検証の境界であり、保存後のartifactをproviderが取得・再検証する意味ではない。同oracleでartifact root/file mode不正、symlink ancestor、repo内path、digest名collision、atomic link失敗も個別に拒み、XDG未設定時はuid別固定rootからexact bytesを再読できることを確認する。UT-LCI-101/102にはmissing_inputとconflict双方で先行5件のpartial diagnosticが残りsuite行/receiptが無いことを含める。

F-LCI-10のsnapshot merge実装にはformal IDを増やさない局所回帰を置く。既存read-only source fileと同一bytesの再投入は再書込みせずsource/source-refを重複追加しない。既存identityの異bytesは`Unknown(conflict)`、identityがあるのにfileが欠ける場合は`Unknown(missing_input)`、symlinkは`Unknown(conflict)`とし、snapshotを修復・followしない。この回帰はUT-LCI-100..143のformal inventoryやcoverage mappingに加えず、L6 F-LCI-10のreadonly snapshot条件を実装上保つ。
