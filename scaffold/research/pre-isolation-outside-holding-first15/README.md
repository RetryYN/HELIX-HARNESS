# outside-67 先頭15 direct product path監査候補

最新 `origin/main=3524e3dcc092500969046f2545b55e835c87512f` から、既存のoutside-67 reportを入力にして、四製品ディレクトリ配下のpath順先頭15件を静的に監査した候補です。対象はHARNESS 4件、OS 4件、Web 3件、Web-OS 4件で、phase labelはL1 4、L2 4、L11 3、product READMEのshared-design 4です。READMEは直接製品ディレクトリ配下のpathとして選ばれていますが、path存在を要求atomや正式責務とは扱いません。

## 13 live holdingsとの関係

management provisional registerの3df81ad pre-append snapshot 32行からsupersedes終端を再計算し、historical live source holding 13件を固定しました。対象15件は13 holdingすべてについて、source path、pre-isolation blob OID、pre-isolation SHA-256の完全一致が0件です。append後のcurrent registerは14件ですが、この候補は旧13件の観測を14件へ置換せず、snapshotを読みます。従って各pathの状態は `not_in_any_of_13_live_holdings`、`unresolved_new_holding_needed` としています。これは保存先検討の残差であり、source_holdingやrequirement_candidateを自動登録しません。

各pathについて、pre-isolation commit、archive commitのblob OID／SHA／bytes、同一／相違、archive rootの有無、最新HEADのpath状態を保持しました。15件すべて最新HEADには存在せず、旧asset catalogとの一致もoutside-67 report上で0件です。

## 境界

product／phaseはpath prefixと既存reportの分類を保持した候補、implementationはpath／blob catalogからは証拠なしのunknownです。旧archiveはGit objectの静的読込だけで、旧runtime、test、CI、hookは実行していません。source blobの同一性は意味同値、authority、採否、実装、完了を意味しません。

候補は `scaffold/` 内だけに置き、正式なholding、要求identity、product owner、phase authority、successor、consumer closure、acceptance、releaseを生成しません。

## 検証

```text
python3 scaffold/pre-isolation-outside-holding-first15/generate.py
python3 scaffold/pre-isolation-outside-holding-first15/validate.py
python3 scaffold/pre-isolation-outside-holding-first15/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```
