---
title: "Workerへの実行主体の統一と旧実行主体の廃止 decision record（2026-09-26）"
decision_record_id: HDEC-WORKER-EXECUTION-MODEL-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: docs/concept/sources/worker-execution-model-po-original-2026-09-26.md
authority_effect: effective_when_this_record_is_admitted_to_main
---

# Workerへの実行主体の統一と旧実行主体の廃止（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POが「HELIX Worker実行モデル統合・旧実行主体廃止要求 v0.1」の本文を示した。本書はその会話の記録である。
POの発言はそのまま引用し、AIの整理と区別する。本文の原文は[source snapshot](../../concept/sources/worker-execution-model-po-original-2026-09-26.md)に保存した。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## POの提示

POは、本文だけを示した。本文は、HELIXの作業の実行主体をWorkerへ統一し、HELIXサブエージェント、エージェントレーン、Runner、Sandboxを独立した上位の概念として廃止する。それらが持っていた能力は削除せず、Worker、HELIX-SECURITY、Runtime Infrastructureへ移す。

## 反映の範囲

AIが、どこまで今反映するか（今全部に反映する、アイデアとして置く、Conceptだけ今改める）を聞いたところ、POは「今全部に反映する」を選んだ。

## Workerの置き場所

原文は、Workerを「HELIXにおける唯一の共通作業実行主体」とするが、共通部品かどうかは書いていない。AIが、共通部品にするか、コア機構にするか、機構の表には置かないかを聞いたところ、POは「機構の表には置かない」を選んだ。

AIの整理：
- Conceptの機構の表から「Runner／Sandbox（共通部品）」の行を除き、Workerの行は加えない。Workerは、図と説明の段落で示す。
- Conceptの機構と共通部品の数は、8つの機構と1つの共通部品（HELIX-CONNECT）になる。
- 原文の実際の資源の持ち手「HELIX Runtime Infrastructure」は、新しいコア機構HELIX-INFRASTRUCTUREの案として、POが全体を見てから扱いを決めるアイデアの段階にある（未mergeのPR #2148の判断記録HDEC-INFRASTRUCTURE-L1-IDEA-2026-09-26）。そのため、Conceptでは「実行基盤」と書き、機構の名前は入れない。

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。旧HELIXの大部分は、Workerを実行の単位とし、subagentを親の内部の要員とし、作成者と検証者を分けていた。本件は、それを上位の概念の整理として揃える。

| 本件 | 旧HELIX | 保持する点 | 変わる点 |
|---|---|---|---|
| Workerを実行の主体にする | 旧Worker共通契約（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:55-58`） | すべてのWorkerは版付きの記述を持ち、HELIXの所有する経路からだけ起動し、隔離したworktreeの中で実行する | 同じ |
| Workerはレーンの主がSubagentとして呼び出すモデルであり、範囲は呼び出したレーン以下 | 旧常駐レーン要件（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:42,304-311`） | レーンの中でnativeのsubagentを使ってよいが、HELIXから見た責任の主体は親のレーン一つに限る。subagentは独立したleaseやwriterを持たず、親のIssue・branch・範囲・予算を継承する | 親のレーンの中で呼び出すsubagentを、Workerと呼ぶ。旧の「HELIXサブエージェント」を別の概念として置かない（下の「レーンとWorkerの定義」のPOの説明） |
| 作成したWorker自身またはそのSubagentのreviewは独立reviewにしない | 旧Worker共通契約（同:60,129）、旧HR-FR-HIL-08（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:42`）、旧Codexのnative worker（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md:39-40,65-68`）、旧pillar要求（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md:96`） | Workerとreviewerを別にし、作成者による自己reviewや、同じruntimeの中のsubagentのreviewを、合格の根拠にしない | 同じ |
| レーンは役割の割当て先とし、固定しない | 旧三社レーン要件（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md:37-41`） | 役割ごとのレーン（旧の`codex_control`、`claude_independent_review`等）へ作業を割り当て、モデル名をレーンのidentityにしない | 旧は、3つのレーンをexactな集合として固定していた。本件は、レーンを推進やreview等の役割の割当て先とし、provider名や固定のレーン数を恒久の要件にしない |
| Runnerの能力をWorkerの実行へ移す | 旧Worker lifecycle receipt（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md:20,24`）、旧runner attestation（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/runner-attestation-journal-authority.md:16-20`） | Workerの実行を、要求、受け入れ、隔離、実行、結果までの一つのreceiptに束ねる | 旧の「runner」は証拠の書き手を指していた。本件は、開始、停止、timeout、結果の回収、実行の証拠をWorkerの実行の能力とする |
| Sandboxの能力を、SECURITYの制約、Workerの実行、実行基盤へ分ける | 旧Worker共通契約（同:57-58,95-99）、旧Worker isolation broker（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-isolation-broker.md:23,30`） | 隔離は、Workerの起動の外側から掛ける制約であり、掛けられなければ起動前に止める | 制約とauthorityはSECURITYが持ち、Workerの実行環境が強制し、具体の方式（bubblewrap等）は実行基盤の側に置いて固定しない |

旧HELIXの中で本件と食い違う箇所は、次のとおりである。
- 旧GitHub自走運用要件（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md:93`）は、単一のruntimeのときに「独立subagent receipt」を代わりの証跡とする。旧pillar要求:96はこれを拒み、旧HELIXの中でも食い違っていた。本件は、旧pillar要求の側を保持し、同じWorkerの中のsubagentのreviewを独立した検証の代わりにしない。
- 旧三社レーン要件:37-41のレーンをexactな集合に固定する点は、上の表のとおり置き換える。

## 独立reviewとレーン

移行の分類の途中で、原文の「独立検証が必要な場合は別Workerへ割り当てる」について、同じproviderの別Workerを独立した検証と認めるかが、原文から読み切れなかった。AIが、別Workerなら認める、別providerを要る、対象の重さで分ける、のどれかを聞いたところ、POは次のように答えた。

> 「別Workerか」「別providerか」で独立性を定義しない。
> レーンとWorkerは別概念。独立レビューは、作成側とは別のreviewer identity・context・authority・review routeで行われ、作成側の結論を引き継がず独立して証拠を確認できることを条件にする。provider/modelは記録するが、同一providerだから非独立、別providerだから独立とはしない。
> Review依頼は既存どおり通知経路で別reviewerへ渡す。作成Worker自身またはそのSubagentによるreviewは独立reviewに数えない。
> なお、HELIX自身の開発環境とWeb提供環境は別要求として扱う。HELIX内部開発はGUI中心・CLI原則不使用という方針もこの独立性判定とは分離する。

AIの整理：
- 独立reviewの条件は、reviewerのidentity・context・authority・review routeが作成側と別であり、作成側の結論を引き継がずに証拠を確かめられることである。providerが同じか別かでは決めない。
- 原文のRETIRE-WORKER-005（Worker＝実行の枠）のうち、「レーンを独立した実行の主体として扱わない」ことは保つ。「Workerが一つの作業レーンを表す」は、POの回答「レーンとWorkerは別概念」に合わせて採らない。
- 旧HELIXのHBR-P2（Codexだけのときは`cross_agent_review: unavailable`と記録する。旧pillar要求:96）の、同じruntimeの中のsubagentのreviewを独立reviewの代わりにしない点は保つ。providerの一致で独立でないとする読み方は採らない。
- HELIX自身の開発環境とWeb提供の環境は別の要求として扱い、HELIXの内部の開発の方針（GUI中心、CLIを原則使わない）は、独立性の判定の条件にしない。

## レーンとWorkerの定義

移行の作業の途中で、POは次のように説明した。

> レーンをcodex、Claudeとした場合、codexに推進、Claudeにレビューを割り当てるみたいな概念。WorkerはGUIのレーン主が仮にオーパスだった場合、Workerはサブエージェントで呼び出したsonnetが該当する。チケットが指定するWorkerというのはラボがHELIX-Benchで集計したWorkerの作業履歴からどのモデルクラスなら対応可能なレベルかを導くってこと。

AIの整理：
- レーンは、推進やreview等の役割の割当て先である（例：Codexのレーンに推進、Claudeのレーンにreview）。レーンは残し、Workerとは別の概念とする。
- Workerは、レーンの主がSubagentとして呼び出して作業させるモデルである（例：GUIのレーンの主がOpusなら、Subagentとして呼び出したSonnetがWorker）。原文の「HELIXサブエージェント」は、別の概念として置かず、Workerに当たる。
- ticketが指定するWorkerは、LABOがHELIX-BenchでWorkerの作業履歴を集計し、どのモデルクラスなら対応できる水準かを導いたものである。
- 本書の上の整理のうち、次を本節の説明に合わせて改める。「エージェントレーンを独立した概念として廃止する」は、「レーンを役割の割当て先として残し、実行はWorkerが担う」とする。原文の「Worker内部のSubagent」（RETIRE-WORKER-001、002）は、「レーンの主が呼び出すSubagentがWorker」とする。Subagentの範囲を親以下にする条件（RETIRE-WORKER-003）は、Workerの範囲を呼び出したレーン以下にする条件として保つ。
- Concept、製品責務境界、HELIXの構造仮説、HELIX-OSの要求案と受入案、新世代作業入口、対応表、被覆の区分名を、この定義に合わせる。

## Workerの要求の置き場所

AIが、Worker自体の要求（実行の状態、記録する項目、Subagentの観測、能力の明示等）をどの文書に置くかを聞いたところ、POは次のように答えた。

> Workerは独立機構ではないため、Worker専用のCore/L1は作らない。
> Workerの共通実行契約のownerはHELIX-OSとし、OS要求の中に「Workerへのassignment、実行状態、capability、結果・証拠、Subagent利用の観測、handover/retry/revokeとの接続」を置く。
> ただし、Authority・権限制約・隔離条件はSECURITY、CPU/GPU/host等の実ResourceはRuntime Infrastructure、Worker配置案はINTELLIGENCEがownerであり、OSへ重複定義しない。

AIの整理：
- [HELIX-OSの要求案](../../helix-os/L2-requirements/governance-requirements.md)の「Worker・学習・ログ・CIの具体条件」に、HELIXOS-L2-004の配下としてWorkerの共通の実行契約を置き、対の[受入案](../../helix-os/L11-acceptance/governance-acceptance.md)のHELIXOS-L2-004に確かめる内容を加える。HELIX-OSの要求（L2）は2026-09-25の判断で仮決めであり、本件もその中に入る。
- 原文のRETIRE-WORKER-006〜013の内容（記録する項目、Subagentの観測、capability、Workerとmodelの分離、実行の状態、失効での停止、終了時に状態を残さないこと）を、この契約に入れる。Workerと実行基盤の分離（RETIRE-WORKER-010）は、HELIX-INFRASTRUCTUREの案の側にも置く（PR #2148）。

## 移管先の決まらない項目の扱い

移行の分類で、次の項目の移管先が決まらなかった。原文のとおり、削除しない。
- Runtime Infrastructureへ移す能力（実際の資源、隔離の方式等）：移管先のHELIX-INFRASTRUCTUREはアイデアの段階にある（PR #2148）。Conceptでは「実行基盤」と書き、旧資産は今の場所に残す。
- 旧OS Contract Runner（旧HIL-FR-34。`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:124`）：名前のOSはHELIX-OSではなくoperating systemであり、同じfixtureでLinux、macOS、Windowsの互換（path、権限、signal、file lock等）を確かめる検査の実行である。原文のRETIRE-RUNNER-001により、検査の実行（起動、停止、timeout、結果の回収、実行の証拠）はWorkerが担う。検査の契約の意味は、HARNESSの検証の契約に置く（Conceptの機構の表のHELIX-HARNESS「検証・受入の契約」）。これはPOの定義から導ける。[Concept機構の対応表](../crosswalks/concept-mechanism-version-requirement-crosswalk.md)のjsonlでは、HIL-FR-34、HIL-NFR-09／19、HIL-TR-04／05の5行の候補をWorkerとHELIX-HARNESSにし、HIL-FR-34の保持する意味を原文の目的（同じfixtureでのOSごとの互換の検査）に戻した（独立reviewのR2149-02）。
- 旧資産の個票：[分類監査](../audits/worker-execution-model-migration-2026-09-26.md)は、代表の資産と群の規則で分類し、全数の件数を固定した。続けて、該当する2,169ファイルを1行ずつ分類した[ファイルごとの台帳](../audits/worker-execution-model-migration-files-2026-09-26.md)を残した。retireと未定は0件であり、POの判断と食い違う117件はreplaceとして今の場所に残す。

## 移行の条件

原文は、概念の名前を消すだけで移行を完了とせず、結びつく要求・設計・実装・テスト・設定・Hook・CI・文書を全数確かめ、retain（Worker、SECURITY、Runtime Infrastructure）、replace、retireに分け、能力の移管先が決まらない項目を削除しないとする。

AIの整理：
- 全数の分類は[分類監査](../audits/worker-execution-model-migration-2026-09-26.md)と[ファイルごとの台帳](../audits/worker-execution-model-migration-files-2026-09-26.md)に残す。レーンについては、POの説明（上の「レーンとWorkerの定義」）により、役割の割当て先として残す区分「retain→レーン（OSの割当て）」を加えた。
- 判断記録、POの発言の記録、source snapshot、監査記録、旧資産の台帳は、その時点の記録なので書き換えない。
- 旧資産の台帳（`legacy-asset-disposition.jsonl`）の分類は、本件では変えない。旧資産の再利用を決めるときに、監査記録の分類を起点にする。

## 反映先

- [HELIX Concept](../../concept/helix-concept.md)：図の実行者を「レーン」と「Worker」に分け、Runner／SandboxをWorkerへ置き換え、機構の表からRunner／Sandboxの行を除き、「作業を実行するのはWorker」の説明を加える。OSの行の割当て先をWorkerへ、SECURITYの行にWorkerの実行の制約とauthorityを加える。
- [製品責務境界](../../concept/product-boundary.md)、[5大目標](../../concept/helix-five-goals.md)
- HELIX-OSの要求案（HELIXOS-L2-004の実行の担当と、Workerの共通の実行契約）と受入案、HELIX-LABOのL1企画案、HELIX-INTELLIGENCEの候補
- [HELIXの構造仮説](../../concept/helix-structure-tvo-po-statements-2026-09-18.md)（本書の方針どおり通常の改訂で直す）、[構造と要求の被覆](../helix-structure-requirement-coverage.md)と[旧Requirement IRの分類](../legacy-ir-structure-classification.md)の区分名「OS：推進（チケット発行・Workerへの割当て）」、[Concept機構の対応表](../crosswalks/concept-mechanism-version-requirement-crosswalk.md)とそのjsonl、[新世代作業入口](../new-generation-start-here.md)
- 判断を求めた時点の記録（`concept-requirement-po-decision-packet.md`、`po-optimal-draft-packet.md`）、旧Issueの題名、POの発言の引用、レーンを役割や経路として使う記述（Workerと別の概念）は書き換えない。分類は[監査記録](../audits/worker-execution-model-migration-2026-09-26.md)に残す。
- 未mergeのPR（#2146 INTELLIGENCE、#2147 SECURITY、#2148 INFRASTRUCTURE）の中の旧実行主体の記述は、各PRで改める。
