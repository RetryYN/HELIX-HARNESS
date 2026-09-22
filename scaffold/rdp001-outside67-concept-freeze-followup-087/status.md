# Status

- state: `research_scaffold_findings_only`
- binding: `SCF-B-0087` registered
- base: `3cdde5dfedfc51ff7c757a2f5fb2eb11a3c6b64c`（#2034 merge後の latest `origin/main`）
- base drift: SCF-B-0085 の base `c5ed4587d…` から進行したため、差分を scope に記録
- selected: `017, 021, 025, 026, 027` / 5 source pairs / 25 exact anchors
- source accounting: provisional `57/67`, residual `10`, formal holding admission `false`
- pre/archive relation: `017,025,026,027=same`; `021=different`
- current counterpart relation: 全 5 件が path relocation、`017,025,026,027` は archive hash equal、`021` は content drift
- four products: candidate boundary only; product owner／phase authority `unknown`
- implementation／degradation／failure／consumer／decision: 全件 `unknown`
- old ledger exact ID/path hit: `0`
- old runtime／test／CI execution: `false`
- next batch width: 5 は観測した検証幅であり、安全な上限を主張しない。次回は latest main から独立再照合する
