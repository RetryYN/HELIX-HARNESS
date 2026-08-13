/** secret-egress hook runner — raw secret 値を出力せず write / Git egress 前に遮断する。 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { analyzeSecretScan, type SecretScanArtifact } from "../security/secret-policy";
import { extractShellCommand } from "./git-command-guard";

export interface SecretEgressHookOutcome {
  exitCode: 0 | 2;
  message?: string;
  checked?: number;
}

function block(artifacts: readonly SecretScanArtifact[]): SecretEgressHookOutcome {
  const result = analyzeSecretScan(artifacts, { allowAnnotatedExamples: false });
  if (result.ok) return { exitCode: 0, checked: result.checked };
  const sample = result.violations
    .slice(0, 8)
    .map((finding) => `${finding.path}:${finding.line}:${finding.marker}`)
    .join(", ");
  return {
    exitCode: 2,
    checked: result.checked,
    message:
      `[helix-secret-egress-guard] BLOCK: secret-like material ${result.violations.length}件 ` +
      `(${sample})。値は表示していません。credentialをsecret storeへ移し、露出済みならrotateしてください。`,
  };
}

function textFromToolInput(toolInput: unknown): string {
  if (typeof toolInput === "string") return toolInput;
  if (!toolInput || typeof toolInput !== "object") return "";
  const input = toolInput as Record<string, unknown>;
  const values: string[] = [];
  for (const key of ["content", "new_string", "patch", "text"]) {
    if (typeof input[key] === "string") values.push(String(input[key]));
  }
  return values.join("\n");
}

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function tryGit(repoRoot: string, args: string[]): string | null {
  try {
    return git(repoRoot, args);
  } catch {
    return null;
  }
}

function safeWorkingArtifact(repoRoot: string, path: string): SecretScanArtifact | null {
  const full = join(repoRoot, path);
  if (!existsSync(full) || !statSync(full).isFile() || statSync(full).size > 2 * 1024 * 1024)
    return null;
  const bytes = readFileSync(full);
  if (bytes.includes(0)) return null;
  return { path, text: bytes.toString("utf8") };
}

function changedWorkingArtifacts(repoRoot: string): SecretScanArtifact[] {
  const paths = git(repoRoot, ["status", "--porcelain=v1", "-z"])
    .split("\0")
    .filter(Boolean)
    .map((entry) => entry.slice(3))
    .map((path) => (path.includes(" -> ") ? (path.split(" -> ").at(-1) ?? path) : path));
  return paths.flatMap((path) => {
    const artifact = safeWorkingArtifact(repoRoot, path);
    return artifact ? [artifact] : [];
  });
}

function stagedArtifacts(repoRoot: string): SecretScanArtifact[] {
  const paths = git(repoRoot, ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
    .split("\0")
    .filter(Boolean);
  return paths.flatMap((path) => {
    const text = git(repoRoot, ["show", `:${path}`]);
    return text.includes("\0") ? [] : [{ path: `staged:${path}`, text }];
  });
}

function outgoingArtifacts(repoRoot: string): SecretScanArtifact[] {
  const base =
    tryGit(repoRoot, ["rev-parse", "--verify", "@{upstream}"])?.trim() ||
    tryGit(repoRoot, ["merge-base", "HEAD", "origin/main"])?.trim();
  if (!base) throw new Error("outgoing base unresolved");
  const commits = git(repoRoot, ["rev-list", `${base}..HEAD`])
    .split(/\r?\n/)
    .filter(Boolean);
  const artifacts: SecretScanArtifact[] = [];
  for (const commit of commits) {
    const paths = git(repoRoot, [
      "diff-tree",
      "--no-commit-id",
      "--name-only",
      "--diff-filter=ACMR",
      "-r",
      "-z",
      commit,
    ])
      .split("\0")
      .filter(Boolean);
    for (const path of paths) {
      try {
        const text = git(repoRoot, ["show", `${commit}:${path}`]);
        if (!text.includes("\0"))
          artifacts.push({ path: `outgoing:${commit.slice(0, 12)}:${path}`, text });
      } catch {
        // A path can disappear in a later tree; only extant blobs are scannable for this commit.
      }
    }
  }
  return artifacts;
}

export function runSecretEgressHook(opts: {
  repoRoot: string;
  rawInput: string;
}): SecretEgressHookOutcome {
  let input: { tool_name?: string; tool_input?: unknown };
  try {
    input = JSON.parse(opts.rawInput || "{}");
  } catch {
    return { exitCode: 2, message: "[helix-secret-egress-guard] BLOCK: invalid hook input" };
  }
  try {
    const proposed = textFromToolInput(input.tool_input);
    if (proposed) {
      const outcome = block([{ path: "proposed-write", text: proposed }]);
      if (outcome.exitCode === 2) return outcome;
    }
    const command = extractShellCommand(input.tool_input);
    if (!command) return { exitCode: 0, checked: proposed ? 1 : 0 };
    const commandOutcome = block([{ path: "shell-command", text: command }]);
    if (commandOutcome.exitCode === 2) return commandOutcome;
    if (
      /\b(?:curl|wget|scp|rsync|gh\s+(?:api|gist|release\s+upload))\b/i.test(command) &&
      /\$(?:\{[^}]*?(?:TOKEN|KEY|SECRET|PASSWORD|PASSWD|CREDENTIAL)[^}]*\}|[A-Za-z_][A-Za-z0-9_]*(?:TOKEN|KEY|SECRET|PASSWORD|PASSWD|CREDENTIAL)[A-Za-z0-9_]*)/i.test(
        command,
      )
    ) {
      return {
        exitCode: 2,
        message:
          "[helix-secret-egress-guard] BLOCK: credential環境変数を外部commandへ渡す操作はbroker外のegressとなるため禁止です。",
      };
    }
    if (
      /\b(?:curl|wget|scp|rsync|gh\s+(?:api|gist|release\s+upload))\b/i.test(command) &&
      /@?(?:~\/|\.\.?\/|\/)?(?:\.env(?:\.[^\s"']+)?|[^\s"'=]*\.(?:pem|key|p12|pfx)|[^\s"'=]*(?:credential|credentials|auth\.json|token)[^\s"']*)/i.test(
        command,
      )
    ) {
      return {
        exitCode: 2,
        message:
          "[helix-secret-egress-guard] BLOCK: credential候補ファイルを外部送信するcommandは実行できません。secret brokerを使用してください。",
      };
    }
    if (
      /(?:^|[;&|]\s*)(?:env|set)\s*(?:$|[;&|])/i.test(command) ||
      /\bprintenv\b(?:\s+(?:[A-Za-z_][A-Za-z0-9_]*)?(?:TOKEN|KEY|SECRET|PASSWORD|PASSWD|CREDENTIAL)[A-Za-z0-9_]*)?/i.test(
        command,
      )
    ) {
      return {
        exitCode: 2,
        message:
          "[helix-secret-egress-guard] BLOCK: environment全体またはcredential変数の表示は会話・logへのsecret露出を招くため禁止です。",
      };
    }
    if (
      /\b(?:cat|head|tail|less|more|sed|awk|rg|grep)\b/i.test(command) &&
      /(?:\.env(?:\.[^\s"']+)?|\.ssh\/(?:id_|config)|\.aws\/credentials|\.config\/(?:gh|gcloud|azure)|[^\s"']*\.(?:pem|key|p12|pfx)|[^\s"']*(?:credential|credentials|auth\.json|token)[^\s"']*)/i.test(
        command,
      )
    ) {
      return {
        exitCode: 2,
        message:
          "[helix-secret-egress-guard] BLOCK: credential候補ファイルの内容をtool出力へ展開できません。metadata/digestだけを確認してください。",
      };
    }
    if (/\bgit\s+(?:commit|push)\b[^\n;&|]*--no-verify\b/i.test(command)) {
      return {
        exitCode: 2,
        message:
          "[helix-secret-egress-guard] BLOCK: git commit/push --no-verify はsecret送信境界を迂回するため禁止です。",
      };
    }
    const gitAction = command
      .match(
        /\bgit(?:\s+(?:-[Cc]\s+\S+|--(?:git-dir|work-tree)(?:=\S+|\s+\S+)|--no-pager))*\s+(add|commit|push)\b/i,
      )?.[1]
      ?.toLowerCase();
    if (gitAction === "add") return block(changedWorkingArtifacts(opts.repoRoot));
    if (gitAction === "commit") return block(stagedArtifacts(opts.repoRoot));
    if (gitAction === "push") return block(outgoingArtifacts(opts.repoRoot));
    return { exitCode: 0, checked: proposed ? 1 : 0 };
  } catch {
    return {
      exitCode: 2,
      message: "[helix-secret-egress-guard] BLOCK: egress scopeを検証できません。",
    };
  }
}
