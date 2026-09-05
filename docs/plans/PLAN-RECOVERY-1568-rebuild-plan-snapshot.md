---
plan_id: PLAN-RECOVERY-1568-rebuild-plan-snapshot
title: "DB再構築内のreview PLAN重複解析を除去する"
kind: recovery
layer: cross
drive: db
status: draft
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 93
behavior_contract_id: DB-REBUILD-REVIEW-SNAPSHOT-001
responsibility_owner: state-db-projection
entry_signals: [regression_dev]
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-DBRS-001, test_path: tests/slow/projection-writer.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:93"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1568-rebuild-plan-snapshot.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/harness/L6-function-design/function-spec.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: tests/slow/projection-writer.test.ts, artifact_type: test_code }
review_evidence: []
---

# DB再構築の局所最適化

既存DB投影責務の性能修復。要求意味、投影行、Git provenance検査、rollbackを変更しない。
model run・roadmap status・review registryが利用するreview PLANを再構築呼出し内で一度取得する。
グローバルキャッシュ、永続DBへの暗黙fallback、次回再構築への解析結果の持越しは禁止する。

## 検証予定

- U-DBRS-001: 一度の再構築に解析一度。次回はPLAN変更を読み直す。
- 既存projection-writer回帰で投影内容、再生、失敗時rollbackを維持する。
- 同じHEAD・環境の前後区間計測を記録し、単発値をp95と解釈しない。
- 独立レビューと現HEAD CIは未実施。実装完了・#93終端を主張しない。

## 2026-09-06 局所実測

基準main `84fe826449c1415bd60b42c81c2c0820bc79411b`。専用branch
`recovery/93-rebuild-plan-snapshot`。未commitの意図差分だけを対象とする。

- 05:02 JST RED: `npx vitest run --project slow tests/slow/projection-writer.test.ts -t U-DBRS-001`。
  期待1回に対しloadReviewPlansが3回呼ばれ、1 failed / exit 1。
- 05:03 JST GREEN: 同じコマンドで1 passed / 47 skipped / exit 0。
  2回目再構築前のPLAN status変更がreview registryへ反映されることも確認した。
- `npm run typecheck` exit 0、対象2ファイルのBiome check exit 0、`git diff --check` exit 0。
- projection-writer全48テストは05:03:55開始、117.54秒で48 passed / exit 0。
  実行中にPLAN採番と設計追記を行ったため、最終差分の検証としては再確認を残す。
- PLAN採番を1568へ是正し、L6/L8へU-DBRS-001を束縛。PLAN lintは593 bindings・
  findings 0、採番1168件・新規衝突0でexit 0。
- 全投影parityの前後比較、同条件の性能改善値、独立検収は別途確認する。
  今回の局所greenで代替しない。

## 同一入力ツリーでの比較

2026-09-06、Node24、同一processでbefore→afterを各1回、別のメモリDBへ投影した。
両者のrepoRootは本専用worktreeへ固定。before実装は23b1e5cf側で、84fe82644との
state-db/composition/schema/lint/graph/vmodel差分が無いことを確認した。

- before: 22895ms、after: 15613ms（単発7.282秒、約31.8%短縮）。
- 両者80714行。比較用SHA256は両者とも
  `45caf31bc33a8d8e3058a28540494e410de157c022740b98fc880f780b5db58d`。
- 既存projectionStateRows oracleと同様に`*_at`、`source_clock`、
  current-location/visualizationの`snapshot_hash`を比較から除外した。
  それ以外の行集合は追加0・削除0。時刻情報を含めたbyte完全一致とは主張しない。
- 順序固定・各1回でありcold/warm統制やp50/p95ではない。CI全体の31.8%短縮でもない。
- 最終commit上の回帰、独立検収、現HEAD CIは未完了。

05:12 JSTにU-DBRS-001へ解析例外を注入する検証を追加し、1 passed / exit 0。
成功時の共有だけでなく、失敗時に既存DB投影行が保持されることを確認した。

05:17:30 JST開始の最終回帰は48 passed / exit 0、117.15秒。
同差分のPLAN lint・型検査・Biomeもexit 0。DB再構築は80714行、snapshotは
新規非終端PLAN1件を加えて75→76へ生成された。commit/push後のCI・独立検収は未完了。
