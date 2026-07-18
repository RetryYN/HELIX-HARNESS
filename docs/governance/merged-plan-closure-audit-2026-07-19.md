# merged PLAN 閉鎖監査（2026-07-19）

## 目的

`merged-plan-status` が検出した8件について、生成物が既に `main` へ入った事実だけで状態を変更せず、
Vペア、実行可能oracle、型検査、lint、独立レビューおよび実データ性能を再検証して閉鎖可否を判断する。

## 判定

| PLAN | 判定 | 根拠 |
|---|---|---|
| `PLAN-L5-79-source-boundary-architecture` | confirmed | L5/L9 Vペア、source boundary 48 tests、slow read-only route 1 test、既存独立レビューがgreen |
| `PLAN-L6-79-source-boundary-contracts` | confirmed | L6/L8 DbCとnegative oracle、同上の実行証跡、既存独立レビューがgreen |
| `PLAN-L7-450-state-db-vscode-decoupling` | confirmed | composition root以外のstate-db/vmodel/vscode edge 0、実repo graph oracle、既存独立レビューがgreen |
| `PLAN-L7-451-lint-effect-port-separation` | confirmed | pure analyzer、effect receipt、readonly route、durability負例、既存独立レビューがgreen |
| `PLAN-L7-452-source-boundary-policy-ratchet` | confirmed | total decision、mutation、実repo graph、450/451 terminal順序、既存独立レビューがgreen |
| `PLAN-L7-455-sessionstart-feedback-receipt-batch` | confirmed | 17 testsと実データ全量SessionStart 18.34秒、閉鎖再監査でBlocker/High 0 |
| `PLAN-L7-456-document-agent-metadata-phase-b-apply` | confirmed | U-AGMETA-008..012、IT-AGMETA-004..005、既存独立レビューがgreen |
| `PLAN-L7-457-document-diff-local-artifact-output` | confirmed | U-DOCDIFF-008、IT-DOCDIFF-003、既存独立レビューがgreen |

## 検証コマンド

| 種別 | command | 結果 | output digest |
|---|---|---|---|
| ソース境界 | `bun test <source-boundary targeted set> --timeout 300000` | 48件成功 / 失敗0件 | `sha256:cadaacbff7c7843c07095c03e15d9f44b7822c00b147e1ccd203d1f24e1ce3dc` |
| 読取専用経路 | `bun test tests/slow/lint-readonly-route.test.ts --timeout 300000` | 1件成功 / 失敗0件 | `sha256:b6f23889e118797c2e1140dc2df86513ec955fe5d15d06d49eca4b736d2c809c` |
| ヘッドレス・adapter | `bun test tests/slow/source-boundary-headless.test.ts tests/visualization-treeview.test.ts --timeout 300000` | 14件成功 / 失敗0件 | 実行出力を閉鎖再監査で確認 |
| feedback一括処理 | `bun test tests/feedback-lifecycle.test.ts tests/feedback-lifecycle-surface.test.ts --timeout 300000` | 17件成功 / 失敗0件 | `sha256:047a007c0ae7d028b6530c2103a33c363511085a2cf45ca740e0283c042105bb` |
| 文書エンジン | `bun test <document-engine targeted set> --timeout 300000` | 12件成功 / 失敗0件 | `sha256:92b072ab44b3d129bd3908c15117eee2f86032a5f1e83b9097a33d6896668bb0` |
| document CLI | `bun test tests/cli-surface.test.ts -t 'IT-DOCDIFF-003' --timeout 300000` | 1 pass / 0 fail | `sha256:b5349ba61841aec712a981f3ac5137966137f593f4e3645b5952aaeabc8a3e8b` |
| typecheck | `bun run typecheck` | exit 0 | `sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92` |
| Biome | `bunx biome check <8 PLANs and generated source set>` | 20ファイル検査、終了コード0 | `sha256:b57b4b3bd1b9b708c7386803e5423eaadd16fe70a7bebfc2897779ab7a4c39fa` |

## PLAN-L7-455 実データ性能証拠

- 入力は `/home/tenni/HELIX-HARNESS/.helix/harness.db` のcopy（449MB）と
  `.helix/logs/feedback-lifecycle.jsonl` のcopy（60MB）。原本を変更しない隔離worktreeで実行した。
- command: `/usr/bin/time bun run src/cli.ts session start --session closure-audit-20260719`
- 結果: `elapsed=18.34`、`user=7.03`、`sys=3.44`、`maxrss_kb=1127036`、`exit=0`。
- stdout digest: `sha256:4d09709573041e17677d9f6c92f334914f9462970971fef6372ed083a871c6e0`。
- stderrは0 byte。30秒上限を満たし、処理対象の省略は行っていない。

## レビュー

source boundaryとdocument engineは2026-07-16の既存 `intra_runtime_subagent` 独立レビューを再照合した。
feedback batchは上記のoperation-count、replay/recovery、実データ全量性能を別パスで再監査し、
Blocker/High 0と判定した。statusだけを先行変更せず、green command後にレビュー判定を記録する。
