import { randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  linkSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { platform, uptime } from "node:os";
import { join } from "node:path";
import { sha256Digest } from "../runtime/digest";
import { assertLoopPlanId } from "../schema/loop-plan-id";
import {
  classifyLoopEpochFiles,
  type DurableEpochPort,
  LOOP_EPOCH_POINTER_SCHEMA,
  type LoopEpochReadResult,
  parseLoopEpochManifest,
  parseLoopEpochPayload,
} from "./durable-loop-epoch";

type ClaimMetadata = {
  claimId: string;
  pid: number;
  bootIdentity: string | null;
  processStartToken: string | null;
  leaseDeadlineUptimeMs: number;
  pointerDigest: string;
  manifestDigest: string | null;
};
export type StaleLoopClaimRecoveryPacket = {
  planId: string;
  claimDigest: string;
  pointerDigest: string;
  manifestDigest: string | null;
  approvedBy: string;
  auditId: string;
};
type RecoveryClaimMetadata = ClaimMetadata & { packetDigest: string };
export type RecoveryMutexObservation = {
  action: "acquire" | "observe_live_mutex" | "quarantine_invalid_mutex" | "replace_stale_mutex";
  mutexDigest: string | null;
};
export interface StaleLoopClaimRecoveryAuthority {
  verify(packet: StaleLoopClaimRecoveryPacket, mutex: RecoveryMutexObservation): boolean;
}
export type DurableEpochBoundary =
  | "claim_acquired"
  | "payload_temp_written"
  | "payload_temp_fsynced"
  | "payload_renamed"
  | "manifest_temp_written"
  | "manifest_temp_fsynced"
  | "manifest_renamed"
  | "pointer_renamed"
  | "claim_unlinked"
  | "release_proof_published"
  | "release_proof_gc_unlinked"
  | "releasing_gc_unlinked";
export type StaleLoopClaimApprovalRecord = StaleLoopClaimRecoveryPacket &
  RecoveryMutexObservation & { expiresAt: string };

export function actionBindingLoopRecoveryAuthority(
  record: StaleLoopClaimApprovalRecord,
  now = () => new Date(),
): StaleLoopClaimRecoveryAuthority {
  return {
    verify: (packet, mutex) =>
      Number.isFinite(Date.parse(record.expiresAt)) &&
      now().getTime() <= Date.parse(record.expiresAt) &&
      JSON.stringify({ ...packet, ...mutex }) ===
        JSON.stringify({
          planId: record.planId,
          claimDigest: record.claimDigest,
          pointerDigest: record.pointerDigest,
          manifestDigest: record.manifestDigest,
          approvedBy: record.approvedBy,
          auditId: record.auditId,
          action: record.action,
          mutexDigest: record.mutexDigest,
        }),
  };
}
const MAX_MANIFEST_HISTORY = 4096;

function resolvePointerManifest(
  value: ReturnType<typeof loopEpochPaths>,
  planId: string,
  pointerText: string,
): string {
  const pointer = JSON.parse(pointerText) as {
    schema?: unknown;
    planId?: unknown;
    epochId?: unknown;
    manifestFile?: unknown;
    manifestDigest?: unknown;
  };
  if (
    pointer.schema !== LOOP_EPOCH_POINTER_SCHEMA ||
    pointer.planId !== planId ||
    !Number.isSafeInteger(pointer.epochId) ||
    typeof pointer.manifestFile !== "string" ||
    !pointer.manifestFile.startsWith(`${assertLoopPlanId(planId)}.epoch-`) ||
    !pointer.manifestFile.endsWith(".manifest.json") ||
    typeof pointer.manifestDigest !== "string"
  )
    throw new Error("loop epoch pointer is invalid");
  const manifestText = readIfExists(value.manifestFor(pointer.manifestFile));
  const manifest = manifestText === null ? null : parseLoopEpochManifest(manifestText);
  if (
    manifestText === null ||
    sha256Digest(manifestText) !== pointer.manifestDigest ||
    manifest === null ||
    manifest.planId !== planId ||
    manifest.epochId !== pointer.epochId
  )
    throw new Error("loop epoch pointer digest or identity is invalid");
  return manifestText;
}

function readLinuxText(path: string): string | null {
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return null;
  }
}

function bootIdentity(): string | null {
  return platform() === "linux" ? readLinuxText("/proc/sys/kernel/random/boot_id") : null;
}

function processStartToken(pid: number): string | null {
  if (platform() !== "linux") return null;
  const stat = readLinuxText(`/proc/${pid}/stat`);
  if (!stat) return null;
  const closing = stat.lastIndexOf(")");
  return closing >= 0 ? (stat.slice(closing + 2).split(/\s+/)[19] ?? null) : null;
}

function processLiveness(pid: number): "live" | "dead" | "unknown" {
  try {
    process.kill(pid, 0);
    return "live";
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ESRCH") return "dead";
    if (code === "EPERM") return "live";
    return "unknown";
  }
}

function claimStatus(text: string | null): "absent" | "live" | "stale" {
  if (text === null) return "absent";
  try {
    const claim = JSON.parse(text) as Partial<ClaimMetadata>;
    if (typeof claim.pid !== "number" || typeof claim.leaseDeadlineUptimeMs !== "number")
      return "live";
    const currentBoot = bootIdentity();
    if (claim.bootIdentity && currentBoot && claim.bootIdentity !== currentBoot) return "stale";
    const currentToken = processStartToken(claim.pid);
    if (claim.processStartToken && currentToken === claim.processStartToken) return "live";
    if (claim.processStartToken && currentToken && claim.processStartToken !== currentToken)
      return "stale";
    if (platform() === "linux" && currentToken === null) return "stale";
    const liveness = processLiveness(claim.pid);
    if (liveness === "live") return "live";
    if (liveness === "dead") return "stale";
    return "live";
  } catch {
    return "live";
  }
}

function readIfExists(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function fsyncPath(path: string): void {
  const fd = openSync(path, platform() === "win32" ? "r+" : "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function fsyncDirectory(path: string): void {
  try {
    fsyncPath(path);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (platform() === "win32" && ["EINVAL", "EPERM", "ENOTSUP", "EISDIR"].includes(code ?? ""))
      return;
    throw error;
  }
}

function validReleaseProof(value: ReturnType<typeof loopEpochPaths>, planId: string): boolean {
  const releasingText = readIfExists(value.releasingClaim);
  const proofText = readIfExists(value.releaseProof);
  if (releasingText === null || proofText === null) return false;
  try {
    const proof = JSON.parse(proofText) as Record<string, unknown>;
    const pointerText = readIfExists(value.manifest);
    return (
      proof.schema === "helix.loop-claim-release.v1" &&
      proof.planId === planId &&
      proof.claimDigest === sha256Digest(releasingText) &&
      proof.pointerDigest === sha256Digest(pointerText ?? "")
    );
  } catch {
    return false;
  }
}

export function loopEpochPaths(root: string, planId: string) {
  const safe = assertLoopPlanId(planId);
  const directory = join(root, ".helix", "state", "loop");
  return {
    durabilityCapability:
      platform() === "win32" ? "file_fsync_same_volume_rename" : "posix_dir_fsync",
    directory,
    claim: join(directory, `${safe}.epoch.claim`),
    releasingClaim: join(directory, `${safe}.epoch.claim.releasing`),
    releaseProof: join(directory, `${safe}.epoch.claim.release-proof.json`),
    releaseProofTemp: join(directory, `${safe}.epoch.claim.release-proof.tmp`),
    recoveryClaim: join(directory, `${safe}.epoch.recovery.claim`),
    recoveryClaimTempFor: (recoveryId: string) =>
      join(directory, `${safe}.${recoveryId}.epoch.recovery-claim.tmp`),
    recoveryClaimTombstoneFor: (recoveryId: string) =>
      join(directory, `${safe}.${recoveryId}.epoch.recovery-claim.stale.json`),
    recoveryClaimApprovalFor: (recoveryId: string) =>
      join(directory, `${safe}.${recoveryId}.epoch.recovery-claim.approval.json`),
    recoveryAuditTempFor: (recoveryId: string) =>
      join(directory, `${safe}.${recoveryId}.recovery-audit.tmp`),
    claimTombstoneFor: (recoveryId: string) =>
      join(directory, `${safe}.${recoveryId}.epoch.claim.recovered.json`),
    manifest: join(directory, `${safe}.epoch.current.json`),
    manifestFor: (manifestFile: string) => join(directory, manifestFile),
    payloadFor: (payloadFile: string) => join(directory, payloadFile),
    payloadTempFor: (tempId: string) => join(directory, `${safe}.${tempId}.payload.tmp`),
    manifestTempFor: (tempId: string) => join(directory, `${safe}.${tempId}.manifest.tmp`),
    pointerTempFor: (tempId: string) => join(directory, `${safe}.${tempId}.pointer.tmp`),
  };
}

export function nodeDurableEpochPort(
  root: string,
  hooks: { afterBoundary?: (boundary: DurableEpochBoundary) => void } = {},
): DurableEpochPort {
  const paths = (planId: string) => loopEpochPaths(root, planId);
  let releaseProofPending = false;
  return {
    acquireExclusiveClaim: (planId) => {
      const value = paths(planId);
      mkdirSync(value.directory, { recursive: true });
      if (existsSync(value.releasingClaim) || existsSync(value.releaseProof)) {
        if (!validReleaseProof(value, planId))
          throw new Error("loop claim release proof is invalid");
        unlinkSync(value.releaseProof);
        fsyncDirectory(value.directory);
        hooks.afterBoundary?.("release_proof_gc_unlinked");
        unlinkSync(value.releasingClaim);
        fsyncDirectory(value.directory);
        hooks.afterBoundary?.("releasing_gc_unlinked");
      }
      try {
        const fd = openSync(value.claim, "wx", 0o600);
        try {
          const pointerText = readIfExists(value.manifest);
          let manifestDigest: string | null = null;
          if (pointerText !== null) {
            try {
              manifestDigest = sha256Digest(resolvePointerManifest(value, planId, pointerText));
            } catch {
              manifestDigest = null;
            }
          }
          writeFileSync(
            fd,
            `${JSON.stringify({
              claimId: randomUUID(),
              pid: process.pid,
              bootIdentity: bootIdentity(),
              processStartToken: processStartToken(process.pid),
              leaseDeadlineUptimeMs: uptime() * 1000 + 60_000,
              pointerDigest: sha256Digest(pointerText ?? ""),
              manifestDigest,
            } satisfies ClaimMetadata)}\n`,
          );
          fsyncSync(fd);
        } finally {
          closeSync(fd);
        }
        if (existsSync(value.releasingClaim)) {
          unlinkSync(value.claim);
          fsyncDirectory(value.directory);
          return false;
        }
        fsyncDirectory(value.directory);
        hooks.afterBoundary?.("claim_acquired");
        return true;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
        throw error;
      }
    },
    readManifestText: (planId) => {
      const value = paths(planId);
      const pointerText = readIfExists(value.manifest);
      if (pointerText === null) return null;
      return resolvePointerManifest(value, planId, pointerText);
    },
    writePayloadTemp: (planId, tempId, text) => {
      writeFileSync(paths(planId).payloadTempFor(tempId), text, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      });
      hooks.afterBoundary?.("payload_temp_written");
    },
    fsyncPayloadTemp: (planId, tempId) => {
      fsyncPath(paths(planId).payloadTempFor(tempId));
      hooks.afterBoundary?.("payload_temp_fsynced");
    },
    renamePayload: (planId, tempId, payloadFile) => {
      renameSync(paths(planId).payloadTempFor(tempId), paths(planId).payloadFor(payloadFile));
      hooks.afterBoundary?.("payload_renamed");
    },
    fsyncStateDirectory: (planId) => fsyncDirectory(paths(planId).directory),
    writeManifestTemp: (planId, tempId, text) => {
      writeFileSync(paths(planId).manifestTempFor(tempId), text, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      });
      hooks.afterBoundary?.("manifest_temp_written");
    },
    fsyncManifestTemp: (planId, tempId) => {
      fsyncPath(paths(planId).manifestTempFor(tempId));
      hooks.afterBoundary?.("manifest_temp_fsynced");
    },
    renameManifest: (planId, tempId, manifestFile) => {
      renameSync(paths(planId).manifestTempFor(tempId), paths(planId).manifestFor(manifestFile));
      hooks.afterBoundary?.("manifest_renamed");
    },
    writePointerTemp: (planId, tempId, text) =>
      writeFileSync(paths(planId).pointerTempFor(tempId), text, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      }),
    fsyncPointerTemp: (planId, tempId) => fsyncPath(paths(planId).pointerTempFor(tempId)),
    renamePointer: (planId, tempId) => {
      renameSync(paths(planId).pointerTempFor(tempId), paths(planId).manifest);
      hooks.afterBoundary?.("pointer_renamed");
    },
    unlinkClaim: (planId) => {
      renameSync(paths(planId).claim, paths(planId).releasingClaim);
      hooks.afterBoundary?.("claim_unlinked");
    },
    finalizeClaimRelease: (planId) => {
      const value = paths(planId);
      const releasingText = readFileSync(value.releasingClaim, "utf8");
      const pointerText = readIfExists(value.manifest);
      writeFileSync(
        value.releaseProofTemp,
        `${JSON.stringify({
          schema: "helix.loop-claim-release.v1",
          planId,
          claimDigest: sha256Digest(releasingText),
          pointerDigest: sha256Digest(pointerText ?? ""),
        })}\n`,
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
      fsyncPath(value.releaseProofTemp);
      renameSync(value.releaseProofTemp, value.releaseProof);
      releaseProofPending = true;
    },
    fsyncClaimDirectory: (planId) => {
      fsyncDirectory(paths(planId).directory);
      if (releaseProofPending) {
        releaseProofPending = false;
        hooks.afterBoundary?.("release_proof_published");
      }
    },
  };
}

export function recoverStaleLoopClaim(
  root: string,
  packet: StaleLoopClaimRecoveryPacket,
  authority: StaleLoopClaimRecoveryAuthority,
): {
  status: "recovered" | "rejected" | "conflict" | "durability_uncertain";
  reason: string;
  recoveryId?: string;
} {
  const planId = assertLoopPlanId(packet.planId);
  const value = loopEpochPaths(root, planId);
  mkdirSync(value.directory, { recursive: true });
  const observedMutexText = readIfExists(value.recoveryClaim);
  let observedMutexValid = false;
  if (observedMutexText !== null) {
    try {
      const parsed = JSON.parse(observedMutexText) as Partial<RecoveryClaimMetadata>;
      observedMutexValid =
        typeof parsed.claimId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
          parsed.claimId,
        ) &&
        typeof parsed.packetDigest === "string";
    } catch {
      observedMutexValid = false;
    }
  }
  const mutexObservation: RecoveryMutexObservation = {
    action:
      observedMutexText === null
        ? "acquire"
        : !observedMutexValid
          ? "quarantine_invalid_mutex"
          : claimStatus(observedMutexText) === "stale"
            ? "replace_stale_mutex"
            : "observe_live_mutex",
    mutexDigest: observedMutexText === null ? null : sha256Digest(observedMutexText),
  };
  let authorityVerified = false;
  try {
    authorityVerified = authority.verify(packet, mutexObservation);
  } catch {
    return { status: "rejected", reason: "authority_unavailable" };
  }
  if (!packet.approvedBy.trim() || !packet.auditId.trim() || !authorityVerified)
    return { status: "rejected", reason: "authority_missing" };
  let acquired = false;
  let result: {
    status: "recovered" | "rejected" | "conflict" | "durability_uncertain";
    reason: string;
    recoveryId?: string;
  } = { status: "durability_uncertain", reason: "recovery_not_started" };
  try {
    const mutexId = randomUUID();
    const mutexTemp = value.recoveryClaimTempFor(mutexId);
    const pointerTextAtClaim = readIfExists(value.manifest);
    writeFileSync(
      mutexTemp,
      `${JSON.stringify({
        claimId: mutexId,
        pid: process.pid,
        bootIdentity: bootIdentity(),
        processStartToken: processStartToken(process.pid),
        leaseDeadlineUptimeMs: uptime() * 1000 + 60_000,
        pointerDigest: sha256Digest(pointerTextAtClaim ?? ""),
        manifestDigest: packet.manifestDigest,
        packetDigest: sha256Digest(JSON.stringify(packet)),
      } satisfies RecoveryClaimMetadata)}\n`,
      { encoding: "utf8", flag: "wx", mode: 0o600 },
    );
    fsyncPath(mutexTemp);
    let recoveryClaimCreated = false;
    for (let attempt = 0; attempt < 2 && !recoveryClaimCreated; attempt += 1) {
      try {
        linkSync(mutexTemp, value.recoveryClaim);
        acquired = true;
        recoveryClaimCreated = true;
        fsyncDirectory(value.directory);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        const residualText = readIfExists(value.recoveryClaim);
        if (residualText === null) continue;
        let residual: Partial<RecoveryClaimMetadata> | null = null;
        try {
          residual = JSON.parse(residualText) as Partial<RecoveryClaimMetadata>;
        } catch {
          residual = null;
        }
        const residualTrusted =
          residual !== null &&
          typeof residual.claimId === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
            residual.claimId,
          ) &&
          typeof residual.packetDigest === "string";
        if (residualTrusted && claimStatus(residualText) !== "stale")
          return { status: "conflict", reason: "recovery_claim_conflict" };
        if (mutexObservation.mutexDigest !== sha256Digest(residualText))
          return { status: "conflict", reason: "recovery_claim_snapshot_changed" };
        try {
          const cleanupId = randomUUID();
          writeFileSync(
            value.recoveryClaimApprovalFor(cleanupId),
            `${JSON.stringify({
              schema: "helix.loop-recovery-mutex-cleanup.v1",
              cleanupId,
              packet,
              packetDigest: sha256Digest(JSON.stringify(packet)),
              mutexObservation,
              observedMutexDigest: sha256Digest(residualText),
              cleanedAt: new Date().toISOString(),
            })}\n`,
            { encoding: "utf8", flag: "wx", mode: 0o600 },
          );
          fsyncPath(value.recoveryClaimApprovalFor(cleanupId));
          fsyncDirectory(value.directory);
          renameSync(value.recoveryClaim, value.recoveryClaimTombstoneFor(cleanupId));
          fsyncDirectory(value.directory);
        } catch (renameError) {
          if ((renameError as NodeJS.ErrnoException).code !== "ENOENT") throw renameError;
        }
      }
    }
    unlinkSync(mutexTemp);
    fsyncDirectory(value.directory);
    if (!recoveryClaimCreated) return { status: "conflict", reason: "recovery_claim_conflict" };
    const claimPath = existsSync(value.claim)
      ? value.claim
      : existsSync(value.releasingClaim)
        ? value.releasingClaim
        : null;
    const claimText = claimPath === null ? null : readIfExists(claimPath);
    if (claimText === null || claimStatus(claimText) !== "stale")
      return { status: "rejected", reason: "claim_not_provably_stale" };
    const claim = JSON.parse(claimText) as Partial<ClaimMetadata>;
    const pointerText = readIfExists(value.manifest);
    let manifestDigest: string | null = null;
    if (pointerText !== null)
      manifestDigest = sha256Digest(resolvePointerManifest(value, planId, pointerText));
    if (
      typeof claim.claimId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        claim.claimId,
      ) ||
      claim.pointerDigest !== sha256Digest(pointerText ?? "") ||
      claim.manifestDigest !== manifestDigest ||
      packet.claimDigest !== sha256Digest(claimText) ||
      packet.pointerDigest !== claim.pointerDigest ||
      packet.manifestDigest !== claim.manifestDigest
    )
      return { status: "rejected", reason: "snapshot_digest_mismatch" };
    const recoveryId = randomUUID();
    const auditText = `${JSON.stringify({
      schema: "helix.loop-claim-recovery.v1",
      recoveryId,
      packet,
      packetDigest: sha256Digest(JSON.stringify(packet)),
      claim: JSON.parse(claimText),
      claimDigest: sha256Digest(claimText),
      recoveredAt: new Date().toISOString(),
    })}\n`;
    const auditTemp = value.recoveryAuditTempFor(recoveryId);
    writeFileSync(auditTemp, auditText, { encoding: "utf8", flag: "wx", mode: 0o600 });
    fsyncPath(auditTemp);
    renameSync(auditTemp, value.claimTombstoneFor(recoveryId));
    fsyncDirectory(value.directory);
    if (claimPath === null) return { status: "rejected", reason: "claim_not_provably_stale" };
    if (claimPath === value.releasingClaim && existsSync(value.releaseProof)) {
      if (!validReleaseProof(value, planId))
        return { status: "rejected", reason: "release_proof_invalid" };
      unlinkSync(value.releaseProof);
      fsyncDirectory(value.directory);
    }
    unlinkSync(claimPath);
    fsyncDirectory(value.directory);
    result = { status: "recovered", reason: "stale_claim_tombstoned", recoveryId };
  } catch {
    result = { status: "durability_uncertain", reason: "recovery_verification_failed" };
  } finally {
    if (acquired) {
      try {
        unlinkSync(value.recoveryClaim);
        fsyncDirectory(value.directory);
      } catch {
        result = { status: "durability_uncertain", reason: "recovery_cleanup_failed" };
      }
    }
  }
  return result;
}

export function readLoopEpochFromFs(root: string, planId: string): LoopEpochReadResult {
  const paths = loopEpochPaths(root, planId);
  try {
    const pointerText = readIfExists(paths.manifest);
    const releasingText = readIfExists(paths.releasingClaim);
    const claimText =
      readIfExists(paths.claim) ??
      (releasingText !== null && !validReleaseProof(paths, planId) ? releasingText : null);
    let manifestText: string | null = null;
    let previousManifestText: string | null | undefined;
    let conflictingManifestText: string | null = null;
    let payloadText: string | null = null;
    if (pointerText !== null) {
      try {
        const pointer = JSON.parse(pointerText) as {
          schema?: unknown;
          planId?: unknown;
          epochId?: unknown;
          manifestFile?: unknown;
          manifestDigest?: unknown;
        };
        if (
          pointer.schema !== LOOP_EPOCH_POINTER_SCHEMA ||
          pointer.planId !== planId ||
          !Number.isSafeInteger(pointer.epochId) ||
          typeof pointer.manifestFile !== "string" ||
          !pointer.manifestFile.startsWith(`${assertLoopPlanId(planId)}.epoch-`) ||
          !pointer.manifestFile.endsWith(".manifest.json") ||
          typeof pointer.manifestDigest !== "string"
        )
          return { status: "corrupt", manifest: null, payload: null, reason: "pointer_invalid" };
        manifestText = readIfExists(paths.manifestFor(pointer.manifestFile));
        if (manifestText === null || sha256Digest(manifestText) !== pointer.manifestDigest)
          return {
            status: "corrupt",
            manifest: null,
            payload: null,
            reason: "pointer_digest_mismatch",
          };
        const manifest = parseLoopEpochManifest(manifestText);
        if (manifest === null || manifest.epochId !== pointer.epochId)
          return { status: "corrupt", manifest: null, payload: null, reason: "manifest_invalid" };
        payloadText = readIfExists(paths.payloadFor(manifest.payloadFile));
        const history = readdirSync(paths.directory).filter(
          (name) =>
            name.startsWith(`${assertLoopPlanId(planId)}.epoch-`) &&
            name.endsWith(".manifest.json") &&
            name !== pointer.manifestFile,
        );
        if (history.length > MAX_MANIFEST_HISTORY)
          return {
            status: "durability_uncertain",
            manifest,
            payload: null,
            reason: "history_limit",
          };
        const historyTexts = history
          .map((name) => readIfExists(paths.manifestFor(name)))
          .filter((text): text is string => text !== null);
        const allTexts = [manifestText, ...historyTexts];
        const parsedHistory = allTexts.map((text) => ({
          text,
          digest: sha256Digest(text),
          manifest: parseLoopEpochManifest(text),
        }));
        if (
          parsedHistory.some((row) => row.manifest === null || row.manifest.planId !== planId) ||
          new Set(parsedHistory.map((row) => row.manifest?.epochId)).size !== parsedHistory.length
        ) {
          return { status: "concurrent_conflict", manifest, payload: null, reason: "history_fork" };
        }
        let cursor = manifest;
        const seen = new Set<string>();
        while (true) {
          if (seen.has(`${cursor.epochId}:${cursor.previousManifestDigest}`))
            return {
              status: "concurrent_conflict",
              manifest,
              payload: null,
              reason: "history_cycle",
            };
          seen.add(`${cursor.epochId}:${cursor.previousManifestDigest}`);
          const cursorPayloadText = readIfExists(paths.payloadFor(cursor.payloadFile));
          if (
            cursorPayloadText === null ||
            sha256Digest(cursorPayloadText) !== cursor.payloadDigest ||
            parseLoopEpochPayload(cursorPayloadText, planId) === null
          )
            return {
              status: "corrupt",
              manifest,
              payload: null,
              reason: "history_payload_invalid",
            };
          if (cursor.epochId === 0) {
            if (cursor.previousManifestDigest !== null)
              return {
                status: "concurrent_conflict",
                manifest,
                payload: null,
                reason: "history_root_invalid",
              };
            break;
          }
          const previous = parsedHistory.find(
            (row) => row.digest === cursor.previousManifestDigest,
          );
          if (
            previous?.manifest === null ||
            previous?.manifest === undefined ||
            previous.manifest.epochId !== cursor.epochId - 1
          )
            return {
              status: "concurrent_conflict",
              manifest,
              payload: null,
              reason: "history_gap",
            };
          if (cursor === manifest) previousManifestText = previous.text;
          cursor = previous.manifest;
        }
        conflictingManifestText =
          historyTexts.find((text) => {
            if (text === null) return false;
            try {
              return (JSON.parse(text) as { epochId?: unknown }).epochId === manifest.epochId;
            } catch {
              return false;
            }
          }) ?? null;
      } catch {
        return {
          status: "corrupt",
          manifest: null,
          payload: null,
          reason: "pointer_or_manifest_invalid",
        };
      }
    } else if (existsSync(paths.directory)) {
      const orphan = readdirSync(paths.directory).find(
        (name) =>
          name.startsWith(`${assertLoopPlanId(planId)}.epoch-`) && name.endsWith(".payload.json"),
      );
      if (orphan) payloadText = readIfExists(join(paths.directory, orphan));
    }
    return classifyLoopEpochFiles({
      planId,
      manifestText,
      payloadText,
      claimStatus: claimStatus(claimText),
      previousManifestText,
      conflictingManifestText,
    });
  } catch {
    return {
      status: "durability_uncertain",
      manifest: null,
      payload: null,
      reason: "filesystem_snapshot_unreadable",
    };
  }
}
