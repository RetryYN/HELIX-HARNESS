# 旧candidate分類の累積件数照合

基準main `d0a58b1fa10456e5cf36d6d62a33a6117da9e1ae`で固定した旧candidate routing JSONLへ、#2253、#2254の分類訂正と10行condition overlayを `source_item_id` で適用した累積件数監査。機械可読の行集合、SHA-256、計算式、検証結果は[JSON監査](legacy-candidate-effective-classification-counts-2026-09-29.json)に記録する。

## 有効件数

| 区分 | 件数 | 意味 |
|---|---:|---|
| structure | 926 | 基準snapshotのまま |
| explanation | 2,947 | 基準2,959行から訂正対象12行を除く |
| condition | 882 | 基準requirement atom 870行に訂正対象12行を加える |
| **合計** | **4,755** | |
| condition内のunknown route | 586 | 基準unknown 574行に訂正対象12行を加える。conditionの内数 |

訂正対象は `LEGACY-CAND-LINE-000142`（R2253-01）、`LEGACY-CAND-LINE-003082`（R2254-01）、およびJSON overlayに列挙された10行である。三つのID集合は完全一致の `source_item_id` で相互に素である。10行overlayの既存route情報にcurrent IDが含まれる場合も、条件単位のcoverageやsuccessorを示さないため、その10行を含む12行すべてのeffective routeはunknownとする。残るroute集計141件（source relation・coverage unresolved）と155件（unadopted candidate relation/candidate-only）は変わらない。

## 再計算手順

1. JSONLを1行ずつ読み、`source_item_id` の件数が4,755、重複が0であることを確認する。基準分類件数はstructure/explanation/requirement_atom = 926/2,959/870、unknown atom routeはrouting auditの意味照合後集計569 + 5 = 574。
2. correction ID集合を `A={LEGACY-CAND-LINE-000142}`、`B={LEGACY-CAND-LINE-003082}`、`C=description-condition-overlay JSON の scope.included_source_item_ids` とする。`A`、`B`、`C` の各IDがsnapshotに一度ずつあり、元分類がexplanationであること、および `A∩B=A∩C=B∩C=∅` を確認する。
3. `N=A∪B∪C` とし、`|N|=12` を確認する。件数は `structure=926`、`explanation=2959−|N|=2947`、`condition=870+|N|=882`、`condition_route_unknown=574+|N|=586`、`total=4755` と計算する。unknownはconditionの内数。
4. base JSONLの各行についてsource line carry-forward ledgerとsource path、line番号、file SHA-256、line SHA-256を照合する。入力SHAはJSON証跡の `pinned_inputs` を照合する。

静的照合ではbase JSONLのSHA-256 `935740de546d71626131e5114ebbdff7d456c109e6efbda79cde938dc2fb8dc3`、4,755行・4,755 unique ID、ledgerとの4,755行全件一致を確認した。JSON証跡にはbase JSONL、ledger、inventory、両訂正監査、10行overlay、後発authority overlayの各入力SHAを固定してある。

## 後発overlayの件数表について

`current-authority-overlay-2026-09-29.md` の旧candidate表にある `926/2,957/872`、unknown `576` は、R2253/R2254適用後・10行overlay適用前の履歴値として保持する。この累積分類照合では10行overlayの反映後が有効値であり、同overlay記載の件数は現時点の累積分類件数としてはstaleである。PO判断のauthority範囲をこの件数訂正で変更しない。

## 境界

本監査は分類件数の機械的な累積照合である。12行はいずれもunknownのままで、要求coverage、formal successor、要求採択、PO判断、L11受入完了を生成しない。旧candidateのauthorityは `historical_candidate` のまま保ち、要求stage完了も主張しない。元routing JSONLと過去の訂正記録は変更していない。旧CLI、runtime、test、CIは実行していない。
