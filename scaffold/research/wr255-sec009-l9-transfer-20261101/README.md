# WR255 SEC009 L9 pointer移行監査

この監査はL4/L9 V-pairのscaffold evidenceです。authority、実行結果、個別test oracleは生成しません。L5/L8正本は変更していません。

## 基準revisionと再実行

- 移行前の最新main: `ad2dfaf6f434fbb81cd34988d4bd76212380f3a5`。移行前L9 SHA-256は`e918a289fe88446b3f84210577f0fe8094505d9dac9d9a8713cd074eb6776e5b`。
- R2歴史L4: revision `c50eb21b34f034262ced3f8052d2502fb84c57c9`、SHA-256 `d46e39cad2e2a90cfc532fa57226a4d650336e794a375f07e1cc2e6cbba15eb3`。
- 現行L4 SHA-256: `00376c402930e1287e9e0e896804b1de8a20390f8abbea8377b70712f868b9da`。
- 現行L9 SHA-256: `8296d811f95f94d9391a15a597839ee7f9d47b32dd7c7b780312821fc1c52a19`。

repository rootで実行します。

```sh
python3 scaffold/research/wr255-sec009-l9-transfer-20261101/validate_l9_pointer_transfer.py
python3 -B scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json --l9 docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json --l5 docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json --l8 docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

validatorの通常実行はread-onlyで要約をstdoutへ出します。全alias照合結果を持つ監査JSONは、明示的な`--record`でだけ内容hash名の専用pathに保存します。既存pathの内容が違う場合は失敗し、上書きしません。

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

## Consumerの読み方と検証範囲

現行`design_verification_checker.py`のexplicit modeはL4 `failure_classifications`、L9 `negative_equivalence_classes`/`integration_cases`をpair照合します。L9の`source_case_refs[].basis_pointers`や`negative_class_assignment.source_pointers`の文字列はこのcheckerが解釈しません。したがって、L9 sourceの参照先をcanonical aliasへ更新し、監査validatorが全580箇所をRFC 6901で解決して同値性を確認します。従来のR2/R1 measurement validatorと、`wr255-sec009-l4l9-supplement-20261101/validate_l4_l9_supplement.py`が持つ308件のpointer inventoryは移行前時点の記録です。現在のL9を検査するvalidatorとしては使わず、移行前の測定はGit履歴と固定revisionから辿ります。

L5側の30 refsがなおnested payloadを読みます。また、L9の3歴史参照はR2事実の復元に必要です。このため今回の移行はL9の580参照に限定し、L4 nested撤去、0209 transfer完了判定、retireは行いません。
