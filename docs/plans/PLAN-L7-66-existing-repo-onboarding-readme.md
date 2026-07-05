---
plan_id: PLAN-L7-66-existing-repo-onboarding-readme
title: "PLAN-L7-66: 既存 repo onboarding fallback template と root README"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
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
    scope: "harness docs を持たない対象 repo 向け setup fallback template と root README onboarding guidance"
agent_slots:
  - role: tl
    slot_label: "TL - 既存 repo onboarding と README"
generates:
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: README.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/repository-structure.md
    artifact_type: doc_update
dependencies:
  parent: PLAN-L7-65
  requires:
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/governance/helix-harness-requirements_v1.2.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-66: 既存 repo onboarding fallback template と root README

## 目的

この repository の documentation/template tree をまだ持たない既存 project へ導入する場合でも、harness を理解可能かつ bootstrap 可能にする。

## スコープ

- 対象 repository に `docs/templates/github/` が存在しない場合に使う built-in GitHub setup template を追加する。
- 対象 repository 側の template が存在する場合は override として維持する。
- 目的、Windows/TS stance、source-checkout setup、team run、model/effort policy、verification command を説明する root `README.md` を追加する。

## 検証

- [x] `bunx vitest run tests\setup.test.ts`

## DoD

- [x] 空の対象 repository で `loadTemplates` が利用可能な template を返す。
- [x] Team CODEOWNERS placeholder が built-in template から render される。
- [x] README が source checkout からの existing-repo setup と team-run execution boundary を、公開済み `bunx helix` package があるかのように示唆せず記述する。
