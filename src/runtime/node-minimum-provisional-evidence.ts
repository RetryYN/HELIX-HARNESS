import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  writeSync,
} from "node:fs";
import { basename, isAbsolute, relative, resolve } from "node:path";

export const NODE_MINIMUM_PROVISIONAL_WORKFLOWS = [
  "build",
  "install",
  "source-cli",
  "sqlite",
  "test",
  "typecheck",
] as const;
export const NODE_MINIMUM_EXPECTATION_ARTIFACT_PATH = "docs/evidence/node-minimum-expectation.json";

export type NodeMinimumProvisionalFailure =
  | "HIL_NODE_AUTHORITY_BINDING_INVALID"
  | "HIL_NODE_WORKFLOW_SET_INVALID"
  | "HIL_NODE_WORKFLOW_UNVERIFIED";

export interface NodeMinimumAuthorityBinding {
  authority_head: string;
  authority_tree: string;
  runtime_id: string;
  node_version: string;
  npm_version: string;
  lock_digest: string;
  tree_digest: string;
  sqlite_api: string;
  sqlite_version: string;
  sqlite_compile_options_digest: string;
  artifact_digest: string;
}

export interface NodeMinimumWorkflowEvidence {
  workflow_id: string;
  evidence_digest: string;
  green: boolean;
}

export interface NodeMinimumObservedWorkflowArtifact {
  workflow_id: string;
  authority_head: string;
  authority_tree: string;
  green: boolean;
}

export interface NodeMinimumObservationPorts {
  observeExpectationArtifactBytes(): Buffer;
  observeRepository(): { head: string; tree: string };
  observeToolchain(): { runtimeId: string; nodeVersion: string; npmVersion: string };
  observeLockBytes(): { lockBytes: Buffer; installedTreeBytes: Buffer };
  observeSqlite(): { api: string; version: string; compileOptions: string[] };
  observeArtifactBytes(): Buffer;
  observeWorkflowArtifactBytes(): Buffer[];
}

export interface NodeMinimumProvisionalReceipt {
  schema_version: "helix-node-minimum-provisional-receipt.v1";
  status: "pass" | "blocked";
  terminal: false;
  authority_binding: NodeMinimumAuthorityBinding;
  expected_authority_binding: NodeMinimumAuthorityBinding;
  expectation_artifact_digest: string;
  required_workflow_ids: readonly string[];
  workflow_evidence: readonly NodeMinimumWorkflowEvidence[];
  failures: readonly NodeMinimumProvisionalFailure[];
  receipt_digest: string;
}

export interface NodeMinimumLocalObservationOptions {
  repoRoot: string;
  lockPath: string;
  installedTreePath: string;
  artifactPath: string;
  workflowEvidencePaths: string[];
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function semanticDigest(value: unknown): string {
  return digest(canonical(value));
}

const SHA256 = /^[0-9a-f]{64}$/;
const GIT_OID = /^[0-9a-f]{40,64}$/;
const VERSION = /^\d+\.\d+\.\d+$/;

function bindingShapeValid(binding: NodeMinimumAuthorityBinding): boolean {
  return (
    GIT_OID.test(binding.authority_head) &&
    GIT_OID.test(binding.authority_tree) &&
    binding.runtime_id === "node" &&
    binding.node_version === "24.15.0" &&
    binding.npm_version === "11.12.1" &&
    SHA256.test(binding.lock_digest) &&
    SHA256.test(binding.tree_digest) &&
    binding.sqlite_api === "node:sqlite" &&
    VERSION.test(binding.sqlite_version) &&
    SHA256.test(binding.sqlite_compile_options_digest) &&
    SHA256.test(binding.artifact_digest)
  );
}

function parseWorkflowArtifact(bytes: Buffer): NodeMinimumObservedWorkflowArtifact | null {
  try {
    const value = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
    if (
      value === null ||
      Array.isArray(value) ||
      Object.keys(value).sort().join(",") !== "authority_head,authority_tree,green,workflow_id"
    )
      return null;
    if (
      typeof value.workflow_id !== "string" ||
      typeof value.authority_head !== "string" ||
      typeof value.authority_tree !== "string" ||
      typeof value.green !== "boolean"
    )
      return null;
    return {
      workflow_id: value.workflow_id,
      authority_head: value.authority_head,
      authority_tree: value.authority_tree,
      green: value.green,
    };
  } catch {
    return null;
  }
}

const EXPECTATION_KEYS = [
  "artifact_digest",
  "lock_digest",
  "node_version",
  "npm_version",
  "runtime_id",
  "schema_version",
  "sqlite_api",
  "sqlite_compile_options_digest",
  "sqlite_version",
  "tree_digest",
].sort();

function parseExpectationArtifact(
  bytes: Buffer,
): Omit<NodeMinimumAuthorityBinding, "authority_head" | "authority_tree"> | null {
  try {
    const value = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
    if (
      value === null ||
      Array.isArray(value) ||
      Object.keys(value).sort().join(",") !== EXPECTATION_KEYS.join(",") ||
      value.schema_version !== "helix-node-minimum-expectation.v1"
    )
      return null;
    const { schema_version: _schemaVersion, ...binding } = value;
    return bindingShapeValid({
      ...(binding as unknown as Omit<
        NodeMinimumAuthorityBinding,
        "authority_head" | "authority_tree"
      >),
      authority_head: "0".repeat(40),
      authority_tree: "0".repeat(40),
    })
      ? (binding as unknown as Omit<
          NodeMinimumAuthorityBinding,
          "authority_head" | "authority_tree"
        >)
      : null;
  } catch {
    return null;
  }
}

export function collectNodeMinimumProvisionalEvidence(
  ports: NodeMinimumObservationPorts,
): NodeMinimumProvisionalReceipt {
  const expectationBytes = ports.observeExpectationArtifactBytes();
  const expectation = parseExpectationArtifact(expectationBytes);
  const repository = ports.observeRepository();
  const toolchain = ports.observeToolchain();
  const lock = ports.observeLockBytes();
  const sqlite = ports.observeSqlite();
  const artifactBytes = ports.observeArtifactBytes();
  const workflowArtifacts = ports.observeWorkflowArtifactBytes();
  const observed: NodeMinimumAuthorityBinding = {
    authority_head: repository.head,
    authority_tree: repository.tree,
    runtime_id: toolchain.runtimeId,
    node_version: toolchain.nodeVersion,
    npm_version: toolchain.npmVersion,
    lock_digest: digest(lock.lockBytes),
    tree_digest: digest(lock.installedTreeBytes),
    sqlite_api: sqlite.api,
    sqlite_version: sqlite.version,
    sqlite_compile_options_digest: semanticDigest([...sqlite.compileOptions].sort()),
    artifact_digest: digest(artifactBytes),
  };
  const expected: NodeMinimumAuthorityBinding = {
    authority_head: repository.head,
    authority_tree: repository.tree,
    ...(expectation ?? {
      runtime_id: "invalid",
      node_version: "invalid",
      npm_version: "invalid",
      lock_digest: "invalid",
      tree_digest: "invalid",
      sqlite_api: "invalid",
      sqlite_version: "invalid",
      sqlite_compile_options_digest: "invalid",
      artifact_digest: "invalid",
    }),
  };
  const failures: NodeMinimumProvisionalFailure[] = [];
  if (!expectation || !bindingShapeValid(expected) || canonical(observed) !== canonical(expected))
    failures.push("HIL_NODE_AUTHORITY_BINDING_INVALID");

  const parsed = workflowArtifacts.map((bytes) => ({ bytes, value: parseWorkflowArtifact(bytes) }));
  const ids = parsed.map((row) => row.value?.workflow_id ?? "<invalid>");
  const uniqueIds = new Set(ids);
  const exactSet =
    ids.length === NODE_MINIMUM_PROVISIONAL_WORKFLOWS.length &&
    uniqueIds.size === ids.length &&
    NODE_MINIMUM_PROVISIONAL_WORKFLOWS.every((id) => uniqueIds.has(id));
  if (!exactSet) failures.push("HIL_NODE_WORKFLOW_SET_INVALID");
  if (
    parsed.some((row) => {
      const value = row.value;
      if (!value?.green) return true;
      return value.authority_head !== repository.head || value.authority_tree !== repository.tree;
    })
  )
    failures.push("HIL_NODE_WORKFLOW_UNVERIFIED");
  const workflowEvidence = parsed
    .map((row) => ({
      workflow_id: row.value?.workflow_id ?? "<invalid>",
      evidence_digest: digest(row.bytes),
      green: row.value?.green === true,
    }))
    .sort((left, right) => left.workflow_id.localeCompare(right.workflow_id));
  const core = {
    schema_version: "helix-node-minimum-provisional-receipt.v1" as const,
    status: failures.length === 0 ? ("pass" as const) : ("blocked" as const),
    terminal: false as const,
    authority_binding: observed,
    expected_authority_binding: { ...expected },
    expectation_artifact_digest: digest(expectationBytes),
    required_workflow_ids: [...NODE_MINIMUM_PROVISIONAL_WORKFLOWS],
    workflow_evidence: workflowEvidence,
    failures: [...new Set(failures)].sort(),
  };
  return { ...core, receipt_digest: semanticDigest(core) };
}

function verifiedRepoFile(root: string, path: string): Buffer {
  if (isAbsolute(path))
    throw new Error(`Node Minimum evidence path must be repo-relative: ${path}`);
  const target = realpathSync(resolve(root, path));
  const rel = relative(root, target);
  if (!rel || rel.startsWith("..") || isAbsolute(rel) || lstatSync(target).isSymbolicLink())
    throw new Error(`Node Minimum evidence path escapes repository: ${path}`);
  return readFileSync(target);
}

export function createLocalNodeMinimumObservationPorts(
  options: NodeMinimumLocalObservationOptions,
): NodeMinimumObservationPorts {
  const root = realpathSync(options.repoRoot);
  return {
    observeExpectationArtifactBytes: () =>
      execFileSync("git", ["-C", root, "show", `HEAD:${NODE_MINIMUM_EXPECTATION_ARTIFACT_PATH}`]),
    observeRepository: () => ({
      head: execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
      tree: execFileSync("git", ["-C", root, "rev-parse", "HEAD^{tree}"], {
        encoding: "utf8",
      }).trim(),
    }),
    observeToolchain: () => ({
      runtimeId:
        typeof (globalThis as { Bun?: unknown }).Bun === "undefined" &&
        /^node(?:\.exe)?$/i.test(basename(process.execPath))
          ? "node"
          : "other",
      nodeVersion: process.versions.node,
      npmVersion: execFileSync("npm", ["--version"], {
        encoding: "utf8",
      }).trim(),
    }),
    observeLockBytes: () => ({
      lockBytes: verifiedRepoFile(root, options.lockPath),
      installedTreeBytes: verifiedRepoFile(root, options.installedTreePath),
    }),
    observeSqlite: () => {
      const module = process.getBuiltinModule("node:sqlite") as
        | {
            DatabaseSync?: new (
              path: string,
            ) => {
              prepare(sql: string): {
                get(): Record<string, unknown>;
                all(): Record<string, unknown>[];
              };
              close(): void;
            };
          }
        | undefined;
      if (!module?.DatabaseSync) throw new Error("node:sqlite DatabaseSync is unavailable");
      const db = new module.DatabaseSync(":memory:");
      try {
        const version = String(db.prepare("SELECT sqlite_version() version").get().version);
        const compileOptions = db
          .prepare("PRAGMA compile_options")
          .all()
          .map((row) => String(row.compile_options));
        return { api: "node:sqlite", version, compileOptions };
      } finally {
        db.close();
      }
    },
    observeArtifactBytes: () => verifiedRepoFile(root, options.artifactPath),
    observeWorkflowArtifactBytes: () =>
      options.workflowEvidencePaths.map((path) => verifiedRepoFile(root, path)),
  };
}

export function persistNodeMinimumProvisionalReceipt(
  repoRoot: string,
  receipt: NodeMinimumProvisionalReceipt,
): string {
  if (receipt.status !== "pass" || receipt.terminal !== false)
    throw new Error("Only a passing non-terminal Node Minimum receipt can be persisted");
  const { receipt_digest: receiptDigest, ...receiptPreimage } = receipt;
  if (semanticDigest(receiptPreimage) !== receiptDigest)
    throw new Error("Node Minimum receipt digest does not match its full preimage");
  const root = realpathSync(repoRoot);
  const currentHead = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const currentTree = execFileSync("git", ["-C", root, "rev-parse", "HEAD^{tree}"], {
    encoding: "utf8",
  }).trim();
  if (
    currentHead !== receipt.authority_binding.authority_head ||
    currentTree !== receipt.authority_binding.authority_tree
  )
    throw new Error("Node Minimum receipt authority is stale");
  let parent = root;
  for (const segment of [".helix", "evidence", "node-minimum"]) {
    const candidate = resolve(parent, segment);
    if (existsSync(candidate)) {
      if (lstatSync(candidate).isSymbolicLink())
        throw new Error("Node Minimum evidence directory contains a symlink");
    } else {
      mkdirSync(candidate, { recursive: false, mode: 0o700 });
    }
    const canonicalCandidate = realpathSync(candidate);
    if (relative(root, canonicalCandidate).startsWith(".."))
      throw new Error("Node Minimum receipt directory escapes repository");
    parent = canonicalCandidate;
  }
  const relativePath = `.helix/evidence/node-minimum/${receiptDigest}.json`;
  const rendered = `${JSON.stringify(receipt, null, 2)}\n`;
  const fd = openSync(resolve(root, relativePath), "wx", 0o600);
  try {
    writeSync(fd, rendered, undefined, "utf8");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  return relativePath;
}
