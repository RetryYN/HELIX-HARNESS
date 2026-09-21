# PHCAP-08／09 WBS・Ticket生成 調査 Scaffold

このディレクトリは、PHCAP-08（WBS）とPHCAP-09（Ticket生成）の旧資産を静的に照合する `research_premise_candidate` である。基準は `origin/main` の `b27e61f079edf64eeddc43eb8095159b19730b94`、取得日は2026-09-22、authority effectは `none` である。要求採否、successor、正式owner、実装、L2／L11受入、Issue／GitHub authorityは生成しない。

## 調査結果

PHCAP-08 の既存phase inventoryは、旧世代に同名WBS artifactがなく、PLAN、current-location、roadmap、state DBに等価能力候補があると記録している。この候補で台帳 `source_path` の `wbs`／`work-breakdown` 一致は0件、archiveのファイル名一致は0件だった。archive本文で `(?i)\bWBS\b|work[- ]breakdown` に一致したファイルは、隠しdirectoryを除く固定検索範囲で44件だった。本文語彙の一致はWBS資産identityを証明しないため、同名WBS資産数は0のまま、`PLAN-L6-01-function-spec.md`を未解決の近似候補として別記録にした。
phase inventoryの到達層はPHCAP-08が`L3`／`L7 implementation`（最大L7、explicit WBS assetなし）、PHCAP-09がcandidate requirements／acceptance／`L3 plan`（最大L3）である。このphase-level記述と旧sourceの存在は、現行implementation・縮退理由・実行済み受入を示さない。

PHCAP-09 は、旧asset dispositionのsource pathに `ticket` を含む9件を機械的に確認した。`execution-ticket-requirements.md`、`execution-ticket-acceptance.md`、`PLAN-L3-88-execution-ticket-bench-authority.md`の3件は23個のexact source spanで本文を展開し、残る6件はsource hash、line count、ledger state、phase classificationだけをticket catalogへ保持した。全9件で台帳の `disposition: unresolved`、`implementation_status: unknown`、`consumer_refs: []`、phase側の `legacy_execution_performed: false` を再確認した。

## 製品と接続の境界

- **HELIX-HARNESS** はV-model、workflow vocabulary、WBS normative shape、ticket contractの候補を持つ。WBS ledger、ticket issuer、Worker、CI、logの運転は所有しない。
- **HELIX-OS** はproject群のWBS ledger、progression、ticket発行・登録・統制の候補を持つ。HARNESSの規範語彙を独自に上書きしない。
- **HELIX-Web** は利用者向けdashboard・操作・成果表示の個別productであり、PHCAP-08／09の直接evidence、WBS／ticket owner、実装・受入は未確定である。
- **HELIX-Web-OS** はtenant・job・service state・配備・監視・復旧を担う独立service runtime候補であり、WBS／ticket authorityやwriter／credential／stateを共有しない。

HARNESS→OSのWBS normative shape→management ledger、HARNESS→OSのticket contract→issuerを候補接続として分離した。OS→Webのproject control、Web-OS→OSの許可されたlog／telemetry exportは隣接接続候補に留めた。単体、接続、構成体の成立を互いに推定しない。

旧本文にはfailure、negative、acceptance、consumer、traceの記述があるが、旧runtime／test／CIを実行していない。現行failure receipt、consumer closure、implementation、acceptance passは0／unknownである。旧sourceの `confirmed`、`approve`、test design、plan approvalは現行authorityへ昇格しない。

## 構成と検証

- `inventory.json`: 7代表asset、23 exact span、ticket path 9件、四製品unit・connection、WBS名監査、phase join、failure／consumer unknownを保持する。
- `generate.py`: archiveを実行せず、固定source／台帳のbytesとspanからinventoryを再生成する。
- `validate.py`: source／phase／decision ledger digest、archive bytes／span、WBS同名0／本文44、ticket path 9、四製品境界、unknown状態をfail-closeで検査する。inventory全階層のkeyset、unresolved本文、source spanのmeaning、Bindingのnegative case本文も独立pinで固定する。
- `selfcheck.py`: authority／equivalence／WBS identity／ticket catalog／実装／consumer／current execution、未知key、unresolved本文、span meaning、Binding negative caseの改竄を拒否する36陰性例を検査する。
- `scaffold/bindings/SCF-B-0041.json`: この候補の仮設束縛。正式artifactが成立した場合の差し替え先は未確定である。

検証は次で行う。

```text
python3 scaffold/phcap08-09-wbs-ticket-static/generate.py
python3 scaffold/phcap08-09-wbs-ticket-static/validate.py
python3 scaffold/phcap08-09-wbs-ticket-static/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
python3 scaffold/tools/scfctl.py selftest
```

旧archiveのruntime、test、CI、hook、adapterは実行しない。origin/mainが変化した場合は、この候補をcurrentと扱わず、台帳と本文のdigestを再取得してrebaselineする。
