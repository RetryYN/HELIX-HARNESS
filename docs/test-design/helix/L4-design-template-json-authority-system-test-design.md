---
title: "Design Template JSON authority L9 system test設計"
layer: L4
executed_at_layer: L9
artifact_type: test_design
status: confirmed
created: 2026-07-31
updated: 2026-07-31
owner: QA
plan: docs/plans/PLAN-L4-55-design-template-json-authority.md
pair_artifact: docs/design/helix/L4-basic-design/design-template-json-authority.md
---

# Design Template JSON authority L9 system test設計

| oracle | scenario | 合格条件 |
|---|---|---|
| ST-DTJ-001 | Requirement JSONとDesign Obligation Graphからtemplateを選択 | registry内IDのexact setだけを返し、uncovered/duplicate 0 |
| ST-DTJ-002 | `all`/`any`/`not`を含むtyped applicabilityを評価 | field/operator/value typeが正しい場合だけ決定論的に同じ結果 |
| ST-DTJ-003 | unknown field/operator/enumまたは自由文条件を入力 | 推測fallbackせずfail-close |
| ST-DTJ-004 | required section/field、trace、negative oracle、measurement、pairのいずれかを欠落 | completion false、欠落fieldをexact finding化 |
| ST-DTJ-005 | 同義templateまたは同じobligationへのnormative ownerを重複 | portfolioを採用せずduplicate finding |
| ST-DTJ-006 | generated Markdown/HTML/Mermaidだけを直接変更 | source digest driftとして拒否しJSONへ逆流0 |
| ST-DTJ-007 | 既存artifactをshadow変換 | current authorityを切り替えずsemantic parityと差分を再現 |
| ST-DTJ-008 | narrative Markdownを削除 | JSONだけから構造、適用条件、trace、pair graph、completionを再現 |
| ST-DTJ-009 | legacy catalog green、JSON candidate red | dual-green不成立としてcutover拒否 |
| ST-DTJ-010 | Design Refactor Gateを実行 | 機能・性能・oracle維持の証拠なしにcomponent/schema/code増加を許可しない |

L9はrepository全体をsystem boundaryとして、authorityの一方向性、exact selection、fail-close、
shadow parityを検証する。schema validator単体のfield境界はL8、実装関数はL6/L7へ降ろす。
