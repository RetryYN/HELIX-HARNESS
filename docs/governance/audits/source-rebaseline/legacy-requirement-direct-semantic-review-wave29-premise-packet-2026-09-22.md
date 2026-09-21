# Wave29 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE29-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave29`
- branch: `docs/legacy-semantic-review-wave29`
- parent／current tree／main base: `f122d65e1435b4709fbb7b07fbb8e42b70f0b110`（Wave28統合済み）
- main merge parents: `4919cfd245ee128fee71c713c8d2d0a8cd5fcd11`、`d272a97b3e55401fa75ad41670fbeefd18f8a4cf`
- rebaseline stop: mainまたは共有入力が変わったら停止し、入力digest／parent lineageを更新
- scope: 6 units / 18 asset edges / 6 confirmed requirement edges / 12 unresolved candidate edges
- cumulative: 95 units / 282 asset edges / 残り123 units（全218 units）
- authority effect: `none`; consumer closure: `pending`; legacy execution: `not_run`; new build: `false`

Wave29はWave28統合後のmainを親とする候補です。Wave28のunit／assetを再選択せず、次の未レビュー要求source atom境界FR18〜20だけを対象にしました。候補値をmain確定値として扱わず、parentが変わった場合は検証を停止します。作成側はmergeとIssue closeを行いません。

## 要求source

| requirement | IR span | raw span | semantic digest | product units |
|---|---:|---:|---|---|
| HIL-FR-18 | `requirements.json:2157-2198` | `:108` | `sha256:113f62503959378764966ff837c8d5f4beffde5932618b47aee921e507535ab3` | FR18-HARNESS / FR18-OS |
| HIL-FR-19 | `requirements.json:2200-2241` | `:109` | `sha256:817dc126b7355e14109936f8f9c83edcd21fdc3d0afd9fad8a41508828306b35` | FR19-HARNESS / FR19-OS |
| HIL-FR-20 | `requirements.json:2243-2284` | `:110` | `sha256:222133a9de644396f35972616f71b14d07b7f1c501c737366b9a56f8f5ff5643` | FR20-HARNESS / FR20-OS |

| unit | product scope候補 | direct phase候補 | atom IDs | bounded / phase-product pool |
|---|---|---|---|---:|
| `IRUNIT-HIL-FR-18-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 | `FR18-HARNESS-A01`–`A03` | 3470 / 204 |
| `IRUNIT-HIL-FR-18-HELIX-OS` | HELIX-OS | unknown | `FR18-OS-A01` | 3470 / 0 |
| `IRUNIT-HIL-FR-19-HELIX-HARNESS` | HELIX-HARNESS | unknown | `FR19-HARNESS-A01`、`A02` | 2726 / 0 |
| `IRUNIT-HIL-FR-19-HELIX-OS` | HELIX-OS | PHCAP-19 | `FR19-OS-A01`、`A02` | 2726 / 413 |
| `IRUNIT-HIL-FR-20-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-05 / PHCAP-07 | `FR20-HARNESS-A01`–`A03` | 3057 / 124 |
| `IRUNIT-HIL-FR-20-HELIX-OS` | HELIX-OS | unknown | `FR20-OS-A01`、`A02` | 3057 / 0 |

FR18-HARNESS／OS、FR19-HARNESS／OS、FR20-HARNESS／OS間のsource span overlapはありません。shared atomは全unitで空配列です。product boundary、phase authority、successor assignmentはhuman review pendingです。

## asset roleとunknown境界

各unitの3 edgeは同一要求asset、productに近接するdesign asset、implementation source候補assetです。design／implementationは過去Waveの実装assetと重複しないcatalog IDを選びました。FR18は `335176...`／`59E0...`、FR19は `F6E9...`／`03B...`、FR20は `535E...`／`A85...` をHARNESS／OS pairで参照します。

要求edgeだけを同一要求IDのexact static contractとしてconfirmedにし、design／implementationの12 edgeは `unresolved` としました。implementationは `unknown`、縮退・failure・consumer closureは未確定、legacy runtime/test/CIは `not_run` です。候補assetのbounded search membershipは意味一致、採用、現行実装の証拠ではありません。

旧archiveはsource、判断史、failure、consumerを調査するためだけに静的参照しました。旧workflow、CLI、hook、adapter、runtime、test、CIを実行せず、候補から下流pairや新規buildを生成していません。

選択assetのdispositionはcatalog／disposition台帳で `Historical`、`historical` authority、`unresolved`、`unknown` implementation、空のconsumer refsを確認しました。implementation source候補のreuse exclusionと未充足migration preconditions（atom inventory、product owner、parent binding、consumer、rights、executability、secret、external effect）を保持し、failure／consumer closureを未確定のまま残しています。
