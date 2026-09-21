# Wave17 research premise packet（2026-09-21）

## authoritative base / candidate overlay

- base: `origin/main` `6dad906ed9a52c9e49611931645db2f298c6bf6a`
- stacked PR parent / Wave16 candidate（明示的にprior計算へ含める）: `74bfd04f7aa2384e1e30856ec6c29282b764e8c5`（merge base `6dad906ed9a52c9e49611931645db2f298c6bf6a`）
- Wave16 ledger/meta are available in the current tree。`wave16_candidate_input_digests` にcanonical digestを固定し、shallow cloneではcurrent treeから検証する。full cloneでは可能な場合だけgit objectを追加照合する。
- batch: `LEGACY-SEMANTIC-WAVE17-2026-09-21`
- selected order: BR15-OS → BR16-HARNESS → BR16-OS
- result: 3 units / 7 atoms / 8 evidence edges / confirmed 3 / unresolved 5 / rejected 0

## unit and boundary

| unit | product scope | phase candidates | source spans | boundary / connected targets |
|---|---|---|---|---|
| BR15-OS | HELIX-OS | PHCAP-03,07,09 | product-data connectorからprojection、downstream supplyの一文 | BR14-OSのsource/ref authority・receipt inventoryと境界。BR15はversioned product-data projection候補 |
| BR16-HARNESS | HELIX-HARNESS | PHCAP-07,11 | 3段CI; shared SHA/tree/lineage gate | BR16-OSとshared span。Hはimpact/full/external stage gate候補 |
| BR16-OS | HELIX-OS | PHCAP-11 | shared SHA/tree/lineage; style integration binding | BR16-HARNESSとshared span。OSはSHA/tree/predecessor binding候補 |

BR16 shared span `各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない` は両unitのatom inventoryに保持するが、shared semantic edgeを二重に数えない。BR16-HARNESSの設計候補はtyped plan/HEAD/fallbackを示すだけでimpact→full→externalの3段成立を直接示さず、BR16-OS telemetry候補はsource/candidate HEADとDAGを示すがpredecessor binding全体を示さない。

## lossless atom分解

### BR15-OS / HIL-BR-15（source digest `sha256:5f5450b0a801f1f4c6650a0b4ddb87d5eee23400f2126332ed0038ed06f01115`）

1. `BR15-OS-A01`: 将来のproduct-data sourceをversioned connectorで取り込み
2. `BR15-OS-A02`: 由来・鮮度・schema・authorityを保持した正規projectionとして
3. `BR15-OS-A03`: 設計判断、coverage、impact、Issue routing、docgen/detectorへ供給する

connective fragmentsは `、` と `。`。C3DEのL5設計はA01/A02候補を部分的に照合するが、A03とconsumer closureは未確認。L6 asset DD66はWave11で既使用のためWave17候補から除外し、旧snapshotの `src/product-data/` directory不在を未実装の静的counterevidenceとしてだけ記録する。

### BR16-HARNESS / HIL-BR-16（source digest `sha256:8e9887486ff78af21e31dbed2c1c713928bc397fdfa50aa1703549511f9356df`）

1. `BR16-HARNESS-A01`: 検証をslice統合前のimpact CI、candidate固定後のfull CI、GitHub PR上の外部CIの3段に固定し
2. `BR16-HARNESS-A02`: 各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない

### BR16-OS / HIL-BR-16

1. `BR16-OS-A01`: 各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない（BR16-HARNESS-A02とshared）
2. `BR16-OS-A02`: style内統合によるSHA変更はpredecessor bindingで追跡する

## selected assets（nonrequirementはWave1〜16のID/path/digest重複を除外）

| unit / role | asset ID | path | digest | static reading |
|---|---|---|---|---|
| BR15 design | `LEGACY-ASSET-C3DE79BA9451172F3E43` | `docs/design/helix/L5-detail/product-data-connector.md` | `sha256:2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04` | versioned connector、lineage/schema/freshness、canonical projection、authority boundary。実装・実行は主張しない |
| BR16-H design | `LEGACY-ASSET-E9998EF887555DBB2751` | `docs/design/helix/L6-function-design/ci-verification-plan.md` | `sha256:21e0b8a05b965d6c1ad27c55bf28ff2d711daa4112c96589da63075b02fc5841` | typed plan、candidate HEAD、full fallback。3段成立は未確認 |
| BR16-H implementation | `LEGACY-ASSET-CA0C7F22EA2ACBBF417E` | `src/runtime/ci-critical-path-scheduler.ts` | `sha256:422379c12afc877d5865eff2841610575259814fef282ecafc9196009285ffb0` | candidate/base HEAD、artifact identity。new CIの三段接続は未確認 |
| BR16-OS design | `LEGACY-ASSET-11770E4E81583B408E67` | `docs/design/helix/L6-function-design/ci-execution-telemetry.md` | `sha256:a5b74e97aaf8bd098eca6dcbd8565c10934ea4df04f281b0fb965592d54e7017` | source/candidate HEAD、DAG、telemetry。predecessor binding全体は未確認 |
| BR16-OS implementation | `LEGACY-ASSET-F151382D9513557AF632` | `src/adapters/github-open-branch-plan-reservation-provider.ts` | `sha256:63623abeba8f1a72c8b059648412651fc629b12dbc62766442bb728572085004` | tree/head captureとread-after。CI stage/style bindingではない |

BR15 implementationは直接資産なし。catalog-wide implementation_source match countは3検索語すべて0。`ProductDataConnector`、`ProductDataProjection`、`HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN` をarchive `root/src`で静的検索し、直接実装は確認できなかった。`root/src/product-data/`も存在しない。この結果は旧snapshotの調査結果であり、現行実装を確定する証拠ではない。

## exact source and phase rows

要求edgeはA60 `requirements-ir/requirements.json` のHIL-BR-15（604–646行）、HIL-BR-16（647–689行）を同一契約のexact sourceとする。L3/L5文書は候補設計であり、要求confirmedの根拠として使用しない。

| unit | phase | current | legacy | transition | gap |
|---|---|---|---|---|---|
| BR15-OS | PHCAP-03 | candidate | implemented_partial | degraded_to_candidate | HARNESS意味コアとOS分類projectionの分離・正式要求化が未完了 |
| BR15-OS | PHCAP-07 | candidate_only | documented_with_test_design | not_reimplemented_formally | 現行証拠はHARNESS／OS候補に限定。Web／Web-OSのL10、oracle registry、新世代CIが未構築 |
| BR15-OS | PHCAP-09 | candidate | documented_candidate | degraded_to_rederived_candidate | ticket contract、発行責務、GitHub projectionの正式分離が未完了 |
| BR16-HARNESS | PHCAP-07 | candidate_only | documented_with_test_design | not_reimplemented_formally | 現行証拠はHARNESS／OS候補に限定。Web／Web-OSのL10、oracle registry、新世代CIが未構築 |
| BR16-HARNESS | PHCAP-11 | candidate | implemented_with_workflow_and_test_design | degraded_to_candidate | 新世代CI、CI固有Scaffold Binding、責務別profile、現行oracleが未構築。一般Scaffoldのlocal検査はCI能力として数えない |
| BR16-OS | PHCAP-11 | candidate | implemented_with_workflow_and_test_design | degraded_to_candidate | 新世代CI、CI固有Scaffold Binding、責務別profile、現行oracleが未構築。一般Scaffoldのlocal検査はCI能力として数えない |

authority effectはnone、consumer closureはpending、legacy実行はnot_run、new buildは許可しない。BR15のdirect phase/routing hold、BR16両unitのproduct boundary holdを維持する。
