# 既存218 evidence partitionを固定BASEから独立再集計する研究束（SCF-B-0146）

## 概要

既存9 evidence partitionを固定BASE `94d99ebb4c55c2edb0575ac2dc100af0d5b93b90` のGit object bytesから独立再導出し、218 recordの状態境界を研究正本として固定します。217 product unitと1 connection (`IRCONN-HIL-BR-09-HARNESS-OS`) を分離し、598 semantic review edgeと355 unique old assetを記録します。

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

`validate.py`は`build.py`をimportせず固定BASEから再導出します。BASE祖先性、canonical input digest、source record集合、217／1分母、598 edge集合、355 asset集合、per-record重複、7 status、required evidence schema、authority noneをfail-closeで検査します。focused-investigationは固定7要求ID／10 unit候補閉包、Binding artifact／archive manifest digest、status非昇格を検査します。

`selfcheck.py`は次の18改竄を期待error code付きで棄却します。

- record、edge、assetの欠落と重複
- status partitionとrequired evidence schemaの改竄
- source／crosswalk／decomposition relation、top-level key、authority boundaryの改竄
- product unit／connection分母の改竄
- input digest、source partition宣言、BASE commitの改竄
- unimplemented statusの昇格
- focused investigationのunit欠落と重複

## 検証結果

実行結果は以下です。

- `build.py`: PASS（218 record／217 product unit／1 connection／598 edge／355 unique asset）
- `validate.py`: PASS
- `selfcheck.py`: PASS（18 negative cases）
- `py_compile`: PASS
- `scfctl validate`: PASS（132 bindings、fail 0）
- `scfctl stale`／`residuals`: PASS（0／0）
- `git diff --check`: PASS

旧archive、旧runtime、旧test、旧CIは実行していません。formal authority、implementation claim、acceptance、successor、crosswalkは変更していません。#1813へ進捗参照のみを付します（Closesなし）。
