/**
 * git-command-guard — hybrid runtime で相手 runtime の commit / branch 履歴を壊す
 * destructive git 操作を PreToolUse(Bash/exec_command) で止める。
 *
 * IMP-142 の再発防止: destructive reset / checkout / restore / revert / force-push を
 * 「手順を知っているはず」の運用規律に任せず、理由付き override なしでは fail-close する。
 * 判定は command token ベース。通常の status/diff/log/commit/push、branch switch、
 * index-only reset/restore は通す。
 */

export type GitCommandGuardReason =
  | "no-command"
  | "non-git"
  | "safe-git"
  | "bypass"
  | "destructive-git";

export interface GitCommandGuardInput {
  command: string;
  bypass?: boolean;
}

export interface GitCommandGuardResult {
  decision: "pass" | "block";
  reason: GitCommandGuardReason;
  destructiveOperation?: string;
  message: string;
}

function shellTokens(command: string): { tokens: string[]; complete: boolean } {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;
  for (let index = 0; index < command.length; index += 1) {
    const ch = command[index] ?? "";
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\" && quote !== "'") {
      escaped = true;
      continue;
    }
    if ((ch === "'" || ch === '"') && quote === null) {
      quote = ch;
      continue;
    }
    if (ch === quote) {
      quote = null;
      continue;
    }
    if (/\s/.test(ch) && quote === null) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      if (ch === "\n" || ch === "\r") tokens.push(";");
      continue;
    }
    if (quote === null && (ch === ";" || ch === "|" || ch === "&" || ch === "(" || ch === ")")) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      const next = command[index + 1];
      if ((ch === "|" || ch === "&") && next === ch) {
        tokens.push(`${ch}${ch}`);
        index += 1;
      } else {
        tokens.push(ch);
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return { tokens, complete: quote === null && !escaped };
}

function gitSlices(tokens: string[]): string[][] {
  const slices: string[][] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== "git") continue;
    let commandStart = i === 0 || /^(?:&&|\|\||;|\||\()$/.test(tokens[i - 1] ?? "");
    if (!commandStart) {
      let start = i - 1;
      while (start > 0 && !/^(?:&&|\|\||;|\||\()$/.test(tokens[start - 1] ?? "")) start -= 1;
      const prefix = tokens.slice(start, i);
      if (prefix[0] === "command") {
        prefix.shift();
        if (prefix[0] === "--") prefix.shift();
      }
      if (prefix[0] === "env") {
        prefix.shift();
        while (prefix[0]?.startsWith("-")) {
          const option = prefix.shift();
          if ((option === "-u" || option === "--unset") && prefix.length > 0) prefix.shift();
        }
      }
      while (prefix.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(prefix[0] ?? "")) {
        prefix.shift();
      }
      commandStart = prefix.length === 0;
    }
    if (!commandStart) continue;
    const slice: string[] = [];
    for (let j = i + 1; j < tokens.length; j++) {
      const token = tokens[j] ?? "";
      if (/^(?:&&|\|\||;|\||\))$/.test(token)) break;
      slice.push(token);
    }
    slices.push(slice);
  }
  return slices;
}

function nestedShellCommands(command: string): string[] {
  const nested: string[] = [];
  const tokens = shellTokens(command).tokens;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] ?? "";
    const executable = token.split(/[\\/]/).at(-1) ?? token;
    if ((/^(?:bash|sh|zsh)$/.test(executable) && tokens[i + 1] === "-c") || executable === "eval") {
      const evalOffset = tokens[i + 1] === "--" ? 2 : 1;
      const payload = tokens[executable === "eval" ? i + evalOffset : i + 2];
      if (payload) nested.push(payload);
    }
  }
  let substitutions = command;
  for (let depth = 0; depth < 4; depth += 1) {
    let found = false;
    substitutions = substitutions.replace(/\$\(([^()]*)\)/g, (_whole, payload: string) => {
      found = true;
      if (payload) nested.push(payload);
      return payload;
    });
    if (!found) break;
  }
  return nested;
}

function commandGitSlices(command: string, depth = 0): { slices: string[][]; complete: boolean } {
  if (depth > 4) return { slices: [], complete: false };
  const tokenized = shellTokens(command);
  const direct = gitSlices(tokenized.tokens);
  const nestedResults = nestedShellCommands(command).map((payload) =>
    commandGitSlices(payload, depth + 1),
  );
  return {
    slices: [...direct, ...nestedResults.flatMap((result) => result.slices)],
    complete: tokenized.complete && nestedResults.every((result) => result.complete),
  };
}

function withoutGlobalOptions(args: string[]): string[] {
  const out = [...args];
  while (out.length > 0) {
    const head = out[0] ?? "";
    if (head === "-C" || head === "-c") {
      out.splice(0, 2);
      continue;
    }
    if (head.startsWith("--git-dir=") || head.startsWith("--work-tree=")) {
      out.shift();
      continue;
    }
    if (head === "--git-dir" || head === "--work-tree") {
      out.splice(0, 2);
      continue;
    }
    if (["--no-pager", "--paginate", "--no-replace-objects", "--bare"].includes(head)) {
      out.shift();
      continue;
    }
    break;
  }
  return out;
}

function hasAny(args: string[], flags: string[]): boolean {
  const set = new Set(args);
  return flags.some((flag) => set.has(flag));
}

function isPathReset(rest: string[]): boolean {
  if (rest.length === 0) return false;
  if (rest[0] === "--") return true;
  const separator = rest.indexOf("--");
  if (separator >= 0) return rest.length > separator + 1;
  const first = rest[0] ?? "";
  return /^HEAD(?:~0|\^0)?$/.test(first) && rest.length > 1;
}

function isStagedOnlyRestore(rest: string[]): boolean {
  const hasStaged = hasAny(rest, ["--staged", "-S"]);
  const hasWorktree = hasAny(rest, ["--worktree", "-W"]);
  return hasStaged && !hasWorktree;
}

function destructiveOperation(args: string[]): string | null {
  const normalized = withoutGlobalOptions(args);
  const sub = normalized[0];
  const rest = normalized.slice(1);
  if (!sub) return null;
  if (sub === "reset") {
    if (isPathReset(rest)) return null;
    if (hasAny(rest, ["--hard", "--merge", "--keep"])) return "git reset";
    if (rest.length === 0 || rest[0]?.startsWith("-")) return "git reset";
    return "git reset";
  }
  if (sub === "revert") return "git revert";
  if (
    sub === "push" &&
    rest.some((arg) => arg === "--force" || arg === "-f" || arg.startsWith("--force-with-lease"))
  ) {
    return "git push --force";
  }
  if (sub === "checkout") {
    if (hasAny(rest, ["-b", "-B", "--orphan", "--detach"])) return null;
    if (hasAny(rest, ["-f", "--force"])) return "git checkout";
    if (rest.includes("--")) return "git checkout";
    if (rest.length >= 1) return null;
    return "git checkout";
  }
  if (sub === "restore") {
    if (isStagedOnlyRestore(rest)) return null;
    return "git restore";
  }
  if (sub === "clean") {
    const dryRun = rest.some((arg) => arg === "-n" || arg === "--dry-run" || /^-[^-]*n/.test(arg));
    const force = rest.some(
      (arg) =>
        arg === "--force" || (arg.startsWith("-") && !arg.startsWith("--") && arg.includes("f")),
    );
    if (force && !dryRun) return "git clean --force";
    return null;
  }
  if (
    sub === "branch" &&
    (rest.some(
      (arg) => arg === "-D" || (/^-[^-]+$/.test(arg) && arg.includes("d") && arg.includes("f")),
    ) ||
      (rest.some((arg) => arg === "-d" || arg === "--delete") &&
        rest.some((arg) => arg === "-f" || arg === "--force")))
  ) {
    return "git branch --delete --force";
  }
  if (sub === "stash") {
    const action = rest.find((arg) => !arg.startsWith("-"));
    if (action === "drop" || action === "clear") return `git stash ${action}`;
  }
  return null;
}

export function extractShellCommand(toolInput: unknown): string {
  if (typeof toolInput === "string") return toolInput;
  if (!toolInput || typeof toolInput !== "object") return "";
  const obj = toolInput as Record<string, unknown>;
  for (const key of ["command", "cmd", "script"]) {
    const value = obj[key];
    if (typeof value === "string") return value;
  }
  return "";
}

export function evaluateGitCommandGuard(input: GitCommandGuardInput): GitCommandGuardResult {
  const command = input.command.trim();
  if (!command) return { decision: "pass", reason: "no-command", message: "" };
  if (input.bypass) return { decision: "pass", reason: "bypass", message: "" };
  const parsed = commandGitSlices(command);
  if (!parsed.complete) {
    return {
      decision: "block",
      reason: "destructive-git",
      destructiveOperation: "indeterminate shell command",
      message:
        "[helix-git-command-guard] BLOCK: shell command を完全に解析できないため fail-close しました。",
    };
  }
  const slices = parsed.slices;
  if (slices.length === 0) return { decision: "pass", reason: "non-git", message: "" };
  for (const slice of slices) {
    const op = destructiveOperation(slice);
    if (!op) continue;
    return {
      decision: "block",
      reason: "destructive-git",
      destructiveOperation: op,
      message:
        `[helix-git-command-guard] BLOCK: ${op} は hybrid runtime の相手 commit / branch を破壊し得るため、理由付き override / audit evidence なしに実行できません。` +
        " 先に git status / git log / git reflog で出所を確認し、相手 runtime の commit を残したまま上に積んでください。" +
        " 意図的に実行する場合のみ HELIX_ALLOW_DESTRUCTIVE_GIT=1 または .helix/state/destructive-git-override に理由を記録してください。",
    };
  }
  return { decision: "pass", reason: "safe-git", message: "" };
}

export interface DestructiveGitOverride {
  bypass: boolean;
  source: "env" | "marker" | "none";
  reason: string;
}

export function resolveDestructiveGitOverride(opts: {
  env?: string;
  markerReason?: string | null;
}): DestructiveGitOverride {
  if (opts.env === "1") {
    return { bypass: true, source: "env", reason: "HELIX_ALLOW_DESTRUCTIVE_GIT=1" };
  }
  const reason = (opts.markerReason ?? "").trim();
  if (reason) return { bypass: true, source: "marker", reason };
  return { bypass: false, source: "none", reason: "" };
}
