# Wave24 旧HELIX要求直接semantic review method（schema10）

Wave24は、旧archiveの要求、asset catalog、判断史・failure・consumer参照、design、implementation sourceを静的read-onlyで照合する research-premise candidate です。旧runtime、旧test、旧CIは実行しません。対象worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave24-rebaseline`、branchは `docs/legacy-semantic-review-wave24-rebaseline` です。

候補親はWave23 HEAD `1a7d1fc3cbece5bc0ad5c59687984a204269098a` で、Wave23はPR #1960により`origin/main`へmerge済みです。rebaseline後の`origin/main`／current treeは `4974e66e3890e41515004d18c49d59b3e49f8f68`、merge parentsは `e85a549f96778fc79021710805f10723978ec668` と `fa8f5426882ee56a56e28975746e2db590cd515f` です。`current_tree_revision`、`main_merge_revision`、`parent_revision`、`source_main_base_revision`、`stacked_pr_parent_revision`をこの最新mainへ揃えました。origin/mainが再度進んだ場合は停止して再baselineします。PR #1967をDraftで提出し、exact HEADの独立reviewを待ちます。mergeはreviewer側の責務です。

scopeは、Wave23直後の連続した2 product unit、6 edge（requirement 2、design 2、implementation_source 2）です。両unitはHELIX-HARNESS候補で、confirmed 2、unresolved 4、rejected 0です。累積receiptは74 unit／219 edge、残り144 unitです。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲とproduct boundary

| unit | product | phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-FR-03-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-09 | 2 | 2659 / 15 |
| `IRUNIT-HIL-FR-04-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-07 / PHCAP-09 | 4 | 341 / 118 |

FR03はIssue contractのfield分離とversioned digestを保持します。FR04はUniversal Reverse Gate、R0–R4順序、phase obligation／digest／schema／coverage／routing／双方向参照、phase skip拒否と探索証拠付き空契約記録を保持します。FR04の `全IssueのR0–R4を順序実行し` はFR04-OS候補と共有するsource atomとして記録し、HARNESS／OS間の責務やconnectorは推定しません。

旧product boundaryのHARNESS責務（V-model、requirements/design/verification correspondence、workflow/process、external consumer package）に照らした候補として保存します。catalogのlow-confidence product assessment、phase authority、successor assignment、consumer closureは未確定で、Web、Web-OS、OSの責務をこのreviewから追加しません。

## sourceとatom

共通要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、requirements IR SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | statement semantic digest |
|---|---:|---:|---|
| HIL-FR-03 | `requirements.json:1512-1553` | `infinity-loop-platform-requirements.md:93` | `sha256:be8c55e18f6bd462e31eb805edfa5dd4e378c69b86753b7a2cbfb143e6ab068c` |
| HIL-FR-04 | `requirements.json:1555-1596` | `infinity-loop-platform-requirements.md:94` | `sha256:4d8c9fcc0db7c1e522c6e8b42f49521348381d44a6b9a53b01fb47c9f7e5d97b` |

各atomのliteral text、source span index、shared-with unitはdecompositionからledgerへ引き継ぎました。候補assetの存在は同一要求IDのdesign／implementation成立を示しません。

## bounded searchと旧asset evidence

| unit / role | asset ID | classification | exact old source / static excerpt | catalog judgment / consumer |
|---|---|---|---|---|
| FR03 / design | `LEGACY-ASSET-4A6FA124DB6FEC0DBA7F` | `LASPH-0403` | `docs/design/harness/L6-function-design/plan-entry-routing.md:9-15` | PHCAP-09 high phase candidate、product low／semantic review pending、consumer refsなし、implementation status unknown |
| FR03 / implementation_source | `LEGACY-ASSET-D8787D8B14310B1A1E77` | `LASPH-3420` | `src/workflow/workflow-guide.ts:18-43` | phase/product unresolved、typed phase/gate/digest source present unexecuted、consumer refsなし、implementation status unknown |
| FR04 / design | `LEGACY-ASSET-295B373ABCF388FDB10A` | `LASPH-0355` | `docs/design/harness/L4-basic-design/function.md:107`、`:155-157` | multi-phase candidate、全products low product assessment、semantic split／composite split pending、consumer refsなし、implementation status unknown |
| FR04 / implementation_source | `LEGACY-ASSET-7642909D8AA62C75E88D` | `LASPH-3002` | `src/lint/l12-hybrid-reviewed-safe-v2.ts:1-99` | multi-phase candidate、全products low product assessment、semantic/composite split pending、consumer refsなし、implementation status unknown |

FR03のdesignはtyped contract marker、version／digest、phase gate evidenceを示しますが、Issue contract全fieldのcurrent adoptionを示しません。FR03のimplementation sourceはworkflow phase、typed identity、authority digest、evidence gateを含む旧sourceですが、要求との直接実装link、phase/product、consumerを確定しません。FR04のdesignは `helix reverse --type` とReverse R0–R4の旧機能設計を含みますが、Universal Reverse Gateの要求全体を実装した証拠ではありません。FR04のimplementation sourceは生成されたreviewed-safe dispositionとReverse／digest／source参照を含みますが、R0–R4 gateの実行・receipt・coverage成立を示しません。全候補edgeをunresolvedで保持しました。

旧判断史として `docs/governance/legacy-asset-disposition.jsonl` の4選択assetを照合しました。全件が `asset_class=Historical`、`authority_status=historical`、`disposition=unresolved`、`implementation_status=unknown`、`consumer_refs=[]`、decision／approval／read-after recordなしです。FR04 implementation sourceには `reuse_exclusion_class=legacy_runtime_cli_or_adapter` も残っています。failureについては選択assetに直接結び付く実行failure receiptはcatalog／dispositionに存在せず、未確定をfailure closureと解釈しません。consumerは空参照かつ `consumer_check` がmigration preconditionなので、consumer closure unknown／pendingとして保存しました。

FR03 bounded candidate ID digestは `sha256:a9d19284536e5bd6c41d42ef0324dfa2454c4c1ff199f63b48b04c7e0b88e209`、unreviewed digestは `sha256:54ef42d94578c0d72408bd19539a08296a3b3fb84fb51776a15aea4253cc29c5` です。FR04 bounded candidate ID digestは `sha256:5d53adc539fa6f508ed95f20fd01c65ba09df7039f6546cfafcee8a89fbbbd52`、unreviewed digestは `sha256:23f5661631175e54e0e331de2017d56197ec2a118437ab64abae12f23b6be99a` です。catalog全4020 recordsをsource pathへのUTF-8 anchor any-matchで再計算し、phase/product pool digestもmetadataへ固定しました。

## 保留と検証境界

全6 edgeでauthorityは `none`、consumer closureは `pending` です。source atomization review、shared atomのproduct boundary判断、phase authority、successor assignment、current implementation、consumer closure、acceptance receipt、実行可否を保留します。candidateから採否、下流設計・実装、provider配送、audit運用を生成しません。

Wave23のschema10 verifier patternを継承し、row/meta key、source SHA、exact line excerpt、requirement atom grounding、candidate atom provenance、bounded search receipt、Wave1–23 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを静的に検査します。検証は文書revision、ID対応、参照、責務境界のstatic確認に限定します。
