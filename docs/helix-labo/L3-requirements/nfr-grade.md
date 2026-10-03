# HELIX-LABO L3 非機能要件・候補値（部分草稿）

**状態：部分草稿・未承認。** 下表は上流のfield/status/境界を測定可能にする候補値と比較観点である。完全coverage、誤昇格/誤帰属0等の候補は親の明示条件に基づき、L2が指定した性能SLAだとは扱わない。旧HELIXの数値を自動継承せず、測定不能/未観測を成功扱いしない。

| 項目 | 候補値・比較 | 根拠と測定 | 代替・未確定範囲 |
|---|---|---|---|
| `HELIXLABO-L2-001` — observation field coverage | L2列挙20 fieldsを許可されたsourceごとに保持（20/20。未提供fieldは欠落/unknownとして記録） | 親L2-001の明示listとL11。各field欠落や別source/revision挿入のmutationを確認。 | 旧4 source/5 metricsを使わず、接続source数もL2-021..030の有効契約に依存。 |
| `HELIXLABO-L2-001` — status coverage and fidelity | 7 status labelsを区別し、unknown/not_observed→success変換0 | success/failure/rejected/cancelled/blocked/unknown/not_observedを個別投入。source stateとの突合。 | status severity/weight、dashboard update intervalは未指定。 |
| `HELIXLABO-L2-001` — source authority leakage | LABO→source canonical state writeback 0 | source authority/stateを別ownerのfixtureで照合。拒否/未許可情報の保持をsource正本に反映しない。 | 新しいdata classification/secret detectorは本要件外。 |
| `HELIXLABO-L2-011` — roundtrip reference completeness | episode candidateから元observation identity+source revisionへ全件往復可能 | L2-011/L11明示。source refをAggregate→Correlate→episode→sourceで往復してfield一致を観測。 | join key、time window、similarity scoreは未指定。 |
| `HELIXLABO-L2-011` — false causality | 時刻/pathのみを根拠にしたcausal assertion 0 | co-timed/co-located unrelated event pairsを与える。correlation candidateは保持できてもcausal labelを付けない。 | causal confidence threshold・相関algorithmは未指定。 |
| `HELIXLABO-L2-055` — 各宣言metric/scopeについてdenominator、算入・除外結果、理由、scorer revisionを再構成できるtrace completeness 100%候補 | 各宣言metric/scopeについてdenominator、算入・除外結果、理由、scorer revisionを再構成できるtrace completeness 100%候補 / missing/failure/unknownの理由なき除外0、unassessed classの誤昇格0、配置/割当/authority生成0。 | L2-055/L11-055はeligible denominatorと各disposition/reasonおよびscorer revisionを明示し、未評価classも表示する。標本数、重み付け、信頼区間、固定cutoffは現scopeに指定がなく、全task class共通条件にはしない。別の評価判断が特定の必要数を要すると分かった場合はtask/model/scope別に根拠・比較・測定案をL3候補として示す。 | 親にない値が別途必要ならscope単位で根拠付き候補比較を提示。旧尺度を移さない。 |
| `HELIXLABO-L2-056` — 列挙されたfirst-result provenance input全field coverage 100%候補。結果statusとsource/revisionの対応を全件保持。 | 列挙されたfirst-result provenance input全field coverage 100%候補。結果statusとsource/revisionの対応を全件保持。 / 取込successだけによる評価済み/qualified誤昇格0; unknown/failure/rejection/interruptionのsuccess coercion 0。 | L2-056/L11-056は入力field群とobserved≠evaluatedを明示。単発結果の取込品質をsource stateとの正確なprovenanceで測定し、標本数自体を結果取込の成功条件にしない。評価側に必要標本数があればtask/model/scope限定の根拠・比較・測定候補を示せる。 | 親にない値が別途必要ならscope単位で根拠付き候補比較を提示。旧尺度を移さない。 |
| `HELIXLABO-L2-057` — same identity/source/revision/scope/status/receipt field consistency 100%候補 between source payload and accepted receipt. | same identity/source/revision/scope/status/receipt field consistency 100%候補 between source payload and accepted receipt. / same-ID retryからduplicate observation 0; absent ack/receiptからreceived success claim 0; stale-as-current insertion 0. | L2-057/L11-057はack/trace/dedup/stale-stop/same-ID retry/unfinished obligationを明示。field一致と再送冪等性が親条件の直接測定候補。delivery acceptanceが生産する結果評価を増やさない。 | 親にない値が別途必要ならscope単位で根拠付き候補比較を提示。旧尺度を移さない。 |

## 測定・承認境界

この表のcoverage/誤昇格0/誤帰属0/roundtrip完全性は親L2/L11の明示要素を漏れなく守る候補である。実測性能値の採否はテストfixtureとL4以降の実現可能性を踏まえ通常のL3承認へまとめて送る。個別parameter承認を要求しない。上流が指定する外部version/range/retention等があるときは当該source値を使い、新しい値を作らない。
