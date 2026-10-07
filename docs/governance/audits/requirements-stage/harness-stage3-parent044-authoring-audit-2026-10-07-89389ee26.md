# HARNESS-044 起草統合の物理監査

- 対象: `89389ee260343b392a32c5bda9aea79dc0d698aa`（branch `l3-harness-stage3-parent044`）、base `f5a974a4059a209982cb1cdec39c0537f52683b8`、parent `f5a974a4059a209982cb1cdec39c0537f52683b8`。作業tree clean、6文書のみ。
- 範囲: 読取・物理pin・静的参照照合。正本変更なし。fixture/test/CI/独立review/L3承認なし。

## 固定親・PO pin

- **L2-fixed** `318ec4a04abb3c1cc17111b3d939f913facd5fd3` `docs/helix-harness/L2-requirements/product-requirements.md:1002–1014` file `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`, span `b005641da8a8dffac0bbddd33b5ef71762f7a9c221fa31b23cb1bb2111e1a26d` (4405 bytes).
- **L11-fixed** `318ec4a04abb3c1cc17111b3d939f913facd5fd3` `docs/helix-harness/L11-acceptance/product-acceptance.md:735–745` file `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`, span `9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8` (3224 bytes).
- **L2-current-main** `f5a974a4059a209982cb1cdec39c0537f52683b8` `docs/helix-harness/L2-requirements/product-requirements.md:1002–1014` file `9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d`, span `b005641da8a8dffac0bbddd33b5ef71762f7a9c221fa31b23cb1bb2111e1a26d` (4405 bytes).
- **L11-current-main** `f5a974a4059a209982cb1cdec39c0537f52683b8` `docs/helix-harness/L11-acceptance/product-acceptance.md:740–750` file `1f5c32b8ef8f50c1f3ca1780f0a25419e1d74034bb7827ff01d9725c1fd388c4`, span `9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8` (3224 bytes).
- **PO** `17a2f310358ee7fe209b9d37cddf4a927c740248` `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:49–49` file `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`, span `212948ea669ed647a3a3b188b0efb39a9e2d2fdf020e7be5cd8f088fac79807b` (730 bytes).

PO行49はB route / Design Contract Portfolioの条件付き採択であり、既採択025/026へ無断追記しないことを確認。

## 6文書の物理照合

6文書すべてが指定base文書のbyte prefixで、suffixはRoot候補markdownの先頭LF＋内容に完全一致。表のhashはHEADから再計算した値。
- `docs/helix-harness/L3-requirements/business-requirements.md`: prefix `87e3533a49f5284aed2535f9216683f9ef013ed7434c9816a73596b81a5e09fb` (12912 B); full `8108c69be7a189dda90a6b4cadb3a6500461438163a04895d0ccc0946a6d5f37` (16483 B); suffix `73e6a1a20bd5cc91f4e09e0c425f25a99484016c2574efc9f39f4a39acdaab4f` (3571 B).
- `docs/helix-harness/L3-requirements/functional-requirements.md`: prefix `ddc4288e77effd48553c1cf4ada66e74dffef39c5fc209c1d3038b0bc83a8ad8` (200552 B); full `54c8d46c8079ca427d8659f39217ba6ac118d29e165974d1ff7bf2ddcff8c18c` (206925 B); suffix `a8e8252b7a0f0b513a49ea708164d59032349c84915d3b62d9400d7888a16326` (6373 B).
- `docs/helix-harness/L3-requirements/nfr-grade.md`: prefix `75cbdcc058aff99a9efd99b9d3344e6920e864b1bb603a1ac77a0e447f2f60af` (42424 B); full `dd6d72d306441f7aa25308b51b2e6e399593e8ecbaae9e07da744f86d8b76c79` (45932 B); suffix `6c53a95997343de698afd625a7ba82fa79d09cae5095762029d0c38361277908` (3508 B).
- `docs/helix-harness/L10-verification/business-verification.md`: prefix `a1ff88366ef98368fa8cbd628f499aa50a73cd05a75d54ff64e353a1626cd67c` (8569 B); full `b39633172478d956d58458e412397491eac2756634d2655a26f6032734de2cd6` (12681 B); suffix `9e3eebf82c16e72d8fc71d2675e965ad808f146ed17f738a8536c8640e474410` (4112 B).
- `docs/helix-harness/L10-verification/functional-verification.md`: prefix `4f87643397e4e1c2a94d07537770510f634c509eaeb1701c3159a0d143d98cc1` (615326 B); full `ed48a47e9b23221c6678274872d4aee7f52789618797b6faa4678fb12de9bafd` (646504 B); suffix `6b149c92ab11b4aae7a96423912e2c467c1b875c1990939ae059b79751fd4b95` (31178 B).
- `docs/helix-harness/L10-verification/nfr-verification.md`: prefix `e5b090ba97c6a5237b47b890d7a86453ed5f602ee09c9e531ab3b55698d13a7a` (36003 B); full `aebc69066ebbd1feaaf410216e44de162094daae072b450923a1074e0f9139fb` (40146 B); suffix `55451863b2686da8555150ce3f791a6d02044407b0b2cd52f07697f8ca77aa05` (4143 B).

Root候補JSONの補助 `suffix_sha256` / `utf8_bytes` は更新前のhistorical metadataとしてJSONに原値と再計算値を併記した。Rootの確認に従い、物理HEADのLF＋markdown一致を正とする。candidate `current_candidate_rows=50` も中間時点値であり、現bodyは51行。

## CASE・参照・責務

- 現行CASE 51行、unique ID 51件。checkpointの旧39 IDを全件保持し、新規は12件。current fixture literal section SHA-256 `6a426c39033b71f66a7d06317f271fdb7d2321254d875746e13ffc6b8877ec48`。
- FR定義 `FR-HARNESS-L3-044-01, FR-HARNESS-L3-044-02, FR-HARNESS-L3-044-03, FR-HARNESS-L3-044-04`、AC定義 `AC-HARNESS-L3-044-01, AC-HARNESS-L3-044-02, AC-HARNESS-L3-044-03, AC-HARNESS-L3-044-04`。CASE内FR/AC参照未解決なし。
- 正常9-classは合成入力C1–C9を使うcoverage材料。一般件数閾値、authority、設計承認を生成しない。authority出力拒否は7 fixtureに分離し、各CASE一output-fieldのみ。
- Root統合の補正: 責務区分は既知のまま保ち、個別owner identityだけを特定不能時unknownとする。旧r05 indexは独立fixture数に含めず、設計承認拒否と採択拒否の別CASEへ索引化。
- 全6 sectionをStage 3として確認。`version_target: 1.0`候補のまま。

## 旧HELIX起点と限界

旧HIL-FR-54 line144を起点として実読し、隣接HIL-FR-55 line145は044へ移していない。HR-FR-HIL-20、旧pair mapping、HOT-HIL-50、HAT-HIL-20、assertion/requirement coverageの各pinはJSONに物理行・full-file/span SHAと原文を保持した。consumerは境界確認に限り、複合契約全体を044へ移したとは扱わない。旧実行物は起動していない。

検証は静的なbytes/hash、旧39保持、新12、参照解決、Stage、単一output拒否の文面照合に限る。L3承認・review・実行結果を推定しない。

詳細JSON: 同名公開JSON

Root公開検収追補：共有L2読取slice1002–1014には隣接045が含まれる。PO行49のexact採択spanは1002–1011、SHA `690f2bfa866c778be47459baa99139905260d3ca569739a4d4707c61096212f2`。元共有pinを時点記録として保持し、採択scopeは044本文とPO判断に限定する。
