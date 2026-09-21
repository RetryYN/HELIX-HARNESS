# outside67 global ordinal 49–67 分類候補

この束は、PR #1978 のsource setを固定した `d272a97b3e55401fa75ad41670fbeefd18f8a4cf` 上で、outside-67 reportのglobal ordinal 49–67（19件）を静的に分類する研究用Scaffoldです。対象は要求atomではなく、pre-isolation／archiveの `path_revision_pair` です。

13 live holdingの比較基準は`docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl`に保全した親d272時点のhistorical snapshot（register SHA `4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b`、capture `3df81ad27157c471e004083783f37a5860eaa2ee`）に固定します。main/baseが進んでもこの束は静かに追随せず、現行mainへ移す場合はread-afterと再baselineを先に行います。

path prefixと既存reportが示す四製品候補、phase候補を保存します。分類は候補であり、製品責務、phase authority、要求identity、successorを確定しません。全19件について実装状態、劣化状態（failure／degraded／unimplemented）、semantic inclusionはunknownです。path、blob、SHAの一致はsemantic inclusionや実装を証明しません。

各itemは、pre-isolation commit `2d4991042be55268bac30a8bbcdac45b3865030a` とarchive commit `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658` のblob OID・SHA-256・bytes・same/different、historical capture `3df81ad27157c471e004083783f37a5860eaa2ee` のpath状態を保持します。management provisional registerをsupersedes終端まで再計算し、歴史的13 live holdingについてpath／pre-isolation blob／pre-isolation SHAをexact scanします。ordinal 58にはpath文字列参照が1件ありますが、blob／SHA包含ではないためsemantic inclusionはunknownのままです。

正式register、Issue、PR、DB、memory、外部APIには書き込みません。旧archiveはGit objectのread-only照合だけに使い、旧runtime、test、CI、hook、adapterは実行していません。Scaffoldの検査結果は正式な実装、受入、承認、完了を意味しません。

## 検証

```text
python3 scaffold/outside67-global-49-67/generate.py
python3 scaffold/outside67-global-49-67/validate.py
python3 scaffold/outside67-global-49-67/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`generate.py` は固定reportとGit objectから `inventory.json` と `source-items.jsonl` を再生成します。`validate.py` はgeneratorをimportせず、findings／prohibited_inferenceのexact text、inventory／source-item／nested relationのrecursive keyset、report、Git object、13 holding、digest、unknown境界を独立に再計算します。`selfcheck.py` はbaseline greenを確認し、authority昇格、product／phase／implementation／degradation／semantic inclusion昇格、blob／holding改変、旧実行記録、findings／keyset改変の19 negative caseを期待error code付きで確認します。no-op mutationは受け入れません。
