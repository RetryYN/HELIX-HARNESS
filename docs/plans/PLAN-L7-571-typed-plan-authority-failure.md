---
plan_id: PLAN-L7-571-typed-plan-authority-failure
title: "PLAN-L7-571 (impl): typed PLAN authority読込失敗をreason付きで閉じる"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #725 typed PLAN authority failure remediation"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 725
behavior_contract_id: TYPED-PLAN-AUTHORITY-FAILURE-001
responsibility_owner: typed-plan-workflow-identity
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "typed PLAN loaderがauthority読込例外をcatalog=nullへ畳み、失敗原因とlocatorを失う"
contract_postconditions: "missing／invalid／projection driftを別reasonとrepository-relative authority pathで返す"
contract_invariants: "requirements registryが唯一の意味authorityであり、canonical failureをlegacy greenで相殺しない"
contract_failures: "authority欠落、parse／schema不正、generated projection driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated branchでfailure classifierと反例oracleを同一atomic patchとして作成したため、存在しない実装前Red時刻を捏造しない。確認前にseeded mutationを実測してkill evidenceを記録する"
mutation_oracle_evidence: "2026-08-15T19:12:20ZにENOENT分類をworkflow_identity_authority_missingからworkflow_identity_authority_invalidへ一時変異し、tests/plan-entry-routing.test.tsのU-TPWLOAD-001がexpected missing／received invalidで1 failed、他18 passed、exit 1となるkillを実測した。apply_patchで復元後、同oracle greenを再確認する"
complexity_effect: net_negative
complexity_justification: "例外握り潰しを単一typed failure classifierへ置換し、diagnostic分岐を明示する"
removal_trigger: "typed PLAN identity loaderがversioned successorへ置換された場合に同じfailure contractを移管する"
parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWLOAD-001, test_path: tests/plan-entry-routing.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed authority failure classifier" }
  - { role: qa, slot_label: "QA — missing／invalid／drift反例" }
  - { role: tl, slot_label: "TL — requirements authority fail-close境界" }
review_evidence:
  - reviewer: claude-code-opus
    review_kind: cross_agent
    reviewed_at: "2026-08-15T19:45:34Z"
    tests_green_at: "2026-08-15T19:44:38Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-5
    scope: "Issue #725 authority failure sliceについて、missing／invalid／driftのreason分離、repository-relative locator、authority failure優先のfail-close、U-TPWLOAD-001の3反例、5-path manifestを確認した。Claude Code Opusがblocker 0（PLAN確定処理を除く）と判定し、Codex TLが同一HEADの78 testsを再実測した。message文字列依存はnon-blockerとしてIssue #730へ分離した。PR terminal receiptはcurrent HEADのCI／DB convergence後に別途必須。"
    green_commands:
      - kind: unit_test
        command: "NODE_NO_WARNINGS=1 npx --no-install vitest run --project fast tests/plan-entry-routing.test.ts tests/frontmatter.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/design-coverage.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T19:44:38Z"
        evidence_path: tests/plan-entry-routing.test.ts
        output_digest: "sha256:2ccc528f3b340eb9282ed5a2a11b2dff5003d79e18729cd0e638ddff54c2e49b"
        result: "8 suites／78 tests passed。authority missing／invalid／driftのexact reason oracleを含む"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T19:45:34Z"
  review_binding:
    reviewer: claude-code-opus
    reviewed_at: "2026-08-15T19:45:34Z"
    evidence_digest: "sha256:a080b25f2b953cf78cbafd588a50cf1245d81498b72c91d17d416337f21c7786"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-571-typed-plan-authority-failure.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/plan-entry-routing.ts, artifact_type: source_module }
  - { artifact_path: tests/plan-entry-routing.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  references:
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
  blocks: []
---

# typed PLAN authority failure収束

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | authority load failureをtyped reasonへ分類 | [直列] | U-TPWLOAD-001 green |
| 2 | repository-relative locatorをdiagnosticへ投影 | [直列] | U-TPWLOAD-001 green |
| 3 | targeted、全回帰、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

Issue／PR／DB projectionへのfailure reason伝播は#205の後続原子的sliceとする。
