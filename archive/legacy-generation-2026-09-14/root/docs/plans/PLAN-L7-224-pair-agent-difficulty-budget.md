---
plan_id: PLAN-L7-224-pair-agent-difficulty-budget
title: "PLAN-L7-224 (add-impl): pair-agent difficulty budget"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - pair-agent difficulty policy"
  - role: qa
    slot_label: "QA - pair-agent fix-cycle budget regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-224-pair-agent-difficulty-budget.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-224-pair-agent-difficulty-budget.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/pair-agent.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/lint/green-command-digest.ts
    artifact_type: source_module
  - artifact_path: tests/pair-agent.test.ts
    artifact_type: test_code
  - artifact_path: tests/green-command-digest.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
  requires:
    - docs/plans/PLAN-REVERSE-224-pair-agent-difficulty-budget.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T11:26:22+09:00"
    tests_green_at: "2026-07-01T11:26:22+09:00"
    verdict: approve
    scope: "Pair-agent TDD plan now records task difficulty and derives maxFixCycles from difficulty policy when not explicit. CLI plan/run validates --difficulty and strict positive integer --max-fix-cycles, explicit max remains an override, exhausted fix cycles emit max-fix-cycles-exhausted, and green-command digest audit blocks fake evidence without unsafe historical restamping."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e3c25acec73df588fc0af2d5faf394dcda56938bcbdc2ceb8c4dfce9fb367e42"
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts tests/green-command-digest.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: tests/green-command-digest.test.ts
        output_digest: "sha256:7ec41694bfd51a0c778c10486849e58b215747c7e11b824100534b0ad4589ddd"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:a5362ee9f49ad2f5de16a97ad37011aa3311284429e4ed49840c0800ad7fca48"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:c4af538d67f60f0f6650eab92ca5b8f47f6d8e33fdffe584db3ca8eae24f3d78"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: src/lint/green-command-digest.ts
        output_digest: "sha256:86aa20a54cb9b97c97742405d25516794e5267c8e33ce294c850586344664919"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:f37048765d4aaa8fb7ddf4776345f27fb1503919db09bf9e02d8314e96f5ea3c"
---

# PLAN-L7-224: pair-agent difficulty budget の難易度予算

## 目的

pair-agent workflow で planner が input type の `difficulty` を受け取る一方、
TDD fix loop の大きさ決定に使っていなかった gap を閉じる。最終的に必要な
system は固定 retry budget ではなく、task difficulty を考慮した orchestration
である。implementation review では、green-command digest hard gate が historical
evidence の unsafe restamping を強制し得ることも見つかった。この PLAN では、
commit/push evidence を信頼する前提として必要な audit-safe gate correction も含める。

## スコープ

- pair-agent task difficulty と、それが explicit か inferred かを記録する。
- `maxFixCycles` が明示されていない場合は difficulty から導出する:
  `trivial/simple=1`, `standard=2`, `complex=3`, `critical=4`.
- 明示された `--max-fix-cycles` は override として維持し、その source を示す。
- `helix pair-agent plan/run` で `--difficulty` を公開する。
- allowed loop 内で smart review が `VERDICT: pass` に到達しない場合は
  `max-fix-cycles-exhausted` を返す。
- malformed な `--max-fix-cycles` 値は、次で切り詰めずに reject する:
  `parseInt`.
- `green_commands[].output_digest` は immutable review-time evidence として維持する。
  fake / malformed digest と missing evidence files は fail-close にしつつ、後続の
  file edits による valid historical digest drift は unsafe historical PLAN restamping
  を強制しない。
- L3/L6 design と paired test design を backfill する。

## 外部根拠

- Martin Fowler, "Test Driven Development"（2026-07-01 確認）:
  https://martinfowler.com/bliki/TestDrivenDevelopment.html
- NIST SP 800-218 SSDF v1.1（2026-07-01 確認）:
  https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-218.pdf
- OWASP Code Review Guide（2026-07-01 確認）:
  https://owasp.org/www-project-code-review-guide/

## 対象外

- external provider CLIs は実行しない。
- T0 frontier approval requirements は変更しない。
- `旧 state path -> .helix` cutover は activate しない。
- pair-agent local pass は CI/merge gate の substitute として扱わない。

## DoD

- [x] Difficulty が pair-agent plan output に含まれる。
- [x] `maxFixCycles` 未指定時は difficulty policy を使う。
- [x] 明示された `maxFixCycles` は override のまま維持される。
- [x] CLI が `--difficulty` を validate する。
- [x] CLI が `--max-fix-cycles` を positive integer として validate する。
- [x] Max cycle exhaustion が error finding を emit する。
- [x] Green-command digest gate が fake/malformed evidence を block し、
      historical digest restamps は強制しない。
- [x] L3/L6 design と paired test design が policy を説明する。
