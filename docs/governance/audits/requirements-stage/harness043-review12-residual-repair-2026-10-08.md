# HARNESS-L2-043 review12 残余修正記録

PR #2642 の正式review12 comment `6030127214`（対象本文SHA-256 `a8c785b31c1c0c1ca97c66b16b3ef7a3e8e2f26aa000170643c36a039fcaac92`、reviewed HEAD `330272a4231c092ff8c456e5dc47f447175bc95f`）のR34/R35/R38を、固定L2/L11と旧HIL-FR-55から再照合し、043のfunctional requirementとL10 functional CASEへ限定して修正した。要求意味、範囲、owner、version、PO判断は変更せず、既存review・decision記録も変更していない。

R34では固定L2:996の方向をAC-043-04へ明示し、L2-025 composite-design/oracle receiptだけ、またはL2-026 unit/pair-design receiptだけで043例coverageを完了させる独立CASEを追加した。既存の逆方向CASE（043 matrixを025/026成果へ代用する変異）は維持した。原因別戻し先でも、健全な入力に対する確立済み所見出力の欠落を043自身の訂正へ返す。

R35ではsynthetic normal fixtureのrisk-basis source valueとmatrix output valueの完全一致を明記し、basis output fieldの欠落と不一致をそれぞれ単独変異CASEにした。R38ではCASE-043-07を、正常なinput/sourceと証拠で確立した重複・冗長性findingの削除として固定し、coverage未完に加えて043自身の候補matrix output訂正を期待結果にした。AC-043-02の自己訂正範囲も、確立済みfindingの欠落・誤記へ広げた。

旧起点は `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` のHIL-FR-55（旧platform requirements line 145）。旧sourceのrule/branch別positive/boundary-negativeとriskに基づく追加例、数でなくcoverageによる十分性を保持し、旧schema/runtimeは移植しない。固定sourceと旧sourceのfull/span pins、6本文SHA、修正CASE line hash、静的照合は隣接JSONに保存する。

候補本文の静的検査と `git diff --check` を実施した。fixturesは実行していない。独立review、Opus/Fableのexact-revision再照合、L3承認、commit/push/PR操作、mergeは未実施。authority effectはnone。
