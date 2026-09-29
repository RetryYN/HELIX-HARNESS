# 旧candidate 7行の分類・atom境界照合案

status: audit_proposal
authority_effect: none
base: `origin/main` commit `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`

## 範囲と読み方

Draft PR #2359 が再確認対象とした `LEGACY-CAND-LINE-000140/142/143/180/331/476/477` を、同PRの選択基準となった#2353累積分類proposal、#2356のmetadata訂正proposal、固定router snapshot、およびarchive原文で照合した。#2353/#2356/#2359は監査案であり、いずれも旧candidateの採択や現在のauthorityを生成しない。ここに示す差分も提案分類に限る。

## 判定

| Source ID | 提案する有効分類 | 提案route | Atom境界・判断 |
|---|---|---|---|
| `000140` | `condition / product_requirement_atom` を維持 | `unknown` | AAFD-R-03のline 40–41をまたぐ一つの複合conditionとして束ねる。line 41を独立した別要求として数えない。line 41は意味条件なのでrouterの`explanation`からの再分類は妥当。 |
| `000142` | `condition / product_requirement_atom` を維持 | `adopted_relevant_partial` | AAFD-R-04 line 45には完結したdetector非置換条件と、次文の直接投影禁止の開始部がある。前者はline 45 atom、後者はline 45–46 atomとし、line 45を両atomから参照する。L2-073の対象exact L2/L11 revisionは2026-09-29 PO判断で採択済み。この物理行だけで旧AAFD全体のcoverage/closureを示さない。 |
| `000143` | `condition / product_requirement_atom` を維持 | `adopted_relevant_partial` | line 46単独では独立atomにならず、line 45で始まる「自由文を直接Issue、Requirement、CI、merge authorityへ投影しない」条件を完結させる。全体で2 atom（detector非置換、直接投影禁止）を保つ。L2-073とのrelationは部分的で、旧AAFD全体のcoverage/closureを示さない。 |
| `000180` | `condition / product_requirement_atom` を維持 | `unknown` | AAFD-R-15はarchive lines 108–109を一つの複合atomとして保持する。benchmark結果はLearning Systemのcandidate evidenceであり、単一model revisionからrule、provider routing、Requirement、Designを自動変更しない。line 109のpromotion evidenceはこの同じ境界を修飾する。旧`#1035/#1384`、independent VERIFY、counterexample、expiry、human gateは歴史的な候補の根拠として保持し、現行の反復承認手続きにはしない。 |
| `000331` | `condition / product_requirement_atom`を維持 | `adopted_relevant_partial` | `各反例…独立oracle・mutationで拒否…合法入力…対照例`を受入criterion atomとして保つ。末尾の`実証は未実施`は実施状態metadataで、criterion atomの構成条件に含めない。現行L2-015/016とのrelationは当該criterion部分に限るpartial。 |
| `000476` | `explanation`へ変更 | `not_condition` | `supporting requirements: CIG-R-01..04 exact 4件`はID/件数だけを列挙する量閉じmetadata。独立した製品振舞い、受入条件、管理process directiveを述べない。未知product-route母集団から除外。 |
| `000477` | `explanation`へ変更 | `not_condition` | `acceptance: CIG-AC-001..007 exact 7件`もID/件数だけを列挙する量閉じmetadata。受入条件そのものは上のAC-001..007別行に存在する。未知product-route母集団から除外。 |

### 集計差分案

7行への分類差分は`condition -2`、`explanation +2`、`management_process_condition +0`、`product_requirement_atom -2`、`product population -2`。route差分は`unknown -5`、`adopted_relevant_partial +3`、`not_condition +2`。`000142/143/331`は`unknown`から`adopted_relevant_partial`へ移り、`000180`は製品atomかつ`unknown`に残る。`000476/477`は`not_condition`となる。各行のrouteは上表およびJSONに同じ語で記録した。

この訂正が採用された場合、#2359の20行sampleはproduct atom 20行の母集団選択ではなくなる。選択規則に従う次batchを作る前に、#2353/#2356 proposal overlay後の有効集合から`000476/477`の2 IDを除外して再選択する必要がある。上記route差分はこの7行の算術であり、全母集団件数は依存監査のmerge後に再計算する。

### 依存pinの更新待ち（R2360-03）

現在の`#2353` pinは`8a75e5392a44e005bb05197d977bdbcf75b93cf0`、`#2356` pinは`b213b41735067d1716c143c92e0fa6c71d8e92d9`のレビュー対象snapshotを固定している。両PRの修正・merge後に、最新main上のmerge済みcommitとbytesへpinを更新する。更新前のこのproposalは将来のmerged mainに対するmerge admissionを満たさない。

## 根拠

- 固定router snapshotは`000140/142/180`をexplanation、`000143/331/476/477`をrequirement atomとしている。#2353の提案累積overlayは7行すべてを`condition / product_requirement_atom / unknown`としているため、両者を混同せず差分overlayを明示する。
- 旧AAFD-R-04ではline 45にdetector非置換の完結文と、line 46まで続くdirect-projection禁止文の開始が同居する。R2253-01は45–46を一組の規範条件と記述し、後続r2 source inventoryと`MPR-RC-HELIXINTELLIGENCE-L2-073-002`は意味を2 atomに分けている。本案は物理行を変更せず、line 45の共有参照を明記して後続の二atom mappingを保持する。
- 旧BBR acceptance line 16は規範criterionと実施状況を同一行に載せる。状況報告をcriterionへ混ぜない。
- 旧CIG acceptance line 24–25は`量閉じ`見出しの配下に要求・受入ID件数を列挙し、能力条件はline 14–20の個別行に分離している。これらの参照行を別のproduct atomに数えない。
- #2356は、ID・件数・provenance・statusのみの説明行をexplanationとし、独立した承認authority境界を述べる`000111`はmanagement process conditionと区別した。本案はこの区別を適用する。`000180`は候補文書の効力ではなくLearning System benchmarkから製品rule・routing・Requirement・Designを自動変更しない機能境界を述べるため、製品atomとして扱う。

## Authority・再利用境界

HELIX-INTELLIGENCE `L2-009/015/016`は2026-09-28、`L2-073`は2026-09-29のPO判断記録が特定するexact revisionに限って採択状態を扱う。`L2-073`の対象exact revisionは2026-09-29 PO判断記録で採択済みであり、next-generation-CIは未決candidateである。現行L2/L11本文と旧r2 receiptに残る「候補／未採択」文言は判断前の履歴として読む。source relationやclassification overlayから、旧要求の採択・変更・退役、formal successor、source coverage/closure、L3、実装または受入許可を導かない。特に`000180`に含まれる旧human gateを一般化して現在の作業承認にしない。`000476/477`の説明分類もIDや原文の削除を意味せず、archiveおよびsource inventoryを保全する。

旧資産の扱いは意味の再導出であり、旧runtimeや旧手順の再利用ではない。参照した旧資産はJSONにasset ID・archive path・line・SHA-256で記録した。`authority_state_model` pinは`docs/governance/authority-state-model.md`、commit `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`、SHA-256 `812f423b4b9952666b0ef91e741fec62f54caa3c884124ec534abbbe70be4616`。
