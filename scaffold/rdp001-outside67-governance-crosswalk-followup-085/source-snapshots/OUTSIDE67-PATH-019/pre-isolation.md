# 上流再整理に伴うopen PR整理記録

実施日: 2026-09-14

## 目的

上流要求の確定前に旧CI、旧runtime、旧L6／L7設計・実装を取り込む経路を止める。GitHub PRのcloseは要求の
採否・削除・完了を意味せず、各branchの内容はlegacy sourceとして必要に応じて再採否する。branchは削除していない。

## close結果

| PR | 分類 | close理由 |
|---|---|---|
| #1793 | 旧CI維持 | source ledger testの時限failureを修正し、現行CIを成立させる変更。新世代CIは上流から再導出するため取り込まない |
| #1789 | 旧下流実装 | Cursor Cloud assignmentのL6／L7・runtime実装。対象別L2／L3より先行している |
| #1788 | 旧下流設計 | generated authority single writerのL6／L7設計。OS上流要求から再採否する |
| #1785 | 旧下流実装 | management relation admissionのL6／L7・runtime実装。新しい管理要求より先行している |
| #1784 | 旧runtime修復 | current location、DB、旧L6設計の修復。現行機構を新世代へ温存する経路にしない |
| #1792 | 旧再整理案 | Issue 722件を中心にした最上位整理案。ローカル正本、対象別Concept／L1／L2、HARNESS／OS分離の現系列に置換 |

GitHub上で上記6件を`CLOSED`へ変更し、実施後のopen PRは0件である。merge、branch削除、Issue close、CI起動は行っていない。

## 後続での扱い

- close済みPRの実装状態やCI結果を新世代要求の成立証拠にしない。
- 必要な要求atom、behavior、failure、oracleはsource inventoryへ戻し、対象別L2で個別採否する。
- 採択した意味も旧commitをそのまま再有効化せず、承認済みConcept→L1→L2→L3から降ろし直す。
- GitHub上の`CLOSED`から要求の棄却、旧assetの削除、archive完了を生成しない。
