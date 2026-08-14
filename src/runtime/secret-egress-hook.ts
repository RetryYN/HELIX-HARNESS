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

const MAX_SCANNABLE_BYTES = 2 * 1024 * 1024;

function assertScannableText(path: string, text: string): SecretScanArtifact {
  if (Buffer.byteLength(text, "utf8") > MAX_SCANNABLE_BYTES || text.includes("\0")) {
    throw new Error(`secret scan scope unresolved: ${path}`);
  }
  return { path, text };
}

function safeWorkingArtifact(repoRoot: string, path: string): SecretScanArtifact {
  const full = join(repoRoot, path);
  if (!existsSync(full) || !statSync(full).isFile())
    throw new Error(`secret scan path unresolved: ${path}`);
  if (statSync(full).size > MAX_SCANNABLE_BYTES)
    throw new Error(`secret scan size unresolved: ${path}`);
  const bytes = readFileSync(full);
  if (bytes.includes(0)) throw new Error(`secret scan binary unresolved: ${path}`);
  return { path, text: bytes.toString("utf8") };
}

function shellWords(value: string): string[] | null {
  const words: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;
  for (const char of value) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\" && quote !== "'") {
      escaped = true;
      continue;
    }
    if ((char === "'" || char === '"') && quote === null) {
      quote = char;
      continue;
    }
    if (char === quote) {
      quote = null;
      continue;
    }
    if (/\s/.test(char) && quote === null) {
      if (current) words.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (quote !== null || escaped) return null;
  if (current) words.push(current);
  return words;
}

function explicitGitAddPathspecs(command: string): string[] | null {
  const suffix = command.match(
    /\bgit(?:\s+(?:-[Cc]\s+\S+|--(?:git-dir|work-tree)(?:=\S+|\s+\S+)|--no-pager))*\s+add\b([^\n;&|]*)/i,
  )?.[1];
  if (suffix === undefined) return null;
  const args = shellWords(suffix.trim());
  if (!args || args.length === 0) return null;
  const separator = args.indexOf("--");
  const pathspecs = separator >= 0 ? args.slice(separator + 1) : args;
  if (
    pathspecs.length === 0 ||
    pathspecs.some(
      (path) =>
        path.startsWith("-") ||
        path === "." ||
        path === "./" ||
        /[*?{}[\]$`]|\$\(|^~(?:[/\\]|$)|%[^%]+%/.test(path),
    )
  ) {
    return null;
  }
  return pathspecs;
}

function changedWorkingArtifacts(
  repoRoot: string,
  explicitPathspecs: readonly string[] | null = null,
): SecretScanArtifact[] {
  const args = ["status", "--porcelain=v1", "-z", "--untracked-files=all"];
  if (explicitPathspecs) args.push("--", ...explicitPathspecs);
  const entries = git(repoRoot, args).split("\0");
  const paths: string[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index] ?? "";
    if (!entry) continue;
    if (entry.length < 4 || entry[2] !== " ") throw new Error("git porcelain scope unresolved");
    const status = entry.slice(0, 2);
    if (!status.includes("D")) paths.push(entry.slice(3));
    if (/[RC]/.test(status)) index += 1;
  }
  return paths.map((path) => safeWorkingArtifact(repoRoot, path));
}

function stagedArtifacts(repoRoot: string): SecretScanArtifact[] {
  const paths = git(repoRoot, ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
    .split("\0")
    .filter(Boolean);
  return paths.flatMap((path) => {
    const text = git(repoRoot, ["show", `:${path}`]);
    return [assertScannableText(`staged:${path}`, text)];
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
      const artifactPath = `outgoing:${commit.slice(0, 12)}:${path}`;
      const text = git(repoRoot, ["show", `${commit}:${path}`]);
      artifacts.push(assertScannableText(artifactPath, text));
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
    if (gitAction === "add")
      return block(changedWorkingArtifacts(opts.repoRoot, explicitGitAddPathspecs(command)));
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
