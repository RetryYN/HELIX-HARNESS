---
plan_id: PLAN-L7-171-g8-adapter-asset-evidence
title: "PLAN-L7-171: G8 adapter/asset evidence 拡張"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-26
updated: 2026-06-26
owner: Codex
parent_design: docs/plans/PLAN-L7-169-g8-integration-evidence-manifest.md
backprop_decision: not_required
backprop_decision_reason: "この変更は G8 evidence-manifest lint の粒度を補正し、Adapter/Asset の部分 evidence manifest を追加する。L8 test design の意味論や product runtime behavior は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - G8 Adapter/Asset evidence 棚卸し"
  - role: tl
    slot_label: "TL - G8 manifest validator 補正"
  - role: aim
    slot_label: "AIM - L8 evidence 部分 coverage 監査"
generates:
  - artifact_path: docs/plans/PLAN-L7-171-g8-adapter-asset-evidence.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/g8-integration-workflow.ts
    artifact_type: source_module
  - artifact_path: tests/g8-integration-workflow.test.ts
    artifact_type: test_code
  - artifact_path: .helix/evidence/g8-integration/20260626-it-adapter-asset-expansion.json
    artifact_type: json_config
dependencies:
  parent: docs/plans/PLAN-L7-169-g8-integration-evidence-manifest.md
  requires:
    - docs/plans/PLAN-L7-169-g8-integration-evidence-manifest.md
    - docs/plans/PLAN-L7-170-g8-evidence-graph-node.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-26T21:16:51+09:00"
    tests_green_at: "2026-06-26T21:16:51+09:00"
    verdict: approve
    scope: "G8 manifest の aggregate family validation と Adapter/Asset 部分 evidence 拡張。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\g8-integration-workflow.test.ts tests\\runtime-adapter.test.ts tests\\skill-recommend.test.ts tests\\asset-drift.test.ts tests\\asset-catalog.test.ts tests\\placeholder-deps.test.ts tests\\agent-guard.test.ts tests\\agent-slots.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-26T21:16:51+09:00"
        evidence_path: tests/g8-integration-workflow.test.ts
        output_digest: "sha256:2eab00f92a5bda76ff43a4b215d4620c117939e3221f808603492b5c7ed77d91"
---

# PLAN-L7-171 G8 Adapter/Asset evidence 拡張

## メタデータ

- kind: troubleshoot
- layer: L7
- status: done
- owner: Codex
- created: 2026-06-26
- parent: `PLAN-L7-169-g8-integration-evidence-manifest`
- scope: G8 integration evidence を初期の MODULE/STATE 最小範囲から拡張しつつ、未証明の Adapter/Asset cases については正直な partial coverage のまま保持する。

## 問題

最初の G8 integration evidence manifest により MODULE/STATE coverage は実行可能になったが、workflow validator は全 manifest 内にそれらの family を要求していた。Adapter/Asset evidence は別 manifest として追加する必要があり、その manifest 単独で G8 minimum 全体を満たすと装わないため、incremental L8 climb 作業が止まっていた。

## 判断

required-family checks を per-manifest validation から aggregate workflow validation へ移す。Adapter/Asset coverage 用に 2 つ目の manifest を追加し、IT-ASSET-05 と IT-ASSET-06 だけを mandatory passed として記録する。direct provider invocation、roster CLI、optional-root、threshold proofs が揃うまで、ADAPTER と残りの ASSET cases は partial のまま維持する。

## 生成成果物

- `src/lint/g8-integration-workflow.ts`
- `tests/g8-integration-workflow.test.ts`
- `.helix/evidence/g8-integration/20260626-it-adapter-asset-expansion.json`
- `docs/plans/PLAN-L7-171-g8-adapter-asset-evidence.md`

## 検証

- `bun run vitest run tests\runtime-adapter.test.ts tests\skill-recommend.test.ts tests\asset-drift.test.ts tests\asset-catalog.test.ts tests\placeholder-deps.test.ts tests\agent-guard.test.ts tests\agent-slots.test.ts`
- `bun run vitest run tests\g8-integration-workflow.test.ts tests\runtime-adapter.test.ts tests\skill-recommend.test.ts tests\asset-drift.test.ts tests\asset-catalog.test.ts tests\placeholder-deps.test.ts tests\agent-guard.test.ts tests\agent-slots.test.ts`
- `bun run typecheck`
- `bun run lint`
- `bun run src\cli.ts db rebuild`
- `bun run src\cli.ts doctor`

## 残存する部分 coverage

- `IT-ADAPTER-01`: AdapterPlan intent は coverage 済みだが、provider mock から `InvokeResult` への normalization は未 coverage。
- `IT-ADAPTER-02`: absent/auth/rate-limit/timeout classifier behavior は未証明のまま。
- `IT-ADAPTER-03`: mode-routing/gate-check config schema fixture proof は未証明のまま。
- `IT-ASSET-01..04,07`: catalog、guard、resolver、skill catalog、placeholder checks は unit coverage を持つが、対応する L8 rows は direct CLI/import/threshold closure がまだ必要。
