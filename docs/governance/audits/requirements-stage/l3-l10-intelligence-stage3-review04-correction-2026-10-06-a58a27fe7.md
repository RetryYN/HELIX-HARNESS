# #2607 review04 correction — 2026-10-06

## 対象と根拠

正式comment 5999149118 (`308334fc55f10319b45ce23e7b82eb3207a1dab7db76d2d8e5bc20f00ea120e1`; `/tmp/pr2607-review04-full.md`) のBlocker 0／Major 6／Minor 29を対象に、本文補正を `a58a27fe7bb4ab850e0d0336a0b5c99343ef87ce` に保存した。本文変更はFR、FV、NG、NVの4文書。formal review base `5acae384305b01d10e88eeb2e6406f847baf66df` にある対象6文書のbytesは全て現本文の厳密なprefixとして保持する。Root Major6修正を含む親commit `f7d22caac9b7e318e4f3c7d5e1d0b9042ff522a0` を保持した。既存のreview03 correction/followup記録は変更せず、この監査に訂正・追補を記録する。

## 所見対応

Major 6件とMinor 29件それぞれの対応は同梱JSON `finding_dispositions` に記録した。M1–M6は011の優位判定／自動swap、価格根拠戻し先、Bot追加identity、Product Core owner、自由文由来のCI/Requirement/merge出力分離、067総費用欠落の扱いを個別条件として補正した。m1–m29はpack、source scope、fixture単変異・oracle、owner戻し、NFR分母、073出力分離、072 trace、078 CASE数および既監査の範囲訂正を対応付けた。

### 078-01 CASE一覧と算術

FV上で `AC-INTELLIGENCE-L3-078-01` にtraceするCASE 107行すべてについて、CASE ID、単独入力変異、期待観測、不合格条件、行SHA-256をJSONへ収録した。内訳は55 dimension/state行＋48 delta field行＋3 invalidation projection行＋provider/runtime次元混同1行で107。以前の106という和は最後の独立CASE `CASE-INTELLIGENCE-L10-2607X-078-16` を数え漏らした値、109は削除された重複CASEを含む旧時点の値として訂正した。closure群は別集合として、AC-078-09の58行、AC-078-10の5行、AC-078-08の3行、計66行を全件列挙した。無関係な072 dependency-closure-normalは含めていない。

### 固定親と旧source scope

過去auditの072-005 L2 span欠落と、072用の561–608範囲に073行601–608を含めていた誤りをここで訂正する。JSONにはL2 072-005:673–687、L2 073:601–608、L11 072 NFR-34:398–434の現行行pinを本文とshaで収録した。固定L2/L11のauthority本文を変更していない。

未確認4群の追補結果もJSONへ区別して記録した。078-01の全107行とclosure全66行は各行の入力／oracle／失敗条件を実読しpinした。28FB 21–148とA952 19–46はこの作業で全行の逐読を完了しておらず、親が使うcitation boundsと既存の親向け句に限って確認した。したがってこれら旧文書の未読範囲へ新たなreuse admissionを広げない。register 067-001/002および072-005/006のJSONL行も全体を読み、後継proposalはいずれも `registered_proposal`／`authority_effect:none` のままと確認した。候補digestの一致やlocator correctionから採択を推論せず、固定親L2/L11の意味だけを本文根拠とした。

旧sourceの対象scopeと用途をJSONへ記録した。BBD6は文書全54行を読んだが、009/013のfixture/table comparison scopeは26–48であり、oracle移植ではない。6FFD/658F/901C/AD74は旧acceptance/test-designとしてfixture構造・比較起点に限り、oracle意味を移さない。5EE0全文（87行；親使用atomは41–63）とE78B全文（90行）を読み、UWJ-FR-001 source-package/transition/workflow atoms、requirement-discovery JSON candidate/event traceを比較起点にし、現行authority意味は固定親から再導出した。範囲外の旧source全文に対するadmissionは行っていない。

## 静的確認と限界

`git diff --check` passed。6対象文書はreview baseのbytes prefixを完全保持。078-01は107 unique CASE IDs、closure集合は66行（58+5+3）。JSONは各CASE行の入力・oracle・失敗条件をpinし、旧auditのSHAを保存する。ここで確認したのは文書、source range、ID/trace集合の静的整合だけで、独立review・runtime挙動の証拠ではない。旧CLI、旧runtime/test/CI、Bun、repository CIは起動していない。Root最終検収が残る。
