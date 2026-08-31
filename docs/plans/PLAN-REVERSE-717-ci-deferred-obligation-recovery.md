---
plan_id: PLAN-REVERSE-717-ci-deferred-obligation-recovery
title: "PLAN-REVERSE-717: CI deferred obligation回収を正本へ再接着する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1306
behavior_contract_id: CI-DEFERRED-OBLIGATION-RECOVERY-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: domain_service
legacy_retirement_state: retained
forward_routing: L5
promotion_strategy: reuse-as-is
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1208 deferred obligation回収のReverse fullback"
contract_preconditions: "PLAN-L7-717、L6／L8 pair、PR #1290 exact-HEAD review、canonical merge、Ready CIが存在する"
contract_postconditions: "deferred obligationのexactly-once回収、origin backprop、quarantine境界をL3／L6／L8／runtimeへ再照合する"
contract_invariants: "要求意味を変更せず、failureを要求変更へ自動昇格せず、publish／cutoverを混載しない"
contract_failures: "wrong HEAD、stale review、双方向link欠落、profile相殺、selector mutation未検出をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "独立レビューでfailed terminal runのoracle欠落がfail-openになる反例を実測し、corrective regression U-CIDEFER-013と最小runtime修正を同一Reverseへ追加した。事後にRedを捏造せず、レビュー反例をfailure evidenceとして保持する。"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/ci-deferred-obligation-recovery.test.ts のU-CIDEFER-013はfailed terminal runのoracle欠落／不正identityをseedし、recovery_oracle_missingでfailすることを実測した。U-CIDEFER-001〜012もmissing、duplicate、expired、wrong profile、stale HEAD、quarantine、selector edge削除を個別の負例として検出する。"
complexity_effect: net_neutral
complexity_justification: "実装を複製せず、要求・設計・検証・main証拠の再接着だけを所有する"
removal_trigger: "CI System Synthesis全体のterminal Reverseが個別fullbackを統合した時"
parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
pair_artifact: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-31T22:57:50Z"
    tests_green_at: "2026-08-31T22:57:49Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    reviewed_head_sha: 1cfa3817b8211237b6ac162a610d2488576353c8
    scope: "PR #1305 final exact HEADのReverse fullback、U-CIDEFER-013、Forward／Reverse pair、非終端境界を独立reviewし、BLOCKER 0を確認した。CI、DB projection／checkpoint、receiptは同一HEADへ束縛済み。"
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1305#issuecomment-5485900343"
    green_commands:
      - kind: ci
        command: "GitHub Actions harness-check run 33446819961"
        runner: github-actions
        scope: full
        exit_code: 0
        completed_at: "2026-08-31T22:57:49Z"
        evidence_path: docs/governance/ci-deferred-obligation-recovery-terminal-fullback-evidence.md
        output_digest: "sha256:48b1d29bba233c2b439a26a6e69c3ac6ceee7e4e6daca6e5e41210ac8a129795"
        result: "run 33446819961 success、DB projection／checkpoint replay一致、approve／BLOCKER 0"
  - reviewer: "Codex intra-runtime / Nietzsche"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-31T21:52:04Z"
    tests_green_at: "2026-08-31T21:51:50Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: codex-intra-runtime
    reviewer_session_id: "f5d602da-904a-4ce7-8d62-b0a4757b5622"
    reviewed_head_sha: b93c3d7a011222f65607eb9ae42cd6583250290c
    scope: "PR #1305 exact HEADでForward／pending Reverseの双方向references、U-CIDEFER-013のseeded failure、mutation証拠、completion非許可、後続companion境界をread-only再確認した。BLOCKER 0 / NON-BLOCKER 0。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/ddd-tdd-rules.test.ts tests/backfill-pairing.test.ts --reporter=verbose && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-717-ci-deferred-obligation-recovery.md docs/plans/PLAN-REVERSE-717-ci-deferred-obligation-recovery.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-31T21:51:50Z"
        evidence_path: tests/ci-deferred-obligation-recovery.test.ts
        output_digest: "sha256:f0657f19493747e2a1ede2048a2a13de02afbe3d327cbbf86d96e6e65a008489"
        result: "2 test files / 57 testsとForward／Reverse PLAN lintがgreen"
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
    reason: "CIS-R-13〜15のdeferred recovery、backprop、quarantine意味と実装が一致する。"
  - layer: L6-function-design
    decision: not_impacted
    evidence_path: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
    reason: "exactly-once recoveryとorigin receiptの責務境界がruntimeと一致する。"
  - layer: verification-design
    decision: not_impacted
    evidence_path: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md
    reason: "U-CIDEFER-001〜013がfail-close境界を個別に検出する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "外部system boundaryとprovider interfaceを変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "typed recovery schemaはForward L6実装に閉じる。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-717-ci-deferred-obligation-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/ci-deferred-obligation-recovery-terminal-fullback-evidence.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/ci-deferred-obligation-recovery.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-deferred-obligation-recovery.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L3-73-ci-system-synthesis.md
    - docs/plans/PLAN-L7-717-ci-deferred-obligation-recovery.md
  references:
    - issue:1208
    - issue:1206
    - issue:1207
    - issue:1304
    - pull:1290
    - docs/plans/PLAN-L7-717-ci-deferred-obligation-recovery.md
    - src/runtime/ci-deferred-obligation-recovery.ts
    - tests/ci-deferred-obligation-recovery.test.ts
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — exactly-once回収とmutation証拠のmain再照合" }
  - { role: tl, slot_label: "TL — CI System Synthesis終端接着" }
---

# CI deferred obligation回収のReverse fullback

## R0 現状採取

Forward PR #1290のexact HEAD `1e312e8027bfc686f15bc8325eb55fa1ea373aa7`、CI run `33429356878`、Claude review receipt `sha256:5b6bf73ec4c42a47aca8eb9b0e77714e2386dcb484b53d93a2136f149a29f882`、merge `2799d499cec2b9c2d6b5fab0e1e2036f240f470b`を事実基準とする。

## R1 観測契約

deferred obligation、origin PR、candidate HEAD、terminal recovery profile、first terminal run、finding dispositionをexact receiptへ束縛し、missing／duplicate／wrong profile／expiredを相殺しない。

## R2 As-Is照合

CIS-R-13〜15、L6／L8、runtime、U-CIDEFER-001〜013は同じexactly-once recovery責務を返す。failed runのoracle欠落をfail-closeし、selector mutationはorigin decisionへbackpropしてauthorityを直接変更しない。

## R3 意図照合

requirements／L4／L5／L6／L8の意味変更は不要である。Forward再入先をL5とし、公開・release cutoverは非対象を維持する。

## R4 終端接着

PR #1305 final HEAD `1cfa3817b8211237b6ac162a610d2488576353c8`はtargeted oracle、CI run `33446819961`、Claude exact-HEAD review、DB convergenceを満たし、Ready CI run `33448649188`後にmerge `d597df0c0ebcd29e6068f8394059ac3d38b84a1f`としてmainへ到達した。本companionでForwardへU-CIDEFER-013 bindingとterminal Reverse dependencyを接着する。companion自身のcanonical mergeとpost-main read-after、Issue #1306／#1208 closeは先取りせず、mainでterminal fieldを再読込してから実施する。Issue #1304はzero-injection admissionを所有する別契約としてopenを維持する。
