# WR206 F02 L5/L8候補の証跡

## 範囲と状態

- PR class: `design_verification`
- 対象V-pair: HELIX-HARNESS HARNESS-015 F02 L5/L8のみ
- 基点: 最新main `fa3d2d515ce8df79c0a74d5360a4d1254863a6f1`
- binding: `SCF-B-0185`
- status: scaffold候補。authority effectなし。正式な設計・承認・受入・実行結果ではない。

この候補はL5にF02専用のsource fact評価述語を簡潔に記し、L8には合成candidate inputへの参照と小さな意味projectionだけを置く。[設計・実装検証QA §3](../../../docs/governance/design-verification-quality-assurance.md)ではL5にtest用合成fixture本体、L8にU-ID表以外のfixture/full-return/seed/hash材料を持たせない。候補raw factsは許可済み`scaffold/`研究資料へ移したが、scope内のowner由来raw packetは確認できず、正式なinput sourceとは主張しない。L4/L9、既存L9 input/expected、L5/L8の既存unit casesは変更しない。L4/L5 algorithm、製品runtime、旧runtime/test/CIは実行していない。

## 固定済み意味範囲とsource authority

比較前固定artifactは [`source/f02-blind-draft.json`](source/f02-blind-draft.json)。SHA-256は `7adbbee23d54e79773c5c7462c14250b6640c0afb4707495275aab069fb46152`。Issue [#3510 comment 6530137720](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6530137720)は、別担当がL5/L7/L8/L9・Issue/PRを見ず、L3/L10 reviewed head `a715e777bd59291b26f09c0c1c5481273c6eba2e`とL4 F02のbehavior/input_contract散文から正例1・負例5の**意味候補**を固定した記録である。この作業では固定後に比較し、artifact bytesは変えていない。

artifactが固定したのは意味範囲だけである。具体fixture・schema・分類規則・返却state/codeは固定していない。本候補のhead token（H0/H1）、failure_kind例、L4 axis/state、positive output projection、`receiver_debits`を使う比較、synthetic receiver countはL5/L8の設計選択であり、承認済み上流要求や独立oracleではない。L5はL4例示の`H0`と`intended_duplicate_debit_detected`を出力候補に置き、述語でactual/expectedの`receiver_debits`を比較するため、この候補はその値域と語彙に依存する。作成者は過去作業でL9候補を読んでおり、盲検の比較・導出とは主張しない。

L3/L10 sourceの基点は承認済みreviewed head `a715e777bd59291b26f09c0c1c5481273c6eba2e`。該当entryは `/requirements/41` と `/cases/41`。固定headでの全体SHA-256はそれぞれ `62a954e9244eb184bf3c2c3c1ab6b27763b52ce4a40041debbd9e13eed7d6689`、`e2580d52e8628d4755973e745528702e5cce66ab829c3f9c6f26c5ceb6aace7c`。現行mainのentry意味・bytesも同一である。L4は現行mainのF02契約 `/contracts/2` を候補設計sourceとして参照する。L4の5 axis/stateは候補値として使い、上流承認へ引き上げない。

## L5/L8の候補内容

L5の `HARNESS-L5-015-F02.candidate_classification_design` は共通観測条件、正例述語、5つのnegative predicateを入力pathと比較関係で簡潔に示す。L5には候補値`H0`、`intended_duplicate_debit_detected`があり、述語は`receiver_debits`を比較する。これらはL4の例示語彙に沿う候補設計で、固定artifactが具体値やschemaを指定した結果ではない。候補fixtureの実行出力ではない。`F-015-05`のinput/outputは分類事実だけを扱い、case IDを受け取らず返さない。L8の `HARNESS-L8-015-F02.candidate_unit_design` は、positive 2枝とnegative 7 witness（5分類、environment/syntaxの2 witness）それぞれにresearch artifactへのpointerと短い意味projectionだけを置く。synthetic input packetは [`source/f02-candidate-input-facts.json`](source/f02-candidate-input-facts.json) に隔離し、L8に全payloadやcaseごとのsource pinを重複させない。共有baselineから各case deltaを適用する候補手順もL8で明示した。case IDは参照用の行識別子で、期待値の選択キーではない。

| case | candidate fixtureで照合する事実 | L4候補のcode / axis / state |
|---|---|---|
| 正例・新規 | `change_kind=new`、pre-body state `unimplemented`、実Redが凍結oracleに対応しbody変更前 | L4 F02 output contractとの候補照合 |
| 正例・既存 | `change_kind=existing`、pre-body state `unrepaired`、他は正例条件 | L4 F02 output contractとの候補照合 |
| after-body revision H1 | `red.head=body_change.to_head=H1`かつ実Red sequenceがbody変更後 | `after_body_red / red_before_body / conflict`（candidate） |
| pre-body headの遅延記録 H0 | `red.head=pre_body.head=H0`のまま、記録sequenceだけがbody変更後 | 同じcandidate codeの別枝。実行がbody後だった証拠とは扱わない |
| foreign head | pre-body target headと異なるhead tokenの実Red | `foreign_pre_body_head / pre_body_head / stale` |
| environment | 環境失敗、behavior観測なし、receiver actual absent | `environment_error / red_meaning / unknown` |
| syntax | 構文失敗、behavior観測なし、receiver actual absent | `environment_error / red_meaning / unknown` |
| unexecuted | `executed=false`、Red観測とactual値がabsent | `unexecuted_red / red_meaning / missing` |
| mutation only | pre-body `red` absent、post-body mutation実行とoracle強度所見あり | `mutation_substitute / red_before_body / missing` |

全negativeのbackflow component候補は `PreBodyRedEvidence`、side effect count候補は0。typed evaluator ownerはL5 pure function `F-015-05` とし、component/backflow ownerとは分けた。fixture factsは合成候補で、実source packetや実owner qualificationを示さない。QA §3でL8に許されるscopeを守るため、L8にはfixture本体を載せず研究artifactへの参照だけを残した。scope内のowner由来入力源がないため、この参照はformal source inputではなくcandidate materialである。

### after-body witnessの枝と変更順序

固定artifactを先に固定した時点では、意味のみが決まり、`head`や`sequence`のschema・値は指定されていなかった。その後、候補fixtureの最初のafter-body例はbaseline H0を維持してsequenceだけを40へ動かした。この枝は「H0対象のRed記録がbody変更sequenceより後」という候補上の順序所見で、実行自体がbody変更後だったとは証明しない。L9候補を既読であるため、既存L9のsequence-only形から独立に導いたとも主張しない。

R1 reviewで固定artifactの意味が「本体実装/修正後revisionでだけ出るRed」と再確認され、H0枝ではその意味を満たさない漏れが特定された。そこで既存H0枝を残したまま、追加のcase deltaで`red.head=H1=body_change.to_head`かつ`red.sequence=40>body_change.sequence=30`のwitnessを追加した。L5の`after_body_red`はこのH1枝とH0遅延記録枝を別branchとして明記し、H1のみを固定artifactのafter-body revision意味に対応づける。H0枝はsequenceを実行順序proxyとする候補設計上の所見として分ける。固定artifact bytes、L4、L9、既存期待は変更していない。

checkerの`CHK-OWNERSHIP-CAP-L8L9`は、禁止keyに基づく限定検査でbyte/KB上限ではない。基点と候補のchild結果を同条件比較し、L8既存1647件は増加せず同数だったが、これはL8追加領域の品質保証ではない。候補のraw fixtureをL8から除いてresearch artifactへ移したのは、QA §3のL8責務（U-ID行）へ合わせるためである。

## 明示した未決・設計選択

- **headとrevision:** candidate fixtureでは`pre_body.head`、`body_change.from_head`、`red.head`を対象コードrevision tokenとし、`Ref.revision`をsource record revision metadataとして別扱いにした。L3/L10はfield名・比較方法を定めず、L4はH0を例示するだけなので、この対応はL5の設計選択である。
- **environmentとsyntax:** L3/L10は両方を無関係な失敗として挙げるが、L4負例codeは`environment_error`。syntax witnessも同じL4候補へ束ねるのは、本PRで明示した選択で、closed taxonomyや上流決定とは主張しない。
- **未実行とactual:** candidate unexecuted fixtureでは`executed=false`かつactual観測値をabsentにした。`executed=false`なのにactualが存在する入力の優先順位は未決で、分類していない。
- **重複分類:** 複数のnegative predicateが同時に成立する一般入力の優先順位は決めていない。研究artifactの各行は共通baselineと差分から成る有限candidate fixtureである。
- **owner checker:** L5には`pure_function_signatures`の`F-015-05`を追加したが、checkerは現行L5 `functions[]` からfunction ownerを解決する。checkerを通すためのaliasやclass markerは追加していない。typed owner解決と4way結合は未完了。
- **4way residual:** PR-A以降も28負例全体のL5/L8/L9 matching、独立review、freeze、formal oracleは未成立。本候補のL8 candidate casesは既存L9 `unit_cases`との連携行ではなく、checkerの4way case数を満たすものとして数えない。

## 旧HELIX sourceと同種失敗

旧source `archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md:23-24`（`LEGACY-ASSET-5E22432B0A5A8F7CC8B3`、SHA `9eac2cc9e5fa8f1177b39f86681fa928cb22070666a5306dce7ae6943597d7af`）は、Redを意図した欠陥の実検出とし、Green・Refactorも同じoracleに結ぶ。旧PLAN `archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-REVERSE-28-red-first-tdd-evidence.md:54-60`はRed-first evidenceが機械的に強制されていなかったことを記録し、Red/Green evidenceの欠落・逆順を扱うが、実行前Redの原因分類までは定めないため、その仕組みを本候補へコピーしていない。旧sourceは参照だけで、CLI/runtime/test/CIは実行していない。

同種失敗の実記録は、旧 `A-114 DDD/TDD Strengthening Re-Audit`（`archive/legacy-generation-2026-09-14/root/.helix/audit/A-114-ddd-tdd-strengthening-reaudit.md:37-41`）と `A-115 DDD/TDD Increment Closure`（`archive/legacy-generation-2026-09-14/root/.helix/audit/A-115-ddd-tdd-increment-closure.md:19-27`）である。A-114は15件のPLANがdraftかつreview evidenceなしの一方、実装がshipped済みだった状態を記録する。A-115はpolicy名だけでなくinvariant検出、trace、Red-first順序、oracle強度とnegative testの実質を記録する。本候補はこの境界に合わせ、入力事実を読む述語・negative例・期待projectionを明示したが、algorithmを実行せず、機械検出や承認成立を主張しない。現行のWR206ではPR-A記録（#3950）にL4/L9 28分類に対しL5/L8分類0、child失敗33件が記録され、既存ownership-cap L8=1647が残る。これを対象にF02のみのcandidateを起こし、残り27分類とownership-capは触れていない。

## 静的検証

再現用の静的validatorは [`validate_static_candidate.py`](validate_static_candidate.py)。L5述語を実行せず、候補source pin、fixture参照、候補出力projection、L8から指すL4 output contractのRFC6901 pointer解決、H0/H1の枝とsequence条件、既存L5/L8期待およびL4/L9 bytesの不変だけを照合する。L8のcase行にraw payloadを保持していないことも確認する。検証値は [`verification-summary.json`](verification-summary.json) に記録する。`check-child`のowner/4way残件、SCF validate/stale、PR範囲diffも静的文書構造の確認に限る。
