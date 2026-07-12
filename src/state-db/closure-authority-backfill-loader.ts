import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import type {
  ClosureAuthorityBackfillInput,
  CollectedBackfillTest,
} from "../policy/closure-authority-backfill";

type Digest = `sha256:${string}`;
export const CLOSURE_GATE_ALLOWLIST_PATH = "docs/governance/closure-gate-allowlist.yaml" as const;
const sha256 = (bytes: string | Buffer): Digest =>
  `sha256:${createHash("sha256").update(bytes).digest("hex")}`;

function canonicalLexical(path: string): boolean {
  return (
    !isAbsolute(path) &&
    !path.includes("\\") &&
    !path.startsWith("./") &&
    !path.endsWith("/") &&
    !path.split("/").some((part) => !part || part === "." || part === "..")
  );
}

/** Every path component is checked so a symlinked ancestor cannot bypass leaf lstat. */
export function readVerifiedRepoFile(
  repoRoot: string,
  repoPath: string,
): { bytes: Buffer; digest: Digest } {
  const root = realpathSync(repoRoot);
  if (!canonicalLexical(repoPath)) throw new Error(`non-canonical repo path: ${repoPath}`);
  const absolute = resolve(root, repoPath);
  const rel = relative(root, absolute);
  if (rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel))
    throw new Error("path outside repository");
  let cursor = root;
  for (const part of repoPath.split("/")) {
    cursor = resolve(cursor, part);
    const stat = lstatSync(cursor);
    if (stat.isSymbolicLink()) throw new Error(`symlink ancestry rejected: ${repoPath}`);
  }
  const stat = lstatSync(absolute);
  if (!stat.isFile() || realpathSync(absolute) !== absolute)
    throw new Error(`regular canonical file required: ${repoPath}`);
  const bytes = readFileSync(absolute);
  return { bytes, digest: sha256(bytes) };
}

const allowlistSchema = z
  .object({
    schema_version: z.literal("closure-gate-allowlist.v1"),
    gates: z.record(
      z.string().regex(/^[a-z][a-z0-9-]*$/),
      z
        .object({ command_id: z.string().regex(/^[a-z][a-z0-9-]*$/), command: z.string().min(1) })
        .strict(),
    ),
  })
  .strict();

export function loadRepoOwnedGateAllowlist(input: {
  repoRoot: string;
  path: string;
  repositoryHead: string;
}): ClosureAuthorityBackfillInput["gate_allowlist"] {
  if (input.path !== CLOSURE_GATE_ALLOWLIST_PATH)
    throw new Error(`gate allowlist path must be ${CLOSURE_GATE_ALLOWLIST_PATH}`);
  const source = readVerifiedRepoFile(input.repoRoot, input.path);
  const parsed = allowlistSchema.parse(parseYaml(source.bytes.toString("utf8")));
  return {
    source_path: input.path,
    source_digest: source.digest,
    repository_head: input.repositoryHead,
    entries: parsed.gates,
  };
}

const receiptSchema = z
  .object({
    schema_version: z.literal("closure-process-receipt.v1"),
    repository_head: z.string().regex(/^[0-9a-f]{40}$/),
    kind: z.literal("test"),
    executable: z.literal("bunx"),
    argv: z.array(z.string()),
    stdout_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    completed_at: z.string().datetime(),
  })
  .strict();
const vitestSchema = z
  .object({
    testResults: z.array(
      z
        .object({
          assertionResults: z.array(
            z.object({ fullName: z.string(), status: z.string() }).passthrough(),
          ),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export function loadCollectedVitestTests(input: {
  repoRoot: string;
  testPath: string;
  stdoutPath: string;
  receipt: unknown;
  repositoryHead: string;
}): CollectedBackfillTest[] {
  const test = readVerifiedRepoFile(input.repoRoot, input.testPath);
  const stdout = readVerifiedRepoFile(input.repoRoot, input.stdoutPath);
  const receipt = receiptSchema.parse(input.receipt);
  if (receipt.repository_head !== input.repositoryHead)
    throw new Error("Vitest receipt HEAD drift");
  if (receipt.stdout_digest !== stdout.digest) throw new Error("Vitest stdout digest drift");
  if (receipt.argv.join("\0") !== ["vitest", "run", input.testPath, "--reporter=json"].join("\0"))
    throw new Error("Vitest receipt argv mismatch");
  const report = vitestSchema.parse(JSON.parse(stdout.bytes.toString("utf8")));
  return report.testResults.flatMap((suite) =>
    suite.assertionResults.map((row) => ({
      test_path: input.testPath,
      full_name: row.fullName,
      status:
        row.status === "passed"
          ? ("passed" as const)
          : row.status === "failed"
            ? ("failed" as const)
            : row.status === "skipped"
              ? ("skipped" as const)
              : ("todo" as const),
      source_digest: test.digest,
      canonical_realpath: true,
      symlink: false,
      receipt: { ...receipt, stdout_digest: receipt.stdout_digest as Digest },
    })),
  );
}
