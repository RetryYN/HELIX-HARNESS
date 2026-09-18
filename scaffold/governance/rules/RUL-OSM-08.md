---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSM-08
group: OS管理
product: OS
atoms_primary: 76
atoms_secondary: 82
issue_projection: none
---

# RUL-OSM-08（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

GitHubを共有・作業・証拠の投影として使う。Issue、PR、templateの形式とownerの単一性を定め、GitHubの状態から要求や承認を作らない。

## 主として対応づいた規則（76件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-155` | mainへの取込はPR経由とする。 | review_merge | prose | AGENTS.md:320-320; CLAUDE.md:198-198 |
| `RB0-023` | PR作成者は一つのbehavior contractと一つの責務ownerを単位に変更し、独立merge可能なbehaviorや複数ownerを混載しない。 | review_merge | prose／lint | docs/governance/coding-rules.md:29-31; docs/governance/ddd-tdd-rules.md:28-30; docs/governance/ddd-tdd-rules.md:71-74; docs/governance/ddd-tdd-rules.md:114-116; docs/governance/github-operation-rules.md:51-52 |
| `RB0-070` | branch作成者は登録済みprefixと作業kindを一致させ、未登録prefix・prefixなし・fix/・work/・bugfix/を使わない。 | tooling_runtime | gate | docs/governance/github-operation-rules.md:24-32 |
| `RB0-071` | PR作成者は指定名の六項目からなるHELIX scope manifestをPR bodyへ記載し、同じheadの実差分と照合する。 | review_merge | gate | docs/governance/github-operation-rules.md:34-47 |
| `RB0-072` | PR作成者は責務ownerを一つに固定し、reviewer・CI・provider名をownerの代用にしない。 | review_merge | prose／gate | docs/governance/github-operation-rules.md:52-52 |
| `RB0-074` | PR作成者はexpected changed pathsを重複のないexact path集合で記載し、実diffと完全一致させる。 | review_merge | gate | docs/governance/github-operation-rules.md:54-54 |
| `RB0-075` | srcを変更するPRの作成者は対応PLANとtest companionを実差分とmanifestに含め、説明文だけで代替しない。 | review_merge | gate | docs/governance/github-operation-rules.md:55-55 |
| `RB0-082` | Issue起票者は現存type labelとstateまたはpriority labelを作成操作で付け、責務を特定できる場合はarea labelも付ける。 | process_gate | prose | docs/governance/github-operation-rules.md:80-82 |
| `RB0-083` | 監査側は48時間以上labelなしのopen Issueを失敗扱いにし、是正者は起票要求と要求traceに基づいて分類する。 | process_gate | gate | docs/governance/github-operation-rules.md:83-84 |
| `RB0-084` | Issue作成者はworkflow/signal分類のrecoveryやincidentをGitHub labelとして出力してはならない。 | doc_language | prose | docs/governance/github-operation-rules.md:85-85 |
| `RB0-085` | 新しいtype labelを追加する者は、先にlabel registryとGitHub実体を同一変更で更新する。 | process_gate | prose | docs/governance/github-operation-rules.md:85-85 |
| `RB0-086` | Issue階層の管理者はharness.dbとrepo-owned ledgerを正本とし、GitHub sub-issueを一方向projectionとして扱う。 | memory_context | prose | docs/governance/github-issue-hierarchy-rules.md:5-6 |
| `RB0-089` | Issue起票者はrole・parent・blocks・blocked_by・duplicate_search・disposition・duplicate_ofの指定blockを本文に持たせる。 | process_gate | prose | docs/governance/github-issue-hierarchy-rules.md:21-31 |
| `RB0-094` | PR担当者は原則一つのtask Issueだけを閉じ、子findingのdispositionを明示する。 | review_merge | prose | docs/governance/github-issue-hierarchy-rules.md:37-37 |
| `RB0-104` | 管理者はProject Statusから上流意味・承認・完了状態を逆書込みしてはならない。 | escalation_authority | prose | docs/governance/management-scrum-product-forward.md:24-24 |
| `RB04-010` | 作業者はGitHubの証拠から要求の意味・採否・完了を生成せず、改善候補を対象別のローカル要求正本へ戻して採否する。 | evidence_claim | prose | docs/governance/helix-harness-concept_v3.1.md:144-144 |
| `RB04-102` | hotfixのbranch protectionはpostmortem docとRecovery PLANの紐付けを必須とする。 | review_merge | gate／config | docs/governance/helix-harness-concept_v3.1.md:912-914 |
| `RB04-106` | PR起票時はbranch prefixとPLAN kindの対応をbranch-kind-checkで検証し、docs/choreのPLAN不要例外は要件正本に従う。 | process_gate | ci | docs/governance/helix-harness-concept_v3.1.md:947-962 |
| `RB04-159` | チームはコード・Issue・PR・議論をGitHubへ集約し、Slackの重要決定をIssueへ記録し、未記録の口頭決定を有効としない。 | memory_context | prose | docs/governance/ai-dev-team-operations_v1.1.md:69-75 |
| `RB04-164` | PR作成者は説明欄にAI生成範囲を必ず明記する。 | evidence_claim | prose | docs/governance/ai-dev-team-operations_v1.1.md:109-111 |
| `RB04-173` | branch作成者は用途に応じたfeat/fix/refactor/docs/test/chore/claude/codex prefixを使い、意味のない名前を付けない。 | tooling_runtime | prose | docs/governance/ai-dev-team-operations_v1.1.md:196-207; docs/governance/ai-dev-team-operations_v1.1.md:221-221 |
| `RB04-174` | branchはmainから派生させ、原則1〜3日でmergeし、長期化する場合はTLへ相談してPRを分割する。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:209-217 |
| `RB04-176` | branch管理者はmerge後を自動削除に任せ、1週間以上放置したbranchは削除するかDraft PRを作成する。 | tooling_runtime | prose／config | docs/governance/ai-dev-team-operations_v1.1.md:215-221 |
| `RB04-177` | commit作成者はConventional Commits形式と指定typeを使い、AI生成commitにも同じ規約を適用する。 | tooling_runtime | prose | docs/governance/ai-dev-team-operations_v1.1.md:224-249; docs/governance/ai-dev-team-operations_v1.1.md:277-277 |
| `RB04-178` | commitは一つの論理変更に限定し、subjectを50文字以内の命令形、bodyを理由と内容、footerを関連IssueへのCloses/Refs/Fixesとする。 | tooling_runtime | prose | docs/governance/ai-dev-team-operations_v1.1.md:267-275 |
| `RB04-179` | PR作成者は作業完了時にPRを作り、途中の場合はDraftとし、template全項目を埋めて関連Issueをリンクする。 | review_merge | prose | docs/governance/ai-dev-team-operations_v1.1.md:279-318 |
| `RB04-263` | 開発者はGitHubで完結できるIssue管理・CI/CD・文書機能をGitHub内で完結させる。 | tooling_runtime | prose | docs/governance/ai-dev-team-concept_v1.1.md:403-403 |
| `RB04-278` | 基盤担当者はGitHub組織を作成し、repository命名とmember roleを定義して既存repositoryを移管する。 | tooling_runtime | prose | docs/governance/ai-dev-team-concept_v1.1.md:605-613 |
| `RB04-279` | 基盤担当者は全repositoryへagent規則・README・SECURITY・gitignore・PR template・Dependabot設定・最小CIを配置する。 | tooling_runtime | prose／config | docs/governance/ai-dev-team-concept_v1.1.md:615-633 |
| `RB05-033` | PR作成者は文書・ドメイン・実装・規約監査、テスト結果、変更ファイル、機能リスク、レビュー要約、実行ログ、rollback計画をPRに含める。 | evidence_claim | gate | docs/governance/audit-framework.md:344-358 |
| `RB05-082` | Issueのread-after-write観測を、packetのsame-HEAD review・DB convergence・PO回答・freeze承認の代替にしない。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:412-415; docs/governance/l3-rebaseline-g3-freeze-packet.md:488-489 |
| `RB07-020` | GitHub運用guardはhotfix/*からmainへのPRにpostmortem markerを要求する。 | review_merge | prose／gate | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:94-104; docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:151-151 |
| `RB07-230` | 旧Git方針ではsolo maintainerのmain直接commitを許容し、複数sessionまたはhybrid reviewが必要ならtype/slug形式のfeature branchを使う。 | review_merge | prose | docs/skills/git.md:89-94 |
| `RB08-333` | GitHub運用設計者はroute別branch prefixとmerge strategyを単一policy化し、branch TTL・merge後削除・stale検出を設ける。 | review_merge | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:19-20; docs/governance/github-operations-reference-audit-2026-07-18.md:29-29 |
| `RB08-334` | GitHub運用設計者はmainを例外なしPR-onlyとし、required checkをstrictにして、strict/bypassをpolicyとlive差分検査へ含める。 | review_merge | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:21-23 |
| `RB08-336` | Issue運用設計者はlabel整備をadmission前提にし、webhookからDB inbox・PLAN候補までの接続を実証する。 | process_gate | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:26-27 |
| `RB08-339` | Issue受付設計者は起点PLAN・観測HEAD/state・証拠・理由code・drive・再入点に加え、要求/AC・起点revision・route・scope/non-goals・security影響を必須にする。 | process_gate | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:35-37 |
| `RB08-340` | Git作業者は明示pathだけをstageし、Conventional Commits・1 PR 1目的・短命branch・CI self-healを採用する。 | review_merge | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:39-41 |
| `RB09-021` | Reverse PLANの管理者は、primary github_issue_idをterminal bundle authorityである親Issue #1206へ束縛する。 | escalation_authority | prose | docs/governance/ci-verification-plan-terminal-fullback-evidence.md:35-35 |
| `RC0-040` | Git hookは、直接のgh pr close／reopenを拒否する。 | review_merge | hook | src/runtime/git-command-guard.ts:50-54; src/runtime/git-command-guard-hook.ts:213-219 |
| `RC0-108` | pr-context-guardは、pocからmainへのPR、必要なPostmortem／recovery証拠のないhotfix、原子契約scopeの形式・実diff・companion PLAN／test・承認参照形式の不整合で失敗する。Closes指定があるPRではoutcome・closure receipt・子Issue処置・必要なclosure graphを検査し、rejected／quarantinedにはDecision receipt、superseded／cancelledにはPO decisionを要求する。 | review_merge | lint／ci | src/lint/github-guards.ts:278-590; .github/PULL_REQUEST_TEMPLATE.md:6-16; .github/workflows/harness-check.yml:409-469 |
| `RC00-007` | Issue metadata監査は、open Issueが無ラベルのままstale時間以上経過した場合に不合格とする。 | process_gate | gate | src/runtime/issue-metadata-audit.ts:31-41; src/runtime/issue-metadata-audit.ts:57-61 |
| `RC00-008` | Issue metadata監査は、open Issueの管理対象typeラベルがちょうど1つでなければ不合格とする。 | process_gate | gate | src/runtime/issue-metadata-audit.ts:3-7; src/runtime/issue-metadata-audit.ts:42-47 |
| `RC00-009` | Issue metadata監査は、open Issueにstate:またはpriority:で始まるラベルがなければ不合格とする。 | process_gate | gate | src/runtime/issue-metadata-audit.ts:49-59 |
| `RC02-152` | consumer doctorのconsumer-policy-templates checkは、Recovery/Add-feature/PR templateの指定章・label・成果物path・検証markerが欠落する、またはIssue templateに非対応workflow labelや旧層・modeの現行案内がある場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:6344-6386 |
| `RD00-294` | review comment seal処理は、comment URLが未指定・null・空の場合、投稿必須として扱う。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1020-1029 |
| `RD01-226` | Git guard hookは、直接のgh pr closeまたはreopenを拒否する。 | review_merge | hook | src/runtime/git-command-guard-hook.ts:213-219 |
| `RD02-080` | Issue階層収集器は、本文に階層契約が存在しない場合に欠落findingを返す。 | process_gate | gate | src/runtime/issue-hierarchy.ts:125-135 |
| `RD02-082` | Issue階層収集器は、階層契約の必須項目に欠落がある場合に欠落項目付きfindingを返す。 | process_gate | gate | src/runtime/issue-hierarchy.ts:105-113; src/runtime/issue-hierarchy.ts:146-156 |
| `RD02-085` | native graph監査器は、本文で管理するIssueがnative snapshotに存在しない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:318-327 |
| `RD02-087` | native graph監査器は、本文の親Issueがnative側で欠落している場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:340-351 |
| `RD02-088` | native graph監査器は、本文にない親Issueがnative側にある場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:340-351 |
| `RD02-089` | native graph監査器は、本文とnative側が異なる親Issueを指定している場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:340-351 |
| `RD02-090` | native graph監査器は、本文が定める子Issueがnative側にない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:292-307; src/runtime/issue-hierarchy.ts:353-360 |
| `RD02-091` | native graph監査器は、本文にない子Issueがnative側にある場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:309-315; src/runtime/issue-hierarchy.ts:353-360 |
| `RD02-111` | 依存監査器は、PLANが参照するIssueが存在しない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:858-865 |
| `RD02-115` | 階層契約解析器は、roleがroot・capability・task・finding以外の場合に拒否するが、featureはcapabilityへ正規化する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:988-995; src/runtime/issue-hierarchy.ts:1014-1020 |
| `RD05-011` | branch-kindは、featureまたはhotfix branchのPLANに整数のgithub_issue_idがない場合、警告する。 | review_merge | lint | src/lint/branch-kind.ts:239-240; src/lint/branch-kind.ts:338-344 |
| `RD07-190` | Issue closure contract解析は、本文のJSONコードブロックから指定schemaのcontractを見つけられなければ拒否する。 | review_merge | lint | src/lint/issue-closure-graph.ts:121-137 |
| `RD07-193` | Issue closure graph監査は、閉鎖対象の親Issueがopenでなければ失敗する。 | review_merge | lint | src/lint/issue-closure-graph.ts:173-183 |
| `RD07-194` | Issue closure graph監査は、canonical契約集合で同じcontract_idが複数回出現すれば失敗する。 | review_merge | lint | src/lint/issue-closure-graph.ts:184-197 |
| `RD07-195` | Issue closure graph監査は、宣言された子IssueがGitHub snapshotに存在しなければ失敗する。 | review_merge | lint | src/lint/issue-closure-graph.ts:199-207 |
| `RD07-196` | Issue closure graph監査は、子Issueの観測状態が宣言されたexpected_stateと異なれば失敗する。 | review_merge | lint | src/lint/issue-closure-graph.ts:208-214 |
| `RD07-202` | Issue closure graph監査は、completion receiptが指すPRがsnapshotに存在しない、またはmerge済みでなければ失敗する。 | review_merge | lint | src/lint/issue-closure-graph.ts:290-298 |
| `RD09-088` | PR scope preflightは、PLANのconfirmed昇格等でlive snapshotがbaseと同一になる場合、snapshotのExpected宣言を外すよう案内する。 | review_merge | lint | src/lint/pr-scope-preflight.ts:126-139; src/lint/pr-scope-preflight.ts:147-148; src/lint/pr-scope-preflight.ts:308-308 |
| `RD09-089` | PR scope preflightは、新規draft PLANによってsnapshotがbaseと異なる場合、snapshot再生成またはExpectedへの宣言を案内し、Allowed外なら許可が必要と表示する。 | review_merge | lint | src/lint/pr-scope-preflight.ts:132-143; src/lint/pr-scope-preflight.ts:308-308 |
| `RD09-091` | PR scope preflightは、PLAN status変更でsnapshotがbaseと異なるのにdiffに含まれない場合、再生成とExpected宣言を案内し、Allowed外なら許可を要求する。 | review_merge | lint | src/lint/pr-scope-preflight.ts:149-151; src/lint/pr-scope-preflight.ts:308-308 |
| `RE01-073` | 管理者は通常Forward以外で見つかった問題もIssueにし、一つのIssueを一つのPLANまたはhubへ対応づける。hubの子PLANを独立Issueへ分散させない。 | memory_context | prose | docs/governance/helix-harness-requirements_v1.2.md:1191-1216 |
| `RE01-075` | PR作成者は対応Issueを閉じるCloses参照をPRへ記載する。 | review_merge | lint／ci | docs/governance/helix-harness-requirements_v1.2.md:1191-1216 |
| `RE01-156` | GitHub運用者は動的にCODEOWNERSを書き換えてroleを割り当てず、comment・label・review requestを使用する。 | tooling_runtime | prose | docs/governance/helix-harness-requirements_v1.2.md:2310-2325 |
| `RE01-169` | 要求管理者はIssueやPRの存在・closeから要求の意味や採否を追加・削除せず、DBでrepository上の正本とJSON契約を上書きしない。 | escalation_authority | prose | docs/governance/helix-harness-requirements_v1.3.md:38-40 |
| `RE01-255` | GitHub運用者はmainへの変更をPR経由に限定し、strictな保護をbypassしてはならない。 | review_merge | config／gate | docs/governance/helix-harness-requirements_v1.3.md:516-516 |
| `RE01-260` | Issueの完了はterminal PRのClosesとmergeで行い、AIが手動closeしてはならない。superseded・cancelはPO判断とし、子項目のdispositionも閉じる。 | review_merge | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:516-516 |
| `RE01-265` | GitHub連携はDBからの一方向projectionを基本とし、逆方向はIssue admissionへ限定する。通常Forward外のIssueも見える状態に保つ。 | memory_context | gate | docs/governance/helix-harness-requirements_v1.3.md:525-531 |
| `RG10-015` | PR作成者はbehavior contractの成立に必要なPLAN・test・designなどのcompanionをRequired companion pathsへexact pathで指定する。 | review_merge | prose／gate | docs/governance/github-operation-rules.md:34-36; docs/governance/github-operation-rules.md:55-55 |
| `RG10-018` | GitHub運用設計者は通常Forwardを含む全入口にIssue gateを要求し、上流UTの「通常ForwardはIssue不要」をそのまま採用してはならない。 | process_gate | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:37-37 |

## 副として対応づいた規則（82件）

`RA-154`、`RA-160`、`RA-197`、`RB0-009`、`RB0-060`、`RB0-077`、`RB0-087`、`RB0-088`、`RB0-090`、`RB0-092`、`RB0-097`、`RB0-098`、`RB0-099`、`RB0-103`、`RB0-105`、`RB04-009`、`RB04-114`、`RB04-143`、`RB04-163`、`RB04-180`、`RB04-181`、`RB04-224`、`RB04-242`、`RB04-243`、`RB04-256`、`RB04-272`、`RB04-280`、`RB05-001`、`RB05-048`、`RB05-061`、`RB05-104`、`RB05-144`、`RB05-145`、`RB05-327`、`RB06-129`、`RB08-276`、`RB08-308`、`RB08-337`、`RB09-003`、`RB09-020`、`RB09-031`、`RC00-186`、`RC04-247`、`RC04-281`、`RD01-287`、`RD01-288`、`RD02-081`、`RD02-083`、`RD02-092`、`RD02-093`、`RD02-100`、`RD02-101`、`RD02-102`、`RD02-103`、`RD02-109`、`RD02-110`、`RD02-112`、`RD02-113`、`RD02-126`、`RD02-128`、`RD07-191`、`RD07-192`、`RD07-197`、`RD07-198`、`RD07-199`、`RD07-200`、`RD07-201`、`RD07-205`、`RD09-086`、`RD09-087`、`RD09-090`、`RE01-064`、`RE01-070`、`RE01-076`、`RE01-095`、`RE01-155`、`RE01-256`、`RE01-261`、`RG10-013`、`RG10-017`、`RG13-009`、`RG13-011`
