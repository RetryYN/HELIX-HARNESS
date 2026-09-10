---
plan_id: PLAN-RECOVERY-1688-preflight-gate-aggregation
title: "PLAN-RECOVERY-1688: 事前ゲート失敗の集約と可視化"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: not_started
owner: Codex / TL
created: 2026-09-10
updated: 2026-09-10
github_issue_id: 1688
behavior_contract_id: CI-PREFLIGHT-GATE-AGGREGATION-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "harness-check の独立事前ゲートが同一の検収対象HEADで実行され、後続shardへの依存関係が定義されている"
contract_postconditions: "事前ゲートを個別に評価し、全結果をtyped JSONとsummaryへ集約して、1件以上の失敗をfail-closeで明示する"
contract_invariants: "review admissionは集約対象から除外して別途強制し、required lane、full regression、receipt、DB rebuild、doctorの成立条件を弱めない"
contract_failures: "失敗を最後の1件だけに縮約すること、continue-on-errorだけで成功扱いすること、review admissionを集約結果で代替すること、無理由skipを許可することを拒否する"
tdd_red_required: true
red_at: "2026-09-10T03:00:00Z"
green_at: null
mutation_oracle_required: true
mutation_oracle_evidence: "tests/harness-check-workflow.test.ts の U-CI-PREFLIGHT-AGGREGATION-001 系列で、集約step欠落、continue-on-errorによるfail-open、review admissionの混入、無理由skip、条件付きゲートの観測漏れ、適用対象のunexpected skip、unexpected skipをfail-closeする条件の削除を個別に拒否する。実CIでは branch_kind_check の単一失敗を集約結果へ保持し、shard起動を停止した。"
complexity_effect: net_neutral
complexity_justification: "既存のfull-regression-preflight内へ結果集約とartifact出力を追加し、新しいscheduler・DB・reviewer・実行経路は作らない"
removal_trigger: "後継のCI結果集約機構が同じ個別失敗、skip理由、review admission分離、fail-closeを独立検証した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-CI-PREFLIGHT-AGGREGATION-001, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 事前ゲート集約と独立レビュー admission の責務境界を照合" }
  - { role: tl, slot_label: "TL — 既存required laneとfail-close条件を維持して集約を統合" }
  - { role: qa, slot_label: "QA — 複数失敗、skip理由、mutation反例を実CIで検証" }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: [docs/plans/PLAN-RECOVERY-1640-biome-preflight.md]
  references: ["issue:1688"]
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1688-preflight-gate-aggregation.md, artifact_type: markdown_doc }
  - { artifact_path: .helix/evidence/review-1714/preflight-gate-results.json, artifact_type: json_config }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-10T08:32:35Z"
    tests_green_at: "2026-09-10T08:29:29Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 44a875e0-4347-4802-8e8a-87cb4f105537
    reviewed_head_sha: f83187e037a0f0a8406b2ba8c6d8c9d821718e32
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1714#issuecomment-5615624939"
    ci_evidence_generation: "run:34453107031:attempt:1:success"
    scope: "PR #1714のf83187e037a0f0a8406b2ba8c6d8c9d821718e32を、Claude Code / Fable 5.1が独立検収した。条件付き事前ゲート6系統の観測、not_applicableとunexpected_skipの分離、fail-close、review admissionの分離、既存required laneの非緩和を確認し、blocker 0でapproveした。minor/importantの後続推奨と、複数条件付きゲート同時失敗の未実証は残す。"
    green_commands:
      - kind: smoke
        command: "GitHub Actions preflight-gate-results artifact from run 34453107031"
        runner: ci
        scope: gate
        exit_code: 0
        completed_at: "2026-09-10T08:08:24.924Z"
        evidence_path: .helix/evidence/review-1714/preflight-gate-results.json
        output_digest: "sha256:ad46cd620f89480d62cdf4e04fe113654f88b296734b43a71a7c6a8f96d98e3a"
---

# 事前ゲート失敗の集約

## 目的

`harness-check` の事前ゲートが複数失敗した場合でも、最初に表面化した1件だけでなく、同一HEADに対する全ゲートの結果を確認できるようにする。失敗の可視性を高めるための変更であり、検査範囲・required lane・独立レビューの成立条件を緩和しない。

## 今回の範囲

- 独立事前ゲートの結果を固定されたIDで集約する。
- success / failure / skipped と、許可されたskip理由をtyped JSONへ出力する。
- summaryとartifactで同じ結果を公開し、失敗が1件でもあれば集約stepをfail-closeする。
- current HEAD independent review admissionはPR状態に依存するため、集約対象外として別のrequired判定を維持する。
- recoveryブランチ自身が要求するPLANをこのPRへ含め、branch-kind gateの契約を満たす。
- branch／event依存の6ゲート（branch type matrixを含む）を同一jobの末尾集約へ追加し、非適用skipとunexpected skipを区別する。

## 対象外

- 事前ゲートの検査内容やrequired性の削除・弱体化
- full regression shard、DB rebuild、doctor、review admissionの代替
- 自動修復、再試行制御、新scheduler、実行予算の変更
- CI failureの意味的な再分類や、既存の失敗を成功へ読み替える変更

## 受入条件

1. 同一HEADの全事前ゲート結果が個別IDでartifactへ残る。
2. 失敗が複数ある場合に、集約結果が全件を保持してfail-closeする。
3. 無理由skipを拒否し、依存失敗によるskipはtyped reasonを付ける。
4. review admissionを集約結果で代替せず、別経路で強制する。
5. 集約stepが成功した場合だけ、既存のfull regressionおよびfinalizeの入力条件を満たす。
6. mutation oracleが集約step欠落・fail-open・review混入・skip理由欠落を検出する。
7. 条件付きゲートが先行失敗で無音skipにならず、適用対象のskipをfail-closeし、非適用skipだけをtyped reason付きで許可する。

## 検証状態

初期CIでは `branch_kind_check` の「recovery branch requires at least one touched PLAN」を集約結果が正しく保持してfail-closeした。今回の第2 sliceでは条件付きゲートを同じ集約へ追加した。run `34453107031` では、同一HEADに対する全required jobがsuccessとなり、preflight artifactの実体digestを取得した。Claudeの独立レビューreceiptはPLANへ転記済みだが、この転記自体で完了を主張せず、転記後のfresh CI・exact-HEAD再レビュー・merge/read-afterを残す。

第3 sliceでは、集約stepのfail-close条件から `unauthorizedSkips` を取り除くmutationと、適用対象を `unexpected_skip` として扱う分岐を反転するmutationを、workflow構造のoracleで拒否する。既存のゲート判定、required性、shard、DB rebuild、doctor、review admissionの成立条件は変更しない。
