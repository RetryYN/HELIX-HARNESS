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
import { DocumentAgentMetadataWriteError } from "./document-agent-metadata-apply";

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
  let ancestor = root;
  for (const segment of inside.split(/[\\/]/)) {
    ancestor = join(ancestor, segment);
    if (existsSync(ancestor) && lstatSync(ancestor).isSymbolicLink())
      throw new Error("document_agent_target_symlink");
  }
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
  options: {
    beforePublish?: (change: DocumentAgentMetadataChange, operation: "write" | "restore") => void;
    afterPublish?: (change: DocumentAgentMetadataChange, operation: "write" | "restore") => void;
  } = {},
): DocumentAgentMetadataWritePort {
  const root = resolve(repoRoot);
  const rootStat = lstatSync(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink())
    throw new Error("document_agent_root_untrusted");
  const preflight = (change: DocumentAgentMetadataChange, expected: string): string => {
    try {
      const targetPath = target(root, change.path);
      const current = readFileSync(targetPath, "utf8");
      if (digest(current) !== expected) throw new Error("document_agent_before_digest_mismatch");
      return targetPath;
    } catch (error) {
      throw new DocumentAgentMetadataWriteError(
        error instanceof Error ? error.message : "document_agent_write_preflight_failed",
      );
    }
  };
  const write = (
    change: DocumentAgentMetadataChange,
    expected: string,
    content: string,
    operation: "write" | "restore",
  ) => {
    const targetPath = preflight(change, expected);
    options.beforePublish?.(change, operation);
    atomicReplace(targetPath, content);
    if (digest(readFileSync(targetPath, "utf8")) !== digest(content))
      throw new Error("document_agent_after_digest_mismatch");
    options.afterPublish?.(change, operation);
    return { durable: true };
  };
  return {
    preflight: (change) => {
      preflight(change, change.beforeDigest);
    },
    write: (change) => write(change, change.beforeDigest, change.content, "write"),
    restore: (change) => write(change, change.afterDigest, change.beforeContent, "restore"),
  };
}
