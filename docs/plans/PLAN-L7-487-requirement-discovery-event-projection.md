---
plan_id: PLAN-L7-487-requirement-discovery-event-projection
title: "PLAN-L7-487 (add-impl): Requirement Discovery event／candidate projection"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-30 Requirement Discovery LoopからL3 strict JSON正本へ収束する"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
github_issue_id: 284
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-DISCOVERY-EVENT-PROJECTION
responsibility_owner: requirement-discovery-event-projection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-88が同一behavior contractのschema／projection境界をpair freezeする"
contract_postconditions: "shadow JSON schema、strict validator、append-only replay、10条件収束がpure APIとmutation oracleで成立する"
contract_invariants: "DB/network/filesystem write 0、L3 canonical write 0、人間判断捏造0、projection直接更新0"
contract_failures: "unknown/extra、event mutation、chain gap、mixed initiative、duplicate question、invalid lifecycle、AI acceptanceをfail-closeする"
tdd_red_required: true
red_at: "2026-07-30T15:01:16Z"
green_at: "2026-07-30T15:01:31Z"
mutation_oracle_evidence: "candidate_acceptedのrequireHumanを除去するとU-RDJ-004がfail（output sha256:1529dd83fe6ad8444beaf586770ffaca6216fb36f697a0046504415dad0d29a2）、復元後U-RDJ-000..006が7/7 green（output sha256:bb0f2e8ec113a1549a3801ba9b339fddef9192ef998da242eeb7ecd7e84cd3e4）"
complexity_effect: justified_positive
complexity_justification: "Zod strict unionと単一pure reducerを新設するため正味増加するが、DB adapter、CLI、別engine、別ledgerを追加しない"
removal_trigger: "G1/G3後のRequirement Discovery Engineが同一APIを吸収し本migration componentのconsumerが0になった時点"
parent_design: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md
pair_artifact: docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — strict unionとdeterministic reducer実装"
  - role: qa
    slot_label: "QA — mutation oracleと10条件収束検証"
  - role: tl
    slot_label: "TL — bootstrap reviewとauthority独立判断"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, oracle_id: U-RDJ-000, test_path: tests/requirement-discovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, oracle_id: U-RDJ-001, test_path: tests/requirement-discovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, oracle_id: U-RDJ-002, test_path: tests/requirement-discovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, oracle_id: U-RDJ-003, test_path: tests/requirement-discovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, oracle_id: U-RDJ-004, test_path: tests/requirement-discovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, oracle_id: U-RDJ-005, test_path: tests/requirement-discovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, oracle_id: U-RDJ-006, test_path: tests/requirement-discovery.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-487-requirement-discovery-event-projection.md, artifact_type: markdown_doc }
  - { artifact_path: config/requirement-discovery-event-schema.json, artifact_type: json_config }
  - { artifact_path: src/requirements/requirement-discovery.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-discovery.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md
  requires:
    - docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md
  references:
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
    - docs/design/helix/L5-detail/requirement-translation-obligation.md
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
  blocks:
    - docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
---

# PLAN-L7-487: Requirement Discovery event／candidate projection

## §工程表

### Step 1: Red

schema／enum drift、event改変、chain gap、unknown/extra、AI acceptance、L2 frozen、
score-only convergenceをfixture mutationで再現する。

### Step 2: Green

strict Zod union、canonical SHA-256、candidate lifecycle、human authority、
deterministic reducer、10条件収束の最小pure APIを実装する。

### Step 3: Refactor

schema enumとpayload contractを一ownerへ集約し、DB／CLI／filesystem portを追加しない。

## §closure

PLAN-L6-88 pair freeze、U-RDJ-000..006、typecheck、full CI、DB convergence、
authoring runtimeと異なるAI-B reviewを同一HEADへ束縛した場合だけconfirmedへ遷移する。
