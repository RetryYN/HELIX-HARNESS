import { spawnSync } from "node:child_process";
export type HookTrustStatus = "trusted" | "mismatch" | "config-unavailable" | "error";
interface Hook {
  key?: string;
  source?: string;
  isManaged?: boolean;
  currentHash?: string;
  trustStatus?: string;
}
export interface CodexHookTrustResult {
  status: HookTrustStatus;
  ok: boolean;
  checked: number;
  mismatches: string[];
  currentDigests: string[];
  reason?: string;
}
const failure = (reason: string, mismatch: string): CodexHookTrustResult => ({
  status: "error",
  ok: false,
  checked: 0,
  mismatches: [mismatch],
  currentDigests: [],
  reason,
});
export function analyzeCodexHookListResponse(
  stdout: string,
  repoRoot: string,
): CodexHookTrustResult {
  const parsed: Record<string, unknown>[] = [];
  for (const line of stdout.split(/\r?\n/).filter(Boolean)) {
    try {
      parsed.push(JSON.parse(line) as Record<string, unknown>);
    } catch {
      return failure("malformed hooks/list JSON", "malformed-json");
    }
  }
  const response = parsed.find((row) => row.id === 2);
  if (!response) return failure("hooks/list id=2 response missing", "id-2-missing");
  const result = response.result as { data?: Array<{ cwd?: string; hooks?: Hook[] }> } | undefined;
  const row = result?.data?.find((entry) => entry.cwd === repoRoot);
  if (!row) return failure("requested cwd row missing", "cwd-row-missing");
  const hooks = (row.hooks ?? []).filter(
    (hook) => hook.source === "project" && hook.isManaged === false,
  );
  if (hooks.length === 0)
    return failure("project unmanaged hook set is empty", "project-hooks-empty");
  const mismatches = hooks
    .filter((hook) => hook.trustStatus !== "trusted")
    .map((hook) => hook.key ?? "unknown-hook");
  return {
    status: mismatches.length ? "mismatch" : "trusted",
    ok: mismatches.length === 0,
    checked: hooks.length,
    mismatches,
    currentDigests: hooks.flatMap((hook) =>
      typeof hook.currentHash === "string" ? [hook.currentHash] : [],
    ),
  };
}
export type UnavailableReason = "ci" | "read-restricted";
export type HookListRunner = (repoRoot: string) => {
  status: number | null;
  stdout: string;
  error?: string;
  unavailableReason?: UnavailableReason;
};
export const runCodexHookList: HookListRunner = (repoRoot) => {
  const init = JSON.stringify({
    method: "initialize",
    id: 1,
    params: {
      clientInfo: { name: "helix_harness_doctor", title: "HELIX doctor", version: "0.1.0" },
    },
  });
  const list = JSON.stringify({ method: "hooks/list", id: 2, params: { cwds: [repoRoot] } });
  const input = `${init}\n{"method":"initialized"}\n${list}\n`;
  const run = spawnSync("codex", ["app-server", "--stdio"], {
    encoding: "utf8",
    timeout: 7_000,
    input,
  });
  const unavailableReason =
    !run.stdout && process.env.CI === "true"
      ? "ci"
      : run.error && (run.error as NodeJS.ErrnoException).code === "EACCES"
        ? "read-restricted"
        : undefined;
  return {
    status: run.status,
    stdout: run.stdout ?? "",
    ...(run.error ? { error: run.error.message } : {}),
    ...(unavailableReason ? { unavailableReason } : {}),
  };
};
export function loadCodexHookTrust(
  repoRoot: string,
  runner: HookListRunner = runCodexHookList,
): CodexHookTrustResult {
  const run = runner(repoRoot);
  if (run.unavailableReason)
    return {
      status: "config-unavailable",
      ok: true,
      checked: 0,
      mismatches: [],
      currentDigests: [],
      reason: run.unavailableReason,
    };
  if (run.status !== 0)
    return failure(`codex app-server exited ${run.status}`, "app-server-nonzero");
  if (run.error || !run.stdout)
    return failure(run.error ?? "codex app-server output missing", "app-server-output-missing");
  return analyzeCodexHookListResponse(run.stdout, repoRoot);
}
export function codexHookTrustMessages(result: CodexHookTrustResult): string[] {
  if (result.status === "config-unavailable")
    return [`codex-hook-trust - SKIP (${result.reason}; typed CI/read-restricted environment)`];
  if (result.ok)
    return [
      `codex-hook-trust - OK (checked=${result.checked}, canonical currentHash from codex app-server hooks/list)`,
    ];
  return [
    `codex-hook-trust - violation: ${result.reason ?? "untrusted/changed hooks"} (${result.mismatches.slice(0, 3).join(", ")})`,
  ];
}
