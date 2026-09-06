---
title: "Action-binding承認準備判定単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-06
updated: 2026-09-06
owner: Codex / QA
plan: docs/plans/PLAN-RECOVERY-1431-action-binding-approval-readiness.md
parent_design: docs/design/helix/L6-function-design/action-binding-approval-readiness.md
pair_artifact: docs/design/helix/L6-function-design/action-binding-approval-readiness.md
behavior_contract_id: HR-NFR-P8-01
responsibility_owner: action-binding-approval-readiness
---

# Action-binding承認準備判定単体テスト設計

| Oracle | 反例 | 期待結果 |
|---|---|---|
| U-ABR-001 | actor/tool/target/paramsへ各placeholderを指定 | 各fieldが`pending`、blocked reasonが残る |
| U-ABR-002 | `root`、`admin`、`full access`等の広域値 | `invalid`として拒否 |
| U-ABR-003 | 高影響approval文へ「証跡」を追記 | requirement判定を相殺しない |
| U-ABR-004 | targetとapproval obligationを隣接文へ分割 | requirementとして検出 |
| U-ABR-005 | cutover snapshot期待値を供給しない | snapshot checkが`pending`、silent skipしない |
| U-ABR-006 | 説明専用・実行非許可の文 | 高影響実行要求へ誤分類しない |

実装oracleは `tests/action-binding-approval-readiness.test.ts`、version-up共通判定の回帰は
`tests/version-up-readiness.test.ts` に置く。
