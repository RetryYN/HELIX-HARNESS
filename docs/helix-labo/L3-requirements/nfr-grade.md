# HELIX-LABO L3 非機能要件・候補値（1.0対象親57件の草稿）

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

## 接続failureと業務failureの測定境界（L2-159/161）

connector identity/revision/schema/provenanceの技術failure判定とCONNECT側戻し先は、候補のCONNECT FR/AC/CASE対応表（L3 `functional-requirements.md` 冒頭）を参照する。各consumer receiptのidentity・admitted revision・scopeを照合し、他scope/旧revision流用、自由文/source joinだけの判定、CONNECT greenからの業務成功生成を認めない。L2-159/161の各packが持つ未完義務と明示戻し先、および各親L2の業務failure戻し先は別facetで保持する。L2-027/040が明記するCONNECT owner戻しは各固定scope内で維持する。

## 測定・承認境界

この表のcoverage/誤昇格0/誤帰属0/roundtrip完全性は親L2/L11の明示要素を漏れなく守る候補である。実測性能値の採否はテストfixtureとL4以降の実現可能性を踏まえ通常のL3承認へまとめて送る。個別parameter承認を要求しない。上流が指定する外部version/range/retention等があるときは当該source値を使い、新しい値を作らない。

## Stage 4 — 接続・受渡し契約の測定候補

これらはL2のsame-target/version/scope/receipt条件を測る候補であり、性能SLAや承認済み閾値ではない。旧UIL/Benchの値を継承しない。

| 親L2 | 候補値・比較 | 根拠と測定 | 適用限界 |
|---|---|---|---|
| `HELIXLABO-L2-036` | target identity/revision・connector・source provenanceの必要field一致100%候補、要求・contract直接書換え0 | target identity不明、revision欠落/stale、connector/source欠落を別々に変異し、target不明はOS routing候補、その他のsource不足はHARNESS ownerへの戻しを測る。 | latency、候補数、採択率は指定なし。 |
| `HELIXLABO-L2-037` | OS運転evidenceの観測field/target一致100%候補、ticket/routing/stateのLABO直接write 0 | ticket/WIP/placement/priority等を個別に変異し、OS ownershipのままcandidateが戻るか観測。 | OS全fieldを毎caseに要求しない。各fixtureで実在するscopeのみを対象にする。 |
| `HELIXLABO-L2-038` | 選択targetのrequired permission/scope/identity/source revision/owner relation coverage 100%候補、誤受領・LABO直接authority変更・restricted/raw credentialの通常packet流入0 | 直接authority変更のnegativeと、sanitized change proposalをSECURITYへ渡すpositiveを分ける。permission unknown、scope mismatch、restricted inputも個別に測る。 | 実権限は変更せず、提案candidate自体は判断材料として許容する。新data classification taxonomyやcredential scannerの性能閾値は追加しない。 |
| `HELIXLABO-L2-039` | selected Worker result identity/revision/routing一致100%候補、LABO割当/実行0 | execution/stop/recovery resultとOS/SECURITY routeを組み、片field欠落/不一致を独立変異。 | 未選択Worker/sourceを全runの必須依存にしない。 |
| `HELIXLABO-L2-040` | connection identity/採択scope/version/trace一致100%候補、mismatch成功昇格0 | 選択接続のcontract versionとretry/traceを別々に欠落・変異させてCONNECT returnを確認。 | 全CONNECT connectorの存在や具体retry回数/latencyは固定しない。 |
| `HELIXLABO-L2-041` | 選択Product Core identity/version/connector/meaning provenance一致100%候補、製品意味の汎用化0 | 複数の選択/未選択target、version mismatch、product-to-BRAIN mutationを比較する。 | 全製品connectorを一律必須にしない。 |
| `HELIXLABO-L2-054` | 055 payloadとINTELLIGENCE receiptのtask type/model class/level/basis/scope/unassessedおよび採択connector identity/revision/schema/provenance一致100%候補、割当・authority生成0 | 必須payload/receipt fieldとconnector条件の各単独欠落/不一致を変異し、異なる未評価jobを正常対照にする。受領不成立と責務境界への戻りを観測する。 | legacy 12 metrics/5 categories/score cutoffは使わない。固定task数・水準閾値も追加しない。 |
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
| `HELIXLABO-L2-007` | systemization候補について6条件（再現性、machine判定可能性、oracle、副作用限定、retry/rollback可能性、冪等性）の全件記録 | 6条件を個別に変異し、不成立理由を識別する。候補値として同一条件3反復を比較開始案、2回/5回案を安定性と費用で比較できる。 | 反復数は固定合否閾値でなく、親が必要とする比較可能性の測定候補。 |
| `HELIXLABO-L2-008` | rule/versionからexception・FP・avoidance・cost・return condition・ownerへのtrace completeness 100%候補 | 各項目欠落を独立mutateしunknown/return状態を確認。 | 自動切替率や障害時間閾値を追加しない。 |
| `HELIXLABO-L2-009` | 単一episodeの上位一般化0候補。repeated episodes案は独立3例を初期比較候補、2/5例と条件多様性を比較 | 親は一事例から一般化しないと明記。独立例数を2/3/5で比較し、範囲安定性・反例発見率・偽一般化・追加観測費用を測る。 | 3例はAI候補でありPO承認済値や固定閾値ではない。sample独立性/適用scope別に検証する。 |
| `HELIXLABO-L2-010` | feedback 16 required fields coverage 100%候補、未根拠field補完0 | 正常fixtureで16/16とtarget-specificityを照合し、各field欠落mutationで差戻しを観察。 | confidenceの尺度/閾値と候補採択率は親未指定。 |

候補数値は通常の対L10測定設計へまとめる。POへparameterごとに確認せず、数値がL2意味・scope・owner・versionを変える必要があると判明した場合だけL2へ戻す。


| 親L2 | 候補値・比較 | 根拠と測定 | 適用限界 |
|---|---|---|---|
| `HELIXLABO-L2-012` | provenance/relation revision/unknown保持候補、correlation-onlyからcausal claimを作る誤り0候補 | relation・episode revision不一致/欠落とco-timed unrelated eventを個別/併発入力 | relation/source owner return、causal overclaim 0 |
| `HELIXLABO-L2-013` | 分類軸/根拠のtrace completeness 100%候補 | 根拠field欠落・分類矛盾 mutation | Vector inputからsource evidenceへ往復 |
| `HELIXLABO-L2-014` | original meaning/purpose/conditionとcandidate delta 100% trace候補 | 元意味不明・partial evidence mutation | 不明時停止、ownerへbackflow |
| `HELIXLABO-L2-015` | 選択された実験条件（baseline/current、candidate、hybrid）のversion/condition/oracle一致100%候補。L2-059のHELIXなし/旧/新cohortとは独立fieldで保持する。 | 選択した実験条件ごとにcondition/oracleを変異し、選択条件の欠落と未選択conditionの不在を分けて照合する。 | 選択条件の比較成立/不成立を区別し、未選択conditionの不在だけで比較を失格にしない。cohort fieldの有無・選択状態はL2-015判定に使わない。 |
| `HELIXLABO-L2-016` | comparison/counterexample/oracle/interruption status全件保持候補 | oracle不一致・counterexample・中断を独立投入 | 判定不能をoperation候補に保留し、親または既存contractに明示された場合以外の戻し先を推測しない。 |
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
| `HELIXLABO-L2-027` | 各connection admitted contract identity/revision/schema/traceの一致候補、implicit cross-connector reuse 0 | 専用contract/schema/revision drift、暗黙共有を個別/併発変異 | mismatch/unknownを露出しCONNECT ownerへreturn |
| `HELIXLABO-L2-028` | assignment/task class/Worker result trace候補、L2-006と同experiment/target version/scope一致 | 別ticket/experiment/target version、assignment欠落、status unknownと専用connector identity/revision/schema/provenance不一致を個別変異 | observed→evaluated誤昇格0。assignment/result不一致はOS assignment ownerへ戻す。connector技術failureは先頭CONNECT候補pair表を参照し、receipt不成立を保留する |
| `HELIXLABO-L2-029` | target revision/test scope/CI status coverage 100%候補 | not-run/stale/interrupted/scope missing | pass誤表記0 |
| `HELIXLABO-L2-030` | product/source identity/version/scope分離100%候補 | different source merge、unselected product required化 | cross-identity merge0 |
| `HELIXLABO-L2-034` | generic candidateの支持episode/product/meaning scope trace 100%候補 | single/product-specific/顧客固有ルール/unknown scopeと専用connector identity/revision/schema/provenance欠落・stale・不一致を個別変異 | 1.0内部evidenceと2.0外部loopの混入0、connector技術failureは先頭CONNECT候補pair表で判定する。single case/適用範囲不明だけL2-009へ戻し、connection receiptのidentity/revision/scope不一致は受領保留 |
| `HELIXLABO-L2-035` | evaluation packetのsource revision/scope/unassessed state trace 100%候補 | revision/scope missing、unassessed omitted、専用connector identity/revision/schema/provenance不一致、3.0 learning request、052全材料収集/同一revision到達の完了偽装、054 Bench水準の混同を個別変異 | training/placement/bot execution 0。035 packet traceを052 closureや054 Bench評価と混同しない。connector技術failureは先頭CONNECT候補pair表で判定し、035の業務scopeはreceipt mismatchへ流用しない |
| `HELIXLABO-L2-058` | 呼出しごとのselected dependency closure coverage候補; selected missingをunselectedへ変換0; unselected source required化0 | none/Worker-only/multi-source/selected missing/unknown selectionに加えscope/source/operation/version各変更を個別に入力しclosure再照合 | 選択sourceだけclosureを再照合。未選択はunobserved、unknown selectionは確認へ。No selectionはunauthorized ingestを認めない |

## Stage 5 — LABO-L2-050/059/060/061/063/064/065/066/067/068/069/070/071 測定候補

値はL3/L10対の測定候補でありPO決定済み閾値ではない。適用範囲は選択scopeと親契約の分母に限り、未選択のcohort/sourceや全通常履歴へ拡張しない。

| NFR候補ID / 親 | 候補値／比較 | 根拠と測定 | 限界・未確定 |
|---|---|---|---|
| `NFR-LABO-L3-050-01` / `HELIXLABO-L2-050` | 同一ticket/experiment/target revisionの循環stage trace coverage 100%候補、未観測の後段完了claim 0 | 親はObservedから再観測/効果・退行評価まで列挙し、candidate/登録/変更/CI成功を完了としない。summaryの完了flagのみを見る案と、required stage別 receipt・owner traceを全照合する案を比べ、後者なら未完義務とowner還流を識別できるため候補にする。L10-050の各段階receipt欠落と誤昇格を測る。 | throughput/latencyや改善効果の共通閾値は新設しない。 |
| `NFR-LABO-L3-059-01` / `HELIXLABO-L2-059` | 選択比較にrequiredなtask/scope/oracle/scorer/protocol/hardware/decision/evidence tuple一致率100%候補、品質不合格の価格・速度相殺0、missing costを0化0、全cost componentの欠落/除外0候補 | Bench R-04〜08とAC-005〜013、親の品質優先・priority/tolerance・費用内訳を測る。全費用receipt合算とfirst candidate単価だけの比較を対置する。retry/救援/rework/CI/review/人修正 receiptを個別に欠落させ、accepted change=0、history流用、cohort/条件混同を別fixtureで照合する。未換算human timeは時間量と通貨を分離する。 | repeat/sample数、固定順位、human-time換算率は候補なし。必須品質と選択群の整合を保つ。 |
| `NFR-LABO-L3-060-01` / `HELIXLABO-L2-060` | 支援on/off比較pairの同一Worker/model/provider/version/effort/oracle/task条件一致100%候補、支援漏出・支援者を独立reviewer扱い0、選択範囲costの欠測を0化0 | 支援有無ラベルだけ比べる案と、同一設定tuple・実支援cost・reviewer identity/context/authorityの独立性を照合する案を比較し、後者を候補にする。L2-060はsupport availabilityだけを変える。L10-060の正常3者分離review→OS-L2-020同oracle rerunと各1条件差分、quality failureと低costの対照、missing price/human conversionを照合する。 | 支援経路の実行/割当、普遍的な効用差閾値はLABOの責務外。 |
| `NFR-LABO-L3-061-01` / `HELIXLABO-L2-061` | 選択scopeのtask snapshot 15/15 field一致候補、選択hidden oracleの隔離違反0、historical resultのcurrent性能流用0 | HELIX-Bench R-04/R-08、AC-005/006/012/013、HIL-NFR-35に沿って全15fieldとdigest/revisionを照合し、public/hidden境界を個別変異する。1回の完全fixture照合と同一snapshotの再実行案を比較し、field fidelityは前者、再現性差分は後者で測る。 | hidden oracle非選択だけで独立judge契約を解除しない。別契約で適用外が明示されたscopeのみ除外する。標本/retry値は親契約の適用scope内でだけ提示し、全LABO-055履歴へ持ち込まない。 |
| `NFR-LABO-L3-063-01` / `HELIXLABO-L2-063` | 選択されたrecipe/repeat finding/backlog/owner outcome間のrequired lineage coverage 100%候補、未根拠のfrequency claim 0、success closure後の未解決backlog/観測欠落を成功扱い0 | 旧Pillar HAC-P4-02a/bとL2-063が要求する対象版・条件・検証証拠を全照合する案と成功件数だけ集計する案を比較し、episode identity/condition/owner traceを保つ案を候補にする。L10でresend、異条件混合、warning/registration欠落、success terminal後の手順/backlog未解消、運用後観測receipt欠落を別々に測る。 | 反復threshold/母集団は親からの入力値を使い、新たな数値・期間を作らない。 |
| `NFR-LABO-L3-064-01` / `HELIXLABO-L2-064` | 選択blind pairのcandidate-name exposure 0、fixture/rubric/judge version/sample/retryの5固定条件一致100%候補 | 名前欄だけ遮蔽する案と、judge-visible全資料＋record側identity mapping＋5条件のdigestを照合する案を比較し、後者でmetadata漏れと条件driftを個別に計測する。 | 比較未選択の通常historyは分母にしない。固定sample/retry値や適格性thresholdは作らない。 |
| `NFR-LABO-L3-065-01` / `HELIXLABO-L2-065` | 選択資格scopeの8/8軸判定trace候補、および実task scorecardの6/6 field definition/result receipt coverage候補、共有author/judge contextによる独立性違反0 | summary totalだけの案と、各軸・各fieldをscope/oracle/rubric/tool版/receiptへ結ぶ案を比較する。L10では8軸個別欠落、6 fieldsのunknown/適用外/初回とretry区別、費用receipt、author/judge context共有、条件tuple不一致のtrend混合を測る。 | 通常Worker historyはqualification対象でない。diff/lintの未指定共通単位やfull-bench固定sample数を導入しない。 |
| `NFR-LABO-L3-066-01` / `HELIXLABO-L2-066` | 選択比較のeligible case全件に対する両群oracle/status receipt trace 100%候補、unknown除外/0化による分母改変0 | raw success countと、事前固定Nにおける群別`misrepair_count/N`・`unresolved_count/N`を比較し、分子・分母・case証拠を追える後者を候補とする。 | 新しい許容misrepair率、試行数、Aの定義を設けない。oracle不能caseはunknown/比較不能にする。 |
| `NFR-LABO-L3-067-01` / `HELIXLABO-L2-067` | 選択scopeのpredicate/oracle revision、candidate identity/digest、Attempt内変更event/result receiptの全trace候補。Attempt越境・round欠落の誤確定0候補 | 最終candidateだけからfirst-eligible/round数を推測する案と、事前predicate＋順序付き全eventを照合する案を比較し、後者を採る。L10でfirst eligible結果、round列、Attempt境界、欠落時unknownを測る。 | 頻度/成功率thresholdや新しいeligibility規則は置かない。 |
| `NFR-LABO-L3-068-01` / `HELIXLABO-L2-068` | 完全性が確認された選択OS Attempt集合のdistinct identity数と集計一致100%候補、欠測を総数/0へ変換0 | retry_count等から算出する案とOS identityを一意化しcomplete receiptと照合する案を比較し、後者を候補とする。L10でduplicate、pre-execution refusal、scope外、event gapを別々に計測する。 | Attempt成功率やretry上限を追加せず、source completeness不明では総数を出さない。 |
| `NFR-LABO-L3-069-01` / `HELIXLABO-L2-069` | reason/scope/revision/windowごとの母数・source completeness・return/reissue結果traceを全件照合する候補。未追跡/打切りを0 defect化0候補 | 総return件数だけの案、率だけの案、reason別count＋明示分母＋成立/不成立/未評価を並べる案を比較し、最後の案を候補にする。L10でwindow未満・欠測・単純count reductionと根拠relationの有無を測る。 | rate threshold、観測期間や因果効果を決めない。O2 request snapshotはtask input由来で、PO発言sourceではない。 |
| `NFR-LABO-L3-070-01` / `HELIXLABO-L2-070` | 9 selected atomの各fieldをscope/revision/window/source event receiptへtraceする候補、double-count・silent rename・根拠なし推定0候補 | summary完了flag案とfield別definition/event/receipt照合案を比較し、後者は欠落fieldと重複を識別できるため候補にする。L10で4 duration・oracle済defect・rollback/overhead/freshness・067/068 co-present fieldを別々に測り、4個の個別duration fieldを別々に照合し、親に総所要時間の合算oracleがないためaggregateを算出しない。 | freshness期限、escaped defect window、overhead推計、旧12指標への対応規則は作らない。重複区間の存在だけで個別durationを無効にしない。 |
| `NFR-LABO-L3-071-01` / `HELIXLABO-L2-071` | class/model revision/評価根拠/qualification状態の同一scope trace候補、称号由来qualification・資格由来permission/assignment mutation 0候補 | qualification status単独を記録する案とclass/revision/evidence scope付きtupleを記録する案を比較し、後者でstale資格と誤ったidentity結合を識別できるため候補にする。L10でmajor miss、revision change、title/permission/assignmentの独立変異を測る。 | 数値threshold、class既定集合、失効後の再bench schedule/permission policyは固定しない。 |

これらは提案値である。L3承認に個別parameter gateを追加しない。必要な測定値が固定親に指定されていない場合は、候補・比較理由・観測方法を同一のL3/L10 packageで示す。
