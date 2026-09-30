# v1.3 execution policy lines 167–171 condition audit

対象は旧v1.3 `helix-harness-requirements_v1.3.md`の物理行167–171、`REQSRC-SUP-00127`〜`REQSRC-SUP-00131`である。archive source SHA-256は`788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。行ごとの原文・line SHA-256は同梱JSONに保持する。

比較基準はPO固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のHARNESS L2/L11 bytesと、PRの実base `c6418a5602a056d3503e578a0a8c92df15a6daeb`の現行L2/L11である。固定L2 SHA-256は`aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、固定L11は`09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。base L2/L11 SHA-256はそれぞれ`78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6`と`a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e`である。

後発比較では2026-09-29 PO判断 `po-decision-2026-09-29-57candidates.md`（SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）が採択したHARNESS-L2-034とL2-039のexact pair revisionを参照する。同判断はsource revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`、L2 file SHA `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、L11 file SHA `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`を固定する。034のsection digestはL2 `dee3a5ca82c62195e1ae7322e05c1dc624c9633a2abb77aa0ff1e943ae8c6156`／L11 `391f640508944ba2f32b5751a2a9a17fbc9f89ef76f46953c1af68ba907a9fdf`、039はL2 `e2a71f7961a3e8c7c241c7d1ef3238382d5d709296db2fb7e57a9dd0cd9215a0`／L11 `63177feef3ec82d4e0a4bb5a56c7cfefdbe3666f0eb18f0a5d2934cfd1211746`である。L2-034/039の採択はそのexact identity/revisionに限り、旧source行のcoverageやsuccessorを自動生成しない。

## 行単位の比較

| 旧source item | 状態 | 比較結果 |
|---|---|---|
| `REQSRC-SUP-00127` line 167 | `partial` | 後発採択のL2-039/L11-039はExperience/UI/Frontendのscope・revisionに結ぶ契約とtraceを定め、画面設計に意味上関連する。一方、`design-bottomup`をcompatibility inputとしてbackend-derived trigger／方向条件を`SCREEN_DESIGN` specialist workflowへ渡す条件はない。旧aliasから専門workflowへの接続が残る。 |
| `REQSRC-SUP-00128` line 168 | `partial` | 後発採択のL2-039/L11-039はUI/Frontend関係をHARNESS-COREの契約とし、OSのworkflow instance/runtimeを所有させないが、旧`design-bottomup`をtyped compatibility inputとして保持することや、同名workflow modelを作らないalias固有条件までは定めない。責務の類似だけで旧conditionをcoveredにしない。 |
| `REQSRC-SUP-00129` line 169 | `partial` | 固定L2-003はL7–L12のright-armを区別し、L2-018/021と対L11はL12運用評価・運用検証を含む。旧`operation_verification`／`verification`値をそのscopeへのcompatibility inputとして解釈する条件はない。 |
| `REQSRC-SUP-00130` line 170 | `partial` | L2-003/018/021と対L11に運用評価の意味があるが、旧verification aliasを受けても新しい同名workflow modelを作らないというtyped compatibility条件は固定L2/L11で確認できない。 |
| `REQSRC-SUP-00131` line 171 | `partial` | 後発採択のHARNESS-L2-034/L11-034は要求/NFR単位の計測契約、metric、測定条件、実行責務、完成判定oracleを定めるため、計測機能として実質的に対応する。ただし旧名`NFR_MEASUREMENT`のcapability identityや当該source lineへのformal successor割当はない。機能上の対応をexact adoptionと扱わず、残るidentity/routeを保持する。 |

## 固定・現行revisionとauthority境界

POの2026-09-28判断記録はL2/L11の基準revisionと明示候補集合を固定する。2026-09-29判断は後から追加されたL2-034/039のexact pair revisionsを採択した。039本文のcandidate metadataは判断前snapshotであり採択状態はdecision recordと対象revisionから読む。034はNFR計測の機能意味に対応し、039はUI/Frontend契約に関連するが、いずれも旧v1.3 source atomを個別採択した記録ではない。よってsource行を部分対応として扱い、formal successorと完全coverageは割り当てない。

この監査は5行の条件比較であり、要求採択、形式的successor割当、実装・受入実行、stage終了を生成しない。状態集計は`covered: 0`、`partial: 5`、`missing: 0`。旧runtime、test、CIは実行していない。

比較参照の主要箇所:

- 固定HARNESS L2: `product-requirements.md:98–112`（L2-002/003のworkflow・screen/L2.5・right-arm意味）、`:108–112`（L7–L12と状態遷移）、`:156–157`（品質条件とL12観測への接続）、`:411–417`（L2-018）、`:438–455`（L2-021/022）
- 固定HARNESS L11: `product-acceptance.md:35–43`（style/ticket/screen/L2.5）、`:43`（受入・運用評価状態の分離）、`:211–217`（L2-016〜022 acceptance row）
- 後発採択のHARNESS-L2-034/L11-034: 2026-09-29 PO判断記録の該当表。source revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`、L2/L11 section digestは本文冒頭に記載。
- 後発採択のHARNESS-L2-039/L11-039: 同判断記録の該当表。本文sectionのcandidate metadataではなくdecision recordがexact revisionのauthorityを示す。
- 判断記録: `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:58–68`、`docs/governance/decisions/po-decision-2026-09-29-57candidates.md:39,44,104`
