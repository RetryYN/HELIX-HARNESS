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

## Stage 4 — 接続・受渡し契約の測定候補

これらはL2のsame-target/version/scope/receipt条件を測る候補であり、性能SLAや承認済み閾値ではない。旧UIL/Benchの値を継承しない。

| 親L2 | 候補値・比較 | 根拠と測定 | 適用限界 |
|---|---|---|---|
| `HELIXLABO-L2-036` | target revision/connector/source provenanceの必要field一致100%候補、要求・contract直接書換え0 | L2/L11はscope付きHARNESS feedbackと意味書換え/即時変更の否定を示す。fieldごと欠落/改変するcaseと有効な未見正常sourceを比較する。 | latency、候補数、採択率は指定なし。 |
| `HELIXLABO-L2-037` | OS運転evidenceの観測field/target一致100%候補、ticket/routing/stateのLABO直接write 0 | ticket/WIP/placement/priority等を個別に変異し、OS ownershipのままcandidateが戻るか観測。 | OS全fieldを毎caseに要求しない。各fixtureで実在するscopeのみを対象にする。 |
| `HELIXLABO-L2-038` | 選択targetのrequired permission/scope/identity/source revision/owner relation coverage 100%候補、誤受領・LABO直接authority変更・restricted/raw credentialの通常packet流入0 | 直接authority変更のnegativeと、sanitized change proposalをSECURITYへ渡すpositiveを分ける。permission unknown、scope mismatch、restricted inputも個別に測る。 | 実権限は変更せず、提案candidate自体は判断材料として許容する。新data classification taxonomyやcredential scannerの性能閾値は追加しない。 |
| `HELIXLABO-L2-039` | selected Worker result identity/revision/routing一致100%候補、LABO割当/実行0 | execution/stop/recovery resultとOS/SECURITY routeを組み、片field欠落/不一致を独立変異。 | 未選択Worker/sourceを全runの必須依存にしない。 |
| `HELIXLABO-L2-040` | connection identity/採択scope/version/trace一致100%候補、mismatch成功昇格0 | 選択接続のcontract versionとretry/traceを別々に欠落・変異させてCONNECT returnを確認。 | 全CONNECT connectorの存在や具体retry回数/latencyは固定しない。 |
| `HELIXLABO-L2-041` | 選択Product Core identity/version/connector/meaning provenance一致100%候補、製品意味の汎用化0 | 複数の選択/未選択target、version mismatch、product-to-BRAIN mutationを比較する。 | 全製品connectorを一律必須にしない。 |
| `HELIXLABO-L2-054` | 055 payloadとINTELLIGENCE receiptのtask type/model class/level/basis/scope/unassessed一致100%候補、割当・authority生成0 | 必須fieldの各単独欠落/変異と併発を測り、異なる未評価jobを正常対照にする。 | legacy 12 metrics/5 categories/score cutoffは使わない。固定task数・水準閾値も追加しない。 |
| `HELIXLABO-L2-052` | 選択targetの035/source/receipt identity・revision・scope・status・unassessed・owner relation coverage 100%候補、誤受領0 | summary/部分edge照合と全required tuple/owner別traceを比較し、schema mismatch、revision stale、scope mismatch、receipt missingも個別/併発投入してsourceまで往復照合。 | 選択契約のrequired relationだけを分母にする。未選択sourceは必須にせず、035 payload schemaの複製、training/model change、bot・placement outcomeを測定対象にしない。 |

比較案はsummaryまたは部分edgeの一致確認と、選択targetの全required tupleをsource/owner別に結ぶ照合を並べる。前者は簡易だが、一つの欠落edgeや誤受領を隠し得るため、後者を候補とする。各選択scopeで契約が要求するidentity・source revision・scope・status・receipt・owner relationを分母としてrequired-relation coverageを測り、欠落/不一致を受領成功した数とLABOからの直接authority変更数を別々に数える。目標候補はrelation coverage 100%、誤受領・直接変更0。99%比較は少なくとも一つのrelation欠落を許すため採らない。未選択target/sourceは分母や一律gateへ加えず、親にない標本数・反復数・時間目標も固定しない。必要性が後続測定で判明すれば根拠・比較・計測方法付き候補を同一のL3/L10承認パッケージに加える。parameterごとの人間gateは設けない。


## Stage 2b 基本エンジンの測定候補（未承認）

以下はL2の明示保証を観測可能にする候補。固定性能SLAではなく、L3/L10一体で比較し通常承認へ提示する。旧Bench/RCLSの数値やtest countは継承しない。

| 親L2 | 測定候補・比較 | 根拠／測定方法 | 適用限界 |
|---|---|---|---|
| `HELIXLABO-L2-002` | episode edge provenance coverage 100%候補、time/path-only causal claim 0 | 親がsource/revisionに結ぶepisode、時間だけでは因果断定しないと明記。relationごとsource参照を検査し、近接無関係mutationを投入。 | 現候補はsource relation evidenceとtime/path-only counterexampleで測る。数値windowが必要な別の評価では比較案/測定方法付きcandidateを提示する。 |
| `HELIXLABO-L2-003` | 親列挙9分類の区別率100%候補、unknown/contradiction消失0 | 9分類を有限fixtureに個別投入し、分類fieldと根拠の分離を照合。 | 頻度/重みの性能値はこの機能ACに不要。別の評価判断で必要な場合はscope別に根拠・比較・測定付き候補として出す。 |
| `HELIXLABO-L2-004` | purpose/structure/behavior/assumption/constraint/guarantee/cost 7-field coverage 100%候補 | 親の列挙要素を一つずつmissing変異にして候補を停止/unknownへ戻せるか測る。 | 各方式の意味スコア/類似度閾値は未指定。 |
| `HELIXLABO-L2-005` | action候補が許可語彙内、意味差/適用条件/owner trace completeness 100%候補 | 親列挙12 actionから各候補を作り、維持/変更fieldとsourceを再構成する。 | 各actionの優先順位/採択率は親未指定。 |
| `HELIXLABO-L2-006` | 条件/assignment/oracle/source result coverage、cost欠測を0扱いする誤り0候補 | baseline/current/candidate/hybridで同一条件fixtureと個別欠落・中断を測定。 | 実験回数・統計的power・時間/cost SLAは未指定。比較候補は同一条件の1回以上と複数反復案（3/5回等）を並べ、分散/再現性・費用から測定設計で選ぶ。 |
| `HELIXLABO-L2-007` | systemization候補について5条件（再現条件、machine判定可能性、oracle、副作用範囲、retry/rollback/idempotence）の全件記録 | 5条件を別々に変異し、不成立理由を識別する。候補値として同一条件3反復を比較開始案、2回/5回案を安定性と費用で比較できる。 | 反復数は固定合否閾値でなく、親が必要とする比較可能性の測定候補。 |
| `HELIXLABO-L2-008` | rule/versionからexception・FP・avoidance・cost・return condition・ownerへのtrace completeness 100%候補 | 各項目欠落を独立mutateしunknown/return状態を確認。 | 自動切替率や障害時間閾値を追加しない。 |
| `HELIXLABO-L2-009` | 単一episodeの上位一般化0候補。repeated episodes案は独立3例を初期比較候補、2/5例と条件多様性を比較 | 親は一事例から一般化しないと明記。独立例数を2/3/5で比較し、範囲安定性・反例発見率・偽一般化・追加観測費用を測る。 | 3例はAI候補でありPO承認済値や固定閾値ではない。sample独立性/適用scope別に検証する。 |
| `HELIXLABO-L2-010` | feedback 16 required fields coverage 100%候補、未根拠field補完0 | 正常fixtureで16/16とtarget-specificityを照合し、各field欠落mutationで差戻しを観察。 | confidenceの尺度/閾値と候補採択率は親未指定。 |

候補数値は通常の対L10測定設計へまとめる。POへparameterごとに確認せず、数値がL2意味・scope・owner・versionを変える必要があると判明した場合だけL2へ戻す。


| 親L2 | 候補値・比較 | 根拠と測定 | 適用限界 |
|---|---|---|---|
| `HELIXLABO-L2-012` | relation revision/unknown保持100%候補 | relation・episode revisionを個別に欠落/不一致化 | 訂正sourceへ戻す。不一致を分類成功へ昇格しない |
| `HELIXLABO-L2-013` | 分類軸/根拠のtrace completeness 100%候補 | 根拠field欠落・分類矛盾 mutation | Vector inputからsource evidenceへ往復 |
| `HELIXLABO-L2-014` | original meaning/purpose/conditionとcandidate delta 100% trace候補 | 元意味不明・partial evidence mutation | 不明時停止、ownerへbackflow |
| `HELIXLABO-L2-015` | baseline/current/candidate/hybridのversion/condition/oracle一致100%候補 | 比較armの各条件を個別にずらす | 比較成立/不成立を区別 |
| `HELIXLABO-L2-016` | comparison/counterexample/oracle/interruption status全件保持候補 | oracle不一致・counterexample・中断を独立投入 | 判定不能をoperation候補に保留 |
| `HELIXLABO-L2-017` | current guarantee/revision/unfinished obligations/owner trace 100%候補 | current versionまたはownerを欠落 | switch実行0、owner returnを記録 |
| `HELIXLABO-L2-018` | supported scope/evidence/counterexample coverage 100%候補 | sample condition欠落・反例追加 | evidence以上のscope拡張0 |
| `HELIXLABO-L2-019` | target-specific proposal/evidence/identity一致100%候補 | target identity欠落/target混合 | 不明targetはOSへrouting候補として返す |
| `HELIXLABO-L2-020` | fallback後のold/new rule revision、unfinished obligation、result provenance 100%候補 | 各fieldを個別欠落/古くする | source owner return、success observation偽装0 |
| `HELIXLABO-L2-021` | permitted HARNESS observationのsource/revision/authority/scope一致100%候補 | connector/scope/revision欠落・unauthorized | HARNESS authority保持、無許可取込0 |
| `HELIXLABO-L2-022` | OS event ID/revision/status/unfinished-state一致100%候補 | stale/missing ticket/assignment/receipt | complete/unknown混同0 |
| `HELIXLABO-L2-023` | BRAIN source revision/usage result trace 100%候補 | identity/permission欠落とwriteback mutation | canonical knowledge writeback 0 |
| `HELIXLABO-L2-024` | observed fact vs judgment/source version分離100%候補 | historical/stale result current化 mutation | current authority生成0 |
| `HELIXLABO-L2-025` | selected SECURITY data-use scope coverage 100%候補、restricted payload transfer 0 | scope欠落/restricted field/stale rev | intake拒否、security ownerへ戻す |
| `HELIXLABO-L2-026` | resource/environment source-version coverage 100%候補 | stale/unknown resource state | current healthyへのcoercion 0 |
| `HELIXLABO-L2-027` | connection source/schema/trace concordance 100%候補 | schema drift/trace mismatch | unknown/holdが正しく露出 |
| `HELIXLABO-L2-028` | assignment/task class/Worker result source trace 100%候補 | assignment欠落・status unknown | observed→evaluated誤昇格0 |
| `HELIXLABO-L2-029` | target revision/test scope/CI status coverage 100%候補 | not-run/stale/interrupted/scope missing | pass誤表記0 |
| `HELIXLABO-L2-030` | product/source identity/version/scope分離100%候補 | different source merge、unselected product required化 | cross-identity merge0 |
| `HELIXLABO-L2-034` | generic candidateの支持episode/product/meaning scope trace 100%候補 | single/product-specific/unknown scope fixture | 1.0内部evidenceと2.0外部loopの混入0 |
| `HELIXLABO-L2-035` | evaluation packetのsource revision/scope/unassessed state trace 100%候補 | revision missing/unassessed omitted/3.0 learning request | training/placement/bot execution 0 |
| `HELIXLABO-L2-058` | 呼出しごとのselected dependency closure coverage 100%候補; selected missingをunselectedへ変換0; unselected source required化0 | none/Worker-only/multi-source/selected missing/unknown selectionの有限条件行列 | 選択sourceだけclosureを要求。未選択はunobserved、unknown selectionは確認へ。No selectionはunauthorized ingestを認めない |
