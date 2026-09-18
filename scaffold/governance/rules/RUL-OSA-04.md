---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSA-04
group: OS検収
product: OS
atoms_primary: 87
atoms_secondary: 56
issue_projection: #1860
---

# RUL-OSA-04（OS検収／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

統合の許可を定める。自動mergeを使わず、審査側が最新の対象・審査・CI・記録を照合して明示的に統合する。統合を妨げるのは未解消のblocker（正しさ、要求、安全、必須の検査に関わる指摘）であり、処分済みの任意改善と後続へ分けた事項は妨げない。

## 主として対応づいた規則（87件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-156` | PR作成側は必要な承認・current HEADの独立AI-B review・CI・DB追従が揃ってからReady化する。 | review_merge | prose | AGENTS.md:320-321; CLAUDE.md:198-199 |
| `RA-157` | エージェントはGitHub native auto-mergeを使わず、AI-Bが最終証拠を再照合して明示mergeする。 | review_merge | prose | AGENTS.md:322-322; CLAUDE.md:200-200; .claude/CLAUDE.md:119-120 |
| `RA-160` | AI-Bはreview receiptをPR commentへ記録し、AI-AはPLANのreview_evidenceとreview_bindingへ機械転記し、AI-Bは最終HEADで一致を再照合する。 | review_merge | prose | AGENTS.md:325-327; CLAUDE.md:203-205; .claude/CLAUDE.md:117-118 |
| `RA-165` | 旧main運用はstrictなharness-checkとadminへの保護を要求し、人間approveを不要とする一方、force-pushとbranch削除を禁止する。 | review_merge | prose／ci | AGENTS.md:317-319; CLAUDE.md:195-197 |
| `RB0-019` | reviewerはtarget経路の型検査・lint・テスト・doctorがgreenになる前に承認してはならず、旧Bunのgreenで代替しない。 | evidence_claim | prose | docs/governance/coding-rules.md:6-8; docs/governance/coding-rules.md:17-17; docs/governance/coding-rules.md:138-138 |
| `RB0-064` | main更新者はPRを経由し、required check・PR context・独立review・Issue closure証拠を同じPR headへ束縛する。 | review_merge | prose | docs/governance/github-operation-rules.md:10-10 |
| `RB0-065` | 旧GitHub運用では、admission・必要なreview証拠・required CIが同一headで揃った後だけnative auto-mergeを使用できる。 | review_merge | prose | docs/governance/github-operation-rules.md:12-12 |
| `RB0-066` | admission担当者はCI red・stale receipt・head変更・scope不一致の場合にmergeを許可しない。 | review_merge | prose／gate | docs/governance/github-operation-rules.md:13-13; docs/governance/github-operation-rules.md:75-75 |
| `RB0-068` | PR担当者はauthor/runtimeの書換えや架空receiptでadmission制約を回避してはならない。 | safety_security | prose | docs/governance/github-operation-rules.md:18-20; docs/governance/github-operation-rules.md:74-74 |
| `RB0-069` | 旧Claude作成PRは実際のauthor/runtimeを保持してCodex laneへ委譲し、Codexがcurrent-head条件を再照合してready/mergeを担う。 | lane_delegation | prose | docs/governance/github-operation-rules.md:16-20 |
| `RB0-078` | 外部author PRの担当者はPRをDraftにして対象headのCI完了とgreenを待ち、それ以前のreview receiptを有効な証拠にしない。 | review_merge | prose／gate | docs/governance/github-operation-rules.md:66-66 |
| `RB0-080` | 外部author PRの担当者はreceipt・scope・CI・head・closure条件が一致してからReady化し、head変更時は手順を最初からやり直す。 | review_merge | prose／gate | docs/governance/github-operation-rules.md:68-68 |
| `RB04-180` | PRはCODEOWNERSでreviewerを指定し、CI後にAIレビュー、AI実装・保守の確認、必要時TL/QA、承認の順でmergeへ進める。 | review_merge | prose／config | docs/governance/ai-dev-team-operations_v1.1.md:291-291; docs/governance/ai-dev-team-operations_v1.1.md:320-343 |
| `RB04-181` | merge担当者はSquash and Mergeを基本とし、Merge commit/Rebaseを原則使わず、PR作成者がmergeを実行する。 | review_merge | prose | docs/governance/ai-dev-team-operations_v1.1.md:345-353 |
| `RB04-182` | CIと承認が揃ったら自動mergeする設定を使用してよい。 | review_merge | prose／config | docs/governance/ai-dev-team-operations_v1.1.md:351-351 |
| `RB04-225` | hotfixでもlint/testを省略せずCIを通し、一名以上の即時承認後にmerge/deployし、収束後に通常観点の事後レビューと観点追加を行う。 | review_merge | prose／ci | docs/governance/ai-dev-team-operations_v1.1.md:972-982 |
| `RB04-234` | merge担当者は承認とCI通過に加え、最新main取込みと競合解消、merge後動作、rollback手段を確認する。 | review_merge | prose | docs/governance/ai-dev-team-operations_v1.1.md:1079-1089 |
| `RB04-280` | 基盤担当者はmainを直接push禁止・PR必須・CI必須で保護し、branch命名とConventional Commitsをagent規則へ記載し、merge方式を統一する。 | review_merge | prose／config | docs/governance/ai-dev-team-concept_v1.1.md:635-643 |
| `RB05-034` | PR Gateは各Gateの成功、必要な三点一致、rollback計画の存在、未解決リスクがないことを通過条件とする。 | review_merge | gate | docs/governance/audit-framework.md:360-364 |
| `RB05-036` | Merge Gateは全Gate成功、必要な三点一致、機能safe、DB・認証権限・deploy変更なし、unknownなし、rollback計画あり、PRサイズ基準内の場合だけsafe候補にする。 | review_merge | gate／ci | docs/governance/audit-framework.md:375-384 |
| `RB05-037` | Merge GateはGate失敗、Domain danger、機能変更のdocs/tests不足、DB・認証権限・deploy・GHA・secrets変更、unknownファイル、rollback計画欠落をブロックする。 | review_merge | gate／ci | docs/governance/audit-framework.md:386-392 |
| `RB05-051` | safeであってもGitHub native auto-mergeを設定せず、AI-Bがcurrent HEAD・review・CI・DB receiptを再照合して明示mergeする。 | review_merge | prose | docs/governance/audit-framework.md:530-530 |
| `RB05-062` | packet merge後はreview HEADとmerge HEADのtree同一性をread-after-mergeで確認する。 | review_merge | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:186-189 |
| `RB05-075` | L3承認前のDraft PRは非正本review proposalとして許すが、Ready化とmergeは必要な承認・current HEAD独立AI-B review・CI・DB追従が揃った後だけ許す。 | review_merge | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:378-379 |
| `RB05-076` | merge担当AI-BはGitHub native auto-mergeを使わず、current HEADの証拠を再照合して明示mergeする。 | review_merge | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:380-380 |
| `RB05-327` | commit・push・main mergeは明示path staging、status・staged diff確認、Conventional Commit、必要review・approvalを満たしてから行う。 | review_merge | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:7-9 |
| `RB05-342` | review・approval・CI gateが成立していない状態でmainへmergeしない。 | review_merge | prose／gate | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:378-380 |
| `RB06-233` | merge担当者はreview・approval・CI gateが未成立ならmain mergeを行わない。 | review_merge | prose | docs/governance/helix-objective-evidence-audit.md:162-164 |
| `RB08-276` | AI-Bはreview receiptをPR commentへ記し、AI-Aは意味を変えずPLANへ転記してReady化し、AI-Bが最終HEADで転記一致を再確認する。 | review_merge | prose | docs/governance/operations-rule-audit-2026-07-26.md:49-49; docs/governance/operations-rule-audit-2026-07-26.md:57-59 |
| `RB08-277` | 修正push後は旧receiptをstale化し、新HEADでreview・CI・DB追従を一巡する。新しい独立blockerがなければ改善提案でHEADを動かさずAI-Bが明示mergeする。 | review_merge | prose | docs/governance/operations-rule-audit-2026-07-26.md:58-59; docs/governance/operations-rule-audit-2026-07-26.md:34-34 |
| `RB08-291` | quota handoverはquotaだけを移しmerge authorityを移さず、base HEAD・CI・review・DB receiptを再判定して違反を拒否する。 | escalation_authority | gate | docs/governance/issue-214-slot-scheduler-closure.md:23-25 |
| `RB08-310` | review対応者は#519完了まで親#489をcloseせず、#514完了だけで別blockerを持つPR #506をReady/mergeせず、吸収済みPR #518をmergeしない。 | review_merge | prose | docs/governance/issue-514-cross-review-admission-symmetry-closure.md:45-51 |
| `RC0-039` | Git hookは、直接のgh pr mergeを拒否し、review receiptを受け取る専用merge通路を要求する。 | review_merge | hook | src/runtime/git-command-guard.ts:46-48; src/runtime/git-command-guard-hook.ts:205-212 |
| `RC00-125` | review feedback分類器は、既知sessionに属する未解決のmerge conflictをblocked状態にする。 | review_merge | gate | src/runtime/review-feedback-session-intake.ts:60-65 |
| `RC04-163` | Green判定器は、算出Green時刻がreview時刻より後なら失敗する。 | review_merge | gate | src/workflow/contracts.ts:202-210 |
| `RC04-244` | CIは、PRのcurrent HEAD独立review admissionがsuccess以外なら、専用enforcement stepで失敗させる。 | review_merge | ci | .github/workflows/harness-check.yml:326-407; .github/workflows/harness-check.yml:568-578 |
| `RD00-255` | PR収束処理は、mergeコマンドにmerge方式とreview済みHEADの一致条件を付与する。 | review_merge | config | src/runtime/claude-pr-convergence.ts:408-408 |
| `RD00-269` | review receipt検証は、approveなのにblocker数が0でない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:576-578 |
| `RD00-308` | merge判定は、現在stateとreceiptのrepositoryが一致しない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1424-1424 |
| `RD00-309` | merge判定は、現在stateとreceiptのPR番号またはPR URLが一致しない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1425-1427 |
| `RD00-310` | merge判定は、現在PR HEADとreview receipt HEADが異なる場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1428-1428 |
| `RD00-311` | merge判定は、PRがOPENでない場合、拒否する。review済みHEADを第2親に持つmerge済みPRは専用理由で区別する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1429-1435 |
| `RD00-312` | merge判定は、required checksがgreenでない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1436-1436 |
| `RD00-313` | merge判定は、receiptのCIが現在HEADに対応しない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1437-1437 |
| `RD00-314` | merge判定は、receiptのCIが照合対象のCI世代に対応しない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1438-1440 |
| `RD00-315` | merge判定は、review receipt履歴が取得されていない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1441-1442 |
| `RD00-316` | merge判定は、receiptがapproveでない、またはblocker数が0でない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1448-1450 |
| `RD00-317` | merge判定は、receiptのCI conclusionがsuccessでない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1451-1451 |
| `RD00-318` | merge判定は、receiptのDB convergenceが偽の場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1452-1452 |
| `RD01-225` | Git guard hookは、直接のgh pr mergeを拒否し、receiptを使うHELIX merge通路を要求する。 | review_merge | hook | src/runtime/git-command-guard-hook.ts:205-212 |
| `RD01-266` | Kimi provenance検証は、admission verifierのdigest・HEAD・approve・blockerゼロ・comment束縛・日時順序がadmission契約と整合しなければ失敗する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:348-365 |
| `RD01-275` | review候補検証は、receiptが参照するCI runを取得できなければ候補を拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:509-510 |
| `RD01-277` | review候補検証は、receiptのrepositoryが対象repositoryと異なれば拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:519-519 |
| `RD01-278` | review候補検証は、receiptのPR番号が対象PRと異なれば拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:520-520 |
| `RD01-280` | review候補検証は、CI成功またはDB収束をreceiptが示していなければ拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:522-524 |
| `RD01-282` | review候補検証は、comment・review・CIの時刻が不正、comment更新が作成より前、reviewがcomment更新より後、またはCI完了がreviewより後なら拒否する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:535-543; src/runtime/github-cross-review-admission.ts:569-574 |
| `RD01-283` | review候補検証は、CIが対象HEAD・PRのharness-check pull_request runでない、またはcompleted・successでなければ拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:544-554 |
| `RD01-284` | review候補検証は、CI runのID・attempt・更新時刻が最新成功世代選択結果と異なれば拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:555-555; src/runtime/github-cross-review-admission.ts:801-823 |
| `RD01-285` | 現在Claude receiptの候補検証は、記載CI世代のrun ID・attempt・conclusionが実CIと一致しなければ拒否する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:556-568 |
| `RD01-286` | review候補検証は、verdictがapproveでない、またはblocker件数が0でない場合に拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:575-577 |
| `RD01-287` | cross-review admissionは、PRがOPENでなければ拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:584-591 |
| `RD01-288` | cross-review admissionは、OPENのDraft PRではreview受入検証をdeferredとして保留する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:592-594 |
| `RD01-289` | cross-review admissionは、非Draft PRに抽出可能なreview receiptがない、または有効なreceiptが1件もない場合に拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:608-619; src/runtime/github-cross-review-admission.ts:685-694 |
| `RD01-290` | cross-review admissionは、対象PR・HEADに未解消のblock receiptがあれば、他の成功条件を満たさないblockも保持して拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:629-652 |
| `RD01-292` | 単一runtime authorshipのadmissionは、有効review receiptが複数ある場合に競合として拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:685-694 |
| `RD01-297` | merge後再読判定は、報告merge commitまたは取得merge commitが欠落、あるいは両者が異なればverifiedにしない。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:715-721 |
| `RD01-298` | merge後再読判定は、merge parentsにreview済みcandidate HEADが含まれなければverifiedにしない。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:722-724 |
| `RD01-299` | merge後再読判定は、merge treeが欠落またはcandidate treeと異なればverifiedにしない。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:725-727 |
| `RD02-055` | レビュー出力検証器は、approveとblocker_countが0であることの真偽が一致しない場合に拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1430-1433 |
| `RD02-067` | 中立receipt検証器とmerge判定器は、approveでない、またはblockerが0でないレビューを拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1655-1656; src/runtime/independent-review-fallback.ts:1745-1747 |
| `RD02-068` | 中立receipt検証器は、CI結論がsuccessでない証跡を拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1657-1662 |
| `RD02-069` | 中立receipt検証器とmerge判定器は、DB収束が確認されていない場合に拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1658-1662; src/runtime/independent-review-fallback.ts:1748-1749 |
| `RD02-075` | 中立レビューmerge判定器は、receiptをadvisory専用として扱い、他条件が成立してもmerge可能とは判定しない。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1735-1749 |
| `RD02-076` | 中立レビューmerge判定器は、PR番号またはrepositoryがreceiptと異なる場合に失敗理由を返す。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1736-1738 |
| `RD02-077` | 中立レビューmerge判定器は、PRがOPENでない場合に失敗理由を返す。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1740-1740 |
| `RD02-078` | 中立レビューmerge判定器は、required checksがgreenでない場合に失敗理由を返す。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1741-1741 |
| `RD03-070` | frontier再計算は、dispatcherがmerge順序の決定を要求した場合、他の判定に進まず拒否する。 | escalation_authority | gate | src/runtime/slot-scheduler-quota-handover.ts:583-593 |
| `RD03-073` | frontier再計算は、CI成功・review承認・有効なDB receipt digestが揃わない場合、拒否する。 | process_gate | gate | src/runtime/slot-scheduler-quota-handover.ts:606-612 |
| `RD04-021` | 親受入判定器は、レビューverdictがapproveでない場合に受入を拒否する。 | review_merge | gate | src/runtime/work-graph-receipt-acceptance.ts:393-395 |
| `RD11-183` | terminal fullback監査は、Forward sliceのreview verdictがnullの場合に失敗させる。 | review_merge | lint | src/lint/workflow-classification-terminal-fullback.ts:247-253 |
| `RD11-184` | terminal fullback監査は、reviewがapproveでない、HEADまたはCI run IDが一致しない、またはreceipt digestが不正な場合に失敗させる。 | review_merge | lint | src/lint/workflow-classification-terminal-fullback.ts:253-264 |
| `RE01-077` | 旧運用の作成者はG7通過後にPRをReady化してmergeへ進め、deploymentはPO判断に委ねる。 | review_merge | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:1223-1229 |
| `RE01-259` | merge判断者はCI成功だけでmergeせず、current HEADの独立reviewとDB追従を確認する。push・base・authority・digestが変わったreceiptはstaleとして扱う。 | review_merge | gate | docs/governance/helix-harness-requirements_v1.3.md:516-518 |
| `RE01-261` | 作成者は承認前でも非正本proposalとしてDraft PRを作れるが、必要な承認・exact HEAD review・CI・DBが揃うまでReady化しない。 | review_merge | gate | docs/governance/helix-harness-requirements_v1.3.md:518-518 |
| `RE01-262` | GitHub運用者はnative auto-mergeを使用せず、AI-Bが証拠を再照合して明示的にmergeする。 | review_merge | prose／config | docs/governance/helix-harness-requirements_v1.3.md:518-518 |
| `RG10-008` | ship commandの是正担当者は、intra-runtime helperによる独自のGO判断を禁止する。 | escalation_authority | config | docs/governance/effective-agent-startup-followup-registry.json:91-91 |
| `RG10-017` | PR admissionはDraft状態のPRについてready／mergeをblockする。 | review_merge | prose／gate | docs/governance/github-operation-rules.md:72-75 |

## 副として対応づいた規則（56件）

`RA-154`、`RA-155`、`RA-159`、`RA-172`、`RB0-081`、`RB04-175`、`RB04-201`、`RB05-024`、`RB05-027`、`RB05-035`、`RB05-043`、`RB05-045`、`RB05-072`、`RB05-143`、`RB06-024`、`RB07-019`、`RB07-092`、`RB07-219`、`RB09-001`、`RC0-108`、`RC00-184`、`RC02-037`、`RD00-249`、`RD00-250`、`RD00-251`、`RD00-252`、`RD00-253`、`RD00-254`、`RD00-272`、`RD00-273`、`RD01-263`、`RD01-267`、`RD01-268`、`RD01-272`、`RD01-274`、`RD01-276`、`RD01-279`、`RD01-281`、`RD01-291`、`RD01-293`、`RD01-295`、`RD01-296`、`RD02-001`、`RD02-079`、`RD02-268`、`RD03-072`、`RD04-017`、`RD04-019`、`RD04-022`、`RD04-024`、`RE01-046`、`RE01-055`、`RE01-069`、`RE01-113`、`RE01-255`、`RG09-003`
