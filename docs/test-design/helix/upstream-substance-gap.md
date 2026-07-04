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

# HELIX upstream A-146 substance-gap test design の検証設計

`unison-ai-product/UT-TDD_AGENT-HARNESS` の A-146 監査を HELIX 側へ採用するための pair test-design。
L3/L4/L5/L6 の upstream-substance-gap docs をまとめて逆参照し、各 finding を oracle へ接続する。

## §1 coverage matrix 対応表

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

Completeness oracle: U-UPSTREAM-001 は A146-1..A146-8 の ID set だけを正確に covered とする。

## §2 oracle 定義

| Oracle | Contract | 期待動作 |
|--------|----------|-------------------|
| U-UPSTREAM-001 | `classifyUpstreamA146Finding` | A146-1..A146-8 だけを known として accept し、未知 id を silent adoption しない |
| U-UPSTREAM-002 | `buildGuardGovernancePack` | guard entrypoint、deferred surface、coverage claim を分離し、未実装 guard を covered として扱わない |
| U-UPSTREAM-003 | `resolveConsumerCliPath` / `runHelixProjectSetup.consumerReadiness` | PATH/wrapper/resolver のいずれかで `ut-tdd` 解決可能性を証明する。解決不能なら fail-close remediation を返す。`ut-tdd setup project` は同じ PATH preflight を JSON/text output へ出し、CLI 欠落時に projected hook を silently accepted にしない |
| U-UPSTREAM-004 | `verifyGreenEvidenceBinding` | command rerun evidence と digest update が同一 batch にある場合だけ evidence integrity を close し、hash-only restamp は fail する |
| U-UPSTREAM-005 | `classifyTelemetryProvenance` | runtime/projected/derived/unknown を分類し、unknown を runtime evidence として reject する |
| U-UPSTREAM-006 | `curateDistributionDoc` | consumer/internal/dogfood/deny を分類し、blanket governance allowlisting を flag する |
| U-UPSTREAM-007 | `evaluateFeDesignSubstance` | populated、explicit defer、out-of-scope、hollow FE design body を区別する |
| U-UPSTREAM-008 | `validateDriveEntryMatrix` | auto-routing 前に `signal -> mode` と `kind x drive` の両方の一致を要求する |
| U-UPSTREAM-009 | `verifyRuntimeMatcherEvidence` | target-runtime tool event evidence がある場合だけ matcher coverage を covered と扱う |

## §3 対象外

- この test-design は L7 implementation の存在を主張しない。
- この test-design は external publication、tag、signed artifact、UAT、release evidence を close しない。
- この test-design は、A-146 adoption が広い既存 pillar requirement だけから推論されることを防ぐ。

## §4 verification strategy oracle の検証

これらの oracle は `docs/design/helix/L6-function-design/upstream-substance-gap.md` §4 と pair し、upstream
`PLAN-L7-188` は design level に限って採用する。

| Oracle | Contract | 期待動作 |
|--------|----------|-------------------|
| U-VERIFYSTRAT-001 | `classifyRuntimeVerificationEvidence` | 実 session/source/surface/timestamp/evidence path を持つ claim を `runtime_verified` に分類する。projection-only telemetry row は `projection_only_unverified`、provenance 欠落は `missing_runtime_provenance` とする |
| U-VERIFYSTRAT-002 | `buildRunDebugObligation` | runtime behavior claim は L7.5 RUN & Debug obligation を生成する。unit-only helper は明示 reason と substitute oracle がある場合だけ skip できる |
| U-VERIFYSTRAT-003 | `rejectProjectionOnlyVerification` | projection-only telemetry と missing-provenance class は fired/used/works acceptance を close できない。ただし trace-support evidence としては残せる |
| U-VERIFYSTRAT-004 | `buildRuntimeVerificationLogEvent` | plan/test/claim/session/source/surface/correlation/evidence/timestamp と redaction policy を持つ append-only event を生成し、secret-like value は保存しない |
| U-VERIFYSTRAT-005 | `validateRuntimeVerificationLogCompleteness` | 空 session id、projection source、missing evidence path、missing correlation id を持つ fired/used/works event を reject する。blocked hosted-preflight event は blocked-reason evidence を要求する |
| U-VERIFYSTRAT-006 | `appendRuntimeVerificationLogEvent` / `ut-tdd run-debug log` | complete runtime verification JSONL event を正確に 1 件 append し、projection-only、invalid-surface、secret-like、missing-link event は write 前に拒否する |
