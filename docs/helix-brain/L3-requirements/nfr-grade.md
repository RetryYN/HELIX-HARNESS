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

## 測定・承認境界

この表のcoverage/誤昇格0/誤帰属0/roundtrip完全性は親L2/L11の明示要素を漏れなく守る候補である。実測性能値の採否はテストfixtureとL4以降の実現可能性を踏まえ通常のL3承認へまとめて送る。個別parameter承認を要求しない。上流が指定する外部version/range/retention等があるときは当該source値を使い、新しい値を作らない。
