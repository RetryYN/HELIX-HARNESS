# HARNESS-041 review01処置監査

記録日 2026-10-07。WT `/home/tenni/.helix-worktrees/l3-harness-stage3-parent041` / HEAD `4f0f3824978c6f20aa554e300595ef0414821cee`、M1固定body `fef29ac6f438e57705cc5c1649cf4db08ffc033c`、親 `c44be24bc40ccf5e9c4edde65fb4b89a3a6c6e47`。`origin/main` は `f5a974a4059a209982cb1cdec39c0537f52683b8`。Workerの/tmp時点候補をRootが検収し、既存requirements-stageへ公開する。元入力は時点記録として保持する。

## 固定parentと六本文

PO row46のsourceはrevision `a2638477be294880ba33e215778a763caacfa6ee`。L2 pin `318ec4a04abb3c1cc17111b3d939f913facd5fd3:product-requirements.md:957–968` SHA-256 `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`（PO採択値と一致）、L11 pin `product-acceptance.md:699–709` `259c383203d86b79c159395b64c0d03d88db665486d28f5fc2aea8f7556a73a8`。以前の共有監査が記録したL2 957–970（end exclusive 971）`ad8e344c…` sliceはhistoricalのまま保持し、今回のpinに使わない。

|文書|current main full prefix|M1 body suffix SHA|M1 body full SHA|HEAD一致|
|---|---:|---|---|---|
|`docs/helix-harness/L3-requirements/business-requirements.md`|12912 bytes `87e3533a49f5284aed2535f9216683f9ef013ed7434c9816a73596b81a5e09fb`|286 bytes `93f07196fc0ebe3a52892813247e28c9ac528d5854b57c5252212e2f5824dfcf`|`3d33e0ce83148d65e7762c5b56da5168356fe6e26a3bfdc3bff10430f70f0036`|True|
|`docs/helix-harness/L3-requirements/functional-requirements.md`|200552 bytes `ddc4288e77effd48553c1cf4ada66e74dffef39c5fc209c1d3038b0bc83a8ad8`|8637 bytes `0ea2471821e6f77a882746485ebf5c1a5df675137ecb3b0af1c4d83b5355ed9a`|`6b4d268aa878d12c58bbe182e98c3af6849f9dccfe392165a9fe640a739ddd8b`|True|
|`docs/helix-harness/L3-requirements/nfr-grade.md`|42424 bytes `75cbdcc058aff99a9efd99b9d3344e6920e864b1bb603a1ac77a0e447f2f60af`|912 bytes `1005f9081397006f61dc288a02ee13d4e6c74e07bbc6be411b1b5c6768ebb768`|`6a11a61b0b7ef516074dcbb6ed3589abd8b098a38741c75898b4d5a288748700`|True|
|`docs/helix-harness/L10-verification/business-verification.md`|8569 bytes `a1ff88366ef98368fa8cbd628f499aa50a73cd05a75d54ff64e353a1626cd67c`|287 bytes `a973d5d25f261671968a84d0c46fe0ecad3938556a336f97fb24292c704cc355`|`0a761e2889f28b88fe13acc6caca98a1dddcc7e122d2966a473b7716b5d59a83`|True|
|`docs/helix-harness/L10-verification/functional-verification.md`|615326 bytes `4f87643397e4e1c2a94d07537770510f634c509eaeb1701c3159a0d143d98cc1`|34366 bytes `9139cd79f1dffa036453fc7c5884b22b607e02d1a5952b141875ade390ec8c1f`|`a258f15c1a3553a25633a3f90f6941379d95731b2a039812f1b351712a69f425`|True|
|`docs/helix-harness/L10-verification/nfr-verification.md`|36003 bytes `e5b090ba97c6a5237b47b890d7a86453ed5f602ee09c9e531ab3b55698d13a7a`|918 bytes `7ce5bb4fadcae470b83b86046e92663e18c4148356524aea34714e40655cc99f`|`18b7305354f26d8a6fa8c1e760ca45eeadec805fc6ece496ab0eb3ec687514ad`|True|

6件すべてでcurrent main (`origin/main`)の全bytesがfixed bodyのprefixとなり、suffix/full hashは再計算一致。HEADの6本文はfef29 bodyと同じbytes。

## M1修正の実体

正式review comment `6022157049` のM1は、AC-02配下のgapに原因別戻し先がない欠陥。fixed bodyで、AC-02本文1行とfunctional-verificationのcase row 12行を照合した。Root候補の12六列表は全行、現本文と6列完全一致=True。以前のc44 HEADとの差分も12 case IDと1 FR AC行で一致。

|CASE ID|AC|current physical line|raw-LF SHA|
|---|---|---:|---|
|`CASE-HARNESS-L10-041-r04-empty-field`|`AC-HARNESS-L3-041-02`|1612|`a6686b909ed57a1e22505d55ca233c5ba8fa6a54915ebb17d18a65bd886f71dd`|
|`CASE-HARNESS-L10-041-r04-tbd-field`|`AC-HARNESS-L3-041-02`|1613|`f97718e461236705eeca31a2fe1580041793791342ceacddc5d479982854eddf`|
|`CASE-HARNESS-L10-041-r04-extractor-unavailable`|`AC-HARNESS-L3-041-02`|1615|`55e7f2f0f794cf2fac66991a2ee7fb592fcd58a57a4ddd6e30f3e848020af5db`|
|`CASE-HARNESS-L10-041-r04-duplicate-atom`|`AC-HARNESS-L3-041-02`|1616|`1873f5c7b5cdb3467b4cc5c8057a62c7f53ce779c354af06cad50b65c39b9f02`|
|`CASE-HARNESS-L10-041-r04-atom-gap`|`AC-HARNESS-L3-041-02`|1611|`07045aa7b0b8b73f3944c566a4f2c3da377fd405c3e36a9766228a88e406165c`|
|`CASE-HARNESS-L10-041-r04-one-obligation-split`|`AC-HARNESS-L3-041-03`|1617|`5c1cc482d752904a88403aa36392801f4565682ef3bef30a40d9f25eb7080c04`|
|`CASE-HARNESS-L10-041-r04-two-obligations-merge`|`AC-HARNESS-L3-041-03`|1618|`f6be0af2d6f438ffde84609746d74b8a7270a1686b1e500729aed0fa2d796a47`|
|`CASE-HARNESS-L10-041-07`|`AC-HARNESS-L3-041-02`|1603|`22048fb33d739b39119e0cccccc1661090d3a792dd946b81371b21e335102114`|
|`CASE-HARNESS-L10-041-10`|`AC-HARNESS-L3-041-02`|1606|`9090afbcfced8f10d901f6d1aef7b8f10cadc4d1fd366b1d4573115a4a7d9507`|
|`CASE-HARNESS-L10-041-r09-003`|`AC-HARNESS-L3-041-02`|1633|`098e4250bdbeaea5c754a2c10d427149d0d876074533f6c3eafdec7eb746fccb`|
|`CASE-HARNESS-L10-041-r10-l2-009-applicability-unknown`|`AC-HARNESS-L3-041-01`|1634|`44172e75156faf6206524df4cec1d351ee8958e5258e715e16ad66152cc59f3a`|
|`CASE-HARNESS-L10-041-r11-template-meaning-unknown`|`AC-HARNESS-L3-041-01`|1657|`fc857742df02777a2ff0fd9c7db41582716bc82d1f01c520886f7d364b992a0e`|

AC-02 FR行: line 723, raw-LF SHA `fdcbfd6896b47a64ac2af3587d8611daf29d97631991f1fb8a98be96b9e70023`。原因分離はinput側のtemplate meaning/applicability不明→009/対象template owner、valid input後の抽出output欠陥→041 HARNESS-CORE、ledger contract incompatibility→040相当owner。個体owner ID unknownでも責務classを残す。

## CASE inventory

現在のFV本文から物理6列行を62件抽出、ID unique=True。前HEADの61 IDはすべて保持=True。追加ID: `CASE-HARNESS-L10-041-r11-template-meaning-unknown`。全62行のliteral/line/raw-LF SHAと6列はJSONに保存。

## R1–R13 disposition

正式reviewのR1–R13全原文をJSONの`formal_r1_to_r13_dispositions[].raw_literal`へ保存。formal commentでは「後で直す残余（承認を止めない）」と分類されている。M1差分での解消は主張しない。R9については今回記録が正しいPO L2範囲を使い、古い共有sliceは歴史として保持。R10は採択PO row revision `a263847...`を今回pin。R12は古い59 inventoryをhistoricに留め、current body 62を記録。

## 旧行AC付替えの差異

formal review本文は旧行15件のAC付替えと記載する。一方、38行old literal checkpointとcurrent inventoryのID対応・raw rowsのpairwise比較は12件。照合できた12ペアの全文とSHAをJSONへ保存した。残る3件の対応元は特定できていないため、推測で埋めず不一致として残す。

## 検証範囲

検証したのは物理source span、六本文のmain prefix/suffix/full、M1の13行、62 CASEの列数・ID一意性・旧61 ID保持。fixture実行、Opus/Fable再review、PO/L3承認、実装permissionは本監査から生成しない。
