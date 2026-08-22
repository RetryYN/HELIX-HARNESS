---
plan_id: PLAN-REVERSE-561-scrum-discovery-typed-process
title: "PLAN-REVERSE-561: Production ScrumとDiscovery processを独立axisへ再接着する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T15:51:33Z"
    tests_green_at: "2026-08-16T15:51:16Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Issue #206のProduction Scrum／Discovery processをrequirements-owned development style、case-driven model、subrouteへ照合した。Scrumを旧mode／kind=pocへ戻さず、DiscoveryとScrum Reverseのstate machineを混同しないことを確認した。"
    green_commands:
      - kind: unit_test
        command: "npm exec --offline -- vitest run tests/process-scrum-discovery-authority.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/process-scrum-discovery-authority.test.ts
        output_digest: "sha256:ef5b0f968995295ed4d2770eecdf45dc936b3892adcd921e456f60c3ec53da32"
        result: "Scrum／Discovery authority oracle 5 tests green"
      - kind: lint
        command: "npm exec --offline -- tsx src/cli.ts plan lint docs/plans/PLAN-REVERSE-561-scrum-discovery-typed-process.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: docs/plans/PLAN-REVERSE-561-scrum-discovery-typed-process.md
        output_digest: "sha256:7f3c2e86c951c8f9cd22f553fcddb378906e4019c66b4644043bb99ca36f4bcd"
        result: "PLAN lint green"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206 Scrumを旧mode／kind=poc／S0-S4としてDiscoveryと混在させるactive process guidanceを是正する"
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: SCRUM-DISCOVERY-PROCESS-AUTH-001
responsibility_owner: scrum-discovery-process-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "Scrum文書が旧9-mode、kind=poc、S0-S4をcurrent identityとし、DiscoveryとProduction Scrumを共通modeへ畳み込む"
contract_postconditions: "Production Scrum／Hybridをdevelopment style、Discoveryをcase-driven model、Scrum Reverseをsubrouteとして別axisへ投影する"
contract_invariants: "DiscoveryだけがDISCOVERY_POC_S0_S4を持ち、Scrum ReverseだけがSCRUM_REVERSE_SR0_SR4を持つ"
contract_failures: "Scrum駆動モデル、Scrum kind=poc、Scrum S0-S4、DiscoveryのScrum phase化、Bun active command、旧L0-L14 current guidanceを拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "current-main二文書の旧定義が既存Redであり、U-PSDA-001〜005を同一sliceで追加して再導入をfail-closeする"
mutation_oracle_evidence: "U-PSDA-001〜005がaxis、ID、親state machine、legacy隔離、Bun／旧layer拒否を独立assertし、旧Scrum mode定義の復活をkillする"
complexity_effect: net_negative
complexity_justification: "重複していたScrum／Discovery S4説明をaxis別processへ分離し、Production Scrumのcurrent手順をSR0-SR4へ一本化する"
removal_trigger: "process docsがregistryから完全生成され手書きprojection consumerが0になった時点"
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "§4、§4.1、§4.2.1のdevelopment style／case-driven model／subroute／state machine境界を変更せずprocessへ投影する。"
  - layer: L10-system-test
    decision: preserve
    evidence_path: docs/test-design/helix/github-autonomous-operations-acceptance.md
    reason: "GH-T-001の異軸同一enum拒否を二文書の実行可能oracleへ具体化する。"
agent_slots:
  - { role: se, slot_label: "SE — Scrum／Discovery process axis再投影" }
  - { role: qa, slot_label: "QA — state machine混同／legacy command mutation" }
  - { role: tl, slot_label: "TL — requirements registry意味一致" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-561-scrum-discovery-typed-process.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/scrum.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/discovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/process-scrum-discovery-authority.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-REVERSE-560-process-workflow-authority-index.md
  requires:
    - docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md
    - docs/plans/PLAN-REVERSE-560-process-workflow-authority-index.md
  references:
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - config/workflow-classification-catalog.v1.json
---

# Production Scrum／Discovery processのtyped authority再接着

## R0 現状採取

Scrum文書は旧9-mode、requirements v1.2、kind=poc、S0〜S4をcurrent guidanceとし、
DiscoveryとProduction Scrumをmode入口だけで区別していた。Discovery文書も旧mode identity、
Bun command、旧要件pointerを残していた。

## R1 skip判定

既知のtaxonomy driftを正規化するためR1をskipする。旧`scrum`は複数identityへ対応して曖昧なため、
互換adapterでも推測せずfail-closeする。

## R2 As-Is照合

requirements registryはProduction Scrum／Hybridをdevelopment style、Discoveryをcase-driven model、
Scrum Reverseをsubrouteとする。state machineはDiscovery S0〜S4とScrum Reverse SR0〜SR4だけである。

## R3 意図照合

PO意図は旧15-route／9-modeの名称変更ではなく、新requirementsから旧定義を一新することである。
従ってProduction ScrumをPoC routeへ戻さず、各production sliceをScrum ReverseでL1〜L5へbackfillする。

## R4 Forward再入

本sliceはScrum／Discovery本文だけを所有する。他workflow model文書、README、setup、CLI／label／template、
runtime／DB／doctor projectionはIssue #206の後続sliceへ残す。U-PSDA-001〜005、authority gate、
Claude exact-HEAD review、main read-afterがgreenになるまでcompletion claimを許可しない。
