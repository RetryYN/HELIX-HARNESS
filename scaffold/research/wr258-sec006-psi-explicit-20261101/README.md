# WR258 SEC006 project-scope-isolation L4/L9分類と4層移行候補

状態: `scaffold` の検討証拠。authority effect: none。基準revision: `3e469f273817af640a2adafa50b8548b22a107fd`。Binding: `SCF-B-0226`。

## 現行のL4/L9

L4の`failure_classifications`は15 class、L9のnegative caseは148行（F01 93、F02 55）。従前の98行はID、expected、expected_preserved、nested `negative_class_assignment`を維持し、R1で直接`negative_class_ref`を加えた。nested `classification`は`source_pointers`が指す旧`negative_classifications[].code`名を保持する履歴labelであり、明示modeの参照先はtop-level class tableと`negative_class_ref`である。現L4 nested rowには`id`/`class_id`がなく`code`だけで、統合overlayで二重定義FAILは0件だった。

L9に追加した50件はすべて`not_executed`であり、`condition`は各system oracleを区別する行固有の文章を保つ。50件でconditionは50種類ある。`expected`、`expected_preserved`、classification、axis、stateは対応L4 classと一致し、追加50件のL9 nested rowの`source_pointers`はL3/L10/L4だけを指し、integration rowは重複pointerを持たない。L9にはL8 case pointer、L8由来のcondition補助欄、PR作業番号を含むcase ID、重複する`expected_observation`を置かない。integration rowの共通source pointerはL4 classとL9 nested rowにある同じ根拠と重なるため持たず、`negative_class_ref`と既存nested row IDで参照する。戻し先ownerは参照classから得る。追加caseの期待・分類は実行済み挙動ではない。

PR-BでL8側に置く`integration_case_ref`案は [`pr-b-l8-integration-case-ref-candidate-r2.json`](pr-b-l8-integration-case-ref-candidate-r2.json) に保持する。これは固定f328 rowwise設計の50 candidate↔L8 ID対応から作った未適用の候補であり、L8 canonical caseとL9 IDの参照方向はL8→L9である。このPRではL8を変更せず、candidate JSONを正本として扱わない。

L9 `negative_class_assignment.classification`の旧nested codeとtop-level class codeは役割が異なる。R2では98旧行のnested labelを変更せず、50追加行のclass関係はdirect `negative_class_ref`とL4 class keyで表す。F02 operation-deferは局所L8のunknown/空finding、L9 system absentは`explicit_connection_absent`違反であり、両者を同じ観測にはしない。6つのprimary-tree callerもL5 `compare_fallback`上の投影は同じで、L8一対一候補は後続PR-Bで扱う。

## 証拠と再構成

`validate_pr4007_r2.py`は98旧行の保持、追加50件のcondition一意性・L3/L10/L4 pointerと期待値、Python repr不在、L8参照/tokenの撤去、PR-B mapping候補の対応を検査する。R2初回時点の結果は`pr4007-r2-static-validation.json`に保存した。R1専用validator/builder退役後の現行R2 validator・R1 followup validator・binding検査を含む最終main overlayは`pr4007-r2-final-overlay.json`に保存する。同じmainを基準にした旧overlay測定は固有hash/metricとGit復元情報をdispositionへ保全し、現行path・bindingにはoverlay測定を一つだけ残す。

最新取得した`origin/main` `7d4145ac41ce8aa8d442b6fbb3981c7e83e338c6`とR2候補の合成worktreeでは、`scfctl validate`は204 bindings・失敗0、`scfctl stale`は0 staleだった。正式4文書の`check-child`はL4/L9とL5/L8のpairは合格、4wayは15/15 L4/L9 classに対しL5/L8がmarker・class key未整備のため0 class/0 matched・79失敗だった。L4 owner ref未解決15件を含む現行結果を記録した。

同じworktreeで生成した統合候補はL4/L5/L8/L9各15 class、L8 143行・L9 148行で、141 matched・10 failureだった。残件は`SEC003-L8-OPERATION-DEFER`のexpected/expected_preserved差とL8 class ref欠落、`SEC003-L8-FALLBACK-PRIMARY`のintegration ref未解決、primary-tree caller 6件のL9 case未参照である。これは測定候補であり、formal 4way PASSや正本の変更を示さない。`scfctl validate`で必要だったartifact pathは一時worktree内だけに空のplaceholderを置いて存在確認し、実測後に本artifactを排他的に新規作成した。

773KBの`rowwise-integration-design.json`はf328 commit `f32812ea08cc88545ea228e71146738553ae1e35`の固定入力からbyte-identicalに再生成できることを実測した。現行pathからは外し、blob、SHA-256、計数、再生成手順を[`r2-evidence-disposition.json`](r2-evidence-disposition.json)へ記録した。復元元blobは`a29776ee2d054341a924bc2ad4bc44e33183319f`、SHA-256は`567ba03eff6607c3603b10c9bb443bf06c890364c0aa2106299cc92a81583004`。R1の旧validator/builderも現行artifactから退役し、同dispositionにGit blob/SHA・復元方法・R2への移行根拠を記録した。現行で実行するR2 validatorは通常pathを開かず、f328固定Git objectのhashだけを照合する。PR-B mappingもf328 commit/blob/SHAを明記した履歴参照である。その他のrowwise path記載は当時の測定/候補を説明する保存済み記録で、実行時consumerではない。現行validatorは`validate_pr4007_r2.py`で、rowwise Git objectを固定f328から読みhashを照合する。`validate_pr4007_r1_followup.py`はL3/L10/L4由来のcase保持・class検証を続けるがrowwise artifactを読まない。R1 uniqueness validatorとrowwise builderの現行コピーは退役した。最新main overlayで両validator、`scfctl validate`/`stale`、正式および統合候補`check-child`を再実行した唯一の現行測定を[`pr4007-r2-final-overlay.json`](pr4007-r2-final-overlay.json)へ保存する。

L4/L9 pairの明示markerは維持され、L5/L8 markerとcase-arrayは未整備である。したがって正式4way check-childはpartial-marker FAILを返す。FAILを4way完了として扱わず、L5/L8側は別V-pairのままとする。

## L9 casewise補足（別L4/L9 V-pair）

PR #4007 merge後の基準mainは`151713275e2c2aa65bb23a8fe38eb63c46d570c8`。その時点でL9の既存98行はcasewise `condition`、`expected`、`expected_preserved`を持たず、top-level `integration_cases`もなかった。本補足はL9正本へ148件のcasewise rowを置き、各行のID・class refを現行negative caseへ対応させる。従前のnegative case 148行、15 class table、16件の`multi_contract_residual`は変更しない。

従前98行の`condition`は各L9 counterexampleのrequest/context、finding pointer、比較軸から日本語で個別に導出した。`expected`と`expected_preserved`は対応するL4 classの投影から作り、L9のsystem oracle条件・ordered finding codeと98/98一致を確認した。要求inputも各L4 classのsource条件と98/98整合し、上流意味との矛盾は0件だった。新規50行は既存L9 system-oracle conditionを保持し、`expected`/`expected_preserved`がL4 class投影と50/50一致することを確認した。L9の98 nested `classification`は旧nested taxonomy labelのまま保持し、新しい`negative_class_ref`だけを明示keyとして用いる。

各integration rowにはQA §58の`compact_whole_observation`を置く。既存98行は元の`expected_observation`からordered `code`/`return_owner`を射影し、新規50行はL9 rowのsystem expectationとL4 class ownerから未実行のcompact oracleを構成する。148行すべて`not_executed`で、実行結果やraw fixtureを追加しない。ORACLE-046はoperation read/connection absentのsystem oracleとして既存class `SEC003-F02-EXPLICIT-CONNECTION-ABSENT`へ接続し、局所operation-deferをnegative caseとして紐付けない。

PR-B候補の初回overlay（origin/main `fe6232a6062685aeb15e1b8641533ea86fa712f4`）では、148 case pairのexpected/preservedが148/148一致し、conditionは50一致・98不一致だった。このR1前の測定内容はGit履歴に固定し、本文と復元方法を`pr4017-r1-review-disposition.json`に記録する。QA §58は`condition`をcase単位で完全一致比較するため、L8 `change`はL9 `condition`と同じ文字列にする。`expected`と`expected_preserved`はL3/L10/L4からL8側で独立導出し、L9値の複写ではなく意味一致を検証する。現行PR-B候補との最新照合はR1 overlay測定に記録する。

R1後の行別source/期待照合は`l4l9-casewise-source-audit-r1.json`に148行の固定JSON Pointer・導出結果として記録し、condition、source本文、class共通pointerを複製しない。現行treeにはR1のaudit/overlay各1本を置く。R1前のaudit/overlay本体は重複を避けて現行treeから外し、Git commit/blob/SHAと復元手順のみを`pr4017-r1-review-disposition.json`へ記録した。読取専用validatorは`validate_wr258_l4l9_supplement.py`、専用bindingは`SCF-B-0226`で登録する。SCF-B-0201/0218/0226のL9 current pinを更新し、旧hashをnotesとdispositionに保全する。これらの変更はL4/L9 V-pairとそのscaffold evidenceの範囲内であり、L3/L10/QA/L5/L8 canonical sourceはこのbranchで編集しない。


### 最新origin/main overlayの再測定

`origin/main`は本補足の起点`151713275e2c2aa65bb23a8fe38eb63c46d570c8`から`fe6232a6062685aeb15e1b8641533ea86fa712f4`へ進んでいた。SEC006のL4/L9/L5/L8正本にはその間の変更がないことを確認し、PR-B候補commit `12ce2fe821`、`7da2d1a1b5`、`89a91dfb80cabc206004b50beb825c0461f5c9a1`を一時worktreeで最新mainへ適用して再測定した。SCF-B-0201/0218のL5/L8候補pinとSCF-B-0224のL9 pinを測定overlay内だけで更新し、その前のpin値を各noteに残した。

このR1前overlayではL4/L9 pairとL5/L8 pairがともにPASS。explicit 4wayは148件を対応付けたが、98件のL8/L9 condition不一致でFAILした。条件以外の期待値と保持内容はそれぞれ148/148一致した。condition不一致は独立した日本語表現にすることで解消するものではなく、QA §58の完全一致に合わせL8 `change`をL9 `condition`と同じ文字列にする。expected/expected_preservedはL3/L10/L4から独立導出する。`scfctl validate`は208 bindings・失敗0、`scfctl stale`は0 stale。測定本文はGit履歴から復元でき、commit/blob/SHAと復元手順を`pr4017-r1-review-disposition.json`に記録した。


## PR #4017 R1追補

Claude R1で指摘された148件の`integration_cases[*].source_pointers`（約176KB）は撤去した。共通sourceは参照classのL4 `source_pointers`、入力とsystem oracleは同じIDのL9 nested row（既存98行のassignmentまたは追加50行のsource list）に保持し、current validatorは両方を解決・照合する。casewise監査はID・固定JSON Pointer・照合結果だけをR1監査に置く。

追加50件のL9 IDは`SEC003-L9-ORACLE-001..050`へ改名し、nested row、integration row、PR-B scaffold mapping、現在のvalidator期待を更新した。L9と同時に変更する必要があるPR-AだけでIDを更新し、canonical L5/L8はこのV-pairで変更していない。旧IDを含むR1前のL9、監査、overlay、mappingはcommit `902608f4f606d187e9a83dbf7bbc0c5951f3d674`のblob/hashから復元できるようdispositionへ記録した。

R1最新main overlay（`ad2dfaf6f434fbb81cd34988d4bd76212380f3a5`）では、L4/L9 pairとL5/L8 pairはPASS、ownership capは4/4、pin検査は4組・計68件がPASS（失敗0）。explicit 4wayは0 matched・226 failuresで、L5/L8のmarker/class/case未整備と148 L9 caseのL8参照なしを実測した。`scfctl validate`は208 bindings・失敗0、`stale`は0。各validator 3本はPASS。L9は1,297,308 byteから1,055,315 byteへ241,993 byte減った。詳細は[`l4l9-supplement-current-overlay-r1.json`](l4l9-supplement-current-overlay-r1.json)に記録し、QA §58のL8 `change`/L9 `condition`文字列一致と、L8 `expected`の独立導出を明確に分ける。
