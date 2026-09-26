---
title: "HELIX-LABO機能単位要求の受入候補"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: acceptance
status: draft
authority_status: draft_candidate
freeze_blocking: true
created: 2026-09-27
updated: 2026-09-27
pair_artifact: docs/helix-labo/L2-requirements/labo-requirements.md
parent_l1_candidate: docs/helix-labo/L1-planning/labo-intent.md
---

# HELIX-LABO機能単位要求の受入候補

本書は[HELIX-LABO L2候補](../L2-requirements/labo-requirements.md)と対になる未採択受入案である。全項目は未実行であり、文書・静的確認・validator成功を利用者受入、L1/L2採択、L3承認、実装・実験許可へ変換しない。契約identity・版・依存・検証範囲はHARNESS-L2-010/011の共通pack contractに従う。ここで新しいpack契約を定義しない。

各シナリオは、対象source revision、契約版、成果物版、依存版、入力集合、期待出力、失敗時の戻し先、未完義務を記録する。版不一致、部分成功、source欠落を全体成功と混同しない。具体的な数値閾値はPO原文・L1にない限り固定しない。

## HELIXLABO L1要求のL2/L11受け先と版

次表は、各親L1の条件がどのL2本文および同一IDのL11受入行に対応するかを示す。後続版の受入行も候補として保持し、1.0の受入依存にしない。

| 親L1 | 対応するHELIXLABO-L2-xxx本文 / 同一IDのHELIXLABO-L2-xxx L11受入行 | version_target |
|---|---|---|
| HELIXLABO-L1-001 | HELIXLABO-L2-001, 021–032 | 1.0（021–030）。031/032は採択済みsource contractがある場合の任意接続 |
| HELIXLABO-L1-002 | HELIXLABO-L2-002, 011, 012 | 1.0 |
| HELIXLABO-L1-003 | HELIXLABO-L2-003, 012, 013 | 1.0 |
| HELIXLABO-L1-004 | HELIXLABO-L2-004, 005, 013–015 | 1.0 |
| HELIXLABO-L1-005 | HELIXLABO-L2-006, 015, 016, 018 | 1.0。006の実験実行はOS割当Workerによる |
| HELIXLABO-L1-006 | HELIXLABO-L2-007, 008, 016, 017, 020 | 1.0 |
| HELIXLABO-L1-007 | HELIXLABO-L2-009, 010, 019, 034–042, 052 | 1.0。個別target接続はそのsource/target contractに従う |
| HELIXLABO-L1-008 | HELIXLABO-L2-050 | 1.0 |
| HELIXLABO-L1-009 | HELIXLABO-L2-033, 034, 051 | 2.0（外部知識経路の033/051）。034の内部generic evidenceは1.0で、051/033は1.0の必須依存ではない |
| HELIXLABO-L1-010 | HELIXLABO-L2-010, 019, 035, 052, 053 | 1.0評価材料（010/019/035/052、受け手側親 HELIXINTELLIGENCE-L1-018）、3.0+学習・調整・評価材料循環（053）。学習側親はHELIXINTELLIGENCE-L1-021, HELIXINTELLIGENCE-L1-022, HELIXINTELLIGENCE-L1-023, HELIXINTELLIGENCE-L1-024, HELIXINTELLIGENCE-L1-025, HELIXINTELLIGENCE-L1-026 |
| HELIXLABO-L1-011 | HELIXLABO-L2-054, 055 | 1.0。Bench水準生成055とINTELLIGENCE接続054を分離し、054の受け手側親をHELIXINTELLIGENCE-L1-010とする |

## 単体要求の受入

| 対応L2 | 成功条件 | 反例・不成立条件 |
|---|---|---|
| HELIXLABO-L2-001 | 複数sourceから許可された成功、失敗、拒否、取消、blocked、unknown、not_observedを入力し、それぞれのsource identity/revisionと列挙されたobservation fieldsを保持できる。元source authority/stateはsource側に残る | 成功ログだけを受け取り失敗・拒否を落とす、not_observedをsuccessへ変える、source revision不明をcurrentとして使う、権限外/secret dataを取り込む、LABO側記録をsource正本として書き戻す |
| HELIXLABO-L2-002 | 要求→ticket→Worker→実装→atomic CI→integration→proof CI→release→deployment→runtime→incident→recoveryをepisodeへ結び、要求revision・actor/provider/model/configuration・artifact・環境を追える。相関できないeventも孤立として残る | 時刻/path一致だけで因果断定する、無関係eventを一episodeへ結合する、欠けた義務を補完して完了扱いする、訂正で元eventを上書きする |
| HELIXLABO-L2-003 | 一episodeに成功/失敗・条件・汎用/product固有・system/operation・unknown/unnecessaryが併存する入力を与え、別々に根拠付き分類できる | episode全体を一括採否する、unknownを推測で分類する、条件付きの成功を無条件一般化する |
| HELIXLABO-L2-004 | 方式A/Bのpurpose, structure, behavior, assumption, constraint, guarantee, costを保ち、部分一致と条件依存差を含む比較candidateを作れる | 元方式の意味を読む前に変換する、部分一致を全体同等とする、candidateをauthorityまたは採択済みに表示する |
| HELIXLABO-L2-005 | 12種の変換operationを個別に表現し、保持・変更する意味、条件、適用範囲を比較できる。吸収・移管・operation復帰も候補に残る | 仕組みの追加件数を改善指標にする、意味変更を技術的refactorに偽装する、LABO自身が採択・retireを実行する |
| HELIXLABO-L2-006 | 同条件のcurrent/candidate/hybrid実験をOS assignmentに従うWorkerが実行し、OS ticket/assignment（L2-022）とWorkerの結果（L2-028）を同じexperiment・対象版へ結び、品質、success/failure、FP/FN、rework、speed、CI/Worker time、token/API cost、人介入、context、complexity、recovery、release lead、ops load、再利用性と反例を評価できる | LABOがWorkerを選定・割当・起動する、OS assignmentのない実行を割当済みとして扱う、ticket/experiment/対象版が異なる証拠を結合する、「一度動いた」だけで改善認定する、baseline差・oracle差を隠す、比較不能や中断を成功にする、必要な品質を下げて速度を改善扱いする |
| HELIXLABO-L2-007 | 同条件の再現性、機械判定、oracle、副作用範囲、retry/rollback/idempotencyを示す根拠と、shadow等の候補段階を区別できる。文脈依存・例外多数・oracle不完全・FP高はoperation候補に残る | system化率を最大化する、operationを未完成扱いする、自動shadow→production昇格や新承認手続きが前提になる |
| HELIXLABO-L2-008 | system ruleの例外、誤検知、workaround負担、変更費用増加を与え、system継続/修正またはoperation復帰候補を出し、保証と未完義務を保持する | systemを永続固定する、operation復帰を失敗/退役と誤表示する、LABOが運用切替を実行する |
| HELIXLABO-L2-009 | 単一episode、反復episode、cross-project、cross-product、generic structureの各証拠を分け、主張できる最大範囲と反例を出力する | 1例をcross-productへ一般化する、product固有意味をBRAINへ送る、反例で範囲を狭めない |
| HELIXLABO-L2-010 | 一つの実験から複数target向けFeedbackを生成し、全minimum fields、evidence、scope、counterexample、regression risk、revalidation conditionを備え、提案状態で保持する | 必須field欠落を推測補完する、Feedbackだけでtarget変更/ticket/権限/配置を生成する、target authorityをLABOへ移す |

| HELIXLABO-L2-055 | Worker作業履歴を作業種別・model classごとに集計し、水準・根拠・評価範囲と評価済み/未評価状態を生成できる。配置案・指定・割当ては生成しない | 未評価modelを評価済みと表示する、履歴だけで未知jobの成功を保証する、LABO/Benchが配置案・指定・割当て・権限変更を行う |

## 接続要求の受入

| 対応L2 | 成功条件 | 反例・不成立条件 |
|---|---|---|
| HELIXLABO-L2-011 | observation fields、source revision、欠測をAggregateからCorrelateへ渡し、episodeと元観測を往復参照できる | IDやsource revisionを欠落させる、単体engine成功を接続成功へ写す |
| HELIXLABO-L2-012 | episode evidenceからdecompositionへ辿れ、分類の根拠・反証が残る | relation版違いを黙って受け入れる、相関を因果として転送する |
| HELIXLABO-L2-013 | 分解の各軸と証拠をVector比較へ渡し、unknownや条件依存も保持する | 分類根拠を失う、unknownを成功要素として扱う |
| HELIXLABO-L2-014 | 元の目的・構造・条件と部分比較をTransformationへ渡し、候補変更との差分を追える | 元の意味・適用条件が欠けても変換する、candidateを変更済み正本へ昇格する |
| HELIXLABO-L2-015 | current/candidate/hybridそれぞれの版、条件、oracle、scopeがexperiment inputで区別できる | baselineまたはcandidateの版不一致、oracle欠落、条件変更を隠して比較成立とする |
| HELIXLABO-L2-016 | Experiment結果・反例からAssurance Allocationへ、比較可能性とoracleを保って渡す | 実験実行のみでsystem化適格と判定する、反例を欠落させる |
| HELIXLABO-L2-017 | Assurance結果からOperational Fallbackへ、system/operation条件と未完義務を引き継ぐ | LABO結果だけでsystem切替、例外・保証消失を成功とする |
| HELIXLABO-L2-018 | 比較結果の標本・条件・反例をGeneralizationへ渡し、適用範囲を限定できる | 単一caseを一般構造として渡す、母数や条件を落とす |
| HELIXLABO-L2-019 | 範囲付き結果からtargetごとにFeedbackを分け、target/responsibilityとevidenceを保持する | generic/product-specific/OS/INTELLIGENCE責務を混ぜる、target未確定の候補を確定routingとする |
| HELIXLABO-L2-020 | operation復帰後の結果が新しい観測として集積され、前後のrule版・未完義務へ辿れる | source状態を上書きする、復帰後観測を別版と区別しない |
| HELIXLABO-L2-021 | HELIX-HARNESSから個別connectorで許可observationを受け、source revisionと契約版を保つ | source authorityを移す、未許可scope/staleを通す |
| HELIXLABO-L2-022 | HELIX-OSから個別connectorで許可運転・ticket・証拠を受け、未完/unknownを保つ | OS正本を書き換える、未完を完了化する |
| HELIXLABO-L2-023 | BRAINから個別connectorで許可利用/変更結果を受け、source版を保つ | BRAIN正本をLABOへ移す |
| HELIXLABO-L2-024 | INTELLIGENCEから個別connectorで許可判断/評価結果を受け、現行判断と過去評価を区別する | 稼働中判断を過去実績と混ぜる |
| HELIXLABO-L2-025 | SECURITY scopeに適合する安全性/incident evidenceだけを個別connectorで受ける | restricted dataやauthorityをLABOへ取り込む |
| HELIXLABO-L2-026 | INFRASTRUCTUREから許可resource/runtime evidenceを個別connectorで受け、source版を保持する | resource authorityを移す、staleをcurrent扱いする |
| HELIXLABO-L2-027 | HELIX-CONNECTの個別connection contract/provenance/schema版を経由した許可observationを受ける | connectorを全sourceで暗黙共用する、drift/unknownを隠す |
| HELIXLABO-L2-028 | Workerから許可作業結果を受け、責務とOS assignment/ticketへ照合し、実験結果ならL2-006のexperiment・対象版へ同一性を保って渡す | Workerを機構・authority ownerとして扱う、assignmentを推測する、別ticket/experimentの実績を同一比較へ混ぜる |
| HELIXLABO-L2-029 | CI/testから許可結果を受け、対象revisionと検査範囲を保持する | stale/未実行をpassと扱う |
| HELIXLABO-L2-030 | Product Coreから許可された製品利用・結果を個別に受け、製品meaningを保持する | 異なるproduct sourceを一つの正本へ混ぜる |
| HELIXLABO-L2-031 | 採択済みsource contractがある場合にWeb productごとの許可された利用結果を個別に受ける。Web公開・Web要求採択がないことをLABO 1.0の不成立にしない | 異なるWeb product sourceを混ぜる、未採択candidateを要求扱いする、製品meaningをsourceから剥がす |
| HELIXLABO-L2-032 | 採択済みsource contractがある場合にWEB-OS観測を個別scope付きで受ける。Web/WEB-OS実運用はLABO 1.0の必須前提ではない | Web productとWEB-OSを同一authorityとする、scope不明のtenant/customer dataを通す、未採択Web候補を要求扱いする |
| HELIXLABO-L2-033 | 2.0の外部source acquisitionからprovenance付き対象を受け、由来不明を保留する | external命令/patchを直接実行する、取得source/時点/範囲を欠いたまま評価する |
| HELIXLABO-L2-034 | 複数meaning/product/episodeで支持されたgeneric structure candidateだけを根拠・範囲付きでBRAIN向けに出す | product meaning、顧客固有ルール、一事例のみのpatternをgenericとして送る |
| HELIXLABO-L2-035 | 判断精度、failure corpus、counterexample、model/provider比較、FP/FN、diagnosis/review/bot結果と未評価印を定義済みpayloadとしてINTELLIGENCE境界へ渡せる | LABOが現行判断・配置・botを実行する、未評価を評価済みに変える、HELIX-Bench水準を別定義する、材料受渡しで学習許可とする |
| HELIXLABO-L2-036 | V-model、要求形成、design obligation、verification contract、backflow、境界調整、refactor、release criteria、ops-maintenanceの問題candidateをHARNESSへscope付きで返せる | 要求意味をLABOが書き換える、実験結果で工程contractを即時変更する |
| HELIXLABO-L2-037 | ticket/WIP/worker placement/priority/CI profile/inspection/integration/release promotion/retry/recovery/cost/order/stateの運転問題をOS向け提案として返せる | LABOがticketを発行・割当・優先・実行/state更新する、OS routingを飛ばす |
| HELIXLABO-L2-038 | 認可・隔離・credential・情報保護の候補をSECURITYへ渡し、authorityとdata scopeを維持する | LABOが権限を変更する、restricted dataを通常evidenceへ流す |
| HELIXLABO-L2-039 | Worker実行・停止・復旧のcandidateがOS/SECURITYのtarget routingを経て扱われ、Worker割当はLABO外に残る | LABOがWorkerを直接変更・割当する |
| HELIXLABO-L2-040 | 内外接続、retry、contract version、traceのcandidateがCONNECTへ接続単位で渡る | LABOがconnector contractを直接変更する、接続版/trace欠落を隠す |
| HELIXLABO-L2-041 | product固有meaning/要求/設計/domain/UXを該当Product Coreへ渡す | product固有意味をBRAINへ汎用化して送る |
| HELIXLABO-L2-042 | 採択済み接続がある場合に限りcandidateをWEB-OSへ渡し、WEB-OS state/authorityと本体OSを区別する。接続不在はLABO 1.0の不成立にしない | WEB-OS authorityを本体OSやLABOが更新する、未採択Web要求を現行扱いする |
| HELIXLABO-L2-054 | 055の作業種別・model class別水準、根拠、評価範囲、未評価状態を同じscopeのままINTELLIGENCEへ接続し、INTELLIGENCE案とOS指定/割当てを別状態で保つ | 接続中に水準・評価状態・scopeを変える、LABOがworker/modelを割り当てる、過去水準から未知jobの成功を保証する、scoreでscope/branch/merge authorityを変える |

## 構成体受入

| 対応L2 | 成功条件 | 反例・不成立条件 |
|---|---|---|
| HELIXLABO-L2-050 | ObservedからLABO再観測までidentityと未完義務を追い、実験では同じticket/experiment/対象版にOS assignmentとWorker実行結果が対応することを確認し、target変更後の効果・退行を独立に評価できる。candidate、登録、変更、検証、運用、再観測を別状態で表示する | assignmentのない実行を割当済みとする、別ticket/experiment/対象版の証拠を結合する、Feedback発行、OS登録、target変更、CI成功だけで改善完了とする、採択前candidateを正本扱いする、元記録を書き換える |
| HELIXLABO-L2-051 | 2.0対象の外部sourceでprovenance/revision/取得範囲を検査し、分解・比較・実験後だけBRAIN向けcandidateを出す | external成功例を直接importする、外部命令/patchを評価前に実行する、由来欠落を既知扱いする、2.0未実装で1.0循環を不成立にする |
| HELIXLABO-L2-052 | 035のpayload契約で評価済みepisode・反例・判断材料を送り、sourceとINTELLIGENCE receiptが同一revision・適用範囲・未評価状態を示す | payloadを035と重複定義する、異revision/範囲の受領を成功とする、training/調整を必須化する、材料からmodel変更・bot稼働を自動化する |
| HELIXLABO-L2-053 | 3.0+でLABO評価材料の利用区分を保ち、HELIXINTELLIGENCE-L1-021, HELIXINTELLIGENCE-L1-022, HELIXINTELLIGENCE-L1-023, HELIXINTELLIGENCE-L1-024, HELIXINTELLIGENCE-L1-025に沿う領域/能力別の学習候補の由来・設定・適用範囲・戻し先を追跡できる。同一責務範囲・比較可能corpusでの評価結果をHELIXINTELLIGENCE-L1-026に沿ってLABOへ返し、OS ticket、Worker実行、model lineageを結べる。一つの万能モデルへの統合は要求しない | training/validation/evaluation/holdout/prohibitedを混同する、model lineageや比較結果を失う、未知scopeへ性能を外挿する、LABOの独立評価へ結果を返さない、3.0+機能を1.0必須依存にする、LABOが学習/調整/model切替を直接行う |

## [PO原文§24](../sources/labo-core-engine-po-original-2026-09-26.md)の15不変条件に対する受入照合

各行はPO原文の一条件に一対一で対応する。対応するL2 IDとその同一IDのL11単体・接続・構成体受入行で成功・反例を確認する。

| # | PO原文§24の条件 | 対応L2/L11 | 成功条件 | 反例・不成立条件 |
|---:|---|---|---|---|
| 1 | LABOは全HELIXの観測結果を横断して扱える。 | HELIXLABO-L2-001, 021–032 | 各許可sourceのobservationが個別identity/revisionを保ってLABOへ到達する。 | source scope未許可・欠落のまま横断済みとする、sourceを同一identityへ混ぜる。 |
| 2 | 原state/authorityをLABOへ集中させない。 | HELIXLABO-L2-001, 021–042 | source/target stateとauthorityは各機構に残し、LABOはobservation/candidateのみ保持する。 | LABO記録をsource正本として書き戻す、Feedbackで直接state/authorityを変更する。 |
| 3 | 成功だけでなく失敗・拒否・不明も集積する。 | HELIXLABO-L2-001, 002 | success/failure/rejected/cancelled/blocked/unknown/not_observedが区別されepisodeへ追跡される。 | unknown/not_observedをsuccessへ変換する、失敗や拒否を落とす。 |
| 4 | correlationを因果と決めつけない。 | HELIXLABO-L2-002 | episode内の相関関係と因果未確定を区別し、根拠とrevisionを辿れる。 | 時刻/pathの近さだけで因果を確定する。 |
| 5 | 一事例を一般化しない。 | HELIXLABO-L2-009 | single episodeから支持可能なscopeを限定し、反例で範囲を狭める。 | 一例をcross-project/cross-product/general structureへ拡張する。 |
| 6 | 外部方式をそのまま採用しない。 | HELIXLABO-L2-033, 051 | 外部sourceをprovenance確認・分解・比較・実験後のcandidateとして扱う。 | external success例を無評価で取り込む、命令/patchを評価前に実行する。 |
| 7 | Product固有意味をBRAINへ送らない。 | HELIXLABO-L2-009, 034, 041 | Product固有meaningは該当Product Coreへ返し、BRAINにはgeneric structure候補のみを送る。 | Product固有ルールや顧客意味をgenericとして送る。 |
| 8 | BRAINには汎用構造のみをFeedbackする。 | HELIXLABO-L2-034 | 複数meaning/product/episodeに支持されたgeneric structure candidateを範囲・証拠付きで送る。 | 根拠のない単一product/episodeの構造を汎用candidateとする。 |
| 9 | Intelligenceには判断・監査・bot・モデル改善に使える評価材料を返す。 | HELIXLABO-L2-035, 052, 054, 055 | 判断等の評価材料は035/052、Bench水準は055/054の別契約で根拠・scope・revision・未評価状態を保ってINTELLIGENCEへ渡る。 | LABOが現行判断/配置/botを実行する、Bench水準を別定義したり未評価を評価済みにする、材料転送を学習許可にする。 |
| 10 | System化率最大化を目的にしない。 | HELIXLABO-L2-007 | operation継続候補を含み、再現性・oracle・副作用等の条件と限界を示す。 | system化率を成功指標として最大化する。 |
| 11 | Operationを正規の保証手段として認める。 | HELIXLABO-L2-007, 008 | 文脈依存・例外等をoperationで保証する候補に残し、未完成扱いしない。 | operationをsystem未完成として一律排除する。 |
| 12 | SystemからOperationへの降格を認める。 | HELIXLABO-L2-008, 017, 020 | 例外・誤検知・負担・変更費用に応じてoperation復帰候補と未完義務を保持する。 | systemを永続固定する、LABOが運用切替を実行する。 |
| 13 | LABO評価だけで変更を確定しない。 | HELIXLABO-L2-010, 050 | Feedbackは提案状態であり、登録/routingはOS、変更はtarget ownerに残る。 | LABO評価/Feedbackだけでtarget変更を確定する。 |
| 14 | 変更後は必ず再観測する。 | HELIXLABO-L2-020, 050 | 復帰・target変更後の実績を新observationとして取り込み、変更前後の版に追跡できる。 | 変更または検証のみで完了とし、再観測を欠く。 |
| 15 | Feedbackの効果そのものもLABOで評価する。 | HELIXLABO-L2-050 | 変更後の効果と退行を独立に評価し、未完なら循環を開いたままにする。 | Feedback発行・OS登録・target変更・CI成功だけで改善完了とする。 |

## 既存候補条件の保持確認

これらは対象revisionの採用後に別途評価する候補条件であり、本書の記載で採用状態を変えない。

- RCLS-BR-001..006：責務ownership、CASE/SCENE/PATTERN/LOG/VERIFY分離、最小packet、project-local→independent verify→cross-project→shadow→mechanismの段階、反例/authority revision/provider/model/expiry/security/licenseによるstale/revoke/revalidation、要求/design/merge/release authorityを直接変更しないことを確認する。
- HELIXOS-L2-012：内部事例を先に照合し、不足分を出典・revision・時点・取得範囲・欠落・適用条件付きで調査する。秘密送信、取得文の命令・patch実行、closed/mergedだけで解決扱いする反例を拒否する。
- HELIXOS-L2-013：同一仕事の原記録から欠落と原因候補を区別し、管理自身を含む是正と再観測を追う。未着手・観測停止を正常としない。
- HELIXLABO-L2-WEB-001..014：candidate文書に保持されたepisode、比較条件、品質を落とさない性能差評価、観測/実験区別、総時間・費用と救援、first/final acceptと遅延障害窓、日次集計/late correction、公開統計のdenominator/caveat/uncertainty、残差、INTELLIGENCEへの水準、顧客秘密、Feedback再観測、実験資源分離をそれぞれ候補のまま確認する。原案中の14個別受入条件を短縮・採択扱いしない。

人判断が必要な内容はL2候補の保留欄を参照する。候補文書・PR・本受入案からL1確認、要求採択、設計承認、実行許可を生成しない。
