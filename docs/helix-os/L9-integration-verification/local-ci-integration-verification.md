---
title: "HELIX-OS Stage 1 local CI 結合検証設計"
status: design_pair_defined
owner: HELIX-OS
paired_l4: ../L4-basic-design/local-ci.md
stage: 1
version_target: 1.0
---

# HELIX-OS Stage 1 local CI 結合検証設計

本書はL4 `local-ci.md`の選択scope、実行順序、receipt binding、GitHub `workflow_dispatch`を結合で検査する設計であり、実行・合格の記録ではない。期待は設計oracleである。旧CI/旧testを実行しない。

## 1. 検証構成と判定

fixtureは合成Git tree・合成receipt・stub process resultだけを使う。checker実行fixtureはcommand adapterをstubし、archive source/runtimeを起動しない。各反例は対象受口を明記し一条件だけを変える。K1/OS-020状態語を使い、不明・未実行・失敗をsuccessへ縮退させない。

L4 `DesignScopeManifest`が列挙する現行4文書と今回6文書について、定義域と参照域を分離したID解決、L4 invariant/contract→L9 IV edge、L5 contract→L8 case、L6 function→L7 test edgeを照合する。coverage entryの無い契約、孤児edge、fixture定義欠落は肯定しない。HistoricalPinはasset ID、archive path、full-file SHA、行範囲、optional span SHAをそれぞれの型で照合し、時点auditをcurrent-link対象へ混ぜない。

| 検証ID | L4契約 | 正常入力 | 一点の変異 | 期待結果 |
|---|---|---|---|---|
| `IV-LCI-01` | LC target | clean checkoutのbase/head/treeが正しく束縛される | target headだけ別commitにする | `Stale`、check未開始 |
| `IV-LCI-02` | LC target | HEAD/treeが一致しworktreeがclean | trackedまたはuntracked pathを一つ変更 | `Stale` |
| `IV-LCI-03` | LC-DIFF-001 | exact merge-baseからheadまでの全diffを照合 | merge-baseだけを別baseにする | `Stale`、別diffのsuccessを流用しない |
| `IV-LCI-04` | 開発repo専用LC plan | local-CI contractから5 check IDを順序付きで選び、plan state/config digestに記録する。OS-020のgeneric profile組成や未見義務選択のoracleではない | `LC-GOV-001`を選択集合から落とす | `Unknown(missing_input)`、aggregate successなし |
| `IV-LCI-05` | check継続 | SCF validateがnonzeroでも後続4 checkを実行 | 最初のstepをnonzeroにする | そのstep `fail`、後続結果を保持、aggregate `fail` |
| `IV-LCI-06` | LC-SCF-001 | adapterが全bindingをvalidateしexit 0 | validator executableを欠落させる | `denied`、success禁止 |
| `IV-LCI-07` | LC-GOV-001 | rulebook全件checkerがexit 0 | candidate/source pinを一つ変えてgovcheckをnonzeroにする | `fail`、診断digestを保持 |
| `IV-LCI-08` | LC-DIFF-001 | base/head間の全変更をcheck | diffにwhitespace errorを一つ加える | `fail` |
| `IV-LCI-09` | DesignScopeManifest | 10文書をrole/pair/source-kindと`RL-V1`/`RL-K3` not_exercised、`RL-D4`の`IV-RL-56`/`IV-RL-57`/`IV-RL-59` partial edge、別fieldのD4 code-graph extraction scopeout、`RL-T3` partial dispositionを含めて一度列挙 | 一文書をscopeから除く | `Unknown(missing_input)`、全量検査を主張しない |
| `IV-LCI-10` | ID定義/参照 | 定義IDが定義域に一度あり参照先を解決 | IDを参照域へ移し定義を削る | `Unknown(missing_input)` |
| `IV-LCI-11` | 明示coverage dispositionとscopeout分離 | 各契約はmapped/partial edgeまたは理由・既存owner_ref・operational-owner状態・return path付きnot_exercisedを持ち、D4 code-graph extractionは別fieldのscopeoutに残す | `RL-D4`の`IV-RL-57` partial design edgeを削除する | `Unknown(missing_input)`、構造completeなし。non-pass dispositionを契約passにはしない |
| `IV-LCI-12` | `U-LCI-01..04` unsupported inventory | 4件を理由付きscope外non-pass dispositionとして記録し、scope内required setと分離 | `U-LCI-01`をpassへ書き換える | `Negative`。scope外の未検証状態は別fieldに維持し、構造manifest completeなら固定5-step successを妨げない |
| `IV-LCI-13` | HistoricalPin | asset ID/path/full SHAと指定line range/span SHAを再計算照合 | 複数行sourceの1行spanへ全体file digestを入れる | `Unknown(conflict)`（指定span bytesから再計算したSHAと不一致） |
| `IV-LCI-14` | source-kind | historical archive/audit pinをcurrent link検査から分ける | historical pathをcurrent repository sourceとして要求 | `Unknown(unregistered)` |
| `IV-LCI-15` | SourceSnapshotReader | 宣言Git blob bytesがhead tree pathと一致 | worktree bytesだけを変更 | `Stale`、checkerを起動しない |
| `IV-LCI-16` | adapter integrity | scfctl/govcheck bytes digestが実行前後で一致 | 実行中にchecker fileを変更 | `Stale`、run successなし |
| `IV-LCI-17` | receipt storage | receiptがcheckout外へ出力される | output pathをrepo内に指定 | `Rejected(invalid_input)`、writeなし |
| `IV-LCI-18` | receipt identity | receiptにHEAD/tree/contract/config/manifest/checker refsとexecutionがありself-digestは別計算 | receipt bodyに自身のdigestを埋める | `Rejected(invalid_input)` |
| `IV-LCI-19` | receipt privacy | JSONにはstatus/exit/output SHAと相対cwdだけがある | stdout本文fieldを一つ追加 | `Rejected(invalid_input)`、本文を保存しない |
| `IV-LCI-20` | receipt bindingとschema | canonical compact receiptに5 required IDが各一度あり、全success/aggregate successが整合し、identity refsはcurrentと一致 | same target receipt内のconfig digestだけをcurrent値と異ならせる | `Unknown(conflict)`。local-only result/output hashの再実行は主張しない |
| `IV-LCI-21` | workflow cadence | `workflow_dispatch`でtarget指定したmerge-unit照合 | push/PR毎triggerを追加 | L4境界違反の`Negative` |
| `IV-LCI-22` | dispatch target | dispatch入力targetとcheckout HEAD/treeが一致 | `target_head`だけを別commitにする | `Stale`、照合済みを主張しない |
| `IV-LCI-23` | dispatch input parser | compact JSONをenvironmentからJSON parserで解析 | valueにshell metacharacterを入れる | dataのまま渡りshell実行痕跡なし |
| `IV-LCI-24` | provider input上限 | receipt JSONがGitHub input上限内 | compact payloadを65,536文字にする | `Unobserved(not_run)`、success禁止 |
| `IV-LCI-25` | selected check parity | localとActionsの`LC-DIFF-001`が同じbase/head/contract/settingsを使う | local receiptのbaseだけ変更 | `Unknown(conflict)`、parityを主張しない |
| `IV-LCI-26` | local-only selection | SCF validate/stale、GOV/design manifestをlocal-onlyとして選択 | Actionsがいずれかを実行済みとclaim | `Negative`、local-only結果を維持 |
| `IV-LCI-27` | aggregate result | 全required local stepsがsuccess、manifest complete | manifest structure completeだけをfalseにする | aggregate successなし、全step successだけでは構造不完全を肯定しない |
| `IV-LCI-28` | no-secret persistence | stub stdoutにsynthetic credential-shaped valueがあるがreceiptはhashだけ保持 | raw stdout bytesをreceiptへ追加する | `Rejected(invalid_input)`。secret scanは要求しない |
| `IV-LCI-29` | authority非昇格 | local/Actions successはCI evidenceとして出る | successからL3 acceptance/merge permissionを生成 | `Negative` |
| `IV-LCI-30` | branch protection不変更 | actionがread-only verifier | workflowからrequired check/branch protection変更を発行 | L4 scope違反の`Negative` |
| `IV-LCI-31` | LC-SCF-002 | 全未retired bindingの`stale`をread-only照合しstale=0/exit 0 | upstream digestを一件変えてscfctlにstaleを検出させる | `fail`、後続checkを継続しaggregate successなし |
| `IV-LCI-32` | LC-SCF-001 | validate executableが存在し全bindingを検査 | validatorは存在するがexit 1 | `fail`、後続stepを継続 |
| `IV-LCI-33` | workflow default branch有無 | `workflow_dispatch` workflowがdefault branchにある | default branchからworkflowを除く | `Unobserved(not_run)` |
| `IV-LCI-34` | 固定親pinのauthority境界 | L4がOS Stage 2a `HELIXOS-L2-020` とHARNESS Stage 3 `HARNESS-L2-036` のdecision path、reviewed revision、固定L3/L10 path、section span SHAを明示する | いずれか一方のreviewed revisionだけを現在main HEADへ置換し、同じpath名だから承認済みとして扱う | `Unknown(conflict)`。現在のwhole-file更新を承認更新や別Stageの親採択へ読み替えず、両固定parent pinとStage境界を保持する |
| `IV-LCI-35` | formal K1 key構成境界 | operation/version、target SubjectRef、scope、必須source refsを現行K2型で構成できる | target SubjectRefを入力から削除する | `Rejected(missing_key)`。架空refやkeyなしUnknownを作らず、formal result/receiptを作らない |
| `IV-LCI-36` | key構成後のsource read | key入力の全refは存在し、固定target treeからbytesを読める | 一つのrequired Git blobをkey構成後の読取時にunavailableにする | `Unknown(unreadable)`。診断を保持しsuccess/receiptへ昇格しない |
| `IV-LCI-37` | 計画stateとexecution state | plan state=`success`、execution state=`fail`で両者は別fieldにある | `plan.state`だけをexecutionの`fail`へ変更する | `Rejected(invalid_input)`、plan enum違反をreceiptへ採用しない |
| `IV-LCI-38` | OS-020 AC-01適用境界 | AC coverage tableに`not_exercised`と理由（generic HARNESS duty/profile selectionを実装しない）を記録 | AC-01 dispositionだけを`pass`へ変更 | `Negative`。local CI結果をAC-01の合格やOS-020完成にしない |
| `IV-LCI-39` | OS-020 AC-03適用境界 | AC coverage tableに`not_exercised`と理由（未見一般diffのobligation selectionを実装しない）を記録 | AC-03 dispositionだけを`pass`へ変更 | `Negative`。固定5件をOS-020 generic stage count/AC-03正常と扱わない |
| `IV-LCI-40` | 専用snapshot workspace | command cwdは必要blobs/minimal objectsとdeclared baseline ancestorsだけのself-contained snapshot。private Git configにremote/credential helperはなく、original checkout/`.git`/receipt dirはsandbox外 | sandbox mount listへoriginal `.git/config`を一つ追加する | `denied`、checkerを起動せずaggregate successなし |
| `IV-LCI-41` | network isolation | sandbox profileはnetworkを専用の空のnetwork namespaceへ分離しhost network namespaceを共有しない | network namespace設定だけを外す | `denied`、checkerを起動しない |
| `IV-LCI-42` | private snapshot write boundary | required snapshot blobs/minimal objectsはread-onlyで、private scratchだけchecker-writable | snapshot mountだけをwritableにする | `denied`、checkerを起動しない |
| `IV-LCI-43` | process monitor/timeout | step process groupを監視し、候補timeout前に正常終了する | 300秒候補timeoutだけを超過させる | `interrupted(reason=timeout)`、process tree終了/reap後に後続stepを続ける |
| `IV-LCI-44` | selected required state | generic fold語彙にskippedはあるが、5件はselected requiredでreceipt schemaがskipを許さない | 一つのselected required rowだけを`skipped`でreceiptへ入れる | `Rejected(invalid_input)` before aggregate fold、general `CiState` vocabularyを変更しない |
| `IV-LCI-45` | OS-020 AC-02全体claim境界 | AC-02は境界fixtureのみの限定照合で、AC-01/03は理由付き`not_exercised` | AC-02の限定照合dispositionだけをAC-02全体`pass`へ変更する | `Negative`。限定fixtureはAC-02全体passの根拠にならない |
| `IV-LCI-46` | sandbox preflight | exact targetのprivate snapshot、read-only input、private scratch、専用の空のnetwork namespaceを起動前に確認 | namespace/mount能力を一つ外す | 5 execution `denied`、checker未起動、aggregate successなし |
| `IV-LCI-47` | transitive checker binding | govcheck entrypointと`gen_rulebook.py` digestをcurrent refsへ含める | 子checker digestだけを別bytesへ変える | `Stale`、govcheck未起動 |
| `IV-LCI-48` | fixed Python argv preflight | checker argvは設計固定の`python3 -B`を使う | argvから`-B`だけを除く | `Rejected(invalid_input)` before spawn。readonly境界の成立失敗とは推論しない |
| `IV-LCI-49` | child process supervision | govcheckとその`--check`子processを同じ監視境界で追跡する | 子processだけをtimeout後も生存させる | 子processを停止・reap確認できるまで後続stepを開始せず`denied` |
| `IV-LCI-50` | dispatch parse受口 | workflow開始後、dispatch envelopeをJSON parserで読める | envelope JSON構文だけを壊す | `Unknown(unreadable)` diagnostic、未照合をsuccessへしない |
| `IV-LCI-51` | receipt write authority | checkerから書けるのはreceiptと分離したprivate scratchだけ。receipt/parent directoryはsandbox外で信頼側supervisorだけが書く | receipt parent directoryだけをchecker sandboxへmountする | `denied`、checkerを起動しない |
| `IV-LCI-52` | run全体の中止要求 | supervisor外からの中止要求はなく、process監視と後続実行を継続する | run全体への中止要求だけを追加する | 起動中processの停止・reap確認後、未開始stepを`interrupted(reason=cancelled)`とする。停止確認不能なら未開始stepは`denied`、後続未起動 |

GitHub input仕様の25 inputs/65,535 character上限はprovider-boundary fixtureであり製品要求のthresholdではない。容量超過なら省略してvalid化せず未照合で止める。

## 2. 結合ケースの実行状態

Local runはplanの固定5 required stepを実行する。planの選択根拠/config digest/stateとexecution stateは別fieldで検査し、plan成功をexecution成功へ流用しない。実行できないstepは`denied`、timeoutはprocess groupと子processの停止・reap確認後`interrupted(reason=timeout)`、target/contract/checker変化は`stale`、検査で不一致を検出した場合は`fail`とする。隔離preflight不能、network/read-only boundary不能、checker停止を確認できない場合は`denied`でchecker未起動または後続未開始とする。selected required stepの`skipped`は`Rejected(invalid_input)`でありaggregate stateではない。dispatch不成立/未配備/上限超過で検証開始前なら`Unobserved(not_run)`、開始後のJSON構文不正は`Unknown(unreadable)`を保持する。localとGitHubのparityは、双方で同じselected gateを実際に照合できた場合だけ示す。`LC-DESIGN-001`の構造的successはmanifest/edge/dispositionの構造完全性を表し、`not_exercised`契約やOS-020全体の合格を意味しない。

独立reviewとこの設計のmergeはlocal CIの実行合格ではない。`design_pair_defined`もreview/approval/implementation/run/acceptanceを示さない。

## 3. 旧sourceからの保持と変更

旧asset IDs、path、lines、full SHAと保持/変更理由はL4 §1をsource of truthとする。本書では旧sourceを再実行しない。保持はlocal-first・merge-unit・evidence bindingの意味に限る。旧workflow/hook/コスト数値・技術名をfixture oracleにしない。
