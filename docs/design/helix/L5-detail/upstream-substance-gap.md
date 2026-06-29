---
title: "HELIX L5 詳細設計 — upstream A-146 substance-gap adoption"
layer: L5
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/upstream-substance-gap.md
related_l4: docs/design/helix/L4-basic-design/upstream-substance-gap.md
---

# HELIX L5 詳細設計 — upstream A-146 substance-gap adoption

L4 upstream boundary を integration contract に落とす。ここで固定するのは module / projection /
evidence 境界であり、実装完了 claim ではない。

## §1 L5 contract matrix

| L3 ID | L5 contract | Required input | Contract output | fail-close |
|-------|-------------|----------------|-----------------|------------|
| HU-FR-01 | HU-C01 guard-governance-pack | adapter template, runtime surface catalog, deferred surface registry | `GuardGovernancePack` | missing guard entrypoint, untracked deferred surface, covered claim for unimplemented guard |
| HU-FR-02 | HU-C02 consumer-cli-resolution | install target, hook command, PATH/wrapper resolver result | `ConsumerCliResolution` | `ut-tdd` cannot be resolved and no remediation is emitted |
| HU-FR-03 | HU-C03 green-evidence-binding | command, exit status, output digest, evidence path, run timestamp | `GreenEvidenceBinding` | digest-only update, stale evidence path, command not re-run |
| HU-FR-04 | HU-C04 telemetry-provenance | telemetry row, source event, projection rule, runtime identity | `TelemetryProvenanceClass` | provenance unknown, facade row used as runtime evidence |
| HU-FR-05 | HU-C05 distribution-curation | package manifest, doc path, audience, dogfood/internal marker | `DistributionCurationDecision` | blanket governance allowlist without deny/curation rule |
| HU-FR-06 | HU-C06 fe-design-substance | FE design doc, layer, body section, defer marker, out-of-scope marker | `FeDesignSubstanceStatus` | presence-only coverage claimed as populated design |
| HU-FR-07 | HU-C07 drive-entry-matrix | task signal, plan kind, drive model, route decision | `DriveEntryDecision` | unknown `signal -> mode` or invalid `kind x drive` auto-runs |
| HU-FR-08 | HU-C08 runtime-matcher-evidence | runtime name/version, emitted tool event, matcher, guard result | `RuntimeMatcherCompatibility` | matcher coverage claimed without target-runtime evidence |

## §2 integration observation

| Contract | L8 observation |
|----------|----------------|
| HU-C01 | generated adapter package includes guard entrypoints and explicit deferred surfaces |
| HU-C02 | clean install smoke proves hook command resolution or fail-close remediation |
| HU-C03 | evidence batch joins command execution and digest update |
| HU-C04 | DB projection can distinguish runtime / projected / derived telemetry |
| HU-C05 | package curation separates consumer docs from internal dogfood audit/process docs |
| HU-C06 | FE design coverage reports populated/deferred/out-of-scope, not only file presence |
| HU-C07 | route selection validates signal/kind/drive against a matrix |
| HU-C08 | runtime matcher compatibility is backed by actual target runtime events |

## §3 L6 carry

The L6 design must define function signatures and DbC for all `HU-C*` contracts, with one oracle per
contract plus one upstream-audit completeness oracle.
