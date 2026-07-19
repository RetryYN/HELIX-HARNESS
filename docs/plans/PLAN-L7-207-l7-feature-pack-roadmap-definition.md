---
plan_id: PLAN-L7-207-l7-feature-pack-roadmap-definition
title: "PLAN-L7-207 (add-impl): L7 feature-pack roadmap definition"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - L7 feature-pack semantic roadmap review"
  - role: se
    slot_label: "SE - roadmap schema/doctor hard gate implementation"
  - role: qa
    slot_label: "QA - U-ROADMAP feature-pack oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-207-l7-feature-pack-roadmap-definition.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/schema/roadmap.ts
    artifact_type: source_module
  - artifact_path: src/lint/roadmap-registry.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/roadmap.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-REVERSE-44-roadmap-definition-design
  requires:
    - PLAN-REVERSE-207-l7-feature-pack-roadmap-definition
    - docs/plans/PLAN-REVERSE-44-roadmap-definition-design.md
    - docs/plans/PLAN-L7-44-harness-db-master.md
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
  references:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/design/helix/L4-basic-design/pillar-basic-design.md
    - docs/plans/PLAN-RECOVERY-04-roadmap-definition.md
    - docs/plans/PLAN-REVERSE-44-roadmap-definition-design.md
    - docs/plans/PLAN-L7-141-web-dashboard-component-derived.md
roadmap:
  layer: L7
  feature_packs:
    - id: fp-db
      name: database and projection pack
      layer: database
      owns:
        - src/state-db
        - src/schema
        - ".helix/harness.db"
      exit_criteria: "harness.db projection, schema registry, and read-only DB rebuild paths are represented by L7 roadmap spans."
    - id: fp-service
      name: service and orchestration pack
      layer: service
      owns:
        - src/orchestration
        - src/runtime
        - src/workflow
      exit_criteria: "runtime bridge, workflow routing, and service orchestration spans are registered separately from DB/UI work."
    - id: fp-frontend
      name: frontend response and adapter pack
      layer: frontend
      owns:
        - src/state-db/visualization-read-model.ts
        - "helix progress snapshot --json"
        - VSCode Webview/View response contract
      exit_criteria: "UI-facing responses are deterministic read models and do not count as UI implementation by themselves."
    - id: fp-ui
      name: UI and screen implementation pack
      layer: ui
      owns:
        - src/web
        - docs/design/harness/L2-screen
        - docs/design/harness/L4-basic-design/ui-standard.md
      exit_criteria: "component-derived UI implementation remains visible as deferred work, not silently closed by DB/front response coverage."
    - id: fp-verification
      name: runtime verification pack
      layer: verification
      owns:
        - ".helix/evidence/run-debug"
        - runtime_verification_events
      exit_criteria: "RUN & Debug evidence is classified separately from projection-only evidence."
  gates:
    - id: G-L7PACK.A
      name: semantic packs registered
      exit_criteria: "database/service/frontend/ui packs are registered as roadmap feature_packs and span references resolve."
    - id: G-L7PACK.B
      name: response and runtime verification packs routed
      exit_criteria: "frontend read model and RUN & Debug verification spans are routed without treating UI as complete."
    - id: G-L7PACK.C
      name: UI implementation carry remains explicit
      exit_criteria: "deferred UI implementation remains a visible L7 feature-pack frontier."
  spans:
    - plan_id: PLAN-L7-44-harness-db-master
      after_gate: entry
      before_gate: G-L7PACK.A
      feature_pack: fp-db
    - plan_id: PLAN-L7-177-helix-orchestration-runtime-bridge
      after_gate: entry
      before_gate: G-L7PACK.A
      feature_pack: fp-service
    - plan_id: PLAN-L7-205-run-debug-db-projection
      after_gate: G-L7PACK.A
      before_gate: G-L7PACK.B
      feature_pack: fp-verification
    - plan_id: PLAN-L7-206-visualization-read-model-response
      after_gate: G-L7PACK.A
      before_gate: G-L7PACK.B
      feature_pack: fp-frontend
    - plan_id: PLAN-L7-141-web-dashboard-component-derived
      after_gate: G-L7PACK.B
      before_gate: G-L7PACK.C
      feature_pack: fp-ui
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:21:36+09:00"
    tests_green_at: "2026-06-30T03:21:36+09:00"
    verdict: approve
    scope: "L7 roadmap now exposes database/service/frontend/ui feature packs as semantic responsibility units. UI remains visible as deferred work; DB/read-model coverage cannot close it."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: src/schema/roadmap.ts
        output_digest: "sha256:7eb65629607daa5cc660d46759a995cd453f3dc784121a491a7a53f077403a19"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: src/lint/roadmap-registry.ts
        output_digest: "sha256:6310194b804201518a3e6048fd91b81e564ae36335025a3e0fcb896260496136"
      - kind: unit_test
        command: "npx --no-install vitest run tests/roadmap.test.ts tests/doctor.test.ts tests/plan-lint.test.ts tests/impl-plan-trace.test.ts tests/oracle-test-trace.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: tests/roadmap.test.ts
        output_digest: "sha256:e4dee03f96fa6468aff5ddf2b55a30d1669256e4f7e1e50c289218ef840fb710"
---

# PLAN-L7-207: L7 feature-pack roadmap 定義

## 目的

L7 の進捗が gate/span の量だけで数えられ、作業の意味が表現されない roadmap gap を是正する。
L7 は database、service、frontend response、UI implementation を別々の責務 pack として示す必要がある。

## スコープ

- roadmap schema に `feature_packs[]` と `span.feature_pack` を追加する。
- 必須の L7 feature-pack layer に対する doctor coverage を追加する:
  `database`, `service`, `frontend`, and `ui`.
- 現在の L7 作業を semantic pack として登録する。対象は次の通り。
  DB projection は `PLAN-L7-44` が担当する。
  service/runtime bridge は `PLAN-L7-177` が担当する。
  frontend response は `PLAN-L7-206` が担当する。
  deferred UI は `PLAN-L7-141` が担当する。
- U-ROADMAP oracle と L6/L7 design trace を追加する。

## 非目標

- この PLAN は UI complete を示さない。`PLAN-L7-141` は draft/deferred のまま残す。
- この PLAN は DB migration、external API、auth change、新しい production runtime を導入しない。
- この PLAN は `drive` から feature pack を推論しない。pack は明示的な roadmap semantics とする。

## 受入条件

- `doctor` は `l7-feature-pack-roadmap` を出力し、必須 pack layer が欠けていれば失敗する。
- 未知の `span.feature_pack` と重複した `feature_pack.id` は structural roadmap issue として扱う。
- 実 repo に database/service/frontend/ui の feature-pack coverage がある。
- commit 前に typecheck、lint、targeted roadmap tests、doctor、full tests が pass している。
