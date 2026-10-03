# HELIX-LABO L3 非機能要件・候補値（部分草稿）

**状態：部分草稿・未承認。** 下表は上流のfield/status/境界を測定可能にする候補値と比較観点である。完全coverage、誤昇格/誤帰属0等の候補は親の明示条件に基づき、L2が指定した性能SLAだとは扱わない。旧HELIXの数値を自動継承せず、測定不能/未観測を成功扱いしない。

| 項目 | 候補値・比較 | 根拠と測定 | 代替・未確定範囲 |
|---|---|---|---|
| `HELIXLABO-L2-001` — observation field coverage | L2列挙20 fieldsを許可されたsourceごとに保持（20/20。未提供fieldは欠落/unknownとして記録） | 親L2-001の明示listとL11。各field欠落や別source/revision挿入のmutationを確認。 | 旧4 source/5 metricsを使わず、接続source数もL2-021..030の有効契約に依存。 |
| `HELIXLABO-L2-001` — status coverage and fidelity | 7 status labelsを区別し、unknown/not_observed→success変換0 | success/failure/rejected/cancelled/blocked/unknown/not_observedを個別投入。source stateとの突合。 | status severity/weight、dashboard update intervalは未指定。 |
| `HELIXLABO-L2-001` — source authority leakage | LABO→source canonical state writeback 0 | source authority/stateを別ownerのfixtureで照合。拒否/未許可情報の保持をsource正本に反映しない。 | 新しいdata classification/secret detectorは本要件外。 |
| `HELIXLABO-L2-011` — roundtrip reference completeness | episode candidateから元observation identity+source revisionへ全件往復可能 | L2-011/L11明示。source refをAggregate→Correlate→episode→sourceで往復してfield一致を観測。 | join key、time window、similarity scoreは未指定。 |
| `HELIXLABO-L2-011` — false causality | 時刻/pathのみを根拠にしたcausal assertion 0 | co-timed/co-located unrelated event pairsを与える。correlation candidateは保持できてもcausal labelを付けない。 | causal confidence threshold・相関algorithmは未指定。 |

## 測定・承認境界

この表のcoverage/誤昇格0/誤帰属0/roundtrip完全性は親L2/L11の明示要素を漏れなく守る候補である。実測性能値の採否はテストfixtureとL4以降の実現可能性を踏まえ通常のL3承認へまとめて送る。個別parameter承認を要求しない。上流が指定する外部version/range/retention等があるときは当該source値を使い、新しい値を作らない。
