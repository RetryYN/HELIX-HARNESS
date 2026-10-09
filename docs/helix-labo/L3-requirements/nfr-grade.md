# HELIX-LABO L3 NFR候補

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


状態：承認済みのL3/L10。対象はStage 2bの採択親 HELIXLABO-L2-002〜010のみ。固定L2/L11が要件authority、PO記録は親の採択登録、G0記録は実装順序だけを示す。本文は実装・実行・リリース許可や要件承認を生成しない。Stage 2bの親・case範囲、source disposition、固定根拠は[このcutoutの不変監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-review01-repair04-2026-10-05.json)に固定する。

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

以下は固定L2/L11の列挙field・状態を照合する測定候補であり、実測・承認・実装・SLA値ではない。承認済みの一括L3に含み、parameterごとのPO質問や追加gateを設けない。固定親の意味、scope、owner、versionは変えない。

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
| 036–041 Feedback identity/owner fidelity | 各親の具体baseline/held-out fixtureとL10のidentity/revision/scope/connector欠落CASEからなるplanned candidate populationに対し、対象identity、source revision、scope、既存recipient一致数とmissing/unknown/mismatch数を個別記録する。| exact selected-target bindingとtarget名だけの曖昧照合を比較し、親で列挙されたsource/target tupleごとの誤routeとunknownを数える。期待は正しい候補だけを該当recipientへ束縛し、不明を推測しないこと。| 業務成果率、最小標本、target選択順位は定めない。040/041は選択された上流scopeだけを母集団にし、未選択scopeを不成立に数えない。|
| 036–041 authority/operation separation | `L10-LABO-036-CASE-01`, `L10-LABO-036-CASE-02`, `L10-LABO-036-CASE-03`, `L10-LABO-036-CASE-04`, `L10-LABO-036-CASE-05`, `L10-LABO-036-CASE-06`, `L10-LABO-036-CASE-07`, `L10-LABO-036-CASE-09`, `L10-LABO-036-CASE-10`, `L10-LABO-036-CASE-11`, `L10-LABO-036-CASE-12`, `L10-LABO-037-CASE-01`, `L10-LABO-037-CASE-02`, `L10-LABO-037-CASE-03`, `L10-LABO-037-CASE-04`, `L10-LABO-037-CASE-05`, `L10-LABO-037-CASE-06`, `L10-LABO-037-CASE-07`, `L10-LABO-037-CASE-08`, `L10-LABO-037-CASE-09`, `L10-LABO-037-CASE-10`, `L10-LABO-037-CASE-11`, `L10-LABO-037-CASE-12`, `L10-LABO-037-CASE-13`, `L10-LABO-037-CASE-14`, `L10-LABO-038-CASE-01`, `L10-LABO-038-CASE-02`, `L10-LABO-038-CASE-03`, `L10-LABO-038-CASE-04`, `L10-LABO-038-CASE-05`, `L10-LABO-038-CASE-06`, `L10-LABO-038-CASE-07`, `L10-LABO-038-CASE-08`, `L10-LABO-038-CASE-09`, `L10-LABO-038-CASE-10`, `L10-LABO-039-CASE-01`, `L10-LABO-039-CASE-02`, `L10-LABO-039-CASE-03`, `L10-LABO-039-CASE-04`, `L10-LABO-039-CASE-05`, `L10-LABO-039-CASE-06`, `L10-LABO-039-CASE-07`, `L10-LABO-039-CASE-08`, `L10-LABO-039-CASE-09`, `L10-LABO-039-CASE-10`, `L10-LABO-039-CASE-11`, `L10-LABO-040-CASE-01`, `L10-LABO-040-CASE-02`, `L10-LABO-040-CASE-03`, `L10-LABO-040-CASE-04`, `L10-LABO-040-CASE-05`, `L10-LABO-040-CASE-06`, `L10-LABO-040-CASE-07`, `L10-LABO-040-CASE-08`, `L10-LABO-040-CASE-10`, `L10-LABO-040-CASE-11`, `L10-LABO-040-CASE-12`, `L10-LABO-040-CASE-13`, `L10-LABO-041-CASE-01`, `L10-LABO-041-CASE-02`, `L10-LABO-041-CASE-03`, `L10-LABO-041-CASE-04`, `L10-LABO-041-CASE-05`, `L10-LABO-041-CASE-06`, `L10-LABO-041-CASE-07`, `L10-LABO-041-CASE-08`, `L10-LABO-041-CASE-09`, `L10-LABO-041-CASE-10`, `L10-LABO-041-CASE-11`を母集団として各誤作用件数を別々に記録する。 | operation/candidate/authorityを分け、固有connector、全体完了、未完義務、restricted-data通常packet/evidence禁止を個別照合する。 | oracle上の不成立条件であり、実環境値・安全閾値は主張しない。 |
| 052 revision/scope/state lineage | planned source-to-receipt traceごとにsource identity/revision、適用scope、評価/未評価状態、receiptの一致・欠測・不一致を分ける。| 035 payloadと同一revision/scope/stateのreceiptを照合し、別revision/scopeや状態変換を独立変異で計数する。| schemaや受領SLAを追加せず、INTELLIGENCE判断成功を測らない。|
| 054 waterline/evidence fidelity | planned selected work-kind/model-class packetごとに水準、根拠、適用範囲、未評価状態の保持/unknown/mismatchとscope欠落を記録する。| 055出力のexact tuple保持と、別classへの流用・未評価の実績化、unknown job成功保証、scoreによるscope/branch/merge authority変更を比較する。未知classをunknownとして保つ。| 055の生成品質、INTELLIGENCE配置精度、OS割当成果を新たに評価しない。|

率を報告する場合は事前宣言したeligible planned populationを分母とし、母集団不明はunknown、分母0/missingは算出値なしとする。missing、failure、censored、not-applicable、unknownは区別し、分母から落とさない。性能percentileや最低試行数、fixed thresholdは親・旧sourceに根拠がないため設定しない。候補の数値が必要になる場合は根拠、比較案、測定方法を添えて提案し、実測なしを未測定と記録する。

## Stage 2b — 残22親のNFR候補

以下は固定L2/L11に明記されたidentity・scope・列挙条件のtraceability候補であり、実測値、SLA、L3承認値ではない。率の母集団は計画した合成fixture全数とし、`N_planned=0`/不明では比率を出さない。各fixtureの観測状態（valid/failed/missing/censored）とoracle判定（pass/fail/unknown）を別軸にし、欠測を0や成功へ置き換えない。技術値候補はこの一括L3候補の一部として比較・測定し、個別parameterのPO gateを設けない。同じCASEを複数測定行が参照しても一fixtureとして一度だけ数える。旧summary/index、集約説明、crosswalkの重複参照は独立fixture/negativeの追加件数に算入しない。negative件数は個別L10 CASE本文で一つの入力条件だけを変えたfixture単位で数え、複数変異をまとめたsummaryは個別negative数にしない。

| 親 | 測定候補 | 入力・比較 | 判定材料 |
|---|---|---|---|
| `HELIXLABO-L2-012` | episode/evidence/relation identity・revisionのtrace fidelity | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-012-C01`, `L10-LABO-012-C02`, `L10-LABO-012-C04`, `L10-LABO-012-C05`, `L10-LABO-012-C06`, `L10-LABO-012-C07`, `L10-LABO-012-C08`, `L10-LABO-012-C09`, `L10-LABO-012-C10` |
| `HELIXLABO-L2-013` | 分類軸・根拠・unknownの個別保持 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-013-C01`, `L10-LABO-013-C04`, `L10-LABO-013-C05`, `L10-LABO-013-C06`, `L10-LABO-013-C07`, `L10-LABO-013-C08`, `L10-LABO-013-C09`, `L10-LABO-013-C10`, `L10-LABO-013-C11`, `L10-LABO-013-C12`, `L10-LABO-013-C13`, `L10-LABO-013-C14`, `L10-LABO-013-C15`, `L10-LABO-013-C16`, `L10-LABO-013-C17` |
| `HELIXLABO-L2-014` | 元意味/目的/条件と候補差分の対応 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-014-C01`, `L10-LABO-014-C04`, `L10-LABO-014-C05`, `L10-LABO-014-C06`, `L10-LABO-014-C07`, `L10-LABO-014-C08`, `L10-LABO-014-C09`, `L10-LABO-014-C10`, `L10-LABO-014-C11`, `L10-LABO-014-C12` |
| `HELIXLABO-L2-015` | 比較armのtarget版・scope・oracle・条件一致 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-015-C01`, `L10-LABO-015-C04`, `L10-LABO-015-C05`, `L10-LABO-015-C06`, `L10-LABO-015-C07`, `L10-LABO-015-C08`, `L10-LABO-015-C09`, `L10-LABO-015-C10`, `L10-LABO-015-C11`, `L10-LABO-015-C12` |
| `HELIXLABO-L2-016` | 比較可能性・反例・中断状態の保持 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-016-C01`, `L10-LABO-016-C03`, `L10-LABO-016-C04`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C08`, `L10-LABO-016-C09`, `L10-LABO-016-C10`, `L10-LABO-016-C11` |
| `HELIXLABO-L2-017` | 現行rule/保証/owner結果と未完義務のtrace | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-017-C01`, `L10-LABO-017-C03`, `L10-LABO-017-C04`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C08`, `L10-LABO-017-C09`, `L10-LABO-017-C10`, `L10-LABO-017-C11`, `L10-LABO-017-C12`, `L10-LABO-017-C13` |
| `HELIXLABO-L2-018` | 標本条件・counterexampleと支持範囲の一致 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-018-C01`, `L10-LABO-018-C03`, `L10-LABO-018-C04`, `L10-LABO-018-C05`, `L10-LABO-018-C06`, `L10-LABO-018-C07`, `L10-LABO-018-C08`, `L10-LABO-018-C09`, `L10-LABO-018-C10` |
| `HELIXLABO-L2-019` | target/responsibility別feedback分離 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-019-C01`, `L10-LABO-019-C04`, `L10-LABO-019-C05`, `L10-LABO-019-C06`, `L10-LABO-019-C07`, `L10-LABO-019-C08`, `L10-LABO-019-C09`, `L10-LABO-019-C10`, `L10-LABO-019-C11` |
| `HELIXLABO-L2-020` | 復帰後observationと前後rule revision・未完義務のtrace | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-020-C01`, `L10-LABO-020-C04`, `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10`, `L10-LABO-020-C11`, `L10-LABO-020-C12` |
| `HELIXLABO-L2-021` | HARNESS source identity/revision/scope/contract provenance | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-021-C01`, `L10-LABO-021-C04`, `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10`, `L10-LABO-021-C11`, `L10-LABO-021-C12`, `L10-LABO-021-C13`, `L10-LABO-021-C16` |
| `HELIXLABO-L2-022` | OS ticket/運転/未完/unknown provenance | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-022-C01`, `L10-LABO-022-C04`, `L10-LABO-022-C05`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11`, `L10-LABO-022-C12`, `L10-LABO-022-C13`, `L10-LABO-022-C14`, `L10-LABO-022-C15`, `L10-LABO-022-C16`, `L10-LABO-022-C17`, `L10-LABO-022-C18` |
| `HELIXLABO-L2-023` | BRAIN knowledge identity/versionと非書戻し | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-023-C01`, `L10-LABO-023-C04`, `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09`, `L10-LABO-023-C11`, `L10-LABO-023-C12`, `L10-LABO-023-C13`, `L10-LABO-023-C16` |
| `HELIXLABO-L2-024` | INTELLIGENCE判断revisionとhistorical/current区別 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-024-C01`, `L10-LABO-024-C04`, `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09`, `L10-LABO-024-C16`, `L10-LABO-024-C17`, `L10-LABO-024-C18` |
| `HELIXLABO-L2-025` | SECURITY許可scope・restricted-data境界 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-025-C01`, `L10-LABO-025-C04`, `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09`, `L10-LABO-025-C10`, `L10-LABO-025-C16` |
| `HELIXLABO-L2-026` | INFRA resource/runtime source revisionと権限分離 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-026-C01`, `L10-LABO-026-C04`, `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09`, `L10-LABO-026-C16` |
| `HELIXLABO-L2-027` | connection identity/schema/provenance/trace fidelity | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-027-C01`, `L10-LABO-027-C04`, `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11`, `L10-LABO-027-C12`, `L10-LABO-027-C16` |
| `HELIXLABO-L2-028` | OS assignment/ticketとWorker result/task class結合 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-028-C01`, `L10-LABO-028-C03`, `L10-LABO-028-C04`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C09`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`, `L10-LABO-028-C13`, `L10-LABO-028-C14`, `L10-LABO-028-C15`, `L10-LABO-028-C16` |
| `HELIXLABO-L2-029` | test target revision・inspection scope・実行state | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-029-C01`, `L10-LABO-029-C04`, `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C09`, `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12`, `L10-LABO-029-C16`, `L10-LABO-029-C17`, `L10-LABO-029-C18`, `L10-LABO-029-C19` |
| `HELIXLABO-L2-030` | Product Core identity/source version/meaning分離 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-030-C01`, `L10-LABO-030-C04`, `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10` |
| `HELIXLABO-L2-034` | generic evidenceの複数meaning/product/episode支持範囲 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-034-C01`, `L10-LABO-034-C03`, `L10-LABO-034-C04`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08`, `L10-LABO-034-C09`, `L10-LABO-034-C10`, `L10-LABO-034-C11`, `L10-LABO-034-C12` |
| `HELIXLABO-L2-035` | 評価payload列挙・source revision・unassessed状態保持 | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-035-C01`, `L10-LABO-035-C04`, `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C11`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15`, `L10-LABO-035-C16`, `L10-LABO-035-C17`, `L10-LABO-035-C18`, `L10-LABO-035-C19` |
| `HELIXLABO-L2-058` | 呼出しごとの選択source dependency closure | 親に列挙された必須conditionごとに個別fixtureを定義。正例/各単独変異/未見正常を含む。 | planned fixtureを分母にし、identity・revision・scope・owner戻しを個別集計。unknown/missing/stale/mismatch/未完を別状態に保持し、禁止された正本書換え・昇格は0。case: `L10-LABO-058-C01`, `L10-LABO-058-C06`, `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C09`, `L10-LABO-058-C10`, `L10-LABO-058-C11`, `L10-LABO-058-C12`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`, `L10-LABO-058-C26`, `L10-LABO-058-C27`, `L10-LABO-058-C28`, `L10-LABO-058-C29`, `L10-LABO-058-C30`, `L10-LABO-058-C31`, `L10-LABO-058-C32`, `L10-LABO-058-C33`, `L10-LABO-058-C34`, `L10-LABO-058-C35`, `L10-LABO-058-C36`, `L10-LABO-058-C37`, `L10-LABO-058-C38`, `L10-LABO-058-C39`, `L10-LABO-058-C40`, `L10-LABO-058-C41` |

候補値の根拠比較：期待可能な技術値は固定L2/L11が列挙するidentity/版/範囲/状態を直接照合する完全一致候補とする。部分照合や異なるsourceの補完ではfield欠落・stale・誤帰属を隠すため採らない。割合は分母のある観測記述に限り、製品performance threshold、最低試行数、retention/SLAを固定親・旧sourceに由来する値として導入しない。

## Stage 2b — 過去追補のNFR索引（現在の個別fixture参照）

下表は過去追補の索引であり、追加件数や分母を別に計上しない。現在の母集団は上の各親measurementのcase列挙に統一し、summary/indexを除く個別fixtureについてvalid/failed/missing/censoredとoracle pass/fail/unknownを別集計する。比率の分母0/不明は算出値なし。未実行の計画であり、まとめ表は個別CASEの代替でない。

| 親 | AC | 個別L10 fixture IDs（正常/negativeをACで区別） | 測定上の判定材料 |
|---|---|---|---|
| `HELIXLABO-L2-012` | `LABO-012-AC-01/02` | `L10-LABO-012-C01`, `L10-LABO-012-C02`, `L10-LABO-012-C04`, `L10-LABO-012-C05`, `L10-LABO-012-C06`, `L10-LABO-012-C07`, `L10-LABO-012-C08`, `L10-LABO-012-C09`, `L10-LABO-012-C10` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-013` | `LABO-013-AC-01/02` | `L10-LABO-013-C01`, `L10-LABO-013-C04`, `L10-LABO-013-C05`, `L10-LABO-013-C06`, `L10-LABO-013-C07`, `L10-LABO-013-C08`, `L10-LABO-013-C09`, `L10-LABO-013-C10`, `L10-LABO-013-C11`, `L10-LABO-013-C12`, `L10-LABO-013-C13`, `L10-LABO-013-C14`, `L10-LABO-013-C15`, `L10-LABO-013-C16`, `L10-LABO-013-C17` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-014` | `LABO-014-AC-01/02` | `L10-LABO-014-C01`, `L10-LABO-014-C04`, `L10-LABO-014-C05`, `L10-LABO-014-C06`, `L10-LABO-014-C07`, `L10-LABO-014-C08`, `L10-LABO-014-C09`, `L10-LABO-014-C10`, `L10-LABO-014-C11`, `L10-LABO-014-C12` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-015` | `LABO-015-AC-01/02` | `L10-LABO-015-C01`, `L10-LABO-015-C04`, `L10-LABO-015-C05`, `L10-LABO-015-C06`, `L10-LABO-015-C07`, `L10-LABO-015-C08`, `L10-LABO-015-C09`, `L10-LABO-015-C10`, `L10-LABO-015-C11`, `L10-LABO-015-C12` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-016` | `LABO-016-AC-01/02` | `L10-LABO-016-C01`, `L10-LABO-016-C03`, `L10-LABO-016-C04`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C08`, `L10-LABO-016-C09`, `L10-LABO-016-C10`, `L10-LABO-016-C11` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。|
| `HELIXLABO-L2-017` | `LABO-017-AC-01/02` | `L10-LABO-017-C01`, `L10-LABO-017-C03`, `L10-LABO-017-C04`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C08`, `L10-LABO-017-C09`, `L10-LABO-017-C10`, `L10-LABO-017-C11`, `L10-LABO-017-C12`, `L10-LABO-017-C13` | C10は未完義務1件の脱落だけを変異し、義務と既存ownerを保持して当該ownerへ戻す。|
| `HELIXLABO-L2-018` | `LABO-018-AC-01/02` | `L10-LABO-018-C01`, `L10-LABO-018-C03`, `L10-LABO-018-C04`, `L10-LABO-018-C05`, `L10-LABO-018-C06`, `L10-LABO-018-C07`, `L10-LABO-018-C08`, `L10-LABO-018-C09`, `L10-LABO-018-C10` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-019` | `LABO-019-AC-01/02` | `L10-LABO-019-C01`, `L10-LABO-019-C04`, `L10-LABO-019-C05`, `L10-LABO-019-C06`, `L10-LABO-019-C07`, `L10-LABO-019-C08`, `L10-LABO-019-C09`, `L10-LABO-019-C10`, `L10-LABO-019-C11` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-020` | `LABO-020-AC-01/02` | `L10-LABO-020-C01`, `L10-LABO-020-C04`, `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10`, `L10-LABO-020-C11`, `L10-LABO-020-C12` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-021` | `LABO-021-AC-01/02` | `L10-LABO-021-C01`, `L10-LABO-021-C04`, `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10`, `L10-LABO-021-C11`, `L10-LABO-021-C12`, `L10-LABO-021-C13`, `L10-LABO-021-C16` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。|
| `HELIXLABO-L2-022` | `LABO-022-AC-01/02` | `L10-LABO-022-C01`, `L10-LABO-022-C04`, `L10-LABO-022-C05`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11`, `L10-LABO-022-C12`, `L10-LABO-022-C13`, `L10-LABO-022-C14`, `L10-LABO-022-C15`, `L10-LABO-022-C16`, `L10-LABO-022-C17`, `L10-LABO-022-C18` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。|
| `HELIXLABO-L2-023` | `LABO-023-AC-01/02` | `L10-LABO-023-C01`, `L10-LABO-023-C04`, `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09`, `L10-LABO-023-C11`, `L10-LABO-023-C12`, `L10-LABO-023-C13`, `L10-LABO-023-C16` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。|
| `HELIXLABO-L2-024` | `LABO-024-AC-01/02` | `L10-LABO-024-C01`, `L10-LABO-024-C04`, `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09`, `L10-LABO-024-C16`, `L10-LABO-024-C17`, `L10-LABO-024-C18` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。|
| `HELIXLABO-L2-025` | `LABO-025-AC-01/02` | `L10-LABO-025-C01`, `L10-LABO-025-C04`, `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09`, `L10-LABO-025-C10`, `L10-LABO-025-C16` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-026` | `LABO-026-AC-01/02` | `L10-LABO-026-C01`, `L10-LABO-026-C04`, `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09`, `L10-LABO-026-C16` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-027` | `LABO-027-AC-01/02` | `L10-LABO-027-C01`, `L10-LABO-027-C04`, `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11`, `L10-LABO-027-C12`, `L10-LABO-027-C16` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-028` | `LABO-028-AC-01/02` | `L10-LABO-028-C01`, `L10-LABO-028-C03`, `L10-LABO-028-C04`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C09`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`, `L10-LABO-028-C13`, `L10-LABO-028-C14`, `L10-LABO-028-C15`, `L10-LABO-028-C16` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-029` | `LABO-029-AC-01/02` | `L10-LABO-029-C01`, `L10-LABO-029-C04`, `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C09`, `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12`, `L10-LABO-029-C16`, `L10-LABO-029-C17`, `L10-LABO-029-C18`, `L10-LABO-029-C19` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。|
| `HELIXLABO-L2-030` | `LABO-030-AC-01/02` | `L10-LABO-030-C01`, `L10-LABO-030-C04`, `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。 |
| `HELIXLABO-L2-034` | `LABO-034-AC-01/02` | `L10-LABO-034-C01`, `L10-LABO-034-C03`, `L10-LABO-034-C04`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08`, `L10-LABO-034-C09`, `L10-LABO-034-C10`, `L10-LABO-034-C11`, `L10-LABO-034-C12` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。|
| `HELIXLABO-L2-035` | `LABO-035-AC-01/02` | `L10-LABO-035-C01`, `L10-LABO-035-C04`, `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C11`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15`, `L10-LABO-035-C16`, `L10-LABO-035-C17`, `L10-LABO-035-C18`, `L10-LABO-035-C19` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。|
| `HELIXLABO-L2-058` | `LABO-058-AC-01/02` | `L10-LABO-058-C01`, `L10-LABO-058-C06`, `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C09`, `L10-LABO-058-C10`, `L10-LABO-058-C11`, `L10-LABO-058-C12`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`, `L10-LABO-058-C26`, `L10-LABO-058-C27`, `L10-LABO-058-C28`, `L10-LABO-058-C29`, `L10-LABO-058-C30`, `L10-LABO-058-C31`, `L10-LABO-058-C32`, `L10-LABO-058-C33`, `L10-LABO-058-C34`, `L10-LABO-058-C35`, `L10-LABO-058-C36`, `L10-LABO-058-C37`, `L10-LABO-058-C38`, `L10-LABO-058-C39`, `L10-LABO-058-C40`, `L10-LABO-058-C41` | 各fixtureを個別に1件として状態・oracle・固定owner戻しを記録。|

## Stage 5 — HELIXLABO-L2-050 技術計測候補

以下は未計測の技術候補であり、固定L2/L11の意味・owner・版を変えず、数値閾値を追加しない。

- `NFR-LABO-050-01` 循環identity/未完義務: 選択循環で適用される11段階それぞれについて状態記録件数、同一ticket/experiment/target revision・assignment/result binding、各段階のmissing/stale/open-dutyを分離して報告する。effect evaluationとregression evaluationは別々の存在・判定状態を記録する。candidate count/Feedback発行/OS registration/target change/verification/CI successのみの完了主張は別の結果区分にする。分母0または不明では率を算出しない。対象は独立fixture 32件（CASE-01/02、03a–f、04a/b、05/06、11–30）とし、CASE-03g（非独立ラベル）およびCASE-07/08/09/10（非独立索引）は分母から除外する。
- 個別L10範囲（独立fixture定義32件）: `L10-LABO-050-CASE-01`, `L10-LABO-050-CASE-02`, `L10-LABO-050-CASE-03a`, `L10-LABO-050-CASE-03b`, `L10-LABO-050-CASE-03c`, `L10-LABO-050-CASE-03d`, `L10-LABO-050-CASE-03e`, `L10-LABO-050-CASE-03f`, `L10-LABO-050-CASE-04a`, `L10-LABO-050-CASE-04b`, `L10-LABO-050-CASE-05`, `L10-LABO-050-CASE-06`, `L10-LABO-050-CASE-11`, `L10-LABO-050-CASE-12`, `L10-LABO-050-CASE-13`, `L10-LABO-050-CASE-14`, `L10-LABO-050-CASE-15`, `L10-LABO-050-CASE-16`, `L10-LABO-050-CASE-17`, `L10-LABO-050-CASE-18`, `L10-LABO-050-CASE-19`, `L10-LABO-050-CASE-20`, `L10-LABO-050-CASE-21`, `L10-LABO-050-CASE-22`, `L10-LABO-050-CASE-23`, `L10-LABO-050-CASE-24`, `L10-LABO-050-CASE-25`, `L10-LABO-050-CASE-26`, `L10-LABO-050-CASE-27`, `L10-LABO-050-CASE-28`, `L10-LABO-050-CASE-29`, `L10-LABO-050-CASE-30`。非独立ラベル/索引（5件、分母外）: `L10-LABO-050-CASE-03g`, `L10-LABO-050-CASE-07`, `L10-LABO-050-CASE-08`, `L10-LABO-050-CASE-09`, `L10-LABO-050-CASE-10`。NFR対象CASEは未実行設計で、実測成功数とは扱わない。
- NFR候補を実測する際は、対象循環・適用stage・欠測・failed・stale・censored/openの分子分母を明記する。欠測や分母0を0成功へ変換しない。固定親にないSLA、割合threshold、最低試行数、retention期限を作らない。


## Stage 5 — HELIXLABO-L2-059 技術計測候補

未計測設計。固定L2/L11のfieldとoracleだけを使い、最低N、成功率/資格threshold、SLA、freshness期限、PO別parameter approvalを加えない。

- NFR-LABO-059-01 比較可能性・費用/時間内訳: 選択されたscope/cohortごとにtask/snapshot、quality/acceptance oracle、decision scope、protocol/scorer/hardware/toolchain、receipt completeness、費目、human quantity、duration、未選択群/未測定状態を別々に記録する。欠測・unknown・未価格化・未完を成功/0へ変えない。分母0/不明では率を出さない。
- 対象定義はL10-LABO-059の全定義85件。正常/未見正常とnegative、compound CASE-30、non-independent index CASE-22/33–36を分類別に集計する。独立fixture設計は79件（既存54＋追加25）、compound1件・index5件は分母外。CASE-14はtask revision、CASE-58はsource revision、CASE-71はrequirement revision、CASE-72はacceptance-oracle revisionの不一致を個別に照合する。これは設計上の件数で、実測母集団や成功件数ではない。
- CASE-NFR-LABO-059-01は実行記録ではない。CASE-64ではprovider labelのみの入力差とactual model identityを分離し、score invarianceを別観点として数える。人間調査/検証時間は貨幣費用と別fieldとする。


## Stage 5 — HELIXLABO-L2-060 技術計測候補

以下は未計測の候補設計であり、固定L2/L11の意味・owner・version_targetを変更せず、最低N・成功率・SLA・順位閾値を加えない。

- `NFR-LABO-060-01` 比較条件・quality・費用/人時間trace: 選択scope内のtask/snapshot、同一元Worker設定、支援有無、事前oracle、OS assignment/result receipt、選択support source/use、追加resource、retry/rework/review/CI、人作業数量・実費、price source/currency/effective time、failed/unknown/missingを個別に記録する。human quantityと金額は分離し、unknown/missing/未完をsuccess/0へ変換しない。これは測定設計であって測定値ではない。
- L10の現在のCASE定義IDは57件（正常候補2、negative候補47、非独立索引候補8）。単一点性・独立性は独立review未確認で、ID数や一意性は完全性を証明しない。CASE-22/23/26/27/29/30/31/32は案上の索引で、個別fixture/negative分母へ重ねない。詳細をL10 functional verificationで照合する。
- 分母0/不明なら率を算出しない。source/owner不明はunknownのまま保持する。固定親にない数値thresholdや試行条件を新設せず、実行済み結果を主張しない。

## Stage 5 — HELIXLABO-L2-061 技術計測候補

| NFR | 母集団・区分 | CASE/oracle |
|---|---|---|
| `LABO-061-NFR-01` 比較適格性と不成立保持 | 実測母集団は選択・適用されたrunで構成し、valid・failed・invalid・missing・unknown・stale・censoredを全て状態別に保持する。率を示す場合は母集団数/分母を明記し、分母0または不明では率なし。実測がなければ未実測。 | CASEは設計上のfixture定義であり実測母集団ではない。normalも適用runなら実測母集団に含む。索引はfixture定義数へ重複計上せず、具体的traceはNFR検証文書で示す。 |
| `LABO-061-NFR-02` 履歴・field完全性 | 15 task snapshot fieldとtask/oracle/protocol/scorer identity・version・digestを個別に追跡する。missing、unknown、stale、mismatchは混同しない。 | fieldごとのL10 oracleを照合し、CASE数を測定値や被覆率へ変換しない。 |
| `LABO-061-NFR-03` 漏洩・role separation・authority境界 | secret等の機微値を合成canaryで扱い、実secret/PIIは用いない。leakage、author/judge混同、receipt由来のauthority誤生成、Worker起動/candidate採択、固定059 revisionへの遡及適用、旧runtime起動要求を個別に保持する。 | L10の具体的な単独変異と期待状態。固定閾値・最低N・固定SLAを新設しない。 |


## Stage 5 — HELIXLABO-L2-063 技術計測候補

| NFR | 母集団・状態 | 照合対象 |
|---|---|---|
| `LABO-063-NFR-01` 修復episodeと再発根拠 | 母集団はこの親の範囲で実際に許可された観測episode。対象版、cause/applicability、修復手順・実行receipt、verification、reoccurrence、counterexample、post-observationを別fieldで結ぶ。missing/failed/unknown/stale/openを保持し、分母不明/0から値を作らない。 | `LABO-063-AC-01/02/03`。L10のCASEは設計fixtureであり、測定run/頻度・閾値を与えない。 |
| `LABO-063-NFR-02` 状態遷移と戻し先 | warning、candidate、OS registration/routing、owner adoption/change、HARNESS verification、post-operation observation、effect evaluationを区別し、未完stateを成功へ変換しない。 | 個々の欠落/stale oracleはL10の定義と固定L2/L11を参照する。対象owner/observation sourceの個体識別ができない場合はunknownを保持する。 |
| `LABO-063-NFR-03` authority境界と未完状態 | LABOは知識を評価・保持し、gate強制、canonical write、採否/assignment/permission/authority生成をしない。OS registration、対象owner adoption/change、HARNESS verification、post-operation observation/effect evaluationを別状態に保ち、candidate/receipt/修復成功を完了へ丸めない。 | L3 `LABO-063-AC-03` とL10 `LABO-063-NFR-03` の状態境界を対応させる。固定L2/L11の既存責務区分のみを適用し、generic owner・新threshold・新authorityを追加しない。 |

L10は旧公開69 IDと追補CASE-66〜68を含む72個の完全ID定義を持つ。分類候補は正常6（CASE-01/02/05/07/10/67）、negative55、非独立索引11であり、独立性や意味的被覆の検収結果ではない。L10-LABO-063-CASE-58はL10-LABO-063-CASE-13と同じ観測欠落軸を含むため、単独負例の実測分母へ二重計上しない。実測母集団とCASE inventoryを混同しない。固定再発閾値、観測窓、最低試行数、SLA、合格率を新設せず、入力された母集団/閾値が不明ならunknownとする。

### HELIXLABO-L2-065 — 根拠付き測定候補（1.0候補）

以下は固定L2-065/L11-065の測定条件に沿った技術候補であり、実測値・承認値・実装値ではない。各値は対象scopeのreceipt・版に結び付ける。parameterごとのPO確認を要求しない。

| 指標・比較 | 候補と根拠 | 判定時の境界 |
|---|---|---|
| qualification | smoke結果とblind full-bench結果を別々に保持し、8軸を同じscope/fixture集合・revision/rubric/scorer/oracleへ結ぶ。必要軸は全8軸を列挙する | 欠落・比較不能は未完/未評価。smoke passのみでfull資格としない |
| 初回と再試行 | `first_pass`は最初のAttemptに対する適用oracle結果、`retry_count`は初回後のretry数 | 初回失敗・retry成功は`false`とretry数を別fieldに残す。067のfirst-eligible candidate指標へ換算しない |
| diff/lint | 選択task scopeへ適用する場合のみ、その定義・単位・tool/profile版・receiptを併記 | 全製品共通単位を置かない。適用外は理由付き、適用するが観測不能はunknown、実測0は根拠付き0 |
| quality/cost | L2-059の品質gateと固定L2-065の費用境界、price source/currency/effective timeを再利用 | 品質/security/scope/検証不能を安価・短時間・平均で相殺しない。欠損費用を0にしない |
| trend/failure | 同task class・scope・測定定義・revisionの記録を比較候補とする | 条件の違う期間・taskを混ぜない。母集団・件数・sample数の新規規則を作らない |

対象scopeが未選択の通常Worker作業にfull-benchを課さず、別runtime・task・versionへの適格性も推論しない。L2-059等の既決条件外で比較条件や許容差が未決なら値を発明せず、固定L2-065:514に従い該当ownerへ返す。

**旧資産との対応**：形式・測定候補の起点は旧HIL-FR-61/62、HIL-NFR-35、Bench R04/R08である。blind judgeと8軸の同条件評価、taskごとのfirst/retry/費用記録は保持・再導出する。旧sample設定、旧runtime値、旧閾値、旧admission条件は移さない。



## Stage 5 — HELIXLABO-L2-064 技術計測候補

064の技術計測は、実行許可ではなく、後に許可された比較runが存在する場合の状態の数え分けを設計する。値・最低sample/retry回数・固定閾値は追加しない。

| 計測項目 | 母集団・状態 | 照合先 |
|---|---|---|
| `LABO-064-NFR-01` 条件とtraceの完全性 | 選択された比較scope内のrunだけを対象とし、run identity、runtime/model identity/version、記録側mapping、judge-visible scope、fixture/rubric/judge version/sample/retryの各fieldをvalid/missing/unknown/stale/mismatchで分ける。未選択通常履歴は母集団にしない。 | `LABO-064-AC-01/02/03`。条件全体の分母と各field状態を示し、分母不明または0では率を出さない。 |
| `LABO-064-NFR-02` 漏洩・重大failure・相殺状態 | candidate-name exposure、security failure、scope逸脱、検証不能、smoke-only、full-evaluation evidenceを別状態で記録する。failed/missing/unknownをsuccessや0へ変換しない。 | L10単独oracle。重大failureを高平均点で相殺した結果をpassへ変換しない。 |
| `LABO-064-NFR-03` 期待状態と権限境界 | comparison evidence、再評価義務、既存assignment/admissionを別stateとして数える。CASE定義は測定runに含めない。 | `LABO-064-AC-03`; 実測母集団、分子、分母、unknown数を併記。固定SLA、最低N、合格率、permissionを加えない。 |

実際の比較runが与えられない場合は「未実測」とする。上記CASEは合成fixtureであり、run数、合格率、採択、実測結果を表さない。

## Stage 5 — HELIXLABO-L2-067 technical observation grade

未計測設計。固定L2/L11にない数値threshold、最低N、成功率、SLA、timeliness/freshness値を追加しない。unknown/missing/重複/順序不明を0または正常値に変えない。

- `NLABO-067-FR-01-01` first-eligible/repair-event evidence completeness: selected task/scope/revisionに対するpredicate/oracle identity+revision、candidate identity/digest、OS assignment/AttemptID、eligibility/repair/result receiptsの観測可能性とunknownをfield別に記録する。roundは同一assignment Attempt内で観測receiptが確定した範囲だけ数え、別Attemptと総Attempt countを混ぜない。source/個体 identityがunknownならrole分類とunknown stateを保持する。これは計測設計で実測ではない。
- `L10-LABO-067` CASE定義は旧30 literalと本候補追加CASE-24–39を個別IDで索引する。単一点性・独立性は未reviewであり、CASE数は完全性の証明ではない。

## Stage 5 — HELIX-LABO L3 NFR候補 — HELIXLABO-L2-069

数値metricや実測値を確定しない根拠付き技術候補。個別parameterごとのPO承認gateを設けない。

| 性質 | 候補 | 根拠・対の観測 | 限界 |
|---|---|---|---|
| 比較の再現性 | resultに使ったticket/assignment, source/revision, scope, classification, denominator, window, completeness, relation/evidenceを追跡可能にする。入力不足時は同じ不足状態をunknown/未評価として保持する。 | 固定L2比較保証とL11比較不能例。FV-069 CASE-01, 05–10, 20–26, 28–32。 | 新しい必須schema field・rate threshold・window長は定義しない。 |
| 評価candidateの必須構成 | 固定L2が求める理由別傾向、counterexample、regression risk、revalidation conditionをcandidateへ含める。 | FV-069 CASE-01/44–47でCASE-01正常出力と4要素の各単独欠落を照合する。 | 追加metric・threshold・統計方式を設けない。 |
| 欠測忠実性 | 欠測/unknown/censored/untracked/window未満を0または成功へ変換しない。 | 固定L2/L11明示条件。FV CASE-03b, 07–12, 20–25, 28, 30–32。 | 数値上限・統計方式を追加しない。 |
| 因果claim境界 | evidence-backed relationの個別記録と、因果効果/発行精度改善の一般化を分ける。時間/pathだけ、単一例だけ、単純前後比較だけで一般化しない。 | 旧source line 319、固定L2比較保証、L11不合格例。FV CASE-03c, 13, 33。 | 因果推論方式/confidence thresholdは要求しない。 |
| authority isolation | LABO評価の書込み先をcandidateに限り、ticket/priority/assignment/oracle/authorityおよびsource closureを書き換えない。 | 固定L2境界、L11不合格/受入限界。FV CASE-04a, 14–19, 34–43, 48（未評価結果からのticket発行拒否）。 | 既存ownerの内部実装やSECURITY分類を再定義しない。 |

旧sourceの数値を引き継がない。技術parameterが必要になった場合は候補値・比較根拠・測定方法を対で記録するが、ここで閾値を新設しない。

### HELIXLABO-L2-068 — Worker Attempt countの観測（Stage 5、version_target: 1.0）

**固定親と採択根拠**：PO判断記録 `af93d1f171d994f9fae2e78026b39ac27f896f5c` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:83` は `HELIXLABO-L2-068` を採択し、L2/L11の全体SHAと節digestを固定する。採択本文自体は `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のL2 `docs/helix-labo/L2-requirements/labo-requirements.md:541–550`（file SHA-256 `5d939d814f0aca2fa4bdde89f09c68428ef434e8c9b662f5bd3c546533897ae9`、節SHA-256 `7e3df32b0131722c88ae148c4cbfa9a1be20f81826099c0ceb29a674e07030e2`）とL11 `docs/helix-labo/L11-acceptance/labo-acceptance.md:278–286`（file SHA-256 `30de41e2361405f3598e3ee511bfec1b51e47514af4de3e6c480c2a068073de0`、節SHA-256 `3dcf068de1351b2e8c1f2d772ec9273cb7908368a32b389ee40ce51929ad8d94`）である。line 83のhistorical MPR `MPR-RC-HELIXLABO-L2-068-001` はlocator correctionの後継 `...-002` と区別する。採択されたcandidate/digest/atom setは変わらず、receiptはauthorityを生成しない。候補本文内の `draft_candidate` は固定bytesのmetadataであり、PO採択状態は判断記録から読む。

**旧source起点と処置**：`LEGACY-ASSET-3A15E5645D2D2A59DFF5`、`LEGACY-CAND-LINE-001656`、旧 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399`（source revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`、file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`、raw LF span SHA-256 `aa9dacc58969d896bbfbe38ce9c2ed6b55f47476b4cd3a411041d62bebf70468`)を起点に、S3C「総Attempt count」だけを意味再導出する。S3A/S3B、隣接line、旧candidate全体や全12指標へのcoverage/closureを主張しない。old asset ledgerは `unresolved`、paired consumer未確認であり、限定検索結果はconsumer不存在の証明ではない。

**receiptのpin差**：採択節digestはPO行の`7e3df32b…`／`3dcf068d…`と一致する。coverage receipt r2はL11規則を「見出しからEOF」と記す一方、実際の採択digestはL11の068節span 278–286に一致する。これはreceipt本文の規則記述と実際の採択pinの差として残し、receiptから採択範囲やauthorityを作らない。

**固定意味・境界**：明示選択されたtask/scope/revision/evaluation範囲に属するOS Worker Attempt identityのdistinct総数を数え、完全性が証明できない場合は総数を `unknown` とする。identityを持つdenied Attemptは数え、実行前に拒否されidentityのないintakeは数えない。result stateは別fieldで保持する。固定318の本文には065/067を「未採択」と記すが、現PO判断record `af93d1f171d994f9fae2e78026b39ac27f896f5c` line 80/82は両候補を条件付き採択と記録する。snapshot metadataと現authorityを区別し、どちらの採択状態にも068を依存させない。065 first_pass/retry_count、067 same-Attempt repair round、068 identity countは換算・代替・合算しない。比較時も採択済み `HELIXLABO-L2-059` の品質優先・費用の意味を変更しない。

**責務・返却**：OSは既存assignment、Attempt identity、event/evidence、state/correctionを提供する。LABOは許可済み記録のdistinct countと比較証拠を返す。固定親の生成禁止はAttempt identity、identity/counting policy、Attempt/Retry policy、retry上限、task success rate、Attempt success rate、task-evaluation oracle、assignment、Worker起動/retry、adoption、qualification、admission、実験許可、SECURITY許可であり、L10で各出力fieldの生成を個別に拒否する。新規実験には既存OS assignmentと適用されるSECURITY許可を要し、count結果からその許可を生成しない。LABOはこれらを生成しない。identity対応・event/correction lineageの欠落、重複衝突、対象recordのstale・scope不一致、捕捉完全性不明は総数をunknown/未評価にする。result receiptだけが欠ける場合は、identity集合の完全性receiptだけで当該範囲のAttempt記録完全性を確認済みとせず、総数をunknown/未評価にする。該当result stateも別fieldでunknownとして保持し、既知の観測sourceまたはOS記録ownerへ不足を返す。event遅延（OSの訂正event遅延を含む）は総数をunknown/未評価にし、観測sourceまたはOS記録ownerへ不足を返す。完全性receiptが存在していても、遅延eventから総数を推測・確定しない。原因に沿って既知の観測sourceまたはOS record owner区分へ返す。個体source/owner identityが不明ならそのidentity unknownを別に保持し、既知責務区分を消さない。未採番の担当や権限を新設しない。

**版・範囲**：旧a4の25 CASE IDを保持する。旧literalは監査材料に保全し、下の6列表のfixture setup/oracleは固定L2/L11へ意味再導出した候補であり、旧literalのbyteコピーを正本定義とみなさない。固定親は仕様として引用し、これらの候補表は意味完全性・単独変異性の証明ではない。

| NFR候補 | 観測・候補値 | 照合材料 | 適用限界 |
|---|---|---|---|
| `LABO-068-NFR-01` — identity一意性・scope相関 | `attempt_count` は選択scopeのdistinct OS Attempt identity数。各identityは一度だけ。 | assignment、identity、task/scope/revision/evaluation key、event/correction lineage、scope内外の判別をidentityごとに照合する。 | 新しい件数閾値、成功率、最低Nを置かない。重複・scope不整合を補完しない。 |
| `LABO-068-NFR-02` — 完全性・unknown伝播 | OSが当該選択範囲の捕捉完全性を示せないとき総数は`unknown`。同scopeの観測identity集合と完全性receiptの矛盾、およびreceipt revisionと選択source revisionの不一致もunknownの根拠として保持する。 | completeness claimをsource receipt・revision・correction状態と照合し、assertionだけでなく根拠を要求する。矛盾/stale receipt時も総数unknown/未評価として既知の観測sourceまたはOS記録owner責務区分へ不足を戻し、個体identity unknownは別記する。 | 固定遅延時間、SLA、観測window、欠測許容率を新設しない。event遅延・訂正event遅延は総数unknown。遅延eventや別scope履歴から欠落Attemptを推測しない。 |
| `LABO-068-NFR-03` — state・訂正の分離 | denied-with-identityはcount、identityなしpre-execution denialはintakeとして別記。result receipt欠落時は当該範囲のAttempt記録完全性receiptの有無にかかわらず総数unknown/未評価、該当stateもunknownとして別fieldで保持し、既知の観測sourceまたはOS記録owner区分へ不足を返す。個体identityが不明ならunknownを別に保持する。 | 個体identityと結果state、duplicate resend/correction, CI rerun, same-Attempt repair roundを別field/source receiptで照合する。 | 状態を合算して品質評価しない。065/067と換算しない。新oracle、分類、権限を定義しない。 |

候補技術値は固定L2/L11の観測単位・unknown動作から導いた提案で、実測根拠や採択済み閾値ではない。対象母集団・期間・cutoffは呼出し側が既に選択したscope/receiptから受け取り、この親で新設しない。実行・performance測定は未実施。

### HELIXLABO-L2-071 — GitHub監査task class別qualification（Stage 5、version_target: 1.0）

**採択済み固定親とPO根拠**：PO判断記録 `3795bf0dcb731231a0b5ca1faa3cb67bdfeda22a` の `docs/governance/decisions/po-decision-2026-09-30-live26.md:50` は `HELIXLABO-L2-071` を通常採択22件に含むものとして承認し、L2節digest `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f` とL11節digest `029c6bcea5a206a15c8bbe9706ff25917fbf9a6496b3891288fc2660634f7bc0` に固定する。決定の`source_repository_revision`は `ea6f756f96a7370de78e412d737c7a7ed472114a`、`decision_basis_revision`は `81d1f35f9c5793c5312be4ae52526c96b609c254`。この二つを同一revisionと扱わない。

固定L2本文は `ea6f756f96a7370de78e412d737c7a7ed472114a:docs/helix-labo/L2-requirements/labo-requirements.md:576–584`（全体SHA-256 `cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6`、節SHA-256 `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f`）、固定L11は同revisionの `docs/helix-labo/L11-acceptance/labo-acceptance.md:309–316`（全体SHA-256 `39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a`、節SHA-256 `029c6bcea5a206a15c8bbe9706ff25917fbf9a6496b3891288fc2660634f7bc0`）である。PO行は `MPR-RC-HELIXLABO-L2-071-001` を参照する。候補中の `draft_candidate` は固定本文metadataであり、authority状態をそれ自体から読み替えない。

**旧HELIX sourceと処置**：選択inputは `LEGACY-ASSET-A6926200F28B26300432` の旧L1 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md:67,69`（revision `3795bf0dcb731231a0b5ca1faa3cb67bdfeda22a`のarchive bytes、file SHA-256 `e96a70f02c517f33d9cbdc43d92e6d7b36ded7bbf023226f1cc4f63b5f7c2765`、span 67–69 SHA-256 `ab29276edf0e04c4c163ab5d4e3889b0c845fbbd86fc0f7d23f8bd32a7ffdb4e`）である。3L-BR-008から、task class / model revision単位の評価、qualification・表示称号・permission/authority・assignment roleの分離、記録済みmajor missまたはmodel revision更新による資格対象revisionの失効だけを意味再導出する。

旧L3 `LEGACY-ASSET-A26561A0EF7396D8F017`（同archive revisionの `three-lane-cloud-governance-requirements.md:77–79`、file SHA-256 `4b388cda67484f1808b0f4b8834d5d234a47de49f7db6dcb12d92d2dcfbee185`、span SHA-256 `e7c4bec23a84c57b06c826c67ae19d011293a689d1b7463c10ea0d5950a313dd`）と旧acceptance `LEGACY-ASSET-E9D6CA411D75485A0984`（`three-lane-cloud-governance-acceptance.md:44–47`、file SHA-256 `785421188d23f371290ff5bacecba6c5215e7baa66110c461f548cae8f6a2fc7`、span SHA-256 `db3f977c22140f8ef9cb9628fa0341fe261daabaf7240051211df91ce6406993`）は歴史的contextに限る。旧7 class固定一覧、状態遷移列、expiry条件、provider/lane、旧runtime/test behaviorを移さない。未確認のconsumerを読み切ったとは主張しない。

**適用・責務境界**：対象task classは呼出し元が選択したscopeから受け取り、既定集合を作らない。qualification recordはtask class・model revision・evaluation scope・evidenceへ束縛する。表示称号、資格状態、permission/authority、assignment roleは別identity/fieldとして保持し、相互推論しない。LABOはqualification evidenceを記録・返却するだけで、provider/lane/modelの選択、評価実行、permission、assignment、authorityを発行/変更しない。permissionは既存SECURITY責務、assignmentは既存OS責務に残す。資格失効とpermission失効は別状態である。

**unknown・失効条件**：class、revision、scope、evidenceが不足・stale・矛盾するときはqualificationを `unknown`/未評価にする。記録済みmajor missは対象revisionのqualificationを失効させる。model revision更新は旧revisionのqualificationを失効させ、新revisionへ継承しない。major missの分類・rubric、数値threshold、task class既定値、expiry条件、再評価方法/時期を新設しない。不足した評価根拠は、個体source/owner identityを特定できるかにかかわらず、その根拠を供給する既存source owner責務区分へ返す。個体identity unknownは別に保持する。role名やqualification outcomeから未特定ownerを作らない。

**L2-055との関係**：採択済み `HELIXLABO-L2-055` のWorker履歴に基づく作業種別/model class別の水準・根拠・範囲・未評価集計は既存契約として再利用する。071が追補するのはGitHub監査task classとmodel revisionに結ぶqualificationおよび二つの固定失効条件である。055/059の一般評価・比較契約、OS assignment、SECURITY permission/expiry/revocationを複製・変更しない。

| NFR候補 | 対象・照合field | 期待状態 | 根拠・適用限界 |
|---|---|---|---|
| `NFR-LABO-071-01` — qualification binding | 選択task class、model revision、evaluation scope、evidence identity/revision、qualification state | 全keyが同じ対象を指す場合だけqualification stateを追跡可能にする。欠落/stale/mismatchはunknown/未評価。 | 固定L2/L11のbinding条件に由来。数値閾値、必須class集合、最低sample数は設定しない。 |
| `NFR-LABO-071-02` — invalidation provenance | recorded major-miss sourceと対象revision、model revision updateと旧qualification記録 | 対象資格だけを失効し、新revisionへ旧資格をコピーしない。事象・revisionの根拠欠落はunknown。 | triggerは固定親の二種類のみ。独自expiry、時間window、再評価schedule、重大度分類を作らない。 |
| `NFR-LABO-071-03` — field/authority isolation | title, qualification, permission, authority, assignment role, scope, source refsを独立fieldで照合。title→qualification、qualification→title、title→permission/authority/assignment、permission→assignment、assignment→permissionの各出力fieldを個別に比較する。 | 一 fieldの変化から他fieldを自動更新しない。FV CASE-r06-qualification-to-titleを含む。qualification invalidation時もpermission P0、assignment A0、authority H0は各independent source値と一致させる。 | qualificationからpermission・assignmentを生成しない。permissionのexpiry/revocation規則をLABOへ複製しない。各outputは既存SECURITY/OS状態のまま。 |

これらは固定意味から導く計測/追跡可能性の候補で、実測値・threshold・SLA・期限・合格率ではない。件数や欠落率を報告する場合の母集団は、事前選択されたscopeと現に利用可能なsource recordから受け取り、このparentで新設しない。

### HELIXLABO-L2-066 — A比較における誤修復・未解消数の測定可能性

状態：承認済みのL3。version_target: `1.0`。固定L2/L11は要件authority、POのL2採択は親のauthority登録であり、本節からL3承認・実装・比較run・実測合格を生成しない。

`LABO-066-NG-01` 候補：比較結果はA/candidate identityとversion、eligible set identity/revision、task/scope/target revision、oracle/scorer revision、protocol/toolchain/environment/cutoff、両群のresultとoracle receipt、unknown理由、2指標の分子/分母を追跡可能にする。

**候補値と根拠**：固定L2-066のcase分母N・oracleとの結合、L11-066の正常/誤り/unknown境界から必要なtrace fieldsを導く。測定値は合成B0入力・合成receipt上で分子/分母とsource revisionを再構成できるかで確認する。misrepair/unresolvedの間に排他条件を置かない。費用/時間/reworkのfield意味はL2-059の同じscope比較に合わせる。

許容率、速度値、性能threshold、sample count、運用期間、合否閾値は提案しない。計測できない場合はunknown/未評価を記録し、0や合格へ置換しない。これは根拠付き測定設計候補であり、実測結果・承認値ではない。

固定L2-066の固定target、許容率/tolerance、事前に課す試行件数、合否thresholdは、それぞれfunctional verification CASE-79–82で独立した禁止出力として照合する。既存のeligible set分母・観測済みreceipt数の表示は、新しい試行件数目標を課すこととは区別する。

## Stage 5 — HELIXLABO-L2-070 補助運用telemetryとAttempt scorecard併記

固定親はPO live26の49行が採択した `MPR-RC-HELIXLABO-L2-070-001`。source revision `ea6f756f96a7370de78e412d737c7a7ed472114a` のL2:561–574 SHA `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、L11:297–307 SHA `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1`をraw-LFで照合した。旧候補が参照した0abb2894の同範囲とbytesは一致し、採択状態はPO記録で確認する。

根拠付きの測定設計候補。数値、期間、severityの新閾値、性能SLOは設定しない。parameterごとのPO承認を求めない。

| 項目 | 測定対象 | 根拠・比較 | 限界 |
|---|---|---|---|
| duration fidelity | queue wait / active time / review wait / Human waitを個別値として保持。source-defined start/end event, clock, unit, occurred/observed time, scope/windowを追跡。 | 固定L2の4 duration clauses、FV CASE-01、05–09、23–50、52–53、63。 | 重複排他の推定、4値加算、059 wall-clock再定義なし。 |
| escaped-defect fidelity | 許可済みoracle/revision、受入済対象/scope、受入境界後のverified event relation、適用母数/追跡完全性を保持。 | 固定L2 escaped-defects節、FV CASE-01、03e、10–11、56–58、64。CASE-10は有効oracleのままの出力誤り拒否、CASE-56–58は入力不足時の既存責務区分への返却を個別照合。 | 新oracle/受入境界/追加の観測window/重大度/合否thresholdなし。 |
| rollback/Recovery fidelity | source event/result receipt、identity/scope/stateを保持し、059費用・時間とのreceipt参照を一回に保つ。 | 固定L2 rollback clause、FV CASE-03f/g、59–62、70、85、90–91。missing source inputは既存event/assignment責務区分へ返し、CASE-85/90/91はrollback trigger/permission/executionを、CASE-102/103はRecovery操作権限/実行をそれぞれ単独fieldで拒否。 | 観測から操作・trigger permissionを生成しない。 |
| observer overhead | source定義に従った直接測定資源をtask workから区分。 | 固定L2 overhead clause、FV CASE-03h、12、71。 | unknownを0や推計値にしない。 |
| evidence freshness | sourceの有効時刻と観測時刻の差だけを値として提示。 | 固定L2 freshness clause、FV CASE-03i、14–15。CASE-15は有効入力からの誤ったauthority出力を拒否し、070出力処理を訂正。 | ageからfresh/stale状態・expiry・適格性/admission/permissionを作らない。CASE-104–106は各単独field生成を拒否。 |
| metric identity | 067/068の定義revision/receiptと070 field identityを保持。 | 固定L2 Attempt co-presentationと既存12 metric境界、FV CASE-01、16–21、65–73、127–130。CASE-18/127は067/068のscope mismatchを個別に隔離し、CASE-128は汎用telemetryとscorecardのscope不一致を分離し、CASE-129/130は067/068のdefinition revision mismatchを個別に隔離する。CASE-19の有効067/068 inputからの換算出力を拒否し、CASE-68はtotal countとresult state双方をunknownにする。 | 065 retry等への換算・合算・代替、旧12指標へのsilent renameなし。 |
| 禁止success-rate生成 | 070の正常scorecard入力で`task_success_rate`と`attempt_success_rate`を各々一つだけ生成する誤出力。 | FV CASE-131/132で各禁止fieldを単独で拒否し、他の入力/scorecard fieldと既知・unknownのowner状態を保持する。 | 固定L2-068の「定義しない」を既存FR-LABO-068-03が生成禁止へ導く意味として適用する。070の固定9 atomとL11-070の分子/分母適用可能性なしのrate不出力も保ち、新しい分母・oracle・閾値・ownerは作らない。 |
| provenance fidelity | 各evidenceのsource identity/revision/provenance実値をsource receiptから保ち、正常出力のprovenanceと完全一致させる。 | 固定L2-070 freshnessとL2-001 source preservation、FV CASE-01/125/126。 | provenanceが欠落/不一致のLABO出力は訂正し、正常receipt供給元へ誤りを返さない。新provenance schemaを作らない。 |

authority境界の単独出力field確認はFV CASE-85–93/96–98/102–109/131/132に対応する。CASE-131/132は、固定L2-068の「定義しない」を既存FR-LABO-068-03が生成禁止へ導くtask success rate/Attempt success rateについて、070の9 atom/L11-070 rate不出力境界を保ち各出力を単独で拒否する。target revision/source revisionの一致確認はFV CASE-99–101に対応する。不足・stale・矛盾14セルと時計不正はCASE-110–124、正常入力からの一般telemetry scope不一致はCASE-128、067/068定義revision不一致はCASE-129/130、provenance出力の欠落/別値はCASE-125/126に対応する。性能・保持・監視周期を数値化する根拠は固定parentにない。必要な値が生じたら既存source定義と対の測定候補を記録し、閾値を推測で追加しない。
