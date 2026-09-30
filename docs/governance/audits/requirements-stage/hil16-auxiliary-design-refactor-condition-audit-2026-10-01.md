# HIL-16 設計refactor補助条件の照合

status: bounded_source_and_authority_audit
basis_revision: 50686b6762788574cb471967e8c24846d3dd56ae
scope: HR-FR-HIL-16、HAC-HIL-16a/b/c、HAT-HIL-16、参照する旧要求atom、旧consumer、現行HARNESS L2/L11とPO判断

## 結論

旧HIL-16の意味は、現行の採択済み`HARNESS-L2-016`、57件判断で採択された`HARNESS-L2-042`、11件判断で採択された`HARNESS-L2-048`に部分的に対応する。016は既存の振る舞い・契約・要求の保持と差分のBackflowを担い、042はDesign Refactor判定にsemantic similarity・consumer・oracle・dependency graphを用いて機能追加を別episodeへ分け、048は役割型、stable object/oracle identity、内部rename、およびpublic／永続DB／設定面の境界を扱う。

この対応は旧source atomごとの正式successor割当や被覆完了を示さない。旧IRの5 atom、補助contract、3 HAC、HATは`preserved_pending_rehome`または`unmapped`であり、旧consumer/test-designは未実装の設計資料である。とくに、042は旧IR HIL-16のsourceではなくv1.3の別atomを入力とし、048はHIL-FR-40とHIL-NFR-24/25の選択範囲を明示するものの、旧contract/HAC/HATのsuccessorを指定していない。未対応atomを保持し、closure・実装・実行・受入合格を主張しない。

## 読んだsourceとrevision

作業基点はmain `50686b6762788574cb471967e8c24846d3dd56ae`。旧archiveは参照のみ。`AGENTS.md`、`CLAUDE.md`、`docs/governance/new-generation-start-here.md`、`legacy-asset-reuse-control.md`、`authority-state-model.md`を入口・権限・旧資産統制として確認した。旧資産明細台帳の該当行とsource digestは次の通り。

| source | 行・pointer | SHA-256 | 資産明細台帳 |
|---|---|---|---|
| 旧IR `requirements.json` | `#/HIL-BR-21` 862–899、`#/HIL-FR-39` 3060–3097、`#/HIL-FR-40` 3103–3140、`#/HIL-NFR-24` 5412–5449、`#/HIL-NFR-25` 5455–5492 | `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | `LEGACY-ASSET-A60CF91DD2AF6693E6F9` (`source_snapshot_preservation`) |
| 旧IR `system_contracts.json` | `#/HR-FR-HIL-16`, 364–385 | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab` | `LEGACY-ASSET-67761C517521603F844C` (`source_snapshot_preservation`) |
| 旧IR `acceptance_cases.json` | `#/HAC-HIL-16a/b/c`, 497–529 | `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19` | `LEGACY-ASSET-4886CEF2A7AB5B7AA5C8` (`source_snapshot_preservation`) |
| 旧IR `system_tests.json` | `#/HAT-HIL-16`, 297–315 | `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a` | `LEGACY-ASSET-F7A988C2531DEAC3D23B` (`source_snapshot_preservation`, carry-forward=`preserved_pending_rehome`) |
| 旧L1要求表 | `infinity-loop-platform-requirements.md:73,129–130,204–205` | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` (`source_snapshot_preservation`) |
| 旧L3要求consumer | `infinity-loop-functional-requirements.md:50,79` | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `LEGACY-ASSET-C7F0C3B79CBAA72960BF` (`unresolved`) |
| 旧L5 detail design | `design-refactoring-domain-model.md:10–22,36–51,64–68,90` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `LEGACY-ASSET-603D0E8D8193914F4AC0` (`unresolved`) |
| 旧L6 function design | `design-refactoring-domain-model.md:10–17,27–44` | `626e177f61cbb8170b0d557241f75fcf2958a5f64d41fc1078f4ef5607c3086e` | `LEGACY-ASSET-3B8F5F0230F7469B5D11` (`unresolved`) |
| 旧L3 HAT design | `L3-infinity-loop-acceptance-test-design.md:48` | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `LEGACY-ASSET-FA8C6E69463183D6A19B` (`unresolved`) |
| 旧L5 integration test design | `L5-design-refactoring-domain-model-integration-test-design.md:11–17,24–57` | `869d4494c8f5cfaea4d90f29392ee1a2c7c63cc2084712eb43e0c1d91cdeca60` | `LEGACY-ASSET-7E16E3B80335D8EC6F35` (`unresolved`) |
| 旧L6 unit test design | `L6-design-refactoring-domain-model-unit-test-design.md:11–17,24–61` | `59bda6e19b520e51c331e170cb674f76f0d65bf04084050bcbc299410a5fcdc6` | `LEGACY-ASSET-248A7238A7FD1BA24E66` (`unresolved`) |
| 旧L9 system test design | `L9-infinity-loop-platform-system-test-design.md:52–53` | `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705` | `LEGACY-ASSET-8CEC5559B69B216F7CCF` (`unresolved`) |
| 旧L1 operational test design | `L1-infinity-loop-operational-test-design.md:66–67` | `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576` | `LEGACY-ASSET-AFE91778057B7E76BEEC` (`unresolved`) |

旧requirements sourceは旧L1表とIRを別のsource recordとして保つ。L1の5要求atomはsource relation行21、72–73、126–127で`ir_and_preserved_document_exact`かつ`preserved_pending_rehome`。補助carry-forward台帳（SHA-256 `1a0591e1da6f9579d970aedfccff90ac6a8e1aefbbe0f4047e3aeb950a8449bb`）では`REQSRC-SUP-00623`がcontract、`REQSRC-SUP-00567`–`00569`がHAC、`REQSRC-SUP-00647`がHATを指し、各々`relation_status: unmapped`、`successor_requirement_ids: []`、`meaning_change_applied: false`である。原source状態`specified`/`frozen`（新世代上の`specified_frozen`）を保つが、HARNESSへの配置・採否は自動決定しない。

## 旧contract、HAC/HATとconsumer

`HR-FR-HIL-16` rev.1 は5 atomを束ね、before graph/oracle/consumer/role catalogから最小plan・pair/oracle/rollbackへ進む契約を記す。failure条件はlexical-only rename、根拠のない抽象化、誤route、consumer漏れ。HACは`HAC-HIL-16a` positive（semantic同等の最小改善だけRefactor）、`16b` negative（lexical-only／汎用化を拒否）、`16c` boundary（internal／public／DBを別route）である。HATは`designed_not_implemented`、HST-HIL-025/026をsupporting testとしてsemantic signature、consumer/oracle、role/name、rollbackとnegative boundaryを挙げる。

旧consumerが補うnegative oracleは設計上の条件で、現行仕様へ自動採用しない。

- L3要求表は契約の5 atom、failure/evidence、3 HACを再掲する（L3要求consumer:50,79）。L3 HAT表はHST-HIL-025/026と、semantic signature・consumer/oracle・role/name・rollback、lexical-only・根拠なし抽象化・誤routeを関連づける（L3 HAT design:48）。
- L5 detail designは一変換ごとのexternalize/commonize/objectize/semantic-rename、semantic signature、全consumer/oracle、role invariant、pair、rollbackを詳述し、public contract/DB/state/要求差分のrouteを記す（L5 detail:36–51,64–68,90）。これらの型、table/state、実装境界は旧設計固有。
- L6 unit designはlexical-only/future-use/複合変換/権限欠落のreject、consumerまたはrollback欠落、semantic差分、public/DB route、曖昧名、stable ID/oracle bindingのnegativeを設計する。HST-CASE-025-05..12と026-02以降はroute誤り、consumer欠落、rollback欠落、曖昧名、role invariantや依存方向を含む（L6 unit:27–44,53–61）。
- L5 integration designはbehavior/I/O/failure/state変更時のRedesign、DB state変更時のRetrofit、future-use abstractionとlexical-onlyの拒否、consumer/pair/oracle/authority/rollback不足、stale/偽造binding、fault/CASによるpartial commit 0を設計する（L5 integration:29–57）。L9のHST-025/026は各system-level routeとfailure名を記し、statusは「設計済み／未実装」（L9:52–53）。L1 operational HOT-39/40は名称衝突、文字列類似のみ、public rename、observable behavior変更、曖昧なrole、internal/public/DBの区分を個別投入する（L1 operational:66–67）。

これらは旧negative oracleのscopeを理解する証拠であり、旧API名、error code、DB/table schema、状態enum、固定13 role、transaction/CAS、実行順、または旧test合格を新世代の契約・実装・合格として再利用しない。旧test-design本文自身に未実装状態がある。

## 現行HARNESSの直接・近接対応

照合時の現行ファイルSHA-256はL2 `78c32b598f449cf80d90e0e35ab6d39b94bd150abbfd543bc75bdb8be949ae6`、L11 `a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e`。

| 現行identity／authority | 対応するHIL-16条件 | 境界・未解決 |
|---|---|---|
| `HARNESS-L2/L11-016`。2026-09-28 HARNESS PO記録（本文SHAは後段、:45）が固定したL2/L11一式24件の一つ。判断の`source_repository_revision`=`f6dad2a33e24f000b87d7f09b8d40288257e74cc`におけるL2節SHA `3abd8cdd1df5335a87848fcd7c232708dfd6611a5c0e78083962c33e41990e26`、L11節SHA `af638df15c01789c0b130047655bed93f24efa9f9913581870990e7fde7388e7`。両節はbasis HEADでも同digest。L2 `product-requirements.md:395–401`、L11 `product-acceptance.md:290–296`。登録`MPR-RC-HARNESS-L2-016-004`は仮登録（`authority_effect: none`）。 | 振る舞い・契約・要求が保てる右側変更のみRefactorし、意味差分を左へBackflowする（HAC-16a/cの一般境界）。paired design/contract・既存oracleを必要とし、Performance Refactorはbaseline等を先に固定する。L11はregression、要求意味差分、測定不能・budget違反をnegativeとしている。 | semantic/name comparison、全consumer graphの作成、Domain Object/Naming Catalog、internal/public/DB rename区分を全て定義する要件ではない。 |
| `HARNESS-L2/L11-042`。POの57件判断（本文SHAは後段, :47）で採択。exact registration `MPR-RC-HARNESS-L2-042-001`、L2節digest `7da6b3394cbc96bdf028a4738000554e1cf7a946595c4abf43504b24968f34eb`、L11節digest `3ba00726800c61f1de165e48e6f62ea4359a368a50a9e9cd1517deb09df395f9`。L2 `product-requirements.md:972–980`、L11 `product-acceptance.md:716–733`。 | semantic similarity・consumer・oracle・dependency graphでDesign Refactor判定し、名称類似だけの統合を拒否。未知のconsumer/dependency、oracle、revisionはunknown/未評価。機能追加を別episodeへ分け、意味変更は既存Backflowへ返す。HAC-16bおよびHAT/HSTのnegative oracleに近い。 | 042が直接引用するのは別source atom `REQSRC-SUP-00089`と監査revision `V13-BASE-6FAB-L0104`。同じ意味が一部重なっても、旧IRのHIL-BR-21/FR-39等をsuccessorに割り当てた証拠ではない。本文metadataの「未採択候補」は判断前snapshot表記で、exact revisionのPO decisionを優先する。 |
| `HARNESS-L2/L11-048`。POの11件判断（本文SHAは後段, :28）で採択。exact registration `MPR-RC-HARNESS-L2-048-001`、L2節digest `9328dccd943ac8f690d149673a5f05626465990f3197306a45d7b8cca27c34d5`、L11節digest `4a4d893e909d1ccc32b52cc96b22f82eaef6bffead7037677df561cd2617466d`。L2 `product-requirements.md:1055–1068`、L11 `product-acceptance.md:793–810`。 | 直接入力に旧HIL-FR-40、HIL-NFR-24/25と選択済みbasic-design clause spansを明記。role/object、stable identityからsymbolとoracleへの別edge、internal rename条件、文字列類似のみの拒否、consumer/behavior/public API/CLI/persisted DB/event/設定の返却を扱う。HAC-16b/cとHST-026の負例へ意味対応する。 | HIL-BR-21・HIL-FR-39全体、HR-FR-HIL-16、HAC/HATのformal successor割当ではない。旧basic-design schemaや残りsource clauseは明示的に範囲外・holding。L11の例は未実行受入oracleであり、本文metadata「未採択」はPO decision前のsnapshot表記。 |

042のPO判断は旧v1.3の限定atomに対するcandidate sectionの採択であり、機能が似る旧IRへauthorityを波及させない。048は選んだ旧FR-40/NFR-24/25の意味を現行候補へ再導出し、POがそのexact L2/L11節を採択した証拠だが、requirements carry-forward上のIR source itemは未mappedのままである。016・042・048の合成でHIL-16全域を被覆したとは数えない。

## 後続PO判断のscope

- 2026-09-29の57件判断は`HARNESS-L2-042-001`を明示採択した（同判断:47）。その時点では048は判断対象外である（同:29）。2026-09-29の11件判断が翌段階で`HARNESS-L2-048-001`を採択している（同判断:28）。各判断は表示されたexact L2/L11 bytesにだけ効く。
- 2026-09-30 live26判断（SHA `8249447f…60ee145`）は対象26 registrationとsection digestを固定し、HARNESS-049、055–063等を列挙するが、016/042/048の再判断や旧HIL-16 IR successor決定は記録しない。判断の冒頭(:1–)に示す通り、採否をregistrationや近似内容だけから広げない。
- 57/11/live26のPO採択は対象別L2/L11の意味authorityを固定する。いずれも旧source atomのretire、formal successor assignment、実装・実行許可、HAT合格、requirements stage完了を生成しない。現行本文のcandidate metadataと後発decisionが食い違う場合は、decisionが固定するexact revisionにだけ判断を適用し、ほかのsectionや旧identityへ拡張しない。

## authorityと静的確認の範囲

authority-state-model（SHA-256 `812f423b4b9952666b0ef91e741fec62f54caa3c884124ec534abbbe70be4616`）に従い、source authority、target authority、carry-forward、management registrationを分けて記録した。旧IRのsource statusは保持される。MPRは`authority_effect: none`の仮登録である。PO decisionはexact target revisionの採択根拠だが、旧atomのcarry-forward状態は変更しない。HIL-16補助sourceの現状はsuccessorなし・unmappedである。

判断記録と管理登録の本文SHA-256を固定する。016は[HARNESS要求PO判断](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md) `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`、042は[57候補PO判断](../../decisions/po-decision-2026-09-29-57candidates.md) `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、048は[11候補PO判断](../../decisions/po-decision-2026-09-29-11candidates.md) `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`、live26境界確認は[26候補PO判断](../../decisions/po-decision-2026-09-30-live26.md) `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`。仮登録一覧の本文SHA-256は`ada29e38e99bef16d1c68324129be1519723090cbcc910b50f4c5d47387c626a`、補助carry-forward一覧は`1a0591e1da6f9579d970aedfccff90ac6a8e1aefbbe0f4047e3aeb950a8449bb`である。各decisionの採択範囲は記載済みのexact identity／sectionに限り、ここに記したSHAは過去の判断本文を識別するためのもの。

静的確認は、基準HEAD、列挙sourceのSHA/行/pointer、台帳asset IDとdisposition、contract-HAC-HATのID接続、現行L2/L11 sectionおよびdecision表のexact digest、source/target authority境界の照合に限定した。旧workflow/runtime/CLI/test/CIを実行していない。新世代製品の機能検証ではない。
