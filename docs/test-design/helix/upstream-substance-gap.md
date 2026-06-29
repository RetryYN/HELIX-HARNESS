---
title: "HELIX upstream A-146 substance-gap test design"
layer: L6
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: QA + AIM
plan: PLAN-L6-50-helix-orchestration-memory
pair_artifact: docs/design/helix/
pair_design: docs/design/helix/
---

# HELIX upstream A-146 substance-gap test design

`unison-ai-product/UT-TDD_AGENT-HARNESS` の A-146 監査を HELIX 側へ採用するための pair test-design。
L3/L4/L5/L6 の upstream-substance-gap docs をまとめて逆参照し、各 finding を oracle へ接続する。

## §1 coverage matrix

| upstream | L3 | L4 | L5 | L6 oracle |
|----------|----|----|----|-----------|
| A146-1 | HU-FR-01 | HUT-SYS-01 | HU-C01 | U-UPSTREAM-002 |
| A146-2 | HU-FR-02 | HUT-SYS-02 | HU-C02 | U-UPSTREAM-003 |
| A146-3 | HU-FR-03 | HUT-SYS-03 | HU-C03 | U-UPSTREAM-004 |
| A146-4 | HU-FR-04 | HUT-SYS-04 | HU-C04 | U-UPSTREAM-005 |
| A146-5 | HU-FR-05 | HUT-SYS-05 | HU-C05 | U-UPSTREAM-006 |
| A146-6 | HU-FR-06 | HUT-SYS-06 | HU-C06 | U-UPSTREAM-007 |
| A146-7 | HU-FR-07 | HUT-SYS-07 | HU-C07 | U-UPSTREAM-008 |
| A146-8 | HU-FR-08 | HUT-SYS-08 | HU-C08 | U-UPSTREAM-009 |

Completeness oracle: U-UPSTREAM-001 covers the exact A146-1..A146-8 ID set.

## §2 oracle definitions

| Oracle | Contract | Expected behavior |
|--------|----------|-------------------|
| U-UPSTREAM-001 | `classifyUpstreamA146Finding` | accepts exactly A146-1..A146-8 as known; unknown ids are not silently adopted |
| U-UPSTREAM-002 | `buildGuardGovernancePack` | separates guard entrypoints, deferred surfaces, and coverage claims; unimplemented guards cannot be marked covered |
| U-UPSTREAM-003 | `resolveConsumerCliPath` | proves `ut-tdd` is resolvable through PATH/wrapper/resolver or returns fail-close remediation |
| U-UPSTREAM-004 | `verifyGreenEvidenceBinding` | closes evidence integrity only when command rerun evidence and digest update share one batch; hash-only restamp fails |
| U-UPSTREAM-005 | `classifyTelemetryProvenance` | classifies runtime/projected/derived/unknown and rejects unknown as runtime evidence |
| U-UPSTREAM-006 | `curateDistributionDoc` | classifies consumer/internal/dogfood/deny and flags blanket governance allowlisting |
| U-UPSTREAM-007 | `evaluateFeDesignSubstance` | distinguishes populated, explicit defer, out-of-scope, and hollow FE design bodies |
| U-UPSTREAM-008 | `validateDriveEntryMatrix` | requires both `signal -> mode` and `kind x drive` to match before auto-routing |
| U-UPSTREAM-009 | `verifyRuntimeMatcherEvidence` | treats matcher coverage as covered only with target-runtime tool event evidence |

## §3 non-goals

- This test-design does not claim the L7 implementations exist.
- This test-design does not close external publication, tag, signed artifact, UAT, or release evidence.
- This test-design prevents A-146 adoption from being inferred from broad existing pillar requirements alone.

## §4 verification strategy oracles

These oracles pair with `docs/design/helix/L6-function-design/upstream-substance-gap.md` §4 and adopt upstream
`PLAN-L7-188` at design level only.

| Oracle | Contract | Expected behavior |
|--------|----------|-------------------|
| U-VERIFYSTRAT-001 | `classifyRuntimeVerificationEvidence` | classifies claims with real session/source/surface/timestamp/evidence path as `runtime_verified`; projection-only rows become `projection_only_unverified`; missing provenance becomes `missing_runtime_provenance` |
| U-VERIFYSTRAT-002 | `buildRunDebugObligation` | runtime behavior claims generate an L7.5 RUN & Debug obligation; unit-only helpers can skip it only with an explicit reason and substitute oracle |
| U-VERIFYSTRAT-003 | `rejectProjectionOnlyVerification` | projection-only and missing-provenance classes cannot close fired/used/works acceptance, though they may remain trace-support evidence |
| U-VERIFYSTRAT-004 | `buildRuntimeVerificationLogEvent` | produces an append-only event with plan/test/claim/session/source/surface/correlation/evidence/timestamp and redaction policy, without storing secret-like values |
| U-VERIFYSTRAT-005 | `validateRuntimeVerificationLogCompleteness` | rejects fired/used/works events with empty session id, projection source, missing evidence path, or missing correlation id; blocked hosted-preflight events require blocked-reason evidence |
