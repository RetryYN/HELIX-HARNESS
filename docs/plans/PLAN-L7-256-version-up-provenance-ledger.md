---
plan_id: PLAN-L7-256-version-up-provenance-ledger
title: "PLAN-L7-256: version-up activation provenance ledger 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "version-up activation の source ledger / packet validation 強化。承認・activation・外部 apply は行わない。"
owner: TL (Codex)
parent_design: docs/process/modes/version-up.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - version-up provenance ledger"
generates:
  - artifact_path: docs/plans/PLAN-L7-256-version-up-provenance-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-146-serverless-readonly-share.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/modes/version-up.md
  requires:
    - docs/process/modes/version-up.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
    - src/lint/version-up-readiness.ts
    - tests/version-up-readiness.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T14:35:00+09:00"
    tests_green_at: "2026-07-03T14:35:00+09:00"
    verdict: approve
    scope: "SLSA Provenance v1.2 を version-up source ledger の必須 row に昇格し、PLAN-L7-146 の source_ledger_freshness と activation packet sourceCheckedAt を 2026-07-03 確認へ更新した。承認・activation・外部 apply は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts tests/cli-surface.test.ts tests/completion-decision-packet.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T14:35:00+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:96ef4d1fe9b6d0477f028574ec62f62f00d8ca2a40a876d792c97704de57eec9"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T14:35:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:f2c135d2569bdb13ebf7a6bbb6c914c8cd7eaa35e5613c62a07517bb4ae24378"
      - kind: smoke
        command: "bun run src/cli.ts version-up activation-packet --plan PLAN-L7-146-serverless-readonly-share --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T14:35:00+09:00"
        evidence_path: docs/process/modes/version-up.md
        output_digest: "sha256:5a4c95e3cac0aa7cd1b11e735ff9f4561dcce7a673e952b91f4d093690915219"
---

# PLAN-L7-256: version-up activation provenance ledger 強化

## 目的

version-up activation packet は `reapprovalTriggers[]` で SLSA provenance を参照していたが、
`Version-up source ledger` の必須 row としては固定していなかった。これでは provenance を確認したつもりでも、
source ledger / snapshot digest / activation packet から provenance 根拠が落ちる退行を見逃す余地がある。

この PLAN は、SLSA Provenance v1.2 を version-up activation の公式 source ledger に昇格し、
artifact / dry-run / audit material の provenance を承認前 evidence として機械的に追跡する。

## 変更

- `docs/process/modes/version-up.md` の `Version-up source ledger` を 2026-07-03 確認へ更新し、SLSA Provenance v1.2 row を追加する。
- `src/lint/version-up-readiness.ts` で SLSA row と expected official URL / field impact を必須化する。
- `PLAN-L7-146-serverless-readonly-share` の `source_ledger_freshness` と delta を 2026-07-03 の provenance 強化へ更新する。
- L6 function spec / L7 test design に SLSA row が snapshot/material digest に含まれる contract を追記する。
- `tests/version-up-readiness.test.ts` に SLSA row 欠落の fail-close test を追加する。

## 境界

- version-up activation は実行しない。
- action-binding approval は記録しない。
- Cloudflare / GitHub / HMAC / access-control / secret / external infra には触れない。
- 残 frontier の PO/S4 判断、version-up activation 判断、不可逆 rename/cutover signoff は人間判断のまま残す。

## 完了条件

- `version-up-readiness` が SLSA Provenance row 欠落を violation にする。
- live activation packet が `sourceLedgerFreshness.checkedDate=2026-07-03`、`rowCount=17`、`missingRows=[]` を返す。
- targeted tests、typecheck、plan lint、doctor が green。
