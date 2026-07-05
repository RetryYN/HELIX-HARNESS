---
plan_id: PLAN-L5-08-harness-db-feedback
title: "PLAN-L5-08: harness.db reference-feedback and automation foundation projection"
kind: add-design
layer: L5
sub_doc: physical-data
drive: db
status: confirmed
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-08"
    tests_green_at: "2026-06-08"
    verdict: pass
    scope: "DB reference-feedback add-design: requirements bundle, automation/guardrail/skill-doc foundation review, L5 projection/schema/module/D-API/CLI contracts, and L8 IT-DB/IT-SEARCH/IT-FEEDBACK/IT-AUTOMATION/IT-GUARDRAIL/IT-ASSET-DB pairing."
  - reviewer: claude-opus-4-8
    review_kind: cross_agent
    reviewed_at: "2026-06-08"
    tests_green_at: "2026-06-08"
    verdict: pass
    scope: "Cross-agent review (Claude): harness.db 拡張の substance 検証 — 要件 §7 bundle (新 FR 発明せず既存束ね)、physical-data §9 の 17 projection table + metrics + invariant 実在、L8 IT-DB/SEARCH/FEEDBACK/AUTOMATION/GUARDRAIL/ASSET-DB の GWT + negative/edge。secret/PII 非保存・automation readiness 証跡必須・guardrail human-required 非降格を確認。harness.db は柱3 (フィードバック機構) の実体化、ADR-007 で ADR-001 deferral を supersede。"
    worker_model: codex
    reviewer_model: claude-opus-4-8
created: 2026-06-08
updated: 2026-06-08
owner: PM (user) / TL (Codex)
agent_slots:
  - role: tl
    slot_label: "TL - DB feedback mechanism L5 add-design and self-review"
  - role: qa
    slot_label: "QA - L8 integration-test pairing review"
generates:
  - artifact_path: docs/design/harness/L1-requirements/functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/internal-processing.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/if-detail.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-integration-test-design.md
    artifact_type: test_design
skip_sub_doc: []
pair_artifact: docs/test-design/harness/L8-integration-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_br: docs/design/harness/L1-requirements/business-requirements.md
next_pair_freeze: L8
dependencies:
  parent: docs/plans/PLAN-L5-01-physical-data.md
  requires:
    - docs/design/harness/L1-requirements/functional-requirements.md
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/test-design/harness/L8-integration-test-design.md
  references:
    - docs/plans/PLAN-L5-00-master.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
    - https://www.sqlite.org/fts5.html
    - https://opentelemetry.io/docs/specs/semconv/
    - https://www.w3.org/ns/prov/
---

# PLAN-L5-08: harness.db reference-feedback と automation foundation projection

## §0 PLAN

User request bundle: mechanical checks と SQLite reference structure は、V-model state、drive models、logs、skill/model metrics、workflow automation、guardrail safety、skill/roster/command documentation assets を横断し、omissions、dependencies、distortion、feedback opportunities を検出しなければならない。既存 FR-L1 coverage は存在するが散在していたため、この PLAN は request を requirements に束ね、不足していた detail を L5 に降下させる。

## §1 Objective

`.helix/harness.db` は単なる local cache ではなく、projection と feedback mechanism であることを明確にする。V-model state、drive/model run state、session/hook/gate logs、skill firing metrics、workflow automation readiness、guardrail decisions、asset catalog/search index、quality feedback signals を支えなければならない。

## §2 Background

- FR-L1-06/07 は state DB と auto-registration をすでに要求している。
- FR-L1-19/20 は learning/observability と skill firing logs をすでに要求している。
- FR-L1-37/39/40/41 は model/effort recommendation、task scoring、drive-separated state、drive detection をすでに要求している。
- FR-L1-05/09/13/17/33/46/47/48/49 は workflow automation gates、guardrails、CI/review safety、internal asset curation/drift detection をすでに要求している。
- Gap: table-level projection、join keys、skill firing rate calculation、workflow readiness、guardrail decision ledger、asset catalog/search surface、feedback event contract が L5 で明示されていなかった。
- External reinforcement: SQLite FTS5 は rebuildable external/contentless search indexing を支え、OpenTelemetry semantic conventions は traces/metrics/logs/events の共通 naming scheme を提供し、W3C PROV は entity/activity/agent provenance model を与える。これらは L5 runtime dependency を追加せずに naming と reference-graph design を強化する。

## §3 工程表 (Step + 進捗)

### Step 1: [直列] 要求/要件 bundle の明文化
直列理由: downstream_dependency
functional requirements と governance requirements に、DB reference-feedback 要求の covered FR / gap / L5 descent を追記する。

### Step 2: [直列] physical-data projection schema 追加
直列理由: downstream_dependency
Step 1 の bundle を `harness.db` table / index / invariant に落とす。

### Step 3: [直列] module boundary 追加
直列理由: downstream_dependency
state-db / projection-writer / search-index / feedback-engine / automation-readiness / guardrail-ledger / asset-catalog の責務と依存方向を L5 module-decomposition に追加する。

### Step 4: [直列] D-API / DbC 追加
直列理由: downstream_dependency
recordProjectionEvent / rebuildHarnessDb / computeSkillMetrics / findReference / emitFeedbackEvents / evaluateAutomationReadiness / recordGuardrailDecision / catalogAutomationAssets の processing flow と DbC を追加する。

### Step 5: [直列] CLI / external contract 追加
直列理由: downstream_dependency
`helix db status/rebuild`、`helix find`、`helix metrics skill`、`helix feedback list`、`helix automation readiness`、`helix guardrail status`、`helix asset catalog` の出力契約と secret 非保存を定義する。

### Step 6: [直列] L8 integration pair 追加
直列理由: downstream_dependency
IT-DB-01..03、IT-SEARCH-01、IT-FEEDBACK-01、IT-AUTOMATION-01、IT-GUARDRAIL-01、IT-ASSET-DB-01 を Given/When/Then 粒度で L8 に追加する。

### Step 7: [直列] review
直列理由: downstream_dependency
self / codex-tl review で、要求→要件→L5→L8 の孤児がないこと、DB が source-of-truth を越権しないこと、automation readiness が証跡なしで ready にならないこと、guardrail human-required を降格しないこと、secret/PII を保存しないことを確認する。

## §3.1 実装計画

- 情報源: `docs/design/harness/L1-requirements/functional-requirements.md`、`docs/governance/helix-harness-requirements_v1.2.md`、`docs/design/harness/L5-detailed-design/physical-data.md`、`docs/test-design/harness/L8-integration-test-design.md`。
- L5 では projection schema、module boundary、D-API、CLI contract、L8 pair を freeze する。
- L6 では function signatures and migration/detail schema を定義する。
- L7 では `bun:sqlite` first / Node fallback adapter、projection writer、search、feedback metrics、automation readiness、guardrail ledger、asset catalog、and tests を実装する。

## §4 DoD

- [x] 要求と既存 FR-L1 の抱き合わせを明文化。
- [x] 不足を table / join key / metric / search / feedback として具体化。
- [x] L5 physical-data / module-decomposition / internal-processing / if-detail に降下。
- [x] L8 IT-DB / IT-SEARCH / IT-FEEDBACK / IT-AUTOMATION / IT-GUARDRAIL / IT-ASSET-DB に GWT 粒度で pair 接続。
- [x] raw transcript / secret / credential / PII を保存しない制約を明記。
- [x] §1.10 工程表に [直列] と理由、review Step、§3.1、§6 を含める。

## §5 関連 PLAN / docs

- 親: PLAN-L5-01-physical-data
- 兄弟: PLAN-L5-02-module-decomposition / PLAN-L5-03-internal-processing / PLAN-L5-04-if-detail
- ペア: docs/test-design/harness/L8-integration-test-design.md

## §6 用語更新

| 用語 (term) | 種別 (type) | 定義 / delta | L0 back-merge |
|---|---|---|---|
| DB reference-feedback mechanism | new | omissions、dependency gaps、distortion、repeated failure patterns の検出に使う `harness.db` projection、search index、quality signals、feedback events。 | not required; L1/L5 scoped |
| skill firing rate | clarified | plan/layer/drive/session ごとの `count(skill_invocations) / count(skill_recommendations)`。 | not required |
| search_index | new | `helix find` 用の rebuildable projection table。authoring source ではない。 | not required |
| automation readiness | clarified | workflow automation の DB-backed ready/blocked/human-required classification。blocking evidence を伴う。 | not required |
| guardrail decision ledger | clarified | silent pass を防ぎ human-signoff boundaries を保持する、agent-guard/review/escalation decisions の projection。 | not required |
| automation asset catalog | clarified | skill/roster/command docs metadata と drift status の searchable projection。prompt bodies は markdown source のまま保持する。 | not required |

## §7 機能要件差分 (Functional requirement delta)

新しい FR-L1 ID は導入しない。この PLAN は既存 FR-L1-05/06/07/09/12/13/17/18/19/20/33/37/39/40/41/45/46/47/48/49 を 1 つの L5 add-design に束ね、DB が progress cache にすぎないという曖昧さを取り除く。audit result として、この capability は散在する FR ですでに要求されており、不足していた work は L5 projection/reference contract だった。
