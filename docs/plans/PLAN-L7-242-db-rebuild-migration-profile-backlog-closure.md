---
plan_id: PLAN-L7-242-db-rebuild-migration-profile-backlog-closure
title: "PLAN-L7-242 (docs): DB rebuild/migration profile backlog closure"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-110 の現 HEAD 証跡を読み直し、既に PLAN-L7-45 で実装済みの DB rebuild/migration/doctor integration を backlog に反映する docs-only closure。新規 product requirement、DB schema、runtime behavior は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L5-detailed-design/physical-data.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - IMP-110 stale backlog closure"
generates:
  - artifact_path: docs/plans/PLAN-L7-242-db-rebuild-migration-profile-backlog-closure.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-45-harness-db-foundation.md
  requires:
    - docs/plans/PLAN-L7-45-harness-db-foundation.md
    - docs/improvement-backlog.md
    - src/state-db/index.ts
    - src/state-db/migration.ts
    - src/doctor/index.ts
    - tests/state-db.test.ts
    - tests/db-projection-ingestion.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T17:33:00+09:00"
    tests_green_at: "2026-07-03T17:33:00+09:00"
    verdict: approve
    scope: "IMP-110 の stale observed 行を現 HEAD 証跡で implemented に是正した。DB adapter/migration/status/rebuild は PLAN-L7-45 で実装済み、state-db tests と db-projection-ingestion doctor gate で検証済み。新規 DB schema / runtime behavior は追加していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/state-db.test.ts tests/db-projection-ingestion.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T17:33:00+09:00"
        evidence_path: tests/state-db.test.ts
        output_digest: "sha256:bfb3698fc15d79cd071c389e1b2cd1c805cd8e561526bb26eeed839bb829d587"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T17:33:00+09:00"
        evidence_path: src/state-db/migration.ts
        output_digest: "sha256:4d2e0c35434f50d7093a03e3751a001771d5cd063017ea19f34b2605ac402d50"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T17:33:00+09:00"
        evidence_path: docs/improvement-backlog.md
        output_digest: "sha256:ae57c53fba20b741207d14f40fe21050dea4798c1059bc2b2816496b179275c0"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T17:33:00+09:00"
        evidence_path: docs/plans/PLAN-L7-45-harness-db-foundation.md
        output_digest: "sha256:59d5cfea06452579f20f69a3efec1d76a8abf44170e77064200f83996a1f045b"
      - kind: smoke
        command: "npx --no-install tsx src/cli.ts db rebuild"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T17:33:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:cda1dc0ff445464afcff33934372d20a3296fce484d85b74ed1065725291efe6"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T17:33:00+09:00"
        evidence_path: tests/db-projection-ingestion.test.ts
        output_digest: "sha256:f8473f1164e98f02ca1d0e825386dae7504dd29580edd87fed3a86d17c2df15b"
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-242: DB rebuild / migration profile backlog の closure

## 0. 目的

IMP-110 は 2026-06-09 時点で「DB projection の collector/rebuild/migration profile が未実装」として
observed に残っていた。しかし現 HEAD では PLAN-L7-45 以降で、adapter、migration、schema version、
`db status` / `db rebuild`、doctor `db-projection-ingestion` が実装済みである。

この slice は、新規実装ではなく backlog の stale state を現 HEAD 証跡へ合わせる。

## 1. 精読結果

- `src/state-db/index.ts`: `.helix/` 配下限定の DB adapter、`bun:sqlite` first / Node fallback、secret-like guard。
- `src/state-db/migration.ts`: registry-driven DDL、`PRAGMA user_version`、missing column repair、冪等 migration。
- `src/cli.ts`: `db status` / `db rebuild` surface。
- `src/doctor/index.ts`: in-memory `rebuildHarnessDb` を実行し、`db-projection-ingestion` を doctor gate に接続。
- `tests/state-db.test.ts`: table 作成、migration 冪等、missing column repair、status/rebuild maintenance。
- `tests/db-projection-ingestion.test.ts`: automatic projection table の populated gate と fail-close。
- `docs/plans/PLAN-L7-45-harness-db-foundation.md`: DoD で `db status` / `db rebuild` runnable・deterministic を完了済み。

## 2. スコープ

対象:

- IMP-110 を `implemented` に更新する。
- 実装済み証跡の参照先を backlog に明記する。

対象外:

- DB schema / migration / CLI 挙動の変更。
- 新しい collector table の追加。
- L14 completion / version-up activation / `.helix` irreversible cutover の承認。

## 3. 受入条件

- `docs/improvement-backlog.md` の IMP-110 が stale observed のまま残らない。
- `tests/state-db.test.ts` / `tests/db-projection-ingestion.test.ts` が green。
- plan lint / db rebuild / doctor が green。
- completion progress は人間判断待ち blocker に従い、これだけで 100% 完了扱いにしない。
