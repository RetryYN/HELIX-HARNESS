---
plan_id: PLAN-RECOVERY-56-codex-spawn-enobufs
title: "PLAN-RECOVERY-56 (recovery v2): Codex provider spawn の ENOBUFS を正しく回復する"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-13 Issue #602: ENOBUFS の実発生経路を特定し、PR #607 の誤修正を是正する"
  - "independent_review:PR #607 terminal NO-GO: inherit stdio 経路への maxBuffer は無効で behavioral test がない"
created: 2026-08-12
updated: 2026-08-13
owner: Codex / TL
github_issue_id: 602
engineering_discipline_required: true
behavior_contract_id: CODEX-SPAWN-BUFFER-602
responsibility_owner: codex-adapter-runtime
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "provider adapter が構築した command/args/env と stdin を維持し、直接実行は stdout/stderr の inherit または JSON 用 fd 2、pair-agent は provider protocol output を捕捉する"
contract_postconditions: "provider 実行を async spawn の stream boundary へ移し、stdin を明示的に end し、pair-agent は Node の spawnSync capture 上限による ENOBUFS なしに protocol output を解析できる"
contract_invariants: "provider の command/args、adapterExecutionEnv、shell、windowsVerbatimArguments、JSON stdout 専用契約、admission、team runner、provider probe の挙動は変更しない"
contract_failures: "provider output が既定の同期 capture buffer で ENOBUFS になる、stdin EOF が送られず direct 実行が待ち続ける、または PR #607 と同じ source-only oracle に戻る場合は fail-close する"
tdd_red_required: true
red_at: "2026-08-13T03:29:24+09:00"
green_at: "2026-08-13T03:39:07+09:00"
red_commit: d31f371a
mutation_oracle_evidence: "tests/provider-spawn-buffer.test.ts の U-ISSUE602-001/002 は fake provider の 2 MiB output と約 1.3 MiB stdin を実プロセス境界で通す。実装前 HEAD (red_commit d31f371a) では 2 tests failed (red: 同期 capture の ENOBUFS で pair-agent が status 1、direct codex が stdin 詰まりで timeout)。async spawn 修正後は同 2 tests passed"
complexity_effect: net_neutral
agent_slots:
  - { role: aim, slot_label: "AIM — Issue #602 の provider spawn callsite と adapter 経路を証拠付きで切り分ける" }
  - { role: se, slot_label: "SE — provider capture と stdin EOF の async boundary を実装する" }
  - { role: qa, slot_label: "QA — ENOBUFS と stdin 回帰を実プロセス behavioral test で固定する" }
  - { role: tl, slot_label: "TL — PR #607 の誤修正を排除し、契約・差分・push を確認する" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-56-codex-spawn-enobufs.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/provider-spawn-buffer.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires: []
  blocks:
    - "issue:602"
  references: []
---

# PLAN-RECOVERY-56：Codex provider spawn の ENOBUFS 回復 v2

## §1 Recovery 判断と PR #607 の反省

Issue #602 の再調査では、PR #607 の前提を採用しない。PR #607 は `runtimeCommand()` の
`spawnSync` に `maxBuffer` を追加したが、その callsite は provider の stdout/stderr を
`inherit`（`--json` 時は fd 2）へ接続しており、parent 側の capture buffer を使わない。
したがって、そこへの `maxBuffer` 追加は ENOBUFS を解消する修正にならない。また、同 PR の
test は source の文字列を検査するだけで、provider を起動して失敗を再現する behavioral
oracle ではなかった。このため PR #607 は Terminal NO-GO とする。

## §2 実経路と根因の証拠

- `src/cli.ts` の `runtimeCommand()` は provider の stdout/stderr を inherit/fd 2 へ流す。
  制御実験で同じ `spawnSync` に 1 MiB の `maxBuffer` を与えても inherit 経路は正常終了し、
  provider output の capture による ENOBUFS は発生しなかった。
- 実際に provider output を捕捉する `defaultPairAgentExecutor()` は、修正前に
  `spawnSync(..., { encoding: "utf8", input })` を使っていた。明示的な `stdio` がないため
  Node の stdout/stderr pipe と既定の同期 capture 上限が適用される。2 MiB を出力する fake
  provider の制御実験では、約 1.1 MiB を捕捉した時点で `error.code=ENOBUFS`、`status=null`
  となった。これが Issue #602 の ENOBUFS の発生経路である。
- `src/runtime/adapter.ts` の provider spawnability probe は `stdio: "ignore"` であり、
  output capture の ENOBUFS 経路ではない。`team run` の provider 実行は既に async spawn
  と明示的な stream 処理を使っているため、今回の主対象ではない。
- 直接 `codex --execute` は output capture ではないが、修正前の同期 `input` 境界では大きな
  prompt を伴う制御 behavioral test が timeout した。stdin を async stream で書き、EOF を
  明示することでこの同時発生する待機不具合も回復する。
- env サイズ超過や別の捕捉付き provider callsite を根因とする証拠は得られなかった。

## §3 v2 方針と変更

- `defaultPairAgentExecutor()` の provider 実行を `spawnSync` から async `spawn`＋pipe に変更
  し、stdout/stderr を data stream で受けて protocol output 全体を `normalizeInvokeResult`
  へ渡す。これにより `child_process` の同期 `maxBuffer` に依存しない。
- `runtimeCommand()` の直接実行も async `spawn` に揃え、prompt がある場合は stdin を書いた後
  `end()` する。JSON 時は provider stdout を fd 2、実行結果 JSON を parent stdout へ置く既存
  契約を維持する。
- command/args、adapter env、shell flags、admission、provider probe、team runner は変更し
  ない。PR #607 の `maxBuffer` literal は追加しない。

## §4 TDD と behavioral test

### §4.1 Red

実装前の `d31f371a` で `tests/provider-spawn-buffer.test.ts` を追加し、次を実行した。

```text
node node_modules/vitest/vitest.mjs run --project fast tests/provider-spawn-buffer.test.ts
```

修正前は 2 test が失敗した。pair-agent の 2 MiB provider output は同期 capture 経路で
status 1 となり、direct codex の大きな stdin は timeout となった。

### §4.2 Green と回帰境界

同じ test command は修正後に `Test Files 1 passed / Tests 2 passed` となった。U-ISSUE602-001
は provider の probe を除く実行で 2 MiB 超の output、RED→implementation→review の TDD
protocol、最終 verdict を確認する。U-ISSUE602-002 は約 1.3 MiB の task file を stdin へ
送り、provider が EOF 後に正常終了し、JSON exit code が 0 になることを確認する。

追加検証の結果は次のとおりである。

- `tsc --noEmit`: exit 0。
- `biome check src/cli.ts tests/provider-spawn-buffer.test.ts`: exit 0。
- `runtime-adapter.test.ts` と `runtime.test.ts`: 2 files / 33 tests passed。
- fast suite 全体は実行を開始したが、既存の CLI surface / pair-agent / hook fixture で
  sandbox の `tsx` IPC pipe `EPERM` と nested `git` spawn `EPERM` が大量に発生した。変更とは
  無関係な環境制約を baseline failure として確認した後、長時間実行を exit 130 で停止したため、
  fast suite 全体を green とは主張しない。

## §5 非対象と完了条件

非対象は provider の output を恣意的に切り詰めること、adapter admission の変更、team runner
の再設計、環境変数・credentials の変更、PR #607 の再利用である。

完了条件は次のとおりとする。

- behavioral test が Red→Green で記録され、targeted test/typecheck/lint が green になる。
- `src/cli.ts`、`tests/provider-spawn-buffer.test.ts`、本 plan のみを明示 path で stage する。
- fix commit は `fix:` prefix、Claude trailer なしとする。
- branch `recovery/codex-spawn-enobufs-602-v2` を `origin/main` から作成し、push を試行する。
  push が外部 DNS/認証などで失敗した場合は、commit SHA と失敗理由を handoff に明記し、成功を
  偽って報告しない。
