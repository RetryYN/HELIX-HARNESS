---
plan_id: PLAN-RECOVERY-40-lazy-typescript-cli-startup
title: "PLAN-RECOVERY-40 (recovery): CLI 起動時の typescript eager load を除去して spawn 単価を下げる"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 #93のCI高速化タスクを進めていくこと（CI 実測で cli-surface が単独 19.5%）"
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: U-TSLAZY-001
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "src/lint 配下 9 module が top-level で `import ts from \"typescript\"` していたため、cli.ts の import graph 経由で **compiler を使わない command でも** 起動のたびに typescript 実体を load していた。実測: `helix --version` 336ms のうち 217ms が typescript load（`node -e \"import('typescript')\"` 単体 236ms − baseline 19ms）。CPU profile では 320ms 中 216ms が Node の module 読込機構（detectModuleFormat / cjs-module-lexer / compileSourceTextModule）で、CLI 自身のコードは 7.9ms"
contract_postconditions: "src/lint/typescript-lazy.ts が property access 時に初めて実体を load する proxy を提供し、9 module は import 行のみ差し替える（236 箇所の `ts.X` call site は不変）。型位置は `import type * as TS` を使う。compiler を使わない CLI 経路では typescript が module cache に載らない（bundle 実起動 process 自身の require cache を `--require` 観測子で直接検査する）。`helix --version` 336ms -> 126ms、`helix task classify --json` 326ms -> 124ms（実測 median、5 回）"
contract_invariants: "検査範囲を減らさない（test 削除・skip・timeout 緩和をしない）。lint の判定結果は不変であり、遅延の先で compiler は正しく解決される。時間そのものを oracle の閾値にしない（実行機差で flaky になるため、守る契約は『速いこと』ではなく『compiler を使わない経路では読まないこと』）"
contract_failures: "compiler 未使用経路で typescript が load される（eager 退行）、proxy が実体へ委譲せず undefined を返す（速いが壊れている）、proxy を迂回して cli.ts へ直接 typescript を import し直す（bundle 実起動 process の require cache で検知）を U-TSLAZY-001 で fail-close する"
tdd_red_required: true
red_at: "2026-08-09T07:44:00Z"
green_at: "2026-08-09T07:55:02Z"
mutation_oracle_evidence: "tests/typescript-lazy.test.ts が 3 mutation をいずれも exit 非 0 で kill することを実測済み（3/3）: (1) `loaded` を import 時に初期化して lazy を無効化する eager 退行、(2) proxy の get が実体へ委譲せず undefined を返す（load はしないので『速い』が compiler が壊れる）、(3) proxy を迂回して src/cli.ts へ直接 `import ts from \"typescript\"` を戻す退行（kill 位置 tests/typescript-lazy.test.ts:64、`bundle process loaded typescript: expected 'true' to be 'false'`）。(3) は review round1 の是正で追加した bundle 実起動 probe だけが検知でき、強化前の oracle では green のまま通っていた。**通常の red→green ではない**: 実装は CPU profile による原因特定が先行したため、oracle の有効性は事後の mutation で実証した（red_at は mutation による red 実証時刻）。(2) を入れているのは、(1) だけだと『typescript を一切使わない』実装でも green になり、検査が空洞化するため"
complexity_effect: justified_positive
complexity_justification: "新規 module 1 本（proxy）と 9 行の import 差し替えのみ。call site 236 箇所と lint の判定ロジックは不変で、CLI 表面・CI step も増やさない"
removal_trigger: "Node の module load が十分速くなる、または lint 群が typescript compiler API へ依存しなくなった時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: tests/typescript-lazy.test.ts
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-TSLAZY-001, test_path: tests/typescript-lazy.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — CI 実測から支配項（cli-surface 242s / 221 spawn）を特定" }
  - { role: se, slot_label: "SE — typescript lazy proxy と import 差し替え" }
  - { role: qa, slot_label: "QA — U-TSLAZY-001 module cache oracle" }
  - { role: tl, slot_label: "TL — 遅延化による lint 判定の不変性" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-40-lazy-typescript-cli-startup.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/typescript-lazy.ts, artifact_type: source_module }
  - { artifact_path: tests/typescript-lazy.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/typescript-load-probe.cjs, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-39-spawn-bundle-rollout.md
  requires: []
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T07:55:02Z"
    tests_green_at: "2026-08-09T07:55:02Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLI が usage limit 継続中のため規定代替の intra_runtime_subagent として、Claude code-reviewer（claude-sonnet-5, read-only）が 2 ラウンドでレビューした。round1 request_changes（Important 1）: 第1テストは『CLI 経路は typescript を load しない』と称しながら、bundle 実起動については exit code と stdout しか見ておらず、require cache を見ているのは別 process での単体 module import だった。proxy を迂回して src/cli.ts へ直接 typescript を import し直す退行を検知できない空洞化である。是正: tests/tools/typescript-load-probe.cjs を新設し、`node --require <probe> <bundle> --version` として **検査対象 process 自身**の require.cache を process.on('exit') で検査、結果を HELIX_TS_PROBE_OUT のファイルへ書く（stdout は CLI 出力 assert 用に汚さない。CLI が自前 process.exit で終了しても観測できる）。観測子が結果を残さない場合は『読まなかった』ではなく『観測できなかった』として fail-close する。round2 approve（Critical 0 / Important 0 / Minor 2）。Minor の temp ディレクトリ未 cleanup は afterAll の rmSync で解消した。Minor の『src/lint/shared.ts の `import type ts` と新規 9 module の `import type * as TS` の命名二重化』は本 slice では未対応とし、shared.ts を触る回で揃える（reviewer も『型上の実害なし、ブロッカーにしない』と同意）。**自分の測定誤りの訂正**: 変異 3 の初版は shebang より前に import 行を挿入していたため esbuild の構文エラーで落ちており、oracle による kill ではない偽 kill だった。shebang 直後へ挿入し直して測り直し、kill 位置が tests/typescript-lazy.test.ts:64（`bundle process loaded typescript: expected 'true' to be 'false'`）であること、同時に run.status===0 / stdout==='0.1.0' は通過していることを確認した。reviewer も変異 3 を独立に再現し、同一 assert での真の kill であることを実測した。強化前の oracle ではこの退行は green のまま通っていた。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/typescript-lazy.test.ts tests/digest.test.ts tests/impl-plan-trace.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/coding-rules.test.ts tests/harness-check-workflow.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T07:55:02Z", evidence_path: tests/typescript-lazy.test.ts, output_digest: "sha256:8b3098ef89df14de07906b86001241b208013594a5584e6b7e4547658811c267", result: "7 files / 114 tests green、skip 0（U-TSLAZY-001 と、import 差し替えの影響を受ける digest inventory / trace / binding / lane 系）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T07:55:02Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力なし）" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T07:55:02Z", evidence_path: biome.json, output_digest: "sha256:fd66340e73209a75b3aac158d4f7ac0ea4652707aa2243f6cd810a47000b95f4", result: "exit 0（error 0。warning 18 は全て本 diff 外のファイル由来で純増 0。内訳を grep で列挙して確認済み: l12-hybrid-recognition.ts / worker-isolation-broker.test.ts / review-evidence.test.ts / slot-scheduler-mutation / l3-progression-authority.test.ts）" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-09T07:55:02Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-09T07:55:02Z"
    evidence_digest: "sha256:b6d1bd46569824f63ceb5418d87818885f1062df82a77fcbc974da6444e75fcb"
  entries: []
---

# PLAN-RECOVERY-40: CLI 起動時の typescript eager load 除去

## 経緯（測る対象を 3 回間違えた記録）

本 slice に至るまで、対象の選定を 3 回誤った。同じ誤りを繰り返さないため経緯を残す。

1. backlog の課題名は「`tests/slow/doctor.test.ts`（約 175 秒）の分割」だった。しかし
   `vitest.config.ts` は `maxWorkers: 1` であり、分割しても逐次実行のままで短縮しない。
   さらに `liveDoctor()` は `??=` でメモ化されているため、**分割すると memo が分断され
   ファイル数だけ live doctor が多重実行される**。実測: 1 ファイル 173.6 秒 -> 2 ファイル 353.1 秒。
   課題名どおりに実装していれば CI を遅くしていた。
2. 次に doctor 本体（ローカル 156.6 秒）を対象にした。しかし per-check 計測を当てると
   `projectRuntimeModelTelemetryForDoctor` が 75.1 秒（約半分）で、その中身は
   `~/.claude/projects` と `~/.codex/sessions` の走査だった。**CI ランナーにはセッション履歴が無い**。
3. CI のステップ別時間を取ると doctor は 70 秒で、vitest ステップが 15 分 08 秒（ジョブの 9 割超）。
   ローカル計測を CI のコストだと暗黙に仮定していたのが誤りだった。

CI 実測（410 ファイル、合計 1,242 秒）では `tests/cli-surface.test.ts` が 242.2 秒で単独 19.5%、
上位 6 ファイルで 50% を占める。以後の判断は CI 実測を基準にする。

## 原因

`cli-surface` は 87 ケースで 221 spawn（1 ケース 2.5 回）。同一 cwd + 同一引数の重複は
**3%（221 中 7 件）**しかなく、dedup では効かない。対象は単価だった。

ローカル実測:

| 対象 | median |
|---|---|
| 素の `node -e 0` | 19ms |
| `import('typescript')` のみ | 236ms |
| `cli --version` | 336ms |
| `cli task classify --json` | 326ms |

`--version` と `task classify` の差が 10ms しかない。つまりコマンド本体ではなく**起動固定費**が
すべてであり、その 217ms が typescript だった。CPU profile も一致する（320ms 中 216ms が
`detectModuleFormat` / cjs-module-lexer / `compileSourceTextModule`、CLI 自身のコードは 7.9ms）。

## 修正

`src/lint/typescript-lazy.ts` は property access 時に `createRequire` で実体を load する proxy。
9 module は **import 行だけ**差し替え、236 箇所の `ts.X` call site は書き換えない。

型としての `ts.SourceFile` は proxy 経由では書けないため、型位置は
`import type * as TS from "typescript"` を使う。どこが型位置かは**推測せず tsc のエラー駆動**で
特定した（`: ts.` の一括正規表現は `{ target: ts.ScriptTarget.Latest }` のような値位置まで
巻き込んで失敗したため撤回した）。

## 効果（実測、median 5 回）

| | 変更前 | 変更後 |
|---|---|---|
| `cli --version` | 336ms | **126ms** |
| `cli task classify --json` | 326ms | **124ms** |

1 spawn あたり約 210ms。`cli-surface` の 221 spawn だけでローカル約 46 秒に相当する。
CI の削減幅は**未実測なので主張しない**（2-core 競合下では 1 spawn あたり約 1.1 秒であり、
固定費の比率は異なる）。効果は spawn 系 suite 全体と、日常の `helix` コマンド全部にも及ぶ。

## oracle が時間を測らない理由

速度を閾値にすると実行機差で flaky になり、かつ守りたい契約は「速いこと」ではなく
**「compiler を使わない経路では読まないこと」**である。U-TSLAZY-001 は require cache を直接観測する。

観測対象は **bundle を実起動した process 自身**である。初版は別 process で
`src/lint/typescript-lazy.ts` を単体 import したときの cache を見ていたが、それでは
proxy を迂回して `src/cli.ts` へ直接 `import ts from "typescript"` を戻す退行を検知できない
（review round1 の指摘）。`tests/tools/typescript-load-probe.cjs` を `--require` で先読みさせ、
`process.on("exit")` で当該 process の `require.cache` を検査し、結果をファイルへ書く
（stdout は CLI 出力の assert に使うため汚さない）。観測子が結果を残さなかった場合は
「読まなかった」ではなく「観測できなかった」として fail-close する。

「load しない」だけを固定すると、typescript を一切解決しない壊れた proxy でも green になる。
そのため「property へ触れたら実体を load し、`createSourceFile` が関数として得られる」ことを
同じ oracle で押さえ、mutation (2) で空洞化を検出できることを実証した。

## §3 工程表

### Step 1: CI 実測で支配項を特定 [直列]

根拠: downstream_dependency（ローカル計測は CI と乖離することが判明済み）。

### Step 2: spawn の重複率と起動固定費を分離計測 [直列]

根拠: downstream_dependency（dedup か単価かで打ち手が変わる）。

### Step 3: lazy proxy 実装と import 差し替え → 型位置を tsc 駆動で是正 [直列]

根拠: file_conflict（9 module の import が同一 proxy へ集約する）。

### Step 4: oracle 追加と mutation による有効性実証 [直列]

根拠: downstream_dependency（遅延化の妥当性を固定する検査）。

### Step 5: review → confirm → commit → PR → CI → merge → Issue #93 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一 owner 収束）。

## §3.1 実装計画

情報源: CI job log のファイル別実測、`--cpu-prof` の self time、`spawnSync` key の重複計数。
`src/lint/typescript-lazy.ts` を新設し、`import ts from "typescript"` を持つ 9 module の
import 行のみ差し替える。call site・引数・期待値・lint 判定は変えない。
型位置は tsc の TS2833 を潰す形で `TS.` へ移す。

## 後続（本 PLAN 非対象）

- `cli-surface` の残コスト（1 spawn 約 1.1 秒のうち固定費を除いた部分）の内訳特定
- 性能スライス候補2（lane 再配置）・候補3（1 case あたりの spawn 数削減）
- ローカル doctor の `projectRuntimeModelTelemetryForDoctor` がセッション履歴に比例して
  無限に遅くなる件（CI には無関係だが開発体験として実在する欠陥。別 Issue 起票が必要）
