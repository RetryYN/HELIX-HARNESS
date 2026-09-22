# Wave37 legacy semantic review candidate

このディレクトリは、現行main `562e176c36844474b63424ec06beefe2f7722d18` を基点に、既存Wave1–36で未レビューの旧NFR source chain 3件をschema10 research premiseとして保持するScaffold候補です。

対象は `IRUNIT-HIL-NFR-01-HELIX-OS`、`IRUNIT-HIL-NFR-10-HELIX-OS`、`IRUNIT-HIL-NFR-19-HELIX-OS` です。各chainは旧requirements source、旧design source、旧implementation sourceを1件ずつ結び、旧sourceの意味spanと逐語anchorを保存します。NFR-19はOS候補unitに対応する2つのsource spanを保持します。NFR-19の親分解にはHARNESS候補unitもありますが、このbatchには含めていません。

分母は旧分解台帳218 unit、Wave1–36既済145 unit／432 edge、Wave37候補3 unit／9 edge、累積148 unit／441 edge、残り70 unitです。assetのcatalog候補、phase候補、現行四製品routing、実装・縮退・consumer closure・authorityは別々に保持し、candidateから昇格させません。WebとWeb-OSへの直接根拠はこのsliceで主張しません。

`generate.py` は台帳・crosswalk・catalog・旧source snapshotを静的に読み、同じ入力からJSONLとmetaを決定的に再生成します。`validate.py` はsource digest、evidence excerpt、atom provenance、四製品候補、phase projection、既存edge／asset非重複、prior lineage、分母、role別fail-closed語彙を検査します。`selfcheck.py` はvalidatorを通した後、stale anchor、role semantic inversion、current implementation意味の注入、既済asset再利用を拒否する負例を実行します。

旧archiveのruntime、test、CI、hook、adapter、sourceは実行していません。正式要求、successor、現行実装、phase admission、採否、consumer closure、release、deploymentは未決定です。

```text
python3 -B scaffold/legacy-semantic-review-wave37/generate.py
python3 -B scaffold/legacy-semantic-review-wave37/validate.py
python3 -B scaffold/legacy-semantic-review-wave37/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```
