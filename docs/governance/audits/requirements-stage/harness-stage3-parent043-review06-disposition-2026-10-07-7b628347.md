# HARNESS-L2-043 review06 postbody 時点監査

これはRootが候補を適用した本文revisionの作成側read-after証拠候補です。正本監査の追記・commit・pushはしていません。

- 対象PR: #2642、本文commit/HEAD `7b628347efa10c5f772b87950c81f539c4589914`（親 `585a2d2a2d6e825fbc9e750de7d08fe654d7992d`）、base/merge-base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`。
- Root報告: govcheck 7622/57/58およびdiff検査PASS。本Workerは再実行しておらず、個別checkpoint JSONは指定場所に見つかりませんでした。
- formal review06: comment `6026394271` を含む全12コメントのraw objectをJSONに保持。formal file SHA-256 `6a9efce6b31926f3343e71d31009ba075bb665e29c20147be38a632f348667c6`。review履歴内R1–R21と過去指摘もcomment全文から保持。
- 候補JSON `/tmp/harness043-review06-m1-candidate-2026-10-07.json` SHA-256 `54901137e48e185be13375f9a82248b4848f8152213e08ffa1277ed917b1e70f`。実六本文は候補のafter raw/full SHAと全件一致。
- 固定L2-043 `318ec4a04abb3c1cc17111b3d939f913facd5fd3` 行986–1000 span SHA `da678d9181ebe76ae93084c27744d253c617ebe03b709d79f55b79d2abbc6666`。固定L11-043 同revision 行723–733 span SHA `583bfaf669729d3148e072be3ca74f1ef125997e933f6a1a94f08c732cb6f4b4`。
- 旧28 CASE raw literalを旧revisionの物理行から再読し、28/28 raw LF SHA一致。過去監査ファイルは不変で、hashを記録。

## 六本文の実blob照合

| 文書 | base bytes/SHA | 現本文 bytes/SHA | base prefix | 追加suffix bytes/SHA | candidate一致 |
|---|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 13526 / `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` | 13809 / `6083ad22ec62edc4e1aa806c7848298ba3f64186e02b41fc5184ce5271771bbf` | True | 283 / `8d806b285b554f895d1e3b8125b92e398db31ca5bcab68296d866a06c07e9129` | True |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 215357 / `a673be158e96dd92eb09f91432077244724a03d25bd4e0fd88482d6e42086f09` | 222196 / `292514c1b94c3b4363eaec3c586fa312a67b021e25d12ac7f7a2819fcfd6e462` | True | 6839 / `2c74a1357f4fca2b59a3e0384f7d1843bcc7cd17a88022b8419a282f62b81fa4` | True |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 43828 / `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` | 44262 / `b083ddc8f8043cabc8b1c706f4ad937b0cf9cf63d2627a6f7d5fca862af58e09` | True | 434 / `be99bed2c7755145b8a0f1ae8703e398f42926d5c39721857ca780954022cdf3` | True |
| `docs/helix-harness/L10-verification/business-verification.md` | 9106 / `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` | 9339 / `d862b5b8540b8044a1524a28deba24d73d146ade9908a09c03861acfea1f6c7e` | True | 233 / `233f15d3911b5fe44c4b6041f9ed348e08d2cd6814fd27dcfd4c1cb12c0a1c9f` | True |
| `docs/helix-harness/L10-verification/functional-verification.md` | 678890 / `24d7f597211b05505876c25f0cbf403bece96dfa1a52854b8795e3a08cbb4a19` | 711023 / `f94d2379bbc86569f8284b961f4d0d298b95853a3f51c3c4f3eaf06786970bc9` | True | 32133 / `9dae24c0a73554a1207c987aedcdd1abc060a2e50a2f30601941822f98638e11` | True |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 37382 / `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` | 37774 / `ca44da2af8552c37c861bf993d5be01314d4616e282584aaaddfaa3e28f22ade` | True | 392 / `047c937dc87c01fb22b44ce900e932a0e47d43e02609695d90eb6b55df576281` | True |

六本文の全文rawと追加suffix rawはJSONに格納。六ファイルはbase blob全体をprefixとして保持し、差分はL10 functional-verificationの043 matrix追補だけ。

## CASEとsource境界

- current 54 unique ID = 既存48 ID保持 + 追加6 ID。ID一覧と6列の追加CASE rawはJSONに保存。fixtureの実行結果ではない。
- unknown/conflict/staleの4×3 = 12状態セル対応をJSONと候補MDに保存。missingは別状態・既存CASEとして保持。
- denominator/conflictは既存`r04-rule-branch-conflict`の実rowどおりL2-009/対象template owner。independent-source denominator unknown/staleはsourceのrule/branch内容を供給する041相当の抽出契約責務区分。固定L2-041へ一律転送しない。
- owner個体identity unknownを既知責務区分と分ける。active/applicabilityはL2-009、risk basisはL2-004と固定sourceが示すrisk/oracle責務へ返す。

## 確認範囲と限界

- actual HEAD/base、六blob全文SHA・byte数・base prefix・候補完全一致、固定318 full/span pins、旧28 literal、既存48/現54 CASE IDs、worktree cleanをread-onlyで検算した。
- Root報告のgovcheck/diff PASSは報告値として記録。新規実行はしていない。
- fixture未実行、独立review未実施、Opus/Fable判断・L3承認未成立。R1–21や旧レビュー所見を解消認定していない。
- 旧review05監査はimmutableで保持し、その時点記録を本監査で書換えない。


JSON詳細: [harness-stage3-parent043-review06-disposition-2026-10-07-7b628347.json](harness-stage3-parent043-review06-disposition-2026-10-07-7b628347.json)、SHA-256 `8b8c8fcd1c12837afdcc54801fa3be4b7bde4cc5f8f529c77ae4636d64242bc5`。
