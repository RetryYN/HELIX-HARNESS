---
title: "Impact CI Recovery L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-01
updated: 2026-08-06
owner: QA
plan: docs/plans/PLAN-L6-92-impact-ci-recovery.md
pair_artifact: docs/design/helix/L6-function-design/impact-ci-recovery.md
related_l9: docs/test-design/helix/L9-impact-ci-recovery-system-test-design.md
queue_id: L3Q-PC-039
---

# Impact CI Recovery L8単体テスト設計

| oracle | 正例 | 反例／mutation |
|---|---|---|
| U-IMPACTCI-001 | inventory ID、owner、argv command、profile、kindが一意 | duplicate ID、owner欠落、空command、unknown enum、同一command別IDを拒否 |
| U-IMPACTCI-002 | changed pathから直接test、trace consumer、V-pair oracle、owner gateを選択 | relation edgeを1本削除、changed testをdeferredへ送るmutationを拒否 |
| U-IMPACTCI-003 | PLANの`generates`／`requires`／`pair_artifact`からcompanionを追加 | PLAN companionの一種を無視するmutationを拒否 |
| U-IMPACTCI-003B | test relationで解決したpathだけを`relationResolvedPaths`としてunknown判定から除外 | relation未解決pathやcompanion欠落を選択実行へ通すmutationを拒否 |
| U-IMPACTCI-004 | selector／workflow／security／permission／secret／schema／migration／rollback／DB／authority／lockfile変更をfull化 | high-riskをknown-lowへ落としてtargeted terminalにするmutationを拒否 |
| U-IMPACTCI-005 | relation既知のknown-lowだけをselected/deferredへ分割 | unknown path、空relationを`known_no_consumer` receiptなしでdeferredへ送るmutationを拒否 |
| U-IMPACTCI-006 | selectedとdeferredの交差0、和集合inventory exact set、canonical sort | item欠落、余剰、重複、非決定順序を拒否 |
| U-IMPACTCI-007 | GitHub API current HEAD／body digest／merge-baseを同一snapshotへ束縛 | base HEAD／current body取得不能を`snapshot_unavailable`、event payload再利用、取得後HEAD/body/base driftを`stale_snapshot`にする |
| U-IMPACTCI-008 | terminal receiptのresult IDがselected exact setと一致し全exit 0。internalとGitHubを別surface receiptにする | 別HEAD、別inventory、欠落result、余剰result、exit非0、未完時刻、別surface greenによる相殺を拒否 |
| U-IMPACTCI-009 | rerunを新attemptとして追記し最初のterminal linkを維持 | terminal置換、同一item/HEAD/profileの二重terminalを拒否 |
| U-IMPACTCI-010 | post-mergeがcandidate deferred exact setを回収し、空集合receiptも発行 | deferred欠落、selected再実行による回収偽装、nightly成功によるfailure消去を拒否 |
| U-IMPACTCI-011 | profile/execution surface/environment/cache class別のterminal母集団でp50/p95計算 | internal/GitHub混在、cold/warm混在、cancelled/superseded混入、母集団数欠落を拒否 |
| U-IMPACTCI-012 | correctness green＋budget超過をmerge greenとRecovery evidenceへ分離 | timeout延長、test除外、threshold緩和、`continue-on-error`を改善扱いするmutationを拒否 |
| U-IMPACTCI-WF-002 | full admissionは同一tested HEADの独立worktreeでbulk fastとstateful（cli-surface→slow）を並列実行し、2結果を単一required checkへ集約 | 同一rootのworker増加、cli-surface／slow／bulk欠落、別HEAD、lane failureのsoft-pass、targeted profileへの強制lane化を拒否 |
| U-IMPACTCI-WF-003 | runner cancel（TERM/INT）を両lane process groupへboundedに伝播し、worktree cleanup完了とcancellation receipt（signal・latency・課金時間）を残し、正常経路のfail-close集約を変えない | TERM/INT trap欠落、group宛TERM欠落、KILL escalation欠落、cancel時cleanup欠落、receipt欠落、cancel exitの0偽装を拒否 |
| U-IMPACTCI-WF-004 | 同一head SHAのready_for_review／converted_to_draft遷移eventで、base tipがprior run開始前から不変の場合だけprior green full receiptを再利用し、reuse receipt（reused_run_id・tested_head）を残す | transition event限定の欠落、prior run success絞り込みの欠落、base tip不変検査の欠落、reuse run id検証の欠落、reuse receipt欠落を拒否 |

## 実行単位

- 純粋単体検証: inventory validator、impact selector、partition validator、receipt validator、percentile calculator。
- Fixture: known-low docs、source＋test、unknown path、security/schema、stale body、empty deferred、二重terminal。
- Integration／workflowはL6/L7で扱い、本L8のunit closureへ数えない。

## Mutation閉鎖

mandatory itemを1件削除する、risk tagを1件known-lowへ落とす、deferred itemを捨てる、event payloadをcurrent bodyより
優先する、terminal linkを上書きする、execution surfaceまたはcold/warmを合算する各mutationが最低1 oracleをredにする。

上記15件は`L3Q-IT-024`で`tests/impact-ci.test.ts`へ実行可能化し、代表bindingとworkflow dispatchを
下表へexact citationする。最終confirmed化は同一HEADのAI-B reviewとCI／DB convergence後に限る。

## L3Q-IT-024実行引用

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-IMPACTCI-001 | inventory validator | duplicate IDを`invalid_inventory`として拒否 | `tests/impact-ci.test.ts` |
| U-IMPACTCI-012 | correctness／performance分離 | budget超過をcorrectness redへ偽装するmutationを拒否 | `tests/impact-ci.test.ts` |
| U-IMPACTCI-WF-001 | workflow profile dispatch | Draft full固定、Ready selective、empty selective、soft-passを拒否 | `tests/harness-check-workflow.test.ts` |
| U-IMPACTCI-WF-002 | isolated full lane集約 | bulk fast＋stateful（cli-surface→slow）のexact 2 lane、tested HEAD一致、全status 0、targeted経路維持 | `tests/harness-check-workflow.test.ts` |
| U-IMPACTCI-WF-003 | isolated lane cancellation伝播 | TERM/INT trap欠落、group宛signal欠落、bounded KILL escalation欠落、cancel時cleanup欠落、receipt欠落、cancel statusの0偽装を拒否 | `tests/harness-check-workflow.test.ts` |
| U-IMPACTCI-WF-004 | 同一HEAD transition reuse | transition event限定欠落、success絞り込み欠落、base tip不変検査欠落、run id検証欠落、receipt欠落を拒否 | `tests/harness-check-workflow.test.ts` |
