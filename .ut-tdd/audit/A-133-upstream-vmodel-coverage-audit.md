# A-133 upstream V-model coverage audit の記録

日付: 2026-06-12
範囲: L1/L3 functional requirements、L4-L6 design、test-design、roadmap/PLAN inventory、L7 implementation plans、source、tests、coverage gates。

## 結論

current repo は、もともと L7 overclaim の原因になった feature-list residual について、row-level closure を持つ状態になった。

`doctor` は registered-roadmap check と feature-list closure check の両方に pass する。`fr-roadmap-coverage` は R1-R9 を close し、`drive-model-passage` は 9-mode passage certificate table を close し、`drive-db-registration` は current DB projection registration を close する。`plan-dod` は unchecked completed L7 work を block し、`placeholder-deps` は active L7 waiting placeholder を block する。

original overclaim は、`PLAN-L7-44-harness-db-master` completion を "all L7 complete" と扱ったことから生じた。これは修正済みである。`PLAN-L7-44` は harness.db segment のままであり、`PLAN-L7-50` と `PLAN-L7-51` が residual closure / doctor precision completion record である。

## 絶対 no-omission principle

この audit は absolute no-omission principle を採用する。

- closure table に表現されていない upstream requirement、carry item、addendum、design contract、oracle、PLAN span、source module、test は、暗黙 covered ではなく `gap` と扱う。
- `carry` は completion ではない。routed obligation にすぎず、`scheduled`、`parked with reason`、または `PO decision` へ解決しなければならない。
- `doctor green` は full completion の十分条件ではない。関連する row-level closure table も green でなければならない。
- segment completion statement は segment 名を明示する。full feature-list closure table が green でない限り、"L7 complete" のような無限定表現は禁止する。
- new L7 implementation work は、該当 row に requirement、design、test-design、WBS、source target、test target、coverage gate column が埋まるか、理由付き `N/A` が明示されるまで開始しない。
- handover は、いずれかの row が `gap`、`scheduled`、`parked`、`PO decision` の間は "no next action" と書かない。

## work が schedule されていなかった理由

| finding | evidence | 発生理由 | impact | countermeasure |
|---|---|---|---|---|
| L7 completion wording が広すぎた | handover は `PLAN-L7-44` 後に no next action と書いた。`PLAN-L7-44` 自体は harness.db segment と記す。 | "L7" が layer と roadmap segment の両方に使われた。 | 残る FR/carry work が green doctor line の背後に隠れる。 | handover wording を修正し、`handover --complete` 前に residual-carry audit を要求する。 |
| feature-list residual が new WBS に展開されていなかった | L3 functional は 26 L3 FR、L1 は 47 FR。複数の P1/P2/Phase B/A-124..126 item は carry。 | `g3-trace` は "L3 FR or carry" を coverage として受け入れるが、carry は scheduled implementation と同義ではない。 | functional completeness が過大に見える。 | `PLAN-L3-04-upstream-schedule-reconciliation` と residual matrix を追加する。 |
| roadmap rollup は registered-roadmap coverage であり FR coverage ではない | `doctor` は roadmap-rollup green を示す。 | program band は存在する roadmap block を測るだけで、すべての upstream FR obligation を測らない。 | green roadmap と unscheduled FR extension が共存できる。 | `fr-roadmap-coverage` を実装し、FR-L1/carry/addenda residual を PLAN/WBS/source/test/gate evidence または明示 non-closed status へ map させる。 |
| V-model check は強いが分断されていた | pair-freeze、l6-fr-coverage、impl-plan-trace、oracle-test-trace、dependency-drift はすべて pass。 | 各 check は 1 edge を所有するが、requirement から code coverage までの full row は所有しない。 | human が closure を 1 table で inspect できない。 | residual bucket ごとに single V-model closure table を維持する。 |

## V-model closure 確認

凡例: `Closed` は、current machine check が row-level residual closure scope の edge を cover していることを意味する。non-current / historical future work は独自 PLAN に残し、silent complete と数えない。

| layer / artifact | repo が示せる scope | current evidence | status | closure condition |
|---|---|---|---|---|
| L1 requirement definition | `FR-L1` registry 47 items と upstream baton notes | `g3-trace` + `fr-roadmap-coverage` | `Closed` | FR/carry/addenda residual は closed R1-R9 row または明示 non-closed status へ map する。 |
| L3 requirement definition | 26 L3 FR と明示 P1/P2/Phase B carry | `docs/design/harness/L3-functional/functional-requirements.md`; `doctor l6-fr-coverage`; `fr-roadmap-coverage` | `Closed` | residual carry bucket は `PLAN-L7-50` WBS row に表現される。 |
| L4 basic design | architecture/module boundary と system concept | `pair-freeze`, `module-drift`, L4 roadmap, A-133 residual rows | `Closed` | unscheduled extension は infer せず、`fr-roadmap-coverage` で surface する。 |
| L5 detailed design | D-DB/D-CONTRACT/D-STATE と physical-data extension | L5 roadmap, L8 integration test design, PLAN-L5-08 references, `drive-db-registration` | `Closed` | A-124/A-125/A-126 residual implementation evidence は R7-R9 に表現される。 |
| L6 function design | unit-level contract と U-* oracle mapping | `l6-fr-coverage - OK (FR registry 47...)` | declared L6 matrix では `Closed` | closure は FR-to-L6/U-* であり、それ自体は implementation shipped を証明しない。 |
| test design | L7 unit、L8 integration、L9 system test docs paired | `vmodel lint` pair-freeze 38 pair / orphan 0; `PLAN-L7-50` R10/R11 closes explicit L7 defer discharge | `Closed` | explicit defer row は PLAN/L7 source/test evidence と link し続け、L6/impl/oracle trace gate で check される。 |
| L7 plan groups | confirmed/completed L7 PLAN files と residual closure plans | `plan-dod`, `fr-roadmap-coverage`, `roadmap-rollup`, `impl-plan-trace` | `Closed` | completed/confirmed L7 PLAN は unchecked DoD や missing residual evidence を保持できない。 |
| code | `src` module mapped to PLAN generates and architecture | `impl-plan-trace`, `module-drift`, `dependency-drift` | `Closed` | PLAN coverage のない new source は fail-closed。 |
| tests | Vitest tests cite oracle IDs; regression expansion maps source to tests | `oracle-test-trace`, `ddd-tdd-rules`, `dependency-drift` | current declared oracle では `Closed` | coverage percentage threshold は未設定。coverage は Istanbul line coverage ではなく trace/substance。 |
| roadmap / WBS | registered roadmaps と residual closure WBS | `roadmap-rollup 5/5`, `program-coverage OK`, `fr-roadmap-coverage - OK` | `Closed` | registered-band と feature-list residual coverage の両方を check する。 |

## residual feature の bucket

| bucket | upstream source | current route | V-model 状態 | 次に必要な artifact | status |
|---|---|---|---|---|---|
| R1 Learning / observability | FR-L1-19/20 | Phase B / L4 carry | L1/L5 reference が存在し、L7 feedback/search metrics は実装済み。 | PLAN-L7-50 WBS-L7-50-R1 closes learning/observability metrics | `closed` |
| R2 FE / W-gate workflow | FR-L1-21/22/28 | L4 carry | upstream requirement は既知で、L7 readiness gate は実装済み。 | PLAN-L7-50 WBS-L7-50-R2 closes readiness/W-gate workflow evidence | `closed` |
| R3 P2 readiness and infra | FR-L1-31-35 | L4/Phase B carry | P2 は既知で、guardrail/issue queue evidence は実装済み。 | PLAN-L7-50 WBS-L7-50-R3 closes P2 readiness/infra routing | `closed` |
| R4 model/drive/onboarding/provider | FR-L1-37/39/40/41/42/44 | L4 carry / Phase B | runtime provider handover と drive-skill injection test が存在する。 | PLAN-L7-50 WBS-L7-50-R4 closes provider/model/drive concern | `closed` |
| R5 internal assets | FR-L1-46-49 | L4-L6 carry; asset-drift/catalog slices implemented | L7 asset catalog と asset drift test が存在する。 | PLAN-L7-50 WBS-L7-50-R5 closes roster/skill/command asset residuals | `closed` |
| R6 DDD/TDD strictness | FR-L1-50 | L6-L8 add-feature carry; lint slices implemented | DDD/TDD hardening lint と test が存在する。 | PLAN-L7-50 WBS-L7-50-R6 closes hardening matrix evidence | `closed` |
| R7 relation graph | A-124 addendum | L6/L7 plans 32/36 and projection support | relation graph lint と test が存在する。 | PLAN-L7-50 WBS-L7-50-R7 closes relation graph residual matrix link | `closed` |
| R8 external verification/MCP | A-125 addendum | L7-33/34 slices implemented | tool adapter と verification profile test が存在する。 | PLAN-L7-50 WBS-L7-50-R8 closes must-tool versus insight-only profile gate | `closed` |
| R9 document export | A-126 addendum | L7-35 implemented slice | document export lint と test が存在する。 | PLAN-L7-50 WBS-L7-50-R9 closes export derivative and non-SSOT guard | `closed` |

## residual feature closure 証跡

| bucket | PLAN / WBS | L7 source | test file / oracle 引用 | coverage gate | status |
|---|---|---|---|---|---|
| R1 | `docs/plans/PLAN-L7-50-feature-list-residual-closure.md#WBS-L7-50-R1` | `src/feedback/engine.ts` | `tests/search-feedback.test.ts` | doctor `fr-roadmap-coverage` + npm test | `closed` |
| R2 | `docs/plans/PLAN-L7-50-feature-list-residual-closure.md#WBS-L7-50-R2` | `src/workflow/readiness.ts` | `tests/readiness-guardrail.test.ts` | doctor `fr-roadmap-coverage` + npm test | `closed` |
| R3 | `docs/plans/PLAN-L7-50-feature-list-residual-closure.md#WBS-L7-50-R3` | `src/guardrail/ledger.ts` | `tests/issue-queue.test.ts` | doctor `fr-roadmap-coverage` + npm test | `closed` |
| R4 | `docs/plans/PLAN-L7-50-feature-list-residual-closure.md#WBS-L7-50-R4` | `src/runtime/provider-handover.ts` | `tests/provider-handover.test.ts` | doctor `fr-roadmap-coverage` + npm test | `closed` |
| R5 | `docs/plans/PLAN-L7-50-feature-list-residual-closure.md#WBS-L7-50-R5` | `src/assets/catalog.ts` | `tests/asset-catalog.test.ts` | doctor `fr-roadmap-coverage` + npm test | `closed` |
| R6 | `docs/plans/PLAN-L7-50-feature-list-residual-closure.md#WBS-L7-50-R6` | `src/lint/ddd-tdd-rules.ts` | `tests/ddd-tdd-rules.test.ts` | doctor `fr-roadmap-coverage` + npm test | `closed` |
| R7 | `docs/plans/PLAN-L7-50-feature-list-residual-closure.md#WBS-L7-50-R7` | `src/lint/relation-graph.ts` | `tests/relation-graph.test.ts` | doctor `fr-roadmap-coverage` + npm test | `closed` |
| R8 | `docs/plans/PLAN-L7-50-feature-list-residual-closure.md#WBS-L7-50-R8` | `src/lint/tool-adapter.ts` | `tests/tool-adapter.test.ts` | doctor `fr-roadmap-coverage` + npm test | `closed` |
| R9 | `docs/plans/PLAN-L7-50-feature-list-residual-closure.md#WBS-L7-50-R9` | `src/export/document-export.ts` | `tests/document-export.test.ts` | doctor `fr-roadmap-coverage` + npm test | `closed` |

## 必須 table 形状

| column | purpose |
|---|---|
| `FR-L1 / BR / addendum` | requirement-definition range |
| `L3 FR / carry reason` | requirement-definition status |
| `L4 basic design doc` | basic-design range |
| `L5 detailed design doc` | detailed-design range |
| `L6 function contract` | functional-design range |
| `test-design oracle` | test-design range |
| `PLAN / roadmap span` | schedule/WBS range |
| `L7 source` | implementation evidence |
| `test file / oracle citation` | test evidence |
| `coverage gate` | row を証明する machine check |
| `status` | `closed`, `scheduled`, `parked`, or `gap` |

この table が存在し、`fr-roadmap-coverage` で check されるため、unqualified `L7 complete` は A-133 residual rows と `PLAN-L7-50` / `PLAN-L7-51` gate が green の場合だけ許可される。

## drive-model passage 証明書

これは non-Forward drive model を Forward spine へ close back するために必要な certificate table である。この table は PLAN frontmatter の `drive` とは意図的に分けている。`drive` は specialist axis（`be` / `fe` / `fullstack` / `db` / `agent`）を意味し、下の row は drive-model / entry-mode row を意味する。

| drive model / entry mode | trigger | 必須 exit evidence | Forward re-entry | certificate row の証明対象 | current state |
|---|---|---|---|---|---|
| Discovery | `requirement_undefined`, `feasibility_unknown`, `design_uncertain` | S3 verification result, S4 decision, rejected/pivot backlog if not confirmed | L1 または L3-L6。evidence promotion が必要な場合は通常 Reverse が続く。 | hypothesis, evidence, decision, target Forward layer, residual gaps | `PLAN-L3-04` Section 2.1 に consolidation 済み。`drive-model-passage` hard gate が row を check する。 |
| Scrum | `user_feedback_iteration`, `requirement_continuous_refinement` | increment evidence, S4 acceptance, Reverse fullback route | Reverse fullback 経由で L1/L3/L4/L5 へ戻る。 | accepted increment, observed contracts, test-design state, Forward routing | `PLAN-L3-04` Section 2.1 に consolidation 済みで、`scrum-reverse` + `drive-model-passage` により enforce される。 |
| Reverse | `drift`, Discovery endpoint, Scrum increment, fullback | R0-R4 outputs, R3 PO validation, R4 `forward_routing`, test-design state | `L1` / `L3` / `L4` / `L5` / `gap-only` | evidence map, observed contracts, as-is design, intent, missing pair artifacts, re-entry gate | `PLAN-L3-04` Section 2.1 に consolidation 済み。row は R4 routing と re-entry gate を要求する。 |
| Recovery | `agent_runaway`, `context_exhaustion`, `regression_dev`, `forced_stop` | root cause, reopen point, top-down correction, recurrence-prevention action | interrupted Forward layer。recurrence-prevention は L14 へ接続する。 | event class, approved scope, reopen point, correction artifact, recurrence guard/test/rule | `PLAN-L3-04` Section 2.1 に consolidation 済み。row は recurrence-prevention guard/test/rule を要求する。 |
| Incident | `production_incident`, `hotfix_required`, `regression_prod` | triage, hotfix evidence, recovery plan, postmortem | stabilization は L12/L13。permanent fix は Reverse で L1-L6 へ戻し、postmortem は L14 へ送る。 | production impact, approvals, hotfix, verification, permanent route, postmortem | defined。this audit scope に current incident row はない。 |
| Refactor | `debt_degradation`, `code_smell`, `structural` | behavior-preserving test evidence, affected design unchanged or explicit escalation | L7 internal closure。behavior change があれば Add-feature/Reverse へ route する。 | unchanged behavior proof, test green, no requirement/design delta, or escalation | defined。conditional back-fill のみで、full passage certificate ではない。 |
| Retrofit | `dependency_outdated`, `upgrade`, `config_drift` | impact matrix, migration plan, regression/perf/data-integrity evidence | L7、または architecture/DB change は L4/L5、requirement change は L1/L3 へ route。 | impact scope, rollback, migration evidence, changed design/requirement route | defined。conditional back-fill のみ。 |
| Add-feature | `feature_addition`, `scope_extension` | parent PLAN, add-design/add-impl split, tests, V-model trace, Reverse back-fill when bottom-up | existing parent PLAN。route B は Reverse/G3 closure まで G7 trace を保持する。 | parent, requirement/design/test row, WBS, implementation target, Reverse back-fill state, residual status | `PLAN-L3-04` Section 2.1 に consolidation 済み。R1-R9 residual は `PLAN-L7-50` で close。 |
| Research | `tech_decision_required`, `option_comparison_needed`, `adr_required` | ADR, research memo, explicit Forward connection | L1 または L4 decision input。feasibility が不明な場合は Discovery へ切り替える。 | decision options, selected ADR, rejected options, Forward target, next action | `PLAN-L3-04` Section 2.1 に consolidation 済み。unresolved feasibility は Discovery へ切り替える。 |

passage rule: drive-model row は mode-local evidence だけでは close できない。named layer/gate と table row を持って Forward へ re-enter するか、`gap`、`parked`、`PO decision` のまま残す必要がある。

## drive-model DB registration 確認

current answer: current projection scope では automatic であり、`ut-tdd doctor` により hard-gated される。

database schema は intended projection table をすでに含む。

| table | intended role | `db rebuild` 後の current projection evidence |
|---|---|---|
| `drive_runs` | drive-model / entry-mode execution lane ごとに 1 row | nonzero rows。`drive-db-registration` はすべての `plan_registry` row に projected drive run があることを要求する。 |
| `workflow_runs` | workflow phase readiness rows | nonzero rows。`drive-db-registration` は全 row が `drive_runs.drive_run_id` へ link することを要求する。 |
| `hook_events` | session / hook event projection | registered hook rows は `plan_registry` へ join しなければならない。legacy orphan hook rows は `legacy_hook_orphans` として surface される。 |
| `model_runs` | Codex / Claude / worker / reviewer execution evidence | nonzero rows。`drive-db-registration` は全 row が `plan_registry` へ join することを要求する。 |
| `plan_registry` | PLAN frontmatter registry | nonzero rows。registry は drive/model/skill registration の join denominator。 |
| `roadmap_gate_progress` | registered roadmap gate progress | `20` 行 |
| `workflow_runs` -> `drive_runs` join | registered drive lane を持つ workflow rows | current workflow rows はすべて join する。orphan count は `0` でなければならない。 |
| `skill_recommendations` / `skill_invocations` | skill suggestion と accepted firing projection | nonzero rows。current rows はすべて `plan_registry` へ join しなければならない。 |

これは harness.db が `db rebuild` 中に documented PLAN drive lanes、session hook evidence、review model evidence、skill recommendation/invocation evidence、workflow slices を project することを証明する。以前の zero-row projection gap と doctor blind spot は `src/lint/drive-db-registration.ts` で close 済み。

required DB passage rule: current drive/model/workflow/skill registration row は、以下のいずれかを持つ必要がある。

- `workflow_runs.drive_run_id` へ link する `drive_runs.drive_run_id` と、該当する `model_runs.plan_id`、`skill_recommendations.plan_id`、`skill_invocations.plan_id` が `plan_registry` へ resolve すること。
- DB registration が存在しない理由を説明する non-closed status（`gap`、`parked`、`PO decision`）。

doctor enforcement: `drive-model-passage - OK` は 9-mode passage certificate table shape を証明する。`drive-db-registration - OK` は current DB projection が drive/workflow/model/skill registration evidence と resolvable join を持つことを証明する。

## rule automation closure 確認

current answer: この audit が導入した rule はすべて automated されているか、automated non-closed status として visible に保たれる。

| rule family | current automation 状態 | evidence | closure status |
|---|---|---|---|
| PLAN schedule shape | automated | `ut-tdd doctor` -> `plan-schedule - OK` | current PLAN section shape では `Closed` |
| V-model pair freeze | automated | `ut-tdd vmodel lint`, doctor `pair-freeze` | document pair links では `Closed` |
| review evidence / test-before-review | automated hard gate | doctor `review-evidence - OK` | confirmed design/impl PLAN review evidence では `Closed` |
| back-fill pairing | visible conditional note 付き automated | doctor `backfill` + `runDoctor.ok` wiring。conditional contract change は surface され続ける。 | current set では `Closed` |
| Scrum/Discovery -> Reverse | confirmed `poc` 向け automated | doctor `scrum-reverse - OK` | current confirmed poc set では `Closed` |
| roadmap/program coverage | registered roadmap bands と residual feature rows 向け automated | doctor `roadmap-rollup`, `program-coverage`, `fr-roadmap-coverage` | `Closed` |
| FR/carry/addendum -> WBS/L7 coverage | table analyzer/checker automated | `fr-roadmap-coverage - OK (checked=1, buckets=9, closure=9)` | residual table completeness と L7 implementation evidence では `Closed` |
| drive-model passage certificate | table analyzer/checker automated | `drive-model-passage - OK (checked=1, modes=9, expected=9)` | table completeness では `Closed` |
| drive-model DB registration | rebuild projection と doctor hard gate 向け automated | rebuild 後の `drive-db-registration - OK`。`drive_runs`、`workflow_runs`、`model_runs`、`skill_recommendations`、`skill_invocations`、registered hook joins を check する。 | current projection scope では `Closed` |
| handover "no next action" against residual gaps | CURRENT.json latest handover doc に対して automated | residual rows が non-closed で latest_doc が no next action と言う場合、`checkHandoverCompletionWording` が warn する。 | current residual table では `Closed` |
| source -> PLAN / oracle -> test trace | automated hard gate | doctor `impl-plan-trace`, `oracle-test-trace` | current trace では `Closed` |
| coding / DDD-TDD / asset drift / module drift | automated | doctor checks と test suites | current rule scope では `Closed` |
| missing/ambiguous row fail-close | residual/checker analyzer で automated | `fr-roadmap-coverage` は missing R1-R9 rows と unknown status を reject する。 | residual bucket table では `Closed` |

rule closure rule: policy は、owner mechanism を持つまで completion の意味では "laid down" と見なさない。owner mechanism は `doctor`、`plan lint`、`vmodel lint`、hook guard、DB projection check、CI test のいずれかである。text-only rule は `gap` または `scheduled` のまま残す。

## fail-close rule の扱い

missing または unclear row の default status は `gap`。証明責任は row 側にあり、evidence によって closure を示さなければならない。evidence が absent、stale、または別の green check からの implied にすぎない場合、その row は non-closed のままとする。
