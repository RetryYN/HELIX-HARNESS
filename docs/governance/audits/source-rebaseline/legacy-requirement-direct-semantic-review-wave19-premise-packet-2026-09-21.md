# Wave19 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE19-2026-09-21`
- 独立worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave19`
- main merge / Wave19 parent: `17ce6830d2d4c684c96d55705cdc65790a4fdaa4`
- main merge parents: `4bff98789877b5b9b3b65c181a63ea1c1d826ee3`, `e40f7f778117864dc2271af323977ca6e4fd1e4c`
- Wave18 exact head: `e40f7f778117864dc2271af323977ca6e4fd1e4c`
- historical source base: `6dad906ed9a52c9e49611931645db2f298c6bf6a`
- scope: 4 product units / 10 evidence edges / 4 confirmed requirement edges / 6 unresolved candidate edges
- cumulative: 58/218 units、171 asset edges、残り160 units
- authority effect: `none`
- consumer closure: `pending`
- legacy execution: `not_run`
- new build: `false`

初期に参照した旧Wave18 HEAD `cfff5c3c006be85b91b2b1197bc5b239528e42a8` は再baseline前のsnapshotです。今回の親固定値は main merge `17ce6830d2d4c684c96d55705cdc65790a4fdaa4`、Wave18 exact head は `e40f7f778117864dc2271af323977ca6e4fd1e4c` とし、両者を混同しません。

## 要求source

共通要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、pathは `requirements-ir/requirements.json`、source SHA-256 は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | statement semantic digest |
|---|---:|---:|---|
| HIL-BR-23 | `requirements.json:950-990` | `infinity-loop-platform-requirements.md:75` | `sha256:271ec5381b718cce0fd8f0e3beacb9d0359059f88e8ea705fc7319edaa164c2d` |
| HIL-BR-24 | `requirements.json:993-1032` | `infinity-loop-platform-requirements.md:76` | `sha256:9727fd0b427f18eb8b6839f2f2f97d1d13ed88059b0c05738b887ed127c9809d` |

## unitとatom境界

| unit | product scope | phase candidates | atoms | boundary |
|---|---|---|---:|---|
| BR23-HARNESS | HELIX-HARNESS | PHCAP-03 / 06 | 4 | Requirement Translator、template gap、shared feedback |
| BR23-OS | HELIX-OS | PHCAP-09 / 19 | 1 | shared Template Gap feedback、OS improvement candidate |
| BR24-HARNESS | HELIX-HARNESS | PHCAP-03 / 04 / 05 / 06 | 4 | requirement ledger、field／obligation／revision、trace completion boundary |
| BR24-OS | HELIX-OS | none | 2 | requirement definition／revision projection候補。direct phase／pool unresolved |

BR23の共有atomは原文の `Template Gap Issueとして改善loopへ戻す` を両productに保持します。BR24では `要件定義そのものを設計対象として台帳化し` と `revisionを一つの履歴へ結ぶ` の共有範囲を保持します。共有は候補境界の保全であり、責務ownerの承認ではありません。

## selected asset candidate role

| unit / role | asset ID | path | static role |
|---|---|---|---|
| BR23-HARNESS / design | `LEGACY-ASSET-809D616D0D7D844F5720` | `docs/design/harness/L6-function-design/function-spec.md` | template／gap／improvement の設計候補 |
| BR23-HARNESS / implementation_source | `LEGACY-ASSET-FA8D4E24D8399E8350F1` | `src/cli.ts` | improvement／feedback／projection の未実行source候補 |
| BR23-OS / design | `LEGACY-ASSET-D5630716F221DA23DB09` | `docs/design/helix/L6-function-design/pillar-function-design.md` | improvement／feedback／projection／issue の設計候補 |
| BR23-OS / implementation_source | `LEGACY-ASSET-FBE72B3EBE59FF68C34B` | `src/state-db/feedback-projections.ts` | feedback／improvement／issue の未実行source候補 |
| BR24-HARNESS / design | `LEGACY-ASSET-CBF2D0F8889BC4C80AF4` | `docs/design/harness/L3-functional/roadmap.md` | requirement／trace／ledger／authority の設計候補 |
| BR24-HARNESS / implementation_source | `LEGACY-ASSET-11379713A3797CAC3141` | `src/requirements/requirement-ir-shadow.ts` | requirement／revision／ledger／authority の未実行source候補 |

BR24-OS は decomposition の direct phase candidates=[]、crosswalk の phase/product candidate pool=0です。同じ7 anchorによる bounded catalog search は2,650候補を返し、共通requirement asset 1件を選択、残る2,649件は未reviewとして保持します。missing evidence receipt は archive全体の不在を示さず、この候補集合を direct phase=[]／pool=0を理由に design／implementation edgeへ未選定とした事実を記録します。

## phase／implementation degradation

phase rowは crosswalk の candidate projectionを保持します。候補assetの存在は phase採否を決めず、旧実装sourceの存在は current implementationを決めません。全unitの implementation confirmed は0です。BR24-OS は `unresolved_no_direct_phase_or_pool`、他3 unitは `degraded_to_research_candidate` として扱います。

JSONL、meta、verifier は同じ固定入力関係で作成しています。このpacketからmerge、採否、実装完了、Issue close、PR完了を生成しません。

schema10 row field は固定集合で閉じ、要求atomの各source fragmentは選択IR/raw excerptに接地します。候補rowのatom objectは要求rowと完全一致させ、未知field、要求接地欠落、候補atom改変を静的陰性ケースで拒否します。
