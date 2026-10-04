# HELIX-BRAIN L3 非機能要件・候補値（1.0対象親40件の草稿）

**状態：部分草稿・未承認。** 下表は上流のfield/status/境界を測定可能にする候補値と比較観点である。完全coverage、誤昇格/誤帰属0等の候補は親の明示条件に基づき、L2が指定した性能SLAだとは扱わない。旧HELIXの数値を自動継承せず、測定不能/未観測を成功扱いしない。

| 項目 | 候補値・比較 | 根拠と測定 | 代替・未確定範囲 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` — 必須由来field coverage | required fieldsは全件解決可能（8/8: source, provenance, evidence, adopted reason, evaluated scope, counterexample, limitation, LABO target revision）。案Aは総件数だけ、案Bは各fieldを個別照合し欠落元を特定する。誤昇格を説明可能なBを候補にする。 | 親L2-007の必須inputとL11に列挙。各fieldのmissing/stale/wrong revision mutationでaccepted/mature誤昇格0を観測。 | 旧memory実装の65件/byte上限を候補にしない。 |
| `HELIXBRAIN-L2-007` — 誤昇格率 | AI生成のみまたは実績一件だけによるaccepted/mature遷移0 | L2-007/L11が明示する否定条件。promotion stateとowner別stateをsystem evidenceで照合。 | 必要な実績件数や独立verifier人数は上流にないため未指定。 |
| `HELIXBRAIN-L2-008` — lifecycle state識別 | 5個のL2列挙stateを全て別値として識別。案Aは現stateのみ、案Bは全列挙stateとconsumer参照を同時に照合しsilent replacementも検出する。exact revision保全が可能なBを候補とする。 | current/superseded/deprecated/experimental/retiredを1つずつ与え、consumer参照と保存stateを照合。 | 新state、semver grammar、transition SLAは未指定。 |
| `HELIXBRAIN-L2-008` — silent replacement | supersession後のexisting consumer exact revisionのsilent rewrite 0 | 親L2/L11のexact版追跡要求。RからR2へのsupersession中もconsumer referenceをRのまま観測。 | 履歴保存方式・保持期間は候補値にしない。 |
| `HELIXBRAIN-L2-028` — compatibility match | HARNESS宣言range内だけを適用可能、outside/unknown/mismatchは適用不可またはunknown | L2-028/L11にあるdescriptor fieldとrange条件。境界値はrangeの指定syntaxをHARNESS contractから取得し、内側・外側・未定義を比較。 | semver comparator、range syntax、fallbackはHARNESS側が定義するまで未指定。 |
| `HELIXBRAIN-L2-028` — cross-axis confusion | descriptor/knowledge revisionの相互代入による誤受理0 | descriptor field群とBRAIN identity/revision/version/stateを個別変異し、応答fieldを観測。 | 独自schema・digest/timeoutは未指定。 |

## Stage 2b候補値（機能意味の完全性・境界）

以下は親L2の列挙fieldと明示した境界から導くmeasurement候補であり、POが指定した性能SLAや新しい承認条件ではない。分母はfixtureへ投入した該当要素とする。

| 親L2／測定項目 | 候補値・比較 | 根拠と測定入力 | 判定材料・限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-001/002` — domain/structure completeness | 各提示候補のidentity・meaning・stateと4階層kind/parent relationの解決、初期10 Domain exact-set 10/10、既存consumer参照喪失0を候補にする。案Aは件数のみ、案Bはidentity/meaning/state/consumer relationを個別照合し、誤分割の原因を判別できるBを候補とする。 | 固定L2/L11の列挙Domainを分母にし、追加・分割・統合・退役を個別fixtureで与えてunknown/重複/参照喪失を変異。 | 提示要素のcoverageだけを測り新Domain充実義務は置かない。 |
| `HELIXBRAIN-L2-003/004` — descriptor/comparison completeness | 親L2が列挙したapplicability fieldsを候補ごとに識別し、未充足をunknownとする候補 | 必須field欠落、required input unknown、比較scope/weight欠落を変異 | applicable/unknown/holdの誤判定を記録。新しい選択順位や比較weightは作らない |
| `HELIXBRAIN-L2-005/009` — typed relation trace | 7 relation種ごとのendpoint/type/meaning/sourceを提示edgeごとに追跡する候補。案Aは全edge総数、案Bは種類・両端・方向・sourceを個別照合し欠落箇所を特定できるBを選ぶ。 | 7種を含む正常fixtureと、種別/endpoint/source/方向欠落・名称類似だけのedgeを比較測定。 | sourceなしedge誤確定0を候補指標とし、親のrelation意味を変えない。 |
| `HELIXBRAIN-L2-006/011` — reuse boundary | L2-006の15 knowledge examplesを扱い、各候補のshared/product-specific fieldをsourceまで分類できる候補。案Aは全例を一括pass、案Bは知識例とproduct-specific境界を個別照合し、Bを候補とする。 | 15例の各欠落、装飾例だけへの縮小、System Design全体への誤一般化、Product Core固有screen/flow/tokenの混入、source context除去を個別に変異。 | 分離不能は保留。誤一般化0を候補値として比較・計測し、測定実施済みとは扱わない。 |
| `HELIXBRAIN-L2-010` — conditional failure knowledge | failure context・condition・impact・counterexample・provenanceを識別する候補。alternativeは利用可能な場合に関連づけ、欠如をcandidate適用の前提不足にしない。案Aはalternativeも一律必須、案Bは条件・根拠を独立照合しalternativeは任意記録とする。 | context/condition/impact/counterexample/provenanceを個別欠落、condition外適用、alternativeなしの有効な条件付き例、代替ありの例を比較。 | universalization誤判定0を候補指標とする。failureの普遍禁止を作らず、固定親にない代替必須条件を加えない。 |
| `HELIXBRAIN-L2-012/029` — candidate/authority and unseen boundary | candidate recordと採否authority recordの分離、およびheld-out inputでunknownを保持 | BRAIN出力だけで採用済みにする変異、unit candidateを採択済みへ変える変異、別Domain組合せ/required input欠落を伏せて投入 | BRAIN単独の誤採択0を候補指標とし、oracle scope不明を未評価に保つ。追加actor・threshold・gateは設けない |

## Stage 2b Infrastructure候補値

本Stageの測定値は列挙field・境界の完全性と誤推定の検出候補で、性能SLA・新gateではない。候補結果を通常L3承認へまとめる。

| 親L2／測定項目 | 候補値・比較 | 根拠と測定入力 | 判定材料・限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-INFRA-001` — field・意味項目の完全性 | 列挙20初期Subdomainをfixtureで認識 (20/20 coverage候補)、追加candidate 1件は固定集合外でも保持 | `HELIXBRAIN-L2-INFRA-001`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-002` — field・意味項目の完全性 | 2つの階層例それぞれの明示node/edge/typeが全て追跡可能 (2/2 structure coverage候補) | `HELIXBRAIN-L2-INFRA-002`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-003` — field・意味項目の完全性 | descriptor 20/20 fieldが全てtrace可能またはunknownの理由付き | `HELIXBRAIN-L2-INFRA-003`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-004` — field・意味項目の完全性 | NFR特性10/10件をsource-to-pattern-to-inputへtrace可能またはunknown | `HELIXBRAIN-L2-INFRA-004`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-005` — field・意味項目の完全性 | 13/13 failure類型と6/6 oracle fieldを状態・source付きで観測可能 | `HELIXBRAIN-L2-INFRA-005`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-006` — field・意味項目の完全性 | 列挙Recovery Pattern候補10/10件を識別、実操作/実行完了claim 0 | `HELIXBRAIN-L2-INFRA-006`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-007` — field・意味項目の完全性 | deployment method 6/6件と6/6 比較特性をfixture上で保持、BRAIN実action 0 | `HELIXBRAIN-L2-INFRA-007`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-008` — field・意味項目の完全性 | 8/8 pattern kindと6/6 trigger/bottleneck/limit/state/sync/saturation attributesを確認 | `HELIXBRAIN-L2-INFRA-008`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-009` — field・意味項目の完全性 | 観測設計点11/11件をtraceし、実signal valueの保存0 | `HELIXBRAIN-L2-INFRA-009`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-010` — field・意味項目の完全性 | backup-only/restore-verified/required-conditionの3 evidence statesを区別し、targetはproduct sourceどおり | `HELIXBRAIN-L2-INFRA-010`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-011` — field・意味項目の完全性 | cost特性7/7件を比較可能、source/time欠落 priceを現在価格として表示0 | `HELIXBRAIN-L2-INFRA-011`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-012` — field・意味項目の完全性 | abstract identityとimplementation identityをfixtureごとに分離。4つのprovider例は例示で、網羅義務ではない | `HELIXBRAIN-L2-INFRA-012`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-013` — field・意味項目の完全性 | 列挙resource class 6件を同じ抽象モデルでfixtureで確認、credential/state/permissionの記録0件 | `HELIXBRAIN-L2-INFRA-013`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-014` — field・意味項目の完全性 | typed topology relation 9/9件をendpoint/meaning/sourceへtrace、unknown edgeを確定0 | `HELIXBRAIN-L2-INFRA-014`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-015` — field・意味項目の完全性 | cross-domain例4/4件はscope/sourceつきで保持、根拠のない因果claim 0件 | `HELIXBRAIN-L2-INFRA-015`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-016` — field・意味項目の完全性 | Anti-Pattern 11/11件のcondition/detection/alternative mapをfixtureで保持、普遍禁止への誤一般化0件 | `HELIXBRAIN-L2-INFRA-016`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |
| `HELIXBRAIN-L2-INFRA-017` — field・意味項目の完全性 | maturity value 6/6件をevidence/scope/versionに結び、単独成功による普遍mature化0件 | `HELIXBRAIN-L2-INFRA-017`が列挙する入力と保証を正常fixtureに含め、ひとつずつmissing/unknown/contradictory mutationする。 | 実resource/operation/price/RTO/RPO/telemetryの値は、要件ownerのsourceにある値だけを扱う。 |

## Stage 4 — connection候補の機能的NFR（未承認）

対象は固定PO revisionの7親 `HELIXBRAIN-L2-018/019/020/021/022/023/030`。Stage 1/2bと機構全体の完成を示さない。

本Stageでは性能SLAを新設せず、親L2/L11が明示するconnection field・source trace・owner/state境界の完全性を候補測定する。coverage 100%・誤結合/誤昇格0件は候補値であり、承認済み閾値・実測結果ではない。必要な技術値を上流未指定だけで禁止せず、当該scopeで不要な理由を記録する。

| 親L2／測定項目 | 候補値・比較 | 根拠と測定入力 | 判定材料・限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-018` — relation/状態の完全性 | required source・scope・version・owner relation coverage 100%、誤結合/誤昇格0件を候補とする。比較: 自由形式receiptは軽量だが境界欠落を隠す。typed relation coverageは監査しやすいがfield増加を伴うため候補。 | 入力はHELIX-HARNESS-CORE再利用候補intake固有のnormal/欠落/stale/held-out fixture。列挙されたsource, revision, extraction-vs-original, product-specific relation, receiver identityの5 relation coverage 100%とraw original受領/誤promotion 0件を候補値にする。親にない保持期限・削除証拠・erase receiptを追加要求しない。 | L10は実行出力の親指定field/state/ownerを照合する。測定未実施、候補値でありperformance SLAではない。 |
| `HELIXBRAIN-L2-019` — relation/状態の完全性 | required source・scope・version・owner relation coverage 100%、誤結合/誤昇格0件を候補とする。比較: 最初の一候補だけ返すと比較漏れを隠すため、複数候補のfield完全性を候補指標にする。 | 入力はProduct Core知識query固有のnormal/欠落/stale/held-out fixture。全11 response class (Pattern/Unit/Part, required input, conditions, alternative, relation, trade-off, constraint, counterexample, evidence, maturity, version)のtrace coverage 100%、根拠のない推薦/採用0件を候補値にする。 | L10は実行出力の親指定field/state/ownerを照合する。測定未実施、候補値でありperformance SLAではない。 |
| `HELIXBRAIN-L2-020` — relation/状態の完全性 | required source・scope・version・owner relation coverage 100%、誤結合/誤昇格0件を候補とする。比較: summary-onlyは小さいがfailure/unassessedを消す。個別relation測定は比較コストを増やすが欠落元を判別する。 | 入力はLABO評価結果の候補接続固有のnormal/欠落/stale/held-out fixture。8評価relation (target rev, candidate rev, scope, method, evidence, result, failure/counterexample, unassessed range)を完全traceし、対象不一致または部分評価からの誤昇格0件を候補値にする。INFRA-017はInfrastructure candidate maturityを扱うflowでのみ適用する。 | L10は実行出力の親指定field/state/ownerを照合する。測定未実施、候補値でありperformance SLAではない。 |
| `HELIXBRAIN-L2-021` — relation/状態の完全性 | required source・scope・version・owner relation coverage 100%、誤結合/誤昇格0件を候補とする。比較: 単一summary responseは軽量だが判断材料欠落を見えにくくするためfield単位のcoverageを候補化。 | 入力はINTELLIGENCE判断材料の受渡し固有のnormal/欠落/stale/held-out fixture。返却のknowledge identity/version/candidate/input/conditions/alternative/constraint/counterexample/evidence全field coverage、BRAIN mutation/runtime conclusion 0件を候補とする。 | L10は実行出力の親指定field/state/ownerを照合する。測定未実施、候補値でありperformance SLAではない。 |
| `HELIXBRAIN-L2-022` — relation/状態の完全性 | required source・scope・version・owner relation coverage 100%、誤結合/誤昇格0件を候補とする。比較: forward-only traceは受渡しには安価だが誤結合を見逃す。bidirectional traceはより強い出所確認を与えるため候補。 | 入力はrequired inputからHARNESS設計義務へのtrace固有のnormal/欠落/stale/held-out fixture。required input/dependencyからobligationへのforward edgeと逆edgeの完全性100%、orphan/wrong revision/product-value decisions 0件を候補にする。 | L10は実行出力の親指定field/state/ownerを照合する。測定未実施、候補値でありperformance SLAではない。 |
| `HELIXBRAIN-L2-023` — relation/状態の完全性 | required source・scope・version・owner relation coverage 100%、誤結合/誤昇格0件を候補とする。比較: UI-specific exact schemaは強いがBRAIN scopeを狭め過ぎる。generic field/relation traceとowner separationを候補とする。 | 通常の汎用知識query/返却（LABO receipt不要）と、別個の利用・評価結果（LABO provenance必須）を分けたnormal/欠落/stale/held-out fixture。generic/product-specific boundary fieldをtraceし、未評価のまま保持する結果と直接昇格の誤りを数える。 | L10は知識提供の受領contract、利用・評価結果のLABO edge、Product Core固有fieldの実出力を別々のoracleへ照合する。測定未実施、候補値でありperformance SLAではない。 |
| `HELIXBRAIN-L2-030` — relation/状態の完全性 | required source・scope・version・owner relation coverage 100%、誤結合/誤昇格0件を候補とする。比較: query受領のみを完了とみなす案は単純だが未充足義務を隠す。receipt/義務/設計完了を別stateで測る方式を候補とする。 | 入力はBRAIN knowledgeからHARNESSへの単一接続固有のnormal/欠落/stale/held-out fixture。常時必須4 contract groupと選択知識の全required field/relationについてforward/reverse trace coverage 100%、join-only/undefined-field acceptance/wrong scope/false completion 0件を候補とする。 | L10は実行出力の親指定field/state/ownerを照合する。測定未実施、候補値でありperformance SLAではない。 |

## 測定・承認境界

この表のcoverage/誤昇格0/誤帰属0/roundtrip完全性は親L2/L11の明示要素を漏れなく守る候補である。実測性能値の採否はテストfixtureとL4以降の実現可能性を踏まえ通常のL3承認へまとめて送る。個別parameter承認を要求しない。上流が指定する外部version/range/retention等があるときは当該source値を使い、新しい値を作らない。

## Stage 5候補値（BRAIN-024/025）

以下は親の明示する経路field・owner境界から導く候補measureであり、性能SLA、新しい昇格条件、承認gateではない。

| 親L2／測定項目 | 候補値・比較 | 根拠と測定入力 | 判定材料・限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-024` — flow separation | 案Aは二経路をsummary stateだけで測る。案Bは設計knowledge→CORE/HARNESSとRuntime→LABO→L2-020→BRAIN candidateを別traceにし、2/2 distinct identity/owner/scope/revision/receiptを確認。境界交差を検出できる案Bを選ぶ | 固定L2/L11の2種類の提供経路を別normal fixtureとして投入し、boundary receipt欠落・scope不一致を個別mutation | 経路crossing/直接Runtime flow 0を候補観測。runtime dataの中身や実利用価値は測らない |
| `HELIXBRAIN-L2-024` — direct boundary leakage | 案Aは全入力の合算leakage率、案Bはfield/方向ごとのdirect leakage件数0を測る。単一違反が合算に隠れない案Bを選ぶ | 各field/接続方向を個別と組合せでdeny/hold fixtureにする | secret/raw valueをfixture outputに表示せず、Runtime owner保持を確認。現行L2以上のsecurity mechanismは設計しない |
| `HELIXBRAIN-L2-025` — owner/state separation | 案Aは最終aggregate stateだけを測る。案Bはproposal/evaluation/registration/independent verification/adoptionの各段階を別owner/state/receiptで追跡する。段階飛越とowner混同を識別できる案Bを選ぶ | 完全sequenceと各receipt欠落/owner誤割当/対象revision不一致mutation | 段階飛越、owner混同0を候補観測。source/owner/state/trace照合に追加個数閾値を要しない。必要な別技術値は根拠・比較・測定付きで候補化する |
| `HELIXBRAIN-L2-025` — false promotion | 案Aは全否定条件をまとめたpromotion率、案BはAIのみ・単一実績のみ・LABOのみ・OS ticketのみ・文書存在のみを個別測定し、それぞれ誤遷移0を確認する。原因別に漏れを見つけられる案Bを選ぶ | 5種の単独根拠fixtureを個別投入、各入力にsource/revisionを保持 | 親が列挙する単独根拠の否定条件に基づく。別の実績件数や採択閾値は追加しない |
