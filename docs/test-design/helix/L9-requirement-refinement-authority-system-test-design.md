---
title: "Requirement refinement JSON authority L9 system test design"
canonical_layer_scheme: L1-L12
layer: L9
paired_layer: L4
status: draft
plan: docs/plans/PLAN-RECOVERY-12-requirement-refinement-authority.md
pair_artifact: docs/design/helix/L4-basic-design/requirement-refinement-authority.md
---

# 要件refinement JSON正本 L9 system test設計

| oracle | 操作 | 合格条件 |
|---|---|---|
| ST-RRA-001 | authority gate／doctorを実行 | baselineとapproved refinementのexact set、digest、source、approvalがgreen |
| ST-RRA-002 | generated viewを再生成 | baseline/refinementの別分母とroot markerがbyte一致 |
| ST-RRA-003 | harness.dbを2回rebuild | `requirement_ir` row、root digest、owner/oracle orphan 0が再現 |
| ST-RRA-004 | MICをMarkdownだけに残す | `REFINEMENT_SHARD_MISSING`またはtrace欠落でfail-close |
| ST-RRA-005 | baseline requirementを1件変更 | refinement成功で相殺せず`REFINEMENT_BASELINE_DRIFT` |

同一candidate HEADのtargeted test、typecheck、Biome、PLAN governance、doctor、full CI、Windows durability、
DB convergence、独立AI-B receiptが揃うまでconfirmed／mergeしない。
