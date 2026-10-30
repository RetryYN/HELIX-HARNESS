# WR220 OS017 F02 source-unresolved pair証跡

status: scaffold研究証跡（候補のみ）
authority_effect: なし
base: `a53f04482ff883decf1019dc9c212ab712271749`
binding: `SCF-B-0190`

## 対象範囲と結果

固定blind導出で参照した上流要求は承認済みL3/L10 B01のみであり、加えてL4 diagnostic-contract散文とL7 `/cases/51`・`/cases/53`のraw `given_input_ref` graphだけを使用した。F02はblind導出の根拠に含めていない。期待値閲覧前にfreezeし、Issue #3510 comment 6531650415へ記録した。blind固定後、class候補のpair scopeを確認する別工程として、承認済みL3/L10 F02行をapproved revision 5c62d19とworktree base a53の両方で照合した。両行のcanonical SHAは`comparison.json`に記録し、内容は一致した。L3/L10 delegated approvalはPR #2952でmain admission済みであり、merge commit 2945b75bc5をrepository historyで確認した。固定artifactはbyteを変えずにコピーし、SHA-256 `61647d1a18cb523bbc70af246f670fd8c42c35e6b8ec9511b83358be0a81332d`を確認した。

freeze後にL7、L8、L9のexpected行を比較した。両行ともphase `resume`、condition `workflow_material_unknown`、finding 1件`source_unresolved`、未実行という点で一致する。L7は入力内の論理pointer（`/authority/source_ref`、`/resource/source_ref`）を示し、blind導出は対応するraw objectのpointerを記録している。L8/L9にはfinding pointer、facet、return ownerの指定がないため、それらの項目はL4 contractの散文とblind導出で裏付けられ、L8/L9の各行だけからは確定しない。

2つのnull leafは異なる。witness 51は`authority.source_ref`がnull、witness 53は`resource.source_ref`がnullである。各入力はworkflow facetをunknownにし、他のfacetはcorrespondingのままである。pointerが異なるため、L4のdedup key（code・pointer・return owner）では統合されない。L4-F02候補class `OS017-NEG-workflow-resume-source_unresolved`を、L9-F02の両行から`l4_source_class_candidate_ref`で参照する。L9 expectedは不変である。L9同層のnegative-class membershipや4-way PASSは成立していない。

基点ではL9にsource-class候補参照が63行あった。今回2参照を加え、参照行数は65行となるが、class数が65になったことを意味しない。Issue #3510 comment 6531608819はOS017の別個の負例inventory snapshotであり、integration row 217件、negative row 198件、参照済みrow 63件、残り135件、group 33件を記録している。これらの集計値はinventory上の文脈であり、このpairの閉包を示さない。

## 失敗の根拠と旧HELIXとの比較

旧HELIX資産`LEGACY-ASSET-3A15E5645D2D2A59DFF5`（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md`、80–82、105、190、194行）は、ticketの意味をassignment、attempt、measurementから分けている。この候補でもその区別とsource ownerの境界を保ち、現在のL4 source-qualified class表現へ変更する。旧CLI、DB、schema、admission機構は採用しない。旧運用artifactから現在の要求やgateを作らないためである。

同種のtraceability失敗として、`LEGACY-ASSET-A127DEC3EEE6ED63CF17`（`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`、71行、UTW-005）は、PR trace/review証跡が最新HEAD/merge-baseへ一貫して再束縛されていなかった事例を記録している。このbundleではsource revision、witness pointer、比較結果、候補参照を固定する。実行や閉包を主張するものではない。

## 制約

- L7の論理pointerとraw graph pointerは異なる表現である。この違いを消すために、固定blind証跡も正式expected行も書き換えていない。
- L8/L9行はfacet、owner、serialized pointerの詳細を定めていない。候補から実装結果のschemaを推定しない。
- L9行は`not_executed`/`not_observed`のままである。実incidentの同一性、dedup判断、ticket、Reverse action、完了を主張しない。
- L4/L5 algorithm、旧runtime、test、CIは実行していない。

source hashと各rowの詳細は`comparison.json`を、byteを保持した固定artifactは`blind-derivation.json`を参照する。

## 静的検証

`validate_candidate.py`はsource pointer 13件を解決し、L7 raw graph root hash、authority/resourceのnull leaf、5c62d19とa53の承認F02行一致、およびL9 expected不変を確認した。`check-child.json`には全体の実測を保存した。L4/L9 pairは4対4でPASS、L5/L8 pairは4対4でPASS。一方、negative 4-wayはL4=5・L9=0・L8=0・L5=0、matched=0、failure=8でFAILした。これは既存の静的legacy casewise checkerの結果であり、動作実証でも4層成立でもない。

既存WR204静的validatorも、互換性の最小修正後に通過した。従来4 classの全row/invariant、F01/B01 link、marker境界、宣言pointer、51 input witness、12 role witness、既存L9 link、cross-facet reuse、217行のL9 expected digest不変を引き続き検査する。別分岐でWR220 F02 classを1件だけ認識し、cases 51/53のcandidate-reference追加だけを許可する。実測出力は`comparison.json`に記録し、validator pinはSCF-B-0184で更新した。
