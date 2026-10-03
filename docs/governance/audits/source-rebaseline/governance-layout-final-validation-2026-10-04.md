# Governance配置統合後の最終検証（2026-10-04）

対象はmain `8a09e4aaaa24eb5bf6a6ba0618d5bc8485042e24`を基準とするローカル候補 `2a4c478d42146137cd0b4126914bb6775e7900b8`。これは配置統合・現行locator閉包の候補に対する静的監査であり、formal mainの証拠ではない。既存の移動監査・統合監査・訂正記録は時点の記録として変更せず、本監査を追補する。

## 固定履歴の移動

main `8a09e4a`にある7件の旧pathと候補の移動先を、[既存の移動台帳](governance-fixed-history-relocation-audit-2026-10-03.json)に記録された旧・新SHAと照合し、7件すべて一致した。7件中4件は同一bytesで、残るMarkdown 3件は移動後の相対リンクtokenだけが変わっている。2つの2026-09-26 PO判断記録はそれぞれSHA `6f689d11…f7cf4d0e`、`f4b48c25…a4508376`のbytesを維持した。本文に残る相対hrefは当時のlocatorとして保全し、現行参照へ読み替えていない。

## append-only registerと分母

registerの件数は別々の時点記録として照合した。#2424関連の固定記録では713行から714行への追記とlatest candidate分母384件が記録されており、そのJSONはmain `8a09e4a`と同一bytesである。これは現在のmanagement register件数とは別の時点・対象を持つ証拠である。

management registerは配置統合base `64be94b`で1,075行・SHA `52021652…00eee5de`、main `8a09e4a`で1,076行・SHA `afa5554f…edbdef7`だった。候補ではその1,076行がbyte-for-byte prefixのまま保持され、`MPR-SH-OUTSIDE67-004`を1行追記して1,077行・SHA `d24a982a…7610c99b`となった。004は003をsupersedesし、変更はID、登録情報、evidence locator、訂正理由に限る。source atom count/digest、scope、状態、責務、処置、authority、要求意味に差分はない。訂正対象の過去register snapshotは既存の`audits/requirements-stage/history-snapshots/`にある同一bytesの実体である。

384件のcandidate分母は上記714行の時点記録の値として保持する。後続のregister追記をcandidateの採択、L3親、PO判断へ読み替えていない。

## Bindingと137件の静的validator

main `8a09e4a`にあった既存Binding 143件を候補と比較した。Binding IDとupstream以外の全fieldは一致し、upstreamのcurrent locator/digestだけが更新されている。差分は130 upstream entry（path 13件、SHA 119件。pathとSHAの両方を変えたentry 2件）、80 Binding fileに限られ、非upstream field差分とその他upstream field差分は0件である。全変更entryは同梱JSONに列挙した。

[最終公開前の137件測定](governance-layout-static-validation-2026-10-04.json)で記録済みの`f0dcd917`から候補HEADまで、137 validatorすべてのpath、コードSHA、終了状態、正規化標準出力・標準エラーは一致する。新しいvalidator実行は追加していない。最終公開測定`fff122a`と候補の比較も137件で終了状態差0、pass 82／fail 55、timeout 0、新規fail 0だった。9 validatorのコードSHAはreader path/locator閉包による変更を含むが、終了状態とdiagnostic signatureは不変。絶対worktree pathを正規化した出力差2件は、既存失敗tracebackの行番号だけである。既存55件を成功扱いせず、失敗のまま保持した。64be94bの79 pass／58 failからf0dcd9の82 pass／55 failとなった3件のreader修正は、前段の統合監査に記録済みであり、本追補の効果として数えていない。

候補HEADでの追加静的検証は次のとおり。`scfctl validate`は143件・fail 0、`stale=0`、`residuals=0`、selftestは69件・fail 0。`gen_rulebook.py --check`は59 files、`govcheck`は7,622 atoms／57 requirements／58 filesでpass、`govcheck_selftest`は全10ケースpass、監査Markdownの相対リンク3件はすべて解決し、`git diff --check`もpassした。旧runtime・test・CIは実行していない。

対象rootの現行配置、履歴保持、全validator結果・SHA、register prefix proof、Binding field comparison、コマンド結果は[同梱JSON監査](governance-layout-final-validation-2026-10-04.json)に記録した。本監査と既存配置ガイドは要求意味、candidate採否、L3承認、実装・実行・release許可を生成しない。物理L3/L10 directoryや要件本文を追加していない。
