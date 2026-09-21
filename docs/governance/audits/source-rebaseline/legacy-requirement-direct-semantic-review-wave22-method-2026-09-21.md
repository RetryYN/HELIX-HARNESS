# Wave22 旧HELIX要求直接semantic review method（schema10）

## 対象と固定系譜

Wave22は、旧archiveの要求、旧asset catalog、旧design、旧implementation sourceを静的read-onlyで照合する research-premise candidate の下書きです。旧runtime、旧test、旧CIは実行しません。独立worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave22`、branchは `docs/legacy-semantic-review-wave22` です。

作業開始後にPR #1941、#1943、#1942がmainへmergeされたため、最終baselineを最新main `bc5aef4726ad979c10c34a43557025e77f1c25d6` へrebaselineしました。同commitのmerge parentsは `5fcdc80f23c0fb3e959293b9fbd751fa31eeb792` と `75cdab971129c9b25830860059c8c6fadaca38b2` です。Wave21のcorrected exact HEADは `418500321edbc8bc3c45f4d8d0d8c994de9f7597`、そのparentとsource main baseは `053943791ceda83366fca01d375308ba5f7deb28` です。Wave1–21のledger/metaをprior batchとして、最新main上の入力digestとprior lineageをmetaへ再固定しました。

scopeは3 product unit、9 asset edge（requirement 3、design 3、implementation_source 3）です。requirement edgeは3 confirmed、候補asset edgeは6 unresolved、rejectedは0です。prior累積は70 unit／207 edge、未review unitは148です。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲とBR33の意味保持

Wave1–21のledger/metaとdecompositionをID単位で再集計し、BR31–BR33の未review境界を確認しました。今回の連続範囲は次の3 unitです。

| unit | product | phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-BR-31-HELIX-OS` | HELIX-OS | PHCAP-07 / PHCAP-10 | 3 | 867 / 278・471 |
| `IRUNIT-HIL-BR-32-HELIX-OS` | HELIX-OS | PHCAP-10 | 3 | 824 / 471 |
| `IRUNIT-HIL-BR-33-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-14 | 1 | 1,854 / 123 |

`IRUNIT-HIL-BR-33-HELIX-OS` は未review候補として重複計上しません。BR33-OSはWave4で既に次のsource meaningを保持済みです。

- literal span: `配布surfaceの実切替は既存cutover承認境界に従う`
- atom: `BR33-OS-A01`（`配布surfaceの実切替を既存cutover承認境界に従わせる`）
- Wave4 edge: requirement confirmed、design unresolved、implementation source rejected

したがってWave22はBR33のHARNESS責務句 `配布はmarketplace型パッケージ仕様（正本index、手編集禁止の生成index、first-party/third-party分離、免責記載）で定義し` だけを新規reviewします。要求source全文に含まれるOS側のcutover句はWave4の既存edgeで参照でき、今回のHARNESS unitへ混入させません。BR33 decomposition自身が `split_required`、`unit_split_requires_independent_review` としているため、製品境界、owner、connector、successorを推定せず holdを残します。これによりBR33のsource meaningを落とさず、同じOS edgeを二重計上しません。

## sourceと候補assetの扱い

共通要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、requirements IR source SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | statement semantic digest |
|---|---:|---:|---|
| HIL-BR-31 | `requirements.json:1292-1334` | `infinity-loop-platform-requirements.md:83` | `sha256:5de1a74038ae72cb30e6f61fa68bc6d3085dc88a57d6d1c778dc42c78aff7d20` |
| HIL-BR-32 | `requirements.json:1335-1382` | `infinity-loop-platform-requirements.md:84` | `sha256:78f34c71dbf6c0d4ad87aaea5e2275eb3cc3401fd8fcf6c567000754603563ac` |
| HIL-BR-33 | `requirements.json:1383-1425` | `infinity-loop-platform-requirements.md:85` | `sha256:758e2ea4f82c6c068d8c8ac633a7f092573c01c078a8293e81ded4bc70eaa5ef` |

候補assetはcatalog record、phase/product intersection、bounded anchor excerptが一致する静的候補として扱います。候補の存在から現行implementation、実行完了、consumer closure、phase authority、採否を生成しません。各unitのsource_text_spansはdecompositionのliteral spanをそのまま保持し、各atomはspan index `0` と同じsource fragmentへ接地します。BR31とBR32は全要求句を3 atomへ分解し、BR33-HARNESSは配布仕様句を1 atomへ分解しました。未確定のsource atomizationとproduct boundaryは共通holdです。

## bounded searchと選択asset

candidate membershipはsemantic evidenceではなく、old catalog全体へのanchor any-matchとphase-product poolとの交差を記録したものです。search query、catalog count、candidate ID digest、未review ID digest、selected asset IDを各rowとmetaのreceiptへ固定しました。選択assetは次のとおりです。

| unit / role | asset ID | exact old source |
|---|---|---|
| BR31-OS / design | `LEGACY-ASSET-09F4CAA4129F5DF63C5E` | `docs/design/helix/L4-basic-design/worker-blind-benchmark.md` |
| BR31-OS / implementation_source | `LEGACY-ASSET-63CA5B35FD7F7873B06C` | `src/runtime/worker-blind-definition.ts` |
| BR32-OS / design | `LEGACY-ASSET-7795E6A5C8D14603031D` | `docs/design/helix/L4-basic-design/specialist-agent-registry.md` |
| BR32-OS / implementation_source | `LEGACY-ASSET-8E94EB9298BDD0A9C52E` | `src/runtime/isolated-worktree-sandbox-runner.ts` |
| BR33-HARNESS / design | `LEGACY-ASSET-8195605FB59B8B837EFF` | `docs/adr/ADR-005-distribution-model-and-central-ui.md` |
| BR33-HARNESS / implementation_source | `LEGACY-ASSET-429C4F8FB5B0332F798C` | `src/setup/distribution-artifact-projection.ts` |

各候補のsource excerptはarchive path、line bounds、excerpt SHA-256、roleを固定しています。候補rowのsemantic linkは実装成立を表さず、`implementation_contract_evidence` は implementation candidate only として扱います。connector records、consumer closure evidence、authorityは空のままです。

## 保留と検証境界

全unitで `source_atomization_review_pending;product_boundary_pending_human_decision` を保持します。未確定の項目はproduct routing、phase authority、successor assignment、consumer closure、current implementation、BR33-HARNESSとBR33-OSの境界接続です。BR33-OSのcutover句はWave4で既レビューですが、そのauthorityやconsumer closureは未確定のままです。Wave22のBR33-HARNESS candidateからOS側成立やdistribution cutoverの実行を推定しません。

Wave21 verifier gatesを継承し、次をstatic fail-closeで検証します。

- schema10の未知row key、stale anchor、missing anchor mapping、source span外fragment、row admission claim
- requirement atomのliteral source groundingとspan bounds
- candidate atomのliteral provenance、selected excerpt bounds、source SHA
- missing receipt role closure、meta.inputsとprior batch digest closure
- BR33-OSの既レビュー重複、BR33-HARNESSのconnector発明、shared atomの無根拠昇格
- forged requirement atom、forged candidate atom、forged missing receiptを含むmeaningful negative cases

検証は `py_compile`、Wave22 static verifier、current `scfctl validate`、`git diff --check`、ledger/decomposition/crosswalkを一段のjoinで照合するdepth1 equivalent static checkに限定します。旧archiveのruntime、test、CIは実行しません。
