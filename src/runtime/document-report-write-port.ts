import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

export interface DocumentReportWriteReceipt {
  path: string;
  digest: string;
  durable: true;
}

export interface DocumentReportWriteDependencies {
  fsync: (fd: number) => void;
}

const nodeDependencies: DocumentReportWriteDependencies = { fsync: fsyncSync };

function digest(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function state(path: string): ReturnType<typeof lstatSync> | null {
  try {
    return lstatSync(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function target(root: string, path: string): string {
  if (!path || isAbsolute(path) || path.includes("\0") || path.includes("\\"))
    throw new Error("document_report_path_invalid");
  const absolute = resolve(root, path);
  const inside = relative(root, absolute);
  if (!inside || inside === ".." || inside.startsWith("../"))
    throw new Error("document_report_path_escapes_root");
  if (state(absolute)) throw new Error("document_report_target_exists");
  return absolute;
}

function pathSegments(path: string): string[] {
  if (!path || path === ".") return [];
  return path.split(/[\\/]/).filter(Boolean);
}

function inspectDirectoryChain(base: string, segments: string[], errorCode: string): void {
  let current = resolve(base);
  for (const segment of segments) {
    current = join(current, segment);
    const entry = state(current);
    if (!entry) return;
    if (!entry.isDirectory() || entry.isSymbolicLink()) throw new Error(errorCode);
  }
}

function ensureDirectoryChain(base: string, segments: string[], errorCode: string): string {
  let current = resolve(base);
  for (const segment of segments) {
    current = join(current, segment);
    const before = state(current);
    if (!before) mkdirSync(current);
    const after = state(current);
    if (!after?.isDirectory() || after.isSymbolicLink()) throw new Error(errorCode);
  }
  return current;
}

function syncDirectory(directory: string, deps: DocumentReportWriteDependencies): void {
  const directoryFd = openSync(directory, "r");
  try {
    deps.fsync(directoryFd);
  } finally {
    closeSync(directoryFd);
  }
}

/** Artifact target validation with no filesystem mutation. */
export function validateDocumentReportArtifactPath(input: {
  repoRoot: string;
  path: string;
}): string {
  const repoRoot = resolve(input.repoRoot);
  const rootSegments = [".helix", "artifacts", "document-diff"];
  const root = resolve(repoRoot, ...rootSegments);
  const output = target(root, input.path);
  inspectDirectoryChain(repoRoot, rootSegments, "document_report_root_untrusted");
  inspectDirectoryChain(
    root,
    pathSegments(relative(root, dirname(output))),
    "document_report_parent_untrusted",
  );
  return output;
}

/** New-file-only artifact writer for document diff reports. */
export function writeDocumentReportArtifact(
  input: {
    repoRoot: string;
    path: string;
    content: string;
    dryRun?: boolean;
  },
  deps: DocumentReportWriteDependencies = nodeDependencies,
): DocumentReportWriteReceipt | null {
  const output = validateDocumentReportArtifactPath(input);
  if (input.dryRun) return null;
  const repoRoot = resolve(input.repoRoot);
  const root = ensureDirectoryChain(
    repoRoot,
    [".helix", "artifacts", "document-diff"],
    "document_report_root_untrusted",
  );
  const directory = ensureDirectoryChain(
    root,
    pathSegments(relative(root, dirname(output))),
    "document_report_parent_untrusted",
  );
  target(root, input.path);
  const temp = join(directory, `.${randomUUID()}.document-report.tmp`);
  const fd = openSync(temp, "wx", 0o600);
  let published = false;
  try {
    try {
      writeFileSync(fd, input.content, "utf8");
      deps.fsync(fd);
    } finally {
      closeSync(fd);
    }
  } catch (error) {
    rmSync(temp, { force: true });
    throw error;
  }
  try {
    // A hard-link publish is same-directory and fails atomically if output already exists.
    try {
      linkSync(temp, output);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST")
        throw new Error("document_report_target_exists");
      throw error;
    }
    published = true;
    unlinkSync(temp);
    syncDirectory(directory, deps);
    if (readFileSync(output, "utf8") !== input.content)
      throw new Error("document_report_verify_failed");
    return { path: input.path, digest: digest(input.content), durable: true };
  } catch (error) {
    rmSync(temp, { force: true });
    if (published) {
      try {
        rmSync(output, { force: true });
        syncDirectory(directory, deps);
      } catch {
        throw new Error("document_report_compensation_ambiguous");
      }
    }
    throw error;
  }
}
