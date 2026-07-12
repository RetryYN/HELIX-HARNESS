import { type Sha256Digest, sha256Digest } from "../runtime/digest";
import { assertLoopPlanId } from "../schema/loop-plan-id";
import type { LoopIterationRecord } from "./loop-runner";
import type { LoopState } from "./loop-state";

export const LOOP_EPOCH_SCHEMA = "helix.loop-epoch.v1" as const;
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
};

export type LoopEpochManifest = {
  schema: typeof LOOP_EPOCH_SCHEMA;
  planId: string;
  epochId: number;
  previousManifestDigest: Sha256Digest | null;
  payloadDigest: Sha256Digest;
  sideEffectPhase: LoopSideEffectPhase;
};

export type LoopEpochReadResult = {
  status: LoopEpochReadStatus;
  manifest: LoopEpochManifest | null;
  payload: LoopEpochPayload | null;
  reason: string;
};

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

function parseManifest(text: string): LoopEpochManifest | null {
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
    !["not_started", "intent_recorded", "completed"].includes(String(value.sideEffectPhase))
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

function parsePayload(text: string, planId: string): LoopEpochPayload | null {
  const value = parseRecord(text);
  const state = value?.state;
  if (
    typeof state !== "object" ||
    state === null ||
    (state as { planId?: unknown }).planId !== planId ||
    !("iteration" in value)
  ) {
    return null;
  }
  return value as LoopEpochPayload;
}

export function classifyLoopEpochFiles(input: {
  planId: string;
  manifestText: string | null;
  payloadText: string | null;
  claimStatus: LoopClaimStatus;
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
  const manifest = parseManifest(input.manifestText);
  if (manifest === null || manifest.planId !== planId || input.payloadText === null) {
    return { status: "corrupt", manifest, payload: null, reason: "manifest_or_payload_invalid" };
  }
  const payload = parsePayload(input.payloadText, planId);
  if (payload === null || sha256Digest(input.payloadText) !== manifest.payloadDigest) {
    return { status: "corrupt", manifest, payload: null, reason: "payload_digest_mismatch" };
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
