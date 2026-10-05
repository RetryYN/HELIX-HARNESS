# HARNESS Stage 2a 022公開切出しの検収

対象は採択済022の1親・Stage2a・1.0だけ。本文revision `cc3d0893ccc12b5ab0c07b4a4b8e3f8bdcb1d638`。承認済Stage1のmain `4058f9d6ae72764de9483acb7882994e943d2167` 6本文をprefixとして保持し、元c023d2c63の74行suffixを追加した。Stage1の旧Draft表示3句のみを現在状態へ限定訂正し、022の承認を生成しない。

FR1/AC6/機能CASE6/BR1/NFR1を対にした。rootは6suffixと固定L2/L11を読了し、17source full/raw pin、6本文全SHA/承認prefix、74追加行pin、旧4監査blob不変を照合した。旧資産のFR+AC/pair形式と旧L10 UX/L12番号差を記録し、実行や旧番号を移さない。

元8361/c023/b491のGitHub APIはHTTP422でlocal object限定。旧記録はその時点の固定hashを保持し、新bodyの6SHAを[JSON](l3-l10-harness-stage2a-main-publication-2026-10-05.json)（SHA-256 `cf8ccc87a06970187358fb32d6e8a311f77e36591a15a22045dc47c9d016ac8e`）へ固定した。旧一括のM4/M12/minor022対応は独立review範囲として持ち越す。

静的147/fail0・stale0・residuals0・gov7622/57/58・diff-check PASS。L3未承認・L10未実行、旧runtime/test/CI/Bun不使用。
