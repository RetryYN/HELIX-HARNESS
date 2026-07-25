---
plan_id: PLAN-L7-466-pr-scope-contract
title: "PLAN-L7-466 (impl): PR scope・file-growth原子契約"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-25 PRファイル増加対策をGitHub運用規律へ追加する"
created: 2026-07-25
updated: 2026-07-25
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: GH-AC-040
responsibility_owner: pr-scope-guard
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "pull_request本文とbase/head SHAの実変更pathが利用可能である"
contract_postconditions: "1 behavior、1 owner、許可path family、必須companion、scope expansion receiptが実差分と一致する"
contract_invariants: "固定ファイル数上限を原子性とみなさず、既存pr-contextと単一harness-check jobを再利用する"
contract_failures: "manifest欠落・複数責務・unsafe path・宣言外差分・companion欠落・review可能なreceipt pointerを欠く拡張を非zeroでfail-closeする"
tdd_red_required: true
red_at: "2026-07-25T07:34:00+09:00"
green_at: "2026-07-25T07:37:00+09:00"
mutation_oracle_evidence: "tests/branch-kind.test.ts U-PRSCOPE-002..003でduplicate contract、unsafe glob、missing PLAN/test companion、receipt pointer欠落 expansionのseeded mutationをkilled"
complexity_effect: net_neutral
complexity_justification: "既存pr-context純関数と既存CI stepへ入力検査を追加し、新detector/job/dependency/stateを増やさない"
removal_trigger: "typed PR metadata APIが同じscope manifestをimmutableに束縛した時点でPR本文parserを統合または削除する"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-001, test_path: tests/branch-kind.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-002, test_path: tests/branch-kind.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-003, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-004, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-005, test_path: tests/goal-evidence-audit.test.ts }
agent_slots:
  - role: aim
    slot_label: "AIM — PR原子性とscope expansion境界"
  - role: se
    slot_label: "SE — pr-context parserとCLI/CI結線"
  - role: qa
    slot_label: "QA — path traversal・manifest drift mutation"
  - role: tl
    slot_label: "TL — 固定ファイル数上限を避けた契約review"
generates:
  - { artifact_path: docs/plans/PLAN-L7-466-pr-scope-contract.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-atomic-development-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/github-guards.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/helix-objective-evidence-audit.md, artifact_type: markdown_doc }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/goal-evidence-audit.test.ts, artifact_type: test_code }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: config }
  - { artifact_path: .github/PULL_REQUEST_TEMPLATE.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L7-463-engineering-discipline-contract.md
  requires:
    - docs/design/helix/L3-requirements/github-atomic-development-requirements.md
  references:
    - docs/governance/ddd-tdd-rules.md
  blocks: []
---

# PLAN-L7-466: PR scope・file-growth原子契約

## 目的

PRのファイル増加を固定件数で裁かず、宣言した1 behavior contract・1 responsibility ownerと実差分の逸脱として
検出する。必要な設計・test・workflow companionは許容し、無関係な機能混入と無証拠のscope expansionを止める。

## 非対象

- PRファイル数・行数の一律上限。
- 新しいCI job、detector、dependency、runtime state。
- 既存PRの履歴本文を遡及変更すること。

## 完了条件

- PR template、CLI、CI、L6/L8契約が同じmanifest fieldを使う。
- actual base..head diffの宣言外path、unsafe path、companion漏れ、receipt pointer欠落拡張mutationがredになる。
- CIが保証するpath family検査は安全な相対path、repository-root級family禁止、実差分包含までとし、
  directory prefixが単一責務の粒度かどうかは独立AI-Bがresponsibility ownerと照合する。
- CIはscope expansion receiptのURL形式と理由を検査し、独立AI-B reviewが参照先の存在・対象path・
  承認主体を確認する。CIだけで外部commentの存在や承認を証明したと主張しない。
- targeted test、typecheck、Biome、doctor、Claude cross-runtime reviewがgreenになる。
