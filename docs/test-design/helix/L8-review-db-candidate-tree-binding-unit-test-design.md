# Review DB candidate tree binding 単体テスト設計

## 対象

`bindCanonicalLogicalDbReceipt`のcandidate source境界を検証する。

## Oracle

- U-CPRCONV-038: DB receiptの`source_head`がreview HEADと異なる場合は拒否する。
- U-CPRCONV-039: status entryを含むdirty workspace由来receiptは拒否する。
- 既存U-CPRCONV-004: cleanかつ同一HEADのcanonical receiptは従来どおり束縛できる。

mutationではHEAD比較の反転またはworkspace clean条件の除去により、対応する負例が失敗することを確認する。
