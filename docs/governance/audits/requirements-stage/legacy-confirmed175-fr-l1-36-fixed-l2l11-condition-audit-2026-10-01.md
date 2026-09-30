# confirmed175 FR-L1-36 固定L2/L11条件照合（2026-10-01）

旧functional-requirementsのsource-qualified identity `harness/L1-requirements/functional-requirements.md::FR-L1-36`を、旧L3/L5/L6 consumerとPO固定f6 L2/L11へ照合したread-only静的監査。基準mainは`a3eae9cb8bdd2f57d7a79b8efa4910841d49f202`、固定pair revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。旧source rowはline 67、asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`。source row SHA-256は`1d2f72f5d9c26e4bbdbb23a1ffd93cec22c82c117343c4f1b1e01692a0d00139`。

既存confirmed175 queueはこのidentityを`not_individually_compared`、evidenceなしとしていた。full audit上のcarryは`preserved_pending_rehome`、successor IDなし。今回の条件照合も旧要求の意味変更・retire・後継割当・closureを行わない。FR-L1-19は同じ旧source file / asset snapshotにある別source-qualified identityであり、そのlearning/recipe条件は本監査へ混ぜていない。全pinと57/11/live26 decision compact indexは[JSON](legacy-confirmed175-fr-l1-36-fixed-l2l11-condition-audit-2026-10-01.json)に記録した。

## 旧要求とconsumer

FR-L1-36はskillごとのrating / adoption / success / unused projectionを要求する。入力は`skill_invocations.accepted=1`、`plan_registry.status`、`asOf`。出力は`skill_evaluations` rowの`skill_rating`（0.0–1.0）、`adoption_count`、`success_count`、`unused_flag`。cold-startは0 rows、30日以内に発火がなければunused、削除は人手のみである。

旧L3 consumer（`business-detail.md:182–198`）はskill別に採用PLANと成功PLANを集計し、全5 PLAN成功の例をrating=1.0・維持表示へ結び、30日採用ゼロを警告／廃止候補へ結ぶ。削除は人間専属とする。unused窓についてL1は「発火なし」、L3例は「採用PLANなし」、L6は「invocationなし」と記す。これらの人口・分母を同一だと仮定せず、それぞれsource consumer条件として保持する。旧L6 `function-spec.md:276`は`skill_rating = success_count / adoption_count`、success stateを`confirmed`/`completed`、`asOf`から30日以内にinvocationなしならunused=1、cold-startはthrowせず0 rows、自動削除禁止／human-onlyを明記する。旧L5 `physical-data.md:249,269–270`は`skill_invocations` identityとaccepted field、別個のfiring/acceptance rateを定義する。これらの別metricをFR-L1-36のrating式と同一視しない。screen consumerはL1 row metadataのHM-05と旧L3 HM-08表示例の双方を歴史的記録として残し、表記差を現行screen要求へ統合しない。

## f6固定pair

PO固定f6のHELIX-LABO L2/L11で近接するpairは次の3件。固定対象の採択pairを再判断せず、既存の本文・L11条件を個別に比較した。

| 固定pair | 保持される限定的意味 | FR-L1-36に対する残差 |
|---|---|---|
| `HELIXLABO-L2-001` / 同ID L11 | 許可観測のprovenance/revision、成功・失敗・拒否・取消・停止・不明・未観測の区別、source側authority保持 | accepted invocationとplan statusのskill単位join、adoption/success count、rating式、cold-start row動作、30日unused、削除境界はない |
| `HELIXLABO-L2-050` / 同ID L11 | Feedbackからtarget変更、検証、運用、再観測までを追う改善循環。変更後評価がなければ未完で、target authorityはownerに残る | skill別metrics projectionではなく、FR36の集計・score・unused・cold-start・human-only deletionを定義しない |
| `HELIXLABO-L2-055` / 同ID L11 | Worker履歴を作業種別・model class単位で評価範囲・根拠・未評価状態とともに扱い、未知task成功を保証せず配置/割当て/権限を変更しない | 評価grainはWorker/model classで、per-skill adoption/successではない。0–1 rating、30日firing window、cold-start、削除境界はない |

L2-001の一般観測契約は、skillごとの計数やFR36 success oracleの代わりにならない。L2-050の改善循環もprojection metricではない。L2-055の「水準」は能力範囲の根拠付き評価で、skill rating 0.0–1.0へ換算できない。固定L2/L11にFR36の全条件を備えた対があるとは確認できなかった。

## 条件ごとの照合

| 旧FR-L1-36条件 | 固定f6 L2/L11で確認できる範囲 | 未確認条件 |
|---|---|---|
| 入力`accepted=1` invocation、`plan_registry.status`、`asOf` | L2-001は許可観測をprovenance付きで集積。 | skill ID単位join、statusの採用判定、asOf計算契約なし |
| `adoption_count` | L2-001はsource状態を分けて保持。 | skillごとの分母、accepted invocationの集約・重複規則なし |
| `success_count` | L2-001は結果stateを分ける。 | 旧L6 `confirmed`/`completed` success oracleやskill別成功PLAN数なし |
| `skill_rating` 0.0–1.0 | L2-055はtask/model class別の能力水準・根拠・scopeを出す。 | `success_count / adoption_count`や同等のskill scoreなし。055の水準とratingは別の意味 |
| cold-startは0 rows | L2-001はsource欠落/未観測をsuccessへ変えない。 | `skill_evaluations` empty projectionの0-row/no-throw contractなし |
| 30日以内発火なしでunused | L2-001/050/055にskill firing日時・30日windowなし。 | `asOf`を基準にしたunused判定なし |
| 削除は人手のみ | target authorityをownerへ残すL2-050の一般境界。 | Skill retirement/deletion権限のhuman-only条件なし |
| projectionと表示例 | L2/L11はobservation、改善循環、Bench水準を定義。 | `skill_evaluations` projection / HM表示 / 廃止候補表示なし |

## 後発採択pair proximity screen

57候補、11候補、live26の各PO decision記録にある明示identity indexをJSONへ全件固定し、評価・学習に意味が近い採択pairだけを個別にscreenした。57候補からはLABO-063（repair知見）、065（First Attempt）、066（misrepair）、067（Attempt内repair rounds）、live26からはLABO-070（scope付きtelemetry/scorecard）、071（task-class model qualification）を近接または隣接として比較した。065/067はdecisionで条件付き採択であり、記載された限定条件を越えない。57/11/live26の判断対象にない近接pairを補わない。

これらはrepairやWorker/model性能に関する観測材料であり、per-skill採用数・成功数の計算式、0–1 skill rating、30日unused window、cold-start 0-row、human-only deletion境界を定めない。decision row、registration IDとauthority effect、候補/L11 semantic digest、registration record SHAはJSONの`later_po_decisions.near_pairs`にpinした。decision/MPRの登録は対象candidateの登録証拠であり、旧FR-L1-36の後継割当ではない。

## 結論と限界

旧要求のrating、skill別採用・成功数、成功状態、cold-start、30日unused、human-only deletion、projection/display条件は`preserved_pending_rehome`のまま。現行f6 fixed pairは観測・改善循環・Worker/model class水準の限定的意味を持つが、FR-L1-36全条件の移管・代替・後継ではない。authority effectは`none`、formal successor assignmentsは0、closure claimはfalse。

旧CLI、runtime、hook、test、CIを実行していない。採択・実装・受入・要求段階完了を主張しない。
