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
| `IV-LCI-04` | LC plan | 5 check IDが固定順に各一度選ばれる | `LC-GOV-001`を選択集合から落とす | `Unknown(missing_input)`、aggregate successなし |
| `IV-LCI-05` | check継続 | SCF validateがnonzeroでも後続4 checkを実行 | 最初のstepをnonzeroにする | そのstep `fail`、後続結果を保持、aggregate `fail` |
| `IV-LCI-06` | LC-SCF-001 | adapterが全bindingをvalidateしexit 0 | validator executableを欠落させる | `denied`、success禁止 |
| `IV-LCI-07` | LC-GOV-001 | rulebook全件checkerがexit 0 | candidate/source pinを一つ変えてgovcheckをnonzeroにする | `fail`、診断digestを保持 |
| `IV-LCI-08` | LC-DIFF-001 | base/head間の全変更をcheck | diffにwhitespace errorを一つ加える | `fail` |
| `IV-LCI-09` | DesignScopeManifest | 10文書をrole/pair/source-kindごとに一度列挙 | 一文書をscopeから除く | `Unknown(missing_input)`、全量検査を主張しない |
| `IV-LCI-10` | ID定義/参照 | 定義IDが定義域に一度あり参照先を解決 | IDを参照域へ移し定義を削る | `Unknown(missing_input)` |
| `IV-LCI-11` | 明示coverage edge | L4 CK/RL契約とL9 IV、L5/L6契約と対fixtureのedgeを列挙 | 一つの契約edgeを削除 | `Unknown(missing_input)`、coverage successなし |
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
| `IV-LCI-27` | aggregate result | 全required local stepsがsuccess、manifest complete | 一つを`skipped`にする | aggregate `skipped`。他stepの状態も保持 |
| `IV-LCI-28` | no-secret persistence | stub stdoutにsynthetic credential-shaped valueがあるがreceiptはhashだけ保持 | raw stdout bytesをreceiptへ追加する | `Rejected(invalid_input)`。secret scanは要求しない |
| `IV-LCI-29` | authority非昇格 | local/Actions successはCI evidenceとして出る | successからL3 acceptance/merge permissionを生成 | `Negative` |
| `IV-LCI-30` | branch protection不変更 | actionがread-only verifier | workflowからrequired check/branch protection変更を発行 | L4 scope違反の`Negative` |
| `IV-LCI-31` | LC-SCF-002 | 全未retired bindingの`stale`をread-only照合しstale=0/exit 0 | upstream digestを一件変えてscfctlにstaleを検出させる | `fail`、後続checkを継続しaggregate successなし |
| `IV-LCI-32` | LC-SCF-001 | validate executableが存在し全bindingを検査 | validatorは存在するがexit 1 | `fail`、後続stepを継続 |
| `IV-LCI-33` | workflow default branch有無 | `workflow_dispatch` workflowがdefault branchにある | default branchからworkflowを除く | `Unobserved(not_run)` |
| `IV-LCI-34` | 固定親pinのauthority境界 | L4がOS Stage 2a `HELIXOS-L2-020` とHARNESS Stage 3 `HARNESS-L2-036` のdecision path、reviewed revision、固定L3/L10 path、section span SHAを明示する | いずれか一方のreviewed revisionだけを現在main HEADへ置換し、同じpath名だから承認済みとして扱う | `Unknown(conflict)`。現在のwhole-file更新を承認更新や別Stageの親採択へ読み替えず、両固定parent pinとStage境界を保持する |
| `IV-LCI-35` | formal K1 key構成境界 | operation/version、target SubjectRef、scope、必須source refsを現行K2型で構成できる | target SubjectRefを入力から削除する | `Rejected(missing_key)`。架空refやkeyなしUnknownを作らず、formal result/receiptを作らない |
| `IV-LCI-36` | key構成後のsource read | key入力の全refは存在し、固定target treeからbytesを読める | 一つのrequired Git blobをkey構成後の読取時にunavailableにする | `Unknown(unreadable)`。診断を保持しsuccess/receiptへ昇格しない |

GitHub input仕様の25 inputs/65,535 character上限はprovider-boundary fixtureであり製品要求のthresholdではない。容量超過なら省略してvalid化せず未照合で止める。

## 2. 結合ケースの実行状態

Local runは全stepを実行する。実行できないstepは`denied`、呼出し中断は`interrupted`、target/contract/checker変化は`stale`、検査で不一致を検出した場合は`fail`とする。GitHub dispatchがない、receipt transportが欠ける、workflowが存在しない場合は`Unobserved(not_run)`を保持する。localとGitHubのparityは、双方で同じselected gateを実際に照合できた場合だけ示す。

独立reviewとこの設計のmergeはlocal CIの実行合格ではない。`design_pair_defined`もreview/approval/implementation/run/acceptanceを示さない。

## 3. 旧sourceからの保持と変更

旧asset IDs、path、lines、full SHAと保持/変更理由はL4 §1をsource of truthとする。本書では旧sourceを再実行しない。保持はlocal-first・merge-unit・evidence bindingの意味に限る。旧workflow/hook/コスト数値・技術名をfixture oracleにしない。
