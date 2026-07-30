---
plan_id: PLAN-L7-488-requirement-ir-shadow-migration
title: "PLAN-L7-488 (add-impl): Requirement IR shadow migration"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-30T19:28:54Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-30T19:28:54Z"
    evidence_digest: "sha256:ec7679c767f33e0ba3a4b6c578a15f6548e4503cf1eee16cd68f352efc8931b4"
  entries: []
entry_signals:
  - "po_directive:2026-07-30 現行153要求を意味不変のshadow JSONへ移行する"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
github_issue_id: 285
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-IR-SHADOW-MIGRATION
responsibility_owner: requirement-ir-shadow-migration
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-89がshadow authority、意味不変、既知12 owner、3 design portをpair freezeする"
contract_postconditions: "153/24/72/24 shadow、semantic parity、exactly-one owner、snapshot再現がpure compilerとmutation oracleで成立する"
contract_invariants: "canonical write 0、発見証拠捏造0、別DB/engine 0、既存Markdown変更0"
contract_failures: "statement drift、missing/duplicate record、owner重複、HAC/HAT欠落、既知12 owner driftをfail-closeする"
tdd_red_required: true
red_at: "2026-07-30T15:39:15Z"
green_at: "2026-07-30T15:48:01Z"
mutation_oracle_evidence: "既存ledger digestに対して要求文cellだけをhashした初回実装ではU-RIR-001..004がfailし、既存oracleと同じ要求行全体の意味hashへ修正した。schema／stable-ID shard再現oracle追加後のfinal runでU-RIR-000..006が7/7 green。U-RIR-005はstatement drift、owner重複、ledger欠落を各々fail-closeする"
complexity_effect: justified_positive
complexity_justification: "pure migration compiler、schema、生成adapterを新設するが、runtime service、DB adapter、canonical readerを追加しない"
removal_trigger: "PR5 canonical cutover後にshadow compiler／snapshotのconsumerが0になった時点"
parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md
pair_artifact: docs/test-design/helix/L8-requirement-ir-shadow-migration-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — pure migration compilerとshadow snapshot実装"
  - role: qa
    slot_label: "QA — semantic parity／owner／mutation oracle検証"
  - role: tl
    slot_label: "TL — canonical write 0とcutover前authorityの独立判断"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md, oracle_id: U-RIR-000, test_path: tests/requirement-ir-shadow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md, oracle_id: U-RIR-001, test_path: tests/requirement-ir-shadow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md, oracle_id: U-RIR-002, test_path: tests/requirement-ir-shadow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md, oracle_id: U-RIR-003, test_path: tests/requirement-ir-shadow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md, oracle_id: U-RIR-004, test_path: tests/requirement-ir-shadow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md, oracle_id: U-RIR-005, test_path: tests/requirement-ir-shadow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md, oracle_id: U-RIR-006, test_path: tests/requirement-ir-shadow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-488-requirement-ir-shadow-migration.md, artifact_type: markdown_doc }
  - { artifact_path: config/requirement-ir-shadow-schema.json, artifact_type: json_config }
  - { artifact_path: generated/requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: generated/requirements-ir/requirements.json, artifact_type: json_config }
  - { artifact_path: generated/requirements-ir/system_contracts.json, artifact_type: json_config }
  - { artifact_path: generated/requirements-ir/acceptance_cases.json, artifact_type: json_config }
  - { artifact_path: generated/requirements-ir/system_tests.json, artifact_type: json_config }
  - { artifact_path: src/requirements/requirement-ir-shadow-generator.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-ir-shadow.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-ir-shadow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
  requires:
    - docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
  references:
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
    - docs/design/helix/L5-detail/requirement-translation-obligation.md
  blocks:
    - docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-30T19:28:54Z"
    tests_green_at: "2026-07-30T19:28:54Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #294 HEAD d35ff71240bbd2b7e6aca04a955f902c62889e04を新規clean detached worktreeで独立review。153/24/72/24、statement digest 153/153、owner/HAC/HAT、strict schema、4 shard byte再現、Design Template JSON 3 port、捏造evidence 0を確認し、Critical/High/Medium 0。PLAN 2件のconfirm、objective counter/doc 21への完全復帰を同一commitにする終端状態も独立実験でgreen。review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/294#issuecomment-5135356349"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/requirement-ir-shadow.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-30T19:28:54Z"
        evidence_path: tests/requirement-ir-shadow.test.ts
        output_digest: "sha256:e973fc5354aeb8e32de037e41aed83511a30063133374c1cf5ced2dd7831ad14"
        result: "U-RIR-000..006 7/7 pass"
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/goal-evidence-audit.test.ts tests/cli-surface.test.ts -t 'U-OUTSTANDING-012|HELIX objective evidence audit'"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-30T19:28:54Z"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:f2fb2c9c212a09b96d7003061ff044cb09bd36f6b5edbf3be8b14f3fc6b3fb1d"
        result: "bootstrap state 15 pass, 85 skipped"
---

# PLAN-L7-488: 要求IRのshadow移行

## §工程表

1. Red: statement digestの誤った部分抽出、owner重複、ledger欠落をfixture mutationで検出する。
2. Green: exact denominator、semantic parity、owner correction、shadow snapshotを最小pure compilerで成立させる。
3. Refactor: parse、canonical digest、owner correctionを一ownerへ集約し、runtime serviceを追加しない。

PLAN-L6-89 pair freeze、U-RIR-000..006、型検査、全量CI、DB収束、
authoring runtimeと異なるAI-B reviewを同一HEADへ束縛した場合だけconfirmedへ遷移する。
