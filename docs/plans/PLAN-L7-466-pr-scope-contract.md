---
plan_id: PLAN-L7-466-pr-scope-contract
title: "PLAN-L7-466 (impl): PR scope・file-growth原子契約"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-25 PRファイル増加対策をGitHub運用規律へ追加する"
created: 2026-07-25
updated: 2026-08-27
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
contract_postconditions: "1 behavior、1 owner、許可path family、予定変更path全集合、必須companion PLANのcontract/owner、scope expansion receiptが実差分と一致し、不一致時は実差分の貼り付け用exact path列を提示する"
contract_invariants: "固定ファイル数上限を原子性とみなさず、既存pr-contextと単一harness-check jobを再利用する。診断の提案はmanifestを自動承認せず、scope拡張は別途レビュー対象とする"
contract_failures: "manifest欠落・複数責務・unsafe path・予定pathと実差分の不一致・companion欠落・review可能なreceipt pointerを欠く拡張を非zeroでfail-closeし、不一致の修正方向を診断する"
tdd_red_required: true
red_at: "2026-07-25T07:34:00+09:00"
green_at: "2026-07-25T07:37:00+09:00"
mutation_oracle_evidence: "tests/branch-kind.test.ts U-PRSCOPE-002..003/005でduplicate contract、unsafe glob、予定外/未変更path、missing PLAN/test companion、receipt pointer欠落 expansion、PLAN contract/owner不一致のseeded mutationをkilled。U-PRSCOPE-006でundeclared/absent双方の実差分exact path列と修正方向の診断を固定する"
complexity_effect: net_neutral
complexity_justification: "既存pr-context純関数と既存CI stepへ入力検査を追加し、新detector/job/dependency/stateを増やさない"
removal_trigger: "typed PR metadata APIが同じscope manifestをimmutableに束縛した時点でPR本文parserを統合または削除する"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-25T08:13:22Z"
  review_binding:
    reviewer: claude-ai-b
    reviewed_at: "2026-07-25T08:13:22Z"
    evidence_digest: "sha256:e564117b4f040815717d286bd4ad1916b7ec9ae07a6281eed99c4df7ac50ca70"
  entries: []
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-001, test_path: tests/branch-kind.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-002, test_path: tests/branch-kind.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-003, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-004, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-005, test_path: tests/branch-kind.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-006, test_path: tests/branch-kind.test.ts }
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
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: config }
  - { artifact_path: .github/PULL_REQUEST_TEMPLATE.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L7-463-engineering-discipline-contract.md
  requires:
    - docs/design/helix/L3-requirements/github-atomic-development-requirements.md
  references:
    - docs/governance/ddd-tdd-rules.md
  blocks: []
review_evidence:
  - reviewer: claude-ai-b
    review_kind: cross_agent
    worker_model: gpt-5.6
    reviewer_model: claude-opus-5
    tests_green_at: "2026-07-25T08:09:50Z"
    reviewed_at: "2026-07-25T08:13:22Z"
    verdict: approve
    scope: "PR #126 content HEAD e4e21492をseverity-firstで再監査。freeze packet drift、merge-base基準のPR差分、17 path exact scope、companion結線を確認。full harness-check greenをmerge条件とする。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/126#issuecomment-5077656131"
    green_commands:
      - { kind: smoke, command: "npx --no-install tsx src/doctor/l3-g3-logical-db-receipt.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-25T08:09:50Z", evidence_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, output_digest: "sha256:cbe0f8517cadab3764ca7f0061cfdc3fd3aa724e33e9e3740a0e119ddce4b784" }
---

# PLAN-L7-466: PR scope・file-growth原子契約

## 目的

PRのファイル増加を固定件数で裁かず、宣言した1 behavior contract・1 responsibility ownerと実差分の逸脱として
検出する。予定変更pathを完全列挙してbase..head diffとの集合一致を要求する。必要な設計・test・workflow
companionは許容し、無関係な機能混入、同一directory内の惰性的なファイル増加、無証拠のscope expansionを止める。

## 非対象

- PRファイル数・行数の一律上限。
- 新しいCI job、detector、dependency、runtime state。
- 既存PRの履歴本文を遡及変更すること。

## 完了条件

- PR template、CLI、CI、L6/L8契約が同じmanifest fieldを使う。
- actual base..head diffの宣言外path、unsafe path、companion漏れ、receipt pointer欠落拡張mutationがredになる。
- `Expected changed paths`はexact pathの全集合とし、予定外pathだけでなく予定したが変更されなかったpathもredになる。
- PR manifestのbehavior/ownerと必須PLAN companionの`behavior_contract_id`/`responsibility_owner`が
  exact一致し、unit oracle範囲やpath＋関数表記による契約代用を拒否する。
- CIが保証するpath family検査は安全な相対path、repository-root級family禁止、実差分包含までとし、
  directory prefixが単一責務の粒度かどうかは独立AI-Bがresponsibility ownerと照合する。
- CIはscope expansion receiptのURL形式と理由を検査し、独立AI-B reviewが参照先の存在・対象path・
  承認主体を確認する。CIだけで外部commentの存在や承認を証明したと主張しない。
- targeted test、typecheck、Biome、doctor、Claude cross-runtime reviewがgreenになる。
