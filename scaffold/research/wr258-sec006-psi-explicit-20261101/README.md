# WR258 SEC006 project-scope-isolation L4/L9分類と4層統合候補

状態: `scaffold` の検討証拠。authority effect: none。基準revision: `3e469f273817af640a2adafa50b8548b22a107fd`。Binding: `SCF-B-0218`。

本資料はSEC006のL4↔L9分類と、L5/L8を含む4層移行候補を記録する。正本L4/L9の初回整理は `integration-candidate.json`、L8 52行とL9 98行の機能入力照合、91件のL8候補対応、50件のL9追加case候補、fallback 6件の衝突は `rowwise-integration-design.json` を参照する。後続の統合候補実測とf328で生成した全文overlayの撤去記録は `post-f328-followup-r1.json` と `f328-overlay-disposition.json` を参照する。checker入力は固定revision `f32812ea08cc88545ea228e71146738553ae1e35` の一時git worktreeでのみ再構成し、repositoryに全文overlayを保存しない。`overlay-reconstruction-r2.json` は再構成後のcompactな再実測結果である。候補は正本のcaseや実行oracleではない。

L9の98行では `negative_class_assignment.classification` に旧nested `negative_classifications[].code` が保存され、同じassignment内の `class_id` と `expected_classification` は現行top-level classを指す。旧labelはsource pointerが指す旧taxonomy名であり、現行のtop-level class名・codeとは別の識別子である。checker legacy modeはこのassignment欄を読まない。explicit modeはclass tableとL8/L9 `negative_class_ref`を読み、この旧欄は参照しない。98行すべてで旧labelと現行class_idの対応を保存した。現L4 nested rowsには`code`だけがあり`id`/`class_id`はない。top-level class IDsとの交差は0件で、integrated overlayでも二重定義FAILは0件だった。

L8 52 canonical rowsをL9 98 rowsへ、L5 `function_read_fields`と入力のpresent/null/omitted状態で比較したところ、完全なfunction-consumed projection一致は2つのL8行から7つのL9行に限られた。`SEC003-L8-FALLBACK-PRIMARY`は6つのcaller別primary-treeケースへ一致し、`SEC003-L8-FALLBACK-OTHER`はother-project 1件へ一致する。残る50 L8行には現L9の完全一致projectionがない。WR250 R1の98行候補からは91件を保持、7件を既存のL8入力・結果との一致で除外している。除外6件はprimary-tree caller行、1件はother-project fallback行である。91候補はすべて`candidate_not_canonical`かつ`not_executed`。

L9側では各98行の現行class・expected classification・L4 class key対応を行ごとに保持した。未対応50行について、L8 case pointerはfunction input projectionを照合するためだけに使い、oracle導出には使わず、L3/L10参照とL4 classからL9候補の`condition`、`expected`、`expected_preserved`を独立に導出した。L8候補側も同じL4契約を別に投影して一致を照合した。具体的なL9統合request/source traceと実行oracleは現行sourceにないため、candidateは未実行のまま正本L9へ追加していない。

4層markerは正本に追加していない。基本overlayはL4/L5/L8/L9の4 markerを全て持ち、L8は52 canonical+91 candidate=143 rows、L9は98 existing+50 source-derived candidate=148 rowsで計測した。`new_parent_link`で評価され、L4↔L9 pairとL5↔L8 pairはPASS、4wayはFAIL（class rows 16/16/16/16、141 matched cases、16 failures）。condition/expected/expected_preserved不足は0件。基本overlayにはprimary-treeの1 L8行から6 caller L9行への一対一不一致（1 unresolved L8 ref、6 unreferenced L9 rows）と、`SEC003-L8-OPERATION-DEFER`の空finding owner導出が残った。この空findingを埋めるfindingは作らず、局所function出力とsystem observationの違いを保持した。

`SEC003-L8-FALLBACK-OTHER`と`SEC003-OTHER-PROJECT-FALLBACK`は`/request/fallback=other_project`、finding、ownerが一致する一意の1対1候補である。6つのprimary-tree L9行はcaller kindを保持する一方、現`compare_fallback`は`/request/fallback`だけを読み、全6件の投影値は`primary_tree`。現`compare_caller_material`はcaller kindを個別に読むが、既知6 callerすべてを同じ`corresponding`/空findingへ写す。`compose_scope_proposal`は両者の`PartAnalysis`を合成するが、生のcaller kindを読まず、呼出し元identityは合成時に区別されない。このため現在の関数契約だけでは同一のfallback観測を6行へ水増しできない。

別V-pairの候補として、`compare_caller_material`が既に読む6種のknown caller値を来歴fieldとして返し、`compose_scope_proposal`がcaller partからその値を無変換で返す案を作った。callerごとに入力と戻り来歴が異なるため、6件は同じunit観測の複製ではない。L9側は既存6 system requestからcaller kindを独立に期待し、fallback違反findingとclassは維持する。f328の一時overlayでは6行すべてが一対一で対応し、L4↔L9 pairとL5↔L8 pairはPASS、4wayは147 matchedでFAILとなった。固定commitから一時worktreeで再構成した測定でも同じ147 matched/9 failuresを再現した。残る失敗はoperation-deferに関する空finding owner 1件と、その空finding class keyのL8/L9双方での不一致各4件（計9 failure）。unknown/absent/malformed callerの来歴field表現はこの6行候補からは決めていない。overlayは設計候補のchecker形状計測であり、実行済みL5関数や完了証拠ではない。

`SEC003-L8-OPERATION-DEFER`は`compare_operation_scope`の局所結果で、L5はconnection absent時にunknown/空findingを保持し、接続不在findingはconnection function側に残す。L9の対応operation-absent system casesは全体の`isolation_violation`と`explicit_connection_absent`を観測する。両者を同じexpected classへ寄せると局所deferかsystem-level違反のどちらかを失う。現在のcheckerは空の`ordered_findings`からownerを導けずFAILするため、別checker/QA pair候補で `compact_whole_observation.declared_backflow_owner` を空finding時だけ許す最小案を記録した。L4診断ownerと4層class ownerの一致を必須にし、field欠落・偽owner・非空findingへの重複宣言を拒否する静的候補確認は `checker-empty-finding-owner-candidate.json` とそのstatic-check出力を参照する。現checkerは未変更でFAILのまま。

`build_overlay_probe.py`、`build_rowwise_design.py`、`build_caller_provenance_overlay.py` は候補資料を再構築する。`reconstruct_overlays_in_temp_worktree.py` は固定revisionの一時worktreeでのみ全文overlayを生成し、check-childを実行してcompact結果を記録する。現行L5 read/returnだけではprimary-tree case bijectionは成立しないが、L3/L4のcaller区分と原identity保持から別L5/L8 V-pairのprovenance候補を設計し、overlayで6行対応を測定した。4層markerの有効化はQAが全4層同時markerを求める一方、作業規則が1 PR 1 V-pairを求めるため、別pair PRの通常逐次mergeでは途中の部分marker状態が発生する。原子merge手段は確認できておらず、この両規則の適用方法は判断課題として記録する。L3/L10、QA、L5/L8/L9正本、旧証拠revision/hashは変更していない。

局所unknownを返す`SEC003-L8-OPERATION-DEFER`と、全体で`explicit_connection_absent`を返すL9 system caseは異なる観測である。現在のcheckerの9残件は、空finding owner 1件と、同じ空finding classへのL8/L9 owner_ref結線が各4件失敗する。`checker-empty-finding-owner-candidate.json`のwhole-observation owner宣言だけでは両観測を分離できず、L9 whole oracleに架空のfinding/ownerを加えても解決しない。別候補`operation-defer-and-pr-split-candidate-r1.json`に、L9 component observationをsystem oracleと併置する場合のQA/checker差分、既存source事実・旧HELIXの非先例、6 callerのL3/L10/L4/L5由来、V-pair分割と未解決事項を記録した。候補schemaは未承認・未実装で、canonical L4/L9/L5/L8/QA/checkerは変更していない。

## PR #4007 R1追補

PR #4007 R1指摘を反映した正本の現状は次のとおり。`operation-defer-and-pr-split-candidate-r1.json` と初回測定は時点証拠としてそのまま保持し、本追補は後続の正式差分を記録する。

- L4の`failure_classifications`は15件。空findingの`SEC003-F02-OPERATION-CONNECTION-ABSENT-DEFERRED`は局所unknown分岐で負例classではないため、L4 class表とF02 `negative_class_refs`から除いた。L8 `SEC003-L8-OPERATION-DEFER`の正本はこのL4/L9 pairでは変更せず、後続L5/L8 pairで通常U-IDとして扱う。
- L9は元の98 negative rowsについてcase ID、期待観測、nested `negative_class_assignment.classification`を維持し、direct `negative_class_ref`のみ追加した。さらにL3/L10/L4のoracle意味から短い未実行system-oracle rowを50件追加し、計148件（F01 93、F02 55）とした。追加行はL8 fixture/input/expectedを持たず、source pointerはL3/L10/L4に限る。追加された5 classすべてに少なくとも1件のL9 rowがある。従来のmulti-contract残件16件は維持。
- Candidate 046の局所空findingはL9 whole-system oracleとして使わず、接続不在に対するsystem-level `SEC003-F02-EXPLICIT-CONNECTION-ABSENT`へ独立に再導出した。局所defer classへの参照はない。
- L4/L9にexplicit class markerを置き、L9全148 rowsへ`negative_class_ref`を設定した。L5/L8 markerはなく、QA/checkerは変更していない。#3996の部分marker事例に合わせ、check-childのpartial-marker FAILをそのまま記録し、4way PASSとはしない。

`validate_pr4007_r1_followup.py`は従前98行の変更範囲、追加50行のL3/L10/L4参照とexpected/class対応、15 class、148 total、16 residual、caller/old nested label保持を独立に静的照合する。checker実測、latest-main merge overlay、scfctlの結果は別の`pr4007-r1-followup-20261101.json`に記録する。

R1の実装・統合測定・98旧行保持と50 oracleの静的検証を `pr4007-r1-followup-20261101.json` に追加した。最新main `569bde0bc5792349f0833461f0bb1bb6db33c592` との一時squash overlayでもL4/L9・L5/L8 pairはPASS、4wayは0 matched/79 failures、validate 200/0、stale 0を実測した。これは完全な4way合格を示さず、L5/L8後続pairを要する中間状態である。

追補後にremote main refが`569bde0`から`6a7fbfbe134e9163976fa67319044fa0bc03973f`へ動いたため、最新refからの再測定を別記録 `pr4007-r1-main-overlay-r2-20261101.json` に追加した。最新overlay tree `9001bccd3806146018309ca2b1f0d8e914897ce7`でもpairはPASS、validate 201/0、stale 0、check-childはpartial-markerにより0 matched/79 failuresだった。先行569bde0 measurementは時点証拠として残す。
