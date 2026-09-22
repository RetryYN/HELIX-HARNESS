# Wave44 legacy semantic review Scaffold

このScaffoldは `origin/main=ac33378e7846b6effc61110ed62971159e535ff5` をbaseに、旧IRの低複雑度候補からsource chainを静的分類する研究候補である。Bindingは `SCF-B-0078`。正式要求、現行owner、authority、phase admission、implementation、degradation、consumer closureは確定しない。

対象は `HIL-NFR-34/35/36/37/38/40` と `HIL-TR-02/03/09/10` のHELIX-OS候補10 unit。旧requirements JSON、保存markdown、decomposition source spanを逐語保持し、29 role edge、10 semantic atom、10 composite unresolved、1 missing evidence receipt、19 selected role asset、23 inspected assetを記録した。各unitは単一source spanを保持し、原文の複数義務は意味を補って分割せず `composite_unresolved` として別計数した。TR-10はcrosswalkのimplementation_source候補44件をasset ID単位で照合した。34件はprior/current usage、残る10件は今回静的examineしたがTR-10のharness.db論理分離との直接関係を確立できず、未examineは0件としてmissing receiptへ分離した。

候補productは旧bootstrapのHELIX-OSを保持する。Web／Web-OSの直接要求scopeや現行ownerを推定しない。旧authority、historical consumer、failure、decision、dispositionは判断史の記録であり、現行権限・実装・縮退・phase admission・consumer closureへ昇格しない。prior Wave1–43のdynamic countは176 unit／509 edge、Wave44後は186 unit／538 edge、残32 unitである。218 unitの分母を四製品の完了率と解釈しない。

旧asset catalog、crosswalk、decomposition、source relation、routing queue、disposition、decision、copy/read-after、failure／consumer台帳を静的に読み、source path・digest・判断史・failure code・historical consumerを保持した。選定non-requirement assetはbatch内で重複せず、prior Wave1–43のnon-requirement assetとも重複しない。旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していない。

検証は次のScaffold静的経路だけで行う。

```text
python3 -B scaffold/legacy-semantic-review-wave44/generate.py
python3 -B scaffold/legacy-semantic-review-wave44/validate.py
python3 -B scaffold/legacy-semantic-review-wave44/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py`はlatest-main ancestor、source digest、unit／edge／atom keyset、bounded candidate search、独立phase/product pool membership、TR-10 implementation poolのconsumed/examined/unexamined asset ID照合、asset catalog／decision／failure／consumer receipt、Wave1–43 prior ledger再集計、同一batch内non-requirement asset重複、missing evidence、authority／phase／implementation／degradation boundaryをfail-closedに検査する。`selfcheck.py`は本体validator経路で25件の負例を検査する。

候補はDraft PRで意味reviewへ渡し、正式化、採否、merge、release、deployment、旧archive実行はreview側境界に従う。このBindingの `replacement.issue=0` はDraft PR未割当を表すtracker sentinelであり、PR番号を推定しない。
