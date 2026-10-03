# HELIX-BRAIN L3 非機能要件・候補値（部分草稿）

**状態：部分草稿・未承認。** 下表は上流のfield/status/境界を測定可能にする候補値と比較観点である。完全coverage、誤昇格/誤帰属0等の候補は親の明示条件に基づき、L2が指定した性能SLAだとは扱わない。旧HELIXの数値を自動継承せず、測定不能/未観測を成功扱いしない。

| 項目 | 候補値・比較 | 根拠と測定 | 代替・未確定範囲 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` — 必須由来field coverage | required fieldsは全件解決可能（8/8: source, provenance, evidence, adopted reason, evaluated scope, counterexample, limitation, LABO target revision） | 親L2-007の必須inputとL11に列挙。各fieldのmissing/stale/wrong revision mutationでaccepted/mature誤昇格0を観測。 | 旧memory実装の65件/byte上限を候補にしない。 |
| `HELIXBRAIN-L2-007` — 誤昇格率 | AI生成のみまたは実績一件だけによるaccepted/mature遷移0 | L2-007/L11が明示する否定条件。promotion stateとowner別stateをsystem evidenceで照合。 | 必要な実績件数や独立verifier人数は上流にないため未指定。 |
| `HELIXBRAIN-L2-008` — lifecycle state識別 | 5個のL2列挙stateを全て別値として識別 | current/superseded/deprecated/experimental/retiredを1つずつ与え、consumer参照と保存stateを照合。 | 新state、semver grammar、transition SLAは未指定。 |
| `HELIXBRAIN-L2-008` — silent replacement | supersession後のexisting consumer exact revisionのsilent rewrite 0 | 親L2/L11のexact版追跡要求。RからR2へのsupersession中もconsumer referenceをRのまま観測。 | 履歴保存方式・保持期間は候補値にしない。 |
| `HELIXBRAIN-L2-028` — compatibility match | HARNESS宣言range内だけを適用可能、outside/unknown/mismatchは適用不可またはunknown | L2-028/L11にあるdescriptor fieldとrange条件。境界値はrangeの指定syntaxをHARNESS contractから取得し、内側・外側・未定義を比較。 | semver comparator、range syntax、fallbackはHARNESS側が定義するまで未指定。 |
| `HELIXBRAIN-L2-028` — cross-axis confusion | descriptor/knowledge revisionの相互代入による誤受理0 | descriptor field群とBRAIN identity/revision/version/stateを個別変異し、応答fieldを観測。 | 独自schema・digest/timeoutは未指定。 |

## Stage 2b候補値（機能意味の完全性・境界）

以下は親L2の列挙fieldと明示した境界から導くmeasurement候補であり、POが指定した性能SLAや新しい承認条件ではない。分母はfixtureへ投入した該当要素とする。

| 親L2／測定項目 | 候補値・比較 | 根拠と測定入力 | 判定材料・限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-001/002` — domain/structure completeness | 各提示候補のidentity・meaning・stateと4階層kind/parent relationが全項目解決する候補 | L2で明示したdomain候補・階層を分母とし、unknown/重複/参照喪失を個別投入 | 候補・参照保持・戻し先を照合。列挙集合全fieldのcoverageを測るが、新domain充実義務は置かない |
| `HELIXBRAIN-L2-003/004` — descriptor/comparison completeness | 親L2が列挙したapplicability fieldsを候補ごとに識別し、未充足をunknownとする候補 | 必須field欠落、required input unknown、比較scope/weight欠落を変異 | applicable/unknown/holdの誤判定を記録。新しい選択順位や比較weightは作らない |
| `HELIXBRAIN-L2-005/009` — typed relation trace | 出力relationのendpoint/type/meaning/sourceを提示したedgeごとに追跡 | cross-domain edge、似た名称のみ、欠落endpoint、候補構成からsource unitを削除 | sourceなしedge誤確定0を候補指標とし、relation/candidateのtrace有無を確認 |
| `HELIXBRAIN-L2-006/011` — reuse boundary | 各候補のshared/product-specific fieldをsourceまで分類できる候補 | Product Core固有screen/flow/token混入、source contextを外す変異 | 分離できない候補は保留。誤一般化0を候補値として比較・計測 |
| `HELIXBRAIN-L2-010` — conditional failure knowledge | failure context・condition・impact・alternative・provenanceをすべて識別する候補 | context削除、condition外への適用、代替根拠欠落 | universalization誤判定0を候補指標とする。failureの普遍禁止を作らない |
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

## 測定・承認境界

この表のcoverage/誤昇格0/誤帰属0/roundtrip完全性は親L2/L11の明示要素を漏れなく守る候補である。実測性能値の採否はテストfixtureとL4以降の実現可能性を踏まえ通常のL3承認へまとめて送る。個別parameter承認を要求しない。上流が指定する外部version/range/retention等があるときは当該source値を使い、新しい値を作らない。
