# Wave43 legacy semantic review Scaffold

このScaffoldは `origin/main=f805a12cc16d2c776107ae224349e8863c8b602f` をbaseに、旧IRの未review unitから次の5 unitを静的分類する研究候補である。Bindingは `SCF-B-0077`。正式要求、現行owner、authority、phase admission、implementation、degradation、consumer closureは確定しない。

対象は `HIL-NFR-12` OS、`HIL-NFR-13` OS、`HIL-NFR-15` HARNESS／OS、`HIL-NFR-19` HARNESS。旧requirements JSON、保存markdown、decomposition source spanを逐語保持し、12 role edge、8 semantic atom、5 composite unresolved、3 missing evidence receipt、8 selected role asset、12 inspected assetを記録した。NFR-15の `commit/tree digestと直前段receiptへbind` はHARNESS／OSのtyped shared relationとして保持している。複合文の未分割条件はatom数へ水増しせず `composite_unresolved` として別計数した。

旧bootstrapの候補scopeはHARNESS／OSであり、Web／Web-OSの直接要求scopeではない。218 unitの分母を四製品の完了率と解釈しない。旧authority ID、historical consumer、failure codeは旧判断史の記録であり、現行権限・実装・縮退・phase admission・consumer closureへ昇格しない。NFR-12 OSのphase/product intersectionはzero、NFR-13 OSはimplementation_source候補なしとしてmissing evidenceへ分離した。

旧asset catalog、crosswalk、decomposition、source relation、disposition、decision、copy/read-after、failure／consumer台帳を静的に読み、source path・digest・判断史・failure code・historical consumerを保持した。旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していない。

検証は次のScaffold静的経路だけで行う。

```text
python3 -B scaffold/legacy-semantic-review-wave43/generate.py
python3 -B scaffold/legacy-semantic-review-wave43/validate.py
python3 -B scaffold/legacy-semantic-review-wave43/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py`はlatest-main ancestor、source digest、unit／edge／atom keyset、bounded candidate search、asset catalog／decision／failure／consumer receipt、prior ledger再集計、同一batch内のnon-requirement asset重複、NFR-15 shared relation、missing evidence、authority／phase／implementation／degradation boundaryをfail-closedに検査する。`selfcheck.py`は本体validator経路で17件の負例を検査する。

候補はDraft PRで意味reviewへ渡し、正式化、採否、merge、release、deployment、旧archive実行はreview側境界に従う。このBindingの `replacement.issue=0` はDraft PR未割当を表すtracker sentinelであり、PR番号を推定しない。
