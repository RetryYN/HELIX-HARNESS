# Web／Web-OS Vision semantic atom next subset (Scaffold)

基準HEADは `ee03352d8fc36c4e16d65f861ac9f0262b47fe87`。親 `SCF-B-0081` が未処理として保持した19 spanから、次の10 spanをbounded subsetとして選びました。選択spanは`VISION-SEC-4`、`VISION-SEC-6.3`、`VISION-SEC-8`、`VISION-U10`〜`VISION-U16`です。残る未処理spanは`VISION-U17`〜`VISION-U19`と`VISION-O05`〜`VISION-O10`の9 spanです。

各選択spanから旧Visionの明示的なsource lineを1行ずつ保持し、候補source lineは10行、対象外lineは573行です。既存SCF-B-0081の選択span・atom source lineとの重複は0件です。Web利用者責務候補は5件、Web-OS service runtime候補は5件です。長いsection行の複合責務は3件を`composite_unresolved`として保持し、7件のU行候補は`atomized_candidate`として保持しました。

各atomのsource path／line範囲は実parent spanへ包含され、選択10 spanは各1件以上のatomが実際にparent参照します。3件の`composite_reason`はatom ID別canonical tableへ固定し、理由の差替え・相互入替をselfcheckで拒否します。

SCF-B-0081のprior source／atom digestを上流静的証拠として再照合しました。この束では新規のlegacy semantic linkを生成せず、旧／現行implementation、縮退、failure／consumer closureはunknown／pendingのままです。正式要求unit、owner、authority、採否は生成していません。旧archiveは静的参照のみです。

## 検証

```text
python3 -B scaffold/rdp001-web-webos-vision-semantic-atoms-0084/validate.py
python3 -B scaffold/rdp001-web-webos-vision-semantic-atoms-0084/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

Bindingは`SCF-B-0084`です。成果物はDraft PR review候補としてroot検収へ渡します。merge／closeは実施していません。
