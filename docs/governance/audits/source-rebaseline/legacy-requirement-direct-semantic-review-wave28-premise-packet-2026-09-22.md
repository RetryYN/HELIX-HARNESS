# Wave28 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE28-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave28`
- branch: `docs/legacy-semantic-review-wave28`
- candidate parent／current tree／main base: `b27e61f079edf64eeddc43eb8095159b19730b94`
- Wave27 merge commit: `b27e61f079edf64eeddc43eb8095159b19730b94`（mainへmerge済み）
- main merge parents: `3df81ad27157c471e004083783f37a5860eaa2ee`、`bd468075abd1c1a95c655acdc9cd00b8fe1d898a`
- rebaseline stop: `origin/main`または上記merge lineageが進んだら停止して再読込
- scope: 6 units / 18 asset edges / 6 confirmed requirement edges / 12 unresolved candidate edges
- cumulative: 89 units / 264 asset edges / 残り129 units（全218 units）
- authority effect: `none`; consumer closure: `pending`; legacy execution: `not_run`; new build: `false`

Wave27の未merge stacked依存はありません。Wave27は main に取り込まれたため、Wave28は `b27e61f` を直接基準にしています。mainが先へ進んだ場合は、候補値をmain確定値として扱わず、入力digest、prior lineage、親revisionを更新するまで停止します。commit、push、PR、merge、Issue操作は行いません。

## 要求sourceとatom

| requirement | IR span | raw span | semantic digest | product units |
|---|---:|---:|---|---|
| HIL-FR-13 | `requirements.json:1942-1983` | `:103` | `sha256:8472fdc576a52718f2d43f49e410565600d8fc3c0b374110dfad8886e37ccb50` | FR13-OS |
| HIL-FR-14 | `requirements.json:1985-2026` | `:104` | `sha256:32c9cca689abf14f1a6dba50ff9144ff11791ba29f625b5eb1e4d41abeffff35` | FR14-OS |
| HIL-FR-15 | `requirements.json:2028-2069` | `:105` | `sha256:73dfa183c290d8b7f4e9698e5933b93c4643d9347a6ef8256cdb4c9d95a33ed0` | FR15-OS |
| HIL-FR-16 | `requirements.json:2071-2112` | `:106` | `sha256:3f8059576753f54ac5cbc51a29d19afcc1189f6aee6403196ff3ac7540b0c574` | FR16-OS |
| HIL-FR-17 | `requirements.json:2114-2155` | `:107` | `sha256:6c714b85354c436aadad677cb1a379eb4f0ba007f847eec60391618fb07573c7` | FR17-HARNESS / FR17-OS |

| unit | product scope候補 | direct phase候補 | atom IDs | bounded / pool |
|---|---|---|---|---:|
| `IRUNIT-HIL-FR-13-HELIX-OS` | HELIX-OS | PHCAP-08 / PHCAP-10 | `FR13-OS-A01` | 2084 / 437 |
| `IRUNIT-HIL-FR-14-HELIX-OS` | HELIX-OS | PHCAP-19 | `FR14-OS-A01` | 2451 / 413 |
| `IRUNIT-HIL-FR-15-HELIX-OS` | HELIX-OS | PHCAP-03 / PHCAP-07 | `FR15-OS-A01` | 2008 / 199 |
| `IRUNIT-HIL-FR-16-HELIX-OS` | HELIX-OS | PHCAP-04 | `FR16-OS-A01` | 2459 / 28 |
| `IRUNIT-HIL-FR-17-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-03 / PHCAP-05 / PHCAP-06 | `FR17-HARNESS-A01`–`A03` | 3153 / 279 |
| `IRUNIT-HIL-FR-17-HELIX-OS` | HELIX-OS | direct phase候補なし | `FR17-OS-A01`、`A02` | 3153 / 0 |

FR13〜16は各1 atomです。FR17-HARNESSは screen applicability、prototype trigger、specialist capability、FR17-OSは no-UI skip と prototype/not-applicable receipt の別spanです。FR17のHARNESS／OS間にshared atomは記録していません。全atomのproduct boundary判定は human decision pending です。

## selected candidate asset role

各unitは requirement、design、implementation_source の3 edgeです。selected assetは catalog classification、source SHA、excerpt SHA、line boundsをledgerへ固定しました。過去Waveで使用済みの実装assetは選択せず、FR13は `cross-verifier.ts`、FR14は `module-decomposition.md`、FR17は `screen-applicability-prototype.md` の未使用catalog assetを使っています。FR17-HARNESS／OSは同じdesign／implementation assetを別atomの候補証拠として参照します。

- FR13-OS: requirement `A60CF…`、design `1E127…`、implementation `AD7B…`
- FR14-OS: requirement `A60CF…`、design `67B016…`、implementation `E193…`
- FR15-OS: requirement `A60CF…`、design `D088…`、implementation `74D116…`
- FR16-OS: requirement `A60CF…`、design `77ED…`、implementation `3B042…`
- FR17-HARNESS／OS: requirement `A60CF…`、design `51B78…`、implementation `FC956…`

design／implementationの12 edgeは semantic link `unresolved`、`legacy_execution_status=not_run`、`current_requirement_implementation_status=not_established`、`new_build_allowed=false` です。要求6 edgeだけが exact requirement source contract として `confirmed` です。bounded searchの候補数は意味一致や採用の証拠ではなく、catalog source pathへアンカーを適用した探索receiptです。

旧archiveのruntime、test、CIは実行していません。旧assetの判断史・failure・consumerの未確定を closure と解釈せず、4-product candidate集合と全218 unit denominatorを維持します。product、phase、implementation、degraded、failure、consumer、authorityのunknownを下流成果へ昇格しません。

## 保留

product boundary、phase authority、consumer closure、successor assignment、current implementation、degraded／failure assessment、acceptance receipt、source atomの独立判断を未確定のまま保持します。`origin/main`またはmerge lineageが変化した場合はrebaseline stop conditionを適用します。
