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
| U-IMPACTCI-WF-004 | full回帰をgreen完走したrunだけがhead/base SHA束縛のfull receipt artifactを発行し、同一head SHAのready_for_review／converted_to_draft遷移eventはreceiptの両SHA完全一致時だけ再利用してreuse receipt（reused_run_id・tested_head）を残す | transition event限定の欠落、success絞り込みの欠落、full receipt照合の欠落、base SHA一致検査の欠落、照会失敗フォールバックの欠落、run id検証の欠落、receipt発行のfull限定／reuse除外の欠落を拒否 |

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
| U-IMPACTCI-WF-004 | 同一HEAD transition reuse | transition event限定欠落、success絞り込み欠落、full receipt照合欠落、base SHA一致検査欠落、フォールバック欠落、run id検証欠落、receipt発行境界欠落を拒否 | `tests/harness-check-workflow.test.ts` |

## U-CLIBUNDLE-001: spawn テストの bundle 起動等価性（PLAN-RECOVERY-39）

上の 15 件（`L3Q-IT-024` / `tests/impact-ci.test.ts` 群）とは別枠の oracle である。
CI 実行時間の支配項が「CLI bootstrap × spawn 数」であることを受け、spawn 過多な suite の
子 process 起動を `npx --no-install tsx <entry>` から esbuild bundle の `node <bundle>` へ
置換した。この置換は「bundle が tsx と等価に振る舞う」ことに依存するため、その前提自体を検査する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CLIBUNDLE-001 | bundle 起動と tsx 起動の等価性、および bundle の ROOT 導出 | CLI surface と hook 3 シナリオ（malformed stdin の fail-close／破壊的コマンド BLOCK／非破壊コマンド通過）で exit code・stdout・stderr が一致すること。bundle の ROOT が呼び出し元 repoRoot と一致すること。ROOT anchor の define 削除、anchor 深さ逸脱、anchor 名と outfile 名の衝突（自己実行判定の誤発火）、hook entrypoint 取り違え、bundle 名衝突の各 mutation を拒否 | `tests/cli-bundle-equivalence.test.ts` |

### ROOT 導出を直接観測する理由

実 CLI / hook の出力から ROOT は読み取れない。ROOT 依存の分岐は、その root に状態ファイルが
在るときにしか外から見えないためである（実際、anchor 深さ逸脱の mutation は当初 survive した）。
そのため `tests/tools/bundle-root-probe.ts` を専用 entrypoint として置き、被検査対象と同一の
導出式で求めた ROOT を標準出力へ書き出させ、これを直接突き合わせる。

### 検査範囲に関する訂正

本 oracle 追加前の想定「実運用（`.claude/settings.json`）の tsx hook 起動は
`runtime-hook-entrypoints` 等の suite が引き続き被覆する」は**事実誤認**であった。
`.claude/hooks/git-command-guard.ts` を実プロセスとして tsx 起動する suite は
本 slice 後 `tests/cli-bundle-equivalence.test.ts` のみであり、その tsx 経路の被覆は
他 suite ではなく本 oracle が担う。
