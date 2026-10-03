# Status

- state: `research_scaffold_findings_only`
- binding: `SCF-B-0090` registered
- base: `a8f1ab1c7dce529cfb5293e1ddf4a23140877f22`（#2040 merge後の latest `origin/main`、#2039 rebase先）
- base drift: #2039 の旧base `44814977d9…` から `a8f1ab1c7d…` へrebaselineした差分を scope に記録
- selected: `028, 039, 040, 042, 044` / 5 source pairs / 25 exact anchors
- source accounting: provisional `62/67`, residual `5`, formal holding admission `false`
- pre/archive relation: `028,039,040,042,044=same`
- current counterpart relation: 全 5 件が path relocation。各 hash関係は receipt として保持
- four products: candidate boundary only; product owner／phase authority `unknown`
- implementation／degradation／failure／consumer／decision: 全件 `unknown`
- old ledger exact ID/path hit: `0`
- old runtime／test／CI execution: `false`
- next batch width: 5 は観測した検証幅であり、安全な上限を主張しない。次回は latest main から独立再照合する
