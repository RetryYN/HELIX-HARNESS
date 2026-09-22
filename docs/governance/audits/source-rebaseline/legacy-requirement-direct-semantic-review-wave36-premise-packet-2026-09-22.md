# Wave36 premise packet（2026-09-22）

## 固定条件

- parent / current tree / stacked PR parent: `19f5febe6af7fe8455aeb5b8fba03be41a4d3d38`（Wave35 exact HEAD）
- parent commit: `0729fe14016e639f07ccdac038d8ce34a3aab639`（Wave35 RH-2000-J01修正commitの親）
- batch: `LEGACY-SEMANTIC-WAVE36-2026-09-22`
- schema: 10
- direct semantic review denominator: 218 product units
- separate atomization A1 queue: 721 review units（進捗へ合算しない）
- source atomization / product boundary: `source_atomization_review_pending;product_boundary_pending_human_decision`
- authority effect: `none`; consumer closure: `pending`; implementation and execution: unestablished / not run
- observed main drift: `origin/main=2ff4f888249b350afb624e359eaa8e3f3ea6defb`（#1990 merge）。Wave35 RH-2000-J01修正を反映したrebaseline後のexact stacked parentを固定する
- stacked stop condition: parent/current/stacked parentのexact不一致、prior lineage digest不一致、edge／asset重複を検知した場合は停止し、rebaseline後の親を変更しない

## 選定product units

| unit | product candidate | direct phase candidate | source focus |
|---|---|---|---|
| `IRUNIT-HIL-FR-56-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 / PHCAP-07 / PHCAP-08 | Workflow Contract Router、S0–S4 binding、back-propagation |
| `IRUNIT-HIL-FR-57-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 | Judgment Pack Registry、applicability、skill composition |
| `IRUNIT-HIL-FR-58-HELIX-OS` | HELIX-OS | PHCAP-12 / PHCAP-19 | Judgment Pack Improvement、shadow、rollback、independent review |
| `IRUNIT-HIL-FR-59-HELIX-OS` | HELIX-OS | PHCAP-06 / PHCAP-10 | Specialist Agent Contract Compiler、schema、tool boundary |
| `IRUNIT-HIL-FR-63-HELIX-OS` | HELIX-OS | PHCAP-10 | Effort Router、model／effort comparison、escalation lineage |
| `IRUNIT-HIL-FR-68-HELIX-OS` | HELIX-OS | PHCAP-10 | Delegation Wire Protocol、adapter、structured event、policy |
| `IRUNIT-HIL-FR-69-HELIX-OS` | HELIX-OS | PHCAP-10 / PHCAP-12 | Delegation Audit Evidence、digest、scorecard linkage |

FR60〜62、FR64〜67は既レビューunitであり、既存edge／assetを再利用しなかった。要求assetは各unitのexact source contractとして共有するが、non-requirement assetはunitごとに固有のdesign／implementation_sourceを選んだ。四製品のcandidate targetは要求asset側に保持し、ここで製品境界を確定していない。

## 保留事項

全21 edgeでsource atomization、product boundary、successor assignment、consumer closure、現行実装との差分、degradation／failure closureは未確定である。design／implementation_source edgeはcatalog sourceのstatic candidate evidenceであり、実装成立や旧機能の品質を意味しない。phase candidateはdecomposition／crosswalkの候補値を保持するだけで、phase authorityを付与しない。

今回、人手で確認した検証幅は7 unit（21 edge）であり、拡大上限は未確定である。次batchはsource chainごとに独立確認し、exact stacked parentの変更やmain driftへの追随は行わない。
