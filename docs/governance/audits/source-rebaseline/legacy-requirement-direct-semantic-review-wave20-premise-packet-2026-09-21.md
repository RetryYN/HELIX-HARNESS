# Wave20 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE20-2026-09-21`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave20`
- current tree／parent: `9573119070cdf8f1f70e368bc310f575e8a3538c`
- main merge parents: `4c6740f106e9d71c72c3b9888123335bc0482417`、`609338f19a6189b76f4e03a39fa0a2823ffadbf6`
- Wave19 exact prior: `609338f19a6189b76f4e03a39fa0a2823ffadbf6`
- scope: 4 units / 12 asset edges / 4 confirmed requirement edges / 8 unresolved candidate edges
- cumulative: 62/218 units、183 asset edges、残り156 units
- authority effect: `none`
- consumer closure: `pending`
- legacy execution: `not_run`
- new build: `false`

## 要求source

共通要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR source SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | statement semantic digest |
|---|---:|---:|---|
| HIL-BR-25 | `requirements.json:1034-1075` | `infinity-loop-platform-requirements.md:77` | `sha256:88a5d24aeea43da624d2906a94ab075ede9611451fcf3264abefa592655c454e` |
| HIL-BR-26 | `requirements.json:1077-1118` | `infinity-loop-platform-requirements.md:78` | `sha256:93323e6ed35f5fe3a312d0d4965462586f1bb503c60f1f51013f18e8d48535be` |
| HIL-BR-27 | `requirements.json:1120-1161` | `infinity-loop-platform-requirements.md:79` | `sha256:514f5b65beee9eeb812dab45ef7665e514c11bbb549b102738338f097ca006e3` |

## unitとatom境界

| unit | product scope | phase candidates | atom数 | candidate search / phase pool |
|---|---|---:|---:|---:|
| BR25-HARNESS | HELIX-HARNESS | PHCAP-01 / 06 / 07 | 5 | 2,856 / 318 |
| BR26-HARNESS | HELIX-HARNESS | PHCAP-04 / 06 | 2 | 1,843 / 248 |
| BR26-OS | HELIX-OS | PHCAP-04 | 1 | 2,027 / 28 |
| BR27-HARNESS | HELIX-HARNESS | PHCAP-06 | 3 | 1,935 / 204 |

BR25はlayer ledger、L0 anchor、上下／V-pair、片edge完了禁止を保持します。BR26はAuthoringの自由とCanonical admissionをHARNESSの1 atom、policy内自動確定から不可逆契約escalationまでをOSの1 atomとして、接続条件を切断せず候補分割します。BR27は要求atom・設計義務・risk・state・failure・適用工程からのDesign Contract Portfolio導出を保持します。いずれもatomizationとproduct authorityは未確定です。

## selected candidate asset role

| unit / role | asset ID | path |
|---|---|---|
| BR25-HARNESS / design | `LEGACY-ASSET-130EFBE7012012FF9281` | `docs/design/helix/L6-function-design/layer-ledger-pair-gate.md` |
| BR25-HARNESS / implementation_source | `LEGACY-ASSET-FDD2B49D2715F39C8AE3` | `src/vmodel/layer-projection.ts` |
| BR26-HARNESS / design | `LEGACY-ASSET-1B06974484560B94B3D9` | `docs/design/helix/L6-function-design/design-registry.md` |
| BR26-HARNESS / implementation_source | `LEGACY-ASSET-26F088BF0ED22B11BED8` | `src/design/design-registry.ts` |
| BR26-OS / design | `LEGACY-ASSET-98372FEE8A3AC8F9C299` | `docs/design/helix/L5-detail/design-template-json-authority.md` |
| BR26-OS / implementation_source | `LEGACY-ASSET-4010B567B1B736F68EF2` | `src/requirements/requirement-authority-gate.ts` |
| BR27-HARNESS / design | `LEGACY-ASSET-4CAC3EB72DAD353A64D7` | `docs/templates/design/L6-function-spec-template.md` |
| BR27-HARNESS / implementation_source | `LEGACY-ASSET-B777FB7E878F90AD8FCB` | `src/design/design-registry-transaction.ts` |

asset catalogの候補roleは旧sourceの存在・静的excerptを示すだけです。実装候補8 edgeの実行、current adoption、completion、consumer closure、authorityを示しません。

## 保留

Web／Web-OSの旧decomposition candidateは0件であり、今回の4 unitへ追加しません。BR25–27のproduct routing、atomization、successor、phase authority、consumer closure、current implementation statusは保留です。archiveはread-onlyで、merge、PR、Issue、実装、旧runtime/test/CI実行は行いません。
