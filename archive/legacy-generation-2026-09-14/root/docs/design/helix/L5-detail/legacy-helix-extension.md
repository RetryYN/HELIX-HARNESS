---
title: "HELIX L5 詳細設計 — 旧 HELIX extension adoption（採用）"
layer: L5
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/legacy-helix-extension.md
related_l4: docs/design/helix/L4-basic-design/legacy-helix-extension.md
---

# HELIX L5 詳細設計 — 旧 HELIX extension adoption（採用）

L4 `HLX-*` boundary（境界）を module / projection / evidence contract（証跡契約）に落とす。

## §1 L5 contract matrix（契約表）対応表

| L3 ID | L5 contract（L5 契約） | 必須 input | contract output（契約出力） | fail-close |
|-------|-------------|----------------|-----------------|------------|
| HLX-FR-01 | HLX-C01 work-preflight-contract | task objective、workflow/layer、Forward return、acceptance、work source、allowed scope | `WorkPreflightDecision` | source/acceptance/scope 欠落、handover/PLAN との conflict、未承認 high-impact operation |
| HLX-FR-02 | HLX-C02 technical-question-gate | question text、question class、TL advisor evidence、bypass reason | `TechnicalQuestionDecision` | 直近 TL evidence の無い technical design question、reason の無い bypass |
| HLX-FR-03 | HLX-C03 detector-axis-registry | detector descriptor、phase gate、result kind、severity、workflow route、finding result kind | `DetectorAxisRoutingDecision` | stub/advisory result を fail-close proof として使う、registry kind と finding kind が一致しない hard gate proof、unknown axis の auto-route |
| HLX-FR-04 | HLX-C04 recommender-catalog-contract | task text、layer/phase、catalog entry、references、recommended role | `RecommendationDecision` | raw legacy path candidate を current path として受理する、trace/reason 欠落 candidate |
| HLX-FR-05 | HLX-C05 run-debug-trace-contract | command/run log、expected action map、runtime surface、correlation id | `RunDebugTraceDecision` | missing action の受理、evidence path/correlation id の無い trace、secret-bearing raw log の保存 |
| HLX-FR-06 | HLX-C06 core-injection-contract | legacy core source、repo-local adapter source、generated target、required markers、consumer mode | `CoreInjectionDecision` | personal absolute path の受理、missing global file を current truth として扱う、marker/provenance 欠落 generated asset |
| HLX-FR-07 | HLX-C07 guard-surface-disposition | hook source、runtime surface、tool matcher、guard intent、parity target、test oracle | `GuardSurfaceDisposition` | unwired guard を active と claim する、unsupported surface の silent pass、deferred reason 欠落 |
| HLX-FR-08 | HLX-C08 agent-role-policy | agent/role source、task class、model family、slot、delegation boundary、review substitute | `AgentRolePolicyDecision` | self-review の受理、approval なしの overpowered role/model 許可、unbounded subagent execution |
| HLX-FR-09 | HLX-C09 workflow-inventory-map | workflow doc、trigger、pillar、layer/gate、current owner、adoption disposition | `WorkflowMappingDecision` | unknown workflow の auto-route、duplicate pillar の二重 count、new-plan marker 欠落 |
| HLX-FR-10 | HLX-C10 data-registry-surface | legacy DB/registry/API source、state kind、projection target、provenance、public read model | `DataSurfaceDecision` | raw legacy DB/state import、provenance 欠落、read-model boundary なしの API expose |
| HLX-FR-11 | HLX-C11 continuous-run-control | trigger、queue lock、timebox、budget profile、stop condition、verification evidence | `ContinuousRunDecision` | uncontrolled auto-run、stop condition 欠落、budget overrun の無視 |
| HLX-FR-12 | HLX-C12 learning-feedback-contract | feedback event、recipe source、learning result、target backlog、evidence link、review state | `LearningFeedbackDecision` | learning result だけで acceptance を close する、unreviewed recipe が current truth を mutate する、evidence link 欠落 |

## §2 integration observation（結合観測）

| Contract（契約） | L8 observation（L8 観測） |
|----------|----------------|
| HLX-C01 | work preflight は objective/source/scope/acceptance が欠落または不整合の場合に edit を block する。 |
| HLX-C02 | technical user question は TL advisor evidence、または documented preference-only bypass を要求する。 |
| HLX-C03 | detector axis registry は routeable finding を emit し、stub/advisory と hard proof を混同しない。registry kind と finding kind が一致しない場合は hard proof に昇格しない。 |
| HLX-C04 | recommender output は traceable であり、旧 runtime candidate は adoption 前に hardened/deferred になる。 |
| HLX-C05 | RUN & Debug trace は command、expected action、observed evidence、missing action、correlation id を join する。 |
| HLX-C06 | core/adapter distribution は repo-local source、generated consumer asset、global-file risk、provenance を分離する。 |
| HLX-C07 | すべての legacy hook capability は explicit wired/deferred/rejected guard-surface disposition を持つ。 |
| HLX-C08 | agent/role/model use は slot、task class、model family、review-substitute policy により bounded になる。 |
| HLX-C09 | workflow inventory は existing pillar/workflow/gate へ map するか、new-plan-required decision を生成する。 |
| HLX-C10 | DB/registry/API concept は provenance 付きで harness.db/read-model boundary 経由に project される。 |
| HLX-C11 | scheduler/continuous-run control は queue lock、budget、timebox、stop condition、evidence を要求する。 |
| HLX-C12 | learning/feedback/recipe event は improvement candidate を作るが、それだけでは acceptance を close できない。 |

## §3 L6 carry（L6 持ち越し）

L6 design はすべての `HLX-C*` contract について function signature と DbC を定義しなければならない。各 contract は paired
`U-HLX-*` oracle を必要とし、§1 の anti-corruption boundary（腐敗防止境界）を維持しなければならない。
