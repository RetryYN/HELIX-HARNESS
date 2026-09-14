---
plan_id: PLAN-L7-487-requirement-discovery-event-projection
title: "PLAN-L7-487 (add-impl): Requirement Discovery event／candidate projection"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
completion_claim_allowed: true
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-30T16:39:40Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-30T16:39:40Z"
    evidence_digest: "sha256:f5143f3407c0dcb1b00daa5ff9be5eabee408ae7fc344b8f5c641227eaf0f16f"
  entries: []
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
contract_postconditions: "shadow JSON schema、L3と同一の8 surface、strict validator、append-only replay、10条件収束がpure APIとmutation oracleで成立する"
contract_invariants: "DB/network/filesystem write 0、L3 canonical write 0、人間判断捏造0、projection直接更新0"
contract_failures: "unknown/extra、event mutation、chain gap、mixed initiative、duplicate question、invalid lifecycle、AI acceptance、surface enum drift、none理由/再評価条件欠落をfail-closeする"
tdd_red_required: true
red_at: "2026-07-30T15:01:16Z"
green_at: "2026-07-30T15:01:31Z"
mutation_oracle_evidence: "tests/requirement-discovery.test.tsでcandidate_acceptedのrequireHumanを除去するとU-RDJ-004がfailed/red（output sha256:1529dd83fe6ad8444beaf586770ffaca6216fb36f697a0046504415dad0d29a2）。L3 8-surface drift oracleとnone反例を追加後、U-RDJ-000..007が8/8 green（output sha256:7101861f4cf2a70a5f190db28ae0e10f22fc909f993ca0a6db0e7033fea5a238）"
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
  - { parent_design: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, oracle_id: U-RDJ-007, test_path: tests/requirement-discovery.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-487-requirement-discovery-event-projection.md, artifact_type: markdown_doc }
  - { artifact_path: config/requirement-discovery-event-schema.json, artifact_type: json_config }
  - { artifact_path: src/requirements/requirement-discovery.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-discovery.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md
  requires:
    - docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md
    - docs/plans/PLAN-REVERSE-487-requirement-discovery-event-projection.md
  references:
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
    - docs/design/helix/L5-detail/requirement-translation-obligation.md
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
  blocks:
    - docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-30T16:39:40Z"
    tests_green_at: "2026-07-30T16:39:40Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #291 HEAD 33f005f90d0530039da819c74f2e906507fe75a8をclean detached worktreeで独立review。前回Highの6→8 surfaceとMediumのL3 drift oracleをU-RDJ-000/007で閉鎖。targeted 8/8、typecheck、Biomeを独立再現し、DB receipt sha256:28d2a3b3519bb7db9c8784361934bfaa422ee727cc290facf2ea741ccc7adb0d、converged=trueを確認。CI full gateはPLAN confirm後に一巡する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/requirement-discovery.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-30T16:39:40Z"
        evidence_path: tests/requirement-discovery.test.ts
        output_digest: "sha256:7101861f4cf2a70a5f190db28ae0e10f22fc909f993ca0a6db0e7033fea5a238"
        result: "8 passed"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-30T16:39:40Z"
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "型エラー 0"
      - kind: lint
        command: "npx --no-install biome check config/requirement-discovery-event-schema.json src/requirements/requirement-discovery.ts tests/requirement-discovery.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-30T16:39:40Z"
        evidence_path: src/requirements/requirement-discovery.ts
        output_digest: "sha256:76d2e00a79c70ad6e372cc84d418b1de21f1ac69165d1353c33015042c4b742c"
        result: "diagnostics 0"
      - kind: doctor
        command: "npx --no-install tsx src/doctor/l3-g3-logical-db-receipt.ts"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-30T16:39:40Z"
        evidence_path: src/doctor/l3-g3-logical-db-receipt.ts
        output_digest: "sha256:28d2a3b3519bb7db9c8784361934bfaa422ee727cc290facf2ea741ccc7adb0d"
        result: "converged=true, stale/orphan/finding=0/0/0"
---

# PLAN-L7-487: 要求発見event／candidate projection

## §工程表

### Step 1: Red検証

schema／enum drift、event改変、chain gap、unknown/extra、AI acceptance、L2 frozen、
score-only convergenceをfixture mutationで再現する。

### Step 2: Green実装

strictなZod union、canonical SHA-256、candidate lifecycle、人間authority、
deterministic reducer、10条件収束の最小pure APIを実装する。

### Step 3: リファクタリング

schema enumとpayload contractを一ownerへ集約し、DB／CLI／filesystem portを追加しない。

## §closure

PLAN-L6-88 pair freeze、U-RDJ-000..007、型検査、全量CI、DB収束、
authoring runtimeと異なるAI-B reviewを同一HEADへ束縛した場合だけconfirmedへ遷移する。
