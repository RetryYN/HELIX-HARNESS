# Wave25 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE25-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave25`
- branch: `docs/legacy-semantic-review-wave25`
- Wave24 exact candidate lineage: `5bb9ce4ca2a5fdd220be3a2874af201763ca4016`
- candidate parent／current tree: `2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c`
- main merge revision: `2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c`
- main merge parents: `4974e66e3890e41515004d18c49d59b3e49f8f68`、`5bb9ce4ca2a5fdd220be3a2874af201763ca4016`
- rebaseline stop: captured `origin/main`またはmerge parentが進んだら停止し、mainを再読込してrebaseline
- scope: 2 units / 6 asset edges / 2 confirmed requirement edges / 4 unresolved candidate edges
- cumulative: 76 units / 225 asset edges / 残り142 units（全218 units）
- authority effect: `none`
- consumer closure: `pending`
- legacy execution: `not_run`
- new build: `false`

FR06のHARNESS／OS unitはWave2に既存edgeがあるため、このwaveへ重複追加しません。FR05の次にFR07へ飛ばすと連続範囲でなくなるため、2 unitsで停止しました。

## 要求source

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR source SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:95` です。

| requirement | IR span | raw span | exact statement |
|---|---:|---:|---|
| HIL-FR-05 | `requirements.json:1598-1640` | `:95` | `Redesign routerは設計欠陥をcanonical L1–L6の影響層へ割り当てる。L1企画変更はL12運用テストpairを、L2要求変更はL11受入テストpairとScreen Applicability/prototypeまたはskip receiptをstale化して再freezeし、Reverse→Redesign→pair-freeze→Forwardの順序を強制する。層外L0 charter変更はPOへescalateする。 | redesign PLAN、修正layer、stale edge、pair receipt` |

## product unitとatom

| unit | product | phase | atom IDs |
|---|---|---|---|
| `IRUNIT-HIL-FR-05-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-05 / PHCAP-06 / PHCAP-07 / PHCAP-18 | `FR05-HARNESS-A01、FR05-HARNESS-A02、FR05-HARNESS-A03、FR05-HARNESS-A04、FR05-HARNESS-A05` |
| `IRUNIT-HIL-FR-05-HELIX-OS` | HELIX-OS | PHCAP-18 | `FR05-OS-A01、FR05-OS-A02、FR05-OS-A03` |

`FR05-HARNESS-A04`／`A05` と `FR05-OS-A02`／`A03` は共有候補atomとしてholdします。shared atomの接続責務、product owner、connector recordは未確定です。

## selected candidate asset role

| unit / role | asset ID | exact old source / static excerpt |
|---|---|---|
| FR05 / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9` | `requirements.json:1598-1640`、`infinity-loop-platform-requirements.md:95` |
| FR05 / design | `LEGACY-ASSET-94D54E3E1A229FB0684D` | `docs/design/helix/L5-detail/layer-ledger-pair-gate.md:32-49` |
| FR05 / implementation_source | `LEGACY-ASSET-659BC8C9409A09406296` | `src/lint/scrum-reverse.ts:1-17` |

bounded global search は 4020 catalog records を 15 UTF-8 anchor で走査し、各unit 943 candidate / 940 unreviewed、phase/product pool は HARNESS 557 / OS 286 です。 各excerptは `static_read_only` で、catalog source SHA、line bounds、excerpt SHAをledgerへ固定しています。FR05 design／implementationは要求語の一部と旧sourceの近接を示す研究候補に留まり、4 candidate edgeはsemantic link `unresolved`、`legacy_execution_status=not_run`、`current_requirement_implementation_status=not_established`、`new_build_allowed=false`です。

旧判断史・failure・consumerの調査結果は、旧assetのlow-confidence／pending／unknownを保持し、current authorityへ再利用しません。

## 保留

product boundary、phase authority、consumer closure、successor assignment、current implementation、acceptance receipt、shared atomの独立判断を未確定のまま保持します。Wave24 exact HEAD `5bb9ce4ca2a5fdd220be3a2874af201763ca4016` を含む最新main `2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c` へrebaseline済みであり、candidateは正式採否・下流利用へ昇格しません。commit、push、PR、merge、archive実行は行いません。
