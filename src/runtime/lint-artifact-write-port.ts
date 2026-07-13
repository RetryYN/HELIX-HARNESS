import { randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { contentDigest, type MaterializeIntent, type WritePort } from "./lint-effect-executor";

export type LintArtifactWriteBoundary =
  | "after_temp_write"
  | "after_temp_fsync"
  | "after_rename"
  | "after_directory_fsync"
  | "after_verify";

export interface LintArtifactWritePortOptions {
  /** Trusted evidence root. Intent paths are always relative to this directory. */
  root: string;
  hooks?: { afterBoundary?(boundary: LintArtifactWriteBoundary): void };
}

function fsyncDirectory(path: string): void {
  const fd = openSync(path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function targetPath(root: string, path: string): string {
  if (!path || isAbsolute(path) || path.includes("\0")) throw new Error("invalid_artifact_path");
  const target = resolve(root, path);
  const inside = relative(root, target);
  if (
    !inside ||
    inside === ".." ||
    inside.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`)
  )
    throw new Error("artifact_path_escapes_root");
  if (existsSync(target) && lstatSync(target).isSymbolicLink())
    throw new Error("artifact_target_symlink");
  return target;
}

function prepareTrustedDirectory(root: string, directory: string): void {
  const rootStat = lstatSync(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink())
    throw new Error("artifact_root_untrusted");
  const segments = relative(root, directory).split(/[\\/]/).filter(Boolean);
  let current = root;
  for (const segment of segments) {
    current = join(current, segment);
    if (!existsSync(current)) mkdirSync(current);
    const stat = lstatSync(current);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("artifact_parent_untrusted");
  }
}

/** Real same-directory temp/fsync/rename/directory-fsync adapter for lint artifacts. */
export function createLintArtifactWritePort(options: LintArtifactWritePortOptions): WritePort {
  const root = resolve(options.root);
  return {
    materialize(intent: MaterializeIntent) {
      const target = targetPath(root, intent.path);
      const directory = dirname(target);
      prepareTrustedDirectory(root, directory);
      const lock = `${target}.lock`;
      const lockFd = openSync(lock, "wx", 0o600);
      try {
        const before = existsSync(target)
          ? contentDigest(readFileSync(target, "utf8"))
          : contentDigest("");
        if (before !== intent.beforeDigest) throw new Error("artifact_before_digest_mismatch");
        const temp = `${target}.${randomUUID()}.tmp`;
        let renamed = false;
        try {
          const fd = openSync(temp, "wx", 0o600);
          try {
            writeFileSync(fd, intent.content, "utf8");
            options.hooks?.afterBoundary?.("after_temp_write");
            fsyncSync(fd);
            options.hooks?.afterBoundary?.("after_temp_fsync");
          } finally {
            closeSync(fd);
          }
          renameSync(temp, target);
          renamed = true;
          options.hooks?.afterBoundary?.("after_rename");
          fsyncDirectory(directory);
          options.hooks?.afterBoundary?.("after_directory_fsync");
          const after = contentDigest(readFileSync(target, "utf8"));
          options.hooks?.afterBoundary?.("after_verify");
          return {
            changedPath: intent.path,
            beforeDigest: before,
            afterDigest: after,
            durable: true,
            partial: false,
          };
        } catch (error) {
          if (!renamed) rmSync(temp, { force: true });
          throw error;
        }
      } finally {
        closeSync(lockFd);
        unlinkSync(lock);
      }
    },
  };
}
