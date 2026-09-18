---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSM-03
group: OS管理
product: OS
atoms_primary: 68
atoms_secondary: 47
issue_projection: none
---

# RUL-OSM-03（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

memoryと引き継ぎを正本にしない。使う前に正本・履歴・診断と照合し、期限と保持を管理し、providerの記憶を混入させない。

## 主として対応づいた規則（68件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-014` | エージェントはセッション開始・引継ぎ時にharness.dbのcontinuationとmemory journalを確認し、staleでないnext actionに従う。 | memory_context | prose | AGENTS.md:136-136; AGENTS.md:165-165; AGENTS.md:312-313; CLAUDE.md:249-250; CLAUDE.md:298-298 |
| `RA-020` | Claude設定は自動memoryを無効にする。 | memory_context | config | .claude/settings.json:2-2 |
| `RB0-128` | agentはtaskがsessionまたはruntime境界を越える場合、handoverまたはauditへ引継ぎ・証拠を記録する。 | memory_context | prose | docs/skills/SKILL_MAP.md:85-86 |
| `RB0-159` | reviewerはsessionがruntime境界を越える場合、continuation projectionのactive PLANとnext actionをauthored sourceと照合する。 | memory_context | prose | docs/skills/adversarial-review.md:90-91; docs/skills/adversarial-review.md:115-115 |
| `RB04-101` | Recovery PLANはaimを割り当て、事故記録・議論順序・認識訂正・中間結論・context再構築・再開点・再発防止の7節を備える。 | memory_context | prose | docs/governance/helix-harness-concept_v3.1.md:908-910 |
| `RB04-136` | active-planのstale検出はupdated_atを使い、timestampのない旧形式を判定不能だけの理由でstaleにしない。 | memory_context | prose | docs/governance/helix-harness-concept_v3.1.md:1199-1199 |
| `RB04-145` | 補助memoryはdecision・constraint・next actionだけをprovenance・scope・TTL付きで保持し、不整合時はauthored sourceとDBを優先する。 | memory_context | prose | docs/governance/helix-harness-concept_v3.1.md:1238-1238 |
| `RB04-290` | 登録された全改善sourceの保持policyは最大604800秒とする。 | memory_context | config | config/universal-improvement-source-registry.v1.json:85-85; config/universal-improvement-source-registry.v1.json:146-146; config/universal-improvement-source-registry.v1.json:207-207; config/universal-improvement-source-registry.v1.json:268-268; config/universal-improvement-source-registry.v1.json:329-329; config/universal-improvement-source-registry.v1.json:390-390; config/universal-improvement-source-registry.v1.json:451-451; config/universal-improvement-source-registry.v1.json:512-512; config/universal-improvement-source-registry.v1.json:573-573; config/universal-improvement-source-registry.v1.json:634-634 |
| `RB04-295` | provider以外の登録改善sourceはfreshness上限を86400秒、providerは604800秒とする。 | evidence_claim | config | config/universal-improvement-source-registry.v1.json:120-123; config/universal-improvement-source-registry.v1.json:181-184; config/universal-improvement-source-registry.v1.json:242-245; config/universal-improvement-source-registry.v1.json:303-306; config/universal-improvement-source-registry.v1.json:364-367; config/universal-improvement-source-registry.v1.json:425-428; config/universal-improvement-source-registry.v1.json:486-489; config/universal-improvement-source-registry.v1.json:547-550; config/universal-improvement-source-registry.v1.json:608-611; config/universal-improvement-source-registry.v1.json:669-672 |
| `RB05-190` | memory compactorは検証済み完了から永続知識だけを昇格し、昇格しない場合もreceiptを残し、進捗はcontinuationへ保持する。 | memory_context | prose | docs/governance/infinity-loop-system-assertion-cases.md:128-128; docs/governance/infinity-loop-system-assertion-cases.md:337-337 |
| `RB05-191` | memory昇格はraw log・進捗行・secret-like値の保存とworker自身による昇格承認を拒否し、admissionとcompletionのevent種別を分離する。 | memory_context | prose | docs/governance/infinity-loop-system-assertion-cases.md:129-132; docs/governance/infinity-loop-system-assertion-cases.md:368-368 |
| `RB06-096` | memory compactionは永続知識だけをmemoryへ昇格し、進捗をcontinuationへ残してraw logや進捗をmemoryへ保存しない。 | memory_context | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:33-33; docs/governance/infinity-loop-assertion-coverage-ledger.md:78-78 |
| `RB06-240` | handover置換担当者はtakeover noteをmemoryへ移管し、statusへの単純文字列置換を行わない。 | memory_context | prose | docs/governance/session-handover-atomic-cutover-packet.md:96-97 |
| `RB07-055` | handover廃止担当者は機械状態をDB直読へ、人の申し送りを短寿命memoryへ移し、provider委譲証跡をaudit責務へ分離する。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:43-47; docs/governance/handover-retirement-memory-audit-2026-07-11.md:113-120 |
| `RB07-059` | 採用対象のStop hookはsession内にcommitまたはplan switchがありmemory writeがない場合、一度だけ非blockingの記録促進通知を出す。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:82-82 |
| `RB07-171` | 管理者はmilestone宣言前にstallなしとdoctor exit 0を確認し、DB継続状態をPLAN・Git履歴・event frontierと照合して完了項目を持ち越さない。 | memory_context | prose | docs/skills/project-management.md:74-83 |
| `RB07-172` | 管理者はmilestone固有判断をPLAN証跡またはADRへ残し、memoryをPLAN状態や判断正本の代わりにしない。 | memory_context | prose | docs/skills/project-management.md:81-81; docs/skills/project-management.md:111-111 |
| `RB07-295` | retirement担当者はprovider packetを期限推測で削除せず、運用移管文書をsupersedeまたは承認済みretention変更まで保持する。 | memory_context | prose | docs/governance/session-handover-retirement-disposition.md:19-24 |
| `RB07-296` | 担当者はretention metadataをpreserve manifestへ転記し、indefiniteの期限をnullにし、policy変更を原本digestとは別の差分として記録して承認前にphase exitしない。 | escalation_authority | prose | docs/governance/session-handover-retirement-disposition.md:26-28 |
| `RB07-301` | 担当者はprovider証跡をprogress・next action・recallへjoinせず、運用移管とsession継続で型を共有せず、旧設計をwriter復活根拠にしない。 | memory_context | prose／doctor | docs/governance/session-handover-retirement-disposition.md:73-78; docs/governance/session-handover-retirement-disposition.md:92-94 |
| `RB08-037` | 引継ぎ担当者は引渡し前に対象PLAN lintとdoctorの成功、およびstatusとDBのactive PLAN・next action一致を確認する。 | process_gate | prose／lint／doctor | docs/skills/requirements-handover.md:50-52; docs/skills/requirements-handover.md:67-77 |
| `RB08-038` | 後継agentは前任者のchat履歴に依存せず、authored sources・DB projection・bounded memoryからcontextを再構築できなければならない。 | memory_context | prose | docs/skills/requirements-handover.md:54-56; docs/skills/requirements-handover.md:89-90 |
| `RB08-041` | 継続情報の不整合を検出した作業者はstatus・git log・authored sourcesで確認してreplayまたはrebuildへ送り、memoryだけを直してgreen扱いにしない。 | memory_context | prose／doctor | docs/skills/requirements-handover.md:81-83; docs/skills/requirements-handover.md:87-88 |
| `RB08-042` | 作業者はprovider evidenceを監査専用とし、continuationやrecallへjoinしない。 | memory_context | prose | docs/skills/requirements-handover.md:93-94 |
| `RB08-078` | 再開するagentはgit log・authored PLAN・status・doctorで継続状態を照合し、競合時は停止してreplay・rebuild・recoveryへ送る。 | memory_context | prose | docs/skills/context-memory.md:44-49; docs/skills/context-memory.md:64-69; docs/skills/context-memory.md:86-86 |
| `RB08-081` | 継続担当者はfrontier不一致をstaleとし、projection欠落・破損時は再投影してdoctorがgreenになるまでmemoryだけで進行しない。 | memory_context | prose／doctor | docs/skills/context-memory.md:78-82 |
| `RB08-082` | agentはsession判断をmemoryだけに保存せず、committed docs・PLAN・ADRへ残し、監査専用provider evidenceをrecallへjoinしない。 | memory_context | prose | docs/skills/context-memory.md:88-89 |
| `RB08-138` | session境界の担当者はdurable eventから継続projectionを更新し、memoryを使う前にauthored sources・git log・doctorと照合する。 | memory_context | prose | docs/skills/harness-observability.md:63-68 |
| `RB08-252` | memory退役担当者は正本targetの存在・矛盾解消・memoryだけに残る未処置要求ゼロを確認してから本文をactive surfaceから退役し、body-free lifecycle receiptを保持する。 | memory_context | prose | docs/governance/harness-memory-reconciliation-audit-2026-07-19.md:19-19; docs/governance/harness-memory-reconciliation-audit-2026-07-19.md:67-69 |
| `RB08-253` | memory管理者はstale・反証済みentryを後続SessionStartでactive表示せず、consume後も正本・PLAN・eventから判断理由を再構築可能にする。 | memory_context | prose | docs/governance/harness-memory-reconciliation-audit-2026-07-19.md:68-69 |
| `RC0-107` | memory-handover-isolationは、remote未設定、またはremoteへ未到達かつpatch-id等価でもないmemory変更commitが既定24時間を超えて残る場合に失敗する。閾値内の未push分は情報表示に留める。 | memory_context | lint | src/lint/memory-handover-isolation.ts:68-148; src/lint/memory-handover-isolation.ts:151-175 |
| `RC00-001` | memory昇格判定は、成功したcommitまたはplan_switchがあり、成功したmemory_writeも既存のnudgeもない場合に警告する。 | memory_context | hook | src/runtime/memory-promotion.ts:15-51 |
| `RC00-002` | memory衛生検査は、変更されたmemoryファイルの更新時刻から閾値を超えた場合に警告する。 | memory_context | gate | src/runtime/memory-commit-hygiene.ts:1-49 |
| `RC00-134` | provider引継ぎ生成器は、active PLANが空白なら失敗する。 | memory_context | gate | src/runtime/provider-handover.ts:65-67 |
| `RC00-135` | provider引継ぎ生成器は、summaryが空白なら失敗する。 | memory_context | gate | src/runtime/provider-handover.ts:68-70 |
| `RC00-136` | session board生成器は、読取可能なcontinuation projectionがなければエラーとする。 | memory_context | gate | src/runtime/agent-session-command-center.ts:125-144 |
| `RC01-118` | project-hookは、settingsのautoMemoryEnabledが明示的なfalseでない場合、不合格にする。 | memory_context | lint | src/lint/project-hook.ts:131-134 |
| `RC01-124` | project-hookは、agent frontmatterでmemoryがproject・user・localのいずれかに設定されている場合、不合格にする。 | memory_context | lint | src/lint/project-hook.ts:187-192 |
| `RC02-117` | doctorのmemory-commit-hygiene checkは、検査器が未commit memoryの滞留をwarningと判定した場合、経過時間とlane終端commitへ含める案内を表示するが失敗させない。 | memory_context | doctor | src/doctor/index.ts:5136-5146 |
| `RC04-017` | 復旧分類器は、先行するエスカレーション条件が無くhandoverがstaleならretryに分類する。 | memory_context | gate | src/orchestration/loop-recovery.ts:18-37 |
| `RD00-022` | adapterは、memory recall行がある場合、task・判断ブリーフ・skill情報の後ろへ追加する。 | memory_context | config | src/runtime/adapter.ts:820-824 |
| `RD01-032` | continuation writerは、memory breadcrumbの書込みだけが失敗した場合、findingを返しつつ公開成功を維持する。 | memory_context | gate | src/runtime/continuation.ts:636-652 |
| `RD01-045` | 旧note移行処理は、source digestが不正なnoteを診断付きで移行候補から除外する。 | evidence_claim | gate | src/runtime/continuation.ts:976-980 |
| `RD01-047` | 旧note移行処理は、有効期限が欠落または不正なnoteを除外する。 | memory_context | gate | src/runtime/continuation.ts:985-988 |
| `RD01-048` | 旧note移行処理は、残りTTLが0以下または7日を超えるnoteを除外する。 | memory_context | gate | src/runtime/continuation.ts:989-993 |
| `RD01-049` | continuation統合処理は、memoryイベントの破損または候補本文の解釈失敗をfindingとして返す。 | memory_context | gate | src/runtime/continuation.ts:1197-1210; src/runtime/continuation.ts:1223-1227 |
| `RD01-050` | continuation優先順位処理は、DB情報がなくmemoryだけがある場合、memoryを代替採用せずnullとfindingを返す。 | memory_context | gate | src/runtime/continuation.ts:1230-1238 |
| `RD01-051` | continuation優先順位処理は、memoryが欠落している場合、DB情報を採用してfindingを返す。 | memory_context | gate | src/runtime/continuation.ts:1239-1239 |
| `RD01-052` | continuation優先順位処理は、DBとmemoryのPLAN・next action・sequenceが異なる場合、DB情報を採用して競合を報告する。 | memory_context | gate | src/runtime/continuation.ts:1240-1244 |
| `RD01-056` | delivery生成処理は、元entryの保持期限が不正、または配送保持期限が元entryより短い場合に拒否する。 | memory_context | gate | src/runtime/continuation.ts:1297-1303 |
| `RD07-135` | handover退役棚卸しは、provider_evidenceまたはoperations_transitionにsession continuation操作の記述が混入し、許可provider操作でも否定された記述でもない場合に失敗する。 | memory_context | lint | src/lint/handover-retirement.ts:62-67; src/lint/handover-retirement.ts:276-281; src/lint/handover-retirement.ts:329-343 |
| `RD09-116` | proposal-document-coverageは、agent-orchestrationを期待するシナリオでhandover_evidenceがrequired_evidenceにない場合、失敗させる。 | memory_context | lint | src/lint/proposal-document-coverage-policy.ts:62-62; src/lint/proposal-document-coverage.ts:157-166 |
| `RE01-066` | 継続状態の検査器はcontinuationの不一致を警告し、規定された警告条件だけでは作業を停止させない。 | memory_context | hook | docs/governance/helix-harness-requirements_v1.2.md:1064-1073 |
| `RE01-080` | 継続作業者はDBのcontinuationを使用し、prose handoverやCURRENTファイル、廃止CLIを継続の正本にしてはならない。 | memory_context | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:1241-1247 |
| `RE01-082` | 移行担当者は名称が似たprovider handoverを一括削除・正本化せず、型付きの責務で区別する。 | memory_context | prose | docs/governance/helix-harness-requirements_v1.2.md:1241-1247 |
| `RE01-207` | memory管理者はactive memoryの内容をcanonicalへ反映した後、本文を含まないreceiptでfenceしてretireする。staleな指示、二重配信、期限切れtakeover、lost update、終了作業の再浮上を許さない。 | memory_context | gate | docs/governance/helix-harness-requirements_v1.3.md:289-289 |
| `RF01-008` | memory衛生検査は、対象ファイルが存在し、Gitの追跡確認またはHEADとの差分確認が例外になった場合、そのファイルを変更ありとして年齢判定へ渡す。 | memory_context | gate | src/runtime/memory-commit-hygiene.ts:21-49 |
| `RF01-009` | context合成器は、呼出面がdelegation・team_run・task_routeの許可集合に含まれない場合、渡されたmemoryLinesを注入しない。 | memory_context | config／gate | src/runtime/memory-injection.ts:12-16; src/runtime/memory-injection.ts:28-40 |
| `RF01-011` | context合成器は、許可された呼出面にmemoryLinesがある場合、skill pathが一件もなくてもmemoryを注入する。 | memory_context | gate | src/runtime/memory-injection.ts:23-40 |
| `RG03-009` | エージェントは、共有memoryを変更した場合、doctorのmemory age warningを放置しない。 | memory_context | prose | AGENTS.md:306-308; CLAUDE.md:234-236 |
| `RG10-021` | memory移管担当者はtakeover surfaceの重複排除とsurface_countの畳み込みをL6-63の設計範囲に含める。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:94-94 |
| `RG10-022` | 上流資産の移管担当者は、上流固有の運用記録である.ut-tdd/memory/*.mdを移植対象にしてはならない。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:109-109 |
| `RG10-023` | memory移管担当者は人間の申し送りを受けるtakeover layerにone-shot consumed lifecycleを設ける。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:116-116 |
| `RG10-025` | cross-runtime到達の担当者はmemory surfaceをSessionStart hook・Codex側注入経路・委譲promptへ注入する。 | memory_context | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:118-118 |
| `RG16-021` | sessionを再開するagentは、projected stateをgit logとauthored PLAN stateで確認し、完了済みitemを再報告しない。 | memory_context | prose | docs/skills/context-memory.md:64-67 |
| `RG17-009` | agentは、pair-freeze・trace-freeze・acceptの自然なgateを越えるsessionで、continuation eventとharness.db projectionを更新する。更新がない場合は追跡されていないsession分割として扱う。 | memory_context | prose | docs/skills/estimation.md:69-74 |
| `RG18-019` | 共有memoryの管理者はbreadcrumbにprovenanceとTTLを持たせる。 | memory_context | prose | docs/skills/requirements-handover.md:34-36 |
| `RG18-020` | 継続情報の引継ぎ担当者はsession境界を越える前にhelix review --uncommittedでreview evidence gateを確認し、helix memory list harnessでbounded recallのprovenanceとTTLを確認する。 | process_gate | prose | docs/skills/requirements-handover.md:67-77 |

## 副として対応づいた規則（47件）

`RA-012`、`RA-019`、`RA-248`、`RB04-038`、`RB04-103`、`RB04-114`、`RB04-127`、`RB04-135`、`RB04-144`、`RB06-090`、`RB06-180`、`RB06-241`、`RB06-316`、`RB07-061`、`RB07-176`、`RB07-293`、`RB07-298`、`RB07-299`、`RB07-300`、`RB08-029`、`RB08-033`、`RB08-034`、`RB08-077`、`RB08-079`、`RB08-173`、`RB08-255`、`RB08-256`、`RB08-337`、`RC00-133`、`RD01-055`、`RD01-067`、`RD02-293`、`RD02-296`、`RD02-301`、`RD02-319`、`RD02-332`、`RD02-333`、`RD02-334`、`RD03-038`、`RD07-121`、`RD07-123`、`RD07-128`、`RD07-138`、`RE01-081`、`RE01-268`、`RF01-012`、`RG10-024`
