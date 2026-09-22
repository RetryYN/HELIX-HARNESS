# outside67 PATH011–015 source atomization（Scaffold）

`MPR-SH-OUTSIDE67-001` の67 `path_revision_pair`から PATH011–015 の5件を選んだ、静的な上流source研究候補である。分母67、選択5件、未選択残差62件を固定する。path／blob／文書状態は要求の採択、owner、authority、実装、受入を意味しない。

PATH011 は既存束 [`rdp001-outside67-web-webos-l2-gap-057`](../rdp001-outside67-web-webos-l2-gap-057) が保持する48 atomを、atom本文の複製なしに `reused-atom-references.jsonl` のID・canonical JSON digest参照へ移した。新規 `semantic-atoms.jsonl` は PATH012–015 の200候補だけを含み、二重計上を拒否する。

pre-isolation と archive revision の各行は、revision差分による対応行を含めて、pre側・archive側それぞれ一度だけ `line-coverage.jsonl` へ置く。等しい非空の説明・要求行は `atomized_candidate`、見出し・空行・表見出しは `metadata_only`、表の内容行・複数責務・revision差分行は `composite_unresolved` とする。規範内容を metadata へ退避させない。

product／phase はholdingのpath-based candidate labelだけを保持し、4製品候補、正式owner、phase authority、successor、implementation、degradation、failure、consumer、decisionは未確定とする。旧ledgerのexact text hit／no-hitは静的証拠の有無だけを示し、no-hitから不在・未実装・完了を推測しない。

## 検証

```text
python3 -B scaffold/rdp001-outside67-path011-015-atomization-099/generate.py
python3 -B scaffold/rdp001-outside67-path011-015-atomization-099/validate.py
python3 -B scaffold/rdp001-outside67-path011-015-atomization-099/coverage-audit.py
python3 -B scaffold/rdp001-outside67-path011-015-atomization-099/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは記録した固定base `72b9f368a044709437841c5e862f01802b1a88ec` が現在HEADの祖先であることだけを検査し、live `origin/main`との同値を要求しない。coverage-auditはvalidatorと独立に両revisionの全行・digest・カテゴリを再計算する。selfcheckには偽ledger hit、normative metadata fallback、既存atom digest改変、source改変、重複行、67分母改変、product／implementation／successor昇格の負例を含む。

旧HELIX archiveのruntime／test／CI／workflow／hook／adapterは実行していない。成果物は `scaffold/` 内の `findings_only` 候補であり、正式要求、承認、L2／L11合意、L3／L10設計、実装、release、deploymentを生成しない。
