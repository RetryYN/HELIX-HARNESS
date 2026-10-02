# HIL-NFR-13〜15 原文条件と現行要求の照合

- 初回照合基準：main `0c9baec55a85e98ce624f68957ba989ee169406c`。後続read-after: `bca7592cf444b07292a1366e3b28e7de4d9f88cb`、最新main `46be4fa55d384b8a8eb95f464f78c8a11e95542c`。OS-125候補はbca7592をdraft baseとして作成し、46be4 mainのOS-124後へ追加した。
- 対象は旧HIL-NFR-13/14/15の各source identityと対応consumer（HR/HAC/HAT）。全旧要求や全source closureの監査ではない。
- 原文L1はasset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`の193–195行。IRはasset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。補助system contract/acceptance/system testはそれぞれasset `LEGACY-ASSET-67761C517521603F844C`、`LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`、`LEGACY-ASSET-F7A988C2531DEAC3D23B`。HAT/HSTは設計済み未実装であり実行していない。
- IR carry-forward rows 115–117は3 identityとも`preserved_pending_rehome`、successor IDなし。意味条件の現行保持とformal source bindingを別に判定した。

## HIL-NFR-13

同一snapshot・engine/detector version・configでartifact/findingが決定的で、差異をnondeterminism findingにする条件は、2026-09-29 decision 57行56が採択したHELIXOS-L2/L11-033に実質保持される。固定section SHAはL2 `580778c8ef3c0e4c4676d13de203c821f990893e9aa078d8d1d2f0b8901d2dbc`、L11 `1d30394888b3bded49f8e517d7e0888a25130e123df945adf69c7db5588571b1`で現行sectionと一致する。

ただし033の採択MPR source atom setはHIL-FR-25/26と補助HR/HAC/HAT-HIL-10の7 atomで、HIL-NFR-13 IR row 115を含まない。よって要求意味に重複候補は不要だが、NFR-13 formal successor/source bindingやholding解除は未記録として残す。

## HIL-NFR-14

旧条件は列挙されたIPC failure（不正JSON、schema不一致、oversize、sequence欠落、worker crash、timeout、cancel、backpressure、親process消失）ごとのfail-close、およびpartial resultの非正本化である。旧HR-FR-HIL-12/HAC-HIL-12a/b/c/HAT-HIL-12も、正常一回commit、異常terminal/partial zero、cancel/timeout late resultとdirect write拒否を補強する。

採択済みOS-L2/L11-018/019/020はassignment/attempt、停止、provenance/continuity、success/fail等の一般状態と回収を持つが、各旧failure classのpaired negative oracleを明記しない。採択済みOS-041は9/29 decision上、異なる旧IPC-R07 atom 2件を対象とする。NFR-14の採択根拠には使わない。

この限定不足を埋める未採択候補HELIXOS-L2/L11-125を追記した。候補は旧列挙failureとpartial非昇格の意味だけを保持し、transport、schema、provider、固定値は指定しない。HARNESS-L2-023採択済みの常時必須・特定操作時のみ・選択source依存・参照のみの四分類を使い、unknownをfalse/N/Aへ変換しない。対象source atomはIR HIL-NFR-14一件だけで、L1行はcorroboration、HR/HAC/HATはcontextである。候補の採否、正式後継、実装/実行/受入完了は主張しない。

## HIL-NFR-15

旧sourceは各CI段receiptを自身のcommit/tree digestと直前段receiptへ結び、別SHAのlineageなしgreenを再利用せず、quarantineをgreen件数へ含めない条件である。現行HARNESS-L2-005はticket/change/riskから検証義務とCIを動的に導き、固定段数を採らない。これは2026-09-24 PO判断と9/26 decisionの方向を反映し、9/28採択では現行のHARNESS L2/L11 001–009の基線として保持されるため、旧「3段」を固定構造として戻さない。

HARNESS-L2-022は段階ごとの証拠・状態遷移を定め、OS-L2-032の採択pairはquarantine eligibilityをtest/profile greenから分離する。旧の同一SHA/tree条件は対象revisionに束縛した証拠として現行dynamic modelと方向が合う。一方「各段が直前段receiptを参照する」一般chainは採択pairの独立したoracleとして明記されているとは確認できなかった。固定三段候補を作らず、この意味境界を親検収へ返す。formal successor/source retirementも割り当てない。

## 証拠・検証限界

JSONには各原文条件、exact target pair/decision/scope、補助consumer identity、raw byte hashes、candidate 125 pinsを記録した。section digestは見出しから次の同等以上の見出し直前まで、末尾空行を除きLF一つで終える方法で計算した。全値を再算し不一致0件。旧runtime/test/CIおよび現行runtimeは実行していない。

## NFR-14候補の判断材料と異常条件map

未採択候補HELIXOS-L2/L11-125は、HARNESS-L2-023の採択済み4区分を使う。L11には合成fixtureとしてdependency identity・宣言owner・contract version・compatibility range・明示根拠・区分・applicability、HARNESS-L2-010/011 revisionを与えた。常時必須、operation-only、selected-source、reference-onlyを分け、各実行依存の欠落を独立に検査する。明示reference-only資料のowner/version参照欠落はそのprovenance状態だけをunknownにし、実行closureを止めず実行依存へ昇格しない。分類自体がunknown/矛盾ならreference-onlyと断定せず分類を保留する。backpressureが起きた場合は結果断片の欠落観測にかかわらずfail-closeする。

旧L1行194の失敗classと旧consumer対応は、receiptの`source_condition_map`へ一つずつ記録した。不正JSON、schema不一致、oversize、sequence欠落、worker crash、timeout、cancel、backpressure、親process消失、およびpartial result非昇格それぞれが旧L1/IR identityとHR-FR-HIL-12/HAC-HIL-12a-c/HAT-HIL-12→HST-HIL-007へ結ばれ、L11-125の独立negativeへ対応する。原文physical line SHAは末尾LFを除く値と、末尾LFを含む値をJSONL source ledgerへ別に保管し、各方式を明記した。

PO判断材料は次の境界で提示する。**A（推奨）**：OS-125をOS result boundaryの忠実候補としてレビューし、HARNESS oracle所有は維持、formal source successor/retirementはcarry-forwardへ別記する。影響はOS-018/019/020とHARNESS-005/022の既存境界。**B**：候補採択を見送りNFR-14をpending保持。一般状態契約は残るが列挙negative保証が明示されない。**C**：HARNESSがinvalid/partialのoracle意味、OSが停止・未完状態を受け持つ分割候補を作り、全NFR-14条件をpair間relationで保持する。Cは要件意味や責務範囲を変える判断を含み、OS側候補単独採択では成立しない。候補起草とsource照合はこの判断待ちで停止しない。

candidate 125 canonical section SHA-256はL2 `fb8bdd8c3c105fc4151ee805e739c4df1e9932402818eec17266e323769c6595`、L11 `5d0b1f2263f8a8bc056dc46753671ceebec14e4fcb8f63d4b4c9b5835f7a46c3`。receiptとMPR-125-001へsection/fullfile/source ledger pinsを同期した。candidateは未採択・未実行。

## NFR-15 fixed-stage change source

旧3段を固定しない判断locatorを確認した。`concept-requirement-po-decisions-2026-09-24.md:108`（SHA-256 `a60e2c9c5b9d0828acdf4348e5cabbf7f3c032ec5d33b628f3d9e2bf305176de`）はHARNESS-L2-005を「導出と動的CIの形に直す。言語・toolに依存しない条件は保つ」と指示する。`harness-v-valley-process-po-decisions-2026-09-26.md:31`（SHA-256 `650264f78387d317eb5dec7a58c14197ac2c97ef712f05cd30ce5e11869cd5ea`）も動的CIを現L2-005と同方向とする。9/28 HARNESS decision（SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）はbaseline 001–009とpaired L11を採択維持し、022の明示候補はMPR row 51で採択する。f6固定対象とbca7592現行でL2-005/022とL11-005/022の各記録行SHAは一致する。従って3という物理段数は現行へコピーしない。

HARNESS-005の対象revision/evidence/oracle-bound CI、022の個別段階状態・証拠、OS-032のquarantine非greenは現行保持点である。ただし「次段receiptが直前receiptを参照する」という旧lineage conditionを、fixed-stage変更やCIの一般的revision bindingから推測で保持済みにしていない。これは原文conditionのsource-to-pair mapping residualとして返し、fixed three-stage candidateや実行gateは起こさない。
