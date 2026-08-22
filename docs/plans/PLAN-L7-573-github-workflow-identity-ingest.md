---
plan_id: PLAN-L7-573-github-workflow-identity-ingest
title: "PLAN-L7-573 (impl): Issue／PR typed workflow identityをexact ingestする"
kind: impl
layer: L7
drive: agent
status: confirmed
backfill_state: complete
completion_claim_allowed: true
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #731 GitHub typed workflow identity ingest"]
created: 2026-08-16
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 731
behavior_contract_id: GITHUB-WORKFLOW-IDENTITY-INGEST-001
responsibility_owner: github-workflow-identity-contract
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "Issue／PR proseと旧fieldからworkflow identityを推測でき、同一episodeのtyped identityをexact比較するvalue objectがない"
contract_postconditions: "marker付きstrict JSONをrequirements catalogへexact照合し、Issue／PR一致だけをtyped value objectとして返す"
contract_invariants: "requirements registryが意味authorityであり、GitHub prose／label／legacy identityをcurrent contractへ再出力しない"
contract_failures: "missing、duplicate、invalid、drift、unknown、decision待ち、ambiguity、signal矛盾、Issue／PR不一致を別reasonでfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated stacked branchでpure schemaと反例oracleを同一atomic patchとして作成したため、存在しない実装前Red時刻を捏造しない。confirm前にseeded mutation killを実測する"
mutation_oracle_evidence: "2026-08-15T20:10:11ZにIssue／PR mismatch判定をmismatches.length>0から<0へ一時変異し、tests/github-workflow-identity-contract.test.tsのU-GWID-005がexpected issue_pr_mismatch／received okで1 failed、4 skipped、exit 1となるkillを実測した。apply_patchで復元後、同oracle greenを再確認する"
complexity_effect: justified_positive
complexity_justification: "Issue／PRで重複する自由文解析を単一strict value objectへ置換し、DB／episode adapterが再利用できる境界を追加する"
removal_trigger: "GitHub workflow identity contract schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-001, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-002, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-003, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-004, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-005, test_path: tests/github-workflow-identity-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-006, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — GitHub identity strict value object" }
  - { role: qa, slot_label: "QA — malformed／drift／mismatch反例" }
  - { role: tl, slot_label: "TL — requirements authority／episode境界" }
review_evidence:
  - reviewer: claude-code-opus
    review_kind: cross_agent
    reviewed_at: "2026-08-15T20:23:05Z"
    tests_green_at: "2026-08-15T20:22:11Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-5
    scope: "Issue #731 GitHub typed identity ingest sliceについて、strict marker JSON、legacy field拒否、12 failure reason、requirements-owned signal resolver、Issue／PR exact tuple比較、U-GWID-001..006のclaimとoracleを確認した。Claude Code Opusがblocker 0（PLAN確定と日本語見出し是正を除く）と判定した。consumer未配線はnon-blockerとしてIssue #733へ分離した。PR terminal receiptはcurrent HEADのCI／DB convergence後に別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/github-workflow-identity-contract.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/design-coverage.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T20:22:11Z"
        evidence_path: tests/github-workflow-identity-contract.test.ts
        output_digest: "sha256:ed561008fdabe0e0cc37af00a07425228b94d072791c2a261cf6e594d8993f92"
        result: "3 files／43 tests passed。strict ingest、12 failure reason、Issue／PR mismatch、G3 digest propagationを含む"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T20:23:05Z"
  review_binding:
    reviewer: claude-code-opus
    reviewed_at: "2026-08-15T20:23:05Z"
    evidence_digest: "sha256:ab308a7ad217cd0a717368f5d1eecc429ff7ef65cc704d6ecfe5180acd44f88a"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/github-workflow-identity-contract.ts, artifact_type: source_module }
  - { artifact_path: tests/github-workflow-identity-contract.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-572-typed-plan-signal-identity-consistency.md
  references:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
    - docs/plans/PLAN-REVERSE-573-github-workflow-identity-ingest-terminal-backfill.md
  blocks: []
---

# GitHubのtyped workflow identity取込

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | marker付きstrict contract schemaを実装 | [直列] | U-GWID-001..003 green |
| 2 | signal照合とIssue／PR consistencyを実装 | [直列] | U-GWID-004／005 green |
| 3 | pair登録、mutation、targeted、全CI、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

GitHub API adapter、DB projection、execution episode、right-arm bindingは#205の後続原子的sliceとする。

## 終端収束

PR #732のcanonical implementation、PR #734のadmission consumer、Issue #731／#733のterminal close、
およびpost-main harness-check run 31930292602を
`PLAN-REVERSE-573-github-workflow-identity-ingest-terminal-backfill`のR0〜R4で再照合した。
Reverse側の`requires`から本PLANへ接続し、本PLANはReverseを`references`するためhard dependency cycleを作らない。
strict ingest契約、legacy identity拒否、consumer接続、main read-afterが成立しているため、
`backfill_state: complete`および`completion_claim_allowed: true`へ遷移する。本PR自身のcurrent-HEAD CI、
Claude Opus exact-HEAD review、canonical merge後のmain read-afterのいずれかが失敗した場合は完了へ丸めない。
