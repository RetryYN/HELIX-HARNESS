import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { z } from "zod";
import {
  analyzeClosureAuthorityDrift,
  classifyClosureAuthorities,
  loadClosureAuthorityRegistry,
} from "../policy/closure-authority-registry";
import type { HarnessDb } from "./index";

export const CLOSURE_TERMINAL_BOUNDARY_PATH =
  "docs/governance/closure-terminal-boundaries.jsonl" as const;
type Digest = `sha256:${string}`;
const digestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const headSchema = z.string().regex(/^[0-9a-f]{40}$/);
const sha256 = (value: string | Buffer): Digest =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};

const common = {
  schema_version: z.literal("closure-terminal-boundary-ledger.v1"),
  boundary_key: z.string().regex(/^closure-boundary:[A-Za-z0-9._-]+$/),
  event_kind: z.enum(["boundary_opened", "boundary_resolved"]),
  authority_head: headSchema,
  registry_digest: digestSchema,
  initial_set_digest: digestSchema,
  cycle_digest: digestSchema,
  plan_id: z.string().regex(/^PLAN-[A-Za-z0-9-]+$/),
  classification: z.enum(["human_only", "invalid_escalated"]),
  reason: z.string().trim().min(1),
  owner: z.string().trim().min(1),
  next_decision_route: z.string().trim().min(1),
  automation_terminal: z.literal(true),
  whole_program_blocker: z.boolean(),
  previous_event_digest: digestSchema.nullable(),
  event_digest: digestSchema,
};
const openedSchema = z
  .object({
    ...common,
    event_kind: z.literal("boundary_opened"),
    whole_program_blocker: z.literal(true),
    supersedes_event_digest: z.null(),
    resolution_authority: z.null(),
  })
  .strict();
const humanResolution = z
  .object({
    kind: z.literal("action_binding_approval"),
    decision_id: z.string().min(1),
    approved_scope_digest: digestSchema,
    authority_digest: digestSchema,
    receipt_path: z.string().min(1),
    receipt_digest: digestSchema,
  })
  .strict();
const invalidResolution = z
  .object({
    kind: z.literal("confirmed_vpair_recensus"),
    design_path: z.string().min(1),
    test_design_path: z.string().min(1),
    merge_head: headSchema,
    recensus_classification_digest: digestSchema,
    authority_digest: digestSchema,
    recensus_artifact_path: z.string().min(1),
    recensus_artifact_digest: digestSchema,
  })
  .strict();
const resolvedSchema = z
  .object({
    ...common,
    event_kind: z.literal("boundary_resolved"),
    whole_program_blocker: z.literal(false),
    supersedes_event_digest: digestSchema,
    resolution_authority: z.union([humanResolution, invalidResolution]),
  })
  .strict();
const eventSchema = z.discriminatedUnion("event_kind", [openedSchema, resolvedSchema]);
export type ClosureTerminalBoundaryEvent = z.infer<typeof eventSchema>;

export interface ClosureTerminalBoundaryRow {
  boundary_key: string;
  authority_head: string;
  registry_digest: string;
  source_blob_digest: Digest;
  plan_id: string;
  classification: "human_only" | "invalid_escalated";
  reason: string;
  owner: string;
  next_decision_route: string;
  automation_terminal: 1;
  whole_program_blocker: 0 | 1;
  opened_event_digest: Digest;
  resolved_event_digest: Digest | null;
  resolution_authority_digest: Digest | null;
  previous_event_digest: Digest | null;
  event_digest: Digest;
}

function canonicalTrackedBytes(repoRoot: string, path: string): Buffer {
  if (path !== CLOSURE_TERMINAL_BOUNDARY_PATH) throw new Error("non-canonical boundary source");
  const root = realpathSync(repoRoot);
  const absolute = resolve(root, path);
  const rel = relative(root, absolute);
  if (rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel))
    throw new Error("boundary source outside repository");
  let cursor = root;
  for (const part of path.split("/")) {
    cursor = resolve(cursor, part);
    if (lstatSync(cursor).isSymbolicLink()) throw new Error("boundary source symlink ancestry");
  }
  if (!lstatSync(absolute).isFile() || realpathSync(absolute) !== absolute)
    throw new Error("boundary source must be canonical regular file");
  const tracked = execFileSync("git", ["ls-files", "--error-unmatch", path], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  if (tracked !== path) throw new Error("boundary source must be tracked");
  const working = readFileSync(absolute);
  const head = execFileSync("git", ["show", `HEAD:${path}`], { cwd: root });
  if (!working.equals(head))
    throw new Error("boundary source must exactly match current HEAD blob");
  return head;
}

export function parseClosureTerminalBoundaryLedger(bytes: Buffer): ClosureTerminalBoundaryEvent[] {
  if (bytes.length === 0) return [];
  const text = bytes.toString("utf8");
  if (!text.endsWith("\n")) throw new Error("boundary ledger partial final line");
  let previous: Digest | null = null;
  const events: ClosureTerminalBoundaryEvent[] = [];
  for (const line of text.trimEnd().split("\n")) {
    const event = eventSchema.parse(JSON.parse(line));
    const { event_digest, ...body } = event;
    if (event.previous_event_digest !== previous || sha256(stable(body)) !== event_digest)
      throw new Error("boundary ledger hash chain mismatch");
    previous = event_digest as Digest;
    events.push(event);
  }
  return events;
}

export function foldClosureTerminalBoundaries(input: {
  events: ClosureTerminalBoundaryEvent[];
  sourceBlobDigest: Digest;
}): ClosureTerminalBoundaryRow[] {
  const current = new Map<string, ClosureTerminalBoundaryRow>();
  for (const event of input.events) {
    const prior = current.get(event.plan_id);
    if (event.event_kind === "boundary_opened") {
      if (prior) throw new Error(`boundary duplicate/open while active: ${event.plan_id}`);
      current.set(event.plan_id, {
        boundary_key: event.boundary_key,
        authority_head: event.authority_head,
        registry_digest: event.registry_digest,
        source_blob_digest: input.sourceBlobDigest,
        plan_id: event.plan_id,
        classification: event.classification,
        reason: event.reason,
        owner: event.owner,
        next_decision_route: event.next_decision_route,
        automation_terminal: 1,
        whole_program_blocker: 1,
        opened_event_digest: event.event_digest as Digest,
        resolved_event_digest: null,
        resolution_authority_digest: null,
        previous_event_digest: event.previous_event_digest as Digest | null,
        event_digest: event.event_digest as Digest,
      });
      continue;
    }
    if (!prior || event.supersedes_event_digest !== prior.opened_event_digest)
      throw new Error(`boundary resolve without exact open: ${event.plan_id}`);
    if (prior.resolved_event_digest) throw new Error(`boundary double resolve: ${event.plan_id}`);
    if (
      (event.classification === "human_only" &&
        event.resolution_authority.kind !== "action_binding_approval") ||
      (event.classification === "invalid_escalated" &&
        event.resolution_authority.kind !== "confirmed_vpair_recensus")
    )
      throw new Error(`boundary resolution authority mismatch: ${event.plan_id}`);
    const { authority_digest, ...authorityBody } = event.resolution_authority;
    if (authority_digest !== sha256(stable(authorityBody)))
      throw new Error(`boundary resolution authority digest mismatch: ${event.plan_id}`);
    current.set(event.plan_id, {
      ...prior,
      whole_program_blocker: 0,
      resolved_event_digest: event.event_digest as Digest,
      resolution_authority_digest: event.resolution_authority.authority_digest as Digest,
      previous_event_digest: event.previous_event_digest as Digest,
      event_digest: event.event_digest as Digest,
    });
  }
  return [...current.values()].sort((a, b) => a.plan_id.localeCompare(b.plan_id));
}

export function loadClosureTerminalBoundaries(input: {
  repoRoot: string;
  currentHead: string;
  registryDigest: Digest;
}): ClosureTerminalBoundaryRow[] {
  const bytes = canonicalTrackedBytes(input.repoRoot, CLOSURE_TERMINAL_BOUNDARY_PATH);
  const events = parseClosureTerminalBoundaryLedger(bytes);
  const commits = execFileSync(
    "git",
    ["rev-list", input.currentHead, "--", CLOSURE_TERMINAL_BOUNDARY_PATH],
    { cwd: input.repoRoot, encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  for (const event of events) {
    execFileSync("git", ["merge-base", "--is-ancestor", event.authority_head, input.currentHead], {
      cwd: input.repoRoot,
      stdio: "ignore",
    });
    const hasRegistryProvenance = commits.some((commit) => {
      try {
        const ledgerAtCommit = execFileSync(
          "git",
          ["show", `${commit}:${CLOSURE_TERMINAL_BOUNDARY_PATH}`],
          { cwd: input.repoRoot },
        );
        const present = parseClosureTerminalBoundaryLedger(ledgerAtCommit).some(
          (row) => row.event_digest === event.event_digest,
        );
        if (!present) return false;
        const registryAtCommit = execFileSync(
          "git",
          ["show", `${commit}:docs/governance/closure-authority-registry.yaml`],
          { cwd: input.repoRoot },
        );
        return sha256(registryAtCommit) === event.registry_digest;
      } catch {
        return false;
      }
    });
    if (!hasRegistryProvenance)
      throw new Error(
        `boundary registry generation has no tracked commit provenance: ${event.plan_id}`,
      );
    if (
      event.event_kind === "boundary_resolved" &&
      event.resolution_authority.kind === "action_binding_approval"
    ) {
      const authority = event.resolution_authority;
      if (
        !authority.receipt_path.startsWith("docs/") ||
        authority.receipt_path.includes("..") ||
        authority.receipt_path.includes("\\")
      )
        throw new Error(`boundary approval receipt path is non-canonical: ${event.plan_id}`);
      const receiptBytes = execFileSync(
        "git",
        ["show", `${input.currentHead}:${authority.receipt_path}`],
        { cwd: input.repoRoot },
      );
      if (sha256(receiptBytes) !== authority.receipt_digest)
        throw new Error(`boundary approval receipt digest mismatch: ${event.plan_id}`);
      const receipt = z
        .object({
          schema_version: z.literal("action-binding-approval-receipt.v1"),
          decision_id: z.string().min(1),
          plan_id: z.string().min(1),
          approved_scope_digest: digestSchema,
          status: z.literal("approved"),
          authority_digest: digestSchema,
        })
        .strict()
        .parse(JSON.parse(receiptBytes.toString("utf8")));
      const { authority_digest, ...receiptBody } = receipt;
      if (
        receipt.plan_id !== event.plan_id ||
        receipt.decision_id !== authority.decision_id ||
        receipt.approved_scope_digest !== authority.approved_scope_digest ||
        authority_digest !== sha256(stable(receiptBody))
      )
        throw new Error(`boundary approval receipt exact join failed: ${event.plan_id}`);
    }
    if (
      event.event_kind === "boundary_resolved" &&
      event.resolution_authority.kind === "confirmed_vpair_recensus"
    ) {
      execFileSync(
        "git",
        ["merge-base", "--is-ancestor", event.resolution_authority.merge_head, input.currentHead],
        { cwd: input.repoRoot, stdio: "ignore" },
      );
      for (const path of [
        event.resolution_authority.design_path,
        event.resolution_authority.test_design_path,
      ]) {
        if (!path.startsWith("docs/") || path.includes("..") || path.includes("\\"))
          throw new Error(`boundary resolution non-canonical V-pair path: ${path}`);
        const bytes = execFileSync(
          "git",
          ["show", `${event.resolution_authority.merge_head}:${path}`],
          {
            cwd: input.repoRoot,
          },
        );
        if (!/^---\n[\s\S]*?\nstatus: confirmed\n/m.test(bytes.toString("utf8")))
          throw new Error(`boundary resolution V-pair is not confirmed: ${path}`);
      }
      const designBytes = execFileSync(
        "git",
        [
          "show",
          `${event.resolution_authority.merge_head}:${event.resolution_authority.design_path}`,
        ],
        { cwd: input.repoRoot },
      );
      if (event.resolution_authority.merge_head !== input.currentHead)
        throw new Error(`boundary recensus must bind current HEAD: ${event.plan_id}`);
      const testBytes = execFileSync(
        "git",
        [
          "show",
          `${event.resolution_authority.merge_head}:${event.resolution_authority.test_design_path}`,
        ],
        { cwd: input.repoRoot },
      );
      const recensusDigest = sha256(
        stable({
          plan_id: event.plan_id,
          classification: "eligible",
          design_path: event.resolution_authority.design_path,
          design_digest: sha256(designBytes),
          test_design_path: event.resolution_authority.test_design_path,
          test_design_digest: sha256(testBytes),
          merge_head: event.resolution_authority.merge_head,
        }),
      );
      const artifactPath = event.resolution_authority.recensus_artifact_path;
      if (
        !artifactPath.startsWith("docs/") ||
        artifactPath.includes("..") ||
        artifactPath.includes("\\")
      )
        throw new Error(`boundary recensus artifact path is non-canonical: ${event.plan_id}`);
      const artifactBytes = execFileSync(
        "git",
        ["show", `${event.resolution_authority.merge_head}:${artifactPath}`],
        { cwd: input.repoRoot },
      );
      if (sha256(artifactBytes) !== event.resolution_authority.recensus_artifact_digest)
        throw new Error(`boundary recensus artifact blob mismatch: ${event.plan_id}`);
      const artifact = z
        .object({
          schema_version: z.literal("closure-boundary-recensus.v1"),
          plan_id: z.string(),
          classification: z.literal("eligible"),
          design_path: z.string(),
          design_digest: digestSchema,
          test_design_path: z.string(),
          test_design_digest: digestSchema,
          merge_head: headSchema,
          classification_digest: digestSchema,
        })
        .strict()
        .parse(JSON.parse(artifactBytes.toString("utf8")));
      const { classification_digest, ...artifactBody } = artifact;
      if (
        artifact.plan_id !== event.plan_id ||
        artifact.design_path !== event.resolution_authority.design_path ||
        artifact.design_digest !== sha256(designBytes) ||
        artifact.test_design_path !== event.resolution_authority.test_design_path ||
        artifact.test_design_digest !== sha256(testBytes) ||
        artifact.merge_head !== event.resolution_authority.merge_head ||
        classification_digest !== sha256(stable(artifactBody)) ||
        recensusDigest !== classification_digest ||
        classification_digest !== event.resolution_authority.recensus_classification_digest
      )
        throw new Error(`boundary recensus classification digest mismatch: ${event.plan_id}`);
      const trackedDirty = execFileSync(
        "git",
        ["status", "--porcelain=v1", "--untracked-files=no"],
        { cwd: input.repoRoot, encoding: "utf8" },
      ).trim();
      if (trackedDirty !== "")
        throw new Error(
          `boundary recensus classifier requires clean current HEAD: ${event.plan_id}`,
        );
      const registry = loadClosureAuthorityRegistry({
        repositoryRoot: input.repoRoot,
        registryPath: "docs/governance/closure-authority-registry.yaml",
      });
      const liveClassification = classifyClosureAuthorities({
        candidatePlanIds: [event.plan_id],
        registry,
        drifts: analyzeClosureAuthorityDrift({ repositoryRoot: input.repoRoot, registry }),
      })[0]?.classification;
      if (liveClassification !== artifact.classification)
        throw new Error(`boundary recensus live classifier mismatch: ${event.plan_id}`);
    }
  }
  return foldClosureTerminalBoundaries({ events, sourceBlobDigest: sha256(bytes) });
}

function installImmutability(db: HarnessDb): void {
  db.exec(`CREATE TRIGGER IF NOT EXISTS closure_terminal_boundaries_no_update
    BEFORE UPDATE ON closure_terminal_boundaries BEGIN SELECT RAISE(ABORT, 'closure terminal boundary immutable projection'); END`);
  db.exec(`CREATE TRIGGER IF NOT EXISTS closure_terminal_boundaries_no_delete
    BEFORE DELETE ON closure_terminal_boundaries BEGIN SELECT RAISE(ABORT, 'closure terminal boundary immutable projection'); END`);
}

export function replaceClosureTerminalBoundaryProjection(
  db: HarnessDb,
  rows: readonly ClosureTerminalBoundaryRow[],
): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec("DROP TRIGGER IF EXISTS closure_terminal_boundaries_no_update");
    db.exec("DROP TRIGGER IF EXISTS closure_terminal_boundaries_no_delete");
    db.exec("DELETE FROM closure_terminal_boundaries");
    const insert = db.prepare(`INSERT INTO closure_terminal_boundaries
      (boundary_key,authority_head,registry_digest,source_blob_digest,plan_id,classification,
       reason,owner,next_decision_route,automation_terminal,whole_program_blocker,
       opened_event_digest,resolved_event_digest,resolution_authority_digest,
       previous_event_digest,event_digest) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    for (const row of rows)
      insert.run(
        row.boundary_key,
        row.authority_head,
        row.registry_digest,
        row.source_blob_digest,
        row.plan_id,
        row.classification,
        row.reason,
        row.owner,
        row.next_decision_route,
        row.automation_terminal,
        row.whole_program_blocker,
        row.opened_event_digest,
        row.resolved_event_digest,
        row.resolution_authority_digest,
        row.previous_event_digest,
        row.event_digest,
      );
    installImmutability(db);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    installImmutability(db);
    throw error;
  }
}

export function projectTrackedClosureTerminalBoundaries(input: {
  repoRoot: string;
  db: HarnessDb;
}): { projected: number; open: number; whole_program_blockers: number } {
  const absolute = resolve(input.repoRoot, CLOSURE_TERMINAL_BOUNDARY_PATH);
  if (!existsSync(absolute)) return { projected: 0, open: 0, whole_program_blockers: 0 };
  const currentHead = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: input.repoRoot,
    encoding: "utf8",
  }).trim();
  const registryPath = "docs/governance/closure-authority-registry.yaml";
  execFileSync("git", ["ls-files", "--error-unmatch", registryPath], {
    cwd: input.repoRoot,
    stdio: "ignore",
  });
  const registryBytes = readFileSync(resolve(input.repoRoot, registryPath));
  const rows = loadClosureTerminalBoundaries({
    repoRoot: input.repoRoot,
    currentHead,
    registryDigest: sha256(registryBytes),
  });
  const insert = input.db.prepare(`INSERT INTO closure_terminal_boundaries
    (boundary_key,authority_head,registry_digest,source_blob_digest,plan_id,classification,
     reason,owner,next_decision_route,automation_terminal,whole_program_blocker,
     opened_event_digest,resolved_event_digest,resolution_authority_digest,
     previous_event_digest,event_digest) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  for (const row of rows)
    insert.run(
      row.boundary_key,
      row.authority_head,
      row.registry_digest,
      row.source_blob_digest,
      row.plan_id,
      row.classification,
      row.reason,
      row.owner,
      row.next_decision_route,
      row.automation_terminal,
      row.whole_program_blocker,
      row.opened_event_digest,
      row.resolved_event_digest,
      row.resolution_authority_digest,
      row.previous_event_digest,
      row.event_digest,
    );
  installImmutability(input.db);
  return {
    projected: rows.length,
    open: rows.filter((row) => row.whole_program_blocker === 1).length,
    whole_program_blockers: rows.filter((row) => row.whole_program_blocker === 1).length,
  };
}
