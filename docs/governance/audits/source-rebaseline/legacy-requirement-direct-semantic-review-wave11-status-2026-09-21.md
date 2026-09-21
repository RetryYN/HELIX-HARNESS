# Wave11 direct semantic review status (2026-09-21)

parent revision: `4ece4c6b5bf3b2a0767eea65c376f46a1ce46f60`

Wave11はHELIX-OSの未review unit 3件、9 edgeを静的照合した。要求assetは3 unitとも `LEGACY-ASSET-A60CF91DD2AF6693E6F9` のconfirmed contract-only edgeである。

| unit | phase | current status | legacy status | transition |
|---|---|---|---|---|
| IRUNIT-HIL-NFR-04-HELIX-OS | PHCAP-09 | candidate | documented_candidate | degraded_to_rederived_candidate |
| IRUNIT-HIL-NFR-04-HELIX-OS | PHCAP-10 | draft_requirement_and_bootstrap_decision | implemented_with_tests | degraded_to_requirement_and_limited_bootstrap |
| IRUNIT-HIL-NFR-04-HELIX-OS | PHCAP-20 | draft_requirement | implemented_with_tests | degraded_to_draft |
| IRUNIT-HIL-NFR-17-HELIX-OS | PHCAP-16 | draft_requirement | implemented_partial_with_tests | degraded_to_draft_and_crosswalk |
| IRUNIT-HIL-NFR-17-HELIX-OS | PHCAP-20 | draft_requirement | implemented_with_tests | degraded_to_draft |
| IRUNIT-HIL-NFR-18-HELIX-OS | PHCAP-10 | draft_requirement_and_bootstrap_decision | implemented_with_tests | degraded_to_requirement_and_limited_bootstrap |
| IRUNIT-HIL-NFR-18-HELIX-OS | PHCAP-20 | draft_requirement | implemented_with_tests | degraded_to_draft |

| unit | atoms | contract confirmed | design partial | design rejected | design pending kind | implementation confirmed | implementation unresolved | implementation rejected | implementation uncovered | no evidence |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| IRUNIT-HIL-NFR-04-HELIX-OS | 4 | 4 | 1 | 0 | 0 | 0 | 2 | 0 | 2 | 1 |
| IRUNIT-HIL-NFR-17-HELIX-OS | 6 | 6 | 4 | 0 | 0 | 0 | 0 | 1 | 6 | 2 |
| IRUNIT-HIL-NFR-18-HELIX-OS | 3 | 3 | 0 | 1 | 0 | 0 | 0 | 1 | 3 | 3 |


semantic link counts: confirmed 3 / rejected 3 / unresolved 3.

Wave1〜10と合わせて32 unit、96 edge。全218 unitから残る186 unitは未着手であり、`new_build_allowed:false`を維持する。NFR17 implementation `LEGACY-ASSET-BFCA76AA319FBC61AF05`、NFR18 design `LEGACY-ASSET-F4556BDEAA5BAA3C0622`、NFR18 implementation `LEGACY-ASSET-B9158B0AD8DBBE96E40C` はcovered atoms空・要求不適合のためrejectedと記録した。legacy runtime、test、hook、CI、adapterは実行していない。consumer closureとproduct boundaryはpendingである。
