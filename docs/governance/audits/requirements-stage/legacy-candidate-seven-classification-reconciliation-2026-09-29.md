# 旧candidate 7行の分類・atom境界照合案

status: audit_proposal
authority_effect: none
base: `origin/main` commit `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`

## 範囲と読み方

Draft PR #2359 が再確認対象とした `LEGACY-CAND-LINE-000140/142/143/180/331/476/477` を、同PRの選択基準となった#2353累積分類proposal、#2356のmetadata訂正proposal、固定router snapshot、およびarchive原文で照合した。#2353/#2356/#2359は監査案であり、いずれも旧candidateの採択や現在のauthorityを生成しない。ここに示す差分も提案分類に限る。

## 判定

| Source ID | 提案する有効分類 | Atom境界・routeへの影響 |
|---|---|---|
| `000140` | `condition / product_requirement_atom` を維持 | AAFD-R-03のline 40–41をまたぐ一つの複合conditionとして束ねる。line 41を独立した別要求として数えない。line 41は意味条件なのでrouterの`explanation`からの再分類は妥当。routeはunknownのまま。 |
| `000142` | `condition / product_requirement_atom` を維持 | AAFD-R-04 line 45には完結したdetector非置換条件と、次文の直接投影禁止の開始部がある。前者はline 45 atom、後者はline 45–46 atomとし、line 45を両atomから参照する。L2-073の対象exact L2/L11 revisionは2026-09-29 PO判断で採択済みだが、この物理行だけで旧AAFD全体のcoverage/closureを示さない。routeは限定的な採択関係。 |
| `000143` | `condition / product_requirement_atom` を維持 | line 46単独では独立atomにならず、line 45で始まる「自由文を直接Issue、Requirement、CI、merge authorityへ投影しない」条件を完結させる。全体で2 atom（detector非置換、直接投影禁止）を保つ。採択済みL2-009とのrelationは部分的で、routeを採択・coverageに昇格させない。 |
| `000180` | `condition / management_process_condition`へ変更 | 自動変更禁止とpromotion gateは候補成果物の変更・昇格手続きに関する条件で、製品機能atomではない。#2356の`000111`に示された「管理process条件」とstatus metadataの区別を適用する。旧Issue `#1035/#1384`、独立VERIFY、human gateの列挙はhistorical candidateの記述として保持し、現行の追加承認手続きにはしない。製品route集計から外す。 |
| `000331` | `condition / product_requirement_atom`を維持 | `各反例…独立oracle・mutationで拒否…合法入力…対照例`を受入criterion atomとして保つ。末尾の`実証は未実施`は実施状態metadataで、criterion atomの構成条件に含めない。現行L2-015/016とのrelationは当該criterion部分に限るpartial。 |
| `000476` | `explanation`へ変更 | `supporting requirements: CIG-R-01..04 exact 4件`はID/件数だけを列挙する量閉じmetadata。独立した製品振舞い、受入条件、管理process directiveを述べない。未知product-route母集団から除外。 |
| `000477` | `explanation`へ変更 | `acceptance: CIG-AC-001..007 exact 7件`もID/件数だけを列挙する量閉じmetadata。受入条件そのものは上のAC-001..007別行に存在する。未知product-route母集団から除外。 |

### 集計差分案

7行への分類差分は`condition -2`、`explanation +2`、`management_process_condition +1`、`product_requirement_atom -3`、`product route unknown -3`。`000140/142/143/331`のsource classificationは維持する。`000180`はconditionの上位分類に残したままmanagement process subtypeへ移し、`000476/477`はconditionからexplanationへ移す。

この訂正が採用された場合、#2359の20行sampleはproduct atom 20行の母集団選択ではなくなる。選択規則に従う次batchを作る前に、#2353/#2356 proposal overlay後の有効集合から除外3 IDを反映して再選択する必要がある。route件数・母集団は再計算まで未確定とする。

## 根拠

- 固定router snapshotは`000140/142/180`をexplanation、`000143/331/476/477`をrequirement atomとしている。#2353の提案累積overlayは7行すべてを`condition / product_requirement_atom / unknown`としているため、両者を混同せず差分overlayを明示する。
- 旧AAFD-R-04ではline 45にdetector非置換の完結文と、line 46まで続くdirect-projection禁止文の開始が同居する。R2253-01は45–46を一組の規範条件と記述し、後続r2 source inventoryと`MPR-RC-HELIXINTELLIGENCE-L2-073-002`は意味を2 atomに分けている。本案は物理行を変更せず、line 45の共有参照を明記して後続の二atom mappingを保持する。
- 旧BBR acceptance line 16は規範criterionと実施状況を同一行に載せる。状況報告をcriterionへ混ぜない。
- 旧CIG acceptance line 24–25は`量閉じ`見出しの配下に要求・受入ID件数を列挙し、能力条件はline 14–20の個別行に分離している。これらの参照行を別のproduct atomに数えない。
- #2356は、ID・件数・provenance・statusのみの説明行をexplanationとし、独立した承認authority境界を述べる`000111`はmanagement process conditionと区別した。本案はこの区別を適用する。

## Authority・再利用境界

HELIX-INTELLIGENCE `L2-009/015/016`は2026-09-28、`L2-073`は2026-09-29のPO判断記録が特定するexact revisionに限って採択状態を扱う。`L2-073`の対象exact revisionは2026-09-29 PO判断記録で採択済みであり、next-generation-CIは未決candidateである。現行L2/L11本文と旧r2 receiptに残る「候補／未採択」文言は判断前の履歴として読む。source relationやclassification overlayから、旧要求の採択・変更・退役、formal successor、source coverage/closure、L3、実装または受入許可を導かない。特に`000180`に含まれる旧human gateを一般化して現在の作業承認にしない。`000476/477`の説明分類もIDや原文の削除を意味せず、archiveおよびsource inventoryを保全する。

旧資産の扱いは意味の再導出であり、旧runtimeや旧手順の再利用ではない。参照した旧資産はJSONにasset ID・archive path・line・SHA-256で記録した。
