---
title: "Requirement refinement JSON authority L8 unit test design"
canonical_layer_scheme: L1-L12
layer: L8
paired_layer: L5
status: draft
plan: docs/plans/PLAN-RECOVERY-12-requirement-refinement-authority.md
pair_artifact: docs/design/helix/L5-detail/requirement-refinement-authority.md
---

# 要件refinement JSON正本 L8 unit test設計

| oracle | 種別 | 合格条件 |
|---|---|---|
| U-RRA-001 | positive | baseline 153/24/72/24とrefinement bundleを同じrootからloadする |
| U-RRA-002 | negative | refinement shard欠落／partial manifestを拒否する |
| U-RRA-003 | negative | missing／duplicate／related重複ownerを拒否する |
| U-RRA-004 | negative | source digest driftとcompatibility pathを拒否する |
| U-RRA-005 | negative | R→AC未被覆、orphan、duplicate IDを拒否する |
| U-RRA-006 | negative | approved/frozenのapproval欠落、revision／source／HEAD driftを拒否する |
| U-RRA-007 | invariant | baseline bytes／count／digestの変更を拒否する |
| U-RRA-008 | projection | generated viewとDBが同じroot digest・別分母を持つ |
| U-RRA-009 | mutation | owner、source、approval、coverage、baseline比較の各分岐除去をRedにする |

fixtureはMIC-FR-001、MIC-R-01..07、MIC-AC-001..012を使用する。Markdownに文字列が存在するだけでは
U-RRA-001をgreenにしない。
