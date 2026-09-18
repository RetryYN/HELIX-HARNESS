---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 883ff184a90f40c844e8737a4dee49915a46cceae764d8b7cc5bd0f0fbdd85a3
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSA-03
group: OS検収
product: OS
atoms_primary: 34
atoms_secondary: 37
issue_projection: #1860
---

# RUL-OSA-03（OS検収／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

指摘の処分を定める。同じ責務で局所的に閉じるものは今の変更で直し、独立の責務だけ後続へ分ける。blockerは同じ対象について一括で返す。修正後の再判定は、新しい独立のblockerが実証されない限り一巡とし、実証された場合は再審査する。審査後に対象が変われば審査をstaleにする。

## 主として対応づいた規則（34件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-161` | AI-Bは同一HEADのblockerを一括返却し、新たな独立blockerの実証がなければ修正後HEADを一巡だけ再判定する。 | review_merge | prose | n/a | AI-B収束review | — | AGENTS.md:327-328; CLAUDE.md:205-206; .claude/CLAUDE.md:125-126 | A／gpt-6-astra |
| `RA-162` | 作成側は契約違反・correctness/security/data loss・必須oracle失敗・main退行・虚偽完了証拠と、同責務同scopeで局所解決できるfindingをcurrent PR内で直す。 | review_merge | prose | n/a | — | — | AGENTS.md:329-331; CLAUDE.md:207-209; .claude/CLAUDE.md:121-123 | A／gpt-6-astra |
| `RA-163` | review対応者は独立責務・別設計・lifecycle・性能改善だけを別episodeのIssueにし、current PRへ再流入させない。 | review_merge | prose | n/a | episode | `RUL-TKT-03` | AGENTS.md:331-332; CLAUDE.md:209-210; .claude/CLAUDE.md:124-124 | A／gpt-6-astra |
| `RB0-144` | reviewerとauthorは対立を放置せず、証拠を追加するかescalateする。 | review_merge | prose | n/a | — | — | docs/skills/judgment-core.md:121-124 | B／gpt-6-astra |
| `RB0-150` | 判定者は反駁されない攻撃が一件でもあればFLAGとして是正へ送り、攻撃記録の編集・削除で握りつぶしてはならない。 | review_merge | prose | n/a | FLAG | `RUL-OSI-01` | docs/skills/adversarial-review.md:65-66 | B／gpt-6-astra |
| `RB04-205` | 既存bugが顕在化した場合は別Issue・別PRで修正し、今回のPRへ含めない。 | review_merge | prose | n/a | 既存bugの一律scope外扱い | `RUL-TKT-03` | docs/governance/ai-dev-team-operations_v1.1.md:706-706 | B04／gpt-6-astra |
| `RB05-040` | 開発運用者はPR段階の不一致をブロックして修正し、main混入後の仕様矛盾・テスト不足・危険変更・unknown・想定外の認証DB変更・重大規約違反をrevert候補として検討する。 | review_merge | prose | n/a | — | `RUL-TKT-03` | docs/governance/audit-framework.md:438-451 | B05／gpt-6-astra |
| `RB05-146` | finding処理は現contract内の局所修正をwriterへ返し、独立改善だけをsuccessor Issue・Reverse・memory要約・queueへ同一causalityで昇格する。 | review_merge | prose | n/a | 未実装current_pr_fix／successor_issue | `RUL-OSI-01`、`RUL-TKT-03` | docs/governance/infinity-loop-system-assertion-cases.md:49-49; docs/governance/infinity-loop-system-assertion-cases.md:351-351 | B05／gpt-6-astra |
| `RB05-251` | Claude監査と独立reviewによるfinding dispositionはevidence付き非終端receiptとappeal routeを残す。 | review_merge | prose | n/a | 未実装finding appeal契約 | `RUL-OSI-01` | docs/governance/infinity-loop-system-assertion-cases.md:367-367 | B05／gpt-6-astra |
| `RB06-025` | Admission処理はreview後の変更でreviewとreceiptをstale化し、未解消FLAGがある場合はAdmissionを許可しない。 | review_merge | prose | fail_close | — | `RUL-COR-02` | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:235-236; docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:253-253 | B06／gpt-6-astra |
| `RB06-110` | finding処理はcurrent_pr_fixをwriterへ返し、successor_issueだけをIssue・Reverse・memory要約・queueへ同一causalityで原子的に昇格し、部分生成時はreadyを作らない。 | review_merge | prose | fail_close | 未実装FindingPromotionPipeline | `RUL-TKT-03`、`RUL-COR-03` | docs/governance/infinity-loop-assertion-coverage-ledger.md:47-47; docs/governance/infinity-loop-assertion-coverage-ledger.md:98-98 | B06／gpt-6-astra |
| `RB06-133` | 監査担当者はfinding dispositionに証拠付き非終端receiptとappeal routeを残す。 | review_merge | prose | fail_close | 未実装ClaudeAuditAdapter | — | docs/governance/infinity-loop-assertion-coverage-ledger.md:77-77 | B06／gpt-6-astra |
| `RB07-100` | 判定者は多数決で敵対検証の未反駁攻撃を上書きせず、成立した攻撃や反例がない裁量判断に限って多数決を用いる。 | review_merge | prose | fail_close | adversarial-review／FLAG | `RUL-OSA-02` | docs/skills/skill-authoring.md:70-74 | B07／gpt-6-astra |
| `RB07-198` | 担当者はguardrail所見をcommentで黙らせず、accept前に根因修正を反映する。 | process_gate | prose | fail_close | helix guardrail | `RUL-OSP-05`、`RUL-OSA-05` | docs/skills/security.md:115-116 | B07／gpt-6-astra |
| `RB08-229` | review担当者は現在契約blockerでない改善findingを後続Issueへ送り、現在PRを循環させない。 | review_merge | prose | n/a | — | `RUL-TKT-03` | docs/governance/drive-route-catalog.md:85-85 | B08／gpt-6-astra |
| `RB08-275` | finding処置担当者は現在契約違反と同一責務内の局所correctness/securityを現在PRで修正し、独立責務・別設計・lifecycle・性能・将来改善だけを後続Issueへ分離する。 | review_merge | prose | n/a | current_pr_fix/successor_issue | `RUL-TKT-03` | docs/governance/operations-rule-audit-2026-07-26.md:55-56 | B08／gpt-6-astra |
| `RC00-012` | 候補検証評議は、risk findingが1件以上ある候補を拒否し警告する。 | process_gate | gate | fail_close | risk_findingsの件数判定 | `RUL-OSA-06` | src/runtime/parallel-candidate-verifier-council.ts:40-41; src/runtime/parallel-candidate-verifier-council.ts:48-54 | C00／gpt-6-astra |
| `RC04-115` | pair-agentは、直前のlight_implementationが相談によるpendingの場合、そのままsmart_reviewがpassを出すことを拒否する。 | review_merge | gate | fail_close | — | — | src/orchestration/pair-agent.ts:541-545; src/orchestration/pair-agent.ts:573-575 | C04／gpt-6-astra |
| `RC04-116` | pair-agentは、相談後のsmart_reviewがfailまたはpendingを出す場合、相談応答・修正指示マーカーが無ければerrorにする。 | lane_delegation | gate | fail_close | — | `RUL-OSP-01` | src/orchestration/pair-agent.ts:577-585 | C04／gpt-6-astra |
| `RC04-117` | pair-agentは、smart_reviewのpendingに継続指示マーカーが無ければerrorにする。 | lane_delegation | gate | fail_close | — | `RUL-OSP-01` | src/orchestration/pair-agent.ts:586-594 | C04／gpt-6-astra |
| `RC04-119` | pair-agentは、smart_reviewのfailに修正指示マーカーが無ければerrorにする。 | review_merge | gate | fail_close | — | `RUL-OSA-02` | src/orchestration/pair-agent.ts:601-609 | C04／gpt-6-astra |
| `RD00-047` | atomic slice評価は、登録されたblocker分類のdispositionがcurrent_blocker以外の場合、current_blocker_deferredとして拒否する。 | review_merge | gate | fail_close | security／data_loss／correctness／authority_drift | — | src/runtime/atomic-slice-admission.ts:292-295 | D00／gpt-6-astra |
| `RD00-251` | PR収束処理は、同一PR・HEADのblock receiptを、同じreviewer sessionによる後時刻の非block receiptが現れるまで未解消として保持する。 | review_merge | gate | fail_close | unresolvedClaudePrBlockReceipts | `RUL-OSA-04` | src/runtime/claude-pr-convergence.ts:367-394; src/runtime/claude-pr-convergence.ts:1441-1444 | D00／gpt-6-astra |
| `RD08-044` | left-arm carry lintは、carry判断のassessed_atが一致レビューのreviewed_atより後の場合、失敗させる。 | review_merge | lint | fail_close | 日時文字列の大小比較 | `RUL-COR-02` | src/lint/left-arm-carry-log.ts:264-266 | D08／gpt-6-astra |
| `RD08-062` | left-arm carry lintは、解消レビューのtests_green_atがない、gate再通過がtests_green_atより後、またはtests_green_atがreviewed_atより後の場合、失敗させる。 | review_merge | lint | fail_close | 完了日時の文字列比較 | `RUL-FRM-04` | src/lint/left-arm-carry-log.ts:411-422 | D08／gpt-6-astra |
| `RD09-022` | pin-chain導出は、reviewed-safe対象が変更され、そのcontentDigestがliveと異なるか対象がない場合、semantic review pinをstaleとしてrequires_reassessmentを返す。 | review_merge | lint | warn | REVIEWED_SAFE_DISPOSITIONS、contentDigest | `RUL-COR-02` | src/lint/pin-chain-derivation.ts:193-213 | D09／gpt-6-astra |
| `RD09-145` | relation graph投影は、design catalogのreviewed digestがstaleの場合、独立再評価が必要なerrorを返し、impact分析を失敗させる。 | review_merge | lint | fail_close | reviewed-digest-stale | `RUL-COR-02`、`RUL-OSA-01` | src/lint/relation-graph.ts:233-243; src/lint/relation-graph.ts:712-715; src/lint/relation-graph.ts:761-767 | D09／gpt-6-astra |
| `RE01-088` | 下流のfindingを受けた担当者は局所修正・設計・要求・Conceptのどこへ戻すか分類し、back-propagationが未解決のまま完了にしてはならない。 | process_gate | prose／doctor | fail_close | 下流findingの四分類 | `RUL-OSI-01` | docs/governance/helix-harness-requirements_v1.2.md:1292-1305 | E01／claude-opus |
| `RE01-141` | レビュー担当者はfindingを対応テストまたは追跡可能なdebtへ変換し、指摘だけで処理を終えない。 | review_merge | prose／ci | warn | failureからtest/design/recovery/debtへの変換 | `RUL-OSI-01` | docs/governance/helix-harness-requirements_v1.2.md:1952-1990; docs/governance/helix-harness-requirements_v1.2.md:2333-2348 | E01／claude-opus |
| `RE01-222` | authoring判断者はsemantic diff・authority・revision・trace・pair影響・security・rollbackを評価し、規定の六つのdispositionから一つを選ぶ。 | process_gate | gate | fail_close | authoring disposition判定 | `RUL-FRM-02` | docs/governance/helix-harness-requirements_v1.3.md:354-354 | E01／claude-opus |
| `RE01-257` | reviewerは同じHEADのblockerを一括返却し、修正後HEADは新しい独立blockerの実証がない限り一巡だけ再判定する。 | review_merge | prose | n/a | HEAD単位のreview収束規約 | — | docs/governance/helix-harness-requirements_v1.3.md:516-516 | E01／claude-opus |
| `RE01-258` | 作成者は契約違反・correctness・security・data loss・必須oracle失敗・虚偽証拠、および同じ責務とscope内で安全に閉じるfindingをcurrent PRで修正する。独立責務の改善だけを別episodeへ分ける。 | review_merge | prose／gate | fail_close | current PR finding disposition | — | docs/governance/helix-harness-requirements_v1.3.md:516-516 | E01／claude-opus |
| `RF01-001` | pair-agentの計画生成器は、maxFixCyclesが未指定の場合、難易度trivial・simpleでは1、standardでは2、complexでは3、criticalでは4を修正サイクル上限にする。 | tooling_runtime | config | n/a | 旧難易度区分とmaxFixCyclesの対応値 | `RUL-OSP-07` | src/orchestration/pair-agent.ts:128-140; src/orchestration/pair-agent.ts:203-212 | F01／claude-opus |
| `RG14-003` | finding promotionの是正担当者は、L1／L3／L4／L5をcurrent_pr_fix／successor_issueへ同期し、実装されるまではadapter markerでfail-closeを維持する。 | process_gate | prose／gate | fail_close | ORA-009、finding promotion設計、adapter marker | `RUL-OSI-01` | docs/governance/operations-rule-audit-2026-07-26.md:42-42 | G14／claude-opus |

## 副として対応づいた規則（37件）

`RA-179`、`RB0-076`、`RB0-158`、`RB0-168`、`RB0-173`、`RB05-058`、`RB05-063`、`RB05-148`、`RB07-113`、`RB07-258`、`RB08-020`、`RB08-089`、`RB08-109`、`RB08-274`、`RB08-277`、`RB09-032`、`RC00-238`、`RC01-058`、`RC03-067`、`RC04-123`、`RD00-310`、`RD00-316`、`RD01-273`、`RD01-279`、`RD01-286`、`RD01-290`、`RD02-060`、`RD02-067`、`RD02-280`、`RD03-009`、`RD04-152`、`RD04-153`、`RD08-005`、`RD08-069`、`RD11-127`、`RE01-053`、`RE01-074`
