---
title: "Design Template JSON authority L8 integration test設計"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-31
updated: 2026-07-31
owner: QA
plan: docs/plans/PLAN-L5-82-design-template-json-authority.md
pair_artifact: docs/design/helix/L5-detail/design-template-json-authority.md
---

# Design Template JSON authority L8 integration test設計

| oracle | mutation | 合格条件 |
|---|---|---|
| IT-DTJ-001 | required fieldまたはunknown propertyを混入 | `schema_invalid`、activation不可 |
| IT-DTJ-002 | template ID/versionを重複 | `template_identity_duplicate` |
| IT-DTJ-003 | registry digestとtemplate byteをずらす | `template_digest_mismatch` |
| IT-DTJ-004 | applicabilityへunknown field/operator、型不一致、空allを入れる | `applicability_invalid`、推測fallback 0 |
| IT-DTJ-005 | requirement/obligation/system contract traceを一つ欠落 | `trace_incomplete` |
| IT-DTJ-006 | pair template、negative oracle、pair revisionを一つ欠落 | `pair_incomplete` |
| IT-DTJ-007 | measurement thresholdとN/A authorityを両方欠落 | `measurement_incomplete` |
| IT-DTJ-008 | 同値classへcanonical normative ownerを2件設定 | `normative_owner_duplicate` |
| IT-DTJ-009 | source atomをowner/re-entryなしで未変換にする | `shadow_atom_unmapped` |
| IT-DTJ-010 | compatibility artifactの値をcurrent defaultへ昇格 | `legacy_authority_promotion` |
| IT-DTJ-011 | generated viewだけを編集 | `generated_view_drift`、JSON変更0 |
| IT-DTJ-012 | narrative Markdownを除去して再検証 | template identity、applicability、trace、pair、completionをJSONだけで再現 |
| IT-DTJ-013 | `explained_delta`へreview/design decisionを付けない | cutover不可 |
| IT-DTJ-014 | findingを複数順序で入力 | stable順の同一finding setと同一logical digest |

L8はschema validator、registry、applicability evaluator、shadow compiler、generated view digestの結線を
検証する。各mutationを別oracleとしてkillし、別fieldのgreenやMarkdown説明で相殺しない。
