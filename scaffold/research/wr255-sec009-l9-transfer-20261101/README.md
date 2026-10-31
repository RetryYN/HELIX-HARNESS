# WR255 SEC009 L9 pointer移行・case section撤去監査

この監査はL4/L9 V-pairのscaffold evidenceです。authority、実行結果、個別test oracleは生成しません。初回pointer移行でL5/L8正本は変更していません。後続PR #4022では別のL5/L8 pair作業としてL5の30 nested参照を移行しています。

## 基準revisionと再実行

- 移行前の最新main: `ad2dfaf6f434fbb81cd34988d4bd76212380f3a5`。移行前L9 SHA-256は`e918a289fe88446b3f84210577f0fe8094505d9dac9d9a8713cd074eb6776e5b`。
- R2歴史L4: revision `c50eb21b34f034262ced3f8052d2502fb84c57c9`、SHA-256 `d46e39cad2e2a90cfc532fa57226a4d650336e794a375f07e1cc2e6cbba15eb3`。
- 現行L4 SHA-256: `00376c402930e1287e9e0e896804b1de8a20390f8abbea8377b70712f868b9da`。
- 初回pointer移行後・case section撤去前のL9 SHA-256: `8296d811f95f94d9391a15a597839ee7f9d47b32dd7c7b780312821fc1c52a19`（revision `22076e0c0f5aa3fe7b8933dfa556565900623487`）。
- current R1候補のL9 SHA-256: `49d74a11e9fdb5976da26789f8f976e92d04fcefe240e840214f6bbde034cde3`。

以下の旧pointer validatorは初回移行時点の測定専用です。固定revisionのworktreeで再現します。

```sh
git worktree add --detach /tmp/wr255-sec009-l9-r1 22076e0c0f5aa3fe7b8933dfa556565900623487
cd /tmp/wr255-sec009-l9-r1
python3 -B scaffold/research/wr255-sec009-l9-transfer-20261101/validate_l9_pointer_transfer.py
python3 -B scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json --l9 docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json --l5 docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json --l8 docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

当時のvalidatorの通常実行はread-onlyで要約をstdoutへ出します。全alias照合結果を持つ監査JSONは、明示的な`--record`でだけ内容hash名の専用pathに保存します。既存pathの内容が違う場合は失敗し、上書きしません。現行L9の測定は下記の`validate_l9_nested_retirement.py`を使います。

```sh
python3 scaffold/research/wr255-sec009-l9-transfer-20261101/validate_l9_pointer_transfer.py --record
```

## 移行内訳

移行前のL9にはnested L4 classification pointer文字列が583件ありました。場所は`cases`内550件と`negative_class_assignment_audit`内33件です。うち580件は、L4の現行`failure_classifications`の同じclass IDを指すaliasへ更新しました。内訳は`cases` 550件と`fixed_taxonomy_source_pointers` 30件です。L9の`given`、`when`、`expected_proposal`、case ID、並び順、その他の値は変えていません。validatorはpointerを元に戻したL9全体を移行前revisionと比較し、pointer以外の差分がないことも確認します。

30既存classの各aliasについて、旧`code`/`change`/`axis`/`state`/`backflow_owner`/`expected`/`expected_preserved`/`expected_side_effect_count`/`source_pointers`と、現行`class_id`/`condition`/`expected_axis`/`expected_state`/`backflow_owner`/`expected`/`expected_preserved`/`side_effect_count`/`source_pointers`を、型と値の両方で比較します。旧`expected_text`には単独の現行同名fieldがないため、現行`condition + " " + expected_preserved.contract_detail`から文字列を再構成し、型と値が等しいことをclassごとに確かめます。

残した3件はR2未割当監査の履歴参照です。F01の`/contracts/1/negative_classifications`は固定revisionで14要素の順序付き配列として解決し、各class IDと順序を検査します。F02は同じ固定revisionの未解決候補2classを個別に保持します。いずれもcurrent L4 nested値と固定歴史値の型・内容一致を確認しました。R2未割当を一つの現行classへ再割当したり、複数のL4 pointerへ暗黙に展開したりしていません。

current L9に残るnested pointerはこの履歴参照3件です。L5の30 nested pointerとL4のnested payloadはそのまま残します。`SCF-B-0209`はpendingのまま、`check-replacement`と`retire`は未実施です。

## latest main overlayの測定

移行前base `ad2dfaf6f434fbb81cd34988d4bd76212380f3a5`を先頭親とするoverlayでcurrent checkerを実行しました。L4/L9 pairとL5/L8 pairはいずれもpass、negative 277件matched、failure 0件でした。L5/L8 validatorもpassし、32 classesと285 U-IDを照合しました。positive 8件は契約最小期待の設計状態で、fixture実測・個別oracle・test citationは未成立です。

`scfctl validate`は207 bindings・0 failure、`scfctl stale`は0件でした。L9 pointer validatorはread-only通常実行でpassしました。worktreeのstatusは各read-only validator実行の前後で変化しませんでした。これらは静的source/pointer照合で、security runtimeの動作を証明しません。

結果の数値、main/candidate revision、source SHA-256、旧validatorの移行前前提は[overlay verification](latest-main-overlay-ad2dfaf6-22076e0c.json)に記録しています。

## 初回pointer移行時点のconsumer

現行`design_verification_checker.py`のexplicit modeはL4 `failure_classifications`、L9 `negative_equivalence_classes`/`integration_cases`をpair照合します。L9の`source_case_refs[].basis_pointers`や`negative_class_assignment.source_pointers`の文字列はこのcheckerが解釈しません。したがって、L9 sourceの参照先をcanonical aliasへ更新し、監査validatorが全580箇所をRFC 6901で解決して同値性を確認します。従来のR2/R1 measurement validatorと、`wr255-sec009-l4l9-supplement-20261101/validate_l4_l9_supplement.py`が持つ308件のpointer inventoryは移行前時点の記録です。現在のL9を検査するvalidatorとしては使わず、移行前の測定はGit履歴と固定revisionから辿ります。

初回pointer移行時点では、L5側の30 refsとL9の3 R2履歴参照が残っていました。この事実は固定revisionの測定です。旧measurement validatorと`wr255-sec009-l4l9-supplement-20261101/validate_l4_l9_supplement.py`の308件条件は移行前stateを測り、現行L9の検証に使いません。

## R1対応後の現行L9

PR #4018 R1への対応として、`cases[].negative_cases`、`cases[].positive_cases`、`cases[].source_case_refs`を撤去しました。撤去前sourceはrevision `22076e0c0f5aa3fe7b8933dfa556565900623487`、L9 SHA-256 `8296d811f95f94d9391a15a597839ee7f9d47b32dd7c7b780312821fc1c52a19`からGitで復元できます。現行L9はこれらのcase payloadを複製しません。

撤去前の285 caseでは`given`が一つの共通値、`when`も一つの共通値でした。各rowの固有のscenario/条件/最小期待は既存`integration_cases` 285行の`condition`、`expected`、`expected_preserved`に残り、内容は撤去前revisionと同一です。L3/L10にはB01/F01/F02のsystem oracleが各1件あり、L9 groupからの参照鎖を照合しました。これは個別oracleではありません。positive 8行は設計条件のまま`case_marker_only_not_observed`、全行の`oracle_id`と`test_citation`はnull、個別観測はありません。固有のgiven/whenは存在しないためL7へ新しいfixtureを移していません。

current `integration_cases[].source_pointers`からL9自己参照285件を外しました。negative 277行は同じclass IDのL4 canonical aliasを指し、positive 8行は対応するL4 contractを指します。L8正本の現行`l9_case_pointer` 3件は`/cases/0..2`のgroup envelopeを指すため、envelopeを残してL8↔L9のrequirement/oracle ID対応を検証します。L8 `unit_cases`の285 `integration_case_ref`も全件L9へ解決します。

SCF-B-0209の旧R1 addendumにあった2件のnested case pointerは書き換えず、R2 addendumで上記固定revisionへの由来と現行`integration_cases` rowへの対応を追加しました。30 taxonomy aliasは前回監査の型・値proofを再利用し、3 R2履歴参照（F01の14要素順序付き集合とF02候補2件）は固定revisionと照合します。L4 nested payloadと3履歴参照が残るためSCF-B-0209はpendingのままです。`check-replacement`/`retire`は実施していません。

### 現行の読み手と固定履歴の区別

- 現行`design_verification_checker.py`のexplicit modeはL9 `negative_equivalence_classes`と`integration_cases`を読みます。`cases[].negative_cases`は同modeのcase sourceではありません。旧casewise modeは`cases[].negative_cases`を読む実装を残しますが、現行SEC009はexplicit markerを持ち、今回の`check-child`実行はexplicit modeです。
- 現行L8正本は3つのgroup envelope pointerだけを持ちます。各envelopeを維持したため現在のreferenceは解決します。
- `scaffold/research/wr245-sec009-explicit-pair-measurement-20261031/checker-trials/inputs/`は固定trial input bytes、`multi-contract-residual-audit.json`と`r2-ambiguous-source-first-design.json`は固定revisionから抽出したsource/auditです。これらのnested pointerは現行sourceへの実行時consumerではなく、対応する固定Git revisionで解決します。
- 上記researchの旧validatorは当時のsource stateを照合する測定です。`validate_pr_a_r1_correction.py`等はsource tree依存のため、当時のrevisionのworktreeで実行してください。現行L9は下記の新validatorだけで検査します。

現行sourceはrepository rootから次で再検証します。

```sh
python3 -B scaffold/research/wr255-sec009-l9-transfer-20261101/validate_l9_nested_retirement.py
python3 -B scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json --l9 docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json --l5 docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json --l8 docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

validatorは通常read-onlyでstdoutへ要約を出します。監査artifactを作るときだけ`--record`を付けます。出力先はcurrent L9 SHAを含む新規pathで、既存ファイルは上書きしません。

今回の監査は[case section retirement audit](l9-nested-retirement-audit-bfcdd2c297c08458.json)です。285 nested rowの原文を再複製せず、固定revision/SHA、285 ID対応、共通given/when、現行L3/L10参照、L8 consumer、30 aliasと3履歴参照の検査結果を要約します。
