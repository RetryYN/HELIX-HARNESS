---
plan_id: PLAN-L7-689-merged-plan-frontmatter-parse-fail-close
title: "PLAN-L7-689: merged-plan-status の PLAN frontmatter parse failure を fail-close する"
kind: troubleshoot
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1001 merged-plan-status parse failure fail-close"
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1001
behavior_contract_id: PLAN-FRONTMATTER-PARSE-FAIL-CLOSE-001
responsibility_owner: merged-plan-status
engineering_discipline_required: true
change_slice: atomic
refactor_step: harden_contract
legacy_retirement_state: retained
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
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
refines:
  - PLAN-L7-54-merged-plan-status-gate
  - PLAN-L7-87-merged-plan-status-kind-independent
agent_slots:
  - role: tl
    slot_label: "TL — merged-plan-status の parse failure provenance と fail-close"
  - role: qa
    slot_label: "QA — generates／modifies 両経路と mutation oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-689-merged-plan-frontmatter-parse-fail-close.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/merged-plan-status.ts
    artifact_type: source_module
  - artifact_path: tests/merged-plan-status.test.ts
    artifact_type: test_code
modifies: []
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

- [ ] frontmatter parse failure は `ok=false` となり、空集合による偽の成功を返さない。
- [ ] `generates` と `modifies` の両経路を同じ fail-close 契約で覆う。
- [ ] violation に PLAN ID と `PLAN_FRONTMATTER_PARSE_FAILED` を含め、raw YAMLやsecretを出力しない。
- [ ] parse failureを `return []` へ戻すmutationを回帰テストが検出する。
- [ ] 正常系と existing `modifies` ownership gate は退行しない。
- [ ] typecheck、Biome、targeted Vitest、current-head CI、独立レビューを完了する。

## 非対象

Issue #980に記録された `helix plan lint` の未捕捉 YAMLParseError の帰責整理・例外変換は別Issueで扱う。
frontmatter parse failureを検出する本gateに、plan-lintのparser責務や新しいDB／通知経路を混載しない。
