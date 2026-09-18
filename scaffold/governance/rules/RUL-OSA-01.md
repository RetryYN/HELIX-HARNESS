---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSA-01
group: OS検収
product: OS
atoms_primary: 103
atoms_secondary: 80
issue_projection: #1860
---

# RUL-OSA-01（OS検収／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

作成と検証を分ける。別の作業者・別のsession・可能なら別のmodel系統で審査し、審査者は編集しない。同じproviderで検証した場合は理由を残す。

## 主として対応づいた規則（103件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-145` | PDM managerは高影響の推奨を確定する前にTL advisorへadversarial technical checkを1回依頼する。 | lane_delegation | prose | .claude/agents/pdm-innovation-manager.md:26-26 |
| `RA-152` | 複数runtimeが使える場合は作成側と判断側を分け、設計・judgement gate・R4判断は可能な限り別runtimeまたはmodel familyへ回す。 | review_merge | prose | AGENTS.md:207-209; CLAUDE.md:281-282; .claude/CLAUDE.md:106-108; .claude/CLAUDE.md:289-289 |
| `RA-153` | 単一runtimeではintra_runtime_subagentの代替review証跡を残し、self-reviewだけでaccept gateを通さない。 | review_merge | prose／gate | AGENTS.md:209-209; CLAUDE.md:282-282; .claude/CLAUDE.md:108-108; .claude/commands/sdd-review.md:28-30; .claude/commands/ship.md:14-15 |
| `RA-159` | AI-AはPR作成・blocker修正・pushを担い、AI-Bはread-only review・finding disposition・merge判断を担って編集・push・Ready化しない。 | review_merge | prose | AGENTS.md:324-325; CLAUDE.md:202-203; .claude/CLAUDE.md:115-116 |
| `RA-168` | code-reviewerは実装・直接修正をせず、差分・関連test・仕様を読んで根拠付き所見を返す。 | review_merge | prose | .claude/agents/code-reviewer.md:21-29; .claude/agents/code-reviewer.md:105-108 |
| `RA-184` | review実行者は承認前にdoctorのexit 0を確認し、judgement gateでexecution modeに応じた独立review証跡を要求する。 | review_merge | prose／gate／doctor | .claude/commands/sdd-review.md:28-30 |
| `RB0-138` | agentは自分の変更を同一contextで自己承認せず、fresh contextまたは別runtimeへreviewを回す。 | review_merge | prose | docs/skills/judgment-core.md:81-82; docs/skills/judgment-core.md:125-126 |
| `RB0-153` | 敵対reviewの割当者は成果物作成に関与したmodel・sessionを攻撃者にも防御者にもせず、可能な限り別runtime/model familyへ回す。 | review_merge | prose | docs/skills/adversarial-review.md:70-73 |
| `RB0-154` | 敵対reviewの依頼者はreviewerへ作業経過や会話履歴を渡さず、成果物と設計正本だけを渡す。 | memory_context | prose | docs/skills/adversarial-review.md:72-73 |
| `RB0-177` | team作成者は成果物workerとjudgement reviewerを分離し、fast checkerに最終判定をさせない。 | lane_delegation | prose | docs/skills/agent-teams.md:54-63; docs/skills/agent-teams.md:93-94 |
| `RB0-178` | 別model familyのないsingle-runtime運用ではreviewerはsilent passせず、intra_runtime_subagent証拠と制限を記録し、高riskならescalateする。 | lane_delegation | prose／gate | docs/skills/agent-teams.md:65-72 |
| `RB04-019` | 判断gateは必ず実行modeを参照し、実装者自身の読み直しを通過根拠にしない。 | review_merge | gate | docs/governance/helix-harness-concept_v3.1.md:194-202; docs/governance/helix-harness-concept_v3.1.md:216-216 |
| `RB04-020` | 単一runtimeの判断gateは専門サブエージェントレビューを必須とし、checklist逐条記録がなければexit 1で停止する。 | review_merge | gate | docs/governance/helix-harness-concept_v3.1.md:211-211; docs/governance/helix-harness-concept_v3.1.md:218-218 |
| `RB04-023` | cross-agent承認ではworkerとreviewerのモデル識別子を必須とし、欠落または同一provider/modelなら承認を無効にしてgateを止める。 | review_merge | gate／doctor | docs/governance/helix-harness-concept_v3.1.md:210-217; docs/governance/helix-harness-concept_v3.1.md:1256-1257 |
| `RB05-045` | 旧監査frameworkでは、機械だけでsafeと判定できるPRはAIレビューを省略できる。 | review_merge | prose | docs/governance/audit-framework.md:498-498; docs/governance/audit-framework.md:535-541 |
| `RB05-149` | agent検証はlifecycle順序・lease・result・独立verification receiptが結線された場合だけverifiedとする。 | lane_delegation | prose | docs/governance/infinity-loop-system-assertion-cases.md:52-52 |
| `RB05-151` | blind verifier packetにworkerのreasoningが混入した場合、agent管理者はlease発行を拒否する。 | lane_delegation | prose | docs/governance/infinity-loop-system-assertion-cases.md:54-54 |
| `RB05-156` | workerとverifierが同じprovider familyの場合はteam ready化を拒否し、audit・close・memory昇格でproviderとroleを分離しない自己承認を認めない。 | lane_delegation | prose | docs/governance/infinity-loop-system-assertion-cases.md:61-61; docs/governance/infinity-loop-system-assertion-cases.md:413-413 |
| `RB05-231` | template auditはauthorとauditorを分離し、translatorによる自己promotionを拒否し、audit receiptなしではactive化しない。 | lane_delegation | gate | docs/governance/infinity-loop-system-assertion-cases.md:265-267 |
| `RB06-024` | 最終review担当者は必須test green後に、対象revisionとHEADを固定し、workerとは別のreviewerとしてreviewする。 | review_merge | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:233-237 |
| `RB06-172` | audit・close・memory昇格はproviderとrole分離のない自己承認を拒否する。 | review_merge | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:160-160 |
| `RB06-269` | 構造整合は毎commitのengine検査、意味整合は独立reviewへ分け、単一runtimeの判断gateでもsubagent区分とchecklistを記録して素朴な自己reviewを根拠にしない。 | review_merge | prose | docs/governance/gate-design.md:167-174 |
| `RB07-101` | 敵対reviewでは作成者を攻撃者・防御者にせず、判定を別runtimeまたはmodel familyへ回す。 | lane_delegation | prose | docs/skills/skill-authoring.md:75-76 |
| `RB07-259` | hybridではreviewを別agent familyへ送り、単一runtimeではintra_runtime_subagentと記録して5軸手順を全て実施する。 | lane_delegation | prose | docs/skills/code-review.md:100-109 |
| `RB08-090` | judgement gateはhybridでcross-agent review、単一runtimeでintra_runtime_subagent evidenceを要求し、自己reviewだけを認めない。 | review_merge | gate | docs/skills/gate-planning.md:75-79 |
| `RB08-274` | AI-Aはcandidate作成と局所検証・blocker修正を担い、AI-Bはcurrent HEADをread-onlyでreviewしてblockerを一括返却する。 | review_merge | prose | docs/governance/operations-rule-audit-2026-07-26.md:34-37; docs/governance/operations-rule-audit-2026-07-26.md:51-55 |
| `RB08-307` | cross-review admissionはCodex author/Claude reviewerと逆方向を同じcoreで判定し、同一runtime・同一家族・未知model・runtime/model混同・stale HEAD・別PR・重複receiptを拒否する。 | review_merge | gate | docs/governance/issue-514-cross-review-admission-symmetry-closure.md:12-15 |
| `RC0-085` | Review guardは、read-only委譲roleのsession後に新たなdirty pathが増えた場合、違反を警告する。開始前からdirtyだったpathへの追加編集はこの判定では検出しない。 | review_merge | gate | src/runtime/review-guard.ts:23-57; src/runtime/review-guard.ts:78-103 |
| `RC0-086` | Staged review判定は、staged pathにレビューsession由来の変更pathが含まれる場合、ok=falseを返す。 | review_merge | gate | src/runtime/review-guard.ts:114-126 |
| `RC0-098` | Judgment gateは、self_review・self-review・naive_self_reviewをレビュー証拠として拒否する。 | review_merge | gate | src/gate/review-tier.ts:115-124; src/gate/review-tier-policy.ts:1-7 |
| `RC0-099` | Hybridのjudgment review checkは、cross_agentでない場合、またはworkerとreviewerのmodel pair検査が不合格の場合、gateを失敗させる。 | review_merge | gate | src/gate/review-tier.ts:126-139; src/gate/review-tier.ts:177-194 |
| `RC0-100` | 単一runtimeのjudgment review checkは、必須7項目のchecklistが不正・欠落・fail、または根拠なしn-aの場合に失敗する。明示reviewKindはintra_runtime_subagentだけを認める。 | review_merge | gate | src/gate/review-tier.ts:27-48; src/gate/review-tier.ts:83-101; src/gate/review-tier.ts:142-155; src/gate/review-tier-policy.ts:3-3 |
| `RC0-112` | Team runnerは、hybridでworkerとreviewerの両方が存在するのに異providerの組が一つもない場合、不合格にする。 | lane_delegation | gate | src/team/run.ts:348-362; src/team/run-policy.ts:14-15 |
| `RC00-010` | 候補検証評議は、workerとverifierのsession IDが同一なら候補をvetoし、報告を不合格とする。 | review_merge | gate | src/runtime/parallel-candidate-verifier-council.ts:33-35; src/runtime/parallel-candidate-verifier-council.ts:48-58 |
| `RC00-117` | author runtime attestationは、commit証拠が0件なら失敗する。 | review_merge | gate | src/runtime/author-runtime-evidence.ts:57-61 |
| `RC00-118` | author runtime attestationは、commitからmixedと判定されたのに申告がmixedでなければ失敗する。 | review_merge | gate | src/runtime/author-runtime-evidence.ts:36-49; src/runtime/author-runtime-evidence.ts:62-65 |
| `RC00-119` | author runtime attestationは、計測したruntimeと申告runtimeが一致しなければ失敗する。 | review_merge | gate | src/runtime/author-runtime-evidence.ts:62-66 |
| `RC00-240` | worker独立review検証器は、workerとreviewerのidentityが同じなら拒否する。 | review_merge | gate | src/runtime/worker-review-receipt.ts:145-148 |
| `RC00-241` | worker独立review検証器は、workerとreviewerのsessionが同じなら拒否する。 | review_merge | gate | src/runtime/worker-review-receipt.ts:149-150 |
| `RC00-242` | worker独立review検証器は、workerとreviewerのcontext digestが同じなら拒否する。 | review_merge | gate | src/runtime/worker-review-receipt.ts:151-152 |
| `RC01-088` | verifier-provider-mismatchは、iteration証跡のworkerProviderとverifierProviderがともに非空で同一なのに非空のblockedReasonがない場合、不合格にする。 | lane_delegation | lint | src/lint/verifier-provider-mismatch.ts:67-88 |
| `RC02-035` | doctorのreview-evidence checkは、review証跡検査が不合格、またはPLANを読めない場合に失敗する。reviewer session・model履歴の読込や検証失敗も検査器へ違反情報として渡す。 | review_merge | doctor | src/doctor/index.ts:829-872 |
| `RC02-036` | doctorのguardrail-invariants checkは、archived以外のPLANのreview entryに不変条件違反がある、または読込不能の場合に失敗する。同一model・同一provider違反はreview_kind=cross_agentだけに適用する。 | review_merge | doctor | src/doctor/index.ts:897-977 |
| `RC02-066` | doctorのverifier-provider-mismatch checkは、loop iterationの検証provider検査が不合格、または証拠読込失敗の場合に失敗する。 | review_merge | doctor | src/doctor/index.ts:1679-1703 |
| `RC02-067` | doctorのteam-review-receipts checkは、completedのtl・qa・uiux receiptがexit_code=0・verdict=pass・verdict_status=acceptedを満たさない、または同一team run・同一非null HEADの別providerによるcompleted workerが存在しない場合に失敗する。receipt表読込失敗も失敗とする。 | review_merge | doctor | src/doctor/index.ts:1705-1740 |
| `RC03-066` | historical migration review検証処理は、workerとreviewerのidentity、またはtask IDが同一の場合、受理を拒否する。 | review_merge | gate | src/policy/historical-vpair-migration-authority.ts:220-221 |
| `RC03-102` | チーム実行検証処理は、hybridでseとtlまたはqaが存在する場合、非localのworkerと異なるproviderのreviewerの組がなければ不適格とする。 | review_merge | gate | src/team/run.ts:348-360 |
| `RC03-131` | 判断ゲートは、reviewKindがself_review、self-review、naive_self_reviewのいずれかの場合、レビュー証拠として拒否する。 | review_merge | gate | src/gate/review-tier.ts:115-123; src/gate/review-tier-policy.ts:5-7 |
| `RC03-132` | hybridの判断ゲートは、reviewKindがcross_agentでない場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:126-139 |
| `RC03-133` | hybridの判断ゲートは、workerModelとreviewerModelに対するcheckCrossAgentModelPairが不合格の場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:130-138 |
| `RC03-134` | claude-onlyまたはcodex-onlyの判断ゲートは、reviewKindが明示され、その値がintra_runtime_subagent以外の場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:142-154 |
| `RC03-136` | standaloneの判断ゲートは、reviewKindが明示され、その値がhuman以外の場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:157-174 |
| `RC04-020` | ループ実行器は、hybridで反対providerのverifierが利用できなければworkerを起動せず停止する。 | lane_delegation | gate | src/orchestration/cross-verifier.ts:9-14; src/orchestration/loop-runner.ts:92-113 |
| `RC04-021` | verifier選択器は、hybrid以外ではworkerと同じproviderを選び、intra_runtime_fallbackを記録する。 | lane_delegation | gate | src/orchestration/cross-verifier.ts:17-20 |
| `RC04-106` | pair-agent plan生成器は、cross_agentでない場合、cross-provider判断証拠ではないと警告する。 | review_merge | gate | src/orchestration/pair-agent.ts:244-249 |
| `RD00-212` | Claude inbox選択器は、activeなinbox通知のうちClaude自身以外を出所とし、未配信かつ予約PR通知ならcanonical検証済みのものだけを選択する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:361-375; src/runtime/claude-memory-wake.ts:410-439 |
| `RD00-213` | Claude review dispatchは、実測author runtimeがcodex・mixed・external以外の場合、Claudeへのreview依頼を拒否する。 | review_merge | gate | src/runtime/claude-memory-wake.ts:469-473; src/runtime/claude-memory-wake.ts:505-507; src/runtime/claude-memory-wake.ts:661-663 |
| `RD00-219` | Claude review dispatchは、author runtimeを実測できない場合、依頼を拒否する。 | review_merge | gate | src/runtime/claude-memory-wake.ts:655-660 |
| `RD00-256` | review pair検証は、author runtimeがClaude・Codex・mixed・external以外、またはreviewer runtimeがClaude・Codex以外の場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:503-510 |
| `RD00-257` | review pair検証は、external authorのidentity記録が空の場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:511-514 |
| `RD00-258` | review pair検証は、external authorの場合もreviewer modelのproviderとreviewer runtimeが一致しなければ拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:515-517; src/runtime/claude-pr-convergence.ts:538-540 |
| `RD00-259` | review pair検証は、単一author runtimeとreviewer runtimeが同一の場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:519-521 |
| `RD00-260` | review pair検証は、mixed authorでauthor modelのproviderが認識可能な独立runtimeでない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:527-530 |
| `RD00-261` | review pair検証は、mixed authorでauthor modelのproviderがreviewer runtimeと同一の場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:531-531 |
| `RD00-262` | review pair検証は、author modelとreviewer modelがcross-agent model pair検査を通らない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:533-534 |
| `RD00-263` | review pair検証は、mixed以外でauthor modelのproviderとauthor runtimeが異なる場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:535-537 |
| `RD00-284` | v2 receipt decoderは、authorがCodexかつreviewerがClaudeという組合せでない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:763-765 |
| `RD01-264` | review comment抽出処理は、receipt validatorがschemaまたはruntime独立性を拒否したreceiptを候補から除外する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:305-329 |
| `RD01-291` | mixed authorshipのadmissionは、全有効receiptがmixed用で、所定runtime数と各reviewerの被覆が揃わなければ拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:654-675 |
| `RD02-005` | admission検証器は、独立検証者がClaudeでない場合、または判定がadmitでない場合に拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:187-201 |
| `RD02-063` | 中立receiptの生成・検証器は、作者runtimeが空または非文字列、あるいはreviewer runtimeと同一の場合に拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1569-1571; src/runtime/independent-review-fallback.ts:1630-1632; src/runtime/independent-review-fallback.ts:1743-1744 |
| `RD03-001` | review guardは、read-only委譲ロールがセッション前には変更されていなかったパスを変更した場合、違反として警告する。 | lane_delegation | gate | src/runtime/review-guard.ts:23-33; src/runtime/review-guard.ts:51-103 |
| `RD03-002` | staged review評価は、stagedパスとレビュー担当が変更したパスが重なった場合、suspectに分類してok=falseを返す。 | review_merge | gate | src/runtime/review-guard.ts:114-126 |
| `RD03-004` | レビュー接合評価は、terminalへ昇格するPLANにcross_agentの技術承認がない場合、拒否する。 | review_merge | gate | src/runtime/review-receipt-plan-binding.ts:66-67; src/runtime/review-receipt-plan-binding.ts:93-108; src/runtime/review-receipt-plan-binding.ts:166-182 |
| `RD03-005` | レビュー接合評価は、PLANの承認者sessionが照合するreceiptのsessionと一致しない場合、拒否する。 | review_merge | gate | src/runtime/review-receipt-plan-binding.ts:109-115; src/runtime/review-receipt-plan-binding.ts:196-199 |
| `RD03-006` | レビュー接合評価は、PLANとreceiptのモデルを同一と確認できない場合、拒否する。主体接合では同一provider内の時点別session履歴による照合も認めるが、引用receiptとの接合ではモデル名の一致を要求する。 | review_merge | gate | src/runtime/review-receipt-plan-binding.ts:116-146; src/runtime/review-receipt-plan-binding.ts:200-203; src/runtime/review-receipt-plan-binding.ts:223-232 |
| `RD03-090` | specialist team選択は、要求axisのverifier候補にworkerと異なるruntimeの担当がいない場合、失敗する。 | review_merge | gate | src/runtime/specialist-agent-registry.ts:298-305 |
| `RD04-017` | 親受入判定器は、独立レビューcapabilityが無い、または検証できない場合に拒否する。 | review_merge | gate | src/runtime/work-graph-receipt-acceptance.ts:376-378 |
| `RD04-018` | 親受入判定器は、委譲で指定されたreviewerと実際のreviewer identityが異なる場合に拒否する。 | review_merge | gate | src/runtime/work-graph-receipt-acceptance.ts:379-381 |
| `RD04-022` | 親受入判定器は、受入評価者のidentity・session・context digestのいずれかがworkerまたはreviewerと一致する場合に拒否する。 | review_merge | gate | src/runtime/work-graph-receipt-acceptance.ts:263-269; src/runtime/work-graph-receipt-acceptance.ts:396-398 |
| `RD04-052` | benchmark評価器は、judgeと候補のidentityが同じ、またはproviderとmodelの組が同じ場合に拒否する。 | review_merge | gate | src/runtime/worker-blind-benchmark.ts:357-363 |
| `RD04-092` | isolation brokerは、author claim数またはprivate context数が0でないblind packetを拒否する。 | review_merge | gate | src/runtime/worker-isolation-broker.ts:317-324 |
| `RD04-151` | lifecycle receipt作成器は、reviewが正規の独立レビューcapabilityでない場合に拒否する。 | review_merge | gate | src/runtime/worker-lifecycle-receipt.ts:166-167 |
| `RD09-077` | tombstone検証は、解消PLANに独立モデルによる技術承認reviewがない場合、解消証拠を拒否する。reviewは有効な時刻を持ち、全green command完了時刻≦tests_green_at≦reviewed_atとgreen command検証成功を満たさなければならない。 | review_merge | lint | src/lint/plan-specific-vpair-binding.ts:328-365; src/lint/plan-specific-vpair-binding.ts:367-370 |
| `RD10-011` | lintは履歴登録済みsessionのreviewer_modelのproviderが登録runtimeと異なる場合に失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:1042-1056 |
| `RD10-012` | lintは履歴登録済みsessionのreviewer_modelがreviewed_at時点の有効モデルと一致しない場合に失敗させる。日時不正や該当期間なしも不一致とする。 | review_merge | lint | src/lint/review-evidence.ts:364-382; src/lint/review-evidence.ts:1057-1066 |
| `RD10-013` | lintは履歴未登録の同一sessionについて複数のreviewer_modelを観測した場合に失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:980-994; src/lint/review-evidence.ts:1069-1074 |
| `RD10-014` | lintは2026-08-22以降作成のconfirmed／completed PLANのAI reviewでreviewer_session_idが欠落・空白の場合に失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:403-410; src/lint/review-evidence.ts:996-1005 |
| `RD10-016` | lintはsession強制対象のAI reviewでreviewer_modelが欠落・空白の場合に失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:403-410; src/lint/review-evidence.ts:998-1005 |
| `RD10-018` | lintはcross_agentを称するreviewのモデル対が同一モデル、欠落、同一providerまたは未知providerと判定された場合に失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:413-417; src/lint/review-evidence.ts:946-957 |
| `RE01-069` | 旧Phase 0Aではowner reviewで運用し、Phase 0Bのteam運用では一人のapproveを要求する。 | review_merge | config | docs/governance/helix-harness-requirements_v1.2.md:1149-1160 |
| `RE01-113` | reviewerは自分が作成した成果物の唯一の承認者になってはならず、fast checkerはmerge承認を担ってはならない。 | review_merge | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:1555-1614 |
| `RE01-116` | hybridの委譲者は作成と判断を異なるruntimeへ分離し、同じ作業を両runtimeで重複実行しない。 | lane_delegation | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:1555-1614; docs/governance/helix-harness-requirements_v1.2.md:1916-1918 |
| `RE01-117` | 単一runtimeのレビュー担当者は別contextのsubagentとchecklistによる代替レビューを記録し、利用不能な場合もその事実を明示する。 | review_merge | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:1555-1614; docs/governance/helix-harness-requirements_v1.2.md:2124-2186 |
| `RE01-118` | 検証者は同一providerまたは同一modelによるレビューを規定のcross reviewとして認めてはならない。 | review_merge | gate／lint | docs/governance/helix-harness-requirements_v1.2.md:1555-1614; docs/governance/helix-harness-requirements_v1.2.md:2110-2186 |
| `RE01-149` | レビュー担当者は人間へ提示する前に専門レビューを別contextで行い、review evidenceを追記型で残す。単なる自己レビューをcross reviewとして扱わない。 | review_merge | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:2110-2120 |
| `RE01-256` | AI-Aは作成・修正・push・Ready化を担い、AI-Bはread-only review・finding disposition・merge判断を担う。AI-Bは編集・push・Ready化を行わない。 | review_merge | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:516-516 |
| `RF01-015` | proposalチーム生成器は、closing_authorityがtrueのlaneをmember生成対象から除外する。 | lane_delegation | gate | src/team/launch-policy.ts:157-161 |
| `RF01-020` | proposalチーム生成器は、生成した並列laneの先頭engineがある場合、cross-provider review用のtl memberを一つ追加し、そのengineをserialize_afterに指定する。 | lane_delegation | config | src/team/launch-policy.ts:163-166; src/team/launch-policy.ts:182-194 |
| `RG09-001` | レビュー担当者は、Authoring途中の相談・テスト作成・修正指示をTerminal Reviewと区別する。 | review_merge | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:233-237 |
| `RG16-003` | 委譲者は、security reviewまたはadversarial reviewをprimary modelかsecurity-audit／code-reviewerへ割り当てる。 | lane_delegation | prose | docs/skills/agent-cost-design.md:32-37 |
| `RG18-010` | GPT workerまたはsparkの成果を受け入れる際、Claude側で受入検証を行う。 | lane_delegation | prose | docs/skills/judgment-core.md:101-101 |
| `RG18-011` | レビュー記録者は同一model familyでのself-reviewをcross_agentと称してはならない。 | evidence_claim | prose／gate | docs/skills/judgment-core.md:103-105 |

## 副として対応づいた規則（80件）

`RA-156`、`RB0-004`、`RB0-064`、`RB0-069`、`RB0-107`、`RB04-012`、`RB04-016`、`RB04-021`、`RB04-022`、`RB04-046`、`RB04-239`、`RB04-240`、`RB05-058`、`RB05-060`、`RB05-088`、`RB05-102`、`RB05-103`、`RB05-155`、`RB05-191`、`RB05-232`、`RB05-246`、`RB06-023`、`RB06-071`、`RB06-094`、`RB06-100`、`RB06-102`、`RB06-117`、`RB06-123`、`RB06-124`、`RB06-187`、`RB06-255`、`RB06-311`、`RB07-105`、`RB07-230`、`RB07-251`、`RB07-314`、`RB07-337`、`RB08-241`、`RB08-284`、`RB08-321`、`RB08-330`、`RB08-331`、`RB09-069`、`RB09-082`、`RC0-101`、`RC0-136`、`RC00-120`、`RC00-121`、`RC00-235`、`RC00-236`、`RC00-243`、`RC04-113`、`RC04-244`、`RD00-056`、`RD00-266`、`RD01-269`、`RD01-307`、`RD02-012`、`RD02-036`、`RD02-042`、`RD02-057`、`RD02-148`、`RD04-001`、`RD04-002`、`RD04-050`、`RD04-119`、`RD04-133`、`RD09-144`、`RD09-145`、`RD10-001`、`RD10-004`、`RD10-006`、`RD10-008`、`RD10-009`、`RD10-010`、`RD10-015`、`RE01-072`、`RF01-018`、`RF01-019`、`RF01-022`
