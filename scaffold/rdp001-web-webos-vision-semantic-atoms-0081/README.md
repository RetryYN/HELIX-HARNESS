# Web／Web-OS Vision semantic atom candidates (Scaffold)

基準HEADは `1db1e9d78b9cb552394c647145343704efffe529`。親 `SCF-B-0080` の29 Vision exact spanから10 spanだけをbounded subsetとして選び、明示的source lineを15候補へ静的分解しました。Vision全583行のうち候補lineは22行、候補対象外lineは561行です。親spanの未処理分母は19/29です。

Web利用者責務候補は7件、Web-OS service runtime候補は8件です。複数責務、表、将来方向、open decision、phase gateは6件を`composite_unresolved`として保持しました。candidate text、exact source line、connective tokensを保存し、正式要求文への意味変換は行っていません。

旧assetは親SCF-B-0080のlegacy evidenceから6件を静的参照しました。source snapshot、decision、failure、consumer evidenceを照合し、旧／現行implementation、縮退、authorityはunknown／noneのままです。catalog membershipや親の候補relationをsemantic linkへ昇格していません。

正式要求unit分母、owner、authority、採否、実装、縮退は生成していません。旧archiveは静的参照のみです。

## 検証

```text
python3 -B scaffold/rdp001-web-webos-vision-semantic-atoms-0081/validate.py
python3 -B scaffold/rdp001-web-webos-vision-semantic-atoms-0081/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

Bindingは`SCF-B-0081`です。Draft PRで意味reviewへ渡す候補としてroot検収へ渡します。merge／closeは実施していません。
