# WR258 SEC006 project-scope-isolation L4/L9分類と4層移行候補

状態: `scaffold` の検討証拠。authority effect: none。基準revision: `3e469f273817af640a2adafa50b8548b22a107fd`。Binding: `SCF-B-0218`。

## 現行のL4/L9

L4の`failure_classifications`は15 class、L9のnegative caseは148行（F01 93、F02 55）。従前の98行はID、expected、expected_preserved、nested `negative_class_assignment`を維持し、R1で直接`negative_class_ref`を加えた。nested `classification`は`source_pointers`が指す旧`negative_classifications[].code`名を保持する履歴labelであり、明示modeの参照先はtop-level class tableと`negative_class_ref`である。現L4 nested rowには`id`/`class_id`がなく`code`だけで、統合overlayで二重定義FAILは0件だった。

L9に追加した50件はすべて`not_executed`であり、`condition`は各system oracleを区別する行固有の文章を保つ。50件でconditionは50種類ある。`expected`、`expected_preserved`、classification、axis、stateは対応L4 classと一致し、各rowの`source_pointers`はL3/L10/L4だけを指す。L9にはL8 case pointer、L8由来のcondition補助欄、PR作業用candidate token、重複する`expected_observation`を置かない。戻し先ownerは参照classから得る。追加caseの期待・分類は実行済み挙動ではない。

PR-BでL8側に置く`integration_case_ref`案は [`pr-b-l8-integration-case-ref-candidate-r2.json`](pr-b-l8-integration-case-ref-candidate-r2.json) に保持する。これは固定f328 rowwise設計の50 candidate↔L8 ID対応から作った未適用の候補であり、L8 canonical caseとL9 IDの参照方向はL8→L9である。このPRではL8を変更せず、candidate JSONを正本として扱わない。

L9 `negative_class_assignment.classification`の旧nested codeとtop-level class codeは役割が異なる。R2では98旧行のnested labelを変更せず、50追加行のclass関係はdirect `negative_class_ref`とL4 class keyで表す。F02 operation-deferは局所L8のunknown/空finding、L9 system absentは`explicit_connection_absent`違反であり、両者を同じ観測にはしない。6つのprimary-tree callerもL5 `compare_fallback`上の投影は同じで、L8一対一候補は後続PR-Bで扱う。

## 証拠と再構成

`validate_pr4007_r2.py`は98旧行の保持、追加50件のcondition一意性・L3/L10/L4 pointerと期待値、Python repr不在、L8参照/tokenの撤去、PR-B mapping候補の対応を検査する。R2初回時点の結果は`pr4007-r2-static-validation.json`に保存した。R1専用validator/builder退役後の現行R2 validator・R1 followup validator・binding検査を含む最新main overlay追補は`pr4007-r2-consumer-overlay.json`に保存する。R2初回の最新main measurementは`pr4007-r2-latest-main-overlay.json`に残し、追補で上書きしない。

最新取得した`origin/main` `cd4208605f2a4e77e85f8d34317ff44c7218ad41`とR2候補の合成worktreeでは、`scfctl validate`は203 bindings・失敗0、`scfctl stale`は0 staleだった。正式4文書の`check-child`はL4/L9とL5/L8のpairは合格、4wayは15/15 L4/L9 classに対しL5/L8がmarker・class key未整備のため0 class/0 matched・79失敗だった。L4 owner ref未解決15件を含む現行結果を記録した。

同じworktreeで生成した統合候補はL4/L5/L8/L9各15 class、L8 143行・L9 148行で、141 matched・10 failureだった。残件は`SEC003-L8-OPERATION-DEFER`のexpected/expected_preserved差とL8 class ref欠落、`SEC003-L8-FALLBACK-PRIMARY`のintegration ref未解決、primary-tree caller 6件のL9 case未参照である。これは測定候補であり、formal 4way PASSや正本の変更を示さない。`scfctl validate`で必要だったartifact pathは一時worktree内だけに空のplaceholderを置いて存在確認し、実測後に本artifactを排他的に新規作成した。

773KBの`rowwise-integration-design.json`はf328 commit `f32812ea08cc88545ea228e71146738553ae1e35`の固定入力からbyte-identicalに再生成できることを実測した。現行pathからは外し、blob、SHA-256、計数、再生成手順を[`r2-evidence-disposition.json`](r2-evidence-disposition.json)へ記録した。復元元blobは`a29776ee2d054341a924bc2ad4bc44e33183319f`、SHA-256は`567ba03eff6607c3603b10c9bb443bf06c890364c0aa2106299cc92a81583004`。R1の旧validator/builderも現行artifactから退役し、同dispositionにGit blob/SHA・復元方法・R2への移行根拠を記録した。現行で実行するR2 validatorは通常pathを開かず、f328固定Git objectのhashだけを照合する。PR-B mappingもf328 commit/blob/SHAを明記した履歴参照である。その他のrowwise path記載は当時の測定/候補を説明する保存済み記録で、実行時consumerではない。現行validatorは`validate_pr4007_r2.py`で、rowwise Git objectを固定f328から読みhashを照合する。`validate_pr4007_r1_followup.py`はL3/L10/L4由来のcase保持・class検証を続けるがrowwise artifactを読まない。R1 uniqueness validatorとrowwise builderの現行コピーは退役した。最新main overlayで両validator、`scfctl validate`/`stale`、正式および統合候補`check-child`を再実行した追補を[`pr4007-r2-consumer-overlay.json`](pr4007-r2-consumer-overlay.json)へ保存する。

L4/L9 pairの明示markerは維持され、L5/L8 markerとcase-arrayは未整備である。したがって正式4way check-childはpartial-marker FAILを返す。FAILを4way完了として扱わず、L5/L8側は別V-pairのままとする。
