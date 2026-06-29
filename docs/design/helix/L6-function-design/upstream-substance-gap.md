---
title: "HELIX L6 機能設計 — upstream A-146 substance-gap adoption"
layer: L6
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L6-50-helix-orchestration-memory
pair_artifact: docs/test-design/helix/upstream-substance-gap.md
related_l5: docs/design/helix/L5-detail/upstream-substance-gap.md
---

# HELIX L6 機能設計 — upstream A-146 substance-gap adoption

先行 A-146 の 8 findings を、HELIX で実装可能な関数契約へ降ろす。ここでは signature / DbC /
oracle を固定し、実装は後続 L7+ の対象とする。

## §1 function contracts

| 関数 | signature | DbC | oracle |
|------|-----------|-----|--------|
| `classifyUpstreamA146Finding` | `(findingId: string) => UpstreamAdoptionFinding` | `A146-1`..`A146-8` のみ受ける。未知 id は `{known:false}` で返し、既知扱いにしない | U-UPSTREAM-001 |
| `buildGuardGovernancePack` | `(input: GuardGovernanceInput) => GuardGovernancePack` | Claude/Codex guard entrypoint、deferred surface、coverage claim を分離する。unimplemented guard を covered にしない | U-UPSTREAM-002 |
| `resolveConsumerCliPath` | `(input: ConsumerCliResolutionInput) => ConsumerCliResolution` | PATH / wrapper / absolute resolver のいずれかで `ut-tdd` 解決を証明する。解決不能なら remediation 付き fail-close | U-UPSTREAM-003 |
| `verifyGreenEvidenceBinding` | `(input: GreenEvidenceBindingInput) => GreenEvidenceBindingResult` | command rerun evidence と digest update が同じ batch にある場合だけ `closed=true`。hash-only restamp は false | U-UPSTREAM-004 |
| `classifyTelemetryProvenance` | `(row: TelemetryRowLike) => TelemetryProvenanceClass` | runtime / projected / derived / unknown を分類する。unknown は runtime evidence として使えない | U-UPSTREAM-005 |
| `curateDistributionDoc` | `(input: DistributionDocInput) => DistributionCurationDecision` | consumer / internal / dogfood / deny を分類する。blanket `docs/governance/` allow は warning 以上 | U-UPSTREAM-006 |
| `evaluateFeDesignSubstance` | `(input: FeDesignSubstanceInput) => FeDesignSubstanceStatus` | populated / explicit_defer / out_of_scope / hollow を返す。presence-only は populated ではない | U-UPSTREAM-007 |
| `validateDriveEntryMatrix` | `(input: DriveEntryInput, matrix: DriveEntryMatrix) => DriveEntryDecision` | `signal -> mode` と `kind x drive` の両方が一致した場合だけ auto route 可。未知組合せは fail-close/defer | U-UPSTREAM-008 |
| `verifyRuntimeMatcherEvidence` | `(input: RuntimeMatcherEvidenceInput) => RuntimeMatcherCompatibility` | target runtime の tool event と matcher 発火 evidence が揃う場合だけ covered。期待だけなら unverified | U-UPSTREAM-009 |

## §2 type sketch

```ts
type UpstreamFindingId =
  | "A146-1"
  | "A146-2"
  | "A146-3"
  | "A146-4"
  | "A146-5"
  | "A146-6"
  | "A146-7"
  | "A146-8";

type ProvenanceKind = "runtime" | "projected" | "derived" | "unknown";
type CurationAudience = "consumer" | "internal" | "dogfood" | "deny";
type FeDesignSubstance = "populated" | "explicit_defer" | "out_of_scope" | "hollow";
type DriveEntryDecisionKind = "auto_route" | "defer" | "fail_close" | "human_review";
type MatcherCompatibility = "covered" | "unverified" | "incompatible";
```

## §3 safety rules

- A-146 adoption cannot close by prose presence alone. Each `HU-C*` contract needs an oracle in
  `docs/test-design/helix/upstream-substance-gap.md`.
- External/publication work remains human-gated. This L6 design only lowers the upstream findings into
  HELIX design contracts.
- Findings already generally covered by pillar docs remain separately traceable through `HU-FR-*`, so future
  completion audits can prove A-146 adoption directly instead of inferring it from broad pillar requirements.
