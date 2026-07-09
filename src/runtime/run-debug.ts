import {
  buildRuntimeVerificationLogEvent,
  DEFAULT_RUNTIME_VERIFICATION_LOG_PATH,
  type RuntimeLogCompleteness,
  type RuntimeVerificationLogEvent,
  type RuntimeVerificationLogInput,
  validateRuntimeVerificationLogCompleteness,
} from "../schema/runtime-verification";

export type {
  CapabilityVerificationInput,
  RunDebugObligation,
  RuntimeClaim,
  RuntimeEvidenceClaim,
  RuntimeEvidenceSource,
  RuntimeLogCompleteness,
  RuntimeSurface,
  RuntimeVerificationClass,
  RuntimeVerificationLogEvent,
  RuntimeVerificationLogInput,
  VerificationGateDecision,
} from "../schema/runtime-verification";
export {
  buildRunDebugObligation,
  buildRuntimeVerificationLogEvent,
  classifyRuntimeVerificationEvidence,
  DEFAULT_RUNTIME_VERIFICATION_LOG_PATH,
  rejectProjectionOnlyVerification,
  validateRuntimeVerificationLogCompleteness,
} from "../schema/runtime-verification";

export interface RuntimeVerificationLogDeps {
  repoRoot: string;
  appendText: (path: string, content: string) => void;
}

export interface RuntimeVerificationLogWrite {
  path: string;
  event: RuntimeVerificationLogEvent;
  completeness: RuntimeLogCompleteness;
}

export function appendRuntimeVerificationLogEvent(
  input: RuntimeVerificationLogInput,
  deps: RuntimeVerificationLogDeps,
  relPath = DEFAULT_RUNTIME_VERIFICATION_LOG_PATH,
): RuntimeVerificationLogWrite {
  const event = buildRuntimeVerificationLogEvent(input);
  const completeness = validateRuntimeVerificationLogCompleteness(event);
  if (!completeness.ok) {
    throw new Error(
      `runtime verification log event incomplete: ${completeness.findings.join(",")}`,
    );
  }
  const normalizedRelPath = relPath.replaceAll("\\", "/").replace(/^\/+/, "");
  const path = `${deps.repoRoot.replace(/[\\/]+$/, "")}/${normalizedRelPath}`;
  deps.appendText(path, `${JSON.stringify(event)}\n`);
  return { path: normalizedRelPath, event, completeness };
}
