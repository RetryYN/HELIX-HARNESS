# 旧candidate 4,755行のcondition・route累積再集計（#2345後）

- audit id: `legacy-candidate4755-cumulative-condition-route-recount-after-2345-2026-09-29`
- 基準commit: `d8c39fd06f51bc0137c63db7fd9c6facf5974cfb`（#2345 merge後）
- authority effect: `none`。92旧archive文書のsource bytes、routing snapshot、carry-forward台帳、過去監査は変更しない。
- 方法: 固定したrouting JSONL 4,755行とcarry-forward ledger 4,755行をsource ID/path/line/file SHA/line SHAで突合し、92 archive filesのSHAと全4,755物理source lineを再照合した。分類・routeは全行を列挙した後、#2341に含まれる訂正、#2342の20行、#2345の12行をexact source IDで適用した。旧件数への算術加算は行っていない。

## 全4,755行のeffective classification

| 分類 | 件数 | 内訳 |
|---|---:|---|
| structure | 926 | router snapshotのまま |
| explanation | 2,911 | 既存訂正overlayを反映後 |
| condition | 918 | product requirement atom subtype 913、management/process condition 4、歴史的Concept condition 1 |
| **total** | **4,755** | 4,755 source lines |

condition bucketはproduct requirement atom件数と同義ではない。management/process 4件とConcept 1件もcondition総数に含めるが、product requirement atom subtypeには含めない。

## Condition route status

| condition route state | 件数 | 意味 |
|---|---:|---|
| `source_relation_coverage_unresolved` | 141 | source relationは記録されるが条件単位coverageは未解決 |
| `unadopted_candidate_relation_only` | 156 | 未採択candidate relationのみ。採択済みcoverageではない |
| `partial` | 16 | 限定的crosswalk。残差あり |
| `unresolved` | 2 | 対応により旧条件を閉じていない |
| `covered_limited` | 1 | 指定された限定範囲のみ |
| `adopted_relevant_partial` | 20 | #2342の採択済みL2/L11との部分的関係。RTG固有oracle/successorは未確立 |
| `unknown` | 578 | source conditionの正確な採択coverageは未確立 |
| `management_successor_unresolved` | 4 | management/process route未解決。product L2/L11 route未割当 |

condition rowsは合計918件。製品conditionに限るroute-knownは336件、製品conditionのunknownは577件。Concept conditionのunknown 1件とmanagement route未解決4件はそれぞれ別に表示した。route-known件数にはunadopted candidate relationと限定crosswalk outcomeを含む。partial、unresolved、covered_limited、adopted_relevant_partialはいずれも旧source全体のcoverage・closureを意味しない。

## 適用した訂正集合と履歴

- #2341の全量監査が既に含む19件のexplanation→condition訂正と19件のroute crosswalkは、そのID集合・route outcomeを再照合して引き継いだ。#2338/#2339のpartial 16、unresolved 2、covered_limited 1を保持する。
- #2342では20 source IDs中17 explanation行をconditionへ訂正し、3既存requirement_atom行をconditionとして維持した。20件すべてのroute outcomeは`adopted_relevant_partial`。正式successor・完全coverage・受入実行を意味しない。
- #2345の12行はcondition bucketへ追加し、subtypeをproduct requirement atom 7、management/process 4、Concept 1に分けた。route outcomeはunknown 7、unadopted candidate only 1、management successor unresolved 4。管理系4行にproduct L2/L11 routeは割り当てていない。
- #2341の旧件数（structure 926 / explanation 2,940 / condition 889 / route unknown 574）は#2342・#2345を含まないhistorical値。旧監査は書き換えず、本監査は今回全行再列挙した値を別のappend-only記録として残す。

機械可読JSONは全4,755行のsource identity、snapshot/effective classification、subtype、route state、92 archive file hashes、入力監査のSHA-256を保持する。

## 静的検証と限界

- router/ledger IDは`LEGACY-CAND-LINE-000001`〜`LEGACY-CAND-LINE-004755`の一意な全件。全source lineの物理bytesとSHA-256、92個のarchive file SHA-256を照合した。
- #2341のclassification correction 19件とroute overlay 19件は17件が共通し、routeのみ更新した既存condition atomは`003506`/`003511`の2件。#2342は20 route更新のうち17件が新規分類訂正、3件は既存condition atom。#2341の各overlay、#2342の20行、#2345の12行の集合間には重複がなく、重複適用はない。分類とroute各bucketの総和は4,755行/918 condition rowsに一致する。
- 全sourceは`historical_candidate` / `draft_candidate` / `preserved_pending_atomization`のまま。採択、retire、formal successor、L3移行、Stage 5/6完了、実装・実行許可、受入実行は主張しない。
- 旧CLI、runtime、test、hook、CIは実行していない。
