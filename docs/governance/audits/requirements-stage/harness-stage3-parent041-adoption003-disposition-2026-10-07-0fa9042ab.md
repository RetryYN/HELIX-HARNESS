# HARNESS-L2-041 採択訂正・post-body監査候補

- 対象PR: #2637 / HARNESS-L2-041
- 修正HEAD: `0fa9042ab39f4488032ee5b7b117728802cbdd05`（parent `0ecf302b7e84f4c1f3395a13e512332f738ea681`）
- main prefix: `3c3c512c09320c0494904602b23e544a81206eed`（比較時の旧base `f5a974a4059a209982cb1cdec39c0537f52683b8`）
- 状態: `/tmp`候補のみ。canonical監査・本文の変更、commit/push、承認・Ready・mergeは行っていない。

## 採択根拠と訂正

正式訂正comment 6022788739をGitHubから再取得し、最新review03 formal comment 6022859696もGitHubから再読した。review02のno_findings／条件1・2成立は6022788739により明示的に取り消されている。review03のMajor 1はHEAD `0ecf302b7e84f4c1f3395a13e512332f738ea681`を対象とした過去の判定であり、今回の修正HEADに対する独立reviewではない。旧NFを今回HEADへ継承しない。

PO判断記録の後続採択行は `docs/governance/decisions/po-decision-2026-09-29-11candidates.md:27`、revision `6b5de065c8bdf38b2ccf06d82bf2581824742e67`、本文SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`で、`MPR-RC-HARNESS-L2-041-003`を採択している。固定sourceはrevision `5aa100319361b0cc86edd3c51815ec777d55410a`。L2全体SHA-256 `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108`、957–968節digest `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`。L11全体SHA-256 `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7`、699–714節digest `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b`。PO行のraw SHA-256は `3a8ce36e3ff309ba7a635a5f9b9469fd6cdbfe1da8e26d7a64ca4ab3fcf28a17`。L11追加oracleは、(1)異なる義務の複合atom化を拒否する例、(2)同一入力・同一extractor/versionのsemantic digest不一致をfindingとしてscopeを未解決にする例。

以前のdecision `po-decision-2026-09-29-57candidates.md:46`（revision `a2638477be294880ba33e215778a763caacfa6ee`）は、`-002`を当時採択した記録として保持する。L2節digestは003と同じ `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`、L11旧節digestは `259c383203d86b79c159395b64c0d03d88db665486d28f5fc2aea8f7556a73a8`。現在の権威根拠は後続の003 exact pairであり、002と003を並列の親scopeにはしない。tracked `docs/governance/decisions/`を正確なregistration IDで検索した結果、明示行はこの002/003の2件で、さらに後の041採択行は見つからなかった。

## 6本文のpost-body pin

| 文書 | 3c3c prefix SHA-256 | 現行suffix SHA-256 | 現行全文SHA-256 | 候補一致 |
|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `4fce6bb6cd3af5938a11719866050bd729234adbebf70c4210398aa90cad5dff` | `e767c7f3c940cf5996e2ad7042a4ede5c40a7136086b3c671e75933366fd7b9c` | `14fdde32ebef67b7e4d85a797b2742fe21e34810fedf227da8d67c378861d377` | 一致 |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `c51f0bc2b98ae5c6a77bfa354050ec70ee87a70641b5f0161b14d5a3afd33e8f` | `93f07196fc0ebe3a52892813247e28c9ac528d5854b57c5252212e2f5824dfcf` | `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` | 一致 |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `b364e8c6dc92f4548df34638488fefec1533d13941a991de685a74bb64471fc9` | `1005f9081397006f61dc288a02ee13d4e6c74e07bbc6be411b1b5c6768ebb768` | `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` | 一致 |
| `docs/helix-harness/L10-verification/functional-verification.md` | `bc63c3abbabd727dbb2cfa37a5c3741985181308ad93378ebf2e5846907770f0` | `83286519a49785e0e358bbdf93e18ca974c4e1f6bae9913f3e23322529f02dc0` | `54f760e4f53558cc695f259e7f1baebf844c9e6d950161bb60cabcb7b7fae70e` | 一致 |
| `docs/helix-harness/L10-verification/business-verification.md` | `2faacacf78b835b5127e990b805adb97b079439c887a1ef2bd6d69f2478d53c9` | `a973d5d25f261671968a84d0c46fe0ecad3938556a336f97fb24292c704cc355` | `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` | 一致 |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `bb319529b2c2e2af75067c36bf204d386816fb7e78d48f18043973be6290ccd1` | `7ce5bb4fadcae470b83b86046e92663e18c4148356524aea34714e40655cc99f` | `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` | 一致 |

6ファイルすべてでmain prefixが現物に一致し、suffixは提示済みexact candidateと一致し、末尾LFを保持する。現commitで変わったファイルはFR-041とFV-041の2件。FV-041は62行・62 unique IDで、parentから順序・IDを保持している。

## formal findingの保持

review01 `6022157049`、review02 `6022571073`、訂正 `6022788739`、review03 `6022859696`のraw bodyとSHAをJSONに保存した。R1–R20は旧formal review本文の原文として維持し、新しい採択訂正によって書き換えていない。訂正commentは003の見落としを指摘し、review03はその時点の旧HEADでM1継続を報告している。

## 検証範囲と限界

候補suffixとのbyte一致、6 prefix/full/suffix SHA、decision/source pin、decision directoryのregistration検索、CASE ID保持、作業treeのclean状態を確認した。Root報告のgovcheck/diff PASSは引き継ぎ情報として記録し、ここでは再実行していない。post-body独立review、Opus/Fable一致、fixture実行、要求意味の完全性、POの追加確認、Ready/mergeは主張しない。
