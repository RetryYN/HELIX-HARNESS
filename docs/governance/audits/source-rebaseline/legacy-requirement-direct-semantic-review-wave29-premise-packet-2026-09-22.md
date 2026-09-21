# Wave29 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE29-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave29`
- branch: `docs/legacy-semantic-review-wave29`
- Wave28 exact parent／current tree／stacked input: `a05b9f5444ba11626823683cc486db95c9d1f3a3`（PR #1980未merge）
- main base／source main base: `b27e61f079edf64eeddc43eb8095159b19730b94`
- main merge parents: `3df81ad27157c471e004083783f37a5860eaa2ee`、`bd468075abd1c1a95c655acdc9cd00b8fe1d898a`
- rebaseline stop: mainまたはWave28 exact HEADが変わったら停止し、入力digest／parent lineageを更新
- scope: 6 units / 18 asset edges / 6 confirmed requirement edges / 12 unresolved candidate edges
- cumulative: 95 units / 282 asset edges / 残り123 units（全218 units）
- authority effect: `none`; consumer closure: `pending`; legacy execution: `not_run`; new build: `false`

Wave29はWave28をstacked parentとして固定した候補です。Wave28のunit／assetを再選択せず、次の未レビュー要求source atom境界FR18〜20だけを対象にしました。候補値をmain確定値として扱わず、parentが変わった場合は検証を停止します。commit、push、PR、merge、Issue操作は行いません。

## 要求source

| requirement | IR span | raw span | semantic digest | product units |
|---|---:|---:|---|---|
| HIL-FR-18 | `requirements.json:2157-2198` | `:108` | `sha256:4bde6624ded9421c9c4e97a6ca4a1178195731267aa4ab16b6639d7b46d0e913` | FR18-HARNESS / FR18-OS |
| HIL-FR-19 | `requirements.json:2200-2241` | `:109` | `sha256:df78c7188f3a460486b34259b78e011b47518da134d4e7344b6614c514915e6b` | FR19-HARNESS / FR19-OS |
| HIL-FR-20 | `requirements.json:2243-2284` | `:110` | `sha256:c15b515fa4611febe1e2eca21082a6f2ac9513f7858af231c3a8e658308c423a` | FR20-HARNESS / FR20-OS |

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
