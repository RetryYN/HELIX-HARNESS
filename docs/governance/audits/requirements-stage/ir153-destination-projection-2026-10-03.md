# IR153 行き先locator projection（2026-10-03）

この表は既存の153 source identityに、source locatorとtargetの採否根拠を限定joinした一覧です。旧sourceの全文再監査や全条件の再証明ではありません。

## 主行き先（exclusive）

| 行き先 | source identity数 |
|---|---:|
| 既存採択targetへ接続（target別PO根拠あり） | 152 |
| 新候補 | 1 |
| **計** | **153** |

153 sourceすべてに主行き先があります。152件は各rowに少なくとも一つ、current candidate decisionまたは固定済みL2/L11 target pairの採択根拠が見つかりました。残るHIL-BR-19はOS132-002/r2の未採択新候補へ接続しました。

sourceによっては、採択済みtargetに加えて登録済み候補や不採択revisionも保持されています。それらは行ごとに別欄へ残し、primary routeの採択をsource全条件の解決とは扱いません。登録済み候補を持つsource rowは 6 件、不採択候補revisionの履歴を持つrowは 8 件（非排他的）です。

## 採択targetの根拠と境界

- current 383 candidate tableでは、当該target identityの`disposition == 採択`、decision locator、registration candidate pinを使用しています。保留・不採択・判断未記録はそれぞれ候補または履歴として保持します。
- 既存の基礎target IDsでcandidate tableにないものは、2026-09-28のPO decisionが固定したHELIX-HARNESS／HELIX-OSのL2とpaired L11 target rowをf6固定revisionと現行bf52で比較しました。17個のmapped base target row pairはすべて不変でした。target単位のline locatorとSHA-256はJSONの`target_evidence_join`へ記録しています。
- 1つのtarget IDに対する採択根拠は、IR原文全体の条件被覆証明ではありません。source holding、formal successor assignment、意味保持の全体closureを別軸に維持します。
- HIL-NFR-14は旧125-001不採択を履歴保持し、最新mainの125-002未採択候補へ接続し直しました。HIL-BR-19は旧HELIXのBun依存撤去に対応するHELIX再構築の一回repository移行に限定したHELIXOS-L2/L11-132-002/r2へ接続します。
- source worklistの2026-09-28 audit bucketと`open_scope_question`は歴史記録で、現在のPO残件として数えていません。formal successor 0件も要求整理の追加gateにしません。

## 根拠

153行のsource locatorは既存worklist `scaffold/review-handoff/local/requirements-source-closure-worklist-2026-10-03.json`（SHA-256 `sha256:03d21ba952c52351df0bd03d638a77832a77bb3471fac38e02b31f3dd2aa7d6b`、153 distinct IDs、latest join `94f0df8c8d69ba0c1ad8de6f7fcfb4fc02f1b891`）から継承しました。各JSON rowにIR locator、保存source path/line digest、carry-forward/routing/audit locator、target L2/L11 anchor、採否根拠または未確認状態を記録しています。

詳細なrow/target単位の根拠は同名JSON `rows[].target_evidence_join` にあります。L2/L11 anchor locatorは既存target IDへの参照です。全153 sourceのmeaning coverageをこのprojectionで主張しません。
