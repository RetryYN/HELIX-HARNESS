---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-DEV-01
group: サービス④開発
product: HARNESS
atoms_primary: 91
atoms_secondary: 110
issue_projection: #1854
---

# RUL-DEV-01（サービス④開発／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

実装の規律を定める。失敗を握りつぶさない、循環依存を作らない、修正は最小にして無関係な整理を混ぜない。

## 主として対応づいた規則（91件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-229` | refactor実行者は1commitにつき1構造変更とし、feature追加やbug修正を混ぜない。 | process_gate | prose | .claude/commands/code-simplify.md:17-18 |
| `RA-282` | エージェントは既存の命名・構造・test配置に合わせる。 | behavior_discipline | prose | AGENTS.md:149-149; AGENTS.md:285-285; CLAUDE.md:173-173; .claude/commands/build.md:19-20 |
| `RA-283` | エージェントは誤った開発残骸を発見したら削除または明確にsupersedeし、誤解を招くcommentやdead pathを放置しない。 | behavior_discipline | prose | CLAUDE.md:176-177 |
| `RA-298` | BE logic・FE leadは要求にない抽象化・layer・file・過剰防御・将来対応を先取りせず、FE leadは過剰なsubagent召喚も抑える。 | behavior_discipline | prose | .claude/agents/be-logic.md:17-17; .claude/agents/fe-lead.md:23-24 |
| `RA-357` | 実装者はanyを使わず、外部入力にunknownとtype guardを使い、外部値へのnon-null assertionを使わない。 | behavior_discipline | prose | .claude/commands/build.md:17-18; AGENTS.md:95-95; CLAUDE.md:44-44 |
| `RA-358` | 実装者は引数を3個以下にし、超える場合はtyped options objectへまとめる。 | behavior_discipline | prose | .claude/commands/build.md:18-18 |
| `RA-359` | 実装者はfile名をkebab-case、functionを単一責務とし、deep nestingよりearly returnを優先する。 | behavior_discipline | prose | .claude/commands/build.md:19-20 |
| `RB0-020` | 実装者はno_change→delete→configure→reuse→modify→add_codeの順に検討し、先行案で契約を満たせない場合だけコードを追加する。 | behavior_discipline | prose | docs/governance/coding-rules.md:21-24; docs/governance/ddd-tdd-rules.md:16-17 |
| `RB0-021` | 変更者は複雑度を評価するとき、コード行数だけでなくstate・dependency・CI・feature flag・運用分岐の増減も数える。 | behavior_discipline | prose | docs/governance/coding-rules.md:23-24; docs/governance/ddd-tdd-rules.md:25-26 |
| `RB0-026` | TypeScriptのsourceとtestの作成者はexplicit anyを使わず、unknown・generics・具体型を使う。 | behavior_discipline | lint／doctor | docs/governance/coding-rules.md:40-49; docs/governance/coding-rules.md:139-139 |
| `RB0-027` | TypeScriptのsourceとtestの作成者はTypeScript・ESLint・Biomeの抑制コメントを使ってはならない。 | behavior_discipline | lint／doctor | docs/governance/coding-rules.md:50-53; docs/governance/coding-rules.md:139-139 |
| `RB0-028` | TypeScriptファイルの作成者はkebab-case、kebab-caseの.test.ts、またはindex.tsで命名する。 | behavior_discipline | lint／doctor | docs/governance/coding-rules.md:54-57 |
| `RB0-029` | sourceの関数・method・constructor・arrowは引数を三つ以下にし、それを超える場合は入力objectを使う。test helperは上限の対象外とする。 | behavior_discipline | lint／doctor | docs/governance/coding-rules.md:58-61; docs/governance/coding-rules.md:139-139 |
| `RB0-030` | 実装者はcatchで記録・変換・明示的失敗状態の返却・fail-open意図の明記を行い、無説明の空catchや再throwだけのcatchを置かない。 | behavior_discipline | lint／doctor | docs/governance/coding-rules.md:62-65; docs/governance/coding-rules.md:140-140 |
| `RB0-032` | source作成者は相対importの循環を作らず、必要な共通処理を下位moduleへ抽出する。 | behavior_discipline | lint／doctor | docs/governance/coding-rules.md:70-73; docs/governance/ddd-tdd-rules.md:135-135 |
| `RB0-035` | 循環依存baselineの保守者は既存12 cycleの例外を拡大せず、解消済みcycleを後続PLANで削除する。 | tooling_runtime | prose／lint | docs/governance/coding-rules.md:87-91 |
| `RB0-036` | 実装者は運用中に調整し得る数値・閾値をコードへ直書きせず外部化する。 | behavior_discipline | prose | docs/governance/coding-rules.md:115-118 |
| `RB0-037` | 実装者は同一ファイルで三回以上反復する意味のあるliteralの外部化を検討する。 | behavior_discipline | prose | docs/governance/coding-rules.md:119-121 |
| `RB0-038` | 実装者は実行環境や配布先で変わるpath・URL・model名・profile名を外部化する。 | behavior_discipline | prose | docs/governance/coding-rules.md:115-122 |
| `RB0-039` | 実装者は外部化対象の調整値を最低限policy moduleへ分離し、実装logicと同居させない。 | behavior_discipline | prose | docs/governance/coding-rules.md:124-127 |
| `RB0-047` | コード追加または正味複雑度増加を選ぶ者は、理由と検証可能な削除・統合条件を記録する。 | behavior_discipline | prose／lint | docs/governance/ddd-tdd-rules.md:25-27; docs/governance/ddd-tdd-rules.md:107-109 |
| `RB0-048` | 設計者は将来用途だけの抽象化や、一実装しかない投機的interfaceを追加してはならない。 | behavior_discipline | prose | docs/governance/ddd-tdd-rules.md:25-27 |
| `RB0-055` | 2026-07-25以降のL3-L7 PLAN作成者は、no-code判断・DDD・DbC・TDD・正味複雑度をfrontmatterへ機械可読に記録する。 | process_gate | lint／doctor／ci | docs/governance/ddd-tdd-rules.md:67-70; docs/governance/ddd-tdd-rules.md:85-105 |
| `RB0-060` | PR作成者は増やしたものに加え、何を削れる状態へ近づけたかも記録する。 | evidence_claim | prose | docs/governance/ddd-tdd-rules.md:121-121 |
| `RB0-127` | agentはactive PLAN scopeに留まり、隣接codeをついでにrefactorしてはならない。 | behavior_discipline | prose | docs/skills/SKILL_MAP.md:84-84 |
| `RB0-134` | agentは要求されたことだけを最小差分で実装し、新規ファイルをPLAN generatesへtraceする。 | behavior_discipline | prose | docs/skills/judgment-core.md:66-68; docs/skills/judgment-core.md:79-80 |
| `RB04-074` | 実装者は呼出し/importグラフのorphan・cycle・missingやlayering違反を生じさせない。 | behavior_discipline | prose／lint | docs/governance/helix-harness-concept_v3.1.md:735-748 |
| `RB04-121` | 実装者はcatchで失敗状態の返却・記録・変換またはfail-open意図を明示し、無記録の空catchや再throwだけのcatchを作らない。 | behavior_discipline | prose／lint | docs/governance/helix-harness-concept_v3.1.md:1118-1119 |
| `RB04-163` | PR作成者は一つの変更目的に限定し、差分200〜400行を目安として超過時は分割を検討する。 | review_merge | prose | docs/governance/ai-dev-team-operations_v1.1.md:101-107; docs/governance/ai-dev-team-operations_v1.1.md:1049-1051 |
| `RB04-190` | refactor指示例ではAIは責務別に関数を分割し、既存test通過と新関数test追加を確認し、外部API呼出し・DB schema・公開interfaceを変更しない。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:466-483 |
| `RB04-224` | hotfix担当者は緊急patchを宣言し、mainからhotfix/issueを作って最小変更に限定し、PR説明にも緊急である旨を記す。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:958-970; docs/governance/ai-dev-team-operations_v1.1.md:982-982 |
| `RB05-014` | 規約管理者は構成、命名、import、関数分割、エラー、ログ、型、UI、API、DB、テスト配置、禁止事項をcoding-rules.mdで定義する。 | behavior_discipline | prose | docs/governance/audit-framework.md:271-284 |
| `RB05-015` | 例示された実装規則では、実装者は読みやすさを優先し、暗黙知に依存せず、一時対応には理由をコメントする。 | behavior_discipline | prose | docs/governance/audit-framework.md:286-292 |
| `RB05-016` | 例示された命名規則では、関数名を動詞で始め、boolean名にis・has・can・shouldを使い、汎用すぎる名前を避ける。 | behavior_discipline | prose | docs/governance/audit-framework.md:297-298 |
| `RB05-018` | 例示されたimport規則では、実装者は深すぎる相対パスを避け、feature間の直接依存と循環依存を作らない。 | behavior_discipline | prose | docs/governance/audit-framework.md:300-301 |
| `RB05-022` | 例示されたサービス規則では、実装者は権限チェックを省略せず、例外を握りつぶさない。 | safety_security | prose | docs/governance/audit-framework.md:306-307 |
| `RB05-027` | 例示された禁止事項では、開発者はmainへの直接pushと仕様外のついで修正を行わない。 | review_merge | prose | docs/governance/audit-framework.md:315-316 |
| `RB05-203` | Scope Gateはoracleに寄与せず複雑性・public surface・運用負債だけを増やす変更を拒否し、子Issueにも同じscope authorityを適用する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:342-342; docs/governance/infinity-loop-system-assertion-cases.md:418-418 |
| `RB06-249` | 移管担当者はmodule bulk portを禁止し、一behavior atom・一versioned contract・一PRで移管する。 | process_gate | prose | docs/governance/python-semantic-migration-ledger.v1.yaml:18-18 |
| `RB07-201` | 実装者は設計に明記された差替え点を除き将来用の抽象・設定・拡張点を作らず、呼出し側が必要とする最小interfaceから実装する。 | behavior_discipline | prose | docs/skills/code-minimalism.md:60-65 |
| `RB07-202` | 実装者は到達不能コード・無効flag・comment化した死コード・未使用optionを発見したら削除する。 | behavior_discipline | prose | docs/skills/code-minimalism.md:66-68 |
| `RB07-203` | 実装者は行数でなく総所有費を最小化し、過度なDRY・metaprogramming・難解な一行化を避ける。 | behavior_discipline | prose | docs/skills/code-minimalism.md:69-71 |
| `RB07-210` | 担当者はコード量を成果にせず満たした要件IDで報告し、reviewでは不要実装も探し、PLAN scopeを越えるついで実装を行わない。 | behavior_discipline | prose | docs/skills/code-minimalism.md:107-114 |
| `RB07-284` | 実装者はPLAN根拠のないany・ts-ignoreを使わず、複数形returnにdiscriminated unionを使い、外部入力をunknownとして使用前にnarrowする。 | behavior_discipline | prose | docs/skills/incremental-implementation.md:44-51 |
| `RB07-285` | 実装者は各commit後にtypecheckを0で終え、commitをまたいで型debtを蓄積しない。 | process_gate | prose | docs/skills/incremental-implementation.md:52-53 |
| `RB07-286` | 実装者は関数を動作を表す動詞で命名し、boolean関数にis・has・can prefixを使い、filenameを主要exportへ合わせる。 | behavior_discipline | prose | docs/skills/incremental-implementation.md:55-62 |
| `RB07-288` | 実装者は関数を単一責務にし、state読取・変換・writeを分け、DBやstate writer内でbusiness logicを計算しない。 | behavior_discipline | prose | docs/skills/incremental-implementation.md:66-71 |
| `RB07-289` | 実装者はexportをtestとcallerに必要な最小集合へ限定し、internal helperを公開しない。 | behavior_discipline | prose | docs/skills/incremental-implementation.md:72-73 |
| `RB07-290` | 関数bodyが推奨30行を超える場合、実装者はnamed helperを抽出し、新概念なら設計へ記録する。 | behavior_discipline | prose | docs/skills/incremental-implementation.md:74-75 |
| `RB07-291` | 実装者はcommitをRedからGreenまたはGreen維持refactorの単位にし、複数featureをまとめず、明示stageとConventional Commitsを使う。 | review_merge | prose | docs/skills/incremental-implementation.md:77-85 |
| `RB07-329` | 修正担当者は回帰testをgreenにする最小変更に限定し、同じcommitへ隣接cleanupやrefactorを混ぜない。 | behavior_discipline | prose | docs/skills/error-fix.md:58-61; docs/skills/error-fix.md:96-97 |
| `RB07-333` | 担当者は不具合を表面化させた型エラーをts-ignoreで黙らせない。 | behavior_discipline | prose | docs/skills/error-fix.md:100-101 |
| `RB08-015` | Refactor担当者は各commitを構造変更1件に限定し、feature追加と混ぜない。 | behavior_discipline | prose | docs/skills/refactoring.md:50-53; docs/skills/refactoring.md:91-92 |
| `RB08-016` | Refactor担当者は各構造変更後にtypecheck・lint・test・doctorを実行し、redなら最後の変更を戻してから進む。 | process_gate | prose | docs/skills/refactoring.md:53-60 |
| `RB08-107` | 実装者は新testを通す最小実装だけを追加し、未検証surfaceを増やさず、既存test・typecheck・lint・doctorの成功を維持する。 | process_gate | prose | docs/skills/test-driven-development.md:45-51 |
| `RB08-108` | TDDのRefactor担当者は挙動を変えず、各構造変更後に全検査を再実行し、testがRedなら停止して最後の変更を戻す。 | process_gate | prose | docs/skills/test-driven-development.md:53-58 |
| `RC00-083` | 文書report書込器は、公開後の失敗に対する削除・directory同期の補償も失敗した場合、状態不明の専用エラーを返す。 | safety_security | gate | src/runtime/document-report-write-port.ts:159-172 |
| `RC01-091` | coding-rulesは、coding-rule正本文書がない場合、不合格にする。 | behavior_discipline | lint | src/lint/coding-rules.ts:491-500 |
| `RC01-096` | coding-rulesは、検査対象のForward文書にCODING-RULE-WORKFLOW markerまたはcoding-rules正本pathがない場合、不合格にする。 | process_gate | lint | src/lint/coding-rules.ts:218-230; src/lint/coding-rules.ts:540-547 |
| `RC01-098` | coding-rulesは、sourceの相対static importにbaseline外の循環依存を検出した場合、不合格にする。 | behavior_discipline | lint | src/lint/coding-rules.ts:359-445; src/lint/coding-rules.ts:563-563 |
| `RC01-099` | coding-rulesは、検査対象TypeScriptファイル名が許可された小文字英数字のkebab-case形式に一致しない場合、不合格にする。.test.tsの接尾辞を許容する。 | behavior_discipline | lint | src/lint/coding-rules.ts:257-257; src/lint/coding-rules.ts:271-274; src/lint/coding-rules.ts:564-572 |
| `RC01-102` | coding-rulesは、sourceまたはtestのASTに明示的any型がある場合、不合格にする。 | behavior_discipline | lint | src/lint/coding-rules.ts:598-606 |
| `RC01-104` | coding-rulesは、sourceの関数・method・constructor等の引数が3個を超える場合、不合格にする。 | behavior_discipline | lint | src/lint/coding-rules.ts:276-283; src/lint/coding-rules.ts:617-624 |
| `RC01-105` | coding-rulesは、sourceのcatchがコメントのない空block、またはthrow文1個だけの場合、不合格にする。 | behavior_discipline | lint | src/lint/coding-rules.ts:286-293; src/lint/coding-rules.ts:625-638 |
| `RC01-171` | runtime-portabilityは、TypeScript compilerOptions.strictがtrueでない場合、不合格にする。 | behavior_discipline | lint | src/lint/runtime-portability.ts:140-148 |
| `RC04-033` | ループadapterは、子プロセスの起動エラーがあれば例外を送出する。 | tooling_runtime | gate | src/orchestration/loop-bridge.ts:116-129 |
| `RC04-035` | ループadapterは、workerの終了statusが0以外なら例外を送出する。 | tooling_runtime | gate | src/orchestration/loop-bridge.ts:165-171; src/orchestration/loop-bridge.ts:200-204 |
| `RC04-085` | directory同期器は、WindowsでEINVAL・EPERM・ENOTSUP・EISDIRとなった場合に限りdirectory fsync例外を無視し、それ以外は再送出する。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:199-207 |
| `RC04-272` | review観測収集器は、GitHub読取りのHTTP応答が成功でなければ失敗する。 | evidence_claim | ci | .github/scripts/collect-claude-review-observation.mjs:9-15 |
| `RC04-279` | bubblewrap導入処理は、未導入時のapt update/installを各180秒に制限し、失敗時は処理を止める。 | tooling_runtime | ci | .github/scripts/install-bubblewrap.sh:3-3; .github/scripts/install-bubblewrap.sh:33-42 |
| `RD00-010` | adapterは、provider実行結果にerrorがある場合、provider_errorとして失敗を返す。 | tooling_runtime | gate | src/runtime/adapter.ts:514-523 |
| `RD00-011` | adapterは、provider終了statusが0以外またはnullの場合、provider_errorとして失敗を返す。 | tooling_runtime | gate | src/runtime/adapter.ts:524-532 |
| `RD00-045` | atomic slice評価は、no_change→delete→configure→reuse→modify→add_codeの選択肢を選択位置まで順に評価していない場合、拒否する。 | behavior_discipline | gate | src/runtime/atomic-slice-admission.ts:98-105; src/runtime/atomic-slice-admission.ts:174-178; src/runtime/atomic-slice-admission.ts:292-292 |
| `RD02-040` | ACP実行器は、子processのerrorまたは結果確定前のcloseを実行失敗として扱う。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:1031-1036 |
| `RD02-054` | 認証回収器は、書戻し中のI/O失敗をerrno付きwrite_errorとして返し、cleanup失敗も別flagとして返す。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:1312-1335; src/runtime/independent-review-fallback.ts:1393-1405 |
| `RD02-185` | artifact生成器は、書込みportが例外を投げた場合にuncertain receiptを返す。 | evidence_claim | gate | src/runtime/lint-effect-executor.ts:492-509 |
| `RD02-250` | provider終了判定器は、割込みsignalを観測した実行を失敗とする。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:75-75 |
| `RD02-252` | provider終了判定器は、errorが記録されている場合にspawn_failedとして失敗とする。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:77-77 |
| `RD02-253` | provider終了判定器は、終了statusが0でない場合に失敗とする。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:78-78 |
| `RD02-260` | provider lifecycle制御器は、追加2秒の確認でもprocess treeを回収できない場合にreap timeout errorを残す。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:12-12; src/runtime/provider-process-lifecycle.ts:352-357; src/runtime/provider-process-lifecycle.ts:382-387 |
| `RD04-128` | isolation実行器は、子processの終了statusが0以外またはnullの場合に失敗を返す。 | tooling_runtime | gate | src/runtime/worker-isolation-broker.ts:792-794 |
| `RD05-220` | ddd-tdd-rulesは、対象PLANのchange_sliceがatomic以外の場合、違反にする。 | behavior_discipline | lint | src/lint/ddd-tdd-rules.ts:597-605 |
| `RD05-233` | dependency-driftは、既存例外として登録されていないmodule循環を検出した場合、失敗させる。 | behavior_discipline | lint | src/lint/dependency-drift.ts:264-273; src/lint/dependency-drift.ts:285-286 |
| `RE01-074` | 旧運用では既存bugを現在の変更へ混ぜず、別Issue・別PRで扱う。 | review_merge | prose | docs/governance/helix-harness-requirements_v1.2.md:1191-1216 |
| `RE01-133` | TypeScript実装者はstrict型検査とBiomeを通し、anyや抑制指定を原則使用しない。例外はpolicyとPLANで扱う。 | behavior_discipline | lint／doctor | docs/governance/helix-harness-requirements_v1.2.md:1924-1933 |
| `RE01-135` | 実装者はファイル名をkebab-caseにし、空catchや単なるrethrowだけのcatchを作らない。失敗を明示・記録・変換するか、fail-openの理由を文書化する。 | behavior_discipline | lint／doctor | docs/governance/helix-harness-requirements_v1.2.md:1924-1933 |
| `RE01-181` | refactor担当者はfeature追加を同じepisodeへ混載しない。 | behavior_discipline | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:112-119; docs/governance/helix-harness-requirements_v1.3.md:507-512 |
| `RG03-007` | 実装者は、ADR-001のTypeScript strict方針を維持する。 | tooling_runtime | prose | AGENTS.md:95-95; CLAUDE.md:44-44 |
| `RG09-007` | lintの実装者は、lintをpureに保つ。 | behavior_discipline | prose | docs/governance/coding-rules.md:141-141 |
| `RG14-004` | workflow保守担当者は、対象workflowを次に変更する直前に、非推奨警告が出ているsetup-nodeの更新を独立して行う。 | tooling_runtime | prose | docs/governance/operations-rule-audit-2026-07-26.md:47-47 |
| `RG18-002` | 実装者はResult<T, E>の方が明確な場合、戻り値にT ｜ null ｜ undefinedを使うことを避ける。 | behavior_discipline | prose | docs/skills/incremental-implementation.md:48-49 |

## 副として対応づいた規則（110件）

`RA-047`、`RA-224`、`RA-286`、`RA-288`、`RA-299`、`RA-300`、`RA-302`、`RB0-016`、`RB0-017`、`RB0-018`、`RB0-023`、`RB0-031`、`RB0-034`、`RB0-041`、`RB0-044`、`RB04-073`、`RB04-122`、`RB04-178`、`RB05-011`、`RB05-020`、`RB05-026`、`RB05-069`、`RB05-086`、`RB05-111`、`RB05-187`、`RB05-214`、`RB05-355`、`RB05-371`、`RB06-055`、`RB06-114`、`RB06-182`、`RB06-204`、`RB07-127`、`RB07-141`、`RB07-196`、`RB07-200`、`RB07-208`、`RB07-228`、`RB07-229`、`RB07-257`、`RB07-326`、`RB07-337`、`RB08-121`、`RB08-129`、`RB08-208`、`RB08-281`、`RB08-293`、`RB08-340`、`RB09-031`、`RB09-063`、`RB09-075`、`RC00-077`、`RC00-099`、`RC00-150`、`RC01-092`、`RC01-093`、`RC01-094`、`RC01-095`、`RC01-097`、`RC01-100`、`RC01-101`、`RC01-179`、`RC02-050`、`RC03-115`、`RC03-116`、`RC04-022`、`RC04-073`、`RC04-102`、`RD00-049`、`RD00-181`、`RD01-029`、`RD01-030`、`RD01-031`、`RD01-043`、`RD01-049`、`RD01-063`、`RD01-064`、`RD01-110`、`RD01-111`、`RD01-114`、`RD01-125`、`RD01-129`、`RD01-131`、`RD01-172`、`RD02-030`、`RD02-041`、`RD02-179`、`RD02-180`、`RD02-181`、`RD02-248`、`RD02-249`、`RD02-267`、`RD03-066`、`RD03-165`、`RD05-004`、`RD05-020`、`RD05-215`、`RD05-234`、`RD07-154`、`RD07-183`、`RD08-074`、`RD11-056`、`RE01-020`、`RE01-134`、`RE01-136`、`RE01-152`、`RG09-005`、`RG09-011`、`RG10-011`、`RG18-003`
