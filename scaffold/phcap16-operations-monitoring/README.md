# PHCAP-16 Operations／Monitoring research premise candidate

これはPHCAP-16「運用・監視」の静的semantic review候補である。対象product unitはHELIX-OSとHELIX-Web-OSの2件で、候補edgeは15件に固定する。正式authority、要求採否、owner、successor、current implementation、operation、acceptance、releaseは生成しない。

## 固定した調査範囲

- capture時点の`origin/main`は`569d7373c32287bbafadeec6043472563937c5c7`。Wave23の未merge状態を前提にし、Wave23をこの候補のauthorityやbaselineへ変換しない。
- 旧assetは、lifecycle operations要求、CI execution telemetry設計、observability provenance実装source、CI telemetry test source、lifecycle operations acceptance test designの5件である。旧assetのsource、判断史、failure、consumerをread-onlyで照合した。
- phase inventoryの`implemented_partial_with_tests`と、selected assetの`implementation_status=unknown`／`legacy_execution_performed=false`を別の事実として保持した。旧runtime、test、CI、hookは実行していない。
- HELIX-OSはprojectの配備・監視・log・証拠・incident・復旧・保守・改善候補の統制候補、HELIX-Web-OSは展開後tenant／Connector／job／service runtimeの所有候補とする。両者はversioned export／receipt／proposal候補で接続し、event store、credential、tenant state、writer、release authorityを共有しない。

## unknownと残差

現行参照は対象別L2、境界、旧NIO対応表の文書候補に限られる。product-specific L3/L10/L11/L12、SLO、RTO/RPO、retention、environment、operator、failure execution receipt、consumer read-after、decision recordは未成立またはunknownである。decision ledgerのselected asset該当は0件、consumer closureは0件、failure execution receiptは0件である。source中のfailure／consumer記述は候補findingであり、実行・合格・閉鎖を示さない。

`inventory.json`には5 selected assetの正確なsource path、archive source hash、line span、ledger snapshot、failure／consumer候補、2 product unit、15 candidate edge、current direct ref、再baseline停止条件を記録する。archive pathは参照としてだけ保持し、Bindingのupstreamには現行台帳・現行境界・candidate artifactのみを登録する。

## 静的検証

```text
python3 scaffold/phcap16-operations-monitoring/validate.py
python3 scaffold/phcap16-operations-monitoring/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

上記は候補のschema、digest、exact span、ledger状態、unknown境界、負例、staleを確認する静的検証である。旧archiveのruntime／test／CI／hookや新世代CIは実行しない。

## Binding

`scaffold/bindings/SCF-B-0028.json`は、この候補の暫定役割を登録する未使用Bindingである。正式artifactが成立した場合は、SCFのreplacement手順で置換・retireする。Bindingは現行pathだけをupstreamとし、旧assetのsourceをcopy・実装・oracleへ昇格させない。
