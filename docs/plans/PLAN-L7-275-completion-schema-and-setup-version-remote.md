---
plan_id: PLAN-L7-275-completion-schema-and-setup-version-remote
title: "PLAN-L7-275: completion schema and setup version-up remote evidence"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion decision packet と setup first-run verification の既存 contract を強化する L7 実装修正。上位要求の意味変更や D-API/D-DB 変更は行わない。"
owner: TL (Codex)
parent_design: docs/design/helix/L3-requirements/pillar-functional-requirements.md
pair_artifact: tests/completion-decision-packet.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: qa
    slot_label: "QA - Avicenna completion/setup evidence gap scan"
  - role: tl
    slot_label: "TL - schema and first-run evidence hardening"
generates:
  - artifact_path: docs/plans/PLAN-L7-275-completion-schema-and-setup-version-remote.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/lint/objective-evidence-audit.ts
    artifact_type: source_module
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-03-setup-solo-team.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/templates/adapter/AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/adapter/CLAUDE.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/design/helix/L3-requirements/pillar-functional-requirements.md
  requires:
    - docs/test-design/helix/L6-pillar-unit-test-design.md
    - docs/test-design/harness/L7-unit-test-design.md
    - tests/completion-decision-packet.test.ts
    - tests/setup.test.ts
    - docs/governance/helix-objective-evidence-audit.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T16:31:00+09:00"
    tests_green_at: "2026-07-03T16:31:00+09:00"
    verdict: approve
    scope: "completion decision-packet の schemaVersion contract と、setup first-run version-up dry-run の Pack remote evidence を同じ consumer doctor / distribution acceptance 境界まで同期する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/goal-evidence-audit.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/setup.test.ts tests/distribution-acceptance.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:27:00+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:48ded667c2b187496f038d7bce10ceecfa319e7dcab0334d0857bb30695de4db"
      - kind: unit_test
        command: "bun test tests/doctor.test.ts tests/distribution-acceptance.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:23:00+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:3c62171e1acd8cc606a98976062d920961305f350ae66796021944ec27ab5f50"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:27:00+09:00"
        evidence_path: src/lint/completion-decision-packet.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: smoke
        command: "bun run src/cli.ts audit objective-external --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:27:00+09:00"
        evidence_path: docs/governance/helix-objective-evidence-audit.md
        output_digest: "sha256:acb06944dabde097a632158a6da91cd8ab27f19cf4abed22207b9f19e5e35c04"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts tests/oracle-test-trace.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:27:00+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:09a9cb6cc8404f83c73b86e7085298fa31039a5428bd4212de71dc043853e07c"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:27:00+09:00"
        evidence_path: docs/plans/PLAN-L7-275-completion-schema-and-setup-version-remote.md
        output_digest: "sha256:978fe2c1ed1a0aeccfaf0a2d685f2a623f8ec0a94cf9c40c37c1ba29906a051a"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:29:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:ee2a043c5123003a9dcfb878438f4d5ad26122ec6c9e3e4033f830d5ee3dbb80"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:29:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:5b613be1ec442bf6a09b9c8e471c73c07d9a865b74b3a3c8b1a9f6e683fe6c5f"
      - kind: smoke
        command: "bun run src/cli.ts completion decision-packet --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:24:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:df6272fe59694e25304d287074f13f702cc3593e435cb5c534b93ca8f1409fc4"
      - kind: smoke
        command: "bun run src/cli.ts setup project --dry-run --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:24:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:debc8c2b9658fd08d636b568da7ea25de5ae0f128b8d1f8f314457dbba80a419"
---

# PLAN-L7-275: completion schema と setup version-up remote 証跡

## 目的

completion decision-packet は `generatedFrom` や freshness は持っていたが、top-level schema version が無く、
packet 形式の破壊的 drift を機械的に検出しにくかった。

また `helix setup project --dry-run --json` が first-run verification に出す version-up dry-run command は、
Pack distribution remote を渡さないため、consumer 初回検証で Pack tag 存在を remote source に結び付ける証跡が弱かった。

## 変更

- `completion decision-packet` に `schemaVersion=completion-decision-packet.v1` を追加し、lint が欠落や drift を fail-close する。
- packet unit test と CLI surface test に schema version の positive / negative case を追加する。
- setup first-run verification、VSCode task、GitHub CI smoke、adapter template、consumer doctor が参照する version-up dry-run command を、Pack remote 付きの同一 command に揃える。
- 検証中に Pack `main` の実測 HEAD が進んだため、objective external ledger と関連 oracle を `e454190d433292f5e9409033823a05e9dad61b67` へ同期する。
- L3/L6/L7 test design と既存 PLAN-L7-03 の記述を、remote source 付き first-run evidence へ同期する。

## 境界

- Pack latest tag `v0.1.3` の採用、version-up activation、remote write、cutover apply は実行しない。
- consumer setup ready は引き続き `completionClaimAllowed=false` であり、L14 完了 claim にはしない。
- `.helix` から `.helix` への rename/cutover は PLAN-M-02 承認前の blocked packet のまま扱う。

## 完了条件

- completion decision-packet JSON が schema version を返し、欠落 packet は lint で落ちる。
- setup dry-run の `version-up-dry-run` row、CI、VSCode task、consumer doctor が remote 付き command で一致する。
- targeted tests、typecheck、design-language、plan governance、doctor が green。
