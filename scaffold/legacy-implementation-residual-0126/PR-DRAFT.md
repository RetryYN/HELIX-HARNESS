# 固定BASEの未解決 implementation_source 残余67件を製品責務候補として固定する research Scaffold

## 目的

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` で未解決1,792件から既存研究union280件を除き、残余1,512件のうち `implementation_source` 67件を、四製品L1・product-boundary・旧assetのhistory/failure/consumerと静的照合する `SCF-B-0126` を追加する。

## 結果

- 対象: **67 asset / 67 records**、重複・欠落なし
- source領域: `src/web/`7、`src/doctor/`5、`src/policy/`5、`src/vscode/`5、`src/audit/`4、`src/design/`4、`src/task/`4、その他33
- Wave入力: 50 files、598 edges、355 unique assets。対象67へのWave edgeは **0**
- 候補: direct product basis **30**、multi-product conflict **23**、insufficient basis **14**
- phase候補: phase台帳の値を各recordで保持。正式phase admissionは行わない
- 旧asset decision/read-after対象行: 対象asset別に再照合。failure/consumerはglobal inventoryを静的参照
- 旧asset status（disposition／product／implementation／consumer／decision／read-after）とhistory/consumer blockは、固定BASE由来の期待record全fieldと厳密一致させる。inventoryのschema、formal_update、expected source_pathsも全field照合する。

各candidateはsource pathではなく、固定BASE archive Git objectの具体span、行テキストdigest、product-boundary/L1のcounter-evidenceに基づく。複数責務は単一ownerへ潰さずconflict、wrapper/re-export/compatibility facadeはinsufficientとした。

## 境界

`authority_effect=none`、formal asset/product classification・phase ledger・product route・successor・consumer closure・implementation成立・new buildは変更しない。既存台帳・formal route・Wave snapshotも変更しない。旧archive runtime/test/CIは実行していない。

`scripts/helix.ps1`にはphase source digestとarchive Git object digestの不一致があり、ledger digestと実bytesを別々に保存した。これはsource evidenceの欠陥候補であり、候補分類やauthorityへ変換しない。

## 検証

```text
python3 -B scaffold/legacy-implementation-residual-0126/generate.py
python3 -B scaffold/legacy-implementation-residual-0126/validate.py
# SCF-B-0126 validate: PASS records=67 categories={'direct_product_basis': 30, 'insufficient_basis': 14, 'multi_product_conflict': 23} target_wave_edges=0 union=280
python3 -B scaffold/legacy-implementation-residual-0126/selfcheck.py
# SCF-B-0126 selfcheck: PASS negative_cases=34
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

このPRは研究ScaffoldとBindingの追加だけを行う。merge、close、正式分類、実装成立は含まない。
