# Wave25 旧HELIX要求直接semantic review method（schema10）

Wave25は、旧archiveの要求、asset catalog、判断史・failure・consumer参照、design、implementation sourceを静的read-onlyで照合する research-premise candidate です。旧runtime、旧test、旧CIは実行しません。対象worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave25`、branchは `docs/legacy-semantic-review-wave25` です。

Wave24 exact HEAD `5bb9ce4ca2a5fdd220be3a2874af201763ca4016` をcandidate lineageとして保持し、Wave24 merge後の最新 `origin/main`／current tree `2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c` へrebaselineしました。main merge parentsは `4974e66e3890e41515004d18c49d59b3e49f8f68` と `5bb9ce4ca2a5fdd220be3a2874af201763ca4016` です。`current_tree_revision`、`main_merge_revision`、`parent_revision`、`source_main_base_revision`、`stacked_pr_parent_revision`をこの最新mainへ揃えました。origin/mainまたはmerge parentが再度進んだ場合は停止してmainを再読込し、rebaselineします。commit、push、PR、mergeは行いません。

scopeは、FR05の未レビュー連続2 product unit、6 edge（requirement 2、design 2、implementation_source 2）です。FR06のHARNESS／OS unitはWave2で既にレビュー済みのため重複を避け、FR07以降へ飛ばずFR05で停止しました。両unitのsemantic countsはconfirmed 2、unresolved 4、rejected 0です。累積receiptは76 unit／218 total、225 asset edges、残り142 unitです。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲とproduct boundary

| unit | product | phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-FR-05-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-05 / PHCAP-06 / PHCAP-07 / PHCAP-18 | 5 | 943 / 557 |
| `IRUNIT-HIL-FR-05-HELIX-OS` | HELIX-OS | PHCAP-18 | 3 | 943 / 286 |

FR05 HARNESSはRedesign routerの影響層割当、L1/L2変更時のpair stale／再freeze、L0 charter escalation、redesign receiptを保持します。FR05 OSはReverse→Redesign→pair-freeze→Forward順序、L0 escalation、修正layer／stale edge／pair receiptを保持します。L0 escalationとreceipt outputはproduct boundary共有atomとしてholdし、HARNESS／OS間のconnectorや責務を推定しません。

旧product boundaryのHARNESS責務（V-model、requirements/design/verification correspondence、workflow/process、external consumer package）およびOSの管理・統制責務に照らした候補として保存します。catalogのlow-confidence product assessment、phase authority、successor assignment、consumer closureは未確定で、Web、Web-OSの責務をこのreviewから追加しません。

## sourceとatom

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、requirements IR SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | statement semantic digest |
|---|---:|---:|---|
| HIL-FR-05 | `requirements.json:1598-1640` | `infinity-loop-platform-requirements.md:95` | `sha256:e547dbc9b001e344da3953e672675621d353d69137f1e69c2b548c8c232a163d` |

各atomのliteral text、source span index、shared-with unitはdecompositionからledgerへ引き継ぎました。FR05 HARNESSのA04/A05とOSのA02/A03は共有候補atomとしてholdします。candidate assetの存在は同一要求IDのdesign／implementation成立を示しません。

## bounded searchと旧asset evidence

| unit / role | asset ID | classification | exact old source / static excerpt | catalog judgment / consumer |
|---|---|---|---|---|
| FR05 / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9` | `LASPH-2866` | `requirements-ir/requirements.json#/HIL-FR-05`、`infinity-loop-platform-requirements.md:95` | multi-phase／4-product candidate、consumer refsはcarry-forward／atomizationのみ、implementationはnon-executable source snapshot |
| FR05 / design | `LEGACY-ASSET-94D54E3E1A229FB0684D` | `LASPH-0565` | `docs/design/helix/L5-detail/layer-ledger-pair-gate.md:32-49` | PHCAP-18 candidate、4-product low-confidence boundary、consumer refsなし、implementation status unknown |
| FR05 / implementation_source | `LEGACY-ASSET-659BC8C9409A09406296` | `LASPH-3054` | `src/lint/scrum-reverse.ts:1-17` | PHCAP-11 low phase candidate、product unresolved、consumer refsなし、implementation source present but unexecuted |

bounded global search は 4020 catalog records を 15 UTF-8 anchor で走査し、各unit 943 candidate / 940 unreviewed、phase/product pool は HARNESS 557 / OS 286 です。 Selected design／implementation assets are fresh against Wave1–24 implementation asset history; FR06's prior Wave2 edges remain excluded.

FR05 designはlayer ledger、pair receipt、stale／rerouteを示しますが、要求全体のL1/L2/L0 routing実装を示しません。implementation sourceはReverse／redesign／Forwardの旧lint検査を含みますが、FR05全体の影響層割当、pair-freeze、receipt成立を示しません。全4 candidate edgesをunresolvedで保持しました。

旧判断史として選択assetを `docs/governance/legacy-asset-disposition.jsonl` で照合しました。選択design／implementationはhistorical／unresolved／unknownで、decision／approval／read-after recordはありません。failureについては選択assetに直接結び付く実行failure receiptを確認しておらず、未確定をfailure closureと解釈しません。consumerは空参照かmigration preconditionだけであり、closure unknown／pendingとして保存しました。

## 保留と検証境界

全6 edgeでauthorityは `none`、consumer closureは `pending` です。source atomization review、shared atomのproduct boundary判断、phase authority、successor assignment、current implementation、consumer closure、acceptance receipt、実行可否を保留します。candidateから採否、下流設計・実装、provider配送、audit運用を生成しません。

Wave24 schema10 verifier patternを継承し、row/meta key、source SHA、exact line excerpt、requirement atom grounding、candidate atom provenance、bounded search ID/count/digest、phase pool、Wave1–24 prior lineage、edge／asset重複、FR06 already-reviewed exclusion、shared atom hold、stale-anchor negative caseを静的に検査します。検証は文書revision、ID対応、参照、責務境界のstatic確認に限定します。
