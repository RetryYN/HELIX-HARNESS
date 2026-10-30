# WR249 HARNESS-015 F03/F04 U-ID別候補分割

## 範囲と状態

依頼 `WR249-TDD-F03F04-UID-SPLIT` に基づき、HARNESS-L5/L8-015 F03/F04の候補文を既存U-IDごとのsource-specificな反例と期待に分けた。候補資料であり `authority_effect=none`。実装・test・受入・要求採択・canonical oracleを示さない。

`uid-split-correction.json` は分割前後のL5/L8 hashとrevision、変更対象U-ID、既存Binding pinの旧hashと新hashを記録する。以前の比較・verification snapshotとfixed blindは変更していない。

F03は9件、F04は5件。B01その他の候補、L4/L9、canonical `unit_case_ids`／`unit_cases`、L3/L10を変更しない。各U-IDの行oracleは不足のまま、test citationも未発見のまま。failure-code語彙、axis/state、sequence意味は選ばない。F04 Integrated以降の条件はL3 F04が指定するコア検証/受入022との組合せを明示する。

## 根拠

L3 F03/F04、L10 F03/F04、L4 F03/F04の `failure_conditions` を行ごとに照合した。L9のnegative caseは既存U-IDと `source_trace_ref` の参照先としてのみ用い、反例・期待の意味を導いていない。Blind固定の粒度からU-IDの粒度は導いていない。

## 検証

`validate_uid_split.py` は許可された上流JSONと既存candidateを静的に照合する。WR243のF03/F04 validatorもWR249 correctionを読み、固定履歴と現在のU-ID別candidateを照合する。`verification-summary.json` にJSON構造、14件の一対一参照、canonical row維持、L4/L9不変、Binding pin、`scfctl validate/stale` の結果を記録する。アルゴリズム、runtime、test、CIは実行しない。
