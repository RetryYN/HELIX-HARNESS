---
plan_id: PLAN-L5-103-project-hook-authority-schema
title: "PLAN-L5-103 (add-design): project hook authorityのtyped contractを定義する"
kind: add-design
layer: L5
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #895 CNW-R-06..08／CNW-AC-009..013をL4境界からL5 typed contractへForwardする"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-AUTHORITY-SCHEMA-001
responsibility_owner: project-hook-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-76がphysical identity、assignment root、4 surface、bounded lifecycleのsystem境界を確定している"
contract_postconditions: "authority receipt、typed failure、deadline、terminal payload preservationのexact schemaがL5↔L8で固定される"
contract_invariants: "physical identityとlexical path、Codex identityとClaude conformance、terminal resultとwake workerを同一fieldへ畳み込まない"
contract_failures: "missing／unknown／unsupported physical evidence、stale root／HEAD／digest、期限超過、親process残留、terminal payload改変をtyped failureへ束縛する"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。production parser／resolver／supervisorは後続L6/L7がRed→Greenを所有する"
complexity_effect: net_negative
complexity_justification: "cwd・環境変数・provider別payloadの暗黙推測を一つのstrict contractへ収束する"
removal_trigger: "後継schemaへreceipt付きmigrationしv1 consumerが0になった時"
parent_design: docs/design/helix/L4-basic-design/project-hook-authority-boundary.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-schema-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — identity／receipt／failure schema" }
  - { role: qa, slot_label: "QA — exact field／mutation／side-effect oracle" }
  - { role: tl, slot_label: "TL — assignment authority／terminal result境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-103-project-hook-authority-schema.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/project-hook-authority-schema.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-authority-schema-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/project-hook-authority-schema-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L4-76-project-hook-authority-boundary.md
  requires:
    - docs/design/helix/L4-basic-design/project-hook-authority-boundary.md
  blocks:
    - issue:895-l6-l7-runtime
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-22T11:46:55Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-22T11:46:55Z"
    evidence_digest: "sha256:332cb9bd3fcb432b6e26f614798707b37754c9ef0cd0503662309a134ec69f56"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-22T11:46:55Z"
    tests_green_at: "2026-08-22T11:43:15Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: 792345fd-722c-4696-85eb-02494ab28d30
    scope: "PR #934 exact HEAD 0bb4d3c4。CNW-HOOK-AUTHORITY-SCHEMA-001のroot 12 field exact set、暗黙fallback禁止、U-CNWHOOKSCHEMA-001..012、catalog／freeze digest、L5／L8 section substanceを監査。blocker 0、非blocker 1（section定型文反復耐性、既知横断クラス）。review: https://github.com/RetryYN/HELIX-HARNESS/pull/934#issuecomment-5380100652"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/project-hook-authority-schema-design.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/design-language.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-22T11:43:15Z", evidence_path: tests/project-hook-authority-schema-design.test.ts, output_digest: "sha256:150172a9fe9b54728741c5a41c95a772e84a481972d329587e94b5bd4359dac0", result: "3 files / 51 tests passed。Claude exact-HEAD reviewとCodex再実測で同一結果。" }
---

# project hook authorityのL5↔L8 Forward

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | physical repository identityとsource identityをexact化 | lexical pathだけでsameを作れない |
| 2 | assignment bindingと4 surface receiptをexact化 | primary fallbackとsurface別推測を拒否できる |
| 3 | deadline／process terminal／result preservationをexact化 | timeout後hangとterminal payload消失を反証できる |
| 4 | L8 mutation oracleを定義 | field削除、stale digest、unsupported stat、payload mutationを捕捉する |
| 5 | Claude exact-HEAD独立review | blocker 0、runtime実装claim 0 |

本PLANはschema設計だけを所有する。production parser、filesystem adapter、process supervisor、SessionStart／doctor／status／dispatch
wiring、Luna spawn read-afterは後続L6/L7へ分離する。
