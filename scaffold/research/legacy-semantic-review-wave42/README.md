# Wave42 legacy semantic review Scaffold

この候補は `origin/main=74f724b4699feca7f9f2e87e939fe6578f75669e` を基点に、旧IRの未review unitから次の5 unitを静的に分類する研究Scaffoldである。Bindingは `SCF-B-0075` とし、正式要求、現行owner、authority、phase admission、implementation、degradation、consumer closureは確定しない。

対象は `HIL-NFR-09` の HARNESS／OS、`HIL-NFR-11` の HARNESS／OS、`HIL-NFR-12` の HARNESS である。旧JSON、保存markdown、decompositionのsource spanを保持し、11 role edge、11 semantic atom、5 composite unresolvedを記録した。NFR-09の3共有fragment（Linux primary、adapter contract test、OS別logic fork禁止）は両unitのtyped shared relationとして保持し、単語や文節を別要求へ水増ししていない。

旧bootstrapのunit候補はHARNESS／OS scopeであり、Web／Web-OSの直接要求scopeを示さない。四製品routing、現行authority、実装、縮退、phase admissionはunknown／pendingである。NFR-11／12 HARNESSのimplementation_sourceはcandidate poolが過去waveで消費済みのため未使用assetを再計上せず、NFR-11 OSのdesign／implementation pool zeroと合わせて4件のmissing evidence receiptへ記録した。

旧asset catalog、crosswalk、decomposition、source relation、disposition、decision、copy/read-after、旧failure／consumer台帳を静的に読み、source path・digest・判断史・failure code・historical consumerを保持した。`OsContractRunner`／`ScreenGate`／`CapabilityCoverageGate`、旧authority ID、failure code、consumerはhistorical ledger onlyであり、現行権限・実装・縮退・consumer closureではない。旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していない。

検証はScaffoldの静的経路だけで行う。

```text
python3 -B scaffold/legacy-semantic-review-wave42/generate.py
python3 -B scaffold/legacy-semantic-review-wave42/validate.py
python3 -B scaffold/legacy-semantic-review-wave42/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py`はlatest-main ancestor、source digest、unit／edge／atom keyset、candidate search、asset catalog／decision／failure／consumer receipt、prior non-overlap、shared source relation、missing evidence、authority／phase／implementation／degradation境界をfail-closedに検査する。`selfcheck.py`は本体validator経路でsource span、shared relation、product routing、authority／phase／implementation promotion、missing evidence改変など14件の負例を検査する。
