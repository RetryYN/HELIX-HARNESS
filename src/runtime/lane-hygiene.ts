import { execFileSync } from "node:child_process";
export type LaneState = "landed" | "in-flight" | "diverged" | "unknown";
export function classifyLane(
  lines: readonly string[],
  headExists = true,
  baseExists = true,
): LaneState {
  if (!headExists || !baseExists) return "unknown";
  const marks = lines.map((v) => v.trim()[0]).filter((v) => v === "+" || v === "-");
  if (marks.length === 0 || marks.every((v) => v === "-")) return "landed";
  if (marks.every((v) => v === "+")) return "in-flight";
  return "diverged";
}
export interface WorktreeRecord {
  path: string;
  head: string;
  branch: string | null;
  prunable: boolean;
  reason?: string;
}
export function parseWorktreePorcelain(text: string): WorktreeRecord[] {
  return text
    .trim()
    .split(/\n\n+/)
    .filter(Boolean)
    .map((block) => {
      const fields = new Map(
        block.split("\n").map((line) => {
          const [key, ...rest] = line.split(" ");
          return [key, rest.join(" ")];
        }),
      );
      const path = fields.get("worktree") ?? "";
      const temporaryDetached =
        fields.has("detached") && (path === "/tmp" || path.startsWith("/tmp/"));
      const missing = fields.has("prunable");
      return {
        path,
        head: fields.get("HEAD") ?? "",
        branch: fields.get("branch") ?? null,
        prunable: missing || temporaryDetached,
        ...(missing
          ? { reason: fields.get("prunable") || "path-missing" }
          : temporaryDetached
            ? { reason: "temporary-detached" }
            : {}),
      };
    });
}
export function inspectLane(repoRoot: string, base = "origin/main") {
  const branch = execFileSync("git", ["branch", "--show-current"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  let cherry: string[] = [];
  let state: LaneState = "unknown";
  try {
    execFileSync("git", ["rev-parse", "--verify", "HEAD^{commit}"], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    execFileSync("git", ["rev-parse", "--verify", `${base}^{commit}`], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    cherry = execFileSync("git", ["cherry", base, "HEAD"], { cwd: repoRoot, encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    state = classifyLane(cherry);
  } catch {
    state = "unknown";
  }
  const worktrees = parseWorktreePorcelain(
    execFileSync("git", ["worktree", "list", "--porcelain"], { cwd: repoRoot, encoding: "utf8" }),
  );
  return {
    branch,
    base,
    state,
    equivalent: cherry.filter((v) => v.startsWith("-")).length,
    unique: cherry.filter((v) => v.startsWith("+")).length,
    worktrees,
    prunableWorktrees: worktrees.filter((v) => v.prunable),
  };
}
