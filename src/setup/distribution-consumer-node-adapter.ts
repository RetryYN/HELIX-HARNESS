import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { nodeDoctorDeps, runConsumerDoctor } from "../doctor";
import {
  completionDecisionPacketForOutstanding,
  completionReviewBundleForOutstanding,
  computeOutstandingWork,
} from "../lint/outstanding";
import { buildWrapperAdapterPlan } from "../runtime/adapter";
import { detectMode, nextActionForMode } from "../runtime/detect";
import type {
  LiteConsumerCommandExecution,
  LiteConsumerCommandHandlers,
} from "./distribution-consumer-command-composition";
import type { LiteConsumerCommandAdmission } from "./distribution-consumer-command-registry";
import { nodeSetupDeps, runHelixProjectSetup } from "./index";

const MAX_TASK_FILE_BYTES = 64 * 1024;

export interface LiteConsumerNodeAdapterDeps {
  repo_root: string;
  read_task_file(path: string): string;
}

function optionValue(argv: readonly string[], option: string): string | null {
  const index = argv.indexOf(option);
  return index >= 0 ? (argv[index + 1] ?? null) : null;
}

function execution(
  admission: LiteConsumerCommandAdmission,
  payload: unknown,
  exitCode = 0,
): LiteConsumerCommandExecution {
  return {
    command_id: admission.command_id,
    exit_code: exitCode,
    output: `${JSON.stringify(payload, null, admission.argv.includes("--json") ? 2 : 0)}\n`,
  };
}

function resolveTask(
  admission: LiteConsumerCommandAdmission,
  deps: LiteConsumerNodeAdapterDeps,
): string {
  const inline = optionValue(admission.argv, "--task");
  if (inline !== null) return inline;
  const taskFile = optionValue(admission.argv, "--task-file");
  if (!taskFile) throw new Error("lite_consumer_task_missing");
  return deps.read_task_file(taskFile);
}

export function createLiteConsumerNodeHandlers(
  deps: LiteConsumerNodeAdapterDeps,
): LiteConsumerCommandHandlers {
  return {
    setup_project: (admission) => {
      const result = runHelixProjectSetup(
        { dryRun: admission.dry_run, applyBranchProtection: false },
        nodeSetupDeps(deps.repo_root),
      );
      return execution(admission, result, result.consumerReadiness.ok ? 0 : 1);
    },
    status: (admission) => {
      const runtime = detectMode();
      const outstanding = computeOutstandingWork(deps.repo_root);
      return execution(admission, {
        ...runtime,
        nextAction: nextActionForMode(runtime.mode),
        outstanding,
        completionDecisionPacket: completionDecisionPacketForOutstanding(outstanding, {
          sourceCommand: "helix status --json",
        }),
        completionReviewBundle: completionReviewBundleForOutstanding(outstanding),
      });
    },
    consumer_doctor: (admission) => {
      const result = runConsumerDoctor(nodeDoctorDeps(deps.repo_root));
      return execution(admission, result, result.ok ? 0 : 1);
    },
    completion_decision_packet: (admission) => {
      const packet = completionDecisionPacketForOutstanding(
        computeOutstandingWork(deps.repo_root),
        {
          sourceCommand: "helix completion decision-packet --json",
        },
      );
      return execution(admission, packet, packet.ok ? 0 : 1);
    },
    completion_review_bundle: (admission) => {
      const bundle = completionReviewBundleForOutstanding(computeOutstandingWork(deps.repo_root));
      return execution(admission, bundle, bundle.completionClaimAllowed ? 0 : 1);
    },
    minimal_delegated_workflow: (admission) => {
      const plan = buildWrapperAdapterPlan(
        {
          provider: admission.provider ?? "codex",
          role: optionValue(admission.argv, "--role") ?? "se",
          task: resolveTask(admission, deps),
          planId: optionValue(admission.argv, "--plan") ?? undefined,
          execute: false,
        },
        detectMode().mode,
        "helix_cli_adapter",
      );
      return execution(admission, plan, plan.available ? 0 : 1);
    },
  };
}

export function nodeLiteConsumerAdapterDeps(repoRoot: string): LiteConsumerNodeAdapterDeps {
  const physicalRoot = realpathSync(repoRoot);
  return {
    repo_root: physicalRoot,
    read_task_file(path: string): string {
      if (isAbsolute(path)) throw new Error("lite_consumer_task_file_outside_root");
      const candidate = realpathSync(resolve(physicalRoot, path));
      const rel = relative(physicalRoot, candidate);
      if (rel === ".." || rel.startsWith(`..${sep}`)) {
        throw new Error("lite_consumer_task_file_outside_root");
      }
      const content = readFileSync(candidate, "utf8");
      if (Buffer.byteLength(content, "utf8") > MAX_TASK_FILE_BYTES) {
        throw new Error("lite_consumer_task_file_too_large");
      }
      return content;
    },
  };
}
