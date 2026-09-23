# #2078 overlap 36件の候補差分照合

このresearch-only bundleは、固定main `2c94d171e9b1f2cb28aaceedf591129fb8e4db2e` のproduct-research union 429件と、PR #2078の固定HEAD `c55ffc91b08aabb0a0216168b3cf2b1e5fe6bf03` を同一asset ID・source path・source SHAで照合します。旧main `b3a3c49b34bfaa1cca5861075d1de18c0e5e7204` と新main間で、四製品L1、8分類JSONLを含む固定入力20 pathのblob/modeがすべて不変であることを記録しました。mainのScaffold差分は既存SCF-B-0118の8ファイルのみで、新規追加はありません。#2078初回HEAD `886c2436a71e079913c395693c2edd9ddce52113`、前回HEAD `8c8cf851b47c88f6d814dc828a38743fc3cd45b3` からの更新後もoverlap 53件・差異36件のID集合、source identity、候補結果は不変です。対象はoverlap 53件のうち `same_source_different_candidate_result` の36件だけです。新規asset研究数は0で、main unionの分母へ加えません。

main側は既存bundleの候補分類、source semantic span、解釈、四製品boundary/L1、明示counterevidence、phase/history/failure/consumer/implementation statusを保持します。#2078側はoverlap結果に保存された候補分類と、同HEADのgenerator内に残るgeneric fallback profileを分けて示します。36件は#2078の最終 `classification-research.jsonl` から除外されています。そのためtarget側の1行source spanと四製品L1比較poolは、pinned generator helper/literalと固定archive bytesから再構成し、targetから実際に出力された証拠とは記載しません。

現在の固定結果は、main候補が `direct_product_basis` 24件（HELIX-HARNESS 12、HELIX-OS 12）と `multi_product_conflict` 12件（HARNESS/OS 11、HARNESS/Web 1）、#2078候補が `insufficient_basis` 36件です。36件はmain側にsource-specificな調査・spanがある一方、#2078側はgeneric fallbackであり、差分は `research_method_state_difference` として扱います。semantic interpretation conflictは両側が独立にsource-specific researchを行い、解釈が両立しない場合に限ります。今回その条件を満たす件数は0です。ほかに `scope_difference`、`evidence_span_difference`、`classification_rule_difference` の証拠付き候補を保持し、原source事実とauthority境界を維持します。

## HEAD追随

targetはbranch名ではなくHEAD `c55ffc91…` のGit objectに固定しています。#2078がこのHEADから進んだ場合は、このbaseline/reviewを停止し、packetを現行証拠として扱わないでください。新HEADとrebase baseを確認した後、`generate.py` と `validate.py` のpinを明示更新し、36件集合、source path/SHA、generator method、全evidence、Binding upstream、negative casesを再生成・再検証してからreviewを再開します。自動的にbranch先端を追いません。

## 境界

`authority_effect=none`、formal classification/route/phase/successor/implementation/consumer closure更新なし、`new_build_allowed=false` をBinding・record・inventoryで維持します。四製品のみを扱い、LABO適用はIssue #2089の棚上げに従い除外します。旧archive source/runtime/test/CI/hook/adapterはGit objectを静的に読むだけで実行しません。

## 検証

```text
python3 -B scaffold/legacy-overlap-reconciliation-0144/generate.py
python3 -B scaffold/legacy-overlap-reconciliation-0144/validate.py
python3 -B scaffold/legacy-overlap-reconciliation-0144/selfcheck.py
python3 -m py_compile scaffold/legacy-overlap-reconciliation-0144/*.py
python3 scaffold/tools/scfctl.py validate
git diff --check
```

`human-judgment-packet.md`は対象一覧と判断境界を示す案内です。各assetの比較証拠は `classification-reconciliation.jsonl` が正本です。
