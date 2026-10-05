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
| `HELIXBRAIN-L2-INFRA-003` | L2 20 atomic fieldとL11 18 groupを各100%照合する候補。trade-offとevidenceは別group。根拠は固定列挙。 | 20 fieldと18 groupを別分母にし、各欠落・stale・対象違いを個別測定。field別evidence/scope義務の追加もnegativeにする。 | 重み付き総合値は欠落を相殺するため使わない。 |
| `HELIXBRAIN-L2-INFRA-004` | 10 NFR characteristicと親記載のPattern/Input relationの保持候補100%。NIO-L3-01/02のtyped input/design obligationを類例にする。 | characteristic、Pattern、Input/relationの個別欠落・unknownを測る。要求閾値は新設しない。 | evidence義務やNFR ownerをNIOから移さない。 |
| `HELIXBRAIN-L2-INFRA-005` | 13 failure×6観点=78 cellを保持する候補100%。正常構成と同一knowledge identity/hierarchy/relationで結ぶことも照合。 | 各cellと正常構成relationの欠落を独立変異し、未見failure候補は別normal fixtureで測る。 | 設計候補の存在を実incident証拠とみなさない。 |
| `HELIXBRAIN-L2-INFRA-006` | 10 recovery候補と予防/復旧区分の保持候補100%。INFRA-010 relation unknownでも独立評価できる。 | 各候補/区分を個別欠落し、C06で010 relation unknown時も006を保つ。 | 他親完成待ちや実復旧成功の尺度にしない。 |
| `HELIXBRAIN-L2-INFRA-007` | 6 deployment方式×6比較軸=36 cellの保持候補100%。 | 各方式/軸を変異し、release actionと段階/state進行を別々に負例測定。 | NIO-L10-05はrollback/permanent-fix区別の類例に限る。実deploy結果を測らない。 |
| `HELIXBRAIN-L2-INFRA-008` | Vertical/Horizontal 8候補×6軸=48 cellの保持候補100%。size/scale増大を目的化しない。 | 各cellを欠落/unknown/stale/wrong-targetへ変異し、size/scale目的化negativeとworkload未指定normalを個別測定。 | workload/SLO閾値や自動scaling実行能力を追加しない。 |
| `HELIXBRAIN-L2-INFRA-009` | 11 design observation pointとPattern/failure relationの保持候補100%。 | 各点/relation欠落、raw telemetry知識化、missing/stale/collector停止の誤healthy化を個別測定。 | 固定親外のsecret/PII処理契約は設けない。 |
| `HELIXBRAIN-L2-INFRA-010` | backup-only、restore verification、required recovery conditionsの3状態を別に識別する候補。3条件が揃う時だけRecoverability Evidence Candidateを作る。 | 3条件の独立欠落をC02/C03で測り、candidate記録は実復旧可能性の確定と区別する。 | RTO/RPOを製品値として創作せず、成功率や運用SLAを導出しない。 |
| `HELIXBRAIN-L2-INFRA-011` | 7 cost groupsと8 atomic characteristicsの別々の保持候補100%。価格を含む時だけprovider/time/sourceを価格へ結ぶ。 | 7 group/8 atomicを別分母。provider/time/sourceの個別変異は具体価格fixtureだけに適用し、恒久定数化をnegativeにする。 | 構造cost比較は価格なしで成立。scopeは要件外、予算/価格閾値を作らない。 |
| `HELIXBRAIN-L2-INFRA-012` | 1 abstract pattern identityと4 implementation example identities/関係を区別して保持。provider-specific factはevidenceと版を結ぶ。 | identity/relation/evidence/versionの個別欠落とS3→GCS swap正常fixtureを照合。 | 未確認互換性はunknown。provider approval gateは追加しない。 |
| `HELIXBRAIN-L2-INFRA-013` | 6 resource classesとabstract capability relationを保持し、provider/compute classを固定しない候補。 | 6 class/relationの欠落とprovider固定・compute固定の独立negative、未見edge-device normalを測る。 | 実resource state/credential/操作権限を要件にしない。 |
| `HELIXBRAIN-L2-INFRA-014` | 9 relation typeのtype/endpoints/meaning、および固定2 topology例を保持する候補。 | 2例・relation fieldを照合し、unlisted topologyでも未指定edgeをunknownで保持するか測る。 | actual topologyの正しさを測定しない。 |
| `HELIXBRAIN-L2-INFRA-015` | 固定Domain-pair relationのdirection/evidence/uncertaintyを保持する候補。根拠のないassertive relationを誤受理0候補とする。 | endpoint/direction欠落とunlisted pairを測り、may-affect＋unknownは許容、causesへの根拠ない強化をnegativeとする。 | relationの全件適用率や新しいevidence gateは作らない。 |
| `HELIXBRAIN-L2-INFRA-016` | 11 anti-pattern×4要素(condition/manifestation/detection clue/alternative)=44 cellを照合する候補。L11 signalはmanifestationとdetection clueの双方へ対応。 | 44 cellとsignalの二つの対応先を別々に欠落変異し、条件外のuniversal banをnegativeにする。 | legacy NIO-L10-06 secret/PIIは独立要件にせず、固定INFRA-016親外として除外。 |
| `HELIXBRAIN-L2-INFRA-017` | 6 maturity states、BRAIN version、project usage version、および利用実績/failure/反例/LABO評価の固定4入力を保持する候補。 | 3軸・4入力をそれぞれ欠落/不一致変異し、一回success、複数条件評価、failureを独立fixtureで測る。 | scopeを新規必須入力にしない。state閾値や普遍適用基準を作らない。 |