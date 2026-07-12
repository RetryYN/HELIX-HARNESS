import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  truncateSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import type {
  ClosureAuthority,
  ClosureAuthorityClassificationRow,
} from "../policy/closure-authority-registry";
import {
  analyzeClosureAuthorityDrift,
  type ClosureAuthorityRegistry,
  classifyClosureAuthorities,
} from "../policy/closure-authority-registry";
import { verifyRunnerAttestationChain } from "./closure-auto-approval";
import {
  type ClosureEvidenceRunner,
  type ClosureProcessReceipt,
  closureCommandDedupeKey,
  type TypedClosureCommand,
} from "./closure-evidence-runner";
import {
  acquireClosureMaterializationLock,
  releaseClosureMaterializationLock,
} from "./closure-materialization-lock";
import type { HarnessDb } from "./index";

type CrashPoint =
  | "before-db"
  | "after-files-before-commit"
  | "after-db-before-manifest"
  | "after-manifest";
export interface ClosureMaterializationCandidate {
  plan_id: string;
  source_path: string;
}
export interface ClosureEvidenceMaterializationInput {
  repoRoot: string;
  db: HarnessDb;
  repositoryHead: string;
  originMainHead: string;
  clean: boolean;
  candidates: readonly ClosureMaterializationCandidate[];
  reviewBundlePlanIds: readonly string[];
  registry: ClosureAuthorityRegistry;
  runner: ClosureEvidenceRunner;
  gateCommands: Readonly<Record<string, string>>;
  now?: () => string;
  id?: () => string;
  windowSize?: number;
  concurrency?: number;
  crashAt?: CrashPoint;
}
export interface ClosureEvidenceMaterializationResult {
  status: "published" | "classified";
  materialization_id: string | null;
  classifications: readonly ClosureAuthorityClassificationRow[];
  manifest_path: string | null;
  run_count: number;
}
interface Run {
  runId: string;
  planId: string;
  kind: "test" | "gate";
  oracleId: string;
  gateId: string;
  receipt: ClosureProcessReceipt;
  outputPath: string;
  stagedOutput: string;
  completedAt: string;
}
interface Journal {
  schema_version: "closure-materialization-journal.v2";
  state: "prepared" | "complete";
  materialization_id: string;
  jsonl_path: string;
  jsonl_size: number;
  manifest_path: string;
  staged_manifest: string;
  manifest_digest: string;
  files: Array<{
    staged: string;
    final: string;
    digest: string;
    before?: { path: string; digest: string };
  }>;
  journal_digest: string;
}
const sha256 = (v: string | Buffer): `sha256:${string}` =>
  `sha256:${createHash("sha256").update(v).digest("hex")}`;
const receiptCommand = (receipt: ClosureProcessReceipt): string =>
  [receipt.executable, ...receipt.argv].join(" ");
function canonicalRelative(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    path.split("/").every((part) => part !== "" && part !== "." && part !== "..")
  );
}
function sealJournal(journal: Omit<Journal, "journal_digest">): Journal {
  return { ...journal, journal_digest: sha256(JSON.stringify(journal)) };
}
function readJournal(path: string): Journal {
  if (lstatSync(path).isSymbolicLink()) throw new Error("materialization journal symlinkは禁止");
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Journal;
  const { journal_digest, ...payload } = parsed;
  if (
    parsed.schema_version !== "closure-materialization-journal.v2" ||
    !/^[A-Za-z0-9._-]{8,128}$/.test(parsed.materialization_id) ||
    !Number.isSafeInteger(parsed.jsonl_size) ||
    parsed.jsonl_size < 0 ||
    parsed.jsonl_path !== ".helix/evidence/runner-attestations.jsonl" ||
    !canonicalRelative(parsed.manifest_path) ||
    !canonicalRelative(parsed.staged_manifest) ||
    !Array.isArray(parsed.files) ||
    parsed.files.some(
      (file) =>
        !canonicalRelative(file.staged) ||
        !canonicalRelative(file.final) ||
        !/^sha256:[0-9a-f]{64}$/.test(file.digest) ||
        (file.before !== undefined &&
          (!canonicalRelative(file.before.path) ||
            !/^sha256:[0-9a-f]{64}$/.test(file.before.digest))),
    ) ||
    journal_digest !== sha256(JSON.stringify(payload))
  )
    throw new Error("materialization journal schema/digest不正");
  const stagePrefix = `.helix/tmp/closure-materialization/${parsed.materialization_id}/`;
  if (
    !parsed.manifest_path.startsWith(".helix/evidence/closure-auto-approval-manifest-") ||
    !parsed.staged_manifest.startsWith(stagePrefix) ||
    parsed.files.some(
      (file) =>
        !file.staged.startsWith(stagePrefix) ||
        (file.before !== undefined && !file.before.path.startsWith(stagePrefix)) ||
        (!file.final.startsWith(".helix/evidence/outputs/") &&
          !file.final.startsWith(".helix/evidence/closure-runs/") &&
          !file.final.startsWith(".helix/evidence/process-receipts/")),
    )
  )
    throw new Error("materialization journal path境界不正");
  return parsed;
}
function durable(path: string, bytes: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, "w", 0o600);
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}
function fsyncDirectory(path: string): void {
  const fd = openSync(path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}
function fsyncFile(path: string): void {
  const fd = openSync(path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}
function durableAtomic(path: string, bytes: string): void {
  const temp = `${path}.tmp-${randomUUID()}`;
  durable(temp, bytes);
  renameSync(temp, path);
  fsyncDirectory(dirname(path));
}
function canonicalRegular(root: string, path: string): void {
  const absolute = resolve(root, path);
  if (relative(root, absolute).startsWith(".."))
    throw new Error(`path outside repository: ${path}`);
  const stat = lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error(`canonical regular file required: ${path}`);
}
function ensureSchema(db: HarnessDb): void {
  for (const table of [
    "test_runs",
    "test_cases",
    "gate_runs",
    "runner_attestations",
    "closure_materializations",
  ])
    if (!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table))
      throw new Error(`persistent schema missing: ${table}`);
}
function preflight(input: ClosureEvidenceMaterializationInput): {
  authorities: ClosureAuthority[];
  classifications: ClosureAuthorityClassificationRow[];
} {
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: input.repoRoot, encoding: "utf8" }).trim();
  const actualHead = git("rev-parse", "HEAD");
  const actualOriginMain = git("rev-parse", "origin/main");
  const actualClean = git("status", "--porcelain=v1", "--untracked-files=normal") === "";
  if (
    !/^[0-9a-f]{40}$/.test(input.repositoryHead) ||
    input.repositoryHead !== input.originMainHead ||
    input.repositoryHead !== actualHead ||
    input.originMainHead !== actualOriginMain
  )
    throw new Error("current HEAD must equal origin/main");
  if (!input.clean || !actualClean) throw new Error("working tree must be clean");
  const ids = input.candidates.map((v) => v.plan_id);
  if (ids.length === 0 || new Set(ids).size !== ids.length)
    throw new Error("candidate scope must be non-empty and unique");
  if (JSON.stringify(ids) !== JSON.stringify(input.reviewBundlePlanIds))
    throw new Error("review-bundle scope/order mismatch");
  const classifications = classifyClosureAuthorities({
    candidatePlanIds: ids,
    registry: input.registry,
    drifts: analyzeClosureAuthorityDrift({
      repositoryRoot: input.repoRoot,
      registry: input.registry,
    }),
  });
  const rows = new Map(classifications.map((v) => [v.plan_id, v]));
  const authorities = input.candidates.flatMap((candidate) => {
    canonicalRegular(input.repoRoot, candidate.source_path);
    const row = rows.get(candidate.plan_id);
    if (!row) throw new Error(`classification missing: ${candidate.plan_id}`);
    if (row.classification !== "eligible") return [];
    if (!row.authority || row.authority.source_path !== candidate.source_path)
      throw new Error(`strict authority mismatch: ${candidate.plan_id}`);
    return [row.authority];
  });
  return { authorities, classifications };
}
function moveIfNeeded(
  repoRoot: string,
  file: { staged: string; final: string; digest: string },
): void {
  const final = join(repoRoot, file.final);
  const staged = join(repoRoot, file.staged);
  if (existsSync(final)) {
    if (sha256(readFileSync(final)) === file.digest) return;
  }
  if (!existsSync(staged) || sha256(readFileSync(staged)) !== file.digest)
    throw new Error(`staged file unavailable: ${file.staged}`);
  mkdirSync(dirname(final), { recursive: true });
  renameSync(staged, final);
  fsyncDirectory(dirname(final));
}
/** committed marker is authoritative: committed work is finalized, uncommitted work is compensated. */
export function recoverClosureEvidenceMaterialization(repoRoot: string, db: HarnessDb): void {
  const journalPath = join(repoRoot, ".helix/evidence/closure-materialization-journal.json");
  if (!existsSync(journalPath)) return;
  const journal = readJournal(journalPath);
  if (journal.state === "complete") return;
  const committed = db
    .prepare(
      "SELECT materialization_id FROM closure_materializations WHERE materialization_id=? AND status='committed'",
    )
    .get(journal.materialization_id);
  if (committed) {
    for (const file of journal.files) {
      moveIfNeeded(repoRoot, file);
      if (file.before) rmSync(join(repoRoot, file.before.path), { force: true });
    }
    moveIfNeeded(repoRoot, {
      staged: journal.staged_manifest,
      final: journal.manifest_path,
      digest: journal.manifest_digest,
    });
    const { journal_digest: _digest, ...journalPayload } = journal;
    durableAtomic(
      journalPath,
      JSON.stringify(sealJournal({ ...journalPayload, state: "complete" })),
    );
    rmSync(join(repoRoot, dirname(journal.staged_manifest)), { recursive: true, force: true });
    return;
  }
  const jsonl = join(repoRoot, journal.jsonl_path);
  if (existsSync(jsonl)) {
    truncateSync(jsonl, journal.jsonl_size);
    fsyncFile(jsonl);
  }
  for (const file of journal.files) {
    if (file.before) {
      const before = join(repoRoot, file.before.path);
      if (!existsSync(before) || sha256(readFileSync(before)) !== file.before.digest)
        throw new Error(`before image unavailable: ${file.final}`);
      mkdirSync(dirname(join(repoRoot, file.final)), { recursive: true });
      copyFileSync(before, join(repoRoot, file.final));
      fsyncFile(join(repoRoot, file.final));
      fsyncDirectory(dirname(join(repoRoot, file.final)));
    } else {
      rmSync(join(repoRoot, file.final), { force: true });
      const finalDir = dirname(join(repoRoot, file.final));
      if (existsSync(finalDir)) fsyncDirectory(finalDir);
    }
    rmSync(join(repoRoot, file.staged), { force: true });
    if (file.before) rmSync(join(repoRoot, file.before.path), { force: true });
  }
  rmSync(join(repoRoot, journal.staged_manifest), { force: true });
  rmSync(journalPath, { force: true });
}
async function materializeClosureEvidenceUnlocked(
  input: ClosureEvidenceMaterializationInput,
): Promise<ClosureEvidenceMaterializationResult> {
  recoverClosureEvidenceMaterialization(input.repoRoot, input.db);
  ensureSchema(input.db);
  const { authorities, classifications } = preflight(input);
  if (authorities.length !== input.candidates.length)
    return {
      status: "classified",
      materialization_id: null,
      classifications,
      manifest_path: null,
      run_count: 0,
    };
  const windowSize = input.windowSize ?? 100;
  const concurrency = input.concurrency ?? 1;
  if (!Number.isInteger(windowSize) || windowSize < 1 || windowSize > 100)
    throw new Error("windowSize must be 1..100");
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 4)
    throw new Error("concurrency must be 1..4");
  const id = input.id?.() ?? randomUUID();
  const completedAt = input.now?.() ?? new Date().toISOString();
  const stageRel = `.helix/tmp/closure-materialization/${id}`;
  const stageRoot = join(input.repoRoot, stageRel);
  mkdirSync(stageRoot, { recursive: true });
  const runs: Run[] = [];
  const receiptCache = new Map<string, ClosureProcessReceipt>();
  try {
    for (let offset = 0; offset < authorities.length; offset += windowSize) {
      const planned: Array<
        | {
            kind: "test";
            authority: ClosureAuthority;
            oracleIds: string[];
            command: TypedClosureCommand;
          }
        | {
            kind: "gate";
            authority: ClosureAuthority;
            gateId: string;
            command: TypedClosureCommand;
          }
      > = [];
      for (const authority of authorities.slice(offset, offset + windowSize)) {
        const grouped = new Map<string, string[]>();
        for (const binding of authority.bindings)
          grouped.set(binding.test_path, [
            ...(grouped.get(binding.test_path) ?? []),
            binding.oracle_id,
          ]);
        for (const [testPath, oracleIds] of grouped)
          planned.push({
            kind: "test",
            authority,
            oracleIds,
            command: input.runner.prepareTestCommand({ testPath, oracleIds }),
          });
        for (const gate of authority.gates) {
          const declaredCommand = input.gateCommands[gate.command_id];
          if (!declaredCommand || declaredCommand !== gate.command)
            throw new Error(`gate command authority missing: ${gate.command_id}`);
          planned.push({
            kind: "gate",
            authority,
            gateId: gate.gate_id,
            command: input.runner.prepareGateCommand({
              gateId: gate.gate_id,
              declaredCommand,
            }),
          });
        }
      }
      for (const item of planned) {
        const key = closureCommandDedupeKey(input.repositoryHead, item.command);
        if (receiptCache.has(key)) continue;
        const stored = input.db
          .prepare("SELECT * FROM closure_process_receipts WHERE process_receipt_key=?")
          .get(key);
        if (!stored) continue;
        const stdoutPath = String(stored.stdout_path ?? "");
        const stderrPath = String(stored.stderr_path ?? "");
        canonicalRegular(input.repoRoot, stdoutPath);
        canonicalRegular(input.repoRoot, stderrPath);
        const stdout = readFileSync(join(input.repoRoot, stdoutPath), "utf8");
        const stderr = readFileSync(join(input.repoRoot, stderrPath), "utf8");
        const argv = JSON.parse(String(stored.argv_json ?? ""));
        if (
          stored.schema_version !== "closure-process-receipt.v1" ||
          stored.repository_head !== input.repositoryHead ||
          stored.kind !== item.command.kind ||
          stored.executable !== item.command.executable ||
          !Array.isArray(argv) ||
          JSON.stringify(argv) !== JSON.stringify(item.command.argv) ||
          Number(stored.exit_code) !== 0 ||
          stored.signal !== null ||
          Number(stored.timed_out) !== 0 ||
          stored.stdout_digest !== sha256(stdout) ||
          stored.stderr_digest !== sha256(stderr)
        )
          throw new Error(`persistent physical process receipt不一致: ${key}`);
        receiptCache.set(key, {
          schema_version: "closure-process-receipt.v1",
          kind: item.command.kind,
          repository_head: input.repositoryHead,
          executable: item.command.executable,
          argv: [...item.command.argv],
          dedupe_key: key,
          exit_code: 0,
          signal: null,
          timed_out: false,
          stdout,
          stderr,
          stdout_digest: sha256(stdout),
          stderr_digest: sha256(stderr),
          completed_at: String(stored.completed_at ?? ""),
        });
      }
      const missing = planned
        .map((item) => item.command)
        .filter(
          (command) => !receiptCache.has(closureCommandDedupeKey(input.repositoryHead, command)),
        );
      const executed = await input.runner.runTypedCommands(missing, { concurrency });
      for (const receipt of executed) receiptCache.set(receipt.dedupe_key, receipt);
      for (const item of planned) {
        const receipt = receiptCache.get(
          closureCommandDedupeKey(input.repositoryHead, item.command),
        );
        if (!receipt) throw new Error("bounded runner receipt missing");
        if (item.kind === "test") {
          for (const proof of input.runner.proveTestReceipt(receipt, item.oracleIds)) {
            const runId = `test-run:${sha256(JSON.stringify([id, item.authority.plan_id, proof.oracle_id])).slice(7, 55)}`;
            const stagedOutput = join(stageRoot, `${runId.replace(":", "-")}.txt`);
            durable(stagedOutput, receipt.stdout);
            runs.push({
              runId,
              planId: item.authority.plan_id,
              kind: "test",
              oracleId: proof.oracle_id,
              gateId: "",
              receipt,
              outputPath: `.helix/evidence/outputs/${id}-${runId.replace(":", "-")}.txt`,
              stagedOutput,
              completedAt: receipt.completed_at,
            });
          }
        } else {
          const runId = `gate-run:${sha256(JSON.stringify([id, item.authority.plan_id, item.gateId])).slice(7, 55)}`;
          const stagedOutput = join(stageRoot, `${runId.replace(":", "-")}.txt`);
          durable(stagedOutput, receipt.stdout);
          runs.push({
            runId,
            planId: item.authority.plan_id,
            kind: "gate",
            oracleId: item.gateId,
            gateId: item.gateId,
            receipt,
            outputPath: `.helix/evidence/outputs/${id}-${runId.replace(":", "-")}.txt`,
            stagedOutput,
            completedAt: receipt.completed_at,
          });
        }
      }
    }
    const postRun = preflight(input);
    if (
      JSON.stringify(
        postRun.authorities.map((authority) => [authority.plan_id, authority.source_digest]),
      ) !==
      JSON.stringify(authorities.map((authority) => [authority.plan_id, authority.source_digest]))
    )
      throw new Error("publish直前authority CAS不一致");
    const publishedAt = input.now?.() ?? new Date().toISOString();
    const files: Journal["files"] = runs.map((run) => ({
      staged: relative(input.repoRoot, run.stagedOutput),
      final: run.outputPath,
      digest: sha256(readFileSync(run.stagedOutput)),
    }));
    const processReceipts = [...receiptCache.values()].sort((a, b) =>
      a.dedupe_key.localeCompare(b.dedupe_key),
    );
    for (const receipt of processReceipts) {
      const basename = receipt.dedupe_key.slice(7);
      for (const [stream, bytes] of [
        ["stdout", receipt.stdout],
        ["stderr", receipt.stderr],
      ] as const) {
        const staged = `${stageRel}/process-receipts/${basename}.${stream}`;
        const final = `.helix/evidence/process-receipts/${basename}.${stream}`;
        durable(join(input.repoRoot, staged), bytes);
        files.push({ staged, final, digest: sha256(bytes) });
      }
    }
    for (const authority of authorities) {
      const planRuns = runs
        .filter((run) => run.planId === authority.plan_id)
        .map((run) => ({
          run_id: run.runId,
          kind: run.kind,
          oracle_id: run.oracleId,
          command: receiptCommand(run.receipt),
          exit_code: 0,
          output_path: run.outputPath,
          output_digest: sha256(readFileSync(run.stagedOutput)),
          process_receipt_key: run.receipt.dedupe_key,
          completed_at: run.completedAt,
        }));
      const staged = `${stageRel}/${authority.plan_id}.json`;
      const final = `.helix/evidence/closure-runs/${authority.plan_id}.json`;
      durable(
        join(input.repoRoot, staged),
        JSON.stringify({
          schema_version: "closure-run-record.v1",
          plan_id: authority.plan_id,
          repository_head: input.repositoryHead,
          runs: planRuns,
        }),
      );
      files.push({ staged, final, digest: sha256(readFileSync(join(input.repoRoot, staged))) });
    }
    for (const file of files) {
      const final = join(input.repoRoot, file.final);
      if (!existsSync(final)) continue;
      canonicalRegular(input.repoRoot, file.final);
      const beforePath = `${stageRel}/before/${sha256(file.final).slice(7)}.bak`;
      mkdirSync(dirname(join(input.repoRoot, beforePath)), { recursive: true });
      copyFileSync(final, join(input.repoRoot, beforePath));
      file.before = {
        path: beforePath,
        digest: sha256(readFileSync(join(input.repoRoot, beforePath))),
      };
    }
    const manifestPath = `.helix/evidence/closure-auto-approval-manifest-${id}.json`;
    const stagedManifest = `${stageRel}/manifest.json`;
    durable(
      join(input.repoRoot, stagedManifest),
      JSON.stringify({
        schema_version: "closure-auto-approval-manifest.v1",
        repository_head: input.repositoryHead,
        generated_at: publishedAt,
        expires_at: new Date(Date.parse(publishedAt) + 3_600_000).toISOString(),
        candidates: authorities.map((v) => ({
          plan_id: v.plan_id,
          source_path: v.source_path,
          source_digest: v.source_digest,
        })),
      }),
    );
    const jsonlRel = ".helix/evidence/runner-attestations.jsonl";
    const jsonlPath = join(input.repoRoot, jsonlRel);
    verifyRunnerAttestationChain(input.repoRoot, input.db);
    const jsonlSize = existsSync(jsonlPath) ? readFileSync(jsonlPath).byteLength : 0;
    const journalPath = join(
      input.repoRoot,
      ".helix/evidence/closure-materialization-journal.json",
    );
    const journal = sealJournal({
      schema_version: "closure-materialization-journal.v2",
      state: "prepared",
      materialization_id: id,
      jsonl_path: jsonlRel,
      jsonl_size: jsonlSize,
      manifest_path: manifestPath,
      staged_manifest: stagedManifest,
      manifest_digest: sha256(readFileSync(join(input.repoRoot, stagedManifest))),
      files,
    });
    durableAtomic(journalPath, JSON.stringify(journal));
    if (input.crashAt === "before-db") throw new Error("injected crash before-db");
    let previous =
      existsSync(jsonlPath) && jsonlSize
        ? String(
            JSON.parse(readFileSync(jsonlPath, "utf8").trim().split("\n").at(-1) ?? "{}")
              .event_digest ?? "",
          ) || null
        : null;
    const events = runs.map((run) => {
      const payload = {
        schema_version: "runner-attestation.v1",
        previous_digest: previous,
        run_id: run.runId,
        session_id: id,
        plan_id: run.planId,
        kind: run.kind,
        oracle_id: run.oracleId,
        repository_head: input.repositoryHead,
        command: receiptCommand(run.receipt),
        exit_code: 0,
        status: "passed",
        evidence_path: run.outputPath,
        output_digest: sha256(readFileSync(run.stagedOutput)),
        process_receipt_key: run.receipt.dedupe_key,
        completed_at: run.completedAt,
      };
      const event_digest = sha256(JSON.stringify(payload));
      previous = event_digest;
      return { ...payload, event_digest, signature: event_digest };
    });
    input.db.exec("BEGIN IMMEDIATE");
    try {
      for (const receipt of processReceipts) {
        const basename = receipt.dedupe_key.slice(7);
        input.db
          .prepare(
            `INSERT OR IGNORE INTO closure_process_receipts
             (process_receipt_key,schema_version,materialization_id,kind,repository_head,
              executable,argv_json,dedupe_key,exit_code,signal,timed_out,stdout_digest,
              stderr_digest,stdout_path,stderr_path,completed_at)
             VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          )
          .run(
            receipt.dedupe_key,
            receipt.schema_version,
            id,
            receipt.kind,
            receipt.repository_head,
            receipt.executable,
            JSON.stringify(receipt.argv),
            receipt.dedupe_key,
            receipt.exit_code,
            receipt.signal,
            receipt.timed_out ? 1 : 0,
            receipt.stdout_digest,
            receipt.stderr_digest,
            `.helix/evidence/process-receipts/${basename}.stdout`,
            `.helix/evidence/process-receipts/${basename}.stderr`,
            receipt.completed_at,
          );
        const stored = input.db
          .prepare(
            "SELECT repository_head,kind,executable,argv_json,exit_code,stdout_digest,stderr_digest FROM closure_process_receipts WHERE process_receipt_key=?",
          )
          .get(receipt.dedupe_key);
        if (
          !stored ||
          stored.repository_head !== receipt.repository_head ||
          stored.kind !== receipt.kind ||
          stored.executable !== receipt.executable ||
          stored.argv_json !== JSON.stringify(receipt.argv) ||
          Number(stored.exit_code) !== receipt.exit_code ||
          stored.stdout_digest !== receipt.stdout_digest ||
          stored.stderr_digest !== receipt.stderr_digest
        )
          throw new Error(`physical process receipt immutable mismatch: ${receipt.dedupe_key}`);
      }
      for (const [index, run] of runs.entries()) {
        const event = events[index];
        if (!event) throw new Error("receipt join missing");
        if (run.kind === "test") {
          input.db
            .prepare(
              "INSERT INTO test_runs(test_run_id,session_id,plan_id,command,started_at,completed_at,exit_code,evidence_path,output_digest,status,process_receipt_key) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            )
            .run(
              run.runId,
              id,
              run.planId,
              event.command,
              completedAt,
              run.completedAt,
              0,
              run.outputPath,
              event.output_digest,
              "passed",
              run.receipt.dedupe_key,
            );
          input.db
            .prepare(
              "INSERT INTO test_cases(test_case_id,test_run_id,plan_id,oracle_id,status,evidence_path) VALUES(?,?,?,?,?,?)",
            )
            .run(
              sha256(`${run.runId}:${run.oracleId}`),
              run.runId,
              run.planId,
              run.oracleId,
              "passed",
              run.outputPath,
            );
        } else
          input.db
            .prepare(
              "INSERT INTO gate_runs(gate_run_id,gate_id,plan_id,status,checked_at,evidence_path,session_id,command,exit_code,output_digest,materialization_id,process_receipt_key) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            )
            .run(
              run.runId,
              run.gateId,
              run.planId,
              "passed",
              run.completedAt,
              run.outputPath,
              id,
              event.command,
              0,
              event.output_digest,
              id,
              run.receipt.dedupe_key,
            );
        input.db
          .prepare(
            "INSERT INTO runner_attestations(event_digest,previous_digest,run_id,session_id,plan_id,kind,oracle_id,repository_head,command,exit_code,status,evidence_path,output_digest,completed_at,signature,process_receipt_key) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          )
          .run(
            event.event_digest,
            event.previous_digest,
            event.run_id,
            event.session_id,
            event.plan_id,
            event.kind,
            event.oracle_id,
            event.repository_head,
            event.command,
            event.exit_code,
            event.status,
            event.evidence_path,
            event.output_digest,
            event.completed_at,
            event.signature,
            run.receipt.dedupe_key,
          );
      }
      mkdirSync(dirname(jsonlPath), { recursive: true });
      const jsonlFd = openSync(jsonlPath, "a", 0o600);
      try {
        appendFileSync(jsonlFd, `${events.map((v) => JSON.stringify(v)).join("\n")}\n`);
        fsyncSync(jsonlFd);
      } finally {
        closeSync(jsonlFd);
      }
      for (const file of files) moveIfNeeded(input.repoRoot, file);
      if (input.crashAt === "after-files-before-commit")
        throw new Error("injected crash after-files-before-commit");
      input.db
        .prepare(
          "INSERT INTO closure_materializations(materialization_id,repository_head,status,journal_path,manifest_path,committed_at) VALUES(?,?,?,?,?,?)",
        )
        .run(
          id,
          input.repositoryHead,
          "committed",
          relative(input.repoRoot, journalPath),
          manifestPath,
          publishedAt,
        );
      input.db.exec("COMMIT");
    } catch (error) {
      input.db.exec("ROLLBACK");
      throw error;
    }
    if (input.crashAt === "after-db-before-manifest")
      throw new Error("injected crash after-db-before-manifest");
    moveIfNeeded(input.repoRoot, {
      staged: stagedManifest,
      final: manifestPath,
      digest: journal.manifest_digest,
    });
    const { journal_digest: _digest, ...journalPayload } = journal;
    durableAtomic(
      journalPath,
      JSON.stringify(sealJournal({ ...journalPayload, state: "complete" })),
    );
    if (input.crashAt === "after-manifest") throw new Error("injected crash after-manifest");
    rmSync(stageRoot, { recursive: true, force: true });
    return {
      status: "published",
      materialization_id: id,
      classifications,
      manifest_path: manifestPath,
      run_count: runs.length,
    };
  } catch (error) {
    try {
      input.db.exec("ROLLBACK");
    } catch {
      // Best effort only: the outer recovery path owns the durable rollback decision.
    }
    recoverClosureEvidenceMaterialization(input.repoRoot, input.db);
    throw error;
  }
}

export async function materializeClosureEvidence(
  input: ClosureEvidenceMaterializationInput,
): Promise<ClosureEvidenceMaterializationResult> {
  const lock = acquireClosureMaterializationLock(input.repoRoot);
  try {
    return await materializeClosureEvidenceUnlocked(input);
  } finally {
    releaseClosureMaterializationLock(lock);
  }
}
