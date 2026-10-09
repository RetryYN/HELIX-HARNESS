---
title: "HELIX-LABO機能単位要求の受入候補"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: acceptance
status: draft
authority_status: po_agreed
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

### HELIXLABO-L2-056 初回Worker結果のBench観測取込

- **PO起点**：[補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)の第1点、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)。
- **入力**：OS ticket/assignment/attempt、task/Worker/契約revision、要求revision/scope、結果状態、verification、人確認、data-use classification、source receipt。
- **正常例**：許可済みscopeで初回Worker resultを受領し、結果状態とprovenanceを保って「観測済み・未評価」の履歴に追加する。成功・失敗・拒否・unknownを別状態で集計し、055が評価範囲・比較根拠・反例を確認できる。
- **未評価維持条件**：単発の成功、異なるtask class、適用範囲外、比較条件の不一致、古い/不明な契約やsource、欠落したverification/receipt、または不足した反例は評価済み水準を生成せず、未評価/評価不能に留める。
- **評価済みへ移る条件**：該当task/model classとscopeに対し、採用する評価oracle/基準のrevision、判定条件、比較条件、結果・失敗/反例・unknownを含む根拠が特定され、そのoracleを対象の実績へ適用した結果・評価者・時点・判定receiptをLABOが確認し、判定可能な場合に限り、その範囲に評価済み水準を付す。oracleの存在や判定可能性の説明だけでは評価済みにしない。oracle/基準または適用範囲・判定根拠が提示されない場合は評価済みにせず未評価を維持する。数値閾値や必要サンプル数は根拠なく新設しない。
- **反例**：初回成功をqualifiedへ変える、unknownを成功へ集約する、履歴からWorkerを割り当てる、scoreでscope/authorityを変更する、異なるticket/Worker revisionを同じ実績として結合する。
- **失敗時・未完義務**：source/assignment/許可不足は該当OS/SECURITYへ戻し、矛盾/重複/staleは原記録を保持して訂正・再照合を求める。取込の成功は評価の成功を意味しない。

### HELIXLABO-L2-057 初回実行結果のBench受領接続

- **PO起点**：[補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)の第1点、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)。
- **入力・版**：OS018/019/023の実行後assignment・attempt・result receiptと、LABO028/056の受領契約revisionを同一scopeに束縛する。OS027は使ったrun構成のprovenance参照に記録できるが、接続の開始依存にしない。
- **成功条件**：OS-L2-018/019/023の出力を受け、成功/失敗/拒否/中断/unknown、ticket/task/Worker identity、要求と契約revision、scope、verification状態、人確認、未完義務が送信と受領で一致する。HELIXOS-L2-027は利用構成参照として記録し、接続依存にはしない。採択済みCONNECT契約または明示的な人手receiptがschema/版/scopeを照合し、acknowledgment・trace・重複抑止・stale停止・同一ID再送を示す。LABOは受領receiptを返し、後続の履歴化先を示す。二重配送は同じsource identityとして検出できる。
- **反例**：受領時にscope・result state・revisionを書き換える、配送成功を評価済みとする、LABOがassignmentを行う、欠落receiptを成功配送とみなす、stale payloadを現行履歴へ混ぜる。
- **失敗時・未完義務**：送信・受領receipt不一致は接続未成立としてOS/LABOへ戻す。再送は同じsource identityを保持し、重複を新規実績にしない。CONNECT契約も同義務を果たす人手receiptも不在/unknownなら受領成功を主張しない。

### HELIXLABO-L2-058 観測集積の入力元ごとの依存条件

- **正常例**：選択入力がWorker観測だけの呼出しで、001/028のprovenance・版・scope・許可・状態区分・受領契約と安全依存が揃う。他の未選択入力は未観測を表示したまま、Worker観測を取り込める。全入力元対応の完成を主張しない。
- **複数入力例**：WorkerとOSの観測を選択した場合は、両方のsource別接続と安全依存を要求する。片方のreceiptが欠落した結果を完全な集積成功にしない。
- **反例**：未選択sourceの完成待ちで、必要条件を満たすWorker入力を拒む。選択済みsourceが欠けたため未選択へ改変する。安全依存を参照のみと分類する。未選択を観測済みへ変える。Web未採択を理由に全LABO 1.0を不成立にする。個別呼出しの成功を1.0全source対応済みとする。
- **版・変更**：sourceの追加/削除、操作、scope、契約版が変わった場合に依存分類と閉包を再照合する。前回の選択やreceiptを無条件に継承しない。
- **不足・戻し先**：選択条件が不明なら要求された呼出しscopeのownerへ、入力契約・版は各sourceとLABOへ、許可/classificationはSECURITYへ戻す。未観測・未完義務を消さず、既存001の出力保証を保つ。

## 効果判定の優先関係に関する受入追補候補（G13）

[LABOの比較評価候補](../../helix-labo/L2-requirements/labo-requirements.md) HELIXLABO-L2-059および[INTELLIGENCEの配置入力契約候補](../../helix-intelligence/L2-requirements/intelligence-requirements.md) HELIXINTELLIGENCE-L2-067との責務境界を保持する。対象scopeに有効な品質・優先・許容悪化の判断は再利用し、未決・失効・適用境界外のみ判断ownerへ戻す。本追補は未実行の受入候補であり、実測改善や要求採択を生成しない。

| 対応要求 | 合格条件 | 反例 |
|---|---|---|
| `HELIXLABO-L2-059`（単体候補、parent `HELIXLABO-L1-005` primary / `HELIXLABO-L1-011` context） | scope/revisionに適用可能なquality oracleと既決priority/tolerance（適用可能な判断のrunごとの再確認なし）、同一task snapshot/scorer/protocol/hardware条件、現行実験のOS割当Worker receipt（歴史runは当時の実行者・authority・receipt）を与える。decisionが未決/失効/適用境界外ならownerへ戻す。実験条件baseline/current/candidate/hybridとHELIXなし/旧版/新版cohortを別軸で記録し、比較目的と群を明示し、導入効果はあり／なし、改訂効果は旧版／新版、三者の関係を主張する場合だけ三者を要求する。未選択群の不足を選択した二者比較の不成立理由にしない。品質gateを先に個別判定し、retry・上位Worker救援・rework・CI・review・人修正込みの費用、所要時間、人介入を分ける。欠測通貨・非貨幣化人時間・比較不能cohortは明示する。 | 劣化品質を価格/速度で相殺／初回candidate単価だけで安価認定／上位救援・人修正・retryを除外／未承認換算率で人時間を0円化／受入成果なしを効率成功扱い／実験条件とcohortを混ぜる／scope・oracle・protocol・hardware・run version違いを混ぜる／歴史結果をcurrent性能へ転用／LABOがWorkerを割当・起動する。 |

**読み合わせの具体例**
1. **適切な有効成功**：same-scope taskで目的に応じた群を同じ可視oracle・比較可能run conditionに結ぶ。導入効果のあり／なし二者なら旧版evidenceなしでも比較でき、改訂効果の旧版／新版二者ならHELIXなしを要求しない。三者の関係を主張するfixtureでは三者すべてを照合する。実験条件baseline/current/candidate/hybridは別fieldとして各cohort runへ対応づけ、quality gateは選択群の各結果を個別判定する。old cohortを選択した場合は既存read-only証拠だけを使う。新構成workerが安価でも救援とhuman fix込みで総費用が増えたこと、完了時間、介入量を分けて示す。scope/revisionに有効な既決の「品質gate後の優先と許容悪化」があれば再確認を求めずそれを適用する。未決・失効・適用境界外の変更時のみ該当owner判断へ戻す。人時間rateが未決なら介入時間は報告し、monetary totalは未完成と表示する。
2. **不適切な成功主張**：candidate単価が低く、accepted changeが0、上位Worker救援と人修正が多数なのに、それらを除外し「low cost / better performance」とする。反例。品質gate未達を時間短縮で埋めるのも拒否する。
3. **比較不能／未評価**：旧版を選んだ比較で適用scopeや結果receiptが見つからない、またはcurrentとtask/oracle/scorer/protocol/hardwareが異なるときは当該比較を未測定/比較不能とする。旧runtimeを起動せず、歴史結果はcurrent evidenceへ転用しない。三者主張のfixtureで旧版が欠ければ三者比較は未完だが、導入効果を測るあり／なし二者の必要証拠が揃っている場合はその比較結果を保持する。二者結果だけで三者の関係を主張する例、および未選択旧版の欠落で有効な二者比較を拒否する例はいずれも反例。
4. **effort/配置境界**：同じtask classの複数effort resultとLABO evidenceが揃い、scope別の選好からINTELLIGENCEが推奨候補を示す。未評価effort/Workerは未評価のまま。OSがassignmentを別判断する。INT/LABOのproposalやscoreだけからworker/run/authorityを生成しない。

### HELIXLABO-L2-060 Worker支援有無の同一設定比較の受入（単体候補、1.0）

- **入力・版**：同一task snapshot/scope/requirement/oracle、同一元Worker/model/provider/version/effort設定、対応する支援あり/なしのOS result receipt、支援利用記録、review/test結果、作業者と補助者の費用/時間。`version_target: 1.0`はcapability targetであり、v0.1等の段階収載決定は含まない。
- **正常例とoracle**：同じWorker/model/provider/version/effort、task/scope、environment、`PATCH /applications/{id}`用oracleを固定する。両runで`draft`への有効編集は受理、`approved`への編集は拒否しpersisted valueを変えないことが事前oracle。支援ありrunのみINTELLIGENCEがstate/API設計、validator code、過去regression exampleを選択し、approved boundaryで詰まった元Workerに限定相談・修正指示を渡す。元Workerが修正し、独立reviewer（元WorkerとINT支援者のいずれとも異なるidentity/context/authority）が確認、HELIXOS-L2-020が事前oracleを再実行してpassする。対照runは支援を使わず同じ元Worker設定で完了し、同じoracleでpass/fail結果を返す。受入oracleは両群の設定とtask/oracleが等しく、相違が支援経路に限られること、支援に要した上位Worker/相談/再実行/reviewと人の調査・修正・確認時間/費用が支援側costへ算入されること、支援有無の結果を同じquality gateで比較できること。
- **誤りを含む例**：支援ありrunだけ強い別model/providerに変える、対照runにも相談助言を漏らす、支援者を独立reviewerにする、助言/人の修正/再実行をゼロcost扱い、劣化品質を低費用で相殺する。比較条件不成立または品質gate未達として拒否し、成功比較を出さない。
- **未見例**：同一設定の類似API taskで元Workerのtest失敗はあるが、片群のreceipt、oracle適用性、または支援者の時間/費用が不明。未知domainへの改善を一般化せず、欠落項目を列挙して未評価/比較不能を返す。数値閾値・試行件数は作らない。
- **費用/範囲oracle**：同一の元Worker設定を固定しつつ、支援によって追加されたmodel/provider利用、上位Worker、相談者、CI/review/retry/rework、person timeをすべて報告する。human timeの換算率がない場合は時間量を記録して金銭額は未確定とし0円にしない。task/scope/outcome・価格source/currency/effective timeに結ばない費用は支援効果の総費用に確定しない。
- **結果・責務境界**：LABOは比較可能性・quality・効果evidenceのみ出力し、INTELLIGENCEのproposal、OSのassignment、受入/merge authorityを決めない。単一の成功runのみでは未見taskの一般的有効性を主張しない。比較に必要な両runがそろわなければ未評価を維持する。

## 機構内監査による受入例の補強

以下は要求候補の未実行caseであり、実測合格や水準の採択を表さない。

### HELIXLABO-L2-055 — Bench分母・欠測・採点根拠

- **正常例**：一つの許可済みworker-history snapshotから対象task class・model class・評価範囲に該当する実績集合を特定する。数値metricまたは集約水準を出す場合、そのscopeのeligible denominator、実際に算入した結果、欠測/失敗/拒否/停止/unknownの個別dispositionと算入/除外理由、metric計算規則・scorer/oracleのrevisionを記録する。受入者は同じsource receiptから出力根拠を再構成できる。定性的水準の場合も、適用条件・判定根拠・未評価部分を特定できる。
- **誤りを含む例**：欠測/失敗/unknownを母集団から理由なく落として水準を上げる、欠測費用を0とする、分母や集計対象を結果確認後に変える、判定根拠/metric定義/採点版を示さず数値または水準だけを出す、重大なquality/scope/security/data-loss failureを平均点で相殺する。水準の出力は根拠不足または不成立とし、既知の失敗は失敗のまま、欠測/unknownは欠測/unknownのまま保持する。判定不能なscopeの水準を未評価として残し、失敗の観測事実を未評価へ丸めない。
- **未見例**：新しいtask class、sourceまたはscorer/oracle版の結果で適用可能性が示されない。過去classの水準を転用せず、その範囲は未評価とする。新しい母数、固定標本数、許容率、閾値は作らない。
- **境界**：denominatorは出力するmetricと明示scopeごとに定義する。旧Benchのsystem/team test portfolio、反復回数、confidence interval、accepted-change正規化を全作業種別の水準へ一律要求しない。metricがそれらを主張・利用するときだけ該当根拠/欠測処理を受入対象とする。scoreだけで配置案、指定、割当て、authorityは作らない。

### HELIXLABO-L2-056 — 初回結果と水準適用条件の照合

- **正常例**：許可済み初回resultを、OS ticket/assignment/attempt、実際のWorker/model identityと実行契約revision、task class、要求/source revision、scope、data-use、result receiptに結び「観測済み・未評価」として保存する。適用する評価済み水準がある場合は、対象task/model classへの対応、oracle/基準のrevision、比較条件、適用scope、根拠が当該resultと一致し、実績へoracleを適用した判定receiptが揃う。その条件を満たしたscopeだけ評価済みにする。
- **誤りを含む例**：受領receiptのmodel/source/revision/scopeを実際のrunと照合せず水準に算入する。runのtask classやmodel classが宣言された評価対象と異なる、oracle/criterion revisionが対象resultと不一致または不明、scopeが評価範囲外/不明の場合に評価済みとする。観測事実は元のidentityと不一致を保って保持できるが、対応する水準根拠へ混ぜず該当scopeを未評価/評価不能にする。未知結果を成功へ集約しない。
- **未見例**：新provider/model version、異なるtoolchain/source revision、別task class/scopeから初めて届いたresultで、既存評価条件との互換/適用性が確定できない。結果receiptは観測として残し、同条件の成功や同じmodel classの水準だと推定せず未評価を保つ。必要な再評価条件をsource/oracle ownerへ戻す。恣意的な経過期限や一律の再評価間隔は設けない。
- **境界**：不一致は「実績がなかった」へ書き換えず、未評価の理由と該当source/oracle/model/scopeを保持する。受領成功は評価成功ではなく、Benchはassignment/適格化/権限を決めない。既存L2-056の「評価oracleを実績へ実際に適用」「一件から未知taskへ一般化しない」条件を維持する。

### HELIXLABO-L2-061 比較評価のtask・oracle隔離と履歴の完全性の受入候補

未実行の受入候補。既存059の比較目的・選択群と品質条件を維持し、実験起動・候補採択の許可を生成しない。

- **正常**：hidden oracleを用いる比較taskの15条件（task ID/version、fixture digest、requirement/acceptance IDs、base HEAD、allowed/forbidden paths、hidden oracle digest、seed、toolchain、timeout/retry/cache policies、hardware class）が入力snapshotに対応する。Worker-visible taskには答え・secret・PII・private review contextがなく、Workerに渡されたcontextからoracleへ到達できない。authorと別identity/session/contextのjudgeが固定されたoracle/scorerで評価する。task/fixture/oracle/protocol/scorerの版とdigestが一致し、評価receiptがその実context・役割分離を裏付ける場合だけ当該比較へ利用可能と返す。
- **15項目の欠落・不一致**：各項目を1つずつ欠落または対象不一致にしたfixtureで、該当task比較を成立扱いにしない。別runのsnapshotやfield名の存在だけで埋めない。hidden oracleを使うのに利用なしへ書き換えてdigestを省く例も拒否する。
- **情報漏洩の反例**：hidden answer、future answer、secret、PII、private review contextをそれぞれWorker-visible fixture/contextへ混入する。該当runを有効比較・資格証拠から外し、理由と元receiptを保持する。機微な内容そのものを監査出力へ複写しない。平均点、低費用、他の成功runで不成立を相殺しない。
- **役割・版の反例**：authorが作成contextのままjudgeを兼任する、名札のみ変えてcontextを共有する、task snapshotとoracle digestが違う、fixture/protocol/scorerの版が違う例を別々に与える。不成立範囲を返し、judgeにoracleを渡した事実だけをWorkerへの漏洩と誤判定しない。
- **履歴**：保存済みrunは当時のmodel/runtime/version、toolchain、task snapshot、actor/authorityへ結んで表示する。当時の証拠が足りない場合は不足を表示し、現行assignmentを後付けしたり、旧結果をcurrent性能へ転用したりしない。旧runtimeは起動しない。
- **未見**：初見の添付・派生説明から答えがWorkerへ漏れる例と、context参照が欠け実際の可視範囲を確認できない例で、前者は漏洩、後者は未確認と返し、いずれも隔離済みへ通さない。未知taskへ既存の安全判定を無条件継承しない。
- **非適用と接続**：hidden oracleを用いない別契約の比較や055の通常履歴には、その非適用根拠を記録して一律hidden判定を課さない。適用不明はownerへ戻す。完全性を満たすrunも059の品質/比較条件を満たさなければ効果達成ではなく、LABOの返却値から割当・実験許可・admissionを生成しない。

### HELIXLABO-L2-062 外部調査の主張と原文箇所の照合

- **対応・境界**：L2-062と同じ未採択候補、`version_target: 2.0`。検査対象は調査成果の内容・参照・責務であり、旧runtimeの実行結果を使わない。
- **正常**：外部文書から導いた主張について、source URL、公開日、版、取得範囲と引用箇所が揃い、同版の原文が適用条件を含めて主張を支持することを確認する。主張ごとの照合結果と原文が調査成果に残り、051の比較・実験とBRAINへの候補化は別段階になる。
- **個別反例**：URLだけ存在する、公開日なし、版なし、spanなし、引用先が別箇所/別版、原文が一部しか支持しない、原文の制約を落とす、反例があるのに一般化する、出典不明または古い可能性を放置する、一次検証taskの発行だけで検証済みにする、照合だけでBRAINへ直接採用する例をそれぞれ投入し、不成立または未検証・採用保留になることを確認する。
- **未見・変化**：source改版でlocatorが移動/消失した場合、以前の成功を現在へ流用せず、該当主張の再照合と一次検証義務を残す。原文が読めない/範囲外の場合は別版・要約を代用して合格にしない。取得不足は取得主体、意味不一致はLABOへ戻り、OS登録に主張・source・版・不足・再確認先が引き継がれることを確認する。
- **版と権限**：この2.0の外部source条件が未成立でも、外部入力を使わない1.0内部循環を不成立にしない。外部命令の実行・新権限・採用済みへの変更が、引用や評価結果から生じた場合は不合格とする。

### HELIXLABO-L2-063 修復手順の再発評価と予防候補への還流

- **対応・境界**：L2-063と同じ未採択候補、`version_target: 1.0`。旧doctor・memory runtimeは起動せず、要求と受入の対として照合する。
- **正常**：対象版・適用条件・修復結果・独立した検証根拠を持つ成功手順をLABOの知識記録とOSの改善backlogへ結び、同種修復の閾値以上の反復からgate/detector候補を出せる。反復数・母集団・閾値の根拠と反例を添え、未処理は少なくとも警告として見える。OS登録、target ownerの採否、変更・検証・運用後再観測が同じ手順/候補の系譜で区別される。
- **個別反例**：repair案だけで成功手順とする、成功終結後に手順/改善backlog対応が残らない、再送を反復へ加算する、異なる原因/適用条件を混ぜる、閾値や母集団不明を0で補う、頻出を検出しても候補も警告も出さない、候補や登録だけで予防完了とする、LABOがgateを直接有効化する例をそれぞれ不成立とする。
- **未見・再評価**：似た症状でも原因・適用条件が異なる場合は同種と断定せず不明を保持し、評価へ戻す。手順/契約の改版では旧成功と現在の有効性を分け、適用範囲の再評価と未完義務を引き継ぐ。登録失敗、target変更未完、運用後観測欠落をそれぞれ成功へ丸めず責務先へ返す。
- **記憶とauthorityの境界**：評価対象知識はLABO、改善の登録・振り分けはOS、変更の採否と実施は対象ownerに残る。harness memoryやprovider標準memoryを修復知識の正本へ戻した場合、特定問題の知見を未評価でBRAINの汎用構造にした場合、新たな実行権限を頻度や成功結果から生成した場合は不合格とする。

### HELIXLABO-L2-064 Worker比較評価の候補名遮蔽と再現条件

L2-064と対になる未採択受入候補、1.0。

正常：元identityへの追跡を記録側へ保持し、judge可視資料に候補名がなく、fixture/rubric/judge version/sample/retryが固定されたrunだけを同条件blind比較へ使う。
個別反例：候補名の直接表示、添付/metadataでの露出、可視資料不明、5条件それぞれの欠落/変更、smokeだけの完全適格性主張、安全失敗/範囲逸脱/検証不能を平均点で相殺、評価だけで割当許可を出す例をそれぞれ不成立とする。
未見：別runtime版や新たな出力形式で候補名が露出した場合、過去のblind結果を継承せず不成立と再評価義務を返す。通常履歴の観測保存と比較の成立を分ける。

### HELIXLABO-L2-065 候補Worker資格とtask別性能証拠の受入候補（単体、1.0）

未実行の受入候補。親は`HELIXLABO-L1-005` primary / `HELIXLABO-L1-011` context。採択済みHELIXLABO-L2-059とその対L11は変更せず、資格比較とscorecard受渡しの未閉包条件を別candidateへ置く。通常Worker履歴すべてへfull benchを要求しない。候補採択、資格試験の実行、Worker割当、実験許可を生成しない。

| scope | 成立条件 | 反例・失敗条件 |
|---|---|---|
| 選択candidate-runtime資格scope | candidate/runtime version、比較目的、task/scope/revision、fixture集合とrevision、quality/acceptance oracle、versioned rubric/scorer、許可されたOS実行receiptがscope内で結ばれる。machine smokeとblind full-benchは別結果として記録する。blind full-benchを成立とする場合、correctness、mutation kill、instruction/scope following、skill A/B、quality、concision、security、second-diff extensibilityの8軸すべてについて同じfixture集合・版とrubric revisionに基づく判定結果がある。評価不能な軸は理由を記録してfull-benchを未完・未評価とし、資格済みとは表示しない。bench manifestにscope/runtime/task/fixture/oracle/rubric/scorerと各版があり、machine scoreとblind-judge scoreが別出力でfixture/rubric digestへ結びつく。この選択scope自身についてcandidate runtime名/hidden oracleの可視境界、author/judge分離、task/oracle/scorer/protocolの版一致を確かめる。未採択のLABO-061/064を前提にせず、本候補単独の入力と証拠で判定する。 | smoke passだけでfull-bench完了を主張する。8軸中どれかの証拠、bench manifest、machine/blind scoreの区別、fixture/rubric digestを欠いたままfull-bench成立とする。fixture集合・revision、rubric/scorer、oracleまたはtask scopeが比較対象間で異なるのに同条件比較として使う。Worker-visible contextへhidden answerを混入する、candidate名をblind judgeへ見せる、authorとjudgeが同じ作成contextを共有する。いずれもそのscopeの資格証拠を未完/不成立とし、平均scoreでsecurity failure・scope逸脱・検証不能を相殺しない。 |
| 未見資格scope | 初見runtime version、task classまたはrubric/fixture revisionは既存資格結果から自動適格化しない。該当scopeに適用できるoracle/fixture/rubricがないときは未評価または比較不能と返し、既存ownerへ戻す。 | 別runtime versionの資格、過去taskのscore、単独smoke結果から、未見scopeを資格済みと表示する。 |
| HELIX実task scorecard | task/scopeごとのOS assignmentとattempt/result receiptから、`first_pass`を初回attemptの受入oracle結果として、`retry_count`を初回後の再試行数として区別する。`proposal_diff_size`と`lint_violation_count`をそのtask scopeへ適用する場合、測定定義・単位・tool/profile版・観測receiptを添える。quality-judge結果とeffective costはL2-059既定義の品質gate、retry/救援/rework/CI/review/人修正を含む費用境界、価格source/currency/effective timeを使う。数値・定義・結果は同一task receiptへ紐づき、decision ownerへのhandoffは用途別decision identity/revision/statusまたは未決状態を参照する。実効費用内訳をscorecardへ添え、同一task class/scope・測定定義・revisionで比較できる推移と失敗事象をtrend/failure findingとして出す。 | retry後の成功をfirst pass成功と記録する。retryをcostから落とす。diff/lintを適用するのに測定証拠を欠く、不明を0にする、または対象外根拠を示さずゼロ扱いする。quality未達を低価格/短時間で相殺する。scoreから採用/限定/quarantine/retireを自動決定する。異なるtask classや測定定義を混ぜて作ったtrendも不成立とする。いずれも該当taskを完了scorecardまたは資格成功にしない。 |
| 適用外・未観測metric | diff-size/lint countが選択scopeに適用されないなら対象外理由を記録する。適用されるが計測できない、定義や版が欠ける、またはreceiptから判定できない場合はunknownのまま残す。既決scope内の品質/優先/tolerance判断は再利用し、適用外・未決・失効時のみ既存ownerへ戻す。 | 未観測値を`0`にする、過去のtool/profile版や異なるtask definitionを無条件転用する、候補のscoreだけで有効な判断を上書きする。unknown/適用外は達成済みのmetricと数えない。 |
| owner受渡し | scorecardはtask scope/revision、source/assignment/attempt/result receipt、metric definition/tool version、rubric/oracle revision、既決owner判断または未決を辿れる。LABOは結果・比較証拠を出し、実際の採否・配置・権限・quarantine/retireは既存ownerに残す。 | receiptがsourceやdecision scopeに繋がらない、LABOがWorkerを割当/起動する、LABO scoreからauthority・採否を作る。handoff未完はdecision完了へ変換しない。 |

**正常例**：選択された資格scopeで、同じtask/fixture集合・fixture revision・rubric/scorer revisionに対し、machine smokeとblind full-benchの両結果を分けて保存する。8軸ごとの判定が同条件に結び、hidden oracleはWorker-visible contextから到達できず、judgeはauthorとは別identity/contextで評価する。別途task scorecardでは、初回失敗後に2回目で受入になったtaskを`first_pass=false`、`retry_count=1`として保持し、採用したdiff/lint定義と計測値、L2-059の総費用内訳、価格sourceと既存decision ownerへのreceipt linkを同一scopeへ結ぶ。これはこの入力例の記録値であり、普遍的thresholdを作らない。

**個別反例**：①candidate名をjudgeへ露出、②hidden answerをWorker-visible fixtureへ混入、③8軸の一つを欠く、④smoke passのみをfull資格と表示、⑤task間でfixture/rubric revisionが違うのに同条件比較、⑥retry後passをfirst passへ誤記、⑦適用lintを未計測のまま0とする、⑧人修正・上位Worker救援・retry費用を落として安価成功とする、⑨scoreからLABOが採否やassignmentを作る、を一件ずつ与える。該当scope/metricは不成立・未評価またはhandoff未完となり、他軸の成功で相殺されない。

**未見例**：未評価runtime version、新task class、または変更されたfixture/rubricが来た場合、既存資格結果をそのまま転用せず、新scopeの比較条件・適用oracleが不足なら未評価/比較不能を返す。初見taskでdiff/lintの単位や対象profileが未定の場合もunknownを維持し、指標定義ownerへ戻す。未見のために通常Worker履歴へfull benchを強制せず、候補資格scopeの証拠不足だけを未完にする。

**責務・受入限界**：LABO-006はOS割当Workerによる実験run、LABO-055は通常Worker履歴の水準、採択済みLABO-059は品質優先の同条件比較と全費用、LABO-061/064は別の未採択候補であり、本候補の常時依存ではない。HELIXLABO-L2-065自身が、選択資格scopeに必要なtask/oracle/context・candidate名blind条件を所有するが、これらの候補の実行・配置・採否を所有しない。oracle/fixture/acceptanceはHARNESS/要求owner、assignment/実行はOS、許可されたdata/executionはSECURITY、測定・比較receiptはLABOへ戻す。score、未評価、適格性の表示だけから実験許可、Worker assignment、admission、best runtime、未見taskへの一般化を作らない。実効費用内訳と、同条件のtask class/scope/測定定義/revisionに限るtrend/failure findingをscorecardと一緒に出す。用途別decisionおよび資格admission decisionは既存ownerの結果または未決として参照し、LABO自身の判断へ変換しない。

### HELIXLABO-L2-066 A比較における誤修復・未解消数の受入候補（単体、1.0）

未実行の受入候補。親は`HELIXLABO-L1-005` primary / `HELIXLABO-L1-011` context。採択済みHELIXLABO-L2-059の品質優先・比較条件・費用等の意味を保持し、A比較の誤修復数と未解消数を分母およびoracleに結ぶ観測だけを補う。旧Bugbot候補の採択、Bugbot/修復器の実装、比較runの許可を生成しない。

- **正常**：比較開始前に固定されたAと候補のidentity/version、同じtask/scope/対象revision、重複を除いた共通eligible case集合、受入/quality oracleとrevision、scorer/protocol/toolchain/environmentおよび同一の終了/cutoff条件を確認する。各群で同一caseへoracleを適用したreceiptがあり、各群別に`misrepair_count/N`（oracleが誤った修復と判定したcase数）と`unresolved_count/N`（終了/cutoff時に受入oracleを満たす解決がないcase数）を分子・分母付きで返す。oracleが適用不能またはreceiptが不足するcaseはunknownとして示し、分母から黙って除かず比較を未評価/比較不能にする。2指標は重なり得るため個別に数える。既存059の費用・時間・手戻りは同じscopeの比較として保持する。
- **誤りを含む例**：Aの意味/版を推測する、結果を見た後でeligible集合・分母・oracleを変更する、Aと候補のcase集合や計測条件を変える、分子だけで割合を示す、unknown・欠測・重複caseを理由なく分母から落とす、oracleに結ばない数を誤修復/未解消と断定する、成功件数や費用/速度だけで誤修復・未解消を隠す、費用/手戻りを片側だけ除外する。それぞれ当該比較を不成立または未評価とし、unknownは0にしない。
- **未見・権限境界**：Aのidentity/conditionやoracle適用性が初見で不明なら一般化せず、未評価/比較不能と必要なownerへの戻し先を返す。固定件数・rate threshold・合否thresholdを置かない。結果はLABOの計測・比較材料に留まり、要求採択、効果達成、実験許可、Worker/修復器の選定・割当・実行、authorityを生成しない。

### HELIXLABO-L2-067 初回eligible candidateとAttempt内修復の受入候補（単体、1.0）

未実行の受入候補。親は`HELIXLABO-L1-005` primary / `HELIXLABO-L1-011` context。first-eligible candidateの境界と同一Attempt内repair roundを観測する候補であり、source sentenceのAttempt count clauseは本候補の対象外でsource holdingに残す。採択済みHELIXLABO-L2-059の比較・品質・費用意味および未採択HELIXLABO-L2-065の`first_pass`/`retry_count`定義を変更しない。065の採択、資格試験、実験実行またはWorker割当を前提にしない。

- **正常例**：選択task/scopeの事前指定eligibility predicateとrevision、適用oracle/revision、OS assignment/Attempt identity、候補identity/digestとevent receiptが同じtask receiptへ結ばれている。最初にeligibleと判定されたcandidateをevent順で特定し、そのcandidateのoracle結果を保持する。以後の同一Attempt内のcandidate変更を順に記録し、観測できたrepair round数と各roundの前後digest・result receiptを返す。Attempt identityで別Attemptのretryとroundを区別するが、複数Attemptの総Attempt countは算出・出力しない。result後の変更が最初のcandidateを上書きしない。
- **個別反例**：結果を見た後のeligibility predicate選択、predicate/oracle revisionの欠落、候補digestの欠落、順序不明の修復event、最終提出だけからのfirst-eligible推測、欠落eventを0 roundとする、Attempt境界を越えたround混入、同一候補の再送を修復として重複計上、最初の候補判定を後続passで上書き、総Attempt countを本候補の指標とする、をそれぞれ未評価/unknown/不成立とする。別途、065の`first_pass`を本候補のcandidate-level resultへ置換する、065の`retry_count`へ内部roundを足す、059のcost/quality gateを変える例も不成立とする。
- **未見例**：初見task classまたは新predicate/oracle revisionで既存のeligibility条件が適用できない場合、同じpredicateやthresholdを推測で引き継がずunknown/未評価を返す。event sourceがAttempt内の変更順やcandidate digestを提供しない場合は、修復round数を確定せず観測source ownerへ不足を戻す。Attempt count clauseは本候補に含めず、source holdingへ残す。
- **受入限界と責務境界**：本候補は既存の許可済みresultを観測する。task/要求ownerがeligibility predicateとoracle、OSがassignment/Attempt/event、LABOが集計・比較証拠を持つ。新規実験の選択には既存OS assignmentと適用SECURITY許可が必要であり、LABOはWorker/候補を割当・起動・修復しない。`first_eligible_candidate_result`と`same_attempt_repair_round_count`は候補固有の観測名で、065のtask-level `first_pass`/`retry_count`と自動一致・代替・合算しない。総Attempt countはこの候補では算出しない。source coverageと`no_loss`はsource-lines/receiptに列挙された2 selected subatomだけに限り、Attempt count subatomと旧行全体、候補集合全体、実装・実験・受入完了を主張しない。

### HELIXLABO-L2-068 Worker Attempt countの受入候補（単体、1.0）

未実行の受入候補。親は`HELIXLABO-L1-005` primary / `HELIXLABO-L1-011` context。明示選択されたtask/scope/evaluation範囲でOSが記録したdistinct Attempt identityの数を観測する。Attempt記録が完全か確認できない場合は`unknown`とし、未採択065の`retry_count`や067のrepair roundから総数を推定しない。採択済み059、未採択065/067の本文・authorityを変更せず、それらの採択を前提にしない。

- **正常例**：同一の選択task/scope/revision/evaluation範囲に、OSのAttempt identity A、B、C、Dがそれぞれ一つずつあり、OS receiptが当該範囲の記録完全性と訂正状態を確認できる。状態がsuccess、failure、interrupted、またはOSがAttempt identityを割り当てたdeniedであっても、4つのidentityを各一回数え`attempt_count=4`とする。実行前に拒否されたintakeでOSがAttempt identityを発行していないものは数えない。同一Attempt identityの重複配送や同一Attempt内repair eventは追加Attemptとして数えず、状態と元receiptは別途辿れる。
- **個別反例**：065の`retry_count`へ1を足して算出する、067のrepair roundをAttemptとして数える、CI rerunや同一identityの再配送を重複計上する、Attempt identityを持たないassignment/実行前拒否を実行Attemptに含める、scope外のAttemptを混ぜる、記録欠落・遅延・stale・矛盾を0または確定総数に変換する、各々を該当範囲の未評価/unknownまたは不成立とする。
- **未見例**：OSの訂正eventが遅延している、担当交代後のAttempt lineageを同じtask/scopeへ結べない、同じidentityの重複と別Attemptを判別できない、sourceが全Attemptの捕捉を保証しない場合は総数をunknownとし、記録source ownerへ返す。遅延eventや別scopeの履歴から欠落Attemptを推測しない。
- **065／067との受入境界**：065が適用されるscopeでは`first_pass`とpost-initial `retry_count`をその定義のまま受入れ、068のAttempt identity countと別々に報告する。067が適用されるscopeでは`same_attempt_repair_round_count`を同一Attempt内の修復として保持し、068のAttempt数へ加算しない。3つを同じscorecardへ併記しても、明示された定義・scope・receiptを維持し、換算・代替・合算をしない。065/067の候補有無にかかわらず、068単独のOS Attempt記録だけから本指標を返す。
- **責務・受入限界**：OSの既存assignment/Attempt identity、event/evidence、結果・訂正receiptを入力に使い、LABOは数と比較証拠だけを返す。LABOはWorkerを起動・再試行・割当せず、Attempt/Retry policyや成功oracleを定めない。既存OS recordがAttempt境界または記録完全性を明示しない場合は定義を推測せず未評価にする。候補の静的記述は実装、実験許可、Worker割当、実測結果、採択を示さない。

### HELIXLABO-L2-069 Ticket返却・再発行後の成立状況評価の受入候補

- **状態**：L2-069と対になる未採択・未実行候補。数値metricや実運転を確定せず、指定入力の評価境界を照合する。
- **正常例**：同一ticket family/scopeの複数feedbackについて、reason class、返却件数、該当する観測母数、source completeness、reissue後の検証結果を受け取る。出力は分母・scope・revision・windowを示し、各resultを成立/不成立/未評価に区別する。OS ticketや配置を変更せずfeedback candidateとして返す。
- **不合格**：異なるscope/revisionを同一cohortとして集計、母数不明のrateを確定、欠測を0、観測window未満/未追跡/打切りをdefect 0件、未実行を成功、件数減少だけをquality証明、または再発行後成立を原因関係の証明として出力する。LABOがticket/assignment/priority/oracleを変更する場合も不合格。
- **比較不能例**：母数またはsource completenessが不明、revisionがstale、再発行ticketと元findingの因果relationがない場合はrate/resultを評価不能とし、欠けた証拠を指定してOS/source ownerへ返す。
- **未見例**：検収から届いたoracle不足findingを入力し、発生源と理由classを保持して評価する。適用分類がない場合は自由に新classを作らずunknown/未分類として返す。
- **受入限界**：固定threshold、因果推論手法、実験の割付方式や自動学習は要求しない。評価結果からticket採択・改善完了・配置変更を導かない。

### HELIXLABO-L2-070 補助運用telemetryとAttempt scorecard併記の受入候補（構成体、1.0）

未実行の受入候補。親は`HELIXLABO-L1-005` primary / `HELIXLABO-L1-011` context。合格は、この候補の9 selected atomに限る測定出力・receipt契約の充足を意味し、source line全体のclosure、L2採択、実験許可、実装または受入実行を示さない。

- **正常例**：明示scope/revision/windowに属する観測receiptを受け取り、queue wait、active time、review wait、Human waitを異なるfieldとして出す。各durationに定義元、開始/終了event identity、clock/unit、`occurred_at`/`observed_at`が結び、別scopeのeventが混ざらない。同じscopeでowner指定oracleとrevisionが確認できる受入済み対象のescaped-defect event、rollback/Recovery eventとresult state、observer overheadの直接計測値、evidence freshness ageを、それぞれ元receiptへ辿れるfieldとして出す。既存059の費用/時間は同じevent receiptへの参照を保持し一度だけ算入する。必要な067/068 candidate revisionとreceiptがこのscopeで有効な場合は、first-eligible result、same-Attempt repair-round count、distinct Attempt countを同一scorecardで併記する。metric identity、grain、定義revision、receiptは各々別fieldのままであり、値の換算・合算・代替を行わない。
- **個別反例**：4種のdurationを一つの時間へ合算する、event境界のない待ちを推定する、overlapping waitを排他的と仮定して按分する、欠測durationを0にする、結果後にoracle/windowを選びescaped-defectを数える、未確認findingをescaped defectと断定する、rollback費用を059へ重複算入する、計測負荷を対象作業の費用として重複算入する、observer overheadを根拠なく推計する、source timestampがないのにfreshness ageを確定する、age thresholdから採否/許可を作る、067 repair roundをAttempt countへ加える、または068 countを067/065から換算する。それぞれ該当fieldを不成立/unknownとし、他の値で埋めない。
- **欠落・比較不能**：scope/window、source completeness、event identity、definition revision、単位、oracle、対象とのrelationまたはreceiptのいずれかが不足・stale・矛盾する場合は、該当fieldをunknown/invalid/unavailableとして不足を明記する。分子・分母の適用可能性が証明できない場合はrateを出さない。scope不一致の値を同一scorecardへ結合せず、unknownを0、対象外または成功へ読み替えない。
- **Attempt共提示の欠落**：067/068のexact candidateが採択されていない、receiptがない、またはscope/revisionが揃わない場合は当該fieldの理由付きunavailable/unknownを表示し、complete co-present scorecardとしない。070の候補採択が067/068を採択したことにしない。逆に、067/068の採否は070の要求意味を変更しない。
- **未解決atom・既存指標境界**：旧source `coverage`の対象/分母/oracleと、追加telemetryと旧12指標とのidentity/version relationはこの受入候補の判定対象外であり、未解決・source-heldのままにする。これらをDesign Trace Completeness等へ同一視する、旧指標の名前・定義・receiptを新fieldへ割り当てる、またはsilent rename可否を判定するoracleをこの候補内で作る場合は不合格。067のS3A/S3B、068のS3Cは各既存receiptで管理し、このreceiptの分母やcarried atomへ重複計上しない。
- **責務・authority境界**：source event/assignmentは既存source owner、quality/acceptance oracleは要求owner、data/execution許可は適用SECURITY契約に従う。LABOは観測・提示だけを行う。scorecard、receipt、unknown/unavailable状態から採択、実験許可、Worker assignment、rollback実施、L3要件承認または完了を作らない。固定数値threshold、age期限、統計推論または自動決定を追加しない。
- **旧sourceと局所scope**：source line 399の9 selected atomに限定する。2 unresolved atom、既存候補へ別receiptで対応する3 atom、列挙外tail、隣接行、旧candidate全文の後継/完了を主張しない。source atomと判定scopeは[source-lines](../../governance/audits/requirement-registration/labo-supplemental-telemetry-source-lines-2026-09-29.jsonl)と[coverage receipt](../../governance/audits/requirement-registration/labo-supplemental-telemetry-coverage-receipt-2026-09-29.json)で確認する。

### HELIXLABO-L2-071 GitHub監査task class別qualificationの受入候補（単体、1.0）

対象task classとmodel revision、評価範囲、根拠、qualification状態が一つの記録で対応し、称号、qualification、permission/authority、assignment roleを独立して読めることを確認する。qualificationから権限・配置を発生させない。

- **正常例**：評価証拠が特定task classとmodel revisionに結び付いている場合、そのrevisionに対するqualification状態と適用範囲を証拠に沿って返す。表示用称号、permission/authority、assignment roleが別に保持され、評価結果がそれらを変更しない。
- **失効例**：資格対象revisionの評価にmajor missが記録された場合、そのrevisionのqualificationを失効させ、資格状態を保持する。model revisionが更新された場合も旧revisionのqualificationを失効させ、新revisionへ引き継がない。新revisionは独立した評価根拠が記録されるまで未評価とする。
- **unknown例**：task class、model revision、評価範囲または根拠のいずれかを特定できない記録は`unknown`/未評価とし、別revisionの資格、称号、permissionまたはassignment roleから補わない。major missの有無が判別できない場合もqualificationを有効と推定しない。
- **不成立・差戻し**：class/revision/evidenceの対応不一致、失効済み資格の継承、資格からのpermission・authority・割当変更、qualificationと称号等の同一視を拒否し、不足した評価根拠はそのsource ownerへ戻す。major miss rubric、数値threshold、class既定値、再評価scheduleを本acceptanceで追加しない。
