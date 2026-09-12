export type PythonRuntimeBuildMode = "disabled" | "enabled";

export interface PythonRuntimeToolchainEntry {
  python_version: string;
  implementation: "cpython";
  free_threaded: PythonRuntimeBuildMode;
  jit: PythonRuntimeBuildMode;
}

export type PythonRuntimeToolchainResolution =
  | { ok: true; value: PythonRuntimeToolchainEntry }
  | {
      ok: false;
      reason:
        | "PYTHON_RUNTIME_IDENTITY_NOT_FOUND"
        | "PYTHON_RUNTIME_IDENTITY_AMBIGUOUS"
        | "PYTHON_RUNTIME_EXPERIMENTAL_MODE_MISMATCH";
    };

export function resolvePythonRuntimeToolchain(
  request: PythonRuntimeToolchainEntry,
  registry: readonly PythonRuntimeToolchainEntry[],
): PythonRuntimeToolchainResolution {
  const identityMatches = registry.filter(
    (entry) =>
      entry.python_version === request.python_version &&
      entry.implementation === request.implementation,
  );
  if (identityMatches.length === 0) {
    return { ok: false, reason: "PYTHON_RUNTIME_IDENTITY_NOT_FOUND" };
  }
  if (identityMatches.length > 1) {
    return { ok: false, reason: "PYTHON_RUNTIME_IDENTITY_AMBIGUOUS" };
  }
  const match = identityMatches[0];
  if (match.free_threaded !== request.free_threaded || match.jit !== request.jit) {
    return { ok: false, reason: "PYTHON_RUNTIME_EXPERIMENTAL_MODE_MISMATCH" };
  }
  return { ok: true, value: match };
}
