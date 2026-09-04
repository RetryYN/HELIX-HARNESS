---
plan_id: PLAN-RECOVERY-728-repo-wide-guard-preflight
title: "PLAN-RECOVERY-728: repo-wide guard preflight"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1498
behavior_contract_id: REPO-WIDE-GUARD-PREFLIGHT-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "regression_dev"
contract_preconditions: "既存repo-wide guard testとfull-regression-preflightがcurrent mainに存在する"
contract_postconditions: "test file明示marker、registry projection、単一entrypoint、preflight配線が同じguard exact setを実行する"
contract_invariants: "既存testの判定、full regression exact inventory、required aggregateを変更せず、guard greenをfull admissionへ昇格しない。本文や構文からmembershipを推測しない"
contract_failures: "marker欠落、未登録marker、registry欠落、重複、missing path、entrypoint／workflow配線欠落をfail-closeする"
tdd_red_required: true
red_at: "2026-09-04T03:06:00+09:00"
tdd_red_evidence: "2026-09-04にregistry testを先行実行し、新設registry test自身の自己検出を含む差集合で1 failed／1 passedを確認した"
green_at: "2026-09-04T14:55:03+09:00"
tdd_green_evidence: "2026-09-04T14:55:03+09:00に、marker集合とregistry projectionを検証するsrc/runtime/repo-wide-guard-runner.ts経由でnpm run test:repo-guardsを実行し、37 files／534 tests green、exit 0を確認した"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-04T14:55+09:00に、marker付き未登録testとregistryだけに残るtestのfixtureをU-REPOGUARD-005へ与え、いずれもrepo_wide_guard_membership_mismatchでfail-closeすることを確認した"
complexity_effect: justified_positive
complexity_justification: "暗黙grep集合をtest file明示marker、1 registry projection、1 runnerへ集約し、文言変更によるmembership漏れとreview後のfull shard再実行を減らす"
removal_trigger: "CI verification planがrepo-wide guard exact setを同じcontractで生成し、全consumerが移行した時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
dependencies:
  parent: PLAN-L6-92-impact-ci-recovery
  requires:
    - docs/plans/PLAN-L6-92-impact-ci-recovery.md
  references:
    - "issue:1498"
    - "issue:1493"
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-REPOGUARD-001, test_path: tests/repo-wide-guard-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-REPOGUARD-002, test_path: tests/repo-wide-guard-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-REPOGUARD-005, test_path: tests/repo-wide-guard-registry.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-728-repo-wide-guard-preflight.md, artifact_type: markdown_doc }
  - { artifact_path: config/repo-wide-guard-tests.v1.json, artifact_type: json_config }
  - { artifact_path: src/runtime/repo-wide-guard-runner.ts, artifact_type: source_module }
  - { artifact_path: tests/repo-wide-guard-registry.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: package.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/asset-drift.test.ts, artifact_type: test_code }
  - { artifact_path: tests/ci-governance-self-heal.test.ts, artifact_type: test_code }
  - { artifact_path: tests/coding-rules.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cutover-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: tests/ddd-tdd-rules.test.ts, artifact_type: test_code }
  - { artifact_path: tests/descent-obligation.test.ts, artifact_type: test_code }
  - { artifact_path: tests/digest.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-coverage.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-language.test.ts, artifact_type: test_code }
  - { artifact_path: tests/feedback-refactor-disposition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/frontend-design-coverage.test.ts, artifact_type: test_code }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/goal-evidence-audit.test.ts, artifact_type: test_code }
  - { artifact_path: tests/handover-resurrection.test.ts, artifact_type: test_code }
  - { artifact_path: tests/handover-retirement.test.ts, artifact_type: test_code }
  - { artifact_path: tests/historical-vpair-migration-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/impl-plan-trace.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l6-fr-coverage.test.ts, artifact_type: test_code }
  - { artifact_path: tests/lint-wiring.test.ts, artifact_type: test_code }
  - { artifact_path: tests/oracle-test-trace.test.ts, artifact_type: test_code }
  - { artifact_path: tests/plan-descent-specific-parent-binding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/proposal-document-coverage.test.ts, artifact_type: test_code }
  - { artifact_path: tests/relation-graph-loader.test.ts, artifact_type: test_code }
  - { artifact_path: tests/roadmap.test.ts, artifact_type: test_code }
  - { artifact_path: tests/rule-drift.test.ts, artifact_type: test_code }
  - { artifact_path: tests/s4-decision-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: tests/semantic-boundary.test.ts, artifact_type: test_code }
  - { artifact_path: tests/skill-assignment.test.ts, artifact_type: test_code }
  - { artifact_path: tests/skill-pack-uplift.test.ts, artifact_type: test_code }
  - { artifact_path: tests/skill-quality.test.ts, artifact_type: test_code }
  - { artifact_path: tests/source-boundary-integration.test.ts, artifact_type: test_code }
  - { artifact_path: tests/sub-doc-catalog-drift.test.ts, artifact_type: test_code }
  - { artifact_path: tests/sub-doc-section-structure.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tracked-canonical.test.ts, artifact_type: test_code }
  - { artifact_path: tests/triage-decision-integrity.test.ts, artifact_type: test_code }
  - { artifact_path: tests/version-up-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: tests/vmodel-pair.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — guard検出時点の短縮" }
  - { role: se, slot_label: "SE — registry／single runner" }
  - { role: qa, slot_label: "QA — exact-set mutation／workflow wiring" }
  - { role: tl, slot_label: "TL — existing CI responsibility boundary" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-09-04T07:03:29Z"
    tests_green_at: "2026-09-04T07:02:55Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    reviewed_head_sha: ff2f25d6c9c5c118d7dbc0955133d78999630790
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1511#issuecomment-5536968605"
    scope: "PR #1511のcurrent exact HEADで、repo-wide guard membershipのmarker／registry双方向一致、37 files／534 tests、preflight配線、既知mutationのfail-close、DB projection／replay／checkpoint convergenceを確認し、blocker 0。"
    green_commands:
      - kind: smoke
        command: "gh run view 33842910905 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-09-04T07:02:55Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:6e59af82129ddd4671fdb344aee880c90ca841c82ab77345b73855e7257625be"
        result: "PR #1511 exact HEAD ff2f25d6c9c5c118d7dbc0955133d78999630790のharness-check run 33842910905がterminal success。"
---

# repo-wide guardの事前実行

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | guard membershipを明示markerへ移行 | 既存37 testのmarkerとregistry projectionがexact setになる |
| 2 | registry loaderと単一runnerを実装 | duplicate／missing／malformedをfail-closeする |
| 3 | packageとpreflightを同じentrypointへ接続 | full shard前にguard redを検出する |
| 4 | 欠落mutation、targeted、typecheck、PLAN lint | current HEADでgreen evidenceを得る |
| 5 | Claude exact-HEAD review、CI、main read-after | full admissionを代替せず収束する |

本PLANは既存guard testのmembership宣言、集合projection、実行位置だけを所有する。新lint、test判定変更、full regression削減、
required check変更、CI System Synthesisの新authorityは非対象とする。

## §5 終端収束

PR #1511 `ff2f25d6c9c5c118d7dbc0955133d78999630790` は、Claude Code / `claude-opus-5` の
current exact-HEAD review、必須CI、DB projection／replay／checkpoint convergenceを満たしたうえで
merge commit `eab5385cfce8c90a0a04a12932b1553965b1beed` としてmainへ統合された。

main read-afterとして、`harness-check` run 33848385601 が同一HEADで
2026-09-04T08:02:00Zにterminal successとなった。Lite consumer、preflight、Windows durability、
bulk-1〜3、stateful、finalize（Biome、post-test DB rebuild、doctor、typed lane status）を全てsuccessで
完了し、repo-wide guard 37 files／534 testsを含むmain側の再検証を確認した。

```text
run: https://github.com/RetryYN/HELIX-HARNESS/actions/runs/33848385601
head: eab5385cfce8c90a0a04a12932b1553965b1beed
status: completed
conclusion: success
output_digest: sha256:64249470978a505bcbdba669eab71a2f0e7f2b5b5a231c939301ef941f610791
```

このmain read-afterをもって、PR #1511の実装責務と本PLANのrepo-wide guard preflight責務が同一main
へ収束したことを確認する。Issue #1498のterminal化は、本PLANをこの証拠付きclosure PRから参照して行う。
