# LABO Stage2b残部のreview帰属訂正と現main本文inventory

この時点監査はPR #2614の旧委任根拠の帰属を正式comment本文で訂正し、現mainのStage2b残部本文を旧承認revisionと照合する。作業baseは `c0dab045c9708f1eabde20407609cb3e5fb5734a`、専用branchは `codex/labo-stage2b-historical-attribution-inventory`。本監査のauthority effectはnone。旧判断記録・旧pin・canonical本文は変更しない。

## 旧review帰属と固定scope

旧PO記録はcomment `6005201116`をOpus no_findingsとFable結論の根拠として記載している。しかしGitHub APIから取得したformal bodyはreviewerをClaude review_merge laneのFable 5.1と明記し、同じbodyにFable結論「承認してよい」を記録する。したがって `6005201116` はFable側であり、Opus条件1の証拠ではない。

Opus formal recheckはcomment `6039143224`（Opus 5.5）である。bodyは旧decisionが誤っていたこと、旧条件1と条件2が両方Fableだったことを明記したうえで、旧承認対象body `4e61305f38d16cb5caefd7e5c7168a6d483eb7c4`、reviewed HEAD `a43bb658fdef9bab5f082ce39d54969d1bcc1f7f`を固定親L2/L11とPO採択行から独立に照合し直した。Opus bodyはaudits・PR comments・Fableの見解を読まなかったと明記し、22親（012–030、034、035、058）、Major 0、未確認範囲0を結論にする。

実際に確認できる旧revisionの二見解はOpus `6039143224`とFable `6005201116`で、Opus再照合commentは同じ旧body/HEADを対象にする。既存補正証拠がこの帰属を記録している。過去記録は上書きせず、このinventoryも過去の条件成立や判断記録を再生成しない。対象22親は既存PO判断で1.0として採択済みで、意味・範囲・担当・版の変更は含まない。Stage2b基本9親（002–010）は別の既存判断であり、この残22親reviewのscopeへ混ぜない。

| Formal comment | 実reviewer | body UTF-8 bytes | body SHA-256 |
|---|---|---:|---|
| [6039143224](https://github.com/RetryYN/HELIX-HARNESS/pull/2614#issuecomment-6039143224) | Opus 5.5 | 2117 | `2e6383e66246c42900e868d87046dce387af09802d0ce5223eb34320be7129ad` |
| [6005201116](https://github.com/RetryYN/HELIX-HARNESS/pull/2614#issuecomment-6005201116) | Fable 5.1 | 3143 | `bc7a0aed8a37461b4887c75dd874ccf6b95aa10d198ec7094c39150a343043e8` |

## 固定親・PO採択/register source pins

固定L2/L11の本文は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` から取得し、各22親の全spanをSHAで固定した。PO採択decisionとregisterはPO採択source revision `633bf12ea8f948db8ba3d6600179c4a9507377a7` から取得し、各22のdecision row/register record SHAをJSONに保持した。registerは当時 `registered_proposal` / `authority_effect:none` の候補記録であり、PO adoption decisionが親を採択した根拠と分けている。

| Source | Revision | Full-file SHA-256 |
|---|---|---|
| L2 `docs/helix-labo/L2-requirements/labo-requirements.md` | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` |
| L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200` |
| adoption_decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` | `633bf12ea8f948db8ba3d6600179c4a9507377a7` | `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0` |
| register `docs/governance/management-provisional-requirement-register.jsonl` | `633bf12ea8f948db8ba3d6600179c4a9507377a7` | `e7dc1180361869379966fb33f4ab263cabdfe1137ceea32dedc2b6edfea388d1` |

JSONの `fixed_parent_sources` と `PO_adoption_and_register_at_633bf12` に、全22親のinclusive line range・raw span SHA・decision/register row SHAおよびsemantic digestを収録する。旧decision/pin、current post-confirmationと正式comment補正監査の現main hash/byte pinも同JSONに記録した。

## 旧承認revisionとcurrent mainの6本文SHA

各old SHAは旧decision pinの記録と一致する。現mainのfull-body SHAは6件すべて旧承認revisionと異なる。

| 文書 | 旧承認revision SHA-256 | 現main SHA-256 | 現main bytes |
|---|---|---|---:|
| BR `docs/helix-labo/L3-requirements/business-requirements.md` | `39fa84086d01f8dc38829c12edc37fef0bd3a9a54f354891938c501fd7f4778a` | `0f8ac8cd03c76c62492f9c5f4e3557eb7f84dc8e761e17186bac532fb5efff43` | 32796 |
| FR `docs/helix-labo/L3-requirements/functional-requirements.md` | `b60c459ec97aa71a2a014f9debd733a2d1adb1afadda6b1acc8a030d3490e071` | `8e8c46bab92d29d7237cca4bab27857113088f6e25c62c459d6392fe6be30360` | 351942 |
| NFR `docs/helix-labo/L3-requirements/nfr-grade.md` | `9559a4dcff2a55d04458410cc15cdb7ef52525844a5624117d2acb0fcef3174e` | `7a0499403af9ddc7872f42ea1a09717390474384d5c19b28aac4fd2a60fc5d9d` | 90566 |
| BV `docs/helix-labo/L10-verification/business-verification.md` | `a7ea1ff62ba6d2e52464ba5057c9e0044e09edc6f861ac3d33275e1114612007` | `bf240469ba0333665e9eabb49becb1443c8426e425f8c67e82c81baa4d0b1709` | 31354 |
| FV `docs/helix-labo/L10-verification/functional-verification.md` | `d9bb07d7e7d0ecbc9947c6b1b9b554fe6d2b950674e2e9dae961594215c8e9d7` | `df0d6cf5b76e44fae067cecba9a0086c08612884e3ddb4fb31224fb2c053f8ab` | 685415 |
| NFRV `docs/helix-labo/L10-verification/nfr-verification.md` | `6064e42c024db902bcbe7136bbd490265d6a3812aac75d431209b1642227a7f3` | `9a505e0b63d3f1ba791fee982ad7a9a7476259759b43e2f59b06516ac62ce598` | 81538 |

## Stage2b section raw diff / normalized diff

抽出範囲は親見出しから次の `## ` 見出しの直前まで。raw比較はbytesそのもの。正規化比較はUTF-8を読み、CRLF/CRをLFにし、行末space/tabと末尾LFだけを除く。他の内容は変換しない。

| 文書/section | 旧raw SHA | 現raw SHA | raw結果 | 旧normalized SHA | 現normalized SHA | normalized diff |
|---|---|---|---|---|---|---|
| BR:27 `## Stage 2b — 残22親の業務境界` | `0db95329854a422275a8e281b62452b897515c5d405504b9434e6bcec72cf65b` | `1842fa1d131dbc4cee873b441931cbfaa6ad8563fec936e76950ae8affc24e47` | one terminal LF added only | `6c749b71680062aab486a309c63baa88fba4034f265f0fd23babed75e55ed473` | `6c749b71680062aab486a309c63baa88fba4034f265f0fd23babed75e55ed473` | same, +0/−0 lines |
| FR:555 `## Stage 2b 接続・条件補足22件（部分草稿・未承認）` | `ca287614775ea5a036c8470a0cdaa2931b3c2e9d594767a1b82bb50fead6f34a` | `ca287614775ea5a036c8470a0cdaa2931b3c2e9d594767a1b82bb50fead6f34a` | byte_identical | `1b7a28a8884362a2fd728956092ddcfe8513df0843087034771b63c9e593c0a7` | `1b7a28a8884362a2fd728956092ddcfe8513df0843087034771b63c9e593c0a7` | same, +0/−0 lines |
| FR:1504 `## Stage 2b — 独立case追補のFR/AC trace` | `c8012bfa8e409b36339e5de4cf7b1865be8368f9a38093b984015cffd2f5187b` | `3d5fe5979b38ca6fb8b58442c892d7604e53a32e12f59c36e9d45a6d0f39d75b` | one terminal LF added only | `b614a3e320d11e3326565b5eb354f06ce5527edbc6a3308984e2ff8bb71526bb` | `b614a3e320d11e3326565b5eb354f06ce5527edbc6a3308984e2ff8bb71526bb` | same, +0/−0 lines |
| NFR:101 `## Stage 2b — 残22親のNFR候補` | `1c56783c1acbc051abb471731f9546d443da8e5e138494cd39720700a7058819` | `1c56783c1acbc051abb471731f9546d443da8e5e138494cd39720700a7058819` | byte_identical | `ce3e7afab3b52c37c72c042ec46b445d3f1b5d89ebb0872188493b5e8240e81e` | `ce3e7afab3b52c37c72c042ec46b445d3f1b5d89ebb0872188493b5e8240e81e` | same, +0/−0 lines |
| NFR:132 `## Stage 2b — 過去追補のNFR索引（現在の個別fixture参照）` | `f9439efbd0411ea8944b13c30405284d8f5604742ed59c1b6f67c5314d3509b8` | `b65880aa9d427caf9307bd8dea58858245091047a875a1d160fbbb94b9272401` | one terminal LF added only | `c7b1d3e7c1bda8293524259823ec9d158d21443d1ef5c23c2e99233ae5da8062` | `c7b1d3e7c1bda8293524259823ec9d158d21443d1ef5c23c2e99233ae5da8062` | same, +0/−0 lines |
| BV:25 `## Stage 2b — 残22親の業務境界` | `60d0fc92ad85c51bee4f096d792cc2b60b40ace6bc8402a2ed354fabe64796b5` | `e1fe7ec0f5ea08cc812219f2d03ab369c1a5a421c9abe9471a238dcdf34c3947` | one terminal LF added only | `4ab395d38697d6f50a295c2972c50f3dfa2efbb7e9853fafa45f3fb3350e75a6` | `4ab395d38697d6f50a295c2972c50f3dfa2efbb7e9853fafa45f3fb3350e75a6` | same, +0/−0 lines |
| FV:561 `## Stage 2b 接続・条件補足22件（未承認・未実行）` | `25a5375123d57d745d7f33ac258132ee9621c87aa46210c120a0d3b5589ff46c` | `25a5375123d57d745d7f33ac258132ee9621c87aa46210c120a0d3b5589ff46c` | byte_identical | `12ad5f0bc6df4597a58f53f790c2703e92ded5075a0a3dcf3ca3628fc14878c1` | `12ad5f0bc6df4597a58f53f790c2703e92ded5075a0a3dcf3ca3628fc14878c1` | same, +0/−0 lines |
| FV:1207 `## Stage 2b — 22親の独立反例fixture追補` | `bfc0b98a655397a20ba8a04b4d951d127c97878262246417640b3c495dcd736a` | `bfc0b98a655397a20ba8a04b4d951d127c97878262246417640b3c495dcd736a` | byte_identical | `337b8e44e032487a2847a4666921a96c657da2f6039a7a055b32ba0dab180143` | `337b8e44e032487a2847a4666921a96c657da2f6039a7a055b32ba0dab180143` | same, +0/−0 lines |
| NFRV:86 `## Stage 2b — 残22親のNFR測定設計` | `47988e1ee19ff5190a2333f36b9ffcd33182acb8c603f0de41cae7815b012b86` | `59f984709b1c825730851ec4317fedca71e1643a752b4f2732fb3bb5cd9b519a` | one terminal LF added only | `6893a3c2e61fc0d1a0fb82c7568e9800b88d4456603a6fc0394a42f30af24ec1` | `6893a3c2e61fc0d1a0fb82c7568e9800b88d4456603a6fc0394a42f30af24ec1` | same, +0/−0 lines |

6文書に含まれる9個のStage2b残部sectionはすべてnormalized内容が一致する。rawでも4 sectionはbyte-identical、残り5 sectionの差は各section末尾に追加されたLF 1 byteだけである。通常のL3委任判断は6本文全体revisionに結びつくため、section連続性だけで旧承認を現main full bodyへ移さない。

## 旧HELIX sourceの扱い

FR本文に記載された4旧sourceをそれぞれ実読し、asset ID・full-file SHA・該当raw span SHAをJSONへ固定した。

| 旧source / asset | 再利用・再導出・置換の扱い |
|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md` (SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`) | 意味・版・source lineage・unknownを保つ要求の形を類例として再利用。Stage2bの各domain接続semanticsは現行固定L2から再導出。旧Issue/runtime/approval gateは置換/不採用。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md` (SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`) | positive/negative traceと独立caseの組み方のみ類例として再利用。旧test-designやruntimeは実行せず、旧case ID・oracleを移植しない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md` (SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`) | scope/counterexample/proposal/authority boundaryの隣接概念を再導出の参考とする。UIL lifecycle/authority/outputを現行parent扱いしない。 |
| `LEGACY-ASSET-0B5B38F146D9538C9A36` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md` (SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`) | 正例/反例をfield単位で分ける構造の類例のみ。旧受入仕様・実行方法を移さない。 |

### 残るrevision判断

旧approval body `4e61305f…`の6 SHAとcurrent mainの6 SHAは異なる。したがってcurrent full-body revisionにはfresh exact-revision Opus/Fable reviewが必要である。このauditは旧条件成立の新規再宣言、承認記録、実装/実行許可を作らない。旧runtime/test/CIは実行していない。

検証内容はformal GitHub API comment bodyのUTF-8 SHA/byte数、旧decision pinとの旧6 SHA照合、固定f6dad L2/L11 22行、633 PO adoption/register 22行、6 current full SHA、9 section raw/normalized比較。詳細なper-row pinは同名JSONを参照。
