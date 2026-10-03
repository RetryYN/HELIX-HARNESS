# Wave41 legacy semantic review Scaffold

この候補は `origin/main=f83b277c6e3e9d48e3ce2f2b0faeed7ac2caf50f` を静的入力基点に、旧IRの未review unitから5 unitを研究候補として保持する。Bindingは `SCF-B-0072` とし、正式要求、現行owner、authority、phase admission、implementation、degradation、consumer closureは確定しない。

対象は `HIL-NFR-06` HARNESS、`HIL-NFR-07` HARNESS／OS、`HIL-NFR-08` HARNESS／OSである。旧sourceのproduct decomposition spanをsource semantic atom候補として保持し、5 unitすべてに `composite_unresolved` を1件ずつ残した。10 role edge、9 semantic atom、5 composite unresolvedを記録した。`HIL-NFR-06` OS unitはこのbounded batchの選定外であり、欠落を計上対象へ水増ししていない。

`HIL-NFR-07` のHARNESS／OSは、`complexity、public surface、運用負債を測り` と `拡張を拒否する` の共有接続をrelationとして保持した。NFRの句を単語ごとの要求へ分割していない。NFR-06／NFR-07 HARNESSのimplementation_source欠落とNFR-07 OSのdesign／implementation pool zero、NFR-08 HARNESSのimplementation_source欠落は5件のmissing evidence receiptへ分離した。

旧asset catalog、crosswalk、decomposition、source relation、disposition、decision、copy/read-after、旧failure／consumer台帳は静的に読み、source path・digest・判断史・failure code・historical consumerを保持した。`ActionBindingGate`、`ScopeAuthorityGate`、`EvidenceProvenanceGate`、`HIL_ACTION_BINDING_APPROVAL_MISSING`、`HIL_SCOPE_NECESSITY_MISSING`、`HIL_PROSE_ONLY_EVIDENCE`は旧台帳のhistorical referenceであり、現行権限・実装・縮退・consumer closureではない。旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していない。

候補productは旧decompositionのHARNESS／OSだけを保持する。asset catalogの候補productにWeb／Web-OSが含まれていても、そこから現行routingを推定していない。phase pool、current implementation、degradation、consumer closureはunknown／pendingである。

生成・検証は静的なScaffold経路だけを使う。

```text
python3 -B scaffold/legacy-semantic-review-wave41/generate.py
python3 -B scaffold/legacy-semantic-review-wave41/validate.py
python3 -B scaffold/legacy-semantic-review-wave41/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py`はlatest-main ancestor、source digest、unit／edge／atom keyset、candidate search、asset catalog／decision／failure／consumer receipt、prior non-overlap、missing evidence、共有source relation、authority／phase／implementation／degradation境界をfail-closedに検査する。`selfcheck.py`は本体validator経路でsource span、shared relation、product routing、authority／phase／implementation promotion、missing evidence改変などの負例を検査する。
