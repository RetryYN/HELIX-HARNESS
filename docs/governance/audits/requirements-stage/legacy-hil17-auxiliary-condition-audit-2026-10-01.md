# HIL-17 補助条件・旧負例の現行照合

## 対象と基準revision

本記録は `origin/main` の `50686b6762788574cb471967e8c24846d3dd56ae` を基準とする静的照合である。archive source、既存の2026-09-28/29照合記録、現在のHARNESS L2/L11と対象revision付きPO判断を読んだ。旧workflow、CLI、runtime、test、CIは実行していない。`designed_not_implemented` と旧テスト設計の記述を実行・受入証拠へ読み替えない。

| 旧source / consumer | 行 | SHA-256 | asset ID / disposition |
|---|---:|---|---|
| `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json` | 387–415 | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab` | `LEGACY-ASSET-67761C517521603F844C`、source snapshot preservation |
| `archive/legacy-generation-2026-09-14/root/requirements-ir/acceptance_cases.json` | 530–561 | `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19` | `LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`、source snapshot preservation |
| `archive/legacy-generation-2026-09-14/root/requirements-ir/system_tests.json` | 317–332 | `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a` | `LEGACY-ASSET-F7A988C2531DEAC3D23B`、source snapshot preservation |
| `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` | 918–944等 | `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、source snapshot preservation |
| `archive/legacy-generation-2026-09-14/root/requirements-ir/refinement_contracts.json` | `RAS-HIL-17` | `6230d6c0ae341ea45eba1e9bf1d40389363b9f1f12c158e5b5c15799122e1443` | `LEGACY-ASSET-4A7A45BC495D1B2677A2`、source snapshot preservation |
| 旧L3 `infinity-loop-functional-requirements.md` | 51, 80 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `LEGACY-ASSET-C7F0C3B79CBAA72960BF`、unresolved |
| 旧L5詳細 `requirement-translation-obligation.md` | 1–20, §0–§4 | `c3f51929c1ccee67534023d46fa1df7c4980002f73be3b8a4708832abc1c0dea` | `LEGACY-ASSET-65AD8D5F8D976121F583`、unresolved |
| 旧L6機能 `requirement-translation-obligation.md` | 1–20, §0–§1 | `b4e99bb1ccba1c3bf090e8e40ea286efee68abbaf6a93575f1d21ca5492cf901` | `LEGACY-ASSET-41F787DD7C89B20A3732`、unresolved |
| `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md` | 49 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `LEGACY-ASSET-FA8C6E69463183D6A19B`、legacy test design/oracle |
| 旧L5 integration test design | HDS header, scenario/test sections | `f38a470b3d3359df722c5183ba2b848b1d745ac553828bbcf6d9f04f57e03ef0` | `LEGACY-ASSET-FA6587572557F7C8301C`、legacy test design/oracle |
| 旧L6 unit test design | HDS header, primary case tables | `81f1e3945b04fa33aeae11daf77e06b63d7d0e90ce11ea7a16348af2bbd8a479` | `LEGACY-ASSET-EC1CC5C557E8A1621149`、legacy test design/oracle |
| `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md` | 68–70 | `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576` | `LEGACY-ASSET-AFE91778057B7E76BEEC`、legacy test design/oracle |
| `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md` | 54–56 | `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705` | `LEGACY-ASSET-8CEC5559B69B216F7CCF`、legacy test design/oracle |

## 旧contract、IR atoms、補助oracle

旧 `HR-FR-HIL-17` rev.1 はsource status `specified` で、behaviorは原文をauthority付きatomへ翻訳し、design obligationとstable revision/edge/change receiptを正本化してtemplate gapをshadow reviewへ送ること。transitionはcustodied source/authorityとversioned templateを前提に全typed edgeが揃い、未消込/ambiguityが0のatomだけactiveとする。failure/evidenceには原文消失、aggregate/TBD/偽N/A、self-promotion、stale伝播欠落と、revision・challenge・template・obligation・gap/review/change receiptを挙げる（旧 `system_contracts.json:391–414`）。

契約に結ばれる旧IR atomは `HIL-BR-22/23/24`、`HIL-FR-41/42/43/44/45`、`HIL-NFR-26/27/28` の11件である。requirements IRはこれらをHAC三件・HAT一件・`RAS-HIL-17`へ結ぶ（`requirements.json:918–944`）。旧L3表 `infinity-loop-functional-requirements.md:51,80` は同じ11 IDと三つのacceptance polarityを再掲する。各IR identityはsource側のspecified/frozenとして保全される一方、現行対象への successor割当は別軸であり、identityや旧L3表への参照だけから成立しない。

| 旧oracle | polarity / 条件 | IR行と現行holding |
|---|---|---|
| `HAC-HIL-17a` | positive: atom/challengeを決定routeし、完全revisionのみactive | `acceptance_cases.json:530–540`、`REQSRC-SUP-00570` は `preserved_pending_rehome` / `unmapped` / successorなし |
| `HAC-HIL-17b` | negative: TBD/N/A/orphan/change欠落のいずれかでfreeze拒否 | `:541–551`、`REQSRC-SUP-00571` は同上 |
| `HAC-HIL-17c` | boundary: template gapは独立review前active 0 | `:552–561`、`REQSRC-SUP-00572` は同上 |
| `HAT-HIL-17` | source/authority/oracle、template/obligation/change/review。negative境界はaggregate/TBD/N/A、self-promotion、stale | `system_tests.json:317–332`、`REQSRC-SUP-00648` は同上。statusは `designed_not_implemented` |

旧contract holding `REQSRC-SUP-00624` も `preserved_pending_rehome` / `unmapped` / successorなしである。HACとHATは親contractの補助oracleであり、独立した同格L2要求数として二重計上しない。旧sourceの保持状態は、意味移管の完了を表さない。

## 旧consumerとfailure oracle

旧L5詳細設計はrequirement translator、challenge、template-gap router、design-obligation graphを一つの旧構成へ結び、原子的write、active pointer、CAS transaction、固定schema/APIを詳細化する。旧L6機能設計はpure API/commit port、failure code、receipt、projectionを規定する。これらは旧実装境界とdata modelであり、現行HARNESS契約へそのまま採択しない。source資産台帳上も両設計は `unresolved` の歴史資料である。

旧test consumer群はoracle意図をさらに具体化する。L1 `HOT-HIL-41/42/43` はそれぞれTBD/aggregate/偽N/A/orphan、曖昧または表現不能な要求とtemplate gap、要求のsplit/merge/rename/N/A/change receiptの欠落を負例にする（L1 operational test design:68–70）。L9の `HST-HIL-027/028/029` はobligation、translation/template gap、definition ledger/change/staleを親HATへ結ぶ（L9 platform test design:54–56）。L6設計の primary cases は、source custody/authority/atom欠落、ambiguity、TBDやaggregate、gap未報告・偽N/A・早期promotion・独立review欠落、template version drift、orphan/片方向edge/oracle欠落、split/merge/rename/supersede/N/A/change receipt欠落、downstream stale漏れを個別failureとして列挙する（L6 unit test design: §1 primary cases `HST-CASE-027-01..32`, `028-01..20`, `029-01..23`）。L5 integration設計はこれらをcommit/reconcile、revision変更、failure injectionを含む旧atomic flowへ束ねる。

この詳細はTBD/N/A/orphan/change omission/template-gapを独立に消し込むべき旧負例の根拠として読む。旧固定API、error enum、table、transaction port、case分母、HST実装や成功実績は現行の採択・実行証拠ではない。test-design資産は台帳上 `legacy_test_design_or_oracle` で完全一致再利用対象外である。

## 現行HARNESS L2/L11との照合

現在のHARNESS L2本文SHA-256は `78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6`、L11は `a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e`。HARNESS-L2-063のsection digestは `f0a1014c9514d70e8cbee63faca3ae6679c43240c89e095c4b484b161ed75b46`、対するL11 section digestは `fb545fc06feb1b032899cc24e8b579bb2032747a4e65f40ae354103b0bda2233`（L2:1238–1248、L11:952–963）。

| 旧条件 | 現行対応と判定 |
|---|---|
| 原文・authorityから選択scope内のatom/challengeを結び、完全revisionだけeligibleとする | HARNESS-L2-063は各atomのidentity/source span/authority revision/disposition/challenge状態、同じscopeのtemplate/edge/oracle、`eligible/incomplete/unknown`を定義する。保持範囲はsource receiptが特定するbehavior/transition/failure-evidenceの3意味sliceに限る。HR-FR-HIL-17全体や11 IR atomのformal successorではない。 |
| obligation / typed edge / acceptance oracle の欠落、aggregate、TBD、orphan、理由なしN/A | 063とL11 959行は個別edge/oracle closure、片方向・型/端点違い、未実行oracle、根拠のないN/A、aggregate/TBD/orphanを不成立条件にする。L2-040のtyped-edge catalog、L2-035のsource basis / acceptance contributionは補助契約であり、単独で063のscope全体を閉じない。 |
| revision変更後のchange receiptとstale伝播 | 063とL11 960行はbefore/after revisionと影響edge/oracleを結び、古いreceiptを現revisionに使わないことを定める。旧の固定transaction/CAS/store設計は採択対象外。 |
| template gapの独立review前active禁止 | L2-063とL11 961行はgap、review対象revision、独立reviewer、finding/dispositionが揃う前のactive化を拒否する。L2-009はtemplate選択/適用と不足inputのBackflow、L2-041はactive template atom抽出/gap提示を所有し、063がそれらを置換しない。 |
| Template / atom抽出 / requirement formationの責務 | L2-009、L2-041、L2-008は関連する既存条件である。L2-026等のdesign compositionやL2-022のoracle契約も独立に残る。近接・参照・一般的なtemplate条件から11旧IR atomの全件移管を推定しない。 |
| Unknown / 未選択scope | L11 962行は未選択・未観測sourceをpass/failure/N/Aに推測変換せずunknownで残す。L2-063のclosure結果だけからOSの登録/state保存や実運転を推定しない（L2:1242,1246、L11:954,963）。 |

## 後続判断とauthority状態

対象revisionを固定したdecision recordsを優先し、候補見出し・登録状態だけで採択を推定しない。

- 2026-09-28 HARNESS判断記録（SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）とHIL-17補助source receiptは、固定L1/L2/L11 revisionのHARNESS-L2-009を採択済みと特定する。009の範囲はtemplate選択/適用と不足input Backflowであり、source atomからfreezeまでの全edge/oracle receiptではない。
- 2026-09-29の57候補decision（SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、:40,45）はHARNESS-L2-035（source basis/候補理由/acceptance contribution/scope derivation）とHARNESS-L2-040（versioned layer/pair/row catalogとtyped edge inventory）を各固定registrationで採択した。いずれも063全体の閉包またはHR-FR-HIL-17全体の後継割当ではない。
- 2026-09-29の11候補decision（SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`、:27）はHARNESS-L2-041のregistration `MPR-RC-HARNESS-L2-041-003` と固定L2/L11 sectionを採択し、active templateのatom抽出と明示gap報告を対象にした。これは独立review/freeze closureを単独で担わない。
- 2026-09-30 live26 decision（SHA-256 `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`、:48,72）は `MPR-RC-HARNESS-L2-063-001` と上記L2/L11 section digestに対してHARNESS-L2-063を承認した。ただし明示的に選択したのは3条件のみで、導入版は未指定。本文の「candidate」見出しより、このexact revision decisionをauthority sourceとして扱う。承認された現行contract意味は存在するが、旧contract/IR/HAC/HATのsuccessor IDが割り当てられたことや、実装・実行・受入が完了したことを意味しない。
- 同live26 decisionはHARNESS-L2-057とHELIXOS-L2-054を組で採択したが、057は限定scopeのclosure gate条件であり、memory atomをholdingに残す。これはHIL-17のatom/edge/oracle closureにも、HIL-17のlegacy successor assignmentにも代用できない。

現在の補助source record `hr17-residual-coverage-receipt-2026-09-29.json` は三つのsource sliceを局所的にpartitionし、HAC三件とHATをoracle referenceとして記す。`coverage_result: no_loss` はその3 slice内のpartitionに限り、holding 655 item、11 IR identity、HR-FR-HIL-17全体、HAC/HAT全体のno-loss/formal successorを主張しない。現行source carry-forwardの `REQSRC-SUP-00570..572`、`00624`、`00648` もsuccessor IDsが空である。

したがって分類は、**選択した3 contract slice: adopted current HARNESS-L2-063意味 / 旧source identityへのformal successorなし**、**L2-009/035/040/041: 採択済みの近接supporting contracts、直接successorではない**、**11旧IR atomsとHAC/HATの残余: `preserved_pending_rehome` / `unmapped`、未解決**。TBD/N/A/orphan/change omission/template-gapのfailure意味は063等に部分的に再導出されているが、全source closure、旧consumer closure、旧oracleの実行・現行受入合格は未証明である。

## 静的検証

- 基準commit: `50686b6762788574cb471967e8c24846d3dd56ae`。
- archive asset path/digest、IR identity→HAC/HAT link、current L2/L11 section digestとdecision registrationを静的に照合した。
- 旧test、runtime、CIは実行していない。旧L5/L6 API/schema/failure code、旧HST case設計、候補・PO decisionの存在を実装または実行完了へ読み替えていない。
