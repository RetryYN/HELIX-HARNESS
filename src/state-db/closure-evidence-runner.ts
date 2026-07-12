import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { z } from "zod";

export type ClosureEvidenceRunKind = "test" | "gate";

export interface TypedClosureCommand {
  kind: ClosureEvidenceRunKind;
  executable: string;
  argv: readonly string[];
}

export interface ClosureSubprocessOutput {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export interface ClosureProcessReceipt {
  schema_version: "closure-process-receipt.v1";
  kind: ClosureEvidenceRunKind;
  repository_head: string;
  executable: string;
  argv: string[];
  dedupe_key: `sha256:${string}`;
  exit_code: number;
  signal: null;
  timed_out: false;
  stdout: string;
  stderr: string;
  stdout_digest: `sha256:${string}`;
  stderr_digest: `sha256:${string}`;
  completed_at: string;
}

export interface ClosureOracleProof {
  oracle_id: string;
  collected: true;
  executed: true;
  passed: true;
  full_name: string;
}

export interface ClosureTestRunResult {
  receipt: ClosureProcessReceipt;
  proofs: ClosureOracleProof[];
}

export type ClosureSpawn = (input: {
  executable: string;
  argv: readonly string[];
  cwd: string;
  timeoutMs: number;
  maxOutputBytes: number;
}) => ClosureSubprocessOutput;

export interface ClosureGateDefinition {
  gateId: string;
  declaredCommand: string;
}

export interface ClosureGateAllowlistEntry {
  command: string;
  executable: string;
  argv: readonly string[];
}

const sha256 = (value: string): `sha256:${string}` =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;

const HEAD = /^[0-9a-f]{40}$/;
const ORACLE = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
const TEST_PATH = /^tests\/[A-Za-z0-9][A-Za-z0-9._/-]*\.test\.(?:ts|tsx)$/;
const GATE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

const vitestJsonSchema = z
  .object({
    success: z.boolean(),
    testResults: z.array(
      z
        .object({
          name: z.string(),
          assertionResults: z.array(
            z
              .object({
                fullName: z.string(),
                title: z.string(),
                status: z.string(),
              })
              .passthrough(),
          ),
        })
        .passthrough(),
    ),
  })
  .passthrough();

function defaultSpawn(input: Parameters<ClosureSpawn>[0]): ClosureSubprocessOutput {
  const result = spawnSync(input.executable, [...input.argv], {
    cwd: input.cwd,
    encoding: "utf8",
    timeout: input.timeoutMs,
    maxBuffer: input.maxOutputBytes,
    shell: false,
    windowsHide: true,
  });
  return {
    exitCode: result.status,
    signal: result.signal,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    timedOut: (result.error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT",
  };
}

function validateHead(head: string): void {
  if (!HEAD.test(head)) throw new Error("repository HEAD must be a 40 character lowercase SHA");
}

function canonicalTestPath(repoRoot: string, testPath: string): string {
  if (
    !TEST_PATH.test(testPath) ||
    isAbsolute(testPath) ||
    testPath.includes("..") ||
    testPath.includes("\\") ||
    testPath.includes("//")
  )
    throw new Error(`non-canonical test path: ${testPath}`);
  const absolute = resolve(repoRoot, testPath);
  const rel = relative(repoRoot, absolute);
  if (rel.startsWith("..") || isAbsolute(rel))
    throw new Error(`test path escapes repository: ${testPath}`);
  if (!existsSync(absolute)) throw new Error(`test path is not a regular file: ${testPath}`);
  if (lstatSync(absolute).isSymbolicLink() || realpathSync(absolute) !== absolute)
    throw new Error(`test path must not traverse a symlink: ${testPath}`);
  if (!lstatSync(absolute).isFile())
    throw new Error(`test path is not a regular file: ${testPath}`);
  return testPath;
}

export function closureCommandDedupeKey(
  repositoryHead: string,
  command: Pick<TypedClosureCommand, "executable" | "argv">,
): `sha256:${string}` {
  validateHead(repositoryHead);
  return sha256(JSON.stringify([repositoryHead, command.executable, ...command.argv]));
}

function executeTypedCommand(input: {
  repoRoot: string;
  repositoryHead: string;
  command: TypedClosureCommand;
  spawn: ClosureSpawn;
  timeoutMs: number;
  maxOutputBytes: number;
  now: () => string;
}): ClosureProcessReceipt {
  const output = input.spawn({
    executable: input.command.executable,
    argv: input.command.argv,
    cwd: input.repoRoot,
    timeoutMs: input.timeoutMs,
    maxOutputBytes: input.maxOutputBytes,
  });
  if (output.timedOut) throw new Error(`${input.command.kind} subprocess timed out`);
  if (output.signal !== null)
    throw new Error(`${input.command.kind} subprocess received signal ${output.signal}`);
  if (output.exitCode === null)
    throw new Error(`${input.command.kind} subprocess has no exit code`);
  if (output.exitCode !== 0)
    throw new Error(`${input.command.kind} subprocess exited ${output.exitCode}`);
  if (output.stdout.length === 0)
    throw new Error(`${input.command.kind} subprocess produced no stdout`);
  return {
    schema_version: "closure-process-receipt.v1",
    kind: input.command.kind,
    repository_head: input.repositoryHead,
    executable: input.command.executable,
    argv: [...input.command.argv],
    dedupe_key: closureCommandDedupeKey(input.repositoryHead, input.command),
    exit_code: 0,
    signal: null,
    timed_out: false,
    stdout: output.stdout,
    stderr: output.stderr,
    stdout_digest: sha256(output.stdout),
    stderr_digest: sha256(output.stderr),
    completed_at: input.now(),
  };
}

function oracleTokenMatches(value: string, oracleId: string): boolean {
  return value.split(/[^A-Za-z0-9-]+/).includes(oracleId);
}

export class ClosureEvidenceRunner {
  readonly #repoRoot: string;
  readonly #repositoryHead: string;
  readonly #spawn: ClosureSpawn;
  readonly #timeoutMs: number;
  readonly #maxOutputBytes: number;
  readonly #gateAllowlist: Readonly<Record<string, ClosureGateAllowlistEntry>>;
  readonly #testCache = new Map<string, ClosureProcessReceipt>();
  readonly #gateCache = new Map<string, ClosureProcessReceipt>();
  readonly #now: () => string;

  constructor(input: {
    repoRoot: string;
    repositoryHead: string;
    gateAllowlist: Readonly<Record<string, ClosureGateAllowlistEntry>>;
    spawn?: ClosureSpawn;
    timeoutMs?: number;
    maxOutputBytes?: number;
    now?: () => string;
  }) {
    validateHead(input.repositoryHead);
    this.#repoRoot = realpathSync(input.repoRoot);
    this.#repositoryHead = input.repositoryHead;
    this.#gateAllowlist = input.gateAllowlist;
    this.#spawn = input.spawn ?? defaultSpawn;
    this.#timeoutMs = input.timeoutMs ?? 120_000;
    this.#maxOutputBytes = input.maxOutputBytes ?? 16 * 1024 * 1024;
    this.#now = input.now ?? (() => new Date().toISOString());
    if (!Number.isSafeInteger(this.#timeoutMs) || this.#timeoutMs <= 0)
      throw new Error("timeoutMs must be a positive integer");
    if (!Number.isSafeInteger(this.#maxOutputBytes) || this.#maxOutputBytes <= 0)
      throw new Error("maxOutputBytes must be a positive integer");
  }

  runTest(input: { testPath: string; oracleIds: readonly string[] }): ClosureTestRunResult {
    const testPath = canonicalTestPath(this.#repoRoot, input.testPath);
    if (input.oracleIds.length === 0 || new Set(input.oracleIds).size !== input.oracleIds.length)
      throw new Error("oracle IDs must be non-empty and unique");
    for (const oracleId of input.oracleIds)
      if (!ORACLE.test(oracleId)) throw new Error(`invalid oracle ID: ${oracleId}`);

    const command: TypedClosureCommand = {
      kind: "test",
      executable: "bunx",
      argv: ["vitest", "run", testPath, "--reporter=json"],
    };
    const key = closureCommandDedupeKey(this.#repositoryHead, command);
    let receipt = this.#testCache.get(key);
    if (!receipt) {
      receipt = executeTypedCommand({
        repoRoot: this.#repoRoot,
        repositoryHead: this.#repositoryHead,
        command,
        spawn: this.#spawn,
        timeoutMs: this.#timeoutMs,
        maxOutputBytes: this.#maxOutputBytes,
        now: this.#now,
      });
      this.#testCache.set(key, receipt);
    }

    let report: z.infer<typeof vitestJsonSchema>;
    try {
      report = vitestJsonSchema.parse(JSON.parse(receipt.stdout));
    } catch (error) {
      throw new Error(
        `invalid Vitest JSON output: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (!report.success) throw new Error("Vitest JSON reports failure");
    const assertions = report.testResults.flatMap((result) => result.assertionResults);
    const proofs = input.oracleIds.map((oracleId): ClosureOracleProof => {
      const matches = assertions.filter(
        (assertion) =>
          oracleTokenMatches(assertion.fullName, oracleId) ||
          oracleTokenMatches(assertion.title, oracleId),
      );
      if (matches.length !== 1)
        throw new Error(
          `oracle ${oracleId} must be collected exactly once; found ${matches.length}`,
        );
      const match = matches[0];
      if (!match || match.status !== "passed")
        throw new Error(`oracle ${oracleId} was not executed and passed`);
      return {
        oracle_id: oracleId,
        collected: true,
        executed: true,
        passed: true,
        full_name: match.fullName,
      };
    });
    return { receipt, proofs };
  }

  runGate(input: ClosureGateDefinition): ClosureProcessReceipt {
    if (!GATE_ID.test(input.gateId)) throw new Error(`invalid gate ID: ${input.gateId}`);
    const allowed = this.#gateAllowlist[input.gateId];
    if (!allowed || allowed.command !== input.declaredCommand)
      throw new Error(`gate is not allowlisted with the declared command: ${input.gateId}`);
    if (!allowed.executable || allowed.argv.length === 0)
      throw new Error(`gate allowlist entry is invalid: ${input.gateId}`);
    const command: TypedClosureCommand = {
      kind: "gate",
      executable: allowed.executable,
      argv: [...allowed.argv],
    };
    const key = closureCommandDedupeKey(this.#repositoryHead, command);
    const cached = this.#gateCache.get(key);
    if (cached) return cached;
    const receipt = executeTypedCommand({
      repoRoot: this.#repoRoot,
      repositoryHead: this.#repositoryHead,
      command,
      spawn: this.#spawn,
      timeoutMs: this.#timeoutMs,
      maxOutputBytes: this.#maxOutputBytes,
      now: this.#now,
    });
    this.#gateCache.set(key, receipt);
    return receipt;
  }
}
