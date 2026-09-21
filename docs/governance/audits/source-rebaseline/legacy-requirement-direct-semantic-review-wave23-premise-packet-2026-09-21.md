# Wave23 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE23-2026-09-21`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave23`
- branch: `docs/legacy-semantic-review-wave23`
- current main baseline／parent: `c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3`
- main merge parents: `ac54c3f9008bb501d6f0c501e66137c21cd5f149`、`30e87714ef09c89258a93bbbd5567ea753fbbf96`
- prior exact: Wave22のledger/metaを入力へ固定
- scope: 2 units / 6 asset edges / 2 confirmed requirement edges / 4 unresolved candidate edges
- cumulative: 72 units / 213 asset edges / 残り146 units
- authority effect: `none`
- consumer closure: `pending`
- legacy execution: `not_run`
- new build: `false`

## 要求source

共通要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR source SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | statement semantic digest |
|---|---:|---:|---|
| HIL-FR-01 | `requirements.json:1426-1467` | `infinity-loop-platform-requirements.md:91` | `sha256:bf1e51a051e81e130843ed584640fcc1df69d9b5d84f22f22aa29c261b03c3b7` |
| HIL-FR-02 | `requirements.json:1469-1510` | `infinity-loop-platform-requirements.md:92` | `sha256:022383e2542716540cf4fc42ef8d52b58606a03fdf50eb77de378a5d374236b7` |

IR/raw edgeの全文とexcerpt SHAはledgerのrequirement edge（LSRW23-EDGE-001、LSRW23-EDGE-004）で保持します。

## requirement atom

| unit | atom IDs and literal text |
|---|---|
| FR01-OS | `FR01-OS-A01` `InfinityLoopEvent`受理と状態遷移 ／ `FR01-OS-A02` 入力commit/tree digestと前段receiptへのbind ／ `FR01-OS-A03` append-only event、current state、parent/cause ID |
| FR02-OS | `FR02-OS-A01` repository/PR/head SHA/event delivery IDの正規化 ／ `FR02-OS-A02` 同一deliveryの一度だけのaudit queue登録 ／ `FR02-OS-A03` audit jobとidempotency receipt |

各atomは選択unitのdecomposition source_text_spans[0]へliteral substringとして接地し、shared atomは空です。FR01とFR02を別product unitとして保持し、要求句間のconnectorやownerを補っていません。

## selected candidate asset role

| unit / role | asset ID | exact old source / static excerpt |
|---|---|---|
| FR01-OS / design | `LEGACY-ASSET-BB08D70A42B6445B2D1E` | `docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md:15-60` |
| FR01-OS / implementation_source | `LEGACY-ASSET-3FEC0B8E1BD14109D214` | `src/state-db/github-execution-episode.ts:117-129` |
| FR02-OS / design | `LEGACY-ASSET-944C5027F71733A26597` | `docs/design/helix/L6-function-design/github-execution-episode-state.md:20-35` |
| FR02-OS / implementation_source | `LEGACY-ASSET-DFF9BADFBFC93A632EBA` | `src/runtime/continuation.ts:1278-1321` |

design/source excerptは static read-only です。FR01 implementationはevent/state transitionとdigest fieldsを含みますが、要求のInfinityLoopEvent全state sequenceの成立を証明しません。FR02 designはidempotency／state contractを示しますが、PR hook provider境界・delivery receiptの現行実装を証明しません。FR02 implementation excerptはdelivery／operation／event hashのcandidate evidenceとして保持しますが、要求のhook intake・audit queueの成立を証明しません。これらは全て unresolved candidate edgeです。

## 保留

product boundary、phase authority、consumer closure、successor assignment、current implementation、acceptance receipt、connector gapを未確定のまま保持します。authority effectは `none`、legacy executionは `not_run`、new buildは `false` です。research-premise candidateから採否、現行実装、audit配送、下流実行を生成しません。
