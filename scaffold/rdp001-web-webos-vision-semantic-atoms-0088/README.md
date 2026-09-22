# Web／Web-OS Vision semantic atom 残り9 span（Scaffold）

基準HEADは `3cdde5dfedfc51ff7c757a2f5fb2eb11a3c6b64c` です。親 `SCF-B-0084` が保持した未処理9 span（`VISION-U17`〜`U19`、`VISION-O05`〜`O10`）を全件選択し、旧 Vision の実source lineと実parent spanへ固定しました。`SCF-B-0081`／`SCF-B-0084` の選択spanおよびatom source lineとは重複しません。

候補は9件です。U17〜U19の3件は一行一概念の `atomized_candidate`、O05〜O10の6件は複数条件と判断時点を含むため `composite_unresolved` として保持しました。複合行を単一要求や単一ownerへ分解していません。

四製品（`HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS`）の候補境界とsource span候補をinventoryへ記載しました。候補productの複数候補は境界reviewの入力であり、formal owner・authority・採否・phase admissionを確定しません。旧／現行implementation、unimplemented、degradation、phase、failure、consumer closureはunknownまたはnot_claimed／pendingです。実装・未実装・縮退をsource不在から推定していません。

旧archiveは静的なsource／digest参照だけです。旧workflow、runtime、test、CI、hook、adapter、sourceを実行していません。`legacy-links.jsonl` は空で、旧資産のsemantic linkや実装成立を生成していません。

## 検証

```text
python3 -B scaffold/rdp001-web-webos-vision-semantic-atoms-0088/validate.py
python3 -B scaffold/rdp001-web-webos-vision-semantic-atoms-0088/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

Bindingは `SCF-B-0088` です。成果物は上流の意味review候補であり、正式要求、設計、実装、CI、受入、merge、closeではありません。
