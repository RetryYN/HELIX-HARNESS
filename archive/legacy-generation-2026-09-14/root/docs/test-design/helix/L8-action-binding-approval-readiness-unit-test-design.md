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

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-ABR-001 | typed approval binding | actor/tool/target/paramsへ各placeholderを指定し、各fieldが`pending`、blocked reasonが残る | `tests/action-binding-approval-readiness.test.ts` |
| U-ABR-002 | least-privilege scope | `root`、`admin`、`full access`等の広域値を`invalid`として拒否 | `tests/action-binding-approval-readiness.test.ts` |
| U-ABR-003 | approval requirement classifier | 高影響approval文へ「証跡」を追記してもrequirement判定を相殺しない | `tests/action-binding-approval-readiness.test.ts` |
| U-ABR-004 | bounded sentence context | targetとapproval obligationを隣接文へ分割してもrequirementとして検出 | `tests/action-binding-approval-readiness.test.ts` |
| U-ABR-005 | snapshot validation | cutover snapshot期待値を供給しない場合、snapshot checkが`pending`となりsilent skipしない | `tests/action-binding-approval-readiness.test.ts` |
| U-ABR-006 | non-execution context | 説明専用・実行非許可の文を高影響実行要求へ誤分類しない | `tests/action-binding-approval-readiness.test.ts` |

実装oracleは `tests/action-binding-approval-readiness.test.ts`、version-up共通判定の回帰は
`tests/version-up-readiness.test.ts` に置く。
