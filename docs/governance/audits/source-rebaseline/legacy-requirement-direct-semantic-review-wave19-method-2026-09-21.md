# Wave19 旧HELIX要求直接semantic review method（2026-09-21）

## 範囲

Wave19 は、main merge HEAD `17ce6830d2d4c684c96d55705cdc65790a4fdaa4` に積むローカル限定の research-premise candidate です。main merge parents は `4bff98789877b5b9b3b65c181a63ea1c1d826ee3` と Wave18 exact HEAD `e40f7f778117864dc2271af323977ca6e4fd1e4c` です。初期作業時の `cfff5c3c006be85b91b2b1197bc5b239528e42a8` は旧Wave18 snapshotとして扱い、現在の親authorityには昇格しません。sourceの歴史的基点 `6dad906ed9a52c9e49611931645db2f298c6bf6a`、main merge parent、Wave18 exact headを分離して固定します。

対象は `wave19_selector` が選んだ次の4 contiguous product unitです。

- `IRUNIT-HIL-BR-23-HELIX-HARNESS`
- `IRUNIT-HIL-BR-23-HELIX-OS`
- `IRUNIT-HIL-BR-24-HELIX-HARNESS`
- `IRUNIT-HIL-BR-24-HELIX-OS`

4 unit、10 evidence edge、累計58/218 unit、171 asset edge、残り160 unitです。JSONL は schema revision 10 の research-premise candidateであり、要求採否、authority、実装成立、consumer closure、完了を確定しません。

## 固定入力と境界

要求edgeは `LEGACY-ASSET-A60CF91DD2AF6693E6F9` のRequirement IR、原文markdown、要求ID、raw行、semantic digestを同時に固定します。非要求edgeは asset catalog の candidate role、path、digest、classification、candidate phase/product を照合します。candidate membership は意味証拠ではありません。

BR23-HARNESS と BR23-OS は `Template Gap Issueとして改善loopへ戻す` を共有atomとして保持し、Requirement Translator、template gap検出、OS側改善loopの責務を候補境界として分けます。BR24-HARNESS と BR24-OS は要件定義を設計対象とするatomと revision履歴の共有を保持します。product境界は人間判断pendingのままです。

BR24-OS は decomposition の直接phase候補が空で、crosswalk の phase/product candidate pool も0です。同じ7 anchorの bounded catalog searchは2,650候補を返し、共通requirement 1件を選択、2,649件を未reviewとして保持します。このため要求source edgeだけを置き、design／implementation edgeは作らず、missing evidence receiptには direct phase=[]／pool=0による未選定を記録します。空のpoolからphase、asset、実装を推測しません。

旧archiveは静的read-onlyだけに使いました。旧runtime、test、hook、CI、adapterは実行していません。phase capability と旧assetの存在は、現行実装、oracle、consumer closure、release、完了へ昇格させません。

row field 集合は schema10 の固定集合として閉じ、要求atomは選択されたIR/raw excerptへ source fragment 単位で接地します。非要求rowも要求rowのatom objectと完全一致することを要求し、未知field注入、要求atom接地欠落、候補atom改変は陰性ケースで fail-close します。

## 検証

`verify_legacy_requirement_direct_semantic_review_wave19.py` は、schema10 row/meta field閉包、再baseline parent、Wave1–18 prior digest、meta.inputs path閉包、prior edge／asset重複、Requirement IR/raw anchor、catalog digest、decomposition/crosswalk/phase join、atom provenance、row atomization hold接続、controlled anchor mapping、bounded search receipt、BR24-OSの候補2,650件／未review 2,649件と空phase／空pool、missing evidence receiptを静的に検査します。stale anchor、mapping欠落、receipt改竄はfail-closeの陰性ケースで拒否します。

phase／implementation は候補から再導出される値として扱い、行と集計を `authority_effect=none`、`consumer_closure_status=pending`、`legacy_execution_status=not_run`、`current_requirement_implementation_status=not_established`、`new_build_allowed=false` に固定します。
