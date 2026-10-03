# L3-D0 現行locator訂正の監査記録

- 基点: `7b3001ea516dd880964480ec1082936723a5dd37`。
- 9/26の配置判断が記録する119組について、旧sourceと移動先の各SHAを判断記録と照合し、両側119/119が一致した。109組はbyte-identical、10組は記録済みのMarkdown相対リンク追随差分。
- HIL-FR-53（`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`）のpath独立identity・履歴保持と、HIL-NFR-21のappend-only保持に従い、旧register prefix 978行と旧receipt bytes 52件を保持。registerへ97行（13 holding、84 candidate）を追記し、現行receipt successor 52件を作成した。
- 現行head数はcandidate 384件、source holding 47件で前後不変。旧holding ID・旧pathのcurrent reference、structured receipt referenceは0件。52 receiptへのcurrent pointerは全fragmentを保持。共有DESIGN-BOTTOMUP receiptのnested holding IDとevidence locatorもsuccessorへ追随。
- 19 Bindingのregister pin SHA・更新日・日本語upstream noteのみ追随。role、scope、obligations、採否、authorityは不変。
- 137静的validatorはbaseと同じ82 pass／55既存fail、exit変化0、failed path集合不変。出力が異なった5件は全文をbase/finalで再実行し、worktree pathを正規化後に5/5完全一致、新しいerror code・exception・missing pathは0件。`scfctl validate`は143/0 fail、selftestは69/0 fail、govcheck・生成確認・govcheck selftestはpass。
- 保持した7つのreceipt leafは現行参照ではなく時点記録である。①WBS receiptの`legacy_source_boundary.holding_path_relocation`は旧locatorを歴史行として明示、②HIL-11 receiptの`review_corrections[1]`はsuperseded -003時点の記述、③FR39/NFR24・FR42/NFR26・LABO qualification receiptの`evidence_refs[4/4/8]`は直前receiptを訂正根拠として保持、④NFR25 receiptの`po_choice.B`は当時AIがPOへ提示した選択肢の固定記録（PO選択・承認の証拠ではない。現行参照はregister/partitionで訂正済み）、⑤NFR14 receiptの`old_normative_source`は旧規範source境界を保持する。各JSON Pointerと理由は本記録のJSONに収録した。
- この訂正は既存9/26移動先に限る。Web統合、要求意味・採否、L3承認、新規rule・alias・承認gateは含まない。
- 詳細な13 holding map、84 candidate map、52 receipt map、119 path/SHA map、例外leaf、検証値は[監査JSON](l3-d0-live-locator-closure-2026-10-03.json)を参照。
