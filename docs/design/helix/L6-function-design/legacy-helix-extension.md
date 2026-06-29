---
title: "HELIX L6 機能設計 — old HELIX extension adoption"
layer: L6
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/legacy-helix-extension.md
related_l5: docs/design/helix/L5-detail/legacy-helix-extension.md
---

# HELIX L6 機能設計 — old HELIX extension adoption

旧 HELIX 由来の採用候補を、TS/Bun 実装可能な function contract へ降ろす。

## §1 function contracts

| L5 contract | function | signature | DbC | oracle |
|-------------|----------|-----------|-----|--------|
| HLX-C01 | `buildWorkPreflightDecision` | `(input: WorkPreflightInput) => WorkPreflightDecision` | objective、workflow/layer、Forward return、acceptance/verification、work source、allowed scope を必須にする。handover/PLAN と矛盾する scope は `blocker` | U-HLX-001 |
| HLX-C02 | `classifyTechnicalQuestion` | `(input: QuestionGateInput) => TechnicalQuestionDecision` | design/contract/structure/placement/migration/security を technical question と分類し、recent TL advisor evidence が無ければ `deny`。preference-only は reason 付き `bypass_allowed` | U-HLX-002 |
| HLX-C03 | `registerDetectorAxis` | `(descriptor: DetectorAxisDescriptor) => DetectorAxisRegistration` | axis id、phase gate、kind、severity、workflow route を必須にし、unknown axis は auto route しない | U-HLX-003 |
| HLX-C03 | `routeDetectorFinding` | `(finding: DetectorFinding, registry: DetectorAxisRegistry) => DetectorRouteDecision` | stub/advisory/fail-close を区別し、stub/advisory を hard gate proof に使わない | U-HLX-004 |
| HLX-C04 | `buildRecommendationDecision` | `(input: RecommendationInput) => RecommendationDecision` | skill/code/command candidate は score/reason/references/recommended role を持つ。legacy runtime path は `harden_required` または `defer` | U-HLX-005 |
| HLX-C05 | `analyzeRunDebugTrace` | `(input: RunDebugTraceInput) => RunDebugTraceDecision` | expected action、observed evidence、missing action、runtime surface、correlation id、evidence path を返す。missing action がある場合は acceptance source にしない | U-HLX-006 |

## §2 type sketch

```ts
type WorkPreflightKind = "allow" | "blocker" | "escalate" | "new_plan_required";
type TechnicalQuestionKind = "allow" | "deny" | "bypass_allowed";
type DetectorResultKind = "stub" | "advisory" | "fail_close";
type RecommendationKind = "adopt_candidate" | "harden_required" | "defer" | "reject";
type RunDebugTraceKind = "complete" | "incomplete" | "blocked";

interface RunDebugTraceDecision {
  kind: RunDebugTraceKind;
  matched_actions: string[];
  missing_actions: string[];
  correlation_id: string;
  evidence_path: string;
}
```

## §3 L3 -> L6 trace

| L3 ID | L5 | L6 function | oracle |
|-------|----|-------------|--------|
| HLX-FR-01 | HLX-C01 | `buildWorkPreflightDecision` | U-HLX-001 |
| HLX-FR-02 | HLX-C02 | `classifyTechnicalQuestion` | U-HLX-002 |
| HLX-FR-03 | HLX-C03 | `registerDetectorAxis` / `routeDetectorFinding` | U-HLX-003 / U-HLX-004 |
| HLX-FR-04 | HLX-C04 | `buildRecommendationDecision` | U-HLX-005 |
| HLX-FR-05 | HLX-C05 | `analyzeRunDebugTrace` | U-HLX-006 |

## §4 source mapping

| Legacy source | L6 adoption |
|---------------|-------------|
| `helix/HELIX_RUNTIME_RULES.md` | `buildWorkPreflightDecision` の required fields と blocker 条件 |
| `helix/CLAUDE_RUNTIME_ADAPTER.md` / `pretooluse-askuserquestion.sh` | `classifyTechnicalQuestion` の TL advisor evidence rule |
| `cli/lib/detectors/registry.py` / `axis_*.py` | `DetectorAxisDescriptor` と `DetectorRouteDecision` |
| `cli/lib/skill_recommender.py` / `code_recommender.py` / `command_catalog.py` | `RecommendationDecision` の traceable candidate contract |
| `cli/helix-debug` / `cli/helix-test-debug` | `RunDebugTraceDecision` と L7.5 RUN & Debug evidence |

## §5 carry

- L7: 旧 Python/Bash を移植せず、TS/Bun module と既存 harness DB projection へ接続する。
- L7.5: `analyzeRunDebugTrace` は `RuntimeVerificationLogEvent` の `correlation_id` と結合する。
- Rename: `helix` CLI / `.helix` state の機械改名は `PLAN-M-02` まで defer。prose だけを先行して HELIX へ寄せる。
