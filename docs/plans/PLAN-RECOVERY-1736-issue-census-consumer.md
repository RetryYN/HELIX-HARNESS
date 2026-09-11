---
plan_id: PLAN-RECOVERY-1736-issue-census-consumer
title: "PLAN-RECOVERY-1736: Issue hierarchy contract censusをread-only CLIへ接続する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: not_started
created: 2026-09-11
updated: 2026-09-11
owner: Codex / TL
github_issue_id: 1733
behavior_contract_id: U-IHIER-022
responsibility_owner: github-issue-hierarchy
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
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
contract_preconditions: "typed Issue hierarchy contract censusは実装済みだが、CLIとdoctorが旧collectorだけを接続し、管理工程がinvalid Issueを含む全母集団を取得できない"
contract_postconditions: "read-only CLIが全Issueをvalid nodeまたはtyped findingへ分離し、schema・件数・exit codeを公開し、doctorがCLI接続消失を検出する"
contract_invariants: "既存censusを再利用し、GitHub write、契約補完、role推定、native graph apply、DB更新、Projects同期を追加しない"
contract_failures: "入力mode欠落・重複、不正source、GitHub API失敗、typed finding存在、doctor marker消失をfail-closeする"
tdd_red_required: true
red_test: "2026-09-11T14:32:24+09:00、U-IHIER-022はunknown commandでstdout空／exit 1、U-IHIER-023はdoctor marker欠落で失敗した"
red_at: "2026-09-11T14:32:24+09:00"
green_at: "2026-09-11T14:33:39+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-11T14:35:35+09:00、census finding存在時のexit 1分岐をexit 0へ一時変異し、U-IHIER-022が1 failed / 1 passed（exit 1）となることを実測した。復元後にGreenへ戻した"
complexity_effect: net_neutral
complexity_justification: "既存pure censusをCLI adapterへ接続し、既存doctor wiring gateへmarkerを1件追加する。新parser・graph・writer・DB schemaは追加しない"
removal_trigger: "Portfolio runtimeが同じtyped census schemaを正規consumerとして提供し、CLI compatibility surfaceのconsumer 0が実証された時"
backprop_decision: not_required
backprop_decision_reason: "既存L6 census設計の未接続consumerを追加するだけで、要求意味やIssue hierarchy contractは変更しない"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-022, test_path: tests/issue-hierarchy-census-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-023, test_path: tests/slow/doctor.test.ts }
dependencies:
  parent: null
  requires: [docs/plans/PLAN-RECOVERY-1733-issue-contract-census.md]
  references: ["issue:1733", "issue:1732", "issue:1684", "issue:1682"]
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — Issue census consumerと管理工程authorityの整合" }
  - { role: se, slot_label: "SE — 既存censusとCLI adapter境界" }
  - { role: qa, slot_label: "QA — mixed valid/invalid、exit code、wiring消失反例" }
  - { role: tl, slot_label: "TL — read-only consumerと後続apply責務の分離" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1736-issue-census-consumer.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli/commands/issue-hierarchy-census.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-hierarchy-census-cli.test.ts, artifact_type: test_code }
  - { artifact_path: .helix/evidence/review-1736/preflight-gate-results.json, artifact_type: json_config }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-test-owner-disposition-direct.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/infinity-loop-strict-design-contract.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-11T06:24:02Z"
    tests_green_at: "2026-09-11T06:18:48Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 44a875e0-4347-4802-8e8a-87cb4f105537
    reviewed_head_sha: 454738416db8bec0efdce7a6e3759336fb21d400
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1736#issuecomment-5630388257"
    ci_evidence_generation: "run:34569042291:attempt:1:failure"
    scope: "PR #1736の454738416db8bec0efdce7a6e3759336fb21d400をClaude Code / Fable 5.1が独立検収した。既存typed census primitiveを再実装せずread-only CLIとdoctorへ接続し、exactly-one入力、全pagination、PR除外、Issue番号順、finding存在時exit 1、command module移動後のdoctor wiringを確認した。GitHub write、意味推定、native apply、DB／Projects接続は非対象。commit側blocker 0、52/52 green。CI run 34569042291の全体redは当時未修正だったPR bodyとPLAN draft statusによる。"
    green_commands:
      - kind: typecheck
        command: "npx tsc --noEmit"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-09-11T06:18:48Z"
        evidence_path: .helix/evidence/review-1736/preflight-gate-results.json
        output_digest: "sha256:1e54a34a418295031a35df3a81f02ea9108585bc9dbc28e02b0f04ce5a61dfc4"
        result: "GitHub Actions run 34569042291のpreflight aggregationがtypecheck成功を記録した"
---

# Issue hierarchy censusのconsumer接続

## 目的

#1735で成立したtyped censusを、全Issue snapshotを扱えるread-only CLIへ接続する。既存実装を再利用し、
管理工程がvalid contractだけの縮小母集団を全数と誤認する経路を減らす。

## 完了条件

- [x] U-IHIER-022/023のRed→Greenとmutation killが成立する。
- [x] input JSONとrepositoryのexactly-one入力がfail-closeする。
- [x] typed findingがある場合にexit 1、全件validならexit 0となる。
- [x] doctorがcensus CLIの無音退役を検出する。
- [ ] targeted、typecheck、PLAN lint、独立review、CI、merge/read-afterが成立する。
---
