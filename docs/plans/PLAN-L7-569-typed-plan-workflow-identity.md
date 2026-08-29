---
plan_id: PLAN-L7-569-typed-plan-workflow-identity
title: "PLAN-L7-569 (impl): PLAN current identityをrequirements registryへ束縛する"
kind: impl
layer: L7
drive: agent
status: confirmed
backfill_state: complete
completion_claim_allowed: true
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: VERSION_UP
entry_signals: ["po_directive:Issue #205 typed PLAN identity projection slice"]
created: 2026-08-16
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 915
behavior_contract_id: TYPED-PLAN-WORKFLOW-IDENTITY-001
responsibility_owner: typed-plan-workflow-identity
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "新規PLANが旧route_modeを必須とされ、PLAN kindとworkflow modelが同一enumで照合される"
contract_postconditions: "新規PLANがversion／digest束縛済みtyped identityだけをcurrent fieldとして保持する"
contract_invariants: "PLAN kind、specialist drive、workflow identityを別軸で保持し、legacy route_modeをtyped PLANへ再出力しない"
contract_failures: "未知axis／ID、stale version／digest、route_mode併記をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #205のsurface inventoryと既存U-PROUTE-009が旧route_mode必須化を既存Redとして実証済みであり、schema／lint／oracleを同一atomic patchで置換する"
mutation_oracle_evidence: "2026-08-15T18:33:42Zにsrc/lint/plan-entry-routing.tsのlegacy route_mode再出力guardを一時無効化し、tests/plan-entry-routing.test.tsのU-TPWID-003が1 failed、exit 1となるkillを実測した。apply_patchで復元後、同oracle greenとworktree cleanを確認した"
complexity_effect: net_negative
complexity_justification: "PLAN kindと旧modeの誤った対応表をcurrent authoring pathから除去し、requirements registry tupleへ一本化する"
removal_trigger: "workflow identity schema major version更新時にversioned successorへ置換する"
parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-001, test_path: tests/frontmatter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-002, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-003, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-004, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — frontmatter typed value object" }
  - { role: qa, slot_label: "QA — stale tuple／legacy再出力反例" }
  - { role: tl, slot_label: "TL — requirements axis分離境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-15T18:54:02Z"
    tests_green_at: "2026-08-15T18:53:52Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #205 typed PLAN identity sliceについて、requirements registry tuple、version／digest／axis／ID不一致のfail-close、legacy route_mode再出力拒否、PLAN kindとの軸分離を確認した。Claude Code OpusのU-TPWID-002 blockerを4反例で是正し、non-blockerはIssue #725／#726へ分離した。Opus exact-HEAD独立reviewはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/frontmatter.test.ts tests/plan-entry-routing.test.ts tests/workflow-classification-registry.test.ts tests/workflow-classification-legacy-adapter.test.ts tests/goal-evidence-audit.test.ts tests/l3-g3-freeze-packet-v2.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T18:53:52Z"
        evidence_path: tests/plan-entry-routing.test.ts
        output_digest: "sha256:5ff68370b0b8f1f18353916fa9e82461a27eb560dacbe766919c71ecb09d2f3c"
        result: "typed PLAN identity／catalog mismatch／legacy再出力／governanceの98 tests passed"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T18:54:02Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-15T18:54:02Z"
    evidence_digest: "sha256:a0304c6a36600590f6b571e5249f12158c290a771d2906a06ac59c773b0ff870"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/schema/frontmatter.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-entry-routing.ts, artifact_type: source_module }
  - { artifact_path: tests/frontmatter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/plan-entry-routing.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
  references:
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
    - docs/plans/PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill.md
  blocks: []
---

# PLAN current workflow identity移行

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | typed frontmatter tupleを追加 | [直列] | U-TPWID-001 green |
| 2 | plan-entry gateをcatalog exact bindingへ移行 | [直列] | U-TPWID-002..004 green |
| 3 | targeted、full CI、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

DB projection、Issue／PR ingest、execution episode、right-arm bindingは#205の後続原子的sliceとする。

## 終端収束

PR #722のcanonical mergeとexact-HEAD独立reviewをReverse
`PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill`のR0〜R4で再照合し、
同Reverse PLANの`references`から本PLANへの逆向きlinkを接続した。これにより双方向linkと
typed PLAN identityのrequirements registry束縛が成立したため、`backfill_state: complete`および
`completion_claim_allowed: true`へ遷移する。本PRのcurrent-HEAD CI、Claude Opus exact-HEAD review、
main read-afterをterminal acceptanceとして要求し、いずれかの失敗を完了へ丸めない。
