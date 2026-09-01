---
plan_id: PLAN-L7-726-github-plan-reservation-bounded-fetch
title: "PLAN-L7-726: GitHub PLAN reservation bounded fetch"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1331
behavior_contract_id: PLAN-RESERVATION-BOUNDED-FETCH-001
responsibility_owner: github-plan-reservation-fetch-budget
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: adapter
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1331 GitHub PLAN reservation effect を bounded fetch へ収束する"
contract_preconditions: "PLAN-L7-723のtyped GitHub material providerを入力とし、repositoryをexact owner/nameで指定できる"
contract_postconditions: "同一blob SHAのsourceを再利用し、path identityを再検証して、changed PLAN exact setだけをbounded batchで取得する。HEAD／tree／captureとcall/process/request-costをreceiptへ束縛する"
contract_invariants: "semantic conflict判定を複製せず、partial cache、threshold超過、HEAD drift、archive-tree mismatch、rate-limitをlocal greenにしない"
contract_failures: "GitHub API／schema／pagination／budget／cache／tree／frontmatter／identity／HEAD／lifecycle不整合をsurface unavailableのstable digestへ閉じる"
tdd_red_required: true
red_test: "新しい receipt API、同一blobの再利用、budget／partial cache／archive-tree mismatchの反例を現行providerへ入力すると未実装または過剰blob callになる"
red_at: "2026-09-01T17:48:21+09:00"
green_at: "2026-09-01T18:13:00+09:00"
tdd_red_evidence: "2026-09-01T17:48:21+09:00にnpx --no-install vitest run tests/github-open-branch-plan-reservation-provider.test.ts --configLoader runner --reporter=verboseを実行。新receipt API未実装、同一blob cache期待を含む6件がfailedし、既存6件はpassedだった。"
tdd_green_evidence: "2026-09-01T18:10:44+09:00にtargeted commandを実行し、16 tests／1 file green。typecheckと対象2 fileのBiomeもexit 0。"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-01T18:12:40+09:00にstale tree capture guardを一時無効化し、U-OBPRGH-014が1 failed／15 skippedでkillした。18:13:00+09:00にoperation blob-SHA cache登録を一時無効化し、U-OBPRGH-008が1 failed／15 skippedでkillした。各seed除去後に対象16 tests greenへ復帰した。"
complexity_effect: justified_positive
complexity_justification: "GitHub effectのAPI call、process、rate-limit、cacheのbounded制御をproviderへ隔離し、既存semantic coreとprojection schemaの責務を増やさない"
removal_trigger: "GitHub event journalが同じ exact PLAN material と bounded receipt を canonical に発行し、provider consumer が 0 になった時"
backprop_decision: not_required
backprop_decision_reason: "Issue #1331はIssue #1256／PR #1326のeffect providerをbounded化する後続sliceであり、予約意味論と上流設計は変更しない"
parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md
pair_artifact: docs/test-design/helix/L8-github-plan-reservation-bounded-fetch-unit-test-design.md
dependencies:
  parent: PLAN-L7-723-github-open-branch-plan-reservation-provider
  requires:
    - docs/plans/PLAN-L7-723-github-open-branch-plan-reservation-provider.md
  references:
    - "issue:1331"
    - "issue:1256"
    - "pr:1326"
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-001, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-002, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-003, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-004, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-005, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-006, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-007, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-008, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-009, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-010, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-011, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-012, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-013, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-014, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-015, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, oracle_id: U-OBPRGH-016, test_path: tests/github-open-branch-plan-reservation-provider.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-726-github-plan-reservation-bounded-fetch.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-plan-reservation-bounded-fetch-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/adapters/github-open-branch-plan-reservation-provider.ts, artifact_type: source_module }
  - { artifact_path: tests/github-open-branch-plan-reservation-provider.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — GitHub bounded effect／cache budget" }
  - { role: qa, slot_label: "QA — threshold／race／partial cache／repository-scale oracle" }
  - { role: tl, slot_label: "TL — semantic core非複製と後続preflight／doctor／DB境界" }
review_evidence: []
---

# GitHub PLAN予約 bounded fetch 実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | Issue #1256／PR #1326の既存 effect provider と typed material 境界を確認 | semantic core／projectionを変更しない責務境界がL6へ固定される |
| 2 | receipt、budget controller、tree/blob cache、changed exact set を TDD Red→Green で実装 | U-OBPRGH-008〜014と既存U-OBPRGH-001〜007がgreen |
| 3 | main／PRのHEAD、pagination、archive tree、partial cache、rate-limitを反例検証 | 部分material、過剰call、raw error digestが0 |
| 4 | repository-scale performance oracle、typecheck、Biome、PLAN lintを実行 | 1,200 PLAN fixtureでunique blob callがbounded、全必須command exit 0 |
| 5 | 独立review前のdraftとして成果をhandoff | PR／merge／Issue closeを行わず、completion claimを抑止 |

本PLANはIssue #1331の bounded effect sliceだけを所有し、Issue #1256のcompletion、GitHub PR／merge／Issue close、
PR preflight、doctor、harness DB、assignment kernelの完了を主張しない。
