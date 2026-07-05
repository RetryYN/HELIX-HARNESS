---
plan_id: PLAN-L3-04-upstream-schedule-reconciliation
title: "PLAN-L3-04: upstream FR residual schedule reconciliation"
kind: add-design
layer: L3
drive: fullstack
status: confirmed
created: 2026-06-12
updated: 2026-06-22
review_evidence:
  - reviewer: PM (Opus) verification (intra_runtime_subagent)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-22"
    tests_green_at: "2026-06-22"
    verdict: pass
    scope: "add-design 増分 (upstream FR residual → V-model closure table + 9-mode drive-model passage certificate + rule-automation-closure 表) の status drift (src merge 済なのに draft 放置) を解消し confirmed 化。成果物 src/lint/{rule-automation-closure,drive-model-passage,fr-roadmap-coverage}.ts + src/handover/index.ts は 2026-06-12 (239cb32) で merge 済。機械再検証: ①4 src module 全実在 ②doctor に配線 load-bearing (rule-automation-closure / drive-model-passage / fr-roadmap-coverage 各 doctor refs ≥3) ③§2.3 rule-automation-closure 表は全 5 行 closed (automation owner 実在) ④Vitest 787/787 green / doctor EXIT=0。AC §4 (A-133 audit 実在 / drive-model passage 9 mode / DB registration gate / rule automation owner) は merged + wired + tested で充足。"
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
agent_slots:
  - role: tl
    slot_label: "TL - upstream FR residual to V-model WBS reconciliation"
generates:
  - artifact_path: docs/plans/PLAN-L3-04-upstream-schedule-reconciliation.md
    artifact_type: markdown_doc
  - artifact_path: .helix/audit/A-133-upstream-vmodel-coverage-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/rule-automation-closure.ts
    artifact_type: source_module
  - artifact_path: src/lint/drive-model-passage.ts
    artifact_type: source_module
  - artifact_path: src/lint/fr-roadmap-coverage.ts
    artifact_type: source_module
  - artifact_path: src/handover/index.ts
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L3-00-master.md
  requires:
    - docs/design/harness/L1-requirements/functional-requirements.md
    - docs/design/harness/L3-functional/functional-requirements.md
    - docs/design/harness/L3-functional/roadmap.md
    - docs/plans/PLAN-L7-44-harness-db-master.md
    - .helix/audit/A-133-upstream-vmodel-coverage-audit.md
  blocks:
    - docs/plans/PLAN-L7-50-fr-roadmap-coverage-lint.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L3-04: upstream FR 残余 schedule reconciliation

## §0 Objective

完了済みの L7 segment を L7 全体完了として読んでしまった scope error を補正する。この PLAN は upstream residual requirements を V-model closure table と子 implementation WBS 候補へ変換する。

これは L3 schedule/design correction であり、それ自体では新規 L7 source work を承認しない。

## §0.1 絶対 No-Omission Principle

この PLAN は absolute no-omission principle を採用する。

- Missing row = `gap`.
- Ambiguous row = `gap`.
- Carry-only row = complete ではない。
- Registered-roadmap green = feature-list green ではない。
- Segment completion は対象 segment 名を明記する。
- 行に requirement、basic design、detailed design、function design、test design、WBS、source target、test target、coverage gate evidence、または明示的な `N/A` reason が揃うまで、L7 implementation は開始しない。
- residual row に `gap`、`scheduled`、`parked`、`PO decision` が残る間は、handover で "no next action" と書かない。

## §1 欠落理由

| 理由 | Evidence | 原因 | 対策 |
|---|---|---|---|
| Carry を coverage として扱った | `g3-trace` は全 FR-L1 について L3 FR または carry を受理する | Carry は有効な routing state だが、scheduled implementation span ではない | residual matrix を追加し、全 carry を child PLAN、park、または明示的 PO decision へ対応させる |
| Roadmap rollup が registered plans を測った | `doctor` は roadmap-rollup green を示す | Program-band coverage は feature-list coverage ではない | この design 後に `fr-roadmap-coverage` lint を追加する |
| L7 segment wording が過負荷だった | `PLAN-L7-44` は harness.db segment だが、handover は no next action と述べた | "L7 roadmap complete" と "L7 layer complete" が混同された | handover を補正し、segment-qualified wording を必須にする |
| V-model evidence が分散していた | pair-freeze / l6-fr-coverage / impl-plan-trace / oracle-test-trace が分離している | FR から code/test coverage までを 1 行で示す表がない | requirement/design/test/schedule/code/test columns を持つ統合表を作る |

## §2 V-model Table 必須

| 範囲 | 必須 table columns |
|---|---|
| 要件定義範囲 | `BR`, `FR-L1`, priority, user-facing requirement, carry reason |
| 基本設計範囲 | L4 architecture/module/flow doc, design gate evidence |
| 詳細設計範囲 | L5 D-DB/D-CONTRACT/D-STATE/physical-data doc |
| 機能設計範囲 | L6 function contract, invariant, explicit defer marker |
| テスト設計範囲 | L7/L8/L9 oracle ID, GWT, expected fixture |
| 工程表範囲 | PLAN ID, roadmap span, dependency, L4 sprint, feature flag, rollback |
| 実装範囲 | `src` file, exported function/module, implementation PLAN |
| テスト範囲 | `tests` file, oracle citation, coverage gate |

## Section 2.1 Drive-model Passage Certificate 必須

residual table には、各 drive model / entry mode ごとの passage certificate を分けて含める。これは PLAN frontmatter の `drive` とは異なる。`drive` は specialist axis であり、下表の行は Forward へ再入場しなければならない workflow mode である。

| Drive model / entry mode | 必須 certificate columns |
|---|---|
| Discovery | trigger、仮説である hypothesis、S3 verification evidence、S4 decision、Forward target、Reverse promotion requirement、residual status |
| Scrum | feedback signal、increment evidence、acceptance evidence、Reverse fullback PLAN、Forward target、pair-freeze gate、residual status を記録する |
| Reverse | reverse type、R0 evidence、R1/R2 observed contracts または skip reason、R3 PO validation、R4 `forward_routing`、missing pair artifacts、re-entry gate、residual status |
| Recovery | incident class、approved scope、root cause、reopen point、correction artifact、再発防止の recurrence-prevention guard/test/rule、Forward target、residual status |
| Incident | production impact、triage、hotfix PLAN、stabilization evidence、recovery PLAN、恒久対応の permanent-fix Forward route、postmortem、residual status |
| Refactor | behavior-invariance proof、affected modules、regression tests、design unchanged proof、behavior changed 時の escalation route、residual status |
| Retrofit | impact matrix、migration/rollback plan、regression/performance/data-integrity evidence、変更時の design/requirement route、residual status |
| Add-feature | parent PLAN、requirement row、add-design row、add-impl row、test-design oracle、WBS、implementation target、Reverse back-fill state、residual status を記録する |
| version-up | version_target marker、target version または release trigger、activation packet、parked review record、action-binding approval boundary、Forward/add-feature activation target、residual status |
| Research | decision question、options、ADR、rejected options、research memo、Forward target、feasibility が不明な場合の Discovery switch、residual status |

Passage rule: 行が再入場先の Forward layer/gate を明記するか、明示的に `gap`、`parked`、`PO decision` である場合を除き、drive model を closed として扱わない。

## Section 2.2 DB Registration Gate 必須

drive-model execution が harness.db に表現されているか、明示的に non-closed と記録されていない限り、passage certificate は complete ではない。

| DB table | Required meaning |
|---|---|
| `drive_runs` | drive-model / entry-mode execution lane ごとに 1 行を置く。 |
| `workflow_runs` | drive model が phases または gates を持つ場合、`drive_run_id` で linked された phase readiness rows を置く。 |
| `hook_events` | `session_id` と `plan_id` で linked された SessionStart / PostToolUse / Stop / gate hook evidence を置く。 |
| `model_runs` | `plan_id` で linked された Codex / Claude / worker / reviewer execution evidence を置く。 |

Fail-close rule: drive model が completed でも `drive_runs` row が存在しない場合、PLAN docs と local tests が green でも certificate row は `gap` のままにする。

## Section 2.3 Rule Automation Closure 必須

Text-only rules は closed として数えない。この PLAN が導入する各 rule は、以下の automation owners のいずれかへ routing するか、non-closed のままにする。

| Rule | 必須 automation owner | Current status |
|---|---|---|
| FR/carry/addendum -> WBS/L7 coverage | `fr-roadmap-coverage` lint + doctor wiring を必須にする | `closed` |
| Drive-model passage certificate | new analyzer/checker + doctor または plan-lint wiring | `closed` |
| Drive-model DB registration | projection writer + `drive_runs` / `workflow_runs` / `hook_events` / `model_runs` check を必須にする | `closed` |
| Handover completion wording | handover generator guard + doctor/handover discipline check を必須にする | `closed` |
| Missing/ambiguous row fail-close | default `gap` を持つ table analyzer | `closed` |

Rule closure rule: rule に automation owner がない場合、その rule が governance、design、PLAN、handover docs に書かれていても row は `gap` のままにする。

## §3 WBS

| WBS ID | Task（作業） | Owner（担当） | Dependencies（依存） | Duration（期間） | Env | L4 Sprint | feature flag | rollback |
|---|---|---|---|---|---|---|---|---|
| WBS-L3-04-01 | L1/L3 carry と A-122/A-124/A-125/A-126 addenda から FR residual matrix を作る | TL | none | 0.5d | docs | .1a | N/A | この PLAN と audit doc を revert 対象にする |
| WBS-L3-04-02 | residual buckets R1-R9 を child PLAN seeds または明示的 park decisions へ分割する | TL/PO | WBS-L3-04-01 | 0.5d | docs | .1b | N/A | draft child PLANs を archive し、carry-only state を復元する |
| WBS-L3-04-03 | 全 10 entry modes の drive-model passage certificate table を作る | TL | WBS-L3-04-01,WBS-L3-04-02 | 0.5d | docs | .2 | N/A | 未解決 mode rows はすべて gap として保持する |
| WBS-L3-04-04 | DB registration gate を追加し、drive-model passage rows に `drive_runs` / linked projection evidence または non-closed status を要求する | TL | WBS-L3-04-03 | 0.5d | docs/src | .3 | ff_drive_model_db_registration=false | projection writer 拡張までは rule report-only を維持する |
| WBS-L3-04-05 | rule automation closure table を追加し、全 text rule を doctor/plan-lint/vmodel/hook/DB/CI へ対応させるか gap のままにする | TL | WBS-L3-04-01..04 | 0.25d | docs/src | .4 | ff_rule_automation_closure=false | text-only rules は non-closed のままにする |
| WBS-L3-04-06 | `fr-roadmap-coverage` lint を設計し、FR/carry/addendum -> PLAN/WBS/park と drive-model passage row を扱う | TL | WBS-L3-04-01..05 | 0.5d | docs/src | .5 | ff_fr_roadmap_coverage_lint=false | doctor wiring を disable し、report-only output を維持する |
| WBS-L3-04-07 | segment-scoped completion 用の handover completion wording guard を追加する | TL | WBS-L3-04-01 | 0.25d | docs/src | .5 | N/A | generated handover pointer を復元し、audit finding は保持する |
| WBS-L3-04-08 | missing/ambiguous residual row が `gap` のまま completion wording を block する fail-close rule を追加する | TL | WBS-L3-04-01..07 | 0.25d | docs/src | .6 | ff_fr_roadmap_coverage_lint=false | review まで rule report-only を維持する |
| WBS-L3-04-09 | doctor、vmodel lint、rg old-premise checks、targeted tests で表を検証する | QA/TL | WBS-L3-04-01..08 | 0.25d | local | .7 | N/A | PLAN draft を維持し、未解決 buckets は gap として記録する |

## §4 Acceptance Criteria（受入条件）

- A-133 audit が存在し、V-model が行ごとに close しているかを述べる。
- Handover は、全 L7 work に next action がないとは述べない。
- Residual buckets R1-R9 は、child PLAN seeds、明示的 park、または PO decision items のいずれかである。
- Drive-model passage certificate rows は全 10 entry modes に存在し、Forward re-entry evidence または non-closed status を示す。
- Drive-model passage rows は harness.db registration evidence（`drive_runs` と linked workflow/hook/model evidence）を要求し、なければ non-closed のままにする。
- 新たに導入する全 rule は automation owner へ対応するか non-closed のままにし、text-only rules で row を close しない。
- Future automation candidate `fr-roadmap-coverage` は implementation 前に定義されている。
- Verification evidence は `doctor`、`vmodel lint`、docs old-premise `rg` checks を記録する。
- missing または ambiguous な row は `gap` のままにし、implicit coverage は許可しない。
