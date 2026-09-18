---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSI-01
group: OS改善
product: OS
atoms_primary: 101
atoms_secondary: 93
issue_projection: #1861
---

# RUL-OSI-01（OS改善／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

失敗、指摘、feedback、Issueの蓄積を、出どころを保ったまま改善候補へ還流する。feedbackの受付・分類・確認・解決を区別し、未確認の指摘を消さない。

## 主として対応づいた規則（101件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-195` | 管理側のgate・admission・監査・運用の見落としはIssue化し、Scrumで収束後にS4から正規V-modelへReverseする。 | process_gate | prose | AGENTS.md:159-160; CLAUDE.md:296-297 |
| `RB0-041` | 外部化telemetryのwarningを受けた者は、外部化するか意図的に固定するかを明示してtriageし、放置しない。 | process_gate | prose | docs/governance/coding-rules.md:133-134 |
| `RB0-101` | 管理側はgate漏れ・admission欠落・監査所見・運用再発をIssue化してS0-S4で収束し、採用時は正規VモデルへScrum Reverseする。 | process_gate | prose | docs/governance/management-scrum-product-forward.md:12-14 |
| `RB0-105` | 管理見落としIssueの起票者は観測・影響範囲・再発回数・提案gate/checklist・現在stage・Scrum Reverse先を欠落なく記録する。 | process_gate | prose | docs/governance/management-scrum-product-forward.md:26-29 |
| `RB04-008` | 作業者は失敗をログに残すだけで終えず、可能な限りgate・validator・test・skill・継続状態・postmortem・orchestration policyへ還元する。 | behavior_discipline | prose | docs/governance/helix-harness-concept_v3.1.md:131-142 |
| `RB04-009` | 共有失敗証拠の収集者はGitHub上の証拠を対象HEAD・実行世代と結びつけ、反復・種別・再発防止を出典付きで集計する。 | evidence_claim | prose | docs/governance/helix-harness-concept_v3.1.md:144-144 |
| `RB04-038` | 運用者はSentry等の監視アラートを共有auditへ記録し、個人failure_logはlocal advisoryに限定する。 | evidence_claim | prose | docs/governance/helix-harness-concept_v3.1.md:398-404 |
| `RB04-066` | 作業者は発見した不備・改善をbacklogへ蓄積してtriageし、決定ledgerとは相互参照で分離してlint・FR・policy・docへ機能化する。 | memory_context | prose | docs/governance/helix-harness-concept_v3.1.md:604-604 |
| `RB04-078` | 運用検証失敗では観点不足を次サイクルの要求/要件feedbackとし、重大NFR逸脱をIncidentまたは要求見直しへ接続する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:657-657 |
| `RB04-117` | P0/P1収束後は48時間以内にpostmortemを行い、再発防止策を観点リスト・AGENTS.md・CIへ反映する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:1092-1094 |
| `RB04-194` | 品質担当者は本番障害・PR指摘・一般化可能な過去bug・新技術領域を観点リストへ追加し、本番障害とPR指摘bugには再現testを追加する。 | memory_context | prose | docs/governance/ai-dev-team-operations_v1.1.md:529-537; docs/governance/ai-dev-team-operations_v1.1.md:718-722 |
| `RB04-220` | P0/P1は収束後48時間以内のpostmortemを必須とし、P2は任意の月次振返り、P3は記録のみとする。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:879-887 |
| `RB04-221` | postmortem作成者は概要・時系列・直接/根本原因・機能した/しなかった仕組み・再発防止・学びを記録する。 | evidence_claim | prose | docs/governance/ai-dev-team-operations_v1.1.md:889-923 |
| `RB04-222` | postmortemでは個人の責任追及でなく構造的原因を議論し、再発防止を人の注意でなく仕組みにし、「次は気をつける」を対策と認めない。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:925-927 |
| `RB04-236` | incident対応者は収束後、再発防止策をAGENTS.mdと観点リストへ反映する。 | memory_context | prose | docs/governance/ai-dev-team-operations_v1.1.md:1145-1145 |
| `RB04-282` | 運用開始者はClaude CodeとCodexを導入し、agent規則に沿って最初のproductを開発し、PR/CIで得た運用課題をAGENTS.mdへ反映する。 | tooling_runtime | prose | docs/governance/ai-dev-team-concept_v1.1.md:669-677 |
| `RB04-289` | 改善source registryはCI・DB・requirements・definition・dependency・review・operations・provider・distribution・resource_securityの10種を必須対象とする。 | process_gate | config | config/universal-improvement-source-registry.v1.json:60-71 |
| `RB05-053` | 運用者はdanger判定の誤検出とエスカレーション量を測定し、過剰なGateではmachine・AI側の判定を改善する。 | behavior_discipline | prose | docs/governance/audit-framework.md:532-533 |
| `RB05-081` | freeze前に各feedbackをimplemented・successor PLAN・deferのいずれか一つへdispositionし、採用済み要件・別wave・未採用atomを分離してtraceを残す。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:395-399 |
| `RB05-103` | Claude CodeはhookでCodexのPRを検出して監査を起動し、findingをIssueとmemoryへ記録してCodexの設計判断・再実装へ接続する。 | lane_delegation | prose／hook | docs/governance/infinity-loop-source-capability-ledger.md:41-42 |
| `RB05-108` | 改善担当はIssue蓄積と実装ログを、Forward設計判断・skill生成・設計document coverageの継続改善へ利用する。 | memory_context | prose | docs/governance/infinity-loop-source-capability-ledger.md:50-50 |
| `RB05-118` | 設計管理者はtemplateを要求系統とservice系統へ結び、表現不能な要求をTemplate Gap Issueとして改善loopへ戻す。 | process_gate | prose／gate | docs/governance/infinity-loop-source-capability-ledger.md:71-72 |
| `RB05-148` | finding dispositionでduplicateを確定する際、生存targetがなければcloseを拒否しchallenge receiptを残す。 | process_gate | prose | docs/governance/infinity-loop-system-assertion-cases.md:51-51 |
| `RB05-229` | templateで表現できないrequired obligationはGap Issue・Reverse・queueへ同一causalityで送り、未報告のままfreezeしたりN/A化したりしない。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:259-261; docs/governance/infinity-loop-system-assertion-cases.md:357-357 |
| `RB06-028` | AIはAuthoring失敗時にも原案とfindingを保持し、内容を黙って破棄しない。 | memory_context | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:255-255; docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:319-319 |
| `RB07-004` | 担当者は環境障害をRecovery PLANへ送り、環境修正と将来の検出用doctor check追加を行う。 | process_gate | prose | docs/skills/debugging-and-error-recovery.md:69-71 |
| `RB07-058` | 採用対象のfeedback lifecycleはtelemetryを24時間後に自動ackして表示から退避させ、gate・actionableにはTTLを適用しない。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:79-81 |
| `RB07-060` | 採用対象のfeedback表示はbucket・severity・signal_typeでgroup化して上位群を選び、escalation表示にも10件の上限を設ける。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:83-84 |
| `RB07-194` | 担当者は未検出の秘密patternを発見したら改善を起票し、そのpattern用のtest fixtureを追加する。 | safety_security | prose | docs/skills/security.md:81-82 |
| `RB08-144` | 検証担当者はfailすべきcheckがpassした場合、改善backlogへ記録してPLANを起票する。 | evidence_claim | prose | docs/skills/ci-gate-design.md:68-69 |
| `RB08-185` | 事後担当者は実施手順をrunbookへ反映し、code・設計修正が必要ならRecovery PLANを起票して分類・回帰test追加を行い、解決記録と継続next actionを更新する。 | process_gate | prose | docs/skills/incident-runbook.md:63-69 |
| `RB08-269` | Recovery担当者は指示無視・逸脱を単なる認識ずれへ丸めず、収集した全事象を正直に分類する。 | behavior_discipline | prose | docs/governance/recovery-workflow.md:8-17 |
| `RB08-273` | Recovery担当者は各事象の再発防止策を記録し、改善backlogでverifiedまで追跡し、指示無視が再発する領域では指示受領から実行までのtraceを強化する。 | process_gate | prose | docs/governance/recovery-workflow.md:63-67 |
| `RB08-328` | 投資候補の担当者は既存owner単位でadopt・defer・reject・already_covered・needs_requirement_deltaを判定する。 | process_gate | prose | docs/governance/development-investment-stage-directives-source-cleanup-2026-09-11.md:35-35 |
| `RC00-123` | review feedback取込検査は、source URLまたはsource refが空白なら不合格とする。 | evidence_claim | gate | src/runtime/review-feedback-session-intake.ts:86-91; src/runtime/review-feedback-session-intake.ts:122-124 |
| `RC00-124` | review feedback取込検査は、対象sessionが未指定または未知なら警告するが、孤立だけを理由に取込を不合格にしない。 | memory_context | gate | src/runtime/review-feedback-session-intake.ts:83-98 |
| `RC01-074` | right-arm-gate-planningは、IMP-052がobservedのままでPLAN参照がない場合、不合格にする。 | process_gate | lint | src/lint/right-arm-gate-planning.ts:67-69 |
| `RC02-004` | doctorのuniversal-improvement-source-registry checkは、登録読込処理のokがfalseの場合に失敗し、その診断を返す。 | process_gate | doctor | src/doctor/universal-improvement-source-registry-check.ts:7-12 |
| `RC02-123` | doctorのfeedback-log checkは、feedback-log検査が不合格、root不在、または存在する文書を読めない場合に失敗する。任意文書docs/feedback-log.mdの不在は成功とする。 | process_gate | doctor | src/doctor/index.ts:5353-5382 |
| `RC02-132` | doctorのrefactor-candidate-triage checkは、high-confidence候補があればPLAN化またはaccepted debt記録を案内し、走査失敗は警告にとどめる。config不正時はskipし、いずれもdoctorを失敗させない。 | behavior_discipline | doctor | src/doctor/index.ts:5554-5596 |
| `RC02-156` | doctorのimprovement-backlog checkは、不正ID・重複ID・不正status/candidate・不完全行・解析不能行・backprop分類欠落、またはbacklog読込不能で失敗する。 | process_gate | doctor | src/doctor/index.ts:6515-6554 |
| `RC03-071` | feedback source identity処理は、source tableが定義済み3種類に含まれないかsource IDが空白だけの場合、失敗する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:140-140; src/policy/feedback-lifecycle.ts:152-170 |
| `RC03-072` | feedback source identity処理は、feedback_eventsから有効な元tableと非空の元IDを解決できない場合、feedback_origin_missingの診断を出す。 | memory_context | gate | src/policy/feedback-lifecycle.ts:156-167; src/policy/feedback-lifecycle.ts:689-693 |
| `RC03-076` | feedback lifecycleデコード処理は、observedがnullからopenへの遷移でない場合、イベントを拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:231-233; src/policy/feedback-lifecycle.ts:860-861 |
| `RC03-077` | feedback lifecycleデコード処理は、refreshがopenまたはackの状態維持でない場合、イベントを拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:231-233; src/policy/feedback-lifecycle.ts:862-866 |
| `RC03-078` | feedback lifecycleデコード処理は、surfaceがopenまたはackの状態維持でない、またはsessionIdがnullの場合、イベントを拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:231-233; src/policy/feedback-lifecycle.ts:867-872 |
| `RC03-079` | feedback lifecycleデコード処理は、ackがopenまたはackからackへの遷移でない場合、イベントを拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:231-233; src/policy/feedback-lifecycle.ts:873-874 |
| `RC03-080` | feedback lifecycleデコード処理は、closeがopenまたはackからclosedへの遷移でない場合、イベントを拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:231-233; src/policy/feedback-lifecycle.ts:875-876 |
| `RC03-081` | feedback lifecycleデコード処理は、supersedeがopenまたはackからsupersededへの遷移でない場合、イベントを拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:231-233; src/policy/feedback-lifecycle.ts:877-881 |
| `RC03-089` | feedback ack処理は、現在状態がopenでもackでもない場合、terminal_generationとして拒否する。ack済みの世代は追記なしで受理する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:447-457 |
| `RC03-094` | feedback reconcile処理は、同一identityの既存候補より優先bucketへ置き換える条件が成立せず、payload digestが異なる場合、alias_payload_driftを診断する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:679-686 |
| `RC03-154` | guardrail decision記録処理は、正規化したdecisionがblockの場合、対応するopenのwarning findingを記録する。 | process_gate | gate | src/guardrail/ledger.ts:50-50; src/guardrail/ledger.ts:67-80 |
| `RC04-291` | 汎用改善source registryは、各登録sourceの検出失敗の扱いをfail_closeに設定する。 | process_gate | config | config/universal-improvement-source-registry.v1.json:85-87; config/universal-improvement-source-registry.v1.json:146-148; config/universal-improvement-source-registry.v1.json:207-209; config/universal-improvement-source-registry.v1.json:268-270; config/universal-improvement-source-registry.v1.json:329-331; config/universal-improvement-source-registry.v1.json:390-392; config/universal-improvement-source-registry.v1.json:451-453; config/universal-improvement-source-registry.v1.json:512-514; config/universal-improvement-source-registry.v1.json:573-575; config/universal-improvement-source-registry.v1.json:634-636 |
| `RD01-133` | feedback分類処理は、classifierの例外または不正なcategory・attentionをfeedback・low・unclassifiedへ縮退させる。 | memory_context | gate | src/runtime/forced-stop.ts:66-70; src/runtime/forced-stop.ts:132-150 |
| `RD01-134` | feedback記録処理は、categoryがfeedback以外なら記録を行わない。 | memory_context | gate | src/runtime/forced-stop.ts:158-164 |
| `RD01-135` | feedback記録処理は、PLAN IDがnullまたはundefinedなら書き込まない。 | memory_context | gate | src/runtime/forced-stop.ts:165-165 |
| `RD02-139` | 推薦判定器は、候補・score・理由・参照・推奨roleのいずれかが欠ける場合に推薦を拒否する。 | evidence_claim | gate | src/runtime/legacy-adoption.ts:331-339 |
| `RD02-159` | 学習feedback判定器は、review_stateがunreviewedの場合に採用をdeferする。 | process_gate | gate | src/runtime/legacy-adoption.ts:530-530 |
| `RD02-160` | 学習feedback判定器は、event源・recipe源・結果・backlog先・証拠link・review状態のいずれかが欠ける場合にdeferする。 | memory_context | gate | src/runtime/legacy-adoption.ts:522-532 |
| `RD03-120` | finding資格判定は、recurrence triggerにlineageがない場合、またはrecurrence以外にlineageが付く場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:193-198 |
| `RD03-123` | finding disposition判定は、superseded_byがある証拠をsupersededとし、qualifiedにはしない。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:247-251 |
| `RD03-124` | finding disposition判定は、有効期限が評価時刻以下の証拠をexpiredとし、qualifiedにはしない。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:252-253 |
| `RD03-125` | finding disposition判定は、trigger verdictがnot_triggeredの場合、rejectedにする。 | process_gate | gate | src/runtime/universal-improvement-finding-qualification.ts:254-255 |
| `RD03-126` | finding disposition判定は、scheduled_safety_netだけを実質的triggerと認めず、rejectedにする。 | process_gate | gate | src/runtime/universal-improvement-finding-qualification.ts:256-257 |
| `RD03-127` | finding disposition判定は、証拠または参照eventに反証digestがある場合、counterevidence_requiredとし、qualifiedにはしない。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:258-260; src/runtime/universal-improvement-finding-qualification.ts:519-530 |
| `RD03-144` | finding資格判定は、causation IDの参照先が同じ正規化event集合に存在しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:422-426 |
| `RD03-145` | finding資格判定は、eventとその原因eventのcorrelation IDが一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:427-428 |
| `RD03-150` | finding資格判定は、trigger evidenceが参照するevent IDを正規化結果から解決できない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:466-471 |
| `RD03-152` | finding資格判定は、参照eventとtrigger evidenceのdetector IDまたはversionが一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:480-486 |
| `RD03-154` | finding資格判定は、同じroot cause・scope authority・baseline revision・invariant・trigger kindの証拠群でdetector ID/version、verdict、置換先または期限が食い違う場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:211-220; src/runtime/universal-improvement-finding-qualification.ts:496-515 |
| `RD03-155` | finding資格判定は、同じfindingグループ内でrecurrence lineage集合が一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:527-529 |
| `RD03-166` | 観測normalizerは、source admissionが不合格またはentry・registry version・source digest・bytes digestを欠く場合、その観測eventを生成しない。admission findingsがある場合は全体も失敗させる。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:183-194; src/runtime/universal-improvement-observation-normalizer.ts:240-242 |
| `RD03-168` | 観測normalizerは、causation IDの参照先eventが同じ生成集合にない場合、全体を失敗させる。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:231-235; src/runtime/universal-improvement-observation-normalizer.ts:240-242 |
| `RD03-169` | 観測normalizerは、eventとその原因eventのcorrelation IDが異なる場合、全体を失敗させる。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:236-242 |
| `RD03-174` | source registry検証は、required_source_kindsがcanonical source-kind集合と重複なく完全一致しない場合、不合格にする。 | process_gate | gate | src/runtime/universal-improvement-source-registry.ts:578-592 |
| `RD03-177` | source registry検証は、同じsource kindに複数entryがある場合、不合格にする。 | process_gate | gate | src/runtime/universal-improvement-source-registry.ts:615-624 |
| `RD03-178` | source registry検証は、evidence contractのrequired_fieldsに規定の観測必須fieldが欠ける場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:99-107; src/runtime/universal-improvement-source-registry.ts:626-639 |
| `RD03-179` | source registry検証は、evidence contractのidentity_fieldsに規定の識別fieldが欠ける場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:108-113; src/runtime/universal-improvement-source-registry.ts:640-650 |
| `RD03-182` | source registry検証は、canonical source kindに対応するactive entryがない場合、不合格にする。 | process_gate | gate | src/runtime/universal-improvement-source-registry.ts:671-681 |
| `RD03-202` | source admissionは、observationのsource IDが現行registryに登録されていない場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:1108-1123 |
| `RD03-205` | source admissionは、observationのdetector IDが登録sourceのdetector IDと異なる場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:1146-1154 |
| `RD03-211` | source admissionは、観測からの経過秒数が登録freshnessのmax_age_secondsを超える場合、staleとして拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:1212-1223 |
| `RD06-073` | design-reality-binding lintは、baseline登録文書が走査対象にあり、空bindingとして観測されなかった場合、baselineからの削除を促すadvisoryを出す。 | evidence_claim | lint | src/lint/design-reality-binding.ts:1060-1070 |
| `RD06-164` | feedback-log lintは、feedback IDが重複する場合、失敗させる。 | memory_context | lint | src/lint/feedback-log.ts:139-140; src/lint/feedback-log.ts:165-173 |
| `RD06-165` | feedback-log lintは、statusがopen・domesticated・supersededのいずれでもない場合、失敗させる。 | memory_context | lint | src/lint/feedback-log.ts:30-30; src/lint/feedback-log.ts:142-144; src/lint/feedback-log.ts:165-173 |
| `RD06-166` | feedback-log lintは、エントリが7列未満、またはdate・source・feedback・lessonのいずれかが空の場合、失敗させる。 | memory_context | lint | src/lint/feedback-log.ts:145-147; src/lint/feedback-log.ts:165-173 |
| `RD06-167` | feedback-log lintは、status=open、またはsuperseded以外で反映先が空・ハイフン・ダッシュ・noneの場合、未反映として失敗させる。 | memory_context | lint | src/lint/feedback-log.ts:109-112; src/lint/feedback-log.ts:149-152; src/lint/feedback-log.ts:165-173 |
| `RD06-168` | feedback-log lintは、superseded以外の反映先にあるIMP-NNN参照がimprovement backlogに存在しない場合、失敗させる。 | memory_context | lint | src/lint/feedback-log.ts:154-158; src/lint/feedback-log.ts:165-173 |
| `RD06-169` | feedback-log lintは、superseded以外の反映先にある検出対象のbacktick付きファイルパスが存在しない場合、失敗させる。 | memory_context | lint | src/lint/feedback-log.ts:34-41; src/lint/feedback-log.ts:154-162; src/lint/feedback-log.ts:165-173 |
| `RD07-183` | improvement-backlog解析は、IMPエントリらしい行が通常の行抽出パターンで解析できない場合、黙って捨てずunparseableRowsへ記録する。 | process_gate | lint | src/lint/improvement-backlog.ts:116-124 |
| `RD07-186` | improvement-backlog解析は、statusがobserved・triaged・implemented・verifiedのいずれでもなければinvalidStatusへ記録する。 | process_gate | lint | src/lint/improvement-backlog.ts:21-21; src/lint/improvement-backlog.ts:145-149 |
| `RD07-187` | improvement-backlog解析は、スラッシュ区切りの自動化候補のいずれかがlint・FR・policy・doc・none以外ならinvalidCandidateへ記録する。 | process_gate | lint | src/lint/improvement-backlog.ts:22-22; src/lint/improvement-backlog.ts:151-158 |
| `RD07-188` | improvement-backlog解析は、行が7列未満、または日付・context・issue・linkのいずれかが空ならincompleteRowsへ記録する。 | process_gate | lint | src/lint/improvement-backlog.ts:160-162 |
| `RD11-020` | triage lintは、残差IMP-148のstatusが欠落しているかverifiedまたはclosedの場合に違反にする。 | process_gate | lint | src/lint/triage-decision-integrity.ts:164-166 |
| `RD11-028` | triage lintは、stateがresolvedの場合、target_statusがimplementedでなければ違反にする。 | process_gate | lint | src/lint/triage-decision-integrity.ts:202-203 |
| `RE01-041` | backlog管理者は観測から検証までの状態と検証ledgerを対応づけ、過去のイベント履歴と将来のbacklogを分離する。 | memory_context | prose／lint | docs/governance/helix-harness-requirements_v1.2.md:625-630 |
| `RE01-208` | feedback管理者はfeedback eventのlifecycleを維持し、未ackの消失、proseだけのresolve、HEAD不一致の解決証拠を認めない。 | memory_context | gate | docs/governance/helix-harness-requirements_v1.3.md:290-290 |
| `RE01-281` | routing担当者はfeedbackを理由にdelivery styleを変更せず、production incidentやupgradeを所定の承認・preflight経路へ送り、versionの保留と有効化を区別する。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:617-633 |
| `RF01-012` | memory昇格判定器は、session eventの構造化されたevent_typeとoutcomeだけを判定に用い、body・diff・tool input・provider transcriptを参照しない。 | memory_context | gate | src/runtime/memory-promotion.ts:27-51 |
| `RG10-019` | feedback lifecycleの実装担当者はsource_generationを追跡するappend-only台帳により、projectionの再生成でclose済みfeedbackが復活することを防ぐ。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:81-81 |
| `RG10-024` | feedback表示担当者はconsumed状態のfeedbackを非表示にする。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:117-117 |

## 副として対応づいた規則（93件）

`RB0-022`、`RB0-150`、`RB0-166`、`RB04-010`、`RB04-079`、`RB04-081`、`RB04-101`、`RB04-102`、`RB04-216`、`RB04-225`、`RB04-260`、`RB04-290`、`RB04-294`、`RB04-295`、`RB05-085`、`RB05-146`、`RB05-171`、`RB05-172`、`RB05-238`、`RB05-251`、`RB05-359`、`RB06-104`、`RB06-302`、`RB07-010`、`RB07-020`、`RB07-077`、`RB07-080`、`RB07-126`、`RB07-165`、`RB07-332`、`RB08-184`、`RB08-248`、`RB08-270`、`RC00-042`、`RC00-125`、`RC01-075`、`RC01-076`、`RC03-073`、`RC03-074`、`RC03-075`、`RC03-082`、`RC03-083`、`RC03-084`、`RC03-085`、`RC03-086`、`RC03-087`、`RC03-088`、`RC03-090`、`RC03-091`、`RC03-092`、`RC03-093`、`RC04-246`、`RD01-137`、`RD01-138`、`RD02-158`、`RD03-111`、`RD03-112`、`RD03-113`、`RD03-114`、`RD03-115`、`RD03-116`、`RD03-117`、`RD03-118`、`RD03-119`、`RD03-128`、`RD03-131`、`RD03-133`、`RD03-137`、`RD03-139`、`RD03-141`、`RD03-147`、`RD03-148`、`RD03-151`、`RD03-153`、`RD03-170`、`RD03-176`、`RD03-181`、`RD03-184`、`RD03-206`、`RD05-231`、`RD06-070`、`RD06-162`、`RD06-163`、`RD06-173`、`RD06-174`、`RD07-184`、`RD07-185`、`RD07-189`、`RE01-078`、`RE01-088`、`RE01-141`、`RG10-009`、`RG14-003`
