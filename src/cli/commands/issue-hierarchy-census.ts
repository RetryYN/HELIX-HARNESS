import { execFileSync } from "node:child_process";
import type { Command } from "commander";
import {
  collectIssueHierarchyContractCensus,
  type IssueDependencyContractSource,
} from "../../runtime/issue-hierarchy";

const CENSUS_SCHEMA = "helix-github-issue-hierarchy-contract-census.v1" as const;

function isIssueSource(source: unknown): source is IssueDependencyContractSource {
  if (typeof source !== "object" || source === null) return false;
  const candidate = source as { number?: unknown; state?: unknown; body?: unknown };
  return (
    Number.isSafeInteger(candidate.number) &&
    Number(candidate.number) > 0 &&
    (candidate.state === "open" || candidate.state === "closed") &&
    (typeof candidate.body === "string" || candidate.body === null)
  );
}

function loadRepositorySources(repository: string): IssueDependencyContractSource[] {
  return (
    JSON.parse(
      execFileSync(
        "gh",
        ["api", "--paginate", "--slurp", `repos/${repository}/issues?state=all&per_page=100`],
        { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
      ),
    ) as Array<Array<IssueDependencyContractSource & { pull_request?: unknown }>>
  )
    .flat()
    .filter((issue) => issue.pull_request == null)
    .map(({ number, state, body }) => ({ number, state, body }));
}

/** #1733 read-only consumer。GitHubやIssue本文へは書き込まない。 */
export function registerIssueHierarchyCensusCommand(github: Command): void {
  github
    .command("issue-hierarchy-census")
    .description("inventory valid and invalid Issue hierarchy contracts without writing GitHub")
    .option("--input-json <json>", "Issue source array JSON")
    .option("--repository <owner/name>", "read all Issues through gh api")
    .option("--json", "JSON output")
    .action((opts: { inputJson?: string; repository?: string; json?: boolean }) => {
      if (Boolean(opts.inputJson) === Boolean(opts.repository))
        throw new Error("exactly one of --input-json or --repository is required");
      const rawSources = opts.inputJson
        ? (JSON.parse(opts.inputJson) as unknown)
        : loadRepositorySources(opts.repository as string);
      if (!Array.isArray(rawSources) || !rawSources.every(isIssueSource))
        throw new Error("issue_hierarchy_census_source_invalid");

      const sources = [...rawSources].sort((left, right) => left.number - right.number);
      const census = collectIssueHierarchyContractCensus(sources);
      const report = {
        schemaVersion: CENSUS_SCHEMA,
        ok: census.findings.length === 0,
        checkedIssues: sources.length,
        ...census,
      };
      if (opts.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      else
        process.stdout.write(
          `github issue-hierarchy-census: ${report.ok ? "ok" : "blocked"} findings=${report.findings.length} issues=${report.checkedIssues}\n`,
        );
      process.exitCode = report.ok ? 0 : 1;
    });
}
