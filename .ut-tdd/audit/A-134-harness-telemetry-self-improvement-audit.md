# A-134 harness telemetry / self-improvement audit 監査

Date: 2026-06-12

## Findings の要約

harness measurement substrate は minimal automated loop を持つ状態になり、この implementation scope では self-improvement loop が closed である。

current evidence は、workflow、hook、drive、model、findings、skill recommendation、skill invocation、quality signal、feedback event、trouble event、retry event analysis、improvement log、automation asset、guardrail decision、dry-run issue queue data、project-local hook configuration の durable rows を示している。actual GitHub mutation はこの implementation scope の外であり、test coverage は queue と externally supplied issue back-reference boundary を証明している。

## Evidence snapshot の記録

| Signal | 最新 local DB rebuild/check 後の current count | Interpretation 解釈 |
|---|---:|---|
| `drive_runs` | 210 | Drive-model execution lanes が projected されている。 |
| `workflow_runs` | 7 | Workflow phase rows は存在するが、retry/bottleneck analysis は derive されていない。 |
| `hook_events` | 3212 | Hook/session telemetry が存在する。 |
| `model_runs` | 84 | AI runtime execution rows が存在する。 |
| `findings` | 1544 | Findings table が存在し、rows を持つ。 |
| `skill_recommendations` | 161 | Dynamic skill recommendation は PLAN layer/drive/kind context と skill assets から projected される。 |
| `skill_invocations` | 128 | Skill firing telemetry は accepted review evidence から inferred される。 |
| `quality_signals` | 331 | Skill firing/acceptance、drive firing-rate、trouble、retry、bottleneck metrics が projected される。 |
| `feedback_events` | 1533 | Findings と warning/failing quality signals が feedback events へ emitted される。 |
| `issue_queue` | 2 | GitHub dry-run issue candidates は human approval required で queued される。この implementation は queue/back-reference evidence のみを記録し、GitHub を mutate しない。 |
| `trouble_events` | 23 | Hook failures と trouble-rate signals は trouble taxonomy rows へ normalized される。 |
| `retry_events` | 0 | Duplicate workflow phase attempts は analyzed 済みであり、zero rows は duplicate phase group が検出されなかったことを意味する。 |
| `improvement_log` | 2 | Issue queue と retry diagnostics は self-improvement log rows へ converted される。 |
| `guardrail_decisions` | 2 | External issue creation approval guardrails は queued dry-run issue candidates 向けに projected される。 |
| `automation_assets` | 20 | Automation asset catalog telemetry は YAML skill metadata を含めて populated される。 |
| `.claude/settings.json` project hooks | 5 | Team-standard project-local hooks は Agent guard、session start、post-tool-use、stop summary、subagent stop 向けに configured されている。 |

## Telemetry Closure Matrix の確認

| Requirement 要件 | Required evidence 必要証跡 | Current evidence 現在証跡 | Automation owner | Status |
|---|---|---|---|---|
| Skill firing parameters | `ut-tdd skill suggest` が `skill_recommendations` を write し、actual firing が `skill_invocations` を write する。metrics は plan、layer、drive、skill、source、acceptance で group できる。 | `skill suggest --plan` は ranked recommendations を返す。DB rebuild は `skill_recommendations=161`、`skill_invocations=128`、skill quality signals を project する。 | DB projection + CLI + doctor telemetry-closure | `closed` |
| Trouble logs | Session、hook、failure、trouble events が materialized され、findings または feedback rows へ classified される。 | Session log files と `hook_events=3212` が存在する。hook failures と `trouble_event_rate` は `trouble_events` と feedback events へ projected される。 | session-log + hook_events + feedback engine + doctor | `closed` |
| GitHub issue creation outside Forward | Non-Forward findings は dry-run、human approval、issue-id back-reference 付きで GitHub issues を create または queue できる。 | `issue_queue=2` dry-run candidates は `human_approval_required=1` 付きで存在する。`guardrail_decisions=2`。`issue mark-created` は別途 approved creation 後に externally supplied `external_issue_id` / `external_issue_url` を記録する。`tests/issue-queue.test.ts` が boundary を cover する。 | GitHub issue queue + CLI + doctor + test | `closed` |
| Drive model firing-rate measurement | denominator の drive opportunities と numerator の completed `drive_runs` は、drive、mode、layer、plan 別の `quality_signals` になる。 | `drive_runs=210`。`drive_firing_rate` quality signals は drive mode 別に projected される。 | DB projection + metrics CLI + quality_signals + doctor | `closed` |
| Plan/workflow retry detection | repeated failed attempts、rebuilds、reruns、retries は plan、workflow、session 別に grouped される。 | `workflow_retry_groups` quality signal と `retry_events` projection が duplicate workflow phase attempts を analyze する。 | hook_events + workflow_runs + feedback engine | `closed` |
| Bottleneck detection | stale または slow workflow phases は owner と next action を持つ findings または quality signals になる。 | `workflow_blocked_rate` と `workflow_human_required_rate` quality signals は `workflow_runs` から projected される。 | doctor + workflow_runs + quality_signals | `closed` |
| Improvement log | Findings と feedback events は tracked improvement backlog rows または approved issue-queue entries を create する。 | `improvement_log` rows は issue queue と retry diagnostics から projected される。docs write-back は reporting task のままであり、source of truth ではない。 | feedback engine + improvement-backlog + GitHub issue queue | `closed` |
| Measurement-to-feedback loop | Metrics は findings、feedback events、next actions、doctor-visible closure state を create する。 | DB rebuild は `quality_signals=331` を project し、`feedback_events=1533` を emit する。backlog/issue routing は separate のまま。 | feedback engine + DB projection + doctor | `closed` |
| Project hook configuration | TDD team standard project hooks は repository-local、package-local、drift-checked である。 | `.claude/settings.json` は 5 project-local hooks を定義する。`project-hook` doctor check は missing hooks、personal absolute paths、non-project commands を reject する。 | project-hook + doctor + hook tests | `closed` |

## No-omission rule の規則

- operational rows が 0 の table は closed implementation ではない。
- upstream event capture のない metrics command は closed telemetry loop ではない。
- skill injection への design reference は runtime skill injector ではない。
- classification のない hook log は trouble log system ではない。
- GitHub connector capability は、dry-run queue、approval gate、back-reference が定義されるまで product feature ではない。
- self-improvement loop は、measurement rows が findings、feedback events、improvement backlog または issue queue entries、doctor-visible closure evidence を生成した場合に限り closed である。

## Required follow-up の一覧

| Follow-up | Required artifact 必要成果物 | Target status |
|---|---|---|
| Dynamic L-unit / drive-model skill injection | `ut-tdd skill suggest --plan <id>` と、`skill_recommendations` / `skill_invocations` への projection | minimal closed。skill catalog と drive-specific rules を拡張する。 |
| Firing-rate and retry analytics | drive firing rate、retries、bottlenecks 向けの metrics command と `quality_signals` projection | minimal closed。per-session attribution を拡張する。 |
| Trouble-log taxonomy | hook/session/failure rows から findings と feedback events への classifier | minimal closed。new trouble patterns が現れたら categories を拡張する。 |
| Improvement routing | local improvement backlog writer と human approval 付き GitHub issue dry-run queue | DB と CLI では minimal closed。actual GitHub mutation は approval-gated のまま。 |
| Feedback loop closure | db rebuild 後に nonzero quality signals と feedback events を証明する doctor check | DB loop は closed。必要なら reporting/export を追加する。 |
