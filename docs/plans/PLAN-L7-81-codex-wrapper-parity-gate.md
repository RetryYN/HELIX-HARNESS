---
plan_id: PLAN-L7-81-codex-wrapper-parity-gate
title: "PLAN-L7-81 (troubleshoot): Claude-hook / Codex-wrapper parity を doctor hard gate で証明し、stdin dispatch contract の静かな退行を防ぐ"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-19
updated: 2026-06-19
backprop_decision: not_required
backprop_decision_reason: "内部 harness self-application tooling（lint gate / runtime dispatch / guard / governance mechanism）。harness 自身の enforcement を強化するだけで、product の外部 requirement / design / test-design contract は変えないため、upstream backprop target はない。"
owner: Codex TL
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: cross_agent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "Codex（worker）が src/doctor/index.ts に checkCodexWrapperParity を追加した。これは 2 つの provider integration path が parity を保つことを検証する doctor hard gate である。Claude 側は project .claude/settings.json hooks 経由で動き（3 つの session/hook command が存在）、Codex 側の parity は helix wrapper lifecycle tests と stdin adapter oracles で担保する（codex --execute/--task-file/--plan lifecycle test name が存在し、adapter は `exec -` stdin sentinel + stdin:intent.task + plan_id:intent.planId を使い、U-ADAPTER-007/008 を引用し、U-ADAPTER-009 を文書化する）。Claude（reviewer）の cross-review verdict は pass。gate は runDoctor.ok に接続され（hard fail-close、src/doctor/index.ts:1428）、message も表示される。U-ADAPTER-009 は tests/doctor.test.ts で引用される（OK + fail-closed-when-missing + missing-root cases）。function-spec と L7-unit-test-design の back-fill があり、typecheck + biome + full Vitest 727/727 + doctor は green。reviewer が閉じた gap: Codex は impl/test/design/test-design を出荷したが、この PLAN file は未作成だった（test-design はすでに \"PLAN-L7-81\" を参照していた）。そのため gate は harness 自身の impl-plan-trace discipline に対する orphan-impl になっており、この PLAN が trace を復元する。"
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-4-8
agent_slots:
  - role: tl
    slot_label: "TL - codex/claude wrapper parity doctor gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-81-codex-wrapper-parity-gate.md
    artifact_type: markdown_doc
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/plans/PLAN-L7-77-codex-stdin-prompt-dispatch.md
    - docs/plans/PLAN-L7-78-claude-stdin-prompt-dispatch.md
    - docs/governance/helix-harness-requirements_v1.2.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-81 (troubleshoot): codex/claude wrapper parity doctor gate の検証

## 0. 目的

PLAN-L7-77 / PLAN-L7-78 は両 provider prompt を stdin に移し、PLAN-L7-21 は
Claude を project `.claude/settings.json` hooks 経由で、Codex を
`helix codex --execute` wrapper 経由で動かすようにした。しかし、この 2 つの
integration path が parity を保っていることを機械的に検証していなかった。将来の
変更で Claude hook command が欠落する、adapter が argv prompt へ戻る、または
Codex wrapper lifecycle test が削除されても、既存 gate はすべて green のままに
なり得る。この false-confidence class は、この harness が取り除くべき対象であり、
今回は harness 自身の provider boundary に適用する。

## 1. 範囲

対象:

- `src/doctor/index.ts` の `checkCodexWrapperParity(deps)`。`runDoctor.ok` に
  hard gate として接続し、doctor message に表示する。
- parity evidence が欠落または読み取り不能な場合は fail-close する:
  - `.claude/settings.json` が valid JSON であり、3 つの Claude hook command を含む
    (`session start` / `hook post-tool-use` / `session summary`).
  - `src/runtime/adapter.ts` が stdin contract を維持する（`exec -` sentinel、
    `stdin: intent.task`, `plan_id: intent.planId`).
  - `tests/runtime-hook-entrypoints.test.ts` が 3 つの Codex wrapper lifecycle
    test を維持し、`tests/runtime-adapter.test.ts` が U-ADAPTER-007/008 を引用する。
  - `docs/test-design/harness/L7-unit-test-design.md` が U-ADAPTER-009 を文書化する。
- 新規 check 向けの oracle U-ADAPTER-009 と function-spec row。

対象外:

- stdin dispatch behaviour 自体の変更（PLAN-L7-77/78 の担当）。
- live provider execution。

## 2. 受入条件

- parity が成立している場合、`doctor` は `codex-wrapper-parity - OK` を表示し、
  いずれかの evidence が欠落した場合は fail-close する（runDoctor.ok=false）。
- U-ADAPTER-009 は実 test から引用される（OK case + missing-evidence fail-close）。
- typecheck、lint、full Vitest、doctor が green を維持する。

## 3. Test Design 連携

対応する unit test design: `docs/test-design/harness/L7-unit-test-design.md`
（U-ADAPTER-009）。Red->Green: gate 導入前は hook 欠落 / adapter 差し戻し /
wrapper test 削除があっても doctor を通過する。gate 導入後は fail-close する。

## 4. 状態

Confirmed。2026-06-19 に Codex が実装し、Claude が cross-review した（codex→
claude）。この gate は runDoctor.ok に接続された hard doctor check である。この
PLAN file は orphan-impl gap を閉じるために reviewer が作成した。Codex は
test-design がすでに参照していた PLAN なしで impl/test/design を出荷していた。
