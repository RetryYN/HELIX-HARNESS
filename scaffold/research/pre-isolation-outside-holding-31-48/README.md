# outside-67 第31〜48行の静的照合候補

PR #1978 の outside-67 source set（親コミット `d272a97b3e55401fa75ad41670fbeefd18f8a4cf`）から、global item 31〜48を固定したread-only研究候補です。各行は要求atomではなく、source pathとpre-isolation／archiveの`path_revision_pair`です。

18件はすべて`docs/governance/audits/l2-requirements/`配下です。pathから得られるのは`shared-cross-product`と`upstream-governance-or-crosswalk`という候補ラベルだけで、四製品owner、phase authority、要求採否、完了を確定しません。

| 項目 | 静的所見 |
|---|---|
| 対象 | `OUTSIDE67-PATH-031`〜`048`の18件 |
| 製品候補 | shared-cross-product 18件（path-based candidate only） |
| phase候補 | upstream-governance-or-crosswalk 18件（path-based candidate only） |
| 実装 | unknown 18件。path／blob catalogは実装を証明しない |
| 縮退 | unknown 18件。archive blobのsame／differentだけから意味差分を推定しない |
| semantic inclusion | unknown 18件。13 holdingへの物理的不一致は意味的非包含を証明しない |
| archive blob | 同一13件、相違5件 |
| archive root／current capture `3df81ad` | 全18件に存在しない |
| 既存13 holding | path／blob／SHAの完全一致は全件0 |
| 新holding要否 | 未解決候補。意味的非包含は未証明 |

13 live holdingは、親コミット時点のmanagement registerを保全した`management-provisional-requirement-register-pre-append-3df81ad.jsonl`で`supersedes`終端を再計算した歴史的スナップショットです。後続mainや別PRのholding追加・更新を取り込まず、比較分母を変えません。`inventory.json`にはsource set、register、既存333 path holdingのdigestと、各行のGit object／SHA／bytesを保持しています。

候補は`SCF-B-0043`に束縛した`scaffold/`内のresearch evidenceです。正式なsource holding、requirement identity、四製品owner、phase authority、implementation、degradation、semantic disposition、successor、consumer closure、acceptance、releaseは生成しません。旧archiveはGit objectの静的読取だけに使い、旧runtime／test／CI／hook／adapter／sourceを実行しません。

## 静的検証

```text
python3 scaffold/pre-isolation-outside-holding-31-48/generate.py
python3 scaffold/pre-isolation-outside-holding-31-48/validate.py
python3 scaffold/pre-isolation-outside-holding-31-48/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py`はfindings／prohibited_inferenceのexact textとinventory、row、13 holding relationのrecursive keysetを固定する。`selfcheck.py`はbaseline greenを確認し、23件のnegative caseで期待error codeを照合する。no-op mutationは受け入れない。
