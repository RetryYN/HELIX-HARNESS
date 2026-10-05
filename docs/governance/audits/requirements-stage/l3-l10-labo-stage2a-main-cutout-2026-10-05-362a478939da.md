# HELIX-LABO Stage 2a main cutout — 2026-10-05

この記録は、HELIXLABO-L2-055/056/057のStage 2a suffixを、指定main `1fcd83982bbb93c0630951c80dfd076e98caa54c` 上の6つのStage 1本文へ追記した作成側の静的証拠です。本文commitは `362a478939da97249cfbe47f3fceec1eb7d95549`。対象は6 canonical文書だけで、各Stage 1 prefixは指定main時点のbytesを6/6保持し、旧Stage 2a cutout commit `cf8c41f73b436d5cc088d2fc67ee3dbc1e40b98a` からStage 2a suffixのみを移しています。Stage 2b本文は含みません。

固定L2/L11は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO採択行は `633bf12ea8f948db8ba3d6600179c4a9507377a7`、G0順序表は指定mainの実体をsource pinしました。旧L3定義、LABO-Bench旧要件、旧L10 test designを含む旧source pin 26件を再計算し、全件のfull-file SHAとLF-inclusive span SHAが一致しました。旧test/runtime/CI/Bunは実行していません。

本文の範囲は3 FR、10 AC、36個の固有L10 CASEです。NFR候補と対応する測定行は各4行。L3/L10の独立business outcomeは固定親から導かれないため、BR/BVは機能要件・検証参照だけを維持しています。親ごとのFR/AC/CASE関係はJSONのtrace mapに収録しました。

過去のStage 2a static auditとPO summaryは、旧 `cf8c41f` のsnapshotとしてbytesを変えず同じpathで保持しました。本監査はその過去記録を上書きせず、今回のmain prefix、body revision、current source pins、159行の追加領域、現行行hashを別に固定しています。

GitHub APIのread-only照会はsource commit `cf8c41f...` を「No commit found for SHA」と返しました。ローカルgit objectは存在していたため、そのexact objectからsource本文と履歴を読みました。API応答だけからcommit削除やprivate状態は推定していません。

静的検証は `scfctl validate` 147 bindings / 0 failures、`stale=0`、`residuals=0`、`govcheck: ok atoms=7622 requirements=57 files=58`、`git diff --check` passでした。これらは独立review、root最終検収、L3承認、実装許可、実測、L10実証を意味しません。過去C13/M9/minor/unreviewed carryもこの作業から解消扱いしていません。

詳細な35 source pins、6 prefix/suffix/body SHA、36 CASEとACの対応、159 current line pins、historical carry、検証限界は隣接するJSON監査記録を参照してください。
