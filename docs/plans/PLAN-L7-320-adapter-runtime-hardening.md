---
plan_id: PLAN-L7-320-adapter-runtime-hardening
title: "PLAN-L7-320 (impl): adapter runtime hardening — 安全 Windows spawn (shell:false) + InvokeResult/error-policy 分類 + provider effort 正規化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-318 の adapter 側残置 scope を L7 実装として閉じるものであり、新規 product requirement や上位設計の意味変更を追加しない。Windows command-script 起動の安全化、InvokeResult 分類、provider effort 正規化を既存 adapter 境界へ接地した。"
owner: Claude (Opus) / Codex
parent_design: docs/design/harness/L5-detailed-design/if-detail.md
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — adapter を shell:false + windowsVerbatimArguments + ComSpec 起動へ移行、InvokeResult/normalizeInvokeResult と normalizeProviderEffort を実装"
  - role: tl
    slot_label: "TL/security — model-launch path の shell:true 排除の安全境界レビュー、PLAN-L7-318 (schema entrypoint) との整合"
  - role: qa
    slot_label: "QA — malformed_output(exit0+empty stdout) / provider_error 分類と Windows argv verbatim の回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-320-adapter-runtime-hardening.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/loop-bridge.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/pair-agent.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L5-detailed-design/if-detail.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
    - docs/plans/PLAN-L7-318-model-override-injection-hardening.md
review_evidence:
  - reviewer: gibbs-subagent-and-codex
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T02:57:55+09:00"
    tests_green_at: "2026-07-05T02:57:55+09:00"
    verdict: approve
    scope: "PLAN-L7-320 の adapter runtime hardening を実装した。Windows .cmd/.bat provider command は shell:true 文字列ではなく cmd.exe /d /s /c の明示 command/args、shell=false、windowsVerbatimArguments=true とし、cmd.exe 解釈対象 token は quote 済みかつ unsafe 文字を拒否する。InvokeResult / normalizeInvokeResult は provider_error と malformed_output を分類し、pair-agent executor が分類を受け取る。normalizeProviderEffort は既存実装を維持し、README / READE は gate・証跡・完了条件に紐づけていない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime-subagent
    green_commands:
      - kind: unit_test
        command: "bun test tests/runtime-adapter.test.ts tests/pair-agent.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T02:57:55+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:d4dca3f9371586392f6b08090c560a853f7f77678fb031d787562b2c16eb4b06"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T02:57:55+09:00"
        evidence_path: src/runtime/adapter.ts
        output_digest: "sha256:c59427f83bf82a25028783727e4c75d95fd0bcc2aa5d16f2e2f94881aa0a5d4b"
---

# PLAN-L7-320 (impl): adapter runtime hardening の実装

## Objective

上流突合の completeness pass（audit §6.2）で、上流 `src/runtime/adapter.ts`（pr2）が LOCAL に無い 3 能力を
持つと確認した。LOCAL は `shell:true`（`src/runtime/adapter.ts:239`）で model-launch する。上流実装を
参考に HELIX 式で hardening する。これは PLAN-L7-318（schema entrypoint 対策）の adapter 側残置 scope を閉じる。

1. **安全 Windows spawn**: 上流は `shell:false` + `windowsVerbatimArguments:true` + ComSpec 経由の cmd.exe
   `/d /s /c` 起動で、argv に固定 flag のみ載せる。LOCAL の `shell:true` + 手動 `quoteCmdArg` 文字列連結を置換。
2. **InvokeResult / normalizeInvokeResult**: provider 失敗を `error_class: provider_error`（非零 exit / spawn error）と
   `malformed_output`（exit 0 だが stdout 空）に構造化分類（上流 L7-176/177）。LOCAL の `defaultPairAgentExecutor`
   （`src/cli.ts` 付近）は raw `{status, stdout, stderr}` を返すのみで分類しない。
3. **normalizeProviderEffort**: legacy effort alias（`middle`→`medium` / `xhigh`→`high`）を `--effort` 前に正規化。

## スコープ

### IN
- `src/runtime/adapter.ts`: model-launch path を `shell:false` + `windowsVerbatimArguments` + ComSpec 起動へ移行。
- `InvokeResult` 型 + `normalizeInvokeResult(plan, run)` を実装し、pair-agent executor で分類を利用。
- `normalizeProviderEffort(provider, effort)` を実装し effort alias を正規化（既存実装を維持）。

### OUT
- schema entrypoint 対策（modelOverrideSchema）は PLAN-L7-318 の所掌（重複しない）。
- provider CLI 自体の挙動は変えない。

## 受入条件
- model-launch path から `shell:true` を排除（または安全な引数分離）し、Windows argv を verbatim 化。
- exit0+空 stdout を `malformed_output`、非零/spawn error を `provider_error` に分類。
- effort alias（middle/xhigh 等）を正規化して provider へ渡す。
- targeted test（tests/runtime-adapter.test.ts / tests/pair-agent.test.ts）green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial。
- Step 1: 上流 adapter の safe-spawn / InvokeResult / effort 正規化を LOCAL 構造へ接地確認（TL、PLAN-318 と整合）。
- Step 2: safe Windows spawn（shell:false + windowsVerbatimArguments + ComSpec）へ移行（Red→Green）。
- Step 3: InvokeResult / normalizeInvokeResult を実装し呼び出し側で分類利用。
- Step 4: normalizeProviderEffort 実装 → 回帰 test → review → confirmed。

## 壊さない / 再発させない
- 安全境界（コマンド実行）変更のため PLAN-L7-318 と歩調を合わせ、推測で confirmed 化しない。
- 既存の provider 呼び出し契約（引数・env）を回帰させない。

## レビュー / 次工程
- 実装は Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] audit §6.2（completeness pass で確定した adapter gap）。
