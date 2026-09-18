---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 386e4083f1a47c2d09ea75ea774772421a44b6f5dd9eaa331d6ea773cd683ffa
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784
rule_id: RUL-OSA-08
group: OS検収
product: OS
atoms_primary: 32
atoms_secondary: 20
issue_projection: #1860
---

# RUL-OSA-08（OS検収／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

時間・費用・性能を計測して予算で管理する。CIの時間上限、後続実行による旧実行の取消、実行時間の推定の鮮度、不安定なtestと性能の退行の検出、統計の母集団、審査の証拠の有効期間。

## 主として対応づいた規則（32件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RB04-272` | AI cost riskには使用量監視・予算alert・model最適化を、生成codeの法的riskにはlicense自動checkと生成範囲明示を適用する。 | safety_security | prose | n/a | 旧API cost監視 | `RUL-OSP-02`、`RUL-OSM-08` | docs/governance/ai-dev-team-concept_v1.1.md:518-519 | B04／claude_review |
| `RB06-157` | TaskPerformanceScorecardはretryを含めたcostを算出する。 | evidence_claim | prose | fail_close | 未実装TaskPerformanceScorecard | — | docs/governance/infinity-loop-assertion-coverage-ledger.md:130-130 | B06／gpt-6-astra |
| `RC03-068` | historical migration review検証処理は、現在時刻がreviewed_atより前、またはexpires_at以後である場合、受理を拒否する。 | evidence_claim | gate | fail_close | reviewed_atを含みexpires_atを含まない有効期間 | — | src/policy/historical-vpair-migration-authority.ts:222-230 | C03／gpt-6-astra |
| `RC03-069` | historical migration review検証処理は、reviewed_atからexpires_atまでが1時間を超える場合、受理を拒否する。 | evidence_claim | gate | fail_close | 上限3,600,000ミリ秒 | — | src/policy/historical-vpair-migration-authority.ts:228-230 | C03／gpt-6-astra |
| `RC04-131` | AI判断提案検証器は、quality・latency・cost・queue・failure・fallback_rate・misjudgment・human_override・driftの測定項目が揃わなければ拒否する。 | evidence_claim | gate | fail_close | 固定9指標 | — | src/workflow/ai-decision-proposal.ts:9-19; src/workflow/ai-decision-proposal.ts:112-117 | C04／claude_review |
| `RC04-164` | UT履歴投影器は、同じoracleにpassedとfailedが混在する場合、flake警告を記録する。 | evidence_claim | gate | warn | quality_signals | — | src/workflow/contracts.ts:254-259; src/workflow/contracts.ts:338-342; src/workflow/contracts.ts:414-471 | C04／gpt-6-astra |
| `RC04-165` | UT履歴投影器は、正の実行時間が2件以上あり、過去中央値に対する時間比が閾値以上なら性能退行を警告する。 | evidence_claim | gate | warn | 既定比率1.5 | — | src/workflow/contracts.ts:260-268; src/workflow/contracts.ts:474-503; src/workflow/contracts.ts:536-555 | C04／gpt-6-astra |
| `RC04-267` | CIは、jobまたはtest stepが設定されたtimeoutを超えた場合、実行を打ち切る。 | tooling_runtime | ci／config | fail_close | Lite10分、Windows8分、preflight35分、bulk/試験25分、stateful30分、finalize15分、aggregate5分 | — | .github/workflows/harness-check.yml:37-38; .github/workflows/harness-check.yml:135-136; .github/workflows/harness-check.yml:195-196; .github/workflows/harness-check.yml:681-682; .github/workflows/harness-check.yml:738-739; .github/workflows/harness-check.yml:795-796; .github/workflows/harness-check.yml:850-851; .github/workflows/harness-check.yml:920-921; .github/workflows/harness-check.yml:989-990; .github/workflows/harness-check.yml:1116-1117 | C04／gpt-6-astra |
| `RC04-268` | harness-checkは、同じrefの新しいrunが開始された場合、実行中の同group runを取消す。 | tooling_runtime | ci／config | n/a | harness-check-${github.ref} | — | .github/workflows/harness-check.yml:28-30 | C04／gpt-6-astra |
| `RC04-282` | Issue metadata監査CIは、jobが10分を超えれば打ち切る。 | tooling_runtime | ci／config | fail_close | — | — | .github/workflows/issue-metadata-audit.yml:12-15 | C04／gpt-6-astra |
| `RD00-069` | CI schedulerは、telemetryが期限外・時刻不正、またはsample数が3未満の場合、保守的fallback理由を記録する。ノードの新鮮で十分な推定値がない場合はtimeout値を所要時間に使う。 | evidence_claim | ci | n/a | telemetry_stale_or_insufficient | — | src/runtime/ci-critical-path-scheduler.ts:288-297; src/runtime/ci-critical-path-scheduler.ts:369-372 | D00／gpt-6-astra |
| `RD00-070` | CI schedulerは、cache状態がunknown、flake率が0.1超、またはvarianceがp95超の場合、品質上の保守的fallback理由を記録する。 | evidence_claim | ci | n/a | telemetry_quality_conservative | — | src/runtime/ci-critical-path-scheduler.ts:298-305 | D00／gpt-6-astra |
| `RD00-071` | CI schedulerは、obligationに対応する有効な推定値がない場合、telemetry_missingを記録する。 | evidence_claim | ci | n/a | telemetry_missing:<capability> | — | src/runtime/ci-critical-path-scheduler.ts:306-308 | D00／gpt-6-astra |
| `RD00-074` | CI schedulerは、backpressureが有効な場合、保守的fallbackを記録し並列枠を1へ制限する。 | tooling_runtime | ci | n/a | backpressure_active | — | src/runtime/ci-critical-path-scheduler.ts:337-337; src/runtime/ci-critical-path-scheduler.ts:363-365 | D00／gpt-6-astra |
| `RD00-076` | CI schedulerは、同一並列groupでジョブ数・CPU・memoryの上限を超える、または排他資源が重複する場合、後続groupへ配置を送る。 | tooling_runtime | ci | n/a | parallel_group | — | src/runtime/ci-critical-path-scheduler.ts:397-404 | D00／gpt-6-astra |
| `RD00-198` | CI telemetry集計は、cancelledまたはsuperseded eventを含むrunをpercentileの母集団から除外する。 | evidence_claim | ci | n/a | excluded_from_percentiles | — | src/runtime/ci-execution-telemetry.ts:993-996; src/runtime/ci-execution-telemetry.ts:1095-1097 | D00／gpt-6-astra |
| `RD01-303` | ベンチdataset検証は、public taskが10件でない、fixtureまたはoracleが10件超、あるいは最終的な一意fixture・oracle数が各10でない場合に拒否する。 | process_gate | gate | fail_close | 10 task固定dataset | — | src/runtime/helix-bench-task-dataset.ts:184-188; src/runtime/helix-bench-task-dataset.ts:274-276 | D01／gpt-6-astra |
| `RD01-313` | ベンチdataset検証は、定義された5categoryのtask数が各2件でなければ拒否する。 | process_gate | gate | fail_close | HELIX_BENCH_CATEGORIES、各2件 | — | src/runtime/helix-bench-task-dataset.ts:5-11; src/runtime/helix-bench-task-dataset.ts:267-273 | D01／gpt-6-astra |
| `RD01-351` | 実行時間percentile計算は、p95が時間budgetを超える場合にbudgetExceededを立てるが、correctnessAffectedはfalseに保つ。 | evidence_claim | gate | warn | budgetExceeded、correctnessAffected=false | — | src/runtime/impact-ci.ts:570-578 | D01／gpt-6-astra |
| `RD11-096` | version-up lintは、外部境界を持つPLANのcost_guardrailsにPages・Workers・D1・KVのlimitとexceed_actionが欠ける場合に違反にする。 | process_gate | lint | fail_close | Cloudflare向けの固定5field | `RUL-OSA-06` | src/lint/version-up-readiness.ts:517-524; src/lint/version-up-readiness.ts:1207-1213 | D11／gpt-6-astra |
| `RE01-131` | hook設計者はsmokeを5秒未満、pre-pushを15秒未満に抑え、重いfull検証をローカル必須hookへ入れない。smokeはofflineかつAIなしで動作させる。 | tooling_runtime | prose | n/a | 5秒・15秒の旧hook予算 | `RUL-OSA-05` | docs/governance/helix-harness-requirements_v1.2.md:1887-1914 | E01／claude-opus |
| `RG02-011` | 未応答review監査CIは、出力したreport.jsonを前回状態用artifactとして30日間保持する設定でuploadする。 | memory_context | config／ci | n/a | claude-unanswered-review-state、retention-days: 30 | `RUL-OSM-03` | .github/workflows/claude-unanswered-review-audit.yml:67-71 | G02／claude-opus |
| `RG02-022` | full regressionのbulk shardは、Vitestをnice値10で起動する。 | tooling_runtime | ci | n/a | nice -n 10、bulk-1・bulk-2・bulk-3 | — | .github/workflows/harness-check.yml:773-775; .github/workflows/harness-check.yml:828-830; .github/workflows/harness-check.yml:898-900 | G02／claude-opus |
| `RG16-006` | agent callがwrapperを外れた場合、担当者はcost記録義務が失われないよう、手動で.helix/audit/へentryを記録する。 | evidence_claim | prose | n/a | .helix/audit/、旧wrapperのcost telemetry | `RUL-FRM-04` | docs/skills/agent-cost-design.md:69-72 | G16／claude-opus |
| `RG36-004` | decision packetのprovenanceは、有効期間が指定されない場合24時間（1440分）を既定とする。 | evidence_claim | lint | n/a | buildDecisionPacketProvenance の validForMinutes 既定 24*60 | `RUL-COR-02` | src/lint/workflow-decision-packets.ts:64-81 | G36／claude-opus |
| `RG38-015` | CI telemetryのrun要約は、operationとverification_identityが同一のsetup nodeを2件目以降が重複とみなし、その件数と実行時間を無駄時間として計上しなければならない。 | evidence_claim | ci | n/a | summarizeRun の duplicateSetupByIdentity | — | src/runtime/ci-execution-telemetry.ts:975-992 | G38／claude-opus |
| `RG39-021` | CI_WALL_CLOCKの再測定は、同一workflowの成功runについてstartedAtからupdatedAtまでの秒を取り、比較を同一eventかつ同一runner classに限定しなければならない。 | evidence_claim | prose | n/a | harness-check.yml という具体workflow名 | `RUL-FRM-04` | src/runtime/cli-r00-throughput-baseline.ts:239-248 | G39／claude-opus |
| `RG39-022` | FULL_REGRESSION_WALL_CLOCKの再測定は、reuseによりshardが起動しなかったrunを母集団から除外し、0秒として扱ってはならない。 | evidence_claim | prose | n/a | full-regression-preflight/finalizeというjob名 | `RUL-FRM-04` | src/runtime/cli-r00-throughput-baseline.ts:250-259 | G39／claude-opus |
| `RG39-023` | TARGETED_TEST_WALL_CLOCKは同一Node majorで複数sampleを取り、時間閾値そのものをoracleにしてはならない。 | evidence_claim | prose | n/a | vitest run --project fast の具体コマンド | `RUL-FRM-04` | src/runtime/cli-r00-throughput-baseline.ts:261-270 | G39／claude-opus |
| `RG39-024` | CLI_COMMAND_STARTUP_TIMEは同一Node version・同一cwdで5回以上測定してp50/p95を残し、--helpの計測値を代表値へ混ぜてはならない。 | evidence_claim | prose | n/a | tsx src/cli.ts --version という具体コマンド | `RUL-FRM-04` | src/runtime/cli-r00-throughput-baseline.ts:272-281 | G39／claude-opus |
| `RG39-025` | CI_RERUN_COUNTは比較対象PR集合と期間を先に固定したうえでattempt>1を数え、単一HEADのattempt=1をこの指標の測定値として使ってはならない。 | evidence_claim | prose | n/a | — | `RUL-FRM-04` | src/runtime/cli-r00-throughput-baseline.ts:283-293 | G39／claude-opus |
| `RG39-026` | FULL_REGRESSION_INVOCATION_COUNTはshardが起動したかどうかで1または0とし、shard数をinvocation数として数えてはならない。 | evidence_claim | prose | n/a | full-regression-bulk-*/statefulというjob名 | `RUL-FRM-04` | src/runtime/cli-r00-throughput-baseline.ts:295-304 | G39／claude-opus |

## 副として対応づいた規則（20件）

`RE01-107`、`RE01-119`、`RE01-180`、`RE01-228`、`RE01-229`、`RF00-008`、`RF00-009`、`RG02-025`、`RG02-026`、`RG02-027`、`RG02-028`、`RG16-007`、`RG38-012`、`RG38-013`、`RG39-027`、`RG39-028`、`RG39-030`、`RG39-031`、`RG39-032`、`RG45-015`
