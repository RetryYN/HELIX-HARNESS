---
layer: L1-L9
executed_at_layer: L7-L14
artifact_type: test_design
status: draft
pair_artifact: docs/design/harness/L3-functional/functional-requirements.md
related_function: src/task/classify.ts
related_cli: src/cli.ts
created: 2026-06-24
---

# 提案文書 coverage routing

本書は `classifyProposalDocumentCoverage` の test-design meta layer である。提案文を HELIX 各層で必要な design / test-design coverage へ変換する規則を定義する。

この classifier は coverage floor であり、最適化器ではない。複数 pattern が一致した場合、期待結果は必要 document、evidence item、gate の和集合とする。LLM の "minor"、"simple"、"not needed"、"skip" などの文言は finding としてのみ扱い、必要 document を削減してはならない。

## 0. test strategy と verification strategy

本書は右腕 obligation の両面を担う。

- **Test strategy（テスト戦略）** は、変更に必要な L7/L8/L9/L12/L14 の test-design artifact と oracle を決定する。
- **Verification strategy（検証戦略）** は、変更後の system が実際に実行され、意図した behavior を満たしたことを示す実証 evidence を決定する。

unit / integration / system / acceptance / operational test の行は必要だが、fired、used、works、shipped、blocked、recovered、observed などの反証可能な runtime claim にはそれだけでは不十分である。これらの claim には runtime provenance が必要である。つまり session id、command または adapter surface、source category、timestamp、event を design / test-design pair へ接続する evidence path を記録する。projection-only row は traceability を支えられるが、それだけで verification claim を close することはできない。

implementation valley では、L7 unit test を Red/Green proof として使ってよい。ただし runtime behavior を主張する capability は、acceptance 前に RUN & Debug verification slot も予約しなければならない。意図した adapter/runtime で capability を実行し、実 provenance を capture したうえで、その evidence に対して trace/review gate を実行する。これは後続の L7.5 RUN & Debug phase のための設計時 contract である。

## 1. coverage tier（被覆段階）

| Tier | 意味 | 必須 test-design response |
|---|---|---|
| G0 | ドキュメントのみ、または product behavior 変更なし。 | trace/audit evidence を保持する。paired design artifact なしに implementation-only work を作らない。 |
| G1 | stable contract を持つ狭い local behavior。 | L7 unit oracle と paired L6 design contract を要求する。 |
| G2 | 単一 artifact family、または低リスクの UI/data/API 変更。 | L7 と最寄りの pair test design を要求する。通常は L12 acceptance または L8 integration。 |
| G3 | 複数 document にまたがる feature、UI flow、API/data coupling、または drive confidence が低い変更。 | L7/L8 と acceptance trace を要求する。cross-artifact trace evidence を含める。 |
| G4 | security、privacy、NFR、migration、release、operational、または複数 pattern の高リスク変更。 | 該当する L12 または L14 とあわせて L7/L8/L9 を要求し、human/risk approval evidence を含める。 |
| G5 | implementation shape が未確定の discovery/research。 | G1-G4 へ縮約する前に research decision evidence を要求する。unknown は coverage を減らさず増やす。 |

## 2. pattern から test-design への対応

| Coverage pattern | L7 unit | L8 integration | L9 system | L12 acceptance | L14 operational | 補足 |
|---|---|---|---|---|---|---|
| `screen-ui` | behavior がある場合は component/render contract。 | 存在する場合は UI state と API/model boundary。 | multi-screen workflow と navigation behavior。 | user-visible workflow と PO acceptance で必須。 | operational observability または dashboard behavior が変わる場合のみ必須。 | L1/L2 screen docs と cross-artifact trace が必要。 |
| `business-flow` | local rule がある場合は business rule oracle。 | workflow が module、state、adapter boundary を跨ぐ場合に必須。 | end-to-end business process と alternate path behavior で必須。 | PO-visible flow acceptance で必須。 | operator procedure、monitoring、recovery が変わる場合に必須。 | business flow evidence は requirements、screen flow、function behavior、acceptance trace を接続する。 |
| `frontend-design` | logic がある場合は token/component function oracle。 | shared の場合は design token/component integration。 | cross-screen の場合は accessibility と visual consistency を system behavior として扱う。 | user-facing 変更で必須。 | operator dashboard behavior が変わる場合を除き通常は reference のみ。 | external UI/UX template は、HELIX evidence へ変換しない限り reference である。この行は **verification (right-arm)** routing を示す。**design (left-arm) の FE/UI doc per V-model layer (L0-L14)** は [document-system-map §1c](../../governance/document-system-map.md) で定義する。 |
| `ux-research-usability` | 通常は unit-level 対象外。 | 通常は integration-level 対象外。 | usability risk が system scenario coverage を要求する場合がある。 | acceptance evidence または UAT input として必須。 | post-release usability を測定する場合は operations feedback loop を任意で扱う。 | research は evidence を豊かにするが、必要 trace docs の代替にはならない。 |
| `api-if` | request/response parser と validation oracle。 | adapter/contract boundary で必須。 | API behavior が end-to-end workflow に影響する場合に必須。 | externally visible behavior が変わる場合に必須。 | API availability または runbook が変わる場合に必須。 | negative/error contract case を含める必要がある。 |
| `data-db` | schema/model/invariant oracle。 | persistence/query boundary で必須。 | state consistency と migration behavior で必須。 | business-visible data が変わる場合に必須。 | migration/recovery/backup concern で必須。 | persisted change には physical data と trace evidence が必須。 |
| `backend-function` | 必須。 | 複数 module または adapter が関与する場合に必須。 | workflow/CLI/system behavior が変わる場合に必須。 | behavior が user/business visible な場合に必須。 | operational behavior が変わる場合を除き任意。 | implementation-only backend work を防ぐ。 |
| `batch-report` | processing rule、filter、grouping、idempotency。 | source data から processor/output への boundary で必須。 | schedule、retry、volume、failure behavior で必須。 | output が user/business-visible な場合に必須。 | job operation、monitoring、rerun、recovery で必須。 | batch/report evidence には large-volume case と failure case を含める必要がある。 |
| `report-output` | 該当する場合は formatting helper oracle。 | data-to-output rendering boundary で必須。 | output lifecycle と consumer workflow で必須。 | sample output acceptance で必須。 | operations が generation/delivery を所有する場合に必須。 | output layout、sort/grouping、format、encoding は evidence 対象である。 |
| `async-job-flow` | retry/idempotency helper oracle。 | queue/message/worker boundary で必須。 | ordering、replay、dead-letter、recovery で必須。 | business-visible completion/failure が存在する場合に必須。 | runbook、alert、recovery で必須。 | failure path 欠落は under-design である。 |
| `notification-message` | template/recipient rule oracle。 | delivery adapter boundary で必須。 | delivery failure と privacy behavior で必須。 | user-facing notification behavior で必須。 | operations が delivery を monitoring する場合に必須。 | 関連する場合は locale/timezone と redaction case を含める必要がある。 |
| `common-component` | shared component oracle が必須。 | shared component の consumer で必須。 | component が複数 workflow に影響する場合に必須。 | user-visible な場合に必須。 | 任意。 | hidden blast radius を避けるため、consumer を trace する必要がある。 |
| `security-privacy` | negative authorization と redaction oracle が必須。 | auth/session/permission boundary で必須。 | abuse case と cross-module enforcement で必須。 | role/permission behavior の acceptance で必須。 | auditability と incident response で必須。 | 少なくとも G4 へ escalate し、human approval evidence を要求する。 |
| `error-observability-audit` | error taxonomy と redaction oracle。 | logging/audit/alert integration で必須。 | failure observability behavior で必須。 | user-facing failure が変わる場合に必須。 | monitoring、alert、audit operations で必須。 | dashboard screenshot だけでは十分な evidence ではない。 |
| `ops-release-migration` | deterministic な場合は migration/release helper oracle。 | migration/cutover boundary で必須。 | rollback、compatibility、deployment flow で必須。 | behavior change が user に release される場合に必須。 | cutover、runbook、rehearsal evidence で必須。 | executable または reviewable oracle なしの operational prose は不可。 |
| `nfr-quality` | measurable local invariant に限り必須。 | performance/security/reliability boundary で必須。 | system quality scenario で必須。 | acceptance threshold が business-visible な場合に必須。 | operations-grade NFR で必須。 | generic NFR wish は measurable grade/evidence row へ変換する必要がある。 |
| `test-design` | L7 oracle generation で必須。 | boundary example と GWT で必須。 | system scenario で必須。 | acceptance criteria で必須。 | 該当する場合は operational criteria で必須。 | test template は oracle substance を追加する場合のみ取り込む。 |
| `workflow-gate` | gate/routing function contract で必須。 | CLI/gate/state integration で必須。 | end-to-end workflow と review-tier behavior で必須。 | process acceptance が変わる場合に必須。 | operational gate/runbook behavior が変わる場合に必須。 | generic external process template adoption ではなく HELIX-specific として扱う。 |
| `agent-orchestration` | slot/roster/model policy oracle で必須。 | provider/adapter/handover boundary で必須。 | mode fallback と cross-runtime behavior で必須。 | user-facing workflow が変わる場合に必須。 | handover/recovery operations で必須。 | external agent template は、HELIX guard evidence へ変換しない限り reference である。 |
| `discovery` | decision が scope を狭めるまで unit coverage は不要。 | executable な場合のみ prototype integration evidence。 | measurable な場合のみ system hypothesis evidence。 | continue/pivot/reject の decision evidence が必須。 | operational learning evidence は任意。 | G5 は document 削減を許可しない。evidence が存在するまで縮約を延期する。 |

## 3. research adoption rule（調査採用ルール）

| Disposition | HELIX での使い方 | Rejection guard |
|---|---|---|
| `incorporate` | template を deterministic な required docs、evidence、test case へ変換する。 | screenshot、generic prose のみ、または oracle 欠落なら reject する。 |
| `reference` | vocabulary/checklist を measurable HELIX evidence の prompt として使う。 | pair artifact または trace の代替になるなら reject する。 |
| `helix-specific` | HELIX design を source of truth とし、external material は background としてのみ使う。 | HELIX gate、role、V-model pair と衝突する external template は reject する。 |
| `exclude` | required coverage から外す。 | marketing template、vendor-only format、LLM-minimal-design claim は除外したままにする。 |

## 4. 必須 test oracle

| Oracle ID | Target | 期待 behavior |
|---|---|---|
| DOCROUTE-U-01 | `classifyProposalDocumentCoverage` | 複数 matched pattern は duplicate document row なしで union coverage を生成する。 |
| DOCROUTE-U-02 | `classifyProposalDocumentCoverage` | shrinkage wording は `llm-shrinkage-ignored` を emit し、granularity を下げない。 |
| DOCROUTE-U-03 | `classifyProposalDocumentCoverage` | security/privacy、migration、production、external API risk は approval evidence 付きで少なくとも G4 へ escalate する。 |
| DOCROUTE-U-04 | `classifyProposalDocumentCoverage` | discovery/research term は narrowing evidence が存在するまで G5 を維持する。 |
| DOCROUTE-IT-01 | `helix task classify --design-docs --json` | CLI JSON は base task classification と document coverage の両方を含む。 |
| DOCROUTE-IT-02 | research adoption output | adopt/reference/exclude decision は明示され、取り込まないものの理由を説明する。 |
| DOCROUTE-ST-01 | cross-pattern proposal | L7/L8/L9/L12/L14 requirement は上記 tier と pattern table に一致する。 |

## 5. guardrail（防護規則）

- 必須 document は additive である。
- unknown または low-confidence classification は coverage を増やす。
- LLM wording は必須 document を削減できない。
- external template は HELIX pair artifact、trace、gate evidence を代替できない。
- 取り込まれた template はすべて testable oracle、measurable threshold、required evidence item、または required document row を追加しなければならない。
- mini/spark subagent は optimization lane のみである。`T2-mini` は research、adoption split、document inventory work 用で、`T2-spark` は bounded low-risk implementation または lint/test patch 用である。ownership が disjoint である場合、複数の `T2-mini` と `T2-spark` subagent は並列実行してよい（`PROPOSAL_SUBAGENT_LANES` 由来の `parallel_slots`）。ただし G4/G5 risk を close したり、frontier work を authorize したり、required document set を削減したりしてはならない。guard marker: cheap lane cannot close G4/G5 risk。

## 6. subagent routing oracle（subagent routing の oracle）

| Oracle ID | Target | 期待 behavior |
|---|---|---|
| DOCROUTE-U-05 | cheap parallel lanes | low-risk G1/G2 work は `docs:T2-mini` を recommend し、bounded implementation には `se:T2-spark` を recommend してよい。 |
| DOCROUTE-U-06 | risk escalation | G4/G5 または risk-flagged work は gated `qa:T0-frontier` または `tl:T0-frontier` judgement を recommend し、closing lane として `T2-spark` を recommend しない。 |
| DOCROUTE-U-07 | Japanese proposal terms | report output、async queue、notification、shared component、security、operations の日本語 term は English term と同じ coverage pack を trigger する。 |
| DOCROUTE-U-08 | parallel subagent lanes | recommended mini/spark lane は `parallel_slots > 1`、`ownership` disjointness、`closing_authority=false` を expose する。frontier judgement は `parallel_slots=1`、single judgement ownership、`closing_authority=true` を expose する。 |
| DOCROUTE-IT-03 | `team suggest --design-docs` bridge | proposal mini/spark/T1 lane は ownership shard と model override を持つ具体的な team member になる。`T0-frontier` は judgement guidance のままで、executable team member として emit されない。 |
