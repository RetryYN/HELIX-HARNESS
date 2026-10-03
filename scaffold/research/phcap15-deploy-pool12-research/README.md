# PHCAP-15 Deploy pool12 static research

これは PHCAP-15 Deploy の旧asset pool 78件から、既レビュー範囲と重ならない代表12件を静的に分類する research Scaffold である。正式要求、phase admission、product owner、successor、current authority、implementation、acceptance、release、deployment、failure outcome、consumer closureは生成しない。

基準は fresh isolated worktree `/home/tenni/.helix-worktrees/phcap15-deploy-pool12` の `origin/main` `562e176c36844474b63424ec06beefe2f7722d18` である。開始時と終了時のrefは同一で、変化した場合はinventoryの停止条件に従ってrebaselineする。

## 分母と非重複

`docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl` で `candidate_phase_targets` に `PHCAP-15` を含むassetは78件、ID重複はない。既レビュー範囲として PR #2001 の7件、PR #2004 の12件、`SCF-B-0037` の3件、合計22件を除外し、残る56件から次の12件を選んだ。未レビュー残数は `78 - 22 - 12 = 44` 件である。pool membershipは候補phaseの根拠であり、要件リンクや採否を意味しない。

| asset | source | evidence kind |
|---|---|---|
| `LEGACY-ASSET-A297D67A1D8AD6EE6D6B` | `docs/archive/intake/2026-09-06-concept-vision/current/HELIX_DEVELOPMENT_PACKAGE_CATALOG_v0.6.md` | unknown / catalog |
| `LEGACY-ASSET-0C5F0695490FA5D87419` | `docs/archive/intake/2026-09-06-concept-vision/current/HELIX_RELEASE_AND_VERSION_CATALOG_v0.6.md` | unknown / catalog |
| `LEGACY-ASSET-EC07511FF3E241F15359` | `docs/design/design-catalog.yaml` | design |
| `LEGACY-ASSET-809D616D0D7D844F5720` | `docs/design/harness/L6-function-design/function-spec.md` | design |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | `docs/design/harness/L3-functional/functional-requirements.md` | requirement |
| `LEGACY-ASSET-13604CA85F3B7D8D5055` | `docs/governance/document-system-map.md` | operation_document |
| `LEGACY-ASSET-D63398C5A382549DC905` | `docs/governance/helix-l0-l8-design-consistency-audit.md` | operation_document |
| `LEGACY-ASSET-320E6F0B93975C430B1D` | `docs/plans/PLAN-L3-68-release-module-bundle-composition.md` | plan |
| `LEGACY-ASSET-3CB7630AEBBC5932E11D` | `docs/plans/PLAN-L3-71-product-lifecycle-operations.md` | plan |
| `LEGACY-ASSET-26391F9FB236CBD4D270` | `src/lint/action-binding-approval-readiness.ts` | implementation_source |
| `LEGACY-ASSET-2149C3FCC5A18EB50185` | `tests/current-runtime-guidance.test.ts` | test_source |
| `LEGACY-ASSET-FAAFFA616A44F65911EB` | `docs/test-design/harness/L7-unit-test-design.md` | test_design |

`inventory.json` はpool全78件、除外3集合、選択12件、残る44件を保持する。各選択assetについて、phase/disposition ledger行、archive source path、source SHA、line count、40個のexact source spanとspan SHAを記録した。source、decision、failure、consumerの境界は別々に保持し、decision match 0、copy/read-after match 0、execution receipt 0、consumer refs空、consumer closure pendingを確認する。専用failure/consumer台帳はbounded searchで見つからなかったため、履歴の不存在や成功とは扱わない。

## phase・製品・実装状態

PHCAP-15のphase recordは `draft_requirement`、旧capabilityは `documented_partial`、transitionは `degraded_to_draft`、`new_build_allowed:false`、authority effectは `inventory_and_work_projection_only` である。これはphase全体のinventory表現であり、12件の現行実装や劣化を表さない。

候補製品は HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS の4境界を列挙した。現行L1候補文書と `docs/concept/product-boundary.md` は境界候補の参照だけに使い、owner、authority、実装、acceptanceを確定しない。Webの直接証拠がないことを未実装へ変換しない。

旧assetの証拠種別は catalog、design、requirement、operation document、plan、implementation source、test source、test design に分かれる。sourceが存在すること、旧sourceに実装・テスト・failure条件・rollback語彙があることは、旧実行の成功や現行実装を意味しない。全12件の `legacy_implementation_status`、`current_implementation_status`、`current_operation_status`、`current_acceptance_status`、`current_degradation_status` は `unknown`、phase admissionは `unresolved_candidate_only`、product ownerは `unresolved` のまま保持する。

旧archiveはsource bytes、行、span、digestの静的参照だけに限定した。旧workflow、runtime、test、CI、hook、adapter、sourceは実行していない。validatorとnegative selfcheckの合格は採択、承認、実装、受入、release、deploymentを意味しない。

## 検証

```sh
python3 -B scaffold/phcap15-deploy-pool12-research/validate.py
python3 -B scaffold/phcap15-deploy-pool12-research/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` はpool分母、PR #2001/#2004とSCF-B-0037との非重複、残数、source/archive/ledger digest、独立固定した40個のanchor座標・source span digest・自由文meaning、phase/product候補、decision/copy-read-after/failure/consumer状態、四製品境界、unknown固定を確認する。counts全項目はpool、除外、選択、残数、4製品、evidence kind、asset anchor配列から独立再集計し、`unresolved`、`semantic_diversity_kind`、`prohibited_inference`、`equivalence_claim`もvalidator定数で固定する。inventory root、asset、failure/consumer、anchor、product boundary/refのnested keysetもvalidator側で固定し、候補側の追加・欠落・型違いを受け入れない。`selfcheck.py` は意味文、anchor集合・座標、各階層keyset、counts、unresolved、semantic kind、prohibited inference、equivalence、scope/statusの改変を一時コピーで拒否する。
