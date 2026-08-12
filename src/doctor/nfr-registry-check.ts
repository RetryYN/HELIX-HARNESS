import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { LintResult } from "../plan/lint";
import { analyzeNfrRegistry } from "../requirements/nfr-registry";

const REGISTRY_PATH = join("config", "nfr-registry.json");

function failure(code: "registry_missing" | "registry_json_invalid"): LintResult {
  return { ok: false, messages: [`nfr-registry - violation: ${code}`] };
}

export function checkNfrRegistry(repoRoot: string): LintResult {
  let source: string;
  try {
    source = readFileSync(join(repoRoot, REGISTRY_PATH), "utf8");
  } catch {
    return failure("registry_missing");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source) as unknown;
  } catch {
    return failure("registry_json_invalid");
  }

  const result = analyzeNfrRegistry(parsed, repoRoot);
  if (!result.ok) {
    return {
      ok: false,
      messages: [`nfr-registry - violation: ${result.failureCodes.join(",")}`, ...result.messages],
    };
  }
  return {
    ok: true,
    messages: [
      `nfr-registry - OK (entries=${result.value.entries.length}, trace=${result.value.entries
        .map((entry) => entry.nfr_id)
        .join("|")})`,
    ],
  };
}

export const checkNfrRegistryDoctor = checkNfrRegistry;
