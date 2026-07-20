---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
legacy_physical_layer: L3
l3_progression_marker: HELIX:L3-PROGRESSION-AUTHORITY:v1
l3_progression_authority: docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
plan_id: PLAN-L3-05-harness-telemetry-closure
title: "PLAN-L3-05: harness telemetry and self-improvement closure"
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
    scope: "add-design 増分 (telemetry / self-improvement closure audit + 4 lint + dynamic skill recommender) の status drift (src merge 済なのに draft 放置) を解消し confirmed 化。成果物 src/lint/{telemetry-closure,cycle-p4-verification,skill-assignment,project-hook}.ts + src/skills/recommend.ts + src/doctor 配線 + 6 test は 2026-06-12 (239cb32) で merge 済。機械再検証: ①全 src module 実在 ②doctor の hard gate として稼働 (skill-assignment hard gate / Cycle P4 closure audit hard gate / telemetry-closure 各 doctor refs ≥3) ③skills/recommend は cli.ts + workflow/contracts.ts に配線 ④Vitest 787/787 green / doctor EXIT=0。AC §3 (A-134 audit / doctor が non-closed rows を surface / 各 self-improvement 領域が evidence 無しでは closed にできない fail-close) は merged + wired + tested で充足。"
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
agent_slots:
  - role: tl
    slot_label: "TL - telemetry closure and self-improvement audit"
generates:
  - artifact_path: docs/plans/PLAN-L3-05-harness-telemetry-closure.md
    artifact_type: markdown_doc
  - artifact_path: .helix/audit/A-134-harness-telemetry-self-improvement-audit.md
    artifact_type: markdown_doc
  - artifact_path: .helix/audit/A-136-cycle-p4-verification-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/telemetry-closure.ts
    artifact_type: source_module
  - artifact_path: src/lint/cycle-p4-verification.ts
    artifact_type: source_module
  - artifact_path: src/lint/skill-assignment.ts
    artifact_type: source_module
  - artifact_path: src/lint/project-hook.ts
    artifact_type: source_module
  - artifact_path: src/skills/recommend.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/skill-recommend.test.ts
    artifact_type: test_code
  - artifact_path: tests/issue-queue.test.ts
    artifact_type: test_code
  - artifact_path: tests/project-hook.test.ts
    artifact_type: test_code
  - artifact_path: tests/telemetry-closure.test.ts
    artifact_type: test_code
  - artifact_path: tests/cycle-p4-verification.test.ts
    artifact_type: test_code
  - artifact_path: tests/skill-assignment.test.ts
    artifact_type: test_code
  - artifact_path: docs/skills/review-checklist.yaml
    artifact_type: skill_doc
dependencies:
  parent: docs/plans/PLAN-L3-00-master.md
  requires:
    - docs/design/harness/L3-functional/functional-requirements.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L8-integration-test-design.md
    - docs/test-design/harness/L9-system-test-design.md
    - .helix/audit/A-134-harness-telemetry-self-improvement-audit.md
  blocks:
    - docs/plans/PLAN-L7-51-skill-injection-runtime.md
    - docs/plans/PLAN-L7-52-telemetry-feedback-loop.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L3-05: harness telemetry と self-improvement closure

## Section 0 目的

harness measurement、self-improvement、team-standard project hook feature の false closure を防ぐ。

この PLAN は HELIX を TDD team standardization development harness として扱う。dynamic skill injection、drive-model skill injection、firing-rate metrics、retry/bottleneck analytics、trouble logs、GitHub issue routing、project-local hooks、improvement-loop automation について、implementation evidence が出るまで non-closed に保つ closure audit、WBS、doctor-visible lint を作る。

## Section 0.1 絶対 no-omission 原則

- row が 0 件の schema table は operational evidence ではない。
- design function name は CLI/runtime feature ではない。
- classification のない hook/session log は trouble-log system ではない。
- upstream event capture のない metrics command は end-to-end telemetry loop ではない。
- GitHub connector capability は、dry-run、approval、back-reference rule が freeze されるまで approved product feature ではない。
- self-improvement loop は、measurement row が finding、feedback event、improvement backlog または issue-queue entry、doctor-visible closure evidence を生成して初めて closed とみなす。

## Section 1 Gap 概要

| 領域 | 現在の evidence | Gap |
|---|---|---|
| L-unit dynamic skill injection | L3 FR と L6 function design は `skill suggest` / `suggestSkillInjection` を定義し、L8/L9 test design は integration/system test を挙げる | `helix skill suggest` command、runtime recommendation writer がなく、`skill_recommendations=0` |
| Drive-model skill injection | Drive model table と passage certificate は存在する | drive model / entry mode で条件付けされた skill recommender がない |
| Skill firing parameters | `skill_recommendations` と `skill_invocations` table は存在する | それらを populate する projection writer がなく、firing parameter capture もない |
| Trouble logs | session log と `hook_events=3212` は存在する | trouble taxonomy や feedback/improvement row への bridge がない |
| GitHub issue creation outside Forward | GitHub connector は環境に存在し、`issue_queue` dry-run entry、human approval guardrail decision、back-reference column は利用可能 | actual GitHub mutation はこの implementation scope 外であり、external issue-id back-reference の populate は別途 human-approved creation 後だけ記録する |
| Drive firing-rate measurement | `drive_runs=210` は存在する | firing-rate metrics は `quality_signals` へ projection 済み。per-runtime attribution は拡張余地がある |
| Retry and bottleneck detection | `workflow_runs=7`、`workflow_retry_groups`、`retry_events`、bottleneck quality signal は存在する | per-session attribution は拡張余地があるが、DB projection path は存在する |
| Self-improvement loop | `quality_signals`、`feedback_events`、`issue_queue`、`improvement_log` は rebuild で projection される | actual GitHub mutation と external issue-id return は approval-gated のまま |
| Project hook configuration | `.claude/settings.json` は repository-local Claude Code hook configuration として存在する | TDD team standard hook が project-local / package-local に留まることを証明する doctor-visible check がない |

## Section 2 WBS 作業表

| WBS ID | 作業 | Owner | Dependencies | 期間 | Env | L4 Sprint | feature flag | rollback |
|---|---|---|---|---|---|---|---|---|
| WBS-L3-05-01 | DB count evidence と no-omission rule を持つ A-134 telemetry closure audit を作る | TL | none | 0.25d | docs | .1 | N/A | A-134 を削除し、open finding を backlog に残す |
| WBS-L3-05-02 | required measurement row ごとに evidence、owner、status を検証する telemetry closure lint を追加する | TL | WBS-L3-05-01 | 0.25d | src/tests | .1 | N/A | doctor wiring を無効化し、lint は test-only にする |
| WBS-L3-05-03 | telemetry closure を doctor の hard/fail-close surface として配線する | TL | WBS-L3-05-02 | 0.25d | src | .1 | N/A | doctor call を外し、A-134 を manual に戻す |
| WBS-L3-05-04 | dynamic L-unit と drive-model skill recommender CLI を実装する | TL/worker | WBS-L3-05-01..03 | 1.0d | src/tests/docs | .2 | ff_skill_recommendation_runtime=false | `skill suggest` を hidden のままにし、table は non-closed に保つ |
| WBS-L3-05-05 | plan、layer、drive、source、acceptance 別の skill invocation projection と metrics を追加する | TL/worker | WBS-L3-05-04 | 1.0d | src/tests/db | .2 | ff_skill_invocation_projection=false | migration rollback で new projection row を drop する |
| WBS-L3-05-06 | drive firing-rate、retry、bottleneck analytics を `quality_signals` へ追加する | TL/worker | WBS-L3-05-05 | 1.0d | src/tests/db | .3 | ff_telemetry_quality_signals=false | metrics command を無効化し、raw row を保持する |
| WBS-L3-05-07 | hook/session/failure row から trouble taxonomy と feedback-event bridge を追加する | TL/worker | WBS-L3-05-06 | 1.0d | src/tests/db | .3 | ff_trouble_feedback_bridge=false | classifier を report-only に保つ |
| WBS-L3-05-08 | human approval gate 付きの improvement backlog writer と GitHub issue dry-run queue を追加する | TL/PO | WBS-L3-05-07 | 1.0d | src/tests/docs | .4 | ff_issue_queue=false | local backlog のみに保ち、この implementation では GitHub を mutate しない |
| WBS-L3-05-09 | repo-local TDD team standard hook を証明する project-hook lint を追加する | TL/worker | WBS-L3-05-04 | 0.5d | src/tests/docs | .3 | ff_project_hook_lint=false | `.claude/settings.json` は manual だが doctor-visible に保つ |
| WBS-L3-05-10 | closure 前に doctor、db rebuild、metrics、tests が nonzero quality/feedback/skill row を証明することを確認する | QA/TL | WBS-L3-05-04..09 | 0.5d | local | .5 | N/A | A-134 row を `partial` または `gap` として reopen する |

## Section 3 受入条件

- A-134 が存在し、required measurement / self-improvement area ごとに telemetry closure row を持つ。
- Doctor が A-134 の non-closed row を surface する。
- `skill_recommendations` と `skill_invocations` が空のままなら、dynamic skill injection を closed と呼べない。
- drive-conditioned recommendation evidence がなければ、drive-model skill injection を closed と呼べない。
- derived `quality_signals`、`findings`、`feedback_events` がなければ、firing-rate、retry、bottleneck、trouble-log analytics を closed と呼べない。
- dry-run queue、human approval semantics、back-reference evidence がなければ、Forward 外の GitHub issue creation を closed と呼べない。
- measurement row が feedback event と tracked backlog または approved issue queue entry を生成するまで、self-improvement を closed と呼べない。
- `.claude/settings.json` が package-local command を使い doctor で check されない限り、project hook を closed と呼べない。
- DB projection、local L8-L14 verification row、source-isolation vocabulary、handover、telemetry、feature residual、placeholder carry boundary がすべて machine checked でなければ、Cycle P4 / L7-DB を closed と呼べない。

## Section 4 現在の gate result

G3 status はこの implementation scope で pass。

理由: closure audit、doctor lint、runtime skill recommendation projection、skill invocation telemetry、operational quality signal、feedback event emission、trouble taxonomy、retry diagnostics、improvement log、GitHub dry-run issue queue、issue back-reference column、human approval guardrail telemetry、project-local hook drift detection は実装済みである。actual GitHub mutation はこの implementation scope 外であり、queue と externally supplied back-reference behavior は tests で cover されている。
