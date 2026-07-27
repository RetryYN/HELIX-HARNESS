---
plan_id: PLAN-L7-476-drive-route-catalog-gate
title: "PLAN-L7-476 (add-impl): 全駆動モデル経路catalog gate"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-28 駆動モデル経路定義を機械gateで拘束する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 165
engineering_discipline_required: true
behavior_contract_id: U-DRCAT-001
responsibility_owner: drive-route-catalog
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "drive-route-catalog.v1とrepository文書が存在する"
contract_postconditions: "catalog exact setと各参照をdoctorで再現検査する"
contract_invariants: "read-only lintとし、route選択やDB stateを暗黙変更しない"
contract_failures: "schema、exact set、kind、next route、documentのdriftをexit非0へ接続する"
tdd_red_required: true
red_at: "2026-07-28T02:55:00+09:00"
green_at: "2026-07-28T02:57:00+09:00"
mutation_oracle_evidence: "tests/drive-route-catalog.test.tsがroute削除、孤児next、不許可kind、重複signal、欠落文書のseeded反例を検出する。これらの検査を素通しするmutation (exact set照合除去、next_routes存在検査除去、kind allowlist緩和、document存在検査除去) は同oracleにkillされredになり、15 route exact setと工程専門pairを保つ実装だけがgreenで残る"
complexity_effect: justified_positive
complexity_justification: "新runtimeやDB schemaを追加せず、JSON catalogと単一pure lintを既存doctorへ統合する"
removal_trigger: "workflow schemaが同じroute exact set検査を所有した時点で本lintを統合する"
parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-001, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-002, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-003, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-005, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-004, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-006, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-007, test_path: tests/drive-route-catalog.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — catalog validatorとdoctor配線" }
  - { role: qa, slot_label: "QA — exact setと孤児遷移mutation" }
  - { role: tl, slot_label: "TL — route意味と既存gate整合" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-476-drive-route-catalog-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/mode-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/schema/route-map.ts, artifact_type: source_module }
  - { artifact_path: src/lint/drive-route-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/drive-route-catalog.test.ts, artifact_type: test_code }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-27T21:03:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-27T21:03:00Z"
    evidence_digest: "sha256:783f4d6185dded5cecb04c9713e7f2e58940ea56921a1aeb1601b6d0a72767e9"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-27T21:03:00Z"
    tests_green_at: "2026-07-27T21:02:50Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #171 の current HEAD f8d1cf53 を clean detached worktree で独立レビューした。analyzeDriveRouteCatalog は route exact set、route_id/signal/kind の重複、model→mode 解決、MODE_ALLOWED_KINDS との kind 整合、ROUTE_SIGNAL_MAP との signal 双方向整合、next_routes の孤児参照、document 存在、specialist の parent/document を fail-close する。doctor 配線は ok 集約・failing-checks・messages の 3 箇所すべてに入っており、片側だけ通る抜けが無いことを diff で確認した。MODE_ALLOWED_KINDS.scrum の [poc] → [design,poc,impl] 拡張は v_design_scrum_impl_hybrid route が必要とする union であり、production_scrum は route 単位で allowed_kinds=[poc] を維持するため実効的な規律低下は無い。ROUTE_SIGNAL_MAP への 2 entry 追加は先頭挿入だが、routing は matchLength 降順→index 昇順の順で解決されるため既存 signal の routing を shadow しない (routing-contracts.ts の sort で確認)。tests/cli-surface.test.ts の maxBuffer 16MB 追加は ENOBUFS による無意味な失敗モードを除去するのみで、assertion の緩和・skip・期待値変更を含まない。freeze digest 同期 3 箇所は design-catalog.yaml の実測 sha256 d8a6200f… と一致する。非 blocker: 本 PR の changed path 8 件が両 PLAN の generates に未登録 (うち新規 process 文書 3 件は独立 review で PLAN-L6-81 へ登録済み、残りは他 PLAN lineage 所有で Issue #166 の対象)。"
    green_commands:
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-27T20:45:00Z"
        evidence_path: src/lint/drive-route-catalog.ts
        output_digest: "sha256:761e8616c4875c6aa04e2af4713f063d35d12ccccb64a3898ba989bf2c72c14c"
        result: "exit 0"
      - kind: unit_test
        command: "npx --no-install vitest run tests/drive-route-catalog.test.ts tests/plan-entry-routing.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-27T21:02:50Z"
        evidence_path: tests/drive-route-catalog.test.ts
        output_digest: "sha256:71bfa3fe34b5198cad7e47190318733bdf08b3b40ef65daa9277ed29db1d2061"
        result: "30 passed"
dependencies:
  parent: docs/plans/PLAN-L6-81-drive-route-catalog.md
  requires:
    - docs/process/modes/README.md
  references:
    - docs/governance/drive-route-catalog.md
  blocks: []
---

# PLAN-L7-476: 全駆動モデル経路catalog gate

## 完了条件

- catalog validatorとdoctor hard gateがgreenになる。
- Forward／Scrum／Hybridだけでなく全entry routeの欠落が検出される。
- Add-feature Bを含むroute variantがkind／backfill規律と矛盾しない。
