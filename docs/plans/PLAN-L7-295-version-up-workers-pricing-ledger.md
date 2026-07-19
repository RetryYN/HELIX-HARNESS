---
plan_id: PLAN-L7-295-version-up-workers-pricing-ledger
title: "PLAN-L7-295: version-up Workers pricing source ledger 固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "version-up activation の $0 / Free plan 根拠を source ledger と lint に additive に固定する。外部 activation、secret、infra、不可逆 cutover は行わない。"
owner: TL (Codex)
parent_design: docs/process/modes/version-up.md
pair_artifact: tests/version-up-readiness.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - Workers pricing source ledger"
  - role: qa
    slot_label: "QA - version-up pricing ledger drift regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-295-version-up-workers-pricing-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/modes/version-up.md
  requires:
    - docs/process/modes/version-up.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T22:50:23+09:00"
    tests_green_at: "2026-07-03T22:50:23+09:00"
    verdict: approve
    scope: "Cloudflare Workers pricing page を version-up source ledger の必須 row に固定し、Workers limits だけで $0 activation 根拠を閉じないようにする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/version-up-readiness.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T22:50:23+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:044fcc004118d21b9c4d19a14d95a5fdd48323432e939397fa9e8afa5ea7e070"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T22:50:23+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T22:50:23+09:00"
        evidence_path: docs/plans/PLAN-L7-295-version-up-workers-pricing-ledger.md
        output_digest: "sha256:9316d5169e0994e98b5ca932cb7951caabeeefb7a78db485a75f73fd5a3ca16e"
---

## 目的

`PLAN-L7-146` の version-up activation は Cloudflare Workers / Pages Functions / KV 等の Free plan 境界を判断材料にする。既存 ledger は Workers limits を必須化しているが、Free plan 対象範囲は Workers pricing page 側にも公式に分離して示されるため、$0 claim の source basis が limits だけへ縮退する余地がある。

この PLAN では `Cloudflare Workers pricing` を `Version-up source ledger` の必須 row とし、row 欠落・URL drift・required field impact 欠落を `version-up-readiness` で fail-close する。

## DoD

- [x] `docs/process/modes/version-up.md` の `Version-up source ledger` に `Cloudflare Workers pricing` row を追加する。
- [x] `analyzeVersionUpReadiness()` が `Cloudflare Workers pricing` row 欠落を fail-close する。
- [x] official URL は `https://developers.cloudflare.com/workers/platform/pricing/` に固定する。
- [x] required field impact は `cost_guardrails` / `workers_limit` / `external_rehearsal_plan` を含む。
- [x] `PLAN-L7-146` は parked のままで、Cloudflare / GitHub / HMAC / access-control / secret activation は行わない。
