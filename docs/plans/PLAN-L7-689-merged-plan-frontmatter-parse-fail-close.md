---
plan_id: PLAN-L7-689-merged-plan-frontmatter-parse-fail-close
title: "PLAN-L7-689: merged-plan-status の PLAN frontmatter parse failure を fail-close する"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: true
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1001 merged-plan-status parse failure fail-close"
created: 2026-08-27
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1001
behavior_contract_id: PLAN-FRONTMATTER-PARSE-FAIL-CLOSE-001
responsibility_owner: merged-plan-status
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "既存の merged-plan-status gate に parse failure の fail-close 検出を追加する harness 内部の欠陥是正であり、新しい product requirement、公開 runtime semantics、上位 design contract は追加・変更しないため、upstream backprop は不要。"
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "docs/plans 配下の PLAN frontmatter を merged-plan-status loader が読み取る"
contract_postconditions: "parse不能なPLANが型付きviolationとして投影され、gateがfail-closeする"
contract_invariants: "generates／modifiesのpublished-base ownership、既存S3 PoC例外、secret非出力を維持する"
contract_failures: "frontmatter parse failure、invalid shape、missing artifact_pathを空集合として成功扱いしない"
complexity_effect: net_neutral
complexity_justification: "既存の merged-plan-status の YAML parse failure を空集合として扱う経路だけを、型付き violation と回帰oracleへ置換する。"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #1001 と PR #982 の独立レビューで既存Red（壊れたfrontmatterがgate対象から消える）を実測済み。改修と回帰oracleを同一atomic sliceで追加し、未記録のRed時刻を捏造しない。"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-27T16:00:55Z"
    tests_green_at: "2026-08-27T16:00:30Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: c7895aff-da7e-47a0-944a-36c68bb4f251
    reviewed_head_sha: e664b2c22e9e14b3fc49ec72a016287a72981f00
    scope: "PR #1108 exact HEAD e664b2c22e9e14b3fc49ec72a016287a72981f00をClaude Code Opusが独立検収し、frontmatter parse failureのtyped violation、generates／modifies共通fail-close、redaction、S3例外維持、mutation oracle、DB projection／checkpoint replay一致を確認してblocker 0と判定した。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/1108#issuecomment-5441806713"
    green_commands:
      - kind: smoke
        command: "gh run view 33088906502 --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-27T16:00:30Z"
        evidence_path: tests/merged-plan-status.test.ts
        output_digest: "sha256:700e815c78456995e122511c41a0445f752a934c473440bc38de27bb5591b4e0"
        result: "terminal success / HEAD e664b2c22e9e14b3fc49ec72a016287a72981f00 / DB converged"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-27T16:00:55Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-27T16:00:55Z"
    evidence_digest: "sha256:b5df7bb1f893873e9afbf946031b8b4608ac2caf4716a8afb2dd70051f8b1849"
  entries: []
parent_design: docs/design/helix/L6-function-design/merged-plan-frontmatter-parse-fail-close.md
pair_artifact: docs/test-design/helix/L8-merged-plan-frontmatter-parse-fail-close-unit-test-design.md
refines:
  - PLAN-L7-54-merged-plan-status-gate
  - PLAN-L7-87-merged-plan-status-kind-independent
agent_slots:
  - role: aim
    slot_label: "AIM — parse failureの帰責とfail-close境界を監査"
  - role: tl
    slot_label: "TL — merged-plan-status の parse failure provenance と fail-close"
  - role: qa
    slot_label: "QA — generates／modifies 両経路と mutation oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-689-merged-plan-frontmatter-parse-fail-close.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L6-function-design/merged-plan-frontmatter-parse-fail-close.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L8-merged-plan-frontmatter-parse-fail-close-unit-test-design.md
    artifact_type: test_design
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/merged-plan-status.ts, artifact_type: source_module }
  - { artifact_path: tests/merged-plan-status.test.ts, artifact_type: test_code }
dependencies:
  parent: PLAN-L7-87-merged-plan-status-kind-independent
  requires:
    - docs/plans/PLAN-L7-54-merged-plan-status-gate.md
  blocks: []
  references:
    - "issue:1001"
    - "issue:980"
removal_trigger: "PLAN frontmatterがtyped schemaへ移行し、任意YAML parserを経由しなくなった時"
---

# PLAN-L7-689: merged-plan-status の frontmatter parse failure fail-close

## 目的

`merged-plan-status` が PLAN frontmatter の YAML parse failure を空集合として扱い、壊れた PLAN を
検査対象から静かに除外する欠陥を是正する。`generates` と `modifies` のどちらを含む PLAN でも、
parse 不能ならその事実を型付き violation として surface し、gate を fail-close する。

## スコープ

- `parsePlanDeliverables` 相当の共通 parser で frontmatter を一度だけ検査する。
- frontmatter 欠落、YAML parse failure、mapping 以外のroot、`generates`／`modifies` の不正shape、
  `artifact_path` の欠落・非文字列を `PLAN_FRONTMATTER_PARSE_FAILED` として扱う。
- loader は PLAN ID と failure code を `MergedPlanStatusInput.parseFailures` へ投影する。
- analyzer と message surface は parse failure を violation として deterministic に返す。
- `generates`／`modifies` の正常系、published-base ownership、および既存S3 PoC例外の挙動は維持する。

## 受入条件

- [x] frontmatter parse failure は `ok=false` となり、空集合による偽の成功を返さない。
- [x] `generates` と `modifies` の両経路を同じ fail-close 契約で覆う。
- [x] violation に PLAN ID と `PLAN_FRONTMATTER_PARSE_FAILED` を含め、raw YAMLやsecretを出力しない。
- [x] parse failureを `return []` へ戻すmutationを回帰テストが検出する。
- [x] 正常系と existing `modifies` ownership gate は退行しない。
- [x] typecheck、Biome、targeted Vitest、current-head CI、独立レビューを完了する。

## 非対象

Issue #980に記録された `helix plan lint` の未捕捉 YAMLParseError の帰責整理・例外変換は別Issueで扱う。
frontmatter parse failureを検出する本gateに、plan-lintのparser責務や新しいDB／通知経路を混載しない。
