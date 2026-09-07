---
plan_id: PLAN-RECOVERY-1640-biome-preflight
title: "PLAN-RECOVERY-1640: Biomeの早期検出と重複実行除去"
kind: recovery
layer: L7
status: draft
completion_claim_allowed: false
owner: Codex
created: 2026-09-08
updated: 2026-09-08
github_issue_id: 1640
behavior_contract_id: CI-BIOME-FAIL-FAST-001
responsibility_owner: ci-validation-order
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
  - { artifact_path: docs/plans/PLAN-RECOVERY-1640-biome-preflight.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
review_evidence: []
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

- preflightの依存導入後にlintが一回だけ存在し、finalizeには存在しない。
- lintの削除・finalizeへの逆戻し・条件付き化・コマンド変更・fail-openを個別に検出する。
- 実Biomeが整形不備fixtureを拒否し、正しいfixtureを受理する。
- 配置テスト、局所テスト、全CI、独立reviewを通す。
- 過去runの推定削減時間を今回の実測効果として報告しない。

## 工程表

1. R0: Issueと現行workflow/testを照合（確認済み）。
2. R1/R2: 配置oracleと反例を更新し、旧配置でRedを採取（exit 1、biome_preflight_invalid）。
3. R3: 同じlintをpreflightへ移動。workflowテスト63件、型検査は成功。実Biomeで不正整形fixtureをexit 1、整形後をexit 0として確認し、一時fixtureを撤去した。
4. R4: 独立review・CI・main read-after・効果観測（未実施）。

## 完了境界

局所実装・配置反例検査まで実施。全CI・独立review・main到達・削減効果の実測は未完了。
DB再構築はexit 0、81518行のprojectionを確認。新規draft PLANを含めsnapshotは93件から94件へ機械更新した。
撤回は正規PRで元の順序へ戻せるが、今回追加する配置契約との整合を再検収する。
