import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SHA256 = /^sha256:[a-f0-9]{64}$/;
const HEAD_SHA = /^[a-f0-9]{40}$/;
const APPROVAL_PATH = ".helix/approvals/session-handover-cutover.json";
const TERMINAL_JOURNAL_PATH = ".helix/audit/session-handover-retirement.jsonl";
const TERMINAL_JOURNAL_ENTRY_DIGEST =
  "sha256:6d98446ca84c88286d2eec59f0cdd82f5d837efbdd933185322a031554b3f3eb";

export const HANDOVER_CUTOVER_APPROVAL_PIN = {
  schemaVersion: "handover-retirement-cutover-approval.v1",
  actor: "PO",
  tool: "helix retirement cutover apply",
  target: "PLAN-L7-416:Sprint3",
  approvedHead: "d73d075479525081adf292b5ab48dfdf66dc5462",
  operationId: "handover-retirement:2026-07-11-sprint3",
  intentDigest: "sha256:4923d6233832852b31bb5a5d93e38a4fa7c9d1ae47caf01d15969ef71ca7a3f3",
  preserveDigest: "sha256:aef799ee30a2dc7ddd05ca6331075bd3f00e042ef70fc3d91eaa84b98732f760",
  archiveDigest: "sha256:15f9452e5c3f7d3cbb931a86478460046faba048e25dd8f0c4ac2188b3b36d6c",
} as const;

const RETIRED_ARTIFACTS = [
  "docs/handover/handover-mechanical-explicit.md",
  "src/handover/handover-constants.ts",
  "src/handover/handover-derivation.ts",
  "src/handover/handover-types.ts",
  "src/handover/index.ts",
  "tests/handover-completion-wording.test.ts",
  "tests/handover-db-derivation.test.ts",
  "tests/handover-derivation-wiring.test.ts",
  "tests/handover.test.ts",
] as const;

const GENERATED_SURFACES = [
  "actual",
  "fresh_setup",
  "brownfield_setup",
  "command_contract",
  "clean_distribution",
] as const;

const VERIFICATION_COMMANDS = [
  "bun run typecheck",
  "bun run lint",
  "bun run vitest run tests/handover-resurrection.test.ts tests/retirement-preserve.test.ts tests/continuation-event-first.test.ts",
  "bun run src/cli.ts doctor",
  "bun run src/cli.ts setup project --dry-run --json",
  "bun run src/cli.ts provider evidence status --json",
] as const;

export interface HandoverCutoverApprovalRecord {
  schemaVersion: "handover-retirement-cutover-approval.v1";
  decisionId: string;
  status: "approved" | "approved_applied";
  actor: "PO";
  tool: "helix retirement cutover apply";
  target: "PLAN-L7-416:Sprint3";
  paramsDigest: string;
  targetTreeDigest: string;
  approvedHead: string;
  intentDigest: string;
  preserveDigest: string;
  archiveDigest: string;
  generatedBaselineDigest: string;
  dryRunEvidenceDigest: string;
  approvedAt: string;
  expiresAt: string;
  appliedAt?: string;
  terminalJournalEntryDigest?: string;
}

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object") throw new Error("cutover approval contains non-JSON value");
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

function readGeneratedBaselineDigest(repoRoot: string): string {
  const raw = JSON.parse(
    readFileSync(join(repoRoot, "config", "handover-generated-resurrection-baseline.json"), "utf8"),
  ) as { digest?: unknown };
  if (typeof raw.digest !== "string" || !SHA256.test(raw.digest)) {
    throw new Error("handover generated baseline digest is invalid");
  }
  return raw.digest;
}

/**
 * 承認対象を再計算可能な typed dry-run snapshot にする。
 * file byte列ではなく、撤去対象の不存在と全generated projectionのfinding 0という最終意味を固定する。
 * 実repoの一致は同じdoctor runのresurrection analyzerが検証する。
 */
export function buildHandoverCutoverApprovalEvidence(repoRoot: string): {
  paramsDigest: string;
  targetTreeDigest: string;
  generatedBaselineDigest: string;
  dryRunEvidenceDigest: string;
} {
  const generatedBaselineDigest = readGeneratedBaselineDigest(repoRoot);
  const manifest = {
    schemaVersion: "handover-retirement-cutover-manifest.v1",
    operationId: HANDOVER_CUTOVER_APPROVAL_PIN.operationId,
    retiredArtifacts: [...RETIRED_ARTIFACTS],
    generatedSurfaces: [...GENERATED_SURFACES],
    verificationCommands: [...VERIFICATION_COMMANDS],
  };
  const paramsDigest = sha256(
    canonicalJson({
      manifest,
      tool: HANDOVER_CUTOVER_APPROVAL_PIN.tool,
      target: HANDOVER_CUTOVER_APPROVAL_PIN.target,
      approvedHead: HANDOVER_CUTOVER_APPROVAL_PIN.approvedHead,
      intentDigest: HANDOVER_CUTOVER_APPROVAL_PIN.intentDigest,
    }),
  );
  const targetTreeDigest = sha256(
    canonicalJson({
      schemaVersion: "handover-retirement-target-tree.v1",
      retiredArtifacts: RETIRED_ARTIFACTS.map((path) => ({
        path,
        exists: existsSync(join(repoRoot, path)),
      })),
      currentPointerExists: existsSync(join(repoRoot, ".helix", "handover", "CURRENT.json")),
      generatedSurfaces: GENERATED_SURFACES.map((surface) => ({ surface, findings: 0 })),
      preserveDigest: HANDOVER_CUTOVER_APPROVAL_PIN.preserveDigest,
      archiveDigest: HANDOVER_CUTOVER_APPROVAL_PIN.archiveDigest,
    }),
  );
  const dryRunEvidenceDigest = sha256(
    canonicalJson({
      schemaVersion: "handover-retirement-dry-run-evidence.v1",
      operationId: HANDOVER_CUTOVER_APPROVAL_PIN.operationId,
      mode: "post_complete_enforce",
      generatedBaselineDigest,
      targetTreeDigest,
      expected: { findings: 0, newFindings: 0, preconditionErrors: 0 },
      verificationCommands: [...VERIFICATION_COMMANDS],
    }),
  );
  return { paramsDigest, targetTreeDigest, generatedBaselineDigest, dryRunEvidenceDigest };
}

function validInstant(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function loadAndVerifyHandoverCutoverApproval(
  repoRoot: string,
): HandoverCutoverApprovalRecord {
  const path = join(repoRoot, APPROVAL_PATH);
  if (!existsSync(path)) throw new Error("session handover cutover approval is missing");
  const raw = JSON.parse(readFileSync(path, "utf8")) as Partial<HandoverCutoverApprovalRecord>;
  const evidence = buildHandoverCutoverApprovalEvidence(repoRoot);
  const expectedDecisionId = `handover-retirement-cutover:${evidence.paramsDigest.slice("sha256:".length)}`;
  const approvedAt = validInstant(raw.approvedAt) ? Date.parse(raw.approvedAt) : Number.NaN;
  const expiresAt = validInstant(raw.expiresAt) ? Date.parse(raw.expiresAt) : Number.NaN;
  const appliedAt = validInstant(raw.appliedAt) ? Date.parse(raw.appliedAt) : Number.NaN;
  const applied = raw.status === "approved_applied";
  const terminalLineBound = applied
    ? existsSync(join(repoRoot, TERMINAL_JOURNAL_PATH)) &&
      readFileSync(join(repoRoot, TERMINAL_JOURNAL_PATH), "utf8")
        .split(/\r?\n/)
        .some((line) => line.length > 0 && sha256(line) === raw.terminalJournalEntryDigest)
    : true;
  if (
    raw.schemaVersion !== HANDOVER_CUTOVER_APPROVAL_PIN.schemaVersion ||
    (raw.status !== "approved" && raw.status !== "approved_applied") ||
    raw.actor !== HANDOVER_CUTOVER_APPROVAL_PIN.actor ||
    raw.tool !== HANDOVER_CUTOVER_APPROVAL_PIN.tool ||
    raw.target !== HANDOVER_CUTOVER_APPROVAL_PIN.target ||
    raw.approvedHead !== HANDOVER_CUTOVER_APPROVAL_PIN.approvedHead ||
    raw.intentDigest !== HANDOVER_CUTOVER_APPROVAL_PIN.intentDigest ||
    raw.preserveDigest !== HANDOVER_CUTOVER_APPROVAL_PIN.preserveDigest ||
    raw.archiveDigest !== HANDOVER_CUTOVER_APPROVAL_PIN.archiveDigest ||
    raw.paramsDigest !== evidence.paramsDigest ||
    raw.targetTreeDigest !== evidence.targetTreeDigest ||
    raw.generatedBaselineDigest !== evidence.generatedBaselineDigest ||
    raw.dryRunEvidenceDigest !== evidence.dryRunEvidenceDigest ||
    raw.decisionId !== expectedDecisionId ||
    !HEAD_SHA.test(raw.approvedHead ?? "") ||
    !validInstant(raw.approvedAt) ||
    !validInstant(raw.expiresAt) ||
    expiresAt <= approvedAt ||
    (applied
      ? !validInstant(raw.appliedAt) ||
        appliedAt < approvedAt ||
        appliedAt > expiresAt ||
        raw.terminalJournalEntryDigest !== TERMINAL_JOURNAL_ENTRY_DIGEST ||
        !terminalLineBound
      : Date.now() > expiresAt)
  ) {
    throw new Error("session handover cutover approval is invalid or evidence-drifted");
  }
  execFileSync("git", ["merge-base", "--is-ancestor", raw.approvedHead, "HEAD"], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  return raw as HandoverCutoverApprovalRecord;
}
