---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSA-02
group: OS検収
product: OS
atoms_primary: 70
atoms_secondary: 46
issue_projection: #1860
---

# RUL-OSA-02（OS検収／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

審査の観点と報告の形式を定める。重大度の順、正しさ・可読性・構造・安全・性能の各観点、根拠となるfileと行、好みをblockerにしない。

## 主として対応づいた規則（70件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-166` | reviewerはbug・risk・behavior regression・missing testsの順に報告し、correctness・要件に影響しないstyleや好みをblockerにしない。 | review_merge | prose | AGENTS.md:221-222; .claude/agents/code-reviewer.md:35-37 |
| `RA-167` | code-reviewerは動作していてもspec・AC違反なら拒否する。 | review_merge | prose | .claude/agents/code-reviewer.md:34-34 |
| `RA-169` | reviewerはCorrectness・Readability・Architecture・Security・Performanceの5軸をすべて確認し、未評価領域を残さない。 | review_merge | prose | .claude/agents/code-reviewer.md:39-42; .claude/agents/code-reviewer.md:113-113; .claude/commands/sdd-review.md:15-24 |
| `RA-170` | code-reviewerは変更意図・影響範囲を確認し、testの有無と妥当性を先に評価してから横断reviewする。 | review_merge | prose | .claude/agents/code-reviewer.md:59-64 |
| `RA-171` | code-reviewerは本番障害・データ破壊・重大security欠陥・重大仕様不達をCritical、merge前品質課題をImportant、任意改善をMinorに分類する。 | review_merge | prose | .claude/agents/code-reviewer.md:44-57 |
| `RA-172` | code-reviewerはCriticalが1件でもあればREQUEST_CHANGESとし、Importantが複数で回避策がない場合も同判定にする。 | review_merge | prose | .claude/agents/code-reviewer.md:100-103 |
| `RA-173` | reviewerは重要所見に対象file・行・根拠・影響・修正案を付け、曖昧な断定を避けて再現可能な粒度で書く。 | review_merge | prose | .claude/agents/code-reviewer.md:74-89; .claude/agents/code-reviewer.md:110-119; .claude/commands/sdd-review.md:26-26 |
| `RA-175` | QAはcoverage gapをcorrectness・要件影響順で報告し、数値目標未達だけをblockerにしない。 | review_merge | prose | .claude/agents/qa-test.md:26-27 |
| `RA-176` | /sdd-review実行者はcurrent changeを対象にdeterministic review packetから開始する。 | review_merge | prose | .claude/commands/sdd-review.md:9-13 |
| `RA-180` | /shipのmain agentはQA coverage gapを照合し、infrastructure・migration・docsを自分で確認する。 | review_merge | prose | .claude/commands/ship.md:40-40 |
| `RA-272` | code-reviewerはverdict・重大度別所見・良い実装最低1件・参照test・静的検査情報・不確実点をreportに含める。 | evidence_claim | prose | .claude/agents/code-reviewer.md:66-98 |
| `RA-364` | L1/L2入力観点の検査者は各画面入力のvalidation・必須任意・型・上限が要求化されているか確認する。 | behavior_discipline | config | .helix/config/requirements-binding.yaml:31-34 |
| `RA-366` | L1/L2異常系観点の検査者はerror表示・空状態・timeout・二重操作の要求を確認する。 | behavior_discipline | config | .helix/config/requirements-binding.yaml:39-42 |
| `RA-367` | L1/L2権限観点の検査者は操作可能主体とaction-binding approval対象操作が明示されているか確認する。 | behavior_discipline | config | .helix/config/requirements-binding.yaml:43-46 |
| `RA-369` | L1/L2data生命周期観点の検査者は生成・更新・削除・保持期限の要求を確認する。 | behavior_discipline | config | .helix/config/requirements-binding.yaml:51-54 |
| `RA-370` | L1/L2検査者は応答時間・可用性等の数値要求がNFR gradeに接地し、画面が前提とする外部API・runtime・library依存が明示されているか確認する。 | behavior_discipline | config | .helix/config/requirements-binding.yaml:55-62 |
| `RB0-063` | 検証担当者は機械検査を定性reviewより先に行い、criticalなDDD/TDD項目には定量証拠とreview証拠の両方を揃える。 | process_gate | prose | docs/governance/ddd-tdd-rules.md:154-154 |
| `RB0-141` | reviewerはbug・risk・behavior regression・missing testsの順に所見を出し、correctnessや要求に影響しない好みを重大所見へ上げない。 | review_merge | prose | docs/skills/judgment-core.md:109-115 |
| `RB0-143` | reviewerは全体品質を確実に改善する変更を承認し、個人的嗜好をNitとして分離してblockingにしない。 | review_merge | prose | docs/skills/judgment-core.md:120-124 |
| `RB0-147` | 敵対reviewの攻撃者は判定分岐・未被覆入力・再確認不能証跡・greenでも要求不達のいずれかを再現条件付きの反例で示す。 | review_merge | prose | docs/skills/adversarial-review.md:39-50 |
| `RB0-148` | 攻撃者は攻撃を構築できない場合、試行した攻撃と不成立理由を最低三件記録してno_attackを宣言する。試行ログのない宣言はOPENとする。 | review_merge | prose | docs/skills/adversarial-review.md:51-52 |
| `RB0-149` | 防御者は提示された成果物・設計・testの引用だけで反駁し、引用で排除できない攻撃には反駁を書かない。 | review_merge | prose | docs/skills/adversarial-review.md:55-61 |
| `RB0-152` | 判定者は三件以上の試行ログ付きno_attackをPASS-WEAKとし、人間確認の優先対象にする。 | review_merge | prose | docs/skills/adversarial-review.md:68-69 |
| `RB0-155` | 敵対reviewerはpartial diffだけで済ませず、常にPLANの全scopeをreviewする。 | review_merge | prose | docs/skills/adversarial-review.md:135-135 |
| `RB04-021` | 専門サブエージェントのレビュアーは各checklist項目をpass/fail/n-aと根拠で記録し、同一モデルであることとcross-agent review不在を明示する。 | evidence_claim | prose／gate | docs/governance/helix-harness-concept_v3.1.md:204-204; docs/governance/helix-harness-concept_v3.1.md:211-218 |
| `RB04-072` | レビュアーはdiffだけに閉じず、変更関数・機能内依存関係・repository横断の重複という3範囲を確認する。 | review_merge | prose | docs/governance/helix-harness-concept_v3.1.md:639-645 |
| `RB04-233` | PRレビュアーは目的と差分の一致、test追加と観点網羅、CI、AI指摘対応、security、運用影響、文書更新を確認する。 | review_merge | prose | docs/governance/ai-dev-team-operations_v1.1.md:1061-1077 |
| `RB05-007` | Domain Gateは監査結果をdomain-audit.mdへ出力する。 | evidence_claim | prose | docs/governance/audit-framework.md:205-207 |
| `RB05-013` | Implementation Gateは実装監査結果をimplementation-audit.mdへ出力する。 | evidence_claim | prose | docs/governance/audit-framework.md:267-267 |
| `RB05-043` | AIレビュー担当は判定・根拠・推奨アクションを構造化レポートへ残し、GHAは機械判定とAI判定の両方を読んでmerge可否を判断する。 | evidence_claim | prose／ci | docs/governance/audit-framework.md:495-496 |
| `RB06-308` | route判断者はlow-drive-confidenceをscope縮小ではなくreview粒度増加として扱い、安いdocs laneだけでriskをcloseしない。 | lane_delegation | prose | docs/governance/helix-l0-l8-design-consistency-audit.md:85-88 |
| `RB07-029` | 検証者は見た目の指摘を整列・近接・階層・一貫性・リズム・フィードバックに分類し、状態、要素、根拠、利用者影響を記して報告する。 | evidence_claim | prose | docs/skills/browser-testing-and-screen-verification.md:74-82 |
| `RB07-084` | 検証者は所見をseverity-firstで分類してから報告する。 | review_merge | prose | docs/skills/test-thinking.md:126-126 |
| `RB07-098` | review・判定用skillは基準ごとに根拠を示してからPASS・FAIL・UNCERTAINを判定させ、総合判定をその集計として出す。 | review_merge | prose | docs/skills/skill-authoring.md:62-64 |
| `RB07-112` | 監査者は権威・安全・完了判定の誤りをCritical、自走停止・証跡欠落・主要退行をHigh、継続的な効率・可搬性・保守性の損失をMediumに分類する。 | review_merge | prose | docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:62-63 |
| `RB07-253` | reviewerはfile読解前にtypecheck・lint・test・doctor・reviewを全て0で終え、失敗した場合は先にauthorへ返す。 | review_merge | prose | docs/skills/code-review.md:33-46 |
| `RB07-254` | reviewerは設計文書を読みpublic function・moduleを契約と照合し、設計からの逸脱をdefectとして扱う。 | review_merge | prose | docs/skills/code-review.md:50-53 |
| `RB07-255` | reviewerはtestが仕様をassertすること、境界条件、gateごとの正負fixture、skipのPLAN根拠を確認する。 | review_merge | prose | docs/skills/code-review.md:55-60 |
| `RB07-257` | reviewerは無説明suppression、hardcoded path、秘密、根拠なしdead codeがなく、commitがConventional Commitsであることを確認する。 | review_merge | prose | docs/skills/code-review.md:74-79 |
| `RB07-258` | reviewerは5軸所見と判定をPLAN証跡へ記録し、CONDITIONALには後続PLANを付け、付かない場合はFAILとする。 | review_merge | prose／gate | docs/skills/code-review.md:81-98 |
| `RB07-275` | 品質reviewerはW3の全test ID対応・skip根拠、W5の設計参照、W7の検証可能な受入条件、W10のcuration記録を確認し、件数だけでW-gateを閉じない。 | review_merge | prose／gate | docs/skills/code-review-and-quality.md:37-49 |
| `RB07-276` | 品質reviewerはtypecheck・lint・test・doctor・vmodel lint・reviewが全てexit 0になるまで実質監査へ進まない。 | review_merge | prose | docs/skills/code-review-and-quality.md:51-64 |
| `RB07-278` | 品質reviewerは変更moduleの設計・test設計とPLAN traceを確認し、Refactor・Retrofitでは根拠なしassertion減少、設計節削除、suppression増加がないことを検査する。 | review_merge | prose | docs/skills/code-review-and-quality.md:74-86; docs/skills/code-review-and-quality.md:105-106 |
| `RB07-308` | 文書監査者はstartup漏出・active consumerのstale・生成伝播driftをP0、二重authority・過大主張・epoch/state driftをP1、未束縛・lifecycle/owner欠落をP2に分類する。 | review_merge | config | docs/governance/effective-agent-startup-followup-registry.json:53-69 |
| `RB08-018` | Refactor担当者はpublic export signatureを触る場合、reviewで下流破壊がないことを確認する。 | review_merge | prose | docs/skills/refactoring.md:67-68 |
| `RB08-209` | 単一runtimeのreview担当者は各checklist項目をpass・fail・n-aで判定し、n-aにも証拠を付け、template証拠欄を実際の文書・test・source・runtime・依存・再利用・workflow確認へ置換する。 | review_merge | prose | docs/skills/review-checklist.yaml:32-61 |
| `RC03-107` | チーム実行処理は、tl、qa、uiuxの出力に厳密形式のVERDICT行がない場合、そのレビューmemberを成功としない。 | review_merge | gate | src/team/run.ts:172-183; src/team/run.ts:523-541 |
| `RC03-108` | チーム実行処理は、tl、qa、uiuxの出力に厳密形式のVERDICT行が複数ある場合、曖昧として成功としない。 | review_merge | gate | src/team/run.ts:178-183; src/team/run.ts:523-541 |
| `RC03-109` | チーム実行処理は、tl、qa、uiuxの一意なVERDICTがPASS以外の場合、そのmemberを成功としない。 | review_merge | gate | src/team/run.ts:183-183; src/team/run.ts:523-541 |
| `RC03-121` | 単一runtimeの判断ゲートは、checklistが提供されていない場合、通過を拒否する。 | review_merge | gate | src/gate/review-tier.ts:83-86; src/gate/review-tier.ts:142-154; src/gate/review-tier-policy.ts:1-3 |
| `RC03-123` | レビューchecklist検証処理は、DOC、TST、COD、XR、DEP、DUP、MODのいずれかが欠けている場合、checklistを拒否する。 | review_merge | gate | src/gate/review-tier.ts:40-48; src/gate/review-tier.ts:83-86; src/gate/review-tier-policy.ts:3-3 |
| `RC03-124` | 単一runtimeの判断ゲートは、DOC checkがfail、またはn-aなのに非空のevidenceがない場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:89-99; src/gate/review-tier-policy.ts:3-3 |
| `RC03-125` | 単一runtimeの判断ゲートは、TST checkがfail、またはn-aなのに非空のevidenceがない場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:89-99; src/gate/review-tier-policy.ts:3-3 |
| `RC03-126` | 単一runtimeの判断ゲートは、COD checkがfail、またはn-aなのに非空のevidenceがない場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:89-99; src/gate/review-tier-policy.ts:3-3 |
| `RC03-127` | 単一runtimeの判断ゲートは、XR checkがfail、またはn-aなのに非空のevidenceがない場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:89-99; src/gate/review-tier-policy.ts:3-3 |
| `RC03-128` | 単一runtimeの判断ゲートは、DEP checkがfail、またはn-aなのに非空のevidenceがない場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:89-99; src/gate/review-tier-policy.ts:3-3 |
| `RC03-129` | 単一runtimeの判断ゲートは、DUP checkがfail、またはn-aなのに非空のevidenceがない場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:89-99; src/gate/review-tier-policy.ts:3-3 |
| `RC03-130` | 単一runtimeの判断ゲートは、MOD checkがfail、またはn-aなのに非空のevidenceがない場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:89-99; src/gate/review-tier-policy.ts:3-3 |
| `RC04-111` | pair-agentは、smart_review出力にVERDICTマーカーが無ければerrorにする。 | review_merge | gate | src/orchestration/pair-agent.ts:546-549 |
| `RD00-270` | review receipt検証は、blockなのにblocker数が0の場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:579-581 |
| `RD02-056` | レビュー出力検証器は、blocker_countがfindings件数と一致しない場合に拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1434-1436 |
| `RD08-007` | L14 close audit lintは、監査表にitem、question、evidence、gap、boundary、next、statusのいずれかの列がない場合、失敗させる。 | process_gate | lint | src/lint/l14-close-audit.ts:158-174 |
| `RD08-048` | left-arm carry lintは、指摘summaryの前後空白を除いた長さが10文字未満の場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:292-293 |
| `RD09-125` | proposal-document-coverageは、nfr-qualityを期待するシナリオでnfr-quality-reviewがrequired_gatesにない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage-policy.ts:73-73; src/lint/proposal-document-coverage.ts:169-178 |
| `RD09-141` | verification evidence投影は、外部findingのseverityがerror・warn・info以外または未指定の場合、warnへ正規化して保持する。 | evidence_claim | lint | src/lint/relation-graph-evidence.ts:199-208 |
| `RD10-082` | S4 lintはstakeholder_review_or_proxyにreviewの根拠語とreviewerまたはproxy主体の語がそろわなければ失敗させる。 | review_merge | lint | src/lint/s4-decision-readiness.ts:363-381 |
| `RF01-006` | ツール契約監査のメッセージ生成器は、監査失敗時に違反総数を表示するが、個別の違反内容は先頭8件までに制限する。 | tooling_runtime | gate | src/orchestration/tool-contract.ts:224-235 |
| `RG13-007` | 認識リスク監査者はscannerの初期機械dispositionを最終判定に使わず、全文レビュー後のfinal dispositionを用いる。 | evidence_claim | prose | docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md:7-7 |
| `RG18-012` | reviewerはartifactが誤っているという出発点で検証し、動作していてもspecまたはAC違反があれば拒否する。 | review_merge | prose | docs/skills/judgment-core.md:109-110 |
| `RG18-013` | reviewerとjudgeはCorrectness・Readability・Architecture・Security・Performanceの5軸を横断してレビューする。 | review_merge | prose | docs/skills/judgment-core.md:132-141 |

## 副として対応づいた規則（46件）

`RA-005`、`RA-168`、`RA-174`、`RA-251`、`RA-365`、`RA-368`、`RB0-142`、`RB0-151`、`RB0-156`、`RB04-020`、`RB04-115`、`RB04-155`、`RB05-012`、`RB05-030`、`RB05-049`、`RB06-269`、`RB07-039`、`RB07-100`、`RB07-105`、`RB07-166`、`RB07-210`、`RB07-256`、`RB07-259`、`RB07-277`、`RB07-279`、`RB07-331`、`RB08-187`、`RC0-100`、`RC00-011`、`RC00-237`、`RC03-070`、`RC03-110`、`RC03-122`、`RC04-118`、`RC04-119`、`RD02-059`、`RD03-078`、`RD03-089`、`RD08-008`、`RD08-012`、`RD08-013`、`RD08-014`、`RD09-140`、`RE01-149`、`RG08-005`、`RG09-001`
