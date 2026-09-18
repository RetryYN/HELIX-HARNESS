---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSP-07
group: OS推進
product: OS
atoms_primary: 36
atoms_secondary: 5
issue_projection: #1859
---

# RUL-OSP-07（OS推進／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

自律実行の停止条件と上限を定める。反復回数、実行時間、予算、変更量、進捗の停滞、利用枠の枯渇、再試行の上限で止め、段階的に停止して再開できるようにする。

## 主として対応づいた規則（36件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RB06-174` | loopはiteration・時間・token・cost上限で停止理由とdurable checkpointを残し、同一点から再開する。 | tooling_runtime | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:162-162 |
| `RB06-186` | quota対応は枯渇を無視した継続と無計画retryを拒否する。 | tooling_runtime | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:198-198 |
| `RC0-123` | Loop停止判定は、count規則のiterationがthreshold以上になった場合、loopを停止する。 | tooling_runtime | gate | src/orchestration/loop-stop-rules.ts:52-55 |
| `RC0-124` | Loop停止判定は、cost_budget規則の累積costがthreshold以上になった場合、loopを停止する。 | tooling_runtime | gate | src/orchestration/loop-stop-rules.ts:56-59 |
| `RC0-125` | Loop停止判定は、file_exists規則の対象fileが存在する場合、loopを停止する。 | tooling_runtime | gate | src/orchestration/loop-stop-rules.ts:60-63 |
| `RC0-126` | Loop停止判定は、no_progress probeが指定thresholdで停滞を検出した場合、loopを停止する。 | tooling_runtime | gate | src/orchestration/loop-stop-rules.ts:64-67 |
| `RC0-127` | Loop停止判定は、custom probeがtrueを返した場合、loopを停止する。 | tooling_runtime | gate | src/orchestration/loop-stop-rules.ts:68-70 |
| `RC0-153` | Loop effort budget判定は、iterationがmaxIterations以上になった場合、継続を拒否する。 | tooling_runtime | gate | src/orchestration/loop-effort-budget.ts:113-116; src/orchestration/loop-effort-budget.ts:167-201 |
| `RC0-154` | Loop effort budget判定は、toolCallsがmaxToolCalls以上になった場合、継続を拒否する。 | tooling_runtime | gate | src/orchestration/loop-effort-budget.ts:113-116; src/orchestration/loop-effort-budget.ts:167-201 |
| `RC0-155` | Loop effort budget判定は、costUsdがmaxCostUsd以上になった場合、継続を拒否する。 | tooling_runtime | gate | src/orchestration/loop-effort-budget.ts:113-116; src/orchestration/loop-effort-budget.ts:167-201 |
| `RC0-156` | Loop effort budget判定は、elapsedMsがmaxElapsedMs以上になった場合、継続を拒否する。 | tooling_runtime | gate | src/orchestration/loop-effort-budget.ts:113-116; src/orchestration/loop-effort-budget.ts:167-201 |
| `RC00-249` | project hook authority解決器は、hard ceilingが60秒でなければlifecycle policyを拒否する。 | tooling_runtime | gate | src/runtime/project-hook-authority.ts:237-247; src/runtime/project-hook-authority.ts:301-308 |
| `RC04-004` | 停止判定器は、verdict規則があり最終判定がpassならループを停止する。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:49-51 |
| `RC04-007` | 停止判定器は、file_exists規則の指定ファイルが存在すればループを停止する。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:60-63 |
| `RC04-008` | 停止判定器は、no_progress規則の閾値を渡した進捗検査が真ならループを停止する。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:64-67 |
| `RC04-009` | 停止判定器は、custom規則の検査結果が真ならループを停止する。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:68-70 |
| `RC04-018` | 復旧分類器は、先行条件に該当せずdiffSizeが400を超えた場合、abortに分類する。 | process_gate | gate | src/orchestration/loop-recovery.ts:3-3; src/orchestration/loop-recovery.ts:18-44 |
| `RC04-019` | ループ実行器は、running状態、実行時間枠内、未pass、最大反復数未満のすべてを満たす場合だけ次のtickを実行する。 | process_gate | gate | src/orchestration/loop-runner.ts:36-48 |
| `RC04-043` | ループreceipt生成器は、runningかつ残り反復数が正の場合だけretryを許可する。 | process_gate | gate | src/orchestration/autonomous-loop-run-receipts.ts:150-166 |
| `RC04-096` | epoch読取り器は、追加manifest履歴が4096件を超えるとhistory_limitで拒否する。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:90-90; src/orchestration/durable-loop-epoch-node.ts:636-648 |
| `RD00-042` | slot管理は、agent_guard由来の実行中かつ未releaseのslotが既定5分を超えた場合、cancelledとして失効させる。 | tooling_runtime | hook | src/runtime/agent-slots.ts:54-57; src/runtime/agent-slots.ts:193-220; src/runtime/agent-slots.ts:288-298 |
| `RD00-215` | Claude review dispatchは、同一PR・HEADの既知CI evidence generationが8種類以上の場合、新しい通知を拒否する。 | tooling_runtime | gate | src/runtime/claude-memory-wake.ts:551-556 |
| `RD01-109` | recovery経路判定は、試行上限超過または再試行対象外の失敗ではrecoveryへ送り、上限内のrate limit中断・stale HEADだけbounded retryにする。 | tooling_runtime | gate | src/runtime/event-projection-checkpoint-replay.ts:166-169; src/runtime/event-projection-checkpoint-replay.ts:442-448 |
| `RD02-039` | ACP実行器は、制限時間に達した場合にprotocol失敗とし、子processへSIGTERMを送る。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:1019-1030 |
| `RD02-156` | 継続実行判定器は、自動実行に停止条件がない場合に拒否する。 | process_gate | gate | src/runtime/legacy-adoption.ts:509-511 |
| `RD02-257` | provider出力捕捉器は、stdout/stderr合計がcapture上限を超える場合に保持内容を切り詰め、output_truncatedを記録する。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:184-208 |
| `RD04-126` | isolation実行器は、子processの出力bufferを8MiB、実行時間を10分に制限する。 | tooling_runtime | config | src/runtime/worker-isolation-broker.ts:764-771 |
| `RD11-046` | 標準probeは、外部commandの確認に10秒のtimeoutを設定し、終了statusが0でなければ失敗とする。 | tooling_runtime | lint | src/lint/verification-profile.ts:125-126; src/lint/verification-profile.ts:148-150 |
| `RD11-047` | 標準runnerは、検証commandに10分の実行上限を設定する。 | tooling_runtime | lint | src/lint/verification-profile.ts:127-128; src/lint/verification-profile.ts:152-159 |
| `RF00-008` | 予算生成器は、明示指定のない上限をPLANサイズ別の基準値から導出する。基準値は反復数・ツール呼出数・USD費用・時間の順で、Sが2・16・0.75・10分、Mが4・32・2・25分、Lが6・64・5・60分、XLが8・96・9・120分とする。 | tooling_runtime | config | src/orchestration/loop-effort-budget.ts:64-69; src/orchestration/loop-effort-budget.ts:118-129; src/orchestration/loop-effort-budget.ts:140-155 |
| `RF00-009` | 予算上限の導出器は、サイズ別基準値にsmart_review_agentは1.1、light_implementation_agentは0.8、workerとtlは1、verifierは0.7、fast_checkerは0.35を掛ける。反復数・ツール呼出数・経過時間は切捨て後に最低1を適用し、費用は小数点以下4桁に丸める。 | tooling_runtime | config | src/orchestration/loop-effort-budget.ts:71-78; src/orchestration/loop-effort-budget.ts:118-129 |
| `RF00-010` | 予算判定器は、使用量のoverrideが有限の非負数なら優先し、それ以外はbudget内の有限の非負数を使う。両方が不適合の場合は、反復数と費用をstateから、ツール呼出数と経過時間を0から補う。 | tooling_runtime | gate | src/orchestration/loop-effort-budget.ts:80-110; src/orchestration/loop-effort-budget.ts:161-171 |
| `RF00-011` | 予算判定器は、違反がある場合、overrunPolicyがversion_targetならkindをversion_target、escalateならblocker、それ以外ならstopにする。 | escalation_authority | gate | src/orchestration/loop-effort-budget.ts:174-201 |
| `RF00-013` | ループ実行器は、verifier後の予算判定でallowWorkerPassがfalseなら、verifierの判定がpass以外であっても最終verdictをerrorへ置換する。 | evidence_claim | gate | src/orchestration/loop-runner.ts:123-147 |
| `RF00-026` | 停止判定器は、規則を配列順に評価し、最初に検出した不正規則または停止条件で即座に判定を返し、後続規則を評価しない。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:44-74 |
| `RG18-017` | 管理者はIncident driveの作業にtime-boxを設ける。 | process_gate | prose | docs/skills/project-management.md:105-105 |

## 副として対応づいた規則（5件）

`RA-244`、`RD02-259`、`RE01-153`、`RF01-001`、`RF01-032`
