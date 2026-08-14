/**
 * machine-safety-guard — AI runtime が shell / interpreter 経由で行う広域・動的な
 * host 破壊操作を PreToolUse で止める pure classifier。
 *
 * 静的に指定された repo 内の単一ファイル削除は許可する。一方、再帰、複数対象、glob、
 * 変数・command substitution、repo 外、raw device、interpreter 内の削除 API は、対象範囲を
 * hook 時点で狭く証明できないため fail-close する。
 */
import { isAbsolute, relative, resolve } from "node:path";

export type MachineSafetyReason =
  | "no-command"
  | "safe"
  | "dynamic-delete"
  | "broad-delete"
  | "host-destructive";

export interface MachineSafetyGuardResult {
  decision: "pass" | "block";
  reason: MachineSafetyReason;
  operation?: string;
  message: string;
}

function block(reason: Exclude<MachineSafetyReason, "no-command" | "safe">, operation: string) {
  return {
    decision: "block",
    reason,
    operation,
    message:
      `[helix-machine-safety-guard] BLOCK: ${operation} は対象範囲を静的かつ狭く証明できず、` +
      "host filesystem / process を広域に破壊し得るため実行できません。" +
      " repo 内の明示的な単一ファイルへ分解するか、隔離 sandbox 内で実行してください。",
  } satisfies MachineSafetyGuardResult;
}

function containsDynamicSyntax(value: string): boolean {
  return /^(?:~(?:[/\\]|$))|[*?{}[\]$`]|\$\(|%[^%]+%|![A-Za-z_][A-Za-z0-9_]*!/.test(value);
}

function isInsideRepo(path: string, repoRoot: string): boolean {
  const target = resolve(repoRoot, path);
  const rel = relative(resolve(repoRoot), target);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}

function shellWords(command: string): string[] | null {
  const words: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;
  for (const ch of command) {
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
        words.push(current);
        current = "";
      }
      continue;
    }
    if (quote === null && /[;&|()]/.test(ch)) {
      if (current) {
        words.push(current);
        current = "";
      }
      words.push(ch);
      continue;
    }
    current += ch;
  }
  if (quote !== null || escaped) return null;
  if (current) words.push(current);
  return words;
}

function basename(command: string): string {
  return command.split(/[\\/]/).at(-1)?.toLowerCase() ?? command.toLowerCase();
}

function commandSlices(words: readonly string[]): string[][] {
  const slices: string[][] = [];
  let current: string[] = [];
  for (const word of words) {
    if (/^[;&|()]$/.test(word)) {
      if (current.length > 0) {
        slices.push(current);
        current = [];
      }
    } else current.push(word);
  }
  if (current.length > 0) slices.push(current);
  return slices;
}

const SUDO_OPTIONS_WITH_VALUE = new Set([
  "-C",
  "--close-from",
  "-g",
  "--group",
  "-h",
  "--host",
  "-p",
  "--prompt",
  "-R",
  "--chroot",
  "-T",
  "--command-timeout",
  "-u",
  "--user",
]);

function shiftOptions(out: string[], optionsWithValue: ReadonlySet<string>): void {
  while (out[0]?.startsWith("-") && out[0] !== "-") {
    const option = out.shift() ?? "";
    if (option === "--") return;
    if (option.includes("=")) continue;
    if (optionsWithValue.has(option)) out.shift();
  }
}

function unwrapCommand(slice: readonly string[]): string[] {
  const out = [...slice];
  let changed = true;
  while (changed) {
    changed = false;
    if (basename(out[0] ?? "") === "sudo") {
      out.shift();
      shiftOptions(out, SUDO_OPTIONS_WITH_VALUE);
      changed = true;
    }
    if (basename(out[0] ?? "") === "doas") {
      out.shift();
      shiftOptions(out, new Set(["-C", "-u"]));
      changed = true;
    }
    if (out[0] === "command") {
      out.shift();
      if ((out[0] as string | undefined) === "--") out.shift();
      changed = true;
    }
    if (out[0] === "env") {
      out.shift();
      while (out[0]?.startsWith("-") || /^[A-Za-z_][A-Za-z0-9_]*=/.test(out[0] ?? "")) out.shift();
      changed = true;
    }
    if (["nohup", "setsid"].includes(basename(out[0] ?? ""))) {
      out.shift();
      shiftOptions(out, new Set());
      changed = true;
    }
    if (basename(out[0] ?? "") === "nice") {
      out.shift();
      shiftOptions(out, new Set(["-n", "--adjustment"]));
      changed = true;
    }
    if (basename(out[0] ?? "") === "ionice") {
      out.shift();
      shiftOptions(
        out,
        new Set([
          "-c",
          "--class",
          "-n",
          "--classdata",
          "-p",
          "--pid",
          "-P",
          "--pgid",
          "-u",
          "--uid",
        ]),
      );
      changed = true;
    }
    if (basename(out[0] ?? "") === "stdbuf") {
      out.shift();
      shiftOptions(out, new Set(["-i", "--input", "-o", "--output", "-e", "--error"]));
      changed = true;
    }
    if (basename(out[0] ?? "") === "timeout") {
      out.shift();
      shiftOptions(out, new Set(["-k", "--kill-after", "-s", "--signal"]));
      out.shift();
      changed = true;
    }
    if (basename(out[0] ?? "") === "time") {
      out.shift();
      shiftOptions(out, new Set(["-f", "--format", "-o", "--output"]));
      changed = true;
    }
    if (basename(out[0] ?? "") === "busybox") {
      out.shift();
      changed = true;
    }
    if (basename(out[0] ?? "") === "watch") {
      out.shift();
      shiftOptions(out, new Set(["-n", "--interval", "-x", "--exec", "-t", "--no-title"]));
      changed = true;
    }
  }
  return out;
}

function nestedCommandPayload(normalized: readonly string[]): string | null {
  const command = basename(normalized[0] ?? "");
  if (["bash", "sh", "zsh", "su", "script"].includes(command)) {
    const commandOption = normalized.findIndex((word) =>
      command === "script"
        ? word === "-c" || word === "--command"
        : /^-[A-Za-z]*c[A-Za-z]*$/.test(word),
    );
    return commandOption >= 0 ? (normalized[commandOption + 1] ?? null) : null;
  }
  return null;
}

function classifyRm(slice: readonly string[], repoRoot: string): MachineSafetyGuardResult | null {
  const normalized = unwrapCommand(slice);
  if (basename(normalized[0] ?? "") !== "rm") return null;
  const args = normalized.slice(1);
  // `-R` は GNU coreutils / BSD 双方で `-r` と同義の再帰フラグ。大文字小文字を区別すると
  // `rm -R` / `rm -Rf` / `rm -fR` が recursive 判定を素通りし、本 guard の目的である
  // 再帰削除の遮断がフラグ 1 文字で回避できる。
  const recursive = args.some(
    (arg) => arg === "--recursive" || (/^-[^-]+$/.test(arg) && /r/i.test(arg)),
  );
  if (recursive) return block("broad-delete", "recursive rm");
  const targets = args.filter((arg) => !arg.startsWith("-"));
  if (targets.length !== 1) return block("broad-delete", "multi-target or targetless rm");
  const target = targets[0] ?? "";
  if (containsDynamicSyntax(target)) return block("dynamic-delete", "dynamic rm target");
  if (!isInsideRepo(target, repoRoot)) return block("broad-delete", "repo-external rm target");
  return { decision: "pass", reason: "safe", message: "" };
}

export const INTERPRETER_DELETE_API =
  /(?:\b(?:shutil\.)?rmtree\s*\(|\bos\.(?:remove|unlink|removedirs)\b|\.(?:unlink|rmdir)\s*\(|(?:\bfs\.|require\(["'](?:node:)?fs["']\)\.)(?:rm|rmSync|unlink|unlinkSync|rmdir|rmdirSync)\b|\b(?:os\.system|subprocess\.(?:run|call|Popen))\s*\([^)]*\brm\b|\bRemove-Item\b|\bSystem\.IO\.(?:File|Directory)\.Delete\b|\bFileUtils\.rm_rf\b|\b(?:system|exec)\s*\([^)]*\brm\s+-[^)]*[rR])/i;

export function evaluateMachineSafetyGuard(input: {
  command: string;
  repoRoot: string;
}): MachineSafetyGuardResult {
  const command = input.command.trim();
  if (!command) return { decision: "pass", reason: "no-command", message: "" };
  const words = shellWords(command);
  if (!words) return block("dynamic-delete", "unparseable shell command");

  if (INTERPRETER_DELETE_API.test(command))
    return block("dynamic-delete", "interpreter-driven filesystem deletion");
  if (/\bfind\b[\s\S]*(?:-delete|-exec(?:dir)?\s+rm\b)/i.test(command))
    return block("dynamic-delete", "find-driven deletion");
  if (/\bxargs\b[\s\S]*\brm\b/i.test(command))
    return block("dynamic-delete", "xargs-driven deletion");
  if (/\b(?:mkfs(?:\.[a-z0-9]+)?|wipefs|fdisk|parted)\b/i.test(command))
    return block("host-destructive", "block-device mutation");
  if (/\bdd\b[\s\S]*\bof=(?:\/dev\/|\\\\\.\\PhysicalDrive)/i.test(command))
    return block("host-destructive", "raw-device overwrite");
  if (/\b(?:chmod|chown)\b[\s\S]*(?:--recursive|\s-[A-Za-z]*R[A-Za-z]*\b)/i.test(command))
    return block("host-destructive", "recursive permission/ownership mutation");
  if (/\b(?:killall|pkill)\b(?:\s+-(?:9|KILL)\b|\s+-[A-Za-z]*9[A-Za-z]*\b)/i.test(command))
    return block("host-destructive", "broad forced process termination");
  if (/\btruncate\b|\bshred\b|\brsync\b[^\n;&|]*\s--delete(?:\s|$)/i.test(command))
    return block("host-destructive", "bulk overwrite or destructive synchronization");
  if (
    /\b(?:reboot|poweroff|shutdown|halt)\b|\bsystemctl\s+(?:poweroff|reboot|halt)\b/i.test(command)
  )
    return block("host-destructive", "host availability mutation");
  if (/\bkill\b[^\n;&|]*\s-(?:9|KILL)\s+-1(?:\s|$)/i.test(command))
    return block("host-destructive", "all-process forced termination");
  if (
    /\bdocker\b[\s\S]*(?:-v|--volume)\s+\/(?:\s*:\s*|:)|\bdocker\b[\s\S]*--mount\b[^\n]*\bsource=\//i.test(
      command,
    )
  )
    return block("host-destructive", "container host-root mount");
  if (/\bfind\b[\s\S]*-exec(?:dir)?\s+shred\b/i.test(command))
    return block("dynamic-delete", "find-driven shredding");

  for (const slice of commandSlices(words)) {
    const normalized = unwrapCommand(slice);
    let payload = nestedCommandPayload(normalized);
    if (payload === null && normalized.length > 2) {
      const commandOption = normalized.findIndex((word) => word === "-c" || word === "--command");
      if (commandOption > 0) payload = normalized[commandOption + 1] ?? null;
    }
    if (payload) {
      if (containsDynamicSyntax(payload))
        return block("dynamic-delete", "dynamic nested-shell payload");
      const outcome = evaluateMachineSafetyGuard({ command: payload, repoRoot: input.repoRoot });
      if (outcome.decision === "block") return outcome;
    }
    const rm = classifyRm(slice, input.repoRoot);
    if (rm?.decision === "block") return rm;
    if (rm === null && !["echo", "printf"].includes(basename(normalized[0] ?? ""))) {
      const rmIndex = normalized.findIndex((word) => basename(word) === "rm");
      if (rmIndex > 0) {
        const nested = classifyRm(normalized.slice(rmIndex), input.repoRoot);
        if (
          nested?.decision === "block" &&
          (nested.reason === "dynamic-delete" || nested.reason === "broad-delete")
        ) {
          return block(nested.reason, `unrecognized wrapper before rm: ${normalized[0]}`);
        }
      }
    }
  }
  return { decision: "pass", reason: "safe", message: "" };
}
