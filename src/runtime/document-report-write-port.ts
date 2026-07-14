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

export interface DocumentReportWriteReceipt {
  path: string;
  digest: string;
  durable: true;
}

function digest(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function target(root: string, path: string): string {
  if (!path || isAbsolute(path) || path.includes("\0") || path.includes("\\"))
    throw new Error("document_report_path_invalid");
  const absolute = resolve(root, path);
  const inside = relative(root, absolute);
  if (!inside || inside === ".." || inside.startsWith("../"))
    throw new Error("document_report_path_escapes_root");
  if (existsSync(absolute)) throw new Error("document_report_target_exists");
  return absolute;
}

/** New-file-only artifact writer for document diff reports. */
export function writeDocumentReportArtifact(input: {
  repoRoot: string;
  path: string;
  content: string;
  dryRun?: boolean;
}): DocumentReportWriteReceipt | null {
  const root = resolve(input.repoRoot, ".helix", "artifacts", "document-diff");
  if (input.dryRun) return null;
  mkdirSync(root, { recursive: true });
  if (!lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink())
    throw new Error("document_report_root_untrusted");
  const output = target(root, input.path);
  const directory = dirname(output);
  mkdirSync(directory, { recursive: true });
  if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink())
    throw new Error("document_report_parent_untrusted");
  const temp = join(directory, `.${randomUUID()}.document-report.tmp`);
  const fd = openSync(temp, "wx", 0o600);
  try {
    writeFileSync(fd, input.content, "utf8");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    renameSync(temp, output);
    const directoryFd = openSync(directory, "r");
    try {
      fsyncSync(directoryFd);
    } finally {
      closeSync(directoryFd);
    }
    if (readFileSync(output, "utf8") !== input.content)
      throw new Error("document_report_verify_failed");
    return { path: input.path, digest: digest(input.content), durable: true };
  } catch (error) {
    rmSync(temp, { force: true });
    throw error;
  }
}
