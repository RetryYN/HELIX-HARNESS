---
plan_id: PLAN-RECOVERY-1432-outstanding-fail-close
title: "outstandingのirreversible_impact schema不適合と未検証plan_idをfail-closeする"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
irreversible_impact: none
created: 2026-09-08
updated: 2026-09-09
owner: Cursor / TL
github_issue_id: 1432
behavior_contract_id: OUTSTANDING-FAIL-CLOSE-1432
responsibility_owner: outstanding-fail-close
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — cutover宣言とplan_id埋め込みのfail-close境界を照合" }
  - { role: tl, slot_label: "TL — version-up本文判定がS4/人承認を隠さないことを検収" }
  - { role: se, slot_label: "SE — outstanding loaderとscoped commandの拒否を修復" }
  - { role: qa, slot_label: "QA — cutOver・注入plan_id・S4+version-up本文の反例を検証" }
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-OUTSTANDING-1432-001, test_path: tests/outstanding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-OUTSTANDING-1432-002, test_path: tests/outstanding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-OUTSTANDING-1432-003, test_path: tests/outstanding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-OUTSTANDING-1432-004, test_path: tests/completion-decision-packet.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1432", "issue:1418", "issue:1379"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1432-outstanding-fail-close.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/lint/outstanding.ts, artifact_type: source_module }
  - { artifact_path: tests/outstanding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/completion-decision-packet.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: markdown_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-09T18:44:00Z"
    tests_green_at: "2026-09-09T18:42:53Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 44a875e0-4347-4802-8e8a-87cb4f105537
    reviewed_head_sha: 49a285266f345f648ba57023fe32a7bcc4b99d94
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1683#issuecomment-5606945481"
    ci_evidence_generation: "run:34383205122:attempt:2:success"
    scope: "PR #1683 exact HEAD 49a285266 の独立 Claude receipt（comment 5606945481、session 44a875e0-4347-4802-8e8a-87cb4f105537）を作成側が機械転記した。blocker 0 / approve。第2 receipt と merge は未了。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/outstanding.test.ts tests/goal-evidence-audit.test.ts tests/plan-descent-specific-parent-binding.test.ts --reporter=json --outputFile=.helix/evidence/review-1683/vitest-targeted.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-09T18:42:53Z"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:daa5c36f7ed21e04cb8a7250b10afa560e7fa5f800b1dea102ec0389a07e3d05"
---

# outstandingのfail-close修復

Issue #1432で実測された3つのfail-openを、既存`outstanding` surfaceの実装欠陥として修復する。
新しいcutover authority、新しいpacket command、docs/plans不在時のfail-openは追加しない。

## 受入境界

`irreversible_impact` が存在するのに schema 不適合なら `irreversible_migration_pending` を立てる。
`planIdSchema` 不適合の raw `plan_id` は scoped / runnable command に使わない。文字 allowlist だけ通る `foo` も受理しない。
不適合でも PLAN 行は outstanding 集計から消さない。文書ごとに決定的な command-safe な表示用識別子を与え、同一 sentinel で複数文書を潰さない。fallback identity の digest 入力は `readdirSync({ encoding: "buffer" })` で得たファイル名の raw bytes を使い、文字列復号や表示用 NFC 正規化と物理文書 identity を混同しない。不正 UTF-8 バイトを含むファイル名も行を消さず区別する。読取は Buffer path で行い、復号名の join による欠落を避ける。`frontmatter_schema_invalid` で阻止状態を可視化する。
`version_target` frontmatter が無い本文 only の version-up 語は `po_decision_pending` / `human_approval_pending` より下位にする。

## 現在の証拠

修正対象は `src/lint/outstanding.ts` と既存 outstanding / completion packet 回帰に限定する。
独立 receipt（comment 5606945481）を `review_evidence` へ転記した。`completion_claim_allowed=false` を維持し、第2 receipt・JIT 後 CI・merge を完了主張しない。
