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
type TelemetryProvenanceClass = ProvenanceKind;
type CurationAudience = "consumer" | "internal" | "dogfood" | "deny";
type FeDesignSubstance = "populated" | "explicit_defer" | "out_of_scope" | "hollow";
type DriveEntryDecisionKind = "auto_route" | "defer" | "fail_close" | "human_review";
type MatcherCompatibility = "covered" | "unverified" | "incompatible";
type RuntimeMatcherCompatibility = MatcherCompatibility;
```

## §3 safety rules

- A-146 adoption cannot close by prose presence alone. Each `HU-C*` contract needs an oracle in
  `docs/test-design/helix/upstream-substance-gap.md`.
- External/publication work remains human-gated. This L6 design only lowers the upstream findings into
  HELIX design contracts.
- Findings already generally covered by pillar docs remain separately traceable through `HU-FR-*`, so future
  completion audits can prove A-146 adoption directly instead of inferring it from broad pillar requirements.

## §4 verification strategy adoption (upstream PLAN-L7-188)

上流 `PLAN-L7-188-verification-strategy-design-time-logging` の趣旨を HELIX へ採用する。ここでは
L7 実装を起こさず、L6 の function contract と paired oracle だけを固定する。

| 関数 | signature | DbC | oracle |
|------|-----------|-----|--------|
| `classifyRuntimeVerificationEvidence` | `(input: RuntimeEvidenceClaim) => RuntimeVerificationClass` | `fired` / `used` / `works` / `executed` / `blocked` / `recovered` / `observed` の claim は、実 `session_id`、実 `source`、adapter/runtime surface、timestamp、evidence path を持つ場合だけ `runtime_verified`。projection-only は `projection_only_unverified`。欠落は `missing_runtime_provenance`。 | U-RUNDEBUG-001 (alias: U-VERIFYSTRAT-001) |
| `buildRunDebugObligation` | `(input: CapabilityVerificationInput) => RunDebugObligation` | runtime behavior を主張する capability には L7.5 RUN & Debug obligation を生成する。unit-only helper は `not_required` にできるが、理由と代替 oracle を必須にする。 | U-RUNDEBUG-002 (alias: U-VERIFYSTRAT-002) |
| `rejectProjectionOnlyVerification` | `(input: RuntimeVerificationClass) => VerificationGateDecision` | `projection_only_unverified` と `missing_runtime_provenance` は accept 不能。trace 補助としては保存できるが、works/fired/used/executed の完了根拠にはしない。 | U-RUNDEBUG-003 (alias: U-VERIFYSTRAT-003) |

```ts
type RuntimeVerificationClass =
  | "runtime_verified"
  | "projection_only_unverified"
  | "missing_runtime_provenance"
  | "not_runtime_claim";

type RunDebugObligationKind = "required" | "not_required" | "blocked";
```

Safety rule: L7 unit green is necessary for implementation correctness, but runtime behavior acceptance requires
L7.5 RUN & Debug evidence before trace-freeze/review/accept. This prevents projection rows from replacing real
verification evidence.

## §5 runtime verification log design

RUN & Debug の実証拠は後付けメモではなく、L6 設計時点でログ構造を予約する。ログは保守性のために
「何が動いたか」「どの設計/テストに対応するか」「なぜ accept できるか」を結合できる形にする。

```ts
interface RuntimeVerificationLogEvent {
  event_id: string;
  plan_id: string;
  requirement_id: string | null;
  test_oracle_id: string | null;
  claim: "fired" | "used" | "works" | "blocked" | "recovered" | "observed";
  session_id: string;
  source: "runtime-hook" | "adapter-command" | "run-debug" | "hosted-preflight";
  runtime_surface: "claude-hook" | "codex-hook" | "codex-hosted-api" | "ut-tdd-cli" | "external-api";
  correlation_id: string;
  evidence_path: string;
  occurred_at: string;
  redaction_policy: "secret-redacted" | "no-secret-material" | "blocked-sensitive";
}
```

| 関数 | signature | DbC | oracle |
|------|-----------|-----|--------|
| `buildRuntimeVerificationLogEvent` | `(input: RuntimeVerificationLogInput) => RuntimeVerificationLogEvent` | plan_id / claim / session_id / source / runtime_surface / correlation_id / evidence_path / occurred_at を必須にする。secret-like 値は event に入れず `redaction_policy` で表現する。 | U-VERIFYSTRAT-004 |
| `validateRuntimeVerificationLogCompleteness` | `(event: RuntimeVerificationLogEvent) => RuntimeLogCompleteness` | `works` / `used` / `fired` claim は空 session_id、projection source、evidence_path 欠落、correlation_id 欠落を reject。`blocked` は hosted-preflight でも可だが blocked reason evidence を要求する。 | U-VERIFYSTRAT-005 |
| `appendRuntimeVerificationLogEvent` | `(input: RuntimeVerificationLogInput, deps: RuntimeVerificationLogDeps, relPath?: string) => RuntimeVerificationLogWrite` | completeness pass 後にだけ `.ut-tdd/evidence/run-debug/runtime-verification.jsonl` へ 1 JSONL row を append する。projection source、invalid surface、secret-like 値、runtime closure link 欠落は write 前に reject。 | U-VERIFYSTRAT-006 |

Operational note: these log events are append-only evidence inputs for later projection. Projection may summarize them,
but the original runtime log event remains the acceptance source of truth.
