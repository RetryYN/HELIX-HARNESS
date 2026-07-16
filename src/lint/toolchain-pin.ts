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
  bunEngine?: string;
  nodeEngine?: string;
  packageManager?: string;
  violations: ToolchainPinViolation[];
  ok: boolean;
}

type PackageJson = {
  engines?: { bun?: string; node?: string };
  packageManager?: string;
};

const WORKFLOW_DIRS = [".github/workflows", "docs/templates/github/common"] as const;

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
  const lockfiles = ["package-lock.json", "bun.lock", "bun.lockb"].filter((path) =>
    existsSync(join(root, path)),
  );
  return {
    packageJson: readIfExists(root, "package.json"),
    lockfiles,
    workflowFiles: collectWorkflowFiles(root),
  };
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
      message: "package.json engines.node must declare the Node 24 runtime range.",
    };
  }
  if (!/(?:^|[<>=~^ ])\d+\.\d+(?:\.\d+)?/.test(engine) || /\b(?:latest|\*)\b/i.test(engine)) {
    return {
      path: "package.json",
      rule: "node-engine-unpinned",
      message: "engines.node must be a concrete semver range, not latest or wildcard.",
    };
  }
  if (!/>=\s*24\.15\.0/.test(engine) || !/<\s*25/.test(engine)) {
    return {
      path: "package.json",
      rule: "node-engine-range-mismatch",
      message: "engines.node must enforce >=24.15.0 <25 for the Node Minimum gate.",
    };
  }
  return null;
}

function packageManagerViolation(value: string | undefined): ToolchainPinViolation | null {
  if (/^npm@\d+\.\d+\.\d+$/.test(value ?? "")) return null;
  return {
    path: "package.json",
    rule: "npm-version-unpinned",
    message: "packageManager must pin an exact npm version.",
  };
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

function firstNodeVersion(steps: Array<Record<string, unknown>>): string | undefined {
  for (const step of steps) {
    if (step.uses !== "actions/setup-node@v4") continue;
    const withBlock = step.with;
    if (!withBlock || typeof withBlock !== "object") return undefined;
    const version = (withBlock as Record<string, unknown>)["node-version"];
    return typeof version === "string" ? version : undefined;
  }
  return undefined;
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
  const runCommands = steps.flatMap((step) => (typeof step.run === "string" ? [step.run] : []));
  for (const command of runCommands) {
    if (/\bnpm\s+install\b/.test(command) && !/\bnpm\s+ci\b/.test(command)) {
      violations.push({
        path: doc.path,
        rule: "npm-install-not-frozen",
        message: "workflow installs must use `npm ci` rather than `npm install`.",
      });
    }
  }

  const sourceHarnessCheck = doc.path === ".github/workflows/harness-check.yml";
  if (sourceHarnessCheck) {
    const workflowVersion = firstNodeVersion(steps);
    const floor = nodeEngineFloor(engine);
    if (!workflowVersion) {
      violations.push({
        path: doc.path,
        rule: "source-harness-check-node-version-missing",
        message: "source harness-check must pin setup-node node-version.",
      });
    } else if (floor && majorMinor(workflowVersion) !== majorMinor(floor)) {
      violations.push({
        path: doc.path,
        rule: "source-harness-check-node-version-mismatch",
        message: `source harness-check node-version (${workflowVersion}) must match engines.node floor (${floor}).`,
      });
    }
  }

  return violations;
}

export function analyzeToolchainPin(input: ToolchainPinInput): ToolchainPinResult {
  const violations: ToolchainPinViolation[] = [];
  const parsedPackage = parsePackageJson(input.packageJson);
  if (parsedPackage.violation) violations.push(parsedPackage.violation);
  const bunEngine = parsedPackage.pkg?.engines?.bun;
  const nodeEngine = parsedPackage.pkg?.engines?.node;
  const packageManager = parsedPackage.pkg?.packageManager;
  const engineViolation = pinnedNodeEngineViolation(nodeEngine);
  if (engineViolation) violations.push(engineViolation);
  const managerViolation = packageManagerViolation(packageManager);
  if (managerViolation) violations.push(managerViolation);

  if (!input.lockfiles.includes("package-lock.json")) {
    violations.push({
      path: "package-lock.json",
      rule: "node-lockfile-missing",
      message: "source package must commit package-lock.json for npm ci.",
    });
  }

  for (const doc of input.workflowFiles) {
    violations.push(...workflowViolations(doc, nodeEngine));
  }

  return {
    checkedWorkflows: input.workflowFiles.length,
    lockfiles: input.lockfiles,
    bunEngine,
    nodeEngine,
    packageManager,
    violations,
    ok: violations.length === 0,
  };
}

export function toolchainPinMessages(result: ToolchainPinResult): string[] {
  if (result.ok) {
    return [
      `toolchain-pin - OK (node=${result.nodeEngine ?? "unknown"}, npm=${result.packageManager ?? "unknown"}, rollback-bun=${result.bunEngine ?? "none"}, lockfiles=${result.lockfiles.join("|")}, workflows=${result.checkedWorkflows}, frozen install=true)`,
    ];
  }
  const sample = result.violations
    .slice(0, 6)
    .map((violation) => `${violation.path}:${violation.rule}`)
    .join(", ");
  return [`toolchain-pin - violation: ${result.violations.length}件 (${sample})`];
}
