import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  type ClaudeReviewRequestState,
  type ClaudeReviewSubjectObservation,
  detectUnansweredClaudeReviews,
} from "../runtime/claude-unanswered-review-detector";

function option(args: readonly string[], name: string, required = true): string | undefined {
  const index = args.indexOf(name);
  const value = index >= 0 ? args[index + 1] : undefined;
  if (required && (!value || value.startsWith("--"))) throw new Error(`missing_option:${name}`);
  return value;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function previousRequests(path: string | undefined): ClaudeReviewRequestState[] {
  if (!path) return [];
  const value = readJson(path) as { requests?: unknown };
  if (!Array.isArray(value.requests)) throw new Error("previous_report_invalid");
  return value.requests as ClaudeReviewRequestState[];
}

export function runClaudeUnansweredReviewDetectorCommand(args: readonly string[]): unknown {
  const inputPath = option(args, "--input") as string;
  const outputPath = option(args, "--output") as string;
  const input = readJson(inputPath) as {
    schema_version?: string;
    subjects?: unknown;
    trusted_responder_logins?: unknown;
  };
  if (input.schema_version !== "claude-review-observation.v1")
    throw new Error("observation_schema_invalid");
  if (!Array.isArray(input.subjects)) throw new Error("observation_subjects_invalid");
  if (
    !Array.isArray(input.trusted_responder_logins) ||
    input.trusted_responder_logins.some((login) => typeof login !== "string")
  ) {
    throw new Error("trusted_responder_logins_invalid");
  }
  const previousState = option(args, "--previous-state") as
    | "loaded"
    | "bootstrap"
    | "missing"
    | "expired";
  if (!["loaded", "bootstrap", "missing", "expired"].includes(previousState)) {
    throw new Error("previous_state_invalid");
  }
  const previousPath = option(args, "--previous", false);
  const bootstrapRevision = option(args, "--bootstrap-revision", false);
  if (previousState === "loaded" && !previousPath) throw new Error("previous_report_required");
  if (previousState !== "loaded" && previousPath) throw new Error("previous_report_unexpected");
  if (previousState === "bootstrap" && !bootstrapRevision)
    throw new Error("bootstrap_revision_required");
  if (previousState !== "bootstrap" && bootstrapRevision)
    throw new Error("bootstrap_revision_unexpected");
  const report = detectUnansweredClaudeReviews({
    subjects: input.subjects as ClaudeReviewSubjectObservation[],
    trusted_responder_logins: input.trusted_responder_logins as string[],
    previous_requests: previousPath ? previousRequests(previousPath) : undefined,
    previous_state: previousState,
    bootstrap_revision: bootstrapRevision,
  });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
  return {
    ok: true,
    output: outputPath,
    unanswered_count: report.unanswered.length,
    degraded: report.previous_observation.degraded,
  };
}

function main(): void {
  try {
    process.stdout.write(
      `${JSON.stringify(runClaudeUnansweredReviewDetectorCommand(process.argv.slice(2)))}\n`,
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
