# HELIX-BRAIN L3 非機能要件・候補値 — Stage 1（007/008/028）

**状態：部分草稿・未承認。** 本書の値は固定親の列挙field/state/境界を検証可能にする根拠付き技術候補であり、PO指定SLA、採択済閾値、実測結果ではない。比較案・根拠・測定方法・判定境界を対のL10へ結び、候補の採否は通常のL3承認で扱う。parameterごとのPO確認は設けない。固定要求の意味・範囲・owner・版を変える場合だけL2へ戻す。

旧NFRの形式的起点は **`LEGACY-ASSET-DB669724249A14A665F0`**（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-74`、全文SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）。これはHELIX-HARNESSの旧NFR文書であり、BRAIN要件や現行値ではない。NFRと測定・判定を結ぶ骨格のみ再導出する。旧IPA grade、数値、pass条件、CI/runtimeを移さない。旧BRAIN固有の直接一致するNFR根拠は確認できず、以下は固定BRAIN L2/L11からの候補である。

| 親L2／測定項目 | 技術候補・比較 | 根拠・測定方法 | 判定材料・未確定範囲 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` required provenance field coverage | 8/8 required fieldsを個別に解決可能とする候補。案Aは総数のみ、案Bはsource/provenance/evidence/adopted reason/evaluated scope/counterexample/limitation/LABO target revisionを個別照合し欠落を特定する。説明可能なBを候補とする。 | L2-007とL11:35の列挙に基づく。各fieldの欠落、stale、revision不一致を個別に与え、candidate stateとpromotion結果を観測。 | 欠落ごとのaccepted/mature誤遷移0を候補判定。必要実績件数・verifier人数は上流にないため候補化しない。 |
| `HELIXBRAIN-L2-007` false promotion | AI-generated-onlyまたはsingle successだけによるaccepted/mature遷移0を候補とする。 | L2-007/L11:35の明示否定条件。単独根拠mutationとowner別stateを照合。 | promotion結果、不足根拠・ownerを観測。実測前の候補値。 |
| `HELIXBRAIN-L2-008` named state distinction and pin stability | L2列挙5 stateを個別識別し、supersession時も既存consumer exact revisionを保持する候補。案Aは現stateのみ、案Bは全state/consumer referenceを照合しsilent replacementを検出。 | current/superseded/deprecated/experimental/retiredを別々に与え、R参照中にR2 supersessionを作る正常fixtureと、R参照へR2を返す／同revision内容を書き換える独立negativeを用いる。 | 5値とR pinを照合。新state・semver grammar・transition SLA・保存期間は未指定。 |
| `HELIXBRAIN-L2-008` unknown handling | unknown identity/revision/stateをcurrentへ推測解決しない、version_targetをactualとして受けない候補。 | unknown/競合/欠落mutationとversion_target差し替えを別々に投入。 | candidate use停止、BRAIN/OS owner分離を確認。新stateや追加ownerは作らない。 |
| `HELIXBRAIN-L2-028` declared compatibility match | descriptorに宣言されたrange内だけapplicable、outside/unknown/mismatchはnot-applicableまたはunknownとする候補。 | BRAIN L2-028が列挙するdescriptor field/rangeと、採択HARNESS L2-010/011のpack/call境界依存を分けて扱い、技術候補として、descriptorがrangeを宣言する合成fixtureを置き、そのfixture内でrequired versionの内側・外側・欠落・解釈未確定を比較する。fixture値は試験入力に限り、製品値・range構文・比較規則として採択しない。range field自体がない/読めない場合はunknown/未評価とする。 | range syntax/comparator/fallbackは固定L2にないため採択候補にしない。合成fixture値は測定入力に限り、本書で製品値として決めない。 |
| `HELIXBRAIN-L2-028` descriptor/knowledge axis separation | descriptor fieldとBRAIN knowledge identity/revision/version/stateを独立照合し、cross-substitutionによる誤受理0を候補とする。 | descriptorとknowledge各fieldを個別変異し、identityおよび各version軸に互いに異なる合成値を置いた入替え変異を独立投入する。応答tuple、該当field、期待軸、BRAIN（L2-008）／HARNESS ownerへの戻し先を観測。 | 独自schema/digest/timeoutは未指定。BRAINは共通exchange/update/rollback/unfinished-obligation lifecycleを再定義しない。 |

候補値は未実測であり、測定できない/fixture未充足/契約値が不明な場合を成功としない。旧数値を自動継承しない。


## Stage 2b — INFRA親のNFR候補

**状態：候補・未測定。** 以下は要求された情報の被覆・識別を検証する候補で、製品SLO、RTO/RPO、費用、performance targetではない。固定L2の明示集合を分母とし、候補境界は列挙義務100%被覆・誤受理0件。95%重み付き集計は必須field欠落を隠し得るため採らない。fixtureで合成fieldは宣言し、unknown/missing/stale/conflictを成功へ含めない。parameterごとにPO判断を求めない。

| 親 | NFR測定候補・根拠付き候補値 | L10測定方法・分母 | 比較・限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-INFRA-001` | 20初期subdomainと追加/分割/統合/退役の4操作を識別する被覆100%候補、固定enum化やRuntime inventoryへの誤固定0件候補。根拠は親が20分類と4変更可能性を明示すること。 | 20分類と4操作を個別に観測し、Runtime resource一覧への固定変異もC03で測る。missing/unknown/stale/wrong-targetを別stateで記録。 | 95%平均では特定要素の欠落を隠す。製品resource実数やperformanceは外挿しない。 |
| `HELIXBRAIN-L2-INFRA-002` | Domain 2、Pattern 2、Part 8および固定例の全relation endpointの保持候補。固定L2例の構造を明示できる分母として採る。 | nodeと各endpointを個別欠落/誤型/unknownにし、Domain 2・Pattern 2・Part 8・endpointを区別して記録。 | node数だけの4-level totalではendpoint欠落を隠すため不採用。実装設定の網羅ではない。 |
| `HELIXBRAIN-L2-INFRA-003` | L2 20 atomic fieldとL11 18 groupを各100%照合する候補。trade-offとevidenceは別group。根拠は固定列挙。 | 20 fieldと18 groupを別分母にし、各欠落・stale・対象違いを個別測定。FRとC01/C04を文書照合し、親にないfield別evidence/scope義務を要件へ追加していないことを確認する（fixture mutationには数えない）。 | 重み付き総合値は欠落を相殺するため使わない。 |
| `HELIXBRAIN-L2-INFRA-004` | 10 NFR characteristicと親記載のPattern/Input relationの保持候補100%。NIO-L3-01/02のtyped input/design obligationを類例にする。 | characteristic、Pattern、Input/relationの個別欠落・unknownを測る。要求閾値は新設しない。 | evidence義務やNFR ownerをNIOから移さない。 |
| `HELIXBRAIN-L2-INFRA-005` | 13 failure×6観点=78 cellを保持する候補100%。正常構成と同一knowledge identity/hierarchy/relationで結ぶことも照合。 | 各cellと正常構成relationの欠落を独立変異し、未見failure候補は別normal fixtureで測る。 | 設計候補の存在を実incident証拠とみなさない。 |
| `HELIXBRAIN-L2-INFRA-006` | 10 recovery候補と予防/復旧区分の保持候補100%。INFRA-010 relation unknownでも独立評価できる。 | 各候補/区分を個別欠落し、C06でunknown relation保持と誤った010完成gateを対にして測る。 | 他親完成待ちや実復旧成功の尺度にしない。 |
| `HELIXBRAIN-L2-INFRA-007` | 6 deployment方式×6比較軸=36 cellの保持候補100%。 | 各方式/軸を変異し、release actionと段階/state進行を別々に負例測定。 | NIO-L10-05はrollback/permanent-fix区別の類例に限る。実deploy結果を測らない。 |
| `HELIXBRAIN-L2-INFRA-008` | 8候補×6軸=48 cellの保持候補100%。根拠のない負荷閾値と特定規模値の創作を独立に拒否する候補。 | 各cellを欠落/unknown/stale/wrong-targetへ変異し、根拠のない負荷閾値の創作と特定規模値の創作を独立fixtureで測る。workload未指定normalも別に保持する。 | workload/SLO閾値や自動scaling実行能力を追加しない。 |
| `HELIXBRAIN-L2-INFRA-009` | 11 design observation pointとPattern/failure relationの保持候補100%。 | 各点/relation欠落、raw telemetry知識化、missing/stale/collector停止の誤healthy化を個別測定。 | 固定親外のsecret/PII処理契約は設けない。 |
| `HELIXBRAIN-L2-INFRA-010` | backup-only、restore verification、required recovery conditionsの3状態を別に識別する候補。3条件が揃う時だけRecoverability Evidence Candidateを作る。 | 3条件の独立欠落と根拠のない一律RTO/RPO創作をC02/C03の独立fixtureで測り、candidate記録は実復旧可能性の確定と区別する。 | RTO/RPOを製品値として創作せず、成功率や運用SLAを導出しない。 |
| `HELIXBRAIN-L2-INFRA-011` | 7 cost groupsと8 atomic characteristicsの別々の保持候補100%。価格を含む時だけprovider/time/sourceを価格へ結ぶ。 | 7 group/8 atomicを別分母。provider/time/sourceの個別変異は具体価格fixtureだけに適用し、恒久定数化をnegativeにする。 | 構造cost比較は価格なしで成立。scopeは要件外、予算/価格閾値を作らない。 |
| `HELIXBRAIN-L2-INFRA-012` | 1 abstract pattern identityと固定4 implementation example identities/関係を区別して保持。provider-specific factはevidenceと版を結ぶ。 | 4実装例のidentity/relation/evidence/versionを個別に欠落させ、固定列挙外implementationの未見normal（C05）とS3→GCS swap normal（C06）を別fixtureで照合。 | C05/C06とも未確認互換性はunknown。列挙外fixtureは親の4例分母へ追加せず、provider approval gateを作らない。 |
| `HELIXBRAIN-L2-INFRA-013` | 6 resource classesとabstract capability relationを保持し、provider/compute classを固定しない候補。 | 6 class/relationの欠落とprovider固定・compute固定の独立negative、未見edge-device normalを測る。 | 実resource state/credential/操作権限を要件にしない。 |
| `HELIXBRAIN-L2-INFRA-014` | 9 relation typeのtype/endpoints/meaning、および固定2 topology例を保持する候補。 | 2例・relation fieldを照合し、unlisted topologyでも未指定edgeをunknownで保持するか測る。 | actual topologyの正しさを測定しない。 |
| `HELIXBRAIN-L2-INFRA-015` | 固定Domain-pair relationのdirection/evidence/uncertaintyを保持する候補。根拠のないassertive relationを誤受理0候補とする。 | endpoint/direction欠落とunlisted pairを測り、may-affect＋unknownは許容、causesへの根拠ない強化をnegativeとする。 | relationの全件適用率や新しいevidence gateは作らない。 |
| `HELIXBRAIN-L2-INFRA-016` | 11 anti-pattern×4要素(condition/manifestation/detection clue/alternative)=44 cellを照合する候補。L11 signalはmanifestationとdetection clueの双方へ対応。 | 44 cellとsignalの二つの対応先を別々に欠落変異し、条件外のuniversal banをnegativeにする。 | legacy NIO-L10-06 secret/PIIは独立要件にせず、固定INFRA-016親外として除外。 |
| `HELIXBRAIN-L2-INFRA-017` | 6 maturity states、BRAIN version、project usage version、および利用実績/failure/反例/LABO評価の固定4入力を保持する候補。 | 3軸・4入力をそれぞれ欠落/不一致変異し、C06の一回success保持/誤昇格とC08のfailure保持/隠蔽を対にして測る。 | scopeを新規必須入力にしない。state閾値や普遍適用基準を作らない。 |

## Stage 2b追補 — 採択済み001〜006の部分草稿

形式比較元は旧`LEGACY-ASSET-DB669724249A14A665F0`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34,58–74`、全文SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）。001–006では測定・判定構造だけを再導出し、旧IPA値・pass条件・runtimeは置換する。

**状態：候補のみ（独立review／L3承認前）。** Stage 1 prefixはPO承認済みのbytesを保持し、既存INFRA Stage2b 17親suffixは最新main `4729c34ec29c2c72f345993958bbc94e1ed6f131`のbytesをそのまま保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

### BRAIN-001-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-001と対応L11の列挙条件。比較案Aは件数/名称だけの照合、案Bはidentity/source/意味/state/戻し先を個別照合する。本案はBを候補とする。Nrequiredは固定親の初期10 Domain全てと追加・分割・統合・退役の4操作を別母集団で含める。追加可能6領域の初版充実は必須母集団に含めず、fixture選択で固定10領域/4操作を狭めない。各対象内100%照合候補、missing/unknown/意味不整合を誤成功へ変換した件数0候補。これは全製品・全欠陥の性能保証ではない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-002-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-002と対応L11の列挙条件。比較案Aは件数/名称だけの照合、案Bは4階層それぞれのidentity/source/親/責務/stateを照合する。本案はBを候補とする。NrequiredにはDomain→Pattern→Design Unit→Part以上という固定4段階と、提示されたidentity/parent/relation/responsibilityを全て含め、fixture選択で列挙階層を狭めない。各対象内100%照合候補、missing/unknown/誤対応を誤成功へ変換した件数0候補。これは全製品・全欠陥の性能保証ではない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-003-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-003と対応L11の列挙条件。比較案Aは件数/名称だけの照合、案Bはdescriptor 12要素それぞれのidentity/source/意味/状態/戻し先を照合する。本案はBを候補とする。Nrequiredには親が列挙する12要素を全て含め、fixture選択で項目を狭めない。利用時required inputや条件充足/不充足/unknownは要素母集団と別の状態軸で記録する。各対象内100%照合候補、missing/unknown/意味不整合を誤成功へ変換した件数0候補。これは全製品・全欠陥の性能保証ではない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-004-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-004と対応L11の列挙条件。比較案Aは件数/名称だけ、案Bは固定3例の各6比較軸とsource/意味/state/戻し先を照合する。本案はBを候補とする。Nrequiredは3比較例×6軸を個別に保ち、fixture選択で例や軸を狭めない。各対象内100%照合候補、missing/unknown/不整合を誤成功へ変換した件数0候補。これは全製品・全欠陥の性能保証ではない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-005-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-005とL11:33の7 relation種、およびL2:135の二つのrelation chain。比較案Aは件数/名称だけ、案Bは各relationのidentity/source/意味/状態/戻し先を照合する。Bを候補とし、7種と二つのchainを母集団に含め、fixture選択で狭めない。全製品・全欠陥の性能保証ではない。必要項目の有限集合を各々照合（対象内100%候補）し、missing/unknown/意味不整合を成功に丸める件数0を候補判定とする。未選択のsource/将来候補は必須母集団へ足さない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

### BRAIN-006-NFR-01 — 意味条件の照合可能性（候補）

根拠：固定HELIXBRAIN-L2-006とL11:34の15知識例。比較案Aは件数/名称だけ、案Bは各知識例のidentity/source/意味/状態/戻し先を照合する。Bを候補とし、15例を母集団に含め、fixture選択で狭めない。全製品・全欠陥の性能保証ではない。必要項目の有限集合を各々照合（対象内100%候補）し、missing/unknown/意味不整合を成功に丸める件数0を候補判定とする。未選択のsource/将来候補は必須母集団へ足さない。

測定は計画試行Nplannedをvalid観測/Nfailed/Nmissing/Ncensoredの互いに重ならない区分へ記録する。validは合格件数でなく比較できる観測件数であり、不合格を正しく観測した試行も入る。Nfailedは処理エラーにより判定可能な観測を得られなかった試行に限り、観測できたoracle不合格と区別する。Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを照合する。missingは入力欠落と観測欠落を別表示、censoredは停止/打切りで判定未完のもの。各行の理由を保ち、未実施は未測定。対象scopeで契約が要求する項目Nrequired（値不明や欠落も母集団に残す）と、期待oracleどおり照合したNchecked（正しい不足/不合格判定も含む）、誤成功Nfalseを併記する。Nrequired=0なら照合率は算出せず、必須入力自体の欠落を『対象なし』へ変換しない。時間を測る場合は既存の単位/開始終了条件とvalid標本数を記録し、valid=0では分位値を出さない。固定SLA/保持期間/最低sample数は設定しない。

## Stage 2b追補 — 採択済み009/010/011/012/029（技術候補）

値は固定L2/L11を照合可能にする技術候補で、PO指定SLAや実測値ではない。001–006の測定形式は旧NFR `LEGACY-ASSET-DB669724249A14A665F0`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-74`, full SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）の測定・判定構造から再導出し、旧IPA grade/value/pass/runtimeは置換する。009以降の測定候補も同じ旧NFR assetを参照する。旧IPA grade、placeholder、固定比率、CI/runtime条件は置換する。BRAIN固有NFRの旧直接一致根拠は検索範囲で確認できず、以下は固定親と機能CASEの独立oracleからの候補である。

| 親L2 | 候補比較と判定材料 | 測定母集団・境界 |
|---|---|---|
| `HELIXBRAIN-L2-009` / `BRAIN-009-NFR-01` | 案A: relation名・candidate件数だけを確認。案B: 選択されたUnit/relationのsource、両端identity、意味、scope、version、owner別評価/登録/検証状態を照合する。案BはL2-009の構成根拠とcandidate-only保証を直接検査できるため候補。選択relationごとの必須要素を照合し、欠落・unknown・不一致を昇格成功へ変換した数を別計数する。 | C01–C13の選択fixtureのみ。未選択sourceを分母へ入れない。owner状態、missing Unit根拠、L2-025不成立/成立を分離し、全体成功件数で個別欠落を相殺しない。 |
| `HELIXBRAIN-L2-010` / `BRAIN-010-NFR-01` | 案A: failure名だけの照合。案B: 選択failureの成立条件、影響、反例、evidence/source/scopeと条件付き適用を項目ごとに照合する。固定L2/L11が求める意味を測るBを候補とする。sourceにあるalternative candidateと条件付き禁止構造の保持、sourceにないalternativeのunknown維持も照合する。 | C01–C11の選択failure fixture。L11列挙全種を一律に全条件へ適用しない。unknown scope、source/evidence欠落、success-only retention、Regression case固有条件欠落は各々区別し、未見normal C09を含む。 |
| `HELIXBRAIN-L2-011` / `BRAIN-011-NFR-01` | 案A:製品固有語の件数だけを見る。案B:選択sourceごとに一般化根拠、製品固有残余、source/provenanceを照合する。意味漏れとsource喪失を検出するBを候補とする。 | C01–C12で選択された対象sourceだけを分母候補にし、製品名・requirement・製品固有screen・business rule・user judgment・provenance・根拠を超えた一般化（C11）・候補事実化（C12）を独立計数する。未選択sourceは未観測。 |
| `HELIXBRAIN-L2-012` / `BRAIN-012-NFR-01` | 案A:返却候補数だけを見る。案B:返却 tuple（candidate、required input、relation、alternative、constraint、evidence、version）とdecision未決状態を対応付ける。採用authorityの誤生成とtuple各field欠落を独立に観測するBを候補とする。 | C01–C13のquery/選択候補scope。問い合わせ側required input欠落、sourceが宣言した返却field欠落、sourceにrelation/alternativeがない正常不在を別区分で測る。候補数と必須field充足を混ぜず、意味不明を空母集団や選択成功へ変えない。 |
| `HELIXBRAIN-L2-029` / `BRAIN-029-NFR-01` | 案A:構成数とrelation labelだけを見る。案B:選択したPattern/Unit/Part tuple（identity/source/version、applicability、required input、constraint、trade-off、negative/failure、relation type/endpoint/meaning）を追跡し、unknown・stale・矛盾とowner境界を別軸で照合する。列挙されたrelation例とL2-003/005/008の必須条件を直接検査できるBを候補とする。 | C01–C53の選択構成fixture。5 relation typeと各必須情報を独立に照合し、missing/unknown/stale/mismatchを区別する。未選択CORE/LABO sourceは未観測。参照資料は分母・oracleにしない。 |

共通の測定報告候補：対象scopeで契約上要求される要素数を分母として明示し、値欠落・unknownも対象要素から除かない。観測可能、観測した不合格、処理失敗、入力/観測欠落、打切りを別々に数え、分母0では率を算出しない。正しい不合格判定は判定可能な観測であり失敗件数へ隠さない。未実行は未測定であり、欠測を0や成功へ変換しない。時間を測る場合は根拠ある開始/終了条件と単位を併記し、valid時間標本が0なら分位値なしとする。これは測定形式の候補であり、新しいSLA、最低標本数、承認gateを設けない。
