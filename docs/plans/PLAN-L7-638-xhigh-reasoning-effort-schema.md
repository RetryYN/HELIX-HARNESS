---
plan_id: PLAN-L7-638-xhigh-reasoning-effort-schema
title: "PLAN-L7-638 (impl): xhigh reasoning effortをcurrent schemaへ追加する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 624
behavior_contract_id: CODEX-NATIVE-WORKER-EFFORT-001
responsibility_owner: codex-native-worker-effort-schema
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-20T23:10:26Z"
    reviewed_at: "2026-08-20T23:32:38Z"
    verdict: approve
    worker_model: codex:gpt-5.4-codex
    reviewer_model: claude:claude-opus-5
    scope: "PR #850 HEAD 31d7910d3699e101450735371ea49ef37504def1をClaude Codeがpost-CI exact-HEAD reviewした。generic high→high維持、explicit xhigh上限、tooSlow時xhigh→high、Luna requirements-owned policy由来のxhigh限定、snapshot 26追従を照合しblocker 0。Actions run 32426020081はfull regression、Biome、DB rebuildがgreenで、doctor唯一redは本PLAN draftのmergedPlanStatus。review source: https://github.com/RetryYN/HELIX-HARNESS/pull/850#issuecomment-5363335481"
    green_commands:
      - kind: integration_test
        command: "npx --no-install vitest run --project fast --project slow (GitHub Actions harness-check run 32426020081)"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-20T23:10:26Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:b1f4f912478b6385cf2b2b7f9594cd744ae4a1b89fac37c204493251625002e7"
        result: "Actions run 32426020081。full regression、Biome、pre/post DB rebuild、Windows smoke、CodeQL green。doctor唯一redはconfirm前mergedPlanStatus。output_digestはClaude post-CI review comment本文のdigest。"
entry_signals:
  - "po_directive:Codex native workerのreasoning effortをxhighへ固定する"
agent_slots:
  - { role: se, slot_label: "SE — effort exact setと適応ladder" }
  - { role: qa, slot_label: "QA — schema／validator／境界oracle" }
contract_preconditions: "CNW-FR-001とCNW-R-02がcurrent Requirement IR refinementへ投影されている"
contract_postconditions: "ReasoningEffortの全current consumerがlow／medium／high／xhighを同じexact setとして扱い、xhigh到達はrequirements-owned policyへ限定される"
contract_invariants: "model identity、pricing、spawn admission、既存modelのgeneric adaptation上限、historical receiptを本sliceで変更しない"
contract_failures: "xhighのschema拒否、validator drift、generic highのxhigh自動昇格、xhigh下降境界の破壊をfail-closeする"
tdd_red_required: true
red_at: "2026-08-21T00:02:27Z"
green_at: "2026-08-21T00:02:43Z"
red_test: "tests/team-schema.test.tsとtests/model-effort.test.tsでxhigh受理／ladder境界を先行固定する"
mutation_oracle_evidence: "src/team/model-effort.ts の raise() から high 据え置き条件を一時除去し、generic high＋shallow が xhigh へ昇格する seeded defect を投入した。2026-08-21T00:02:27Z に tests/model-effort.test.ts を実行し、U-EFFORT-004 と U-XHIGH-002 が expected high / received xhigh で2件red（exit 1）、他6件greenとなることを実測した。元条件へ復元後、2026-08-21T00:02:43Z に同8 testsがexit 0でgreenへ戻った。"
complexity_effect: net_neutral
complexity_justification: "既存4 consumerのexact setと1本の適応ladderを同じvalueへ同期する"
removal_trigger: "ReasoningEffortがversioned external registryへ完全移行し本exact setが生成projectionになった時"
parent_design: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md
pair_artifact: docs/test-design/helix/L8-xhigh-reasoning-effort-schema-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
dependencies:
  requires:
    - docs/plans/PLAN-L3-63-codex-native-worker-routing.md
  blocks:
    - issue:624-model-registry
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md, oracle_id: U-XHIGH-001, test_path: tests/team-schema.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md, oracle_id: U-XHIGH-002, test_path: tests/model-effort.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md, oracle_id: U-XHIGH-003, test_path: tests/model-registry.test.ts }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-20T23:32:38Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-20T23:32:38Z"
    evidence_digest: "sha256:c2df1f0ebfbf3b3b816aa1f2da45199e4e12a2b06ff19fc6f4328d29d6fd39d4"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-638-xhigh-reasoning-effort-schema.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-xhigh-reasoning-effort-schema-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/team.ts, artifact_type: source_module }
  - { artifact_path: src/team/model-policy.ts, artifact_type: source_module }
  - { artifact_path: src/team/model-effort.ts, artifact_type: source_module }
  - { artifact_path: src/schema/model-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/team-schema.test.ts, artifact_type: test_code }
  - { artifact_path: tests/model-effort.test.ts, artifact_type: test_code }
  - { artifact_path: tests/model-registry.test.ts, artifact_type: test_code }
---

# PLAN-L7-638: xhigh reasoning effort schema実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | effort exact setの全consumerを棚卸し | runtime exact setが列挙される |
| 2 | schema／policy／registry validatorへxhighを追加 | 同じ4値を受理する |
| 3 | policy-bounded adaptationへxhigh境界を追加 | generic high→high、explicit xhigh上限、xhigh→highを固定する |
| 4 | targeted／typecheck／PLAN lint | 全gate green |
| 5 | Claude exact-HEAD独立review | blocker 0を確認 |

## 非対象

Luna model identity、価格、standard effort、spawn admission、Terra／Sol route退役は後続PRで扱う。
