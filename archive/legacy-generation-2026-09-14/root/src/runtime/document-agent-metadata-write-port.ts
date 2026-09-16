import { createHash, randomUUID } from "node:crypto";
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
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import type {
  DocumentAgentMetadataChange,
  DocumentAgentMetadataWritePort,
} from "./document-agent-metadata-apply";

function digest(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function target(root: string, path: string): string {
  if (!path || isAbsolute(path) || path.includes("\0"))
    throw new Error("document_agent_target_invalid");
  const absolute = resolve(root, path);
  const inside = relative(root, absolute);
  if (
    !inside ||
    inside === ".." ||
    inside.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`)
  )
    throw new Error("document_agent_target_escapes_root");
  if (existsSync(absolute) && lstatSync(absolute).isSymbolicLink())
    throw new Error("document_agent_target_symlink");
  return absolute;
}

function atomicReplace(targetPath: string, content: string): void {
  const directory = dirname(targetPath);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
  const directoryStat = lstatSync(directory);
  if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink())
    throw new Error("document_agent_target_parent_untrusted");
  const temporary = join(directory, `.${randomUUID()}.document-agent.tmp`);
  const fd = openSync(temporary, "wx", 0o600);
  try {
    writeFileSync(fd, content, "utf8");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    renameSync(temporary, targetPath);
    const dirFd = openSync(directory, "r");
    try {
      fsyncSync(dirFd);
    } finally {
      closeSync(dirFd);
    }
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

/** Source-owned document transaction port. Only a digest-pinned plan may modify its targets. */
export function createDocumentAgentMetadataWritePort(
  repoRoot: string,
): DocumentAgentMetadataWritePort {
  const root = resolve(repoRoot);
  const rootStat = lstatSync(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink())
    throw new Error("document_agent_root_untrusted");
  const write = (change: DocumentAgentMetadataChange, expected: string, content: string) => {
    const targetPath = target(root, change.path);
    const current = readFileSync(targetPath, "utf8");
    if (digest(current) !== expected) throw new Error("document_agent_before_digest_mismatch");
    atomicReplace(targetPath, content);
    if (digest(readFileSync(targetPath, "utf8")) !== digest(content))
      throw new Error("document_agent_after_digest_mismatch");
    return { durable: true };
  };
  return {
    write: (change) => write(change, change.beforeDigest, change.content),
    restore: (change) => write(change, change.afterDigest, change.beforeContent),
  };
}
