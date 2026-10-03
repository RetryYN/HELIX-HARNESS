# Wave40 legacy semantic review Scaffold

この候補は最新main `origin/main=f07602eef199048ba27200f81b78e838926cae8b` を静的入力基点に、旧IRから未レビューの5 unitを研究候補として保持する。`SCF-B-0070` にresearch Bindingとして登録し、正式要求、現行owner、authority、phase admission、implementation、degradation、consumer closureは確定しない。#2018／`SCF-B-0069`とは別IDで、採番衝突を避けている。

対象は `HIL-BR-20` のHARNESS候補、`HIL-FR-04` のOS候補、`HIL-FR-33` のOS候補、`HIL-NFR-03` のOS候補、`HIL-NFR-05` のOS候補である。BR20、FR04、FR33、NFR03は旧decompositionのsource spanを意味単位候補として保持し、切断判断が未確定な5 unitには各1件の`composite_unresolved`を別計数する。8 source atom、11 role edgeを記録した。

FR33とNFR05はcrosswalkの`phase_and_product_candidate_asset_count=0`であり、requirement source edgeだけを保持した。design／implementation_sourceは4件のmissing evidence receiptへ記録し、current implementation、degradation、consumer closureをunknown／pendingに留めた。assetや旧台帳の存在を実装証拠へ変換していない。

旧sourceは`requirements.json`と保存Markdownの対応行を逐語照合した。asset catalog、disposition、decision、copy/read-after、failure／consumerの記録は静的に読み、旧consumer（例: `CiQuarantineManager`、`UniversalReverseGate`、`BunDependencyCoverageGate`、`IntakeTrustGate`）とfailure scopeはhistorical ledger onlyとしてinventoryへ保持した。旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していない。

候補productはdecomposition／crosswalkが示すHARNESS／OS候補だけを保持する。Web／Web-OSの直接根拠を追加せず、旧UI語・旧HARNESS語から単独routingを推定しない。`candidate_product_targets`、`candidate_target`、`phase_candidates`は人間review待ちで、authority effectは`none`である。

生成・検証は以下だけを用いる。

```text
python3 -B scaffold/legacy-semantic-review-wave40/generate.py
python3 -B scaffold/legacy-semantic-review-wave40/validate.py
python3 -B scaffold/legacy-semantic-review-wave40/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py`はlatest mainのancestor、source digest、unit／edge／atom keyset、catalog source／decision／failure／consumer receipt、prior overlap、missing evidence、product／phase／implementation／degradation境界をfail-closedに検査する。`selfcheck.py`は本体validator経路で12件の負例を拒否する。
