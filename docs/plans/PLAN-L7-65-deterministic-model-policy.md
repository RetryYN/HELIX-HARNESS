---
plan_id: PLAN-L7-65-deterministic-model-policy
title: "PLAN-L7-65: deterministic model and effort policy for team runner"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/harness/L6-function-design/agent-slots.md
status: completed
created: 2026-06-16
updated: 2026-06-16
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.4
    tests_green_at: "2026-06-16"
    reviewed_at: "2026-06-16"
    verdict: pass
    scope: "deterministic team-run model/effort selection, launch-plan evidence, and adapter metadata"
agent_slots:
  - role: tl
    slot_label: "TL - deterministic model/effort policy"
generates:
  - artifact_path: src/team/model-policy.ts
    artifact_type: source_module
  - artifact_path: src/team/run.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: src/schema/team.ts
    artifact_type: source_module
  - artifact_path: tests/team-model-policy.test.ts
    artifact_type: test_code
  - artifact_path: tests/team-run.test.ts
    artifact_type: test_code
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/team-schema.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/agent-slots.md
    artifact_type: design_doc
dependencies:
  parent: PLAN-L7-64
  requires:
    - docs/design/harness/L6-function-design/agent-slots.md
    - docs/governance/helix-harness-requirements_v1.2.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-65: team runner の deterministic model / effort policy

## 目的

`helix team run` が task difficulty から具体的な model と reasoning effort を決定的に選べるようにしつつ、公式 Claude/Codex CLI の invocation boundary を維持する。

## スコープ

- 明示指定がない場合、task text から `trivial|simple|standard|complex|critical` を推論する pure team model policy を追加する。
- FR-L1-37 が model/effort contract であり続けるよう、`recommendModelEffort` を再利用する。
- dry-run JSON と prompt headers に `model_selection` を出力し、recommendation を検査不能な prompt state に隠さない。
- Codex の model selection は既存の `codex exec ... -m <model>` 形式で渡す。Claude の model と effort は stdin の prompt とともに `claude --print --input-format text --model <model> --effort <effort>` で渡し、effort を `CLAUDE_CODE_EFFORT_LEVEL` にも反映する。
- `difficulty` / `model` / `effort` に対する team member の明示 override を維持する。ただし `model` は provider model ID / family alias に限定し、typo は fail closed させる。

## 検証

- [x] `bunx vitest run tests\team-model-policy.test.ts tests\team-run.test.ts tests\runtime-adapter.test.ts tests\team-schema.test.ts`

## DoD

- [x] Team launch plan が各 member の deterministic な `model_selection` を公開する。
- [x] Critical task は LLM classifier を必要とせず、high effort と frontier family に対応づけられる。
- [x] Simple/trivial task は、適用可能な場合に low effort と fast Codex model に対応づけられる。
- [x] 公式 CLI boundary が維持される。Codex model flag を使い、Claude model/effort flag を使い、provider API credential は導入しない。
- [x] Override は schema で検証され、明示 source として記録される。任意の model string は実行前に reject される。
