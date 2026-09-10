---
plan_id: PLAN-RECOVERY-1727-stage-directive-intake
title: "72投資候補の段階指示書を候補台帳へ移管してroot原稿を退役する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: not_started
owner: Codex / TL
created: 2026-09-11
updated: 2026-09-11
github_issue_id: 1727
behavior_contract_id: DEVELOPMENT-INVESTMENT-STAGE-INTAKE-001
responsibility_owner: document-intake-cleanup
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "root未追跡原稿7件のbytes、統合版と分冊の包含関係、既存Requirement／Capability／Issue ownerを照合できる"
contract_postconditions: "統合版を非authorityの候補台帳へGit保全し、72件と段階割当を検査可能にし、重複root原稿を退役する"
contract_invariants: "候補文書だけでRequirement承認、v1分母追加、一括Issue化、runtime権限追加、実装完了を成立させない"
contract_failures: "原稿欠損、INV欠落・重複、P0〜P4とseverity/V-model/Releaseの混同、存在しない分冊参照、既存正本の上書きを拒否する"
tdd_red_required: true
red_at: "2026-09-10T19:30:00Z"
green_at: "2026-09-10T20:03:06Z"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-10T20:06Zにtests/development-investment-stage-directives.test.tsで実測。U-DIS-001はarchive原文へMUTANTを1語追加してdigest不一致RED、U-DIS-002はINV-072見出しをINV-072Xへ変えてexact set欠落RED、U-DIS-003はREADMEから一括Issue化禁止語を除去してcandidate境界欠落REDとなり、各変異を復元後に同test 3件greenでkillした。"
complexity_effect: net_negative
complexity_justification: "重複6分冊とroot統合原稿を、Git管理された候補入力一冊と退役台帳へ収束する。新しいRequirement engine、scheduler、DB、実行authorityは追加しない"
removal_trigger: "72候補すべてが既存ownerへ採否・残義務付きで終端し、入力台帳をhistoricalへ降格できる時"
entry_signals: [regression_dev]
parent_design: docs/governance/repository-structure.md
pair_artifact: docs/governance/development-investment-stage-directives-source-cleanup-2026-09-11.md
verification_bindings:
  - { parent_design: docs/governance/repository-structure.md, oracle_id: U-DIS-001, test_path: tests/development-investment-stage-directives.test.ts }
  - { parent_design: docs/governance/repository-structure.md, oracle_id: U-DIS-002, test_path: tests/development-investment-stage-directives.test.ts }
  - { parent_design: docs/governance/repository-structure.md, oracle_id: U-DIS-003, test_path: tests/development-investment-stage-directives.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 候補とcurrent authorityの境界を照合" }
  - { role: tl, slot_label: "TL — 原稿保全・重複縮退・既存owner接続を統括" }
  - { role: qa, slot_label: "QA — hash・72 ID exact set・段階割当・root退役を検査" }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1727", "issue:1500", "issue:1034", "issue:1293", "issue:1639"]
  blocks: []
generates:
  - { artifact_path: docs/archive/intake/development-investment-stage-directives-source_v1.0.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/development-investment-stage-directives-intake_v1.0.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/development-investment-stage-directives-source-cleanup-2026-09-11.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1727-stage-directive-intake.md, artifact_type: markdown_doc }
  - { artifact_path: tests/development-investment-stage-directives.test.ts, artifact_type: test_code }
  - { artifact_path: .helix/evidence/review-1729/vitest-targeted.json, artifact_type: json_config }
modifies:
  - { artifact_path: docs/governance/candidates/README.md, artifact_type: markdown_doc }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-10T20:42:23Z"
    tests_green_at: "2026-09-10T20:23:21.811Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 44a875e0-4347-4802-8e8a-87cb4f105537
    reviewed_head_sha: f0a5f704fb77893e1286fa0dd590624b022bdcea
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1729#issuecomment-5625170177"
    ci_evidence_generation: "run:34527254684:attempt:1:failure"
    scope: "段階指示書原文bytes保全、日本語candidate境界、72 ID/P0〜P4 exact set、PLAN discipline、実bytes evidence、Issue/PR境界をexact HEADでreviewした。CI failureは旧tests_green_atだけで、green扱いせず本receipt時刻へ正規転記する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/development-investment-stage-directives.test.ts --reporter=json --outputFile=.helix/evidence/review-1729/vitest-targeted.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-10T20:23:21.811Z"
        evidence_path: .helix/evidence/review-1729/vitest-targeted.json
        output_digest: "sha256:4052967f5cd23fdb455cdb7356a839378a90deae6b02a66a9b4459ec72e7f997"
        result: "Codex author runtime: 1 file / 3 tests pass; JSON report bytes=1851"
---

# 開発投資段階指示書の正規移管

## 目的

未追跡の統合原稿と重複6分冊を、current authorityと誤認されない候補入力台帳へ移管し、原稿を
安全に退役する。72候補の採否・実装を一PRへ広げず、既存ownerとの照合に使える入力を欠落なく残す。

## 今回の範囲

- 統合版bytesのGit保全
- INV-001〜072、P0〜P4、能力依存、既存導入束、共通受入、出典の保持
- candidate/non-authority/v1非自動追加境界の明記
- 原稿7件のhash・移管先・削除結果の記録
- 重複6分冊とroot統合原稿の退役

## 対象外

- 72候補の一括Requirement化、承認、Issue化、実装
- v1分母、Release Wave、障害severity、V-model layerの変更
- 新しい自動適用・merge・publish・外部操作権限
- 各候補の最新実装状態をこの入力時点の記録だけで確定すること

## 受入条件

1. 統合版のraw SHA-256と保全先bytesが一致する。
2. INV見出しのexact setが001〜072で、欠落・重複がない。
3. 全件対応表の主段階が72件のexact setで、P0〜P4以外を含まない。
4. 候補境界と存在しない`06_ITEM_DIRECTIVES.md`の解決先がREADMEに明記される。
5. root原稿7件を削除し、hash付き退役記録から内容と移管先を逆引きできる。
6. targeted test、PLAN lint、docs/guard、CI、独立exact-HEAD review、main read-afterが成立する。
