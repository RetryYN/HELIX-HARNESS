import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type {
  LiteConsumerCommandExecution,
  LiteConsumerCommandHandlers,
} from "./distribution-consumer-command-composition";
import type { LiteConsumerCommandAdmission } from "./distribution-consumer-command-registry";

const MAX_TASK_FILE_BYTES = 64 * 1024;

export interface LiteConsumerNodeAdapterDeps {
  repo_root: string;
  read_task_file(path: string): string;
  services: LiteConsumerNodeServices;
}

export interface LiteConsumerNodeServiceResult {
  payload: unknown;
  exit_code: number;
}

export interface LiteConsumerDelegationInput {
  provider: "codex" | "claude";
  role: string;
  task: string;
  plan_id: string | null;
  execute: false;
}

export interface LiteConsumerNodeServices {
  setup_project(input: { dry_run: boolean }): LiteConsumerNodeServiceResult;
  status(): LiteConsumerNodeServiceResult;
  consumer_doctor(): LiteConsumerNodeServiceResult;
  completion_decision_packet(): LiteConsumerNodeServiceResult;
  completion_review_bundle(): LiteConsumerNodeServiceResult;
  minimal_delegated_workflow(input: LiteConsumerDelegationInput): LiteConsumerNodeServiceResult;
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
  const fromService = (
    admission: LiteConsumerCommandAdmission,
    result: LiteConsumerNodeServiceResult,
  ) => execution(admission, result.payload, result.exit_code);
  return {
    setup_project: (admission) =>
      fromService(admission, deps.services.setup_project({ dry_run: admission.dry_run })),
    status: (admission) => fromService(admission, deps.services.status()),
    consumer_doctor: (admission) => fromService(admission, deps.services.consumer_doctor()),
    completion_decision_packet: (admission) =>
      fromService(admission, deps.services.completion_decision_packet()),
    completion_review_bundle: (admission) =>
      fromService(admission, deps.services.completion_review_bundle()),
    minimal_delegated_workflow: (admission) => {
      if (!admission.provider) throw new Error("lite_consumer_provider_missing");
      return fromService(
        admission,
        deps.services.minimal_delegated_workflow({
          provider: admission.provider,
          role: optionValue(admission.argv, "--role") ?? "se",
          task: resolveTask(admission, deps),
          plan_id: optionValue(admission.argv, "--plan"),
          execute: false,
        }),
      );
    },
  };
}

export function nodeLiteConsumerAdapterDeps(
  repoRoot: string,
  services: LiteConsumerNodeServices,
): LiteConsumerNodeAdapterDeps {
  const physicalRoot = realpathSync(repoRoot);
  return {
    repo_root: physicalRoot,
    services,
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
