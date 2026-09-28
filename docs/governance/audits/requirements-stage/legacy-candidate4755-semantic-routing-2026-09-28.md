# 旧candidate 4,755行の意味route監査

## 範囲と保全確認

基準commitは `5e42b759addec0166af3d0fd98ca878a8c851f10`。対象は旧candidate 92文書、archive sourceの非空行4,755行。既存line ledgerをarchive本文と照合し、4,755行のline SHAと92文書分のfile SHAは全件一致した。作業はread-onlyで、旧runtime、CLI、hook、test、CIは実行していない。

この監査の行分類は探索用の一次分類であり、意味要件の完全な抽出ではない。検収で5件のfalse negativeが見つかったため分類を補正したが、全行の要件意味を閉じたとは扱わない。

## 最終分類とroute

| 区分 | 行数 | 定義 |
|---|---:|---|
| structure | 926 | 見出し、表の枠、文書構造など |
| explanation | 2,959 | 背景・説明の一次分類。要求文を含むfalse negativeが残る可能性がある |
| requirement_atom | 870 | 受入条件、規範、要求、禁止条件と判断した行 |
| **合計** | **4,755** | |

870 requirement atom行のroute dispositionは次のとおりで、合計は870行。

| Route disposition | 行数 | 扱い |
|---|---:|---|
| source relationあり・coverage未解決 | 141 | 初回の明示relation 39行と、意味照合で確認したsource-basis relation 102行。全件で `coverage_claim=false` |
| unadopted candidate relation / candidate-only | 155 | 後続の未採択候補への関係126行、候補状態のまま保全する29行。現行採択・coverageを意味しない |
| unknown | 574 | batch review後もunknownの569行と、false negative監査で追加した未review行5行 |
| **合計** | **870** | |

route状態の全4,755行集計は、非要求一次分類3,787行、unknown 831行、documented relation 137行。これらのbase routeは意味coverageを表さない。requirement atomに対する特定target relationのある141行も、source来歴・比較先を示すだけで、atom全体の被覆を証明しない。

## 意味照合のバッチ結果

初回分類でunknownだった826 requirement atom行を、上位familyから100 clusterずつ照合した。cluster内の行数は異なる。

| Batch | Cluster | 照合行 | Source relation・coverage未解決 | unadopted candidate | unknown |
|---|---:|---:|---:|---:|---:|
| 1 | 100 | 156 | 47 | 51 | 58 |
| 2 | 100 | 244 | 15 | 89 | 140 |
| 3 | 100 | 180 | 5 | 15 | 160 |
| 4 | 100 | 246 | 35 | 0 | 211 |
| **計** | **400** | **826** | **102** | **155** | **569** |

4 batchの `coverage_claim` はすべてfalse。confirmed IR153、confirmed identity 175、補助source 134へ、line単位で意味上の対応を確定できたrouteはない。明示IDが見つからないことを理由に非memberや無関係とはしていない。現行文書でのversion targetも、この照合から割り当てていない。

検収で説明分類のfalse negativeを5件確認し、requirement atomへ移した。追加行は `LEGACY-CAND-LINE-003083`（secret等を継承しない条件）、`001105`（HXT-AC-015受入条件）、`000603`（Guard/Sandbox/品質検証の責務分離）、`000425`（同条件での費用・誤修復測定）、`000143`（Requirement/CI/merge authorityへの投影禁止）。これら5行はroute unknownで、4 batch後に判明したため意味照合は未実施である。行SHA/file SHAと原文は既存ledger参照で検証できる。

## 現行IDと後発25候補の境界

現行採択済みIDへの明示source relationとして、`HELIXOS-L2-014` が62行、`HARNESS-L2-010`、`HARNESS-L2-011`、`HARNESS-L2-022` が各1行ある。これらは採択済みの現行要求IDであり、後発25候補のIDとして数えていない。どの関係も旧候補atom全体の採択・coverageを主張しない。

後発25候補への明示的なatom-specific relationはこの監査で確定せず、候補IDを割り当てていない。後発候補本文や登録の存在だけから旧sourceの意味被覆を推定していない。

## 結論と限界

92文書・4,755行のsource digestとline inventoryは一致した。意味上は870行を暫定atom分類したが、少なくとも5件のclassification false negativeが実際に見つかっている。追加5行は未reviewで、既存のunknown 569行も残る。したがって全4,755行のatomization、条件別successor、L2/L11 coverage、採択境界の完全閉包は未証明であり、stage5回帰閉鎖やno-lossの意味的証明とは扱わない。
