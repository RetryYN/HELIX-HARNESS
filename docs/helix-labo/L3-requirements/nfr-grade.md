# HELIX-LABO L3 NFR候補 — Stage 1（001/011）

根拠付き技術候補。実測値・承認値・実装値ではない。旧NFRの値を継承せず、parameterごとのPO承認を新設しない。必要な技術値は根拠・比較・測定方法を同じL3/L10へ追補する。

| 項目 | 候補値・比較 | 根拠と測定 | 適用限界 |
|---|---|---|---|
| `HELIXLABO-L2-001` — observation field coverage | L2列挙20 fieldsを許可されたsourceごとに保持（20/20。未提供fieldは元source statusを変更せず、理由付きprocessing holdとして記録） | 親L2-001の明示listとL11。各field欠落や別source/revision挿入のmutationを確認。 | 旧4 source/5 metricsを使わず、接続source数もL2-021..030の有効契約に依存。 |
| `HELIXLABO-L2-001` — status coverage and fidelity | 7 source status labelsを区別し、unknown→successとnot_observed→successの変換を各0。LABOのprocessing hold/warningをsource statusとして生成しない | success/failure/rejected/cancelled/blocked/unknown/not_observedを個別投入。source stateとの突合。 | status severity/weight、dashboard update intervalは未指定。 |
| `HELIXLABO-L2-001` — source authority leakage | LABO→source canonical state writeback 0 | source authority/stateを別ownerのfixtureで照合。拒否/未許可情報の保持をsource正本に反映しない。 | 新しいdata classification/secret detectorは本要件外。 |
| `HELIXLABO-L2-011` — roundtrip reference completeness | episode candidateから元observation identity+source revisionへ全件往復可能 | L2-011/L11明示。source refをAggregate→Correlate→episode→sourceで往復してfield一致を観測。 | join key、time window、similarity scoreは未指定。 |
| `HELIXLABO-L2-011` — false causality | L2-011出力でのcausal assertion 0（evidenceの有無によらない） | 因果らしく見えるevidenceを含む入力と、時刻/pathだけの入力を別々に与える。correlation candidateは保持できてもL2-011出力でcausal labelを付けない。 | causal confidence threshold・相関algorithmは未指定。 |

20 field全件と部分一致を比較し、部分一致は出典欠落を隠すため全件照合候補を採る。statusは実在状態の忠実保持を候補にし、存在しない状態を件数合わせで生成しない。往復参照と片方向参照では後者が誤相関を隠すため往復参照候補を採る。

旧NFR起点は `LEGACY-ASSET-8CC5ABFC98C0D00183CA`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:1–73`、全文SHA `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3` と、`LEGACY-ASSET-DB669724249A14A665F0`、`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34,58–74`、全文SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`。測定・根拠・対の観測へ結ぶ形式を再導出し、IPA grade、memory/timeout/confidence値、旧承認・CIを移さない。現行5測定項目は固定LABO L2/L11のfield/status/owner/往復参照を根拠とする。


状態：未承認のL3/L10候補。対象はStage 2bの採択親 HELIXLABO-L2-002〜010のみ。固定L2/L11が要件authority、PO記録は親の採択登録、G0記録は実装順序だけを示す。本文は実装・実行・リリース許可や要件承認を生成しない。Stage 2bの親・case範囲、source disposition、固定根拠は[このcutoutの不変監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-review01-repair04-2026-10-05.json)に固定する。

## Stage 2b — 002/003/004/005 の技術候補（1.0、一括L3承認対象）

以下は固定L2/L11に結ぶ技術候補であり、測定値・承認値・実装値・SLAではない。値ごとのPO質問や追加gateを作らない。実operation許可・Worker資格/割当・業務成功の判断は含まない。親のmeaning/scope/owner/versionが変わる場合だけ該当L2へ戻す。

### Stage 2b technical candidates 002 003 004 005
| 対象 | 候補値・比較理由 | L10測定 | 適用限界 |
|---|---|---|---|
| `LABO-002-FR-01` episode trace coverage | 選択scopeで観測された固定L2列挙stage/event typeとrequirement/revision、責務、product、mechanism、worker、provider/model/configuration、artifact、environment、resultを保持し、観測fieldのsource identity/revision逆参照率100%。未発生stageを生成しない。一部fieldが欠けたときは100%を成功で埋めず欠測を数える。 | 固定source identityを使い、全field/全stage、各field単独missing、source revision conflict、partial episodeをfixture化。保持率と未完義務表示、逆参照結果をfield単位で比較。 | sourceに未観測の事実やeventを要求しない。因果率・時間窓・similarity閾値は作らない。 |
| `LABO-002-FR-01` orphan/false-correlation integrity | 相関不能eventの消失0、時刻/path近接だけに基づく因果assertion 0、元event更新0。成功率や因果スコアは定義しない。 | orphan正常、co-timed/co-path unrelated、relation訂正、元event before/after同一性を別fixtureで確認。 | correlation不能が意味する業務失敗を創作せずunknown/孤立を維持。 |
| `LABO-003-FR-01` decomposition fidelity | 親の9分類群を個別に表現できること（9/9 identity保持）。同一episodeに複数分類が共存し、分類不能/反証/欠測を別の未確定理由として保持。 | 9分類を混在入力し、各分類1つずつ欠落/誤結合/誤推測へ変異。source evidence/revisionと元meaningへのtrace、条件付き成功のscopeを検査。 | 分類の優劣・加重score・採用率は親にないため設けない。 |
| `LABO-004-FR-01` comparison-axis fidelity | 七軸 `purpose, structure, behavior, assumption, constraint, guarantee, cost` を各々保持（7/7）。部分一致/条件差を全体一致へ上げる割合0。 | 七軸を全て宣言した方式A/B、1軸差、条件差、元意味不明、candidateがauthority化するnegativeを別fixture化。 | 守破離をprovider rankや技法の一般評価にしない。一致閾値・similarity係数は未指定。 |
| `LABO-005-FR-01` operation candidate fidelity | 親の12 operation identityを個別に表現（12/12）。候補ごとに維持意味・変更意味・適用条件・scopeを持ち、明示根拠のない項目をunknownで残す。自動採択/実行/退役0。 | 12 operationを独立candidateとして用意し、意味field・条件・scopeを各1つずつ欠落/変更。新機構の追加件数/増加だけを改善目的にする要求、意味変更隠蔽、自動実施要求を別々の負fixture化。件数の減少を新たな最小化制約にはしない。 | 12 operationは候補表現の網羅性であり、実operation実施の義務や改善尺度ではない。 |
| 002–005 timing/volume profile（新規の測定設計候補。固定L2/旧sourceにtiming/volume profileの要求値やcohortはなく、列挙した工程・入力因子は観測可能性を比較するための提案であり要件値ではない） | 合成計画試行を入力件数×episode数×source数×evidence payload sizeの各条件で定め、ingestion/grouping/comparison/candidate generationの観測latencyをp50/p95、throughputをitems/second候補として分離記録する。固定閾値・容量上限・retention/SLAは置かない。 | 各条件の `N_planned` に対し試行の観測可否dispositionとoracle verdictを分離する。各planned trialのprimary dispositionは `valid / failed / missing / censored` の相互排他とし、理由を別fieldで保持する。`valid`は予定した観測を完了し判定材料が揃った意味で、oracleのpass/fail/unknownを別記録する。意図的なnegative fixtureが拒否され、その結果を観測できたものは `valid` かつoracle `pass`、要求を誤って通したものは `valid` かつoracle `fail`。測定器故障で信頼できる結果がないものを `failed`、予定runのreceipt/startがないものを `missing`、開始後に予定観測窓が終わり観測が打ち切られたものを `censored` とする。優先順は、予定対象scope/母集団自体が不明ならunknown（ゼロ件としない）、receipt/startなしはmissing、開始後の観測窓未完はcensored、完了した信頼できる判定結果はvalid、その他の測定機構故障はfailed。意図的な入力field欠落そのものはmissing dispositionではない。primary dispositionの合計=`N_planned`を確認し、latency p50/p95はvalid観測のみで算出し、`N_valid/N_planned`とoracle verdict別件数を併記。`N_valid=0`ならpercentileなし、`N_planned=0`ならcoverage比なし。throughputは信頼できるprocessed count/正の秒単位観測時間とし、`N_planned>0`かつ時間が正でcount=0なら真の0 items/second。時間欠測/0、またはvalid観測なしは算出不能。可観測性はoracle合格を意味しない。 | workload・性能閾値・比較cohortは親にないため、候補measurement protocolだけをL3一括承認対象とし、業務性能保証とみなさない。 |

**比較・測定の読み方**：完全field/identity traceはpartial traceより誤った成功補完を見つけられ、親の列挙fieldを直接照合できるため候補に選ぶ。欠測、失敗、打切を分母から外すとcoverageが過大に見えるため、計画試行母集団を固定して排他的なdispositionを報告する。observability dispositionとoracle pass/fail/unknownは別軸で報告する。個別候補値は根拠の明示と合成fixtureによる比較・測定を可能にするが、unknownが実ゼロやfailureへ置き換わること、未実行をpass扱いすることを認めない。旧Benchの固定category/metric/score/provider順位/hidden scorerを根拠や値として再利用しない。

## Stage 2b — HELIXLABO-L2-006/007/008/009/010 技術候補

以下は固定L2/L11の列挙field・状態を照合する測定候補であり、実測・承認・実装・SLA値ではない。通常の一括L3承認候補に含み、parameterごとのPO質問や追加gateを設けない。固定親の意味、scope、owner、versionは変えない。

| 対象 | 根拠付き候補 | 比較・測定方法 | 適用限界 |
|---|---|---|---|
| `HELIXLABO-L2-006` — 比較軸の完全性 | 固定L2の14 evaluation dimensions（quality、success/failure、false positive/negative、rework、speed、CI/Worker time、token/API cost、human intervention、context、complexity、recovery time、release lead time、ops load、cross-product reuse）を14別fieldで扱う | 同一宣言scope内で各dimensionのeligible/observed/valid/missing/not-applicable/incomparable/interrupted件数とevidence locatorを別集計する。oracleまたは宣言済み比較条件の必要品質を満たさずspeedが改善する場合も、品質違反とspeedを別に保持し、weighted scoreで相殺せず、評価可能な軸数だけでimprovementとしない。 | 14は固定親の列挙数で、業務成功数・重み・性能閾値ではない。 |
| `HELIXLABO-L2-006` — 比較identity | ticket、experiment、arm、oracle/条件、assignment、Worker result、target versionのlink完全性 | planned comparison arm数を分母にし、同一ticket/experiment/target版/条件/oracleへlinkできるarmと欠落理由を別集計する。片方のarmやsource identity欠落を分母から外さない。 | assignment/実行許可やWorker資格を測らず、OS/実行元sourceの真実をLABOが作らない。 |
| `HELIXLABO-L2-007` — six-condition evidence vector | 固定親の6条件（同条件再現性、機械判定可能性、oracle、bounded side effects、retry/rollback、idempotency）を条件ごとにsupported/contradicted/unknownで報告 | 同一candidate scope母集団を分母に各条件のevidence locatorと状態を記録し、欠測をunknownとして残す。平均scoreや全体合格閾値を置かない。 | system化率や資格付与の目標値にしない。 |
| `HELIXLABO-L2-007` — candidate/operation state | systemization candidateとoperation continuation candidate、限界・未確定条件を別状態で保持 | 計画candidate全数を母集団としてcandidate種別、観測stage、根拠・counterexample・unknownを記録する。段階ラベルから自動遷移を数えない。 | 新gate、promotion、承認、実operationを作らない。 |
| `HELIXLABO-L2-008` — 証拠とunfinished-duty保持 | current system version、owner-provided outcome、例外、FP、workaround/cost、guarantee、復帰条件、unfinished-dutyを別fieldで追跡 | 計画したreevaluation候補数を分母にfield別present/unknown/stale/conflict countとsource link、unfinished-duty identity retentionを報告する。continue/modify/fallbackの候補は別分類で数え、固定比率を設けない。 | fallback実行、system退役、永続system化を示さない。 |
| `HELIXLABO-L2-009` — 5 scope-level evidence matrix | single episode、repeated episodes、cross-project、cross-product、general structureの固定5段階 | 各scope claimについてsupport/counterexample/sample-condition/applicability-evidenceを段階別に列記し、根拠が支持する最大scopeとclaimのscopeを比較する。母集団は対象scope claim全数とし、unknown/sample不足も数に残す。 | 最小sample数・cross-product件数・generalization率は固定親から創作しない。 |
| `HELIXLABO-L2-010` — proposal field/action fidelity | 固定16 mandatory fieldsと8 valid `recommended_action` values | eligible target-specific proposalを分母にfieldごとのpresent/missing/conflict count、scope/evidence locator、action別valid/unknown countを報告する。8 actionすべてを正常fixtureで一件ずつ照合し、列挙外actionはunknownとして別negativeにする。 | proposal completenessはtarget変更・OS routing/registration・承認を意味しない。 |

### Stage 2b functional NFR identityとtrace

次のidentifierはL3のNFR gradeとL10の同名測定caseを結ぶ候補IDであり、実測済みを意味しない。NFR verification側のtraceは下表のcase IDを正本とする。

| NFR ID | 条件・母集団 | L10 case oracle |
|---|---|---|
| `NFR-LABO-002-01` | 許可scope内のepisode/event/status/fieldとsource identity/revisionを保持。planned event/fieldを分母にし、未観測eventはpartial、必須contract defectはfailureとして分ける。 | `L10-LABO-002-CASE-01`, `L10-LABO-002-CASE-02`, `L10-LABO-002-CASE-07`, `L10-LABO-002-CASE-09`, `L10-LABO-002-CASE-10`, `L10-LABO-002-CASE-11`, `L10-LABO-002-CASE-12`, `L10-LABO-002-CASE-15`, `L10-LABO-002-CASE-16`, `L10-LABO-002-CASE-17` |
| `NFR-LABO-002-02` | orphan、部分episode、未完義務、relation-only訂正、および近接だけの偽相関を別fixtureで照合する。 | `L10-LABO-002-CASE-03`, `L10-LABO-002-CASE-04`, `L10-LABO-002-CASE-05`, `L10-LABO-002-CASE-06`, `L10-LABO-002-CASE-08`, `L10-LABO-002-CASE-13`, `L10-LABO-002-CASE-14`, `L10-LABO-002-CASE-17` |
| `NFR-LABO-003-01` | 9分類と未完義務を独立保持。episode/source populationを分母に分類根拠・未完identityの保持を記録する。 | `L10-LABO-003-CASE-01`, `L10-LABO-003-CASE-09`, `L10-LABO-003-CASE-10` |
| `NFR-LABO-004-01` | 7比較軸と元意味を保持し、変換前にsourceを読む。 | `L10-LABO-004-CASE-01`, `L10-LABO-004-CASE-09`, `L10-LABO-004-CASE-10` |
| `NFR-LABO-005-01` | 12 operation候補、意味差、scope、条件、未完義務を保持する。 | `L10-LABO-005-CASE-01`, `L10-LABO-005-CASE-10`, `L10-LABO-005-CASE-12` |
| `NFR-LABO-006-01` | 14評価軸、failure/counterexample/applicability/cost/limitsを別fieldで保持。comparison armsをplanned母集団にする。 | `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-02`, `L10-LABO-006-CASE-11`, `L10-LABO-006-CASE-12`, `L10-LABO-006-CASE-14`, `L10-LABO-006-CASE-15`, `L10-LABO-006-CASE-16` |
| `NFR-LABO-006-02` | OS assignment、ticket、experiment、target revision、Worker resultのidentity linkをplanned armごとに照合する。 | `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-06`, `L10-LABO-006-CASE-07`, `L10-LABO-006-CASE-08`, `L10-LABO-006-CASE-09`, `L10-LABO-006-CASE-10`, `L10-LABO-006-CASE-13` |
| `NFR-LABO-007-01` | 六条件それぞれのsupported/contradicted/unknownとsource locator、systemization/operation両candidateを候補母集団ごとに記録する。 | `L10-LABO-007-CASE-01`, `L10-LABO-007-CASE-03`, `L10-LABO-007-CASE-04`, `L10-LABO-007-CASE-05`, `L10-LABO-007-CASE-06`, `L10-LABO-007-CASE-07`, `L10-LABO-007-CASE-08`, `L10-LABO-007-CASE-09`, `L10-LABO-007-CASE-14`, `L10-LABO-007-CASE-15`, `L10-LABO-007-CASE-17` |
| `NFR-LABO-007-02` | 段階label、operation continuation candidate、別途与えられた未完義務の有無、candidate誤表示を別々に照合し、systemization率を最大化目標にしない。 | `L10-LABO-007-CASE-01`, `L10-LABO-007-CASE-02`, `L10-LABO-007-CASE-09`, `L10-LABO-007-CASE-10`, `L10-LABO-007-CASE-11`, `L10-LABO-007-CASE-12`, `L10-LABO-007-CASE-13`, `L10-LABO-007-CASE-14`, `L10-LABO-007-CASE-16`, `L10-LABO-007-CASE-17`, `L10-LABO-007-CASE-18`, `L10-LABO-007-CASE-19` |
| `NFR-LABO-008-01` | continue/modify/fallback候補のsource、guarantee、unfinished duty、owner返却を候補ごとに記録する。 | `L10-LABO-008-CASE-01`, `L10-LABO-008-CASE-02`, `L10-LABO-008-CASE-03`, `L10-LABO-008-CASE-09`, `L10-LABO-008-CASE-10`, `L10-LABO-008-CASE-13`, `L10-LABO-008-CASE-14`, `L10-LABO-008-CASE-15`, `L10-LABO-008-CASE-16`, `L10-LABO-008-CASE-17` |
| `NFR-LABO-009-01` | 5 scope段階、support/counterexample/sample condition/applicability boundaryをclaim母集団ごとに記録する。 | `L10-LABO-009-CASE-01`, `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-07`, `L10-LABO-009-CASE-08`, `L10-LABO-009-CASE-09`, `L10-LABO-009-CASE-10`, `L10-LABO-009-CASE-11`, `L10-LABO-009-CASE-13`, `L10-LABO-009-CASE-14`, `L10-LABO-009-CASE-15`, `L10-LABO-009-CASE-16` |
| `NFR-LABO-010-01` | 16 field、8 valid action、target identity/responsibilityをproposal母集団ごとに照合する。 | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-03`, `L10-LABO-010-CASE-04`, `L10-LABO-010-CASE-05`, `L10-LABO-010-CASE-06`, `L10-LABO-010-CASE-07`, `L10-LABO-010-CASE-08`, `L10-LABO-010-CASE-09`, `L10-LABO-010-CASE-10`, `L10-LABO-010-CASE-11`, `L10-LABO-010-CASE-12`, `L10-LABO-010-CASE-13`, `L10-LABO-010-CASE-14`, `L10-LABO-010-CASE-15`, `L10-LABO-010-CASE-16`, `L10-LABO-010-CASE-17`, `L10-LABO-010-CASE-18`, `L10-LABO-010-CASE-24` |
| `NFR-LABO-010-02` | proposalからticket/registration/routing/authority change/placementを生成しない。 | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-19`, `L10-LABO-010-CASE-20`, `L10-LABO-010-CASE-21`, `L10-LABO-010-CASE-22`, `L10-LABO-010-CASE-23`, `L10-LABO-010-CASE-24`, `L10-LABO-010-CASE-25`, `L10-LABO-010-CASE-26`, `L10-LABO-010-CASE-27`, `L10-LABO-010-CASE-28` |

母集団を事前に宣言し、report dispositionは `valid / failed / missing / censored` を排他的に数え、合計がplanned件数に一致する候補とする。`valid`は観測と判定材料が完了した意味で、oracle pass/fail/unknownは別軸。`failed`は測定機構故障で信頼できる結果なし、`missing`はplanned runにreceipt/startなし、`censored`は開始後に予定観測窓が未完の状態。対象scope/母集団が不明な場合はunknownで、ゼロ件と仮定しない。missing/failed/censoredを有効成功へ変換しない。率は分母が0またはmissingなら算出値なしとし、割合へゼロを代入しない。時間計測が使える場合p50/p95はvalid時間標本のみでn_validとfailed/missing/censored件数を添える。n_valid=0なら分位値なし、実測自体がない場合だけ「未実測」と記載する。処理量は有効件数/明示された正の秒単位観測時間で `items/second` として記録し、時間が0/missingなら算出不能。これらは測定報告の候補であり、製品SLO/RTO、最低試行数、合格閾値を新設しない。

旧HELIX-Benchの固定5 category/12 metric、scorer、hidden oracle、team/provider ranking、fixed run protocol、price normalization、qualification/admissionは本親に由来しないため再利用しない。測定とfailureをevidenceへ結ぶ一般形式のみ旧sourceから再導出し、具体的な項目と個数は固定L2-006〜010の列挙に限定する。

## Stage 2a — 055/056/057 技術候補（1.0、L3一括承認用）

下記は根拠・比較・測定を添えた技術候補であり、実測/実装/承認値ではない。通常のL3承認packageで扱い、parameterごとのPO質問や追加gateを作らない。L2 meaning/scope/owner/versionを変えず、値の具体化や実測だけでL2へ戻さない。

| 対象 | 候補値 | 固定親を根拠とする比較・選択 | L10測定 |
|---|---|---|---|
| `LABO-055-FR-01` | task type × model classごとに `n_total`、source/revision単位の実在state label別count、`n_state_missing`、`n_evaluated`、`n_unassessed`、scope別eligible denominator、算入結果、missing/failure/refusal/stopped/unknown各dispositionと理由、計算規則、scorer/oracle identity+revision、source receiptを記録する。実在state label別count＋`n_state_missing`=`n_total`、label統合/脱落0。同じsource receiptから計算規則・集計根拠を再構成し、新state label/global portfolioを作らない。6つの独立変異（CASE-08〜13）を各々拒否し、未評価classから配置/選択/指定/割当/資格を生成しない。 | 固定055の水準・根拠・評価範囲とassessed/unassessedを保持しつつ、coverage stateのみを対応可能性水準の代用とする方式、全job一括成功率/全provider ordinal rankと比較し、L11:196の旧Bench portfolio・反復・confidence interval・accepted-change正規化を全work種別へ一律要求しない。水準の意味・尺度は新設しない。 | 0/1/複数件、source上実在するstate label、unknown、state missing、異なる宣言済みoracle結果をfixture化する。実在state label別count＋`n_state_missing`=`n_total`、label統合/脱落0、oracle結果水準と根拠の混同0、coverage stateを水準の代用とする方式との混同0を照合する。さらにscope別eligible denominator/disposition/receiptをCASE-07〜14で個別照合し、母集団/分母なしは算出値なし、missing costを0にしない。 |
| `LABO-056-FR-01` | 必須source identity/revision/scope/state/budget/deadline/evidence field保持率100%、変異0。五stateの区別保持100%、unknown/state coercion 0、oracle適用証拠なしのassessed promotion 0。budget/deadline欠落はfield不確実性として元recordへ保持し、result stateの変更・補完を0にする。評価者・評価時点・decision receiptをexact oracle/resultへ束縛し、source receiptを実runへ照合する。 | 固定056の列挙field/stateとL11の実績照合・oracle receipt条件を保存し、欠落をsuccess扱いまたはresult stateの変更/補完で埋める方式、および不一致receipt/別class・ticket・Worker revision/scoreによるscope・authority変更/stale Worker contract/verification・反例不足をassessedへ使う方式と比較する。元oracle/criteria自体の不足だけを元source ownerへ戻し、receiptや結果の別不整合を新ownerへ移さない。 | budget/deadlineを含む各必須fieldを一つずつ欠落/変更し、field不確実性を保持してresult state変更・補完0を照合する。oracle identity/revision/scope/evidence/evaluator/time/receiptとrun照合を個別変異し、CASE-16〜CASE-24を照合する。scoreによるscope/authority変更0、失敗/不一致のunassessedへの書換え0を測る。元oracle/criteria不足だけを元source ownerへ戻す。 |
| `LABO-057-FR-01` | source/receiptの必須field差0、same source identity/ID retry時の重複observation 0（観測1件）、stale受領0。LABO receiptと後続履歴化先を対応づける。 | 固定057のidentity/revision/scope保持、ack/trace/dedupe/stale-stop/same-ID retry、receipt返却と履歴化先から導出する。CONNECTと明示human receiptは同一義務を果たす代替方式とし、両方の存在は要求しない。 | 正常受領・ack消失・same-ID retry・遅延duplicate、片方式だけのabsent/unknownと他方式の有効receipt、および両方式とも有効証拠なし（CASE-25）を別fixtureにする。source/delivery mismatchはOS、send/receive receipt mismatchはOS/LABOへ戻し、deliveryから評価昇格/assignmentを拒否する。 |
| 055/056/057 timing and volume | payload size・group数・履歴件数の各条件組合せごとに計画試行母集団を定め、ingestion latencyのp50/p95とthroughput候補を別々に記録する。固定閾値・容量上限・保持期間・SLAは置かない。 | 固定親にworkload限度やSLAはない。旧Benchはfailure/missingを分母から捨てないため、各試行を `valid / failed / missing / censored` の排他的状態へ分けて母集団全体を記録する。新しいtransport要求は作らない。 | 各条件の `N_planned` を分母に `N_valid, N_failed, N_missing, N_censored` を別々に数え、合計と母集団一致を確認する。p50/p95はvalid latencyだけから算出し `N_valid/N_planned` も併記。`N_valid=0`ならpercentileは算出値なし。`N_valid/N_planned`は`N_planned=0`で算出値なしとし、`N_planned>0`かつ`N_valid=0`なら0の割合と失敗等の件数を併記する。throughputは有効処理件数を明示的な測定時間（seconds）で割り `items/second` として独立記録し、`N_planned=0`または測定時間が0/missingなら算出値なしとする。 |

100%/0は状態・identityの不変性、誤った昇格や重複生成を測る候補で、business success rate・性能SLA・資格基準ではない。実operationのeligibilityやSLAを固定親の既存source契約と混同しない。採用oracleのownerが未定でも候補測定とL3起草は進める。意味・scope・owner・versionの変更が必要な場合だけ該当L2へ戻す。


## Stage 4 — 技術候補 HELIXLABO-L2-036/037/038/039/040/041/052/054

以下は親の列挙条件を合成fixture上で測定する候補であり、実測・承認・実装値、SLA、性能保証ではない。値ごとのPO確認や追加gateを作らない。

| 対象 | 根拠付き測定候補 | 比較・判定方法 | 限界 |
|---|---|---|---|
| 036–041 Feedback identity/owner fidelity | planned candidate populationに対する対象identity、source revision、scope、既存recipient一致数とmissing/unknown/mismatch数を個別記録する。| exact selected-target bindingとtarget名だけの曖昧照合を比較し、親で列挙されたsource/target tupleごとの誤routeとunknownを数える。期待は正しい候補だけを該当recipientへ束縛し、不明を推測しないこと。| 業務成果率、最小標本、target選択順位は定めない。040/041は選択された上流scopeだけを母集団にし、未選択scopeを不成立に数えない。|
| 036–041 authority/operation separation | 各親の非許可作用（直接編集、ticket/state操作、authority変更、Worker操作、contract変更、generic化）の独立fixtureを母集団として各誤作用件数を別々に記録する。| operation/candidate/authorityを一つにまとめる方式と個別状態を保持する方式を比較し、親が禁じる作用が候補から生成されないことを照合する。| これらはoracle上の不成立条件であり、実環境での運転値・安全閾値を主張しない。|
| 052 revision/scope/state lineage | planned source-to-receipt traceごとにrevision、適用scope、評価/未評価状態の一致・欠測・不一致を分ける。| 035 payloadと同一revision/scope/stateのreceiptを照合し、別revision/scopeや状態変換を独立変異で計数する。| schemaや受領SLAを追加せず、INTELLIGENCE判断成功を測らない。|
| 054 waterline/evidence fidelity | planned selected work-kind/model-class packetごとに水準、根拠、適用範囲、未評価状態の保持/unknown/mismatchを記録する。| 055出力のexact tuple保持と、別classへの流用・未評価の実績化を比較する。未知classをunknownとして保つ。| 055の生成品質、INTELLIGENCE配置精度、OS割当成果を新たに評価しない。|

率を報告する場合は事前宣言したeligible planned populationを分母とし、母集団不明はunknown、分母0/missingは算出値なしとする。missing、failure、censored、not-applicable、unknownは区別し、分母から落とさない。性能percentileや最低試行数、fixed thresholdは親・旧sourceに根拠がないため設定しない。候補の数値が必要になる場合は根拠、比較案、測定方法を添えて提案し、実測なしを未測定と記録する。
