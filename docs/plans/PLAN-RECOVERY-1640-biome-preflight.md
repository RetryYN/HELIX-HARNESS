---
plan_id: PLAN-RECOVERY-1640-biome-preflight
title: "PLAN-RECOVERY-1640: Biomeの早期検出と重複実行除去"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: completed
owner: Codex
created: 2026-09-08
updated: 2026-09-09
github_issue_id: 1640
behavior_contract_id: CI-BIOME-FAIL-FAST-001
responsibility_owner: ci-validation-order
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: not_applicable
no_code_decision: configure
ddd_modeling_decision: policy
contract_preconditions: "依存導入済みpreflightと既存lintコマンド、全shardのneedsを照合する"
contract_postconditions: "既存lintをpreflightで一回実行し、不備をshard起動前に拒否する"
contract_invariants: "対象src/tests、検査強度、required aggregate、receipt、DB、doctorを維持する"
contract_failures: "lint削除、finalizeへの逆戻し、shard後への移動、重複、別command、条件付きskip、continue-on-errorを拒否する"
tdd_red_required: true
red_test: "tests/harness-check-workflow.test.tsの初期4 mutantに対し配置判定節を除去しても64 passedとなるsurvivorを独立reviewが検出し、oracle強化未成立をRedとして差し戻した。"
red_at: "2026-09-08T15:23:48Z"
green_at: "2026-09-08T16:00:49Z"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/harness-check-workflow.test.ts::U-BIOMEFAST-001で、c7e0a8a48ac6fa94d2b0086c7f28374885b5590eがremovedFromPreflight依存を分離し、duplicatedInFinalize／duplicatedIntoShard／removedFromPreflight／movedAfterShardPlanを個別投入した。条件節の独立除去実測ではlintSteps.length、shardHasLint、finalizeSteps.someが各1 failed、配置条件2節の同時除去が1 failedとなり、baselineは64 passed。詳細実測はPR #1676 review comment 5588321930および5588346921。残る単独survivor F1は本PLANで開示し、Issue #1671のmutation evidence機構改善への実測入力として参照する。本sliceのblockerではない。"
complexity_effect: net_neutral
complexity_justification: "既存検査の配置変更と退行oracleに限定し、別検査機構を作らない"
removal_trigger: "後継のCI計画が同じ早期検査義務を引き継ぎ、独立検収した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-BIOMEFAST-001, test_path: tests/harness-check-workflow.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references:
    - issue:1640
    - issue:93
  blocks: []
generates:
  - { artifact_path: .helix/evidence/review-1676-terminal/vitest-targeted.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1640-biome-preflight.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
agent_slots:
  - { role: tl, slot_label: "TL — 検査義務を維持して既存lintの実行順を修復" }
  - { role: qa, slot_label: "QA — 早期拒否と合法入力通過・配置反例を検証" }
  - { role: aim, slot_label: "AIM — Recoveryの責務境界と必須検証の非緩和を照合" }
review_evidence:
  - reviewer: "Claude Code / Opus 5"
    review_kind: cross_agent
    reviewed_at: "2026-09-08T21:52:11Z"
    tests_green_at: "2026-09-08T22:11:40Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: 77375ef5-9b74-425a-91ee-45ebc9fea1d9
    reviewed_head_sha: 3242c20419e8ea5297552f11c222ed76d672c0ef
    receipt_url: https://github.com/RetryYN/HELIX-HARNESS/pull/1676#issuecomment-5592353929
    ci_evidence_generation: "run:34280725387:attempt:1:success"
    scope: "旧approve receiptの対象4 pathがJIT main同期後もbyte同一であること、exact HEADのCI 12/12成功、DB projection/checkpoint replay収束を独立reviewerが実測した。残る単独survivor F1は本PLANで開示し、Issue #1671のmutation evidence機構改善への実測入力として参照する。本sliceのblockerではない。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/harness-check-workflow.test.ts --reporter=json --outputFile=.helix/evidence/review-1676-terminal/vitest-targeted.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-08T22:11:40Z"
        evidence_path: .helix/evidence/review-1676-terminal/vitest-targeted.json
        output_digest: "sha256:7f1489e907ef8dd1ae8314c694135fe62bc8895b21c8c96fd3c6a0aecf55adad"
---

# 既存CIの検査順修復

基準main: `97150245e5df08bed316ff4aca19895889d59f60`。
INV-019は本Issueへの入力参照であり、新要求ID・実行許可として使わない。

## 原因と対象

Biomeが全shard完了後のfinalizeにあるため、数秒で検出できる不備が全回帰の後まで遅延する。
既存workflow oracleもその順序を固定している。両者を同一sliceで修復する。

## 不変条件

`npm run lint`、対象src/tests、error判定、Node/toolchainは変えない。
continue-on-error・条件付きskipを追加せず、shardはpreflight成功後にだけ起動する。
最終receipt照合・DB・doctor・独立review・merge条件を維持する。

## 受入と反例

- preflightの依存導入直後にlintが一回だけ存在し、shard plan生成stepより前に置かれる。
- finalizeと各shard jobへ`npm run lint`を持ち込まない。
- preflightのlintを残したままfinalize・shardへ複製する、preflightから除く、shard plan生成後へ移すmutationを個別に検出する。
- 重複・条件付き化・コマンド変更・fail-openも個別に検出する。
- 実Biomeが整形不備fixtureを拒否し、正しいfixtureを受理する。
- 配置の局所テストとdiff-checkだけを完了根拠にする。全CI・独立reviewは自己申告しない。
- 過去runの推定削減時間を今回の実測効果として報告しない。

## 工程表

1. R0: Issueと現行workflow/testを照合（確認済み）。配置移動はPR #1648でmainへ入済み。
2. R1/R2: 配置oracleと反例を更新し、旧配置でRedを採取（exit 1、biome_preflight_invalid）。
3. R3: 同じlintをpreflightへ移動済み。本sliceはU-BIOMEFAST-001へfinalize逆戻し・preflight除去・shard後移動の明示mutationを追加した。
   Node v24.15.0。`npx vitest run tests/harness-check-workflow.test.ts` は 64 passed / exit 0。
   `npm run lint` は 27 warnings / 1 info / exit 0。整形不備fixtureは exit 1、撤去後 exit 0。
   `git diff --check` は exit 0。対象PLANの `plan lint` と `--gate governance` は exit 0。
   この局所実測後、同一実装HEADについて全CIと独立reviewを別主体が実施し、R4へ記録した。
4. R4: fresh exact-HEAD CI、正式独立review receipt、terminal PLAN束縛の順に収束する。配置順の実測効果は後続telemetryで観測し、推定値を成果へ昇格しない。

## 完了境界

workflow配置そのものはmain既存。本sliceは配置契約のmutation閉鎖を明示化し、targeted test、exact HEADの全CI、正式独立review receiptを完了根拠とする。
exact HEAD `3242c20419e8ea5297552f11c222ed76d672c0ef` の全CI成功とformal independent receiptを取得したため、本sliceをconfirmedとする。削減効果の継続実測は後続telemetryの責務であり、本PLANの完了条件へ混入しない。
撤回は正規PRで元の順序へ戻せるが、今回追加する配置契約との整合を再検収する。
