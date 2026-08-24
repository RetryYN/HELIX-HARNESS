import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import {
  PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA,
  type ProjectHookAuthorityInputV1,
} from "./project-hook-authority";

const SOURCE_PATHS = {
  hooks_config_digest: ".codex/hooks.json",
  agent_guard_digest: "src/runtime/agent-guard.ts",
  worker_policy_digest: "src/runtime/codex-native-worker-policy.ts",
} as const;

export interface ProjectHookPhysicalAdapterDeps {
  platform: NodeJS.Platform;
  realpath(path: string): string;
  stat(path: string): { dev: number | bigint; ino: number | bigint };
  readFile(path: string): Buffer;
  git(root: string, args: readonly string[]): string;
}

export interface ProjectHookCaptureRequest {
  execution_root: string;
  loader_root: string;
  session_project_root: string;
  current_authority_root: string;
  assignment_binding: ProjectHookAuthorityInputV1["assignment_binding"];
  candidate_base_head: string;
  current_authority_head: string;
  captured_at: string;
  lifecycle_policy: ProjectHookAuthorityInputV1["lifecycle_policy"];
}

export class UnsupportedPhysicalIdentityError extends Error {
  readonly code = "unsupported_physical_identity" as const;
}

export const nodeProjectHookPhysicalAdapterDeps: ProjectHookPhysicalAdapterDeps = {
  platform: process.platform,
  realpath: (path) => realpathSync.native(path),
  stat: (path) => statSync(path, { bigint: true }),
  readFile: (path) => readFileSync(path),
  git: (root, args) =>
    execFileSync("git", [...args], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim(),
};

function sha256(bytes: Buffer): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function normalizePhysicalStatIdentity(value: unknown, field: "device" | "inode"): string {
  const valid =
    (typeof value === "bigint" && value >= 0n && (field !== "inode" || value > 0n)) ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= 0 &&
      (field !== "inode" || value > 0));
  if (!valid) {
    throw new UnsupportedPhysicalIdentityError(`invalid ${field} evidence`);
  }
  return String(value);
}

function repositoryIdentity(root: string, deps: ProjectHookPhysicalAdapterDeps) {
  if (deps.platform !== "linux" && deps.platform !== "darwin") {
    throw new UnsupportedPhysicalIdentityError(`unsupported platform: ${deps.platform}`);
  }
  const canonical = deps.realpath(root);
  const commonRaw = deps.git(canonical, ["rev-parse", "--git-common-dir"]);
  const commonPath = isAbsolute(commonRaw) ? commonRaw : resolve(canonical, commonRaw);
  const common = deps.realpath(commonPath);
  const stat = deps.stat(common);
  const deviceId = normalizePhysicalStatIdentity(stat.dev, "device");
  const fileId = normalizePhysicalStatIdentity(stat.ino, "inode");
  return {
    lexical_path: root,
    canonical_realpath: canonical,
    repository_common_dir: common,
    filesystem_identity: {
      platform: deps.platform,
      device_id: deviceId,
      file_id: fileId,
      evidence_kind: "stat" as const,
    },
  };
}

function sourceMaterial(root: string, deps: ProjectHookPhysicalAdapterDeps) {
  return {
    hooks_config_digest: sha256(deps.readFile(resolve(root, SOURCE_PATHS.hooks_config_digest))),
    agent_guard_digest: sha256(deps.readFile(resolve(root, SOURCE_PATHS.agent_guard_digest))),
    worker_policy_digest: sha256(deps.readFile(resolve(root, SOURCE_PATHS.worker_policy_digest))),
  };
}

export function captureProjectHookAuthorityInput(
  request: ProjectHookCaptureRequest,
  deps: ProjectHookPhysicalAdapterDeps = nodeProjectHookPhysicalAdapterDeps,
): ProjectHookAuthorityInputV1 {
  const executionRoot = repositoryIdentity(request.execution_root, deps);
  const loaderRoot = repositoryIdentity(request.loader_root, deps);
  const sessionRoot = repositoryIdentity(request.session_project_root, deps);
  const currentAuthorityRoot = deps.realpath(request.current_authority_root);
  return {
    schema_version: PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA,
    execution_root: executionRoot,
    loader_root: loaderRoot,
    session_project_root: sessionRoot,
    assignment_binding: structuredClone(request.assignment_binding),
    repository_head: deps.git(executionRoot.canonical_realpath, ["rev-parse", "HEAD"]),
    candidate_base_head: request.candidate_base_head,
    current_authority_head: request.current_authority_head,
    source_material: sourceMaterial(executionRoot.canonical_realpath, deps),
    current_authority_source_material: sourceMaterial(currentAuthorityRoot, deps),
    physical_evidence: {
      captured_at: request.captured_at,
      capture_source: "node-stat",
    },
    lifecycle_policy: structuredClone(request.lifecycle_policy),
  };
}
