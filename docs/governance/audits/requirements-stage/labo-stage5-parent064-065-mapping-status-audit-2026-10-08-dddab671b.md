# LABO064/065 限定意味監査

## 判定

LABO064は#2687に対応しない。A042にはCASE-22の「security failureを平均で相殺しない」否定oracleに対し、明示的な戻し先がないという歴史的Minorが記録されている。しかし固定L2-064:497-500/L11:237-239を照合すると、SF1はmissing/unknown/mismatchではなく既知のfailure結果であり、固定親は当該failureを別ownerへ返す義務を定めていない。必要な固定条件不明やidentity追跡不能については別の既存返却区分がある。現CASE-22はSF1不合格維持・平均相殺拒否・permit生成拒否を満たしているため、この戻し先の不記載を要件違反とは判定しない。A042のMinor記録自体は歴史的事実として保持し、根拠なしに返却先を追加しない。

LABO065ではA042が対象6文書とFV内の66行のCASE定義を読了し、「新たなfalse-successなし」と記録している。現行dddabのL3/L10対象sectionはA042対象revision 37a8283とバイト一致した。今回読んだ範囲に未解消の意味findingは見つからず、indexのPR mapping `unknown` は親固有repair PRが特定されていない状態として扱うのが適切である。これは他範囲・全consumerの完了を意味しない。

## 対象・根拠revision

- 現行本文: main `dddab671b034b866efeb56af8f6c0f192a06fe3f`。以下の本文はすべて当該commitの`git show`から読んだ。
- 元index: base `d629e25254a7c1d505543a0ce6ca3183c3fc4d67`、LABO064 `/parents/199`（MD 212行）、LABO065 `/parents/200`（MD 213行）。両行はA042を参照し、修正/repairは#2687と誤対応していた。
- 元監査A042: `docs/governance/audits/requirements-stage/l3-stage-274-semantic-audit-source-snapshots-d629e2525-2026-10-08/root-labo-stage5-semantic-audit-064-067-37a8283.json`、21,283 bytes、SHA-256 `a8cf94334c34f131a57aef98b1904222ddc9b4b633b800c542b3324415c2124c`。target `37a8283be429c57f3706153ad522e7ad288fecc3`。A042全体を読んだ。監査は指定scopeの静的読解で、CASE実行なし、全274親consumer-depth reviewではないと明記。
- PO adoption checkpoint: `633bf12ea8f948db8ba3d6600179c4a9507377a7`、`docs/governance/decisions/po-decision-2026-09-29-57candidates.md:79-80`。064は採択（registration `...064-002`）、065は条件付き採択D1（最初のAttempt結果、067と別指標、registration `...065-001`）。これはL2の候補本文revisionや今回のL3/L10を承認したという意味ではない。

## 固定L2/L11照合

| 親 | A042固定source / 行 | raw span SHA-256 | 固定内容と確認結果 |
|---|---|---|---|
| 064 | L2 `318ec4a04abb3c1cc17111b3d939f913facd5fd3`, `labo-requirements.md:491-501`; L11同revision `labo-acceptance.md:233-239` | L2 `e28da5b2f47c3d1327cc091003d14a7ab572a3282040b2ed7ec6614dae7079b8`; L11 `4f51be505b3c169f08aa61c2dd192b21b1b185db0f5243f556853bcb3e1a1fe3` | 選択された比較scopeに限る。record-side元identity/versionとjudge-visible資料を分け、blind条件を固定。漏洩、unknown/mismatch、smokeだけの適格性、失敗相殺を拒否し、元runと再評価義務を保持。比較時のOS assignment/SECURITY許可は入力でありLABOは許可・assignment・admissionを生成しない。元identity追跡不能は観測元、可視scope/固定条件不明はevaluation owner、再評価義務はtask/evaluation ownerへ返す。 |
| 065 | L2 `0dd946cec1c3fca8e144513b72e2e10d16c7c9c3`, `labo-requirements.md:503-516`; L11同revision `labo-acceptance.md:241-259` | L2 `6f50887b94a8d3341c55700393896798cc1273324a868071447bf0e5a95cf019`; L11 `c70905fd036f0c6e6bfdce0368e462cd85acd467354bcad599d1112634d9b1b6` | 選択資格scopeの8軸full-benchと通常task scorecardを区別し、first Attemptと後続retryを分離。未観測はunknown、適用外は理由付き、品質/security/scope失敗を費用・平均で相殺しない。059の品質gate/費用条件を保持し、LABOからruntime選択・実行・採否・authorityを生成しない。戻し先は固定L2:514のOS/観測source、HARNESS/要求owner、評価scope owner、LABO評価契約/source owner、decision ownerの既存区分。 |

064について、L3現行FR:1775はL2/L11固定commitを`0857205ecb7a18db9d8d926142e865776c1bf6e2`と記す。A042固定`318ec...`と当該commitを照合すると、L2/L11両ファイルのfull SHA・bytesおよび対象span SHAが一致する（それぞれL2 full `5d939d814f0aca2fa4bdde89f09c68428ef434e8c9b662f5bd3c546533897ae9`、L11 full `30de41e2361405f3598e3ee511bfec1b51e47514af4de3e6c480c2a068073de0`）。したがってlocator revision名は違うが本文pinは同一で、意味差ではない。065のFR:1753は固定0dd946を直接pinし、A042と一致する。

## 現行L3/L10の読解範囲

対象6文書はBR/FR/NFR/BV/FV/NFRV。現行main dddabの全文SHAと、親固有span SHAは次の通り。BR/FR/NFR/BV/NFRVは対象spanの行を読んだ。FVの親sectionはA042の37a対象sectionと全バイト一致することを再計算し、A042がその全CASE定義を読了した記録を現行本文へ適用した。section hashはheadingから次親heading直前までのraw UTF-8/LF。

|文書|現行全blob SHA-256|064 locator / raw span SHA-256|065 locator / raw span SHA-256|
|---|---|---|---|
|BR `docs/helix-labo/L3-requirements/business-requirements.md`|`9f56b674f11f9b666bc546a20e7a7492d1dfe377a24495d351392698c8389777`|119-127 `b3b4542b2e15daa737b4397917af08ebdc1b1802785e6873158f6756a8ed9a6c`|105-117 `0c1079b7dd6369182721ac2c1c062ca45c1928a1531c8575ed121c67f6481939`|
|FR `docs/helix-labo/L3-requirements/functional-requirements.md`|`0e33a04d53bc296292ba7fb510d91d89f410896a99118ccda2b92c03aa09ef94`|1773-1814 `0369d96b07cf0d8e58269550f6136dfd043eacb2fb9015763d2d096791da325c`|1751-1771 `f490ffbecfdf5e5f7446d29b6c1490d1c1cec0628035ebef056d66d75d32683b`|
|NFR `docs/helix-labo/L3-requirements/nfr-grade.md`|`d66f37a55ba040e0701e6e1313cfe1bca6ae1d0cb9392d584023c4053793e45d`|224-234 `93c8ef51bd7c3ccd5d8751653159493313bb8b93625ad8d3373505558281fd7f`|206-221 `3dd8d07b22f62b0439e300efa777533bb89dfdddb122f8e926450ea45f7cd178`|
|BV `docs/helix-labo/L10-verification/business-verification.md`|`5733fe88329629f5dce896c2f8b420cee895b4f796632d13addf2bc8568c5b94`|115-123 `34d13ca2b4d60060bf03413ee894f95d4bdf3973d9c17305be53268032b3ff9c`|105-111 `62f8c46a51fe5342a8680d53cde9ab7efacf54715670cf733efdf0e95c016a41`|
|FV `docs/helix-labo/L10-verification/functional-verification.md`|`3f443a3713831920b2333a950a2b7ebbd99b8287775dd0ed5e3f8dc29296a200`|3120-3179, 49 CASE rows, `783be2865ed275341263e1c3a12409d8444698f16056e09db88db2b8ccc3e268`|3028-3119, 66 CASE rows, `82ec9a417d7b5e5eedc21e68ed4e72ec41d2bb3aee0a7868de5fd10d1b7864ac`|
|NFRV `docs/helix-labo/L10-verification/nfr-verification.md`|`02849ed4493af37c40e9a9fb0fde813fde1703ce2932bac982c76c461ac9edf3`|169-175 `b8751ec3fec698a7e261dc76b2964bc889fe166b59b56134b2f1721e00c4df2b`|154-166 `8a3b5181905a4e91cda009e37b9b74c2c937566d4e84e1efefbedd38add34dc2`|

L3/BR/BVは、065を独自business outcome/KPIとして追加せず、選択scopeの証拠受渡し、first Attempt/retry、fee/quality、decision-state分離だけを確認する（BR 105-117、BV 105-111）。064は比較材料とscope/return obligationsを確認し、KPI・成功率・閾値を増やさない（BR 119-127、BV 115-123）。L3 FRは065のAC01正常/AC02未見正常/AC03否定・保留（1765-1767）、064のAC01正常/AC02未見正常/AC03の漏洩・条件不成立・証拠相殺・権限境界（1787-1799）を固定要件に結ぶ。NFR/NFRVは新しいSLO/sample数/閾値/率を作らず、未実測、unknown、分母0/不明を分離する。

A042のFV読了範囲を現在の正確なFV sectionで再検算した。065 sectionは`### L10-LABO-065`から064見出し直前、92行・66 CASE rows・SHA `82ec9a417d7b5e5eedc21e68ed4e72ec41d2bb3aee0a7868de5fd10d1b7864ac`。064 sectionは064見出しから067見出し直前、60行・49 CASE rows・SHA `783be2865ed275341263e1c3a12409d8444698f16056e09db88db2b8ccc3e268`。各sectionは37a8283の同sectionと完全一致。ID数は独立fixture/negative数・意味完全性を示すものではない。

### 064の過去Minorの固定親再評価

A042 `review_results.064`は「新しいfalse-successなし」とする一方、「歴史的残余CASE-22は明示的戻し先がないが、既存残余として保持しblockerへ昇格しない」と記録する。現行FV `functional-verification.md:3140` CASE-22はsecurity failure `SF1`を高score平均で相殺しない誤出力を拒否し、evaluation resultから許可を作らないが、当該SF1の戻し先を記さない。固定L2:497-500はsecurity failureを相殺せず、OS assignment/SECURITY許可を比較runの入力とし、可視scope/固定条件不明をevaluation owner、再評価義務をtask/evaluation ownerへ返すが、CASE-22の有効なsecurity failure固有の返却先を割り当てない。固定L11:237-239も失敗相殺拒否と再評価を示すがownerを追加しない。旧HIL-NFR-35:215とBench R04/R08:96-120,143-147はblind/reproducibility/no averagingを根拠づけるが、当該return ownerを定めない。

以上から、A042で記録されたものは未返却の履歴上のMinorであり、今回固定L2/L11と原文対比した結果、当該CASEの誤成功や固定要件違反を示すものではない。security failureのreturn ownerを要求として足す根拠はないため、修正を提案しない。PR対応mappingが不明な事実は別軸で残す。

### 065に関する結論

A042 `review_results.065`はfirst-Attempt指標と067のfirst-eligible/same-Attempt repair roundの分離、8軸full-bench、scorecard、unknown、cost/quality separation、permission/admission境界を6文書と66 CASE definitionsで照合し、新false-successなしと記録する。現行scopeの全バイト一致を確認し、固定L2/L11:505-514/247-259およびPO checkpoint row80のD1に照らしても、FR-065-01..07/ACとL10 oracleが同じ境界を維持する。BV行105-111はevidence handoffのBusiness確認で、BR:107-115が明示する通り独立business outcomeや新しいdecisionを作らない。現監査範囲では修正候補なし。これは外部PR mappingが存在するとの主張ではない。

## 旧source起点

A042が示す資産と対応箇所を実読した。旧ファイルは閲覧のみで、実行していない。

| asset | 旧source / locator | full file SHA-256 | 読み取った保持点・限界 |
|---|---|---|---|
| `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:151-152,215` | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | HIL-FR-61/62のsmoke/full bench、同条件8軸、first_pass/retry/cost/qualityの証拠をowner decision材料として渡す。HIL-NFR-35のblind/reproducibility/相殺禁止。旧admissionやdecision authorityは移植しない。 |
| `LEGACY-ASSET-28FB139B26CD61CC51EE` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:96-120,143-147` | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | R04はtask snapshot/fixture/requirement/acceptance/hidden oracle/toolchain等の再現証拠、R08はscorer/task/fixture/oracle/protocol version/digest保持、authorとblind judge分離、hidden oracleをworker contextへ渡さないこと、過去結果を異なるversionの現性能へ流用しないこと。特定failure-return ownerは定めない。 |

064 L2:501と065 L2:507,509-516に対応・保持/再導出・旧admission/固定schemaの置換範囲が記され、current FRも旧assetを開示して境界を同期している。旧sourceは現在の権限付与や実運用を許可しない。

## 限界

- 064/065の指定L2/L11、A042の該当親評価、現行6文書の該当sectionとCASEの静的照合だけを実施した。FV sectionはA042が読了した37a版から現行dddabまでバイト一致することを確認した。
- fixture/CASEは実行していない。runtime/旧CLI/old test/CIも起動していない。
- 274親全体、他のLABO親、全source consumer、独立review、現在の委任approval/admissionは調べていない。
- CASE22の既知残余は修正・解決されていないものとして保持する。未返却minorをblockerへ格上げしない。
