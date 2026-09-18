---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 883ff184a90f40c844e8737a4dee49915a46cceae764d8b7cc5bd0f0fbdd85a3
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSM-06
group: OS管理
product: OS
atoms_primary: 52
atoms_secondary: 34
issue_projection: none
---

# RUL-OSM-06（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

他の作業者や他runtimeの作業中の変更を保護する。未commitの変更や他者のcommitを、明示の指示なしに戻したり上書きしたりしない。

## 主として対応づいた規則（52件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-019` | エージェントは共有memoryを変更したらレーン終端の意図commitに明示pathで含め、競合時は所有runtimeと調整してcommit/push済HEADへ収束させる。 | memory_context | prose／doctor | n/a | .helix/memory/harness.jsonl、memory age warning | `RUL-OSM-03` | AGENTS.md:306-308; CLAUDE.md:234-236 | A／gpt-6-astra |
| `RA-032` | work-guardは現セッションが触っていない未commitファイルへの編集を拒否する。 | safety_security | prose／hook | n/a | work-guard、PLAN-L7-114/433 | — | .claude/CLAUDE.md:225-226; .claude/hooks/work-guard.ts:3-8; AGENTS.md:246-250 | A／gpt-6-astra |
| `RA-033` | work-guardの例外は人間が設定するHELIX_ALLOW_FOREIGN_EDIT=1または理由が非空のmarkerに限り、空markerでは許可しない。 | safety_security | prose／hook | n/a | HELIX_ALLOW_FOREIGN_EDIT、.helix/state/foreign-edit-override | `RUL-OSM-01` | .claude/CLAUDE.md:227-230; .claude/hooks/work-guard.ts:16-19 | A／gpt-6-astra |
| `RA-034` | work-guardはforeign-edit markerを許可した1回のtool callで消費し、継続的bypassに使わせない。 | safety_security | prose／hook | n/a | .helix/state/foreign-edit-override | `RUL-OSM-05` | .claude/CLAUDE.md:230-231; .claude/hooks/work-guard.ts:17-19 | A／gpt-6-astra |
| `RA-036` | work-guardの旧コメントでは、人間管理のenv overrideは消費しないものとして扱う。 | safety_security | prose | n/a | HELIX_ALLOW_FOREIGN_EDIT | — | .claude/hooks/work-guard.ts:16-19 | A／gpt-6-astra |
| `RA-039` | エージェントは履歴書換え前にgit logとgit reflogを確認し、他runtimeの成果を破棄・退行させない。 | safety_security | prose | n/a | — | `RUL-OSM-05` | AGENTS.md:294-301; CLAUDE.md:218-228 | A／gpt-6-astra |
| `RA-040` | エージェントは既存の未commit変更と他runtimeのcommitを正規作業とみなし、明示指示なしにrevert・reset・checkoutしない。 | safety_security | prose | n/a | — | `RUL-OSM-05` | AGENTS.md:286-287; AGENTS.md:294-297; CLAUDE.md:221-224 | A／gpt-6-astra |
| `RA-041` | エージェントはpush済履歴を破壊せず、originと他runtimeのcommitを含めて整合する状態でのみpushする。 | safety_security | prose | n/a | — | `RUL-OSM-05` | AGENTS.md:305-305; CLAUDE.md:233-233 | A／gpt-6-astra |
| `RA-045` | shell hookはforeign-edit検査またはGit検査がexit 2を返した場合、対象操作を拒否する。 | safety_security | hook | n/a | runWorkGuardHook、runGitCommandGuardHook | `RUL-OSM-05`、`RUL-COR-04` | .claude/hooks/git-command-guard.ts:45-60 | A／gpt-6-astra |
| `RA-077` | work-guardはapply_patchのUpdate・Add・Delete・Move headerから対象pathを解析し、foreign-edit保護を適用する。 | tooling_runtime | prose／hook | n/a | apply_patch freeform header | `RUL-OSM-02` | AGENTS.md:246-250 | A／gpt-6-astra |
| `RA-084` | Claude設定はEdit・Write・MultiEditの直前にwork-guardをtimeout 30秒、blockOnFailure=trueで呼ぶ。 | tooling_runtime | config／hook | n/a | PreToolUse Edit\|Write\|MultiEdit | `RUL-OSM-02`、`RUL-COR-04` | .claude/settings.json:17-28; .claude/CLAUDE.md:37-37 | A／gpt-6-astra |
| `RA-087` | Codex設定はapply_patch・Write・Editの直前にwork-guardをtimeout 30秒、blockOnFailure=trueで呼ぶ。 | tooling_runtime | config／hook | n/a | apply_patch\|Write\|Edit | `RUL-OSM-02`、`RUL-COR-04` | .codex/hooks.json:17-28 | A／gpt-6-astra |
| `RA-108` | 他runtimeの変更か判断できない場合やoff-taskな変更と疑う場合、エージェントはrevert前にPO確認し、後者はIMPにも記録する。 | escalation_authority | prose | n/a | IMP | `RUL-OSM-01` | AGENTS.md:296-297; CLAUDE.md:223-224; CLAUDE.md:237-238 | A／gpt-6-astra |
| `RA-286` | エージェントは意図fileだけをpath明示でstageし、git add -Aやgit add .を使わず、無関係なユーザー変更をcommitへ含めない。 | behavior_discipline | prose | n/a | — | `RUL-DEV-01` | AGENTS.md:292-293; CLAUDE.md:185-186; CLAUDE.md:229-230 | A／gpt-6-astra |
| `RA-287` | エージェントは自分の成果を他runtimeのcommitの上に積み、相手のfileに触れない。 | behavior_discipline | prose | n/a | hybrid runtime協調 | — | AGENTS.md:302-302; CLAUDE.md:229-230 | A／gpt-6-astra |
| `RA-288` | エージェントはcommit直前にstatusとstaged diffまたはreviewで、自分の意図fileだけがstageされていることを確認する。 | behavior_discipline | prose | n/a | helix review --staged/--uncommitted | `RUL-DEV-01` | AGENTS.md:303-304; CLAUDE.md:231-232 | A／gpt-6-astra |
| `RB0-137` | agentは実装中に他runtimeのin-flight変更へ触れてはならない。 | safety_security | prose | n/a | foreign change | — | docs/skills/judgment-core.md:79-79 | B／gpt-6-astra |
| `RB04-175` | 作業者はmainへの直接pushと他人のbranchへの無断pushを行わない。 | review_merge | prose／config | fail_close | main branch protection | `RUL-OSA-04` | docs/governance/ai-dev-team-operations_v1.1.md:221-221 | B04／gpt-6-astra |
| `RB06-079` | Kimi guardはgit add -A・--all・.による一括stageを拒否し、path明示だけを認める。 | behavior_discipline | hook | fail_open | Kimiローカルguard | — | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:128-128 | B06／gpt-6-astra |
| `RB06-296` | hybrid作業者はforeign未commit変更を正規作業として触らず退行させず、HEADを基準にして相手の着地後にPLANと正規workflowで実装する。 | lane_delegation | prose | n/a | 当時のCodex in-flight作業 | `RUL-FRM-02` | docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md:159-173 | B06／gpt-6-astra |
| `RB07-228` | 担当者はstage前にstatusとdiffを確認し、current PLANの明示fileだけをstageしてgit add -Aやgit add .を使わない。 | safety_security | prose | n/a | — | `RUL-DEV-01` | docs/skills/git.md:60-73 | B07／gpt-6-astra |
| `RB08-300` | 当該cleanup担当者はライセンス・配布契約を変更せず、未確認原稿や別writerの成果を廃棄しない。 | safety_security | prose | n/a | #1372 cleanup scope | `RUL-TKT-02`、`RUL-OSM-05` | docs/governance/request-source-cleanup-2026-09-06.md:59-59 | B08／gpt-6-astra |
| `RC0-017` | Work guardは、このsessionがtouchしていないuncommittedファイルへの編集を、認められたoverrideがない場合に拒否する。複数対象のうち一つでも該当すれば操作全体を拒否する。 | behavior_discipline | hook | fail_close | sessionTouchedFiles／HELIX_ALLOW_FOREIGN_EDIT | — | src/runtime/work-guard.ts:71-132; src/runtime/work-guard-hook.ts:89-101 | C／gpt-6-astra |
| `RC0-038` | Git guardは、foreignな未コミット変更があるshared rootでの対象変更操作を、pathの重複に関係なく拒否する。 | safety_security | hook | fail_close | shared-root-foreign-dirty | — | src/runtime/git-command-guard.ts:580-590 | C／gpt-6-astra |
| `RC00-031` | 拡張registryは、registry所有でないfileまたはユーザー変更済みfileの削除を許可しない。 | safety_security | gate | fail_close | remove_planのremove_allowed判定 | `RUL-OSM-05` | src/runtime/extension-preset-bundle-registry.ts:79-85 | C00／gpt-6-astra |
| `RC00-048` | agent正本投影器は、ユーザー変更済みfileについて保存警告を出し、上書き投影をskipする。 | safety_security | gate | warn | user_modifiedフラグ | — | src/runtime/agent-ssot-runtime-projection.ts:79-87 | C00／gpt-6-astra |
| `RC00-107` | 隔離worktree計画器は、main worktreeがdirtyなら警告し、allowDirtyがtrueでない限り不合格とする。 | safety_security | gate | fail_close | dry-run計画のok判定 | `RUL-COR-04` | src/runtime/isolated-worktree-sandbox-runner.ts:77-86 | C00／gpt-6-astra |
| `RC00-160` | hosted preflight判定は、hosted面でgit status確認が済んでいなければ拒否する。 | safety_security | gate | fail_close | gitStatusCheckedフラグ | `RUL-COR-04` | src/runtime/hosted-preflight.ts:155-157; src/runtime/hosted-preflight.ts:173-180 | C00／gpt-6-astra |
| `RC00-163` | hosted preflight判定は、hosted面でwork guardがblockなら拒否する。 | safety_security | gate | fail_close | work_guard_blocked | `RUL-COR-04` | src/runtime/hosted-preflight.ts:163-164; src/runtime/hosted-preflight.ts:173-180 | C00／gpt-6-astra |
| `RD01-143` | PLAN authoringのprepared復旧は、新規作成予定のfinal pathが既に存在する場合に拒否する。 | safety_security | gate | fail_close | prepared_recovery_external_write | `RUL-COR-03` | src/runtime/forward-plan-authoring-transaction.ts:345-350 | D01／gpt-6-astra |
| `RD01-168` | PLAN authoring処理は、完全一致の再実行でないのに作成予定pathが1つでも既存なら拒否する。 | safety_security | gate | fail_close | plan_path_collision | `RUL-COR-03` | src/runtime/forward-plan-authoring-transaction.ts:685-686 | D01／gpt-6-astra |
| `RD01-234` | Git command guardは、git revertをbypassなしでは拒否する。 | safety_security | hook | fail_close | git revert | `RUL-OSM-05` | src/runtime/git-command-guard.ts:288-288; src/runtime/git-command-guard.ts:531-551 | D01／gpt-6-astra |
| `RD01-236` | Git command guardは、checkoutの作成・orphan・detach指定を除き、force、path区切り、対象欠落、または対象がrefだけと確認できない場合に拒否する。 | safety_security | hook | fail_close | -b／-B／--orphan／--detachは先に除外 | `RUL-OSM-05`、`RUL-COR-04` | src/runtime/git-command-guard.ts:302-311; src/runtime/git-command-guard.ts:534-551 | D01／gpt-6-astra |
| `RD01-237` | Git command guardは、stagedのみのrestore以外のgit restoreをbypassなしでは拒否する。 | safety_security | hook | fail_close | --staged／-Sかつworktree指定なしを除外 | `RUL-OSM-05` | src/runtime/git-command-guard.ts:258-261; src/runtime/git-command-guard.ts:313-316; src/runtime/git-command-guard.ts:531-551 | D01／gpt-6-astra |
| `RD01-241` | Git command guardは、merge・rebase・cherry-pick・stash pop/apply・am・applyの変更操作にworktree contextがなければ拒否する。 | safety_security | hook | fail_close | help・show-current-patch・apply検査optionは除外 | `RUL-COR-04` | src/runtime/git-command-guard.ts:358-383; src/runtime/git-command-guard.ts:553-565 | D01／gpt-6-astra |
| `RD01-242` | Git command guardは、変更先identityがunknown、shared rootのforeign件数が不明、または件数が不正なら変更操作を拒否する。 | safety_security | hook | fail_close | mutation-context-unresolved | `RUL-COR-04` | src/runtime/git-command-guard.ts:566-579 | D01／gpt-6-astra |
| `RD01-243` | Git command guardは、shared rootに他runtimeの未commit変更があれば、path重複にかかわらず対象変更操作を拒否する。 | lane_delegation | hook | fail_close | shared-root-foreign-dirty | — | src/runtime/git-command-guard.ts:580-589 | D01／gpt-6-astra |
| `RD03-068` | slot障害隔離評価は、peer数が変わる、peerが消える、またはpeerの状態・lease owner・fence tokenが変わる場合、不合格にする。 | lane_delegation | gate | fail_close | samePeerStateとslot_idによる照合。 | `RUL-COR-03` | src/runtime/slot-scheduler-quota-handover.ts:541-546; src/runtime/slot-scheduler-quota-handover.ts:565-573 | D03／gpt-6-astra |
| `RD04-028` | work-guard hookは、複数対象の一つでもforeign編集と判定され、有効なoverride経路が無い場合に操作をブロックする。 | behavior_discipline | hook | fail_close | 全対象stateの評価 | — | src/runtime/work-guard-hook.ts:79-101; src/runtime/work-guard-hook.ts:128-128 | D04／gpt-6-astra |
| `RD04-029` | work-guard hookは、環境変数によるoverrideでも監査transactionのstatusがallowedでなければブロックを解除しない。 | evidence_claim | hook | fail_close | HELIX_ALLOW_FOREIGN_EDITとcommitOverrideUse | `RUL-OSM-05` | src/runtime/work-guard-hook.ts:102-123 | D04／gpt-6-astra |
| `RD04-030` | work-guard hookは、markerによるoverrideでも監査transactionがallowedでなければブロックを解除しない。 | evidence_claim | hook | fail_close | .helix/state/foreign-edit-override | `RUL-OSM-05` | src/runtime/work-guard-hook.ts:129-163 | D04／gpt-6-astra |
| `RD04-033` | work guardは、未コミット対象に現セッションのtouch証拠が無く、bypassも無い場合に編集を拒否する。 | behavior_discipline | hook | fail_close | uncommittedFilesとsessionTouchedFilesの集合差 | — | src/runtime/work-guard.ts:71-91; src/runtime/work-guard.ts:109-125 | D04／gpt-6-astra |
| `RD04-035` | work guardは、bypassがtrueの場合にforeign判定を行わずpassを返す。 | escalation_authority | hook | n/a | 純関数のbypass引数 | `RUL-COR-04` | src/runtime/work-guard.ts:75-77 | D04／gpt-6-astra |
| `RD04-036` | override解決器は、環境変数が厳密に1でなく、marker理由も空の場合にoverrideを成立させない。 | escalation_authority | hook | fail_close | HELIX_ALLOW_FOREIGN_EDIT=1または非空marker理由 | `RUL-COR-04` | src/runtime/work-guard.ts:243-254 | D04／gpt-6-astra |
| `RD04-162` | worktree状態取得器は、Git statusのrename/copyについて移動先と移動元の双方を未コミット保護対象に含める。 | behavior_discipline | hook | n/a | porcelain -zの2record解釈 | — | src/runtime/worktree-state.ts:37-44 | D04／gpt-6-astra |
| `RD04-163` | session touch証拠取得器は、別worktreeの相対path、正規化後も絶対pathまたは..を含むpath、壊れたJSON行を所有証拠に数えない。 | evidence_claim | hook | fail_close | .helix/logs/session/<session>.jsonl | `RUL-COR-04` | src/runtime/worktree-state.ts:59-84 | D04／gpt-6-astra |
| `RD04-168` | worktree別編集判定器は、各対象worktreeの未コミット・touch情報で評価し、一つでもblockなら全体をblockにする。 | behavior_discipline | hook | fail_close | evaluateResolvedWorkGuardTargets | `RUL-COR-04` | src/runtime/worktree-state.ts:180-209 | D04／gpt-6-astra |
| `RD04-169` | Git mutation context解決器は、repository不一致・primary worktree不明・取得例外・実行cwd欠落・一つでもunknown・必要count欠落の場合にunknownとnullを返す。 | tooling_runtime | hook | n/a | worktreeIdentity=unknown、foreignUncommittedCount=null | — | src/runtime/worktree-state.ts:212-247; src/runtime/worktree-state.ts:251-274 | D04／gpt-6-astra |
| `RD07-176` | identifier-renameの切替計画は、worktreeに未commit変更や未追跡ファイルがありcleanでなければ承認資料を準備完了にしない。 | escalation_authority | lint | fail_close | porcelain出力からdirtyPathsを算出 | `RUL-OSM-01` | src/lint/identifier-rename.ts:2296-2309; src/lint/identifier-rename.ts:2432-2436 | D07／gpt-6-astra |
| `RE01-206` | 変更guardはforeign hunk、未記録override、破壊的Git操作を拒否し、同一episodeの境界で検査する。 | safety_security | hook／gate | fail_close | foreign-editとGit command guard | `RUL-OSM-05` | docs/governance/helix-harness-requirements_v1.3.md:288-288 | E01／claude-opus |
| `RE01-268` | 共有作業のwriter leaseは常に一つにし、memoryのtakeoverを編集所有権の取得とみなしてはならない。 | lane_delegation | gate | fail_close | writer leaseとmemory takeoverの分離 | `RUL-OSM-03` | docs/governance/helix-harness-requirements_v1.3.md:534-539 | E01／claude-opus |
| `RG14-017` | one-shot foreign-edit手続きは、理由が256文字の上限を超える場合、その申請を拒否する。 | safety_security | gate | fail_close | 理由記録付きone-shot foreign-edit手続きの256文字制限 | `RUL-COR-04` | docs/governance/request-source-cleanup-2026-09-06.md:37-38 | G14／claude-opus |

## 副として対応づいた規則（34件）

`RA-035`、`RA-037`、`RA-079`、`RB04-148`、`RB04-214`、`RB07-325`、`RC0-018`、`RC0-020`、`RC0-027`、`RC0-031`、`RC0-036`、`RC0-037`、`RC00-043`、`RC00-044`、`RC00-047`、`RC00-058`、`RC00-070`、`RC00-108`、`RC00-162`、`RD01-170`、`RD01-233`、`RD01-235`、`RD01-238`、`RD01-240`、`RD02-219`、`RD02-276`、`RD02-279`、`RD02-282`、`RD03-051`、`RD04-031`、`RD04-032`、`RD04-166`、`RD07-175`、`RE01-061`
