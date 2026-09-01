---
plan_id: PLAN-REVERSE-719-helix-bench-task-dataset
title: "PLAN-REVERSE-719: HELIX-Bench task datasetのpost-main fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1294
behavior_contract_id: HELIX-BENCH-DATASET-001
responsibility_owner: helix-bench-task-dataset
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: no_change
ddd_modeling_decision: aggregate
legacy_retirement_state: not_applicable
forward_routing: L5
promotion_strategy: reuse-as-is
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1294 HELIX-Bench task datasetのpost-main Reverse fullback"
contract_preconditions: "PR #1303のcanonical merge、exact-head Claude receipt、draft／Ready CI、L3／L6／L8／runtime／3 registryが存在する"
contract_postconditions: "10 task、5カテゴリ、15-field snapshot、public／fixture／hidden registry、dataset digestを要求正本とmain実装へ再接着する"
contract_invariants: "runner／scorer／provider／routingを追加せず、future answer／secret／PII／private review contextをpublicへ含めない"
contract_failures: "wrong HEAD、stale receipt、fixture／digest drift、hidden leakage、historical reuse、provider authority化、premature closeをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Forward実装とU-HBDATA-001〜008を再利用するdocs-only Reverseであり、新しいRedを捏造しない"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/helix-bench-task-dataset.test.tsのU-HBDATA-001〜008がfixture digest check除去、missing fixture、nested entry drift、hidden leakage、historical reuse、provider authority化を個別にfailさせる"
complexity_effect: net_neutral
complexity_justification: "Forward実装を複製せず、要求／設計／検証／main証拠の再接着だけを所有する"
removal_trigger: "HELIX-Bench全体のterminal Reverseが本fullbackを統合した時"
parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md
pair_artifact: docs/test-design/helix/L8-helix-bench-task-dataset-unit-test-design.md
review_evidence:
  - reviewer: "Claude Code / Opus"
    review_kind: cross_agent
    reviewed_at: "2026-09-01T00:07:58Z"
    tests_green_at: "2026-09-01T00:07:50Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    reviewed_head_sha: 72d6d1b15398523f52e618961cc379d162fe75e7
    scope: "PR #1303 exact HEADのdataset、fixture、hidden oracle、digest、negative oracleを独立検収し、BLOCKER 0。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/digest.test.ts tests/helix-bench-task-dataset.test.ts --reporter=verbose"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-01T00:07:50Z"
        evidence_path: tests/helix-bench-task-dataset.test.ts
        output_digest: "sha256:ecceae6cdff3cde571e0d69eb14f39eed593c6504f7e8f4fa489b700e0767c90"
        result: "Forward PLANに束縛済みの2 test files green。Claude exact-HEAD review approve / blocker 0、CI run 33451601694 terminal success。"
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/helix-bench-evaluation.md
    reason: "confirmed HELIX-Bench dataset要件を具体化し、評価軸、provider selection、routing意味を変更しない。"
  - layer: L6-function-design
    decision: not_impacted
    evidence_path: docs/design/helix/L6-function-design/helix-bench-task-dataset.md
    reason: "10 task、5カテゴリ、15-field snapshot、3 registry物理分離とruntimeが一致する。"
  - layer: verification-design
    decision: not_impacted
    evidence_path: docs/test-design/helix/L8-helix-bench-task-dataset-unit-test-design.md
    reason: "U-HBDATA-001〜008がdeterminism、digest、scope、hidden境界、historical reuseを個別検出する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HELIX-Benchの外部boundary、provider adapter、execution episodeを変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "dataset loaderは既存L6責務へ閉じ、DB schemaやtransaction境界を変更しない。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-719-helix-bench-task-dataset.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-bench-task-dataset-terminal-fullback-evidence.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/plans/PLAN-L7-719-helix-bench-task-dataset.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L3-49-helix-bench-evaluation.md
  requires:
    - docs/plans/PLAN-L3-49-helix-bench-evaluation.md
  references:
    - issue:1294
    - pull:1303
    - docs/plans/PLAN-L7-719-helix-bench-task-dataset.md
    - src/runtime/helix-bench-task-dataset.ts
    - tests/helix-bench-task-dataset.test.ts
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — dataset exact set、digest、hidden境界のmain再照合" }
  - { role: tl, slot_label: "TL — #1294同一レーン終端とread-after" }
---

# HELIX-Bench task datasetのpost-main fullback

## R0 現状採取

Forward PR #1303は最終candidate HEAD `72d6d1b15398523f52e618961cc379d162fe75e7`からmerge commit
`3813fa4ccfa788f787905d2080f7e3c1a017edfe`へcanonical mergeされた。Claude exact-head receiptは同じ最終HEAD、
receipt `sha256:c901ae69b02c847a1539ec6e5f28b3cbcddb2dff7b6e845123f50f08094236df`へ束縛される。draft CI
`33451601694`とReady CI `33453562491`はsuccessである。

## R1 観測契約

10 task、5カテゴリ、15-field snapshot、public task／fixture／hidden oracleの物理分離、fixture digest、allowed／forbidden
paths、historical reuse、manual intervention、provider非authorityを観測する。secret、PII、future answer、private review contextは
public task、receipt、commentへ展開しない。

## R2 As-Is照合

HELIX-Bench L3/L10、L6、L8、runtime、3 registry、U-HBDATA-001〜008は、同じdataset exact set、digest、negative boundaryを返す。
Cursor canaryはprovider固有の正解ではなくexternal-worker fixture候補へ正規化されている。

## R3 意図照合

要求、L4、L5、L6、L8の意味変更は不要である。runner、scorer、provider接続、routing判断は後続責務へ残り、本sliceへ混載しない。

## R4 終端判定

PR #1303はcandidate HEAD `72d6d1b15398523f52e618961cc379d162fe75e7`でdraft CI `33451601694`、Ready CI
`33453562491`、Claude exact-HEAD approve / blocker 0を成立させ、merge commit
`3813fa4ccfa788f787905d2080f7e3c1a017edfe`としてmainへ到達した。本Reverseのcanonical mergeとmain read-after後にIssue #1294を閉じる。
