---
title: "Impact CI Recovery L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-01
updated: 2026-09-04
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
| U-IMPACTCI-WF-004 | full回帰をgreen完走したrunだけがhead/base SHA束縛のfull receipt artifactを発行し、同一head SHAのready_for_review／converted_to_draft遷移eventはreceiptの両SHA完全一致時だけ再利用してreuse receipt（reused_run_id・tested_head）を残す | transition event限定の欠落、success絞り込みの欠落、full receipt照合の欠落、base SHA一致検査の欠落、照会失敗フォールバックの欠落、run id検証の欠落、receipt発行のfull限定／reuse除外の欠落を拒否 |
| U-IMPACTCI-WF-006 | schedule／workflow_dispatchのbefore SHAが空またはzeroならcandidate HEADの親から有限rangeを作り、branch-kind／commitlintで同じ規則を使う | branch-kindまたはcommitlintからempty before判定を個別に除去し、`..HEAD`を再生成するmutationを拒否 |
| U-REPOGUARD-001 | repo-wide guard registryが既存実repo走査testのexact setを保持 | registryから1件削除、重複、missing path、未登録guardを拒否 |
| U-REPOGUARD-002 | review／local／CIが`npm run test:repo-guards`を共用しpreflightで実行 | package entrypointまたはworkflow配線の削除、別test listの複製を拒否 |
| U-FULLSHARD-001 | 入力順に依存せずfast bulkを3 shard、CLI／slowをstatefulへ安定分割 | 入力順でpartition digestが変わる、stateful pathがbulkへ移るmutationを拒否 |
| U-FULLSHARD-002 | shard unionがtracked inventory exact setで交差0 | missing、duplicate、unknown pathを拒否 |
| U-FULLSHARD-003 | inventory／partition／shard file digestがcanonical bytesへ一致 | digest据置きのfile変更、partition digest改竄を拒否 |
| U-FULLSHARD-004 | statefulはCLI surfaceとslowだけ、bulkはその補集合 | CLI欠落、slowのbulk混入、fastのstateful混入を拒否 |
| U-FULLSHARD-005 | 全receiptがcandidate HEAD／base／partition／shard／filesへexact binding | wrong HEAD、base、partition、files、unknown shardを個別拒否 |
| U-FULLSHARD-006 | receipt exact set、exit 0、有限かつ正順の時刻 | shard欠落／重複、nonzero、invalid／reverse timeを相殺せず拒否 |
| U-FULLSHARD-CLI-001 | inventory JSONからtyped plan／shard file exact setを返す | malformed inventory、unknown shardを拒否 |
| U-FULLSHARD-CLI-002 | receipt identityをplanからだけ導出する | callerによるHEAD／base／partition／file digest差替えを許可しない |
| U-FULLSHARD-CLI-003 | validator redをtyped JSONとexit 1へ写像する | receipt欠落をsuccess exitへ変換しない |
| U-FULLSHARD-CLI-004 | output digest／exit code／時刻入力を境界検査する | malformed digest、負／非整数exit、invalid timeを拒否 |
| U-FULLSHARD-WF-001 | preflight、4 shard、finalizeをtyped artifactと同一HEAD／baseへ接続し、checkout refはPR headまたはtrusted `github.sha`へ限定 | job／artifact／identity／required aggregateの欠落、schedule／workflow_dispatchでneeds由来candidate HEADをcheckoutする経路を拒否 |
| U-FULLSHARD-WF-002 | receipt exact set検証後だけDB／Biome／doctorを実行 | receipt欠落、wrong partition、fail-open、gate順序短絡を拒否 |
| U-FULLSHARD-WF-003 | preflight 35分、bulk各25分、stateful 30分、finalize 15分のbounded job timeoutとbudget telemetryを固定 | shard timeout、telemetry、timeout検査の削除、job単位の無制限化を拒否 |
| U-CLI-SKILL-DEADLINE-001 | skill injection CLIはprovider-neutral manifest assertionを維持し、30秒以内で完了 | deadline無制限化、30秒超過、assertion削除、対象外CLI oracleの一括緩和を拒否 |
| U-CLI-SKILL-DEADLINE-002 | task route adapter CLIはcontext injection assertionを維持し、30秒以内で完了 | deadline無制限化、30秒超過、assertion削除、routing semantics変更を拒否 |

## 退役済みの旧workflow oracle

次のIDは、同一runner内process group／lane logを現行契約として扱わないことを明示するための
履歴参照であり、実行対象のoracle一覧・現行PLANのverification bindingではない。

| 旧oracle | 退役理由 | 現行の境界 |
|---|---|---|
| `U-IMPACTCI-WF-002` | 独立GitHub Actions job DAGへ移行し、旧同一runner lane集約を廃止 | `U-FULLSHARD-WF-001`／`U-FULLSHARD-WF-002` |
| `U-IMPACTCI-WF-003` | local TERM/INT process-group伝播を現行sliceの契約にしない | cancel／timeout／欠落receiptをfinalizeでfail-close |
| `U-IMPACTCI-WF-005` | jobごとのtyped partition／receiptへ移行し、旧step内inventory／tail logを廃止 | `U-FULLSHARD-001`〜`006`／`U-FULLSHARD-WF-001`〜`003` |

対応する旧PLAN（`PLAN-RECOVERY-11`／`14`／`18`）は、後継の
`PLAN-L7-685-full-regression-shard-jobs` と相互訂正注記を持つ。旧PLANに残るred／green／
review evidenceは過去の実装履歴であり、現行job DAGの実装・キャンセル伝播を証明しない。

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
| U-IMPACTCI-WF-004 | 同一HEAD transition reuse | transition event限定欠落、success絞り込み欠落、full receipt照合欠落、base SHA一致検査欠落、フォールバック欠落、run id検証欠落、receipt発行境界欠落を拒否 | `tests/harness-check-workflow.test.ts` |
| U-IMPACTCI-WF-006 | 非PR revision range正規化 | schedule／workflow_dispatchで空before SHAをHEAD親へ写像し、branch-kind／commitlintの片側だけempty判定を削るmutationを拒否 | `tests/harness-check-workflow.test.ts` |
| U-REPOGUARD-001 | repo-wide guard exact set | registryから1件削除、重複、missing path、未登録guardを拒否 | `tests/repo-wide-guard-registry.test.ts` |
| U-REPOGUARD-002 | 単一entrypoint／preflight配線 | package scriptまたはworkflow step削除、別集合への分岐を拒否 | `tests/repo-wide-guard-registry.test.ts` |
| U-FULLSHARD-001 | deterministic partition | 入力順に依存せずbulk 3件とstatefulへexact partitionする | `tests/full-regression-shards.test.ts` |
| U-FULLSHARD-002 | inventory exact set | missing／duplicate／unknown pathを拒否する | `tests/full-regression-shards.test.ts` |
| U-FULLSHARD-003 | canonical digest | partition／file digest改竄を個別拒否する | `tests/full-regression-shards.test.ts` |
| U-FULLSHARD-004 | stateful boundary | CLI欠落、slowのbulk混入、fastのstateful混入を拒否する | `tests/full-regression-shards.test.ts` |
| U-FULLSHARD-005 | receipt identity | wrong HEAD／base／partition／files／unknown shardを拒否する | `tests/full-regression-shards.test.ts` |
| U-FULLSHARD-006 | terminal exact set | shard欠落／重複、nonzero、invalid／reverse timeを拒否する | `tests/full-regression-shards.test.ts` |
| U-FULLSHARD-CLI-001 | CLI plan | inventory JSONからtyped planとfile exact setを返す | `tests/full-regression-shards-cli.test.ts` |
| U-FULLSHARD-CLI-002 | CLI receipt | identityをplanだけから導出する | `tests/full-regression-shards-cli.test.ts` |
| U-FULLSHARD-CLI-003 | CLI validate | receipt欠落をtyped redとexit 1へ写像する | `tests/full-regression-shards-cli.test.ts` |
| U-FULLSHARD-CLI-004 | CLI boundary | digest、exit code、時刻の不正値を拒否する | `tests/full-regression-shards-cli.test.ts` |
| U-FULLSHARD-WF-001 | workflow DAG | 独立4 shard job、artifact、HEAD／base、required aggregateを検査 | `tests/harness-check-workflow.test.ts` |
| U-FULLSHARD-WF-002 | workflow finalize | receipt exact setとpost-test gate順序を検査 | `tests/harness-check-workflow.test.ts` |
| U-FULLSHARD-WF-003 | workflow timeout | preflight／4 shard／finalizeのbounded timeoutとbudget telemetryを検査し、bulk 25→26 mutationを拒否 | `tests/harness-check-workflow.test.ts` |
| U-CLI-SKILL-DEADLINE-001 | skill injection CLI bounded deadline | provider-neutral manifest assertionを保持し、30秒でfail-close | `tests/cli-surface.test.ts` |
| U-CLI-SKILL-DEADLINE-002 | task route adapter CLI bounded deadline | context injection assertionを保持し、30秒でfail-close | `tests/cli-surface.test.ts` |

## U-CLIBUNDLE-001: spawn テストの bundle 起動等価性（PLAN-RECOVERY-39）

上の 15 件（`L3Q-IT-024` / `tests/impact-ci.test.ts` 群）とは別枠の oracle である。
CI 実行時間の支配項が「CLI bootstrap × spawn 数」であることを受け、spawn 過多な suite の
子 process 起動を `npx --no-install tsx <entry>` から esbuild bundle の `node <bundle>` へ
置換した。この置換は「bundle が tsx と等価に振る舞う」ことに依存するため、その前提自体を検査する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CLIBUNDLE-001 | bundle 起動と tsx 起動の等価性、bundle の ROOT 導出、および ROOT anchor 適合性の build 時検査 | CLI surface と hook 3 シナリオ（malformed stdin の fail-close／破壊的コマンド BLOCK／非破壊コマンド通過）で exit code・stdout・stderr が一致すること。bundle の ROOT が呼び出し元 repoRoot と一致し、実 ROOT 依存 lint module（`src/lint/entity-coverage`）を bundle 越しに実行した結果も tsx 起動と一致すること。深さ 2 以外の repo-local module が `import.meta.url` を使う場合は build を落とし、読めない input や repoRoot 相対でないキーも fail-close すること。ROOT anchor の define 削除、anchor 深さ逸脱、anchor 名と outfile 名の衝突（自己実行判定の誤発火）、hook entrypoint 取り違え、bundle 名衝突、深さ検査の no-op 化、例外 allowlist の wildcard 化、読めない input の silent skip、非相対キーの fail-loud 除去の各 mutation を拒否 | `tests/cli-bundle-equivalence.test.ts` |

fixture: `tests/tools/bundle-root-probe.ts`（ROOT 観測用 entrypoint）、
`tests/tools/root-anchor-fixtures/depth-violation.ts`（深さ 3 かつ `import.meta.url` 使用。
build 時検査が拒否することを固定するためだけに存在し、実行されない）。

### define の影響範囲と build 時検査

esbuild の `define` は entry だけでなく **bundle される全 module** の `import.meta.url` を
置換する。したがって ROOT anchor が成立するのは「repo-local module が全て repoRoot から
2 階層下に在る」という前提の上にある。この前提を prose に残すと、将来別の深さの module が
import graph へ入ったときに無音で壊れるため、`assertRootAnchorCompatible` が
`metafile.inputs` を走査して build 時に fail-close する。例外は理由付き allowlist のみ
（現状 `src/cli.ts`）。検査は「読めないので skip」を許さない — それは本検査が塞ぐ失敗そのものである。

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

## U-TSLAZY-001: compiler 未使用 CLI 経路の typescript 非 load（PLAN-RECOVERY-40）

U-CLIBUNDLE-001 と同じく、CI 実行時間の支配項「CLI bootstrap × spawn 数」に対する oracle だが、
対象は bundle 化ではなく **bootstrap の単価** である。`src/lint` 配下 9 module が top-level で
`import ts from "typescript"` していたため、compiler を一切使わない `helix --version` でも
起動のたびに typescript 実体を load していた（起動 336ms のうち 217ms）。

守る契約は「速いこと」ではなく **「compiler を使わない経路では読まないこと」** である。
時間を閾値にすると実行機差で flaky になるため、oracle は時間を測らず require cache を観測する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-TSLAZY-001 | compiler 未使用 CLI 経路での typescript 非 load と、lazy proxy の解決正当性 | bundle を実起動した process 自身の `require.cache` に typescript が載らないこと。観測子が結果を残さない場合は「読まなかった」ではなく「観測できなかった」として fail-close すること。proxy の property へ触れた時点では実体が load され `createSourceFile` が関数として得られること。import 時 eager load への退行、proxy が実体へ委譲せず `undefined` を返す空洞化（load しないので「速い」が compiler が壊れる）、proxy を迂回して `src/cli.ts` へ直接 `import ts from "typescript"` を戻す退行の各 mutation を拒否 | `tests/typescript-lazy.test.ts` |
| U-TSLAZY-002 | shared lazy loader の唯一実装と canonical consumer exact set | runtime loader 実装が `src/shared/typescript-lazy.ts` の1件、canonical direct consumerがlint 9件＋requirements 1件、旧 `src/lint/typescript-lazy.ts` が実装なしre-export shim、旧path importerが0件であること。局所 accessor 復活、旧path import復活、consumer欠落／余剰を拒否 | `tests/typescript-lazy.test.ts` |
| U-TSLAZY-003 | lint-wiring上の互換shim分類 | `src/lint/typescript-lazy.ts` は理由付き `DEFERRED_LINTS`、canonical consumerはruntime到達済みshared pathとして分類すること。shim未登録はunwired、旧path importer復活はstale-deferredとして拒否 | `tests/lint-wiring.test.ts` |
| IT-SBOUND-007 | requirements owner と shared leaf の正負方向 | `requirements -> shared` は明示allowし、exception除去mutationはdefault denyへ戻す。`requirements -> lint` と `shared -> requirements` は継続denyし、広すぎる許可やcycleを拒否 | `tests/source-boundary-integration.test.ts` |

fixture: `tests/tools/typescript-load-probe.cjs`（`node --require` で先読みし、`process.on("exit")` で
当該 process の `require.cache` を検査して `HELIX_TS_PROBE_OUT` のファイルへ書く観測子。
stdout は CLI 出力の assert に使うため汚さない。CLI が自前 `process.exit` で終了しても観測できる）。

### 観測対象を「別 process の単体 import」にしない理由

初版の oracle は、bundle 実起動については exit code と stdout しか見ておらず、require cache は
別 process で `src/lint/typescript-lazy.ts` を単体 import した場合を見ていた。これでは proxy を
迂回して `src/cli.ts` 側に直接 typescript を import し直す退行を検知できない（review round1 の指摘）。
実際、その退行を mutation として与えると初版は green のまま通り、観測対象を実起動 process へ
移した現行 oracle だけが `expected 'true' to be 'false'` で kill する。

### shared leaf への移設後も path と実装数を直接観測する理由

遅延loadだけを検査しても、lintとrequirementsが別々のlazy accessorを持つ重複はgreenになり得る。
また旧loader pathを残したままテストだけ新pathへ向けると、production consumerが旧実装へ戻る退行を見逃す。
そのため `U-TSLAZY-002` はsource treeを走査し、loader実装1件、canonical direct consumer 10件、
旧shim exact body、旧import 0件を集合として固定する。`IT-SBOUND-007` は共有化に必要な1方向だけをallowし、
隣接する2方向を明示的な負例にしてmodule-level permissionの過剰拡張を防ぐ。
さらに `U-TSLAZY-003` は、互換shimを無根拠な死蔵allowlistへ落とさず、confirmed artifact維持という
理由を持つdeferred分類として固定する。canonical consumerが旧pathへ戻ればstale-deferredになるため、
artifact存在互換とruntime配線の両方を同じmeta-gateで監視できる。

## U-CLI-SKILL-DEADLINE-003: wrapper deadline budget順序

`tests/cli-surface.test.ts`のchild deadlineを45秒に維持し、対象2 oracleのwrapper deadlineが
正の有限marginを加えた導出値であることをsource oracleで検査する。marginを0以下へ戻す、
対象oracleを30秒literalへ戻す、child deadlineを緩和して見かけ上greenにするmutationを拒否する。
