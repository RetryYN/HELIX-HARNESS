import { randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
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
export interface StaleLoopClaimRecoveryAuthority {
  verify(packet: StaleLoopClaimRecoveryPacket): boolean;
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
    if (uptime() * 1000 > claim.leaseDeadlineUptimeMs) return "stale";
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
  const fd = openSync(path, "r");
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

export function loopEpochPaths(root: string, planId: string) {
  const safe = assertLoopPlanId(planId);
  const directory = join(root, ".helix", "state", "loop");
  return {
    durabilityCapability:
      platform() === "win32" ? "file_fsync_same_volume_rename" : "posix_dir_fsync",
    directory,
    claim: join(directory, `${safe}.epoch.claim`),
    recoveryClaim: join(directory, `${safe}.epoch.recovery.claim`),
    recoveryClaimTombstoneFor: (recoveryId: string) =>
      join(directory, `${safe}.${recoveryId}.epoch.recovery-claim.stale.json`),
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

export function nodeDurableEpochPort(root: string): DurableEpochPort {
  const paths = (planId: string) => loopEpochPaths(root, planId);
  return {
    acquireExclusiveClaim: (planId) => {
      const value = paths(planId);
      mkdirSync(value.directory, { recursive: true });
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
        fsyncDirectory(value.directory);
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
    writePayloadTemp: (planId, tempId, text) =>
      writeFileSync(paths(planId).payloadTempFor(tempId), text, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      }),
    fsyncPayloadTemp: (planId, tempId) => fsyncPath(paths(planId).payloadTempFor(tempId)),
    renamePayload: (planId, tempId, payloadFile) =>
      renameSync(paths(planId).payloadTempFor(tempId), paths(planId).payloadFor(payloadFile)),
    fsyncStateDirectory: (planId) => fsyncDirectory(paths(planId).directory),
    writeManifestTemp: (planId, tempId, text) =>
      writeFileSync(paths(planId).manifestTempFor(tempId), text, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      }),
    fsyncManifestTemp: (planId, tempId) => fsyncPath(paths(planId).manifestTempFor(tempId)),
    renameManifest: (planId, tempId, manifestFile) =>
      renameSync(paths(planId).manifestTempFor(tempId), paths(planId).manifestFor(manifestFile)),
    writePointerTemp: (planId, tempId, text) =>
      writeFileSync(paths(planId).pointerTempFor(tempId), text, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      }),
    fsyncPointerTemp: (planId, tempId) => fsyncPath(paths(planId).pointerTempFor(tempId)),
    renamePointer: (planId, tempId) =>
      renameSync(paths(planId).pointerTempFor(tempId), paths(planId).manifest),
    unlinkClaim: (planId) => unlinkSync(paths(planId).claim),
    fsyncClaimDirectory: (planId) => fsyncDirectory(paths(planId).directory),
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
  let authorityVerified = false;
  try {
    authorityVerified = authority.verify(packet);
  } catch {
    return { status: "rejected", reason: "authority_unavailable" };
  }
  if (!packet.approvedBy.trim() || !packet.auditId.trim() || !authorityVerified)
    return { status: "rejected", reason: "authority_missing" };
  mkdirSync(value.directory, { recursive: true });
  let acquired = false;
  let result: {
    status: "recovered" | "rejected" | "conflict" | "durability_uncertain";
    reason: string;
    recoveryId?: string;
  } = { status: "durability_uncertain", reason: "recovery_not_started" };
  try {
    let recoveryFd: number | null = null;
    for (let attempt = 0; attempt < 2 && recoveryFd === null; attempt += 1) {
      try {
        recoveryFd = openSync(value.recoveryClaim, "wx", 0o600);
        acquired = true;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        const residualText = readIfExists(value.recoveryClaim);
        if (residualText === null) continue;
        if (claimStatus(residualText) !== "stale")
          return { status: "conflict", reason: "recovery_claim_conflict" };
        const residual = JSON.parse(residualText) as Partial<RecoveryClaimMetadata>;
        if (
          typeof residual.claimId !== "string" ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
            residual.claimId,
          ) ||
          typeof residual.packetDigest !== "string"
        )
          return { status: "conflict", reason: "recovery_claim_untrusted" };
        try {
          renameSync(value.recoveryClaim, value.recoveryClaimTombstoneFor(randomUUID()));
          fsyncDirectory(value.directory);
        } catch (renameError) {
          if ((renameError as NodeJS.ErrnoException).code !== "ENOENT") throw renameError;
        }
      }
    }
    if (recoveryFd === null) return { status: "conflict", reason: "recovery_claim_conflict" };
    try {
      const pointerText = readIfExists(value.manifest);
      writeFileSync(
        recoveryFd,
        `${JSON.stringify({
          claimId: randomUUID(),
          pid: process.pid,
          bootIdentity: bootIdentity(),
          processStartToken: processStartToken(process.pid),
          leaseDeadlineUptimeMs: uptime() * 1000 + 60_000,
          pointerDigest: sha256Digest(pointerText ?? ""),
          manifestDigest: packet.manifestDigest,
          packetDigest: sha256Digest(JSON.stringify(packet)),
        } satisfies RecoveryClaimMetadata)}\n`,
      );
      fsyncSync(recoveryFd);
    } finally {
      closeSync(recoveryFd);
    }
    fsyncDirectory(value.directory);
    const claimText = readIfExists(value.claim);
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
    unlinkSync(value.claim);
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
    const claimText = readIfExists(paths.claim);
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
