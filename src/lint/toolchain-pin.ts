import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { normalizePath } from "./shared";

export interface ToolchainPinFile {
  path: string;
  text: string;
}

export interface ToolchainPinInput {
  packageJson?: ToolchainPinFile;
  actionRegistry?: ToolchainPinFile;
  lockfiles: string[];
  workflowFiles: ToolchainPinFile[];
}

export interface ToolchainPinViolation {
  path: string;
  rule: string;
  message: string;
}

export interface ToolchainPinResult {
  checkedWorkflows: number;
  lockfiles: string[];
  nodeEngine?: string;
  violations: ToolchainPinViolation[];
  ok: boolean;
}

type PackageJson = {
  engines?: { node?: string };
};

interface GithubActionRegistryEntry {
  action: string;
  release: string;
  commit_sha: string;
  source_url: string;
}

interface GithubActionRegistry {
  schema_version: "helix-github-action-immutable-ref-registry.v1";
  registry_version: string;
  verified_at: string;
  entries: GithubActionRegistryEntry[];
}

const WORKFLOW_DIRS = [".github/workflows", "docs/templates/github/common"] as const;
const SETUP_NODE_ACTION_PATTERN = /^actions\/setup-node(?:@.*)?$/u;
const ACTION_ID = /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/u;
const ACTION_RELEASE = /^v[1-9][0-9]*$/u;
const COMMIT_SHA = /^[a-f0-9]{40}$/u;
const REGISTRY_VERSION = /^\d+\.\d+\.\d+$/u;
const IMMUTABLE_ACTION_REF = /^(?<action>[a-z0-9_.-]+\/[a-z0-9_.-]+)@(?<sha>[a-f0-9]{40})$/u;

function readIfExists(root: string, path: string): ToolchainPinFile | undefined {
  const full = join(root, path);
  if (!existsSync(full)) return undefined;
  return { path, text: readFileSync(full, "utf8") };
}

function collectWorkflowFiles(root: string): ToolchainPinFile[] {
  const files: ToolchainPinFile[] = [];
  for (const dir of WORKFLOW_DIRS) {
    const fullDir = join(root, dir);
    if (!existsSync(fullDir)) continue;
    for (const entry of readdirSync(fullDir, { withFileTypes: true })) {
      if (!entry.isFile() || !/\.ya?ml$/.test(entry.name)) continue;
      const path = normalizePath(join(dir, entry.name));
      files.push({ path, text: readFileSync(join(root, path), "utf8") });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export function loadToolchainPinInput(root = process.cwd()): ToolchainPinInput {
  const lockfiles = ["package-lock.json"].filter((path) => existsSync(join(root, path)));
  return {
    packageJson: readIfExists(root, "package.json"),
    actionRegistry: readIfExists(root, "config/github-action-immutable-ref-registry.json"),
    lockfiles,
    workflowFiles: collectWorkflowFiles(root),
  };
}

function parseActionRegistry(doc: ToolchainPinFile | undefined): {
  entries: Map<string, GithubActionRegistryEntry>;
  violations: ToolchainPinViolation[];
} {
  const path = doc?.path ?? "config/github-action-immutable-ref-registry.json";
  const violations: ToolchainPinViolation[] = [];
  if (!doc) {
    return {
      entries: new Map(),
      violations: [
        {
          path,
          rule: "github-action-registry-missing",
          message: "immutable GitHub Action ref registry is required.",
        },
      ],
    };
  }
  let value: unknown;
  try {
    value = JSON.parse(doc.text);
  } catch {
    return {
      entries: new Map(),
      violations: [
        {
          path,
          rule: "github-action-registry-invalid",
          message: "immutable GitHub Action ref registry must be valid JSON.",
        },
      ],
    };
  }
  const registry = value as Partial<GithubActionRegistry>;
  if (
    registry.schema_version !== "helix-github-action-immutable-ref-registry.v1" ||
    typeof registry.registry_version !== "string" ||
    !REGISTRY_VERSION.test(registry.registry_version) ||
    typeof registry.verified_at !== "string" ||
    !Number.isFinite(Date.parse(registry.verified_at)) ||
    !Array.isArray(registry.entries)
  ) {
    violations.push({
      path,
      rule: "github-action-registry-schema-invalid",
      message: "immutable GitHub Action ref registry metadata is invalid.",
    });
    return { entries: new Map(), violations };
  }
  const entries = new Map<string, GithubActionRegistryEntry>();
  for (const candidate of registry.entries) {
    if (
      !candidate ||
      typeof candidate !== "object" ||
      !ACTION_ID.test(String(candidate.action)) ||
      !ACTION_RELEASE.test(String(candidate.release)) ||
      !COMMIT_SHA.test(String(candidate.commit_sha)) ||
      !String(candidate.source_url).startsWith("https://api.github.com/repos/") ||
      !String(candidate.source_url).endsWith(String(candidate.commit_sha))
    ) {
      violations.push({
        path,
        rule: "github-action-registry-entry-invalid",
        message:
          "each GitHub Action registry entry must bind action, release, full SHA, and source URL.",
      });
      continue;
    }
    if (entries.has(candidate.action)) {
      violations.push({
        path,
        rule: "github-action-registry-entry-duplicate",
        message: `GitHub Action registry contains duplicate action identity (${candidate.action}).`,
      });
      continue;
    }
    entries.set(candidate.action, candidate as GithubActionRegistryEntry);
  }
  if (entries.size === 0) {
    violations.push({
      path,
      rule: "github-action-registry-empty",
      message: "immutable GitHub Action ref registry must contain at least one action.",
    });
  }
  return { entries, violations };
}

function parsePackageJson(doc: ToolchainPinFile | undefined): {
  pkg?: PackageJson;
  violation?: ToolchainPinViolation;
} {
  if (!doc) {
    return {
      violation: {
        path: "package.json",
        rule: "package-json-missing",
        message: "toolchain pinning requires package.json.",
      },
    };
  }
  try {
    return { pkg: JSON.parse(doc.text) as PackageJson };
  } catch {
    return {
      violation: {
        path: doc.path,
        rule: "package-json-invalid",
        message: "package.json must be readable JSON for toolchain pinning.",
      },
    };
  }
}

function pinnedNodeEngineViolation(engine: string | undefined): ToolchainPinViolation | null {
  if (!engine) {
    return {
      path: "package.json",
      rule: "node-engine-missing",
      message: "package.json engines.node must declare the Node.js runtime floor.",
    };
  }
  if (!/(?:^|[<>=~^ ])\d+\.\d+(?:\.\d+)?/.test(engine) || /\b(?:latest|\*)\b/i.test(engine)) {
    return {
      path: "package.json",
      rule: "node-engine-unpinned",
      message: "engines.node must be a concrete semver range, not latest or wildcard.",
    };
  }
  return null;
}

function yamlDoc(doc: ToolchainPinFile): unknown | null {
  try {
    return parseYaml(doc.text);
  } catch {
    return null;
  }
}

function collectWorkflowSteps(parsed: unknown): Array<Record<string, unknown>> {
  if (!parsed || typeof parsed !== "object") return [];
  const jobs = (parsed as { jobs?: unknown }).jobs;
  if (!jobs || typeof jobs !== "object") return [];
  const steps: Array<Record<string, unknown>> = [];
  for (const job of Object.values(jobs as Record<string, unknown>)) {
    if (!job || typeof job !== "object") continue;
    const rawSteps = (job as { steps?: unknown }).steps;
    if (!Array.isArray(rawSteps)) continue;
    for (const step of rawSteps) {
      if (step && typeof step === "object") steps.push(step as Record<string, unknown>);
    }
  }
  return steps;
}

function inspectSourceSetupNode(
  steps: Array<Record<string, unknown>>,
  registry: ReadonlyMap<string, GithubActionRegistryEntry>,
): {
  nodeVersions: Array<string | undefined>;
  unsupportedRef?: string;
} {
  const setupNodeSteps = steps.filter(
    (step) => typeof step.uses === "string" && SETUP_NODE_ACTION_PATTERN.test(step.uses),
  );
  const expected = registry.get("actions/setup-node");
  const expectedRef = expected ? `${expected.action}@${expected.commit_sha}` : null;
  const unsupported = setupNodeSteps.find((step) => String(step.uses) !== expectedRef);
  return {
    ...(unsupported ? { unsupportedRef: String(unsupported.uses) } : {}),
    nodeVersions: setupNodeSteps
      .filter((step) => String(step.uses) === expectedRef)
      .map((step) => {
        const withBlock = step.with;
        if (!withBlock || typeof withBlock !== "object") return undefined;
        const version = (withBlock as Record<string, unknown>)["node-version"];
        return typeof version === "string" ? version : undefined;
      }),
  };
}

function nodeEngineFloor(engine: string | undefined): string | undefined {
  return engine?.match(/\d+\.\d+(?:\.\d+)?/)?.[0];
}

function majorMinor(version: string): string {
  const match = version.match(/^(\d+)\.(\d+)/);
  return match ? `${match[1]}.${match[2]}` : version;
}

function workflowViolations(
  doc: ToolchainPinFile,
  engine: string | undefined,
  registry: ReadonlyMap<string, GithubActionRegistryEntry>,
): ToolchainPinViolation[] {
  const parsed = yamlDoc(doc);
  if (!parsed) {
    return [
      {
        path: doc.path,
        rule: "workflow-yaml-invalid",
        message: "workflow YAML must parse before toolchain install commands are trusted.",
      },
    ];
  }
  const steps = collectWorkflowSteps(parsed);
  const violations: ToolchainPinViolation[] = [];
  for (const step of steps) {
    if (typeof step.uses !== "string" || step.uses.startsWith("./")) continue;
    const match = IMMUTABLE_ACTION_REF.exec(step.uses);
    if (!match?.groups) {
      violations.push({
        path: doc.path,
        rule: "github-action-ref-mutable",
        message: `GitHub Action ref (${step.uses}) must use a full 40-character commit SHA.`,
      });
      continue;
    }
    const expected = registry.get(match.groups.action);
    if (!expected) {
      violations.push({
        path: doc.path,
        rule: "github-action-identity-unknown",
        message: `GitHub Action identity (${match.groups.action}) is not in the immutable ref registry.`,
      });
    } else if (expected.commit_sha !== match.groups.sha) {
      violations.push({
        path: doc.path,
        rule: "github-action-ref-registry-mismatch",
        message: `GitHub Action ref (${match.groups.action}) does not match the registry SHA.`,
      });
    }
  }
  const runCommands = steps.flatMap((step) => (typeof step.run === "string" ? [step.run] : []));
  for (const command of runCommands) {
    if (/\bnpm\s+install\b/.test(command) && !/\bnpm\s+ci\b/.test(command)) {
      violations.push({
        path: doc.path,
        rule: "npm-install-not-clean",
        message: "workflow npm install commands must use `npm ci`.",
      });
    }
  }

  const sourceHarnessCheck = doc.path === ".github/workflows/harness-check.yml";
  if (sourceHarnessCheck) {
    const setupNode = inspectSourceSetupNode(steps, registry);
    const floor = nodeEngineFloor(engine);
    if (setupNode.unsupportedRef) {
      violations.push({
        path: doc.path,
        rule: "source-harness-check-setup-node-ref-unsupported",
        message: `source harness-check setup-node ref (${setupNode.unsupportedRef}) must match the immutable registry SHA.`,
      });
    } else if (
      setupNode.nodeVersions.length === 0 ||
      setupNode.nodeVersions.some((version) => !version)
    ) {
      violations.push({
        path: doc.path,
        rule: "source-harness-check-node-version-missing",
        message: "source harness-check must pin setup-node node-version.",
      });
    } else {
      const mismatchedVersion = floor
        ? setupNode.nodeVersions.find(
            (version) => version && majorMinor(version) !== majorMinor(floor),
          )
        : undefined;
      if (!mismatchedVersion) return violations;
      violations.push({
        path: doc.path,
        rule: "source-harness-check-node-version-mismatch",
        message: `source harness-check node-version (${mismatchedVersion}) must match engines.node floor (${floor}).`,
      });
    }
  }

  return violations;
}

export function analyzeToolchainPin(input: ToolchainPinInput): ToolchainPinResult {
  const violations: ToolchainPinViolation[] = [];
  const actionRegistry = parseActionRegistry(input.actionRegistry);
  violations.push(...actionRegistry.violations);
  const parsedPackage = parsePackageJson(input.packageJson);
  if (parsedPackage.violation) violations.push(parsedPackage.violation);
  const nodeEngine = parsedPackage.pkg?.engines?.node;
  const engineViolation = pinnedNodeEngineViolation(nodeEngine);
  if (engineViolation) violations.push(engineViolation);

  if (input.lockfiles.length === 0) {
    violations.push({
      path: "package-lock.json",
      rule: "node-lockfile-missing",
      message: "source package must commit package-lock.json for frozen CI installs.",
    });
  }

  for (const doc of input.workflowFiles) {
    violations.push(...workflowViolations(doc, nodeEngine, actionRegistry.entries));
  }

  return {
    checkedWorkflows: input.workflowFiles.length,
    lockfiles: input.lockfiles,
    nodeEngine,
    violations,
    ok: violations.length === 0,
  };
}

export function toolchainPinMessages(result: ToolchainPinResult): string[] {
  if (result.ok) {
    return [
      `toolchain-pin - OK (node=${result.nodeEngine ?? "unknown"}, lockfiles=${result.lockfiles.join("|")}, workflows=${result.checkedWorkflows}, frozen install=true)`,
    ];
  }
  const sample = result.violations
    .slice(0, 6)
    .map((violation) => `${violation.path}:${violation.rule}`)
    .join(", ");
  return [`toolchain-pin - violation: ${result.violations.length}件 (${sample})`];
}
