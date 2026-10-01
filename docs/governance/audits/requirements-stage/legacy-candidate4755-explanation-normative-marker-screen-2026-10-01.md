# Candidate 4755 説明行の規範語マーカー機械スクリーニング

この記録は、Candidate 4755 のeffective classificationを再構成したうえで、`explanation` 行に対する規範語マーカーの機械的な候補抽出を記録する。候補queueであり、意味分類や採択判断ではない。完全な入力pin、正規表現、選定20行の全文・行SHA・archive bytes SHA・台帳接続は隣接JSONを正本とする。

## 再構成と抽出条件

- #2353 の4,755 `row_records` に、#2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381の順でoverlayを適用し、`condition=864 / explanation=2965 / structure=926`を得た。#2381公式recountと一致する。
- 対象は再構成後の`explanation` 2,965行。見出し行とMarkdown表のheader行を除外し、提示JSON記載の正規表現に一致する語句があるかだけを検査した。
- 候補は255行。優先tierは、禁止・拒否等のmarkerあり、次に必須markerあり、次に条件markerあり。tier内はregex hit数の降順、source IDの数値昇順とした。
- この抽出はidentity hitであり、意味上の義務・禁止・条件が現行要求として成立するかを判定しない。例示、引用、コード、受入条件、権限を生まないための禁止文等を含みうる。

## 優先候補20行

表の行テキストは読みやすさのため先頭160文字までの表示。全文はpaired JSONの`exact_source_line_text`に保持し、各候補はarchive file SHA、物理行番号、行bytes SHA（改行終端を含む）、#2353のbytes SHA、source-line ledgerとasset ledgerの行番号・SHAに照合した。

|順位|tier|source ID|一致marker|旧archive source:line|asset ID|行SHA-256先頭|
|---:|---:|---|---|---|---|---|
|1|0|`LEGACY-CAND-LINE-000336`|prohibition:拒否, prohibition:拒否, prohibition:拒否|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-acceptance.md:22`|`LEGACY-ASSET-901CD182B52024593E41`|`0227b4e8ca1e`|
|2|0|`LEGACY-CAND-LINE-001574`|prohibition:BLOCKED, mandatory:REQUIRED, mandatory:REQUIRED|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:250`|`LEGACY-ASSET-3A15E5645D2D2A59DFF5`|`13c2b99d8566`|
|3|0|`LEGACY-CAND-LINE-002070`|prohibition:拒否, mandatory:必須, conditional:場合のみ|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:58`|`LEGACY-ASSET-67ADFAB856D954B3C5D2`|`eef9d05e2ead`|
|4|0|`LEGACY-CAND-LINE-004330`|prohibition:fail, prohibition:fail, prohibition:fail|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-acceptance.md:25`|`LEGACY-ASSET-349061A71CEF2554B9A7`|`f974939016b3`|
|5|0|`LEGACY-CAND-LINE-000232`|prohibition:拒否, mandatory:required|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md:40`|`LEGACY-ASSET-5DC004CDB36F2B0C29C5`|`9f103c9eb772`|
|6|0|`LEGACY-CAND-LINE-000339`|prohibition:禁止, prohibition:拒否|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-acceptance.md:25`|`LEGACY-ASSET-901CD182B52024593E41`|`e4ae82f8de15`|
|7|0|`LEGACY-CAND-LINE-000441`|prohibition:blocks, prohibition:block|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:17`|`LEGACY-ASSET-F619177632B88B92DDBF`|`467ff1c889c6`|
|8|0|`LEGACY-CAND-LINE-000810`|prohibition:reject, prohibition:reject|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/design-grounding-human-convergence-acceptance.md:37`|`LEGACY-ASSET-FFACD176B1C7DF1A7973`|`ee2eb39c3a14`|
|9|0|`LEGACY-CAND-LINE-000916`|prohibition:Reject, prohibition:禁止|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/design-grounding-human-convergence-intake.md:138`|`LEGACY-ASSET-A422448C3CACBCA75D0C`|`3f52b5b6c9db`|
|10|0|`LEGACY-CAND-LINE-002046`|prohibition:拒否, mandatory:必須|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:34`|`LEGACY-ASSET-67ADFAB856D954B3C5D2`|`3c84c11fe451`|
|11|0|`LEGACY-CAND-LINE-002051`|prohibition:拒否, mandatory:required|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:39`|`LEGACY-ASSET-67ADFAB856D954B3C5D2`|`837d2340e529`|
|12|0|`LEGACY-CAND-LINE-002068`|prohibition:拒否, mandatory:必須|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:56`|`LEGACY-ASSET-67ADFAB856D954B3C5D2`|`3a8cebebe6dc`|
|13|0|`LEGACY-CAND-LINE-002248`|prohibition:fail-close, prohibition:禁止|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:142`|`LEGACY-ASSET-B75E46DBE77592351574`|`e6c53d8fff08`|
|14|0|`LEGACY-CAND-LINE-002323`|prohibition:拒否, mandatory:必須|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/harness-memory-coordination-boundary-acceptance.md:23`|`LEGACY-ASSET-FAD65F85239B4D525365`|`4e89b7911710`|
|15|0|`LEGACY-CAND-LINE-003151`|prohibition:禁止, prohibition:拒否|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/mechanism-adequacy-acceptance.md:37`|`LEGACY-ASSET-2CE2F9E494E084235170`|`31e8190a6ef8`|
|16|0|`LEGACY-CAND-LINE-003691`|prohibition:reject, prohibition:禁止|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-intake.md:110`|`LEGACY-ASSET-D6A372AEFBA19BE1C63C`|`ee264a4dcd19`|
|17|0|`LEGACY-CAND-LINE-003917`|prohibition:block, prohibition:拒否|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-acceptance.md:29`|`LEGACY-ASSET-EDCECC97CD785052A97F`|`905caaa26c44`|
|18|0|`LEGACY-CAND-LINE-004036`|prohibition:fail, prohibition:reject|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:23`|`LEGACY-ASSET-B1F192F46FC3AC336094`|`7635d890951e`|
|19|0|`LEGACY-CAND-LINE-004054`|prohibition:fail, prohibition:fail|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:42`|`LEGACY-ASSET-B1F192F46FC3AC336094`|`dd98d2189939`|
|20|0|`LEGACY-CAND-LINE-004250`|prohibition:block, prohibition:拒否|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/rule-derivation-requirements.md:77`|`LEGACY-ASSET-43BDCF59263A325425A2`|`ad37b846a36d`|

## 解釈上の境界

- このqueueから要求への採択、旧資産の移植、意味変更、現行L2/L11との対応、PO判断との整合、source coverageまたはStage 5完了を推論しない。これらの判断は未実施である。
- archiveは読み取りのみ。旧workflow、CLI、hook、adapter、source、test、CI、runtimeは実行していない。検証はreconstruction count、exact byte/hash joins、JSON/Markdown生成物の静的整合に限定した。
- 入力revisionと全候補のhash/line evidenceはpaired JSONに記録した。

Authority effect: `none`。
