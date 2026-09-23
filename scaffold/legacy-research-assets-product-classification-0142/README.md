# SCF-B-0142 `docs/research/assets/**` 57件の四製品責務候補研究

`SCF-B-0142` は、現行main `7afee33ae892fe1a3cf1085fac4e02d923ece01d` の旧資産台帳から、`docs/research/assets/` 配下の未研究57件を抽出する research-only Scaffold Binding です。対象は Kimi review lane admission の10件・12件、S4 benchの20件、smoke rerunの15件で、入力prompt、判定receipt、候補出力、mutation結果、summaryを含みます。正確なID集合とsource path集合は `inventory.json` に固定しています。

`independent-source-audit.py` は生成済みclassification・generator・validatorを入力せず、固定BASEのdispositionから57件を独立に再導出します。全source blob 58,243 bytes／1,181 linesを静的に読み、mode `100644`、type `blob`、source SHA-256、`MANIFEST.sha256`、disposition digestを照合します。監査結果は `independent-source-audit.json` にasset IDごとに保存します。空stderr 5件はsemantic spanを持たず `insufficient_basis` に分離します。旧 `run-*.ts` はsource evidenceとして全文を静的に読むだけで、実行していません。

候補group countは `direct_product_basis=36`（review/smokeのpath group）、`multi_product_conflict=16`（非空S4 bench）、`insufficient_basis=5`（空source）です。path groupはper-asset product ownerの根拠ではありません。bootstrapには34件のphase candidateなし、22件のPHCAP-12候補、1件のPHCAP-15候補があります。`fixture3-notes.txt` のPHCAP-15行はHELIX-OSとHELIX-Web-OSの両方を挙げますが、smoke path groupのOS候補と食い違うため、独立監査で不一致として残します。全件の正式product、phase、implementationは未確定です。LABO分類は含めていません。

各recordは次を分離して保持します。

- 旧asset台帳・phase bootstrap行、source Git objectのsemantic span、四製品のproduct-boundary／L1／承認decision行
- 実装状態 `unknown`、historical document presence、旧実行を行っていないこと、未実装／縮退の未確定状態
- 旧判断史、failure inventory、consumer inventory、decision/read-after、consumer closure pending
- 50 wave入力の静的走査結果（対象57件の直接edgeは0件）
- `authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false`、`successor_assignment=null`

重複は現行main `7afee33a...` の496件、open PR #2090 `f075c91c...` の新規41件、#2094 `e5fc691c...` の新規72件に対して、asset ID、source path、source SHA-256、(ID, path, SHA)の各キーを個別に照合します。対象57件との重複とopen PR間の新規重複はすべて0件です。#2094内では異なるID/pathの2ファイルが同じsource SHA-256ですが、asset identityの重複ではありません。対象57件を加えた投影は666 ID/path/identity records、661 distinct source SHA-256です。対象sourceのSHAは53種類で、空stderr 5件が同じempty-content SHAを共有します。これは研究分母の投影であり、正式採否や完了ではありません。

dispositionは57件すべて `unresolved`、product targetも `unresolved`、implementation statusは `unknown` です。対象ID/pathに一致するdecision/read-after/failure/consumer/wave edgeは見つからず、consumer refsはすべて空です。これは間接consumerが存在しない証明ではなく、consumer closureは未解決のままです。

`generate.py` は現行mainとopen PRの固定HEAD Git objectを入力にし、`classification-research.jsonl`、`inventory.json`、Scaffold Bindingを再生成します。`validate.py` はstrict JSON、exact target set、category partition、source／archive／MANIFEST／ledger digest、四製品boundary/L1、phase、implementation、history/failure/consumer、wave edge、main／#2090／#2094 union overlap、全input digest、独立監査digest、Binding closure、authority boundaryをfail-closeで検査します。`selfcheck.py` は21件の負例をvalidatorへ実際に通し、欠落・重複・digest改竄・phase／implementation昇格・authority昇格・overlap改竄・audit digest改竄・archive mode改竄・duplicate keyを拒否します。

## 検証

```text
python3 -B scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.py
python3 -B scaffold/legacy-research-assets-product-classification-0142/generate.py
python3 -B scaffold/legacy-research-assets-product-classification-0142/validate.py
python3 -B scaffold/legacy-research-assets-product-classification-0142/selfcheck.py
python3 -m py_compile scaffold/legacy-research-assets-product-classification-0142/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していません。レビュー依頼、merge、Issue close、formal authority付与はこの束の責務外です。
