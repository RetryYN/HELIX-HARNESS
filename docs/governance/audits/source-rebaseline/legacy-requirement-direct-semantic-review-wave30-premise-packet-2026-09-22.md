# Wave30 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE30-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave30`
- branch: `docs/legacy-semantic-review-wave30`
- Wave29 Draft PR #1983 rebaseline後 exact parent／current tree／stacked input: `a75a36b548af46d916234d8d894f07840f76cfd0`
- main base／source main base: `1c6912ad34b9a7950206188ad364e3a712dc9e6b`
- main merge parents: `b27e61f079edf64eeddc43eb8095159b19730b94`、`a05b9f5444ba11626823683cc486db95c9d1f3a3`
- rebaseline stop: mainまたはWave29 exact HEADが変わったら停止し、入力digest／parent lineageを更新
- scope: 4 units / 12 asset edges / 4 confirmed requirement edges / 8 unresolved candidate edges
- cumulative: 99 units / 294 asset edges / 残り119 units（全218 units）
- authority effect: `none`; consumer closure: `pending`; legacy execution: `not_run`; new build: `false`

Wave30はWave29をstacked parentとして固定した候補です。Wave29のunit／assetを再選択せず、次の未レビュー要求source atom境界FR21〜23だけを対象にしました。候補値をmain確定値として扱わず、parentまたはmainが変わった場合は検証を停止します。push、PR、merge、Issue操作は行いません。

## 要求source

| requirement | IR span | raw span | semantic digest | product units |
|---|---:|---:|---|---|
| HIL-FR-21 | `requirements.json:2286-2328` | `:111` | `sha256:a79bd082626d912c3b5409a05370d985f697d5a8541ffff232dd32cd43f33806` | FR21-OS |
| HIL-FR-22 | `requirements.json:2329-2371` | `:112` | `sha256:05ec985410b6c7aaf1b3c49dc640401a94bf5c1a60e01459fad5d37dc89a64ce` | FR22-HARNESS / FR22-OS |
| HIL-FR-23 | `requirements.json:2372-2414` | `:113` | `sha256:62ae71f77c2fb2ea851d2a907a551428d21666ed8ba106d45e8c0f25c4c741a6` | FR23-OS |

| unit | product scope候補 | direct phase候補 | atom IDs | bounded / phase-product pool |
|---|---|---|---|---:|
| `IRUNIT-HIL-FR-21-HELIX-OS` | HELIX-OS | unknown | `FR21-OS-A01` | 3499 / 0 |
| `IRUNIT-HIL-FR-22-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-07 | `FR22-HARNESS-A01`、`A02` | 3054 / 103 |
| `IRUNIT-HIL-FR-22-HELIX-OS` | HELIX-OS | PHCAP-07 | `FR22-OS-A01`、`A02` | 3054 / 142 |
| `IRUNIT-HIL-FR-23-HELIX-OS` | HELIX-OS | unknown | `FR23-OS-A01` | 3536 / 0 |

FR21、FR22、FR23のsource span overlapはありません。FR22 HARNESS／OSもsource atomを共有していません。shared atomは全unitで空配列です。product boundary、phase authority、successor assignmentはhuman review pendingです。

## asset roleとunknown境界

各unitの3 edgeは同一要求asset、productに近接するdesign asset、implementation source候補assetです。FR21は `48A992...`／`41C752...`、FR22 HARNESS／OSは `467400...`／`B5C4...`、FR23は `310E...`／`44C4...` を参照します。選択assetはWave1–29の旧implementation／design assetと重複しません。

要求edgeだけを同一要求IDのexact static contractとしてconfirmedにし、design／implementationの8 edgeは `unresolved` としました。implementationは `unknown`、縮退・failure・consumer closureは未確定、legacy runtime/test/CIは `not_run` です。FR23のdesign候補は物理schema／projectionに関する近接証拠であり、product connector registryの直接実装・意味一致を示しません。bounded search membershipは意味一致、採用、現行実装の証拠ではありません。

旧archiveはsource、判断史、failure、consumerを調査するためだけに静的参照しました。旧workflow、CLI、hook、adapter、runtime、test、CIを実行せず、候補から下流pairや新規buildを生成していません。

選択assetのdispositionはcatalog／disposition台帳で `Historical`、`historical` authority、`unresolved`、`unknown` implementation、空のconsumer refsを確認しました。implementation source候補のreuse exclusionと未充足migration preconditions（atom inventory、product owner、parent binding、consumer、rights、executability、secret、external effect）を保持し、failure／consumer closureを未確定のまま残しています。
