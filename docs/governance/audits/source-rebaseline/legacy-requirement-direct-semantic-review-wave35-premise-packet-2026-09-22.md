# Wave35 premise packet（2026-09-22）

## 固定条件

- parent / current tree / stacked PR parent: `2ee884951b279aa8b054c84efef7b24863874625`（PR #1998 Wave34 exact HEAD）
- batch: `LEGACY-SEMANTIC-WAVE35-2026-09-22`
- schema: 10
- direct semantic review denominator: 218 product units
- separate atomization A1 queue: 721 review units（進捗へ合算しない）
- source atomization / product boundary: `source_atomization_review_pending;product_boundary_pending_human_decision`
- authority effect: `none`; consumer closure: `pending`; implementation and execution: unestablished / not run
- observed base drift: `origin/main=2ff4f888249b350afb624e359eaa8e3f3ea6defb`（#1990 merge）。exact stacked parentは変更しない

## 選定product units

| unit | product candidate | direct phase candidate | source focus |
|---|---|---|---|
| `IRUNIT-HIL-FR-49-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-05 / PHCAP-06 / PHCAP-07 | Horizontal V-Pair Gate、canonical pair、oracle join |
| `IRUNIT-HIL-FR-49-HELIX-OS` | HELIX-OS | PHCAP-07 | V-pair receipt、feedback／finding、oracle closure |
| `IRUNIT-HIL-FR-50-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 / PHCAP-18 | Ledger Design Refactor、layer collision、orphan edge |
| `IRUNIT-HIL-FR-50-HELIX-OS` | HELIX-OS | PHCAP-18 | semantic contract、rollback、consumer coverage |
| `IRUNIT-HIL-FR-51-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-04 / PHCAP-06 | Authoring Admission、proposal authority、impact／safety |
| `IRUNIT-HIL-FR-51-HELIX-OS` | HELIX-OS | PHCAP-04 | admission authority、receipt、auto-admit boundary |
| `IRUNIT-HIL-FR-52-HELIX-OS` | HELIX-OS | unresolved | Atomic Canonicalization、CAS、projection |
| `IRUNIT-HIL-FR-53-HELIX-OS` | HELIX-OS | unresolved | immutable revision、asset identity、supersede |
| `IRUNIT-HIL-FR-54-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 / PHCAP-07 | Contract Portfolio、requirement atom、obligation graph |
| `IRUNIT-HIL-FR-55-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 / PHCAP-07 | Template Example Calibrator、positive／negative fixture |

要求assetは各unitのexact source contractとして共有するが、non-requirement assetはunitごとに固有のdesign／implementation_sourceを選んだ。四製品のcandidate targetは要求asset側に保持し、ここで製品境界を確定していない。

## 保留事項

全30 edgeでsource atomization、product boundary、successor assignment、consumer closure、現行実装との差分、degradation／failure closureは未確定である。design／implementation_source edgeはcatalog sourceのstatic candidate evidenceであり、実装成立や旧機能の品質を意味しない。phase candidateはdecomposition／crosswalkの候補値を保持するだけで、phase authorityを付与しない。

今回、人手で確認した検証幅は10 unit（30 edge）であり、拡大上限は未確定である。manual選定が律速となるため、次batchはsource chainごとに独立確認し、幅の拡大可否を改めて判断する。
