# WR181 OS015 PR-A: L4/L9限定候補

## PR区分と範囲

- PR class: `design_verification`
- 対象V-pair: HELIX-OS OS015 L4/L9
- 基点: main `821a655ad6949b2a7a5344b26e3c170cccc353a6`
- この候補はL4に2件のcomposite failure classification、L9に独立確認済み29件のclass/material refを追加する。L9の新class `source_pointers` はL4とL7に限る。L5/L8の文書は変更しない。
- 元候補 `02e177494316f6ccb3ff669f79477fbe8fc29b01` の29 case・2 classと手動根拠を維持し、PR-A専用のL4/L9 evidenceへ組み直した。

R3の分割順は、PR-A (L4/L9) merge後、PR-BでL5/L8を追加し、PR-A merge後のmain revisionへpinする。続いてPR-CでL9の各class rowへL5 `/failure_rules/31` と `/failure_rules/32` のsource pointerを追加する。#3907は被覆記録後にcloseする。PR本文ではこの残件を明記する。

## 形成済みclassとcase証拠

| class | ID | finding順 | 件数 |
|---|---|---|---:|
| known conflict | `OS015-NEG-COMPOSITE-07c9fd844a293140f5dc77476ab8ed90116889361788956739abfdcf65b874c4` | `original_event_mutated`, `source_conflict` | 15 |
| unknown operand | `OS015-NEG-COMPOSITE-4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5` | `original_event_mutated`, `source_unresolved` | 14 |

29件はC0045–C0061とC0102–C0113。手動記録は[`case-evidence.json`](case-evidence.json)に保持する。L7 `given.input` のfixture/hash/pointerと、L4上流から独立に記録したfinding pointer/classを静的照合する。L9の既存583行は、material/class link以外が基点と一致し、既存expected/conditionを変えていない。L8はPR-Aの対象外である。L9側ではC0044を含む残112件が未割当。L8側はPR-Aで変更していないため、141 case refが未割当のまま。

## 静的照合

```sh
python3 scaffold/research/wr181-os015-pr-a-l4-l9-20261030/validate_static_evidence.py
```

validatorはL3/L4/L7/L9のrevision/hashとpointerを照合する。L4 class rowsとL9 class/link rowsの一致、固定L7入力hash、宣言済み手動finding pointerの解決、L9全583行のexpected/condition不変を確認する。finding/classを入力predicateから再計算せず、L5/L8を読まない。

## check-child と既存freeze

| 項目 | 821a基点 | PR-A候補 | 差分 |
|---|---:|---:|---:|
| check-child全体 | FAIL | FAIL | 維持 |
| L4/L9 pair | PASS | PASS | なし |
| L5/L8 pair | PASS | PASS | なし |
| L4/L5/L8/L9 class数 | 31/31/25/25 | 33/31/25/27 | L4/L9に各2件追加 |
| L8/L9 case rows | 583/583 | 583/583 | なし |
| matched cases | 431 | 431 | なし |
| negative-4way failures | 165 | 175 | +10 |

中間FAILはPR-AだけではL5/L8 class rows・rulesがまだ無いためであり、2件のowner参照未解決も含む。141件のL8 case ref不足は変わらない。PASSや全coverageを主張しない。

既存freeze `os007-os015-function-pair-freeze-2026-10-28.json` は変更前後ともmechanical FAILで、結果は同一: pin未評価(対象pinなし)、JSON pointer 67確認/2421失敗、negative 4-way未評価(層文書不在/未parse)、public function 8失敗、L3 obligation map未評価。freezeを生成・更新しない。

最新main trialはsource candidate commit `1928259790b0b9e87e85a959c6d1b2f008a9acdc` を含むmerge revision `683964eb8477edea3ae2c6a13c04acea819890b7` で実施した。その後の `95688e78bfbf16c4d35ab059a7a6e7e06c787b87` と件数訂正commitは検証記録文書のみで、L4/L9およびbinding bytesに変更はない。

`scfctl validate` は162 bindings / 0 failures、`scfctl stale` は0、`git diff --check` は成功。checker生出力はcommitしない。runtime/test/CIと旧CLI/runtime/test/CIは実行していない。
