---
plan_id: PLAN-L7-68-provider-dispatch-portability
title: "PLAN-L7-68 (troubleshoot): provider dispatch の可搬性と handover 分離"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-16
updated: 2026-06-16
backprop_decision: not_required
backprop_decision_reason: "内部 harness 自己適用 tooling (lint gate / runtime dispatch / guard / governance mechanism)。harness 自身の強制力を harden するもので、product の外部 requirement / design / test-design contract は変更しないため、上流 backprop target はない。"
owner: Codex TL
parent_design: docs/design/harness/L6-function-design/handover-mechanism.md
review_evidence:
  - reviewer: codex-self-review
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-16"
    tests_green_at: "2026-06-16"
    verdict: pass
    scope: "Provider dispatch portability、capability-based runtime detection、handover の mechanical/explicit 分離、および HELIX runtime-env 分離。self-review で Critical 0 / High 0。完全な regression evidence は session output に記録済み。"
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: provider dispatch portability と mechanical/explicit handover separation が現HEADの fast regression で壊れていないことを再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "npm test:fast"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: tl
    slot_label: "TL - provider dispatch portability"
generates:
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: src/runtime/detect.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/runtime/provider-handover.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/runtime.test.ts
    artifact_type: test_code
  - artifact_path: tests/runtime-hook-entrypoints.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/provider-handover.test.ts
    artifact_type: test_code
  - artifact_path: docs/handover/handover-mechanical-explicit.md
    artifact_type: markdown_doc
  - artifact_path: .helix/audit/A-137-unusable-provider-dispatch-audit.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-34-tool-adapter-probes.md
  requires:
    - .helix/audit/A-137-unusable-provider-dispatch-audit.md
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
    - docs/design/harness/L6-function-design/handover-mechanism.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-68: provider dispatch の可搬性と handover 分離

## 0. 目的

A-137 を close する。provider dispatch を実際に spawn 可能にし、runtime availability を capability-based にし、machine-readable provider handover と明示的な human handover を分離する。

## 1. スコープ

許可する変更:

- shared runtime adapter における native Claude/Codex binary 解決;
- Windows `.cmd` / `.bat` invocation handling;
- `team run --execute` を single-provider execution と同じ provider invocation path へ routing すること;
- spawnability probes による provider availability detection;
- `HELIX_CLAUDE_BIN` / `HELIX_CODEX_BIN` override names;
- provider execution から legacy wrapper env coupling を除去すること;
- provider handover `handover_kind: "mechanical"`;
- judgement と next actions を保持する explicit handover markdown。

対象外:

- external provider CLI behavior の変更;
- HELIX product runtime として `helix` commands に依存すること;
- handover files に secrets または raw provider transcripts を保存すること。

## 2. 受入条件

- `helix status` は、provider commands が spawnable な場合にのみ provider availability を報告する。
- `helix codex --execute` は native auto-discovery または `HELIX_CODEX_BIN` で Codex を解決できる。
- `helix claude --execute` は native auto-discovery または `HELIX_CLAUDE_BIN` で Claude を解決できる。
- `team run --execute` は shared provider invocation path を使う。
- Windows command scripts は Node shell/args deprecation warnings なしで invoke される。
- Provider handover packages は `handover_kind: "mechanical"` を含む。
- Explicit handover markdown は human-readable state を含み、nuanced judgement を provider JSON に依存しない。
- HELIX-owned runtime/test surfaces は legacy HELIX provider override または raw-wrapper env names を不要にする。

## 3. 検証

close 前に必須:

- `npx --no-install vitest run tests/runtime-adapter.test.ts tests/runtime.test.ts`
- `npx --no-install vitest run tests/runtime-hook-entrypoints.test.ts tests/cli-surface.test.ts tests/provider-handover.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm run src\\cli.ts doctor`
- `rg "HELIX_CODEX_BIN|HELIX_CLAUDE_BIN|HELIX_ALLOW_RAW" src tests docs/handover .helix/handover --glob "!vendor/**"`

## 4. 現在の状態

PLAN-L7-68 slice の implementation は targeted tests、typecheck、lint、doctor cleanup 後に confirmed。PLAN-L7-69 は expanded encoding-corruption automation 用の別 draft ticket のままとする。
