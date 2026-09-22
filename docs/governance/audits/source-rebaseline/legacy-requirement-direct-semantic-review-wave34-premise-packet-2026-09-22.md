# Wave34 premise packet（2026-09-22）

## 固定条件

- parent / current tree / stacked PR parent: `aee323a016315b0562f7d44e197df681c663cb2a`
- batch: `LEGACY-SEMANTIC-WAVE34-2026-09-22`
- schema: 10
- direct semantic review denominator: 218 product units
- separate atomization A1 queue: 721 review units（進捗へ合算しない）
- source atomization / product boundary: `source_atomization_review_pending;product_boundary_pending_human_decision`
- authority effect: `none`; consumer closure: `pending`; implementation and execution: unestablished / not run

## 選定product units

| unit | product candidate | direct phase candidate | source focus |
|---|---|---|---|
| `IRUNIT-HIL-FR-37-HELIX-OS` | HELIX-OS | PHCAP-03 | Source Capability Atomizer、atom manifest、overlap finding |
| `IRUNIT-HIL-FR-44-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 | Template Improvement Loop、Template Gap Issue |
| `IRUNIT-HIL-FR-44-HELIX-OS` | HELIX-OS | PHCAP-12 / PHCAP-19 | shadow template、promotion／rollback receipt |
| `IRUNIT-HIL-FR-45-HELIX-OS` | HELIX-OS | PHCAP-04 | change/applicability receipt、orphan／stale finding |
| `IRUNIT-HIL-FR-46-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 | Layer Ledger Registry、L0 authority anchor |
| `IRUNIT-HIL-FR-46-HELIX-OS` | HELIX-OS | unresolved | layer snapshot、coverage receipt |
| `IRUNIT-HIL-FR-47-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 | Template Obligation Extractor、gap finding |
| `IRUNIT-HIL-FR-48-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 / PHCAP-07 | Vertical Ledger Pair Gate、vertical edge receipt |
| `IRUNIT-HIL-FR-48-HELIX-OS` | HELIX-OS | PHCAP-07 | unresolved descent／backprop finding |

要求本文の候補product targetはcrosswalk/decompositionの値を保持し、四製品境界をこのcandidate routingから確定しない。FR48の共有停止条件はHARNESSとOSの両atomに保持し、product boundary decision pendingとした。

## 保留事項

全27 edgeでsource atomization、product boundary、successor assignment、consumer closure、現行実装との差分、degradation／failure closureは未確定である。design／implementation_source edgeはcatalog sourceのstatic candidate evidenceであり、実装成立や旧機能の品質を意味しない。phase candidateはdecomposition／crosswalkの候補値を保持するだけで、phase authorityを付与しない。

今回、人手で確認した検証幅は9 unit（27 edge）であり、拡大上限は未確定である。manual選定が律速となることを観測したため、次batchはsource chainごとに独立確認し、幅の拡大可否を改めて判断する。
