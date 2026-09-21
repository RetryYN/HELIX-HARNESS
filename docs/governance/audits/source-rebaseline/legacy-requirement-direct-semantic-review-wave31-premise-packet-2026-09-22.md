# Wave31 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE31-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave31`
- branch: `docs/legacy-semantic-review-wave31`
- Wave30 exact parent/current tree: `71e42d1da744462bb870686e266a29d986256ce6`
- main base: `f122d65e1435b4709fbb7b07fbb8e42b70f0b110`
- observed origin/main: `f122d65e1435b4709fbb7b07fbb8e42b70f0b110`（再baseline済み）
- scope: 4 units / 12 asset edges / 4 confirmed requirement edges / 8 unresolved candidate edges
- cumulative: 103 units / 306 asset edges / 残り115 units（全218 units）
- authority effect: `none`; consumer closure: `pending`; legacy execution: `not_run`; new build: `false`

mainまたはWave30 exact parentが変わった場合は入力digestと親系譜を更新してrebaselineします。候補値はauthority、採用、現行実装の証拠ではありません。

最新mainと修正後のWave30を親系譜として、Wave29・30のledger／meta digestを再照合しました。候補のarchive manifest、requirements IR、FR24〜FR27 source、catalog、decomposition、crosswalk、phase inventoryに変更はありません。

## 要求source

| requirement | raw span | semantic digest | product unit |
|---|---:|---|---|
| HIL-FR-24 | `infinity-loop-platform-requirements.md:114` | `sha256:b021ff425efe0ba75863b33302ec3c41146b5c995ad9cfae41af926e80d152d2` | FR24-OS |
| HIL-FR-25 | `infinity-loop-platform-requirements.md:115` | `sha256:36c4ed5dec52d986c2fb907a3a77990ba8c37ca9f758659ea629bc5ad1a657f5` | FR25-OS |
| HIL-FR-26 | `infinity-loop-platform-requirements.md:116` | `sha256:76c13e750973dfd41c71441213ec6b6d17594a8639712557e88a04ecc9e914d4` | FR26-OS |
| HIL-FR-27 | `infinity-loop-platform-requirements.md:117` | `sha256:d07429d447a619e36123eef0eec84033d66bea379ac65c632db5de7794781ecb` | FR27-OS |

IR object spans are `requirements.json:2415-2457`, `2458-2500`, `2501-2543`, `2544-2586` respectively. Requirement asset is `LEGACY-ASSET-A60CF91DD2AF6693E6F9`.

## 候補境界

| unit | product | direct phase | phase-product pool | selected design / implementation |
|---|---|---|---:|---|
| `IRUNIT-HIL-FR-24-HELIX-OS` | HELIX-OS | unknown | 0 | `9BCBB...` / `77A700...` |
| `IRUNIT-HIL-FR-25-HELIX-OS` | HELIX-OS | PHCAP-10 | 418 | `28B471...` / `656237...` |
| `IRUNIT-HIL-FR-26-HELIX-OS` | HELIX-OS | PHCAP-07 | 142 | `28B471...` / `A1918...` |
| `IRUNIT-HIL-FR-27-HELIX-OS` | HELIX-OS | PHCAP-10 | 418 | `FA37B...` / `D1CCF...` |

全unitのshared atomは空配列です。design／implementationは候補近接の静的source evidenceであり、意味リンクは未解決です。catalog／dispositionのHistorical、historical authority、unresolved、unknown implementation、consumer refs空を保持しています。

旧archiveのworkflow、CLI、hook、adapter、runtime、test、CIは実行していません。下流pair、新規build、採用判定を生成していません。
