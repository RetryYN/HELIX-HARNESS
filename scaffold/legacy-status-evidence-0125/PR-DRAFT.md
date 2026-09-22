# Draft PR

## Title

research: add fixed-base legacy status evidence partition (SCF-B-0125)

## 概要

固定BASE `bab1ca011a407112920aad1e6bfcfe5e79bc8122` から、旧ledgerの13 assetを対象に、旧実装履歴、未実装記述、partial/degraded、failure、consumer定義をasset-level evidenceとして分離する研究Scaffoldを追加する。source本文・blob・SHA・claim anchor・ledger/history・candidate relation・反証を固定し、直接unit/requirement/acceptance evidenceがない statusはunknown／pendingに保つ。

対象の分母は218 product unit、153 source ID、598 Wave edge、355 Wave asset、4,020 ledger row。選定13件は明示した固定ID集合で、candidate pool 281行とWave edge 1行はrelation searchとして記録する。旧実装・現行実装・縮退・failure・consumer closure・受入を混同しない。

## 境界

- 旧archiveはGit objectの静的読取だけで、旧code／test／runtime／CIは実行しない。
- `implemented`、`partial`、`failed`、consumer roleの本文記述はasset-level claimとして保存し、unit verdictへ昇格しない。
- formal crosswalk、authority、successor、implementation、acceptanceは変更しない。
- #1813は進捗参照のみ（Closesは付けない）。

## 検証

- `validate.py`: 13件、入力Git object digest、BASE祖先性、ledger/source/anchor/status partition、inventory bundle_kind／anchor_rule.claim_rules／search_boundaries／top-level key集合 PASS
- `selfcheck.py`: 29負例 PASS（inventory宣言4件を含む）
- `scfctl validate`: Binding整合 PASS
- `scfctl stale`: stale=0
- `scfctl residuals`: residuals=0
- `git diff --check`: PASS
