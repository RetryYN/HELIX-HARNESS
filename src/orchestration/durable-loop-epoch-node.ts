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
    payloadTemp: join(directory, `${safe}.epoch.payload.tmp`),
    payload: join(directory, `${safe}.epoch.payload.json`),
    manifestTemp: join(directory, `${safe}.epoch.manifest.tmp`),
    manifest: join(directory, `${safe}.epoch.manifest.json`),
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
    writePayloadTemp: (planId, text) =>
      writeFileSync(paths(planId).payloadTemp, text, { encoding: "utf8", flag: "wx", mode: 0o600 }),
    fsyncPayloadTemp: (planId) => fsyncPath(paths(planId).payloadTemp),
    renamePayload: (planId) => renameSync(paths(planId).payloadTemp, paths(planId).payload),
    fsyncStateDirectory: (planId) => fsyncPath(paths(planId).directory),
    writeManifestTemp: (planId, text) =>
      writeFileSync(paths(planId).manifestTemp, text, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      }),
    fsyncManifestTemp: (planId) => fsyncPath(paths(planId).manifestTemp),
    renameManifest: (planId) => renameSync(paths(planId).manifestTemp, paths(planId).manifest),
    unlinkClaim: (planId) => unlinkSync(paths(planId).claim),
    fsyncClaimDirectory: (planId) => fsyncPath(paths(planId).directory),
  };
}
