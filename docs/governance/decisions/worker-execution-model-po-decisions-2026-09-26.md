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
- 原文の実際の資源の持ち手「HELIX Runtime Infrastructure」は、新しいコア機構HELIX-INFRASTRUCTUREの案として、POが全体を見てから扱いを決めるアイデアの段階にある（[判断記録](infrastructure-l1-idea-po-decisions-2026-09-26.md)、PR #2148）。そのため、Conceptでは「実行基盤」と書き、機構の名前は入れない。

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。旧HELIXの大部分は、Workerを実行の単位とし、subagentを親の内部の要員とし、作成者と検証者を分けていた。本件は、それを上位の概念の整理として揃える。

| 本件 | 旧HELIX | 保持する点 | 変わる点 |
|---|---|---|---|
| Workerを実行の主体にする | 旧Worker共通契約（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:55-58`） | すべてのWorkerは版付きの記述を持ち、HELIXの所有する経路からだけ起動し、隔離したworktreeの中で実行する | 同じ |
| Subagentは親のWorkerの中に置き、範囲は親以下 | 旧常駐レーン要件（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:42,304-311`） | レーンの中でnativeのsubagentを使ってよいが、HELIXから見た責任の主体は親の一つに限る。subagentは独立したleaseやwriterを持たず、親のIssue・branch・範囲・予算を継承する | 親を「レーン」から「Worker」へ置き換える |
| 同じWorkerの中のreviewは独立した検証にしない | 旧Worker共通契約（同:60,129）、旧HR-FR-HIL-08（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:42`）、旧Codexのnative worker（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md:39-40,65-68`）、旧pillar要求（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md:96`） | Workerとreviewerを別にし、作成者による自己reviewや、同じruntimeの中のsubagentのreviewを、合格の根拠にしない | 同じ |
| エージェントレーンを独立した概念にしない | 旧三社レーン要件（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md:37-41`） | モデル名をidentityにしない | 旧は、3つのレーンを第一級のidentityとして固定していた。本件は、Workerが実行の枠そのものであり、レーンはWorkerの配置と容量を表す属性に限る |
| Runnerの能力をWorkerの実行へ移す | 旧Worker lifecycle receipt（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md:20,24`）、旧runner attestation（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/runner-attestation-journal-authority.md:16-20`） | Workerの実行を、要求、受け入れ、隔離、実行、結果までの一つのreceiptに束ねる | 旧の「runner」は証拠の書き手を指していた。本件は、開始、停止、timeout、結果の回収、実行の証拠をWorkerの実行の能力とする |
| Sandboxの能力を、SECURITYの制約、Workerの実行、実行基盤へ分ける | 旧Worker共通契約（同:57-58,95-99）、旧Worker isolation broker（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-isolation-broker.md:23,30`） | 隔離は、Workerの起動の外側から掛ける制約であり、掛けられなければ起動前に止める | 制約とauthorityはSECURITYが持ち、Workerの実行環境が強制し、具体の方式（bubblewrap等）は実行基盤の側に置いて固定しない |

旧HELIXの中で本件と食い違う箇所は、次のとおりである。
- 旧GitHub自走運用要件（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md:93`）は、単一のruntimeのときに「独立subagent receipt」を代わりの証跡とする。旧pillar要求:96はこれを拒み、旧HELIXの中でも食い違っていた。本件は、旧pillar要求の側を保持し、同じWorkerの中のsubagentのreviewを独立した検証の代わりにしない。
- 旧三社レーン要件:37-41のレーンを第一級のidentityとする点は、上の表のとおり置き換える。

## 移行の条件

原文は、概念の名前を消すだけで移行を完了とせず、結びつく要求・設計・実装・テスト・設定・Hook・CI・文書を全数確かめ、retain（Worker、SECURITY、Runtime Infrastructure）、replace、retireに分け、能力の移管先が決まらない項目を削除しないとする。

AIの整理：
- 全数の分類は[監査記録](../audits/worker-execution-model-migration-2026-09-26.md)に残す。
- 判断記録、POの発言の記録、source snapshot、監査記録、旧資産の台帳は、その時点の記録なので書き換えない。
- 旧資産の台帳（`legacy-asset-disposition.jsonl`）の分類は、本件では変えない。旧資産の再利用を決めるときに、監査記録の分類を起点にする。

## 反映先

- [HELIX Concept](../../concept/helix-concept.md)：図の実行者とRunner／Sandboxを Workerへ置き換え、機構の表からRunner／Sandboxの行を除き、「作業を実行するのはWorker」の説明を加える。OSの行の割当て先をWorkerへ、SECURITYの行にWorkerの実行の制約とauthorityを加える。
- [製品責務境界](../../concept/product-boundary.md)、[5大目標](../../concept/helix-five-goals.md)
- HELIX-OSの要求案（HELIXOS-L2-004）と受入案、HELIX-LABOのL1企画案、HELIX-INTELLIGENCEの候補
- 未mergeのPR（#2146 INTELLIGENCE、#2147 SECURITY、#2148 INFRASTRUCTURE）の中の旧実行主体の記述は、各PRで改める。
