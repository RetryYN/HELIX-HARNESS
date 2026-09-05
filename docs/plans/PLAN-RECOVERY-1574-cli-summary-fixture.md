---
plan_id: PLAN-RECOVERY-1574-cli-summary-fixture
title: "CLI summary検証の同一シナリオ準備を共有する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 93
responsibility_owner: cli-surface-verification
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — 検証責務を保持" }
  - { role: tl, slot_label: "TL — 入力と寿命を限定" }
  - { role: se, slot_label: "SE — 重複準備を削減" }
  - { role: qa, slot_label: "QA — 反例と実測を比較" }
parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
pair_artifact: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-001, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-002, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-003, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-004, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-005, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-006, test_path: tests/cli-surface.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:93", PLAN-L7-672-current-location-summary-typed-output]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1574-cli-summary-fixture.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md, artifact_type: test_design }
review_evidence: []
---

# CLI検証の重複準備削減候補

現在はローカル実験段階。採番・独立レビュー・CI・main接合を経るまでは完成としない。
基準f880d297のU-CLSO-001〜006は6成功、112.80秒。実行条件はIssue #93へ記録した。

同一scenarioのtext/json/summaryをbeforeAllで各一度実起動し、5つの出力oracleへ渡す。
各assertionとID、欠落authorityの独立fixture、実際のdefault DB再構築を保持する。
fixtureは当該describeの実行寿命だけとし、process間・次回実行へのcacheを作らない。
runtimeのfreshness・default経路・必要な検証義務は変更しない。
schemaとtextを退行させた変異が失敗し、復元後に成功することを別途確認する。
局所実測だけでCI全体の高速化完了とは扱わない。

## 局所検証記録

2026-09-06 06:48:03 JST、候補で6成功、48.43秒。型検査exit 0、governance1188件OK。
06:49:48 JST、schema v1と旧drive-reverse-scopeを同時に注入した実験では、
U-CLSO-005が旧text、006がschema不一致をそれぞれassertionで検出し2失敗（exit 1）。
これは二つの変異を同時注入した試験であり、単一変異ごとの独立実験とは数えない。
src/cli.tsを元に戻し、git diffで変更なしを確認後、06:50:52 JSTに6成功、48.40秒。
baseline112.80秒とはworktree・PLAN件数・並走負荷が異なる単発比較で、CI p95ではない。
