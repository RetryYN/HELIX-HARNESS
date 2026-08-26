import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import {
  type LiteCanaryRepositorySelectorInput,
  type LiteCanarySelection,
  selectLiteCanaryLane,
} from "../runtime/impact-ci";
import { runLiteCanaryFastCheck } from "../setup/distribution-dependency-closure";

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
}

function parseChangeMetadata(raw: string): {
  changed_paths: string[];
  change_kinds: Array<{ status: string; path: string }>;
} {
  const entries = raw.split("\0").filter(Boolean);
  const changed_paths: string[] = [];
  const change_kinds: Array<{ status: string; path: string }> = [];
  for (let index = 0; index < entries.length; index += 1) {
    const status = entries[index] ?? "";
    const firstPath = entries[index + 1] ?? "";
    if (!status || !firstPath) continue;
    changed_paths.push(firstPath);
    change_kinds.push({ status, path: firstPath });
    index += 1;
    if (status.startsWith("R") || status.startsWith("C")) {
      const secondPath = entries[index + 1] ?? "";
      if (secondPath) {
        changed_paths.push(secondPath);
        change_kinds.push({ status, path: secondPath });
        index += 1;
      }
    }
  }
  return { changed_paths: sortedUnique(changed_paths), change_kinds };
}

function gitOutput(repoRoot: string, args: readonly string[]): string {
  return execFileSync("git", [...args], { cwd: repoRoot, encoding: "utf8" }).trim();
}

function isCommitSha(value: string | undefined): boolean {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value);
}

/** CLI composition root: Git metadataとsetup fast checkをpure selectorへ一方向に渡す。 */
export function runLiteCanaryRepositorySelector(
  input: LiteCanaryRepositorySelectorInput,
): LiteCanarySelection {
  let pathReadFailed = false;
  const pullRequestContextUncertain =
    input.event_name === "pull_request" &&
    (!isCommitSha(input.pull_request_base_head) ||
      !isCommitSha(input.candidate_head) ||
      input.ref_name.trim().length === 0);
  let baseHead = "";
  if (input.event_name === "pull_request") {
    // PRのbase/ref/candidateが欠落または不正な場合、推測した親HEADへfallbackしない。
    if (!pullRequestContextUncertain && input.pull_request_base_head) {
      try {
        baseHead = gitOutput(input.repo_root, [
          "merge-base",
          input.pull_request_base_head,
          input.candidate_head,
        ]);
      } catch {
        pathReadFailed = true;
        baseHead = "";
      }
    } else {
      pathReadFailed = true;
    }
  } else {
    baseHead = input.pull_request_base_head || input.before_head || "";
    if (input.pull_request_base_head) {
      try {
        baseHead = gitOutput(input.repo_root, [
          "merge-base",
          input.pull_request_base_head,
          input.candidate_head,
        ]);
      } catch {
        pathReadFailed = true;
        baseHead = "";
      }
    }
  }
  if (!baseHead && input.event_name !== "pull_request") {
    try {
      baseHead = gitOutput(input.repo_root, ["rev-parse", `${input.candidate_head}^`]);
    } catch {
      pathReadFailed = true;
    }
  }
  const metadata = {
    changed_paths: [] as string[],
    change_kinds: [] as Array<{ status: string; path: string }>,
  };
  if (baseHead) {
    try {
      Object.assign(
        metadata,
        parseChangeMetadata(
          execFileSync(
            "git",
            ["diff", "--name-status", "-z", `${baseHead}..${input.candidate_head}`],
            { cwd: input.repo_root, encoding: "utf8" },
          ),
        ),
      );
    } catch {
      pathReadFailed = true;
    }
  } else {
    pathReadFailed = true;
  }
  const fastCheck = runLiteCanaryFastCheck({
    repoRoot: input.repo_root,
    candidateHead: input.candidate_head,
  });
  return selectLiteCanaryLane({
    event_name: input.event_name,
    ref_name: input.ref_name,
    changed_paths: metadata.changed_paths,
    change_kinds: metadata.change_kinds,
    fast_check: fastCheck,
    path_read_failed: pathReadFailed || fastCheck.path_read_failed,
    selector_uncertain: pullRequestContextUncertain,
  });
}

function runSelectorCommand(): void {
  const eventName = process.env.EVENT_NAME;
  const eventNames = new Set<LiteCanaryRepositorySelectorInput["event_name"]>([
    "pull_request",
    "push",
    "schedule",
    "workflow_dispatch",
  ]);
  const validEvent =
    eventName && eventNames.has(eventName as LiteCanaryRepositorySelectorInput["event_name"]);
  const selection = runLiteCanaryRepositorySelector({
    repo_root: process.cwd(),
    event_name: (validEvent
      ? eventName
      : "pull_request") as LiteCanaryRepositorySelectorInput["event_name"],
    ref_name: process.env.REF_NAME ?? "",
    candidate_head: process.env.CANDIDATE_HEAD ?? "",
    before_head: process.env.BEFORE_SHA,
    pull_request_base_head: process.env.PR_BASE_SHA,
  });
  const output = validEvent
    ? selection
    : {
        ...selection,
        disposition: "required" as const,
        skip_code: null,
        reason_codes: ["selector_uncertain" as const],
      };
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

if (process.argv[2] === "lite-canary-selector" && process.argv[1]) {
  const invokedScript = pathToFileURL(process.argv[1]).href;
  if (invokedScript === import.meta.url) runSelectorCommand();
}
