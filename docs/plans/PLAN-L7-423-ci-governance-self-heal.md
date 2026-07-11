---
plan_id: PLAN-L7-423-ci-governance-self-heal
title: "PLAN-L7-423 (impl): CI hard-gate integrity self-heal — dependency boundary・review evidence・L6逆trace"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-11 /goal GitHub CI self-heal規律に従いrun 29157320527のdoctor hard gate debtを解消する"
created: 2026-07-11
updated: 2026-07-12
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
backprop_decision: not_required
backprop_decision_reason: "CIが検出した既存hard-gate debtを、L4-L6の依存方向・review責務分離・L8逆trace契約に沿って是正する。上位要求の意味変更はない。"
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CISELF-001, test_path: tests/ci-governance-self-heal.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CISELF-002, test_path: tests/ci-governance-self-heal.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CISELF-003, test_path: tests/ci-governance-self-heal.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CISELF-004, test_path: tests/ci-governance-self-heal.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CISELF-005, test_path: tests/ci-governance-self-heal.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CISELF-006, test_path: tests/ci-governance-self-heal.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CISELF-007, test_path: tests/ci-governance-self-heal.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CISELF-008, test_path: tests/ci-governance-self-heal.test.ts }
agent_slots:
  - role: tl
    slot_label: "TL — CI hard-gate原因分類・設計整合・統合判断"
  - role: se
    slot_label: "SE — policy/security/Node adapter依存分離"
  - role: qa
    slot_label: "QA — human bypass・互換API・cycle復活の敵対回帰"
generates:
  - { artifact_path: docs/plans/PLAN-L7-423-ci-governance-self-heal.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L4-basic-design/architecture.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/function-spec.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/security/secret-policy.ts, artifact_type: source_module }
  - { artifact_path: src/policy/feedback-lifecycle.ts, artifact_type: source_module }
  - { artifact_path: src/feedback/lifecycle.ts, artifact_type: source_module }
  - { artifact_path: src/feedback/lifecycle-node.ts, artifact_type: source_module }
  - { artifact_path: src/lint/dependency-drift.ts, artifact_type: source_module }
  - { artifact_path: src/lint/review-evidence.ts, artifact_type: source_module }
  - { artifact_path: src/lint/secret-scan.ts, artifact_type: source_module }
  - { artifact_path: src/lint/shared.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/index.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/audit/quality.ts, artifact_type: source_module }
  - { artifact_path: src/memory/memory-store.ts, artifact_type: source_module }
  - { artifact_path: src/memory/memory-v2.ts, artifact_type: source_module }
  - { artifact_path: src/search/index.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/guardrail-invariants.ts, artifact_type: source_module }
  - { artifact_path: docs/plans/PLAN-L6-62-harness-memory-structure.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-252-completion-human-review-bundle.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-407-harness-memory-structure-v2.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-408-objective-decision-count-binding.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-417-codex-0144-hook-runtime-followup.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-418-github-self-driving-ops.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-419-skill-mythos-uplift.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-DISCOVERY-07-design-bottomup-mode.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-07-requirements-binding-enforcement.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-351-literal-policy-externalization.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L8-00-integration-verification-master.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L9-00-system-verification-master.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L10-00-ux-verification-master.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L11-00-uat-verification-master.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L12-00-acceptance-verification-master.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L13-00-post-deploy-verification-master.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L14-00-operations-feedback-master.md, artifact_type: markdown_doc }
  - { artifact_path: tests/ci-governance-self-heal.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-422-plan-specific-vpair-binding.md
  requires:
    - docs/plans/PLAN-L7-422-plan-specific-vpair-binding.md
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T15:52:03Z"
    tests_green_at: "2026-07-11T15:51:55Z"
    verdict: approve
    scope: "PR CI self-heal deltaを独立レビューした。feedback lifecycle pure policy/Node-SQLite adapter分離、旧import互換identity、secret policy SSoT/state-db互換export、解消cycle grandfather削除、human action-bindingとpositive technical approvalの責務分離、L6 literal逆traceをL4-L6設計・L8 U-CISELF-001..007・7 executable caseへ照合した。fail/reject/request_changes-onlyおよびhuman-only approvalがconfirmed gateを通らず、approve/pass/approve_after_fixesとstructured green commandを最低1件要求することを敵対反例で確認。新moduleと全consumer/evidence repair artifactのgenerates trace、plan lint/governance、dependency/impl/L6 gatesに未解消blockerなし。"
    worker_model: codex
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/review-evidence.test.ts tests/ci-governance-self-heal.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T15:51:55Z"
        evidence_path: tests/ci-governance-self-heal.test.ts
        output_digest: "sha256:8e3d654bad8b82649cfa8b67485242d46e71b056286ec4d1bc451beba26a0c26"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T15:51:55Z"
        evidence_path: src/policy/feedback-lifecycle.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T15:51:55Z"
        evidence_path: src/lint/review-evidence.ts
        output_digest: "sha256:7c44214e30f5631ab0018a73647200e380e0a5e81a1f2a46f32f90acc7a0e205"
  - reviewer: codex-vpair-gate-design-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T16:33:02Z"
    tests_green_at: "2026-07-11T16:32:40Z"
    verdict: approve
    scope: "U-CISELF-008 fresh-clone approval frontier deltaをseverity-firstで2回レビューした。初回REQUEST_CHANGESでmissing draftがapproval検査を広く無効化する穴を検出。missingDraftApprovalHandoffViolationsへstatus、missing/present相互排他、approval/scope/digest/review未確定、valid_for_apply=false、decision-draft commandをfail-closeで追加し、9反例を固定後に再レビューしてblocker/correctness risk 0を確認した。公開済みdraft側のpresent、scope/digest一致、reviewed candidate、pending apply禁止、command route検査も維持。L6、L8 U-CISELF-008、PLAN binding/generatesと実装が整合する。"
    worker_model: codex
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/ci-governance-self-heal.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T16:32:40Z"
        evidence_path: tests/ci-governance-self-heal.test.ts
        output_digest: "sha256:6009616059aad1da267eef07d4700378c5c2245b2e08ef0fd8d59287e900731a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T16:32:40Z"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:44220009afe0690be55eb18f2b4b35dee3d3bb863b32a1b2318af0386a4f54fe"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T16:32:40Z"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:fc7542244c7293612d1e5d187256514bc1ef446f931d296ea8ec26f8744d4443"
---

# PLAN-L7-423: CI強制ゲートの自己修復

## 0. 目的

PR #2の全回帰後doctorで顕在化したhard-gate debtを、例外追加ではなく依存方向・技術review・Vペアtraceの
正本へ戻して解消する。human action-binding判断は技術reviewを代替せず、解消済みcycleはgrandfatherへ戻さない。

## 1. 完了条件

- `security` / `policy` / Node adapterの依存方向が一方向で、新規cycle 0。
- 旧feedback lifecycle import surfaceが互換で、pure consumerは中立policyを直接参照する。
- human-only approvalはgreen command gateを迂回できず、別の技術greenがある場合だけ重複証跡を免除する。
- L6全32 docがL8から逆traceされ、review evidence / impl trace / regression expansion / doctorがgreen。
- fresh cloneでdecision draftが未生成の`approval_required`はdraft生成routeを返してgreenとする。ただしmissing frontierにも相互排他・apply禁止・status/scope/digest/review/command整合を課し、公開後のapproval invariantと合わせてfail-closeを維持する。

## 2. 工程

- step 1: CI失敗を3 hard gateへ分類し、L4-L6契約とL8 oracleをbackpropする。
- step 2: 中立module分離、compat shim、strict evidence判定、direct regressionを実装する。
- step 3: 独立レビュー、全gate、GitHub CIで閉じる。
