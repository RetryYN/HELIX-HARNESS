# Wave22 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE22-2026-09-21`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave22`
- branch: `docs/legacy-semantic-review-wave22`
- current main baseline／parent: `bc5aef4726ad979c10c34a43557025e77f1c25d6`
- main merge parents: `5fcdc80f23c0fb3e959293b9fbd751fa31eeb792`、`75cdab971129c9b25830860059c8c6fadaca38b2`
- prior exact: Wave21 `418500321edbc8bc3c45f4d8d0d8c994de9f7597`（parent／source base `053943791ceda83366fca01d375308ba5f7deb28`）
- scope: 3 units / 9 asset edges / 3 confirmed requirement edges / 6 unresolved candidate edges
- cumulative at baseline: 70 units / 207 asset edges / 残り148 units
- authority effect: `none`
- consumer closure: `pending`
- legacy execution: `not_run`
- new build: `false`
- prior batches: Wave1–21、inputs: 47 paths、PR #1943後の最新mainへのrebaseline: completed

## 要求source

共通要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR source SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | statement semantic digest |
|---|---:|---:|---|
| HIL-BR-31 | `requirements.json:1292-1334` | `infinity-loop-platform-requirements.md:83` | `sha256:5de1a74038ae72cb30e6f61fa68bc6d3085dc88a57d6d1c778dc42c78aff7d20` |
| HIL-BR-32 | `requirements.json:1335-1382` | `infinity-loop-platform-requirements.md:84` | `sha256:78f34c71dbf6c0d4ad87aaea5e2275eb3cc3401fd8fcf6c567000754603563ac` |
| HIL-BR-33 | `requirements.json:1383-1425` | `infinity-loop-platform-requirements.md:85` | `sha256:758e2ea4f82c6c068d8c8ac633a7f092573c01c078a8293e81ded4bc70eaa5ef` |

要求statement全文はledgerのrequirement edgeで保持します。BR33のHARNESS spanは `配布はmarketplace型パッケージ仕様（正本index、手編集禁止の生成index、first-party/third-party分離、免責記載）で定義し`、OSの `配布surfaceの実切替は既存cutover承認境界に従う` はWave4の既存 `IRUNIT-HIL-BR-33-HELIX-OS` edge `LSRW4-EDGE-007` が保持しています。Wave22でOS edgeを重複追加しないことは、source meaningの削除ではなくprior lineageへの接続です。

## unitと候補件数

| unit | product scope | phase candidates | atom数 | bounded candidate / phase-product pool | candidate ID digest |
|---|---|---|---:|---:|---|
| BR31-OS | HELIX-OS | PHCAP-07 / PHCAP-10 | 3 | 867 / 278・471 | `sha256:701454259d80f58a6efbbb7f6b678d94f67f776f2fd13c65869eefdb064f3aa8` |
| BR32-OS | HELIX-OS | PHCAP-10 | 3 | 824 / 471 | `sha256:ca098dc3cb1bce88d444c417fe8e541a51a5ec97eb46797d6bc2860772a2facd` |
| BR33-HARNESS | HELIX-HARNESS | PHCAP-14 | 1 | 1,854 / 123 | `sha256:e25e351c9e63d42ed9848f2238f7a47f731849d2a6cfa39e572a2c029ad70886` |

BR33-OSはWave4の既レビュー単位（requirement confirmed、design unresolved、implementation source rejected）です。Wave22の未review contiguous rangeはBR31-OS、BR32-OS、BR33-HARNESSで止め、BR33-OSを再計上しません。HARNESS側のpackage specification atom、OS側のcutover atom、各source spanを別々に保持しており、connectorを発明していません。

## requirement atom

| unit | atom IDs and literal text |
|---|---|
| BR31-OS | `BR31-OS-A01` 第三者workerを価格や公称性能だけで採用せず ／ `BR31-OS-A02` 機械判定可能なacceptance bench、blind judgeを含むfull bench、HELIX実task scorecardで品質・安全・実効costを比較し ／ `BR31-OS-A03` 採用、用途限定、quarantine、retireを証拠付きで決定する。 |
| BR32-OS | `BR32-OS-A01` Claude/Codex以外の定額worker runtime（Kimi/Grok等）をprecedenceを曲げずproposal-only workerとして接続し ／ `BR32-OS-A02` 実行を隔離worktree/sandbox内に限定してrepository本体、`.helix/` state、harness DB、credentialへ到達させない。 ／ `BR32-OS-A03` 秘密・機密を含む作業の第三者runtime委譲を禁止する。 |
| BR33-HARNESS | `BR33-HARNESS-A01` 配布はmarketplace型パッケージ仕様（正本index、手編集禁止の生成index、first-party/third-party分離、免責記載）で定義し |

各atomは選択したunitのsource_text_spans[0]にliteral substringとして接地し、shared atomは空です。BR33-HARNESSの末尾 `し` はdecompositionのHARNESS責務句を保持するためのliteral boundaryであり、後続のcutover句はBR33-OSのWave4 atomに残します。

## selected candidate asset role

| unit / role | asset ID | exact old source |
|---|---|---|
| BR31-OS / design | `LEGACY-ASSET-09F4CAA4129F5DF63C5E` | `docs/design/helix/L4-basic-design/worker-blind-benchmark.md` |
| BR31-OS / implementation_source | `LEGACY-ASSET-63CA5B35FD7F7873B06C` | `src/runtime/worker-blind-definition.ts` |
| BR32-OS / design | `LEGACY-ASSET-7795E6A5C8D14603031D` | `docs/design/helix/L4-basic-design/specialist-agent-registry.md` |
| BR32-OS / implementation_source | `LEGACY-ASSET-8E94EB9298BDD0A9C52E` | `src/runtime/isolated-worktree-sandbox-runner.ts` |
| BR33-HARNESS / design | `LEGACY-ASSET-8195605FB59B8B837EFF` | `docs/adr/ADR-005-distribution-model-and-central-ui.md` |
| BR33-HARNESS / implementation_source | `LEGACY-ASSET-429C4F8FB5B0332F798C` | `src/setup/distribution-artifact-projection.ts` |

旧assetは静的candidate roleとしてのみ保持します。phase capability、design source、implementation sourceの存在はcurrent implementation、completion、authority、consumer closureの証拠へ昇格しません。selected excerptはすべて `static_read_only`、legacy executionは `not_run` です。

## 保留

全9 edgeでauthorityは `none`、consumer closureは `pending` です。source atomization review、product boundary／routing、phase authority、successor assignment、current implementation、connector gap、missing acceptance receiptを保留します。BR33-OSは既レビューのため今回のcandidate countから除外しましたが、Wave4 source evidenceへの参照を残しています。research-premise candidateから採否、下流実装、配布cutoverの実行へ進みません。
