import { spawnSync } from "node:child_process";
import {
  chmodSync,
  closeSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";

// PLAN-RECOVERY-56-codex-spawn-enobufs / CODEX-SPAWN-BUFFER-602

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const tsxLoaderPath = join(repoRoot, "node_modules", "tsx", "dist", "loader.mjs");
const authorityPaths = [
  "docs/governance/helix-harness-requirements_v1.3.md",
  "docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md",
  "docs/design/helix/L3-requirements/worker-common-contract.md",
  "AGENTS.md",
  "CLAUDE.md",
  ".claude/CLAUDE.md",
  "docs/skills/judgment-core.md",
] as const;

function runGit(cwd: string, args: string[]): void {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr ?? ""}`);
  }
}

function installWorkerContextFixture(cwd: string): string {
  for (const path of authorityPaths) {
    const target = join(cwd, path);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(join(repoRoot, path), target);
  }
  runGit(cwd, ["init", "-q"]);
  runGit(cwd, ["config", "user.email", "fixture@example.invalid"]);
  runGit(cwd, ["config", "user.name", "Fixture"]);
  runGit(cwd, ["add", ...authorityPaths]);
  runGit(cwd, ["commit", "-qm", "worker context fixture"]);

  const boundaryPath = join(cwd, ".helix", "worker-context.json");
  mkdirSync(join(cwd, ".helix"), { recursive: true });
  writeFileSync(
    boundaryPath,
    `${JSON.stringify({
      goal_id: "TEST-WORKER-CONTEXT",
      workflow_style: "v_model",
      case_model: "none",
      specialist_process: "none",
      behavior_contract_id: "CODEX-SPAWN-BUFFER-602",
      responsibility_owner: "codex-adapter-runtime",
      allowed_paths: ["src/cli.ts", "tests", "docs/plans"],
      forbidden_paths: [".helix"],
      severity_policy_digest: sha256Digest("test-severity-policy"),
      required_output_schema: sha256Digest("test-output-schema"),
      budget: { time_ms: 60_000, token_limit: 4_096 },
    })}\n`,
  );
  return boundaryPath;
}

function runCli(cwd: string, args: string[], env: NodeJS.ProcessEnv, timeout: number) {
  const stdoutPath = join(cwd, "cli.stdout");
  const stderrPath = join(cwd, "cli.stderr");
  const stdoutFd = openSync(stdoutPath, "w");
  const stderrFd = openSync(stderrPath, "w");
  try {
    const result = spawnSync(process.execPath, ["--import", tsxLoaderPath, cliPath, ...args], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, ...env },
      stdio: ["ignore", stdoutFd, stderrFd],
      timeout,
    });
    return {
      ...result,
      stdout: readFileSync(stdoutPath, "utf8"),
      stderr: readFileSync(stderrPath, "utf8"),
    };
  } finally {
    closeSync(stdoutFd);
    closeSync(stderrFd);
  }
}

function writeDirectProvider(cwd: string): string {
  const path = join(cwd, "fake-codex.sh");
  writeFileSync(path, "#!/bin/sh\ncat >/dev/null\nprintf 'provider-complete\\n'\nexit 0\n");
  chmodSync(path, 0o755);
  return path;
}

function writePairProvider(cwd: string): string {
  const path = join(cwd, "fake-pair-codex.sh");
  writeFileSync(
    path,
    `#!/bin/sh
if test "$1" = "--version"; then
  exit 0
fi
counter="$PWD/provider-count"
if test -f "$counter"; then
  count=$(cat "$counter")
else
  count=0
fi
printf '%s' "$((count + 1))" > "$counter"
cat >/dev/null &
reader=$!
dd if=/dev/zero bs=1024 count=2048 2>/dev/null
case "$count" in
  0)
    printf 'RED_ORACLE: provider output is streamed\\nACCEPTANCE_ORACLE: output is retained\\nRED_TEST_COMMAND: fake-provider\\nRED_EXIT_CODE: 1\\n'
    ;;
  1)
    printf 'CHANGED_FILES: src/cli.ts\\nTARGETED_TEST_COMMAND: fake-provider\\nIMPLEMENTATION_NOTES: async provider process\\n'
    ;;
  *)
    printf 'GREEN_EVIDENCE: provider output was fully consumed\\nREVIEW: no findings\\nVERDICT: pass\\n'
    ;;
esac
wait "$reader"
exit 0
`,
  );
  chmodSync(path, 0o755);
  return path;
}

describe("provider process boundary", () => {
  it("U-ISSUE602-001: pair-agent captures provider output above Node's sync buffer without ENOBUFS", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-provider-buffer-"));
    try {
      const contextPath = installWorkerContextFixture(cwd);
      const fakeCodex = writePairProvider(cwd);
      const result = runCli(
        cwd,
        [
          "pair-agent",
          "run",
          "--plan-id",
          "PLAN-RECOVERY-56-codex-spawn-enobufs",
          "--task",
          "stream provider output safely",
          "--primary",
          "codex",
          "--mode",
          "codex-only",
          "--allow-frontier",
          "--max-fix-cycles",
          "1",
          "--execute",
          "--json",
          "--worker-context-file",
          contextPath,
        ],
        { HELIX_CODEX_BIN: fakeCodex },
        15_000,
      );

      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr || result.stdout).toBe(0);
      const output = JSON.parse(result.stdout) as {
        result?: { ok?: boolean; finalVerdict?: string };
      };
      expect(output.result).toMatchObject({ ok: true, finalVerdict: "pass" });
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("U-ISSUE602-002: direct codex execution closes a large stdin prompt before waiting for exit", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-provider-stdin-"));
    try {
      const contextPath = installWorkerContextFixture(cwd);
      const fakeCodex = writeDirectProvider(cwd);
      writeFileSync(join(cwd, "task.md"), `${"large prompt ".repeat(100_000)}end`);
      const result = runCli(
        cwd,
        [
          "codex",
          "--role",
          "se",
          "--task-file",
          "task.md",
          "--execute",
          "--json",
          "--worker-context-file",
          contextPath,
        ],
        { HELIX_CODEX_BIN: fakeCodex },
        15_000,
      );

      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr || result.stdout).toBe(0);
      expect(result.stdout, result.stderr).not.toBe("");
      expect(JSON.parse(result.stdout)).toMatchObject({ executed: true, exit_code: 0 });
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
