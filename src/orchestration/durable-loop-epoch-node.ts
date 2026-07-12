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
import { assertLoopPlanId } from "../schema/loop-plan-id";
import {
  classifyLoopEpochFiles,
  type DurableEpochPort,
  LOOP_EPOCH_POINTER_SCHEMA,
  type LoopEpochReadResult,
} from "./durable-loop-epoch";
import { sha256Digest } from "../runtime/digest";

type ClaimMetadata = {
  pid: number;
  bootIdentity: string | null;
  processStartToken: string | null;
  leaseDeadlineUptimeMs: number;
};

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
    if (uptime() * 1000 > claim.leaseDeadlineUptimeMs) return "stale";
    const currentToken = processStartToken(claim.pid);
    if (claim.processStartToken && currentToken && claim.processStartToken !== currentToken)
      return "stale";
    if (platform() === "linux" && currentToken === null) return "stale";
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

export function loopEpochPaths(root: string, planId: string) {
  const safe = assertLoopPlanId(planId);
  const directory = join(root, ".helix", "state", "loop");
  return {
    directory,
    claim: join(directory, `${safe}.epoch.claim`),
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
          writeFileSync(
            fd,
            `${JSON.stringify({
              pid: process.pid,
              bootIdentity: bootIdentity(),
              processStartToken: processStartToken(process.pid),
              leaseDeadlineUptimeMs: uptime() * 1000 + 60_000,
            } satisfies ClaimMetadata)}\n`,
          );
          fsyncSync(fd);
        } finally {
          closeSync(fd);
        }
        fsyncPath(value.directory);
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
      const pointer = JSON.parse(pointerText) as { manifestFile?: unknown; manifestDigest?: unknown };
      if (
        typeof pointer.manifestFile !== "string" ||
        !/^[A-Za-z0-9._-]+\.manifest\.json$/.test(pointer.manifestFile)
      ) return null;
      const manifestText = readIfExists(value.manifestFor(pointer.manifestFile));
      return manifestText !== null && sha256Digest(manifestText) === pointer.manifestDigest
        ? manifestText
        : null;
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
    fsyncStateDirectory: (planId) => fsyncPath(paths(planId).directory),
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
      writeFileSync(paths(planId).pointerTempFor(tempId), text, { encoding: "utf8", flag: "wx", mode: 0o600 }),
    fsyncPointerTemp: (planId, tempId) => fsyncPath(paths(planId).pointerTempFor(tempId)),
    renamePointer: (planId, tempId) =>
      renameSync(paths(planId).pointerTempFor(tempId), paths(planId).manifest),
    unlinkClaim: (planId) => unlinkSync(paths(planId).claim),
    fsyncClaimDirectory: (planId) => fsyncPath(paths(planId).directory),
  };
}

export function readLoopEpochFromFs(root: string, planId: string): LoopEpochReadResult {
  const paths = loopEpochPaths(root, planId);
  try {
    const manifestText = readIfExists(paths.manifest);
    const claimText = readIfExists(paths.claim);
    let payloadText: string | null = null;
    if (manifestText !== null) {
      try {
        const manifest = JSON.parse(manifestText) as { payloadFile?: unknown };
        if (
          typeof manifest.payloadFile === "string" &&
          /^[A-Za-z0-9._-]+\.payload\.json$/.test(manifest.payloadFile)
        ) {
          payloadText = readIfExists(paths.payloadFor(manifest.payloadFile));
        }
      } catch {
        payloadText = null;
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
