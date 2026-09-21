# Wave21 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE21-2026-09-21`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave21`
- current main baseline／parent: `053943791ceda83366fca01d375308ba5f7deb28`
- main merge parents at baseline: `2ec95d10d7233cbf64782f6120ffcb7ad150242a`、`1041f07d29a8cf8b55a55ee2ee11c378f683dd88`
- prior exact: Wave20 corrected HEAD `68ab10163fe0b6025dd56fa5d34cd476f6110494`（parent `d9d1f3d8c9521314ba6ec73d9d877390defaf00c`）
- scope: 5 units / 15 asset edges / 5 confirmed requirement edges / 10 unresolved candidate edges
- cumulative at baseline: 67/218 units、198 asset edges、残り151 units
- authority effect: `none`
- consumer closure: `pending`
- legacy execution: `not_run`
- new build: `false`
- prior batches: Wave1–20、inputs: 45 paths、rebaseline: completed at current main

## 要求source

共通要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR source SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | statement semantic digest |
|---|---:|---:|---|
| HIL-BR-28 | `requirements.json:1163-1205` | `infinity-loop-platform-requirements.md:80` | `sha256:d4e7f2d1a599e2d6e59fc913bfbe0d8006d6f60b251f02dd3b5c65c97025c653` |
| HIL-BR-29 | `requirements.json:1206-1248` | `infinity-loop-platform-requirements.md:81` | `sha256:05eba9d85097424f46afa0356b747e930077ff8b31b8264784eb54af709dc148` |
| HIL-BR-30 | `requirements.json:1249-1291` | `infinity-loop-platform-requirements.md:82` | `sha256:7805010c12510bd817953e2d115e50791e617dcbd627ed9d599762c277c72711` |

## unitと候補件数

| unit | product scope | phase candidates | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| BR28-HARNESS | HELIX-HARNESS | PHCAP-06 / 07 | 2 | 2,124 / 298 |
| BR29-HARNESS | HELIX-HARNESS | PHCAP-06 / 07 / 12 | 2 | 2,853 / 391 |
| BR29-OS | HELIX-OS | PHCAP-19 | 1 | 3,296 / 413 |
| BR30-HARNESS | HELIX-HARNESS | PHCAP-06 / 08 | 2 | 3,343 / 221 |
| BR30-OS | HELIX-OS | PHCAP-10 | 2 | 3,419 / 418 |

BR29の `候補skillはshadow評価と独立reviewを経るまで判断gateの強制規則へ昇格しない。` はHARNESS／OSの両側へ完全句で保持します。BR30-A02のworker／verifier／authority、context、tool/path、budget、停止条件は両側の共有制約として完全句を保持します。BR30-A02の共有atom textは完全句で保持し、HARNESS側はspan 2–3、OS側は共有tail spanだけをsource_fragmentsへ記録します。BR30-HARNESS-A01はHARNESS側のbounded literal fragment、BR30-OS-A01はruntime projectionのliteral fragmentへ切り分けました。A01間は上流decompositionに明示connectorがないため、両A01を共有atomへ昇格せず `connector_gap_unresolved` hold として保持します。

## selected candidate asset role

| unit / role | asset ID | path |
|---|---|---|
| BR28-HARNESS / design | `LEGACY-ASSET-D8A9E08B9BDD62096AEF` | `docs/design/helix/L6-function-design/design-artifact-source-digest.md` |
| BR28-HARNESS / implementation_source | `LEGACY-ASSET-462F60E486F8DB80687E` | `src/lint/design-artifact-source-digest.ts` |
| BR29-HARNESS / design | `LEGACY-ASSET-D107FD145A2588FAAD09` | `docs/design/helix/L4-basic-design/worker-independent-review.md` |
| BR29-HARNESS / implementation_source | `LEGACY-ASSET-AB6F8E1928385699AD6A` | `src/gate/review-tier-policy.ts` |
| BR29-OS / design | `LEGACY-ASSET-C544D3D166699301485D` | `docs/design/helix/L6-function-design/universal-improvement-source-registry.md` |
| BR29-OS / implementation_source | `LEGACY-ASSET-9CC8ADC4CDBC20F12A64` | `src/runtime/universal-improvement-source-registry.ts` |
| BR30-HARNESS / design | `LEGACY-ASSET-D27D4A1511BFD43623A9` | `docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md` |
| BR30-HARNESS / implementation_source | `LEGACY-ASSET-78D55762187C612C93C4` | `src/state-db/current-location.ts` |
| BR30-OS / design | `LEGACY-ASSET-6DA5F7026F38B4C091AF` | `docs/design/helix/L6-function-design/worker-output-admission.md` |
| BR30-OS / implementation_source | `LEGACY-ASSET-4895AB4D1A11B9202C34` | `src/orchestration/loop-stop-rules.ts` |

旧assetは静的candidate roleとしてのみ扱います。phase capability、design source、implementation sourceの存在はcurrent implementation、completion、authorityの証拠へ昇格しません。

## 保留

product routing、共有atomのowner、successor、phase authority、consumer closure、current implementationは未確定です。Web／Web-OS候補は今回の旧decompositionにないため追加していません。research-premise candidateから採否・下流実装へ進みません。
