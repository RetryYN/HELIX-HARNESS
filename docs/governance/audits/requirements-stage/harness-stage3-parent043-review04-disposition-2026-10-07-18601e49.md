# HARNESS-043 review04 post-body時点監査

PR #2642、branch `l3-harness-stage3-parent043`、base `ceda1c53b53c53fffb8c23f394add1f2b809deb1`、body commit `18601e49531cdd023f3753ac733c360a7f886475`。integration checkpointと作成候補を照合した。

## 六文書 full/prefix/suffix pins

| 文書 | full SHA / bytes | base prefix SHA / bytes | Stage3 suffix SHA / bytes | LF full/prefix/suffix |
|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `81e1e6417588198fb45e8d9c6ca9bcc3bf02f73f7fc85670d79ebeb62b4d2b18` / 211758 | `8d47c5a4f9d0288659787908a950af50306d9b0175601d650df8d12758a28d32` / 204920 | `29c8396ee0a2b33316dba4a1572c5cce0722db7a4705acdc2b49303338e48f20` / 6838 | 743/721/22 |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `76d0608a75c0b92dfa4802d3903e1057f83cde6308a47e79255d840b3a92592d` / 13523 | `9b58128dca12c6887513b9e1c1f62fb84bb320ce0a76eb407a4015a72111840d` / 13241 | `445d876bca15e7ae01c444eeffe6ea19f2ed9c6dc2f1031b61ca976d7bd36c33` / 282 | 133/128/5 |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `ecebd6f33a2c9a7c50079bd6f0018124c1ea3bb0f536ace87a4a7ba3a3e5c061` / 43350 | `02e62e3f9ca21103a4d450b98bcd21b84c38a667cb6ee43eaa0d9feba66fdd13` / 42917 | `0b2f725ceaa2f70d89d752283a01d08255681c3acb1100919b96edb2239bb923` / 433 | 199/194/5 |
| `docs/helix-harness/L10-verification/functional-verification.md` | `e521300610e5a4db96fe8ebcf6474abd99a8f3d481a2e5d78cc1d2a3549ad7df` / 662650 | `fb6582cf59fdec3df8c15c90a4fd583d373749a41a8d6e4a1eddbed8b26e9a70` / 636567 | `2dffe9b442495945840379081f72a6b7301234b1b6c330557fe31cdf35c29b8f` / 26083 | 1691/1638/53 |
| `docs/helix-harness/L10-verification/business-verification.md` | `51a4cbd6825a72cafbbdf50a487445bb3373e6c2d8199094f645d139a8e2355f` / 9052 | `eee12ec7f8c0f0299275eecde34973fe1080c047d72347367513b81aec3545d2` / 8820 | `6c7ea10edc1f86139eabd77880b2d49cd8a860a5613defb2e5efe67e388e7ca4` / 232 | 94/89/5 |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `6e5b9afef8ed3f5be83f8dd3a77e58fe0a19209c54d104fcb4222b885a56a14d` / 36856 | `a2f72341a0a30b071e16bf9b727f0a9ffb38b0a84d1938af4246e541262ee331` / 36465 | `66ef1f58bd31bc22bffe0494adaec039afb94af81e5cab46cd480ea15831907e` / 391 | 179/174/5 |

六文書のfull SHA/bytesはcheckpoint pinと一致。各文書のprefixはbase全文＋separator LFと一致。prefix/suffixのCRは0、suffixはLFで終わる。全suffixはv2候補のafter本文とbyte一致する。詳細な各prefix hashとLF数はJSONに保存した。

## Root統合差分・candidate metadata

checkpointの`root_extra`はnullで、六本文へのRoot補正はない。v2 JSON自体にはmetadata誤記があり、`new_single_mutation_fixtures`が既存のacceptance/no-cartesian IDを指していた。六本文にはr21 missing/TBDの2行が実在するため、誤記を原本に残したまま訂正版sidecarを追加した。

元candidate SHA `d7926e6f83467fa7766bcab3a6d52c4b6127995f2e27b056aa9f5bd0d9b1bf06`。訂正版JSON sidecar SHA `139a2fad85a6d7fb91b41d5817dec3d58f0943842b458608231370d40e3eb009`、説明MD SHA `44fb76502d056f6ae25f4c19a72b2ab4ede0980519ee1037c9ede20766d84013`。sidecarはmetadata一項のみを補い、本文のsix before/afterは変更しない。

## 固定親・旧source・review履歴

固定L2-043 (`318ec4a04abb3c1cc17111b3d939f913facd5fd3`, lines 986–1000) span SHA `da678d9181ebe76ae93084c27744d253c617ebe03b709d79f55b79d2abbc6666`。L11-043 lines 723–733 span SHA `583bfaf669729d3148e072be3ca74f1ef125997e933f6a1a94f08c732cb6f4b4`。採択PO/旧source pinsはJSONにraw収録。旧HIL-FR-55および旧28 raw CASEのSHA照合は全件pass。formal review全8コメントrawはJSONに保存し、review04 R1–R17、Fable承認後のOpus反対を含む。

## FV inventoryと限界

FV tableは47行、47 unique ID、全行6列。既存45 IDを保持し、新規r21 missing/TBDの2行を同一table内に追加した。fixture実行・独立review・承認は未実施。47件は意味完全性の証拠ではない。

## 六文書のactual Stage3本文

### `docs/helix-harness/L3-requirements/functional-requirements.md`

SHA `29c8396ee0a2b33316dba4a1572c5cce0722db7a4705acdc2b49303338e48f20`; 6838 bytes.

```markdown
## Stage 3 親043の機能要件候補

### FR-HARNESS-L3-043 — active templateのrule／branch別例coverage

**authorityと範囲**：HARNESS-L2-043はPO decision `MPR-RC-HARNESS-L2-043-002`で条件付き採択されたBルート、所属HARNESS-COREである。L2本文と旧source checkpointに残る「配置はPO未決」の記述は当時のcandidate metadataとして保持し、現在のauthorityはPO decision行から読む。親L1はHARNESS-L1-001/004/009、version_targetはL2-043の1.0を保持する。本L3本文はその固定scopeを具体化する候補で、L3承認前である。POの採択を再生成・拡張しない。

**由来と処置**：旧HIL-FR-55（Template Example Calibrator）、旧L3 HR-FR-HIL-20/HAC-HIL-20a/b/c、およびHAT-HIL-20/HOT-HIL-50を起点とする。保持する意味は選択されたactive templateに適用される各validation rule/applicability branchへcanonical positiveとboundary negativeを結び、対象scopeのrisk分析で未被覆と示された状態遷移、failure、security、migration、multi-runtime差異などに限り追加例を求め、件数のみで十分性を判定しないこと。名前や旧IDが同じだけでは同じ意味とせず、旧28 CASEの原文/raw digestを監査source inventoryへ残し、内容oracleを固定親の意味へ再導出する。旧schema/runtime/workflow/実装経路は移植しない。

**責務境界**：043は選択されたtemplate/scope/revisionに適用されるrule/branchの例coverageを評価し、全組合せの作成や検証の実行をしない。HARNESS-L2-009がactive template選択と適用条件を所有し、HARNESS-L2-041がそのtemplate要素の抽出・source span・gapを所有する。HARNESS-L2-004が要求・設計・検証のtrace、risk/oracle条件を所有する。HARNESS-L2-026は要求からunitの具体設計と対のverification designを、HARNESS-L2-025はcomposite design/oracleを構成・検査する。043はそれらの代替にならず、025/026のcompletion receiptを一律に開始前提としても要求しない。OSが検証を実行・保存する。

**入力と出力**：対象revision/scope、L2-009で選択されたactive template identity/revision/applicability、各validation rule/applicability branchの識別可能な内容、および適用oracleをL2-004の検証義務へ結ぶ。識別可能なrule/branch内容は独立した入力であり、041 atomを入力元に選択しないscopeでも、rule/branchの内容、適用条件、oracleを照合できれば評価対象とする。041 atomを入力元に選択する場合だけ、そのtemplate/source revisionと抽出scope、該当atom/source spanを追加入力にする。追加risk例を評価する操作だけで、その対象scopeのrisk根拠と未被覆領域も入力する。出力は同じscope/revision限定のadequacy matrixで、分母は選択scopeに適用されるrule/branch。各rule/branchにcanonical positiveとboundary negativeを最低一例ずつ対応させ、同じscope/revisionの重複・冗長性findingをmatrixへ結ぶ。追加risk例は対象scopeのrisk分析で未被覆と根拠付きで示された領域（状態遷移、failure、security、migration、multi-runtime差異等）に限る。rule×branch×riskや他の全factorのCartesian productを要求しない。未選択template、未選択scope、未選択riskは未観測のままとする。

**受入基準**：

- **AC-HARNESS-L3-043-01**：選択scope内の各適用rule/branchにpositiveとboundary-negativeを結び、例の条件・期待結果・既存oracle・source provenanceを追跡する。例数だけで十分性を主張しない。同scopeの証拠により確立済みの重複・冗長性findingを出力し、その確立済み所見が欠ければcoverage所見は未完とする。
- **AC-HARNESS-L3-043-02**：applicability/denominator、識別可能なrule/branch内容、選択した場合の041 atom、risk basis、oracleを別根拠として照合する。041 atomを入力元に選んでいない場合、そのatomの不在だけをgapや未評価理由にしない。unknown/conflict/stale/TBD/根拠なしN/Aは推測で埋めず未評価とする。選択template/applicabilityの不足はL2-009/対象template ownerへ、rule/branchの識別可能な内容または抽出済みatom/source spanの欠落・TBDは入力元の選択にかかわらず、その内容を供給する既存sourceの041相当の抽出契約ownerへ、要求/risk/oracleの不足はL2-004と固定sourceが示す該当ownerへ原因別に返す。個別owner identityが不明な場合はidentity unknownを別に保持し、既知の責務区分を消さない。
- **AC-HARNESS-L3-043-03**：coverage結果は選択されたtemplate/revision/scopeに限る。未選択template/scope/revisionへ外挿せず、固定oracleに適合する未見例は未見だけを理由に拒否しない。
- **AC-HARNESS-L3-043-04**：追加risk例は対象scopeのrisk分析で未被覆と根拠付きで示された領域（状態遷移、failure、security、migration、multi-runtime差異等）に限定する。risk分析で未被覆とされた領域に追加例がない場合はcoverage未完とする。その例を評価する操作でrisk根拠または未被覆領域が欠ける場合は補完せずHARNESS-L2-004と根拠sourceが示す該当ownerへ返す。043のmatrixは要求合意、L2採択、L3承認、設計成立、実装、OS実行、利用者受入を生成せず、L2-025/026の成果も代替しない。

**原因別戻し先**：template sourceの選択、active revision、適用条件の不足はHARNESS-L2-009/対象template ownerへ返す。適用rule/branchの識別可能な内容、または選択した041 atom/source spanの抽出が欠落・TBDなら、041入力を選択したかにかかわらず、そのrule/branch内容を供給する既存sourceの041相当の抽出契約ownerへ返す。041 atomが非選択というだけでは抽出gapにしない。個別owner identityが不明ならidentity unknownを別に保持し、抽出契約ownerという既知責務区分は維持する。requirement relation、risk根拠、expected result/oracle bindingまたは検証義務の不足はHARNESS-L2-004と固定sourceが示す該当ownerへ返す。これらを一つのprofile前提やgeneric ownerへ束ねず、025/026を043評価の一般開始条件や代替outputにしない。

**authority出力境界**：実際のB-route/CORE PO採択はdecision rowで既に固定される。043 candidateやmatrixからその採択を作り直さない。また要求合意、L3承認、設計成立、実装完了、OS実行完了、利用者受入成功を個別に生成しない。matrixは内容上のcoverage候補だけを示す。

```

### `docs/helix-harness/L3-requirements/business-requirements.md`

SHA `445d876bca15e7ae01c444eeffe6ea19f2ed9c6dc2f1031b61ca976d7bd36c33`; 282 bytes.

```markdown
## Stage 3 親043の業務要件

| L2親 | business requirement | 理由 |
|---|---|---|
| `HARNESS-L2-043` | 独立したbusiness requirementを導出しない | 例coverageは選択scopeのverification adequacyであり、別の事業成果や価値閾値を追加しない。 |

```

### `docs/helix-harness/L3-requirements/nfr-grade.md`

SHA `0b2f725ceaa2f70d89d752283a01d08255681c3acb1100919b96edb2239bb923`; 433 bytes.

```markdown
## Stage 3 親043の非機能候補

| NFR候補 / L2親 | 候補値 | 固定根拠 | 限界 |
|---|---|---|---|
| `HARNESS-L2-043` | 独立した数値NFRを導出しない | 固定L2-043はrule/branch/risk coverageを意味で判定し、正例・境界負例を各適用rule/branchに対応させる。 | case数の総量、coverage率の新閾値、全組合せ数を追加しない。未選択scopeを分母に加えない。 |

```

### `docs/helix-harness/L10-verification/functional-verification.md`

SHA `2dffe9b442495945840379081f72a6b7301234b1b6c330557fe31cdf35c29b8f`; 26083 bytes.

```markdown
## Stage 3 親043の機能検証候補

**内容oracle候補・未実行**：旧28定義IDはsource inventoryに全literal/raw SHAで保持し、current rowsでは六列へ正規化して意味を再導出する。indexは独立fixtureとして数えない。追加risk例は対象scopeのrisk分析で未被覆と示された場合だけ扱う。risk根拠はその評価operation時の入力とし、profile選択を追加条件にしない。全組合せ要求を導入しない。authority拒否fixtureは固定L2/L11の境界に限定し、既存PO adoptionを変更しない。

| CASE ID | FR ID | AC ID | baseline | mutation | oracle / route |
|---|---|---|---|---|---|
| `CASE-HARNESS-L10-043-01` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | 索引行のみ：選択scope、active templateのrevision/applicability、適用rule/branchの分母とoracleを参照する。risk追加例を扱う場合はそのscopeのrisk根拠も参照する。 | 変異なし。列挙された子CASEを個別に解決する。索引はrule/branch、risk要因、分母へ加えるfixtureを増やさない。 | 列挙された子CASEだけを評価する。この索引を独立した証拠や全組合せの要求として扱わない。 |
| `CASE-HARNESS-L10-043-02` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 索引行のみ：選択scope、active templateのrevision/applicability、適用rule/branchの分母とoracleを参照する。risk追加例を扱う場合はそのscopeのrisk根拠も参照する。 | 変異なし。列挙された子CASEを個別に解決する。索引はrule/branch、risk要因、分母へ加えるfixtureを増やさない。 | 列挙された子CASEだけを評価する。この索引を独立した証拠や全組合せの要求として扱わない。 |
| `CASE-HARNESS-L10-043-03` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-03` | 索引行のみ：選択scope、active templateのrevision/applicability、適用rule/branchの分母とoracleを参照する。risk追加例を扱う場合はそのscopeのrisk根拠も参照する。 | 変異なし。列挙された子CASEを個別に解決する。索引はrule/branch、risk要因、分母へ加えるfixtureを増やさない。 | 列挙された子CASEだけを評価する。この索引を独立した証拠や全組合せの要求として扱わない。 |
| `CASE-HARNESS-L10-043-04` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | 新active revisionの選択scopeと適用性はcurrent。rule/branch内容は独立した入力sourceで識別でき、041 atomは選択されていない。新revisionで加わるbranch内容・oracleも入力に含まれ、POのB/CORE配置は外部判断として固定される。 | 043のadequacy matrix denominatorだけから当該branchを除外し、ほかの入力・例・oracle・PO状態は変えない。 | 新revisionの識別可能なbranchを分母から落とした出力を拒否し、matrixをその入力に一致させる。選択/適用入力の不足だけがあればL2-009へ返す。041 atomを選択した入力でそのatom/source spanが欠ける場合だけ041抽出gapへ返す。このCASEでは041を選択していないため041不在をgapにしない。ほかのscopeは未観測のまま保つ。 |
| `CASE-HARNESS-L10-043-05` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | 同scope/revisionのL2-009 template source選択・適用性、L2-041抽出rule/branch identity/source span、L2-004適用oracle/検証義務はcurrent。ほかの正例とbranchは適合している。 | 正例一つだけを、そのrule条件を満たさない例へ置き換える。 | rule条件を満たさない例を正例として受け入れず、当該正例coverageを不合格・未完とする。source/template applicabilityはbaselineで固定済みなので変えず、正例期待結果/oracleの不一致だけをHARNESS-L2-004と固定sourceが示す該当oracle ownerへ返す。 |
| `CASE-HARNESS-L10-043-06` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | 選択scopeのrisk分析根拠が、coverage未被覆のrisk領域を一つ特定している。対象rule/branch、oracle、scope/revisionはcurrent。 | その特定riskに対する例だけを除く。 | 当該risk領域の追加例だけを除き、risk coverageを未完のままにする。risk根拠/oracleの不足はHARNESS-L2-004と固定sourceが示す該当risk/oracle ownerへ返す。 |
| `CASE-HARNESS-L10-043-07` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | 選択scope内で、証拠に基づく重複/冗長性の所見だけがmatrixに記録されている。 | 確立済みの重複/冗長性の所見だけを削除する。 | coverage所見を未完とする。全組合せを推測で追加したり、既存ownerの判断なしに義務を削除したりしない。 |
| `CASE-HARNESS-L10-043-r02-negative-not-boundary` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | 適用rule/branch、正例、境界を試す負例、および必要なrisk理由を対応付ける。 | 負例だけを、ruleの境界を試さない入力へ置き換える。件数とrevisionは変えない。 | coverage成立とせず、例に適用するoracle/risk根拠の不足はHARNESS-L2-004/該当ownerへ戻す。抽出rule gapやtemplate適用性とは混同しない。 |
| `CASE-HARNESS-L10-043-r03-other-revision-unseen` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | 選択rule/branch revision内で、正例と境界負例を対応付ける。 | 適合結果だけを未見の別revisionへ外挿する。 | 別revisionへの外挿を拒否し、新revisionの選択scope/適用分母を再照合する。入力revision/適用性の不足はL2-009へ、抽出ruleの不足はL2-041へ戻す。 |
| `CASE-HARNESS-L10-043-r04-oracle-unbound` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | 期待結果が適用oracleへ結ばれたbranch例。 | 期待結果とoracleのbindingだけ切断。 | coverage成立とせず、例の適用oracle/risk根拠不足はHARNESS-L2-004/該当ownerへ戻す。抽出rule gapやtemplate applicabilityとは混同しない。 |
| `CASE-HARNESS-L10-043-r04-count-only-sufficiency` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | branch/ruleごとに正例と境界負例を対応付ける。 | 例の件数だけを根拠に十分と主張する。 | 件数だけの主張を拒否し、oracle境界の確認を未完とする。 |
| `CASE-HARNESS-L10-043-r04-rule-branch-conflict` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | L2-009のtemplate適用性はcurrent。識別可能なrule/branch内容を選択したsourceから直接入力し、L2-041 atomは選択しない。oracle/risk入力はcurrent。 | 直接入力されたrule/branch適用内容だけをconflictにする。 | 分母を確定せずunknown/未評価とし、選択templateのrule/branch適用内容の矛盾をHARNESS-L2-009/対象template ownerの既存責務区分へ返す。正常なoracle/risk入力へ不足責務を移さず、個体identity不明は別unknownとして保持する。041 atomを選択していないため、041の抽出gapへ変換しない。 |
| `CASE-HARNESS-L10-043-r04-extracted-rule-missing` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | このscopeはL2-041 atom/source spanを入力元に選択し、選択template/applicabilityはcurrent。ほかの抽出rule/branch、oracle、risk入力もcurrent。 | 選択されたL2-041の抽出rule/branch atom/source spanだけを欠落させる。 | extracted rule/branch atom gapを保持しHARNESS-L2-041の抽出契約ownerへ返す。041が選択入力であるこのCASEに限る。L2-009の選択/適用不足やL2-004のoracle/risk不足へ読み替えない。 |
| `CASE-HARNESS-L10-043-r04-applicability-unknown` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 選択template/sourceと適用rule/branchの識別可能な内容、oracle、risk根拠はcurrent。041 atomは入力元に選択されていない。 | L2-009のtemplate applicabilityだけをunknownにする。 | 分母を確定せずunknown/未評価とし、選択template/revision/applicability不足だけをHARNESS-L2-009/対象template ownerへ返す。041 atom不在をgapにしない。 |
| `CASE-HARNESS-L10-043-r04-risk-rationale-missing` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 同じ選択適用範囲における有効な規則/分岐、oracle、risk根拠は現行である。 | risk rationaleだけを欠落させる。 | risk coverageをunknown/未評価とする。risk/oracle根拠の不足はHARNESS-L2-004および該当risk-oracle source ownerへ戻し、template適用性/extracted-ruleの不足とは分ける。 |
| `CASE-HARNESS-L10-043-r04-active-revision-stale` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | L2-009が選択したtemplate identity/revision/applicabilityと、独立入力のrule/branch source revision・oracle・scopeはcurrent。041 atomは選択されていない。 | L2-009 active template revisionだけをstaleにする。 | 分母を確定せずunknown/未評価とし、active template revisionの不整合をHARNESS-L2-009/対象template ownerへ返す。041 atomを選択していないため041へ戻さない。 |
| `CASE-HARNESS-L10-043-r05-unselected-template-extrapolation` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-03` | 選択template/scope内のrule/branch、oracle、適用根拠はcurrentである。 | 選択templateのcoverage結果だけを未選択templateへ外挿する。 | 外挿を拒否し、未選択templateは未観測のまま保つ。選択/適用性の責務はHARNESS-L2-009/対象template ownerに戻す。 |
| `CASE-HARNESS-L10-043-r05-other-scope-extrapolation` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-03` | 同じrevision内の選択scopeだけで、正例/境界負例をoracleへ結び付ける。 | 選択scopeの結果だけを別scopeへ外挿する。 | 外挿を拒否し、別scopeを未評価のまま保つ。対応する固定親にscope ownerが明示されない場合はunknownを保持し、ownerを推測しない。 |
| `CASE-HARNESS-L10-043-r05-unseen-oracle-valid-rejected` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-03` | 選択template/scope内の未見正常例が、既存の適用oracle/fixtureに適合している。 | ほかの条件を保ち、「未見である」という理由だけで正常例を拒否する。 | 既存の適用oracleに適合する未見例を受け入れる。「未見」という理由だけでは拒否しない。 |
| `CASE-HARNESS-L10-043-r06-na-without-basis` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | L2-009が選択したtemplate/source、適用範囲・applicabilityはcurrent。L2-041抽出rule/branchとL2-004 oracle/risk traceもcurrentで、N/A claimだけに適用根拠のsource inputが付いている。 | N/A根拠だけを除去する。 | N/A claimを根拠付きとして受け入れずunknown/未評価にする。欠落したのは適用範囲/N/Aのsource inputだけなのでHARNESS-L2-009/その選択templateまたはscope source ownerだけへ返す。rule extractionとrisk/oracle入力は再routingしない。 |
| `CASE-HARNESS-L10-043-r06-tbd-unfilled` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 選択template/source inputと適用性（L2-009）はcurrent。rule/branch identity/source span（L2-041）は固定されるが、対象の抽出rule valueだけが既存`TBD`。risk/oracle/検証義務（L2-004）はcurrent。 | その出力fieldの既存`TBD`だけを、根拠のない推測値へ置き換えて補完済みとして出力する。ほかの入力と出力は変えない。 | TBDを推測値で置換せずunknown/未評価のまま保つ。欠けているのは抽出rule value/source evidenceだけなのでHARNESS-L2-041の抽出契約ownerだけへ返す。L2-009の適用性とL2-004のoracle/riskを再routingしない。 |
| `CASE-HARNESS-L10-043-r06-new-revision-missing` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 適用branchのcurrent revisionとscope、oracleは固定されている。 | 適用branchのcurrent revision identityだけを欠落させる。ほかの条件は保持する。 | 分母を確定せずunknown/未評価とする。選択template/revision/適用性の不足はHARNESS-L2-009/対象template ownerへ戻し、抽出済みrule/branchのgapだけをHARNESS-L2-041へ戻す。 |
| `CASE-HARNESS-L10-043-r06-risk-basis-conflict` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 選択risk根拠とsource revisionが一致している。 | risk根拠だけを相互に矛盾させる。 | risk coverageをunknown/未評価とする。risk/oracle根拠の不足はHARNESS-L2-004と該当risk-oracle source ownerへ戻し、template適用性/extracted-ruleの不足とは分ける。 |
| `CASE-HARNESS-L10-043-r06-risk-basis-stale` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 選択risk根拠が同じcurrent source revisionに結び付いている。 | risk根拠のrevisionだけをstaleにする。 | risk coverageをunknown/未評価とする。risk/oracle根拠の不足はHARNESS-L2-004と該当risk-oracle source ownerへ戻し、template適用性/extracted-ruleの不足とは分ける。 |
| `CASE-HARNESS-L10-043-r06-active-revision-missing` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 選択scopeのactive source/rule revisionとoracleはcurrentである。 | active revisionだけを欠落させる。 | 分母を確定せずunknown/未評価とする。選択template/revision/適用性の不足はHARNESS-L2-009/対象template ownerへ戻し、抽出済みrule/branchのgapだけをHARNESS-L2-041へ戻す。 |
| `CASE-HARNESS-L10-043-r09-001` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | active rule/branchの正しい条件、boundary oracle、負例を固定する。 | canonical positive exampleだけを削除する。 | 正例coverageを未完とする。固定L2:995/L11:733に沿って、正例oracle/検証義務の不足としてHARNESS-L2-004および該当既存ownerへ戻す。正常に固定したtemplate/rule抽出へ返却しない。 |
| `CASE-HARNESS-L10-043-r09-002` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | 有効な規則/分岐の正しい条件、正例、負例oracleを固定する。 | boundary-negative exampleだけを削除する。 | 境界coverageを未完とする。oracle不足は固定L2:995/L11:733に沿ってHARNESS-L2-004と該当既存ownerへ戻す。 |
| `CASE-HARNESS-L10-043-r09-003` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | active templateの適用性と適用branchの集合が確定し、source rule/branchの入力、oracle、ほかのbranchと例はcurrent。041の入力元選択有無にかかわらず、その選択した入力契約は充足している。 | 適用branchの一つだけを分母から除外する。 | 出力分母の隠蔽を拒否しcoverageを未完とする。正常入力に対する043自身のmatrix出力誤りとして当該処理を訂正する。入力元の041/009へ不足責務を転嫁しない。 |
| `CASE-HARNESS-L10-043-r10-valid-selected-profile-no-mutation` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | 選択scopeとL2-009 template applicabilityはcurrent。このfixtureではL2-041 atom/source spanを入力元に選び、各抽出rule/branchが利用可能。各branchに対応するcanonical正例・境界負例とoracleがあり、期待結果はsource/oracleと一致する。 | 変異なし。選択済み041 source、分母、scope内証拠をそのまま適用する。 | 選択された041 atomとoracleに整合する有効coverageを受け入れ、無関係な組合せや未選択scopeを要求しない。実行や下流受入を意味しない。 |
| `CASE-HARNESS-L10-043-r20-independent-rule-branch-input-normal` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | 041 atomを入力元に選択せず、独立source `SRC-RULE-01@rev-A`から識別可能なrule `R-A`・branch `B-A`・適用条件を入力する。L2-009 template/applicability、oracle `O-A@rev-A`、scope/revisionはcurrent。正例`E+`はR-Aを満たし期待accept、境界負例`E-`はO-Aで期待reject。matrixのrule/branch/source/oracle/expected-result各fieldはすべて入力・oracleと一致する。 | 変異なし。041 atomを使わず独立rule/branch内容で評価する正常fixture候補。 | R-A/B-Aの識別可能内容とsource/oracleに整合する正常例coverageを受け入れる。041 atomの不在だけで拒否・unknownにしない。例を他scopeへ外挿せず、実測や実装動作を主張しない。 |
| `CASE-HARNESS-L10-043-r20-independent-rule-branch-output-mismatch` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | CASE-HARNESS-L10-043-r20-independent-rule-branch-input-normalと同じ041非選択のsource/rule/branch/scope/oracle/例入力を使う。正常matrixはrule ref R-A、branch ref B-A、oracle O-A、E+ accept、E- rejectへ一致する。 | すべての入力・ほかのoutput fieldを固定し、matrixのpositive-example rule reference一fieldだけをR-Bへ誤結合する。 | source/oracleと一致しないmatrix outputを拒否し、そのreference誤りを043候補出力処理内で訂正する。正常入力側を041抽出gapやsource owner不足へ返さない。coverage closureは誤出力のまま成立させない。この合成fixture候補はruntime動作を主張しない。 |
| `CASE-HARNESS-L10-043-r21-independent-rule-content-missing` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | L2-009の選択template identity/revision/applicabilityとsource identity/revisionはknown/current。041 atomを選択せず、独立sourceのrule R-Aのvalidation predicate対象要素とbranch B-Aの識別可能内容、oracle O-A、scope/revisionもcurrentで、ほかのfieldは有効。 | 単独変異: 独立sourceが供給するrule R-Aのvalidation predicateの対象要素（rule内容field）一つだけを欠落させる。他のsource内容、template、適用性、oracle、scope、例は変えない。 | matrixを未完/unknownとし、欠けたrule内容のsource owner責務区分、すなわちそのsourceのrule/branch内容を供給する041相当の抽出契約ownerへ返す。個別owner identityが不明ならidentity unknownを別に保ち責務区分は消さない。非選択041 atomの不在をgapにせず、009の適用性と004のoracleはcurrentのまま保つ。 |
| `CASE-HARNESS-L10-043-r21-independent-rule-content-tbd` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | CASE-HARNESS-L10-043-r21-independent-rule-content-missingと同じ041非選択の正常baseline。独立sourceのrule R-A/branch B-A内容の各要素と、別fieldとしてのL2-009選択template/applicability、oracle O-A、scope/revisionは既知かつcurrent。 | 単独変異: 独立sourceが供給するrule R-Aのvalidation predicate対象要素（rule内容field）一つだけを`TBD`にする。他のsource内容、template、適用性、oracle、scope、例は変えない。 | TBDを推測で補わずmatrixを未完/unknownとし、当該rule内容を供給する041相当の抽出契約ownerへ返す。個別owner identity unknownは別fieldで保持し、責務区分を消さない。041 atom非選択の事実を抽出gapにせず、009の適用性・004のoracle/riskと混同しない。 |
| `CASE-HARNESS-L10-043-r10-profile-missing-to-005` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 選択scopeのactive template/applicabilityとrule/branch内容は識別可能な独立sourceからcurrent。041 atomは選択されていない。通常例・適用oracleはcurrent。risk追加例を評価するoperationが選択され、そのscopeのrisk根拠と未被覆領域は利用可能。 | risk追加評価operationのrisk根拠と未被覆領域だけを除去する。template選択、rule/branch、oracle、他scopeは保持する。 | risk追加coverageをunknown/未評価とし、HARNESS-L2-004と固定sourceが示す該当risk/oracle ownerだけへ返す。041 atomが未選択であることを抽出gapに読み替えない。このCASE IDは履歴名として保持し、現在のmutationはrisk-basis欠落を示す。 |
| `CASE-HARNESS-L10-043-r10-template-applicability-to-009` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 041 atomは選択されていない。独立入力としてrule/branchの識別可能な内容とoracleはcurrent。選択scopeのactive template revisionと適用性もcurrentである。 | そのtemplateの選択/適用情報だけを欠落またはunknownにする。 | rule/branch分母を確定せず、選択/適用性の不足だけをHARNESS-L2-009/template ownerへ戻す。041 atom不在を抽出gapにしない。 |
| `CASE-HARNESS-L10-043-r10-extracted-atom-to-041` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | このscopeはL2-041 atom/source spanを入力元に明示選択している。L2-009の選択template/applicability、oracle/risk入力、他の抽出atomはcurrent。 | 選択したtemplate inputは保持し、L2-041抽出atom/source span対応だけを欠落させる。 | 選択された041入力の抽出gapとして保ち、HARNESS-L2-041の抽出契約ownerだけへ返す。041を選ばないscopeにこのCASEを一般化しない。 |
| `CASE-HARNESS-L10-043-r10-risk-oracle-to-004` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | 041 atomを入力元に選択せず、識別可能なrule/branch内容と適用条件を直接入力する。rule/branch分母はcurrent。risk追加評価operationのscope根拠、L2-004の要求/risk/oracle traceもcurrent。 | 選択coverage主張に対するrisk rationale/oracle bindingだけを除去する。 | 該当coverageをunknown/未完とし、HARNESS-L2-004および固定sourceが示す該当risk/oracle ownerだけへ返す。041 atom未選択を抽出gapや戻し先にしない。 |
| `CASE-HARNESS-L10-043-r10-025-not-substituted` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-03` | 043の例coverage matrixは利用可能であり、composite design/oracleは別途L2-025が担当する。 | 043 matrixをL2-025のcomposite design/oracle結果として出力する。 | 代替を拒否する。043はcomposite design/oracleを作らない。不足する成果物はL2-025 ownerへ戻す。 |
| `CASE-HARNESS-L10-043-r10-026-not-substituted` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-03` | 043の例coverage matrixは利用可能であり、具体的なunit designと対のverification designは別途L2-026が担当する。 | 043 matrixをL2-026のunit design/対verification design出力として出す。 | 代替を拒否する。043はunit designや対verification designを作らない。不足成果物はL2-026 ownerへ戻す。 |
| `CASE-HARNESS-L10-043-r10-requirement-agreement-not-generated` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | 固定PO判断行は外部authority入力であり、043 matrixは内容coverage結果に限られる。 | 043文書/matrixから要求合意だけを生成する。 | 生成された要求合意だけを拒否し、外部の固定PO判断は変更せず保持する。043は要求合意を作らない。 |
| `CASE-HARNESS-L10-043-r10-adoption-not-generated` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | 現行POの条件付きB採択/HARNESS-CORE配置は外部で固定され、このL3候補とは別の状態である。 | 043候補の内容から採択状態だけを生成または変更する。 | 候補から生成した採択状態を拒否し、実際のPO判断とその範囲を保持する。判断を取り消したり広げたりしない。 |
| `CASE-HARNESS-L10-043-r10-l3-approval-not-generated` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | L3承認は委任されたOpus/Fableの一致を待っており、043 matrixは候補内容である。 | 文書やfixtureの存在だけからL3承認状態を主張する。 | L3承認の主張を拒否し、承認を生成しない。POのL2採択から推論しない。 |
| `CASE-HARNESS-L10-043-r10-design-established-not-generated` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | matrixが測るのはrule/branch/riskの例coverageであり、設計受入のauthorityは持たない。 | coverage通過だけから設計確立状態を主張する。 | 設計確立状態の生成を拒否し、設計成果物/oracleの不足は該当するL2-025またはL2-026へ戻す。 |
| `CASE-HARNESS-L10-043-r10-implementation-not-generated` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | 内容matrixと固定入力だけがあり、実装receiptは与えられていない。 | 候補またはmatrixから実装完了状態を主張する。 | 実装完了状態の生成を拒否し、仕様や内容充足から実装を推論しない。 |
| `CASE-HARNESS-L10-043-r10-execution-not-generated` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | OS実行receiptは与えられておらず、matrix結果は実行結果ではない。 | matrix/文書の存在だけからOS実行完了を主張する。 | 実行状態の生成を拒否し、実行状態はunknownのまま既存OS実行契約/ownerへ戻す。 |
| `CASE-HARNESS-L10-043-r10-acceptance-not-generated` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-04` | 利用者の受入証拠はなく、matrix結果は受入結果ではない。 | matrix/文書の存在だけから利用者受入を主張する。 | 利用者受入の生成を拒否し、L3/L10内容から受入を作らない。 |
| `CASE-HARNESS-L10-043-r10-no-cartesian-expansion` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | 対象は選択scope、active template/revision/applicability、適用rule/branch分母、各rule/branchの正例/境界負例に限る。追加risk例を評価するoperationには、そのscopeのrisk分析で未被覆と示された領域のsource evidenceを用いる。 | scope/risk evidenceに根拠付けられていない無関係なrule、branch、risk要因、環境値のCartesian productを追加必須化する。 | scope拡張と全組合せの義務を拒否する。追加risk例は、対象scopeのrisk分析で未被覆と示された領域だけに限る。 |

```

### `docs/helix-harness/L10-verification/business-verification.md`

SHA `6c7ea10edc1f86139eabd77880b2d49cd8a860a5613defb2e5efe67e388e7ca4`; 232 bytes.

```markdown
## Stage 3 親043の業務検証

| L2親 | 独立criterion | 対応関係 |
|---|---|---|
| `HARNESS-L2-043` | 独立criterionなし | business outcomeは増やさず、選択scopeのrule/branch/risk content ACを照合する。 |

```

### `docs/helix-harness/L10-verification/nfr-verification.md`

SHA `66ef1f58bd31bc22bffe0494adaec039afb94af81e5cab46cd480ea15831907e`; 391 bytes.

```markdown
## Stage 3 親043の非機能検証

| CASE ID | NFR候補 | 検証対象 | 観測 | 限界 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-043-01` | 独立NFRなし | fixed L2-043の選択scope内adequacy matrix | 数値性能・coverage率ではなく、適用rule/branchとoracle/risk根拠のtraceを機能ACで確認する。 | 新規閾値やall-combinations実行を設けない。 |

```
