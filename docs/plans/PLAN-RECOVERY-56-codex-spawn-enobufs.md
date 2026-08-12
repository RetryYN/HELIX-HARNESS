---
plan_id: PLAN-RECOVERY-56-codex-spawn-enobufs
title: "PLAN-RECOVERY-56 (recovery): Codex provider spawnSync の ENOBUFS を回復する"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-12 Issue #602: provider output が 1 MiB を超えると Codex adapter の spawnSync が ENOBUFS で失敗する"
created: 2026-08-12
updated: 2026-08-12
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
contract_preconditions: "src/cli.ts の runtime provider command は admitted.stdin を使う spawnSync に Node の既定 maxBuffer を設定していないため、大きな provider stdout/stderr を扱う起動で ENOBUFS になり得る"
contract_postconditions: "provider の spawnSync options に 64 MiB の maxBuffer を渡し、Codex prompt の stdin 経路と既存の stdio、環境、shell 設定を変更せずに 1 MiB 超の出力を許容する"
contract_invariants: "provider invocation の command/args、admitted.stdin、stdio、adapterExecutionEnv、shell、windowsVerbatimArguments、および非 provider の spawnSync callsite は変更しない"
contract_failures: "provider spawn options から maxBuffer が欠落する、値が 64 MiB 未満になる、または別の spawnSync callsiteへ誤って適用される場合は U-ISSUE602-001 が fail する"
tdd_red_required: true
red_at: "2026-08-12T22:52:14+09:00"
green_at: "2026-08-12T22:57:43+09:00"
mutation_oracle_evidence: "実装前に tests/provider-spawn-buffer.test.ts::U-ISSUE602-001 を実行し、対象 spawn options に maxBuffer が無いため 1 failed になることを確認した。修正後は同 test が 1 passed となり、64 MiB literal の欠落 mutation を検出できることを確認した"
complexity_effect: net_neutral
agent_slots:
  - { role: aim, slot_label: "AIM — Issue #602 の provider spawnSync callsite と既存回帰網の棚卸し" }
  - { role: se, slot_label: "SE — admitted.stdin 経路へ maxBuffer を追加する最小修正" }
  - { role: qa, slot_label: "QA — provider spawn options の maxBuffer 回帰 oracle" }
  - { role: tl, slot_label: "TL — ENOBUFS 回復範囲と既存 stdio 契約の確認" }
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

# PLAN-RECOVERY-56：Codex provider spawnSync の ENOBUFS 回復

## §1 Recovery 判断

Issue #602 は、Codex provider が 1 MiB を超える出力を返すと `src/cli.ts` の provider
`spawnSync` が `ENOBUFS` で終了し、adapter 実行結果を返せなくなる問題を扱う。原因は
`input: admitted.stdin` を使う実行 callsiteに `maxBuffer` が無く、Node の既定上限へ依存している
ことである。本変更は provider 起動の既存契約を保ったまま、出力上限だけを明示する recovery とする。

## §2 変更範囲

- `src/cli.ts` の `runtimeCommand()` 内 provider `spawnSync` options に
  `maxBuffer: 64 * 1024 * 1024` を追加する。
- `tests/provider-spawn-buffer.test.ts` に、`admitted.stdin` を受ける対象 callsiteへ
  64 MiB の `maxBuffer` が渡されることを固定する unit regression test を追加する。
- `docs/plans/PLAN-RECOVERY-56-codex-spawn-enobufs.md` に Issue、契約、生成物を登録する。

## §3 TDD と検証

### §3.1 Red

実装前に `U-ISSUE602-001` を追加し、現行 source に対象 callsite の `maxBuffer` が無いため
失敗することを確認した。既定値に依存する欠陥を、実装前の Red として記録する。

### §3.2 Green

修正後に targeted Vitest と TypeScript typecheck を実行する。回帰 test は対象 callsiteの
`input: admitted.stdin`、`maxBuffer` の値、および callsiteの存在を同時に検査する。

## §4 非対象

- `defaultPairAgentExecutor()`、team runner の streaming spawn、closure probe など別の
  `spawn` / `spawnSync` callsiteのバッファ方針。
- provider の出力を切り詰める仕様、prompt の内容、adapter admission、Issue #602 の PR/merge。

## §5 完了条件

- `U-ISSUE602-001` が green になる。
- `npx --no-install tsc --noEmit` が green になる。
- 変更は `src/cli.ts`、`docs/plans/`、`tests/` の許可範囲に限定される。
- commit message は `fix:` prefix とし、明示 path のみを stage する。push/PR/merge はこの
  worker の範囲外として Claude laneへ引き渡す。
