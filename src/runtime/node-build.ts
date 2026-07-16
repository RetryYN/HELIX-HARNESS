import { type SpawnSyncReturns, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename, isAbsolute, relative, resolve, sep } from "node:path";

export interface NodeCommandObservation {
  executable_id: "node";
  argv_digest: string;
  exit_code: number | null;
  signal: string | null;
  stdout_digest: string;
  stderr_digest: string;
}

export interface NodeBuildAdapterRequest {
  repo_root: string;
  snapshot_digest: string;
  build_module_path: string;
  build_args: string[];
  entry_path: string;
  output_path: string;
  node_executable?: string;
}

export interface NodeBuildAdapterEvidence {
  schema_version: "helix-node-build-adapter-evidence.v1";
  snapshot_digest: string;
  build_module_path: string;
  entry_path: string;
  output_path: string;
  command: NodeCommandObservation;
  artifact_exists: boolean;
  artifact_digest: string | null;
  evidence_digest: string;
}

export interface NodeArtifactEvidenceRequest {
  repo_root: string;
  snapshot_digest: string;
  artifact_path: string;
  bin_target_path: string;
  source_module_path: string;
  source_args?: string[];
  artifact_args?: string[];
  node_executable?: string;
}

export interface NodeArtifactAdapterEvidence {
  schema_version: "helix-node-artifact-adapter-evidence.v1";
  snapshot_digest: string;
  artifact_path: string;
  artifact_digest: string;
  source_module_path: string;
  source_oracle: NodeCommandObservation;
  artifact_observation: NodeCommandObservation;
  shebang_valid: boolean;
  bin_mapping_valid: boolean;
  esm_artifact_observed: boolean;
  embedded_bun_marker_count: number;
  source_parity: boolean;
  source_parity_digest: string;
  evidence_digest: string;
}

export interface NodeBuildAdapterDeps {
  spawn?: typeof spawnSync;
  readFile?: (path: string) => Buffer;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function requireRelativePath(repoRoot: string, candidate: string, field: string): string {
  if (!candidate || isAbsolute(candidate) || candidate.includes("\0")) {
    throw new Error(`${field} must be a non-empty repo-relative path`);
  }
  const root = resolve(repoRoot);
  const absolute = resolve(root, candidate);
  if (absolute !== root && !absolute.startsWith(`${root}${sep}`)) {
    throw new Error(`${field} escapes repo root`);
  }
  return absolute;
}

function requireNodeExecutable(executable: string): void {
  const name = basename(executable).toLowerCase();
  if (name !== "node" && name !== "node.exe") {
    throw new Error("node build adapter refuses non-Node executables");
  }
}

function observeCommand(
  executable: string,
  args: string[],
  cwd: string,
  runner: typeof spawnSync,
  semanticArgs: string[] = args,
): NodeCommandObservation {
  requireNodeExecutable(executable);
  const result = runner(executable, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    env: { ...process.env },
  }) as SpawnSyncReturns<string>;
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  return {
    executable_id: "node",
    argv_digest: sha256(canonical(semanticArgs)),
    exit_code: result.status,
    signal: result.signal,
    stdout_digest: sha256(stdout),
    stderr_digest: sha256(stderr),
  };
}

function pathForEvidence(repoRoot: string, absolute: string): string {
  return relative(resolve(repoRoot), absolute).split(sep).join("/");
}

export function runNodeBuildAdapter(
  request: NodeBuildAdapterRequest,
  deps: NodeBuildAdapterDeps = {},
): NodeBuildAdapterEvidence {
  const runner = deps.spawn ?? spawnSync;
  const reader = deps.readFile ?? ((path) => readFileSync(path));
  const buildModule = requireRelativePath(
    request.repo_root,
    request.build_module_path,
    "build_module_path",
  );
  const entry = requireRelativePath(request.repo_root, request.entry_path, "entry_path");
  const output = requireRelativePath(request.repo_root, request.output_path, "output_path");
  const executable = request.node_executable ?? process.execPath;
  const args = [buildModule, ...request.build_args];
  const command = observeCommand(executable, args, resolve(request.repo_root), runner, [
    pathForEvidence(request.repo_root, buildModule),
    ...request.build_args,
  ]);
  let artifact: Buffer | null = null;
  try {
    artifact = reader(output);
  } catch {
    artifact = null;
  }
  const semantic = {
    schema_version: "helix-node-build-adapter-evidence.v1" as const,
    snapshot_digest: request.snapshot_digest,
    build_module_path: pathForEvidence(request.repo_root, buildModule),
    entry_path: pathForEvidence(request.repo_root, entry),
    output_path: pathForEvidence(request.repo_root, output),
    command,
    artifact_exists: artifact !== null,
    artifact_digest: artifact ? sha256(artifact) : null,
  };
  return { ...semantic, evidence_digest: sha256(canonical(semantic)) };
}

export function collectNodeArtifactEvidence(
  request: NodeArtifactEvidenceRequest,
  deps: NodeBuildAdapterDeps = {},
): NodeArtifactAdapterEvidence {
  const runner = deps.spawn ?? spawnSync;
  const reader = deps.readFile ?? ((path) => readFileSync(path));
  const artifactPath = requireRelativePath(
    request.repo_root,
    request.artifact_path,
    "artifact_path",
  );
  const binTarget = requireRelativePath(
    request.repo_root,
    request.bin_target_path,
    "bin_target_path",
  );
  const sourceModule = requireRelativePath(
    request.repo_root,
    request.source_module_path,
    "source_module_path",
  );
  const executable = request.node_executable ?? process.execPath;
  const artifact = reader(artifactPath);
  const text = artifact.toString("utf8");
  const sourceOracle = observeCommand(
    executable,
    [sourceModule, ...(request.source_args ?? [])],
    resolve(request.repo_root),
    runner,
    [pathForEvidence(request.repo_root, sourceModule), ...(request.source_args ?? [])],
  );
  const artifactObservation = observeCommand(
    executable,
    [artifactPath, ...(request.artifact_args ?? request.source_args ?? [])],
    resolve(request.repo_root),
    runner,
    [
      pathForEvidence(request.repo_root, artifactPath),
      ...(request.artifact_args ?? request.source_args ?? []),
    ],
  );
  const parityTuple = (value: NodeCommandObservation) => ({
    exit_code: value.exit_code,
    signal: value.signal,
    stdout_digest: value.stdout_digest,
    stderr_digest: value.stderr_digest,
  });
  const sourceParity =
    canonical(parityTuple(sourceOracle)) === canonical(parityTuple(artifactObservation));
  const bunMarkers = text.match(/(?:\bBun\b|bun:sqlite|#!.*\bbun\b)/g) ?? [];
  const semantic = {
    schema_version: "helix-node-artifact-adapter-evidence.v1" as const,
    snapshot_digest: request.snapshot_digest,
    artifact_path: pathForEvidence(request.repo_root, artifactPath),
    artifact_digest: sha256(artifact),
    source_module_path: pathForEvidence(request.repo_root, sourceModule),
    source_oracle: sourceOracle,
    artifact_observation: artifactObservation,
    shebang_valid: text.startsWith("#!/usr/bin/env node\n") || text.startsWith("#!/usr/bin/node\n"),
    bin_mapping_valid: binTarget === artifactPath,
    esm_artifact_observed:
      /(?:^|\n)\s*(?:import\s|export\s)/m.test(text) &&
      !/(?:\bmodule\.exports\b|\brequire\s*\()/.test(text),
    embedded_bun_marker_count: bunMarkers.length,
    source_parity: sourceParity,
    source_parity_digest: sha256(
      canonical({ source: parityTuple(sourceOracle), artifact: parityTuple(artifactObservation) }),
    ),
  };
  return { ...semantic, evidence_digest: sha256(canonical(semantic)) };
}
