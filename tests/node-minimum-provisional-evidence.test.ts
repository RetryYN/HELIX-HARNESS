import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  collectNodeMinimumProvisionalEvidence,
  createLocalNodeMinimumObservationPorts,
  NODE_MINIMUM_PROVISIONAL_WORKFLOWS,
  type NodeMinimumAuthorityBinding,
  type NodeMinimumObservationPorts,
  persistNodeMinimumProvisionalReceipt,
} from "../src/runtime/node-minimum-provisional-evidence";

// PLAN-L7-458-node-minimum-provisional-evidence

const HEAD = "b".repeat(40);
const TREE = "c".repeat(40);
const LOCK = Buffer.from("canonical-lock");
const INSTALLED = Buffer.from("installed-tree");
const ARTIFACT = Buffer.from("node-artifact");
const sha = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");
const compileOptions = ["THREADSAFE=1", "ENABLE_FTS5"];
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};
const binding: NodeMinimumAuthorityBinding = {
  authority_head: HEAD,
  authority_tree: TREE,
  runtime_id: "node",
  node_version: "24.15.0",
  npm_version: "11.12.1",
  lock_digest: sha(LOCK),
  tree_digest: sha(INSTALLED),
  sqlite_api: "node:sqlite",
  sqlite_version: "3.50.4",
  sqlite_compile_options_digest: sha(canonical([...compileOptions].sort())),
  artifact_digest: sha(ARTIFACT),
};
const expectationBytes = (): Buffer =>
  Buffer.from(
    JSON.stringify({
      schema_version: "helix-node-minimum-expectation.v1",
      runtime_id: binding.runtime_id,
      node_version: binding.node_version,
      npm_version: binding.npm_version,
      lock_digest: binding.lock_digest,
      tree_digest: binding.tree_digest,
      sqlite_api: binding.sqlite_api,
      sqlite_version: binding.sqlite_version,
      sqlite_compile_options_digest: binding.sqlite_compile_options_digest,
      artifact_digest: binding.artifact_digest,
    }),
  );
const workflowBytes = (ids: string[] = [...NODE_MINIMUM_PROVISIONAL_WORKFLOWS]): Buffer[] =>
  ids.map((workflow_id) =>
    Buffer.from(
      JSON.stringify({ workflow_id, authority_head: HEAD, authority_tree: TREE, green: true }),
    ),
  );

function ports(overrides: Partial<NodeMinimumObservationPorts> = {}): NodeMinimumObservationPorts {
  return {
    observeExpectationArtifactBytes: expectationBytes,
    observeRepository: () => ({ head: HEAD, tree: TREE }),
    observeToolchain: () => ({
      runtimeId: "node",
      nodeVersion: "24.15.0",
      npmVersion: "11.12.1",
    }),
    observeLockBytes: () => ({ lockBytes: LOCK, installedTreeBytes: INSTALLED }),
    observeSqlite: () => ({ api: "node:sqlite", version: "3.50.4", compileOptions }),
    observeArtifactBytes: () => ARTIFACT,
    observeWorkflowArtifactBytes: () => workflowBytes(),
    ...overrides,
  };
}

describe("Node Minimum provisional evidence", () => {
  it("U-NMIN-001: actual effect observationsとexact 6 workflowだけをterminal false PASSへ束縛する", () => {
    expect(collectNodeMinimumProvisionalEvidence(ports())).toMatchObject({
      status: "pass",
      terminal: false,
      failures: [],
      authority_binding: binding,
    });
  });

  it("U-NMIN-002: P0-P1外workflowを分母へ混入させない", () => {
    const result = collectNodeMinimumProvisionalEvidence(
      ports({
        observeWorkflowArtifactBytes: () =>
          workflowBytes([...NODE_MINIMUM_PROVISIONAL_WORKFLOWS, "cutover-activation"]),
      }),
    );
    expect(result).toMatchObject({ status: "blocked", terminal: false });
    expect(result.failures).toContain("HIL_NODE_WORKFLOW_SET_INVALID");
  });

  it("U-NMIN-003: workflow ID重複とauthority不一致artifactを拒否する", () => {
    const duplicate = workflowBytes();
    duplicate[1] = duplicate[0];
    const result = collectNodeMinimumProvisionalEvidence(
      ports({ observeWorkflowArtifactBytes: () => duplicate }),
    );
    expect(result.failures).toContain("HIL_NODE_WORKFLOW_SET_INVALID");

    const foreign = workflowBytes();
    foreign[0] = Buffer.from(
      JSON.stringify({
        workflow_id: "build",
        authority_head: "d".repeat(40),
        authority_tree: TREE,
        green: true,
      }),
    );
    expect(
      collectNodeMinimumProvisionalEvidence(ports({ observeWorkflowArtifactBytes: () => foreign }))
        .failures,
    ).toContain("HIL_NODE_WORKFLOW_UNVERIFIED");

    const unknownField = workflowBytes();
    unknownField[0] = Buffer.from(
      JSON.stringify({
        workflow_id: "build",
        authority_head: HEAD,
        authority_tree: TREE,
        green: true,
        cutover_authority: true,
      }),
    );
    expect(
      collectNodeMinimumProvisionalEvidence(
        ports({ observeWorkflowArtifactBytes: () => unknownField }),
      ).status,
    ).toBe("blocked");
  });

  it("U-NMIN-004: authority/toolchain/lock/tree/SQLite/artifactの各独立driftをblockedにする", () => {
    const mutations: Array<Partial<NodeMinimumObservationPorts>> = [
      { observeRepository: () => ({ head: "d".repeat(40), tree: TREE }) },
      { observeRepository: () => ({ head: HEAD, tree: "d".repeat(40) }) },
      {
        observeToolchain: () => ({
          runtimeId: "other",
          nodeVersion: "24.15.0",
          npmVersion: "11.12.1",
        }),
      },
      {
        observeToolchain: () => ({
          runtimeId: "node",
          nodeVersion: "24.15.1",
          npmVersion: "11.12.1",
        }),
      },
      {
        observeToolchain: () => ({
          runtimeId: "node",
          nodeVersion: "24.15.0",
          npmVersion: "11.12.0",
        }),
      },
      {
        observeLockBytes: () => ({
          lockBytes: Buffer.from("drift"),
          installedTreeBytes: INSTALLED,
        }),
      },
      { observeLockBytes: () => ({ lockBytes: LOCK, installedTreeBytes: Buffer.from("drift") }) },
      { observeSqlite: () => ({ api: "other", version: "3.50.4", compileOptions }) },
      { observeSqlite: () => ({ api: "node:sqlite", version: "3.50.5", compileOptions }) },
      {
        observeSqlite: () => ({ api: "node:sqlite", version: "3.50.4", compileOptions: ["DRIFT"] }),
      },
      { observeArtifactBytes: () => Buffer.from("drift") },
    ];
    for (const [index, mutation] of mutations.entries()) {
      const result = collectNodeMinimumProvisionalEvidence(ports(mutation));
      expect(result.status).toBe("blocked");
      expect(result.failures).toContain(
        index < 2 ? "HIL_NODE_WORKFLOW_UNVERIFIED" : "HIL_NODE_AUTHORITY_BINDING_INVALID",
      );
    }
  });

  it("passing receiptをdigest名でcreate-new保存しoverwrite/replayを拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-node-minimum-receipt-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: root });
      execFileSync(
        "git",
        [
          "-c",
          "user.name=HELIX",
          "-c",
          "user.email=helix@example.invalid",
          "commit",
          "--allow-empty",
          "-qm",
          "seed",
        ],
        { cwd: root },
      );
      const repository = {
        head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
        tree: execFileSync("git", ["rev-parse", "HEAD^{tree}"], {
          cwd: root,
          encoding: "utf8",
        }).trim(),
      };
      const receipt = collectNodeMinimumProvisionalEvidence(
        ports({
          observeRepository: () => repository,
          observeWorkflowArtifactBytes: () =>
            workflowBytes().map((bytes) =>
              Buffer.from(
                bytes
                  .toString("utf8")
                  .replaceAll(HEAD, repository.head)
                  .replaceAll(TREE, repository.tree),
              ),
            ),
        }),
      );
      const path = persistNodeMinimumProvisionalReceipt(root, receipt);
      expect(path).toBe(`.helix/evidence/node-minimum/${receipt.receipt_digest}.json`);
      expect(existsSync(join(root, path))).toBe(true);
      expect(JSON.parse(readFileSync(join(root, path), "utf8"))).toMatchObject({
        receipt_digest: receipt.receipt_digest,
        terminal: false,
      });
      expect(() => persistNodeMinimumProvisionalReceipt(root, receipt)).toThrow();
      expect(readFileSync(join(root, path), "utf8")).toContain(receipt.receipt_digest);
      expect(() =>
        persistNodeMinimumProvisionalReceipt(root, {
          ...receipt,
          authority_binding: { ...receipt.authority_binding, npm_version: "0.0.0" },
        }),
      ).toThrow(/digest/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("receipt保存時の.helix symlink escapeを拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-node-minimum-escape-"));
    const outside = mkdtempSync(join(tmpdir(), "helix-node-minimum-outside-"));
    try {
      symlinkSync(outside, join(root, ".helix"), "dir");
      execFileSync("git", ["init", "-q"], { cwd: root });
      execFileSync(
        "git",
        [
          "-c",
          "user.name=HELIX",
          "-c",
          "user.email=helix@example.invalid",
          "commit",
          "--allow-empty",
          "-qm",
          "seed",
        ],
        { cwd: root },
      );
      const repository = {
        head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
        tree: execFileSync("git", ["rev-parse", "HEAD^{tree}"], {
          cwd: root,
          encoding: "utf8",
        }).trim(),
      };
      const receipt = collectNodeMinimumProvisionalEvidence(
        ports({
          observeRepository: () => repository,
          observeWorkflowArtifactBytes: () =>
            workflowBytes().map((bytes) =>
              Buffer.from(
                bytes
                  .toString("utf8")
                  .replaceAll(HEAD, repository.head)
                  .replaceAll(TREE, repository.tree),
              ),
            ),
        }),
      );
      expect(() => persistNodeMinimumProvisionalReceipt(root, receipt)).toThrow(/symlink/);
      expect(existsSync(join(outside, "evidence"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it("frozen expectation artifactの未知fieldを拒否する", () => {
    const value = JSON.parse(expectationBytes().toString("utf8"));
    expect(
      collectNodeMinimumProvisionalEvidence(
        ports({
          observeExpectationArtifactBytes: () =>
            Buffer.from(JSON.stringify({ ...value, cutover_authority: true })),
        }),
      ).status,
    ).toBe("blocked");
  });

  it("中間evidence symlinkを外部変更前に拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-node-minimum-middle-"));
    const outside = mkdtempSync(join(tmpdir(), "helix-node-minimum-middle-outside-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: root });
      execFileSync(
        "git",
        [
          "-c",
          "user.name=HELIX",
          "-c",
          "user.email=helix@example.invalid",
          "commit",
          "--allow-empty",
          "-qm",
          "seed",
        ],
        { cwd: root },
      );
      const repository = {
        head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
        tree: execFileSync("git", ["rev-parse", "HEAD^{tree}"], {
          cwd: root,
          encoding: "utf8",
        }).trim(),
      };
      mkdirSync(join(root, ".helix"));
      symlinkSync(outside, join(root, ".helix", "evidence"), "dir");
      const receipt = collectNodeMinimumProvisionalEvidence(
        ports({
          observeRepository: () => repository,
          observeWorkflowArtifactBytes: () =>
            workflowBytes().map((bytes) =>
              Buffer.from(
                bytes
                  .toString("utf8")
                  .replaceAll(HEAD, repository.head)
                  .replaceAll(TREE, repository.tree),
              ),
            ),
        }),
      );
      expect(() => persistNodeMinimumProvisionalReceipt(root, receipt)).toThrow(/symlink/);
      expect(existsSync(join(outside, "node-minimum"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it("production portはGit HEAD内のcanonical expectationだけを読む", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-node-minimum-expectation-"));
    try {
      mkdirSync(join(root, "docs", "evidence"), { recursive: true });
      writeFileSync(
        join(root, "docs", "evidence", "node-minimum-expectation.json"),
        expectationBytes(),
      );
      for (const path of ["lock", "tree", "artifact"]) writeFileSync(join(root, path), path);
      execFileSync("git", ["init", "-q"], { cwd: root });
      execFileSync("git", ["add", "docs/evidence/node-minimum-expectation.json"], { cwd: root });
      execFileSync(
        "git",
        [
          "-c",
          "user.name=HELIX",
          "-c",
          "user.email=helix@example.invalid",
          "commit",
          "-qm",
          "expectation",
        ],
        { cwd: root },
      );
      const production = createLocalNodeMinimumObservationPorts({
        repoRoot: root,
        lockPath: "lock",
        installedTreePath: "tree",
        artifactPath: "artifact",
        workflowEvidencePaths: [],
      });
      expect(production.observeExpectationArtifactBytes()).toEqual(expectationBytes());
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
