# Wave38 legacy semantic review candidate

このScaffoldは、`origin/main=f369e2fd400a02104a67645dca681721989d63be` を基点に、Wave1〜37で未レビューの旧要求unitから3件を選び、旧requirements／design／implementation source chainをschema10 research premiseとして保持する。旧archiveは静的な意味・asset分類・判断史・failure・consumer照合だけに使い、実行しない。

対象は次の3 unitである。

- `IRUNIT-HIL-NFR-02-HELIX-OS`: worker／verifier／knowledge promoterの分離とCodexの最終audit・close・memory昇格の自己承認禁止。source spanは分解台帳が示すCodex条件を保持し、親文のworker関係もsource_statement_textに残す。
- `IRUNIT-HIL-NFR-06-HELIX-OS`: 高影響操作にaction-binding approvalを要求する条件。phaseは直接候補なしで、HARNESS／OS／Web-OS境界の共有可能性を未決定のまま保持する。
- `IRUNIT-HIL-TR-07-HELIX-OS`: SQLite/harness.dbのcontrol-plane投影、Python read model／Node write authority分離、L4でのwrite authority変更決定。複数関係を一つのcomposite source atom候補として保持し、分割判断は独立reviewへ残す。

各unitはrequirement、design、implementation_sourceの3 edge、合計9 edge、source atom候補3件を持つ。親文に複数関係を含むため、3 unitすべてをcomposite_unresolvedとして別計数する。旧分解218 unit、Wave1〜36の145 unit／432 edge、Wave37の3 unit／9 edge、Wave38の3 unit／9 edgeから、累積151 unit／450 edge、残り67 unitとなる。product scopeは旧decompositionの `HELIX-OS` 候補を保存するが、現行owner・authority・successor・実装成立・縮退・phase admission・consumer closureは確定しない。Web／Web-OSへの単独routing根拠も生成しない。

`generate.py` は入力source、catalog、crosswalk、decomposition、prior Wave1〜37 ledger/metaを静的に読み、同じ入力からledger/metaを決定的に再生成する。`validate.py` はschema10、exact source anchor、source digest、asset非重複、prior lineage、phase/product候補、累積分母、unknown境界をfail-closedに検査する。`selfcheck.py` は本体validator経路でstale anchor、role inversion、意味注入、既済asset再利用を拒否する。

旧archiveのruntime、test、CI、hook、adapter、sourceは実行していない。候補のPASSは正式要求、現行実装、権限、phase、consumer、採否、release、deploymentを意味しない。

```text
python3 -B scaffold/legacy-semantic-review-wave38/generate.py
python3 -B scaffold/legacy-semantic-review-wave38/validate.py
python3 -B scaffold/legacy-semantic-review-wave38/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```
