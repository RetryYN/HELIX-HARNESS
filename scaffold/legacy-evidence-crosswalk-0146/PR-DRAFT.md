# 既存218 evidence partitionを固定BASEから再集計する研究束（SCF-B-0146）

## 概要

既存9 evidence partitionを固定BASE `94d99ebb4c55c2edb0575ac2dc100af0d5b93b90` のGit object bytesから再導出し、218 recordの状態境界を研究候補として記録します。217 product unitと1 connection (`IRCONN-HIL-BR-09-HARNESS-OS`) を分離し、598 semantic review edgeと355 unique old assetを記録します。builderとvalidatorは共通導出関数を使用します。

既存の#2083／#2085 20 unit bundleは入力oracleにしていません。source partition、crosswalk、decomposition、旧asset ledgerからunit／edge／asset集合と7 status fieldを再計算しています。

## 記録した境界

- old implementation: unknown 218/218
- old degradation: unknown 218/218
- old failure: unknown 218/218
- consumer: pending 218/218
- current implementation: unknown 218/218
- acceptance: unknown 218/218
- unimplemented: not_assessed 218/218

各fieldには、unknownを解除するためのartifact／relation／human decision schemaを記録しました。source存在、static coverage.failure、consumer reference、current requirement candidate、receipt不在はunit statusへ昇格させません。

## validator／負例

`validate.py`は`build.py`をimportせず固定BASEから再導出します。BASE祖先性、canonical input digest、source record集合、217／1分母、598 edge集合、355 asset集合、per-record重複、7 status、required evidence schema、authority noneをfail-closeで検査します。focused-investigationは固定7要求ID／10 unit候補の全内容を旧原文・asset ledger・固定archive snapshotから再導出して型付き比較し、参照blobをarchive manifestへ照合します。source-transfer manifestは転送時commitの歴史的snapshotとして検査し、現在の成果物digestとは混同しません。

`selfcheck.py`は次の33改竄を期待error code付きで棄却します。

- record、edge、assetの欠落と重複
- status partitionとrequired evidence schemaの改竄
- source／crosswalk／decomposition relation、top-level key、authority boundaryの改竄
- product unit／connection分母の改竄
- input digest、source partition宣言、BASE commitの改竄
- unimplemented statusの昇格
- focused investigationのunit欠落・重複、要求本文・受入atom・旧asset候補・L9行・statusの改竄
- transfer manifestの転送時commitとの不一致、成果物のbyte変更・並べ替え

## 検証結果

実行結果は以下です。

- `build.py`: PASS（218 record／217 product unit／1 connection／598 edge／355 unique asset）
- `validate.py`: PASS
- `selfcheck.py`: PASS（33 negative cases）
- `py_compile`: PASS
- `scfctl validate`: PASS（138 bindings、fail 0）
- `scfctl stale`／`residuals`: PASS（0／0）
- `git diff --check`: PASS

旧archive、旧runtime、旧test、旧CIは実行していません。formal authority、implementation claim、acceptance、successor、crosswalkは変更していません。#1813へ進捗参照のみを付します（Closesなし）。
