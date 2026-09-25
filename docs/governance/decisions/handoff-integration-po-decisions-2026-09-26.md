---
title: "機構間の受渡しの統合確認へのPO回答 decision record（2026-09-26）"
decision_record_id: HDEC-HANDOFF-INTEGRATION-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: 2026-09-26（Asia/Tokyo）のClaude作業sessionでの統合確認の問いとPOの回答
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 機構間の受渡しの統合確認へのPO回答（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、AIが機構間の受渡しの統合確認を行い、食い違いと未決の点をPOに問うた。本書は、その問いとPOの回答の記録である。
POが選んだ選択肢は、選択肢の説明文も含めてPOが選んだ内容として扱う。POの発言はそのまま引用し、AIの整理と区別する。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## 問いとPOの回答

### 1. ticketで指定するWorkerの決め方

AIの問い：「チケットで指定するWorkerは、どの流れで決めますか？」（AIの説明：LABOがHELIX-Benchから導く、INTELLIGENCEが配置の案、OSのチケット発行が指定、の三つが並び、つなぎ方が未定。旧HELIXではBenchは証拠を返すだけで配車側が決め、未評価のモデルには未評価の印を付けて使っていた）

POの選択：「三段でつなぐ（推奨）」

> LABOがBench履歴から「どのモデルクラスなら対応できるか」の水準を出す。INTELLIGENCEがその水準を材料にチケットごとの配置の案を作る。OSの推進がその案を確かめて指定・割当てする。未評価のモデルには旧HELIXと同じく「未評価」の印を付ける。

### 2. レーンに割り当てる役割の名前

AIの問い：「レーンに割り当てる役割の『推進』はどういう意味か」（AIの説明：OSのチケット発行の機能名と、Codexのレーンに推進を割り当てる、の二重になっている。旧HELIXではCodexのレーンは設計・実装・PR作成＝作る側）

POの選択：「レーンの役割は『作成』（推奨）」

> レーンの役割は「作成」と呼び分け、「推進」はOSのチケット発行の機能名だけに使う。

### 3. Conceptの「提供と改善」の図

AIの問い：「Conceptの『提供と改善』の図で、Web-OSのjob、INTELLIGENCEの学習job、LABOの評価jobがOSとレーンを通らずWorkerへ直接渡っている。図とチケットの種類をどうするか」

POの選択：「OS経由に直す（推奨）」

> 矢印をOSの推進とレーンを通る形に直し、OSのチケットの種類に比較実験・学習・Web提供側のjobに当たるものを足す案をAIが作る。

### 4. OS 1.0の動的ワークフローとConcept 4.0の境目

AIの問い：OS 1.0の「案件ごとに必要な工程を動的ワークフローとして組み立てる」「再計画」と、Concept 4.0の到達点「案件ごとに開発フローを組み立て、途中結果で再計画する」の境目はどこか。

POの選択：「決まった部品の組合せ／自ら組み立てる（推奨）」

> 1.0はHARNESSが定めた工程の部品を規則どおりに組み合わせ、途中結果で差し戻す。4.0はINTELLIGENCEの判断で、部品にない流れまで自ら組み立てて再計画する。

### 5. LABOの評価の渡し方と改善ループの主語

AIは、LABOの評価の渡し方と、改善ループの主語を2問で聞いた。POは2問に同じ文で答えた。

> 何を指しているのかわからないが、お前のOSの前提が古すぎてうざい。

### 6. POの追加の発言

> 工程管理もな。OSはPMに近い。

> 周辺機構をPMOと考えればつじつまが合うだろ。

## 最新のOSの前提の出典

回答5で、POはAIのOSの前提が古いと指摘した。AIは、次のPOの原文を読み直した。

- [Worker実行モデルの原文](../../concept/sources/worker-execution-model-po-original-2026-09-26.md)「RETIRE-WORKER-014」：HELIX-OSは、Assignment、Ticket、priority、dependency、budget、progression、retry／reassignmentを管理する。OS自身がWorker実装へ変わらない。
- [Runtime Infrastructureの原文](../../helix-infrastructure/sources/runtime-infrastructure-l1-po-original-2026-09-26.md)「OSとの境界」：OSは、何を変更するか、どのTicketで進めるか、誰が行うか、どの証拠を登録するか、いつ停止・再開するかを統制する（OS = Work／Change State）。
- [V-model Forward／Reverseの原文](../../helix-harness/sources/v-model-forward-reverse-po-original-2026-09-26.md)「21. OSの責務」：HARNESSは工程原則と検証義務を定義し、OSはTicket→必要工程をcompile→Workerへ配車→Atomic CI→合流管理→Proof CI→Evidence登録→次状態へpromotionを運転する。OSはoracleを勝手に削除・追加しない。
- [LABO Core Engineの原文](../../helix-labo/sources/labo-core-engine-po-original-2026-09-26.md)「18. OS Feedback」「23. Feedback Lifecycle」：OSは改善候補の登録・還流先への振り分けと実行統制を担う。LABOはOSのauthorityを直接更新しない。

## AIの整理

### OSはPM、周辺機構はPMO

- OSはPMにあたる。ticket、工程管理、割当て、優先度、依存、予算、進行、再試行・再割当てを決めて回す。
- 周辺機構はPMOにあたる。INTELLIGENCEは計画と配置の案、LABOは実績の評価・改善の提案・Workerの水準、HARNESSは工程の標準と検証義務、BRAINは設計知識、SECURITYは制約とauthority、実行基盤（HELIX-INFRASTRUCTUREの案）は資源を出す。
- PMOは案・標準・評価・制約を出すが、PMの決定を直接書き換えない。PMもPMOの案を無条件に実行せず、適格性を確かめて決める（Conceptの「決めるのはOS」、OSの「しないこと」の「INTELLIGENCEの案の無条件実行」と同じ）。
- 改善ループの主語は、中身（観測・評価・改善の提案）はLABO、登録・振り分け・ticket化して回すのはOSとなる。
- LABOの評価の渡し方は、評価済みの材料（汎用の構造の候補、判断・モデル改善の材料、Workerの水準）をLABOからBRAIN・INTELLIGENCEへコネクタで渡し、改善の提案はOSが登録・振り分け、採否へ回す（LABO原文18章・23章と整合）。

### 回答1から4の反映

- Workerの指定は三段とする。LABOがHELIX-BenchでWorkerの作業履歴を集計してモデルクラスの水準を出し、INTELLIGENCEがそれを材料にticketごとの配置の案を作り、OSの推進が案を確かめて指定・割当てする。評価していないモデルには「未評価」の印を付ける。
- レーンの役割は「作成」と「review」等とし、「推進」はOSのチケット発行の機能名だけに使う。
- 「提供と改善」の図で、INTELLIGENCEの学習jobとLABOの比較実験のjobを、OSの推進とレーンを通してWorkerへ渡す形に直す。OSのticketの種類に、比較実験（Experiment）と学習（Training）の案を足す。Web-OSのjobは下の「直さなかった点」のとおり、図を直していない。
- 1.0の推進は、HARNESSが定めた工程の部品を規則どおりに組み合わせ、途中結果で差し戻す。4.0は、INTELLIGENCEの判断で部品にない流れまで組み立てて再計画する。

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。

| 本件 | 旧HELIX | 保持する点 | 変わる点 |
|---|---|---|---|
| Workerの指定の三段 | 旧HELIX-Bench評価契約（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:23-32`：Benchはmodel単体ではなく組織編成と実行規律を比べる評価契約で、worker admissionの判断はL4以降）、旧HXB-FR-015（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:349-351`：Benchは証拠の状態と改善候補を返し、registry・admissionのownerが検査し、配車側がcapacity等と合わせて配車を決める。Benchから直接model切替・権限拡大を行わない） | Benchは証拠と水準を返すだけで、配車を決めない。配車は配車側が別の条件と合わせて決める | Benchの持ち手をLABOとし、配置の案を作る段（INTELLIGENCE）を間に置く。配車を決めるのはOSの推進とする |
| 未評価の印 | 旧RLO-FR-040（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:663-666`：effortはHELIX-Benchのtask class別evidenceから導き、未評価時は`provider_default_unbenchmarked`と明示し、score単独でscope・branch・assignment・merge authorityを変えない） | 未評価を明示し、評価済みと混同しない。水準だけでauthorityを変えない | 印を付ける対象を、effortからモデルクラスの水準へ広げる。印の名前は下流の設計で決める |
| レーンの役割「作成」 | 旧Infinity Loopの主体表（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:34`：CodexはG3承認後のUIデザインを除く設計・実装・検証・PR・CI self-heal）、旧三社レーン（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md:39`：`codex_control`、`cursor_cloud_execution`、`claude_independent_review`） | Codexのレーンは作る側、Claudeのレーンは独立review側という役割の分け方 | 役割の名前を「作成」とし、provider名や固定のレーン数をレーンのidentityにしない（2026-09-26の[Worker実行モデルの判断記録](worker-execution-model-po-decisions-2026-09-26.md)のとおり） |
| 比較実験のticket | 旧Execution Ticket候補（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:157-163`：ExperimentDefinitionとMeasurementRequestを実行前に固定し、新規実行が要るときだけ作業Ticket・Assignmentを合成する。評価作業のTicketと評価対象のTicketを混同せず、評価作業の完了で対象Ticketをcloseしない。既存runnerへsubject bindingを渡すだけで足りる場合は新しいTicket種別を増やさない）、同`:343`（本線と実験のbudget・queue classを分ける） | 評価作業と評価対象を別のticketにし、既存の観測で足りるときはticketを増やさない。本線と実験の予算と列を分ける | 追加の実行が要る比較実験を、ticketの種類「Experiment」として明示する（新しい種類の案。L2は仮決め） |
| 学習のticket | 対応なし。`archive/`を「training」「学習job」「fine-tun」で探し、モデルの学習を作業ticketとして扱う記述は見つからなかった。旧Execution Ticket取込（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-intake.md:164`）は、モデルweightsのfine-tuningを要求しないとしていた | — | 新規案。3.0の版の印を付けて「Training」を案として置く |
| findingの振り分け | 旧HIL-BR-17（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:69`）、旧HIL-FR-30（同`:120`）：監査findingをcurrent contractへの影響と責務境界で機械的に振り分け、同じ責務・既存scope内で安全かつ局所的に閉じるものは`current_pr_fix`としてwriterへ返し、独立した責務・別設計・lifecycle・性能改善は`successor_issue`にする。AIの自由判断だけによる破棄と、後続のものの今のPRへの再流入を認めない | 振り分けの規則、writerへの返却、破棄と再流入の禁止 | 振り分けの受け手をOSの推進とし、`successor_issue`をIssueではなく次のticketにする（ticketが正、Issueは映し） |
| 上流段階のticketの出どころ | 旧HIL-BR-13（同`:65`：画面のある対象はprototype→walkthrough→要求back-propagation→合意の後に要件を凍結する）、旧Requirement Re-entry（`execution-ticket-requirements.md:242`） | 上流の段階の作業も、登録された要求と戻しから始める | PoC・Prototype・Decide・Backflowのticketを、OSの推進が登録済みの要求とBackflowから発行し、INTELLIGENCEは案を出せるとする |
| OSはPM、周辺機構はPMO | 旧HARNESSの画面要求の区分（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:340`：PM（Project Management）＝動的な案件遂行、データ源はplan・gate・phase・continuation・trace）、旧PMOのagent（`archive/legacy-generation-2026-09-14/root/.claude/agents/pmo-sonnet.md:11,22-30`：状況把握・構造化チェック・判断と提案を返し、影響の大きい判断は結論を出さずescalateする） | PMは案件遂行の状態を持って回す。PMOは状況把握・評価・提案を返し、決定しない | 旧PMOはClaudeのsubagentの役割名だった。本件では、機構どうしの関係の見立てとして、OSをPM、周辺機構をPMOにあてる。旧のagent定義・runtimeは使わない |
| 1.0と4.0の境目 | 旧Vision v0.1の4.0（`archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md:190-208`：チューニングしたモデル群が案件に必要な開発フローそのものを構築し、途中結果に応じて再計画する。既存の計画・配車・部分合成を土台にし、「既存の動的な仕組みが4.0以前に存在しない、という線引きにはしない」。再計画で以前の承認や検証を勝手に流用しない）、旧INV-070（`archive/legacy-generation-2026-09-14/root/docs/archive/intake/development-investment-stage-directives-source_v1.0.md:1990-2006`：既存Work Graphと検証義務を入力に知識とmodelが計画候補を作る。計画器が必要義務や権限を削らない）、旧HIL-FR-31（`infinity-loop-platform-requirements.md:121`：影響した層の対をstaleにして再承認前のForward合流を拒否する） | 4.0より前にも部品の組合せによる動的な仕組みがあり、4.0は知能が状況を解釈して開発方法を構成する段階とする。計画が必要な義務・権限を削らない。1.0の差し戻しは旧の再入の規則を保つ | 境目を、1.0＝HARNESSが定めた工程の部品の規則どおりの組合せと途中結果での差し戻し、4.0＝INTELLIGENCEの判断による部品にない流れの組み立てと再計画、と書き分ける（PO回答4） |
| OSが割り当てる主体 | 旧Execution Ticket取込（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-intake.md:160`：人間PMだけが割当する構造を追加しない）、旧HXT-FR-024（`execution-ticket-requirements.md:280-282`：管理側はreclassify・split・replan・backflow等のproposalを作れるが、Ticketの意味を直接上書きしない） | 割当てを人のPMに限らない。提案する側はticketの意味を直接上書きしない | PMにあたるのは人ではなくOSとする。提案する側（PMO）をINTELLIGENCE・LABO等の周辺機構として明示する |

## OS L1の対象revisionとの関係

HELIX-OSのL1は、[2026-09-24のPO判断](concept-requirement-po-decisions-2026-09-24.md)で本文SHA-256 `ffbafa47e5b218c4ddfdd170e4ba7c12cd6cdfe518fbdcce5ccbbee7e0b151bc`をPOが採用し、その後[2026-09-25のPO判断](mechanism-placement-po-decisions-2026-09-25.md)でL1-011・L1-012を案内行に変えた。
本記録の反映で、提供価値の段落とHELIXOS-L1-006を、上の「OSはPM、周辺機構はPMO」に合わせて改めた。この変更は、本記録のPOの回答（回答5〜7）による。変更後の本文の対象revisionは、PO最適ドラフトPRで確認する。
[製品責務境界](../../concept/product-boundary.md)（2026-09-24にSHA `9268e357…ac0a`をPOが採用）と[5大目標](../../concept/helix-five-goals.md)（内容をPOが採用）も、同じ理由で改訂した。

## 反映先

- [HELIX Concept](../../concept/helix-concept.md)：4.0の行と4.0の説明の段落（1.0との境目）、開発の流れの図のレーンの役割、「提供と改善」の図（学習jobと比較実験のjobをOSの推進とレーン経由へ、Web-OSの学習入力をLABO経由へ）、LABOの行（Workerの水準）、「作業を実行するのはWorker」の項（役割を「作成」へ、Workerの指定を三段へ）、原則に「OSはPMに近く、周辺機構はPMOにあたる」を追加
- [HELIX-OSの要求案](../../helix-os/L2-requirements/governance-requirements.md)（HELIXOS-L2-004、005、010、011、ticketの節、ticketの種類、Worker実行契約）と[受入案](../../helix-os/L11-acceptance/governance-acceptance.md)
- [HELIX-OSのL1](../../helix-os/L1-planning/system-intent.md)（提供価値、HELIXOS-L1-006）
- [HELIX-LABOのL1企画案](../../helix-labo/L1-planning/labo-intent.md)（提供価値、HELIXLABO-L1-007、010、新しいHELIXLABO-L1-011）
- [HELIX-INTELLIGENCEのL1企画案](../../helix-intelligence/L1-planning/intelligence-intent.md)（HELIXINTELLIGENCE-L1-010と接続の表）
- [HELIX-BRAINのL1企画案](../../helix-brain/L1-planning/brain-intent.md)（HELIXBRAIN-L1-007、009の昇格の経路）
- [5大目標](../../concept/helix-five-goals.md)、[製品責務境界](../../concept/product-boundary.md)、[HELIXの構造仮説](../../concept/helix-structure-tvo-po-statements-2026-09-18.md)（通常の改訂）、[HARNESSのL1](../../helix-harness/L1-planning/product-intent.md)（対象外の段落）、[新世代作業入口](../new-generation-start-here.md)
- 判断記録、POの発言の記録、source snapshot、監査記録、Scaffold Bindingの既存のnoteは、その時点の記録なので書き換えない（[Worker実行モデルの判断記録](worker-execution-model-po-decisions-2026-09-26.md)の「codexに推進」の引用を含む）。

## 直さなかった点

- Web-OSのjob：POは「OS経由に直す」を選んだが、Conceptの機構の表はHELIX-Web-OSの「しないこと」を「内部OSの状態・鍵・権限の共有」とし、OSの要求案も展開後のConnector job・service stateをHELIX-OSの内部のstate・writer・authorityへ収容しないとする（2026-09-14のPO指示「展開時はHELIX-OSの外にHELIX-Web-OSを作る」）。顧客のjobを内部OSのticketとレーンに通すと、この境界と食い違う。WebとWeb-OSは2026-09-24のPO判断でVisionレベルの材料へ分類し直されている。このため、「提供と改善」の図のWeb-OS→Workerの矢印とticketの種類には手を入れず、扱いをPOの判断事項として残す。
- BRAINへの昇格の採否：AIの整理で「人の採否」と書く案があったが、旧HELIX（旧RCLS-BR-004：project内の知識を独立検証、横断検証、shadowを経て仕組みへ昇格する）は昇格に人の承認を求めておらず、AGENTS.mdは人の判断を人が持つ上流の意味を変える場合に限る。このため、BRAINのL1には「OSが登録・振り分け、BRAINの変更の手続きの中で独立した検証を経て採否する」と書き、人の判断は人が持つ上流の意味に関わる場合に限った。
