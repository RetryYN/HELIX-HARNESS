---
plan_id: PLAN-L7-555-issue-metadata-enforcement
title: "PLAN-L7-555 (add-impl): Issue起票metadataの機械強制"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #633のIssue起票metadataを機械強制する"]
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 633
engineering_discipline_required: true
behavior_contract_id: ISSUE-METADATA-ENFORCEMENT-001
responsibility_owner: github-issue-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "GitHub Issueのnumber/state/createdAt/labelsが取得できる"
contract_postconditions: "open Issueのtype/lifecycle欠落と48時間以上unlabeledがdeterministic findingになる"
contract_invariants: "closed Issueと48時間未満をstale-unlabeledへ誤算入せずmetadataを推測補完しない"
contract_failures: "invalid clock/thresholdと必須label欠落をfail-closeする"
tdd_red_required: true
red_at: "2026-08-14T04:30:00+09:00"
green_at: "2026-08-14T04:31:00+09:00"
mutation_oracle_evidence: "tests/issue-metadata-audit.test.tsは反例で挙動を殺す。issue#2のcode列をtoEqual([unlabeled_open_issue_stale, type_label_missing, lifecycle_label_missing])で順序込み固定するため、いずれかの判定を落とすmutationはfailする。issue#3 (createdAtがnowから25h) をstale findingに含めない検査は48h閾値を24h等へ緩めるmutationをkillし、issue#4 (closed) を全findingから除外する検査はstate!==openのearly continueを外すmutationをredにする。type判定を!==1から>=1へ緩めるmutationはU-IMETA-001のok=true側では検出できないため、2件以上のtype label反例は#634へ分離する。"
complexity_effect: justified_positive
complexity_justification: "pure classifierと既存github CLI配線だけを追加しdependency graphは#634へ分離"
removal_trigger: "GitHub側Issue Form/Rulesetが同一taxonomyと滞留判定を強制しHELIX auditが不要になった時"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-IMETA-001, test_path: tests/issue-metadata-audit.test.ts }
generates:
  - { artifact_path: src/runtime/issue-metadata-audit.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-metadata-audit.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-475-issue-hierarchy-contract.md
  requires: [docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md]
  blocks: [issue:633, issue:634]
agent_slots:
  - { role: se, slot_label: "SE — metadata classifier/CLI" }
  - { role: qa, slot_label: "QA — threshold/false-positive oracle" }
review_evidence:
  - reviewer: claude-opus-5
    review_kind: cross_agent
    reviewed_at: "2026-08-13T21:46:00+00:00"
    tests_green_at: "2026-08-13T21:45:10+00:00"
    verdict: approve
    scope: "PR #671 (feature/issue-metadata-enforcement) HEAD a6752b5e を Claude Code 収束レーンで
      独立レビューした。auditIssueMetadata は now 注入の pure classifier で時刻依存の非決定性が無く、
      不正 option を issue_metadata_options_invalid で fail-close し、label を trim + lowercase 正規化して
      から判定する。governed type の判定に !== 1 を使うため 0 件だけでなく 2 件以上も検出する。
      CLI 側は --paginate --slurp の read-only 監査で write 経路を持たない。blocker 0。
      非 blocker として createdAt が parse 不能な場合に stale 判定が黙って skip される点を Issue 分離とした。
      本 entry は merge 後に merged-plan-status が未 confirm を検出したことへの是正であり、
      review 自体は merge 前に実施済み (receipt sha256:7a84b933016f35f55af533ebb90d8487f414acec26da0b16de8e64bde76a594d)。"
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5[1m]
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/issue-metadata-audit.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-13T21:45:10+00:00"
        evidence_path: tests/issue-metadata-audit.test.ts
        output_digest: "sha256:17c566c22764aa40310be38a7168b43db02cebdbd95f8ce2fdffd80d1c7c91de"
        result: "2 passed (1 file)"
---

# Issue起票metadataの機械強制

#633だけを閉じる原子slice。依存graphとPLAN相互整合は#634へ残す。
