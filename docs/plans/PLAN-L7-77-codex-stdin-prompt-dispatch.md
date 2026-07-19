---
plan_id: PLAN-L7-77-codex-stdin-prompt-dispatch
title: "PLAN-L7-77 (troubleshoot): codex dispatch は prompt を stdin 経由で渡し、Windows .cmd shell-wrapping による multi-line prompt の切り詰めを防ぐ"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-19
updated: 2026-06-19
backprop_decision: not_required
backprop_decision_reason: "harness 内部の self-application tooling（lint gate / runtime dispatch / guard / governance mechanism）を強化する変更であり、product の外部 requirement / design / test-design contract は変更しないため、upstream backprop 対象はない。"
owner: PM (Opus) / PO (人間)
parent_design: docs/design/harness/L6-function-design/function-spec.md
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "live 再現済み defect: Windows では helix codex --execute が codex を codex.cmd として解決し、buildProviderInvocation が .cmd を単一の shell:true cmd.exe command string に包む。そのため multi-line / metacharacter task prompt は最初の newline で切り詰められる（cmd.exe は newline で分割し、< > | ( ) を operators として扱う）。連続 2 回の live cross-review dispatch で、受信されたのは prompt の先頭行だけだった。root cause は deterministic な buildProviderInvocation probe で検証した。修正: codex prompt は stdin 経由で渡す（codex exec [PROMPT]: '-' または positional なしは stdin を読む）ため、command line には固定 flags のみが載り、cmd.exe wrapper は prompt を壊せない。U-ADAPTER-007 で coverage 済み（Red→Green: prompt は args と wrapped shell command string に現れず、plan.stdin に保持される）。typecheck / Biome / full Vitest / doctor は green。full prompt を受け取る multi-line codex exec で live end-to-end を再確認した。"
    worker_model: claude-opus-4-8
    reviewer_model: gpt-5.5
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: Codex prompt stdin dispatch と argv 非混入 contract が現HEADの fast suite で壊れていないことを再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bun run test:fast"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: tl
    slot_label: "TL - codex stdin prompt dispatch reliability 修正"
generates:
  - artifact_path: docs/plans/PLAN-L7-77-codex-stdin-prompt-dispatch.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/team/run.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-77 (troubleshoot): codex stdin prompt dispatch の修正

## 0. 目的

hybrid の cross-review 経路（`helix codex --execute`, `helix team run
--route`）は、Windows で実 prompt を無音で切り詰める。`codex` は
`.cmd` shim として解決され、`buildProviderInvocation` は `.cmd` invocation を単一の
`shell: true` cmd.exe command string に包む。cmd.exe はその string を最初の
newline で分割し、`< > | ( )` を operators として扱うため、multi-line /
metacharacter task prompt は先頭行だけに切り詰められる。連続 2 回の live
cross-review dispatch により、Codex が受け取ったのは prompt の先頭行だけだと確認した。
これは A-137 provider-dispatch 作業に残っていた「live end-to-end が未実行」という残余が、
実 defect（presence ≠ usable）として表面化したものである。Claude は
`claude.exe` として解決されるため影響を受けない（`shell: false`、argv は直接渡される）。

## 1. スコープ

対象範囲（verified-present reliability fix）:

- **`src/runtime/adapter.ts`** — `AdapterPlan` gains `stdin?: string`.
  codex 向けの `buildAdapterPlan` は `args = ["exec", -m <model>, "-"]` を出力し
  （inline prompt なし）、`stdin = task` を設定する。`codex exec [PROMPT]` は
  positional が `-`（または未指定）の場合に stdin から instructions を読む。Claude は
  変更しない（`--print … -p <task>`、stdin なし）。`claude.exe` は shell-wrapped ではない。
- **`src/cli.ts`** — `helix <provider>` execute path（`spawnSync`）は piped
  stdin として `input: plan.stdin` を渡す。`helix team run --execute` の
  `runCommand` は child に `stdin` を書き込む。Prompt は cmd.exe command line に載らない。
- **`src/team/run.ts`** — `TeamRunnerDeps.runCommand` carries `stdin`;
  `executeMember` forwards `member.adapter.stdin`.

対象外:

- Claude prompt delivery（影響なし。`claude.exe` は `.cmd` ではない）。
- legacy local HELIX `cli/codex` guard shim（2026-06-19 に別途削除済み。
  この code path とは無関係）。

## 2. 受入条件

- codex 向けの `buildAdapterPlan` は task を `args` ではなく `plan.stdin` に保持する。
  `args` は `exec` と `-` stdin sentinel を含み、prompt text は含まない。
- multi-line / metacharacter prompt は、codex 向けに
  `buildProviderInvocation` が包んだ cmd.exe command string に現れない。
- Claude はこの PLAN では変更しない。PLAN-L7-78 が Claude task text を
  `plan.stdin` へ移す follow-up を supersede する。
- typecheck / Biome / full Vitest / `helix doctor` は green を維持する。src はこの
  PLAN `generates` に trace する。
- live 再確認: `helix codex --execute` 経由の multi-line `codex exec` が full prompt を受け取る
  （cross-review 経路の復旧）。

## 3. Test Design 対応

unit test design entry は `docs/test-design/harness/L7-unit-test-design.md`
（U-ADAPTER-007）。Red→Green: 修正前は multi-line prompt が wrapped shell command string に
埋め込まれていた（truncatable）。修正後は stdin で保持され、args と command string には現れない。

## 4. 状態

confirmed。2026-06-19 に実装および検証済み。
