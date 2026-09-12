---
plan_id: PLAN-RECOVERY-1751-scrum-operation-typed-projection
title: "PLAN-RECOVERY-1751: Scrum運営7 sourceをtyped declarationへ投影する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
github_issue_id: 1751
behavior_contract_id: SCRUM-OPERATION-TYPED-PROJECTION-001
responsibility_owner: scrum-operation-governance
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
contract_preconditions: "hybrid-vmodel source manifestの11 Scrum bindingと、current L3/L10、design declaration DB projectionをread-afterできる"
contract_postconditions: "7 operationの採用意味、L3要件、L10受入、typed declaration、DB projectionが同一contractへ束縛され、Scrum ReverseのVモデル還流を検出できる"
contract_invariants: "ZIP sourceはmigration provenanceのまま保持し、Project Statusや語句heuristicだけをgreen根拠にせず、管理Scrumとproduct Forwardを混在させない"
contract_failures: "7 operationの欠落・重複・誤layer・source未束縛・ceremonyまたはmetricゼロ・DB非収束・Scrum内完結をfail-closeする"
tdd_red_required: true
mutation_oracle_required: true
complexity_effect: net_negative
complexity_justification: "既存vmodel-docgen-fit宣言とprojectionを拡張し、別Scrum engineや別DB tableを作らない"
removal_trigger: "7 operationが恒常的なmanagement-operation registryへ吸収され、個別移行PLANのconsumerが0になった時"
backprop_decision: not_required
backprop_decision_reason: "本PLAN自身がDBで観測した管理工程欠落をL3/L10候補へScrum Reverseする上流sliceであるため"
parent_design: docs/governance/candidates/scrum-operation-typed-projection-requirements.md
pair_artifact: docs/governance/candidates/scrum-operation-typed-projection-acceptance.md
verification_bindings:
  - { parent_design: docs/governance/candidates/scrum-operation-typed-projection-requirements.md, oracle_id: U-SCRUMOPS-001, test_path: tests/current-location.test.ts }
dependencies:
  parent: null
  requires: []
  references: ["issue:1751", "issue:1500", "issue:1737"]
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — DB実測と7 sourceの採否境界" }
  - { role: tl, slot_label: "TL — 管理Scrumとproduct Forwardの責務境界" }
  - { role: qa, slot_label: "QA — 7 operation、DB収束、Scrum Reverseのnegative oracle" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1751-scrum-operation-typed-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/scrum-operation-typed-projection-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/candidates/scrum-operation-typed-projection-acceptance.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/current-location.test.ts, artifact_type: test_code }
  - { artifact_path: tests/db-projection-ingestion.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-11T23:52:50Z"
    tests_green_at: "2026-09-11T23:49:31Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: a8e5fedeffd4d530096a0a34f35c844abeafc11d
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1752#issuecomment-5641953718"
    ci_evidence_generation: "run:34657347167:attempt:2:success"
    scope: "draft第一世代のexact HEADレビュー。7 operation exact set、L3/L10 pair、管理Scrumとproduct Forwardの分離、ZIP provenance境界、DB projection、全shard successを独立照合しblocker 0。S4判断とruntime実装は未完了。"
    green_commands:
      - kind: smoke
        command: "gh run view 34657347167 --json headSha,status,conclusion,createdAt,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-09-11T23:49:31Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:62346226621d780da63c4c9893f9a9c61b08410d45d0d5305745ab579ca49b3b"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-09-11T23:52:50Z"
  review_binding:
    reviewer: "Claude Code / Fable 5.1"
    reviewed_at: "2026-09-11T23:52:50Z"
    evidence_digest: "sha256:dae6e289adc2fad801993311822451a5ed50c890561282d8a23fc775f8504970"
  entries: []
---

# Scrum運営層typed projectionのRecovery計画

## S1判断

独立review後のconfirmed世代で、`tdd_red_required`および`mutation_oracle_required`に対応する
実行証跡が未登録であることが検出された。このため本PLANはdraftへ戻し、Red／Green時刻と
resolvable mutation oracle evidenceを取得するまで再confirmしない。

管理側Scrumのsource bindingは11件あるが、`story-mapping`、`estimation-velocity`、`dor-dod`、
`daily-record`、`sprint-review`、`retrospective`、`burndown-velocity`の7件はDBで未観測である。
source YAMLそのものをcurrent authorityへ昇格せず、採用した意味だけを既存L3/L10 pairへ追加する。

## Forward／Reverse順序

1. L3へ7 operationの責務、owner、source binding、Scrum Reverse条件を追加する。
2. L10へexact set、欠落、重複、誤layer、heuristic-only、DB非収束の受入条件を追加する。
3. Red testで現行missing 7を固定し、typed declaration追加後にGreenへする。
4. declaration欠落またはcategory誤配線のmutationをkillする。
5. DB rebuildを2回実行し、current-location／roadmap／vmodel fitでmissing 0を確認する。
6. independent exact-HEAD reviewとCI後、S4判断を記録して正規Vモデルへ還流する。

## 非対象

- 新しいScrum runtime engineまたはDB table
- ZIP sourceの実行authority化
- GitHub Projectだけによる意味・実行・完了判定
- リリース、tag、配布cutover
