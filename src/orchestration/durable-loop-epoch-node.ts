import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { assertLoopPlanId } from "../schema/loop-plan-id";
import type { DurableEpochPort } from "./durable-loop-epoch";

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
    manifest: join(directory, `${safe}.epoch.manifest.json`),
    payloadFor: (payloadFile: string) => join(directory, payloadFile),
    payloadTempFor: (tempId: string) => join(directory, `${safe}.${tempId}.payload.tmp`),
    manifestTempFor: (tempId: string) => join(directory, `${safe}.${tempId}.manifest.tmp`),
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
            `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`,
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
      const path = paths(planId).manifest;
      return existsSync(path) ? readFileSync(path, "utf8") : null;
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
    renameManifest: (planId, tempId) =>
      renameSync(paths(planId).manifestTempFor(tempId), paths(planId).manifest),
    unlinkClaim: (planId) => unlinkSync(paths(planId).claim),
    fsyncClaimDirectory: (planId) => fsyncPath(paths(planId).directory),
  };
}
