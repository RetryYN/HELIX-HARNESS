import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  buildDocumentChangeReport,
  type DocumentChangeReport,
} from "../runtime/document-change-report";
import {
  buildSemanticDocumentSnapshot,
  diffSemanticDocuments,
  semanticSnapshotDigest,
} from "../runtime/document-semantic-diff";

function root(repoRoot: string, path: string): string {
  const repo = resolve(repoRoot);
  const target = resolve(repoRoot, path);
  if (target === repo || !target.startsWith(`${repo}/`) || !existsSync(target))
    throw new Error("docs root must be existing and repository-contained");
  return target;
}

function files(dir: string, result: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name);
    if (entry.isDirectory()) files(absolute, result);
    else if (entry.isFile() && entry.name.endsWith(".md")) result.push(absolute);
  }
}

function snapshot(repoRoot: string, path: string) {
  const base = root(repoRoot, path);
  const markdown: string[] = [];
  files(base, markdown);
  return buildSemanticDocumentSnapshot(
    markdown.sort().map((file) => ({
      path: relative(base, file).split("\\").join("/"),
      content: readFileSync(file, "utf8"),
    })),
  );
}

function gitSnapshot(repoRoot: string, ref: string, path: string) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ref) || ref.includes("..")) {
    throw new Error("invalid git revision");
  }
  const base = root(repoRoot, path);
  const relativeRoot = relative(repoRoot, base).split("\\").join("/");
  const names = execFileSync(
    "git",
    ["-C", repoRoot, "ls-tree", "-r", "--name-only", ref, "--", relativeRoot],
    { encoding: "utf8", timeout: 10_000 },
  )
    .split(/\r?\n/)
    .filter((name) => name.endsWith(".md"));
  return buildSemanticDocumentSnapshot(
    names.sort().map((name) => ({
      path: name.slice(`${relativeRoot}/`.length),
      content: execFileSync("git", ["-C", repoRoot, "show", `${ref}:${name}`], {
        encoding: "utf8",
        timeout: 10_000,
      }),
    })),
  );
}

export function loadDocumentSemanticDiffReport(input: {
  repoRoot: string;
  baseRoot: string;
  currentRoot: string;
}): DocumentChangeReport {
  const base = snapshot(input.repoRoot, input.baseRoot);
  const current = snapshot(input.repoRoot, input.currentRoot);
  const delta = diffSemanticDocuments(base.documents, current.documents);
  delta.findings.push(...base.findings, ...current.findings);
  delta.ok = !delta.findings.some((finding) => finding.severity === "error");
  return buildDocumentChangeReport({
    baseSnapshotDigest: semanticSnapshotDigest(base.documents),
    currentSnapshotDigest: semanticSnapshotDigest(current.documents),
    delta,
  });
}

export function loadDocumentSemanticDiffReportFromGit(input: {
  repoRoot: string;
  baseRef: string;
  currentRoot: string;
}): DocumentChangeReport {
  const base = gitSnapshot(input.repoRoot, input.baseRef, input.currentRoot);
  const current = snapshot(input.repoRoot, input.currentRoot);
  const delta = diffSemanticDocuments(base.documents, current.documents);
  delta.findings.push(...base.findings, ...current.findings);
  delta.ok = !delta.findings.some((finding) => finding.severity === "error");
  return buildDocumentChangeReport({
    baseSnapshotDigest: semanticSnapshotDigest(base.documents),
    currentSnapshotDigest: semanticSnapshotDigest(current.documents),
    delta,
  });
}
