---
plan_id: PLAN-L7-209-objective-evidence-audit
title: "PLAN-L7-209 (add-impl): active objective evidence audit"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-07-03
owner: Codex
parent_design: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - objective evidence semantics"
  - role: qa
    slot_label: "QA - audit table oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-209-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-209-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/objective-evidence-audit.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-208-codex-hook-feature-enable-gate.md
  requires:
    - docs/plans/PLAN-REVERSE-209-objective-evidence-audit.md
    - docs/plans/PLAN-L7-203-legacy-adoption-decisions.md
    - docs/plans/PLAN-L7-204-upstream-adoption-decisions.md
    - docs/plans/PLAN-L7-205-run-debug-db-projection.md
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
    - docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md
    - docs/plans/PLAN-L7-208-codex-hook-feature-enable-gate.md
  references:
    - docs/governance/helix-objective-evidence-audit.md
    - src/lint/objective-evidence-audit.ts
    - src/cli.ts
    - src/doctor/index.ts
    - tests/goal-evidence-audit.test.ts
    - tests/cli-surface.test.ts
    - tests/doctor.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T19:58:09+09:00"
    tests_green_at: "2026-07-03T19:58:09+09:00"
    verdict: approve
    scope: "Continuation: `externalObserved` の部分入力を fail-close にし、配布 source ledger を現行 `distribution_repo` / `distribution_latest_tag` key へ移行した。consumer setup / distribution readiness の version-up dry-run は配布 target `v0.1.4` を plan-only target として示し、local package version `0.1.0` / local distribution tag `v0.1.0` の採用境界は維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/goal-evidence-audit.test.ts tests/cli-surface.test.ts tests/doctor.test.ts tests/setup.test.ts tests/distribution-acceptance.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T19:56:00+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:dcb5dbaa8059b8350946eba2976c06e656b8a3171070e8f04f6c8989c8456b41"
      - kind: smoke
        command: "bun run src/cli.ts audit objective-external --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T19:48:00+09:00"
        evidence_path: docs/governance/helix-objective-evidence-audit.md
        output_digest: "sha256:cc928ca3f1f7ad8a75a400d23a78fd5ad9103b03aeea1165a6a3a5127b8382f4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:48:00+09:00"
        evidence_path: src/lint/objective-evidence-audit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:55:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:85e5b5d1d7d7116edd572f2c2aadda8bd53ee07ef07fb48f4c696b3e30dc5717"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild --json"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:53:00+09:00"
        evidence_path: src/state-db/index.ts
        output_digest: "sha256:c05aade241e5a66032763c60eaa6a5dde9dd810dd4bfb01646c2abef829e68dc"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:57:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:2f0bdadafa19f55d5375abb1aaa9c7082864c329366178802bd981d1cb29c707"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:57:00+09:00"
        evidence_path: docs/plans/PLAN-L7-209-objective-evidence-audit.md
        output_digest: "sha256:67d7cd7659d5874e943e942ff332f62948d39961baed18e8eadd5df64a7fffd7"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:57:00+09:00"
        evidence_path: docs/plans/PLAN-L7-209-objective-evidence-audit.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T19:27:00+09:00"
    tests_green_at: "2026-07-03T19:27:00+09:00"
    verdict: approve
    scope: "Continuation: G-10 objective completion row now follows completionReadiness semantic frontier blockers. `semantic_frontier_blocked` and `resolve semantic feature frontier records before claiming whole-program completion` are cited alongside existing human/S4/version-up/cutover blockers, so objective-external / doctor cannot pass stale completion evidence after semantic frontier hardening."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/cli-surface.test.ts tests/doctor.test.ts tests/completion-decision-packet.test.ts tests/goal-evidence-audit.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T19:27:00+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:bb85ed8d8676bad46cae90af6519b2e8178aa3e3e5b8b989e5bdfc285b8b5a2d"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:10:00+09:00"
    tests_green_at: "2026-07-01T09:10:00+09:00"
    verdict: approve
    scope: "Active objective progress is now emitted as `objectiveProgress.percent` from the objective evidence audit denominator. The current status is 90% (9/10 proved) with `completionClaimAllowed=false`, so progress visibility does not weaken the G-10 whole-program/L14 completion blocker."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/goal-evidence-audit.test.ts tests/cli-surface.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:10:00+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:86e589da40d3d5d7451e25f067e4714fbe508fcf23f1f93befed42bb51bf2f48"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T09:10:00+09:00"
        evidence_path: src/lint/objective-evidence-audit.ts
        output_digest: "sha256:159e8b5c0c2ba3c65558c47b419386d3e0c33e14b1e07f6406a265a20b1ac535"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T17:06:13+09:00"
    tests_green_at: "2026-06-30T17:06:13+09:00"
    verdict: approve
    scope: "G-10 completion evidence now must enumerate every outstanding PLAN and every completionReadiness.requiredAction, so whole-program/L14 completion cannot hide a blocked decision behind aggregate blocker labels."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/goal-evidence-audit.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T17:06:13+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:86e589da40d3d5d7451e25f067e4714fbe508fcf23f1f93befed42bb51bf2f48"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T17:06:13+09:00"
        evidence_path: src/lint/objective-evidence-audit.ts
        output_digest: "sha256:159e8b5c0c2ba3c65558c47b419386d3e0c33e14b1e07f6406a265a20b1ac535"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T11:02:00+09:00"
    tests_green_at: "2026-06-30T11:01:00+09:00"
    verdict: approve
    scope: "Active objective evidence is indexed by requirement, with semantic proof links, an explicit blocked row for whole-program/L14 completion while completionReadiness is false, and doctor hard-gate enforcement against false completion claims."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/goal-evidence-audit.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T11:01:00+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:86e589da40d3d5d7451e25f067e4714fbe508fcf23f1f93befed42bb51bf2f48"
---

# PLAN-L7-209: active objective evidence audit の監査

## 目的

active user objective を requirement 単位で監査可能にする。この audit は、upstream adoption
と old HELIX adoption の採用証跡、L7.5 RUN & Debug と visualization の到達証跡、
feature-pack roadmap と verification strategy の方針証跡、adapter config、
performance NFR、naming migration の semantic evidence を指せる必要がある。

## スコープ

- objective requirement を key にした governance audit table を追加する。
- 参照対象の両 GitHub repositories について current source commit evidence を含める。
- regression test と doctor hard gate を追加し、すべての requirement row が存在すること、
  proved row が proved のまま維持されること、whole-program completion row が
  `completionReadiness` と整合すること、誤った full-completion claim が reject されること、
  引用された current-state artifact が repo 内に存在すること、blocked completion row が
  現在の outstanding PLAN と required action をすべて列挙することを検証する。
- external source ledger と live `git ls-remote` observation を比較する明示的な
  networked check 用に、read-only の `helix audit objective-external --json`
  surface を公開する。通常の doctor は non-networked のままにする。
- 配布 target tag は、以前採用した tag の存在だけではなく、remote tag の semver 最大値として扱う。

## 非目標

- この PLAN では end-user product behavior の追加や external change の適用は行わない。
  追加する CLI surface は read-only の governance audit である。
- この PLAN では deferred UI implementation を complete として再定義しない。
- この PLAN では後続の atomic な `helix` から `helix` への identifier migration は実施しない。

## 受入条件

- audit は、実装済みまたは hardening 済みの objective requirement について proved row を持ち、
  `completionReadiness` が true になるまで L14 / whole-program completion の blocked row を持つ。
- blocked completion row は aggregate blocker label だけでなく、すべての outstanding PLAN ID と
  すべての `completionReadiness.requiredAction` を引用する。
- `objective-evidence-audit` は `helix doctor` の hard-gate aggregation に接続され、
  semantic completion drift が test-only に留まれない。
- audit は、この continuation で観測した両 external source commit を引用する。
- audit は semantic proof を test count や roadmap count から区別する。
- audit は HELIX L0-L14 coverage の G-06 証跡として L7 unit だけでなく、L8 integration、L9 system、
  proposal document coverage routing の test-design artifact も固定し、別 gate の存在だけに依存しない。
- `helix status --json` は `objectiveProgress.percent` を公開し、G-10 が blocked の間は
  current progress が 90%、`completionClaimAllowed=false` である。
- `helix audit objective-external --json` は `git ls-remote` を通じて `development_repo`、
  `distribution_repo`、`distribution_latest_tag` を取得し、それらを
  `externalObserved` として渡し、observed HEAD または semver-latest 配布 tag が ledger から
  drift した場合は non-zero で終了する。
- `externalObserved` を audit に渡す場合は 3 件すべての observed source key
  を必須にする。部分観測は未観測 source を unchanged と扱わず fail-close する。
- commit 前に targeted audit tests、doctor、full tests が pass する。
