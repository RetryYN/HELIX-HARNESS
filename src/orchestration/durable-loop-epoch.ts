import { randomUUID } from "node:crypto";
import { type Sha256Digest, sha256Digest } from "../runtime/digest";
import { assertLoopPlanId } from "../schema/loop-plan-id";
import type { LoopIterationRecord } from "./loop-runner";
import type { LoopState } from "./loop-state";

export const LOOP_EPOCH_SCHEMA = "helix.loop-epoch.v1" as const;
export const LOOP_EPOCH_POINTER_SCHEMA = "helix.loop-epoch-pointer.v1" as const;
export type LoopSideEffectPhase = "not_started" | "intent_recorded" | "completed";
export type LoopClaimStatus = "absent" | "live" | "stale";
export type LoopEpochReadStatus =
  | "missing"
  | "committed"
  | "uncommitted"
  | "corrupt"
  | "concurrent_conflict"
  | "ambiguous_side_effect"
  | "live_claim"
  | "stale_claim"
  | "durability_uncertain";

export type LoopEpochPayload = {
  state: LoopState;
  iteration: LoopIterationRecord | null;
  legacySourceDigest?: Sha256Digest | null;
  orchestrationStage?: {
    iteration: number;
    purpose: "worker" | "verifier";
    status: "intent" | "completed";
    result: "pass" | "fail" | "error" | "pending" | null;
  } | null;
};

export type LoopEpochManifest = {
  schema: typeof LOOP_EPOCH_SCHEMA;
  planId: string;
  epochId: number;
  previousManifestDigest: Sha256Digest | null;
  payloadDigest: Sha256Digest;
  payloadFile: string;
  sideEffectPhase: LoopSideEffectPhase;
  durabilityCapability: "posix_dir_fsync" | "file_fsync_same_volume_rename";
};

export type LoopEpochPointer = {
  schema: typeof LOOP_EPOCH_POINTER_SCHEMA;
  planId: string;
  epochId: number;
  manifestFile: string;
  manifestDigest: Sha256Digest;
};

export type LoopEpochReadResult = {
  status: LoopEpochReadStatus;
  manifest: LoopEpochManifest | null;
  payload: LoopEpochPayload | null;
  reason: string;
};

export interface DurableEpochPort {
  readonly durabilityCapability?: "posix_dir_fsync" | "file_fsync_same_volume_rename";
  acquireExclusiveClaim(planId: string): boolean;
  readManifestText(planId: string): string | null;
  writePayloadTemp(planId: string, tempId: string, text: string): void;
  fsyncPayloadTemp(planId: string, tempId: string): void;
  renamePayload(planId: string, tempId: string, payloadFile: string): void;
  fsyncStateDirectory(planId: string): void;
  writeManifestTemp(planId: string, tempId: string, text: string): void;
  fsyncManifestTemp(planId: string, tempId: string): void;
  renameManifest(planId: string, tempId: string, manifestFile: string): void;
  writePointerTemp(planId: string, tempId: string, text: string): void;
  fsyncPointerTemp(planId: string, tempId: string): void;
  renamePointer(planId: string, tempId: string): void;
  unlinkClaim(planId: string): void;
  fsyncClaimDirectory(planId: string): void;
}

const INTENT_CAPABILITY = Symbol("helix.loop.intent-capability");
const CONSUMED_INTENT_CAPABILITIES = new WeakSet<object>();
export type DurableIntentCapability = {
  readonly [INTENT_CAPABILITY]: true;
  readonly planId: string;
};
export type LoopEpochCommitResult = {
  status: "committed" | "corrupt" | "concurrent_conflict" | "durability_uncertain";
  manifest: LoopEpochManifest | null;
  intentCapability: DurableIntentCapability | null;
  reason: string;
};

export function commitLoopEpoch(input: {
  planId: string;
  previousManifestText: string | null;
  payload: LoopEpochPayload;
  sideEffectPhase: LoopSideEffectPhase;
  port: DurableEpochPort;
}): LoopEpochCommitResult {
  const planId = assertLoopPlanId(input.planId);
  if (!input.port.acquireExclusiveClaim(planId)) {
    return {
      status: "concurrent_conflict",
      manifest: null,
      intentCapability: null,
      reason: "claim_conflict",
    };
  }
  try {
    if (input.port.readManifestText(planId) !== input.previousManifestText) {
      input.port.unlinkClaim(planId);
      input.port.fsyncClaimDirectory(planId);
      return {
        status: "concurrent_conflict",
        manifest: null,
        intentCapability: null,
        reason: "stale_previous",
      };
    }
    const previous = input.previousManifestText
      ? parseLoopEpochManifest(input.previousManifestText)
      : null;
    if (input.previousManifestText && (previous === null || previous.planId !== planId)) {
      input.port.unlinkClaim(planId);
      input.port.fsyncClaimDirectory(planId);
      return {
        status: "concurrent_conflict",
        manifest: null,
        intentCapability: null,
        reason: "invalid_previous",
      };
    }
    const payloadText = JSON.stringify(input.payload);
    if (parseLoopEpochPayload(payloadText, planId) === null) {
      input.port.unlinkClaim(planId);
      input.port.fsyncClaimDirectory(planId);
      return {
        status: "corrupt",
        manifest: null,
        intentCapability: null,
        reason: "invalid_payload",
      };
    }
    const payloadDigest = sha256Digest(payloadText);
    const epochId = (previous?.epochId ?? -1) + 1;
    const payloadFile = `${planId}.epoch-${epochId}-${payloadDigest.slice(7)}.payload.json`;
    const tempId = randomUUID();
    const manifest: LoopEpochManifest = {
      schema: LOOP_EPOCH_SCHEMA,
      planId,
      epochId,
      previousManifestDigest: input.previousManifestText
        ? sha256Digest(input.previousManifestText)
        : null,
      payloadDigest,
      payloadFile,
      sideEffectPhase: input.sideEffectPhase,
      durabilityCapability:
        input.port.durabilityCapability === "file_fsync_same_volume_rename"
          ? "file_fsync_same_volume_rename"
          : "posix_dir_fsync",
    };
    const manifestText = JSON.stringify(manifest);
    const manifestFile = `${planId}.epoch-${epochId}-${randomUUID()}.manifest.json`;
    const pointer: LoopEpochPointer = {
      schema: LOOP_EPOCH_POINTER_SCHEMA,
      planId,
      epochId,
      manifestFile,
      manifestDigest: sha256Digest(manifestText),
    };
    input.port.writePayloadTemp(planId, tempId, payloadText);
    input.port.fsyncPayloadTemp(planId, tempId);
    input.port.renamePayload(planId, tempId, payloadFile);
    input.port.fsyncStateDirectory(planId);
    input.port.writeManifestTemp(planId, tempId, manifestText);
    input.port.fsyncManifestTemp(planId, tempId);
    input.port.renameManifest(planId, tempId, manifestFile);
    input.port.fsyncStateDirectory(planId);
    input.port.writePointerTemp(planId, tempId, JSON.stringify(pointer));
    input.port.fsyncPointerTemp(planId, tempId);
    input.port.renamePointer(planId, tempId);
    input.port.fsyncStateDirectory(planId);
    input.port.unlinkClaim(planId);
    input.port.fsyncClaimDirectory(planId);
    return {
      status: "committed",
      manifest,
      intentCapability:
        input.sideEffectPhase === "intent_recorded" ? { [INTENT_CAPABILITY]: true, planId } : null,
      reason: "durable",
    };
  } catch {
    return {
      status: "durability_uncertain",
      manifest: null,
      intentCapability: null,
      reason: "publish_failed",
    };
  }
}

export function authorizeLoopSideEffect<T>(
  capability: DurableIntentCapability | null,
  planId: string,
  effect: () => T,
): { allowed: boolean; value?: T } {
  if (
    capability?.[INTENT_CAPABILITY] !== true ||
    capability.planId !== assertLoopPlanId(planId) ||
    CONSUMED_INTENT_CAPABILITIES.has(capability)
  ) {
    return { allowed: false };
  }
  CONSUMED_INTENT_CAPABILITIES.add(capability);
  return { allowed: true, value: effect() };
}

function parseRecord(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function parseLoopEpochManifest(text: string): LoopEpochManifest | null {
  const value = parseRecord(text);
  if (
    value?.schema !== LOOP_EPOCH_SCHEMA ||
    typeof value.planId !== "string" ||
    typeof value.epochId !== "number" ||
    !Number.isSafeInteger(value.epochId) ||
    value.epochId < 0 ||
    (value.previousManifestDigest !== null &&
      (typeof value.previousManifestDigest !== "string" ||
        !/^sha256:[a-f0-9]{64}$/.test(value.previousManifestDigest))) ||
    typeof value.payloadDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/.test(value.payloadDigest) ||
    typeof value.payloadFile !== "string" ||
    value.payloadFile !==
      `${value.planId}.epoch-${value.epochId}-${value.payloadDigest.slice(7)}.payload.json` ||
    !["not_started", "intent_recorded", "completed"].includes(String(value.sideEffectPhase)) ||
    !["posix_dir_fsync", "file_fsync_same_volume_rename"].includes(
      String(value.durabilityCapability),
    )
  ) {
    return null;
  }
  try {
    assertLoopPlanId(value.planId);
  } catch {
    return null;
  }
  return value as LoopEpochManifest;
}

export function parseLoopEpochPayload(text: string, planId: string): LoopEpochPayload | null {
  const value = parseRecord(text);
  const state = value?.state;
  const stateRecord =
    typeof state === "object" && state !== null ? (state as Record<string, unknown>) : null;
  const iteration = value?.iteration;
  const orchestrationStage = value?.orchestrationStage;
  const legacySourceDigest = value?.legacySourceDigest;
  const stageRecord =
    typeof orchestrationStage === "object" && orchestrationStage !== null
      ? (orchestrationStage as Record<string, unknown>)
      : null;
  if (
    value === null ||
    stateRecord === null ||
    stateRecord.planId !== planId ||
    !["running", "paused", "stopped"].includes(String(stateRecord.status)) ||
    !Number.isSafeInteger(stateRecord.iteration) ||
    Number(stateRecord.iteration) < 0 ||
    !Number.isSafeInteger(stateRecord.maxIterations) ||
    Number(stateRecord.maxIterations) < Number(stateRecord.iteration) ||
    !["pass", "fail", "error", "pending"].includes(String(stateRecord.lastVerdict)) ||
    !["claude", "codex"].includes(String(stateRecord.workerProvider)) ||
    (stateRecord.verifierProvider !== null &&
      !["claude", "codex"].includes(String(stateRecord.verifierProvider))) ||
    (stateRecord.blockedReason !== null && typeof stateRecord.blockedReason !== "string") ||
    typeof stateRecord.windowOpensAt !== "string" ||
    !Number.isFinite(Date.parse(stateRecord.windowOpensAt)) ||
    typeof stateRecord.windowClosesAt !== "string" ||
    !Number.isFinite(Date.parse(stateRecord.windowClosesAt)) ||
    typeof stateRecord.costUsd !== "number" ||
    !Number.isFinite(stateRecord.costUsd) ||
    stateRecord.costUsd < 0 ||
    typeof stateRecord.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(stateRecord.updatedAt)) ||
    !("iteration" in value) ||
    !validIterationRecord(iteration, planId, Number(stateRecord.iteration)) ||
    !(
      legacySourceDigest === undefined ||
      legacySourceDigest === null ||
      (typeof legacySourceDigest === "string" && /^sha256:[a-f0-9]{64}$/.test(legacySourceDigest))
    ) ||
    !(
      orchestrationStage === undefined ||
      orchestrationStage === null ||
      (stageRecord !== null &&
        Number.isSafeInteger(stageRecord.iteration) &&
        Number(stageRecord.iteration) === Number(stateRecord.iteration) &&
        ["worker", "verifier"].includes(String(stageRecord.purpose)) &&
        ["intent", "completed"].includes(String(stageRecord.status)) &&
        (stageRecord.result === null ||
          ["pass", "fail", "error", "pending"].includes(String(stageRecord.result))) &&
        (stageRecord.purpose === "worker" ? stageRecord.result === null : true) &&
        (stageRecord.status === "intent" ? stageRecord.result === null : true) &&
        (stageRecord.status === "completed" && stageRecord.purpose === "verifier"
          ? stageRecord.result !== null
          : true))
    )
  ) {
    return null;
  }
  return value as LoopEpochPayload;
}

function validIterationRecord(
  value: unknown,
  planId: string,
  stateIteration: number,
): value is LoopIterationRecord | null {
  if (value === null) return true;
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record.planId === planId &&
    Number.isSafeInteger(record.iteration) &&
    Number(record.iteration) >= 0 &&
    Number(record.iteration) <= stateIteration &&
    ["claude", "codex"].includes(String(record.workerProvider)) &&
    (record.verifierProvider === null ||
      ["claude", "codex"].includes(String(record.verifierProvider))) &&
    ["pass", "fail", "error", "pending"].includes(String(record.verdict)) &&
    (record.blockedReason === null || typeof record.blockedReason === "string")
  );
}

export function classifyLoopEpochFiles(input: {
  planId: string;
  manifestText: string | null;
  payloadText: string | null;
  claimStatus: LoopClaimStatus;
  conflictingManifestText?: string | null;
  previousManifestText?: string | null;
}): LoopEpochReadResult {
  const planId = assertLoopPlanId(input.planId);
  if (input.manifestText === null) {
    if (input.claimStatus === "live")
      return { status: "live_claim", manifest: null, payload: null, reason: "live_claim" };
    if (input.claimStatus === "stale")
      return { status: "stale_claim", manifest: null, payload: null, reason: "stale_claim" };
    return input.payloadText === null
      ? { status: "missing", manifest: null, payload: null, reason: "absent" }
      : { status: "uncommitted", manifest: null, payload: null, reason: "orphan_payload" };
  }
  const manifest = parseLoopEpochManifest(input.manifestText);
  if (manifest === null || manifest.planId !== planId || input.payloadText === null) {
    return { status: "corrupt", manifest, payload: null, reason: "manifest_or_payload_invalid" };
  }
  if (input.previousManifestText !== undefined) {
    const previous = input.previousManifestText
      ? parseLoopEpochManifest(input.previousManifestText)
      : null;
    const chainMatches =
      previous === null
        ? manifest.epochId === 0 && manifest.previousManifestDigest === null
        : manifest.epochId === previous.epochId + 1 &&
          manifest.previousManifestDigest === sha256Digest(input.previousManifestText ?? "");
    if (!chainMatches) {
      return { status: "concurrent_conflict", manifest, payload: null, reason: "stale_previous" };
    }
  }
  const payload = parseLoopEpochPayload(input.payloadText, planId);
  if (payload === null || sha256Digest(input.payloadText) !== manifest.payloadDigest) {
    return { status: "corrupt", manifest, payload: null, reason: "payload_digest_mismatch" };
  }
  if (input.conflictingManifestText) {
    const conflicting = parseLoopEpochManifest(input.conflictingManifestText);
    if (
      conflicting !== null &&
      conflicting.planId === manifest.planId &&
      conflicting.epochId === manifest.epochId &&
      conflicting.previousManifestDigest === manifest.previousManifestDigest &&
      input.conflictingManifestText !== input.manifestText
    ) {
      return { status: "concurrent_conflict", manifest, payload, reason: "forked_epoch" };
    }
  }
  if (input.claimStatus !== "absent") {
    return {
      status: "durability_uncertain",
      manifest,
      payload,
      reason: `residual_${input.claimStatus}_claim`,
    };
  }
  if (manifest.sideEffectPhase === "intent_recorded") {
    return {
      status: "ambiguous_side_effect",
      manifest,
      payload,
      reason: "intent_without_completion",
    };
  }
  return { status: "committed", manifest, payload, reason: "verified" };
}
